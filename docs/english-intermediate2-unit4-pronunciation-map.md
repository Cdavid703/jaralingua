# Unidad 4 · Make Your Movie Review Clear

## Mapa realizado antes de construir

| Referencia inspeccionada | Elemento que aporta | Decisión para unidad 4 |
| --- | --- | --- |
| Intermediate 2, Unit 1: pronunciation-unit-1-people-who-changed-my-circle.html y english-intermediate2-pronunciation-unit1.js | Motor compartido: grabación, transcripción, alineación, colores, audio por palabra, reintentos y entrega | Cargar el mismo motor sin copiarlo ni alterarlo |
| Intermediate 2, Unit 2: pronunciation-unit-2-the-choice-id-make-differently.html y configuración unit2 | Cuatro grupos de sentido y párrafo final; ancho completo y bandeja sin nota | Conservar ese recorrido y las mismas banderas de entrega |
| Intermediate 2, Unit 3: pronunciation-unit-3-sound-clear-tech-support.html | Plantilla visual más próxima: hero fotográfico, controles, Shadow Mode, lectura/grabadora, resultados y tarjetas de apoyo | Copiar su estructura; cambiar únicamente contenido, imagen, rutas y focos de pronunciación |
| Basic 2, Unit 3: pronunciation-unit-3-around-world.html y english-basic2-pronunciation-unit3.js | Cada palabra es un botón; las palabras rojas siguen reproduciendo su MP3 tras evaluar | Verificar ese comportamiento en una grabación evaluada, no solo antes de grabar |
| docs/pronunciation-activity-standard.md | Contrato general de estados, micrófono, evaluación y progresión | Mantener el patrón; la excepción de 39 verbos de Basic 2 no corresponde a esta reseña |
| docs/english-intermediate2-pronunciation-activity-standard.md | Contrato específico del nivel: Sarah, cinco modelos, audios individuales, bandeja independiente | Aplicado sin cambios de mecánica |
| Unit 4: Movies, Music and Reviews | Ever/already/yet, original/sequel, opinión con evidencia, soundtrack, check it out y on the edge of my seat | Construir una reseña coherente con ese lenguaje |

## Secuencia pedagógica

1. Experience and final sounds: experiencia, contracciones, watched, original, sequel, yet.
2. Opinion and word stress: razón con because, contraste con although, gripping, predictable, convincing.
3. Music and connected speech: has just released, catchy soundtrack, grupos de sentido.
4. Recommendation and expression rhythm: check it out y on the edge of my seat.
5. Final challenge: las cuatro secciones unidas exactamente, 79 palabras.

Escuchar → Shadow Mode → grabar → evaluar → pulsar palabras rojas → escuchar el modelo exacto → repetir o avanzar. Se avanza después de un intento evaluado; no se exige una nota mínima.

El color refleja coincidencia con la transcripción reconocida, no un diagnóstico fonético. La leyenda conserva “recognized word / word to practice”. El docente escucha la grabación final.

## Reutilización visual y funcional

- HTML base: la página de pronunciación de Unit 3.
- Estilos compartidos: english-intermediate-pronunciation.css y english-intermediate2-pronunciation.css.
- CSS de Unit 4: mismas reglas de distribución de Unit 3, con alcance local y corrección probada del panel Sign in sobre el hero.
- Motor compartido sin cambios: english-intermediate2-pronunciation-unit1.js.
- Configuración nueva: assets/js/english-intermediate2-pronunciation-unit4.js.
- Modelo 0.75× / 1× / 1.25×, Shadow Mode, selector de micrófono, medidor, cronómetro, reproducción propia, resultados e historial conservados.
- La palabra pulsada conserva su marca de error; muestra selección, reproducción, consejo y repetición. No hay síntesis de voz del navegador.

## Audios

66 MP3: cinco lecturas y 61 palabras distintas. Voz Sarah, General American English, ElevenLabs eleven_multilingual_v2. Se reutilizaron 22 archivos de palabras cuyo texto y voz coinciden; se generaron 44 archivos restantes. Cada audio y su procedencia/hash figuran en models.json.

Las cinco lecturas y el modelo de “original” se verificaron mediante transcripción, comparada con el texto canónico. Los 61 audios de palabra se cargaron y reprodujeron en la prueba de navegador.

Carpeta: ingles/intermediate-2/audio/pronunciation/unit-4-intermediate2/.
Guion: ingles/intermediate-2/audio/pronunciation/unit-4-make-your-movie-review-clear-script.md.
Generación: tools/generate_intermediate2_unit4_pronunciation_audio.py.
Auditoría: tools/audit_intermediate2_unit4_pronunciation_audio.py.

## Imagen

Archivo: assets/img/english-intermediate-2/unit-4/pronunciation-movie-review/movie-review-hero-v1.png.
Método: herramienta integrada image_gen; copia final guardada en el proyecto. Referencia visual inspeccionada: foto de Unit 3.

Prompt final: “Use case: photorealistic-natural. Create one landscape 16:9 editorial photograph for an intermediate English pronunciation lesson about movie reviews. Match a natural educational website photo: believable adult learner, soft daylight, muted navy and teal accents, warm wood desk, shallow depth of field, no graphic overlays. An adult Latina woman about 30 in a navy shirt wears headphones and speaks naturally into a black desktop microphone, recording a film review. A laptop seen at an angle shows only a softly blurred cinematic scene, no recognizable film, no readable text. A small unlettered cinema clapperboard and headphones context hint at movies; a notebook sits on the desk. Comfortable modern study room with soft bookshelf and plant background. Medium-wide composition, subject centered-right, face and microphone fully visible and safe for responsive crops. Realistic skin and hands. No text, logos, watermarks, typography, UI mockup, collage or illustration. This is a new hero photograph for the project.”

## Entrega y permisos

- Rutas propias /api/intermediate2/unit4-pronunciation/submit, /submissions y /audio.
- JSON independiente: JARALINGUA_INTERMEDIATE2_UNIT4_PRONUNCIATION_SUBMISSIONS, por defecto /var/lib/jaralingua/intermediate2-unit4-pronunciation-submissions.json.
- Grabaciones privadas en el almacén de audio de Intermediate 2.
- La bandeja usa los docentes de Intermediate 2. No depende de la lista de Intermediate 1.
- Autenticación, texto final canónico, reintento idempotente y acceso a la grabación propia o del docente.
- Solo bandeja: sin evaluación en Grades, sin porcentaje y sin cambio de promedio.

## Verificaciones

- tools/test_intermediate2_unit4_pronunciation_page.mjs: plantilla, cinco textos, 61 palabras, archivos, hashes y catálogo.
- tools/test_intermediate2_unit4_pronunciation_delivery.py: idempotencia, texto canónico y ausencia de campos de nota.
- tools/test_intermediate2_unit4_pronunciation_http.py: HTTP real con alumnos ficticios en almacenamiento temporal; acceso del docente de Course 2, aislamiento entre alumnos, notas intactas.
- tools/test_intermediate2_unit4_pronunciation_ui.mjs: micrófono sintético de Chrome, MediaRecorder real y transcripción controlada para provocar un error conocido; reproducción real de 61 palabras, clic sobre original en rojo después de evaluar, reintento, cinco grabaciones, entrega real al servidor temporal y reproducción docente.
- Distribución verificada a 390, 820 y 1440 píxeles; Sign in se comprueba por visibilidad y superposición.

No se crean cuentas ni entregas de prueba en producción.
