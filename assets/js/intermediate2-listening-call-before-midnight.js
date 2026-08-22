(function () {
  "use strict";

  const audio = document.getElementById("midnightCallAudio");
  const audioStatus = document.getElementById("midnightAudioStatus");
  const speedButtons = [...document.querySelectorAll("[data-audio-speed]")];
  const passButtons = [...document.querySelectorAll("[data-listen-pass]")];
  const passStatus = document.getElementById("listeningPassStatus");
  const quiz = document.getElementById("midnightListeningQuiz");
  const checkQuizButton = document.getElementById("checkMidnightListening");
  const quizResult = document.getElementById("midnightListeningResult");
  const timerDisplay = document.getElementById("midnightSpeakingTimer");
  const startTimerButton = document.getElementById("startMidnightSpeakingTimer");
  const resetTimerButton = document.getElementById("resetMidnightSpeakingTimer");
  const completedPasses = new Set();
  let timerSeconds = 45;
  let timerId = null;

  function renderTimer() {
    const minutes = Math.floor(timerSeconds / 60);
    const seconds = timerSeconds % 60;
    timerDisplay.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  function stopTimer() {
    if (timerId) {
      window.clearInterval(timerId);
      timerId = null;
    }
  }

  speedButtons.forEach((button) => button.addEventListener("click", () => {
    const speed = Number(button.dataset.audioSpeed);
    audio.playbackRate = speed;
    speedButtons.forEach((item) => item.classList.toggle("is-active", item === button));
    audioStatus.textContent = `Playback speed set to ${speed}x.`;
  }));

  audio.addEventListener("play", () => { audioStatus.textContent = "Playing the conversation with Salomé and Mr. Vega."; });
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

  checkQuizButton.addEventListener("click", () => {
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
    if (answered < questions.length) {
      quizResult.className = "ie2-reading-result show needs-review";
      quizResult.textContent = `Answer all 10 questions. Completed: ${answered} of ${questions.length}.`;
      return;
    }
    quizResult.className = `ie2-reading-result show ${correct === questions.length ? "correct" : "needs-review"}`;
    quizResult.textContent = `${correct} of ${questions.length} correct. ${correct === questions.length ? "Excellent listening. You separated facts from the unresolved ending." : "Use the evidence feedback, listen again and retry the marked questions."}`;
  });

  quiz.addEventListener("reset", () => window.setTimeout(() => {
    quiz.querySelectorAll(".ie2-reading-question").forEach((card) => {
      const feedback = card.querySelector(".ie2-question-feedback");
      card.classList.remove("is-correct", "needs-review");
      feedback.className = "ie2-question-feedback";
      feedback.textContent = "";
    });
    quizResult.className = "ie2-reading-result";
    quizResult.textContent = "";
  }, 0));

  startTimerButton.addEventListener("click", () => {
    if (timerId) {
      stopTimer();
      startTimerButton.textContent = "Continue";
      return;
    }
    if (timerSeconds === 0) timerSeconds = 45;
    renderTimer();
    startTimerButton.textContent = "Pause";
    timerId = window.setInterval(() => {
      timerSeconds -= 1;
      renderTimer();
      if (timerSeconds <= 0) {
        stopTimer();
        startTimerButton.textContent = "Start again";
        timerDisplay.textContent = "Done!";
      }
    }, 1000);
  });

  resetTimerButton.addEventListener("click", () => {
    stopTimer();
    timerSeconds = 45;
    startTimerButton.textContent = "Start 45 seconds";
    renderTimer();
  });

  renderTimer();
}());
