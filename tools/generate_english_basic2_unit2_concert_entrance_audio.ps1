$root = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $root "elevenlabs.local.env"
$voiceCast = Join-Path $root "tools\elevenlabs_voice_cast.basic-integrated.json"
$source = Join-Path $root "ingles\basico-2\audio\unit2\listening\at-the-concert-entrance-scripts.md"
$outDir = Join-Path $root "ingles\basico-2\audio\unit2\listening"

if (-not (Test-Path -LiteralPath $envFile)) {
  throw "Missing elevenlabs.local.env"
}

Set-Location $root
python "tools\elevenlabs_generate_listenings.py" `
  --source $source `
  --out-dir $outDir `
  --language-profile english-us `
  --voice-cast $voiceCast `
  --mode dialogue `
  --overwrite `
  --verbose
