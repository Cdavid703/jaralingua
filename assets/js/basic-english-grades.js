(function () {
  const USER_KEY = "jaralingua_google_user";
  const API_PATH = "/api/basic/grades";

  let lastSignature = "";

  function readUser() {
    try {
      const saved = JSON.parse(sessionStorage.getItem(USER_KEY) || "null");
      if (!saved || !saved.exp || Date.now() / 1000 > saved.exp) return null;
      return saved;
    } catch (error) {
      return null;
    }
  }

  function normalizeEmail(value) {
    return String(value || "").trim().toLowerCase();
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatGrade(value) {
    return typeof value === "number" ? value.toFixed(1) : "Pending";
  }

  function gradeSummary(student, evaluations) {
    let completedWeight = 0;
    let earned = 0;
    const grades = student.grades || {};
    evaluations.forEach(function (evaluation) {
      const grade = grades[evaluation.id];
      if (typeof grade !== "number") return;
      completedWeight += evaluation.weight;
      earned += grade * evaluation.weight;
    });
    return {
      completedWeight: completedWeight,
      average: completedWeight ? earned / completedWeight : null
    };
  }

  function openGooglePanel() {
    const trigger = document.querySelector("[data-auth-toggle], [data-auth-nav-toggle]");
    if (trigger) trigger.click();
  }

  function renderLocked() {
    return `
      <div class="locked-card">
        <i class="bi bi-shield-lock-fill"></i>
        <h2 class="section-title">Sign in required</h2>
        <p class="section-text mx-auto" style="max-width: 720px;">
          Sign in with your Google account to see only your own Basic English grades.
        </p>
        <button class="btn-main mt-4" type="button" data-open-google-login><i class="bi bi-box-arrow-in-right"></i> Sign in with Google</button>
      </div>
    `;
  }

  function renderLoading() {
    return `
      <div class="locked-card">
        <i class="bi bi-hourglass-split"></i>
        <h2 class="section-title">Loading grades</h2>
        <p class="section-text">We are verifying your session before showing course information.</p>
      </div>
    `;
  }

  function renderError(message) {
    return `
      <div class="locked-card">
        <i class="bi bi-exclamation-triangle-fill"></i>
        <h2 class="section-title">Grades unavailable</h2>
        <p class="section-text mx-auto" style="max-width: 720px;">${escapeHtml(message)}</p>
      </div>
    `;
  }

  function renderNoRecord() {
    return `
      <div class="locked-card">
        <i class="bi bi-person-check-fill"></i>
        <h2 class="section-title">No grade record linked</h2>
        <p class="section-text mx-auto" style="max-width: 720px;">
          Your Google email is not linked to a Basic English student record yet. Contact the teacher to review the email in the grade list.
        </p>
      </div>
    `;
  }

  function studentMetricsMarkup(student, evaluations) {
    const summary = gradeSummary(student, evaluations);
    return `
      <div class="metric-grid">
        <div class="metric-card"><span>Student ID</span><strong>${escapeHtml(student.id || "Linked")}</strong></div>
        <div class="metric-card"><span>Current average</span><strong>${summary.average == null ? "Pending" : summary.average.toFixed(2)}</strong></div>
        <div class="metric-card"><span>Evaluated weight</span><strong>${summary.completedWeight}%</strong></div>
      </div>
    `;
  }

  function studentGradesRows(student, evaluations) {
    const grades = student.grades || {};
    return evaluations.map(function (evaluation) {
      const hasGrade = typeof grades[evaluation.id] === "number";
      return `
        <tr>
          <td>${escapeHtml(evaluation.title)}</td>
          <td>${escapeHtml(evaluation.type || "Assessment")}</td>
          <td>${evaluation.weight}%</td>
          <td>${escapeHtml(formatGrade(grades[evaluation.id]))}</td>
          <td><span class="status-pill ${hasGrade ? "done" : "pending"}">${hasGrade ? "Recorded" : "Pending"}</span></td>
        </tr>
      `;
    }).join("");
  }

  function renderStudentPanel(student, payload) {
    return `
      <div class="privacy-note mb-4">
        <i class="bi bi-shield-check"></i>
        <div>
          <strong>Private student view</strong>
          <p class="mb-0">This page shows only the grades linked to your signed-in Google email.</p>
        </div>
      </div>
      <div class="row g-4">
        <div class="col-lg-5">
          <div class="grades-panel h-100">
            <p class="section-kicker">Individual progress</p>
            <h2 class="section-title">My Basic English grades</h2>
            <p class="section-text">Review your current scores and the percentage already evaluated in the course.</p>
            ${studentMetricsMarkup(student, payload.evaluations)}
          </div>
        </div>
        <div class="col-lg-7">
          <div class="grades-panel h-100">
            <p class="section-kicker">Results</p>
            <h2 class="section-title">Course assessments</h2>
            <div class="table-wrap">
              <table class="grades-table">
                <thead><tr><th>Assessment</th><th>Type</th><th>Weight</th><th>Grade</th><th>Status</th></tr></thead>
                <tbody>${studentGradesRows(student, payload.evaluations)}</tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function staffStudentRows(payload) {
    return payload.students.map(function (student) {
      const summary = gradeSummary(student, payload.evaluations);
      const grades = student.grades || {};
      const gradeCells = payload.evaluations.map(function (evaluation) {
        return `<td>${escapeHtml(formatGrade(grades[evaluation.id]))}</td>`;
      }).join("");
      return `
        <tr>
          <td>${escapeHtml(student.fullName)}<br><span class="status-pill">${escapeHtml(student.level)}</span></td>
          <td>${escapeHtml(student.email || "No email")}</td>
          ${gradeCells}
          <td>${summary.average == null ? "Pending" : summary.average.toFixed(2)}</td>
          <td>${summary.completedWeight}%</td>
        </tr>
      `;
    }).join("");
  }

  function renderStaffPanel(payload) {
    const headers = payload.evaluations.map(function (evaluation) {
      return `<th>${escapeHtml(evaluation.title)}<br>${evaluation.weight}%</th>`;
    }).join("");
    return `
      <div class="privacy-note mb-4">
        <i class="bi bi-shield-check"></i>
        <div>
          <strong>Authorized staff view</strong>
          <p class="mb-0">The API allowed this full-group view because your account is registered as teacher or administrator.</p>
        </div>
      </div>
      <div class="metric-grid mb-4">
        <div class="metric-card"><span>Students</span><strong>${payload.students.length}</strong></div>
        <div class="metric-card"><span>Assessments</span><strong>${payload.evaluations.length}</strong></div>
        <div class="metric-card"><span>Course</span><strong>Basic English</strong></div>
      </div>
      <div class="grades-panel">
        <p class="section-kicker">Private data</p>
        <h2 class="section-title">Basic English gradebook</h2>
        <div class="table-wrap">
          <table class="grades-table">
            <thead><tr><th>Student</th><th>Email</th>${headers}<th>Average</th><th>Evaluated</th></tr></thead>
            <tbody>${staffStudentRows(payload)}</tbody>
          </table>
        </div>
      </div>
    `;
  }

  function fetchGrades(user) {
    return fetch(API_PATH, {
      headers: {
        Authorization: "Bearer " + user.credential
      }
    }).then(function (response) {
      if (!response.ok) throw new Error("The API rejected the request: " + response.status);
      return response.json();
    });
  }

  function renderPayload(root, payload) {
    if (payload.role === "admin" || payload.role === "teacher") {
      root.innerHTML = renderStaffPanel(payload);
      return;
    }
    root.innerHTML = payload.student ? renderStudentPanel(payload.student, payload) : renderNoRecord();
  }

  function render() {
    const root = document.getElementById("basicEnglishGradesApp");
    if (!root) return;
    const user = readUser();
    const signature = user ? normalizeEmail(user.email) + ":" + user.exp : "guest";
    if (signature === lastSignature) return;
    lastSignature = signature;

    if (!user || !user.credential) {
      root.innerHTML = renderLocked();
      const button = root.querySelector("[data-open-google-login]");
      if (button) button.addEventListener("click", openGooglePanel);
      return;
    }

    root.innerHTML = renderLoading();
    fetchGrades(user)
      .then(function (payload) {
        renderPayload(root, payload);
      })
      .catch(function () {
        root.innerHTML = renderError("We could not load your grades. Please check your session and reload the page.");
      });
  }

  window.addEventListener("load", function () {
    render();
    setInterval(render, 900);
  });
})();
