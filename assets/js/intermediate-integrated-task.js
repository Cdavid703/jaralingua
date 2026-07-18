(function () {
  "use strict";

  var API = {
    state: "/api/intermediate/integrated-task/state",
    exam: "/api/intermediate/integrated-task",
    audio: "/api/intermediate/integrated-task/audio",
    submit: "/api/intermediate/integrated-task/submit",
    submissions: "/api/intermediate/integrated-task/submissions",
    grade: "/api/intermediate/integrated-task/submissions/grade"
  };
  var USER_KEYS = [
    { key: "jaralingua_google_user", provider: "google" },
    { key: "jaralingua_microsoft_user", provider: "microsoft" },
    { key: "jaralingua_local_user", provider: "local" }
  ];
  var CLAIM_KEY_PREFIX = "jaralingua_intermediate_integrated_student_claim_";
  var els = {
    access: document.getElementById("accessPanel"),
    accessStatus: document.getElementById("accessStatus"),
    admin: document.getElementById("adminPanel"),
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
    review: document.getElementById("reviewPanel"),
    reviewGrid: document.getElementById("reviewGrid"),
    reviewFeedback: document.getElementById("reviewActionFeedback")
  };
  var user = null;
  var student = null;
  var role = "student";
  var state = null;
  var config = null;
  var submission = null;
  var canRetake = false;
  var retakeInProgress = false;
  var verifying = false;
  var submitting = false;
  var audioObjectUrl = "";
  var audioWired = false;
  var activeListen = false;
  var furthestAudioTime = 0;
  var currentSpeed = 1;
  var lastCredential = "";
  var adminFeedback = "";
  var adminFeedbackType = "";

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function readStored(entry) {
    try {
      var saved = JSON.parse(sessionStorage.getItem(entry.key) || "null");
      if (!saved || !saved.credential) return null;
      if (saved.exp && Date.now() / 1000 > saved.exp) {
        sessionStorage.removeItem(entry.key);
        return null;
      }
      return Object.assign({ provider: entry.provider }, saved);
    } catch (_error) {
      return null;
    }
  }

  function readUser() {
    for (var index = 0; index < USER_KEYS.length; index += 1) {
      var found = readStored(USER_KEYS[index]);
      if (found) return found;
    }
    return null;
  }

  function headers() {
    if (!user || !user.credential) return {};
    var result = {
      "Authorization": "Bearer " + user.credential,
      "X-Jaralingua-Auth-Provider": user.provider || "google",
      "Content-Type": "application/json"
    };
    var claim = savedClaim();
    if (claim) result["X-Jaralingua-Student-Id-Claim"] = claim;
    return result;
  }

  async function request(url, options) {
    options = options || {};
    var controller = new AbortController();
    var timer = window.setTimeout(function () { controller.abort(); }, options.timeout || 18000);
    try {
      var response = await fetch(url, Object.assign({}, options, {
        signal: controller.signal,
        headers: Object.assign({}, headers(), options.headers || {})
      }));
      var data = {};
      try { data = await response.json(); } catch (_error) {}
      return { ok: response.ok, status: response.status, data: data };
    } finally {
      window.clearTimeout(timer);
    }
  }

  function openLogin() {
    var trigger = document.querySelector("[data-auth-toggle], [data-auth-nav-toggle]");
    if (trigger) {
      trigger.click();
      toast("Sign-in panel opened. Choose your registered account.", "success");
    } else {
      toast("The sign-in panel is not available. Reload the page and try again.", "error");
    }
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
    els.exam.hidden = true;
    els.access.hidden = false;
    els.accessStatus.textContent = message;
    if (els.audio && !els.audio.paused) els.audio.pause();
  }

  function showExam() {
    els.exam.hidden = false;
    els.access.hidden = true;
  }

  function setStatus(message, type) {
    els.result.className = "status-box show " + (type || "pending");
    els.result.innerHTML = message;
  }

  function setInlineFeedback(element, message, type) {
    if (!element) return;
    element.className = "inline-action-feedback " + (type || "");
    element.textContent = message;
  }

  function today() {
    return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota" }).format(new Date());
  }

  function userToken() {
    return String((user && user.email) || "anonymous").toLowerCase().replace(/[^a-z0-9@._-]/g, "_");
  }

  function claimKey() {
    return CLAIM_KEY_PREFIX + userToken();
  }

  function savedClaim() {
    return String(sessionStorage.getItem(claimKey()) || "").replace(/\D+/g, "");
  }

  function clearClaim() {
    sessionStorage.removeItem(claimKey());
  }

  function promptStudentIdClaim() {
    var account = user && user.email ? "\nSigned in as: " + user.email : "";
    var claim = String(window.prompt(
      "We could not match this account to the Intermediate English gradebook." + account +
      "\n\nEnter your student ID/document number to link this exam to your registered record.",
      ""
    ) || "").replace(/\D+/g, "");
    if (claim) sessionStorage.setItem(claimKey(), claim);
    return claim;
  }

  function versionToken() {
    return String((config && (config.version || config.id)) || "real").replace(/[^a-z0-9_-]/gi, "_");
  }

  function draftKey() {
    return "intermediate_integrated_task_draft_" + userToken() + "_" + versionToken();
  }

  function playKey() {
    return "intermediate_integrated_task_plays_" + userToken() + "_" + versionToken();
  }

  function clientSubmissionKey() {
    return "intermediate_integrated_task_submission_id_" + userToken() + "_" + versionToken();
  }

  function currentClientSubmissionId() {
    var key = clientSubmissionKey();
    var saved = sessionStorage.getItem(key);
    if (saved) return saved;
    var generated = window.crypto && typeof window.crypto.randomUUID === "function"
      ? window.crypto.randomUUID()
      : "IITC-" + Date.now() + "-" + Math.random().toString(16).slice(2);
    sessionStorage.setItem(key, generated);
    return generated;
  }

  function wordCount() {
    return (els.writing.value.trim().match(/\b[\w'-]+\b/g) || []).length;
  }

  function updateWords() {
    els.words.textContent = wordCount() + " words";
    saveDraft();
  }

  function collectAnswers() {
    var answers = {};
    (config && config.questions || []).forEach(function (question) {
      var checked = els.form.querySelector('input[name="q_' + CSS.escape(question.id) + '"]:checked');
      if (checked) answers[question.id] = Number(checked.value);
    });
    return answers;
  }

  function saveDraft() {
    if (!user || !config || submission) return;
    sessionStorage.setItem(draftKey(), JSON.stringify({
      courseCode: document.getElementById("courseCode").value,
      writing: els.writing.value,
      answers: collectAnswers(),
      updatedAt: new Date().toISOString()
    }));
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

  function fillIdentity(identity) {
    identity = identity || {};
    document.getElementById("studentName").value = identity.fullName || identity.name || (user && user.name) || "";
    document.getElementById("studentId").value = identity.id || (role === "student" ? "" : "STAFF PREVIEW");
    document.getElementById("examDate").value = today();
  }

  function renderQuestions() {
    els.questions.innerHTML = (config.questions || []).map(function (question, questionIndex) {
      var options = question.options.map(function (option, optionIndex) {
        return '<label class="option"><input type="radio" name="q_' + esc(question.id) + '" value="' + optionIndex + '" required><span>' + String.fromCharCode(97 + optionIndex) + ") " + esc(option) + "</span></label>";
      }).join("");
      return '<fieldset class="question-card"><legend>' + (questionIndex + 1) + ". " + esc(question.prompt) + "</legend>" + options + "</fieldset>";
    }).join("");
    els.form.querySelectorAll('input[type="radio"]').forEach(function (input) {
      input.addEventListener("change", saveDraft);
    });
  }

  function readPlayCount() {
    return Number(sessionStorage.getItem(playKey()) || 0);
  }

  function setAudioSpeed(value, announce) {
    var next = Number(value);
    if ([0.75, 1, 1.25].indexOf(next) === -1) return;
    currentSpeed = next;
    els.audio.playbackRate = next;
    document.querySelectorAll("[data-audio-speed]").forEach(function (button) {
      var active = Number(button.dataset.audioSpeed) === next;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });
    if (announce) {
      var label = next + "x";
      setInlineFeedback(els.audioFeedback, "Audio speed changed successfully to " + label + ".", "success");
      toast("Audio speed set to " + label + ".", "success");
    }
  }

  function wireAudio() {
    if (audioWired) return;
    audioWired = true;
    document.querySelectorAll("[data-audio-speed]").forEach(function (button) {
      button.addEventListener("click", function () { setAudioSpeed(button.dataset.audioSpeed, true); });
    });
    els.audio.addEventListener("contextmenu", function (event) { event.preventDefault(); });
    els.audio.addEventListener("ratechange", function () {
      if ([0.75, 1, 1.25].indexOf(Number(els.audio.playbackRate)) === -1) els.audio.playbackRate = currentSpeed;
      else currentSpeed = Number(els.audio.playbackRate);
      setAudioSpeed(currentSpeed, false);
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
        sessionStorage.setItem(playKey(), String(count + 1));
        activeListen = true;
        furthestAudioTime = 0;
        setInlineFeedback(els.audioFeedback, "Listening started at " + currentSpeed + "x. Replay is available without a limit.", "success");
        toast("Listening started. Replay is unlimited.", "success");
      }
    });
    els.audio.addEventListener("ended", function () {
      activeListen = false;
      furthestAudioTime = 0;
      els.audio.currentTime = 0;
      setInlineFeedback(els.audioFeedback, "Listening completed. You may replay the audio as needed.", "success");
      toast("Listening completed. You may listen again.", "success");
    });
  }

  async function loadProtectedAudio() {
    var response = await fetch(API.audio, { headers: headers() });
    if (!response.ok) throw new Error("audio_unavailable");
    var blob = await response.blob();
    if (audioObjectUrl) URL.revokeObjectURL(audioObjectUrl);
    audioObjectUrl = URL.createObjectURL(blob);
    els.audio.src = audioObjectUrl;
    els.audio.playbackRate = currentSpeed;
  }

  function validate() {
    var answers = collectAnswers();
    if (Object.keys(answers).length !== (config.questions || []).length) {
      setStatus("Answer all ten listening questions before submitting the exam.", "error");
      return null;
    }
    var count = wordCount();
    if (count < 100 || count > 140) {
      setStatus("Your food review must contain 100 to 140 words. It currently has " + count + ".", "error");
      els.writing.focus();
      return null;
    }
    return answers;
  }

  async function recoverSubmission(clientSubmissionId) {
    try {
      var result = await request(API.state, { timeout: 12000 });
      if (result.ok && result.data && result.data.submitted && result.data.submitted.clientSubmissionId === clientSubmissionId) return result.data.submitted;
    } catch (_error) {}
    return null;
  }

  async function submitExam(answers) {
    if (submitting) return;
    if (!window.confirm("Submit this graded Integrated Task attempt now? You can start another attempt later while the teacher keeps the exam open.")) {
      setStatus("Submission canceled. Your answers remain saved on this page and nothing was sent to the teacher.", "pending");
      toast("Submission canceled. Nothing was sent.", "");
      return;
    }
    submitting = true;
    els.submit.disabled = true;
    els.submit.innerHTML = '<i class="bi bi-hourglass-split"></i> Submitting...';
    var clientSubmissionId = currentClientSubmissionId();
    var payload = {
      answers: answers,
      writing: els.writing.value,
      courseCode: document.getElementById("courseCode").value,
      audioPlays: readPlayCount(),
      clientDate: today(),
      clientSubmissionId: clientSubmissionId
    };
    try {
      var result = await request(API.submit, { method: "POST", body: JSON.stringify(payload), timeout: 25000 });
      if (!result.ok) {
        throw new Error(result.data && result.data.error || "submit_failed");
      }
      sessionStorage.removeItem(draftKey());
      renderSubmitted(result.data.result);
      toast("Your graded exam was sent successfully.", "success");
    } catch (_error) {
      var recovered = await recoverSubmission(clientSubmissionId);
      if (recovered) {
        renderSubmitted(recovered);
        toast("Your exam was already received. Showing the receipt.", "success");
      } else {
        setStatus("<strong>NOT SUBMITTED.</strong> Your answers remain on this page. Check the connection and press <em>Submit graded exam</em> again.", "error");
        toast("The exam was not sent. Your answers were preserved.", "error");
      }
    } finally {
      submitting = false;
      if (!submission) {
        els.submit.disabled = false;
        els.submit.innerHTML = '<i class="bi bi-send-check-fill"></i> Submit graded exam';
      }
    }
  }

  function submittedFeedback(result) {
    var rubric = result.rubric || {};
    var keys = ["content", "composing", "vocabulary", "structure", "mechanics"];
    var rubricHtml = keys.some(function (key) { return rubric[key]; })
      ? '<div class="submitted-rubric">' + keys.map(function (key) { return '<span><strong>' + esc(key[0].toUpperCase() + key.slice(1)) + ":</strong> " + esc(rubric[key] || "-") + "/5</span>"; }).join("") + "</div>"
      : "";
    var comments = String(result.teacherComments || "").trim();
    var commentHtml = '<div class="submitted-comments"><strong>Teacher feedback</strong><p>' + (comments ? esc(comments).replace(/\n/g, "<br>") : "Your teacher has not added written comments yet.") + "</p></div>";
    return rubricHtml + commentHtml;
  }

  function renderSubmitted(result) {
    submission = result;
    retakeInProgress = false;
    showExam();
    fillIdentity({ fullName: result.studentName, id: result.studentId });
    els.writing.value = result.writing || "";
    els.words.textContent = wordCount() + " words";
    els.form.querySelectorAll("input, textarea, select").forEach(function (node) { node.disabled = true; });
    els.form.querySelectorAll("[data-audio-speed]").forEach(function (node) { node.disabled = true; });
    var pending = result.status !== "graded";
    var receipt = '<div class="submitted-receipt"><strong>Submission receipt</strong><span>Attempt: ' + esc(result.attemptNumber || 1) + "</span><span>Receipt: " + esc(result.receiptId || "-") + "</span><span>Student: " + esc(result.studentName || "") + "</span><span>Submitted: " + esc(result.submittedAt || "") + "</span><span>Listening: " + esc(result.listeningPoints) + "/25</span><span>Status: " + (pending ? "Pending teacher review" : "Graded") + "</span></div>";
    var retakeButton = role === "student" ? '<div class="btn-row"><button class="btn-soft" type="button" data-new-attempt><i class="bi bi-arrow-repeat"></i> Start another attempt</button></div>' : "";
    setStatus(receipt + "<p><strong>Exam submitted successfully.</strong> " + (pending ? "Your writing is waiting for teacher review." : "Final grade: " + esc(result.grade) + "/5.0.") + "</p>" + submittedFeedback(result) + retakeButton, pending ? "pending" : "success");
    els.receipt.textContent = "SUBMITTED - RECEIPT " + (result.receiptId || "-") + " - " + (result.submittedAt || "");
    els.submit.hidden = true;
    var retakeButtonElement = els.result.querySelector("[data-new-attempt]");
    if (retakeButtonElement) retakeButtonElement.addEventListener("click", function () { startAnotherAttempt(retakeButtonElement); });
  }

  async function startAnotherAttempt(button) {
    if (!canRetake) {
      toast("Another attempt is available when the teacher activates the exam.", "error");
      return;
    }
    if (!window.confirm("Start a new attempt? Your previous submission stays in the teacher history, and the new attempt becomes the active result in Grades.")) return;
    var previousSubmission = submission;
    var previousDraftKey = draftKey();
    var previousPlayKey = playKey();
    var previousClientSubmissionKey = clientSubmissionKey();
    button.disabled = true;
    button.innerHTML = '<i class="bi bi-hourglass-split"></i> Preparing attempt...';
    if (els.audio && !els.audio.paused) els.audio.pause();
    if (audioObjectUrl) URL.revokeObjectURL(audioObjectUrl);
    audioObjectUrl = "";
    els.audio.removeAttribute("src");
    try { els.audio.load(); } catch (_error) {}
    sessionStorage.removeItem(previousDraftKey);
    sessionStorage.removeItem(previousPlayKey);
    sessionStorage.removeItem(previousClientSubmissionKey);
    submission = null;
    config = null;
    retakeInProgress = true;
    activeListen = false;
    furthestAudioTime = 0;
    els.form.reset();
    els.form.querySelectorAll("input, textarea, select, button").forEach(function (node) { node.disabled = false; });
    document.getElementById("courseCode").value = "INTERMEDIATE-C1";
    els.questions.innerHTML = "";
    els.writing.value = "";
    els.words.textContent = "0 words";
    els.submit.hidden = false;
    els.submit.disabled = false;
    els.submit.innerHTML = '<i class="bi bi-send-check-fill"></i> Submit graded exam';
    setStatus("Preparing your new attempt...", "pending");
    var loaded = await loadExam(true);
    if (loaded) {
      toast("New attempt ready. Your previous receipt remains in the teacher history.", "success");
    } else {
      retakeInProgress = false;
      renderSubmitted(previousSubmission);
      toast("The new attempt could not be opened. Your previous submission was preserved.", "error");
    }
  }

  function resetExamRuntime() {
    if (els.audio && !els.audio.paused) els.audio.pause();
    if (audioObjectUrl) URL.revokeObjectURL(audioObjectUrl);
    audioObjectUrl = "";
    if (els.audio) {
      els.audio.removeAttribute("src");
      try { els.audio.load(); } catch (_error) {}
    }
    activeListen = false;
    furthestAudioTime = 0;
    currentSpeed = 1;
    config = null;
    submission = null;
    canRetake = false;
    retakeInProgress = false;
    student = null;
    state = null;
    role = "student";
    els.form.reset();
    els.form.querySelectorAll("input, textarea, select, button").forEach(function (node) { node.disabled = false; });
    document.getElementById("courseCode").value = "INTERMEDIATE-C1";
    els.questions.innerHTML = "";
    els.writing.value = "";
    els.words.textContent = "0 words";
    els.result.className = "status-box";
    els.result.innerHTML = "";
    els.receipt.textContent = "NOT SUBMITTED - DIGITAL RECEIPT REQUIRED";
    els.submit.hidden = false;
    els.submit.disabled = false;
    els.submit.innerHTML = '<i class="bi bi-send-check-fill"></i> Submit graded exam';
    els.audioFeedback.className = "inline-action-feedback";
    els.audioFeedback.textContent = "Audio speed is set to 1x. Replay is available without a limit.";
    setAudioSpeed(1, false);
    els.exam.hidden = true;
    els.admin.hidden = true;
    els.admin.innerHTML = "";
    els.review.hidden = true;
    els.reviewGrid.innerHTML = "";
  }

  function setupExam(identity) {
    fillIdentity(identity || {});
    renderQuestions();
    restoreDraft();
    wireAudio();
    showExam();
    if (["admin", "teacher"].indexOf(role) !== -1) {
      els.submit.disabled = true;
      els.submit.innerHTML = '<i class="bi bi-eye-fill"></i> Staff preview only';
    }
    loadProtectedAudio().catch(function () {
      setStatus("The protected audio could not be loaded. Do not submit; ask the teacher for help.", "error");
    });
  }

  function renderAdmin() {
    if (["admin", "teacher"].indexOf(role) === -1) {
      els.admin.hidden = true;
      return;
    }
    var open = state && state.isOpen === true;
    els.admin.hidden = false;
    els.admin.innerHTML = '<div class="admin-state"><div><p class="section-kicker">Teacher control</p><h2 class="section-title">Integrated Task availability</h2><span class="state-badge ' + (open ? "open" : "closed") + '"><i class="bi ' + (open ? "bi-unlock-fill" : "bi-lock-fill") + '"></i> ' + (open ? "OPEN" : "CLOSED") + '</span><p class="section-copy">' + (open ? "Registered students can access the questions and protected audio." : "Students cannot access the questions or protected audio.") + '</p><small>Last update: ' + esc(state && state.updatedAt || "Not activated yet") + (state && state.openedBy ? " by " + esc(state.openedBy) : "") + '</small></div><div class="btn-row"><button class="btn-main" type="button" data-exam-state="open" ' + (open ? "disabled" : "") + '><i class="bi bi-unlock-fill"></i> Activate exam</button><button class="btn-danger" type="button" data-exam-state="closed" ' + (!open ? "disabled" : "") + '><i class="bi bi-lock-fill"></i> Close exam</button><button class="btn-soft" type="button" data-refresh-reviews><i class="bi bi-arrow-clockwise"></i> Refresh submissions</button></div></div><div class="activation-feedback ' + esc(adminFeedbackType) + '" id="activationFeedback" role="status" aria-live="polite" aria-atomic="true">' + esc(adminFeedback) + '</div>';
    els.admin.querySelectorAll("[data-exam-state]").forEach(function (button) {
      button.addEventListener("click", function () { changeState(button.dataset.examState === "open", button); });
    });
    els.admin.querySelector("[data-refresh-reviews]").addEventListener("click", function (event) { refreshReviews(event.currentTarget); });
  }

  async function changeState(open, button) {
    var feedback = document.getElementById("activationFeedback");
    var original = button.innerHTML;
    button.disabled = true;
    button.innerHTML = '<i class="bi bi-hourglass-split"></i> Updating...';
    feedback.textContent = "Saving the exam state...";
    feedback.className = "activation-feedback";
    try {
      var result = await request(API.state, { method: "PUT", body: JSON.stringify({ isOpen: open }) });
      if (!result.ok) throw new Error("state_failed");
      state = result.data.state;
      adminFeedback = open ? "Exam activated successfully. Students can enter now." : "Exam closed successfully. Student access and protected audio are locked.";
      adminFeedbackType = "success";
      renderAdmin();
      var message = adminFeedback;
      toast(message, "success");
    } catch (_error) {
      adminFeedback = "The exam state could not be changed. No change was applied. Please try again.";
      adminFeedbackType = "error";
      feedback.textContent = adminFeedback;
      feedback.className = "activation-feedback error";
      button.disabled = false;
      button.innerHTML = original;
      toast("The activation change failed.", "error");
    }
  }

  function rubricSelect(key, label, value) {
    var options = '<option value="">Select</option>';
    for (var score = 1; score <= 5; score += 1) options += '<option value="' + score + '" ' + (Number(value) === score ? "selected" : "") + ">" + score + "/5</option>";
    return '<div class="field"><label>' + esc(label) + '</label><select data-rubric="' + esc(key) + '">' + options + "</select></div>";
  }

  function renderReviews(items, payload) {
    var counts = payload && payload.health && payload.health.counts || {};
    els.review.hidden = false;
    var summary = '<div class="review-stats"><span class="stat-pill"><strong>' + esc(counts.total || 0) + '</strong> students</span><span class="stat-pill pending"><strong>' + esc(counts.pendingWriting || 0) + '</strong> pending writing</span><span class="stat-pill graded"><strong>' + esc(counts.graded || 0) + '</strong> graded</span><span class="stat-pill"><strong>' + esc(counts.notSubmitted || 0) + "</strong> not submitted</span></div>";
    var roster = renderReviewRoster(payload && payload.health && payload.health.students);
    if (!items.length) {
      els.reviewGrid.innerHTML = summary + roster + '<p class="section-copy">There are no submitted exams yet.</p>';
      return;
    }
    var cards = items.map(function (item) {
      var rubric = item.rubric || {};
      var criteria = [
        rubricSelect("content", "Content", rubric.content),
        rubricSelect("composing", "Organization", rubric.composing),
        rubricSelect("vocabulary", "Vocabulary", rubric.vocabulary),
        rubricSelect("structure", "Grammar", rubric.structure),
        rubricSelect("mechanics", "Mechanics", rubric.mechanics)
      ].join("");
      return '<article class="review-card" data-review="' + esc(item.studentId) + '" data-receipt="' + esc(item.receiptId || "") + '"><h3>' + esc(item.studentName) + '</h3><div class="review-meta"><span>ID: ' + esc(item.studentId) + "</span><span>Attempt: " + esc(item.attemptNumber || 1) + "</span><span>Listening: " + esc(item.listeningPoints) + "/25</span><span>" + wordCountText(item.writing) + " words</span><span>" + esc(item.status || "pending-writing") + "</span>" + (item.status === "graded" ? '<span class="graded-chip">Final ' + esc(item.grade) + "/5.0</span>" : "") + '</div><div class="student-writing">' + esc(item.writing || "") + '</div><div class="rubric-grid">' + criteria + '</div><div class="field teacher-comments"><label>Teacher comments</label><textarea data-comments>' + esc(item.teacherComments || "") + '</textarea></div><div class="btn-row"><button class="btn-main" type="button" data-save-grade><i class="bi bi-save-fill"></i> Save rubric and final grade</button></div><div class="activation-feedback" data-grade-feedback aria-live="polite"></div></article>';
    }).join("");
    els.reviewGrid.innerHTML = summary + roster + cards;
    els.reviewGrid.querySelectorAll("[data-save-grade]").forEach(function (button) {
      button.addEventListener("click", function () { saveGrade(button.closest("[data-review]")); });
    });
  }

  function renderReviewRoster(students) {
    var rows = Array.isArray(students) ? students : [];
    if (!rows.length) return "";
    var body = rows.map(function (item) {
      var status = String(item.status || "not-submitted");
      var statusLabel = status === "graded" ? "Graded" : (status === "pending-writing" ? "Submitted - pending review" : "Not submitted");
      var statusClass = status === "graded" ? "graded" : (status === "pending-writing" ? "pending" : "");
      var grade = typeof item.grade === "number" ? Number(item.grade).toFixed(2) + " / 5.0" : (status === "pending-writing" ? "Teacher review pending" : "-");
      return '<tr><td>' + esc(item.fullName || "") + '</td><td>' + esc(item.id || "") + '</td><td>' + esc(item.email || "No primary email") + '</td><td><span class="review-status ' + statusClass + '">' + statusLabel + '</span></td><td>' + esc(grade) + '</td></tr>';
    }).join("");
    return '<div class="review-roster-wrap"><h3>Complete class submission status</h3><div class="review-table-scroll"><table class="review-roster-table"><thead><tr><th>Student</th><th>ID</th><th>Account</th><th>Status</th><th>Grade</th></tr></thead><tbody>' + body + '</tbody></table></div></div>';
  }

  function wordCountText(text) {
    return (String(text || "").trim().match(/\b[\w'-]+\b/g) || []).length;
  }

  async function loadReviews() {
    if (["admin", "teacher"].indexOf(role) === -1) return false;
    try {
      var result = await request(API.submissions);
      if (result.ok) {
        renderReviews(result.data.submissions || [], result.data);
        return true;
      }
    } catch (_error) {
      // The caller presents a persistent failure message and restores its button.
    }
    setInlineFeedback(els.reviewFeedback, "Submissions could not be loaded. Check the connection and try again.", "error");
    return false;
  }

  async function refreshReviews(button) {
    var original = button.innerHTML;
    button.disabled = true;
    button.innerHTML = '<i class="bi bi-hourglass-split"></i> Refreshing...';
    setInlineFeedback(els.reviewFeedback, "Refreshing student submissions...", "pending");
    var loaded = await loadReviews();
    if (loaded) {
      setInlineFeedback(els.reviewFeedback, "Submissions refreshed successfully.", "success");
      toast("Teacher submissions refreshed.", "success");
    } else {
      toast("Submissions could not be refreshed.", "error");
    }
    button.disabled = false;
    button.innerHTML = original;
  }

  async function saveGrade(card) {
    var rubric = {};
    card.querySelectorAll("[data-rubric]").forEach(function (select) { rubric[select.dataset.rubric] = Number(select.value); });
    var feedback = card.querySelector("[data-grade-feedback]");
    if (Object.keys(rubric).length !== 5 || Object.keys(rubric).some(function (key) { return !Number.isInteger(rubric[key]) || rubric[key] < 1 || rubric[key] > 5; })) {
      feedback.textContent = "Select a score from 1 to 5 for every criterion.";
      feedback.className = "activation-feedback error";
      return;
    }
    if (!window.confirm("Save this rubric and send the final grade to Grades?")) {
      feedback.textContent = "Grade save canceled. No grade was changed.";
      feedback.className = "activation-feedback";
      setInlineFeedback(els.reviewFeedback, "Grade save canceled. No grade was changed.", "pending");
      toast("Grade save canceled.", "");
      return;
    }
    var button = card.querySelector("[data-save-grade]");
    button.disabled = true;
    feedback.textContent = "Saving rubric and final grade...";
    try {
      var result = await request(API.grade, { method: "PUT", body: JSON.stringify({ studentId: card.dataset.review, receiptId: card.dataset.receipt, rubric: rubric, teacherComments: card.querySelector("[data-comments]").value }) });
      if (!result.ok) throw new Error(result.data && result.data.error || "grade_save_failed");
      feedback.textContent = "Saved. Final grade: " + result.data.result.grade + "/5.0. The 20% assessment is now recorded in Grades.";
      feedback.className = "activation-feedback success";
      setInlineFeedback(els.reviewFeedback, "Rubric saved successfully. The final grade is now recorded in Grades.", "success");
      toast("Final grade saved in Grades.", "success");
      await loadReviews();
    } catch (error) {
      feedback.textContent = error.message === "submission_changed" ? "This student submitted a newer attempt. Refresh submissions and grade the current response." : "The rubric could not be saved. Please try again.";
      feedback.className = "activation-feedback error";
      setInlineFeedback(els.reviewFeedback, "The rubric could not be saved. No grade was changed.", "error");
      button.disabled = false;
    }
  }

  async function loadExam(forceNewAttempt) {
    if (config || (submission && !forceNewAttempt)) return true;
    var result = await request(API.exam + (forceNewAttempt ? "?retake=1" : ""));
    if (!result.ok) {
      lock(result.data && result.data.error === "exam_closed" ? "The Integrated Task is closed. Wait until the teacher activates it." : "This account is not authorized for the Integrated Task.");
      return false;
    }
    if (result.data.status === "submitted") {
      renderSubmitted(result.data.result);
      return true;
    }
    config = result.data.exam;
    student = result.data.student;
    role = result.data.role || role;
    setupExam(student || { fullName: user.name || user.email });
    return true;
  }

  async function verifyAccess() {
    if (verifying) return;
    var nextUser = readUser();
    if (!nextUser) {
      if (user || lastCredential) resetExamRuntime();
      user = null;
      lastCredential = "";
      student = null;
      config = null;
      submission = null;
      role = "student";
      els.admin.hidden = true;
      els.review.hidden = true;
      lock("Use the Google, Microsoft, or course account registered in Intermediate English Course 1.");
      return;
    }
    if (nextUser.credential !== lastCredential) {
      resetExamRuntime();
      lastCredential = nextUser.credential;
    }
    user = nextUser;
    verifying = true;
    try {
      var result = await request(API.state, { timeout: 12000 });
      if (!result.ok) throw new Error("state_failed");
      role = result.data.role || "student";
      state = result.data.state || {};
      canRetake = result.data.canTake === true;
      student = result.data.student;
      if (!student && ["admin", "teacher"].indexOf(role) === -1 && result.data.allowStudentIdClaim === true) {
        if (savedClaim()) clearClaim();
        if (promptStudentIdClaim()) {
          result = await request(API.state, { timeout: 12000 });
          if (!result.ok) throw new Error("state_failed");
          role = result.data.role || "student";
          state = result.data.state || {};
          canRetake = result.data.canTake === true;
          student = result.data.student;
        }
      }
      if (!student && ["admin", "teacher"].indexOf(role) === -1) throw new Error("not_authorized");
      renderAdmin();
      if (result.data.submitted && !retakeInProgress) {
        if (!submission || submission.status !== result.data.submitted.status || submission.gradedAt !== result.data.submitted.gradedAt) renderSubmitted(result.data.submitted);
      } else if (retakeInProgress) {
        // Keep the explicitly opened attempt visible while account access is polled.
      } else if (["admin", "teacher"].indexOf(role) !== -1 || result.data.canTake) {
        await loadExam();
      } else {
        config = null;
        lock("The Integrated Task is closed. Wait until the teacher activates it.");
      }
      if (["admin", "teacher"].indexOf(role) !== -1 && els.review.hidden) await loadReviews();
    } catch (error) {
      config = null;
      lock(error.message === "not_authorized" ? "This account is not linked to Intermediate English Course 1. Ask the teacher to verify the registered email." : "We could not verify exam access. Check the connection and try again.");
    } finally {
      verifying = false;
    }
  }

  els.writing.addEventListener("input", updateWords);
  els.form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (["admin", "teacher"].indexOf(role) !== -1) return;
    var answers = validate();
    if (answers) submitExam(answers);
  });
  document.querySelectorAll("[data-open-login]").forEach(function (button) { button.addEventListener("click", openLogin); });
  document.querySelectorAll("[data-print]").forEach(function (button) {
    button.addEventListener("click", function () {
      toast("Print dialog opened. Your exam has not been submitted by this action.", "success");
      window.setTimeout(function () { window.print(); }, 120);
    });
  });

  verifyAccess();
  window.setInterval(verifyAccess, 4000);
})();
