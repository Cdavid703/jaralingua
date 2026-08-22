(function () {
  "use strict";

  const predictionButtons = [...document.querySelectorAll("[data-reading-prediction]")];
  const predictionStatus = document.getElementById("sixWeekPredictionStatus");
  const quiz = document.getElementById("sixWeekReadingQuiz");
  const checkQuizButton = document.getElementById("checkSixWeekReading");
  const quizResult = document.getElementById("sixWeekReadingResult");
  const sendButton = document.getElementById("sendSixWeekReading");
  const deliveryStatus = document.getElementById("sixWeekReadingDeliveryStatus");
  const inbox = document.getElementById("sixWeekReadingTeacherInbox");
  const inboxList = document.getElementById("sixWeekReadingTeacherInboxList");
  const SUBMIT_PATH = "/api/intermediate2/unit2-reading/submit";
  const INBOX_PATH = "/api/intermediate2/unit2-reading/submissions";
  const SUBMISSION_KEY = "jaralingua:intermediate2:unit2:reading:submission:v1";
  let quizChecked = false;

  function readUser() {
    for (const [key, provider] of [["jaralingua_google_user", "google"], ["jaralingua_microsoft_user", "microsoft"], ["jaralingua_local_user", "local"]]) {
      try {
        const item = JSON.parse(sessionStorage.getItem(key) || "null");
        if (item?.credential) return { ...item, provider };
      } catch (_error) {
        sessionStorage.removeItem(key);
      }
    }
    return null;
  }

  function authHeaders(user, json = false) {
    const headers = { Authorization: `Bearer ${user.credential}`, "X-Jaralingua-Auth-Provider": user.provider || "google" };
    if (json) headers["Content-Type"] = "application/json";
    return headers;
  }

  function submissionId() {
    let value = sessionStorage.getItem(SUBMISSION_KEY);
    if (!value) {
      value = globalThis.crypto?.randomUUID?.() || `ie2-u2-reading-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      sessionStorage.setItem(SUBMISSION_KEY, value);
    }
    return value;
  }

  function setDeliveryStatus(message, state = "") {
    deliveryStatus.className = `ie2-reading-result show ${state}`;
    deliveryStatus.textContent = message;
  }

  function quizAnswers() {
    return Object.fromEntries([...quiz.querySelectorAll(".ie2-reading-question")].map((card, index) => [`q${index + 1}`, card.querySelector("input:checked")?.value || ""]));
  }

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

    quizChecked = true;
    sendButton.disabled = false;
    setDeliveryStatus("Reading report ready. You may send it to the teacher inbox; it will not appear in Grades.", "correct");
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
    quizChecked = false;
    sendButton.disabled = true;
    deliveryStatus.className = "ie2-reading-result";
    deliveryStatus.textContent = "Complete and check all ten answers to unlock delivery.";
  }, 0));

  async function loadTeacherInbox() {
    const user = readUser();
    if (!user) return;
    try {
      const response = await fetch(INBOX_PATH, { headers: authHeaders(user) });
      const payload = await response.json();
      if (!response.ok || !payload.teacherInbox) return;
      inbox.hidden = false;
      const items = Array.isArray(payload.items) ? payload.items : [];
      inboxList.replaceChildren(...items.map((item) => {
        const row = document.createElement("article");
        row.className = "ie2-reading-question";
        row.innerHTML = "<h3></h3><p></p><p></p>";
        row.querySelector("h3").textContent = item.studentName || "Student";
        row.querySelectorAll("p")[0].textContent = `${item.completedAnswers}/10 answers completed`;
        row.querySelectorAll("p")[1].textContent = `Received ${new Date(item.submittedAt).toLocaleString()} · Receipt: ${item.receiptId}`;
        return row;
      }));
      if (!items.length) inboxList.textContent = "No reading reports have been received yet.";
    } catch (_error) {
      /* Student view remains private when inbox is unavailable. */
    }
  }

  sendButton.addEventListener("click", async () => {
    if (!quizChecked) return;
    const user = readUser();
    if (!user) {
      setDeliveryStatus("Sign in from the course menu before sending your reading report.", "needs-review");
      return;
    }
    sendButton.disabled = true;
    setDeliveryStatus("Sending your reading report...");
    try {
      const response = await fetch(SUBMIT_PATH, { method: "POST", headers: authHeaders(user, true), body: JSON.stringify({ clientSubmissionId: submissionId(), details: { answers: quizAnswers() } }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "delivery_failed");
      setDeliveryStatus(`Received by the teacher inbox. Receipt: ${payload.receiptId}. This delivery is not in Grades and has no percentage.`, "correct");
      sendButton.textContent = "Submitted to teacher";
      loadTeacherInbox();
    } catch (_error) {
      sendButton.disabled = false;
      setDeliveryStatus("The delivery could not be confirmed. Your answers remain on this page; try Send to teacher again.", "needs-review");
    }
  });

  loadTeacherInbox();
}());