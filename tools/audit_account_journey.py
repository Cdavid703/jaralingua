"""Real API in an isolated temporary store; never opens production/student files.
Run --serve to retain the HTTP fixture for browser checks. No credentials in reports.
"""
import ast, copy, json, os, pathlib, secrets, sys, tempfile, threading, urllib.request, urllib.error
ROOT = pathlib.Path(os.environ.get("JARALINGUA_QA_ROOT", os.getcwd())).resolve()
TEMP = pathlib.Path(tempfile.mkdtemp(prefix='jaralingua-journey-')).resolve()
sys.dont_write_bytecode = True
# Redirect every production default, including lazily imported activity modules.
for source in (ROOT/'server').glob('*.py'):
    for node in ast.walk(ast.parse(source.read_text())):
        if isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute) and node.func.attr in ('get','getenv') and len(node.args)>1:
            key, default = node.args[:2]
            if isinstance(key,ast.Constant) and isinstance(default,ast.Constant) and isinstance(default.value,str) and default.value.startswith('/var/lib/jaralingua/'):
                os.environ[key.value] = str(TEMP / pathlib.Path(default.value).name)
os.environ['JARALINGUA_LOCAL_AUTH_SECRET'] = secrets.token_hex(32)
os.environ['JARALINGUA_ADMIN_EMAILS'] = 'admin@qa.invalid'
# Fail closed on accidental production data access or external network access.
def guard(event,args):
    if event=='open' and isinstance(args[0],(str,bytes,os.PathLike)):
        p=pathlib.Path(os.fsdecode(args[0])).resolve()
        if str(p).startswith('/var/lib/jaralingua') or p.is_relative_to(ROOT/'data') or p.is_relative_to(ROOT/'server/private_assets'):
            raise PermissionError('QA isolation blocked protected data')
        mode=args[1];flags=args[2]
        writing=(isinstance(mode,str) and any(c in mode for c in 'wax+')) or (isinstance(flags,int) and bool(flags & (os.O_WRONLY|os.O_RDWR|os.O_CREAT)))
        if writing and not p.is_relative_to(TEMP): raise PermissionError('QA write outside temporary store')
    if event=='socket.connect' and args[1][0] not in ('127.0.0.1','::1'):
        raise PermissionError('QA external connection blocked')
sys.addaudithook(guard)
sys.path.insert(0,str(ROOT/'server'))
import progress_api as api
from http.server import ThreadingHTTPServer
LEVELS={'basic':'BASIC_ENGLISH_GRADES_PATH','basic2':'BASIC2_ENGLISH_GRADES_PATH','intermediate':'INTERMEDIATE_ENGLISH_GRADES_PATH','intermediate2':'INTERMEDIATE2_ENGLISH_GRADES_PATH',**{f'french{i}':f'FRENCH{i}_GRADES_PATH' for i in (1,2,7,8)}}
password='Fixture-'+secrets.token_hex(10)
roster=[{'id':str(i),'fullName':name,'email':email,'localPassword':password,'nameAliases':[name],'grades':{},'gradeDetails':{}} for i,name,email in [(101,'QA Alex','alex@qa.invalid'),(102,'QA Blake','blake@qa.invalid')]]
for level,key in LEVELS.items():
    pathlib.Path(getattr(api,key)).write_text(json.dumps({'adminEmails':['admin@qa.invalid'],'teacherEmails':['teacher@qa.invalid'],'allowStudentIdClaim':False,'evaluations':[{'id':'qaReview','title':'QA review','weight':20,'type':'Assessment'}],'students':copy.deepcopy(roster)}))
class QuietHandler(api.ProgressHandler):
    def log_message(self,*args):pass
server=ThreadingHTTPServer(('127.0.0.1',0),QuietHandler)
threading.Thread(target=server.serve_forever,daemon=True).start()
base='http://127.0.0.1:'+str(server.server_port)
def token(email,name=None):
    return api.sign_local_profile({'provider':'local-gradebook','email':email,'name':name or email,'sub':'qa:'+email})[0]
