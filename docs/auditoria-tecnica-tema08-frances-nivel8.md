# Auditoria tecnica - Frances Nivel 8 - Tema 08

Fecha: 2026-07-01

Tema: Francophonie, registres et francais oral authentique.

## Alcance

- Pagina de tema 08.
- Comprensiones orales 08A, 08B y 08C con variantes France/Quebec.
- Actividades 08G, 08R, 08E y 08D.
- Audios de pronunciacion 08D generados con ElevenLabs.
- Auditoria STT con ElevenLabs Scribe contra guiones canonicos.

## Resultados STT

| Audio | Similitud |
| --- | ---: |
| 08A France | 98.94% |
| 08A Quebec | 97.80% |
| 08B France | 98.67% |
| 08B Quebec | 97.01% |
| 08C France | 96.66% |
| 08C Quebec | 98.14% |
| 08D modele final France | 97.96% |
| 08D section 1 | 100.00% |
| 08D section 2 | 100.00% |
| 08D section 3 | 100.00% |
| 08D section 4 | 100.00% |

Reporte JSON: `reports/french8-theme08-stt-audit.json`.

## Ajuste pedagogico aplicado

Para el frances oral reducido, el evaluador de pronunciacion 08D acepta equivalencias como:

- `j'sais`, `chais` y `je sais`.
- `y'a`, `y a` e `il y a`.
- `t'as` y `tu as`.
- `j'te` y `je te`.

Esto evita penalizar al estudiante cuando el STT transcribe una forma oral autentica con una segmentacion distinta.

## Validaciones

- `node --check assets/js/french8-pronunciation-theme08.js`: OK.
- `python -m py_compile tools/build_french8_theme08.py tools/audit_french8_stt.py`: OK.
- Validacion estatica de referencias locales en paginas nuevas y portales: OK.

