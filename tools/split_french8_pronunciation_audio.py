"""Split the existing pronunciation model into four local WAV section files."""

from pathlib import Path
import wave

import numpy as np
from faster_whisper.audio import decode_audio


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "frances" / "Niveau 8" / "audio" / "pronunciation" / "n8-01d-conditionnel-passe-modele-france.mp3"
OUTPUT = SOURCE.parent / "sections"
SAMPLE_RATE = 16_000
RANGES = [
    (0.00, 4.18),
    (4.20, 8.72),
    (8.96, 11.92),
    (11.94, 16.48),
]


def main() -> int:
    audio = decode_audio(str(SOURCE), sampling_rate=SAMPLE_RATE)
    OUTPUT.mkdir(parents=True, exist_ok=True)
    for index, (start, end) in enumerate(RANGES, start=1):
        clip = audio[int(start * SAMPLE_RATE):int(end * SAMPLE_RATE)]
        pcm = np.clip(clip * 32767, -32768, 32767).astype("<i2")
        destination = OUTPUT / f"section-{index}.wav"
        with wave.open(str(destination), "wb") as output:
            output.setnchannels(1)
            output.setsampwidth(2)
            output.setframerate(SAMPLE_RATE)
            output.writeframes(pcm.tobytes())
        print(f"{destination.relative_to(ROOT)}: {len(clip) / SAMPLE_RATE:.2f}s")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
