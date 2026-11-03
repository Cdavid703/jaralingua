/* Free writing with a tab-local draft and an explicit personal self-check. */
(() => {
  'use strict';
  const raw = document.getElementById('mp-data');
  if (!raw) return;
  const data = JSON.parse(raw.textContent), field = document.getElementById('mp-writing');
  const checks = [...document.querySelectorAll('[data-mp-check]')];
  const result = document.getElementById('mp-result'), storageStatus = document.getElementById('mp-storage-status');
  const undoButton = document.getElementById('mp-undo'), copyStatus = document.getElementById('mp-copy-status');
  const key = 'jl-pi1-my-personality-writing-v1';
  let backup = null, canStore = true;
  const snapshot = () => ({text: field.value, checks: checks.map(c => c.checked)});
  const valid = value => value && typeof value.text === 'string' && Array.isArray(value.checks);
  function restore(value) {
    field.value = value.text;
    checks.forEach((c, i) => { c.checked = value.checks[i] === true; });
  }
  function storageFailed() {
    canStore = false; storageStatus.hidden = false;
    storageStatus.textContent = 'This browser cannot save your draft. Keep this page open and copy your writing before leaving.';
  }
  try {
    const saved = JSON.parse(sessionStorage.getItem(key) || 'null');
    if (saved?.version === 1 && valid(saved.draft)) {
      restore(saved.draft); backup = valid(saved.backup) ? saved.backup : null;
    }
  } catch (_) { storageFailed(); }
  function save() {
    if (!canStore) return;
    try { sessionStorage.setItem(key, JSON.stringify({version: 1, draft: snapshot(), backup})); }
    catch (_) { storageFailed(); }
  }
  function update() {
    const count = (field.value.match(/[\p{L}\p{N}]+(?:[’'-][\p{L}\p{N}]+)*/gu) || []).length;
    document.getElementById('mp-count').textContent = count + (count === 1 ? ' word' : ' words') + ' · no minimum or target';
    result.hidden = true; result.textContent = ''; copyStatus.textContent = '';
    undoButton.hidden = !backup;
  }
  function edited() { backup = null; update(); save(); }
  field.addEventListener('input', edited);
  checks.forEach(c => c.addEventListener('change', edited));
  document.getElementById('mp-form').addEventListener('submit', event => event.preventDefault());
  document.getElementById('mp-review').addEventListener('click', () => {
    if (!field.value.trim()) {
      result.textContent = 'Write about your personality first. Choose words that fit you; there is no minimum length.';
      result.hidden = false; field.focus(); return;
    }
    const marked = checks.filter(c => c.checked).length;
    result.textContent = marked === checks.length
      ? 'You marked all five self-check points. Read your writing once more and change anything you want to improve. These are your own marks, not an automatic correction or a grade.'
      : `You marked ${marked} of 5 self-check points. Use the unmarked points to review and revise your writing. These are your own marks, not an automatic correction or a grade.`;
    result.hidden = false; result.focus(); save();
  });
  document.getElementById('mp-reset').addEventListener('click', () => {
    const current = snapshot();
    if (current.text || current.checks.some(Boolean)) backup = current;
    restore({text: '', checks: []}); update(); save();
    copyStatus.textContent = backup ? 'Writing cleared. Choose Undo reset to recover it.' : 'Your writing space is empty.';
    field.focus();
  });
  undoButton.addEventListener('click', () => {
    if (!backup) return;
    restore(backup); backup = null; update(); save(); field.focus();
    copyStatus.textContent = 'Your writing and self-check marks have been restored.';
  });
  document.getElementById('mp-copy').addEventListener('click', async () => {
    const text = field.value;
    if (!text.trim()) { copyStatus.textContent = 'Write something before copying.'; field.focus(); return; }
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(text);
      copyStatus.textContent = 'Your writing was copied. Paste it into your own document to keep it.';
    } catch (_) {
      field.focus(); field.select();
      copyStatus.textContent = 'Your writing is selected. Use your device’s Copy command, then paste it into your own document.';
    }
  });
  // One player for the instruction and word pronunciations: no overlapping audio.
  const audio = document.getElementById('mp-audio'), audioStatus = document.getElementById('mp-audio-status');
  let speed = 1, token = 0, vocabulary = null;
  function stop() { token++; audio.pause(); vocabulary?.setPlaying(null); }
  async function play(path, label, button = null) {
    stop(); const request = ++token;
    audio.src = path; audio.playbackRate = speed;
    vocabulary?.setPlaying(button); audioStatus.textContent = 'Loading audio: ' + label;
    try { await audio.play(); if (request === token) audioStatus.textContent = 'Playing: ' + label; }
    catch (_) { if (request === token) { stop(); audioStatus.textContent = 'Audio could not play. Check your connection and tap again to retry.'; } }
  }
  if (window.FirstVisitVocabulary) {
    vocabulary = window.FirstVisitVocabulary(data.vocabulary, (entry, button) => play(entry.audio, entry.term, button));
    document.querySelectorAll('[data-glossary]').forEach(el => vocabulary.render(el, el.textContent));
  }
  document.getElementById('mp-listen').addEventListener('click', () => play(data.instructionAudio, data.instruction));
  document.querySelectorAll('[data-mp-speed]').forEach(button => button.addEventListener('click', () => {
    speed = Number(button.dataset.mpSpeed); audio.playbackRate = speed;
    document.querySelectorAll('[data-mp-speed]').forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.mpSpeed) === speed)));
    audioStatus.textContent = 'Audio speed: ' + speed + '×.';
  }));
  document.querySelector('[data-mp-stop]').addEventListener('click', () => { stop(); audioStatus.textContent = 'Audio stopped.'; });
  audio.addEventListener('ended', () => { stop(); audioStatus.textContent = 'Finished. Tap to listen again.'; });
  audio.addEventListener('error', () => { stop(); audioStatus.textContent = 'Audio could not load. Check your connection and tap again to retry.'; });
  function revealHash() {
    let id; try { id = decodeURIComponent(location.hash.slice(1)); } catch (_) { return; }
    const el = id && document.getElementById(id); if (!el) return;
    let folder = el.closest('details');
    while (folder) { folder.open = true; folder = folder.parentElement?.closest('details'); }
    el.scrollIntoView({block: 'start'});
  }
  window.addEventListener('hashchange', revealHash);
  window.addEventListener('pagehide', () => { save(); stop(); vocabulary?.hide(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { save(); stop(); vocabulary?.hide(); } });
  update(); if (location.hash) revealHash();
})();
