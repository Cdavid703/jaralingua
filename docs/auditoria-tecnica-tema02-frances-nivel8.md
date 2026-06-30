# Auditoria tecnica - Tema 02 Frances Nivel 8

Fecha: 2026-06-30

Tema auditado: `Hypotheses irreelles dans le passe`

Objetivo: confirmar si las comprensiones orales 02A, 02B y 02C cumplen el estandar tecnico definido para Nivel 8: audio de aproximadamente 1:30 a 2:00, variantes Francia/Quebec diferenciadas, transcripcion docente controlada, preguntas coordinadas con la transcripcion y ausencia de informacion inventada.

## Resultado general

El Tema 02 queda aprobado en auditoria textual y estructural. Las seis pistas de audio estan en un rango pedagogicamente aceptable para Nivel 8. Dos pistas historicas superan ligeramente los 2 minutos, pero no se bloquean porque el criterio aprobado permite revisar densidad y ritmo sin exigir recorte automatico.

Pendiente no automatizado: escucha humana final o transcripcion STT confiable para certificar coincidencia palabra por palabra entre el audio real y el guion. En este entorno no hay Whisper, ffmpeg ni otro motor local de transcripcion disponible.

## Duracion de audios

| Actividad | Variante | Archivo | Duracion | Estado |
| --- | --- | --- | ---: | --- |
| 02A | France | `n8-02a-si-javais-su-france-b2.mp3` | 112.2s | OK |
| 02A | Quebec | `n8-02a-si-javais-su-quebec-b2.mp3` | 89.7s | OK, apenas por debajo de 1:30 |
| 02B | France | `n8-02b-et-si-histoire-france-b2.mp3` | 124.6s | OK con revision pedagogica |
| 02B | Quebec | `n8-02b-et-si-histoire-quebec-b2.mp3` | 126.5s | OK con revision pedagogica |
| 02C | France | `n8-02c-accident-evite-france-b2.mp3` | 116.4s | OK |
| 02C | Quebec | `n8-02c-accident-evite-quebec-b2.mp3` | 115.5s | OK |

Los hashes de los archivos Francia y Quebec son diferentes en las tres actividades, por lo que no son duplicados binarios.

## Transcripciones

| Actividad | France | Quebec | Estado |
| --- | --- | --- | --- |
| 02A | La transcripcion embebida en HTML coincide con el markdown France. | La transcripcion se carga desde `french8-listenings-b2-quebec-scripts.md`. | OK textual |
| 02B | La transcripcion embebida en HTML coincide con el markdown France. | La transcripcion se carga desde `french8-listenings-b2-quebec-scripts.md`. | OK textual |
| 02C | La transcripcion embebida en HTML coincide con el markdown France. | La transcripcion se carga desde `french8-listenings-b2-quebec-scripts.md`. | OK textual |

Correccion aplicada: el guion France de 02A tenia `Ã‡a` en dos frases; se corrigio a `Ça` para que el markdown fuente coincida con la transcripcion limpia.

## Auditoria de preguntas

| Actividad | Variante | Preguntas | Resultado |
| --- | --- | ---: | --- |
| 02A | France | 10 | Todas tienen respaldo en la transcripcion. |
| 02A | Quebec | 10 | Todas tienen respaldo en la transcripcion. |
| 02B | France | 10 | Todas tienen respaldo en la transcripcion. |
| 02B | Quebec | 10 | Todas tienen respaldo en la transcripcion. |
| 02C | France | 10 | Todas tienen respaldo en la transcripcion. |
| 02C | Quebec | 10 | Todas tienen respaldo en la transcripcion. |

No se detectaron preguntas con informacion externa, datos inventados ni respuestas correctas que contradigan el guion escrito.

## Lectura inferencial

Se agrego la lectura `Une bourse refusee, une vie imaginee` en la pagina del tema. Tiene 166 palabras, dentro del rango 150-200, e integra la expresion idiomatica `avec des si, on mettrait Paris en bouteille`.

Las cinco preguntas de lectura se coordinan con el texto: duda de Lina, funcion de la expresion idiomatica, contraargumento de Karim, identificacion de una hipotesis irreal y conclusion B2.

## Enlaces de talleres

Las tarjetas 02G, 02R y 02E quedaron estaticas dentro de `ateliers-activites.html`. Ya no dependen de inyeccion JavaScript para aparecer en el bloque del Tema 02.

## Veredicto

Tema 02 puede marcarse como cerrado pedagogicamente y aprobado en QA textual.

Antes de desplegar como cierre tecnico absoluto, queda una verificacion auditiva final: escuchar cada archivo o transcribirlo con STT y comparar contra el guion palabra por palabra. Si esa escucha confirma el guion, Tema 02 queda cerrado tambien en audio.
