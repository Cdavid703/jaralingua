# Guía de construcción — Inglés Intermedio 2

> Documento de referencia permanente para crear, ampliar y revisar `ingles/intermediate-2/`.
>
> **Regla de uso:** antes de construir una página de Intermedio 2, leer esta guía, la guía pedagógica descargable y la página análoga más cercana. No copiar una página de Básico 2 literalmente: se reutiliza su patrón pedagógico, pero se conserva la identidad y los contratos técnicos de Intermedio 2.

## 1. Alcance y fuentes de verdad

### Nivel y secuencia pedagógica

La guía oficial del curso está en [Intermediate_Course_2_Easy_Guide.docx](../ingles/intermediate-2/downloads/Intermediate_Course_2_Easy_Guide.docx). Define un curso de 64 horas, 21.3 sesiones de 3 horas y un ciclo TBL:

1. **Pre-task:** agenda, propósito, activación y modelo de lengua.
2. **Task:** contextualización, preparación, producción e interacción.
3. **Post-task:** retroalimentación formativa, revisión entre pares y refuerzo de las dificultades.

La ruta de aprendizaje por actividad es obligatoria:

`input/modelo → noticing de lengua → práctica controlada → tarea comunicativa → reflexión, producto o retroalimentación`

El producto no debe pedir respuestas personales sensibles. Las situaciones de dilemas, relaciones, noticias o identidad se formulan como opción ficticia, general o de aula.

### Estado actual del curso

| Unidad | Tema                                        | Estado web                                                         | Próxima referencia pedagógica                                     |
| ------ | ------------------------------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------- |
| 1      | Relationships and Meeting People            | Desarrollada                                                       | Relaciones, relativos, descripciones, conversación social         |
| 2      | Wishes, Dilemmas and Advice                 | Desarrollada                                                       | Deseos, arrepentimientos, segundo condicional y consejos          |
| 3      | Technology and Digital Safety               | Explicación, pronunciación, juegos, listening y reading disponibles | Tecnología, preguntas embebidas, phrasal verbs, seguridad digital |
| 4      | Movies, Reviews and Music Trends            | Pendiente                                                          | Reseñas, trama, present perfect y tendencias                      |
| 5      | Speculation, Feelings, Community and Satire | Pendiente                                                          | `must/might`, impresiones, estados de ánimo y sátira              |
| 6      | News, Reported Speech and Natural Disasters | Pendiente                                                          | Noticias, reported speech, secuenciación y emergencias            |

La meta mínima de una unidad completa desde la Unidad 4 es: explicación, carpeta de práctica, listening, reading, pronunciación, actividad de gramática, tarea de speaking y producto escrito o comunicativo. La guía anterior de estilo que existe en `docs/english-intermediate-style-guide.md` fue titulada para Course 1; sirve como antecedente pedagógico, pero este documento gobierna el Course 2.

### Repositorios y archivos de referencia

| Necesidad                                         | Fuente principal                                                                                                                                                               |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Shell, tokens, ancho y responsive de Intermedio 2 | `assets/css/english-intermediate-2.css`                                                                                                                                        |
| Página de inicio y tarjetas del curso             | `ingles/intermediate-2/index.html`                                                                                                                                             |
| Overview y mapa de unidades                       | `ingles/intermediate-2/course-overview.html`                                                                                                                                   |
| Explicaciones de unidad                           | `unit-1-relationships-meeting-people.html`, `unit-2-wishes-dilemmas-advice.html`, `unit-3-technology-digital-safety.html`                                                      |
| Prácticas y catálogo                              | `practice-lab.html`, `assets/js/english-intermediate2-practice-lab.js`, `assets/data/english-intermediate-2-content.json`                                                      |
| QR de acceso a página                             | `assets/js/page-qr-access.js`, `assets/img/page-qr/`                                                                                                                           |
| Conversación                                      | `conversation-coach-unit-1-coffee-with-gabriel.html`, `assets/js/english-intermediate2-conversation-coach-unit1.js`, `assets/css/english-intermediate2-conversation-coach.css` |
| Pronunciación                                     | `pronunciation-unit-2-the-choice-id-make-differently.html`, `assets/js/english-intermediate2-pronunciation-unit2.js`, `assets/css/english-intermediate2-pronunciation.css`     |
| Listening                                         | `listening-unit-2-the-call-before-midnight.html`, `assets/js/intermediate2-listening-call-before-midnight.js`                                                                  |
| Reading                                           | `reading-unit-2-the-six-week-window.html`, `assets/js/intermediate2-reading-six-week-window.js`                                                                                |
| Back-end y entregas                               | `server/progress_api.py`                                                                                                                                                       |
| Patrón equivalente en Básico 2                    | `ingles/basico-2/`, `assets/css/english-basic-2.css`, `assets/css/english-basic-responsive.css`                                                                                |

## 2. Identidad visual y sistema de estilos

### Principio de diseño

Intermedio 2 se ve profesional, adulto, claro y activo: más sobrio que Básico 2, sin parecer pesado ni corporativo. La imagen comunica una situación real de aprendizaje o comunicación; el texto y las acciones permanecen legibles sobre ella.

No introducir una hoja CSS global nueva para una página aislada si el componente puede vivir en `english-intermediate-2.css`. Una hoja especializada se justifica para un motor de interacción complejo: conversación, pronunciación, práctica, debate o evaluación.

### Tokens obligatorios de Intermedio 2

Usar los tokens existentes, no valores de color arbitrarios:

| Token                         | Uso                                                     |
| ----------------------------- | ------------------------------------------------------- |
| `--ie2-navy` `#071f4f`        | títulos, navegación, estructura y evaluación            |
| `--ie2-blue` `#2454a6`        | navegación secundaria y marcadores de progreso          |
| `--ie2-teal` `#0f766e`        | acciones principales, colaboración y éxito              |
| `--ie2-coral` `#c8463f`       | alertas, evaluación, errores y pronunciación focalizada |
| `--ie2-gold` `#d9a441`        | reflexión, tips y chips destacados                      |
| `--ie2-ink` / `--ie2-muted`   | texto principal / secundario                            |
| `--ie2-paper` / `--ie2-soft`  | superficies y fondo                                     |
| `--ie2-line` / `--ie2-shadow` | borde y profundidad de tarjetas                         |

Las superficies repetidas usan borde sutil, fondo blanco y radio de `8px`. La excepción son componentes de interacción que ya tienen una identidad definida en su CSS especializado. No usar color como único indicador: agregar texto, icono o estado visible.

