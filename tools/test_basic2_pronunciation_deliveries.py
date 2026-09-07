"""Exercise the real delivery branches using an in-memory gradebook."""
import ast
import threading
from pathlib import Path
from types import SimpleNamespace

root = Path(__file__).resolve().parents[1]
tree = ast.parse((root / "server/progress_api.py").read_text(encoding="utf-8"))
helpers = {"clean_text", "clean_text_list", "clean_score_metric", "basic2_unit1_pronunciation_report_from_payload"}
scope = {}
exec(compile(ast.Module(body=[n for n in tree.body if isinstance(n, ast.FunctionDef) and n.name in helpers], type_ignores=[]), "<helpers>", "exec"), scope)
routes = {3: ("/api/basic2/unit3-pronunciation-around-world/submit", 7),
          4: ("/api/basic2/unit4-regular-ed-pronunciation/submit", 4),
          5: ("/api/basic2/unit5-looking-back-pronunciation/submit", 7)}
for unit, (route, count) in routes.items():
    branch = next(n for n in ast.walk(tree) if isinstance(n, ast.If) and isinstance(n.test, ast.Compare) and any(isinstance(c, ast.Constant) and c.value == route for c in ast.walk(n.test)))
    module = ast.parse("def deliver(self, parsed, payload, profile):\n    pass")
    module.body[0].body = [branch]
    ast.fix_missing_locations(module)
    student = {"id": "test", "grades": {}, "gradeDetails": {}}
    db = {"students": [student]}
    responses = []
    writes = []
    eid = f"unit{unit}"
    scope.update(data_lock=threading.Lock(), BASIC2_ENGLISH_GRADES_PATH="memory",
                 read_grades_data=lambda _: db, ensure_basic2_gradebook_structure=lambda _: False,
                 matched_student_for_profile=lambda *_: student, now_iso=lambda: "2026-09-07T00:00:00Z",
                 write_json_file=lambda *args: writes.append(args),
                 json_response=lambda _, status, data: responses.append((status, data)))
    scope[f"BASIC2_UNIT{unit}_PRONUNCIATION_ID"] = eid
    scope[f"BASIC2_UNIT{unit}_PRONUNCIATION_EVALUATION"] = {"title": eid}
    exec(compile(module, "<delivery>", "exec"), scope)
    payload = {"clientSubmissionId": f"test-unit-{unit}", "stageScores": [{"overall": 80, "transcript": "We were ready.", "referenceText": "We were ready."} for _ in range(count)]}
    call = lambda p: scope["deliver"](None, SimpleNamespace(path=route), p, {})
    call(payload)
    assert responses[-1][0] == 200, responses[-1]
    assert student["grades"][eid] is None
    assert student["gradeDetails"][eid]["weight"] == 0
    assert student["gradeDetails"][eid]["status"] == "submitted"
    assert responses[-1][1]["grade"] is None
    call(payload)
    assert responses[-1][0] == 200 and len(writes) == 1, "Retry must not duplicate the delivery"
    call({"stageScores": payload["stageScores"][:-1]})
    assert responses[-1][0] == 400
    print(f"PASS Unit {unit}: {count} stages accepted; ungraded report saved; retry idempotent; incomplete report rejected.")
