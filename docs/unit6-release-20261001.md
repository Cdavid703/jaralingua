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
