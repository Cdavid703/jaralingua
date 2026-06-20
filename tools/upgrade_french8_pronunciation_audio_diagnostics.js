const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const serverPath = path.join(root, "tools", "french8_pronunciation_server_local.py");
const clientPath = path.join(root, "assets", "js", "french8-pronunciation.js");

let server = fs.readFileSync(serverPath, "utf8");
server = server.replace(
  "from faster_whisper import WhisperModel\n",
  "from faster_whisper import WhisperModel\nfrom faster_whisper.audio import decode_audio\nimport numpy as np\n"
);
server = server.replace(
  "            temporary_path = temporary.name\n        with _inference_lock:",
  "            temporary_path = temporary.name\n        decoded_audio = decode_audio(temporary_path, sampling_rate=16000)\n        duration_seconds = len(decoded_audio) / 16000\n        rms = float(np.sqrt(np.mean(np.square(decoded_audio)))) if len(decoded_audio) else 0.0\n        peak = float(np.max(np.abs(decoded_audio))) if len(decoded_audio) else 0.0\n        with _inference_lock:"
);
server = server.replace(
  "                temporary_path,\n                language=\"fr\",\n                beam_size=5,\n                vad_filter=True,",
  "                decoded_audio,\n                language=\"fr\",\n                beam_size=5,\n                vad_filter=False,\n                no_speech_threshold=0.9,\n                log_prob_threshold=-2.0,"
);
server = server.replace(
  '            "model": MODEL_NAME,\n',
  '            "model": MODEL_NAME,\n            "audio": {"duration_seconds": round(duration_seconds, 3), "rms": round(rms, 7), "peak": round(peak, 7), "bytes": len(audio)},\n'
);
if (!server.includes('"rms": round(rms, 7)') || !server.includes("vad_filter=False")) {
  throw new Error("Server audio diagnostics were not installed.");
}
fs.writeFileSync(serverPath, server, "utf8");

let client = fs.readFileSync(clientPath, "utf8");
client = client.replace(
  '      const transcript = (payload.text || "").trim();\n      liveTranscript.textContent = transcript || "Aucune parole reconnue.";\n      evaluate(transcript);',
  '      const transcript = (payload.text || "").trim();\n      const audioStats = payload.audio || {};\n      if (!transcript) {\n        if (Number(audioStats.rms || 0) < 0.0008) throw new Error("La grabación llegó en silencio. Verifique el micrófono seleccionado en el navegador y pruebe nuevamente.");\n        throw new Error("Whisper recibió sonido, pero no identificó palabras francesas. Hable un poco más cerca y con mayor volumen.");\n      }\n      liveTranscript.textContent = transcript;\n      evaluate(transcript);'
);
client = client.replace(
  "audio:{echoCancellation:true,noiseSuppression:true}",
  "audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true,channelCount:1}"
);
client = client.replace(
  "audio: { echoCancellation: true, noiseSuppression: true }, video: false",
  "audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 }, video: false"
);
if (!client.includes("La grabación llegó en silencio") || !client.includes("autoGainControl: true")) {
  throw new Error("Client audio diagnostics were not installed.");
}
fs.writeFileSync(clientPath, client, "utf8");

console.log("French 8 audio diagnostics and low-volume handling installed.");
