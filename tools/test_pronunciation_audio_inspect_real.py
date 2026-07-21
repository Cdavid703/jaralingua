"""Decode a generated WAV through the real faster-whisper/PyAV audio stack.

This test does not load or run a Whisper model and does not need ffmpeg/ffprobe
executables.  The VPS virtualenv supplies faster-whisper and its PyAV runtime.
Set JARALINGUA_TRANSCRIBER_MODULE when validating a candidate outside the repo.
"""

from __future__ import annotations

from io import BytesIO
import importlib.util
import math
import os
from pathlib import Path
import struct
import sys
import tempfile
import threading
import wave
import json
from urllib.error import HTTPError
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parents[1]
MODULE_PATH = Path(os.environ.get(
    "JARALINGUA_TRANSCRIBER_MODULE",
    str(ROOT / "tools" / "french8_pronunciation_server_local.py"),
))


def generated_wav(seconds: float = 0.4, frequency: float = 440.0, sample_rate: int = 16000) -> bytes:
    output = BytesIO()
    with wave.open(output, "wb") as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(sample_rate)
        frames = (
            struct.pack("<h", round(9000 * math.sin(2 * math.pi * frequency * index / sample_rate)))
            for index in range(round(seconds * sample_rate))
        )
        wav.writeframes(b"".join(frames))
    return output.getvalue()


def main() -> int:
    with tempfile.TemporaryDirectory(prefix="jaralingua-real-decode-") as cache_dir:
        os.environ["WHISPER_CACHE_DIR"] = cache_dir
        os.environ["WHISPER_INTERNAL_TOKEN"] = "real-inspect-test-token"
        spec = importlib.util.spec_from_file_location("jaralingua_real_audio_inspect", MODULE_PATH)
        assert spec and spec.loader
        module = importlib.util.module_from_spec(spec)
        sys.modules[spec.name] = module
        spec.loader.exec_module(module)
        audio = generated_wav()
        result = module.inspect_audio(audio, "audio/wav", 5)
        assert result["decodable"] is True
        assert result["format"] == "wav"
        assert 0.39 <= result["duration_seconds"] <= 0.41, result
        assert result["sample_rate_hz"] == 16000
        assert result["rms"] > 0.05 and result["peak"] > 0.1
        assert result["bytes"] == len(audio)
        assert len(result["sha256"]) == 64
        assert result["likely_silent"] is False
        try:
            module.inspect_audio(generated_wav(seconds=5.3), "audio/wav", 5)
        except ValueError as error:
            assert str(error) == "audio_duration_exceeded"
        else:
            raise AssertionError("bounded decoder accepted audio beyond its duration limit")
        httpd = module.ThreadingHTTPServer(("127.0.0.1", 0), module.PronunciationHandler)
        httpd.daemon_threads = True
        server_thread = threading.Thread(target=httpd.serve_forever, daemon=True)
        server_thread.start()
        endpoint = f"http://127.0.0.1:{httpd.server_address[1]}{module.INTERNAL_INSPECT_PATH}"
        unauthorized_health = Request(endpoint, method="GET")
        try:
            urlopen(unauthorized_health, timeout=3)
        except HTTPError as error:
            assert error.code == 401
            assert json.loads(error.read())["code"] == "invalid_internal_token"
        else:
            raise AssertionError("internal health probe accepted no token")
        authorized_health = Request(endpoint, method="GET", headers={
            "X-Jaralingua-Internal-Token": "real-inspect-test-token",
        })
        with urlopen(authorized_health, timeout=3) as response:
            health_result = json.loads(response.read())
        assert health_result["ok"] is True
        assert health_result["inspector"]["ready"] is True
        assert health_result["inspector"]["scope_validation_configured"] is True
        unauthorized = Request(endpoint, data=audio, method="POST", headers={"Content-Type": "audio/wav"})
        try:
            urlopen(unauthorized, timeout=3)
        except HTTPError as error:
            assert error.code == 401
            assert json.loads(error.read())["code"] == "invalid_internal_token"
        else:
            raise AssertionError("internal token was not enforced")
        authorized = Request(endpoint, data=audio, method="POST", headers={
            "Content-Type": "audio/wav",
            "X-Jaralingua-Internal-Token": "real-inspect-test-token",
        })
        with urlopen(authorized, timeout=3) as response:
            endpoint_result = json.loads(response.read())
        httpd.shutdown()
        httpd.server_close()
        server_thread.join(2)
        assert endpoint_result["ok"] is True
        assert endpoint_result["audio"]["sha256"] == result["sha256"]
        assert endpoint_result["audio"]["duration_seconds"] == result["duration_seconds"]
        print({"ok": True, "audio": result, "endpoint": "loopback+token", "model_loaded": module._model is not None})
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
