# News Quest · Unit 6 vocabulary and speaking practice

Approved on 9 October 2026: a short-challenge game inspired by familiar language-learning patterns, using the twelve Greenford News words. Published entry point: `ingles/intermediate-2/practice-unit-6-news-quest.html`, in Practice Lab → Unit 6 → pronunciation filter. This is independent private practice, not the official course pronunciation submission activity.

## Learning sequence

- Optional illustrated study cards: the twelve existing Greenford images, Spanish on hover/focus/tap, ElevenLabs word pronunciation on click. Sources remain the canonical Greenford assets.
- Main quest: 24 vocabulary challenges, exactly two per word, with six each of listening-to-picture, picture-to-word, listening-to-word and sentence completion. Choices have explicit A/B/C labels and are shuffled.
- Twelve interleaved speaking turns, one per word: four word models, four sentence models and four image recall prompts. Learners can reveal the model on image prompts.
- A first vocabulary mistake allows another attempt. After a second mistake the correct letter, definition, meaning and model sentence are shown. Correct responses show the same learning feedback. Continue is always explicit.
- A difficult word returns after three intervening challenges where possible (or at the end), in a different format. At most one additional review is scheduled per word, bounding a main quest at 48 turns.
- The final summary separates vocabulary first attempts, speaking practice and skipped speaking. Review turns do not inflate the first-attempt score. Learners can practise difficult words or start a fresh shuffled quest. The optional sentence round covers the marked difficult words, or all twelve if none are marked.

## Speaking, feedback and privacy

The current shared course pronunciation engine evaluates transcript alignment and speaking rate; it does not provide phonetic assessment. This activity does not reuse its percentage scores or describe recognition as pronunciation accuracy. There is no automated pronunciation grade. Each word instead supplies a specific sound/stress tip, a professional word model and a short sentence.

The lightweight recording path uses MediaRecorder and a local Blob URL. Permission is requested only on Record; an input meter and ten-second limit are visible. Replay enables the learner's own reflection: “I feel ready” or “I need more practice.” Quiet/short recordings receive a recording-quality message, never a pronunciation failure. A without-microphone path permits listening and repeating aloud; Skip is always available.

Recordings are not uploaded, stored in localStorage or persisted. Retry replaces them; advancing clears them. Streams, pending permission results, timers, Blob URLs and playback are cleaned up. Leaving the tab interrupts active recording. No assessment endpoint, submission, gradebook, teacher inbox or student data changes are involved. These choices implement the explicitly approved private-practice plan; the full four-section assessment/submission pronunciation-page workflow does not apply to this mini-game.

## Sound and visual controls

One current professional model player, repeat and slow replay, 1× / 0.75× speed, independent Voice and Effects toggles, and Stop audio. Short synthesized sine tones provide local interaction feedback; all spoken language is ElevenLabs Sarah, not browser speech synthesis. Student playback pauses the professional model and vice versa. Playback is blocked while recording to avoid capturing the model.

Spanish hints appear on study cards and revealed feedback, not on unanswered choices. Images use contain and bounded heights. The page preserves the established shared course header, authentication, responsive layout and canonical page-access QR. It reuses original Greenford illustrations; no additional AI images were needed.

## Sources and validation

- Canonical content builder: `tools/build_intermediate2_news_quest_content.py` → `assets/data/english-intermediate2-news-quest.json`.
- Page builder: `tools/build_intermediate2_news_quest.py`.
- Behavior and styles: `assets/js/english-intermediate2-news-quest.js`, `assets/css/english-intermediate2-news-quest.css`.
- New audio: twelve sentence models in `ingles/intermediate-2/audio/unit-6-news-quest/`, with production manifest and Scribe audit. Existing twelve word models are reused without overwriting them.
- Audio generator/auditor: `tools/generate_intermediate2_news_quest_audio.py`, `tools/audit_intermediate2_news_quest_audio.py`. Canonical public learning sentences contain no speaker labels.
- Functional test: `tools/test_intermediate2_news_quest.cjs`: 320–1920 px, QR, hover, muted/slow audio, full correct and incorrect quests, bounded repeated practice, recording with a synthetic microphone, replay, silence, denied/late permissions, stream disposal, failed media/data and no student POST requests. It also validates catalog discovery and all asset URLs. Use `QUEST_ORIGIN` for public checks.
- Shared page contract: 49 pages. Authentication checks cover the course, including the new page and Practice Lab; no real credentials are submitted.
