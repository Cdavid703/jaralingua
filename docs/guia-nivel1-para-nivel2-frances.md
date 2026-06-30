# Guía de construcción — Francés Nivel 2

Esta guía define cómo debe construirse **Français · Niveau 2** tomando como modelo funcional el Nivel 1 y ajustándolo al alcance A1.2. No es una bitácora de cambios: es una especificación de construcción para temas, actividades, audios, simulacro y examen final.

## 1. Principio general del Nivel 2

Nivel 2 debe consolidar la comunicación básica en contextos cotidianos: ropa, vivienda, comida, salud, clima, ciudad, tecnología básica, compras y desplazamientos. Cada tema debe llevar al estudiante a producir frases útiles, escuchar situaciones reales, leer textos breves, conversar con apoyo limitado y pronunciar con más control.

El diseño debe mantener continuidad con Nivel 1:

- Navegación clara por tema.
- Ateliers y actividades agrupadas y colapsadas por defecto.
- Biblioteca de audio con controles completos.
- Actividades con imágenes profesionales.
- Pronunciación implementada como práctica guiada con micrófono.
- Evaluaciones conectadas al carnet de notas cuando correspondan.

## 2. Estructura mínima de cada tema

Cada tema de Nivel 2 debe tener, como mínimo, estas piezas:

- Página principal del tema.
- Explicación gramatical detallada.
- Vocabulario contextualizado.
- Banco de expresiones idiomáticas aplicado al tema.
- Comprensión oral con audio profesional.
- Comprensión escrita.
- Actividad de pronunciación.
- Actividad de gramática o vocabulario interactivo.
- Juego o dinámica interactiva.
- Actividad de conversación.
- Producción guiada o tarea conectada al proyecto.

Las actividades no deben estar abiertas por defecto en `ateliers-activites.html`. El estudiante debe poder elegir qué bloque desplegar. El proyecto final sí puede aparecer desplegado cuando convenga.

## 3. Página principal de cada tema

La página principal del tema debe funcionar como entrada pedagógica y visual. Debe incluir:

- Hero con imagen profesional relacionada directamente con el tema.
- Objetivo comunicativo claro.
- Lista de situaciones reales que el estudiante podrá manejar.
- Gramática explicada paso a paso.
- Vocabulario esencial organizado por función.
- Expresiones idiomáticas del banco del nivel.
- Modelo breve de uso en contexto.
- Enlaces a las actividades del tema.

No se deben usar fondos de bolas, círculos, orbes, manchas abstractas ni imágenes decorativas sin valor pedagógico. La imagen debe mostrar una situación, objeto, lugar o interacción realista y reconocible.

## 4. Gramática

La gramática debe explicarse de forma explícita, gradual y aplicada. No basta con poner reglas sueltas.

Cada punto gramatical debe incluir:

- Para qué sirve en comunicación real.
- Forma afirmativa, negativa e interrogativa cuando aplique.
- Concordancia o cambios morfológicos.
- Errores frecuentes de estudiantes hispanohablantes.
- Ejemplos cortos en francés.
- Traducción o explicación breve en español cuando ayude.
- Micropráctica inmediata.
- Uso dentro de una situación del tema.

La explicación debe preparar al estudiante para las actividades. No debe aparecer una estructura gramatical en talleres, audios o lecturas si antes no fue presentada de manera suficiente.

## 5. Vocabulario

El vocabulario debe enseñarse por función y no como lista aislada. Cada tema debe organizarlo en grupos útiles:

- Palabras esenciales.
- Verbos frecuentes del tema.
- Frases funcionales.
- Preguntas necesarias para conversar.
- Respuestas naturales.
- Palabras de apoyo para matizar.

Las actividades de vocabulario deben usar imágenes profesionales cuando el significado sea visual: ropa, clima, estaciones, comida, vivienda, lugares de la ciudad, objetos o acciones concretas.

Cuando una actividad use audio de vocabulario, el audio debe estar coordinado con la palabra o tarjeta que se muestra. Si se usa ElevenLabs, se debe conservar una transcripción o lista de prompts para el docente.

