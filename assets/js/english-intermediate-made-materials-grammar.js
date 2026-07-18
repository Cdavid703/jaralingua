(function () {
  "use strict";

  const questions = [
    {
      context: "Kitchen equipment",
      sentence: "The new serving tray is ___ bamboo.",
      options: ["made of", "made with", "made from"],
      answer: "made of",
      focus: "of",
      explanation: "Use made of because bamboo remains recognizable as the tray's material."
    },
    {
      context: "Manufacturing process",
      sentence: "Glass is ___ sand that is heated at a very high temperature.",
      options: ["made with", "made of", "made from"],
      answer: "made from",
      focus: "from",
      explanation: "Use made from because sand changes into a different material during production."
    },
    {
      context: "Restaurant menu",
      sentence: "The pumpkin soup is ___ fresh pumpkin, ginger, and coconut milk.",
      options: ["made from", "made with", "made of"],
      answer: "made with",
      focus: "with",
      explanation: "Use made with to introduce the ingredients used in a recipe."
    },
    {
      context: "Everyday products",
      sentence: "Paper is usually ___ wood pulp.",
      options: ["made from", "made of", "made with"],
      answer: "made from",
      focus: "from",
      explanation: "Use made from because wood pulp is processed and becomes paper."
    },
    {
      context: "Handmade accessories",
      sentence: "The necklace is ___ colored glass beads.",
      options: ["made with", "made of", "made from"],
      answer: "made of",
      focus: "of",
      explanation: "Use made of because the separate glass beads remain visible in the finished necklace."
    },
    {
      context: "Bakery description",
      sentence: "This seeded bread is ___ whole-grain flour, sunflower seeds, and oats.",
      options: ["made of", "made from", "made with"],
      answer: "made with",
      focus: "with",
      explanation: "Use made with when naming the ingredients included in a prepared food."
    },
    {
      context: "Food production",
      sentence: "Traditional chocolate is ___ roasted cocoa beans.",
      options: ["made of", "made from", "made with"],
      answer: "made from",
      focus: "from",
      explanation: "Use made from because cocoa beans are processed and transformed into chocolate."
    },
    {
      context: "Reusable products",
      sentence: "This lunch box is ___ stainless steel.",
      options: ["made with", "made from", "made of"],
      answer: "made of",
      focus: "of",
      explanation: "Use made of because stainless steel remains identifiable as the object's material."
    },
    {
      context: "Recipe instruction",
      sentence: "The dressing is ___ lime juice, olive oil, and cilantro.",
      options: ["made with", "made of", "made from"],
      answer: "made with",
      focus: "with",
      explanation: "Use made with to list the ingredients combined in the dressing."
    },
    {
      context: "Plant-based food",
      sentence: "Tofu is ___ soybeans that are soaked, ground, and pressed.",
      options: ["made with", "made of", "made from"],
      answer: "made from",
      focus: "from",
      explanation: "Use made from because soybeans go through a process and become a new food product."
    }
  ];

  const form = document.getElementById("materialsQuiz");
  const questionList = document.getElementById("materialsQuestionList");
  const answerCounter = document.getElementById("answerCounter");
  const progressFill = document.getElementById("progressFill");
  const checkButton = document.getElementById("checkAnswersBtn");
  const resetButton = document.getElementById("resetQuizBtn");
  const message = document.getElementById("assessmentMessage");
  const result = document.getElementById("materialsResult");
  const scoreValue = document.getElementById("scoreValue");
  const scoreSummary = document.getElementById("scoreSummary");
  const breakdown = document.getElementById("scoreBreakdown");
  let graded = false;

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
      }[character];
    });
  }

  function sentenceHtml(sentence) {
    return escapeHtml(sentence).replace("___", '<span class="question-blank">_____</span>');
  }

  function renderQuestions() {
    questionList.innerHTML = questions.map(function (question, questionIndex) {
      const choices = question.options.map(function (option, optionIndex) {
        const inputId = "materials-q" + questionIndex + "-o" + optionIndex;
        return '<label class="option-choice" for="' + inputId + '">' +
          '<input id="' + inputId + '" type="radio" name="materials-q' + questionIndex + '" value="' + escapeHtml(option) + '" />' +
          '<span>' + escapeHtml(option) + '</span>' +
        '</label>';
      }).join("");

      return '<fieldset class="materials-question" data-question="' + questionIndex + '">' +
        '<legend class="visually-hidden">Question ' + (questionIndex + 1) + '</legend>' +
        '<div class="question-header">' +
          '<span class="question-number">' + String(questionIndex + 1).padStart(2, "0") + '</span>' +
          '<div><span class="question-context">' + escapeHtml(question.context) + '</span>' +
          '<p class="question-prompt">' + sentenceHtml(question.sentence) + '</p></div>' +
        '</div>' +
        '<div class="option-grid">' + choices + '</div>' +
        '<p class="question-feedback" data-feedback="' + questionIndex + '"></p>' +
      '</fieldset>';
    }).join("");
  }

  function selectedAnswers() {
    return questions.map(function (_, index) {
      return form.querySelector('input[name="materials-q' + index + '"]:checked')?.value || "";
    });
  }

  function updateProgress() {
    const answered = selectedAnswers().filter(Boolean).length;
    answerCounter.textContent = answered + " of " + questions.length + " answered";
    progressFill.style.width = (answered / questions.length * 100) + "%";
    progressFill.parentElement.setAttribute("aria-valuenow", String(answered));
    if (!graded) {
      message.dataset.state = answered === questions.length ? "success" : "neutral";
      message.textContent = answered === questions.length
        ? "All answers are ready to check."
        : "You can change any answer before checking your score.";
    }
  }

  function resultMessage(score) {
    if (score >= 4.5) return "Excellent control. You are distinguishing visible materials, transformed sources, and recipe ingredients accurately.";
    if (score >= 3.5) return "Good control. Review the corrected items and notice whether the source changes or remains recognizable.";
    if (score >= 2.5) return "Developing control. Revisit the Unit 5 explanation before trying the challenge again.";
    return "This distinction needs another review. Study the three uses in Unit 5, then reset the challenge and try again.";
  }

  function gradeQuiz() {
    if (graded) return;
    const answers = selectedAnswers();
    const firstMissing = answers.findIndex(function (answer) { return !answer; });
    if (firstMissing !== -1) {
      message.dataset.state = "error";
      message.textContent = "Complete all 10 questions before checking your score.";
      const missingCard = questionList.querySelector('[data-question="' + firstMissing + '"]');
      missingCard.scrollIntoView({ behavior: "smooth", block: "center" });
      missingCard.querySelector("input")?.focus({ preventScroll: true });
      return;
    }

    graded = true;
    form.classList.add("is-graded");
    const totals = { of: 0, from: 0, with: 0 };
    const correctByFocus = { of: 0, from: 0, with: 0 };
    let correct = 0;

    questions.forEach(function (question, index) {
      totals[question.focus] += 1;
      const card = questionList.querySelector('[data-question="' + index + '"]');
      const selected = answers[index];
      const isCorrect = selected === question.answer;
      const feedback = card.querySelector("[data-feedback]");

      if (isCorrect) {
        correct += 1;
        correctByFocus[question.focus] += 1;
      }

      card.classList.add(isCorrect ? "is-correct" : "is-incorrect");
      card.querySelectorAll(".option-choice").forEach(function (choice) {
        const input = choice.querySelector("input");
        input.disabled = true;
        choice.classList.toggle("is-correct-choice", input.value === question.answer);
        choice.classList.toggle("is-wrong-choice", input.checked && input.value !== question.answer);
      });
      feedback.classList.add("is-visible");
      feedback.innerHTML = isCorrect
        ? "<strong>Correct.</strong> " + escapeHtml(question.explanation)
        : "<strong>Review this item.</strong> The best answer is <strong>" + escapeHtml(question.answer) + "</strong>. " + escapeHtml(question.explanation);
    });

    const score = (correct * 0.5).toFixed(1);
    scoreValue.textContent = score;
    scoreSummary.textContent = correct + " of 10 correct. " + resultMessage(Number(score));
    breakdown.innerHTML = ["of", "from", "with"].map(function (focus) {
      return '<div class="breakdown-item"><strong>made ' + focus + '</strong><span>' + correctByFocus[focus] + " of " + totals[focus] + " correct</span></div>";
    }).join("");
    result.hidden = false;
    checkButton.disabled = true;
    resetButton.hidden = false;
    message.dataset.state = "success";
    message.textContent = "Answers checked. Your diagnostic score is ready.";
    result.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function resetQuiz() {
    graded = false;
    form.reset();
    form.classList.remove("is-graded");
    questionList.querySelectorAll(".materials-question").forEach(function (card) {
      card.classList.remove("is-correct", "is-incorrect");
    });
    questionList.querySelectorAll(".option-choice").forEach(function (choice) {
      choice.classList.remove("is-selected", "is-correct-choice", "is-wrong-choice");
      choice.querySelector("input").disabled = false;
    });
    questionList.querySelectorAll(".question-feedback").forEach(function (feedback) {
      feedback.classList.remove("is-visible");
      feedback.textContent = "";
    });
    result.hidden = true;
    checkButton.disabled = false;
    resetButton.hidden = true;
    updateProgress();
    document.getElementById("challenge").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  renderQuestions();
  updateProgress();

  form.addEventListener("change", function (event) {
    if (!event.target.matches('input[type="radio"]') || graded) return;
    const group = event.target.name;
    form.querySelectorAll('input[name="' + group + '"]').forEach(function (input) {
      input.closest(".option-choice").classList.toggle("is-selected", input.checked);
    });
    updateProgress();
  });
  checkButton.addEventListener("click", gradeQuiz);
  resetButton.addEventListener("click", resetQuiz);
})();
