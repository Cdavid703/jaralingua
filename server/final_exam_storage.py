"""Transactional SQLite storage for JaraLingua final examinations.

The HTTP application still works with the historical ``bundle`` and ``store``
dictionaries.  This module persists those two documents without changing their
shape while providing transactional writes, durable operational tables and a
strict, one-time JSON import.

Connections are intentionally short lived.  A repository can therefore be
shared by ``ThreadingHTTPServer`` handlers, but a ``sqlite3.Connection`` never
crosses a thread boundary.
"""

from __future__ import annotations

import contextlib
import hashlib
import json
import math
import os
import re
import secrets
import shutil
import sqlite3
import tempfile
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Callable, Dict, Iterator, List, Mapping, Optional, Sequence, Tuple


SCHEMA_VERSION = 1
DOCUMENT_KINDS = ("bundle", "store")
MAX_JSON_BYTES = 64 * 1024 * 1024
_SAFE_NAME = re.compile(r"^[A-Za-z0-9_.:-]{1,160}$")
_SUBJECT_HASH = re.compile(r"^[0-9a-fA-F]{64}$")
_ALERT_SEVERITIES = {"info", "warning", "error", "critical"}


class FinalExamStorageError(RuntimeError):
    """Base error for storage failures that must never degrade to empty data."""


class FinalExamMigrationError(FinalExamStorageError):
    """Raised when legacy data cannot be imported without ambiguity."""


class FinalExamConflictError(FinalExamStorageError):
    """Raised on a stale revision or a lost fencing token."""


@dataclass(frozen=True)
class Document:
    kind: str
    payload: Dict[str, Any]
    revision: int
    updated_at: str


@dataclass(frozen=True)
class MigrationReport:
    imported: bool
    level: str
    bundle_source: str
    store_source: str
    bundle_sha256: str
    store_sha256: str
    imported_at: str


@dataclass(frozen=True)
class RateLimitDecision:
    allowed: bool
    limit: int
    hits: int
    remaining: int
    retry_after_seconds: int
    reset_at_epoch: int


class _DuplicateKeyError(ValueError):
    pass


def _pairs_without_duplicates(pairs: Sequence[Tuple[str, Any]]) -> Dict[str, Any]:
    result: Dict[str, Any] = {}
    for key, value in pairs:
        if key in result:
            raise _DuplicateKeyError("duplicate_json_key:" + str(key))
        result[key] = value
    return result


def _reject_json_constant(value: str) -> None:
    raise ValueError("invalid_json_constant:" + value)


def _decode_json_text(text: str, source: str) -> Dict[str, Any]:
    try:
        value = json.loads(
            text,
            object_pairs_hook=_pairs_without_duplicates,
            parse_constant=_reject_json_constant,
        )
    except (json.JSONDecodeError, UnicodeError, ValueError, RecursionError) as error:
        raise FinalExamMigrationError("invalid_json:" + source) from error
    if not isinstance(value, dict):
        raise FinalExamMigrationError("invalid_json_root:" + source)
    return value


def _encode_json(value: Any, label: str) -> str:
    try:
        encoded = json.dumps(
            value,
            ensure_ascii=False,
            sort_keys=True,
            separators=(",", ":"),
            allow_nan=False,
        )
    except (TypeError, ValueError, RecursionError) as error:
        raise FinalExamStorageError("invalid_json_value:" + label) from error
    if len(encoded.encode("utf-8")) > MAX_JSON_BYTES:
        raise FinalExamStorageError("json_too_large:" + label)
    return encoded


def _require_name(value: Any, label: str) -> str:
    text = str(value or "").strip()
    if not _SAFE_NAME.fullmatch(text):
        raise ValueError("invalid_" + label)
    return text


def _clean_text(value: Any, limit: int) -> str:
    return str(value or "").strip()[:limit]


def _utc_datetime(value: Any) -> datetime:
    if isinstance(value, datetime):
        parsed = value
    elif isinstance(value, (int, float)) and not isinstance(value, bool):
        if not math.isfinite(float(value)):
            raise ValueError("invalid_time")
        parsed = datetime.fromtimestamp(float(value), timezone.utc)
    elif isinstance(value, str) and value.strip():
        try:
            parsed = datetime.fromisoformat(value.strip().replace("Z", "+00:00"))
        except ValueError as error:
            raise ValueError("invalid_time") from error
    else:
        raise ValueError("invalid_time")
    if parsed.tzinfo is None:
        raise ValueError("naive_time_not_allowed")
    return parsed.astimezone(timezone.utc)


def _iso_from_epoch(epoch: float) -> str:
    return datetime.fromtimestamp(float(epoch), timezone.utc).isoformat().replace("+00:00", "Z")


def _validate_bundle(bundle: Mapping[str, Any]) -> Dict[str, Any]:
    if not isinstance(bundle, dict):
        raise FinalExamMigrationError("invalid_bundle_root")
    state = bundle.get("state")
    exam = bundle.get("exam")
    if not isinstance(state, dict):
        raise FinalExamMigrationError("invalid_bundle_state")
    if not isinstance(exam, dict):
        raise FinalExamMigrationError("invalid_bundle_exam")
    if not isinstance(state.get("isOpen"), bool):
        raise FinalExamMigrationError("invalid_bundle_state:isOpen")
    if "revision" in state and (
        isinstance(state.get("revision"), bool) or not isinstance(state.get("revision"), int)
    ):
        raise FinalExamMigrationError("invalid_bundle_state:revision")
    if "extraMinutesByStudent" in state and not isinstance(state.get("extraMinutesByStudent"), dict):
        raise FinalExamMigrationError("invalid_bundle_state:extraMinutesByStudent")
    exam_id = exam.get("id")
    if not isinstance(exam_id, str) or not exam_id.strip():
        raise FinalExamMigrationError("invalid_bundle_exam:id")
    sections = exam.get("sections")
    if not isinstance(sections, list):
        raise FinalExamMigrationError("invalid_bundle_exam:sections")
    question_ids = set()
    for section in sections:
        if not isinstance(section, dict) or not isinstance(section.get("questions"), list):
            raise FinalExamMigrationError("invalid_bundle_exam:section")
        for question in section["questions"]:
            if not isinstance(question, dict):
                raise FinalExamMigrationError("invalid_bundle_exam:question")
            question_id = question.get("id")
            if not isinstance(question_id, str) or not question_id.strip():
                raise FinalExamMigrationError("invalid_bundle_exam:question_id")
            if question_id in question_ids:
                raise FinalExamMigrationError("duplicate_question_id:" + question_id)
            question_ids.add(question_id)
    return _json_copy(dict(bundle), "bundle")


def _validate_store(store: Mapping[str, Any]) -> Dict[str, Any]:
    if not isinstance(store, dict):
        raise FinalExamMigrationError("invalid_store_root")
    result = _json_copy(dict(store), "store")
    defaults: Dict[str, Any] = {
        "submissions": {},
        "attempts": {},
        "preflight": {},
        "idempotency": {},
        "events": [],
    }
    for key, default in defaults.items():
        if key not in result:
            result[key] = default
        elif not isinstance(result[key], type(default)):
            raise FinalExamMigrationError("invalid_store_schema:" + key)
    attempt_owners: Dict[str, str] = {}
    receipt_codes = set()
    for collection_name in ("attempts", "submissions", "preflight"):
        for student_id, record in result[collection_name].items():
            if not isinstance(student_id, str) or not student_id.strip() or not isinstance(record, dict):
                raise FinalExamMigrationError("invalid_store_record:" + collection_name)
            if collection_name == "attempts":
                attempt_id = record.get("attemptId")
                if attempt_id:
                    if not isinstance(attempt_id, str):
                        raise FinalExamMigrationError("duplicate_attempt_id")
                    previous_owner = attempt_owners.get(attempt_id)
                    if previous_owner is not None and previous_owner != student_id:
                        raise FinalExamMigrationError("duplicate_attempt_id")
                    attempt_owners[attempt_id] = student_id
            elif collection_name == "submissions":
                attempt_id = record.get("attemptId")
                if attempt_id:
                    if not isinstance(attempt_id, str):
                        raise FinalExamMigrationError("duplicate_attempt_id")
                    previous_owner = attempt_owners.get(attempt_id)
                    if previous_owner is not None and previous_owner != student_id:
                        raise FinalExamMigrationError("duplicate_attempt_id")
                    attempt_owners[attempt_id] = student_id
                receipt = record.get("receiptCode")
                if receipt:
                    if not isinstance(receipt, str) or receipt in receipt_codes:
                        raise FinalExamMigrationError("duplicate_receipt_code")
                    receipt_codes.add(receipt)
    if not all(isinstance(item, dict) for item in result["events"]):
        raise FinalExamMigrationError("invalid_store_schema:events")
    return result


