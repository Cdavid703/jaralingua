#!/usr/bin/env python3
"""Unit/contract checks for the reversible French 8 release pipeline."""

from __future__ import annotations

import json
import pathlib
import re
import shutil
import subprocess
import sys
import tempfile
import unittest


ROOT = pathlib.Path(__file__).resolve().parents[1]
REMOTE_SCRIPT = ROOT / "deploy" / "french8-final-exam-release.sh"
SERVICE_OVERRIDE = ROOT / "deploy" / "jaralingua-progress-api-french8-final.conf"
LAUNCHER = ROOT / "tools" / "release_french8_final_exam.ps1"


class French8ReleasePipelineContractTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.remote = REMOTE_SCRIPT.read_text(encoding="utf-8")
        cls.override = SERVICE_OVERRIDE.read_text(encoding="utf-8")
        cls.launcher = LAUNCHER.read_text(encoding="utf-8")

    def test_remote_script_has_valid_bash_syntax_when_bash_is_available(self):
        bash = shutil.which("bash")
        if not bash:
            for candidate in (
                pathlib.Path(r"C:\Program Files\Git\bin\bash.exe"),
                pathlib.Path(r"C:\Program Files\Git\usr\bin\bash.exe"),
            ):
                if candidate.is_file():
                    bash = str(candidate)
                    break
        if not bash:
            self.skipTest("bash is unavailable on this host; production preflight runs bash")
        result = subprocess.run(
            [bash, "-n", str(REMOTE_SCRIPT)],
            cwd=ROOT,
            text=True,
            capture_output=True,
            check=False,
        )
        self.assertEqual(result.returncode, 0, result.stderr)

    def test_powershell_launcher_parses_without_syntax_errors(self):
        powershell = shutil.which("powershell") or shutil.which("pwsh")
        if not powershell:
            self.skipTest("PowerShell is unavailable on this host")
        escaped_path = str(LAUNCHER).replace("'", "''")
        command = (
            "$tokens=$null; $errors=$null; "
            f"[System.Management.Automation.Language.Parser]::ParseFile('{escaped_path}',"
            "[ref]$tokens,[ref]$errors) > $null; "
            "if ($errors.Count -ne 0) { $errors | ForEach-Object { Write-Error $_ }; exit 1 }"
        )
        result = subprocess.run(
            [powershell, "-NoLogo", "-NoProfile", "-NonInteractive", "-Command", command],
            cwd=ROOT,
            text=True,
            capture_output=True,
            check=False,
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_remote_release_is_strict_locked_and_checksum_verified(self):
        self.assertTrue(self.remote.startswith("#!/usr/bin/env bash\nset -Eeuo pipefail\n"))
        self.assertIn("umask 027", self.remote)
        self.assertIn("flock -n 9", self.remote)
        self.assertIn("sha256sum --check --strict --status SHA256SUMS", self.remote)
        self.assertIn("/tmp/jaralingua-french8-release-*", self.remote)
        self.assertIn("payload escapes staged directory", self.remote)
        self.assertIn("refusing symlink", self.remote.lower())

    def test_remote_release_backs_up_database_and_rolls_back(self):
        self.assertIn("source_connection.backup(destination_connection)", self.remote)
        self.assertGreaterEqual(self.remote.count("PRAGMA quick_check"), 2)
        self.assertIn("rollback_release", self.remote)
        self.assertIn("trap on_error ERR", self.remote)
        self.assertIn("systemctl stop \"$SERVICE_NAME\"", self.remote)
        self.assertIn("systemctl start \"$SERVICE_NAME\"", self.remote)
        self.assertIn("systemctl is-active --quiet \"$SERVICE_NAME\"", self.remote)
        self.assertIn("mv -fT", self.remote)

    def test_remote_release_publishes_bank_after_verified_backup_and_before_restart(self):
        main = self.remote.split('log "stopping $SERVICE_NAME for a consistent state snapshot"', 1)[1]
        backup_at = main.index("backup_sqlite")
        rollback_armed_at = main.index("FILES_MUTATED=1")
        publish_at = main.index("publish_persistent_exam_bank")
        restart_at = main.index('systemctl restart "$SERVICE_NAME"')
        self.assertLess(backup_at, rollback_armed_at)
        self.assertLess(rollback_armed_at, publish_at)
        self.assertLess(publish_at, restart_at)
        self.assertIn('runuser -u www-data -- python3 "$publisher"', self.remote)
        self.assertIn("--dry-run", self.remote)
        self.assertIn("--require-unchanged", self.remote)
        self.assertIn("--apply", self.remote)
        self.assertIn('--expected-bundle-revision "${plan_values[0]}"', self.remote)
        self.assertIn('--expected-current-version "${plan_values[1]}"', self.remote)
        self.assertIn("--backup-sha256 \"$DATABASE_BACKUP_SHA256\"", self.remote)
        self.assertIn('>"$BACKUP_DIR/meta/exam-bank-publication.json"', self.remote)
        self.assertIn('local postflight="$BACKUP_DIR/meta/exam-bank-postflight.json"', self.remote)
        self.assertIn('>"$postflight"', self.remote)
        self.assertGreater(main.index("verify_persistent_exam_bank"), restart_at)

    def test_postflight_compares_publication_state_store_and_revisions(self):
        marker = 'python3 - "$publication" "$postflight" <<\'PY\'\n'
        comparison = self.remote.split(marker, 1)[1].split("\nPY\n", 1)[0]
        publication = {
            "ok": True,
            "stateSha256": "a" * 64,
            "storeSha256": "b" * 64,
            "storePayloadSha256": "c" * 64,
            "storeRevision": 7,
            "bundleRevisionAfter": 12,
        }
        postflight = {
            "ok": True,
            "changed": False,
            "stateSha256": "a" * 64,
            "storeSha256": "b" * 64,
            "storePayloadSha256": "c" * 64,
            "storeRevision": 7,
            "bundleRevisionBefore": 12,
        }
        with tempfile.TemporaryDirectory() as temporary:
            root = pathlib.Path(temporary)
            publication_path = root / "publication.json"
            postflight_path = root / "postflight.json"

            def run(current_postflight):
                publication_path.write_text(json.dumps(publication), encoding="utf-8")
                postflight_path.write_text(json.dumps(current_postflight), encoding="utf-8")
                return subprocess.run(
                    [sys.executable, "-c", comparison, str(publication_path), str(postflight_path)],
                    text=True,
                    capture_output=True,
                    check=False,
                )

            self.assertEqual(run(postflight).returncode, 0)
            for field in (
                "stateSha256",
                "storeSha256",
                "storePayloadSha256",
                "storeRevision",
                "bundleRevisionBefore",
            ):
                changed = dict(postflight)
                changed[field] = 99 if isinstance(changed[field], int) else "d" * 64
                with self.subTest(field=field):
                    self.assertNotEqual(run(changed).returncode, 0)
            changed = dict(postflight, changed=True)
            self.assertNotEqual(run(changed).returncode, 0)

    def test_rollback_verifies_backup_sha_before_touching_database(self):
        helper = self.remote.split("verify_database_backup_sha256() {", 1)[1].split("\n}", 1)[0]
        for expected in (
            '"$BACKUP_DIR/files/database.sqlite3"',
            '"$BACKUP_DIR/meta/database.sha256"',
            'sha256sum -- "$backup"',
            '[[ "$actual" == "$expected" ]]',
        ):
            self.assertIn(expected, helper)
        restore = self.remote.split("restore_sqlite() {", 1)[1].split("\n}", 1)[0]
        verify_at = restore.index("verify_database_backup_sha256 || return 1")
        remove_at = restore.index('rm -f -- "$DB_PATH-wal"')
        install_at = restore.index("install -o www-data")
        self.assertLess(verify_at, remove_at)
        self.assertLess(verify_at, install_at)

    def test_publisher_is_staged_installed_compiled_and_strictly_validates_bank(self):
        publisher = "server/french8_exam_publisher.py"
        self.assertGreaterEqual(self.remote.count(publisher), 5)
        self.assertGreaterEqual(self.launcher.count(publisher), 2)
        self.assertIn('--validate-only', self.remote)
        self.assertIn('DATABASE_BACKUP_SHA256="${digest_line%% *}"', self.remote)
        self.assertIn("scheduling must remain disabled", self.remote)

    def test_remote_release_validates_all_runtime_layers(self):
        for expected in (
            "compile(path.read_bytes()",
            "object_pairs_hook=unique_pairs",
            "validate_sqlite \"$DB_PATH\" 1",
            "validate_exam_locked \"$DB_PATH\"",
            "nginx -t",
            'HEALTH_URL="http://127.0.0.1:8787/api/health"',
            "payload.get(\"ok\") is not True",
        ):
            self.assertIn(expected, self.remote)

    def test_scripts_avoid_broad_or_irreversible_operations(self):
        combined = self.remote + "\n" + self.launcher
        self.assertNotRegex(self.remote, r"\brm\s+-[A-Za-z]*r[A-Za-z]*\b")
        self.assertNotIn("git reset", combined.lower())
        self.assertNotIn("git push", combined.lower())
        self.assertNotIn("--force-with-lease", combined.lower())
        self.assertNotRegex(combined.lower(), r"(?:password|secret|api[_-]?key)\s*=")

    def test_launcher_has_requested_switches_and_scoped_commit(self):
        self.assertIn("SupportsShouldProcess = $true", self.launcher)
        self.assertIn("[switch]$SkipTests", self.launcher)
        self.assertIn("[switch]$NoCommit", self.launcher)
        self.assertIn("if ($WhatIfPreference)", self.launcher)
        self.assertIn('"commit", "--only"', self.launcher)
        self.assertIn('"add", "--"', self.launcher)
        self.assertNotRegex(self.launcher, r'"add"\s*,\s*"(?:\.|-A|--all)"')
        self.assertIn("No push was performed", self.launcher)
        commit_scope = self.launcher.split("$CommitPaths = @(", 1)[1].split("\n)", 1)[0]
        self.assertNotIn("data/french8-final-exam.local.json", commit_scope)
        self.assertNotIn("server/private_assets/french8-final-exam-audio.mp3", commit_scope)

    def test_launcher_runs_contract_tests_but_no_browser_e2e(self):
        for relative_test in (
            "tools/test_final_exam_runtime.py",
            "tools/test_french_final_exam_backend.py",
            "tools/test_french8_final_exam_storage.py",
            "tools/test_french8_final_exam_backend.py",
            "tools/test_french8_final_exam_content.py",
            "tools/test_french8_exam_publisher.py",
            "tools/test_french8_final_exam_operations.py",
            "tools/test_french8_final_exam_release_pipeline.py",
            "tools/test_french8_final_exam_page.cjs",
        ):
            self.assertIn(relative_test, self.launcher)
        self.assertNotRegex(self.launcher.lower(), r"playwright|selenium|chrom(?:e|ium)|msedge")

    def test_launcher_stages_explicit_files_and_uses_fixed_vps_default(self):
        self.assertIn('root@177.7.52.161', self.launcher)
        self.assertIn("Get-FileHash", self.launcher)
        self.assertIn("SHA256SUMS", self.launcher)
        self.assertIn("Windows checkout may use CRLF", self.launcher)
        self.assertIn("New-Object Text.UTF8Encoding($false)", self.launcher)
        self.assertIn('"-r", $stageRoot, "${SshTarget}:/tmp/"', self.launcher)
        self.assertIn("Invoke-BestEffortRemoteCleanup", self.launcher)
        self.assertIn("Remove-VerifiedLocalStage", self.launcher)
        self.assertNotRegex(self.launcher, r"Copy-Item[^\n]*(?:\\\*|/\*)")

    def test_service_override_has_only_nonsecret_runtime_configuration(self):
        self.assertTrue(self.override.startswith("[Service]\n"))
        for name in (
            "JARALINGUA_FRENCH8_FINAL_EXAM_DATA",
            "JARALINGUA_FRENCH8_FINAL_EXAM_SUBMISSIONS",
            "JARALINGUA_FRENCH8_FINAL_EXAM_AUDIO",
            "JARALINGUA_FRENCH8_FINAL_EXAM_DB",
            "JARALINGUA_FRENCH8_FINAL_EXAM_AUDIO_GRANT_TTL",
            "ReadWritePaths=/var/lib/jaralingua",
        ):
            self.assertIn(name, self.override)
        self.assertNotRegex(self.override.lower(), r"password|secret|token|client[_-]?id|admin")


if __name__ == "__main__":
    unittest.main(verbosity=2)
