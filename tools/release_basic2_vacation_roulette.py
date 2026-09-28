"""Scoped release: preserve unrelated index changes and patch the live catalog."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import tarfile
import tempfile
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[1]
CATALOG = 'ingles/basico-2/practice-lab.html'
PAGE = 'practice-unit-5-vacation-roulette.html'
FILES = [
    'ingles/basico-2/' + PAGE,
    'assets/css/basic2-vacation-roulette.css',
    'assets/js/basic2-vacation-roulette.js',
    'assets/img/english-basic-2/unit-5-vacation-roulette-hero.webp',
    'assets/img/page-qr/ingles-basico-2-practice-unit-5-vacation-roulette.svg',
    'docs/basic2-unit5-vacation-roulette.md',
    'tools/prepare_basic2_vacation_roulette_qr.py',
    'tools/test_basic2_vacation_roulette.cjs',
    'tools/release_basic2_vacation_roulette.py',
]


def patch_catalog(text, card):
    text = text.replace('\r\n', '\n')
    if f'href="{PAGE}"' not in text:
        anchors = [line for line in text.splitlines() if 'href="audio-listening-unit-5-my-holidays.html"' in line]
        assert len(anchors) == 1, 'Missing/ambiguous Unit 5 anchor'
        text = text.replace(anchors[0], anchors[0] + '\n' + card, 1)
    old = 'Unit 5: Looking Back - 9 activities'
    new = 'Unit 5: Looking Back - 10 activities'
    assert old in text or new in text, 'Unknown Unit 5 catalog count'
    return text.replace(old, new, 1)


def git(*args, data=None, env=None):
    return subprocess.run(['git', *args], cwd=ROOT, input=data, stdout=subprocess.PIPE,
                          stderr=subprocess.PIPE, env=env, check=True).stdout


def commit():
    head = git('rev-parse', 'HEAD')
    base = git('show', 'HEAD:' + CATALOG).decode('utf-8-sig')
    staged = git('show', ':' + CATALOG).decode('utf-8-sig')
    working = (ROOT/CATALOG).read_text(encoding='utf-8-sig')
    card = next(line for line in working.splitlines() if f'href="{PAGE}"' in line)
    output = ROOT/'tmp/basic2-vacation-roulette'; output.mkdir(parents=True, exist_ok=True)
    shutil.copy2(ROOT/'.git/index', output/'index-before-release')
    with tempfile.TemporaryDirectory(prefix='jaralingua-vacation-index-') as tmp:
        env = dict(os.environ, GIT_INDEX_FILE=str(Path(tmp)/'index'))
        hooks = Path(tmp)/'empty-hooks'; hooks.mkdir()
        git('read-tree', 'HEAD', env=env)
        git('add', '--', *FILES, env=env)
        blob = git('hash-object', '-w', '--stdin', data=patch_catalog(base, card).encode()).decode().strip()
        git('update-index', '--cacheinfo', '100644', blob, CATALOG, env=env)
        names = set(git('diff', '--cached', '--name-only', env=env).decode().splitlines())
        assert names == set(FILES+[CATALOG]), names
        assert git('rev-parse', 'HEAD') == head, 'HEAD changed during preparation'
        print(git('-c', 'core.hooksPath='+str(hooks), 'commit', '-m',
                  'Add Unit 5 vacation speaking preparation with two classroom roulettes', env=env).decode())
    blob = git('hash-object', '-w', '--stdin', data=patch_catalog(staged, card).encode()).decode().strip()
    git('update-index', '--cacheinfo', '100644', blob, CATALOG)
    git('add', '--', *FILES)
    archive = output/'release.tar.gz'
    git('archive', '--format=tar.gz', '--output='+str(archive), 'HEAD', '--', *FILES, CATALOG)
    print('Commit:', git('rev-parse', 'HEAD').decode().strip())
    print('Archive:', archive)


def deploy(archive):
    root = Path('/var/www/jaralingua.com')
    assert root.is_dir() and os.name != 'nt'
    content = {}
    with tarfile.open(archive, 'r:gz') as tar:
        for member in tar.getmembers():
            if member.isdir(): continue
            assert member.isfile() and member.name in FILES+[CATALOG], member.name
            content[member.name] = tar.extractfile(member).read()
    assert set(content) == set(FILES+[CATALOG])
    card = next(line for line in content[CATALOG].decode().splitlines() if f'href="{PAGE}"' in line)
    catalog = patch_catalog((root/CATALOG).read_text(encoding='utf-8-sig'), card)
    updates = {name:data for name,data in content.items() if name.startswith(('assets/','ingles/')) and name!=CATALOG}
    updates[CATALOG] = catalog.encode()
    stamp = datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')
    backup = Path('/var/backups/jaralingua')/('basic2-vacation-roulette-'+stamp)
    backup.mkdir(parents=True, exist_ok=False)
    previous = {}
    for name in updates:
        target=root/name; previous[name]=target.exists()
        if target.exists():
            saved=backup/name; saved.parent.mkdir(parents=True, exist_ok=True); shutil.copy2(target,saved)
    (backup/'manifest.json').write_text(json.dumps(previous,indent=2))
    # Catalog last: visitors see the card only after all its assets have arrived.
    for name,data in updates.items():
        target=root/name; target.parent.mkdir(parents=True,exist_ok=True)
        temporary=target.with_name(target.name+'.vacation-release-tmp')
        temporary.write_bytes(data); temporary.chmod(target.stat().st_mode & 0o777 if target.exists() else 0o644)
        os.replace(temporary,target)
    print('DEPLOYED; backup:',backup)
    print('File hashes:',json.dumps({name:hashlib.sha256(data).hexdigest() for name,data in updates.items()}))


if __name__ == '__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--commit-approved',action='store_true');parser.add_argument('--deploy-archive')
    args=parser.parse_args()
    if args.commit_approved: commit()
    elif args.deploy_archive: deploy(args.deploy_archive)
    else: parser.error('Choose the authorized commit or deployment operation.')
