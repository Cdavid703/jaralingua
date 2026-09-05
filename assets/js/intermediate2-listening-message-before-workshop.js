(function () {
  "use strict";

  const audio = document.getElementById("workshopMessageAudio");
  const audioStatus = document.getElementById("workshopAudioStatus");
  const speedButtons = [...document.querySelectorAll("[data-audio-speed]")];
  const passButtons = [...document.querySelectorAll("[data-listen-pass]")];
  const passStatus = document.getElementById("workshopPassStatus");
  const predictionButtons = [...document.querySelectorAll("[data-listening-prediction]")];
  const predictionStatus = document.getElementById("workshopPredictionStatus");
  const quiz = document.getElementById("workshopListeningQuiz");
  const checkButton = document.getElementById("checkWorkshopListening");
  const result = document.getElementById("workshopListeningResult");
  const timer = document.getElementById("workshopSpeakingTimer");
  const startTimer = document.getElementById("startWorkshopSpeakingTimer");
  const resetTimer = document.getElementById("resetWorkshopSpeakingTimer");
  const completedPasses = new Set();
  let timerSeconds = 45;
  let timerId = null;

  speedButtons.forEach((button) => button.addEventListener("click", () => {
    const speed = Number(button.dataset.audioSpeed);
    audio.playbackRate = speed;
    speedButtons.forEach((item) => item.classList.toggle("is-active", item === button));
    audioStatus.textContent = `Playback speed set to ${speed}x.`;
  }));

  audio.addEventListener("play", () => { audioStatus.textContent = "Playing Camila and Daniel's support call."; });
  audio.addEventListener("pause", () => { if (!audio.ended) audioStatus.textContent = "Paused. Continue when you are ready."; });
  audio.addEventListener("ended", () => { audioStatus.textContent = "Listening complete. Replay for evidence or continue to the questions."; });
  audio.addEventListener("error", () => { audioStatus.textContent = "The audio could not load. Refresh the page and try again."; });

  passButtons.forEach((button) => button.addEventListener("click", () => {
    const pass = button.dataset.listenPass;
    if (completedPasses.has(pass)) {
      completedPasses.delete(pass);
      button.classList.remove("is-complete");
      button.textContent = `Mark ${pass.toLowerCase()} complete`;
    } else {
      completedPasses.add(pass);
      button.classList.add("is-complete");
      button.textContent = "Completed · tap to undo";
    }
    passStatus.textContent = `Listening self-check: ${completedPasses.size} of 3 passes marked.`;
  }));

  predictionButtons.forEach((button) => button.addEventListener("click", () => {
    predictionButtons.forEach((item) => {
      const selected = item === button;
      item.classList.toggle("is-selected", selected);
      item.setAttribute("aria-pressed", String(selected));
    });
    predictionStatus.textContent = `Prediction saved: ${button.dataset.listeningPrediction}. Listen for evidence; you can change your answer.`;
  }));

  checkButton.addEventListener("click", () => {
    const questions = [...quiz.querySelectorAll(".ie2-reading-question")];
    let answered = 0;
    let correct = 0;
    questions.forEach((card) => {
      const selected = card.querySelector("input:checked");
      const feedback = card.querySelector(".ie2-question-feedback");
      card.classList.remove("is-correct", "needs-review");
      if (!selected) {
        feedback.textContent = "Choose one answer before checking.";
        feedback.className = "ie2-question-feedback show needs-review";
        return;
      }
      answered += 1;
      const isCorrect = selected.value === card.dataset.answer;
      if (isCorrect) correct += 1;
      card.classList.add(isCorrect ? "is-correct" : "needs-review");
      feedback.textContent = `${isCorrect ? "Correct." : "Listen again for the evidence."} ${card.dataset.feedback}`;
      feedback.className = `ie2-question-feedback show ${isCorrect ? "correct" : "needs-review"}`;
    });
    result.className = `ie2-reading-result show ${answered === questions.length && correct === questions.length ? "correct" : "needs-review"}`;
    result.textContent = answered < questions.length
      ? `Answer all 10 questions. Completed: ${answered} of ${questions.length}.`
      : `${correct} of ${questions.length} correct. ${correct === questions.length ? "Excellent. You separated the technical problem from the security risk." : "Use the evidence feedback, listen again and retry."}`;
  });

  quiz.addEventListener("reset", () => window.setTimeout(() => {
    quiz.querySelectorAll(".ie2-reading-question").forEach((card) => {
      card.classList.remove("is-correct", "needs-review");
      const feedback = card.querySelector(".ie2-question-feedback");
      feedback.className = "ie2-question-feedback";
      feedback.textContent = "";
    });
    result.className = "ie2-reading-result";
    result.textContent = "";
  }, 0));

  function renderTimer() {
    timer.textContent = `${String(Math.floor(timerSeconds / 60)).padStart(2, "0")}:${String(timerSeconds % 60).padStart(2, "0")}`;
  }
  function stopTimer() {
    if (timerId) window.clearInterval(timerId);
    timerId = null;
  }
  startTimer.addEventListener("click", () => {
    if (timerId) {
      stopTimer();
      startTimer.textContent = "Continue";
      return;
    }
    if (timerSeconds === 0) timerSeconds = 45;
    startTimer.textContent = "Pause";
    timerId = window.setInterval(() => {
      timerSeconds -= 1;
      renderTimer();
      if (timerSeconds <= 0) {
        stopTimer();
        startTimer.textContent = "Start again";
        timer.textContent = "Done!";
      }
    }, 1000);
  });
  resetTimer.addEventListener("click", () => {
    stopTimer();
    timerSeconds = 45;
    startTimer.textContent = "Start 45 seconds";
    renderTimer();
  });
  renderTimer();
}());
