# Basic English Course 2 - Unit 2 Conversation Coach Plan

## Activity identity

- **Activity title:** Shopping with Ella
- **Character:** Ella Brooks
- **Course:** Basic English Course 2
- **Unit:** Unit 2 - Shopping Experiences
- **Practice Lab number:** Activity 06
- **Activity type:** Conversation Coach
- **Teacher delivery:** none. Private formative report only.
- **Score:** private `/50`, stored only in the learner's browser history.

## Pedagogical purpose

This coach gives students a coherent oral conversation that starts naturally and increases in complexity. Ella does not begin by asking about clothing. She first introduces herself, creates a reason for the conversation, proposes an after-class plan, then moves into place choice, mall activity, clothing, shopping decisions, demonstratives, and a final role-reversal turn.

Conversation progression:

1. Friendly start / after-class context.
2. Choosing where to go.
3. Choosing what to do there.
4. Talking about clothes or a small shopping decision.
5. Student asks Ella two questions.

## Required image

- **Hero:** `assets/img/english-basic-2/unit-2-shopping-experiences/ella-brooks-conversation-coach-hero.webp`
- **Portrait:** `assets/img/english-basic-2/unit-2-shopping-experiences/ella-brooks-conversation-coach-portrait.webp`
- **Constraint:** both files must come from the same generated master image for identity consistency.
- **Generation mode:** built-in ImageGen.

## Audio requirement

- **Source script:** `ingles/basico-2/audio/unit2/conversation-coach/ella-shopping-scripts.md`
- **Generation script:** `tools/generate_english_basic2_unit2_ella_conversation_coach_audio.ps1`
- **Output folder:** `ingles/basico-2/audio/unit2/conversation-coach/`
- **Voice:** Ella, female American English voice from `tools/elevenlabs_voice_cast.basic-integrated.json`.
- **Browser speech synthesis:** prohibited.
- **Speeds:** `0.75x`, `1x`, `1.25x`.

## Technical requirements

- Page file: `ingles/basico-2/conversation-coach-unit-2-shopping-ella.html`
- Data file: `assets/js/conversation-coach-data/english-basic-2-unit-2-shopping-ella.js`
- Shared engine: `assets/js/conversation-coach-v2.js`
- Must appear in Practice Lab Unit 2 as Activity 06.
- Must be linked from the Unit 2 teaching page.
- Must not submit to the teacher or create a Grades record.
- Must use `/api/english-basic/pronunciation-assessment` for temporary transcription.
- Must include a microphone preflight, device selector, level meter, transcript, feedback, retry, and private report.
- Hero/banner must scroll with content on mobile and tablet; it must not be fixed or sticky.
- Sign in remains in the top navigation, not as a floating button.
- Responsive for mobile, tablet, laptop, and desktop.

## Acceptance checklist

- [x] Conversation has a coherent ascending sequence.
- [x] Ella is a new character, not Mia.
- [x] Page loads unique Ella hero and portrait images.
- [x] 26 ElevenLabs MP3 files exist and load.
- [x] Question bank has 8 meaningful questions.
- [x] Full attempt has 5 connected turns.
- [x] Student role-reversal turn is mandatory.
- [x] Activity remains private and formative.
- [x] Local and production checks pass after deployment.
