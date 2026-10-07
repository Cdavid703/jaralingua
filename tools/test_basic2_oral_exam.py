"""Synthetic-only persistence, authorization, concurrency and HTTP QA for Basic 2 oral."""
import argparse
import base64
import copy
import io
import json
from pathlib import Path
import secrets
import sys
import tempfile
import threading
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from urllib.parse import urlparse

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'server'))
import basic2_oral_exam as module
from basic2_oral_exam import OralExam,ExamError,EVALUATION_ID,RUBRIC

ROSTER=[{'id':str(i),'fullName':name,'email':str(i)+'@qa.invalid'} for i,name in enumerate(
    ['Alex Example','Sam Example','Dana Example','Eli Example','César Example','Santiago Example','Gabriela Example'],1)]
ACTORS={s['id']:{'role':'student','key':'qa-'+s['id'],'student':{'id':s['id']}} for s in ROSTER}
ACTORS['teacher']={'role':'teacher','key':'qa-teacher','student':None}
ACTORS['stranger']={'role':'student','key':'qa-stranger','student':None}


def expect(code,fn):
    try:fn()
    except ExamError as e:assert e.message==code,(e.message,code)
    else:raise AssertionError('Expected '+code)


def image_bytes():
    from PIL import Image
    data=io.BytesIO();Image.new('RGB',(640,360),'navy').save(data,format='PNG');return data.getvalue()


def run_tests(path):
    exam=OralExam(path);teacher=ACTORS['teacher']
    def call(who,action,**p):return exam.action(ACTORS[who],action,{'requestId':secrets.token_hex(16),**p},ROSTER)
    view=exam.view(ACTORS['1'],ROSTER)
    assert view['isOpen'] and 'rubric' not in view
    assert {r['name'] for r in view['roster']}=={'Sam Example','Dana Example','Eli Example'}
    assert all(set(r)=={'key','name','available'} for r in view['roster'])
    expect('account_not_linked',lambda:exam.view(ACTORS['stranger'],ROSTER))
    for who in ['5','6','7']:expect('not_registered_for_exam',lambda who=who:exam.view(ACTORS[who],ROSTER))
    keys={s['id']:exam.view(ACTORS[s['id']],ROSTER)['myKey'] for s in ROSTER[:4]}
    expect('teacher_required',lambda:call('1','availability',isOpen=False))
    expect('invalid_partner',lambda:call('1','invite',partner=keys['1']))
    request={'partner':keys['2'],'requestId':'stable-pair-001'}
    created=exam.action(ACTORS['1'],'invite',request,ROSTER);tid=created['teamId']
    assert exam.action(ACTORS['1'],'invite',request,ROSTER)['idempotent']
    assert exam.view(ACTORS['2'],ROSTER)['team']['status']=='confirmed'
    expect('student_already_paired',lambda:call('3','invite',partner=keys['2']))
    tid2=call('3','invite',partner=keys['4'])['teamId']
    for who,teamid,assistant in [('1',tid,keys['1']),('3',tid2,keys['3'])]:
        call(who,'plan',teamId=teamid,revision=0,destination='cartagena',decision='I choose Cartagena.',assistant=assistant)
    expect('plan_changed',lambda:call('2','plan',teamId=tid,revision=0,destination='paris',decision='A stale change',assistant=keys['2']))
    expect('wrong_pair',lambda:call('3','plan',teamId=tid,revision=1,destination='paris',decision='Not ours',assistant=keys['1']))
    assert OralExam(path).view(ACTORS['2'],ROSTER)['team']['decision']=='I choose Cartagena.'
    call('teacher','availability',isOpen=False)
    call('2','plan',teamId=tid,revision=1,destination='paris',decision='I choose Paris.',assistant=keys['2'])
    # Test file ownership with a real image decoder/renderer on macOS or isolated Linux.
    raw=image_bytes();up={'teamId':tid,'name':'class-photo.png','data':base64.b64encode(raw).decode(),'requestId':'stable-upload-001'}
    result=exam.action(ACTORS['1'],'upload',up,ROSTER);assert result['receipt']==created['receipt']
    assert exam.action(ACTORS['1'],'upload',up,ROSTER)['idempotent']
    files=exam.view(ACTORS['2'],ROSTER)['team']['files'];assert len(files)==1
    fid=files[0]['id'];assert exam.file(ACTORS['2'],ROSTER,fid,1).startswith(b'\xff\xd8')
    expect('wrong_pair',lambda:exam.file(ACTORS['3'],ROSTER,fid,1))
    expect('page_not_found',lambda:exam.file(ACTORS['2'],ROSTER,fid,2))
    expect('unsupported_file',lambda:call('1','upload',teamId=tid,name='bad.html',data=base64.b64encode(b'<html>').decode()))
    expect('invalid_image',lambda:call('1','upload',teamId=tid,name='bad.png',data=base64.b64encode(b'not an image').decode()))
    expect('teacher_required',lambda:call('1','review',teamId=tid,member=keys['1'],revision=0,rubric={},feedback=''))
    call('teacher','review',teamId=tid,member=keys['1'],revision=0,rubric={'task':8},feedback='Clear descriptions.')
    expect('complete_rubric',lambda:call('teacher','publish',teamId=tid,member=keys['1'],revision=1))
    call('teacher','review',teamId=tid,member=keys['1'],revision=1,rubric={k:8 for k in RUBRIC},feedback='Clear descriptions.')
    expect('review_changed',lambda:call('teacher','review',teamId=tid,member=keys['1'],revision=1,rubric={},feedback='Stale'))
    assert 'reviews' not in exam.view(ACTORS['1'],ROSTER)['team']
    assert 'reviews' not in exam.presentation(teacher,ROSTER,tid)
    grades={'evaluations':[],'students':copy.deepcopy(ROSTER)}
    exam.project_grades(grades);assert not grades['students'][0].get('grades')
    call('teacher','publish',teamId=tid,member=keys['1'],revision=2)
    exam.project_grades(grades);assert grades['students'][0]['grades'][EVALUATION_ID]==4
    assert not grades['students'][1].get('grades')
    assert 'rubric' not in json.dumps(grades['students'][0]['gradeDetails'])
    grades['students'][0]['grades'][EVALUATION_ID]=4.2
    exam.project_grades(grades);assert grades['students'][0]['grades'][EVALUATION_ID]==4.2
    expect('exam_graded',lambda:call('2','plan',teamId=tid,revision=2,destination='paris',decision='Changed after grading',assistant=keys['2']))
    call('teacher','timer',teamId=tid,command='start');call('teacher','timer',teamId=tid,command='stop')
    expect('teacher_must_change_pair',lambda:call('1','cancel',teamId=tid))
    call('3','cancel',teamId=tid2)
    expect('pair_cancelled',lambda:exam.presentation(ACTORS['3'],ROSTER,tid2))
    call('teacher','availability',isOpen=True)
    # Concurrent registrations cannot claim the same member twice.
    results=[]
    def attempt(who,partner):
        try:results.append(call(who,'invite',partner=partner))
        except ExamError as e:results.append(e.message)
    a=threading.Thread(target=attempt,args=('3',keys['4']));b=threading.Thread(target=attempt,args=('4',keys['3']));a.start();b.start();a.join();b.join()
    assert sum(isinstance(x,dict) for x in results)==1
    assert results.count('student_already_paired')==1
    responses=[]
    class Handler:command='GET'
    api={'data_lock':threading.Lock(),'read_grades_data':lambda _:copy.deepcopy(grades),'BASIC2_ENGLISH_GRADES_PATH':'unused',
         'normalize_email':lambda e:str(e or '').lower(),'email_matches_student':lambda s,e:s.get('email')==e,
         'grade_user_role':lambda p,g:'teacher' if p.get('email')=='teacher@qa.invalid' else 'student',
         'json_response':lambda h,status,data:responses.append((status,data))}
    original=module.service;module.service=lambda:exam
    try:
        module.handle(Handler(),{'email':'stranger@qa.invalid','name':'Alex Example','_studentIdClaim':'1'},urlparse(module.PREFIX+'state'),api)
        assert responses[-1][0]==403
        module.handle(Handler(),{'email':'1@qa.invalid','sub':'qa-1','role':'teacher'},urlparse(module.PREFIX+'state'),api)
        assert responses[-1][0]==200 and 'rubric' not in responses[-1][1]
    finally:module.service=original
    source=(ROOT/'server/progress_api.py').read_text(encoding='utf-8-sig') if (ROOT/'server/progress_api.py').exists() else ''
    if source:
        for suffix in ('',', payload'):
            marker=f'if handle_basic2_oral(self, profile, parsed, globals(){suffix}):'
            offset=source.index(marker)
            assert 'profile = self.require_user()' in source[offset-2000:offset]
    print('PASS: immediate pairs, exclusions, persistence, races, shared plans, private files, retry receipts, teacher-only rubric, independent grades and unchanged existing grades.')


