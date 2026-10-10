"""Generate only approved public coach scripts, using the second David voice authorized by the teacher."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import hashlib,json,urllib.request,sys,time
ROOT=Path(__file__).resolve().parents[1]
BASE=ROOT/'ingles/intermediate-2/audio/unit-6-opinion-coach'
def main():
 config=json.loads((BASE/'models.json').read_text())
 assert config['voiceId']=='pv8WYYW60prEkDbDXyC0'
 env={}
 for line in (ROOT/'elevenlabs.local.env').read_text(encoding='utf-8-sig').splitlines():
  if '=' in line and not line.lstrip().startswith('#'):
   k,v=line.split('=',1);env[k.strip()]=v.strip().strip('\"\'')
 def generate(item):
  path=BASE/item['file']
  if path.exists() and item.get('sha256')==hashlib.sha256(path.read_bytes()).hexdigest():return
  payload=dict(text=item.get('generationText',item['text']),model_id=item.get('modelId',config['modelId']),language_code='en',voice_settings=item.get('voiceSettings',dict(stability=.6,similarity_boost=.8,style=.1,use_speaker_boost=True)))
  request=urllib.request.Request('https://api.elevenlabs.io/v1/text-to-speech/'+config['voiceId']+'?output_format=mp3_44100_128',data=json.dumps(payload).encode(),headers={'xi-api-key':env['ELEVENLABS_API_KEY'],'Content-Type':'application/json','Accept':'audio/mpeg'})
  with urllib.request.urlopen(request,timeout=100) as response:audio=response.read()
  assert len(audio)>1000
  tmp=path.with_suffix('.part');tmp.write_bytes(audio);tmp.replace(path)
  item.update(bytes=len(audio),sha256=hashlib.sha256(audio).hexdigest())
  print('Generated',item['file'],flush=True)
 items=config['items']
 if '--preview' in sys.argv:items=[i for i in items if i['file'] in ['hello.mp3','reply-hello.mp3','reply-welcome.mp3']]
 with ThreadPoolExecutor(max_workers=2) as pool:list(pool.map(generate,items))
 (BASE/'models.json').write_text(json.dumps(config,indent=2,ensure_ascii=False)+'\n')
 print('Complete:',len(items),'requested David recordings.')
if __name__=='__main__':main()
