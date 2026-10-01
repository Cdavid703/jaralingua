"""Check the generated teaching audio; no student recordings are used."""
import os, json, subprocess
from pathlib import Path
from mutagen.mp3 import MP3
from elevenlabs_generate_listenings import load_local_env
ROOT=Path(__file__).resolve().parents[1]
load_local_env(Path('D:/Jaralingua/elevenlabs.local.env'))
source=ROOT/'ingles/basico-2/audio/unit6/maple-cafe/maple-cafe.mp3'
duration=MP3(source).info.length
assert 10<duration<=75, duration
node=r'C:/Users/USER/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe'
code="""const fs=require('node:fs');(async()=>{const form=new FormData();form.set('model_id','scribe_v1');form.set('language_code','en');form.set('tag_audio_events','false');form.set('file',new Blob([fs.readFileSync(process.argv[1])],{type:'audio/mpeg'}),'maple-cafe.mp3');const r=await fetch('https://api.elevenlabs.io/v1/speech-to-text',{method:'POST',headers:{'xi-api-key':process.env.ELEVENLABS_API_KEY},body:form});if(!r.ok)throw Error('ASR HTTP '+r.status);process.stdout.write(await r.text());})().catch(e=>{console.error(e.message);process.exit(1)});"""
result=json.loads(subprocess.check_output([node,'-e',code,str(source)],env=os.environ,timeout=120))
report={'durationSeconds':duration,'language':result.get('language_code'),'text':result.get('text')}
(ROOT/'qa').mkdir(exist_ok=True)
(ROOT/'qa/maple-cafe-audio-audit.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps(report,ensure_ascii=False))
