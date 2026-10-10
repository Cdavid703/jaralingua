"""Generate and audit the teacher-scripted news bulletin without publishing its transcript."""
from pathlib import Path
import hashlib,json,sys,urllib.request,re
from difflib import SequenceMatcher
from mutagen.mp3 import MP3
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'server'))
from intermediate2_unit6_listening import TRANSCRIPT
from audit_intermediate2_midterm_oral_coach_audio import load_key,transcribe
BASE=ROOT/'ingles/intermediate-2/audio/unit-6-listening'
def main():
 BASE.mkdir(parents=True,exist_ok=True);path=BASE/'after-the-flood.mp3';key=load_key()
 voice='EXAVITQu4vr4xnSDxMaL';model='eleven_multilingual_v2'
 if not path.exists():
  payload=dict(text=TRANSCRIPT,model_id=model,language_code='en',voice_settings=dict(stability=.65,similarity_boost=.8,style=.15,use_speaker_boost=True))
  req=urllib.request.Request('https://api.elevenlabs.io/v1/text-to-speech/'+voice+'?output_format=mp3_44100_128',data=json.dumps(payload).encode(),headers={'xi-api-key':key,'Content-Type':'application/json','Accept':'audio/mpeg'})
  with urllib.request.urlopen(req,timeout=100) as response:data=response.read()
  assert len(data)>1000;path.write_bytes(data)
 duration=MP3(path).info.length;assert 0<duration<=60,duration
 heard=transcribe(path,key)
 def norm(s):
  s=s.lower().replace('12','twelve').replace('centre','center').replace('green ford','greenford')
  return re.sub('[^a-z ]','',s).split()
 match=SequenceMatcher(None,norm(TRANSCRIPT),norm(heard)).ratio()
 # Keep the recognized full transcript in a private local temporary report only.
 Path('/private/tmp/unit6-listening-audio-review.json').write_text(json.dumps(dict(expected=TRANSCRIPT,heard=heard,match=match),indent=2))
 assert match>=.98,match
 metadata=dict(voiceId=voice,voiceName='Sarah',modelId=model,file=path.name,durationSeconds=round(duration,3),bytes=path.stat().st_size,sha256=hashlib.sha256(path.read_bytes()).hexdigest(),scriptSha256=hashlib.sha256(TRANSCRIPT.encode()).hexdigest(),transcriptionMatch=round(match,5))
 (BASE/'media.json').write_text(json.dumps(metadata,indent=2)+'\n');print('PASS audio:',round(duration,2),'seconds; transcript match',match)
if __name__=='__main__':main()
