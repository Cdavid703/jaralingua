"""Transcribe the 40 public memory models with ElevenLabs Scribe and verify their scripts."""
from pathlib import Path
import audit_intermediate2_unit6_pronunciation_audio as audit
if __name__ == '__main__':
    audit.BASE = Path(__file__).resolve().parents[1] / 'ingles/intermediate-2/audio/unit-6-disaster-memory'
    audit.main()
