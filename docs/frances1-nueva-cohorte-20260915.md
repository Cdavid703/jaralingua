# Francés 1: nueva cohorte, pronunciación y examen final

## Alcance

- Cuatro estudiantes nuevos, transcritos del adjunto del usuario. Los datos personales se gestionan en un archivo privado ignorado por Git y en la grilla privada del VPS.
- Se conservan los correos de profesora y administrador.
- Pronunciaciones entregables: temas 3, 5 y 7, con 5 % cada uno.
- Tema 1 queda como práctica formativa. El 5 % liberado queda en una columna « Évaluation à définir (5 %) », sin inventar una actividad. Se conservan examen final 20 %, proyecto 20 % y evaluación libre 40 %.
- El examen final queda cerrado, sin resultados publicados, sin intentos ni entregas de la cohorte anterior en la grilla activa.

## Respaldo y cambio de cohorte

`tools/reset_french1_cohort.py` valida la lista y los pesos antes de escribir. Por defecto solo valida; `--apply` crea un respaldo privado de la grilla, el examen, sus intentos y los audios de pronunciación, y reemplaza los tres JSON conservando permisos. Debe ejecutarse con el servicio de progreso detenido para evitar escrituras concurrentes.

El respaldo inicial de producción quedó en `/root/backups/french1-new-cohort-20260915T134039Z`. La ejecución definitiva genera además `/root/backups/french1-cohort-reset-<fecha UTC>`.

Los estudiantes acceden con su correo registrado. El acceso por correo y contraseña conserva la convención documento seguido de `*`. Nunca publicar la lista ni contraseñas en assets o Markdown públicos.

## Pronunciación

- Se conserva el reconocimiento compartido `/api/french8/pronunciation-assessment`, cuya ruta fija el idioma `fr`. Su nombre histórico no cambia el nivel de entrega: las notas se envían a `/api/french1/pronunciation-grade`.
- Se comprobó el servicio real del VPS con los modelos de los temas 3, 5 y 7. Los tres devolvieron francés y el contenido correspondiente. Whisper puede escribir homófonos como « mais » por « mes »: la transcripción no constituye prueba absoluta de un error de pronunciación.
- El botón no se activa por convertir un intento nulo en cero. Un cero obtenido en un intento válido sigue siendo enviable.
- El envío exige el audio del mismo intento evaluado. No se toma el audio del reproductor, que podría corresponder a otra sección o a un intento rechazado.
- El servidor exige audio conservable antes de guardar la nota. La docente conserva audio, referencia, transcripción y estimación para revisar.
- Las palabras del texto, incluidas las rojas, son botones. Al pulsarlas se pausan modelo y grabación y se lee solo la palabra con una voz francesa. Si el dispositivo no dispone de voz francesa, se informa cómo habilitarla; no se sustituye por una voz inglesa.
- Se corrigieron consejos sobre enchaînement y consonantes finales. Se retiraron deducciones fonéticas automáticas basadas solo en fragmentos de letras, que podían ofrecer explicaciones falsas.

## Examen final

- Se preserva la estructura de 50 puntos y la nota sobre 5, con sincronización a la grilla y revisión docente.
- La pregunta v2 ahora pide completar « On va au ___ pour voir un film. »: el enunciado anterior revelaba cinéma.
- Nueva versión de la cohorte: `2026-09-15-cohort-v3`. Las opciones se mezclan por intento.
- Se conserva el audio privado y su transcripción. La coherencia de preguntas, texto y puntuación se verificó con la suite existente.
- La credencial limitada al intento caduca a las 12 horas; ya no hereda los 30 días del acceso general.

## Verificación

Sin levantar servidores locales:

- `python tools/test_french1_cohort_reset.py`
- `python tools/test_french_final_exam_backend.py`
- `python tools/test_french_final_exams.py`
- `node tools/test_french1_word_playback.cjs`
- `node tools/test_french1_french8_pronunciation_recording_guard.cjs`

Las pruebas cubren respaldo/preparación, conservación de docente, pesos, acceso por correo, evidencia, voz francesa, cierre, autenticación, respuestas, puntuación y envío. No sustituyen una prueba con el micrófono físico de cada modelo de teléfono.

El VPS contiene cambios ajenos a esta tarea. El despliegue debe aplicar únicamente el parche del backend y los archivos de Francés 1; nunca reemplazar todo el backend ni restablecer el repositorio remoto.
