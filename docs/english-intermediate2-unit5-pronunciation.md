# Unit 5 — First Impressions, Clear Words

Published: https://www.jaralingua.com/ingles/intermediate-2/pronunciation-unit-5-first-impressions-clear-words.html

Practice Lab → Unit 5 → Pronunciation. Four guided sections and a final recording use simple English to describe appearances, deductions, feelings and support. Delivery goes to the independent teacher inbox, without a grade or percentage.

## Template mapping before implementation

| Reference | Reused in Unit 5 |
| --- | --- |
| Unit 4: Make Your Movie Review Clear | Complete HTML anatomy, audio controls, Shadow Mode, reading/recording workspace, results, support cards and delivery |
| Unit 3: Sound Clear in Tech Support | Computed component backgrounds, borders and type verified against the new page |
| Unit 1 shared pronunciation engine | Recording, microphone selector/meter, assessment, clickable words, retry, stage progression and protected teacher inbox; engine unchanged |
| Course pronunciation standard | Five exact-text professional models, individual-word MP3s, no speech-synthesis fallback, independent submission storage |
| Course page standard | Shared authentication, QR SVG and expandable QR dialog, full-width responsive layout |

## Sequence

1. **Appearances and final sounds:** looks worried, seems calm, looks like a student.
2. **Deductions and clear contrasts:** must, might, can’t; clear final consonants and sentence stress.
3. **Feelings and word stress:** tired/tiring; I think, I guess, perhaps; cheer him up.
4. **Support and connected expressions:** a heart of gold and calm down.
5. **Final challenge:** the four sections joined exactly, then sent to the teacher after evaluation.

Listen → shadow → record the visible text → inspect recognized/missed words → tap a word to hear its exact recording → retry or advance. A controlled recognition test deliberately omitted “worried”; its red, underlined word remained clickable and played the correct audio. Feedback reflects speech-recognition alignment, not a phonetic diagnosis.

## Media and configuration

- Builder: `tools/prepare_intermediate2_unit5_pronunciation.py`.
- Configuration: `assets/js/english-intermediate2-pronunciation-unit5.js`.
- Local styles: `assets/css/english-intermediate2-pronunciation-unit5.css`.
- Shared engine: `assets/js/english-intermediate2-pronunciation-unit1.js`, unchanged.
- Public script: `ingles/intermediate-2/audio/pronunciation/unit-5-first-impressions-clear-words-script.md`.
- Audio: `ingles/intermediate-2/audio/pronunciation/unit-5-intermediate2/`; 5 readings and 60 distinct word models. Sarah, General American English, ElevenLabs `eleven_multilingual_v2`. Eleven matching, audited words were reused from Unit 4; 54 clips were generated.
- `models.json` records each source/hash. `audio-audit.json` confirms the five readings and the individual breath, can’t, might, must, tired and tiring models match their text. Browser tests played all 60 words.
- QR SVG: `assets/img/page-qr/ingles-intermediate-2-pronunciation-unit-5-first-impressions-clear-words.svg`; canonical URL above.

### New image

Built-in `image_gen`, new generation. Final project file: `D:/Jaralingua/assets/img/english-intermediate-2/unit-5/pronunciation/first-impressions-hero-v1.png`.

Original: `C:/Users/USER/.codex/generated_images/01a08eab-7836-7f33-bfff-8ed3e81ea6cf/exec-9e65fad6-7583-4914-938f-3df8f39560eb.png`.

Final prompt:

> Use case: photorealistic-natural. Asset type: landscape 16:9 hero photograph for an Intermediate English pronunciation activity called First Impressions, Clear Words. Create a natural, credible editorial educational photograph: two adult Latin American university classmates at a warm wood study table in a bright modern classroom. A young adult man with short dark hair wearing a navy overshirt looks mildly worried at an unlettered notebook; an adult woman in a muted teal blouse is listening sympathetically beside him, a gentle supportive expression and natural hand gesture. A small desktop microphone on the table subtly suggests speaking practice. Soft window light, real skin texture, calm navy and teal palette, uncluttered shelves in soft focus. Medium-wide shot; faces and microphone fully visible, central framing safe for responsive crops. No text, numbers, letters, logos, watermark, UI, collage, illustrations, headphones or dramatic distress. This must be a new activity-specific photographic image.

## Delivery and verification

- New `/api/intermediate2/unit5-pronunciation/submit`, `/submissions`, `/audio` routes follow Unit 4's canonical-reference and idempotency checks. Protected audio remains outside the public site.
- Storage: `JARALINGUA_INTERMEDIATE2_UNIT5_PRONUNCIATION_SUBMISSIONS`, default `/var/lib/jaralingua/intermediate2-unit5-pronunciation-submissions.json`.
- Uses Course 2 teacher permissions. Students access only their own recordings; teachers access the inbox. `teacherInboxOnly: true`, `gradebookProjected: false`, `affectsAverage: false`.
- Delivery/HTTP tests use temporary files, synthetic accounts and real local HTTP. They verify reference rejection, idempotency, student isolation, teacher listening access and unchanged gradebooks.
- UI test uses real Chrome MediaRecorder with a synthetic microphone and controlled recognition to test retry, red-word playback, all 60 words, five recordings, final delivery and teacher audio access. No test accounts or student submissions were created in production.
- Layout/QR tests in Chrome and WebKit at 320, 390, 430, 768, 820, 1440 and 1920 pixels. The mobile hero keeps the entire photograph; search follows the hero without overlap. Shared component styles match Unit 3. These are browser-engine tests, not physical-device tests.
- Live smoke test verifies the Pronunciation catalog filter/link, playback at 0.75×, word replay, enlarged QR, and anonymous denial for all three protected routes.
- Page contract: 43 local pages with QR assets and shared authentication.

Tests: `tools/test_intermediate2_unit5_pronunciation_{page,layout,ui}.mjs`, `tools/test_intermediate2_unit5_pronunciation_{delivery,http}.py`, `tools/test_intermediate2_unit5_pronunciation_live.cjs`.

## Release

74 files deployed selectively: new page, configuration/style, image, QR and 65 MP3s, plus a minimal patch to the current production server, catalog, Practice Lab counts and sitemap. Existing catalog entries were preserved; the pending Behind the Picture entry was not published. No shared engine/style or existing audio was changed.

SHA-256 guards, backup and health check; server functions in the staged release match the tested implementations. Backup: `/var/backups/jaralingua/unit5-pronunciation-20260926T110742Z`. Manifests, production originals and differences: `tmp/unit5-pronunciation/`.
