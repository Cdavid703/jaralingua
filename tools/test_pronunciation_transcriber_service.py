"""Unit and contract tests for the local pronunciation transcriber.

The faster-whisper package and model are replaced before importing the server,
so this suite is deterministic and does not download or execute a real model.
"""

from __future__ import annotations

from collections import deque
import base64
import hashlib
import hmac
import importlib.util
import json
import os
from pathlib import Path
import sys
import tempfile
import threading
import time
from types import ModuleType, SimpleNamespace

import numpy as np


ROOT = Path(__file__).resolve().parents[1]
SERVER_PATH = ROOT / "tools" / "french8_pronunciation_server_local.py"
NGINX_PATH = ROOT / "deploy" / "nginx-pronunciation-location.conf"


def install_fake_whisper() -> None:
    package = ModuleType("faster_whisper")
    audio_module = ModuleType("faster_whisper.audio")

    class FakeWord:
        word = " hello"
        start = 0.0
        end = 0.4
        probability = 0.97

    class FakeSegment:
        text = "hello"
        words = [FakeWord()]

    class FakeWhisperModel:
        def __init__(self, *_args, **_kwargs):
            pass

        def transcribe(self, _decoded, language="en", **_kwargs):
            return iter([FakeSegment()]), SimpleNamespace(language=language, language_probability=0.99)

    def fake_decode_audio(_path, sampling_rate=16000):
        assert sampling_rate == 16000
        return np.tile(np.asarray([0.1, -0.1], dtype=np.float32), 8000)

    package.WhisperModel = FakeWhisperModel
    audio_module.decode_audio = fake_decode_audio
    sys.modules["faster_whisper"] = package
    sys.modules["faster_whisper.audio"] = audio_module


def import_server(cache_dir: str):
    install_fake_whisper()
    os.environ["WHISPER_CACHE_DIR"] = cache_dir
    os.environ["WHISPER_INTERNAL_TOKEN"] = "transcriber-contract-test-secret"
    spec = importlib.util.spec_from_file_location("jaralingua_transcriber_under_test", SERVER_PATH)
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


def wait_for(predicate, timeout=1.0):
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        if predicate():
            return
        time.sleep(0.005)
    raise AssertionError("condition was not reached before timeout")


def test_controlled_wait_and_account_fairness(server) -> None:
    queue = server.FairTranscriptionQueue(capacity=1, max_depth=8)
    first = queue.acquire("account-a", 0.5)
    order = []
    waits = {}

    def worker(identity):
        admission = queue.acquire(identity, 1.0)
        order.append(identity)
        waits[identity] = admission.wait_seconds
        time.sleep(0.015)
        queue.release(admission)

    same_account = threading.Thread(target=worker, args=("account-a",), daemon=True)
    other_account = threading.Thread(target=worker, args=("account-b",), daemon=True)
    same_account.start()
    wait_for(lambda: queue.snapshot()["depth"] == 1)
    other_account.start()
    wait_for(lambda: queue.snapshot()["depth"] == 2)
    time.sleep(0.025)
    assert same_account.is_alive() and other_account.is_alive()  # both are waiting, not rejected
    queue.release(first)
    same_account.join(1)
    other_account.join(1)

    assert not same_account.is_alive() and not other_account.is_alive()
    assert order == ["account-b", "account-a"], order
    assert waits["account-b"] > 0
    snapshot = queue.snapshot()
    assert snapshot["completed"] == 3
    assert snapshot["active"] == 0 and snapshot["depth"] == 0
    assert snapshot["wait_latency"]["samples"] == 3
    assert snapshot["service_latency"]["samples"] == 3


def test_timeout_and_bounded_depth(server) -> None:
    queue = server.FairTranscriptionQueue(capacity=1, max_depth=1)
    first = queue.acquire("holder", 0.5)
    timed_out = []

    def timeout_worker():
        try:
            queue.acquire("waiting", 0.06)
        except server.QueueWaitTimeoutError:
            timed_out.append(True)

    thread = threading.Thread(target=timeout_worker, daemon=True)
    thread.start()
    wait_for(lambda: queue.snapshot()["depth"] == 1)
    try:
        queue.acquire("overflow", 0.5)
    except server.QueueFullError:
        pass
    else:
        raise AssertionError("bounded queue admitted an overflow request")
    thread.join(1)
    queue.release(first)
    assert timed_out == [True]
    snapshot = queue.snapshot()
    assert snapshot["timed_out"] == 1
    assert snapshot["rejected_full"] == 1