def serve(path,port):
    exam=OralExam(path);module.service=lambda:exam
    grades={'students':copy.deepcopy(ROSTER),'evaluations':[]}
    lock=threading.Lock()
    def write(_,value,*args):grades.clear();grades.update(copy.deepcopy(value))
    def respond(h,status,data):
        raw=json.dumps(data).encode();h.send_response(status);h.send_header('Content-Type','application/json');h.send_header('Cache-Control','no-store');h.send_header('Content-Length',str(len(raw)));h.end_headers();h.wfile.write(raw)
    api={'data_lock':lock,'read_grades_data':lambda _:copy.deepcopy(grades),'BASIC2_ENGLISH_GRADES_PATH':'synthetic',
         'normalize_email':lambda e:str(e or '').lower(),'email_matches_student':lambda s,e:s.get('email')==e,
         'grade_user_role':lambda p,g:'teacher' if p.get('email')=='teacher@qa.invalid' else 'student',
         'json_response':respond,'write_json_file':write}
    class Handler(SimpleHTTPRequestHandler):
        def __init__(self,*a,**kw):super().__init__(*a,directory=str(ROOT),**kw)
        def log_message(self,*args):pass
        def handle_api(self):
            token=self.headers.get('Authorization','').removeprefix('Bearer qa-')
            if token not in ACTORS:respond(self,401,{'error':'invalid_token'});return
            profile={'email':token+'@qa.invalid','sub':'qa-'+token}
            try:payload=json.loads(self.rfile.read(int(self.headers.get('Content-Length','0')))) if self.command=='POST' else None
            except Exception:respond(self,400,{'error':'invalid_json'});return
            module.handle(self,profile,urlparse(self.path),api,payload)
        def do_GET(self):
            if self.path.startswith(module.PREFIX):self.handle_api()
            else:super().do_GET()
        def do_POST(self):self.handle_api()
    print('Synthetic oral QA server',port,flush=True)
    ThreadingHTTPServer(('127.0.0.1',port),Handler).serve_forever()


if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--serve',type=int);args=parser.parse_args()
    with tempfile.TemporaryDirectory(prefix='basic2-oral-qa-') as directory:
        if args.serve:serve(str(Path(directory)/'oral.sqlite3'),args.serve)
        else:run_tests(str(Path(directory)/'oral.sqlite3'))