### Ancho, composición y tarjetas

Intermedio 2 usa composición amplia, no un riel central estrecho:

- Shell estándar: `width: min(1180px, calc(100% - 36px))`.
- Hero de inicio y overview: imagen de fondo de ancho completo, degradado oscuro desde la izquierda y contenido alineado al borde inferior.
- Dashboard: tres columnas en escritorio; tarjetas con imagen `4 / 3`, número, estado, título, resumen y CTA.
- Grids de contenido: `repeat(auto-fit, minmax(min(100%, 250px), 1fr))` cuando la cantidad de tarjetas es variable.
- Botones y enlaces accionables: `.intermediate2-button` o `.intermediate2-card-action`; altura mínima de `46px` en escritorio.

### Imágenes profesionales

Las imágenes existentes usan personas adultas, aulas, trabajo en grupo, conversación, tecnología o la situación exacta de la tarea. El repositorio contiene imágenes por curso, unidad y actividad:

```
assets/img/english-intermediate-2/
  intermediate-2-home-hero-v1.png
  cards/
  units/
  unit-1/<actividad>/
  unit-2/<actividad>/
  unit-3/<actividad>/
```

Para una imagen nueva:

1. Ubicarla en `assets/img/english-intermediate-2/unit-<n>/<slug>/`.
2. Usar un nombre descriptivo y versionado, por ejemplo `movie-review-listening-hero-v1.webp`.
3. Mantener una escena adulta, diversa, plausible y coherente con la tarea; no poner texto, logotipos ajenos ni letras pequeñas dentro de la imagen.
4. Incluir `width`, `height`, `alt` específico, `decoding="async"` y `loading="lazy"`; solo el hero principal puede usar `fetchpriority="high"`.
5. Aplicar `object-fit: cover`; verificar que el sujeto importante siga visible después del recorte móvil.

### Diferencia útil frente a Básico 2

Básico 2 aporta una buena referencia de navegación didáctica: hero, objetivos, rutas, tarjetas, listening, juegos, pronunciación y QR. Sin embargo, usa un shell de hasta `1760px`, radios de `22px`, azul más brillante y una estructura visual más lúdica. En Intermedio 2 se conservan los flujos pedagógicos, los controles accesibles y la estrategia mobile-first, pero se usan los tokens `--ie2-*`, radios de `8px` y el shell de `1180px`.

## 3. Responsividad: contrato para escritorio, tableta y celular

El curso es primero utilizable en celular y también apto para proyección de aula. Nunca se permite scroll horizontal accidental.

### Breakpoints existentes

| Tamaño                    | Contrato                                                                                                                                                                                      |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Escritorio, `> 980px`     | dashboard y grids principales en tres columnas; hero amplio; CTA en línea cuando caben.                                                                                                       |
| Tableta, `<= 980px`       | grids principales en dos columnas; pasaportes de unidad en una columna; el contenido conserva márgenes y botones cómodos.                                                                     |
| Celular, `<= 640px`       | una columna; shell `calc(100% - 24px)`; hero corto con degradado más oscuro; navegación horizontal desplazable; CTA en grid de dos columnas si son breves o una columna si el texto lo exige. |
| QR en celular, `<= 620px` | tarjeta QR reducida a `84px`, código a `66px`, con espacio reservado dentro del hero.                                                                                                         |

### Reglas que no se negocian

- `body` usa `english-intermediate2-page`; conservar `min-width: 0`, `overflow-x: hidden` y `box-sizing: border-box`.
- En móvil, la barra superior no se oculta: el logo se centra y los enlaces usan scroll horizontal con blancos de toque. No envolver los enlaces en varias filas sin necesidad.
- Los botones móviles miden mínimo `42px`; no usar targets diminutos solo para que quepan.
- Las tarjetas pasan a una columna. Los chips pueden ser dos columnas si su texto permanece legible; si no, una.
- El hero conserva texto, contraste y QR; no confiar en una imagen clara detrás del texto. En móvil el degradado llega aproximadamente al 95% de opacidad al final.
- Las imágenes de tarjetas y heroes no fijan alturas que corten contenido. Usar `aspect-ratio`, `object-fit` y `min-width: 0`.
- Las tablas o listas largas deben tener alternativa apilada, wrapper horizontal explícito o una estructura de tarjetas. Nunca romper el viewport.
- Probar 320 px, 390 px, 768 px, 1024 px y escritorio antes de publicar.

### Auditoría transversal registrada el 4 de septiembre de 2026

Se revisaron las **28 páginas HTML** existentes de Intermedio 2, agrupadas así: inicio/overview y tres explicaciones de unidad; Practice Lab, Listening Library, Evaluations y Grades; cinco actividades de Unidad 1; ocho de Unidad 2; tres de Unidad 3; Midterm Writing Practice, Midterm Oral Coach y la evaluación escrita oficial.

El contrato automatizado `tools/test_intermediate2_page_contract.mjs` comprueba para cada archivo: `meta viewport`, scripts compartidos de autenticación, orden de carga y al menos una regla responsive de tableta/móvil alcanzable. `tools/intermediate2-responsive-audit.html` carga las 28 páginas dentro de viewports reales de **320, 390, 768 y 1024 px**, ignora únicamente el contenido deliberadamente recortado dentro de un control con scroll propio y falla ante cualquier elemento que realmente desborde el viewport. La corrida registrada terminó con **112/112 comprobaciones aprobadas y cero desbordamientos visibles**. Cada nueva página debe añadirse a ambos inventarios y ejecutar las dos verificaciones antes de publicarse.

La navegación compartida limita `.navbar` y `.nav-links` al ancho del viewport; en móvil los enlaces y **Sign in** permanecen dentro de una franja con desplazamiento horizontal propio. Los copies de hero que alojan el QR deben usar `width: auto`, `max-width: 100%` y `min-width: 0` en móvil: así el espacio reservado por `page-qr-access.js` no se suma por fuera del padding del banner.

## 4. Shell obligatorio de una página de Intermedio 2

Cada página publicada debe mantener este orden conceptual:

