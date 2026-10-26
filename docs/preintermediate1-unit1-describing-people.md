# Activity 4 of 8 · Describing People · Writing

El docente autorizó continuar con Describing People, en **Writing** (sin Guided Writing), manteniendo el ejercicio original y el diseño compacto. Activity 5 no se comienza todavía.

## Fidelidad a la fuente

Fuente: ESL Pals, `22 - Describing Personality.pdf`, sección Describing People en la parte inferior de la página 6. Se conserva la consigna literal, incluida su errata: “Use the words from in the box to describe the following people.” Se mantiene el banco smart, friendly, rude, grumpy, creative, shy, silly, lazy, talkative en su orden.

Ocho personas en su orden original: Your teacher, Your best friend, Your grandparents, A classmate, Your brother, A celebrity, Your mother, Your uncle. **Your teacher ya es el ejemplo resuelto**: “My teacher is friendly.” No se convierte en un octavo campo editable ni se sustituye por otro modelo. Se presentan siete espacios de escritura, numerados del 2 al 8, y se conserva la subnumeración i. La respuesta del modelo usa rojo como en la fuente.

Esta sección del PDF contiene texto, banco de palabras y espacios para escribir; no tiene ilustraciones de ejercicio adicionales. Se reutiliza el renderizado exacto ya publicado de la página 6 en `assets/img/english-preintermediate-1/unit-1/practice/meet-the-characters/original-page-6.webp`. No se añaden retratos que sustituyan el contenido del ejercicio. La vista original muestra toda la página y explica que Who is it?, en la parte superior, pertenece a Activity 3.

La descarga conserva el PDF completo original de diez páginas sin modificar sus bytes: `ingles/preintermedio-1/materials/22-describing-personality-original.pdf`, SHA-256 `70b7a41f2d06f786d6c6c796f0ea83605056ed0fb04be6df161a3cf3a4b8c22e`.

## Escritura y borrador

Página `writing-unit-1-describing-people.html`. Siete textareas vacías; ejemplo fijo y banco visibles en la carpeta de escritura. Dos columnas en escritorio y una en móvil, conservando orden y controles cómodos. Dos carpetas cerradas al cargar: escritura y vista del original. Componentes, tipografía, colores y hero compacto de Básico 2. QR propio ampliable.

Review my writing comprueba cuántas respuestas están escritas y recuerda comparar con el modelo y el banco. No inventa una clave única para descripciones personales ni una nota de corrección gramatical. Los campos permanecen editables y cualquier edición retira la revisión anterior. Las respuestas se guardan solo en sessionStorage de esa pestaña con clave exclusiva `jl-pi1-describing-people-v1`; no se envían al servidor ni a un servicio de evaluación. No hay botón de submit; los botones son type=button y no existe envío nativo con las respuestas si falta JavaScript.

Start again vacía únicamente los siete campos y conserva una copia para Undo reset, también tras recargar. Undo restaura el texto y deja intacto el ejemplo. Escribir un nuevo borrador después de reiniciar retira el deshacer anterior para evitar reemplazar texto nuevo. La revisión de incompletos informa lo que falta y mantiene las respuestas existentes. No se alteran registros, entregas ni notas oficiales.

## Audio

Se reutilizan los nueve modelos exactos de palabras ya aprobados: friendly, creative, shy y talkative desde unit1/lesson; smart, rude, grumpy, silly y lazy desde unit1/personality-vocabulary. El modelo “My teacher is friendly.” es nuevo con Sarah de catálogo ElevenLabs (`EXAVITQu4vr4xnSDxMaL`, `eleven_multilingual_v2`); Scribe confirma el texto exacto normalizando mayúsculas y puntuación. Guion, voz y hash: `ingles/preintermedio-1/audio/unit1/describing-people/models.json`. Velocidades 0.75×/1×/1.25× y parada. Informe local: `tmp/preintermediate1-describing-people-qa/audio-audit.json`.

## Portada propia

Se usó ImageGen integrado para una portada nueva, diferente de las otras actividades. Archivo final del proyecto: `assets/img/english-preintermediate-1/unit-1/practice/describing-people/cover.webp`, 1600×800. El original generado se conserva en generated_images de Codex.

Consigna exacta:

> Use case: photorealistic-natural. Create a new original wide website hero and activity-card cover for an adult English writing lesson called Describing People. This is a cover photograph only, not a replacement for worksheet content. Show one adult Latino man around 30–40, wearing a relaxed navy-blue shirt, thoughtfully writing short sentences with a pen in an open notebook at a language-school desk. Candid side view, focused calm expression, natural hands and believable pen grip. A few English study books and a warm bright classroom in soft focus behind him, no other prominent faces. Distinct composition from group conversation covers: the writer and notebook are the clear focal point. Frame his face, writing hand and notebook within the central two-thirds so mobile cropping works. Wide landscape about 2:1, realistic editorial educational photography, natural skin texture, soft daylight, navy, cream, light wood and warm neutral colors. No legible text or letters, no labels, no logos, no watermark, no collage. Do not illustrate or depict the eight worksheet prompts as portraits.

## Integración y comprobación

Fuentes: `tools/preintermediate1_unit1_describing_people_content.py` y `tools/build_preintermediate1_unit1_describing_people.py`. La cadena 1→2→3 reaplica Activity 4 después de Case Study. Practice Lab presenta cuatro actividades del PDF disponibles y cuatro pendientes, además de las dos historias originales. Cuatro tarjetas por fila en escritorio, dos en tablet y una en móvil, con descripciones de una o dos líneas. Reading enlaza a Writing; las cuatro páginas muestran 4 de 8 listas. Las actividades anteriores conservan sus textos, datos, imágenes y lógica.

Se cotejan consigna, banco, ocho personas y modelo con el PDF. Pruebas: incompletos, texto en siete respuestas, revisión sin nota, edición posterior, conservación de texto multilínea, reinicio, reinicio repetido, deshacer tras recargar, conservación del modelo y deshacer retirado al empezar texto nuevo. Se revisan el audio de palabra y modelo, velocidad, parada, QR, página original, enlaces y tarjeta de categoría Writing. Ocho tamaños: 320×568, 360×740, 390×844, 844×390, 820×1180, 1180×820, 1440×900 y 1920×1080, sin desbordamientos ni superposición de navegación; textareas de al menos 76 px. Los constructores son idempotentes y las demás unidades se mantienen intactas. Publicación: registrar la verificación en la continuidad del curso.
