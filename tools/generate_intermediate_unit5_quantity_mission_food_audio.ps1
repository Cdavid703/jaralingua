param(
  [switch]$Overwrite
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $root "elevenlabs.local.env"
$audioRoot = Join-Path $root "ingles\intermediate\audio\unit-5-quantity-mission-foods"
$voiceId = "EXAVITQu4vr4xnSDxMaL"

if (-not (Test-Path -LiteralPath $envFile)) {
  throw "Missing elevenlabs.local.env"
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

$items = @(
  @{ File = "mushrooms.mp3"; Text = "mushrooms" },
  @{ File = "noodle-bundles.mp3"; Text = "noodle bundles" },
  @{ File = "lemonade.mp3"; Text = "lemonade" },
  @{ File = "vegetable-soup.mp3"; Text = "vegetable soup" },
  @{ File = "cupcakes.mp3"; Text = "cupcakes" },
  @{ File = "flour.mp3"; Text = "flour" },
  @{ File = "red-peppers.mp3"; Text = "red peppers" },
  @{ File = "cucumber-slices.mp3"; Text = "cucumber slices" },
  @{ File = "pears.mp3"; Text = "pears" },
  @{ File = "shrimp-skewers.mp3"; Text = "shrimp skewers" }
)

$headers = @{
  "xi-api-key" = $apiKey
  "Accept" = "audio/mpeg"
}
$uri = "https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128"
$created = 0
$skipped = 0

foreach ($item in $items) {
  $output = Join-Path $audioRoot $item.File
  if ((Test-Path -LiteralPath $output) -and -not $Overwrite) {
    $skipped++
    continue
  }
  New-Item -ItemType Directory -Path (Split-Path -Parent $output) -Force | Out-Null
  $body = @{
    text = $item.Text
    model_id = "eleven_multilingual_v2"
    language_code = "en"
    voice_settings = @{
      stability = 0.62
      similarity_boost = 0.82
      style = 0.16
      use_speaker_boost = $true
    }
  } | ConvertTo-Json -Depth 4
  Invoke-WebRequest -Uri $uri -Method Post -Headers $headers -ContentType "application/json" -Body $body -OutFile $output
  $created++
  Write-Output ("CREATED " + (Resolve-Path -LiteralPath $output).Path)
}

Write-Output "SUMMARY created=$created skipped=$skipped total=$($items.Count)"
