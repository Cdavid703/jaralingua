# Arquitectura de los Conversation Coaches de Inglés Intermedio

Fecha de levantamiento: 2026-08-28.

Este documento es la referencia obligatoria antes de crear o rediseñar un
Conversation Coach de Inglés Intermedio. Se elaboró al inspeccionar las páginas
reales de Intermedio 1, sus hojas de estilo compartidas, su motor de
conversación y sus archivos de configuración. No es una propuesta visual
nueva: describe el patrón ya implementado en el sitio.

## Páginas de referencia

| Página | Personaje y propósito | Tipo de experiencia |
| --- | --- | --- |
| `ingles/intermediate/unit-conversation-coach-unit-5.html` | Maya; práctica de comida y cantidades | Coach formativo de varias etapas y reporte privado. |
| `ingles/intermediate/unit-conversation-coach-unit-5-restaurant.html` | Ethan; simulación de restaurante | Coach contextual con selección de escenario. |
| `ingles/intermediate/unit-conversation-coach-unit-6-schedule.html` | Marcus; rescate de horario | Coach contextual con escenario, seguimiento y dock flotante. |
| `ingles/intermediate/final-oral-partner-coach.html` | Sophie Bennett; examen oral final | Implementación de referencia más completa: simulación por parejas, modos, evidencias, rúbrica, entrega al docente y panel docente. |

El archivo que define el contenido del coach de Sophie es
`assets/js/conversation-coach-data/english-intermediate-1-final-oral-partner-coach.js`.
El motor de conversación reutilizado por los coaches de escenario es
`assets/js/schedule-conversation-coach.js`.

## Arquitectura visual real

La página no comienza con una tarjeta compacta. El recorrido está compuesto por
capas de pantalla, en este orden.

1. **Hero panorámico de dos columnas (`.coach-hero`).**
   - Ocupa el ancho útil de la página y tiene composición editorial: texto a la
     izquierda y una imagen hero específica de la situación a la derecha.
   - Incluye kicker, título, descripción, etiquetas de alcance, acciones y
     aviso de privacidad cuando corresponde.
   - La imagen no es un avatar reutilizado: representa la escena y al personaje
     del coach dentro de la situación comunicativa. Ejemplo: Sophie y el
     estudiante simulando el examen oral.
   - Fuente de estilo: `assets/css/conversation-coach-v2.css`, selectores
     `.coach-hero`, `.coach-hero-copy`, `.coach-meta`, `.coach-actions` y
     `.coach-hero-visual`.

2. **Franja de valor o resultados (`.coach-outcomes`).**
   - Son tarjetas horizontales inmediatamente después del hero.
   - Explican la dinámica comunicativa, no repiten instrucciones: por ejemplo,
     simulación en pareja, preguntas de seguimiento y entrega al docente.
   - En un coach privado se conservan las dos o tres tarjetas relevantes y se
     omite cualquier afirmación de calificación o entrega oficial.

3. **Shell principal (`.coach-shell > .coach-layout`).**
   - En escritorio forma una cuadrícula de dos columnas: conversación a la
     izquierda y panel contextual a la derecha.
   - El panel lateral muestra formato, secuencia, rúbrica, lenguaje requerido y
     política de privacidad. No es texto decorativo: da contexto de examen
     mientras la conversación está activa.
   - En la página de Sophie este shell contiene el flujo completo y el sidebar;
     es la referencia para una evaluación oral, no una simple tarjeta.

4. **Bienvenida del compañero (`.coach-companion-welcome`).**
   - Es un panel con retrato vertical propio del personaje, nombre, rol,
     introducción oral, botón de bienvenida, botón de instrucciones y selector
     de velocidad.
   - Debajo aparecen los pasos de la conversación (`.coach-steps`), las opciones
     de modo y, cuando corresponde, la selección del contexto o problema.
   - El personaje debe tener dos recursos coherentes: un retrato para la
     bienvenida y una imagen hero de la escena. Una foto temática genérica no
     sustituye ninguno de los dos.

5. **Etapa activa de conversación (`.coach-stage`).**
   - Cada turno tiene contador, tema, barra de progreso, retrato del personaje,
     estado de la interacción, contexto, pregunta y controles para escuchar.
   - El borde del avatar cambia según el estado: el personaje habla, el
     estudiante responde o el sistema analiza. Es el giro visual de cada turno;
     no se reduce a cambiar una frase de texto.
   - El soporte está separado en un panel desplegable (`.coach-support`): marcos
     de respuesta, vocabulario y foco gramatical. En modo realista se cierra;
     en modo guiado se abre.

