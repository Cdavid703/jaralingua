#!/usr/bin/env python3
import importlib.util
import json
import os
import sys
import tempfile
import threading
import urllib.error
import urllib.request
from http.server import ThreadingHTTPServer
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SERVER_PATH = ROOT / "server" / "progress_api.py"


def load_progress_api(temp_dir):
    os.environ["JARALINGUA_GOOGLE_CLIENT_ID"] = "test-client"
    os.environ["JARALINGUA_PROGRESS_DATA"] = str(temp_dir / "progress.json")
    os.environ["JARALINGUA_INTERMEDIATE_ENGLISH_GRADES_DATA"] = str(temp_dir / "intermediate-grades.json")
    os.environ["JARALINGUA_LOCAL_AUTH_SECRET_PATH"] = str(temp_dir / "local-auth-secret")
    spec = importlib.util.spec_from_file_location("schedule_coach_progress_api", SERVER_PATH)
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


def request_json(base_url, path, method="GET", payload=None, token=""):
    headers = {}
    data = None
    if payload is not None:
        headers["Content-Type"] = "application/json"
        data = json.dumps(payload).encode("utf-8")
    if token:
        headers["Authorization"] = "Bearer " + token
        headers["X-Jaralingua-Auth-Provider"] = "local"
    request = urllib.request.Request(base_url + path, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(request, timeout=5) as response:
            return response.status, json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as error:
        return error.code, json.loads(error.read().decode("utf-8"))


def coach_payload(client_submission_id, metrics=None):
    stage_topics = [
        "Priorities and intentions",
        "Plans and confirmed arrangements",
        "Choose a schedule strategy",
        "Give advice",
        "Respond to a complication",
        "Adjust the plan",
        "Confirm the final agenda",
        "Ask a follow-up question",
    ]
    prompts = [
        "What is Olivia going to protect first, and why?",
        "Which events are confirmed arrangements, and which events are only plans?",
        "Which strategy did you choose, and why could it help Olivia?",
        "Give Olivia one clear piece of advice.",
        "The Friday photo session is still up in the air. What should Olivia do?",
        "What should Marcus put off, fit in, or free up?",
        "Confirm the final agenda.",
        "Ask Marcus one follow-up question.",
    ]
    answers = [
        "Olivia is going to protect the Wednesday recording session first because it is confirmed.",
        "She is recording on Wednesday, but the photo session is still up in the air.",
        "I chose Confirm the Final Agenda because everyone needs to be on the same page.",
        "She should put off the radio interview so she can free up Friday afternoon.",
        "Before she confirms it, she should check the final agenda and talk to the team.",
        "Marcus should fit in family dinner on Thursday and free up Friday afternoon.",
        "Olivia is recording on Wednesday, and she is going to rest before the weekend event.",
        "Could you confirm Friday afternoon so everyone is on the same page?",
    ]
    return {
        "clientSubmissionId": client_submission_id,
        "clientDate": "2026-07-23",
        "mode": "guided",
        "selectedStrategy": "Confirm the Final Agenda",
        "scheduleScenario": "The Friday photo session is still up in the air.",
        "metrics": metrics or {"task": 9, "interaction": 8, "language": 9, "fluency": 8, "clarity": 8},
        "analyzedCount": 8,
        "totalStages": 8,
        "stageScores": [43, 42, 44, 41, 40, 42, 43, 41],
        "turns": [
            {
                "stageIndex": index,
                "topic": stage_topics[index],
                "phase": "main",
                "prompt": prompts[index],
                "transcript": answers[index],
                "score": [43, 42, 44, 41, 40, 42, 43, 41][index],
            }
            for index in range(8)
        ],
    }


def main():
    with tempfile.TemporaryDirectory(prefix="jaralingua-schedule-coach-") as temp_path:
        temp_dir = Path(temp_path)
        grades_path = temp_dir / "intermediate-grades.json"
        grades_path.write_text(json.dumps({
            "adminEmails": [],
            "teacherEmails": [],
            "allowStudentIdClaim": True,
            "evaluations": [],
            "students": [{
                "id": "9106",
                "fullName": "Schedule Test Student",
                "level": "Intermediate English Course 1",
                "email": "schedule.student@example.com",
                "emailAliases": [],
                "localPassword": "9106*",
                "grades": {},
                "gradeDetails": {},
            }],
        }), encoding="utf-8")

        api = load_progress_api(temp_dir)
        api.ProgressHandler.log_message = lambda *args, **kwargs: None
        server = ThreadingHTTPServer(("127.0.0.1", 0), api.ProgressHandler)
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        base_url = "http://127.0.0.1:" + str(server.server_address[1])

        try:
            endpoint = "/api/intermediate/unit6-schedule-coach/submit"
            status, unauthorized = request_json(base_url, endpoint, "POST", coach_payload("schedule-no-auth-001"))
            assert status == 401, unauthorized

            status, login = request_json(base_url, "/api/intermediate/grades/login", "POST", {
                "email": "schedule.student@example.com",
                "password": "9106*",
            })
            assert status == 200, login
            token = login["token"]

            first_payload = coach_payload("schedule-submit-001")
            status, first = request_json(base_url, endpoint, "POST", first_payload, token)
            assert status == 200, first
            assert first["score"] == 42
            assert first["total"] == 50
            assert first["grade"] == 4.2
            assert first["attemptCount"] == 1
            assert first["weight"] == 0
            assert first["followUpOnly"] is True

            status, retry = request_json(base_url, endpoint, "POST", first_payload, token)
            assert status == 200, retry
            assert retry["idempotent"] is True
            assert retry["attemptCount"] == 1

            second_payload = coach_payload(
                "schedule-submit-002",
                {"task": 10, "interaction": 9, "language": 9, "fluency": 8, "clarity": 9},
            )
            status, second = request_json(base_url, endpoint, "POST", second_payload, token)
            assert status == 200, second
            assert second["score"] == 45
            assert second["grade"] == 4.5
            assert second["attemptCount"] == 2

            incomplete = coach_payload("schedule-submit-003")
            incomplete["turns"] = incomplete["turns"][:-1]
            status, incomplete_result = request_json(base_url, endpoint, "POST", incomplete, token)
            assert status == 400, incomplete_result
            assert incomplete_result["error"] == "incomplete_conversation"

            invalid_metrics = coach_payload("schedule-submit-004")
            invalid_metrics["metrics"]["clarity"] = 11
            status, invalid_result = request_json(base_url, endpoint, "POST", invalid_metrics, token)
            assert status == 400, invalid_result
            assert invalid_result["error"] == "invalid_metrics"

            status, grade_view = request_json(base_url, "/api/intermediate/grades", token=token)
            assert status == 200, grade_view
            evaluation = next(item for item in grade_view["evaluations"] if item["id"] == api.INTERMEDIATE_UNIT6_SCHEDULE_COACH_ID)
            assert evaluation["weight"] == 0
            assert grade_view["student"]["grades"][api.INTERMEDIATE_UNIT6_SCHEDULE_COACH_ID] == 4.5

            saved = json.loads(grades_path.read_text(encoding="utf-8"))
            student = saved["students"][0]
            detail = student["gradeDetails"][api.INTERMEDIATE_UNIT6_SCHEDULE_COACH_ID]
            assert student["grades"][api.INTERMEDIATE_UNIT6_SCHEDULE_COACH_ID] == 4.5
            assert detail["status"] == "submitted"
            assert detail["followUpOnly"] is True
            assert detail["doesNotAffectAverage"] is True
            assert detail["weight"] == 0
            assert detail["attemptCount"] == 2
            assert detail["clientSubmissionId"] == "schedule-submit-002"
            assert len(detail["submissionHistory"]) == 1
            assert "Stage 1 - Priorities and intentions" in detail["transcript"]
            assert "Stage 8 - Ask a follow-up question" in detail["transcript"]
            assert "Marcus:" in detail["transcript"]
            assert "Student:" in detail["transcript"]
            assert "audio" not in json.dumps(detail).lower()
            print("PASS Schedule Coach delivery: auth, eight stages, server grade, idempotency, resubmit, Grades visibility, weight 0, and no audio storage")
        finally:
            server.shutdown()
            server.server_close()
            thread.join(timeout=5)


if __name__ == "__main__":
    main()
