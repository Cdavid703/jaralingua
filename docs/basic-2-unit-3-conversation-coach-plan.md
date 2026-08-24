# Basic English Course 2 — Unit 3 Conversation Coach: Around the World with Ava

## Core rule

Ava asks **one clear question or task per interaction**. No turn contains two student questions or two different tasks.

## Student path

1. Introduce yourself.
2. State a place preference.
3. Name one place.
4. Describe it with two adjectives.
5. Make one comparison.
6. Give one recommendation with a reason and, if possible, a superlative.
7. Ask Ava one question.
8. Ask Ava one different question.

## Learning and technical design

- Character: Ava Park, a new professional travel-club conversation partner.
- Guided Rehearsal and Real Conversation modes.
- Eight fixed connected turns, unlimited re-recording, microphone preflight, audio speeds 0.75x / 1x / 1.25x, transcript, private 50-point formative report, and no teacher submission or grade.
- Ava uses ElevenLabs professional audio for the welcome, prompts, reactions, recovery messages, closing, and contextual answers to the student's questions.
- English-only transcription endpoint: `/api/english-basic/pronunciation-assessment`.
- Dedicated visual: `assets/img/english-basic-2/unit-3-around-the-world/ava-around-world-conversation-coach-hero.png`.
- The standard responsive coach hero remains in normal document flow: it must not become fixed or sticky on phones or tablets.