"""Exercise the real route with in-memory records only."""
import ast
import json
import threading
from pathlib import Path
from types import SimpleNamespace
root = Path(__file__).resolve().parents[1]
tree = ast.parse((root / 'server/progress_api.py').read_text(encoding='utf-8'))
helpers = {'clean_text', 'clean_text_list', 'clean_score_metric', 'basic2_unit1_pronunciation_report_from_payload', 'basic2_past_verbs_pronunciation_report'}
constants = {'BASIC2_PAST_VERBS_PRONUNCIATION_ID', 'BASIC2_PAST_VERBS_PRONUNCIATION_EVALUATION', 'BASIC2_PAST_VERBS_STAGES'}
nodes = [n for n in tree.body if (isinstance(n, ast.FunctionDef) and n.name in helpers) or (isinstance(n, ast.Assign) and any(isinstance(t, ast.Name) and t.id in constants for t in n.targets))]
scope = {}
exec(compile(ast.Module(body=nodes, type_ignores=[]), '<helpers>', 'exec'), scope)
route = '/api/basic2/unit4-past-verbs-step-by-step/submit'
branch = next(n for n in ast.walk(tree) if isinstance(n, ast.If) and isinstance(n.test, ast.Compare) and any(isinstance(c, ast.Constant) and c.value == route for c in ast.walk(n.test)))
module = ast.parse('def deliver(self, parsed, payload, profile):\n    pass')
module.body[0].body = [branch]
ast.fix_missing_locations(module)
student = {'grades': {'old': None}, 'gradeDetails': {'old': {'score100': 75}}}
db = {'students': [student]}
responses, writes = [], []
scope.update(data_lock=threading.Lock(), BASIC2_ENGLISH_GRADES_PATH='memory', read_grades_data=lambda _: db,
             matched_student_for_profile=lambda profile, _: student if profile.get('allowed') else None,
             ensure_basic2_gradebook_structure=lambda _: False, now_iso=lambda: '2026-09-12T12:00:00Z',
             write_json_file=lambda *args: writes.append(args), json_response=lambda _, code, body: responses.append((code, body)))
exec(compile(module, '<route>', 'exec'), scope)
data = json.loads((root / 'assets/data/basic2-unit4-past-verbs-pronunciation.json').read_text(encoding='utf-8'))
assert [(s['id'], s['text']) for s in data['stages']] == list(scope['BASIC2_PAST_VERBS_STAGES'])
payload = {'clientSubmissionId': 'qa-only', 'stageScores': [{'stage': s['id'], 'referenceText': s['text'], 'transcript': s['text'], 'overall': 0 if i == 0 else 90} for i, s in enumerate(data['stages'])]}
def call(p, allowed=True):
    scope['deliver'](None, SimpleNamespace(path=route), p, {'allowed': allowed})
    return responses[-1]
assert call(payload, False)[0] == 403 and not writes
assert call({**payload, 'stageScores': payload['stageScores'][:-1]})[0] == 400 and not writes
invalid = json.loads(json.dumps(payload)); invalid['stageScores'][0]['referenceText'] = 'wrong'
assert call(invalid)[0] == 400
assert call(payload)[0] == 200 and len(writes) == 1
eid = scope['BASIC2_PAST_VERBS_PRONUNCIATION_ID']
detail = student['gradeDetails'][eid]
assert student['grades'][eid] is None and detail['weight'] == 0 and detail['grade'] is None
assert detail['status'] == 'submitted' and detail['score100'] == 88
assert detail['groupScores'] == {'t': 83, 'd': 90, 'id': 90}
assert all(not s['final'] and s['fluency'] is None for s in detail['stageScores'])
assert student['gradeDetails']['old']['score100'] == 75
assert call(payload)[0] == 200 and len(writes) == 1
print('PASS: 39 canonical stages, zero accepted, independent ungraded delivery, prior reports preserved, idempotency, unauthorized/incomplete/altered reports rejected.')
