# Continuidad de Inglés Intermedio 1

El historial disponible usa este nivel principalmente como referencia de diseño y actividades. No es una memoria completa de sus unidades ni entregas.

## Decisiones conservadas

- Reunir evaluaciones y simulacros en una sección, evitando muchas tarjetas independientes en el home.
- Contenido de superlativos sirvió de referencia para Básico 2 Unidad 3. Al adaptarlo, comprobar prerrequisitos y no introducir estructuras que el nivel receptor no ha visto.
- Comida de Unidad 5 sirvió de origen para Básico 2 Unidad 6: contables/incontables, cantidades, memoria y coach de restaurante. Conservar los originales y separar claves de estado, navegación y contexto de curso.
- Las correcciones de juegos deben impedir selección de voto heredada, bloqueo al cambiar respuesta y dependencia exclusiva de ratón.

## Referencias existentes

- [Plan de desarrollo](../english-intermediate-development-plan.md).
- [Sistema de diseño](../english-intermediate-page-design-system.md).
- [Guía de estilo](../english-intermediate-style-guide.md).
- [Producción de Unidad 6](../unit-6-intermediate-activity-production-plan.md).
- [Auditoría de audios](../auditoria-audio-profesional-ingles-intermedio.md).

Estos documentos son puntos de entrada, no una lista de trabajo automáticamente autorizada. Verificar el tema y estado de producción antes de implementar.

## QR de acceso a las páginas

El 3 de octubre de 2026 se añadieron QR ampliables a las 77 rutas HTML del nivel y al juego compartido Guess Who enlazado desde Games. La publicación se separó en dos bloques: primero Games y sus juegos, después el resto del nivel.

- Componente compartido: `assets/js/page-qr-access.js`; SVG por URL bajo `assets/img/page-qr/`.
- Generador: `python tools/prepare_intermediate_page_qr.py` (requiere `qrcode`); `--games` limita el primer bloque. Conserva los SVG existentes.
- Verificación: `node tools/test_intermediate_page_qr.cjs` (requiere Playwright y un servidor local en `127.0.0.1:8137`). `--games` comprueba el primer bloque; `QR_ORIGIN` permite verificar producción. Revisa carga, URL, ausencia de duplicados/superposición y apertura/cierre del QR a 390, 768 y 1440 px.
- Market Basket Challenge conserva su QR propio, sin duplicarlo. La antigua ruta del showcase de Unidad 6 conserva su redirección al de Unidad 5 y muestra el QR de destino.
- Los QR solo abren la página; no modifican autenticación, acceso a exámenes, entregas ni notas.
