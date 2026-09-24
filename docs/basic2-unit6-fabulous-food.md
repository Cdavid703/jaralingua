# Basic English Course 2 — Unit 6: Fabulous Food

## Scope and pedagogical route

Teaching page only: `ingles/basico-2/unit-6-fabulous-food.html`.
No Practice Lab activity, quiz, exam, submission, or new grade column is created.
Source: Basic Course 2 pacing guide, sessions 14–16 (food/eating habits; offering and restaurant needs; restaurant opinions/reviews).
Countability, containers, and quantities are supporting explanations, not an invented new tense requirement.

The 14 topics each state what the student will learn:

1. Food vocabulary: 24 words, food vs meal vs dish.
2. Habits, preferences, dietary choice vs allergy.
3. Countable/uncountable meanings; chicken and coffee context changes.
4. Portions, containers, plural on the measure.
5. Some/any, offers and requests, much/many, a few/a little/a lot of, optional enough/excess.
6. Taste, texture, temperature, preparation and opinions; hot vs spicy.
7. Ingredients vs preparation, short worked recipe sequence.
8. Do you like vs Would you like, accepting/declining politely.
9. Natural restaurant exchange: arrival, menu, order, request, payment.
10. Dietary needs: clear requests and kitchen checks; no allergy-safety promises.
11. Restaurant description/comparison using explicit fictional data.
12. Annotated review model: visit, food, service, recommendation.
13. Five phrasal verbs and five idioms, clearly labelled, Spanish approximation, meaning, register, separate expression/example audio.
14. Pronunciation contrasts and unscored learning summary.

Existing present simple, past simple, was/were, and comparative knowledge is reused in context, not retaught as a new tense lesson. Would like is extended to polite food requests.

## Intermediate material reviewed and adapted

Reviewed `ingles/intermediate/unit-5-food-quantities-culture.html`, including its countability, quantifiers, partitives, adjective and restaurant sections, plus the memory-game audio scripts.
Adapted the explanation logic for A2; did not copy its advanced workshop requirements, cultural essay assignment, or made of/from/with grammar section.
Reused 12 exact word models from `ingles/intermediate/audio/unit-5-food-memory/` and two portion models from `unit-5-market-basket/`.
Reused interior illustrations only, as specifically authorized by the user:

- `assets/img/english-intermediate/unit-5/market-basket-foods/carrots.webp`
- `assets/img/english-intermediate/unit-5/quantity-mission-foods-v2/vegetable-soup.webp`

The main hero is unique to this unit; it is also its Course Overview thumbnail.

## Audio implementation

- 115 distinct models: 14 reused, 101 new ElevenLabs clips.
- Canonical inventory: `ingles/basico-2/audio/unit6/fabulous-food/audio-manifest.json`.
- Scripts are generated deterministically from `assets/js/basic2-unit6-food-content.js` by `tools/build_basic2_unit6_audio_manifest.cjs`.
- Each word, expression and example plays its own file; no combined word-list recording, browser TTS or autoplay.
- Rate 0.75× / 1×, stop button, single active lesson player, replay, network-error message, stop on page hide.
- US voice cast: Sarah for models, Matilda for customer, Sean for server. Character labels are synthesis metadata, not spoken text.
- `tools/elevenlabs_generate_listenings.py --mode tts` creates individual turns, with `tools/elevenlabs_voice_cast.basic2-unit6.json`.
- Unit and expression library share one canonical expression dataset; no independent copies to drift.

## Layout contract

- Full-width application shell; internal grids use available desktop space without stretching paragraphs unnecessarily.
- Horizontal desktop hero: copy and photo are sibling panels. Mobile/tablet stack.
- Header and hero scroll with the document, no sticky/fixed lesson banner.
- Standard top navigation authentication; no floating login.
- All 14 main accordions and their nested extensions are closed on initial load. An explicit hash link may open its requested topic.
- QR is inside the hero copy panel, not an extra page row. On narrow mobiles only the unit label reserves horizontal QR space; the title/body use full width below it.
- SVG QR: `assets/img/page-qr/ingles-basico-2-unit-6-fabulous-food.svg`, points to the production lesson URL, enlarged with the shared centered dialog.
- Teaching illustrations enlarge in a keyboard-accessible native dialog with Close and Escape.
- No stock video placeholder was added. The restaurant model uses illustrated dialogue and individual voiced turns.

## Images: provenance and final prompts

Created with the built-in image generation tool (not CLI). Original outputs preserved; project copies:

1. `assets/img/english-basic-2/unit-6-fabulous-food/hero.png`

   Prompt: Use case: photorealistic-natural. Asset type: wide landscape hero photo for an adult A2 English lesson called Fabulous Food. Primary request: professional editorial photograph in a welcoming contemporary restaurant in Medellin: a friendly waiter discussing a simple menu with two adult diners, with a clearly visible bowl of vegetable soup, grilled chicken and salad on their table. Natural candid interaction, realistic hands and faces, warm daylight, navy and forest-green accents, tasteful terracotta ceramics, generous wide composition. No writing, no logos, no watermarks, no graphic overlays. Crisp realistic food textures, respectful diverse adults. Landscape 3:2.

2. `assets/img/english-basic-2/unit-6-fabulous-food/portions.png`

   Prompt: Use case: scientific-educational. Asset type: one wide photographic teaching plate for English food quantities. Three clearly separated equal zones on a clean warm white kitchen worktop: left exactly two whole red apples, center a small ceramic bowl of dry uncooked white rice beside a clear measuring cup containing rice, right exactly two slices of bread beside a whole unsliced loaf. Professional studio food photography, accurate realistic portions and food textures, soft daylight, front three-quarter angle, minimal uncluttered composition, no text, no numerals, no logos. All objects fully visible. Wide landscape.

3. `assets/img/english-basic-2/unit-6-fabulous-food/restaurants.png`

   Prompt: Use case: photorealistic-natural. Asset type: wide two-panel editorial photo comparison for an English lesson. LEFT panel: a small quiet cozy restaurant with just one occupied table of two adult diners, greenery and daylight, modest tasteful furnishings. RIGHT panel: a busy lively restaurant with many occupied tables, varied adult diners chatting, warm lighting and tasteful furnishings. Obvious visual contrast between quiet and crowded; both clean and welcoming, no implication of food safety or superiority. Straight vertical split at the exact center. No text, no lettering, no logos or watermarks. Professional natural photography, wide landscape.

## Verification and release

Run `node tools/test_basic2_unit6_food.cjs` with a local static server on port 8025, or set `UNIT6_BASE_URL`.
Checks 360, 390, 820, 1440 and 1920 px: full-width layout, collapsed defaults, no horizontal overflow with every section open, QR non-overlap and centered enlargement, image loading/zoom, actual audio playback at 0.75×, controls, scrolling hero/header, and Course Overview/library links.
Also checks all 115 audio files are present and nonempty. Screenshots go to ignored `tmp/unit6-qa/`.

Publication is a separate step requiring approval. Do not deploy unrelated Intermediate 2 or past-pronunciation changes already present in this working tree. Do not bundle staged files belonging to other tasks.
