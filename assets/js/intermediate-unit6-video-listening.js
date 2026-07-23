"use strict";

window.JaraLinguaUnit6VideoListeningData = {
  submitEndpoint: "/api/intermediate/unit6-video-listening/submit",
  transcriptEndpoint: "/api/intermediate/unit6-video-listening/transcript",
  youtubeVideoId: "pFTWPJ13wKc",
  youtubeTitle: "Olivia's Week in 90 Seconds",
  answers: [1, 2, 0, 2, 1, 0, 2, 1, 0, 2],
  questions: [
    {
      skill: "Main idea",
      question: "What is the main purpose of the video conversation?",
      options: ["To cancel Olivia's music project", "To organize Olivia's busy week before filming and recording", "To choose a restaurant for family dinner"],
      feedback: "Listen for the overall problem. Olivia and Marcus are organizing a busy week, not cancelling the project or planning a restaurant visit."
    },
    {
      skill: "Fixed event",
      question: "What confirmed event is Olivia protecting on Wednesday afternoon?",
      options: ["A radio interview", "A family dinner", "A recording session with the producer"],
      feedback: "The confirmed Wednesday event is described with present continuous. Focus on what is already arranged with the producer."
    },
    {
      skill: "Grammar noticing",
      question: "Why does Olivia say 'I am recording...' instead of only 'I want to record...'?",
      options: ["Because the recording is already arranged", "Because she dislikes the producer", "Because it happened yesterday"],
      feedback: "Present continuous for future is used when a future event is arranged. It is not about dislike or past time."
    },
    {
      skill: "Unconfirmed plan",
      question: "Which plan is still up in the air?",
      options: ["The producer meeting", "The band rehearsal", "The radio interview"],
      feedback: "Up in the air means not confirmed. Listen for the flexible item that still needs a decision."
    },
    {
      skill: "Advice",
      question: "Why does Marcus suggest putting off the interview until Friday morning?",
      options: ["Because Friday morning is impossible", "Because it would free up Thursday after rehearsal", "Because Olivia should cancel family dinner"],
      feedback: "Connect put off with free up. Marcus wants to move one plan so Thursday has more usable time."
    },
    {
      skill: "Idiom",
      question: "What does 'I have a lot on my plate' mean here?",
      options: ["Olivia has many responsibilities", "Olivia is eating too much", "Olivia is preparing a recipe"],
      feedback: "This idiom is about workload and responsibilities. It is not literal food language."
    },
    {
      skill: "Complication",
      question: "What should Olivia do before changing the photo session?",
      options: ["Ignore the photographer", "Cancel the recording session", "Confirm whether the photographer is available"],
      feedback: "Marcus does not tell her to cancel. He tells her to confirm availability before changing another part of the schedule."
    },
    {
      skill: "Shared planning",
      question: "Why does Marcus say the team needs to be on the same page?",
      options: ["They need to read one book together", "They need shared understanding of the final agenda", "They need to use the same laptop"],
      feedback: "On the same page means shared understanding. In this video, it refers to everyone knowing the final agenda."
    },
    {
      skill: "Mixed forms",
      question: "Which sentence uses a confirmed arrangement and an intention correctly?",
      options: ["I am meeting the producer on Wednesday, and I am going to call the photographer today.", "I am going to met the producer yesterday.", "I should meeting the producer at two."],
      feedback: "Check the form after each structure. Present continuous can show an arrangement; be going to uses the base verb."
    },
    {
      skill: "Synthesis",
      question: "What is Marcus's final advice?",
      options: ["Add more tasks to the same day", "Keep all flexible tasks unchanged", "Protect fixed arrangements, move flexible tasks, and communicate the decision"],
      feedback: "Use the final sentence. Marcus summarizes a planning strategy, not an instruction to add more tasks."
    }
  ]
};

