"use strict";

window.JaraLinguaUnit6FutureFormsLabData = {
  endpoint: "/api/intermediate/unit6-future-forms-decision-lab/submit",
  questions: [
    {
      context: "Prior intention",
      sentence: "Olivia has already chosen the studio. She ____ record the acoustic version on Thursday.",
      options: ["will", "is going to", "records", "is recording"],
      correct: 1,
      target: "be going to",
      feedback: "Use be going to because the plan already exists before this sentence."
    },
    {
      context: "Decision made now",
      sentence: "The radio host just called. Olivia says, \"Okay, I ____ send him the new time right now.\"",
      options: ["am sending", "send", "am going to send", "will send"],
      correct: 3,
      target: "will",
      feedback: "Use will because Olivia decides at the moment of speaking."
    },
    {
      context: "Official schedule",
      sentence: "According to the conference program, the workshop ____ at 9:30 tomorrow morning.",
      options: ["starts", "is starting", "is going to start", "will start"],
      correct: 0,
      target: "simple present",
      feedback: "Use simple present because the sentence refers to an official program or timetable."
    },
    {
      context: "Confirmed arrangement",
      sentence: "Marcus can't join the study group at six because he ____ his advisor at that time.",
      options: ["will meet", "meets", "is meeting", "is going to meet"],
      correct: 2,
      target: "present continuous",
      feedback: "Use present continuous because the meeting is already arranged with a person and a time."
    },
    {
      context: "Promise",
      sentence: "Don't worry about the calendar. I ____ update it before class starts.",
      options: ["am updating", "update", "am going to update", "will update"],
      correct: 3,
      target: "will",
      feedback: "Use will because the speaker is making a promise or offer."
    },
    {
      context: "Confirmed appointment",
      sentence: "Ana ____ the academic coordinator at noon, so she cannot move that block.",
      options: ["will see", "is seeing", "sees", "is going to see"],
      correct: 1,
      target: "present continuous",
      feedback: "Use present continuous because this is a fixed personal appointment."
    },
    {
      context: "Visible evidence",
      sentence: "Look at those dark clouds over campus. It ____ rain before the students leave.",
      options: ["is going to", "will", "rains", "is raining"],
      correct: 0,
      target: "be going to",
      feedback: "Use be going to because the speaker sees evidence now."
    },
    {
      context: "Public calendar",
      sentence: "The final oral exam ____ on Friday at 8:00 according to the institutional calendar.",
      options: ["is going to begin", "is beginning", "begins", "will begin"],
      correct: 2,
      target: "simple present",
      feedback: "Use simple present because this is a fixed institutional schedule."
    },
    {
      context: "Personal plan",
      sentence: "Sophie bought a new planner because she ____ organize her week more carefully.",
      options: ["organizes", "is going to", "will", "is organizing"],
      correct: 1,
      target: "be going to",
      feedback: "Use be going to because Sophie already has the intention to organize her week."
    },
    {
      context: "Immediate offer",
      sentence: "You look tired. I ____ take notes during the meeting so you can listen.",
      options: ["am taking", "take", "am going to take", "will take"],
      correct: 3,
      target: "will",
      feedback: "Use will because the speaker offers help at that moment."
    },
    {
      context: "Confirmed future plan with details",
      sentence: "They ____ the rehearsal room at 4:15; the reservation is already confirmed.",
      options: ["will use", "use", "are using", "are going to use"],
      correct: 2,
      target: "present continuous",
      feedback: "Use present continuous because the reservation confirms the arrangement."
    },
    {
      context: "Timetable",
      sentence: "The campus bus ____ every twenty minutes after 5:00 p.m.",
      options: ["leaves", "is leaving", "is going to leave", "will leave"],
      correct: 0,
      target: "simple present",
      feedback: "Use simple present because this describes a timetable."
    }
  ]
};

