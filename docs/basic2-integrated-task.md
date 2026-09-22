# Basic Course 2 — Integrated Task (20%)

## Source and scope

Source: `Integrated_Task_Basic_C2_Andrés_Vanegas_2026-1.docx`, supplied in the Basic course 2 folder.
Official page: `/ingles/basico-2/basic-course-2-integrated-task.html`, linked from the exam center.
This is separate from the Unit 5 My Holidays practice. Do not replace its audio or assessment.

- Original ten questions and option texts; option order changed to avoid an obvious answer-position pattern.
- Listening: 25 points (2.5 per question). Writing: 25 points. Final grade = points / 10, course weight 20%.
- Writing: minimum 30 words, 40 minutes, last vacation, place, activities, company, evaluation and a problem/interesting situation; simple past and basic connectors.
- Original ITM header and institutional footer extracted from the Word document, not recreated.
- User override: unlimited listening, replacing the printed three-listen rule. Speed buttons 0.75× and 1×.
- New ElevenLabs dialogue: eight numbered conversations in one MP3, 71.24 seconds at 1×. The slower speed naturally increases playback time.
- Three distinct voices, one English-US profile. Script and generation command are retained. No browser speech synthesis.

## Access, grading and delivery

- Session recovery: an HTTP 401 displays “Reconnect and keep my exam” instead of leaving students with `invalid_token`. Before reconnecting, a verified local copy preserves the text and answers; a pending delivery keeps its original submission ID. Sign in again with the same account, restore the draft and retry. Invalid/expired credentials are never accepted by the backend. Test: `node tools/test_basic2_integrated_auth_recovery.mjs` with the disposable test server.

- Closed by default. Only verified Basic 2 teacher/admin accounts may open access, preview, read the transcript/key and grade submissions.
- Students must sign in with an account linked to the Basic 2 roster. Claimed student IDs are not used to bypass account matching.
- Transcript, answer key and audio are not served as public static assets. Exam questions are returned only after a valid attempt starts; no correct-answer fields are returned to students.
- Closing access stops new attempts, but does not invalidate started attempts or prevent their submission.
- Writing timer starts explicitly, once. Work submitted after the deadline is accepted and marked for teacher review instead of being lost.
- A short/incomplete submission needs explicit confirmation; an empty writing response cannot be submitted.
- Autosave includes the complete answer group, not only the last checked radio. Students can change answers before submission. The form opts out of generic site draft management.
- Local emergency draft and revision-aware server drafts; conflicting tabs require a choice, never silently overwrite work.
- Durable SQLite receipt first; gradebook projection second. Network retries reuse a client submission ID, and duplicate delivery is idempotent.
- A failed gradebook projection does not lose the receipt; reading Grades retries synchronization. A reconciliation failure must not make the whole gradebook unavailable.
- Listening is computed on the server. Writing is reviewed by the teacher using the source's five 1–5 criteria: Content, Composing, Vocabulary, Structure and Mechanics.
- No final numeric grade is projected until writing has been reviewed. Later manual gradebook corrections are not overwritten by replaying the same review.

## Layout contract

Full-width responsive shell, horizontal hero, in-flow header/hero (never fixed or sticky), top navigation sign-in, QR inside the title block. Two question columns on desktop, one on phones. No sidebar or floating submit panel. Large submit button below the writing area, visible word count and clear receipt. Institutional paper styling adapts to a phone rather than shrinking a fixed-width document.

## Files and configuration

- Front end: `assets/{css,js}/basic2-integrated-exam.*`.
- Backend: `server/basic2_integrated_exam.py`, `server/basic2_integrated_routes.py`; small authenticated-route and gradebook-reconciliation hooks in `server/progress_api.py`.
- Source content: `server/private_assets/basic2-integrated-task/{exam.json,script.md,listening.mp3}`. This directory is gitignored so protected exam answers, transcript and audio are not published through the repository. Keep a private backup and deploy it separately.
- Production private content must be installed at `/var/lib/jaralingua/basic2-integrated-task/`, not under a publicly served assets directory.
- Database default: `/var/lib/jaralingua/basic2-integrated-task.sqlite3`.
- Overrides: `JARALINGUA_BASIC2_INTEGRATED_DB`, `JARALINGUA_BASIC2_INTEGRATED_CONTENT_DIR`.
- Preserve the existing database during deployment; never replace it with a QA fixture.
- Existing nginx restrictions must deny `/server/` and `/data/`.

## Reproduction and QA

Audio generation (reuse the existing MP3 unless regeneration is actually needed):

```text
python tools/elevenlabs_generate_listenings.py --source server/private_assets/basic2-integrated-task/script.md --out-dir server/private_assets/basic2-integrated-task --voice-cast tools/elevenlabs_voice_cast.basic-integrated.json --language-profile english-us --mode dialogue --max-dialogue-chars 4500
python tools/prepare_basic2_integrated_assets.py
```

Tests use disposable accounts, temporary SQLite and a synthetic exam; they must never write real student grades:

```text
python tools/test_basic2_integrated_exam_backend.py
python tools/test_basic2_integrated_exam_backend.py --serve 8795
python -m http.server 8025 --bind 127.0.0.1
node tools/test_basic2_integrated_exam_ui.mjs
node tools/test_basic2_integrated_exam_layout.mjs
```

Coverage: closed access, permissions, private content, more than three plays, editable mobile answers, reload, tab conflicts, offline recovery, lost submission response, duplicate retries, receipt, teacher review, gradebook weight, preservation of unrelated grades and responsive submit layout.

Before publication: copy only these scoped changes, back up production, compile backend, restart the existing API, verify health and anonymous access denial, confirm the exam remains closed, and inspect mobile/tablet/desktop. Never stage or publish unrelated work already present in the checkout.
