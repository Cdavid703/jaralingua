"""Generate French Level 1 Unit 1 Conversation Coach audio safely with UTF-8.

This script exists because Windows PowerShell can misread non-ASCII script
contents when a .ps1 file is saved as UTF-8 without BOM. That caused French
apostrophes and accents to be sent incorrectly to TTS once. Keep this generator
as the canonical one for this activity.
"""

from __future__ import annotations

import json
import os
from pathlib import Path
import urllib.request


ROOT = Path(__file__).resolve().parents[1]
ENV_FILE = ROOT / "elevenlabs.local.env"
OUTPUT_DIR = ROOT / "frances" / "Niveau 1" / "audio" / "pratique-orale" / "unite-1"

TEXTS = {
    "question-01.mp3": "Bonjour. Comment tu t'appelles ?",
    "question-02.mp3": "Tu peux épeler ton prénom, s'il te plaît ?",
    "question-03.mp3": "Tu viens d'où ?",
    "question-04.mp3": "Tu habites dans quelle ville ?",
    "question-05.mp3": "Quel âge as-tu ?",
    "question-06.mp3": "Quel est ton numéro préféré entre un et vingt ?",
    "question-07.mp3": "Présente-toi en deux phrases, s'il te plaît.",
    "question-08.mp3": "Dis bonjour, présente-toi et termine avec enchanté ou enchantée.",
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
        settings[key.strip()] = value.strip().strip("\"").strip("'")
        os.environ.setdefault(key.strip(), settings[key.strip()])
    return settings


def first_voice(settings: dict[str, str]) -> str:
    candidates = [
        settings.get("ELEVENLABS_VOICE_POOL_FR_FR_FEMALE", ""),
        settings.get("ELEVENLABS_VOICE_NARRATOR", ""),
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
                "stability": 0.76,
                "similarity_boost": 0.84,
                "style": 0.04,
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
