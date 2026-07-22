#!/usr/bin/env python3
"""Focused tests for transactional publication of the Niveau 8 exam bank."""

from __future__ import annotations

import copy
import hashlib
import io
import json
import os
import pathlib
import sqlite3
import tempfile
import unittest
from contextlib import redirect_stderr, redirect_stdout
from unittest import mock


ROOT = pathlib.Path(__file__).resolve().parents[1]
if str(ROOT) not in os.sys.path:
    os.sys.path.insert(0, str(ROOT))

from server.final_exam_storage import FinalExamConflictError, FinalExamRepository
from server.french8_exam_publisher import (
    ExamBankPublicationError,
    canonical_sha256,
    load_exam_bank,
    main,
    publish_exam_bank,
    validate_french8_exam,
)


SOURCE_BANK = ROOT / "data" / "french8-final-exam.local.json"


def write_json(path: pathlib.Path, value) -> None:
    path.write_text(
        json.dumps(value, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


class French8ExamPublisherTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.root = pathlib.Path(self.temporary.name)
        self.source_bundle = json.loads(SOURCE_BANK.read_text(encoding="utf-8"))
        self.current_bundle = copy.deepcopy(self.source_bundle)
        self.current_bundle["exam"]["version"] = "publisher-old-v1"
        self.current_bundle["state"].update(
            {
                "isOpen": False,
                "scheduleEnabled": False,
                "opensAt": None,
                "closesAt": None,
                "openingGate": None,
                "revision": 17,
                "publisherSentinel": {"keep": [1, "deux", True]},
            }
        )
        self.store = {
            "submissions": {},
            "attempts": {},
            "preflight": {"008": {"audioReady": True, "marker": "preserve"}},
            "idempotency": {"historical": {"marker": "preserve"}},
            "events": [{"event": "historical_event", "marker": "preserve"}],
            "publisherSentinel": {"nested": ["unchanged"]},
        }
        self.current_path = self.root / "current.json"
        self.store_path = self.root / "store.json"
        self.db_path = self.root / "exam.sqlite3"
        write_json(self.current_path, self.current_bundle)
        write_json(self.store_path, self.store)
        self.repository = FinalExamRepository(self.db_path, level="french8")
        self.repository.initialize(
            legacy_bundle_path=self.current_path,
            legacy_store_path=self.store_path,
        )
        self.backup_path = self.root / "backup.sqlite3"
        self.repository.backup(self.backup_path)
        self.backup_sha256 = hashlib.sha256(self.backup_path.read_bytes()).hexdigest()

    def tearDown(self):
        self.temporary.cleanup()

    def publish(self, source=SOURCE_BANK, **kwargs):
        values = {
            "release_id": "test-release-1",
            "actor_email": "release-test@example.com",
            "backup_path": str(self.backup_path),
            "backup_sha256": self.backup_sha256,
        }
        values.update(kwargs)
        return publish_exam_bank(self.repository, source, **values)

    def raw_store_row(self):
        connection = sqlite3.connect(self.db_path)
        try:
            return connection.execute(
                "SELECT payload_json, revision, updated_at FROM documents "
                "WHERE level = 'french8' AND kind = 'store'"
            ).fetchone()
        finally:
            connection.close()

    def candidate_path(self, mutation=None, *, state_mutation=None):
        candidate = copy.deepcopy(self.source_bundle)
        if mutation:
            mutation(candidate["exam"])
        if state_mutation:
            state_mutation(candidate["state"])
        path = self.root / ("candidate-%d.json" % len(list(self.root.glob("candidate-*.json"))))
        write_json(path, candidate)
        return path

    def test_apply_replaces_only_exam_and_appends_one_audit(self):
        before = self.repository.read_documents()
        raw_store_before = self.raw_store_row()
        state_before = copy.deepcopy(before["bundle"].payload["state"])
        store_before = copy.deepcopy(before["store"].payload)

        report = self.publish()

        after = self.repository.read_documents()
        self.assertEqual(report["mode"], "published")
        self.assertTrue(report["changed"])
        self.assertEqual(after["bundle"].payload["exam"], self.source_bundle["exam"])
        self.assertEqual(after["bundle"].payload["state"], state_before)
        self.assertEqual(after["bundle"].revision, before["bundle"].revision + 1)
        self.assertEqual(after["store"].payload, store_before)
        self.assertEqual(after["store"].revision, before["store"].revision)
        self.assertEqual(after["store"].updated_at, before["store"].updated_at)
        self.assertEqual(self.raw_store_row(), raw_store_before)

        events = self.repository.list_audit(event_type="exam_bank_published")
        self.assertEqual(len(events), 1)
        event = events[0]
        self.assertEqual(event["id"], report["auditEventId"])
        self.assertEqual(event["source"], "release")
        self.assertEqual(event["requestId"], "test-release-1")
        self.assertEqual(event["detail"]["oldVersion"], "publisher-old-v1")
        self.assertEqual(event["detail"]["newVersion"], self.source_bundle["exam"]["version"])
        self.assertEqual(event["detail"]["stateSha256"], canonical_sha256(state_before))
        self.assertEqual(event["detail"]["storeSha256"], canonical_sha256(store_before))
        self.assertEqual(event["detail"]["storeRevision"], before["store"].revision)
        self.assertEqual(event["detail"]["backupSha256"], self.backup_sha256)

    def test_candidate_state_is_ignored(self):
        path = self.candidate_path(
            state_mutation=lambda state: state.update(
                {"isOpen": True, "scheduleEnabled": True, "revision": 9999}
            )
        )
        state_before = copy.deepcopy(self.repository.read_bundle()["state"])
        self.publish(path)
        self.assertEqual(self.repository.read_bundle()["state"], state_before)

    def test_dry_run_is_strictly_read_only(self):
        documents_before = self.repository.read_documents()
        raw_store_before = self.raw_store_row()
        audit_before = self.repository.list_audit()
        report = publish_exam_bank(self.repository, SOURCE_BANK, dry_run=True)
        self.assertEqual(report["mode"], "dry-run")
        self.assertTrue(report["changed"])
        self.assertEqual(self.repository.read_documents(), documents_before)
        self.assertEqual(self.raw_store_row(), raw_store_before)
        self.assertEqual(self.repository.list_audit(), audit_before)

    def test_exact_same_bank_is_an_idempotent_noop(self):
        first = self.publish()
        documents_before = self.repository.read_documents()
        audit_before = self.repository.list_audit(event_type="exam_bank_published")
        second = self.publish()
        self.assertEqual(first["mode"], "published")
        self.assertEqual(second["mode"], "unchanged")
        self.assertFalse(second["changed"])
        self.assertEqual(self.repository.read_documents(), documents_before)
        self.assertEqual(
            self.repository.list_audit(event_type="exam_bank_published"), audit_before
        )

    def test_stale_expected_revision_aborts_without_audit(self):
        before = self.repository.read_documents()
        with self.assertRaisesRegex(FinalExamConflictError, "stale_document:bundle"):
            self.publish(expected_bundle_revision=before["bundle"].revision + 1)
        self.assertEqual(self.repository.read_documents(), before)
        self.assertEqual(self.repository.list_audit(event_type="exam_bank_published"), [])

    def test_audit_failure_rolls_back_bundle(self):
        before = self.repository.read_documents()
        with mock.patch(
            "server.final_exam_storage.FinalExamTransaction.append_audit",
            side_effect=RuntimeError("injected audit failure"),
        ):
            with self.assertRaisesRegex(RuntimeError, "injected audit failure"):
                self.publish()
        self.assertEqual(self.repository.read_documents(), before)
        self.assertEqual(self.repository.list_audit(event_type="exam_bank_published"), [])

    def test_rejects_open_scheduled_and_pending_opening_gate(self):
        mutations = (
            lambda state: state.update({"isOpen": True}),
            lambda state: state.update({"scheduleEnabled": True}),
            lambda state: state.update({"scheduleEnabled": 0}),
            lambda state: state.update(
                {"scheduleEnabled": False, "openingGate": {"status": "pending"}}
            ),
        )
        for mutation in mutations:
            with self.subTest(mutation=mutation):
                bundle = self.repository.get_bundle()
                original = copy.deepcopy(bundle.payload)
                changed = copy.deepcopy(bundle.payload)
                mutation(changed["state"])
                self.repository.put_bundle(changed, bundle.revision)
                try:
                    with self.assertRaises(ExamBankPublicationError):
                        self.publish()
                    self.assertEqual(
                        self.repository.list_audit(event_type="exam_bank_published"), []
                    )
                finally:
                    latest = self.repository.get_bundle()
                    self.repository.put_bundle(original, latest.revision)

    def test_legacy_missing_schedule_flag_requires_empty_schedule_fields(self):
        bundle = self.repository.get_bundle()
        changed = copy.deepcopy(bundle.payload)
        changed["state"].pop("scheduleEnabled", None)
        changed["state"]["opensAt"] = "2026-07-30T12:00:00Z"
        self.repository.put_bundle(changed, bundle.revision)
        with self.assertRaisesRegex(ExamBankPublicationError, "legacy_schedule_state_must_be_empty"):
            self.publish()

    def test_rejects_any_attempt_or_submission(self):
        cases = (
            ("attempts", {"008": {"status": "submitted", "attemptId": "attempt-8"}}),
            ("submissions", {"008": {"attemptId": "attempt-8"}}),
        )
        for collection, value in cases:
            with self.subTest(collection=collection):
                store = self.repository.get_store()
                original = copy.deepcopy(store.payload)
                changed = copy.deepcopy(store.payload)
                changed[collection] = value
                self.repository.put_store(changed, store.revision)
                try:
                    with self.assertRaises(ExamBankPublicationError):
                        self.publish()
                finally:
                    latest = self.repository.get_store()
                    self.repository.put_store(original, latest.revision)

    def test_same_version_with_different_content_is_rejected(self):
        path = self.candidate_path(
            lambda exam: exam.update(
                {"version": "publisher-old-v1", "title": exam["title"] + " modifié"}
            )
        )
        before = self.repository.read_documents()
        with self.assertRaisesRegex(
            ExamBankPublicationError, "exam_version_reused_with_different_content"
        ):
            self.publish(path)
        self.assertEqual(self.repository.read_documents(), before)

    def test_invalid_banks_are_rejected_without_writes(self):
        def duplicate_id(exam):
            questions = [q for section in exam["sections"] for q in section["questions"]]
            questions[1]["id"] = questions[0]["id"]

        def invalid_answer(exam):
            question = next(
                q
                for section in exam["sections"]
                for q in section["questions"]
                if q["type"] == "mcq"
            )
            question["answer"] = len(question["options"])

        def remove_question(exam):
            exam["sections"][0]["questions"].pop()

        mutations = {
            "wrong id": lambda exam: exam.update({"id": "another-exam"}),
            "empty version": lambda exam: exam.update({"version": ""}),
            "wrong total": lambda exam: exam.update({"totalPoints": 49}),
            "duplicate id": duplicate_id,
            "invalid answer": invalid_answer,
            "unsupported type": lambda exam: exam["sections"][0]["questions"][0].update(
                {"type": "text", "answer": "bonjour"}
            ),
            "missing question": remove_question,
            "negative points": lambda exam: exam["sections"][0]["questions"][0].update(
                {"points": -1}
            ),
        }
        before = self.repository.read_documents()
        audit_before = self.repository.list_audit()
        for label, mutation in mutations.items():
            with self.subTest(label=label):
                path = self.candidate_path(mutation)
                with self.assertRaises(ExamBankPublicationError):
                    self.publish(path)
                self.assertEqual(self.repository.read_documents(), before)
                self.assertEqual(self.repository.list_audit(), audit_before)

    def test_strict_loader_rejects_duplicate_keys_nan_and_invalid_utf8(self):
        invalid_values = (
            b'{"exam": {}, "exam": {}}',
            b'{"exam": {"totalPoints": NaN}}',
            b"\xff\xfe\x00",
        )
        for index, raw in enumerate(invalid_values):
            path = self.root / ("invalid-%d.json" % index)
            path.write_bytes(raw)
            with self.subTest(index=index):
                with self.assertRaises(ExamBankPublicationError):
                    load_exam_bank(path)

    def test_validate_real_bank_and_validate_only_cli(self):
        exam, source_sha256 = load_exam_bank(SOURCE_BANK)
        validation = validate_french8_exam(exam)
        self.assertEqual(validation["questions"], 50)
        self.assertEqual(validation["totalPoints"], 50)
        self.assertEqual(source_sha256, hashlib.sha256(SOURCE_BANK.read_bytes()).hexdigest())
        self.assertEqual(main(["--bundle", str(SOURCE_BANK), "--validate-only"]), 0)

    def test_apply_cli_uses_explicit_cas_plan_and_backup_metadata(self):
        current = self.repository.get_bundle()
        output = io.StringIO()
        with redirect_stdout(output):
            status = main(
                [
                    "--bundle",
                    str(SOURCE_BANK),
                    "--database",
                    str(self.db_path),
                    "--apply",
                    "--release-id",
                    "cli-release-1",
                    "--backup-path",
                    str(self.backup_path),
                    "--backup-sha256",
                    self.backup_sha256,
                    "--expected-bundle-revision",
                    str(current.revision),
                    "--expected-current-version",
                    "publisher-old-v1",
                ]
            )
        self.assertEqual(status, 0)
        report = json.loads(output.getvalue())
        self.assertEqual(report["mode"], "published")
        self.assertEqual(report["bundleRevisionBefore"], current.revision)
        self.assertEqual(
            len(self.repository.list_audit(event_type="exam_bank_published")), 1
        )

    def test_missing_database_fails_without_creating_it(self):
        missing = self.root / "missing.sqlite3"
        errors = io.StringIO()
        with redirect_stderr(errors):
            status = main(
                ["--bundle", str(SOURCE_BANK), "--database", str(missing), "--dry-run"]
            )
        self.assertEqual(status, 1)
        self.assertFalse(missing.exists())
        self.assertIn("database_not_regular", errors.getvalue())

    def test_postflight_mode_rejects_a_database_that_does_not_match(self):
        documents_before = self.repository.read_documents()
        errors = io.StringIO()
        with redirect_stderr(errors):
            status = main(
                [
                    "--bundle",
                    str(SOURCE_BANK),
                    "--database",
                    str(self.db_path),
                    "--dry-run",
                    "--require-unchanged",
                ]
            )
        self.assertEqual(status, 1)
        self.assertIn("persisted_exam_bank_mismatch", errors.getvalue())
        self.assertEqual(self.repository.read_documents(), documents_before)


if __name__ == "__main__":
    unittest.main(verbosity=2)
