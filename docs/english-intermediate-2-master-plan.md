# Plan maestro de diseño y producción — Intermediate English Course 2

## 1. Propósito del documento

Este documento es la guía maestra para diseñar, construir, revisar y publicar el nuevo nivel **Intermediate English Course 2** dentro de JaraLingua.

El objetivo no es crear una copia superficial de Intermediate English Course 1. El nuevo curso conservará su arquitectura pedagógica y sus mejores patrones de interacción, pero tendrá:

- contenido oficial propio basado en la guía de 64 horas;
- seis unidades nuevas;
- un Course Overview completo;
- un Practice Lab organizado por unidades;
- actividades de grammar, reading, listening, video listening, pronunciation, writing, speaking y Conversation Coach;
- una Listening Library sincronizada automáticamente con Practice Lab;
- cinco evaluaciones oficiales de 20%;
- simulacros y materiales de preparación;
- un gradebook privado e independiente;
- audios generados con ElevenLabs para listening, video listening, explicaciones, audiobooks, pronunciation support y cualquier botón de audio del curso;
- imágenes profesionales creadas específicamente para el tema de cada página;
- comportamiento responsivo para celular, tableta, portátil y computador de escritorio.

Este es un documento interno de planificación. Antes de construir cada actividad individual se deberá aprobar o completar su especificación particular.

---

## 2. Decisiones obligatorias de nombre y alcance

### 2.1 Nombre oficial

El nombre visible del curso será:

> **Intermediate English Course 2**

El número `2` forma parte del nombre oficial del curso cuando sea necesario identificarlo en el index de inglés, el título principal, el selector global de cursos, los metadatos y las rutas administrativas.

### 2.2 Los nombres de las secciones no llevan “2”

No se usarán nombres como `Course Overview 2`, `Practice Lab 2`, `Games 2` o `Listening Library 2`.

Las secciones serán exactamente:

1. Course Overview
2. Practice Lab
3. Games
4. Listening Library
5. Speak Like a Local
6. Phonetic Rules
7. Free English Learning Links
8. Intermediate English Grades
9. Evaluations and Mock Exams

### 2.3 Secciones que conservan el contenido de Intermediate English Course 1

Estas secciones mantendrán el mismo contenido pedagógico:

- Games.
- Speak Like a Local.
- Phonetic Rules.
- Free English Learning Links.

La implementación debe evitar dos copias que puedan quedar diferentes con el tiempo. Se utilizará contenido compartido o una fuente de datos común, aunque cada página pueda conservar la navegación y el contexto visual del curso actual.

### 2.4 Secciones nuevas o adaptadas para Course 2

Se diseñarán específicamente para Intermediate English Course 2:

- Course Overview.
- Practice Lab.
- Listening Library.
- Intermediate English Grades.
- Evaluations and Mock Exams.
- Las seis unidades y los espacios para integrar todas las actividades que defina y apruebe la docente.
- Los materiales de preparación, simulacros, evaluaciones oficiales y revisiones finales.

### 2.5 Restricción visual: sin blackboards

No se usarán tableros negros, fondos de tiza ni una estética de “blackboard” como recurso principal. La identidad visual utilizará:

- aulas modernas;
- salas de conversación;
- espacios universitarios;
- estudios de audio o video;
- interfaces editoriales;
- hogares y espacios públicos realistas;
- dispositivos, mapas, cronologías, paneles de decisión y recursos visuales asociados al tema.

---

## 3. Fuentes revisadas

### 3.1 Guía oficial

Fuente principal:

`C:\Users\USER\Documents\Web ITM\Intermediate course 1\Intermediate_Course 2.docx`

Datos confirmados:

- Nivel: Intermediate Course 2.
- Periodo: 2026.
- Intensidad: 64 horas.
- Duración de cada sesión regular: 3 horas.
- Total: 21.3 sesiones, distribuido en la guía hasta una sesión final parcial.
- Seis unidades.
- Cinco evaluaciones oficiales, cada una con un valor de 20%.
- Enfoque metodológico TBL: pre-task, task y post-task.
- Lectura de un libro asignado con actividades de comprensión creadas por el docente.

### 3.2 Implementación de referencia

Se revisaron las páginas reales de Intermediate English Course 1:

- `ingles/intermediate/index.html`
- `ingles/intermediate/course-overview.html`
- `ingles/intermediate/practice-lab.html`
- `ingles/intermediate/games.html`
- `ingles/intermediate/listening-library.html`
- `ingles/intermediate/idioms.html`
- `ingles/intermediate/english-learning-links.html`
- `ingles/intermediate/notas.html`
- `ingles/intermediate/evaluations.html`
- `assets/css/english-intermediate.css`
- infraestructura de notas y entregas en `server/progress_api.py`

También se revisó `ingles/index.html`, porque allí debe aparecer el nuevo curso.

### 3.3 Hallazgos que deben orientar Course 2

Lo que funciona y debe conservarse:

- Hero visual grande con una identidad clara del nivel.
- Course Overview con unidades desplegables.
- Practice Lab organizado en carpetas por unidad.
- Tarjetas con imagen, número, tipo de práctica, título, descripción y acción.
- Listening Library con audio completo y enlace al taller de preguntas.
- Navegación rápida, buscador y selector global de cursos.
- Actividades con producto final, envío al docente y nota de referencia.
- Evaluaciones oficiales separadas de la práctica.
- Autenticación con Google o Microsoft para notas privadas.

Problemas detectados que Course 2 no debe repetir:

- En Practice Lab existen contadores manuales que no coinciden: el hero anuncia 48 actividades, el acceso rápido muestra otra suma y una carpeta presenta un total diferente al número real de tarjetas.
- Parte del CSS vive dentro de páginas individuales y dificulta la reutilización.
- En celular, el documento no se desborda, pero la navegación superior depende de desplazamiento horizontal interno y no siempre comunica claramente que hay más opciones.
- Algunas secciones compartidas todavía muestran referencias textuales a Course 1.
- La Listening Library exige actualización manual y puede quedar incompleta respecto a Practice Lab.

Course 2 resolverá estos puntos con un catálogo central, componentes reutilizables y pruebas automáticas.

---

## 4. Arquitectura de información del nuevo curso

### 4.1 Integración en el index de inglés

`ingles/index.html` tendrá cuatro opciones claramente diferenciadas:

1. Basic English Course 1.
2. Basic English Course 2.
3. Intermediate English Course 1.
4. Intermediate English Course 2.

Cambios requeridos en el index:

- agregar una cuarta tarjeta;
- actualizar el hero para incluir el acceso al nuevo curso sin saturarlo;
- actualizar Quick Access;
- ampliar las palabras clave del buscador;
- actualizar el selector global de cursos;
- revisar la cuadrícula para que funcione en 4, 2 y 1 columnas según el ancho;
- crear una imagen profesional propia para la tarjeta de Course 2;
- evitar que la tarjeta de Course 2 reutilice una imagen de Course 1.

### 4.2 Ruta propuesta

La ruta principal será:

`ingles/intermediate-2/`

Archivos principales:

```text
ingles/intermediate-2/
├── index.html
├── course-overview.html
├── practice-lab.html
├── games.html
├── listening-library.html
├── idioms.html
├── english-learning-links.html
├── notas.html
├── evaluations.html
├── session-calendar.html
├── portfolio.html
├── unit-1-relationships.html
├── unit-2-wishes-dilemmas-advice.html
├── unit-3-technology-and-identity.html
├── unit-4-movies-music-and-reviews.html
├── unit-5-impressions-feelings-and-satire.html
├── unit-6-news-and-natural-disasters.html
├── review-units-1-2.html
├── review-unit-3.html
├── review-unit-4.html
├── review-unit-5.html
├── final-review.html
└── documents/
    ├── Intermediate-English-Course-2-Easy-Guide.pdf
    ├── Intermediate-English-Course-2-Easy-Guide.docx
    └── Intermediate-English-Course-2-Schedule.ics
```

Las actividades tendrán nombres predecibles:

```text
practice-unit-N-...
reading-unit-N-...
listening-unit-N-...
video-listening-unit-N-...
pronunciation-unit-N-...
conversation-coach-unit-N-...
workshop-unit-N-...
evaluation-...
mock-...
```

### 4.3 Recursos propuestos

```text
assets/
├── css/
│   ├── english-intermediate.css
│   └── english-intermediate-2.css
├── img/
│   └── english-intermediate-2/
│       ├── course/
│       ├── unit-1/
│       ├── unit-2/
│       ├── unit-3/
│       ├── unit-4/
│       ├── unit-5/
│       ├── unit-6/
│       └── evaluations/
├── js/
│   ├── english-intermediate-2-catalog.js
│   ├── english-intermediate-2-practice-lab.js
│   ├── english-intermediate-2-listening-library.js
│   └── intermediate-2-english-grades.js
└── data/
    └── english-intermediate-2-content.json
```

Audio y video:

```text
ingles/intermediate-2/
├── audio/
│   ├── unit-1/
│   ├── unit-2/
│   ├── unit-3/
│   ├── unit-4/
│   ├── unit-5/
│   ├── unit-6/
│   └── evaluations/
└── video/
    ├── unit-1/
    ├── unit-2/
    ├── unit-3/
    ├── unit-4/
    ├── unit-5/
    └── unit-6/
```

---

## 5. Diseño de la página principal

### 5.1 Hero

El hero debe mantener la calidad y madurez visual de Intermediate English Course 1, pero con una identidad propia.

Contenido:

- Eyebrow: `English Learning Path`.
- H1: `Intermediate English Course 2`.
- Introducción breve orientada a relaciones, decisiones, tecnología, medios, impresiones y noticias.
- Acción primaria: `Explore the course`.
- Acción secundaria: `Back to English`.
- Imagen profesional propia que represente los seis dominios del curso sin texto incrustado.

La imagen no debe ser una colección confusa de miniaturas. Debe mostrar una escena universitaria moderna con recursos visuales secundarios que sugieran:

- relaciones y conversación;
- deseos y decisiones;
- tecnología y seguridad digital;
- cine y música;
- impresiones y noticias;
- periodismo y desastres naturales.

### 5.2 Navegación rápida

La sección `Intermediate menu` mostrará las nueve áreas oficiales, con numeración del 01 al 09.

En celular:

- se presentará como un `details/summary` accesible;
- la acción completa tendrá al menos 44 px de alto;
- el texto no se cortará;
- no dependerá de hover;
- el foco será visible.

### 5.3 Buscador

El buscador localizará:

- secciones;
- unidades;
- temas;
- destrezas;
- nombres de actividades;
- evaluaciones;
- palabras clave en inglés y español cuando ayuden a los estudiantes.

Ejemplos:

- `relationships`
- `dating`
- `wishes`
- `dilemmas`
- `technology`
- `identity theft`
- `movies`
- `music`
- `feelings`
- `satire`
- `natural disasters`
- `pronunciation`
- `grades`

### 5.4 Dashboard de secciones

Cada tarjeta tendrá:

- imagen profesional específica;
- número de sección;
- título sin el sufijo `2`;
- descripción corta;
- estado cuando sea necesario: `Available`, `In production` o `Teacher controlled`;
- botón o enlace con verbo claro.

No se publicarán tarjetas vacías. Si una sección aún está en producción, su página debe explicar con precisión qué está disponible y no simular contenido inexistente.

---

## 6. Sistema visual

### 6.1 Identidad

Course 2 debe sentirse como la continuación natural de Intermediate English Course 1:

- maduro;
- claro;
- práctico;
- universitario;
- comunicativo;
- visualmente profesional;
- menos infantil que Basic English;
- sin verse corporativo o frío.

### 6.2 Paleta

Se conservarán los tokens de Intermediate English:

- Navy `#071f4f`: navegación, títulos, evaluaciones.
- Blue `#2454a6`: enlaces, etiquetas de unidad, progreso.
- Teal `#0f766e`: comunicación, logro, feedback positivo.
- Coral `#d9433f`: pronunciación, alertas, contrastes.
- Gold `#d9a441`: cultura, reflexión, escritura, consejos.
- Soft `#f4f7fb`: fondo.
- Paper `#ffffff`: tarjetas y paneles.

Course 2 podrá usar un acento violeta azulado moderado para diferenciarse de Course 1:

- Course 2 accent: `#5b4bc4`.
- Course 2 soft accent: `#efedff`.

El acento adicional no reemplaza la paleta base y nunca se usará como único indicador de estado.

### 6.3 Tipografía

- Mantener la familia tipográfica global de JaraLingua.
- H1 con `clamp()` y máximo aproximado de 4.5 rem.
- H2 directo y corto.
- H3 de tarjetas entre 1.15 y 1.45 rem.
- Texto base mínimo de 1 rem en interfaces principales.
- Interlineado entre 1.55 y 1.8 para lectura.
- No usar texto menor de 0.85 rem salvo metadatos secundarios.

### 6.4 Tarjetas

