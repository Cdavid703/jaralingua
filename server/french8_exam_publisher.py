#!/usr/bin/env python3
"""Safely publish the persistent French 8 final-exam question bank.

Only ``bundle.exam`` is replaceable.  The persisted state and store are treated
as operational records: their values (and the store row revision/bytes) must not
change during a publication.  The command is intentionally usable while the
HTTP service is stopped by the reversible release script.
"""

from __future__ import annotations

import argparse
import copy
import hashlib
import json
import math
import os
import pathlib
import re
import sys
from typing import Any, Dict, Mapping, Optional, Sequence, Tuple

try:  # Package import in tests and direct-script import in production.
    from .final_exam_storage import (
        FinalExamConflictError,
        FinalExamRepository,
        FinalExamStorageError,
    )
except ImportError:  # pragma: no cover - exercised by the release command.
    from final_exam_storage import (  # type: ignore
        FinalExamConflictError,
        FinalExamRepository,
        FinalExamStorageError,
    )


EXAM_ID = "french8-final-exam"
EXPECTED_QUESTION_COUNT = 50
EXPECTED_TOTAL_POINTS = 50.0
ALLOWED_QUESTION_TYPES = frozenset(("mcq", "truefalse"))
_SAFE_IDENTIFIER = re.compile(r"^[A-Za-z0-9][A-Za-z0-9_.:-]{0,79}$")
_SAFE_RELEASE_ID = re.compile(r"^[A-Za-z0-9][A-Za-z0-9_.:-]{0,159}$")
_SHA256 = re.compile(r"^[0-9a-f]{64}$")


class ExamBankPublicationError(RuntimeError):
    """A fail-closed publication or validation error."""


class _DuplicateKeyError(ValueError):
    pass


def _unique_pairs(pairs: Sequence[Tuple[str, Any]]) -> Dict[str, Any]:
    result: Dict[str, Any] = {}
    for key, value in pairs:
        if key in result:
            raise _DuplicateKeyError("duplicate_json_key:" + str(key))
        result[key] = value
    return result


def _reject_constant(value: str) -> None:
    raise ValueError("invalid_json_constant:" + value)


def _canonical_json(value: Any) -> bytes:
    try:
        return json.dumps(
            value,
            ensure_ascii=False,
            sort_keys=True,
            separators=(",", ":"),
            allow_nan=False,
        ).encode("utf-8")
    except (TypeError, ValueError, RecursionError) as error:
        raise ExamBankPublicationError("invalid_json_value") from error


def canonical_sha256(value: Any) -> str:
    return hashlib.sha256(_canonical_json(value)).hexdigest()


def load_exam_bank(path: os.PathLike[str] | str) -> Tuple[Dict[str, Any], str]:
    """Load only the staged ``exam`` object with strict JSON parsing."""

    source = pathlib.Path(path)
    if not source.is_file() or source.is_symlink():
        raise ExamBankPublicationError("exam_bank_source_not_regular")
    try:
        raw = source.read_bytes()
        payload = json.loads(
            raw.decode("utf-8-sig"),
            object_pairs_hook=_unique_pairs,
            parse_constant=_reject_constant,
        )
    except (_DuplicateKeyError, UnicodeError, json.JSONDecodeError, ValueError, RecursionError) as error:
        raise ExamBankPublicationError("invalid_exam_bank_json") from error
    if not isinstance(payload, dict) or not isinstance(payload.get("exam"), dict):
        raise ExamBankPublicationError("invalid_exam_bank_root")
    exam = copy.deepcopy(payload["exam"])
    validate_french8_exam(exam)
    return exam, hashlib.sha256(raw).hexdigest()


def _required_identifier(value: Any, label: str) -> str:
    if not isinstance(value, str) or value != value.strip() or not _SAFE_IDENTIFIER.fullmatch(value):
        raise ExamBankPublicationError("invalid_" + label)
    return value


