# QR de acceso en francés e inglés

Implementación del 25 de octubre de 2026. Componente compartido: `assets/js/page-qr-access.js`.

## Cobertura publicada revisada

| Curso | Páginas |
| --- | ---: |
| Inglés Básico 1 | 88 |
| Inglés Básico 2 | 78 |
| Inglés Intermedio 1 | 76 |
| Inglés Intermedio 2 | 57 |
| Inglés Preintermedio 1 | 22 |
| Portal de inglés | 1 |
| Francés Niveau 1 | 41 |
| Francés Niveau 2 | 54 |
| Francés Niveau 7 | 48 |
| Francés Niveau 8 | 102 |
| Portal de francés | 1 |
| Total | 568 |

Se añadieron 247 SVG y 247 referencias al componente: las 246 páginas de francés y el proyector del examen oral de Básico 2. Las demás páginas de inglés ya tenían QR; se conserva su implementación. Las redirecciones usan el QR de su destino. No se incluyen borradores sin publicar ni copias de páginas utilitarias dentro de carpetas de audio.

## Comportamiento

QR compacto dentro del encabezado, ampliación en diálogo centrado y textos en el idioma del curso. Se conservan los widgets QR propios de las actividades para evitar duplicados. Los enlaces son canónicos, sin parámetros de sesión ni datos del estudiante; escanear no omite los controles de acceso de la página. Las rutas francesas con espacios y los accesos a directorios se normalizan para encontrar el SVG correspondiente.

## Mantenimiento y validación

`tools/prepare_all_course_qr.py` requiere Python con qrcode y una instantánea de los HTML públicos en `QR_SNAPSHOT` (por defecto `/tmp/qr-public-pages`). Solo modifica páginas presentes en esa instantánea. Guarda el manifiesto en `QR_MANIFEST` (por defecto `/tmp/all-course-qr-manifest.json`). Conservar el manifiesto de cambios antes de repetir la generación; una segunda ejecución idempotente no vuelve a enumerar los cambios anteriores.

`tools/test_all_course_qr.cjs` usa Playwright y Chrome. Lee las mismas variables, permite `QR_SAMPLE` como lista JSON de rutas y `PUBLIC_ONLY=1` para comprobar producción. Bloquea las API académicas y scripts de actividades: comprueba solamente carga, posición, idioma, ausencia de duplicados, ampliación y cierre de QR. No representa una prueba funcional de los ejercicios.

Se corrigieron además superposiciones del QR en celular/tablet en Course Overview, Games y Practice Lab de Básico 2, actualizando su referencia de caché. La auditoría inicial recorrió 266 páginas en celular y escritorio; los casos detectados se corrigieron y se verificaron 14 páginas representativas de todos los niveles en cinco anchos (390, 820, 844, 1180 y 1440 píxeles), con 70 comprobaciones sin fallos.

Se decodificaron los 568 SVG con ZXing para comprobar la URL exacta de cada página. Los archivos publicados se comparan antes y después del despliegue selectivo; los datos académicos no forman parte de esta publicación.
