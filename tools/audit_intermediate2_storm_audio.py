"""Compare the public story recordings against their scripts using ElevenLabs Scribe."""
from pathlib import Path
import audit_first_visit_audio as audit
from audit_intermediate2_unit6_audio import normalize
def story_normalize(text):
    # Scribe may use American spelling for the same spoken English words.
    return normalize(text).replace('organise', 'organize').replace('realised', 'realized').replace('centre', 'center')

if __name__ == '__main__':
    audit.BASE = Path(__file__).resolve().parents[1] / 'ingles/intermediate-2/audio/unit-6-after-the-storm'
    audit.norm = story_normalize
    # Re-evaluate cached transcripts when orthographic normalization changes.
    import json
    cache = audit.BASE / 'audio-audit.json'
    if cache.exists():
        rows = json.loads(cache.read_text())
        for row in rows:
            row['matched'] = story_normalize(row['expected']) == story_normalize(row['heard'])
        cache.write_text(json.dumps(rows, ensure_ascii=False, indent=2) + '\n')
    audit.main()
