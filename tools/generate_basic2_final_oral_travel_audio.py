"""Use the established ElevenLabs workflow for the model and pronunciation clips."""
import argparse
import json
from pathlib import Path
import subprocess
import sys
import tempfile

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'ingles/basico-2/audio/final-oral-travel'


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--node', default='node')
    parser.add_argument('--only', help='Filename substring to generate')
    parser.add_argument('--dry-run', action='store_true')
    parser.add_argument('--overwrite', action='store_true')
    parser.add_argument('--manifest-only', action='store_true')
    args = parser.parse_args()
    data = json.loads(subprocess.check_output([args.node, '-e',
        'global.window={};require(process.argv[1]);process.stdout.write(JSON.stringify(window.Basic2OralTravelContent));',
        str(ROOT/'assets/js/basic2-final-oral-travel-content.js')]))
    model = ROOT/'docs/audio/basic2-final-oral-travel-model.md'
    script = '\n'.join(('Server' if role=='assistant' else 'Customer')+': '+text for role,text in data['dialogue'])
    assert model.read_text().split('File: `model-cartagena.mp3`',1)[1].strip()==script, 'Model transcript differs from page'
    snippets = [('destination-'+ident+'.mp3',name) for ident,name,_ in data['destinations']]
    snippets += [('phrase-'+ident+'.mp3',text) for ident,text,_ in data['phrases']]
    OUT.mkdir(parents=True,exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='basic2-oral-scripts-') as folder:
        source = Path(folder)/'pronunciation.md'
        selected = [(name,text) for name,text in snippets if not args.only or args.only in name]
        source.write_text('# Basic 2 pronunciation\n\n'+'\n\n'.join(
            f'## {name}\nFile: `{name}`\n\nCustomer: {text}' for name,text in selected))
        jobs=[]
        if not args.only or args.only in 'model-cartagena.mp3':jobs.append((model,'dialogue'))
        if selected:jobs.append((source,'tts'))
        if not jobs:parser.error('No matching recording')
        commands=[[sys.executable,str(ROOT/'tools/elevenlabs_generate_listenings.py'),
            '--source',str(path),'--out-dir',str(OUT),'--language-profile','english-us',
            '--voice-cast',str(ROOT/'tools/elevenlabs_voice_cast.basic2-unit6.json'),
            '--mode',mode,'--seed','6106','--transport','node','--node-bin',args.node,'--verbose'] for path,mode in jobs]
        if not args.manifest_only:
            for command in commands:subprocess.run(command+['--dry-run'],check=True,cwd=ROOT)
            if args.dry_run:return
            for command in commands:subprocess.run(command+(['--overwrite'] if args.overwrite else []),check=True,cwd=ROOT)
    cast=json.loads((ROOT/'tools/elevenlabs_voice_cast.basic2-unit6.json').read_text())['speakers']
    manifest=dict(provider='ElevenLabs',language='en-US',
        voices={'assistant':cast['Server']['voice_id'],'tourist':cast['Customer']['voice_id']},
        modelSource='docs/audio/basic2-final-oral-travel-model.md',
        generator='tools/elevenlabs_generate_listenings.py',content=data)
    (OUT/'scripts.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
    print('Verified canonical transcript and updated public audio manifest.')


if __name__=='__main__':main()
