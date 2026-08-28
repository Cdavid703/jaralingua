# Guía de diseño de páginas — Inglés Intermedio 1

Fecha de levantamiento: 2026-08-28.

Esta guía describe cómo están construidas las páginas completas de
`ingles/intermediate/` en JaraLingua. Su propósito es que una página nueva de
Inglés Intermedio 2 mantenga el mismo lenguaje visual y de navegación antes de
que se diseñe su contenido específico.

No describe un solo coach. El inventario incluyó la portada del curso, Course
Overview, Practice Lab, páginas de unidad, lectura, escucha, pronunciación,
actividades, evaluaciones y los coaches de conversación de Intermedio 1.

## 1. Fuentes de verdad y orden de estilos

| Capa | Archivo | Qué controla |
| --- | --- | --- |
| Base global | `assets/css/style.css` | Reset, tipografía, cabecera, navegación, botones, heroes, dashboards, tarjetas, formularios y footer. |
| Tema de Intermedio 1 | `assets/css/english-intermediate.css` | Tokens del nivel, contenedores, bandas, tarjetas y ajustes de la portada/recursos del curso. |
| Variantes por actividad | `assets/css/intermediate-*.css` | Actividades con narrativa o interacción propia: lectura de Unidad 6, laboratorio, decisión, presentación, etc. |
| Pronunciación | `assets/css/english-intermediate-pronunciation.css` | Interfaz de secciones, reproductores y práctica de pronunciación. |
| Coach de conversación | `assets/css/conversation-coach-v2.css` y sus extensiones | Hero de escena, paneles, estados de conversación, grabador, dock y responsive. |

Regla de implementación: una página normal carga `style.css` y
`english-intermediate.css`. Solo después carga una hoja específica cuando la
actividad realmente la necesita. No se crea una paleta o un layout paralelo
para una sola página.

## 2. Paleta, tipografía y geometría

### Tokens globales del sitio

Definidos en `assets/css/style.css`.

| Uso | Token | Valor |
| --- | --- | --- |
| Azul de acción/enlaces | `--blue` | `#123b8f` |
| Azul marino de títulos, navegación y footer | `--blue-dark` | `#071f4f` |
| Rojo/coral de acción primaria | `--red` | `#d7193f` |
| Fondo claro | `--light` | `#f4f7fb` |
| Texto auxiliar | `--gray` | `#64748b` |
| Texto principal | `--dark` | `#0f172a` |
| Sombra estándar | `--shadow` | `0 20px 50px rgba(15,23,42,.16)` |
| Radio editorial grande | `--radius` | `28px` |

### Tokens propios de Intermedio 1

Definidos en `assets/css/english-intermediate.css`.

| Papel visual | Valor |
| --- | --- |
| Tinta/navy | `#182235` / `#071f4f` |
| Azul de acento | `#2454a6` |
| Teal pedagógico | `#0f766e` |
| Coral de énfasis | `#d9433f` |
| Oro | `#d9a441` |
| Verde de logro | `#1f8264` |
| Fondos suaves | `#eaf1ff`, `#e8f6f3`, `#fff6dd`, `#fff0ee` |
| Borde | `rgba(7,31,79,.12)` |
| Sombra Intermedio | `0 18px 42px rgba(7,31,79,.12)` |

La familia base es Arial/Helvetica. Cuando una página avanzada incorpora
`assets/vendor/fonts/jaralingua-fonts.css`, lo hace junto con el patrón ya
existente (por ejemplo, los coaches y evaluaciones), no como sustitución de la
tipografía del curso.

### Medidas repetidas

- Ancho editorial base: `1180px`.
- Gutter general: `24px` en escritorio; `18px` en móvil para los heroes base.
- Border radius de tarjetas de curso/hero: `24–32px`.
- Tarjetas de componentes de Intermedio: `8px` o `14px` según su función.
- Botones: altura mínima de `52px`, forma de píldora (`999px`) en el sistema
  base; una variante contextual puede usar radios menores dentro de un panel.

## 3. Esqueleto obligatorio de una página del curso

El orden base en las páginas de `ingles/intermediate/` es:

```text
body.english-intermediate-page (más una clase del tipo de página)
├── global-course-switcher fijo
├── site-header fijo
│   └── navbar: logo + enlaces del curso
├── main
│   ├── hero o banner de la página
│   ├── navegación rápida / buscador (solo hubs)
│   ├── introducción o franja contextual
│   └── contenido de la actividad
└── site-footer navy
```