1. `meta viewport` con `viewport-fit=cover`, título y meta descripción.
2. CSS compartido: `../../assets/css/style.css` y `../../assets/css/english-intermediate-2.css`; Bootstrap Icons solo si se usan iconos.
3. `<body class="english-intermediate2-page ...">`.
4. `global-course-switcher` con enlaces a Home, English, Course Home, Course Overview y Practice Lab.
5. `site-header` y `navbar`, con logo, enlaces pertinentes y destino claro.
6. `<main>`: hero, búsqueda cuando la página tiene muchos bloques, contenido, siguiente paso y footer.
7. Scripts de la actividad, autenticación compartida obligatoria, búsqueda, course switcher y QR como último script.

### Acceso superior obligatorio en todas las páginas

Las 28 páginas HTML de Intermedio 2 deben mostrar **Sign in** en la navegación superior, incluso cuando la actividad sea privada, no tenga entrega o no use todavía datos del estudiante. El acceso común permite conservar la sesión y evita que el estudiante tenga que regresar al inicio para conectarse.

Orden mínimo antes de los scripts propios de la actividad:

```html
<script src="../../assets/js/google-auth-config.js"></script>
<script src="https://accounts.google.com/gsi/client" async defer></script>
<script src="../../assets/js/google-auth.js"></script>
```

`google-auth.js` debe reconocer tanto `/ingles/intermediate/` como `/ingles/intermediate-2/`, insertar el control dentro de `.site-header .nav-links` y usar el panel móvil fijo a `max-width: 680px`. No crear botones de autenticación distintos por actividad.

Las páginas extensas usan búsqueda con `data-course-search-panel`, `data-course-search-input`, `data-search-target`, `data-search-items` y `data-search-keywords` por bloque. Debe haber botón Clear, conteo y mensaje de cero resultados. No agregar búsqueda a una actividad muy corta que no gana nada con ella.

### Logo JaraLingua: contrato obligatorio

Todas las páginas de `ingles/intermediate-2/` deben mostrar el logo JaraLingua visible y enlazado al inicio del sitio. En el shell estándar se usa exactamente este patrón, dentro de `.site-header > .navbar`:

```html
<a href="../../index.html" class="brand">
  <img src="../../assets/img/jaralingua-logo.png" alt="JaraLingua Logo" />
</a>
```

La clase `brand` es necesaria: `assets/css/style.css` controla allí el ancho del logo (`150px`), su bloque y su adaptación móvil. No usar `class="logo"` ni una imagen sin una regla de tamaño, porque el archivo original es cuadrado de alta resolución y puede desbordar, reducirse de forma impredecible o desaparecer dentro del navbar. Una página heredada que use el navbar Bootstrap puede conservar su patrón `navbar-brand` y `brand-logo` solo si tiene una regla explícita y verificada de tamaño; el estándar para páginas nuevas es siempre `brand`.

En la revisión previa a publicación, confirmar en escritorio y celular que el logo carga (sin error 404), se ve completo, conserva su `alt`, conduce a `../../index.html` y no queda tapado por el selector global de cursos.

## 5. QR por página: creación, posición y ampliación

### Propósito

El QR de página sirve para trasladar rápidamente una actividad proyectada al teléfono del estudiante. No es un marcador decorativo ni reemplaza un enlace accesible. El QR de una sala en vivo es otro caso: incluye código de sala y puede crearse dinámicamente por el juego.

### Implementación estándar

El script [page-qr-access.js](../assets/js/page-qr-access.js) agrega el QR automáticamente cuando se cumplen estas condiciones:

- La URL coincide con `/ingles/intermediate-2/<archivo>.html`.
- La página incluye el script al final del `body`:

  ```html
  <script src="/assets/js/page-qr-access.js?v=20260901-2"></script>
  ```

- Existe un host reconocido en el hero: por ejemplo `.intermediate2-hero-content`, `.ie2-overview-hero-copy`, `.ie2-listening-hero-content`, `.ie2-reading-hero-content`, `.ie2-speaking-hero-content`, `.ie2-coach-hero-copy`, `.ie2-grammar-hero-copy` o `.ie2-unit<n>-hero-copy`.
- Existe el SVG en `assets/img/page-qr/` con el nombre derivado de la ruta. Para `ingles/intermediate-2/listening-unit-4-movie-review.html`, el archivo esperado es:

  ```text
  assets/img/page-qr/ingles-intermediate-2-listening-unit-4-movie-review.svg
  ```

El QR se debe generar para la URL pública final y comprobarlo con un teléfono. El repositorio guarda SVG de 640 × 640, de alto contraste y sin información adicional embebida. No hay un generador único de QR versionado actualmente; al crear uno, anotar la URL usada en el PR o en la tarea y validar su escaneo.

### Posición y comportamiento

- Escritorio: tarjeta absoluta dentro del copy del hero, arriba a la derecha (`top/right: 10px`), `116px` de ancho y código de `92px`; el host reserva `132px` a la derecha para que el texto no quede debajo.
- Celular: tarjeta arriba a la derecha de `84px`, código de `66px`; el host reserva `100px`.
- El botón tiene etiqueta accesible, imagen con `alt` descriptivo y foco visible.
- Al hacer clic, se abre un elemento nativo `<dialog>` centrado, de máximo `620px`; el QR se amplía hasta `520px`, con backdrop y botón de cerrar. También se cierra al tocar el backdrop.
- Si el SVG no existe, el script elimina la tarjeta y el diálogo. Por eso la presencia del script **no basta**: comprobar que el SVG carga y se escanea.

No crear manualmente otro QR fijo dentro del hero a menos que sea un QR especial de sala en vivo. La duplicación rompe el detector `.page-qr-card, .jl-page-qr-card` y confunde al estudiante.

## 6. Producción y uso de audios

### Contrato de audio

Los audios profesionales se preproducen como MP3, no se sintetizan al cargar la página. Los guiones canónicos, audio y metadatos viven junto a la unidad:

```
ingles/intermediate-2/audio/
  unit-4-explanation/scripts.md
  unit-4/<listening>.mp3
  unit-4/<listening>-scripts.md
  pronunciation/unit-4-intermediate2/
  conversation-coach/unit-4-<slug>/
```

La generación usa ElevenLabs en scripts de `tools/`, con secreto local en `elevenlabs.local.env`. La configuración habitual de los modelos explicativos es `eleven_multilingual_v2`, inglés y MP3 `44100/128`. Los diálogos se generan con `tools/elevenlabs_generate_listenings.py`, un transcript canónico y un voice cast JSON.

**Nunca mostrar el nombre del proveedor en la experiencia estudiantil de Intermedio 2.** `tools/test_intermediate2_no_provider_branding.mjs` lo verifica en HTML, scripts cliente y catálogo. El proveedor puede constar en los metadatos privados y las herramientas de producción.

