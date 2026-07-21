"""Serve JaraLingua and assess pronunciation with a local faster-whisper model.

The public pronunciation routes remain backwards compatible.  Work is admitted
through a bounded, account-fair queue so a short CPU spike does not immediately
turn into HTTP 503 responses.  The private audio inspection route intentionally
listens only to loopback callers and never invokes Whisper.
"""

from __future__ import annotations

import argparse
import base64
import binascii
from collections import defaultdict, deque
from dataclasses import dataclass
import hashlib
import hmac
import ipaddress
import json
import math
import os
from pathlib import Path
import re
import sys
import tempfile
import threading
import time
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from typing import Callable

from faster_whisper import WhisperModel
import numpy as np

try:
    import av
except ImportError:  # Fail closed at decode time; unit tests inject a decoder.
    av = None


ROOT = Path(__file__).resolve().parents[1]
API_ROUTES = {
    "/api/french8/pronunciation-assessment": "fr",
    "/api/english-basic/pronunciation-assessment": "en",
    "/api/english-intermediate/pronunciation-assessment": "en",
}
HEALTH_PATHS = {
    "/api/french8/pronunciation-health",
    "/api/english-basic/pronunciation-health",
    "/api/english-intermediate/pronunciation-health",
}
INTERNAL_INSPECT_PATH = "/internal/pronunciation/audio-inspect"


def _env_int(name: str, default: int, minimum: int, maximum: int) -> int:
    raw = os.environ.get(name, "").strip()
    if not raw:
        return default
    try:
        value = int(raw)
    except ValueError:
        print(f"Ignoring invalid {name}={raw!r}; using {default}.", file=sys.stderr, flush=True)
        return default
    return max(minimum, min(maximum, value))


def _env_float(name: str, default: float, minimum: float, maximum: float) -> float:
    raw = os.environ.get(name, "").strip()
    if not raw:
        return default
    try:
        value = float(raw)
    except ValueError:
        print(f"Ignoring invalid {name}={raw!r}; using {default}.", file=sys.stderr, flush=True)
        return default
    return max(minimum, min(maximum, value))


MAX_AUDIO_BYTES = _env_int("WHISPER_MAX_AUDIO_BYTES", 15 * 1024 * 1024, 128 * 1024, 50 * 1024 * 1024)
MAX_DURATION_SECONDS = _env_int("WHISPER_MAX_DURATION_SECONDS", 90, 5, 600)
MAX_CONCURRENT_TRANSCRIPTIONS = _env_int("WHISPER_MAX_CONCURRENT_TRANSCRIPTIONS", 1, 1, 8)
MAX_QUEUE_DEPTH = _env_int("WHISPER_MAX_QUEUE_DEPTH", 24, 1, 200)
QUEUE_WAIT_SECONDS = _env_float("WHISPER_QUEUE_WAIT_SECONDS", 20.0, 1.0, 300.0)
RATE_LIMIT_REQUESTS = _env_int("WHISPER_RATE_LIMIT_REQUESTS", 12, 1, 300)
RATE_LIMIT_WINDOW_SECONDS = _env_int("WHISPER_RATE_LIMIT_WINDOW_SECONDS", 60, 5, 3600)
ANONYMOUS_IP_RATE_LIMIT_REQUESTS = _env_int("WHISPER_ANONYMOUS_IP_RATE_LIMIT_REQUESTS", 120, 1, 1000)
EXAM_IP_RATE_LIMIT_REQUESTS = _env_int("WHISPER_EXAM_IP_RATE_LIMIT_REQUESTS", 240, 20, 2000)
RATE_LIMIT_MAX_BUCKETS = _env_int("WHISPER_RATE_LIMIT_MAX_BUCKETS", 2048, 128, 16384)
EXAM_RESERVED_QUEUE_SLOTS = _env_int("WHISPER_EXAM_RESERVED_QUEUE_SLOTS", 4, 0, MAX_QUEUE_DEPTH)
EXAM_MAX_PENDING_PER_ATTEMPT = _env_int("WHISPER_EXAM_MAX_PENDING_PER_ATTEMPT", 2, 1, 8)

# The final oral has seven turns and therefore receives an independent account
# bucket and a longer queue wait, but a tighter per-recording envelope.
EXAM_MAX_AUDIO_BYTES = _env_int("WHISPER_EXAM_MAX_AUDIO_BYTES", 12 * 1024 * 1024, 128 * 1024, 50 * 1024 * 1024)
EXAM_MAX_DURATION_SECONDS = _env_int("WHISPER_EXAM_MAX_DURATION_SECONDS", 75, 5, 300)
EXAM_QUEUE_WAIT_SECONDS = _env_float("WHISPER_EXAM_QUEUE_WAIT_SECONDS", 24.0, 1.0, 300.0)
EXAM_RATE_LIMIT_REQUESTS = _env_int("WHISPER_EXAM_RATE_LIMIT_REQUESTS", 14, 1, 100)
EXAM_RATE_LIMIT_WINDOW_SECONDS = _env_int("WHISPER_EXAM_RATE_LIMIT_WINDOW_SECONDS", 180, 10, 3600)

