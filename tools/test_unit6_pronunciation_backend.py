"""Exercise actual route/validator AST with an in-memory synthetic gradebook."""
import ast, copy, json, math, threading, os
from pathlib import Path
from types import SimpleNamespace

root=Path(__file__).resolve().parents[1]
tree=ast.parse(Path(os.environ.get('UNIT6_API_SOURCE',root/'server/progress_api.py')).read_text(encoding='utf-8'))
functions={'clean_text','clean_text_list','clean_score_metric','basic2_unit1_pronunciation_report_from_payload','basic2_unit6_pronunciation_report'}
constants={'BASIC2_UNIT6_PRONUNCIATION_ID','BASIC2_UNIT6_PRONUNCIATION_TEXTS','BASIC2_UNIT6_PRONUNCIATION_EVALUATION'}
nodes=[n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name in functions or isinstance(n,ast.Assign) and any(isinstance(t,ast.Name) and t.id in constants for t in n.targets)]
scope={'math':math}
exec(compile(ast.Module(body=nodes,type_ignores=[]),'<isolated-report-functions>','exec'),scope)
manifest=json.loads((root/'ingles/basico-2/audio/unit6/pronunciation/manifest.json').read_text())
payload={'clientSubmissionId':'unit6-test-001','stageScores':[{'stage':s['label'],'referenceText':s['text'],'transcript':s['text'],'overall':82,'accuracy':80,'completeness':87,'wpm':100} for s in manifest['stages']]}
validate=scope['basic2_unit6_pronunciation_report']
assert validate(payload)['score100']==82
assert validate(payload)['grade'] is None
for change in ['missing-stage','wrong-reference','empty-transcript','missing-id','nan']:
    p=copy.deepcopy(payload)
    if change=='missing-stage':p['stageScores'].pop()
    if change=='wrong-reference':p['stageScores'][0]['referenceText']='Different unit'
    if change=='empty-transcript':p['stageScores'][1]['transcript']=''
    if change=='missing-id':p.pop('clientSubmissionId')
    if change=='nan':p['stageScores'][0]['overall']=float('nan')
    try:validate(p)
    except ValueError:pass
    else:raise AssertionError('Accepted '+change)

route=next(n for n in ast.walk(tree) if isinstance(n,ast.If) and isinstance(n.test,ast.Compare) and any(isinstance(c,ast.Constant) and c.value=='/api/basic2/unit6-food-pronunciation/submit' for c in n.test.comparators))
wrapper=ast.parse('def run_route(self, parsed, profile, payload):\n    pass').body[0]
wrapper.body=[route];ast.fix_missing_locations(wrapper)
book={'students':[{'id':'synthetic-only','grades':{'existing':4.2},'gradeDetails':{}}],'evaluations':[]}
writes=[];responses=[]
scope.update(data_lock=threading.Lock(),BASIC2_ENGLISH_GRADES_PATH='IN_MEMORY_ONLY',
 read_grades_data=lambda _:copy.deepcopy(book),ensure_basic2_gradebook_structure=lambda data:False,
 matched_student_for_profile=lambda profile,data:data['students'][0] if profile.get('authorized') else None,
 json_response=lambda self,status,result:responses.append((status,result)),now_iso=lambda:'2026-09-29T18:00:00Z')
def write(path,data,prefix):
    assert path=='IN_MEMORY_ONLY';book.clear();book.update(copy.deepcopy(data));writes.append(1)
scope['write_json_file']=write
exec(compile(ast.Module(body=[wrapper],type_ignores=[]),'<isolated-real-route>','exec'),scope)
run=scope['run_route'];parsed=SimpleNamespace(path='/api/basic2/unit6-food-pronunciation/submit')
run(None,parsed,{'authorized':True},payload)
assert responses[-1][0]==200 and responses[-1][1]['clientSubmissionId']==payload['clientSubmissionId']
evaluation=scope['BASIC2_UNIT6_PRONUNCIATION_ID']
student=book['students'][0]
assert student['grades'][evaluation] is None and student['grades']['existing']==4.2
assert student['gradeDetails'][evaluation]['weight']==0
assert student['gradeDetails'][evaluation]['followUpOnly'] is True
assert student['gradeDetails'][evaluation]['attemptCount']==1
run(None,parsed,{'authorized':True},payload)
assert len(writes)==1 and responses[-1][1]['clientSubmissionId']==payload['clientSubmissionId']
run(None,parsed,{'authorized':False},payload)
assert responses[-1][0]==403 and len(writes)==1
run(None,parsed,{'authorized':True},{'stageScores':[]})
assert responses[-1][0]==400 and len(writes)==1
assert 'profile = self.require_user()' in ast.unparse(tree)[:ast.unparse(tree).index("if parsed.path == '/api/basic2/unit6-food-pronunciation/submit'")]
print('PASS: 7 references, validation failures, authenticated route, ungraded record, duplicate receipt, roster rejection, no real data accessed.')