### Flujo para una explicación o pronunciación

1. Escribir `scripts.md` con secciones y un nombre `File: \`archivo.mp3\`` por modelo.
2. Crear o adaptar un script `tools/generate_intermediate2_unit<n>_<tipo>_audio.ps1` que lea el entorno local, omita archivos ya creados salvo `-Overwrite` y guarde junto al guion.
3. Generar, escuchar y contrastar cada audio con el guion. Para palabras objetivo, generar modelos individuales si la actividad permite pulsar cada palabra.
4. Referenciar MP3 local, usar controles nativos o botones accesibles, y dar velocidad `0.75x`, `1x`, `1.25x`.
5. Agregar transcript, instrucciones y alternativa textual cuando el audio sea parte esencial de la comprensión.

### Flujo para un diálogo listening

1. Escribir un turno por línea y usar etiquetas de speaker únicamente como metadatos.
2. Asignar una voz clara y distinta a cada hablante en el voice-cast JSON.
3. Ejecutar primero `--dry-run --verbose`; verificar destino, número de voces y asignaciones.
4. Generar el MP3 y escuchar al menos los primeros 20 segundos: no se deben oír los nombres de personajes.
5. Guardar transcript, metadatos de voces/duración y actualizar el `src` de la página.
6. Validar que el audio no se corte, que las cantidades/nombres sean inteligibles y que las preguntas correspondan al diálogo final.

## 7. Blueprint de cada tipo de página

### 7.1 Inicio y Course Overview

**Inicio** (`index.html`) contiene hero de curso, buscador, dashboard de secciones, mapa de las seis unidades y calendario. Cada tarjeta usa imagen, estado disponible/compartido, descripción breve y CTA.

**Course Overview** (`course-overview.html`) es la página curricular, no un duplicado del inicio. Debe contener:

- Hero con promesa de curso, botones y acceso a la guía descargable.
- Una tarjeta expandible por unidad (`<details>`), con resultados de aprendizaje, foco funcional/gramatical, sesiones, tarea y evaluación si aplica. Todas empiezan cerradas.
- El orden de la guía pedagógica, las fechas solo si están confirmadas y los bloques de repaso separados de las unidades.
- Enlaces hacia explicación y práctica solo cuando esas páginas existen; para contenido futuro, usar estado visible `Complete explanation planned`, no enlaces rotos.

### 7.2 Página de explicación de unidad

Usar una de las unidades 1–3 como referencia. La explicación debe tener:

1. Hero con `h1`, big idea, objetivo comunicativo, chips de foco y acciones hacia práctica o recursos.
2. Bloque de resultados observables: qué puede comprender y producir el estudiante.
3. Vocabulario en contexto, expresiones, phrasal verbs e idioms con definición, registro, equivalencia aproximada y modelo.
4. Gramática con forma, significado, contraste, errores frecuentes y ejemplos reales de la unidad.
5. Modelos de audio y el texto equivalente.
6. Progresión hacia la tarea: práctica controlada, opción de actividad, tarea grupal y cierre/reflexión.
7. Navegación a listening, reading, pronunciación, práctica y siguiente unidad cuando existan.

Evitar bloques de texto masivo. Usar tarjetas `ie2-*`, tablas solo para comparaciones reales y `<details>` para explicaciones secundarias. Cada sección debe tener `data-search-keywords` si la página incluye búsqueda.

**Regla de apertura por defecto.** En todo Intermedio 2, las carpetas de Practice Lab, unidades del Overview, bloques de explicación y ayudas de actividades empiezan cerrados: no usar el atributo `open` en `<details>`. El estudiante o docente decide qué abrir. Las anclas y la búsqueda pueden llevar al bloque, pero no deben desplegarlo automáticamente salvo una necesidad de accesibilidad documentada.

#### Patrón obligatorio para phrasal verbs e idioms

La referencia pedagógica es la sección **Expressions** de `ingles/intermediate/unit-4-family-problems-memories.html`: categoría y contexto antes de memorizar, significado, situación de uso, varios modelos y expresiones relacionadas. Intermedio 2 conserva esa profundidad y añade enseñanza explícita de orden y pronunciación. La implementación canónica actual es `unit-3-technology-digital-safety.html#phrasal-verbs`.

Toda sección de phrasal verbs debe seguir esta secuencia:

1. Explicar primero qué es un *phrasal verb*: verbo principal + partícula que funcionan como una unidad léxica y pueden producir un significado distinto al verbo aislado.
2. Compararlo brevemente con una expresión fija y un idiom. No llamar phrasal verb a cualquier combinación de palabras.
3. Declarar la gramática de cada entrada: transitivo/intransitivo y separable/inseparable. Para los separables, mostrar las dos posiciones posibles del sustantivo y la posición obligatoria del pronombre: `turn down the volume`, `turn the volume down`, `turn it down`.
4. Presentar cada entrada en una tarjeta amplia con equivalencia aproximada, significado contextual, ejemplo con sustantivo, ejemplo con pronombre cuando corresponda, situación/registro y pauta de sonido. Nunca volver al mosaico de tres columnas de microtarjetas con texto encerrado o altura artificialmente corta.
5. Incluir en la misma sección 2–4 idioms conectados con el tema de la unidad. Identificarlos como idioms, explicar el significado figurativo, contexto y registro, y modelar la expresión completa; no mezclarlos silenciosamente con la categoría gramatical de phrasal verb.
6. Cerrar con errores frecuentes, comprobación breve y una producción que use las expresiones en contexto.

La retícula usa como máximo dos columnas en escritorio y una sola columna por debajo de 700 px; el texto tiene `line-height` mínimo de 1.5, `overflow-wrap`, padding suficiente y sin alturas fijas. Una imagen profesional contextual puede acompañar la introducción, pero no reemplaza la explicación. A 320, 390, 768 y 1024 px no puede haber scroll horizontal, recorte ni controles fuera de la tarjeta.

La pronunciación no se resuelve con un audio combinado que recite toda la lista. Cada expresión tiene su MP3 profesional individual, guion verificable y dos acciones: modelo lento a 0.75x y natural a 1x. En los phrasal verbs separables, el guion incluye la forma aislada, un ejemplo con sustantivo y uno con pronombre; la pauta visual explica enlace, consonantes finales, acento y reducción. Los idioms se graban como grupos completos de sentido. El `<audio>` local sigue siendo la fuente accesible, los botones reflejan reproducción con `aria-pressed` y solo puede sonar un modelo a la vez. La marca del proveedor y sus credenciales nunca aparecen en la interfaz.

