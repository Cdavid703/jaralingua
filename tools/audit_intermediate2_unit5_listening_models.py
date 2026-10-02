"""Check public Unit 5 teaching MP3s against their scripts; resumable per file hash."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import hashlib,json,re,threading
from audit_intermediate2_midterm_oral_coach_audio import load_key,transcribe
BASE=Path(__file__).resolve().parents[1]/'ingles/intermediate-2/audio/unit-5-listening'
def norm(s):return re.sub('[^a-z0-9]+',' ',s.lower().replace('’',"'")).strip()
def main():
 items=json.loads((BASE/'models.json').read_text(encoding='utf-8'))['items']
 path=BASE/'audio-audit.json'; old=json.loads(path.read_text(encoding='utf-8')) if path.exists() else []
 cache={x['file']:x for x in old};lock=threading.Lock();key=load_key()
 def check(item):
  sha=hashlib.sha256((BASE/item['file']).read_bytes()).hexdigest()
  if cache.get(item['file'],{}).get('sha256')==sha:return
  heard=transcribe(BASE/item['file'],key)
  result=dict(file=item['file'],expected=item['text'],heard=heard,matched=norm(heard)==norm(item['text']),sha256=sha)
  with lock:
   cache[item['file']]=result;path.write_text(json.dumps(list(cache.values()),ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
   print(('PASS ' if result['matched'] else 'REVIEW ')+item['file'],flush=True)
 with ThreadPoolExecutor(max_workers=2) as pool:list(pool.map(check,items))
 print('Audited',len(cache),'files;',sum(not x['matched'] for x in cache.values()),'need transcription review.')
if __name__=='__main__':main()
