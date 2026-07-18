#!/usr/bin/env python3
import importlib.util
import json
import os
import re
import sys
import tempfile
import threading
import urllib.error
import urllib.request
from http.server import ThreadingHTTPServer
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SERVER_PATH = ROOT / "server" / "progress_api.py"
PAGE_PATH = ROOT / "ingles" / "intermediate" / "workshop-unit-5-global-snack-review.html"
AUDIO_SCRIPT_PATH = ROOT / "tools" / "generate_intermediate_unit5_snack_review_audio.ps1"
EVIDENCE_IMAGE_PATH = ROOT / "assets" / "img" / "english-intermediate" / "unit-5" / "workshop-global-snack-evidence-board-v1.webp"


def load_progress_api(temp_dir):
    os.environ["JARALINGUA_GOOGLE_CLIENT_ID"] = "test-client"
    os.environ["JARALINGUA_PROGRESS_DATA"] = str(temp_dir / "progress.json")
    os.environ["JARALINGUA_INTERMEDIATE_ENGLISH_GRADES_DATA"] = str(temp_dir / "intermediate-grades.json")
    os.environ["JARALINGUA_LOCAL_AUTH_SECRET_PATH"] = str(temp_dir / "local-auth-secret")
    spec = importlib.util.spec_from_file_location("snack_review_progress_api", SERVER_PATH)
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


def post_json(base_url, path, payload, token=""):
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = "Bearer " + token
        headers["X-Jaralingua-Auth-Provider"] = "local"
    request = urllib.request.Request(
        base_url + path,
        data=json.dumps(payload).encode("utf-8"),
        headers=headers,
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=5) as response:
            return response.status, json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as error:
        return error.code, json.loads(error.read().decode("utf-8"))


def main():
    page_html = PAGE_PATH.read_text(encoding="utf-8")
    page_text = " ".join(re.sub(r"<[^>]+>", " ", page_html).split())
    audio_script = AUDIO_SCRIPT_PATH.read_text(encoding="utf-8")
    expected_audio_scripts = [
        "This snack is made with corn flour, cheese, and a little oil.",
        "I would give it four out of five because it is crispy outside, soft inside, and not too heavy.",
        "It reminds me of street food because it is simple, warm, and easy to share.",
        (
            "I reviewed a small cheese arepa connected to Colombian street food. It is made with corn flour, "
            "cheese, a little butter, and some fresh sauce. I give it four out of five because it is warm, "
            "salty, crispy on the outside, and soft inside. One small arepa is enough for a light snack, but "
            "two pieces can feel filling. Culturally, it reminds me of food people buy on the way to school, "
            "work, or a family visit. I would compare it with other simple snacks because it is affordable, "
            "practical, and easy to share. I recommend it for a class food fair because students can describe "
            "its ingredients, texture, quantity, and cultural meaning clearly."
        ),
    ]
    for script in expected_audio_scripts:
        assert script in audio_script
        assert script in page_text
    assert page_html.count('class="workshop-stage"') == 4
    assert '<details class="workshop-stage" open' not in page_html
    assert page_html.count('data-speed="0.75"') == 4
    assert page_html.count('data-speed="1"') == 4
    assert page_html.count('data-speed="1.25"') == 4
    assert EVIDENCE_IMAGE_PATH.exists() and EVIDENCE_IMAGE_PATH.stat().st_size > 100_000

    with tempfile.TemporaryDirectory(prefix="jaralingua-snack-review-") as temp_path:
        temp_dir = Path(temp_path)
        grades_path = temp_dir / "intermediate-grades.json"
        grades_path.write_text(json.dumps({
            "adminEmails": [],
            "teacherEmails": [],
            "allowStudentIdClaim": True,
            "evaluations": [],
            "students": [{
                "id": "9001",
                "fullName": "Test Student",
                "level": "Intermediate English Course 1",
                "email": "test.student@example.com",
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
            status, login = post_json(base_url, "/api/intermediate/grades/login", {
                "email": "test.student@example.com",
                "password": "9001*",
            })
            assert status == 200, login
            token = login["token"]

            review = (
                "I reviewed a vegetable samosa connected to family celebrations in India. "
                "It is made with some potatoes, a few peas, warm spices, and a little oil. "
                "Two small pieces are enough for one serving, especially when they are served "
                "with a teaspoon of fresh sauce. The outside is crispy and light, while the "
                "inside is soft, mildly spicy, and filling. In my experience, it reminds me "
                "of Colombian empanadas because both snacks are practical to share, although "
                "their spices and pastry are different. I give it four out of five because "
                "the texture contrast is clear and the portion is satisfying. I recommend it "
                "to students who enjoy warm, savory snacks and want to compare food traditions respectfully."
            )
            payload = {
                "snackName": "Vegetable samosa",
                "origin": "Family celebrations in India",
                "rating": "4",
                "ingredients": "some potatoes, a few peas, warm spices, and a little oil",
                "sensoryNotes": "crispy, soft, mildly spicy, and filling",
                "servingNotes": "two small pieces with a teaspoon of sauce",
                "culturalNotes": "similar to Colombian empanadas but different in spices and pastry",
                "recommendationNotes": "recommended for students who enjoy savory snacks",
                "response": review,
                "clientSubmissionId": "snack-review-test-001",
                "clientDate": "2026-07-17",
            }

            status, first = post_json(base_url, "/api/intermediate/unit5-snack-review/submit", payload, token)
            assert status == 200, first
            assert first["attemptCount"] == 1
            assert first["weight"] == 0
            assert 100 <= first["wordCount"] <= 150

            status, retry = post_json(base_url, "/api/intermediate/unit5-snack-review/submit", payload, token)
            assert status == 200, retry
            assert retry["idempotent"] is True
            assert retry["attemptCount"] == 1

            second_payload = dict(payload)
            second_payload["clientSubmissionId"] = "snack-review-test-002"
            second_payload["response"] = review.replace("savory snacks", "savory global snacks")
            status, second = post_json(base_url, "/api/intermediate/unit5-snack-review/submit", second_payload, token)
            assert status == 200, second
            assert second["attemptCount"] == 2

            short_payload = dict(payload)
            short_payload["clientSubmissionId"] = "snack-review-test-003"
            short_payload["response"] = "This snack is made with some vegetables and a little oil."
            status, short_result = post_json(base_url, "/api/intermediate/unit5-snack-review/submit", short_payload, token)
            assert status == 400, short_result
            assert short_result["error"] == "text_too_short"

            saved = json.loads(grades_path.read_text(encoding="utf-8"))
            student = saved["students"][0]
            detail = student["gradeDetails"][api.INTERMEDIATE_UNIT5_SNACK_REVIEW_ID]
            evaluation = next(item for item in saved["evaluations"] if item["id"] == api.INTERMEDIATE_UNIT5_SNACK_REVIEW_ID)
            assert detail["status"] == "submitted"
            assert detail["followUpOnly"] is True
            assert detail["doesNotAffectAverage"] is True
            assert detail["clientSubmissionId"] == "snack-review-test-002"
            assert detail["attemptCount"] == 2
            assert len(detail["submissionHistory"]) == 1
            assert evaluation["weight"] == 0
            print("PASS Global Snack Review: image, audio scripts, closed stages, login, submit, idempotency, resubmit, limits, and weight 0")
        finally:
            server.shutdown()
            server.server_close()
            thread.join(timeout=5)


if __name__ == "__main__":
    main()
