# Hangman — Basic English 2, Units 1–6

Actualización del 5 de octubre de 2026, solicitada por el docente: ampliar el juego a todas las unidades, aceptar palabras y expresiones (incluidos idioms), conservar pistas en inglés y selección por unidad, y mejorar el personaje y los efectos.

## Contenido

457 respuestas, cada una con significado, ejemplo, nota de uso y tres pistas progresivas en inglés. La primera pista aparece al iniciar la ronda; las adicionales reducen únicamente el bono por solución completa.

| Unidad | Respuestas | Cobertura |
| --- | ---: | --- |
| 1 — Going Out | 78 | Clima, acciones actuales, deportes, ING, phrasal verbs e idioms |
| 2 — Shopping Experiences | 80 | Ropa, accesorios, colores, estilo, tallas, precios, compras y expresiones |
| 3 — Around the World | 85 | Países y nacionalidades, geografía, descripciones, comparativos, superlativos y viajes |
| 4 — Busy Lives | 68 | Actividades, secuencia, tiempos pasados, verbos regulares e irregulares, expresiones |
| 5 — Looking Back | 44 | Recuerdos, sentimientos, was/were, vacaciones, idioms y vocabulario previo de Goldilocks |
| 6 — Fabulous Food | 102 | Comida, ingredientes, comidas del día, sabores, texturas, preparación, cantidades, restaurante y expresiones |

Fuentes: las seis páginas de teoría `ingles/basico-2/unit-*.html`, el contenido dinámico `assets/js/basic2-unit6-food-content.js`, `assets/data/basic2-unit4-past-verbs-pronunciation.json` y la lectura de Goldilocks. Cada categoría registra su ruta de fuente. Se preservan las 40 entradas originales de Unidad 1 y sus identificadores. El banco estático final es `assets/js/english-basic-2-hangman-data.js`.

La selección permite unidad, tema y formato (palabras / expresiones / ambos), además del repaso conjunto. Los temas sin respuestas para el formato elegido se desactivan. El contador muestra el tamaño de la selección. Las respuestas no se repiten hasta agotar los identificadores de esa selección; al reiniciar el banco se evita repetir inmediatamente la última respuesta cuando hay alternativas.

## Tablero y compatibilidad

Motor específico de Básico 2 (`assets/js/english-basic-2-hangman.js`), derivado del motor existente para aislar los cambios de los otros niveles. CSS propio, personaje SVG de seis partes, entrada animada de partes, reacción a errores y aciertos, celebración, pistas de oportunidades restantes y respeto a `prefers-reduced-motion`.

Conserva participantes/equipos, turnos, marcador, importación existente, volumen y silencio. Usa los audios grabados existentes del alfabeto estadounidense y los efectos del juego. No se habilita pronunciación de respuestas sin grabaciones correspondientes.

Mantiene la clave local de partidas y migra la unidad de partidas antiguas a partir de su categoría. El juego y el diálogo usan `data-jaralingua-managed-draft` para que el guardado general del sitio no sobrescriba los selectores ni restaure soluciones anteriores. No se cambian notas ni servicios académicos. El enlace flotante Back se retira de esta página; Games sigue accesible en la navegación y el hero.

## Validación

`tools/test_basic2_hangman.cjs` comprueba el banco y fuentes, audios locales, las seis unidades, formatos, pistas, puntos, letras correctas/incorrectas, derrota y victoria, reanudación, migración de sesiones antiguas, reinicio, silencio, acceso de invitados/alumnos, ausencia de errores JS/recursos, controles, diálogo y palabra larga en 360×800, 844×390, 768×1024, 1024×768, 1366×768 y 1920×1080. También comprueba movimiento reducido, teclado compacto, acceso en navegación y desplazamiento del hero.

Las pruebas preexistentes `test_basic2_top_nav_auth.mjs` y `test_basic2_hero_scroll.mjs` se ejecutan con copias temporales adaptadas al runtime macOS y limitadas a las dos páginas modificadas; los originales no se modifican.

## Publicación selectiva

Solo se publican las dos páginas (`game-hangman.html`, `games.html`) y los tres assets propios (banco, motor, CSS). Las versiones iniciales de las dos páginas y el banco/motor anteriores coincidían entre local, origin/main y producción antes de editar. Las pruebas y esta documentación se versionan, pero no necesitan copiarse al sitio. Los archivos originales compartidos de Hangman no se modifican.
