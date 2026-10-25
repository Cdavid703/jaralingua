# Continuidad de Inglés Preintermedio 1

## Alcance actual

El docente pidió leer PreIntermediate_Course 1.docx de Descargas, estudiar Básico 1 y 2, preparar una matriz de 64 horas y comenzar por Making Friends. El nivel nuevo es independiente de Intermediate 1 y de Básico 2.

La primera construcción comprende cuatro páginas en `ingles/preintermedio-1/`: inicio, Course Overview, explicación de Making Friends y biblioteca de expresiones. No equivale a terminar las ocho actividades de Practice Lab ni a crear un registro de notas.

Estado más reciente: las seis explicaciones están publicadas y el home conserva las diez secciones. El docente aprobó ahora listening → reading conectados para Unit 1: A New Classmate y Something in Common. La lectura inicial se adapta como segunda parte, conservando su URL. Las otras seis actividades siguen pendientes. Ver la última sección para construcción, pruebas y publicación.

Flujo reiterado por el docente: primero preguntar y acordar qué actividad se hará y su alcance. Construir después de esa indicación, evitando adelantar actividades por iniciativa propia. La aprobación actual cubre las dos páginas conectadas y su glosario subrayado con pronunciación/significado; el flujo ordinario de commit, push y despliegue se aplica dentro del alcance aprobado.

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

## Unidad 4: Celebrations and Festivals — explicación

El docente aprobó catorce subtemas en cuatro bloques para las sesiones 9–10 (6 horas): Celebrations and Traditions; What People Usually Do; Plans and Future Arrangements; Language in Context. La página `unit-4-celebrations-festivals.html` contiene únicamente explicación, comparaciones y modelos completos. No contiene encuestas, ejercicios de asociación, líneas de tiempo por elaborar, producción de correos, grabaciones ni entregas; esas actividades corresponden a Practice Lab.

El desarrollo principal es el presente continuo para arreglos futuros acordados, contrastado con costumbres, acciones actuales e intenciones con going to. Se explica que las formas futuras pueden superponerse y que una fecha por sí sola no demuestra un acuerdo. Going to, frecuencia, pronombres y cantidades conectan con explicaciones anteriores. Se mantienen be y el verbo base donde corresponde; no se añade una unidad sobre will o condicionales.

Las descripciones culturales se basan en los textos oficiales de UNESCO sobre el Carnaval de Barranquilla y las Fallas de Valencia, recuperados en los resultados indexados. La apertura directa de esas páginas mostró verificación humana; no se intentó resolverla. Los enlaces oficiales acompañan las tarjetas. Los ejemplos describen música, danza, objetos artesanales, figuras y comidas compartidas, sin publicar fechas de una programación actual. Los contextos familiares, conversaciones y viaje son ficticios; el correo está presentado completo, con saludo, cuerpo y cierre.

Fuentes reproducibles: `tools/preintermediate1_unit4_content.py` y `tools/build_preintermediate1_unit4.py`. El generador de Unit 3 ejecuta al final Unit 4; la cadena de Unit 1 conserva las siete páginas. Inicio, Course Overview y biblioteca tienen el acceso a Unit 4. La biblioteca incorpora set up, put up, get together, in full swing y have a ball y carga 279 modelos combinados de las cuatro unidades. Los 207 modelos anteriores permanecen sin cambios.

Se generaron 72 MP3 mediante ElevenLabs: Sarah para 64 modelos y Matilda/Sean para cuatro turnos cada uno, todas voces de catálogo. Scribe comprobó 64 coincidencias normalizadas y ocho variantes ortográficas (neighbours/neighbors, travelling/traveling, organise/organize y Ana/Anna). La palabra aislada costume se regeneró como a costume para dar un contexto nominal claro; su transcripción final coincide. Los informes y los planes de voces están en `tmp/preintermediate1-unit4-qa/`, fuera de publicación.