def _json_copy(value: Any, label: str) -> Any:
    return json.loads(_encode_json(value, label))


class FinalExamTransaction:
    """One consistent snapshot, optionally writable."""

    def __init__(self, repository: "FinalExamRepository", connection: sqlite3.Connection, write: bool):
        self.repository = repository
        self.connection = connection
        self.write = write

    def get_document(self, kind: str) -> Document:
        kind = self.repository._document_kind(kind)
        row = self.connection.execute(
            "SELECT kind, payload_json, revision, updated_at "
            "FROM documents WHERE level = ? AND kind = ?",
            (self.repository.level, kind),
        ).fetchone()
        if row is None:
            raise FinalExamStorageError("missing_document:" + kind)
        try:
            payload = _decode_json_text(row["payload_json"], "database:" + kind)
            payload = self.repository._validate_document(kind, payload)
        except FinalExamMigrationError as error:
            raise FinalExamStorageError("corrupt_document:" + kind) from error
        return Document(kind, payload, int(row["revision"]), row["updated_at"])

    def get_bundle(self) -> Document:
        return self.get_document("bundle")

    def get_store(self) -> Document:
        return self.get_document("store")

    def put_document(
        self,
        kind: str,
        payload: Mapping[str, Any],
        expected_revision: Optional[int] = None,
    ) -> Document:
        if not self.write:
            raise FinalExamStorageError("read_only_transaction")
        kind = self.repository._document_kind(kind)
        validated = self.repository._validate_document(kind, payload)
        encoded = _encode_json(validated, kind)
        row = self.connection.execute(
            "SELECT revision FROM documents WHERE level = ? AND kind = ?",
            (self.repository.level, kind),
        ).fetchone()
        if row is None:
            raise FinalExamStorageError("missing_document:" + kind)
        current_revision = int(row["revision"])
        if expected_revision is not None and int(expected_revision) != current_revision:
            raise FinalExamConflictError("stale_document:" + kind)
        updated_at = self.repository._now_iso()
        cursor = self.connection.execute(
            "UPDATE documents SET payload_json = ?, revision = revision + 1, updated_at = ? "
            "WHERE level = ? AND kind = ? AND revision = ?",
            (encoded, updated_at, self.repository.level, kind, current_revision),
        )
        if cursor.rowcount != 1:
            raise FinalExamConflictError("stale_document:" + kind)
        return Document(kind, validated, current_revision + 1, updated_at)

    def put_bundle(self, payload: Mapping[str, Any], expected_revision: Optional[int] = None) -> Document:
        return self.put_document("bundle", payload, expected_revision)

    def put_store(self, payload: Mapping[str, Any], expected_revision: Optional[int] = None) -> Document:
        return self.put_document("store", payload, expected_revision)

    def append_audit(
        self,
        event_type: str,
        *,
        actor_email: str = "",
        student_id: str = "",
        request_id: str = "",
        source: str = "api",
        detail: Optional[Mapping[str, Any]] = None,
        occurred_at: Any = None,
    ) -> int:
        if not self.write:
            raise FinalExamStorageError("read_only_transaction")
        return self.repository._append_audit_conn(
            self.connection,
            event_type,
            actor_email=actor_email,
            student_id=student_id,
            request_id=request_id,
            source=source,
            detail=detail,
            occurred_at=occurred_at,
        )

    def enqueue_grade_sync(
        self,
        student_id: str,
        grade: float,
        attempt_id: str,
        *,
        evaluation_id: str = "finalExam",
        idempotency_key: str = "",
        payload: Optional[Mapping[str, Any]] = None,
    ) -> int:
        if not self.write:
            raise FinalExamStorageError("read_only_transaction")
        return self.repository._enqueue_grade_conn(
            self.connection,
            student_id,
            grade,
            attempt_id,
            evaluation_id=evaluation_id,
            idempotency_key=idempotency_key,
            payload=payload,
        )


