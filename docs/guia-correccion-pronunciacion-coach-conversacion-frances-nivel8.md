# Guia de correccion: pronunciacion y coach de conversacion - Frances Nivel 8

Ultima actualizacion: 2026-07-17.

Este archivo es la fuente de verdad para corregir las actividades de pronunciacion `01D-09D` y los coaches de conversacion `01O-08O` de Frances Nivel 8. Para reglas transversales de pronunciacion en cualquier nivel, usar `docs/guia-correccion-pronunciacion-frances.md`; este archivo conserva el inventario, estados y decisiones especificas de nivel 8, incluida la parte de coach de conversacion. Debe leerse antes de modificar cualquiera de esas actividades. Su objetivo es evitar depender del historial del chat y conservar las decisiones pedagogicas, tecnicas y de privacidad ya aprobadas.

## 1. Punto de reanudacion

Estado al cerrar esta guia:

- El nuevo motor compartido de pronunciacion esta implementado localmente en `assets/js/french8-pronunciation-assessment.js`.
- Las nueve actividades `01D-09D` ya consumen ese motor. `01D` y `02D` ya muestran resultados dudosos sin bloquear el avance; `03D-09D` conservan QA individual pendiente y pueden contener todavia el estado temporal `Essai non note`, que debe retirarse al revisarlas.
- La calibracion de microfono, la alineacion tolerante, el tratamiento de variantes orales y la advertencia de fiabilidad ya estan implementados localmente.
- El panel de envio y `Notes du cours` ya distinguen una estimacion normal de una estimacion con reconocimiento incierto.
- El backend ya conserva la marca de incertidumbre junto con el intento enviado.
- Existe la prueba `tools/test_french8_pronunciation_assessment.cjs` y esta aprobada.
- `01D` y `02D` se cierran en la tanda del 2026-07-17; el trabajo pendiente comienza en `03D`.
- `01D` y `02D` ya tienen validacion individual local. Falta continuar desde `03D` y despues corregir el motor compartido del coach de conversacion.
- Los coaches `01O-08O` todavia muestran un icono generico y una imagen contextual; falta construir el escenario visible del personaje.
- No se debe iniciar un servidor local para esta tarea.

## 2. Orden obligatorio de trabajo

No corregir todas las paginas a ciegas ni empezar por una actividad aleatoria.

1. Validar completamente `Prononciation 01D - Le conditionnel passe a voix haute`.
2. Validar en orden `02D`, `03D`, `04D`, `05D`, `06D`, `07D`, `08D` y `09D`.
3. Corregir el motor compartido del coach usando `Coach de conversation 01O` como piloto.
4. Validar en orden `02O`, `03O`, `04O`, `05O`, `06O`, `07O` y `08O`.
5. Hacer una auditoria transversal final de movil, tablet, escritorio, persistencia y estados de error.
6. Al cerrar cada actividad, ejecutar sus pruebas, crear un commit atomico, desplegarla al VPS y verificar produccion antes de pasar a la siguiente.

La primera actividad es `01D` porque contiene el recorrido mas completo: cuatro secciones, desafio final, repeticion, progreso, resultado automatico, audio final, envio al docente y revision en `Notes du cours`. Si este flujo queda estable, sirve como patron verificable para las demas actividades de pronunciacion.

## 3. Inventario tecnico

### Pronunciacion

Motor y soporte compartido:

- `assets/js/french8-pronunciation-assessment.js`
- `assets/css/french8-pronunciation-mobile.css`
- `assets/js/french8-pronunciation-grade-submit.js`
- `assets/js/french8-pronunciation-liaisons.js`
- `assets/js/french8-grades.js`
- `server/progress_api.py`
- `tools/french8_pronunciation_server_local.py`
- `tools/test_french8_pronunciation_assessment.cjs`

Paginas y controladores:

| Actividad | Pagina | Controlador |
| --- | --- | --- |
| 01D | `prononciation-01d-conditionnel-passe.html` | `french8-pronunciation-sections.js` |
| 02D | `prononciation-02d-hypotheses-irreelles-passe.html` | `french8-pronunciation-theme02.js` |
| 03D | `prononciation-03d-subjonctif-passe.html` | `french8-pronunciation-theme03.js` |
| 04D | `prononciation-04d-discours-rapporte.html` | `french8-pronunciation-theme04.js` |
| 05D | `prononciation-05d-medias-desinformation.html` | `french8-pronunciation-theme05.js` |
| 06D | `prononciation-06d-ia-ethique.html` | `french8-pronunciation-theme06.js` |
| 07D | `prononciation-07d-justice-sociale.html` | `french8-pronunciation-theme07.js` |
| 08D | `prononciation-08d-francais-oral.html` | `french8-pronunciation-theme08.js` |
| 09D | `prononciation-09d-precision-syntaxique.html` | `french8-pronunciation-theme09.js` |