QA local: catorce subtemas y cuatro bloques cerrados al cargar; dieciocho acordeones abiertos sin desbordamiento en los seis tamaños habituales; colores de Básico 2 y Arial verificados; QR visible sin superposición y ampliación centrada en móvil; enlaces, reproducción individual, correo con audio, velocidad y parada comprobados. Se verificó la ausencia de controles de actividades en las cuatro unidades y la reproducción idéntica de las siete páginas con la cadena de generadores. El origen y la consigna exacta de la imagen propia están en `docs/preintermediate1-unit4-image.md`. Estas comprobaciones locales no acreditan por sí solas publicación.

### Publicación verificada de Unit 4 — 24 de octubre de 2026

Commit publicado: `0b16d0776ed0108ce303ab2878850b790d94ff04`, enviado a main mediante push normal. El publicador selectivo aplicó exactamente los 81 archivos previstos, después de comprobar sus versiones previas y revisar la vista previa. Respaldo: `20261024T223100Z-s7qhj51p`. Los 81 hashes del servidor y las 81 respuestas HTTPS 200 coincidieron con el commit. No se modificaron datos académicos, backend ni servicios.

La revisión en navegador público confirmó el acceso desde Course Overview, el QR ampliable y el audio individual. Página: https://www.jaralingua.com/ingles/preintermedio-1/unit-4-celebrations-festivals.html. Los informes están en `tmp/preintermediate1-unit4-qa/`, fuera de publicación. La entrega contiene explicación y modelos, sin actividades de Practice Lab.

## Unidad 5: Childhood Memories — explicación

El docente pidió continuar con Unit 5 tras completar Unit 4. Se siguieron las sesiones 11–13 del pacing guide y la matriz de 64 horas, conservando exclusivamente teoría y modelos explicados. La página es `unit-5-childhood-memories.html`: cuatro bloques y dieciséis subtemas sobre recuerdos en pasado, hábitos con used to, cambios y comparaciones, y lenguaje narrativo en contexto. El alcance no incluye Practice Lab ni la tarea integrada del 20% de la sesión 13.

El desarrollo central es used to para hábitos y estados anteriores, con preguntas Did… use to…?, negaciones didn’t use to y comparación explícita con el presente. El pasado simple se recupera para estados, acciones terminadas y narración, aclarando que también puede expresar repetición en un periodo acabado. Se aplican comparativos y se corrige el ejemplo del guide a “I have long hair now”. No se introducen present perfect ni be/get used to. No se deduce personalidad ni biografía de fotografías; los perfiles, recuerdos y fechas pertenecen a personajes ficticios y la línea de vida aparece completamente resuelta.

Fuentes reproducibles: `tools/preintermediate1_unit5_content.py` y `tools/build_preintermediate1_unit5.py`. Unit 4 reaplica Unit 5 al terminar, preservando la cadena de ocho páginas. Inicio, Course Overview y biblioteca incluyen los accesos. La biblioteca incorpora grow up, look back on, bring back, the good old days y a trip down memory lane y carga 359 modelos combinados. Los 279 modelos anteriores permanecen sin cambios.

Se generaron 80 MP3 con las voces de catálogo ElevenLabs: Sarah (72 modelos), Matilda y Sean (cuatro turnos cada uno). Scribe confirmó 73 coincidencias normalizadas y siete variantes de escritura: inglés británico/estadounidense, cifras frente a palabras y used/use después de didn’t, que no se distingue por esa grafía en el habla conectada. La forma canónica y la página muestran correctamente didn’t use to. El par live/lived se grabó en frases para fijar el sentido verbal. Informe: `tmp/preintermediate1-unit5-qa/audio-audit.json`, fuera de publicación.

QA local: veinte acordeones cerrados y abiertos en seis tamaños, sin desbordamiento; azul, rojo y Arial del diseño compartido de Básico 2; QR visible sin superposición y ampliación centrada en móvil; enlaces, reproducción individual, controles de velocidad y parada, y biblioteca comprobados. Se verificó que las cinco explicaciones carecen de controles de actividades y que la cadena reproduce las ocho páginas de forma idempotente. La imagen propia y su consigna están documentadas en `docs/preintermediate1-unit5-image.md`. La verificación local no acredita publicación por sí sola.

### Publicación verificada de Unit 5 — 24 de octubre de 2026

