"""Generate missing Unit 5 grammar workshop audio; no student content is sent."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import hashlib
import json
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / 'ingles/intermediate-2/audio/unit-5-grammar'


def main():
    config = json.loads((DEST / 'models.json').read_text(encoding='utf-8'))
    settings = {}
    for line in (ROOT / 'elevenlabs.local.env').read_text(encoding='utf-8-sig').splitlines():
        if '=' in line and not line.lstrip().startswith('#'):
            key, value = line.split('=', 1)
            settings[key.strip()] = value.strip().strip('\"').strip("'")
    key = settings['ELEVENLABS_API_KEY']

    def generate(item):
        path = DEST / item['file']
        if path.exists() and path.stat().st_size > 1000:
            if 'sha256' in item:
                assert hashlib.sha256(path.read_bytes()).hexdigest() == item['sha256']
            return
        payload = dict(text=item['text'], model_id=config['modelId'], language_code='en',
                       voice_settings=dict(stability=0.64, similarity_boost=0.82, style=0.14, use_speaker_boost=True))
        request = urllib.request.Request(
            'https://api.elevenlabs.io/v1/text-to-speech/' + config['voiceId'] + '?output_format=mp3_44100_128',
            data=json.dumps(payload).encode(),
            headers={'xi-api-key': key, 'Accept': 'audio/mpeg', 'Content-Type': 'application/json'}, method='POST')
        with urllib.request.urlopen(request, timeout=100) as response:
            audio = response.read()
        assert len(audio) > (10000 if item['kind'] == 'section' else 1000)
        temp = path.with_suffix('.part'); temp.write_bytes(audio); temp.replace(path)
        print('Generated ' + item['file'], flush=True)

    with ThreadPoolExecutor(max_workers=2) as pool:
        list(pool.map(generate, config['items']))
    for item in config['items']:
        data = (DEST / item['file']).read_bytes()
        item.update(bytes=len(data), sha256=hashlib.sha256(data).hexdigest())
    (DEST / 'models.json').write_text(json.dumps(config, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
    print('Verified all ' + str(len(config['items'])) + ' professional audio files.')


if __name__ == '__main__':
    main()
