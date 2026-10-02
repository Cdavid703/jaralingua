# Unit 5 — Our Picture Stories

Published: https://www.jaralingua.com/ingles/intermediate-2/speaking-unit-5-our-picture-stories.html

## Confirmed classroom workflow

- Ten new images, with no supplied story, scene title or explanatory caption for the student.
- The teacher selects team members with checkboxes from the course's registered student list. This supersedes the earlier manual-name choice. One team per image; images may remain unassigned.
- The teacher explicitly finishes assignments before students begin preparing their submission.
- Authenticated members work on one shared text. Any member can edit and submit; the text identifies who says each part.
- Describe the picture and invent a short story about what happened. Every member speaks. Team presentation duration: two minutes. Include looks/seems/looks like, a feeling and its cause (-ed/-ing), I think/I guess/perhaps, and at least one phrasal verb; no grade or gradebook projection.
- A team may correct its submitted text until the teacher starts presentations. That teacher action locks editing.
- The teacher opens an assigned image with the team's submitted story for the live presentation.
- Reuse the course design, shared authentication (including local accounts), QR and responsive/full-viewport projection patterns.

## Final clarifications

- Confirmed: use course roster IDs and existing verified account links; no private team codes or manually typed names.
- Confirmed: varied situations and emotions, including surprises, celebrations, problems and encounters.
- Confirmed: all assigned teams must have a submitted current version before presentations can start.

## Implementation requirements independent of those decisions

- Separate activity sessions per class/run, owned by the creating teacher; authorized Intermediate 2 administrators may access all sessions.
- Store assignments and text in a private SQLite database outside the public web root. Student account identity and teacher role come from the existing authenticated API, never from request-provided names or roles.
- Check team membership server-side for reads and writes. Public images do not grant access to another team's names or text.
- Use transactions and revision checks to prevent simultaneous edits from silently replacing a teammate's work. Keep local unsaved text visible on a conflict and offer recovery before loading the saved version.
- Idempotent saves/submissions return a durable receipt after retries. A teacher starting presentations and a student submitting simultaneously must serialize safely.
- Sign-out/account/class changes clear private content and invalidate stale responses. Do not place authentication or team invitation secrets in URLs or QR codes.
- Large, visible Submit to teacher button; precise saved/submitted/error status; no claim of success before the server acknowledges the write.
- A scene's accessible image description must not reveal a pre-written plot. The gallery uses image numbers, not interpretive titles.
- No scoring, recording or automatic assessment of a student's emotional interpretation.

## Teacher flow

1. Sign in with an Intermediate 2 teacher/admin account and create a named class activity.
2. Use **Assign students** on a picture. Check course roster names and save the team. A student already selected for another picture is disabled in that session. Leave any unused images unassigned.
3. Select **Finish assignments**. Students sign in, select that class activity and open their assigned image to write their shared story. Every member can save drafts and submit the current version.
4. The submission counter refreshes while the workspace is visible. **Start presentations** remains unavailable until all assigned teams have submitted. A new draft after a submission requires another submission.
5. Start presentations to lock editing, then open a submitted image. The entire image is contained in the viewport, with the group's text and names beside it. Hide/show the story and use the optional two-minute timer.

Assignments can be reopened only before any team saves work, so changing teams cannot discard an existing story. A new classroom run uses a new named activity. Teachers see sessions they own; course administrators can manage all sessions. Students see only sessions and teams assigned to their registered account.

## Implementation

- Page: `ingles/intermediate-2/speaking-unit-5-our-picture-stories.html`.
- Frontend: `assets/css/english-intermediate2-group-stories.css`, `assets/js/english-intermediate2-group-stories.js`.
- Builder: `tools/build_intermediate2_group_stories.py`; configuration: `assets/data/english-intermediate2-group-stories.json`.
- Backend: `server/intermediate2_group_stories.py`, called by six added routing lines in the production `server/progress_api.py`.
- API prefix: `/api/intermediate2/group-stories/`; GET `state`; POST `create`, `assign`, `finalize`, `return-to-assignments`, `save`, `submit`, `start`.
- Database: `/var/lib/jaralingua/intermediate2-group-stories.sqlite3`, owned by `www-data`, mode `0640`, outside the public web root. The database path can be configured with `JARALINGUA_INTERMEDIATE2_GROUP_STORIES_DB`.
- Stable roster IDs come from the existing course identity mapping. No typed student name or client-supplied role is accepted as authorization.
- Server transactions enforce team membership, revision checks, the all-teams-submitted gate and the presentation lock. Repeated requests retain their request ID and return the previous receipt without creating duplicate submissions.
- The editor shows conflicts without erasing local text, then lets students compare and choose the saved or edited version. An edit made during an in-flight save remains marked unsaved.
- Language completion is a student confirmation and teacher review; the activity does not automatically assess English quality, speaking time or whether everyone actually speaks.
- The submission footer follows the visual viewport so it remains available above an on-screen keyboard. Dialog content scrolls independently. Images reflow into 1, 2, 3 or 5 columns.

