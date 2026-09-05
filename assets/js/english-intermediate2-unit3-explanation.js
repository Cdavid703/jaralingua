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

  const expressionAudioButtons = Array.from(document.querySelectorAll('[data-expression-audio]'));
  const expressionAudios = Array.from(document.querySelectorAll('.ie2-unit3-audio-model audio'));

  const resetExpressionAudioState = (audio) => {
    expressionAudioButtons
      .filter((button) => button.dataset.expressionAudio === audio.id)
      .forEach((button) => {
        button.classList.remove('is-playing');
        button.setAttribute('aria-pressed', 'false');
      });
  };

  expressionAudios.forEach((audio) => {
    audio.addEventListener('ended', () => resetExpressionAudioState(audio));
    audio.addEventListener('error', () => resetExpressionAudioState(audio));
  });

  expressionAudioButtons.forEach((button) => {
    button.setAttribute('aria-pressed', 'false');
    const expressionName = button.closest('.ie2-unit3-expression-card')?.querySelector('h3')?.textContent?.trim();
    if (expressionName) button.setAttribute('aria-label', `${button.textContent.trim()}: ${expressionName}`);
    button.addEventListener('click', async () => {
      const audio = document.getElementById(button.dataset.expressionAudio || '');
      if (!(audio instanceof HTMLAudioElement)) return;

      expressionAudios.forEach((candidate) => {
        if (candidate !== audio) {
          candidate.pause();
          candidate.currentTime = 0;
        }
      });
      expressionAudioButtons.forEach((candidate) => {
        candidate.classList.remove('is-playing');
        candidate.setAttribute('aria-pressed', 'false');
      });

      audio.pause();
      audio.currentTime = 0;
      audio.playbackRate = Number(button.dataset.rate) || 1;
      button.classList.add('is-playing');
      button.setAttribute('aria-pressed', 'true');
      try {
        await audio.play();
      } catch (error) {
        resetExpressionAudioState(audio);
      }
    });
  });
})();
