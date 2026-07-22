param(
  [switch]$Overwrite
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $root "elevenlabs.local.env"
$source = Join-Path $root "ingles\intermediate\audio\unit-6-explanation-scripts.md"
$cast = Join-Path $root "tools\elevenlabs_voice_cast.intermediate-unit6-explanation.json"

if (-not (Test-Path -LiteralPath $envFile)) {
  throw "Missing elevenlabs.local.env"
}

if (-not (Test-Path -LiteralPath $source)) {
  throw "Missing Unit 6 explanation scripts"
}

$command = @(
  "tools\elevenlabs_generate_listenings.py",
  "--source", $source,
  "--voice-cast", $cast,
  "--language-profile", "english-us",
  "--mode", "auto",
  "--verbose"
)

if ($Overwrite) {
  $command += "--overwrite"
}

python @command
