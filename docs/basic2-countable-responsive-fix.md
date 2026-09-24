# Countable or Uncountable? — responsive repair, 2026-09-24

Scope: only `practice-unit-6-countable-uncountable-food.html`. No content, answer key, authentication, grades, or other activities changed. The new listening is not part of this release.

## Findings and correction

- The floated 90px question thumbnail reduced the answer column to 166px on a 320px phone. Choices now clear the thumbnail and fill the whole inner card width. The illustration shares the question-heading row, not the answers row.
- Generic hero rules enlarged the tablet title and stacked wide buttons. A scoped stylesheet now enforces a smaller title, side-by-side action buttons, and compact image height. The hero measured about 691px tall at 768px before the correction and 478px afterward.
- Tablet landscape (through 1024px) gets stacked, compact hero sections; desktop keeps the horizontal hero. Phones keep one question per row; wider screens use two.
- Header and hero remain in normal scrolling flow. QR remains inside the title box and opens centered. Buttons/radios remain touch-friendly.
- The page builder includes the scoped stylesheet so rebuilding cannot remove the repair.

## Verification

`COUNTABLE_BASE_URL=http://127.0.0.1:8025 COUNTABLE_ASSERT=1 node tools/test_basic2_countable_responsive.cjs`

Real Chrome with touch emulation: 320, 390, 600, 768, 820, 1024, 1440px. Checks horizontal overflow, answer-column width, editable answers before/after checking, scrolling hero/header, collapsed defaults and centered QR. Screenshots in ignored `tmp/countable-responsive/`. Repeat with production base after deploying. These are viewport tests, not physical-device or Safari tests.

Publish only this document, the dedicated test, page-builder adjustment, scoped CSS, and the activity HTML in the commit. Only HTML and CSS need deployment. Preserve unrelated pending changes and the unpublished listening activity.
