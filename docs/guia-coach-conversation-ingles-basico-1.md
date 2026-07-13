# Guía para implementar Unit Conversation Coach en Inglés Básico 1

Esta guía resume cómo construimos las actividades **Coach de conversation** de Francés Nivel 1 para replicar el mismo patrón en **Inglés Básico 1**.

Ruta de esta guía:

```text
D:\Jaralingua\docs\guia-coach-conversation-ingles-basico-1.md
```

Referencia base obligatoria:

```text
D:\Jaralingua\docs\standard-actividad-entrevista-oral-por-unidad.md
```

## 1. Principio general

Cada unidad debe tener una actividad oral breve, formativa y repetible. No es examen, no es quiz y no debe aparecer como evaluación oficial salvo que el usuario lo pida explícitamente.

Nombre recomendado para Inglés Básico 1:

```text
Unit Conversation Coach – Unit X: [Unit topic]
```

Ejemplos:

- Unit Conversation Coach – Unit 1: All About You
- Unit Conversation Coach – Unit 2: In Class
- Unit Conversation Coach – Unit 3: Favorite People
- Unit Conversation Coach – Unit 4: Everyday Life
- Unit Conversation Coach – Unit 5: Free Time
- Unit Conversation Coach – Unit 6: Neighborhoods

## 2. Flujo de trabajo obligatorio por unidad

Trabajar una unidad a la vez. No hacer lotes.

Antes de escribir código:

1. Revisar el contenido real de la unidad.
2. Revisar la página teórica de la unidad.
3. Revisar las actividades existentes en Practice Lab.
4. Proponer un plan pedagógico.
5. Esperar aprobación del usuario.

Después de aprobación:

1. Crear la imagen profesional de la actividad.
2. Crear la página HTML de la actividad.
3. Crear el archivo JS de datos de la unidad.
4. Crear los 8 audios de preguntas.
5. Crear `scripts.md` con las preguntas exactas.
6. Auditar los audios con Scribe.
7. Insertar la actividad en Practice Lab.
8. Verificar localmente.
9. Hacer commit.
10. Subir al VPS.
11. Verificar producción.

## 3. Estructura pedagógica

Cada actividad debe tener:

- 8 preguntas base.
- 4 preguntas por intento.
- Respuestas orales personales.
- Ayudas visibles para el estudiante:
  - sentence frames;
  - vocabulary bank;
  - grammar clue;
  - improved model answer.
- Micrófono y transcripción temporal con Whisper.
- Feedback formativo.
- Práctica de preguntas débiles.

Cada pregunta debe tener:

- `id`
- `unit`
- `topic`
- `text`
- `audio`
- `frames`
- `vocabulary`
- `grammar`
- `checks`
- `minWords`
- `maxSeconds`
- `improved`

## 4. Regla pedagógica más importante

Las preguntas deben salir exclusivamente del contenido de la unidad.

No se debe preguntar vocabulario, gramática o funciones comunicativas que todavía no se han enseñado.

Ejemplo correcto:

Unit 1: preguntar nombre, ciudad, país, ocupación, deletreo, información personal.

Ejemplo incorrecto:

Unit 1: preguntar direcciones para llegar a una biblioteca, porque eso pertenece a otra unidad.

## 5. Imagen obligatoria

Cada actividad debe tener una imagen profesional única.

No usar placeholders, rayas, bolas, tarjetas genéricas ni gráficos abstractos.

La imagen debe:

- ser realista o editorial premium;
- representar la situación comunicativa de la unidad;
- tener adultos, no niños;
- no tener texto legible;
- no tener logos;
- no tener marcas de agua;
- no tener manos o rostros deformes;
- quedar optimizada en WebP.

Ruta sugerida para Inglés Básico 1:

```text
ingles/basico/img/oral-practice/unit-X-coach.webp
```

Si el proyecto usa otra carpeta de imágenes para Inglés Básico 1, adaptar la ruta, pero mantener el nombre estable:

```text
unit-1-coach.webp
unit-2-coach.webp
unit-3-coach.webp
```

Prompt base recomendado:

```text
Use case: photorealistic-natural
Asset type: website hero card for a Basic English oral conversation activity
Primary request: A professional, realistic educational scene for a beginner English activity about [unit topic].
Scene/backdrop: [realistic classroom / café / home / neighborhood / daily routine setting].
Subject: diverse adult English learners practicing oral conversation with a teacher; one learner speaks, another listens or takes notes.
Style/medium: polished editorial photography, realistic, premium e-learning website asset.
Composition/framing: wide landscape 16:9, suitable for a large website hero and activity card; leave clean negative space on the left.
Lighting/mood: warm natural daylight, inviting, calm, academic, practical.
Color palette: deep navy accents, soft red accents, warm neutrals, subtle blue notebooks or learning materials.
Constraints: no logos, no watermarks, no readable text, no distorted faces or hands, no childish cartoon style, no abstract placeholder shapes.
Avoid: fake UI screens, random typography, brand labels, duplicated faces, strange hands, low-quality stock-photo feeling.
```

## 6. Audios ElevenLabs

Cada pregunta debe tener un audio profesional separado.

Reglas:

- Un archivo por pregunta.
- El audio debe decir exactamente la pregunta visible.
- No agregar frases como “Question one” si la página solo muestra la pregunta.
- No regenerar toda la tanda si solo falla un audio.
- Si Scribe detecta diferencia real, corregir solo el audio afectado.
- Si la diferencia es puntuación no sonora, ajustar auditoría, no gastar créditos.

Ruta sugerida:

```text
ingles/basico/audio/oral-practice/unit-X/question-01.mp3
ingles/basico/audio/oral-practice/unit-X/question-02.mp3
...
ingles/basico/audio/oral-practice/unit-X/scripts.md
```

El archivo `scripts.md` debe contener:

```markdown
# Scripts audio · Unit Conversation Coach · Unit X

## question-01.mp3

Interviewer: [exact question]
```

## 7. Auditoría Scribe

La actividad no se considera terminada hasta que la auditoría Scribe esté en 8/8.

Resultado esperado:

```text
OK question-01.mp3
OK question-02.mp3
OK question-03.mp3
OK question-04.mp3
OK question-05.mp3
OK question-06.mp3
OK question-07.mp3
OK question-08.mp3
```

Si Scribe oye otra palabra:

1. Revisar si cambia el sentido.
2. Si cambia el sentido, reformular o regenerar solo ese audio.
3. Si no cambia el sentido y es puntuación/guion/apóstrofo, normalizar auditoría.

## 8. Archivos de datos

Patrón usado en Francés Nivel 1:

```text
assets/js/oral-unit-practice-data/french-level-1-unit-X.js
```

Patrón recomendado para Inglés Básico 1:

```text
assets/js/oral-unit-practice-data/english-basic-1-unit-X.js
```

El archivo debe declarar:

```javascript
window.JaraLinguaOralUnitConfig = {
  apiPath: "/api/french8/pronunciation-assessment",
  storageKey: "jaralingua:english-basic-1:oral-unit-X:v1",
  language: "en",
  courseLabel: "English · Basic 1",
  unitLabel: "Unit X",
  title: "Unit Conversation Coach – Unit X: ...",
  interviewer: {
    name: "Alex",
    role: "Conversation Coach"
  },
  attemptQuestionCount: 4,
  maxRecordingSeconds: 30,
  unitContext: {},
  questions: []
};
```

Nota: confirmar el `apiPath` real antes de implementar en Inglés Básico 1. Si ya existe endpoint de pronunciación/Whisper para inglés, usar ese. No cambiarlo a ciegas.

## 9. Página HTML

Patrón recomendado:

```text
ingles/basico/unit-conversation-coach-unit-X.html
```

También es válido usar una subcarpeta si el Practice Lab ya organiza las actividades así:

```text
ingles/basico/practice/unit-conversation-coach-unit-X.html
```

La página debe:

- usar el mismo motor compartido `oral-unit-practice-engine.js`;
- cargar el archivo de datos de la unidad;
- mostrar hero grande con la imagen profesional;
- tener botón de regreso al Practice Lab;
- mantener login/panel global si el nivel lo tiene;
- incluir course switcher si aplica;
- mantener comportamiento móvil correcto.

## 10. Inserción en Practice Lab

Cada unidad debe mostrar su actividad en el listado del Practice Lab.

La tarjeta debe incluir:

- imagen propia;
- título: `Unit Conversation Coach`;
- categoría: `Oral interaction` o equivalente;
- enlace directo a la página.

No dejar la actividad escondida solo por URL.

## 11. Verificación local

Antes del commit, verificar:

- página HTML responde 200;
- JS de datos responde 200;
- imagen WebP responde 200;
- los 8 audios responden 200;
- Practice Lab responde 200;
- `node --check` del archivo JS de datos;
- `node --check` del motor si fue tocado.

Patrón de verificación usado:

```text
200 unit-conversation-coach-unit-X.html
200 english-basic-1-unit-X.js
200 unit-X-coach.webp
200 question-01.mp3
...
200 question-08.mp3
```

## 12. Commit y despliegue

Después de validar:

1. `git add` solo de los archivos de esa unidad.
2. `git commit -m "Add English Basic 1 unit X conversation coach"`
3. Subir al VPS.
4. Verificar producción con HTTP 200.

No incluir carpetas temporales como:

```text
tmp-preview/
```

## 13. Criterio de aceptación por unidad

Una unidad está lista solo si cumple todo esto:

- El plan fue aprobado.
- La actividad está en Practice Lab.
- La imagen es profesional y única.
- Hay 8 preguntas.
- Hay 8 audios.
- `scripts.md` coincide con las preguntas.
- Scribe devuelve 8/8 OK.
- La página carga localmente.
- Producción responde 200.
- Hay commit.
- El VPS tiene la versión actual.

## 14. Lección aprendida

No improvisar con audios.

Si una pronunciación o transcripción sale mal:

- no generar una tanda completa si solo falló un archivo;
- no “arreglar” lo que ya funciona;
- reformular la frase si el TTS confunde una estructura;
- auditar de nuevo antes de publicar.

## 15. Cómo continuar en Inglés Básico 1

Para cada unidad de Inglés Básico 1, abrir primero:

```text
D:\Jaralingua\docs\standard-actividad-entrevista-oral-por-unidad.md
D:\Jaralingua\docs\guia-coach-conversation-ingles-basico-1.md
```

Luego revisar el contenido real de la unidad y proponer el plan antes de crear archivos.
