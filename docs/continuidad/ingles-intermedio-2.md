# Continuidad de Inglés Intermedio 2

Este nivel tiene documentación propia y no debe confundirse con Intermedio 1. El historial disponible aquí es parcial; conservar sus planes como fuente principal.

## Decisiones y referencias

- Preferencia del 13 de octubre de 2026: no volver a utilizar las voces creadas/clonadas David de ElevenLabs. La autorización histórica queda retirada para nuevas generaciones. Auditoría de las siete actividades de Practice Lab Unidad 6: My opinion matters (115 clips) y What did they say? (71 clips) migran a Chris de catálogo (`iP95p4xoKVk53GoZ742B`), Multilingual v2; las cinco restantes usan Sarah y no requieren regeneración. Unidad 5 no forma parte de esta migración solicitada. Los MP3 anteriores se conservan como históricos sin enlaces activos en Unidad 6; las páginas y el catálogo apuntan a `chris-v1/`.

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

Página `unit-6-news-and-natural-disasters.html`, enlazada desde Course Overview. Once bloques de teoría cerrados inicialmente (desde el 16 de octubre incluye verbos con preposiciones): noticias y fuentes; hechos, opiniones y rumores; discurso directo e indirecto; say/tell; cambios de tiempo y referencia; discusión de noticias políticas y de entretenimiento; desastres; narración en pasado; instrucciones; expresiones y boletín. Guía: sesiones 15–16. Escenas y noticias ficticias, sin nueva evaluación.

Conserva las 14 imágenes originales y añade 20 escenas para contrastar preposiciones; ofrece 154 modelos de audio de ElevenLabs, con transcripciones de enseñanza públicas, velocidad 0.75×/1× y un único reproductor. Vocabulario seleccionado con significado español al pasar el cursor, enfocar o tocar; clic reproduce. Proyección de tarjetas y explicación completa, QR y autenticación compartidos. Los ejercicios futuros permanecen en Practice Lab. Las recomendaciones sobre inundaciones enlazan Ready.gov y la gramática adicional enlaza British Council.

Construcción: `tools/build_intermediate2_unit6_explanation.py`. Pruebas: `tools/test_intermediate2_unit6_explanation.cjs`, contrato de 47 páginas y auditoría transversal de Sign in. Audios e inventario: `audio/unit-6-explanation/models.json` y `assets/data/english-intermediate2-unit6-media.json`. Mantener los MP3 v1 ya publicados por compatibilidad; los cinco phrasal verbs separables usan modelos v2 con sustantivo y pronombre.


Ajuste visual del 9 de octubre de 2026: las imágenes de lectura tienen un máximo de 320 px de alto (260 px en móvil), sin recortes; las escenas sueltas llevan imagen y explicación en paralelo desde 900 px. Desastres y expresiones se organizan en grupos desplegables cerrados inicialmente. La proyección de sección conserva sus imágenes y abre una copia de los grupos sin alterar la página; la proyección individual muestra un solo título, conservando la pronunciación del vocabulario. La prueba de Unidad 6 incluye 1920 px, límites de altura y presencia de imágenes al proyectar.

## Unit 6 · Greenford News

El docente aprobó aprender vocabulario mediante un noticiero ilustrado, con traducción al pasar el mouse y diez preguntas finales de comprensión. `vocabulary-unit-6-greenford-news.html` incorpora doce escenas e imágenes distintas, doce tarjetas de palabras principales, 33 términos con ayuda en español, audios de ElevenLabs y proyección. Enlaces desde el vocabulario inicial de la explicación y Practice Lab. Actividad formativa con subtítulos públicos solicitados, sin envío ni calificación académica. Consultar [implementación y pruebas](../english-intermediate2-newsroom.md).

## Unit 6 · News Quest

Actualización del 9 de octubre de 2026: tres retos separados con mapa de trofeos — vocabulario, escucha y pronunciación — de doce palabras cada uno. Acceso directo, progreso durante la visita, confeti y sonidos desactivables, movimiento reducido y repaso dentro del mismo tipo de reto. Página `practice-unit-6-news-quest.html`, en Practice Lab, Unidad 6.

