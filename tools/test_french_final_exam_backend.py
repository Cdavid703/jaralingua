#!/usr/bin/env python3
"""Focused, server-free tests for the French N1/N2 final-exam backend."""

from __future__ import annotations

import importlib.util
import json
import os
import pathlib
import tempfile
import time
import unittest


ROOT = pathlib.Path(__file__).resolve().parents[1]
os.environ.setdefault("JARALINGUA_LOCAL_AUTH_SECRET", "unit-test-final-exam-secret")


def load_api():
    path = ROOT / "server" / "progress_api.py"
    spec = importlib.util.spec_from_file_location("jaralingua_exam_backend_tests", path)
    module = importlib.util.module_from_spec(spec)
    assert spec and spec.loader
    spec.loader.exec_module(module)
    return module


API = load_api()


EXAM = {
    "id": "french-test-final",
    "version": "test-v1",
    "totalPoints": 2,
    "transcript": "Bonjour. Ceci est une transcription de test.",
    "sections": [{
        "id": "vocabulaire",
        "title": "Vocabulaire",
        "questions": [
            {"id": "q1", "type": "mcq", "prompt": "Un lieu", "options": ["parc", "lit", "bus"], "answer": 0, "points": 1},
            {"id": "q2", "type": "truefalse", "prompt": "Une phrase", "answer": True, "points": 1},
        ],
    }],
}


def legacy_french2_grades(final_weight=0):
    evaluations = [
        {"id": "comprehension", "weight": 20},
        {"id": "grammaire", "weight": 30},
        {"id": "production-ecrite", "weight": 20},
        {"id": "pronunciationTheme1", "weight": 5},
        {"id": "pronunciationTheme3", "weight": 5},
        {"id": "pronunciationTheme5", "weight": 5},
        {"id": "pronunciationTheme7", "weight": 5},
        {"id": "projet-final", "weight": 10},
    ]
    if final_weight is not None:
        evaluations.append({"id": "finalExam", "weight": final_weight})
    return {"evaluations": evaluations, "students": []}


