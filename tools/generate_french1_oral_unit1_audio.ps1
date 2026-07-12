param(
  [switch]$Overwrite
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $root "elevenlabs.local.env"
$outputDir = Join-Path $root "frances\Niveau 1\audio\pratique-orale\unite-1"

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

$voiceCandidates = @(
  $settings["ELEVENLABS_VOICE_POOL_FR_FR_FEMALE"],
  $settings["ELEVENLABS_VOICE_NARRATOR"],
  $settings["ELEVENLABS_VOICE_POOL_FR_FR_NEUTRAL"],
  $settings["ELEVENLABS_VOICE_ID"],
  "JvD1a0L9rABccms2q9zH"
)
$voiceId = ""
foreach ($candidate in $voiceCandidates) {
  if ([string]::IsNullOrWhiteSpace($candidate)) { continue }
  $first = ($candidate -split ",")[0].Trim()
  if ($first -and $first -notmatch "^put_") {
    $voiceId = $first
    break
  }
}
if ([string]::IsNullOrWhiteSpace($voiceId)) {
  throw "No French ElevenLabs voice is configured"
}

New-Item -ItemType Directory -Path $outputDir -Force | Out-Null

$items = @(
  @{ File = "question-01.mp3"; Text = "Bonjour. Comment tu t’appelles ?" },
  @{ File = "question-02.mp3"; Text = "Tu peux épeler ton prénom, s’il te plaît ?" },
  @{ File = "question-03.mp3"; Text = "Tu viens d’où ?" },
  @{ File = "question-04.mp3"; Text = "Tu habites dans quelle ville ?" },
  @{ File = "question-05.mp3"; Text = "Quel âge as-tu ?" },
  @{ File = "question-06.mp3"; Text = "Quel est ton numéro préféré entre un et vingt ?" },
  @{ File = "question-07.mp3"; Text = "Présente-toi en deux phrases, s’il te plaît." },
  @{ File = "question-08.mp3"; Text = "Dis bonjour, présente-toi et termine avec enchanté ou enchantée." }
)

$headers = @{
  "xi-api-key" = $apiKey
  "Accept" = "audio/mpeg"
}
$modelId = if ($settings["ELEVENLABS_MODEL_ID"]) { $settings["ELEVENLABS_MODEL_ID"] } else { "eleven_multilingual_v2" }
$format = if ($settings["ELEVENLABS_OUTPUT_FORMAT"]) { $settings["ELEVENLABS_OUTPUT_FORMAT"] } else { "mp3_44100_128" }
$uri = "https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=${format}"

foreach ($item in $items) {
  $output = Join-Path $outputDir $item.File
  if ((Test-Path -LiteralPath $output) -and -not $Overwrite) {
    Write-Output ("SKIPPED " + (Resolve-Path -LiteralPath $output).Path)
    continue
  }
  $body = @{
    text = $item.Text
    model_id = $modelId
    language_code = "fr"
    voice_settings = @{
      stability = 0.72
      similarity_boost = 0.84
      style = 0.10
      use_speaker_boost = $true
    }
  } | ConvertTo-Json -Depth 4

  $bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($body)
  Invoke-WebRequest -Uri $uri -Method Post -Headers $headers -ContentType "application/json; charset=utf-8" -Body $bodyBytes -OutFile $output
  Write-Output ("CREATED " + (Resolve-Path -LiteralPath $output).Path)
}
