#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'
umask 027

readonly WEB_ROOT="/var/www/jaralingua.com"
readonly STATE_DIR="/var/lib/jaralingua"
readonly BACKUP_ROOT="/var/backups/jaralingua/french8-final-exam"
readonly SERVICE_NAME="jaralingua-progress-api.service"
readonly SERVICE_OVERRIDE="/etc/systemd/system/jaralingua-progress-api.service.d/40-french8-final-exam.conf"
readonly DB_PATH="$STATE_DIR/french8-final-exam.sqlite3"
readonly HEALTH_URL="http://127.0.0.1:8787/api/health"
readonly LOCK_PATH="/run/lock/jaralingua-french8-final-exam-release.lock"

readonly -a PAYLOAD_FILES=(
  "data/french8-final-exam.local.json"
  "frances/Niveau 8/examen-final.html"
  "frances/Niveau 8/index.html"
  "frances/Niveau 8/img/examen-final/examen-final-niveau8-ville-intelligente-hero-v1.png"
  "server/final_exam_runtime.py"
  "server/final_exam_storage.py"
  "server/french8_exam_publisher.py"
  "server/progress_api.py"
  "server/private_assets/french8-final-exam-audio.mp3"
  "deploy/jaralingua-progress-api-french8-final.conf"
  "deploy/french8-final-exam-release.sh"
)

readonly -a INSTALL_SOURCES=(
  "data/french8-final-exam.local.json"
  "frances/Niveau 8/examen-final.html"
  "frances/Niveau 8/index.html"
  "frances/Niveau 8/img/examen-final/examen-final-niveau8-ville-intelligente-hero-v1.png"
  "server/final_exam_runtime.py"
  "server/final_exam_storage.py"
  "server/french8_exam_publisher.py"
  "server/progress_api.py"
  "server/private_assets/french8-final-exam-audio.mp3"
  "deploy/jaralingua-progress-api-french8-final.conf"
)

readonly -a INSTALL_TARGETS=(
  "$WEB_ROOT/data/french8-final-exam.local.json"
  "$WEB_ROOT/frances/Niveau 8/examen-final.html"
  "$WEB_ROOT/frances/Niveau 8/index.html"
  "$WEB_ROOT/frances/Niveau 8/img/examen-final/examen-final-niveau8-ville-intelligente-hero-v1.png"
  "$WEB_ROOT/server/final_exam_runtime.py"
  "$WEB_ROOT/server/final_exam_storage.py"
  "$WEB_ROOT/server/french8_exam_publisher.py"
  "$WEB_ROOT/server/progress_api.py"
  "$WEB_ROOT/server/private_assets/french8-final-exam-audio.mp3"
  "$SERVICE_OVERRIDE"
)

readonly -a INSTALL_KEYS=(
  "bundle-json"
  "exam-page"
  "level-index"
  "hero-image"
  "runtime-module"
  "storage-module"
  "exam-bank-publisher"
  "progress-api"
  "bundled-audio"
  "systemd-override"
)

readonly -a INSTALL_OWNERS=(
  "www-data:www-data"
  "www-data:www-data"
  "www-data:www-data"
  "www-data:www-data"
  "www-data:www-data"
  "www-data:www-data"
  "www-data:www-data"
  "www-data:www-data"
  "www-data:www-data"
  "root:root"
)

readonly -a INSTALL_MODES=(
  "0640"
  "0644"
  "0644"
  "0644"
  "0640"
  "0640"
  "0640"
  "0640"
  "0640"
  "0644"
)

readonly -a LIVE_STATE_TARGETS=(
  "$STATE_DIR/french8-final-exam.json"
  "$STATE_DIR/french8-final-exam-submissions.json"
  "$STATE_DIR/french8-final-exam-audio.mp3"
  "$STATE_DIR/french8-grades.json"
)

readonly -a LIVE_STATE_KEYS=(
  "live-bundle-json"
  "live-submissions-json"
  "live-audio"
  "live-grades"
)

STAGE_DIR=""
BACKUP_DIR=""
DEPLOYMENT_STARTED=0
BACKUP_READY=0
FILES_MUTATED=0
CREATED_IMAGE_DIR=0
CREATED_OVERRIDE_DIR=0
DATABASE_WAS_PRESENT=0
DATABASE_BACKUP_SHA256=""
declare -a PENDING_TEMP_FILES=()

