# Estándar JaraLingua para prácticas orales guiadas por unidad

**Nombre oficial del modelo:** Unit Conversation Coach / Coach de conversation  
**Tipo:** actividad formativa, oral, interactiva y no calificable por defecto  
**Aplicación:** unidades de inglés y francés de JaraLingua  
**Estado:** estándar aprobado  
**Última actualización:** 12 de julio de 2026

## 1. Propósito

Este documento define el estándar pedagógico, técnico y visual para construir actividades breves de conversación oral dentro de cada unidad de los cursos de inglés y francés.

Cada actividad debe permitir que el estudiante:

1. Escuche una pregunta profesional en el idioma estudiado.
2. Consulte estructuras de respuesta, vocabulario y una pista gramatical.
3. Responda mediante el micrófono con información propia.
4. Obtenga una transcripción temporal con Whisper local.
5. Reciba retroalimentación formativa inmediata.
6. Complete un informe final específico de la unidad.
7. Practique nuevamente toda la actividad o solo sus preguntas más débiles.

Estas actividades no reemplazan los exámenes orales finales. Son prácticas sencillas y repetibles para preparar gradualmente la producción oral.

## 2. Nombre y presentación

### Inglés

Nombre general:

> **Unit Conversation Coach**

Ejemplos:

- Unit 1 Conversation Coach: All About You
- Unit 2 Conversation Coach: In Class
- Unit 3 Conversation Coach: Favorite People
- Unit 4 Conversation Coach: Everyday Life
- Unit 5 Conversation Coach: Free Time
- Unit 6 Conversation Coach: Neighborhoods

### Francés

Nombre general:

> **Coach de conversation – Unité X**

Ejemplos:

- Coach de conversation – Unité 1 : Se présenter
- Coach de conversation – Unité 2 : La vie quotidienne
- Coach de conversation – Unité 3 : Parler de sa famille

El nombre no debe utilizar palabras como *exam*, *quiz*, *test* o *évaluation* cuando se trate de una práctica formativa.

## 3. Actividad canónica de referencia

El primer modelo completo del sistema se encuentra en:

```text
ingles/basico/final-oral-interview-mock.html
assets/css/english-basic-final-oral-mock.css
assets/js/english-basic-final-oral-mock.js
ingles/basico/audio/final-oral-mock/
tools/generate_basic_final_oral_mock_audio.ps1
tools/test_basic_final_oral_mock.js
```

Ese simulacro sirve como referencia para:

- flujo secuencial;
- micrófono;
- transcripción;
- audios profesionales;
- ayudas lingüísticas;
- evaluación formativa;
- historial de intentos;
- práctica adaptativa;
- informe final;
- comportamiento responsive.

Las actividades por unidad deben utilizar una arquitectura compartida más compacta y no copiar innecesariamente todo el código del simulacro.

## 4. Diferencias con el simulacro final

| Simulacro oral integral | Unit Conversation Coach |
|---|---|
| Integra todas las unidades | Practica una sola unidad |
| Banco de aproximadamente 15 preguntas | Banco de 6 a 8 preguntas |
| Siete preguntas por intento | Cuatro preguntas por intento |
| Informe integral del curso | Informe específico de la unidad |
| Selección equilibrada por unidades | Selección equilibrada por temas de la unidad |
| Aproximadamente 3 a 5 minutos | Aproximadamente 2 a 4 minutos |

## 5. Fuente pedagógica obligatoria

Antes de escribir preguntas se debe revisar:

- guía descriptiva o pacing guide del curso;
- página explicativa de la unidad;
- gramática enseñada;
- vocabulario enseñado;
- funciones comunicativas;
- pronunciación trabajada;
- situaciones comunicativas propuestas;
- actividades existentes en Practice Lab, Ateliers o Activités.

No basta con cambiar el número o título de la unidad.

Cada archivo de configuración debe declarar su contexto:

