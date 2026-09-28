"""Scoped, approved commit and deploy. Preserve unrelated index and live changes."""
import argparse
import ast
import hashlib
import io
import json
import os
from pathlib import Path
import shutil
import subprocess
import tarfile
import tempfile
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[1]
SERVER = 'server/progress_api.py'
CATALOG = 'ingles/basico-2/evaluations.html'
FILES = [
    'assets/css/basic2-final-postcard.css', 'assets/js/basic2-final-postcard.js',
    'assets/img/page-qr/ingles-basico-2-basic-course-2-final-writing-task.svg',
    'ingles/basico-2/basic-course-2-final-writing-task.html',
    'server/basic2_final_postcard.py', 'docs/basic2-final-writing-postcard.md',
    'tools/test_basic2_final_postcard.py', 'tools/test_basic2_final_postcard_ui.cjs',
    'tools/prepare_basic2_final_postcard_qr.py', 'tools/release_basic2_final_postcard.py',
]


def add_hooks(text):
    text = text.replace('\r\n', '\n')
    for suffix in ('', ', payload'):
        anchor = f'        if handle_basic2_integrated(self, profile, parsed, globals(){suffix}):\n            return\n'
        block = ('        from basic2_final_postcard import handle as handle_basic2_final_postcard\n'
                 f'        if handle_basic2_final_postcard(self, profile, parsed, globals(){suffix}):\n            return\n')
        if block not in text:
            assert text.count(anchor) == 1, 'Missing/ambiguous authenticated route anchor'
            text = text.replace(anchor, anchor + block, 1)
    anchor = '                basic2_changed = ensure_basic2_gradebook_structure(grades_data)\n'
    block = ('                try:\n'
             '                    from basic2_final_postcard import reconcile as reconcile_basic2_final_postcard\n'
             '                    if reconcile_basic2_final_postcard(globals(), grades_data):\n'
             '                        basic2_changed = True\n'
             '                except Exception as error:\n'
             '                    print("Basic 2 postcard reconciliation:", type(error).__name__, flush=True)\n')
    if block not in text:
        assert text.count(anchor) == 1, 'Missing/ambiguous gradebook anchor'
        text = text.replace(anchor, anchor + block, 1)
    ast.parse(text)
    return text


def git(*args, data=None, env=None):
    return subprocess.run(['git', *args], cwd=ROOT, input=data, stdout=subprocess.PIPE,
                          stderr=subprocess.PIPE, env=env, check=True).stdout


def commit():
    head = git('rev-parse', 'HEAD')
    base = git('show', 'HEAD:' + SERVER).decode('utf-8-sig')
    staged = git('show', ':' + SERVER).decode('utf-8-sig')
    (ROOT/'tmp/basic2-final-postcard').mkdir(parents=True, exist_ok=True)
    shutil.copy2(ROOT/'.git/index', ROOT/'tmp/basic2-final-postcard/index-before-release')
    with tempfile.TemporaryDirectory(prefix='jaralingua-postcard-index-') as tmp:
        env = dict(os.environ, GIT_INDEX_FILE=str(Path(tmp)/'index'))
        hooks = Path(tmp)/'empty-hooks'; hooks.mkdir()
        git('read-tree', 'HEAD', env=env)
        git('add', '--', *FILES, CATALOG, env=env)
        blob = git('hash-object', '-w', '--stdin', data=add_hooks(base).encode()).decode().strip()
        git('update-index', '--cacheinfo', '100644', blob, SERVER, env=env)
        names = set(git('diff', '--cached', '--name-only', env=env).decode().splitlines())
        assert names == set(FILES + [CATALOG, SERVER]), names
        assert git('rev-parse', 'HEAD') == head, 'HEAD changed during preparation'
        print(git('-c', 'core.hooksPath='+str(hooks), 'commit', '-m',
                  'Add Basic 2 final group postcard writing exam with individual grading', env=env).decode())
    blob = git('hash-object', '-w', '--stdin', data=add_hooks(staged).encode()).decode().strip()
    git('update-index', '--cacheinfo', '100644', blob, SERVER)
    git('add', '--', *FILES, CATALOG)
    output = ROOT/'tmp/basic2-final-postcard/release.tar.gz'
    git('archive', '--format=tar.gz', '--output='+str(output), 'HEAD', '--', *FILES, CATALOG)
    print('Commit:', git('rev-parse', 'HEAD').decode().strip())
    print('Archive:', output)


def deploy(archive):
    root = Path('/var/www/jaralingua.com')
    assert root.is_dir() and os.name != 'nt'
    with tarfile.open(archive, 'r:gz') as tar:
        content = {}
        for member in tar.getmembers():
            if member.isdir():
                continue
            assert member.isfile() and member.name in FILES + [CATALOG], member.name
            content[member.name] = tar.extractfile(member).read()
    assert set(content) == set(FILES + [CATALOG])
    api = add_hooks((root/SERVER).read_text(encoding='utf-8-sig'))
    catalog = (root/CATALOG).read_text(encoding='utf-8-sig')
    card = next(line for line in content[CATALOG].decode().splitlines() if 'href="basic-course-2-final-writing-task.html"' in line)
    if 'href="basic-course-2-final-writing-task.html"' not in catalog:
        anchor = '    <section class="course-dashboard" id="evaluation-sections">'
        assert catalog.count(anchor) == 1
        catalog = catalog.replace(anchor, anchor+'\n'+card, 1)
    updates = {p: v for p,v in content.items() if p.startswith(('assets/', 'ingles/', 'server/')) and p != CATALOG}
    updates.update({SERVER:api.encode(), CATALOG:catalog.encode()})
    for name, data in updates.items():
        if name.endswith('.py'):
            ast.parse(data.decode('utf-8-sig'))
    stamp = datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')
    backup = Path('/var/backups/jaralingua')/('basic2-final-postcard-'+stamp)
    backup.mkdir(parents=True, exist_ok=False)
    previous = {}
    for name in updates:
        target = root/name
        previous[name] = target.exists()
        if target.exists():
            saved = backup/name; saved.parent.mkdir(parents=True, exist_ok=True); shutil.copy2(target, saved)
    (backup/'manifest.json').write_text(json.dumps(previous, indent=2))
    for name,data in updates.items():
        target=root/name; target.parent.mkdir(parents=True, exist_ok=True)
        temporary=target.with_name(target.name+'.postcard-release-tmp')
        temporary.write_bytes(data); temporary.chmod(target.stat().st_mode & 0o777 if target.exists() else 0o644)
        os.replace(temporary,target)
    subprocess.run(['python3','-m','py_compile',str(root/SERVER),str(root/'server/basic2_final_postcard.py')],check=True)
    subprocess.run(['systemctl','restart','jaralingua-progress-api'],check=True)
    subprocess.run(['systemctl','is-active','--quiet','jaralingua-progress-api'],check=True)
    print('DEPLOYED; backup:',backup)
    print('File hashes:',json.dumps({p:hashlib.sha256(v).hexdigest() for p,v in updates.items()}))


if __name__ == '__main__':
    parser=argparse.ArgumentParser(); parser.add_argument('--commit-approved',action='store_true'); parser.add_argument('--deploy-archive')
    args=parser.parse_args()
    if args.commit_approved: commit()
    elif args.deploy_archive: deploy(args.deploy_archive)
    else: parser.error('Use the explicitly authorized release operation.')