MIN_AUDIO_BYTES = _env_int("WHISPER_MIN_AUDIO_BYTES", 100, 1, 64 * 1024)
CLIENT_READ_TIMEOUT_SECONDS = _env_float("WHISPER_CLIENT_READ_TIMEOUT_SECONDS", 30.0, 2.0, 120.0)
INSPECT_MAX_AUDIO_BYTES = _env_int("WHISPER_INSPECT_MAX_AUDIO_BYTES", 10 * 1024 * 1024, 128 * 1024, 50 * 1024 * 1024)
INSPECT_MAX_DURATION_SECONDS = _env_int("WHISPER_INSPECT_MAX_DURATION_SECONDS", 45, 5, 900)
INSPECT_MAX_CONCURRENT = _env_int("WHISPER_INSPECT_MAX_CONCURRENT", 2, 1, 8)
INSPECT_MAX_QUEUE_DEPTH = _env_int("WHISPER_INSPECT_MAX_QUEUE_DEPTH", 24, 1, 100)
INSPECT_QUEUE_WAIT_SECONDS = _env_float("WHISPER_INSPECT_QUEUE_WAIT_SECONDS", 2.0, 0.1, 30.0)
INTERNAL_TOKEN = os.environ.get("WHISPER_INTERNAL_TOKEN", "").strip()

MODEL_NAME = os.environ.get("WHISPER_MODEL_SIZE", "base")
MODEL_CACHE = Path(os.environ.get("WHISPER_CACHE_DIR", str(ROOT / ".jaralingua-local" / "whisper")))
MODEL_CACHE.mkdir(parents=True, exist_ok=True)


@dataclass(frozen=True)
class RoutePolicy:
    name: str
    max_bytes: int
    max_duration_seconds: int
    queue_wait_seconds: float
    rate_requests: int
    rate_window_seconds: int


PRACTICE_POLICY = RoutePolicy(
    "practice",
    MAX_AUDIO_BYTES,
    MAX_DURATION_SECONDS,
    QUEUE_WAIT_SECONDS,
    RATE_LIMIT_REQUESTS,
    RATE_LIMIT_WINDOW_SECONDS,
)
EXAM_POLICY = RoutePolicy(
    "final-oral",
    EXAM_MAX_AUDIO_BYTES,
    EXAM_MAX_DURATION_SECONDS,
    EXAM_QUEUE_WAIT_SECONDS,
    EXAM_RATE_LIMIT_REQUESTS,
    EXAM_RATE_LIMIT_WINDOW_SECONDS,
)


class QueueFullError(RuntimeError):
    """Raised when the bounded queue cannot safely admit another request."""


class QueueWaitTimeoutError(TimeoutError):
    """Raised after a request waited its configured admission interval."""


@dataclass
class _Ticket:
    identity: str
    enqueued_at: float
    priority: bool = False
    granted: bool = False


@dataclass(frozen=True)
class Admission:
    identity: str
    wait_seconds: float
    admitted_at: float


