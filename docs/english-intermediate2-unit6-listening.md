# After the Flood · Unit 6 listening

Solicitud del 9 de octubre de 2026: cerrar las actividades de noticias con un listening de no más de un minuto, ocho preguntas y transcripción docente, siguiendo los listenings existentes.

## Pedagogía y recursos

Noticia ficticia, voz Sarah (ElevenLabs multilingual v2), 28.84 segundos a velocidad normal. Tres escuchas: idea general, detalles y reported speech. Ocho preguntas con tres opciones rotuladas A/B/C y feedback de evidencia; resultado formativo local, sin notas ni envío. Cierre oral de 45 segundos con apoyo de said that. Imagen propia de presentadora radial; no muestra las respuestas. Reutiliza el patrón de Unidad 5, autenticación, búsqueda y QR compartidos. Imagen completa, dos columnas de preguntas en escritorio y una en móvil.

## Transcripción protegida

El guion reside en `server/intermediate2_unit6_listening.py`. El GET de transcripción requiere autenticación y rol teacher/admin de Intermedio 2. El frontend lo solicita sin caché, lo elimina al cambiar/cerrar sesión y descarta respuestas de identidades anteriores. No publicar el guion completo en HTML, JS, JSON, documentación ni herramientas. El generador importa el módulo privado; el inventario público de audio solo registra duración, voz, hashes y resultado de auditoría. No cambia datos académicos.

## Verificación y mantenimiento

- `tools/test_intermediate2_unit6_listening.cjs`: reproducción real, velocidades, ocho respuestas, errores/reintento, reset, roles simulados, cambio de cuenta, respuesta tardía, QR, seis anchos y enlaces de ambos catálogos.
- `tools/test_intermediate2_unit6_listening_backend.py`: ruta real extraída del AST, orden de autenticación y denegación de estudiantes/visitantes; acceso teacher/admin.
- Contrato de páginas: 52. Auditoría completa de Sign in: 52 páginas × cinco anchos.
- `tools/generate_intermediate2_unit6_listening_audio.py`: generación ElevenLabs, límite de 60 segundos y cotejo con Scribe. Resultado: coincidencia normalizada 100%.

## Imagen generada

Original conservado en la carpeta local de imágenes generadas. Prompt: Photorealistic editorial landscape, fictional female local-radio presenter in a modern small studio, broadcast microphone, headphones and mixing desk; daylight and blurred generic rain-cloud monitor; complete head and microphone, no letters, numbers, scripts, logos or writing boards. Must not reveal listening answers. WebP optimizado con encuadre completo.
