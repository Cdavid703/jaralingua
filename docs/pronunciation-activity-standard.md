# Estándar JaraLingua para actividades de pronunciación

Este documento es la fuente de referencia para crear, revisar o corregir cualquier actividad de pronunciación en JaraLingua. Antes de construir una actividad nueva, se debe comparar contra este patrón para que todas queden con la misma experiencia visual, pedagógica y técnica.

Actividad canónica de referencia:

- Francés Nivel 1: `frances/Niveau 1/ateliers/prononciation.html`
- Lógica Francés Nivel 1: `frances/Niveau 1/assets/pronunciation-a1.js`
- Patrón avanzado compartido: `assets/js/french8-pronunciation-sections.js`
- Patrón inglés básico: `assets/js/english-basic-pronunciation-unit1.js`

## Objetivo pedagógico obligatorio

Cada actividad debe permitir que el estudiante:

1. Escuche un modelo de pronunciación.
2. Lea un mini desafío corto.
3. Grabe su lectura.
4. Reciba una evaluación automática por mini desafío.
5. Vea qué palabras pronunció/reconoció bien y cuáles debe repetir.
6. Avance solamente cuando el mini desafío actual ya fue evaluado.
7. Termine con un desafío final que reúna las frases guiadas.

No se acepta una actividad de pronunciación que solo grabe audio sin evaluación palabra por palabra.

## Estructura visual obligatoria

Todas las páginas de pronunciación deben tener:

- Hero grande con imagen de fondo.
- Tarjeta visual en el hero cuando el diseño del nivel lo use.
- Bloque de navegación superior del nivel.
- Panel principal de práctica.
- Reproductor de voz modelo.
- Barra de progreso por mini desafíos.
- Texto a leer con palabras clicables.
- Selector de micrófono.
- Medidor de nivel del micrófono.
- Botón circular de grabación.
- Botón para terminar y evaluar.
- Botón para repetir el mini desafío.
- Botón para pasar a la siguiente sección, inicialmente deshabilitado.
- Audio de reproducción del estudiante.
- Área de transcripción.
- Panel lateral “Bilan de lecture” con puntaje y métricas.
- Panel de consejos de pronunciación.

## Elementos HTML requeridos

Cada actividad debe exponer estos IDs o sus equivalentes exactos si usa el patrón compartido:

```html
<audio id="modelAudio"></audio>
<button id="modelButton" type="button"></button>

<div id="stageCounter"></div>
<div id="stageTitle"></div>
<div id="stageProgress"></div>
<div id="readingText" lang="fr"></div>
<div id="wordHelp" hidden></div>

<select id="microphoneSelect"></select>
<i id="levelMeterBar"></i>
<b id="levelMeterValue"></b>

<button id="recordBtn" type="button"></button>
<button id="stopBtn" type="button" disabled></button>
<button id="retryBtn" type="button"></button>
<button id="nextBtn" type="button" disabled></button>

<p id="micStatus" aria-live="polite"></p>
<p id="recordHelp"></p>
<div id="micPermissionHelp" hidden></div>
<span id="timer">00:00</span>
<audio id="recordingPlayback" controls hidden></audio>
<div id="comparisonNote"></div>

<section id="results">
  <h2 id="resultTitle">Bilan de lecture</h2>
  <div id="scoreRing">
    <strong id="overallScore">0</strong>
  </div>
  <strong id="accuracyScore">0%</strong>
  <strong id="completenessScore">0%</strong>
  <strong id="fluencyScore">0%</strong>
  <div id="stageHistory" hidden></div>
  <div id="feedback"></div>
</section>
```

En las actividades que usan los scripts compartidos de inglés básico/intermedio o Francés 8, algunos elementos se crean por JavaScript, pero el resultado visual debe ser el mismo.

## Estados visuales obligatorios

Las palabras del texto deben usar estas clases:

```css
.reading-word.is-correct
.reading-word.is-missed
```

Comportamiento visual:

- `.is-correct`: fondo verde suave, texto verde oscuro.
- `.is-missed`: fondo rojo suave, texto rojo oscuro y subrayado ondulado.

El estudiante debe poder identificar rápidamente:

- qué palabras fueron reconocidas correctamente;
- qué palabras faltaron, fueron omitidas o no coincidieron con el texto esperado.

## Flujo funcional obligatorio

El flujo de una sección debe ser:

1. La página muestra el texto del mini desafío actual.
2. El estudiante puede escuchar el modelo.
3. El estudiante presiona el botón de micrófono.
4. El navegador pide permiso si todavía no lo tiene.
5. Se graba el audio.
6. El estudiante presiona “Terminer / Stop”.
7. El audio se envía al endpoint de transcripción.
8. La transcripción aparece en el área visible.
9. El sistema compara transcripción contra el texto esperado.
10. El sistema pinta palabras correctas y fallidas.
11. El sistema calcula puntaje por sección.
12. El botón “Section suivante / Next section” se habilita.