Las paginas estan en `frances/Niveau 8/ateliers/` y los controladores en `assets/js/`.

### Coach de conversacion

Motor compartido:

- `assets/js/oral-unit-practice-engine.js`

Datos por tema:

- `assets/js/oral-unit-practice-data/french-level-8-theme-1.js`
- `assets/js/oral-unit-practice-data/french-level-8-theme-2.js`
- `assets/js/oral-unit-practice-data/french-level-8-theme-3.js`
- `assets/js/oral-unit-practice-data/french-level-8-theme-4.js`
- `assets/js/oral-unit-practice-data/french-level-8-theme-5.js`
- `assets/js/oral-unit-practice-data/french-level-8-theme-6.js`
- `assets/js/oral-unit-practice-data/french-level-8-theme-7.js`
- `assets/js/oral-unit-practice-data/french-level-8-theme-8.js`

Paginas:

| Actividad | Pagina |
| --- | --- |
| 01O | `coach-conversation-01-regrets-reproches-bilans.html` |
| 02O | `coach-conversation-02-hypotheses-irreelles-passe.html` |
| 03O | `coach-conversation-03-subjonctif-passe.html` |
| 04O | `coach-conversation-04-discours-rapporte.html` |
| 05O | `coach-conversation-05-medias-desinformation.html` |
| 06O | `coach-conversation-06-ia-ethique.html` |
| 07O | `coach-conversation-07-justice-sociale.html` |
| 08O | `coach-conversation-08-registres-francophonie.html` |

## 4. Principio pedagogico central

Whisper es un sistema de transcripcion, no un evaluador fonetico completo. Una transcripcion incorrecta puede deberse a pronunciacion, ruido, distancia, microfono, compresion del navegador, cancelacion de ruido, nombre propio, homofonia o variacion legitima del frances.

Por tanto:

- La transcripcion no se presenta como prueba absoluta de mala pronunciacion.
- La confianza STT no se convierte directamente en una nota de pronunciacion.
- Un resultado automatico siempre se denomina estimacion provisional o formativa.
- La pagina debe separar el puntaje calculado de la fiabilidad tecnica del reconocimiento.
- Una advertencia tecnica nunca debe decir que el alumno habla mal.
- La grabacion es la evidencia principal cuando la actividad se envia al docente.
- No se exige imitar un acento unico para considerar comprensible una produccion.

## 5. Reglas obligatorias para pronunciacion

### 5.1 Calibracion antes de evaluar

- La calibracion debe grabar una muestra real de aproximadamente tres segundos.
- Debe comprobar permiso, microfono seleccionado, nivel de entrada y transcripcion basica.
- Debe permitir escuchar la muestra para detectar un microfono equivocado o audio saturado.
- La muestra no se almacena.
- El estudiante debe poder cambiar de microfono cuando el navegador exponga varios dispositivos.
- La distancia orientativa es de 15 a 25 cm, sin tapar el microfono del telefono.

### 5.2 Comparacion tolerante

La comparacion debe aceptar:

- Acentos ortograficos omitidos por STT.
- Apostrofes y segmentaciones diferentes.
- Homofonos franceses cuando la diferencia no es audible.
- Marcas de genero o numero silenciosas.
- Contracciones orales como `j'sais / je sais`, `y a / il y a` y `t'as / tu as`.
- Una palabra reconocida como dos o tres tokens, y el caso inverso.

No volver a una comparacion literal palabra por palabra.

### 5.3 Ritmo

- Calcular el ritmo con las marcas temporales de la primera y la ultima palabra reconocida.
- No usar el tiempo total entre tocar `Grabar` y tocar `Detener`, porque incluye silencios operativos.
- No exigir exactamente 125 palabras por minuto.
- Aceptar una franja amplia de ritmo natural y penalizar solo extremos claros.
- El ritmo tiene un peso menor que fidelidad y completitud.

