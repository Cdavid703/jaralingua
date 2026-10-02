# Unit 5 listening · A Different First Impression

Date: 2026-09-25. Canonical page: https://www.jaralingua.com/ingles/intermediate-2/listening-unit-5-a-different-first-impression.html

## Teaching and reference

Follows the actual Unit 3 listening, The Message Before the Workshop: shared course navigation, full-width photographic hero, search, vocabulary preview, prediction, three listening passes, comprehension feedback, language noticing, collapsible transcript and speaking finish. Uses simple English. Ungraded practice by default, following that reference; no new teacher submission or gradebook weight. The optional preference question about making it a submission received no answer before implementation.

Sam sees a quiet volunteer and assumes boredom. Maya supplies another possibility and first-hand context. The conversation models separating visible evidence from interpretation, and revising an impression through conversation. It includes might / must / can't, confused / confusing, tiring, because / so / although, a satirical poster, and break the ice. Ten questions have three choices each. Feedback states the evidence. The speaking finish asks for the original impression, new evidence, a friendly response and a response to a partner, with an optional 45-second timer.

## Audio and media

Original fictional dialogue: 12 turns, approximately 220 words. ElevenLabs eleven_v3 dialogue: Sam = Sean (DwwuoY7Uz8AP8zrY5TAo); Maya = Sarah (EXAVITQu4vr4xnSDxMaL). File `ingles/intermediate-2/audio/unit-5-listening/a-different-first-impression.mp3`, 1,345,036 bytes, 84.04 seconds at 1x; about 112 seconds at 0.75x. SHA-256: 91564d8b686545902a63ed94d69335ec19647bb179b0542f5b44c1beb85c3f2d.

Playback starts at 0.75x, with 1x and 1.25x choices. Native controls allow pause, replay and seeking. Inline words/phrases have a small speaker indicator; the dialogue and word audio pause each other. A retry button is shown only after an audio error. Main conversation has a full accessible transcript. Thirteen pronunciation models: nine new Sarah multilingual_v2 files; four existing models reused from Unit 5 explanation and picture practice.

Transcription audit: all ten required facts retained. Raw exact-match flag remains false for the conversation: Scribe writes six as 6:00 and the natural reduction of want to as wanna. Explicit normalization of those equivalents, capitalization and punctuation produces an exact match. This is documented in `dialogue-audit.json` as normalizedMeaningMatch, without overwriting the raw result. All nine new pronunciation models passed normalized transcript comparison. Source script, voice cast, model manifests and audit results are saved locally, not needed by the public runtime.

The hero and catalog reuse the existing Unit 5 community-supplies photograph `assets/img/english-intermediate-2/unit-5/behind-the-picture/07-community.webp`. This is an illustrative community setting, not an exact depiction of every dialogue detail. No new listening-specific image is claimed.

## Question evidence map

