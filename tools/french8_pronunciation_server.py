"""Serve JaraLingua locally and proxy pronunciation audio to ElevenLabs Scribe."""

from __future__ import annotations

import argparse
import json
import mimetypes
import os
from pathlib import Path
import sys
import urllib.error
import urllib.request
import uuid
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


ROOT = Path(__file__).resolve().parents[1]
ENV_FILE = ROOT / "elevenlabs.local.env"
API_PATH = "/api/french8/pronunciation-assessment"
HEALTH_PATH = "/api/french8/pronunciation-health"
MAX_AUDIO_BYTES = 15 * 1024 * 1024


def load_local_env() -> None:
    if not ENV_FILE.exists():
        return
    for raw_line in ENV_FILE.read_text(encoding="utf-8-sig").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


def multipart_body(audio: bytes, content_type: str) -> tuple[bytes, str]:
    boundary = f"----JaraLingua{uuid.uuid4().hex}"
    chunks: list[bytes] = []

    def add_field(name: str, value: str) -> None:
        chunks.extend([
            f"--{boundary}\r\n".encode(),
            f'Content-Disposition: form-data; name="{name}"\r\n\r\n'.encode(),
            value.encode("utf-8"),
            b"\r\n",
        ])

    add_field("model_id", "scribe_v2")
    add_field("language_code", "fr")
    add_field("tag_audio_events", "false")
    add_field("diarize", "false")
    add_field("num_speakers", "1")
    add_field("timestamps_granularity", "word")
    chunks.extend([
        f"--{boundary}\r\n".encode(),
        b'Content-Disposition: form-data; name="file"; filename="lecture-francais.webm"\r\n',
        f"Content-Type: {content_type}\r\n\r\n".encode(),
        audio,
        b"\r\n",
        f"--{boundary}--\r\n".encode(),
    ])
    return b"".join(chunks), boundary


def transcribe(audio: bytes, content_type: str, api_key: str) -> dict:
    body, boundary = multipart_body(audio, content_type)
    request = urllib.request.Request(
        "https://api.elevenlabs.io/v1/speech-to-text",
        data=body,
        method="POST",
        headers={
            "xi-api-key": api_key,
            "Content-Type": f"multipart/form-data; boundary={boundary}",
            "Accept": "application/json",
            "User-Agent": "JaraLingua-Pronunciation/1.0",
        },
    )
    with urllib.request.urlopen(request, timeout=120) as response:
        payload = json.loads(response.read().decode("utf-8"))
    return {
        "text": payload.get("text", ""),
        "language_code": payload.get("language_code"),
        "language_probability": payload.get("language_probability"),
        "words": payload.get("words", []),
    }


class PronunciationHandler(SimpleHTTPRequestHandler):
    server_version = "JaraLinguaPronunciation/1.0"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def send_json(self, status: int, payload: dict) -> None:
        data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self) -> None:
        if self.path.split("?", 1)[0] == HEALTH_PATH:
            self.send_json(200, {"ok": True, "provider": "ElevenLabs Scribe", "configured": bool(os.environ.get("ELEVENLABS_API_KEY"))})
            return
        super().do_GET()

    def do_POST(self) -> None:
        if self.path.split("?", 1)[0] != API_PATH:
            self.send_json(404, {"error": "Route introuvable."})
            return
        api_key = os.environ.get("ELEVENLABS_API_KEY", "").strip()
        if not api_key:
            self.send_json(503, {"error": "La clé ElevenLabs n’est pas configurée sur le serveur."})
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            length = 0
        if length < 100:
            self.send_json(400, {"error": "L’enregistrement est vide ou trop court."})
            return
        if length > MAX_AUDIO_BYTES:
            self.send_json(413, {"error": "L’enregistrement dépasse la taille autorisée."})
            return
        audio = self.rfile.read(length)
        content_type = self.headers.get("Content-Type", "audio/webm").split(";", 1)[0]
        if not content_type.startswith("audio/"):
            content_type = mimetypes.guess_type("lecture.webm")[0] or "audio/webm"
        try:
            result = transcribe(audio, content_type, api_key)
            self.send_json(200, result)
        except urllib.error.HTTPError as error:
            detail = error.read().decode("utf-8", errors="replace")
            try:
                message = json.loads(detail).get("detail", {}).get("message") or json.loads(detail).get("detail")
            except (json.JSONDecodeError, AttributeError):
                message = None
            self.send_json(502, {"error": str(message or f"ElevenLabs a répondu avec l’erreur {error.code}.")})
        except (urllib.error.URLError, TimeoutError):
            self.send_json(504, {"error": "ElevenLabs ne répond pas pour le moment. Réessayez."})
        except Exception as error:  # pragma: no cover - final safety net for local server
            print(f"Pronunciation server error: {error}", file=sys.stderr)
            self.send_json(500, {"error": "Erreur interne pendant la transcription."})


def main() -> int:
    load_local_env()
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8020)
    args = parser.parse_args()
    server = ThreadingHTTPServer((args.host, args.port), PronunciationHandler)
    print(f"JaraLingua pronunciation server: http://{args.host}:{args.port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