## 6. Expresiones idiomáticas

Cada tema debe integrar al menos una expresión idiomática del banco del nivel. La expresión no debe aparecer como adorno; debe usarse en:

- La página principal del tema.
- La lectura.
- La comprensión oral.
- La actividad de conversación.
- La actividad de pronunciación o cierre oral cuando sea posible.

Para cada expresión se debe explicar:

- Significado.
- Uso comunicativo.
- Registro básico.
- Ejemplo dentro del tema.
- Equivalente aproximado en español, si ayuda.

Ejemplo de integración:

- Tema de ropa: `aller comme un gant`.
- Tema de compras: `ça coûte les yeux de la tête`.
- Tema de salud: `ne pas être dans son assiette`.
- Tema de clima: `il fait un temps de chien`.

## 7. Comprensión oral

Toda comprensión oral de Nivel 2 debe tener audio profesional, transcripción docente y preguntas suficientes.

Reglas obligatorias:

- Mínimo 8 preguntas por actividad de audio.
- Las preguntas deben evaluar comprensión real, no reconocimiento mecánico.
- No usar preguntas tontas, evidentes o repetitivas.
- No crear patrones de respuesta predecibles.
- Las opciones deben ser plausibles.
- El audio debe coincidir exactamente con la transcripción del profesor.
- El audio debe usar controles con barra de progreso, duración, tiempo actual y botones de velocidad.
- Los botones mínimos de velocidad son: normal, lento y rápido.
- La transcripción completa no debe mostrarse al estudiante si la actividad evalúa escucha; debe estar disponible para el docente.

Tipos de preguntas recomendadas:

- Dato concreto escuchado.
- Relación entre dos datos.
- Intención comunicativa.
- Orden de acciones.
- Inferencia sencilla.
- Identificación de una expresión idiomática.
- Reacción adecuada a la situación.
- Selección de información faltante.

No deben concentrarse todas las preguntas en la primera mitad del audio. La escucha debe obligar a seguir el texto completo.

## 8. Estructura técnica de audios

Las páginas con audio deben usar una estructura consistente:

- Elemento `<audio>` con `preload="metadata"`.
- Control personalizado o equivalente con progreso visible.
- Tiempo actual y duración.
- Botones de velocidad.
- Estado de carga y error.
- Accesibilidad mediante `aria-label`.
- Transcripción docente en archivo `.md` o endpoint protegido.

En Nivel 2, las actividades de escucha deben seguir el patrón ya corregido de `listening-controls-a2.js` o el patrón de audios de Nivel 7 y Nivel 8 cuando sea más robusto.

La biblioteca de audios debe listar los audios del nivel con:

- Título.
- Tema.
- Duración cuando esté disponible.
- Control completo.
- Velocidad.
- Acceso docente a transcripción si aplica.

## 9. Comprensión escrita

Cada tema debe tener una lectura breve, contextual y útil. La lectura debe:

- Usar vocabulario del tema.
- Incluir al menos una expresión idiomática del banco.
- Incluir una o más estructuras gramaticales explicadas en la página del tema.
- Tener preguntas de comprensión que no sean mecánicas.
- Incluir preguntas sobre intención, contexto, relación de ideas o elección de respuesta adecuada.

La lectura no debe ser una lista disfrazada de texto. Debe tener una situación comunicativa reconocible: mensaje, diálogo, anuncio, perfil, nota, itinerario, reseña breve, chat o descripción.

## 10. Pronunciación

Cada tema debe tener una actividad de pronunciación. La actividad debe entrenar sonido, ritmo y producción oral, no solo lectura.

Estructura mínima:

- Objetivo fonético o prosódico del tema.
- Modelo de audio profesional.
- Tres o cuatro mini etapas.
- Práctica con micrófono.
- Retroalimentación automática cuando esté disponible.
- Etapa final con frase o mini discurso del tema.
- Integración de una expresión idiomática cuando sea natural.
- Posibilidad de continuar aunque el estudiante se equivoque.