def _required_text(value: Any, label: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise ExamBankPublicationError("invalid_" + label)
    return value


def _finite_number(value: Any, label: str) -> float:
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise ExamBankPublicationError("invalid_" + label)
    result = float(value)
    if not math.isfinite(result):
        raise ExamBankPublicationError("invalid_" + label)
    return result


def validate_french8_exam(exam: Mapping[str, Any]) -> Dict[str, Any]:
    """Validate the closed-response, 50-question/50-point Niveau 8 bank."""

    if not isinstance(exam, dict):
        raise ExamBankPublicationError("invalid_exam")
    if exam.get("id") != EXAM_ID:
        raise ExamBankPublicationError("wrong_exam_id")
    version = _required_identifier(exam.get("version"), "exam_version")
    _required_text(exam.get("title"), "exam_title")
    _required_text(exam.get("transcript"), "exam_transcript")
    configured_points = _finite_number(exam.get("totalPoints"), "exam_total_points")
    if not math.isclose(configured_points, EXPECTED_TOTAL_POINTS, abs_tol=1e-9):
        raise ExamBankPublicationError("exam_total_points_must_be_50")

    sections = exam.get("sections")
    if not isinstance(sections, list) or not sections:
        raise ExamBankPublicationError("invalid_exam_sections")
    section_ids = set()
    question_ids = set()
    computed_points = 0.0
    question_count = 0
    type_counts: Dict[str, int] = {}
    for section in sections:
        if not isinstance(section, dict):
            raise ExamBankPublicationError("invalid_exam_section")
        section_id = _required_identifier(section.get("id"), "section_id")
        if section_id in section_ids:
            raise ExamBankPublicationError("duplicate_section_id:" + section_id)
        section_ids.add(section_id)
        questions = section.get("questions")
        if not isinstance(questions, list) or not questions:
            raise ExamBankPublicationError("invalid_section_questions:" + section_id)
        section_points = 0.0
        for question in questions:
            if not isinstance(question, dict):
                raise ExamBankPublicationError("invalid_question:" + section_id)
            question_id = _required_identifier(question.get("id"), "question_id")
            if question_id in question_ids:
                raise ExamBankPublicationError("duplicate_question_id:" + question_id)
            question_ids.add(question_id)
            _required_text(question.get("prompt"), "question_prompt:" + question_id)
            question_type = question.get("type")
            if not isinstance(question_type, str) or question_type not in ALLOWED_QUESTION_TYPES:
                raise ExamBankPublicationError("unsupported_question_type:" + question_id)
            if "answer" not in question:
                raise ExamBankPublicationError("missing_answer:" + question_id)
            answer = question["answer"]
            if question_type == "truefalse":
                if not isinstance(answer, bool):
                    raise ExamBankPublicationError("invalid_answer:" + question_id)
            else:
                options = question.get("options")
                if not isinstance(options, list) or len(options) < 2:
                    raise ExamBankPublicationError("invalid_options:" + question_id)
                if not all(isinstance(option, str) and option.strip() for option in options):
                    raise ExamBankPublicationError("invalid_options:" + question_id)
                normalized_options = [option.strip().casefold() for option in options]
                if len(set(normalized_options)) != len(normalized_options):
                    raise ExamBankPublicationError("duplicate_options:" + question_id)
                if isinstance(answer, bool) or not isinstance(answer, int) or not 0 <= answer < len(options):
                    raise ExamBankPublicationError("invalid_answer:" + question_id)
            points = _finite_number(question.get("points"), "question_points:" + question_id)
            if points <= 0:
                raise ExamBankPublicationError("invalid_question_points:" + question_id)
            section_points += points
            computed_points += points
            question_count += 1
            type_counts[question_type] = type_counts.get(question_type, 0) + 1
        if "points" in section:
            declared_section_points = _finite_number(
                section.get("points"), "section_points:" + section_id
            )
            if not math.isclose(declared_section_points, section_points, abs_tol=1e-9):
                raise ExamBankPublicationError("section_points_mismatch:" + section_id)

    if question_count != EXPECTED_QUESTION_COUNT:
        raise ExamBankPublicationError("exam_question_count_must_be_50")
    if not math.isclose(computed_points, EXPECTED_TOTAL_POINTS, abs_tol=1e-9):
        raise ExamBankPublicationError("exam_computed_points_must_be_50")
    canonical_sha256(exam)  # Reject non-JSON values in programmatic callers too.
    return {
        "examId": EXAM_ID,
        "version": version,
        "sections": len(sections),
        "questions": question_count,
        "totalPoints": int(EXPECTED_TOTAL_POINTS),
        "questionTypes": dict(sorted(type_counts.items())),
    }


def _validate_operational_preconditions(state: Any, store: Any) -> None:
    if not isinstance(state, dict) or state.get("isOpen") is not False:
        raise ExamBankPublicationError("exam_must_be_closed")
    # Missing is the legacy representation of disabled.  It is accepted so the
    # state can remain byte/semantically untouched instead of adding a default.
    schedule_enabled = state.get("scheduleEnabled")
    if schedule_enabled is not None and schedule_enabled is not False:
        raise ExamBankPublicationError("exam_schedule_must_be_disabled")
    if schedule_enabled is None and (
        state.get("opensAt") is not None
        or state.get("closesAt") is not None
        or state.get("openingGate") not in (None, {})
    ):
        raise ExamBankPublicationError("legacy_schedule_state_must_be_empty")
    opening_gate = state.get("openingGate")
    if isinstance(opening_gate, dict) and str(opening_gate.get("status") or "").strip().lower() in (
        "pending",
        "opening",
        "ready",
    ):
        raise ExamBankPublicationError("exam_opening_gate_must_be_inactive")
    if not isinstance(store, dict):
        raise ExamBankPublicationError("invalid_store")
    submissions = store.get("submissions")
    attempts = store.get("attempts")
    if not isinstance(submissions, dict) or not isinstance(attempts, dict):
        raise ExamBankPublicationError("invalid_store_runtime_collections")
    if submissions:
        raise ExamBankPublicationError("existing_submissions")
    # The runtime itself defines an active attempt as any attempt that has no
    # matching submission.  With zero submissions this intentionally means the
    # attempts collection must be empty, regardless of an untrusted status flag.
    active_ids = sorted(
        str(student_id)
        for student_id, attempt in attempts.items()
        if isinstance(attempt, dict) and student_id not in submissions
    )
    if active_ids:
        raise ExamBankPublicationError("active_attempts:" + ",".join(active_ids[:20]))
    if attempts:
        raise ExamBankPublicationError("invalid_attempt_records")


def _raw_document_row(transaction: Any, kind: str) -> Tuple[int, str, str]:
    row = transaction.connection.execute(
        "SELECT payload_json, revision, updated_at FROM documents WHERE level = ? AND kind = ?",
        (transaction.repository.level, kind),
    ).fetchone()
    if row is None:
        raise ExamBankPublicationError("missing_document:" + kind)
    payload_sha256 = hashlib.sha256(str(row["payload_json"]).encode("utf-8")).hexdigest()
    return int(row["revision"]), str(row["updated_at"]), payload_sha256


def _publication_report(
    *,
    mode: str,
    changed: bool,
    validation: Mapping[str, Any],
    old_version: str,
    old_exam_sha256: str,
    new_exam_sha256: str,
    source_sha256: str,
    bundle_revision_before: int,
    bundle_revision_after: int,
    state_sha256: str,
    store_sha256: str,
    store_payload_sha256: str,
    store_revision: int,
    audit_event_id: Optional[int] = None,
) -> Dict[str, Any]:
    return {
        "ok": True,
        "mode": mode,
        "changed": changed,
        "examId": validation["examId"],
        "oldVersion": old_version,
        "newVersion": validation["version"],
        "oldExamSha256": old_exam_sha256,
        "newExamSha256": new_exam_sha256,
        "sourceSha256": source_sha256,
        "bundleRevisionBefore": bundle_revision_before,
        "bundleRevisionAfter": bundle_revision_after,
        "stateSha256": state_sha256,
        "storeSha256": store_sha256,
        "storePayloadSha256": store_payload_sha256,
        "storeRevision": store_revision,
        "questions": validation["questions"],
        "totalPoints": validation["totalPoints"],
        "auditEventId": audit_event_id,
    }


def publish_exam_bank(
    repository: FinalExamRepository,
    source_path: os.PathLike[str] | str,
    *,
    dry_run: bool = False,
    release_id: str = "",
    actor_email: str = "release@jaralingua.local",
    backup_path: str = "",
    backup_sha256: str = "",
    expected_bundle_revision: Optional[int] = None,
    expected_current_version: str = "",
) -> Dict[str, Any]:
    """Validate and atomically publish a bank, or return a mutation-free plan."""

    staged_exam, source_sha256 = load_exam_bank(source_path)
    validation = validate_french8_exam(staged_exam)
    if not dry_run:
        if not _SAFE_RELEASE_ID.fullmatch(str(release_id or "")):
            raise ExamBankPublicationError("invalid_release_id")
        if not str(backup_path or "").strip():
            raise ExamBankPublicationError("backup_path_required")
        normalized_backup_sha256 = str(backup_sha256 or "").strip().lower()
        if not _SHA256.fullmatch(normalized_backup_sha256):
            raise ExamBankPublicationError("backup_sha256_required")
    else:
        normalized_backup_sha256 = str(backup_sha256 or "").strip().lower()

    audit_event_id: Optional[int] = None
    expected_bundle: Optional[Dict[str, Any]] = None
    with repository.transaction(write=not dry_run) as transaction:
        current_bundle = transaction.get_bundle()
        current_store = transaction.get_store()
        _validate_operational_preconditions(
            current_bundle.payload.get("state"), current_store.payload
        )
        if expected_bundle_revision is not None and current_bundle.revision != int(
            expected_bundle_revision
        ):
            raise FinalExamConflictError("stale_document:bundle")

        old_exam = current_bundle.payload.get("exam")
        if not isinstance(old_exam, dict):
            raise ExamBankPublicationError("invalid_current_exam")
        old_version = _required_identifier(
            old_exam.get("version"), "current_exam_version"
        )
        if expected_current_version and old_version != expected_current_version:
            raise ExamBankPublicationError("unexpected_current_version")
        old_exam_sha256 = canonical_sha256(old_exam)
        new_exam_sha256 = canonical_sha256(staged_exam)
        state_sha256 = canonical_sha256(current_bundle.payload["state"])
        store_sha256 = canonical_sha256(current_store.payload)
        raw_store_before = _raw_document_row(transaction, "store")
        if raw_store_before[0] != current_store.revision:
            raise ExamBankPublicationError("store_revision_mismatch")

        if new_exam_sha256 != old_exam_sha256 and validation["version"] == old_version:
            raise ExamBankPublicationError("exam_version_reused_with_different_content")
        changed = new_exam_sha256 != old_exam_sha256
        next_revision = current_bundle.revision + (1 if changed and not dry_run else 0)
        mode = "dry-run" if dry_run else ("published" if changed else "unchanged")

        if changed and not dry_run:
            expected_bundle = copy.deepcopy(current_bundle.payload)
            expected_bundle["exam"] = copy.deepcopy(staged_exam)
            saved = transaction.put_bundle(
                expected_bundle, expected_revision=current_bundle.revision
            )
            if saved.revision != current_bundle.revision + 1:
                raise ExamBankPublicationError("unexpected_bundle_revision")
            if saved.payload.get("state") != current_bundle.payload.get("state"):
                raise ExamBankPublicationError("state_changed_during_publication")
            if _raw_document_row(transaction, "store") != raw_store_before:
                raise ExamBankPublicationError("store_changed_during_publication")
            detail = {
                "releaseId": release_id,
                "backupPath": backup_path,
                "backupSha256": normalized_backup_sha256,
                "sourceFile": pathlib.Path(source_path).name,
                "sourceSha256": source_sha256,
                "oldVersion": old_version,
                "newVersion": validation["version"],
                "oldExamSha256": old_exam_sha256,
                "newExamSha256": new_exam_sha256,
                "bundleRevisionBefore": current_bundle.revision,
                "bundleRevisionAfter": saved.revision,
                "stateSha256": state_sha256,
                "stateRevision": current_bundle.payload["state"].get("revision"),
                "storeSha256": store_sha256,
                "storePayloadSha256": raw_store_before[2],
                "storeRevision": current_store.revision,
                "questions": validation["questions"],
                "totalPoints": validation["totalPoints"],
            }
            audit_event_id = transaction.append_audit(
                "exam_bank_published",
                actor_email=actor_email,
                request_id=release_id,
                source="release",
                detail=detail,
            )

        report = _publication_report(
            mode=mode,
            changed=changed,
            validation=validation,
            old_version=old_version,
            old_exam_sha256=old_exam_sha256,
            new_exam_sha256=new_exam_sha256,
            source_sha256=source_sha256,
            bundle_revision_before=current_bundle.revision,
            bundle_revision_after=next_revision,
            state_sha256=state_sha256,
            store_sha256=store_sha256,
            store_payload_sha256=raw_store_before[2],
            store_revision=current_store.revision,
            audit_event_id=audit_event_id,
        )

    if changed and not dry_run:
        after = repository.read_documents()
        if expected_bundle is None or after["bundle"].payload != expected_bundle:
            raise ExamBankPublicationError("bundle_postcondition_failed")
        if after["bundle"].revision != report["bundleRevisionAfter"]:
            raise ExamBankPublicationError("bundle_revision_postcondition_failed")
        if canonical_sha256(after["bundle"].payload["state"]) != report["stateSha256"]:
            raise ExamBankPublicationError("state_postcondition_failed")
        if after["store"].revision != report["storeRevision"]:
            raise ExamBankPublicationError("store_revision_postcondition_failed")
        if canonical_sha256(after["store"].payload) != report["storeSha256"]:
            raise ExamBankPublicationError("store_postcondition_failed")
        with repository.transaction() as transaction:
            if _raw_document_row(transaction, "store")[2] != report["storePayloadSha256"]:
                raise ExamBankPublicationError("store_bytes_postcondition_failed")
        published = repository.list_audit(
            after_id=max(0, int(report["auditEventId"] or 0) - 1),
            event_type="exam_bank_published",
            limit=2,
        )
        if len(published) != 1 or published[0]["id"] != report["auditEventId"]:
            raise ExamBankPublicationError("publication_audit_postcondition_failed")
    return report


def _parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--bundle", required=True, help="Staged JSON bundle")
    parser.add_argument("--database", help="French 8 SQLite database")
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--validate-only", action="store_true")
    mode.add_argument("--dry-run", action="store_true")
    mode.add_argument("--apply", action="store_true")
    parser.add_argument("--release-id", default="")
    parser.add_argument("--actor", default="release@jaralingua.local")
    parser.add_argument("--backup-path", default="")
    parser.add_argument("--backup-sha256", default="")
    parser.add_argument("--expected-bundle-revision", type=int)
    parser.add_argument("--expected-current-version", default="")
    parser.add_argument(
        "--require-unchanged",
        action="store_true",
        help="With --dry-run, fail unless SQLite already matches the staged bank",
    )
    return parser


def main(argv: Optional[Sequence[str]] = None) -> int:
    args = _parser().parse_args(argv)
    try:
        if args.require_unchanged and not args.dry_run:
            raise ExamBankPublicationError("require_unchanged_requires_dry_run")
        if args.validate_only:
            if args.database:
                raise ExamBankPublicationError("validate_only_has_incompatible_arguments")
            exam, source_sha256 = load_exam_bank(args.bundle)
            report = {
                "ok": True,
                "mode": "validate-only",
                "sourceSha256": source_sha256,
                **validate_french8_exam(exam),
            }
        else:
            if not args.database:
                raise ExamBankPublicationError("database_required")
            database = pathlib.Path(args.database)
            if not database.is_file() or database.is_symlink():
                raise ExamBankPublicationError("database_not_regular")
            repository = FinalExamRepository(database, level="french8")
            report = publish_exam_bank(
                repository,
                args.bundle,
                dry_run=args.dry_run,
                release_id=args.release_id,
                actor_email=args.actor,
                backup_path=args.backup_path,
                backup_sha256=args.backup_sha256,
                expected_bundle_revision=args.expected_bundle_revision,
                expected_current_version=args.expected_current_version,
            )
            if args.require_unchanged and report.get("changed") is not False:
                raise ExamBankPublicationError("persisted_exam_bank_mismatch")
        print(json.dumps(report, ensure_ascii=False, sort_keys=True))
        return 0
    except (
        ExamBankPublicationError,
        FinalExamConflictError,
        FinalExamStorageError,
        OSError,
        ValueError,
    ) as error:
        print(
            json.dumps(
                {"ok": False, "error": str(error) or error.__class__.__name__},
                ensure_ascii=False,
                sort_keys=True,
            ),
            file=sys.stderr,
        )
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