La grabación ahora se procesa automáticamente mediante el Whisper local existente de Jaralingua. Se muestra la transcripción y coincidencia de palabras; no es evaluación fonética de sonidos/acento y no debe presentarse como tal. El trofeo oral exige doce palabras verificadas; autoevaluación u omisión no lo otorgan. Sin envío al docente ni calificación académica. El aviso de privacidad explica el procesamiento temporal en el servidor. Consultar [implementación, límites y pruebas](../english-intermediate2-news-quest.md).

Se conserva la excepción de audio del docente: en los retos de escuchar y escoger imagen o palabra, suena únicamente la palabra objetivo; no se lee la instrucción. Los demás retos tienen pregunta narrada, repetición y cancelación al avanzar o grabar. Las frases incompletas dicen «blank» sin revelar la respuesta.

## Unit 6 · My opinion matters

Coach visual aprobado para preparar una mesa redonda de cinco preguntas: contexto de una foto, alerta sin verificar, grabar o ayudar, suministros limitados y cobertura desigual. Saludo y nombre, descripción, interpretación con looks/seems/might y opinión; seguimientos para pedir razón o predecir. Cinco imágenes originales ampliables, pregunta ampliable, ayudas y ejemplos con audio ocultos inicialmente. Voz Chris de catálogo, Multilingual v2, con puntuación natural e intención expresiva. Sustituye la voz creada David por solicitud del docente.

Conversación guiada con rutas y respuestas pregrabadas, no comprensión generativa ilimitada. Aclara respuestas no reconocidas; no califica opiniones ni inventa puntuación fonética. Informe de cinco opiniones durante la visita, sin persistencia de voz/transcripciones ni envío al docente. Se conserva el motor compartido con extensiones optativas y pruebas de regresión. Referencia: [implementación, recursos y límites](../english-intermediate2-opinion-coach.md).

Ajuste de distribución del coach: imagen, conversación y grabación en una fila desde 980 px; dos columnas en tablet y una en móvil. Banner temático visible en todos los anchos. Se comprueba la geometría real de los tres bloques, además de la proyección.

## Unit 6 · What did they say?

Actividad de parejas: ejemplo guiado más diez escenas distintas de noticias/desastres. A describe tres detalles en presente; B reporta lo dicho por A usando said that y cambios de verbos/pronombres, sin añadir información. Modelos comparables, 25 modelos de frases e instrucciones, ayudas y cada escena ampliables. Galería filtrable y proyector; modelos de práctica cerrados hasta solicitarlos. Once imágenes de actividad y hero propio. Sin grabación, entregas ni notas. Ver [implementación y pruebas](../english-intermediate2-reported-speech.md).

Ajuste visual y vocabulario del 9 de octubre de 2026: Retrato ficticio visible a 144 px (128 px en móvil) en el coach, con imágenes completas y manteniendo la fila. What did they say incorpora cinco palabras por cada una de sus once imágenes, significados españoles por mouse/foco/toque y pronunciación por clic; vocabulario y ayudas funcionan también dentro del proyector. Banner y miniaturas sin recorte.

## Unit 6 · After the Flood listening

Cierre de la secuencia de noticias: boletín ficticio de 29 segundos a 1×, voz Sarah de ElevenLabs, ocho preguntas A/B/C con evidencia y reintento. Tres propósitos de escucha, audio a 0.75×/1×/1.25× y cierre oral con reported speech. Transcripción solo para docente/admin mediante `/api/intermediate2/unit6-after-the-flood/transcript`, sin guion completo en los recursos públicos; se borra al cambiar/cerrar sesión y se descartan respuestas tardías. En Practice Lab y Listening Library, Unidad 6. Ver [implementación](../english-intermediate2-unit6-listening.md).

## Unit 6 · Pronunciation and Pronunciation Library