Commit publicado: `c5b671de2f36fa0004f3b9c96325812715685ff0`, enviado a main mediante push normal. Se compararon las versiones previas de los 89 archivos públicos, se revisó la vista previa y se aplicó el publicador selectivo existente. Respaldo: `20261024T224559Z-q79u811s`. Los 89 hashes del servidor y las 89 respuestas HTTPS 200 coincidieron con el commit. No se modificaron datos académicos, backend ni servicios.

La revisión en navegador público confirmó el acceso desde Course Overview, el QR ampliable y la reproducción individual. Página: https://www.jaralingua.com/ingles/preintermedio-1/unit-5-childhood-memories.html. Los informes se conservan en `tmp/preintermediate1-unit5-qa/`, fuera de publicación. La entrega contiene exclusivamente explicación y modelos completos.

## Unidad 6: Around Town — explicación

El docente pidió continuar con Unit 6 y reiteró continuar durante la construcción. Se siguieron las sesiones 14–16 del pacing guide: lugares y comercios, ubicación, información turística y visitas guiadas. La página `unit-6-around-town.html` tiene cuatro bloques y dieciséis subtemas, exclusivamente con explicaciones y modelos completos. No contiene juegos con mapa, rol del estudiante, folleto por elaborar, correo por escribir, entregas ni control del libro; eso pertenece a Practice Lab.

La unidad aplica Is there/Are there, Where is/How can I get to, preposiciones de ubicación, imperativos de dirección, punto de partida y orientación, preguntas de horario/duración/distancia/precio, recommend + nombre/-ing, can/should, secuencia e itinerarios. No añade un tiempo verbal nuevo. En lugar de afirmar datos comerciales o rutas reales del guide, se proporciona un pueblo ficticio con toda la información necesaria y horarios inventados.

El mapa está orientado con el norte arriba: Museum/Park/Tourist Office al oeste de Oak Street; Station/Market/Café al este. Hill Street, Central Street y River Street se ordenan de norte a sur. La ruta roja comienza junto a Tourist Office, va al norte por Oak Street, pasa Central Street y gira al oeste por Hill Street. La entrada del Museum está al norte de esa calle: a la derecha del viajero que mira al oeste. Se distingue la derecha del viajero de la derecha fija del mapa. Los ejemplos de bus y el esquema frontal del museo están identificados como contextos separados.

El folleto y el correo aparecen completos. El itinerario usa días y horas compatibles con los horarios inventados del museo, mercado, parque y café. Los datos son material lingüístico, no una oferta turística ni una programación real.

Fuentes reproducibles: `tools/preintermediate1_unit6_content.py` y `tools/build_preintermediate1_unit6.py`; Unit 5 reaplica Unit 6 al terminar. La cadena conserva nueve páginas y Course Overview abre ya las seis unidades, sin tarjetas de unidades pendientes. Esto completa sus explicaciones, no las actividades de Practice Lab ni las evaluaciones del curso. La biblioteca incorpora get around, look around, get on, get off y a stone’s throw; carga 417 modelos combinados. Los 359 modelos previos permanecen sin cambios.

Se generaron 58 MP3 con las voces de catálogo ElevenLabs: Sarah (50 modelos), Matilda y Sean (cuatro turnos cada uno). Scribe comprobó 57 coincidencias normalizadas y una variante de escritura de hora: nine thirty/9:30. Informe: `tmp/preintermediate1-unit6-qa/audio-audit.json`, fuera de publicación.

QA local: veinte acordeones cerrados y abiertos en seis tamaños sin desbordamiento; colores y Arial compartidos de Básico 2; QR sin superposición y ampliación centrada; mapa legible en móvil; rutas y orientación revisadas; accesos, biblioteca, audio, velocidad y parada comprobados. Se verificó la ausencia de controles de actividades en las seis explicaciones y la reproducción idempotente de las nueve páginas. La imagen propia y su consigna están en `docs/preintermediate1-unit6-image.md`. Esta comprobación local no acredita publicación por sí sola.

### Publicación verificada de Unit 6 — 24 de octubre de 2026