class FinalExamRepository:
    """SQLite-backed repository for one final-exam level."""

    def __init__(
        self,
        db_path: os.PathLike[str] | str,
        *,
        level: str = "french8",
        busy_timeout_ms: int = 5000,
        clock: Optional[Callable[[], Any]] = None,
    ) -> None:
        raw_path = os.fspath(db_path)
        if not raw_path or raw_path == ":memory:":
            raise ValueError("a filesystem SQLite path is required")
        self.db_path = os.path.abspath(raw_path)
        self.level = _require_name(level, "level")
        self.busy_timeout_ms = max(100, min(60000, int(busy_timeout_ms)))
        self._clock = clock or (lambda: datetime.now(timezone.utc))

    def _connect(self) -> sqlite3.Connection:
        connection = sqlite3.connect(
            self.db_path,
            timeout=self.busy_timeout_ms / 1000.0,
            isolation_level=None,
        )
        connection.row_factory = sqlite3.Row
        connection.execute("PRAGMA foreign_keys = ON")
        connection.execute("PRAGMA busy_timeout = " + str(self.busy_timeout_ms))
        connection.execute("PRAGMA synchronous = FULL")
        return connection

    def _now_epoch(self, value: Any = None) -> float:
        supplied = self._clock() if value is None else value
        return _utc_datetime(supplied).timestamp()

    def _now_iso(self, value: Any = None) -> str:
        return _iso_from_epoch(self._now_epoch(value))

    def _document_kind(self, kind: str) -> str:
        if kind not in DOCUMENT_KINDS:
            raise ValueError("invalid_document_kind")
        return kind

    def _validate_document(self, kind: str, payload: Mapping[str, Any]) -> Dict[str, Any]:
        return _validate_bundle(payload) if kind == "bundle" else _validate_store(payload)

    def _create_schema(self, connection: sqlite3.Connection) -> None:
        current = int(connection.execute("PRAGMA user_version").fetchone()[0])
        if current > SCHEMA_VERSION:
            raise FinalExamStorageError("unsupported_schema_version:" + str(current))
        connection.executescript(
            """
            BEGIN IMMEDIATE;
            CREATE TABLE IF NOT EXISTS schema_meta (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS migration_ledger (
                level TEXT NOT NULL,
                kind TEXT NOT NULL CHECK (kind IN ('bundle', 'store')),
                source_path TEXT NOT NULL,
                source_sha256 TEXT NOT NULL,
                source_bytes INTEGER NOT NULL CHECK (source_bytes >= 0),
                imported_at TEXT NOT NULL,
                PRIMARY KEY (level, kind)
            );
            CREATE TABLE IF NOT EXISTS documents (
                level TEXT NOT NULL,
                kind TEXT NOT NULL CHECK (kind IN ('bundle', 'store')),
                payload_json TEXT NOT NULL,
                revision INTEGER NOT NULL DEFAULT 0 CHECK (revision >= 0),
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                PRIMARY KEY (level, kind)
            );
            CREATE TABLE IF NOT EXISTS audit_events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                level TEXT NOT NULL,
                occurred_at TEXT NOT NULL,
                event_type TEXT NOT NULL,
                actor_email TEXT NOT NULL DEFAULT '',
                student_id TEXT NOT NULL DEFAULT '',
                request_id TEXT NOT NULL DEFAULT '',
                source TEXT NOT NULL DEFAULT 'api',
                detail_json TEXT NOT NULL DEFAULT '{}'
            );
            CREATE INDEX IF NOT EXISTS audit_events_level_id
                ON audit_events(level, id);
            CREATE INDEX IF NOT EXISTS audit_events_student
                ON audit_events(level, student_id, id);
            CREATE INDEX IF NOT EXISTS audit_events_type
                ON audit_events(level, event_type, id);
            CREATE TRIGGER IF NOT EXISTS audit_events_no_update
            BEFORE UPDATE ON audit_events
            BEGIN
                SELECT RAISE(ABORT, 'audit_events_append_only');
            END;
            CREATE TRIGGER IF NOT EXISTS audit_events_no_delete
            BEFORE DELETE ON audit_events
            BEGIN
                SELECT RAISE(ABORT, 'audit_events_append_only');
            END;
            CREATE TABLE IF NOT EXISTS rate_windows (
                bucket TEXT NOT NULL,
                subject_hash TEXT NOT NULL,
                window_start INTEGER NOT NULL,
                window_end INTEGER NOT NULL,
                hits INTEGER NOT NULL CHECK (hits >= 0),
                blocked_until INTEGER,
                updated_at TEXT NOT NULL,
                PRIMARY KEY (bucket, subject_hash, window_start)
            );
            CREATE INDEX IF NOT EXISTS rate_windows_expiry
                ON rate_windows(window_end);
            CREATE TABLE IF NOT EXISTS alerts (
                level TEXT NOT NULL,
                alert_key TEXT NOT NULL,
                severity TEXT NOT NULL CHECK (severity IN ('info','warning','error','critical')),
                status TEXT NOT NULL CHECK (status IN ('open','acknowledged','resolved')),
                message TEXT NOT NULL DEFAULT '',
                context_json TEXT NOT NULL DEFAULT '{}',
                first_seen_at TEXT NOT NULL,
                last_seen_at TEXT NOT NULL,
                occurrences INTEGER NOT NULL DEFAULT 1 CHECK (occurrences >= 1),
                acknowledged_at TEXT,
                acknowledged_by TEXT,
                resolved_at TEXT,
                resolved_by TEXT,
                resolution TEXT NOT NULL DEFAULT '',
                PRIMARY KEY (level, alert_key)
            );
            CREATE INDEX IF NOT EXISTS alerts_level_status
                ON alerts(level, status, last_seen_at);
            CREATE TABLE IF NOT EXISTS grade_outbox (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                level TEXT NOT NULL,
                student_id TEXT NOT NULL,
                evaluation_id TEXT NOT NULL,
                grade REAL NOT NULL,
                attempt_id TEXT NOT NULL,
                idempotency_key TEXT NOT NULL,
                payload_json TEXT NOT NULL DEFAULT '{}',
                status TEXT NOT NULL CHECK (status IN ('pending','inflight','retry','done','canceled')),
                attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
                available_at REAL NOT NULL,
                lease_owner TEXT,
                lease_token TEXT,
                lease_until REAL,
                last_error TEXT NOT NULL DEFAULT '',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                completed_at TEXT,
                UNIQUE (level, idempotency_key)
            );
            CREATE INDEX IF NOT EXISTS grade_outbox_claim
                ON grade_outbox(level, status, available_at, lease_until, id);
            CREATE TABLE IF NOT EXISTS scheduler_state (
                level TEXT PRIMARY KEY,
                revision INTEGER NOT NULL DEFAULT 0 CHECK (revision >= 0),
                state_json TEXT NOT NULL DEFAULT '{}',
                lease_owner TEXT,
                lease_token TEXT,
                lease_until REAL,
                heartbeat_at TEXT,
                last_tick_at TEXT,
                last_success_at TEXT,
                last_error TEXT NOT NULL DEFAULT '',
                consecutive_failures INTEGER NOT NULL DEFAULT 0 CHECK (consecutive_failures >= 0),
                updated_at TEXT NOT NULL
            );
            PRAGMA user_version = 1;
            COMMIT;
            """
        )

    def initialize(
        self,
        legacy_bundle_path: Optional[os.PathLike[str] | str] = None,
        bundled_bundle_path: Optional[os.PathLike[str] | str] = None,
        legacy_store_path: Optional[os.PathLike[str] | str] = None,
        *,
        default_bundle: Optional[Mapping[str, Any]] = None,
        default_store: Optional[Mapping[str, Any]] = None,
    ) -> MigrationReport:
        """Create schema and import JSON exactly once.

        A configured legacy bundle wins when it exists; otherwise the bundled
        path and then an explicit default are considered.  An absent store is a
        valid first deployment and becomes the normalized empty store.  A file
        that exists but is malformed always aborts the migration.
        """

        os.makedirs(os.path.dirname(self.db_path) or ".", exist_ok=True)
        connection: Optional[sqlite3.Connection] = None
        try:
            connection = self._connect()
            mode = str(connection.execute("PRAGMA journal_mode = WAL").fetchone()[0]).lower()
            if mode != "wal":
                raise FinalExamStorageError("wal_not_available")
            self._create_schema(connection)
            connection.execute("BEGIN EXCLUSIVE")
            documents = connection.execute(
                "SELECT kind FROM documents WHERE level = ? ORDER BY kind", (self.level,)
            ).fetchall()
            ledger = connection.execute(
                "SELECT kind, source_path, source_sha256, imported_at "
                "FROM migration_ledger WHERE level = ? ORDER BY kind",
                (self.level,),
            ).fetchall()
            if len(documents) == 2 and len(ledger) == 2:
                bundle = self._document_from_conn(connection, "bundle")
                store = self._document_from_conn(connection, "store")
                self._validate_document("bundle", bundle.payload)
                self._validate_document("store", store.payload)
                connection.commit()
                rows = {row["kind"]: row for row in ledger}
                return MigrationReport(
                    False,
                    self.level,
                    rows["bundle"]["source_path"],
                    rows["store"]["source_path"],
                    rows["bundle"]["source_sha256"],
                    rows["store"]["source_sha256"],
                    max(rows["bundle"]["imported_at"], rows["store"]["imported_at"]),
                )
            if documents or ledger:
                raise FinalExamMigrationError("incomplete_previous_migration")

            bundle_data, bundle_meta = self._select_bundle_source(
                legacy_bundle_path, bundled_bundle_path, default_bundle
            )
            store_data, store_meta = self._select_store_source(legacy_store_path, default_store)
            imported_at = self._now_iso()
            for kind, payload, meta in (
                ("bundle", bundle_data, bundle_meta),
                ("store", store_data, store_meta),
            ):
                connection.execute(
                    "INSERT INTO documents(level, kind, payload_json, revision, created_at, updated_at) "
                    "VALUES (?, ?, ?, 0, ?, ?)",
                    (self.level, kind, _encode_json(payload, kind), imported_at, imported_at),
                )
                connection.execute(
                    "INSERT INTO migration_ledger"
                    "(level, kind, source_path, source_sha256, source_bytes, imported_at) "
                    "VALUES (?, ?, ?, ?, ?, ?)",
                    (
                        self.level,
                        kind,
                        meta["path"],
                        meta["sha256"],
                        meta["bytes"],
                        imported_at,
                    ),
                )
            connection.execute(
                "INSERT INTO scheduler_state(level, updated_at) VALUES (?, ?) "
                "ON CONFLICT(level) DO NOTHING",
                (self.level, imported_at),
            )
            for event in store_data.get("events", []):
                self._import_legacy_event(connection, event, imported_at)
            self._append_audit_conn(
                connection,
                "migration_completed",
                source="migration",
                detail={
                    "bundleSha256": bundle_meta["sha256"],
                    "storeSha256": store_meta["sha256"],
                },
                occurred_at=imported_at,
            )
            connection.execute(
                "INSERT INTO schema_meta(key, value) VALUES (?, ?) "
                "ON CONFLICT(key) DO UPDATE SET value = excluded.value",
                ("migration:" + self.level + ":complete", imported_at),
            )
            connection.commit()
            return MigrationReport(
                True,
                self.level,
                bundle_meta["path"],
                store_meta["path"],
                bundle_meta["sha256"],
                store_meta["sha256"],
                imported_at,
            )
        except sqlite3.Error as error:
            if connection is not None and connection.in_transaction:
                connection.rollback()
            raise FinalExamStorageError("sqlite_initialization_failed") from error
        except Exception:
            if connection is not None and connection.in_transaction:
                connection.rollback()
            raise
        finally:
            if connection is not None:
                connection.close()

    def _select_bundle_source(
        self,
        legacy_path: Optional[os.PathLike[str] | str],
        bundled_path: Optional[os.PathLike[str] | str],
        default: Optional[Mapping[str, Any]],
    ) -> Tuple[Dict[str, Any], Dict[str, Any]]:
        for path in (legacy_path, bundled_path):
            if path is not None and os.path.exists(os.fspath(path)):
                value, meta = self._read_json_source(path)
                return _validate_bundle(value), meta
        if default is None:
            raise FinalExamMigrationError("bundle_source_missing")
        value = _validate_bundle(dict(default))
        encoded = _encode_json(value, "default_bundle").encode("utf-8")
        return value, {
            "path": "<default:bundle>",
            "sha256": hashlib.sha256(encoded).hexdigest(),
            "bytes": len(encoded),
        }

    def _select_store_source(
        self,
        legacy_path: Optional[os.PathLike[str] | str],
        default: Optional[Mapping[str, Any]],
    ) -> Tuple[Dict[str, Any], Dict[str, Any]]:
        if legacy_path is not None and os.path.exists(os.fspath(legacy_path)):
            value, meta = self._read_json_source(legacy_path)
            return _validate_store(value), meta
        value = _validate_store(dict(default) if default is not None else {})
        encoded = _encode_json(value, "default_store").encode("utf-8")
        return value, {
            "path": "<default:store>",
            "sha256": hashlib.sha256(encoded).hexdigest(),
            "bytes": len(encoded),
        }

    def _read_json_source(self, path: os.PathLike[str] | str) -> Tuple[Dict[str, Any], Dict[str, Any]]:
        source = os.path.abspath(os.fspath(path))
        try:
            raw = Path(source).read_bytes()
        except OSError as error:
            raise FinalExamMigrationError("source_unreadable:" + source) from error
        if len(raw) > MAX_JSON_BYTES:
            raise FinalExamMigrationError("source_too_large:" + source)
        try:
            text = raw.decode("utf-8-sig")
        except UnicodeError as error:
            raise FinalExamMigrationError("source_not_utf8:" + source) from error
        return _decode_json_text(text, source), {
            "path": source,
            "sha256": hashlib.sha256(raw).hexdigest(),
            "bytes": len(raw),
        }

    def _document_from_conn(self, connection: sqlite3.Connection, kind: str) -> Document:
        row = connection.execute(
            "SELECT kind, payload_json, revision, updated_at FROM documents "
            "WHERE level = ? AND kind = ?",
            (self.level, kind),
        ).fetchone()
        if row is None:
            raise FinalExamStorageError("missing_document:" + kind)
        payload = _decode_json_text(row["payload_json"], "database:" + kind)
        return Document(kind, self._validate_document(kind, payload), int(row["revision"]), row["updated_at"])

    @contextlib.contextmanager
    def transaction(self, write: bool = False) -> Iterator[FinalExamTransaction]:
        connection: Optional[sqlite3.Connection] = None
        try:
            connection = self._connect()
            connection.execute("BEGIN IMMEDIATE" if write else "BEGIN")
            transaction = FinalExamTransaction(self, connection, write)
            yield transaction
            connection.commit()
        except sqlite3.Error as error:
            if connection is not None and connection.in_transaction:
                connection.rollback()
            raise FinalExamStorageError("sqlite_transaction_failed") from error
        except Exception:
            if connection is not None and connection.in_transaction:
                connection.rollback()
            raise
        finally:
            if connection is not None:
                connection.close()

    def run(self, write: bool, callback: Callable[[FinalExamTransaction], Any]) -> Any:
        with self.transaction(write=write) as transaction:
            return callback(transaction)

    def get_document(self, kind: str) -> Document:
        with self.transaction() as transaction:
            return transaction.get_document(kind)

    def get_bundle(self) -> Document:
        return self.get_document("bundle")

    def get_store(self) -> Document:
        return self.get_document("store")

    def read_bundle(self) -> Dict[str, Any]:
        return self.get_bundle().payload

    def read_store(self) -> Dict[str, Any]:
        return self.get_store().payload

    def read_documents(self) -> Dict[str, Document]:
        with self.transaction() as transaction:
            return {"bundle": transaction.get_bundle(), "store": transaction.get_store()}

    def put_document(
        self,
        kind: str,
        payload: Mapping[str, Any],
        expected_revision: Optional[int] = None,
    ) -> Document:
        with self.transaction(write=True) as transaction:
            return transaction.put_document(kind, payload, expected_revision)

    def put_bundle(self, payload: Mapping[str, Any], expected_revision: Optional[int] = None) -> Document:
        return self.put_document("bundle", payload, expected_revision)

    def put_store(self, payload: Mapping[str, Any], expected_revision: Optional[int] = None) -> Document:
        return self.put_document("store", payload, expected_revision)

    def replace_documents(
        self,
        bundle: Mapping[str, Any],
        store: Mapping[str, Any],
        *,
        expected_bundle_revision: Optional[int] = None,
        expected_store_revision: Optional[int] = None,
        audit_event: Optional[Mapping[str, Any]] = None,
    ) -> Dict[str, Document]:
        with self.transaction(write=True) as transaction:
            next_bundle = transaction.put_bundle(bundle, expected_bundle_revision)
            next_store = transaction.put_store(store, expected_store_revision)
            if audit_event:
                values = dict(audit_event)
                event_type = values.pop("event_type", values.pop("type", "documents_replaced"))
                transaction.append_audit(event_type, **values)
            return {"bundle": next_bundle, "store": next_store}

    def _append_audit_conn(
        self,
        connection: sqlite3.Connection,
        event_type: str,
        *,
        actor_email: str = "",
        student_id: str = "",
        request_id: str = "",
        source: str = "api",
        detail: Optional[Mapping[str, Any]] = None,
        occurred_at: Any = None,
    ) -> int:
        event_type = _require_name(event_type, "event_type")
        source = _require_name(source, "event_source")
        at = self._now_iso(occurred_at)
        detail_json = _encode_json(dict(detail or {}), "audit_detail")
        cursor = connection.execute(
            "INSERT INTO audit_events"
            "(level, occurred_at, event_type, actor_email, student_id, request_id, source, detail_json) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            (
                self.level,
                at,
                event_type,
                _clean_text(actor_email, 320).lower(),
                _clean_text(student_id, 80),
                _clean_text(request_id, 160),
                source,
                detail_json,
            ),
        )
        return int(cursor.lastrowid)

    def append_audit(self, event_type: str, **kwargs: Any) -> int:
        with self.transaction(write=True) as transaction:
            return transaction.append_audit(event_type, **kwargs)

    def _import_legacy_event(
        self, connection: sqlite3.Connection, event: Mapping[str, Any], fallback_at: str
    ) -> None:
        event_type = event.get("event") or event.get("type") or "legacy_event"
        occurred_at = event.get("at") or fallback_at
        try:
            occurred_at = self._now_iso(occurred_at)
        except ValueError:
            occurred_at = fallback_at
        standard = {"event", "type", "at", "email", "actor", "studentId", "requestId"}
        detail = {key: value for key, value in event.items() if key not in standard}
        self._append_audit_conn(
            connection,
            _clean_text(event_type, 160) or "legacy_event",
            actor_email=event.get("email") or event.get("actor") or "",
            student_id=event.get("studentId") or "",
            request_id=event.get("requestId") or "",
            source="legacy",
            detail=detail,
            occurred_at=occurred_at,
        )

    def list_audit(
        self,
        *,
        after_id: int = 0,
        limit: int = 100,
        event_type: str = "",
        student_id: str = "",
    ) -> List[Dict[str, Any]]:
        limit = max(1, min(1000, int(limit)))
        clauses = ["level = ?", "id > ?"]
        parameters: List[Any] = [self.level, max(0, int(after_id))]
        if event_type:
            clauses.append("event_type = ?")
            parameters.append(event_type)
        if student_id:
            clauses.append("student_id = ?")
            parameters.append(student_id)
        parameters.append(limit)
        connection = self._connect()
        try:
            rows = connection.execute(
                "SELECT * FROM audit_events WHERE " + " AND ".join(clauses) + " ORDER BY id LIMIT ?",
                parameters,
            ).fetchall()
            return [self._audit_row(row) for row in rows]
        finally:
            connection.close()

    @staticmethod
    def _audit_row(row: sqlite3.Row) -> Dict[str, Any]:
        return {
            "id": int(row["id"]),
            "level": row["level"],
            "occurredAt": row["occurred_at"],
            "eventType": row["event_type"],
            "actorEmail": row["actor_email"],
            "studentId": row["student_id"],
            "requestId": row["request_id"],
            "source": row["source"],
            "detail": json.loads(row["detail_json"]),
        }

    def consume_rate_window(
        self,
        bucket: str,
        subject_hash: str,
        *,
        limit: int,
        window_seconds: int,
        cost: int = 1,
        now: Any = None,
    ) -> RateLimitDecision:
        bucket = _require_name(bucket, "rate_bucket")
        if not _SUBJECT_HASH.fullmatch(str(subject_hash or "")):
            raise ValueError("invalid_subject_hash")
        limit = int(limit)
        window_seconds = int(window_seconds)
        cost = int(cost)
        if limit < 1 or window_seconds < 1 or cost < 1 or cost > limit:
            raise ValueError("invalid_rate_limit")
        epoch = int(math.floor(self._now_epoch(now)))
        window_start = (epoch // window_seconds) * window_seconds
        window_end = window_start + window_seconds
        with self.transaction(write=True) as transaction:
            connection = transaction.connection
            row = connection.execute(
                "SELECT hits, blocked_until FROM rate_windows "
                "WHERE bucket = ? AND subject_hash = ? AND window_start = ?",
                (bucket, subject_hash.lower(), window_start),
            ).fetchone()
            if row is None:
                hits = cost
                blocked_until = window_end if hits > limit else None
                connection.execute(
                    "INSERT INTO rate_windows"
                    "(bucket, subject_hash, window_start, window_end, hits, blocked_until, updated_at) "
                    "VALUES (?, ?, ?, ?, ?, ?, ?)",
                    (
                        bucket,
                        subject_hash.lower(),
                        window_start,
                        window_end,
                        hits,
                        blocked_until,
                        self._now_iso(now),
                    ),
                )
            else:
                existing_block = int(row["blocked_until"] or 0)
                if existing_block > epoch:
                    hits = int(row["hits"])
                    blocked_until = existing_block
                else:
                    hits = int(row["hits"]) + cost
                    blocked_until = window_end if hits > limit else None
                    connection.execute(
                        "UPDATE rate_windows SET hits = ?, blocked_until = ?, updated_at = ? "
                        "WHERE bucket = ? AND subject_hash = ? AND window_start = ?",
                        (
                            hits,
                            blocked_until,
                            self._now_iso(now),
                            bucket,
                            subject_hash.lower(),
                            window_start,
                        ),
                    )
            allowed = blocked_until is None and hits <= limit
            retry_after = max(0, int((blocked_until or window_end) - epoch)) if not allowed else 0
            return RateLimitDecision(
                allowed,
                limit,
                hits,
                max(0, limit - hits),
                retry_after,
                window_end,
            )

    def clear_rate_window(self, bucket: str, subject_hash: str) -> int:
        bucket = _require_name(bucket, "rate_bucket")
        if not _SUBJECT_HASH.fullmatch(str(subject_hash or "")):
            raise ValueError("invalid_subject_hash")
        with self.transaction(write=True) as transaction:
            cursor = transaction.connection.execute(
                "DELETE FROM rate_windows WHERE bucket = ? AND subject_hash = ?",
                (bucket, subject_hash.lower()),
            )
            return int(cursor.rowcount)

    def prune_rate_windows(self, before_epoch: Any) -> int:
        epoch = int(math.floor(self._now_epoch(before_epoch)))
        with self.transaction(write=True) as transaction:
            cursor = transaction.connection.execute(
                "DELETE FROM rate_windows WHERE window_end < ?", (epoch,)
            )
            return int(cursor.rowcount)

    def record_alert(
        self,
        alert_key: str,
        severity: str,
        *,
        message: str = "",
        context: Optional[Mapping[str, Any]] = None,
        now: Any = None,
    ) -> Dict[str, Any]:
        alert_key = _require_name(alert_key, "alert_key")
        severity = str(severity or "").lower()
        if severity not in _ALERT_SEVERITIES:
            raise ValueError("invalid_alert_severity")
        at = self._now_iso(now)
        context_json = _encode_json(dict(context or {}), "alert_context")
        with self.transaction(write=True) as transaction:
            connection = transaction.connection
            row = connection.execute(
                "SELECT * FROM alerts WHERE level = ? AND alert_key = ?",
                (self.level, alert_key),
            ).fetchone()
            reopened = bool(row is not None and row["status"] == "resolved")
            if row is None:
                connection.execute(
                    "INSERT INTO alerts"
                    "(level, alert_key, severity, status, message, context_json, first_seen_at, last_seen_at) "
                    "VALUES (?, ?, ?, 'open', ?, ?, ?, ?)",
                    (self.level, alert_key, severity, _clean_text(message, 1000), context_json, at, at),
                )
            else:
                status = "open" if reopened else row["status"]
                connection.execute(
                    "UPDATE alerts SET severity = ?, status = ?, message = ?, context_json = ?, "
                    "last_seen_at = ?, occurrences = occurrences + 1, "
                    "acknowledged_at = CASE WHEN ? THEN NULL ELSE acknowledged_at END, "
                    "acknowledged_by = CASE WHEN ? THEN NULL ELSE acknowledged_by END, "
                    "resolved_at = NULL, resolved_by = NULL, resolution = CASE WHEN ? THEN '' ELSE resolution END "
                    "WHERE level = ? AND alert_key = ?",
                    (
                        severity,
                        status,
                        _clean_text(message, 1000),
                        context_json,
                        at,
                        int(reopened),
                        int(reopened),
                        int(reopened),
                        self.level,
                        alert_key,
                    ),
                )
            self._append_audit_conn(
                connection,
                "alert_reopened" if reopened else ("alert_raised" if row is None else "alert_repeated"),
                source="alerting",
                detail={"alertKey": alert_key, "severity": severity},
                occurred_at=at,
            )
            return self._alert_from_row(
                connection.execute(
                    "SELECT * FROM alerts WHERE level = ? AND alert_key = ?",
                    (self.level, alert_key),
                ).fetchone()
            )

    def acknowledge_alert(self, alert_key: str, actor: str, *, now: Any = None) -> Dict[str, Any]:
        return self._transition_alert(alert_key, actor, "acknowledged", "", now)

    def resolve_alert(
        self, alert_key: str, actor: str, *, resolution: str = "", now: Any = None
    ) -> Dict[str, Any]:
        return self._transition_alert(alert_key, actor, "resolved", resolution, now)

    def _transition_alert(
        self, alert_key: str, actor: str, target: str, resolution: str, now: Any
    ) -> Dict[str, Any]:
        alert_key = _require_name(alert_key, "alert_key")
        actor = _clean_text(actor, 320).lower()
        if not actor:
            raise ValueError("alert_actor_required")
        at = self._now_iso(now)
        with self.transaction(write=True) as transaction:
            connection = transaction.connection
            row = connection.execute(
                "SELECT * FROM alerts WHERE level = ? AND alert_key = ?",
                (self.level, alert_key),
            ).fetchone()
            if row is None:
                raise KeyError(alert_key)
            if target == "acknowledged" and row["status"] == "open":
                connection.execute(
                    "UPDATE alerts SET status = 'acknowledged', acknowledged_at = ?, acknowledged_by = ? "
                    "WHERE level = ? AND alert_key = ?",
                    (at, actor, self.level, alert_key),
                )
                self._append_audit_conn(
                    connection,
                    "alert_acknowledged",
                    actor_email=actor,
                    source="alerting",
                    detail={"alertKey": alert_key},
                    occurred_at=at,
                )
            elif target == "resolved" and row["status"] != "resolved":
                connection.execute(
                    "UPDATE alerts SET status = 'resolved', resolved_at = ?, resolved_by = ?, resolution = ? "
                    "WHERE level = ? AND alert_key = ?",
                    (at, actor, _clean_text(resolution, 1000), self.level, alert_key),
                )
                self._append_audit_conn(
                    connection,
                    "alert_resolved",
                    actor_email=actor,
                    source="alerting",
                    detail={"alertKey": alert_key, "resolution": _clean_text(resolution, 1000)},
                    occurred_at=at,
                )
            return self._alert_from_row(
                connection.execute(
                    "SELECT * FROM alerts WHERE level = ? AND alert_key = ?",
                    (self.level, alert_key),
                ).fetchone()
            )

    def get_alert(self, alert_key: str) -> Optional[Dict[str, Any]]:
        connection = self._connect()
        try:
            row = connection.execute(
                "SELECT * FROM alerts WHERE level = ? AND alert_key = ?",
                (self.level, alert_key),
            ).fetchone()
            return self._alert_from_row(row) if row is not None else None
        finally:
            connection.close()

    def list_alerts(self, *, active_only: bool = False, limit: int = 100) -> List[Dict[str, Any]]:
        connection = self._connect()
        try:
            sql = "SELECT * FROM alerts WHERE level = ?"
            parameters: List[Any] = [self.level]
            if active_only:
                sql += " AND status != 'resolved'"
            sql += " ORDER BY last_seen_at DESC, alert_key LIMIT ?"
            parameters.append(max(1, min(1000, int(limit))))
            return [self._alert_from_row(row) for row in connection.execute(sql, parameters)]
        finally:
            connection.close()

    @staticmethod
    def _alert_from_row(row: sqlite3.Row) -> Dict[str, Any]:
        return {
            "level": row["level"],
            "alertKey": row["alert_key"],
            "severity": row["severity"],
            "status": row["status"],
            "message": row["message"],
            "context": json.loads(row["context_json"]),
            "firstSeenAt": row["first_seen_at"],
            "lastSeenAt": row["last_seen_at"],
            "occurrences": int(row["occurrences"]),
            "acknowledgedAt": row["acknowledged_at"],
            "acknowledgedBy": row["acknowledged_by"],
            "resolvedAt": row["resolved_at"],
            "resolvedBy": row["resolved_by"],
            "resolution": row["resolution"],
        }

    def _enqueue_grade_conn(
        self,
        connection: sqlite3.Connection,
        student_id: str,
        grade: float,
        attempt_id: str,
        *,
        evaluation_id: str,
        idempotency_key: str,
        payload: Optional[Mapping[str, Any]],
    ) -> int:
        student_id = _require_name(student_id, "student_id")
        evaluation_id = _require_name(evaluation_id, "evaluation_id")
        attempt_id = _require_name(attempt_id, "attempt_id")
        if isinstance(grade, bool) or not isinstance(grade, (int, float)) or not math.isfinite(float(grade)):
            raise ValueError("invalid_grade")
        idempotency_key = idempotency_key or (
            self.level + ":" + student_id + ":" + evaluation_id + ":" + attempt_id
        )
        idempotency_key = _require_name(idempotency_key, "idempotency_key")
        payload_json = _encode_json(dict(payload or {}), "grade_outbox_payload")
        now_epoch = self._now_epoch()
        now_iso = _iso_from_epoch(now_epoch)
        existing = connection.execute(
            "SELECT * FROM grade_outbox WHERE level = ? AND idempotency_key = ?",
            (self.level, idempotency_key),
        ).fetchone()
        if existing is not None:
            if (
                existing["student_id"] != student_id
                or existing["evaluation_id"] != evaluation_id
                or existing["attempt_id"] != attempt_id
                or float(existing["grade"]) != float(grade)
                or existing["payload_json"] != payload_json
            ):
                raise FinalExamConflictError("grade_idempotency_conflict")
            return int(existing["id"])
        cursor = connection.execute(
            "INSERT INTO grade_outbox"
            "(level, student_id, evaluation_id, grade, attempt_id, idempotency_key, payload_json, "
            "status, available_at, created_at, updated_at) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)",
            (
                self.level,
                student_id,
                evaluation_id,
                float(grade),
                attempt_id,
                idempotency_key,
                payload_json,
                now_epoch,
                now_iso,
                now_iso,
            ),
        )
        return int(cursor.lastrowid)

    def enqueue_grade_sync(
        self,
        student_id: str,
        grade: float,
        attempt_id: str,
        *,
        evaluation_id: str = "finalExam",
        idempotency_key: str = "",
        payload: Optional[Mapping[str, Any]] = None,
    ) -> int:
        with self.transaction(write=True) as transaction:
            return transaction.enqueue_grade_sync(
                student_id,
                grade,
                attempt_id,
                evaluation_id=evaluation_id,
                idempotency_key=idempotency_key,
                payload=payload,
            )

    def claim_grade_outbox(
        self,
        worker_id: str,
        *,
        limit: int = 10,
        lease_seconds: int = 60,
        now: Any = None,
    ) -> List[Dict[str, Any]]:
        worker_id = _require_name(worker_id, "worker_id")
        limit = max(1, min(100, int(limit)))
        lease_seconds = max(5, min(3600, int(lease_seconds)))
        epoch = self._now_epoch(now)
        at = _iso_from_epoch(epoch)
        claimed: List[Dict[str, Any]] = []
        with self.transaction(write=True) as transaction:
            connection = transaction.connection
            rows = connection.execute(
                "SELECT * FROM grade_outbox WHERE level = ? AND available_at <= ? AND "
                "((status IN ('pending','retry')) OR (status = 'inflight' AND lease_until <= ?)) "
                "ORDER BY id LIMIT ?",
                (self.level, epoch, epoch, limit),
            ).fetchall()
            for row in rows:
                token = secrets.token_urlsafe(24)
                connection.execute(
                    "UPDATE grade_outbox SET status = 'inflight', attempts = attempts + 1, "
                    "lease_owner = ?, lease_token = ?, lease_until = ?, updated_at = ? WHERE id = ?",
                    (worker_id, token, epoch + lease_seconds, at, int(row["id"])),
                )
                claimed_row = connection.execute(
                    "SELECT * FROM grade_outbox WHERE id = ?", (int(row["id"]),)
                ).fetchone()
                claimed.append(self._grade_row(claimed_row))
        return claimed

    def complete_grade_outbox(
        self, item_id: int, worker_id: str, claim_token: str, *, now: Any = None
    ) -> Dict[str, Any]:
        return self._finish_grade_claim(item_id, worker_id, claim_token, True, "", 0, now)

    def retry_grade_outbox(
        self,
        item_id: int,
        worker_id: str,
        claim_token: str,
        error: str,
        *,
        retry_after_seconds: int = 60,
        now: Any = None,
    ) -> Dict[str, Any]:
        return self._finish_grade_claim(
            item_id,
            worker_id,
            claim_token,
            False,
            error,
            max(1, min(86400, int(retry_after_seconds))),
            now,
        )

    def _finish_grade_claim(
        self,
        item_id: int,
        worker_id: str,
        claim_token: str,
        success: bool,
        error: str,
        retry_after: int,
        now: Any,
    ) -> Dict[str, Any]:
        worker_id = _require_name(worker_id, "worker_id")
        if not claim_token:
            raise ValueError("claim_token_required")
        epoch = self._now_epoch(now)
        at = _iso_from_epoch(epoch)
        with self.transaction(write=True) as transaction:
            connection = transaction.connection
            if success:
                cursor = connection.execute(
                    "UPDATE grade_outbox SET status = 'done', completed_at = ?, updated_at = ?, "
                    "lease_owner = NULL, lease_token = NULL, lease_until = NULL, last_error = '' "
                    "WHERE id = ? AND level = ? AND status = 'inflight' AND lease_owner = ? AND lease_token = ?",
                    (at, at, int(item_id), self.level, worker_id, claim_token),
                )
            else:
                cursor = connection.execute(
                    "UPDATE grade_outbox SET status = 'retry', available_at = ?, updated_at = ?, "
                    "lease_owner = NULL, lease_token = NULL, lease_until = NULL, last_error = ? "
                    "WHERE id = ? AND level = ? AND status = 'inflight' AND lease_owner = ? AND lease_token = ?",
                    (
                        epoch + retry_after,
                        at,
                        _clean_text(error, 2000),
                        int(item_id),
                        self.level,
                        worker_id,
                        claim_token,
                    ),
                )
            if cursor.rowcount != 1:
                raise FinalExamConflictError("grade_claim_lost")
            row = connection.execute("SELECT * FROM grade_outbox WHERE id = ?", (int(item_id),)).fetchone()
            return self._grade_row(row)

    def list_grade_outbox(self, *, status: str = "", limit: int = 100) -> List[Dict[str, Any]]:
        connection = self._connect()
        try:
            sql = "SELECT * FROM grade_outbox WHERE level = ?"
            parameters: List[Any] = [self.level]
            if status:
                sql += " AND status = ?"
                parameters.append(status)
            sql += " ORDER BY id LIMIT ?"
            parameters.append(max(1, min(1000, int(limit))))
            return [self._grade_row(row) for row in connection.execute(sql, parameters)]
        finally:
            connection.close()

    @staticmethod
    def _grade_row(row: sqlite3.Row) -> Dict[str, Any]:
        return {
            "id": int(row["id"]),
            "level": row["level"],
            "studentId": row["student_id"],
            "evaluationId": row["evaluation_id"],
            "grade": float(row["grade"]),
            "attemptId": row["attempt_id"],
            "idempotencyKey": row["idempotency_key"],
            "payload": json.loads(row["payload_json"]),
            "status": row["status"],
            "attempts": int(row["attempts"]),
            "availableAtEpoch": float(row["available_at"]),
            "leaseOwner": row["lease_owner"],
            "claimToken": row["lease_token"],
            "leaseUntilEpoch": row["lease_until"],
            "lastError": row["last_error"],
            "createdAt": row["created_at"],
            "updatedAt": row["updated_at"],
            "completedAt": row["completed_at"],
        }

    def acquire_scheduler_lease(
        self,
        owner: str,
        *,
        lease_seconds: int = 60,
        now: Any = None,
    ) -> Optional[str]:
        owner = _require_name(owner, "scheduler_owner")
        lease_seconds = max(5, min(3600, int(lease_seconds)))
        epoch = self._now_epoch(now)
        at = _iso_from_epoch(epoch)
        with self.transaction(write=True) as transaction:
            connection = transaction.connection
            connection.execute(
                "INSERT INTO scheduler_state(level, updated_at) VALUES (?, ?) "
                "ON CONFLICT(level) DO NOTHING",
                (self.level, at),
            )
            row = connection.execute(
                "SELECT * FROM scheduler_state WHERE level = ?", (self.level,)
            ).fetchone()
            active = row["lease_token"] and float(row["lease_until"] or 0) > epoch
            if active and row["lease_owner"] != owner:
                return None
            token = row["lease_token"] if active else secrets.token_urlsafe(24)
            connection.execute(
                "UPDATE scheduler_state SET lease_owner = ?, lease_token = ?, lease_until = ?, "
                "heartbeat_at = ?, updated_at = ? WHERE level = ?",
                (owner, token, epoch + lease_seconds, at, at, self.level),
            )
            return str(token)

    def heartbeat_scheduler(
        self,
        owner: str,
        lease_token: str,
        *,
        lease_seconds: int = 60,
        now: Any = None,
    ) -> Dict[str, Any]:
        owner = _require_name(owner, "scheduler_owner")
        lease_seconds = max(5, min(3600, int(lease_seconds)))
        epoch = self._now_epoch(now)
        at = _iso_from_epoch(epoch)
        with self.transaction(write=True) as transaction:
            cursor = transaction.connection.execute(
                "UPDATE scheduler_state SET lease_until = ?, heartbeat_at = ?, updated_at = ? "
                "WHERE level = ? AND lease_owner = ? AND lease_token = ? AND lease_until >= ?",
                (epoch + lease_seconds, at, at, self.level, owner, lease_token, epoch),
            )
            if cursor.rowcount != 1:
                raise FinalExamConflictError("scheduler_lease_lost")
            return self._scheduler_row(
                transaction.connection.execute(
                    "SELECT * FROM scheduler_state WHERE level = ?", (self.level,)
                ).fetchone()
            )

    def record_scheduler_tick(
        self,
        owner: str,
        lease_token: str,
        *,
        success: bool,
        state: Optional[Mapping[str, Any]] = None,
        error: str = "",
        lease_seconds: int = 60,
        now: Any = None,
    ) -> Dict[str, Any]:
        owner = _require_name(owner, "scheduler_owner")
        epoch = self._now_epoch(now)
        at = _iso_from_epoch(epoch)
        state_json = _encode_json(dict(state or {}), "scheduler_state")
        with self.transaction(write=True) as transaction:
            connection = transaction.connection
            cursor = connection.execute(
                "UPDATE scheduler_state SET revision = revision + 1, state_json = ?, "
                "lease_until = ?, heartbeat_at = ?, last_tick_at = ?, "
                "last_success_at = CASE WHEN ? THEN ? ELSE last_success_at END, "
                "last_error = ?, consecutive_failures = CASE WHEN ? THEN 0 ELSE consecutive_failures + 1 END, "
                "updated_at = ? WHERE level = ? AND lease_owner = ? AND lease_token = ? AND lease_until >= ?",
                (
                    state_json,
                    epoch + max(5, min(3600, int(lease_seconds))),
                    at,
                    at,
                    int(bool(success)),
                    at,
                    "" if success else _clean_text(error, 2000),
                    int(bool(success)),
                    at,
                    self.level,
                    owner,
                    lease_token,
                    epoch,
                ),
            )
            if cursor.rowcount != 1:
                raise FinalExamConflictError("scheduler_lease_lost")
            return self._scheduler_row(
                connection.execute("SELECT * FROM scheduler_state WHERE level = ?", (self.level,)).fetchone()
            )

    def release_scheduler_lease(self, owner: str, lease_token: str, *, now: Any = None) -> bool:
        owner = _require_name(owner, "scheduler_owner")
        at = self._now_iso(now)
        with self.transaction(write=True) as transaction:
            cursor = transaction.connection.execute(
                "UPDATE scheduler_state SET lease_owner = NULL, lease_token = NULL, lease_until = NULL, "
                "updated_at = ? WHERE level = ? AND lease_owner = ? AND lease_token = ?",
                (at, self.level, owner, lease_token),
            )
            return cursor.rowcount == 1

    def get_scheduler_state(self) -> Optional[Dict[str, Any]]:
        connection = self._connect()
        try:
            row = connection.execute(
                "SELECT * FROM scheduler_state WHERE level = ?", (self.level,)
            ).fetchone()
            return self._scheduler_row(row) if row is not None else None
        finally:
            connection.close()

    @staticmethod
    def _scheduler_row(row: sqlite3.Row) -> Dict[str, Any]:
        return {
            "level": row["level"],
            "revision": int(row["revision"]),
            "state": json.loads(row["state_json"]),
            "leaseOwner": row["lease_owner"],
            "leaseToken": row["lease_token"],
            "leaseUntilEpoch": row["lease_until"],
            "heartbeatAt": row["heartbeat_at"],
            "lastTickAt": row["last_tick_at"],
            "lastSuccessAt": row["last_success_at"],
            "lastError": row["last_error"],
            "consecutiveFailures": int(row["consecutive_failures"]),
            "updatedAt": row["updated_at"],
        }

    def health(self, *, deep: bool = False) -> Dict[str, Any]:
        result: Dict[str, Any] = {
            "ok": False,
            "path": self.db_path,
            "level": self.level,
            "schemaVersion": None,
            "journalMode": None,
            "synchronous": None,
            "busyTimeoutMs": self.busy_timeout_ms,
            "writable": False,
        }
        connection: Optional[sqlite3.Connection] = None
        try:
            connection = self._connect()
            result["schemaVersion"] = int(connection.execute("PRAGMA user_version").fetchone()[0])
            result["journalMode"] = str(connection.execute("PRAGMA journal_mode").fetchone()[0]).lower()
            result["synchronous"] = int(connection.execute("PRAGMA synchronous").fetchone()[0])
            result["busyTimeoutMs"] = int(connection.execute("PRAGMA busy_timeout").fetchone()[0])
            check_pragma = "PRAGMA integrity_check" if deep else "PRAGMA quick_check"
            check_rows = [str(row[0]) for row in connection.execute(check_pragma)]
            result["integrity"] = check_rows
            connection.execute("BEGIN IMMEDIATE")
            connection.rollback()
            result["writable"] = True
            rows = connection.execute(
                "SELECT kind, payload_json, revision FROM documents WHERE level = ?", (self.level,)
            ).fetchall()
            valid_documents = set()
            revisions: Dict[str, int] = {}
            for row in rows:
                payload = _decode_json_text(row["payload_json"], "health:" + row["kind"])
                self._validate_document(row["kind"], payload)
                valid_documents.add(row["kind"])
                revisions[row["kind"]] = int(row["revision"])
            ledger_count = int(
                connection.execute(
                    "SELECT COUNT(*) FROM migration_ledger WHERE level = ?", (self.level,)
                ).fetchone()[0]
            )
            result["documents"] = sorted(valid_documents)
            result["documentRevisions"] = revisions
            result["migrationComplete"] = ledger_count == 2
            result["auditEvents"] = int(
                connection.execute(
                    "SELECT COUNT(*) FROM audit_events WHERE level = ?", (self.level,)
                ).fetchone()[0]
            )
            result["activeAlerts"] = int(
                connection.execute(
                    "SELECT COUNT(*) FROM alerts WHERE level = ? AND status != 'resolved'", (self.level,)
                ).fetchone()[0]
            )
            pending = connection.execute(
                "SELECT COUNT(*) AS count, MIN(created_at) AS oldest FROM grade_outbox "
                "WHERE level = ? AND status IN ('pending','retry','inflight')",
                (self.level,),
            ).fetchone()
            result["pendingGradeOutbox"] = int(pending["count"])
            result["oldestPendingGradeAt"] = pending["oldest"]
            scheduler = connection.execute(
                "SELECT * FROM scheduler_state WHERE level = ?", (self.level,)
            ).fetchone()
            result["scheduler"] = self._scheduler_row(scheduler) if scheduler is not None else None
            result["ok"] = bool(
                check_rows == ["ok"]
                and result["schemaVersion"] == SCHEMA_VERSION
                and result["journalMode"] == "wal"
                and result["synchronous"] == 2
                and valid_documents == set(DOCUMENT_KINDS)
                and result["migrationComplete"]
                and result["writable"]
            )
        except Exception as error:
            result["error"] = _clean_text(error, 500) or error.__class__.__name__
        finally:
            if connection is not None:
                if connection.in_transaction:
                    connection.rollback()
                connection.close()
            try:
                result["databaseBytes"] = os.path.getsize(self.db_path)
                result["walBytes"] = os.path.getsize(self.db_path + "-wal") if os.path.exists(self.db_path + "-wal") else 0
                result["freeBytes"] = shutil.disk_usage(os.path.dirname(self.db_path) or ".").free
            except OSError:
                pass
        return result

    def backup(self, target_path: os.PathLike[str] | str) -> Dict[str, Any]:
        target = os.path.abspath(os.fspath(target_path))
        if target == self.db_path:
            raise ValueError("backup_target_matches_source")
        target_directory = os.path.dirname(target) or "."
        os.makedirs(target_directory, exist_ok=True)
        fd, temporary = tempfile.mkstemp(prefix=".final-exam-backup-", suffix=".sqlite3", dir=target_directory)
        os.close(fd)
        os.unlink(temporary)
        source: Optional[sqlite3.Connection] = None
        destination: Optional[sqlite3.Connection] = None
        try:
            source = self._connect()
            destination = sqlite3.connect(temporary, isolation_level=None)
            source.backup(destination)
            check = [str(row[0]) for row in destination.execute("PRAGMA quick_check")]
            if check != ["ok"]:
                raise FinalExamStorageError("backup_integrity_failed")
            destination.execute("PRAGMA journal_mode = DELETE")
            destination.execute("PRAGMA synchronous = FULL")
            destination.close()
            destination = None
            with open(temporary, "rb+") as handle:
                os.fsync(handle.fileno())
            os.replace(temporary, target)
            self._fsync_directory(target_directory)
            return {
                "path": target,
                "bytes": os.path.getsize(target),
                "createdAt": self._now_iso(),
                "schemaVersion": SCHEMA_VERSION,
            }
        finally:
            if destination is not None:
                destination.close()
            if source is not None:
                source.close()
            if os.path.exists(temporary):
                os.unlink(temporary)

    def export_legacy(
        self,
        bundle_path: os.PathLike[str] | str,
        store_path: os.PathLike[str] | str,
    ) -> Dict[str, Any]:
        bundle_target = os.path.abspath(os.fspath(bundle_path))
        store_target = os.path.abspath(os.fspath(store_path))
        if bundle_target == store_target:
            raise ValueError("export_targets_must_differ")
        documents = self.read_documents()
        bundle_temp = self._stage_json(bundle_target, documents["bundle"].payload)
        store_temp = ""
        try:
            store_temp = self._stage_json(store_target, documents["store"].payload)
            os.replace(bundle_temp, bundle_target)
            bundle_temp = ""
            os.replace(store_temp, store_target)
            store_temp = ""
            self._fsync_directory(os.path.dirname(bundle_target) or ".")
            if os.path.dirname(store_target) != os.path.dirname(bundle_target):
                self._fsync_directory(os.path.dirname(store_target) or ".")
            return {
                "bundlePath": bundle_target,
                "storePath": store_target,
                "bundleRevision": documents["bundle"].revision,
                "storeRevision": documents["store"].revision,
                "exportedAt": self._now_iso(),
            }
        finally:
            for path in (bundle_temp, store_temp):
                if path and os.path.exists(path):
                    os.unlink(path)

    @staticmethod
    def _stage_json(target: str, payload: Mapping[str, Any]) -> str:
        directory = os.path.dirname(target) or "."
        os.makedirs(directory, exist_ok=True)
        fd, temporary = tempfile.mkstemp(prefix=".final-exam-export-", suffix=".json", dir=directory)
        try:
            with os.fdopen(fd, "w", encoding="utf-8", newline="\n") as handle:
                json.dump(payload, handle, ensure_ascii=False, indent=2, allow_nan=False)
                handle.write("\n")
                handle.flush()
                os.fsync(handle.fileno())
            return temporary
        except Exception:
            try:
                os.close(fd)
            except OSError:
                pass
            if os.path.exists(temporary):
                os.unlink(temporary)
            raise

    @staticmethod
    def _fsync_directory(directory: str) -> None:
        try:
            descriptor = os.open(directory, os.O_RDONLY)
        except OSError:
            return
        try:
            os.fsync(descriptor)
        except OSError:
            pass
        finally:
            os.close(descriptor)


__all__ = [
    "Document",
    "FinalExamConflictError",
    "FinalExamMigrationError",
    "FinalExamRepository",
    "FinalExamStorageError",
    "FinalExamTransaction",
    "MigrationReport",
    "RateLimitDecision",
    "SCHEMA_VERSION",
]