## Assets

- All ten new illustrations were generated with the built-in `image_gen` tool and visually inspected. Original prompts, original image paths and delivered WebP paths are recorded in [image provenance](english-intermediate2-group-stories-image-provenance.json).
- Delivered images: `assets/img/english-intermediate-2/unit-5/group-stories/01-station.webp` through `10-dinner.webp` (1536 × 1024). Numbers alone identify the scenes to students.
- Eighteen previously published pronunciation recordings from Unit 5 are reused, with inline speaker marks and 0.75×/1× controls.
- Canonical QR: `assets/img/page-qr/ingles-intermediate-2-speaking-unit-5-our-picture-stories.svg`.

## Verification and release

- `tools/test_intermediate2_group_stories.py`: isolated HTTP tests with real shared local authentication and disposable student/grade files. Covers authorization, roster assignments, team privacy, shared text, optimistic concurrency, retries, submit/draft transitions, racing saves/start, presentation lock and unchanged grade data.
- `tools/test_intermediate2_group_stories_browser.cjs`: complete teacher/student workflow in Chrome and WebKit against that isolated backend. Includes a deliberately dropped save response and successful idempotent retry, conflict recovery, sign-out clearing, visible mobile submit control and a simulated smaller visual viewport for the keyboard.
- Layouts checked at 320, 390, 430, 768, 1024, 1440 and 1920 pixels; WebKit also checked at 844 × 390. All ten images, 18 audio controls, QR enlargement, local login panel and projector verified. This is browser-engine verification, not a physical iPhone test.
- `tools/test_intermediate2_page_contract.mjs`: passed for 41 local pages. The expanded QR screenshot was independently decoded to the exact canonical URL.
- `tools/test_intermediate2_group_stories_catalog.cjs`: verified the published Practice Lab card, search and speaking filter, navigation and protected backend. Anonymous API requests return 401 and direct module access is blocked.
- Public-page checks repeated after deployment in Chrome at 390 px and WebKit at 1440 px, including all 18 MP3s. Real classroom data was not created for testing.
- Selective release used fresh production baselines, guarded SHA-256 hashes, atomic file replacement, backups and API health checks with rollback support. Only the new route was added to the production API; unrelated local changes were excluded. The prior unpublished Behind the Picture activity remains unpublished.
- Production catalog: 25 activities, including 4 for Unit 5. Local catalog also retains the separate unpublished pending activity.
- Backups: `/var/backups/jaralingua/unit5-group-stories-server-20260926T042141Z`, `unit5-group-stories-page-20260926T042142Z`, and `unit5-group-stories-indexes-20260926T042143Z`.
- Deployment staging and manifests: `tmp/unit5-group-stories/`. No student answers or credentials are included in public static files.

## Session-recovery correction · 26 September 2026

Production logs showed three `assign` requests rejected with HTTP 401 before the team-storage handler. The general page autosave was also rejected at the same time. The database passed a read-only integrity check. The exact token rejection reason was not recorded in those access logs; the browser previously exposed raw provider messages such as `Could not validate Google token.` without a recovery action.

