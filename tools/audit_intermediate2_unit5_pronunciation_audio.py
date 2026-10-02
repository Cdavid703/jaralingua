"""Transcribe public teaching models to verify their exact reference text."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import json
import re
from audit_intermediate2_midterm_oral_coach_audio import load_key, transcribe

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / 'ingles/intermediate-2/audio/pronunciation/unit-5-intermediate2'


def normalized(value):
    text = value.lower().replace('’', "'")
    for old, new in [('cannot', "can't"), ('can not', "can't")]:
        text = re.sub(r'\b' + old + r'\b', new, text)
    return re.sub('[^a-z0-9]+', ' ', text).strip()


def main():
    data = json.loads((BASE / 'models.json').read_text(encoding='utf-8'))
    items = [x for x in data['items'] if x['kind'] == 'section' or x['text'] in ('must', 'might', "can't", 'tired', 'tiring', 'breath')]
    key = load_key()
    def check(item):
        heard = transcribe(BASE / item['file'], key)
        return dict(file=item['file'], expected=item['text'], heard=heard, matched=normalized(heard) == normalized(item['text']))
    with ThreadPoolExecutor(max_workers=2) as pool:
        results = list(pool.map(check, items))
    (BASE / 'audio-audit.json').write_text(json.dumps(results, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    for item in results:
        print(('PASS ' if item['matched'] else 'REVIEW ') + item['file'])
    assert all(x['matched'] for x in results), 'An audio model needs review.'


if __name__ == '__main__':
    main()
