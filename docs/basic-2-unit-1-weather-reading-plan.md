# Basic English Course 2 - Unit 1 Reading Plan

## Activity identity

- **Activity title:** A Rainy Afternoon Plan
- **Course:** Basic English Course 2
- **Unit:** Unit 1 - Going Out
- **Practice Lab number:** Activity 05
- **Activity type:** Reading
- **Estimated classroom time:** 12-15 minutes
- **Student language level:** Basic / A1+

## Pedagogical objective

Students read a short story about weather, present continuous actions, and a simple change of plan. The activity strengthens written comprehension before later pronunciation and conversation-coach work.

By the end of the activity, students should be able to:

- identify the main situation in a short text;
- recognize weather expressions in context;
- identify present continuous actions;
- understand why the speakers change their plan;
- infer the meaning of a common phrasal verb from context;
- answer comprehension questions with controlled multiple-choice options.

## Communicative situation

Emma is waiting near a park for an outdoor movie. The weather is changing, Daniel is checking the weather, families are leaving, and food trucks are packing up. Emma and Daniel decide to call off the outdoor movie plan and meet up at a cafe where Laura is saving a table.

## Target language

### Weather

- cloudy
- windy
- raining
- pouring

### Present continuous

- Emma is waiting
- The wind is getting stronger
- Daniel is checking
- Some families are leaving
- The food trucks are packing up
- They are meeting up
- Laura is sitting

### Phrasal verbs and plan language

- **go out** - leave home for a social activity.
- **meet up** - meet someone socially.
- **call off** - cancel a plan or event.
- **stay inside** - remain indoors.

## Image requirement

- **Required asset:** independent professional image for this reading activity.
- **File:** `assets/img/english-basic-2/unit-1-going-out/reading-rainy-afternoon-plan.webp`
- **Visual concept:** two adult English learners reading together near a rainy cafe or library window.
- **Constraint:** do not reuse weather card images, the video listening image, or the audio listening image.
- **Generation mode:** built-in ImageGen.

## Screen structure

1. **Hero / banner**
   - Activity number, title, purpose, metadata, and independent image.
   - Banner must not be fixed or static on mobile; it inherits `background-attachment: scroll`.

2. **Reading objective**
   - Short statement of what the student is training.

3. **Before You Read**
   - Compact vocabulary list only.
   - Three short lines:
     - Weather;
     - Actions now;
     - Plan language.
   - Do not use large vocabulary cards or chips in this reading activity.

4. **Reading Text**
   - 140-170 words.
   - Three short paragraphs.
   - No Spanish translations.
   - Present continuous forms appear naturally.
   - Phrasal verbs appear in context.

5. **Reading Focus**
   - Three compact focus points:
     - weather change;
     - current actions;
     - final plan.

6. **Comprehension Check**
   - 10 multiple-choice questions.
   - No free writing.
   - No Spanish translations.
   - First incomplete attempt: ask the learner to answer all 10.
   - First complete incorrect attempt: show score and ask learner to read again.
   - Second complete incorrect attempt: show score and correct answers.
   - Perfect attempt: show completion message.

## Reading text

**A Rainy Afternoon Plan**

Emma is waiting near the park entrance. She is wearing a light jacket and looking at the sky. It is cloudy, and the wind is getting stronger. Some families are leaving the park, but Emma still wants to watch the outdoor movie.

Daniel is checking the weather on his phone. He sends Emma a message: "It is starting to rain near my street, and it is getting cold." Emma looks around. The food trucks are packing up, and people are opening their umbrellas.

Daniel says, "Maybe we should call off the outdoor movie plan." Emma agrees. They are not going to the park now. Instead, they are meeting up at a cafe across from the park. Their friend Laura is already sitting inside and saving a table. The afternoon is rainy, but their plan is still good.

## Questions

1. Where is Emma waiting?
2. What is Emma wearing?
3. What is the weather like at the beginning?
4. What is Daniel doing?
5. What are some families doing?
6. What are the food trucks doing?
7. What does Daniel suggest?
8. What does "call off" mean in the story?
9. Where are Emma and Daniel meeting instead?
10. What is Laura doing?

## Feedback logic

- **Incomplete:** `Please answer all 10 questions before checking.`
- **First incorrect complete attempt:** score + prompt to read again.
- **Second incorrect complete attempt:** score + answer key.
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
- Sign in must mount in the top navigation, not as a floating control.
- No audio in this activity.
- No `speechSynthesis` or `SpeechSynthesisUtterance`.
- All quiz radios must have explicit `id` and matching `label for`.

## Pedagogical acceptance checklist

- The activity stays inside Unit 1: weather, present continuous, and changing plans.
- The text is short enough for Basic / A1+ learners.
- Vocabulary support is compact and does not dominate the page.
- Questions test meaning, not only word spotting.
- Student feedback supports a second attempt before revealing answers.