- Radio recomendado: 8 px para tarjetas repetitivas.
- Radio de 20–28 px reservado para heroes y paneles principales.
- Sombra moderada.
- Borde visible en fondos blancos.
- Imagen con relación uniforme.
- El botón principal siempre visible.
- Altura flexible: nunca fijar alturas que corten texto traducido o ampliado.

### 6.5 Estados

Cada estado combinará color, icono y texto:

- Available.
- New.
- Practice.
- Listening.
- Video Listening.
- Reading.
- Pronunciation.
- Conversation Coach.
- Mock Exam.
- Official Assessment.
- Submitted.
- Teacher Reviewed.

---

## 7. Plan de imágenes profesionales

### 7.1 Regla general

Cada página principal y cada actividad tendrá una imagen relacionada directamente con el tema. No se aprobarán imágenes genéricas de personas sonriendo sin relación pedagógica.

Las imágenes se crearán durante la producción con una herramienta de generación de imágenes y se revisarán antes de integrarlas.

### 7.2 Especificaciones

- Formato preferido: WebP.
- Hero principal: 1600 × 900 o superior, relación 16:9.
- Tarjetas: 1200 × 800, relación 3:2.
- Retratos de Conversation Coach: 1024 × 1280, relación 4:5.
- Posters de video: 1280 × 720.
- Evitar texto generado dentro de la imagen.
- Evitar logotipos no autorizados.
- Evitar manos o pantallas visualmente defectuosas.
- Comprimir sin pérdida visual evidente.
- Declarar `width` y `height`.
- Hero con carga prioritaria.
- Tarjetas debajo del primer viewport con `loading="lazy"`.
- Cada imagen tendrá alt text específico y funcional.

### 7.3 Dirección visual por unidad

| Unidad | Dirección visual | Escenarios recomendados | Evitar |
| --- | --- | --- | --- |
| Unit 1 | Relaciones, vecinos, amistad y citas | Cena, edificio residencial, café, encuentro social, cartas | Romance estereotipado o imágenes invasivas |
| Unit 2 | Deseos, decisiones, dilemas y consejo | Oficina universitaria, mural de metas, rutas de decisión, blog | Situaciones traumáticas o moralización |
| Unit 3 | Tecnología y seguridad digital | Help desk, laboratorio, dispositivos, panel de seguridad | Interfaces con datos personales reales |
| Unit 4 | Cine, series, música y tendencias | Sala de edición, club de crítica, línea de tiempo musical | Posters o celebridades protegidas |
| Unit 5 | Impresiones, emociones y sátira | Reunión social, redacción, comunidad, tarjetas de emociones | Caricaturas ofensivas o estereotipos |
| Unit 6 | Noticias y desastres naturales | Estudio de noticias, sala de emergencia, mapa meteorológico | Imágenes gráficas de víctimas |

---

## 8. Diseño responsivo

### 8.1 Dispositivos objetivo

La interfaz se verificará como mínimo en:

- 360 × 800.
- 390 × 844.
- 430 × 932.
- 768 × 1024.
- 1024 × 768.
- 1366 × 768.
- 1440 × 900.
- 1920 × 1080.

### 8.2 Breakpoints funcionales

| Ancho | Hero | Course Overview | Practice Lab | Dashboard |
| --- | --- | --- | --- | --- |
| Más de 1180 px | 2 columnas | 3 columnas | 3 columnas | 4 o 3 columnas |
| 901–1180 px | 2 columnas compactas | 3 columnas | 3 o 2 columnas | 3 columnas |
| 681–900 px | 1 columna | 2 columnas | 2 o 1 columnas | 2 columnas |
| 680 px o menos | 1 columna | 1 columna | 1 columna | 1 columna |

### 8.3 Reglas obligatorias

- No debe existir overflow horizontal del documento.
- La navegación móvil no debe ocultar opciones sin una señal clara. Se prefiere un menú desplegable a una fila horizontal parcialmente visible.
- Imágenes con `object-fit: cover` y recorte controlado.
- Botones táctiles de al menos 44 × 44 px.
- Separación mínima de 8 px entre acciones.
- Formularios y selects ocuparán el ancho disponible en celular.
- Tablas complejas se transformarán en tarjetas o usarán un contenedor accesible con scroll claramente señalado.
- Audios y videos ocuparán `width: 100%`.
- Las cuadrículas usarán `minmax(0, 1fr)` para impedir desbordamiento.
- Títulos y URLs usarán `overflow-wrap: anywhere` cuando sea necesario.
- Los heroes no fijarán alturas que corten contenido.
- Las carpetas `details` conservarán un resumen legible y una acción de apertura clara.

### 8.4 Resultado de la auditoría visual de Course 1

La referencia actual responde así:

- Course Overview: 3 columnas en escritorio, 2 en tableta y 1 en celular.
- Practice Lab: 3 columnas en escritorio y 1 columna en celular.
- El hero de Course Overview cambia de 2 columnas a 1 en tableta.
- No hay overflow horizontal del documento.
- En celular, la navegación principal posee un área interna más ancha que su contenedor.

Course 2 conservará la buena adaptación de cuadrículas y mejorará el menú móvil.

---

## 9. Course Overview

### 9.1 Estructura visual

La página conservará el modelo exitoso de Course 1:

1. Header y navegación.
2. Hero de dos columnas en escritorio.
3. Quick Access de unidades.
4. Buscador.
5. Introducción.
6. Dashboard de seis unidades desplegables.
7. Bloque de evaluaciones.
8. Bloque de revisión final.
9. Footer.

Cada unidad será un `details` con:

- imagen;
- etiqueta `Unit N`;
- título;
- resultado de aprendizaje;
- sesiones;
- grammar/functions;
- vocabulary;
- tipos de actividad disponibles;
- enlaces a recursos;
- evaluación relacionada, si aplica.

Los contadores se generarán desde el catálogo y no se escribirán manualmente.

### 9.1.1 Regla anti-redundancia para Course Overview y páginas de unidad

Las páginas de unidad deben enseñar contenido desde el primer bloque útil. No deben repetir varias veces la misma información visual o textual antes de llegar a la explicación.

Reglas obligatorias:

- Si el banner/hero ya muestra la imagen principal, el título de la unidad, el número de unidad y el contexto, no se debe repetir inmediatamente abajo otra tarjeta con la misma imagen, el mismo número de unidad y el mismo título.
- En celular, después del hero compacto y del buscador, el estudiante debe llegar rápido al contenido enseñable: explicación gramatical, ejemplos, vocabulario, modelos de uso o práctica guiada.
- El bloque de identidad de la unidad debe ser breve. No debe convertirse en una segunda portada.
- Una página de Course Overview o unidad no puede quedarse en "cómo se va a enseñar"; debe enseñar realmente: reglas, usos, ejemplos, contrastes, errores comunes y producción modelo.
- Las imágenes se usan para contextualizar, no para alargar la entrada. Si una imagen ya cumplió su función en el hero, no se repite salvo que tenga una función pedagógica diferente.
- En la revisión móvil se debe medir cuántas pantallas debe desplazar el estudiante antes de llegar al primer contenido de aprendizaje. Si el estudiante debe pasar por dos portadas, la página falla.

Aplicación inmediata para Unit 1:

- El hero puede presentar "Relationships: Neighbors, Friends and Meeting People".
- Debajo del hero no debe aparecer otro bloque con la misma imagen y el mismo título de Unit 1.
- La primera sección posterior al buscador debe comenzar con la enseñanza de relative clauses, tactful descriptions, relationship expressions o phrasal verbs.
- El antiguo bloque "Teaching Route / How Unit 1 will be taught" se considera insuficiente si no se transforma en explicación para el estudiante.

### 9.2 Mapa oficial por unidad

#### Unit 1 — Relationships: Neighbors, Friends and Meeting People

Sesiones: 1–2.

Resultados:

- describir relaciones con vecinos y amigos;
- reconocer distintas formas de conocer personas;
- describir personalidad y comportamiento con tacto;
- hablar de amistad, contacto y citas.

Lenguaje:

- relative clauses con `who` y `that`;
- `kind of`, `a bit`, `a little bit`;
- relationship expressions;
- phrasal verbs;
- `catch up`, `get back in touch`, `get on well`, `get to know`, `have a lot in common`, `hit it off`, `keep in touch`.

Referencias de producción incluidas en el Easy Guide — no constituyen un plan de actividades:

- plan de ubicación para una cena con vecinos;
- carta sobre una persona especial;
- artículo sobre una amistad de varios años;
- comparación de ventajas y desventajas de distintas maneras de conocer personas.

#### Unit 2 — Wishes, Dreams, Dilemmas, Advice and Regrets

Sesiones: 3–5.

Resultados:

- resumir deseos y esperanzas;
- explicar arrepentimientos;
- opinar sobre dilemas;
- proponer soluciones y consejos;
- justificar decisiones imaginarias.

Lenguaje:

- `I wish + past`;
- wishes in present, past and future;
- second conditional;
- `What would you do if...?`;
- `If I were you...`;
- `I regret...`;
- conditionals for imagined change.

Referencias de producción incluidas en el Easy Guide — no constituyen un plan de actividades:

- lista razonada de deseos realistas;
- entrada de blog sobre un arrepentimiento;
- foro de dilemas;
- role play de orientación universitaria;
- Midterm Writing Task.

#### Unit 3 — Technology, How It Works and Identity Theft

Sesiones: 6–8.

Resultados:

- pedir ayuda con problemas tecnológicos;
- describir fallas de dispositivos;
- explicar para qué sirve una tecnología;
- reconocer riesgos de robo de identidad;
- dar recomendaciones de seguridad.

Lenguaje:

- tech vocabulary;
- embedded questions;
- phrasal verbs: `hook up`, `look up`, `pick up`, `put off`, `turn down`, `take apart`;
- `On the one hand... On the other hand...`;
- vocabulary for sensitive information, scams, passwords, networks and malware.

Referencias de producción incluidas en el Easy Guide — no constituyen un plan de actividades:

- artículo sobre la primera experiencia con internet;
- llamada o chat de soporte técnico;
- manual de dispositivo;
- debate de prevención de estafas;
- Midterm Oral Task.

#### Unit 4 — Movies, Reviews, Music Videos and Trends

Sesiones: 9–10.

Resultados:

- contar la trama de una película o serie;
- escribir y comparar reseñas;
- categorizar tendencias de videos musicales;
- describir cambios en géneros, artistas y medios.

Lenguaje:

- movie genres;
- present perfect review;
- descriptive language;
- media vocabulary;
- review and recommendation expressions.

Referencias de producción incluidas en el Easy Guide — no constituyen un plan de actividades:

- reseña de precuela o secuela;
- club de crítica;
- línea de tiempo de tendencias musicales;
- comparación escrita integrada.

#### Unit 5 — Impressions, Feelings, Community and Satirical News

Sesiones: 11–14.

Resultados:

- especular sobre personas con evidencia visible;
- describir sentimientos y estados de ánimo;
- explicar cómo causar una buena impresión;
- reconocer diferencias entre noticias reales y satíricas;
- escribir sobre personas que generan un impacto positivo.

Lenguaje:

- `must`, `might`, `cannot/can't` for speculation;
- `I guess...`, `I think...`;
- `looks`, `seems`;
- emotion adjectives;
- opinion expressions;
- descriptive adjectives;
- news and satire vocabulary.

Referencias de producción incluidas en el Easy Guide — no constituyen un plan de actividades:

- conversación de especulación;
- debate con imágenes;
- lista de do’s and don’ts;
- blog sobre una persona de la comunidad;
- noticia satírica;
- Integrated Task.

#### Unit 6 — Political and Gossip News / Natural Disasters

Sesiones: 15–16.

Resultados:

- ilustrar y comentar noticias políticas y de entretenimiento;
- reportar información con cautela;
- describir noticias sobre desastres naturales;
- proponer planes de acción;
- presentar un boletín informativo.

Lenguaje:

- reported speech basics;
- media expressions;
- disaster vocabulary;
- past simple reporting;
- sequencing and emergency advice.

Referencias de producción incluidas en el Easy Guide — no constituyen un plan de actividades:

- debate sobre noticias controversiales;
- boletín de noticias;
- plan de acción durante o después de un desastre;
- presentación de estudio.

### 9.3 Bloque de reciclaje y cierre

El Course Overview incluirá un bloque separado para:

- Session 17: Recycling Units 1–2 + Final Writing Task.
- Session 18: Recycling Unit 3.
- Session 19: Recycling Unit 4.
- Session 20: Recycling Unit 5.
- Session 21 y hora final: Integrated Final Review + Final Oral Task.

Este bloque no se presentará como Unit 7.

---

## 10. Practice Lab

### 10.1 Estructura

Practice Lab tendrá:

- hero inmersivo con imagen propia;
- metadatos dinámicos con el total real de actividades;
- filtros por unidad y destreza;
- buscador;
- seis carpetas desplegables;
- bloque de revisión final;
- etiquetas de skill;
- tarjetas generadas desde el catálogo.

Filtros:

