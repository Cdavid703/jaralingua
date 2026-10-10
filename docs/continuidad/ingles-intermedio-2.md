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

## Unit 6 · Greenford News

El docente aprobó aprender vocabulario mediante un noticiero ilustrado, con traducción al pasar el mouse y diez preguntas finales de comprensión. `vocabulary-unit-6-greenford-news.html` incorpora doce escenas e imágenes distintas, doce tarjetas de palabras principales, 33 términos con ayuda en español, audios de ElevenLabs y proyección. Enlaces desde el vocabulario inicial de la explicación y Practice Lab. Actividad formativa con subtítulos públicos solicitados, sin envío ni calificación académica. Consultar [implementación y pruebas](../english-intermediate2-newsroom.md).

## Unit 6 · News Quest

Actualización del 9 de octubre de 2026: tres retos separados con mapa de trofeos — vocabulario, escucha y pronunciación — de doce palabras cada uno. Acceso directo, progreso durante la visita, confeti y sonidos desactivables, movimiento reducido y repaso dentro del mismo tipo de reto. Página `practice-unit-6-news-quest.html`, en Practice Lab, Unidad 6.

La grabación ahora se procesa automáticamente mediante el Whisper local existente de Jaralingua. Se muestra la transcripción y coincidencia de palabras; no es evaluación fonética de sonidos/acento y no debe presentarse como tal. El trofeo oral exige doce palabras verificadas; autoevaluación u omisión no lo otorgan. Sin envío al docente ni calificación académica. El aviso de privacidad explica el procesamiento temporal en el servidor. Consultar [implementación, límites y pruebas](../english-intermediate2-news-quest.md).

Se conserva la excepción de audio del docente: en los retos de escuchar y escoger imagen o palabra, suena únicamente la palabra objetivo; no se lee la instrucción. Los demás retos tienen pregunta narrada, repetición y cancelación al avanzar o grabar. Las frases incompletas dicen «blank» sin revelar la respuesta.

## Unit 6 · My opinion matters

Coach visual aprobado para preparar una mesa redonda de cinco preguntas: contexto de una foto, alerta sin verificar, grabar o ayudar, suministros limitados y cobertura desigual. Saludo y nombre, descripción, interpretación con looks/seems/might y opinión; seguimientos para pedir razón o predecir. Cinco imágenes originales ampliables, pregunta ampliable, ayudas y ejemplos con audio ocultos inicialmente. Voz David clonada autorizada, principalmente Eleven v3 con indicaciones expresivas para que los saludos y exclamaciones tengan intención vocal.

Conversación guiada con rutas y respuestas pregrabadas, no comprensión generativa ilimitada. Aclara respuestas no reconocidas; no califica opiniones ni inventa puntuación fonética. Informe de cinco opiniones durante la visita, sin persistencia de voz/transcripciones ni envío al docente. Se conserva el motor compartido con extensiones optativas y pruebas de regresión. Referencia: [implementación, recursos y límites](../english-intermediate2-opinion-coach.md).

Ajuste de distribución del coach: imagen, conversación y grabación en una fila desde 980 px; dos columnas en tablet y una en móvil. Banner temático visible en todos los anchos. Se comprueba la geometría real de los tres bloques, además de la proyección.

## Unit 6 · What did they say?

Actividad de parejas: ejemplo guiado más diez escenas distintas de noticias/desastres. A describe tres detalles en presente; B reporta lo dicho por A usando said that y cambios de verbos/pronombres, sin añadir información. Modelos comparables, 25 audios David, ayudas y cada escena ampliables. Galería filtrable y proyector; modelos de práctica cerrados hasta solicitarlos. Once imágenes de actividad y hero propio. Sin grabación, entregas ni notas. Ver [implementación y pruebas](../english-intermediate2-reported-speech.md).

Ajuste visual y vocabulario del 9 de octubre de 2026: David visible a 144 px (128 px en móvil) en el coach, con imágenes completas y manteniendo la fila. What did they say incorpora cinco palabras por cada una de sus once imágenes, significados españoles por mouse/foco/toque y pronunciación por clic; vocabulario y ayudas funcionan también dentro del proyector. Banner y miniaturas sin recorte.

## Unit 6 · After the Flood listening

Cierre de la secuencia de noticias: boletín ficticio de 29 segundos a 1×, voz Sarah de ElevenLabs, ocho preguntas A/B/C con evidencia y reintento. Tres propósitos de escucha, audio a 0.75×/1×/1.25× y cierre oral con reported speech. Transcripción solo para docente/admin mediante `/api/intermediate2/unit6-after-the-flood/transcript`, sin guion completo en los recursos públicos; se borra al cambiar/cerrar sesión y se descartan respuestas tardías. En Practice Lab y Listening Library, Unidad 6. Ver [implementación](../english-intermediate2-unit6-listening.md).

## Unit 6 · Pronunciation and Pronunciation Library

Report the News Clearly: cuatro grupos de noticia ficticia más grabación final; 64 modelos Sarah/ElevenLabs y 59 palabras clicables con consejo individual. Motor compartido sin cambios; resultados de reconocimiento, no diagnóstico fonético. Entrega final a bandeja docente independiente, sin notas, con rutas protegidas e idempotentes de Unidad 6.

Nueva Pronunciation Library, accesible desde portada y Practice Lab: siete actividades originales del catálogo, incluidas las seis unidades y el reto de News Quest. No duplicar las actividades ni alterar entregas. Ejecutar su constructor al añadir una nueva entrada. Referencia: [implementación, pruebas y recursos](../english-intermediate2-unit6-pronunciation.md).
