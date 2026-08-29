(() => {
  'use strict';

  document.querySelectorAll('.ie2-unit3-check').forEach((form) => {
    const button = form.querySelector('[data-unit3-check]');
    const feedback = form.querySelector('.ie2-unit3-feedback');
    if (!button || !feedback) return;

    button.addEventListener('click', () => {
      const selected = form.querySelector('input[type="radio"]:checked');
      form.querySelectorAll('label').forEach((label) => label.classList.remove('is-correct', 'is-incorrect'));
      if (!selected) {
        feedback.className = 'ie2-unit3-feedback is-warning';
        feedback.textContent = 'Choose one response first. This check is private and has no score.';
        return;
      }
      const isCorrect = selected.value === form.dataset.correct;
      const selectedLabel = selected.closest('label');
      if (selectedLabel) selectedLabel.classList.add(isCorrect ? 'is-correct' : 'is-incorrect');
      feedback.className = `ie2-unit3-feedback ${isCorrect ? 'is-correct' : 'is-incorrect'}`;
      feedback.textContent = isCorrect
        ? 'Correct. Notice the form and keep this model for your next real conversation.'
        : 'Not yet. Compare the grammar and meaning with the explanation above, then try again. This check is private and has no score.';
    });
  });
})();
