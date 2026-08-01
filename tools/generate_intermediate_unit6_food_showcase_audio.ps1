param(
  [switch]$Overwrite,
  [string]$Only = ""
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $root "elevenlabs.local.env"
$audioRoot = Join-Path $root "ingles\intermediate\audio\unit-6-food-showcase"
$scriptPath = Join-Path $audioRoot "scripts.md"
$voiceIds = @{
  Emma = "XrExE9yKIg1WjnnlVkGX"
  Daniel = "ErXwobaYiN019PkySvjV"
}

if (-not (Test-Path -LiteralPath $envFile)) { throw "Missing elevenlabs.local.env" }
if (-not (Test-Path -LiteralPath $scriptPath)) { throw "Missing script file: $scriptPath" }

$settings = @{}
Get-Content -LiteralPath $envFile | ForEach-Object {
  if ($_ -match '^\s*([^#=]+)=(.*)$') { $settings[$matches[1].Trim()] = $matches[2].Trim() }
}
$apiKey = $settings["ELEVENLABS_API_KEY"]
if ([string]::IsNullOrWhiteSpace($apiKey) -or $apiKey -eq "put_your_api_key_here") { throw "ELEVENLABS_API_KEY is not configured" }

$items = New-Object System.Collections.ArrayList
$voice = ""
$content = Get-Content -LiteralPath $scriptPath
for ($index = 0; $index -lt $content.Count; $index++) {
  if ($content[$index] -match '^##\s+(Emma|Daniel)\s+voice\s*$') {
    $voice = $matches[1]
    continue
  }
  if ($content[$index] -match '^###\s+`([^`]+\.mp3)`\s*$') {
    if (-not $voiceIds.ContainsKey($voice)) { throw "No character voice assigned before $($matches[1])" }
    $fileName = $matches[1]
    $textLines = New-Object System.Collections.Generic.List[string]
    for ($cursor = $index + 1; $cursor -lt $content.Count; $cursor++) {
      if ($content[$cursor] -match '^#{2,3}\s+') { break }
      if (-not [string]::IsNullOrWhiteSpace($content[$cursor])) { $textLines.Add($content[$cursor].Trim()) }
    }
    [void]$items.Add([pscustomobject]@{ Voice = $voice; FileName = $fileName; Text = ($textLines -join ' '); Output = Join-Path $audioRoot $fileName })
  }
}

if ($items.Count -ne 19) { throw "Expected 19 scripts but found $($items.Count)" }
if ($Only -and -not ($items | Where-Object FileName -eq $Only)) { throw "Unknown audio script: $Only" }

$headers = @{ "xi-api-key" = $apiKey; "Accept" = "audio/mpeg" }
$created = 0
$skipped = 0
foreach ($item in $items) {
  if ($Only -and $item.FileName -ne $Only) { $skipped++; continue }
  if ((Test-Path -LiteralPath $item.Output) -and -not $Overwrite) { $skipped++; continue }
  $body = @{
    text = $item.Text
    model_id = "eleven_multilingual_v2"
    language_code = "en"
    voice_settings = @{ stability = 0.62; similarity_boost = 0.84; style = 0.2; use_speaker_boost = $true }
  } | ConvertTo-Json -Depth 4
  $voiceId = $voiceIds[$item.Voice]
  $uri = "https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128"
  Invoke-WebRequest -Uri $uri -Method Post -Headers $headers -ContentType "application/json" -Body $body -OutFile $item.Output
  $created++
  Write-Output "CREATED $($item.FileName) voice=$($item.Voice)"
}
Write-Output "SUMMARY created=$created skipped=$skipped total=$($items.Count)"
