"""Audit News Quest model audio against canonical public sentences."""
from pathlib import Path
import audit_first_visit_audio as audit
if __name__ == '__main__':
    audit.BASE=Path(__file__).resolve().parents[1]/'ingles/intermediate-2/audio/unit-6-news-quest'
    audit.main()
