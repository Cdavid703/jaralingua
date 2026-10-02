"""Create the explicitly approved, isolated Unit 6 commit; preserve unrelated index/worktree edits."""
from pathlib import Path
import ast
import difflib
import os
import subprocess
import tempfile

ROOT=Path(__file__).resolve().parents[1]
PATHS=[
 'assets/css/basic2-unit6-responsive.css','assets/css/basic2-unit6-listening.css',
 'assets/js/basic2-unit6-listening.js',
 'assets/img/english-basic-2/unit-6-fabulous-food/listening-maple-cafe.webp',
 'assets/img/page-qr/ingles-basico-2-audio-listening-unit-6-lunch-at-maple-cafe.svg',
 'ingles/basico-2/audio/unit6/listening/unit-6-lunch-at-maple-cafe.mp3',
 'ingles/basico-2/audio-listening-unit-6-lunch-at-maple-cafe.html',
 'ingles/basico-2/practice-unit-6-countable-uncountable-food.html',
 'ingles/basico-2/practice-unit-6-food-quantities.html',
 'ingles/basico-2/practice-unit-6-containers-portions.html',
 'ingles/basico-2/practice-unit-6-food-vocabulary-memory.html',
 'ingles/basico-2/conversation-coach-unit-6-restaurant.html',
 'ingles/basico-2/practice-lab.html','ingles/basico-2/listening-library.html',
 'server/basic2_unit6_listening.py',
 'docs/basic2-unit6-listening-script.md','docs/basic2-unit6-listening.md','docs/basic2-unit6-responsive-release.md',
 'tools/build_basic2_unit6_practice.cjs','tools/test_basic2_unit6_responsive.cjs',
 'tools/test_basic2_unit6_listening.cjs','tools/test_basic2_unit6_listening_backend.py',
 'tools/test_basic2_unit6_practice.cjs','tools/release_basic2_unit6_listening.py']
SERVER='server/progress_api.py'
def git(*args,data=None,env=None):
 r=subprocess.run(['git',*args],cwd=ROOT,input=data,stdout=subprocess.PIPE,stderr=subprocess.PIPE,env=env,check=True)
 return r.stdout

if __name__=='__main__':
 if '--commit-approved' not in os.sys.argv: raise SystemExit('Use --commit-approved only after explicit publication approval.')
 before=git('rev-parse','HEAD')
 base=git('show','HEAD:'+SERVER).decode('utf-8-sig')
 staged=git('show',':'+SERVER).decode('utf-8-sig')
 working=(ROOT/SERVER).read_text(encoding='utf-8-sig')
 lines=working.splitlines(keepends=True)
 route=next(n for n in ast.walk(ast.parse(working)) if isinstance(n,ast.If) and isinstance(n.test,ast.Compare) and any(isinstance(c,ast.Constant) and c.value=='/api/basic2/unit6-maple-cafe/transcript' for c in n.test.comparators))
 block=''.join(lines[route.lineno-1:route.end_lineno])+'\n'
 anchor='        if parsed.path == "/api/basic2/unit5-my-holidays/transcript":'
 def insert(text):
  assert '/api/basic2/unit6-maple-cafe/transcript' not in text
  assert text.count(anchor)==1
  return text.replace(anchor,block+'\n'+anchor,1)
 next_base=insert(base); next_staged=insert(staged)
 ast.parse(next_base);ast.parse(next_staged)
 (ROOT/'tmp').mkdir(exist_ok=True)
 # Generated deployment patch inserts only the new authenticated route.
 patch=''.join(difflib.unified_diff(base.splitlines(True),next_base.splitlines(True),fromfile=SERVER,tofile=SERVER))
 (ROOT/'tmp/basic2-unit6-transcript-route.patch').write_text(patch,encoding='utf-8',newline='\n')
 with tempfile.TemporaryDirectory(prefix='jaralingua-unit6-index-') as tmp:
  env=dict(os.environ,GIT_INDEX_FILE=str(Path(tmp)/'index'))
  git('read-tree','HEAD',env=env)
  git('add','--',*PATHS,env=env)
  blob=git('hash-object','-w','--stdin',data=next_base.encode()).decode().strip()
  git('update-index','--cacheinfo','100644',blob,SERVER,env=env)
  assert git('rev-parse','HEAD')==before,'HEAD changed during release preparation'
  print(git('commit','-m','Publish Unit 6 listening and responsive fixes for all practices',env=env).decode())
 # Keep all pre-existing staged hunks; add only our route to that index version.
 staged_blob=git('hash-object','-w','--stdin',data=next_staged.encode()).decode().strip()
 git('update-index','--cacheinfo','100644',staged_blob,SERVER)
 git('add','--',*PATHS)
 public=[p for p in PATHS if p.startswith(('assets/','ingles/'))]
 git('archive','--format=tar.gz','--output=tmp/basic2-unit6-release-20260925.tar.gz','HEAD','--',*public,'server/basic2_unit6_listening.py')
 print('Release archive and isolated server patch prepared. Unrelated changes preserved.')
