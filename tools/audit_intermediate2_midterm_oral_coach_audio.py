"""Verify each Intermediate 2 Midterm Oral Coach MP3 against its canonical ElevenLabs script."""

from __future__ import annotations

import json
import os
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
AUDIO_DIR = ROOT / "ingles" / "intermediate-2" / "audio" / "midterm-oral-conversation-coach"
SCRIPT_PATH = AUDIO_DIR / "scripts.md"
ENV_FILE = ROOT / "elevenlabs.local.env"


def load_key() -> str:
    for line in ENV_FILE.read_text(encoding="utf-8").splitlines():
        if line.strip() and not line.lstrip().startswith("#") and "=" in line:
            key, value = line.split("=", 1)
            if key.strip() == "ELEVENLABS_API_KEY":
                return value.strip().strip('"').strip("'")
    return os.environ.get("ELEVENLABS_API_KEY", "").strip()


def expected_items() -> list[tuple[str, str]]:
    lines = SCRIPT_PATH.read_text(encoding="utf-8").splitlines()
    items: list[tuple[str, str]] = []
    for index, line in enumerate(lines):
        match = re.match(r"^###\s+`([^`]+\.mp3)`\s*$", line)
        if not match:
            continue
        text = []
        for cursor in range(index + 1, len(lines)):
            if re.match(r"^###\s+", lines[cursor]):
                break
            if lines[cursor].strip():
                text.append(lines[cursor].strip())
        items.append((match.group(1), " ".join(text)))
    return items


def normalize(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", value.lower()).strip()


def transcribe(audio_path: Path, api_key: str) -> str:
    boundary = "----JaraLinguaIntermediate2MidtermCoach"
    body = (
        f"--{boundary}\r\nContent-Disposition: form-data; name=\"model_id\"\r\n\r\nscribe_v1\r\n"
        f"--{boundary}\r\nContent-Disposition: form-data; name=\"file\"; filename=\"{audio_path.name}\"\r\nContent-Type: audio/mpeg\r\n\r\n"
    ).encode() + audio_path.read_bytes() + f"\r\n--{boundary}--\r\n".encode()
    request = urllib.request.Request(
        "https://api.elevenlabs.io/v1/speech-to-text",
        data=body,
        headers={"xi-api-key": api_key, "Content-Type": f"multipart/form-data; boundary={boundary}"},
        method="POST",
    )
    with urllib.request.urlopen(request, timeout=90) as response:
        return str(json.loads(response.read().decode("utf-8")).get("text") or "")


def main() -> int:
    items = expected_items()
    if len(items) != 15:
        print(f"Expected 15 canonical scripts, found {len(items)}", file=sys.stderr)
        return 2
    api_key = load_key()
    if not api_key:
        print("Missing ELEVENLABS_API_KEY", file=sys.stderr)
        return 2
    failures = 0
    for file_name, expected in items:
        target = AUDIO_DIR / file_name
        if not target.exists() or target.stat().st_size < 10_000:
            print(f"MISSING {file_name}")
            failures += 1
            continue
        try:
            heard = transcribe(target, api_key)
        except urllib.error.HTTPError as error:
            print(f"ERROR {file_name}: HTTP {error.code}")
            failures += 1
            continue
        ok = normalize(heard) == normalize(expected)
        print(("OK" if ok else "FAIL"), file_name)
        if not ok:
            print(f"  expected: {expected}\n  heard: {heard}")
            failures += 1
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
