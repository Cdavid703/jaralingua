# Guia de correccion: pronunciacion - Frances

Ultima actualizacion: 2026-07-17.

Esta guia es la referencia general para corregir actividades de pronunciacion de frances en cualquier nivel. Las guias por nivel deben usar este archivo como base y conservar solo el inventario, estados y excepciones propias de cada curso.

## Principio central

El reconocimiento automatico de voz ayuda a estimar una lectura, pero no prueba por si solo si la pronunciacion es buena o mala. Una transcripcion puede fallar por ruido, microfono, distancia, acento, compresion del navegador, homofonia, segmentacion de palabras o variacion legitima del frances.

Por tanto:

- El resultado automatico se presenta como estimacion formativa o provisional.
- La confianza del STT no se convierte directamente en nota.
- La grabacion del estudiante es la evidencia principal cuando la actividad se envia al docente.
- Una advertencia tecnica nunca debe decir que el estudiante pronuncia mal.
- El estudiante debe poder repetir o continuar despues de un resultado calculado con reserva.

## Flujo minimo de una actividad

1. Reproducir modelo de audio y texto esperado.
2. Grabar una muestra del estudiante desde una accion explicita.
3. Enviar audio bruto al servicio de transcripcion; no envolver el audio en `FormData` si el endpoint espera el cuerpo binario.
4. Evaluar la transcripcion con comparacion tolerante.
5. Mostrar score, metricas, transcripcion y advertencia de fiabilidad si aplica.
6. Permitir repetir, avanzar o enviar segun el tipo de actividad.
7. Guardar localmente el intento con version de datos y migracion controlada si cambia el formato.

## Calibracion

Cuando la actividad incluya o requiera calibracion:

- Grabar una muestra real de aproximadamente tres segundos.
- Verificar permiso, microfono disponible, nivel de entrada y transcripcion basica.
- Permitir escuchar la muestra para detectar microfono equivocado, audio saturado o volumen bajo.
- No guardar la muestra de calibracion.
- Detener las pistas del microfono al finalizar, cancelar o cambiar de intento.
- Mantener `echoCancellation`, `noiseSuppression`, `autoGainControl` y canal mono como preferencias, no como requisitos absolutos.

## Comparacion tolerante

No volver a una comparacion literal palabra por palabra. La normalizacion debe aceptar:

- Acentos ortograficos omitidos o alterados por el STT.
- Apostrofes, guiones y segmentaciones diferentes.
- Contracciones orales frecuentes: `j'sais / je sais`, `y a / il y a`, `t'as / tu as`.
- Segmentaciones como `m'habille / me habille`, `j'ai / jai`, `c'est / cest`.
- Homofonos y marcas silenciosas de genero, numero o conjugacion cuando no cambian la evidencia acustica.
- Una palabra reconocida como dos o tres tokens, y el caso inverso.

La comparacion debe priorizar inteligibilidad, fidelidad al texto esperado y completitud razonable, no ortografia exacta de la transcripcion.

## Score automatico

La formula base compartida para pronunciacion es:

- Fidelidad: 55%.
- Completitud: 35%.
- Ritmo: 10%.

El ritmo se calcula con marcas temporales de palabras reconocidas cuando existan. No usar el tiempo total entre tocar `Grabar` y `Detener`, porque incluye silencios operativos. La franja aceptable debe ser amplia y ajustarse al nivel: un A1 puede leer despacio si conserva inteligibilidad; niveles altos pueden tolerar mayor velocidad natural sin castigo automatico.

## Incertidumbre tecnica

Un intento puede tener score y aun asi estar marcado como dudoso. La incertidumbre no bloquea el avance.

Reglas:

- Si existe transcripcion util, calcular el score aunque la confianza sea baja.
- Si no se reconoce ninguna palabra, tratarlo como falta de evidencia tecnica: conservar el audio para escucha, no crear nota, no pintar palabras como incorrectas y pedir un nuevo intento.
- Si hay senal debil pero texto util, mostrar el score con reserva.
- Si hay error HTTP, caida de red o fallo del servicio, no inventar nota; mostrar reintento.
- `null` significa ausencia de intento; `0` solo significa intento evaluado cuando existe transcripcion util suficiente para comparar.
- Silencio, audio vacio y transcripcion vacia no son desempeno de pronunciacion y nunca deben convertirse en `0` real.
- Un intento dudoso bajo no debe reemplazar un intento fiable anterior mejor.

