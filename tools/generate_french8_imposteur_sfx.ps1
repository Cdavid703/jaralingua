param(
  [switch]$Overwrite
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $root "elevenlabs.local.env"
$sfxFolder = Join-Path $root "frances\Niveau 8\audio\sfx\imposteur"

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
    Output = Join-Path $sfxFolder "room-created.mp3"
    Text = "Short elegant smart city interface activation sound, clean digital pulse with soft glass tone, professional classroom web app, no voice, no melody, no alarm"
    Duration = 1.4
  },
  [pscustomobject]@{
    Output = Join-Path $sfxFolder "roles-distributed.mp3"
    Text = "Brief refined suspense transition for secret role distribution, soft digital shuffle, subtle mystery, professional and serious, no horror, no voice, clean ending"
    Duration = 2.0
  },
  [pscustomobject]@{
    Output = Join-Path $sfxFolder "role-confirmed.mp3"
    Text = "Short confident confirmation check sound, warm digital chime, precise and calm, professional educational app, no voice, no childish game sound"
    Duration = 1.2
  },
  [pscustomobject]@{
    Output = Join-Path $sfxFolder "suspect-found.mp3"
    Text = "Elegant mystery reveal sting for opening a vote, smart city data pulse with restrained suspense, brief and polished, not scary, no voice, no dramatic orchestra"
    Duration = 2.2
  },
  [pscustomobject]@{
    Output = Join-Path $sfxFolder "vote-submitted.mp3"
    Text = "Soft secure vote submitted notification, discreet digital send sound with a light confirmation tone, professional classroom app, no voice, no alarm"
    Duration = 1.2
  },
  [pscustomobject]@{
    Output = Join-Path $sfxFolder "result-revealed.mp3"
    Text = "Brief final reveal sound for a classroom impostor game, elegant resolution chime with smart interface shimmer, satisfying but restrained, no voice, no crowd"
    Duration = 2.5
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
    prompt_influence = 0.42
  } | ConvertTo-Json -Depth 3
  Invoke-WebRequest -Uri $uri -Method Post -Headers $headers -ContentType "application/json" -Body $body -OutFile $effect.Output
  $created++
  Write-Output ("CREATED " + (Resolve-Path -LiteralPath $effect.Output).Path)
}

Write-Output "SUMMARY created=$created skipped=$skipped total=$($effects.Count)"