```javascript
unitContext: {
  course: "Basic English Course 1",
  unit: 1,
  title: "All About You",
  grammar: [
    "verb to be",
    "subject pronouns",
    "basic WH questions"
  ],
  vocabulary: [
    "countries",
    "cities",
    "occupations",
    "alphabet",
    "personal information"
  ],
  communicativeGoals: [
    "introduce yourself",
    "ask for a name",
    "spell a name",
    "say where you are from",
    "say what you do"
  ]
}
```

Las preguntas deben salir exclusivamente de ese contexto.

## 6. Ejemplos de correspondencia por unidad

### Basic English Unit 1

Debe practicar:

- saludos;
- nombre y apellido;
- deletreo;
- país y ciudad;
- ocupación;
- información personal básica.

No debe preguntar cómo llegar a una biblioteca, porque las direcciones pertenecen a otra unidad.

### Basic English Unit 2

Debe practicar:

- objetos del aula;
- this, that, these y those;
- ubicación;
- posesión;
- whose;
- preguntas básicas relacionadas con el aula.

### Basic English Unit 3

Debe practicar:

- familia;
- personas favoritas;
- apariencia;
- personalidad;
- he y she;
- tercera persona básica.

### Basic English Unit 4

Debe practicar:

- rutinas;
- horas;
- hábitos;
- frecuencia;
- secuencia de actividades.

### Basic English Unit 5

Debe practicar:

- tiempo libre;
- televisión;
- preferencias;
- actividades después de clase;
- going out y staying in.

### Basic English Unit 6

Debe practicar:

- lugares de la ciudad;
- barrios;
- there is y there are;
- preposiciones de lugar;
- recomendaciones;
- instrucciones y direcciones.

En francés se aplicará el mismo criterio, utilizando los temas reales de cada unidad y nivel.

## 7. Estructura pedagógica de la actividad

Cada actividad tendrá:

- banco de 6 a 8 preguntas;
- cuatro preguntas por intento;
- preguntas sin repetición dentro del mismo intento;
- selección representativa de los subtemas de la unidad;
- una pregunta adicional adaptativa cuando sea necesario;
- audios profesionales diferentes;
- dos estructuras de respuesta por pregunta;
- Vocabulary Bank o Banque de vocabulaire;
- Grammar Clue o Indice grammatical;
- límite de tiempo adaptado;
- reglas de evaluación específicas;
- modelo mejorado de respuesta;
- informe final;
- práctica de las dos preguntas más débiles;
- intentos ilimitados.

## 8. Flujo del estudiante

1. Abrir la actividad desde la carpeta de la unidad.
2. Leer las instrucciones breves.
3. Probar el micrófono de manera opcional.
4. Iniciar la práctica.
5. Escuchar una pregunta.
6. Consultar las ayudas cuando sea necesario.
7. Grabar una respuesta.
8. Finalizar la grabación.
9. Esperar la transcripción.
10. Revisar la transcripción y el feedback.
11. Repetir la respuesta o continuar.
12. Completar las cuatro preguntas.
13. Revisar el informe final.
14. Repetir toda la actividad o practicar las preguntas débiles.

La página nunca debe mostrar todas las preguntas simultáneamente.

## 9. Esquema obligatorio de cada pregunta

```javascript
{
  id: "u1q1",
  unit: 1,
  topic: "Personal information",
  text: "What's your name, and where are you from?",
  audio: "audio/oral-practice/unit-1/question-01.mp3",

  frames: [
    "My name is ______, and I'm from ______.",
    "Hello! I'm ______. I live in ______."
  ],

  vocabulary: [
    "my name is",
    "I'm from",
    "I live in",
    "city",
    "neighborhood",
    "student"
  ],

  grammar: "Use I am or I'm for personal information.",

  checks: [
    {
      label: "an introduction",
      terms: ["my name", "I am", "I'm"]
    },
    {
      label: "place of origin",
      terms: ["from"]
    }
  ],

  minWords: 5,
  maxSeconds: 20,

  improved:
    "Hello! My name is [name]. I'm from [city], and I live in [place]."
}
```

Cuando una pregunta pida dos objetos, dos lugares o varios elementos, la evaluación debe exigir esa cantidad mediante `minMatches` o una regla equivalente.