La actividad no debe bloquear el avance por una respuesta incorrecta. Si el estudiante falla, se registra el resultado o se muestra feedback, pero puede continuar.

La pronunciación debe usar frases reales del tema. Evitar trabalenguas sin conexión con el contenido.

## 11. Actividad de conversación

Cada tema debe incluir una actividad que genere conversación entre estudiantes. Esta actividad debe tener:

- Contexto claro.
- Roles.
- Objetivo comunicativo.
- Banco de frases útiles.
- Una expresión idiomática obligatoria.
- Modelo de conversación.
- Tiempo de preparación.
- Presentación oral en clase.
- Regla de apoyo: se pueden usar notas, pero no leer todo el tiempo.

Ejemplo de formato:

- Pareja A y B simulan una situación.
- Preparan 8 a 12 intercambios.
- Incluyen saludo, necesidad, preguntas, aclaraciones, decisión y cierre.
- Usan al menos una expresión idiomática.
- Presentan la conversación frente a la clase.
- El docente evalúa claridad, interacción, pronunciación y uso del contenido del tema.

## 12. Juegos y actividades interactivas

Cada tema debe tener al menos una dinámica interactiva. Puede ser:

- Memoria de vocabulario.
- Tarjetas con audio.
- Juego de clasificación.
- Ruleta de preguntas.
- Simulación guiada.
- Juego de roles con turnos.
- Desafío de escucha y respuesta.

El juego debe reforzar el objetivo del tema. No debe existir solo como decoración. Debe producir evidencia observable: aciertos, intentos, conversación, pronunciación o elección contextual.

Cuando haya tarjetas con imágenes, cada tarjeta debe usar imagen profesional y audio coordinado. En rondas con micrófono, el sistema debe escuchar la producción del estudiante, dar feedback y continuar aunque la respuesta no sea correcta.

## 13. Producción guiada y proyecto

Cada tema debe cerrar con una producción corta o una tarea conectada al proyecto del nivel. Puede ser escrita, oral o mixta.

Debe incluir:

- Producto esperado.
- Extensión o duración.
- Criterios visibles para el estudiante.
- Vocabulario obligatorio.
- Estructuras gramaticales objetivo.
- Al menos una expresión idiomática cuando sea pertinente.
- Posibilidad de presentación en clase.

El proyecto final del nivel puede estar desplegado por defecto si es necesario para orientar el cierre del curso.

## 14. Imágenes

Las imágenes del Nivel 2 deben ser profesionales. Reglas:

- Deben representar el tema de manera directa.
- Deben tener buena iluminación, composición y resolución.
- Deben evitar apariencia genérica o infantil si el contexto es universitario.
- No usar círculos, bolas, orbes, manchas o fondos abstractos como solución visual principal.
- Cada actividad importante debe tener imagen propia cuando ayude a comprender el contexto.
- Los `alt` deben describir contenido real, no decorar.

Si se generan imágenes con IA, el prompt debe pedir fotografía o ilustración profesional según el caso, con contexto educativo claro y sin elementos abstractos de relleno.

## 15. Ateliers y navegación

`ateliers-activites.html` debe funcionar como índice de actividades. Reglas:

- Las actividades deben estar agrupadas por tema.
- Los bloques deben estar colapsados por defecto.
- Ningún tema debe abrirse automáticamente.
- El estudiante debe elegir qué tema desplegar.
- Cada tarjeta debe indicar tipo de actividad y objetivo.
- El proyecto final puede estar desplegado si se requiere.

La página debe permitir escanear rápidamente:

- Tema.
- Actividad.
- Tipo.
- Resultado esperado.
- Enlace.

## 16. Simulacro de examen final Nivel 2

El simulacro debe tomar como modelo el Nivel 1: práctica accesible para el estudiante reconocido, con retroalimentación y puntuación por secciones. No necesita apertura administrativa.

Archivo esperado:

