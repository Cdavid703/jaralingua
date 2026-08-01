(function () {
  "use strict";

  const API = {
    state: "/api/intermediate/final-writing/state",
    start: "/api/intermediate/final-writing/start",
    draft: "/api/intermediate/final-writing/draft",
    submit: "/api/intermediate/final-writing/submit",
    submissions: "/api/intermediate/final-writing/submissions",
    grade: "/api/intermediate/final-writing/submissions/grade",
    studentAction: "/api/intermediate/final-writing/student-action"
  };

  const KEY = {
    google: "jaralingua_google_user",
    microsoft: "jaralingua_microsoft_user",
    local: "jaralingua_local_user",
    claim: "jaralingua_intermediate_student_id_claim",
    localDraft: "intermediate_final_writing_emergency_draft_v1"
  };

  const $ = (id) => document.getElementById(id);
  const els = {
    access: $("accessPanel"),
    accessStatus: $("accessStatus"),
    accessMessage: $("accessMessage"),
    account: $("accountChip"),
    accountAvatar: $("accountAvatar"),
    accountName: $("accountName"),
    accountEmail: $("accountEmail"),
    claimPanel: $("claimPanel"),
    claimInput: $("claimStudentId"),
    claimButton: $("claimButton"),
    check: $("checkAccessButton"),
    admin: $("adminPanel"),
    adminBadge: $("adminStateBadge"),
    adminFeedback: $("adminFeedback"),
    activate: $("activateWritingButton"),
    close: $("closeWritingButton"),
    preview: $("previewWritingButton"),
    refreshReview: $("refreshReviewButton"),
    review: $("reviewPanel"),
    ready: $("readinessPanel"),
    integrity: $("integrityCheck"),
    begin: $("beginButton"),
    readyName: $("readyStudentName"),
    readyId: $("readyStudentId"),
    readyDate: $("readyExamDate"),
    exam: $("examPanel"),
    form: $("writingForm"),
    studentName: $("studentName"),
    studentId: $("studentId"),
    courseCode: $("courseCode"),
    examDate: $("examDate"),
    body: $("publicationBody"),
    words: $("wordCounter"),
    wordAdvice: $("wordAdvice"),
    saveStatus: $("saveStatus"),
    submit: $("submitButton"),
    submitStatus: $("submitStatus"),
    timer: $("timerDisplay"),
    timerCard: $("timerCard"),
    backToAdmin: $("backToAdminButton"),
    submitted: $("submittedPanel"),
    submittedSummary: $("submittedSummary"),
    submittedContent: $("submittedContent")
  };

  let user = null;
  let role = "student";
  let student = null;
  let serverState = null;
  let exam = null;
  let attempt = null;
  let submission = null;
  let busy = false;
  let submitInFlight = false;
  let lastCredential = "";
  let saveTimer = null;
  let clockTimer = null;
  let loadGeneration = 0;
  let staffPreview = false;

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function readStored(key, provider) {
    try {
      const value = JSON.parse(sessionStorage.getItem(key) || "null");
      if (!value || !value.credential) return null;
      if (value.exp && Date.now() / 1000 > Number(value.exp)) {
        sessionStorage.removeItem(key);
        return null;
      }
      return Object.assign({ provider: provider }, value);
    } catch (error) {
      return null;
    }
  }

  function readUser() {
    return readStored(KEY.google, "google")
      || readStored(KEY.microsoft, "microsoft")
      || readStored(KEY.local, "local");
  }

  function accountScope(account) {
    const current = account || user;
    return String((current && current.provider || "unknown") + ":" + (current && (current.email || current.sub) || "")).toLowerCase();
  }

  function savedClaim() {
    return String(sessionStorage.getItem(KEY.claim) || "").replace(/\D+/g, "");
  }

  function authHeaders(extra) {
    const headers = Object.assign({}, extra || {});
    if (user && user.credential) {
      headers.Authorization = "Bearer " + user.credential;
      headers["X-Jaralingua-Auth-Provider"] = user.provider || "google";
    }
    const claim = savedClaim();
    if (claim) headers["X-Jaralingua-Student-Id-Claim"] = claim;
    return headers;
  }

  async function request(url, options, retries) {
    const requestOptions = options || {};
    const retryCount = Number.isInteger(retries) ? retries : 0;
    let lastError;
    for (let index = 0; index <= retryCount; index += 1) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), requestOptions.timeout || 18000);
      try {
        const response = await fetch(url, Object.assign({}, requestOptions, {
          signal: controller.signal,
          headers: authHeaders(Object.assign({ "Content-Type": "application/json" }, requestOptions.headers || {}))
        }));
        let data = {};
        try {
          data = await response.json();
        } catch (error) {
          data = {};
        }
        return { ok: response.ok, status: response.status, data: data };
      } catch (error) {
        lastError = error;
        if (index < retryCount) {
          await new Promise((resolve) => setTimeout(resolve, 700 * (index + 1)));
        }
      } finally {
        clearTimeout(timer);
      }
    }
    throw lastError || new Error("request_failed");
  }

  function toast(text, type) {
    const old = document.querySelector(".toast");
    if (old) old.remove();
    const node = document.createElement("div");
    node.className = "toast " + (type || "");
    node.textContent = text;
    node.setAttribute("role", "status");
    document.body.appendChild(node);
    setTimeout(() => node.remove(), 5600);
  }

  function setHidden(node, hidden) {
    if (node) node.hidden = Boolean(hidden);
  }

  function message(text, type) {
    if (!els.accessMessage) return;
    els.accessMessage.className = "access-message " + (type || "neutral");
    els.accessMessage.innerHTML = '<i class="bi bi-info-circle"></i><span>' + esc(text) + "</span>";
  }

  function today() {
    return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota" }).format(new Date());
  }

  function wordCount(text) {
    return (String(text || "").trim().match(/\b[\w'-]+\b/g) || []).length;
  }

  function setPanels(active) {
    ["access", "admin", "ready", "exam", "submitted"].forEach((name) => {
      setHidden(els[name], name !== active);
    });
    if (active === "access") setHidden(els.access, false);
  }

  function fillAccount(identity) {
    const name = identity && identity.fullName || user && user.name || user && user.email || "Verified account";
    const email = user && user.email || identity && identity.email || "Verified account";
    const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "ST";
    els.accountAvatar.textContent = initials;
    els.accountName.textContent = name;
    els.accountEmail.textContent = email;
    setHidden(els.account, false);
  }

  function fillIdentity(identity) {
    const source = identity || student || {};
    const name = source.fullName || source.studentName || source.name || user && user.name || "";
    const id = source.id || source.studentId || "";
    els.studentName.value = name;
    els.studentId.value = id;
    els.examDate.value = today();
    if (els.readyName) els.readyName.value = name;
    if (els.readyId) els.readyId.value = id;
    if (els.readyDate) els.readyDate.value = today();
    if (!els.courseCode.value) els.courseCode.value = "INTERMEDIATE-C1";
    fillAccount(source);
  }

  function collectDraft() {
    return {
      attemptId: attempt && attempt.attemptId || "",
      courseCode: els.courseCode.value || "INTERMEDIATE-C1",
      body: els.body.value,
      updatedAt: new Date().toISOString()
    };
  }

  function localDraftKey() {
    return KEY.localDraft + "_" + accountScope();
  }

  function saveLocalDraft() {
    if (staffPreview) return;
    try {
      localStorage.setItem(localDraftKey(), JSON.stringify(collectDraft()));
    } catch (error) {
      // The server copy remains the primary recovery path.
    }
  }

  function restoreLocalDraft() {
    try {
      const draft = JSON.parse(localStorage.getItem(localDraftKey()) || "null");
      if (!draft || !draft.body || els.body.value.trim()) return false;
      els.body.value = draft.body;
      if (draft.courseCode) els.courseCode.value = draft.courseCode;
      toast("Your emergency browser copy was restored.", "success");
      return true;
    } catch (error) {
      return false;
    }
  }

  function applyDraft(draft) {
    const source = draft || {};
    els.courseCode.value = source.courseCode || "INTERMEDIATE-C1";
    els.body.value = source.body || "";
    updateWordCounter();
  }

  function updateWordCounter() {
    const count = wordCount(els.body.value);
    const target = exam && exam.targetWords || 170;
    els.words.textContent = String(count);
    if (count === 0) {
      els.wordAdvice.textContent = "Target: around " + target + " words. This is guidance and never blocks delivery.";
    } else if (count < 130) {
      els.wordAdvice.textContent = "Your publication is shorter than the target. You may still send it to the teacher.";
    } else if (count > 220) {
      els.wordAdvice.textContent = "Your publication is longer than the target. You may still send it to the teacher.";
    } else {
      els.wordAdvice.textContent = "You are close to the expected length. Review your organization before sending.";
    }
    const card = els.words.closest(".tool-card");
    card.classList.toggle("warning", count > 0 && (count < 130 || count > 220));
    card.classList.toggle("good", count >= 130 && count <= 220);
    if (!staffPreview) {
      els.submit.disabled = submitInFlight;
      saveLocalDraft();
      queueSave();
    }
  }

  function setSaveStatus(text, type) {
    els.saveStatus.textContent = text;
    const card = els.saveStatus.closest(".tool-card");
    card.classList.toggle("warning", type === "warning");
    card.classList.toggle("good", type === "good");
  }

  function queueSave() {
    if (!attempt || submission || staffPreview) return;
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(saveDraft, 1100);
  }

  async function saveDraft() {
    if (!attempt || submission || staffPreview) return false;
    setSaveStatus("Saving...", "warning");
    try {
      const result = await request(API.draft, {
        method: "PUT",
        body: JSON.stringify(collectDraft()),
        timeout: 12000
      }, 1);
      if (!result.ok) throw new Error(result.data && result.data.error || "save_failed");
      attempt = result.data.attempt || attempt;
      setSaveStatus("Saved " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), "good");
      return true;
    } catch (error) {
      setSaveStatus("Local copy saved. Server retry needed.", "warning");
      return false;
    }
  }

  function startClock() {
    if (clockTimer) clearInterval(clockTimer);
    const tick = () => {
      if (staffPreview) {
        els.timer.textContent = "Preview";
        return;
      }
      if (!attempt || !attempt.expiresAt) {
        els.timer.textContent = "50:00";
        return;
      }
      const seconds = Math.max(0, Math.floor((Date.parse(attempt.expiresAt) - Date.now()) / 1000));
      const minutesPart = Math.floor(seconds / 60);
      const secondsPart = seconds % 60;
      els.timer.textContent = String(minutesPart).padStart(2, "0") + ":" + String(secondsPart).padStart(2, "0");
      els.timerCard.classList.toggle("warning", seconds <= 300);
      if (seconds <= 0 && !submitInFlight) {
        els.submitStatus.textContent = "Time is over, but Send to Teacher remains available and your saved publication is preserved.";
      }
    };
    tick();
    clockTimer = setInterval(tick, 1000);
  }

  function renderAdminState() {
    if (!["admin", "teacher"].includes(role)) {
      setHidden(els.admin, true);
      return;
    }
    setHidden(els.admin, false);
    const open = serverState && serverState.isOpen === true;
    els.adminBadge.className = "state-badge " + (open ? "open" : "locked");
    els.adminBadge.innerHTML = '<i class="bi ' + (open ? "bi-unlock-fill" : "bi-lock-fill") + '"></i> ' + (open ? "Open" : "Locked");
    els.activate.disabled = open;
    els.close.disabled = !open;
    els.adminFeedback.textContent = open
      ? "The Final Writing Task is active for students."
      : "The Final Writing Task is closed for new student attempts.";
  }

  async function setExamState(open) {
    const button = open ? els.activate : els.close;
    button.disabled = true;
    els.adminFeedback.textContent = "Updating exam availability...";
    try {
      const result = await request(API.state, {
        method: "PUT",
        body: JSON.stringify({ isOpen: open })
      }, 1);
      if (!result.ok) throw new Error("state_failed");
      serverState = result.data.state || serverState;
      renderAdminState();
      const confirmation = open
        ? "The Final Writing Task was activated successfully."
        : "The Final Writing Task was closed for new attempts. Existing attempts can still be submitted.";
      els.adminFeedback.textContent = confirmation;
      toast(confirmation, "success");
      await loadReviews();
    } catch (error) {
      els.adminFeedback.textContent = "The exam state could not be changed. Try again.";
      toast("Activation change failed.", "error");
    } finally {
      renderAdminState();
    }
  }

  function rubricSelect(key, value, criterion) {
    const fallbackLabels = {
      content: "Content",
      composing: "Composing / Organization",
      vocabulary: "Vocabulary",
      structure: "Structure",
      mechanics: "Mechanics"
    };
    const label = criterion && criterion.label || fallbackLabels[key];
    const descriptor = criterion && criterion.descriptor || "";
    let options = '<option value="">Select</option>';
    for (let score = 1; score <= 10; score += 1) {
      options += '<option value="' + score + '" ' + (Number(value) === score ? "selected" : "") + ">" + score + "</option>";
    }
    return '<label><span>' + esc(label) + ' /10</span>' + (descriptor ? '<small class="rubric-descriptor">' + esc(descriptor) + "</small>" : "") + '<select data-rubric="' + esc(key) + '">' + options + "</select></label>";
  }

  function renderReviews(payload) {
    const source = payload || {};
    const health = source.health || {};
    const counts = health.counts || {};
    const students = health.students || [];
    const submissions = source.submissions || [];
    const criteria = source.rubricCriteria || [];
    const criteriaByKey = {};
    criteria.forEach((criterion) => {
      if (criterion && criterion.key) criteriaByKey[criterion.key] = criterion;
    });

    const monitorRows = students.map((item) => {
      return "<tr><td>" + esc(item.id) + "</td><td>" + esc(item.fullName) + "</td><td>" + esc(item.email) + '</td><td><span class="status-tag ' + esc(item.status) + '">' + esc(item.status) + "</span></td><td>" + esc(item.attempt && item.attempt.lastSavedAt || "-") + "</td><td>" + esc(item.submission && item.submission.receiptId || "-") + "</td><td>" + esc(item.grade != null ? Number(item.grade).toFixed(2) : "-") + '</td><td><button class="writing-button secondary small" data-action="reopen" data-id="' + esc(item.id) + '">Reopen 48h</button> <button class="writing-button danger small" data-action="reset-and-reopen" data-id="' + esc(item.id) + '">Reset + reopen</button></td></tr>';
    }).join("");

    const eventRows = (health.events || []).slice(0, 30).map((event) => {
      return "<tr><td>" + esc(event.at) + "</td><td>" + esc(event.type) + "</td><td>" + esc(event.studentId) + "</td><td>" + esc(event.actor) + "</td><td>" + esc(event.detail) + "</td></tr>";
    }).join("") || '<tr><td colspan="5">No events yet.</td></tr>';

    const reviewCards = submissions.map((item) => {
      const rubric = item.rubric || {};
      return '<article class="review-card" data-review="' + esc(item.studentId) + '"><h3>' + esc(item.studentName) + '</h3><div class="review-meta"><span>ID ' + esc(item.studentId) + "</span><span>" + esc(item.email) + "</span><span>" + esc(item.wordCount) + " words</span><span>" + esc(item.status) + "</span><span>Receipt " + esc(item.receiptId) + "</span><span>Submitted " + esc(item.submittedAt) + '</span></div><div class="student-writing">' + esc(item.body || "") + '</div><div class="rubric-grid">' + ["content", "composing", "vocabulary", "structure", "mechanics"].map((key) => rubricSelect(key, rubric[key], criteriaByKey[key])).join("") + '</div><label><span>Teacher formative feedback</span><textarea data-comments rows="4">' + esc(item.teacherComments || "") + '</textarea></label><div class="writing-button-row"><button class="writing-button primary" type="button" data-save-grade><i class="bi bi-save-fill"></i> Save /50 and publish 20% grade</button></div><p class="admin-feedback" data-feedback></p></article>';
    }).join("") || "<p>No writing submissions are waiting yet.</p>";

    els.review.innerHTML = '<div class="review-stats"><span class="stat-pill"><strong>' + esc(counts.total || 0) + '</strong> students</span><span class="stat-pill pending"><strong>' + esc(counts.inProgress || 0) + '</strong> in progress</span><span class="stat-pill pending"><strong>' + esc(counts.pendingReview || 0) + '</strong> pending review</span><span class="stat-pill graded"><strong>' + esc(counts.graded || 0) + '</strong> graded</span></div><div class="review-tabs" role="tablist"><button class="review-tab" type="button" role="tab" aria-selected="true" data-review-tab="monitor">Student monitor</button><button class="review-tab" type="button" role="tab" aria-selected="false" data-review-tab="submissions">Submissions and grading</button><button class="review-tab" type="button" role="tab" aria-selected="false" data-review-tab="events">Technical log</button></div><section class="review-pane" data-review-pane="monitor"><div class="overview-scroll"><table class="overview-table"><thead><tr><th>ID</th><th>Student</th><th>Email</th><th>Status</th><th>Last save</th><th>Receipt</th><th>Grade</th><th>Actions</th></tr></thead><tbody>' + monitorRows + '</tbody></table></div></section><section class="review-pane" data-review-pane="submissions" hidden>' + reviewCards + '</section><section class="review-pane" data-review-pane="events" hidden><div class="overview-scroll"><table class="overview-table"><thead><tr><th>Time</th><th>Event</th><th>ID</th><th>Actor</th><th>Detail</th></tr></thead><tbody>' + eventRows + "</tbody></table></div></section>";

    els.review.querySelectorAll("[data-review-tab]").forEach((button) => {
      button.addEventListener("click", () => {
        els.review.querySelectorAll("[data-review-tab]").forEach((tab) => {
          tab.setAttribute("aria-selected", String(tab === button));
        });
        els.review.querySelectorAll("[data-review-pane]").forEach((pane) => {
          pane.hidden = pane.dataset.reviewPane !== button.dataset.reviewTab;
        });
      });
    });
    els.review.querySelectorAll("[data-save-grade]").forEach((button) => {
      button.addEventListener("click", () => saveGrade(button.closest("[data-review]")));
    });
    els.review.querySelectorAll("[data-action]").forEach((button) => {
      button.addEventListener("click", () => studentAction(button));
    });
  }

  async function loadReviews() {
    if (!["admin", "teacher"].includes(role)) return;
    try {
      const result = await request(API.submissions, { timeout: 20000 }, 1);
      if (!result.ok) throw new Error("review_load_failed");
      renderReviews(result.data);
    } catch (error) {
      toast("The teacher monitor could not load. Try Refresh monitor.", "error");
    }
  }

  async function saveGrade(card) {
    const rubric = {};
    card.querySelectorAll("[data-rubric]").forEach((select) => {
      rubric[select.dataset.rubric] = Number(select.value);
    });
    const feedback = card.querySelector("[data-feedback]");
    if (Object.values(rubric).some((value) => !Number.isInteger(value) || value < 1 || value > 10)) {
      feedback.textContent = "Select a score from 1 to 10 for every teacher-only criterion.";
      return;
    }
    const button = card.querySelector("[data-save-grade]");
    button.disabled = true;
    feedback.textContent = "Saving the rubric and publishing the grade...";
    try {
      const result = await request(API.grade, {
        method: "PUT",
        body: JSON.stringify({
          studentId: card.dataset.review,
          rubric: rubric,
          teacherComments: card.querySelector("[data-comments]").value
        })
      }, 1);
      if (!result.ok) throw new Error("grade_failed");
      feedback.textContent = "Saved and published. Grade: " + result.data.submission.grade + " / 5.0";
      toast("Final Writing grade published in the 20% gradebook column.", "success");
      await loadReviews();
    } catch (error) {
      feedback.textContent = "The grade was not published. Try again.";
      button.disabled = false;
      toast("Grade publication failed.", "error");
    }
  }

  async function studentAction(button) {
    const action = button.dataset.action;
    const studentId = button.dataset.id;
    if (!confirm("Apply " + action + " for student " + studentId + "?")) return;
    button.disabled = true;
    try {
      const result = await request(API.studentAction, {
        method: "PUT",
        body: JSON.stringify({ studentId: studentId, action: action, hours: 48 })
      }, 1);
      if (!result.ok) throw new Error("student_action_failed");
      toast("Student action completed: " + result.data.detail, "success");
      await loadReviews();
    } catch (error) {
      toast("The student action was not completed.", "error");
      button.disabled = false;
    }
  }

  function renderReady(nextAttempt) {
    attempt = nextAttempt || attempt;
    setPanels("ready");
    els.begin.innerHTML = attempt
      ? '<i class="bi bi-arrow-repeat"></i> Resume final writing task'
      : '<i class="bi bi-play-fill"></i> Begin final writing task';
    els.begin.disabled = !els.integrity.checked;
  }

  function renderExam(nextAttempt, nextExam) {
    attempt = nextAttempt || attempt;
    exam = nextExam || exam || {};
    setPanels("exam");
    fillIdentity(attempt || student);
    applyDraft(attempt && attempt.draft);
    if (!staffPreview && restoreLocalDraft()) updateWordCounter();
    startClock();
    setHidden(els.backToAdmin, !staffPreview);
    els.submit.disabled = staffPreview || submitInFlight;
    els.submitStatus.textContent = staffPreview
      ? "Teacher preview only. This screen does not save or submit."
      : "Send to Teacher remains available. Wait for the receipt after pressing it.";
    setSaveStatus(
      staffPreview ? "Preview mode" : attempt && attempt.lastSavedAt ? "Saved draft restored" : "Ready to write",
      staffPreview ? "" : attempt && attempt.lastSavedAt ? "good" : ""
    );
    els.body.readOnly = false;
    els.body.focus();
  }

  function renderStaffPreview() {
    if (!["admin", "teacher"].includes(role)) {
      toast("Teacher access is required for preview.", "error");
      return;
    }
    staffPreview = true;
    const previewName = user && user.name || "Teacher";
    renderExam({
      attemptId: "STAFF-PREVIEW",
      studentId: "ADMIN",
      studentName: previewName,
      courseCode: "INTERMEDIATE-C1",
      expiresAt: null,
      draft: { body: "", updatedAt: null }
    }, exam || { targetWords: 170 });
    fillIdentity({ id: "ADMIN", fullName: previewName, email: user && user.email });
    updateWordCounter();
  }

  function renderSubmission(nextSubmission) {
    submission = nextSubmission;
    setPanels("submitted");
    fillIdentity({
      fullName: submission.studentName,
      id: submission.studentId,
      email: submission.email
    });
    const pending = submission.status !== "graded";
    els.submittedSummary.textContent = pending
      ? "Submitted - pending teacher review."
      : "Graded and published.";
    els.submittedContent.innerHTML = '<div class="submission-confirmation"><i class="bi bi-check-circle-fill"></i> Your Final Writing Task was successfully sent to the teacher. Keep this receipt as confirmation.</div><div class="submitted-grid"><div class="submitted-card"><strong>Receipt</strong><p>' + esc(submission.receiptId) + '</p></div><div class="submitted-card"><strong>Submitted</strong><p>' + esc(submission.submittedAt) + '</p></div><div class="submitted-card"><strong>Words</strong><p>' + esc(submission.wordCount) + '</p></div><div class="submitted-card"><strong>Status / grade</strong><p>' + (submission.grade != null ? esc(submission.grade) + " / 5.0" : "Pending teacher review") + '</p></div></div><div class="submitted-writing">' + esc(submission.body || "(Empty submission)") + '</div><div class="submitted-card"><strong>Teacher feedback</strong><p>' + esc(submission.teacherComments || "Your teacher has not published feedback yet.") + "</p></div>";
  }

  async function beginExam() {
    if (busy) return;
    busy = true;
    els.begin.disabled = true;
    els.begin.innerHTML = '<i class="bi bi-hourglass-split"></i> Opening...';
    try {
      const result = await request(API.start, {
        method: "POST",
        body: JSON.stringify({ courseCode: els.courseCode && els.courseCode.value || "INTERMEDIATE-C1" })
      }, 1);
      if (!result.ok) {
        if (result.data && result.data.submission) {
          renderSubmission(result.data.submission);
          return;
        }
        throw new Error(result.data && result.data.error || "start_failed");
      }
      exam = result.data.exam;
      renderExam(result.data.attempt, result.data.exam);
      toast(result.data.resumed ? "Your saved writing attempt was restored." : "Your final writing task has started.", "success");
    } catch (error) {
      message("The exam could not be opened. Check the connection and press Check availability.", "error");
      setPanels("access");
      toast("Could not open the writing exam.", "error");
    } finally {
      busy = false;
      els.begin.disabled = !els.integrity.checked;
    }
  }

  async function submitExam(event) {
    event.preventDefault();
    if (staffPreview) {
      els.submitStatus.textContent = "Teacher preview does not submit.";
      return;
    }
    if (submitInFlight) {
      toast("Your submission is already being processed.", "success");
      return;
    }
    const empty = !els.body.value.trim();
    const confirmation = empty
      ? "Your publication is empty. Send this empty exam to the teacher anyway?"
      : "Send this Final Writing Task to the teacher? You cannot edit it after the receipt is created.";
    if (!confirm(confirmation)) return;

    submitInFlight = true;
    els.submit.disabled = true;
    els.submitStatus.textContent = "Saving the final copy...";
    saveLocalDraft();
    await saveDraft();
    els.submitStatus.textContent = "Sending to the teacher. Keep this page open until the receipt appears...";
    try {
      const result = await request(API.submit, {
        method: "POST",
        body: JSON.stringify(collectDraft()),
        timeout: 30000
      }, 2);
      if (result.ok) {
        localStorage.removeItem(localDraftKey());
        renderSubmission(result.data.submission);
        toast("Exam sent to the teacher. Receipt created.", "success");
        return;
      }
      if (result.status === 409 && (result.data.submission || result.data.result)) {
        localStorage.removeItem(localDraftKey());
        renderSubmission(result.data.submission || result.data.result);
        toast("The server confirmed your earlier submission.", "success");
        return;
      }
      throw new Error(result.data && result.data.error || "submit_failed");
    } catch (error) {
      submitInFlight = false;
      els.submit.disabled = false;
      els.submitStatus.textContent = "Not submitted yet. Your publication is preserved. Press Send to Teacher again.";
      toast("The submission did not reach the server. Your text was preserved.", "error");
    }
  }

  function showAccess(text, type) {
    setPanels("access");
    els.accessStatus.textContent = text;
    message(text, type || "neutral");
  }

  async function loadState(force) {
    if (busy && !force) return;
    staffPreview = false;
    submitInFlight = false;
    els.body.readOnly = false;
    setHidden(els.backToAdmin, true);
    user = readUser();
    if (!user) {
      lastCredential = "";
      setHidden(els.account, true);
      showAccess("Use the sign-in control in the top navigation, then return here and press Check availability.", "neutral");
      return;
    }
    fillAccount();
    const generation = ++loadGeneration;
    lastCredential = user.credential;
    els.accessStatus.textContent = "Verifying " + (user.provider || "account") + " account...";
    try {
      const result = await request(API.state, { timeout: 16000 }, 1);
      if (generation !== loadGeneration) return;
      if (!result.ok) {
        throw Object.assign(new Error("state_failed"), { status: result.status, data: result.data });
      }
      const data = result.data || {};
      if (!data.student && !["admin", "teacher"].includes(data.role) && data.allowStudentIdClaim === true && !savedClaim()) {
        setPanels("access");
        setHidden(els.claimPanel, false);
        message("This email is not linked yet. Enter the registered document/ID to verify your Intermediate English record.", "closed");
        return;
      }
      role = data.role || "student";
      student = data.student;
      serverState = data.state || {};
      exam = data.exam || exam;
      submission = data.submission;
      attempt = data.attempt;
      setHidden(els.claimPanel, true);

      if (["admin", "teacher"].includes(role)) {
        setPanels("admin");
        renderAdminState();
        await loadReviews();
        return;
      }
      if (!student) {
        showAccess("This account is not linked to an Intermediate English student record. Use the document/ID option or ask the teacher to verify the gradebook.", "error");
        setHidden(els.claimPanel, false);
        return;
      }
      fillIdentity(student);
      if (submission) {
        renderSubmission(submission);
        return;
      }
      if (attempt && data.canResume) {
        showAccess("Access confirmed. Your saved attempt is available and can still be sent to the teacher.", "success");
        renderReady(attempt);
        return;
      }
      if (data.canStart) {
        showAccess("Access confirmed. You may begin the official writing exam now.", "success");
        renderReady(null);
        return;
      }
      showAccess("The Final Writing Task is closed. The teacher must activate it before you can begin.", "closed");
    } catch (error) {
      const detail = error.status ? " Technical detail: Status " + error.status + "." : "";
      showAccess("The writing exam server did not answer. Reload the page or press Check availability." + detail, "error");
    }
  }

  els.body.addEventListener("input", updateWordCounter);
  els.body.addEventListener("blur", () => {
    saveLocalDraft();
    saveDraft();
  });
  els.courseCode.addEventListener("input", queueSave);
  els.integrity.addEventListener("change", () => {
    els.begin.disabled = !els.integrity.checked;
  });
  els.begin.addEventListener("click", beginExam);
  els.form.addEventListener("submit", submitExam);
  els.check.addEventListener("click", () => loadState(true));
  els.claimButton.addEventListener("click", () => {
    const claim = String(els.claimInput.value || "").replace(/\D+/g, "");
    if (!claim) {
      message("Enter the registered document/ID first.", "error");
      return;
    }
    sessionStorage.setItem(KEY.claim, claim);
    toast("ID saved for this session. Checking the student record...", "success");
    loadState(true);
  });
  document.querySelectorAll("[data-scroll-access]").forEach((button) => {
    button.addEventListener("click", () => els.access.scrollIntoView({ behavior: "smooth", block: "start" }));
  });
  els.activate.addEventListener("click", () => setExamState(true));
  els.close.addEventListener("click", () => setExamState(false));
  els.preview.addEventListener("click", renderStaffPreview);
  els.refreshReview.addEventListener("click", loadReviews);
  els.backToAdmin.addEventListener("click", () => loadState(true));
  window.addEventListener("beforeunload", saveLocalDraft);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      saveLocalDraft();
      saveDraft();
    }
  });

  loadState(true);
  setInterval(() => {
    const next = readUser();
    if ((next && next.credential) !== lastCredential) loadState(true);
  }, 1200);
}());
