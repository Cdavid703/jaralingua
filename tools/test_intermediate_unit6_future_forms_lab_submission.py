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
    spec = importlib.util.spec_from_file_location("future_forms_lab_progress_api", SERVER_PATH)
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


def main():
    with tempfile.TemporaryDirectory(prefix="jaralingua-u6-future-forms-") as temp_path:
        temp_dir = Path(temp_path)
        grades_path = temp_dir / "intermediate-grades.json"
        grades_path.write_text(json.dumps({
            "adminEmails": [],
            "teacherEmails": [],
            "allowStudentIdClaim": True,
            "evaluations": [],
            "students": [{
                "id": "9306",
                "fullName": "Future Forms Test Student",
                "level": "Intermediate English Course 1",
                "email": "future.forms.student@example.com",
                "emailAliases": [],
                "localPassword": "9306*",
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
            endpoint = "/api/intermediate/unit6-future-forms-decision-lab/submit"
            answer_key = [1, 3, 0, 2, 3, 1, 0, 2, 1, 3, 2, 0]

            status, unauthorized = request_json(base_url, endpoint, "POST", {"answers": answer_key})
            assert status == 401, unauthorized

            status, login = request_json(base_url, "/api/intermediate/grades/login", "POST", {
                "email": "future.forms.student@example.com",
                "password": "9306*",
            })
            assert status == 200, login
            token = login["token"]

            status, first = request_json(base_url, endpoint, "POST", {"answers": answer_key, "clientDate": "2026-07-24"}, token)
            assert status == 200, first
            assert first["score"] == 12
            assert first["total"] == 12
            assert first["grade"] == 5
            assert first["incorrectQuestions"] == []
            assert first["weight"] == 0
            assert first["followUpOnly"] is True

            second_answers = answer_key[:]
            second_answers[0] = 0
            second_answers[4] = 0
            status, second = request_json(base_url, endpoint, "POST", {"answers": second_answers}, token)
            assert status == 200, second
            assert second["score"] == 10
            assert second["grade"] == 4.17
            assert second["incorrectQuestions"] == [1, 5]
            assert second["attemptCount"] == 2

            status, invalid = request_json(base_url, endpoint, "POST", {"answers": second_answers[:-1]}, token)
            assert status == 400, invalid
            assert invalid["error"] == "incomplete_answers"

            saved = json.loads(grades_path.read_text(encoding="utf-8"))
            student = saved["students"][0]
            assert student["grades"][api.INTERMEDIATE_UNIT6_FUTURE_FORMS_LAB_ID] == 4.17
            detail = student["gradeDetails"][api.INTERMEDIATE_UNIT6_FUTURE_FORMS_LAB_ID]
            assert detail["weight"] == 0
            assert detail["doesNotAffectAverage"] is True
            assert detail["followUpOnly"] is True
            assert detail["attemptCount"] == 2
            assert detail["incorrectQuestions"] == [1, 5]
            print("PASS Unit 6 Future Forms Decision Lab backend: auth, scoring, attempts, and weight 0.")
        finally:
            server.shutdown()
            server.server_close()
            thread.join(timeout=5)


if __name__ == "__main__":
    main()
