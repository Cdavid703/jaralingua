from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import json,re,difflib,sys
from audit_intermediate2_midterm_oral_coach_audio import transcribe,load_key
root=Path(__file__).resolve().parents[1]
dest=root/'ingles/intermediate-2/audio/unit-4-explanation'
out=root/'tmp/unit4-qa/audio-transcripts.json'
models=json.loads((dest/'models.json').read_text(encoding='utf-8'))
key=load_key()
def norm(s):
 s=s.lower().replace('’',"'")
 for a,b in {"i've":"i have","she's":"she has","hasn't":"has not","haven't":"have not","it's":"it is","you'll":"you will","don't":"do not"}.items():s=s.replace(a,b)
 s=s.replace("twenty twenty-six","2026").replace("twenty twenty six","2026")
 return re.sub(r"[^a-z0-9]+"," ",s).strip()
def run(m):
 heard=transcribe(dest/m['file'],key)
 ratio=difflib.SequenceMatcher(None,norm(m['text']).split(),norm(heard).split()).ratio()
 print(f'{m["file"]}: {ratio:.3f}',flush=True)
 return {'file':m['file'],'expected':m['text'],'heard':heard,'similarity':ratio}
with ThreadPoolExecutor(max_workers=3) as pool: results=list(pool.map(run,models))
out.write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf-8')
print('REVIEW',json.dumps([x for x in results if x['similarity']<.98],ensure_ascii=True))
sys.exit(1 if any(x['similarity']<.90 for x in results) else 0)

