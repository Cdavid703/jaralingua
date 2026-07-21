"""Verify the shared French final-exam preflight clip with ElevenLabs Scribe."""

from __future__ import annotations

import json
import mimetypes
import os
from pathlib import Path
import re
import sys
import unicodedata
import urllib.request
import uuid


ROOT = Path(__file__).resolve().parents[1]
ENV_FILE = ROOT / "elevenlabs.local.env"
AUDIO_PATH = ROOT / "server" / "private_assets" / "french-final-exam-preflight-audio.mp3"
EXPECTED = (
    "Test audio JaraLingua. Si vous entendez cette phrase clairement, "
    "votre appareil est prêt pour l’examen."
)


def load_env() -> None:
    if not ENV_FILE.exists():
        return
    for raw in ENV_FILE.read_text(encoding="utf-8-sig").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


def normalize(value: str) -> str:
    decomposed = unicodedata.normalize("NFKD", value.casefold())
    without_marks = "".join(char for char in decomposed if not unicodedata.combining(char))
    return " ".join(re.findall(r"[a-z0-9]+", without_marks))


def multipart_body(audio: bytes) -> tuple[bytes, str]:
    boundary = f"----JaraLinguaAudit{uuid.uuid4().hex}"
    fields = {
        "model_id": "scribe_v2",
        "language_code": "fr",
        "tag_audio_events": "false",
        "diarize": "false",
        "num_speakers": "1",
    }
    chunks: list[bytes] = []
    for name, value in fields.items():
        chunks.extend([
            f"--{boundary}\r\n".encode(),
            f'Content-Disposition: form-data; name="{name}"\r\n\r\n'.encode(),
            value.encode(),
            b"\r\n",
        ])
    content_type = mimetypes.guess_type(AUDIO_PATH.name)[0] or "audio/mpeg"
    chunks.extend([
        f"--{boundary}\r\n".encode(),
        f'Content-Disposition: form-data; name="file"; filename="{AUDIO_PATH.name}"\r\n'.encode(),
        f"Content-Type: {content_type}\r\n\r\n".encode(),
        audio,
        b"\r\n",
        f"--{boundary}--\r\n".encode(),
    ])
    return b"".join(chunks), boundary


def main() -> int:
    load_env()
    api_key = os.environ.get("ELEVENLABS_API_KEY", "").strip()
    if not api_key:
        print("Missing ELEVENLABS_API_KEY", file=sys.stderr)
        return 2
    if not AUDIO_PATH.is_file() or AUDIO_PATH.stat().st_size < 20_000:
        print("Preflight MP3 missing or unexpectedly small", file=sys.stderr)
        return 1
    body, boundary = multipart_body(AUDIO_PATH.read_bytes())
    request = urllib.request.Request(
        "https://api.elevenlabs.io/v1/speech-to-text",
        data=body,
        method="POST",
        headers={
            "xi-api-key": api_key,
            "Content-Type": f"multipart/form-data; boundary={boundary}",
            "Accept": "application/json",
            "User-Agent": "JaraLingua-STT-Audit/1.0",
        },
    )
    with urllib.request.urlopen(request, timeout=120) as response:
        transcript = str(json.loads(response.read().decode("utf-8")).get("text") or "")
    expected_words = normalize(EXPECTED).split()
    actual_words = normalize(transcript).split()
    missing = [word for word in expected_words if word not in actual_words]
    print("expected:", EXPECTED)
    print("scribe:  ", transcript.strip())
    if missing or len(actual_words) < len(expected_words) - 1:
        print("CHECK missing:", ", ".join(missing), file=sys.stderr)
        return 1
    print("OK preflight audio matches the canonical French script")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