## 10. Ayudas lingüísticas

No se acepta mostrar únicamente una oración con espacios en blanco.

Cada pregunta debe incluir:

### 10.1 Dos estructuras

Las estructuras deben ofrecer caminos distintos para responder sin obligar al estudiante a memorizar una frase exacta.

### 10.2 Banco de vocabulario

Debe contener entre 6 y 10 palabras o expresiones directamente relacionadas con la pregunta.

Ejemplo para rutinas:

- wake up;
- get dressed;
- take a shower;
- have breakfast;
- go to work;
- go to class;
- then;
- after that.

Ejemplo para direcciones:

- go straight;
- turn left;
- turn right;
- cross the street;
- go past;
- next to;
- across from;
- on your left.

### 10.3 Pista gramatical

Debe ser breve, específica y útil.

Ejemplos:

> Use I + base verb: I get up. I have breakfast.

> Use He/She + verb-s: She works. He likes music.

En francés se utilizarán instrucciones equivalentes en francés.

### 10.4 Visibilidad

- Las ayudas aparecen automáticamente durante el primer intento.
- En intentos posteriores permanecen inicialmente ocultas.
- El estudiante puede abrirlas mediante **I need help** o **J’ai besoin d’aide**.
- Consultar una ayuda no produce penalización.

No debe existir un bloque de ayuda en español dentro de la actividad dirigida al estudiante.

## 11. Arquitectura compartida

Para evitar duplicación, se recomienda esta estructura:

```text
assets/
├── css/
│   └── oral-unit-practice.css
└── js/
    ├── oral-unit-practice-engine.js
    └── oral-unit-practice-data/
        ├── english-basic-unit-1.js
        ├── english-basic-unit-2.js
        ├── french-level-1-unit-1.js
        └── ...
```

El motor compartido debe encargarse de:

- selección de preguntas;
- reproducción de audio;
- velocidades;
- micrófono;
- grabación;
- transcripción;
- evaluación;
- persistencia local;
- informe;
- historial;
- práctica adaptativa.

Cada archivo de datos se encargará de:

- contenido de la unidad;
- preguntas;
- estructuras;
- vocabulario;
- gramática;
- reglas de feedback;
- imágenes;
- audios;
- textos de interfaz propios del idioma.

## 12. Convenciones de nombres

### Inglés

```text
ingles/basico/oral-practice-unit-1-all-about-you.html
ingles/basico/audio/oral-practice/unit-1/
assets/js/oral-unit-practice-data/english-basic-unit-1.js
assets/img/english-basic/oral-practice/unit-1-conversation-coach.webp
```

### Francés

```text
frances/Niveau 1/ateliers/pratique-orale-unite-1.html
frances/Niveau 1/audio/pratique-orale/unite-1/
assets/js/oral-unit-practice-data/french-level-1-unit-1.js
frances/Niveau 1/img/pratique-orale/unite-1-coach.webp
```

## 13. Audios profesionales

Reglas obligatorias:

- un audio diferente por pregunta;
- no utilizar `speechSynthesis` ni voces del navegador;
- generar con ElevenLabs u otra herramienta profesional aprobada;
- el audio debe coincidir exactamente con el texto visible;
- usar transiciones naturales;
- evitar etiquetas de hablante pronunciadas accidentalmente;
- auditar los audios con Whisper antes de publicar;
- guardar los guiones en Markdown;
- incluir velocidades 0.75× y 1×;
- no incluir 1.5× en actividades básicas;
- permitir repetir la pregunta en una práctica formativa.

Perfiles recomendados:

- inglés: inglés estadounidense;
- francés: Francia o Quebec según la política y el nivel del curso.

## 14. Micrófono y compatibilidad

La actividad debe reutilizar el estándar de permisos de JaraLingua.

Debe incluir:

- `navigator.mediaDevices.getUserMedia`;
- `MediaRecorder`;
- selector de micrófono cuando sea posible;
- medidor de señal;
- detección de audio silencioso;
- liberación del micrófono después de cada respuesta;
- mensajes específicos de error;
- recuperación del progreso;
- HTTPS obligatorio en producción.

