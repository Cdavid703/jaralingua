param(
  [string]$EnvFile = "elevenlabs.local.env",
  [string]$OutputDirectory = "ingles/intermediate-2/audio/pronunciation/unit-2-intermediate2"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $EnvFile)) {
  throw "ElevenLabs environment file not found: $EnvFile"
}

Get-Content -LiteralPath $EnvFile | ForEach-Object {
  if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
    $name = $matches[1].Trim()
    $value = $matches[2].Trim().Trim('"').Trim("'")
    if ($name) { Set-Item -Path "Env:$name" -Value $value }
  }
}

if (-not $env:ELEVENLABS_API_KEY) {
  throw "ELEVENLABS_API_KEY is missing from $EnvFile"
}

$voiceId = "EXAVITQu4vr4xnSDxMaL"
$endpoint = "https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128"
$headers = @{ "xi-api-key" = $env:ELEVENLABS_API_KEY; Accept = "audio/mpeg" }
$settings = @{ stability = 0.64; similarity_boost = 0.82; style = 0.14; use_speaker_boost = $true }
$models = @(
  @{ File = "section-1.mp3"; Text = "If I were at a crossroads, I'd think the decision over before I answered." },
  @{ File = "section-2.mp3"; Text = "I wish I'd asked for more information before I turned that opportunity down." },
  @{ File = "section-3.mp3"; Text = "I should've weighed the consequences and worked out a compromise, but I learned the hard way." },
  @{ File = "section-4.mp3"; Text = "Would you advise me to step up or hand the project over? I need clear advice before I decide." },
  @{ File = "the-choice-id-make-differently-model-us.mp3"; Text = "If I were at a crossroads, I'd think the decision over before I answered. I wish I'd asked for more information before I turned that opportunity down. I should've weighed the consequences and worked out a compromise, but I learned the hard way. Would you advise me to step up or hand the project over? I need clear advice before I decide." }
)

New-Item -ItemType Directory -Path $OutputDirectory -Force | Out-Null

foreach ($model in $models) {
  $payload = @{
    text = $model.Text
    model_id = "eleven_multilingual_v2"
    language_code = "en"
    voice_settings = $settings
  } | ConvertTo-Json -Depth 4
  $destination = Join-Path $OutputDirectory $model.File
  Invoke-WebRequest -Method Post -Uri $endpoint -Headers $headers -ContentType "application/json" -Body $payload -OutFile $destination
  Write-Output "Generated $destination"
}
