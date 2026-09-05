(function () {
  "use strict";

  const predictionButtons = [...document.querySelectorAll("[data-reading-prediction]")];
  const predictionStatus = document.getElementById("sessionPredictionStatus");
  const quiz = document.getElementById("sessionReadingQuiz");
  const checkButton = document.getElementById("checkSessionReading");
  const result = document.getElementById("sessionReadingResult");

  predictionButtons.forEach((button) => button.addEventListener("click", () => {
    predictionButtons.forEach((item) => {
      const selected = item === button;
      item.classList.toggle("is-selected", selected);
      item.setAttribute("aria-pressed", String(selected));
    });
    predictionStatus.textContent = `Your prediction: ${button.dataset.readingPrediction}. Read to check it.`;
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
      feedback.textContent = `${isCorrect ? "Correct." : "Review the story evidence."} ${card.dataset.feedback}`;
      feedback.className = `ie2-question-feedback show ${isCorrect ? "correct" : "needs-review"}`;
    });
    result.className = `ie2-reading-result show ${answered === questions.length && correct === questions.length ? "correct" : "needs-review"}`;
    result.textContent = answered < questions.length
      ? `Answer all 8 questions. Completed: ${answered} of ${questions.length}.`
      : `${correct} of ${questions.length} correct. ${correct === questions.length ? "Excellent. You separated the hardware problem from the security incident." : "Use the evidence feedback, reread the relevant section and try again."}`;
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
}());
