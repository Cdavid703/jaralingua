# Plan maestro - Frances Nivel 8

Fuente de trabajo: `docs/guia-construccion-frances-nivel8.md`.

Este plan traduce la guia de construccion y la carta descriptiva resumida del Nivel 8 en una ruta de ejecucion. El objetivo no es llenar el curso de tarjetas sueltas, sino cerrar cada tema con coherencia: explicacion, escucha, lectura, gramatica, pronunciacion, conversacion, produccion y evaluacion.

## 1. Principio rector

Nivel 8 debe funcionar como transicion B1+ hacia B2. Cada tema debe entrenar argumentacion, matiz, analisis, comprension oral natural, produccion estructurada y conciencia sociolinguistica.

Antes de cerrar una actividad, debe responder afirmativamente a estas preguntas:

- El estudiante entiende para que sirve la estructura en una situacion real?
- La actividad exige una respuesta B1+/B2, no una respuesta mecanica?
- Hay conectores, vocabulario tematico y expresiones integradas?
- Las preguntas tienen distractores plausibles y no opciones tontas?
- El audio dura aproximadamente entre 1 minuto y 30 segundos y 2 minutos?
- La transcripcion coincide palabra por palabra con el audio?
- Las preguntas de escucha dependen solo de informacion que aparece en el audio/transcripcion?
- La lectura principal tiene entre 150 y 200 palabras?
- Las preguntas de lectura dependen solo de informacion que aparece en el texto?
- La produccion generada puede revisarse o alimentar el carnet de notas cuando corresponda?

## 2. Estado actual detectado

| Tema | Pagina principal | Audios completos | Comprensiones HTML | Pronunciacion | Gramatica/juego/produccion | Estado |
| --- | --- | --- | --- | --- | --- | --- |
| 01. Regrets, reproches et bilans | Existe | 6 archivos | 01A, 01B, 01C | 01D existe | 01G, 01R y 01E existen | Cerrado pedagogicamente; pendiente opcional: envio docente/notas para 01E |
| 02. Hypotheses irreelles dans le passe | Existe | 6 archivos | 02A, 02B, 02C | 02D existe | 02G, 02R y 02E existen | Cerrado pedagogicamente; pendiente escucha humana final/STT |
| 03. Jugement, emotion et anteriorite | Existe | 6 archivos | 03A, 03B, 03C | 03D existe | 03G, 03R y 03E existen | Cerrado pedagogicamente; pendiente escucha humana final/STT |
| 04. Discours rapporte avance | Existe | 6 archivos | 04A, 04B, 04C | 04D existe | 04G, 04R y 04E existen | Cerrado pedagogicamente; pendiente escucha humana final/STT |
| 05. Medias et desinformation | Existe | 6 archivos | 05A, 05B, 05C | 05D existe | 05G, 05R y 05E existen | Cerrado pedagogicamente; pendiente escucha humana final/STT |
| 06. Intelligence artificielle et ethique numerique | Falta | 6 archivos | Faltan 06A, 06B, 06C | Falta | Falta todo el bloque pedagogico | Prioridad media-alta |
| 07. Justice sociale, egalite et citoyennete | Falta | 6 archivos | Faltan 07A, 07B, 07C | Falta | Falta todo el bloque pedagogico | Prioridad media |
| 08. Francophonie, registres et francais oral authentique | Falta | 6 archivos | Faltan 08A, 08B, 08C | Falta | Falta todo el bloque pedagogico | Prioridad media |

Hallazgo importante: la carpeta `frances/Niveau 8/audio/complete` ya contiene los 48 audios esperados: 8 temas x 3 actividades x 2 acentos. La brecha principal no es generar audio, sino construir paginas, controles, preguntas visibles, lecturas, juegos y producciones que usen esos audios con coherencia.

## 3. Arquitectura final por tema

Cada tema debe terminar con estos bloques minimos:

- Pagina principal del tema con gramatica detallada y ejemplos.
- Tres comprensiones orales: A, B y C, con version Francia y Quebec.
- Una actividad de pronunciacion: D.
- Una actividad de gramatica o transformacion contextual: G.
- Una actividad de conversacion, debate, simulacion o juego: R.
- Una produccion escrita u oral conectada al proyecto final: E.
- Una lectura inferencial de 150 a 200 palabras, integrada a la pagina principal o como taller propio si el tema lo exige.

## 4. Orden maestro de ejecucion

### Fase 1 - Cerrar la base visible

1. Hacer que `ateliers-activites.html` cumpla la regla de la guia: temas agrupados y colapsados por defecto.
2. Eliminar textos visibles de "en construccion" donde haya un enlace real o una ruta planificada.
3. Crear tarjetas visibles para temas 06, 07 y 08 aunque inicialmente queden como rutas futuras controladas.
4. Asegurar que todos los enlaces de temas 1 y 2 funcionen y no dependan de scripts para aparecer.

### Fase 2 - Completar temas 3 a 5

1. Tema 03: cerrado pedagogicamente; queda pendiente solo escucha humana final/STT.
2. Tema 04: cerrado pedagogicamente; queda pendiente solo escucha humana final/STT.
3. Tema 05: cerrado pedagogicamente; queda pendiente solo escucha humana final/STT.
4. Siguiente bloque: iniciar Tema 06 con pagina principal, lectura, 06A-06C, gramatica, conversacion y produccion.

### Fase 3 - Construir temas 6 a 8

1. Tema 06: IA, etica digital, causa/consecuencia/but y comite etico.
2. Tema 07: justicia social, igualdad, concesion/oposicion y debate ciudadano.
3. Tema 08: registros, oralidad autentica, reducciones, verlan como comprension cultural y transformador de registro.
4. Crear pronunciaciones 06D, 07D y 08D con audio modelo y secciones.

### Fase 4 - Proyecto y evaluacion

1. Construir `Dossier B2 : un dilemme contemporain`.
2. Conectar el proyecto final con el carnet de notas.
3. Construir simulacro formativo sobre 50 puntos.
4. Construir examen final cerrado por docente, sin respuestas expuestas en frontend.
5. Auditar ponderaciones contra el panel de notas.

### Fase 5 - QA pedagogica y tecnica

1. Auditar audios, transcripciones y preguntas tema por tema.
2. Verificar que cada audio dure aproximadamente entre 1 minuto y 30 segundos y 2 minutos.
3. Verificar que cada transcripcion coincida palabra por palabra con el audio real.
4. Verificar que cada audio tenga minimo 8 preguntas; idealmente 10.
5. Revisar que no haya preguntas literales faciles, opciones absurdas ni patron de respuesta.
6. Verificar que cada lectura principal tenga entre 150 y 200 palabras y preguntas coordinadas con el texto.
7. Verificar controles de audio, acentos, progreso, velocidad y acceso docente a transcripcion.
8. Revisar textos franceses: acentos, coherencia gramatical, registros y ausencia de mojibake.
9. Probar localmente y desplegar por lotes al VPS con backup.

## 5. Primer sprint recomendado

El primer sprint debe ser estructural y de bajo riesgo:

1. Ajustar `ateliers-activites.html` para que los temas se desplieguen por seccion, no todos abiertos.
2. Crear la pagina principal del Tema 05.
3. Crear las comprensiones 05A, 05B y 05C reutilizando los audios existentes.
4. Conectar Tema 05 en `themes-du-cours.html` y `ateliers-activites.html`.
5. Ejecutar QA local: enlaces, HTTP 200, ausencia de mojibake, preguntas y controles.

Este orden evita construir primero actividades sueltas. Los temas 03, 04 y 05 ya quedaron como bloques completos; el siguiente punto de arranque coherente es Tema 06.
