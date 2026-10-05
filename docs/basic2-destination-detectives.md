# Destination Detectives — Basic English 2

Requested 5 October 2026: final oral preparation with ten detailed, recognizable real destinations; roulette chooses two students from the current Basic English 2 roster, excluding César and Santiago. The describer speaks without writing; the guesser turns away, listens, asks questions and names the place. First example teaches both roles.

## Classroom use

Open `ingles/basico-2/final-oral-destination-detectives.html`, linked from Evaluations and Exam Practice. Start with “Try the first example” (Paris); show the model, hide it and rehearse in the students’ own words. Model supports there is/are, weather, present continuous for visible actions, and can/can’t for activities, aligned with the supplied Final Oral Task Basic C2 DOCX's travel and tourism information exchange. This is preparation, with no submission or grade.

Teacher/admin signs in and loads Basic English 2. Manage attendance, spin once for the describer and again for the guesser. Choose a numbered card; the picture stays covered until the guesser turns away. Reveal after an oral guess, finish and select the next pair. The active card can be closed and resumed. A new participation round resets students only; a new picture deck resets images only. At an odd final student, a returning partner is explicitly announced and confirmed before spinning. No pair contains the same person twice.

## Images

Ten generated illustrations: Paris, Cartagena, London, New York City, Rio de Janeiro, Rome, Machu Picchu, Giza, Venice and Sydney. Optimized full-resolution WebP files live in `assets/img/english-basic-2/destination-detectives/`. Built-in `image_gen` generated one image per destination. Exact prompt set: [basic2-destination-detectives-image-prompts.json](basic2-destination-detectives-image-prompts.json). Images are illustrative scenes, not documentary photographs. Paris is the guided example and this activity's unique hero/index image. The remaining nine cards are shuffled, with only numbers on their backs. No destination labels are placed over the pictures before reveal. Enlarging preserves the entire image with object-fit contain.

## Roster and sound

Reuses the authenticated read-only `/api/basic2/grades` endpoint; requires teacher/admin response. Only IDs/names are retained in memory; neither grades nor roster are saved. Names are accent-normalized and excluded on exact name tokens `cesar` / `santiago` (not substring matches). The exclusion is scoped to this activity. Account changes/logout abort pending loads and spins, clear names, redraw the empty wheel and close dialogs. Epoch/session checks reject late responses.

Existing Unit 5 roulette WAV plays for the full 3.5-second spin, including its final chime; the existing card-flip WAV accompanies opening/revealing. Mute stops both. Reduced motion uses a gentler single base turn without shortening sound. No browser speech synthesis or new voice recording.

## Validation

`tools/test_basic2_destination_detectives.cjs` uses synthetic students only and real browser audio playback. Covers exclusions (including accents), duplicate ID removal, attendance, two distinct roles, no repeated students, odd final student, card cover/reveal/resume, image enlargement, logout cleanup, normal/reduced motion, denied roster access, all ten assets, exam-center link and QR. Six viewport sizes cover phone/tablet portrait/landscape plus laptop/desktop; real auth script checked for one top-navigation sign-in, no floating sign-in, flowing hero and no page/dialog horizontal overflow. Scoped checks cover the same requirements as the older Windows-only global top-nav/hero scripts without changing unrelated pages.

`tools/test_basic2_destination_deck.cjs` additionally checks all ten playable rounds and distinct revealed answers, deck exhaustion/reset, mute, the mobile QR dialog and a delayed roster response after logout.

Run from repository root with Playwright available in NODE_PATH:

```sh
node tools/test_basic2_destination_detectives.cjs
node tools/test_basic2_destination_deck.cjs
JARALINGUA_TEST_URL=https://www.jaralingua.com node tools/test_basic2_destination_detectives.cjs
```

BROWSER_PATH may override the default macOS Chrome executable. Production roster permissions are checked with synthetic responses, not live student credentials or private student records.

## Visual alignment — 5 October 2026

Teacher requested the established Basic English 2 design. Replaced the initial teal/cream theme with shared Basic 2 navy/blue/red tokens, the navy photo banner and framed illustration used in Course Overview, white headings, red pill buttons, white rounded panels and pale blue support areas. Roulette uses the same blue/red palette. Local and production responsive/auth/audio checks cover the restyled activity.
