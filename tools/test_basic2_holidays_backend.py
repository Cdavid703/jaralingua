"""Offline tests: no production credentials or student records."""
import ast
import json
from pathlib import Path
from contextlib import nullcontext
from types import SimpleNamespace

root = Path(__file__).resolve().parents[1]
text = (root / 'server/progress_api.py').read_text(encoding='utf-8')
tree = ast.parse(text)
endpoint = '/api/basic2/unit5-my-holidays/transcript'
routes = [n for n in ast.walk(tree) if isinstance(n, ast.If) and isinstance(n.test, ast.Compare) and any(isinstance(c, ast.Constant) and c.value == endpoint for c in n.test.comparators)]
assert len(routes) == 1
role_function = next(n for n in tree.body if isinstance(n, ast.FunctionDef) and n.name == 'grade_user_role')
route = routes[0]
function = ast.FunctionDef(name='run', args=ast.arguments(posonlyargs=[],args=[],kwonlyargs=[],kw_defaults=[],defaults=[]),body=[route],decorator_list=[])
responses = []
scope = dict(data_lock=nullcontext(), parsed=SimpleNamespace(path=endpoint), self=None,
             BASIC2_ENGLISH_GRADES_PATH='offline-only', GLOBAL_ADMIN_EMAILS={'global@test.invalid'},
             normalize_email=lambda x: str(x or '').strip().lower(),
             read_grades_data=lambda _: {'adminEmails':['admin@test.invalid'],'teacherEmails':['teacher@test.invalid']},
             json_response=lambda _,status,data: responses.append((status,data)))
exec(compile(ast.fix_missing_locations(ast.Module(body=[role_function,function],type_ignores=[])),'<isolated-route>','exec'),scope)
for email,expected in [('student@test.invalid',403),('teacher@test.invalid',200),('admin@test.invalid',200),('global@test.invalid',200),('',403)]:
    scope['profile']={'email':email}; responses.clear(); scope['run']()
    assert responses[0][0] == expected
    if expected == 403: assert 'transcript' not in responses[0][1]
    else: transcript = responses[0][1]['transcript']
script = (root/'docs/basic2-unit5-holidays-listening-script.md').read_text(encoding='utf-8')
canonical = '\n\n'.join(line for line in script.splitlines() if line.startswith(('Daniel:','Valeria:')))
assert canonical == transcript
assert text.index('profile = self.require_user()',text.index('def do_GET')) < text.index(endpoint)
questions=json.loads((root/'assets/data/basic2-unit5-holidays-questions.json').read_text(encoding='utf-8'))
assert len(questions)==10
assert sorted([sum(q['answer']==i for q in questions) for i in range(4)]) == [2,2,3,3]
assert all(len(q['options'])==len(set(q['options']))==4 for q in questions)
for file in ['ingles/basico-2/audio-listening-unit-5-my-holidays.html','assets/js/basic2-holidays-listening.js']:
    assert 'Daniel: Hi, Valeria!' not in (root/file).read_text(encoding='utf-8')
print('PASS: teacher/admin allowed, students denied, auth gate precedes route, exact script match, 10 balanced questions.')
