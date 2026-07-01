# Auditoria tecnica - Tema 01 Frances Nivel 8

Fecha: 2026-06-30

Tema auditado: `Regrets, reproches et bilans`

Objetivo: confirmar si las comprensiones orales 01A, 01B y 01C cumplen el estandar tecnico definido para Nivel 8: audio entre 1:30 y 2:00, variantes Francia/Quebec diferenciadas, transcripcion docente controlada, preguntas coordinadas con la transcripcion y ausencia de informacion inventada.

## Resultado general

El Tema 01 queda aprobado en auditoria textual y estructural. Las seis pistas de audio estan dentro del rango 1:30-2:00 y las preguntas revisadas se apoyan en los guiones disponibles.

Actualizacion 2026-07-01: la auditoria STT con ElevenLabs Scribe quedo registrada en `docs/auditoria-stt-temas01-06-frances-nivel8.md`. Tema 01 queda aprobado tecnicamente por coincidencia audio/transcripcion; solo queda escucha humana subjetiva opcional para ritmo y naturalidad.

## Duracion de audios

| Actividad | Variante | Archivo | Duracion | Estado |
| --- | --- | --- | ---: | --- |
| 01A | France | `n8-01a-choix-carriere-france-b2.mp3` | 110.6s | OK |
| 01A | Quebec | `n8-01a-choix-carriere-quebec-b2.mp3` | 112.0s | OK |
| 01B | France | `n8-01b-regrets-francais-france-b2.mp3` | 107.6s | OK |
| 01B | Quebec | `n8-01b-regrets-francais-quebec-b2.mp3` | 105.9s | OK |
| 01C | France | `n8-01c-projet-municipal-france-b2.mp3` | 95.7s | OK |
| 01C | Quebec | `n8-01c-projet-municipal-quebec-b2.mp3` | 107.5s | OK |

Los hashes de los archivos Francia y Quebec son diferentes en las tres actividades, por lo que no son duplicados binarios.

## Transcripciones

| Actividad | France | Quebec | Estado |
| --- | --- | --- | --- |
| 01A | La transcripcion embebida en HTML coincide con el markdown France. | La transcripcion se carga desde `french8-listenings-b2-quebec-scripts.md`. | OK textual |
| 01B | La transcripcion embebida en HTML coincide con el markdown France. | La transcripcion se carga desde `french8-listenings-b2-quebec-scripts.md`. | OK textual |
| 01C | La transcripcion embebida en HTML coincide con el markdown France. | La transcripcion se carga desde `french8-listenings-b2-quebec-scripts.md`. | OK textual |

Observacion tecnica: para Quebec, las paginas usan `french8-listening-activity-data.js` para sustituir preguntas y `french8-listening-activity.js` para descargar la transcripcion Quebec desde el markdown correspondiente. La sintaxis de estos scripts pasa validacion con Node.

## Auditoria de preguntas

| Actividad | Variante | Preguntas | Resultado |
| --- | --- | ---: | --- |
| 01A | France | 10 | Todas tienen respaldo en la transcripcion. |
| 01A | Quebec | 10 | Todas tienen respaldo en la transcripcion. |
| 01B | France | 10 | Todas tienen respaldo en la transcripcion. |
| 01B | Quebec | 10 | Todas tienen respaldo en la transcripcion. |
| 01C | France | 10 | Todas tienen respaldo en la transcripcion. |
| 01C | Quebec | 10 | Todas tienen respaldo en la transcripcion. |

No se detectaron preguntas con informacion externa, datos inventados ni respuestas correctas que contradigan el guion escrito.

## Veredicto

Tema 01 puede mantenerse como cerrado pedagogicamente y aprobado en QA textual.

Tema 01 queda cerrado tambien en audio por STT. La unica decision pendiente sigue siendo pedagogico-evaluativa: si 01E se mantiene formativa o se convierte en entrega formal al docente.
