#!/usr/bin/env python3
"""Focused tests for the secure French Niveau 8 final-exam backend."""

from __future__ import annotations

import importlib.util
import json
import os
import pathlib
import tempfile
import unittest
from datetime import datetime, timedelta, timezone


ROOT = pathlib.Path(__file__).resolve().parents[1]
os.environ.setdefault("JARALINGUA_LOCAL_AUTH_SECRET", "unit-test-french8-final-secret")


def load_api():
    path = ROOT / "server" / "progress_api.py"
    spec = importlib.util.spec_from_file_location("jaralingua_french8_final_tests", path)
    module = importlib.util.module_from_spec(spec)
    assert spec and spec.loader
    spec.loader.exec_module(module)
    return module


API = load_api()

EXAM = {
    "id": "french8-final-exam",
    "version": "niveau8-test-v1",
    "title": "Examen final - Niveau 8",
    "totalPoints": 2,
    "transcript": "Chronique test sur une ville intelligente et inclusive.",
    "sections": [{
        "id": "grammaire",
        "title": "Grammaire",
        "questions": [
            {
                "id": "g1",
                "type": "mcq",
                "prompt": "La ville aurait mieux fait de...",
                "options": ["consulter", "consultait", "consulte"],
                "answer": 0,
                "points": 1,
            },
            {
                "id": "g2",
                "type": "truefalse",
                "prompt": "Il est regrettable que les données aient été perdues.",
                "answer": True,
                "points": 1,
            },
        ],
    }],
}


