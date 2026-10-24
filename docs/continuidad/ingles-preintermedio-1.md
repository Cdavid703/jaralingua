# Continuidad de Inglés Preintermedio 1

## Alcance actual

El docente pidió leer PreIntermediate_Course 1.docx de Descargas, estudiar Básico 1 y 2, preparar una matriz de 64 horas y comenzar por Making Friends. El nivel nuevo es independiente de Intermediate 1 y de Básico 2.

La primera construcción comprende cuatro páginas en `ingles/preintermedio-1/`: inicio, Course Overview, explicación de Making Friends y biblioteca de expresiones. No equivale a terminar las ocho actividades de Practice Lab ni a crear un registro de notas.

## Fidelidad al diseño de Básico 2

El docente reiteró al encargar Unit 3 que las explicaciones de Units 1 y 2 tampoco pueden contener actividades. Course Overview y las páginas explicativas contienen únicamente teoría, comparaciones y modelos explicados con audio. Las entrevistas como tarea, encuestas, cuestionarios, producción, grabaciones, entregas y evaluaciones se construirán en Practice Lab; un diálogo de ejemplo con audio no es una actividad evaluable. Esta decisión también rige las unidades siguientes.

El 24 de octubre de 2026 el docente señaló explícitamente la omisión del QR y el cambio de colores de la primera vista previa. Se corrigió y esta decisión debe mantenerse en futuras actividades:

- Cargar directamente `style.css`, `english-basic-responsive.css` y `english-basic-2.css` y usar las clases de sus componentes. No reinterpretar la paleta del nivel.
- Conservar el hero horizontal `lesson-hero immersive-basic-hero`, la tarjeta azul, los botones rojo y blanco, la tipografía Arial y los colores de `--basic2-*`.
- Usar el componente compartido `page-qr-access.js`, SVG por página y ampliación centrada. El QR permanece dentro de la tarjeta del título, con espacio para evitar superposición en móvil.
- Mantener las carpetas y los diez temas cerrados inicialmente; el enlace a un tema concreto puede abrirlo.
- Los ajustes del nuevo nivel están en `english-preintermediate-1.css`; no modificar la apariencia de Básico 2 para adaptar este nivel.

## Fuentes y reproducción

`tools/build_preintermediate1_unit1.py` genera las cuatro páginas, inventario y guiones de 43 audios, y cuatro SVG QR dirigidos a las URL finales en www.jaralingua.com. Las voces de catálogo son Sarah para modelos y Matilda y Sean para los turnos de Laura y Mateo. No usar voces David creadas o clonadas.

Se conservan los dos encuentros de tres horas de la unidad: entrevista inicial y preparación; personalidad, preferencias, entrevista final, presentación, diario y feedback. El desarrollo de actividades sigue el plan preparado para el docente; la explicación actual no ofrece enlaces a actividades inexistentes.

## Verificación local y publicación

La revisión visual comprobó 390 × 844, 844 × 390, 820 × 1180, 1180 × 820, 1440 × 900 y 1920 × 1080. Se verificaron QR visible sin superponer texto, ausencia de desplazamiento horizontal de la página, ampliación centrada, diez temas cerrados inicialmente y diez temas abiertos sin desborde. También se revisaron las otras tres páginas en móvil.

La comparación de estilos calculados con Básico 2 confirmó tarjeta `rgba(7, 31, 79, 0.72)`, botón principal `rgb(215, 25, 63)` y Arial. Los 43 archivos MP3 y cuatro SVG están presentes. Las comprobaciones locales no acreditan publicación.

Los 43 modelos se transcribieron con ElevenLabs Scribe: todos coinciden al normalizar puntuación y tildes. La única diferencia ortográfica antes de normalizar fue Medellín/Medellin. El informe local de QA se conserva fuera de los archivos publicados.

## Publicación confirmada el 24 de octubre de 2026

El docente autorizó explícitamente commit, push a main y despliegue de esta versión después de los bloqueos iniciales de revisión automática. Se usó el acceso administrativo autorizado y el publicador selectivo existente. El bloqueo anterior quedó resuelto para esta entrega.

