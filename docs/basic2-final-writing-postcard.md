# Basic Course 2 Final Writing Task — individual postcard

Teacher-authorized update, 6 October 2026: each new submission belongs to exactly one student. This replaces the former two/three-person adaptation. Topic: “My last vacation”, postcard to classmates, about 120 words, 20% course weight. The existing 48-hour duration and five 1–10 rubric criteria remain.

## Student workflow

Sign in with the linked Basic 2 account, start the individual exam, write all three sections (where/when/company, activities/descriptions, memorable anecdote/ending), review and submit. No team or teacher assignment is required. A single owner edits all sections, chooses a picture and receives one durable receipt. New multi-person assignments are rejected by the backend; client-supplied IDs cannot select another student. Students with a recorded final-writing grade and no attempt cannot start a replacement attempt, including manual zero grades.

The 48-hour timer begins once, continues while the page is closed, and never destroys work. Closing new starts allows existing writing to finish. Outside 100–150 words, an explicit warning allows submission for teacher assessment. Changes clear review confirmation. There is no solved model to copy.

## Historical records and grades

Existing group records, memberships, writing, receipts and individual reviews remain intact and readable. The old schema and endpoint names are retained for compatibility. Historical members retain their original access; new records have `mode: individual` and one member. No bulk migration or recalculation is performed. Gradebook projection and manual-override preservation are unchanged.

Teacher/admin can open/close access, optionally assign one student, review deliveries and grade each author. Graded deliveries cannot be reopened. Preview uses one synthetic student with all three editable sections, a paused timer and no POST, storage, receipt or grade changes.

## Durability and release

Module: `server/basic2_final_postcard.py`; authenticated `/api/basic2/final-postcard/` routes. SQLite remains private under `/var/lib/jaralingua`; never deploy QA storage. GET state does not create attempts. Transactional start is idempotent, including a lost response. Per-section revision checks, account-scoped emergency drafts, reconnect handling and durable duplicate-submit receipts remain.

Tests: `tools/test_basic2_final_postcard.py`, `tools/test_basic2_postcard_duration.py`, `tools/test_basic2_final_postcard_preview.cjs`, `tools/test_basic2_final_postcard_ui.cjs`. Browser tests use Playwright and `POSTCARD_QA_PYTHON` when needed. All fixtures/accounts are synthetic. Check individual starts, ownership, historical receipts/reviews, manual grades, conflicts, offline/reconnect recovery, duplicate delivery, teacher preview, responsive layout and QR/sign-in.

Publish only the changed HTML/JavaScript and the tested backend module after backup. Preserve the current availability setting and academic storage. The prior initial-release helper is historical and must not be used to republish API hooks or old group instructions.
