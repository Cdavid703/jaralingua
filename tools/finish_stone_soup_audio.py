"""Join page models into one mobile-safe continuous track with real chapter offsets."""
from pathlib import Path
import subprocess,json,wave,tempfile
import imageio_ffmpeg
ROOT=Path(__file__).resolve().parents[1]
audio=ROOT/'ingles/basico-2/audio/unit6/stone-soup'
manifest=json.loads((audio/'manifest.json').read_text())
ffmpeg=imageio_ffmpeg.get_ffmpeg_exe()
with tempfile.TemporaryDirectory(prefix='stone-soup-audio-') as temp:
    temp=Path(temp);frames=0;rate=44100
    with wave.open(str(temp/'complete.wav'),'wb') as out:
        out.setnchannels(1);out.setsampwidth(2);out.setframerate(rate)
        for i,page in enumerate(manifest['pages'],1):
            decoded=temp/f'{i}.wav'
            subprocess.run([ffmpeg,'-v','error','-i',str(audio/f'page-{i}.mp3'),'-ar',str(rate),'-ac','1',str(decoded)],check=True)
            with wave.open(str(decoded),'rb') as source:
                page['start']=round(frames/rate,6);page['duration']=round(source.getnframes()/rate,6)
                frames+=source.getnframes();out.writeframes(source.readframes(source.getnframes()))
                if i<6:
                    pause=round(.35*rate);out.writeframes(b'\0\0'*pause);frames+=pause
    subprocess.run([ffmpeg,'-v','error','-y','-i',str(temp/'complete.wav'),'-codec:a','libmp3lame','-b:a','128k',str(audio/'full-story.mp3')],check=True)
manifest['fullAudio']='/ingles/basico-2/audio/unit6/stone-soup/full-story.mp3'
manifest['duration']=round(frames/rate,3)
(audio/'manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
(ROOT/'assets/js/basic2-stone-soup-audio.js').write_text('window.StoneSoupAudio = '+json.dumps(manifest,indent=2)+';\n',encoding='utf-8')
print('Complete story duration:',manifest['duration'],'seconds; 6 page boundaries.')
