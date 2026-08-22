(function () {
  "use strict";

  const audio = document.getElementById("midnightCallAudio");
  const audioStatus = document.getElementById("midnightAudioStatus");
  const speedButtons = [...document.querySelectorAll("[data-audio-speed]")];
  const passButtons = [...document.querySelectorAll("[data-listen-pass]")];
  const passStatus = document.getElementById("listeningPassStatus");
  const quiz = document.getElementById("midnightListeningQuiz");
  const checkQuizButton = document.getElementById("checkMidnightListening");
  const quizResult = document.getElementById("midnightListeningResult");
  const timerDisplay = document.getElementById("midnightSpeakingTimer");
  const startTimerButton = document.getElementById("startMidnightSpeakingTimer");
  const resetTimerButton = document.getElementById("resetMidnightSpeakingTimer");
  const sendButton = document.getElementById("sendMidnightListening");
  const deliveryStatus = document.getElementById("midnightDeliveryStatus");
  const inbox = document.getElementById("midnightTeacherInbox");
  const inboxList = document.getElementById("midnightTeacherInboxList");
  const SUBMIT_PATH = "/api/intermediate2/unit2-listening/submit";
  const INBOX_PATH = "/api/intermediate2/unit2-listening/submissions";
  const SUBMISSION_KEY = "jaralingua:intermediate2:unit2:listening:submission:v1";
  const completedPasses = new Set();
  let timerSeconds = 45;
  let timerId = null;
  let quizChecked = false;

  function readUser() {
    for (const [key, provider] of [["jaralingua_google_user", "google"], ["jaralingua_microsoft_user", "microsoft"], ["jaralingua_local_user", "local"]]) {
      try { const item = JSON.parse(sessionStorage.getItem(key) || "null"); if (item?.credential) return { ...item, provider }; } catch (_error) { sessionStorage.removeItem(key); }
    }
    return null;
  }

  function authHeaders(user, json = false) { const headers = { Authorization: `Bearer ${user.credential}`, "X-Jaralingua-Auth-Provider": user.provider || "google" }; if (json) headers["Content-Type"] = "application/json"; return headers; }
  function submissionId() { let value = sessionStorage.getItem(SUBMISSION_KEY); if (!value) { value = globalThis.crypto?.randomUUID?.() || `ie2-u2-listening-${Date.now()}-${Math.random().toString(16).slice(2)}`; sessionStorage.setItem(SUBMISSION_KEY, value); } return value; }
  function setDeliveryStatus(message, state = "") { deliveryStatus.className = `ie2-reading-result show ${state}`; deliveryStatus.textContent = message; }
  function quizAnswers() { return Object.fromEntries([...quiz.querySelectorAll(".ie2-reading-question")].map((card, index) => [`q${index + 1}`, card.querySelector("input:checked")?.value || ""])); }

  function renderTimer() {
    const minutes = Math.floor(timerSeconds / 60);
    const seconds = timerSeconds % 60;
    timerDisplay.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  function stopTimer() {
    if (timerId) {
      window.clearInterval(timerId);
      timerId = null;
    }
  }

  speedButtons.forEach((button) => button.addEventListener("click", () => {
    const speed = Number(button.dataset.audioSpeed);
    audio.playbackRate = speed;
    speedButtons.forEach((item) => item.classList.toggle("is-active", item === button));
    audioStatus.textContent = `Playback speed set to ${speed}x.`;
  }));

  audio.addEventListener("play", () => { audioStatus.textContent = "Playing the conversation with Salomé and Mr. Vega."; });
  audio.addEventListener("pause", () => { if (!audio.ended) audioStatus.textContent = "Paused. Continue when you are ready."; });
  audio.addEventListener("ended", () => { audioStatus.textContent = "Listening complete. Replay for evidence or continue to the questions."; });
  audio.addEventListener("error", () => { audioStatus.textContent = "The audio could not load. Refresh the page and try again."; });

  passButtons.forEach((button) => button.addEventListener("click", () => {
    const pass = button.dataset.listenPass;
    if (completedPasses.has(pass)) {
      completedPasses.delete(pass);
      button.classList.remove("is-complete");
      button.textContent = `Mark ${pass.toLowerCase()} complete`;
    } else {
      completedPasses.add(pass);
      button.classList.add("is-complete");
      button.textContent = "Completed · tap to undo";
    }
    passStatus.textContent = `Listening self-check: ${completedPasses.size} of 3 passes marked.`;
  }));

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
      feedback.textContent = `${isCorrect ? "Correct." : "Listen again for the evidence."} ${card.dataset.feedback}`;
      feedback.className = `ie2-question-feedback show ${isCorrect ? "correct" : "needs-review"}`;
    });
    if (answered < questions.length) {
      quizResult.className = "ie2-reading-result show needs-review";
      quizResult.textContent = `Answer all 10 questions. Completed: ${answered} of ${questions.length}.`;
      return;
    }
    quizChecked = true;
    sendButton.disabled = false;
    setDeliveryStatus("Listening report ready. You may send it to the teacher inbox; it will not affect Grades.", "correct");
    quizResult.className = `ie2-reading-result show ${correct === questions.length ? "correct" : "needs-review"}`;
    quizResult.textContent = `${correct} of ${questions.length} correct. ${correct === questions.length ? "Excellent listening. You separated facts from the unresolved ending." : "Use the evidence feedback, listen again and retry the marked questions."}`;
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
      inboxList.replaceChildren(...items.map((item) => { const row = document.createElement("article"); row.className = "ie2-reading-question"; row.innerHTML = `<h3></h3><p></p><p></p>`; row.querySelector("h3").textContent = item.studentName || "Student"; row.querySelectorAll("p")[0].textContent = `${item.completedAnswers}/10 answers completed · ${item.listeningPasses}/3 self-checks`; row.querySelectorAll("p")[1].textContent = `Received ${new Date(item.submittedAt).toLocaleString()} · Receipt: ${item.receiptId}`; return row; }));
      if (!items.length) inboxList.textContent = "No listening reports have been received yet.";
    } catch (_error) { /* Student view remains private when inbox is unavailable. */ }
  }

  sendButton.addEventListener("click", async () => {
    if (!quizChecked) return;
    const user = readUser();
    if (!user) { setDeliveryStatus("Sign in from the course menu before sending your listening report.", "needs-review"); return; }
    sendButton.disabled = true;
    setDeliveryStatus("Sending your listening report...");
    try {
      const response = await fetch(SUBMIT_PATH, { method: "POST", headers: authHeaders(user, true), body: JSON.stringify({ clientSubmissionId: submissionId(), details: { answers: quizAnswers(), completedPasses: [...completedPasses] } }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "delivery_failed");
      setDeliveryStatus(`Received by the teacher inbox. Receipt: ${payload.receiptId}. This delivery is not in Grades and has no percentage.`, "correct");
      sendButton.textContent = "Submitted to teacher";
      loadTeacherInbox();
    } catch (_error) { sendButton.disabled = false; setDeliveryStatus("The delivery could not be confirmed. Your answers remain on this page; try Send to teacher again.", "needs-review"); }
  });

  startTimerButton.addEventListener("click", () => {
    if (timerId) {
      stopTimer();
      startTimerButton.textContent = "Continue";
      return;
    }
    if (timerSeconds === 0) timerSeconds = 45;
    renderTimer();
    startTimerButton.textContent = "Pause";
    timerId = window.setInterval(() => {
      timerSeconds -= 1;
      renderTimer();
      if (timerSeconds <= 0) {
        stopTimer();
        startTimerButton.textContent = "Start again";
        timerDisplay.textContent = "Done!";
      }
    }, 1000);
  });

  resetTimerButton.addEventListener("click", () => {
    stopTimer();
    timerSeconds = 45;
    startTimerButton.textContent = "Start 45 seconds";
    renderTimer();
  });

  renderTimer();
  loadTeacherInbox();
}());
