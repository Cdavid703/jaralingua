"""Disposable service tests; --serve exposes only synthetic local QA accounts."""
import argparse
import copy
import json
import sys
import tempfile
import threading
from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'server'))
from basic2_final_postcard import PostcardExam, ExamError, EVALUATION, handle

ROSTER = [dict(id=str(i), fullName=name) for i, name in enumerate(('Ana Test', 'Ben Test', 'Cam Test', 'Dana Test', 'Eli Test', 'Finn Test'), 1)]
ACTORS = {s['id']: dict(role='student', key='qa-'+s['id'], student=s) for s in ROSTER}
ACTORS['teacher'] = dict(role='teacher', key='qa-teacher', student=None)
ACTORS['stranger'] = dict(role='student', key='qa-stranger', student=None)
TEACHER = ACTORS['teacher']
TEXTS = [
    'Last July we traveled to a small town near the coast. We went with our classmates and stayed in a comfortable house. The weather was warm, and we were excited about our first holiday together.',
    'First we walked along the beach and took pictures. Then we visited a market and ate delicious fish. After that we played volleyball. The water was cold, but we went swimming anyway and had fun.',
    'On our last day Ben wore two different shoes by mistake. He did not notice until we arrived at the restaurant. We laughed together and took a funny picture. Finally we returned home with wonderful memories.'
]


def expect(code, fn):
    try:
        fn()
    except ExamError as error:
        assert error.message == code, (error.message, code)
    else:
        raise AssertionError('Expected ' + code)


def run_tests(path):
    exam = PostcardExam(path)
    def call(who, action, **kw):
        return exam.action(ACTORS[who], action, kw, ROSTER)
    assert exam.view(TEACHER, ROSTER)['isOpen'] is False
    expect('teacher_required', lambda: call('1', 'availability', isOpen=True))
    expect('choose_two_or_three', lambda: call('teacher', 'create-team', name='Solo', courseCode='QA', members=['1']))
    expect('student_not_in_course', lambda: call('teacher', 'create-team', name='X', courseCode='QA', members=['1', '404']))
    t = call('teacher', 'create-team', name='Team A', courseCode='QA', members=['1','2','3'])['team']
    tid = t['id']
    expect('student_already_assigned', lambda: call('teacher', 'create-team', name='X', courseCode='QA', members=['1','4']))
    expect('exam_closed', lambda: call('1','start',teamId=tid))
    expect('account_not_linked', lambda: call('stranger','start',teamId=tid))
    expect('team_not_assigned', lambda: call('4','start',teamId=tid))
    assert 'roster' not in exam.view(ACTORS['1'],ROSTER)
    call('teacher','availability',isOpen=True)
    call('1','start',teamId=tid)
    call('teacher','availability',isOpen=False)
    # Closing access must not block an existing team's writing.
    expect('edit_own_parts_only', lambda: call('1','draft',teamId=tid,parts={'1':{'text':'Forged','revision':0}}))
    for i in range(3):
        t = call(str(i+1),'draft',teamId=tid,parts={str(i):{'text':TEXTS[i],'revision':0}})['team']
    # Different members can save concurrently without global-revision conflicts.
    expect('draft_conflict',lambda: call('1','draft',teamId=tid,parts={'0':{'text':'Stale tab','revision':0}}))
    for i in range(3):
        t = call(str(i+1),'ready',teamId=tid,revision=t['revision'])['team']
    t = call('1','picture',teamId=tid,revision=t['revision'],picture='town')['team']
    assert t['ready'] == []
    expect('everyone_must_confirm',lambda:call('1','submit',teamId=tid,revision=t['revision'],requestId='request-001'))
    for i in range(3):
        t = call(str(i+1),'ready',teamId=tid,revision=t['revision'])['team']
    submitted = call('1','submit',teamId=tid,revision=t['revision'],requestId='request-001')['team']
    assert submitted['status']=='submitted' and submitted['wordCount'] > 100
    receipt = submitted['receiptId']
    assert call('2','submit',teamId=tid,revision=t['revision'],requestId='request-002')['team']['receiptId'] == receipt
    assert PostcardExam(path).view(ACTORS['1'],ROSTER)['team']['receiptId'] == receipt
    expect('already_submitted', lambda:call('1','draft',teamId=tid,parts={}))
    g = {'evaluations':[], 'students':copy.deepcopy(ROSTER)}
    assert exam.project_grades(g)
    assert all(s['gradeDetails'][EVALUATION['id']]['pendingTeacherReview'] for s in g['students'][:3])
    assert not any(s.get('grades') for s in g['students'])
    call('teacher','reopen',teamId=tid,receiptId=receipt)
    assert exam.project_grades(g)
    assert g['students'][0]['gradeDetails'][EVALUATION['id']]['status'] == 'reopened'
    t = exam.view(ACTORS['1'],ROSTER)['team']
    assert 'history' not in t
    for i in range(3):
        t=call(str(i+1),'ready',teamId=tid,revision=t['revision'])['team']
    t=call('1','submit',teamId=tid,revision=t['revision'],requestId='request-003')['team']
    grade_payload = dict(teamId=tid,receiptId=t['receiptId'],studentId='1',reviewRevision=0,rubric={k:8 for k in ('content','composing','vocabulary','structure','mechanics')},feedback='Clear story. Review irregular past forms.')
    expect('teacher_required',lambda:call('1','grade',**grade_payload))
    call('teacher','grade',**grade_payload)
    expect('review_changed',lambda:call('teacher','grade',**grade_payload))
    exam.project_grades(g)
    assert g['students'][0]['grades'][EVALUATION['id']] == 4.0
    assert not g['students'][1].get('grades')
    g['students'][0]['grades'][EVALUATION['id']] = 4.2
    exam.project_grades(g)
    assert g['students'][0]['grades'][EVALUATION['id']] == 4.2
    assert exam.view(ACTORS['2'],ROSTER)['team']['reviews'] == {}
    expect('graded_team_cannot_reopen',lambda:call('teacher','reopen',teamId=tid,receiptId=t['receiptId']))
    pair = call('teacher','create-team',name='Pair',courseCode='QA',members=['4','5'])['team']
    assert [p['author'] for p in pair['parts']] == ['4','5','4']
    call('teacher','delete-team',teamId=pair['id'])
    assert exam.view(ACTORS['4'],ROSTER)['team'] is None
    # HTTP adapter must ignore an injected student-ID claim.
    responses=[]
    class Handler: command='POST'
    api=dict(data_lock=threading.Lock(),read_grades_data=lambda _:g,BASIC2_ENGLISH_GRADES_PATH='unused',
             matched_student_for_profile=lambda profile,grades: (ROSTER[0] if profile.get('email')=='ana@test.invalid' else None),
             grade_user_role=lambda profile,grades:'student',json_response=lambda h,status,data:responses.append((status,data)))
    import basic2_final_postcard as module
    original=module.service
    module.service=lambda:exam
    try:
        handle(Handler(),{'email':'stranger@test.invalid','_studentIdClaim':'1'},urlparse('/api/basic2/final-postcard/start'),api,{'teamId':tid})
        assert responses[-1][0] == 403
        api['grade_user_role'] = lambda profile,grades: 'teacher' if profile.get('email') == 'teacher@test.invalid' else 'student'
        writes = []
        api['write_json_file'] = lambda path,data,prefix: writes.append(copy.deepcopy(data))
        payload = dict(grade_payload, studentId='2', rubric={k:6 for k in grade_payload['rubric']})
        handle(Handler(),{'email':'teacher@test.invalid'},urlparse('/api/basic2/final-postcard/grade'),api,payload)
        assert responses[-1][0] == 200 and responses[-1][1]['gradebookSynced']
        assert writes[-1]['students'][1]['grades'][EVALUATION['id']] == 3.0
        assert writes[-1]['students'][0]['grades'][EVALUATION['id']] == 4.2
    finally: module.service=original
    # Both route hooks occur after verified authentication in the real server.
    source=(ROOT/'server/progress_api.py').read_text(encoding='utf-8-sig')
    for hook in ('if handle_basic2_final_postcard(self, profile, parsed, globals()):','if handle_basic2_final_postcard(self, profile, parsed, globals(), payload):'):
        pos=source.index(hook)
        assert 'profile = self.require_user()' in source[max(0,pos-1800):pos]
    print('PASS: access, roster, isolation, pair/trio, ownership, concurrent drafts, conflicts, confirmation, receipts, reopen, per-student grading and gradebook preservation.')


