"""Generate French Level 8 Theme 7 Conversation Coach audio with ElevenLabs."""

from __future__ import annotations

import json
import os
from pathlib import Path
import urllib.request


ROOT = Path(__file__).resolve().parents[1]
ENV_FILE = ROOT / "elevenlabs.local.env"
OUTPUT_DIR = ROOT / "frances" / "Niveau 8" / "audio" / "pratique-orale" / "theme-07"

TEXTS = {
    "question-01.mp3": "Les bourses aident certains étudiants, mais les inégalités continuent. Commencez par : Bien que.",
    "question-02.mp3": "Peu de citoyens participent au budget local, mais la mesure reste importante. Commencez par : Même si.",
    "question-03.mp3": "Des entreprises promettent l’égalité, mais des candidats restent discriminés. Commencez par : Cependant.",
    "question-04.mp3": "Il existe des programmes d’aide, mais le plafond de verre reste fort. Commencez par : Malgré.",
    "question-05.mp3": "Une mesure coûte cher, mais elle peut réduire les injustices. Commencez par : Même si.",
    "question-06.mp3": "Les associations sont petites, mais elles changent parfois les décisions locales. Commencez par : Néanmoins.",
}


def load_env() -> dict[str, str]:
    settings: dict[str, str] = {}
    if not ENV_FILE.exists():
        return settings
    for raw in ENV_FILE.read_text(encoding="utf-8-sig").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        settings[key.strip()] = value.strip().strip('"').strip("'")
        os.environ.setdefault(key.strip(), settings[key.strip()])
    return settings


def first_voice(settings: dict[str, str]) -> str:
    candidates = [
        settings.get("ELEVENLABS_VOICE_NARRATOR", ""),
        settings.get("ELEVENLABS_VOICE_POOL_FR_FR_FEMALE", ""),
        settings.get("ELEVENLABS_VOICE_POOL_FR_FR_NEUTRAL", ""),
        settings.get("ELEVENLABS_VOICE_ID", ""),
        "JvD1a0L9rABccms2q9zH",
    ]
    for candidate in candidates:
        if not candidate:
            continue
        first = candidate.split(",", 1)[0].strip()
        if first and not first.startswith("put_"):
            return first
    raise RuntimeError("No French ElevenLabs voice is configured.")


def main() -> int:
    settings = load_env()
    api_key = os.environ.get("ELEVENLABS_API_KEY", "").strip()
    if not api_key or api_key == "put_your_api_key_here":
        raise RuntimeError("ELEVENLABS_API_KEY is not configured.")

    voice_id = first_voice(settings)
    model_id = settings.get("ELEVENLABS_MODEL_ID") or "eleven_multilingual_v2"
    output_format = settings.get("ELEVENLABS_OUTPUT_FORMAT") or "mp3_44100_128"
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}?output_format={output_format}"
    headers = {
        "xi-api-key": api_key,
        "Accept": "audio/mpeg",
        "Content-Type": "application/json; charset=utf-8",
    }
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    for filename, text in TEXTS.items():
        payload = {
            "text": text,
            "model_id": model_id,
            "language_code": "fr",
            "voice_settings": {
                "stability": 0.74,
                "similarity_boost": 0.84,
                "style": 0.05,
                "use_speaker_boost": True,
            },
        }
        request = urllib.request.Request(
            url,
            data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
            method="POST",
            headers=headers,
        )
        with urllib.request.urlopen(request, timeout=120) as response:
            audio = response.read()
        output_path = OUTPUT_DIR / filename
        output_path.write_bytes(audio)
        print(f"CREATED {output_path} {len(audio)} bytes :: {text}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
