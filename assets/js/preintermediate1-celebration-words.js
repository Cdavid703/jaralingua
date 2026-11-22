/* Unit 4 vocabulary: independent complete attempts and recoverable drafts. */
(() => {
  'use strict';
  const raw = document.getElementById('cw-data');
  if (!raw) return;
  const data = JSON.parse(raw.textContent), key = 'jl-pi1-unit4-celebration-words-v1';
  const states = {}, backups = {}, renders = [], copy = value => JSON.parse(JSON.stringify(value));
  let saved = {}, canSave = true, vocabulary = null;
  const storageStatus = document.getElementById('cw-storage-status');
  function unavailable() {
    canSave = false; storageStatus.hidden = false;
    storageStatus.textContent = 'This browser cannot save your draft. Keep this page open or use the original PDF to work on paper.';
  }
  try { saved = JSON.parse(sessionStorage.getItem(key) || '{}') || {}; } catch (_) { unavailable(); }
  function persist() {
    if (!canSave) return;
    try { sessionStorage.setItem(key, JSON.stringify({states, backups})); } catch (_) { unavailable(); }
  }
  const audio = document.getElementById('cw-audio'), audioStatus = document.getElementById('cw-audio-status');
  let speed = 1, token = 0;
  function stop() { token++; audio.pause(); vocabulary?.setPlaying(null); audioStatus.textContent = 'Audio stopped.'; }
  async function play(item, button = null) {
    stop(); const request = ++token; audio.src = item.path; audio.playbackRate = speed;
    vocabulary?.setPlaying(button); audioStatus.textContent = 'Loading audio: ' + item.text;
    try { await audio.play(); if (request === token) audioStatus.textContent = 'Playing: ' + item.text; }
    catch (_) { if (request === token) { stop(); audioStatus.textContent = 'Audio could not play. Check your connection and tap again to retry.'; } }
  }
  document.querySelectorAll('[data-cw-task]').forEach(section => {
    const id = section.dataset.cwTask, items = data.tasks[id], bank = data.banks[id];
    const fields = [...section.querySelectorAll('select')], feedback = [...section.querySelectorAll('.cw-feedback')];
    const models = [...section.querySelectorAll('[data-cw-model]')], result = section.querySelector('.cw-result');
    const undo = section.querySelector('[data-cw-undo]'), signature = answers => JSON.stringify(answers);
    const empty = () => ({answers: items.map(() => ''), attempts: [], checked: ''});
    const complete = answers => Array.isArray(answers) && answers.length === items.length && answers.every(a => typeof a === 'string' && bank.includes(a));
    function validAttempt(value) {
      try { const answers = JSON.parse(value); return typeof value === 'string' && complete(answers) && signature(answers) === value; }
      catch (_) { return false; }
    }
    function valid(value) {
      return value && Array.isArray(value.answers) && value.answers.length === items.length && value.answers.every(a => a === '' || bank.includes(a)) &&
        Array.isArray(value.attempts) && value.attempts.length <= 2 && new Set(value.attempts).size === value.attempts.length && value.attempts.every(validAttempt) &&
        typeof value.checked === 'string' && (!value.checked || (complete(value.answers) && value.checked === signature(value.answers) && value.attempts.includes(value.checked)));
    }
    let state = states[id] = valid(saved.states?.[id]) ? copy(saved.states[id]) : empty();
    if (valid(saved.backups?.[id])) backups[id] = copy(saved.backups[id]);
    const revealed = () => state.attempts.length >= 2 || items.every((item, i) => state.answers[i] === item.answer);
    function hide() {
      result.hidden = true; result.textContent = '';
      feedback.forEach(f => { f.hidden = true; f.textContent = ''; delete f.dataset.accepted; });
      models.forEach(b => { b.hidden = true; });
    }
    function explain() {
      const correct = items.map((item, i) => state.answers[i] === item.answer), total = correct.filter(Boolean).length;
      result.hidden = false;
      result.textContent = `${total} of ${items.length} answers correct. ` + (revealed() ? 'Read the explanations and listen to the vocabulary or sentence models.' : 'Try a different complete set of answers. Repeating the same answers does not unlock explanations.');
      if (revealed()) {
        feedback.forEach((f, i) => { f.hidden = false; f.dataset.accepted = String(correct[i]); f.textContent = `${correct[i] ? 'Correct.' : 'Review this answer.'} Answer: ${items[i].answer}. ${items[i].explanation}`; });
        models.forEach(b => { b.hidden = false; });
      }
    }
    function render() {
      fields.forEach((field, i) => { field.value = state.answers[i]; field.removeAttribute('aria-invalid'); });
      hide(); undo.hidden = !backups[id];
      section.querySelector('.cw-count').textContent = `${state.answers.filter(Boolean).length} of ${items.length} answered.`;
      if (complete(state.answers) && state.checked === signature(state.answers)) explain();
    }
    fields.forEach((field, i) => field.addEventListener('change', () => {
      state.answers[i] = bank.includes(field.value) ? field.value : ''; state.checked = '';
      delete backups[id]; stop(); vocabulary?.hide(); render(); persist();
    }));
    section.querySelector('[data-cw-check]').addEventListener('click', () => {
      hide(); const missing = state.answers.findIndex(a => !a);
      if (missing >= 0) {
        result.hidden = false; result.textContent = `Choose all ${items.length} answers before checking. Your draft is still here; no attempt was used.`;
        fields[missing].setAttribute('aria-invalid', 'true'); fields[missing].focus(); return;
      }
      fields.forEach(f => f.removeAttribute('aria-invalid'));
      const current = signature(state.answers);
      if (!state.attempts.includes(current)) { if (state.attempts.length < 2) state.attempts.push(current); else state.attempts[1] = current; }
      state.checked = current; explain(); persist(); result.focus();
    });
    section.querySelector('[data-cw-reset]').addEventListener('click', () => {
      if (state.answers.some(Boolean) || state.attempts.length) backups[id] = copy(state);
      state = states[id] = empty(); stop(); vocabulary?.hide(); render(); persist(); fields[0].focus();
    });
    undo.addEventListener('click', () => {
      if (!valid(backups[id])) return;
      state = states[id] = copy(backups[id]); delete backups[id]; stop(); vocabulary?.hide(); render(); persist(); fields[0].focus();
    });
    models.forEach((button, i) => button.addEventListener('click', () => {
      if (button.hidden || state.checked !== signature(state.answers) || !complete(state.answers) || !revealed()) return;
      const item = data.audio[items[i].model_audio || items[i].id]; if (item) play(item);
    }));
    renders.push(render);
  });
  if (window.FirstVisitVocabulary) {
    vocabulary = window.FirstVisitVocabulary(data.vocabulary, (entry, button) => play({path: entry.audio, text: entry.term}, button));
    document.querySelectorAll('[data-glossary]').forEach(el => vocabulary.render(el, el.textContent));
  }
  document.querySelectorAll('[data-cw-audio]').forEach(button => button.addEventListener('click', () => {
    const item = data.audio[button.dataset.cwAudio]; if (item) play(item);
  }));
  document.querySelectorAll('[data-cw-speed]').forEach(button => button.addEventListener('click', () => {
    speed = Number(button.dataset.cwSpeed); audio.playbackRate = speed;
    document.querySelectorAll('[data-cw-speed]').forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.cwSpeed) === speed)));
    audioStatus.textContent = 'Audio speed: ' + speed + '×.';
  }));
  document.querySelector('[data-cw-stop]').addEventListener('click', stop);
  audio.addEventListener('ended', () => { stop(); audioStatus.textContent = 'Finished. Tap to listen again.'; });
  audio.addEventListener('error', () => { stop(); audioStatus.textContent = 'Audio could not load. Check your connection and tap again to retry.'; });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { stop(); vocabulary?.hide(); persist(); } });
  window.addEventListener('pagehide', () => { stop(); vocabulary?.hide(); persist(); });
  function openHash() {
    let id; try { id = decodeURIComponent(location.hash.slice(1)); } catch (_) { return; }
    const target = id && document.getElementById(id); if (!target) return;
    let folder = target.closest('details'); while (folder) { folder.open = true; folder = folder.parentElement?.closest('details'); }
    target.scrollIntoView({block: 'start'});
  }
  renders.forEach(render => render()); window.addEventListener('hashchange', openHash); if (location.hash) openHash();
})();