Commit publicado: `113eecd36df5e9e8834c0e25d06600b428324403`, enviado a main mediante push normal. El publicador selectivo aplicó los 67 archivos previstos tras comparar sus versiones previas y revisar la vista previa. Respaldo: `20261024T234635Z-thslsys8`. Los 67 hashes del servidor y las 67 respuestas HTTPS 200 coincidieron con el commit. No se modificaron datos académicos, backend ni servicios.

La revisión en navegador público confirmó las seis carpetas de explicación disponibles en Course Overview, acceso a Around Town, los colores compartidos de Básico 2 y Arial, QR ampliable y reproducción individual. Página: https://www.jaralingua.com/ingles/preintermedio-1/unit-6-around-town.html. Informes: `tmp/preintermediate1-unit6-qa/`, fuera de publicación. Las seis explicaciones están publicadas; Practice Lab y las evaluaciones no forman parte de esta entrega.

## Inicio con las diez secciones e imágenes propias — 24 de octubre de 2026

El docente eligió expresamente conservar las diez secciones de Básico 2, con contenido de Preintermedio y estado «En preparación» donde falte construir. También corrigió la reutilización de la portada de Making Friends en páginas distintas. El inicio usa ahora los componentes reales del dashboard de Básico 2, su CSS compartido, Arial, tarjeta azul del título, botones rojo/blanco, menú cerrado al cargar y QR ampliable. Las tarjetas muestran imagen, número, estado, título y reseña de hasta dos líneas, con un máximo de cuatro columnas.

Orden: Course Overview, Practice Lab, Games, Listening Library, Pronunciation Library, Idioms and Phrasal Verbs, Phonetic Rules, Free English Learning Links, Grades, Evaluations and Exam Practice. Cuatro accesos disponibles: Overview, expresiones y las dos páginas generales compartidas de fonética/recursos. Las otras seis tarjetas indican «En preparación», sin enlaces a páginas inexistentes, actividades ni datos académicos. El menú rápido las ubica dentro del mismo inicio. Los audios de explicación existentes no se presentan como una biblioteca de actividades ya construida.

Se generaron nueve imágenes originales: inicio, Overview, expresiones y las seis futuras secciones. Las seis unidades conservan sus imágenes originales y ahora las muestran también al desplegar sus carpetas de Overview. Cada tarjeta de sección disponible comparte la portada de su página destino; ninguna de las nueve páginas de Preintermedio comparte su portada con otra página distinta. Fonética y recursos mantienen las imágenes de sus mismas páginas generales. Origen y consignas exactas: `docs/preintermediate1-home-images.md`.

Fuente canónica del inicio: `tools/build_preintermediate1_home.py`, reaplicada al terminar Unit 6. Los generadores de unidades 2–6 ya no reconstruyen tarjetas del inicio anterior. La cadena completa reproduce las nueve páginas sin cambios y las seis páginas de explicación siguen idénticas a las publicadas. No se regeneraron ni modificaron los 417 audios.

QA local: enlaces y anclas existentes, diez tarjetas (cuatro accesos y seis pendientes), portadas únicas, seis miniaturas cargadas al abrir sus carpetas, menú funcional, QR centrado/ampliable en móvil y 18 combinaciones de página/tamaño sin desbordamiento ni superposición. Informes en `tmp/preintermediate1-home-qa/`. Estas verificaciones locales no acreditan publicación por sí solas.

### Publicación verificada del inicio

Commit publicado: `934f4c18607b306fbe0048a76ce621d6d509c7dc`, enviado a main mediante push normal. Se comprobaron las versiones previas de los trece archivos públicos y se revisó la vista previa antes de aplicar el publicador selectivo. Respaldo: `20261025T000726Z-mcd7v926`. Los trece hashes de producción y las trece respuestas HTTPS 200 coincidieron con el commit. Las dos páginas generales compartidas y sus imágenes respondieron también HTTP 200. No se publicaron cambios académicos, backend ni servicios.

El navegador público confirmó las diez tarjetas, las portadas propias del inicio/Overview/expresiones, las seis carpetas de Overview cerradas y el QR ampliable cargado en móvil. Página: https://www.jaralingua.com/ingles/preintermedio-1/index.html. Capturas de verificación en `/Users/davidaramillo/Projects/outputs/preintermedio-1/home-publicado.png` y `tarjetas-home-publicado.png`.

