# Auditoria de audio profesional - Ingles basico pronunciacion

Fecha: 2026-07-12

## Objetivo

Verificar que las paginas de pronunciacion de ingles basico usen modelos MP3 profesionales y no dependan de voces del navegador para palabras individuales.

## Resultado ejecutivo

- Archivos revisados contra voz del navegador: 12.
- Referencias MP3 revisadas: 30.
- Patrones prohibidos encontrados: 0.
- MP3 faltantes o sospechosamente pequenos: 0.

## Patrones prohibidos

OK. No se encontro `speechSynthesis`, `SpeechSynthesisUtterance`, `webkitSpeechSynthesis` ni `responsiveVoice` en las paginas o JS de pronunciacion basica.

## MP3 revisados

| Area | Archivo | Estado | Bytes |
| --- | --- | --- | ---: |
| Unit 1 pronunciation | `audio/pronunciation/unit-1/section-1.mp3` | OK | 56886 |
| Unit 1 pronunciation | `audio/pronunciation/unit-1/section-2.mp3` | OK | 41839 |
| Unit 1 pronunciation | `audio/pronunciation/unit-1/section-3.mp3` | OK | 61902 |
| Unit 1 pronunciation | `audio/pronunciation/unit-1/section-4.mp3` | OK | 61066 |
| Unit 1 pronunciation | `audio/pronunciation/unit-1/introducing-myself-model-us.mp3` | OK | 238280 |
| Unit 2 pronunciation | `audio/pronunciation/unit-2/section-1.mp3` | OK | 81128 |
| Unit 2 pronunciation | `audio/pronunciation/unit-2/section-2.mp3` | OK | 58140 |
| Unit 2 pronunciation | `audio/pronunciation/unit-2/section-3.mp3` | OK | 56886 |
| Unit 2 pronunciation | `audio/pronunciation/unit-2/section-4.mp3` | OK | 35988 |
| Unit 2 pronunciation | `audio/pronunciation/unit-2/in-my-classroom-model-us.mp3` | OK | 238698 |
| Unit 3 pronunciation | `audio/pronunciation/unit-3/section-1.mp3` | OK | 44347 |
| Unit 3 pronunciation | `audio/pronunciation/unit-3/section-2.mp3` | OK | 46437 |
| Unit 3 pronunciation | `audio/pronunciation/unit-3/section-3.mp3` | OK | 97846 |
| Unit 3 pronunciation | `audio/pronunciation/unit-3/section-4.mp3` | OK | 74440 |
| Unit 3 pronunciation | `audio/pronunciation/unit-3/my-favorite-person-model-us.mp3` | OK | 261268 |
| Unit 4 pronunciation | `audio/pronunciation/unit-4/section-1.mp3` | OK | 73186 |
| Unit 4 pronunciation | `audio/pronunciation/unit-4/section-2.mp3` | OK | 58976 |
| Unit 4 pronunciation | `audio/pronunciation/unit-4/section-3.mp3` | OK | 71097 |
| Unit 4 pronunciation | `audio/pronunciation/unit-4/section-4.mp3` | OK | 54378 |
| Unit 4 pronunciation | `audio/pronunciation/unit-4/my-healthy-day-model-us.mp3` | OK | 249983 |
| Unit 5 pronunciation | `audio/pronunciation/unit-5/section-1.mp3` | OK | 60648 |
| Unit 5 pronunciation | `audio/pronunciation/unit-5/section-2.mp3` | OK | 55214 |
| Unit 5 pronunciation | `audio/pronunciation/unit-5/section-3.mp3` | OK | 64409 |
| Unit 5 pronunciation | `audio/pronunciation/unit-5/section-4.mp3` | OK | 74440 |
| Unit 5 pronunciation | `audio/pronunciation/unit-5/my-free-time-model-us.mp3` | OK | 260432 |
| Unit 6 pronunciation | `audio/pronunciation/unit-6/section-1.mp3` | OK | 53124 |
| Unit 6 pronunciation | `audio/pronunciation/unit-6/section-2.mp3` | OK | 55214 |
| Unit 6 pronunciation | `audio/pronunciation/unit-6/section-3.mp3` | OK | 54378 |
| Unit 6 pronunciation | `audio/pronunciation/unit-6/section-4.mp3` | OK | 59812 |
| Unit 6 pronunciation | `audio/pronunciation/unit-6/my-neighborhood-model-us.mp3` | OK | 233683 |

## Decision tecnica aplicada

- En pronunciacion basica, las palabras resaltadas ya no reproducen audio del navegador; ahora abren una nota de pronunciacion.
- El modelo de escucha sigue siendo el MP3 profesional de cada seccion o reto final.
- Si se reporta una palabra mal pronunciada en estos labs, el siguiente paso debe ser revisar el MP3 profesional correspondiente, no una voz sintetica del dispositivo.

Comando:

```powershell
python tools/audit_basic_pronunciation_professional_audio_sources.py
```
