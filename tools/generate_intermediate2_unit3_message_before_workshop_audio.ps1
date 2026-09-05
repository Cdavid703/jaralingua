param(
  [switch]$Overwrite,
  [switch]$DryRun
)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
$source = Join-Path $projectRoot "ingles\intermediate-2\audio\unit-3\listening-scripts.md"
$cast = Join-Path $projectRoot "tools\elevenlabs_voice_cast.intermediate2-unit3-listening.json"
$envFile = Join-Path $projectRoot "elevenlabs.local.env"

if (-not (Test-Path -LiteralPath $envFile)) { throw "Missing elevenlabs.local.env" }

$command = @(
  "tools\elevenlabs_generate_listenings.py",
  "--source", $source,
  "--only", "the-message-before-the-workshop.mp3",
  "--voice-cast", $cast,
  "--language-profile", "english-us",
  "--mode", "dialogue",
  "--output-format", "mp3_44100_128",
  "--seed", "3050926",
  "--verbose",
  "--transport", "node",
  "--node-use-system-ca"
)

if ($DryRun) { $command += "--dry-run" }
if ($Overwrite) { $command += "--overwrite" }

python @command
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
