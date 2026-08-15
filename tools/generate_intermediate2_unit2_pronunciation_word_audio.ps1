param(
  [string]$OutputDirectory = "ingles/intermediate-2/audio/pronunciation/unit-2-intermediate2/words"
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
$words = @(
  "a", "advice", "advise", "and", "answered", "asked", "at", "before", "but", "clear",
  "compromise", "consequences", "crossroads", "decide", "decision", "down", "for", "hand", "hard", "I",
  "I'd", "if", "information", "learned", "me", "more", "need", "opportunity", "or", "out",
  "over", "project", "should've", "step", "that", "the", "think", "to", "turned", "up",
  "way", "weighed", "were", "wish", "worked", "would", "you"
)

$absoluteOutput = Join-Path $root $OutputDirectory
New-Item -ItemType Directory -Force -Path $absoluteOutput | Out-Null
$headers = @{ "xi-api-key" = $apiKey; Accept = "audio/mpeg" }

foreach ($word in $words) {
  $slug = ($word.ToLowerInvariant() -replace "[^a-z0-9]", "")
  $output = Join-Path $absoluteOutput "$slug.mp3"
  $payload = @{
    text = $word
    model_id = "eleven_multilingual_v2"
    voice_settings = @{ stability = 0.5; similarity_boost = 0.75; style = 0.1; use_speaker_boost = $true }
  } | ConvertTo-Json -Depth 4 -Compress

  Write-Host "Generating ElevenLabs word model: $word"
  Invoke-WebRequest -Method Post -Uri "https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128" -Headers $headers -ContentType "application/json" -Body $payload -OutFile $output
  if ((Get-Item -LiteralPath $output).Length -lt 1000) { throw "Generated audio is unexpectedly small for '$word'." }
}

Write-Host "Generated $($words.Count) ElevenLabs word models in $absoluteOutput"
