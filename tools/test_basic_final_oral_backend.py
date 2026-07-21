#!/usr/bin/env python3
"""End-to-end security and persistence regression for the Basic 1 Final Oral Task."""

import base64
import importlib.util
import json
import tempfile
import threading
import urllib.error
import urllib.parse
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
            if "application/json" in response.headers.get("Content-Type", ""):
                return response.status, json.loads(content.decode("utf-8"))
            return response.status, content
    except urllib.error.HTTPError as error:
        content = error.read()
        return error.code, json.loads(content.decode("utf-8")) if content else {}


def login(base_url, email, password):
    status, payload = request(
        base_url,
        "/api/basic/grades/login",
        "POST",
        {"email": email, "password": password},
    )
    assert status == 200, payload
    return payload["token"]


def ogg_data_url(seed):
    body = b"OggS" + bytes([seed % 251]) * 92
    return "data:audio/ogg;base64," + base64.b64encode(body).decode("ascii"), body


def main():
    with tempfile.TemporaryDirectory(prefix="jaralingua-basic-final-oral-") as folder:
        temp = Path(folder)
        grades_path = temp / "grades.json"
        state_path = temp / "basic-final-oral.json"
        submissions_path = temp / "basic-final-oral-submissions.json"
        audio_dir = temp / "basic-final-oral-audio"
        prompt_audio_dir = temp / "basic-final-oral-prompts"
        secret_path = temp / "local-auth-secret"

        grades = {
            "adminEmails": [],
            "teacherEmails": ["teacher@example.com"],
            "allowStudentIdClaim": True,
            "evaluations": [],
            "students": [
                {
                    "id": "S001",
                    "fullName": "Oral Test Student",
                    "level": "Basic English Course 1",
                    "email": "student@example.com",
                    "emailAliases": [],
                    "grades": {},
                    "gradeDetails": {"localPassword": "S001*"},
                },
                {
                    "id": "S002",
                    "fullName": "Other Student",
                    "level": "Basic English Course 1",
                    "email": "other@example.com",
                    "emailAliases": [],
                    "grades": {},
                    "gradeDetails": {"localPassword": "S002*"},
                },
                {
                    "id": "C003",
                    "fullName": "Document Claim Student",
                    "level": "Basic English Course 1",
                    "email": "",
                    "emailAliases": [],
                    "grades": {},
                },
                {
                    "id": "T001",
                    "fullName": "Test Teacher",
                    "level": "Basic English Course 1",
                    "email": "teacher@example.com",
                    "emailAliases": [],
                    "grades": {},
                    "gradeDetails": {"localPassword": "T001*"},
                },
            ],
        }
        write_json(grades_path, grades)

        API.BASIC_ENGLISH_GRADES_PATH = str(grades_path)
        API.BASIC_FINAL_ORAL_PATH = str(state_path)
        API.BASIC_FINAL_ORAL_SUBMISSIONS_PATH = str(submissions_path)
        API.BASIC_FINAL_ORAL_AUDIO_DIR = str(audio_dir)
        API.BASIC_FINAL_ORAL_PROMPT_AUDIO_DIR = str(prompt_audio_dir)
        API.LOCAL_AUTH_SECRET_PATH = str(secret_path)
        prompt_audio_dir.mkdir(parents=True, exist_ok=True)
        for prompt_id in API.basic_final_oral_known_prompt_ids():
            (prompt_audio_dir / (prompt_id + ".mp3")).write_bytes(b"ID3-protected-prompt-" + prompt_id.encode("ascii"))

        server = ThreadingHTTPServer(("127.0.0.1", 0), API.ProgressHandler)
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        base_url = "http://127.0.0.1:" + str(server.server_port)
        try:
            student_token = login(base_url, "student@example.com", "S001*")
            other_token = login(base_url, "other@example.com", "S002*")
            teacher_token = login(base_url, "teacher@example.com", "T001*")
            claim_token, _claim_exp = API.sign_local_profile({
                "provider": "local-gradebook",
                "sub": "claim-basic-final-oral",
                "email": "new-login@example.com",
                "name": "Document Claim Student",
            })

            protected_prompt_path = "/api/basic-final-oral/audio?" + urllib.parse.urlencode({"prompt": "unit-1-a"})
            status, closed_prompt = request(base_url, protected_prompt_path, token=student_token)
            assert status == 403 and closed_prompt["error"] == "prompt_not_assigned"
            status, staff_prompt = request(base_url, protected_prompt_path, token=teacher_token)
            assert status == 200 and staff_prompt == b"ID3-protected-prompt-unit-1-a"
            traversal_prompt_path = "/api/basic-final-oral/audio?" + urllib.parse.urlencode({"prompt": "../../grades"})
            status, prompt_traversal = request(base_url, traversal_prompt_path, token=teacher_token)
            assert status == 404 and prompt_traversal["error"] == "prompt_audio_not_found"

            status, closed_state = request(base_url, "/api/basic-final-oral/state", token=student_token)
            assert status == 200 and closed_state["state"]["isOpen"] is False
            assert closed_state["canStart"] is False and closed_state["student"]["id"] == "S001"

            status, claimed_state = request(
                base_url,
                "/api/basic-final-oral/state",
                token=claim_token,
                student_id_claim="C003",
            )
            assert status == 200 and claimed_state["student"]["id"] == "C003", claimed_state
            claimed_grades = json.loads(grades_path.read_text(encoding="utf-8"))
            claimed_student = next(item for item in claimed_grades["students"] if item["id"] == "C003")
            assert claimed_student["email"] == "new-login@example.com"

            status, closed_start = request(base_url, "/api/basic-final-oral/start", "POST", {}, student_token)
            assert status == 403 and closed_start["error"] == "exam_closed"

            status, opened = request(
                base_url,
                "/api/basic-final-oral/state",
                "PUT",
                {"isOpen": True},
                teacher_token,
            )
            assert status == 200 and opened["state"]["isOpen"] is True
            assert "now open" in opened["message"]

            status, started = request(base_url, "/api/basic-final-oral/start", "POST", {}, student_token)
            assert status == 200 and started["resumed"] is False, started
            attempt = started["attempt"]
            attempt_id = attempt["attemptId"]
            assigned = attempt["assignedQuestions"]
            assert len(assigned) == 7
            assert {item["unit"] for item in assigned} == {"1", "2", "3", "4", "5", "6", "interaction"}
            assert all(item["variantId"] and item["question"] and item["promptAudioId"] for item in assigned)
            assert all(item["promptAudioUrl"] == "/api/basic-final-oral/audio?prompt=" + item["promptAudioId"] for item in assigned)
            assert all("audio/final-oral-task-real" not in item["promptAudioUrl"] for item in assigned)
            assigned_prompt = first_prompt = assigned[0]["promptAudioId"]
            assigned_prompt_path = "/api/basic-final-oral/audio?" + urllib.parse.urlencode({"prompt": assigned_prompt})
            status, assigned_prompt_audio = request(base_url, assigned_prompt_path, token=student_token)
            assert status == 200 and assigned_prompt_audio == b"ID3-protected-prompt-" + assigned_prompt.encode("ascii")
            status, other_student_prompt = request(base_url, assigned_prompt_path, token=other_token)
            assert status == 403 and other_student_prompt["error"] == "prompt_not_assigned"
            non_assigned_prompt = next(item for item in ("unit-1-a", "unit-1-b", "unit-1-c") if item != assigned_prompt)
            non_assigned_path = "/api/basic-final-oral/audio?" + urllib.parse.urlencode({"prompt": non_assigned_prompt})
            status, non_assigned_audio = request(base_url, non_assigned_path, token=student_token)
            assert status == 403 and non_assigned_audio["error"] == "prompt_not_assigned"
            status, staff_monitor = request(base_url, "/api/basic-final-oral/state", token=teacher_token)
            assert status == 200 and staff_monitor["counts"]["inProgress"] == 1
            assert staff_monitor["activeAttempts"][0]["attemptId"] == attempt_id
            assert set(staff_monitor["questionBank"]) == {"1", "2", "3", "4", "5", "6"}

            status, resumed = request(base_url, "/api/basic-final-oral/start", "POST", {}, student_token)
            assert status == 200 and resumed["resumed"] is True
            assert resumed["attempt"]["attemptId"] == attempt_id
            assert resumed["attempt"]["assignedQuestions"] == assigned

            first = assigned[0]
            invalid_audio = "data:audio/ogg;base64," + base64.b64encode(b"not-an-ogg-audio").decode("ascii")
            status, rejected_audio = request(
                base_url,
                "/api/basic-final-oral/turn",
                "PUT",
                {
                    "attemptId": attempt_id,
                    "turnId": first["turnId"],
                    "variantId": first["variantId"],
                    "clientTurnId": "turn-invalid-audio",
                    "revision": 0,
                    "transcript": "My answer",
                    "durationMs": 1000,
                    "audioDataUrl": invalid_audio,
                },
                student_token,
            )
            assert status == 400 and rejected_audio["error"] == "invalid_audio_signature"

            first_audio_url, first_audio_bytes = ogg_data_url(1)
            first_payload = {
                "attemptId": attempt_id,
                "turnId": first["turnId"],
                "variantId": first["variantId"],
                "clientTurnId": "turn-unit-1-save-001",
                "revision": 0,
                "transcript": "My name is Alex and I live in Medellin.",
                "durationMs": 7200,
                "audioDataUrl": first_audio_url,
            }
            status, first_saved = request(base_url, "/api/basic-final-oral/turn", "PUT", first_payload, student_token)
            assert status == 200 and first_saved["revision"] == 1
            assert first_saved["turn"]["audioAvailable"] is True

            status, same_turn = request(base_url, "/api/basic-final-oral/turn", "PUT", first_payload, student_token)
            assert status == 200 and same_turn["idempotent"] is True and same_turn["revision"] == 1

            updated_first = dict(first_payload)
            updated_first.pop("audioDataUrl")
            updated_first["clientTurnId"] = "turn-unit-1-text-002"
            updated_first["revision"] = 1
            updated_first["transcript"] = "My name is Alex Perez and I live in Medellin. P E R E Z."
            status, updated = request(base_url, "/api/basic-final-oral/turn", "PUT", updated_first, student_token)
            assert status == 200 and updated["revision"] == 2 and updated["turn"]["audioAvailable"] is True

            stale_payload = dict(updated_first)
            stale_payload["clientTurnId"] = "turn-unit-1-stale-003"
            status, stale = request(base_url, "/api/basic-final-oral/turn", "PUT", stale_payload, student_token)
            assert status == 409 and stale["error"] == "stale_attempt" and stale["revision"] == 2

            status, closed = request(
                base_url,
                "/api/basic-final-oral/state",
                "PUT",
                {"isOpen": False},
                teacher_token,
            )
            assert status == 200 and closed["state"]["isOpen"] is False
            assert "Active attempts" in closed["message"]
            status, assigned_prompt_after_close = request(base_url, assigned_prompt_path, token=student_token)
            assert status == 200 and assigned_prompt_after_close == assigned_prompt_audio

            status, still_resumable = request(base_url, "/api/basic-final-oral/start", "POST", {}, student_token)
            assert status == 200 and still_resumable["resumed"] is True

            status, incomplete = request(
                base_url,
                "/api/basic-final-oral/submit",
                "POST",
                {"attemptId": attempt_id, "revision": 2, "clientSubmissionId": "submission-official-001"},
                student_token,
            )
            assert status == 400 and incomplete["error"] == "incomplete_attempt"
            assert len(incomplete["missingTurns"]) == 6

            revision = 2
            for index, question in enumerate(assigned[1:], 2):
                audio_data_url, _audio_bytes = ogg_data_url(index)
                turn_payload = {
                    "attemptId": attempt_id,
                    "turnId": question["turnId"],
                    "variantId": question["variantId"],
                    "clientTurnId": "turn-complete-" + str(index).zfill(3),
                    "revision": revision,
                    "transcript": "This is my complete spoken answer for " + question["unitLabel"] + ".",
                    "durationMs": 9000 + index,
                    "audioDataUrl": audio_data_url,
                }
                status, saved = request(base_url, "/api/basic-final-oral/turn", "PUT", turn_payload, student_token)
                assert status == 200, saved
                revision = saved["revision"]
            assert revision == 8

            status, current_attempt = request(
                base_url,
                "/api/basic-final-oral/attempt?" + urllib.parse.urlencode({"attemptId": attempt_id}),
                token=student_token,
            )
            assert status == 200 and len(current_attempt["attempt"]["turns"]) == 7
            assert current_attempt["attempt"]["assignedQuestions"][0]["promptAudioUrl"] == assigned_prompt_path

            audio_path = "/api/basic-final-oral/audio?" + urllib.parse.urlencode({"attemptId": attempt_id, "turnId": "unit-1"})
            status, own_audio = request(base_url, audio_path, token=student_token)
            assert status == 200 and own_audio == first_audio_bytes
            status, staff_audio = request(base_url, audio_path, token=teacher_token)
            assert status == 200 and staff_audio == first_audio_bytes
            status, forbidden_audio = request(base_url, audio_path, token=other_token)
            assert status == 403 and forbidden_audio["error"] == "forbidden"
            traversal_path = "/api/basic-final-oral/audio?" + urllib.parse.urlencode({"attemptId": attempt_id, "turnId": "../../grades"})
            status, traversal = request(base_url, traversal_path, token=teacher_token)
            assert status == 404 and traversal["error"] == "audio_not_found"

            submit_payload = {
                "attemptId": attempt_id,
                "revision": revision,
                "clientSubmissionId": "submission-official-001",
            }
            status, submitted = request(base_url, "/api/basic-final-oral/submit", "POST", submit_payload, student_token)
            assert status == 200 and submitted["idempotent"] is False, submitted
            submission = submitted["submission"]
            assert submission["status"] == "pending_teacher_review"
            assert submission["score50"] is None and submission["grade"] is None
            assert len(submission["turns"]) == 7 and submission["receiptId"].startswith("BFO-")

            interrupted_pending = json.loads(grades_path.read_text(encoding="utf-8"))
            interrupted_student = next(item for item in interrupted_pending["students"] if item["id"] == "S001")
            interrupted_student["gradeDetails"].pop(API.BASIC_FINAL_ORAL_EVALUATION_ID, None)
            write_json(grades_path, interrupted_pending)
            status, idempotent_submit = request(base_url, "/api/basic-final-oral/submit", "POST", submit_payload, student_token)
            assert status == 200 and idempotent_submit["idempotent"] is True
            assert idempotent_submit["submission"]["receiptId"] == submission["receiptId"]

            status, no_second_attempt = request(base_url, "/api/basic-final-oral/start", "POST", {}, student_token)
            assert status == 409 and no_second_attempt["error"] == "already_submitted"

            pending_grades = json.loads(grades_path.read_text(encoding="utf-8"))
            pending_student = next(item for item in pending_grades["students"] if item["id"] == "S001")
            assert API.BASIC_FINAL_ORAL_EVALUATION_ID not in pending_student["grades"]
            pending_detail = pending_student["gradeDetails"][API.BASIC_FINAL_ORAL_EVALUATION_ID]
            assert pending_detail["pendingTeacherReview"] is True
            assert pending_detail["score50"] is None and pending_detail["manualAssessment"] is True

            status, reviews = request(base_url, "/api/basic-final-oral/submissions", token=teacher_token)
            assert status == 200 and reviews["counts"] == {"total": 1, "pendingReview": 1, "graded": 0}
            assert reviews["submissions"][0]["receiptId"] == submission["receiptId"]
            status, private_reviews = request(base_url, "/api/basic-final-oral/submissions", token=other_token)
            assert status == 403 and private_reviews["error"] == "forbidden"

            bad_rubric = {
                "taskCompletion": 11,
                "interactionDiscourse": 8,
                "fluency": 8,
                "vocabularyStructure": 8,
                "pronunciation": 8,
            }
            status, rejected_grade = request(
                base_url,
                "/api/basic-final-oral/grade",
                "PUT",
                {"studentId": "S001", "receiptId": submission["receiptId"], "rubric": bad_rubric},
                teacher_token,
            )
            assert status == 400 and rejected_grade["error"] == "invalid_rubric"

            rubric = {
                "taskCompletion": 9,
                "interactionDiscourse": 8.5,
                "fluency": 9,
                "vocabularyStructure": 9,
                "pronunciation": 10,
            }
            grade_payload = {
                "studentId": "S001",
                "receiptId": submission["receiptId"],
                "rubric": rubric,
                "teacherFeedback": "You communicated clearly across all six course units.",
                "teacherEvidence": {
                    "taskCompletion": "All seven turns contain relevant evidence.",
                    "strengths": ["Clear routine sequence", "Useful direction language"],
                    "priorities": ["Keep final consonants audible"],
                },
            }
            status, forbidden_grade = request(base_url, "/api/basic-final-oral/grade", "PUT", grade_payload, other_token)
            assert status == 403 and forbidden_grade["error"] == "forbidden"
            status, graded = request(base_url, "/api/basic-final-oral/grade", "PUT", grade_payload, teacher_token)
            assert status == 200, graded
            assert graded["submission"]["score50"] == 45.5
            assert graded["submission"]["grade"] == 4.55
            assert graded["submission"]["status"] == "graded"
            assert graded["submission"]["teacherEvidence"]["strengths"][0] == "Clear routine sequence"

            final_grades = json.loads(grades_path.read_text(encoding="utf-8"))
            evaluation = next(item for item in final_grades["evaluations"] if item["id"] == API.BASIC_FINAL_ORAL_EVALUATION_ID)
            final_student = next(item for item in final_grades["students"] if item["id"] == "S001")
            detail = final_student["gradeDetails"][API.BASIC_FINAL_ORAL_EVALUATION_ID]
            assert evaluation["weight"] == 20
            assert final_student["grades"][API.BASIC_FINAL_ORAL_EVALUATION_ID] == 4.55
            assert detail["score50"] == 45.5 and detail["pendingTeacherReview"] is False
            assert detail["teacherFeedback"].startswith("You communicated clearly")
            assert len(detail["evidence"]) == 7

            interrupted_graded = json.loads(grades_path.read_text(encoding="utf-8"))
            interrupted_student = next(item for item in interrupted_graded["students"] if item["id"] == "S001")
            interrupted_student["grades"].pop(API.BASIC_FINAL_ORAL_EVALUATION_ID, None)
            interrupted_student["gradeDetails"].pop(API.BASIC_FINAL_ORAL_EVALUATION_ID, None)
            write_json(grades_path, interrupted_graded)
            status, repaired_gradebook = request(base_url, "/api/basic/grades", token=student_token)
            assert status == 200
            assert repaired_gradebook["student"]["grades"][API.BASIC_FINAL_ORAL_EVALUATION_ID] == 4.55
            assert repaired_gradebook["student"]["gradeDetails"][API.BASIC_FINAL_ORAL_EVALUATION_ID]["score50"] == 45.5

            persisted_store = json.loads(submissions_path.read_text(encoding="utf-8"))
            stored_attempt = persisted_store["attempts"]["S001"]
            stored_audio = stored_attempt["turns"]["unit-1"]["audio"]
            assert ".." not in stored_audio["file"] and "/" not in stored_audio["file"] and "\\" not in stored_audio["file"]
            assert API.basic_final_oral_audio_path("../../grades.json") == ""
            assert len(list(audio_dir.iterdir())) == 7
        finally:
            server.shutdown()
            server.server_close()
            thread.join(timeout=5)

    print("PASS Basic Final Oral backend: auth/claim, lock, server variants, resume, audio security, autosave, idempotency, one attempt, manual /50 grading, and Grades sync")


if __name__ == "__main__":
    main()
