# The First Visit · Unit 5 oral storybook

## Scope and teaching design

Original fictional story for Intermediate English Course 2, Unit 5. The teacher projects the book and chooses students to speak. The final design has **17 pages**, reduced at the teacher's request because successive pictures must offer meaningfully different material to describe. It prepares feelings, appearance, behaviour, preparation and conversation topics for the informal-email final writing task. No submission, grades, exam activation or backend changes.

Each page has one detailed illustration, a short narrative and five open questions: two observation questions, one feelings/evidence question and two predictions. Page 17 replaces predictions with reflection and transfer to writing. The narrative is hidden until the teacher selects Discover; page changes return to Describe. Questions appear individually and do not display model answers. Optional starters use there is/are, spatial language, present continuous, looks/seems/looks like, feelings with because, might/will and first/then/also/however. A facial expression is a clue, not proof of a personality trait.

Scene sequence: invitation at the desk; wardrobe choices; florist; rain at the bus stop; inside the bus; residential street; introductions in the hallway; mountain photograph in the living room; garden tour; kitchen preparation; spilled water; dinner conversation; grandmother's photo album; birthday surprise; group photograph; farewell; writing at home. Returning spaces have a different action/composition and permit comparison, particularly arrival/departure and opening/closing.

## Interaction

Adapted from the Basic English 2 Unit 6 Stone Soup interaction pattern: cover opens a full-viewport book, native fullscreen when available, paper animation and recorded page-turn sound, previous/next, numbered page selector, keyboard and horizontal swipe on the picture. Reduced-motion preference disables the animation. Phone portrait remains supported and landscape is recommended. A−/A+ scales the discussion text.

Click the picture to project it without cropping. Project question shows one large question; previous/next stays within the current discussion step and cannot expose the next story page. Discover also supports projecting the narration. Native modal focus, Escape and explicit close controls restore the book; closing the book stops audio and restores scrolling. Fullscreen refusal falls back to the viewport dialog. Narration never autoplays or advances pages.

## Assets and reproduction

- Page: `ingles/intermediate-2/speaking-unit-5-the-first-visit.html`.
- Content and scene prompts: `assets/data/english-intermediate2-first-visit.json`; canonical authoring source: `tools/build_first_visit_content.py`.
- Images: `assets/img/english-intermediate-2/unit-5/first-visit/page-01.png` through `page-17.png`. Page 1 is the approved preview; the other 16 were generated individually with the built-in image generation tool, using page 1 as a style/identity reference. Earlier discarded desk variants are not part of the book.
- Shared prompt: one finished 16:9 warm, realistic painterly illustration for adult learners; detailed foreground, middle ground and background; natural anatomy; no panels, mockup, logos or readable lettering; preserve Alex's identity but change camera composition and setting according to the page's `scene` field. Character guide: Alex, dark curls, light-blue rolled-sleeve shirt and navy trousers after preparation; Maya, long dark hair, mustard blouse and cream trousers; Elena, wavy brown hair and olive dress; Daniel, salt-and-pepper hair, glasses and cream shirt; Rosa, silver bob and lavender cardigan.
- Audio: `ingles/intermediate-2/audio/unit-5-first-visit/`. **102 ElevenLabs recordings**: 17 narrations and 85 questions. Sarah, `eleven_multilingual_v2`, English. Default playback 0.75×, optional 1×, native pause/resume and seek controls. Existing paper sound is reused from Stone Soup.
- `models.json` records exact spoken scripts, model/voice and hashes. `tools/generate_first_visit_audio.py` reads the existing ignored local environment file; no credentials are shipped. Exact-text draft recordings were reused; changed recordings were regenerated.
- `tools/audit_first_visit_audio.py` compares speech-to-text with the scripts, caching by audio hash. Two reviewed differences are American/British spellings in transcription (realizes/realises, behavior/behaviour), not different spoken content; the raw findings remain in `audio-audit.json`.

## Verification

`tools/test_intermediate2_page_contract.mjs` covers 45 Intermediate 2 pages, including shared sign-in, responsive styles and this page's canonical QR SVG.

`tools/test_first_visit.cjs` checks all 17 distinct image files, 102 audio hashes and their exact script mapping, all discussion steps and page boundaries, narration hiding, image/question projection, QR opening, native audio playback and speed, cleanup, keyboard navigation and fullscreen refusal. It exercises Chromium at 360×800, 390×844, 844×390, 820×1180, 1440×1000 and 1920×1080. Browser viewport emulation does not certify physical televisions or phones.

Run with `PLAYWRIGHT_MODULE` set to the installed Playwright package and, when needed, `PLAYWRIGHT_BROWSERS_PATH`. `FIRST_VISIT_BASE_URL` defaults to `http://127.0.0.1:8073`; it can target the published site. Screenshots default to a temporary directory, outside the repository.

## Vocabulario contextual: traducción al pasar el mouse y audio al hacer clic

La narración, las preguntas y las ayudas incluyen 65 palabras y expresiones del vocabulario seleccionado, con traducción al español contextual. Se subrayan con puntos sin cambiar el texto ni revelar la narración antes de Discover. Pasar el mouse o enfocar con el teclado muestra la traducción sin emitir audio; hacer clic o pulsar Enter/Espacio reproduce el modelo individual de Sarah (ElevenLabs), a la velocidad seleccionada. En móvil, tocar muestra el significado y reproduce la pronunciación.

El mismo comportamiento funciona en el texto ampliado para TV. La ayuda se coloca dentro del diálogo activo para permanecer visible en pantalla completa; permite mover el puntero sobre la traducción y Escape la cierra antes de cerrar el libro. Cambiar de página, pregunta o modo y cerrar los diálogos retira la ayuda. La pronunciación comparte el reproductor existente: un clic detiene el audio anterior y nunca superpone dos modelos. El fallo del audio ofrece reintento y no impide consultar el significado.

- Glosario: `assets/data/english-intermediate2-first-visit-vocabulary.json`.
- Interacción: `assets/js/first-visit-vocabulary.js`, integrada en el lector existente.
- Modelos y auditoría: `ingles/intermediate-2/audio/unit-5-first-visit/vocabulary/`.
- Generación y verificación: `tools/generate_first_visit_vocabulary_audio.py`, `tools/audit_first_visit_vocabulary_audio.py`. Los scripts reutilizan la producción y auditoría de audios del cuento; conservan las excepciones explícitas de puntuación o ajustes de voz en el manifiesto.
- Prueba: `node tools/test_first_visit_vocabulary.cjs`, con `FIRST_VISIT_BASE_URL` opcional. Comprueba las 65 entradas y archivos, textos íntegros de las 17 páginas y 85 preguntas, hover sin sonido, foco, clic, toque, Escape, proyección, límites de pantalla, limpieza al navegar, fallo de audio y decodificación de todos los modelos. Complementar con `tools/test_first_visit.cjs` y el contrato de páginas del nivel.
