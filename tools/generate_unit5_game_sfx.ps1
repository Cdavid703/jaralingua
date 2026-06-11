param(
  [switch]$Overwrite
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $root "elevenlabs.local.env"
$gameFolder = Join-Path $root "ingles\basico\audio\unit5\game"

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

$effects = @(
  [pscustomobject]@{
    Output = Join-Path $gameFolder "match-success.mp3"
    Text = "Short bright cheerful game success chime, sparkly ascending arpeggio with a soft magical shimmer, celebratory ding for a kids classroom game, clean ending"
    Duration = 2.0
  },
  [pscustomobject]@{
    Output = Join-Path $gameFolder "victory.mp3"
    Text = "Triumphant victory fanfare for a kids game show winner, joyful brass and bells flourish with crowd cheering and party poppers, big celebratory finale"
    Duration = 5.0
  }
)

$headers = @{
  "xi-api-key" = $apiKey
  "Accept" = "audio/mpeg"
}
$uri = "https://api.elevenlabs.io/v1/sound-generation"
New-Item -ItemType Directory -Path $gameFolder -Force | Out-Null
$created = 0
$skipped = 0

foreach ($effect in $effects) {
  if ((Test-Path -LiteralPath $effect.Output) -and -not $Overwrite) {
    $skipped++
    continue
  }
  $body = @{
    text = $effect.Text
    duration_seconds = $effect.Duration
    prompt_influence = 0.4
  } | ConvertTo-Json -Depth 3
  Invoke-WebRequest -Uri $uri -Method Post -Headers $headers -ContentType "application/json" -Body $body -OutFile $effect.Output
  $created++
  Write-Output ("CREATED " + (Resolve-Path -LiteralPath $effect.Output).Path)
}

Write-Output "SUMMARY created=$created skipped=$skipped total=$($effects.Count)"
