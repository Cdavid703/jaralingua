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
    spec = importlib.util.spec_from_file_location("restaurant_coach_progress_api", SERVER_PATH)
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
        "Arrival and table",
        "Preferences and dietary needs",
        "Ask about the menu",
        "Place the order",
        "Resolve a service problem",
        "Request the check",
    ]
    prompts = [
        "Good evening. Do you have a reservation, and how many people are in your party?",
        "Does anyone at the table have allergies or dietary preferences?",
        "What would you like to know about the mushroom and spinach risotto?",
        "What would you like to order, and would you like any changes?",
        "I understand there is a problem with your side dish. What should I correct?",
        "Would you like the check together or separately?",
    ]
    answers = [
        "Good evening. I have a reservation under Lopez for two people.",
        "I do not have any allergies, but I prefer vegetarian food.",
        "What is the mushroom and spinach risotto made with, and how is it prepared?",
        "I would like one portion of risotto with the Parmesan on the side, please.",
        "Excuse me, I ordered wild rice, but I received fries. Could you bring the correct side?",
        "Could we have the check, please? We would like separate checks.",
    ]
    return {
        "clientSubmissionId": client_submission_id,
        "clientDate": "2026-07-21",
        "mode": "guided",
        "selectedDish": "Mushroom and Spinach Risotto",
        "serviceScenario": "The customer received fries instead of wild rice.",
        "metrics": metrics or {"task": 9, "interaction": 8, "language": 8, "fluency": 7, "clarity": 8},
        "analyzedCount": 6,
        "totalStages": 6,
        "stageScores": [40, 41, 42, 39, 40, 38],
        "turns": [
            {
                "stageIndex": index,
                "topic": stage_topics[index],
                "phase": "main",
                "prompt": prompts[index],
                "transcript": answers[index],
                "score": [40, 41, 42, 39, 40, 38][index],
            }
            for index in range(6)
        ],
    }


def main():
    with tempfile.TemporaryDirectory(prefix="jaralingua-restaurant-coach-") as temp_path:
        temp_dir = Path(temp_path)
        grades_path = temp_dir / "intermediate-grades.json"
        grades_path.write_text(json.dumps({
            "adminEmails": [],
            "teacherEmails": [],
            "allowStudentIdClaim": True,
            "evaluations": [],
            "students": [{
                "id": "9001",
                "fullName": "Restaurant Test Student",
                "level": "Intermediate English Course 1",
                "email": "restaurant.student@example.com",
                "emailAliases": [],
                "localPassword": "9001*",
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
            endpoint = "/api/intermediate/unit5-restaurant-coach/submit"
            status, unauthorized = request_json(base_url, endpoint, "POST", coach_payload("restaurant-no-auth-001"))
            assert status == 401, unauthorized

            status, login = request_json(base_url, "/api/intermediate/grades/login", "POST", {
                "email": "restaurant.student@example.com",
                "password": "9001*",
            })
            assert status == 200, login
            token = login["token"]

            first_payload = coach_payload("restaurant-submit-001")
            status, first = request_json(base_url, endpoint, "POST", first_payload, token)
            assert status == 200, first
            assert first["score"] == 40
            assert first["total"] == 50
            assert first["grade"] == 4
            assert first["attemptCount"] == 1
            assert first["weight"] == 0
            assert first["followUpOnly"] is True

            status, retry = request_json(base_url, endpoint, "POST", first_payload, token)
            assert status == 200, retry
            assert retry["idempotent"] is True
            assert retry["attemptCount"] == 1

            second_payload = coach_payload(
                "restaurant-submit-002",
                {"task": 10, "interaction": 9, "language": 9, "fluency": 8, "clarity": 9},
            )
            status, second = request_json(base_url, endpoint, "POST", second_payload, token)
            assert status == 200, second
            assert second["score"] == 45
            assert second["grade"] == 4.5
            assert second["attemptCount"] == 2

            incomplete = coach_payload("restaurant-submit-003")
            incomplete["turns"] = incomplete["turns"][:-1]
            status, incomplete_result = request_json(base_url, endpoint, "POST", incomplete, token)
            assert status == 400, incomplete_result
            assert incomplete_result["error"] == "incomplete_conversation"

            invalid_metrics = coach_payload("restaurant-submit-004")
            invalid_metrics["metrics"]["clarity"] = 11
            status, invalid_result = request_json(base_url, endpoint, "POST", invalid_metrics, token)
            assert status == 400, invalid_result
            assert invalid_result["error"] == "invalid_metrics"

            status, grade_view = request_json(base_url, "/api/intermediate/grades", token=token)
            assert status == 200, grade_view
            evaluation = next(item for item in grade_view["evaluations"] if item["id"] == api.INTERMEDIATE_UNIT5_RESTAURANT_COACH_ID)
            assert evaluation["weight"] == 0
            assert grade_view["student"]["grades"][api.INTERMEDIATE_UNIT5_RESTAURANT_COACH_ID] == 4.5

            saved = json.loads(grades_path.read_text(encoding="utf-8"))
            student = saved["students"][0]
            detail = student["gradeDetails"][api.INTERMEDIATE_UNIT5_RESTAURANT_COACH_ID]
            assert student["grades"][api.INTERMEDIATE_UNIT5_RESTAURANT_COACH_ID] == 4.5
            assert detail["status"] == "submitted"
            assert detail["followUpOnly"] is True
            assert detail["doesNotAffectAverage"] is True
            assert detail["weight"] == 0
            assert detail["attemptCount"] == 2
            assert detail["clientSubmissionId"] == "restaurant-submit-002"
            assert len(detail["submissionHistory"]) == 1
            assert "Stage 1 - Arrival and table" in detail["transcript"]
            assert "Stage 6 - Request the check" in detail["transcript"]
            assert "Student:" in detail["transcript"]
            assert "audio" not in json.dumps(detail).lower()
            print("PASS Restaurant Coach delivery: auth, six stages, server grade, idempotency, resubmit, Grades visibility, weight 0, and no audio storage")
        finally:
            server.shutdown()
            server.server_close()
            thread.join(timeout=5)


if __name__ == "__main__":
    main()