Report the News Clearly: cuatro grupos de noticia ficticia más grabación final; 64 modelos Sarah/ElevenLabs y 59 palabras clicables con consejo individual. Motor compartido sin cambios; resultados de reconocimiento, no diagnóstico fonético. Entrega final a bandeja docente independiente, sin notas, con rutas protegidas e idempotentes de Unidad 6.

Nueva Pronunciation Library, accesible desde portada y Practice Lab: siete actividades originales del catálogo, incluidas las seis unidades y el reto de News Quest. No duplicar las actividades ni alterar entregas. Ejecutar su constructor al añadir una nueva entrada. Referencia: [implementación, pruebas y recursos](../english-intermediate2-unit6-pronunciation.md).


## Unit 6 · Disaster News Memory

Actividad aprobada el 13 de octubre de 2026 para aprender vocabulario antes del noticiero oral: veinte términos, sin ambulance, evacuation, volunteers ni volcanic eruption. Tras la corrección del docente, sigue los juegos de Básico 2 `practice-unit-2-shopping-memory.html` y `practice-unit-3-around-world-memory.html`, contrastados también con Food Vocabulary Memory de Unidad 6. Conserva su tablero azul, tarjetas numeradas con giro, dos equipos, turnos, modelo de audio al descubrir cada tarjeta, confirmación docente del titular antes del punto y ganador con trofeo/confeti. Las parejas son dos imágenes iguales; ya no hay pestañas de aprender/escuchar/hablar ni modalidad individual. No califica pronunciación automáticamente ni envía resultados.

El tablero inicial contiene las veinte palabras (cuarenta tarjetas), con grupos opcionales completos de 7/8/5 pares. Traducción española al pasar el cursor o enfocar cada término del vocabulario; clic reproduce la palabra. Tras encontrar la pareja, un desplegable ofrece el ejemplo de noticia en pasado y su audio. Escapar o «Try again» devuelve la pareja sin punto; acertar conserva el turno; fallar lo cambia. Reiniciar cancela temporizadores pendientes.

Página `game-unit-6-disaster-news-memory.html`, primera entrada de Unidad 6 en Practice Lab. Se conservan el inventario de veinte palabras, la lámina original, el banner y los cuarenta modelos Sarah de ElevenLabs (palabra y ejemplo en pasado), auditados con Scribe y hashes. QR, proyección, velocidad 0.75×/1×, sonido desactivable y movimiento reducido. Datos en `assets/data/english-intermediate2-unit6-memory.json`; inventario de audio en `audio/unit-6-disaster-memory/models.json`. Prueba funcional: `tools/test_intermediate2_unit6_memory.cjs`: diseño a seis anchos, audios reales y hashes, parejas, turnos, confirmación, ganador, reinicio durante una espera, proyección y recuperación de carga. Recursos y prompts originales: `docs/english-intermediate2-unit6-memory-resources.json`.


Actualización del reto oral: al encontrar cada pareja, el estudiante da **un titular de noticia, una sola frase en pasado y con sus propias palabras**, usando el término de la tarjeta. El docente acepta cualquier titular coherente y confirma «Headline completed · +1»; no se pide una segunda intervención ni reported speech. Ejemplo inicial visible con imagen y audio antes del tablero: «The river overflowed and caused a flood». La primera pareja también muestra su modelo abierto; en las siguientes, el modelo queda disponible bajo demanda, sin imponer una respuesta única. Se conserva el formato de Básico 2 y los cuarenta audios originales.

Dos imágenes contextuales nuevas, generadas con imagegen, reemplazan en el juego las celdas food supplies y drinking water: entrega de alimentos tras una inundación y reparto de agua durante una sequía. Los otros dieciocho temas siguen usando la lámina original. Los datos añaden `image` e `imageDescription` solo a esas dos palabras. Modelos y prompts se registran en `docs/english-intermediate2-unit6-memory-resources.json`. El panel de pareja coloca imagen amplia y consigna en paralelo en computador y se adapta al móvil.

