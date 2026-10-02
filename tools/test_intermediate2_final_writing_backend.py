"""Isolated final-writing regression: no production credentials, writes or submissions."""
import importlib.util
import json
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location('progress_api', ROOT / 'server/progress_api.py')
API = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(API)

with tempfile.TemporaryDirectory(prefix='ie2-final-writing-') as folder:
    base = Path(folder)
    API.INTERMEDIATE2_ENGLISH_GRADES_PATH = str(base/'grades.json')
    API.INTERMEDIATE2_FINAL_WRITING_PATH = str(base/'final.json')
    API.INTERMEDIATE2_FINAL_WRITING_SUBMISSIONS_PATH = str(base/'submissions.json')
    API.INTERMEDIATE2_MIDTERM_WRITING_SUBMISSIONS_PATH = str(base/'midterm.json')
    original={'teacherEmails':['teacher@example.com'],'evaluations':[{'id':'intermediate2FinalWritingTask20','weight':20},{'id':'midtermWritingTask','weight':20}], 'students':[{'id':'S1','fullName':'Student One','email':'one@example.com','grades':{'midtermWritingTask':3.7}},{'id':'S2','fullName':'Student Two','email':'two@example.com','grades':{}}]}
    (base/'grades.json').write_text(json.dumps(original),encoding='utf-8')
    student={'email':'one@example.com'}; other={'email':'two@example.com'}; teacher={'email':'teacher@example.com'}; outsider={'email':'unknown@example.com'}
    bundle=API.read_intermediate2_final_writing_bundle()
    assert bundle['state']['isOpen'] is False
    assert bundle['exam']['topic']=='First Impression' and bundle['exam']['targetWords']==200
    assert len(bundle['exam']['instructions'])==7 and bundle['exam']['durationMinutes']==50
    assert API.intermediate2_final_writing_start(student,{})[0]==403
    assert API.intermediate2_final_writing_start(outsider,{})[0]==403
    assert API.intermediate2_final_writing_submissions(student)[0]==403
    assert API.intermediate2_final_writing_grade(student,{})[0]==403
    assert API.intermediate2_final_writing_student_action(student,{})[0]==403
    state=API.intermediate2_final_writing_state_payload(student,original,bundle,API.read_intermediate2_final_writing_store())
    assert state['exam'] is None and state['canStart'] is False
    bundle['state']['isOpen']=True; API.write_intermediate2_final_writing_bundle(bundle)
    code,opened=API.intermediate2_final_writing_start(student,{})
    assert code==200 and opened['attempt']['attemptId'].startswith('I2FW-')
    assert 'sourceRubric' not in opened['exam']
    attempt=opened['attempt']['attemptId']
    code,resumed=API.intermediate2_final_writing_start(student,{})
    assert resumed['attempt']['attemptId']==attempt and resumed['resumed']
    payload={'attemptId':attempt,'clientSubmissionId':'stable-key','from':'Student One','to':'Friend','subject':'First Impression','body':'Hi Sam, I am nervous about meeting my partner’s family. First, I will choose comfortable clothes. I hope we have a good time!'}
    assert API.intermediate2_final_writing_save_draft(other,payload)[0]==404
    assert API.intermediate2_final_writing_save_draft(student,{**payload,'attemptId':'wrong'})[0]==409
    code,saved=API.intermediate2_final_writing_save_draft(student,payload)
    assert code==200 and saved['attempt']['draft']['body']==payload['body']
    bundle['state']['isOpen']=False; API.write_intermediate2_final_writing_bundle(bundle)
    assert API.intermediate2_final_writing_start(student,{})[0]==200 # closing stops new starts, not recovery
    assert API.intermediate2_final_writing_start(other,{})[0]==403
    code,submitted=API.intermediate2_final_writing_submit(student,payload)
    assert code==200 and submitted['submission']['grade'] is None
    receipt=submitted['submission']['receiptId']; assert receipt.startswith('I2FW-')
    code,repeated=API.intermediate2_final_writing_submit(student,payload)
    assert code==200 and repeated['idempotent'] and repeated['submission']['receiptId']==receipt
    assert API.intermediate2_final_writing_submit(student,{**payload,'clientSubmissionId':'different'})[0]==409
    assert API.intermediate2_final_writing_save_draft(student,payload)[0]==404
    rubric={'content':9,'composing':8,'vocabulary':9,'structure':8,'mechanics':10}
    assert API.intermediate2_final_writing_grade(teacher,{'studentId':'S1','rubric':{**rubric,'content':11}})[0]==400
    code,graded=API.intermediate2_final_writing_grade(teacher,{'studentId':'S1','rubric':rubric,'teacherComments':'[[I am agree]] → {{I agree}}'})
    assert code==200 and graded['submission']['grade']==4.4
    grades=json.loads((base/'grades.json').read_text())
    assert grades['students'][0]['grades']=={'midtermWritingTask':3.7,'intermediate2FinalWritingTask20':4.4}
    assert len([e for e in grades['evaluations'] if e['id']=='intermediate2FinalWritingTask20'])==1
    assert next(e for e in grades['evaluations'] if e['id']=='intermediate2FinalWritingTask20')['weight']==20
    assert not (base/'midterm.json').exists()
    code,monitor=API.intermediate2_final_writing_submissions(teacher)
    assert code==200 and len(monitor['sourceRubric'])==5 and monitor['health']['counts']['graded']==1
    state=API.intermediate2_final_writing_state_payload(other,grades,bundle,API.read_intermediate2_final_writing_store())
    assert state['submission'] is None
print('PASS final writing: closed by default, role/identity isolation, recovery, draft, receipt, idempotency, /50 grading, separate 20%, midterm unchanged')
