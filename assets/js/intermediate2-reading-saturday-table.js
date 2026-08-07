(function () {
  "use strict";

  var draftKey = "jaralingua-intermediate2-saturday-table-draft";
  var predictionButtons = document.querySelectorAll("[data-reading-prediction]");
  var predictionStatus = document.getElementById("predictionStatus");
  var quiz = document.getElementById("saturdayReadingQuiz");
  var checkQuizButton = document.getElementById("checkSaturdayReading");
  var quizResult = document.getElementById("saturdayReadingResult");
  var response = document.getElementById("saturdayReadingResponse");
  var responseCount = document.getElementById("saturdayResponseCount");
  var draftStatus = document.getElementById("saturdayDraftStatus");
  var saveDraftButton = document.getElementById("saveSaturdayDraft");
  var copyDraftButton = document.getElementById("copySaturdayDraft");
  var clearDraftButton = document.getElementById("clearSaturdayDraft");

  function wordCount(text) {
    var trimmed = String(text || "").trim();
    return trimmed ? trimmed.split(/\s+/).length : 0;
  }

  function countWord(text, word) {
    var matches = String(text || "").match(new RegExp("\\b" + word + "\\b", "gi"));
    return matches ? matches.length : 0;
  }

  function relationshipExpressionCount(text) {
    var expressions = [
      "neighbor",
      "old classmate",
      "new contact",
      "hit it off",
      "get back in touch",
      "keep in touch",
      "get on well",
      "lost contact",
      "exchange contact details"
    ];

    return expressions.reduce(function (total, expression) {
      return total + (String(text || "").toLowerCase().includes(expression) ? 1 : 0);
    }, 0);
  }

  function updateResponseChecks() {
    var text = response.value;
    var words = wordCount(text);
    var checks = {
      length: words >= 80 && words <= 100,
      who: countWord(text, "who") >= 2,
      that: countWord(text, "that") >= 1,
      relationship: relationshipExpressionCount(text) >= 2
    };

    responseCount.textContent = words + (words === 1 ? " word" : " words");

    Object.keys(checks).forEach(function (key) {
      var item = document.querySelector('[data-response-check="' + key + '"]');
      if (item) {
        item.classList.toggle("is-ready", checks[key]);
      }
    });
  }

  predictionButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      predictionButtons.forEach(function (item) {
        item.classList.remove("is-selected");
        item.setAttribute("aria-pressed", "false");
      });
      button.classList.add("is-selected");
      button.setAttribute("aria-pressed", "true");
      predictionStatus.textContent =
        "Your prediction: " + button.dataset.readingPrediction + ". Read to test your idea.";
    });
    button.setAttribute("aria-pressed", "false");
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
        feedback.textContent = "Review the story evidence. " + card.dataset.feedback;
        feedback.className = "ie2-question-feedback show needs-review";
      }
    });

    if (answered < questions.length) {
      quizResult.className = "ie2-reading-result show needs-review";
      quizResult.textContent =
        "Answer all 8 questions. Completed: " + answered + " of " + questions.length + ".";
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
        ? "Excellent evidence reading."
        : "Use the feedback under each marked card and try again.");
  });

  quiz.addEventListener("reset", function () {
    window.setTimeout(function () {
      quiz.querySelectorAll(".ie2-reading-question").forEach(function (card) {
        card.classList.remove("is-correct", "needs-review");
        var feedback = card.querySelector(".ie2-question-feedback");
        feedback.className = "ie2-question-feedback";
        feedback.textContent = "";
      });
      quizResult.className = "ie2-reading-result";
      quizResult.textContent = "";
    }, 0);
  });

  response.addEventListener("input", function () {
    updateResponseChecks();
    draftStatus.textContent = "Unsaved changes on this device.";
  });

  saveDraftButton.addEventListener("click", function () {
    localStorage.setItem(draftKey, response.value);
    draftStatus.textContent = "Draft saved on this device.";
  });

  copyDraftButton.addEventListener("click", function () {
    if (!response.value.trim()) {
      draftStatus.textContent = "Write a response before copying.";
      response.focus();
      return;
    }

    function copyWithSelection() {
      response.select();
      document.execCommand("copy");
      draftStatus.textContent = "Response copied.";
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(response.value).then(function () {
        draftStatus.textContent = "Response copied.";
      }).catch(copyWithSelection);
    } else {
      copyWithSelection();
    }
  });

  clearDraftButton.addEventListener("click", function () {
    if (!response.value.trim() || window.confirm("Clear the reading response saved on this device?")) {
      response.value = "";
      localStorage.removeItem(draftKey);
      draftStatus.textContent = "Draft cleared.";
      updateResponseChecks();
    }
  });

  var savedDraft = localStorage.getItem(draftKey);
  if (savedDraft) {
    response.value = savedDraft;
    draftStatus.textContent = "Saved draft restored from this device.";
  }
  updateResponseChecks();
}());
