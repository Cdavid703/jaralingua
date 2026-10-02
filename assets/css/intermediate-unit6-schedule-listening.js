"use strict";

window.JaraLinguaUnit6ScheduleListeningData = {
  submitEndpoint: "/api/intermediate/unit6-schedule-change-call/submit",
  transcriptEndpoint: "/api/intermediate/unit6-schedule-change-call/transcript",
  answers: [1, 0, 2, 0, 1, 2, 0, 1, 2, 1],
  questions: [
    {
      skill: "Main idea",
      question: "What is the main purpose of the call?",
      options: ["To cancel Olivia's whole Thursday", "To reorganize a crowded schedule before recording", "To choose songs for a concert"]
    },
    {
      skill: "Prior plan",
      question: "What is Olivia going to do this week?",
      options: ["Record the acoustic track", "Visit the radio host", "Move her family dinner"]
    },
    {
      skill: "Confirmed arrangement",
      question: "What confirmed arrangement does Olivia have at ten?",
      options: ["She is seeing the doctor", "She is calling the radio host", "She is meeting the producer"]
    },
    {
      skill: "Detail",
      question: "Who is arriving at noon?",
      options: ["The band", "The photographer", "Olivia's parents"]
    },
    {
      skill: "Reason",
      question: "Why does Marcus suggest putting off the radio interview?",
      options: ["Because the host cancelled", "Because it would free up Thursday afternoon", "Because Olivia forgot the questions"]
    },
    {
      skill: "Idiom",
      question: "What does Olivia mean when she says the photo session is still up in the air?",
      options: ["It is outside", "It is too expensive", "It is not confirmed yet"]
    },
    {
      skill: "Advice",
      question: "What does Marcus say they should do first?",
      options: ["Call the photographer", "Cancel the producer meeting", "Move the family dinner"]
    },
    {
      skill: "Phrasal verb",
      question: "What does fit in the interview at ten mean?",
      options: ["Make the interview shorter", "Find space for the interview in the schedule", "Invite the interviewer to dinner"]
    },
    {
      skill: "Final action",
      question: "What will Marcus send after the call?",
      options: ["A new song file", "A doctor's note", "The updated schedule"]
    },
    {
      skill: "Synthesis",
      question: "What final decision does Olivia make?",
      options: ["She will cancel the family dinner", "She is going to keep Thursday focused on recording", "She will add another rehearsal"]
    }
  ]
};

