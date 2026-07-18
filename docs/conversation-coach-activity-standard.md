# Conversation Coach Activity Standard

## Purpose

This document defines the mandatory production standard for JaraLingua Conversation Coach activities. A coach is an interactive oral rehearsal, not a page of disconnected microphone prompts. The learner must feel that one consistent character listens, reacts, asks follow-up questions, and closes the conversation.

## Pedagogical cycle

Every coach must follow this sequence:

1. Context and communicative purpose.
2. Professional model question.
3. Optional language support in guided mode.
4. Student recording and temporary transcription.
5. Evidence-based formative feedback.
6. Adaptive follow-up selected from the student's evidence when the activity profile requires it.
7. Student's second response to the follow-up.
8. Character reaction or answer.
9. A final private report and a focused retry route.

Questions must require meaning, not isolated repetition. Each full attempt must balance the unit grammar, vocabulary, functions, and interaction goal. A question bank must not produce four prompts that test the same structure.

## Adaptive follow-ups

- A follow-up must respond to observable evidence in the preceding transcription. It must not be selected randomly.
- Configure at least two routes for each eligible question: one that requests missing evidence and one that extends a complete answer.
- The follow-up must require new meaning. It must not ask the learner to repeat the same answer in different words.
- Keep the prompt short enough for a natural exchange and provide a separate answer frame, vocabulary bank, grammar focus, evidence checks, time limit, and stronger model.
- Every follow-up spoken by the character requires its own approved professional audio file. Browser speech synthesis is prohibited.
- The interface must identify the follow-up clearly and keep the next-turn control disabled until the learner records or explicitly preserves the response as not analyzed.
- The report must separate the initial answer from the follow-up while calculating one transparent average for the turn.

## Character and visual identity

- Give the coach a believable first and last name and a clear conversational role.
- The displayed gender and name must match the ElevenLabs voice used in every audio file.
- Use one professionally generated master image and derive the hero and portrait from the same source so the character remains visually consistent.
- Character states must be visible: ready, speaking, listening, analyzing, responding, and complete.
- Images must support the conversation context. Do not use abstract circles, decorative diagrams, generic stock images, or unrelated recycled artwork.

## Professional audio

- All coach speech must be generated with ElevenLabs and a consistent professional American English voice unless the course specifies another accent.
- Never use browser `speechSynthesis` as a production fallback.
- Never include stage directions, speaker labels, markdown headings, or phrases such as `Narrator says` in the text sent to ElevenLabs.
- Store the exact approved scripts beside the audio assets.
- Required playback speeds are `0.75x`, `1x`, and `1.25x` only.
- Verify every MP3 against its approved script before deployment.
- Confirm that character name, image, voice gender, and accent agree.

## Question bank

- Default bank size: eight meaningful questions.
- Default attempt size: four balanced questions.
- Selection must be skill-balanced, not purely random.
- Include at least one interaction or role-reversal turn when the unit supports it.
- Each question must define answer frames, vocabulary, grammar focus, minimum development, maximum recording time, evidence checks, and an improved model.
- Open questions do not have one correct answer. Feedback must recognize task evidence rather than compare the student with one memorized script.

## Practice modes

### Guided Rehearsal

Show answer frames, vocabulary, grammar focus, immediate feedback, and the character reaction after every turn.

### Real Conversation

Hide language support during the active conversation. Keep the same professional questions and reactions, but reveal detailed feedback only in the final report.

## Microphone and transcription

- Require HTTPS in production.
- Provide a microphone selector, level meter, timer, stop button, playback, and retry.
- Include a microphone preflight before the first attempt.
- Send recorded bytes directly to the configured JaraLingua transcription endpoint.
- Do not store the student's audio on the server.
- Do not create a score when no usable speech is detected.
- If transcription fails, offer: retry analysis, record again, or continue as not analyzed.
- Every button action must produce visible status feedback.

## Formative report

Default rubric: 50 points.

| Criterion | Points | Evidence |
| --- | ---: | --- |
| Task completion | 10 | Required information and communicative purpose |
| Interaction | 10 | Relevant response and questions to the coach |
| Vocabulary and structures | 10 | Unit language used meaningfully |
| Fluency | 10 | Development, duration, and continuity |
| Pronunciation clarity | 10 | Approximate transcription confidence only |

The report must state that automatic pronunciation information is approximate. Noise, names, device quality, and transcription uncertainty can affect confidence. It is not a phonetic diagnosis or an official teacher grade.

## Privacy and gradebook policy

- Conversation Coach practice is private and formative by default.
- It does not submit to the teacher and does not create a Grades record unless a separate approved requirement explicitly adds that behavior.
- Keep only written reports and recent scores in the learner's browser.
- Never persist recorded blobs in `localStorage`.

## Responsive behavior

- Test at minimum: `390x844`, `768x1024`, and `1366x768`.
- No image, header, character stage, support panel, recorder, or floating control may cover another element.
- A floating microphone dock may appear only during an active turn and must reserve enough page space to avoid covering content.
- Buttons must remain at least 44 pixels high and communicate pressed, busy, complete, and disabled states.
- Long prompts and translations must wrap without changing the dimensions of fixed-format controls.

## Required verification

Before deployment, verify:

- Eight-question bank and balanced four-question attempts.
- Adaptive follow-up selection, second-response requirement, and separate report evidence when configured.
- Mandatory interaction turn when configured.
- ElevenLabs MP3 presence, duration, decoding, and script agreement.
- No `speechSynthesis` references.
- Welcome, instructions, questions, reactions, recovery messages, and closing audio.
- Microphone permission, device selection, recording, stopping, playback, retry, and transcription recovery.
- Guided and realistic modes.
- Unlimited attempts, weak-question practice, and attempt history.
- Formative `/50` report and question-by-question review.
- Responsive screenshots and element-overlap checks.
- Navigation entry, production HTTP status, and cache-busted assets.

## Unit 5 implementation profile

The first v2 implementation is `Intermediate English Course 1 - Unit 5: Food, Quantities and Culture` with the character Maya Brooks. Maya uses one professional female American English voice. Every full attempt includes ingredients, quantities, culture, and a role-reversal turn. The first three turns each contain one evidence-based adaptive follow-up, so a complete attempt has four turns and seven spoken learner responses. The adaptive bank contains twelve professional prompts: a missing-evidence route and a complete-answer route for each of six skill categories.
