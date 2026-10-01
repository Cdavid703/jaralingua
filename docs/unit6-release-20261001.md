# Unit 6 pending-activity release, 2026-10-01

The owner authorized publication of all pending work reported for Unit 6: Stone Soup, Fabulous Food Pronunciation Studio, its ungraded teacher-report API, Practice Lab and Pronunciation Library links, and supporting documentation/tests. This does not create the missing separate listening activity or modify existing student grades/submissions.

## Verified before publication

- Stone Soup: full automated suite in Chromium and WebKit; six viewport/orientation combinations, six illustrations, page navigation/animation/sound, fullscreen/fallback, narration, speed, mutable balanced quiz, persistence and QR.
- Pronunciation: Chromium fake microphone, five viewport sizes, 66 audio resources, all seven stages, English-only result, zero-score progression, retry after connection/auth/receipt errors, account separation and idempotency across reload. This is not a physical-device microphone test.
- Backend: real validator/route extracted from both development and production-merged code, using only synthetic in-memory grades. Seven valid sections, malformed report rejection, unauthorized roster rejection, ungraded record, matching receipt and duplicate handling.
- Practice Lab has eight Unit 6 cards, including the recently added unchanged Market Basket Challenge link. Folders remain closed by default.

## Publication procedure

Commit explicit files, push normally, preview and apply the static publisher with an enumerated asset list. Publish assets before pages, and indexes last. The API is a separate deployment: `tools/deploy_unit6_pronunciation_api.py` applies only this release's `server/progress_api.py` delta to the live source, requires exact before/after hashes, repeats isolated tests, creates a backup, replaces atomically, restarts the API and checks health. Failure restores previous code. Never replace production wholesale with the development API file.

No real academic records are used as test fixtures. Production checks include public page/resource loads and unauthenticated API rejection. A physical iPad/Android microphone check and a teacher-visible submission from an authorized test account remain distinct from the automated mocked frontend/in-memory backend checks.

## Deployed release

- Implementation commit: `46d973435ad5dfe43cefa91aaf57aa2d28f1796b`, pushed to main.
- 68 assets/pages published, then both indexes (70 static files in total).
- API backup: `/var/backups/jaralingua/unit6-api/20261001T221811Z-z4hrnjiy`.
- Asset/page backup manifest: `/var/backups/jaralingua/vps-publish/20261001T221818Z-bziv6798/manifest.json`.
- Index backup manifest: `/var/backups/jaralingua/vps-publish/20261001T221851Z-1omk1cjs/manifest.json`.
- API health HTTP 200; unauthenticated pronunciation submission HTTP 401. Pronunciation frontend suite passed against production with fake microphone/mocked assessment and submission.
- Production book testing detected a pause-during-load race in the original implementation. The follow-up invalidates the older play promise on intentional Pause/Resume and adds a deterministic interrupted-play regression test; the page script version was bumped.
- Fix commit `411ad5f6987c1ee3f9318ad28a7d91c37c6d0757` published with backup `/var/backups/jaralingua/vps-publish/20261001T222541Z-ujz_1k7k/manifest.json`. The complete Stone Soup suite then passed against production in both Chromium and WebKit, including the interrupted-play regression, all narration resources, ten questions and eight-card index.
- All reported existing activity files and supporting documentation are committed/pushed. The separate Unit 6 listening was not present and was not fabricated or reported as published.