Los commits locales se transfirieron como bundle al repositorio de desarrollo del servidor y se enviaron a GitHub usando su conexión SSH existente. No se trasladó ninguna clave privada. El commit desplegado es `b6143a9ec98a9c793d3ed1eba9dcb1393c1ef762`.

El publicador aplicó exactamente 59 archivos públicos, con comprobación de las versiones previas y respaldo `20261024T213458Z-7siik0im` en la carpeta de respaldos habitual. No hubo cambios de backend, bases de datos, entregas ni servicios. Los cambios ajenos de la copia local se conservaron.

Se comprobaron por HTTPS los 59 archivos: todos devolvieron HTTP 200 y coincidieron con sus hashes del commit. Incluyen cuatro páginas, cuatro QR y 43 MP3. La revisión en el navegador público confirmó QR ampliable y reproducción del modelo inicial.

Página publicada: https://www.jaralingua.com/ingles/preintermedio-1/unit-1-making-friends.html. Los QR ya tienen sus destinos públicos disponibles. La explicación y sus accesos están publicados; las ocho actividades de Practice Lab siguen como desarrollo posterior.

## Unidad 2: Interests and Hobbies

El docente aprobó la construcción de la explicación desde Course Overview, siguiendo el diseño de Básico 2. La unidad corresponde a las sesiones 3–5 (9 horas). La entrega contiene cuatro bloques cerrados y quince subtemas, también cerrados: Leisure Time and Music, Handy Work and Sports, The Natural World y Hobby Groups.

La gramática nueva central son los pronombres objeto, con referencia explícita y contraste sujeto/objeto. Se conectan con can/can’t, preferencias, propósito con to + verbo, instrucciones, play/go/do, presente simple frente a continuo, preguntas de duración/distancia/frecuencia/precio, ubicación, secuencia y contracciones. Se conserva como ejemplo la corrección “How much does a soccer player earn?”. Los modelos integran diálogo, proyecto manual, perfil del grupo y blog de naturaleza.

La página es `unit-2-interests-hobbies.html`; los accesos de inicio y Course Overview están actualizados. La biblioteca ahora agrupa por unidad las expresiones de Making Friends y las cinco de Unit 2: take up, try out, join in, get the hang of, not my cup of tea. No se crean exámenes, entregas ni actividades de Practice Lab. La evaluación escrita de la sesión 5 conserva su peso del 20% como referencia del curso.

`tools/preintermediate1_unit2_content.py` conserva el contenido y los textos exactos. `tools/build_preintermediate1_unit2.py` construye la página, inventarios de audio y QR y actualiza los accesos de forma idempotente. El generador de Unit 1 reaplica esta integración al terminar; reconstruir Unit 1 no debe borrar los accesos de Unit 2. La biblioteca carga `preintermediate1-all-audio-data.js`; Unit 2 carga su inventario propio. Los enlaces a subtemas abren también sus carpetas antecesoras.

Los 77 MP3 se generaron con el flujo existente de ElevenLabs, reutilizando exclusivamente el reparto de catálogo Sarah/Matilda/Sean. La transcripción Scribe coincide en 71 tras normalización; las seis restantes presentan únicamente variantes ortográficas jewelry/jewellery, colors/colours, favorite/favourite, kilometers/kilometres y caratê/karate. No hay frases omitidas. El informe se conserva en `tmp/preintermediate1-unit2-qa/audio-audit.json`, fuera de publicación.

La revisión local comprobó seis tamaños (celular y tablet en ambas orientaciones, portátil y escritorio), con los 19 acordeones cerrados y abiertos, sin desbordamiento. Se verificaron los colores compartidos, Arial, QR sin superposición y ampliación centrada, vínculos internos, los 77 archivos, reproducción individual, velocidad 0.75 y parada. Inicio, Course Overview y biblioteca también se revisaron en móvil. La generación se ejecutó dos veces y produjo los mismos archivos. Esta revisión local no acredita por sí sola la publicación; registrar abajo el resultado del despliegue verificado.

### Publicación verificada de Unit 2 — 24 de octubre de 2026

El commit `08976111f23fe4322080c17370427eda36991de4` se envió a main con push normal mediante el bundle y la conexión SSH existente del VPS. El publicador selectivo aplicó exactamente 88 archivos tras comparar con la versión previa y revisar su vista previa. Respaldo: `20261024T215647Z-gprv40wt`. Todos los hashes del servidor y las 88 respuestas HTTP 200 públicas coincidieron con el commit. No se modificaron datos académicos, backend ni servicios.

