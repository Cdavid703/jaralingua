param(
  [switch]$Overwrite,
  [switch]$DryRun,
  [string[]]$Only = @(),
  [ValidateRange(1, 6)]
  [int]$MaxAttempts = 4
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $root "elevenlabs.local.env"
$audioRoot = Join-Path $root "ingles\basico\audio\final-oral-task-real"
$privatePromptRoot = Join-Path $root "server\private_assets\basic-final-oral-prompts"
$scriptPath = Join-Path $audioRoot "scripts.md"
$defaultVoiceId = "ErXwobaYiN019PkySvjV"

function Read-LocalSettings {
  param([string]$Path)
  $result = @{}
  if (-not (Test-Path -LiteralPath $Path)) { return $result }
  Get-Content -LiteralPath $Path -Encoding UTF8 | ForEach-Object {
    if ($_ -match '^\s*([^#=]+)=(.*)$') {
      $result[$matches[1].Trim()] = $matches[2].Trim().Trim('"').Trim("'")
    }
  }
  return $result
}

function First-ConfiguredValue {
  param([hashtable]$Settings, [string[]]$Names, [string]$Fallback = "")
  foreach ($name in $Names) {
    $processValue = [Environment]::GetEnvironmentVariable($name)
    if (-not [string]::IsNullOrWhiteSpace($processValue)) { return $processValue.Trim() }
    if ($Settings.ContainsKey($name) -and -not [string]::IsNullOrWhiteSpace($Settings[$name])) {
      return $Settings[$name].Trim()
    }
  }
  return $Fallback
}

function Resolve-VoiceId {
  param([hashtable]$Settings)
  foreach ($name in @("ELEVENLABS_VOICE_DANIEL", "ELEVENLABS_VOICE_ETHAN", "ELEVENLABS_VOICE_POOL_EN_US_MALE")) {
    $raw = First-ConfiguredValue -Settings $Settings -Names @($name)
    foreach ($candidate in $raw.Split(',')) {
      $voiceId = $candidate.Trim()
      if ($voiceId -match '^[A-Za-z0-9]{20}$') { return $voiceId }
    }
  }
  # Same approved professional American male voice used by Ethan in the
  # Intermediate Course 1 restaurant coach.
  return $defaultVoiceId
}

function Read-AudioItems {
  param([string]$Path, [string]$Destination, [string]$PromptDestination)
  if (-not (Test-Path -LiteralPath $Path)) { throw "Missing final oral task script: $Path" }
  $items = New-Object System.Collections.ArrayList
  $seen = @{}
  $content = Get-Content -LiteralPath $Path -Encoding UTF8
  for ($index = 0; $index -lt $content.Count; $index++) {
    if ($content[$index] -notmatch '^###\s+`([^`]+\.mp3)`\s*$') { continue }
    $fileName = $matches[1]
    if ($fileName -notmatch '^[a-z0-9][a-z0-9-]*\.mp3$') { throw "Invalid MP3 file name: $fileName" }
    if ($seen.ContainsKey($fileName)) { throw "Duplicate MP3 file name: $fileName" }
    $textLines = New-Object System.Collections.Generic.List[string]
    for ($cursor = $index + 1; $cursor -lt $content.Count; $cursor++) {
      if ($content[$cursor] -match '^#{2,3}\s+') { break }
      if (-not [string]::IsNullOrWhiteSpace($content[$cursor])) { $textLines.Add($content[$cursor].Trim()) }
    }
    $spokenText = ($textLines -join ' ').Trim()
    if ([string]::IsNullOrWhiteSpace($spokenText)) { throw "Missing spoken text for $fileName" }
    $seen[$fileName] = $true
    $isProtectedPrompt = $fileName -match '^unit-[1-6]-[abc]\.mp3$' -or $fileName -eq 'interaction-a.mp3'
    $outputRoot = if ($isProtectedPrompt) { $PromptDestination } else { $Destination }
    [void]$items.Add([pscustomobject]@{ FileName = $fileName; Text = $spokenText; Output = Join-Path $outputRoot $fileName; Protected = $isProtectedPrompt })
  }
  if ($items.Count -ne 57) { throw "Expected 57 approved audio scripts but found $($items.Count)" }
  return $items
}

$settings = Read-LocalSettings -Path $envFile
$items = Read-AudioItems -Path $scriptPath -Destination $audioRoot -PromptDestination $privatePromptRoot

if ($Only.Count -gt 0) {
  $requested = New-Object 'System.Collections.Generic.HashSet[string]' ([System.StringComparer]::OrdinalIgnoreCase)
  foreach ($rawValue in $Only) {
    foreach ($fileName in $rawValue.Split(',')) {
      if (-not [string]::IsNullOrWhiteSpace($fileName)) { [void]$requested.Add($fileName.Trim()) }
    }
  }
  $known = @($items | ForEach-Object { $_.FileName })
  $unknown = @($requested | Where-Object { $_ -notin $known })
  if ($unknown.Count -gt 0) { throw "Unknown audio file requested with -Only: $($unknown -join ', ')" }
  $items = @($items | Where-Object { $requested.Contains($_.FileName) })
}

if ($DryRun) {
  Write-Output "DRY RUN - Basic Course 1 Final Oral Task - Daniel Carter"
  Write-Output "Voice: $defaultVoiceId (same approved male voice as the restaurant coach)"
  Write-Output "Audio clips: $($items.Count)"
  foreach ($item in $items) { Write-Output ("PLAN {0} | {1} characters" -f $item.FileName, $item.Text.Length) }
  exit 0
}

$apiKey = First-ConfiguredValue -Settings $settings -Names @("ELEVENLABS_API_KEY")
if ([string]::IsNullOrWhiteSpace($apiKey) -or $apiKey -in @("put_your_api_key_here", "TU_API_KEY_AQUI")) {
  throw "ELEVENLABS_API_KEY is not configured in the process environment or elevenlabs.local.env"
}

$voiceId = Resolve-VoiceId -Settings $settings
$modelId = First-ConfiguredValue -Settings $settings -Names @("ELEVENLABS_MODEL_ID") -Fallback "eleven_multilingual_v2"
$outputFormat = First-ConfiguredValue -Settings $settings -Names @("ELEVENLABS_OUTPUT_FORMAT") -Fallback "mp3_44100_128"
New-Item -ItemType Directory -Path $audioRoot -Force | Out-Null
New-Item -ItemType Directory -Path $privatePromptRoot -Force | Out-Null

$headers = @{ "xi-api-key" = $apiKey; "Accept" = "audio/mpeg" }
$uri = "https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=${outputFormat}"
$created = 0
$skipped = 0
$failed = New-Object System.Collections.Generic.List[string]

foreach ($item in $items) {
  if ((Test-Path -LiteralPath $item.Output) -and -not $Overwrite) {
    $skipped++
    Write-Output "SKIPPED $($item.FileName)"
    continue
  }
  $body = @{
    text = $item.Text
    model_id = $modelId
    language_code = "en"
    voice_settings = @{ stability = 0.66; similarity_boost = 0.84; style = 0.16; use_speaker_boost = $true }
  } | ConvertTo-Json -Depth 4
  $success = $false
  for ($attempt = 1; $attempt -le $MaxAttempts; $attempt++) {
    try {
      Invoke-WebRequest -Uri $uri -Method Post -Headers $headers -ContentType "application/json" -Body $body -OutFile $item.Output
      $created++
      $success = $true
      Write-Output "CREATED $($item.FileName)"
      break
    } catch {
      if ($attempt -eq $MaxAttempts) {
        $failed.Add($item.FileName)
        Write-Error "FAILED $($item.FileName): $($_.Exception.Message)" -ErrorAction Continue
      } else {
        Start-Sleep -Seconds ([Math]::Min(12, [Math]::Pow(2, $attempt)))
      }
    }
  }
  if (-not $success -and (Test-Path -LiteralPath $item.Output)) { Remove-Item -LiteralPath $item.Output -Force }
}

Write-Output "SUMMARY voice=Daniel-US($voiceId) created=$created skipped=$skipped failed=$($failed.Count) total=$($items.Count)"
if ($failed.Count -gt 0) { exit 1 }