### 5.4 Formula actual de pronunciacion

La estimacion compartida usa:

- Fidelidad: 55%.
- Completitud: 35%.
- Ritmo: 10%.

La formula es provisional y no reemplaza la escucha docente.

### 5.5 Resultado dudoso sin bloqueo

No existe un minimo de dos puntos para avanzar. El avance depende de que el intento termine su flujo de evaluacion.

Regla obligatoria:

- Si existe una respuesta del STT, calcular el resultado aunque la confianza sea baja.
- Marcar el intento con `uncertain: true` y explicar la causa tecnica.
- Mostrar en frances: `Résultat calculé avec réserve. Vous pouvez refaire l'essai ou continuer.`
- Habilitar siempre `Section suivante` o su equivalente despues del calculo.
- Si no se reconoce ninguna palabra, mostrar `0` como resultado dudoso y permitir repetir o continuar.
- No inventar una nota media para compensar una falla tecnica.
- Un error HTTP o una caida del servicio no es un resultado dudoso: debe mostrar error de conexion y una opcion clara para reintentar.

Motivos iniciales de incertidumbre manejados por el motor:

- `no_speech`
- `too_short`
- `weak_signal`
- `language_uncertain`
- `recognition_uncertain`
- `insufficient_evidence`

### 5.6 Proteccion del progreso

- Un intento dudoso bajo no debe reemplazar un intento fiable anterior mejor.
- Todos los intentos pueden quedar en el historial local, pero el resultado seleccionado para progreso debe proteger el mejor intento fiable.
- `null` significa que todavia no existe intento; no debe convertirse accidentalmente en `0`.
- Un `0` real y dudoso debe seguir siendo un intento valido y distinto de `null`.
- El boton para reiniciar todo el desafio debe borrar secciones, historial y audio local solo despues de confirmacion.

### 5.7 Liaisons y enchainements

- Whisper no confirma de forma acustica que una liaison se haya producido.
- Las liaisons solo generan orientacion pedagogica, nunca puntos automaticos.
- No marcar como obligatoria una liaison prohibida, rara o discutible.
- El mensaje debe invitar a comparar con el modelo, no afirmar falsamente que el sistema oyo la consonante de liaison.

### 5.8 Envio y notas

- `01D-04D` conservan el flujo calificable y enviable aprobado.
- `05D-08D` no deben mostrar un panel de envio calificable.
- `09D` mantiene su configuracion formativa existente salvo decision docente posterior.
- La nota enviada es provisional y el docente puede corregirla.
- El audio final debe viajar con el intento cuando la actividad lo exige.
- La pantalla del estudiante debe confirmar que el envio termino.
- El boton no puede quedarse congelado en `Envoi...`.
- `Notes du cours` debe mostrar reproductor, transcripcion, texto de referencia, estimacion y advertencia de incertidumbre.
- El backend debe conservar `uncertain`, `uncertaintyReasons` y `uncertaintyMessage`.

## 6. Reglas obligatorias para el coach de conversacion

### 6.1 Objetivo distinto

El coach evalua si el estudiante responde, desarrolla una idea y usa recursos del tema. No debe pedir que repita literalmente la respuesta modelo. La respuesta modelo es una ayuda, no la unica respuesta correcta.

### 6.2 Problemas que se deben corregir

El motor actual usa coincidencias de subcadenas y transforma la confianza Whisper en un puntaje de claridad. Tambien calcula fluidez con la duracion total de grabacion. Estos tres comportamientos deben corregirse.

### 6.3 Comprobaciones linguisticas

- Reemplazar `normalized.includes(...)` por coincidencia de tokens y frases con limites reales.
- Aceptar apostrofes, acentos, contracciones y variantes de transcripcion.
- Cada criterio debe incluir varias realizaciones validas, no una frase unica.
- Permitir sinonimos pedagogicamente razonables definidos en los datos de cada pregunta.
- Evitar falsos positivos de palabras contenidas dentro de otras palabras.
- Revisar las seis preguntas de cada tema, sus ayudas, estructuras, vocabulario y modelos.
- No penalizar una respuesta valida solo porque usa una formulacion diferente.

### 6.4 Puntaje formativo propuesto

El puntaje debe priorizar comunicacion:

- Cumplimiento de la tarea: 40%.
- Recursos linguisticos o estructura del tema: 25%.
- Desarrollo y coherencia: 20%.
- Fluidez temporal: 15%.

