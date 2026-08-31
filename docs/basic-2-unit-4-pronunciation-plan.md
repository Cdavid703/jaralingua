# Basic English Course 2 — Unit 4 pronunciation implementation

## Activity

**Regular -ed Pronunciation Studio** is a Practice Lab follow-up for Unit 4. It practices only regular past endings already introduced in the unit: **/t/**, **/d/** and **/ɪd/**.

## Sequence

1. Final **/t/**: worked, watched, cooked, washed, laughed, missed.
2. Final **/d/**: played, cleaned, lived, called, answered, stayed.
3. Final **/ɪd/**: wanted, needed, waited, started, visited, decided.
4. Final challenge: the three sound groups in one recording.

Every target word is a button with its individual ElevenLabs model under `ingles/basico-2/audio/unit4/pronunciation/ed-endings/words/`. The final model concatenates the three existing ElevenLabs contrast models.

## Delivery

- English transcription and word-level analysis use `/api/english-basic/pronunciation-assessment` only.
- A signed-in Basic English 2 student may submit the completed report through `/api/basic2/unit4-regular-ed-pronunciation/submit`.
- The gradebook entry is **weight 0**, visible in Deliverables and never included in the course average.
- Submission preserves a client submission id, score summary, transcript, missed words, stage history, time and retry count.

## Layout

The page inherits the Basic English 2 full-width standard: horizontal hero on desktop, one-column hero on smaller screens, normal scrolling, and no pre-opened Practice Lab folder.