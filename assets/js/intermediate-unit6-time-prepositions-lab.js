"use strict";

window.JaraLinguaUnit6TimePrepositionsLabData = {
  endpoint: "/api/intermediate/unit6-time-prepositions-lab/submit",
  questions: [
    {
      context: "Exact time",
      sentence: "Olivia is meeting her academic mentor ____ 3:15 p.m.",
      options: ["on", "at", "in"],
      correct: 1,
      target: "at",
      feedback: "Use at with exact clock times: at 3:15 p.m., at seven o'clock, at noon."
    },
    {
      context: "Day",
      sentence: "The planning meeting is ____ Monday morning.",
      options: ["on", "in", "at"],
      correct: 0,
      target: "on",
      feedback: "Use on with days and day + part of the day: on Monday, on Monday morning."
    },
    {
      context: "Month",
      sentence: "The music project will start ____ June.",
      options: ["at", "on", "in"],
      correct: 2,
      target: "in",
      feedback: "Use in with months, years, seasons, and longer periods: in June, in 2026."
    },
    {
      context: "Time range",
      sentence: "The rehearsal room is reserved ____ 8:00 ____ 10:00.",
      options: ["on", "from...to", "in"],
      correct: 1,
      target: "from...to",
      feedback: "Use from...to when the sentence gives a start time and an end time."
    },
    {
      context: "Part of the day",
      sentence: "Marcus usually checks his calendar ____ the morning.",
      options: ["in", "at", "on"],
      correct: 0,
      target: "in",
      feedback: "Use in with common parts of the day: in the morning, in the afternoon, in the evening."
    },
    {
      context: "Date",
      sentence: "The final written task is due ____ August 14.",
      options: ["in", "at", "on"],
      correct: 2,
      target: "on",
      feedback: "Use on with specific dates: on August 14, on July 3, on my birthday."
    },
    {
      context: "Fixed point",
      sentence: "The group is going to review the slides ____ lunchtime.",
      options: ["at", "on", "from...to"],
      correct: 0,
      target: "at",
      feedback: "Use at with fixed points in the day: at lunchtime, at noon, at midnight."
    },
    {
      context: "Time range",
      sentence: "The campus workshop runs ____ 2:00 ____ 4:00 on Friday.",
      options: ["in", "on", "from...to"],
      correct: 2,
      target: "from...to",
      feedback: "Use from...to to show the complete duration of an event."
    },
    {
      context: "Year",
      sentence: "The students are going to organize their graduation plans ____ 2026.",
      options: ["on", "in", "at"],
      correct: 1,
      target: "in",
      feedback: "Use in with years and long time periods: in 2026, in the future, in the next semester."
    },
    {
      context: "Night",
      sentence: "Olivia prefers to make difficult decisions ____ night, after everyone leaves.",
      options: ["at", "in", "on"],
      correct: 0,
      target: "at",
      feedback: "Use at night as the standard expression. Compare: in the morning, in the afternoon, at night."
    }
  ]
};

