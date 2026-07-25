#!/usr/bin/env python3
"""End-to-end backend regression test for the Intermediate Integrated Task."""

import importlib.util
import json
import tempfile
import threading
import urllib.error
import urllib.request
from http.server import ThreadingHTTPServer
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("jaralingua_progress_api", ROOT / "server" / "progress_api.py")
API = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(API)


def write_json(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2), encoding="utf-8")


def request(base_url, path, method="GET", payload=None, token="", student_id_claim=""):
    headers = {}
    body = None
    if payload is not None:
        body = json.dumps(payload).encode("utf-8")
        headers["Content-Type"] = "application/json"
    if token:
        headers["Authorization"] = "Bearer " + token
        headers["X-Jaralingua-Auth-Provider"] = "local"
    if student_id_claim:
        headers["X-Jaralingua-Student-Id-Claim"] = student_id_claim
    req = urllib.request.Request(base_url + path, data=body, method=method, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=8) as response:
            content = response.read()
            return response.status, json.loads(content.decode("utf-8")) if "application/json" in response.headers.get("Content-Type", "") else content
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
    with tempfile.TemporaryDirectory(prefix="jaralingua-intermediate-integrated-") as folder:
        temp = Path(folder)
        grades_path = temp / "grades.json"
        exam_path = temp / "exam.json"
        submissions_path = temp / "submissions.json"
        audio_path = temp / "audio.mp3"
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
                    "nameAliases": ["Student One"],
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
                },
                {
                    "id": "C002",
                    "fullName": "Claim Test Student",
                    "level": "Intermediate English Course 1",
                    "email": "",
                    "emailAliases": [],
                    "grades": {},
                },
            ],
        }
        bundle = json.loads((ROOT / "data" / "intermediate-integrated-task.local.json").read_text(encoding="utf-8-sig"))
        bundle["state"]["isOpen"] = False
        write_json(grades_path, grades)
        write_json(exam_path, bundle)
        audio_path.write_bytes((ROOT / "server" / "private_assets" / "intermediate-integrated-task-real-us.mp3").read_bytes())

        API.INTERMEDIATE_ENGLISH_GRADES_PATH = str(grades_path)
        API.INTERMEDIATE_INTEGRATED_TASK_PATH = str(exam_path)
        API.INTERMEDIATE_INTEGRATED_TASK_SUBMISSIONS_PATH = str(submissions_path)
        API.INTERMEDIATE_INTEGRATED_TASK_AUDIO_PATH = str(audio_path)
        API.LOCAL_AUTH_SECRET_PATH = str(secret_path)

        server = ThreadingHTTPServer(("127.0.0.1", 0), API.ProgressHandler)
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        base_url = "http://127.0.0.1:" + str(server.server_port)
        try:
            student_token = login(base_url, "student@example.com", "S001*")
            teacher_token = login(base_url, "teacher@example.com", "T001*")
            claim_token, _claim_exp = API.sign_local_profile({
                "provider": "local-gradebook",
                "sub": "claim-test",
                "email": "claim@example.com",
                "name": "Claim Test",
            })

            status, claim_state = request(
                base_url,
                "/api/intermediate/integrated-task/state",
                token=claim_token,
                student_id_claim="C002",
            )
            assert status == 200 and claim_state["student"] and claim_state["student"]["id"] == "C002", claim_state
            attacker_token, _attacker_exp = API.sign_local_profile({
                "provider": "local-gradebook",
                "sub": "attacker-test",
                "email": "attacker@example.com",
                "name": "Attacker Test",
            })
            status, protected_claim = request(
                base_url,
                "/api/intermediate/integrated-task/state",
                token=attacker_token,
                student_id_claim="S001",
            )
            assert status == 200 and protected_claim["student"] is None

            status, opened = request(base_url, "/api/intermediate/integrated-task/state", "PUT", {"isOpen": True}, teacher_token)
            assert status == 200 and opened["state"]["isOpen"] is True

            status, state = request(base_url, "/api/intermediate/integrated-task/state", token=student_token)
            assert status == 200 and state["student"]["id"] == "S001" and state["canTake"] is True
            status, audio = request(base_url, "/api/intermediate/integrated-task/audio", token=student_token)
            assert status == 200 and len(audio) == audio_path.stat().st_size

            questions = bundle["exam"]["questions"]
            complete_answers = {item["id"]: item["answer"] for item in questions}
            writing = "food"
            invalid_payload = {"answers": {questions[0]["id"]: questions[0]["answer"]}, "writing": writing, "audioPlays": 4, "clientSubmissionId": "client-attempt-1"}
            status, invalid = request(base_url, "/api/intermediate/integrated-task/submit", "POST", invalid_payload, student_token)
            assert status == 400 and invalid["error"] == "invalid_answers" and invalid["answered"] == 1

            valid_payload = {
                "answers": complete_answers,
                "writing": writing,
                "courseCode": "INTERMEDIATE-C1",
                "audioPlays": 5,
                "clientDate": "2026-07-17",
                "clientSubmissionId": "client-attempt-1",
            }
            status, submitted = request(base_url, "/api/intermediate/integrated-task/submit", "POST", valid_payload, student_token)
            assert status == 200 and submitted["result"]["status"] == "pending-writing"
            assert submitted["result"]["listeningPoints"] == 25 and submitted["result"]["audioPlays"] == 5
            assert submitted["result"]["attemptNumber"] == 1

            status, repeated_request = request(base_url, "/api/intermediate/integrated-task/submit", "POST", valid_payload, student_token)
            assert status == 200 and repeated_request["idempotent"] is True
            assert repeated_request["result"]["receiptId"] == submitted["result"]["receiptId"]

            status, student_grades = request(base_url, "/api/intermediate/grades", token=student_token)
            detail = student_grades["student"]["gradeDetails"][API.INTERMEDIATE_INTEGRATED_TASK_ID]
            assert status == 200 and detail["pendingTeacherReview"] is True and detail["weight"] == 20

            status, reviews = request(base_url, "/api/intermediate/integrated-task/submissions", token=teacher_token)
            assert status == 200 and len(reviews["submissions"]) == 1
            assert reviews["health"]["counts"]["pendingWriting"] == 1

            rubric = {"content": 5, "composing": 4, "vocabulary": 5, "structure": 4, "mechanics": 5}
            status, graded = request(
                base_url,
                "/api/intermediate/integrated-task/submissions/grade",
                "PUT",
                {"studentId": "S001", "receiptId": submitted["result"]["receiptId"], "rubric": rubric, "teacherComments": "Clear evidence."},
                teacher_token,
            )
            assert status == 200 and graded["result"]["grade"] == 4.8 and graded["result"]["status"] == "graded"

            status, final_grades = request(base_url, "/api/intermediate/grades", token=student_token)
            assert status == 200 and final_grades["student"]["grades"][API.INTERMEDIATE_INTEGRATED_TASK_ID] == 4.8
            assert final_grades["student"]["gradeDetails"][API.INTERMEDIATE_INTEGRATED_TASK_ID]["pendingTeacherReview"] is False

            status, retake = request(base_url, "/api/intermediate/integrated-task?retake=1", token=student_token)
            assert status == 200 and retake["status"] == "open" and len(retake["exam"]["questions"]) == 10
            second_payload = dict(valid_payload)
            second_payload["clientSubmissionId"] = "client-attempt-2"
            second_payload["audioPlays"] = 2
            second_payload["writing"] = " ".join(["food"] * 180)
            status, second = request(base_url, "/api/intermediate/integrated-task/submit", "POST", second_payload, student_token)
            assert status == 200 and second["result"]["attemptNumber"] == 2
            assert second["result"]["receiptId"] != submitted["result"]["receiptId"]

            status, pending_again = request(base_url, "/api/intermediate/grades", token=student_token)
            assert status == 200 and API.INTERMEDIATE_INTEGRATED_TASK_ID not in pending_again["student"]["grades"]
            assert pending_again["student"]["gradeDetails"][API.INTERMEDIATE_INTEGRATED_TASK_ID]["pendingTeacherReview"] is True
            stored_submissions = json.loads(submissions_path.read_text(encoding="utf-8"))
            assert len(stored_submissions["attempts"]["S001"]) == 1

            status, stale_grade = request(
                base_url,
                "/api/intermediate/integrated-task/submissions/grade",
                "PUT",
                {"studentId": "S001", "receiptId": submitted["result"]["receiptId"], "rubric": rubric},
                teacher_token,
            )
            assert status == 409 and stale_grade["error"] == "submission_changed"

            status, graded = request(
                base_url,
                "/api/intermediate/integrated-task/submissions/grade",
                "PUT",
                {"studentId": "S001", "receiptId": second["result"]["receiptId"], "rubric": rubric, "teacherComments": "Clear evidence."},
                teacher_token,
            )
            assert status == 200 and graded["result"]["grade"] == 4.8

            persisted = json.loads(grades_path.read_text(encoding="utf-8"))
            persisted_student = next(item for item in persisted["students"] if item["id"] == "S001")
            persisted_student["grades"].pop(API.INTERMEDIATE_INTEGRATED_TASK_ID, None)
            persisted_student["gradeDetails"].pop(API.INTERMEDIATE_INTEGRATED_TASK_ID, None)
            write_json(grades_path, persisted)
            status, repaired = request(base_url, "/api/intermediate/grades", token=student_token)
            assert status == 200 and repaired["student"]["grades"][API.INTERMEDIATE_INTEGRATED_TASK_ID] == 4.8
            assert repaired["student"]["gradeDetails"][API.INTERMEDIATE_INTEGRATED_TASK_ID]["grade"] == 4.8

            current = json.loads(grades_path.read_text(encoding="utf-8"))
            sanitized = API.clean_gradebook_payload({"evaluations": current["evaluations"], "students": current["students"]}, current)
            sanitized_student = next(item for item in sanitized["students"] if item["id"] == "S001")
            assert sanitized_student["localUsername"] == "student-one"
            assert sanitized_student["nameAliases"] == ["Student One"]
            assert sanitized_student["gradeDetails"]["localPassword"] == "S001*"
        finally:
            server.shutdown()
            server.server_close()
            thread.join(timeout=5)

    print("PASS intermediate Integrated Task backend: auth, activation, audio, validation, idempotent unlimited attempts, recovery, grading, and gradebook sync")


if __name__ == "__main__":
    main()