(() => {
  const data = window.JaraLinguaUnit6FutureFormsLabData;
  const letters = ["A", "B", "C", "D"];
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

  function incorrectIndexes() {
    if (!state.checked) return [];
    return state.answers
      .map((answer, index) => answer === data.questions[index].correct ? null : index)
      .filter(index => index !== null);
  }

  function setFeedback(message, type = "") {
    elements.feedback.className = "u6f-feedback" + (type ? " " + type : "");
    elements.feedback.textContent = message;
  }

  function setDelivery(message, type = "") {
    elements.deliveryStatus.className = "u6f-delivery-status" + (type ? " " + type : "");
    elements.deliveryStatus.textContent = message;
  }

  function questionStatus(index) {
    if (!state.checked || state.answers[index] === null) return "";
    return state.answers[index] === data.questions[index].correct ? " is-correct" : " is-review";
  }

  function reasonText(question, index) {
    if (!state.checked || state.answers[index] === null) return "";
    if (state.answers[index] === question.correct) {
      return `Correct. ${question.feedback}`;
    }
    const chosen = question.options[state.answers[index]];
    return `Review this item. You chose "${chosen}", but the situation points to ${question.target}. ${question.feedback}`;
  }

  function render() {
    elements.form.innerHTML = data.questions.map((question, index) => {
      const selected = state.answers[index];
      const options = question.options.map((option, optionIndex) => `
        <label class="u6f-option">
          <input type="radio" name="question-${index}" value="${optionIndex}" ${selected === optionIndex ? "checked" : ""} />
          <span class="u6f-letter">${letters[optionIndex]}</span>
          <span>${escapeHtml(option)}</span>
        </label>
      `).join("");
      return `
        <article class="u6f-question-card${questionStatus(index)}" data-question-card="${index}">
          <div class="u6f-question-top">
            <span class="u6f-number">${index + 1}</span>
            <div>
              <p class="u6f-context">${escapeHtml(question.context)}</p>
              <p class="u6f-sentence">${escapeHtml(question.sentence).replace("____", "<span class=\"u6f-blank\">____</span>")}</p>
            </div>
          </div>
          <div class="u6f-options" role="radiogroup" aria-label="Question ${index + 1} options">${options}</div>
          <div class="u6f-reason">${escapeHtml(reasonText(question, index))}</div>
        </article>
      `;
    }).join("");
    update();
  }

  function update() {
    const answered = answeredCount();
    const percent = Math.round((answered / data.questions.length) * 100);
    elements.progressBar.style.width = percent + "%";
    elements.progressLabel.textContent = `${answered} of ${data.questions.length} answered`;
    elements.checkButton.disabled = answered !== data.questions.length;
    elements.reviewButton.disabled = !state.checked || !incorrectIndexes().length;
    elements.scoreCard.textContent = state.checked ? `Reference grade: ${grade().toFixed(2)} / 5.0` : "Reference grade: -- / 5.0";
    elements.deliveryGrade.textContent = state.checked ? `Grade: ${grade().toFixed(2)} / 5.0` : "Grade: -- / 5.0";
    elements.deliveryDetail.textContent = state.checked
      ? `${correctCount()} correct, ${incorrectIndexes().length} for review. Gradebook weight 0%.`
      : "Check all 12 answers before sending.";
    elements.sendButton.disabled = !state.checked || answered !== data.questions.length || state.submitted;
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
      elements.sendButton.textContent = "Send to teacher";
      setFeedback("Answer changed. Check the quiz again before sending it to the teacher.");
      setDelivery("Your answers changed. Check again before sending.");
    }
    render();
  });

  elements.checkButton.addEventListener("click", () => {
    if (answeredCount() !== data.questions.length) {
      setFeedback("Answer all 12 questions before checking.", "error");
      return;
    }
    state.checked = true;
    state.submitted = false;
    elements.sendButton.textContent = "Send to teacher";
    render();
    const missed = incorrectIndexes().length;
    if (missed) {
      setFeedback(`Checked. Reference grade: ${grade().toFixed(2)} / 5.0. ${correctCount()} correct and ${missed} item(s) for review. Read the grammar reason under each marked item; the correct option is not automatically revealed.`, "error");
    } else {
      setFeedback(`Checked. Reference grade: ${grade().toFixed(2)} / 5.0. All 12 future-form decisions are correct. You can send the result to the teacher.`, "success");
    }
  });

  elements.reviewButton.addEventListener("click", () => {
    const first = incorrectIndexes()[0];
    if (first == null) return;
    document.querySelector(`[data-question-card="${first}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  elements.resetButton.addEventListener("click", () => {
    state.answers = Array(data.questions.length).fill(null);
    state.checked = false;
    state.submitted = false;
    elements.sendButton.textContent = "Send to teacher";
    setFeedback("Quiz reset. Answer every item and check again.");
    setDelivery("");
    render();
    document.querySelector("#decision-lab")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  elements.sendButton.addEventListener("click", () => {
    if (!state.checked || answeredCount() !== data.questions.length) {
      setDelivery("Check all 12 answers before sending.", "error");
      return;
    }
    const headers = authHeaders();
    if (!headers) {
      setDelivery("Sign in first. Your Future Forms Decision Lab must be linked to your student record before it can be sent to the teacher.", "error");
      requestSignIn();
      return;
    }
    elements.sendButton.disabled = true;
    elements.sendButton.textContent = "Sending...";
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
          elements.sendButton.textContent = "Send to teacher";
          if (result.status === 403) {
            setDelivery("Your account is signed in, but it is not linked to an Intermediate English student record. Ask the teacher to check your email in the gradebook.", "error");
          } else {
            setDelivery("The activity could not be saved. Please reload and try again.", "error");
          }
          return;
        }
        state.submitted = true;
        const incorrect = Array.isArray(result.body.incorrectQuestions) ? result.body.incorrectQuestions : [];
        elements.sendButton.textContent = "Submitted to teacher";
        setDelivery(`Submitted to teacher. Reference grade: ${Number(result.body.grade).toFixed(2)} / 5.0. ${incorrect.length ? "Items for review: " + incorrect.join(", ") + "." : "All answers were correct."} Gradebook weight: 0%.`, "success");
        update();
      })
      .catch(() => {
        elements.sendButton.disabled = false;
        elements.sendButton.textContent = "Send to teacher";
        setDelivery("Network error. The activity was not submitted.", "error");
      });
  });

  render();
})();
