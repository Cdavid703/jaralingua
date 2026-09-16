# English portal — compact full-width layout

Applies to `/ingles/index.html`. Updated 2026-09-15.

- Each course card has its existing title, image, ONE short descriptive sentence and link. No feature lists, long introduction, technical service names or obsolete “in preparation” notices.
- Shorten actual source text; do not hide long descriptions with line-clamp or truncation.
- Use the full available screen with 12–32px fluid gutters, not the shared 1180px container. Hero, search, quick access, course grid and method band all follow this rule.
- Four course cards per desktop row, two at 1100px and below, one at 560px and below. Images remain prominent, links stay touch-friendly.
- Horizontal hero on desktop, stacked below 800px. Hero and header scroll with the page, no fixed/sticky banner.
- All overrides are scoped to `english-portal-page` in `assets/css/english-portal.css`; do not change course-page layouts globally.
- Keep all four course destinations, top sign-in, course switcher, keyword search and closed quick access working.

Regression test: `node tools/test_english_portal.cjs`; set `ENGLISH_PORTAL_TEST_BASE_URL=https://www.jaralingua.com` for production.
