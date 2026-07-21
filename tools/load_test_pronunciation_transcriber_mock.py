"""Small concurrent load test for the pronunciation HTTP queue using a mock model."""

from __future__ import annotations

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
from types import ModuleType
from urllib.error import HTTPError
from urllib.request import Request, urlopen

import numpy as np


ROOT = Path(__file__).resolve().parents[1]


def import_server(cache_dir: str):
    package = ModuleType("faster_whisper")
    audio_module = ModuleType("faster_whisper.audio")
    package.WhisperModel = object
    audio_module.decode_audio = lambda *_args, **_kwargs: np.asarray([0.1, -0.1], dtype=np.float32)
    sys.modules["faster_whisper"] = package
    sys.modules["faster_whisper.audio"] = audio_module
    os.environ["WHISPER_CACHE_DIR"] = cache_dir
    os.environ["WHISPER_INTERNAL_TOKEN"] = "transcriber-load-test-secret"
    spec = importlib.util.spec_from_file_location(
        "jaralingua_transcriber_load_test", ROOT / "tools" / "french8_pronunciation_server_local.py"
    )
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


def main() -> int:
    with tempfile.TemporaryDirectory(prefix="jaralingua-transcriber-load-") as cache_dir:
        server_module = import_server(cache_dir)
        server_module._transcription_queue = server_module.FairTranscriptionQueue(capacity=1, max_depth=20)
        server_module._rate_limiter = server_module.SlidingWindowRateLimiter()
        active = 0
        maximum_active = 0
        guard = threading.Lock()

        def mock_transcribe(audio, suffix, language, max_duration_seconds):
            nonlocal active, maximum_active
            assert audio and suffix == ".webm" and language == "en" and max_duration_seconds > 0
            with guard:
                active += 1
                maximum_active = max(maximum_active, active)
            time.sleep(0.04)
            with guard:
                active -= 1
            return {"text": "mock transcript", "audio": {"bytes": len(audio)}, "provider": "mock-whisper"}

        server_module.transcribe_local = mock_transcribe
        httpd = server_module.ThreadingHTTPServer(("127.0.0.1", 0), server_module.PronunciationHandler)
        httpd.daemon_threads = True
        server_thread = threading.Thread(target=httpd.serve_forever, daemon=True)
        server_thread.start()
        endpoint = f"http://127.0.0.1:{httpd.server_address[1]}/api/english-basic/pronunciation-assessment"
        invalid_scope_request = Request(endpoint, data=b"invalid-scope-audio" * 20, method="POST", headers={
            "Content-Type": "audio/webm",
            "X-Jaralingua-Exam-Scope": "forged.scope",
            "X-Jaralingua-Workload": "final-oral",
        })
        try:
            urlopen(invalid_scope_request, timeout=3)
        except HTTPError as error:
            assert error.code == 401
            assert json.loads(error.read())["code"] == "invalid_exam_scope"
        else:
            raise AssertionError("forged final-oral scope was accepted")
        client_count = 20
        barrier = threading.Barrier(client_count + 1)
        results = []
        result_lock = threading.Lock()

        def client(number):
            payload = (f"recording-{number}-".encode("ascii") * 20)[:240]
            claims = {
                "aud": "jaralingua-pronunciation-transcriber",
                "purpose": "basic-final-oral",
                "attemptId": f"load-attempt-{number}",
                "studentId": f"student-{number}",
                "examVersion": "basic-final-oral-v1",
                "exp": int(time.time()) + 600,
            }
            body = base64.urlsafe_b64encode(json.dumps(claims, sort_keys=True, separators=(",", ":")).encode()).rstrip(b"=").decode()
            signature = base64.urlsafe_b64encode(hmac.new(server_module.INTERNAL_TOKEN.encode(), body.encode(), hashlib.sha256).digest()).rstrip(b"=").decode()
            request = Request(endpoint, data=payload, method="POST", headers={
                "Content-Type": "audio/webm",
                "Authorization": "Bearer " + str(number) * 64,
                "X-Jaralingua-Exam-Scope": body + "." + signature,
                "X-Jaralingua-Workload": "final-oral",
            })
            barrier.wait()
            try:
                with urlopen(request, timeout=5) as response:
                    body = json.loads(response.read())
                    result = (response.status, body)
            except HTTPError as error:
                result = (error.code, json.loads(error.read()))
            with result_lock:
                results.append(result)

        clients = [threading.Thread(target=client, args=(number,), daemon=True) for number in range(1, client_count + 1)]
        for client_thread in clients:
            client_thread.start()
        started = time.monotonic()
        barrier.wait()
        for client_thread in clients:
            client_thread.join(8)
        elapsed = time.monotonic() - started

        server_module._inspection_queue = server_module.FairTranscriptionQueue(capacity=2, max_depth=20)
        inspection_active = 0
        maximum_inspection_active = 0

        def mock_inspect(audio, content_type, max_duration_seconds):
            nonlocal inspection_active, maximum_inspection_active
            assert audio and content_type == "audio/webm" and max_duration_seconds > 0
            with guard:
                inspection_active += 1
                maximum_inspection_active = max(maximum_inspection_active, inspection_active)
            time.sleep(0.04)
            with guard:
                inspection_active -= 1
            return {"decodable": True, "bytes": len(audio), "duration_seconds": 1.0}

        server_module.inspect_audio = mock_inspect
        inspect_endpoint = f"http://127.0.0.1:{httpd.server_address[1]}{server_module.INTERNAL_INSPECT_PATH}"
        inspect_barrier = threading.Barrier(client_count + 1)
        inspect_results = []

        def inspect_client(number):
            request = Request(inspect_endpoint, data=(b"inspect-audio" * 20), method="POST", headers={
                "Content-Type": "audio/webm",
                "X-Jaralingua-Internal-Token": server_module.INTERNAL_TOKEN,
            })
            inspect_barrier.wait()
            try:
                with urlopen(request, timeout=5) as response:
                    result = (response.status, json.loads(response.read()))
            except HTTPError as error:
                result = (error.code, json.loads(error.read()))
            with result_lock:
                inspect_results.append(result)

        inspect_clients = [
            threading.Thread(target=inspect_client, args=(number,), daemon=True)
            for number in range(1, client_count + 1)
        ]
        for client_thread in inspect_clients:
            client_thread.start()
        inspect_barrier.wait()
        for client_thread in inspect_clients:
            client_thread.join(8)

        health_endpoint = f"http://127.0.0.1:{httpd.server_address[1]}/api/english-basic/pronunciation-health"
        with urlopen(health_endpoint, timeout=3) as response:
            health = json.loads(response.read())
        httpd.shutdown()
        httpd.server_close()
        server_thread.join(2)

        assert len(results) == client_count, results
        assert all(status == 200 for status, _body in results), results
        assert all(body["request"]["workload"] == "final-oral" for _status, body in results)
        assert maximum_active == 1
        assert health["ok"] is True and health["model"]["name"] == server_module.MODEL_NAME
        assert health["model_loaded"] is False
        assert {"practice", "final_oral"} <= set(health["policies"])
        metrics = health["queue"]
        assert metrics["completed"] == client_count and metrics["failed"] == 0
        assert metrics["depth"] == 0 and metrics["active"] == 0
        assert metrics["wait_latency"]["p95_ms"] > 0
        assert elapsed >= 0.65  # confirms serialized admission rather than accidental parallel bypass
        assert len(inspect_results) == client_count, inspect_results
        assert all(status == 200 and body["ok"] is True for status, body in inspect_results), inspect_results
        assert maximum_inspection_active == 2
        inspect_metrics = health["inspection_queue"]
        assert inspect_metrics["completed"] == client_count and inspect_metrics["failed"] == 0
        assert inspect_metrics["depth"] == 0 and inspect_metrics["active"] == 0
        print(json.dumps({
            "ok": True,
            "requests": len(results),
            "elapsed_seconds": round(elapsed, 3),
            "maximum_mock_inference_concurrency": maximum_active,
            "maximum_mock_inspection_concurrency": maximum_inspection_active,
            "queue": metrics,
            "inspection_queue": inspect_metrics,
        }, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
