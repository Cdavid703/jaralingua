param(
  [switch]$Overwrite
)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $projectRoot "elevenlabs.local.env"
$examPath = Join-Path $projectRoot "data\french8-final-exam.local.json"
$output = Join-Path $projectRoot "server\private_assets\french8-final-exam-audio.mp3"

if (-not (Test-Path -LiteralPath $envFile)) {
  throw "Missing elevenlabs.local.env"
}
if (-not (Test-Path -LiteralPath $examPath)) {
  throw "Missing exam data: $examPath"
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
  $settings["ELEVENLABS_VOICE_POOL_FR_FR_MALE"],
  $settings["ELEVENLABS_VOICE_POOL_FR_FR_NEUTRAL"],
  $settings["ELEVENLABS_VOICE_ID"],
  "aQROLel5sQbj1vuIVi6B"
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
  throw "No professional French narrator voice is configured"
}

$exam = Get-Content -LiteralPath $examPath -Raw -Encoding UTF8 | ConvertFrom-Json
$text = [string]$exam.exam.transcript
if ([string]::IsNullOrWhiteSpace($text)) {
  throw "Final-exam listening transcript is empty"
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
    stability = 0.66
    similarity_boost = 0.84
    style = 0.16
    use_speaker_boost = $true
    speed = 0.95
  }
} | ConvertTo-Json -Depth 4
$bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($body)

Invoke-WebRequest -Uri $uri -Method Post -Headers $headers -ContentType "application/json; charset=utf-8" -Body $bodyBytes -OutFile $output
Write-Output ("CREATED " + (Resolve-Path -LiteralPath $output).Path)
