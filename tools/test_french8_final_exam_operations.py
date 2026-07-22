#!/usr/bin/env python3
"""Operational contracts for the Niveau 8 final-exam runtime."""

from __future__ import annotations

import importlib.util
import json
import os
import pathlib
import tempfile
import unittest
import urllib.parse
from datetime import datetime, timedelta, timezone

ROOT = pathlib.Path(__file__).resolve().parents[1]
os.environ.setdefault("JARALINGUA_LOCAL_AUTH_SECRET", "unit-test-french8-operations-secret")


def load_api():
    path = ROOT / "server" / "progress_api.py"
    spec = importlib.util.spec_from_file_location("jaralingua_french8_operations_tests", path)
    module = importlib.util.module_from_spec(spec)
    assert spec and spec.loader
    spec.loader.exec_module(module)
    return module


API = load_api()

EXAM = {
    "id": "french8-final-exam",
    "version": "operations-v1",
    "title": "Examen final - Niveau 8",
    "totalPoints": 2,
    "transcript": "Une chronique professionnelle sur la ville intelligente.",
    "sections": [{
        "id": "grammaire",
        "title": "Grammaire",
        "questions": [
            {"id": "q1", "type": "mcq", "prompt": "Choisissez.", "options": ["A", "B"], "answer": 0, "points": 1},
            {"id": "q2", "type": "truefalse", "prompt": "Vrai ou faux ?", "answer": True, "points": 1},
        ],
    }],
}


def json_runtime(root: pathlib.Path):
    grades_path = root / "grades.json"
    bundle_path = root / "bundle.json"
    store_path = root / "store.json"
    audio_path = root / "audio.mp3"
    audio_path.write_bytes(b"ID3" + b"x" * 12000)
    grades = {
        "adminEmails": [],
        "teacherEmails": ["teacher@example.com"],
        "evaluations": [
            {"id": "coursework", "title": "Coursework", "weight": 80},
            {"id": "finalExam", "title": "Final", "weight": 20},
        ],
        "students": [{"id": "008", "fullName": "Ana", "email": "ana@example.com", "grades": {}}],
    }
    bundle = API.default_french8_final_exam_bundle()
    bundle["exam"] = EXAM
    bundle["state"].update({"isOpen": True, "openedAt": API.now_iso()})
    store = {
        "submissions": {},
        "attempts": {},
        "preflight": {"008": {"audioReady": True, "audioCheckedAt": API.now_iso()}},
        "idempotency": {},
        "events": [],
    }
    for path, payload in ((grades_path, grades), (bundle_path, bundle), (store_path, store)):
        path.write_text(json.dumps(payload), encoding="utf-8")

    def read(path):
        return json.loads(path.read_text(encoding="utf-8"))

    def write(path, payload):
        path.write_text(json.dumps(payload), encoding="utf-8")

    def ready_health(_config, _grades, _bundle, _store, record_alerts=True):
        return {
            "readyToOpen": True,
            "schedulerReady": True,
            "status": "ok",
            "blockingIssues": [],
        }

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
        "healthCheck": ready_health,
    }


def sqlite_runtime(root: pathlib.Path):
    runtime = json_runtime(root)
    repository = API.FinalExamRepository(root / "runtime.sqlite3", level="french8")
    repository.initialize(
        root / "bundle.json",
        root / "bundle.json",
        root / "store.json",
        default_bundle=runtime["readBundle"](),
        default_store=runtime["readStore"](),
    )
    runtime.update({
        "readBundle": repository.read_bundle,
        "writeBundle": lambda value: repository.put_bundle(value),
        "readStore": repository.read_store,
        "writeStore": lambda value: repository.put_store(value),
        "writeDocuments": lambda bundle, store: repository.replace_documents(bundle, store),
        "repository": lambda: repository,
    })
    return runtime, repository


