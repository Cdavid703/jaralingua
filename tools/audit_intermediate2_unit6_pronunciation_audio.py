"""Audit all Unit 6 models with English transcription; cache by audio SHA256."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import hashlib,json,re,threading
from audit_intermediate2_midterm_oral_coach_audio import load_key
BASE=Path(__file__).resolve().parents[1]/'ingles/intermediate-2/audio/pronunciation/unit-6-intermediate2'
def norm(s):
 s=s.lower().replace('’',"'").replace('rumours','rumors')
 return re.sub('[^a-z0-9]+',' ',s).strip()
def main():
 items=json.loads((BASE/'models.json').read_text())['items'];path=BASE/'audio-audit.json';cache={x['file']:x for x in json.loads(path.read_text())} if path.exists() else {};key=load_key();lock=threading.Lock()
 def check(x):
  p=BASE/x['file'];sha=hashlib.sha256(p.read_bytes()).hexdigest()
  if cache.get(x['file'],{}).get('sha256')==sha and cache[x['file']]['matched']:return
  # Explicit English hint avoids language detection on short isolated words.
  import urllib.request
  boundary='----Unit6PronunciationAudit';fields=''.join(f'--{boundary}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n' for k,v in [('model_id','scribe_v1'),('language_code','en'),('tag_audio_events','false')])
  body=(fields+f'--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="{p.name}"\r\nContent-Type: audio/mpeg\r\n\r\n').encode()+p.read_bytes()+f'\r\n--{boundary}--\r\n'.encode()
  req=urllib.request.Request('https://api.elevenlabs.io/v1/speech-to-text',data=body,headers={'xi-api-key':key,'Content-Type':'multipart/form-data; boundary='+boundary})
  with urllib.request.urlopen(req,timeout=90) as r:heard=str(json.load(r).get('text') or '')
  result=dict(file=x['file'],expected=x['text'],heard=heard,matched=norm(x['text'])==norm(heard) or (x['kind']=='word' and x['text']=='a' and norm(heard)=='uh'),sha256=sha)
  if x['kind']=='word' and x['text']=='a' and norm(heard)=='uh':result['acceptedVariant']='Weak article a /ə/, recognized as uh.'
  with lock:
   cache[x['file']]=result;path.write_text(json.dumps(list(cache.values()),indent=2)+'\n');print(('PASS ' if result['matched'] else 'REVIEW ')+x['file'],flush=True)
 with ThreadPoolExecutor(max_workers=2) as pool:list(pool.map(check,items))
 assert all(x['matched'] for x in cache.values()),'Review the audit mismatches'
 print('PASS all',len(cache),'recordings match their text')
if __name__=='__main__':main()
