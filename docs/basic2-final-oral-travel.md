# Basic 2 final oral exam — Travel and Tourism

## Confirmed teacher decisions — 6 October 2026

- Official final oral task: 20% of the course grade, with an individual grade for each student.
- Minimum two minutes for the whole pair; no maximum or random role assignment. Partners may prepare one role each: travel assistant and tourist. Memorization is permitted but is not prescribed to students.
- Registration opens immediately by explicit teacher instruction, overriding the usual closed-by-default course standard for this exam. Choosing a classmate registers both students immediately, without a second confirmation. Only one active pair per student.
- Exclude César, Santiago and Gabriela from this exam only. Do not change their enrollment or exclusions in other activities.
- Ten suggested images; multiple pairs may select the same destination. The conversation may discuss any destination. Partners save their support image or upload their own visuals, role assignment and the tourist’s final choice. The final choice may be a destination, place or activity.
- Rubric, criterion scores and teacher drafts are private to staff. Students can receive their own published grade and feedback through Grades. The projector never receives rubric or review data.
- The teacher explicitly authorized LibreOffice Impress, Poppler, Bubblewrap and fonts on the production server for PDF/PowerPoint projection.

## Student and teacher flow

Page: `ingles/basico-2/basic-course-2-final-oral-task.html`, linked from Evaluations and Exam Practice. Uses the existing Basic 2 navy/red/white design, professional unique hero, compact shared sign-in navigation and QR.

Students sign in with their registered Basic 2 account, select an available classmate and immediately receive a persistent pair receipt. Both accounts see the shared plan and materials. Changes autosave with a local draft; concurrent edits require an explicit choice before replacing a newer plan. A pair can be cancelled before assessment starts. Published assessment locks the plan and materials, while projection remains available.

Teachers select a pair, open its projector in a separate window, run the optional two-minute reference timer and score each student independently. Five criteria, 1–10 each, total /50 converted to /5. Saving a rubric draft does not publish a grade. The separate publish action syncs the individual result to `basic2FinalOralTask20`. Reconciliation retries interrupted gradebook synchronization without overwriting later manual grade changes for the same published version. Teachers can save and publish a revised assessment. Safe student preview uses only an invented pair and makes no mutation requests.

The projector is `basic-course-2-final-oral-projector.html?pair=<opaque ID>`. Both partners and the teacher can show the catalog image or the uploaded slides. It uses the viewer’s own sign-in; no credentials appear in the URL. Signing out clears private material from the view.

## Materials and isolation

JPG, PNG, WebP, PDF and PowerPoint `.pptx`: 15 MB per file, 30 pages/slides, six files and 40 MB of original files per pair. Presentations render as static JPEG pages, so animations and embedded media are not played. Linked PowerPoint content and embedded objects/macros require an exported PDF. Images are decoded, oriented and flattened onto white; uploaded HTML/SVG and mismatched file types are rejected.

Linux conversion runs in a Bubblewrap namespace with no network, bounded CPU, memory, file size and runtime, at most two concurrent conversions, and only the required read-only runtime/font/LibreOffice paths. Original uploads and rendered pages remain in a private SQLite database; authenticated endpoints check pair ownership on every image. Neither uploads nor the database are written under the web root. The HTTP proxy allows 130 seconds specifically for this upload route; other routes retain their existing settings.

Default private database: `/var/lib/jaralingua/basic2-final-oral.sqlite3`, overridable by `JARALINGUA_BASIC2_ORAL_DB`. Server modules: `basic2_oral_exam.py`, `basic2_oral_media.py`. Three scoped hooks integrate with the existing API and gradebook; preserve production-only API differences. JSON mutations use stable `requestId` values and content fingerprints; retries are idempotent. File retry IDs survive reloads. The roster exposes names, opaque participant tokens and availability, not classmates’ account emails or grades. Identity comes from the existing verified auth profile and course account matching, never a submitted name or student-ID claim.

## Teaching and professional audio

Instructions explain both roles, a four-stage conversation and pronunciation practice. The model has 22 turns and approximately 422 words; the recording lasts 144.98 seconds at normal speed. The page offers 1× and 0.75× playback, ten destination-name recordings and eight useful pronunciation phrases.

