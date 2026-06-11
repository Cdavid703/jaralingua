param(
  [switch]$Overwrite
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $root "elevenlabs.local.env"
$audioRoot = Join-Path $root "ingles\basico\audio\unit5"
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

function Convert-ToSlug([string]$Text) {
  return (($Text.ToLowerInvariant() -replace '[^a-z0-9]+', '-') -replace '(^-|-$)', '')
}

function Add-MarkdownScripts([string]$Path, [string]$TargetFolder, [System.Collections.ArrayList]$Items) {
  $content = Get-Content -LiteralPath $Path
  for ($index = 0; $index -lt $content.Count; $index++) {
    if ($content[$index] -match '^File:\s+`([^`]+)`') {
      $fileName = $matches[1]
      $textLines = New-Object System.Collections.Generic.List[string]
      for ($cursor = $index + 1; $cursor -lt $content.Count; $cursor++) {
        if ($content[$cursor] -match '^##\s+') { break }
        if (-not [string]::IsNullOrWhiteSpace($content[$cursor])) { $textLines.Add($content[$cursor].Trim()) }
      }
      [void]$Items.Add([pscustomobject]@{
        Text = ($textLines -join ' ')
        Output = Join-Path $TargetFolder $fileName
      })
    }
  }
}

$items = New-Object System.Collections.ArrayList
Add-MarkdownScripts (Join-Path $audioRoot "unit-5-free-time-audio-scripts.md") $audioRoot $items
Add-MarkdownScripts (Join-Path $audioRoot "cards\unit-5-free-time-card-scripts.md") (Join-Path $audioRoot "cards") $items

$vocabulary = @(
  "always", "usually", "often", "sometimes", "rarely / never",
  "comedy shows", "documentaries", "cartoons", "reality shows", "sports shows", "horror shows", "cooking shows", "series", "news programs",
  "funny", "interesting", "exciting", "relaxing", "boring", "scary", "fun", "popular", "entertaining",
  "phone", "computer", "tablet", "social media", "internet", "video games", "online videos", "apps", "screen time", "technology addict",
  "hang out", "chill out", "catch up with friends", "be into something", "binge-watch a series", "take it easy"
)

$vocabularyFolder = Join-Path $audioRoot "vocabulary"
foreach ($text in $vocabulary) {
  [void]$items.Add([pscustomobject]@{
    Text = $text
    Output = Join-Path $vocabularyFolder ((Convert-ToSlug $text) + ".mp3")
  })
}

$headers = @{
  "xi-api-key" = $apiKey
  "Accept" = "audio/mpeg"
}
$uri = "https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128"
$created = 0
$skipped = 0

foreach ($item in $items) {
  if ((Test-Path -LiteralPath $item.Output) -and -not $Overwrite) {
    $skipped++
    continue
  }
  $directory = Split-Path -Parent $item.Output
  New-Item -ItemType Directory -Path $directory -Force | Out-Null
  $body = @{
    text = $item.Text
    model_id = "eleven_multilingual_v2"
    language_code = "en"
    voice_settings = @{
      stability = 0.62
      similarity_boost = 0.82
      style = 0.18
      use_speaker_boost = $true
    }
  } | ConvertTo-Json -Depth 4
  Invoke-WebRequest -Uri $uri -Method Post -Headers $headers -ContentType "application/json" -Body $body -OutFile $item.Output
  $created++
  Write-Output ("CREATED " + (Resolve-Path -LiteralPath $item.Output).Path)
}

Write-Output "SUMMARY created=$created skipped=$skipped total=$($items.Count)"
