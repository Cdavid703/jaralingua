# Preintermedio 1: diálogos de listening con Eleven v4

El 25 de octubre de 2026 el docente interrumpió la elaboración de Unit 4 para pedir consultar la API de ElevenLabs y, si Eleven v4 estaba disponible, actualizar los audios de los listenings de este nivel.

La documentación oficial y `GET /v1/models` de la cuenta confirmaron `eleven_v4`. Se generaron tres respuestas correctas mediante `POST /v1/text-to-dialogue`, con el parámetro explícito `model_id: eleven_v4`. Se conservaron íntegros los guiones canónicos y las voces de catálogo Matilda (Laura) y Sean (Mateo). El generador compartido conserva sus valores por defecto para los otros niveles; este cambio no establece V4 globalmente.

## Archivos activos del nivel

| Unidad | Listening | Archivo nuevo | Duración |
| --- | --- | --- | --- |
| 1 | A New Classmate | `ingles/preintermedio-1/audio/unit1/connected/a-new-classmate-v4.mp3` | 63.79 s |
| 2 | Trying a New Hobby | `ingles/preintermedio-1/audio/unit2/connected/trying-a-new-hobby-v4.mp3` | 58.59 s |
| 3 | A Busy Week | `ingles/preintermedio-1/audio/unit3/connected/a-busy-week-v4.mp3` | 58.44 s |
| 4 | A Celebration Together | `ingles/preintermedio-1/audio/unit4/connected/a-celebration-together-v4.mp3` | 67.00 s |
| 5 | A Photo from School | `ingles/preintermedio-1/audio/unit5/connected/a-photo-from-school-v4.mp3` | 61.73 s |
| 6 | Finding the Museum | `ingles/preintermedio-1/audio/unit6/connected/finding-the-museum-v4.mp3` | 63.95 s |

Units 1–3 fueron los tres listenings migrados al momento de la solicitud; Units 4–6 se elaboraron después directamente con V4. Las rutas nuevas evitan depender de una copia anterior en la caché del navegador. Los tres MP3 originales permanecen disponibles para recuperación. Las pronunciaciones del vocabulario y los 417 modelos explicativos conservan sus archivos y modelos existentes.

El proceso usa `tools/elevenlabs_generate_listenings.py`, el reparto `tools/elevenlabs_voice_cast.preintermediate1-unit1.json`, `--mode dialogue --dialogue-model-id eleven_v4 --seed 20261025`, idioma inglés y MP3 44.1 kHz / 128 kbps. Las fuentes de guion son `tools/preintermediate1_unit1_connected_content.py`, `tools/preintermediate1_unit2_connected_content.py` y `tools/preintermediate1_unit3_connected_content.py`; no se publica su transcripción íntegra en las actividades. Metadatos, hashes y duración: `docs/preintermediate1-listenings-v4.json`.

Los tres audios pasaron la comparación con Scribe: Unit 1 coincide tras normalizar puntuación; Units 2 y 3 solo presentan variantes de formato numérico (10/ten, 12/twelve, $5/five dollars, 5:00/five y 30/thirty). No se omiten ni cambian frases. Los informes están en `tmp/preintermediate1-listenings-v4-qa/` y quedan fuera de publicación.

El docente retomó después la construcción de Unit 4. Su contenido canónico es `tools/preintermediate1_unit4_connected_content.py` y su generador `tools/build_preintermediate1_unit4_connected.py`; integra las dos imágenes propias y el diálogo Eleven v4. La construcción, verificación y publicación de esa pareja se registran por separado en la continuidad del nivel.

Fuentes oficiales consultadas:

- https://elevenlabs.io/docs/overview/models/
- https://elevenlabs.io/docs/overview/capabilities/text-to-dialogue
- https://elevenlabs.io/docs/api-reference/text-to-dialogue/convert

Unit 5 integra el diálogo A Photo from School generado directamente con V4 y su lectura conectada; la pronunciación aislada de kite también se generó con V4. Su construcción y publicación se registran en la continuidad del nivel.

Unit 6 añade Finding the Museum, 195 palabras y catorce turnos con Matilda y Sean. Scribe conserva todas las frases: solo cambia números por cifras (500, 9:00, 10:00, 90, $5). Diecinueve pronunciaciones nuevas usan Sarah con multilingual v2; dieciocho coinciden literalmente y route se transcribe con el homófono root, pronunciación inglesa válida /ruːt/. Se reutilizan tres pronunciaciones existentes. Informe: `tmp/preintermediate1-unit6-connected-qa/audio-audit.json`.