class FairTranscriptionQueue:
    """A bounded FIFO queue with round-robin service across account identities."""

    def __init__(
        self,
        capacity: int,
        max_depth: int,
        clock: Callable[[], float] = time.monotonic,
        reserved_priority_slots: int = 0,
    ):
        self.capacity = max(1, int(capacity))
        self.max_depth = max(1, int(max_depth))
        self.reserved_priority_slots = max(0, min(self.max_depth, int(reserved_priority_slots)))
        self._clock = clock
        self._condition = threading.Condition()
        self._waiting: dict[str, deque[_Ticket]] = defaultdict(deque)
        self._rotation: deque[str] = deque()
        self._active = 0
        self._active_by_identity: dict[str, int] = defaultdict(int)
        self._depth = 0
        self._last_granted = ""
        self._started_at = clock()
        self._wait_samples: deque[float] = deque(maxlen=512)
        self._service_samples: deque[float] = deque(maxlen=512)
        self._completed = 0
        self._failed = 0
        self._timed_out = 0
        self._rejected_full = 0

    def _remove_ticket(self, ticket: _Ticket) -> None:
        queue = self._waiting.get(ticket.identity)
        if not queue:
            return
        try:
            queue.remove(ticket)
            self._depth -= 1
        except ValueError:
            return
        if not queue:
            self._waiting.pop(ticket.identity, None)
            self._rotation = deque(value for value in self._rotation if value != ticket.identity)

    def _next_identity(self) -> str | None:
        while self._rotation and not self._waiting.get(self._rotation[0]):
            self._rotation.popleft()
        if not self._rotation:
            return None
        # A few queue positions are reserved for a cryptographically verified
        # official attempt.  Serve those tickets first so anonymous practice
        # traffic cannot make an exam answer expire behind a full class queue.
        for index, identity in enumerate(self._rotation):
            queue = self._waiting.get(identity)
            if queue and queue[0].priority:
                self._rotation.rotate(-index)
                return self._rotation.popleft()
        # If another account is waiting, avoid serving the same account twice in
        # succession. This is the fairness property that protects shared classes.
        if len(self._rotation) > 1 and self._rotation[0] == self._last_granted:
            self._rotation.rotate(-1)
        return self._rotation.popleft()

    def _grant_available(self) -> None:
        while self._active < self.capacity and self._depth:
            identity = self._next_identity()
            if identity is None:
                break
            queue = self._waiting[identity]
            ticket = queue.popleft()
            self._depth -= 1
            if queue:
                self._rotation.append(identity)
            else:
                self._waiting.pop(identity, None)
            ticket.granted = True
            self._active += 1
            self._active_by_identity[identity] += 1
            self._last_granted = identity
            wait = max(0.0, self._clock() - ticket.enqueued_at)
            self._wait_samples.append(wait)
        self._condition.notify_all()

    def acquire(
        self,
        identity: str,
        timeout_seconds: float,
        *,
        priority: bool = False,
        max_pending_for_identity: int | None = None,
    ) -> Admission:
        identity = identity or "anonymous"
        timeout_seconds = max(0.01, float(timeout_seconds))
        with self._condition:
            if self._depth >= self.max_depth:
                self._rejected_full += 1
                raise QueueFullError("transcription queue is full")
            normal_limit = self.max_depth - self.reserved_priority_slots
            if not priority and self._depth >= normal_limit:
                self._rejected_full += 1
                raise QueueFullError("transcription queue reserved for official attempts")
            if max_pending_for_identity is not None and (
                len(self._waiting.get(identity, ())) + self._active_by_identity.get(identity, 0)
            ) >= max(1, int(max_pending_for_identity)):
                self._rejected_full += 1
                raise QueueFullError("too many queued requests for this identity")
            ticket = _Ticket(identity=identity, enqueued_at=self._clock(), priority=bool(priority))
            if not self._waiting[identity]:
                self._rotation.append(identity)
            self._waiting[identity].append(ticket)
            self._depth += 1
            self._grant_available()
            deadline = ticket.enqueued_at + timeout_seconds
            while not ticket.granted:
                remaining = deadline - self._clock()
                if remaining <= 0:
                    self._remove_ticket(ticket)
                    self._timed_out += 1
                    self._grant_available()
                    raise QueueWaitTimeoutError("transcription queue wait expired")
                self._condition.wait(remaining)
            now = self._clock()
            return Admission(identity=identity, wait_seconds=max(0.0, now - ticket.enqueued_at), admitted_at=now)

    def release(self, admission: Admission, *, succeeded: bool = True) -> None:
        with self._condition:
            self._active = max(0, self._active - 1)
            self._active_by_identity[admission.identity] = max(0, self._active_by_identity.get(admission.identity, 0) - 1)
            if not self._active_by_identity[admission.identity]:
                self._active_by_identity.pop(admission.identity, None)
            self._service_samples.append(max(0.0, self._clock() - admission.admitted_at))
            if succeeded:
                self._completed += 1
            else:
                self._failed += 1
            self._grant_available()

    @staticmethod
    def _latencies(samples: deque[float]) -> dict:
        values = sorted(samples)
        if not values:
            return {"samples": 0, "last_ms": 0, "average_ms": 0, "p95_ms": 0, "max_ms": 0}
        p95_index = min(len(values) - 1, max(0, math.ceil(len(values) * 0.95) - 1))
        return {
            "samples": len(values),
            "last_ms": round(samples[-1] * 1000),
            "average_ms": round(sum(values) * 1000 / len(values)),
            "p95_ms": round(values[p95_index] * 1000),
            "max_ms": round(values[-1] * 1000),
        }

    def snapshot(self) -> dict:
        with self._condition:
            return {
                "capacity": self.capacity,
                "active": self._active,
                "depth": self._depth,
                "max_depth": self.max_depth,
                "reserved_priority_slots": self.reserved_priority_slots,
                "waiting_accounts": len(self._waiting),
                "completed": self._completed,
                "failed": self._failed,
                "timed_out": self._timed_out,
                "rejected_full": self._rejected_full,
                "wait_latency": self._latencies(self._wait_samples),
                "service_latency": self._latencies(self._service_samples),
                "uptime_seconds": round(max(0.0, self._clock() - self._started_at), 1),
            }


