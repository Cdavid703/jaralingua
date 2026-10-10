# Unit 6 · My opinion matters

Teacher-approved visual preparation for a five-question round table. Published entry point: `conversation-coach-unit-6-my-opinion-matters.html`, Practice Lab → Unit 6 → Conversation Coach. Reuses the shared conversation engine, recording/transcription path, navigation, authentication and QR.

## Learning design

Five original fictional scenes: cropped photograph versus full context; unverified flood warning; filming versus helping; limited shelter supplies; unequal news coverage. Each scene has an observation, an interpretation using looks/seems/might, and one problematizing opinion question. A greeting asks the student's name first and responds with a warm acknowledgement. Sixteen main turns and up to five adaptive follow-ups: ask for a reason when absent, or a possible consequence when a reason was expressed. If the preceding description already mentions a feeling/inference, the interpretation prompt instead asks for visible evidence.

A single current question, large expandable image, expandable question, microphone and transcript. Sentence starters, Spanish word help and spoken possible answers are under Help me answer; examples are a second closed disclosure. Alternative sample opinions avoid imposing one correct position. Image descriptions explicitly separate observation from inference. Different viewpoints, uncertain answers, short answers, unrelated answers, negated worry and common looks/seems errors have prepared reply routes. The route bank is deliberately finite: the page states it is guided practice with prerecorded replies selected from words, not unrestricted semantic understanding. Unknown input gets clarification rather than fabricated agreement.

The final report collects the five opinion transcripts, with a prompt to add a reason or prepare a response to a classmate. Opinions and pronunciation receive no numeric grade. No teacher submission or gradebook integration. Voice is processed temporarily by existing local Whisper; the page writes no audio or transcript to localStorage. The report lasts only for the visit.

## Expressive speech

The teacher explicitly requested audible expression, including exclamations. Voice: authorized cloned David `pv8WYYW60prEkDbDXyC0`; the previously unavailable professional David is not used. New recordings use Eleven v3 with warm, curious, thoughtful or gentle audio direction tags and natural punctuation. Stability 0.5 balances expressive variation. Four fidelity-sensitive clips use Multilingual v2 with explicit per-item settings. Reused canonical vocabulary clips remain their existing ElevenLabs recordings.

Reference: [ElevenLabs prompting documentation](https://elevenlabs.io/docs/best-practices/prompting). Delivery tags are only generation inputs, never visible lesson text. No browser speech synthesis. 115 public MP3s cover questions, replies, alternate follow-ups, examples and new vocabulary. `models.json` records every exact script, generation text, model override, settings and SHA. The Scribe audit checks lexical fidelity; equivalent contractions and documented homophones (Ana/Anna, check/Czech) are normalized. This audit cannot certify perceived emotion or every accent nuance; real playback checks verify that media plays, separately from text matching.

## Image provenance

Five images generated with the built-in image_gen tool. Inspected before integration and saved as WebP in `assets/img/english-intermediate-2/unit-6/opinion-coach/`. Full prompts and tool provenance: `prompts.json` in that directory. Original generated masters remain in the tool's image directory. The previously generated fictional David portrait is reused with no claim that it depicts the voice owner. Images show safe, non-graphic aftermath and people with dignity; opinions remain open.

## Build and checks

- `tools/build_intermediate2_opinion_coach.py`: canonical content and audio manifest, preserving hashes for unchanged generation inputs.
- `tools/build_intermediate2_opinion_coach_page.py`: page from the existing David coach shell.
- `tools/generate_opinion_coach_audio.py`: resumable ElevenLabs generation; `--preview` generates greeting samples only.
- `tools/audit_opinion_coach_audio.py`: resumable script/transcript comparison.
- `tools/test_intermediate2_opinion_coach.cjs`: five scenes, greeting, 16 main/5 follow-up turns, routing/negations, language corrections, inference without repeated question, replay, help, image/question projection, QR, six responsive widths, transcription recovery, no persisted report, no visible scores, all asset URLs and independent actual playback.
- `tools/test_david_coach.cjs`: previous coach and default engine regression coverage.
- `tools/test_intermediate2_page_contract.mjs`: updated to 50 pages, including the new QR asset.
- `tools/test_intermediate2_signin.cjs`: all course pages at five viewport widths, with typing, scrolling, short viewports, Close and Escape; no real login.

Shared engine additions are opt-in hooks for prompt resolution, prompt media, support audio state, formative feedback and report rendering, plus an optional persistence flag. Existing configurations retain their behavior. The practice uses no new server endpoint and does not alter academic records or exam access.