El botón de siguiente sección no debe estar habilitado antes de evaluar la sección actual.

## Evaluación obligatoria

Cada mini desafío debe calcular:

- `overall`: puntaje global sobre 100.
- `accuracy`: fidelidad entre texto esperado y texto reconocido.
- `completeness`: porcentaje de palabras esperadas reconocidas.
- `fluency`: ritmo aproximado según duración y cantidad de palabras.

El panel “Bilan de lecture” debe mostrar:

- puntaje global;
- porcentaje de fidelidad;
- porcentaje de completitud;
- porcentaje de ritmo;
- retroalimentación textual;
- historial por mini desafío.

## Comparación palabra por palabra

La comparación debe:

- normalizar mayúsculas/minúsculas;
- quitar puntuación;
- normalizar apóstrofos;
- normalizar acentos para comparar;
- conservar el texto original en pantalla;
- pintar el texto original, no una versión simplificada.

En francés, la normalización debe contemplar:

- `’` y `'`;
- tildes y acentos;
- `œ` → `oe`;
- `æ` → `ae`;
- signos como `« » , . ! ? : ;`.

## Micrófono y permisos

Todas las actividades deben:

- funcionar en HTTPS y localhost;
- bloquear el flujo en `file://`;
- mostrar instrucciones específicas si el micrófono está denegado;
- explicar cómo habilitar micrófono en Android, iPhone/iPad, Mac Safari y Chrome/Edge/Brave;
- usar selector de micrófono cuando el navegador lo permita;
- usar medidor visual de señal.

Configuración recomendada:

```js
const audioConstraints = {
  echoCancellation: { ideal: true },
  noiseSuppression: { ideal: true },
  autoGainControl: { ideal: true },
  channelCount: { ideal: 1 }
};
```

## Endpoints de transcripción

Los endpoints actuales son:

- Francés: `/api/french8/pronunciation-assessment`
- Inglés básico: `/api/english-basic/pronunciation-assessment`
- Inglés intermedio: `/api/english-intermediate/pronunciation-assessment`

Aunque Francés Nivel 1 use el endpoint francés existente, la actividad debe guardar su progreso con una clave propia de nivel/tema para no mezclar resultados.

Ejemplo:

```js
const STORAGE_KEY = `jaralingua:french1:pronunciation:${key}:v2`;
```

## Audios modelo

Cada mini desafío debe tener un audio modelo que coincida exactamente con el texto mostrado.

Regla obligatoria:

- Si el texto visible dice `Bonjour, je m’appelle Lina.`, el audio modelo de esa sección debe decir exactamente eso.
- No se puede reutilizar un audio de otra sección con texto diferente.
- El desafío final debe contener el texto completo de las secciones guiadas.

## Checklist antes de publicar

Antes de hacer commit o subir al VPS, verificar:

- [ ] El texto visible coincide con el audio modelo.
- [ ] Cada sección tiene evaluación individual.
- [ ] El botón siguiente inicia deshabilitado.
- [ ] El botón siguiente se habilita solo después de evaluar.
- [ ] Las palabras correctas se pintan en verde.
- [ ] Las palabras fallidas se pintan en rojo y subrayadas.
- [ ] El puntaje global aparece sobre 100.
- [ ] Las métricas muestran fidelidad, completitud y ritmo.
- [ ] La transcripción aparece después de terminar la grabación.
- [ ] El audio grabado por el estudiante queda reproducible.
- [ ] El permiso de micrófono muestra ayuda clara si falla.
- [ ] La página no tiene errores de consola.
- [ ] El JS pasa `node --check`.
- [ ] La página en producción carga el script con cache busting nuevo.

## Auditoría técnica recomendada

Para revisar las actividades activas:

```powershell
node --check "frances\Niveau 1\assets\pronunciation-a1.js"
node --check "assets\js\french8-pronunciation-sections.js"
node --check "assets\js\english-basic-pronunciation-unit1.js"
```

Y buscar que cada script tenga:

```text
transcribeAndEvaluate
function evaluate
is-correct
is-missed
overallScore
stageScores
```

## Regla de mantenimiento

Cuando se cree una nueva actividad de pronunciación:

1. Revisar este documento.
2. Copiar el patrón canónico más cercano.
3. Cambiar solo textos, audios, imágenes, tips y claves de almacenamiento.
4. No cambiar el flujo de evaluación sin actualizar este estándar.
5. Probar localmente.
6. Verificar producción después del despliegue.

Si una actividad no cumple este documento, se considera incompleta aunque visualmente cargue.