class SlidingWindowRateLimiter:
    """Bounded sliding-window buckets for trusted scopes and source IPs."""

    def __init__(self, clock: Callable[[], float] = time.monotonic, max_buckets: int = RATE_LIMIT_MAX_BUCKETS):
        self._clock = clock
        self._max_buckets = max(128, int(max_buckets))
        self._lock = threading.Lock()
        self._requests: dict[str, deque[float]] = defaultdict(deque)

    def _bound_buckets(self, now: float, incoming_key: str) -> None:
        if incoming_key in self._requests or len(self._requests) < self._max_buckets:
            return
        stale = [key for key, values in self._requests.items() if not values or now - values[-1] >= 3600]
        for key in stale:
            self._requests.pop(key, None)
        if len(self._requests) < self._max_buckets:
            return
        # Deterministically evict the oldest idle bucket.  The dictionary can
        # therefore never grow without bound even under rotating fake tokens.
        oldest = min(self._requests, key=lambda key: self._requests[key][-1] if self._requests[key] else float("-inf"))
        self._requests.pop(oldest, None)

    def allow(self, key: str, limit: int, window_seconds: int) -> tuple[bool, int]:
        now = self._clock()
        bucket_key = f"{window_seconds}:{limit}:{key}"
        with self._lock:
            self._bound_buckets(now, bucket_key)
            requests = self._requests[bucket_key]
            while requests and now - requests[0] >= window_seconds:
                requests.popleft()
            if len(requests) >= limit:
                retry_after = max(1, math.ceil(window_seconds - (now - requests[0])))
                return False, retry_after
            requests.append(now)
            return True, 0

    def reset(self) -> None:
        with self._lock:
            self._requests.clear()


_model: WhisperModel | None = None
_model_lock = threading.Lock()
_transcription_queue = FairTranscriptionQueue(
    MAX_CONCURRENT_TRANSCRIPTIONS,
    MAX_QUEUE_DEPTH,
    reserved_priority_slots=EXAM_RESERVED_QUEUE_SLOTS,
)
_inspection_queue = FairTranscriptionQueue(INSPECT_MAX_CONCURRENT, INSPECT_MAX_QUEUE_DEPTH)
_rate_limiter = SlidingWindowRateLimiter()


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
                    num_workers=MAX_CONCURRENT_TRANSCRIPTIONS,
                    download_root=str(MODEL_CACHE),
                )
                print("Local Whisper model ready.", flush=True)
    return _model


CONTENT_TYPE_SUFFIXES = {
    "audio/webm": ".webm",
    "video/webm": ".webm",
    "audio/ogg": ".ogg",
    "application/ogg": ".ogg",
    "audio/mp4": ".mp4",
    "video/mp4": ".mp4",
    "audio/m4a": ".m4a",
    "audio/x-m4a": ".m4a",
    "audio/mpeg": ".mp3",
    "audio/mp3": ".mp3",
    "audio/aac": ".aac",
    "audio/x-aac": ".aac",
    "audio/wav": ".wav",
    "audio/x-wav": ".wav",
    "application/octet-stream": ".webm",
}


def content_type_suffix(content_type: str) -> tuple[str, str]:
    normalized = str(content_type or "audio/webm").split(";", 1)[0].strip().lower()
    suffix = CONTENT_TYPE_SUFFIXES.get(normalized)
    if suffix is None:
        raise ValueError("unsupported_audio_format")
    return normalized, suffix


def detect_audio_format(audio: bytes, fallback_suffix: str) -> str:
    """Identify common containers from their signature, with a safe fallback."""
    prefix = audio[:16]
    if prefix.startswith(b"RIFF") and audio[8:12] == b"WAVE":
        return "wav"
    if prefix.startswith(b"OggS"):
        return "ogg"
    if prefix.startswith(b"\x1a\x45\xdf\xa3"):
        return "webm"
    if prefix.startswith(b"ID3") or (len(prefix) >= 2 and prefix[0] == 0xFF and prefix[1] & 0xE0 == 0xE0):
        return "mp3"
    if len(audio) >= 12 and audio[4:8] == b"ftyp":
        return "mp4"
    return fallback_suffix.lstrip(".")


def _decode_audio_bounded(path: str, sampling_rate: int, max_duration_seconds: int) -> np.ndarray:
    """Decode incrementally and stop before compressed audio can exhaust memory."""
    if av is None:
        raise RuntimeError("audio_decoder_unavailable")

    max_samples = max(1, int(math.ceil(max_duration_seconds * sampling_rate)))
    total_samples = 0
    chunks: list[np.ndarray] = []
    resampler = av.audio.resampler.AudioResampler(format="s16", layout="mono", rate=sampling_rate)

    def append_frame(frame) -> None:
        nonlocal total_samples
        samples = np.asarray(frame.to_ndarray()).reshape(-1)
        next_total = total_samples + int(samples.size)
        if next_total > max_samples:
            raise ValueError("audio_duration_exceeded")
        if samples.size:
            chunks.append(samples.astype(np.int16, copy=False))
            total_samples = next_total

    try:
        with av.open(path, mode="r", metadata_errors="ignore") as container:
            audio_streams = [stream for stream in container.streams if stream.type == "audio"]
            if not audio_streams:
                raise ValueError("audio_stream_missing")
            stream = audio_streams[0]

            declared_durations = []
            if container.duration is not None:
                declared_durations.append(float(container.duration) / float(av.time_base))
            if stream.duration is not None and stream.time_base is not None:
                declared_durations.append(float(stream.duration * stream.time_base))
            if any(duration > max_duration_seconds + 0.1 for duration in declared_durations):
                raise ValueError("audio_duration_exceeded")

            for frame in container.decode(audio=0):
                for resampled in resampler.resample(frame) or ():
                    append_frame(resampled)
            for resampled in resampler.resample(None) or ():
                append_frame(resampled)
    except (RuntimeError, ValueError):
        raise
    except Exception as error:
        raise ValueError("audio_decode_failed") from error
    finally:
        del resampler

    if not chunks:
        return np.asarray([], dtype=np.float32)
    pcm = np.concatenate(chunks)
    return pcm.astype(np.float32) / 32768.0


