param(
  [switch]$Overwrite
)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $projectRoot "elevenlabs.local.env"
$outputDirectory = Join-Path $projectRoot "ingles\intermediate-2\audio\unit-3-explanation\phrasal-verbs-and-idioms"
$voiceId = "EXAVITQu4vr4xnSDxMaL"

if (-not (Test-Path -LiteralPath $envFile)) { throw "Missing elevenlabs.local.env" }
$settings = @{}
Get-Content -LiteralPath $envFile | ForEach-Object {
  if ($_ -match '^\s*([^#=]+)=(.*)$') { $settings[$matches[1].Trim()] = $matches[2].Trim().Trim('"').Trim("'") }
}
$apiKey = $settings["ELEVENLABS_API_KEY"]
if ([string]::IsNullOrWhiteSpace($apiKey) -or $apiKey -eq "put_your_api_key_here") { throw "ELEVENLABS_API_KEY is not configured" }

$models = @(
  @{ File = "hook-up.mp3"; Text = "Hook up. Hook up the monitor to the laptop. Hook it up before the meeting." },
  @{ File = "look-up.mp3"; Text = "Look up. Look up the error code online. Look it up before you call support." },
  @{ File = "pick-up.mp3"; Text = "Pick up. The antenna cannot pick up a signal. It cannot pick it up inside this room." },
  @{ File = "put-off.mp3"; Text = "Put off. Do not put off the security update. Do not put it off until tomorrow." },
  @{ File = "turn-down.mp3"; Text = "Turn down. Turn down the volume. Turn it down during the call." },
  @{ File = "take-apart.mp3"; Text = "Take apart. Do not take the device apart without guidance. Do not take it apart yourself." },
  @{ File = "up-and-running.mp3"; Text = "Up and running. The network is up and running again." },
  @{ File = "at-the-touch-of-a-button.mp3"; Text = "At the touch of a button. You can back up the files at the touch of a button." },
  @{ File = "not-rocket-science.mp3"; Text = "It is not rocket science. Updating the app is not rocket science when you follow the steps." }
)

New-Item -ItemType Directory -Force -Path $outputDirectory | Out-Null
$headers = @{ "xi-api-key" = $apiKey; Accept = "audio/mpeg" }
$uri = "https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128"
$created = 0
$skipped = 0

foreach ($model in $models) {
  $output = Join-Path $outputDirectory $model.File
  if ((Test-Path -LiteralPath $output) -and -not $Overwrite) { $skipped++; continue }
  $payload = @{
    text = $model.Text
    model_id = "eleven_multilingual_v2"
    language_code = "en"
    voice_settings = @{ stability = 0.58; similarity_boost = 0.82; style = 0.12; use_speaker_boost = $true }
  } | ConvertTo-Json -Depth 4 -Compress
  Invoke-WebRequest -Method Post -Uri $uri -Headers $headers -ContentType "application/json" -Body $payload -OutFile $output
  if ((Get-Item -LiteralPath $output).Length -lt 1000) { throw "Generated audio is unexpectedly small: $($model.File)" }
  $created++
  Write-Output "CREATED $($model.File)"
}

Write-Output "SUMMARY created=$created skipped=$skipped total=$($models.Count)"
