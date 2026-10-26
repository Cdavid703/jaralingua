# Unit 1 · Personality Vocabulary · Activity 1 of 8

El docente autorizó construir las ocho actividades una por una y avisar al terminar cada una. Esta entrega construye únicamente la primera. Describing People queda planificada en **Writing**, según su corrección explícita. Las siete siguientes no tienen páginas ni enlaces activos todavía.

## Fidelidad al documento

Fuente: ESL Pals, `22 - Describing Personality.pdf`, páginas 1–2. El PDF completo de diez páginas se conserva sin modificar en `ingles/preintermedio-1/materials/22-describing-personality-original.pdf`.

SHA-256 original: `70b7a41f2d06f786d6c6c796f0ea83605056ed0fb04be6df161a3cf3a4b8c22e`.

Se mantienen los nueve adjetivos, las nueve pistas y su orden, ambas consignas (incluida la errata del Task 1), el warm-up del clima y sus cuatro dibujos, las nueve ilustraciones del Task 2 en el orden numerado, y las dos ilustraciones decorativas. La actividad digital usa selectores para completar los mismos espacios. En pantalla pequeña se reorganizan las columnas para conservar la legibilidad y las imágenes completas. La sección «View the original worksheet» muestra además las dos páginas enteras con el diseño original. La descarga entrega los mismos bytes de la fuente.

No se generan sustitutos de las ilustraciones del ejercicio. Se extraen directamente de las imágenes incorporadas al PDF y se guardan como WebP sin pérdida. El mapeo de objetos se indica abajo; son nombres internos de pypdf, no números de página.

| Archivo WebP | Página | Imagen incorporada |
| --- | --- | --- |
| sunny | 1 | X17.png |
| rainy | 1 | X19.png |
| snowy | 1 | X15.png |
| cloudy | 1 | X13.png |
| word-task-illustration | 1 | X23.png |
| picture-01 | 2 | X37.png |
| picture-02 | 2 | X33.png |
| picture-03 | 2 | X35.png |
| picture-04 | 2 | X39.png |
| picture-05 | 2 | X43.png |
| picture-06 | 2 | X41.png |
| picture-07 | 2 | X45.png |
| picture-08 | 2 | X49.png |
| picture-09 | 2 | X47.png |
| picture-task-illustration | 2 | X51.png |

Los archivos se guardan en `assets/img/english-preintermediate-1/unit-1/practice/personality-vocabulary/`. `original-page-1.webp` y `original-page-2.webp` son renderizados de las páginas completas a 1800 píxeles de alto. Se conserva la atribución a ESL Pals.

El PDF no incluye clave de respuestas. La revisión acepta silly/rude para el gesto de la imagen 2 y rude/grumpy para la cara de la imagen 9, con explicación. Las asociaciones outgoing/talkative, moody/grumpy, reserved/shy e inactive/lazy se aclaran como relaciones de esta hoja, sin presentarlas como sinónimos exactos en todos los contextos.

## Portada generada

Se usó el **generador de imágenes integrado (ImageGen)** únicamente para una portada nueva. Archivo final: `assets/img/english-preintermediate-1/unit-1/practice/personality-vocabulary/cover.webp` (1600 × 800). Esta portada aparece en la tarjeta y el hero; las ilustraciones de los ejercicios siguen siendo las originales.

Consigna exacta:

> Use case: photorealistic-natural. Asset type: wide website hero and activity-card cover for an adult English vocabulary lesson titled Personality Vocabulary, with no lettering in the image. Primary request: professional, natural editorial photograph of three adult classmates getting to know one another around a shared table in a bright modern language classroom. One person warmly welcomes a new classmate, another thoughtfully listens, and a third sketches an idea in a small notebook: personality shown through observable actions, not exaggerated caricature. Diverse adults about 25–40, relaxed modest casual clothing, authentic faces and hands, believable classroom materials. Wide landscape composition with all faces comfortably within the central two-thirds so the scene crops well on mobile. Soft daylight, warm human atmosphere, restrained blue and neutral colors that work with a navy-blue and red educational website. High-quality realistic photography, sharp subject detail, natural anatomy. No words, no logos, no watermarks, no labels, no split panels. This is a new original cover asset; do not reproduce any worksheet or existing illustration.

## Funcionamiento y reproducción

`tools/build_preintermediate1_unit1_personality.py` construye la página y el acceso dentro de Unit 1, conserva sus dos historias publicadas y todas las demás unidades, y genera el QR de su URL pública. Se ejecuta al final de la cadena de historias desde Unit 6 para conservar esta integración al reconstruir. Contenido transcrito: `tools/preintermediate1_unit1_personality_content.py`.

Se reutilizan los cuatro modelos exactos de friendly, creative, shy y talkative. Se generan cinco palabras nuevas con Sarah de catálogo (`EXAVITQu4vr4xnSDxMaL`, `eleven_multilingual_v2`): smart, rude, grumpy, silly y lazy. Inventario, guiones y hashes: `ingles/preintermedio-1/audio/unit1/personality-vocabulary/models.json`. Se usa el generador existente `generate_first_visit_audio` cambiando únicamente su DEST a esta carpeta; no se emplean voces David.

Las dos tareas son formativas. Borradores en sessionStorage de la pestaña, sin envío ni cambios de notas. Un intento incompleto no cuenta. Repetir la misma combinación tampoco adelanta las explicaciones; aparecen con dos intentos completos distintos o con todas las respuestas aceptadas. Cambiar una respuesta retira el resultado anterior, y los selectores permanecen editables. Start again reinicia solamente su tarea.

La descarga respeta el acceso de alumnos ya establecido por google-auth.js. No se altera la autenticación del sitio.

## Verificación

Se comprobaron incompletos, primer intento, repetición idéntica, segundo intento distinto, explicación, respuesta perfecta, alternativas de las imágenes, edición posterior, reinicio y conservación tras recargar. Se revisaron seis tamaños: 390×844, 844×390, 820×1180, 1180×820, 1440×900 y 1920×1080. Las imágenes conservan su proporción completa. Los cinco audios nuevos coinciden con sus guiones en transcripción Scribe; el informe queda fuera de publicación en `tmp/preintermediate1-personality-qa/audio-audit.json`.

El resultado de publicación se registra en la continuidad del nivel después de verificarlo.