- All.
- Grammar.
- Vocabulary.
- Reading.
- Listening.
- Video Listening.
- Pronunciation.
- Conversation Coach.
- Writing.
- Speaking.
- Project.
- Review.

### 10.2 Mínimo por unidad

Cada unidad se considerará completa cuando tenga:

- una explicación de unidad;
- una práctica controlada de grammar o sentence building;
- una actividad de reading;
- una actividad de listening;
- una actividad de pronunciation;
- una actividad de Conversation Coach;
- una producción escrita;
- una tarea comunicativa de speaking, role play, debate o proyecto;
- una actividad de preparación cuando la unidad conduce a una evaluación.

La docente definirá la cantidad y el orden de las actividades. La arquitectura no impondrá una cuota, pero permitirá identificar visualmente qué destrezas todavía no tienen una actividad publicada.

### 10.3 Modelo de tarjeta

Cada tarjeta incluirá:

- número calculado dentro de la unidad;
- skill tag;
- título;
- objetivo breve;
- producto final;
- imagen;
- duración aproximada;
- estado;
- enlace;
- indicador de envío al docente;
- indicador de peso: `Practice — 0%` u `Official Assessment — 20%`.

---

## 11. Límite de planificación de actividades

Las actividades pedagógicas concretas serán diseñadas y aprobadas por la docente. Este plan no fija:

- nombres definitivos de actividades;
- historias o personajes;
- preguntas;
- instrucciones de aula;
- productos concretos;
- número definitivo de ejercicios;
- rúbricas específicas;
- guiones de audio o video.

La plataforma preparará espacios y componentes para que la docente pueda integrar actividades de:

- grammar;
- vocabulary;
- reading;
- listening;
- video listening;
- pronunciation;
- Conversation Coach;
- writing;
- speaking;
- project;
- review.

### 11.1 Qué sí define el plan

Por cada unidad se dejará preparada:

- la portada o Unit Passport;
- la asociación con sus sesiones;
- los temas y resultados oficiales del Easy Guide;
- los tipos de actividad que admite;
- el catálogo y los metadatos;
- la navegación;
- los filtros;
- el progreso;
- la entrega al docente;
- la sincronización de listening;
- la relación con evaluaciones;
- los espacios vacíos para publicar actividades aprobadas.

### 11.2 Flujo de integración de una actividad definida por la docente

1. La docente entrega el objetivo, contenido y dinámica.
2. Se crea un plan técnico y visual específico.
3. Se aprueban imagen, audio, video y producto digital, si aplican.
4. Se asigna unidad, sesión, skill, duración y peso.
5. Se implementa la actividad.
6. Se añade al catálogo.
7. Practice Lab y el buscador la muestran automáticamente.
8. Si es listening, video listening o audiobook, aparece también en Listening Library.
9. Se ejecutan las pruebas.
10. Se publica con el estado autorizado.

### 11.3 Regla sobre las sesiones

El calendario del curso solo indicará:

- unidad o unidades correspondientes;
- temas generales del Easy Guide;
- evaluación programada;
- tipo de sesión: desarrollo, reciclaje o cierre.

No describirá las actividades de clase, porque serán planeadas por la docente.

### 11.4 Estándar obligatorio de diseño para cada actividad

Antes de construir una actividad de Intermediate English Course 2 se revisarán al menos dos actividades comparables de Intermediate English Course 1. La nueva página no se diseñará de memoria ni con una estructura genérica. La revisión debe identificar qué patrón de banner, instrucciones, apoyos, modelos, interacción y cierre funciona para el mismo tipo de práctica.

Toda actividad aprobada deberá incluir, según corresponda:

1. un banner o hero propio con imagen profesional directamente relacionada con la dinámica;
2. nombre de la unidad, tipo de actividad, título, descripción breve, metadatos útiles y una acción clara para comenzar;
3. buscador de la actividad inmediatamente después del banner;
4. objetivo, language target y producto oral, escrito o digital esperado;
5. instrucciones visibles organizadas en pasos;
6. apoyo lingüístico suficiente para realizar la actividad;
7. ejemplo completo de producción o interacción, incluyendo las intervenciones del docente y de los estudiantes cuando sea una dinámica de aula;
8. desarrollo Pre-task, Task y Post-task;
9. cierre, confirmación, checklist o autoevaluación;
10. navegación de regreso a la unidad o a Practice Lab;
11. comportamiento táctil, legible y sin overflow en 360, 390 y 430 px.

Si la dinámica usa personajes, roles, objetos, escenarios o categorías que el estudiante debe escoger, cada opción tendrá una tarjeta visual pequeña con su propia imagen pertinente. No se sustituirán estas imágenes por tarjetas compuestas únicamente de texto. Las tarjetas deben ser compactas en celular para que la página conserve ritmo y no obligue a recorrer bloques innecesariamente altos.

En tarjetas de selección como personajes o relaciones, la imagen será una miniatura lateral, no una portada. Su tamaño objetivo será de 64–76 px y nunca superará 88 px en su lado visible. La miniatura no ocupará todo el ancho de la tarjeta. En celular se usará una tarjeta horizontal baja, con la miniatura a la izquierda y el nombre y la definición a la derecha. Una imagen grande en proporción 3:2 o 4:3 dentro de estas tarjetas se considera un incumplimiento de la instrucción `tarjeta pequeña`.

El banner no será fijo ni se mantendrá sobre el contenido durante el scroll. En celular tendrá altura automática, recorte controlado, texto corto y acceso rápido a la acción. La imagen principal no se repetirá inmediatamente debajo del banner.

La actividad `Secret Social Circle` fija el primer precedente de este estándar para Course 2:

- banner profesional de estudiantes jugando a adivinar una relación;
- nueve tarjetas visuales: `neighbor`, `close friend`, `old friend`, `classmate`, `coworker`, `new contact`, `person I met online`, `person I lost contact with` y `person I get on well with`;
- selección táctil de una tarjeta;
- construcción de pistas con `who`, `that` y lenguaje diplomático;
- preguntas de adivinanza;
- ejemplo completo de interacción docente-estudiantes;
- confirmación final y checklist de la ronda.

No se implementará una nueva actividad sin dejar primero en este Markdown su especificación aprobada o la actualización del estándar que corresponda.

### 11.5 Registro obligatorio de personajes y nombres

Intermediate English Course 2 mantendrá un registro de personajes por unidad y actividad. Antes de crear una historia, diálogo, coach o juego se comprobará que el nombre no pertenezca a otro personaje sin relación narrativa.

Reglas:

- no reutilizar nombres por costumbre;
- no usar como nombres genéricos recurrentes a `Maya`, `Emma`, `Daniel`, `Olivia` o `Marcus`;
- un personaje puede reaparecer únicamente cuando exista continuidad narrativa intencional;
- conservar nombre completo, actividad, función, edad aproximada, relación y recurso visual;
- evitar que dos personajes distintos compartan nombre dentro del mismo curso;
- escoger nombres pronunciables, variados y libres de asociaciones estereotipadas.

Registro inicial de Unit 1:

| Personaje | Actividad | Función |
| --- | --- | --- |
| Nora Salcedo | The Saturday Table | nueva residente y protagonista |
| Mr. Okafor | The Saturday Table | vecino y organizador comunitario |
| Iris Chen | The Saturday Table | antigua compañera de Nora |
| Gabriel Costa | The Saturday Table | nuevo contacto de Nora |

---

## 12. Ciclo TBL obligatorio en cada actividad

La guía oficial define un ciclo que debe verse en el diseño de las páginas.

### 12.1 Pre-task

La interfaz incluirá:

1. `Today’s task`: qué se va a hacer.
2. `Purpose`: para qué sirve.
3. `What you will produce`: evidencia final.
4. Activación de conocimiento: word game, prediction, quick sort, poll o mini dictation.
5. Uno o varios modelos orales o escritos.
6. Language focus.
7. Materiales e instrucciones.

### 12.2 Task

La interfaz incluirá:

1. Warm-up contextual.
2. Revisión breve del modelo.
3. Preparación.
4. Desarrollo.
5. Producción individual, en pareja o grupo.
6. Presentación o envío.

### 12.3 Post-task

La interfaz incluirá:

1. Autoevaluación.
2. Peer feedback cuando corresponda.
3. Feedback automático explicativo.
4. Teacher follow-up.
5. Revisión de grammar o pronunciation detectada.
6. Posibilidad de mejorar y reenviar en práctica formativa.

### 12.4 Regla de producto final

Ninguna actividad termina solamente con preguntas. Debe producir al menos uno de estos resultados:

- párrafo;
- blog;
- email o carta;
- audio;
- reporte de Conversation Coach;
- plan;
- debate sheet;
- comparación;
- decisión justificada;
- presentación;
- ficha de revisión;
- artefacto colaborativo.

---

## 13. Reading

Cada unidad tendrá al menos un reading propio.

Estructura:

- hero editorial;
- objetivos;
- vocabulary preview;
- texto dividido en secciones;
- tipografía cómoda y ancho de lectura controlado;
- preguntas literales;
- preguntas de inferencia;
- vocabulary in context;
- purpose/tone cuando aplique;
- producción final conectada con la unidad;
- botón `Send to teacher` cuando corresponda.

Accesibilidad:

- texto HTML, no texto dentro de imágenes;
- headings semánticos;
- no justificar párrafos;
- contraste AA;
- ancho de lectura aproximado de 65–75 caracteres;
- opción de escuchar el texto cuando exista audiobook.

### 13.1 Reading aprobado para Unit 1 — The Saturday Table

Título completo: `The Saturday Table: New Faces, Old Connections`.

La actividad desarrolla una historia original de 650–750 palabras dividida en cinco capítulos:

1. `A quiet first week`;
2. `The invitation`;
3. `A familiar face`;
4. `First impressions`;
5. `Keeping in touch`.

Nora Salcedo llega a un edificio nuevo. Mr. Okafor la invita a una cena comunitaria, donde conoce a Gabriel Costa y se reencuentra con Iris Chen. La lectura entrena relaciones sociales, primeras impresiones, evidencia textual, `who`, `that`, comas en cláusulas adicionales y las expresiones `hit it off`, `get back in touch`, `keep in touch` y `get on well`.

La página incluye:

- banner editorial propio, compacto y no fijo;
- buscador;
- cuatro tarjetas horizontales con miniaturas de 64–76 px;
- predicción Pre-task;
- ocho expresiones de vocabulary preview;
- texto completo en cinco secciones;
- pausas de lectura;
- Language Detective con cuatro contrastes de cláusulas relativas;
- ocho preguntas literales, inferenciales, de secuencia, referente y evidencia;
- retroalimentación formativa local;
- ejemplo completo de interacción en parejas;
- respuesta final de 80–100 palabras con checklist y borrador local.

La actividad tiene peso `0%` y no envía información al docente. No incorpora audio en su primera versión. Si posteriormente se aprueba `Listen after reading`, todo archivo será producido con ElevenLabs y la actividad se catalogará como read-along para Listening Library.

---

## 14. Listening y Video Listening

### 14.1 Listening

Cada listening tendrá:

- imagen hero propia;
- audio profesional generado con ElevenLabs;
- título y contexto;
- speakers identificados;
- vocabulary preview;
- reproducción nativa;
- velocidades 0.75x, 1x y 1.25x;
- preload `metadata`;
- entre 10 y 20 preguntas según la complejidad;
- feedback;
- producto final;
- transcript accesible según la política de la actividad;
- entrega al docente con peso 0% si es práctica.

No se usará `speechSynthesis` del navegador para audios pedagógicos.

Todo botón de audio dentro de Listening, Video Listening, Reading con audiobook, explicaciones, pronunciation support, Conversation Coach o repaso de vocabulario debe reproducir un archivo producido y aprobado desde ElevenLabs. No se aceptarán voces del navegador, audios improvisados ni grabaciones sin control de calidad.

### 14.1.1 Listening aprobado para Unit 1 — Nora's Voice Note

Título completo: `Nora's Voice Note: After the Saturday Table`.

La actividad continúa deliberadamente la historia y los personajes de `The Saturday Table`; no introduce nombres genéricos nuevos. Nora Salcedo graba una nota de voz después de la cena comunitaria y explica:

- quién es Mr. Okafor y cómo cambia su primera impresión;
- por qué Iris es una antigua compañera con quien vuelve a tener contacto;
- quién es Gabriel y por qué ambos conectan fácilmente;
- cómo una cena amplía su círculo social.

Especificación de producción:

- monólogo natural de aproximadamente 1 minuto y 20 segundos;
- 192 palabras habladas;
- audio exclusivamente ElevenLabs;
- personaje: Nora Salcedo;
- voz asignada: `Matilda - Professional US`;
- perfil estable: `ie2-nora-salcedo-us-01`;
- modelo: `eleven_multilingual_v2`;
- modo: TTS de una sola voz;
- inglés estadounidense general;
- velocidad de generación `0.83` para conservar dicción natural y comprensible en nivel intermedio;
- estabilidad `0.50`, similitud `0.75`, speaker boost activo y salida `MP3 44.1 kHz (128 kbps)`;
- guion canónico: `ingles/intermediate-2/audio/unit-1-saturday-table-listening-scripts.md`;
- wrapper de producción: `tools/generate_intermediate2_unit1_nora_voice_note_audio.ps1`;
- metadatos: `ingles/intermediate-2/audio/unit-1/noras-voice-note-after-the-saturday-table.elevenlabs.json`;
- no se permite `speechSynthesis`, voz del navegador ni audio provisional.

