# Unit 6 — Stone Soup interactive reading

Status: published on 2026-10-01 with the owner's authorization, together with Unit 6 pronunciation and its separately tested API integration. See `docs/unit6-release-20261001.md` for release checks, backups and limitations.

## Scope and pedagogy

- Practice Lab / Unit 6 / activity 08, Reading: Stone Soup (Market Basket Challenge is 06 and pronunciation is 07).
- Original 225-word retelling of the traditional tale, six illustrated pages with a complete ending. Not copied from a modern edition.
- Unit 6 focus: food, ingredients, countable/uncountable quantities, some/any, a few/a little, polite requests, portions, cut up, and make someone's mouth water. Familiar past narration supports the story.
- Ten clickable vocabulary words before the book; five columns on wide screens, two on phones.
- Ten A/B/C questions: details, sequence, expression in context, changes in behaviour, and the reason the meal succeeds. Plausible distractors use story details without creating multiple correct answers.
- Answer positions reshuffle each attempt, balanced 4/3/3, rejecting triples and repeated ABC cycles. No fixed A/B/C pattern. Students can change answers before AND after checking. Feedback explains the answer and opens the relevant page.
- Local progress only; no gradebook percentage, submission, student records, or backend changes.

## Design and book behaviour

- Fluid full-width page with normal-flow header and horizontal hero; no sticky banner. QR belongs inside the title panel. Compact Practice Lab card, one-sentence description.
- Small illustrated cover opens a full-viewport dialog. Native fullscreen is requested when supported, with viewport fallback when unavailable or denied. Mount the modal after the fullscreen transition so background content cannot cover the book.
- Phones see landscape advice BEFORE opening; portrait remains supported. A−/A+ enlarges text. Short screens can scroll within the text panel.
- Every one of six pages has its own illustration. Sequential page numbering 1–6, visible book spine/edges, page-turn animation, recorded paper sound, Previous/Next, page selector, keyboard and swipe navigation, final The End.
- Respect reduced motion; keep navigation and sound available. Page sound has a mute control. Trigger audio synchronously from user gestures for mobile browsers; device/browser audio policies still apply.
- Read this page / Read the whole story / Pause / Stop, plus 0.75× and 1.0×. Whole-story playback is one continuous file with page changes synchronised to decoded chapter boundaries, avoiding an autoplay queue on phones.
- Closing stops all playback and restores focus/scroll. Manual navigation stops narration. No extra Open Link beside the hero QR.

## Audio

- ElevenLabs: Sarah narrator, Sean traveller, Matilda villagers/baker. Six page recordings and eight new vocabulary recordings; reuse existing Unit 6 tender and serve recordings.
- Full story: 82.79 seconds at 1.0×. Built from decoded page recordings with short pauses; chapter starts stored in manifest.json and basic2-stone-soup-audio.js.
- Reuse the existing Goldilocks page-turn.wav. No browser speech-synthesis fallback claimed as ElevenLabs.
- Transcription verification detected English and matched the complete script, including two carrots, two potatoes, one onion, little salt, and the final invitation. American/British spelling variation in ASR does not change the narration.
- Public files: ingles/basico-2/audio/unit6/stone-soup/. Scripts and voice cast are recorded; credentials are never packaged.

## Image assets and generation prompts

Seven new generated illustrations, saved under assets/img/english-basic-2/stone-soup/: cover.png and page-1.png through page-6.png. Originals retained outside the repository. Consistent traveller (dark curls, olive coat, rust scarf, brown satchel), elderly woman (silver hair, blue shawl), farmer (cream shirt, brown waistcoat), baker (red apron). Professional realistic painterly storybook imagery, village square, no text/watermarks, warm natural light; use the cover as character reference for all scenes.

- Cover: villagers bringing vegetables and bread to share a large soup pot in a welcoming village square; traveller and neighbours central, professional illustrated storybook cover without rendered lettering.
- Page 1: hungry traveller outside a cottage asking an elderly woman through her half-open door for food; other doors closed, no cooking pot yet, cool afternoon.
- Page 2: one smooth clean stone in an iron pot of clear water, no vegetables; curious woman beside the traveller, controlled cooking fire.
- Page 3: neighbours preparing carrots, two potatoes and one onion beside the pot; clear, limited ingredients rather than overflowing baskets. The first generation had extra food; an edit removed additional food from hands/bowls and kept clear water. Final image shows TWO carrots; the story, question distractor, scripts and page/full audio were all aligned to two carrots.
- Page 4: traveller tasting vegetable soup, baker in red apron offering salt and bread; only a tiny pinch of salt, warm afternoon.
- Page 5: traveller using a ladle to serve steaming soup, villagers around a table with bowls and slices of bread, golden light.
- Page 6: mostly empty bowls after the meal; traveller shows an ordinary stone in his palm, woman/farmer/baker smile and share remaining bread; no supernatural effects.

## Verification

Automated Chromium touch-context checks at 360×800, 390×844, 844×390, 820×1180, 1180×820, 1440×1000. No horizontal overflow; all images and audio resources present. Visually inspected portrait, landscape and desktop screenshots.

Verified full-viewport reader and portrait advice, ordered page navigation, animation and decoded playing paper sound, individual/full narration, time-based page synchronisation, speed/pause, enlarged text, closing cleanup, all vocabulary/page audio URLs, mutable quiz answers before/after check, scoring, feedback, balanced shuffle, persistence/reset, reduced motion, centered QR, and no page errors. These are browser-emulated viewport tests, not physical iOS/Android device certification.

Run tools/test_stone_soup.cjs with PLAYWRIGHT_MODULE and STONE_SOUP_BASE_URL as appropriate; STONE_SOUP_BROWSER=webkit selects WebKit. The preview server must support byte ranges for audio seeking. The October 1 production check exposed an interrupted-play race: pausing while narration was loading could disable Resume. Explicit pause/resume now invalidates the older play promise, and the test reproduces that AbortError.
