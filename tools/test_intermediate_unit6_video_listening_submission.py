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
    spec = importlib.util.spec_from_file_location("unit6_video_listening_progress_api", SERVER_PATH)
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


def submit_payload(answers):
    return {
        "answers": answers,
        "clientDate": "2026-07-23",
        "videoStatus": "youtube-link-pending",
        "youtubeVideoId": "",
    }


def main():
    with tempfile.TemporaryDirectory(prefix="jaralingua-unit6-video-listening-") as temp_path:
        temp_dir = Path(temp_path)
        grades_path = temp_dir / "intermediate-grades.json"
        grades_path.write_text(json.dumps({
            "adminEmails": [],
            "teacherEmails": ["teacher.video@example.com"],
            "allowStudentIdClaim": True,
            "evaluations": [],
            "students": [
                {
                    "id": "9201",
                    "fullName": "Video Listening Student",
                    "level": "Intermediate English Course 1",
                    "email": "video.student@example.com",
                    "emailAliases": [],
                    "localPassword": "9201*",
                    "grades": {},
                    "gradeDetails": {},
                },
                {
                    "id": "9202",
                    "fullName": "Video Listening Teacher",
                    "level": "Intermediate English Course 1",
                    "email": "teacher.video@example.com",
                    "emailAliases": [],
                    "localPassword": "9202*",
                    "grades": {},
                    "gradeDetails": {},
                },
            ],
        }), encoding="utf-8")

        api = load_progress_api(temp_dir)
        api.ProgressHandler.log_message = lambda *args, **kwargs: None
        server = ThreadingHTTPServer(("127.0.0.1", 0), api.ProgressHandler)
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        base_url = "http://127.0.0.1:" + str(server.server_address[1])

        try:
            endpoint = "/api/intermediate/unit6-video-listening/submit"
            correct_answers = [1, 2, 0, 2, 1, 0, 2, 1, 0, 2]

            status, unauthorized = request_json(base_url, endpoint, "POST", submit_payload(correct_answers))
            assert status == 401, unauthorized

            status, login = request_json(base_url, "/api/intermediate/grades/login", "POST", {
                "email": "video.student@example.com",
                "password": "9201*",
            })
            assert status == 200, login
            student_token = login["token"]

            status, student_transcript = request_json(base_url, "/api/intermediate/unit6-video-listening/transcript", token=student_token)
            assert status == 403, student_transcript
            assert student_transcript["error"] == "teacher_only"

            status, teacher_login = request_json(base_url, "/api/intermediate/grades/login", "POST", {
                "email": "teacher.video@example.com",
                "password": "9202*",
            })
            assert status == 200, teacher_login
            status, teacher_transcript = request_json(base_url, "/api/intermediate/unit6-video-listening/transcript", token=teacher_login["token"])
            assert status == 200, teacher_transcript
            assert teacher_transcript["title"] == "Olivia's Week in 90 Seconds"
            assert "Marcus:" in teacher_transcript["transcript"]
            assert "Olivia:" in teacher_transcript["transcript"]

            status, first = request_json(base_url, endpoint, "POST", submit_payload(correct_answers), student_token)
            assert status == 200, first
            assert first["score"] == 10
            assert first["total"] == 10
            assert first["grade"] == 5
            assert first["attemptCount"] == 1
            assert first["weight"] == 0
            assert first["followUpOnly"] is True
            assert first["incorrectQuestions"] == []

            second_answers = [1, 2, 0, 0, 1, 0, 2, 1, 0, 2]
            status, second = request_json(base_url, endpoint, "POST", submit_payload(second_answers), student_token)
            assert status == 200, second
            assert second["score"] == 9
            assert second["grade"] == 4.5
            assert second["attemptCount"] == 2
            assert second["incorrectQuestions"] == [4]

            status, incomplete = request_json(base_url, endpoint, "POST", submit_payload([1, 2]), student_token)
            assert status == 400, incomplete
            assert incomplete["error"] == "incomplete_answers"

            status, invalid = request_json(base_url, endpoint, "POST", submit_payload([1, 2, 0, 2, 1, 0, 2, 1, 0, 9]), student_token)
            assert status == 400, invalid
            assert invalid["error"] == "invalid_answers"

            status, grade_view = request_json(base_url, "/api/intermediate/grades", token=student_token)
            assert status == 200, grade_view
            evaluation = next(item for item in grade_view["evaluations"] if item["id"] == api.INTERMEDIATE_UNIT6_VIDEO_LISTENING_ID)
            assert evaluation["weight"] == 0
            assert grade_view["student"]["grades"][api.INTERMEDIATE_UNIT6_VIDEO_LISTENING_ID] == 4.5

            saved = json.loads(grades_path.read_text(encoding="utf-8"))
            student = saved["students"][0]
            detail = student["gradeDetails"][api.INTERMEDIATE_UNIT6_VIDEO_LISTENING_ID]
            assert student["grades"][api.INTERMEDIATE_UNIT6_VIDEO_LISTENING_ID] == 4.5
            assert detail["status"] == "submitted"
            assert detail["followUpOnly"] is True
            assert detail["doesNotAffectAverage"] is True
            assert detail["weight"] == 0
            assert detail["attemptCount"] == 2
            assert detail["videoStatus"] == "youtube-link-pending"
            assert detail["activity"] == "Olivia's Week in 90 Seconds"
            assert detail["activityType"] == "Video listening follow-up"
            print("PASS Unit 6 video listening delivery: auth, transcript roles, grading, resubmit, Grades visibility, and weight 0")
        finally:
            server.shutdown()
            server.server_close()
            thread.join(timeout=5)


if __name__ == "__main__":
    main()