def signed_exam_scope(server, attempt_id="attempt-1", student_id="1001", expires_in=600) -> str:
    claims = {
        "aud": "jaralingua-pronunciation-transcriber",
        "purpose": "basic-final-oral",
        "attemptId": attempt_id,
        "studentId": student_id,
        "examVersion": "basic-final-oral-v1",
        "exp": int(time.time()) + expires_in,
    }
    body = base64.urlsafe_b64encode(json.dumps(claims, sort_keys=True, separators=(",", ":")).encode()).rstrip(b"=").decode()
    signature = base64.urlsafe_b64encode(hmac.new(server.INTERNAL_TOKEN.encode(), body.encode(), hashlib.sha256).digest()).rstrip(b"=").decode()
    return body + "." + signature


def test_account_rate_identity_and_exam_scope(server) -> None:
    same_ip = "10.20.30.40"
    first, first_source = server.request_identity({"Authorization": "Bearer " + "a" * 64}, same_ip)
    second, second_source = server.request_identity({"Authorization": "Bearer " + "b" * 64}, same_ip)
    assert first == second
    assert first_source == second_source == "ip"
    anonymous_a, source_a = server.request_identity({}, same_ip)
    anonymous_b, source_b = server.request_identity({}, same_ip)
    assert anonymous_a == anonymous_b and source_a == source_b == "ip"
    assert first == anonymous_a
    rotated_identities = {
        server.request_identity({"Authorization": "Bearer " + str(index) * 64}, same_ip)[0]
        for index in range(1, 101)
    }
    assert rotated_identities == {first}

    scope = signed_exam_scope(server)
    claims = server.validate_exam_scope(scope)
    exam_headers = {
        "Authorization": "Bearer " + "c" * 64,
        "X-Jaralingua-Exam-Scope": scope,
        "X-Jaralingua-Workload": "final-oral",
    }
    assert server.is_final_oral_request("/api/english-basic/pronunciation-assessment", exam_headers)
    assert not server.is_final_oral_request("/api/english-basic/pronunciation-assessment", {"Authorization": exam_headers["Authorization"]})
    assert not server.is_final_oral_request("/api/english-basic/pronunciation-assessment", {"Authorization": exam_headers["Authorization"], "X-Jaralingua-Workload": "final-oral"})
    assert not server.is_final_oral_request("/api/english-intermediate/pronunciation-assessment", exam_headers)
    exam_identity, exam_source = server.request_identity(exam_headers, same_ip, claims)
    assert exam_source == "signed-exam-scope" and exam_identity != first
    try:
        server.validate_exam_scope(scope[:-1] + ("A" if scope[-1] != "A" else "B"))
    except ValueError as error:
        assert str(error) == "invalid_exam_scope"
    else:
        raise AssertionError("tampered exam scope was accepted")
    try:
        server.validate_exam_scope(signed_exam_scope(server, expires_in=-1))
    except ValueError as error:
        assert str(error) == "scope_expired"
    else:
        raise AssertionError("expired exam scope was accepted")

    limiter = server.SlidingWindowRateLimiter()
    assert limiter.allow("exam:" + first, 2, 60)[0]
    assert limiter.allow("exam:" + first, 2, 60)[0]
    allowed, retry_after = limiter.allow("exam:" + first, 2, 60)
    assert not allowed and retry_after > 0
    other_ip_identity, _ = server.request_identity({}, "10.20.30.41")
    assert limiter.allow("exam:" + other_ip_identity, 2, 60)[0]

    bounded = server.SlidingWindowRateLimiter(max_buckets=128)
    for index in range(400):
        assert bounded.allow(f"rotated-token-{index}", 10, 60)[0]
    assert len(bounded._requests) <= 128


