param(
  [switch]$Overwrite
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $root "elevenlabs.local.env"
$audioRoot = Join-Path $root "ingles\intermediate\audio\unit-5-snack-review"
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
  @{ File = "ingredient-sentence.mp3"; Text = "This snack is made with corn flour, cheese, and a little oil." },
  @{ File = "rating-sentence.mp3"; Text = "I would give it four out of five because it is crispy outside, soft inside, and not too heavy." },
  @{ File = "culture-sentence.mp3"; Text = "It reminds me of street food because it is simple, warm, and easy to share." },
  @{ File = "full-model-review.mp3"; Text = "I reviewed a small cheese arepa connected to Colombian street food. It is made with corn flour, cheese, a little butter, and some fresh sauce. I give it four out of five because it is warm, salty, crispy on the outside, and soft inside. One small arepa is enough for a light snack, but two pieces can feel filling. Culturally, it reminds me of food people buy on the way to school, work, or a family visit. I would compare it with other simple snacks because it is affordable, practical, and easy to share. I recommend it for a class food fair because students can describe its ingredients, texture, quantity, and cultural meaning clearly." }
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
