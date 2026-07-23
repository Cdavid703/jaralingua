"use strict";

window.JaraLinguaUnit6ReadingArticleData = {
  submitEndpoint: "/api/intermediate/unit6-reading-overloaded-week/submit",
  answers: [1, 0, 2, 1, 0, 2, 1, 2, 0, 1],
  questions: [
    {
      skill: "Main idea",
      question: "What is the main purpose of the article?",
      options: ["To announce a new album release", "To show how Olivia reorganizes an overloaded week", "To compare different music studios"]
    },
    {
      skill: "Prior plan",
      question: "What is Olivia going to do on Saturday morning?",
      options: ["Record the acoustic track", "Interview a photographer", "Have dinner with her parents"]
    },
    {
      skill: "Confirmed arrangement",
      question: "Which arrangement is confirmed for Tuesday at ten?",
      options: ["She is visiting the doctor", "She is rehearsing with the band", "She is meeting the producer"]
    },
    {
      skill: "Flexible plan",
      question: "Which item is still up in the air at the start of the article?",
      options: ["The Saturday recording", "The photo session", "The producer meeting"]
    },
    {
      skill: "Reason",
      question: "Why does Marcus suggest moving the radio interview?",
      options: ["To free up Friday afternoon", "To avoid speaking in public", "To replace the producer meeting"]
    },
    {
      skill: "Advice",
      question: "What does the article say Olivia should protect?",
      options: ["A new shopping plan", "A second interview", "Her recording time and rest before it"]
    },
    {
      skill: "Phrasal verb",
      question: "In the article, what does put off mean?",
      options: ["Accept immediately", "Delay or postpone", "Add more people"]
    },
    {
      skill: "Idiom",
      question: "What does on the same page mean in the final schedule?",
      options: ["Everyone reads the same magazine", "Everyone writes the same song", "Everyone has the same updated information"]
    },
    {
      skill: "Final decision",
      question: "Which plan becomes final by the end of the article?",
      options: ["The radio interview will move to Monday", "The family dinner will be cancelled", "The band rehearsal will happen at midnight"]
    },
    {
      skill: "Synthesis",
      question: "What lesson does the article suggest about organizing life?",
      options: ["Accept every invitation quickly", "Separate fixed commitments from flexible tasks before adding more", "Keep plans unclear until the last minute"]
    }
  ]
};