(() => {
  const data = window.JaraLinguaUnit6ScheduleListeningData;
  const state = {
    checked: false,
    submitted: false,
    result: null
  };

  const elements = {
    audio: document.querySelector("#scheduleAudio"),
    audioFeedback: document.querySelector("[data-audio-feedback]"),
    quizForm: document.querySelector("[data-quiz-form]"),
    checkButton: document.querySelector("[data-check-answers]"),
    resetButton: document.querySelector("[data-reset-quiz]"),
    quizFeedback: document.querySelector("[data-quiz-feedback]"),
    finalNote: document.querySelector("[data-final-note]"),
    wordCount: document.querySelector("[data-word-count]"),
    sendButton: document.querySelector("[data-send-teacher]"),
    deliveryStatus: document.querySelector("[data-delivery-status]"),
    transcriptButton: document.querySelector("[data-load-transcript]"),
    transcriptStatus: document.querySelector("[data-transcript-status]"),
    scriptBox: document.querySelector("[data-script-box]")
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

  function wordCount(value) {
    const cleaned = String(value || "").trim();
    return cleaned ? cleaned.split(/\s+/).length : 0;
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
    const words = wordCount(elements.finalNote.value);
    const ready = state.checked && words >= 35 && words <= 100 && !state.submitted;
    elements.sendButton.disabled = !ready;
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
    setStatus(elements.quizFeedback, "Choose all answers, then check the quiz. You can change answers and check again before sending.", "");
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

  function setSpeed(rate) {
    const next = Number(rate);
    if (![0.75, 1, 1.25].includes(next)) return;
    elements.audio.playbackRate = next;
    document.querySelectorAll("[data-audio-speed]").forEach(button => {
      const active = Number(button.dataset.audioSpeed) === next;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });
    setStatus(elements.audioFeedback, `Audio speed changed successfully to ${next}x.`, "success");
  }

  document.querySelectorAll("[data-audio-speed]").forEach(button => {
    button.addEventListener("click", () => setSpeed(button.dataset.audioSpeed));
  });

  elements.audio.addEventListener("ratechange", () => {
    if (![0.75, 1, 1.25].includes(Number(elements.audio.playbackRate))) {
      elements.audio.playbackRate = 1;
      setSpeed(1);
    }
  });

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
      setStatus(elements.quizFeedback, `Reference grade: ${result.grade.toFixed(2)} / 5.0. All listening decisions are accurate.`, "success");
    }
    updateSendState();
  });

  elements.resetButton.addEventListener("click", () => {
    elements.quizForm.reset();
    elements.finalNote.value = "";
    elements.wordCount.textContent = "0 words - write 35 to 100 words";
    clearCheckState();
    document.querySelector("#quiz").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  elements.finalNote.addEventListener("input", () => {
    const words = wordCount(elements.finalNote.value);
    elements.wordCount.textContent = `${words} words - write 35 to 100 words`;
    if (state.submitted) {
      state.submitted = false;
      elements.sendButton.textContent = "Send to teacher";
      setDelivery("Your note changed. Send the updated version when you are ready.", "");
    }
    updateSendState();
  });

  elements.sendButton.addEventListener("click", () => {
    const answers = selectedAnswers();
    const words = wordCount(elements.finalNote.value);
    if (!state.checked || !state.result || !answers) {
      setDelivery("Check the complete quiz before sending it to the teacher.", "error");
      return;
    }
    if (words < 35 || words > 100) {
      setDelivery("Your listening note must be between 35 and 100 words.", "error");
      return;
    }
    const headers = authHeaders();
    if (!headers) {
      setDelivery("Sign in first. Your listening follow-up must be linked to your student record before it can be sent to the teacher.", "error");
      openLoginPanel();
      return;
    }
    elements.sendButton.disabled = true;
    setDelivery("Sending your listening follow-up to the teacher...", "");
    fetch(data.submitEndpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({
        answers,
        finalNote: elements.finalNote.value.trim(),
        clientDate: new Date().toISOString().slice(0, 10)
      })
    }).then(response => response.json().then(body => ({ ok: response.ok, status: response.status, body })))
      .then(result => {
        if (!result.ok) {
          elements.sendButton.disabled = false;
          if (result.status === 403) {
            setDelivery("Your account is signed in, but it is not linked to an Intermediate English student record. Ask the teacher to check your email in the gradebook.", "error");
          } else if (result.body && result.body.error === "text_too_short") {
            setDelivery("Your note is too short. Write at least 35 words before sending.", "error");
          } else if (result.body && result.body.error === "text_too_long") {
            setDelivery("Your note is too long. Keep it under 100 words before sending.", "error");
          } else {
            setDelivery("The listening follow-up could not be saved. Please reload and try again.", "error");
          }
          return;
        }
        state.submitted = true;
        const incorrect = Array.isArray(result.body.incorrectQuestions) ? result.body.incorrectQuestions : [];
        setDelivery(`Submitted to teacher. Reference grade: ${Number(result.body.grade).toFixed(2)} / 5.0. ${incorrect.length ? "Questions marked for review: " + incorrect.join(", ") + "." : "All listening questions were accurate."} Gradebook weight: 0%.`, "success");
        elements.sendButton.textContent = "Submitted to teacher";
        updateSendState();
      })
      .catch(() => {
        elements.sendButton.disabled = false;
        setDelivery("Network error. The activity was not submitted.", "error");
      });
  });

  elements.transcriptButton.addEventListener("click", () => {
    const headers = authHeaders();
    if (!headers) {
      elements.transcriptStatus.textContent = "Sign in with a teacher or administrator account first.";
      openLoginPanel();
      return;
    }
    elements.transcriptButton.disabled = true;
    elements.transcriptStatus.textContent = "Checking teacher access...";
    fetch(data.transcriptEndpoint, { headers })
      .then(response => response.json().then(body => ({ ok: response.ok, status: response.status, body })))
      .then(result => {
        elements.transcriptButton.disabled = false;
        if (!result.ok) {
          elements.transcriptStatus.textContent = result.status === 403
            ? "This transcript is only available for approved teacher or administrator accounts."
            : "Transcript could not be loaded.";
          return;
        }
        elements.scriptBox.textContent = result.body.transcript || "";
        elements.scriptBox.classList.add("show");
        elements.transcriptStatus.textContent = "Teacher transcript loaded.";
      })
      .catch(() => {
        elements.transcriptButton.disabled = false;
        elements.transcriptStatus.textContent = "Network error. Transcript could not be loaded.";
      });
  });

  renderQuiz();
})();
