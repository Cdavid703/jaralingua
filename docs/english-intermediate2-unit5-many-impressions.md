# Unit 5 — One Picture, Many Impressions

Published activity: https://www.jaralingua.com/ingles/intermediate-2/speaking-unit-5-one-picture-many-impressions.html

Practice Lab → Unit 5 → Teacher-led speaking. The teacher selects a numbered picture for discussion on a television. Students give three or four connected sentences, support an interpretation with a visible clue, and respond to another student. The opening example and language reminder are in simple English.

## Teaching content

- 20 distinct situations, with 60 optional possible descriptions. These are examples, not scored answers. Expressions and gestures are clues rather than proof of a person's feelings.
- Looks/seems + adjective; looks like + noun or a complete idea; feelings and possible causes with -ed/-ing; I think, I guess, perhaps and maybe; agreement and alternative interpretations.
- Five audible opening models and 13 reusable language frames. Vocabulary and all 12 suggested expressions have inline pronunciation. A single audio player defaults to 0.75×, with 1× and Stop controls. Changing the picture, hiding support or closing the viewer stops playback.
- Optional expression suggestions show Phrasal verb or Idiom and an approximate Spanish meaning. Expressions are invitations to extend a description, not obligatory claims about the people in a photograph.
- No student recording, submission, score, gradebook weight or mandatory timer.

## Projection and layout

Click a gallery image or the demonstration image to open the viewport-sized dialog. Images use object-fit: contain so the full picture remains available. Help is initially hidden and resets on picture change. The teacher can reveal Language help, Possible descriptions or Try an expression, then hide the panel again.

Previous/Next, keyboard arrows and random unseen selection are supported. Random selection excludes manually opened pictures. New set restores the complete pool after all 20 have been opened. Escape/Close restores focus to the opener. The native fullscreen control requests fullscreen on the document element because a dialog itself cannot be a fullscreen target. Browsers without native fullscreen keep the enlarged modal view.

The gallery reflows to 5 columns on large televisions, 4 on desktop, 3 on smaller desktop, 2 on tablet and 1 on narrow phones. The hero and header stay in normal document flow. Shared Google/Microsoft/local authentication uses the existing VisualViewport/popover placement. The QR uses the shared component and a real SVG encoding the canonical page URL.

## Assets and maintenance

- Content source: `tools/build_intermediate2_unit5_impressions_data.py` → `assets/data/english-intermediate2-unit5-impressions.json`.
- Page/audio-map builder: `tools/build_intermediate2_unit5_impressions.py` → HTML, QR and embedded JS config. Rebuild the page after editing the data.
- Controller/style: `assets/js/english-intermediate2-unit5-impressions.js`, `assets/css/english-intermediate2-unit5-impressions.css`.
- Nine new 1536 × 1024 generated photographs, optimized as WebP under `assets/img/english-intermediate-2/unit-5/many-impressions/`; eleven suitable existing course images reused. No duplicate scene image within the gallery. Original image prompts, outputs and final asset paths are in `english-intermediate2-unit5-many-impressions-image-provenance.json`. Picture 17 was edited to remove distracting writing from the screen and board.
- 54 unique audio models: 49 reused and 5 new Sarah/ElevenLabs clips. New MP3 scripts and verification results live under `ingles/intermediate-2/audio/unit-5-impressions/`; all five transcriptions passed comparison. Only MP3 files were deployed from this folder.
- The explanation and shared expression library now identify 8 phrasal verbs and 4 idioms and include approximate Spanish meanings. Existing 143 explanation audio models remain unchanged.

## Verification and release

`tools/test_intermediate2_unit5_impressions.cjs` covers gallery columns, page overflow, shared login visibility, QR opening, audio rates, full picture projection, hidden/resettable support, keyboard navigation, focus restoration, native fullscreen in Chrome, random exhaustion/reset, all 20 descriptions and all 54 real MP3 controls. Chrome and WebKit were checked at widths 320, 390, 430, 768, 1024, 1440 and 1920, plus WebKit at 844 × 390. QR was decoded from the browser-rendered enlarged image to the exact canonical URL.

`tools/test_intermediate2_unit5_expression_types.cjs` checks the 12 classifications and Spanish meanings in the lesson and shared library, the four-column desktop layout and pronunciation. `tools/test_intermediate2_page_contract.mjs` passes for all 40 local course pages. The staged Practice Lab was checked for the new card, published counts, speaking filter, search and navigation.

Static release only. Guarded manifests compare the original live SHA-256 before atomic writes and retain backups. Live indexes were built from a fresh live baseline, preserving local unpublished work and unrelated changes. No backend, student submission or exam access state changed.

Backups:

- `/var/backups/jaralingua/unit5-impressions-tv-media-20260926T032633Z` — nine images, five MP3s, QR.
- `/var/backups/jaralingua/unit5-impressions-tv-page-20260926T033414Z` — new activity and expression clarification.
- `/var/backups/jaralingua/unit5-impressions-tv-indexes-20260926T033624Z` — Practice Lab, catalog and sitemap.

Published Practice Lab search/filter/link and live Chrome/WebKit checks passed.
