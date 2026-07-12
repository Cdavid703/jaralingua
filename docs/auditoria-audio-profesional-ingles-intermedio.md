# Auditoria de audio profesional - Ingles intermedio

Fecha: 2026-07-12

## Objetivo

Verificar que las actividades de ingles intermedio no dependan de voces del navegador para modelos de audio del estudiante. Los modelos deben usar MP3 locales generados profesionalmente, principalmente ElevenLabs.

## Resultado ejecutivo

- Archivos revisados contra voz del navegador: 58.
- Referencias MP3 revisadas: 49.
- Patrones prohibidos encontrados: 0.
- MP3 faltantes o sospechosamente pequenos: 0.

## Patrones prohibidos

OK. No se encontro `speechSynthesis`, `SpeechSynthesisUtterance`, `webkitSpeechSynthesis` ni `responsiveVoice` en ingles intermedio ni en los JS de pronunciacion intermedia.

## MP3 revisados

| Area | Archivo | Estado | Bytes |
| --- | --- | --- | ---: |
| Unit 1 pronunciation | `audio/pronunciation/unit-1-intermediate/section-1.mp3` | OK | 78202 |
| Unit 1 pronunciation | `audio/pronunciation/unit-1-intermediate/section-2.mp3` | OK | 72351 |
| Unit 1 pronunciation | `audio/pronunciation/unit-1-intermediate/section-3.mp3` | OK | 67753 |
| Unit 1 pronunciation | `audio/pronunciation/unit-1-intermediate/section-4.mp3` | OK | 85725 |
| Unit 1 pronunciation | `audio/pronunciation/unit-1-intermediate/beyond-first-impressions-model-us.mp3` | OK | 327306 |
| Unit 2 pronunciation | `audio/pronunciation/unit-2-intermediate/section-1.mp3` | OK | 58140 |
| Unit 2 pronunciation | `audio/pronunciation/unit-2-intermediate/section-2.mp3` | OK | 70261 |
| Unit 2 pronunciation | `audio/pronunciation/unit-2-intermediate/section-3.mp3` | OK | 51453 |
| Unit 2 pronunciation | `audio/pronunciation/unit-2-intermediate/section-4.mp3` | OK | 81964 |
| Unit 2 pronunciation | `audio/pronunciation/unit-2-intermediate/study-abroad-model-us.mp3` | OK | 278822 |
| Unit 3 pronunciation | `audio/pronunciation/unit-3-intermediate/section-1.mp3` | OK | 61902 |
| Unit 3 pronunciation | `audio/pronunciation/unit-3-intermediate/section-2.mp3` | OK | 84471 |
| Unit 3 pronunciation | `audio/pronunciation/unit-3-intermediate/section-3.mp3` | OK | 57722 |
| Unit 3 pronunciation | `audio/pronunciation/unit-3-intermediate/section-4.mp3` | OK | 59812 |
| Unit 3 pronunciation | `audio/pronunciation/unit-3-intermediate/unforgettable-natural-wonder-model-us.mp3` | OK | 285510 |
| Unit 4 pronunciation | `audio/pronunciation/unit-4-intermediate/section-1.mp3` | OK | 53960 |
| Unit 4 pronunciation | `audio/pronunciation/unit-4-intermediate/section-2.mp3` | OK | 50199 |
| Unit 4 pronunciation | `audio/pronunciation/unit-4-intermediate/section-3.mp3` | OK | 70261 |
| Unit 4 pronunciation | `audio/pronunciation/unit-4-intermediate/section-4.mp3` | OK | 69425 |
| Unit 4 pronunciation | `audio/pronunciation/unit-4-intermediate/family-stories-model-us.mp3` | OK | 239534 |
| Unit 5 pronunciation | `audio/pronunciation/unit-5-intermediate/section-1.mp3` | OK | 52288 |
| Unit 5 pronunciation | `audio/pronunciation/unit-5-intermediate/section-2.mp3` | OK | 53124 |
| Unit 5 pronunciation | `audio/pronunciation/unit-5-intermediate/section-3.mp3` | OK | 58976 |
| Unit 5 pronunciation | `audio/pronunciation/unit-5-intermediate/section-4.mp3` | OK | 62737 |
| Unit 5 pronunciation | `audio/pronunciation/unit-5-intermediate/food-quantities-model-us.mp3` | OK | 244132 |
| Unit 5 food memory word | `audio/unit-5-food-memory/cucumber-word.mp3` | OK | 15090 |
| Unit 5 food memory sentence | `audio/unit-5-food-memory/cucumber-sentence.mp3` | OK | 38078 |
| Unit 5 food memory word | `audio/unit-5-food-memory/onion-word.mp3` | OK | 13836 |
| Unit 5 food memory sentence | `audio/unit-5-food-memory/onion-sentence.mp3` | OK | 34316 |
| Unit 5 food memory word | `audio/unit-5-food-memory/potato-word.mp3` | OK | 13836 |
| Unit 5 food memory sentence | `audio/unit-5-food-memory/potato-sentence.mp3` | OK | 30973 |
| Unit 5 food memory word | `audio/unit-5-food-memory/pepper-word.mp3` | OK | 13836 |
| Unit 5 food memory sentence | `audio/unit-5-food-memory/pepper-sentence.mp3` | OK | 27629 |
| Unit 5 food memory word | `audio/unit-5-food-memory/mushroom-word.mp3` | OK | 15090 |
| Unit 5 food memory sentence | `audio/unit-5-food-memory/mushroom-sentence.mp3` | OK | 33898 |
| Unit 5 food memory word | `audio/unit-5-food-memory/pineapple-word.mp3` | OK | 13836 |
| Unit 5 food memory sentence | `audio/unit-5-food-memory/pineapple-sentence.mp3` | OK | 35988 |
| Unit 5 food memory word | `audio/unit-5-food-memory/grapes-word.mp3` | OK | 12164 |
| Unit 5 food memory sentence | `audio/unit-5-food-memory/grapes-sentence.mp3` | OK | 33898 |
| Unit 5 food memory word | `audio/unit-5-food-memory/watermelon-word.mp3` | OK | 17598 |
| Unit 5 food memory sentence | `audio/unit-5-food-memory/watermelon-sentence.mp3` | OK | 24285 |
| Unit 5 food memory word | `audio/unit-5-food-memory/cereal-word.mp3` | OK | 14254 |
| Unit 5 food memory sentence | `audio/unit-5-food-memory/cereal-sentence.mp3` | OK | 30137 |
| Unit 5 food memory word | `audio/unit-5-food-memory/soup-word.mp3` | OK | 15090 |
| Unit 5 food memory sentence | `audio/unit-5-food-memory/soup-sentence.mp3` | OK | 30137 |
| Unit 5 food memory word | `audio/unit-5-food-memory/butter-word.mp3` | OK | 12164 |
| Unit 5 food memory sentence | `audio/unit-5-food-memory/butter-sentence.mp3` | OK | 30137 |
| Unit 5 food memory word | `audio/unit-5-food-memory/flour-word.mp3` | OK | 14254 |
| Unit 5 food memory sentence | `audio/unit-5-food-memory/flour-sentence.mp3` | OK | 27211 |

## Decision tecnica aplicada

- En las paginas de pronunciacion, las palabras resaltadas ya no reproducen audio del navegador; ahora abren una nota de pronunciacion y remiten al modelo profesional de la seccion.
- En el juego Unit 5 Food Vocabulary Memory, si un MP3 profesional no carga, la pagina muestra aviso tecnico en lugar de improvisar con voz del navegador.
- Esta auditoria debe ejecutarse antes de publicar nuevas actividades con audio en ingles intermedio.

Comando:

```powershell
python tools/audit_intermediate_professional_audio_sources.py
```
