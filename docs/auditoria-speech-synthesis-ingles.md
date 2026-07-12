# Auditoria speech synthesis - Ingles

Fecha: 2026-07-12

## Objetivo

Confirmar que las paginas y actividades de ingles no usen voces del navegador (`speechSynthesis` / `SpeechSynthesisUtterance`) para modelos de pronunciacion o vocabulario.

## Resultado

- Ingles basico pronunciacion: limpio.
- Ingles intermedio pronunciacion y actividades auditadas: limpio.
- Juego `ingles/basico/game-unit-6-neighborhood-memory.html`: corregido; ahora usa MP3 profesionales de `audio/unit6/cards/*.mp3`.
- Busqueda completa en `ingles/`: sin patrones `speechSynthesis`, `SpeechSynthesisUtterance`, `webkitSpeechSynthesis` ni `responsiveVoice`.

## Correccion aplicada

El juego de memoria de Unit 6 basico tenia un fallback antiguo con voz del navegador. Ese fallback fue eliminado. Si un MP3 profesional no carga, la pagina muestra un aviso tecnico en vez de producir una voz sintetica del dispositivo.

## Comandos de verificacion

```powershell
rg -n "speechSynthesis|SpeechSynthesisUtterance|webkitSpeechSynthesis|responsiveVoice" ingles
python tools\audit_basic_pronunciation_professional_audio_sources.py
python tools\audit_intermediate_professional_audio_sources.py
```
