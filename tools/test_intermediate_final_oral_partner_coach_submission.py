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
    spec = importlib.util.spec_from_file_location("final_oral_partner_progress_api", SERVER_PATH)
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
    topics = [
        "Choose and present your problem",
        "Answer Sophie's first follow-up",
        "Answer Sophie's second follow-up",
        "React to advice and choose",
        "Ask Sophie follow-up questions",
        "Give Sophie advice",
        "Make a joint decision",
        "Close the oral task",
    ]
    prompts = [
        "Choose one problem card and explain your problem clearly.",
        "What is the biggest cause of the problem right now?",
        "What do you think will happen if you follow good advice?",
        "Which suggestion is best for you, and why?",
        "I freeze when I have to speak English. Ask me two follow-up questions.",
        "Now give me advice with two final oral expressions.",
        "Which advice should we both follow this week?",
        "Summarize our problems and next steps.",
    ]
    answers = [
        "I chose English Learning Difficulty because I understand grammar, but speaking naturally is difficult.",
        "The biggest cause is confidence because I feel nervous when I have to answer quickly.",
        "If I follow good advice, I will practice short answers every day and speak more calmly.",
        "The best suggestion is recording myself because I can notice mistakes and improve little by little.",
        "How often do you practice speaking? What happens when you forget a simple word?",
        "If I were you, I would practice one short answer every day. You could also repeat useful expressions.",
        "We should both practice small realistic routines this week because that would help us improve.",
        "I will practice English speaking, and Sophie will prepare short answers before class.",
    ]
    return {
        "clientSubmissionId": client_submission_id,
        "clientDate": "2026-07-24",
        "mode": "guided",
        "selectedProblem": "English Learning Difficulty",
        "partnerProblem": "I freeze when I have to speak in English and forget simple words.",
        "metrics": metrics or {"task": 9, "interaction": 9, "language": 8, "fluency": 8, "clarity": 8},
        "analyzedCount": 8,
        "totalStages": 8,
        "stageScores": [44, 43, 42, 41, 44, 43, 42, 41],
        "turns": [
            {
                "stageIndex": index,
                "topic": topics[index],
                "phase": "main",
                "prompt": prompts[index],
                "transcript": answers[index],
                "score": [44, 43, 42, 41, 44, 43, 42, 41][index],
            }
            for index in range(8)
        ],
    }


def main():
    with tempfile.TemporaryDirectory(prefix="jaralingua-final-oral-partner-") as temp_path:
        temp_dir = Path(temp_path)
        grades_path = temp_dir / "intermediate-grades.json"
        grades_path.write_text(json.dumps({
            "adminEmails": [],
            "teacherEmails": [],
            "allowStudentIdClaim": True,
            "evaluations": [],
            "students": [{
                "id": "9206",
                "fullName": "Final Oral Test Student",
                "level": "Intermediate English Course 1",
                "email": "final.oral.student@example.com",
                "emailAliases": [],
                "localPassword": "9206*",
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
            endpoint = "/api/intermediate/final-oral-partner-coach/submit"
            status, unauthorized = request_json(base_url, endpoint, "POST", coach_payload("oral-no-auth-001"))
            assert status == 401, unauthorized

            status, login = request_json(base_url, "/api/intermediate/grades/login", "POST", {
                "email": "final.oral.student@example.com",
                "password": "9206*",
            })
            assert status == 200, login
            token = login["token"]

            first_payload = coach_payload("oral-submit-001")
            status, first = request_json(base_url, endpoint, "POST", first_payload, token)
            assert status == 200, first
            assert first["score"] == 42
            assert first["total"] == 50
            assert first["grade"] == 4.2
            assert first["attemptCount"] == 1
            assert first["weight"] == 0
            assert first["followUpOnly"] is True
            assert first["gradebookExcluded"] is True

            status, retry = request_json(base_url, endpoint, "POST", first_payload, token)
            assert status == 200, retry
            assert retry["idempotent"] is True
            assert retry["attemptCount"] == 1

            second_payload = coach_payload(
                "oral-submit-002",
                {"task": 10, "interaction": 9, "language": 9, "fluency": 9, "clarity": 8},
            )
            status, second = request_json(base_url, endpoint, "POST", second_payload, token)
            assert status == 200, second
            assert second["score"] == 45
            assert second["grade"] == 4.5
            assert second["attemptCount"] == 2

            incomplete = coach_payload("oral-submit-003")
            incomplete["stageScores"] = incomplete["stageScores"][:-1]
            status, incomplete_result = request_json(base_url, endpoint, "POST", incomplete, token)
            assert status == 400, incomplete_result
            assert incomplete_result["error"] == "incomplete_conversation"

            invalid_metrics = coach_payload("oral-submit-004")
            invalid_metrics["metrics"]["task"] = -1
            status, invalid_result = request_json(base_url, endpoint, "POST", invalid_metrics, token)
            assert status == 400, invalid_result
            assert invalid_result["error"] == "invalid_metrics"

            saved = json.loads(grades_path.read_text(encoding="utf-8"))
            student = saved["students"][0]
            assert api.INTERMEDIATE_FINAL_ORAL_PARTNER_COACH_ID not in student.get("grades", {})
            assert api.INTERMEDIATE_FINAL_ORAL_PARTNER_COACH_ID not in student.get("gradeDetails", {})
            detail = student["teacherFollowUps"][api.INTERMEDIATE_FINAL_ORAL_PARTNER_COACH_ID]
            assert detail["status"] == "submitted"
            assert detail["followUpOnly"] is True
            assert detail["gradebookExcluded"] is True
            assert detail["doesNotAffectAverage"] is True
            assert detail["weight"] == 0
            assert detail["attemptCount"] == 2
            assert detail["clientSubmissionId"] == "oral-submit-002"
            assert len(detail["submissionHistory"]) == 1
            assert "Stage 1 - Present your problem" in detail["transcript"]
            assert "Stage 8 - Close the oral task" in detail["transcript"]
            assert "Sophie:" in detail["transcript"]
            assert "Student:" in detail["transcript"]
            assert "audio" not in json.dumps(detail).lower()
            print("PASS Final Oral Partner Coach delivery: auth, idempotency, resubmit, teacherFollowUps storage, no gradebook column, and no audio storage")
        finally:
            server.shutdown()
            server.server_close()
            thread.join(timeout=5)


if __name__ == "__main__":
    main()
