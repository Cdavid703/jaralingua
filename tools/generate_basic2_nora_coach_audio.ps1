param([switch]$Overwrite)
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$settings = @{}
Get-Content -LiteralPath (Join-Path $projectRoot 'elevenlabs.local.env') | ForEach-Object {
  if ($_ -match '^\s*([^#=]+)=(.*)$') { $settings[$matches[1].Trim()] = $matches[2].Trim() }
}
$speechKey = $settings['ELEVENLABS_API_KEY']
if ([string]::IsNullOrWhiteSpace($speechKey)) { throw 'ElevenLabs is not configured.' }
$configPath = Join-Path $projectRoot 'assets/js/conversation-coach-data/english-basic-2-unit-5-nora-memories.js'
$scriptJson = & node -e "const fs=require('fs'),vm=require('vm');const s={window:{}};vm.runInNewContext(fs.readFileSync(process.argv[1],'utf8'),s);console.log(JSON.stringify(s.window.JaraLinguaConversationCoachConfig.audioScripts));" $configPath
if ($LASTEXITCODE -ne 0) { throw 'Could not load approved scripts.' }
$scripts = $scriptJson | ConvertFrom-Json
$destination = Join-Path $projectRoot 'ingles/basico-2/audio/unit5/nora-coach'
New-Item -ItemType Directory -Force -Path $destination | Out-Null
# Sarah: one consistent adult female American English voice for Nora Bennett.
$voiceId = 'EXAVITQu4vr4xnSDxMaL'
foreach ($entry in $scripts.PSObject.Properties) {
  $audioPath = Join-Path $destination $entry.Name
  if ((Test-Path -LiteralPath $audioPath) -and -not $Overwrite) { continue }
  $body = @{text=$entry.Value;model_id='eleven_multilingual_v2';language_code='en';voice_settings=@{stability=0.58;similarity_boost=0.82;style=0.18;use_speaker_boost=$true}} | ConvertTo-Json -Depth 4
  Invoke-WebRequest -Uri "https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128" -Method Post -Headers @{'xi-api-key'=$speechKey;Accept='audio/mpeg'} -ContentType 'application/json' -Body ([System.Text.Encoding]::UTF8.GetBytes($body)) -OutFile $audioPath
  Write-Output ('CREATED '+$entry.Name)
}
Write-Output ('Nora audio files: '+$scripts.PSObject.Properties.Count)