La grabación aislada «might» usa Sarah de catálogo como excepción de claridad: la auditoría transcribía la versión Chris como «mate». Las otras 114 grabaciones nuevas del coach y las 71 de reported speech usan Chris. Los 186 archivos nuevos pasan la comparación con sus guiones.


## Unit 6 · One verb, two prepositions (16 de octubre de 2026)

Nuevo bloque `#verb-prepositions` dentro de la explicación, entre vocabulario de desastres y narración en pasado. Diez pares aprobados: look for/at, listen to/for, ask for/about, hear about/from, report on/to, warn about/against, care for/about, work for/on, learn about/from y complain about/to. Veinte imágenes originales generadas con la herramienta integrada image_gen y guardadas como WebP sin recorte. Cada par enseña el significado en contexto de noticias/emergencias; distingue cambios de acción de cambios de tema, destinatario o fuente. No afirma exclusividad absoluta de una preposición para todos los usos del verbo. Incluye complemento intermedio en warn people about/against, -ing después de against y modelos en presente/pasado.

Cada par comienza cerrado, con dos tarjetas en una fila desde 761 px y una columna en móvil. Combinación subrayada: traducción española por hover/foco/toque y audio por clic. Pregunta comparativa, imagen individual y par completo proyectables; navegación por los diez pares, controles de velocidad y un único reproductor. Los enlaces a temas/pares abren sus acordeones. No crea entregas, cuentas ni calificaciones.

71 audios nuevos Sarah / ElevenLabs Multilingual v2: 20 combinaciones, 20 ejemplos en presente, 20 en pasado, 10 preguntas y una introducción. Guiones y hashes se añaden al inventario público existente; auditoría Scribe en el archivo habitual, con normalización neighbours/neighbors. Datos pedagógicos: `assets/data/english-intermediate2-unit6-prepositions.json`. Prompts completos, modo de generación y hashes de imágenes: `docs/english-intermediate2-unit6-prepositions-resources.json`. Fuentes PNG originales se conservan fuera del repositorio, WebP finales en `assets/img/english-intermediate-2/unit-6/prepositions/`.

Construcción: `python3 tools/build_intermediate2_unit6_prepositions.py` prepara guiones nuevos sin alterar grabaciones existentes; generador/auditor de audio de Unidad 6; `python3 tools/build_intermediate2_unit6_explanation.py` reconstruye HTML. Pruebas: regresión completa de explicación, `tools/test_intermediate2_unit6_prepositions.cjs` (siete tamaños/orientaciones, proyección por pares/individual, audio real, traducción, búsqueda, QR, hashes de veinte imágenes y decodificación de los 71 audios) y contrato de 55 páginas.

## Unit 6 · After the Storm (16 de octubre de 2026)

Cuento interactivo en Practice Lab: `reading-unit-6-after-the-storm.html`, entrada `unit-6-after-the-storm-story`. Diez páginas y veinte escenas para los diez verbos/veinte combinaciones del bloque anterior. Historia ficticia coherente de una tormenta e inundación en Greenford; Maya verifica información y sigue la recuperación de sus vecinos. Trece escenas compatibles reutilizadas y siete nuevas, más portada propia. Recursos y prompts completos: `docs/english-intermediate2-after-the-storm-resources.json`.

Cada página permite observar dos escenas, leer/escuchar, completar dos frases con verbo en pasado y preposición dada, y predecir. Ejemplo inicial visible. Selección por clic/teclado o arrastre, distractores con explicación individual en español, pista, reintento y modelo de audio solo después de acertar. El primer intento se conserva al revisar errores; resultados en memoria de la sesión, sin entregas ni notas. Cincuenta términos con traducción por hover/foco y pronunciación por clic/toque, también en proyección. Libro con paso de páginas, sonido opcional, velocidad 0.75×/1×, imágenes completas y proyección de textos/retos interactivos. Responsive, QR propio y autenticación compartida.

