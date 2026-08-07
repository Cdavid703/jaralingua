param(
  [switch]$Overwrite,
  [switch]$DryRun
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$source = Join-Path $root "ingles\intermediate-2\audio\unit-1-saturday-table-listening-scripts.md"
$cast = Join-Path $root "tools\elevenlabs_voice_cast.intermediate2-unit1.json"
$envFile = Join-Path $root "elevenlabs.local.env"

if (-not (Test-Path -LiteralPath $envFile)) {
  throw "Missing elevenlabs.local.env"
}

$command = @(
  "tools\elevenlabs_generate_listenings.py",
  "--source", $source,
  "--only", "noras-voice-note-after-the-saturday-table.mp3",
  "--voice-cast", $cast,
  "--language-profile", "english-us",
  "--mode", "tts",
  "--speed", "0.83",
  "--stability", "0.50",
  "--similarity-boost", "0.75",
  "--output-format", "mp3_44100_128",
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
