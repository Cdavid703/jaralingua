/* Formative only: no student records or official scores are sent. */
(() => {
  'use strict';
  const data = JSON.parse(document.getElementById('pv-data').textContent);
  const key = 'jl-pi1-personality-vocabulary-v1';
  const warmup = document.getElementById('pv-warmup');
  const storageStatus = document.getElementById('pv-storage-status');
  let saved = {}, storageAvailable = true;
  const states = {};
  function unavailable() {
    storageAvailable = false;
    storageStatus.hidden = false;
    storageStatus.textContent = 'This browser cannot save your draft. Keep the page open while you practise.';
  }
  try { saved = JSON.parse(sessionStorage.getItem(key) || '{}') || {}; }
  catch (_) { unavailable(); }
  function persist() {
    if (!storageAvailable) return;
    try { sessionStorage.setItem(key, JSON.stringify({tasks: states, warmup: warmup.value})); }
    catch (_) { unavailable(); }
  }
  warmup.value = typeof saved.warmup === 'string' ? saved.warmup.slice(0,1500) : '';
  warmup.addEventListener('input', persist);
  document.querySelectorAll('form[data-task]').forEach(form => {
    const id = form.dataset.task, items = data.tasks[id];
    const selects = [...form.querySelectorAll('select')];
    const result = form.querySelector('.pv-result');
    const previous = saved.tasks?.[id];
    const state = states[id] = {
      answers: selects.map((_,i) => data.words.includes(previous?.answers?.[i]) ? previous.answers[i] : ''),
      attempts: Math.min(2,Math.max(0,Number(previous?.attempts) || 0)),
      last: typeof previous?.last === 'string' ? previous.last : ''
    };
    const signature = () => JSON.stringify(state.answers);
    function count() { form.querySelector('.pv-count').textContent = `${state.answers.filter(Boolean).length} of 9 answered.`; }
    function hideFeedback() {
      result.hidden = true;
      form.querySelectorAll('.pv-feedback').forEach(el => { el.hidden = true; el.textContent = ''; });
    }
    function feedback() {
      const accepted = items.map((item,i) => item.accepted.includes(state.answers[i]));
      const total = accepted.filter(Boolean).length;
      const reveal = state.attempts >= 2 || total === items.length;
      result.hidden = false;
      result.textContent = `${total} of 9 answers accepted. ` + (reveal ? (total === 9 ? 'Well done! Read the explanations below each answer.' : 'Read the explanations below each answer, then change your choices and check again.') : 'Review the word box and try another complete set of answers. Explanations appear after your second different complete attempt.');
      if (reveal) form.querySelectorAll('.pv-feedback').forEach((el,i) => {
        el.hidden = false;
        el.dataset.accepted = String(accepted[i]);
        el.textContent = `${accepted[i] ? 'Accepted.' : 'Review this answer.'} Worksheet match: ${items[i].answer}. ${items[i].explanation}`;
      });
    }
    selects.forEach((select,i) => {
      select.value = state.answers[i];
      select.addEventListener('change', () => {
        state.answers[i] = select.value;
        select.removeAttribute('aria-invalid');
        hideFeedback();count();persist();
      });
    });
    form.addEventListener('submit', event => {
      event.preventDefault(); hideFeedback();
      const missing = selects.find(select => !select.value);
      if (missing) {
        result.hidden = false;result.textContent = 'Choose a word for all nine items before checking. Your answers are still here.';
        missing.setAttribute('aria-invalid','true');missing.focus();return;
      }
      const current = signature();
      if (state.last !== current) {state.attempts = Math.min(2,state.attempts + 1);state.last = current;}
      feedback();persist();result.focus();
    });
    form.querySelector('[data-reset]').addEventListener('click', () => {
      state.answers = selects.map(() => '');state.attempts = 0;state.last = '';
      selects.forEach(select => {select.value='';select.removeAttribute('aria-invalid');});
      hideFeedback();count();persist();selects[0].focus();
    });
    count();
    if (state.last === signature() && state.answers.every(Boolean)) feedback();
  });
  function openHash() {
    let target;try {target = document.getElementById(decodeURIComponent(location.hash.slice(1)));} catch (_) {return;}
    if (!target) return;
    let detail = target.closest('details');
    while (detail) {detail.open = true;detail = detail.parentElement?.closest('details');}
    target.scrollIntoView({block:'start'});
  }
  window.addEventListener('hashchange', openHash);
  if (location.hash) openHash();
})();