92 grabaciones Sarah de catálogo / ElevenLabs Multilingual v2: 10 narraciones, 10 predicciones, 50 palabras, 20 frases resueltas, guía y ejemplo. `audio/unit-6-after-the-storm/models.json` conserva guiones y hashes; auditoría Scribe completa. Generación y auditoría: `tools/generate_intermediate2_storm_audio.py`, `tools/audit_intermediate2_storm_audio.py`. Prueba funcional: `tools/test_intermediate2_storm.cjs`, configurable con `STORM_ORIGIN`; cubre los veinte retos, cuarenta errores específicos, recuperación, revisión, proyección, audio y siete tamaños de pantalla. Contrato actualizado a 56 páginas; Sign in de la nueva página revisado en cinco anchos, scroll y pantalla corta. Datos canónicos: `assets/data/english-intermediate2-after-the-storm.json`; controlador y CSS propios para no alterar los libros anteriores.

Corrección solicitada por el docente: **el cuento mismo es la actividad**. La versión inicial con cuatro pasos y ejercicios separados queda sustituida. Ahora cada página abre directamente el relato continuo con dos huecos dentro de sus párrafos. Al tocar un hueco se ofrecen exactamente dos expresiones completas del mismo verbo con distinta preposición (por ejemplo, looking for / looking at). La elección correcta ocupa el hueco; una elección incorrecta conserva el espacio y explica la diferencia para reintentar. El docente puede llamar a un estudiante en ese momento y seguir leyendo. No hay pestaña de ejercicios ni banco de verbos aislados.

Se mantienen diez páginas, veinte escenas, vocabulario, QR y proyección; los huecos también se resuelven desde el texto proyectado. Paso de páginas con animación de hoja y sonido de papel, desactivable, con respeto al movimiento reducido. La narración de cada página permanece bloqueada hasta completar sus dos huecos y se reproduce solo a petición. Doce grabaciones Sarah nuevas con sufijo `inline-v2` (diez páginas, guía y ejemplo) coinciden con el relato integrado; se conservan los audios anteriores sin usarlos como narración de esta versión. Hay 72 grabaciones activas y 104 en el inventario histórico, todas auditadas. La prueba funcional se reescribió para comprobar las veinte decisiones, dos opciones completas, reintento, bloqueo de audio, sonido al pasar página y proyección sincronizada. Sin entrega ni calificación académica.

Preferencia confirmada para el cuento: todo el feedback de acierto, error y reintento debe estar en inglés, incluidas las explicaciones de las veinte decisiones y el idioma accesible del mensaje. Las traducciones del glosario siguen en español, como ayuda de vocabulario solicitada. Esta corrección sustituye el feedback español de las versiones iniciales.

## Unit 6 · Explicación ampliada de reported speech (16 de octubre de 2026)

Se amplían los tres bloques existentes `#direct-reported`, `#say-tell` y `#changes` en Course Overview. Comenzar por el propósito de transmitir el mensaje de otra persona: hablante original, reportero y nuevo oyente. Comparación directa/indirecta y ejemplo construido en cuatro pasos, componentes de la oración, said/told y listener, that opcional, negativos y errores frecuentes. Cambios de tiempos con motivo y ejemplos escuchables; pronombres según sus referentes reales; calendario martes/miércoles/jueves para conservar la fecha de tomorrow; referencias de lugar y casos en que no hace falta backshift. Preguntas e instrucciones aparecen como extensión breve, sin confundirlas con las afirmaciones. Explicaciones y ejemplos en inglés, glosario español conservado. Fuentes: British Council, reported speech statements y questions, enlazadas en la página.

Nueve bloques cortos desplegables con proyección independiente y navegación dentro de cada tema; la proyección de la sección completa también se conserva. Diagramas nativos para participantes, cuatro pasos, componentes y calendario. Se mantienen imágenes anteriores, once temas principales, QR, búsqueda, vocabulario y pares de preposiciones. Los enlaces internos del proyector cierran la ventana y abren el tema correspondiente. No crea actividad, cuenta, entrega ni calificación.