La revisión de navegador público confirmó el acceso desde Course Overview, el QR ampliable y el audio individual. Página: https://www.jaralingua.com/ingles/preintermedio-1/unit-2-interests-hobbies.html. Los informes de publicación y HTTPS se conservan en `tmp/preintermediate1-unit2-qa/`, fuera de los archivos públicos.

## Unidad 3: Healthy Living — explicación

El docente aprobó el plan de cuatro bloques y dieciséis subtemas para sesiones 6–8 (9 horas): Healthy Habits and Eating; Aches, Pains and Recommendations; Stress and Relaxation; Language in Context. Página: `unit-3-healthy-living.html`. Se explican frecuencia, rutinas frente a cambios temporales, cantidades en una etiqueta ficticia, have/feel/be, should, could, must/have to, mustn’t frente a don’t have to, if/when habituales, preguntas de horas/duración/frecuencia, could try + -ing e intenciones con be going to. No se introducen predicciones ni condicionales hipotéticos. Los ejemplos de salud son contextos lingüísticos; la etiqueta contiene cantidades inventadas para explicar su lectura.

Los diálogos y el párrafo final son modelos completamente resueltos, sin consigna de producción, respuestas por completar ni envío. En Unit 1 se retiró la instrucción de entrevistar y presentar a un compañero y se reformularon las indicaciones de tarea. En Unit 2 se aclaró el carácter de modelo de la descripción manual y de los grupos, retirando referencias a proyectos y evaluación como tareas de la explicación. Los 120 audios existentes mantienen exactamente sus textos y archivos.

Fuentes reproducibles: `tools/preintermediate1_unit3_content.py` y `tools/build_preintermediate1_unit3.py`. La cadena del generador de Unit 1 ejecuta después Unit 2 y Unit 3; se verificó que una segunda ejecución produce las mismas seis páginas. La biblioteca incorpora cut down on, give up, wind down, under the weather y recharge your batteries; carga un inventario combinado de 207 modelos de las tres unidades. Cada unidad carga su propio inventario.

Se generaron 87 MP3 con Sarah (79 modelos) y Matilda/Sean (cuatro turnos cada uno), exclusivamente voces de catálogo ElevenLabs. Scribe confirmó 84 coincidencias normalizadas y tres variantes de escritura (30/thirty y organise/organize). Un modelo negativo con going to se regeneró para conservar la articulación clara de esa construcción y se volvió a comprobar. El informe está fuera de publicación en `tmp/preintermediate1-unit3-qa/audio-audit.json`.

QA local: seis tamaños con los veinte acordeones cerrados y abiertos, sin desbordamiento; QR sin superposición y ampliación centrada en móvil; azul, rojo y Arial idénticos a los componentes compartidos de Básico 2; etiquetas legibles en celular; enlaces y modelos coherentes. Se verificó la ausencia de controles de actividades en las tres unidades. Los informes locales no sustituyen la confirmación posterior del despliegue. El origen y la consigna exacta de la imagen propia están en `docs/preintermediate1-unit3-image.md`.

### Publicación verificada de Unit 3 — 24 de octubre de 2026

Commit publicado: `dd3e7e63b258dd16b954f5534ec8154bf5a95580`, subido con push normal a main. Se compararon con producción los 99 archivos explícitos, se revisó la vista previa y se aplicó el publicador existente con respaldo `20261024T221348Z-gqjmdv2o`. Los 99 hashes del servidor y las 99 respuestas HTTPS 200 coincidieron con el commit; incluyen los 87 MP3 nuevos y las páginas corregidas de Units 1 y 2. No se modificaron datos académicos, backend ni servicios.

La comprobación en navegador público confirmó el acceso desde Course Overview, el QR ampliable y la reproducción individual. URL: https://www.jaralingua.com/ingles/preintermedio-1/unit-3-healthy-living.html. Los informes están en `tmp/preintermediate1-unit3-qa/`, fuera de publicación. No se ha construido Practice Lab como parte de esta entrega.
