"""Audit Basic English Unit 1 Conversation Coach audios with ElevenLabs Scribe."""

from __future__ import annotations

import json
import os
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ENV_FILE = ROOT / "elevenlabs.local.env"
AUDIO_DIR = ROOT / "ingles" / "basico" / "audio" / "oral-practice" / "unit-1"
SCRIPT_PATH = AUDIO_DIR / "scripts.md"


def load_env() -> None:
    if not ENV_FILE.exists():
        return
    for line in ENV_FILE.read_text(encoding="utf-8").splitlines():
        if not line.strip() or line.lstrip().startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip())


def normalize(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", text.lower()).strip()


def expected_items() -> list[tuple[str, str]]:
    content = SCRIPT_PATH.read_text(encoding="utf-8").splitlines()
    items: list[tuple[str, str]] = []
    for index, line in enumerate(content):
        match = re.match(r"^File:\s+`([^`]+)`", line)
        if not match:
            continue
        file_name = match.group(1)
        lines: list[str] = []
        for cursor in range(index + 1, len(content)):
            if content[cursor].startswith("## "):
                break
            if content[cursor].strip():
                lines.append(content[cursor].strip())
        items.append((file_name, " ".join(lines)))
    return items


def scribe(audio_path: Path, api_key: str) -> str:
    boundary = "----JaraLinguaBoundary"
    audio = audio_path.read_bytes()
    body = (
        f"--{boundary}\r\n"
        'Content-Disposition: form-data; name="model_id"\r\n\r\n'
        "scribe_v1\r\n"
        f"--{boundary}\r\n"
        'Content-Disposition: form-data; name="file"; filename="' + audio_path.name + '"\r\n'
        "Content-Type: audio/mpeg\r\n\r\n"
    ).encode("utf-8") + audio + f"\r\n--{boundary}--\r\n".encode("utf-8")
    request = urllib.request.Request(
        "https://api.elevenlabs.io/v1/speech-to-text",
        data=body,
        headers={
            "xi-api-key": api_key,
            "Content-Type": f"multipart/form-data; boundary={boundary}",
        },
        method="POST",
    )
    with urllib.request.urlopen(request, timeout=60) as response:
        payload = json.loads(response.read().decode("utf-8"))
    return str(payload.get("text") or "").strip()


def main() -> int:
    load_env()
    api_key = os.environ.get("ELEVENLABS_API_KEY", "").strip()
    if not api_key or api_key == "put_your_api_key_here":
        print("Missing ELEVENLABS_API_KEY", file=sys.stderr)
        return 2
    failures = 0
    for file_name, expected in expected_items():
        audio_path = AUDIO_DIR / file_name
        if not audio_path.exists():
            print(f"MISSING {file_name}")
            failures += 1
            continue
        try:
            heard = scribe(audio_path, api_key)
        except urllib.error.HTTPError as error:
            print(f"ERROR {file_name}: HTTP {error.code} {error.read().decode('utf-8', 'ignore')}")
            failures += 1
            continue
        ok = normalize(heard) == normalize(expected)
        print(("OK" if ok else "FAIL"), file_name)
        if not ok:
            print(f"  expected: {expected}")
            print(f"  heard:    {heard}")
            failures += 1
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
