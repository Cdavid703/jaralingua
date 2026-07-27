$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$source = Join-Path $root "ingles\basico-2\audio\unit1\conversation-coach\mia-weather-going-out-scripts.md"
$voiceCast = Join-Path $root "tools\elevenlabs_voice_cast.basic2-mia.json"

python (Join-Path $root "tools\elevenlabs_generate_listenings.py") `
  --source $source `
  --voice-cast $voiceCast `
  --language-profile english-us `
  --mode tts `
  @args