- `frances/Niveau 2/simulacre-examen-final.html`

Recursos esperados:

- Imagen hero profesional del simulacro.
- Audio profesional del simulacro.
- Transcripción docente en `.md`.
- Preguntas y respuestas en el propio simulacro o en archivo JS público, porque es práctica.

Estructura recomendada sobre 50 puntos:

- I. Vocabulario en contexto: 10 puntos.
- II. Gramática en contexto: 15 puntos.
- III. Compréhension écrite: 10 puntos.
- IV. Compréhension orale: 10 puntos.
- V. Mini producción comunicativa: 5 puntos o rúbrica orientativa.

Si se prefiere mantener exactamente el patrón de Nivel 1, se puede usar:

- Vocabulaire: 15 puntos.
- Grammaire: 15 puntos.
- Lecture: 10 puntos.
- Écoute: 10 puntos.

Para Nivel 2 se recomienda añadir una mini producción comunicativa aunque sea orientativa, porque A1.2 debe evidenciar capacidad de interacción básica.

Tipos de preguntas del simulacro:

- Selección múltiple contextual.
- Verdadero/falso justificado solo si la consigna exige leer bien.
- Orden lógico de frases.
- Completar estructura gramatical.
- Identificar intención comunicativa.
- Elegir respuesta adecuada para una situación.
- Preguntas de escucha con opciones plausibles.

Reglas del simulacro:

- Debe mostrar puntaje por sección.
- Debe permitir corregir y reiniciar secciones.
- Debe mostrar retroalimentación después de responder.
- Debe incluir botón docente para descargar transcripción.
- Debe usar audio con progreso, duración y velocidad.
- Debe cubrir contenidos de todos los temas de Nivel 2.
- Debe incluir expresiones idiomáticas vistas durante el nivel.

La comprensión oral del simulacro debe tener mínimo 8 preguntas. Si se usa el esquema de 10 puntos, se recomiendan 10 preguntas de 1 punto.

## 17. Examen final Nivel 2

El examen final debe tomar como modelo el examen final de Nivel 1. Debe estar cerrado hasta que el docente lo habilite.

Archivo esperado:

- `frances/Niveau 2/examen-final.html`

Regla central:

- El estudiante no debe acceder a preguntas, audio ni envío si el examen no está abierto por el docente.

El examen final debe usar endpoints protegidos equivalentes a Nivel 1:

- Estado del examen.
- Carga del examen.
- Audio protegido.
- Transcripción docente.
- Envío final.

Para Nivel 2, la implementación debe crear rutas equivalentes a:

- `/api/french2/final-exam/state`
- `/api/french2/final-exam`
- `/api/french2/final-exam/audio`
- `/api/french2/final-exam/transcript`
- `/api/french2/final-exam/submit`

Debe existir almacenamiento separado para:

- JSON del examen final de Nivel 2.
- JSON de entregas del examen final de Nivel 2.
- Audio privado del examen final de Nivel 2.

El estado inicial debe ser cerrado:

```json
{
  "state": {
    "isOpen": false,
    "openedAt": null,
    "closedAt": null,
    "openedBy": null,
    "updatedAt": null
  }
}
```

## 18. Estructura del examen final

El examen final debe evaluarse sobre 50 puntos y convertirse automáticamente a nota sobre 5.

Estructura recomendada:

- I. Compréhension orale: 10 puntos, mínimo 8 preguntas.
- II. Compréhension écrite: 10 puntos.
- III. Langue en contexte: 15 puntos.
- IV. Vocabulaire et expressions: 10 puntos.
- V. Situation communicative breve: 5 puntos, si puede calificarse automáticamente; si no, se deja como rúbrica docente separada.

Si la plataforma solo admite corrección automática cerrada, la producción oral o escrita extensa debe evaluarse fuera del examen final automático y registrarse como actividad separada.

Tipos de pregunta permitidos:

