# Behind the Picture · Intermediate 2 Unit 5

Created 25 September 2026 from the user's approved 10-card plan.

Published URL: https://www.jaralingua.com/ingles/intermediate-2/speaking-unit-5-behind-the-picture.html
Catalog: Practice Lab → Unit 5 → Pair speaking.

## Current status

Published on 26 September 2026. All ten image scenes, 42 pronunciation models, page controls and the expandable QR are available in production. The built-in image generator successfully created scene 1 on retry; no CLI/API fallback was used. Practice Lab → Unit 5 includes the Pair speaking card, and the canonical URL is in the sitemap.

Historical tests used PENDING_IMAGE=1 only to exercise controls while scene 1 was missing. Final prepublication and live tests ran without that flag and used the actual ten images. Do not use a placeholder for release verification.

## Pedagogy

Four repeated questions, all clickable for pronunciation:
1. Observe: What can you see?
2. Explain: What could be happening?
3. Support: What clue supports your idea?
4. Respond: What does your partner think? How do you respond?

Each card has a neutral observable context, not an answer key. Multiple interpretations are encouraged. The person’s appearance is not treated as proof of feelings. Both partners speak and support their ideas; the starter alternates each time a different picture begins a round. Three pictures per session is recommended. The optional two-minute timer starts only on an explicit click, pauses on dialog close, supports resume/reset, and ends with a visible message. It uses an absolute deadline so background throttling does not lengthen the round.

Useful language is collapsed initially. It provides starters rather than ready-made answers, plus two optional words per scene, including surprised/surprising, excited/exciting, confused/confusing and interested/interesting. Pronunciation of a starter excludes the displayed ellipsis. A collapsed sample dialogue illustrates a response to another person's idea.

The four self-checks track describing, explaining, evidence and responding. Checkboxes are synchronized between each card and its projector view. Only all four checks mark the conversation complete. They are self-reports, not automatic assessment or grades; no submission, recording, student data or gradebook weight was added. Reloading clears progress, as stated on the page.

## Teaching support: possible interpretations, not correct answers

| Picture | Possible interpretations to explore |
|---|---|
| Before the Door Opens | An interview, appointment or presentation; ask which clues justify each idea. |
| A Surprise on the Screen | Unexpected results, good news or a funny clip; the screen is hidden. |
| The Empty Seat | Waiting for someone, a companion ordering food, or two drinks for one person. |
| After the Presentation | Finishing a talk, recognition or overcoming a difficult moment. |
| Something in the Bag | An unexpected gift, an incorrect item or a planned surprise. |
| The Quiet Group Member | Concentrating, listening first or considering what to say; quiet does not mean unfriendly. |
| Helping or Organizing? | Preparing donations, setting up an event or moving supplies. |
| A Difficult Task | Confusion, testing a solution or enjoying a challenge. |
| An Unexpected Arrival | A visit, a return or an arranged meeting; appearances alone do not decide. |
| What Are They Looking At? | An artwork, performance or event outside the frame. |

Teachers can ask: “What other explanation fits?”, “Which clue makes you think that?” and “What would you ask the person before deciding?” Encourage might/could for uncertainty; must/can’t only when strong evidence supports that certainty. The goal is an exchange of ideas rather than guessing the teacher’s intended story.

## Design and implementation

Reference: actual Unit 2 Choose the Pattern shell, Unit 5 Read the Clues cards, shared Intermediate 2 design and Practice Lab catalog, established inline speaker mark, native full-viewport projection and mobile top-layer auth.

Full width with four columns from 1600px, three above 1100px, two above 620px and one on smaller phones. Nonfixed header/hero. A shared-QR sizing override prevents hero photo rules from stretching the code. Projector images use contain and retain the complete picture. Narrow-screen projection puts image then text in normal block flow to prevent image/text overlap. Desktop keeps the picture visible alongside scrolling prompts; landscape has a two-column layout. Close/Escape restore focus.

The shuffled picture deck never repeats an opened picture in the current set; manual navigation also removes it from the unseen deck. At exhaustion the random button disables and Shuffle a new set appears. A new set allows repetitions and retains self-checks. Previous/next stop at the first/last picture. Opening or navigating does not start the timer automatically.

One audio player, reload-on-replay for WebKit, default 0.75×, 1× option, inline error/retry message and Stop audio. Playback on a phrase never opens a picture.

Shared Google/Microsoft/local sign-in remains available. Mobile panel uses the established popover/visualViewport behavior without relocating the provider iframe. QR opens a larger dialog and encodes the canonical page URL.

## Files and media

