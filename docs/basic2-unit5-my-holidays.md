# My Holidays — Unit 5 listening exam practice

## 2026-09-17 answer-change regression

Confirmed with a signed-in mock account: selecting A, then C, then B restored C after 120 ms. The shared autosave stored only the newly checked radio, leaving previous options true in the draft. DOM changes (including the answered counter) triggered draft restoration, which rechecked the last old true value in DOM order. Fixed `saveActivityField` to snapshot all radio options in the same name/form group, including unchecked siblings. Other field types are unchanged. The page bumps the auth-script version to invalidate cached code. Regression tests use mock authentication and intercept every API request (no student data), click/tap each option in all ten questions, wait for delayed restores, and verify changes before and after checking answers.

Approved placement: Practice Lab Unit 5 Activity 09, with links from Evaluations and Listening Library. Explicit user-approved exception to the default exam-practice placement rule; one canonical page, no duplicate activity.

Purpose: prepare for BASIC COURSE 2 INTEGRATED TASK (20%), My holidays. Original dialogue practises destination, companions, accommodation, weather, activities, relatives, problems, responses, reasons and overall feelings. It does not reproduce the exam's eight conversations or supply its answer key. No submission or gradebook mutation.

One ElevenLabs dialogue file, two distinct US voices; script in `docs/basic2-unit5-holidays-listening-script.md`, casting in `tools/elevenlabs_voice_cast.basic-unit4-listening.json`. Speaker names are metadata, not spoken. Phrasal verbs: hung out, went back. Idiom: called it a night. Past be and past actions integrated in context.

Ten four-option questions with distinct plausible alternatives and explanatory feedback. Key B D A C B A D C A B (A3 B3 C2 D2). Missing answers receive a prompt, no automatic option selection. Changing an answer clears stale feedback. Unlimited retries. One player, 0.75x and 1x speeds, network-error retry.

Transcript is server-only, endpoint `/api/basic2/unit5-my-holidays/transcript`. Authenticated role must be `teacher` or `admin` in Basic 2. Students receive 403; anonymous users rejected by common authentication. Browser starts hidden, fetches with no-store and authentication, handles auth changes and focus, clears text on logout, and ignores stale requests. Toggle opens/closes transcript inline. Never deploy production-script Markdown to the public root.

Full-width layout with horizontal desktop hero, normal scrolling header/hero, two question columns on larger screens, one on phones. Compact one-sentence cards. New professional hero created with built-in image generation: two adult Colombian classmates discussing a holiday in a campus courtyard cafe, a small seaside photograph on the table, natural daylight, horizontal editorial photography, no text or logos. Asset `assets/img/english-basic-2/unit-5-my-holidays-hero.png`. QR expands centered from inside hero copy.

QA: validate all answers against canonical script; test mobile, tablet, desktop, player speed, reset/scoring, auth visibility and logout; server route role tests, source/script equality, real MP3 duration. Keep unrelated working-tree changes out of commit and deployment.

Verified 2026-09-15: MP3 duration 92.29 seconds (1:32); generated in one dialogue request with 22 turns and two voices. Offline server-role tests pass for teacher/admin/global admin and reject student/unknown roles. Browser tests cover 1920, 1440, 1024, 768, 390 and 320 pixels, real audio playback, speeds, score/reset, transcript visibility/logout, QR and all three entry points. Deployment must restart only jaralingua-progress-api after syntax validation; do not publish script Markdown.