- Selección múltiple con opciones plausibles.
- Verdadero/falso cuando exige lectura real.
- Respuesta adecuada a una situación.
- Orden lógico de microdiálogo.
- Selección de forma gramatical correcta.
- Identificación de referencia en un texto.
- Comprensión de una expresión idiomática en contexto.

No usar:

- Preguntas obvias.
- Opciones absurdas.
- Patrones repetidos de respuesta.
- Textos que contengan literalmente la respuesta de manera trivial.
- Preguntas que dependan de conocimiento no trabajado en el nivel.

## 19. Seguridad del examen final

El examen final no debe exponer respuestas correctas al frontend. El modelo de Nivel 1 hace esto correctamente:

- El frontend solicita el examen por API.
- El servidor entrega solo preguntas y opciones públicas.
- Las respuestas correctas quedan en el JSON privado o lógica del servidor.
- El audio se sirve como blob desde endpoint protegido.
- La transcripción solo la descarga docente o administrador.
- El envío se rechaza si el examen está cerrado.
- Solo se acepta una entrega por estudiante.
- Al estudiante se le muestra nota y recibo, no respuestas correctas.

Nivel 2 debe conservar esa arquitectura.

## 20. Panel docente del examen final

El docente debe poder:

- Ver si el examen está abierto o cerrado.
- Abrir el examen.
- Cerrar el examen.
- Descargar la transcripción del audio.
- Previsualizar el examen sin enviar nota.

El panel debe estar visible solo para roles `admin` o `teacher`.

Cuando el examen esté cerrado, el estudiante debe ver un mensaje claro: el examen aún no está abierto y debe esperar al docente.

## 21. Audio del examen final

El audio del examen final debe ser privado. No debe quedar en la biblioteca pública ni en una ruta pública del curso si evalúa escucha.

Debe cumplir:

- Audio profesional.
- Guion/transcripción final aprobado.
- Duración adecuada al nivel A1.2.
- Velocidad natural, no exageradamente lenta.
- Preguntas distribuidas a lo largo de todo el audio.
- Transcripción disponible para docente.
- Control con progreso, duración y velocidad si el diseño del examen lo permite.

La transcripción del profesor debe coincidir exactamente con el audio usado.

## 22. Contenidos que debe cubrir el simulacro y examen

El simulacro y el examen final deben cubrir los temas centrales del Nivel 2:

- Ropa, colores, tallas, compras y precios.
- Vivienda, habitaciones, objetos y ubicación.
- Restaurante, comida, gustos y cantidades.
- Salud básica, farmacia, síntomas y consejos.
- Clima, estaciones y planes simples.
- Ciudad, direcciones y lugares.
- Tecnología cotidiana y comunicación básica.

Gramática esperada:

- Articles partitifs.
- Quantidades básicas.
- Futur proche.
- Verbes pronominaux trabajados.
- Comparatifs simples.
- Pronoms toniques.
- Prépositions de lieu.
- Questions útiles en contexto.
- `avoir mal à`.
- Imperativo o consejos básicos si fueron explicados.
- Estructuras de gusto y preferencia.

Expresiones idiomáticas esperadas:

- Deben aparecer solo si fueron trabajadas antes.
- Deben evaluarse en contexto, no como traducción aislada.
- Al menos una debe aparecer en lectura o escucha del simulacro.
- Al menos una debe aparecer en examen final si el banco fue trabajado consistentemente.

## 23. Criterios de calidad para preguntas

Cada pregunta debe pasar esta revisión:

- ¿Evalúa algo que se explicó o practicó?
- ¿La respuesta correcta es defendible?
- ¿Las opciones incorrectas son plausibles?
- ¿No hay patrón mecánico en las respuestas?
- ¿La pregunta no es demasiado obvia?
- ¿La pregunta no exige conocimiento externo?
- ¿La redacción es clara para A1.2?
- ¿El francés usado corresponde al nivel?

Para selección múltiple, evitar que una opción sea mucho más larga o más específica que las demás si eso revela la respuesta.

## 24. Rúbricas docentes

Las actividades orales, conversaciones y producciones deben tener rúbrica breve. Criterios recomendados:

