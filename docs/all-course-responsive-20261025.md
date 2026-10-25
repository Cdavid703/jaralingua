# Responsividad de todos los cursos — 25 de octubre de 2026

Se revisaron 570 páginas publicadas de los cinco niveles de inglés y los cuatro niveles de francés, más sus portales. El inventario excluye redirecciones, copias utilitarias dentro de audio y borradores no publicados. Preintermedio 1 incluye las dos actividades de Unit 5 publicadas desde la auditoría QR anterior.

## Cambios

- `assets/css/course-responsive.css`, enlazado al final del head de las 570 páginas: tamaños mínimos flexibles para ruletas, paneles, tarjetas y columnas; texto largo ajustable; márgenes de Bootstrap contenidos en celulares; corrección de los márgenes del hero de Básico 2; títulos y botones de Live News Report en filas separadas en móvil; selectores de vocabulario contenidos.
- Barras superiores que se desplazan con el contenido hasta 1199 px y cabeceras Bootstrap distribuidas en dos filas en tablet, sin ocultar enlaces. Menús de cursos acotados al alto disponible incluso en orientación horizontal. El portal de francés reutiliza el selector compartido integrado en la navegación.
- `assets/js/google-auth.js` extiende a todos los cursos el posicionamiento de panel que ya usaba Intermedio 2: visualViewport, ampliación en la capa superior cuando está disponible y cierre accesible. Se conserva la lógica de acceso, roles y almacenamiento. Las referencias HTML llevan una versión nueva para invalidar caché.
- Country Feature Chart conserva sus columnas y campos en una región de desplazamiento horizontal identificada y accesible por teclado; no se comprime hasta volver ilegibles los campos ni se oculta el desbordamiento general de la página.

## Validación

Inventario y fuentes tomados de los HTML/CSS/JS públicos. Las 954 fuentes públicas descargadas coincidían con la copia local antes de editar. Los cambios ajenos y los datos académicos quedaron fuera de esta tarea.

La pasada inicial encontró incidencias de distribución en 89 páginas. Tras corregirlas se comprobó cada página a 360×800, 844×390, 768×1024, 1024×768 y 1280×800, con secciones cerradas/abiertas y paneles de cursos/acceso cuando existen. La prueba de paneles reveló además desbordamientos en cabeceras de tablet; se corrigieron y repitieron las 239 páginas que utilizan esa cabecera. Resultado consolidado: **8.550 comprobaciones de estado/tamaño, sin incidencias restantes en las reglas medidas**.

Se probaron clics de menú, panel de acceso, ampliación QR y navegación móvil en 18 páginas representativas, cinco tamaños: **90 casos en Chromium y 90 en WebKit**, sin fallos. Se inspeccionaron capturas con imágenes reales de ruletas, paneles y tablas. WebKit es una prueba del motor de Safari, no una sesión en dispositivos iPhone/iPad físicos.

El informe público sin datos personales es `reports/course-responsive-20261025.json`. No equivale a ejecutar cada ejercicio, cada respuesta o las vistas privadas autenticadas de cada rol. Se bloquearon API académicas, envíos, reproducción y servicios externos durante la auditoría. En la pasada exhaustiva las imágenes se representaron con sus dimensiones reales; la muestra visual e interactiva cargó los archivos reales.

## Repetición

- `tools/audit_all_course_responsive.cjs`: Playwright y sharp; `RESP_PAGES` es un JSON de rutas, `RESP_SNAPSHOT` una copia de fuentes públicas. `RESP_PATCH=1` usa los archivos del checkout. `RESP_OUT` elige la carpeta de resultados; `RESP_SIZES` admite una lista JSON de pares ancho/alto. Por defecto: snapshot `/tmp/responsive-public`, inventario `/tmp/responsive-pages.json` y los cinco tamaños anteriores.
- `tools/test_course_responsive_controls.cjs`: muestra representativa incluida, o `RESP_PAGES` para elegir otra. `RESP_ENGINE=webkit` selecciona WebKit; por defecto usa Chrome. `RESP_SCREENSHOTS=1` guarda capturas. Configurar Playwright y sus motores instalados en el entorno.
- Conservar el enlace al CSS compartido en nuevos generadores y repetir la auditoría al cambiar cabeceras, formularios, tablas o rejillas. Revisar las causas de un desbordamiento; no resolverlo con `overflow-x:hidden` en body.

Publicación: únicamente los 570 HTML, la hoja CSS nueva y el ajuste visual de `google-auth.js`, previa comparación con producción y con respaldo del publicador. La verificación de producción se realiza después del despliegue.
