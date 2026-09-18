"""Generate the two supplementary memory vocabulary recordings."""
from pathlib import Path
import generate_intermediate2_unit4_explanation_audio as generator
if __name__ == "__main__":
    generator.DEST = Path(__file__).resolve().parents[1] / "ingles/intermediate-2/audio/unit-4-memory"
    generator.main()
