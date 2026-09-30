# Food Quantities — iPad layout correction

## Reproduced issue

WebKit at 820×1180 rendered the first `.fp-choices` grid with width **0px**, beside a full-width floated fieldset legend. The right-floated food image and implicit shrink-to-fit width caused answer text to stack/overlap. Chromium at the same size did not reproduce the collapse, so Chromium-only viewport checks were insufficient.

## Scoped correction

- Add `assets/css/basic2-food-quantities-responsive.css`, linked only from `practice-unit-6-food-quantities.html` with a new version.
- Explicit `clear:left` puts answers below the question legend.
- Set the choices width explicitly, reserving 90px + 12px for images when present; image-free questions retain full-width choices.
- Keep legible line height, shrinkable labels, comfortable radio hit areas, and automatic card heights.
- Single question column at <=740px; two columns on iPad/desktop. Retain full-width content, scrolling hero, top login, and QR inside the hero title box.
- No changes to shared CSS/JS, questions, scoring, other activities, backend, grades, or student records.

## Verification

`tools/test_food_quantities_responsive.cjs` uses WebKit and Chromium with touch input at 360×800, 390×844, 768×1024, 820×1180, 834×1194, 1024×768, 1180×820, 1194×834, and 1440×1000.

Checks all 15 question cards for nonzero answer width, contained labels, no overlap with headings/images/feedback, no page overflow, touch answer changes before/after checking, reset, scrolling hero and QR separation. Screenshots inspected for iPad portrait/landscape and phone. Tests emulate browser/viewports, not a physical iPad.

Run with `PLAYWRIGHT_MODULE` and `FOOD_QUANTITIES_BASE_URL` for other environments. Re-run against production after publication. Existing production and development source were compared; differences in the original HTML/shared CSS/JS were only LF/CRLF line endings.

Publication requires approval and explicit-file commit/push/deployment. Do not include the pending Stone Soup reading, pronunciation activity, or backend edits.
