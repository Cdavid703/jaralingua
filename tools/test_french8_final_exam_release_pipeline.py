#!/usr/bin/env python3
"""Unit/contract checks for the reversible French 8 release pipeline."""

from __future__ import annotations

import pathlib
import re
import shutil
import subprocess
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
