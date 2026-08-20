# Basic English Course 2 - Standard obligatorio para paginas y actividades

Este documento debe revisarse cada vez que se cree o modifique una pagina de **Basic English Course 2**.

Su objetivo es evitar que una pagina quede visualmente incomoda en celular o tablet, especialmente por heroes, banners, headers fijos, botones flotantes o elementos que cubren actividades.

## 1. Alcance

Aplica a todas las piezas actuales y futuras de Basic English Course 2:

- pagina principal del curso;
- Course Overview;
- paginas explicativas de unidad;
- Practice Lab;
- Listening Library;
- Games;
- Grades;
- Evaluations and Exam Practice;
- video listening;
- audio listening;
- reading;
- pronunciation;
- grammar practice;
- conversation coach;
- juegos por unidad;
- futuras evaluaciones, simulacros o secciones nuevas.

## 2. Header superior y Sign in

El acceso de `Sign in` debe vivir en el header superior del curso.

No se permite:

- boton flotante de Sign in;
- panel flotante que tape tarjetas o preguntas;
- header fijo que se convierta en un banner alto;
- enlaces apilados en varias filas que cubran media pantalla en movil.

En celular y tablet, si el header queda fijo, debe ser compacto. Si los enlaces no caben, se debe usar scroll horizontal interno, menu colapsado o una distribucion compacta.

## 3. Hero / banner principal

El hero o banner principal no debe quedar fijo en celular ni tablet.

Reglas obligatorias:

- debe desplazarse con el contenido al hacer scroll;
- no debe usar `position: fixed` ni comportamiento sticky que tape la pagina;
- no debe depender de `background-attachment: fixed` en movil/tablet;
- debe dejar visible el contenido despues de iniciar scroll;
- debe funcionar en celular vertical, celular horizontal, tablet vertical y tablet horizontal.

## 4. Imagen profesional

Cada actividad nueva de Basic English Course 2 debe tener una imagen profesional propia cuando se entregue como pagina final. Esta regla aplica especialmente a reading, listening, video listening, pronunciacion, conversation coach, grammar practice, vocabulary activities y juegos por unidad.

No se permite:

- reciclar imagenes de otra actividad;
- usar imagenes provisionales como entrega final;
- usar capturas de pantalla como hero;
- usar imagen generica sin relacion con la unidad.

La imagen puede compartirse entre la tarjeta de la actividad y su hero, pero dos actividades diferentes no deben compartir la misma imagen principal. Si una actividad se crea primero con imagen temporal, no se considera terminada hasta reemplazarla por una imagen profesional unica.

## 5. Ubicacion de actividades y examenes

Las actividades regulares de unidad deben ir en **Practice Lab** o **Games**, segun su tipo.

Las practicas tipo examen, simulacros y evaluaciones oficiales deben ir en **Evaluations and Exam Practice**. No deben quedar regadas como tarjetas sueltas dentro del home principal ni mezcladas dentro de Practice Lab, salvo un enlace de navegacion que lleve al centro de examenes.

## 6. Ancho de pantalla y uso del espacio

Todas las paginas, actividades, practicas tipo examen, simulacros y evaluaciones oficiales de **Basic English Course 2** deben aprovechar el ancho disponible de la pantalla.

Reglas obligatorias:

- en escritorio o portatil, el contenido principal no debe quedar encerrado en columnas angostas de `1120px`, `1180px` o `1220px` cuando la pantalla permite mas espacio;
- se debe preferir un contenedor fluido, por ejemplo `width: min(1760px, calc(100% - 2rem))`, ajustado al tipo de pagina;
- las secciones de escritura, lectura, preguntas, grillas, formularios y paneles laterales deben poder expandirse para usar mejor pantallas grandes;
- en celular y tablet, el margen debe reducirse sin crear scroll horizontal;
- solo se permite un ancho estrecho cuando el objetivo pedagogico lo justifique claramente, por ejemplo un texto corto centrado, una nota breve o una tarjeta auxiliar, nunca el area principal de trabajo.

## 7. Entregas al profesor y blindaje contra errores

Toda actividad de Basic English Course 2 que envie evidencia al profesor, aunque tenga peso 0%, debe implementar estas defensas:

- `clientSubmissionId` estable para que un reintento no duplique la entrega;
- reintento seguro cuando haya timeout o corte de red;
- copia local del trabajo antes de enviar;
- mensaje claro si la sesion expiro o el correo no esta autorizado;
- validacion del servidor sobre el contenido real, no solo sobre el checklist visual del navegador;
- respuesta idempotente del servidor si recibe dos veces la misma entrega;
- ningun registro numerico en `grades` cuando el entregable sea 0% sin nota;
- estado visible en la pestana **Deliverables** de la grilla.

## 8. Checklist antes de terminar una pagina

Antes de dar una pagina o actividad como terminada:

- [ ] La pagina carga el CSS de Basic 2 con cache busting actualizado.
- [ ] La pagina carga `google-auth.js` con cache busting actualizado si usa autenticacion.
- [ ] El `body` usa la clase `basic2-page` o `basic2-index-page`, segun corresponda.
- [ ] El Sign in aparece en el header superior, no flotante.
- [ ] El header superior queda compacto en celular y tablet.
- [ ] El hero/banner se desplaza con el contenido.
- [ ] Ningun header, hero, toast, modal, panel o boton tapa preguntas, tarjetas, audios, transcripciones, grabadoras o feedback.
- [ ] El contenido principal aprovecha el ancho de pantalla en escritorio/portatil y no queda encerrado en un contenedor angosto injustificado.
- [ ] No hay scroll horizontal inesperado.
- [ ] Se reviso celular vertical.
- [ ] Se reviso tablet vertical.
- [ ] Se reviso portatil/escritorio.
- [ ] Si es una actividad, aparece en Practice Lab o Games segun corresponda.
- [ ] Si es practica tipo examen, simulacro o evaluacion oficial, aparece en Evaluations and Exam Practice.
- [ ] Si se envia al profesor, tiene `clientSubmissionId`, reintento seguro, copia local y endpoint idempotente.
- [ ] Si es listening, reading o video listening, las respuestas no tienen patron obvio.
- [ ] Si hay audios, controles o transcripciones, son usables en pantalla tactil.

## 9. Validacion tecnica recomendada

Cuando se toque el header, hero, responsive o autenticacion de Basic 2, ejecutar:

```bash
node tools/test_basic2_top_nav_auth.mjs
node tools/test_basic2_hero_scroll.mjs
```

Cuando se cree o modifique el juego del impostor de Basic 2, ejecutar tambien:

```bash
python tools/test_basic2_impostor_game.py
node tools/test_basic2_impostor_ui.cjs
```

Si se despliega a produccion, repetir las pruebas contra `https://www.jaralingua.com`.

## 10. Criterio de terminado

Una pagina de Basic English Course 2 no se considera terminada solamente porque cargue o porque visualmente se parezca a otra.

Se considera terminada cuando cumple:

1. objetivo pedagogico claro;
2. navegacion coherente;
3. Sign in en el header superior;
4. header compacto en movil/tablet;
5. hero no fijo en movil/tablet;
6. imagen profesional adecuada cuando aplique;
7. responsive verificado;
8. contenido principal fluido y amplio en escritorio/portatil;
9. cache busting actualizado;
10. commit realizado;
11. despliegue y verificacion en produccion cuando el usuario haya pedido publicar.