1. Community food collection (Sam's first turn).
2. Alex sitting alone with a notebook (Sam's first turn).
3. Sam thinks Alex looks bored / uninterested (first and penultimate turns).
4. Maya suggests concentrating (second turn).
5. Alex is checking the guest list / learning names (fourth turn).
6. Maya has worked since six that morning (fifth turn).
7. Confusing instructions caused her confusion (sixth turn).
8. Cups demanding a holiday is satire (seventh and eighth turns).
9. Break the ice means starting a friendly conversation (tenth turn).
10. Invite Alex to help with boxes and hear his story (ninth and eleventh turns).

## Layout and controls

Question, vocabulary and language grids use three columns above 1100 px, two above 760 px and one on smaller screens. Hero and header scroll normally. Shared Google/Microsoft/local sign-in panel is kept visible using top-layer popover support and visualViewport sizing. QR uses the shared page component and a real SVG with the canonical HTTPS URL. Page contract now checks all 39 local Intermediate 2 pages, including unpublished picture work.

Changing an answer invalidates previous feedback and total. Reset clears all choices and feedback. Prediction is explicitly ungraded. Listening-pass self-checks can be undone. The timer handles pause, resume, expiry, restart, reset and background elapsed time. No student information or answers are sent anywhere by this practice.

## Release scope

Listening page, scoped JS/CSS, public question/model map, QR SVG and ten new MP3 files. Discovery in Practice Lab Unit 5 and Listening Library Unit 5. Listening Library now shows four listenings; released Practice Lab shows 23 activities. Local catalog has 24 because Behind the Picture remains a separately pending, unpublished activity. Deployment catalog, Practice Lab and sitemap were based on downloaded live versions and append only the listening. Do not later deploy stale picture-task index bundles: rebuild them on the new live baseline.

Guarded release scripts in `tmp/unit5-listening` verify previous hashes, exact archive membership and new hashes; back up to a private server directory before atomic file replacement. No backend, exams, students, submissions, grades or authentication credentials changed.

## Verification

`tools/test_intermediate2_unit5_listening.cjs` covers native MP3 playback and duration, three speeds, all thirteen pronunciation clips at desktop width, mutual audio exclusion, error/retry, ten wrong and ten correct answers, missing answers, changed-answer invalidation, reset, prediction, listening passes, transcript, speaking timer, search, responsive columns, horizontal overflow, QR modal and visible local sign-in. It also checks both catalog paths, counts, links, search and Unit 5 hash opening. QR screenshot was independently decoded with ZXing to the exact canonical URL. Browser screenshots are saved in `tmp/unit5-listening`.

Completed verification: Chrome and WebKit passed at widths 320, 390, 430, 768, 1024, 1440 and 1920 before publication. Published-page checks then passed in both browsers at 390 and 1440, including all thirteen pronunciation clips, both catalogs, QR and sign-in visibility. The course page contract passed for all 39 local pages. WebKit is browser-engine testing, not a claim of testing on a physical iPhone.

Release completed with verified hashes. Backups: `/var/backups/jaralingua/unit5-listening-page-20260926T024322Z` and `/var/backups/jaralingua/unit5-listening-indexes-20260926T024323Z`. Initial audio-only release backup: `/var/backups/jaralingua/unit5-listening-page-20260925T232141Z`. Times are UTC; publication was September 25 in Colombia.

## Correction requested by teacher · 2026-09-25

This section supersedes the initial public transcript design above. All ten questions now show A., B., C. visibly, and feedback identifies the correct letter. Template/builder updated so regeneration preserves the corrected model.

Teacher transcript now appears beside the audio player only after successful authenticated access. Reuses the Basic 2 listening interaction pattern. Full twelve-turn dialogue moved to `server/intermediate2_unit5_listening.py`; GET `/api/intermediate2/unit5-first-impression/transcript` follows shared `require_user()` and checks this course's teacher/admin grade role. No full transcript in static HTML/JS; no new audio was generated. Frontend clears transcript on logout/account change/pagehide and ignores late responses after logout. Responses use shared Cache-Control: no-store. Source JSON/script remain local; publicly checked 404/403 respectively. Direct public server-module request returns 403.

Tests: existing listening browser suite now asserts A/B/C on every question and covers anonymous/student/teacher/admin UI, transcript toggle, logout and delayed response after logout using a mocked transcript endpoint. Chrome passed 390/1440 locally. Backend AST tests execute the actual isolated route for visitor/student rejection (403), teacher/admin success (200), authentication-before-route ordering and exact match with the audio source. Production anonymous endpoint returns 401 and /api/health returns 200. These tests do not claim use of a real teacher account.

Deployment: patched only the new route into a freshly downloaded live `progress_api.py`, preserving unrelated local server work. Private module + isolated route deployed and API restarted with health/401 checks and rollback support. Then published page, scoped CSS and JS, with new cache versions. Backups: `/var/backups/jaralingua/unit5-listening-teacher-server-20260926T025638Z` and `/var/backups/jaralingua/unit5-listening-teacher-page-20260926T025642Z`. No grade, submission, catalog or exam-state changes.
