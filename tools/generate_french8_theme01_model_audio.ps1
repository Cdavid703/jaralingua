param(
  [switch]$Overwrite
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $root "elevenlabs.local.env"
$output = Join-Path $root "frances\Niveau 8\audio\modeles\theme-01-bilan-regret-modele.mp3"

if (-not (Test-Path -LiteralPath $envFile)) {
  throw "Missing elevenlabs.local.env"
}
if ((Test-Path -LiteralPath $output) -and -not $Overwrite) {
  Write-Output ("SKIPPED " + (Resolve-Path -LiteralPath $output).Path)
  exit 0
}

$settings = @{}
Get-Content -LiteralPath $envFile | ForEach-Object {
  if ($_ -match '^\s*([^#=]+)=(.*)$') {
    $settings[$matches[1].Trim()] = $matches[2].Trim()
  }
}

$apiKey = $settings["ELEVENLABS_API_KEY"]
if ([string]::IsNullOrWhiteSpace($apiKey) -or $apiKey -eq "put_your_api_key_here") {
  throw "ELEVENLABS_API_KEY is not configured"
}

$voiceCandidates = @(
  $settings["ELEVENLABS_VOICE_NARRATOR"],
  $settings["ELEVENLABS_VOICE_POOL_FR_FR_NEUTRAL"],
  $settings["ELEVENLABS_VOICE_POOL_FR_FR_FEMALE"],
  $settings["ELEVENLABS_VOICE_ID"],
  "JvD1a0L9rABccms2q9zH"
)
$voiceId = ""
foreach ($candidate in $voiceCandidates) {
  if ([string]::IsNullOrWhiteSpace($candidate)) { continue }
  $first = ($candidate -split ",")[0].Trim()
  if ($first -and $first -notmatch "^put_") {
    $voiceId = $first
    break
  }
}
if ([string]::IsNullOrWhiteSpace($voiceId)) {
  throw "No French/Narrator ElevenLabs voice is configured"
}

$text = "Avec le recul, je pense que nous aurions dû préparer le projet plus calmement. Nous avions de bonnes idées, mais nous avons voulu tout faire en même temps. Il aurait fallu choisir deux priorités, demander de l'aide plus tôt et mieux expliquer les rôles de chaque personne. Nous aurions pu éviter une partie du stress si la communication avait été plus claire. Je ne veux pas accuser quelqu'un en particulier, parce que l'équipe a beaucoup travaillé. Mais ce bilan nous montre une chose importante : un échec peut devenir utile si l'on comprend ce qui aurait été préférable et si l'on change vraiment la prochaine fois."

New-Item -ItemType Directory -Path (Split-Path -Parent $output) -Force | Out-Null

$headers = @{
  "xi-api-key" = $apiKey
  "Accept" = "audio/mpeg"
}
$modelId = if ($settings["ELEVENLABS_MODEL_ID"]) { $settings["ELEVENLABS_MODEL_ID"] } else { "eleven_multilingual_v2" }
$format = if ($settings["ELEVENLABS_OUTPUT_FORMAT"]) { $settings["ELEVENLABS_OUTPUT_FORMAT"] } else { "mp3_44100_128" }
$uri = "https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=${format}"
$body = @{
  text = $text
  model_id = $modelId
  language_code = "fr"
  voice_settings = @{
    stability = 0.68
    similarity_boost = 0.84
    style = 0.10
    use_speaker_boost = $true
  }
} | ConvertTo-Json -Depth 4

Invoke-WebRequest -Uri $uri -Method Post -Headers $headers -ContentType "application/json" -Body $body -OutFile $output
Write-Output ("CREATED " + (Resolve-Path -LiteralPath $output).Path)
