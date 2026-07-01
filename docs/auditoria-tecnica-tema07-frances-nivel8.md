# Auditoria tecnica - Tema 07 Frances Nivel 8

Tema: Justice sociale, egalite et citoyennete.

## Archivos creados

- `frances/Niveau 8/themes/justice-sociale-egalite-citoyennete.html`
- `frances/Niveau 8/ateliers/comprehension-orale-07a-egalite-chances.html`
- `frances/Niveau 8/ateliers/comprehension-orale-07b-engagement-citoyen.html`
- `frances/Niveau 8/ateliers/comprehension-orale-07c-discrimination-embauche.html`
- `frances/Niveau 8/ateliers/atelier-concession-opposition.html`
- `frances/Niveau 8/ateliers/debat-citoyen-egalite.html`
- `frances/Niveau 8/ateliers/production-07e-prise-position.html`
- `frances/Niveau 8/ateliers/prononciation-07d-justice-sociale.html`
- `assets/js/french8-pronunciation-theme07.js`
- `frances/Niveau 8/audio/pronunciation-justice-sociale-script.md`
- `frances/Niveau 8/audio/pronunciation/theme-07/section-1.mp3`
- `frances/Niveau 8/audio/pronunciation/theme-07/section-2.mp3`
- `frances/Niveau 8/audio/pronunciation/theme-07/section-3.mp3`
- `frances/Niveau 8/audio/pronunciation/theme-07/section-4.mp3`
- `frances/Niveau 8/audio/pronunciation/theme-07/n8-07d-justice-sociale-modele-france.mp3`
- `frances/Niveau 8/img/themes/theme-07-justice-sociale-citoyennete-hero.png`
- `frances/Niveau 8/img/ateliers/listening-07a-egalite-chances.png`
- `frances/Niveau 8/img/ateliers/listening-07b-engagement-citoyen.png`
- `frances/Niveau 8/img/ateliers/listening-07c-discrimination-embauche.png`

## Archivos modificados

- `assets/js/french8-listening-activity-data.js`
- `frances/Niveau 8/themes-du-cours.html`
- `frances/Niveau 8/ateliers-activites.html`
- `frances/Niveau 8/expressions-idiomatiques.html`
- `docs/plan-maestro-frances-nivel8.md`
- `frances/Niveau 8/ateliers/comprehension-orale-07a-egalite-chances.html`
- `frances/Niveau 8/ateliers/comprehension-orale-07b-engagement-citoyen.html`
- `frances/Niveau 8/ateliers/comprehension-orale-07c-discrimination-embauche.html`
- `tools/audit_french8_theme07_stt.py`

## Cobertura pedagogica

- Pagina principal con explicacion de concession/opposition: `bien que`, `quoique`, `meme si`, `malgre`, `cependant`, `toutefois`.
- Lectura avanzada de tema entre 150 y 200 palabras, con preguntas coordinadas al texto.
- Expresiones idiomaticas integradas en audios, lectura, conversacion, produccion y pronunciacion: `l'ascenseur social reste en panne`, `ne pas baisser les bras`, `briser le plafond de verre`, `un chemin seme d'embuches`.
- Tres comprensiones orales 07A, 07B y 07C con selector France/Quebec y preguntas Quebec agregadas al archivo comun.
- Taller gramatical 07G con 15 preguntas.
- Conversacion 07R tipo ruleta/table citoyenne con escenario, rol, restriccion gramatical, temporizador y expresion idiomatica obligatoria.
- Produccion 07E con consigna fija, validacion de conectores, expresion idiomatica obligatoria y grabacion local para feedback profesor.
- Pronunciacion 07D con 4 secciones, desafio final, audios modelo ElevenLabs, reinicio total y panel de envio a notas heredado del flujo 06D.
- Paquete visual especifico para el tema y las tres comprensiones orales.

## Verificacion tecnica

- `node --check assets/js/french8-listening-activity-data.js`: OK.
- `node --check assets/js/french8-pronunciation-theme07.js`: OK.
- Busqueda de mojibake en `prononciation-07d-justice-sociale.html` y `french8-pronunciation-theme07.js`: sin patrones rotos detectados despues de la correccion.
- Audios 07D generados con ElevenLabs: 4 secciones + desafio final.
- QA visual/estructural sin servidor local:
  - No quedan referencias locales rotas en las 8 paginas nuevas del tema 07 ni en los portales principales.
  - Todas las paginas nuevas tienen `title`, `h1`, media query movil, imagen con `alt` y controles esperados.
  - 07A, 07B y 07C tienen 10 preguntas cada una.
  - 07G tiene 15 preguntas.
  - 07R tiene 5 escenarios, 6 roles y banco de frases idiomaticas.
  - 07D tiene 5 etapas y audios existentes.
  - Imagenes tema 07 verificadas: 1672 x 941 px, archivos no corruptos.
- Auditoria STT ElevenLabs Scribe realizada el 2026-07-01, sin activar servidor local:
  - 07A France: 98.76% bruto; diferencias solo por `quoique` transcrito como `quoi que`.
  - 07A Quebec: 99.01% bruto; diferencia de formato `trente pour cent` transcrito como `30 %`.
  - 07B France: 99.04% bruto; diferencias solo por `auteure/auteur` y `quoique/quoi que`.
  - 07B Quebec: 100%.
  - 07C France: 100%.
  - 07C Quebec: 100%.
  - 07D France, modele final: 100%.
- Correcciones derivadas de la auditoria STT:
  - Las transcripciones France embebidas en 07A, 07B y 07C eran versiones redactadas; se reemplazaron por el guion canonico palabra por palabra.
  - Se ajustaron tres preguntas France que agregaban informacion no exacta o mejor correspondian a la variante Quebec: direccion postal en 07A, desafio protestation/proposition en 07B y procedimientos largos en 07C.
  - Verificacion estatica posterior: scripts embebidos de 07A, 07B y 07C ejecutan sin error; transcripciones France embebidas coinciden con el markdown canonico al normalizar espacios.

## Pendientes

- QA visual real en navegador queda limitado porque el navegador interno bloqueo URLs `file://` por politica de seguridad y no se debe activar servidor local para esta revision.
- Escucha humana subjetiva opcional para confirmar naturalidad, ritmo y comodidad auditiva. La alineacion texto/audio ya fue validada por STT.
