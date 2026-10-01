"""Exercise the real transcript route with synthetic roles; no academic files."""
import ast, os, sys, threading
from pathlib import Path
from types import SimpleNamespace
root=Path(__file__).resolve().parents[1]
source=Path(os.environ.get('UNIT6_API_SOURCE',root/'server/progress_api.py'))
tree=ast.parse(source.read_text(encoding='utf-8'))
handler=next(n for n in tree.body if isinstance(n,ast.ClassDef) and n.name=='ProgressHandler')
get=next(n for n in handler.body if isinstance(n,ast.FunctionDef) and n.name=='do_GET')
route=next(n for n in get.body if isinstance(n,ast.If) and '/api/basic2/unit6-maple-cafe/transcript' in ast.unparse(n.test))
before=get.body[:get.body.index(route)]
assert any(isinstance(n,ast.Assign) and isinstance(n.value,ast.Call) and isinstance(n.value.func,ast.Attribute) and n.value.func.attr=='require_user' for n in before)
assert any(isinstance(n,ast.If) and ast.unparse(n.test)=='not profile' and any(isinstance(r,ast.Return) for r in n.body) for n in before)
assert 'write_json' not in ast.unparse(route)
sys.path.insert(0,str(root/'server'))
from basic2_unit6_listening import TITLE, TRANSCRIPT
wrapper=ast.parse('def run(self, parsed, profile):\n    pass').body[0];wrapper.body=[route];ast.fix_missing_locations(wrapper)
responses=[];scope={'data_lock':threading.Lock(),'BASIC2_ENGLISH_GRADES_PATH':'IN_MEMORY_ONLY','read_grades_data':lambda p:{},'grade_user_role':lambda profile,data:profile['role'],'json_response':lambda self,status,payload:responses.append((status,payload))}
exec(compile(ast.Module(body=[wrapper],type_ignores=[]),'<actual-transcript-route>','exec'),scope)
for role in ['student','guest','teacher','admin']:
 scope['run'](None,SimpleNamespace(path='/api/basic2/unit6-maple-cafe/transcript'),{'role':role})
 status,payload=responses[-1]
 if role in ['teacher','admin']:assert status==200 and payload=={'title':TITLE,'transcript':TRANSCRIPT}
 else:assert status==403 and 'transcript' not in payload
html=(root/'ingles/basico-2/audio-listening-unit-6-maple-cafe.html').read_text(encoding='utf-8')
js=(root/'assets/js/basic2-unit6-listening.js').read_text(encoding='utf-8')
assert TRANSCRIPT not in html+js
assert 'Welcome to Maple Café. Are you ready to order?' not in html+js
print('PASS: auth gate, staff-only transcript, student/guest denied, no writes, no full transcript in public assets.')