def _decode_with_metrics(audio: bytes, suffix: str, max_duration_seconds: int) -> tuple[np.ndarray, dict]:
    temporary_path: str | None = None
    try:
        with tempfile.NamedTemporaryFile(prefix="jaralingua-audio-", suffix=suffix, delete=False) as temporary:
            temporary.write(audio)
            temporary_path = temporary.name
        decoded_audio = _decode_audio_bounded(temporary_path, sampling_rate=16000, max_duration_seconds=max_duration_seconds)
        decoded_audio = np.asarray(decoded_audio, dtype=np.float32)
        if decoded_audio.size and not np.all(np.isfinite(decoded_audio)):
            raise ValueError("invalid_audio_samples")
        duration_seconds = len(decoded_audio) / 16000
        if duration_seconds > max_duration_seconds:
            raise ValueError("audio_duration_exceeded")
        rms = float(np.sqrt(np.mean(np.square(decoded_audio, dtype=np.float64)))) if len(decoded_audio) else 0.0
        peak = float(np.max(np.abs(decoded_audio))) if len(decoded_audio) else 0.0
        metrics = {
            "decodable": True,
            "format": detect_audio_format(audio, suffix),
            "duration_seconds": round(duration_seconds, 3),
            "sample_rate_hz": 16000,
            "rms": round(rms, 7),
            "peak": round(peak, 7),
            "bytes": len(audio),
            "sha256": hashlib.sha256(audio).hexdigest(),
            "likely_silent": rms < 0.0008 or peak < 0.002,
        }
        return decoded_audio, metrics
    finally:
        if temporary_path:
            try:
                Path(temporary_path).unlink(missing_ok=True)
            except OSError:
                pass


def inspect_audio(audio: bytes, content_type: str = "audio/webm", max_duration_seconds: int = INSPECT_MAX_DURATION_SECONDS) -> dict:
    normalized_type, suffix = content_type_suffix(content_type)
    _, metrics = _decode_with_metrics(audio, suffix, max_duration_seconds)
    metrics["content_type"] = normalized_type
    return metrics


def transcribe_local(
    audio: bytes,
    suffix: str = ".webm",
    language: str = "fr",
    max_duration_seconds: int = MAX_DURATION_SECONDS,
) -> dict:
    decoded_audio, audio_metrics = _decode_with_metrics(audio, suffix, max_duration_seconds)
    segments, info = get_model().transcribe(
        decoded_audio,
        language=language,
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
        "audio": audio_metrics,
    }


def _hash_identity(kind: str, value: str) -> str:
    digest = hashlib.sha256(value.strip().encode("utf-8", errors="ignore")).hexdigest()[:24]
    return f"{kind}:{digest}"


def _b64url_decode(value: str) -> bytes:
    raw = str(value or "").strip()
    if not raw or len(raw) > 4096 or not re.fullmatch(r"[A-Za-z0-9_-]+", raw):
        raise ValueError("invalid_exam_scope")
    try:
        decoded = base64.urlsafe_b64decode(raw + "=" * (-len(raw) % 4))
    except (ValueError, binascii.Error) as error:
        raise ValueError("invalid_exam_scope") from error
    canonical = base64.urlsafe_b64encode(decoded).decode("ascii").rstrip("=")
    if not hmac.compare_digest(raw, canonical):
        raise ValueError("invalid_exam_scope")
    return decoded


def validate_exam_scope(token: str, now: float | None = None) -> dict:
    """Validate the short-lived HMAC scope issued by the progress API."""

    if not INTERNAL_TOKEN:
        raise ValueError("exam_scope_not_configured")
    raw = str(token or "").strip()
    if not raw or len(raw) > 4096 or raw.count(".") != 1:
        raise ValueError("missing_exam_scope" if not raw else "invalid_exam_scope")
    body, supplied_signature = raw.split(".", 1)
    expected = hmac.new(INTERNAL_TOKEN.encode("utf-8"), body.encode("ascii", errors="ignore"), hashlib.sha256).digest()
    supplied = _b64url_decode(supplied_signature)
    if not hmac.compare_digest(expected, supplied):
        raise ValueError("invalid_exam_scope")
    try:
        claims = json.loads(_b64url_decode(body).decode("utf-8"))
    except (UnicodeError, json.JSONDecodeError, ValueError) as error:
        raise ValueError("invalid_exam_scope") from error
    if not isinstance(claims, dict):
        raise ValueError("invalid_exam_scope")
    if claims.get("aud") != "jaralingua-pronunciation-transcriber" or claims.get("purpose") != "basic-final-oral":
        raise ValueError("invalid_exam_scope")
    attempt_id = str(claims.get("attemptId") or "").strip()
    student_id = str(claims.get("studentId") or "").strip()
    exam_version = str(claims.get("examVersion") or "").strip()
    if not attempt_id or len(attempt_id) > 120 or not student_id or len(student_id) > 40 or not exam_version or len(exam_version) > 80:
        raise ValueError("invalid_exam_scope")
    try:
        expires_at = int(claims.get("exp"))
    except (TypeError, ValueError) as error:
        raise ValueError("invalid_exam_scope") from error
    current = int(time.time() if now is None else now)
    if expires_at <= current:
        raise ValueError("scope_expired")
    # Do not accept scopes with implausibly long lifetimes if an issuing service
    # is misconfigured or compromised.  The normal lifetime is ten minutes.
    if expires_at > current + 15 * 60:
        raise ValueError("invalid_exam_scope")
    return claims


