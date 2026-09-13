param([switch]$DryRun)
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$data = Get-Content (Join-Path $projectRoot 'assets/data/basic2-unit4-past-verbs-pronunciation.json') -Raw | ConvertFrom-Json
$settings = @{}
if (-not $DryRun) {
  Get-Content (Join-Path $projectRoot 'elevenlabs.local.env') | ForEach-Object {
    if ($_ -match '^\s*([^#=]+)=(.*)$') { $settings[$matches[1].Trim()] = $matches[2].Trim() }
  }
  if (-not $settings['ELEVENLABS_API_KEY']) { throw 'ElevenLabs key is not configured.' }
}
$created = 0
foreach ($item in $data.newAudio) {
  $destination = Join-Path $projectRoot $item.url.TrimStart('/')
  if (Test-Path -LiteralPath $destination) { Write-Output ('REUSE ' + $item.url); continue }
  if ($DryRun) { Write-Output ('GENERATE ' + $item.text + ' -> ' + $item.url); continue }
  New-Item -ItemType Directory -Force -Path (Split-Path -Parent $destination) | Out-Null
  $body = @{text=$item.text; model_id='eleven_multilingual_v2'; language_code='en'; voice_settings=@{stability=0.65;similarity_boost=0.82;style=0.1;use_speaker_boost=$true}} | ConvertTo-Json -Depth 4
  Invoke-WebRequest -Uri 'https://api.elevenlabs.io/v1/text-to-speech/EXAVITQu4vr4xnSDxMaL?output_format=mp3_44100_128' -Method Post -Headers @{'xi-api-key'=$settings['ELEVENLABS_API_KEY'];Accept='audio/mpeg'} -ContentType 'application/json' -Body $body -OutFile ($destination + '.part') -TimeoutSec 60
  if ((Get-Item -LiteralPath ($destination + '.part')).Length -lt 1000) { throw 'Audio response is too small.' }
  Move-Item -LiteralPath ($destination + '.part') -Destination $destination
  $created++
  Write-Output ('CREATED ' + $item.url)
}
Write-Output ('Created: ' + $created + '; no existing model was overwritten.')
