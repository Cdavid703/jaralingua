# Unit 5 — Little Red Riding Hood interactive book

Published URL: https://www.jaralingua.com/ingles/intermediate-2/reading-unit-5-little-red-riding-hood.html

Practice Lab → Unit 5 → Reading. A cover and eight illustrated pages retell the traditional story in simple English. Each turn shows one complete story page, with its illustration and written text. Desktop pages arrange the illustration and text beside each other; phones stack them. The course's navy/teal shell, shared authentication and QR remain consistent with the other Intermediate 2 pages. The book's binding, warm paper, serif text and gold details follow the physical-book approach used in Basic 2's Goldilocks page.

## Reading and teaching

- An original classroom adaptation, with a gentle ending: Grandma hides safely in the pantry and the wolf runs away when a forester arrives. The traditional Grimm source is credited on the page. This is not a verbatim quotation of a modern edition.
- Eight new illustrations use a consistent character bible and painterly style. There is an image on every story page; the cover reuses the first illustration. Images can be opened separately without cropping.
- Looks/seems/looks like; feelings and their causes with -ed/-ing; I think/I guess/perhaps; might, must and can't as deductions; phrasal verbs and idioms appear in the story.
- Each page has a full narration. Twenty-four inline speaker-marked phrases have separate pronunciation clips. One shared player prevents overlapping audio. Default speed is 0.75×, with 1×, pause/resume, Stop and a seek control.
- Listen to the book starts at the current page (or page 1 from the cover), then advances automatically after each narration. Manual page changes stop the previous audio and cancel continuous reading. Backgrounding the page pauses playback.
- Previous/Next, a page selector, numbered desktop shortcuts, arrow keys and horizontal swipes support navigation. Reduced-motion users get immediate page changes without animation.
- A+ increases the story text. Enlarge book moves the same reader into a viewport-sized dialog; its audio and navigation remain outside the scrolling page area. Fullscreen is available where the browser supports it. Nested image enlargement closes back to the book without losing the page.
- Each page has a closed-by-default exploration panel with three short language explanations and one discussion question. Phrasal verbs/idioms include their category and approximate Spanish meanings. The story itself is entirely in simple English.
- No submission, grade, account requirement for reading, or automatic evaluation. Student-visible story text is intentional for this reading activity.

## Shared expression library

Added **run away** and **look for**, with new audio, definitions, examples and approximate Spanish meanings. Extended the existing **put on** entry to include clothing/accessories while preserving its recording/music meaning and pronunciation. No duplicate term was created. Existing cheer up, calm down, under the weather and heart of gold entries remain available.

## Source and assets

- Story source/configuration: `assets/data/english-intermediate2-red-riding-hood.json`.
- Media/QR preparation: `tools/prepare_intermediate2_red_riding_hood.py`.
- HTML/embedded-data builder: `tools/build_intermediate2_red_riding_hood.py`.
- Reader: `assets/js/english-intermediate2-red-riding-hood.js` and `assets/css/english-intermediate2-red-riding-hood.css`.
- Eight delivered WebP illustrations: `assets/img/english-intermediate-2/unit-5/red-riding-hood/`, from `01-a-basket-for-grandma.webp` through `08-a-better-ending.webp`.
- Images were made with the built-in `image_gen` tool. Full prompts, source PNG paths and final WebP paths are recorded in [image provenance](english-intermediate2-red-riding-hood-image-provenance.json). Originals remain in the generated-images folder; all consumed images are saved in the workspace.
- Audio: `ingles/intermediate-2/audio/unit-5-red-riding-hood/`. The folder holds 8 page narrations, 24 inline models and 2 additional base-form models for the expression library (34 MP3s). `models.json`, `scripts.md` and `audio-audit.json` preserve script/hash/provenance information locally. Only the MP3s were deployed from this directory.
- Narration uses the established Sarah voice (`EXAVITQu4vr4xnSDxMaL`) with ElevenLabs `eleven_multilingual_v2`. Every MP3 was independently transcribed and matched its expected text. The public text and generated audio were the only content used for generation/verification.
- QR: `assets/img/page-qr/ingles-intermediate-2-reading-unit-5-little-red-riding-hood.svg`, encoding the canonical published URL.

## Verification

- `tools/test_intermediate2_red_riding_hood.cjs`: page turns, text/phrase rendering, individual playback, speed, pause/resume/stop, image enlargement, reading dialog, text size, native fullscreen, dialogue focus/state, all eight images and all 32 in-book audio controls. Seeks near each real narration's end to test the continuous sequence and final stop; manual turning interrupts the sequence correctly.
- Chrome and WebKit checked at 320, 390, 430, 768, 1024, 1440 and 1920 pixels; WebKit also at 844 × 390. Screenshot review covered the cover, text pages, mobile reader and enlarged view. Tests use browser engines, not physical iPhone hardware.
- WebKit media checks use the deployed MP3 URLs because intercepting MP3 responses in the local browser test does not work reliably with its native media loader.
- `tools/test_intermediate2_red_riding_hood_catalog.cjs`: new card in the Reading filter/search, navigation to the book, and all three affected expression-library entries with pronunciation.
- Shared page contract passes for all 42 local Intermediate 2 pages. Expanded QR was decoded to the exact canonical URL. All 34 narration/pronunciation transcriptions matched their scripts.
- No backend or assessment access state changed. The pending Behind the Picture page was excluded from the release. Production now lists 26 activities (5 in Unit 5); the local catalog retains one additional pending activity.

## Release

Fresh production baselines were patched selectively. Each release uses SHA-256 guards, atomic file replacement and backups. Fifty-one files: 43 media/QR assets, 4 book files and 4 catalog/library/sitemap files.

Backups:

- `/var/backups/jaralingua/unit5-red-riding-hood-media-20260926T044903Z`
- `/var/backups/jaralingua/unit5-red-riding-hood-page-20260926T045251Z`
- `/var/backups/jaralingua/unit5-red-riding-hood-indexes-20260926T045252Z`

Staging/manifests: `tmp/unit5-red-riding-hood/`. Rebuild the page after changing the source configuration; rerun media preparation and generate/audit audio when story or pronunciation text changes.

## Navigation correction — 2026-09-26

Moved the single Previous/Next strip from below the audio to directly above the book. It stays visible while the normal reader scrolls, including on phones and with larger text; enlarged mode keeps it outside the scrolling story area. Updated both HTML and builder; CSS version `20260926-nav-2`.

`tools/test_intermediate2_red_riding_hood_navigation.cjs` checks that both controls remain visible and unobstructed, then clicks actual screen coordinates without browser automation scrolling to rescue offscreen buttons. Verified 320, 390, 430, 768, 844 × 390 landscape, 1440 and 1920 layouts in Chrome and WebKit. Live WebKit results: `tmp/unit5-red-riding-hood-navigation/live-webkit.log`. Existing live mobile smoke test also passed narration, pronunciation, image projection, enlarged QR and Sign in.

Two-file HTML/CSS release with SHA-256 checks and backup: `/var/backups/jaralingua/unit5-red-riding-hood-navigation-page-20260926T050052Z`. Original files/manifests: `tmp/unit5-red-riding-hood-navigation/`.
