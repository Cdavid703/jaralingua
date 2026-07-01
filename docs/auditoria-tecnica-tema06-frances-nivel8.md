# Auditoria tecnica - Tema 06 Frances Nivel 8

Tema: Intelligence artificielle et ethique numerique.

## Archivos creados

- `frances/Niveau 8/themes/ia-ethique-numerique.html`
- `frances/Niveau 8/ateliers/comprehension-orale-06a-ia-travail.html`
- `frances/Niveau 8/ateliers/comprehension-orale-06b-reconnaissance-faciale.html`
- `frances/Niveau 8/ateliers/comprehension-orale-06c-regulation-ia.html`
- `frances/Niveau 8/ateliers/atelier-cause-consequence-but.html`
- `frances/Niveau 8/ateliers/comite-ethique-ia.html`
- `frances/Niveau 8/ateliers/production-06e-decision-technologique.html`
- `frances/Niveau 8/ateliers/prononciation-06d-ia-ethique.html`
- `assets/js/french8-pronunciation-theme06.js`
- `frances/Niveau 8/audio/pronunciation-ia-ethique-script.md`
- `frances/Niveau 8/audio/pronunciation/theme-06/section-1.mp3`
- `frances/Niveau 8/audio/pronunciation/theme-06/section-2.mp3`
- `frances/Niveau 8/audio/pronunciation/theme-06/section-3.mp3`
- `frances/Niveau 8/audio/pronunciation/theme-06/section-4.mp3`
- `frances/Niveau 8/audio/pronunciation/theme-06/n8-06d-ia-ethique-modele-france.mp3`
- `frances/Niveau 8/img/themes/theme-06-ia-ethique-numerique-hero.png`
- `frances/Niveau 8/img/ateliers/listening-06a-ia-travail.png`
- `frances/Niveau 8/img/ateliers/listening-06b-reconnaissance-faciale.png`
- `frances/Niveau 8/img/ateliers/listening-06c-regulation-ia.png`
- `frances/Niveau 8/img/ateliers/comite-ethique-ia.png`
- `frances/Niveau 8/img/ateliers/production-06e-decision-technologique.png`

## Archivos modificados

- `assets/js/french8-listening-activity-data.js`
- `frances/Niveau 8/themes-du-cours.html`
- `frances/Niveau 8/ateliers-activites.html`

## Cobertura pedagogica

- Pagina principal con explicacion de causa, consecuencia y finalidad.
- Lectura de tema entre 150 y 200 palabras.
- Expresion idiomatica integrada: `jouer avec le feu`.
- Tres comprensiones orales 06A, 06B y 06C usando audios existentes France/Quebec.
- Preguntas Quebec agregadas al archivo comun para que el boton de acento cambie tambien el cuestionario.
- Taller gramatical 06G con 15 preguntas.
- Simulacion oral 06R: comite etico sobre uso institucional de IA.
- Produccion 06E con texto argumentativo, validacion de conectores y grabacion local para feedback.
- Pronunciacion 06D con 4 secciones, desafio final, audios modelo profesionales ElevenLabs, reglas de liaison, reinicio total del desafio, audio final del estudiante y panel de envio a notas.
- Paquete visual especifico para 06A, 06B, 06C, 06R y 06E.

## Verificacion tecnica

- `node --check assets/js/french8-listening-activity-data.js`: OK.
- `node --check assets/js/french8-pronunciation-theme06.js`: OK.
- Scripts embebidos de paginas nuevas: OK.
- Busqueda de mojibake en archivos tocados: sin resultados.
- Verificacion HTTP local en puerto 8031: todas las rutas nuevas y la imagen respondieron `200`.
- Auditoria STT ElevenLabs Scribe realizada el 2026-07-01:
  - 06A France: 99.98% de coincidencia; 344/344 palabras.
  - 06B France: 100% de coincidencia; 324/324 palabras.
  - 06C France: 99.98% de coincidencia; 321/321 palabras.
  - 06A Quebec: 99.46% antes del ajuste; se corrigio la transcripcion inicial de `Tu as entendu` a `T'as entendu` para coincidir con el audio.
  - 06B Quebec: 100% de coincidencia; 298/298 palabras.
  - 06C Quebec: 100% de coincidencia; 300/300 palabras.
  - 06D France, modelo final: 100% de coincidencia; 54/54 palabras.

## Pendientes

- Escucha humana subjetiva opcional de 06A-06D para confirmar ritmo, naturalidad y comodidad auditiva; la alineacion texto/audio ya fue validada por STT.
