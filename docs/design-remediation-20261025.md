# Correcciones de diseño de Jaralingua — 25 de octubre de 2026

Implementación del plan aprobado tras la auditoría de diseño. Se mantiene la identidad de cada curso; no se cambian rúbricas, notas, datos de estudiantes ni permisos de acceso.

## Cambios

1. La tabla de dominios institucionales ajusta sus columnas y texto al ancho disponible. La insignia de seguridad tiene texto oscuro sobre fondo claro.
2. La cuenta se integra en la navegación de todas las familias que tienen navbar. Los menús móviles permiten desplazamiento interno cuando el dispositivo está en horizontal. Se elimina la altura fija que recortaba el menú de Hangman.
3. Las cabeceras de Inglés Básico 1 e Intermedio 1 muestran primero las instrucciones y acciones. Se compactan los encabezados en móvil; el título largo de Relaciones se ajusta sin partir palabras. El QR ocupa una tarjeta de 60 px en móvil y mantiene su ampliación para escanear.
4. Se normalizan los tamaños táctiles de los controles compartidos, el foco visible y algunos estados de botones; el acceso y los cierres de panel tienen al menos 44 px. La portada respeta la preferencia de movimiento reducido.
5. El panel explica que la marca personal «completada» no envía una entrega al profesor. Se elimina la afirmación de sincronización que no dependía de una confirmación del servidor. La práctica de pronunciación de Básico 2 explica que sirve para feedback y no cambia la nota final. La lógica de guardado, evaluación y entrega se conserva.
6. Los HTML actualizan la versión de los recursos compartidos para evitar cachés antiguas. La publicación usa archivos explícitos, comparación previa y respaldos por grupo.

## Medidas antes y después

Mismo navegador, ancho de 390 px, fuentes e imágenes reales:

| Medida | Antes | Después |
| --- | ---: | ---: |
| Ancho de página de dominios permitidos | 690 px | 390 px |
| Alto de cabecera de Inglés Básico 1 | 417 px | 117 px |
| Alto de tarjeta QR en Básico 1 | 136 px | 60 px |
| Alto de tarjeta QR en Francés 7 | 148 px | 60 px |

La insignia institucional cambia de blanco sobre blanco translúcido a `#0b2454` sobre `#eef3fb`. Los resultados completos se guardan en `reports/design-remediation-20261025.json`.

## Alcance de las comprobaciones

Inventario público: 594 HTML, de los cuales 586 son páginas activas y ocho son redirecciones cuyos destinos existen. Las pruebas de diseño recorren cinco tamaños (360×800, 844×390, 768×1024, 1024×768 y 1280×800), incluyendo paneles y secciones abiertas/cerradas. Las imágenes de la pasada exhaustiva conservan sus dimensiones mediante sustitutos; la muestra interactiva y visual usa imágenes reales.

Los controles se prueban en Chrome y WebKit. Las sesiones con nombres largos son ficticias y las API académicas están bloqueadas. Las pruebas de micrófono usan señales sintéticas; no prueban el hardware ni los permisos reales de cada teléfono. Los juegos y la recuperación de pronunciación se verifican sin entregas ni notas reales. Este control no sustituye una revisión manual de cada ejercicio ni certifica accesibilidad completa.

`tools/test_course_responsive_controls.cjs` ya no hace un clic arbitrario al pie de la pantalla después de cerrar la cuenta: ese clic abría accidentalmente el modal de objetivos de Francés 7 y producía un falso fallo del QR. Ahora comprueba que el panel se haya cerrado con Escape.

## Resultados finales antes de publicar

- 586 páginas activas, 8.790 comprobaciones de estado y tamaño: cero incidencias en las reglas medidas. Ocho redirecciones con destino existente.
- 160 casos de controles en Chrome y 160 en WebKit: cero fallos, consolidando las repeticiones finales.
- 18 casos con sesión ficticia y nombre largo: acceso visible en navegación, panel contenido y cierre con Escape.
- 46 casos de juegos completados sin errores; dos flujos específicos no cubiertos por el controlador de prueba.
- Ocho casos de micrófono ejercitados sin errores; seis no alcanzaban el control desde el flujo público inicial.
- Pronunciación de Básico 2: puntaje, siguiente sección, restauración, reintento tras 503, fallo de almacenamiento y finalización de siete partes; ocho análisis sintéticos, ninguna entrega.

En la portada general el selector de cursos también pasa a la navegación para evitar cubrir los botones de acceso.