Production follows `docs/elevenlabs-audio-production-guidelines.md` and the established `tools/elevenlabs_generate_listenings.py`. Model source: `docs/audio/basic2-final-oral-travel-model.md`. Existing Basic 2 Sean/Matilda voice cast gives the two roles distinct professional US voices. The generator receives speaker labels as metadata only. The task wrapper validates that the canonical transcript matches the page, runs a dry run before generation and updates the public `audio/final-oral-travel/scripts.json` manifest.

Expanded-model ElevenLabs ASR detected two speakers and matched all 22 turns, including the negative can’t, request for repetition, food question, rainy-day alternative and final decision. No speaker labels were spoken. Actual playback and duration were verified in Chrome. No student recordings were used in audio QA.

## Validation and release

- `tools/test_basic2_oral_exam.py`: synthetic accounts, all three exclusions, persistence, immediate pairing, unique membership under concurrency, stale-plan and stale-rubric rejection, file ownership, real image conversion, idempotent retries, private rubric, individual grades, manual-grade preservation and rejection of spoofed account claims.
- `tools/test_basic2_oral_exam_ui.cjs`: two student accounts plus teacher; registration, shared plan, recovered local drafts after network failure, explicit partner-edit conflict resolution, successful-upload response loss and duplicate-free retry, private grading, separate projector, logout cleanup, preview without writes and six viewport sizes.
- `tools/test_basic2_final_oral_teaching.cjs`: ten destination cards, 22-turn model, real pronunciation playback, speed, model duration, shared auth navigation, QR, image projection and six viewport sizes.
- `tools/test_basic2_oral_media.py`: actual Linux worker as www-data, synthetic PNG, two-page PDF and two-slide PPTX; invalid formats and external relationships rejected. Required Debian LibreOffice configuration is mounted read-only within the namespace.

Use `tools/release_basic2_oral_exam.py --commit FULL_SHA` to preview a scoped backend release, then `--apply`. It merges the exact authenticated hooks into the current production API, backs up the three Python files and Nginx configuration, checks compilation and HTTP health, tests Nginx and rolls back on failure. Static publication uses the existing publisher and explicit asset paths; the hub link is published after the new page and API are ready. Do not submit, grade or modify real students during QA.

## Hero provenance

Generated with the built-in image tool. Final prompt:

> Use case: photorealistic-natural. Asset type: unique wide hero photograph for Basic English 2 final oral exam, Travel and Tourism. Two adult English students standing together in a bright modern classroom, naturally performing a travel assistant and tourist conversation. One holds a small blank note card, the other gestures toward a projected large travel photograph of Cartagena Colombia's colorful historic streets and coastline. A teacher at the side listens with a clipboard. Warm natural daylight, realistic faces and hands, professional educational editorial photography. Navy blue and subtle red accents suited to a navy/red/white course website. Wide horizontal composition, no readable text, no logos, no watermarks. Neither student reading a full written script.

Original generated file retained at `/Users/davidaramillo/.codex/generated_images/01a10d80-4e76-77c0-9f8d-0a98878de474/exec-a4552f0c-4c94-43a7-bf92-8ad2b8243cec.png`. Optimized workspace WebP has been visually inspected in the page.

## Production verification — 6 October 2026, Bogotá

Released code commit `b0dd600de5df5faa6f3622a647a31fcf9e8beb7e` is on GitHub main. The scoped backend release retained existing production API differences; backup: `/var/backups/jaralingua/basic2-oral-20261007T031917Z`. Static publisher backup: `/var/backups/jaralingua/vps-publish/20261007T031932Z-q3oy5p3w`.

All 31 published static files matched the reviewed SHA-256 values over HTTPS. Production browser checks passed actual audio playback, model duration (144.98 s), ten cards, QR, shared sign-in navigation, image projection and six screen sizes. All ten underlying images returned 200. API health returned `ok`; unauthenticated state, presentation, file and pair mutation requests returned 401. The new private database is mode 0600, registration is open, and policy matches immediate pairing, individual grades, 20% and exam-only exclusions. Synthetic tests covered uploads, retries, concurrency and grading; no real student pair, submission or grade was created for QA.

## Image projection correction — 8 October 2026

Production CSP permits same-origin and data images, but blocks blob image URLs. The uploaded-material projector previously created blob URLs, so the browser rejected slides even after successful upload. It now reads the authenticated JPEG into a data URL, checks for stale account/slide requests before displaying it, and clears the image on logout. No server permissions or student data change. The browser regression test now applies the production image CSP and checks an uploaded image actually decodes and appears. All ten catalog images were separately verified to decode in production.
