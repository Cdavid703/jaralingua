# Guia de correccion: pronunciacion - Frances Nivel 2

Ultima actualizacion: 2026-07-17.

Esta guia adapta las reglas generales de `docs/guia-correccion-pronunciacion-frances.md` a las actividades de pronunciacion A1.2 de `frances/Niveau 2/`. La guia mixta de nivel 8 sigue siendo referencia historica para decisiones ya aprobadas de pronunciacion y coach de conversacion.

## Alcance

Actividades de pronunciacion existentes:

| Tema | Pagina | Controlador | Estado |
| --- | --- | --- | --- |
| 1 | `ateliers/prononciation.html` | `assets/pronunciation-a2.js` | Correccion aplicada; QA navegador pendiente |
| 2 | `ateliers/prononciation-vetements.html` | `assets/pronunciation-a2-theme2.js` | Correccion aplicada; QA navegador pendiente |
| 3 | `ateliers/prononciation-logement.html` | `assets/pronunciation-a2-theme3.js` | Correccion aplicada; QA navegador pendiente |
| 4 | `ateliers/prononciation-restaurant.html` | `assets/pronunciation-a2-theme4.js` | Correccion aplicada; QA navegador pendiente |
| 5 | `ateliers/prononciation-sante.html` | `assets/pronunciation-a2-theme5.js` | Correccion aplicada; QA navegador pendiente |
| 6 | `ateliers/prononciation-plans.html` | `assets/pronunciation-a2-theme6.js` | Correccion aplicada; QA navegador pendiente |
| 7 | `ateliers/prononciation-directions.html` | `assets/pronunciation-a2-theme7.js` | Correccion aplicada; QA navegador pendiente |
| 8 | No hay actividad de pronunciacion existente | No aplica | Tema de consolidacion gramatical; no requiere correccion de pronunciacion |

Las actividades calificables del carnet son temas 1, 3, 5 y 7. Temas 2, 4 y 6 pueden usar el mismo motor como practica formativa, sin panel de envio.

## Reglas que se heredan de la guia general

- La transcripcion automatica no es una prueba absoluta de mala pronunciacion.
- El resultado debe llamarse estimacion formativa o provisional.
- La comparacion debe ser tolerante con acentos, apostrofes, homofonos, segmentacion de palabras y marcas silenciosas.
- La confianza de Whisper no se convierte en nota; solo produce una bandera de fiabilidad tecnica.
- Una transcripcion vacia no genera nota ni palabras rojas: conserva el audio para escucha y exige repetir, salvo que ya exista un intento anterior valido para esa seccion.
- Un error HTTP o de conexion no genera nota; debe pedir reintento.
- Un intento dudoso bajo no debe borrar un intento fiable anterior mejor.
- El audio final es la evidencia principal cuando se envia al profesor.
- El carnet debe mostrar audio, transcripcion, texto de referencia, score automatico y advertencia si el reconocimiento fue incierto.

## Adaptaciones para A1.2

- Las frases son cortas, asi que la completitud no debe castigar variantes inaudibles como `m'habille` frente a `me habille`.
- El ritmo esperado debe ser amplio. Un estudiante A1.2 puede leer despacio si conserva inteligibilidad.
- Los mensajes de feedback deben enfocarse en repetir grupos de sentido, no en diagnosticar fonetica fina.
- Las actividades con tres mini-desafios y un desafio final conservan el avance por secciones.
- La calibracion debe ser simple: prueba real de tres segundos, reproduccion de muestra, senal suficiente y transcripcion basica. La muestra no se guarda.

## Orden de trabajo recomendado

1. Corregir y validar `prononciation.html` como piloto.
2. Extraer el patron estable a un motor compartido de nivel 2.
3. Migrar temas 2, 3, 4, 5, 6 y 7 en orden.
4. Confirmar que solo temas 1, 3, 5 y 7 muestren envio al profesor.
5. Revisar `notes-evaluation.html` para evidencias y advertencias.

## Criterio de cierre por actividad

- El audio modelo coincide con el texto mostrado.
- La grabacion se envia como audio bruto al servicio de transcripcion, no como `FormData`.
- La estimacion usa el evaluador tolerante compartido.
- La pantalla distingue resultado fiable y resultado con reserva.
- El estudiante puede repetir o continuar despues de un resultado dudoso.
- El boton de envio se activa con un `0` real, pero no con ausencia de intento.
- El envio incluye audio final, transcripcion, texto esperado, score, metricas e incertidumbre.
- La actividad no desborda en movil.