(() => {
  const data = window.JaraLinguaUnit6ReadingArticleData;
  const state = {
    checked: false,
    submitted: false,
    result: null
  };

  const elements = {
    quizForm: document.querySelector("[data-quiz-form]"),
    checkButton: document.querySelector("[data-check-answers]"),
    resetButton: document.querySelector("[data-reset-quiz]"),
    quizFeedback: document.querySelector("[data-quiz-feedback]"),
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

  function selectedAnswers() {
    const answers = [];
    for (let index = 0; index < data.questions.length; index += 1) {
      const selected = elements.quizForm.querySelector(`input[name="q${index}"]:checked`);
      if (!selected) return null;
      answers.push(Number(selected.value));
    }
    return answers;
  }

  function scoreAnswers(answers) {
    let score = 0;
    const incorrect = [];
    answers.forEach((answer, index) => {
      if (answer === data.answers[index]) score += 1;
      else incorrect.push(index + 1);
    });
    return {
      score,
      total: data.answers.length,
      grade: Math.round((score / data.answers.length) * 500) / 100,
      incorrect
    };
  }

  function setStatus(element, message, type) {
    element.className = element.className.replace(/\s?(success|error)\b/g, "");
    if (type) element.classList.add(type);
    element.textContent = message;
  }

  function updateSendState() {
    elements.sendButton.disabled = !(state.checked && !state.submitted);
  }

  function renderQuiz() {
    elements.quizForm.innerHTML = data.questions.map((item, index) => `
      <article class="q-card" data-question-card="${index}">
        <span class="q-skill">${escapeHtml(item.skill)}</span>
        <h3>${index + 1}. ${escapeHtml(item.question)}</h3>
        ${item.options.map((option, optionIndex) => `
          <label>
            <input type="radio" name="q${index}" value="${optionIndex}" />
            <span>${escapeHtml(option)}</span>
          </label>
        `).join("")}
      </article>
    `).join("");
  }

  function markCards(result) {
    const incorrectSet = new Set(result.incorrect);
    document.querySelectorAll("[data-question-card]").forEach(card => {
      const number = Number(card.dataset.questionCard) + 1;
      card.classList.toggle("is-review", incorrectSet.has(number));
      card.classList.toggle("is-correct", !incorrectSet.has(number));
    });
  }

  function clearCheckState() {
    state.checked = false;
    state.submitted = false;
    state.result = null;
    elements.sendButton.textContent = "Send to teacher";
    document.querySelectorAll("[data-question-card]").forEach(card => {
      card.classList.remove("is-review", "is-correct");
    });
    setStatus(elements.quizFeedback, "Answer all 10 questions, then check the reading quiz. You can change answers and check again before sending.", "");
    setStatus(elements.deliveryStatus, "", "");
    elements.deliveryStatus.classList.remove("show");
    updateSendState();
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
      return {
        Authorization: "Bearer " + google.credential,
        "X-Jaralingua-Auth-Provider": "google",
        "Content-Type": "application/json"
      };
    }
    const microsoft = readStoredUser("jaralingua_microsoft_user");
    if (microsoft && microsoft.credential) {
      return {
        Authorization: "Bearer " + microsoft.credential,
        "X-Jaralingua-Auth-Provider": "microsoft",
        "Content-Type": "application/json"
      };
    }
    const local = readStoredUser("jaralingua_local_user");
    if (local && local.credential) {
      return {
        Authorization: "Bearer " + local.credential,
        "X-Jaralingua-Auth-Provider": "local",
        "Content-Type": "application/json"
      };
    }
    return null;
  }

  function openLoginPanel() {
    const trigger = document.querySelector("[data-auth-toggle], [data-auth-nav-toggle]");
    if (trigger) trigger.click();
  }

  function setDelivery(message, type) {
    elements.deliveryStatus.className = "activity-feedback show" + (type ? " " + type : "");
    elements.deliveryStatus.textContent = message;
  }

  elements.quizForm.addEventListener("change", () => {
    if (state.checked) clearCheckState();
  });

  elements.checkButton.addEventListener("click", () => {
    const answers = selectedAnswers();
    if (!answers) {
      setStatus(elements.quizFeedback, "Answer all 10 questions before checking.", "error");
      return;
    }
    const result = scoreAnswers(answers);
    state.checked = true;
    state.result = result;
    markCards(result);
    if (result.incorrect.length) {
      setStatus(elements.quizFeedback, `Reference grade: ${result.grade.toFixed(2)} / 5.0. Questions marked for review: ${result.incorrect.join(", ")}. Correct answers are not shown.`, "error");
    } else {
      setStatus(elements.quizFeedback, `Reference grade: ${result.grade.toFixed(2)} / 5.0. All reading decisions are accurate.`, "success");
    }
    updateSendState();
  });

  elements.resetButton.addEventListener("click", () => {
    elements.quizForm.reset();
    clearCheckState();
    document.querySelector("#questions").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  elements.sendButton.addEventListener("click", () => {
    const answers = selectedAnswers();
    if (!state.checked || !state.result || !answers) {
      setDelivery("Check the complete reading quiz before sending it to the teacher.", "error");
      return;
    }
    const headers = authHeaders();
    if (!headers) {
      setDelivery("Sign in first. Your reading follow-up must be linked to your student record before it can be sent to the teacher.", "error");
      openLoginPanel();
      return;
    }
    elements.sendButton.disabled = true;
    setDelivery("Sending your reading follow-up to the teacher...", "");
    fetch(data.submitEndpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({
        answers,
        clientDate: new Date().toISOString().slice(0, 10)
      })
    }).then(response => response.json().then(body => ({ ok: response.ok, status: response.status, body })))
      .then(result => {
        if (!result.ok) {
          elements.sendButton.disabled = false;
          if (result.status === 403) {
            setDelivery("Your account is signed in, but it is not linked to an Intermediate English student record. Ask the teacher to check your email in the gradebook.", "error");
          } else {
            setDelivery("The reading follow-up could not be saved. Please reload and try again.", "error");
          }
          return;
        }
        state.submitted = true;
        const incorrect = Array.isArray(result.body.incorrectQuestions) ? result.body.incorrectQuestions : [];
        setDelivery(`Submitted to teacher. Reference grade: ${Number(result.body.grade).toFixed(2)} / 5.0. ${incorrect.length ? "Questions marked for review: " + incorrect.join(", ") + "." : "All reading questions were accurate."} Gradebook weight: 0%.`, "success");
        elements.sendButton.textContent = "Submitted to teacher";
        updateSendState();
      })
      .catch(() => {
        elements.sendButton.disabled = false;
        setDelivery("Network error. The activity was not submitted.", "error");
      });
  });

  renderQuiz();
})();