- Page: D:/Jaralingua/ingles/intermediate-2/speaking-unit-5-behind-the-picture.html
- Scoped CSS: D:/Jaralingua/assets/css/english-intermediate2-unit5-picture.css
- Behavior: D:/Jaralingua/assets/js/english-intermediate2-unit5-picture.js
- Data: D:/Jaralingua/assets/data/english-intermediate2-unit5-picture.json
- Builder: D:/Jaralingua/tools/build_intermediate2_unit5_picture.py; retains audio hashes and synchronizes embedded JS data.
- Images: D:/Jaralingua/assets/img/english-intermediate-2/unit-5/behind-the-picture/
- Audio: D:/Jaralingua/ingles/intermediate-2/audio/unit-5-picture/
- QR: D:/Jaralingua/assets/img/page-qr/ingles-intermediate-2-speaking-unit-5-behind-the-picture.svg
- Browser test: D:/Jaralingua/tools/test_intermediate2_unit5_picture.cjs

42 unique pronunciation models: 31 new Sarah / eleven_multilingual_v2 clips and 11 existing audited clips reused. All 31 new files transcribed with exact normalized matches. All 42 source files checked against audit transcript text and SHA256. The scripts and manifests are saved beside the new MP3s. No student data was sent to audio services.

Practice Lab integration adds one Pair speaking entry (Speaking filter). The published catalog now contains 28 activities, seven in Unit 5, and the page contract checks 43 pages. Fresh remote catalog baselines were downloaded for final publication; all existing entries were preserved and unrelated local work was excluded.

## Verification and deployment record

Chrome prepublication checks passed at 320, 390, 430, 768, 1024, 1440 and 1920px with the missing scene substituted by the browser test only. Covered four questions per card, all 42 audio models/replay, speed, stop, image projection, focus restoration, timer start/pause/resume/reset/expiry using a test time offset, synchronized checks, random deck exhaustion/reset, no horizontal overflow, QR, local login visibility and catalog search/filter. Visual review found and fixed narrow-screen projector image/text overlap; test now asserts separation.

QR enlarged screenshot decoded with ZXing to the exact intended URL. JS/Python syntax valid; 38-page QR/auth contract passed. All media audits verified. WebKit checks run against real production MP3 URLs even while the HTML is locally intercepted, because Windows WebKit media decoding bypasses interception.

Initial media-only upload: 41 assets, backup /var/backups/jaralingua/unit5-picture-page-20260925T225438Z. The page/catalog/sitemap were not published in that initial release.

### Final deployment · 26 September 2026

- Completed scene 1 with built-in image generation and saved a 1536×1024 WebP (138,142 bytes) at `assets/img/english-intermediate-2/unit-5/behind-the-picture/01-door.webp`. Original retained at `C:/Users/USER/.codex/generated_images/01a05f84-3128-7292-9e63-cf10958e2113/exec-feb6e554-2264-48eb-bbbd-793eb2a03d87.png`. Exact prompt below; no CLI fallback or substitute scene.
- Chrome and WebKit passed at 320, 390, 430, 768, 1024, 1440 and 1920 px with actual assets. Live Chrome and WebKit passed at 390 and 1440 px, including all 42 audio models, image decoding, no-repeat deck, timer, checklist, Sign in, QR enlargement and catalog filtering. Live WebKit also passed in 844×390 landscape.
- Visual screenshots reviewed at mobile and desktop sizes. The 43-page shared QR/auth/responsive contract passed.
- Selective release: page, scoped JS/CSS, missing image and QR first; then Practice Lab, catalog and sitemap. The previous media-only files were reused and verified. No backend/service restart, grade, submission or exam-access change; no Git commit/push.
- Deployment scripts and manifests: `tmp/unit5-picture/prepare-final-release.py`, `deploy-final.py`, `final-page-manifest.json`, `final-indexes-manifest.json`, `final-runtime-hashes.json`. Preparation compared the current catalog to a fresh VPS snapshot and required that the only additional entry was Behind the Picture. Sitemap preserved every prior URL. Practice Lab counts were updated to 28 total and seven in Unit 5.
- VPS: `root@jaralingua.com`, web root `/var/www/jaralingua.com`. Private staging: `/root/unit5-picture-final-release`. SHA-256 concurrency guards, private backups, per-file atomic replacement and rollback on failure were used. For any later release, download new baselines and rebuild the bundles; do not upload these stale shared indexes.
- Page backup: `/var/backups/jaralingua/unit5-picture-final-page-20260926T122718Z`.
- Index backup: `/var/backups/jaralingua/unit5-picture-final-indexes-20260926T122752Z`.
- `python tmp/unit5-picture/verify-public-release.py` passed: 100 public URLs returned HTTP 200; all 43 course pages matched local content after newline normalization; the 59 activity/index files matched exact release hashes. Production has exactly one Behind the Picture catalog entry. The previously identified pending activity is now deployed.

