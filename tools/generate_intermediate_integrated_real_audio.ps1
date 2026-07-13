param(
  [switch]$Overwrite
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $root "elevenlabs.local.env"
$source = Join-Path $root "ingles\intermediate\audio\integrated-task\intermediate-integrated-task-real-script.md"
$cast = Join-Path $root "tools\elevenlabs_voice_cast.intermediate-integrated-real.json"
$outputDir = Join-Path $root "server\private_assets"
$output = Join-Path $outputDir "intermediate-integrated-task-real-us.mp3"

if (-not (Test-Path -LiteralPath $envFile)) {
  throw "Missing elevenlabs.local.env"
}

if ((Test-Path -LiteralPath $output) -and -not $Overwrite) {
  Write-Output ("SKIPPED " + (Resolve-Path -LiteralPath $output).Path)
  return
}

New-Item -ItemType Directory -Force -Path $outputDir | Out-Null

$command = @(
  "tools\elevenlabs_generate_listenings.py",
  "--source", $source,
  "--out-dir", $outputDir,
  "--only", "intermediate-integrated-task-real-us.mp3",
  "--voice-cast", $cast,
  "--language-profile", "english-us",
  "--mode", "dialogue",
  "--verbose"
)

if ($Overwrite) {
  $command += "--overwrite"
}

python @command
