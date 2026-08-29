# Intermediate English Course 2: pronunciation activity standard

Updated: 2026-08-29.

This document defines the real construction contract for pronunciation pages in
Intermediate English Course 2. It is derived from the published Unit 1 and Unit
2 activities and must be used before creating another unit.

## Sources of truth

- Page shells:
  - `ingles/intermediate-2/pronunciation-unit-1-people-who-changed-my-circle.html`
  - `ingles/intermediate-2/pronunciation-unit-2-the-choice-id-make-differently.html`
- Shared engine: `assets/js/english-intermediate2-pronunciation-unit1.js`.
- Per-unit configuration: `assets/js/english-intermediate2-pronunciation-unit2.js`.
- Shared styles:
  - `assets/css/english-intermediate-pronunciation.css`
  - `assets/css/english-intermediate2-pronunciation.css`
- Catalog: `assets/data/english-intermediate-2-content.json`.
- Delivery API: `server/progress_api.py`.
- Audio production: the unit script, the section generator, and the word-audio
  generator under `tools/`.

## Required page anatomy

1. Course 2 switcher and navigation.
2. Course 2 pronunciation hero with an activity-specific photograph.
3. Activity search.
4. Delivery-policy strip: teacher inbox only, no Grades entry, no percentage,
   and no effect on the average.
5. Main practice panel.
6. Professional model player with 0.75x, 1x and 1.25x controls.
7. Shadow Mode.
8. Stage progress: four guided sections plus one final challenge.
9. Clickable reading text.
10. Microphone selector, live input meter, timer, recording controls and student
    playback.
11. Recognition result: overall score, accuracy, completeness, rhythm,
    transcript and missed-word feedback.
12. Pronunciation-focus cards and teacher listening guide.
13. Final-recording delivery panel and teacher inbox.

## Pedagogical sequence

Each activity uses four short meaning groups. A learner must:

1. listen for meaning;
2. listen again for the pronunciation focus;
3. shadow the professional model;
4. record the exact visible sentence;
5. inspect transcription and word-level feedback;
6. click and rehearse missed words;
7. retry or move to the next section;
8. complete the final challenge with the four sections combined.

The page teaches connected speech, word stress, sentence stress, reductions,
final consonants and thought groups inside meaningful unit language. It must not
become an isolated word list.

## Clickable-word contract

- Every visible word is rendered as a real `button.reading-word`.
- The initial text is neutral; color is not the only instruction.
- After analysis, recognized words become green and words needing practice
  become red with a wavy underline.
- A click on any word opens the pronunciation-help region and automatically
  plays its exact professional MP3.
- The selected word has a visible focus state and `aria-pressed` state.
- The help region gives a word-specific tip and a replay button.
- While playing, the word has an explicit playing state.
- Missing audio must display an unavailable state; it must never fall back to
  browser `speechSynthesis`.

## Audio contract

- Provider: ElevenLabs.
- Accent: General American English.
- Standard voice: Sarah, ID `EXAVITQu4vr4xnSDxMaL`.
- Model: `eleven_multilingual_v2`.
- Every guided-section MP3 must match the visible sentence exactly.
- The final MP3 must equal the four guided sentences joined in order.
- Every distinct spoken word in the final text must have an individual MP3 in
  the unit `words/` directory.
- Contractions are normalized to filename slugs, for example `I'd` becomes
  `id.mp3` and `mustn't` becomes `mustnt.mp3`.
- Every generated word file must be larger than 1 KB and every section/final
  model larger than 10 KB.
- Scripts and production metadata remain in the repository for auditability.

## Shared-engine architecture

Do not duplicate the large recording and evaluation engine. A new unit provides
`window.JaraIntermediate2PronunciationConfig` before loading the shared Unit 1
engine. The configuration supplies:

- the four stages and final challenge;
- section and final audio paths;
- assessment, submission, inbox and delivered-audio API paths;
- local progress key and submission prefix;
- activity title and final product description;
- word-audio base directory;
- speech-recognition equivalences;
- unit-specific pronunciation tips.

## Delivery and privacy contract

- Only the final challenge unlocks delivery.
- Submission is authenticated and idempotent.
- The server validates that `referenceText` exactly matches the canonical final
  text before storing audio.
- The recording is stored in the independent pronunciation inbox.
- The response and stored item state `teacherInboxOnly: true`,
  `gradebookProjected: false` and `affectsAverage: false`.
- No grade, weight, percentage, evaluation ID or grade details may be stored.
- Teachers may list submissions and play a recording through the protected
  delivered-audio route. Students may only access their own submission.

## Catalog and Practice Lab contract

The new item in `english-intermediate-2-content.json` must include:

- `type: pronunciation`;
- the correct unit and sequence order;
- `audioProvider: elevenlabs`;
- `teacherSubmission: true`;
- `gradebookProjected: false`;
- `affectsAverage: false`;
- `status: published` only after the page, audio and API are deployed.

## Responsive and accessibility contract

- Use the Course 2 full-width layout and documented gutters.
- Desktop may place reading and recording side by side.
- Mobile stacks controls, keeps the microphone visible and uses full-width
  touch targets.
- The hero retains its subject and does not become a decorative sliver.
- All controls are keyboard accessible and have meaningful labels.
- Feedback and status regions use live announcements where appropriate.
- The activity remains usable if recording is unavailable: model and word audio
  must still work.

## Minimum validation

1. Five stage texts exist and the final equals the four guided texts joined.
2. Every local page reference exists.
3. No browser speech-synthesis fallback exists.
4. Every section, final and unique-word MP3 exists and passes the size floor.
5. Word click creates help, auto-play and replay states.
6. Microphone, stage progression, retry and result states remain wired.
7. Catalog flags prohibit gradebook projection and average changes.
8. Delivery tests prove idempotency, reference-text validation, protected audio
   storage and absence of grade fields.
9. Public HTML, JS, hero and representative audio URLs return successfully after
   deployment.

## Unit 3 implementation record

- Activity: `Sound Clear in Tech Support`.
- Scope: technology support, troubleshooting instructions and digital safety.
- Guided sections: 4; final challenge: the four sections joined exactly.
- Professional models: 5 ElevenLabs MP3 files.
- Unique clickable-word models: 52 ElevenLabs MP3 files.
- Page: `ingles/intermediate-2/pronunciation-unit-3-sound-clear-tech-support.html`.
- Configuration: `assets/js/english-intermediate2-pronunciation-unit3.js`.
- Source script: `ingles/intermediate-2/audio/pronunciation/unit-3-sound-clear-tech-support-script.md`.
- Audio metadata: `ingles/intermediate-2/audio/pronunciation/unit-3-intermediate2/metadata.json`.
- Delivery endpoint namespace: `/api/intermediate2/unit3-pronunciation/`.
- Assessment and delivery tests:
  - `tools/test_intermediate2_unit3_pronunciation_page.mjs`;
  - `tools/test_intermediate2_unit3_pronunciation_delivery.py`.
- Practice Lab sequence: pronunciation is the first published Unit 3 activity;
  listening, reading and Conversation Coach remain the next planned activities.