log() {
  printf '[french8-release] %s\n' "$*"
}

fail() {
  log "ERROR: $*" >&2
  return 1
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || fail "required command not found: $1"
}

assert_safe_stage_path() {
  local candidate="$1"
  [[ -n "$candidate" && "$candidate" == /tmp/jaralingua-french8-release-* ]] \
    || fail "staged directory must match /tmp/jaralingua-french8-release-*"
  [[ "$candidate" != "/" && "$candidate" != "$WEB_ROOT" && "$candidate" != "$STATE_DIR" ]] \
    || fail "unsafe staged directory"
}

cleanup_known_stage() {
  local relative candidate
  [[ -n "$STAGE_DIR" ]] || return 0
  assert_safe_stage_path "$STAGE_DIR" || return 0
  for relative in "${PAYLOAD_FILES[@]}" "SHA256SUMS"; do
    candidate="$STAGE_DIR/$relative"
    [[ "$candidate" == "$STAGE_DIR/"* ]] || continue
    rm -f -- "$candidate" || true
  done
  rmdir -- "$STAGE_DIR/frances/Niveau 8/img/examen-final" 2>/dev/null || true
  rmdir -- "$STAGE_DIR/frances/Niveau 8/img" 2>/dev/null || true
  rmdir -- "$STAGE_DIR/frances/Niveau 8" 2>/dev/null || true
  rmdir -- "$STAGE_DIR/frances" 2>/dev/null || true
  rmdir -- "$STAGE_DIR/server/private_assets" 2>/dev/null || true
  rmdir -- "$STAGE_DIR/server" 2>/dev/null || true
  rmdir -- "$STAGE_DIR/data" 2>/dev/null || true
  rmdir -- "$STAGE_DIR/deploy" 2>/dev/null || true
  rmdir -- "$STAGE_DIR" 2>/dev/null || true
}

