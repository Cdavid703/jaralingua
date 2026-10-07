"""Scoped API hooks and recoverable backend deployment for Basic 2 oral only."""
import argparse
import ast
from datetime import datetime,timezone
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import tempfile
import time
import urllib.request

ROOT=Path(__file__).resolve().parents[1]
MODULES=('basic2_oral_exam.py','basic2_oral_media.py')


def upload_proxy(source):
    if 'location = /api/basic2/final-oral/upload {' in source:return source
    blocks=re.findall(r'    location /api/ \{\n.*?\n    \}',source,re.S)
    assert len(blocks)==1,'API proxy anchor changed'
    block=blocks[0].replace('location /api/ {','location = /api/basic2/final-oral/upload {',1)
    block=block.replace('        proxy_pass ','        proxy_read_timeout 130s;\n        proxy_pass ',1)
    return source.replace(blocks[0],block+'\n\n'+blocks[0],1)


def check_health():
    for attempt in range(10):
        try:
            with urllib.request.urlopen('http://127.0.0.1:8787/api/health',timeout=3) as response:
                assert json.load(response).get('ok') is True
            return
        except Exception:
            if attempt==9:raise
            time.sleep(.5)


def add_hooks(source):
    source=source.replace('\r\n','\n')
    for suffix in ('',', payload'):
        anchor=f'        if handle_basic2_final_postcard(self, profile, parsed, globals(){suffix}):\n            return\n'
        block='        from basic2_oral_exam import handle as handle_basic2_oral\n'+f'        if handle_basic2_oral(self, profile, parsed, globals(){suffix}):\n            return\n'
        if block not in source:
            assert source.count(anchor)==1,'Authenticated route anchor changed'
            source=source.replace(anchor,anchor+block,1)
    anchor='                basic2_changed = ensure_basic2_gradebook_structure(grades_data)\n'
    block=('                try:\n'
           '                    from basic2_oral_exam import reconcile as reconcile_basic2_oral\n'
           '                    if reconcile_basic2_oral(globals(), grades_data):\n'
           '                        basic2_changed = True\n'
           '                except Exception as error:\n'
           '                    print("Basic 2 oral reconciliation:", type(error).__name__, flush=True)\n')
    if block not in source:
        assert source.count(anchor)==1,'Gradebook anchor changed'
        source=source.replace(anchor,anchor+block,1)
    ast.parse(source)
    return source


def deploy(commit,apply=False):
    assert re.fullmatch(r'[0-9a-f]{40}',commit),'Use the full commit SHA'
    root=Path('/var/www/jaralingua.com');checkout=Path('/home/jaralingua-dev/projects/jaralingua-git')
    proxy=Path('/etc/nginx/sites-enabled/jaralingua.com').resolve()
    old_proxy=proxy.read_text();new_proxy=upload_proxy(old_proxy)
    subprocess.run(['runuser','-u','jaralingua-dev','--','git','-C',str(checkout),'merge-base','--is-ancestor',commit,'origin/main'],check=True)
    changes={'progress_api.py':add_hooks((root/'server/progress_api.py').read_text(encoding='utf-8-sig')).encode()}
    for name in MODULES:
        changes[name]=subprocess.check_output(['runuser','-u','jaralingua-dev','--','git','-C',str(checkout),'show',commit+':server/'+name])
    for data in changes.values():ast.parse(data)
    print(json.dumps({'commit':commit,'paths':['server/'+n for n in changes],
        'nginx':str(proxy),'nginxChange':'130s timeout for the oral upload route only' if old_proxy!=new_proxy else 'unchanged',
        'mode':'apply' if apply else 'preview'},indent=2))
    if not apply:return
    for executable in ('bwrap','libreoffice','pdfinfo','pdftoppm'):assert shutil.which(executable),'Missing approved converter: '+executable
    backup=Path('/var/backups/jaralingua')/('basic2-oral-'+datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ'));backup.mkdir(parents=True)
    previous={}
    for name in changes:
        path=root/'server'/name;previous[name]=path.exists()
        if path.exists():shutil.copy2(path,backup/name)
    (backup/'manifest.json').write_text(json.dumps(previous,indent=2))
    shutil.copy2(proxy,backup/'nginx-jaralingua.conf')
    try:
        for name,data in changes.items():
            target=root/'server'/name
            with tempfile.NamedTemporaryFile(dir=target.parent,delete=False) as handle:
                handle.write(data);temporary=Path(handle.name)
            temporary.chmod(0o644);os.replace(temporary,target)
        subprocess.run(['python3','-m','py_compile',*[str(root/'server'/n) for n in changes]],check=True)
        subprocess.run(['systemctl','restart','jaralingua-progress-api'],check=True)
        subprocess.run(['systemctl','is-active','--quiet','jaralingua-progress-api'],check=True)
        check_health()
        if old_proxy!=new_proxy:
            proxy.write_text(new_proxy)
            subprocess.run(['nginx','-t'],check=True)
            subprocess.run(['systemctl','reload','nginx'],check=True)
    except Exception:
        proxy.write_text(old_proxy)
        subprocess.run(['nginx','-t'],check=True)
        subprocess.run(['systemctl','reload','nginx'],check=True)
        for name,existed in previous.items():
            target=root/'server'/name
            if existed:shutil.copy2(backup/name,target)
            elif target.exists():target.unlink()
        subprocess.run(['systemctl','restart','jaralingua-progress-api'],check=True)
        raise
    print('Backup:',backup)
    print('Hashes:',json.dumps({n:hashlib.sha256(data).hexdigest() for n,data in changes.items()}))


if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--local-hooks',action='store_true');parser.add_argument('--commit');parser.add_argument('--apply',action='store_true');args=parser.parse_args()
    if args.local_hooks:
        p=ROOT/'server/progress_api.py';p.write_text(add_hooks(p.read_text(encoding='utf-8-sig')),encoding='utf-8')
    elif args.commit:deploy(args.commit,args.apply)
    else:parser.error('Specify --local-hooks or --commit')
