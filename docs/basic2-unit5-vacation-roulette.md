# My Last Vacation — Speaking Roulette

## Location and purpose

- Basic English 2 → Practice Lab → Unit 5: Looking Back → Activity 10.
- Page: `/ingles/basico-2/practice-unit-5-vacation-roulette.html`.
- Oral preparation for Basic Course 2 Final Writing Task, not a new exam.
- Teacher-directed whole-class activity. No recording, submission, numerical feedback or gradebook weight.
- The official writing exam is unchanged. This rehearsal deliberately excludes its fifth question about a funny or embarrassing event.

## Teaching sequence

1. Learners prepare four oral answers about the same vacation. The default preparation time is **15 minutes**; the teacher may select **10 minutes**. The countdown can be paused or reset and never forces the teacher to start a turn.
2. Teacher/admin signs in using the top navigation and presses **Load Basic English 2 students**. The attendance panel is closed initially; absent learners can be excluded.
3. Spin the student wheel, then the question wheel. One learner answers one question aloud. Encourage full sentences, clear pronunciation and past forms.
4. Optional **Show this turn on the big screen** displays only the selected learner and question, centered on screen. Optional collapsed support offers an unfinished sentence starter, not a completed model response.
5. Teacher gives oral feedback, then presses **Finish turn · Next participant**. Students cannot repeat until a new participation round is explicitly started. Questions are randomly drawn without replacement in cycles of four.

### The only four questions

1. Where did you go on your last vacation?
2. When did you go?
3. Who did you travel with?
4. What did you do there?

The exam's postcard, word count, shared written delivery and fifth content prompt remain requirements of the official exam, not of this oral rehearsal.

## Technical behavior

- Reuses the authenticated `/api/basic2/grades` endpoint and validates `teacher`/`admin` role before rendering names. Retains only student ID and display name in memory. No roster, emails, grades or credentials are saved by this activity.
- Loading has a 20-second timeout, retry messages and expired-session guidance. Authentication changes abort pending requests, cancel spins and clear all names. Late responses from a previous account cannot restore the roster.
- No hardcoded student list or player cap. Duplicate IDs are discarded. Attendance and reload controls are locked during a selected/animated turn.
- Selection uses `crypto.getRandomValues`; the animation and result use the same frozen candidate list.
- Reuses existing `yesterday-pictures/roulette.wav` and `card-flip.wav`. Sounds start from user taps, with a mute toggle and an explicit blocked-audio message. Spins last 3.5 seconds with an audible final chime. Reduced-motion devices use one gentle base turn instead of five fast turns; the visual preference never cuts the audio short.
- Full-width responsive layout; horizontal desktop hero; header and hero are in normal document flow. Two question cards per row on phones; wheels stack on narrow screens. No floating login or score.
- Small QR stays **inside the hero title box**; click enlarges a centered vector SVG. No additional QR row or external QR service.
- All disclosures and the Unit 5 catalog folder remain closed initially. The catalog card has a category and one short description, with no 0% badge.

## Image provenance

- Tool: built-in `image_gen.imagegen`, new generation, opaque background, no reference image.
- Generated source: `C:/Users/USER/.codex/generated_images/019f96fb-b777-7cc1-b96f-7843d8efd180/exec-e36557a6-ced2-4906-b810-9161b2cb3f91.png`.
- Final asset: `assets/img/english-basic-2/unit-5-vacation-roulette-hero.webp`, 1536 × 1024, optimized from the generated PNG using Sharp, quality 86. Visually inspected in the responsive page.
- Prompt: “Use case: photorealistic-natural. Asset type: professional hero photograph for an adult English class activity called My Last Vacation, oral preparation using two classroom selection wheels. Create a wide landscape editorial photograph in a bright contemporary adult language classroom. A warm approachable teacher and three adult Latin American learners discuss travel memories around a table, one learner speaking naturally while the others listen, with a few small printed vacation photos of coast and town on the table. In the background a classroom TV has two simple colorful circular selection wheels with NO text and NO names. Authentic candid interaction, realistic anatomy and hands, professional soft daylight, navy and teal classroom accents, sharp natural photographic detail. Image will be the right half of a horizontal website banner and cropped for a card. Keep main subjects centered and fully usable within landscape crop. No writing, no watermarks, no logos, no captions, no embedded UI labels. Generate a polished 1536x1024 landscape image.”

## Verification and scope

`node tools/test_basic2_vacation_roulette.cjs` uses only synthetic student fixtures. It verifies the four questions; 10/15-minute timer; expired-session retry; student-role denial; duplicate filtering; attendance; no-repeat rounds; sound and mute/blocked handling; logout and late-response safety; 320/390/768/820/1024/1440/1920-pixel layouts; centered question and QR dialogs; all image assets; closed folders and the 10-card catalog.

Publication is static only, with no database changes or service restart. The release tool patches only the new Unit 5 card and count in the existing catalog, preserving unrelated Unit 6 work and unrelated staged files. Existing course exams and grades are not modified.

### Regression: spin and audio effects (2026-09-28)

The initial reduced-motion branch removed the CSS transition and paused the wheel WAV after only 100 ms. Reproduced with an actual browser configured for reduced motion; normal-motion playback worked. Replaced the transition with frame-driven deceleration over 3.5 seconds (gentler travel for reduced motion) and removed the early audio pause. Both wheels use the same animation and frozen-selection geometry. Account changes cancel the frame loop as well as the timer. CSS/JS cache versions were bumped.

`node tools/test_basic2_vacation_roulette_effects.cjs` measures transforms at two points during **both** spins in normal and reduced-motion configurations and checks **real, non-mocked** WAV playback progress/decoding through the final chime. Default mode serves the edited local JS/CSS over the public page with synthetic roster data; set `ROULETTE_TEST_LIVE=1` to verify only deployed assets. A mock `play()` call and an HTTP 200 are not sufficient evidence that the animation and sound work.
