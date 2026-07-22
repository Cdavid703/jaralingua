#!/usr/bin/env python3
"""Unit tests for the transactional Niveau 8 final-exam repository."""

from __future__ import annotations

import hashlib
import json
import os
import pathlib
import sqlite3
import tempfile
import threading
import unittest
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta, timezone

ROOT = pathlib.Path(__file__).resolve().parents[1]
if str(ROOT) not in os.sys.path:
    os.sys.path.insert(0, str(ROOT))

from server.final_exam_storage import (
    FinalExamConflictError,
    FinalExamMigrationError,
    FinalExamRepository,
    FinalExamStorageError,
    SCHEMA_VERSION,
)


FIXED_NOW = datetime(2026, 7, 22, 12, 0, 0, tzinfo=timezone.utc)


def sample_bundle():
    return {
        "state": {
            "isOpen": False,
            "openedAt": None,
            "closedAt": None,
            "durationMinutes": 90,
            "extraMinutesByStudent": {},
            "revision": 0,
        },
        "exam": {
            "id": "french8-final-exam",
            "version": "niveau8-storage-test-v1",
            "title": "Examen final — Niveau 8",
            "totalPoints": 2,
            "sections": [
                {
                    "id": "grammar",
                    "questions": [
                        {
                            "id": "g1",
                            "type": "mcq",
                            "prompt": "La ville aurait pu…",
                            "options": ["agir", "agissait"],
                            "answer": 0,
                            "points": 1,
                        },
                        {
                            "id": "g2",
                            "type": "truefalse",
                            "prompt": "Les habitants ont été consultés.",
                            "answer": True,
                            "points": 1,
                        },
                    ],
                }
            ],
        },
    }


def sample_store():
    return {
        "submissions": {},
        "attempts": {
            "008": {
                "attemptId": "attempt-008",
                "examVersion": "niveau8-storage-test-v1",
                "status": "in_progress",
                "answers": {"g1": 0},
                "revision": 1,
            }
        },
        "preflight": {"008": {"audioReady": True, "audioCheckedAt": "2026-07-22T11:55:00Z"}},
        "idempotency": {},
        "events": [
            {
                "at": "2026-07-22T11:55:00Z",
                "event": "preflight_audio_delivered",
                "email": "ana@example.com",
                "studentId": "008",
                "requestId": "req-legacy-1",
                "safe": True,
            }
        ],
    }


def write_json(path, value, *, bom=False):
    text = json.dumps(value, ensure_ascii=False, indent=2) + "\n"
    encoding = "utf-8-sig" if bom else "utf-8"
    pathlib.Path(path).write_text(text, encoding=encoding)