18 audios nuevos Sarah de catálogo / ElevenLabs Multilingual v2, con auditoría Scribe y hashes; inventario activo de la explicación: 154. No se alteran los 136 guiones ni grabaciones anteriores. Contenido canónico y nuevos guiones en `tools/build_intermediate2_unit6_reported_support.py`, importado por el constructor de la explicación. Prueba nueva `tools/test_intermediate2_reported_support.cjs`: siete tamaños/orientaciones, nueve bloques, enlaces, navegación, audio real, decodificación de los 18 archivos y recuperación tras error. Conservar también regresiones de explicación y preposiciones y contrato de 56 páginas.

## Ruta «October 17 Class»

Nombre visible en inglés por solicitud del docente: «October 17 Class» en el botón, el menú y los pasos; etiquetas accesibles en inglés. Se conserva el identificador interno del enlace anterior para mantener compatibles los enlaces ya compartidos.

Botón solicitado con ese nombre exacto en Course Overview, con ruta desplegable `#class-september-17`. Orden: 1) explicación de los diez pares de verbos/preposiciones (`#verb-prepositions`); 2) cuento interactivo After the Storm de Practice Lab; 3) explicación de discurso indirecto (`#direct-reported`, seguida de `#say-tell` y `#changes`); 4) What did they say?, ejemplo y diez imágenes para describir en presente y reportar lo dicho por el compañero; 5) Disaster News Memory, parejas y un titular en pasado con palabras propias; 6) After the Flood, noticia de 29 segundos, ocho preguntas y cierre oral. La etiqueta es una ruta docente, no modifica el calendario oficial ni las evaluaciones.

Cada destino muestra el paso y enlaces para continuar, volver o consultar la ruta. Los enlaces relativos funcionan en local y producción. La navegación no se copia dentro del contenido proyectado. No requiere completar ni enviar resultados para avanzar. Constructor de la ruta: `tools/build_intermediate2_class_route.py`; el constructor de explicación importa sus bloques compartidos. CSS propio y un script mínimo de apertura del itinerario en Course Overview. Prueba funcional: `tools/test_intermediate2_class_route.cjs` recorre la secuencia real, los tres apartados gramaticales, libro/proyección, QR y regreso al itinerario en cinco anchos; contrato de páginas y auditoría de Sign in obligatorios.

What did they say? enlaza al juego de memoria (paso 5), y este al listening (paso 6). Los botones permiten regresar al paso anterior y finalizar desde el listening volviendo al itinerario. Los contadores y etiquetas se generan con el total del listado. Se conservan las veinte palabras y los audios del juego, así como el audio, las ocho preguntas y la protección de la transcripción docente del listening. El juego sugiere elegir «Help · 5 pairs» para una ronda corta; no cambia el tablero inicial ni sus reglas. La navegación de la clase queda fuera del tablero proyectado. La prueba de la ruta verifica una pareja, audio y confirmación del titular, reproducción del listening a 0.75×, preguntas, transcripción oculta para visitantes y navegación de ida/vuelta entre los últimos tres pasos.

## Final Oral · Live News Report

Página de instrucciones y modelo presencial aprobada por el docente: `final-oral-live-news-report.html`, equipos de 2–4, roles de presentador, periodista de estudio, corresponsal y testigo, una noticia ficticia con entrevista, verbos con preposiciones y discurso indirecto. Prohibido leer durante la evaluación; el modelo de clase sí se representa leyendo, con el docente en un papel. Nota individual /50 y peso 20%, sin implementación nueva de notas o entregas ni apertura de otros exámenes.

Seis tarjetas inicialmente boca abajo, revelado secuencial y proyección con imagen/diálogo; modo de ensayo sin texto, nombres de actores para la visita, vocabulario español por hover/foco y tres imágenes generadas con la foto autorizada de David. Voz en vivo; no usar voces clonadas. Tres entradas locales para clips y descarga Markdown con tres prompts. Los videos reales están pendientes de generación por el docente y posterior entrega para edición: no describir las imágenes como videos. Enlaces desde Evaluations y Course Overview. Ver [implementación, recursos y pruebas](../english-intermediate2-final-oral-news.md).