## Plan corregido de conservación de secciones — decisión del docente, 24 de octubre de 2026

Después de señalar que faltó el comparativo previo a la construcción del inicio, el docente precisó las siguientes decisiones. Esta tabla define el alcance de las próximas construcciones; no acredita que las secciones pendientes estén implementadas o publicadas. La publicación anterior conserva su estado hasta realizar esos trabajos.

| Sección | Decisión vigente |
| --- | --- |
| Course Overview | Se mantiene exactamente como acaba de construirse, con sus seis unidades y portadas. |
| Practice Lab | Se conserva en preparación. Las explicaciones no incorporan sus actividades. |
| Games | Se conservan todos los juegos existentes de Básico 1 y Básico 2, reutilizando su funcionamiento y diseño. Inventariar también los que aparecen dentro de Practice Lab; no reducir el alcance a los cuatro del menú Games. La adaptación al nivel debe mantener las mecánicas existentes y separar el progreso de Preintermedio. |
| Listening Library | Se conserva y se irá alimentando con los audios que se construyan en cada unidad. Conservar su organización por unidad y utilizar los audios disponibles, sin marcar como construidos ejercicios o grabaciones que aún no existen. Los 417 modelos explicativos ya existentes son material disponible; no equivalen a 417 actividades de listening. |
| Pronunciation Library | No hubo una nueva indicación sobre esta sección; se conserva su estado actual en preparación. |
| Idioms and Phrasal Verbs | No hubo una nueva indicación sobre esta sección; se conserva la biblioteca de expresiones ya disponible. |
| Phonetic Rules | Queda igual, enlazando la página general compartida existente. |
| Free English Learning Links | Queda igual, enlazando la página general compartida existente. |
| Grades | El docente lo llamó «Rates» después de haberse discutido Grades. Se entiende como la sección de notas: misma estructura y funcionamiento, comenzando desde cero para Preintermedio, sin importar alumnos, notas, entregas ni progreso de otros cursos y sin borrar datos de esos cursos. |
| Evaluations and Exam Practice | Misma estructura y organización del centro de evaluaciones, comenzando desde cero para Preintermedio. No copiar como propias las pruebas, preguntas, entregas o resultados de Básico; se elaborarán las evaluaciones de este nivel según su pacing guide. |

### Inventario comprobado de juegos para la adaptación

El inicio de Básico 1 no tiene un menú Games independiente. Sus juegos se encuentran dentro de Practice Lab. La revisión de las páginas locales el 24 de octubre encontró:

| Procedencia | Juego o actividad lúdica | Fuente existente |
| --- | --- | --- |
| Games Básico 2 | Final Adventure (seis unidades) | `ingles/basico-2/adventure-unit-1.html` |
| Games Básico 2 / Practice Lab Básico 1 | Guess Who | `ingles/basico/practice-unit-3-favorite-people.html` |
| Games Básico 2 | Hangman | `ingles/basico-2/game-hangman.html` |
| Games Básico 2 | Impostor | `ingles/basico-2/game-impostor.html` |
| Practice Lab Básico 1 | Mystery Object Guessing Game | `ingles/basico/workshop-unit-2-bag-exchange.html` |
| Practice Lab Básico 1 | Two Truths and One Lie | `ingles/basico/workshop-unit-4-two-truths-one-lie.html` |
| Practice Lab Básico 1 | Free Time Memory Challenge | `ingles/basico/game-unit-5-free-time-memory.html` |
| Practice Lab Básico 1 | Neighborhood Memory Challenge | `ingles/basico/game-unit-6-neighborhood-memory.html` |
| Practice Lab Básico 2 | Shopping Memory Vocabulary | `ingles/basico-2/practice-unit-2-shopping-memory.html` |
| Practice Lab Básico 2 | Around the World Memory | `ingles/basico-2/practice-unit-3-around-world-memory.html` |
| Practice Lab Básico 2 | Past be: Memory Grammar Lab | `ingles/basico-2/practice-unit-5-past-be-memory-lab.html` |
| Practice Lab Básico 2 | Food Vocabulary Memory | `ingles/basico-2/practice-unit-6-food-vocabulary-memory.html` |
| Enlazado desde Practice Lab Básico 2 | Market Basket Challenge | `ingles/intermediate/practice-unit-5-countable-uncountable-food.html` |

