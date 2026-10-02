# Intermediate 2 integrated exam · 2026-1

Source: Integrated_Task_Intermediate_C2_Andrés_Vanegas_2026-1.docx in the Intermediate course 2 teaching folder. The student page preserves the first three pages' ten questions and community-newsletter writing task; later rubric content is teacher-only. Institutional artwork is extracted from the original document.

## Teaching and grading
- Original connected conversation: six American English voices, 11 turns, 78.48 seconds (approximately 1:45 at 0.75×). Generated with ElevenLabs after explicit authorization. A second authorization covered MP3 transcription verification; all ten required details passed.
- Listening: ten questions × 2.5 points = 25; three listens, with teacher-controlled additional listens.
- Writing: minimum 130 words, 40 minutes from Start writing. Community problem, people affected, opinion, two solutions, preferred solution with reasons/examples, opinion expressions and paragraphs.
- Five writing criteria scored 1–5 (25 points). Final grade = (listening + writing) / 10. The existing intermediate2IntegratedTask20 column carries 20%; no additional weight is introduced.
- The original question about Maddie's morning remains, integrated into the journey-to-work example.
- Students receive no rubric, answer key or transcript. Teacher preview provides the complete exam and protected audio, a dedicated Transcript button, and an active submission button in teacher preview that explains the student action without creating a teacher delivery. Playback speed buttons offer 0.75× and 1×. A top shortcut leads directly to the large submission button.

## Access and delivery
Closed initially. Course 2 teachers/admins open it explicitly. Closing prevents new attempts; students already working may finish. Verified account-to-roster links identify students; payload identifiers cannot impersonate another learner.

SQLite stores attempts, listen grants, drafts and receipts transactionally. Draft revisions detect conflicting tabs. Per-account/per-attempt device drafts recover connection failures. A stable submission ID makes retries idempotent, including a lost response after delivery. Late writing is flagged rather than discarded.

Gradebook projection follows durable delivery. Pending writing review does not generate a numeric zero. GET Grades retries projection after transient failure. Each receipt/review revision is projected once so later manual grid corrections survive.

Three listens are a normal UI allowance, not DRM: the authenticated browser receives playable audio bytes. Refresh can resume an interrupted granted play. The teacher can grant an extra listen.

## Private content and deployment
Canonical material is ignored under data/private/intermediate2-integrated-task/: exam.json, script.md, voices.json, listening.mp3, audio-audit.json. Never commit these or publish them under the web root.

- Backend module: server/intermediate2_integrated_exam.py; routes /api/intermediate2/integrated-task/.
- JARALINGUA_INTERMEDIATE2_INTEGRATED_CONTENT_DIR defaults to /var/lib/jaralingua/intermediate2-integrated-task.
- JARALINGUA_INTERMEDIATE2_INTEGRATED_DB defaults to /var/lib/jaralingua/intermediate2-integrated-task.sqlite3.
- Private content owned by www-data; directory 0750 / files 0640. Back up the bundle and SQLite database.
- Compare live hashes to the baseline, back up replacements, atomically deploy only exam files, restart API and verify health. Keep availability closed.
- Preserve existing gradebook entries. Its integrated-task column already has the same ID and 20% weight.

## Verification
- python tools/test_intermediate2_integrated_exam_backend.py: isolated synthetic users/content, access, ownership, timer, listens, conflicts, concurrent/idempotent delivery, teacher grading, preservation of existing grades and projection failure recovery.
- python tools/test_intermediate2_integrated_exam_backend.py --serve 8026, then node tools/test_intermediate2_integrated_exam_ui.mjs, with a static server on 8024: full delivery/review, reload, offline recovery, conflicts, lost-response retry and responsive submit button.
- node tools/test_intermediate2_integrated_exam_layers.mjs: actual shared Sign in panel, both entry points, viewport and occlusion checks at 320/390/768/1440px. INTEGRATED_EXAM_ORIGIN optionally selects the deployed site.
- node tools/test_intermediate2_page_contract.mjs: 34 pages with shared authentication and responsive rules.
- Existing midterm writing backend and Course 2 grade-access regression tests.

No fake users or test submissions are created in production.
