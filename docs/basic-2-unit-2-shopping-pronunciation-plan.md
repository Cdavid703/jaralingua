# Basic English Course 2 - Unit 2 Pronunciation Activity Plan

## Activity identity

- **Activity title:** Shopping and Concert Pronunciation
- **Course:** Basic English Course 2
- **Unit:** Unit 2 - Shopping Experiences
- **Practice Lab number:** Activity 05
- **Activity type:** Pronunciation
- **Teacher delivery:** follow-up report, weight 0%.
- **Student level:** Basic / A1+

## Pedagogical objective

Students practice the pronunciation of the vocabulary and sentence patterns used across Unit 2: clothes, accessories, concert-location clues, demonstratives, and present continuous actions. The final challenge concatenates all guided sections so students finish by reading the complete unit language aloud.

By the end of the activity, students should be able to:

- pronounce key shopping words clearly;
- distinguish plural endings in words such as `jeans`, `sunglasses`, `tickets`, and `posters`;
- pronounce demonstratives in context: `this`, `that`, `these`, and `those`;
- read present continuous sentences with the /ŋ/ ending in `checking`, `wearing`, `walking`, and `waving`;
- receive word-level feedback before submitting a 0% follow-up report to the teacher.

## Required image

- **File:** `assets/img/english-basic-2/unit-2-shopping-experiences/pronunciation-shopping-concert.webp`
- **Visual concept:** adult English learner practicing pronunciation with a microphone, clothing flashcards, and concert tickets.
- **Constraint:** professional image unique to this activity. Do not reuse the Unit 2 teaching, memory, demonstratives, reading, or audio-listening images.
- **Generation mode:** built-in ImageGen.

## Audio requirement

- **Required audio:** seven professional ElevenLabs model clips.
- **Source script:** `ingles/basico-2/audio/unit2/pronunciation/shopping-concert-pronunciation-scripts.md`
- **Generation script:** `tools/generate_english_basic2_unit2_pronunciation_audio.ps1`
- **Output folder:** `ingles/basico-2/audio/unit2/pronunciation/`
- **Mode:** text-to-speech.
- **Accent:** American English.
- **Rule:** each audio model must match the visible text exactly. The final challenge must contain all six guided sections.

## Sections

1. Shopping words
2. Clothes and accessories
3. Demonstratives
4. Concert locations
5. Current actions
6. Story sentences
7. Final challenge

## Technical requirements

- Page file: `ingles/basico-2/pronunciation-unit-2-shopping-concert.html`
- JavaScript file: `assets/js/english-basic2-pronunciation-unit2.js`
- Must appear in Practice Lab Unit 2 as Activity 05.
- Must be linked from the Unit 2 teaching page.
- Must use `/api/english-basic/pronunciation-assessment` for speech analysis.
- Must use `/api/basic/basic2-unit2-pronunciation-shopping-concert/submit` for teacher report delivery.
- The delivery report must clearly state weight 0 and not affect accumulated percentage.
- The student must be signed in before sending the exercise.
- The activity must support word-level feedback with green recognized words and red missed words.
- Clicking a word should give pronunciation help and try to play an English single-word model through the browser voice.
- The next-section button must unlock only after the current section is evaluated.
- The hero/banner must scroll with content on mobile and tablet; it must not be fixed or sticky.
- Sign in remains in the top navigation, not as a floating button.
- Responsive for mobile, tablet, laptop, and desktop.
- No horizontal overflow.
- The activity must pass `node --check`.

## Acceptance checklist

- [x] HTML loads the Unit 2 image and Unit 2 JavaScript.
- [x] Seven model audio files exist and load.
- [x] Visible text and model audio script match exactly.
- [x] Six guided sections plus one concatenated final challenge are available.
- [x] Word-level highlighting works after evaluation by the cloned canonical flow.
- [x] Word click opens pronunciation help and attempts single-word playback.
- [x] Teacher report delivery is available after all sections are completed.
- [x] Practice Lab Unit 2 includes Activity 05.
- [x] Unit 2 teaching page links to the pronunciation activity.
- [ ] Production checks pass after deployment.