(() => {
  const data = window.JaraLinguaUnit6TimePrepositionsLabData;
  const letters = ["A", "B", "C"];
  const state = {
    answers: Array(data.questions.length).fill(null),
    checked: false,
    submitted: false
  };

  const elements = {
    form: document.querySelector("[data-quiz-form]"),
    checkButton: document.querySelector("[data-check-answers]"),
    reviewButton: document.querySelector("[data-review-errors]"),
    resetButton: document.querySelector("[data-reset-quiz]"),
    progressBar: document.querySelector("[data-progress-bar]"),
    progressLabel: document.querySelector("[data-progress-label]"),
    scoreCard: document.querySelector("[data-score-card]"),
    feedback: document.querySelector("[data-feedback]"),
    deliveryGrade: document.querySelector("[data-delivery-grade]"),
    deliveryDetail: document.querySelector("[data-delivery-detail]"),
    sendButton: document.querySelector("[data-send-teacher]"),
    deliveryStatus: document.querySelector("[data-delivery-status]")
  };

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#39;"
    }[char]));
  }

  function answeredCount() {
    return state.answers.filter(answer => answer !== null).length;
  }

  function correctCount() {
    return state.answers.filter((answer, index) => answer === data.questions[index].correct).length;
  }

  function grade() {
    return Math.round((correctCount() / data.questions.length) * 500) / 100;
  }

  function reviewIndexes() {
    if (!state.checked) return [];
    return state.answers
      .map((answer, index) => answer === data.questions[index].correct ? null : index)
      .filter(index => index !== null);
  }

  function setFeedback(message, type = "") {
    elements.feedback.className = "u6t-feedback" + (type ? " " + type : "");
    elements.feedback.textContent = message;
  }

  function setDelivery(message, type = "") {
    elements.deliveryStatus.className = "u6t-delivery-status" + (type ? " " + type : "");
    elements.deliveryStatus.textContent = message;
  }

  function questionStatus(index) {
    if (!state.checked) return "";
    return state.answers[index] === data.questions[index].correct ? " is-correct" : " is-review";
  }

  function reasonText(question, index) {
    if (!state.checked) return "";
    if (state.answers[index] === null) {
      return `Review this item. No answer was selected. ${question.feedback}`;
    }
    if (state.answers[index] === question.correct) {
      return `Correct. ${question.feedback}`;
    }
    const chosen = question.options[state.answers[index]];
    return `Review this item. You chose "${chosen}", but the time clue points to ${question.target}. ${question.feedback}`;
  }

  function render() {
    elements.form.innerHTML = data.questions.map((question, index) => {
      const selected = state.answers[index];
      const options = question.options.map((option, optionIndex) => `
        <label class="u6t-option">
          <input type="radio" name="question-${index}" value="${optionIndex}" ${selected === optionIndex ? "checked" : ""} />
          <span class="u6t-letter">${letters[optionIndex]}</span>
          <span>${escapeHtml(option)}</span>
        </label>
      `).join("");
      return `
        <article class="u6t-question-card${questionStatus(index)}" data-question-card="${index}">
          <div class="u6t-question-top">
            <span class="u6t-number">${index + 1}</span>
            <div>
              <p class="u6t-context">${escapeHtml(question.context)}</p>
              <p class="u6t-sentence">${escapeHtml(question.sentence).replace(/____/g, "<span class=\"u6t-blank\">____</span>")}</p>
            </div>
          </div>
          <div class="u6t-options" role="radiogroup" aria-label="Question ${index + 1} options">${options}</div>
          <div class="u6t-reason">${escapeHtml(reasonText(question, index))}</div>
        </article>
      `;
    }).join("");
    update();
  }

  function update() {
    const answered = answeredCount();
    const percent = Math.round((answered / data.questions.length) * 100);
    const reviews = reviewIndexes().length;
    elements.progressBar.style.width = percent + "%";
    elements.progressLabel.textContent = `${answered} of ${data.questions.length} answered`;
    elements.reviewButton.disabled = !state.checked || !reviews;
    elements.scoreCard.textContent = state.checked ? `Reference grade: ${grade().toFixed(2)} / 5.0` : "Reference grade: -- / 5.0";
    elements.deliveryGrade.textContent = state.checked ? `Grade: ${grade().toFixed(2)} / 5.0` : "Grade: -- / 5.0";
    elements.deliveryDetail.textContent = state.checked
      ? `${correctCount()} correct, ${reviews} for review. Gradebook weight 0%.`
      : "Check the quiz before sending.";
    elements.sendButton.disabled = !state.checked || state.submitted;
  }

  function readStoredUser(key) {
    try {
      const saved = JSON.parse(sessionStorage.getItem(key) || "null");
      if (!saved || !saved.exp || Date.now() / 1000 > saved.exp) {
        sessionStorage.removeItem(key);
        return null;
      }
      return saved;
    } catch (error) {
      sessionStorage.removeItem(key);
      return null;
    }
  }

  function authHeaders() {
    const google = readStoredUser("jaralingua_google_user");
    if (google && google.credential) {
      return { Authorization: "Bearer " + google.credential, "X-Jaralingua-Auth-Provider": "google", "Content-Type": "application/json" };
    }
    const microsoft = readStoredUser("jaralingua_microsoft_user");
    if (microsoft && microsoft.credential) {
      return { Authorization: "Bearer " + microsoft.credential, "X-Jaralingua-Auth-Provider": "microsoft", "Content-Type": "application/json" };
    }
    const local = readStoredUser("jaralingua_local_user");
    if (local && local.credential) {
      return { Authorization: "Bearer " + local.credential, "X-Jaralingua-Auth-Provider": "local", "Content-Type": "application/json" };
    }
    return null;
  }

  function requestSignIn() {
    const trigger = document.querySelector("[data-auth-toggle]");
    if (trigger) trigger.click();
  }

  elements.form.addEventListener("change", event => {
    const input = event.target.closest("input[type='radio']");
    if (!input) return;
    const index = Number(input.name.replace("question-", ""));
    state.answers[index] = Number(input.value);
    if (state.checked) {
      state.checked = false;
      state.submitted = false;
      elements.sendButton.innerHTML = '<i class="bi bi-send-fill"></i> Send to teacher';
      setFeedback("Answer changed. Check the quiz again before sending it to the teacher.");
      setDelivery("Your answers changed. Check again before sending.");
    }
    render();
  });

  elements.checkButton.addEventListener("click", () => {
    state.checked = true;
    state.submitted = false;
    elements.sendButton.innerHTML = '<i class="bi bi-send-fill"></i> Send to teacher';
    render();
    const reviews = reviewIndexes().length;
    if (reviews) {
      setFeedback(`Checked. Reference grade: ${grade().toFixed(2)} / 5.0. ${correctCount()} correct and ${reviews} item(s) for review. Read the feedback under each marked item; the correct option is not automatically revealed.`, "error");
    } else {
      setFeedback(`Checked. Reference grade: ${grade().toFixed(2)} / 5.0. All 10 time-preposition decisions are correct. You can send the result to the teacher.`, "success");
    }
  });

  elements.reviewButton.addEventListener("click", () => {
    const first = reviewIndexes()[0];
    if (first == null) return;
    document.querySelector(`[data-question-card="${first}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  elements.resetButton.addEventListener("click", () => {
    state.answers = Array(data.questions.length).fill(null);
    state.checked = false;
    state.submitted = false;
    elements.sendButton.innerHTML = '<i class="bi bi-send-fill"></i> Send to teacher';
    setFeedback("Quiz reset. Answer the items and check again.");
    setDelivery("");
    render();
    document.querySelector("#time-lab")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  elements.sendButton.addEventListener("click", () => {
    if (!state.checked) {
      setDelivery("Check the quiz before sending.", "error");
      return;
    }
    const headers = authHeaders();
    if (!headers) {
      setDelivery("Sign in first with the account button in the top navigation. Your Time Prepositions Schedule Lab must be linked to your Intermediate English student record before it can be sent to the teacher.", "error");
      requestSignIn();
      return;
    }
    elements.sendButton.disabled = true;
    elements.sendButton.innerHTML = '<i class="bi bi-hourglass-split"></i> Sending...';
    setDelivery("Sending your checked result to the teacher...");
    fetch(data.endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({
        answers: state.answers,
        clientDate: new Date().toISOString().slice(0, 10)
      })
    }).then(response => response.json().then(body => ({ ok: response.ok, status: response.status, body })))
      .then(result => {
        if (!result.ok) {
          elements.sendButton.disabled = false;
          elements.sendButton.innerHTML = '<i class="bi bi-send-fill"></i> Send to teacher';
          if (result.status === 403) {
            setDelivery("Your account is signed in, but it is not linked to an Intermediate English student record. Ask the teacher to check your email in the gradebook.", "error");
          } else {
            setDelivery("The activity could not be saved. Please reload and try again.", "error");
          }
          return;
        }
        state.submitted = true;
        const incorrect = Array.isArray(result.body.incorrectQuestions) ? result.body.incorrectQuestions : [];
        elements.sendButton.innerHTML = '<i class="bi bi-send-check-fill"></i> Submitted to teacher';
        setDelivery(`Submitted to teacher. Reference grade: ${Number(result.body.grade).toFixed(2)} / 5.0. ${incorrect.length ? "Items for review: " + incorrect.join(", ") + "." : "All answers were correct."} Gradebook weight: 0%.`, "success");
        update();
      })
      .catch(() => {
        elements.sendButton.disabled = false;
        elements.sendButton.innerHTML = '<i class="bi bi-send-fill"></i> Send to teacher';
        setDelivery("Network error. The activity was not submitted.", "error");
      });
  });

  render();
})();