6. **Grabador visible (`.coach-recorder`).**
   - El escritorio muestra selector de micrófono, medidor de nivel, botón de
     micrófono central, estado, ayuda, temporizador, terminar/regrabar,
     reproducción, transcripción y recuperación.
   - El medidor no es decorativo. `assets/js/schedule-conversation-coach.js`
     crea un `AnalyserNode` (`startLevelMeter` y `stopLevelMeter`) y actualiza
     `#levelMeterBar` y `#levelMeterValue` mientras el usuario habla.
   - Tras la respuesta aparecen reacción del personaje y navegación entre
     etapas; al final se muestra reporte o cierre según el tipo de coach.

7. **Dock flotante (`.coach-floating-dock`).**
   - Existe como segundo acceso al micrófono durante la conversación, con etapa,
     estado, temporizador y controles Respond/Finish.
   - No reemplaza el grabador completo de escritorio. Lo complementa para que el
     alumno conserve un acceso inmediato mientras se desplaza por una etapa.

## Adaptación móvil existente

La experiencia móvil no usa una página distinta ni elimina la arquitectura.
Las hojas compartidas aplican puntos de ruptura de forma progresiva:

| Punto de ruptura | Cambio real |
| --- | --- |
| `980px` | Hero y shell pasan de dos columnas a una; la imagen conserva protagonismo. |
| `720px` | Hero, shell y outcomes reducen márgenes; bienvenida y etapa se apilan; la foto de bienvenida pasa a ser horizontal. |
| `470px` | Paneles reducen padding, las cuadrículas se compactan y el dock flotante se adapta a dos columnas. |

Por tanto, el móvil debe conservar el hero, la identidad del personaje, el
progreso y el grabador. Puede ocultar ayudas secundarias, pero no convertirse en
una tarjeta sin escena ni en un flujo sin panel de conversación.

## Separación entre estructura, contenido y lógica

| Capa | Responsabilidad | Referencias actuales |
| --- | --- | --- |
| HTML | Semántica de hero, outcomes, shell, paneles, controles e IDs. | `final-oral-partner-coach.html` y los coaches de unidades 5 y 6. |
| CSS compartido | Layout, estados, responsive, grabador y dock. | `conversation-coach-v2.css`. |
| CSS de variante | Contexto narrativo, escenarios, tarjetas y evaluación. | `restaurant-conversation-coach.css`, `final-oral-partner-coach.css`. |
| Configuración | Personaje, retrato, hero, audio, etapas, rúbrica, escenas y textos. | `assets/js/conversation-coach-data/*.js`. |
| Motor | Audio, estados de turno, micrófono, medidor, transcripción, recuperación, historial y navegación. | `schedule-conversation-coach.js`. |

## Implicación para el Midterm Oral de Intermedio 2

Antes de reescribirlo, el coach debe decidir explícitamente estas piezas y no
inventar una interfaz aparte:

1. Crear **dos imágenes coherentes de Mia**: hero panorámico de la escena de
   reencuentro y retrato vertical para el panel de bienvenida/etapa.
2. Montar el HTML con la arquitectura compartida: hero, outcomes, shell de dos
   columnas, bienvenida, pasos, etapa activa, grabador completo, reacción y
   dock flotante.
3. Reutilizar o adaptar el motor probado de Intermedio 1 para tener selector de
   micrófono, medidor real, estados de turno, transcripción, recuperación y
   navegación; no implementar una versión paralela mínima.
4. Mantener el propósito de práctica privada: eliminar entrega al docente,
   calificación y panel docente, pero conservar el panel lateral con el formato
   del oral, la secuencia de la conversación y el lenguaje requerido.
5. Configurar las siete etapas exactamente desde la tarea oral: reencuentro,
   puesta al día, situación de la amiga, segundo condicional, dilema propio,
   consejo con *If I were you*, pregunta de dating y cierre natural.
6. Validar primero en escritorio y móvil contra esta lista, incluyendo el
   hero a pantalla completa y el medidor en grabación, antes de desplegar.

## Criterio de aceptación antes de un nuevo despliegue

- El hero usa una escena propia, amplia y coherente con Mia; no solo un retrato
  cuadrado recortado.
- El personaje visible en hero, bienvenida, etapas y audios es consistente.
- Escritorio tiene outcomes, shell de dos columnas, panel lateral y grabador
  completo.
- Móvil conserva la identidad de la escena y un camino sencillo; el dock
  flotante complementa el grabador.
- El nivel del micrófono cambia al hablar y su estado se entiende sin leer un
  texto largo.
- Las ayudas de lenguaje son completas, sin huecos ni puntos suspensivos, y se
  pueden cerrar para la simulación realista.
- No hay ninguna entrega, nota, porcentaje o escritura en la grilla para esta
  práctica privada.