Los juegos vinculados a temas de unidad conservan su ubicación pedagógica al preparar la adaptación. Este inventario registra fuentes y alcance, no disponibilidad de versiones de Preintermedio. El antiguo `game-unit-1-weather-hangman.html` no se cuenta como otro juego aparte de Hangman. No añadir juegos nuevos por iniciativa propia ni modificar las fuentes originales de Básico 1, Básico 2 o Intermedio.

## Aplicación del plan al home — 24 de octubre de 2026

El docente pidió aplicar el plan al home, conservando diseño de Básico 2, imágenes propias y QR ampliable, con commit, push y despliegue. El inicio tiene diez tarjetas: ocho destinos y dos en preparación (Practice Lab y Pronunciation Library). Grades muestra «Sin registros» y Evaluations «Desde cero», con acceso a sus estructuras iniciales vacías. Course Overview, la biblioteca de expresiones y las seis páginas de explicación conservan exactamente su versión anterior. Fonética y recursos continúan enlazando las mismas páginas generales.

Se añadieron cuatro páginas de entrada, usando cada una la imagen propia ya creada para su tarjeta y un nuevo QR de su URL pública:

- `games.html`: colección de los trece juegos originales inventariados, agrupados en Core games, Classroom speaking y Memory and sorting. Las tarjetas abren las páginas originales y señalan su curso; Final Adventure informa que usa la cuenta de Básico 2 y conserva allí su progreso. Esta reutilización por referencia no crea una adaptación de contenido ni un registro de juego de Preintermedio. Las futuras adaptaciones propias deberán separar su progreso como establece el plan. Los originales permanecen intactos.
- `listening-library.html`: 417 modelos existentes, agrupados en seis carpetas de unidad cerradas al cargar, con reproducción individual, velocidad y parada. La biblioteca se deriva de los manifiestos de cada unidad al reconstruir el curso. El texto distingue los modelos de audio de las actividades de listening que se construyan después.
- `notas.html`: estructura vacía de Gradebook, Deliverables, Reports y Roster, con el componente de pestañas compartido de Básico 2. No contiene alumnos, resultados, entregas ni promedios inventados. La página indica que la gestión de registros aún no está habilitada; esta entrega del home crea la entrada y estructura inicial, no un servicio de administración académica.
- `evaluations.html`: centro vacío con carpetas separadas para Exam Practice y Official Evaluations, cerradas al cargar. Las pruebas propias se incorporarán al construirlas.

Generación reproducible: `tools/build_preintermediate1_home.py` ejecuta `tools/build_preintermediate1_sections.py`; la cadena completa de unidades conserva las trece páginas. El código de pestañas de este nivel solo conecta el componente compartido a las secciones vacías. Esta entrega es estática y no consulta ni modifica APIs de notas, bases académicas, cuentas o progreso de otros niveles.

QA local: trece portadas distintas; ocho destinos en el inicio y dos pendientes; trece juegos de referencia y 417 modelos; archivos y anclas existentes; treinta combinaciones de página/tamaño sin desbordamiento ni superposición de QR, con imágenes cargadas y acordeones inicialmente cerrados. Se probaron las cuatro pestañas y reproducción, velocidad y parada del audio, además del QR ampliable móvil. La cadena completa reprodujo las trece páginas sin cambios. Informes en `tmp/preintermediate1-home-plan-qa/`. La verificación local por sí sola no acredita publicación.

### Publicación verificada del plan aplicado

Commit publicado: `b1f3b4d7075a5ea9cd1a6eaa8bcdf46225033c6e`, enviado mediante push normal a main. El publicador selectivo aplicó los once archivos previstos después de comprobar los hashes previos y revisar la vista previa. Respaldo: `20261025T005507Z-akcxo3lk`. Los once hashes del servidor y las once respuestas HTTPS 200 coincidieron con el commit. También se comprobaron 32 recursos públicos reutilizados (juegos originales, portadas y una muestra de audio por unidad); todos respondieron HTTP 200.