Formatos:

- WebM/Opus para Android, Windows, Mac y navegadores compatibles;
- MP4 como alternativa para Safari, iPhone y iPad.

Configuración recomendada:

```javascript
{
  echoCancellation: { ideal: true },
  noiseSuppression: { ideal: true },
  autoGainControl: { ideal: true },
  channelCount: { ideal: 1 }
}
```

## 15. Evaluación formativa

Ponderación recomendada:

- respuesta a la tarea: 30%;
- desarrollo de la respuesta: 25%;
- claridad aproximada: 30%;
- fluidez: 15%.

El resultado debe llamarse:

> **Practice Readiness Score**

En francés:

> **Score de préparation orale**

Siempre debe mostrarse una advertencia:

> This is an automatic practice result, not an official course grade.

En francés:

> Ceci est un résultat automatique d’entraînement, et non une note officielle.

## 16. Pronunciación y confianza de Whisper

Whisper entrega una probabilidad de reconocimiento por palabra. Esa probabilidad puede verse afectada por:

- pronunciación;
- ruido;
- distancia del micrófono;
- volumen;
- nombres propios;
- acento;
- segmentación del modelo.

Por eso no se debe afirmar categóricamente que una palabra está mal pronunciada.

Etiquetas aprobadas:

- **Words to pronounce more clearly**;
- **Mots à prononcer plus clairement**.

Solo deben mostrarse palabras con confianza realmente baja. El informe debe aclarar que no se trata de un diagnóstico fonético definitivo.

## 17. Informe final

El informe debe incluir:

- resultado general sobre 100;
- indicador de preparación;
- resultado por pregunta;
- transcripción;
- respuesta a la tarea;
- desarrollo;
- claridad;
- fluidez;
- palabras con confianza baja;
- modelo mejorado;
- fortalezas;
- prioridades;
- comparación con el intento anterior;
- mejor resultado personal;
- historial reciente;
- botón para repetir toda la actividad;
- botón para practicar las dos preguntas más débiles.

La práctica de preguntas débiles no debe reemplazar ni alterar el historial de intentos completos.

## 18. Persistencia y privacidad

Por defecto:

- el audio se procesa temporalmente;
- el audio no se guarda;
- el resultado no se envía al profesor;
- el resultado no entra en Grades;
- el historial permanece en el dispositivo;
- los intentos son ilimitados.

Una actividad calificable debe declararlo expresamente y utilizar un endpoint y una grilla autorizados. No se debe convertir una práctica formativa en calificable de manera implícita.

## 19. Estándar visual obligatorio

Toda actividad debe conservar la identidad visual del curso donde se implementa.

No se acepta una página genérica sin adaptación visual o pedagógica.

### 19.1 Header

Debe reutilizar el header del curso correspondiente e incluir, según aplique:

- logo de JaraLingua;
- Home;
- idioma;
- nivel o curso;
- Course Overview o equivalente;
- Practice Lab, Ateliers o Activités;
- menú flotante Courses;
- sistema de autenticación cuando el curso lo utilice.

No se deben cambiar arbitrariamente colores, tamaños, tipografía o distribución.

### 19.2 Hero o banner

Debe incluir:

- eyebrow con curso y unidad;
- título de la actividad;
- explicación breve;
- duración y modalidad;
- botón para iniciar;
- botón para regresar;
- imagen profesional;
- tratamiento de fondo coherente con el curso.

Ejemplo:

> Basic English Course 1 · Unit 1  
> Unit Conversation Coach: All About You  
> Practice introductions, names, spelling, countries, occupations, and personal information.

### 19.3 Imagen única por actividad

Cada actividad debe tener una imagen profesional diferente.

No se permite:

- reutilizar una imagen de otra actividad;
- reutilizar una imagen de otra unidad;
- utilizar círculos, barras o figuras abstractas como imagen principal;
- utilizar una imagen genérica sin relación con la tarea;
- colocar texto generado dentro de la imagen;
- utilizar capturas de pantalla como banner;
- utilizar imágenes de baja resolución;
- utilizar ilustraciones improvisadas cuando se exige una imagen profesional.

