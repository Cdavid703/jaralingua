param(
  [switch]$Overwrite
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $root "elevenlabs.local.env"
$output = Join-Path $root "ingles\intermediate\audio\unit-5-market-dinner-plan.mp3"
$voiceId = "EXAVITQu4vr4xnSDxMaL"

if (-not (Test-Path -LiteralPath $envFile)) {
  throw "Missing elevenlabs.local.env"
}

if ((Test-Path -LiteralPath $output) -and -not $Overwrite) {
  Write-Output ("SKIPPED " + (Resolve-Path -LiteralPath $output).Path)
  return
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

$text = @"
Narrator: Three classmates are planning a healthy dinner for six people at a small international food fair. They have to choose ingredients, quantities, and one cultural connection.

Sara: We need a dinner for six people. It should be healthy, but it should also feel Colombian.

Mateo: What about a rice bowl with beans, avocado, vegetables, and grilled chicken? It is not exactly bandeja paisa, but it uses familiar ingredients in a lighter way.

Nina: I like that. How much rice do we need?

Mateo: For six people, we need about three cups of cooked rice. Rice is uncountable, so we say some rice or a cup of rice, not three rices.

Sara: Good point. We also need two cans of beans, six small pieces of chicken, and a lot of vegetables.

Nina: Do we have any lettuce?

Sara: No, we do not have any lettuce yet, but we have some tomatoes, some corn, and two avocados.

Mateo: Let's buy a head of lettuce, a bag of carrots, and a bottle of lime juice. The dressing can be made with lime, a little oil, salt, and cilantro.

Nina: Should we add something sweet?

Sara: Maybe a fruit salad. We can use some mango, a few strawberries, and a little yogurt. It gives color without too much sugar.

Narrator: Their shorter plan includes quantities, countable and uncountable nouns, healthy ingredients, and a simple cultural connection.
"@

New-Item -ItemType Directory -Path (Split-Path -Parent $output) -Force | Out-Null

$headers = @{
  "xi-api-key" = $apiKey
  "Accept" = "audio/mpeg"
}
$body = @{
  text = $text
  model_id = "eleven_multilingual_v2"
  language_code = "en"
  voice_settings = @{
    stability = 0.62
    similarity_boost = 0.82
    style = 0.16
    use_speaker_boost = $true
  }
} | ConvertTo-Json -Depth 4
$uri = "https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128"

Invoke-WebRequest -Uri $uri -Method Post -Headers $headers -ContentType "application/json" -Body $body -OutFile $output
Write-Output ("CREATED " + (Resolve-Path -LiteralPath $output).Path)