cleanup_pending_files() {
  local candidate
  for candidate in "${PENDING_TEMP_FILES[@]:-}"; do
    case "$candidate" in
      "$WEB_ROOT"/*|"$STATE_DIR"/*|/etc/systemd/system/jaralingua-progress-api.service.d/*)
        rm -f -- "$candidate"
        ;;
    esac
  done
}

backup_regular_file() {
  local target="$1" key="$2" marker="$BACKUP_DIR/meta/$2.state"
  if [[ -L "$target" ]]; then
    fail "refusing symlink target: $target"
  elif [[ -e "$target" ]]; then
    [[ -f "$target" ]] || fail "target is not a regular file: $target"
    cp -a -- "$target" "$BACKUP_DIR/files/$key"
    printf 'present\n' >"$marker"
  else
    printf 'absent\n' >"$marker"
  fi
}

restore_regular_file() {
  local target="$1" key="$2" state temp parent
  state="$(<"$BACKUP_DIR/meta/$key.state")"
  if [[ "$state" == "present" ]]; then
    parent="$(dirname -- "$target")"
    temp="$parent/.french8-rollback-${key}-$$"
    PENDING_TEMP_FILES+=("$temp")
    cp -a -- "$BACKUP_DIR/files/$key" "$temp"
    mv -fT -- "$temp" "$target"
  elif [[ "$state" == "absent" ]]; then
    rm -f -- "$target"
  else
    fail "invalid backup marker for $key"
  fi
}

validate_sqlite() {
  local path="$1" require_schema="${2:-0}"
  python3 - "$path" "$require_schema" <<'PY'
import sqlite3
import sys

path, require_schema = sys.argv[1], sys.argv[2] == "1"
connection = sqlite3.connect("file:" + path + "?mode=ro", uri=True)
try:
    result = connection.execute("PRAGMA quick_check").fetchone()
    if not result or result[0] != "ok":
        raise SystemExit("sqlite quick_check failed")
    if require_schema:
        version = int(connection.execute("PRAGMA user_version").fetchone()[0])
        if version < 1:
            raise SystemExit("sqlite schema version is not initialized")
        names = {
            row[0]
            for row in connection.execute(
                "SELECT name FROM sqlite_master WHERE type = 'table'"
            )
        }
        required = {
            "documents",
            "audit_events",
            "rate_windows",
            "alerts",
            "grade_outbox",
            "scheduler_state",
        }
        missing = sorted(required - names)
        if missing:
            raise SystemExit("sqlite tables missing: " + ", ".join(missing))
finally:
    connection.close()
PY
}

validate_exam_locked() {
  local path="$1"
  python3 - "$path" <<'PY'
import json
import sqlite3
import sys

connection = sqlite3.connect("file:" + sys.argv[1] + "?mode=ro", uri=True)
try:
    row = connection.execute(
        "SELECT payload_json FROM documents WHERE level = 'french8' AND kind = 'bundle'"
    ).fetchone()
finally:
    connection.close()
if not row:
    raise SystemExit("French 8 bundle is missing from SQLite")
payload = json.loads(row[0])
state = payload.get("state") if isinstance(payload, dict) else None
if not isinstance(state, dict):
    raise SystemExit("French 8 state is invalid")
if state.get("isOpen") is True:
    raise SystemExit("French 8 exam must remain locked after this release")
if state.get("scheduleEnabled") is True:
    raise SystemExit("French 8 scheduling must remain disabled during bank publication")
PY
}

backup_sqlite() {
  local destination="$BACKUP_DIR/files/database.sqlite3" digest_line
  if [[ -L "$DB_PATH" ]]; then
    fail "refusing symlink database: $DB_PATH"
  elif [[ -e "$DB_PATH" ]]; then
    [[ -f "$DB_PATH" ]] || fail "database path is not a regular file"
    validate_sqlite "$DB_PATH" 0
    python3 - "$DB_PATH" "$destination" <<'PY'
import os
import sqlite3
import sys

source_path, destination_path = sys.argv[1:3]
source_connection = sqlite3.connect("file:" + source_path + "?mode=ro", uri=True)
destination_connection = sqlite3.connect(destination_path)
try:
    source_connection.backup(destination_connection)
    result = destination_connection.execute("PRAGMA quick_check").fetchone()
    if not result or result[0] != "ok":
        raise SystemExit("sqlite backup verification failed")
finally:
    destination_connection.close()
    source_connection.close()
os.chmod(destination_path, 0o600)
PY
    digest_line="$(sha256sum -- "$destination")"
    DATABASE_BACKUP_SHA256="${digest_line%% *}"
    [[ "$DATABASE_BACKUP_SHA256" =~ ^[0-9a-f]{64}$ ]] \
      || fail "invalid SQLite backup SHA-256"
    printf '%s\n' "$DATABASE_BACKUP_SHA256" >"$BACKUP_DIR/meta/database.sha256"
    DATABASE_WAS_PRESENT=1
    printf 'present\n' >"$BACKUP_DIR/meta/database.state"
  else
    DATABASE_WAS_PRESENT=0
    DATABASE_BACKUP_SHA256=""
    printf 'absent\n' >"$BACKUP_DIR/meta/database.state"
  fi
}

publish_persistent_exam_bank() {
  local publisher="$WEB_ROOT/server/french8_exam_publisher.py"
  local bundle="$WEB_ROOT/data/french8-final-exam.local.json"
  local backup="$BACKUP_DIR/files/database.sqlite3"
  local -a plan_values=()
  [[ "$DATABASE_WAS_PRESENT" -eq 1 ]] || return 0
  [[ -f "$publisher" && ! -L "$publisher" ]] || fail "exam-bank publisher is unavailable"
  [[ -f "$bundle" && ! -L "$bundle" ]] || fail "installed exam bank is unavailable"
  [[ -f "$DB_PATH" && ! -L "$DB_PATH" ]] || fail "French 8 database disappeared before publication"

  runuser -u www-data -- python3 "$publisher" \
    --database "$DB_PATH" \
    --bundle "$bundle" \
    --dry-run \
    >"$BACKUP_DIR/meta/exam-bank-dry-run.json"

  mapfile -t plan_values < <(
    python3 - "$BACKUP_DIR/meta/exam-bank-dry-run.json" <<'PY'
import json
import pathlib
import sys

plan = json.loads(pathlib.Path(sys.argv[1]).read_text(encoding="utf-8"))
if plan.get("ok") is not True or not isinstance(plan.get("bundleRevisionBefore"), int):
    raise SystemExit("invalid exam-bank dry-run report")
print(plan["bundleRevisionBefore"])
print(plan.get("oldVersion") or "")
PY
  )
  [[ "${#plan_values[@]}" -eq 2 && "${plan_values[0]}" =~ ^[0-9]+$ && -n "${plan_values[1]}" ]] \
    || fail "invalid exam-bank publication plan"

  runuser -u www-data -- python3 "$publisher" \
    --database "$DB_PATH" \
    --bundle "$bundle" \
    --apply \
    --release-id "$release_id" \
    --actor "release@jaralingua.local" \
    --backup-path "$backup" \
    --backup-sha256 "$DATABASE_BACKUP_SHA256" \
    --expected-bundle-revision "${plan_values[0]}" \
    --expected-current-version "${plan_values[1]}" \
    >"$BACKUP_DIR/meta/exam-bank-publication.json"
}

verify_persistent_exam_bank() {
  local publisher="$WEB_ROOT/server/french8_exam_publisher.py"
  local bundle="$WEB_ROOT/data/french8-final-exam.local.json"
  local publication="$BACKUP_DIR/meta/exam-bank-publication.json"
  local postflight="$BACKUP_DIR/meta/exam-bank-postflight.json"
  runuser -u www-data -- python3 "$publisher" \
    --database "$DB_PATH" \
    --bundle "$bundle" \
    --dry-run \
    --require-unchanged \
    >"$postflight"

  if [[ "$DATABASE_WAS_PRESENT" -eq 1 ]]; then
    [[ -f "$publication" && ! -L "$publication" ]] \
      || fail "exam-bank publication report is unavailable"
    python3 - "$publication" "$postflight" <<'PY'
import json
import pathlib
import sys

publication = json.loads(pathlib.Path(sys.argv[1]).read_text(encoding="utf-8"))
postflight = json.loads(pathlib.Path(sys.argv[2]).read_text(encoding="utf-8"))
if publication.get("ok") is not True or postflight.get("ok") is not True:
    raise SystemExit("exam-bank report is not successful")
if postflight.get("changed") is not False:
    raise SystemExit("exam-bank postflight still proposes a change")
for field in (
    "stateSha256",
    "storeSha256",
    "storePayloadSha256",
    "storeRevision",
):
    if publication.get(field) != postflight.get(field):
        raise SystemExit("exam-bank postflight mismatch: " + field)
if publication.get("bundleRevisionAfter") != postflight.get("bundleRevisionBefore"):
    raise SystemExit("exam-bank postflight mismatch: bundle revision")
PY
  fi
}

verify_database_backup_sha256() {
  local backup="$BACKUP_DIR/files/database.sqlite3"
  local metadata="$BACKUP_DIR/meta/database.sha256"
  local expected digest_line actual
  [[ -f "$backup" && ! -L "$backup" ]] \
    || { fail "SQLite rollback backup is unavailable"; return 1; }
  [[ -f "$metadata" && ! -L "$metadata" ]] \
    || { fail "SQLite rollback SHA-256 metadata is unavailable"; return 1; }
  IFS= read -r expected <"$metadata" \
    || { fail "SQLite rollback SHA-256 metadata cannot be read"; return 1; }
  [[ "$expected" =~ ^[0-9a-f]{64}$ ]] \
    || { fail "invalid SQLite rollback SHA-256 metadata"; return 1; }
  digest_line="$(sha256sum -- "$backup")" \
    || { fail "SQLite rollback backup cannot be hashed"; return 1; }
  actual="${digest_line%% *}"
  [[ "$actual" == "$expected" ]] \
    || { fail "SQLite rollback backup SHA-256 mismatch"; return 1; }
}

restore_sqlite() {
  local state temp
  state="$(<"$BACKUP_DIR/meta/database.state")"
  if [[ "$state" == "present" ]]; then
    verify_database_backup_sha256 || return 1
    rm -f -- "$DB_PATH-wal" "$DB_PATH-shm" "$DB_PATH-journal"
    temp="$STATE_DIR/.french8-final-exam-rollback-$$.sqlite3"
    PENDING_TEMP_FILES+=("$temp")
    install -o www-data -g www-data -m 0640 -- "$BACKUP_DIR/files/database.sqlite3" "$temp"
    mv -fT -- "$temp" "$DB_PATH"
    validate_sqlite "$DB_PATH" 0
  elif [[ "$state" == "absent" ]]; then
    rm -f -- "$DB_PATH" "$DB_PATH-wal" "$DB_PATH-shm" "$DB_PATH-journal"
  else
    fail "invalid database backup marker"
  fi
}

install_atomic() {
  local source="$1" target="$2" owner_group="$3" mode="$4"
  local owner="${owner_group%%:*}" group="${owner_group##*:}" parent base temp
  parent="$(dirname -- "$target")"
  base="$(basename -- "$target")"
  temp="$parent/.${base}.french8-release-$$"
  PENDING_TEMP_FILES+=("$temp")
  install -o "$owner" -g "$group" -m "$mode" -- "$source" "$temp"
  mv -fT -- "$temp" "$target"
}

rollback_release() {
  local index rollback_failed=0
  log "rolling back files and state from $BACKUP_DIR"
  systemctl stop "$SERVICE_NAME" >/dev/null 2>&1 || rollback_failed=1
  for ((index = 0; index < ${#INSTALL_TARGETS[@]}; index++)); do
    restore_regular_file "${INSTALL_TARGETS[$index]}" "${INSTALL_KEYS[$index]}" || rollback_failed=1
  done
  for ((index = 0; index < ${#LIVE_STATE_TARGETS[@]}; index++)); do
    restore_regular_file "${LIVE_STATE_TARGETS[$index]}" "${LIVE_STATE_KEYS[$index]}" || rollback_failed=1
  done
  restore_sqlite || rollback_failed=1
  if (( CREATED_IMAGE_DIR )); then
    rmdir -- "$WEB_ROOT/frances/Niveau 8/img/examen-final" 2>/dev/null || true
  fi
  if (( CREATED_OVERRIDE_DIR )); then
    rmdir -- "/etc/systemd/system/jaralingua-progress-api.service.d" 2>/dev/null || true
  fi
  systemctl daemon-reload || rollback_failed=1
  systemctl start "$SERVICE_NAME" || rollback_failed=1
  systemctl is-active --quiet "$SERVICE_NAME" || rollback_failed=1
  if (( rollback_failed )); then
    log "CRITICAL: rollback encountered errors; inspect $BACKUP_DIR before further changes" >&2
    return 1
  fi
  log "rollback completed; previous service restored"
}

on_error() {
  local status=$?
  trap - ERR INT TERM
  set +e
  log "release failed with status $status"
  cleanup_pending_files
  if (( DEPLOYMENT_STARTED )); then
    if (( BACKUP_READY && FILES_MUTATED )); then
      rollback_release || true
    else
      systemctl start "$SERVICE_NAME" >/dev/null 2>&1 || true
    fi
  fi
  cleanup_pending_files
  cleanup_known_stage
  exit "$status"
}

on_signal() {
  return 130
}

trap on_error ERR
trap on_signal INT TERM

main() {
  local requested_stage="${1:-}" action="${2:-deploy}" source canonical line relative candidate_line
  local index timestamp release_id health_file health_ok=0

  [[ -n "$requested_stage" ]] || fail "usage: $0 STAGED_DIRECTORY [deploy|cleanup-only]"
  STAGE_DIR="$(readlink -f -- "$requested_stage")"
  assert_safe_stage_path "$STAGE_DIR"

  if [[ "$action" == "cleanup-only" ]]; then
    cleanup_known_stage
    log "staged directory cleaned"
    return 0
  fi
  [[ "$action" == "deploy" ]] || fail "invalid action: $action"
  [[ -d "$STAGE_DIR" && ! -L "$STAGE_DIR" ]] || fail "staged directory is unavailable"

  for command_name in python3 sha256sum install cp mv rm rmdir readlink flock systemctl curl runuser date seq sleep dirname basename; do
    require_command "$command_name"
  done
  [[ "${#INSTALL_TARGETS[@]}" -eq "${#INSTALL_SOURCES[@]}" ]] || fail "install manifest mismatch"
  [[ "${#INSTALL_TARGETS[@]}" -eq "${#INSTALL_KEYS[@]}" ]] || fail "backup manifest mismatch"
  [[ "${#INSTALL_TARGETS[@]}" -eq "${#INSTALL_OWNERS[@]}" ]] || fail "owner manifest mismatch"
  [[ "${#INSTALL_TARGETS[@]}" -eq "${#INSTALL_MODES[@]}" ]] || fail "mode manifest mismatch"

  exec 9>"$LOCK_PATH"
  flock -n 9 || fail "another French 8 release is already running"

  [[ -f "$STAGE_DIR/SHA256SUMS" && ! -L "$STAGE_DIR/SHA256SUMS" ]] || fail "SHA256SUMS is missing"
  mapfile -t manifest_lines <"$STAGE_DIR/SHA256SUMS"
  [[ "${#manifest_lines[@]}" -eq "${#PAYLOAD_FILES[@]}" ]] || fail "unexpected SHA256SUMS entry count"
  for relative in "${PAYLOAD_FILES[@]}"; do
    source="$STAGE_DIR/$relative"
    [[ -f "$source" && ! -L "$source" ]] || fail "payload file missing or unsafe: $relative"
    canonical="$(readlink -f -- "$source")"
    [[ "$canonical" == "$STAGE_DIR/"* ]] || fail "payload escapes staged directory: $relative"
    line=""
    for candidate_line in "${manifest_lines[@]}"; do
      if [[ "${candidate_line:66}" == "./$relative" ]]; then
        line="$candidate_line"
        break
      fi
    done
    [[ -n "$line" && "${line:64:2}" == "  " && "${line:0:64}" =~ ^[0-9a-f]{64}$ ]] \
      || fail "payload is not represented safely in SHA256SUMS: $relative"
  done
  (cd "$STAGE_DIR" && sha256sum --check --strict --status SHA256SUMS) \
    || fail "payload checksum verification failed"

  python3 - \
    "$STAGE_DIR/server/progress_api.py" \
    "$STAGE_DIR/server/final_exam_runtime.py" \
    "$STAGE_DIR/server/final_exam_storage.py" \
    "$STAGE_DIR/server/french8_exam_publisher.py" <<'PY'
import pathlib
import sys

for raw_path in sys.argv[1:]:
    path = pathlib.Path(raw_path)
    compile(path.read_bytes(), str(path), "exec")
PY

  python3 - "$STAGE_DIR/data/french8-final-exam.local.json" <<'PY'
import json
import pathlib
import sys

def unique_pairs(pairs):
    value = {}
    for key, item in pairs:
        if key in value:
            raise ValueError("duplicate JSON key: " + key)
        value[key] = item
    return value

def reject_constant(value):
    raise ValueError("invalid JSON constant: " + value)

path = pathlib.Path(sys.argv[1])
payload = json.loads(
    path.read_text(encoding="utf-8"),
    object_pairs_hook=unique_pairs,
    parse_constant=reject_constant,
)
if not isinstance(payload, dict) or not isinstance(payload.get("exam"), dict):
    raise SystemExit("invalid French 8 exam bundle")
PY

  python3 "$STAGE_DIR/server/french8_exam_publisher.py" \
    --bundle "$STAGE_DIR/data/french8-final-exam.local.json" \
    --validate-only \
    >/dev/null

  [[ -s "$STAGE_DIR/server/private_assets/french8-final-exam-audio.mp3" ]] || fail "exam audio is empty"
  [[ -s "$STAGE_DIR/frances/Niveau 8/img/examen-final/examen-final-niveau8-ville-intelligente-hero-v1.png" ]] \
    || fail "hero image is empty"
  systemctl is-active --quiet "$SERVICE_NAME" || fail "$SERVICE_NAME must be active before release"
  if command -v nginx >/dev/null 2>&1; then
    nginx -t
  fi

  timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
  release_id="${timestamp}-$$"
  BACKUP_DIR="$BACKUP_ROOT/$release_id"
  [[ -d "/var/backups" && ! -L "/var/backups" ]] || fail "/var/backups is unavailable or unsafe"
  if [[ ! -d "/var/backups/jaralingua" ]]; then
    install -d -o root -g root -m 0700 -- "/var/backups/jaralingua"
  fi
  if [[ ! -d "$BACKUP_ROOT" ]]; then
    install -d -o root -g root -m 0700 -- "$BACKUP_ROOT"
  fi
  install -d -o root -g root -m 0700 -- "$BACKUP_DIR/files" "$BACKUP_DIR/meta"
  printf 'release_id=%s\nstaged_dir=%s\ncreated_utc=%s\n' \
    "$release_id" "$STAGE_DIR" "$timestamp" >"$BACKUP_DIR/release.meta"

  log "stopping $SERVICE_NAME for a consistent state snapshot"
  systemctl stop "$SERVICE_NAME"
  DEPLOYMENT_STARTED=1

  for ((index = 0; index < ${#INSTALL_TARGETS[@]}; index++)); do
    backup_regular_file "${INSTALL_TARGETS[$index]}" "${INSTALL_KEYS[$index]}"
  done
  for ((index = 0; index < ${#LIVE_STATE_TARGETS[@]}; index++)); do
    backup_regular_file "${LIVE_STATE_TARGETS[$index]}" "${LIVE_STATE_KEYS[$index]}"
  done
  backup_sqlite
  BACKUP_READY=1

  FILES_MUTATED=1
  if [[ ! -d "$WEB_ROOT/frances/Niveau 8/img/examen-final" ]]; then
    install -d -o www-data -g www-data -m 0755 -- "$WEB_ROOT/frances/Niveau 8/img/examen-final"
    CREATED_IMAGE_DIR=1
  fi
  if [[ ! -d "/etc/systemd/system/jaralingua-progress-api.service.d" ]]; then
    install -d -o root -g root -m 0755 -- "/etc/systemd/system/jaralingua-progress-api.service.d"
    CREATED_OVERRIDE_DIR=1
  fi
  [[ -d "$STATE_DIR" && ! -L "$STATE_DIR" ]] || fail "state directory is unavailable or unsafe"
  runuser -u www-data -- test -w "$STATE_DIR" || fail "www-data cannot write the state directory"

  for ((index = 0; index < ${#INSTALL_TARGETS[@]}; index++)); do
    install_atomic \
      "$STAGE_DIR/${INSTALL_SOURCES[$index]}" \
      "${INSTALL_TARGETS[$index]}" \
      "${INSTALL_OWNERS[$index]}" \
      "${INSTALL_MODES[$index]}"
  done
  install_atomic \
    "$STAGE_DIR/server/private_assets/french8-final-exam-audio.mp3" \
    "$STATE_DIR/french8-final-exam-audio.mp3" \
    "www-data:www-data" \
    "0640"

  if [[ "$DATABASE_WAS_PRESENT" -eq 1 ]]; then
    log "publishing the staged exam bank transactionally"
    publish_persistent_exam_bank
  else
    log "database is new; startup migration will initialize the staged exam bank"
  fi

  systemctl daemon-reload
  if command -v nginx >/dev/null 2>&1; then
    nginx -t
  fi
  systemctl restart "$SERVICE_NAME"
  systemctl is-active --quiet "$SERVICE_NAME"

  health_file="$BACKUP_DIR/health.json"
  for _attempt in $(seq 1 20); do
    if curl --fail --silent --show-error --max-time 5 --output "$health_file" "$HEALTH_URL"; then
      if python3 - "$health_file" <<'PY'
import json
import pathlib
import sys

payload = json.loads(pathlib.Path(sys.argv[1]).read_text(encoding="utf-8"))
if payload.get("ok") is not True:
    raise SystemExit("health payload is not ok")
PY
      then
        health_ok=1
        break
      fi
    fi
    sleep 1
  done
  [[ "$health_ok" -eq 1 ]] || fail "API health smoke test failed"
  [[ -f "$DB_PATH" && ! -L "$DB_PATH" ]] || fail "SQLite database was not initialized"
  validate_sqlite "$DB_PATH" 1
  validate_exam_locked "$DB_PATH"
  verify_persistent_exam_bank

  DEPLOYMENT_STARTED=0
  cleanup_pending_files
  cleanup_known_stage
  log "release succeeded; rollback backup retained at $BACKUP_DIR"
}

main "$@"