Estado de producción (7 de agosto de 2026): audio definitivo generado con ElevenLabs, integrado en el reproductor y aprobado técnicamente. Duración real: `01:17` (`77.375` segundos); tamaño: `1,238,039` bytes; formato validado: MP3 con encabezado ID3.

Objetivos lingüísticos integrados en el audio:

- cláusulas identificativas con `who` y `that`;
- cláusula adicional con nombre propio, comas y `who`;
- diferencia funcional entre identificar una persona y agregar información;
- vocabulario `neighbor`, `old classmate` y `new contact`;
- descripciones prudentes con `a bit` y `kind of`;
- `hit it off`, `get back in touch`, `get on well` y `keep in touch`.

La página incluye:

- banner profesional propio de Nora grabando la nota de voz, compacto y no fijo;
- buscador inmediatamente después del banner;
- ruta visible de primera escucha, segunda escucha y producción oral;
- seis expresiones de vocabulary preview;
- reproductor HTML nativo con `preload="metadata"`;
- velocidades 0.75x, 1x y 1.25x;
- estado accesible de reproducción;
- dos objetivos de escucha marcables sin bloquear la actividad;
- diez preguntas de idea global, detalle, inferencia y language noticing;
- retroalimentación local por pregunta;
- contraste explícito entre `who`, `that` y la cláusula entre comas;
- transcript accesible después de escuchar;
- reto de producción oral de 60 segundos;
- ejemplo completo de interacción entre estudiantes y docente;
- temporizador local;
- cero grabación, cero envío y peso `0%`.

La actividad se registra en Practice Lab y Listening Library desde la misma entrada del catálogo. No se publicará una página cuyo MP3 no exista o no haya sido generado realmente por ElevenLabs.

### 14.2 Video Listening

Cada video tendrá:

- duración preferida entre 60 segundos y 3 minutos;
- poster profesional;
- subtítulos;
- transcript;
- controles accesibles;
- comprensión global;
- comprensión específica;
- language noticing;
- producción final.

El video no debe ser decoración. Debe aportar gestos, turnos de habla, contexto visual, datos o secuencia que no se obtendrían igual con un audio.

---

## 15. Listening Library sincronizada

### 15.1 Regla central

Toda actividad publicada con tipo:

- `listening`;
- `video-listening`;
- `audiobook`;

aparecerá automáticamente en Listening Library.

No se volverá a editar manualmente la biblioteca después de crear cada listening.

### 15.2 Catálogo único

Se creará un catálogo canónico:

`assets/data/english-intermediate-2-content.json`

Campos mínimos:

```json
{
  "id": "unit1-teacher-approved-listening",
  "course": "intermediate-2",
  "unit": 1,
  "type": "listening",
  "title": "Teacher-approved listening title",
  "summary": "Summary supplied with the approved activity.",
  "image": "/assets/img/english-intermediate-2/unit-1/...",
  "media": "/ingles/intermediate-2/audio/unit-1/...",
  "audioProvider": "elevenlabs",
  "voiceProfileId": "approved-voice-profile",
  "audioVersion": "2026.1",
  "scriptHref": "/ingles/intermediate-2/audio/unit-1/...-script.md",
  "workshopHref": "/ingles/intermediate-2/listening-unit-1-....html",
  "duration": "04:20",
  "questionCount": 15,
  "speakers": ["Speaker A", "Speaker B"],
  "accent": "General American English",
  "transcriptPolicy": "after-submit",
  "status": "published",
  "teacherSubmission": true,
  "gradebookWeight": 0
}
```

### 15.3 Fuente única para tres superficies

El mismo registro alimentará:

- la tarjeta dentro de Practice Lab;
- la tarjeta dentro de Listening Library;
- los resultados del buscador.

Los contadores se calcularán desde ese catálogo:

- total de actividades;
- total por unidad;
- total por skill;
- total de audios;
- total de videos.

### 15.4 Validaciones automáticas

Una prueba fallará si:

- un listening publicado no aparece en la biblioteca;
- falta el archivo de audio o video;
- falta la imagen;
- falta `workshopHref`;
- el número de preguntas no coincide;
- el título de Practice Lab no coincide con el de la biblioteca;
- el contador visible no coincide con los registros publicados;
- una actividad de Course 1 se mezcla por accidente con Course 2.

---

## 16. Pronunciation

Cada unidad tendrá una actividad con:

1. escucha del modelo;
2. práctica por palabras o expresiones;
3. práctica por frases;
4. práctica por secciones;
5. reto de párrafo final;
6. grabación o reconocimiento;
7. feedback claro;
8. envío al docente.

Requisitos:

- audio profesional;
- indicador de micrófono;
- permiso solicitado solamente cuando el estudiante inicia la práctica;
- alternativa si el micrófono no está disponible;
- no depender solo del color;
- feedback sobre claridad, palabras clave, ritmo y completitud;
- peso 0% salvo que una evaluación oficial indique lo contrario.

---

## 17. Conversation Coach

Cada unidad tendrá un coach o interlocutor ficticio propio.

Componentes:

- retrato profesional;
- nombre y rol;
- objetivo de la conversación;
- entre 6 y 10 etapas conectadas;
- preguntas de seguimiento;
- respuestas adaptativas;
- recuperación por silencio o error del servicio;
- student interview: el estudiante también debe formular preguntas;
- transcripción;
- reporte formativo;
- opción de nuevo intento;
- envío al docente.

El Conversation Coach no será un cuestionario oral. Debe mantener contexto, reaccionar a la respuesta anterior y conducir a un producto o decisión.

---

## 18. Games

La sección conservará el contenido de Games de Intermediate English Course 1:

- Guess Who?
- The Vocabulary Impostor.
- The Decision Room.
- Hangman.

Reglas de implementación:

- misma lógica y contenido;
- reutilización de datos y JavaScript;
- no crear dos bancos divergentes;
- adaptar solamente breadcrumb, retorno al curso y metadatos cuando sea necesario;
- no agregar `2` al título `Games`;
- conservar salas en vivo, pronunciación grabada, marcador y recap cuando ya existan.

Antes de publicar se verificará que las rutas de retorno no envíen por error al home de Course 1.

---

## 19. Speak Like a Local

El contenido de idioms y phrasal verbs se conservará.

La tarjeta del curso se llamará:

> **Speak Like a Local**

Dentro de la página puede mantenerse el subtítulo:

> Intermediate Idioms and Phrasal Verbs

La fuente de expresiones será compartida. El contexto de navegación podrá identificar Course 2 sin cambiar el contenido de cada expresión.

---

## 20. Phonetic Rules

Se reutilizará la referencia fonética compartida:

`ingles/basico/phonetic-rules.html`

La tarjeta mantendrá el título:

> **Phonetic Rules: Mastering English Sounds**

No se duplicará el contenido. Se revisará:

- enlace de retorno;
- breadcrumb;
- compatibilidad móvil;
- audio disponible;
- navegación por categorías;
- foco de teclado;
- tiempos de carga.

---

## 21. Free English Learning Links

Se conservará el contenido existente:

- WordReference.
- Cambridge Dictionary.
- British Council LearnEnglish.
- BBC Learning English.
- VOA Learning English.
- ELLLO.
- YouGlish.
- LyricsTraining.
- Perfect English Grammar.
- Agendaweb.
- Breaking News English.
- Randall’s ESL Cyber Listening Lab.

La página mantendrá:

- categorías;
- descripción de utilidad;
- enlace externo seguro;
- `target="_blank"` con `rel="noopener noreferrer"`;
- rutina de estudio sugerida.

Antes de publicar Course 2 se verificará que todos los enlaces externos continúen activos.

---

## 22. Intermediate English Grades

### 22.1 Independencia

Course 2 tendrá un gradebook separado de Course 1.

No se usarán:

- el mismo archivo de notas;
- el mismo namespace de API;
- los mismos IDs de evaluación;
- los mismos registros de entregas.

Namespace propuesto:

```text
/api/intermediate2/grades
/api/intermediate2/student-profile
/api/intermediate2/...
```

Almacenamiento propuesto:

```text
/var/lib/jaralingua/intermediate2-english-grades.json
```

Variable:

```text
JARALINGUA_INTERMEDIATE2_ENGLISH_GRADES_DATA
```

### 22.2 Acceso

- Estudiante: solo sus propias notas.
- Docente: grupo, entregas, rúbricas y edición autorizada.
- Administrador: configuración, estudiantes y evaluaciones.
- Sesión verificada con Google o Microsoft.
- Ningún email se expondrá en vistas públicas.

### 22.3 Evaluaciones del gradebook

| Evaluación | Peso | Sesión |
| --- | ---: | ---: |
| Midterm Writing Task | 20% | 5 |
| Midterm Oral Task | 20% | 8 |
| Integrated Task | 20% | 13 |
| Final Writing Task | 20% | 17 |
| Final Oral Task | 20% | 21 |

Total: 100%.

Las actividades formativas pueden aparecer con:

> `Gradebook weight 0%`

pero no afectarán el promedio.

### 22.4 Funciones de la página

- Resumen privado.
- Tabla o tarjetas responsivas.
- Estado: Not started, In progress, Submitted, Reviewed.
- Nota sobre 50 y conversión institucional cuando corresponda.
- Peso.
- Retroalimentación docente.
- Historial de intento cuando sea permitido.
- Exportación PDF.
- Vista de grupo para docente.
- Edición manual controlada.
- Ocultación de emails por defecto.

---

## 23. Evaluations and Mock Exams

La sección reunirá:

- study companions;
- mock exams;
- evaluaciones oficiales;
- final reviews;
- instrucciones de acceso.

### 23.1 Patrón por evaluación

Cada evaluación oficial tendrá tres superficies cuando sea pertinente:

1. **Study Companion**  
   Explica formato, habilidades, checklist y ejemplos nuevos.

2. **Mock Exam**  
   Simulación completa sin afectar la nota oficial.

3. **Official Assessment**  
   Protegida, activada por docente, con rúbrica y peso real.

### 23.2 Evaluaciones propuestas

#### Midterm Writing Task — 20%

- Unidad base: Unit 2.
- Tema: wishes, regrets, dilemmas and advice.
- Producto: texto organizado con situación, cambio imaginado, razón y consejo.

#### Midterm Oral Task — 20%

- Unidad base: Unit 3.
- Tema: technology problem and identity protection.
- Producto: explicación oral, preguntas de aclaración y recomendaciones.

#### Integrated Task — 20%

- Unidad base: Unit 5.
- Integra input y producción.
- Producto: comprensión de audio o lectura + respuesta escrita u oral sobre impresiones, comunidad o medios.

#### Final Writing Task — 20%

- Recicla Units 1–2.
- Producto: texto que combine relaciones, situación imaginaria, decisión y justificación.

#### Final Oral Task — 20%

- Integra el curso.
- Formato recomendado: Conversation Coach o partner-style task con problema, aclaración, opinión, consejo, decisión y cierre.

### 23.3 Seguridad y control

- La evaluación oficial no se habilita solo por conocer la URL.
- Estado controlado por el servidor o docente.
- Separación entre mock y real.
- Recursos privados servidos desde rutas protegidas cuando corresponda.
- No guardar respuestas correctas sensibles en JavaScript público.
- No revelar rúbricas internas antes del momento autorizado.
- Registro de envío idempotente.
- Confirmación visible: `Submitted to teacher`.

---

## 24. Libro asignado

La guía indica una lectura de libro con actividades de comprensión.

Se creará un área dentro de Practice Lab o una subsección de Library cuando el docente defina el título y los permisos de uso.

El plan no asumirá una obra específica.

La estructura permitirá:

- reading schedule;
- chapter checkpoints;
- vocabulary notes;
- comprehension checks;
- discussion prompts;
- final response;
- teacher-created activities.

No se publicará texto protegido completo sin autorización.

---

## 25. Arquitectura técnica

### 25.1 CSS

- `english-intermediate.css` conservará tokens y componentes compartidos.
- `english-intermediate-2.css` contendrá únicamente variaciones propias.
- No copiar bloques grandes de CSS inline.
- Los estilos de actividad especializada irán en archivos separados cuando sean realmente necesarios.
- Se utilizarán custom properties.

### 25.2 Catálogo de contenido

El catálogo será la autoridad para:

- unidades;
- actividades;
- skills;
- imágenes;
- rutas;
- audios;
- videos;
- contadores;
- estados;
- pesos;
- sincronización de Listening Library.

### 25.3 HTML

