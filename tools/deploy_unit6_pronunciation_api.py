"""Deploy only the reviewed Unit 6 API patch, preserving production-only code.

Administrator tool. Preview by default; explicit hash guards, backup, atomic
replacement, health check and automatic code rollback. Never opens grade data.
"""
import argparse, hashlib, json, os, shutil, stat, subprocess, tempfile, time
from pathlib import Path
from urllib.request import urlopen

REPO=Path('/home/jaralingua-dev/projects/jaralingua-git')
LIVE=Path('/var/www/jaralingua.com/server/progress_api.py')
BACKUPS=Path('/var/backups/jaralingua/unit6-api')
def digest(data): return hashlib.sha256(data).hexdigest()
def git(*args):
    return subprocess.check_output(['runuser','-u','jaralingua-dev','--','git','-C',str(REPO),*args])
def healthy():
    for _ in range(15):
        try:
            with urlopen('http://127.0.0.1:8787/api/health',timeout=2) as response:
                if response.status==200: return True
        except Exception: pass
        time.sleep(1)
    return False
def replace(data,metadata):
    with tempfile.NamedTemporaryFile(dir=LIVE.parent,prefix='.unit6-api-',delete=False) as temp:
        temp.write(data);temp.flush();os.fsync(temp.fileno());name=temp.name
    os.chmod(name,stat.S_IMODE(metadata.st_mode));os.chown(name,metadata.st_uid,metadata.st_gid)
    os.replace(name,LIVE)
def main():
    p=argparse.ArgumentParser();p.add_argument('--commit',required=True)
    p.add_argument('--expected-live-sha',required=True);p.add_argument('--expected-candidate-sha',required=True)
    p.add_argument('--apply',action='store_true');args=p.parse_args()
    commit=git('rev-parse',args.commit+'^{commit}').decode().strip()
    if commit!=args.commit: raise RuntimeError('Use full commit SHA')
    subprocess.run(['runuser','-u','jaralingua-dev','--','git','-C',str(REPO),'merge-base','--is-ancestor',commit,'origin/main'],check=True)
    before=LIVE.read_bytes();metadata=LIVE.stat()
    if digest(before)!=args.expected_live_sha: raise RuntimeError('Production changed; review again')
    patch=git('diff',commit+'^',commit,'--','server/progress_api.py')
    if not patch or b'/api/basic2/unit6-food-pronunciation/submit' not in patch: raise RuntimeError('Wrong patch')
    with tempfile.TemporaryDirectory(prefix='unit6-api-review-') as tmp:
        stage=Path(tmp);(stage/'server').mkdir();candidate=stage/'server/progress_api.py';candidate.write_bytes(before)
        subprocess.run(['git','apply','--check','-'],cwd=stage,input=patch,check=True)
        subprocess.run(['git','apply','-'],cwd=stage,input=patch,check=True)
        after=candidate.read_bytes()
        if digest(after)!=args.expected_candidate_sha: raise RuntimeError('Candidate differs from tested version')
        compile(after,str(candidate),'exec')
        env=dict(os.environ,UNIT6_API_SOURCE=str(candidate))
        subprocess.run(['python3',str(REPO/'tools/test_unit6_pronunciation_backend.py')],env=env,check=True)
    print(json.dumps({'commit':commit,'path':str(LIVE),'before':digest(before),'after':digest(after),'apply':args.apply}))
    if not args.apply: print('PREVIEW ONLY: no production changes');return
    if not healthy(): raise RuntimeError('Existing service unhealthy; refusing deployment')
    if digest(LIVE.read_bytes())!=args.expected_live_sha: raise RuntimeError('Concurrent production change')
    BACKUPS.mkdir(parents=True,exist_ok=True)
    backup=Path(tempfile.mkdtemp(prefix=time.strftime('%Y%m%dT%H%M%SZ-'),dir=BACKUPS))
    shutil.copy2(LIVE,backup/'progress_api.py')
    (backup/'manifest.json').write_text(json.dumps({'commit':commit,'path':str(LIVE),'before':digest(before),'after':digest(after)},indent=2))
    replace(after,metadata)
    try:
        subprocess.run(['systemctl','restart','jaralingua-progress-api'],check=True)
        if not healthy(): raise RuntimeError('API health check failed')
    except Exception:
        replace(before,metadata);subprocess.run(['systemctl','restart','jaralingua-progress-api'],check=True)
        print('Restored previous code. Backup:',backup);raise
    print('DEPLOYED; API healthy. Backup:',backup)
if __name__=='__main__': main()
