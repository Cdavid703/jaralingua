# Basic English 2 - Unit 1 Pronunciation Activity

## Activity

- Practice Lab activity: 06
- Page: `ingles/basico-2/pronunciation-unit-1-weather-going-out.html`
- Unit: Unit 1 - Going Out
- Focus: weather vocabulary, present continuous, -ing endings, going-out plans, phrasal verbs, and idioms from the unit.
- Teacher delivery: enabled as a follow-up report with weight `0`.
- Gradebook evaluation id: `basic2Unit1WeatherGoingOutPronunciation`

## Pedagogical structure

1. Weather words: `sunny, cloudy, windy, rainy, stormy, pouring.`
2. Weather sentences: `It's sunny. It's cloudy. It's windy. It's raining. It's pouring. It's stormy.`
3. Present continuous actions: checking, waiting, leaving, getting stronger.
4. -ing endings: checking, waiting, leaving, raining, changing, meeting, sitting, packing.
5. Changing plans: changing the plan, staying inside, meeting up, calling off a game.
6. Unit expressions: going out, meeting up, called off, raining cats and dogs, stay dry.
7. Final challenge: integrated short paragraph using weather + present continuous + plan changes.

## Interaction

- Student listens to an ElevenLabs professional American English model.
- Student can play the model at `0.75` or `1.0`.
- Student records each section.
- The activity sends the recording to the pronunciation-assessment endpoint for transcription and automatic word-level evaluation.
- The student sees:
  - transcript,
  - recognized words in green,
  - missed words in red,
  - overall score,
  - accuracy,
  - completeness,
  - rhythm/fluency,
  - local student-audio playback.

## Teacher delivery

- Delivery button unlocks only after all six sections and the final challenge are completed.
- The teacher receives a written report only:
  - section labels,
  - reference text,
  - transcript,
  - missed words,
  - overall/accuracy/completeness/fluency/WPM,
  - final challenge transcript,
  - attempt count.
- The activity does not store student audio on the server.
- The report is visible in Basic English gradebook with:
  - `weight: 0`,
  - `followUpOnly: true`,
  - `doesNotAffectAverage: true`.

## Media

- Hero/card image: `assets/img/english-basic-2/unit-1-going-out/pronunciation-weather-going-out.webp`
- ElevenLabs source: `ingles/basico-2/audio/unit1/pronunciation/weather-going-out-pronunciation-scripts.md`
- Audio files:
  - `section-1-weather-words.mp3`
  - `section-2-weather-sentences.mp3`
  - `section-3-actions-now.mp3`
  - `section-4-ing-endings.mp3`
  - `section-5-changing-plans.mp3`
  - `section-6-unit-expressions.mp3`
  - `final-challenge-weather-going-out.mp3`
- Regeneration script: `tools/generate_english_basic2_unit1_weather_pronunciation_audio.ps1`

## Technical requirements implemented

- Responsive for phone, tablet, laptop, and desktop.
- No fixed/flotante banner or answer overlay.
- Sign-in remains in the navigation/auth system, not as a blocking floating button.
- Basic English 2 local sign-in now maps to `/api/basic/grades/login`.
- Uses `/api/english-basic/pronunciation-assessment` for transcription/evaluation.
- Uses `/api/basic/basic2-unit1-pronunciation-weather/submit` for teacher report delivery.
