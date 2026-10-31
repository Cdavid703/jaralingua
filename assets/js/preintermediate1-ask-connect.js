/* Local formative practice. Repeated answer sets do not unlock the solutions. */
(() => {
  'use strict';
  const raw = document.getElementById('ac-data');
  if (!raw || !window.FirstVisitVocabulary) return;
  const data = JSON.parse(raw.textContent), questions = data.questions;
  const form = document.getElementById('ac-quiz'), result = document.getElementById('ac-result');
  const audio = document.getElementById('ac-audio'), audioStatus = document.getElementById('ac-audio-status');
  const storageStatus = document.getElementById('ac-storage-status'), undo = document.getElementById('ac-undo');
  const key = 'jl-pi1-unit1-ask-connect-v1';
  let available = true, speed = 1, token = 0, activeModel = null, revealed = false;
  const readAnswers = () => questions.map(q => form.querySelector(`input[name="${q.id}"]:checked`)?.value || '');
  function safeState(source) {
    return {
      answers: questions.map((_, i) => ['A', 'B', 'C'].includes(source?.answers?.[i]) ? source.answers[i] : ''),
      seen: [...new Set((Array.isArray(source?.seen) ? source.seen : []).filter(s => typeof s === 'string' && /^[ABC]{15}$/.test(s)))].slice(0, 2),
      checked: typeof source?.checked === 'string' && /^[ABC]{15}$/.test(source.checked) ? source.checked : ''
    };
  }
  let state = safeState(), backup = null;
  function unavailable() {
    available = false;
    storageStatus.hidden = false;
    storageStatus.textContent = 'This browser cannot save your draft. Keep this page open while you practise.';
  }
  try {
    const saved = JSON.parse(sessionStorage.getItem(key) || 'null');
    if (saved?.version === 1) {
      state = safeState(saved.state);
      if (saved.backup?.answers?.some(a => ['A', 'B', 'C'].includes(a))) backup = safeState(saved.backup);
    }
  } catch (_) { unavailable(); }
  function persist() {
    if (!available) return;
    try { sessionStorage.setItem(key, JSON.stringify({version: 1, state, backup})); }
    catch (_) { unavailable(); }
  }
  function stop(reset = false) {
    token++;
    audio.pause();
    if (reset) { try { audio.currentTime = 0; } catch (_) {} }
    activeModel?.classList.remove('is-playing');
    activeModel?.setAttribute('aria-pressed', 'false');
    activeModel = null;
    vocabulary.setPlaying(null);
  }
  async function play(path, text, button, word = false) {
    stop();
    const request = ++token;
    audio.src = path;
    audio.playbackRate = speed;
    if (word) vocabulary.setPlaying(button);
    else { activeModel = button; button.classList.add('is-playing'); button.setAttribute('aria-pressed', 'true'); }
    audioStatus.textContent = 'Loading audio: ' + text;
    try {
      await audio.play();
      if (request === token) audioStatus.textContent = 'Playing: ' + text;
    } catch (_) {
      if (request === token) { stop(); audioStatus.textContent = 'Audio could not play. Check your connection and tap the same word or model to retry.'; }
    }
  }
  const vocabulary = window.FirstVisitVocabulary(data.vocabulary, (entry, button) => play(entry.audio, entry.term, button, true));
  document.querySelectorAll('[data-glossary]').forEach(el => vocabulary.render(el, el.textContent));
  document.querySelectorAll('[data-ac-model]').forEach(button => button.addEventListener('click', () => {
    if (!revealed || button.closest('.pi-question-feedback').hidden) return;
    const q = questions.find(q => q.id === button.dataset.acModel);
    play(q.audio, q.model, button);
  }));
  audio.addEventListener('ended', () => { stop(); audioStatus.textContent = 'Finished. Tap a word or an unlocked model to listen again.'; });
  audio.addEventListener('error', () => { stop(); audioStatus.textContent = 'Audio could not load. Check your connection and tap the same word or model to retry.'; });
  document.querySelectorAll('[data-ac-speed]').forEach(button => button.addEventListener('click', () => {
    speed = Number(button.dataset.acSpeed);
    audio.playbackRate = speed;
    document.querySelectorAll('[data-ac-speed]').forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.acSpeed) === speed)));
    audioStatus.textContent = 'Audio speed: ' + speed + '×.';
  }));
  document.querySelector('[data-ac-stop]').addEventListener('click', () => { stop(true); audioStatus.textContent = 'Audio stopped.'; });
  function counts() {
    document.getElementById('ac-count').textContent = `${state.answers.filter(Boolean).length} of 15 answers selected.`;
    document.querySelectorAll('[data-block-count]').forEach(el => {
      el.textContent = questions.filter((q, i) => q.group === Number(el.dataset.blockCount) && state.answers[i]).length + ' / 3';
    });
    undo.hidden = !backup;
  }
  function clearFeedback() {
    stop();
    vocabulary.hide();
    audioStatus.textContent = 'Tap an underlined word to listen. Model audio unlocks with the explanations.';
    revealed = false;
    result.hidden = true;
    result.textContent = '';
    questions.forEach(q => {
      const card = document.getElementById(q.id);
      card.classList.remove('is-correct', 'is-review', 'is-unanswered');
      card.querySelector('.pi-question-feedback').hidden = true;
      card.querySelector('[data-ac-model]').disabled = true;
      card.querySelector('.pi-feedback-answer').textContent = '';
      card.querySelector('.pi-feedback-explanation').textContent = '';
      card.querySelector('.ac-model-text').textContent = '';
    });
  }
  function showResult(focus = false, repeated = false) {
    const score = questions.filter((q, i) => state.answers[i] === q.answer).length;
    revealed = score === questions.length || state.seen.length >= 2;
    result.textContent = `${score} of 15 answers correct. ` + (revealed
      ? 'Review the explanations and listen to the resolved models. You can keep practising.'
      : (repeated ? 'This set has already been checked. ' : '') + 'Review the situations and try a different complete set. Explanations and model audio unlock after two different complete attempts.') + ' This is formative practice.';
    result.hidden = false;
    if (revealed) questions.forEach((q, i) => {
      const card = document.getElementById(q.id), correct = state.answers[i] === q.answer;
      card.classList.toggle('is-correct', correct);
      card.classList.toggle('is-review', !correct);
      card.querySelector('.pi-question-feedback').hidden = false;
      card.querySelector('.pi-feedback-answer').textContent = `${correct ? 'Correct.' : 'Review this answer.'} ${q.answer}. ${q.options[q.answer]}`;
      card.querySelector('.pi-feedback-explanation').textContent = q.explanation;
      card.querySelector('.ac-model-text').textContent = q.model;
      card.querySelector('[data-ac-model]').disabled = false;
      if (focus) card.closest('details').open = true;
    });
    if (focus) result.focus();
  }
  function applyState() {
    form.reset();
    questions.forEach((q, i) => {
      if (state.answers[i]) form.querySelector(`input[name="${q.id}"][value="${state.answers[i]}"]`).checked = true;
    });
    clearFeedback();
    counts();
    if (state.checked === state.answers.join('') && state.answers.every(Boolean)) showResult();
  }
  form.addEventListener('change', event => {
    if (!event.target.matches('input[type=radio]')) return;
    state.answers = readAnswers();
    state.checked = '';
    backup = null;
    clearFeedback(); counts(); persist();
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    clearFeedback();
    state.answers = readAnswers();
    const missing = state.answers.findIndex(a => !a);
    if (missing !== -1) {
      state.checked = '';
      const card = document.getElementById(questions[missing].id);
      card.classList.add('is-unanswered');
      card.closest('details').open = true;
      result.textContent = `Answer all 15 questions before checking. ${state.answers.filter(a => !a).length} still need an answer.`;
      result.hidden = false;
      card.querySelector('input').focus();
      persist(); return;
    }
    const signature = state.answers.join(''), repeated = state.seen.includes(signature);
    if (!repeated && state.seen.length < 2) state.seen.push(signature);
    state.checked = signature;
    showResult(true, repeated); persist();
  });
  document.getElementById('ac-reset').addEventListener('click', () => {
    if (state.answers.some(Boolean)) backup = safeState(state);
    state = safeState(); applyState(); persist();
    document.getElementById('block-1').open = true;
    form.querySelector('input').focus();
  });
  undo.addEventListener('click', () => {
    if (!backup) return;
    state = safeState(backup); backup = null; applyState(); persist();
    document.getElementById('block-1').open = true;
    form.querySelector('input').focus();
  });
  function revealHash() {
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch (_) { return; }
    const el = id && document.getElementById(id);
    if (!el) return;
    let folder = el.closest('details');
    while (folder) { folder.open = true; folder = folder.parentElement?.closest('details'); }
    el.scrollIntoView({block: 'start'});
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden) { stop(); vocabulary.hide(); } });
  window.addEventListener('pagehide', () => { stop(); vocabulary.hide(); });
  document.querySelectorAll('.ac-block').forEach(folder => folder.addEventListener('toggle', () => {
    if (!folder.open && activeModel && folder.contains(activeModel)) stop();
  }));
  window.addEventListener('hashchange', revealHash);
  applyState();
  if (location.hash) revealHash();
})();