En la Unidad 3 existen nueve modelos en `audio/unit-3-explanation/phrasal-verbs-and-idioms/`, generados por `tools/generate_intermediate2_unit3_phrasal_idiom_audio.ps1`; los guiones canónicos están en `audio/unit-3-explanation/scripts.md`.

### 7.3 Practice Lab y actividades base

`practice-lab.html` es el índice operativo de ejercicios. Organiza por `<details>` de unidad y presenta tarjetas desde el catálogo `assets/data/english-intermediate-2-content.json` cuando aplica.

Toda actividad debe declarar con claridad:

- propósito comunicativo y lengua meta;
- número de participantes, tiempo y si es individual, parejas, equipos o dirigida por docente;
- pasos visibles antes de empezar;
- modelo y práctica guiada antes de la producción libre;
- feedback textual al corregir, reset seguro y siguiente paso;
- política de entrega: sin envío, inbox docente sin nota, reporte 0% o evaluación oficial.

Para juegos de vocabulario, ruletas, memory, role cards o debates, reutilizar el patrón de Básico 2: instrucciones simples, tarjetas grandes, feedback visible, controles operables por teclado y una versión que no dependa de hover. En Intermedio 2, la tarea debe pedir justificar, comparar, negociar, matizar o reaccionar; no limitarse a identificar una palabra.

#### Diseño obligatorio de las tarjetas de Practice Lab

Todas las unidades comparten una sola retícula: cuatro columnas de ancho estable en escritorio cuando haya espacio, dos en tableta y una en móvil. Usar `repeat(auto-fill, minmax(250px, 1fr))`, nunca `auto-fit` ni una excepción por unidad: si una unidad tiene una, dos o tres actividades, se conservan los mismos anchos y el espacio restante de la fila queda vacío. Así una nueva tarjeta no crece ni cambia el ritmo visual de las que ya existen.

Cada tarjeta de actividad es deliberadamente mínima y solo conserva cuatro elementos visibles: **imagen 16:9, una sola etiqueta de tipo** (`Grammar`, `Listening`, `Reading`, `Pronunciation`, `Conversation Coach`, `Speaking game`, etc.), **título** y **una reseña de una sola frase**. La reseña se guarda en el campo específico `cardSummary`, debe describir la acción principal en un máximo recomendado de 90 caracteres y se limita visualmente a dos líneas. No se debe renderizar `subtitle` ni el `summary` largo del catálogo dentro de la tarjeta.

Se eliminan número visible, duración, producto, estado de entrega, metadatos y botón repetitivo como `Open activity`; toda la tarjeta funciona como enlace con un `aria-label` explícito. Los campos descriptivos extensos permanecen en el catálogo únicamente para búsqueda y metadatos. El catálogo es la fuente de las tarjetas; el HTML de Practice Lab solo aporta la retícula, el contador y la secuencia. La Unidad 3 es la referencia validada de este patrón; las unidades anteriores se migran únicamente cuando sean revisadas, sin volver a introducir sus textos largos.

### 7.4 Conversation Coach

El coach es una práctica oral guiada, no una evaluación por defecto. Tomar como patrón `conversation-coach-unit-1-coffee-with-gabriel.html` y su CSS/JS especializado.

Estructura mínima:

1. Hero con personaje, contexto, objetivo conversacional, duración aproximada y QR.
2. Aviso de privacidad claro: audio transitorio para transcripción, sin nota ni envío, salvo que la tarea se declare explícitamente entregable.
3. Ruta de 5–7 turnos con propósito creciente; cada turno muestra tema y microobjetivo.
4. Preflight de micrófono: prueba, reproducción, permisos y alternativa si no funciona.
5. Prompt actual con imagen del personaje, **una sola pregunta o petición conversacional por interacción**, botón para oírla, reproducción a 0.75x/1x/1.25x y micrófono seleccionado. No encadenar preguntas; tras la respuesta, el personaje reacciona y hace el siguiente turno.
6. Grabación `MediaRecorder`, medidor de nivel, contador, detener/regrabar, reproducción propia, transcripción temporal, recuperación ante fallo y opción de continuar sin transcripción.
7. Respuesta modelada del personaje según intención y cierre con recap de habilidades practicadas.

No persistir audio, transcript ni una nota de un coach de práctica. Si se solicita una entrega, definir actividad, versión, consentimiento, endpoint, estado de recepción e integración de profesor antes de codificarla. El coach debe funcionar en Chrome/Edge recientes sobre HTTPS o localhost; mostrar un mensaje útil si el navegador no soporta grabación. El estado inicial debe decir con claridad qué hacer —por ejemplo, “Ready when you are. Tap the microphone to answer.”— y los botones deben usar etiquetas breves como “Answer”, nunca texto que se recorte en móvil.

### 7.5 Pronunciación

La página canónica tiene cuatro secciones guiadas y un desafío final, como `pronunciation-unit-2-the-choice-id-make-differently.html`.

Cada experiencia incluye:

- Hero con objetivo de sonido, reducción, ritmo o entonación, imagen y QR.
- Modelo profesional por sección, play/pause, control de velocidad y Shadow Mode.
- Texto segmentado por grupos de sentido, palabras pulsables o identificables y leyenda de reconocimiento.
- Grabación, timer, reinicio, reproducción del estudiante y transcripción en vivo o después del análisis.
- Resultados con exactitud, completitud y ritmo; feedback concreto y no punitivo.
- Panel de foco fonético y guía de escucha para docente.
- Desafío final que une los cuatro grupos en una producción conectada.

La implementación actual usa `assets/js/english-intermediate2-pronunciation-unit<n>.js`, una API de evaluación y `localStorage` con clave versionada. Si hay entrega, debe ir a `/api/intermediate2/unit<n>-pronunciation/submit`; el servidor valida actividad, versión y texto de referencia. La política presente es un seguimiento de peso 0 y no afecta el promedio salvo decisión explícita de evaluación oficial. No cambiar la referencia de texto sin actualizar la constante y las pruebas del servidor.

### 7.6 Listening

Usar `listening-unit-2-the-call-before-midnight.html` como referencia completa.

