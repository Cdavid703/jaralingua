(function () {
  "use strict";

  var config = window.INTERMEDIATE_INTEGRATED_TASK_MOCK;
  var API = "/api/intermediate/grades";
  var SUPPORT_API = "/api/intermediate/mock-integrated-task";
  var GOOGLE_USER_KEY = "jaralingua_google_user";
  var MICROSOFT_USER_KEY = "jaralingua_microsoft_user";
  var LOCAL_USER_KEY = "jaralingua_local_user";
  var DRAFT_KEY_PREFIX = "intermediate_integrated_mock_draft_";
  var PLAY_KEY_PREFIX = "intermediate_integrated_mock_plays_";
  var els = {
    access: document.getElementById("accessPanel"),
    accessStatus: document.getElementById("accessStatus"),
    exam: document.getElementById("examContent"),
    form: document.getElementById("integratedTaskForm"),
    questions: document.getElementById("questionsContainer"),
    audio: document.getElementById("listeningAudio"),
    audioFeedback: document.getElementById("audioActionFeedback"),
    writing: document.getElementById("writingResponse"),
    words: document.getElementById("wordCount"),
    result: document.getElementById("submitResult"),
    submit: document.getElementById("submitExamBtn"),
    receipt: document.getElementById("printReceipt"),
    history: document.getElementById("attemptHistory"),
    diagnostic: document.getElementById("diagnosticSection"),
    skillDiagnostic: document.getElementById("skillDiagnostic"),
    writingDiagnostic: document.getElementById("writingDiagnostic"),
    feedbackAdmin: document.getElementById("feedbackAdminPanel"),
    feedbackBadge: document.getElementById("feedbackStateBadge"),
    feedbackAdminStatus: document.getElementById("feedbackAdminStatus"),
    feedbackStatus: document.getElementById("feedbackAccessStatus"),
    feedbackButton: document.getElementById("loadFeedbackBtn"),
    feedbackContent: document.getElementById("feedbackContent")
  };
  var user = null;
  var student = null;
  var lastCredential = "";
  var verifying = false;
  var authorized = false;
  var audioReady = false;
  var activeListen = false;
  var furthestAudioTime = 0;
  var currentSpeed = 1;
  var currentRole = "student";
  var supportState = { state: { feedbackOpen: false }, attempts: [], feedbackAvailable: false };

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function readStoredUser(key, provider) {
    try {
      var saved = JSON.parse(sessionStorage.getItem(key) || "null");
      if (!saved || !saved.credential) return null;
      if (saved.exp && Date.now() / 1000 > saved.exp) {
        sessionStorage.removeItem(key);
        return null;
      }
      return Object.assign({ provider: provider }, saved);
    } catch (_error) {
      return null;
    }
  }

  function currentUser() {
    return readStoredUser(GOOGLE_USER_KEY, "google") ||
      readStoredUser(MICROSOFT_USER_KEY, "microsoft") ||
      readStoredUser(LOCAL_USER_KEY, "local");
  }

  function authHeaders() {
    if (!user || !user.credential) return {};
    return {
      "Authorization": "Bearer " + user.credential,
      "X-Jaralingua-Auth-Provider": user.provider || "google",
      "Content-Type": "application/json"
    };
  }

  function userKey() {
    return String((user && user.email) || "anonymous").trim().toLowerCase().replace(/[^a-z0-9@._-]/g, "_");
  }

  function draftKey() {
    return DRAFT_KEY_PREFIX + userKey();
  }

  function playKey() {
    return PLAY_KEY_PREFIX + userKey();
  }

  function openLogin(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    var panel = document.querySelector("[data-auth-panel]");
    if (panel && !panel.hidden) {
      toast("Sign-in options are already open. Choose Google, Microsoft, or your course account.", "success");
      return;
    }
    var trigger = document.querySelector("[data-auth-toggle]") || document.querySelector("[data-auth-nav-toggle]");
    if (!trigger) {
      toast("The sign-in options could not be loaded. Reload the page and try again.", "error");
      return;
    }
    trigger.click();
    window.setTimeout(function () {
      var openedPanel = document.querySelector("[data-auth-panel]");
      if (openedPanel && !openedPanel.hidden) {
        toast("Sign-in options opened: Google, Microsoft, and course account.", "success");
      } else {
        toast("The sign-in panel did not open. Reload the page and try again.", "error");
      }
    }, 80);
  }

  function toast(message, type) {
    var previous = document.querySelector(".toast");
    if (previous) previous.remove();
    var node = document.createElement("div");
    node.className = "toast " + (type || "");
    node.textContent = message;
    node.setAttribute("role", "status");
    node.setAttribute("aria-live", "polite");
    node.setAttribute("aria-atomic", "true");
    document.body.appendChild(node);
    window.setTimeout(function () { node.remove(); }, 5200);
  }

  function lock(message) {
    authorized = false;
    els.exam.hidden = true;
    els.access.hidden = false;
    els.accessStatus.textContent = message;
  }

  function showExam() {
    authorized = true;
    els.exam.hidden = false;
    els.access.hidden = true;
  }

  function today() {
    return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota" }).format(new Date());
  }

  function wordCount() {
    return (els.writing.value.trim().match(/\b[\w'-]+\b/g) || []).length;
  }

  function collectAnswers() {
    var answers = {};
    config.questions.forEach(function (question) {
      var checked = els.form.querySelector('input[name="q_' + CSS.escape(question.id) + '"]:checked');
      if (checked) answers[question.id] = Number(checked.value);
    });
    return answers;
  }

  function saveDraft() {
    if (!authorized || !user) return;
    var draft = {
      courseCode: document.getElementById("courseCode").value,
      writing: els.writing.value,
      answers: collectAnswers(),
      updatedAt: new Date().toISOString()
    };
    sessionStorage.setItem(draftKey(), JSON.stringify(draft));
  }

  function updateWordCount() {
    els.words.textContent = wordCount() + " words";
    saveDraft();
  }

  function restoreDraft() {
    try {
      var draft = JSON.parse(sessionStorage.getItem(draftKey()) || "null");
      if (!draft) return;
      document.getElementById("courseCode").value = draft.courseCode || "INTERMEDIATE-C1";
      els.writing.value = draft.writing || "";
      Object.keys(draft.answers || {}).forEach(function (id) {
        var input = els.form.querySelector('input[name="q_' + CSS.escape(id) + '"][value="' + draft.answers[id] + '"]');
        if (input) input.checked = true;
      });
      els.words.textContent = wordCount() + " words";
    } catch (_error) {}
  }

  function renderQuestions() {
    els.questions.innerHTML = config.questions.map(function (question, index) {
      var options = question.options.map(function (option, optionIndex) {
        return '<label class="option"><input type="radio" name="q_' + escapeHtml(question.id) + '" value="' + optionIndex + '" required><span>' + String.fromCharCode(97 + optionIndex) + ") " + escapeHtml(option) + "</span></label>";
      }).join("");
      return '<fieldset class="question-card"><legend>' + (index + 1) + ". " + escapeHtml(question.prompt) + "</legend>" + options + "</fieldset>";
    }).join("");
    els.form.querySelectorAll('input[type="radio"]').forEach(function (input) {
      input.addEventListener("change", saveDraft);
    });
  }

  function fillIdentity(identity, role) {
    document.getElementById("studentName").value = identity.fullName || identity.name || user.name || "";
    document.getElementById("studentId").value = identity.id || (role === "student" ? "" : "STAFF PREVIEW");
    document.getElementById("examDate").value = today();
  }

  function readPlayCount() {
    return Number(sessionStorage.getItem(playKey()) || 0);
  }

  function writePlayCount(count) {
    sessionStorage.setItem(playKey(), String(count));
  }

  function setAudioSpeed(value) {
    var next = Number(value);
    if ([0.75, 1, 1.25].indexOf(next) === -1) return;
    currentSpeed = next;
    els.audio.playbackRate = next;
    document.querySelectorAll("[data-audio-speed]").forEach(function (button) {
      var isActive = Number(button.getAttribute("data-audio-speed")) === next;
      button.classList.toggle("active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
    els.audioFeedback.className = "inline-action-feedback success";
    els.audioFeedback.textContent = "Audio speed changed successfully to " + next + "x. Replay remains unlimited.";
  }

  function setupAudio() {
    els.audio.src = config.audio;
    els.audio.playbackRate = currentSpeed;
    writePlayCount(readPlayCount());
    if (audioReady) return;
    audioReady = true;

    document.querySelectorAll("[data-audio-speed]").forEach(function (button) {
      button.addEventListener("click", function () { setAudioSpeed(button.getAttribute("data-audio-speed")); });
    });

    els.audio.addEventListener("contextmenu", function (event) { event.preventDefault(); });
    els.audio.addEventListener("ratechange", function () {
      if ([0.75, 1, 1.25].indexOf(Number(els.audio.playbackRate)) === -1) {
        els.audio.playbackRate = currentSpeed;
      } else {
        currentSpeed = Number(els.audio.playbackRate);
      }
      setAudioSpeed(currentSpeed);
    });
    els.audio.addEventListener("timeupdate", function () {
      if (!els.audio.seeking && els.audio.currentTime > furthestAudioTime) furthestAudioTime = els.audio.currentTime;
    });
    els.audio.addEventListener("seeking", function () {
      if (activeListen && Math.abs(els.audio.currentTime - furthestAudioTime) > 2.2) {
        els.audio.currentTime = furthestAudioTime;
        toast("Seeking is disabled during each listening attempt.", "error");
      }
    });
    els.audio.addEventListener("play", function () {
      var count = readPlayCount();
      if (!activeListen && els.audio.currentTime < 0.8) {
        count += 1;
        activeListen = true;
        furthestAudioTime = 0;
        writePlayCount(count);
        els.audioFeedback.className = "inline-action-feedback success";
        els.audioFeedback.textContent = "Listening started at " + currentSpeed + "x. Replay is available without a limit.";
        toast("Listening started. Replay is unlimited.", "success");
      }
    });
    els.audio.addEventListener("ended", function () {
      activeListen = false;
      furthestAudioTime = 0;
      els.audio.currentTime = 0;
      els.audioFeedback.className = "inline-action-feedback success";
      els.audioFeedback.textContent = "Listening completed. You may replay the audio as needed.";
      toast("Listening completed. You may listen again.", "success");
    });
  }

  function setResult(html, type) {
    els.result.className = "status-box show " + (type || "pending");
    els.result.innerHTML = html;
  }

  function formatAttemptDate(value) {
    if (!value) return "Date unavailable";
    var date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat("en", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "America/Bogota"
    }).format(date);
  }

  function diagnosticLevel(correct, total) {
    if (correct === total) return { label: "Secure", className: "secure" };
    if (correct > 0) return { label: "Developing", className: "developing" };
    return { label: "Priority review", className: "priority" };
  }

  function renderDiagnostic(attempt) {
    if (!attempt || !attempt.skills) return;
    els.diagnostic.hidden = false;
    els.skillDiagnostic.innerHTML = Object.keys(attempt.skills).map(function (key) {
      var skill = attempt.skills[key];
      var level = diagnosticLevel(Number(skill.correct || 0), Number(skill.total || 0));
      return '<article class="diagnostic-card ' + level.className + '">' +
        '<div class="diagnostic-card-head"><strong>' + escapeHtml(skill.label) + '</strong><span>' + level.label + '</span></div>' +
        '<div class="diagnostic-score"><b>' + Number(skill.correct || 0) + '</b> / ' + Number(skill.total || 0) + '</div>' +
        '<p>' + escapeHtml(skill.studyTip || "Review this listening area before your next attempt.") + '</p></article>';
    }).join("");
    var writingLabels = {
      content: "Purpose and cultural context",
      quantities: "Quantity language",
      sensory: "Taste and texture evidence",
      comparison: "Comparison",
      recommendation: "Rating and recommendation"
    };
    els.writingDiagnostic.innerHTML = '<h3>Writing signals</h3><div class="signal-list">' +
      Object.keys(writingLabels).map(function (key) {
        var found = attempt.writingSignals && attempt.writingSignals[key] === true;
        return '<span class="signal-chip ' + (found ? "found" : "missing") + '"><i class="bi ' + (found ? "bi-check-circle-fill" : "bi-dash-circle-fill") + '"></i>' + escapeHtml(writingLabels[key]) + '</span>';
      }).join("") + '</div><p>The automatic report detects evidence in your text; it does not evaluate the quality of your ideas or language.</p>';
  }

  function renderHistory(attempts) {
    var items = Array.isArray(attempts) ? attempts : [];
    if (!items.length) {
      els.history.innerHTML = '<p class="empty-state">No completed simulations yet. Your first saved attempt will appear here.</p>';
      return;
    }
    els.history.innerHTML = items.map(function (attempt, index) {
      return '<article class="history-item"><div><span>Attempt ' + (items.length - index) + '</span><strong>' + escapeHtml(formatAttemptDate(attempt.submittedAt)) + '</strong></div>' +
        '<div><span>Listening</span><strong>' + Number(attempt.listeningPoints || 0).toFixed(1) + ' / 25</strong></div>' +
        '<div><span>Writing signals</span><strong>' + Number(attempt.writingSignalCount || 0) + ' / 5</strong></div>' +
        '<button class="history-diagnostic-button" type="button" data-history-index="' + index + '"><i class="bi bi-bar-chart-fill"></i> View diagnosis</button></article>';
    }).join("");
    els.history.querySelectorAll("[data-history-index]").forEach(function (button) {
      button.addEventListener("click", function () {
        var attempt = items[Number(button.getAttribute("data-history-index"))];
        renderDiagnostic(attempt);
        els.diagnostic.scrollIntoView({ behavior: "smooth", block: "start" });
        toast("The selected attempt diagnosis is open.", "success");
      });
    });
  }

  function renderSupportState(payload) {
    supportState = payload || supportState;
    var state = supportState.state || { feedbackOpen: false };
    var isStaff = currentRole === "teacher" || currentRole === "admin";
    var attempts = Array.isArray(supportState.attempts) ? supportState.attempts : [];
    renderHistory(attempts);
    els.feedbackAdmin.hidden = !isStaff;
    els.feedbackBadge.className = "state-badge " + (state.feedbackOpen ? "open" : "closed");
    els.feedbackBadge.textContent = state.feedbackOpen ? "Open for students" : "Closed for students";
    if (isStaff) {
      els.feedbackAdminStatus.textContent = state.feedbackOpen
        ? "Students with a saved attempt can load the transcript and explanations."
        : "Students cannot load the transcript or explanations.";
      els.feedbackButton.disabled = false;
      els.feedbackStatus.textContent = "Teacher access is available for lesson preparation and post-attempt review.";
    } else if (!attempts.length) {
      els.feedbackButton.disabled = true;
      els.feedbackStatus.textContent = "Complete and save one simulation before this resource can be released to you.";
    } else if (supportState.feedbackAvailable) {
      els.feedbackButton.disabled = false;
      els.feedbackStatus.textContent = "Your teacher has released the transcript and answer explanations.";
    } else {
      els.feedbackButton.disabled = true;
      els.feedbackStatus.textContent = "Your attempt is saved. The transcript and explanations are still locked by your teacher.";
    }
    if (!isStaff && !supportState.feedbackAvailable) {
      els.feedbackContent.hidden = true;
      els.feedbackContent.innerHTML = "";
    }
  }

  async function loadSupportState() {
    if (user && user.credential === "local-preview") {
      renderSupportState({ role: currentRole, state: { feedbackOpen: false }, attempts: [], feedbackAvailable: currentRole !== "student" });
      return;
    }
    try {
      var response = await fetch(SUPPORT_API + "/state", { headers: authHeaders() });
      var payload = await response.json().catch(function () { return {}; });
      if (!response.ok) throw new Error(payload.error || "support_state_failed");
      renderSupportState(payload);
    } catch (_error) {
      els.history.innerHTML = '<p class="empty-state error-text">Your practice history could not be loaded. Check the connection and try again.</p>';
      els.feedbackButton.disabled = true;
      els.feedbackStatus.textContent = "Feedback availability could not be checked.";
    }
  }

  async function saveAttempt(answers) {
    var response = await fetch(SUPPORT_API + "/attempts", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        answers: answers,
        writing: els.writing.value,
        audioPlays: readPlayCount()
      })
    });
    var payload = await response.json().catch(function () { return {}; });
    if (!response.ok) throw new Error(payload.error || "attempt_save_failed");
    return payload;
  }

  async function setFeedbackState(isOpen) {
    var buttons = document.querySelectorAll("[data-feedback-state]");
    buttons.forEach(function (button) { button.disabled = true; });
    els.feedbackAdminStatus.className = "activation-feedback";
    els.feedbackAdminStatus.textContent = isOpen ? "Opening feedback for students..." : "Closing feedback for students...";
    try {
      var response = await fetch(SUPPORT_API + "/state", {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ feedbackOpen: isOpen })
      });
      var payload = await response.json().catch(function () { return {}; });
      if (!response.ok) throw new Error(payload.error || "feedback_state_failed");
      supportState.state = payload.state;
      supportState.feedbackAvailable = true;
      renderSupportState(supportState);
      els.feedbackAdminStatus.className = "activation-feedback success";
      els.feedbackAdminStatus.textContent = payload.message;
      toast(payload.message, "success");
    } catch (_error) {
      els.feedbackAdminStatus.className = "activation-feedback error";
      els.feedbackAdminStatus.textContent = "The feedback setting could not be changed. Check the connection and try again.";
      toast("The feedback setting was not changed.", "error");
    } finally {
      buttons.forEach(function (button) { button.disabled = false; });
    }
  }

  async function loadReleasedFeedback() {
    els.feedbackButton.disabled = true;
    els.feedbackStatus.textContent = "Loading the protected transcript and explanations...";
    try {
      var response = await fetch(SUPPORT_API + "/feedback", { headers: authHeaders() });
      var payload = await response.json().catch(function () { return {}; });
      if (!response.ok) throw new Error(payload.error || "feedback_load_failed");
      var transcript = String(payload.transcript || "").split(/\n\s*\n/).map(function (paragraph) {
        return "<p>" + escapeHtml(paragraph) + "</p>";
      }).join("");
      var explanations = (payload.explanations || []).map(function (item) {
        return '<details class="answer-explanation"><summary><span>Question ' + Number(item.number) + '</span>' + escapeHtml(item.skill) + '</summary><div><strong>' + escapeHtml(item.question) + '</strong><p><b>Correct answer:</b> ' + escapeHtml(item.correctOption) + '</p><p><b>Why:</b> ' + escapeHtml(item.rationale) + '</p></div></details>';
      }).join("");
      els.feedbackContent.innerHTML = '<div class="protected-transcript"><h3>' + escapeHtml(payload.title || "Teacher-released transcript") + '</h3>' + transcript + '</div><div class="answer-explanation-list"><h3>Answer explanations</h3>' + explanations + '</div>';
      els.feedbackContent.hidden = false;
      els.feedbackStatus.textContent = "Protected feedback loaded successfully.";
      toast("Transcript and explanations loaded successfully.", "success");
    } catch (error) {
      els.feedbackStatus.textContent = error.message === "feedback_locked"
        ? "This resource is still locked by your teacher."
        : "The protected feedback could not be loaded. Check the connection and try again.";
      toast("Protected feedback was not loaded.", "error");
    } finally {
      els.feedbackButton.disabled = false;
    }
  }

  function validate() {
    var answers = collectAnswers();
    if (Object.keys(answers).length !== config.questions.length) {
      setResult("Answer all ten listening questions before checking the simulation.", "error");
      return null;
    }
    var count = wordCount();
    if (count < 100 || count > 140) {
      setResult("Your food review must contain 100 to 140 words. It currently has " + count + ".", "error");
      els.writing.focus();
      return null;
    }
    return answers;
  }

  async function checkPractice(answers) {
    els.form.querySelectorAll("input, textarea").forEach(function (node) { node.disabled = true; });
    els.submit.disabled = true;
    setResult(
      '<strong>Checking and saving your practice...</strong><p class="attempt-save-status"><i class="bi bi-cloud-arrow-up-fill"></i> The protected server is calculating the listening result and diagnostic.</p>',
      "pending"
    );
    try {
      var saved = await saveAttempt(answers);
      var attempt = saved.attempt;
      if (!attempt || !attempt.skills) throw new Error("invalid_attempt_result");
      var incorrect = Array.isArray(attempt.incorrectQuestions) ? attempt.incorrectQuestions : [];
      var reviewLine = incorrect.length
        ? "Questions to review: " + incorrect.join(", ") + ". Correct answers are not displayed; reset the full practice to try again."
        : "All listening answers were accurate.";
      sessionStorage.removeItem(draftKey());
      els.receipt.textContent = "PRACTICE COPY - LISTENING " + Number(attempt.listeningPoints || 0).toFixed(1) + " / 25 - WRITING NOT GRADED";
      renderDiagnostic(attempt);
      supportState.attempts = [attempt].concat(Array.isArray(supportState.attempts) ? supportState.attempts : []).slice(0, 10);
      supportState.feedbackAvailable = currentRole !== "student" || saved.feedbackAvailable === true;
      renderSupportState(supportState);
      setResult(
        "<strong>Practice checked and saved successfully.</strong> This result is not recorded in Grades." +
        '<div class="result-grid"><div class="result-item"><strong>' + Number(attempt.listeningPoints || 0).toFixed(1) + " / 25</strong>Listening score</div>" +
        '<div class="result-item"><strong>' + Number(attempt.writingSignalCount || 0) + " / 5</strong>Writing signals detected</div>" +
        '<div class="result-item"><strong>' + Number(attempt.wordCount || 0) + "</strong>Words submitted</div></div>" +
        "<p>" + escapeHtml(reviewLine) + "</p><p>Your diagnostic and attempt history are ready below. Correct answers remain protected until your teacher releases the feedback.</p>",
        "success"
      );
      toast("Practice checked and saved. No grade was recorded.", "success");
    } catch (_error) {
      els.form.querySelectorAll("input, textarea").forEach(function (node) { node.disabled = false; });
      els.submit.disabled = false;
      setResult(
        "<strong>Your practice could not be checked or saved.</strong><p>The answer key is protected on the server, so no score is calculated in the browser. Your answers remain selected; check the connection and press <strong>Check practice</strong> again.</p>",
        "error"
      );
      toast("The practice was not checked. Your answers are still available for another attempt.", "error");
    }
  }

  function setupStudent(identity, role) {
    student = identity;
    currentRole = role || "student";
    fillIdentity(identity, role);
    renderQuestions();
    showExam();
    setupAudio();
    restoreDraft();
    loadSupportState();
  }

  async function verifyAccess() {
    if (verifying) return;
    var localPreview = /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname) && new URLSearchParams(window.location.search).get("preview") === "1";
    if (localPreview) {
      if (!authorized) {
        user = { name: "Local QA Student", email: "qa@localhost", credential: "local-preview", provider: "local" };
        lastCredential = user.credential;
        setupStudent({ fullName: "Local QA Student", id: "QA-001" }, "student");
      }
      return;
    }
    var nextUser = currentUser();
    if (!nextUser) {
      user = null;
      student = null;
      lastCredential = "";
      lock("Use the Google, Microsoft, or course account registered in Intermediate English Course 1.");
      return;
    }
    if (nextUser.credential === lastCredential && authorized) return;
    user = nextUser;
    verifying = true;
    lock("Verifying your Intermediate English student record...");
    try {
      var response = await fetch(API, { headers: authHeaders() });
      var payload = {};
      try { payload = await response.json(); } catch (_error) {}
      if (!response.ok) throw new Error("verification_failed");
      var role = payload.role || "student";
      if (!payload.student && ["teacher", "admin"].indexOf(role) === -1) throw new Error("not_registered");
      lastCredential = nextUser.credential;
      setupStudent(payload.student || { fullName: user.name || user.email, id: "" }, role);
    } catch (error) {
      lastCredential = "";
      lock(error.message === "not_registered"
        ? "This signed-in account is not linked to an Intermediate English student record. Ask the teacher to verify your registered email."
        : "We could not verify your course connection. Check the internet connection and try again.");
    } finally {
      verifying = false;
    }
  }

  els.writing.addEventListener("input", updateWordCount);
  els.form.addEventListener("submit", function (event) {
    event.preventDefault();
    var answers = validate();
    if (answers) checkPractice(answers);
  });
  document.querySelectorAll("[data-open-login]").forEach(function (button) { button.addEventListener("click", openLogin); });
  document.querySelectorAll("[data-print]").forEach(function (button) { button.addEventListener("click", function () { window.print(); }); });
  document.querySelectorAll("[data-feedback-state]").forEach(function (button) {
    button.addEventListener("click", function () { setFeedbackState(button.getAttribute("data-feedback-state") === "open"); });
  });
  els.feedbackButton.addEventListener("click", loadReleasedFeedback);
  document.querySelectorAll("[data-reset-practice]").forEach(function (button) {
    button.addEventListener("click", function () {
      if (!window.confirm("Reset every listening answer and the writing response?")) return;
      sessionStorage.removeItem(draftKey());
      sessionStorage.removeItem(playKey());
      window.location.reload();
    });
  });

  verifyAccess();
  window.setInterval(verifyAccess, 1000);
  window.setInterval(function () {
    if (authorized) loadSupportState();
  }, 15000);
})();