class French8FinalExamOperationsTests(unittest.TestCase):
    def test_single_http_ranges_cover_browser_seek_contract(self):
        self.assertEqual(API.parse_http_byte_range("bytes=0-99", 1000), (0, 99))
        self.assertEqual(API.parse_http_byte_range("bytes=900-", 1000), (900, 999))
        self.assertEqual(API.parse_http_byte_range("bytes=-100", 1000), (900, 999))
        self.assertEqual(API.parse_http_byte_range("", 1000), None)
        for invalid in ("items=0-1", "bytes=1-2,4-5", "bytes=1000-1001", "bytes=10-2"):
            with self.subTest(invalid=invalid), self.assertRaises(ValueError):
                API.parse_http_byte_range(invalid, 1000)

    def test_audio_grant_is_native_range_capability_and_tracks_window_revision(self):
        bundle = API.default_french8_final_exam_bundle()
        bundle["exam"] = EXAM
        bundle["state"].update({"isOpen": True, "openedAt": API.now_iso(), "revision": 4})
        student = {"id": "008", "email": "ana@example.com"}
        status, payload = API.french8_final_exam_audio_grant(
            {"email": "ana@example.com"}, "student", student, bundle
        )
        self.assertEqual(status, 200)
        self.assertTrue(payload["acceptRanges"])
        grant = urllib.parse.parse_qs(urllib.parse.urlparse(payload["audioUrl"]).query)["grant"][0]
        claims = API.french8_final_exam_validate_audio_grant(grant, bundle)
        self.assertEqual(claims["studentId"], "008")
        bundle["state"]["revision"] = 5
        with self.assertRaisesRegex(ValueError, "audio_grant_stale"):
            API.french8_final_exam_validate_audio_grant(grant, bundle)

    def test_staff_simulation_is_explicit_and_does_not_mutate_runtime_documents(self):
        bundle = API.default_french8_final_exam_bundle()
        bundle["exam"] = EXAM
        before = json.dumps(bundle, sort_keys=True)
        payload = API.french8_final_exam_simulation_payload(
            {"email": "teacher@example.com"}, "teacher", bundle, "B"
        )
        self.assertEqual(payload["mode"], "simulation")
        self.assertEqual(payload["persistence"], "none")
        self.assertEqual(payload["variant"], "B")
        self.assertNotIn("attemptId", payload)
        self.assertEqual(json.dumps(bundle, sort_keys=True), before)

    def test_autonomous_scheduler_materializes_open_and_close_without_http_requests(self):
        with tempfile.TemporaryDirectory() as temp:
            config = json_runtime(pathlib.Path(temp))
            current = datetime.now(timezone.utc)
            bundle = config["readBundle"]()
            bundle["state"].update({
                "isOpen": False,
                "scheduleEnabled": True,
                "opensAt": (current - timedelta(minutes=1)).isoformat(),
                "closesAt": (current + timedelta(minutes=10)).isoformat(),
                "schedulerObservedStatus": "scheduled",
            })
            config["writeBundle"](bundle)
            opened = API.french8_final_exam_scheduler_tick(config, now=current)
            self.assertTrue(opened["transition"])
            self.assertEqual(opened["scheduleStatus"], "open")
            self.assertTrue(config["readBundle"]()["state"]["isOpen"])
            closed = API.french8_final_exam_scheduler_tick(
                config, now=current + timedelta(minutes=11)
            )
            self.assertTrue(closed["transition"])
            self.assertEqual(closed["scheduleStatus"], "closed")
            self.assertFalse(config["readBundle"]()["state"]["isOpen"])

    def test_scheduler_health_gate_fails_closed_when_check_is_missing_or_raises(self):
        for failure_mode in ("missing", "exception"):
            with self.subTest(failure_mode=failure_mode), tempfile.TemporaryDirectory() as temp:
                config = json_runtime(pathlib.Path(temp))
                current = datetime.now(timezone.utc)
                bundle = config["readBundle"]()
                bundle["state"].update({
                    "isOpen": False,
                    "scheduleEnabled": True,
                    "opensAt": (current - timedelta(minutes=1)).isoformat(),
                    "closesAt": (current + timedelta(minutes=10)).isoformat(),
                    "schedulerObservedStatus": "scheduled",
                })
                config["writeBundle"](bundle)
                if failure_mode == "missing":
                    config.pop("healthCheck")
                else:
                    def broken_health(*_args, **_kwargs):
                        raise RuntimeError("health probe unavailable")

                    config["healthCheck"] = broken_health

                result = API.french8_final_exam_scheduler_tick(config, now=current)

                self.assertFalse(result["transition"])
                self.assertTrue(result["openingBlocked"])
                self.assertEqual(result["observedStatus"], "open_blocked")
                stored_bundle = config["readBundle"]()
                stored_state = stored_bundle["state"]
                self.assertFalse(stored_state["isOpen"])
                self.assertEqual(stored_state["schedulerObservedStatus"], "open_blocked")
                self.assertEqual(stored_state["openingGate"]["status"], "blocked")
                self.assertIn("health_check", stored_state["openingGate"]["blockingIssues"])
                public = API.final_exam_public_state(stored_state, "student", "008")
                self.assertFalse(public["isOpen"])
                self.assertFalse(public["accessEffective"])
                self.assertEqual(public["accessReason"], "scheduled_open_health_blocked")
                status, session = API.final_exam_session_action(
                    config, {"email": "ana@example.com", "name": "Ana"}, {}
                )
                self.assertEqual(status, 403, session)
                self.assertEqual(session["error"], "exam_closed")
                status, audio = API.french8_final_exam_audio_grant(
                    {"email": "ana@example.com"}, "student",
                    {"id": "008", "email": "ana@example.com"}, stored_bundle,
                )
                self.assertEqual(status, 403, audio)
                self.assertEqual(audio["error"], "exam_closed")
                events = config["readStore"]()["events"]
                self.assertIn(
                    "scheduled_window_open_blocked",
                    [item.get("event") for item in events],
                )

    def test_scheduler_retries_blocked_opening_and_opens_after_health_recovers(self):
        with tempfile.TemporaryDirectory() as temp:
            config = json_runtime(pathlib.Path(temp))
            current = datetime.now(timezone.utc)
            bundle = config["readBundle"]()
            bundle["state"].update({
                "isOpen": False,
                "scheduleEnabled": True,
                "opensAt": (current - timedelta(minutes=1)).isoformat(),
                "closesAt": (current + timedelta(minutes=10)).isoformat(),
                "schedulerObservedStatus": "scheduled",
            })
            config["writeBundle"](bundle)
            probe = {"ready": False, "calls": []}

            def health_gate(_config, _grades, current_bundle, _store, record_alerts=True):
                probe["calls"].append(current_bundle["state"].get("isOpen") is True)
                return {
                    "readyToOpen": probe["ready"],
                    "schedulerReady": False,
                    "status": "ok" if probe["ready"] else "blocked",
                    "blockingIssues": [] if probe["ready"] else ["audio"],
                }

            config["healthCheck"] = health_gate
            first = API.french8_final_exam_scheduler_tick(config, now=current)
            first_stored_state = config["readBundle"]()["state"]
            first_revision = first_stored_state["revision"]
            first_checked_at = first_stored_state["openingGate"]["checkedAt"]
            first_events = list(config["readStore"]()["events"])
            second = API.french8_final_exam_scheduler_tick(
                config, now=current + timedelta(seconds=15)
            )
            self.assertTrue(first["openingBlocked"])
            self.assertFalse(first["transition"])
            self.assertTrue(second["openingBlocked"])
            self.assertFalse(second["transition"])
            second_stored_state = config["readBundle"]()["state"]
            self.assertFalse(second_stored_state["isOpen"])
            self.assertEqual(second_stored_state["revision"], first_revision)
            self.assertEqual(second_stored_state["openingGate"]["checkedAt"], first_checked_at)
            self.assertEqual(config["readStore"]()["events"], first_events)
            self.assertEqual(
                API.FRENCH8_FINAL_EXAM_RUNTIME_STATUS["scheduledOpeningGateCheckedAt"],
                API.final_exam_iso_utc(current + timedelta(seconds=15)),
            )
            self.assertEqual(
                second["openingGate"]["checkedAt"],
                API.final_exam_iso_utc(current + timedelta(seconds=15)),
            )

            probe["ready"] = True
            recovered = API.french8_final_exam_scheduler_tick(
                config, now=current + timedelta(seconds=30)
            )

            self.assertTrue(recovered["transition"])
            self.assertFalse(recovered["openingBlocked"])
            self.assertEqual(recovered["observedStatus"], "open")
            recovered_state = config["readBundle"]()["state"]
            self.assertTrue(recovered_state["isOpen"])
            self.assertEqual(recovered_state["openingGate"]["status"], "ready")
            self.assertIsNotNone(recovered_state["openingGate"]["recoveredAt"])
            self.assertEqual(probe["calls"], [False, False, False])
            events = [item.get("event") for item in config["readStore"]()["events"]]
            self.assertEqual(events.count("scheduled_window_open_blocked"), 1)
            self.assertEqual(events.count("scheduled_window_opened"), 1)

    def test_scheduler_closes_and_finalizes_without_calling_unhealthy_open_gate(self):
        with tempfile.TemporaryDirectory() as temp:
            config = json_runtime(pathlib.Path(temp))
            current = datetime.now(timezone.utc)
            bundle = config["readBundle"]()
            bundle["state"].update({
                "isOpen": True,
                "scheduleEnabled": True,
                "opensAt": (current - timedelta(minutes=20)).isoformat(),
                "closesAt": (current - timedelta(minutes=1)).isoformat(),
                "schedulerObservedStatus": "open",
            })
            config["writeBundle"](bundle)
            store = config["readStore"]()
            store["attempts"]["008"] = {
                "attemptId": "attempt-closing-008",
                "attemptSeed": "101",
                "examVersion": EXAM["version"],
                "startedAt": (current - timedelta(minutes=10)).isoformat(),
                "lastSeenAt": current.isoformat(),
                "answers": {"q1": 0, "q2": True},
                "revision": 1,
                "status": "in_progress",
                "presentation": {},
            }
            config["writeStore"](store)
            probe_calls = []

            def must_not_run(*_args, **_kwargs):
                probe_calls.append(True)
                raise RuntimeError("opening health is down")

            config["healthCheck"] = must_not_run
            result = API.french8_final_exam_scheduler_tick(config, now=current)

            self.assertTrue(result["transition"])
            self.assertEqual(result["scheduleStatus"], "closed")
            self.assertFalse(config["readBundle"]()["state"]["isOpen"])
            submission = config["readStore"]()["submissions"]["008"]
            self.assertEqual(submission["completionReason"], "scheduled_closed")
            self.assertEqual(probe_calls, [])

    def test_blocked_opening_gate_becomes_historical_and_alert_resolves_at_window_close(self):
        with tempfile.TemporaryDirectory() as temp:
            config, repository = sqlite_runtime(pathlib.Path(temp))
            current = datetime.now(timezone.utc)
            bundle = config["readBundle"]()
            bundle["state"].update({
                "isOpen": False,
                "scheduleEnabled": True,
                "opensAt": (current - timedelta(minutes=1)).isoformat(),
                "closesAt": (current + timedelta(minutes=1)).isoformat(),
                "schedulerObservedStatus": "scheduled",
            })
            config["writeBundle"](bundle)

            def blocked_health(*_args, **_kwargs):
                return {
                    "readyToOpen": False,
                    "schedulerReady": True,
                    "status": "blocked",
                    "blockingIssues": ["audio"],
                }

            config["healthCheck"] = blocked_health
            blocked = API.french8_final_exam_scheduler_tick(config, now=current)
            self.assertTrue(blocked["openingBlocked"])
            self.assertEqual(repository.get_alert("scheduled_opening_gate")["status"], "open")

            closed = API.french8_final_exam_scheduler_tick(
                config, now=current + timedelta(minutes=2)
            )

            self.assertTrue(closed["transition"])
            self.assertEqual(closed["scheduleStatus"], "closed")
            closed_gate = config["readBundle"]()["state"]["openingGate"]
            self.assertEqual(closed_gate["status"], "closed")
            self.assertEqual(closed_gate["blockingIssues"], [])
            self.assertEqual(closed_gate["lastError"], "")
            self.assertIsNotNone(closed_gate["blockedAt"])
            alert = repository.get_alert("scheduled_opening_gate")
            self.assertEqual(alert["status"], "resolved")
            self.assertEqual(alert["resolution"], "scheduled_window_ended")
            events = [item.get("event") for item in config["readStore"]()["events"]]
            self.assertEqual(events.count("scheduled_window_open_blocked"), 1)
            self.assertEqual(events.count("scheduled_window_closed"), 1)

    def test_manual_schedule_disable_clears_blocked_gate_and_resolves_alert(self):
        with tempfile.TemporaryDirectory() as temp:
            config, repository = sqlite_runtime(pathlib.Path(temp))
            current = datetime.now(timezone.utc)
            bundle = config["readBundle"]()
            bundle["state"].update({
                "isOpen": False,
                "scheduleEnabled": True,
                "opensAt": (current - timedelta(minutes=1)).isoformat(),
                "closesAt": (current + timedelta(minutes=10)).isoformat(),
                "schedulerObservedStatus": "scheduled",
            })
            config["writeBundle"](bundle)
            config["healthCheck"] = lambda *_args, **_kwargs: {
                "readyToOpen": False,
                "schedulerReady": True,
                "status": "blocked",
                "blockingIssues": ["database"],
            }
            API.french8_final_exam_scheduler_tick(config, now=current)
            self.assertEqual(repository.get_alert("scheduled_opening_gate")["status"], "open")

            status, result = API.final_exam_update_state(
                config,
                {"email": "teacher@example.com"},
                {"action": "close_now", "isOpen": False},
            )

            self.assertEqual(status, 200, result)
            state = config["readBundle"]()["state"]
            self.assertFalse(state["scheduleEnabled"])
            self.assertNotIn("openingGate", state)
            alert = repository.get_alert("scheduled_opening_gate")
            self.assertEqual(alert["status"], "resolved")
            self.assertEqual(alert["resolution"], "scheduled_window_disabled_by_staff")
            self.assertEqual(
                API.FRENCH8_FINAL_EXAM_RUNTIME_STATUS["scheduledOpeningGateStatus"],
                "idle",
            )
            self.assertIsNone(
                API.FRENCH8_FINAL_EXAM_RUNTIME_STATUS["scheduledOpeningGateCheckedAt"]
            )

    def test_submission_idempotency_returns_same_receipt_and_rejects_reuse(self):
        with tempfile.TemporaryDirectory() as temp:
            config = json_runtime(pathlib.Path(temp))
            profile = {"email": "ana@example.com", "name": "Ana"}
            status, session = API.final_exam_session_action(config, profile, {})
            self.assertEqual(status, 200)
            request = {
                "attemptId": session["attemptId"],
                "examVersion": EXAM["version"],
                "revision": 0,
                "answers": {"q1": 0, "q2": True},
                "clientSubmissionId": "client-submit-008-0001",
            }
            status, first = API.final_exam_submit_action(config, profile, request)
            self.assertEqual(status, 200)
            status, duplicate = API.final_exam_submit_action(config, profile, request)
            self.assertEqual(status, 200)
            self.assertTrue(duplicate["duplicate"])
            self.assertEqual(duplicate["result"]["receiptCode"], first["result"]["receiptCode"])
            conflict = dict(request, answers={"q1": 1, "q2": True})
            status, response = API.final_exam_submit_action(config, profile, conflict)
            self.assertEqual(status, 409)
            self.assertEqual(response["error"], "idempotency_conflict")

    def test_sqlite_wrappers_migrate_once_and_atomically_feed_audit_and_outbox(self):
        with tempfile.TemporaryDirectory() as temp:
            root = pathlib.Path(temp)
            bundle_path = root / "bundle.json"
            store_path = root / "store.json"
            database_path = root / "exam.sqlite3"
            bundle = API.default_french8_final_exam_bundle()
            bundle["exam"] = EXAM
            store = API.default_french8_final_exam_store()
            bundle_path.write_text(json.dumps(bundle), encoding="utf-8")
            store_path.write_text(json.dumps(store), encoding="utf-8")
            originals = (
                API.FRENCH8_FINAL_EXAM_PATH,
                API.BUNDLED_FRENCH8_FINAL_EXAM_PATH,
                API.FRENCH8_FINAL_EXAM_SUBMISSIONS_PATH,
                API.FRENCH8_FINAL_EXAM_DB_PATH,
                API.FRENCH8_FINAL_EXAM_REPOSITORY,
            )
            try:
                API.FRENCH8_FINAL_EXAM_PATH = str(bundle_path)
                API.BUNDLED_FRENCH8_FINAL_EXAM_PATH = str(bundle_path)
                API.FRENCH8_FINAL_EXAM_SUBMISSIONS_PATH = str(store_path)
                API.FRENCH8_FINAL_EXAM_DB_PATH = str(database_path)
                API.reset_french8_final_exam_repository_for_tests()
                migrated_bundle = API.read_french8_final_exam_bundle()
                self.assertEqual(migrated_bundle["exam"]["version"], EXAM["version"])
                next_store = API.read_french8_final_exam_submissions()
                API.final_exam_append_event(next_store, "submission_recorded", extra={"requestId": "request-12345678"})
                next_store["submissions"]["008"] = {
                    "studentId": "008",
                    "grade": 4.5,
                    "attemptId": "attempt-008",
                    "receiptCode": "JLF-OPERATIONS-008",
                    "examVersion": EXAM["version"],
                    "submittedAt": API.now_iso(),
                }
                migrated_bundle["state"]["revision"] = 1
                API.write_french8_final_exam_documents(migrated_bundle, next_store)
                repository = API.french8_final_exam_repository()
                self.assertTrue(repository.health()["ok"])
                self.assertEqual(repository.read_bundle()["state"]["revision"], 1)
                self.assertTrue(any(item["eventType"] == "submission_recorded" for item in repository.list_audit(limit=100)))
                outbox = repository.list_grade_outbox(limit=10)
                self.assertEqual(len(outbox), 1)
                self.assertEqual(outbox[0]["studentId"], "008")
                self.assertEqual(outbox[0]["status"], "pending")
            finally:
                (
                    API.FRENCH8_FINAL_EXAM_PATH,
                    API.BUNDLED_FRENCH8_FINAL_EXAM_PATH,
                    API.FRENCH8_FINAL_EXAM_SUBMISSIONS_PATH,
                    API.FRENCH8_FINAL_EXAM_DB_PATH,
                    previous_repository,
                ) = originals
                API.reset_french8_final_exam_repository_for_tests()
                API.FRENCH8_FINAL_EXAM_REPOSITORY = previous_repository

    def test_health_gate_accepts_a_ready_sqlite_runtime_and_reports_all_checks(self):
        with tempfile.TemporaryDirectory() as temp:
            root = pathlib.Path(temp)
            runtime = json_runtime(root)
            bundle = runtime["readBundle"]()
            current = datetime.now(timezone.utc)
            older_gate_check = API.final_exam_iso_utc(current - timedelta(seconds=30))
            latest_gate_check = API.final_exam_iso_utc(current)
            bundle["state"].update({
                "isOpen": False,
                "openedAt": None,
                "openingGate": {
                    "status": "blocked",
                    "checkedAt": older_gate_check,
                    "blockedAt": older_gate_check,
                    "healthStatus": "blocked",
                    "blockingIssues": ["audio"],
                    "lastError": "",
                },
            })
            runtime["writeBundle"](bundle)
            repository = API.FinalExamRepository(root / "health.sqlite3", level="french8")
            repository.initialize(
                root / "bundle.json",
                root / "bundle.json",
                root / "store.json",
                default_bundle=bundle,
                default_store=runtime["readStore"](),
            )
            runtime.update({
                "readBundle": repository.read_bundle,
                "writeBundle": lambda value: repository.put_bundle(value),
                "readStore": repository.read_store,
                "writeStore": lambda value: repository.put_store(value),
                "repository": lambda: repository,
                "healthCheck": API.french8_final_exam_health_payload,
            })
            previous_status = dict(API.FRENCH8_FINAL_EXAM_RUNTIME_STATUS)
            try:
                API.FRENCH8_FINAL_EXAM_RUNTIME_STATUS.update({
                    "schedulerEnabled": True,
                    "schedulerLastSuccessAt": API.now_iso(),
                    "schedulerConsecutiveFailures": 0,
                    "scheduledOpeningGateStatus": "blocked",
                    "scheduledOpeningGateCheckedAt": latest_gate_check,
                    "scheduledOpeningBlockingIssues": ["audio"],
                    "scheduledOpeningLastError": "",
                })
                grades = json.loads((root / "grades.json").read_text(encoding="utf-8"))
                health = API.french8_final_exam_health_payload(
                    runtime, grades, repository.read_bundle(), repository.read_store()
                )
                self.assertTrue(health["readyToOpen"])
                self.assertEqual(health["openingGate"]["checkedAt"], latest_gate_check)
                self.assertEqual(
                    set(health["checks"]),
                    {"api", "database", "scheduler", "audio", "sse", "gradebook", "audit"},
                )
                status, result = API.final_exam_update_state(
                    runtime, {"email": "teacher@example.com"}, {"action": "open_now"}
                )
                self.assertEqual(status, 200, result)
                self.assertTrue(result["state"]["isOpen"])
            finally:
                API.FRENCH8_FINAL_EXAM_RUNTIME_STATUS.clear()
                API.FRENCH8_FINAL_EXAM_RUNTIME_STATUS.update(previous_status)

    def test_csv_formula_neutralization_and_public_audit_aliases(self):
        self.assertEqual(API.safe_csv_cell("=HYPERLINK('x')"), "'=HYPERLINK('x')")
        self.assertEqual(API.safe_csv_cell("normal"), "normal")
        event = API.french8_final_exam_audit_public({
            "id": 7,
            "eventType": "exam_opened",
            "occurredAt": datetime.now(timezone.utc).isoformat(),
            "actorEmail": "teacher@example.com",
            "studentId": "",
            "requestId": "request-12345678",
            "source": "api",
            "detail": {"mode": "manual"},
        })
        self.assertEqual(event["type"], "exam_opened")
        self.assertEqual(event["event"], "exam_opened")


if __name__ == "__main__":
    unittest.main(verbosity=2)