- HTML semántico.
- Un H1 por página.
- Jerarquía correcta.
- `details/summary` para carpetas y unidades.
- Botones para acciones; enlaces para navegación.
- Labels reales en formularios.
- Mensajes con `aria-live` cuando el estado cambie.

### 25.4 JavaScript

- Scripts con `defer` o módulos.
- Sin handlers inline cuando se pueda evitar.
- Manejo explícito de error.
- No bloquear contenido esencial si JavaScript falla.
- Los contadores se calculan.
- El buscador y filtros comparten la misma fuente.
- Envíos idempotentes.

### 25.5 Backend

Se ampliará `server/progress_api.py` con un namespace propio para Course 2 o se extraerá una capa común sin mezclar datos.

Debe cubrir:

- perfiles;
- gradebook;
- entregas formativas;
- evaluaciones oficiales;
- Conversation Coach;
- pronunciation reports;
- teacher review;
- PDF;
- health checks;
- migraciones seguras.

---

## 26. Audio y producción multimedia

### 26.1 Regla obligatoria para ElevenLabs

Todo audio pedagógico de Intermediate English Course 2 se producirá con ElevenLabs, salvo una excepción técnica aprobada por la docente y documentada en el catálogo.

Esta regla aplica a:

- botones de audio en cualquier página;
- listening;
- video listening cuando el audio sea narrado o dramatizado;
- explicaciones cortas con audio;
- audiobooks o lectura asistida;
- pronunciation support;
- vocabulary preview con audio;
- instrucciones auditivas de una actividad;
- Conversation Coach cuando use voces pregrabadas;
- materiales de review, mock exams y evaluaciones oficiales que incluyan audio.

No se usará `speechSynthesis`, voces automáticas del navegador, audios de prueba, grabaciones casuales ni archivos sin guion aprobado como audio final del curso.

### 26.2 Banco de voces

Se definirá un banco limitado de voces aprobadas para evitar que cada actividad suene distinta.

Campos mínimos por voz:

```json
{
  "voiceProfileId": "ie2-adult-female-us-01",
  "provider": "elevenlabs",
  "displayName": "Adult female - General American",
  "accent": "General American English",
  "pace": "natural",
  "useCases": ["instructions", "listening", "audiobook"],
  "status": "approved"
}
```

Reglas:

- un mismo personaje conserva la misma voz durante todo el curso;
- los diálogos usan voces diferenciables, no caricaturescas;
- las instrucciones del sistema usan una voz estable y clara;
- el ritmo será natural, con pausas pedagógicas solo cuando el objetivo lo justifique;
- los nombres propios, lugares y términos técnicos se revisan antes de publicar;
- cada cambio de voz queda registrado con versión.

### 26.3 Pipeline de producción de audio

Cada archivo de audio seguirá este flujo:

1. La docente aprueba o entrega el guion base.
2. Se normaliza el guion para voz: turnos, pausas, pronunciación, nombres, números y siglas.
3. Se asignan voces desde el banco aprobado.
4. Se genera el audio en ElevenLabs.
5. Se escucha completo y se corrigen pronunciación, ritmo, cortes o entonación.
6. Se exporta MP3 optimizado y, cuando aplique, WebM/OGG como respaldo.
7. Se guarda el guion final junto al audio.
8. Se registra el audio en el catálogo del curso.
9. Se prueba el botón en celular, tableta, portátil y escritorio.
10. Si es listening, video listening o audiobook, aparece automáticamente en Listening Library.

### 26.4 Metadatos obligatorios por audio

Cada actividad con audio tendrá metadatos suficientes para auditar, buscar, actualizar y reemplazar el archivo sin romper la página.

```json
{
  "audioProvider": "elevenlabs",
  "voiceProfileId": "ie2-adult-female-us-01",
  "audioVersion": "2026.1",
  "scriptHref": "/ingles/intermediate-2/audio/unit-2/example-script.md",
  "audioHref": "/ingles/intermediate-2/audio/unit-2/example.mp3",
  "duration": "02:35",
  "transcriptHref": "/ingles/intermediate-2/audio/unit-2/example-transcript.html",
  "licenseNote": "Generated for JaraLingua course use",
  "qualityStatus": "approved"
}
```

Estados permitidos:

- `draft`: generado, pero no revisado;
- `needs-fix`: requiere corrección;
- `approved`: listo para publicar;
- `replaced`: se conserva por historial, pero ya no se usa;
- `retired`: eliminado de la experiencia activa.

### 26.5 Botones y reproductores de audio

Los botones de audio deben ser consistentes en todo el curso:

- icono claro de reproducción;
- etiqueta accesible con `aria-label`;
- duración visible cuando ayude a decidir;
- estado `Loading`, `Playing`, `Paused`, `Error` y `Unavailable`;
- control de velocidad cuando el audio sea listening o audiobook;
- barra de progreso para audios largos;
- sin autoplay con sonido;
- `preload="metadata"`;
- recuperación si el archivo falla;
- diseño táctil cómodo en celular;
- ningún botón debe quedar encima del contenido durante el scroll.

El componente compartido debe recibir el audio desde el catálogo. No se insertarán rutas sueltas en cada página si pueden venir de la fuente común.

### 26.6 Audio

- Voces profesionales.
- Personajes con voz consistente.
- Guiones aprobados antes de generar.
- Archivos MP3 optimizados.
- Scripts guardados junto al audio.
- Etiquetas de speaker verificadas.
- Pronunciación clara, no artificialmente lenta.
- Sin `speechSynthesis`.

### 26.7 Video

- Guion.
- Storyboard.
- Duración definida.
- Poster.
- Subtítulos WebVTT.
- Transcript HTML.
- Audio comprensible.
- Diseño responsivo.
- Material visual con función pedagógica.

### 26.8 Convención

```text
audio/unit-3/tech-support-call.mp3
audio/unit-3/tech-support-call-script.md
audio/unit-3/tech-support-call.elevenlabs.json
video/unit-3/suspicious-message.mp4
video/unit-3/suspicious-message.en.vtt
```

---

## 27. Accesibilidad

Objetivo mínimo: WCAG 2.1 AA.

Checklist:

- navegación por teclado;
- foco visible;
- contraste AA;
- alt text;
- captions;
- transcripts;
- labels;
- mensajes que no dependan solo del color;
- controles nativos o accesibles;
- `prefers-reduced-motion`;
- targets táctiles;
- orden lógico;
- zoom al 200%;
- no autoplay con sonido;
- tiempo suficiente en actividades;
- errores explicados junto al campo;
- lectura cómoda en celular.

---

## 28. Rendimiento

Presupuesto recomendado:

- hero WebP menor de 350 KB cuando sea posible;
- imagen de tarjeta menor de 180 KB;
- poster de video menor de 250 KB;
- lazy loading;
- dimensiones declaradas;
- no precargar todos los audios;
- `preload="metadata"`;
- JavaScript compartido y cacheable;
- evitar librerías nuevas si los componentes actuales resuelven la tarea.

Objetivos:

- sin layout shift notable;
- primera pantalla usable en conexión móvil;
- interacción rápida en dispositivos de gama media;
- no cargar Listening Library completa dentro del home.

---

## 29. Fases de producción

### 29.0 Regla obligatoria de cierre por fase

Cada vez que se realice una sección, una actividad, una página o una fase de Intermediate English Course 2, el trabajo no se considerará cerrado hasta completar este ciclo:

1. implementar únicamente lo aprobado en la conversación actual;
2. validar enlaces, consola, responsive móvil y comportamiento principal;
3. revisar que no se hayan iniciado actividades o páginas fuera del alcance aprobado;
4. hacer commit con un mensaje claro;
5. desplegar a producción;
6. verificar la URL publicada o el estado del despliegue;
7. reportar al usuario el commit y el resultado del despliegue.

No se debe empezar una nueva sección, actividad o página si la fase anterior quedó sin commit o sin despliegue, salvo que el usuario pida explícitamente trabajar localmente sin publicar.

Esta regla aplica también a correcciones pequeñas. Si una corrección modifica una página, recurso, script, estilo, evaluación, audio, imagen o documento del curso, debe cerrar con commit y despliegue.

Las validaciones técnicas de este proyecto no levantarán servidores locales. Se harán mediante revisión estática de HTML, CSS, JavaScript, enlaces, recursos, responsive y diferencias de Git. La comprobación navegable se realizará después del despliegue en producción, donde la docente hará su propia prueba visual.

### Fase 0 — Fundaciones

- Crear ruta.
- Crear CSS específico.
- Crear catálogo.
- Definir IDs.
- Definir namespace del backend.
- Preparar progreso, portafolio y estados de publicación.
- Definir banco de voces ElevenLabs, metadatos y componente compartido de audio.
- Preparar el buscador global.
- Preparar pruebas.

Criterio de salida:

- estructura estable sin contenido ficticio publicado.

### Fase 1 — Index de inglés y home del curso

- Agregar Course 2 al index.
- Actualizar selector global.
- Crear hero.
- Crear dashboard de nueve secciones.
- Crear buscador y Quick Access.
- Crear Continue Learning.
- Crear accesos a Easy Guide y Course Schedule.
- Aplicar la norma mobile-first sin banners fijos.

Criterio de salida:

- navegación completa y responsiva.

### Fase 2 — Course Overview

- Crear seis unidades desplegables.
- Cargar sesiones, outcomes, functions y productos.
- Crear bloque de evaluaciones y review.
- Crear seis imágenes principales.
- Crear Unit Passport, Unit Launch y espacios de Exit Ticket.
- Integrar progreso por unidad y destreza.
- Publicar el calendario de sesiones.

Criterio de salida:

- la guía oficial y sus fechas están representadas sin omisiones.

### Fase 3 — Practice Lab base + Units 1–2

- Crear filtros, catálogo y contadores.
- Crear Activity Map.
- Crear Review for Today.
- Preparar los espacios de Unit 1 y Unit 2.
- Integrar únicamente las actividades entregadas y aprobadas por la docente.
- Preparar la infraestructura de Midterm Writing Companion, Mock y Assessment.

Criterio de salida:

- Unit 1 y Unit 2 reciben correctamente las actividades definidas por la docente y actualizan progreso, buscador y catálogo.

### Fase 4 — Unit 3

- Preparar Unit Passport para Technology e Identity Theft.
- Integrar actividades aprobadas por la docente.
- Preparar Midterm Oral Companion, Mock y Assessment.

Criterio de salida:

- unidad, sesiones y evaluación oral conectadas sin imponer actividades no aprobadas.

### Fase 5 — Unit 4

- Preparar Unit Passport para Movies, Reviews y Music Trends.
- Integrar actividades aprobadas por la docente.

Criterio de salida:

- unidad conectada con sesiones 9–10, progreso y catálogo.

### Fase 6 — Unit 5

- Preparar Unit Passport para Speculation, Feelings, Impressions, Community y Satire.
- Integrar actividades aprobadas por la docente.
- Preparar Integrated Task Companion, Mock y Assessment.

Criterio de salida:

- unidad conectada con sesiones 11–14 y tarea integrada oficial.

### Fase 7 — Unit 6

- Preparar Unit Passport para News, Reported Speech y Natural Disasters.
- Integrar actividades aprobadas por la docente.

Criterio de salida:

- unidad conectada con sesiones 15–16 y catálogo.

### Fase 8 — Reviews y finales

- Reviews de sesiones 17–21.
- Integrar actividades de review definidas por la docente.
- Preparar Final Writing Companion, Mock y Assessment.
- Preparar Final Oral Companion, Mock y Assessment.

Criterio de salida:

- gradebook suma 100% y todos los finales están protegidos.

### Fase 9 — Endurecimiento

- auditoría de links;
- auditoría de imágenes;
- auditoría de audio;
- responsive;
- accesibilidad;
- rendimiento;
- seguridad;
- pruebas de roles;
- PDF;
- prueba de scroll móvil;
- prueba del buscador con teclado virtual;
- validación del Easy Guide y del calendario;
- validación de progreso, portafolio y recomendaciones;
- backup y migración.

Criterio de salida:

- publicación aprobada.

---

## 30. Pruebas

### 30.1 Navegación

- Todos los enlaces abren la página correcta.
- El botón Back regresa a Course 2.
- El selector distingue Course 1 y Course 2.
- No hay referencias accidentales a Course 1.
- El número `2` no se agrega al nombre de las secciones.

### 30.2 Catálogo

- Conteo total correcto.
- Conteo por unidad correcto.
- Conteo por skill correcto.
- Ningún ID duplicado.
- Ninguna ruta rota.

### 30.3 Listening Library

- Todo listening publicado aparece.
- Todo video listening publicado aparece.
- Ninguna actividad no auditiva aparece por error.
- Media e imagen existen.
- Todo audio publicado tiene `audioProvider: "elevenlabs"`.
- Todo audio publicado tiene `voiceProfileId`, `audioVersion` y guion asociado.
- Ningún listening usa `speechSynthesis` ni rutas temporales.
- El taller relacionado abre.

### 30.4 Responsive

