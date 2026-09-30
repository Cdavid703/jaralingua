# Countable or Uncountable — relevant, larger pictures

## Change

The original 70×58px thumbnails were too small. Some pictured quantities contradicted their prompts: three tomatoes for two, several eggs for one, a cut avocado instead of two whole fruit. Coffee servings and the living chicken question had no image; two cups of rice reused a single rice bowl.

- All 15 questions now have a relevant picture.
- Eight new professional photographs: two tomatoes, one egg, two whole avocados, a small amount of oil in a pan, pouring water, two coffees, one living hen, and two measuring cups of rice.
- Retain relevant existing rice, bread, three apples, cheese, cooked chicken and four-carrot images. The existing rice image is appropriate for both rice-as-food questions.
- Picture panels are 200–230px high, with object-fit contain and no crop. On sufficiently wide cards, picture and answer choices are adjacent; on phones/tablets they stack within each card.
- Tap/click a picture to open a large centered dialog; close button, Escape, backdrop close, focus restoration and scroll cleanup. Show the question number, not the answer, in the enlargement.
- English accessible descriptions, descriptive enlarge buttons, 44px+ controls.
- Keep the shared question engine and all question wording/scoring unchanged. An activity-specific adapter supplies images before render and enhances each new attempt. No shared CSS/JS changes and no student data access.

## Files

Page: ingles/basico-2/practice-unit-6-countable-uncountable-food.html.
Scoped styles: assets/css/basic2-countable-responsive.css.
Adapter: assets/js/basic2-countable-pictures.js.
New assets: assets/img/english-basic-2/countable-food/*.png.
Regression test: tools/test_countable_pictures.cjs.

## Generation provenance and prompt set

Built-in image generation, one call per asset. Original outputs retained in the Codex generated-images directory; selected originals copied to the asset paths above, without overwriting the earlier food library.

Common prompt: Use case: scientific-educational. Professional realistic food photography for an adult English course, high-quality natural soft light, simple uncluttered warm neutral backdrop, main subject fills frame with small safe margins, square composition. No text, letters, watermarks or logos. Pedagogical accuracy is essential. Scene:

- two-tomatoes.png: Exactly TWO whole ripe red tomatoes, clearly separated, on a pale ceramic plate. No other food.
- one-egg.png: Exactly ONE whole unbroken brown egg, centered on a pale ceramic breakfast plate. No extra eggs, shells or other food.
- two-avocados.png: Exactly TWO whole uncut avocados, clearly separated on a light wooden board. Both intact, no halves, no slices, no extra fruit.
- oil-in-pan.png: Close view of a black frying pan holding a small golden puddle of cooking oil. A chef's hand tilts a small plain glass oil cruet above the pan, a thin trickle pouring into the puddle. No other ingredients. Focus on oil as an amount, not containers.
- water.png: Close view of clear water pouring in a visible stream from a plain glass jug into a clear drinking glass, light blue background. Focus visually on the liquid, ripples and droplets; no bottles or labels.
- two-coffees.png: Exactly TWO plain ceramic cups, each filled with coffee, on a small cafe table. Clearly separated, two cups and two matching saucers only, no other drink, no food, no people.
- one-hen.png: Exactly ONE living brown hen standing naturally in a tidy farmyard with softly blurred fence in background. Entire bird visible, realistic proportions, no other birds, no eggs, no cooked food.
- two-cups-rice.png: Exactly TWO identical measuring cups with clearly visible handles, each filled level with uncooked white rice, side by side on a kitchen counter. No loose rice piles or extra containers; both cups completely visible. No text or numerals.

## QA and publication boundaries

WebKit and Chromium checks target 360×800, 390×844, 768×1024, 820×1180, 834×1194, 1024×768, 1180×820 and 1440×1000. Check all assets, 15 image buttons, visible image sizes, card bounds and no overlap, centered dialog and cleanup, mutable answers before/after checking, reset enhancement, and scrolling hero. Inspect generated pictures and mobile/tablet/desktop screenshots. These tests emulate devices, not physical iPads.

Use COUNTABLE_BASE_URL to repeat checks on production. Publish only the scoped activity files and new images after tests, under the owner's standing authorization. Do not include the pending Stone Soup book, pronunciation, backend or index changes.