La imagen debe guardarse optimizada en WebP.

Una actividad puede utilizar su propia imagen en la tarjeta de Practice Lab y en su hero, pero dos actividades diferentes no deben compartir la misma imagen.

### 19.4 Relación entre imagen y contenido

La escena debe representar la función comunicativa de la unidad.

#### Unit 1

Dos estudiantes adultos conociéndose en una actividad de bienvenida e intercambiando información personal.

#### Unit 2

Estudiantes adultos dentro de un aula moderna, señalando objetos y explicando ubicaciones.

#### Unit 3

Un estudiante mostrando una fotografía familiar o describiendo a una persona importante.

#### Unit 4

Una situación realista relacionada con rutinas, horarios o hábitos saludables.

#### Unit 5

Personas conversando sobre música, deportes, películas, televisión o planes de tiempo libre.

#### Unit 6

Personas observando un mapa urbano, describiendo un barrio o dando instrucciones.

En francés, el brief visual debe construirse a partir de los temas reales de la unidad.

### 19.5 Ficha visual

```javascript
visual: {
  heroImage: "../../assets/img/english-basic/oral-practice/unit-1-conversation-coach.webp",
  cardImage: "../../assets/img/english-basic/oral-practice/unit-1-conversation-coach.webp",
  alt: "Two adult English learners introducing themselves during a welcome activity",
  focalPointDesktop: "center 42%",
  focalPointMobile: "center center",
  scene: "Adult learners meeting and exchanging personal information",
  uniqueAsset: true
}
```

## 20. Diseño responsive obligatorio

La actividad debe funcionar en:

- celulares verticales;
- celulares horizontales;
- tabletas verticales;
- tabletas horizontales;
- portátiles;
- monitores de escritorio.

### 20.1 Celular

- ancho de referencia: 360 a 430 px;
- hero en una columna;
- imagen debajo del texto cuando sea necesario;
- botones principales de ancho completo;
- controles táctiles de mínimo 48 px;
- tarjetas de respuesta en una columna;
- Vocabulary Bank con salto de línea;
- métricas en una o dos columnas;
- campos y selectores con fuente mínima de 16 px;
- ninguna palabra debe quedar dispuesta verticalmente.

### 20.2 Tableta vertical

- referencia: aproximadamente 768 × 1024;
- panel de entrevista en una columna;
- barra lateral debajo de la actividad;
- imágenes legibles;
- tarjetas y formularios sin compresión excesiva.

### 20.3 Tableta horizontal y portátil pequeño

- referencia: aproximadamente 1024 × 768;
- header sin cubrir contenido;
- grillas sin comprimir palabras;
- botones de audio completos;
- panel de entrevista aprovechando el ancho;
- ningún desplazamiento horizontal.

### 20.4 Portátil y escritorio

- referencia: 1280 px en adelante;
- panel principal más barra lateral cuando el diseño lo permita;
- hero amplio;
- líneas de texto con ancho máximo razonable;
- imagen con proporción profesional.

### 20.5 Puntos de quiebre recomendados

```css
@media (max-width: 980px) {
  /* Tablet and small laptop */
}

@media (max-width: 760px) {
  /* Vertical tablet and large phone */
}

@media (max-width: 520px) {
  /* Mobile */
}
```

### 20.6 Reglas contra desbordamiento

```css
* {
  box-sizing: border-box;
}

body {
  overflow-x: hidden;
}

img,
audio,
video {
  max-width: 100%;
}

.grid-item,
.card,
.panel {
  min-width: 0;
}
```

También se debe utilizar:

- `overflow-wrap: anywhere` en transcripciones;
- `height: auto` en imágenes;
- `minmax(0, 1fr)` en grillas;
- controles sin anchos fijos peligrosos;
- audios ajustados al contenedor;
- selectores de micrófono ajustables.

## 21. Accesibilidad

