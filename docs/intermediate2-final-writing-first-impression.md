# Intermediate Course 2 — Final Writing Task (20%)

Implemented 2026-09-29 from the teacher-supplied `Intermediate_Course_2_Final_Writing_Task.docx`.

## Content and institutional identity

- Exact title: **INTERMEDIATE COURSE 2 – FINAL WRITING TASK (20%)**; topic **“First Impression”**.
- Preserve the complete prompt, task type (informal e-mail), audience, purpose and all seven instructions, including approximately **200 words** and **50 minutes**. No added model answer or extra language requirements.
- Preserve attribution: Created by Juan Marulanda, November 2025.
- ITM header and footer are extracted original image2.jpg/image3.jpg from the DOCX, not recreated logos. Assets: `assets/img/english-intermediate-2/institutional/final-writing-first-impression/`.
- The original five-criterion reference rubric and rating bands remain available only in the authenticated teacher monitor. Scoring follows the previously approved course policy: evaluate English, no deductions for punctuation or task coverage; mention relevant issues constructively in feedback, without explaining those exclusions to students.
- DOCX text and embedded assets were inspected. The bundled DOCX renderer could not render the source because its LibreOffice executable was unavailable. The actual HTML was browser-tested instead; this is not a claim of pixel-identical Word pagination.

## Page contract

Page: `/ingles/intermediate-2/intermediate-course-2-final-writing-task.html`, linked in Evaluations as **Writing · 20%**, title and one-sentence description. The institutional paper and shared authentication use the first official written midterm as the reference. Shared styles remain unchanged; fixes are scoped in `english-intermediate2-final-writing.css`.

Use `/assets/js/page-qr-access.js` and the corresponding SVG at `/assets/img/page-qr/ingles-intermediate-2-intermediate-course-2-final-writing-task.svg`. The QR encodes the exact canonical production URL, appears in the hero and enlarges on click. Course contract now covers **44 pages**.

Teacher view: activate/close, preview without saving, roster monitoring, individual reopening, receipt/body review, five scores from 1–10, comments, publishing `/50` as a `/5` grade. `[[error]]` highlights yellow; `{{correction}}` underlines the correction.

Student view: verified course account → availability → integrity check → server-timed attempt → From/To/Subject/body → Send to Teacher → durable receipt, then teacher feedback once published. Server autosave plus account-scoped local emergency copy. Retry uses an idempotency key; reloading resumes the same attempt. Closing the global start window does not strand an existing attempt. Teacher preview never saves or submits.

The prompt/instructions are returned on an authorized start/resume, not embedded in public HTML. The original teacher rubric is returned only by the staff-only submissions endpoint. No student may access another student's submission or publish grades.

## Gradebook and storage

- Use the existing reserved evaluation **`intermediate2FinalWritingTask20`**, weight **20**. Do not add a sixth 20% column or touch midterm grades. The production gradebook already contains five assessments totalling 100%.
- `/api/intermediate2/final-writing/`: GET state/submissions; POST start/submit; PUT state/draft/submissions/grade/student-action.
- Private stores `/var/lib/jaralingua/intermediate2-final-writing.json` and `intermediate2-final-writing-submissions.json`. Environment overrides `JARALINGUA_INTERMEDIATE2_FINAL_WRITING_DATA` and `JARALINGUA_INTERMEDIATE2_FINAL_WRITING_SUBMISSIONS_DATA`.
- Attempt/receipt prefix `I2FW-`; local keys `ie2_final_writing_official_*`. Never reuse midterm IDs or stores.
- Default state is **closed**. Publishing or linking is not authorization to activate the exam. No real test submissions, attempts or grades are created during deployment.

## Verification and deployment

- `python tools/test_intermediate2_final_writing_backend.py`: closed state, permissions, identity separation, autosave/recovery, submission retries, grading, weight and midterm preservation using temporary data only.
- `node tools/test_intermediate2_final_writing_ui.cjs`: Chrome 375/768/1024/1440 px, student and teacher preview, no horizontal overflow, image loading, QR dialog, autosave and receipt; WebKit mobile QR. API responses are fixtures; this does not impersonate real users.
- `node tools/test_intermediate2_page_contract.mjs`: 44 pages, Sign in, QR and responsive rules.
- Run the existing midterm backend/static checks as regressions.
- Selective VPS deployment uses fresh production snapshots, a SHA-256 guarded manifest, atomic per-file replacement and a private backup. Deploy only the final's new files, Evaluations, sitemap and narrowly patched `server/progress_api.py`; do not upload the unrelated dirty local API wholesale. Restart `jaralingua-progress-api.service`, verify health and anonymous API rejection, and verify the final remains closed. Never write the live roster merely to test this assessment.

### Deployment record — 2026-09-29 (Bogotá)

Published nine explicitly listed files. Backup: `/var/backups/jaralingua/ie2-final-writing-20260930T040724Z` (UTC). API health passed after restart; the final was verified closed, with 200 words and the existing 20% evaluation ID. Public-browser checks at 375/768/1440 px confirmed the Evaluations card, Sign in, original logos, unloaded private prompt, working enlarged QR and no horizontal overflow. Anonymous state/submissions calls return 401; the server source is not publicly accessible. No live exam attempts, grades or activation settings were changed. Exact comparison against the DOCX passed for the title, full prompt, seven instructions and attribution.
