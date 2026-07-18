param(
  [switch]$Overwrite,
  [int]$StartAt = 1,
  [int]$Limit = 0
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $root "elevenlabs.local.env"
$dataFile = Join-Path $root "assets\js\english-intermediate-hangman-data.js"
$outputFolder = Join-Path $root "ingles\intermediate\audio\hangman\answers"

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

$voiceId = $settings["ELEVENLABS_VOICE_NARRATOR"]
if ([string]::IsNullOrWhiteSpace($voiceId) -or $voiceId -match '^put_') {
  $voiceId = "SAz9YHcvj6GT2YYXdXww"
}

$nodeSource = @'
global.window = global;
require(process.argv[1]);
const data = global.JaraLinguaEnglishIntermediateHangman;
const items = [];
data.categories.forEach((category) => {
  category.entries.forEach((entry, index) => {
    items.push({ id: `${category.id}-${index + 1}`, answer: entry.answer });
  });
});
process.stdout.write(JSON.stringify(items));
'@

$itemsJson = & node -e $nodeSource $dataFile
if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($itemsJson)) {
  throw "Unable to read the Hangman answer bank"
}

$parsedItems = ConvertFrom-Json -InputObject ($itemsJson -join "")
$items = @()
foreach ($parsedItem in $parsedItems) {
  $items += $parsedItem
}
if ($items.Count -ne 116) {
  throw "Expected 116 Hangman answers but found $($items.Count)"
}

$startIndex = [Math]::Max(0, $StartAt - 1)
$selected = @($items | Select-Object -Skip $startIndex)
if ($Limit -gt 0) {
  $selected = @($selected | Select-Object -First $Limit)
}

$headers = @{
  "xi-api-key" = $apiKey
  "Accept" = "audio/mpeg"
}
$uri = "https://api.elevenlabs.io/v1/text-to-speech/$voiceId`?output_format=mp3_44100_128"
New-Item -ItemType Directory -Path $outputFolder -Force | Out-Null
$created = 0
$skipped = 0
$failed = 0
$pronunciationText = @{
  "unit1-behavior-6" = "Acts... on impulse."
}

foreach ($item in $selected) {
  $output = Join-Path $outputFolder ($item.id + ".mp3")
  if ((Test-Path -LiteralPath $output) -and -not $Overwrite) {
    $skipped++
    continue
  }

  $spokenText = if ($pronunciationText.ContainsKey([string]$item.id)) { $pronunciationText[[string]$item.id] } else { [string]$item.answer }
  $body = @{
    text = $spokenText
    model_id = "eleven_multilingual_v2"
    voice_settings = @{
      stability = 0.58
      similarity_boost = 0.82
      style = 0.08
      use_speaker_boost = $true
    }
  } | ConvertTo-Json -Depth 5

  $success = $false
  for ($attempt = 1; $attempt -le 3 -and -not $success; $attempt++) {
    try {
      Invoke-WebRequest -Uri $uri -Method Post -Headers $headers -ContentType "application/json" -Body $body -OutFile $output -TimeoutSec 120
      if ((Get-Item -LiteralPath $output).Length -lt 1000) {
        throw "Generated file is unexpectedly small"
      }
      $success = $true
      $created++
      Write-Output ("CREATED {0} :: {1}" -f $item.id, $item.answer)
    } catch {
      if (Test-Path -LiteralPath $output) {
        Remove-Item -LiteralPath $output -Force
      }
      if ($attempt -eq 3) {
        $failed++
        Write-Warning ("FAILED {0} :: {1} :: {2}" -f $item.id, $item.answer, $_.Exception.Message)
      } else {
        Start-Sleep -Seconds (2 * $attempt)
      }
    }
  }
}

Write-Output "SUMMARY created=$created skipped=$skipped failed=$failed selected=$($selected.Count) total=$($items.Count) voice=$voiceId"
if ($failed -gt 0) {
  exit 1
}