tokens={role:token(email,name) for role,email,name in [('teacher','teacher@qa.invalid','QA Teacher'),('admin','admin@qa.invalid','QA Admin'),('outsider','outsider@qa.invalid','QA Outsider'),('sameName','qa-duplicate-name@gmail.com','QA Alex')]}
def request(method,path,payload=None,auth=None):
    headers={'Content-Type':'application/json','X-Jaralingua-Auth-Provider':'local'}
    if auth:headers['Authorization']='Bearer '+auth
    req=urllib.request.Request(base+path,data=None if payload is None else json.dumps(payload).encode(),headers=headers,method=method)
    try:
        with urllib.request.urlopen(req) as r:return r.status,json.load(r)
    except urllib.error.HTTPError as e:return e.code,json.load(e)
checks=[]
def check(name,condition,detail=None):
    checks.append({'name':name,'passed':bool(condition),**({'detail':detail} if detail else {})})
for level,key in LEVELS.items():
    login='/api/'+level+'/grades/login'
    if level!='french7':
        code,data=request('POST',login,{'email':'alex@qa.invalid','password':password});check(level+' credential login',code==200);a=data['token']
        code,data=request('POST',login,{'email':'blake@qa.invalid','password':password});b=data['token']
        check(level+' wrong password rejected',request('POST',login,{'email':'alex@qa.invalid','password':'wrong'})[0]==401)
    else:a=token('alex@qa.invalid','QA Alex');b=token('blake@qa.invalid','QA Blake')
    if level=='basic2':tokens.update(alex=a,blake=b)
    endpoint='/api/'+level+'/grades'
    code,data=request('GET',endpoint+'?studentId=102',auth=a)
    check(level+' own grades only',code==200 and data['student']['id']=='101' and not data['students'])
    check(level+' anonymous blocked',request('GET',endpoint)[0]==401)
    check(level+' cannot write grades',request('PUT',endpoint,{'evaluations':[],'students':[]},a)[0]==403)
    code,data=request('GET',endpoint+'?studentId=101',auth=tokens['outsider']);check(level+' outsider cannot claim student ID',code==200 and data.get('student') is None)
    code,data=request('GET',endpoint,auth=tokens['sameName']);check(level+' duplicate name cannot read student',code==200 and data.get('student') is None,'Synthetic signed identity with a Gmail-shaped email matching a configured name alias; no external account or email is used')
    code,data=request('GET',endpoint,auth=tokens['teacher']);check(level+' teacher roster readable',code==200 and len(data['students'])==2)
    evaluation='quiz' if level=='french8' else 'qaReview'
    payload=copy.deepcopy(data);payload['students'][0]['grades'][evaluation]=4.2
    code,result=request('PUT',endpoint,payload,tokens['admin']);check(level+' admin grade saved',code==200,str(result)[:150] if code!=200 else None)
    code,data=request('GET',endpoint,auth=a);check(level+' student reads published grade',data.get('student',{}).get('grades',{}).get(evaluation)==4.2)
    code,data=request('GET',endpoint,auth=b);check(level+' partner grade unchanged',data.get('student',{}).get('grades',{}).get(evaluation) is None)
