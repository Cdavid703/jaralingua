"""Generate the Unit 6 teaching asset audio with the established ElevenLabs pipeline."""
from pathlib import Path
import generate_first_visit_audio as generator

if __name__ == "__main__":
    generator.DEST = Path(__file__).resolve().parents[1] / "ingles/intermediate-2/audio/unit-6-explanation"
    generator.main()
