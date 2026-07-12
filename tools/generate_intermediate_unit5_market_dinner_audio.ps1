param(
  [switch]$Overwrite
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $root "elevenlabs.local.env"
$source = Join-Path $root "ingles\intermediate\audio\listening-scripts-intermediate-course-1.md"
$cast = Join-Path $root "tools\elevenlabs_voice_cast.intermediate-unit5.json"
$output = Join-Path $root "ingles\intermediate\audio\unit-5-market-dinner-plan.mp3"

if (-not (Test-Path -LiteralPath $envFile)) {
  throw "Missing elevenlabs.local.env"
}

if ((Test-Path -LiteralPath $output) -and -not $Overwrite) {
  Write-Output ("SKIPPED " + (Resolve-Path -LiteralPath $output).Path)
  return
}

$settings = @{}
Get-Content -LiteralPath $envFile | ForEach-Object {
  if ($_ -match '^\s*([^#=]+)=(.*)$') {
    $settings[$matches[1].Trim()] = $matches[2].Trim()
  }
}

$command = @(
  "tools\elevenlabs_generate_listenings.py",
  "--source", $source,
  "--only", "unit-5-market-dinner-plan.mp3",
  "--voice-cast", $cast,
  "--language-profile", "english-us",
  "--mode", "dialogue",
  "--verbose"
)

if ($Overwrite) {
  $command += "--overwrite"
}

python @command
