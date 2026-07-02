param(
  [switch]$Overwrite
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $root "elevenlabs.local.env"
$audioRoot = Join-Path $root "ingles\basico\audio\integrated-task"
$scriptPath = Join-Path $audioRoot "basic-integrated-task-andres-munoz-retake-script.md"
$outputPath = Join-Path $audioRoot "basic-integrated-task-andres-munoz-retake.mp3"
$voiceId = "EXAVITQu4vr4xnSDxMaL"

if (-not (Test-Path -LiteralPath $envFile)) {
  throw "Missing elevenlabs.local.env"
}

if (-not (Test-Path -LiteralPath $scriptPath)) {
  throw "Missing retake audio script: $scriptPath"
}

if ((Test-Path -LiteralPath $outputPath) -and -not $Overwrite) {
  Write-Output "SKIPPED $outputPath"
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

$lines = Get-Content -LiteralPath $scriptPath
$text = (($lines | Where-Object { $_ -and $_ -notmatch '^\s*#' -and $_ -notmatch '^File:' }) -join ' ').Trim()
if ([string]::IsNullOrWhiteSpace($text)) {
  throw "The retake audio script is empty"
}

$headers = @{
  "xi-api-key" = $apiKey
  "Accept" = "audio/mpeg"
}
$uri = "https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128"
$body = @{
  text = $text
  model_id = "eleven_multilingual_v2"
  language_code = "en"
  voice_settings = @{
    stability = 0.64
    similarity_boost = 0.82
    style = 0.14
    use_speaker_boost = $true
  }
} | ConvertTo-Json -Depth 4

Invoke-WebRequest -Uri $uri -Method Post -Headers $headers -ContentType "application/json" -Body $body -OutFile $outputPath
Write-Output ("CREATED " + (Resolve-Path -LiteralPath $outputPath).Path)
