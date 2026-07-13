param(
  [switch]$Overwrite
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $root "elevenlabs.local.env"
$source = Join-Path $root "ingles\intermediate\audio\integrated-task\intermediate-mock-integrated-task-script.md"
$cast = Join-Path $root "tools\elevenlabs_voice_cast.intermediate-integrated-mock.json"
$outputDir = Join-Path $root "ingles\intermediate\audio\integrated-task"
$output = Join-Path $outputDir "intermediate-mock-integrated-task-us.mp3"

if (-not (Test-Path -LiteralPath $envFile)) {
  throw "Missing elevenlabs.local.env"
}

if ((Test-Path -LiteralPath $output) -and -not $Overwrite) {
  Write-Output ("SKIPPED " + (Resolve-Path -LiteralPath $output).Path)
  return
}

$command = @(
  "tools\elevenlabs_generate_listenings.py",
  "--source", $source,
  "--out-dir", $outputDir,
  "--only", "intermediate-mock-integrated-task-us.mp3",
  "--voice-cast", $cast,
  "--language-profile", "english-us",
  "--mode", "dialogue",
  "--verbose"
)

if ($Overwrite) {
  $command += "--overwrite"
}

python @command
