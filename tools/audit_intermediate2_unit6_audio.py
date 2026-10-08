"""Audit Unit 6 recordings against the canonical public scripts using ElevenLabs Scribe."""
from pathlib import Path
import re
import audit_first_visit_audio as audit

def normalize(text):
    text = text.lower().replace("’", "\'").replace("rumour", "rumor").replace("travelled", "traveled").replace("judgement", "judgment")
    return re.sub("[^a-z0-9]+", " ", text).strip()

if __name__ == "__main__":
    audit.BASE = Path(__file__).resolve().parents[1] / "ingles/intermediate-2/audio/unit-6-explanation"
    audit.norm = normalize
    audit.main()