La referencia publicada de Unidad 3 es `listening-unit-3-the-message-before-the-workshop.html`: diálogo profesional de dos voces, tres escuchas, diez preguntas, transcript cerrado inicialmente, noticing de lengua, producción oral privada y final abierto hacia un reading breve. Su imagen es exclusiva, su tarjeta usa `cardSummary` y el audio/guion viven en `audio/unit-3/`. Esta actividad no se entrega ni afecta Grades; no añadir envío docente sin una decisión pedagógica explícita.

El reading que continúa esa historia es `reading-unit-3-the-session-that-stayed-open.html`. Para mantenerlo breve usa unas 410 palabras divididas en tres secciones, seis apoyos de vocabulario cerrados, cuatro observaciones de lengua y ocho preguntas de evidencia. Debe enlazar en ambos sentidos con el listening, usar una imagen distinta y conservar una tarjeta compacta. Su comprobación es local: no se entrega ni afecta Grades.

1. Hero: situación, nivel de escucha, número de preguntas, voces y QR.
2. Antes de escuchar: ruta, vocabulario preview y predicción.
3. Reproductor nativo `<audio>` con fuente local, instrucciones de primera/segunda/tercera escucha y velocidad accesible.
4. Preguntas de idea global, detalle, inferencia y vocabulario en contexto. Como estándar actual: 10 preguntas con tres opciones, feedback por pregunta y resultado legible por lector de pantalla.
5. Transcript disponible en el momento pedagógico correcto, no abierto antes de la primera escucha si se busca comprensión auditiva inicial.
6. Cierre, enlace a la continuación (reading, práctica o explicación) y entrega solo si fue solicitada.

Si la actividad se entrega al docente, la entrega confirma las diez respuestas y las rondas de escucha. La recepción de Unit 2 es de inbox docente, sin fila ni porcentaje en Grades (`teacherInboxOnly`, `gradebookProjected: false`, `affectsAverage: false`). Mantener esa diferencia visible para el estudiante.

### 7.7 Reading

Usar `reading-unit-2-the-six-week-window.html` como patrón. La página debe incluir:

1. Hero, objetivo y QR.
2. Ruta previa, vocabulario, predicción y propósito de lectura.
3. Texto en capítulos o segmentos cortos, navegación interna y pausas con preguntas de evidencia.
4. Bloque de _language detective_ para observar la lengua meta dentro del texto, no como lista desconectada.
5. Diez preguntas de comprensión, evidencia, inferencia y vocabulario; feedback escrito y reset.
6. Producción o entrega solo después de completar y revisar la comprensión.

Para una entrega equivalente, no crear una nota automática: usar el patrón de inbox y el endpoint de la actividad, con `activityId`, versión, idempotencia, recibo y estado accesible. Añadir funciones backend solo si el requisito incluye envío docente.

### 7.8 Speaking presencial, debate y juegos en vivo

Las páginas de speaking (`take-a-side`, `reality-or-imagine-roulette`, `better-choice-roundtable`, `secret-social-circle`) guían interacción de aula. Deben incluir:

- contexto seguro, lenguaje funcional y tarjetas/roles claros;
- turnos equilibrados y un resultado grupal verificable;
- frase banco, modelo breve y criterios de éxito;
- instrucciones de docente y de estudiante separadas cuando sea necesario;
- alternativa sin revelar datos personales ni registrar audio por defecto.

#### Patrón visual único para juegos, memory y ruletas

No crear un sistema visual aislado para cada juego. La referencia obligatoria del **hero** es `intermediate-2/index.html`; para consola y ruletas es `speaking-unit-2-reality-or-imagine-roulette.html`. La imagen temática de Unidad 3 se toma de `pronunciation-unit-3-sound-clear-tech-support.html`.

1. **Banner / hero:** replicar la arquitectura de `intermediate-2/index.html`: **una sola imagen profesional a ancho completo como fondo**, degradado azul oscuro de izquierda a derecha, contenido superpuesto y alineado abajo, kicker dorado en cápsula, título blanco con sombra, chips translúcidos y CTA rectangulares de 8 px. En páginas de actividad se usa una versión más pequeña (`min-height: min(520px, 58vh)`, título de hasta 17 caracteres de ancho y `font-size: clamp(2.05rem, 4vw, 3.65rem)`), conservando la imagen temática de la actividad. **Cada actividad debe tener su propia imagen identificable y la tarjeta de Practice Lab debe reutilizar esa misma imagen; no compartir un banner genérico entre memory, ruleta, listening, reading o pronunciación.** No volver al diseño dividido de bloque azul + imagen lateral y no usar collages o mosaicos.
2. **Memory / vocabulary game:** después del banner, dos tarjetas de orientación, marcador de equipos y tablero. El tablero usa seis columnas en escritorio y tres en móvil; las tarjetas mantienen proporción, foco visible, feedback textual, audio modelo y reinicio. En el patrón de Unidad 3, **las dos tarjetas reveladas de cada pareja muestran la fotografía del aparato y su nombre escrito**: la tarjeta visual enfatiza imagen + palabra y la tarjeta lingüística repite imagen + palabra y añade `used to + función`. Nunca dejar una cara fotográfica sin rótulo ni sustituir media baraja por cajas blancas de texto. Las 12 imágenes del conjunto deben existir, cargar y tener correspondencia exacta con datos y audios. El resultado de un match solicita producción oral antes del punto.
3. **Ruleta:** presentar primero el flujo y la configuración; después, dos `wheel cards` idénticas en una fila en escritorio y una columna en tableta/móvil. Cada una incluye número, título, explicación breve, contador, puntero externo, rueda de máximo 360 px, botón, resultado legible y estado accesible. La rueda no ocupa todo el ancho de la tarjeta ni se agranda con pantallas grandes.
4. **Datos y cierre:** el roster se mantiene solo en el dispositivo, no se califican los juegos por defecto y cada turno se registra únicamente en la tabla local de la sesión. La selección manual, la ayuda docente y el historial empiezan cerrados o sin revelar datos.
5. **Móvil:** a 650 px el hero mantiene la imagen como fondo, cambia a degradado vertical, usa `min-height: auto`, padding de 30 × 18 px, chips y CTA en dos columnas y título de máximo 3 rem. Los controles del cuerpo sí ocupan una columna. A 390 px la rueda se limita a 288 px; no debe aparecer scroll horizontal ni texto cortado.

#### Patrón pedagógico obligatorio: `What Is It For?` (Unidad 3)

