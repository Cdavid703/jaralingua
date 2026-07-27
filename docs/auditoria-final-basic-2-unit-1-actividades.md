# Auditoría final - Basic English Course 2 - Unit 1: Going Out

Fecha: 2026-07-26  
Alcance: Course Overview Unit 1 + Practice Lab Unit 1 + 7 actividades.

## Resultado ejecutivo

Estado general: **APROBADO**.

La unidad está técnicamente estable: las páginas responden en producción, no hay errores JavaScript propios, no hay overflow horizontal en celular/tablet/desktop, los audios principales existen, los controles de velocidad requeridos en listening están implementados, las transcripciones de listening están ocultas para usuarios no administradores y el Video Listening ya tiene YouTube ID final.

## Actividades auditadas

| # | Actividad | Archivo | Estado |
| ---: | --- | --- | --- |
| 01 | Weather Call-Out Cards | `ingles/basico-2/practice-unit-1-weather-callout-cards.html` | Aprobada |
| 02 | -ing Spelling Rules | `ingles/basico-2/practice-unit-1-ing-spelling-rules.html` | Aprobada |
| 03 | Video Listening: Going Out or Staying In? | `ingles/basico-2/video-listening-unit-1-weather-going-out.html` | Aprobada |
| 04 | Audio Listening: Changing Plans Because of the Weather | `ingles/basico-2/audio-listening-unit-1-weather-plan-change.html` | Aprobada |
| 05 | Reading: A Rainy Afternoon Plan | `ingles/basico-2/reading-unit-1-rainy-afternoon-plan.html` | Aprobada |
| 06 | Pronunciation: Weather and Going Out | `ingles/basico-2/pronunciation-unit-1-weather-going-out.html` | Aprobada con validación manual pendiente |
| 07 | Conversation Coach: Mia's Weather Hangout | `ingles/basico-2/conversation-coach-unit-1-weather-going-out.html` | Aprobada con validación manual pendiente |

## Hallazgos críticos / bloqueantes

No quedan hallazgos críticos o bloqueantes abiertos.

### B1 - Video Listening sin YouTube ID final

- Severidad original: **bloqueante**.
- Estado: **resuelto el 2026-07-27**.
- Archivo: `ingles/basico-2/video-listening-unit-1-weather-going-out.html`.
- Corrección:
  - `youtubeVideoId = "qdWFQs4MD_Y"`.
  - Enlace fuente: `https://youtu.be/qdWFQs4MD_Y`.
  - El reproductor de YouTube reemplaza el estado pendiente.
  - Los controles de velocidad del video quedan disponibles cuando el reproductor está listo.

## Hallazgos graves

No se encontraron hallazgos graves técnicos propios de las actividades.

## Hallazgos medios

### M1 - Pronunciation y Conversation Coach requieren prueba manual con micrófono real

- Severidad: **media**.
- Archivos:
  - `ingles/basico-2/pronunciation-unit-1-weather-going-out.html`
  - `ingles/basico-2/conversation-coach-unit-1-weather-going-out.html`
- Evidencia:
  - La carga, layout y scripts pasan prueba automática.
  - El flujo de grabación/transcripción no puede validarse completamente sin una grabación humana real y permisos reales de micrófono.
- Impacto:
  - Bajo si el endpoint de transcripción sigue operativo.
  - Medio si el navegador, permiso de micrófono o cuenta del estudiante bloquea el envío/práctica.
- Acción requerida:
  - Hacer una prueba humana en producción:
    - grabar una respuesta;
    - verificar transcripción;
    - verificar feedback;
    - en Pronunciation, verificar envío al profesor con cuenta real de estudiante.

## Hallazgos menores

### m1 - Pronunciation tiene solo velocidad `0.75` y `1.0`

- Severidad: **menor**.
- Archivo: `ingles/basico-2/pronunciation-unit-1-weather-going-out.html`.
- Evidencia:
  - El modelo de pronunciación tiene botones `0.75` y `1.0`.
  - Listening y Conversation Coach sí tienen `0.75x`, `1.0x/1x`, `1.25x`.
- Impacto:
  - No bloquea la actividad.
  - Solo afecta consistencia si se decide estandarizar todos los reproductores con `1.25x`.
- Acción opcional:
  - Agregar `1.25` al reproductor de Pronunciation si se quiere uniformidad total.

