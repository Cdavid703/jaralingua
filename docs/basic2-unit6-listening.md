# Unit 6 — Lunch at Maple Café

Publication update, 2026-09-25: the user authorized commit, push and deployment with the full Unit 6 responsive repair. See `docs/basic2-unit6-responsive-release.md`; the pending-authorization statement below records the earlier local checkpoint.

## Learning design

- Activity 06 in Basic English 2 Practice Lab, also linked from Listening Library.
- A customer orders lunch: food ingredients, portions, limited amounts, preferences, a drink, and a shared dessert.
- Naturally recycles the phrasal verb **eat out** and the idiom **have a sweet tooth**.
- Ten A/B/C questions: eight detail/meaning items, one main-situation item, and one supported inference about sharing dessert. Distractors reuse details from the conversation without introducing a second correct answer.
- No claim that the customer has an allergy: she expresses a preference for food without cream.
- Balanced answer positions (4/3/3) shuffled for each attempt; distractor order also shuffled. No fixed key for students to memorize.
- Independent practice, score out of ten with explanations. No gradebook mutation or teacher submission.
- Students can change answers before and after checking, including on touchscreens. Reset clears answers and reshuffles.
- Vocabulary is a compact collapsed paragraph; it does not reveal the meaning tested by the idiom question.

## Audio

- Canonical source: `docs/basic2-unit6-listening-script.md`.
- Output: `ingles/basico-2/audio/unit6/listening/unit-6-lunch-at-maple-cafe.mp3`.
- ElevenLabs dialogue mode, two distinct voices: Customer = Matilda, Server = Sean; cast in `tools/elevenlabs_voice_cast.basic2-unit6.json`.
- Dry run: 12 turns, 2 speakers, 2 voices. Labels are metadata, never passed as spoken text.
- Measured duration: 52.27 seconds (Mutagen), 52.24 seconds (browser). Maximum requested: 75 seconds at normal speed.
- Native audio controls, unlimited replay, 0.75× and 1.0×, no autoplay, reload-on-error control.

## Teacher transcript

- No complete transcript in HTML, public JavaScript, or publicly deployed Markdown.
- `/api/basic2/unit6-maple-cafe/transcript` follows the existing `require_user()` gate, then checks Basic 2 teacher/admin role. Other roles receive 403.
- Private source module: `server/basic2_unit6_listening.py`.
- The button remains hidden until an authenticated, authorized response arrives. Logout and auth changes clear the text; stale responses from prior accounts are ignored.
- Teacher can expand and collapse the complete transcript beside the audio controls.
- Deployment must include the new private module and the isolated route hunk, with an API restart. Do not replace the whole production `progress_api.py` with the dirty local copy: unrelated work is present.
- Production must continue blocking direct HTTP access to `server/` and private source files. Do not deploy `docs/` or `tools/` in the public webroot.

## Layout

- Shared Unit 6 food layout: horizontal full-width hero on desktop, compact stacked layout on mobile/tablet; hero and header scroll normally.
- QR inside the title panel, generated as SVG for the exact production URL and enlarged in a centered modal.
- Two questions per row above 700px; one below. Touch targets at least 44px.
- Teacher tools, vocabulary, and course menu closed/hidden by default. No floating login, new overlay controls, or 0% label.
- Unique professional image for this activity; same image reused only in its own library cards.

## Image provenance

Built-in image generation tool (not CLI). Original retained:
`C:/Users/USER/.codex/generated_images/019f96fb-b777-7cc1-b96f-7843d8efd180/exec-2d50010e-de9e-46db-9e6c-a337427d7594.png`.

Project asset: `assets/img/english-basic-2/unit-6-fabulous-food/listening-maple-cafe.webp` (optimized WebP).

Prompt: Use case: photorealistic-natural. Asset type: landscape hero photograph for an adult A2 English restaurant listening activity. Professional editorial photograph of an adult woman customer at a small bright contemporary restaurant, warmly speaking with an adult male waiter holding a small order pad. A simple menu without readable text lies on the table beside a water glass. Natural midday window light, realistic hands and faces, candid friendly interaction, appealing restrained interior, horizontal wide framing with both people visible. No text, logos or watermarks.

## Verification

- `node tools/test_basic2_unit6_listening.cjs` against static server on port 8025: widths 360/390/820/1440/1920, full-width layout, no overflow, scrolling hero/header, centered QR, image loads, actual audio playback/duration/speeds, touch answer changes, balanced key, scoring/reset, teacher/student/logout/transcript UI (mocked API), and library links.
- `python tools/test_basic2_unit6_listening_backend.py`: tests actual route AST for student/visitor rejection and teacher/admin success; asserts route follows authentication and source transcript matches audio script.
- Screenshots: ignored `tmp/unit6-listening-qa/`.
- Publication requires user authorization; preserve all unrelated staged and working-tree changes.

### Local result — 2026-09-24

Both dedicated tests passed. Browser checks used real headless Chrome with touch emulation at 360/390/820px and desktop viewports at 1440/1920px. This is not a claim of physical iOS/Android device testing. Screenshots were inspected and the image crop/buttons improved. Audio was decoded and played in the browser at both speeds. Transcript authorization was tested against the actual route AST; browser role tests used a mocked endpoint, not a production login. Commit, push, API restart, and production verification remain pending authorization.