(() => {
  const data = window.JaraLinguaUnit6VideoListeningData;
  const allowedSpeeds = [0.75, 1, 1.25];
  const state = {
    checked: false,
    submitted: false,
    result: null,
    youtubeReady: false,
    pendingSpeed: 1,
    player: null
  };

  const elements = {
    videoFrame: document.querySelector("#videoFrame"),
    speedStatus: document.querySelector("#youtubeSpeedStatus"),
    speedButtons: Array.from(document.querySelectorAll("[data-youtube-speed]")),
    watchLink: document.querySelector("[data-youtube-watch-link]"),
    pendingAction: document.querySelector("[data-youtube-pending-action]"),
    quizForm: document.querySelector("[data-video-quiz-form]"),
    checkButton: document.querySelector("[data-check-video-answers]"),
    resetButton: document.querySelector("[data-reset-video-quiz]"),
    quizFeedback: document.querySelector("[data-video-quiz-feedback]"),
    sendButton: document.querySelector("[data-send-video-teacher]"),
    deliveryStatus: document.querySelector("[data-video-delivery-status]"),
    transcriptButton: document.querySelector("[data-load-video-transcript]"),
    transcriptStatus: document.querySelector("[data-video-transcript-status]"),
    scriptBox: document.querySelector("[data-video-script-box]")
  };

  if (!elements.quizForm) return;

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
    if (!element) return;
    element.className = element.className.replace(/\s?(success|error)\b/g, "");
    if (type) element.classList.add(type);
    element.textContent = message;
  }

  function setDelivery(message, type) {
    elements.deliveryStatus.className = "u6v-feedback" + (type ? " " + type : "");
    elements.deliveryStatus.textContent = message;
  }

  function updateSendState() {
    elements.sendButton.disabled = !(state.checked && !state.submitted);
  }

  function renderQuiz() {
    elements.quizForm.innerHTML = data.questions.map((item, index) => `
      <article class="u6v-question-card" data-question-card="${index}">
        <span class="u6v-skill">${escapeHtml(item.skill)}</span>
        <h3>${index + 1}. ${escapeHtml(item.question)}</h3>
        ${item.options.map((option, optionIndex) => `
          <label>
            <input type="radio" name="q${index}" value="${optionIndex}" />
            <span>${escapeHtml(option)}</span>
          </label>
        `).join("")}
        <div class="u6v-question-feedback" data-question-feedback="${index}" aria-live="polite"></div>
      </article>
    `).join("");
  }

  function markCards(result) {
    const incorrectSet = new Set(result.incorrect);
    elements.quizForm.querySelectorAll("[data-question-card]").forEach(card => {
      const index = Number(card.dataset.questionCard);
      const number = index + 1;
      const feedback = card.querySelector("[data-question-feedback]");
      const isWrong = incorrectSet.has(number);
      card.classList.toggle("is-review", isWrong);
      card.classList.toggle("is-correct", !isWrong);
      if (feedback) {
        feedback.className = "u6v-question-feedback " + (isWrong ? "is-review" : "is-correct");
        feedback.textContent = isWrong
          ? "Review: " + data.questions[index].feedback
          : "Correct. This answer matches the video evidence.";
      }
    });
  }

  function clearCheckState() {
    state.checked = false;
    state.submitted = false;
    state.result = null;
    elements.sendButton.textContent = "Send to teacher";
    elements.quizForm.querySelectorAll("[data-question-card]").forEach(card => {
      card.classList.remove("is-review", "is-correct");
      const feedback = card.querySelector("[data-question-feedback]");
      if (feedback) {
        feedback.className = "u6v-question-feedback";
        feedback.textContent = "";
      }
    });
    setStatus(elements.quizFeedback, "Choose all answers, then check the video quiz. You can change answers and check again before sending.", "");
    setDelivery("", "");
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

  function setSpeedButtons(rate) {
    state.pendingSpeed = rate;
    elements.speedButtons.forEach(button => {
      const active = Number(button.dataset.youtubeSpeed) === rate;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  function applyYouTubeSpeed(rate) {
    const next = Number(rate);
    if (!allowedSpeeds.includes(next)) return;
    setSpeedButtons(next);
    if (!data.youtubeVideoId) {
      setStatus(elements.speedStatus, `Video link is pending. ${next}x will apply when the YouTube player is added.`, "");
      return;
    }
    if (state.youtubeReady && state.player && typeof state.player.setPlaybackRate === "function") {
      state.player.setPlaybackRate(next);
      setStatus(elements.speedStatus, `Video speed changed successfully to ${next}x.`, "success");
      return;
    }
    setStatus(elements.speedStatus, `${next}x selected. Waiting for the YouTube player to finish loading.`, "");
  }

  function loadYouTubeApi() {
    if (!data.youtubeVideoId || window.YT?.Player) return;
    if (document.querySelector("script[data-youtube-api]")) return;
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.dataset.youtubeApi = "true";
    script.onerror = function () {
      setStatus(elements.speedStatus, "The video is available. If the speed buttons do not respond, use the YouTube settings menu.", "");
    };
    document.head.appendChild(script);
  }

  function initializeYouTubePlayer() {
    if (!window.YT?.Player || !document.querySelector("#unit6VideoPlayer")) return;
    state.player = new window.YT.Player("unit6VideoPlayer", {
      videoId: data.youtubeVideoId,
      playerVars: { rel: 0, modestbranding: 1, playsinline: 1 },
      events: {
        onReady() {
          state.youtubeReady = true;
          applyYouTubeSpeed(state.pendingSpeed);
          setStatus(elements.speedStatus, "YouTube player ready. Use 0.75x, 1x, or 1.25x while watching.", "success");
        }
      }
    });
  }

  function getYouTubeEmbedUrl() {
    const params = new URLSearchParams({
      rel: "0",
      modestbranding: "1",
      playsinline: "1",
      enablejsapi: "1"
    });
    if (window.location?.origin) params.set("origin", window.location.origin);
    return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(data.youtubeVideoId)}?${params.toString()}`;
  }

  function renderYouTubePlayer() {
    if (!data.youtubeVideoId || !elements.videoFrame) {
      setStatus(elements.speedStatus, "Video link pending. The quiz and teacher delivery are ready now; the YouTube embed will be added when the link is provided.", "");
      return;
    }
    elements.videoFrame.innerHTML = `
      <iframe
        id="unit6VideoPlayer"
        title="${escapeHtml(data.youtubeTitle || "Unit 6 video listening")}"
        src="${getYouTubeEmbedUrl()}"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen
        referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
    if (elements.watchLink) {
      elements.watchLink.href = `https://www.youtube.com/watch?v=${encodeURIComponent(data.youtubeVideoId)}`;
      elements.watchLink.hidden = false;
    }
    if (elements.pendingAction) elements.pendingAction.hidden = true;
    setStatus(elements.speedStatus, "YouTube video loaded. Use 0.75x, 1x, or 1.25x when the player is ready.", "");

    window.onYouTubeIframeAPIReady = function () {
      initializeYouTubePlayer();
    };

    initializeYouTubePlayer();
    loadYouTubeApi();
  }

  elements.speedButtons.forEach(button => {
    button.addEventListener("click", () => applyYouTubeSpeed(button.dataset.youtubeSpeed));
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
    state.submitted = false;
    state.result = result;
    markCards(result);
    const correctCount = result.total - result.incorrect.length;
    if (result.incorrect.length) {
      setStatus(elements.quizFeedback, `Reference grade: ${result.grade.toFixed(2)} / 5.0. Correct: ${correctCount} / ${result.total}. Questions marked for review: ${result.incorrect.join(", ")}. Read the feedback under each red card before sending. Correct answers are not shown.`, "error");
    } else {
      setStatus(elements.quizFeedback, `Reference grade: ${result.grade.toFixed(2)} / 5.0. Correct: ${correctCount} / ${result.total}. All video-listening decisions are accurate.`, "success");
    }
    updateSendState();
  });

  elements.resetButton.addEventListener("click", () => {
    elements.quizForm.reset();
    clearCheckState();
    document.querySelector("#videoQuiz")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  elements.sendButton.addEventListener("click", () => {
    const answers = selectedAnswers();
    if (!state.checked || !state.result || !answers) {
      setDelivery("Check the complete quiz before sending it to the teacher.", "error");
      return;
    }
    const headers = authHeaders();
    if (!headers) {
      setDelivery("Sign in first. Your video listening follow-up must be linked to your student record before it can be sent to the teacher.", "error");
      openLoginPanel();
      return;
    }
    elements.sendButton.disabled = true;
    setDelivery("Sending your video listening follow-up to the teacher...", "");
    fetch(data.submitEndpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({
        answers,
        clientDate: new Date().toISOString().slice(0, 10),
        videoStatus: data.youtubeVideoId ? "youtube-linked" : "youtube-link-pending",
        youtubeVideoId: data.youtubeVideoId
      })
    }).then(response => response.json().then(body => ({ ok: response.ok, status: response.status, body })))
      .then(result => {
        if (!result.ok) {
          elements.sendButton.disabled = false;
          if (result.status === 403) {
            setDelivery("Your account is signed in, but it is not linked to an Intermediate English student record. Ask the teacher to check your email in the gradebook.", "error");
          } else {
            setDelivery("The video listening follow-up could not be saved. Please reload and try again.", "error");
          }
          return;
        }
        state.submitted = true;
        const incorrect = Array.isArray(result.body.incorrectQuestions) ? result.body.incorrectQuestions : [];
        setDelivery(`Submitted to teacher. Reference grade: ${Number(result.body.grade).toFixed(2)} / 5.0. ${incorrect.length ? "Questions marked for review: " + incorrect.join(", ") + "." : "All video-listening questions were accurate."} Gradebook weight: 0%.`, "success");
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
  renderYouTubePlayer();
  applyYouTubeSpeed(1);
})();
