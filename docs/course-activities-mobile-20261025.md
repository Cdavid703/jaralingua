# Revisión funcional móvil de cursos — 25 de octubre de 2026

## Correcciones

- Francés 7, speed dating de proyectos: apóstrofo sin escapar impedía ejecutar el script; selección de rol y consigna vuelve a generar la misión.
- Francés 8, juicio/emoción y mesa redonda: cuatro audios nativos y diez modelos dinámicos apuntaban fuera del nivel. Se corrigieron sus rutas conservando los archivos profesionales existentes.
- Cuatro producciones de Francés 8 (04e–07e): el Blob conserva el MIME real del grabador, incluido MP4/AAC de WebKit. Se bloquea el inicio duplicado, se liberan pistas al detener/fallar y se descarta correctamente un audio reiniciado durante la captura. Se revocan URLs anteriores.

## Evidencia y alcance

Informe estructurado: `reports/course-activities-mobile-20261025.json`.

- 572 páginas públicas inventariadas e inicializadas; cero errores de JavaScript o recursos de código faltantes después de corregir. Las siete páginas finales se volvieron a verificar.
- 4.703 audios de uso público cargados e iniciados en Chromium, sin fallos. Muestra de 32 MP3/WAV reproducida en WebKit. No es una escucha humana completa de cada archivo.
- 138 casos de botones de audio con reproducción confirmada en 375 y 1024 px. Otros 208 casos usan controles nativos o flujos específicos no cubiertos por ese automatismo; la comprobación de archivos es independiente.
- 172 casos de micrófono Chromium y 30 WebKit pasaron: permiso denegado, recuperación, grabación nativa sintética, datos no vacíos, liberación de pistas y posibilidad de repetir. Cuatro actividades adicionales a las familias de pronunciación verificaron específicamente MP4 y descarte durante grabación.
- 46 casos de juegos confirmaron revelar/comparar tarjetas, generar misiones o iniciar ahorcado, marcar letras usadas y abrir pistas. Dos flujos necesitan un adaptador específico. Las reglas del Impostor de Básico 2 e Intermedio pasaron en almacenes temporales.
- Pronunciación Básico 2 unidad 1: puntaje, avance, restauración al recargar, siete secciones, reintento tras 503 y almacenamiento lleno; ocho análisis ficticios, ninguna entrega.

Las pruebas no equivalen a revisar cada ramificación pedagógica. Los flujos iniciales de tarjetas meteorológicas de Francés 2, dos variantes del oral final de Básico 1 y el coach final en pareja de Intermedio no expusieron el grabador al adaptador. No se realizaron intentos de examen autenticados. Falta comprobación manual con dispositivos físicos iOS/Android, permisos del sistema operativo y servicio de transcripción real; no se usaron voces ni cuentas de alumnos.

## Reproducción técnica

Herramientas nuevas `audit_course_activity_runtime.cjs`, `test_course_audio_decode.cjs`, `test_course_audio_controls.cjs`, `test_course_microphone_flows.cjs`, `test_course_game_controls.cjs` usan Playwright y un inventario público temporal. El inventario `/tmp/functional-inventory.json` contiene `pages` y `media` (`path`, `size`); el runtime produce `/tmp/functional-audit/inventory.json`. Los grabadores usan `/tmp/functional-mic-pages.json`, una lista de rutas. No versionar datos académicos ni el snapshot completo.

`ACTIVITY_PATCH=1` lee los archivos locales; `ACTIVITY_PAGES`, `MIC_PAGES` y `AUDIO_FILES` aceptan listas JSON para pruebas acotadas. `MIC_ENGINE=webkit` / `AUDIO_ENGINE=webkit` seleccionan WebKit. `MIC_FORMAT=audio/mp4` fuerza ese formato en el adaptador, no en el producto. Las APIs académicas están interceptadas; las puntuaciones simuladas solo prueban el flujo de interfaz.

Los primeros barridos WebKit con demasiadas tareas simultáneas y espera de audio de 100 ms produjeron falsos negativos. Se corrigieron las esperas y la referencia estable al dispositivo sintético; se conservaron los resultados finales de las repeticiones. El formato MP4/AAC real de WebKit sí confirmó el defecto de etiquetado corregido.

## Publicación

Publicado el commit `93f052a0b54317bac42a082c010ccb07382ce58c` por push normal y despliegue selectivo de siete HTML. Respaldo: `20261025T212915Z-4vl4id60`. Se verificaron por HTTPS los siete hashes, las catorce URLs de audio y ocho casos de grabación WebKit sobre las páginas publicadas (MP4/AAC, permiso denegado, reintento, parada, liberación y descarte). No se modificó backend, audios, permisos académicos ni notas.
