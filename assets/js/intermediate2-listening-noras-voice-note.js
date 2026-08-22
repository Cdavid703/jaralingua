(function () {
  "use strict";

  var audio = document.getElementById("noraVoiceNoteAudio");
  var audioStatus = document.getElementById("noraAudioStatus");
  var speedButtons = document.querySelectorAll("[data-audio-speed]");
  var passButtons = document.querySelectorAll("[data-listen-pass]");
  var passStatus = document.getElementById("listeningPassStatus");
  var quiz = document.getElementById("noraListeningQuiz");
  var checkQuizButton = document.getElementById("checkNoraListening");
  var quizResult = document.getElementById("noraListeningResult");
  var timerDisplay = document.getElementById("noraSpeakingTimer");
  var startTimerButton = document.getElementById("startNoraSpeakingTimer");
  var resetTimerButton = document.getElementById("resetNoraSpeakingTimer");
  var completedPasses = new Set();
  var timerSeconds = 60;
  var timerId = null;

  function renderTimer() {
    var minutes = Math.floor(timerSeconds / 60);
    var seconds = timerSeconds % 60;
    timerDisplay.textContent =
      String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
  }

  function stopTimer() {
    if (timerId) {
      window.clearInterval(timerId);
      timerId = null;
    }
  }

  speedButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      var speed = Number(button.dataset.audioSpeed);
      audio.playbackRate = speed;
      speedButtons.forEach(function (item) {
        item.classList.toggle("is-active", item === button);
      });
      audioStatus.textContent = "Playback speed set to " + speed + "x.";
    });
  });

  audio.addEventListener("play", function () {
    audioStatus.textContent = "Playing Nora's voice note.";
  });

  audio.addEventListener("pause", function () {
    if (!audio.ended) {
      audioStatus.textContent = "Paused. Continue when you are ready.";
    }
  });

  audio.addEventListener("ended", function () {
    audioStatus.textContent = "Listening complete. Replay for details or continue to the questions.";
  });

  audio.addEventListener("error", function () {
    audioStatus.textContent = "The audio could not load. Refresh the page and try again.";
  });

  passButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      var pass = button.dataset.listenPass;
      if (completedPasses.has(pass)) {
        completedPasses.delete(pass);
        button.classList.remove("is-complete");
        button.textContent = pass === "First listen complete"
          ? "Mark first listen complete"
          : "Mark second listen complete";
      } else {
        completedPasses.add(pass);
        button.classList.add("is-complete");
        button.textContent = "Completed - tap to undo";
      }
      passStatus.textContent =
        "Listening progress: " + completedPasses.size + " of 2 passes marked.";
    });
  });

  checkQuizButton.addEventListener("click", function () {
    var questions = quiz.querySelectorAll(".ie2-reading-question");
    var answered = 0;
    var correct = 0;

    questions.forEach(function (card) {
      var selected = card.querySelector("input:checked");
      var feedback = card.querySelector(".ie2-question-feedback");
      card.classList.remove("is-correct", "needs-review");

      if (!selected) {
        feedback.textContent = "Choose one answer before checking.";
        feedback.className = "ie2-question-feedback show needs-review";
        return;
      }

      answered += 1;
      if (selected.value === card.dataset.answer) {
        correct += 1;
        card.classList.add("is-correct");
        feedback.textContent = "Correct. " + card.dataset.feedback;
        feedback.className = "ie2-question-feedback show correct";
      } else {
        card.classList.add("needs-review");
        feedback.textContent = "Listen again for this detail. " + card.dataset.feedback;
        feedback.className = "ie2-question-feedback show needs-review";
      }
    });

    if (answered < questions.length) {
      quizResult.className = "ie2-reading-result show needs-review";
      quizResult.textContent =
        "Answer all 10 questions. Completed: " + answered + " of " + questions.length + ".";
      return;
    }

    quizResult.className =
      "ie2-reading-result show " + (correct === questions.length ? "correct" : "needs-review");
    quizResult.textContent =
      correct +
      " of " +
      questions.length +
      " correct. " +
      (correct === questions.length
        ? "Excellent listening. You are ready to retell Nora's message."
        : "Use the feedback, listen again and retry the marked questions.");
  });

  quiz.addEventListener("reset", function () {
    window.setTimeout(function () {
      quiz.querySelectorAll(".ie2-reading-question").forEach(function (card) {
        var feedback = card.querySelector(".ie2-question-feedback");
        card.classList.remove("is-correct", "needs-review");
        feedback.className = "ie2-question-feedback";
        feedback.textContent = "";
      });
      quizResult.className = "ie2-reading-result";
      quizResult.textContent = "";
    }, 0);
  });

  startTimerButton.addEventListener("click", function () {
    if (timerId) {
      stopTimer();
      startTimerButton.textContent = "Continue";
      return;
    }

    if (timerSeconds === 0) {
      timerSeconds = 60;
      renderTimer();
    }

    startTimerButton.textContent = "Pause";
    timerId = window.setInterval(function () {
      timerSeconds -= 1;
      renderTimer();

      if (timerSeconds <= 0) {
        stopTimer();
        startTimerButton.textContent = "Start again";
        timerDisplay.textContent = "Done!";
      }
    }, 1000);
  });

  resetTimerButton.addEventListener("click", function () {
    stopTimer();
    timerSeconds = 60;
    startTimerButton.textContent = "Start 60 seconds";
    renderTimer();
  });

  renderTimer();
}());
