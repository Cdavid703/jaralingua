(() => {
  "use strict";

  const EVALUATION_ID = "finalOralPartnerCoachFollowUp";
  const API_PATH = "/api/intermediate/grades";
  const GOOGLE_USER_KEY = "jaralingua_google_user";
  const MICROSOFT_USER_KEY = "jaralingua_microsoft_user";
  const LOCAL_USER_KEY = "jaralingua_local_user";
  const stages = Array.isArray(window.JaraLinguaScheduleCoachConfig?.stages)
    ? window.JaraLinguaScheduleCoachConfig.stages
    : [];
  const rubric = [
    ["task", "Task"],
    ["interaction", "Interaction"],
    ["fluency", "Fluency"],
    ["language", "Language"],
    ["clarity", "Pronunciation"]
  ];

  const $ = (id) => document.getElementById(id);
  const elements = {
    studio: $("finalOralTeacherStudio"),
    status: $("finalOralReviewStatus"),
    login: $("finalOralReviewLoginButton"),
    refresh: $("finalOralRefreshReviewButton"),
    dashboard: $("finalOralReviewDashboard"),
    metrics: $("finalOralReviewMetrics"),
    selector: $("finalOralSubmissionSelector"),
    roster: $("finalOralReviewRoster"),
    initials: $("finalOralReviewInitials"),
    name: $("finalOralReviewName"),
    meta: $("finalOralReviewMeta"),
    badge: $("finalOralReviewBadge"),
    route: $("finalOralRouteCard"),
    tabs: $("finalOralEvidenceTabs"),
    coverage: $("finalOralEvidenceCoverage"),
    evidenceBadge: $("finalOralEvidenceBadge"),
    evidenceTopic: $("finalOralEvidenceTopic"),
    evidencePrompt: $("finalOralEvidencePrompt"),
    responses: $("finalOralEvidenceResponses"),
    rubricTotal: $("finalOralRubricTotal"),
    rubricBars: $("finalOralRubricBars")
  };

  if (!elements.studio) return;

  let payload = null;
  let submissions = [];
  let selectedId = "";
  let selectedStage = 0;

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
      const saved = JSON.parse(sessionStorage.getItem(key) || "null");
      if (!saved || !saved.exp || Date.now() / 1000 > saved.exp) {
        sessionStorage.removeItem(key);
        return null;
      }
      return Object.assign({ provider }, saved);
    } catch {
      sessionStorage.removeItem(key);
      return null;
    }
  }

  function readUser() {
    return readStoredUser(GOOGLE_USER_KEY, "google") ||
      readStoredUser(MICROSOFT_USER_KEY, "microsoft") ||
      readStoredUser(LOCAL_USER_KEY, "local");
  }

  function setStatus(message, type = "pending") {
    elements.status.textContent = message;
    elements.status.classList.toggle("is-error", type === "error");
    elements.status.classList.toggle("is-success", type === "success");
  }

  function formatGrade(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number.toFixed(2) : "--";
  }

  function scoreText(value, total = 50) {
    const number = Number(value);
    return Number.isFinite(number) ? `${Math.round(number)}/${total}` : "--";
  }

  function studentInitials(name) {
    const parts = String(name || "Student").trim().split(/\s+/).filter(Boolean).slice(0, 2);
    return (parts.map((part) => part[0]).join("") || "ST").toUpperCase();
  }

  function detailFor(student) {
    const gradeDetails = student?.gradeDetails && typeof student.gradeDetails === "object" ? student.gradeDetails : {};
    const followUps = student?.teacherFollowUps && typeof student.teacherFollowUps === "object" ? student.teacherFollowUps : {};
    return gradeDetails[EVALUATION_ID] || followUps[EVALUATION_ID] || null;
  }

  function normalizedResponses(detail) {
    const responses = Array.isArray(detail?.responses)
      ? detail.responses
      : Array.isArray(detail?.turns)
        ? detail.turns
        : [];
    if (responses.length) return responses;
    const transcript = String(detail?.transcript || "").trim();
    return transcript ? [{ stageIndex: 0, topic: "Complete transcript", prompt: "Combined transcript", transcript, score: detail.score }] : [];
  }

  function collectSubmissions(data) {
    const students = Array.isArray(data?.students) ? data.students : [];
    return students.map((student) => {
      const detail = detailFor(student);
      return {
        id: String(student.id || ""),
        student,
        detail,
        submitted: Boolean(detail),
        responses: normalizedResponses(detail)
      };
    });
  }

  function selectedSubmission() {
    return submissions.find((item) => item.id === selectedId) || submissions.find((item) => item.submitted) || null;
  }

  function updateSummary() {
    const totalStudents = submissions.length;
    const submitted = submissions.filter((item) => item.submitted);
    const averageGrade = submitted
      .map((item) => Number(item.detail?.grade))
      .filter(Number.isFinite)
      .reduce((sum, grade, _index, values) => sum + grade / values.length, 0);
    const latest = submitted
      .map((item) => item.detail?.submittedAt || "")
      .filter(Boolean)
      .sort()
      .slice(-1)[0] || "--";
    elements.metrics.innerHTML = [
      ["Submitted", `${submitted.length}/${totalStudents}`],
      ["Pending", String(Math.max(0, totalStudents - submitted.length))],
      ["Average grade", submitted.length ? `${averageGrade.toFixed(2)}/5` : "--"],
      ["Latest delivery", latest]
    ].map(([label, value]) => `<article><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></article>`).join("");
  }

  function updateSelector() {
    const submitted = submissions.filter((item) => item.submitted);
    elements.selector.innerHTML = submitted.length
      ? submitted.map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.student.fullName || item.id)} - ${escapeHtml(formatGrade(item.detail?.grade))}/5</option>`).join("")
      : '<option value="">No submissions yet</option>';
    if (!selectedId && submitted[0]) selectedId = submitted[0].id;
    elements.selector.value = selectedId;
  }

  function updateRoster() {
    elements.roster.innerHTML = submissions.length ? submissions.map((item) => {
      const name = item.student.fullName || "Course student";
      const status = item.submitted ? `Submitted - ${formatGrade(item.detail?.grade)}/5` : "Not submitted";
      return `<button type="button" data-final-oral-student="${escapeHtml(item.id)}" class="${item.id === selectedId ? "is-active" : ""}" ${item.submitted ? "" : "disabled"}>${escapeHtml(name)}<span>${escapeHtml(status)}</span></button>`;
    }).join("") : "<p>No roster was returned.</p>";
  }

  function stageLabel(index) {
    const stage = stages[index] || {};
    return stage.topic || `Stage ${index + 1}`;
  }

  function updateStageTabs(item) {
    const responses = item?.responses || [];
    const maxStages = stages.length || Math.max(1, ...responses.map((response) => Number(response.stageIndex) + 1).filter(Number.isFinite));
    const analyzed = new Set(responses.map((response) => Number(response.stageIndex)).filter(Number.isFinite));
    selectedStage = Math.max(0, Math.min(maxStages - 1, selectedStage));
    elements.coverage.textContent = `${analyzed.size} of ${maxStages}`;
    elements.tabs.innerHTML = Array.from({ length: maxStages }, (_unused, index) => {
      const hasEvidence = analyzed.has(index);
      return `<button type="button" class="${index === selectedStage ? "is-active" : ""}" data-final-oral-stage="${index}">Stage ${index + 1}${hasEvidence ? "" : " - empty"}</button>`;
    }).join("");
  }

  function updateEvidence(item) {
    const stage = stages[selectedStage] || {};
    const responses = (item?.responses || []).filter((response) => Number(response.stageIndex) === selectedStage);
    elements.evidenceBadge.textContent = `Stage ${selectedStage + 1}`;
    elements.evidenceTopic.textContent = stage.topic || responses[0]?.topic || "Stage evidence";
    elements.evidencePrompt.textContent = responses[0]?.prompt || stage.prompt || "No prompt was saved for this stage.";
    elements.responses.innerHTML = responses.length ? responses.map((response) => {
      const phase = response.phase === "clarify" ? "Clarification response" : "Main response";
      const score = Number.isFinite(Number(response.score)) ? `${Math.round(Number(response.score))}/50` : "Not scored";
      return `<article><header><strong>${escapeHtml(phase)}</strong><span>${escapeHtml(score)}</span></header><p>${escapeHtml(response.transcript || "No transcript saved.")}</p></article>`;
    }).join("") : "<article><header><strong>No evidence saved</strong><span>--</span></header><p>This student does not have a transcript for this stage.</p></article>";
  }

  function updateRubric(detail) {
    const metrics = detail?.metrics && typeof detail.metrics === "object" ? detail.metrics : {};
    elements.rubricTotal.textContent = Number.isFinite(Number(detail?.score)) ? Math.round(Number(detail.score)) : "--";
    elements.rubricBars.innerHTML = rubric.map(([key, label]) => {
      const value = Number(metrics[key]);
      const safe = Number.isFinite(value) ? Math.max(0, Math.min(10, Math.round(value))) : 0;
      return `<span style="--score:${safe}"><b>${escapeHtml(label)}</b><i></i><em>${Number.isFinite(value) ? safe : "--"}</em></span>`;
    }).join("");
  }

  function updateDetail() {
    const item = selectedSubmission();
    if (!item || !item.submitted) {
      elements.name.textContent = "No submission selected";
      elements.meta.textContent = "Choose a submitted student to review the evidence portfolio.";
      elements.badge.textContent = "Pending";
      elements.initials.textContent = "ST";
      elements.route.innerHTML = "";
      elements.tabs.innerHTML = "";
      elements.responses.innerHTML = "";
      updateRubric(null);
      return;
    }
    selectedId = item.id;
    const detail = item.detail || {};
    elements.initials.textContent = studentInitials(item.student.fullName);
    elements.name.textContent = item.student.fullName || "Course student";
    elements.meta.textContent = `${item.student.email || "No email"} - ${detail.submittedAt || "No date"} - Attempt ${detail.attemptCount || 1}`;
    elements.badge.textContent = `Official 20% - ${formatGrade(detail.grade)}/5`;
    elements.route.innerHTML = [
      ["Selected problem", detail.selectedProblem || "--"],
      ["Partner problem", detail.partnerProblem || "--"],
      ["Mode", detail.mode === "real" ? "Realistic Exam Simulation" : "Guided Rehearsal"]
    ].map(([label, value]) => `<div><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join("");
    updateStageTabs(item);
    updateEvidence(item);
    updateRubric(detail);
    updateSelector();
    updateRoster();
  }

  function renderDashboard() {
    updateSummary();
    updateSelector();
    updateRoster();
    updateDetail();
    elements.dashboard.hidden = false;
  }

  async function loadPanel() {
    const user = readUser();
    if (!user?.credential) {
      elements.dashboard.hidden = true;
      setStatus("Sign in with a teacher or administrator account to load the review panel.");
      return;
    }
    setStatus("Loading Final Oral Partner Coach submissions...");
    elements.refresh.disabled = true;
    try {
      const response = await fetch(API_PATH, {
        headers: {
          Authorization: `Bearer ${user.credential}`,
          "X-Jaralingua-Auth-Provider": user.provider || "google"
        }
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || `grades_${response.status}`);
      payload = data;
      if (!["admin", "teacher"].includes(String(payload.role || ""))) {
        elements.dashboard.hidden = true;
        setStatus("This panel is reserved for teacher and administrator accounts.", "error");
        return;
      }
      submissions = collectSubmissions(payload);
      if (!submissions.some((item) => item.submitted)) {
        elements.dashboard.hidden = false;
        updateSummary();
        updateSelector();
        updateRoster();
        updateDetail();
        setStatus("Teacher access confirmed. No Final Oral Partner Coach submissions have arrived yet.", "success");
        return;
      }
      setStatus("Teacher access confirmed. Submissions loaded.", "success");
      renderDashboard();
    } catch (error) {
      elements.dashboard.hidden = true;
      setStatus(error.message === "student_not_authorized"
        ? "This account is signed in but is not registered as Intermediate English staff."
        : "The review panel could not load submissions. Check login or connection.", "error");
    } finally {
      elements.refresh.disabled = false;
    }
  }

  elements.refresh.addEventListener("click", loadPanel);
  elements.login.addEventListener("click", () => {
    setStatus("Use the sign-in panel, then press Refresh submissions.");
  });
  elements.selector.addEventListener("change", () => {
    selectedId = elements.selector.value;
    selectedStage = 0;
    updateDetail();
  });
  elements.roster.addEventListener("click", (event) => {
    const button = event.target.closest("[data-final-oral-student]");
    if (!button || button.disabled) return;
    selectedId = button.dataset.finalOralStudent || "";
    selectedStage = 0;
    updateDetail();
  });
  elements.tabs.addEventListener("click", (event) => {
    const button = event.target.closest("[data-final-oral-stage]");
    if (!button) return;
    selectedStage = Number(button.dataset.finalOralStage) || 0;
    updateDetail();
  });
  window.addEventListener("jaralingua:auth-changed", () => window.setTimeout(loadPanel, 250));
  window.addEventListener("storage", (event) => {
    if ([GOOGLE_USER_KEY, MICROSOFT_USER_KEY, LOCAL_USER_KEY].includes(event.key)) loadPanel();
  });

  window.setTimeout(loadPanel, 700);
})();