- All group-story requests now handle HTTP 401 uniformly. Locally known token expiry is checked before sending a request. Authentication checks on the server remain unchanged; there is no bypass or silent token extension.
- A visible **Sign in again · keep my work** button appears in the assignment dialog and story editor. The workspace also offers Sign in again. The message avoids incorrectly claiming that a write succeeded or that a preceding write definitely did not reach the server.
- Choosing recovery uses the existing shared sign-out/sign-in controls. The activity keeps the class, selected students, current text, phrasal verb, confirmation, revision and retry IDs in this tab's memory only. It clears visible private content while signed out and restores it only after the same provider/account signs in and the server authorizes that class/team. A different account discards the previous recovery state. Reloading/closing the tab does not preserve it; a leave warning protects a pending recovery.
- Reauthentication never automatically saves or submits. Teachers review their recovered team; students explicitly save or submit. Original revision checks remain in place, so a teammate's intervening edit produces the normal comparison/conflict workflow. Retry IDs remain stable to avoid duplicate operations.
- Current roster membership and assignments are checked again before restoring a selection. A changed activity phase or lost team access does not grant permission to write. A student can copy recovered local text if presentations have locked editing.
- The class workspace, assignment dialog and story editor now use `data-jaralingua-managed-draft`. This prevents the general individual-page autosave from restoring stale checkbox/text values over the activity's own shared state. No existing saved data was deleted.
- The builder carries the managed-draft markers and `20260926-session-recovery` CSS/JS versions so regenerating the page does not remove the correction.

Verification: `tools/test_intermediate2_group_stories_auth.cjs` uses actual shared local sign-in with disposable accounts and an isolated backend. It injects the production-shaped 401 response, then tests team recovery, draft recovery, submission recovery, concurrent teammate edits, stable retry IDs, absence of automatic writes, different-account privacy, memory-only recovery, expiry detection and visible mobile buttons. Chrome at 390 px and WebKit at 390/768 px passed locally. The published static files passed the same isolated-account workflow in Chrome at 390 px and WebKit at 320 px. These tests never create classroom teams or student work in production.

The existing authenticated backend regression and complete Chrome teacher/student browser workflow also passed. The 43-page QR/auth/responsive contract passed. No backend, shared authentication engine, gradebook, exam state or student database was changed.

Selective production release: HTML, scoped JS/CSS and unchanged canonical QR, with fresh baseline hashes, atomic replacement and rollback support. Backup: `/var/backups/jaralingua/unit5-stories-auth-release-20260926T153417Z`. Staging/manifests: `tmp/unit5-stories-auth-fix/`. No service restart was required. Existing open tabs need one reload to obtain the versioned fix; copy any unsaved text before that initial reload.

## Student workspace discovery · 26 September 2026

Read-only production diagnosis confirmed six saved teams, 16 assigned students and a class in the writing phase. Student requests returned HTTP 200, but the initial state lists class activities without selecting one. The previous UI required the student to use the class selector before any team controls appeared. Its polling also required an already-selected writing session, so a student waiting before the teacher finalized assignments never discovered the new activity automatically.

- On student sign-in or initial discovery, automatically open the newest assigned class in the writing phase (otherwise the newest accessible class). The class selector remains available for other sessions. Each selected class is still authorized by the existing server membership check.
- Display a prominent **Your team · Picture N** panel with the team names and **Write and submit our story** directly above the gallery. Clearly state that any assigned member can write, save or submit the same shared text. The image card also uses the clearer action label.
- Refresh the waiting student's workspace every ten seconds and when returning to the page. Suppress background refresh while an assignment dialog, editor or projector is open, a request is in progress, or authentication recovery is pending. Do not discard unsaved work or change a manually selected class.
- Preserve the teacher's Finish assignments step and the presentation lock. No server permissions, teams, memberships, grades or submissions were changed by deployment.
- `tools/test_intermediate2_group_stories_student_access.cjs` tests a student already signed in before finalization, automatic discovery without using the selector, the correct picture for each team, one member saving a draft and another editing/submitting it, the shared receipt, other-team privacy and mobile button layout. Chrome passed against local static files. The existing session-recovery test and authenticated backend regression also passed.
- Builder and page carry cache version `20260926-student-workspace`. Selective static release: page, scoped JS/CSS and unchanged QR. Backup: `/var/backups/jaralingua/unit5-stories-access-release-20260926T155721Z`; staging/manifests: `tmp/unit5-stories-student-access/`. No API restart or classroom-data write was needed.
- Post-deployment: WebKit passed the entire automatic-discovery and any-member submission workflow using the published static files with disposable accounts against the isolated backend. Chrome passed the public mobile image/audio/QR/login checks. All four released public files returned HTTP 200 and matched their exact hashes; the 43-page contract passed. No production student account was impersonated or used for test submissions.
