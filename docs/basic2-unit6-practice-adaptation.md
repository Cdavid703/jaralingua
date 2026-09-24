# Unit 6 — Practice Lab food activities

## Scope approved by the teacher

Adapt the Intermediate 1 food activities for Basic English 2, retaining the originals. Reuse appropriate assets. The teacher selected the automatic microphone coach, not a pair-conversation substitute. Commit, push and deployment approved on 2026-09-24.

Five separate cards in a closed Unit 6 folder:

| Activity | Scope | Teaching prerequisite |
| --- | --- | --- |
| Countable or Uncountable? | 15 three-option questions; noun forms and contextual meaning | Unit 6 sections 3–4 |
| Food Quantities | 15 three-option questions; some/any/much/many/a few/a little/a lot of | Section 5 |
| Containers and Portions | 12 three-option questions; unit plurals, of, food nouns | Section 4 |
| Food Vocabulary Memory | 12 pairs, two teams, one point per match, listen and repeat | Section 1 |
| At the Restaurant with Ethan | Eight microphone turns; automatic English transcript and formative feedback | Sections 8–12 |

No delivery, gradebook entry or new percentage is created. Quiz scores and coach scores are practice estimates. The coach's written report is stored on the device using its own Basic 2 Unit 6 key, not the Intermediate or Nora key.

## Adaptation decisions

Reviewed the Intermediate pages:

- `practice-unit-5-countable-uncountable-food.html`
- `practice-unit-5-quantifiers-gap-fill.html`
- `game-unit-5-food-vocabulary-memory.html`
- `unit-conversation-coach-unit-5-restaurant.html`

Countability, portions and quantifiers are separated instead of copying the original locked multi-stage challenge. Mouse dragging is not required. The countability explanations explicitly distinguish chicken as meat/animal and coffee as drink/serving; they do not claim solids are always countable or that every question must use any.

Vocabulary and examples are narrowed to the Basic 2 explanation. Removed the original expanded menu, made of/from/with grammar, advanced service-problem requirement, forced basket classifications such as “usually plural,” and Intermediate teacher-delivery endpoint.

The food photographs and corresponding original activity heroes are reused intentionally under the teacher's request to recycle these activities. No generic placeholder image or fabricated video is introduced. Heroes for the five activities are distinct within this unit. Original files/pages are unchanged.

## Assets and audio

Images remain under `assets/img/english-intermediate/unit-5/`: market basket, quantity practice, food fair, memory game, and the Ethan restaurant portrait/hero. Individual cards reuse `market-basket-foods/` and `quantity-mission-foods-v2/`.

Memory reuses seven new Unit 6 lesson word recordings and four original Intermediate memory recordings. One new “chicken” recording matches the image without inaccurately calling roasted chicken “grilled chicken.” Card flips and matches use short user-activated Web Audio sounds with an off switch. Model speech is ElevenLabs, not browser TTS. Audio starts directly on card taps; matching pairs retain a Hear word retry and rate controls for mobile autoplay restrictions.

Ethan retains the original voice (`ErXwobaYiN019PkySvjV`). Thirty-three new coach clips plus the chicken word are generated with the existing ElevenLabs tool. Two compatible recovery recordings are copied unchanged. Each turn/reaction is a separate audio file. New canonical scripts: `ingles/basico-2/audio/unit6/restaurant-coach/audio-scripts.md`.

## Coach behavior and limits

Sequence: name → table size → drink → one menu question → food order → offer of bread → food opinion → closing request. Each prompt contains one question. Menu and response help start closed. The visible microphone, device selection, preflight recording, replay, retry, 0.75×/1×, transcript and report use the existing Basic 2 conversation engine.

Character replies use the established transcript-triggered prerecorded-response mechanism, not unrestricted generative dialogue. There is a fallback clarification for unsupported requests. Refusal terms use phrases rather than a bare “not” substring, preventing “another slice” from being misread as a refusal.

English-only transcription endpoint: `/api/english-basic/pronunciation-assessment`. The existing engine retries transient failures, preserves the recording on screen, rejects a foreign-language response, and offers an unscored continuation. No audio is silently treated as a successful submission. Confidence is explicitly not a phonetic diagnosis.

## Design and interaction contract

- Application-width layouts; two quiz questions per desktop row, one on narrow mobiles.
- Horizontal desktop hero; compact stacked mobile hero; no fixed/sticky banner.
- Top-nav login and vector QR in the title panel, centered enlargement.
- Compact Practice Lab cards: title, category and one short sentence; no “0%” labels.
- All folder, instruction, menu and help accordions closed by default.
- Native radio controls remain editable before and after checking. Changing an answer clears its feedback and invalidates the displayed score until rechecked.
- Answer positions use a shuffled balanced distribution across A/B/C, not a fixed repeated answer pattern.
- Try again clears all answers and mixes the choices anew.
- Memory prevents third-card clicks during comparison, resets old timeouts safely, and awards a matching pair once only. The repetition step is oral; it does not pretend to assess pronunciation.

## Builds and tests

`node tools/build_basic2_unit6_practice.cjs` builds the four practice pages, adapts the compact existing coach shell, exports canonical coach audio scripts and copies the two recovery models. Original activities are only read.

`node tools/test_basic2_unit6_practice.cjs` checks 390/820/1440 px, balanced answer keys, complete correct attempts, answer changes before/after checking, reset, all image loads, QR centering, non-fixed layout, complete two-team memory behavior and five closed-folder cards.

`node tools/test_basic2_unit6_restaurant.cjs` checks 360/390/820/1440 px, eight sequential prompts, synthetic microphone preflight/record/stop, transcript, contextual replies, speed, score, re-recording, foreign-language rejection, retry and outage recovery. The transcription service is mocked in this test; it is not a recording from a real student or a claim of testing every physical microphone.

Set `UNIT6_BASE_URL=https://www.jaralingua.com` to repeat tests after deployment. Keep unrelated staged Intermediate 2 changes out of this release.
