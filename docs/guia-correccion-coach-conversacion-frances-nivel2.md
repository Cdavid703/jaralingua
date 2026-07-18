# Guia de correccion: coach de conversacion - Frances Nivel 2

Ultima actualizacion: 2026-07-17.

Nivel 2 todavia no tiene paginas de coach automatico equivalentes a `Coach de conversation` de nivel 1 o nivel 8. Las paginas actuales `conversation-*.html` son guias de conversacion en binome para clase. Por eso el coach de nivel 2 debe construirse como una linea separada, no mezclarse con las paginas de conversacion existentes sin decision pedagogica.

## Punto de partida

Paginas de conversacion existentes:

- `conversation-routine.html`
- `conversation-logement.html`
- `conversation-restaurant.html`
- `conversation-pharmacie.html`
- `conversation-weekend.html`
- `conversation-retrouver.html`

Estas paginas no graban respuestas individuales ni usan `assets/js/oral-unit-practice-engine.js`.

## Reglas heredadas de nivel 8

- El coach no debe pedir repetir literalmente una respuesta modelo.
- Evalua si el estudiante responde, desarrolla una idea y usa recursos del tema.
- La confianza STT no es una nota de pronunciacion; solo marca fiabilidad tecnica.
- Las coincidencias deben usar tokens y frases con limites reales, no `includes`.
- Deben aceptarse apostrofes, acentos, contracciones y sinonimos razonables.
- Un intento dudoso puede recibir feedback formativo y permitir avanzar.
- Una transcripcion vacia produce `0` dudoso, no bloqueo.
- El audio del estudiante no se guarda en servidor para el coach.

## Propuesta de construccion para nivel 2

Crear paginas nuevas de coach en vez de reemplazar las conversaciones en binome:

| Tema | Pagina propuesta | Datos propuestos |
| --- | --- | --- |
| 1 | `coach-conversation-routine.html` | `oral-unit-practice-data/french-level-2-theme-1.js` |
| 3 | `coach-conversation-logement.html` | `oral-unit-practice-data/french-level-2-theme-3.js` |
| 4 | `coach-conversation-restaurant.html` | `oral-unit-practice-data/french-level-2-theme-4.js` |
| 5 | `coach-conversation-pharmacie.html` | `oral-unit-practice-data/french-level-2-theme-5.js` |
| 6 | `coach-conversation-weekend.html` | `oral-unit-practice-data/french-level-2-theme-6.js` |
| 7 | `coach-conversation-retrouver.html` | `oral-unit-practice-data/french-level-2-theme-7.js` |

Las paginas de conversacion en binome pueden quedar como actividades de clase. El coach nuevo seria practica individual con microfono.

## Puntaje formativo

- Cumplimiento de la tarea: 40%.
- Recursos linguisticos del tema: 25%.
- Desarrollo y coherencia: 20%.
- Fluidez temporal: 15%.

El resumen debe separar respuestas fiables, dudosas y omitidas.

## Criterio antes de implementar

- Definir si el coach sera calificable o solo formativo. La recomendacion inicial es formativo.
- Definir personaje estable, retrato, voz y nombre.
- Crear seis preguntas por tema con varias respuestas validas por criterio.
- Corregir primero el motor compartido `assets/js/oral-unit-practice-engine.js` para no usar `normalized.includes(...)`.
- Crear prueba automatizada compartida para los datos de nivel 2.