- Capturas y pruebas en los tamaños definidos.
- Sin overflow del documento.
- Sin botones cortados.
- Sin texto sobre imágenes.
- Sin tablas ilegibles.
- Sin heroes demasiado altos en celular.

### 30.5 Accesibilidad

- Teclado.
- Focus.
- Labels.
- Alt text.
- Captions.
- Transcript.
- Botones de audio con nombre accesible y estado anunciado.
- Contraste.
- Reduced motion.

### 30.6 Gradebook

- Estudiante solo ve su registro.
- Docente ve el grupo autorizado.
- Admin puede gestionar.
- Course 1 y Course 2 están separados.
- 20% × 5 = 100%.
- Actividades 0% no cambian el promedio.
- PDF correcto.

### 30.7 Evaluaciones

- Mock no modifica nota oficial.
- Official Assessment requiere activación.
- Envío idempotente.
- Un doble toque o un reintento con el mismo `clientSubmissionId` no crea otra entrega.
- Si el navegador pierde la respuesta, consulta el estado antes de anunciar un error.
- Toda entrega confirmada devuelve un comprobante rastreable.
- La entrega aparece en la bandeja docente y en Grades con el mismo intento y estado.
- La calificación de un intento anterior se rechaza si ya existe uno más reciente.
- Una recarga, pérdida de sesión o cierre de la evaluación no borra un intento ya iniciado.
- El botón de envío se recupera después de un error y nunca queda congelado en `Submitting`.
- Una respuesta parcial, una producción corta, una nota baja o un texto vacío no se bloquean cuando la política de esa evaluación permite entregarlos.
- Estado guardado.
- Rúbrica correcta.
- No se exponen respuestas.

---

## 31. Criterios de aceptación por actividad

Una actividad está terminada solamente si:

- corresponde a un outcome oficial;
- usa el lenguaje de la unidad;
- sigue pre-task, task y post-task;
- tiene input o modelo;
- tiene práctica;
- tiene producción;
- tiene feedback;
- tiene imagen profesional;
- tiene alt text;
- funciona en celular;
- no tiene errores de consola;
- no tiene links rotos;
- aparece en Practice Lab;
- si es listening/video listening, aparece automáticamente en Listening Library;
- si se envía, llega al docente;
- si se envía, devuelve comprobante y puede recuperarse por ese código;
- si la respuesta de red se pierde, reconcilia el envío sin duplicarlo;
- si es formativa, muestra 0%;
- si es oficial, muestra 20% y está protegida;
- tiene pruebas.

---

## 32. Definition of Done del curso

Intermediate English Course 2 estará listo cuando:

- aparezca en el index de inglés;
- tenga home completo;
- tenga las nueve secciones;
- Course Overview represente las seis unidades;
- Practice Lab tenga todas las unidades y destrezas;
- cada unidad tenga reading, listening, pronunciation y Conversation Coach;
- Listening Library se alimente automáticamente;
- Games conserve todo su contenido;
- Speak Like a Local conserve su contenido;
- Phonetic Rules conserve su contenido;
- Free English Learning Links conserve su contenido;
- Grades sea privado e independiente;
- las cinco evaluaciones sumen 100%;
- existan study companions y mocks;
- las imágenes sean profesionales y temáticas;
- no se use estética blackboard;
- celular, tableta, portátil y escritorio estén aprobados;
- accesibilidad, rendimiento, seguridad y enlaces hayan pasado auditoría;
- el docente pueda revisar evidencias;
- todos los entregables usen el contrato único descrito en la sección 38;
- cada entrega confirmada coincida en el comprobante del estudiante, la bandeja docente y Grades;
- ninguna prueba crítica de identidad, idempotencia, recuperación, reintento o sincronización esté fallando;
- no existan contadores manuales inconsistentes;
- cada sección, actividad, página o fase tenga commit propio o claramente agrupado;
- cada commit aprobado para el curso haya sido desplegado y verificado antes de iniciar la siguiente fase.

---

## 33. Orden inmediato recomendado

1. Incorporar al plan las funcionalidades y fechas aprobadas.
2. Crear la estructura vacía de `ingles/intermediate-2/`.
3. Copiar y publicar el Easy Guide en PDF y DOCX.
4. Crear Course Schedule con fechas y alertas.
5. Crear el catálogo central.
6. Crear el buscador global.
7. Preparar progreso, Continue Learning, Unit Passport y Portfolio.
8. Diseñar y generar la imagen principal del curso.
9. Construir la tarjeta del nuevo curso en `ingles/index.html`.
10. Construir el home con enfoque mobile-first.
11. Construir Course Overview.
12. Preparar las unidades para recibir las actividades definidas por la docente.

No se diseñarán actividades pedagógicas sin definición de la docente. Primero se construirá la arquitectura que permitirá incorporarlas de forma ordenada.

---

## 34. Funcionalidades aprobadas para la experiencia de aprendizaje

Todas las funcionalidades de esta sección quedan aprobadas como parte del alcance de Intermediate English Course 2.

### 34.1 Continue Learning

El home del curso y cada Unit Passport incluirán una tarjeta dinámica:

> **Continue Learning**

La tarjeta mostrará:

- última actividad abierta;
- unidad;
- skill;
- estado;
- progreso del último intento;
- botón `Continue`;
- recomendación siguiente cuando la actividad ya esté terminada.

El registro se asociará al estudiante autenticado. Para visitantes sin sesión podrá existir una memoria local temporal que no contenga información sensible.

### 34.2 Progreso por unidad y destreza

El progreso formativo estará separado de las calificaciones oficiales.

Cada Unit Passport mostrará:

- actividades publicadas;
- Not started;
- In progress;
- Completed;
- Submitted;
- Teacher reviewed;
- porcentaje general de la unidad;
- progreso en grammar;
- progreso en reading;
- progreso en listening;
- progreso en pronunciation;
- progreso en conversation;
- progreso en writing y speaking cuando existan.

Una actividad completada no equivale automáticamente a una evaluación aprobada.

### 34.3 Unit Launch y Exit Ticket

Cada unidad tendrá dos componentes estructurales:

#### Unit Launch

- temas oficiales;
- resultados de aprendizaje;
- language focus;
- sesiones relacionadas;
- diagnóstico breve cuando la docente lo autorice;
- explicación de cómo navegar la unidad;
- actividades disponibles;
- evaluación relacionada.

#### Exit Ticket

- espacio para la comprobación final definida por la docente;
- estado de completitud;
- recomendación de refuerzo;
- enlace a la siguiente unidad o al review.

El Exit Ticket no bloqueará por defecto el acceso al contenido siguiente.

### 34.4 Recomendaciones personalizadas

La primera versión usará reglas simples, visibles y auditables.

Ejemplos de comportamiento:

- listening incompleto → recomendar vocabulary preview o una nueva escucha;
- dificultad en grammar → recomendar la práctica controlada disponible;
- pronunciation pendiente → recomendar la sección no completada;
- actividad enviada → recomendar la siguiente destreza de la unidad;
- buen desempeño → recomendar speaking, writing o review.

La recomendación nunca modificará una nota ni ocultará contenido.

### 34.5 Student Portfolio

Cada estudiante tendrá un portafolio privado con:

- writings;
- grabaciones finales;
- reportes de Conversation Coach;
- proyectos;
- feedback docente;
- versiones corregidas;
- evidencias destacadas;
- filtro por unidad y skill;
- fecha y versión de la actividad;
- estado de revisión.

El portafolio se diferenciará del gradebook:

- Grades responde cuánto vale y qué nota obtuvo.
- Portfolio responde qué produjo, cómo mejoró y qué feedback recibió.

### 34.6 Review for Today

Se implementará revisión espaciada con una sección:

> **Review for Today**

Podrá reunir contenido ya publicado según:

- errores frecuentes;
- actividades no terminadas;
- tiempo transcurrido desde la última práctica;
- unidad actual;
- evaluación próxima;
- recomendación docente.

La plataforma no inventará ejercicios nuevos automáticamente. Seleccionará o recomendará actividades y recursos ya aprobados por la docente.

### 34.7 Activity Map

Cada Unit Passport podrá mostrar una ruta visual flexible:

```text
Unit Launch
    ↓
Input and controlled practice
    ↓
Reading / Listening / Video Listening
    ↓
Pronunciation / Conversation
    ↓
Writing / Speaking / Project
    ↓
Exit Ticket
```

La ruta comunica secuencia pedagógica, pero no obliga a completar actividades que todavía no hayan sido creadas o asignadas.

### 34.8 Filtros avanzados de Practice Lab

Filtros aprobados:

- unidad;
- tema;
- skill;
- estado;
- dificultad;
- duración;
- individual;
- pair work;
- group work;
- teacher-led;
- formative;
- evaluation preparation;
- recommended.

### 34.9 Listening Library mejorada

Además de la sincronización automática, se implementará:

- filtros por unidad, tipo y duración;
- audio, video listening y audiobook;
- Completed / Not started;
- `Listen later`;
- reanudación del punto de reproducción;
- velocidad recordada;
- transcript según política;
- vocabulary preview;
- enlace de regreso a la unidad;
- speaker labels consistentes;
- modo de conexión lenta.

### 34.10 Conversation Coach mejorado

El componente técnico admitirá:

- memoria dentro del intento;
- preguntas de aclaración;
- seguimiento de decisiones;
- student interview;
- detección de respuestas insuficientes;
- cierre con resumen o decisión;
- modo ensayo;
- modo entrega;
- reporte de task completion, vocabulary, grammar, clarity, interaction y follow-up questions.

El contenido pedagógico de cada conversación será definido por la docente.

### 34.11 Teacher Activity Center

El panel docente permitirá:

- activar y ocultar actividades;
- programar fecha de disponibilidad;
- revisar entregas;
- filtrar por unidad, skill y estado;
- devolver feedback;
- permitir reenvíos;
- abrir o cerrar evaluaciones;
- identificar estudiantes que requieren acompañamiento;
- administrar recomendaciones;
- ver el calendario de sesiones.

### 34.12 Classroom Mode

Las actividades compatibles podrán mostrar una vista para proyector:

- texto grande;
- instrucciones resumidas;
- temporizador;
- equipos;
- siguiente etapa;
- modo sin datos privados;
- controles adecuados para docente.

### 34.13 Mejoras técnicas complementarias

- componentes compartidos por tipo de actividad;
- estados `draft`, `teacher-preview`, `scheduled`, `published` y `archived`;
- versionado de actividades y entregas;
- modo de conexión lenta;
- registro de errores sin invadir privacidad;
- auditoría de catálogo;
- preservación de intentos anteriores cuando una actividad cambie de versión.

---

## 35. Buscador global de unidades y actividades

### 35.1 Ubicación

Todas las páginas de Intermediate English Course 2 mostrarán al inicio, inmediatamente después de la navegación principal, un buscador compacto:

> **Search units and activities**

El buscador debe aparecer antes del contenido largo. En actividad individual puede mostrarse como una barra compacta desplegable para no desplazar excesivamente el objetivo principal.

### 35.2 Alcance de búsqueda

Permitirá encontrar:

- unidades;
- temas;
- palabras clave;
- skills;
- nombres de actividades;
- sesiones;
- evaluaciones;
- recursos de listening;
- contenido de review.

Ejemplos:

- `neighbors`;
- `relative clauses`;
- `wishes`;
- `technology`;
- `identity theft`;
- `movies`;
- `feelings`;
- `news`;
- `natural disasters`;
- `Session 8`;
- `oral evaluation`;
- `pronunciation`.

### 35.3 Comportamiento

- resultados mientras se escribe;
- navegación completa por teclado;
- botón Clear;
- mensaje cuando no existan resultados;
- resaltado accesible de coincidencias;
- agrupación por Units, Activities, Library y Evaluations;
- filtros rápidos;
- enlaces directos;
- registro central de keywords;
- sin buscar contenido privado o respuestas de evaluaciones.

### 35.4 Mobile-first

En celular:

- ocupa el ancho disponible;
- input de al menos 44 px de alto;
- resultados en panel dentro del flujo;
- sin overlay que cubra toda la página;
- teclado no oculta la acción principal;
- botón de cierre visible;
- sin desplazamiento horizontal.

---

## 36. Norma mobile-first y prevención de banners bloqueantes

La mayoría de los estudiantes consultará el curso desde celular. Por lo tanto, la versión móvil será la referencia primaria de diseño y la versión de escritorio será una expansión.

### 36.1 Prohibiciones en celular

Ningún hero, banner, imagen principal o panel introductorio podrá usar:

- `position: fixed`;
- `position: sticky`;
- `background-attachment: fixed`;
- altura de `100vh` que impida llegar rápidamente al contenido;
- capas que permanezcan sobre el contenido al hacer scroll;
- imágenes con pseudo-elementos que intercepten gestos;
- overlays permanentes;
- navegación horizontal sin una señal clara.

### 36.2 Comportamiento obligatorio

