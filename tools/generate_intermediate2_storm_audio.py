"""Generate the approved public After the Storm narration and vocabulary with Sarah."""
from pathlib import Path
import generate_first_visit_audio as generator
if __name__ == '__main__':
    generator.DEST = Path(__file__).resolve().parents[1] / 'ingles/intermediate-2/audio/unit-6-after-the-storm'
    generator.main()