La actividad debe incluir:

- texto alternativo específico;
- botones con nombre accesible;
- `aria-live` para estados y transcripciones;
- contraste suficiente;
- foco visible;
- controles accesibles mediante teclado;
- soporte para `prefers-reduced-motion`;
- orden lógico de lectura;
- instrucciones comprensibles en el idioma estudiado.

## 22. Integración en navegación

Cada actividad debe aparecer:

- dentro de la carpeta correcta de Practice Lab, Ateliers o Activités;
- con tarjeta propia;
- con imagen única;
- con título y descripción coherentes;
- con numeración actualizada;
- en la portada del curso solamente cuando su importancia lo justifique.

La cantidad de actividades mostrada en la carpeta debe actualizarse.

## 23. Orden recomendado de implementación

1. Crear el motor compartido.
2. Construir Basic English Unit 1 como piloto.
3. Revisar contenido, audio, micrófono, informe y responsive.
4. Corregir el motor compartido.
5. Implementar Basic English Units 2 a 6.
6. Implementar inglés intermedio.
7. Implementar progresivamente los niveles de francés.
8. Mantener un archivo de datos distinto por unidad.

No se recomienda construir todas las unidades mediante copias independientes antes de validar el piloto.

## 24. Procedimiento de construcción

1. Leer la guía y la página explicativa.
2. Definir objetivos comunicativos.
3. Crear banco de preguntas.
4. Crear estructuras, vocabulario y pistas.
5. Definir reglas de evaluación.
6. Escribir guiones de audio.
7. Generar audios profesionales.
8. Auditar audio contra guion.
9. Crear imagen profesional única.
10. Construir configuración de la unidad.
11. Crear página con header y hero del curso.
12. Integrar motor compartido.
13. Probar micrófono y transcripción.
14. Probar informe e historial.
15. Probar práctica de debilidades.
16. Probar responsive.
17. Ejecutar pruebas automatizadas.
18. Hacer commit.
19. Desplegar.
20. Verificar producción.

## 25. Checklist pedagógico

- [ ] La actividad corresponde exclusivamente a la unidad.
- [ ] Se revisó la guía oficial.
- [ ] Se revisó la página explicativa.
- [ ] Hay 6 a 8 preguntas.
- [ ] Se seleccionan cuatro por intento.
- [ ] No se repiten preguntas.
- [ ] Los subtemas están equilibrados.
- [ ] Cada pregunta tiene dos estructuras.
- [ ] Cada pregunta tiene vocabulario útil.
- [ ] Cada pregunta tiene una pista gramatical.
- [ ] Cada pregunta tiene reglas específicas.
- [ ] Cada pregunta tiene un modelo mejorado.
- [ ] La dificultad corresponde al nivel.

## 26. Checklist técnico

- [ ] El micrófono funciona bajo HTTPS.
- [ ] Existe selector de micrófono cuando es compatible.
- [ ] Existe medidor de señal.
- [ ] WebM está soportado.
- [ ] MP4 está soportado para Safari/iPhone.
- [ ] El audio se libera al terminar.
- [ ] La transcripción aparece.
- [ ] Un error no borra respuestas anteriores.
- [ ] El progreso se recupera.
- [ ] El informe calcula las métricas.
- [ ] El historial funciona.
- [ ] La práctica débil no altera el historial completo.
- [ ] El JavaScript pasa `node --check`.
- [ ] Existe prueba automatizada.
- [ ] Los recursos responden con HTTP 200.
- [ ] Se actualizó el cache busting.

## 27. Checklist visual

- [ ] Header correspondiente al curso.
- [ ] Navegación completa.
- [ ] Hero profesional.
- [ ] Banner con imagen única.
- [ ] Imagen relacionada con la situación comunicativa.
- [ ] Imagen optimizada en WebP.
- [ ] Texto alternativo específico.
- [ ] Tarjeta visible en la carpeta correcta.
- [ ] Ninguna imagen reciclada.
- [ ] Prueba en celular vertical.
- [ ] Prueba en celular horizontal.
- [ ] Prueba en tableta vertical.
- [ ] Prueba en tableta horizontal.
- [ ] Prueba en portátil.
- [ ] Prueba en escritorio.
- [ ] Sin desplazamiento horizontal.
- [ ] Sin palabras dispuestas verticalmente.
- [ ] Micrófono usable mediante pantalla táctil.
- [ ] Audios y botones ajustados.
- [ ] Transcripción sin romper el diseño.
- [ ] Informe final responsive.