La confianza STT no debe formar una categoria de pronunciacion. Debe producir una bandera separada de fiabilidad tecnica.

### 6.5 Fluidez y duracion

- Usar tiempos de palabras reconocidas cuando existan.
- No premiar una grabacion larga con silencios.
- No penalizar una respuesta breve si cumple completamente la consigna y supera el minimo razonable.
- Los limites de palabras son guias de desarrollo, no barreras rigidas.

### 6.6 Estados dudosos y avance

- Un intento con transcripcion dudosa recibe puntaje formativo y advertencia.
- El estudiante puede repetir o continuar.
- Una transcripcion vacia produce `0` dudoso, no una pantalla congelada.
- Un error de red debe ofrecer reintento y, si persiste, `Continuer sans score` marcado como intento omitido.
- El resumen debe distinguir respuestas fiables, dudosas y omitidas.
- Los terminos de baja confianza se presentan como palabras para revisar, no como diagnostico fonetico.

### 6.7 Privacidad

- El coach sigue siendo no calificable.
- El audio del estudiante no se guarda en el servidor.
- El audio temporal debe liberarse al reiniciar o salir del intento.
- No crear telemetria identificable de dispositivos.
- No enviar grabaciones de estudiantes a ElevenLabs.
- No implementar fallback de ElevenLabs/Scribe para estas correcciones, porque no fue aprobado por costo.

### 6.8 Personaje visible y escenario de conversacion

Cada coach debe sentirse como una conversacion con una persona, siguiendo el patron del simulacro oral de Ingles Basico 1 con Emma. No basta con mostrar un icono generico y una fotografia tematica del grupo.

Hallazgo actual:

- Las configuraciones `french-level-8-theme-1.js` a `french-level-8-theme-8.js` declaran a `Camille` como coach.
- Los ocho generadores de audio usan la misma cadena de seleccion de voz narradora configurada en `elevenlabs.local.env`.
- Por diseno, los ocho coaches actuales corresponden a una misma voz y pueden compartir un solo personaje profesional: Camille.
- Los MP3 no conservan el identificador de ElevenLabs como metadato verificable. Antes de reutilizar el retrato en las ocho actividades, se debe realizar una escucha humana breve para confirmar que la identidad vocal no cambio entre tandas.

Regla de coherencia entre voz e imagen:

- Misma voz, mismo nombre y mismo retrato.
- Voz diferente, personaje diferente: nuevo nombre, nuevo retrato y nueva clave de reparto.
- No mostrar el retrato de Camille sobre un audio claramente producido por otra persona.
- Si una voz distinta aparecio por accidente en una sola tanda, se prefiere regenerar esa tanda con la voz canonica de Camille antes que inventar un personaje aislado sin intencion pedagogica.
- Si se decide deliberadamente usar varios coaches, cada voz debe quedar documentada y conservar su personaje en todas sus apariciones.

El reparto debe registrarse con una identidad estable, por ejemplo:

```js
interviewer: {
  id: "camille",
  name: "Camille",
  role: "Coach de conversation",
  portrait: "../img/pratique-orale/personnages/camille-coach.webp",
  portraitAlt: "Camille, coach de conversation en français",
  voiceKey: "fr-fr-camille"
}
```

`voiceKey` es una referencia interna de reparto. El identificador real de la voz utilizada debe registrarse en el `scripts.md` o manifiesto de produccion correspondiente, sin registrar nunca la clave API.

El escenario visual debe incluir:

- Retrato profesional del personaje, visible durante toda la interaccion.
- Nombre y funcion del personaje.
- Estado sincronizado: `prête`, `parle`, `vous écoute`, `analyse` y `retour prêt`.
- Indicador o forma de onda discreta solo mientras se reproduce la voz del coach.
- Boton cuyo texto nombre al personaje, por ejemplo `Écouter Camille`.
- Velocidades `0,75x`, `1x` y `1,25x`, con `1x` activa por defecto.
- Pregunta escrita junto a los controles de audio.
- Imagen contextual de la pregunta separada del retrato del personaje cuando realmente ayude a responder.

La fotografia contextual del tema no reemplaza el retrato. El retrato representa a quien habla; la imagen contextual representa la situacion de la pregunta.

Comportamiento esperado por estado:

| Estado | Retrato y estado visual | Texto orientativo |
| --- | --- | --- |
| Preparado | Personaje estable, sin onda activa | `Camille est prête.` |
| Reproduciendo pregunta | Onda activa y estado `speaking` | `Camille pose la question.` |
| Grabando estudiante | Estado `listening`, onda del coach detenida | `Camille vous écoute.` |
| Analizando | Estado `thinking`, sin fingir que el personaje habla | `Analyse de votre réponse...` |
| Feedback listo | Estado tranquilo y boton Continuar disponible | `Votre retour est prêt.` |

Requisitos visuales y responsive:

- El retrato debe ser una imagen profesional propia, no una fotografia de stock generica reciclada ni una captura del simulacro ingles.
- Debe conservar el mismo rostro, edad aproximada, vestuario base y direccion artistica en todas las variantes del mismo personaje.
- En escritorio, el retrato puede ubicarse junto a la tarjeta de pregunta.
- En movil, debe aparecer arriba en formato compacto sin empujar el microfono ni el boton Continuar fuera de la primera zona util.
- El retrato no puede deformarse; usar dimensiones estables y `object-fit: cover` con recorte revisado.
- Los estados animados deben respetar `prefers-reduced-motion`.
- La imagen debe tener `width`, `height`, `alt`, carga eficiente y version de cache.
- No hacer sincronizacion labial falsa. Una onda y un cambio de estado son suficientes.

Archivos de referencia del patron ingles:

- `ingles/basico/final-oral-interview-mock.html`
- `assets/css/english-basic-final-oral-task-mock.css`
- `assets/js/english-basic-final-oral-task-mock.js`
- `assets/img/english-basic/practice-lab/final-oral-task/emma-virtual-partner-v1.webp`

Se replica el patron de presencia, estados y jerarquia; no se copian literalmente Emma, sus textos ni su imagen.

## 7. Compatibilidad movil y responsive

Cada actividad debe revisarse al menos en estas familias:

- Android con Chrome reciente.
- iPhone con Safari reciente.
- iPad con Safari o Chrome.
- Portatil con Chrome o Edge.

Requisitos:

- Negociar formatos MediaRecorder: WebM/Opus, WebM y MP4/M4A cuando el navegador los soporte.
- Solicitar permiso solo desde una accion del usuario.
- Mantener `echoCancellation`, `noiseSuppression`, `autoGainControl` y canal mono como preferencias, no como requisitos absolutos.
- Detener todas las pistas del microfono al finalizar, cancelar o cambiar de intento.
- No permitir dos grabaciones simultaneas.
- Botones tactiles de al menos 44 px; se prefieren 48 px.
- Ninguna grilla, metrica, texto, reproductor o selector puede desbordar la pantalla.
- Los estados `grabando`, `analizando`, `resultado`, `error`, `enviado` y `reintentar` deben ser visibles y accesibles.
- Los botones no pueden cambiar de tamano al cambiar su texto.

Viewports minimos para QA de maquetacion:

- 360 x 800
- 390 x 844
- 768 x 1024
- 1024 x 768
- 1366 x 768

No iniciar servidor local. Las verificaciones de navegador se realizan en produccion despues del despliegue aprobado o mediante inspeccion estatica cuando todavia no se ha publicado.

## 8. Auditoria pedagogica por actividad

Antes de cerrar cada pagina:

- El texto de referencia debe coincidir exactamente con el audio modelo.
- La segmentacion en secciones debe respetar grupos de sentido.
- El foco de pronunciacion debe corresponder al tema.
- Las frases deben ser naturales, B1+/B2 y comprensibles fuera de contexto.
- La expresion idiomatica se integra solo cuando es natural.
- Los consejos de liaison y entonacion deben ser correctos.
- Las preguntas del coach deben admitir respuestas personales razonables.
- Ninguna comprobacion debe depender de informacion que la consigna no solicite.
- Los modelos deben ser gramaticalmente correctos y no demasiado estrechos.
- El feedback debe explicar como mejorar, no limitarse a mostrar un porcentaje.

## 9. Casos de prueba obligatorios

### Pronunciacion

