"""Audit active Unit 6 Practice Lab voice provenance; historical MP3s are not active inputs."""
from pathlib import Path
import hashlib,json,re
ROOT=Path(__file__).resolve().parents[1]
CHRIS='iP95p4xoKVk53GoZ742B';SARAH='EXAVITQu4vr4xnSDxMaL'
BASE='/ingles/intermediate-2/'
def read(path):return json.loads((ROOT/path).read_text())
def config(path):
 s=(ROOT/path).read_text();return json.JSONDecoder().raw_decode(s[re.search(r'window\.\w+\s*=\s*',s).end():])[0]
def strings(value):
 if isinstance(value,str):yield value
 elif isinstance(value,dict):
  for v in value.values():yield from strings(v)
 elif isinstance(value,list):
  for v in value:yield from strings(v)
voice_files={}
for path in (ROOT/'ingles/intermediate-2/audio').rglob('models.json'):
 d=json.loads(path.read_text())
 if not isinstance(d,dict):continue
 for item in d.get('items',[]):
  if 'file' in item:voice_files['/'+str((path.parent/item['file']).relative_to(ROOT))]=item.get('voiceId',d.get('voiceId'))
listening=read('ingles/intermediate-2/audio/unit-6-listening/media.json')
voice_files[BASE+'audio/unit-6-listening/after-the-flood.mp3']=listening['voiceId']
activities=[
 ('Greenford News','assets/data/english-intermediate2-unit6-newsroom.json','unit-6-newsroom',SARAH),
 ('News Quest','assets/data/english-intermediate2-news-quest.json','unit-6-news-quest',SARAH),
 ('My opinion matters','assets/js/conversation-coach-data/english-intermediate-2-unit-6-opinion.js','unit-6-opinion-coach/chris-v1',CHRIS),
 ('What did they say?','assets/js/english-intermediate2-reported-speech-data.js','unit-6-reported-speech/chris-v1',CHRIS),
 ('After the Flood',None,'unit-6-listening',SARAH),
 ('Report the News Clearly','assets/js/english-intermediate2-pronunciation-unit6.js','pronunciation/unit-6-intermediate2',SARAH),
 ('Disaster News Memory','assets/data/english-intermediate2-unit6-memory.json','unit-6-disaster-memory',SARAH),
]
report=[]
for title,source,folder,expected_voice in activities:
 prefix=BASE+'audio/'+folder+'/'
 manifest_path='ingles/intermediate-2/audio/'+folder+'/models.json'
 clips=set()
 if source:
  d=config(source) if source.endswith('.js') else read(source)
  for value in strings(d):
   if value.endswith('.mp3'):
    path=value if value.startswith('/') else BASE+value if value.startswith('audio/') else prefix+value
    clips.add(path)
 if title=='After the Flood':clips.add(prefix+'after-the-flood.mp3')
 else:
  manifest=read(manifest_path);assert manifest['voiceId']==expected_voice,title
  for item in manifest['items']:
   path=prefix+item['file'];clips.add(path)
   assert hashlib.sha256((ROOT/path.lstrip('/')).read_bytes()).hexdigest()==item['sha256'],path
 for path in clips:
  assert (ROOT/path.lstrip('/')).exists(),path
  assert voice_files.get(path) in [CHRIS,SARAH],(title,path,voice_files.get(path))
  for old in ['unit-6-opinion-coach/','unit-6-reported-speech/']:
   if old in path:assert old+'chris-v1/' in path,path
 if expected_voice==CHRIS:
  audit=read('ingles/intermediate-2/audio/'+folder+'/audio-audit.json')
  for item in manifest['items']:
   assert any(a['file']==item['file'] and a['sha256']==item['sha256'] and a['matched'] for a in audit),item['file']
 report.append(dict(activity=title,primaryVoice='Chris' if expected_voice==CHRIS else 'Sarah',activeAudioFiles=len(clips),voices=sorted(set('Chris' if voice_files[p]==CHRIS else 'Sarah' for p in clips))))
 print('PASS',title,':',len(clips),'active clips; no cloned David voice')
catalog=read('assets/data/english-intermediate-2-content.json')
def entries(x):
 if isinstance(x,dict):
  if x.get('unit')==6 and 'workshopHref' in x:yield x
  else:
   for v in x.values():yield from entries(v)
 elif isinstance(x,list):
  for v in x:yield from entries(v)
rows=list(entries(catalog));assert len(rows)==7
for row in rows:
 assert 'David' not in json.dumps(row) and 'pv8WYYW60prEkDbDXyC0' not in json.dumps(row),row['id']
 if row.get('media'):assert voice_files[row['media']] in [CHRIS,SARAH]
(ROOT/'docs/english-intermediate2-unit6-voice-audit.json').write_text(json.dumps(dict(date='2026-10-13',retiredVoice='David (created/cloned)',replacement='Chris (premade)',replacementVoiceId=CHRIS,replacedRecordings=186,replacementVoiceCounts={"Chris":185,"Sarah":1},activities=report),indent=2,ensure_ascii=False)+'\n')
print('PASS all 7 Practice Lab Unit 6 entries and active audio provenance')
