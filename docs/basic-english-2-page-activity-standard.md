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

Cada actividad importante debe tener imagen profesional propia cuando el contexto lo requiera.

No se permite:

- reciclar imagenes de otra actividad;
- usar imagenes provisionales como entrega final;
- usar capturas de pantalla como hero;
- usar imagen generica sin relacion con la unidad.

La imagen puede compartirse entre la tarjeta de la actividad y su hero, pero dos actividades diferentes no deben compartir la misma imagen principal.

## 5. Checklist antes de terminar una pagina

Antes de dar una pagina o actividad como terminada:

- [ ] La pagina carga el CSS de Basic 2 con cache busting actualizado.
- [ ] La pagina carga `google-auth.js` con cache busting actualizado si usa autenticacion.
- [ ] El `body` usa la clase `basic2-page` o `basic2-index-page`, segun corresponda.
- [ ] El Sign in aparece en el header superior, no flotante.
- [ ] El header superior queda compacto en celular y tablet.
- [ ] El hero/banner se desplaza con el contenido.
- [ ] Ningun header, hero, toast, modal, panel o boton tapa preguntas, tarjetas, audios, transcripciones, grabadoras o feedback.
- [ ] No hay scroll horizontal inesperado.
- [ ] Se reviso celular vertical.
- [ ] Se reviso tablet vertical.
- [ ] Se reviso portatil/escritorio.
- [ ] Si es una actividad, aparece en Practice Lab o Games segun corresponda.
- [ ] Si es listening, reading o video listening, las respuestas no tienen patron obvio.
- [ ] Si hay audios, controles o transcripciones, son usables en pantalla tactil.

## 6. Validacion tecnica recomendada

Cuando se toque el header, hero, responsive o autenticacion de Basic 2, ejecutar:

```bash
node tools/test_basic2_top_nav_auth.mjs
node tools/test_basic2_hero_scroll.mjs
```

Si se despliega a produccion, repetir las pruebas contra `https://www.jaralingua.com`.

## 7. Criterio de terminado

Una pagina de Basic English Course 2 no se considera terminada solamente porque cargue o porque visualmente se parezca a otra.

Se considera terminada cuando cumple:

1. objetivo pedagogico claro;
2. navegacion coherente;
3. Sign in en el header superior;
4. header compacto en movil/tablet;
5. hero no fijo en movil/tablet;
6. imagen profesional adecuada cuando aplique;
7. responsive verificado;
8. cache busting actualizado;
9. commit realizado;
10. despliegue y verificacion en produccion cuando el usuario haya pedido publicar.

