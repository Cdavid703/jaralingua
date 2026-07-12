# JaraLingua ElevenLabs Audio Production Guidelines

## Golden rule

Never send a full transcript with speaker labels to a single text-to-speech voice.

Bad input for one TTS voice:

```text
Narrator: Three classmates are planning dinner.
Sara: We need a dinner for six people.
Mateo: What about a rice bowl?
```

This can make the audio say "Narrator", "Sara", or "Mateo" aloud.

Correct production:

```text
Narrator -> Three classmates are planning dinner.
Sara -> We need a dinner for six people.
Mateo -> What about a rice bowl?
```

The labels are metadata for voice assignment only. They must not be part of the spoken text.

## Required workflow for listening dialogues

1. Write the canonical transcript with one turn per line:

```text
Narrator: Context sentence.
Character A: Dialogue sentence.
Character B: Dialogue sentence.
```

2. Assign a distinct professional voice to every speaking role in a voice-cast JSON file.

3. Generate dialogue audio with `tools/elevenlabs_generate_listenings.py` using `--mode dialogue`.

4. Run `--dry-run --verbose` before generation and verify:

- The output file is correct.
- The number of speakers is correct.
- Every speaker has the intended voice.
- No warning says speakers are sharing a voice unless that is intentional.

5. Generate with `--overwrite` only after the dry run is correct.

6. Listen to the first 20 seconds and confirm no speaker labels are spoken.

7. Deploy the MP3, the HTML page if its cache/version changed, and any updated transcript or docs.

## Command pattern

```powershell
python tools/elevenlabs_generate_listenings.py `
  --source ingles/intermediate/audio/listening-scripts-intermediate-course-1.md `
  --only unit-5-market-dinner-plan.mp3 `
  --voice-cast tools/elevenlabs_voice_cast.intermediate-unit5.json `
  --language-profile english-us `
  --mode dialogue `
  --dry-run `
  --verbose
```

Then:

```powershell
python tools/elevenlabs_generate_listenings.py `
  --source ingles/intermediate/audio/listening-scripts-intermediate-course-1.md `
  --only unit-5-market-dinner-plan.mp3 `
  --voice-cast tools/elevenlabs_voice_cast.intermediate-unit5.json `
  --language-profile english-us `
  --mode dialogue `
  --overwrite `
  --verbose
```

## Voice casting standard

- Narrator: neutral, clear, slower, teacher-like voice.
- Teen/classmate female role: bright, conversational US voice.
- Teen/classmate male role: conversational US voice.
- Avoid using the same voice for two classmates in the same scene unless there are no other voices available.
- Keep the accent consistent inside one English listening activity.

## QA checklist

- The audio does not say speaker names.
- Each character sounds different.
- The transcript and audio match line by line.
- The speed is natural for Intermediate 1 students.
- Numbers and quantities are easy to hear.
- The HTML audio points to the regenerated MP3.
- The public page loads the new audio after deployment.

