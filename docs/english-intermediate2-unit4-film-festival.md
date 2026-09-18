# Unit 4 Film Festival

Published activity: /ingles/intermediate-2/speaking-unit-4-film-festival.html

## Classroom workflow
- Prepare in class (25-minute guide); choose a real film the student enjoyed.
- Submit the movie title separately from one text-free main image. AI-generated or original artwork is allowed; a detailed description is required in either case.
- Present live for at least 60 seconds, with genre, setting/character/problem, two supported reasons and a recommendation. Use at least one phrasal verb and one idiom meaningfully.
- Teacher creates a named festival class and shares its eight-character code. The code identifies a festival group; it does not replace authentication or the course roster.
- Students sign in with existing authentication, join the code and upload. The account/roster supplies the name; a submitted name is never trusted.
- Teacher selects the class and clicks a student image for a viewport-sized projection with complete image, separate movie title, student name and stopwatch. Browser full-screen is optional. Escape exits; closing saves the elapsed duration for the evaluation form in that browser session.
- Evaluation has separate image and live-review marks, each averaged over criteria scored 0–5, plus duration, observed-expression checks and feedback. Saved in the festival only; no course-average or gradebook changes.
- Replacing an entry is allowed until evaluated or the class is closed. Teachers can reopen classes and revise evaluations. Refresh gallery retrieves new submissions.
- No automatic text detection: the student confirms the image is text-free and the teacher assesses it. No video recording, speech recognition or automatic oral scoring.

## Implementation and access
- Client: assets/js/english-intermediate2-film-festival.js and matching CSS.
- Backend: server/film_festival.py, authenticated routes hooked into server/progress_api.py.
- GET /api/intermediate2/film-festival/state (classId for staff, code for students)
- GET /api/intermediate2/film-festival/image?id=ENTRY_ID
- POST .../classes, .../class-status, .../submit, .../review
- Roles come from Intermediate English Course 2's existing gradebook. Teacher sees only their own classes; authorized admins see all festival classes. Students see only their own entry/feedback. Class codes alone cannot retrieve other students' images.
- Authenticated image responses are no-store; client uses temporary blob URLs, never tokens in URLs. Logout discards private UI and revokes URLs. Stale responses are ignored after account or class changes.
- SQLite stores class, entry, normalized JPEG and review. Write transactions serialize submissions, closure and review; revision checks reject stale edits. Repeated clientSubmissionId returns the previous receipt without duplicating entries.
- Images: PNG/JPEG/WebP, maximum 8 MiB, minimum 320×240, maximum 20 million pixels. Pillow decodes, applies EXIF orientation, flattens transparency, strips metadata and re-encodes JPEG bounded to 1920×1920.
- Database: JARALINGUA_FILM_FESTIVAL_DB, default /var/lib/jaralingua/film-festival.sqlite3. It must be writable by the existing www-data API service. Keep the database outside the public web root.
- Runtime dependency: Pillow (Debian package python3-pil). No new public service or separate port.
- Backup live SQLite using sqlite3's backup API rather than copying an active database. Keep backups private; images and feedback are student submissions.

## Verification
- python tools/test_intermediate2_film_festival.py: actual HTTP authentication, class ownership, image access/validation, retries, replacement, feedback, closure and concurrent submission/review. Uses temporary gradebook, secret and database.
- Start disposable browser fixture with python tools/test_intermediate2_film_festival.py --serve 8025 and a static server on 8024. Run node tools/test_intermediate2_film_festival.mjs. Browser fixture tokens are only in ignored tmp/film-festival-qa; they are never production credentials.
- Browser coverage: teacher class creation, two student uploads, named gallery, whole-viewport image, 65-second timer, evaluation, student feedback, disabled graded entry, logout cleanup, mobile width and Practice Lab navigation.
- Shared checks: test_intermediate2_page_contract.mjs and test_intermediate2_no_provider_branding.mjs.

## Release
Deploy only the festival module, API route changes, page/assets, QR, catalog, Practice Lab and sitemap. Compare existing remote file hashes before replacing files and create a dated backup. Compile Python, restart only jaralingua-progress-api.service, verify health and anonymous 401 responses. On failed restart/health checks restore the backed-up code and restart. Never reset the remote checkout or alter other-course work. Production verification creates no fictitious student submissions.

## Activity artwork and sign-in overlay
- Dedicated generated hero/card: assets/img/english-intermediate-2/unit-4/film-festival/film-festival-hero-v1.png (built-in image_gen, 2026-09-18).
- Final prompt: cinematic editorial photograph of an adult student presenting at a university film festival, classmates seated in the foreground, projector beam, and a wordless mountain-traveler scene under a golden moon on a large screen. Presenter/screen on the right; dark uncluttered left third for HTML title. Realistic natural faces; navy/teal with warm gold light. Landscape 1536x1024; no text, logos, watermarks or UI.
- The festival has a scoped body class. Its navigation allows the auth panel to overflow; the header backdrop filter is removed so fixed panel positioning uses the viewport. Both navbar and activity sign-in controls use the existing auth panel, above the hero.
- Regression: node tools/test_intermediate2_film_festival_layers.mjs; set FESTIVAL_ORIGIN for public checks. Tests actual elementFromPoint hit targets at multiple positions, viewport bounds and both sign-in triggers at 320/390/768/1440 px.
