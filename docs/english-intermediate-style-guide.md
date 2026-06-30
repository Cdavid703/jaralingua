# English Intermediate Course 1 Style Guide

## Identity

Intermediate English should feel more mature than Basic English without becoming heavy. The level is about confident interaction, storytelling, opinions, evidence, comparison, advice, and personal experience. The visual system should support that: clear, practical, energetic, and slightly more academic.

## Color System

Use the shared CSS tokens in `assets/css/english-intermediate.css`.

- `--intermediate-navy` `#071f4f`: primary headings, serious navigation, assessment blocks.
- `--intermediate-blue` `#2454a6`: links, unit labels, course progression markers.
- `--intermediate-teal` `#0f766e`: successful completion, communication tasks, peer feedback.
- `--intermediate-coral` `#d9433f`: pronunciation focus, alerts, common errors, contrast accents.
- `--intermediate-gold` `#d9a441`: reflection, culture notes, writing preparation, teacher tips.
- `--intermediate-soft` `#f4f7fb`: page background.
- `--intermediate-paper` `#ffffff`: cards, activity panels, reading/listening surfaces.

Avoid making the whole level blue. Each unit can lean on one accent while keeping navy, white, and soft gray as the base.

## Typography And Layout

- Keep headings direct and course-like: `Unit 4: Family Problems and Memories`, `Listening: Sunday Dinner Negotiation`.
- Use compact cards with `8px` radius for repeated activity items.
- Use larger immersive heroes only for course home, unit pages, listening workshops, and major assessment pages.
- Avoid long text blocks inside cards. Use short outcomes, resource chips, and clear action links.
- Use `intermediate-shell`, `intermediate-band`, `intermediate-card`, and `intermediate-resource-grid` for new pages instead of adding large page-specific CSS blocks.

## Required Unit Structure

Every unit from Unit 3 onward should have these pieces:

- Unit explanation page: outcomes, grammar, vocabulary, models, classroom task.
- Practice folder in `practice-lab.html`: 6 to 8 activities, grouped by purpose.
- Listening workshop: full audio, 10 to 20 comprehension questions, transcript support, vocabulary preview.
- Reading workshop: short text with comprehension, inference, vocabulary, and follow-up production.
- Pronunciation page: 4 guided sections plus final paragraph challenge, using the current Whisper-style pattern.
- Grammar or sentence builder: controlled practice before freer production.
- Speaking task: pair/group task with role cards or structured prompts.
- Writing/product task: blog, email, review, timeline, proposal, advice response, or reflection.

## Naming

Use predictable names:

- Unit pages: `unit-4-family-problems-memories.html`
- Listening: `listening-unit-4-sunday-dinner-negotiation.html`
- Reading: `reading-unit-4-the-memory-box.html`
- Practice: `practice-unit-4-family-demands.html`
- Workshop: `workshop-unit-4-family-conflict-mediation.html`
- Pronunciation: `pronunciation-unit-4-family-stories.html`
- Images: `assets/img/english-intermediate/unit-4/...`
- Audio: `ingles/intermediate/audio/unit-4/...`

## Pedagogical Tone

Intermediate tasks should ask students to justify, compare, sequence, negotiate, and react. Replace one-step prompts with task cycles:

1. Input model: short listening, reading, example paragraph, dialogue, or chart.
2. Language noticing: grammar, vocabulary, pronunciation, discourse markers.
3. Controlled practice: sentence builder, gap fill, matching, categorizing.
4. Communicative task: debate, role play, survey, pitch, interview, gallery walk.
5. Reflection/product: written answer, oral report, peer feedback, score rubric.

## Accessibility And Interaction

- Every media activity needs text alternatives: transcript, instructions, and visible question text.
- Do not rely on color alone for correctness. Use labels, icons, or text states.
- Audio controls must remain native or keyboard-accessible.
- Cards should not depend on hover to reveal the main action.
- Mobile layouts should collapse to one column with stable button sizes.
