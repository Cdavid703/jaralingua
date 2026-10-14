"""Generate the 20 words and 20 past-tense models with the established ElevenLabs pipeline."""
from pathlib import Path
import generate_first_visit_audio as generator
if __name__ == '__main__':
    generator.DEST = Path(__file__).resolve().parents[1] / 'ingles/intermediate-2/audio/unit-6-disaster-memory'
    generator.main()
