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
$audioRoot = Join-Path $root "ingles\basico\audio\final-oral-task-mock"
$scriptPath = Join-Path $audioRoot "scripts.md"
$defaultVoiceId = "EXAVITQu4vr4xnSDxMaL"

function Read-LocalSettings {
  param([string]$Path)

  $result = @{}
  if (-not (Test-Path -LiteralPath $Path)) {
    return $result
  }

  Get-Content -LiteralPath $Path | ForEach-Object {
    if ($_ -match '^\s*([^#=]+)=(.*)$') {
      $name = $matches[1].Trim()
      $value = $matches[2].Trim().Trim('"').Trim("'")
      $result[$name] = $value
    }
  }
  return $result
}

function First-ConfiguredValue {
  param(
    [hashtable]$Settings,
    [string[]]$Names,
    [string]$Fallback = ""
  )

  foreach ($name in $Names) {
    $processValue = [Environment]::GetEnvironmentVariable($name)
    if (-not [string]::IsNullOrWhiteSpace($processValue)) {
      return $processValue.Trim()
    }
    if ($Settings.ContainsKey($name) -and -not [string]::IsNullOrWhiteSpace($Settings[$name])) {
      return $Settings[$name].Trim()
    }
  }
  return $Fallback
}

function Resolve-VoiceId {
  param(
    [hashtable]$Settings,
    [string[]]$Names,
    [string]$Fallback
  )

  foreach ($name in $Names) {
    $rawValue = [Environment]::GetEnvironmentVariable($name)
    if ([string]::IsNullOrWhiteSpace($rawValue) -and $Settings.ContainsKey($name)) {
      $rawValue = $Settings[$name]
    }
    if ([string]::IsNullOrWhiteSpace($rawValue)) {
      continue
    }

    foreach ($candidate in $rawValue.Split(',')) {
      $voiceId = $candidate.Trim()
      # ElevenLabs voice IDs are 20 alphanumeric characters. This also
      # prevents example values such as put_us_female_voice_id_here from
      # reaching the API and producing a misleading HTTP 400 response.
      if ($voiceId -match '^[A-Za-z0-9]{20}$') {
        return $voiceId
      }
    }
  }
  return $Fallback
}

function Read-AudioItems {
  param(
    [string]$Path,
    [string]$Destination
  )

  if (-not (Test-Path -LiteralPath $Path)) {
    throw "Missing interview script: $Path"
  }

  $items = New-Object System.Collections.ArrayList
  $seen = @{}
  $content = Get-Content -LiteralPath $Path -Encoding UTF8
  for ($index = 0; $index -lt $content.Count; $index++) {
    if ($content[$index] -notmatch '^File:\s+`([^`]+)`\s*$') {
      continue
    }

    $fileName = $matches[1]
    if ($fileName -notmatch '^[a-z0-9][a-z0-9-]*\.mp3$') {
      throw "Invalid MP3 file name in scripts.md: $fileName"
    }
    if ($seen.ContainsKey($fileName)) {
      throw "Duplicate MP3 file name in scripts.md: $fileName"
    }

    $textLines = New-Object System.Collections.Generic.List[string]
    for ($cursor = $index + 1; $cursor -lt $content.Count; $cursor++) {
      if ($content[$cursor] -match '^##\s+') {
        break
      }
      if (-not [string]::IsNullOrWhiteSpace($content[$cursor])) {
        $textLines.Add($content[$cursor].Trim())
      }
    }

    $spokenText = ($textLines -join ' ').Trim()
    if ([string]::IsNullOrWhiteSpace($spokenText)) {
      throw "Missing spoken text for $fileName"
    }

    $seen[$fileName] = $true
    [void]$items.Add([pscustomobject]@{
      FileName = $fileName
      Text = $spokenText
      Output = Join-Path $Destination $fileName
    })
  }

  if ($items.Count -eq 0) {
    throw "No audio items were found in $Path"
  }
  return $items
}

$settings = Read-LocalSettings -Path $envFile
$items = Read-AudioItems -Path $scriptPath -Destination $audioRoot

