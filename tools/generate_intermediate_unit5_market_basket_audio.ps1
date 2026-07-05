param(
  [switch]$Overwrite
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $root "elevenlabs.local.env"
$audioRoot = Join-Path $root "ingles\intermediate\audio\unit-5-market-basket"
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
  @{ File = "market-basket-challenge-intro.mp3"; Text = "Welcome to the Market Basket Challenge. Sort the foods, choose natural quantity phrases, build a dinner shopping mission, and send your final product to your teacher." },
  @{ File = "a-cup-of-rice.mp3"; Text = "a cup of rice" },
  @{ File = "a-little-oil.mp3"; Text = "a little oil" },
  @{ File = "a-few-tomatoes.mp3"; Text = "a few tomatoes" },
  @{ File = "a-bottle-of-water.mp3"; Text = "a bottle of water" },
  @{ File = "three-cups-of-cooked-rice.mp3"; Text = "three cups of cooked rice" },
  @{ File = "a-slice-of-bread.mp3"; Text = "a slice of bread" },
  @{ File = "your-food-fair-mission-is-ready.mp3"; Text = "Your food fair mission is ready." }
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