- Lectura exacta con audio claro.
- Homofonos y concordancias silenciosas.
- Contracciones segmentadas de forma diferente por STT movil.
- Ritmo natural rapido, alrededor de 190 palabras por minuto.
- Lectura lenta pero comprensible.
- Lectura incompleta con señal clara.
- Señal debil con transcripcion util.
- Confianza STT baja.
- Transcripcion vacia.
- Intento dudoso despues de un intento fiable mejor.
- Reinicio de una seccion.
- Reinicio completo del desafio.
- Envio de una nota `0` real frente a ausencia de intento.

### Coach de conversacion

- Respuesta modelo.
- Respuesta correcta con sinonimos.
- Respuesta correcta con orden diferente.
- Respuesta personal valida que no copia el modelo.
- Respuesta demasiado corta.
- Respuesta fuera de tema.
- Palabra parecida contenida dentro de otra palabra.
- Transcripcion con apostrofes o acentos distintos.
- Confianza STT baja.
- Transcripcion vacia.
- Error HTTP durante el analisis.
- Correspondencia entre voz, nombre y retrato del personaje.
- Estados visuales correctos al reproducir, grabar, analizar y mostrar feedback.
- La fotografia del personaje no cambia si la voz es la misma.
- Cambio de personaje documentado cuando cambia la voz.
- Repetir una pregunta y continuar.
- Resumen con intentos fiables, dudosos y omitidos.

## 10. Verificaciones tecnicas antes de cerrar una tanda

Ejecutar sin servidor local:

```powershell
node tools/test_french8_pronunciation_assessment.cjs
node --check assets/js/french8-pronunciation-assessment.js
node --check assets/js/french8-pronunciation-grade-submit.js
node --check assets/js/oral-unit-practice-engine.js
python -m py_compile server/progress_api.py
git diff --check
```

Al corregir el coach, crear una prueba compartida equivalente a:

```text
tools/test_french8_conversation_coach.cjs
```

La prueba debe cubrir las ocho configuraciones y no solo el tema piloto.

Tambien verificar:

- Orden de carga: motor compartido antes del controlador de actividad.
- Versiones de cache actualizadas en HTML.
- Ausencia de enlaces rotos.
- Ausencia de panel calificable en actividades no calificables.
- Confirmacion de envio y recuperacion correcta despues de error.
- Persistencia local compatible con datos de versiones anteriores o migracion controlada de `localStorage`.

## 11. Criterio de cierre por actividad

Una actividad solo se marca como cerrada cuando:

- Paso la auditoria pedagogica.
- El audio y el texto coinciden.
- La calibracion y seleccion de microfono funcionan.
- Un resultado dudoso no bloquea el avance.
- Repetir no destruye un resultado fiable mejor.
- Todos los botones responden y recuperan su estado.
- No hay desbordes en movil, tablet o portatil.
- El personaje visible coincide con la voz y sus estados siguen el flujo real.
- La consola no muestra errores funcionales.
- El envio y el reproductor docente funcionan cuando corresponden.
- Las pruebas automatizadas pasan.
- La tabla de estado de esta guia fue actualizada.

## 12. Tabla de seguimiento

| Actividad | Estado | Siguiente verificacion |
| --- | --- | --- |
| 01D | Correccion aplicada; pruebas frontend/backend y QA responsive sin servidor aprobados | Validar microfono y envio autenticado en produccion sin alterar notas reales |
| 02D | Correccion aplicada; pruebas pedagogicas/frontend/backend y QA responsive sin servidor aprobados | Validar microfono y envio autenticado en produccion sin alterar notas reales |
| 03D | Motor compartido integrado; QA pendiente | Validar subjonctif passe y enchainements |
| 04D | Motor compartido integrado; QA pendiente | Validar discurso reportado y envio |
| 05D | Motor compartido integrado; QA pendiente | Confirmar que siga no calificable |
| 06D | Motor compartido integrado; QA pendiente | Validar conectores y frases largas |
| 07D | Motor compartido integrado; QA pendiente | Validar concesion y liaison consultiva |
| 08D | Motor compartido integrado; QA pendiente | Validar contracciones y frances oral |
| 09D | Motor compartido integrado; QA pendiente | Validar sintesis y configuracion formativa |
| 01O | Pendiente; piloto del coach | Corregir motor, seis preguntas y escenario visual de Camille |
| 02O-08O | Pendientes | Aplicar y auditar en orden ascendente |

### Registro de revision 01D - 2026-07-17

