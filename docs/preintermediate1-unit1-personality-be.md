# Activity 2 of 8 · Describing Personality with Be

El docente autorizó continuar únicamente con la segunda actividad, manteniendo los ejercicios e imágenes originales y el diseño compacto aprobado. La tercera actividad se mantiene pendiente.

## Fuente y fidelidad

ESL Pals, `22 - Describing Personality.pdf`, páginas 3–4. Se reutiliza la descarga original completa de diez páginas, sin alterar sus bytes: `ingles/preintermedio-1/materials/22-describing-personality-original.pdf`, SHA-256 `70b7a41f2d06f786d6c6c796f0ea83605056ed0fb04be6df161a3cf3a4b8c22e`.

Se transcriben la tabla con sus formas am/is/are, los siete sujetos en su orden, los siete ejemplos y las tres tareas: diez espacios, nueve oraciones originales con errores y nueve afirmaciones personales. Se conservan sus palabras, orden y consignas. En particular, se mantienen neat en el ejemplo de they y la ausencia de punto final en la última afirmación personal. Las consignas y todas las oraciones originales se cotejan con la extracción y el renderizado del PDF.

Las ilustraciones se extraen directamente del PDF y se guardan como WebP sin pérdida en `assets/img/english-preintermediate-1/unit-1/practice/personality-be/`:

| Archivo | Fuente | Uso |
| --- | --- | --- |
| grammar-illustration.webp | Página 3, X57.png, 1078×798 | Tres personas junto al Task 1 |
| personal-practice-illustration.webp | Página 4, X60.png, 1069×888 | Personas con guitarra, violín y cámara junto al Task 3 |
| original-page-3.webp | Página 3 completa renderizada a 1275×1800 | Vista del original |
| original-page-4.webp | Página 4 completa renderizada a 1275×1800 | Vista del original |

Las dos ilustraciones de ejercicios coinciden píxel por píxel con las originales al componerlas sobre blanco. No se redibujan ni se generan sustitutos. La vista opcional conserva las páginas completas con sus logotipos y pies. El PDF permanece intacto.

## Presentación e interacción

Página `grammar-unit-1-personality-be.html`, categoría **Grammar**, con el CSS compacto de la actividad 1 más ajustes exclusivos de `preintermediate1-personality-be.css`. Tabla semántica, selector dentro de cada oración para am/is/are, correcciones en dos columnas en escritorio y una en celular, e imágenes completas con contain. Acordeones cerrados inicialmente; las anclas abren la sección. QR propio ampliable, colores y tipografía de Básico 2. Controles de al menos 44 px.

Task 1 utiliza is con sujetos singulares, am con I y are con plurales/you/we/they. Class se trata como un grupo singular en esta hoja. Task 2 muestra exactamente las nueve oraciones originales incorrectas. Para corregir, se acepta la primera oración corregida o el texto completo con su contexto, contracciones estándar y diferencias de mayúsculas/puntuación. No se acepta una forma aislada de be como sustituto de la oración. Las diferencias de signos o capitalización por sí solas no cuentan como un nuevo intento.

Las claves y explicaciones son pedagógicas; el PDF no incluye una clave. Explicaciones después de dos intentos completos distintos o de un resultado perfecto. Incompletos y combinaciones repetidas no cuentan. Los campos siguen editables; editar retira el feedback anterior. Cada tarea se reinicia por separado y conserva su borrador al recargar.

Task 3 conserva las nueve afirmaciones y la consigna oral. Las opciones True for me / Not true for me / Not applicable permiten recordar la respuesta personal después de decirla en voz alta; no generan una nota ni se corrigen como verdaderas o falsas. La revisión solo comprueba que haya una respuesta por afirmación. Borradores en sessionStorage con clave exclusiva de esta página, sin envío ni cambios de registros. La descarga conserva la autenticación existente.

Fuentes: `tools/preintermediate1_unit1_personality_be_content.py` y `tools/build_preintermediate1_unit1_personality_be.py`. El constructor de la actividad 1 reaplica la segunda al terminar para preservar navegación e integración en la cadena. Practice Lab anuncia dos de ocho actividades del PDF disponibles, conserva las dos historias existentes y las demás unidades, y mantiene seis actividades pendientes. Describing People continúa en Writing. Activity 1 añade un enlace a Activity 2; Activity 2 permite volver a Activity 1.

## Audio

Los siete ejemplos exactos de la tabla tienen modelos nuevos de Sarah de catálogo ElevenLabs (`EXAVITQu4vr4xnSDxMaL`, `eleven_multilingual_v2`). Se usa el generador existente `generate_first_visit_audio` cambiando solo DEST. Guiones, voz y hashes: `ingles/preintermedio-1/audio/unit1/personality-be/models.json`. Las siete transcripciones Scribe coinciden con los textos, normalizando puntuación y mayúsculas. Informe local: `tmp/preintermediate1-personality-be-qa/audio-audit.json`. Velocidades 0.75×/1×/1.25× y parada, sin reproducción automática.

## Portada propia

Se usó ImageGen integrado únicamente para la portada nueva. Archivo final en el proyecto: `assets/img/english-preintermediate-1/unit-1/practice/personality-be/cover.webp`, 1600×800. El original generado se conserva en la carpeta generated_images de Codex; las imágenes de ejercicios proceden del PDF.

Consigna exacta:

> Use case: photorealistic-natural. Asset type: original wide hero photograph and activity-card cover for an adult English lesson, Describing Personality with Be. This image is a website cover only; do not reproduce, redraw, or replace any worksheet illustrations. Show two adult language learners around age 25–40, a Latina woman and an East Asian man, working together at a small table in a bright, welcoming modern classroom. The woman is thoughtfully writing in her notebook while the man attentively explains an idea with a natural small hand gesture. Convey learning to describe oneself and classmates through authentic conversation. They are peers in casual smart clothing. A soft-focus whiteboard and books in the background, no legible text anywhere. Distinct new composition, slightly elevated editorial three-quarter camera angle, both faces and the notebook within the central two-thirds so mobile crops work. Wide landscape composition, about 2:1. Photorealistic natural skin texture, believable hands and writing tools, soft daylight, restrained navy, warm yellow and neutral colors, polished educational photography without stock-photo exaggeration. No typography, no written letters, no labels, no logos, no watermark, no collage.

## Verificación

Se prueban incompletos, primer intento erróneo, repetición, segundo distinto, corrección perfecta, contracciones, mayúsculas/puntuación, edición posterior, reinicio y conservación de las tres tareas tras recargar. La tarea personal no genera puntuación. Audio, velocidad, parada, QR, vista de originales y acceso desde Practice Lab comprobados. Tabla, ilustraciones y campos abiertos con feedback en 320×568, 360×740, 390×844, 844×390, 820×1180, 1180×820, 1440×900 y 1920×1080 sin desbordamiento; mínimo de 44 px para los campos. Se verifica idempotencia de los dos constructores y preservación de las demás unidades. Resultado de publicación: registrar en la continuidad después de verificarlo.
