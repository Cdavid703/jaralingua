param(
  [switch]$Overwrite,
  [switch]$DryRun
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$source = Join-Path $root "ingles\intermediate-2\audio\unit-2\listening-scripts.md"
$cast = Join-Path $root "tools\elevenlabs_voice_cast.intermediate2-unit2-listening.json"
$envFile = Join-Path $root "elevenlabs.local.env"

if (-not (Test-Path -LiteralPath $envFile)) {
  throw "Missing elevenlabs.local.env"
}

$command = @(
  "tools\elevenlabs_generate_listenings.py",
  "--source", $source,
  "--only", "the-call-before-midnight.mp3",
  "--voice-cast", $cast,
  "--language-profile", "english-us",
  "--mode", "dialogue",
  "--output-format", "mp3_44100_128",
  "--seed", "220826",
  "--verbose",
  "--transport", "node",
  "--node-use-system-ca"
)

if ($DryRun) {
  $command += "--dry-run"
}

if ($Overwrite) {
  $command += "--overwrite"
}

python @command

if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}
