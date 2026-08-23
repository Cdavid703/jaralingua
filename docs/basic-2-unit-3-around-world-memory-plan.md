# Basic English Course 2 — Unit 3: Around the World Memory

## Purpose

A teacher-led, two-team memory activity for the first Practice Lab item of Unit 3. It reinforces specific adjectives that students can use to describe cities, landmarks, and natural places. It deliberately excludes overly general words such as `beautiful`, `big`, and `small`.

## Vocabulary target

- History and style: `ancient`, `historic`, `modern`, `traditional`
- Atmosphere: `crowded`, `quiet`, `peaceful`, `remote`
- Character: `scenic`, `spacious`, `touristy`, `impressive`

## Student flow

1. Team 1 reveals two cards.
2. A matching pair opens a full visual prompt.
3. The activity plays an ElevenLabs American-English model for the adjective.
4. The student repeats only the adjective aloud.
5. The teacher confirms the spoken repetition; that team receives one point and continues.
6. A non-match closes automatically and transfers the turn.
7. The winner panel reports the score and allows a new game.

## Technical and responsive requirements

- 24 cards / 12 pairs, randomised on every new game.
- Two editable team names and a visible score/turn display.
- Generated professional imagery: unique hero image plus a dedicated twelve-panel visual card sheet.
- Each image card has accessible text and a matching visual in the pronunciation modal.
- ElevenLabs model audio lives in `ingles/basico-2/audio/unit3/around-world-memory/cards/` and uses the dedicated voice-cast file.
- Uses the Basic English 2 responsive header and `immersive-basic-hero`; no hero or banner may be fixed on mobile or tablet.
- The activity is linked from `practice-lab.html#unit-3-folder`.