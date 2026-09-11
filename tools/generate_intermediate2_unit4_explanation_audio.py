"""Generate approved Unit 4 audio from the canonical models.json inventory.

Uses the established professional voice and model. Resumes without overwriting.
API credentials are read locally and are never printed or stored in metadata.
"""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import hashlib
import json
import urllib.request
import urllib.error
import time

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / 'ingles/intermediate-2/audio/unit-4-explanation'
VOICE = 'EXAVITQu4vr4xnSDxMaL'

def main():
    settings = {}
    for line in (ROOT / 'elevenlabs.local.env').read_text(encoding='utf-8-sig').splitlines():
        if '=' in line and not line.lstrip().startswith('#'):
            key,value=line.split('=',1)
            settings[key.strip()]=value.strip().strip('\"').strip("'")
    key=settings.get('ELEVENLABS_API_KEY')
    if not key or key=='put_your_api_key_here': raise SystemExit('Local audio key is not configured.')
    models=json.loads((DEST/'models.json').read_text(encoding='utf-8'))
    def generate(item):
        path=DEST/item['file']
        digest=hashlib.sha256(item['text'].encode()).hexdigest()
        metadata=path.with_suffix('.json')
        if path.exists() and metadata.exists():
            saved=json.loads(metadata.read_text())
            if saved.get('text_sha256')==digest and path.stat().st_size>1000:
                print('EXISTS '+item['file'],flush=True)
                return
            raise RuntimeError('Existing audio differs from canonical script: '+item['file'])
        payload={'text':item['text'],'model_id':'eleven_multilingual_v2','language_code':'en','voice_settings':{'stability':0.58,'similarity_boost':0.82,'style':0.12,'use_speaker_boost':True}}
        for attempt in range(3):
            request=urllib.request.Request(f'https://api.elevenlabs.io/v1/text-to-speech/{VOICE}?output_format=mp3_44100_128',data=json.dumps(payload).encode('utf-8'),headers={'xi-api-key':key,'Accept':'audio/mpeg','Content-Type':'application/json'},method='POST')
            try:
                with urllib.request.urlopen(request,timeout=100) as response: data=response.read()
            except urllib.error.HTTPError as error:
                if error.code==429 and attempt<2:
                    time.sleep(4*(attempt+1)); continue
                raise RuntimeError(f'Audio service returned {error.code} for {item["file"]}') from None
            if len(data)<1000: raise RuntimeError('Audio is unexpectedly small: '+item['file'])
            tmp=path.with_suffix('.part')
            tmp.write_bytes(data)
            tmp.replace(path)
            metadata.write_text(json.dumps({'file':item['file'],'text_sha256':digest,'voice_id':VOICE,'model_id':'eleven_multilingual_v2','bytes':len(data)},indent=2)+'\n',encoding='utf-8')
            print('CREATED '+item['file'],flush=True)
            return
    with ThreadPoolExecutor(max_workers=2) as pool: list(pool.map(generate,models))
    print(f'COMPLETE {len(models)} models',flush=True)

if __name__=='__main__': main()
