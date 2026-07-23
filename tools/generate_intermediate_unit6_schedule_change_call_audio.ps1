param(
  [switch]$Overwrite
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$source = Join-Path $root "ingles\intermediate\audio\unit-6-schedule-change-call-scripts.md"
$cast = Join-Path $root "tools\elevenlabs_voice_cast.intermediate-unit6-explanation.json"

if (-not (Test-Path -LiteralPath (Join-Path $root "elevenlabs.local.env"))) {
  throw "Missing elevenlabs.local.env"
}

$command = @(
  "tools\elevenlabs_generate_listenings.py",
  "--source", $source,
  "--voice-cast", $cast,
  "--language-profile", "english-us",
  "--mode", "dialogue",
  "--verbose",
  "--transport", "node",
  "--node-use-system-ca"
)

if ($Overwrite) {
  $command += "--overwrite"
}

python @command
