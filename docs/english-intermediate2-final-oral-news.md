# Live News Report final oral assessment

The teacher approved an in-class news performance for teams of 2–4, replacing the previous two-journalist/two-disaster format. This page publishes the brief and a fictional classroom model; it does not open other protected exams, create a submission endpoint, write grades or change academic data. Assessment is individual, /50 across the existing five criteria; course weight remains 20%.

The page is `ingles/intermediate-2/final-oral-live-news-report.html`, linked from Evaluations and the Final Oral entry in Course Overview. The existing October 17 six-step route remains intact. This release also finishes publishing the previously committed English route labels.

Six cards begin face down. Each next card becomes available after revealing its predecessor; revealed cards can be revisited. The projector has previous/next, fullscreen, a dialogue toggle, English role-labelled model and five Spanish hover/focus vocabulary meanings per scene. Rehearsal mode removes the model dialogue from cards and disables it in the projector. Classroom reading is explicitly distinguished from the no-reading assessment. The page keeps its live classroom dialogue. A separately delivered first-scene demonstration video now includes Chris TTS at the teacher’s explicit request; see the Remotion update below.

Teacher setup assigns actor names for this visit, with no persistence or submission. Four fictional characters are David (presenter), Mia (studio), Leo (field) and Ana (witness). David’s provided photo is used with permission as the generated presenter/reporter visual reference; it does not imply that the model’s roles are the same character. The original portrait is not copied into public assets.

## Videos and delivery limits

Three completed HeyGen videos are hosted locally and on the site under `assets/video/english-intermediate-2/final-oral-news/`. The teacher explicitly requested their integration, commit, push and publication on 16 October 2026, including the portrait-based presenter and reporter.

- Card 1: `01-studio-heygen-v1.mp4`, 12.288 seconds, 1280 × 720, Chris, HeyGen `deb454e1c457d64f08bd790870112b22`.
- Card 2: `03-flood-heygen-v1.mp4`, 8.083 seconds, 1344 × 768, ambient flood footage, HeyGen `c70a28a8e7ac4cf78b583a14f5301570`. Its poster is a frame extracted from this video.
- Card 3: `02-field-heygen-v1.mp4`, 19.080 seconds, 1280 × 720, Chris, HeyGen `17fcb53a6ba993e68c3423a92cab5957`.

The user canceled the interview video in favor of flood footage. Cards 4–6 retain still images and live dialogue; no opening or field narration is reused for the closing. The two speaking clips retain HeyGen’s free-plan watermark. The earlier Remotion animated still is historical and not used by this page.

Reveal a card for native video controls, or open its projector. No autoplay; only one video plays at a time. Rehearsal mode shows still images only, hiding both model dialogue and video answers. The projector offers “Show still image” for live speech, and a playback error falls back to the image. The teacher requested a student-facing cleanup: published videos are the only clip source, and the local-file override controls and Markdown downloads are retired. Students prepare a prompt for one short event clip and speak live during the assessment.

## Image provenance

Generated with the built-in image_gen tool using the user-provided portrait as an identity reference. Outputs were visually reviewed and converted to WebP without cropping; resolution 1672 × 941. Three asset names: `studio-v1.webp`, `field-v1.webp`, `interview-v1.webp` under `assets/img/english-intermediate-2/unit-6/final-oral-news/`.

Common image prompt: “Photorealistic horizontal 16:9 educational news photograph. Reference image is the identity reference for the male presenter: preserve his facial identity, face proportions, brown eyes, eyebrows, nose, short dark hair, hairline, beard, natural skin tone and age. Do not beautify or reshape. Natural realistic texture, not illustration. Fictional classroom news scene. No text, logos, captions or watermark. Face clearly visible.”

Studio: “The same man wears navy blazer over plain black shirt at navy and teal modern newsroom desk, looking at camera, relaxed hands with no papers, mid-shot waist up, studio screen with blue globe and a small flood picture. Soft professional studio lighting. Full head visible.”

Field: “The same man wears a dark navy waterproof jacket over black shirt, holding an unbranded microphone at chest level, standing on safe dry raised ground by a fictional town after a flood. Muddy water in street, low houses with water marks, a small rescue boat with two adult helpers. Grey sky and daylight. Medium wide shot, visible face and scene. No injuries.”