def test_priority_reservation_and_attempt_cap(server) -> None:
    queue = server.FairTranscriptionQueue(capacity=1, max_depth=4, reserved_priority_slots=1)
    holder = queue.acquire("practice-holder", 0.5)
    waiting = []

    def wait(identity, priority=False, per_identity=None):
        try:
            admission = queue.acquire(identity, 1.0, priority=priority, max_pending_for_identity=per_identity)
            waiting.append((identity, "granted", admission))
        except Exception as error:  # asserted below
            waiting.append((identity, type(error).__name__, None))

    practice_threads = [threading.Thread(target=wait, args=(f"practice-{index}",), daemon=True) for index in range(3)]
    for thread in practice_threads:
        thread.start()
    wait_for(lambda: queue.snapshot()["depth"] == 3)
    overflow = threading.Thread(target=wait, args=("practice-overflow",), daemon=True)
    overflow.start()
    overflow.join(1)
    assert any(item[:2] == ("practice-overflow", "QueueFullError") for item in waiting)

    official = threading.Thread(target=wait, args=("attempt-a", True, 1), daemon=True)
    official.start()
    wait_for(lambda: queue.snapshot()["depth"] == 4)
    duplicate = threading.Thread(target=wait, args=("attempt-a", True, 1), daemon=True)
    duplicate.start()
    duplicate.join(1)
    assert any(item[:2] == ("attempt-a", "QueueFullError") for item in waiting)
    queue.release(holder)
    official.join(1)
    granted = next(item for item in waiting if item[0] == "attempt-a" and item[1] == "granted")
    queue.release(granted[2])
    released_practice = set()
    for _index in range(3):
        wait_for(lambda: len([item for item in waiting if item[0].startswith("practice-") and item[1] == "granted"]) > len(released_practice))
        next_item = next(
            item for item in waiting
            if item[0].startswith("practice-") and item[1] == "granted" and item[0] not in released_practice
        )
        released_practice.add(next_item[0])
        queue.release(next_item[2])
    for thread in practice_threads:
        thread.join(2)
    assert all(not thread.is_alive() for thread in practice_threads)


def test_audio_inspection_and_mock_transcription(server) -> None:
    audio = b"mock-webm-audio" * 20
    original_decoder = server._decode_audio_bounded
    server._decode_audio_bounded = lambda *_args, **_kwargs: np.tile(
        np.asarray([0.1, -0.1], dtype=np.float32), 8000
    )
    try:
        result = server.inspect_audio(audio, "audio/webm; codecs=opus", 5)
        assert result["decodable"] is True
        assert result["format"] == "webm"
        assert result["duration_seconds"] == 1.0
        assert result["bytes"] == len(audio)
        assert result["sha256"] == hashlib.sha256(audio).hexdigest()
        assert result["rms"] > 0 and result["peak"] > 0
        assert result["likely_silent"] is False

        transcript = server.transcribe_local(audio, ".webm", "en", 5)
        assert transcript["text"] == "hello"
        assert transcript["language_code"] == "en"
        assert transcript["words"][0]["text"] == "hello"
        assert transcript["audio"]["sha256"] == hashlib.sha256(audio).hexdigest()
    finally:
        server._decode_audio_bounded = original_decoder

    try:
        server.content_type_suffix("text/plain")
    except ValueError as error:
        assert str(error) == "unsupported_audio_format"
    else:
        raise AssertionError("unsupported content type was accepted")


def test_health_schema_and_nginx_privacy(server) -> None:
    snapshot = server.FairTranscriptionQueue(1, 3).snapshot()
    expected = {
        "capacity", "active", "depth", "max_depth", "waiting_accounts",
        "completed", "failed", "timed_out", "rejected_full",
        "wait_latency", "service_latency", "uptime_seconds",
    }
    assert expected <= set(snapshot)
    assert {"samples", "last_ms", "average_ms", "p95_ms", "max_ms"} <= set(snapshot["wait_latency"])

    nginx = NGINX_PATH.read_text(encoding="utf-8")
    location_lines = [line.strip() for line in nginx.splitlines() if line.strip().startswith("location")]
    assert all("/internal/pronunciation/audio-inspect" not in line for line in location_lines)
    assert nginx.count("proxy_next_upstream off;") == 3
    assert nginx.count("proxy_read_timeout 180s;") == 3
    assert nginx.count("limit_except GET { deny all; }") == 3

    source = SERVER_PATH.read_text(encoding="utf-8")
    assert "decode_audio(" not in source
    assert "container.decode(audio=0)" in source
    assert "next_total > max_samples" in source


def main() -> int:
    with tempfile.TemporaryDirectory(prefix="jaralingua-transcriber-test-") as cache_dir:
        server = import_server(cache_dir)
        tests = [
            test_controlled_wait_and_account_fairness,
            test_timeout_and_bounded_depth,
            test_account_rate_identity_and_exam_scope,
            test_priority_reservation_and_attempt_cap,
            test_audio_inspection_and_mock_transcription,
            test_health_schema_and_nginx_privacy,
        ]
        for test in tests:
            test(server)
            print(f"PASS {test.__name__}")
    print("Pronunciation transcriber unit/contract tests passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
