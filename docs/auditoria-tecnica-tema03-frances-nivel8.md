# Auditoria tecnica - Tema 03 Frances Nivel 8

Fecha: 2026-06-30

Tema auditado: `Jugement, emotion et anteriorite` / `Le subjonctif passe`.

## Archivos construidos

- `frances/Niveau 8/themes/jugement-emotion-anteriorite.html`
- `frances/Niveau 8/ateliers/comprehension-orale-03a-reactions-scandale.html`
- `frances/Niveau 8/ateliers/comprehension-orale-03b-film-controverse.html`
- `frances/Niveau 8/ateliers/comprehension-orale-03c-crise-sanitaire.html`
- `frances/Niveau 8/ateliers/atelier-subjonctif-passe.html`
- `frances/Niveau 8/ateliers/table-ronde-decision-polemique.html`
- `frances/Niveau 8/ateliers/production-03e-commentaire-critique.html`

## Verificacion pedagogica

- Pagina principal creada con objetivo comunicativo, formacion del subjonctif passe, contraste con subjonctif present, disparadores de emocion/juicio/duda, errores frecuentes, lectura, produccion modelo y enlaces a talleres.
- Lectura principal: 165 palabras aproximadamente, dentro del rango 150-200.
- La lectura integra la expresion `ca me reste en travers de la gorge` en contexto de indignacion.
- La lectura incluye 5 preguntas inferenciales coordinadas con el texto.
- Comprensiones orales 03A, 03B y 03C creadas con 10 preguntas cada una.
- Cada comprension oral tiene variante Francia/Quebec y preguntas especificas para Quebec en `assets/js/french8-listening-activity-data.js`.
- Actividad gramatical 03G creada con 15 preguntas y feedback por respuesta.
- Actividad oral 03R creada como mesa redonda con escenarios, roles, frases utiles, modelo y rubrica.
- Produccion 03E creada con texto guiado, validacion basica de palabras/subjonctif passe/nuance y grabacion de audio local para feedback.

## Guiones y preguntas

- 03A France: las preguntas se basan en el guion `Reactions apres un scandale`.
- 03B France: las preguntas se basan en el guion `Critique culturelle : un film controverse`.
- 03C France: las preguntas se basan en el guion `Rapport sur une crise sanitaire`.
- 03A-03C Quebec: se agregaron preguntas propias para no reutilizar preguntas de Francia cuando el estudiante selecciona acento Quebec.

## Correcciones tecnicas

- Se corrigio `Å“` a `œ` en los guiones fuente de France/Quebec.
- Busqueda de mojibake en archivos nuevos y guiones tocados: sin coincidencias pendientes para `Å`, `Ã`, `Â` o `�`.

## Verificacion visual

- Imagen profesional nueva fabricada para el tema: `frances/Niveau 8/img/themes/theme-03-jugement-emotion-anteriorite-hero.png`.
- La pagina principal del tema usa esta imagen como hero.
- El mapa de temas y el portal de ateliers usan esta imagen nueva para el bloque del Tema 03.
- La imagen anterior de pronunciacion ya no funciona como hero principal del tema.

## Pendiente honesto

- No hay `ffprobe` ni `mutagen` disponibles localmente para certificar duracion exacta de los MP3 desde esta terminal.
- Falta escucha humana final o STT tipo Whisper para confirmar palabra por palabra que cada audio corresponde a su guion.

## Veredicto

Tema 03 queda cerrado pedagogicamente y conectado en el portal. Pendiente solo la verificacion auditiva final de audio real contra transcripcion.
