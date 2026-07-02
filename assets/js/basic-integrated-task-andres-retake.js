(function () {
  const API = {
    exam: "/api/basic/integrated-task-andres-munoz-retake",
    audio: "/api/basic/integrated-task-andres-munoz-retake/audio",
    submit: "/api/basic/integrated-task-andres-munoz-retake/submit",
    submissions: "/api/basic/integrated-task-andres-munoz-retake/submissions"
  };

  const els = {
    access: document.getElementById("accessPanel"),
    accessStatus: document.getElementById("accessStatus"),
    exam: document.getElementById("examContent"),
    form: document.getElementById("retakeForm"),
    questions: document.getElementById("questionsContainer"),
    audio: document.getElementById("listeningAudio"),
    play: document.getElementById("playAudioBtn"),
    pause: document.getElementById("pauseAudioBtn"),
    restart: document.getElementById("restartAudioBtn"),
    writing: document.getElementById("writingResponse"),
    words: document.getElementById("wordCount"),
    result: document.getElementById("submitResult"),
    studentName: document.getElementById("studentName"),
    studentId: document.getElementById("studentId"),
    examDate: document.getElementById("examDate"),
    courseCode: document.getElementById("courseCode"),
    staffPanel: document.getElementById("staffPanel"),
    staffSubmissions: document.getElementById("staffSubmissions")
  };

  let user = null;
  let payload = null;
  let audioUrl = "";
  let audioPlays = 0;
  let currentSpeed = 1;
  let lastCredential = "";
  let verifying = false;

  function readStored(key, provider) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || sessionStorage.getItem(key) || "null");
      if (!value || !value.credential) return null;
      value.provider = provider;
      return value;
    } catch (error) {
      return null;
    }
  }

  function readUser() {
    return readStored("jaralingua_google_user", "google") || readStored("jaralingua_microsoft_user", "microsoft");
  }

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char];
    });
  }

  function headers() {
    return user && user.credential ? {
      "Authorization": "Bearer " + user.credential,
      "X-Jaralingua-Auth-Provider": user.provider || "google",
      "Content-Type": "application/json"
    } : {};
  }

  async function request(url, options) {
    const response = await fetch(url, Object.assign({ headers: headers(), cache: "no-store" }, options || {}));
    const data = await response.json().catch(function () { return null; });
    return { ok: response.ok, status: response.status, data: data };
  }

  function today() {
    return new Date().toLocaleDateString("en-CA");
  }

  function wordCount() {
    return (els.writing.value.trim().match(/\b[\w'-]+\b/g) || []).length;
  }

  function updateWords() {
    const count = wordCount();
    els.words.textContent = count + " words";
    els.words.classList.toggle("ok", count >= 60);
  }

  function lock(message) {
    els.exam.hidden = true;
    els.access.hidden = false;
    els.accessStatus.innerHTML = message;
  }

  function showExam() {
    els.access.hidden = true;
    els.exam.hidden = false;
  }

  function setStatus(message, type) {
    els.result.className = "status-box show " + (type || "pending");
    els.result.innerHTML = message;
  }

  function fillIdentity(student) {
    els.studentName.value = student && student.fullName ? student.fullName : (user && user.name || "");
    els.studentId.value = student && student.id ? student.id : "";
    els.examDate.value = today();
  }

  function renderQuestions() {
    const questions = payload.exam.questions || [];
    els.questions.innerHTML = questions.map(function (question, index) {
      return '<div class="question-card">' +
        '<h3>' + (index + 1) + '. ' + esc(question.prompt) + '</h3>' +
        '<div class="option-list">' +
        (question.options || []).map(function (option, optionIndex) {
          return '<label><input type="radio" name="q_' + esc(question.id) + '" value="' + optionIndex + '" required> ' + esc(option) + '</label>';
        }).join("") +
        '</div></div>';
    }).join("");
  }

  async function loadAudio() {
    const response = await fetch(API.audio, { headers: headers(), cache: "no-store" });
    if (!response.ok) throw new Error("audio_failed");
    const blob = await response.blob();
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    audioUrl = URL.createObjectURL(blob);
    els.audio.src = audioUrl;
    els.audio.playbackRate = currentSpeed;
  }

  function updateSpeedButtons() {
    document.querySelectorAll("[data-audio-speed]").forEach(function (button) {
      const isActive = Number(button.dataset.audioSpeed) === currentSpeed;
      button.classList.toggle("btn-main", isActive);
      button.classList.toggle("btn-soft", !isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  }

  function setAudioSpeed(value) {
    const nextSpeed = Number(value);
    if (!Number.isFinite(nextSpeed) || nextSpeed <= 0) return;
    currentSpeed = nextSpeed;
    els.audio.playbackRate = currentSpeed;
    updateSpeedButtons();
  }

  function collectAnswers() {
    const answers = {};
    const missing = [];
    (payload.exam.questions || []).forEach(function (question, index) {
      const checked = els.form.querySelector('input[name="q_' + CSS.escape(question.id) + '"]:checked');
      if (!checked) missing.push(index + 1);
      else answers[question.id] = Number(checked.value);
    });
    if (missing.length) {
      setStatus("Please answer listening question(s): " + missing.join(", ") + ".", "error");
      return null;
    }
    if (wordCount() < 60) {
      setStatus("Your written response needs at least 60 words. Current count: " + wordCount() + ".", "error");
      return null;
    }
    return answers;
  }

  function renderSubmitted(result) {
    showExam();
    fillIdentity(payload.student);
    renderQuestions();
    els.form.querySelectorAll("input, textarea, button").forEach(function (node) { node.disabled = true; });
    if (result && result.writing) els.writing.value = result.writing;
    updateWords();
    setStatus("Submitted. Listening score: <strong>" + esc(result && result.listeningPoints) + " / 25</strong>. The written response is waiting for teacher review.", "pending");
  }

  async function submitExam(event) {
    event.preventDefault();
    const answers = collectAnswers();
    if (!answers) return;
    const submitButton = document.getElementById("submitExamBtn");
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="bi bi-hourglass-split"></i> Submitting...';
    const result = await request(API.submit, {
      method: "POST",
      body: JSON.stringify({
        answers: answers,
        writing: els.writing.value,
        courseCode: els.courseCode.value || "BASIC-C1",
        audioPlays: audioPlays,
        clientDate: today()
      })
    });
    if (result.ok) {
      payload.submitted = result.data.result;
      renderSubmitted(result.data.result);
      return;
    }
    if (result.data && result.data.error === "already_submitted" && result.data.result) {
      renderSubmitted(result.data.result);
      return;
    }
    setStatus(result.data && result.data.error === "writing_too_short" ? "Your written response is too short." : "The exam could not be submitted. Please keep this page open and tell the teacher.", "error");
    submitButton.disabled = false;
    submitButton.innerHTML = '<i class="bi bi-send-check-fill"></i> Submit special retake to the system';
  }

  async function loadStaffSubmissions() {
    if (!payload || ["admin", "teacher"].indexOf(payload.role) === -1) return;
    els.staffPanel.hidden = false;
    const result = await request(API.submissions);
    if (!result.ok) return;
    const items = result.data.submissions || [];
    els.staffSubmissions.innerHTML = items.length ? items.map(function (item) {
      return '<article class="review-card"><h3>' + esc(item.studentName) + '</h3>' +
        '<div class="review-meta"><span>ID: ' + esc(item.studentId) + '</span><span>Listening: ' + esc(item.listeningPoints) + '/25</span><span>' + esc(item.status) + '</span><span>' + esc(item.submittedAt || "") + '</span></div>' +
        '<div class="student-writing">' + esc(item.writing || "") + '</div></article>';
    }).join("") : '<p class="section-copy">No special retake submission yet.</p>';
  }

  async function verify() {
    if (verifying) return;
    const next = readUser();
    if (!next) {
      user = null;
      lastCredential = "";
      lock('Sign in with the Google or Microsoft account authorized for this special retake. <button class="btn-main inline-login" type="button" data-open-login><i class="bi bi-box-arrow-in-right"></i> Sign in</button>');
      return;
    }
    if (next.credential === lastCredential && payload) return;
    verifying = true;
    user = next;
    lastCredential = next.credential;
    lock("Verifying your account...");
    try {
      const result = await request(API.exam);
      if (!result.ok) throw new Error("not_authorized");
      payload = result.data;
      if (payload.status === "closed") {
        lock("This special retake is closed for students. " + esc(payload.availabilityLabel || ""));
        return;
      }
      showExam();
      fillIdentity(payload.student);
      renderQuestions();
      if (payload.submitted) {
        renderSubmitted(payload.submitted);
      } else if (["admin", "teacher"].indexOf(payload.role) === -1) {
        await loadAudio();
      } else {
        await loadAudio();
      }
      await loadStaffSubmissions();
    } catch (error) {
      lock("This account is not authorized for this special retake, or the server could not verify access.");
    } finally {
      verifying = false;
    }
  }

  els.writing.addEventListener("input", updateWords);
  els.form.addEventListener("submit", submitExam);
  els.play.addEventListener("click", function () { audioPlays += 1; els.audio.play(); });
  els.pause.addEventListener("click", function () { els.audio.pause(); });
  els.restart.addEventListener("click", function () { els.audio.currentTime = 0; audioPlays += 1; els.audio.play(); });
  document.querySelectorAll("[data-audio-speed]").forEach(function (button) {
    button.addEventListener("click", function () { setAudioSpeed(button.dataset.audioSpeed); });
  });
  updateSpeedButtons();
  verify();
  setInterval(verify, 1000);
})();
