# Greenford News · Unit 6 vocabulary activity

Original fictional illustrated report, linked from the vocabulary at the start of the Unit 6 explanation and from Practice Lab, Unit 6. Twelve distinct scenes teach headline, reporter, witness, flood, damage, warning, rescue crew, shelter, supplies, source, statement and evidence. Thirty-three selected words and phrases provide Spanish on hover/focus and pronunciation on click/tap.

The teacher can pause after each scene, reveal a word definition and an oral observation prompt, hide captions, revisit any scene, or play all twelve narration tracks in sequence. The vocabulary shelf contains twelve illustrated cards. The television and the ten comprehension questions can be projected using the same controls and native dialog; full screen is optional where supported. Small image previews use contain and bounded heights. The page includes the shared access QR and authentication.

Ten A/B/C questions refer only to the fictional report. Learners must answer all ten before checking. Feedback includes the correct letter, a short explanation and a link back to the relevant scene. Retry clears the answers. Results are memory-only private practice: no submission, gradebook writes, saved student data or exam access changes.

This is an illustrated vocabulary learning story with public captions requested by the teacher, not a restricted listening assessment. Its narration and learning captions are intentionally available to all learners. It does not expose an existing assessment transcript.

## Assets and reproducibility

- Content: `assets/data/english-intermediate2-unit6-newsroom.json`.
- Builder: `tools/build_intermediate2_newsroom.py`.
- Images: twelve original built-in image_gen illustrations in `assets/img/english-intermediate-2/unit-6/newsroom/`; full prompts, output hashes and dimensions in `english-intermediate2-newsroom-image-prompts.json`. Original PNG copies remain in the untracked `output/imagegen/unit-6-newsroom/` folder.
- Narration: one Sarah voice reads the report as a narrator, not a multi-character cast dialogue. Forty-one new ElevenLabs files include twelve scene narrations, ten questions and nineteen vocabulary clips; fourteen existing word clips are reused. The gym clip says “The school gym” to provide context rather than leave the homophone ambiguous to transcription QA.
- Audio manifests and Scribe audit: `ingles/intermediate-2/audio/unit-6-newsroom/`.
- Commands: `python3 tools/generate_intermediate2_newsroom_audio.py`, `python3 tools/audit_intermediate2_newsroom_audio.py`, `python3 tools/build_intermediate2_newsroom.py`.
- Functional and layout checks: `tools/test_intermediate2_newsroom.cjs` (320–1920 px and touch); shared 48-page contract and Sign in audit. The browser test checks all twelve images, hover without click, audio, projection/restore, captions, sequential playback, ten-question scoring/retry, catalog discovery and audio failure feedback.

Future additions should use new versions for changed published media, keep each scene visually distinct, and retain ordinary study-sized images plus intentional projection.
