(function () {
  "use strict";
  const MAX_QUESTIONS = 10;
  const allData = Array.isArray(window.quizData) ? window.quizData : [];
  if (!allData.length) return;

  const root = document.querySelector("[data-quiz]");
  if (!root) return;

  /* --- Shuffle helper (Fisher-Yates) --- */
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /* --- Select a random subset of up to MAX_QUESTIONS --- */
  function pickQuestions() {
    if (allData.length <= MAX_QUESTIONS) return shuffle(allData);
    return shuffle(allData).slice(0, MAX_QUESTIONS);
  }

  let data = pickQuestions();
  const state = { index: 0, score: 0, answered: false };
  const progress = document.querySelector("[data-quiz-progress]");
  const scoreEl = document.querySelector("[data-quiz-score]");

  function render() {
    const item = data[state.index];
    state.answered = false;

    /* Shuffle options while tracking the new position of the correct answer */
    const indexed = item.options.map((text, i) => ({ text, orig: i }));
    const shuffled = shuffle(indexed);
    const correctShuffled = shuffled.findIndex(o => o.orig === item.answer);

    root.innerHTML = `
      <div class="question-card">
        <p class="section-kicker">Question ${state.index + 1} sur ${data.length}</p>
        <h2 class="h4">${item.question}</h2>
        ${item.audio ? `<button class="audio-btn mb-3" type="button" data-question-audio="${item.audio}"><i class="bi bi-volume-up-fill"></i> Écouter</button>` : ""}
        <div class="option-grid">${shuffled.map((opt, idx) => `<button class="option-btn" type="button" data-option="${idx}">${opt.text}</button>`).join("")}</div>
        <div class="feedback-box" aria-live="polite">Choisissez une réponse.</div>
      </div>`;
    progress.style.width = `${(state.index / data.length) * 100}%`;
    scoreEl.textContent = `${state.score} point${state.score > 1 ? "s" : ""}`;

    root.querySelectorAll("[data-option]").forEach(btn =>
      btn.addEventListener("click", () => answer(btn, item, correctShuffled))
    );
    const audioBtn = root.querySelector("[data-question-audio]");
    if (audioBtn) audioBtn.addEventListener("click", () =>
      new Audio(audioBtn.dataset.questionAudio).play().catch(() => {
        root.querySelector(".feedback-box").textContent = "L'audio n'a pas pu être chargé.";
      })
    );
  }

  function answer(button, item, correctIdx) {
    if (state.answered) return;
    state.answered = true;
    const selected = Number(button.dataset.option);
    const buttons = [...root.querySelectorAll("[data-option]")];
    buttons.forEach((opt, idx) => {
      opt.disabled = true;
      if (idx === correctIdx) opt.classList.add("correct");
    });
    if (selected === correctIdx) {
      state.score += 1;
      button.classList.add("correct");
      root.querySelector(".feedback-box").innerHTML = `<strong>Bravo !</strong> ${item.explanation || "Bonne réponse."}`;
    } else {
      button.classList.add("wrong");
      root.querySelector(".feedback-box").innerHTML = `<strong>Pas encore.</strong> ${item.explanation || "Observez la correction."}`;
    }
    scoreEl.textContent = `${state.score} point${state.score > 1 ? "s" : ""}`;
    const next = document.createElement("button");
    next.type = "button";
    next.className = "btn-main mt-3";
    next.textContent = state.index + 1 === data.length ? "Voir mon résultat" : "Question suivante";
    next.addEventListener("click", advance);
    root.querySelector(".question-card").appendChild(next);
  }

  function advance() {
    state.index += 1;
    if (state.index < data.length) return render();
    progress.style.width = "100%";
    const percent = Math.round((state.score / data.length) * 100);
    let level, feedback;
    if (percent === 100) { level = "Parfait"; feedback = "Vous avez tout réussi !"; }
    else if (percent >= 80) { level = "Excellent"; feedback = "Excellent travail !"; }
    else if (percent >= 60) { level = "Bon"; feedback = "Bonne base : refaites les questions difficiles."; }
    else { level = "En progrès"; feedback = "Reprenez la théorie puis essayez encore."; }
    root.innerHTML = `<div class="score-panel"><p class="section-kicker text-white">Atelier terminé</p><h2>${state.score} / ${data.length}</h2><p>${feedback}</p><button class="btn-soft" type="button" data-restart>Recommencer</button></div>`;
    root.querySelector("[data-restart]").addEventListener("click", restart);
  }

  function restart() {
    data = pickQuestions();
    state.index = 0;
    state.score = 0;
    render();
  }

  render();
})();
