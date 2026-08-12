# Basic English Course 2 - Games - The Vocabulary Impostor

## Scope

- Page: `ingles/basico-2/game-impostor.html`
- Menu entry: `ingles/basico-2/games.html`
- Script: `assets/js/english-basic2-impostor.js`
- Server endpoints:
  - `GET /api/basic2/impostor/state`
  - `POST /api/basic2/impostor`
- Data file: `/var/lib/jaralingua/basic2-impostor-games.json`

## Pedagogical goal

Students play a live hidden-role speaking game. Most students receive the same secret vocabulary item; the impostor does not know it and must infer it from classmates' clues.

The teacher chooses the vocabulary deck before distributing roles.

## Vocabulary decks implemented

### Unit 1: weather and going out

Cards:

- It's sunny
- It's cloudy
- It's raining
- It's windy
- It's stormy
- It's pouring
- It's hot
- It's cold
- go outside
- stay inside

### Unit 2: clothes and shopping

Cards:

- jacket
- sweater
- T-shirt
- shirt
- jeans
- pants
- dress
- skirt
- scarf
- hat
- sunglasses
- watch

## Classroom flow

1. Teacher creates a room.
2. Students sign in and join with the room code or QR link.
3. Teacher chooses Unit 1 or Unit 2 vocabulary.
4. Teacher distributes roles.
5. Students confirm they received their private card.
6. Class discusses in English without revealing the exact secret item.
7. Teacher opens voting.
8. Students vote for the suspected impostor.
9. Students may update their vote until the teacher reveals the result.
10. Teacher reveals the secret item, impostor and vote summary.

## Bug prevention mapped from previous impostor games

- Voting must not assign a default suspect.
- A saved vote must not prevent the student from selecting another suspect.
- A local draft vote has priority during the current round until the student submits.
- Vote count counts voters, not repeated changes.
- Reset clears votes, ready states and role cards for the next round.
- `reset-all` only removes rooms whose teacher token matches.

## Technical requirements

- Hero/banner scrolls with the page on mobile and tablet. It must not be fixed or sticky.
- Sign in remains in the top course header; no floating sign-in button.
- UI must be responsive on mobile, tablet and desktop.
- The page uses the Basic 2 game image as a dedicated game hero/role support asset.
- Game uses server-side room state, isolated from Intermediate and French impostor games.
- Storage keys are Basic 2-specific:
  - `english-basic2-impostor-live-state`
  - `english-basic2-impostor-teacher-rooms-v1`
  - `english-basic2-impostor-sound-enabled`

## Validation

Required checks:

```bash
python -m py_compile server/progress_api.py
node --check assets/js/english-basic2-impostor.js
node --check tools/test_basic2_impostor_ui.cjs
python tools/test_basic2_impostor_game.py
```

UI regression check:

```bash
NODE_PATH="C:/Users/USER/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules" node tools/test_basic2_impostor_ui.cjs
```
