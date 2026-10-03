"""Audit vocabulary recordings against their exact scripts, reusing the public story audit."""
from pathlib import Path
import re
import audit_first_visit_audio as audit

def normalize(text):
    text = text.lower().replace('’', "'").replace('realizes', 'realises')
    return re.sub('[^a-z0-9]+', ' ', text).strip()

if __name__ == '__main__':
    audit.BASE = Path(__file__).resolve().parents[1] / 'ingles/intermediate-2/audio/unit-5-first-visit/vocabulary'
    audit.norm = normalize
    audit.main()
