param(
  [switch]$Overwrite,
  [string[]]$Files
)

# This follows the established Intermediate 2 conversation-coach pattern:
# canonical scripts.md, a fixed account voice, eleven_multilingual_v2 and
# MP3 44.1 kHz / 128 kbps output.
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $root "elevenlabs.local.env"
$audioRoot = Join-Path $root "ingles\intermediate-2\audio\midterm-oral-conversation-coach"
$scriptPath = Join-Path $audioRoot "scripts.md"
$voiceId = "EXAVITQu4vr4xnSDxMaL" # Sarah — Mature, Reassuring, Confident

if (-not (Test-Path -LiteralPath $envFile)) { throw "Missing elevenlabs.local.env" }
if (-not (Test-Path -LiteralPath $scriptPath)) { throw "Missing canonical audio script: $scriptPath" }

$settings = @{}
Get-Content -LiteralPath $envFile -Encoding UTF8 | ForEach-Object {
  if ($_ -match '^\s*([^#=]+)=(.*)$') { $settings[$matches[1].Trim()] = $matches[2].Trim() }
}
$apiKey = $settings["ELEVENLABS_API_KEY"]
if ([string]::IsNullOrWhiteSpace($apiKey) -or $apiKey -eq "put_your_api_key_here") { throw "ELEVENLABS_API_KEY is not configured" }

$items = New-Object System.Collections.ArrayList
$content = Get-Content -LiteralPath $scriptPath -Encoding UTF8
for ($index = 0; $index -lt $content.Count; $index++) {
  if ($content[$index] -notmatch '^###\s+`([^`]+\.mp3)`\s*$') { continue }
  $fileName = $matches[1]
  $textLines = New-Object System.Collections.Generic.List[string]
  for ($cursor = $index + 1; $cursor -lt $content.Count; $cursor++) {
    if ($content[$cursor] -match '^###\s+') { break }
    if (-not [string]::IsNullOrWhiteSpace($content[$cursor])) { $textLines.Add($content[$cursor].Trim()) }
  }
  $spokenText = ($textLines -join " ").Trim()
  if ([string]::IsNullOrWhiteSpace($spokenText)) { throw "Missing spoken text for $fileName" }
  [void]$items.Add([pscustomobject]@{ File = $fileName; Text = $spokenText; Output = Join-Path $audioRoot $fileName })
}
if ($items.Count -ne 15) { throw "Expected 15 canonical audio clips, found $($items.Count)" }
if (($items.File | Select-Object -Unique).Count -ne $items.Count) { throw "Duplicate MP3 names in scripts.md" }
if ($Files.Count -gt 0) {
  $unknown = $Files | Where-Object { $_ -notin $items.File }
  if ($unknown) { throw "Unknown canonical audio file(s): $($unknown -join ', ')" }
  $items = @($items | Where-Object { $_.File -in $Files })
}

$headers = @{ "xi-api-key" = $apiKey; "Accept" = "audio/mpeg" }
$uri = "https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128"
$created = 0; $skipped = 0
foreach ($item in $items) {
  if ((Test-Path -LiteralPath $item.Output) -and -not $Overwrite) { $skipped++; Write-Output "SKIPPED $($item.File)"; continue }
  $body = @{ text = $item.Text; model_id = "eleven_multilingual_v2"; language_code = "en"; voice_settings = @{ stability = 0.64; similarity_boost = 0.82; style = 0.14; use_speaker_boost = $true } } | ConvertTo-Json -Depth 4
  Invoke-WebRequest -Uri $uri -Method Post -Headers $headers -ContentType "application/json" -Body $body -OutFile $item.Output
  if ((Get-Item -LiteralPath $item.Output).Length -lt 1024) { Remove-Item -LiteralPath $item.Output -Force; throw "ElevenLabs created an invalid MP3: $($item.File)" }
  $created++; Write-Output "CREATED $($item.File)"
}
Write-Output "SUMMARY voice=Sarah-US created=$created skipped=$skipped total=$($items.Count)"