- Todos los heroes estarán en el flujo normal del documento.
- Al hacer scroll, el hero desaparecerá naturalmente hacia arriba.
- En celular, la imagen del hero irá arriba o debajo del texto según la página, pero nunca detrás de contenido largo.
- Los fondos usarán `background-attachment: scroll`.
- Los banners tendrán altura basada en su contenido.
- Se limitará el espacio inicial para que el estudiante vea el comienzo del contenido sin desplazarse varias pantallas.
- Los botones no permanecerán flotando sobre texto.
- Solo se permitirán controles fijos pequeños y justificados, como accesibilidad o retorno, después de verificar que no cubren contenido.

### 36.2.1 Regla de no repetición antes del contenido

En celular, el inicio de una página no puede funcionar como una secuencia de portadas repetidas.

Queda prohibido:

- mostrar una imagen hero y luego repetir la misma imagen en una tarjeta introductoria inmediata;
- repetir "Unit 1", "Lesson 1", el título de la unidad o el mismo resumen si ya apareció en el banner;
- poner una segunda presentación visual antes de la primera explicación real;
- usar bloques decorativos que obliguen al estudiante a hacer scroll varias veces antes de encontrar contenido enseñable.

Orden obligatorio recomendado para páginas explicativas de unidad:

1. Header compacto.
2. Hero breve con imagen o fondo, título y una frase clara.
3. Buscador o navegación corta, si aplica.
4. Primer contenido de aprendizaje: regla, explicación, ejemplo o vocabulario.
5. Expansión visual o mapa de unidad solo si aporta una función distinta.

La auditoría móvil debe confirmar que el primer contenido enseñable aparece rápidamente en 360, 390 y 430 px. Si la página repite hero, unidad, imagen y título antes de enseñar, debe rediseñarse.

### 36.3 Prueba obligatoria de scroll móvil

Cada página se probará en 360, 390 y 430 px:

1. Cargar desde la parte superior.
2. Desplazarse hasta el final.
3. Confirmar que el banner sale del viewport.
4. Confirmar que no existe una capa bloqueante.
5. Abrir y cerrar menús y carpetas.
6. Usar el buscador con el teclado virtual.
7. Reproducir audio o video.
8. Rotar a landscape.
9. Aumentar zoom.
10. Verificar que el contenido siempre permanece alcanzable.

Una página falla la auditoría si una imagen, hero o navegación tapa el contenido durante el scroll.

### 36.4 Orden móvil recomendado

```text
Header compacto
Search units and activities
Breadcrumb / Back
Título y contexto breve
Acción principal
Imagen del hero
Contenido de la página
Acciones relacionadas
Footer
```

---

## 37. Easy Guide y calendario de sesiones

### 37.1 Accesos

El home y Course Overview tendrán un bloque de utilidad con:

- botón `View Easy Guide`;
- botón `Download Easy Guide`;
- botón `Course Schedule`;
- botón `Add dates to calendar` cuando se implemente el archivo `.ics`.

Estos accesos no se numerarán como una décima sección. Serán herramientas del curso.

### 37.2 Archivos públicos propuestos

```text
ingles/intermediate-2/documents/
├── Intermediate-English-Course-2-Easy-Guide.pdf
├── Intermediate-English-Course-2-Easy-Guide.docx
└── Intermediate-English-Course-2-Schedule.ics
```

Comportamiento:

- `View Easy Guide` abre el PDF en una pestaña o visor accesible.
- `Download Easy Guide` descarga el DOCX original.
- El nombre de descarga es legible.
- Se conserva la versión fuente sin modificar.
- El PDF se verifica visualmente antes de publicar.
- La página indica que el Easy Guide es la fuente oficial de unidades, sesiones y evaluaciones.

### 37.3 Página Course Schedule

Ruta propuesta:

`ingles/intermediate-2/session-calendar.html`

La página mostrará:

- fecha;
- número de sábado;
- sesiones;
- unidad;
- temas generales;
- tipo: desarrollo, evaluación, reciclaje o cierre;
- alerta de evaluación;
- enlace a Course Overview;
- enlace al Easy Guide;
- estado de la sesión: Upcoming, Today o Completed.

No contendrá actividades de clase. Las actividades serán planeadas por la docente.

### 37.4 Regla de distribución

Fecha de inicio confirmada:

> **Sábado 8 de agosto de 2026**

Se programan dos sesiones por sábado siguiendo el orden del Easy Guide. La última jornada incluye la sesión 21 y la hora final indicada como Session 22 (1 hour).

El calendario presupone sábados consecutivos y no incluye cancelaciones institucionales. Si existe una suspensión, se deben desplazar las fechas posteriores sin cambiar el orden de las sesiones.

### 37.5 Calendario oficial propuesto

| Sábado | Fecha | Sesiones | Unidad / bloque | Temas generales | Alerta |
| ---: | --- | --- | --- | --- | --- |
| 1 | 8 de agosto de 2026 | 1–2 | Unit 1 | Course presentation; compromiso académico; syllabus; relationships with neighbors and friends; dating and meeting people; sound practice | Inicio del curso |
| 2 | 15 de agosto de 2026 | 3–4 | Unit 2 | Wishes and dreams; moral and ethical dilemmas | — |
| 3 | 22 de agosto de 2026 | 5–6 | Unit 2 → Unit 3 | Advice and regrets; technology basics | **EVALUATION: Midterm Writing Task — 20% — Session 5** |
| 4 | 29 de agosto de 2026 | 7–8 | Unit 3 | How technology works; identity theft | **EVALUATION: Midterm Oral Task — 20% — Session 8** |
| 5 | 5 de septiembre de 2026 | 9–10 | Unit 4 | Movies and reviews; music videos and trends | — |
| 6 | 12 de septiembre de 2026 | 11–12 | Unit 5 | Speculating about people; feelings and moods; sound practice | — |
| 7 | 19 de septiembre de 2026 | 13–14 | Unit 5 | Making an impression; news and satire | **EVALUATION: Integrated Task — 20% — Session 13** |
| 8 | 26 de septiembre de 2026 | 15–16 | Unit 6 | Political and gossip news; natural disasters | — |
| 9 | 3 de octubre de 2026 | 17–18 | Review Units 1–3 | Recycling Units 1–2; technology review | **EVALUATION: Final Writing Task — 20% — Session 17** |
| 10 | 10 de octubre de 2026 | 19–20 | Review Units 4–5 | Movie and music review; speculation, impressions and satire review | — |
| 11 | 17 de octubre de 2026 | 21 + Session 22 (1 hour) | Integrated Final Review | Integrated course review; final assessment | **EVALUATION: Final Oral Task — 20% — Session 21** |

### 37.6 Fechas de evaluación destacadas

Las cinco alertas aparecerán:

- en el home;
- en Course Schedule;
- en el Unit Passport relacionado;
- en Evaluations and Mock Exams;
- en Grades;
- en Teacher Activity Center.

| Evaluación | Fecha | Sesión | Peso |
| --- | --- | ---: | ---: |
| Midterm Writing Task | 22 de agosto de 2026 | 5 | 20% |
| Midterm Oral Task | 29 de agosto de 2026 | 8 | 20% |
| Integrated Task | 19 de septiembre de 2026 | 13 | 20% |
| Final Writing Task | 3 de octubre de 2026 | 17 | 20% |
| Final Oral Task | 17 de octubre de 2026 | 21 | 20% |

### 37.7 Diseño de las alertas

Cada alerta mostrará:

- `Important evaluation`;
- nombre;
- fecha completa;
- sesión;
- peso;
- enlace al Study Companion cuando exista;
- estado de disponibilidad;
- icono y texto, no solo color.

En celular será una tarjeta dentro del flujo. Nunca se mostrará como un banner fijo que cubra el contenido.

---

## 38. Arquitectura de entregables sin fricción

### 38.1 Alcance de la auditoría

Este apartado se basa en evidencia del repositorio: historial de correcciones, rutas del servidor, clientes de envío, pruebas automatizadas de Intermediate Integrated Task, Final Writing, Final Oral, Conversation Coach, pronunciation, listening y Grades.

El mapa no pretende reconstruir cada incidente informal ocurrido en producción. Sí reúne las familias de fallos demostrables que ya exigieron correcciones y las convierte en requisitos obligatorios para Course 2.

Principio rector:

> Una entrega solo está confirmada cuando el servidor devuelve o permite recuperar un comprobante y el mismo intento aparece en la bandeja docente y en Grades.

### 38.2 Mapa histórico de fallos y correcciones obligatorias

| Área | Fallo o síntoma detectado | Corrección obligatoria para Course 2 | Prueba de regresión |
| --- | --- | --- | --- |
| Sesión | El estudiante cambia de página y pierde autenticación; el envío devuelve 401 | Sesión persistente entre páginas, renovación controlada y retorno al punto exacto después de iniciar sesión | Iniciar, navegar, caducar sesión, autenticarse y entregar sin perder el trabajo |
| Recuperación de acceso | Una cuenta equivocada o una sesión dañada deja el examen sin salida | Acción visible `Change account / Reset login`, sin borrar borradores ni intentos | Probar cambio de cuenta en celular y escritorio |
| Identidad | Email, alias, usuario local o matrícula no encuentran al estudiante correcto | Normalización central de identidad, aliases y vínculo con un único `studentId` interno | Google, Microsoft personal/institucional y acceso local llegan al mismo registro autorizado |
| Reclamo por matrícula | El reclamo facilita actividades normales, pero sería inseguro en una evaluación de alto impacto | Permitir claim de matrícula solo donde la política lo autorice; evaluaciones oficiales exigen cuenta o alias previamente registrado | Intento de claim no registrado en examen oficial devuelve acceso denegado |
| Aislamiento | Entregas o notas de otro curso aparecen en el gradebook | Namespace, rutas, IDs, almacenamiento y catálogo propios de `intermediate-2` | Enviar en Course 1 y Course 2 y comprobar aislamiento total |
| Contrato de ruta | El cliente llama una ruta o método distinto al que acepta el servidor | Registro único de endpoints y prueba contractual GET/POST por entregable | Cada botón usa exactamente la ruta y método publicados |
| Botón bloqueado | Requisitos visuales, checkbox, mínimo de palabras, nota baja o respuesta parcial impiden enviar | Las orientaciones pedagógicas no deshabilitan técnicamente la entrega, salvo requisito oficial explícito | Texto vacío permitido, texto corto, nota baja y oral parcial según política |
| Estado congelado | El botón permanece en `Submitting` cuando `fetch` no termina o se pierde la respuesta | Timeout con `AbortController`, estado recuperable y consulta automática del intento antes de mostrar error | Simular timeout y respuesta perdida; el botón se recupera |
| Resultado desconocido | El servidor guardó, pero el navegador mostró error | Estado `delivery_unknown` y reconciliación por `clientSubmissionId` | Cortar la respuesta después del guardado y recuperar el mismo comprobante |
| Duplicados | Doble toque, refresh o reintento crea dos entregas | Idempotencia obligatoria con un ID persistido antes del primer POST | Repetir el mismo POST; mismo intento y comprobante |
| Reintentos reales | Un nuevo intento sobrescribe evidencia sin conservar historia | Nuevo `clientSubmissionId`, número de intento y archivo inmutable del anterior | Enviar dos intentos y consultar ambos; el último queda activo |
| Confirmación | Un toast desaparece y el estudiante no sabe si llegó | Panel persistente con comprobante, hora, estado y acciones para copiar o descargar | Recargar la página y seguir viendo la confirmación |
| Recepción docente | La entrega existe, pero no aparece en la bandeja del docente | Bandeja derivada de la fuente de entregas, no solo de Grades; detector de huérfanos | Guardar entrega, retirar proyección de Grades y comprobar reparación |
| Estados inconsistentes | `submitted`, `pending-writing` y `pending-writing-review` se interpretan distinto | Vocabulario canónico y adaptadores para datos históricos | Todos los estados equivalentes se muestran como entregados |
| Sincronización | El envío y Grades se guardan por separado y quedan en desacuerdo | Entrega como fuente de verdad; Grades como proyección reconstruible | Borrar la nota proyectada y ejecutar reconciliación automática |
| Calificación obsoleta | Docente califica un comprobante anterior después de un reintento | El POST de calificación incluye `receiptId`; el servidor rechaza el intento antiguo con 409 | Calificar recibo anterior después de un reintento |
| Borradores | Reload, cierre del navegador o pérdida de conexión borra Final Writing | Borrador local más copia de servidor con revisión y marca de tiempo | Escribir, recargar, cambiar de dispositivo y reanudar |
| Cierre del examen | La ventana cierra mientras el estudiante ya está trabajando | El cierre impide nuevos inicios, no la entrega de intentos autorizados y ya iniciados | Iniciar antes del cierre y entregar después |
| Flujo oral | Fallo de micrófono/transcriptor o cambio de etapa congela `Continue` | Navegación recuperable, alternativa escrita, guardado por etapa y entrega parcial | Denegar micrófono y finalizar sin quedar atrapado |
| Privacidad oral | Riesgo de guardar audio innecesario | Guardar transcripción, métricas y evidencia mínima; no guardar audio por defecto | Auditoría del payload y almacenamiento confirma ausencia de bytes de audio |
| Privacidad docente | Email, rúbrica interna o puntaje técnico se filtran al estudiante | Respuestas públicas por rol y lista explícita de campos | Estudiante no recibe emails del grupo ni campos internos de rúbrica |
| Error de validación | Payload incompleto, manipulado o métricas imposibles llegan al registro | Validación de esquema, rangos, versión y actividad en servidor | Payload inválido devuelve 400 y no genera entrega |
| Almacenamiento | Un fallo de escritura se presenta como entrega exitosa | Escritura atómica, backup, error 503 tipado y cero confirmaciones falsas | Simular almacenamiento no disponible |
| Rate limit/red | El usuario recibe un mensaje genérico y vuelve a tocar varias veces | Respetar `Retry-After`, conservar el ID y mostrar una acción clara de reintento | Respuesta 429 seguida de reintento idempotente |
| Caché | El navegador conserva un JavaScript antiguo después de corregir el envío | Versionado de assets y verificación de versión del cliente | Desplegar dos versiones y comprobar que carga la vigente |
| Móvil | Teclado, banner u overlay tapa el botón o el comprobante | Flujo en documento, acciones visibles, sin hero fijo y sin overflow | Entrega completa en 360, 390 y 430 px |

