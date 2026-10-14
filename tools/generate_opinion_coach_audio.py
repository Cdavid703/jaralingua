"""Generate public Unit 6 models with Chris; cloned David is no longer authorized."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import hashlib,json,urllib.request,urllib.error,sys,time,threading
ROOT=Path(__file__).resolve().parents[1]
BASE=ROOT/'ingles/intermediate-2/audio/unit-6-opinion-coach/chris-v1'
def main():
 config=json.loads((BASE/'models.json').read_text())
 assert config['voiceId']=='iP95p4xoKVk53GoZ742B'
 env={}
 for line in (ROOT/'elevenlabs.local.env').read_text(encoding='utf-8-sig').splitlines():
  if '=' in line and not line.lstrip().startswith('#'):
   k,v=line.split('=',1);env[k.strip()]=v.strip().strip('"').strip("'")
 lock=threading.Lock()
 def save():
  (BASE/'models.json').write_text(json.dumps(config,indent=2,ensure_ascii=False)+'\n')
 def generate(item):
  path=BASE/item['file']
  if path.exists() and item.get('sha256')==hashlib.sha256(path.read_bytes()).hexdigest():return
  payload=dict(text=item.get('generationText',item['text']),model_id=item.get('modelId',config['modelId']),language_code='en',voice_settings=item.get('voiceSettings',dict(stability=.65,similarity_boost=.75,style=.2,use_speaker_boost=True)))
  voice_id=item.get('voiceId',config['voiceId'])
  assert voice_id in ['iP95p4xoKVk53GoZ742B','EXAVITQu4vr4xnSDxMaL']
  request=urllib.request.Request('https://api.elevenlabs.io/v1/text-to-speech/'+voice_id+'?output_format=mp3_44100_128',data=json.dumps(payload).encode(),headers={'xi-api-key':env['ELEVENLABS_API_KEY'],'Content-Type':'application/json','Accept':'audio/mpeg'})
  for attempt in range(4):
   try:
    with urllib.request.urlopen(request,timeout=100) as response:audio=response.read()
    break
   except urllib.error.HTTPError as e:
    if e.code not in [429,500,502,503] or attempt==3:raise
    time.sleep(3*(attempt+1))
  assert len(audio)>1000
  tmp=path.with_suffix('.part');tmp.write_bytes(audio);tmp.replace(path)
  with lock:
   item.update(bytes=len(audio),sha256=hashlib.sha256(audio).hexdigest());save()
   print('Generated',item['file'],flush=True)
 items=config['items']
 if '--preview' in sys.argv:items=[i for i in items if i['file'] in ['hello.mp3','reply-hello.mp3','reply-welcome.mp3']]
 with ThreadPoolExecutor(max_workers=2) as pool:list(pool.map(generate,items))
 print('Complete:',len(items),'requested approved recordings.')
if __name__=='__main__':main()
