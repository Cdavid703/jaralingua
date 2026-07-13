"""Audit French Level 1 Unit 8 Conversation Coach audios with ElevenLabs Scribe."""

from __future__ import annotations

import json
import mimetypes
import os
from pathlib import Path
import re
import sys
import urllib.request
import uuid


ROOT = Path(__file__).resolve().parents[1]
ENV_FILE = ROOT / "elevenlabs.local.env"
OUTPUT_DIR = ROOT / "frances" / "Niveau 1" / "audio" / "pratique-orale" / "unite-8"

EXPECTED = {
    "question-01.mp3": "Qu’est-ce que tu prends au petit déjeuner ?",
    "question-02.mp3": "Qu’est-ce que tu voudrais commander dans un café ?",
    "question-03.mp3": "Tu bois de l’eau, du café ou du thé ?",
    "question-04.mp3": "Qu’est-ce que tu achètes dans une épicerie ?",
    "question-05.mp3": "Dis une phrase avec du, une phrase avec de la et une phrase avec des.",
    "question-06.mp3": "Qu’est-ce que tu ne prends pas ou tu n’achètes pas ?",
    "question-07.mp3": "Pose une question pour demander le prix.",
    "question-08.mp3": "Fais une mini-commande au café en trois phrases.",
}


def load_env() -> None:
    if not ENV_FILE.exists():
        return
    for raw in ENV_FILE.read_text(encoding="utf-8-sig").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip("\"").strip("'"))


def normalize(text: str) -> str:
    text = text.lower()
    text = text.replace("’", "'")
    text = text.replace("-", " ")
    text = re.sub(r"[^\w'\s]", " ", text, flags=re.UNICODE)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def multipart_body(audio: bytes, content_type: str, filename: str) -> tuple[bytes, str]:
    boundary = f"----JaraLinguaAudit{uuid.uuid4().hex}"
    chunks: list[bytes] = []

    def add_field(name: str, value: str) -> None:
        chunks.extend(
            [
                f"--{boundary}\r\n".encode(),
                f'Content-Disposition: form-data; name="{name}"\r\n\r\n'.encode(),
                value.encode("utf-8"),
                b"\r\n",
            ]
        )

    add_field("model_id", "scribe_v2")
    add_field("language_code", "fr")
    add_field("tag_audio_events", "false")
    add_field("diarize", "false")
    add_field("num_speakers", "1")
    chunks.extend(
        [
            f"--{boundary}\r\n".encode(),
            f'Content-Disposition: form-data; name="file"; filename="{filename}"\r\n'.encode(),
            f"Content-Type: {content_type}\r\n\r\n".encode(),
            audio,
            b"\r\n",
            f"--{boundary}--\r\n".encode(),
        ]
    )
    return b"".join(chunks), boundary


def scribe(path: Path, api_key: str) -> str:
    content_type = mimetypes.guess_type(path.name)[0] or "audio/mpeg"
    data, boundary = multipart_body(path.read_bytes(), content_type, path.name)
    request = urllib.request.Request(
        "https://api.elevenlabs.io/v1/speech-to-text",
        data=data,
        method="POST",
        headers={
            "xi-api-key": api_key,
            "Content-Type": f"multipart/form-data; boundary={boundary}",
            "Accept": "application/json",
            "User-Agent": "JaraLingua-STT-Audit/1.0",
        },
    )
    with urllib.request.urlopen(request, timeout=120) as response:
        payload = json.loads(response.read().decode("utf-8"))
    return str(payload.get("text") or "").strip()


def main() -> int:
    load_env()
    api_key = os.environ.get("ELEVENLABS_API_KEY", "").strip()
    if not api_key:
        print("Missing ELEVENLABS_API_KEY", file=sys.stderr)
        return 2
    failures = 0
    for filename, expected in EXPECTED.items():
        audio = OUTPUT_DIR / filename
        if not audio.exists():
            print(f"MISSING {filename}")
            failures += 1
            continue
        transcript = scribe(audio, api_key)
        ok = normalize(expected) == normalize(transcript)
        print(("OK" if ok else "CHECK"), filename)
        print("  expected:", expected)
        print("  scribe:  ", transcript)
        if not ok:
            failures += 1
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
