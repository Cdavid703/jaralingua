"""One-file API release with hashes, code backup and health rollback.
No gradebook writes. Hashes of existing gradebooks are compared, never restored.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import shutil
import stat
import subprocess
import tempfile
import time
from urllib.request import urlopen

REPO=Path('/home/jaralingua-dev/projects/jaralingua-git')
LIVE=Path('/var/www/jaralingua.com/server/progress_api.py')
BACKUPS=Path('/var/backups/jaralingua/grade-privacy-api')
GRADEBOOKS=tuple(Path('/var/lib/jaralingua')/name for name in (
    'basic-english-grades.json','basic2-english-grades.json','intermediate-english-grades.json',
    'intermediate2-english-grades.json','french1-grades.json','french2-grades.json',
    'french7-grades.json','french8-grades.json'))
def digest(data):return hashlib.sha256(data).hexdigest()
def git(*args):return subprocess.check_output(['runuser','-u','jaralingua-dev','--','git','-C',str(REPO),*args])
def grade_hashes():return {str(p):digest(p.read_bytes()) for p in GRADEBOOKS if p.is_file()}
def healthy():
    for _ in range(15):
        try:
            with urlopen('http://127.0.0.1:8787/api/health',timeout=2) as r:
                if r.status==200:return True
        except Exception:pass
        time.sleep(1)
    return False
def replace_code(data,metadata):
    with tempfile.NamedTemporaryFile(dir=LIVE.parent,prefix='.grade-privacy-',delete=False) as f:
        f.write(data);f.flush();os.fsync(f.fileno());name=f.name
    os.chmod(name,stat.S_IMODE(metadata.st_mode));os.chown(name,metadata.st_uid,metadata.st_gid)
    os.replace(name,LIVE)
def main():
    p=argparse.ArgumentParser();p.add_argument('--commit',required=True);p.add_argument('--expected-live-sha',required=True);p.add_argument('--expected-candidate-sha',required=True);p.add_argument('--apply',action='store_true');args=p.parse_args()
    commit=git('rev-parse',args.commit+'^{commit}').decode().strip()
    if commit!=args.commit:raise RuntimeError('Full commit SHA required')
    subprocess.run(['runuser','-u','jaralingua-dev','--','git','-C',str(REPO),'merge-base','--is-ancestor',commit,'origin/main'],check=True)
    before=LIVE.read_bytes();metadata=LIVE.stat();after=git('show',commit+':server/progress_api.py')
    if digest(before)!=args.expected_live_sha:raise RuntimeError('Production changed; review before deployment')
    if digest(after)!=args.expected_candidate_sha:raise RuntimeError('Candidate differs from tested source')
    if git('show',commit+'^:server/progress_api.py')!=before:raise RuntimeError('Parent source does not match production')
    compile(after,str(LIVE),'exec')
    with tempfile.TemporaryDirectory(prefix='grade-privacy-validation-') as directory:
        folder=Path(directory);candidate=folder/'progress_api.py';candidate.write_bytes(after)
        test=folder/'test_grade_identity_privacy.py';test.write_bytes(git('show',commit+':tools/test_grade_identity_privacy.py'))
        env=dict(os.environ,GRADE_PRIVACY_API_SOURCE=str(candidate),PYTHONPATH=str(LIVE.parent),PYTHONDONTWRITEBYTECODE='1')
        subprocess.run(['python3',str(test)],env=env,check=True)
    print(json.dumps({'commit':commit,'source':str(LIVE),'before':digest(before),'after':digest(after),'apply':args.apply}),flush=True)
    if not args.apply:print('PREVIEW ONLY: source tests passed; no production changes');return
    if not healthy():raise RuntimeError('Existing service is unhealthy')
    if digest(LIVE.read_bytes())!=args.expected_live_sha:raise RuntimeError('Concurrent source change')
    hashes_before=grade_hashes()
    if len(hashes_before)!=8:raise RuntimeError('Expected eight gradebook files; verify configured paths first')
    BACKUPS.mkdir(parents=True,exist_ok=True)
    backup=Path(tempfile.mkdtemp(prefix=time.strftime('%Y%m%dT%H%M%SZ-'),dir=BACKUPS))
    shutil.copy2(LIVE,backup/'progress_api.py')
    manifest={'commit':commit,'source':str(LIVE),'before':digest(before),'after':digest(after),'gradebookHashesBefore':hashes_before}
    (backup/'manifest.json').write_text(json.dumps(manifest,indent=2))
    replace_code(after,metadata)
    try:
        subprocess.run(['systemctl','restart','jaralingua-progress-api'],check=True)
        if not healthy():raise RuntimeError('API health check failed')
    except Exception:
        replace_code(before,metadata);subprocess.run(['systemctl','restart','jaralingua-progress-api'],check=True)
        print('Restored previous API code only; backup:',backup);raise
    hashes_after=grade_hashes();manifest.update(gradebookHashesAfter=hashes_after,gradebooksUnchanged=hashes_before==hashes_after)
    (backup/'manifest.json').write_text(json.dumps(manifest,indent=2))
    print(json.dumps({'deployed':True,'backup':str(backup),'health':True,'gradebooksChecked':len(hashes_before),'gradebooksUnchanged':hashes_before==hashes_after}),flush=True)
    if hashes_before!=hashes_after:raise RuntimeError('Gradebook changed concurrently; inspect without overwriting academic data')
if __name__=='__main__':main()
