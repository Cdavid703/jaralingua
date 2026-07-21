#!/usr/bin/env python3
"""End-to-end security and persistence regression for the Basic 1 Final Oral Task."""

import base64
import importlib.util
import json
import tempfile
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
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
        audit_path = temp / "basic-final-oral-audit.jsonl"
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
        API.BASIC_FINAL_ORAL_AUDIT_PATH = str(audit_path)
        API.BASIC_FINAL_ORAL_INSPECT_URL = ""
        API.BASIC_FINAL_ORAL_INTERNAL_TOKEN = "test-shared-transcriber-scope-secret"
        API.BASIC_FINAL_ORAL_INSPECTOR = lambda path, content_type: {
            "valid": True, "durationMs": 8000, "silenceFlag": False, "inspector": "test-inspector"
        }
        API.BASIC_FINAL_ORAL_AUTH_ATTEMPTS.clear()
        API.BASIC_FINAL_ORAL_STATE_ACTIONS.clear()
        API.BASIC_FINAL_ORAL_STORAGE_STATUS.update({
            "lastProbeAtEpoch": 0.0, "lastSuccessAt": None,
            "audioWritable": False, "auditWritable": False,
            "audioError": "not_probed", "auditError": "not_probed",
        })
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
            assert status == 200 and claimed_state["student"] is None, claimed_state
            assert claimed_state["pairingAvailable"] is True and claimed_state["claimAvailable"] is False
            claimed_grades = json.loads(grades_path.read_text(encoding="utf-8"))
            claimed_student = next(item for item in claimed_grades["students"] if item["id"] == "C003")
            assert claimed_student["email"] == ""

            status, closed_start = request(base_url, "/api/basic-final-oral/start", "POST", {}, student_token)
            assert status == 403 and closed_start["error"] == "exam_closed"

            # Expensive health probes run only after a staff authorization check.
            probe_invocations = {"inspector": 0, "storage": 0}
            saved_probe_inspector = API.basic_final_oral_probe_inspector
            saved_probe_storage = API.basic_final_oral_probe_storage

            def count_probe_inspector(force=False):
                probe_invocations["inspector"] += 1
                return saved_probe_inspector(force)

            def count_probe_storage(force=False):
                probe_invocations["storage"] += 1
                return saved_probe_storage(force)

            API.basic_final_oral_probe_inspector = count_probe_inspector
            API.basic_final_oral_probe_storage = count_probe_storage
            status, student_open_attempt = request(base_url, "/api/basic-final-oral/state", "PUT", {"isOpen": True}, student_token)
            assert status == 403 and student_open_attempt["error"] == "forbidden"
            status, anonymous_open_attempt = request(base_url, "/api/basic-final-oral/state", "PUT", {"isOpen": True})
            assert status == 401 and anonymous_open_attempt["error"] == "missing_token"
            assert probe_invocations == {"inspector": 0, "storage": 0}
            API.basic_final_oral_probe_inspector = saved_probe_inspector
            API.basic_final_oral_probe_storage = saved_probe_storage

            original_probe_callable = API.BASIC_FINAL_ORAL_INSPECTOR
            original_probe_url = API.BASIC_FINAL_ORAL_INSPECT_URL
            original_probe_token = API.BASIC_FINAL_ORAL_INTERNAL_TOKEN
            API.BASIC_FINAL_ORAL_INSPECTOR = None
            API.BASIC_FINAL_ORAL_INSPECT_URL = "http://127.0.0.1:1/internal/pronunciation/audio-inspect"
            API.BASIC_FINAL_ORAL_INSPECTOR_STATUS.update({"ready": False, "lastError": "", "lastProbeAtEpoch": 0.0})
            status, inspector_down = request(base_url, "/api/basic-final-oral/state", "PUT", {"isOpen": True}, teacher_token)
            assert status == 409 and "audio_inspector_not_ready" in inspector_down["blockingWarnings"], inspector_down

            class ProbeHandler(BaseHTTPRequestHandler):
                def log_message(self, *_args):
                    pass

                def do_GET(self):
                    if self.headers.get("X-Jaralingua-Internal-Token") != "expected-probe-token":
                        body = json.dumps({"error": "invalid_internal_token"}).encode("utf-8")
                        self.send_response(401)
                    else:
                        body = json.dumps({"ok": True, "inspector": {"ready": True, "scope_validation_configured": True}}).encode("utf-8")
                        self.send_response(200)
                    self.send_header("Content-Type", "application/json")
                    self.send_header("Content-Length", str(len(body)))
                    self.end_headers()
                    self.wfile.write(body)

            probe_server = ThreadingHTTPServer(("127.0.0.1", 0), ProbeHandler)
            probe_thread = threading.Thread(target=probe_server.serve_forever, daemon=True)
            probe_thread.start()
            API.BASIC_FINAL_ORAL_INSPECT_URL = "http://127.0.0.1:" + str(probe_server.server_port) + "/internal/pronunciation/audio-inspect"
            API.BASIC_FINAL_ORAL_INTERNAL_TOKEN = "wrong-probe-token"
            status, token_mismatch = request(base_url, "/api/basic-final-oral/state", "PUT", {"isOpen": True}, teacher_token)
            assert status == 409 and "audio_inspector_authentication_failed" in token_mismatch["blockingWarnings"], token_mismatch
            API.BASIC_FINAL_ORAL_INTERNAL_TOKEN = "expected-probe-token"
            status, probe_ready_but_weights_bad = request(base_url, "/api/basic-final-oral/state", "PUT", {"isOpen": True}, teacher_token)
            assert status == 409 and "audio_inspector_not_ready" not in probe_ready_but_weights_bad["blockingWarnings"]
            probe_server.shutdown()
            probe_server.server_close()
            probe_thread.join(timeout=3)
            API.BASIC_FINAL_ORAL_INSPECTOR = original_probe_callable
            API.BASIC_FINAL_ORAL_INSPECT_URL = original_probe_url
            API.BASIC_FINAL_ORAL_INTERNAL_TOKEN = original_probe_token
            API.BASIC_FINAL_ORAL_INSPECTOR_STATUS.update({"ready": False, "lastError": "", "lastProbeAtEpoch": 0.0})

            original_audio_dir = API.BASIC_FINAL_ORAL_AUDIO_DIR
            blocked_audio_path = temp / "audio-storage-is-a-file"
            blocked_audio_path.write_bytes(b"not-a-directory")
            API.BASIC_FINAL_ORAL_AUDIO_DIR = str(blocked_audio_path)
            status, storage_blocked = request(base_url, "/api/basic-final-oral/state", "PUT", {"isOpen": True}, teacher_token)
            assert status == 409 and "audio_storage_not_writable" in storage_blocked["blockingWarnings"], storage_blocked
            API.BASIC_FINAL_ORAL_AUDIO_DIR = original_audio_dir

            status, opened = request(
                base_url,
                "/api/basic-final-oral/state",
                "PUT",
                {"isOpen": True},
                teacher_token,
            )
            assert status == 409 and opened["error"] == "exam_health_check_failed", opened
            blocked_grades = json.loads(grades_path.read_text(encoding="utf-8"))
            missing_weight = round(100 - float(opened["health"]["weights"]["gradebookTotal"]), 4)
            if missing_weight:
                blocked_grades["evaluations"].append({
                    "id": "testWeightBalance", "title": "Existing course assessments", "weight": missing_weight,
                })
                write_json(grades_path, blocked_grades)
            status, opened = request(
                base_url,
                "/api/basic-final-oral/state",
                "PUT",
                {"isOpen": True, "closeMode": "soft", "graceSeconds": 900},
                teacher_token,
            )
            assert status == 200 and opened["state"]["isOpen"] is True
            assert "now open" in opened["message"]
            status, student_public_state = request(base_url, "/api/basic-final-oral/state", token=student_token)
            assert status == 200
            assert "eligibleStudentIds" not in student_public_state["state"] and "extensions" not in student_public_state["state"]
            assert student_public_state["state"]["isEligible"] is True

            status, started = request(base_url, "/api/basic-final-oral/start", "POST", {"deviceId": "device-student-1"}, student_token)
            assert status == 200 and started["resumed"] is False, started
            attempt = started["attempt"]
            attempt_id = attempt["attemptId"]
            attempt_scope_token = attempt["attemptScopeToken"]
            assert attempt["transcriberScopeToken"] and attempt["transcriberScopeHeader"] == "X-Jaralingua-Exam-Scope"
            lease_id = attempt["lease"]["leaseId"]
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

            status, resumed = request(base_url, "/api/basic-final-oral/start", "POST", {"deviceId": "device-student-1"}, student_token)
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
                    "attemptScopeToken": attempt_scope_token,
                    "leaseId": lease_id,
                    "deviceId": "device-student-1",
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
                "attemptScopeToken": attempt_scope_token,
                "leaseId": lease_id,
                "deviceId": "device-student-1",
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

            replacement_audio_url, replacement_audio_bytes = ogg_data_url(11)
            replacement_payload = dict(first_payload)
            replacement_payload.update({
                "clientTurnId": "turn-unit-1-replacement-002",
                "revision": 1,
                "audioDataUrl": replacement_audio_url,
                "transcript": "Authorized replacement answer.",
            })
            status, locked_replacement = request(base_url, "/api/basic-final-oral/turn", "PUT", replacement_payload, student_token)
            assert status == 409 and locked_replacement["error"] == "turn_locked", locked_replacement
            status, unlocked = request(
                base_url, "/api/basic-final-oral/student-action", "PUT",
                {"studentId": "S001", "action": "unlock_turn", "turnId": first["turnId"], "reason": "Student reported a microphone interruption", "requestId": "unlock-turn-s001-001"},
                teacher_token,
            )
            assert status == 200 and unlocked["usesRemaining"] == 1, unlocked
            status, replaced = request(base_url, "/api/basic-final-oral/turn", "PUT", replacement_payload, student_token)
            assert status == 200 and replaced["revision"] == 2, replaced
            second_replacement = dict(replacement_payload)
            second_replacement.update({"clientTurnId": "turn-unit-1-replacement-003", "revision": 2})
            status, relocked = request(base_url, "/api/basic-final-oral/turn", "PUT", second_replacement, student_token)
            assert status == 409 and relocked["error"] == "turn_locked", relocked

            updated_first = dict(first_payload)
            updated_first.pop("audioDataUrl")
            updated_first["clientTurnId"] = "turn-unit-1-text-004"
            updated_first["revision"] = 2
            updated_first["transcript"] = "My name is Alex Perez and I live in Medellin. P E R E Z."
            status, updated = request(base_url, "/api/basic-final-oral/turn", "PUT", updated_first, student_token)
            assert status == 200 and updated["revision"] == 3 and updated["turn"]["audioAvailable"] is True

            stale_payload = dict(updated_first)
            stale_payload["clientTurnId"] = "turn-unit-1-stale-003"
            status, stale = request(base_url, "/api/basic-final-oral/turn", "PUT", stale_payload, student_token)
            assert status == 409 and stale["error"] == "stale_attempt" and stale["revision"] == 3

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

            status, still_resumable = request(base_url, "/api/basic-final-oral/start", "POST", {"deviceId": "device-student-1"}, student_token)
            assert status == 200 and still_resumable["resumed"] is True

            status, incomplete = request(
                base_url,
                "/api/basic-final-oral/submit",
                "POST",
                {"attemptId": attempt_id, "attemptScopeToken": attempt_scope_token, "leaseId": lease_id, "deviceId": "device-student-1", "revision": 3, "clientSubmissionId": "submission-official-001"},
                student_token,
            )
            assert status == 400 and incomplete["error"] == "incomplete_attempt"
            assert len(incomplete["missingTurns"]) == 6

            revision = 3
            for index, question in enumerate(assigned[1:], 2):
                audio_data_url, _audio_bytes = ogg_data_url(index)
                turn_payload = {
                    "attemptId": attempt_id,
                    "attemptScopeToken": attempt_scope_token,
                    "leaseId": lease_id,
                    "deviceId": "device-student-1",
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
            assert revision == 9

            status, current_attempt = request(
                base_url,
                "/api/basic-final-oral/attempt?" + urllib.parse.urlencode({"attemptId": attempt_id}),
                token=student_token,
            )
            assert status == 200 and len(current_attempt["attempt"]["turns"]) == 7
            assert current_attempt["attempt"]["assignedQuestions"][0]["promptAudioUrl"] == assigned_prompt_path

            audio_path = "/api/basic-final-oral/audio?" + urllib.parse.urlencode({"attemptId": attempt_id, "turnId": "unit-1"})
            status, own_audio = request(base_url, audio_path, token=student_token)
            assert status == 200 and own_audio == replacement_audio_bytes
            status, staff_audio = request(base_url, audio_path, token=teacher_token)
            assert status == 200 and staff_audio == replacement_audio_bytes
            status, forbidden_audio = request(base_url, audio_path, token=other_token)
            assert status == 403 and forbidden_audio["error"] == "forbidden"
            traversal_path = "/api/basic-final-oral/audio?" + urllib.parse.urlencode({"attemptId": attempt_id, "turnId": "../../grades"})
            status, traversal = request(base_url, traversal_path, token=teacher_token)
            assert status == 404 and traversal["error"] == "audio_not_found"

            submit_payload = {
                "attemptId": attempt_id,
                "attemptScopeToken": attempt_scope_token,
                "leaseId": lease_id,
                "deviceId": "device-student-1",
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
            assert status == 200 and reviews["counts"]["total"] == 1
            assert reviews["counts"]["pendingReview"] == 1 and reviews["counts"]["graded"] == 0
            assert reviews["counts"]["syncPending"] == 0
            assert reviews["submissions"][0]["receiptId"] == submission["receiptId"]
            reviewed_audio = [
                {"turnId": turn["turnId"], "sha256": turn["audio"]["sha256"]}
                for turn in reviews["submissions"][0]["turns"]
            ]
            assert len(reviewed_audio) == 7 and all(len(item["sha256"]) == 64 for item in reviewed_audio)
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
            status, missing_reviewed_audio = request(
                base_url, "/api/basic-final-oral/grade", "PUT",
                {"studentId": "S001", "receiptId": submission["receiptId"], "rubric": rubric, "teacherFeedback": "Complete review."},
                teacher_token,
            )
            assert status == 400 and missing_reviewed_audio["error"] == "reviewed_audio_evidence_required"
            tampered_reviewed_audio = [dict(item) for item in reviewed_audio]
            tampered_reviewed_audio[0]["sha256"] = "0" * 64
            status, tampered_review = request(
                base_url, "/api/basic-final-oral/grade", "PUT",
                {"studentId": "S001", "receiptId": submission["receiptId"], "rubric": rubric, "teacherFeedback": "Complete review.", "reviewedAudioEvidence": tampered_reviewed_audio},
                teacher_token,
            )
            assert status == 400 and tampered_review["error"] == "invalid_reviewed_audio_evidence"
            status, missing_feedback = request(
                base_url, "/api/basic-final-oral/grade", "PUT",
                {"studentId": "S001", "receiptId": submission["receiptId"], "rubric": rubric, "reviewedAudioEvidence": reviewed_audio},
                teacher_token,
            )
            assert status == 400 and missing_feedback["error"] == "teacher_feedback_required"

            grades_before_draft = grades_path.read_bytes()
            grades_mtime_before_draft = grades_path.stat().st_mtime_ns
            partial_draft_payload = {
                "studentId": "S001", "receiptId": submission["receiptId"], "action": "draft",
                "rubric": {"taskCompletion": 9, "fluency": None},
                "expectedRevision": 0, "requestId": "grade-partial-draft-001",
            }
            status, partial_draft = request(base_url, "/api/basic-final-oral/grade", "PUT", partial_draft_payload, teacher_token)
            assert status == 200 and partial_draft["submission"]["gradeRevision"] == 1, partial_draft
            assert partial_draft["submission"]["rubric"] == {"taskCompletion": 9.0}
            assert partial_draft["submission"]["score50"] is None and partial_draft["submission"]["teacherFeedback"] == ""
            assert grades_path.read_bytes() == grades_before_draft and grades_path.stat().st_mtime_ns == grades_mtime_before_draft
            status, student_draft_view = request(base_url, "/api/basic-final-oral/state", token=student_token)
            assert status == 200 and student_draft_view["submission"]["status"] == "pending_teacher_review"
            assert student_draft_view["submission"]["workflowStatus"] == "pending_teacher_review"
            assert student_draft_view["submission"]["rubric"] is None and student_draft_view["submission"]["teacherFeedback"] == ""
            assert "gradeHistory" not in student_draft_view["submission"] and "reviewedAudioEvidence" not in student_draft_view["submission"]
            assert "gradeRevision" not in student_draft_view["submission"] and "gradedBy" not in student_draft_view["submission"]

            grade_payload = {
                "studentId": "S001",
                "receiptId": submission["receiptId"],
                "action": "publish",
                "expectedRevision": 1,
                "requestId": "grade-publish-initial-002",
                "rubric": rubric,
                "teacherFeedback": "You communicated clearly across all six course units.",
                "reviewedAudioEvidence": reviewed_audio,
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
            assert graded["submission"]["reviewedAudioEvidence"] == reviewed_audio
            status, student_published_view = request(base_url, "/api/basic-final-oral/state", token=student_token)
            assert status == 200 and student_published_view["submission"]["grade"] == 4.55
            assert "gradeHistory" not in student_published_view["submission"] and "gradedBy" not in student_published_view["submission"]

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
            assert len(list(audio_dir.iterdir())) == 8
            assert len(stored_attempt["turns"]["unit-1"]["versions"]) == 1

            # Published grades use optimistic revisions and request-level idempotency.
            revised_grade = dict(grade_payload)
            revised_grade.update({
                "action": "publish", "expectedRevision": 2,
                "requestId": "grade-publish-revision-003",
                "reason": "Teacher corrected the final feedback after review.",
                "teacherFeedback": "Clear communication. Continue practicing final consonants.",
            })
            status, republished = request(base_url, "/api/basic-final-oral/grade", "PUT", revised_grade, teacher_token)
            assert status == 200 and republished["submission"]["gradeRevision"] == 3, republished
            status, repeated_grade = request(base_url, "/api/basic-final-oral/grade", "PUT", revised_grade, teacher_token)
            assert status == 200 and repeated_grade["idempotent"] is True
            assert len(republished["submission"]["gradeHistory"]) == 3
            draft_grade = dict(revised_grade)
            draft_grade.update({
                "action": "draft", "expectedRevision": 3, "requestId": "grade-draft-after-publish-004",
                "reason": "Teacher is preparing a revised rubric before publication.",
            })
            status, drafted = request(base_url, "/api/basic-final-oral/grade", "PUT", draft_grade, teacher_token)
            assert status == 409 and drafted["error"] == "published_submission_requires_republish", drafted
            crash_grade = dict(revised_grade)
            crash_grade.update({
                "expectedRevision": 3, "requestId": "grade-publish-crash-retry-005",
                "reason": "Simulate a crash between durable grade and Grades synchronization.",
                "teacherFeedback": "Final feedback requiring a new durable Grades synchronization.",
            })
            original_write_json = API.write_json_file
            fail_once = {"pending": True}

            def flaky_gradebook_write(path, data, prefix):
                if path == str(grades_path) and fail_once["pending"]:
                    fail_once["pending"] = False
                    raise OSError("simulated gradebook write failure")
                return original_write_json(path, data, prefix)

            API.write_json_file = flaky_gradebook_write
            status, sync_interrupted = request(base_url, "/api/basic-final-oral/grade", "PUT", crash_grade, teacher_token)
            API.write_json_file = original_write_json
            assert status == 503 and sync_interrupted["error"] == "gradebook_sync_pending", sync_interrupted
            assert sync_interrupted["submission"]["syncStatus"] == "pending"
            status, sync_repaired = request(base_url, "/api/basic-final-oral/grade", "PUT", crash_grade, teacher_token)
            assert status == 200 and sync_repaired["idempotent"] is True, sync_repaired
            assert sync_repaired["submission"]["syncStatus"] == "synced"

            # A document can only be paired through a short-lived code issued by staff.
            status, issued = request(
                base_url, "/api/basic-final-oral/student-action", "PUT",
                {"studentId": "C003", "action": "issue_pairing", "reason": "Verified student at the classroom desk", "requestId": "pair-admin-001"},
                teacher_token,
            )
            assert status == 200 and len(issued["pairingCode"]) == 8, issued
            status, paired = request(
                base_url, "/api/basic-final-oral/pair", "POST",
                {"studentId": "C003", "pairingCode": issued["pairingCode"]}, claim_token,
            )
            assert status == 200 and paired["student"]["id"] == "C003", paired
            status, paired_state = request(base_url, "/api/basic-final-oral/state", token=claim_token)
            assert status == 200 and paired_state["student"]["id"] == "C003"

            # Eligibility and leases prevent an unlisted student or a second device.
            status, reopened = request(
                base_url, "/api/basic-final-oral/state", "PUT",
                {"isOpen": True, "eligibleStudentIds": ["S002"]}, teacher_token,
            )
            assert status == 200, reopened
            status, paired_denied = request(base_url, "/api/basic-final-oral/start", "POST", {"deviceId": "claim-device"}, claim_token)
            assert status == 403 and paired_denied["error"] == "student_not_eligible"
            assert "eligibleStudentIds" not in paired_denied["state"] and "extensions" not in paired_denied["state"]
            status, second_started = request(base_url, "/api/basic-final-oral/start", "POST", {"deviceId": "device-other-a"}, other_token)
            assert status == 200, second_started
            second_attempt = second_started["attempt"]
            status, contention = request(base_url, "/api/basic-final-oral/start", "POST", {"deviceId": "device-other-b"}, other_token)
            assert status == 409 and contention["error"] == "attempt_in_use"

            second_scope = second_attempt["attemptScopeToken"]
            second_lease = second_attempt["lease"]["leaseId"]
            second_revision = 0
            first_other = second_attempt["assignedQuestions"][0]
            files_before_forgery = set(path.name for path in audio_dir.iterdir())
            inspector_calls = {"count": 0}

            def counting_inspector(path, content_type):
                inspector_calls["count"] += 1
                return {"valid": True, "durationMs": 8000, "silenceFlag": False, "inspector": "counting-test"}

            original_inspector = API.BASIC_FINAL_ORAL_INSPECTOR
            API.BASIC_FINAL_ORAL_INSPECTOR = counting_inspector
            status, forged_internal = request(
                base_url, "/api/basic-final-oral/turn", "PUT",
                {
                    "attemptId": second_attempt["attemptId"], "attemptScopeToken": second_scope, "leaseId": second_lease, "deviceId": "device-other-a",
                    "turnId": first_other["turnId"], "variantId": first_other["variantId"],
                    "clientTurnId": "forged-prepared-audio-001", "revision": 0,
                    "_preparedAudio": {"file": "forged.ogg", "sha256": "0" * 64, "size": 100},
                }, other_token,
            )
            assert status == 400 and forged_internal["error"] == "missing_audio"
            invalid_scope_audio, _ = ogg_data_url(50)
            status, invalid_scope = request(
                base_url, "/api/basic-final-oral/turn", "PUT",
                {
                    "attemptId": second_attempt["attemptId"], "attemptScopeToken": "forged-scope", "leaseId": second_lease, "deviceId": "device-other-a",
                    "turnId": first_other["turnId"], "variantId": first_other["variantId"],
                    "clientTurnId": "invalid-scope-audio-001", "revision": 0,
                    "audioDataUrl": invalid_scope_audio, "durationMs": 8000,
                }, other_token,
            )
            assert status == 403 and invalid_scope["error"] == "invalid_attempt_scope"
            status, stolen_lease = request(
                base_url, "/api/basic-final-oral/turn", "PUT",
                {
                    "attemptId": second_attempt["attemptId"], "attemptScopeToken": second_scope, "leaseId": second_lease, "deviceId": "device-other-b",
                    "turnId": first_other["turnId"], "variantId": first_other["variantId"],
                    "clientTurnId": "stolen-lease-audio-001", "revision": 0,
                    "audioDataUrl": invalid_scope_audio, "durationMs": 8000,
                }, other_token,
            )
            assert status == 409 and stolen_lease["error"] == "attempt_lease_required"
            assert stolen_lease["serverLeaseExpiresAt"]
            assert inspector_calls["count"] == 0
            assert set(path.name for path in audio_dir.iterdir()) == files_before_forgery

            def unavailable_inspector(_path, _content_type):
                raise OSError("temporary inspector outage")

            API.BASIC_FINAL_ORAL_INSPECTOR = unavailable_inspector
            pending_audio, _ = ogg_data_url(49)
            status, verification_pending = request(
                base_url, "/api/basic-final-oral/turn", "PUT",
                {
                    "attemptId": second_attempt["attemptId"], "attemptScopeToken": second_scope, "leaseId": second_lease, "deviceId": "device-other-a",
                    "turnId": first_other["turnId"], "variantId": first_other["variantId"],
                    "clientTurnId": "inspector-pending-audio-001", "revision": 0,
                    "audioDataUrl": pending_audio, "durationMs": 8000,
                }, other_token,
            )
            assert status == 503 and verification_pending["error"] == "audio_verification_pending", verification_pending
            assert set(path.name for path in audio_dir.iterdir()) == files_before_forgery
            status, pending_attempt_check = request(
                base_url, "/api/basic-final-oral/attempt?" + urllib.parse.urlencode({"attemptId": second_attempt["attemptId"]}),
                token=other_token,
            )
            assert status == 200 and first_other["turnId"] not in pending_attempt_check["attempt"]["turns"]

            slow_started = threading.Event()

            def slow_inspector(path, content_type):
                slow_started.set()
                time.sleep(0.65)
                return {"valid": True, "durationMs": 8100, "silenceFlag": False, "inspector": "slow-test"}

            API.BASIC_FINAL_ORAL_INSPECTOR = slow_inspector
            other_audio, _ = ogg_data_url(51)
            concurrent_result = {}

            def save_slow_turn():
                concurrent_result["value"] = request(
                    base_url, "/api/basic-final-oral/turn", "PUT",
                    {
                        "attemptId": second_attempt["attemptId"], "attemptScopeToken": second_scope, "leaseId": second_lease, "deviceId": "device-other-a",
                        "turnId": first_other["turnId"], "variantId": first_other["variantId"],
                        "clientTurnId": "other-turn-concurrent-001", "revision": 0,
                        "durationMs": 7000, "transcriptStatus": "pending", "audioDataUrl": other_audio,
                    }, other_token,
                )

            save_thread = threading.Thread(target=save_slow_turn)
            save_thread.start()
            assert slow_started.wait(timeout=2)
            began = time.monotonic()
            status, responsive_state = request(base_url, "/api/basic-final-oral/state", token=teacher_token)
            elapsed = time.monotonic() - began
            assert status == 200 and elapsed < 0.4, elapsed
            save_thread.join(timeout=4)
            API.BASIC_FINAL_ORAL_INSPECTOR = original_inspector
            status, first_other_saved = concurrent_result["value"]
            assert status == 200 and first_other_saved["turn"]["transcriptStatus"] == "pending"
            second_revision = first_other_saved["revision"]

            conflict_payload = {
                "attemptId": second_attempt["attemptId"], "attemptScopeToken": second_scope, "leaseId": second_lease, "deviceId": "device-other-a",
                "turnId": first_other["turnId"], "variantId": first_other["variantId"],
                "clientTurnId": "other-turn-concurrent-001", "revision": 0,
                "durationMs": 7000, "transcript": "Different request with reused idempotency key",
            }
            status, idempotency_conflict = request(base_url, "/api/basic-final-oral/turn", "PUT", conflict_payload, other_token)
            assert status == 409 and idempotency_conflict["error"] == "idempotency_conflict"

            replacement_other_audio, _ = ogg_data_url(60)
            replacement_other_payload = {
                "attemptId": second_attempt["attemptId"], "attemptScopeToken": second_scope, "leaseId": second_lease, "deviceId": "device-other-a",
                "turnId": first_other["turnId"], "variantId": first_other["variantId"],
                "clientTurnId": "other-turn-replacement-002", "revision": second_revision,
                "durationMs": 8000, "transcript": "Replacement recording", "audioDataUrl": replacement_other_audio,
            }
            status, other_turn_locked = request(base_url, "/api/basic-final-oral/turn", "PUT", replacement_other_payload, other_token)
            assert status == 409 and other_turn_locked["error"] == "turn_locked"
            status, other_turn_unlock = request(
                base_url, "/api/basic-final-oral/student-action", "PUT",
                {"studentId": "S002", "action": "unlock_turn", "turnId": first_other["turnId"], "reason": "Verified microphone failure", "requestId": "unlock-turn-s002-001"},
                teacher_token,
            )
            assert status == 200, other_turn_unlock
            status, other_turn_replaced = request(base_url, "/api/basic-final-oral/turn", "PUT", replacement_other_payload, other_token)
            assert status == 200, other_turn_replaced
            second_revision = other_turn_replaced["revision"]
            second_replacement_other = dict(replacement_other_payload)
            second_replacement_other.update({"clientTurnId": "other-turn-replacement-003", "revision": second_revision})
            status, other_turn_relocked = request(base_url, "/api/basic-final-oral/turn", "PUT", second_replacement_other, other_token)
            assert status == 409 and other_turn_relocked["error"] == "turn_locked"

            overlong_question = second_attempt["assignedQuestions"][1]
            overlong_audio, _ = ogg_data_url(61)
            API.BASIC_FINAL_ORAL_INSPECTOR = lambda _path, _content_type: {
                "valid": True,
                "durationMs": API.basic_final_oral_turn_duration_limit(overlong_question["turnId"]) + 1,
                "silenceFlag": False,
                "inspector": "overlong-test",
            }
            files_before_overlong = set(path.name for path in audio_dir.iterdir())
            status, overlong_turn = request(
                base_url, "/api/basic-final-oral/turn", "PUT",
                {
                    "attemptId": second_attempt["attemptId"], "attemptScopeToken": second_scope, "leaseId": second_lease, "deviceId": "device-other-a",
                    "turnId": overlong_question["turnId"], "variantId": overlong_question["variantId"],
                    "clientTurnId": "other-overlong-turn-001", "revision": second_revision,
                    "durationMs": 999, "transcript": "Overlong answer", "audioDataUrl": overlong_audio,
                }, other_token,
            )
            API.BASIC_FINAL_ORAL_INSPECTOR = original_inspector
            assert status == 400 and overlong_turn["error"] == "turn_audio_too_long", overlong_turn
            assert set(path.name for path in audio_dir.iterdir()) == files_before_overlong

            for index, question in enumerate(second_attempt["assignedQuestions"][1:], 52):
                audio_data, _ = ogg_data_url(index)
                status, saved = request(
                    base_url, "/api/basic-final-oral/turn", "PUT",
                    {
                        "attemptId": second_attempt["attemptId"], "attemptScopeToken": second_scope, "leaseId": second_lease, "deviceId": "device-other-a",
                        "turnId": question["turnId"], "variantId": question["variantId"],
                        "clientTurnId": "other-complete-" + str(index), "revision": second_revision,
                        "durationMs": 8200, "transcript": "Complete answer", "audioDataUrl": audio_data,
                    }, other_token,
                )
                assert status == 200, saved
                second_revision = saved["revision"]

            second_store = json.loads(submissions_path.read_text(encoding="utf-8"))
            original_durations = {}
            for turn_id, turn in second_store["attempts"]["S002"]["turns"].items():
                original_durations[turn_id] = (turn["durationMs"], turn["audio"]["durationMs"])
                enlarged_duration = API.BASIC_FINAL_ORAL_TURN_MAX_MS[turn_id] + 1000
                turn["durationMs"] = enlarged_duration
                turn["audio"]["durationMs"] = enlarged_duration
            write_json(submissions_path, second_store)
            status, total_overlong = request(
                base_url, "/api/basic-final-oral/submit", "POST",
                {"attemptId": second_attempt["attemptId"], "attemptScopeToken": second_scope, "leaseId": second_lease, "deviceId": "device-other-a", "revision": second_revision, "clientSubmissionId": "other-submit-overlong-001"},
                other_token,
            )
            assert status == 422 and total_overlong["error"] == "attempt_audio_too_long", total_overlong
            second_store = json.loads(submissions_path.read_text(encoding="utf-8"))
            for turn_id, durations in original_durations.items():
                second_store["attempts"]["S002"]["turns"][turn_id]["durationMs"] = durations[0]
                second_store["attempts"]["S002"]["turns"][turn_id]["audio"]["durationMs"] = durations[1]
            write_json(submissions_path, second_store)
            tampered_audio = second_store["attempts"]["S002"]["turns"][first_other["turnId"]]["audio"]
            (audio_dir / tampered_audio["file"]).write_bytes(b"OggS-tampered-after-save")
            status, corrupt_submit = request(
                base_url, "/api/basic-final-oral/submit", "POST",
                {"attemptId": second_attempt["attemptId"], "attemptScopeToken": second_scope, "leaseId": second_lease, "deviceId": "device-other-a", "revision": second_revision, "clientSubmissionId": "other-submit-corrupt-001"},
                other_token,
            )
            assert status == 422 and corrupt_submit["error"] == "audio_verification_failed", corrupt_submit

            status, reset_student = request(
                base_url, "/api/basic-final-oral/student-action", "PUT",
                {"studentId": "S001", "action": "reset", "reason": "Authorized new attempt after documented review", "requestId": "reset-s001-001"},
                teacher_token,
            )
            assert status == 200 and reset_student["reset"] is True
            reset_store = json.loads(submissions_path.read_text(encoding="utf-8"))
            assert "S001" not in reset_store["attempts"] and "S001" not in reset_store["submissions"]
            assert any(item.get("studentId") == "S001" and item.get("retention") == "audit_evidence" for item in reset_store["attemptHistory"])
            assert all(not key.startswith("S001:") and submission["receiptId"] not in key for key in reset_store["idempotency"])
            assert reset_store["outbox"][submission["receiptId"]]["status"] == "canceled"
            status, reset_health = request(base_url, "/api/basic-final-oral/health", token=teacher_token)
            assert status == 200 and reset_health["storage"]["orphanFiles"] == 0, reset_health
            assert reset_health["sync"]["pendingOutbox"] == 0 and reset_health["sync"]["canceledOutbox"] >= 1
            status, reset_reconcile = request(
                base_url, "/api/basic-final-oral/reconcile", "POST",
                {"reason": "Verify clean state after reset", "requestId": "reconcile-after-reset-001"}, teacher_token,
            )
            assert status == 200 and reset_reconcile["health"]["sync"]["pendingOutbox"] == 0

            # Crash residue is detected as an orphan instead of becoming a turn.
            orphan_payload, _ = ogg_data_url(90)
            orphan_ref = API.save_basic_final_oral_audio("CRASH-SIMULATION", "unit-1", {"audioDataUrl": orphan_payload, "durationMs": 8000})
            status, health = request(base_url, "/api/basic-final-oral/health", token=teacher_token)
            assert status == 200 and health["storage"]["orphanFiles"] >= 1
            assert orphan_ref["file"]

            audit_events = [json.loads(line) for line in audit_path.read_text(encoding="utf-8").splitlines() if line.strip()]
            audit_types = {item["type"] for item in audit_events}
            assert {"attempt_started", "turn_saved", "submitted", "student_issue_pairing", "grade_published"} <= audit_types

            # High-stakes JSON corruption fails closed and is never treated as an empty store.
            valid_store_bytes = submissions_path.read_bytes()
            submissions_path.write_text("{broken-json", encoding="utf-8")
            status, corrupt_store = request(base_url, "/api/basic-final-oral/state", token=teacher_token)
            assert status == 503 and corrupt_store["error"] == "assessment_storage_unavailable"
            submissions_path.write_bytes(valid_store_bytes)
            write_json(submissions_path, {"schemaVersion": 2, "attempts": []})
            status, invalid_store_schema = request(base_url, "/api/basic-final-oral/state", token=teacher_token)
            assert status == 503 and invalid_store_schema["error"] == "assessment_storage_unavailable"
            submissions_path.write_bytes(valid_store_bytes)

            valid_bundle_bytes = state_path.read_bytes()
            invalid_bundle = json.loads(valid_bundle_bytes.decode("utf-8"))
            invalid_bundle["state"]["eligibleStudentIds"] = "S002"
            write_json(state_path, invalid_bundle)
            status, invalid_bundle_schema = request(base_url, "/api/basic-final-oral/state", token=teacher_token)
            assert status == 503 and invalid_bundle_schema["error"] == "assessment_storage_unavailable"
            state_path.write_bytes(valid_bundle_bytes)

            # Corrupt Grades is fail-closed for the oral exam and the receiving grade grid.
            valid_grades_bytes = grades_path.read_bytes()
            grades_path.write_bytes(b"{broken-grades-json")
            corrupt_grades_bytes = grades_path.read_bytes()
            corrupt_grades_mtime = grades_path.stat().st_mtime_ns
            status, corrupt_grades_state = request(base_url, "/api/basic-final-oral/state", token=teacher_token)
            assert status == 503 and corrupt_grades_state["error"] == "assessment_storage_unavailable"
            status, corrupt_grades_start = request(base_url, "/api/basic-final-oral/start", "POST", {"deviceId": "corrupt-grades-device"}, student_token)
            assert status == 503 and corrupt_grades_start["error"] == "assessment_storage_unavailable"
            status, corrupt_grades_health = request(base_url, "/api/basic-final-oral/health", token=teacher_token)
            assert status == 503 and corrupt_grades_health["error"] == "assessment_storage_unavailable"
            status, corrupt_grades_admin = request(
                base_url, "/api/basic-final-oral/student-action", "PUT",
                {"studentId": "S002", "action": "extend", "until": "2099-01-01T00:00:00Z", "reason": "Corruption regression"},
                teacher_token,
            )
            assert status == 503 and corrupt_grades_admin["error"] == "assessment_storage_unavailable"
            status, corrupt_grade_grid = request(base_url, "/api/basic/grades", token=student_token)
            assert status == 503 and corrupt_grade_grid["error"] == "assessment_storage_unavailable"
            assert grades_path.read_bytes() == corrupt_grades_bytes and grades_path.stat().st_mtime_ns == corrupt_grades_mtime
            grades_path.write_bytes(valid_grades_bytes)

            for _ in range(5):
                status, _bad_login = request(
                    base_url, "/api/basic/grades/login", "POST",
                    {"email": "other@example.com", "password": "incorrect-password"},
                )
                assert status == 401
            status, throttled = request(
                base_url, "/api/basic/grades/login", "POST",
                {"email": "other@example.com", "password": "incorrect-password"},
            )
            assert status == 429 and throttled["error"] == "too_many_login_attempts"
            for index in range(20):
                status, _rotated = request(
                    base_url, "/api/basic/grades/login", "POST",
                    {"email": "rotated-" + str(index) + "@example.com", "password": "incorrect-password"},
                )
                assert status == 401
            status, ip_throttled = request(
                base_url, "/api/basic/grades/login", "POST",
                {"email": "one-more-rotation@example.com", "password": "incorrect-password"},
            )
            assert status == 429 and ip_throttled["error"] == "too_many_login_attempts"
            current_time = time.time()
            API.BASIC_FINAL_ORAL_AUTH_ATTEMPTS.update({"bounded-test-" + str(index): [current_time] for index in range(5000)})
            API.local_login_prune_attempts(current_time)
            assert len(API.BASIC_FINAL_ORAL_AUTH_ATTEMPTS) <= 4096
        finally:
            server.shutdown()
            server.server_close()
            thread.join(timeout=5)

    now = API.datetime.now(API.timezone.utc)
    future = (now + API.timedelta(minutes=10)).isoformat().replace("+00:00", "Z")
    past = (now - API.timedelta(seconds=5)).isoformat().replace("+00:00", "Z")
    allowed, reason, _ = API.basic_final_oral_access({"isOpen": True, "opensAt": future, "eligibleStudentIds": []}, "S001", False, now)
    assert allowed is False and reason == "exam_not_open_yet"
    allowed, reason, _ = API.basic_final_oral_access({"isOpen": True, "closesAt": past, "closeMode": "hard", "graceSeconds": 60}, "S001", True, now)
    assert allowed is False and reason == "exam_expired"
    allowed, reason, _ = API.basic_final_oral_access({"isOpen": True, "closesAt": past, "closeMode": "soft", "graceSeconds": 60}, "S001", True, now)
    assert allowed is True and reason == "grace_period"
    allowed, reason, _ = API.basic_final_oral_access({"isOpen": True, "closesAt": past, "extensions": {"S001": future}}, "S001", False, now)
    assert allowed is True and reason == "open"

    print("PASS Basic Final Oral backend: strict identity/pairing, windows, leases, nonblocking audio-first persistence, tamper checks, workflow/outbox, revisioned grading, append-only audit, and fail-closed storage")


if __name__ == "__main__":
    main()