Campos recomendados para persistencia y envio:

```js
{
  score,
  transcript,
  targetText,
  metrics,
  uncertain,
  uncertaintyReasons,
  uncertaintyMessage,
  audioDataUrl
}
```

## Actividades calificables y formativas

Cada nivel debe documentar que actividades son calificables y cuales son solo practica.

Para actividades calificables:

- El boton de envio se activa con un intento real, incluso si el score es `0`.
- El boton no se activa cuando el intento final es `null`.
- El envio incluye audio final, transcripcion, texto esperado, score, metricas e incertidumbre.
- El carnet o panel docente muestra reproductor, transcripcion, referencia, estimacion y advertencia de fiabilidad.
- La pantalla confirma que el envio termino y recupera el boton despues de error.
- Una nueva entrega del mismo estudiante y la misma evaluacion reemplaza la entrega anterior; no se bloquean segundos intentos.
- El reinicio local no borra silenciosamente la nota del servidor. La interfaz debe explicar que la siguiente entrega sera la que la reemplace.

Para actividades divididas en varias secciones:

- Distinguir `Recommencer` (solo el intento de la seccion actual) de `Recommencer toute l'activite` (todo el progreso local de esa actividad).
- El reinicio completo elimina las claves vigente y heredada de `localStorage`, vuelve a la primera seccion y pide confirmacion antes de actuar.
- Al migrar datos antiguos, retirar automaticamente solo ceros tecnicos inequivocos: score `0` con `analysisUnavailable`, transcripcion vacia o el texto `Analyse automatique indisponible`.
- Conservar cualquier score `0` que tenga una transcripcion util, porque puede ser un resultado real.

Para actividades formativas:

- No mostrar panel de envio al profesor.
- Mantener el mismo motor de evaluacion y los mismos estados de incertidumbre.
- Permitir reinicio o repeticion sin afectar actividades calificables.

## Revision tema por tema

Antes de tocar codigo en un nivel:

- Hacer inventario de paginas, controladores, audios y enlaces desde el menu de actividades.
- Confirmar si el tema tiene actividad de pronunciacion. Si no existe, marcar `No aplica` en la guia del nivel.
- Identificar si la actividad es calificable o formativa.
- Validar que el audio modelo coincida con el texto mostrado.
- Revisar version de `localStorage` y migracion desde datos anteriores.
- Confirmar que el motor compartido se carga antes del controlador de la pagina.

Al cerrar cada tema:

- Prueba de lectura exacta.
- Prueba con apostrofes, acentos u homofonos.
- Transcripcion vacia como intento no calificable, sin palabras rojas y con reintento visible.
- Senal debil con transcripcion util.
- Repeticion despues de un intento fiable.
- Activacion correcta del envio cuando corresponda.
- `node --check` del controlador editado.
- Prueba automatizada del evaluador o del flujo de la actividad.
- `git diff --check`, aceptando solo advertencias conocidas de finales de linea si no son parte del cambio.
- QA de navegador y microfono cuando sea posible.

## Responsive y accesibilidad

Las actividades deben funcionar en movil, tablet y escritorio.

- Botones tactiles de al menos 44 px.
- Textos, metricas, reproductores y paneles sin desbordes.
- Estados visibles: preparado, grabando, analizando, resultado, error, reintentar y enviado.
- El texto de botones no debe cambiar el tamano del boton.
- No permitir dos grabaciones simultaneas.
- Respetar permisos del navegador y liberar el microfono al terminar.

Viewports minimos sugeridos:

- 360 x 800.
- 390 x 844.
- 768 x 1024.
- 1024 x 768.
- 1366 x 768.

## Decisiones que no se deben revertir

- No bloquear el avance solo porque el reconocimiento sea incierto.
- No convertir confianza STT en diagnostico fonetico.
- No volver a comparacion literal palabra por palabra.
- No exigir un ritmo unico para todos los niveles.
- No borrar un mejor intento fiable con un intento dudoso peor.
- No confundir `null` con `0`.
- No enviar actividades formativas como si fueran calificables.
- No guardar muestras de calibracion.
- No presentar liaisons o enchainements como comprobaciones acusticas automaticas si el sistema no puede oirlas de forma verificable.
- No perder audio, transcripcion ni advertencias de incertidumbre en el carnet docente.
