"""Audit Daniel Carter's Final Oral Task audio with ElevenLabs Scribe."""

from __future__ import annotations

import difflib
import json
import os
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
ENV_FILE = ROOT / "elevenlabs.local.env"
AUDIO_DIR = ROOT / "ingles" / "basico" / "audio" / "final-oral-task-real"
PROTECTED_PROMPT_DIR = ROOT / "server" / "private_assets" / "basic-final-oral-prompts"
SCRIPT_PATH = AUDIO_DIR / "scripts.md"


def load_env() -> None:
    if not ENV_FILE.exists():
        return
    for line in ENV_FILE.read_text(encoding="utf-8").splitlines():
        if not line.strip() or line.lstrip().startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


def normalize(text: str) -> str:
    replacements = {"&": " and ", "0.75": " zero point seventy five ", "1x": " one x "}
    value = text.lower()
    for source, target in replacements.items():
        value = value.replace(source, target)
    number_words = {
        "0": "zero", "1": "one", "2": "two", "3": "three", "4": "four", "5": "five",
        "6": "six", "7": "seven", "8": "eight", "9": "nine", "10": "ten", "11": "eleven", "12": "twelve",
    }
    value = re.sub(r"\b(?:1[0-2]|[0-9])\b", lambda match: number_words[match.group(0)], value)
    return re.sub(r"[^a-z0-9]+", " ", value).strip()


def expected_items() -> list[tuple[str, str]]:
    content = SCRIPT_PATH.read_text(encoding="utf-8").splitlines()
    items: list[tuple[str, str]] = []
    for index, line in enumerate(content):
        match = re.match(r"^###\s+`([^`]+\.mp3)`\s*$", line)
        if not match:
            continue
        lines: list[str] = []
        for cursor in range(index + 1, len(content)):
            if re.match(r"^#{2,3}\s+", content[cursor]):
                break
            if content[cursor].strip():
                lines.append(content[cursor].strip())
        items.append((match.group(1), " ".join(lines)))
    return items


def scribe(audio_path: Path, api_key: str) -> str:
    boundary = "----JaraLinguaDanielAudioAudit"
    audio = audio_path.read_bytes()
    body = (
        f"--{boundary}\r\n"
        'Content-Disposition: form-data; name="model_id"\r\n\r\n'
        "scribe_v1\r\n"
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="file"; filename="{audio_path.name}"\r\n'
        "Content-Type: audio/mpeg\r\n\r\n"
    ).encode("utf-8") + audio + f"\r\n--{boundary}--\r\n".encode("utf-8")
    request = urllib.request.Request(
        "https://api.elevenlabs.io/v1/speech-to-text",
        data=body,
        headers={"xi-api-key": api_key, "Content-Type": f"multipart/form-data; boundary={boundary}"},
        method="POST",
    )
    with urllib.request.urlopen(request, timeout=90) as response:
        payload = json.loads(response.read().decode("utf-8"))
    return str(payload.get("text") or "").strip()


def main() -> int:
    items = expected_items()
    if len(items) != 57:
        print(f"Expected 57 scripts, found {len(items)}", file=sys.stderr)
        return 2
    load_env()
    api_key = os.environ.get("ELEVENLABS_API_KEY", "").strip()
    if not api_key or api_key in {"put_your_api_key_here", "TU_API_KEY_AQUI"}:
        print("Missing ELEVENLABS_API_KEY", file=sys.stderr)
        return 2
    failures = 0
    for file_name, expected in items:
        protected_prompt = bool(re.match(r"^unit-[1-6]-[abc]\.mp3$", file_name)) or file_name == "interaction-a.mp3"
        audio_path = (PROTECTED_PROMPT_DIR if protected_prompt else AUDIO_DIR) / file_name
        if not audio_path.exists() or audio_path.stat().st_size < 1_000:
            print(f"MISSING {file_name}")
            failures += 1
            continue
        try:
            heard = scribe(audio_path, api_key)
        except urllib.error.HTTPError as error:
            detail = error.read().decode("utf-8", "ignore")
            print(f"ERROR {file_name}: HTTP {error.code} {detail}")
            failures += 1
            continue
        expected_normalized = normalize(expected)
        heard_normalized = normalize(heard)
        ratio = difflib.SequenceMatcher(None, expected_normalized, heard_normalized).ratio()
        ok = expected_normalized == heard_normalized or ratio >= 0.94
        print(("OK" if ok else "FAIL"), file_name, f"similarity={ratio:.3f}")
        if not ok:
            print(f"  expected: {expected}")
            print(f"  heard:    {heard}")
            failures += 1
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