El navegador público confirmó diez tarjetas, ocho accesos, Practice Lab y Pronunciation Library pendientes, trece enlaces de juegos originales, 417 botones de audio y reproducción de Unit 6. Grades mostró su pestaña Roster vacía, el centro de evaluaciones sus dos carpetas cerradas y el QR de esa página amplió y cargó correctamente en móvil. Página: https://www.jaralingua.com/ingles/preintermedio-1/index.html. Captura: `/Users/davidaramillo/Projects/outputs/preintermedio-1/home-plan-publicado.png`. La publicación fue exclusivamente estática: los espacios de administración académica comienzan vacíos y su gestión de registros se construirá por separado.

## Inicio de Practice Lab, Unit 1 — First Connections Reading

El docente pidió empezar las actividades de Practice Lab de Unit 1. Se releyeron el pacing guide original de Descargas y la matriz de 64 horas conservada en `Projects/outputs/preintermedio-1/`. Se comenzó por la actividad 01 del plan original de ocho: First Connections Reading, de unos 15 minutos de la sesión 1. Se creó `practice-lab.html`, con seis carpetas cerradas inicialmente. Making Friends muestra una actividad disponible y las otras siete previstas como pendientes; no hay enlaces a actividades inexistentes. El home abre Practice Lab y lo etiqueta Unit 1 started; Pronunciation Library sigue en preparación.

La lectura `reading-unit-1-first-connections.html` conserva el texto original de 157 palabras sobre Laura y Mateo. Tiene ocho preguntas A/B/C (idea principal, detalles, dos coincidencias, expresión e inferencia), con claves variadas, explicación, evidencia literal y enlace al párrafo después de comprobar. Debe contestarse todo antes de mostrar un resultado; cambiar una selección retira el feedback anterior. Se puede reintentar y recuperar el intento al recargar dentro de la misma pestaña. La práctica no registra una nota oficial ni envía respuestas. El almacenamiento es sessionStorage con una clave exclusiva de este nivel y actividad, y la página funciona si el navegador no permite guardar.

Apoyo previo cerrado al cargar: seis significados y seis modelos existentes de ElevenLabs cuyo texto coincide exactamente con los botones; velocidad y parada conservadas. No se creó una narración nueva del reading ni la continuación de listening. Los 417 modelos previos siguen intactos. La actividad tiene imagen profesional propia y QR ampliable; Practice Lab usa su portada independiente ya creada. Fuentes, alcance e imagen: `docs/preintermediate1-unit1-practice-reading.md`.

Fuentes reproducibles: `tools/preintermediate1_unit1_practice_content.py` y `tools/build_preintermediate1_practice.py`, llamado al terminar las entradas de secciones. La cadena completa de Unit 1 reproduce las quince páginas sin cambios. Las doce páginas anteriores distintas del home, incluidas Course Overview y las seis explicaciones, permanecen idénticas.

QA local: se probaron respuestas incompletas, ocho incorrectas, ocho correctas, modificación posterior, recuperación del borrador/resultado al recargar y reinicio. Se comprobaron reproducción, velocidad y parada del apoyo de audio; carpeta inicial cerrada y apertura por ancla; imagen propia y QR móvil. Veinticuatro combinaciones de tamaño/estado (lectura inicial y con feedback; Practice Lab cerrado y abierto) sin desbordamiento, controles táctiles de al menos 44 px y QR sin superponer el texto. Informes en `tmp/preintermediate1-reading-qa/`. La revisión local no acredita por sí sola publicación. La siguiente actividad del plan es Ask and Connect, con quince ítems contextuales.

### Publicación verificada de First Connections Reading

Commit publicado: `519beb2cb3f86e68b26c383fe709c4a60cc6f5e2`, enviado mediante push normal a main. Se compararon las versiones previas y se revisó la vista previa antes de aplicar los ocho archivos públicos. Respaldo: `20261025T011303Z-zq3by928`. Los ocho hashes de producción y las ocho respuestas HTTPS 200 coincidieron con el commit. Los seis modelos de audio reutilizados respondieron HTTP 200 y coincidieron con sus archivos locales verificados.

