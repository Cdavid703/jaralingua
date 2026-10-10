# News Quest · Unit 6

Private practice at `ingles/intermediate-2/practice-unit-6-news-quest.html`, linked from Practice Lab → Unit 6 → pronunciation. Uses the twelve Greenford News words and existing illustrations. No teacher submission, gradebook entry or academic grade.

## Three trophies · 9 October 2026

The teacher requested separate challenges presented as trophies. The map offers direct access to all three in suggested order; students can replay any challenge. Progress and trophies stay in memory for the current visit only, avoiding another student's results on shared devices.

1. Vocabulary: twelve tasks, six picture-to-word and six sentence gaps, one per word.
2. Listening: twelve tasks, six listening-to-picture and six listening-to-word, one per word. Listening tasks play only the target word, never the generic question.
3. Pronunciation: twelve tasks, four word models, four sentence models and four image recall prompts. A pronunciation trophy requires all twelve words to be verified automatically during a full round. Skipped turns or self-reflection cannot earn it. The optional sentence round remains available.

Vocabulary/listening trophies celebrate completing a full practice round, not mastery or a grade. First-attempt results remain visible. One additional review per difficult word is inserted after three intervening tasks where possible; review stays within the selected skill. Partial difficult-word reviews do not award a full-round trophy.

Trophies animate with brief confetti and synthesized success tones. Effects can be disabled; reduced-motion preferences suppress animation. Optional twelve-word study cards retain Spanish on hover/focus/tap and ElevenLabs pronunciation on click. Choices are labelled A/B/C and contain no translation hints before answering.

## Automatic voice feedback and limitations

The existing same-origin `/api/english-intermediate/pronunciation-assessment` service runs local Whisper. On stopping a valid recording, the activity sends raw audio to that endpoint and compares recognized tokens with the expected word or sentence, in order. Case and punctuation are ignored. It displays the actual transcript, matched/missed words, and the existing word-specific sound/stress tip. Exact normalized words with no extra tokens pass. It does not use recognition confidence as pronunciation accuracy or invent phonetic scores. The UI explicitly labels this as word recognition, not individual sound or accent assessment. The teacher was informed of this distinction while a separate detailed phonetic service option was offered.

A mismatch allows another recording; it does not automatically complete the turn. Empty/quiet input, service failure and rate limiting show a retry message rather than a failed pronunciation grade. Transport retries reuse the current recording explicitly. A 90-second timeout and AbortController cancel stale requests when the learner changes views, skips or advances. Recording permissions and streams are cleaned up even if they arrive late. Recordings are limited to ten seconds.

The existing service processes temporary audio locally and discards it; no external speech provider receives recordings. The page tells students before recording that audio is sent to Jaralingua. No audio or transcript is stored in localStorage or submitted to a teacher. Retry/advance clears browser Blob URLs. A no-microphone path allows oral rehearsal and reflection without earning verified credit.

## Spoken questions and media

All language models are ElevenLabs Sarah. The existing 29 clips (twelve sentences, five generic prompts and twelve cloze clips) plus twelve reused word clips remain unchanged. Non-listening questions play automatically. Cloze clips say “blank”; picture recognition never speaks the answer. Image recall hides the model until requested. Stop, mute, advancing or recording cancels the audio queue. Autoplay restrictions expose a manual retry. No browser speech synthesis.

## Sources and tests

- Page builder: `tools/build_intermediate2_news_quest.py`.
- Content builder: `tools/build_intermediate2_news_quest_content.py`.
- Behavior/style: `assets/js/english-intermediate2-news-quest.js`, `assets/css/english-intermediate2-news-quest.css`.
- Catalog: `assets/data/english-intermediate-2-content.json`.
- `tools/test_intermediate2_news_quest.cjs`: six widths 320–1920, QR, Spanish hints, separated full rounds, bounded review, trophies, synthetic MediaRecorder input with mocked recognition, wrong answers, service retry, skipped credit, quiet/denied/late microphone, track cleanup, reduced motion, data failure.
- `tools/test_intermediate2_news_quest_questions.cjs`: seven prompt types across the three challenges, listening exception, no premature answer, queue cancellation, autoplay recovery at phone/desktop widths.
- Shared page contract: all 49 course pages. Header, authentication and QR components unchanged.
- Live recognition smoke check on 9 October: all twelve existing public word-model MP3s returned their expected words through the public endpoint. This verifies connectivity/model compatibility, not accuracy across student accents or recording conditions. No student recordings were used.
