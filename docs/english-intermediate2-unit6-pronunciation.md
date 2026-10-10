# Unit 6 · Report the News Clearly

Solicitud del 9 de octubre de 2026: actividad de pronunciación que siga las otras unidades y biblioteca como la de Básico 2.

## Secuencia

Cuatro grupos de significado: noticia y acento de palabras; reported speech y enlaces; terminaciones /t/, /d/, /id/ de checked, delivered y wanted; fuentes fiables y pausas. El reto final une exactamente los cuatro textos. Modelo → Shadow Mode → grabación → transcripción/feedback → palabra clicable → reintento → reto final. Cada una de las 59 palabras tiene consejo propio y audio.

## Recursos y límites

El guion Markdown queda como fuente de auditoría en el repositorio; el servidor bloquea esa extensión por HTTP. El catálogo enlaza al inventario público models.json, que incluye los textos de enseñanza.

64 MP3 de ElevenLabs: cuatro secciones, modelo completo y 59 palabras. Sarah, inglés estadounidense, eleven_multilingual_v2. Se reutilizaron siete palabras exactas con hash verificado; las demás son nuevas. Auditoría de transcripción de los 64 archivos: el artículo a en su forma débil /ə/ se reconoce como uh y se registra explícitamente como variante válida; los demás coinciden por normalización de mayúsculas y puntuación. El sitio real transcribió exactamente la tercera sección usando su reconocedor existente.

Reutiliza el motor compartido de Unidad 1 sin modificarlo. Sus resultados estiman coincidencia de palabras, completitud y ritmo/velocidad; no son diagnóstico fonético ni evaluación del acento. La página lo explica junto al resultado. La prueba de UI usa micrófono simulado y transcripción controlada, y realiza la entrega real en un servidor aislado con cuentas ficticias. No se enviaron grabaciones de alumnos ni se crearon entregas de prueba en producción.

## Entrega

/api/intermediate2/unit6-pronunciation/submit, /submissions y /audio. Misma política que Unidad 5: solo reto final, identidad autenticada, texto canónico exacto, idempotencia, audio protegido, estudiante solo ve lo propio, docente/admin de Intermedio 2 ve la bandeja. Almacenamiento independiente en /var/lib/jaralingua/intermediate2-unit6-pronunciation-submissions.json. No proyección en notas ni efecto en promedio.

## Biblioteca

pronunciation-library.html reúne siete entradas originales del catálogo: las actividades completas de unidades 1–6 y News Quest, que incluye su reto de pronunciación. No clona actividades ni cambia sus entregas o identificadores. Acceso desde la portada del curso y Practice Lab. Tarjetas de cuatro/tres/dos/una columnas según ancho; sin carpetas vacías. Phonetic Rules sigue enlazado como explicación aparte.

El constructor tools/build_intermediate2_pronunciation_library.py usa las entradas publicadas type=pronunciation del catálogo central. Ejecutarlo al añadir otra actividad; la prueba compara inventario, catálogo, Practice Lab y biblioteca. QR propio para ambas páginas y fotografías completas con altura acotada.

## Comprobaciones

- Pruebas estáticas: cinco textos canónicos, 64 hashes, auditoría completa, 59 palabras y flags de entrega.
- HTTP aislado: sesión, entrega, replay idempotente, privacidad del audio, bandeja docente y notas intactas; regresión de Unidad 5.
- UI: reproducción de las 59 palabras, error deliberado en flooded, palabra roja clicable, replay, reintento, cinco grabaciones, modelo/velocidad/Shadow Mode, entrega y audio docente.
- Diseño de actividad: siete anchos de 320–1920 px. Biblioteca: seis anchos, siete enlaces, imágenes, QR, tarjeta de portada y Practice Lab.
- Contrato de 54 páginas con QR y autenticación; auditoría de Sign in en cinco anchos.

## Imágenes y prompts

Generadas con la herramienta integrada image_gen; originales conservados en la carpeta local de imágenes generadas.

- assets/img/english-intermediate-2/unit-6/pronunciation/report-the-news-hero.webp
- assets/img/english-intermediate-2/pronunciation-library-hero.webp

Prompt de actividad: Use case: photorealistic-natural. Asset: landscape hero photo for an adult English pronunciation activity about reporting the news. One adult Latin American male student wearing a navy shirt, practicing a short news bulletin into a desktop microphone in a bright university media classroom. Headphones, a blank notebook, a laptop showing only indistinct shapes, and a blurred generic weather map in background. Calm focused natural speaking expression, daylight, teal accents, editorial photography, realistic anatomy. Medium wide composition, full head and microphone in frame, landscape 1536x1024. No text, captions, logos, watermarks or readable lettering.

Prompt de biblioteca: Use case: photorealistic-natural. Asset: landscape hero photograph for an adult Intermediate English pronunciation library. A female Latin American university learner in her thirties wearing headphones at a tidy study desk, practicing spoken English into a small desktop microphone while a second adult classmate listens nearby. Bright modern language learning center with blurred bookshelves, warm daylight, navy and teal accents. A welcoming focused scene, distinct from a newsroom. Natural skin and hands, entire faces and microphone inside frame, landscape 1536x1024. No text, readable screens, letters, numbers, logos, watermarks or UI overlays.
