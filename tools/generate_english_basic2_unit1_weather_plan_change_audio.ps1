param(
  [switch]$Overwrite
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$scriptPath = Join-Path $root "ingles\basico-2\audio\unit1\listening\weather-plan-change-scripts.md"
$cast = Join-Path $root "tools\elevenlabs_voice_cast.basic-integrated.json"

$argsList = @(
  "tools\elevenlabs_generate_listenings.py",
  "--source", $scriptPath,
  "--voice-cast", $cast,
  "--language-profile", "english-us",
  "--mode", "dialogue",
  "--only", "weather-plan-change-listening.mp3",
  "--verbose"
)

if ($Overwrite) {
  $argsList += "--overwrite"
}

python @argsList