if ($Only.Count -gt 0) {
  $requested = New-Object 'System.Collections.Generic.HashSet[string]' ([System.StringComparer]::OrdinalIgnoreCase)
  foreach ($rawValue in $Only) {
    foreach ($fileName in $rawValue.Split(',')) {
      $trimmed = $fileName.Trim()
      if (-not [string]::IsNullOrWhiteSpace($trimmed)) {
        [void]$requested.Add($trimmed)
      }
    }
  }
  $known = @($items | ForEach-Object { $_.FileName })
  $unknown = @($requested | Where-Object { $_ -notin $known })
  if ($unknown.Count -gt 0) {
    throw "Unknown audio file requested with -Only: $($unknown -join ', ')"
  }
  $items = @($items | Where-Object { $requested.Contains($_.FileName) })
}

if ($DryRun) {
  Write-Output "DRY RUN - Basic Course 1 Final Oral Task Mock"
  Write-Output "Audio clips: $($items.Count)"
  foreach ($item in $items) {
    Write-Output ("PLAN {0} | {1} characters" -f $item.FileName, $item.Text.Length)
  }
  exit 0
}

$apiKey = First-ConfiguredValue -Settings $settings -Names @("ELEVENLABS_API_KEY")
if ([string]::IsNullOrWhiteSpace($apiKey) -or $apiKey -in @("put_your_api_key_here", "TU_API_KEY_AQUI")) {
  throw "ELEVENLABS_API_KEY is not configured in the process environment or elevenlabs.local.env"
}

$voiceId = Resolve-VoiceId -Settings $settings -Names @(
  "ELEVENLABS_VOICE_EMMA",
  "ELEVENLABS_VOICE_POOL_EN_US_FEMALE",
  "ELEVENLABS_VOICE_POOL_EN_US_NEUTRAL",
  "ELEVENLABS_VOICE_NARRATOR",
  "ELEVENLABS_VOICE_ID"
) -Fallback $defaultVoiceId
$modelId = First-ConfiguredValue -Settings $settings -Names @("ELEVENLABS_MODEL_ID") -Fallback "eleven_multilingual_v2"
$outputFormat = First-ConfiguredValue -Settings $settings -Names @("ELEVENLABS_OUTPUT_FORMAT") -Fallback "mp3_44100_128"

New-Item -ItemType Directory -Path $audioRoot -Force | Out-Null
$headers = @{
  "xi-api-key" = $apiKey
  "Accept" = "audio/mpeg"
}
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
    voice_settings = @{
      stability = 0.62
      similarity_boost = 0.82
      style = 0.18
      use_speaker_boost = $true
    }
  } | ConvertTo-Json -Depth 4

  $partialPath = "$($item.Output).part"
  $completed = $false
  for ($attempt = 1; $attempt -le $MaxAttempts; $attempt++) {
    try {
      if (Test-Path -LiteralPath $partialPath) {
        Remove-Item -LiteralPath $partialPath -Force
      }
      Invoke-WebRequest -Uri $uri -Method Post -Headers $headers -ContentType "application/json" -Body $body -OutFile $partialPath -TimeoutSec 90
      $audioFile = Get-Item -LiteralPath $partialPath
      if ($audioFile.Length -lt 1024) {
        throw "ElevenLabs returned an unexpectedly small audio file."
      }
      Move-Item -LiteralPath $partialPath -Destination $item.Output -Force
      $created++
      $completed = $true
      Write-Output "CREATED $($item.FileName)"
      break
    }
    catch {
      if (Test-Path -LiteralPath $partialPath) {
        Remove-Item -LiteralPath $partialPath -Force
      }
      $statusCode = $null
      if ($_.Exception.Response -and $_.Exception.Response.StatusCode) {
        $statusCode = [int]$_.Exception.Response.StatusCode
      }
      $retryable = ($null -eq $statusCode) -or ($statusCode -eq 408) -or ($statusCode -eq 409) -or ($statusCode -eq 429) -or ($statusCode -ge 500)
      if (-not $retryable -or $attempt -eq $MaxAttempts) {
        Write-Warning "FAILED $($item.FileName) after attempt $attempt. $($_.Exception.Message)"
        break
      }
      $waitSeconds = [Math]::Min(12, [Math]::Pow(2, $attempt))
      Write-Warning "Retrying $($item.FileName) in $waitSeconds seconds (attempt $attempt of $MaxAttempts)."
      Start-Sleep -Seconds $waitSeconds
    }
  }

  if (-not $completed) {
    $failed.Add($item.FileName)
  }
}

Write-Output "SUMMARY created=$created skipped=$skipped failed=$($failed.Count) total=$($items.Count)"
if ($failed.Count -gt 0) {
  Write-Output ("FAILED FILES " + ($failed -join ", "))
  exit 1
}
