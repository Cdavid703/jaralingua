/* First Connections: local formative reading practice, no grade or submission. */
(() => {
  'use strict';
  const form = document.getElementById('pi-reading-quiz');
  const data = document.getElementById('pi-reading-data');
  if (!form || !data) return;
  const questions = JSON.parse(data.textContent);
  const storageKey = 'jl-preintermediate1-unit1-first-connections-v1';
  const count = document.getElementById('pi-answer-count');
  const result = document.getElementById('pi-reading-result');
  let checked = false;

  function answers() {
    return Object.fromEntries(questions.map(q => [q.id, form.querySelector(`input[name="${q.id}"]:checked`)?.value || '']));
  }
  function save() {
    try { sessionStorage.setItem(storageKey, JSON.stringify({ version: 1, answers: answers(), checked })); }
    catch (_) { /* Practice and feedback still work if browser storage is unavailable. */ }
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
  function check(moveFocus = true) {
    const selected = answers();
    const missing = questions.filter(q => !selected[q.id]);
    if (missing.length) {
      clearFeedback();
      missing.forEach(q => document.getElementById(q.id).classList.add('is-unanswered'));
      result.textContent = `Choose an answer for ${missing.length} more ${missing.length === 1 ? 'question' : 'questions'}, then check again.`;
      result.hidden = false;
      if (moveFocus) form.querySelector(`input[name="${missing[0].id}"]`).focus();
      save();
      return;
    }
    let correct = 0;
    questions.forEach(q => {
      const card = document.getElementById(q.id);
      const right = selected[q.id] === q.answer;
      if (right) correct++;
      card.classList.remove('is-unanswered');
      card.classList.toggle('is-correct', right);
      card.classList.toggle('is-review', !right);
      card.querySelector('.pi-feedback-answer').textContent = `${right ? 'Correct.' : 'Review this answer.'} ${q.answer}. ${q.options[q.answer]}`;
      card.querySelector('.pi-feedback-explanation').textContent = q.explanation;
      card.querySelector('.pi-feedback-evidence').textContent = `Paragraph ${q.paragraph}: “${q.evidence}”`;
      const link = card.querySelector('.pi-evidence-link');
      link.href = `#reading-p${q.paragraph}`;
      link.textContent = `Read paragraph ${q.paragraph}`;
      card.querySelector('.pi-question-feedback').hidden = false;
    });
    checked = true;
    result.textContent = `${correct} of ${questions.length} answers correct. ${correct === questions.length ? 'You connected the details with evidence. Read the explanations to review.' : 'Read the explanations and return to the story. You can change your answers and check again.'} This is formative practice.`;
    result.hidden = false;
    if (moveFocus) result.focus();
    save();
  }

  form.addEventListener('submit', event => { event.preventDefault(); check(); });
  form.addEventListener('change', () => { clearFeedback(); updateCount(); save(); });
  document.getElementById('pi-reading-reset').addEventListener('click', () => {
    form.reset();
    clearFeedback();
    updateCount();
    try { sessionStorage.removeItem(storageKey); } catch (_) {}
    form.querySelector('input').focus();
  });
  try {
    const draft = JSON.parse(sessionStorage.getItem(storageKey) || 'null');
    if (draft?.version === 1 && draft.answers && typeof draft.answers === 'object') {
      questions.forEach(q => {
        const value = draft.answers[q.id];
        if (!Object.hasOwn(q.options, value)) return;
        form.querySelector(`input[name="${q.id}"][value="${value}"]`).checked = true;
      });
      if (draft.checked === true) check(false);
    }
  } catch (_) { /* A malformed or unavailable draft never blocks the reading. */ }
  updateCount();
})();
