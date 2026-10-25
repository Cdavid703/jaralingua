/* Connected Unit 1 practice; the shared Intermedio vocabulary component is reused. */
(() => {
  'use strict';
  const raw = document.getElementById('pi-connected-data');
  if (!raw || !window.FirstVisitVocabulary) return;
  const data = JSON.parse(raw.textContent);
  const form = document.getElementById('pi-connected-quiz');
  const questions = data.questions;
  const result = document.getElementById('pi-connected-result');
  const count = document.getElementById('pi-answer-count');
  const wordAudio = document.getElementById('pi-vocabulary-audio');
  const storyAudio = document.getElementById('pi-story-audio');
  const status = document.getElementById('pi-connected-audio-status');
  const retry = document.getElementById('pi-audio-retry');
  const storageKey = `jl-preintermediate1-unit1-connected-${data.kind}-v1`;
  let attempts = 0, checked = false, speed = 1, playToken = 0;

  function stopWord() {
    playToken++;
    wordAudio.pause();
    vocabulary.setPlaying(null);
  }
  function stopAll(reset = false) {
    stopWord();
    storyAudio?.pause();
    if (reset) {
      try { wordAudio.currentTime = 0; if (storyAudio) storyAudio.currentTime = 0; } catch (_) {}
    }
  }
  const vocabulary = window.FirstVisitVocabulary(data.vocabulary, async (entry, button) => {
    stopAll();
    const token = ++playToken;
    wordAudio.src = entry.audio;
    wordAudio.playbackRate = speed;
    vocabulary.setPlaying(button);
    status.textContent = 'Loading pronunciation: ' + entry.term;
    try {
      await wordAudio.play();
      if (token === playToken) status.textContent = 'Pronunciation: ' + entry.term;
    } catch (_) {
      if (token === playToken) {
        vocabulary.setPlaying(null);
        status.textContent = 'Pronunciation could not play. Tap the word to retry.';
      }
    }
  });
  document.querySelectorAll('[data-glossary]').forEach(el => vocabulary.render(el, el.textContent));
  wordAudio.addEventListener('ended', () => vocabulary.setPlaying(null));
  wordAudio.addEventListener('error', () => {
    vocabulary.setPlaying(null);
    status.textContent = 'Pronunciation could not load. Tap the word to retry.';
  });
  if (storyAudio) {
    storyAudio.addEventListener('play', () => {
      stopWord();
      if (retry) retry.hidden = true;
      status.textContent = 'Playing the conversation.';
    });
    storyAudio.addEventListener('ended', () => { status.textContent = 'Conversation finished. Listen again or answer the questions.'; });
    storyAudio.addEventListener('error', () => {
      status.textContent = 'The conversation could not load. Use Retry audio to try again.';
      if (retry) retry.hidden = false;
    });
    retry?.addEventListener('click', () => {
      storyAudio.load();
      storyAudio.play().catch(() => { status.textContent = 'Audio could not play. Check your connection and retry.'; });
    });
    document.getElementById('pi-story-play')?.addEventListener('click', () => {
      stopAll();
      storyAudio.currentTime = 0;
      storyAudio.play().catch(() => {
        status.textContent = 'Audio could not play. Use Retry audio to try again.';
        if (retry) retry.hidden = false;
      });
    });
  }
  document.querySelectorAll('[data-connected-speed]').forEach(button => button.addEventListener('click', () => {
    speed = Number(button.dataset.connectedSpeed);
    wordAudio.playbackRate = speed;
    if (storyAudio) storyAudio.playbackRate = speed;
    document.querySelectorAll('[data-connected-speed]').forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.connectedSpeed) === speed)));
    status.textContent = 'Audio speed: ' + (speed === 1 ? '1.0' : speed) + '×.';
  }));
  document.querySelector('[data-connected-stop]')?.addEventListener('click', () => {
    stopAll(true);
    status.textContent = 'Audio stopped.';
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { stopAll(); vocabulary.hide(); } });
  window.addEventListener('pagehide', () => { stopAll(); vocabulary.hide(); });

  function answers() {
    return Object.fromEntries(questions.map(q => [q.id, form.querySelector(`input[name="${q.id}"]:checked`)?.value || '']));
  }
  function save() {
    try { sessionStorage.setItem(storageKey, JSON.stringify({ version: 1, answers: answers(), attempts, checked })); } catch (_) {}
  }
  function updateCount() {
    const selected = Object.values(answers()).filter(Boolean).length;
    count.textContent = selected ? `${selected} of ${questions.length} answers selected.` : 'Choose your answers.';
  }
  function clearFeedback() {
    checked = false;
    questions.forEach(q => {
      const card = document.getElementById(q.id);
      card.classList.remove('is-correct', 'is-review', 'is-unanswered');
      card.querySelector('.pi-question-feedback').hidden = true;
    });
    result.hidden = true;
    result.textContent = '';
  }
  function check(increment = true, focus = true) {
    const selected = answers();
    const missing = questions.filter(q => !selected[q.id]);
    if (missing.length) {
      clearFeedback();
      missing.forEach(q => document.getElementById(q.id).classList.add('is-unanswered'));
      result.textContent = `Please answer all ${questions.length} questions before checking. ${missing.length} still need an answer.`;
      result.hidden = false;
      if (focus) form.querySelector(`input[name="${missing[0].id}"]`).focus();
      save();
      return;
    }
    if (increment) attempts = Math.min(2, attempts + 1);
    const score = questions.filter(q => selected[q.id] === q.answer).length;
    const reveal = score === questions.length || attempts >= 2;
    questions.forEach(q => {
      const card = document.getElementById(q.id), correct = selected[q.id] === q.answer;
      card.classList.remove('is-unanswered');
      card.classList.toggle('is-correct', reveal && correct);
      card.classList.toggle('is-review', reveal && !correct);
      card.querySelector('.pi-question-feedback').hidden = !reveal;
      if (!reveal) return;
      card.querySelector('.pi-feedback-answer').textContent = `${correct ? 'Correct.' : 'Review this answer.'} ${q.answer}. ${q.options[q.answer]}`;
      card.querySelector('.pi-feedback-explanation').textContent = q.explanation;
      card.querySelector('.pi-feedback-evidence').textContent = (q.paragraph ? `Paragraph ${q.paragraph}: ` : 'In the conversation: ') + '“' + q.evidence + '”';
      const link = card.querySelector('.pi-evidence-link');
      if (link) { link.href = '#reading-p' + q.paragraph; link.textContent = 'Read paragraph ' + q.paragraph; }
    });
    checked = true;
    const verb = data.kind === 'listening' ? 'Listen' : 'Read';
    result.textContent = `${score} of ${questions.length} answers correct. ` + (reveal ? 'Review the explanations and evidence below each question. You can keep practising.' : `${verb} again and try once more. Correct answers appear after your second complete attempt.`) + ' This is formative practice.';
    result.hidden = false;
    if (focus) result.focus();
    save();
  }
  form.addEventListener('submit', event => { event.preventDefault(); check(); });
  form.addEventListener('change', () => { clearFeedback(); updateCount(); save(); });
  document.getElementById('pi-connected-reset').addEventListener('click', () => {
    form.reset(); attempts = 0; clearFeedback(); updateCount();
    try { sessionStorage.removeItem(storageKey); } catch (_) {}
    form.querySelector('input').focus();
  });
  try {
    const draft = JSON.parse(sessionStorage.getItem(storageKey) || 'null');
    if (draft?.version === 1 && draft.answers && typeof draft.answers === 'object') {
      questions.forEach(q => {
        const value = draft.answers[q.id];
        if (Object.hasOwn(q.options, value)) form.querySelector(`input[name="${q.id}"][value="${value}"]`).checked = true;
      });
      attempts = Number.isInteger(draft.attempts) ? Math.min(2, Math.max(0, draft.attempts)) : 0;
      if (draft.checked === true) check(false, false);
    }
  } catch (_) {}
  updateCount();
})();
