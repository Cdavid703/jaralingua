/* Original discussion prompts, optional memory-only recordings and local practice marks. */
(() => {
  'use strict';
  const raw = document.getElementById('ps-data');
  if (!raw || !window.FirstVisitVocabulary || !window.createPersonalityRecorder) return;
  const data = JSON.parse(raw.textContent), support = document.getElementById('ps-support-audio');
  const audioStatus = document.getElementById('ps-audio-status'), storageStatus = document.getElementById('ps-storage-status');
  const result = document.getElementById('ps-review-result'), key = 'jl-pi1-personality-speaking-v1';
  const markFields = [...document.querySelectorAll('[data-ps-mark]')], checkFields = [...document.querySelectorAll('[data-ps-check]')];
  const clips = new Map(), removed = new Map(), urls = new Map();
  let storageAvailable = true, speed = 1, token = 0;
  function unavailable() {
    storageAvailable = false; storageStatus.hidden = false;
    storageStatus.textContent = 'This browser cannot save your practice marks. Keep the page open while you practise.';
  }
  try {
    const saved = JSON.parse(sessionStorage.getItem(key) || 'null');
    if (saved?.version === 1) {
      markFields.forEach((field, i) => { field.checked = saved.marks?.[i] === true; });
      checkFields.forEach((field, i) => { field.checked = saved.checks?.[i] === true; });
    }
  } catch (_) { unavailable(); }
  function save() {
    if (!storageAvailable) return;
    try { sessionStorage.setItem(key, JSON.stringify({version: 1, marks: markFields.map(f => f.checked), checks: checkFields.map(f => f.checked)})); }
    catch (_) { unavailable(); }
  }
  function markedCount() {
    return [0, 1, 4, 5, 6, 7].filter(i => markFields[i].checked).length + Number(markFields[2].checked || markFields[3].checked);
  }
  function updateMarks() {
    document.getElementById('ps-practice-count').textContent = `${markedCount()} of 7 discussion topics marked. Questions 3 and 4 count as one choice.`;
    result.hidden = true; result.textContent = '';
  }
  [...markFields, ...checkFields].forEach(field => field.addEventListener('change', () => { updateMarks(); save(); }));
  document.getElementById('ps-review').addEventListener('click', () => {
    const next = !checkFields[0].checked ? 'Next time, answer the topic of the question directly.'
      : !checkFields[1].checked ? 'Next time, include a personality adjective.'
        : !checkFields[2].checked ? 'Next time, add a reason with because or give an example.'
          : 'You marked all three self-check points. Try another question or give a more detailed example.';
    result.textContent = `You marked ${markedCount()} of 7 discussion topics and ${checkFields.filter(f => f.checked).length} of 3 self-check points. ${next} This reflects your own marks; it is not an automatic assessment of your speaking.`;
    result.hidden = false; result.focus(); save();
  });
  function recordingPlayers() { return [...document.querySelectorAll('.ps-clip audio')]; }
  function stopSupport() {
    token++; support.pause(); vocabulary.setPlaying(null);
  }
  function pauseRecordings(except = null) { recordingPlayers().forEach(audio => { if (audio !== except) audio.pause(); }); }
  function status(id, text) { document.getElementById('record-status-' + id).textContent = text; }
  function time(ms) { const s = Math.floor(ms / 1000); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
  function clearURL(id) {
    const audio = document.querySelector('#clip-' + id + ' audio');
    audio.pause(); audio.removeAttribute('src'); audio.load();
    if (urls.has(id)) URL.revokeObjectURL(urls.get(id));
    urls.delete(id);
  }
  function showClip(id) {
    clearURL(id);
    const clip = clips.get(id), container = document.getElementById('clip-' + id);
    container.hidden = !clip;
    if (clip) {
      const url = URL.createObjectURL(clip.blob); urls.set(id, url);
      container.querySelector('audio').src = url;
      const link = container.querySelector('[data-ps-download]');
      link.href = url;
      link.download = 'my-personality-question-' + id + (clip.blob.type.includes('mp4') ? '.m4a' : clip.blob.type.includes('ogg') ? '.ogg' : '.webm');
      status(id, 'Recording ready · ' + time(clip.elapsed) + '. Listen to yourself or record again.');
    }
    document.querySelector('[data-ps-undo="' + id + '"]').hidden = !removed.has(id);
    document.querySelector('[data-ps-record="' + id + '"] span').textContent = clip ? 'Record again' : 'Record';
  }
  const controller = window.createPersonalityRecorder({
    onState(state) {
      const busy = state.phase !== 'idle';
      document.querySelectorAll('[data-ps-record],[data-ps-question],[data-ps-remove],[data-ps-undo]').forEach(button => { button.disabled = busy; });
      document.querySelectorAll('[data-ps-stop]').forEach(button => {
        const own = Number(button.dataset.psStop) === state.id;
        button.hidden = !(busy && own);
        button.disabled = state.phase === 'stopping';
        button.textContent = state.phase === 'requesting' ? 'Cancel request' : 'Stop recording';
        button.setAttribute('aria-label', (state.phase === 'requesting' ? 'Cancel microphone request ' : 'Stop recording ') + button.dataset.psStop);
      });
      document.querySelectorAll('.ps-question').forEach(card => { card.dataset.recording = String(busy && card.id === 'question-' + state.id); });
      if (state.phase === 'recording') status(state.id, 'Recording · ' + time(state.elapsedMs) + ' / 2:00. Stop when you finish.');
      else if (state.message) status(state.id, state.message.startsWith('Recording ready') && clips.has(state.id)
        ? 'Recording ready · ' + time(clips.get(state.id).elapsed) + '. Listen to yourself or record again.' : state.message);
    },
    onClip(id, blob, elapsed) {
      clips.set(id, {blob, elapsed}); removed.delete(id); showClip(id);
    }
  });
  async function playSupport(path, text, wordButton = null) {
    if (controller.active) { audioStatus.textContent = 'Stop your recording before listening to support audio.'; return; }
    stopSupport(); pauseRecordings();
    const request = ++token;
    support.src = path; support.playbackRate = speed;
    if (wordButton) vocabulary.setPlaying(wordButton);
    audioStatus.textContent = 'Loading audio: ' + text;
    try { await support.play(); if (request === token) audioStatus.textContent = 'Playing: ' + text; }
    catch (_) { if (request === token) { stopSupport(); audioStatus.textContent = 'Audio could not play. Check your connection and tap the same question or word to retry.'; } }
  }
  const vocabulary = window.FirstVisitVocabulary(data.vocabulary, (entry, button) => playSupport(entry.audio, entry.term, button));
  document.querySelectorAll('[data-glossary]').forEach(el => vocabulary.render(el, el.textContent));
  document.querySelectorAll('[data-ps-question]').forEach(button => button.addEventListener('click', () => {
    const q = data.questions.find(q => q.number === Number(button.dataset.psQuestion));
    playSupport(q.audio, q.text);
  }));
  support.addEventListener('ended', () => { stopSupport(); audioStatus.textContent = 'Finished. Discuss your answer or listen again.'; });
  support.addEventListener('error', () => { stopSupport(); audioStatus.textContent = 'Audio could not load. Check your connection and tap the same question or word to retry.'; });
  document.querySelectorAll('[data-ps-speed]').forEach(button => button.addEventListener('click', () => {
    speed = Number(button.dataset.psSpeed); support.playbackRate = speed;
    document.querySelectorAll('[data-ps-speed]').forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.psSpeed) === speed)));
    audioStatus.textContent = 'Support audio speed: ' + speed + '×.';
  }));
  document.querySelector('[data-ps-stop-audio]').addEventListener('click', () => { stopSupport(); audioStatus.textContent = 'Support audio stopped.'; });
  document.querySelectorAll('[data-ps-record]').forEach(button => button.addEventListener('click', () => {
    stopSupport(); pauseRecordings(); vocabulary.hide(); controller.start(Number(button.dataset.psRecord));
  }));
  document.querySelectorAll('[data-ps-stop]').forEach(button => button.addEventListener('click', () => controller.stop()));
  recordingPlayers().forEach(audio => {
    audio.addEventListener('play', () => {
      if (controller.active) { audio.pause(); return; }
      stopSupport(); pauseRecordings(audio);
    });
    audio.addEventListener('error', () => {
      const id = Number(audio.closest('.ps-clip').id.split('-')[1]);
      if (clips.has(id)) status(id, 'This recording could not play. You can download it or record again.');
    });
  });
  document.querySelectorAll('[data-ps-remove]').forEach(button => button.addEventListener('click', () => {
    const id = Number(button.dataset.psRemove);
    if (!clips.has(id) || controller.active) return;
    removed.set(id, clips.get(id)); clips.delete(id); showClip(id);
    status(id, 'Recording removed. Choose Undo remove to recover it.');
  }));
  document.querySelectorAll('[data-ps-undo]').forEach(button => button.addEventListener('click', () => {
    const id = Number(button.dataset.psUndo);
    if (!removed.has(id) || controller.active) return;
    clips.set(id, removed.get(id)); removed.delete(id); showClip(id);
  }));
  function revealHash() {
    let id; try { id = decodeURIComponent(location.hash.slice(1)); } catch (_) { return; }
    const el = id && document.getElementById(id);
    if (!el) return;
    let folder = el.closest('details');
    while (folder) { folder.open = true; folder = folder.parentElement?.closest('details'); }
    el.scrollIntoView({block: 'start'});
  }
  document.getElementById('discussion-practice').addEventListener('toggle', event => {
    if (!event.target.open) { controller.stop(); stopSupport(); pauseRecordings(); }
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { controller.stop(); stopSupport(); pauseRecordings(); vocabulary.hide(); }
  });
  window.addEventListener('pagehide', () => { controller.cancel(); stopSupport(); pauseRecordings(); vocabulary.hide(); });
  window.addEventListener('hashchange', revealHash);
  updateMarks(); if (location.hash) revealHash();
})();
