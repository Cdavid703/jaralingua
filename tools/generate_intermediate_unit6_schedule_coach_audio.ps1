param(
  [switch]$Overwrite,
  [string]$Only = ""
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $root "elevenlabs.local.env"
$audioRoot = Join-Path $root "ingles\intermediate\audio\conversation-coach\unit-6-schedule"
$scriptPath = Join-Path $audioRoot "scripts.md"
$voiceId = "ErXwobaYiN019PkySvjV"

if (-not (Test-Path -LiteralPath $envFile)) {
  throw "Missing elevenlabs.local.env"
}

if (-not (Test-Path -LiteralPath $scriptPath)) {
  throw "Missing Unit 6 Schedule Coach script: $scriptPath"
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

$items = New-Object System.Collections.ArrayList
$content = Get-Content -LiteralPath $scriptPath
for ($index = 0; $index -lt $content.Count; $index++) {
  if ($content[$index] -match '^###\s+`([^`]+\.mp3)`\s*$') {
    $fileName = $matches[1]
    $textLines = New-Object System.Collections.Generic.List[string]
    for ($cursor = $index + 1; $cursor -lt $content.Count; $cursor++) {
      if ($content[$cursor] -match '^#{2,3}\s+') { break }
      if (-not [string]::IsNullOrWhiteSpace($content[$cursor])) { $textLines.Add($content[$cursor].Trim()) }
    }
    if ($textLines.Count -eq 0) { throw "Empty script for $fileName" }
    [void]$items.Add([pscustomobject]@{
      Text = ($textLines -join ' ')
      Output = Join-Path $audioRoot $fileName
    })
  }
}

if ($items.Count -ne 30) {
  throw "Expected 30 audio scripts but found $($items.Count)"
}

if (-not [string]::IsNullOrWhiteSpace($Only) -and -not ($items | Where-Object { (Split-Path -Leaf $_.Output) -eq $Only })) {
  throw "Unknown audio script requested with -Only: $Only"
}

$headers = @{
  "xi-api-key" = $apiKey
  "Accept" = "audio/mpeg"
}
$uri = "https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128"
$created = 0
$skipped = 0
$failed = 0

foreach ($item in $items) {
  if (-not [string]::IsNullOrWhiteSpace($Only) -and (Split-Path -Leaf $item.Output) -ne $Only) {
    $skipped++
    continue
  }
  if ((Test-Path -LiteralPath $item.Output) -and -not $Overwrite) {
    $skipped++
    continue
  }
  $body = @{
    text = $item.Text
    model_id = "eleven_multilingual_v2"
    language_code = "en"
    voice_settings = @{
      stability = 0.66
      similarity_boost = 0.84
      style = 0.16
      use_speaker_boost = $true
    }
  } | ConvertTo-Json -Depth 4
  try {
    Invoke-WebRequest -Uri $uri -Method Post -Headers $headers -ContentType "application/json" -Body $body -OutFile $item.Output
    $created++
    Write-Output ("CREATED " + (Resolve-Path -LiteralPath $item.Output).Path)
  } catch {
    $failed++
    Write-Error "FAILED $($item.Output): $($_.Exception.Message)" -ErrorAction Continue
  }
}

Write-Output "SUMMARY voice=Marcus-US created=$created skipped=$skipped failed=$failed total=$($items.Count)"
if ($failed -gt 0) { exit 1 }
