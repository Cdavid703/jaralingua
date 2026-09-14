# Unit 5 · Activity 08 — Compare the Past

Teacher-led speaking in Practice Lab. Unit 3 comparatives + Unit 5 was/were, recycling weather, clothes, accessories and places. One or two spoken sentences per turn, oral feedback only, no score, no submission. An affirmative response repeats the complete comparison; a negative response corrects the false comparison. Pronunciation is explicitly important.

## Teaching and classroom flow

12 numbered face-down cards, each showing a professional diptych with A/B labels. Two questions per card, displayed ONE at a time by the teacher after selecting a student. 24 questions: 12 true, 12 false, with mixed ordering (not alternating every question) and both singular and plural subjects. Questions and answers are in English. All pictures refer to last Saturday except the picnic comparison (Saturday/Sunday last weekend).

1. Teacher loads Basic English 2 students and unchecks absentees.
2. Open a card; look at both pictures. Teacher may invite brief descriptions first.
3. Spin, then show one question. Students answer using was/were + comparative + than.
4. Reveal the suggested answer only when useful; feedback is oral.
5. Next question selects another student. Complete both to mark the card completed.

Model: green hat USD $20 vs yellow hat USD $35. “Was the green hat more expensive than the yellow hat? No, it wasn’t. The green hat was cheaper than the yellow hat.” Separate ElevenLabs model audio; 0.75×/1.0×, pause/replay. An optional closed word bank supports vocabulary; no additional grammar tense is introduced. Short -er adjectives, bigger doubling, more expensive/more crowded and busier use the comparison patterns of Unit 3. Clean/crowded/quiet have brief English meanings in support. No reliance on inferring temperatures or prices from clothing: values are readable HTML labels. Park noise values match the generated meters (32/78 dB); no safety or hearing advice is implied.

## Visual map and final image prompts

Generated using the built-in image generation tool, not the API fallback. Final images: `assets/img/english-basic-2/compare-the-past/`. Base prompt: professional realistic adult educational diptych, landscape 3:2, two equal panels, straight middle divider, matched camera and scale, crisp details, no logos, no text; values/labels added in HTML. Per-image briefs:

| File | Visual evidence |
| --- | --- |
| backpacks.png | Large blue vs small red backpack, matching benches and bottles for scale. |
| trees.png | Three short young trees vs three taller mature trees, matching bench. |
| buildings.png | Tall blue building vs short yellow building, ground-to-roof views. |
| scarves.png | Two long red scarves vs two short green scarves on equal-height rails. |
| cold-day.png | Cold town in winter vs sunny warm town; HTML 2°C/28°C. |
| warm-day.png | Warm sunny picnic vs cool cloudy picnic; HTML 30°C/16°C. |
| jackets.png | Red vs blue jacket in a boutique; HTML COP $80,000/$120,000. |
| shoes.png | White vs black sneakers on matching displays; HTML USD $90/$40 per pair. |
| parks.png | Reader by a lake vs crowded park concert; visible 32/78 dB meters. |
| shops.png | Many customers in Shop A vs one customer in Shop B. |
| beaches.png | Littered sand vs clean sand at the same beach. |
| streets.png | Busy street with vehicles and litter vs clean quiet street. |
| model.png | Green and yellow hats in a boutique, same camera and scale; separate model prices. |
| hero.png | Friendly teacher and adult learners comparing pictures on a classroom TV. |

Images are unique to this activity; hero is shared only with its Practice Lab card. No answers on card backs. Enlarged images use object-fit: contain to preserve evidence; centered viewport-bounded dialogs, internal scrolling, Escape/back buttons. Every details element starts closed. Header/hero scroll normally; horizontal desktop hero, stacked on smaller screens, full-width content with safe gutters. Grid: 4 desktop, 3 tablet, 2 mobile. SVG QR inside hero copy expands centrally.

## Reliability and privacy

Reuse the authenticated GET `/api/basic2/grades` contract: bearer credential, provider header, server role check. Retain only student ID and name in memory; never store roster, emails or grades. No roster writes. Abort on timeout/account change; reject empty or non-teacher responses; deduplicate by ID (not name). Attendance stays in memory.

Selection uses crypto random values, locks against repeated clicks, skips absent/used students. Explicit new participation round after exhaustion; never automatically repeats. Mark selected IDs immediately after the spin; closing/reopening a card preserves its pending student and question. Wheel resets to zero between pools so pointer and winner agree. Logout cancels active spin and in-flight roster requests and clears names/answer UI. Late responses cannot restore a previous account's roster. Sound and image controls do not change student selection.

Reuse `audio/unit5/yesterday-pictures/card-flip.wav` and `roulette.wav` (ticks plus final chime in one user-gesture-started audio file). Sound toggle available in the modal, no autoplay on load. New model generated by `tools/generate_basic2_compare_past_audio.ps1`, ElevenLabs multilingual v2, English, existing voice EXAVITQu4vr4xnSDxMaL. Keys never enter frontend or reports.

## Verification

`node tools/test_basic2_compare_past.cjs` starts a local server, uses mocked students (never real student mutations), checks all 24 interactions, no-repeat/attendance, repeated clicks, reopens, auth errors/retry/account-switch races, model audio and speed, assets, QR, responsive layouts and Practice Lab registration. Set `COMPARE_PAST_TEST_BASE_URL=https://www.jaralingua.com` for production. Device speaker output still depends on browser/media volume settings.
