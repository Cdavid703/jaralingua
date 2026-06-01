(function () {
  const forms = Array.from(document.querySelectorAll("[data-sports-grammar-form]"));
  const checkButton = document.querySelector("[data-sports-check]");
  const resetButton = document.querySelector("[data-sports-reset]");
  const scoreBox = document.querySelector("[data-sports-score]");

  if (!forms.length || !checkButton || !scoreBox) return;

  function checkAnswers() {
    const items = forms.flatMap((form) => Array.from(form.querySelectorAll("[data-answer]")));
    let score = 0;
    let complete = true;

    items.forEach((item) => {
      const selected = item.querySelector("input:checked");
      const feedback = item.querySelector(".sports-feedback");
      const answer = item.dataset.answer;
      const explanation = item.dataset.explanation || "";

      feedback.hidden = false;
      if (!selected) {
        complete = false;
        feedback.className = "sports-feedback incorrect";
        feedback.textContent = "Choose one option before checking.";
        return;
      }

      if (selected.value === answer) {
        score += 1;
        feedback.className = "sports-feedback correct";
        feedback.textContent = "Correct. " + explanation;
      } else {
        feedback.className = "sports-feedback incorrect";
        feedback.textContent = "Not quite. " + explanation;
      }
    });

    scoreBox.style.display = "block";
    scoreBox.className = score === items.length && complete ? "quiz-result-box correct" : "quiz-result-box incorrect";
    scoreBox.textContent = complete
      ? "Score: " + score + " / " + items.length
      : "Answer all items. Current score: " + score + " / " + items.length;
  }

  function resetAnswers() {
    forms.forEach((form) => form.reset());
    forms.forEach((form) => form.querySelectorAll(".sports-feedback").forEach((feedback) => {
      feedback.hidden = true;
      feedback.textContent = "";
      feedback.className = "sports-feedback";
    }));
    scoreBox.style.display = "none";
    scoreBox.textContent = "";
  }

  checkButton.addEventListener("click", checkAnswers);
  if (resetButton) resetButton.addEventListener("click", resetAnswers);
})();
