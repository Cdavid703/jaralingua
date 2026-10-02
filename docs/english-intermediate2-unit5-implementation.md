# Unit 5 explanation implementation

Published 25 September 2026. User requested strengthened grammar with images, pronunciation and comparisons; explicitly chose simple English throughout.

Public page: https://www.jaralingua.com/ingles/intermediate-2/unit-5-impressions-feelings-and-satire.html

## Pedagogy and scope

Source: Intermediate_Course 2.docx, sessions 11–14. The five grammar strands are developed through meaning, sentence patterns, same-situation comparisons, exceptions and corrected errors: deduction modals; looks/seems/look like; -ed/-ing adjectives; opinion and speculation frames; reason/result/contrast connectors. The page also provides evidence-reading, twelve contextual feeling cards, eight phrasal verbs, four idioms, community/satire models and pronunciation integration. Ten expandable sections in total. The twelve emotion cards reuse six scenes in explicitly hypothetical contexts; they do not diagnose a photographed person’s feelings.

All explanations are in simple English, including semantic distinctions such as may be/maybe, must deduction/obligation, mustn’t prohibition, can’t deduction/ability/rule, because/because of, and although without but. No percentage scale of certainty. No exercises, submission forms or gradebook changes were introduced. Practice Lab implementation remains a separate phase.

## Reused design and behavior

The source shell is Unit 4: unit-4-movies-music-and-reviews.html, the shared site/course CSS, topic accordions, formulas, comparison cards, search and projection styling. New CSS is scoped to the Unit 5 page. Full-width layout reorganizes three comparison cards/four short cards on desktop into two/one columns as space requires. Mobile tables become labeled records rather than tiny horizontal tables.

The existing Unit 5 hero was reused. Six new individual 1536 × 1024 photos are optimized WebP assets, 903,716 bytes total. No sprite cropping is needed in the projector. Word and phrase clicks only play audio; card/image clicks open the projector. Native dialog, previous/next, Escape, focus restoration, optional native full screen and fully visible images support classroom projection. All media is same-origin and compatible with production CSP.

A single audio player stops previous playback. Text controls use the established small speaker mark; global and projector speed controls offer 0.75x and 1x. Source reload on explicit replay resolves a WebKit abort when replaying after opening a modal. Mobile sign-in reuses the shared authentication and local course accounts, with a top-layer panel and visualViewport sizing.

## Audio provenance

143 exact professional MP3s, Sarah / EXAVITQu4vr4xnSDxMaL, General American, eleven_multilingual_v2. Original scripts total 4,878 characters. Audio assets total 5,014,636 bytes and are loaded on demand, not all on initial page load.

Files: ingles/intermediate-2/audio/unit-5-explanation/.
- scripts.md: exact spoken text.
- models.json: IDs, scripts, voice, model, file sizes and SHA256.
- audio-audit.json: every generated MP3 transcribed through ElevenLabs and compared with its reference; 143/143 matches after case/punctuation normalization.
- Generator/auditor: tools/generate_intermediate2_unit5_explanation_audio.py and tools/audit_intermediate2_unit5_explanation_audio.py.

No student recordings or personal data were used. These are explanatory models, not an assessed pronunciation activity.

## Course and library integration

Course Overview Unit 5 now links to the complete explanation. The canonical QR asset is assets/img/page-qr/ingles-intermediate-2-unit-5-impressions-feelings-and-satire.svg, displayed by the shared page-qr-access.js component. Its enlarged rendered image was decoded with ZXing to verify the exact public URL.

The shared ingles/intermediate/idioms.html library receives twelve contextual expressions. The existing Under the weather entry is reused rather than duplicated. All twelve entries render and play. No practice-only catalog item was added for an explanation page. Sitemap publication preserves the live sitemap and adds only the new URL, without including unrelated local edits.

## Verification

