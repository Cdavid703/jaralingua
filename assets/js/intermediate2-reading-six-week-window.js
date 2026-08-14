(function () {
  "use strict";

  const predictionButtons = [...document.querySelectorAll("[data-reading-prediction]")];
  const predictionStatus = document.getElementById("sixWeekPredictionStatus");
  const quiz = document.getElementById("sixWeekReadingQuiz");
  const checkQuizButton = document.getElementById("checkSixWeekReading");
  const quizResult = document.getElementById("sixWeekReadingResult");

  predictionButtons.forEach((button) => {
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", () => {
      predictionButtons.forEach((item) => {
        item.classList.remove("is-selected");
        item.setAttribute("aria-pressed", "false");
      });
      button.classList.add("is-selected");
      button.setAttribute("aria-pressed", "true");
      predictionStatus.textContent = `Your prediction: ${button.dataset.readingPrediction}. Read to check it.`;
    });
  });

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
      feedback.textContent = `${isCorrect ? "Correct." : "Review the story evidence."} ${card.dataset.feedback}`;
      feedback.className = `ie2-question-feedback show ${isCorrect ? "correct" : "needs-review"}`;
    });

    if (answered < questions.length) {
      quizResult.className = "ie2-reading-result show needs-review";
      quizResult.textContent = `Answer all 10 questions. Completed: ${answered} of ${questions.length}.`;
      return;
    }

    quizResult.className = `ie2-reading-result show ${correct === questions.length ? "correct" : "needs-review"}`;
    quizResult.textContent = `${correct} of ${questions.length} correct. ${correct === questions.length ? "Excellent evidence reading. You followed the complete decision." : "Use the evidence below each marked question, reread the relevant chapter and try again."}`;
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
}());
