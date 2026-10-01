# Food Quantities: complete question illustrations

Question 6 (a little butter) and question 10 (some soup) had no image assigned. All fifteen questions must now show a loaded food image, including after Try again. No answers or scoring changed.

- New asset: `assets/img/english-basic-2/food-quantities/butter.png`.
- Reused asset: `assets/img/english-intermediate/unit-5/quantity-mission-foods-v2/vegetable-soup.webp`.
- Bumped the data-script version on Food Quantities to invalidate its cached bank.
- Regression test: `tools/test_food_quantities_responsive.cjs` verifies fifteen decoded images, the two specific assets, nine viewport sizes in WebKit and Chromium, answer changes, check/reset, QR separation and scrolling hero.

## Butter image generation

Generated with the built-in image generation tool, not an external download. Prompt:

> Use case: scientific-educational. Asset type: food vocabulary photograph for an adult English grammar exercise. Professional photorealistic close-up of a SMALL pat of pale yellow butter melting in a clean dark frying pan. Only a little butter, not a whole block; recognizably butter with soft solid center and slight melted golden edge. No other ingredients, no hands, no utensils, no labels, no text, no logos or watermark. Soft natural studio light, uncluttered background, square composition, subject clearly visible when reduced to a thumbnail.
