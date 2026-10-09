"""Generate public fictional newsroom teaching narration and vocabulary with ElevenLabs."""
from pathlib import Path
import generate_first_visit_audio as generator
if __name__ == '__main__':
    generator.DEST = Path(__file__).resolve().parents[1] / 'ingles/intermediate-2/audio/unit-6-newsroom'
    generator.main()
