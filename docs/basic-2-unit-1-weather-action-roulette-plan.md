# Basic English Course 2 - Unit 1 - Weather Action Roulette

## Activity identity

- Section: Practice Lab
- Unit: 1 - Going Out
- Activity number: 09
- Page: `ingles/basico-2/practice-unit-1-weather-action-roulette.html`
- Type: teacher-led speaking activity / classroom oral production
- Hero image: `assets/img/english-basic-2/unit-1-going-out/weather-action-roulette-hero.webp`

## Pedagogical decision

This activity does not use screen-based correction, scoring, achievement labels, or multi-level progression. The student speaks freely because Unit 1 already provided the language input through Course Overview, listening, reading, pronunciation, and conversation coach work.

The only production constraint is:

- Say at least one sentence.
- Use present continuous.
- Choose any activity that makes sense with the revealed weather.

Teacher feedback is oral and happens outside the interface.

## Classroom flow

1. The teacher loads or imports student names.
2. The teacher reveals one hidden weather card.
3. The teacher spins the student roulette.
4. The selected student produces one or more natural sentences in present continuous.
5. The teacher saves the round to move to the next card and participant.

## Weather deck

The deck uses Unit 1 professional weather assets:

- Sunny
- Cloudy
- Raining
- Pouring
- Windy
- Stormy
- Freezing
- Really Hot

Cards are face down before selection. A revealed card shows only the weather label and image, not a model answer. This preserves free production.

When the teacher reveals a card, the activity opens a full-screen enlarged view of the weather image. The modal exists so the teacher can project or show the weather clearly on mobile, tablet, laptop, or classroom screen. The teacher can close it, click outside it, press Escape, or spin the student directly from the modal.

## Technical requirements documented for future Basic 2 pages

- The sign-in control must remain in the top navigation/header area, not as a floating button.
- The hero/banner must scroll with the page on mobile and tablet. It must not remain fixed or sticky.
- Each new activity page must use a professional image created or selected specifically for that activity. Do not recycle another activity hero.
- Activities must be responsive for mobile, tablet, laptop, and desktop.
- If an activity uses A/B/C answers, answer positions must be mixed and must not create a visible pattern.
- If an activity is teacher-led oral production, do not add unnecessary written submission, scoring, or rubric buttons unless the teacher explicitly asks for them.

## Implementation notes

- Student roster import uses the shared `assets/js/roster-import.js` pattern used in Basic English Course 1 roulette activities.
- Roulette logic removes students only when the teacher saves the round.
- Weather cards are marked used only after saving the round.
- Canceling a round returns the activity to a neutral state without recording participation.
- Revealed weather cards open in an enlarged modal and can be expanded again by clicking the revealed card.
