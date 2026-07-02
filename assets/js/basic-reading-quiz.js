(function() {
  function getQuestionNumber(card, index) {
    const heading = card.querySelector("h3");
    const match = heading && heading.textContent.match(/^\s*(\d+)/);
    return match ? match[1] : String(index + 1);
  }

  function checkBasicReadingAnswers() {
    const form = document.querySelector("[data-reading-quiz]");
    const resultBox = document.getElementById("result-box");
    if (!form || !resultBox) return;

    const cards = Array.from(form.querySelectorAll(".quiz-question-card[data-answer]"));
    let score = 0;
    let complete = true;

    const details = cards.map(function(card, index) {
      const answer = card.dataset.answer;
      const radio = card.querySelector('input[type="radio"]');
      const name = radio && radio.name;
      const selected = name ? form.querySelector('input[name="' + name + '"]:checked') : null;
      if (!selected) complete = false;
      if (selected && selected.value === answer) score++;
      return getQuestionNumber(card, index) + ": " + answer + " - " + (card.dataset.feedback || "Correct answer");
    });

    resultBox.style.display = "block";
    if (!complete) {
      resultBox.className = "quiz-result-box incorrect";
      resultBox.innerHTML = "Please answer all questions before checking.";
      return;
    }

    if (score === cards.length) {
      resultBox.className = "quiz-result-box correct";
      resultBox.innerHTML = "Excellent! You got " + score + " out of " + cards.length + " correct.";
      return;
    }

    resultBox.className = "quiz-result-box incorrect";
    resultBox.innerHTML = "You got " + score + " out of " + cards.length + " correct.<br><br><strong>Correct Answers:</strong><br>" + details.join("<br>");
  }

  window.checkBasicReadingAnswers = checkBasicReadingAnswers;
})();
