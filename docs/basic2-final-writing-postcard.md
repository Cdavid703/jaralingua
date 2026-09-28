# Basic Course 2 Final Writing Task — group postcard

Source: user-supplied `Basic_Course_2_Final_Writing_Task.docx` (2026-09-28). Group adaptation approved by the teacher in this thread. Original task: "My last vacation", postcard to classmates, about 120 words, 50 minutes, 20% course weight, five 1–10 criteria. No mandatory idiom, phrasal verb or comparison has been added.

## Learning and participation

- Teams of 2–3 write one postcard. Everyone signs in with their Basic 2 account. The teacher assigns roster members in selection order; parts 1/2/3 go to members 1/2/3 (in pairs, member 1 writes parts 1 and 3).
- Three parts: where/when/company; activities and descriptions; funny or embarrassing anecdote and ending. Each member edits only their own parts. The combined preview adds title, greeting and signatures.
- About 120 words total. The counter counts the body, not the fixed greeting/signatures. Outside 100–150 words, submission asks for explicit confirmation; this is a warning, not a new exam requirement. The teacher decides how to assess length.
- 50-minute shared timer begins once. Closing new starts does not interrupt existing teams. Expired time never destroys writing or blocks submission; the receipt marks it late.
- A picture is chosen from three existing course visuals. There is no solved model to copy. All instructions are in English. Planning suggestions and rubric explanations live in closed disclosures.
- Every member confirms the current postcard on their own account. A text/picture change clears confirmations. One student submits after all confirm. Every team member sees the same receipt.

## Teacher controls and grades

- `Preview exam · Vista previa` is available to teachers and administrators even while the exam is closed and no teams exist. It reuses the student workspace with a synthetic three-person team, switches between each author's perspective, supports picture changes and test writing, and shows the complete postcard and word count. The timer is paused. Save/review/submit are demonstrations only: no POST requests, local draft storage, team creation, real receipt or grade changes. Returning or changing accounts discards the preview. The actual open/closed setting is preserved.

- Closed by default; only Basic 2 teacher/admin can activate, assign teams, read all teams and grade. Only unstarted teams can be removed for reassignment.
- One delivery per team, separate rubric/feedback per student. Five scores 1–10; grade = sum / 10. Evaluation `basic2FinalWritingTask20`, weight 20. Ungraded work stays pending without a numeric grade.
- Teacher can reopen an ungraded team for another 50-minute correction period. Previous delivery is retained in the audit history. Already graded teams cannot be reopened through this page.
- Shared team writing is visible to teammates. Only the student's own grade/feedback is returned to them. Roster names are teacher-only; no student emails/IDs are exposed in a public list.

## Durability and isolation

- Module: `server/basic2_final_postcard.py`; authenticated endpoints `/api/basic2/final-postcard/{state,availability,create-team,delete-team,start,draft,picture,ready,submit,grade,reopen}`.
- SQLite default `/var/lib/jaralingua/basic2-final-postcard.sqlite3`; override `JARALINGUA_BASIC2_FINAL_POSTCARD_DB`. Never replace production storage with QA data.
- Auth uses existing verified sessions; `_studentIdClaim` is discarded. Browser-supplied membership/author fields cannot bypass ownership.
- Each part has its own revision, so different authors can save independently. Stale edits from another tab require an explicit conflict choice. Server transactions serialize submit/edit races.
- Account/team-scoped emergency draft, 20-second request timeout, explicit expired-session reconnect, repeated delivery returns the same durable receipt. Storage errors do not show a false success.
- Submission commit precedes gradebook projection. Projection failure leaves the receipt valid; opening Grades reconciles. Subsequent manual grid changes survive replay of the same review.

## Page contract

`/ingles/basico-2/basic-course-2-final-writing-task.html`, linked in Evaluations. Full-width shell with comfortable padding, horizontal desktop hero, compact stacked mobile hero, in-flow header/banner, top sign-in, QR inside title block, SVG enlargement centered. No floating save/submit sidebar. Tablet/phone text inputs remain legible and use a single column. Institutional marks reuse the genuine ITM assets already installed for this course.

## QA and release

- `python -B tools/test_basic2_final_postcard.py`: disposable database; authorization, owner validation, independent saves, conflicts, all-member confirmation, duplicate/restarted receipts, pair/trio constraints, reopen, individual grading and preservation of existing grades.
- `node tools/test_basic2_final_postcard_preview.cjs`: teacher/admin preview while closed, all three authors, editable fields and word count, picture switching, simulated save/review/submit, no POST requests or local storage, student denial, logout reset and mobile/tablet/desktop widths.
- `node tools/test_basic2_final_postcard_ui.cjs`: starts and stops a temporary synthetic QA server on 8798; checks responsive layouts, collaborative writes, reconnect/offline recovery and teacher review. Never use real student accounts in QA. For manual debugging only, run `python -B tools/test_basic2_final_postcard.py --serve 8798` separately, without launching the self-contained browser suite.
- Only deploy the scoped files and the three small API hooks; the checkout contains unrelated changes. Keep the exam closed during release. Preserve all production databases and current student grades.