class French8FinalExamStorageTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.root = pathlib.Path(self.temporary.name)
        self.bundle_path = self.root / "bundle.json"
        self.store_path = self.root / "store.json"
        self.db_path = self.root / "exam.sqlite3"
        write_json(self.bundle_path, sample_bundle())
        write_json(self.store_path, sample_store())
        self.repo = FinalExamRepository(self.db_path, clock=lambda: FIXED_NOW)

    def tearDown(self):
        self.temporary.cleanup()

    def initialize(self):
        return self.repo.initialize(
            legacy_bundle_path=self.bundle_path,
            legacy_store_path=self.store_path,
        )

    def test_initialization_uses_wal_full_and_imports_documents_and_legacy_audit(self):
        report = self.initialize()
        self.assertTrue(report.imported)
        self.assertEqual(report.level, "french8")
        self.assertEqual(report.bundle_sha256, hashlib.sha256(self.bundle_path.read_bytes()).hexdigest())
        self.assertEqual(report.store_sha256, hashlib.sha256(self.store_path.read_bytes()).hexdigest())

        documents = self.repo.read_documents()
        self.assertEqual(documents["bundle"].payload, sample_bundle())
        self.assertEqual(documents["store"].payload, sample_store())
        self.assertEqual(documents["bundle"].revision, 0)
        self.assertEqual(documents["store"].revision, 0)

        connection = sqlite3.connect(self.db_path)
        try:
            self.assertEqual(connection.execute("PRAGMA user_version").fetchone()[0], SCHEMA_VERSION)
            self.assertEqual(connection.execute("PRAGMA journal_mode").fetchone()[0].lower(), "wal")
            self.assertEqual(connection.execute("PRAGMA synchronous").fetchone()[0], 2)
            self.assertEqual(connection.execute("PRAGMA foreign_keys").fetchone()[0], 0)
        finally:
            connection.close()

        audit = self.repo.list_audit()
        self.assertEqual([event["eventType"] for event in audit], [
            "preflight_audio_delivered",
            "migration_completed",
        ])
        self.assertEqual(audit[0]["source"], "legacy")
        self.assertEqual(audit[0]["detail"], {"safe": True})

    def test_each_repository_connection_enables_required_pragmas(self):
        self.initialize()
        connection = self.repo._connect()  # Deliberately verify the per-operation contract.
        try:
            self.assertEqual(connection.execute("PRAGMA foreign_keys").fetchone()[0], 1)
            self.assertEqual(connection.execute("PRAGMA synchronous").fetchone()[0], 2)
            self.assertEqual(connection.execute("PRAGMA busy_timeout").fetchone()[0], 5000)
            self.assertEqual(connection.execute("PRAGMA journal_mode").fetchone()[0].lower(), "wal")
        finally:
            connection.close()

    def test_migration_is_idempotent_and_never_reimports_a_changed_json_file(self):
        first = self.initialize()
        changed = sample_bundle()
        changed["exam"]["title"] = "A stale filesystem edit"
        write_json(self.bundle_path, changed)
        self.store_path.write_text("this is now corrupt", encoding="utf-8")

        second = self.repo.initialize(
            legacy_bundle_path=self.bundle_path,
            legacy_store_path=self.store_path,
        )
        self.assertFalse(second.imported)
        self.assertEqual(second.bundle_sha256, first.bundle_sha256)
        self.assertEqual(self.repo.read_bundle()["exam"]["title"], "Examen final — Niveau 8")
        self.assertEqual(len(self.repo.list_audit(event_type="migration_completed")), 1)

    def test_incomplete_migration_ledger_is_detected_instead_of_reimported(self):
        self.initialize()
        connection = sqlite3.connect(self.db_path)
        connection.execute(
            "DELETE FROM migration_ledger WHERE level = 'french8' AND kind = 'store'"
        )
        connection.commit()
        connection.close()
        with self.assertRaisesRegex(FinalExamMigrationError, "incomplete_previous_migration"):
            self.initialize()

    def test_utf8_bom_is_accepted_without_changing_the_source_hash(self):
        write_json(self.bundle_path, sample_bundle(), bom=True)
        raw_hash = hashlib.sha256(self.bundle_path.read_bytes()).hexdigest()
        report = self.initialize()
        self.assertEqual(report.bundle_sha256, raw_hash)
        self.assertEqual(self.repo.read_bundle(), sample_bundle())

    def test_missing_store_becomes_a_normalized_empty_store(self):
        self.store_path.unlink()
        report = self.initialize()
        self.assertTrue(report.imported)
        self.assertEqual(report.store_source, "<default:store>")
        self.assertEqual(self.repo.read_store(), {
            "submissions": {}, "attempts": {}, "preflight": {}, "idempotency": {}, "events": []
        })

    def test_missing_legacy_bundle_falls_back_to_bundled_bundle(self):
        bundled = self.root / "bundled.json"
        write_json(bundled, sample_bundle())
        self.bundle_path.unlink()
        report = self.repo.initialize(
            legacy_bundle_path=self.bundle_path,
            bundled_bundle_path=bundled,
            legacy_store_path=self.store_path,
        )
        self.assertEqual(report.bundle_source, str(bundled.resolve()))

    def test_missing_all_bundle_sources_fails_closed(self):
        self.bundle_path.unlink()
        with self.assertRaisesRegex(FinalExamMigrationError, "bundle_source_missing"):
            self.repo.initialize(legacy_bundle_path=self.bundle_path, legacy_store_path=self.store_path)
        connection = sqlite3.connect(self.db_path)
        try:
            self.assertEqual(connection.execute("SELECT COUNT(*) FROM documents").fetchone()[0], 0)
            self.assertEqual(connection.execute("SELECT COUNT(*) FROM migration_ledger").fetchone()[0], 0)
        finally:
            connection.close()

    def test_corrupt_store_rolls_back_the_entire_import_and_can_be_retried(self):
        self.store_path.write_text('{"attempts": []}', encoding="utf-8")
        with self.assertRaisesRegex(FinalExamMigrationError, "invalid_store_schema:attempts"):
            self.initialize()
        connection = sqlite3.connect(self.db_path)
        try:
            self.assertEqual(connection.execute("SELECT COUNT(*) FROM documents").fetchone()[0], 0)
            self.assertEqual(connection.execute("SELECT COUNT(*) FROM audit_events").fetchone()[0], 0)
        finally:
            connection.close()

        write_json(self.store_path, sample_store())
        self.assertTrue(self.initialize().imported)
        self.assertEqual(self.repo.read_store(), sample_store())

    def test_strict_json_rejects_truncation_duplicate_keys_invalid_utf8_and_non_object_root(self):
        invalid_payloads = (
            b'{"state":',
            b'{"state":{},"state":{},"exam":{}}',
            b"\xff\xfe\x00\x01",
            b"[]",
        )
        for index, payload in enumerate(invalid_payloads):
            with self.subTest(index=index), tempfile.TemporaryDirectory() as temp_dir:
                root = pathlib.Path(temp_dir)
                bundle_path = root / "bundle.json"
                store_path = root / "store.json"
                bundle_path.write_bytes(payload)
                write_json(store_path, {})
                repo = FinalExamRepository(root / "db.sqlite3", clock=lambda: FIXED_NOW)
                with self.assertRaises(FinalExamMigrationError):
                    repo.initialize(bundle_path, None, store_path)

    def test_strict_schema_rejects_duplicate_question_and_cross_student_attempt_ids(self):
        duplicate_bundle = sample_bundle()
        duplicate_bundle["exam"]["sections"][0]["questions"][1]["id"] = "g1"
        write_json(self.bundle_path, duplicate_bundle)
        with self.assertRaisesRegex(FinalExamMigrationError, "duplicate_question_id"):
            self.initialize()

        self.db_path.unlink(missing_ok=True)
        write_json(self.bundle_path, sample_bundle())
        invalid_store = sample_store()
        invalid_store["attempts"]["009"] = {"attemptId": "attempt-008"}
        write_json(self.store_path, invalid_store)
        with self.assertRaisesRegex(FinalExamMigrationError, "duplicate_attempt_id"):
            self.initialize()

    def test_same_attempt_id_in_attempt_and_its_submission_is_valid(self):
        store = sample_store()
        store["attempts"]["008"]["status"] = "submitted"
        store["submissions"]["008"] = {
            "attemptId": "attempt-008",
            "receiptCode": "JLF-TEST-008",
            "grade": 5,
        }
        write_json(self.store_path, store)
        self.initialize()
        self.assertEqual(self.repo.read_store(), store)

    def test_document_transaction_commits_bundle_store_and_audit_together(self):
        self.initialize()
        with self.repo.transaction(write=True) as transaction:
            bundle = transaction.get_bundle()
            store = transaction.get_store()
            bundle.payload["state"]["isOpen"] = True
            store.payload["events"].append({"event": "exam_opened"})
            next_bundle = transaction.put_bundle(bundle.payload, bundle.revision)
            next_store = transaction.put_store(store.payload, store.revision)
            event_id = transaction.append_audit(
                "exam_opened", actor_email="teacher@example.com", request_id="req-open"
            )
        self.assertEqual(next_bundle.revision, 1)
        self.assertEqual(next_store.revision, 1)
        self.assertTrue(self.repo.read_bundle()["state"]["isOpen"])
        self.assertEqual(self.repo.list_audit(after_id=event_id - 1)[0]["requestId"], "req-open")

    def test_exception_rolls_back_both_documents_and_audit(self):
        self.initialize()
        original = self.repo.read_documents()
        original_audit_count = len(self.repo.list_audit())
        with self.assertRaisesRegex(RuntimeError, "injected"):
            with self.repo.transaction(write=True) as transaction:
                bundle = transaction.get_bundle()
                store = transaction.get_store()
                bundle.payload["state"]["isOpen"] = True
                store.payload["preflight"]["009"] = {"audioReady": True}
                transaction.put_bundle(bundle.payload, bundle.revision)
                transaction.put_store(store.payload, store.revision)
                transaction.append_audit("should_rollback")
                raise RuntimeError("injected")
        current = self.repo.read_documents()
        self.assertEqual(current["bundle"], original["bundle"])
        self.assertEqual(current["store"], original["store"])
        self.assertEqual(len(self.repo.list_audit()), original_audit_count)

    def test_read_only_transaction_rejects_mutation(self):
        self.initialize()
        with self.repo.transaction() as transaction:
            with self.assertRaisesRegex(FinalExamStorageError, "read_only_transaction"):
                transaction.put_bundle(transaction.get_bundle().payload)

    def test_transactions_use_distinct_connections_and_busy_lock_fails_explicitly(self):
        self.initialize()
        with self.repo.transaction() as first:
            with self.repo.transaction() as second:
                self.assertIsNot(first.connection, second.connection)

        locker = sqlite3.connect(self.db_path, isolation_level=None)
        locker.execute("BEGIN IMMEDIATE")
        fast_fail = FinalExamRepository(
            self.db_path, busy_timeout_ms=100, clock=lambda: FIXED_NOW
        )
        try:
            with self.assertRaisesRegex(FinalExamStorageError, "sqlite_transaction_failed"):
                fast_fail.put_store(self.repo.read_store())
        finally:
            locker.rollback()
            locker.close()

    def test_cas_rejects_stale_document_and_atomic_replace_rolls_back_first_update(self):
        self.initialize()
        bundle = self.repo.get_bundle()
        store = self.repo.get_store()
        updated = sample_bundle()
        updated["state"]["revision"] = 1
        self.repo.put_bundle(updated, expected_revision=bundle.revision)
        with self.assertRaisesRegex(FinalExamConflictError, "stale_document:bundle"):
            self.repo.put_bundle(sample_bundle(), expected_revision=bundle.revision)

        before = self.repo.read_documents()
        replacement_bundle = json.loads(json.dumps(before["bundle"].payload))
        replacement_bundle["state"]["durationMinutes"] = 75
        replacement_store = json.loads(json.dumps(before["store"].payload))
        replacement_store["preflight"]["009"] = {"audioReady": True}
        with self.assertRaisesRegex(FinalExamConflictError, "stale_document:store"):
            self.repo.replace_documents(
                replacement_bundle,
                replacement_store,
                expected_bundle_revision=before["bundle"].revision,
                expected_store_revision=store.revision + 99,
            )
        after = self.repo.read_documents()
        self.assertEqual(after, before)

    def test_non_finite_document_values_are_rejected(self):
        self.initialize()
        bundle = self.repo.read_bundle()
        bundle["exam"]["totalPoints"] = float("nan")
        with self.assertRaisesRegex(FinalExamStorageError, "invalid_json_value"):
            self.repo.put_bundle(bundle)

    def test_tampered_document_fails_closed_in_reads_and_health(self):
        self.initialize()
        connection = sqlite3.connect(self.db_path)
        connection.execute(
            "UPDATE documents SET payload_json = '[]' WHERE level = 'french8' AND kind = 'bundle'"
        )
        connection.commit()
        connection.close()
        with self.assertRaisesRegex(FinalExamStorageError, "corrupt_document:bundle"):
            self.repo.get_bundle()
        health = self.repo.health()
        self.assertFalse(health["ok"])
        self.assertIn("error", health)

    def test_audit_is_append_only_filterable_paginated_and_transactional(self):
        self.initialize()
        first = self.repo.append_audit("draft_saved", student_id="008", detail={"revision": 2})
        second = self.repo.append_audit("draft_saved", student_id="009", detail={"revision": 1})
        third = self.repo.append_audit("submission_recorded", student_id="008")
        page = self.repo.list_audit(after_id=first, limit=1)
        self.assertEqual([item["id"] for item in page], [second])
        self.assertEqual(
            [item["id"] for item in self.repo.list_audit(event_type="draft_saved", student_id="008")],
            [first],
        )
        self.assertEqual(self.repo.list_audit(after_id=third), [])

        connection = sqlite3.connect(self.db_path)
        try:
            with self.assertRaisesRegex(sqlite3.IntegrityError, "audit_events_append_only"):
                connection.execute("UPDATE audit_events SET event_type = 'tampered' WHERE id = ?", (first,))
            with self.assertRaisesRegex(sqlite3.IntegrityError, "audit_events_append_only"):
                connection.execute("DELETE FROM audit_events WHERE id = ?", (first,))
        finally:
            connection.close()

    def test_rate_windows_are_atomic_persistent_and_reset_exactly_at_boundary(self):
        self.initialize()
        subject_hash = hashlib.sha256(b"actor-008").hexdigest()
        base = datetime(2026, 7, 22, 12, 0, 3, tzinfo=timezone.utc)

        def consume(_index):
            return self.repo.consume_rate_window(
                "draft", subject_hash, limit=5, window_seconds=60, now=base
            )

        with ThreadPoolExecutor(max_workers=20) as executor:
            decisions = list(executor.map(consume, range(20)))
        self.assertEqual(sum(item.allowed for item in decisions), 5)
        self.assertEqual(sum(not item.allowed for item in decisions), 15)

        restarted = FinalExamRepository(self.db_path, clock=lambda: FIXED_NOW)
        blocked = restarted.consume_rate_window(
            "draft", subject_hash, limit=5, window_seconds=60, now=base + timedelta(seconds=10)
        )
        self.assertFalse(blocked.allowed)
        self.assertGreater(blocked.retry_after_seconds, 0)

        boundary = datetime(2026, 7, 22, 12, 1, 0, tzinfo=timezone.utc)
        fresh = restarted.consume_rate_window(
            "draft", subject_hash, limit=5, window_seconds=60, now=boundary
        )
        self.assertTrue(fresh.allowed)
        self.assertEqual(fresh.hits, 1)
        self.assertEqual(fresh.remaining, 4)
        self.assertEqual(restarted.clear_rate_window("draft", subject_hash), 2)

    def test_rate_limit_rejects_raw_subject_and_can_prune_old_windows(self):
        self.initialize()
        with self.assertRaisesRegex(ValueError, "invalid_subject_hash"):
            self.repo.consume_rate_window("login", "ana@example.com", limit=5, window_seconds=60)
        subject_hash = hashlib.sha256(b"ip").hexdigest()
        self.repo.consume_rate_window(
            "login", subject_hash, limit=5, window_seconds=60, now="2026-07-22T10:00:00Z"
        )
        self.assertEqual(self.repo.prune_rate_windows("2026-07-22T10:02:00Z"), 1)

    def test_alerts_deduplicate_acknowledge_resolve_and_reopen(self):
        self.initialize()
        first = self.repo.record_alert(
            "audio_missing", "critical", message="Audio unavailable", context={"pathHash": "abc"}
        )
        repeated = self.repo.record_alert("audio_missing", "error", message="Still unavailable")
        self.assertEqual(first["occurrences"], 1)
        self.assertEqual(repeated["occurrences"], 2)
        self.assertEqual(repeated["severity"], "error")

        acknowledged = self.repo.acknowledge_alert("audio_missing", "teacher@example.com")
        self.assertEqual(acknowledged["status"], "acknowledged")
        acknowledged_again = self.repo.acknowledge_alert("audio_missing", "other@example.com")
        self.assertEqual(acknowledged_again["acknowledgedBy"], "teacher@example.com")
        resolved = self.repo.resolve_alert(
            "audio_missing", "admin@example.com", resolution="Audio restored"
        )
        self.assertEqual(resolved["status"], "resolved")
        self.assertEqual(self.repo.list_alerts(active_only=True), [])

        reopened = self.repo.record_alert("audio_missing", "critical", message="Missing again")
        self.assertEqual(reopened["status"], "open")
        self.assertEqual(reopened["occurrences"], 3)
        self.assertIsNone(reopened["acknowledgedAt"])
        self.assertIsNone(reopened["resolvedAt"])
        audit_types = [event["eventType"] for event in self.repo.list_audit()]
        self.assertIn("alert_acknowledged", audit_types)
        self.assertIn("alert_resolved", audit_types)
        self.assertIn("alert_reopened", audit_types)

    def test_alert_validation_and_missing_alert_are_safe(self):
        self.initialize()
        with self.assertRaisesRegex(ValueError, "invalid_alert_severity"):
            self.repo.record_alert("bad", "urgent")
        with self.assertRaisesRegex(ValueError, "alert_actor_required"):
            self.repo.acknowledge_alert("missing", "")
        with self.assertRaises(KeyError):
            self.repo.resolve_alert("missing", "admin@example.com")

    def test_grade_outbox_enqueue_is_idempotent_and_detects_conflicts(self):
        self.initialize()
        item_id = self.repo.enqueue_grade_sync(
            "008", 4.75, "attempt-008", payload={"receiptCode": "JLF-008"}
        )
        duplicate_id = self.repo.enqueue_grade_sync(
            "008", 4.75, "attempt-008", payload={"receiptCode": "JLF-008"}
        )
        self.assertEqual(duplicate_id, item_id)
        with self.assertRaisesRegex(FinalExamConflictError, "grade_idempotency_conflict"):
            self.repo.enqueue_grade_sync(
                "008", 3.0, "attempt-008", payload={"receiptCode": "JLF-008"}
            )
        rows = self.repo.list_grade_outbox()
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]["status"], "pending")

    def test_grade_outbox_leases_fence_old_workers_retry_and_complete(self):
        self.initialize()
        self.repo.enqueue_grade_sync("008", 5.0, "attempt-008")
        start = datetime(2026, 7, 22, 12, 0, tzinfo=timezone.utc)
        first = self.repo.claim_grade_outbox("worker-a", now=start, lease_seconds=10)
        self.assertEqual(len(first), 1)
        self.assertEqual(first[0]["attempts"], 1)
        self.assertEqual(self.repo.claim_grade_outbox("worker-b", now=start, lease_seconds=10), [])

        reclaimed = self.repo.claim_grade_outbox(
            "worker-b", now=start + timedelta(seconds=11), lease_seconds=10
        )
        self.assertEqual(len(reclaimed), 1)
        self.assertEqual(reclaimed[0]["attempts"], 2)
        with self.assertRaisesRegex(FinalExamConflictError, "grade_claim_lost"):
            self.repo.complete_grade_outbox(
                first[0]["id"], "worker-a", first[0]["claimToken"], now=start + timedelta(seconds=11)
            )

        retry = self.repo.retry_grade_outbox(
            reclaimed[0]["id"],
            "worker-b",
            reclaimed[0]["claimToken"],
            "gradebook temporarily unavailable",
            retry_after_seconds=30,
            now=start + timedelta(seconds=12),
        )
        self.assertEqual(retry["status"], "retry")
        self.assertEqual(self.repo.claim_grade_outbox("worker-c", now=start + timedelta(seconds=40)), [])
        final_claim = self.repo.claim_grade_outbox("worker-c", now=start + timedelta(seconds=43))
        completed = self.repo.complete_grade_outbox(
            final_claim[0]["id"],
            "worker-c",
            final_claim[0]["claimToken"],
            now=start + timedelta(seconds=44),
        )
        self.assertEqual(completed["status"], "done")
        self.assertIsNotNone(completed["completedAt"])

    def test_concurrent_grade_claims_never_return_the_same_item(self):
        self.initialize()
        for index in range(20):
            self.repo.enqueue_grade_sync(
                f"{index:03d}", 4.0, f"attempt-{index:03d}", idempotency_key=f"grade-{index:03d}"
            )
        barrier = threading.Barrier(4)

        def claim(worker_index):
            barrier.wait()
            return self.repo.claim_grade_outbox(f"worker-{worker_index}", limit=20, now=FIXED_NOW)

        with ThreadPoolExecutor(max_workers=4) as executor:
            batches = list(executor.map(claim, range(4)))
        identifiers = [item["id"] for batch in batches for item in batch]
        self.assertEqual(len(identifiers), 20)
        self.assertEqual(len(set(identifiers)), 20)

    def test_scheduler_state_uses_lease_and_fencing_tokens(self):
        self.initialize()
        start = datetime(2026, 7, 22, 12, 0, tzinfo=timezone.utc)
        token_a = self.repo.acquire_scheduler_lease("worker-a", lease_seconds=10, now=start)
        self.assertTrue(token_a)
        self.assertIsNone(self.repo.acquire_scheduler_lease("worker-b", lease_seconds=10, now=start))
        self.assertEqual(
            self.repo.acquire_scheduler_lease("worker-a", lease_seconds=10, now=start), token_a
        )
        tick = self.repo.record_scheduler_tick(
            "worker-a", token_a, success=True, state={"nextDue": "close"}, now=start
        )
        self.assertEqual(tick["revision"], 1)
        self.assertEqual(tick["state"], {"nextDue": "close"})
        self.assertEqual(tick["consecutiveFailures"], 0)

        token_b = self.repo.acquire_scheduler_lease(
            "worker-b", lease_seconds=10, now=start + timedelta(seconds=61)
        )
        self.assertTrue(token_b)
        self.assertNotEqual(token_b, token_a)
        with self.assertRaisesRegex(FinalExamConflictError, "scheduler_lease_lost"):
            self.repo.heartbeat_scheduler(
                "worker-a", token_a, now=start + timedelta(seconds=61)
            )
        failed = self.repo.record_scheduler_tick(
            "worker-b",
            token_b,
            success=False,
            error="injected failure",
            now=start + timedelta(seconds=61),
        )
        self.assertEqual(failed["consecutiveFailures"], 1)
        self.assertEqual(failed["lastError"], "injected failure")
        self.assertTrue(
            self.repo.release_scheduler_lease(
                "worker-b", token_b, now=start + timedelta(seconds=62)
            )
        )
        self.assertFalse(self.repo.release_scheduler_lease("worker-b", token_b))

    def test_health_reports_documents_operations_and_deep_integrity(self):
        self.initialize()
        self.repo.record_alert("disk_low", "warning")
        self.repo.enqueue_grade_sync("008", 5.0, "attempt-008")
        health = self.repo.health(deep=True)
        self.assertTrue(health["ok"], health)
        self.assertEqual(health["schemaVersion"], SCHEMA_VERSION)
        self.assertEqual(health["journalMode"], "wal")
        self.assertEqual(health["synchronous"], 2)
        self.assertEqual(health["documents"], ["bundle", "store"])
        self.assertTrue(health["migrationComplete"])
        self.assertEqual(health["activeAlerts"], 1)
        self.assertEqual(health["pendingGradeOutbox"], 1)
        self.assertGreater(health["databaseBytes"], 0)
        self.assertGreater(health["freeBytes"], 0)

    def test_health_fails_closed_before_initialization(self):
        empty = FinalExamRepository(self.root / "empty.sqlite3", clock=lambda: FIXED_NOW)
        health = empty.health()
        self.assertFalse(health["ok"])
        self.assertIn("error", health)

    def test_backup_is_consistent_standalone_and_does_not_copy_only_wal(self):
        self.initialize()
        store = self.repo.get_store()
        store.payload["preflight"]["009"] = {"audioReady": True}
        self.repo.put_store(store.payload, store.revision)
        target = self.root / "backups" / "exam-backup.sqlite3"
        metadata = self.repo.backup(target)
        self.assertEqual(metadata["path"], str(target.resolve()))
        self.assertGreater(metadata["bytes"], 0)

        backup_repo = FinalExamRepository(target, clock=lambda: FIXED_NOW)
        report = backup_repo.initialize()
        self.assertFalse(report.imported)
        self.assertEqual(backup_repo.read_store(), self.repo.read_store())
        self.assertTrue(backup_repo.health()["ok"])
        with self.assertRaisesRegex(ValueError, "backup_target_matches_source"):
            self.repo.backup(self.db_path)

    def test_export_legacy_uses_one_snapshot_and_round_trips_unicode(self):
        self.initialize()
        bundle = self.repo.get_bundle()
        bundle.payload["exam"]["title"] = "Évaluation finale — données privées"
        self.repo.put_bundle(bundle.payload, bundle.revision)
        bundle_export = self.root / "export" / "bundle.json"
        store_export = self.root / "export" / "store.json"
        metadata = self.repo.export_legacy(bundle_export, store_export)
        self.assertEqual(metadata["bundleRevision"], 1)
        self.assertEqual(json.loads(bundle_export.read_text(encoding="utf-8")), self.repo.read_bundle())
        self.assertEqual(json.loads(store_export.read_text(encoding="utf-8")), self.repo.read_store())
        with self.assertRaisesRegex(ValueError, "export_targets_must_differ"):
            self.repo.export_legacy(bundle_export, bundle_export)

    def test_unsupported_future_schema_version_is_rejected(self):
        connection = sqlite3.connect(self.db_path)
        connection.execute("PRAGMA user_version = 99")
        connection.close()
        with self.assertRaisesRegex(FinalExamStorageError, "unsupported_schema_version:99"):
            self.initialize()


if __name__ == "__main__":
    unittest.main(verbosity=2)