# Actual persistence with independently authenticated sessions.
a=tokens['alex'];b=tokens['blake'];page='/ingles/basico-2/adventure-unit-1.html'
progress={'pages':{page:{'status':'in-progress'}},'lastPage':{'path':page}}
check('progress write',request('PUT','/api/progress',{'progress':progress},a)[0]==200)
check('progress survives another session',request('GET','/api/progress',auth=a)[1]['progress']==progress)
check('progress private',request('GET','/api/progress',auth=b)[1]['progress']['pages']=={})
check('draft write',request('PUT','/api/activity',{'path':page,'draft':{'fields':{'answer':'QA saved answer'},'updatedAt':'2026-10-25T00:00:00Z'}},a)[0]==200)
check('draft resumes',request('GET','/api/activity?path='+page,auth=a)[1]['draft']['fields']['answer']=='QA saved answer')
check('draft private',request('GET','/api/activity?path='+page,auth=b)[1]['draft']['fields']=={})
import basic2_adventure as adventure
spec=adventure.catalog()['grammar-1'];data={'answers':{q['id']:q['answers'][0] for q in spec['questions']},'text':'practice '*25,'done':True,'attempts':1}
payload={'stage':'grammar-1','revision':0,'operation':'qa-first-operation-0001','data':data}
code,saved=request('POST',adventure.PREFIX+'save',payload,a);check('adventure real save',code==200)
check('adventure retry idempotent',request('POST',adventure.PREFIX+'save',payload,a)==(code,saved))
check('adventure stale device conflict',request('POST',adventure.PREFIX+'save',{**payload,'operation':'qa-conflict-operation-02'},a)[0]==409)
check('adventure score computed by server',saved.get('record',{}).get('data',{}).get('score')==len(spec['questions']))
check('adventure private',request('GET',adventure.PREFIX+'state',auth=b)[1]['records']=={})
# Teacher reviews/publishes an oral delivery and each learner sees only their own grade.
import basic2_oral_exam as oral
prefix=oral.PREFIX
_,state=request('GET',prefix+'state',auth=a);_,partner=request('GET',prefix+'state',auth=b)
check('student rubric hidden','rubric' not in state)
code,created=request('POST',prefix+'invite',{'requestId':'qa-create-team-0001','partner':partner['myKey'],'destination':'paris'},a)
check('oral pair created',code==200,str(created)[:160] if code!=200 else None)
_,state=request('GET',prefix+'state',auth=a)
if state.get('team'):
    tid=state['team']['id'];member=state['myKey']
    review={'requestId':'qa-review-0001','teamId':tid,'member':member,'revision':0,'rubric':{k:8 for k in oral.RUBRIC},'feedback':'QA: Clear ideas. Practise past endings.'}
    check('student cannot grade',request('POST',prefix+'review',review,a)[0]==403)
    check('teacher review saved',request('POST',prefix+'review',review,tokens['teacher'])[0]==200)
    check('draft review hidden','reviews' not in request('GET',prefix+'state',auth=a)[1]['team'])
    code,result=request('POST',prefix+'publish',{'requestId':'qa-publish-0001','teamId':tid,'member':member,'revision':1},tokens['teacher'])
    check('teacher publish projects grade',code==200 and result.get('gradebookSynced') is True)
    _,grades=request('GET','/api/basic2/grades',auth=a)
    check('oral grade visible to owner',grades['student']['grades'].get(oral.EVALUATION_ID)==4)
    check('oral feedback visible', 'QA: Clear ideas' in json.dumps(grades['student']['gradeDetails']))
    check('oral partner not graded implicitly',request('GET','/api/basic2/grades',auth=b)[1]['student']['grades'].get(oral.EVALUATION_ID) is None)
# A legitimately logged-in fixture from another course must not claim a Basic roster ID.
foreign_path=pathlib.Path(api.FRENCH1_GRADES_PATH)
foreign_data=json.loads(foreign_path.read_text())
foreign_data['students'].append({'id':'303','fullName':'QA Foreign Course','email':'foreign@qa.invalid','localPassword':password,'grades':{},'gradeDetails':{}})
foreign_path.write_text(json.dumps(foreign_data))
login_code,foreign_login=request('POST','/api/french1/grades/login',{'email':'foreign@qa.invalid','password':password})
check('cross-course fixture credential login',login_code==200)
for level in ('basic','basic2','intermediate'):
    code,result=request('GET','/api/'+level+'/grades?studentId=101',auth=foreign_login['token'])
    check(level+' valid other-course login cannot claim ID',code in (401,403) or result.get('student') is None)
(TEMP/'report.json').write_text(json.dumps({'checks':checks,'passed':sum(x['passed'] for x in checks),'failed':sum(not x['passed'] for x in checks)},indent=2))
(TEMP/'browser.json').write_text(json.dumps({'base':base,'password':password,'tokens':tokens,'temp':str(TEMP)}))
print(json.dumps({'fixture':str(TEMP),'base':base,'passed':sum(x['passed'] for x in checks),'failures':[x for x in checks if not x['passed']]}),flush=True)
if '--serve' in sys.argv:threading.Event().wait()
else:
    server.shutdown()
    sys.exit(1 if any(not x['passed'] for x in checks) else 0)
