# Unit 5 · Read the Clues

Implemented 25 September 2026.

URL: https://www.jaralingua.com/ingles/intermediate-2/grammar-unit-5-read-the-clues.html
Location: Practice Lab → Unit 5 → Grammar.

## Teaching decisions

User approved a 10-question workshop with pictures and three choices, following the tired-worker discussion. Every question offers must, might and can’t. Four questions request a strong positive deduction (1, 4, 7, 10), three a possibility without certainty (2, 5, 8), and three a strong negative deduction (3, 6, 9). The instruction explicitly sets the intended certainty. Feedback distinguishes an English sentence that is grammatical but less certain from a sentence that contradicts the clues. Posture alone does not establish a person's feelings.

The scenes are fictional teaching contexts. The correct models are:
1. He must be tired.
2. She might be waiting for a friend.
3. The library can’t be open to visitors now.
4. She must be relieved.
5. She might be nervous.
6. Emma can’t be in your classroom now.
7. They must be interested in the exhibition.
8. He might be bored.
9. The keys can’t be in the backpack.
10. It must be raining outside.

## Existing style and mechanics

Reference: grammar-unit-2-wishes-dreams-goals.html (Choose the Pattern), actual shared Intermediate 2 CSS, Practice Lab catalog, Unit 5 inline audio and mobile auth behavior. Full-width grammar shell, nonfixed hero/header, numbered cards, three answers, immediate feedback and an expandable explanation of all three options. Three cards per desktop row, two below 1100px, one below 760px. No drag dependency.

The picture opens a native full-viewport dialog with the complete image, large clues and requested meaning; after answering, the sentence is clickable for audio there too. Escape/Close restores focus. Single MP3 player, inline speaker mark, 0.75×/1×, Stop audio, failure/retry message. Reloading the selected media source on each explicit replay preserves WebKit playback after opening a modal.

First-choice results remain distinct from current corrected answers. See my results reports missing answers and focuses the first unanswered card. Restart clears all choices, feedback and counts. State stays in page memory; refreshing starts a new round. This follows the existing ungraded practice model: no teacher submission, gradebook projection, percentage or exam access changes.

Shared Google/Microsoft/local account sign-in retained with the working top-layer mobile panel. Shared page QR, corresponding SVG, decoded canonical URL. All teaching text is simple English.

## Assets and reproducibility

- Page: ingles/intermediate-2/grammar-unit-5-read-the-clues.html
- CSS/JS: assets/css/english-intermediate2-unit5-grammar.css; assets/js/english-intermediate2-unit5-grammar.js
- Question data: assets/data/english-intermediate2-unit5-grammar.json
- Builder: tools/build_intermediate2_unit5_grammar.py. Rebuilds HTML/QR/data and syncs the embedded JS question data, retaining audited audio metadata.
- Four new optimized images: assets/img/english-intermediate-2/unit-5/grammar/{closed-library,video-call,rain,empty-bag}.webp.
- Six existing Unit 5 images reused: tired, waiting, relieved, presentation, interested, bored.
- Rain scene is the activity-specific hero and catalog thumbnail.
- Eight new Sarah / eleven_multilingual_v2 MP3 files: ingles/intermediate-2/audio/unit-5-grammar/. Exact texts, SHA256 and file sizes in models.json; audio-audit.json has all eight matching transcriptions.
- Two existing verified models reused from audio/unit-5-explanation/ (questions 1 and 2).
- Generator/auditor: tools/generate_intermediate2_unit5_grammar_audio.py and tools/audit_intermediate2_unit5_grammar_audio.py.
- QR: assets/img/page-qr/ingles-intermediate-2-grammar-unit-5-read-the-clues.svg.
- Practice Lab: new Unit 5 folder/grid; shared catalog appends one item; 22 activities across five units. Hash links open their folder. Catalog JS tolerates older page markup during deployment.
- Page contract now covers 37 Intermediate 2 pages.

## Verification and publication

Browser test: tools/test_intermediate2_unit5_grammar.cjs. Covers Chrome and WebKit at 320, 390, 430, 768, 1024, 1440 and 1920px. All 30 choices, context-specific feedback, correction vs first-choice scoring, all ten sentence audios/replays, speed, Stop, keyboard answer, modal focus restoration, loaded pictures, responsive grid, QR and sign-in panel. Catalog/search/Grammar filter checked. See final release record below for production checks.

Local screenshots and generated-image contact sheet are under tmp/unit5-grammar/. Audio transcriptions match all eight new scripts; the other two model files retain their existing audit. The enlarged QR was decoded with ZXing to the exact URL.

Deployment uses SHA256 baseline checks, per-file atomic replacement and private backups. Live sitemap is extended only with the new URL, preserving unrelated local work. No Git commit/push, API/service change or student data change.

## New image prompts

Built-in image_gen was used, no CLI fallback. Originals retained in the generated-images directory; optimized project assets saved in assets/img/english-intermediate-2/unit-5/grammar/. Exact prompts:

### closed-library

