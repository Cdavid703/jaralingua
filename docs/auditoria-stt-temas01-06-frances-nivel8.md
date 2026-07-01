# Auditoria STT - Temas 01 a 06 Frances Nivel 8

Fecha: 2026-07-01.

Motor usado: ElevenLabs Scribe. No se activo servidor local.

Alcance:

- 36 audios de comprension oral: temas 01 a 06, actividades A, B y C, acentos France y Quebec.
- 26 audios de pronunciacion: 01D final, 02D-06D por secciones y desafio final.
- Total auditado: 62 MP3.

Herramienta creada:

- `tools/audit_french8_stt.py`
- Reporte JSON temporal: `tmp/french8-themes01-06-stt-audit.json`

## Resultado ejecutivo

La auditoria no encontro preguntas basadas en informacion ausente ni audios mayores con transcripciones equivocadas. Los desajustes detectados fueron de tres tipos:

- Formato STT: numeros como `2010`, `1815`, `2035`, porcentajes y nombres propios.
- Homofonia o singular/plural no audible: `au/aux`, `contenu/contenus`, `consulte/consultent`.
- Ambiguedad de pronunciacion en un segmento corto: 03D section 2.

Correcciones aplicadas:

- 02A France: se agrego `Ah,` a la transcripcion canonica y a la pagina HTML porque el audio real dice `Ah, ca donne le vertige`.
- 02D: se cambio `j'etais parti / je serais arrive` a `j'etais partie / je serais arrivee`, porque la voz modelo es Claire y la auditoria STT confirmo la lectura femenina.
- 03D section 2: se reemplazo la frase ambigua `qu'ils aient presente des excuses publiques` por `que les responsables aient presente leurs excuses publiquement`; se regeneraron `section-2.mp3` y el desafio final 03D.

## Tabla consolidada

| Tema | Audios auditados | Promedio STT | Minimo final | Audios al 100% | Veredicto |
| --- | ---: | ---: | --- | ---: | --- |
| 01 | 7 | 99.07% | 01D France final: 98.11% | 0 | Aprobado. Diferencias menores de STT. |
| 02 | 11 | 99.64% | 02C France: 98.74% | 6 | Aprobado. 02A y 02D corregidos. |
| 03 | 11 | 99.74% | 03D France final: 98.18% | 8 | Aprobado. 03D section 2 quedo en 100%; final tiene insercion STT aislada de `y`. |
| 04 | 11 | 99.91% | 04B Quebec: 99.36% | 9 | Aprobado. |
| 05 | 11 | 99.42% | 05A France: 97.81% | 5 | Aprobado con nota: singular/plural y `CheckNews/Check News`; sin informacion extra. |
| 06 | 11 | 99.94% | 06C France: 99.68% | 9 | Aprobado. |

## Observaciones por tema

### Tema 01

Todos los audios coinciden con el contenido esperado. Las diferencias son de interpretacion STT: `poussee/pousse`, `architectes/architecte`, singular/plural y nombres de hablantes omitidos por Scribe.

### Tema 02

02A France tenia un `Ah` audible antes de `ca donne le vertige`; se corrigio el guion y la transcripcion HTML.

02D quedo corregido a femenino para concordar con la voz modelo Claire. Despues de la correccion:

- 02D final: 100%.
- 02D section 1: 100%.
- 02D sections 2-4: 100%.

### Tema 03

Las comprensiones 03A-03C quedan aprobadas. 03D section 2 fue el unico caso pedagogicamente delicado: Scribe leia `qu'il ait` en vez de `qu'ils aient`. Para evitar una ambiguedad de liaison en una actividad evaluada por STT, se cambio la frase a `que les responsables aient presente leurs excuses publiquement` y se regenero el audio.

Resultado posterior:

- 03D section 2: 100%.
- 03D final: 98.18%, con una insercion aislada de `y` por STT; no altera la transcripcion esperada ni el contenido.

### Tema 04

Auditoria aprobada. Las diferencias restantes son menores: `ses/ces`, singular/plural y formato de numeros.

### Tema 05

05A France queda en 97.81%, pero el analisis contextual confirma que no hay informacion ausente ni guion incorrecto. Las diferencias son:

- `aux contenus` / `au contenu`.
- `il cite` / `ils citent`.
- `CheckNews` / `Check News`.
- `consulte` / `consultent`.

Estas diferencias no cambian el contenido del audio y no requieren regeneracion.

### Tema 06

Auditoria aprobada. Los audios 06A-06C y 06D ya habian sido auditados; esta corrida confirma nuevamente la alineacion general. 06D se mantiene en 100%.

## Veredicto

Los temas 01 a 06 quedan cerrados tecnicamente por STT para coincidencia audio/transcripcion. Queda como opcional una escucha humana subjetiva para ritmo, naturalidad y comodidad auditiva, pero no queda un pendiente tecnico de transcripcion palabra por palabra.
