"""Use the established ElevenLabs generator; never print credentials."""
import sys
from pathlib import Path
import elevenlabs_generate_listenings as generator

generator.load_local_env(Path('D:/Jaralingua/elevenlabs.local.env'))
extra=sys.argv[1:]
sys.argv=[sys.argv[0],'--source','docs/audio/basic2-unit6-maple-cafe-scripts.md','--out-dir','ingles/basico-2/audio/unit6/maple-cafe','--language-profile','english-us','--voice-cast','tools/elevenlabs_voice_cast.basic2-unit6.json','--mode','dialogue','--transport','node','--node-bin',r'C:/Users/USER/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe','--seed','6031']
sys.argv.extend(extra)
raise SystemExit(generator.main())