- Cumplimiento de la tarea.
- Uso de vocabulario del tema.
- Uso de gramática objetivo.
- Claridad de pronunciación.
- Interacción con el compañero.
- Uso natural de expresión idiomática.

No todas las rúbricas deben mostrarse como tabla larga. En actividades cortas, basta una lista clara de criterios.

## 25. Checklist antes de cerrar un tema

Antes de dar por terminado un tema, verificar:

- La página principal explica gramática y vocabulario suficientes.
- Hay al menos una expresión idiomática integrada.
- La lectura usa contenido del tema y preguntas razonables.
- La escucha tiene audio profesional, transcripción docente y mínimo 8 preguntas.
- El audio tiene progreso, duración y velocidad.
- La pronunciación existe y no bloquea el avance.
- Hay conversación con modelo y presentación oral.
- Hay juego o actividad interactiva.
- Las imágenes son profesionales.
- El bloque del tema está colapsado en `ateliers-activites.html`.
- No hay texto mojibake ni caracteres corruptos.

## 26. Checklist antes de cerrar el nivel

Antes de cerrar Nivel 2, verificar:

- Todos los temas tienen lectura, escucha, pronunciación, conversación y práctica gramatical.
- Todas las escuchas tienen mínimo 8 preguntas.
- Todas las transcripciones coinciden con sus audios.
- La biblioteca de audio lista correctamente los audios públicos.
- Las actividades están colapsadas por defecto.
- El proyecto final está presente y coherente.
- El simulacro existe y sigue la estructura definida.
- El examen final existe, está cerrado por defecto y depende de apertura docente.
- El examen final registra nota en el carnet.
- El examen final no muestra respuestas correctas después del envío.
- El docente puede descargar transcripción del examen final.
- No hay imágenes de baja calidad ni recursos abstractos de relleno.

## 27. QA final y mantenimiento

Cuando el nivel ya tiene temas, talleres, proyecto, simulacro y examen final, el trabajo siguiente no es agregar más contenido sino verificar estabilidad pedagógica y técnica.

Controles obligatorios:

1. Abrir el examen final solo con usuario docente o administrador.
2. Confirmar que, cerrado el examen, el estudiante no ve preguntas, audio, transcripción ni respuestas.
3. Confirmar que el audio privado del examen solo sale por API autenticada.
4. Confirmar que el estudiante puede enviar el examen una sola vez.
5. Confirmar que la nota del examen final se registra en el carnet de Nivel 2.
6. Confirmar que el resultado del examen no revela respuestas correctas.
7. Confirmar que el simulacro sí muestra retroalimentación formativa, porque no es una evaluación cerrada.
8. Confirmar que todas las escuchas públicas tienen mínimo 8 preguntas, audio profesional, transcripción docente y controles de progreso, duración y velocidad.
9. Confirmar que `bibliotheque-audio.html` usa los mismos controles de audio que las actividades.
10. Confirmar que la navegación principal permite volver a temas, talleres, audio, simulacro, examen final y notas desde las páginas superiores del nivel.
11. Confirmar que no quedan imágenes provisionales, fondos abstractos de relleno, círculos decorativos ni recursos visuales de baja calidad.
12. Confirmar que no quedan archivos privados del examen final dentro de rutas públicas del curso.

Mantenimiento:

- Si se modifica un audio, actualizar la transcripción docente en el mismo bloque de trabajo.
- Si se modifica una pregunta, revisar que las opciones mantengan dificultad razonable y no revelen la respuesta por longitud o patrón.
- Si se agrega una nueva actividad de escucha, debe entrar con mínimo 8 preguntas desde el primer commit.
- Si se cambia la estructura del examen final, actualizar simultáneamente `examen-final.html`, la API, el JSON privado y esta guía.
- Si se agregan imágenes, deben ser profesionales, específicas al tema y revisables por el estudiante; no usar círculos, bolas, manchas, bokeh ni degradados abstractos como sustituto visual.
