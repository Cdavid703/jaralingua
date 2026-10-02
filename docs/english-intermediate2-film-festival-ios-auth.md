# Film Festival mobile sign-in — 2026-09-19

The existing fixed sign-in panel remained nested under the navigation. The festival now promotes that same panel to the non-modal browser popover top layer where supported, preserving the Google iframe and shared authentication events. Its mobile bounds follow visualViewport; vh remains a fallback. Escape and outside-click close the panel. CSS/JS URLs were versioned.

Published only festival CSS, JS and HTML. Backup: /var/backups/jaralingua/film-festival-ios-20260919T153725Z. No authentication API, permissions or student submissions changed.

Verification: node tools/test_intermediate2_film_festival_ios.cjs (local assets routed over the live page), then LIVE=1 for production. Chromium touch emulation: widths 320, 390, 430, 844 landscape and 1440; both entry points, scrolled opening, actual Google iframe visible and unobstructed, top-layer state, Escape, and enlarged QR. Separately tapped the official Google overlay and verified its popup origin was https://accounts.google.com, without signing in. The 35-page contract passed. No physical iPhone tested. WebKit installation was too slow to complete during the urgent release; do not report Safari-specific reproduction as confirmed. WEBKIT=1 runs the same regression once the engine is installed.

## Submitted image visibility fix — 2026-09-19

Production CSP permits img-src data: but excludes blob:. Authenticated image downloads returned HTTP 200, while the client converted them to blocked blob: URLs. Changed private image display to data URLs (the same allowed format as upload previews); private API authorization remains unchanged. Gallery projection is enabled only after image decoding succeeds. No storage or student data changes.

Regression: tools/test_intermediate2_film_festival_images.cjs runs against production CSP with fictitious API responses, verifies naturalWidth for teacher thumbnails, projection, refresh and student receipt previews at 390/1440. The previous code fails; patched local and published code pass. Backup: /var/backups/jaralingua/film-festival-images-20260919T154754Z.

## Course username/password access — 2026-09-19

Added the missing Intermediate 2 mapping in shared localLoginPath to the existing /api/intermediate2/grades/login endpoint. Festival HTML versions the shared auth script so returning users receive the form. Reuses the existing username/current-password inputs, errors and provider=local session flow; no accounts or passwords created or changed.

Test: tools/test_intermediate2_film_festival_local_login.cjs against local and published assets with mocked API responses at 320, 390, 844 landscape and 1440. Verified form visibility, masked password, correct endpoint/payload, invalid-password retry, local session and authenticated festival state request. Production accounts were not used in tests. Page contract passed. Backup: /var/backups/jaralingua/film-festival-local-login-20260919T155720Z.