class French8FinalExamBackendTests(unittest.TestCase):
    def runtime_config(self, root):
        root = pathlib.Path(root)
        grades_path = root / "grades.json"
        bundle_path = root / "bundle.json"
        store_path = root / "store.json"
        audio_path = root / "exam.mp3"
        audio_path.write_bytes(b"ID3" + (b"x" * 12000))
        grades = {
            "adminEmails": [],
            "teacherEmails": ["teacher@example.com"],
            "evaluations": [
                {"id": "coursework", "title": "Coursework", "weight": 80},
                {"id": "finalExam", "title": "Final", "weight": 20},
            ],
            "students": [{
                "id": "008",
                "fullName": "Ana",
                "email": "ana@example.com",
                "grades": {},
            }],
        }
        bundle = API.default_french8_final_exam_bundle()
        bundle["exam"] = EXAM
        store = {
            "submissions": {},
            "attempts": {},
            "preflight": {"008": {"audioReady": True, "audioCheckedAt": API.now_iso()}},
            "events": [],
        }
        for path, value in ((grades_path, grades), (bundle_path, bundle), (store_path, store)):
            path.write_text(json.dumps(value), encoding="utf-8")

        def read(path):
            return json.loads(path.read_text(encoding="utf-8"))

        def write(path, value):
            path.write_text(json.dumps(value), encoding="utf-8")

        return {
            "level": "french8",
            "gradesPath": str(grades_path),
            "readBundle": lambda: read(bundle_path),
            "writeBundle": lambda value: write(bundle_path, value),
            "readStore": lambda: read(store_path),
            "writeStore": lambda value: write(store_path, value),
            "audioPath": str(audio_path),
            "bundledAudioPath": str(audio_path),
            "evaluation": {"id": "finalExam", "title": "Final", "weight": 20},
            "ensureGrades": lambda _grades: False,
            "supportsSchedule": True,
        }

    def test_level_config_registers_secure_niveau8_runtime(self):
        config = API.final_exam_level_config("french8")
        self.assertEqual(config["gradesPath"], API.FRENCH8_GRADES_PATH)
        self.assertEqual(config["evaluation"]["id"], "finalExam")
        self.assertEqual(config["evaluation"]["weight"], 20)
        self.assertIs(config["ensureGrades"], API.ensure_french8_gradebook_structure)
        self.assertTrue(config["supportsSchedule"])

    def test_default_is_locked_and_public_state_exposes_safe_server_window(self):
        state = API.default_french8_final_exam_bundle()["state"]
        self.assertFalse(state["isOpen"])
        self.assertFalse(state["scheduleEnabled"])
        public = API.final_exam_public_state(state, "student", "008")
        self.assertFalse(public["accessEffective"])
        self.assertEqual(public["accessReason"], "closed_by_teacher")
        self.assertIsNone(public["opensAt"])
        self.assertIsNone(public["closesAt"])
        self.assertTrue(public["serverTime"].endswith("Z"))
        self.assertNotIn("openedBy", public)
        self.assertNotIn("scheduledBy", public)

    def test_schedule_boundaries_are_server_authoritative(self):
        state = API.default_french8_final_exam_bundle()["state"]
        state.update({
            "scheduleEnabled": True,
            "opensAt": "2026-07-22T14:00:00Z",
            "closesAt": "2026-07-22T16:00:00Z",
        })
        self.assertEqual(API.final_exam_schedule_status(state, "2026-07-22T13:59:59Z"), "scheduled")
        API.final_exam_refresh_schedule_state(state, "2026-07-22T13:59:59Z")
        self.assertFalse(state["isOpen"])

        self.assertEqual(API.final_exam_schedule_status(state, "2026-07-22T14:00:00Z"), "open")
        API.final_exam_refresh_schedule_state(state, "2026-07-22T15:00:00Z")
        self.assertTrue(state["isOpen"])
        self.assertEqual(state["openedAt"], "2026-07-22T14:00:00Z")

        self.assertEqual(API.final_exam_schedule_status(state, "2026-07-22T16:00:00Z"), "closed")
        API.final_exam_refresh_schedule_state(state, "2026-07-22T16:00:00Z")
        self.assertFalse(state["isOpen"])
        self.assertEqual(state["closedAt"], "2026-07-22T16:00:00Z")

    def test_programming_window_overrides_legacy_open_boolean_until_server_time(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            config = self.runtime_config(temp_dir)
            opens_at = datetime.now(timezone.utc) + timedelta(minutes=15)
            closes_at = opens_at + timedelta(minutes=90)
            status, result = API.final_exam_update_state(config, {"email": "teacher@example.com"}, {
                "isOpen": True,
                "opensAt": opens_at.isoformat().replace("+00:00", "Z"),
                "closesAt": closes_at.isoformat().replace("+00:00", "Z"),
                "durationMinutes": 75,
            })
            self.assertEqual(status, 200)
            state = result["state"]
            self.assertTrue(state["scheduleEnabled"])
            self.assertEqual(state["scheduleStatus"], "scheduled")
            self.assertFalse(state["isOpen"])
            self.assertFalse(state["accessEffective"])
            self.assertEqual(state["accessReason"], "before_scheduled_open")
            self.assertEqual(state["durationMinutes"], 75)

            stored = config["readBundle"]
            stored_state = stored()["state"]
            self.assertTrue(stored_state["scheduleEnabled"])
            self.assertEqual(stored_state["opensAt"], state["opensAt"])
            self.assertEqual(stored_state["closesAt"], state["closesAt"])

    def test_open_now_clears_a_future_schedule(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            config = self.runtime_config(temp_dir)
            bundle = config["readBundle"]()
            bundle["state"].update({
                "scheduleEnabled": True,
                "opensAt": (datetime.now(timezone.utc) + timedelta(hours=2)).isoformat(),
                "closesAt": (datetime.now(timezone.utc) + timedelta(hours=4)).isoformat(),
            })
            config["writeBundle"](bundle)
            status, result = API.final_exam_update_state(config, {"email": "teacher@example.com"}, {
                "isOpen": True,
                "opensAt": None,
                "closesAt": None,
                "durationMinutes": 90,
            })
            self.assertEqual(status, 200)
            state = result["state"]
            self.assertTrue(state["isOpen"])
            self.assertFalse(state["scheduleEnabled"])
            self.assertIsNone(state["opensAt"])
            self.assertIsNone(state["closesAt"])
            self.assertEqual(state["accessReason"], "opened_by_teacher")

    def test_close_now_preserves_active_attempt_confirmation(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            config = self.runtime_config(temp_dir)
            bundle = config["readBundle"]()
            bundle["state"].update({"isOpen": True, "openedAt": API.now_iso()})
            config["writeBundle"](bundle)
            grades = json.loads(pathlib.Path(config["gradesPath"]).read_text(encoding="utf-8"))
            attempt = API.final_exam_create_attempt(EXAM, bundle["state"], grades["students"][0])
            store = config["readStore"]()
            store["attempts"]["008"] = attempt
            config["writeStore"](store)

            status, result = API.final_exam_update_state(
                config, {"email": "teacher@example.com"}, {"isOpen": False}
            )
            self.assertEqual(status, 409)
            self.assertEqual(result["error"], "active_attempts")
            self.assertTrue(config["readBundle"]()["state"]["isOpen"])
            self.assertNotIn("008", config["readStore"]()["submissions"])

            status, result = API.final_exam_update_state(config, {"email": "teacher@example.com"}, {
                "isOpen": False,
                "confirmClose": True,
            })
            self.assertEqual(status, 200)
            self.assertFalse(result["state"]["isOpen"])
            submission = config["readStore"]()["submissions"]["008"]
            self.assertTrue(submission["autoSubmitted"])
            self.assertEqual(submission["completionReason"], "teacher_closed")

    def test_scheduled_close_auto_submits_an_active_attempt(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            config = self.runtime_config(temp_dir)
            bundle = config["readBundle"]()
            bundle["state"].update({
                "isOpen": False,
                "scheduleEnabled": True,
                "opensAt": "2020-01-01T12:00:00Z",
                "closesAt": "2020-01-01T13:00:00Z",
            })
            grades = json.loads(pathlib.Path(config["gradesPath"]).read_text(encoding="utf-8"))
            attempt = API.final_exam_create_attempt(EXAM, bundle["state"], grades["students"][0])
            store = config["readStore"]()
            store["attempts"]["008"] = attempt

            changed, grades_changed = API.final_exam_finalize_due_attempts(
                config, grades, bundle, store
            )
            self.assertTrue(changed)
            self.assertTrue(grades_changed)
            self.assertIn("finalExam", grades["students"][0]["grades"])
            submission = store["submissions"]["008"]
            self.assertTrue(submission["autoSubmitted"])
            self.assertEqual(submission["completionReason"], "scheduled_closed")

    def test_student_timer_is_capped_by_the_scheduled_close(self):
        state = API.default_french8_final_exam_bundle()["state"]
        now = datetime.now(timezone.utc)
        closes_at = now + timedelta(minutes=20)
        state.update({
            "isOpen": True,
            "scheduleEnabled": True,
            "opensAt": (now - timedelta(minutes=5)).isoformat(),
            "closesAt": closes_at.isoformat(),
            "durationMinutes": 90,
        })
        attempt = {
            "startedAt": now.isoformat(),
            "status": "in_progress",
        }
        timing = API.final_exam_attempt_timing(state, attempt, "008")
        self.assertTrue(timing["scheduleLimited"])
        self.assertEqual(timing["deadlineAt"], API.final_exam_iso_utc(closes_at))
        self.assertGreater(timing["remainingSeconds"], 19 * 60)
        self.assertLessEqual(timing["remainingSeconds"], 20 * 60)

    def test_secure_session_draft_submit_round_trip_uses_niveau8_scope(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            config = self.runtime_config(temp_dir)
            bundle = config["readBundle"]()
            bundle["state"].update({"isOpen": True, "openedAt": API.now_iso()})
            config["writeBundle"](bundle)
            profile = {
                "sub": "google-ana",
                "email": "ana@example.com",
                "name": "Ana",
                "provider": "google",
            }

            status, session = API.final_exam_session_action(config, profile, {})
            self.assertEqual(status, 200)
            self.assertEqual(session["examAccessUser"]["level"], "french8")
            token_profile = API.validate_local_token(session["examAccessToken"])
            self.assertEqual(token_profile["examLevel"], "french8")
            self.assertEqual(token_profile["examAttemptId"], session["attemptId"])

            status, draft = API.final_exam_put_draft(config, profile, {
                "attemptId": session["attemptId"],
                "examVersion": EXAM["version"],
                "revision": 0,
                "answers": {"g1": 0},
            })
            self.assertEqual(status, 200)
            self.assertEqual(draft["revision"], 1)
            self.assertEqual(draft["answeredCount"], 1)
            self.assertEqual(draft["savedAt"], config["readStore"]()["attempts"]["008"]["draftUpdatedAt"])

            status, submitted = API.final_exam_submit_action(config, profile, {
                "attemptId": session["attemptId"],
                "examVersion": EXAM["version"],
                "revision": 1,
                "answers": {"g1": 0, "g2": True},
            })
            self.assertEqual(status, 200)
            self.assertTrue(submitted["ok"])
            self.assertTrue(submitted["result"]["receiptCode"].startswith("JLF-"))
            self.assertFalse(submitted["result"]["resultReleased"])
            self.assertNotIn("grade", submitted["result"])
            stored_submission = config["readStore"]()["submissions"]["008"]
            self.assertEqual(stored_submission["grade"], 5.0)

    def test_audio_requires_open_window_but_not_an_active_attempt(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            config = self.runtime_config(temp_dir)
            bundle = config["readBundle"]()
            store = config["readStore"]()
            grades = json.loads(pathlib.Path(config["gradesPath"]).read_text(encoding="utf-8"))
            student = grades["students"][0]

            status, error = API.final_exam_audio_access_error(
                "student", student, bundle, store, require_active_attempt=False
            )
            self.assertEqual(status, 403)
            self.assertEqual(error["error"], "exam_closed")

            bundle["state"].update({"isOpen": True, "openedAt": API.now_iso()})
            self.assertIsNone(API.final_exam_audio_access_error(
                "student", student, bundle, store, require_active_attempt=False
            ))

            store["submissions"]["008"] = {"completionReason": "manual"}
            self.assertIsNone(API.final_exam_audio_access_error(
                "student", student, bundle, store, require_active_attempt=False
            ))

            current = datetime.now(timezone.utc)
            bundle["state"].update({
                "scheduleEnabled": True,
                "opensAt": (current - timedelta(minutes=5)).isoformat(),
                "closesAt": (current + timedelta(minutes=5)).isoformat(),
            })
            self.assertIsNone(API.final_exam_audio_access_error(
                "student", student, bundle, store, require_active_attempt=False
            ))

            bundle["state"].update({
                "scheduleEnabled": True,
                "opensAt": "2099-07-22T15:00:00Z",
                "closesAt": "2099-07-22T16:00:00Z",
            })
            status, error = API.final_exam_audio_access_error(
                "student", student, bundle, store, require_active_attempt=False
            )
            self.assertEqual(status, 403)
            self.assertEqual(error["error"], "exam_closed")

    def test_audio_route_uses_authenticated_grant_issuance_or_bearer_fallback(self):
        source = (ROOT / "server" / "progress_api.py").read_text(encoding="utf-8")
        do_get = source.index("    def do_GET(self):")
        auth_gate = source.index("profile = self.require_user()", do_get)
        capability_block = source[do_get:auth_gate]
        self.assertIn('parsed.path == "/api/french8/final-exam/audio"', capability_block)
        self.assertIn("if grant:", capability_block)
        self.assertIn("french8_final_exam_validate_audio_grant", capability_block)
        self.assertIn("consume_french8_final_exam_rate", capability_block)
        self.assertIn('parsed.path == "/api/french8/final-exam/audio-grant"', source[auth_gate:])
        self.assertIn("require_active_attempt=False", source[auth_gate:])

    def test_invalid_or_elapsed_windows_are_rejected(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            config = self.runtime_config(temp_dir)
            status, result = API.final_exam_update_state(config, {"email": "teacher@example.com"}, {
                "isOpen": True,
                "opensAt": "2026-07-22T16:00:00Z",
                "closesAt": "2026-07-22T15:00:00Z",
            })
            self.assertEqual(status, 400)
            self.assertEqual(result["error"], "invalid_schedule")

    def test_routes_and_bridge_scope_include_niveau8(self):
        source = (ROOT / "server" / "progress_api.py").read_text(encoding="utf-8")
        self.assertIn("french1|french2|french8", source)
        self.assertIn("runtime_french8_core_match", source)
        profile = {"tokenPurpose": "final-exam", "examLevel": "french8"}
        base = "/api/french8/final-exam"
        for method, path in (
            ("GET", base),
            ("GET", base + "/state"),
            ("GET", base + "/audio"),
            ("GET", base + "/audio-grant"),
            ("GET", base + "/draft"),
            ("GET", base + "/events"),
            ("POST", base + "/session"),
            ("POST", base + "/submit"),
            ("PUT", base + "/draft"),
        ):
            self.assertTrue(API.final_exam_bridge_route_allowed(profile, path, method))
        self.assertFalse(API.final_exam_bridge_route_allowed(profile, base + "/monitor", "GET"))
        self.assertFalse(API.final_exam_bridge_route_allowed(profile, base + "/state", "PUT"))


if __name__ == "__main__":
    unittest.main(verbosity=2)
