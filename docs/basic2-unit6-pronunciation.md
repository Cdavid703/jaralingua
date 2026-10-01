# Unit 6 — Fabulous Food Pronunciation Studio

## Alcance y estado

Implementación preparada el 29 de septiembre y publicada el 1 de octubre de 2026 con autorización del docente. Página: `ingles/basico-2/pronunciation-unit-6-fabulous-food.html`. Enlazada desde Practice Lab, carpeta de Unidad 6 (actividad 07), y Pronunciation Library. No se modifica Course Overview ni se crean notas reales para probar. Ver `docs/unit6-release-20261001.md`.

Se tomó la página de pronunciación de Unidad 5 como referencia visual y de entrega. La lógica nueva está aislada en `assets/js/english-basic2-pronunciation-unit6.js`; no cambia el comportamiento de las actividades anteriores.

## Secuencia pedagógica

1. Ingredients: recipe, vegetables, chicken, rice, lettuce, salad.
2. Containers and portions: two slices of bread, a bowl of soup, a bottle of water.
3. Ordering politely: I'd like… / Could we have… please?
4. Taste and texture: tender, crunchy, hot, not spicy; repaso was/were.
5. Phrasal verbs: cut up, heat up, ran out of.
6. Habits and an idiom: eat out; have a sweet tooth.
7. Final: concatenación exacta de los seis textos anteriores.

Preparación breve con palabras clickeables, soup/soap, dessert/desert (sustantivo), e I'd like. Todos los textos e instrucciones de la actividad están en inglés. Las expresiones de los retos pertenecen a la teoría de la Unidad 6. La transcripción no se confunde con evaluación fonética de sonidos individuales.

Puntuación por intento: 70% coincidencia textual + 30% completitud, sin penalización de velocidad. Palabras por minuto es informativo. Se guarda el último intento evaluado de cada sección y el promedio de los siete resultados. Un resultado bajo no impide continuar. Las secciones realizadas se pueden volver a visitar. Un fallo de análisis no reemplaza el intento guardado. Se permite repetir indefinidamente.

## Audio e imagen

- 59 modelos de palabra: 35 reutilizados y 24 nuevos.
- 7 modelos completos nuevos: seis secciones y un final.
- Los 31 modelos nuevos se generaron con ElevenLabs, voz Sarah, perfil english-us, modo TTS. Guiones en `ingles/basico-2/audio/unit6/pronunciation/scripts.md`; rutas y procedencia en `manifest.json` y `english-basic2-pronunciation-unit6-data.js`.
- Ningún fallback a la voz genérica del navegador.
- La palabra de la lectura y la palabra resaltada del feedback reproducen el mismo modelo individual. Controles 0.75 y 1.0 para todos los modelos; reproducir modelo detiene los otros audios. Grabar detiene la reproducción para evitar contaminar la toma.
- Imagen propia: `assets/img/english-basic-2/unit-6-fabulous-food/pronunciation-hero.png`, generada con la herramienta integrada de imágenes. Prompt: professional editorial photograph of an adult Latin American learner practicing spoken English into a tabletop microphone, with vegetable soup, grilled chicken, salad and water; natural daylight, realistic setting, wide landscape, no text/logos/watermark. Se conserva el original generado fuera del repo.
- QR SVG propio para la URL de producción, dentro del título, ampliable y centrado.

## Grabación y privacidad

Micrófono circular, selector de dispositivo, medidor de nivel, cronómetro, botón Finish and evaluate, reproducción del último audio, transcripción y feedback. Usa el helper común de permisos. Mensajes para permisos denegados, dispositivo ausente/ocupado, grabación vacía, falta de red y resultado no inglés. La grabación fallida se puede reenviar al analizador sin volver a grabar mientras la página siga abierta. Límite preventivo por toma: 180 segundos.

El progreso textual se guarda por cuenta en este navegador. El trabajo como invitado se puede incorporar a una cuenta nueva solamente después de confirmación visible. Los audios del estudiante permanecen en memoria de la página para su propia reproducción y no sobreviven a una recarga; esto se indica en la explicación de entrega. No se envían al docente como grabaciones.

## Entrega al docente

Endpoint nuevo: `/api/basic2/unit6-food-pronunciation/submit`.

Evaluación: `basic2Unit6FoodPronunciation`. Requiere autenticación, matrícula de Basic 2, siete resultados, textos de referencia exactos y transcripciones no vacías. Guarda un informe escrito (resultados, transcripción, palabras no coincidentes), estado submitted, grade null, weight 0, followUpOnly y doesNotAffectAverage. No registra nota numérica.

El identificador y la copia del informe se guardan antes de la solicitud. Los reintentos conservan ese identificador, incluso después de recargar. El servidor devuelve el mismo recibo para una solicitud duplicada. No se muestra éxito sin `ok`, fecha y el identificador coincidente. Timeout de entrega: 45 s; análisis: 120 s. Los errores liberan botones y conservan el informe. Cambiar de cuenta no entrega resultados de otra persona.

## Pruebas realizadas

- `node --check` para JavaScript y compilación de Python.
- `tools/test_unit6_pronunciation_backend.py`: ejecuta validadores y rama real del endpoint con grilla ficticia en memoria. Verifica siete retos, rechazo de informe incompleto/textos ajenos/transcripción vacía/NaN/ID ausente, entrega sin nota, recibo duplicado, rechazo de cuenta sin matrícula y conservación de notas ajenas. No lee datos académicos reales.
- `tools/test_unit6_pronunciation.cjs`: Chromium con micrófono simulado y respuestas de API interceptadas. Pantallas 360×800, 390×844, 820×1180, 1180×820 y 1440×1000; sin overflow horizontal, hero/header en flujo, ancho útil y QR centrado. Capturas revisadas en escritorio y móvil.
- Verificación HTTP de los 66 modelos de audio (59 palabras + siete lecturas).
- Grabación simulada, puntuación cero sin bloqueo, siete retos, rechazo de resultado francés, reintento de análisis, error de permisos, recuperación de progreso, sesión vencida, respuesta sin recibo, fallo de red, mismo ID tras recarga y aislamiento entre dos cuentas ficticias.
- Prueba real del servicio de transcripción con el modelo de la sección 1: language_code en; texto esperado reconocido. No se usaron grabaciones ni cuentas de estudiantes.

Estas pruebas no sustituyen una prueba física de micrófono en Safari/iPad o Android ni una entrega autenticada de prueba después del despliegue.

## Publicación realizada y límites de verificación

Se realizó commit, push y publicación con respaldo. Como GitHub y producción tienen diferencias previas, solo se aplicó el delta de Unidad 6 sobre el servidor publicado, mediante `tools/deploy_unit6_pronunciation_api.py`. La API quedó saludable y la ruta rechaza entregas sin autenticación con HTTP 401. Las pruebas de recibo e idempotencia se hicieron con datos ficticios en memoria y la interfaz con API interceptada; no equivalen a una entrega real. Sigue pendiente comprobar una entrega y su visualización en Deliverables con una cuenta de prueba autorizada y un micrófono físico.

Practice Lab publicado tiene ocho actividades en Unidad 6, incluida Market Basket Challenge (06), pronunciación (07) y Stone Soup (08). No se reconstruyó ni publicó el listening independiente que no se encontró en los archivos revisados.