Esta ruleta es una práctica de producción oral, no una ficha que entregue la respuesta. Su secuencia no se puede simplificar ni añadir un tercer objetivo:

1. El docente pulsa **Load Intermediate 2 names**. El botón usa la misma sesión protegida y `GET /api/intermediate2/grades` de la ruleta de Unidad 2; únicamente una cuenta con rol `teacher` o `admin` puede cargar **todos** los registros de `students[].fullName` de Intermedio 2. Se eliminan duplicados, se muestran en el cuadro y se conservan solo en memoria local de la página. No se muestran notas, correos, IDs ni datos adicionales. Como contingencia se permiten nombres pegados manualmente.
2. La primera ruleta selecciona un estudiante. La segunda selecciona un aparato de los 12 disponibles.
3. Al seleccionar el aparato, la pantalla revela exclusivamente su fotografía. No debe mostrar nombre, función, descripción, modelo, pista, instrucción, transcript ni audio-modelo: esos elementos convertirían la actividad en una respuesta guiada en vez de una intervención oral.
4. El alumno responde en este orden: **(a)** nombra el aparato: *“This is a/an ___.”*; **(b)** explica la función: *“It is used to ___.”* El docente escucha, pide una corrección breve o apoyo de la clase después de la respuesta y termina la ronda.
5. El selector manual presenta las 12 fotografías numeradas, sin rótulos ni `alt` que delaten la respuesta; permite repetir o escoger una imagen, pero mantiene exactamente las mismas dos intervenciones. El historial local conserva el estudiante y una miniatura, no el nombre/solución del aparato.

La interfaz debe explicar esta dinámica en tres lugares: flujo docente, tarjeta de tarea del estudiante y panel de imagen seleccionada. La rueda y el selector manual nunca sustituyen la producción del alumno con texto de respuesta. Los audios de palabra/modelo pertenecen al juego de memoria previo, donde se adquiere y practica el vocabulario; no se reproducen en esta ruleta.

La nueva actividad debe reutilizar las clases y tokens existentes o extender el CSS de su familia; no duplicar colores, sombras, radios y breakpoints con valores distintos. Antes de aceptar una página, comparar captura de escritorio y 390 px con la actividad de referencia y añadir una prueba estática que cubra retícula, banner, QR y controles.

Un QR de sala en vivo se diferencia del QR de página: muestra cómo unirse, enlace directo y copia de enlace, y se genera a partir del estado de la sala. Mantener ese QR dentro del componente de sala; no sustituye el QR estándar de acceso a página.

### 7.9 Evaluaciones, notas y productos

Separar siempre:

- **Práctica formativa:** reiniciable, privada o solo en pantalla.
- **Reporte / inbox docente:** registra recepción, sin porcentaje ni promedio, salvo indicación contraria.
- **Mock:** preparación, no evaluación oficial.
- **Evaluación oficial:** activación docente, autenticación, estado protegido, rúbrica y lógica de calificación explícita.

`evaluations.html` distingue mock y evaluación. `notas.html` y `/api/intermediate2/grades` son la fuente del libro de notas. Nunca conectar un botón "Send to teacher" al gradebook por inferencia.

## 8. Accesibilidad, privacidad y seguridad

- Todo `img` tiene `alt` útil; los elementos decorativos se marcan apropiadamente.
- Todo control tiene texto o `aria-label`, foco visible y feedback mediante `aria-live` cuando cambia el resultado.
- Usar botones para acciones y enlaces para navegación; no usar un `div` clickable.
- Reproductores conservan `<audio controls>` cuando el usuario necesita los controles nativos; controles personalizados complementan, no bloquean, el acceso.
- Los videos y audios tienen transcript, instrucciones y preguntas visibles.
- La información correcta/incorrecta se comunica con texto e iconos, no solo por verde/rojo.
- Pedir micrófono solo al iniciar una grabación o el preflight, explicar su uso y ofrecer reintento/continuar sin transcript.
- Audio de práctica y transcript temporal no se guardan. Las entregas persistentes requieren autenticación y una política escrita en la página.
- No incluir claves, IDs privados o contenido de `elevenlabs.local.env` en HTML, JS público, Markdown o consola.

## 9. Catálogo, back-end y archivos de actividad

Cuando una actividad debe aparecer en Practice Lab o Listening Library, añadir o actualizar su ítem de forma coherente en `assets/data/english-intermediate-2-content.json`: `id`, `unit`, `order`, `type`, título, descripción, imagen, URL, keywords, estado de entrega y atributos de nota.

Crear un endpoint en `server/progress_api.py` solo para una necesidad real de persistencia. Debe validar perfil, identificador de actividad, versión, payload, idempotencia y autorización; entregar un recibo y limitar la información que puede ver cada rol. Mantener audio de entrega dentro de `INTERMEDIATE2_PRONUNCIATION_AUDIO_DIR` y rutas de datos configurables por entorno.

Para cualquier nueva entrega, crear una prueba de servidor y una prueba de interfaz. La página debe explicar si es inbox, peso 0 o evaluación; el backend debe reflejar exactamente esa política.

## 10. Control de calidad antes de publicar

### Checklist de contenido y navegación

- [ ] El tema, resultado y tarea coinciden con la guía pedagógica y la sesión de la unidad.
- [ ] La ruta está enlazada desde la explicación, Practice Lab, Listening Library u Overview cuando corresponda.
- [ ] Título, `h1`, nombre de archivo, slug de imagen, audio y catálogo usan la misma unidad y tema.
- [ ] No hay enlaces, `src`, IDs, anclas ni assets rotos; todos los IDs son únicos.
- [ ] La actividad tiene un siguiente paso y no deja al estudiante en una pantalla sin salida.

### Checklist de visual y responsive

- [ ] Hero, QR y CTA no se superponen en 320, 390, 768, 1024 y escritorio.
- [ ] Sin scroll horizontal, texto cortado, botones pequeños ni imágenes que oculten la información esencial.
- [ ] En 320 y 390 px, las etiquetas de botones, el estado de grabación y el dock flotante se envuelven o redistribuyen sin salirse de la pantalla.
- [ ] Ningún `<details>` relevante se entrega abierto por defecto; cada unidad, actividad y ayuda se abre manualmente.
- [ ] Cards, grids y tablas se apilan o se adaptan correctamente.
- [ ] El QR existe, carga, se amplía al clic y abre la URL pública correcta al escanear.
- [ ] Contraste, `alt`, teclado, foco y mensajes de estado son verificables.

