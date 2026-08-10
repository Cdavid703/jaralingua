#!/usr/bin/env python3
"""End-to-end backend regression test for Intermediate Final Writing."""

import importlib.util
import json
import tempfile
import threading
import urllib.error
import urllib.request
from http.server import ThreadingHTTPServer
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location(
    "jaralingua_progress_api",
    ROOT / "server" / "progress_api.py",
)
API = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(API)


def write_json(path, value):
    path.write_text(
        json.dumps(value, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


def request(base_url, path, method="GET", payload=None, token="", claim=""):
    headers = {}
    body = None
    if payload is not None:
        body = json.dumps(payload).encode("utf-8")
        headers["Content-Type"] = "application/json"
    if token:
        headers["Authorization"] = "Bearer " + token
        headers["X-Jaralingua-Auth-Provider"] = "local"
    if claim:
        headers["X-Jaralingua-Student-Id-Claim"] = claim
    req = urllib.request.Request(
        base_url + path,
        data=body,
        method=method,
        headers=headers,
    )
    try:
        with urllib.request.urlopen(req, timeout=8) as response:
            return response.status, json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as error:
        content = error.read()
        return error.code, json.loads(content.decode("utf-8")) if content else {}


def login(base_url, email, password):
    status, payload = request(
        base_url,
        "/api/intermediate/grades/login",
        "POST",
        {"email": email, "password": password},
    )
    assert status == 200, payload
    return payload["token"]


def main():
    with tempfile.TemporaryDirectory(
        prefix="jaralingua-intermediate-final-writing-"
    ) as folder:
        temp = Path(folder)
        grades_path = temp / "grades.json"
        exam_path = temp / "final-writing.json"
        submissions_path = temp / "final-writing-submissions.json"
        secret_path = temp / "local-auth-secret"

        grades = {
            "adminEmails": [],
            "teacherEmails": ["teacher@example.com"],
            "allowStudentIdClaim": True,
            "evaluations": [],
            "students": [
                {
                    "id": "S001",
                    "fullName": "Test Student",
                    "level": "Intermediate English Course 1",
                    "email": "student@example.com",
                    "emailAliases": [],
                    "localUsername": "student-one",
                    "grades": {},
                    "gradeDetails": {"localPassword": "S001*"},
                },
                {
                    "id": "T001",
                    "fullName": "Test Teacher",
                    "level": "Intermediate English Course 1",
                    "email": "teacher@example.com",
                    "emailAliases": [],
                    "grades": {},
                    "gradeDetails": {"localPassword": "T001*"},
                },
                {
                    "id": "C002",
                    "fullName": "Claim Student",
                    "level": "Intermediate English Course 1",
                    "email": "",
                    "emailAliases": [],
                    "grades": {},
                    "gradeDetails": {},
                },
            ],
        }
        write_json(grades_path, grades)

        API.INTERMEDIATE_ENGLISH_GRADES_PATH = str(grades_path)
        API.INTERMEDIATE_FINAL_WRITING_PATH = str(exam_path)
        API.INTERMEDIATE_FINAL_WRITING_SUBMISSIONS_PATH = str(submissions_path)
        API.LOCAL_AUTH_SECRET_PATH = str(secret_path)

        server = ThreadingHTTPServer(("127.0.0.1", 0), API.ProgressHandler)
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        base_url = "http://127.0.0.1:" + str(server.server_port)
        try:
            student_token = login(
                base_url,
                "student@example.com",
                "S001*",
            )
            teacher_token = login(
                base_url,
                "teacher@example.com",
                "T001*",
            )

            status, closed = request(
                base_url,
                "/api/intermediate/final-writing/state",
                token=student_token,
            )
            assert status == 200
            assert closed["student"]["id"] == "S001"
            assert closed["canStart"] is False

            claim_token, _claim_exp = API.sign_local_profile({
                "provider": "local-gradebook",
                "sub": "claim-student",
                "email": "claim@example.com",
                "name": "Claim Student",
            })
            status, claimed = request(
                base_url,
                "/api/intermediate/final-writing/state",
                token=claim_token,
                claim="C002",
            )
            assert status == 200
            assert claimed["student"]["id"] == "C002"

            status, opened = request(
                base_url,
                "/api/intermediate/final-writing/state",
                "PUT",
                {"isOpen": True},
                teacher_token,
            )
            assert status == 200
            assert opened["state"]["isOpen"] is True

            status, started = request(
                base_url,
                "/api/intermediate/final-writing/start",
                "POST",
                {"courseCode": "INTERMEDIATE-C1"},
                student_token,
            )
            assert status == 200
            assert started["attempt"]["status"] == "in_progress"
            assert started["exam"]["targetWords"] == 170
            attempt_id = started["attempt"]["attemptId"]

            writing = (
                "Traditional Colombian dishes connect ingredients, geography, "
                "family memories, and community celebrations. This test text "
                "describes two regional recipes with quantities, nutrition, and "
                "clear preparation steps."
            )
            status, saved = request(
                base_url,
                "/api/intermediate/final-writing/draft",
                "PUT",
                {
                    "attemptId": attempt_id,
                    "courseCode": "INTERMEDIATE-C1",
                    "body": writing,
                },
                student_token,
            )
            assert status == 200
            assert saved["attempt"]["revision"] == 1
            assert saved["attempt"]["draft"]["body"] == writing

            status, closed_again = request(
                base_url,
                "/api/intermediate/final-writing/state",
                "PUT",
                {"isOpen": False},
                teacher_token,
            )
            assert status == 200
            assert closed_again["state"]["isOpen"] is False

            status, resumable = request(
                base_url,
                "/api/intermediate/final-writing/state",
                token=student_token,
            )
            assert status == 200
            assert resumable["canResume"] is True
            assert resumable["attempt"]["draft"]["body"] == writing

            status, submitted = request(
                base_url,
                "/api/intermediate/final-writing/submit",
                "POST",
                {
                    "attemptId": attempt_id,
                    "courseCode": "INTERMEDIATE-C1",
                    "body": writing,
                },
                student_token,
            )
            assert status == 200
            submission = submitted["submission"]
            assert submission["status"] == "pending_teacher_review"
            assert submission["receiptId"].startswith("IFW-")
            assert "rubric" not in submission

            status, repeated = request(
                base_url,
                "/api/intermediate/final-writing/submit",
                "POST",
                {
                    "attemptId": attempt_id,
                    "body": writing,
                },
                student_token,
            )
            assert status == 409
            assert repeated["submission"]["receiptId"] == submission["receiptId"]

            status, gradebook_pending = request(
                base_url,
                "/api/intermediate/grades",
                token=student_token,
            )
            assert status == 200
            detail = gradebook_pending["student"]["gradeDetails"][
                API.INTERMEDIATE_FINAL_WRITING_TEST_ID
            ]
            assert detail["pendingTeacherReview"] is True
            assert detail["weight"] == 20
            assert API.INTERMEDIATE_FINAL_WRITING_TEST_ID not in (
                gradebook_pending["student"]["grades"]
            )

            status, reviews = request(
                base_url,
                "/api/intermediate/final-writing/submissions",
                token=teacher_token,
            )
            assert status == 200
            assert reviews["health"]["counts"]["pendingReview"] == 1
            assert reviews["submissions"][0]["body"] == writing
            assert len(reviews["rubricCriteria"]) == 5
            assert reviews["rubricCriteria"][0]["descriptor"]

            rubric = {
                "content": 9,
                "composing": 8,
                "vocabulary": 9,
                "structure": 8,
                "mechanics": 10,
            }
            status, graded = request(
                base_url,
                "/api/intermediate/final-writing/submissions/grade",
                "PUT",
                {
                    "studentId": "S001",
                    "rubric": rubric,
                    "teacherComments": "Clear regional and recipe information.",
                },
                teacher_token,
            )
            assert status == 200
            assert graded["submission"]["score50"] == 44
            assert graded["submission"]["grade"] == 4.4

            status, student_result = request(
                base_url,
                "/api/intermediate/final-writing/state",
                token=student_token,
            )
            assert status == 200
            assert student_result["submission"]["grade"] == 4.4
            assert "rubric" not in student_result["submission"]
            assert "score50" not in student_result["submission"]
            assert student_result["submission"]["teacherComments"]

            status, final_gradebook = request(
                base_url,
                "/api/intermediate/grades",
                token=student_token,
            )
            assert status == 200
            assert final_gradebook["student"]["grades"][
                API.INTERMEDIATE_FINAL_WRITING_TEST_ID
            ] == 4.4
            assert final_gradebook["student"]["gradeDetails"][
                API.INTERMEDIATE_FINAL_WRITING_TEST_ID
            ]["pendingTeacherReview"] is False

            current = json.loads(grades_path.read_text(encoding="utf-8"))
            manually_edited = json.loads(json.dumps(current))
            edited_student = next(item for item in manually_edited["students"] if item["id"] == "S001")
            edited_student["grades"][API.INTERMEDIATE_FINAL_WRITING_TEST_ID] = 4.6
            API.sync_intermediate_manual_grade_edits(
                current,
                manually_edited,
                {"email": "admin@example.com"},
            )
            write_json(grades_path, manually_edited)
            synced_store = API.read_intermediate_final_writing_store()
            assert synced_store["submissions"]["S001"]["grade"] == 4.6
            assert synced_store["submissions"]["S001"]["score50"] == 46

            status, manually_updated = request(
                base_url,
                "/api/intermediate/final-writing/state",
                token=student_token,
            )
            assert status == 200
            assert manually_updated["submission"]["grade"] == 4.6

            status, reopened_claim = request(
                base_url,
                "/api/intermediate/final-writing/student-action",
                "PUT",
                {
                    "studentId": "C002",
                    "action": "reopen",
                    "hours": 48,
                },
                teacher_token,
            )
            assert status == 200, reopened_claim

            status, claim_started = request(
                base_url,
                "/api/intermediate/final-writing/start",
                "POST",
                {"courseCode": "INTERMEDIATE-C1"},
                claim_token,
                claim="C002",
            )
            assert status == 200, claim_started

            status, empty_submission = request(
                base_url,
                "/api/intermediate/final-writing/submit",
                "POST",
                {
                    "attemptId": claim_started["attempt"]["attemptId"],
                    "courseCode": "INTERMEDIATE-C1",
                    "body": "",
                },
                claim_token,
                claim="C002",
            )
            assert status == 200, empty_submission
            assert empty_submission["submission"]["wordCount"] == 0
            assert (
                empty_submission["submission"]["status"]
                == "pending_teacher_review"
            )
        finally:
            server.shutdown()
            server.server_close()
            thread.join(timeout=5)

    print(
        "PASS intermediate Final Writing: auth, claim, activation, "
        "autosave, submit-after-close, empty delivery, receipt, hidden "
        "rubric, grading, and 20% gradebook sync"
    )


if __name__ == "__main__":
    main()
