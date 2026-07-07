param(
  [switch]$Overwrite
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $root "elevenlabs.local.env"
$quizPath = Join-Path $root "data\french8-quiz-ville-intelligente.local.json"
$output = Join-Path $root "server\private_assets\french8-quiz-ville-intelligente-energie-batiments.mp3"

if (-not (Test-Path -LiteralPath $envFile)) {
  throw "Missing elevenlabs.local.env"
}
if (-not (Test-Path -LiteralPath $quizPath)) {
  throw "Missing quiz data: $quizPath"
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

$quiz = Get-Content -LiteralPath $quizPath -Raw | ConvertFrom-Json
$text = [string]$quiz.exam.listeningTranscript
if ([string]::IsNullOrWhiteSpace($text)) {
  throw "Quiz listening transcript is empty"
}

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
    style = 0.12
    use_speaker_boost = $true
  }
} | ConvertTo-Json -Depth 4

Invoke-WebRequest -Uri $uri -Method Post -Headers $headers -ContentType "application/json" -Body $body -OutFile $output
Write-Output ("CREATED " + (Resolve-Path -LiteralPath $output).Path)
