# Activity 3 of 8 · Case Study: Meet the Characters

El docente autorizó la tercera actividad con los mismos textos, imágenes y ejercicios del PDF y el diseño compacto aprobado. Categoría Reading. Describing People sigue pendiente como Activity 4, categoría Writing.

## Fuente y alcance

ESL Pals, `22 - Describing Personality.pdf`: Case Study de la página 5 y Who is it? en la parte superior de la página 6. Se conservan los cinco perfiles completos (Angie, Frankie, Gillian and Thomas, Max y Joe), la columna Describing words, las diez afirmaciones True or False, las cinco pistas y todas las consignas. No se corrigen ni se reescriben las inconsistencias de la fuente. Incluso se mantiene la expresión original «complete the last table» y se aclara en una ayuda que la entrada corresponde a la última columna.

La descarga sigue siendo el PDF completo original de diez páginas, sin modificar sus bytes: `ingles/preintermedio-1/materials/22-describing-personality-original.pdf`, SHA-256 `70b7a41f2d06f786d6c6c796f0ea83605056ed0fb04be6df161a3cf3a4b8c22e`. La vista opcional muestra las páginas 5–6 enteras. Se indica explícitamente que Describing People, visible más abajo en la página 6 del original, pertenece a la siguiente actividad; no se crea su página ni sus campos todavía.

## Imágenes originales

Carpeta: `assets/img/english-preintermediate-1/unit-1/practice/meet-the-characters/`.

- `case-study-illustration.webp`: extracción directa sin pérdida de X63.png, página 5, 991×843. Es la ilustración de tres personas con camisetas numeradas que aparece junto a True or False. Coincide píxel por píxel con el original al componer sobre blanco.
- `original-page-5.webp` y `original-page-6.webp`: renderizados completos a 1275×1800 para comparar con la fuente.
- `cover.webp`: portada nueva de ImageGen integrado, 1600×800. Se usa solo en hero y tarjeta; no sustituye la ilustración original ni se presenta como retratos de los personajes.

## Descripciones, claves y evidencia

La columna Describing words es una respuesta abierta: cinco campos y comparación con palabras posibles y evidencia, sin puntuación ni una supuesta respuesta única. Las nueve palabras del vocabulario original aparecen como apoyo. Los borradores son editables y se conservan por pestaña. Las sugerencias son creative/friendly/shy para Angie, lazy/rude para Frankie, smart/talkative para Gillian and Thomas, silly/friendly para Max y grumpy para Joe, con explicaciones de lo explícito y lo inferido.

El PDF no trae clave. Para True or False se utiliza la interpretación prevista por el caso completo: F, T, T, F, F, F, T, F, F, T. La afirmación 3 no describe una acción observada en el perfil: sus vecinos lo consideran mean y la pista de Who is it? lo describe explícitamente como rude to his neighbours. El feedback explica esta diferencia. Grumpy para Joe aparece en la pista, no como palabra explícita del perfil; se aclara. La afirmación 9 es falsa porque el perfil dice not friendly; no se inventa que el texto diga que Joe no es talkative. No se infiere personalidad de las ilustraciones.

Who is it? conserva estas respuestas en su orden: Joe, Angie, Gillian and Thomas, Frankie, Max. Ambas tareas ofrecen explicación y cita del texto después de dos intentos completos distintos o de un resultado perfecto. Las repeticiones e incompletos no cuentan como nuevos intentos. Los resultados se retiran al cambiar una respuesta; los controles siguen editables. Los enlaces de evidencia abren la lectura y llevan al perfil correcto, incluso si su carpeta estaba cerrada. Reinicio independiente por tabla y tarea. Todo es formativo y local, sin entregas ni notas oficiales.

## Audio y diseño

Cinco lecturas nuevas de los perfiles exactos con Sarah de catálogo ElevenLabs (`EXAVITQu4vr4xnSDxMaL`, `eleven_multilingual_v2`). Inventario, guiones y hashes en `ingles/preintermedio-1/audio/unit1/meet-the-characters/models.json`. Tres transcripciones Scribe coinciden tras normalizar signos y mayúsculas; las otras dos solo difieren en neighbors/neighbours y Jillian/Gillian. La comparación con esos alias ortográficos confirma que no falta ni cambia ninguna palabra del contenido. Informe fuera de publicación: `tmp/preintermediate1-characters-qa/audio-audit.json`. Botón Listen por perfil, velocidades 0.75×/1×/1.25× y parada, sin autoplay.

Diseño compacto heredado de Activity 1: tabla de tres columnas en escritorio y tarjetas legibles en móvil, True or False en filas, Who is it? en dos columnas en escritorio y una en celular, ilustración completa con contain, controles de al menos 44 px y QR propio ampliable. Cuatro carpetas cerradas inicialmente. Se mantienen CSS, colores, fuente y autenticación de Básico 2. Practice Lab usa tres tarjetas por fila en escritorio, dos en tablet y una en móvil.

Fuentes: `tools/preintermediate1_unit1_characters_content.py` y `tools/build_preintermediate1_unit1_characters.py`. El constructor de Activity 2 reaplica Activity 3 al terminar; la cadena 1→2→3 conserva enlaces y estados. Las tres páginas enlazan al bloque con tres de ocho actividades listas. Activity 2 añade Next · Meet the Characters; la nueva permite volver a Grammar. Las otras cinco actividades permanecen en preparación.

## Consigna de la portada

Se usó el generador ImageGen integrado. Archivo final: `assets/img/english-preintermediate-1/unit-1/practice/meet-the-characters/cover.webp`; se conserva el original generado en la carpeta generated_images de Codex.

> Use case: photorealistic-natural. Create a new original wide website hero and activity-card photograph for an adult English reading activity called Case Study: Meet the Characters. This is only the page cover; do not draw or replace any worksheet illustrations or character portraits. Show a Black woman around 35 and a man around 50 with glasses reading and discussing a few plain printed profile sheets in a welcoming language-school library. They are adult classmates, attentive and naturally engaged, looking down at the reading and then toward one another, with bookshelves softly out of focus behind them. Documentary editorial photography from a slightly side-on table-level angle, distinct from a front-facing classroom group portrait. Include books and a notebook with no legible text. Frame both faces and the shared reading within the central two-thirds for mobile cropping, wide landscape about 2:1. Soft daylight, realistic skin and hands, navy, warm yellow and neutral colors suitable for the established educational site. Calm, thoughtful atmosphere. No lettering, no labels, no logos, no watermarks, no collage, no invented name cards.

## Verificación

Se cotejan los cinco perfiles, las diez afirmaciones y las cinco pistas con el PDF, así como los píxeles de la ilustración y el hash del PDF. Tabla: incompletos, comparación no puntuada, edición que oculta sugerencias, conservación tras recargar y reinicio independiente. Tareas: incompletos, primer intento, repetición, segundo distinto, resultado perfecto, edición posterior, conservación y reinicio. También audio, velocidad, parada, evidencia que abre el perfil, QR, originales y navegación.

Ocho tamaños entre 320 y 1920 px con lectura y feedback abiertos, sin desbordamiento, tabla dentro del ancho, ilustración completa, navegación contenida y campos/etiquetas de al menos 44 px. Constructores 1, 2 y 3 idempotentes; se conservan las demás unidades y los textos, datos y gráficos de las dos primeras actividades. Registrar la publicación verificada en la continuidad del curso.