- Se conservaron sin cambios `pronunciation01d`, el peso `5`, la escala sobre `5` y la formula `score100 / 20`.
- El resultado persistido sigue sirviendo como progreso, pero una recarga ya no permite enviarlo sin volver a grabar la evidencia final.
- El intento que se envia y el audio adjunto pertenecen a la misma grabacion, incluso cuando el progreso protege un intento fiable anterior mejor.
- El cliente bloquea envios simultaneos y la repeticion accidental del mismo intento.
- El backend exige audio para `01D` y valida su presencia antes de escribir la nota o reemplazar el detalle del carnet.
- Se mantuvo la regla `null` distinto de un `0` real y dudoso.
- Se elimino la carga duplicada de la hoja responsive en la pagina `01D`.
- Pruebas aprobadas: `tools/test_french8_pronunciation_theme1.cjs`, `tools/test_french8_pronunciation_theme1_backend.py` y `tools/test_french8_pronunciation_assessment.cjs`.
- QA visual sin servidor aprobado en `1366x768`, `1024x768`, `768x1024`, `390x844` y `320x568`; en los dos anchos moviles tambien se mostro artificialmente el estado final para medir panel, audio, metricas y botones.
- No se modificaron archivos de datos ni notas de estudiantes durante esta revision.
- Pendiente antes del cierre operacional: prueba manual de permiso, calibracion, grabacion y envio autenticado desde un dispositivo real contra produccion.

### Registro de revision 02D - 2026-07-17

- Se conservaron sin cambios `pronunciation02d`, el peso `5`, la escala sobre `5` y la formula `score100 / 20`.
- Se retiro el estado previo `Essai non note`: una transcripcion vacia vuelve a producir `0` dudoso y permite repetir o continuar, como exige esta guia.
- Un intento dudoso bajo no reemplaza un resultado fiable anterior mejor, pero el intento y el audio que se envian siempre pertenecen a la misma grabacion final.
- El cliente exige audio final y el backend valida su presencia antes de escribir la nota o reemplazar el detalle de `02D`.
- Se corrigio la concordancia `m'aurait conduit` a `m'aurait conduite`: el COD `m'` representa a la narratrice y precede el participe passe.
- Se regeneraron exclusivamente `theme-02/section-2.mp3` y `theme-02/n8-02d-hypotheses-passe-modele-france.mp3` con la misma voz ElevenLabs de Claire; las secciones 1, 3 y 4 no se tocaron.
- Se elimino la indicacion incorrecta de liaison entre `decisions` y `auraient`; la pagina explica que no se hace liaison entre un nombre plural y el verbo siguiente.
- Se elimino la carga duplicada de la hoja responsive en la pagina `02D`.
- Pruebas aprobadas: `tools/test_french8_pronunciation_theme2.cjs`, `tools/test_french8_pronunciation_theme2_backend.py`, las regresiones de `01D` y `tools/test_french8_pronunciation_assessment.cjs`.
- QA visual sin servidor aprobado en `1366x768`, `1024x768`, `768x1024`, `390x844` y `320x568`, mostrando tambien el panel final y el reproductor del estudiante.
- Los MP3 corregidos fueron decodificados por navegador: `section-2.mp3` dura `4.32 s` y el desafio final `20.76 s`.
- No se consumieron creditos STT ni se modificaron archivos de datos o notas de estudiantes.
- Pendiente antes del cierre operacional: prueba manual de permiso, calibracion, grabacion y envio autenticado desde un dispositivo real contra produccion.

## 13. Decisiones que no se deben revertir

- No volver a bloquear un intento solo porque el reconocimiento sea incierto.
- No volver a la comparacion literal palabra por palabra.
- No usar la transcripcion para afirmar que una liaison fue realizada.
- No convertir confianza Whisper en diagnostico fonetico.
- No usar un ritmo objetivo unico de 125 palabras por minuto.
- No habilitar envio cuando el intento final es `null`.
- No guardar el audio del coach de conversacion.
- No reutilizar un retrato cuando la voz pertenece a otro personaje.
- No cambiar la foto del personaje si la voz y la identidad siguen siendo las mismas.
- No usar la fotografia contextual del tema como sustituto del personaje que habla.
- No consumir creditos de ElevenLabs para reconocer la voz del estudiante.
- No crear telemetria identificable de dispositivos.
- No iniciar servidores locales para estas revisiones.
- No incluir `tmp-preview/`, documentos ajenos ni otros archivos no relacionados en el commit.
