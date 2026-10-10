"""Check public reported-speech MP3s against their scripts; resumable per file hash."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import hashlib,json,re,threading,urllib.request
from audit_intermediate2_midterm_oral_coach_audio import load_key,transcribe as transcribe_auto
BASE=Path(__file__).resolve().parents[1]/'ingles/intermediate-2/audio/unit-6-reported-speech'
def transcribe(path,key):
 if not path.name.startswith('word-'):return transcribe_auto(path,key)
 boundary='----JaralinguaReportedWords'
 fields=''.join(f'--{boundary}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n' for k,v in [('model_id','scribe_v1'),('language_code','en'),('tag_audio_events','false')])
 body=(fields+f'--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="{path.name}"\r\nContent-Type: audio/mpeg\r\n\r\n').encode()+path.read_bytes()+f'\r\n--{boundary}--\r\n'.encode()
 req=urllib.request.Request('https://api.elevenlabs.io/v1/speech-to-text',data=body,headers={'xi-api-key':key,'Content-Type':'multipart/form-data; boundary='+boundary})
 with urllib.request.urlopen(req,timeout=90) as r:return str(json.load(r).get('text') or '')
def norm(s):
 s=s.lower().replace('’',"'")
 for a,b in [("he's",'he is'),("she's",'she is'),('roundtable','round table'),('anna','ana'),('czech','check')]:s=re.sub(r'\b'+re.escape(a)+r'\b',b,s)
 for a,b in [('practise','practice'),('practising','practicing'),('behaviour','behavior'),('favourite','favorite')]:s=s.replace(a,b)
 return re.sub('[^a-z0-9]+',' ',s).strip()
def main():
 items=json.loads((BASE/'models.json').read_text(encoding='utf-8'))['items']
 path=BASE/'audio-audit.json'; old=json.loads(path.read_text(encoding='utf-8')) if path.exists() else []
 cache={x['file']:x for x in old};lock=threading.Lock();key=load_key()
 def check(item):
  sha=hashlib.sha256((BASE/item['file']).read_bytes()).hexdigest()
  if cache.get(item['file'],{}).get('sha256')==sha and cache[item['file']].get('matched'):
   cache[item['file']]['matched']=norm(cache[item['file']]['heard'])==norm(item['text']);return
  heard=transcribe(BASE/item['file'],key)
  result=dict(file=item['file'],expected=item['text'],heard=heard,matched=norm(heard)==norm(item['text']),sha256=sha)
  with lock:
   cache[item['file']]=result;path.write_text(json.dumps(list(cache.values()),ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
   print(('PASS ' if result['matched'] else 'REVIEW ')+item['file'],flush=True)
 with ThreadPoolExecutor(max_workers=2) as pool:list(pool.map(check,items))
 path.write_text(json.dumps(list(cache.values()),ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 print('Audited',len(cache),'files;',sum(not x['matched'] for x in cache.values()),'need transcription review.')
if __name__=='__main__':main()
