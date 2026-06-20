const fs = require("fs");
const path = require("path");

const serverPath = path.join(__dirname, "french8_pronunciation_server_local.py");
let source = fs.readFileSync(serverPath, "utf8");

source = source.replace("import tempfile\nimport threading", "import tempfile\nimport threading\nimport time\nfrom collections import defaultdict, deque");
source = source.replace(
  "MAX_AUDIO_BYTES = 15 * 1024 * 1024",
  "MAX_AUDIO_BYTES = 15 * 1024 * 1024\nMAX_DURATION_SECONDS = 90\nMAX_CONCURRENT_TRANSCRIPTIONS = 2\nRATE_LIMIT_REQUESTS = 12\nRATE_LIMIT_WINDOW_SECONDS = 60"
);
source = source.replace(
  "_inference_lock = threading.Lock()",
  "_inference_lock = threading.Lock()\n_transcription_slots = threading.BoundedSemaphore(MAX_CONCURRENT_TRANSCRIPTIONS)\n_rate_lock = threading.Lock()\n_rate_requests: dict[str, deque[float]] = defaultdict(deque)"
);
source = source.replace(
  "        rms = float(np.sqrt(np.mean(np.square(decoded_audio)))) if len(decoded_audio) else 0.0\n        peak",
  "        rms = float(np.sqrt(np.mean(np.square(decoded_audio)))) if len(decoded_audio) else 0.0\n        if duration_seconds > MAX_DURATION_SECONDS:\n            raise ValueError(f\"Recording exceeds {MAX_DURATION_SECONDS} seconds.\")\n        peak"
);
source = source.replace(
  "    def send_json(self, status: int, payload: dict) -> None:",
  `    def end_headers(self) -> None:
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

    def send_json(self, status: int, payload: dict) -> None:`
);
source = source.replace(
  '                "external_upload": False,',
  '                "external_upload": False,\n                "limits": {"max_bytes": MAX_AUDIO_BYTES, "max_duration_seconds": MAX_DURATION_SECONDS, "max_concurrent": MAX_CONCURRENT_TRANSCRIPTIONS, "requests_per_minute": RATE_LIMIT_REQUESTS},'
);
source = source.replace(
  "        try:\n            length = int(self.headers.get(\"Content-Length\", \"0\"))",
  "        if self.rate_limited():\n            self.send_json(429, {\"error\": \"Trop de tentatives. Attendez une minute avant de réessayer.\"})\n            return\n        try:\n            length = int(self.headers.get(\"Content-Length\", \"0\"))"
);
source = source.replace(
  "        try:\n            self.send_json(200, transcribe_local(audio, suffix))\n        except Exception as error:",
  `        if not _transcription_slots.acquire(blocking=False):
            self.send_json(503, {"error": "Le serveur analyse déjà plusieurs lectures. Réessayez dans quelques secondes."})
            return
        try:
            self.send_json(200, transcribe_local(audio, suffix))
        except ValueError:
            self.send_json(413, {"error": f"La lecture ne doit pas dépasser {MAX_DURATION_SECONDS} secondes."})
        except Exception as error:`
);
source = source.replace(
  '            self.send_json(500, {"error": "Whisper local n’a pas pu analyser cet enregistrement."})',
  '            self.send_json(500, {"error": "Whisper local n’a pas pu analyser cet enregistrement."})\n        finally:\n            _transcription_slots.release()'
);
source = source.replace(
  "    server = ThreadingHTTPServer((args.host, args.port), PronunciationHandler)",
  "    server = ThreadingHTTPServer((args.host, args.port), PronunciationHandler)\n    server.daemon_threads = True"
);

if (!source.includes("RATE_LIMIT_REQUESTS") || !source.includes("_transcription_slots.release()") || !source.includes("Permissions-Policy")) {
  throw new Error("Server hardening was not installed.");
}
fs.writeFileSync(serverPath, source, "utf8");
console.log("French 8 Whisper server production limits installed.");