En el navegador público se comprobó el recorrido home → Practice Lab → Making Friends → First Connections Reading; la carga inicial cerrada, una actividad disponible y siete pendientes; ocho respuestas correctas con ocho feedbacks; reinicio del intento de prueba; reproducción de We both like cooking y QR ampliable cargado en móvil. Página: https://www.jaralingua.com/ingles/preintermedio-1/reading-unit-1-first-connections.html. Captura: `/Users/davidaramillo/Projects/outputs/preintermedio-1/First_Connections_Reading_publicada.png`. No se modificaron datos académicos, backend ni servicios. Las siete actividades restantes siguen pendientes.

## Secuencia aprobada: listening → reading con vocabulario subrayado

Después de pedir que primero se acordara la actividad, el docente eligió listening y luego reading, en dos páginas conectadas, y aprobó la historia de Laura y Mateo y la adaptación de la lectura ya publicada. Añadió el recurso de palabras complejas subrayadas con significado y pronunciación de Intermedio. Se estudió el par de Unidad 3 de Básico 2 y se reutilizó el componente real de The First Visit (Intermedio 2), sin modificar los archivos de ese nivel.

Part 1, `audio-listening-unit-1-a-new-classmate.html`: diálogo de catorce turnos y 185 palabras con Matilda y Sean; duración de unos 72 segundos. Part 2, `reading-unit-1-first-connections.html`: Something in Common, continuación de 144 palabras con información nueva, personalidad apoyada en conductas, segundo interés compartido y decisión final. La lectura conserva su URL y su imagen propia; el listening tiene otra imagen con los mismos personajes ficticios. El orden del Practice Lab es listening, reading y las seis actividades aún pendientes. Listening Library incorpora el acceso al listening, separado de los 417 modelos explicativos.

Cada página contiene diez preguntas A/B/C. El primer intento completo incorrecto invita a escuchar/leer otra vez y el segundo revela respuestas explicadas y evidencia; acertar las diez también permite revisarlas. Las claves de intento son nuevas y separadas por actividad. No se reutilizan como respuestas válidas los borradores del reading anterior ni se crea una nota oficial. Course Overview, las seis explicaciones, Grades, Evaluations y los juegos permanecen intactos.

El glosario tiene diecinueve términos/expresiones: ocho en el apoyo del listening y once en el reading. Significado contextual en español al pasar el cursor o enfocar; pronunciación al tocar/clicar. El foco solo no reproduce sonido. Palabra y conversación se pausan mutuamente; velocidades 0.75, 1 y 1.25, parada y reintento de audio. Se generaron doce pronunciaciones con Sarah y se reutilizaron otras siete con coincidencia literal; Scribe confirmó los trece audios nuevos, incluido el diálogo. El guion docente completo se entrega aparte como archivo en outputs, sin transcripción completa dentro de los archivos estáticos publicados de la actividad.

Fuentes, detalles de medios y consigna de imagen: `docs/preintermediate1-unit1-connected-listening-reading.md`. Contenido canónico: `tools/preintermediate1_unit1_connected_content.py`; generador: `tools/build_preintermediate1_connected.py`, reaplicado al terminar la base de Practice Lab. La cadena completa reproduce las dieciséis páginas sin cambios; once páginas previas distintas de los accesos y actividades actualizados siguen idénticas.

QA local: diez preguntas por página y todas sus evidencias sustentadas; textos coherentes entre las dos partes; audio completo, vocabulario, velocidades, una reproducción activa, foco de teclado y significados en móvil. Se probaron respuestas incompletas, primer intento sin revelar claves, recarga conservando ese intento, segundo intento con diez feedbacks, diez aciertos inmediatos, cambio posterior y reinicio. Treinta y seis combinaciones de páginas/estados/tamaños sin desbordamiento, superposición de QR ni tooltip fuera de pantalla; doce combinaciones adicionales para Practice Lab y Listening Library. Los dos QR ampliaron correctamente en móvil. Informes en `tmp/preintermediate1-connected-qa/`. La revisión local no acredita por sí sola publicación.
