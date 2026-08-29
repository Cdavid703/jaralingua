param(
  [string]$OutputDirectory = "ingles/intermediate-2/audio/pronunciation/unit-3-intermediate2/words"
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $root "elevenlabs.local.env"
if (-not (Test-Path -LiteralPath $envFile)) { throw "Missing ElevenLabs local environment file." }

$apiKey = $null
Get-Content -LiteralPath $envFile | ForEach-Object {
  if ($_ -match '^\s*ELEVENLABS_API_KEY\s*=\s*(.+?)\s*$') {
    $apiKey = $Matches[1].Trim().Trim('"').Trim("'")
  }
}
if ([string]::IsNullOrWhiteSpace($apiKey)) { throw "ELEVENLABS_API_KEY is not configured." }

$voiceId = "EXAVITQu4vr4xnSDxMaL"
$finalText = "My screen keeps freezing, and the app crashes whenever I connect to the network. Could you tell me where the settings are and whether the update is available? First, hook up the monitor, look up the error code, and turn the volume down. Identity theft is a serious security risk, so if a suspicious message asks for sensitive information, you mustn't share your password."
$words = @([regex]::Matches($finalText, "[A-Za-z]+(?:'[A-Za-z]+)?") | ForEach-Object { $_.Value } | Sort-Object -Unique)

$absoluteOutput = Join-Path $root $OutputDirectory
New-Item -ItemType Directory -Force -Path $absoluteOutput | Out-Null
$headers = @{ "xi-api-key" = $apiKey; Accept = "audio/mpeg" }

foreach ($word in $words) {
  $slug = ($word.ToLowerInvariant() -replace "[^a-z0-9]", "")
  $output = Join-Path $absoluteOutput "$slug.mp3"
  $payload = @{
    text = $word
    model_id = "eleven_multilingual_v2"
    language_code = "en"
    voice_settings = @{ stability = 0.5; similarity_boost = 0.75; style = 0.1; use_speaker_boost = $true }
  } | ConvertTo-Json -Depth 4 -Compress

  Write-Host "Generating ElevenLabs word model: $word"
  Invoke-WebRequest -Method Post -Uri "https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128" -Headers $headers -ContentType "application/json" -Body $payload -OutFile $output
  if ((Get-Item -LiteralPath $output).Length -lt 1000) { throw "Generated audio is unexpectedly small for '$word'." }
}

Write-Host "Generated $($words.Count) ElevenLabs word models in $absoluteOutput"

