# Basic English Course 2 - Unit 1 Audio Listening Plan

## Activity identity

- **Activity title:** Changing Plans Because of the Weather
- **Course:** Basic English Course 2
- **Unit:** Unit 1 - Going Out
- **Practice Lab number:** Activity 04
- **Activity type:** Audio Listening
- **Estimated classroom time:** 12-18 minutes
- **Student language level:** Basic / A1+

## Pedagogical objective

Students understand a short audio conversation about weather, present continuous actions, and a simple change of plan. The activity trains listening without video support, so students must identify meaning from audio evidence.

By the end of the activity, students should be able to:

- recognize common weather expressions in context;
- identify present continuous forms connected to actions happening now;
- understand why two speakers change an outdoor plan;
- recognize common phrasal verbs from Unit 1;
- answer comprehension questions with controlled multiple-choice options.

## Communicative situation

Emma and Daniel are planning to meet at the park for an outdoor movie night. The weather changes: it is getting windy, people are leaving the park, and rain is starting. They decide to call off the outdoor plan and meet up at a cafe instead.

This situation reuses the Unit 1 topic but is not the same script as the video listening activity. It gives students a second listening exposure with different details and no visual support.

## Target language

### Weather

- cloudy
- windy
- raining
- pouring
- cold
- stormy

### Present continuous

- I am checking
- You are waiting
- People are leaving
- The wind is getting stronger
- They are packing up
- We are changing the plan
- Laura is waiting

### Phrasal verbs and idiomatic language

- **go out** - leave home for a social activity.
- **meet up** - meet someone socially.
- **call off** - cancel a plan or event.
- **pack up** - put things away before leaving.
- **rain or shine** - no matter the weather; included as recognition, not as a required production item.

## Image requirement

- **Required asset:** independent professional image for this activity.
- **File:** `assets/img/english-basic-2/unit-1-going-out/audio-listening-weather-plan-change.webp`
- **Visual concept:** adult learners listening with headphones near a rainy window, with weather cards and an audio player.
- **Constraint:** do not reuse weather card images or the video listening cafe image.

## Audio requirement

- **Required audio:** one professional two-speaker MP3 generated with ElevenLabs.
- **Expected file:** `ingles/basico-2/audio/unit1/listening/weather-plan-change-listening.mp3`
- **Source script:** `ingles/basico-2/audio/unit1/listening/weather-plan-change-scripts.md`
- **Generation script:** `tools/generate_english_basic2_unit1_weather_plan_change_audio.ps1`
- **Voice cast:** `tools/elevenlabs_voice_cast.basic-integrated.json`
- **Mode:** dialogue
- **Accent:** American English
- **Browser speech synthesis:** prohibited.

## Screen structure

1. **Hero / banner**
   - Activity number, title, purpose, metadata, and independent image.
   - Banner must not be fixed or static on mobile; it inherits `background-attachment: scroll`.

2. **Activity objective**
   - Clear statement of what the student is training.

3. **Before You Listen**
   - Vocabulary grouped into Weather, Actions now, and Phrasal verbs / plan changes.

4. **Audio Practice**
   - HTML audio player.
   - Speed controls: `0.75x`, `1x`, `1.25x`.
   - Visible status feedback when speed changes.

5. **Listening Focus**
   - Three listening targets:
     - weather change;
     - current actions;
     - final plan.

6. **Comprehension Check**
   - 10 multiple-choice questions.
   - No Spanish translations.
   - First incomplete attempt: ask the learner to answer all 10.
   - First complete incorrect attempt: show score and ask learner to listen again.
   - Second complete incorrect attempt: show score and correct answers.
   - Perfect attempt: show completion message.

7. **Teacher transcript**
   - Transcript download is available only to approved teacher/admin accounts.

## Questions

1. What is Daniel doing at the beginning?
2. Where is Emma waiting?
3. What is the weather like at first?
4. What is happening in the park?
5. What are the food trucks doing?
6. Why does Daniel say they should call off the outdoor movie plan?
7. What phrase means “cancel the plan”?
8. Where are they meeting instead?
9. What is Laura doing?
10. Why does Emma say “rain or shine” is not a good idea today?

## Feedback logic

- **Incomplete:** `Please answer all 10 questions before checking.`
- **First incorrect complete attempt:** score + prompt to listen again.
- **Second incorrect complete attempt:** score + answer key with short explanations.
- **Perfect:** `Excellent. You got 10 out of 10 correct.`
- Result area must scroll into view on mobile and be keyboard-focusable.

## Technical requirements

- Responsive at minimum:
  - `390x844`
  - `820x1180`
  - `1366x768`
- No horizontal overflow.
- No fixed/sticky element covering content.
- Hero background attachment must be `scroll`.
- Image must load with no broken asset.
- Audio file must return HTTP 200 after deployment.
- No `speechSynthesis` or `SpeechSynthesisUtterance`.
- Buttons must be at least mobile-friendly and visually communicate active speed.
- All quiz radios must have explicit `id` and matching `label for`.

## Pedagogical acceptance checklist

- The activity is not a duplicate of the video listening script.
- The activity trains listening without visual support.
- The content stays inside Unit 1: weather, current actions, and changing plans.
- Phrasal verbs are heard in context, not memorized as an isolated list.
- Questions test meaning, not only word spotting.
- Student feedback supports a second attempt before revealing answers.