La cabecera es fija, semitransparente y con `backdrop-filter`; por ello el hero
superior reserva espacio vertical amplio (`140px` en escritorio) antes del
contenido. El selector global de cursos es un control separado, fijo en la
esquina superior derecha. No debe sustituirse por una barra inventada dentro de
una actividad.

El footer usa fondo `--blue-dark`, texto blanco y padding de `30px 24px`.

## 4. El banner/hero no es un bloque genérico

Hay tres familias visuales principales. La elección depende del tipo de página.

### A. Hero de curso o de hub: `basic-course-hero`

Usado por `ingles/intermediate/index.html`.

- Dos columnas: imagen editorial y bloque de texto blanco; el orden puede
  variar por página, pero ambos son elementos con el mismo peso visual.
- La imagen vive en `.basic-hero-image`: radio `32px`, mínimo `360px`, sombra y
  dos overlays sutiles navy/coral.
- El texto vive en `.basic-hero-content`: papel casi blanco, radio `32px`,
  padding `42px`, borde tenue y sombra.
- Tiene eyebrow, H1 grande en navy, descripción, acciones y no es un banner
  plano de ancho completo sin composición.
- En el dashboard se continúa con navegación rápida, buscador e introducción,
  después de la composición hero.

### B. Hero de una lección: `lesson-hero`

Usado por Practice Lab, lecturas y numerosas actividades.

- Repite la composición de dos columnas, pero está orientado a una actividad:
  `lesson-hero-content` + `lesson-hero-image`.
- El bloque de texto usa eyebrow, título, descripción, `lesson-meta` con
  etiquetas y `hero-actions`.
- La imagen no decora solamente: debe ser un banner específico de la historia,
  tema o actividad y tiene overlay navy/coral para integrarla al sistema.
- El hero se usa como punto de entrada de la página completa, no como avatar
  pequeño dentro de una tarjeta.

### C. Hero contextual de una experiencia compleja

Usado por `final-oral-partner-coach.html` y los coaches de Unidades 5 y 6.

- `coach-hero` ocupa la franja editorial principal con copy, metadatos, acciones
  y una escena amplia a la derecha (`coach-hero-visual`).
- La escena presenta a los personajes dentro del contexto comunicativo. El
  retrato del personaje se reserva para los paneles posteriores.
- Después del hero hay una franja de resultados/contexto (`coach-outcomes`) y
  luego el shell funcional de la experiencia. Esta secuencia es parte del
  diseño, no un adorno opcional.

## 5. Componentes que construyen el cuerpo de la página

### Hubs: dashboard, accesos y búsqueda

Portada, Course Overview y Practice Lab usan estos componentes antes del
contenido profundo.

- `quick-access-panel`: menú corto con `details/summary`; su lista usa números
  y enlaces con jerarquía clara.
- `course-search-panel`: solo en hubs. Nunca se inserta por defecto en una
  actividad individual.
- `basic-intro-section > section-heading`: eyebrow, H2 y texto introductorio.
- `course-dashboard` o `unit-folder-grid`: tarjetas con imagen, número de
  sección, título, descripción y CTA.
- `practice-unit-folder`: acordeón por unidad. La apertura/cierre es una
  transición de navegación; conserva el título, contador y tarjetas internas.

### Lecciones y explicaciones

Las páginas de unidad no se reducen a una columna de texto. Combinan paneles
con propósito específico:

- `premium-lesson-container` como ancho de contenido organizado.
- `premium-topic-card` con cabecera numerada (`topic-number`, `topic-label`).
- Rejillas como `focus-grid`, `unit4-grid`, `unit4-two-col` o equivalentes para
  separar concepto, ejemplo, imagen y contraste.
- `details` temáticos con `summary` y un icono de expansión para que la unidad
  se navegue por bloques, no como una pared de contenido.
- Fórmulas, ejemplos, comparaciones, cajas de error/corrección y tiras de audio
  aparecen dentro de tarjetas semánticas, no en una lista de controles sueltos.

### Lectura, escucha y práctica

- La lectura combina hero, una tarjeta de prelectura, tarjeta del texto,
  anotaciones de lenguaje, verificación y un bloque de siguiente paso.
- La escucha añade el reproductor y el flujo de preguntas dentro del mismo
  contenedor visual de la lección.
- Pronunciación usa su CSS específico porque incorpora interacción fonética; aun
  así, conserva header, hero, tema, navegación y footer del curso.
- Los juegos/laboratorios pueden tener una hoja especializada, pero mantienen
  la jerarquía `hero → contexto/reglas → actividad → siguiente paso`.

### Experiencias con paneles

Los coaches y evaluaciones complejas añaden, después del hero:

- shell de dos columnas en escritorio (`coach-shell > coach-layout`);
- panel principal de la tarea y panel lateral con formato, rúbrica o lenguaje;
- bienvenida con retrato, presentación y audio del personaje;
- etapa activa, soporte plegable, grabador, reacción y navegación;
- dock flotante complementario, no sustituto del grabador del panel;
- reporte/resultado final solo si el tipo de actividad lo requiere.

## 6. Tarjetas, bordes, sombras y movimiento

El diseño original no utiliza bloques rectangulares arbitrarios ni grandes
zonas vacías. El ritmo viene de bloques con función.

- Fondo principal: `#f4f7fb`; superficies de lectura/actividad: blanco.
- Bordes: navy muy transparente; no negro sólido.
- Sombra: profunda pero suave, siempre azul/gris, nunca una sombra negra dura.
- Los badges y etiquetas usan píldoras de fondos suaves azul, teal, oro o coral.
- CTA principal: rojo/coral; CTA secundario: blanco con texto navy y borde tenue.
- Hover de botones: elevación ligera (`translateY(-3px)`) y sombra mayor.
- Los “giros” o cambios visuales provienen de transiciones con significado:
  apertura de acordeones, cambio de tarjeta de actividad, progreso de etapas,
  estado del avatar y aparición del dock. No se añade animación decorativa sin
  una acción o cambio de estado asociado.

## 7. Responsive: adaptar, no reemplazar la página

La misma página conserva su identidad en móvil.

| Rango | Comportamiento existente |
| --- | --- |
| Hasta `920px` | Los heroes base y dashboards pasan de dos columnas a una; sigue existiendo imagen y panel de texto. |
| Hasta `720px` | Los coaches apilan escena, panel principal y sidebar; la bienvenida y la etapa dejan de ser columnas. |
| Hasta `560px` | Los heroes base reducen gutters a `18px`, botones pueden apilarse y los acordeones/tarjetas reducen padding. |
| Hasta `470px` | Los paneles complejos reducen padding y el dock flotante conserva controles esenciales. |

La simplificación móvil se hace ocultando o cerrando soporte secundario, no
eliminando el banner, la escena, el personaje o la jerarquía de la página.

## 8. Cómo elegir la plantilla correcta antes de crear una página

| Necesidad | Plantilla que se debe tomar como referencia |
| --- | --- |
| Nueva portada, biblioteca o índice | `index.html`, `course-overview.html`, `practice-lab.html`. |
| Nueva explicación de unidad | `unit-4-family-problems-memories.html` o `unit-6-future-plans-advice.html`. |
| Lectura o escucha guiada | `reading-unit-4-the-memory-box.html` y las páginas de listening de Unidades 4–6. |
| Práctica o laboratorio | `practice-lab.html` y la actividad más cercana del mismo tipo. |
| Pronunciación | `pronunciation-unit-*.html` con `english-intermediate-pronunciation.css`. |
| Conversación o simulación oral | `final-oral-partner-coach.html` como referencia de página completa; el coach de unidades 5/6 como referencia de flujo contextual. |
| Evaluación oficial | `final-writing-task.html` o `final-oral-partner-coach.html`, según formato. |

## 9. Lista de control antes de implementar una página nueva

1. Clasificar la página en una de las plantillas anteriores.
2. Identificar la imagen hero panorámica y, si hay personaje, su retrato
   separado; no reutilizar una foto temática como sustituto de ambos.
3. Cargar las hojas base en este orden: `style.css`, `english-intermediate.css`,
   después la hoja específica mínima necesaria.
4. Conservar switcher, header fijo, navegación coherente, hero, cuerpo con
   componentes del tipo de página y footer.
5. Usar la paleta/tokens existentes y reservar el coral para la acción primaria.
6. Diseñar escritorio y móvil como una sola página adaptable desde el inicio.
7. Si hay interacción, elegir primero una actividad existente del mismo tipo y
   reutilizar su estructura, IDs, estados y motor cuando aplique.
8. Validar visualmente la página completa —hero, transiciones, contenido y
   footer— antes de desplegar; no aprobar solo una tarjeta o un componente.

## 10. Aplicación pendiente al Midterm Oral de Intermedio 2

Esta guía debe aplicarse antes de tocar otra vez el coach oral. La siguiente
iteración debe comenzar comparando el mock con la plantilla de página completa
de `final-oral-partner-coach.html`, pero manteniendo la condición funcional de
Intermedio 2: práctica privada sin nota, sin envío al docente y sin alterar las
Unidades 1 y 2.
