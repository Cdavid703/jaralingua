"""Serve JaraLingua and assess pronunciation with a local faster-whisper model."""

from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
import sys
import tempfile
import threading
import time
from collections import defaultdict, deque
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

from faster_whisper import WhisperModel
from faster_whisper.audio import decode_audio
import numpy as np


ROOT = Path(__file__).resolve().parents[1]
API_PATH = "/api/french8/pronunciation-assessment"
HEALTH_PATH = "/api/french8/pronunciation-health"
MAX_AUDIO_BYTES = 15 * 1024 * 1024
MAX_DURATION_SECONDS = 90
MAX_CONCURRENT_TRANSCRIPTIONS = 2
RATE_LIMIT_REQUESTS = 12
RATE_LIMIT_WINDOW_SECONDS = 60
MODEL_NAME = os.environ.get("WHISPER_MODEL_SIZE", "base")
MODEL_CACHE = Path(os.environ.get("WHISPER_CACHE_DIR", str(ROOT / ".jaralingua-local" / "whisper")))
MODEL_CACHE.mkdir(parents=True, exist_ok=True)

_model: WhisperModel | None = None
_model_lock = threading.Lock()
_inference_lock = threading.Lock()
_transcription_slots = threading.BoundedSemaphore(MAX_CONCURRENT_TRANSCRIPTIONS)
_rate_lock = threading.Lock()
_rate_requests: dict[str, deque[float]] = defaultdict(deque)


def get_model() -> WhisperModel:
    global _model
    if _model is None:
        with _model_lock:
            if _model is None:
                print(f"Loading local Whisper model '{MODEL_NAME}'...", flush=True)
                _model = WhisperModel(
                    MODEL_NAME,
                    device="cpu",
                    compute_type="int8",
                    cpu_threads=max(1, min(8, os.cpu_count() or 4)),
                    download_root=str(MODEL_CACHE),
                )
                print("Local Whisper model ready.", flush=True)
    return _model


def transcribe_local(audio: bytes, suffix: str = ".webm") -> dict:
    temporary_path: str | None = None
    try:
        with tempfile.NamedTemporaryFile(prefix="jaralingua-pronunciation-", suffix=suffix, delete=False) as temporary:
            temporary.write(audio)
            temporary_path = temporary.name
        decoded_audio = decode_audio(temporary_path, sampling_rate=16000)
        duration_seconds = len(decoded_audio) / 16000
        rms = float(np.sqrt(np.mean(np.square(decoded_audio)))) if len(decoded_audio) else 0.0
        if duration_seconds > MAX_DURATION_SECONDS:
            raise ValueError(f"Recording exceeds {MAX_DURATION_SECONDS} seconds.")
        peak = float(np.max(np.abs(decoded_audio))) if len(decoded_audio) else 0.0
        with _inference_lock:
            segments, info = get_model().transcribe(
                decoded_audio,
                language="fr",
                beam_size=5,
                vad_filter=False,
                no_speech_threshold=0.9,
                log_prob_threshold=-2.0,
                word_timestamps=True,
                condition_on_previous_text=False,
            )
            segment_list = list(segments)
        words = []
        for segment in segment_list:
            for word in segment.words or []:
                words.append({
                    "text": word.word.strip(),
                    "start": word.start,
                    "end": word.end,
                    "probability": word.probability,
                    "type": "word",
                })
        text = " ".join(segment.text.strip() for segment in segment_list if segment.text.strip()).strip()
        return {
            "text": text,
            "language_code": info.language,
            "language_probability": info.language_probability,
            "words": words,
            "provider": "local-whisper",
            "model": MODEL_NAME,
            "audio": {"duration_seconds": round(duration_seconds, 3), "rms": round(rms, 7), "peak": round(peak, 7), "bytes": len(audio)},
        }
    finally:
        if temporary_path:
            try:
                Path(temporary_path).unlink(missing_ok=True)
            except OSError:
                pass


class PronunciationHandler(SimpleHTTPRequestHandler):
    server_version = "JaraLinguaLocalWhisper/1.0"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self) -> None:
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "same-origin")
        self.send_header("Permissions-Policy", "microphone=(self)")
        super().end_headers()

    def rate_limited(self) -> bool:
        client_ip = self.headers.get("X-Real-IP") or self.client_address[0]
        now = time.monotonic()
        with _rate_lock:
            requests = _rate_requests[client_ip]
            while requests and now - requests[0] > RATE_LIMIT_WINDOW_SECONDS:
                requests.popleft()
            if len(requests) >= RATE_LIMIT_REQUESTS:
                return True
            requests.append(now)
        return False

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
            self.send_json(200, {
                "ok": True,
                "provider": "local Whisper",
                "model": MODEL_NAME,
                "model_loaded": _model is not None,
                "external_upload": False,
                "limits": {"max_bytes": MAX_AUDIO_BYTES, "max_duration_seconds": MAX_DURATION_SECONDS, "max_concurrent": MAX_CONCURRENT_TRANSCRIPTIONS, "requests_per_minute": RATE_LIMIT_REQUESTS},
            })
            return
        super().do_GET()

    def do_POST(self) -> None:
        if self.path.split("?", 1)[0] != API_PATH:
            self.send_json(404, {"error": "Route introuvable."})
            return
        if self.rate_limited():
            self.send_json(429, {"error": "Trop de tentatives. Attendez une minute avant de réessayer."})
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
        content_type = self.headers.get("Content-Type", "audio/webm").lower()
        suffix = ".ogg" if "ogg" in content_type else ".mp4" if "mp4" in content_type else ".webm"
        if not _transcription_slots.acquire(blocking=False):
            self.send_json(503, {"error": "Le serveur analyse déjà plusieurs lectures. Réessayez dans quelques secondes."})
            return
        try:
            self.send_json(200, transcribe_local(audio, suffix))
        except ValueError:
            self.send_json(413, {"error": f"La lecture ne doit pas dépasser {MAX_DURATION_SECONDS} secondes."})
        except Exception as error:  # pragma: no cover - safety net for local runtime
            print(f"Local Whisper transcription error: {error}", file=sys.stderr, flush=True)
            self.send_json(500, {"error": "Whisper local n’a pas pu analyser cet enregistrement."})
        finally:
            _transcription_slots.release()


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8020)
    parser.add_argument("--no-warmup", action="store_true", help="Start before loading the Whisper model.")
    args = parser.parse_args()
    if not args.no_warmup:
        get_model()
    server = ThreadingHTTPServer((args.host, args.port), PronunciationHandler)
    server.daemon_threads = True
    print(f"JaraLingua local Whisper server: http://{args.host}:{args.port}", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
