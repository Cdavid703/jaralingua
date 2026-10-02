"""Exercise the actual route AST without starting or modifying the production API."""
import ast
from contextlib import nullcontext
from pathlib import Path
from types import SimpleNamespace
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'server'))
from basic2_unit6_listening import TRANSCRIPT

source = (ROOT / 'server/progress_api.py').read_text(encoding='utf-8-sig')
tree = ast.parse(source)
handler = next(n for n in ast.walk(tree) if isinstance(n, ast.FunctionDef) and n.name == 'do_GET')
route = next(n for n in handler.body if isinstance(n, ast.If) and isinstance(n.test, ast.Compare) and any(isinstance(x, ast.Constant) and x.value == '/api/basic2/unit6-maple-cafe/transcript' for x in n.test.comparators))
auth_index = next(i for i,n in enumerate(handler.body) if isinstance(n, ast.Assign) and isinstance(n.value, ast.Call) and isinstance(n.value.func, ast.Attribute) and n.value.func.attr == 'require_user')
assert auth_index < handler.body.index(route), 'Route must follow server authentication'
guard = handler.body[auth_index + 1]
assert isinstance(guard, ast.If) and isinstance(guard.test, ast.UnaryOp) and isinstance(guard.test.operand, ast.Name) and guard.test.operand.id == 'profile'
assert isinstance(guard.body[0], ast.Return), 'Unauthenticated requests must stop'
fn = ast.parse('def run():\n    pass\n').body[0]
fn.body = [route]
module = ast.fix_missing_locations(ast.Module(body=[fn], type_ignores=[]))
for role, expected in [('student',403),('visitor',403),('teacher',200),('admin',200)]:
    results=[]
    env={'parsed':SimpleNamespace(path='/api/basic2/unit6-maple-cafe/transcript'),'data_lock':nullcontext(),'BASIC2_ENGLISH_GRADES_PATH':'unused','profile':{},'self':None,'read_grades_data':lambda _: {},'grade_user_role':lambda *_:role,'json_response':lambda _,status,data:results.append((status,data))}
    exec(compile(module,'route-test','exec'),env)
    env['run']()
    assert len(results)==1 and results[0][0]==expected
    assert ('transcript' in results[0][1]) == (expected==200)
    print('PASS transcript role:',role,expected)
script=(ROOT/'docs/basic2-unit6-listening-script.md').read_text(encoding='utf-8').split('File: `unit-6-lunch-at-maple-cafe.mp3`',1)[1].strip()
assert script==TRANSCRIPT, 'Private transcript and generated audio source must match'
assert 'Server: Welcome!' not in (ROOT/'assets/js/basic2-unit6-listening.js').read_text(encoding='utf-8')
print('PASS authentication ordering, transcript consistency, no transcript embedded in public JS')
