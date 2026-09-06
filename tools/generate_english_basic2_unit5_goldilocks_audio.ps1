param(
  [switch]$Overwrite
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $root "elevenlabs.local.env"
$audioRoot = Join-Path $root "ingles\basico-2\audio\unit5\goldilocks-book"
$scriptPath = Join-Path $audioRoot "unit-5-goldilocks-audio-scripts.md"
$voices = @{
  default = "EXAVITQu4vr4xnSDxMaL"
  "story-papa-bear.mp3" = "ErXwobaYiN019PkySvjV"
  "story-mama-bear.mp3" = "MF3mGyEYCl7XYWbV9V6O"
  "story-baby-bear.mp3" = "TxGEqnHWrfWFTfGW9XjX"
}

if (-not (Test-Path -LiteralPath $envFile)) { throw "Missing elevenlabs.local.env" }
if (-not (Test-Path -LiteralPath $scriptPath)) { throw "Missing audio script: $scriptPath" }

$settings = @{}
Get-Content -LiteralPath $envFile | ForEach-Object {
  if ($_ -match '^\s*([^#=]+)=(.*)$') { $settings[$matches[1].Trim()] = $matches[2].Trim() }
}
$apiKey = $settings["ELEVENLABS_API_KEY"]
if ([string]::IsNullOrWhiteSpace($apiKey) -or $apiKey -eq "put_your_api_key_here") { throw "ELEVENLABS_API_KEY is not configured" }

$items = New-Object System.Collections.ArrayList
$content = Get-Content -LiteralPath $scriptPath
for ($index = 0; $index -lt $content.Count; $index++) {
  if ($content[$index] -match '^File:\s+`([^`]+)`') {
    $fileName = $matches[1]
    $textLines = New-Object System.Collections.Generic.List[string]
    for ($cursor = $index + 1; $cursor -lt $content.Count; $cursor++) {
      if ($content[$cursor] -match '^##\s+') { break }
      if (-not [string]::IsNullOrWhiteSpace($content[$cursor])) { $textLines.Add($content[$cursor].Trim()) }
    }
    [void]$items.Add([pscustomobject]@{ FileName = $fileName; Text = ($textLines -join ' '); Output = Join-Path $audioRoot $fileName })
  }
}

$headers = @{ "xi-api-key" = $apiKey; "Accept" = "audio/mpeg" }
$created = 0
$skipped = 0
foreach ($item in $items) {
  if ((Test-Path -LiteralPath $item.Output) -and -not $Overwrite) { $skipped++; continue }
  $voiceId = if ($voices.ContainsKey($item.FileName)) { $voices[$item.FileName] } else { $voices.default }
  $uri = "https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128"
  $body = @{ text = $item.Text; model_id = "eleven_multilingual_v2"; language_code = "en"; voice_settings = @{ stability = 0.62; similarity_boost = 0.82; style = 0.14; use_speaker_boost = $true } } | ConvertTo-Json -Depth 4
  Invoke-WebRequest -Uri $uri -Method Post -Headers $headers -ContentType "application/json" -Body $body -OutFile $item.Output
  $created++
  Write-Output ("CREATED " + (Resolve-Path -LiteralPath $item.Output).Path)
}
Write-Output "SUMMARY created=$created skipped=$skipped total=$($items.Count)"