- node tools/test_intermediate2_page_contract.mjs: 36 pages; QR SVG and shared auth requirements present.
- tools/test_intermediate2_unit5_explanation.cjs: Chrome at 320, 390, 430, 768, 1024, 1440 and 1920; production Chrome smoke at 390/1440 after final replay fix.
- Same browser test against production in WebKit at all seven widths, plus 844 × 390 landscape.
- All 143 distinct text controls played in Chrome and in production WebKit; speed switching, projection playback/replay, image decoding, previous/next, Escape, returned focus, search filtering/clearing, local sign-in panel visibility and QR dialog were verified.
- tools/test_intermediate2_unit5_library.cjs: all twelve additions playable, no duplicate Under the weather.
- Every MP3 hash matches its audited content. Image assets visually inspected; desktop/phone screenshots inspected. No student credentials or live test submissions used.
- WebKit is a browser-engine test on Windows, not a physical iPhone test. Its native media pipeline bypasses Playwright interception, so media verification was performed against the actual published MP3 URLs.

## Publication

153 new page/media files, then a narrowly scoped two-file WebKit replay correction, then three index files. Atomic file replacement, old-content guards and SHA256 verification. No service restart or API changes.

Backups:
- /var/backups/jaralingua/unit5-page-20260925T215357Z
- /var/backups/jaralingua/unit5-page-20260925T215807Z
- /var/backups/jaralingua/unit5-indexes-20260925T215934Z

All other in-progress workspace changes were preserved. No Git commit or push.

## Image generation method and exact prompts

Method: built-in image_gen, photorealistic-natural, opaque background. Originals retained under the generated-images directory; project copies encoded as WebP without changing their scene content. Full prompts follow. Final assets are in assets/img/english-intermediate-2/unit-5/explanation/.

### waiting

Final file: assets/img/english-intermediate-2/unit-5/explanation/waiting.webp

Photorealistic natural editorial educational photo, landscape 3:2. One adult Latina woman standing at a sheltered city bus stop, visibly looking down at her wristwatch, phone in her other hand, empty seat beside her. A bus visible far away softly out of focus. The evidence must be observable: waiting place and checking the time, but her precise feelings are ambiguous. Natural daylight, realistic anatomy, muted navy and teal clothing, comfortable everyday setting. Medium wide framing with entire person and context safely inside crop. No readable text, no letters, logos, symbols or captions. Standalone scene for an intermediate English grammar lesson about 'She might be waiting for a friend' versus observable facts; not a website mockup.

### tired

Final file: assets/img/english-intermediate-2/unit-5/explanation/tired.webp

Photorealistic natural editorial educational photograph, landscape 3:2. Adult male community volunteer sitting at a wooden table late in the evening after preparing boxes of donated food, visibly yawning with a hand near his mouth. Open eyes slightly tired; colleague softly out of focus tidies plain food boxes behind. Soft warm realistic lighting with muted navy and teal tones, realistic hands and anatomy, medium wide composition with face and context fully visible. This scene supports an English lesson contrasting visible evidence and deduction 'He must be tired'. No text, logos, watermarks, UI or collage.

### presentation

Final file: assets/img/english-intermediate-2/unit-5/explanation/presentation.webp

Photorealistic natural editorial educational photograph, landscape 3:2. Adult female university student moments before giving a short presentation, hands holding plain unlettered note cards, a small uncertain smile and slightly tense posture, two supportive adult classmates seated in soft focus. Classroom setting, no writing anywhere on board or papers. Natural daylight, navy and muted teal palette, realistic anatomy and hands, enough visible context to discuss 'She looks nervous' without treating her feelings as certain. Framing complete upper body and surrounding classroom, no logos, no text, no collage.

### relieved

Final file: assets/img/english-intermediate-2/unit-5/explanation/relieved.webp

Photorealistic natural editorial educational photograph, landscape 3:2. Adult student in a university corridor just after finishing a presentation, gently smiling with relaxed shoulders and one hand over her chest in relief, plain note cards in other hand, supportive adult classmate nearby smiling. Clear, natural expression of relief without exaggeration. Muted navy and teal clothing, warm daylight, realistic faces and hands, medium-wide complete scene. No readable text, logos, watermarks, illustrations, collage or website UI. A standalone photo for an English grammar comparison: nervous before and relieved after a presentation.

### bored

Final file: assets/img/english-intermediate-2/unit-5/explanation/bored.webp

