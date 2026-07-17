(function () {
  "use strict";

  var config = window.INTERMEDIATE_INTEGRATED_TASK_MOCK;
  var API = "/api/intermediate/grades";
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
    counter: document.getElementById("playCounter"),
    writing: document.getElementById("writingResponse"),
    words: document.getElementById("wordCount"),
    result: document.getElementById("submitResult"),
    submit: document.getElementById("submitExamBtn"),
    receipt: document.getElementById("printReceipt")
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
    els.counter.textContent = count + " / 3 listens" + (count >= 3 ? " - final play used" : "");
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
    els.audio.addEventListener("play", function (event) {
      var count = readPlayCount();
      if (!activeListen && els.audio.currentTime < 0.8) {
        if (count >= 3) {
          event.preventDefault();
          els.audio.pause();
          toast("You have already used the three permitted listens.", "error");
          return;
        }
        count += 1;
        activeListen = true;
        furthestAudioTime = 0;
        writePlayCount(count);
      }
    });
    els.audio.addEventListener("ended", function () {
      activeListen = false;
      furthestAudioTime = 0;
      els.audio.currentTime = 0;
      if (readPlayCount() >= 3) els.audio.disabled = true;
    });
  }

  function writingSignals(text) {
    var normalized = text.toLowerCase();
    return {
      content: /(everyday|daily|special occasion|celebration|party|both)/.test(normalized) && /(from|origin|culture|traditional|region|country)/.test(normalized),
      quantities: /(some|any|much|many|a few|a little|a lot of|cup|cups|piece|pieces|slice|slices)/.test(normalized),
      sensory: /(sweet|salty|sour|spicy|bitter|savory|crispy|crisp|soft|chewy|sticky|creamy|crunchy|smooth)/.test(normalized),
      comparison: /(similar|different|than|compared|reminds me|both)/.test(normalized),
      recommendation: /(out of five|out of 5|recommend|would give|rating|should try)/.test(normalized)
    };
  }

  function setResult(html, type) {
    els.result.className = "status-box show " + (type || "pending");
    els.result.innerHTML = html;
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

  function checkPractice(answers) {
    var score = 0;
    var incorrect = [];
    config.questions.forEach(function (question, index) {
      if (answers[question.id] === question.answer) score += Number(question.points || 2.5);
      else incorrect.push(index + 1);
    });
    var signals = writingSignals(els.writing.value);
    var writingChecks = Object.keys(signals).filter(function (key) { return signals[key]; }).length;
    var reviewLine = incorrect.length
      ? "Questions to review: " + incorrect.join(", ") + ". Correct answers are not displayed; reset the full practice to try again."
      : "All listening answers were accurate.";

    els.form.querySelectorAll("input, textarea").forEach(function (node) { node.disabled = true; });
    els.submit.disabled = true;
    sessionStorage.removeItem(draftKey());
    els.receipt.textContent = "PRACTICE COPY - LISTENING " + score + " / 25 - WRITING NOT GRADED";
    setResult(
      "<strong>Practice checked successfully.</strong> This result is not recorded in Grades." +
      '<div class="result-grid"><div class="result-item"><strong>' + score.toFixed(1) + " / 25</strong>Listening score</div>" +
      '<div class="result-item"><strong>' + writingChecks + " / 5</strong>Writing signals detected</div>" +
      '<div class="result-item"><strong>' + wordCount() + "</strong>Words submitted</div></div>" +
      "<p>" + escapeHtml(reviewLine) + "</p><p>Your teacher must evaluate writing quality with the institutional rubric; this automatic check only detects whether key elements are present.</p>",
      "success"
    );
    toast("Practice checked. No grade was recorded.", "success");
  }

  function setupStudent(identity, role) {
    student = identity;
    fillIdentity(identity, role);
    renderQuestions();
    showExam();
    setupAudio();
    restoreDraft();
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
  document.querySelectorAll("[data-reset-practice]").forEach(function (button) {
    button.addEventListener("click", function () {
      if (!window.confirm("Reset every listening answer, the writing response, and the audio counter?")) return;
      sessionStorage.removeItem(draftKey());
      sessionStorage.removeItem(playKey());
      window.location.reload();
    });
  });

  verifyAccess();
  window.setInterval(verifyAccess, 1000);
})();