## Image generation prompts

Built-in image_gen mode; no CLI fallback used. Originals retained under the generated-images directory. Optimized WebP copies preserve the scene and are saved in the project directory above. Exact prompts:

### 01-door · Before the Door Opens

Final saved file: D:/Jaralingua/assets/img/english-intermediate-2/unit-5/behind-the-picture/01-door.webp

Use case: photorealistic-natural. Create a single landscape 3:2 photorealistic educational picture for an English speaking activity called Before the Door Opens. A young adult woman in everyday navy and teal clothing sits on a chair in a neutral office waiting area. She holds a plain closed document folder and looks down at her wristwatch. A closed door and two empty chairs are clearly visible nearby. Keep the whole scene comfortably framed, realistic hands and natural soft daylight. Her exact feelings and reason for waiting must be ambiguous. No signage, letters, text, logos, watermark, collage or website interface. This is a new independent scene, not a modification of any prior image.

### 02-screen · A Surprise on the Screen

Final intended file: D:/Jaralingua/assets/img/english-intermediate-2/unit-5/behind-the-picture/02-screen.webp

Photorealistic natural editorial educational photograph, landscape 3:2, a single coherent scene. Adult learners from varied backgrounds, realistic anatomy and hands, natural facial expressions, muted navy and teal accents matching an intermediate English course. Medium-wide framing preserves all useful objects and gestures for classroom projection. Soft natural light. No readable text, numbers, labels, logos, captions, watermark, collage or website UI. The picture invites multiple plausible interpretations; do not resolve the story. Scene: Two adult classmates sit side by side at a laptop at a study table. One smiles, the other puts a hand near their mouth in surprise. Show the BACK of the laptop screen so the content is entirely invisible. Their different reactions are visible. No cause of the reaction is revealed.

### 03-seat · The Empty Seat

Final intended file: D:/Jaralingua/assets/img/english-intermediate-2/unit-5/behind-the-picture/03-seat.webp

Photorealistic natural editorial educational photograph, landscape 3:2, a single coherent scene. Adult learners from varied backgrounds, realistic anatomy and hands, natural facial expressions, muted navy and teal accents matching an intermediate English course. Medium-wide framing preserves all useful objects and gestures for classroom projection. Soft natural light. No readable text, numbers, labels, logos, captions, watermark, collage or website UI. The picture invites multiple plausible interpretations; do not resolve the story. Scene: An adult woman sits at a small cafe table with exactly two ceramic cups of coffee on the table, an empty chair opposite her and a phone lying face down beside a cup. She looks toward the entrance. No person approaching, no clues confirming why there are two cups.

### 04-presentation · After the Presentation

Final intended file: D:/Jaralingua/assets/img/english-intermediate-2/unit-5/behind-the-picture/04-presentation.webp

Photorealistic natural editorial educational photograph, landscape 3:2, a single coherent scene. Adult learners from varied backgrounds, realistic anatomy and hands, natural facial expressions, muted navy and teal accents matching an intermediate English course. Medium-wide framing preserves all useful objects and gestures for classroom projection. Soft natural light. No readable text, numbers, labels, logos, captions, watermark, collage or website UI. The picture invites multiple plausible interpretations; do not resolve the story. Scene: An adult female student stands beside a completely blank switched-off presentation screen holding a few blank note cards. Three adult classmates seated nearby are applauding naturally. The presenter has a small modest smile. No certificates, awards or writing reveal what happened.

### 05-bag · Something in the Bag

Final intended file: D:/Jaralingua/assets/img/english-intermediate-2/unit-5/behind-the-picture/05-bag.webp

Photorealistic natural editorial educational photograph, landscape 3:2, a single coherent scene. Adult learners from varied backgrounds, realistic anatomy and hands, natural facial expressions, muted navy and teal accents matching an intermediate English course. Medium-wide framing preserves all useful objects and gestures for classroom projection. Soft natural light. No readable text, numbers, labels, logos, captions, watermark, collage or website UI. The picture invites multiple plausible interpretations; do not resolve the story. Scene: Two adult friends look down inside an upright opaque gift bag standing on a table. One smiles with surprise, the other looks puzzled. Plain ribbon and simple unlettered balloons are in the background. The contents of the bag are completely hidden behind the bag wall; no objects protrude.

### 06-group · The Quiet Group Member

Final intended file: D:/Jaralingua/assets/img/english-intermediate-2/unit-5/behind-the-picture/06-group.webp

