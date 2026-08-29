param(
  [string]$EnvFile = "elevenlabs.local.env",
  [string]$OutputDirectory = "ingles/intermediate-2/audio/pronunciation/unit-3-intermediate2"
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
  @{ File = "section-1.mp3"; Text = "My screen keeps freezing, and the app crashes whenever I connect to the network." },
  @{ File = "section-2.mp3"; Text = "Could you tell me where the settings are and whether the update is available?" },
  @{ File = "section-3.mp3"; Text = "First, hook up the monitor, look up the error code, and turn the volume down." },
  @{ File = "section-4.mp3"; Text = "Identity theft is a serious security risk, so if a suspicious message asks for sensitive information, you mustn't share your password." },
  @{ File = "sound-clear-in-tech-support-model-us.mp3"; Text = "My screen keeps freezing, and the app crashes whenever I connect to the network. Could you tell me where the settings are and whether the update is available? First, hook up the monitor, look up the error code, and turn the volume down. Identity theft is a serious security risk, so if a suspicious message asks for sensitive information, you mustn't share your password." }
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
  if ((Get-Item -LiteralPath $destination).Length -lt 1000) { throw "Generated audio is unexpectedly small for '$($model.File)'." }
  Write-Output "Generated $destination"
}