### 38.3 Tipos de entregable

Todos usarán el mismo motor, aunque su política académica sea diferente:

1. **Práctica privada:** guarda progreso para el estudiante; no requiere bandeja docente.
2. **Formativa entregable:** llega al docente, conserva intentos y aparece con `0%`, `followUpOnly: true` y `doesNotAffectAverage: true`.
3. **Oficial autocorregida:** genera resultado oficial y proyección en Grades.
4. **Oficial con revisión docente:** queda en `pending_teacher_review` hasta que la rúbrica sea guardada.
5. **Writing con borrador:** añade autosave, revisión de versión y reanudación.
6. **Oral o Conversation Coach:** añade etapas, transcripción, métricas, fallback sin micrófono y política explícita de audio.

La configuración del catálogo determinará el tipo. Una página individual no podrá inventar su propia lógica de recepción.

### 38.4 Contrato único de envío

Antes del primer intento, el cliente crea y conserva un `clientSubmissionId` UUID. El servidor deriva la identidad desde la sesión; nunca confía en un nombre, email, rol, nota o `studentId` enviado libremente por el navegador.

Campos mínimos de la solicitud:

```json
{
  "schemaVersion": 1,
  "courseId": "intermediate-2",
  "activityId": "unit-3-example",
  "activityVersion": "2026.1",
  "attemptId": "server-issued-or-empty-on-first-send",
  "clientSubmissionId": "uuid",
  "completionStatus": "complete",
  "evidence": {},
  "metrics": {}
}
```

Campos mínimos de una respuesta confirmada:

```json
{
  "ok": true,
  "idempotent": false,
  "submissionId": "internal-id",
  "attemptId": "attempt-id",
  "receiptId": "IE2-XXXXXXXXXX",
  "receivedAt": "server-iso-time",
  "status": "pending_teacher_review",
  "gradebookStatus": "submitted"
}
```

Reglas:

- el servidor fija estudiante, curso, hora y permisos;
- el mismo estudiante, actividad y `clientSubmissionId` siempre devuelve el mismo resultado;
- un nuevo intento requiere un nuevo ID;
- el comprobante es único, buscable e inmutable;
- el servidor valida esquema, tamaño, versión, rangos y propiedad del intento;
- nunca se envían tokens, respuestas correctas, datos del grupo o campos docentes en la respuesta pública;
- el cliente conserva el ID hasta obtener confirmación o reconciliar el estado.

### 38.5 Máquina de estados canónica

```text
draft_local
    ↓
draft_synced
    ↓
ready
    ↓
submitting ──timeout/red──> delivery_unknown
    ↓                           │
received <──── status check ────┘
    ↓
pending_teacher_review
    ↓
graded
```

Estados complementarios: `not_started`, `in_progress`, `reopened`, `invalid`, `storage_unavailable` y `superseded`.

`delivery_unknown` no significa que la entrega falló. Significa que el cliente debe consultar al servidor con el mismo ID. El sistema no permitirá que una etiqueta de interfaz se use como única fuente del estado real.

### 38.6 Flujo de envío del estudiante

1. Ejecutar preflight: sesión, identidad, inscripción, actividad, ventana, versión y disponibilidad del almacenamiento.
2. Guardar borrador local; en Writing también sincronizarlo con el servidor.
3. Crear o recuperar el ID de intento.
4. Validar lo necesario sin convertir recomendaciones pedagógicas en bloqueos accidentales.
5. Enviar una sola vez con `clientSubmissionId`.
6. Mostrar `Submitting` solo durante la petición activa.
7. Ante timeout, 429, 5xx o pérdida de respuesta, consultar estado antes de permitir otro intento.
8. Si existe, mostrar el mismo comprobante. Si no existe, reactivar el botón con el mismo ID.
9. Conservar una tarjeta permanente `Delivery received`.
10. Permitir copiar/descargar el comprobante y abrir `My submissions`.

El mensaje de error deberá explicar si se requiere reconexión, cambio de cuenta, espera, nuevo inicio o contacto docente. Nunca se borrará la producción como efecto de un error.

### 38.7 Experiencia de recepción docente

Teacher Activity Center incluirá una bandeja única con:

- estudiante, actividad, tipo, intento, fecha y comprobante;
- estados `Received`, `Pending review`, `Graded`, `Needs attention` y `Superseded`;
- filtros por unidad, actividad, evaluación, estado, fecha y estudiante;
- búsqueda por nombre, matrícula o comprobante;
- historial completo de intentos;
- vínculo entre evidencia, rúbrica y fila de Grades;
- alerta de entrega huérfana, proyección faltante o discrepancia;
- acción de reconciliación segura;
- rechazo de calificación si el comprobante ya no es el intento vigente;
- auditoría de quién calificó, cuándo y qué cambió.

La bandeja mostrará indicadores de salud: recibidas hoy, pendientes, no sincronizadas, errores recuperables y última reconciliación.

### 38.8 Fuente de verdad y almacenamiento

- La entrega es la fuente de verdad; Grades es una proyección.
- Los intentos forman un historial append-only. No se destruye evidencia previa al reintentar.
- Course 2 tendrá rutas y claves de almacenamiento exclusivas.
- Las escrituras serán atómicas, con archivo temporal, reemplazo seguro y backup.
- Entrega, evento de auditoría y actualización de proyección se ejecutarán bajo una operación controlada.
- Una reconciliación puede reconstruir Grades desde las entregas.
- Un `requestId` interno relacionará logs, entrega y comprobante sin registrar respuestas sensibles.
- Los errores de almacenamiento jamás devuelven `ok: true`.

### 38.9 Reglas específicas por evaluación

- **Midterm Writing y Final Writing:** autosave, recuperación de borrador, entrega aun si el texto está por debajo de la recomendación, y revisión docente.
- **Midterm Oral y Final Oral:** entrega parcial disponible, fallback escrito si falla el micrófono, navegación entre etapas, sin audio persistente por defecto.
- **Integrated Task:** validación de todas las secciones obligatorias, reproducción auditiva registrada, reintentos con historial y protección contra calificar un recibo anterior.
- **Prácticas formativas:** múltiples intentos, peso 0%, evidencia visible y separación del promedio oficial.
- **Mocks:** nunca escriben una evaluación oficial ni cambian el promedio.

La docente define el contenido y las actividades. Este plan define únicamente el comportamiento seguro de su entrega.

### 38.10 Matriz mínima de pruebas de extremo a extremo

Cada tipo de entregable se probará con:

- estudiante autorizado, no autenticado, no registrado, cuenta equivocada, docente y admin;
- Google, Microsoft personal, Microsoft institucional y usuario local cuando estén habilitados;
- celular 360/390/430 px, tableta, portátil y escritorio;
- conexión lenta, offline, timeout, 429, 500, 503 y respuesta perdida después de guardar;
- doble toque, refresh, back, pestañas duplicadas y reenvío del mismo payload;
- cambio de cuenta sin pérdida de borrador;
- cierre de la evaluación antes y después de iniciar;
- reintento legítimo y calificación de un recibo obsoleto;
- producción parcial, vacía, corta o de nota baja según la política;
- micrófono denegado, transcriptor no disponible y cambio de etapa;
- eliminación deliberada de la proyección para probar reconciliación;
- intento de leer rúbrica interna, datos de otro estudiante o audio;
- assets versionados para descartar caché antigua.

No se aprobará una evaluación solo porque el POST responda 200. La prueba debe verificar las tres superficies:

```text
Comprobante del estudiante = Bandeja docente = Estado en Grades
```

### 38.11 Observabilidad y alertas

El sistema registrará métricas sin respuestas académicas ni datos personales innecesarios:

- tasa de entregas confirmadas;
- timeouts y reconciliaciones;
- duplicados evitados;
- errores 401, 403, 409, 429 y 5xx;
- entregas sin proyección;
- tiempo entre recepción y aparición en bandeja;
- versión del cliente;
- estado del almacenamiento.

Se generará una alerta operativa si una entrega confirmada no aparece en la bandeja o en Grades dentro del tiempo esperado. La alerta incluye `requestId` y `receiptId`, nunca el contenido de la respuesta del estudiante.

### 38.12 Criterio de “entregable sin dificultad”

Un entregable estará listo para producción cuando:

- el estudiante puede iniciar, guardar, enviar y recuperar desde celular;
- ningún requisito meramente orientativo bloquea el envío;
- una falla de sesión o red no destruye trabajo;
- el botón nunca queda congelado;
- no se generan duplicados;
- todo éxito tiene comprobante;
- el docente puede encontrarlo por comprobante;
- Grades coincide o se repara automáticamente;
- un reintento conserva historia;
- la privacidad por rol está comprobada;
- todas las pruebas de la sección 38.10 pasan en el entorno previo a producción.

### 38.13 Orden de implementación

1. Crear el módulo compartido de sesión, preflight, timeout, idempotencia, reconciliación y comprobantes.
2. Crear el registro central de endpoints y políticas de entregables.
3. Implementar la fuente de entregas y el proyector hacia Grades.
4. Implementar `My submissions` y la bandeja docente.
5. Migrar primero una actividad formativa y someterla a la matriz completa.
6. Migrar Writing, Oral e Integrated Task reutilizando el mismo contrato.
7. Activar monitor de huérfanos y reconciliación.
8. Publicar evaluaciones únicamente después del ensayo completo con cuentas reales de prueba.

No se copiará el JavaScript histórico de cada examen como una solución independiente. Course 2 reutilizará un solo motor y añadirá políticas declarativas por actividad.

## Implementación confirmada — Pronunciation Unit 1: People Who Changed My Circle

La primera actividad de pronunciación de Course 2 toma como base funcional el laboratorio de Intermediate English Course 1: modelo profesional, control de velocidad, Shadow Mode, grabación por secciones, análisis de transcripción, resaltado de palabras, métricas de claridad y reto final. El contenido se adapta completamente a la Unidad 1: cláusulas relativas para personas, diferencia auditiva entre `who` y `that`, pausa de la cláusula no definitoria y expresiones de relaciones.

### Producto oral

- cuatro fragmentos breves antes del producto completo;
- cinco audios modelo generados oficialmente con ElevenLabs;
- práctica de `neighbor_who`, `that_I`, la pausa en `Iris, who...`, `get_back_in_touch`, `get_on_well` y `keep_in_touch`;
- grabación final: **People Who Changed My Circle**;
- banner profesional propio, compacto, no fijo y con recorte específico para celular;
- buscador por contenido y palabra clave al inicio de la actividad.

### Excepción explícita de entrega formativa

Esta actividad es entregable al profesor, pero queda deliberadamente fuera de `Intermediate English Grades`:

- no crea evaluación en la grilla;
- no escribe en `grades` ni en `gradeDetails`;
- no tiene nota de 1 a 5, peso cero ni porcentaje oculto;
- no afecta el promedio;
- usa una bandeja independiente con audio, transcripción, métricas formativas, fecha, intento y comprobante `JLF`;
- conserva varios intentos y aplica idempotencia mediante `clientSubmissionId` para evitar entregas duplicadas;
- ante una interrupción de red, el cliente consulta el comprobante antes de indicar fallo y permite reintentar sin duplicar;
- el estudiante ve el comprobante; el profesor autenticado ve la bandeja y puede cargar cada audio de forma protegida.

### Regla operativa aplicada

La actividad, su documentación, los modelos ElevenLabs, el catálogo, la recepción del profesor y los accesos desde Home/Course Overview forman una sola sección desplegable. Al finalizar se debe ejecutar validación sin servidor local, commit, push, despliegue y verificación directa en producción, conforme a la regla general de este plan.