Photorealistic natural editorial educational photograph, landscape 3:2, a single coherent scene. Adult learners from varied backgrounds, realistic anatomy and hands, natural facial expressions, muted navy and teal accents matching an intermediate English course. Medium-wide framing preserves all useful objects and gestures for classroom projection. Soft natural light. No readable text, numbers, labels, logos, captions, watermark, collage or website UI. The picture invites multiple plausible interpretations; do not resolve the story. Scene: Four adult students work together at a table. Three are talking naturally to each other; the fourth listens quietly with an open blank notebook, thoughtful expression and attentive posture. The quiet participant is equally included in the composition, not isolated or visibly rejected.

### 07-community · Helping or Organizing?

Final intended file: D:/Jaralingua/assets/img/english-intermediate-2/unit-5/behind-the-picture/07-community.webp

Photorealistic natural editorial educational photograph, landscape 3:2, a single coherent scene. Adult learners from varied backgrounds, realistic anatomy and hands, natural facial expressions, muted navy and teal accents matching an intermediate English course. Medium-wide framing preserves all useful objects and gestures for classroom projection. Soft natural light. No readable text, numbers, labels, logos, captions, watermark, collage or website UI. The picture invites multiple plausible interpretations; do not resolve the story. Scene: Four adult volunteers carry plain cardboard boxes and organize sealed food packages at a neighborhood community center with tables. Show cooperative actions clearly but no signage explaining whether it is a donation drive, event preparation or moving supplies.

### 08-task · A Difficult Task

Final intended file: D:/Jaralingua/assets/img/english-intermediate-2/unit-5/behind-the-picture/08-task.webp

Photorealistic natural editorial educational photograph, landscape 3:2, a single coherent scene. Adult learners from varied backgrounds, realistic anatomy and hands, natural facial expressions, muted navy and teal accents matching an intermediate English course. Medium-wide framing preserves all useful objects and gestures for classroom projection. Soft natural light. No readable text, numbers, labels, logos, captions, watermark, collage or website UI. The picture invites multiple plausible interpretations; do not resolve the story. Scene: Two adult students work at a table with a half-built small wooden mechanical model, loose pieces and open instructions containing only simple diagrams without letters or numbers. One examines a piece thoughtfully, the other smiles with curiosity. No clear success or failure; the model is still in progress.

### 09-arrival · An Unexpected Arrival

Final intended file: D:/Jaralingua/assets/img/english-intermediate-2/unit-5/behind-the-picture/09-arrival.webp

Photorealistic natural editorial educational photograph, landscape 3:2, a single coherent scene. Adult learners from varied backgrounds, realistic anatomy and hands, natural facial expressions, muted navy and teal accents matching an intermediate English course. Medium-wide framing preserves all useful objects and gestures for classroom projection. Soft natural light. No readable text, numbers, labels, logos, captions, watermark, collage or website UI. The picture invites multiple plausible interpretations; do not resolve the story. Scene: An adult person with a rolling suitcase stands in an open doorway of a cozy shared apartment while an adult friend rises from a sofa to greet them with a surprised smile. The arrival could be expected or unexpected. No text, signs, travel tags or labels explaining the destination.

### 10-looking · What Are They Looking At?

Final intended file: D:/Jaralingua/assets/img/english-intermediate-2/unit-5/behind-the-picture/10-looking.webp

Photorealistic natural editorial educational photograph, landscape 3:2, a single coherent scene. Adult learners from varied backgrounds, realistic anatomy and hands, natural facial expressions, muted navy and teal accents matching an intermediate English course. Medium-wide framing preserves all useful objects and gestures for classroom projection. Soft natural light. No readable text, numbers, labels, logos, captions, watermark, collage or website UI. The picture invites multiple plausible interpretations; do not resolve the story. Scene: Three adults in a public outdoor plaza all look toward the same object entirely OUTSIDE the right edge of the frame. One gently points off-frame, one smiles, one looks mildly puzzled. Their gaze direction agrees. Do not show the object, performance or event they are looking at.


## Historical prepublication checks while image 1 was pending

- Chrome: 320, 390, 430, 768, 1024, 1440, 1920; all controls and 42 audio models passed.
- WebKit: 320, 390, 430, 768, 1024; controls passed. 1440 all-model and 844×390 landscape checks run separately. All use PENDING_IMAGE=1 solely in the test interceptor.
- A short 0.888-second audio (I can see) finished before the WebKit test read its playing state. Player reported ended=true, positive currentTime and no error. The test now accepts successful completed playback as well as currently playing audio; no product audio change was needed.
- At that stage the page/catalog remained unpublished. The old three-file catalog/sitemap release was prepared in tmp/unit5-picture but was not used; the final release above was rebuilt against fresh production snapshots.
- The built-in generator initially failed the remaining scene with HTTP 401. This was resolved by a successful built-in generation on 26 September; no CLI/API fallback was needed.
