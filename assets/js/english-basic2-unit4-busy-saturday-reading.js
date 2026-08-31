(() => {
  const questions = [
    ['Why did Daniel wake up early?', ['Because he had a family party.', 'Because he wanted to finish several jobs before dinner.', 'Because Mateo called him.'], 'B', 'Daniel woke up early to finish several jobs before dinner.'],
    ['What did Daniel do first?', ['He cleaned his apartment and studied English.', 'He played soccer in the park.', 'He watched a movie.'], 'A', 'The first actions in the story were cleaning his apartment and studying English.'],
    ['Who came over with coffee and breakfast?', ['Mateo', 'Daniel’s sister', 'Valeria'], 'C', 'Daniel’s cousin Valeria came over with coffee and breakfast.'],
    ['What did Daniel help Valeria choose?', ['A bus ticket', 'A jacket for a family party', 'A soccer ball'], 'B', 'He helped Valeria choose a jacket for her family party.'],
    ['What did Daniel do after Valeria visited?', ['He went to bed.', 'He cooked pasta.', 'He picked up Mateo and played soccer.'], 'C', 'After Valeria’s visit, Daniel picked up Mateo and they played soccer.'],
    ['What happened during the soccer game?', ['It rained for a few minutes.', 'The game ended immediately.', 'Valeria arrived with breakfast.'], 'A', 'The story says it rained briefly, but the game continued.'],
    ['Why was Daniel tired when he arrived home?', ['He did not eat dinner.', 'He was on the go all day.', 'He watched a long movie.'], 'B', '“On the go” means busy and active in several places or activities.'],
    ['What did Daniel do before he called it a night?', ['He cooked pasta and watched a movie.', 'He bought a jacket.', 'He studied with Valeria.'], 'A', 'In the evening, Daniel cooked pasta, watched a movie, and then went to bed.'],
    ['Who called Daniel just before bed?', ['Mateo', 'A bus driver', 'Valeria'], 'C', 'Valeria called Daniel and asked for his help on Sunday morning.'],
    ['What will readers discover in Part 2?', ['Whether Daniel won the soccer game.', 'Where Daniel and Valeria were going on Sunday.', 'What jacket Valeria bought.'], 'B', 'The reading ends before Daniel learns their Sunday destination; Part 2 will reveal it.']
  ];
  const letters = ['A', 'B', 'C'];
  const root = document.getElementById('readingQuestions');
  const score = document.getElementById('readingScore');
  const progress = document.getElementById('readingProgress');
  const summary = document.getElementById('readingSummary');

  function updateProgress() {
    const done = questions.filter((_, index) => document.querySelector(`input[name="readingQ${index}"]:checked`)).length;
    progress.style.width = `${(done / questions.length) * 100}%`;
  }

  function render() {
    root.innerHTML = questions.map(([question, options], index) => `<article class="reading-question" data-question="${index}"><h3>${index + 1}. ${question}</h3><div class="reading-options">${options.map((option, optionIndex) => `<label class="reading-option"><input type="radio" name="readingQ${index}" value="${letters[optionIndex]}"><span><b>${letters[optionIndex]}.</b> ${option}</span></label>`).join('')}</div><div class="reading-feedback"></div></article>`).join('');
    updateProgress();
  }

  root.addEventListener('change', updateProgress);
  document.getElementById('readingCheck').addEventListener('click', () => {
    let correct = 0;
    let unanswered = 0;
    questions.forEach(([, , answer, reason], index) => {
      const card = root.querySelector(`[data-question="${index}"]`);
      const selected = card.querySelector(`input[name="readingQ${index}"]:checked`);
      const feedback = card.querySelector('.reading-feedback');
      card.querySelectorAll('.reading-option').forEach(option => option.classList.remove('is-correct', 'is-wrong'));
      if (!selected) {
        unanswered += 1;
        feedback.className = 'reading-feedback show bad';
        feedback.textContent = 'Choose an answer before checking this question.';
        return;
      }
      const isCorrect = selected.value === answer;
      selected.closest('.reading-option').classList.add(isCorrect ? 'is-correct' : 'is-wrong');
      card.querySelector(`input[value="${answer}"]`).closest('.reading-option').classList.add('is-correct');
      feedback.className = `reading-feedback show ${isCorrect ? 'good' : 'bad'}`;
      feedback.innerHTML = `<strong>${isCorrect ? 'Correct.' : 'Review the story.'}</strong> ${reason}`;
      if (isCorrect) correct += 1;
    });
    score.textContent = `Score: ${correct} / ${questions.length}`;
    summary.className = 'reading-summary show';
    const level = correct >= 9 ? 'Excellent reading!' : correct >= 7 ? 'Good progress!' : 'Read once more and try again.';
    summary.innerHTML = `<h2>${level}</h2><p>You answered ${correct} of ${questions.length} questions correctly.${unanswered ? ` ${unanswered} question${unanswered === 1 ? ' was' : 's were'} unanswered.` : ''} Review the feedback and use the last phone call to predict Part 2.</p>`;
    summary.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
  document.getElementById('readingReset').addEventListener('click', () => {
    score.textContent = 'Score: 0 / 10';
    summary.className = 'reading-summary';
    render();
    document.getElementById('reading-questions').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  render();
})();