## 28. Definición de terminado

Una actividad Unit Conversation Coach se considera terminada únicamente cuando:

1. Cumple la guía pedagógica de la unidad.
2. Tiene preguntas, vocabulario, gramática y modelos propios.
3. Tiene audios profesionales auditados.
4. Tiene una imagen profesional única.
5. Funciona con micrófono y Whisper.
6. Produce feedback honesto y formativo.
7. Produce informe final.
8. Permite reintentos y práctica de debilidades.
9. Es responsive en celular, tableta y portátil.
10. Está integrada en la navegación.
11. Pasa pruebas locales.
12. Pasa verificación en producción.

Una página no se considera terminada únicamente porque cargue o porque visualmente se parezca a otra actividad.

## 29. Mantenimiento

Cuando se modifique el motor compartido:

1. Probar al menos una actividad de inglés y una de francés.
2. Verificar que no cambien los datos de otras unidades.
3. Mantener compatibilidad con intentos guardados cuando sea razonable.
4. Actualizar el cache busting.
5. Actualizar este documento cuando cambie el estándar.

Las excepciones deben documentarse dentro del archivo de configuración de la unidad y no convertirse silenciosamente en un nuevo estándar.

## 30. Regla operativa obligatoria para nuevas unidades

Cada nueva actividad **Unit Conversation Coach / Coach de conversation** debe construirse como una pieza completa de la unidad que se está trabajando. No se acepta publicar una actividad oral con imagen provisional, imagen reciclada o sin despliegue.

### 30.1 Imagen profesional obligatoria

Para cada actividad se debe crear una imagen profesional única y relacionada con la situación comunicativa de la unidad.

La imagen debe cumplir obligatoriamente:

- representar la función comunicativa de la unidad;
- mostrar una escena realista, académica y profesional;
- evitar texto dentro de la imagen;
- evitar logos, marcas de agua o capturas de pantalla;
- no reciclar imágenes de otra unidad, otro tema u otra actividad;
- funcionar como hero/banner y como tarjeta de actividad;
- dejar espacio visual para texto superpuesto cuando se use en hero;
- guardarse en WebP optimizado;
- tener nombre descriptivo y ruta estable;
- responder con HTTP 200 en local y en producción.

Ejemplo de ruta para francés:

```text
frances/Niveau 1/img/pratique-orale/unite-1-coach.webp
```

Ejemplo de ruta para inglés:

```text
assets/img/english-basic/oral-practice/unit-1-conversation-coach.webp
```

Si por alguna razón se usa una imagen temporal durante el desarrollo, la actividad no se considera terminada hasta que esa imagen sea reemplazada por una imagen profesional única.

### 30.2 Cierre obligatorio: commit y despliegue

Al terminar cada actividad oral por unidad, el cierre técnico es obligatorio:

1. Validar sintaxis JavaScript con `node --check`.
2. Verificar que la página, CSS, JavaScript, imagen y audios respondan localmente.
3. Actualizar la tarjeta dentro de Practice Lab, Ateliers o Activités.
4. Hacer commit con un mensaje claro.
5. Desplegar al VPS.
6. Verificar en producción:
   - página HTML;
   - tarjeta en la carpeta de actividades;
   - imagen WebP;
   - CSS;
   - JavaScript del motor;
   - archivo de datos de la unidad;
   - audios profesionales.
7. No cerrar la tarea como terminada si producción no refleja los cambios locales.

Esta regla se aplica actividad por actividad. No se deben acumular varias unidades sin commit ni despliegue cuando el usuario haya aprobado cerrar una actividad.