class FinalExamBackendTests(unittest.TestCase):
    def runtime_config(self, root, level="french1"):
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
            "students": [{"id": "001", "fullName": "Ana", "email": "ana@example.com", "grades": {}}],
        }
        bundle = API.default_french1_final_exam_bundle()
        bundle["state"].update({"isOpen": True, "openedAt": API.now_iso()})
        bundle["exam"] = EXAM
        store = {
            "submissions": {},
            "attempts": {},
            "preflight": {"001": {"audioReady": True, "audioCheckedAt": API.now_iso()}},
            "events": [],
        }
        for path, value in ((grades_path, grades), (bundle_path, bundle), (store_path, store)):
            path.write_text(json.dumps(value), encoding="utf-8")

        def read(path):
            return json.loads(path.read_text(encoding="utf-8"))

        def write(path, value):
            path.write_text(json.dumps(value), encoding="utf-8")

        return {
            "level": level,
            "gradesPath": str(grades_path),
            "readBundle": lambda: read(bundle_path),
            "writeBundle": lambda value: write(bundle_path, value),
            "readStore": lambda: read(store_path),
            "writeStore": lambda value: write(store_path, value),
            "audioPath": str(audio_path),
            "bundledAudioPath": str(audio_path),
            "evaluation": {"id": "finalExam", "title": "Final", "weight": 20},
            "ensureGrades": lambda _grades: False,
        }

    def test_default_runtime_state_is_safe(self):
        for factory in (API.default_french1_final_exam_bundle, API.default_french2_final_exam_bundle):
            state = factory()["state"]
            self.assertEqual(state["durationMinutes"], 90)
            self.assertFalse(state["releaseResults"])
            self.assertEqual(state["extraMinutesByStudent"], {})

    def test_french2_legacy_weighting_migrates_once(self):
        grades = legacy_french2_grades(0)
        self.assertTrue(API.migrate_french2_final_exam_weights(grades))
        weights = {item["id"]: item["weight"] for item in grades["evaluations"]}
        self.assertEqual(weights["comprehension"], 10)
        self.assertEqual(weights["grammaire"], 20)
        self.assertEqual(weights["finalExam"], 20)
        self.assertEqual(sum(weights.values()), 100)
        self.assertFalse(API.migrate_french2_final_exam_weights(grades))

        without_final = legacy_french2_grades(None)
        self.assertTrue(API.migrate_french2_final_exam_weights(without_final))
        migrated = {item["id"]: item["weight"] for item in without_final["evaluations"]}
        self.assertEqual(migrated["finalExam"], 20)
        self.assertEqual(sum(migrated.values()), 100)

    def test_french2_custom_weighting_is_never_overwritten(self):
        grades = legacy_french2_grades(0)
        grades["evaluations"][0]["weight"] = 15
        before = [dict(item) for item in grades["evaluations"]]
        self.assertFalse(API.migrate_french2_final_exam_weights(grades))
        self.assertEqual(grades["evaluations"], before)

    def test_presentation_has_frontend_compatible_stable_aliases(self):
        first = API.final_exam_presentation(EXAM, 123456)
        second = API.final_exam_presentation(EXAM, 123456)
        self.assertEqual(first, second)
        self.assertIn("vocabulaire", first["questions"])
        self.assertIn("q1", first["options"])
        self.assertEqual(sorted(first["options"]["q1"]), [0, 1, 2])

    def test_student_state_does_not_leak_other_extensions(self):
        state = {
            "isOpen": True,
            "durationMinutes": 90,
            "releaseResults": False,
            "extraMinutesByStudent": {"001": 10, "002": 30},
        }
        public = API.final_exam_public_state(state, "student", "001")
        self.assertEqual(public["extraMinutes"], 10)
        self.assertNotIn("extraMinutesByStudent", public)

    def test_receipt_is_visible_while_grade_remains_hidden(self):
        submission = {
            "studentId": "001", "studentName": "Ana", "grade": 4.5,
            "scorePoints": 45, "totalPoints": 50, "receiptCode": "JLF-TEST",
            "submittedAt": "2026-07-20T12:00:00Z", "examVersion": "v1",
        }
        hidden = API.french1_final_exam_submission_public(submission, {"releaseResults": False})
        self.assertEqual(hidden["receiptCode"], "JLF-TEST")
        self.assertFalse(hidden["resultReleased"])
        self.assertNotIn("grade", hidden)
        released = API.french1_final_exam_submission_public(submission, {"releaseResults": True})
        self.assertEqual(released["grade"], 4.5)

    def test_monitor_contains_no_answer_payload(self):
        config = {"audioPath": "", "bundledAudioPath": ""}
        grades = {"evaluations": [], "students": [{"id": "001", "fullName": "Ana", "email": "ana@example.com"}]}
        bundle = {"state": API.default_french1_final_exam_bundle()["state"], "exam": EXAM}
        store = {"submissions": {}, "attempts": {}, "preflight": {}, "events": []}
        payload = API.final_exam_monitor_payload(config, grades, bundle, store)
        self.assertIn("students", payload)
        self.assertNotIn("answers", payload["students"][0])
        self.assertIn("remainingSeconds", payload["students"][0])

    def test_required_routes_are_registered(self):
        source = (ROOT / "server" / "progress_api.py").read_text(encoding="utf-8")
        for suffix in ("preflight", "preflight-audio", "draft", "session", "monitor", "analytics"):
            self.assertIn(suffix, source)

    def test_exam_get_is_passive_and_only_session_creates_attempt(self):
        source = (ROOT / "server" / "progress_api.py").read_text(encoding="utf-8")
        for level in ("french1", "french2"):
            start_marker = f'if parsed.path == "/api/{level}/final-exam":'
            end_marker = f'if parsed.path == "/api/{level}/final-exam/audio":'
            start = source.index(start_marker)
            end = source.index(end_marker, start)
            get_block = source[start:end]
            self.assertNotIn("final_exam_create_attempt(", get_block)
            self.assertNotIn('"source": "exam_get"', get_block)
            self.assertIn("final_exam_get_access_payload(", get_block)
            self.assertIn("role, student, bundle, submissions, profile, config", get_block)
        submit_start = source.index("def final_exam_submit_action(")
        submit_end = source.index("def final_exam_update_state(", submit_start)
        self.assertNotIn("final_exam_create_attempt(", source[submit_start:submit_end])
        session_start = source.index("def final_exam_session_action(")
        session_end = source.index("def final_exam_get_draft(", session_start)
        self.assertIn("final_exam_create_attempt(", source[session_start:session_end])

    def test_exam_questions_are_hidden_until_session_exists(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            config = self.runtime_config(temp_dir)
            grades = json.loads(pathlib.Path(config["gradesPath"]).read_text(encoding="utf-8"))
            student = grades["students"][0]
            bundle = config["readBundle"]()
            store = config["readStore"]()

            ready = API.final_exam_access_payload("student", student, bundle, store)
            self.assertEqual(ready["status"], "ready")
            self.assertEqual(ready["examVersion"], EXAM["version"])
            self.assertNotIn("exam", ready)
            self.assertNotIn("session", ready)

            ready_with_identity = API.final_exam_get_access_payload(
                "student", student, bundle, store,
                {"email": "ana@example.com", "name": "Ana"}, config,
            )
            self.assertNotIn("examAccessToken", ready_with_identity)

            staff = API.final_exam_access_payload(
                "teacher", None, bundle, store,
                {"email": "teacher@example.com", "name": "Teacher"}, config,
            )
            self.assertEqual(staff["status"], "staff-preview")
            self.assertIn("sections", staff["exam"])
            self.assertNotIn("examAccessToken", staff)

            preflight = API.final_exam_preflight_payload(
                config,
                {"email": "ana@example.com", "name": "Ana"},
                grades,
                bundle,
                store,
            )
            self.assertNotIn("examAccessToken", preflight)

            status, session = API.final_exam_session_action(config, {"email": "ana@example.com"}, {})
            self.assertEqual(status, 200)
            resumed = API.final_exam_access_payload("student", student, bundle, config["readStore"]())
            self.assertEqual(resumed["status"], "open")
            self.assertEqual(resumed["attemptId"], session["attemptId"])
            self.assertIn("sections", resumed["exam"])
            self.assertTrue(resumed["exam"]["sections"])

    def test_exam_bridge_token_identity_scope_and_endpoint_continuity_for_both_levels(self):
        for level in ("french1", "french2"):
            with self.subTest(level=level), tempfile.TemporaryDirectory() as temp_dir:
                config = self.runtime_config(temp_dir, level)
                original = {
                    "sub": "google-subject-ana",
                    "email": "ana@example.com",
                    "name": "Ana Google",
                    "provider": "google",
                }
                issued_after = int(time.time())
                status, session = API.final_exam_session_action(config, original, {})
                self.assertEqual(status, 200)
                self.assertTrue(session["examAccessToken"])
                self.assertGreaterEqual(session["examAccessExp"], issued_after + (11 * 60 * 60) + (55 * 60))
                self.assertLessEqual(session["examAccessExp"], int(time.time()) + (12 * 60 * 60) + 2)
                self.assertEqual(session["examAccessUser"]["provider"], "local")
                self.assertEqual(session["examAccessUser"]["authProvider"], "local-gradebook")
                self.assertEqual(session["examAccessUser"]["email"], original["email"])
                self.assertEqual(session["examAccessUser"]["name"], original["name"])

                validated = API.validate_local_token(session["examAccessToken"])
                self.assertEqual(validated["provider"], "local-gradebook")
                self.assertEqual(validated["email"], original["email"])
                self.assertEqual(validated["name"], original["name"])
                self.assertEqual(validated["tokenPurpose"], "final-exam")
                self.assertEqual(validated["examLevel"], level)
                self.assertEqual(validated["examAttemptId"], session["attemptId"])
                self.assertEqual(validated["examVersion"], EXAM["version"])
                self.assertEqual(validated["exp"], session["examAccessExp"])
                self.assertTrue(API.final_exam_bridge_route_allowed(
                    validated, f"/api/{level}/final-exam/draft"
                ))
                self.assertTrue(API.final_exam_bridge_route_allowed(
                    validated, f"/api/{level}/final-exam/audio"
                ))
                self.assertTrue(API.final_exam_bridge_route_allowed(
                    validated, f"/api/{level}/final-exam/draft", "PUT"
                ))
                self.assertTrue(API.final_exam_bridge_route_allowed(
                    validated, f"/api/{level}/final-exam/session", "POST"
                ))
                self.assertTrue(API.final_exam_bridge_route_allowed(
                    validated, f"/api/{level}/final-exam/submit", "POST"
                ))
                self.assertFalse(API.final_exam_bridge_route_allowed(
                    validated, "/api/french1/grades"
                ))
                self.assertFalse(API.final_exam_bridge_route_allowed(
                    validated, "/api/progress"
                ))
                other_level = "french2" if level == "french1" else "french1"
                self.assertFalse(API.final_exam_bridge_route_allowed(
                    validated, f"/api/{other_level}/final-exam"
                ))
                for forbidden_suffix in ("preflight", "preflight-audio", "transcript", "monitor", "analytics"):
                    self.assertFalse(API.final_exam_bridge_route_allowed(
                        validated, f"/api/{level}/final-exam/{forbidden_suffix}"
                    ))
                self.assertFalse(API.final_exam_bridge_route_allowed(
                    validated, f"/api/{level}/final-exam/state", "PUT"
                ))

                # A validated bridge may resume the same session and operate
                # the student endpoints after the original OAuth token expires.
                status, resumed_session = API.final_exam_session_action(config, validated, {})
                self.assertEqual(status, 200)
                self.assertEqual(resumed_session["attemptId"], session["attemptId"])
                self.assertTrue(resumed_session["examAccessToken"])

                grades = json.loads(pathlib.Path(config["gradesPath"]).read_text(encoding="utf-8"))
                student = grades["students"][0]
                bundle = config["readBundle"]()
                store = config["readStore"]()
                recovered = API.final_exam_get_access_payload(
                    "student", student, bundle, store, validated, config
                )
                self.assertEqual(recovered["status"], "open")
                self.assertTrue(recovered["examAccessToken"])
                self.assertEqual(recovered["examAccessUser"]["email"], original["email"])
                self.assertIsNone(
                    API.final_exam_audio_access_error("student", student, bundle, store)
                )
                self.assertIsNone(API.final_exam_bridge_attempt_error(
                    validated, config, student, bundle, store, allow_submission=True
                ))

                status, draft = API.final_exam_put_draft(config, validated, {
                    "attemptId": session["attemptId"],
                    "examVersion": EXAM["version"],
                    "revision": 0,
                    "answers": {"q1": 0},
                })
                self.assertEqual(status, 200)
                self.assertEqual(draft["revision"], 1)
                status, saved = API.final_exam_get_draft(config, validated)
                self.assertEqual(status, 200)
                self.assertEqual(saved["answers"], {"q1": 0})
                status, submitted = API.final_exam_submit_action(config, validated, {
                    "attemptId": session["attemptId"],
                    "examVersion": EXAM["version"],
                    "revision": 1,
                    "answers": {"q1": 0, "q2": True},
                })
                self.assertEqual(status, 200)
                self.assertTrue(submitted["result"]["receiptCode"])

                submitted_store = config["readStore"]()
                self.assertIsNone(API.final_exam_bridge_attempt_error(
                    validated, config, student, bundle, submitted_store, allow_submission=True
                ))
                recovered_receipt = API.final_exam_get_access_payload(
                    "student", student, bundle, submitted_store, validated, config
                )
                self.assertEqual(recovered_receipt["status"], "submitted")
                self.assertTrue(recovered_receipt["result"]["receiptCode"])
                self.assertNotIn("exam", recovered_receipt)
                self.assertNotIn("examAccessToken", recovered_receipt)

    def test_exam_bridge_is_rejected_cross_level_and_on_attempt_mismatch(self):
        with tempfile.TemporaryDirectory() as first_dir, tempfile.TemporaryDirectory() as second_dir:
            french1 = self.runtime_config(first_dir, "french1")
            french2 = self.runtime_config(second_dir, "french2")
            original = {"email": "ana@example.com", "name": "Ana", "provider": "google"}
            status, session = API.final_exam_session_action(french1, original, {})
            self.assertEqual(status, 200)
            bridge = API.validate_local_token(session["examAccessToken"])

            status, result = API.final_exam_session_action(french2, bridge, {})
            self.assertEqual(status, 403)
            self.assertEqual(result["error"], "token_scope_invalid")
            self.assertEqual(french2["readStore"]()["attempts"], {})

            mismatched = dict(bridge, examAttemptId="another-attempt")
            status, result = API.final_exam_put_draft(french1, mismatched, {
                "attemptId": session["attemptId"],
                "examVersion": EXAM["version"],
                "revision": 0,
                "answers": {"q1": 0},
            })
            self.assertEqual(status, 403)
            self.assertEqual(result["error"], "token_scope_invalid")

    def test_require_user_applies_exam_bridge_route_scope(self):
        source = (ROOT / "server" / "progress_api.py").read_text(encoding="utf-8")
        start = source.index("    def require_user(self):")
        end = source.index("    def read_json_body(self):", start)
        require_user = source[start:end]
        self.assertIn("final_exam_bridge_route_allowed(profile, self.path, self.command)", require_user)
        self.assertIn('"error": "token_scope_invalid"', require_user)

    def test_protected_exam_audio_route_requires_current_attempt(self):
        source = (ROOT / "server" / "progress_api.py").read_text(encoding="utf-8")
        for level in ("french1", "french2"):
            start_marker = f'if parsed.path == "/api/{level}/final-exam/audio":'
            end_marker = f'if parsed.path == "/api/{level}/final-exam/transcript":'
            start = source.index(start_marker)
            end = source.index(end_marker, start)
            audio_block = source[start:end]
            self.assertIn("final_exam_audio_access_error", audio_block)
        helper_start = source.index("def final_exam_audio_access_error(")
        helper_end = source.index("def final_exam_attempt_timing(", helper_start)
        helper = source[helper_start:helper_end]
        self.assertIn("final_exam_matching_attempt", helper)
        self.assertIn('"error": "attempt_not_started"', helper)
        self.assertIn('"attempt_expired"', helper)
        self.assertIn('"already_submitted"', helper)

    def test_exam_and_audio_get_finalize_due_attempts_and_persist(self):
        source = (ROOT / "server" / "progress_api.py").read_text(encoding="utf-8")
        for level in ("french1", "french2"):
            exam_start = source.index(f'if parsed.path == "/api/{level}/final-exam":')
            audio_start = source.index(f'if parsed.path == "/api/{level}/final-exam/audio":', exam_start)
            transcript_start = source.index(f'if parsed.path == "/api/{level}/final-exam/transcript":', audio_start)
            exam_block = source[exam_start:audio_start]
            audio_block = source[audio_start:transcript_start]
            for block in (exam_block, audio_block):
                self.assertIn("with data_lock:", block)
                self.assertIn("final_exam_finalize_due_attempts(", block)
                self.assertIn('config["writeStore"](submissions)', block)
                self.assertIn('write_json_file(config["gradesPath"]', block)
            self.assertIn("final_exam_get_access_payload", exam_block)
            self.assertIn("final_exam_audio_access_error", audio_block)

    def test_expired_attempt_becomes_receipt_and_blocks_audio_for_both_levels(self):
        for level in ("french1", "french2"):
            with self.subTest(level=level), tempfile.TemporaryDirectory() as temp_dir:
                config = self.runtime_config(temp_dir, level)
                profile = {"email": "ana@example.com", "name": "Ana"}
                status, _ = API.final_exam_session_action(config, profile, {})
                self.assertEqual(status, 200)

                store = config["readStore"]()
                store["attempts"]["001"]["startedAt"] = "2000-01-01T00:00:00Z"
                config["writeStore"](store)
                grades = json.loads(pathlib.Path(config["gradesPath"]).read_text(encoding="utf-8"))
                bundle = config["readBundle"]()
                store = config["readStore"]()
                changed, grades_changed = API.final_exam_finalize_due_attempts(
                    config, grades, bundle, store
                )
                self.assertTrue(changed)
                self.assertTrue(grades_changed)
                self.assertIn("finalExam", grades["students"][0]["grades"])
                config["writeStore"](store)

                student = grades["students"][0]
                payload = API.final_exam_get_access_payload("student", student, bundle, store)
                self.assertEqual(payload["status"], "submitted")
                self.assertNotIn("exam", payload)
                self.assertTrue(payload["result"]["receiptCode"])
                self.assertNotIn("grade", payload["result"])
                self.assertEqual(store["submissions"]["001"]["completionReason"], "time_expired")
                self.assertEqual(config["readStore"]()["submissions"]["001"]["completionReason"], "time_expired")

                audio_error = API.final_exam_audio_access_error("student", student, bundle, store)
                self.assertIsNotNone(audio_error)
                self.assertEqual(audio_error[0], 409)
                self.assertEqual(audio_error[1]["error"], "attempt_expired")

    def test_existing_submission_blocks_audio_while_exam_is_open_for_both_levels(self):
        for level in ("french1", "french2"):
            with self.subTest(level=level), tempfile.TemporaryDirectory() as temp_dir:
                config = self.runtime_config(temp_dir, level)
                profile = {"email": "ana@example.com", "name": "Ana"}
                status, session = API.final_exam_session_action(config, profile, {})
                self.assertEqual(status, 200)
                status, _ = API.final_exam_submit_action(config, profile, {
                    "attemptId": session["attemptId"],
                    "examVersion": EXAM["version"],
                    "answers": {"q1": 0, "q2": True},
                })
                self.assertEqual(status, 200)

                grades = json.loads(pathlib.Path(config["gradesPath"]).read_text(encoding="utf-8"))
                student = grades["students"][0]
                bundle = config["readBundle"]()
                store = config["readStore"]()
                self.assertTrue(bundle["state"]["isOpen"])
                payload = API.final_exam_get_access_payload("student", student, bundle, store)
                self.assertEqual(payload["status"], "submitted")
                self.assertNotIn("exam", payload)

                audio_error = API.final_exam_audio_access_error("student", student, bundle, store)
                self.assertIsNotNone(audio_error)
                self.assertEqual(audio_error[0], 409)
                self.assertEqual(audio_error[1]["error"], "already_submitted")

    def test_submit_before_session_does_not_start_attempt(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            config = self.runtime_config(temp_dir)
            status, result = API.final_exam_submit_action(config, {"email": "ana@example.com"}, {
                "examVersion": EXAM["version"],
                "answers": {"q1": 0, "q2": True},
            })
            self.assertEqual(status, 409)
            self.assertEqual(result["error"], "attempt_not_started")
            self.assertEqual(config["readStore"]()["attempts"], {})

    def test_session_creation_requires_persisted_preflight_but_resume_does_not(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            config = self.runtime_config(temp_dir)
            student = {"email": "ana@example.com"}
            store = config["readStore"]()
            store["preflight"] = {}
            config["writeStore"](store)

            status, result = API.final_exam_session_action(config, student, {"audioReady": True})
            self.assertEqual(status, 409)
            self.assertEqual(result["error"], "preflight_required")
            self.assertEqual(config["readStore"]()["attempts"], {})

            store = config["readStore"]()
            store["preflight"]["001"] = {"audioReady": True, "audioCheckedAt": API.now_iso()}
            config["writeStore"](store)
            status, session = API.final_exam_session_action(config, student, {"audioReady": True})
            self.assertEqual(status, 200)
            self.assertTrue(session["attemptId"])
            self.assertFalse(session["audioReady"], "payload audioReady must not mark protected exam audio on creation")

            store = config["readStore"]()
            store["preflight"] = {}
            config["writeStore"](store)
            status, resumed = API.final_exam_session_action(config, student, {})
            self.assertEqual(status, 200)
            self.assertEqual(resumed["attemptId"], session["attemptId"])

    def test_session_draft_submit_release_round_trip(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            config = self.runtime_config(temp_dir)
            student_profile = {"email": "ana@example.com", "name": "Ana"}
            teacher_profile = {"email": "teacher@example.com", "name": "Teacher"}

            status, session = API.final_exam_session_action(config, student_profile, {"audioReady": True})
            self.assertEqual(status, 200)
            self.assertTrue(session["attemptId"])
            self.assertIn("questions", session["presentation"])

            status, draft = API.final_exam_put_draft(config, student_profile, {
                "attemptId": session["attemptId"],
                "examVersion": EXAM["version"],
                "revision": 0,
                "answers": {"q1": 0},
            })
            self.assertEqual(status, 200)
            self.assertEqual(draft["revision"], 1)

            status, submitted = API.final_exam_submit_action(config, student_profile, {
                "attemptId": session["attemptId"],
                "examVersion": EXAM["version"],
                "answers": {"q1": 0, "q2": True},
            })
            self.assertEqual(status, 200)
            self.assertIn("receiptCode", submitted["result"])
            self.assertNotIn("grade", submitted["result"])

            status, closed = API.final_exam_update_state(config, teacher_profile, {"isOpen": False})
            self.assertEqual(status, 200)
            self.assertFalse(closed["state"]["isOpen"])
            status, released = API.final_exam_update_state(config, teacher_profile, {"releaseResults": True})
            self.assertEqual(status, 200)
            self.assertTrue(released["state"]["releaseResults"])
            grades = json.loads(pathlib.Path(config["gradesPath"]).read_text(encoding="utf-8"))
            self.assertEqual(grades["students"][0]["grades"]["finalExam"], 5.0)

    def test_close_requires_confirmation_and_finalizes_active_draft(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            config = self.runtime_config(temp_dir)
            student_profile = {"email": "ana@example.com", "name": "Ana"}
            teacher_profile = {"email": "teacher@example.com", "name": "Teacher"}
            status, session = API.final_exam_session_action(config, student_profile, {})
            self.assertEqual(status, 200)
            status, _ = API.final_exam_put_draft(config, student_profile, {
                "attemptId": session["attemptId"],
                "examVersion": EXAM["version"],
                "revision": 0,
                "answers": {"q1": 0},
            })
            self.assertEqual(status, 200)

            status, blocked = API.final_exam_update_state(config, teacher_profile, {"isOpen": False})
            self.assertEqual(status, 409)
            self.assertEqual(blocked["error"], "active_attempts")
            status, closed = API.final_exam_update_state(config, teacher_profile, {"isOpen": False, "confirmClose": True})
            self.assertEqual(status, 200)
            self.assertFalse(closed["state"]["isOpen"])
            persisted = config["readStore"]()
            submission = persisted["submissions"]["001"]
            self.assertTrue(submission["autoSubmitted"])
            self.assertEqual(submission["completionReason"], "teacher_closed")
            monitor = API.final_exam_monitor_payload(
                config,
                json.loads(pathlib.Path(config["gradesPath"]).read_text(encoding="utf-8")),
                config["readBundle"](),
                persisted,
            )
            row = monitor["students"][0]
            self.assertEqual(row["status"], "submitted_auto")
            self.assertEqual(row["event"], "submitted_auto")
            self.assertNotIn("answers", row)
            self.assertNotIn("answers", row["result"])

    def test_results_cannot_be_released_while_exam_is_open(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            config = self.runtime_config(temp_dir)
            status, result = API.final_exam_update_state(
                config,
                {"email": "teacher@example.com"},
                {"releaseResults": True},
            )
            self.assertEqual(status, 409)
            self.assertEqual(result["error"], "exam_active")
            self.assertFalse(config["readBundle"]()["state"]["releaseResults"])

    def test_results_cannot_be_released_before_exam_session_for_both_levels(self):
        for level in ("french1", "french2"):
            with self.subTest(level=level), tempfile.TemporaryDirectory() as temp_dir:
                config = self.runtime_config(temp_dir, level)
                bundle = config["readBundle"]()
                bundle["state"].update({
                    "isOpen": False,
                    "openedAt": None,
                    "closedAt": None,
                    "releaseResults": False,
                })
                config["writeBundle"](bundle)
                status, result = API.final_exam_update_state(
                    config,
                    {"email": "teacher@example.com"},
                    {"releaseResults": True},
                )
                self.assertEqual(status, 409)
                self.assertEqual(result["error"], "exam_not_completed")
                self.assertFalse(config["readBundle"]()["state"]["releaseResults"])

    def test_results_cannot_be_released_after_empty_close_for_both_levels(self):
        for level in ("french1", "french2"):
            with self.subTest(level=level), tempfile.TemporaryDirectory() as temp_dir:
                config = self.runtime_config(temp_dir, level)
                teacher = {"email": "teacher@example.com"}
                status, closed = API.final_exam_update_state(config, teacher, {"isOpen": False})
                self.assertEqual(status, 200)
                self.assertTrue(closed["state"]["closedAt"])
                self.assertEqual(config["readStore"]()["submissions"], {})

                status, result = API.final_exam_update_state(
                    config, teacher, {"releaseResults": True}
                )
                self.assertEqual(status, 409)
                self.assertEqual(result["error"], "no_submissions")
                self.assertFalse(config["readBundle"]()["state"]["releaseResults"])

    def test_reopening_after_results_release_is_rejected(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            config = self.runtime_config(temp_dir)
            teacher = {"email": "teacher@example.com"}
            student = {"email": "ana@example.com"}
            status, session = API.final_exam_session_action(config, student, {})
            self.assertEqual(status, 200)
            status, _ = API.final_exam_submit_action(config, student, {
                "attemptId": session["attemptId"],
                "examVersion": EXAM["version"],
                "answers": {"q1": 0, "q2": True},
            })
            self.assertEqual(status, 200)
            status, _ = API.final_exam_update_state(config, teacher, {"isOpen": False})
            self.assertEqual(status, 200)
            status, _ = API.final_exam_update_state(config, teacher, {"releaseResults": True})
            self.assertEqual(status, 200)
            status, result = API.final_exam_update_state(config, teacher, {"isOpen": True})
            self.assertEqual(status, 409)
            self.assertEqual(result["error"], "results_already_released")
            self.assertFalse(config["readBundle"]()["state"]["isOpen"])

    def test_opening_requires_a_complete_one_hundred_percent_gradebook(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            config = self.runtime_config(temp_dir)
            bundle = config["readBundle"]()
            bundle["state"]["isOpen"] = False
            bundle["state"]["openedAt"] = None
            config["writeBundle"](bundle)
            grades_path = pathlib.Path(config["gradesPath"])
            grades = json.loads(grades_path.read_text(encoding="utf-8"))
            grades["evaluations"][0]["weight"] = 70
            grades_path.write_text(json.dumps(grades), encoding="utf-8")

            status, result = API.final_exam_update_state(
                config,
                {"email": "teacher@example.com"},
                {"isOpen": True},
            )
            self.assertEqual(status, 409)
            self.assertEqual(result["error"], "gradebook_not_ready")
            self.assertEqual(result["weightingIssue"], "weight_total_90")

    def test_submit_rejects_stale_revision_and_returns_server_draft(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            config = self.runtime_config(temp_dir)
            student = {"email": "ana@example.com"}
            status, session = API.final_exam_session_action(config, student, {})
            self.assertEqual(status, 200)
            status, _ = API.final_exam_put_draft(config, student, {
                "attemptId": session["attemptId"],
                "examVersion": EXAM["version"],
                "revision": 0,
                "answers": {"q1": 0},
            })
            self.assertEqual(status, 200)
            status, result = API.final_exam_submit_action(config, student, {
                "attemptId": session["attemptId"],
                "examVersion": EXAM["version"],
                "revision": 0,
                "answers": {"q1": 0, "q2": True},
            })
            self.assertEqual(status, 409)
            self.assertEqual(result["error"], "stale_draft")
            self.assertEqual(result["revision"], 1)
            self.assertEqual(result["answers"], {"q1": 0})
            self.assertEqual(result["draft"], {"q1": 0})

    def test_draft_rejects_non_mapping_and_oversized_answers(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            config = self.runtime_config(temp_dir)
            student = {"email": "ana@example.com"}
            status, session = API.final_exam_session_action(config, student, {})
            self.assertEqual(status, 200)
            base = {
                "attemptId": session["attemptId"],
                "examVersion": EXAM["version"],
                "revision": 0,
            }
            status, result = API.final_exam_put_draft(config, student, dict(base, answers=[]))
            self.assertEqual(status, 400)
            self.assertEqual(result["error"], "invalid_draft")
            oversized = {"unknown-%02d" % index: 0 for index in range(11)}
            status, result = API.final_exam_put_draft(config, student, dict(base, answers=oversized))
            self.assertEqual(status, 400)
            self.assertEqual(result["error"], "invalid_draft")

    def test_staff_state_is_never_marked_submitted_by_roster_match(self):
        grades = {
            "adminEmails": [],
            "teacherEmails": ["teacher@example.com"],
            "students": [{"id": "001", "fullName": "Teacher", "email": "teacher@example.com", "grades": {}}],
            "evaluations": [],
        }
        bundle = API.default_french1_final_exam_bundle()
        bundle["exam"] = EXAM
        store = {
            "submissions": {"001": {"studentId": "001", "grade": 5, "receiptCode": "JLF-STAFF"}},
            "attempts": {},
            "preflight": {},
            "events": [],
        }
        payload = API.final_exam_runtime_state_payload(
            {"email": "teacher@example.com"}, grades, bundle, store
        )
        self.assertEqual(payload["role"], "teacher")
        self.assertIsNone(payload["submitted"])


if __name__ == "__main__":
    unittest.main(verbosity=2)