def request_identity(headers, client_ip: str, exam_claims: dict | None = None) -> tuple[str, str]:
    if isinstance(exam_claims, dict):
        return _hash_identity("attempt", str(exam_claims.get("attemptId") or "")), "signed-exam-scope"
    # Public identity headers and Bearer values are not verified by this small
    # service.  Treat all non-exam traffic as one source-IP identity so rotating
    # fake values cannot manufacture queue fairness or rate buckets.
    return _hash_identity("ip", client_ip or "unknown"), "ip"


def is_final_oral_request(path: str, headers) -> bool:
    if path != "/api/english-basic/pronunciation-assessment":
        return False
    token = str(headers.get("X-Jaralingua-Exam-Scope", "")).strip()
    if not token:
        return False
    try:
        validate_exam_scope(token)
        return True
    except ValueError:
        return False


def _is_loopback(address: str) -> bool:
    try:
        return ipaddress.ip_address(address).is_loopback
    except ValueError:
        return False


class PronunciationHandler(SimpleHTTPRequestHandler):
    server_version = "JaraLinguaLocalWhisper/2.0"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def setup(self) -> None:
        super().setup()
        self.connection.settimeout(CLIENT_READ_TIMEOUT_SECONDS)

    def end_headers(self) -> None:
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "same-origin")
        self.send_header("Permissions-Policy", "microphone=(self)")
        super().end_headers()

    def send_json(self, status: int, payload: dict, extra_headers: dict[str, str] | None = None) -> None:
        data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        if extra_headers:
            for name, value in extra_headers.items():
                self.send_header(name, str(value))
        self.end_headers()
        try:
            self.wfile.write(data)
        except (BrokenPipeError, ConnectionResetError, TimeoutError):
            # The analysis may finish after a mobile client disconnects.  The
            # worker is still released by the surrounding finally block.
            pass

    def _read_body(self, max_bytes: int) -> bytes | None:
        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            length = 0
        if length < MIN_AUDIO_BYTES:
            self.send_json(400, {"error": "The recording is empty or too short.", "code": "audio_too_short"})
            return None
        if length > max_bytes:
            self.send_json(413, {"error": "The recording exceeds the allowed size.", "code": "audio_too_large", "maxBytes": max_bytes})
            return None
        try:
            audio = self.rfile.read(length)
        except (OSError, TimeoutError):
            self.send_json(408, {"error": "The recording upload timed out.", "code": "upload_timeout"})
            return None
        if len(audio) != length:
            self.send_json(400, {"error": "The recording upload was incomplete.", "code": "incomplete_upload"})
            return None
        return audio

    def _health_payload(self) -> dict:
        return {
            "ok": True,
            "provider": "local Whisper",
            "model": {
                "name": MODEL_NAME,
                "loaded": _model is not None,
                "device": "cpu",
                "compute_type": "int8",
                "workers": MAX_CONCURRENT_TRANSCRIPTIONS,
            },
            "model_loaded": _model is not None,
            "external_upload": False,
            "queue": _transcription_queue.snapshot(),
            "inspection_queue": _inspection_queue.snapshot(),
            "security": {
                "exam_scope_required": True,
                "exam_scope_configured": bool(INTERNAL_TOKEN),
                "rate_limit_max_buckets": RATE_LIMIT_MAX_BUCKETS,
            },
            "limits": {
                "max_bytes": PRACTICE_POLICY.max_bytes,
                "max_duration_seconds": PRACTICE_POLICY.max_duration_seconds,
                "max_concurrent": MAX_CONCURRENT_TRANSCRIPTIONS,
                "requests_per_minute": PRACTICE_POLICY.rate_requests,
            },
            "policies": {
                "practice": {
                    "max_bytes": PRACTICE_POLICY.max_bytes,
                    "max_duration_seconds": PRACTICE_POLICY.max_duration_seconds,
                    "queue_wait_seconds": PRACTICE_POLICY.queue_wait_seconds,
                    "rate_requests": PRACTICE_POLICY.rate_requests,
                    "rate_window_seconds": PRACTICE_POLICY.rate_window_seconds,
                    "source_ip_rate_requests": ANONYMOUS_IP_RATE_LIMIT_REQUESTS,
                },
                "final_oral": {
                    "max_bytes": EXAM_POLICY.max_bytes,
                    "max_duration_seconds": EXAM_POLICY.max_duration_seconds,
                    "queue_wait_seconds": EXAM_POLICY.queue_wait_seconds,
                    "rate_requests": EXAM_POLICY.rate_requests,
                    "rate_window_seconds": EXAM_POLICY.rate_window_seconds,
                    "source_ip_rate_requests": EXAM_IP_RATE_LIMIT_REQUESTS,
                    "scope_required": True,
                    "scope_configured": bool(INTERNAL_TOKEN),
                    "reserved_queue_slots": EXAM_RESERVED_QUEUE_SLOTS,
                    "max_pending_per_attempt": EXAM_MAX_PENDING_PER_ATTEMPT,
                },
            },
        }

    def do_GET(self) -> None:
        request_path = self.path.split("?", 1)[0]
        if request_path in HEALTH_PATHS:
            self.send_json(200, self._health_payload())
            return
        if request_path == INTERNAL_INSPECT_PATH:
            if not self._authorize_internal():
                return
            self.send_json(200, {
                "ok": True,
                "inspector": {
                    "ready": True,
                    "decoder": "faster-whisper-pyav",
                    "scope_validation_configured": bool(INTERNAL_TOKEN),
                    "max_bytes": INSPECT_MAX_AUDIO_BYTES,
                    "max_duration_seconds": INSPECT_MAX_DURATION_SECONDS,
                },
            }, {"Allow": "GET, POST"})
            return
        super().do_GET()

    def _authorize_internal(self) -> bool:
        if not _is_loopback(self.client_address[0]):
            self.send_json(403, {"error": "Local access only.", "code": "local_only"})
            return False
        supplied_token = str(self.headers.get("X-Jaralingua-Internal-Token", ""))
        if INTERNAL_TOKEN and not hmac.compare_digest(supplied_token, INTERNAL_TOKEN):
            self.send_json(401, {"error": "Invalid internal token.", "code": "invalid_internal_token"})
            return False
        return True

    def _handle_internal_inspect(self) -> None:
        if not self._authorize_internal():
            return
        admission: Admission | None = None
        succeeded = False
        try:
            admission = _inspection_queue.acquire("internal-progress-api", INSPECT_QUEUE_WAIT_SECONDS)
            # Admission precedes body materialization, bounding memory when a
            # full class uploads recordings at the same time.
            audio = self._read_body(INSPECT_MAX_AUDIO_BYTES)
            if audio is None:
                return
            result = inspect_audio(audio, self.headers.get("Content-Type", "audio/webm"), INSPECT_MAX_DURATION_SECONDS)
            succeeded = True
            self.send_json(200, {"ok": True, "audio": result})
        except QueueFullError:
            self.send_json(503, {"error": "The audio verifier is busy.", "code": "inspection_queue_full", "retryAfter": 2}, {"Retry-After": "2"})
        except QueueWaitTimeoutError:
            self.send_json(503, {"error": "The audio verifier is still busy.", "code": "inspection_queue_timeout", "retryAfter": 2}, {"Retry-After": "2"})
        except ValueError as error:
            code = str(error)
            status = 415 if code == "unsupported_audio_format" else 413 if code == "audio_duration_exceeded" else 422
            self.send_json(status, {"error": "The audio could not be inspected.", "code": code})
        except Exception as error:  # pragma: no cover - decoder/ffmpeg safety net
            print(f"Audio inspection error: {error}", file=sys.stderr, flush=True)
            self.send_json(422, {"error": "The audio could not be decoded.", "code": "audio_not_decodable"})
        finally:
            if admission is not None:
                _inspection_queue.release(admission, succeeded=succeeded)

    def do_POST(self) -> None:
        request_path = self.path.split("?", 1)[0]
        if request_path == INTERNAL_INSPECT_PATH:
            self._handle_internal_inspect()
            return
        language = API_ROUTES.get(request_path)
        if language is None:
            self.send_json(404, {"error": "Route introuvable.", "code": "route_not_found"})
            return

        client_ip = str(self.headers.get("X-Real-IP") or self.client_address[0] or "unknown").strip()
        try:
            client_ip = str(ipaddress.ip_address(client_ip))
        except ValueError:
            client_ip = str(self.client_address[0] or "unknown")
        scope_token = str(self.headers.get("X-Jaralingua-Exam-Scope", "")).strip()
        exam_claims = None
        if scope_token:
            if request_path != "/api/english-basic/pronunciation-assessment":
                self.send_json(403, {"error": "The exam scope is not valid for this route.", "code": "invalid_exam_scope"})
                return
            try:
                exam_claims = validate_exam_scope(scope_token)
            except ValueError as error:
                code = str(error) or "invalid_exam_scope"
                self.send_json(401, {
                    "error": "The official exam authorization expired. Refresh the exam and retry the same saved recording." if code == "scope_expired" else "The official exam authorization is invalid.",
                    "code": code,
                })
                return
        exam_request = exam_claims is not None
        policy = EXAM_POLICY if exam_request else PRACTICE_POLICY
        messages = ({
            "rate": "Too many attempts for this account. Wait and try again.",
            "empty": "The recording is empty or too short.",
            "large": "The recording exceeds the allowed size.",
            "busy": "The transcription queue is full. Try again shortly.",
            "wait": "The recording waited for analysis but the queue did not clear in time. Try again.",
            "duration": f"The recording cannot exceed {policy.max_duration_seconds} seconds.",
            "format": "This audio format is not supported.",
            "failed": "Local Whisper could not analyze this recording.",
        } if language == "en" else {
            "rate": "Trop de tentatives pour ce compte. Patientez avant de réessayer.",
            "empty": "L’enregistrement est vide ou trop court.",
            "large": "L’enregistrement dépasse la taille autorisée.",
            "busy": "La file de transcription est pleine. Réessayez bientôt.",
            "wait": "L’enregistrement a attendu, mais la file ne s’est pas libérée à temps. Réessayez.",
            "duration": f"La lecture ne doit pas dépasser {policy.max_duration_seconds} secondes.",
            "format": "Ce format audio n’est pas pris en charge.",
            "failed": "Whisper local n’a pas pu analyser cet enregistrement.",
        })

        identity, identity_source = request_identity(self.headers, client_ip, exam_claims)
        ip_identity = _hash_identity("ip", client_ip)
        ip_limit = EXAM_IP_RATE_LIMIT_REQUESTS if exam_request else ANONYMOUS_IP_RATE_LIMIT_REQUESTS
        allowed, retry_after = _rate_limiter.allow(
            f"{policy.name}:source:{ip_identity}",
            ip_limit,
            policy.rate_window_seconds,
        )
        if not allowed:
            self.send_json(429, {"error": messages["rate"], "code": "rate_limited", "retryAfter": retry_after}, {"Retry-After": str(retry_after)})
            return
        if exam_request:
            allowed, retry_after = _rate_limiter.allow(
                f"{policy.name}:attempt:{identity}",
                policy.rate_requests,
                policy.rate_window_seconds,
            )
            if not allowed:
                self.send_json(429, {"error": messages["rate"], "code": "rate_limited", "retryAfter": retry_after}, {"Retry-After": str(retry_after)})
                return

        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            length = 0
        if length < MIN_AUDIO_BYTES:
            self.send_json(400, {"error": messages["empty"], "code": "audio_too_short"})
            return
        if length > policy.max_bytes:
            self.send_json(413, {"error": messages["large"], "code": "audio_too_large", "maxBytes": policy.max_bytes})
            return
        try:
            _, suffix = content_type_suffix(self.headers.get("Content-Type", "audio/webm"))
        except ValueError:
            self.send_json(415, {"error": messages["format"], "code": "unsupported_audio_format"})
            return
        admission: Admission | None = None
        succeeded = False
        try:
            admission = _transcription_queue.acquire(
                f"{policy.name}:{identity}",
                policy.queue_wait_seconds,
                priority=exam_request,
                max_pending_for_identity=EXAM_MAX_PENDING_PER_ATTEMPT if exam_request else None,
            )
            # Nginx buffers the request body before proxying it.  Waiting for an
            # admission before materializing the bytes here prevents a full queue
            # from retaining up to max_depth * max_audio_bytes in Python memory.
            audio = self._read_body(policy.max_bytes)
            if audio is None:
                return
            result = transcribe_local(audio, suffix, language, policy.max_duration_seconds)
            result["request"] = {
                "workload": policy.name,
                "queue_wait_ms": round(admission.wait_seconds * 1000),
                "identity_source": identity_source,
            }
            succeeded = True
            self.send_json(200, result, {
                "X-Jaralingua-Queue-Wait-Ms": str(round(admission.wait_seconds * 1000)),
                "X-Jaralingua-Workload": policy.name,
            })
        except QueueFullError:
            self.send_json(503, {"error": messages["busy"], "code": "queue_full", "retryAfter": 5}, {"Retry-After": "5"})
        except QueueWaitTimeoutError:
            self.send_json(503, {"error": messages["wait"], "code": "queue_timeout", "retryAfter": 5}, {"Retry-After": "5"})
        except ValueError as error:
            code = str(error)
            if code == "audio_duration_exceeded":
                self.send_json(413, {"error": messages["duration"], "code": code, "maxDurationSeconds": policy.max_duration_seconds})
            else:
                self.send_json(422, {"error": messages["failed"], "code": code or "audio_not_decodable"})
        except Exception as error:  # pragma: no cover - safety net for local runtime
            print(f"Local Whisper transcription error: {error}", file=sys.stderr, flush=True)
            self.send_json(500, {"error": messages["failed"], "code": "transcription_failed"})
        finally:
            if admission is not None:
                _transcription_queue.release(admission, succeeded=succeeded)


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
    print(
        f"JaraLingua local Whisper server: http://{args.host}:{args.port} "
        f"(capacity={MAX_CONCURRENT_TRANSCRIPTIONS}, queue={MAX_QUEUE_DEPTH})",
        flush=True,
    )
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