### m2 - Endpoint `/csp-report` devuelve 404 en producción

- Severidad: **menor / sitio general**.
- Evidencia:
  - Chrome reporta `404 https://www.jaralingua.com/csp-report`.
  - No bloquea carga, interacción ni recursos de la unidad.
- Impacto:
  - No afecta al estudiante.
  - Puede ensuciar reportes técnicos del navegador.
- Acción opcional:
  - Crear endpoint o ajustar la política CSP para que el reporte no apunte a una ruta inexistente.

## Validaciones ejecutadas

### HTTP producción

Todos respondieron `200`:

- `https://jaralingua.com/ingles/basico-2/unit-1-going-out.html`
- `https://jaralingua.com/ingles/basico-2/practice-lab.html`
- `https://jaralingua.com/ingles/basico-2/practice-unit-1-weather-callout-cards.html`
- `https://jaralingua.com/ingles/basico-2/practice-unit-1-ing-spelling-rules.html`
- `https://jaralingua.com/ingles/basico-2/video-listening-unit-1-weather-going-out.html`
- `https://jaralingua.com/ingles/basico-2/audio-listening-unit-1-weather-plan-change.html`
- `https://jaralingua.com/ingles/basico-2/reading-unit-1-rainy-afternoon-plan.html`
- `https://jaralingua.com/ingles/basico-2/pronunciation-unit-1-weather-going-out.html`
- `https://jaralingua.com/ingles/basico-2/conversation-coach-unit-1-weather-going-out.html`

Audios principales también respondieron `200`:

- `audio/unit1/listening/weather-plan-change-listening.mp3`
- `audio/unit1/pronunciation/final-challenge-weather-going-out.mp3`
- `audio/unit1/conversation-coach/mia-welcome.mp3`

### Responsive producción

Probado con Chrome headless:

- `390x844`
- `768x1024`
- `1366x768`

Resultado:

- Sin overflow horizontal.
- Sin errores JavaScript propios.
- Sin elementos fijos visibles que tapen contenido al cargar.
- Conversation Coach muestra dock solo durante conversación activa.

### Interacciones mínimas

- Weather Cards:
  - 8 tarjetas.
  - 8 objetivos clicables de audio.
- -ing Spelling Rules:
  - opciones interactivas presentes.
  - feedback visible después de interacción.
- Video Listening:
  - quiz responde cuando falta contestar.
  - transcripción admin-only oculta para usuario normal.
  - video pendiente por falta de YouTube ID.
- Audio Listening:
  - cambio a `0.75x` actualiza `playbackRate`.
  - transcripción admin-only oculta para usuario normal.
  - quiz responde cuando falta contestar.
- Reading:
  - 10 preguntas.
  - quiz responde cuando falta contestar.
- Pronunciation:
  - audio modelo inicial presente.
  - panel de envío al profesor existe.
- Conversation Coach:
  - inicia conversación.
  - muestra una pregunta de Mia.
  - muestra dock de micrófono durante conversación.
  - 6 botones de velocidad visibles entre bienvenida y pregunta.

### Sintaxis JavaScript

Pasaron:

- `assets/js/english-basic2-pronunciation-unit1.js`
- `assets/js/conversation-coach-v2.js`
- `assets/js/conversation-coach-data/english-basic-2-unit-1-weather-going-out.js`
- `assets/js/transcript-pdf.js`
- `assets/js/google-auth.js`

## Cumplimiento pedagógico

La progresión de actividades queda coherente:

1. Reconocimiento y producción controlada de clima.
2. Formación de `-ing`.
3. Comprensión audiovisual.
4. Comprensión auditiva sin apoyo visual.
5. Comprensión lectora.
6. Pronunciación guiada.
7. Producción conversacional con feedback privado.

La unidad cubre:

- weather expressions;
- present continuous;
- simple present for habits/preferences;
- sports/activity verb patterns;
- going-out phrasal verbs;
- idioms connected to weather and plans.

## Cierre recomendado

Para cerrar formalmente la Unidad 1:

1. Probar Pronunciation con una cuenta real de estudiante y enviar el reporte 0%.
2. Probar Conversation Coach con micrófono real y una respuesta corta.
3. Si se quiere uniformidad total, agregar `1.25` al reproductor de Pronunciation.

Con el enlace de YouTube integrado, no quedan bloqueos técnicos abiertos en las actividades de la unidad.