Photorealistic natural editorial educational photograph, landscape 3:2. Two adult university students outside a small neighborhood library at dusk, examining a clearly locked glass entrance door; inside the room is dark and empty, simple bookshelf silhouettes. One student gently tries the door handle, the other looks through the glass. Realistic hands, natural navy and muted teal clothes. Context for an English deduction exercise about a library being closed. No text, labels, lettering, logos, watermarks or collage. Entire doorway and both adults visible.

### video-call

Photorealistic natural educational photograph landscape 3:2. An adult university student seated at a desk in a classroom looks at a laptop showing a live video call with an adult female friend in a sunny outdoor London setting with Big Ben clearly visible in the distant background. The friend waves naturally. Realistic screen, single large video picture with no UI, no text, no logos, no lettering. Navy and teal subtle palette. Medium wide composition making both the laptop screen and classroom context visible. For a lesson about a friend being abroad rather than in the same classroom.

### rain

Photorealistic natural editorial educational photograph landscape 3:2. Adult community volunteer arriving at a community center doorway carrying a dripping wet teal umbrella, jacket visibly wet; heavy rain and wet pavement visible outdoors behind him. Two adult colleagues at a table inside notice his arrival. Natural realistic anatomy and hands, navy and teal color accents, soft daylight. Clear observable rain clues. No text, labels, logos, lettering, watermarks or collage. Wide comfortable composition keeping umbrella and doorway fully visible.

### empty-bag

Photorealistic natural editorial educational photograph landscape 3:2. Adult woman university student checking a completely empty navy backpack spread wide open on a light wood table; all pockets unzipped and turned outward, a few notebooks and a pencil case placed beside it. She looks carefully into the empty main compartment while a friend helps look. NO keys anywhere in frame. Realistic anatomy, bright natural daylight, teal accents. Composition shows bag interior clearly. Educational image for deduction that missing keys are not inside a thoroughly checked empty bag. No text, lettering, labels, logos, collage or watermark.


## Final release record

- Chrome full prepublication run: all seven widths; all 30 answers and ten audio models at 1440px.
- Production WebKit full run: all seven widths; all 30 answers and ten audio models at 1440px.
- Final production Chrome and WebKit smoke: 390/1440px, all questions/audio at desktop, catalog/search/filter, fixed square QR and visible Restart control. WebKit is a browser engine test, not a physical iPhone test.
- Final page contract: 37 pages passed. JS/Python syntax checks passed. Final release SHA256 hashes verified.
- Eight new MP3 transcripts matched; the two reused MP3s verified against their existing audits and exact hashes.
- Visual review caught and corrected a shared hero-image minimum height stretching the desktop QR; scoped CSS fixes it without changing other pages. Light-background ghost controls now have readable navy text. Final screenshot review passed.
- Backups: /var/backups/jaralingua/unit5-grammar-page-20260925T223029Z; /var/backups/jaralingua/unit5-grammar-page-20260925T223245Z; /var/backups/jaralingua/unit5-grammar-indexes-20260925T223248Z.

Final new image files:

- D:\Jaralingua\assets\img\english-intermediate-2\unit-5\grammar\closed-library.webp
  Original: C:\Users\USER\.codex\generated_images\01a08eab-7836-7f33-bfff-8ed3e81ea6cf\exec-70257423-ddf4-4e75-b267-ba1b820a943a.png

- D:\Jaralingua\assets\img\english-intermediate-2\unit-5\grammar\video-call.webp
  Original: C:\Users\USER\.codex\generated_images\01a08eab-7836-7f33-bfff-8ed3e81ea6cf\exec-87f4c4f0-be39-44a8-be97-baf06daa0c25.png

- D:\Jaralingua\assets\img\english-intermediate-2\unit-5\grammar\rain.webp
  Original: C:\Users\USER\.codex\generated_images\01a08eab-7836-7f33-bfff-8ed3e81ea6cf\exec-e9924c63-153a-4321-93f0-47b99b6ac45e.png

- D:\Jaralingua\assets\img\english-intermediate-2\unit-5\grammar\empty-bag.webp
  Original: C:\Users\USER\.codex\generated_images\01a08eab-7836-7f33-bfff-8ed3e81ea6cf\exec-92a4f7e3-66ea-49bb-aab2-e13fefc326cd.png

## Answer-order correction · 2026-09-25

User reported that every three questions repeated must, might, can't. Reordered the ten complete situations and varied A/B/C option positions per card. The builder now persists both the scene order and each question's options so regeneration does not restore the pattern. Meanings have a 4/3/3 distribution; correct positions have a 3/4/3 distribution with no repeated three-question blocks. This is a fixed classroom order, not a runtime shuffle.

Verified by matching each scene by title against the saved original: clues, goal, correct modal, all explanations, image and audio remain identical. Existing interaction checks now compare displayed options to the question data. Chrome checks passed at 390 and 1440, including all ten questions, explanations, scoring, audio and projection. Page contract passed for all 39 local pages. Only HTML and embedded-data JavaScript needed deployment; the JSON remains a local authoring/test file. Published both files with a new script cache version; hash-verified backup: `/var/backups/jaralingua/unit5-grammar-order-page-20260926T024828Z`.
