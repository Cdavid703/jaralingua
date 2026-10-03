# Unit 5 · A Good First Impression — Conversation with David

## Teacher decisions

Twelve connected stages rehearse the themes of **First Impression · Final Writing Task (20%)**. The visit to the partner’s family is **this coming weekend**, and the final voice message is sent to a best friend **before the visit**. This oral rehearsal does not open, change or submit the written exam. The short prompts do not require 200 words; the last voice message permits 180 seconds and asks for the learner’s own ideas, not a memorised written answer.

Sequence: introduction; feelings and reasons; worries or confidence; preparation; appearance; thoughtful behaviour; topics and an actual question; sensitive topics; greeting at the door; politely asking for repetition; a question to David; a friendly voice message with feelings, plans, topics, connectors and closing. Four evidence-selected follow-ups produce sixteen recorded responses in a complete attempt. A focused retry can cover two turns.

The teacher rejected using his real photograph and authorised a fictional image. The displayed character is David Rivera. The portrait is generated and is not claimed to depict the voice owner.

The initially selected professional David voice `lqmA2lllpIyWXva8pF0q` returned `voice_not_fine_tuned`. On 2 October 2026 the teacher explicitly asked to try the other David voice and continue. The released audio uses **David, cloned, `pv8WYYW60prEkDbDXyC0`**, owned by the teacher, with `eleven_multilingual_v2`. It must not be described as the unavailable professional voice.

## Interface and behaviour

- One coach portrait, current topic, one prompt, recorder and transcript. Help, microphone settings and detailed feedback are collapsed.
- Guided rehearsal offers “Help me answer / Ayúdame a responder”: frame, possible response, vocabulary and grammar cue. Real conversation hides support and delays feedback until the report.
- Every usable response leads to a recorded reaction. Specific feeling routes include negation handling, so “not nervous” does not trigger the nervous reply. Main-turn reactions play before follow-up questions.
- The name is not scored and can be corrected without treating a proper name as a pronunciation error.
- Familiar questions about clothes, nerves, preparation, boundaries, behaviour and conversation receive a relevant prerecorded reply. An unrelated/unrecognised question prompts clarification. Questions asked during an answer do not silently complete that stage: David answers and returns to the pending prompt.
- This is a guided, prerecorded conversation with explicit routing, not an unrestricted generative assistant. The route bank and its limits are visible in the source. Open answers are evaluated by formative language cues; these are approximate, not proof that every detail was understood.
- Audio speeds: 0.75×, 1×, 1.25×. Questions and replies can be replayed. No browser speech synthesis.
- Microphone preflight, input selection, level meter, timer, stop, playback, re-record, retry transcription and continue unscored. The fixed dock mirrors recording state and page padding permits scrolling the last content above it.
- Shared course navigation, header sign-in, and a canonical QR that opens enlarged on mobile and desktop.
- Recordings are temporary browser blobs sent to the existing transcription service. No audio is stored in localStorage. Only the written report and recent scores are saved locally. No teacher submission and no gradebook record.
- The introduction is excluded from estimates. Missing confidence stays unknown; there is no invented pronunciation estimate. The report states its coverage and approximate nature.

## Files and reproduction

Page: `ingles/intermediate-2/conversation-coach-unit-5-david-first-impression.html`.

Content and response routing: `assets/js/conversation-coach-data/english-intermediate-2-unit-5-david.js`. Shared engine additions are opt-in configuration hooks; existing coaches retain their configuration defaults. Layout: `assets/css/intermediate2-david-coach.css`.

Audio scripts and provenance: `ingles/intermediate-2/audio/unit-5-david-coach/models.json`. There are 57 coach utterances, including welcome, instructions, questions, follow-ups, replies, recovery, and closing. Run `node tools/build_david_coach_audio.mjs`, `python3 tools/generate_david_coach_audio.py`, and `python3 tools/audit_david_coach_audio.py`. The generator only sends public scripts and reads the ignored local key file. Generation is resumable by hashes; changed text invalidates its previous hash. The audit checks every recording against the script and treats British/American spelling variants as equivalent, without ignoring missing or added words.

## Validation

`node tools/test_intermediate2_page_contract.mjs` covers all 46 pages, authentication, responsive styles and QR assets.

`node tools/test_david_coach.cjs` uses Playwright with a synthetic browser microphone and explicitly mocked transcription for deterministic interaction tests. It checks all twelve stages, four follow-ups, name correction, questions during an answer, negated feelings, record/stop from the dock after scrolling, preflight, retry, silence, permission denial, continue unscored, absent confidence, guided/real modes, private report, existing engine defaults, all MP3 hashes/decoding, QR dialog and widths 360, 390, 768, 1366 and 1920. Use `DAVID_BASE_URL` to target a served checkout or production. `PLAYWRIGHT_MODULE` and `PLAYWRIGHT_BROWSERS_PATH` allow the installed runtime to be selected without hardcoded machine paths.

`node tools/test_david_coach_live.cjs` checks real playback of the welcome, question, reaction and replay; a Spanish proper name; mobile Sign in bounds; QR enlargement; and the nine-activity Unit 5 catalog. Its single synthetic learner transcript is mocked separately from actual MP3 playback.

The real production transcription endpoint was separately tested with the generated public David preview (no student recording): it returned the correct English text and 26 word confidence records. This live integration check is distinct from mocked browser scenarios. The browser fake microphone verifies mechanics; a real human/device recording cannot be certified by the fake-device test.

No credentials, academic records, private submissions or unrelated pending work belong in this release.

## Portrait provenance

Asset: `assets/img/english-intermediate-2/unit-5/david-coach/david.png`. Generated with the built-in image generation tool; one master image is reused by CSS for portrait/card crops.

Prompt: “Use case: photorealistic-natural. Asset type: single square master portrait for an English conversation coach website. Primary request: a fictional male teacher called David, approximately 40, friendly Colombian appearance, short dark hair with a little gray, neatly trimmed beard, wearing a simple navy overshirt over a cream T-shirt. Seated at a quiet bright living-room table, softly blurred bookshelf and plant in background, warm welcoming expression, looking at camera as if talking with a learner. Natural editorial portrait, realistic skin texture, soft window light. Head and upper torso centered, generous framing that supports both square portrait and wide CSS crop. No text, no logo, no watermark. Entirely fictional person, not a representation of any actual individual.”