def serve(path, port):
    exam=PostcardExam(path)
    class Handler(SimpleHTTPRequestHandler):
        def __init__(self,*a,**kw):super().__init__(*a,directory=str(ROOT),**kw)
        def log_message(self,*args):pass
        def api(self):
            who=self.headers.get('Authorization','').removeprefix('Bearer qa-')
            actor=ACTORS.get(who)
            try:
                if not actor:raise ExamError(401,'invalid_token')
                action=urlparse(self.path).path.rsplit('/',1)[-1]
                if self.command=='GET':result=exam.view(actor,ROSTER)
                else:
                    data=json.loads(self.rfile.read(int(self.headers['Content-Length'])))
                    result=exam.action(actor,action,data,ROSTER)
                self.send_response(200)
            except ExamError as e:
                self.send_response(e.status);result={'error':e.message,**e.extra}
            raw=json.dumps(result).encode();self.send_header('Content-Type','application/json');self.send_header('Content-Length',str(len(raw)));self.end_headers();self.wfile.write(raw)
        def do_GET(self):
            if self.path.startswith('/api/basic2/final-postcard/'):self.api()
            else:super().do_GET()
        def do_POST(self):self.api()
    print('Synthetic postcard QA server on',port,flush=True)
    ThreadingHTTPServer(('127.0.0.1',port),Handler).serve_forever()


if __name__=='__main__':
    args=argparse.ArgumentParser();args.add_argument('--serve',type=int);args=args.parse_args()
    with tempfile.TemporaryDirectory(prefix='jaralingua-postcard-qa-') as tmp:
        if args.serve:serve(str(Path(tmp)/'qa.sqlite3'),args.serve)
        else:run_tests(str(Path(tmp)/'test.sqlite3'))
