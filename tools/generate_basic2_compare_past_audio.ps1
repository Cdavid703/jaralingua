param([switch]$DryRun)
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$destination = Join-Path $projectRoot 'ingles/basico-2/audio/unit5/compare-the-past/teacher-model.mp3'
$text = "Was the green hat more expensive than the yellow hat? No, it wasn't. The green hat was cheaper than the yellow hat."
if (Test-Path -LiteralPath $destination) { Write-Output 'REUSE teacher-model.mp3'; exit }
if ($DryRun) { Write-Output $text; exit }
$settings = @{}
Get-Content (Join-Path $projectRoot 'elevenlabs.local.env') | ForEach-Object {
  if ($_ -match '^\s*([^#=]+)=(.*)$') { $settings[$matches[1].Trim()] = $matches[2].Trim() }
}
if (-not $settings['ELEVENLABS_API_KEY']) { throw 'ElevenLabs key is not configured.' }
New-Item -ItemType Directory -Force -Path (Split-Path -Parent $destination) | Out-Null
$body = @{text=$text; model_id='eleven_multilingual_v2'; language_code='en'; voice_settings=@{stability=0.65;similarity_boost=0.82;style=0.1;use_speaker_boost=$true}} | ConvertTo-Json -Depth 4
Invoke-WebRequest -Uri 'https://api.elevenlabs.io/v1/text-to-speech/EXAVITQu4vr4xnSDxMaL?output_format=mp3_44100_128' -Method Post -Headers @{'xi-api-key'=$settings['ELEVENLABS_API_KEY'];Accept='audio/mpeg'} -ContentType 'application/json' -Body $body -OutFile ($destination + '.part') -TimeoutSec 60
if ((Get-Item -LiteralPath ($destination + '.part')).Length -lt 1000) { throw 'Audio response is too small.' }
Move-Item -LiteralPath ($destination + '.part') -Destination $destination
Write-Output 'CREATED teacher-model.mp3 with ElevenLabs.'