Interview: “The same man wears dark navy waterproof jacket over black shirt, holding an unbranded microphone towards Ana, an adult woman with medium brown skin, shoulder-length dark curly hair, yellow raincoat, blue jeans and small dark blue bag. They stand on safe dry raised ground outside her home near a flooded street with low houses and a small rescue boat. Both faces clearly visible in a medium two-person shot. She looks worried but safe. Daylight grey sky, realistic documentary image. No injuries.”

## Validation

Use `tools/test_intermediate2_final_oral_news.cjs` for five viewport sizes, actual hosted playback in cards and projector, the official Evaluations entry, no legacy downloads or file inputs, sequential reveal, keyboard/projector, rehearsal separation, names, hover/focus vocabulary, real hosted video playback, QR and projected guide. Run the 57-page contract and all-course Sign in test at mobile/tablet/desktop. Check the published page and hashes after selective deployment.

Canonical QR URL: https://www.jaralingua.com/ingles/intermediate-2/final-oral-live-news-report.html

The former Markdown and text prompt files are historical resources and have no active links on the exam page. The teacher retired this download workflow. The page opts out of shared draft capture via `data-jaralingua-managed-draft`; cast names and rehearsal state are ephemeral.

## First studio video with Chris (16 October 2026)

At the teacher’s request, `tools/remotion-news/` builds `assets/video/english-intermediate-2/final-oral-news/01-studio.mp4`: a 14-second Full HD animated still using the approved portrait-based studio image, slow camera push-in, permanent fictional-classroom label and the complete scene-1 narration. Voice: ElevenLabs catalogue Chris, never cloned David. The source MP3, settings, checksum and exact-match Scribe audit are in `ingles/intermediate-2/audio/unit-6-final-oral-news/`. No lip sync or new body gestures are generated. This is a demonstration clip with voice, superseding the silent-video instruction for this delivered example only. It is supplied separately for selection through the existing local clip controls; the closing scene must not reuse its opening narration. The other two videos remain pending.

## Readable projection and topic choice (16 October 2026)

The teacher expanded the assessment to one natural disaster **or another Unit 6 news event**. Eight explicit choices: flood, earthquake, hurricane, drought, wildfire, landslide, a council announcement about community-library repairs, or a concert announcement. These come from the unit’s disasters and political/entertainment discussion sections. Each choice includes a Spanish name, simple scenario, useful vocabulary and verb + preposition support. Students choose their story; the flood remains the example. A participant, fan or resident can be interviewed for non-disaster topics; the live roles, simple vocabulary, follow-up questions and individual reported-speech requirements remain.

The language guide now projects four separate slides: preposition combinations, direct/reported comparison, a practice sentence with a revealable answer, and a concert example. Topic choices project one at a time (eight slides); assessment instructions project in five short steps. Navigation uses Previous/Next or arrow keys, with a counter and full-screen control. Only one slide is visible; body text reaches 34 px at 1366 px and 44 px at 1920 px. Guide navigation does not reveal story cards, and returning to a story restores its video/dialogue controls.

`tools/test_intermediate2_news_guides.cjs` checks all slides at phone, tablet, 1366×768 and 1920×1080, including TV text size and no required scrolling, eight topic options, answer reveal, focus return and separation from the story/video controls. Keep the existing video regression and 57-page contract checks.

## Student-facing final assessment audit (16 October 2026)

The teacher asked to remove obsolete content and clearly identify the page as the final evaluation. Evaluations now labels and links “Final Oral Assessment — Live News Report”; Course Overview uses the same assessment wording. The page hero states “Final Oral Assessment” and the 20% weight. The brief and eight topic choices precede the classroom demonstration, with clear hero links to instructions, topics and example.

Removed both Markdown download links, download/sign-in instructions, local video upload/replacement controls and their JavaScript. Retained role assignment, three hosted videos, eight topics, readable projectors and grading criteria. Preparation now asks for one approximately eight-second event video, with optional ambient sound, plus still studio/interview images. The narrated demonstrations do not replace students’ live exam speech. No exam activation, grading or account permissions changed.
