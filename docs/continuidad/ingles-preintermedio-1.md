# Continuidad de Inglés Preintermedio 1

## Alcance actual

El docente pidió leer PreIntermediate_Course 1.docx de Descargas, estudiar Básico 1 y 2, preparar una matriz de 64 horas y comenzar por Making Friends. El nivel nuevo es independiente de Intermediate 1 y de Básico 2.

La primera construcción comprende cuatro páginas en `ingles/preintermedio-1/`: inicio, Course Overview, explicación de Making Friends y biblioteca de expresiones. No equivale a terminar las ocho actividades de Practice Lab ni a crear un registro de notas.

## Fidelidad al diseño de Básico 2

El 24 de octubre de 2026 el docente señaló explícitamente la omisión del QR y el cambio de colores de la primera vista previa. Se corrigió y esta decisión debe mantenerse en futuras actividades:

- Cargar directamente `style.css`, `english-basic-responsive.css` y `english-basic-2.css` y usar las clases de sus componentes. No reinterpretar la paleta del nivel.
- Conservar el hero horizontal `lesson-hero immersive-basic-hero`, la tarjeta azul, los botones rojo y blanco, la tipografía Arial y los colores de `--basic2-*`.
- Usar el componente compartido `page-qr-access.js`, SVG por página y ampliación centrada. El QR permanece dentro de la tarjeta del título, con espacio para evitar superposición en móvil.
- Mantener las carpetas y los diez temas cerrados inicialmente; el enlace a un tema concreto puede abrirlo.
- Los ajustes del nuevo nivel están en `english-preintermediate-1.css`; no modificar la apariencia de Básico 2 para adaptar este nivel.

## Fuentes y reproducción

`tools/build_preintermediate1_unit1.py` genera las cuatro páginas, inventario y guiones de 43 audios, y cuatro SVG QR dirigidos a las URL finales en www.jaralingua.com. Las voces de catálogo son Sarah para modelos y Matilda y Sean para los turnos de Laura y Mateo. No usar voces David creadas o clonadas.

Se conservan los dos encuentros de tres horas de la unidad: entrevista inicial y preparación; personalidad, preferencias, entrevista final, presentación, diario y feedback. El desarrollo de actividades sigue el plan preparado para el docente; la explicación actual no ofrece enlaces a actividades inexistentes.

## Verificación local y publicación

La revisión visual comprobó 390 × 844, 844 × 390, 820 × 1180, 1180 × 820, 1440 × 900 y 1920 × 1080. Se verificaron QR visible sin superponer texto, ausencia de desplazamiento horizontal de la página, ampliación centrada, diez temas cerrados inicialmente y diez temas abiertos sin desborde. También se revisaron las otras tres páginas en móvil.

La comparación de estilos calculados con Básico 2 confirmó tarjeta `rgba(7, 31, 79, 0.72)`, botón principal `rgb(215, 25, 63)` y Arial. Los 43 archivos MP3 y cuatro SVG están presentes. Las comprobaciones locales no acreditan publicación.

Los 43 modelos se transcribieron con ElevenLabs Scribe: todos coinciden al normalizar puntuación y tildes. La única diferencia ortográfica antes de normalizar fue Medellín/Medellin. El informe local de QA se conserva fuera de los archivos publicados.

El acceso SSH de jaralingua-dev con la clave local falló; la revisión automática rechazó intentar la cuenta administrativa por requerir autorización específica. No intentar otra vía para eludir ese rechazo. La publicación del nivel requiere resolver este permiso. Mientras no esté publicado, los QR apuntan a sus destinos finales y no a la vista previa local.

La revisión automática también rechazó el push a main por exigir autorización explícita para esa publicación. La construcción se guardó en un commit local; no consta subida a GitHub ni despliegue. Pedir al docente autorización concreta para subir esta versión y para la publicación selectiva con acceso administrativo antes de reintentar cualquiera de esos pasos.
