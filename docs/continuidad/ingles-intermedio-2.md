# Continuidad de Inglés Intermedio 2

Este nivel tiene documentación propia y no debe confundirse con Intermedio 1. El historial disponible aquí es parcial; conservar sus planes como fuente principal.

## Decisiones y referencias

- Leer [plan maestro](../english-intermediate-2-master-plan.md), [guía de construcción](../guia-construccion-ingles-intermedio-2.md) y [sistema de diseño](../english-intermediate2-page-design-system.md).
- El plan maestro propone seis unidades, secciones del curso, grilla privada independiente y cinco evaluaciones de 20%. Es planificación: no demuestra que todas estén implementadas o calificadas.
- Este sistema de diseño fue referencia para aprovechar el ancho en Básico 2: optimizar espacio con grillas, no estirar innecesariamente texto.
- Aplicar QR dentro del bloque del hero, ampliable y centrado, conforme a la instrucción que incluyó Básico 2 e Intermedio 2.
- Consultar [estándar de pronunciación del nivel](../english-intermediate2-pronunciation-activity-standard.md), especialmente antes de adaptar controles de palabra clicable o micrófono.
- Para Unidad 4 existen [plan de explicación](../english-intermediate2-unit4-explanation-plan.md) y [actividad Film Festival](../english-intermediate2-unit4-film-festival.md). Leer su contenido antes de continuar; no asumir tema ni estado por el nombre de un archivo.

## Evaluaciones

El docente pidió revisar primero exámenes con notas bajas y, en un caso específico, obviar mayúsculas y puntuación. Esa instrucción puntual no elimina esos criterios de todas las rúbricas. No repetir cambios de nota del historial ni exponer datos personales en documentación pública; consultar entregas actuales cuando se solicite.

En tareas anteriores hubo cambios de este nivel coexistiendo con trabajo de Básico 2. Revisar estado Git y no incluirlos accidentalmente en commits ajenos.

## Unit 5 · The First Visit

El cuento oral del examen final se redujo a 17 páginas por indicación del docente: evitar imágenes casi idénticas. Cada escena debe aportar cambios visibles de lugar, acción o composición. Describir primero, interpretar sentimientos con evidencia, revelar la narración y después predecir. Imágenes y preguntas ampliables para TV, preguntas individuales, audios de ElevenLabs, apoyos de looks/seems/looks like ocultos hasta solicitarlos. Referencia de interacción: Stone Soup de Básico 2, Unidad 6. Consultar [implementación y pruebas](../english-intermediate2-first-visit.md).

## Unit 5 · Conversation with David

El docente pidió practicar oralmente los temas exactos del examen final con un coach que pregunte el nombre, reaccione a las respuestas y ofrezca ejemplos bajo demanda. Interfaz breve con retrato ficticio, micrófono, transcripción, QR y adaptación móvil. La voz profesional David no permitía generar audio (`voice_not_fine_tuned`); el 2 de octubre autorizó probar la otra voz David y continuar. La actividad usa la voz clonada `pv8WYYW60prEkDbDXyC0`, no la profesional bloqueada. Doce etapas y cuatro seguimientos, práctica privada sin notas ni entrega. Referencia: [implementación, límites de conversación y pruebas](../english-intermediate2-david-first-impression.md). No confundir el coach con el cuento The First Visit ni cambiar el estado del examen escrito.

## Unit 6 · News, Reported Speech and Natural Disasters

Página `unit-6-news-and-natural-disasters.html`, enlazada desde Course Overview. Diez bloques de teoría cerrados inicialmente: noticias y fuentes; hechos, opiniones y rumores; discurso directo e indirecto; say/tell; cambios de tiempo y referencia; discusión de noticias políticas y de entretenimiento; desastres; narración en pasado; instrucciones; expresiones y boletín. Guía: sesiones 15–16. Escenas y noticias ficticias, sin nueva evaluación.

Reutiliza las 14 imágenes originales y ofrece 65 modelos de audio de ElevenLabs, con transcripciones de enseñanza públicas, velocidad 0.75×/1× y un único reproductor. Vocabulario seleccionado con significado español al pasar el cursor, enfocar o tocar; clic reproduce. Proyección de tarjetas y explicación completa, QR y autenticación compartidos. Los ejercicios futuros permanecen en Practice Lab. Las recomendaciones sobre inundaciones enlazan Ready.gov y la gramática adicional enlaza British Council.

Construcción: `tools/build_intermediate2_unit6_explanation.py`. Pruebas: `tools/test_intermediate2_unit6_explanation.cjs`, contrato de 47 páginas y auditoría transversal de Sign in. Audios e inventario: `audio/unit-6-explanation/models.json` y `assets/data/english-intermediate2-unit6-media.json`. Mantener los MP3 v1 ya publicados por compatibilidad; los cinco phrasal verbs separables usan modelos v2 con sustantivo y pronombre.


Ajuste visual del 9 de octubre de 2026: las imágenes de lectura tienen un máximo de 320 px de alto (260 px en móvil), sin recortes; las escenas sueltas llevan imagen y explicación en paralelo desde 900 px. Desastres y expresiones se organizan en grupos desplegables cerrados inicialmente. La proyección de sección conserva sus imágenes y abre una copia de los grupos sin alterar la página; la proyección individual muestra un solo título, conservando la pronunciación del vocabulario. La prueba de Unidad 6 incluye 1920 px, límites de altura y presencia de imágenes al proyectar.
