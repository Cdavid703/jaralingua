#!/usr/bin/env python3
"""Direct regression check for Intermediate 2 official writing; it starts no server."""
import importlib.util
import json
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("progress_api", ROOT / "server" / "progress_api.py")
API = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(API)

legacy_gradebook = {
    "evaluations": [
        {"id": API.INTERMEDIATE2_MIDTERM_WRITING_ID, "weight": 20},
        {"id": API.INTERMEDIATE2_MIDTERM_WRITING_LEGACY_ID, "weight": 20},
    ],
    "students": [{
        "grades": {API.INTERMEDIATE2_MIDTERM_WRITING_LEGACY_ID: 4.2},
        "gradeDetails": {API.INTERMEDIATE2_MIDTERM_WRITING_LEGACY_ID: {"evaluationId": API.INTERMEDIATE2_MIDTERM_WRITING_LEGACY_ID, "status": "graded"}},
    }],
}
assert API.migrate_intermediate2_midterm_writing_gradebook(legacy_gradebook) is True
assert [item["id"] for item in legacy_gradebook["evaluations"]] == [API.INTERMEDIATE2_MIDTERM_WRITING_ID]
assert legacy_gradebook["students"][0]["grades"] == {API.INTERMEDIATE2_MIDTERM_WRITING_ID: 4.2}
assert legacy_gradebook["students"][0]["gradeDetails"][API.INTERMEDIATE2_MIDTERM_WRITING_ID]["evaluationId"] == API.INTERMEDIATE2_MIDTERM_WRITING_ID
assert API.INTERMEDIATE2_MIDTERM_WRITING_LEGACY_ID not in legacy_gradebook["students"][0]["gradeDetails"]

with tempfile.TemporaryDirectory(prefix="ie2-midterm-writing-") as folder:
    base = Path(folder)
    grades = base / "grades.json"
    API.INTERMEDIATE2_ENGLISH_GRADES_PATH = str(grades)
    API.INTERMEDIATE2_MIDTERM_WRITING_PATH = str(base / "exam.json")
    API.INTERMEDIATE2_MIDTERM_WRITING_SUBMISSIONS_PATH = str(base / "submissions.json")
    grades.write_text(json.dumps({"teacherEmails": ["teacher@example.com"], "allowStudentIdClaim": True, "evaluations": [], "students": [{"id": "S001", "fullName": "Test Student", "email": "student@example.com", "grades": {}, "gradeDetails": {}}]}), encoding="utf-8")
    student = {"email": "student@example.com", "name": "Test Student"}
    teacher = {"email": "teacher@example.com", "name": "Test Teacher"}
    status, closed = API.intermediate2_midterm_writing_start(student, {"courseCode": "INTERMEDIATE-C2"})
    assert status == 403 and closed["error"] == "exam_closed"
    bundle = API.read_intermediate2_midterm_writing_bundle()
    assert bundle["state"]["isOpen"] is False
    bundle["state"]["isOpen"] = True
    API.write_intermediate2_midterm_writing_bundle(bundle)
    status, opened = API.intermediate2_midterm_writing_start(student, {"courseCode": "INTERMEDIATE-C2"})
    assert status == 200 and opened["attempt"]["status"] == "in_progress"
    attempt_id = opened["attempt"]["attemptId"]
    payload = {"attemptId": attempt_id, "clientSubmissionId": "client-stable-001", "courseCode": "INTERMEDIATE-C2", "from": "Student", "to": "Friend abroad", "subject": "A new plan", "body": "I wish I had asked for help earlier. I hope to organize my time better and I would like to begin again with more confidence."}
    status, saved = API.intermediate2_midterm_writing_save_draft(student, payload)
    assert status == 200 and saved["attempt"]["revision"] == 1
    status, submitted = API.intermediate2_midterm_writing_submit(student, payload)
    assert status == 200 and submitted["submission"]["status"] == "pending_teacher_review"
    status, repeated = API.intermediate2_midterm_writing_submit(student, payload)
    assert status == 200 and repeated["idempotent"] is True
    rubric = {"content": 9, "composing": 8, "vocabulary": 9, "structure": 8, "mechanics": 10}
    status, graded = API.intermediate2_midterm_writing_grade(teacher, {"studentId": "S001", "rubric": rubric, "teacherComments": "Clear reflective email."})
    assert status == 200 and graded["submission"]["grade"] == 4.4
    current = json.loads(grades.read_text(encoding="utf-8"))
    assert current["students"][0]["grades"][API.INTERMEDIATE2_MIDTERM_WRITING_ID] == 4.4

print("PASS Intermediate 2 official midterm writing backend without a local server")
