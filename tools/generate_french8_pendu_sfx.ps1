param(
  [switch]$Overwrite
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $root "elevenlabs.local.env"
$sfxFolder = Join-Path $root "frances\Niveau 8\audio\sfx\pendu"

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
    Output = Join-Path $sfxFolder "game-start.mp3"
    Text = "Short elegant classroom word game opening sound, wooden tile shuffle followed by a warm brass chime, sophisticated French language game, no voice, no melody, no alarm"
    Duration = 1.8
  },
  [pscustomobject]@{
    Output = Join-Path $sfxFolder "correct-letter.mp3"
    Text = "Very short satisfying correct letter sound, crisp wooden tile click with a light glass sparkle, refined educational game, no voice, no childish arcade sound"
    Duration = 0.9
  },
  [pscustomobject]@{
    Output = Join-Path $sfxFolder "wrong-letter.mp3"
    Text = "Very short restrained incorrect letter sound, soft low wooden knock, clear but not alarming, premium classroom game, no voice, no horror"
    Duration = 0.9
  },
  [pscustomobject]@{
    Output = Join-Path $sfxFolder "turn-change.mp3"
    Text = "Brief polished turn transition sound, two subtle card shuffle clicks moving from one side to another, professional classroom game, no voice"
    Duration = 1.0
  },
  [pscustomobject]@{
    Output = Join-Path $sfxFolder "round-complete.mp3"
    Text = "Short elegant word puzzle solved sound, wooden tiles locking into place followed by a warm celebratory chime, satisfying and refined, no voice, no crowd"
    Duration = 2.0
  },
  [pscustomobject]@{
    Output = Join-Path $sfxFolder "match-win.mp3"
    Text = "Brief premium classroom game victory fanfare, warm brass accents, bright chimes and a confident final hit, celebratory but restrained, no voice, no crowd, no long melody"
    Duration = 3.0
  }
)

$headers = @{
  "xi-api-key" = $apiKey
  "Accept" = "audio/mpeg"
}
$uri = "https://api.elevenlabs.io/v1/sound-generation"
New-Item -ItemType Directory -Path $sfxFolder -Force | Out-Null
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
    prompt_influence = 0.45
  } | ConvertTo-Json -Depth 3
  Invoke-WebRequest -Uri $uri -Method Post -Headers $headers -ContentType "application/json" -Body $body -OutFile $effect.Output
  $created++
  Write-Output ("CREATED " + (Resolve-Path -LiteralPath $effect.Output).Path)
}

Write-Output "SUMMARY created=$created skipped=$skipped total=$($effects.Count)"