Photorealistic natural editorial educational photo, landscape 3:2. Adult male learner seated in a lecture room, resting cheek on hand and looking disengaged toward a distant presenter pointing at an empty unlettered board, other adult learners softly out of focus. Natural subtle bored expression, realistic anatomy and facial proportions, navy and teal clothing, soft daylight. Medium-wide scene retaining both learner and classroom context. No text, logos, captions or collage. Standalone image teaching difference between 'He looks bored' and 'The talk might be boring'; do not claim the feeling as certain.

### interested

Final file: assets/img/english-intermediate-2/unit-5/explanation/interested.webp

Photorealistic natural editorial educational photograph, landscape 3:2. An adult woman museum guide points to a detailed mechanical model of a small windmill on a table, two adult visitors lean forward attentively with curious natural expressions, hands anatomically correct. Muted navy and teal clothes, warm wood surroundings, natural light. Medium-wide educational scene, subjects safely inside frame and model completely visible. No readable labels, text, logos, captions, collage or UI. Standalone scene for English comparison 'The visitors look interested. The guide is interesting.'



## Modal clarification · 2026-09-25

Expanded only the Course Overview Unit 5 `#modals` section at the teacher's request. Added plain-English meanings for might be, must be and can't be; be as the base form of am/is/are; and a comparison of might/may/could for possibility without a fixed probability ranking. May can sound more formal; could can introduce an alternative or a present-possibility question. Explained all three existing examples with meaning, formula, word roles and transformations: is tired → might be tired; is waiting → might be waiting; knows → might know. Added common errors and transfer of these forms to must/can't. Content remains simple English, with no practice questions added to Course Overview.

Updated the builder so the additions survive regeneration. Verified the HTML outside #modals is identical to the prior page, and all 143 audio model IDs/text/checksums remain unchanged. Existing pronunciation buttons reused. Chrome mobile/desktop checks passed; comparison and form-card screenshots inspected at 390/1440. One HTML page deployed with backup `/var/backups/jaralingua/unit5-modals-clarity-page-20260926T030118Z`.

## Feeling versus cause clarification · 2026-09-25

Expanded only #ed-ing at the teacher's request. Added a simple-English -ed feeling / -ing cause comparison and clarified that a person can take either ending (I am bored / I am boring). Each of the six adjective pairs now labels its feeling and cause examples and gives a short meaning for each sentence. Existing images, cause → effect → feeling flow, pronunciation and error comparisons retained. Added why be accompanies these adjectives and why an -ed adjective does not itself indicate past time; contrasted descriptive boring with progressive waiting. Updated the builder; no exercises introduced.

Verified that HTML outside #ed-ing is unchanged and all 143 pronunciation texts, IDs and checksums are preserved. Chrome mobile/desktop interaction checks passed at 390/1440; screenshots of new content inspected. Single-page deployment backup: `/var/backups/jaralingua/unit5-feelings-clarity-page-20260926T030405Z`.

## Opinion language clarification · 2026-09-25

Expanded only #opinions at the teacher's request. Plain-English meaning and use for I think, I guess, perhaps/maybe and I don't think; qualified comparison without artificial certainty percentages; formula showing that the following idea needs a subject and verb. Expanded both maybe/may be cards with meaning, word roles, placement and equivalent sentences. Added a three-step explanation of the existing respectful disagreement dialogue. Existing audio buttons, errors and other sections preserved; updated builder.

Verified HTML outside #opinions unchanged and all 143 pronunciation texts/IDs/checksums identical. Chrome 390/1440 checks passed; mobile and desktop screenshots of new explanations inspected. Single-page deployment backup: `/var/backups/jaralingua/unit5-opinions-clarity-page-20260926T030624Z`.

## Expression classification and teacher-led picture activity

Unit 5 expressions now explain the phrasal verb/idiom distinction, label all 12 entries (8 phrasal verbs, 4 idioms) and give approximate Spanish meanings. The shared library matches these definitions and preserves inline audio. One Picture, Many Impressions is published in Practice Lab with 20 numbered pictures, teacher-controlled projection, optional model descriptions and audible reminders. See `english-intermediate2-unit5-many-impressions.md` for assets and verification.
