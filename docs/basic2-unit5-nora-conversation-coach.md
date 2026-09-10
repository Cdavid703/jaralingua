# Unit 5 activity 07 — A Memory with Nora

User-approved implementation request: a conversation coach with only the useful controls and minimal surrounding text. This compact profile overrides the standard's long onboarding/sidebar and floating-dock defaults. The existing recording/transcription/report engine is reused; no teacher delivery or Grades record is added.

## Learning sequence

Eight fixed connected turns, one question/task per interaction, not a randomly selected bank:

1. Name, a natural greeting.
2. How the learner is today.
3. Transition through Nora's old photo to a remembered place (I was / we were).
4. Who was there; being alone is valid.
5. Describe the place and optionally feelings/reasons.
6. Was everything perfect? Affirmatives and negatives are accepted without forcing an invented problem.
7. One later event, recycling Unit 4 past actions and Unit 5 went back / got over. The taught idiom had the time of my life is available in support.
8. Learner asks Nora ONE question; her recorded response matches a recognized trip topic.

Real or imagined memory, usually one or two sentences. No present perfect, past continuous or used to. Optional two short answer frames, a compact vocabulary bank and one grammar tip are collapsed for every turn. No requirement to reproduce the model answer verbatim.

Nora's reactions are scoped to the current question. Specific alternatives recognize a difficult day, being alone, a perfect day or getting over a fear. Fallback reactions do not invent learner details. Nora's own story is consistent: a sunny three-day seaside village trip last summer with her sister, late buses, walks and fresh fish. The last turn recognizes weather, company, place, time, feelings and actions, and asks for clarification rather than pretending to understand an unknown topic.

## Clean interface contract

- Horizontal compact full-width hero with a unique professional character image and QR inside its copy.
- No sidebar, outcomes strip, repeated portrait/welcome panel, long planner, rubric sidebar, 0% labels or floating microphone dock.
- Header and hero scroll away normally; controls never overlay the conversation.
- Active desktop layout: question/support/reaction beside recorder/transcript/feedback. Mobile/tablet stack; support and microphone settings are initially closed.
- Keep record, stop, retry, transcription recovery, playback, microphone selector/meter, timer and clear status messages.
- Feedback: one short message; example/checks/criterion scores in a closed details element. Report detail and history also closed initially.
- Private /50 estimate with unlimited retries, not a course grade. No score for an unusable transcript. Pronunciation confidence is approximate, not a phonetic diagnosis.

## Audio and feedback

All 32 spoken clips are ElevenLabs, one consistent adult female American English voice (Sarah / EXAVITQu4vr4xnSDxMaL), multilingual v2 with language_code en. Speeds: 0.75x, 1x and 1.25x. No browser speech synthesis. Exact scripts live in config.audioScripts in assets/js/conversation-coach-data/english-basic-2-unit-5-nora-memories.js; tools/generate_basic2_nora_coach_audio.ps1 generates those scripts without headings or labels.

The shared engine adds opt-in compact UI flags, configurable one-question role reversal, was/were question-starter recognition, regex/word-count evidence checks and config-scoped grammar feedback. Nora detects selected common errors (I were, they was, did you was, goed/getted and was + past action), explains the correction, and lowers the language estimate. These checks are formative heuristics, not a complete grammar or semantic assessment. Existing coaches keep their default support/dock/feedback behavior.

## Image provenance

Built-in image generation; unique photorealistic editorial portrait of Nora Bennett, chestnut hair, teal cardigan and cream top, seated with a photo album in a quiet café, warm window light, relaxed eye contact, no text/logos/UI. One landscape master image is used for the hero and CSS-cropped small avatar. Asset: assets/img/english-basic-2/unit-5-nora-coach.png. No image recycled from another activity.

## QA

Run tools/test_basic2_nora_coach.cjs. Check all MP3s decode, 8-turn order, exactly one question/task per turn, speeds, short answers, transcript, grammar feedback, one-question recognition, response branches, recording retry, failed/foreign-language transcription recovery, no submission requests, no audio in storage, responsive widths, full-width layout, scrolling hero, closed support and hidden dock. Microphone UI tests use the browser's synthetic microphone and a mocked transcription response, not a student's real recording. All 32 MP3s decoded (1.11–10.40 seconds). A live service smoke test transcribed nora-03.mp3 in English and matched its full approved question exactly.