### Checklist de audio, grabación y entrega

- [ ] Guion, MP3, transcript y preguntas corresponden entre sí; cada prompt oral contiene solo una pregunta o petición.
- [ ] Las voces de diálogo son distinguibles y no pronuncian etiquetas de speaker.
- [ ] No aparece la marca del proveedor de audio ante el estudiante.
- [ ] Velocidad, reinicio, error de micrófono y alternativa sin transcripción son utilizables.
- [ ] Una entrega solo escribe datos si su política lo autoriza; inbox y gradebook permanecen separados.

### Pruebas existentes que se deben ampliar o ejecutar

Ejecutar las pruebas de la familia pertinente y crear una del mismo estilo para toda actividad nueva. Referencias actuales:

```powershell
node tools/test_intermediate2_full_width_layout.mjs
node tools/test_intermediate2_no_provider_branding.mjs
python tools/test_intermediate2_unit2_listening.py
python tools/test_intermediate2_unit2_reading.py
node tools/test_intermediate2_unit2_pronunciation_page.mjs
python tools/test_intermediate2_unit2_pronunciation_delivery.py
node tools/test_intermediate2_unit2_renata_coach_page.mjs
```

Usar el runtime empaquetado de la aplicación cuando se ejecuten pruebas de Node o Python. Las pruebas estáticas deben comprobar estructura HTML, assets, número de preguntas, QR, clases responsive, catálogo y política de entrega. Las pruebas de navegador o manuales deben comprobar interacción real, móvil y escaneo del QR.

### Publicación y despliegue

Cada actividad publicada tiene dos rutas que deben quedar completas: la **ruta de aprendizaje** (la tarjeta visible en Practice Lab y sus enlaces internos) y la **ruta pública** (los archivos presentes en producción, indexados y comprobados). No basta con crear el HTML local.

1. Añadir HTML, CSS/JS, imágenes, audio, guion y QR; registrar el ítem con `status: "published"` en `assets/data/english-intermediate-2-content.json` y confirmar que el filtro de Practice Lab reconoce su `type`.
2. Mantener el `<details>` de la unidad cerrado, pero actualizar su contador, la ruta recomendada y el fallback estático de `practice-lab.html`. Abrir la carpeta manualmente para comprobar que la tarjeta se renderiza.
3. Añadir cada nueva página pública al `sitemap.xml` con URL canónica `https://www.jaralingua.com/ingles/intermediate-2/<archivo>.html`, fecha `lastmod`, frecuencia y prioridad. Los assets no van al sitemap.
4. Ejecutar la prueba específica de la actividad, las pruebas transversales pertinentes y `git diff --check`. Antes de publicar, verificar por navegador la tarjeta, el juego o actividad y el QR ampliado.
5. Hacer un commit atómico en `main` y enviar el commit a `origin/main`. El procedimiento versionado es `scripts/post-commit-sync.ps1`: primero sincroniza GitHub y, si el entorno local tiene `VPS_SSH_TARGET` y `VPS_APP_DIR`, hace `git fetch` y `git reset --hard origin/main` en el clon del VPS, seguido del comando de recarga configurado.
6. La activación automática requiere `.githooks/post-commit`, `core.hooksPath=.githooks` y un `deploy.local.env` local (ignorado por Git). Nunca escribir claves, hostnames privados ni secretos en esta guía o en el repositorio. Si falta cualquiera de esos elementos, el commit puede llegar a GitHub pero **no** se debe afirmar que llegó al VPS: ejecutar el procedimiento aprobado desde una máquina configurada o usar la integración de despliegue del proveedor.
7. Tras el despliegue, abrir la URL pública de Practice Lab y las URLs de las actividades nuevas. Confirmar que el contador de la unidad, la secuencia y las tarjetas son actuales, que HTML, imágenes, QR y audio devuelven respuesta correcta y que el QR abre la URL canónica. Si una versión anterior sigue visible, hacer recarga forzada y revisar la caché del CDN antes de cambiar código.

### Mapa de producción validado

El despliegue estático vigente, comprobado para las demás áreas y validado el 1 de septiembre de 2026, usa el clon de producción en `/var/www/jaralingua.com`. El destino SSH se expresa como `root@jaralingua.com`; la clave local autorizada se encuentra en el perfil SSH del equipo. Para el contenido estático de Inglés no hace falta reiniciar Nginx: el `git reset --hard origin/main` actualiza los archivos servidos.

La configuración local esperada —sin copiar ninguna clave al repositorio— es:

```env
AUTO_DEPLOY_BRANCH=main
AUTO_DEPLOY_REMOTE=origin
VPS_SSH_TARGET=root@jaralingua.com
VPS_APP_DIR=/var/www/jaralingua.com
VPS_SSH_KEY=C:\Users\USER\.ssh\id_ed25519
VPS_GIT_REMOTE=origin
```

El detalle operativo y la plantilla segura viven en [auto-deploy.md](auto-deploy.md). Para las actividades de **Technology Functions** de Unidad 3, la lista de publicación comprende las dos páginas, sus 12 imágenes, 24 clips de audio, los dos QR, el catálogo, Practice Lab y sus dos entradas de sitemap.

## 11. Decisiones pendientes antes de ampliar el curso

1. Confirmar si la siguiente entrega será **Unidad 4 completa** o si se cerrarán primero los componentes pendientes de Unidad 3.
2. Crear una guía pedagógica descargable para Básico 2 si se necesita equivalencia documental con Intermedio 2; hoy su guía vive solo en `course-overview.html`.
3. Definir para cada nueva actividad si será práctica, inbox docente, peso 0 u oficial **antes** de implementar API o gradebook.
4. Confirmar fechas del calendario solo cuando provengan de la planificación vigente; no duplicar fechas históricas en actividades nuevas.

---

## Anexo A. Patrón mínimo de una actividad nueva

1. Elegir la sesión y el resultado de aprendizaje de la guía.
2. Redactar el modelo, la lengua meta, el guion/audio o texto y la tarea final.
3. Crear imagen, HTML, CSS/JS solo si el patrón compartido no basta, audio y QR con el mismo slug.
4. Añadir navegación, catálogo y estado de disponibilidad.
5. Adaptar en tableta y celular antes de pulir el escritorio.
6. Ejecutar las pruebas, revisar accesibilidad, escanear QR y validar manualmente la interacción.
7. Publicar solo cuando contenido, media, enlaces, entrega y política de datos estén alineados.
