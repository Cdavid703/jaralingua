# Unit 6 responsive audit — 2026-10-01

## Scope

Five currently published Practice Lab activities: Countable or Uncountable, Food Quantities, Containers and Portions, Food Vocabulary Memory, and At the Restaurant with Ethan. Also inspect the Unit 6 teaching page with topics expanded. This is a layout/responsive audit, not a complete pedagogical, backend, physical-microphone, or student-submission certification.

Stone Soup and Fabulous Food Pronunciation remain separate pending development work, not silently included in this publication. The listening previously mentioned in discussion is absent from the current published Unit 6 index; do not claim it was inspected as a live activity.

## Findings and changes

- **Major — Containers and Portions:** Safari/WebKit shrinks answer grids to zero width alongside floated legends/images, causing overlapping text and page overflow. Explicit clearing and a defined answer width fix the layout, reserving space for the existing image. Mobile gets one question column.
- **Moderate — Food Vocabulary Memory:** fixed card aspect ratios could not fit a 100px image plus its word. Words crossed borders or overlapped the next row. Use content-aware heights, separate image/text rows, four tablet columns, and three columns on the narrowest phones. Do not hide overflowing text to mask the defect.
- **No new layout findings in tested states:** the already repaired Countable or Uncountable and Food Quantities; Ethan onboarding/conversation layout, open help and microphone settings. Teaching page also included in the final sweep.

The repair stylesheet is loaded only by Containers and Portions and Memory. No shared scripts, question wording, grading, coach engine, audio, roster, or other activities are changed. Existing work in the checkout is preserved.

## Reproducible checks

`tools/audit_unit6_layout.cjs`: WebKit and Chromium, touch contexts, 360×800, 390×844, 768×1024, 820×1180, 834×1194, 1024×768, 1180×820 and 1440×1000. Checks page overflow, question/choice geometry, memory word containment, QR/title separation, coach internal overflow, and non-sticky hero/header. Reveals memory cards synthetically only to inspect every word; no real user data or microphone upload. Expands teaching topics for layout inspection. Screenshots support visual review. Set UNIT6_ASSERT_CLEAN=1 to fail on findings.

`tools/test_unit6_layout_interactions.cjs`: both browser engines; change quiz answers before/after checking, complete 12/12 score, feedback geometry and reset; actual memory UI mismatch/turn change, then all twelve matching pairs and repetition/continue steps. Tests only local browser game state, not academic records.

Set UNIT6_BASE_URL to the preview or https://www.jaralingua.com. Repeat both suites after explicit-file publication. Emulated viewport/browser testing does not equal testing on a physical iPad. Current deployment uses the owner's standing commit/push/publication authorization and keeps backups.
