(function () {
  const GOOGLE_USER_KEY = "jaralingua_google_user";
  const MICROSOFT_USER_KEY = "jaralingua_microsoft_user";
  const LOCAL_USER_KEY = "jaralingua_local_user";
  const API_PATH = window.JARALINGUA_INTERMEDIATE_GRADES_API_PATH || "/api/intermediate/grades";
  const COURSE_LABEL = window.JARALINGUA_INTERMEDIATE_GRADES_COURSE_LABEL || "Intermediate English Course 1";
  const FOLLOW_UP_AUDIO_PATH = window.JARALINGUA_INTERMEDIATE_GRADES_AUDIO_PATH || "/api/intermediate/pronunciation-audio";
  const GOOGLE_CLIENT_ID = (window.JARALINGUA_GOOGLE_CLIENT_ID || "").trim();
  const MICROSOFT_CLIENT_ID = (window.JARALINGUA_MICROSOFT_CLIENT_ID || "4e729f8a-d101-4c5d-af68-609d749bc95a").trim();
  const MICROSOFT_TENANT_ID = "e1664f47-3c02-4a23-a559-0f33d25d8f86";
  const MICROSOFT_AUTHORITY = window.JARALINGUA_MICROSOFT_AUTHORITY || "https://login.microsoftonline.com/consumers";
  const MICROSOFT_REDIRECT_URI = window.JARALINGUA_MICROSOFT_REDIRECT_URI || (window.location.origin + "/ingles/intermediate/notas.html");
  const MICROSOFT_SCOPES = Array.isArray(window.JARALINGUA_MICROSOFT_SCOPES) ? window.JARALINGUA_MICROSOFT_SCOPES : ["User.Read"];

  let lastSignature = "";
  let microsoftClient = null;
  let googleInlineReady = false;
  let activeStaffTab = "gradebook";
  let staffEmailsVisible = false;

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

  function readUser() {
    const googleUser = readStoredUser(GOOGLE_USER_KEY);
    if (googleUser && googleUser.credential) return Object.assign({ provider: "google" }, googleUser);
    const microsoftUser = readStoredUser(MICROSOFT_USER_KEY);
    if (microsoftUser && microsoftUser.credential) return Object.assign({ provider: "microsoft" }, microsoftUser);
    const localUser = readStoredUser(LOCAL_USER_KEY);
    if (localUser && localUser.credential) return Object.assign({ provider: "local" }, localUser);
    return null;
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

  function decodeJwt(token) {
    const payload = token.split(".")[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (char) {
          return "%" + ("00" + char.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(json);
  }

  function formatGrade(value) {
    return typeof value === "number" ? value.toFixed(1) : "Pending";
  }

  function assessmentStatus(student, evaluation) {
    const grades = student.grades || {};
    if (typeof grades[evaluation.id] === "number") return { label: "Recorded", className: "done", submitted: true };
    const details = student.gradeDetails && typeof student.gradeDetails === "object" ? student.gradeDetails : {};
    const detail = details[evaluation.id];
    const pendingReview = detail && (
      detail.pendingTeacherReview === true ||
      ["submitted", "pending-writing", "pending-writing-review"].includes(String(detail.status || ""))
    );
    return pendingReview
      ? { label: "Submitted - teacher review pending", className: "submitted", submitted: true }
      : { label: "Not submitted", className: "pending", submitted: false };
  }

  function weightedEvaluations(evaluations) {
    return (Array.isArray(evaluations) ? evaluations : []).filter(function (evaluation) {
      return Number(evaluation && evaluation.weight) > 0;
    });
  }

  function evaluationDisplayTitle(evaluation) {
    return String(evaluation && evaluation.title || "Assessment")
      .replace(/\s*\(\s*\d+(?:\.\d+)?\s*%\s*\)\s*$/i, "")
      .trim();
  }

  function gradeSummary(student, evaluations) {
    let completedWeight = 0;
    let earned = 0;
    const grades = student.grades || {};
    evaluations.forEach(function (evaluation) {
      const weight = Number(evaluation.weight) || 0;
      if (weight <= 0) return;
      const grade = grades[evaluation.id];
      if (typeof grade !== "number") return;
      completedWeight += weight;
      earned += grade * weight;
    });
    return {
      completedWeight: completedWeight,
      average: completedWeight ? earned / completedWeight : null,
      weightedTotal: earned / 100
    };
  }

  function slugify(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "assessment";
  }

  function uniqueEvaluationId(title, evaluations) {
    const base = slugify(title);
    const ids = new Set(evaluations.map(function (evaluation) { return evaluation.id; }));
    let candidate = base;
    let index = 2;
    while (ids.has(candidate)) {
      candidate = base + "-" + index;
      index += 1;
    }
    return candidate;
  }

  function openGooglePanel() {
    const trigger = document.querySelector("[data-auth-toggle], [data-auth-nav-toggle]");
    if (trigger) trigger.click();
  }

  function storeGoogleSession(response) {
    if (!response || !response.credential) return;
    const profile = decodeJwt(response.credential);
    sessionStorage.setItem(GOOGLE_USER_KEY, JSON.stringify({
      provider: "google",
      sub: profile.sub,
      email: profile.email,
      name: profile.name || profile.email,
      picture: profile.picture || "",
      credential: response.credential,
      exp: profile.exp
    }));
    lastSignature = "";
    render();
  }

  function renderInlineGoogleButton(root) {
    const target = root.querySelector("[data-inline-google-button]");
    const status = root.querySelector("[data-inline-google-status]");
    if (!target) return;
    if (!GOOGLE_CLIENT_ID) {
      if (status) status.textContent = "Google Client ID is not configured.";
      return;
    }
    if (!(window.google && window.google.accounts && window.google.accounts.id)) {
      if (status) status.textContent = "Loading Google...";
      setTimeout(function () {
        renderInlineGoogleButton(root);
      }, 450);
      return;
    }
    try {
      if (!googleInlineReady) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: storeGoogleSession
        });
        googleInlineReady = true;
      }
      target.innerHTML = "";
      window.google.accounts.id.renderButton(target, {
        theme: "outline",
        size: "large",
        shape: "pill",
        text: "signin_with",
        width: 280
      });
      if (status) status.textContent = "";
      setTimeout(function () {
        if (target.children.length || !status) return;
        status.textContent = "Google did not allow the inline button. Use the floating Sign in button.";
      }, 1200);
    } catch (error) {
      if (status) status.textContent = "Google sign-in is not available. Use the floating Sign in button.";
    }
  }

  function microsoftAuthConfig() {
    return {
      auth: {
        clientId: MICROSOFT_CLIENT_ID,
        authority: MICROSOFT_AUTHORITY,
        redirectUri: MICROSOFT_REDIRECT_URI
      },
      cache: {
        cacheLocation: "sessionStorage"
      }
    };
  }

  function microsoftApp() {
    if (!window.msal) throw new Error("Microsoft sign-in library is not available.");
    if (!microsoftClient) microsoftClient = new window.msal.PublicClientApplication(microsoftAuthConfig());
    return microsoftClient;
  }

  function storeMicrosoftSession(account, tokenResponse) {
    const expiresOn = tokenResponse.expiresOn instanceof Date
      ? Math.floor(tokenResponse.expiresOn.getTime() / 1000)
      : Math.floor(Date.now() / 1000) + 3300;
    const email = (account && (account.username || account.name)) || "";
    sessionStorage.setItem(MICROSOFT_USER_KEY, JSON.stringify({
      provider: "microsoft",
      sub: account && account.homeAccountId,
      email: email,
      name: (account && account.name) || email,
      credential: tokenResponse.accessToken,
      exp: expiresOn
    }));
  }

  function signInMicrosoft(root) {
    if (!window.msal) {
      root.innerHTML = renderError("Microsoft sign-in could not load. Please reload the page and try again.");
      return;
    }
    const app = microsoftApp();
    root.innerHTML = renderLoading();
    app.loginPopup({
      scopes: MICROSOFT_SCOPES,
      prompt: "select_account"
    }).then(function (loginResponse) {
      const account = loginResponse.account;
      app.setActiveAccount(account);
      return app.acquireTokenSilent({
        scopes: MICROSOFT_SCOPES,
        account: account
      }).catch(function () {
        return app.acquireTokenPopup({
          scopes: MICROSOFT_SCOPES,
          account: account
        });
      }).then(function (tokenResponse) {
        storeMicrosoftSession(account, tokenResponse);
        lastSignature = "";
        render();
      });
    }).catch(function () {
      root.innerHTML = renderLocked();
      wireLockedActions(root);
    });
  }

  function signOutMicrosoft() {
    sessionStorage.removeItem(MICROSOFT_USER_KEY);
    if (microsoftClient) {
      const account = microsoftClient.getActiveAccount();
      if (account) microsoftClient.logoutPopup({ account: account }).catch(function () {});
    }
    lastSignature = "";
    render();
  }

  function authActionsMarkup(user) {
    if (!user || user.provider !== "microsoft") return "";
    return `
      <div class="mt-3">
        <button class="btn-main" type="button" data-microsoft-signout><i class="bi bi-box-arrow-right"></i> Sign out Microsoft</button>
      </div>
    `;
  }

  function wireMicrosoftSignout(root) {
    const button = root.querySelector("[data-microsoft-signout]");
    if (button) button.addEventListener("click", signOutMicrosoft);
  }

  function wireLockedActions(root) {
    const googleButton = root.querySelector("[data-open-google-login]");
    if (googleButton) googleButton.addEventListener("click", openGooglePanel);
    const microsoftButton = root.querySelector("[data-open-microsoft-login]");
    if (microsoftButton) microsoftButton.addEventListener("click", function () {
      signInMicrosoft(root);
    });
  }

  function renderLocked() {
    return `
      <div class="locked-card">
        <i class="bi bi-shield-lock-fill"></i>
        <h2 class="section-title">Sign in required</h2>
        <p class="section-text mx-auto" style="max-width: 720px;">
          Sign in with your Google or Microsoft account to see only your own Intermediate English grades.
        </p>
        <div class="d-flex flex-wrap justify-content-center align-items-center gap-3 mt-4">
          <div>
            <div data-inline-google-button></div>
            <small class="d-block mt-2 section-text" data-inline-google-status></small>
            <button class="btn-main mt-2" type="button" data-open-google-login><i class="bi bi-google"></i> Open Google panel</button>
          </div>
          <button class="btn-main" type="button" data-open-microsoft-login><i class="bi bi-microsoft"></i> Sign in with Microsoft</button>
        </div>
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
          Your signed-in email is not linked to an Intermediate English student record yet. Contact the teacher to review the email in the grade list.
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
    const officialEvaluations = weightedEvaluations(evaluations);
    if (!officialEvaluations.length) {
      return '<tr><td colspan="5">No weighted assessments are configured yet.</td></tr>';
    }
    return officialEvaluations.map(function (evaluation) {
      const hasGrade = typeof grades[evaluation.id] === "number";
      const status = assessmentStatus(student, evaluation);
      return `
        <tr>
          <td>${escapeHtml(evaluationDisplayTitle(evaluation))}</td>
          <td>${escapeHtml(evaluation.type || "Assessment")}</td>
          <td>${evaluation.weight}%</td>
          <td>${escapeHtml(hasGrade ? formatGrade(grades[evaluation.id]) : (status.submitted ? "Awaiting rubric" : "Pending"))}</td>
          <td><span class="status-pill ${status.className}">${escapeHtml(status.label)}</span></td>
        </tr>
      `;
    }).join("");
  }

  function renderStudentPanel(student, payload, user) {
    const officialEvaluations = weightedEvaluations(payload.evaluations);
    return `
      <div class="privacy-note mb-4">
        <i class="bi bi-shield-check"></i>
        <div>
          <strong>Private student view</strong>
          <p class="mb-0">This page shows only the grades linked to your signed-in email.</p>
          ${authActionsMarkup(user)}
        </div>
      </div>
      <div class="row g-4">
        <div class="col-lg-5">
          <div class="grades-panel h-100">
            <p class="section-kicker">Individual progress</p>
            <h2 class="section-title">My Intermediate English grades</h2>
            <p class="section-text">Review your current scores and the percentage already evaluated in the course.</p>
            ${studentMetricsMarkup(student, officialEvaluations)}
          </div>
        </div>
        <div class="col-lg-7">
          <div class="grades-panel h-100">
            <p class="section-kicker">Results</p>
            <h2 class="section-title">Course assessments</h2>
            <div class="table-wrap">
              <table class="grades-table">
                <thead><tr><th>Assessment</th><th>Type</th><th>Weight</th><th>Grade</th><th>Status</th></tr></thead>
                <tbody>${studentGradesRows(student, officialEvaluations)}</tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function staffStudentRows(payload, evaluations) {
    return payload.students.map(function (student) {
      const summary = gradeSummary(student, evaluations);
      const grades = student.grades || {};
      const gradeCells = evaluations.map(function (evaluation) {
        const status = assessmentStatus(student, evaluation);
        return `<td>${typeof grades[evaluation.id] === "number" ? escapeHtml(formatGrade(grades[evaluation.id])) : `<span class="status-pill ${status.className}">${escapeHtml(status.label)}</span>`}</td>`;
      }).join("");
      return `
        <tr data-student-row data-student-search="${escapeHtml((student.fullName + " " + student.email).toLowerCase())}">
          <td>${escapeHtml(student.fullName)}<br><span class="gradebook-student-id">${escapeHtml(student.id || "")}</span></td>
          <td class="gradebook-email-cell">${escapeHtml(student.email || "No email")}</td>
          ${gradeCells}
          <td>${summary.average == null ? "Pending" : summary.average.toFixed(2)}</td>
          <td>${summary.completedWeight}%</td>
        </tr>
      `;
    }).join("");
  }

  function adminGradeInputs(payload) {
    return payload.students.map(function (student) {
      return `
        <label class="admin-grade-row">
          <span>${escapeHtml(student.fullName)}</span>
          <input class="form-control" type="number" min="0" max="5" step="0.01" data-new-grade-student="${escapeHtml(student.id)}" placeholder="0.00 - 5.00">
        </label>
      `;
    }).join("");
  }

  function adminExistingGradeRows(payload) {
    const officialEvaluations = weightedEvaluations(payload.evaluations);
    return payload.students.map(function (student) {
      const grades = student.grades || {};
      const inputs = officialEvaluations.map(function (evaluation) {
        const value = typeof grades[evaluation.id] === "number" ? grades[evaluation.id] : "";
        return `
          <label class="admin-grade-row">
            <span>${escapeHtml(evaluation.title)}</span>
            <input class="form-control" type="number" min="0" max="5" step="0.01" value="${escapeHtml(value)}" data-edit-grade-student="${escapeHtml(student.id)}" data-edit-grade-evaluation="${escapeHtml(evaluation.id)}" placeholder="Pending">
          </label>
        `;
      }).join("");
      return `
        <details class="admin-student-card mb-3" data-grade-editor-card data-student-search="${escapeHtml([student.fullName, student.id, student.email].join(" ").toLowerCase())}">
          <summary>
            <span><strong>${escapeHtml(student.fullName)}</strong><br><small>${escapeHtml(student.id || "")}</small></span>
            <i class="bi bi-chevron-down" aria-hidden="true"></i>
          </summary>
          <div class="admin-student-body">
            <div class="admin-grade-grid">${inputs}</div>
          </div>
        </details>
      `;
    }).join("");
  }

  function adminAddGradeMarkup(payload) {
    return `
      <div class="grades-panel" data-admin-tools>
        <p class="section-kicker">Administrator</p>
        <h2 class="section-title">Add a new grade</h2>
        <p class="section-text mb-3">Create a weighted assessment and, if needed, enter its initial grades.</p>
          <form data-add-grade-form class="admin-grade-form">
            <div class="row g-3">
              <div class="col-md-5">
                <label class="form-label fw-bold" for="newGradeTitle">Assessment name</label>
                <input id="newGradeTitle" class="form-control" data-new-grade-title placeholder="Final Speaking Task" required>
              </div>
              <div class="col-md-3">
                <label class="form-label fw-bold" for="newGradeType">Type</label>
                <input id="newGradeType" class="form-control" data-new-grade-type placeholder="Speaking">
              </div>
              <div class="col-md-2">
                <label class="form-label fw-bold" for="newGradeWeight">Weight %</label>
                <input id="newGradeWeight" class="form-control" type="number" min="0" max="100" step="1" data-new-grade-weight placeholder="20" required>
              </div>
              <div class="col-md-2 d-grid align-items-end">
                <button class="btn-main" type="submit"><i class="bi bi-save"></i> Save</button>
              </div>
            </div>
            <label class="form-label fw-bold mt-3" for="newGradeDescription">Description</label>
            <input id="newGradeDescription" class="form-control" data-new-grade-description placeholder="Short description for students">
            <details class="nested-disclosure mt-3">
              <summary><span>Initial grades by student</span><i class="bi bi-chevron-down" aria-hidden="true"></i></summary>
              <div class="admin-grade-grid mt-3">${adminGradeInputs(payload)}</div>
            </details>
            <p class="section-text mt-3" data-admin-grade-status></p>
          </form>
      </div>
    `;
  }

  function adminEditGradesMarkup(payload) {
    return `
      <div class="grades-panel" data-admin-edit-tools>
        <p class="section-kicker">Manual editing</p>
        <h2 class="section-title">Edit recorded grades</h2>
          <p class="section-text mb-3">Select one student at a time. Empty fields remain pending.</p>
          <label class="form-label fw-bold w-100 mb-3">Find a student
            <input class="form-control" type="search" data-grade-editor-filter placeholder="Name, email or ID">
          </label>
          <form data-edit-grades-form novalidate>
            ${adminExistingGradeRows(payload)}
            <button class="btn-main" type="submit" data-save-grade-changes><i class="bi bi-save"></i> Save grade changes</button>
            <p class="section-text mt-3" role="status" aria-live="polite" data-edit-grade-status></p>
          </form>
      </div>
    `;
  }

  function adminStudentGradeInputs(payload, student) {
    const grades = student && student.grades ? student.grades : {};
    return weightedEvaluations(payload.evaluations).map(function (evaluation) {
      const value = typeof grades[evaluation.id] === "number" ? grades[evaluation.id] : "";
      return `
        <label class="admin-grade-row">
          <span>${escapeHtml(evaluation.title)}</span>
          <input class="form-control" type="number" min="0" max="5" step="0.01" value="${escapeHtml(value)}" data-student-grade="${escapeHtml(evaluation.id)}" placeholder="Pending">
        </label>
      `;
    }).join("");
  }

  function adminStudentCards(payload) {
    return payload.students.map(function (student, index) {
      return `
        <details class="admin-student-card mb-3" data-student-editor-card data-student-index="${index}" data-student-search="${escapeHtml([student.fullName, student.email, student.id].join(" ").toLowerCase())}">
          <summary>
            <span><strong>${escapeHtml(student.fullName || "Student")}</strong><br><small>${escapeHtml(student.id || "")}${student.email ? " · " + escapeHtml(student.email) : ""}</small></span>
            <i class="bi bi-chevron-down" aria-hidden="true"></i>
          </summary>
          <div class="admin-student-body">
            <label class="form-check fw-bold text-danger mb-3">
              <input class="form-check-input" type="checkbox" data-student-delete>
              Delete
            </label>
            <div class="row g-3">
            <div class="col-md-3">
              <label class="form-label fw-bold">ID</label>
              <input class="form-control" value="${escapeHtml(student.id)}" data-student-field="id">
            </div>
            <div class="col-md-5">
              <label class="form-label fw-bold">Full name</label>
              <input class="form-control" value="${escapeHtml(student.fullName)}" data-student-field="fullName">
            </div>
            <div class="col-md-4">
              <label class="form-label fw-bold">Level</label>
              <input class="form-control" value="${escapeHtml(student.level || "")}" data-student-field="level">
            </div>
            <div class="col-md-6">
              <label class="form-label fw-bold">Email</label>
              <input class="form-control" type="email" value="${escapeHtml(student.email || "")}" data-student-field="email">
            </div>
            <div class="col-md-6">
              <label class="form-label fw-bold">Contact</label>
              <input class="form-control" value="${escapeHtml(student.contact || "")}" data-student-field="contact">
            </div>
            </div>
            <div class="admin-grade-grid mt-3">${adminStudentGradeInputs(payload, student)}</div>
          </div>
        </details>
      `;
    }).join("");
  }

  function adminStudentEditorMarkup(payload) {
    return `
      <div class="grades-panel" data-admin-student-tools>
          <p class="section-kicker">Administrator · ${payload.students.length} students</p>
          <h2 class="section-title">Edit students and accounts</h2>
          <p class="section-text mb-3">Change one student record at a time. Existing follow-up results remain preserved.</p>
          <label class="form-label fw-bold w-100 mb-3">Find a student
            <input class="form-control" type="search" data-student-editor-filter placeholder="Name, email or ID">
          </label>
          <form data-edit-students-form>
            ${adminStudentCards(payload)}
            <details class="admin-student-card mb-3" data-new-student-card>
              <summary><span><strong>Add a student</strong><br><small>Create a new course record</small></span><i class="bi bi-plus-lg" aria-hidden="true"></i></summary>
              <div class="admin-student-body">
                <div class="row g-3">
                  <div class="col-md-3">
                    <label class="form-label fw-bold">ID</label>
                    <input class="form-control" data-new-student-field="id">
                  </div>
                  <div class="col-md-5">
                    <label class="form-label fw-bold">Full name</label>
                    <input class="form-control" data-new-student-field="fullName">
                  </div>
                  <div class="col-md-4">
                    <label class="form-label fw-bold">Level</label>
                    <input class="form-control" value="${escapeHtml((payload.students[0] && payload.students[0].level) || COURSE_LABEL)}" data-new-student-field="level">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-bold">Email</label>
                    <input class="form-control" type="email" data-new-student-field="email">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-bold">Contact</label>
                    <input class="form-control" data-new-student-field="contact">
                  </div>
                </div>
                <div class="admin-grade-grid mt-3">${adminStudentGradeInputs(payload, { grades: {} })}</div>
              </div>
            </details>
            <button class="btn-main" type="submit"><i class="bi bi-save"></i> Save student changes</button>
            <p class="section-text mt-3" data-edit-students-status></p>
          </form>
      </div>
    `;
  }

  function staffControlsMarkup() {
    return `
      <div class="grades-panel mb-4">
        <p class="section-kicker">Tools</p>
        <div class="row g-3 align-items-end">
          <div class="col-lg-7">
            <label class="form-label fw-bold" for="studentFilter">Filter students by name or email</label>
            <input id="studentFilter" class="form-control" data-student-filter placeholder="Type a name, last name, or email">
          </div>
          <div class="col-lg-5">
            <button class="btn-soft w-100" type="button" data-toggle-gradebook-email aria-pressed="${staffEmailsVisible ? "true" : "false"}">
              <i class="bi ${staffEmailsVisible ? "bi-eye-slash" : "bi-eye"}"></i>
              <span>${staffEmailsVisible ? "Hide emails" : "Show emails"}</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  function followUpSubmissionRows(payload) {
    const rows = [];
    payload.students.forEach(function (student) {
      const detailSources = [
        { name: "gradeDetails", details: student.gradeDetails || {} },
        { name: "teacherFollowUps", details: student.teacherFollowUps || {} }
      ];
      detailSources.forEach(function (source) {
        const details = source.details || {};
        Object.keys(details).forEach(function (key) {
          const detail = details[key];
          if (!detail || (detail.followUpOnly !== true && detail.teacherSubmission !== true)) return;
          rows.push({
            student: student,
            id: key,
            detail: detail,
            source: source.name
          });
        });
      });
    });
    rows.sort(function (a, b) {
      return String(b.detail.submittedAt || "").localeCompare(String(a.detail.submittedAt || ""));
    });
    if (!rows.length) {
      return `<tr><td colspan="8">No follow-up submissions yet.</td></tr>`;
    }
    return rows.map(function (item) {
      const detail = item.detail;
      const gradeText = typeof detail.grade === "number" ? formatGrade(detail.grade) : "Submitted";
      const scoreText = detail.score == null || detail.total == null ? (detail.score100 != null ? detail.score100 + " / 100" : (detail.wordCount ? detail.wordCount + " words" : "")) : detail.score + " / " + detail.total;
      const responseText = detail.blogText || detail.response || detail.transcript || "";
      const followupNotes = [
        detail.officialAssessment ? "Gradebook: official assessment with weight " + (detail.weight || 0) + "%." : "",
        detail.gradebookExcluded ? "Gradebook: teacher follow-up only. It does not create a percentage column." : "",
        detail.team ? "Team: " + detail.team : "",
        detail.dishName ? "Dish: " + detail.dishName : "",
        detail.shoppingList ? "Shopping list: " + detail.shoppingList : "",
        detail.selectedProblem ? "Student problem: " + detail.selectedProblem : "",
        detail.partnerProblem ? "Partner problem: " + detail.partnerProblem : "",
        Array.isArray(detail.reviewSummary) && detail.reviewSummary.length ? "Teacher review: " + detail.reviewSummary.join(" ") : ""
      ].filter(Boolean).join("\n");
      const audioButton = detail.audio ? `<button class="btn-soft btn-sm" type="button" data-followup-audio data-student-id="${escapeHtml(item.student.id)}" data-evaluation-id="${escapeHtml(item.id)}"><i class="bi bi-play-circle"></i> Load audio</button><div data-followup-audio-player="${escapeHtml(item.student.id)}-${escapeHtml(item.id)}" style="margin-top:.55rem;"></div>` : "";
      return `
        <tr>
          <td>${escapeHtml(item.student.fullName)}</td>
          <td>${escapeHtml(item.student.email || "")}</td>
          <td>${escapeHtml(detail.activity || item.id)}</td>
          <td>${escapeHtml(detail.activityType || "Follow-up")}</td>
          <td>${escapeHtml(gradeText)}</td>
          <td>${escapeHtml(scoreText)}</td>
          <td>${escapeHtml(detail.submittedAt || "")}</td>
          <td>${responseText || followupNotes ? `<details><summary>Read response</summary><div style="white-space:pre-wrap;min-width:280px;max-width:520px;line-height:1.55;margin-top:.6rem;">${escapeHtml([followupNotes, responseText].filter(Boolean).join("\n\n"))}</div></details>` : ""}${audioButton}</td>
        </tr>
      `;
    }).join("");
  }

  function followUpSubmissionCount(payload) {
    return payload.students.reduce(function (total, student) {
      const detailSources = [student.gradeDetails || {}, student.teacherFollowUps || {}];
      return total + detailSources.reduce(function (sourceTotal, details) {
        return sourceTotal + Object.keys(details).filter(function (key) {
          return details[key] && (details[key].followUpOnly === true || details[key].teacherSubmission === true);
        }).length;
      }, 0);
    }, 0);
  }

  function followUpSubmissionsMarkup(payload) {
    return `
      <div class="grades-panel" data-followup-disclosure>
          <p class="section-kicker">Teacher evidence</p>
          <h2 class="section-title">Activity submissions</h2>
          <p class="section-text mb-3">Follow-up activities with weight 0% do not affect the accumulated grade. Official submissions with positive weight are included in the course average.</p>
          <div class="table-wrap">
            <table class="grades-table">
              <thead><tr><th>Student</th><th>Email</th><th>Activity</th><th>Type</th><th>Reference grade</th><th>Score / words</th><th>Submitted</th><th>Response</th></tr></thead>
              <tbody>${followUpSubmissionRows(payload)}</tbody>
            </table>
          </div>
      </div>
    `;
  }

  function staffPdfToolsMarkup(payload) {
    if (payload.role !== "admin" || !window.JaraEnglishGradeReports) return "";
    const levels = window.JaraEnglishGradeReports.levels(payload);
    const directorsButtons = levels.map(function (level) {
      return `
        <button class="btn-main" type="button" data-download-pdf-audience="directors" data-download-pdf-level="${escapeHtml(level)}">
          <i class="bi bi-file-earmark-pdf-fill"></i> Directors · ${escapeHtml(window.JaraEnglishGradeReports.levelLabel(level))}
        </button>
      `;
    }).join("");
    const studentButtons = levels.map(function (level) {
      return `
        <button class="btn-soft" type="button" data-download-pdf-audience="students" data-download-pdf-level="${escapeHtml(level)}">
          <i class="bi bi-file-earmark-person-fill"></i> Students · ${escapeHtml(window.JaraEnglishGradeReports.levelLabel(level))}
        </button>
      `;
    }).join("");
    return `
      <div data-admin-pdf-tools>
          <hr class="my-4">
          <h3 class="h5 fw-bold mb-2">ITM Plurilingüe PDF reports</h3>
          <p class="section-text mb-3">Download official reports containing only assessments with a course weight.</p>
          <div class="mb-3">
            <h3 class="h6 fw-bold text-primary mb-2">For directors</h3>
            <div class="d-flex flex-wrap gap-2">${directorsButtons}</div>
          </div>
          <div>
            <h3 class="h6 fw-bold text-primary mb-2">For students</h3>
            <div class="d-flex flex-wrap gap-2">${studentButtons}</div>
          </div>
      </div>
    `;
  }

  function staffReportsMarkup(payload) {
    return `
      <div class="grades-panel">
        <p class="section-kicker">Exports and reports</p>
        <h2 class="section-title">Course reports</h2>
        <p class="section-text mb-3">Export the official gradebook. Assessments worth 0% are excluded from these files.</p>
        <button class="btn-main" type="button" data-export-excel><i class="bi bi-file-earmark-spreadsheet"></i> Download Excel</button>
        ${staffPdfToolsMarkup(payload)}
      </div>
    `;
  }

  function staffTabButton(id, label, icon, selected, count) {
    return `
      <button class="staff-tab" type="button" role="tab" id="staff-tab-${escapeHtml(id)}" aria-controls="staff-panel-${escapeHtml(id)}" aria-selected="${selected ? "true" : "false"}" tabindex="${selected ? "0" : "-1"}" data-staff-tab="${escapeHtml(id)}">
        <i class="bi ${escapeHtml(icon)}" aria-hidden="true"></i>
        <span>${escapeHtml(label)}</span>
        ${count == null ? "" : `<span class="staff-tab-count" aria-label="${escapeHtml(count)} items">${escapeHtml(count)}</span>`}
      </button>
    `;
  }

  function staffTabPanel(id, content, selected) {
    return `<section class="staff-tab-panel" role="tabpanel" id="staff-panel-${escapeHtml(id)}" aria-labelledby="staff-tab-${escapeHtml(id)}" tabindex="0" data-staff-panel="${escapeHtml(id)}"${selected ? "" : " hidden"}>${content}</section>`;
  }

  function renderStaffPanel(payload, user) {
    const officialEvaluations = weightedEvaluations(payload.evaluations);
    const headers = officialEvaluations.map(function (evaluation) {
      return `<th>${escapeHtml(evaluationDisplayTitle(evaluation))}<br>${evaluation.weight}%</th>`;
    }).join("");
    const emptyOfficialRow = `<tr><td colspan="${officialEvaluations.length + 4}">No weighted assessments are configured yet.</td></tr>`;
    const followUpCount = followUpSubmissionCount(payload);
    const gradebookContent = `
      ${staffControlsMarkup()}
      <div class="grades-panel mb-4" data-official-gradebook data-show-emails="${staffEmailsVisible ? "true" : "false"}">
        <p class="section-kicker">Official course record</p>
        <h2 class="section-title">Intermediate English gradebook</h2>
        <p class="section-text mb-3">Only assessments with a course weight appear in this table.</p>
        <div class="table-wrap">
          <table class="grades-table">
            <thead><tr><th>Student</th><th class="gradebook-email-cell">Email</th>${headers}<th>Average</th><th>Evaluated</th></tr></thead>
            <tbody>${officialEvaluations.length ? staffStudentRows(payload, officialEvaluations) : emptyOfficialRow}</tbody>
          </table>
        </div>
      </div>
    `;
    const tabs = [
      staffTabButton("gradebook", "Gradebook", "bi-table", true),
      staffTabButton("follow-up", "Follow-up reports", "bi-inbox-fill", false, followUpCount),
      staffTabButton("reports", "Reports", "bi-file-earmark-bar-graph-fill", false)
    ];
    const panels = [
      staffTabPanel("gradebook", gradebookContent, true),
      staffTabPanel("follow-up", followUpSubmissionsMarkup(payload), false),
      staffTabPanel("reports", staffReportsMarkup(payload), false)
    ];
    if (payload.role === "admin") {
      tabs.push(staffTabButton("add-grade", "Add grade", "bi-plus-square-fill", false));
      tabs.push(staffTabButton("edit-grades", "Edit grades", "bi-pencil-square", false));
      tabs.push(staffTabButton("students", "Students", "bi-people-fill", false, payload.students.length));
      panels.push(staffTabPanel("add-grade", adminAddGradeMarkup(payload), false));
      panels.push(staffTabPanel("edit-grades", adminEditGradesMarkup(payload), false));
      panels.push(staffTabPanel("students", adminStudentEditorMarkup(payload), false));
    }
    return `
      <div class="privacy-note mb-4">
        <i class="bi bi-shield-check"></i>
        <div>
          <strong>Authorized staff view</strong>
          <p class="mb-0">The API allowed this full-group view because your account is registered as teacher or administrator.</p>
          ${authActionsMarkup(user)}
        </div>
      </div>
      <div class="metric-grid mb-4">
        <div class="metric-card"><span>Students</span><strong>${payload.students.length}</strong></div>
        <div class="metric-card"><span>Weighted assessments</span><strong>${officialEvaluations.length}</strong></div>
        <div class="metric-card"><span>Course</span><strong>Intermediate English</strong></div>
      </div>
      <div class="staff-tabs" data-staff-tabs>
        <div class="staff-tab-nav" role="tablist" aria-label="Gradebook administration sections">
          ${tabs.join("")}
        </div>
        ${panels.join("")}
      </div>
    `;
  }

  function gradebookForSave(payload) {
    return {
      evaluations: payload.evaluations,
      students: payload.students.map(function (student) {
        return {
          id: student.id,
          fullName: student.fullName,
          level: student.level,
          email: student.email,
          emailAliases: student.emailAliases || [],
          contact: student.contact || "",
          bookDate: student.bookDate || null,
          grades: student.grades || {}
        };
      })
    };
  }

  function saveGradebook(user, payload) {
    return fetch(API_PATH, {
      method: "PUT",
      headers: {
        Authorization: "Bearer " + user.credential,
        "X-Jaralingua-Auth-Provider": user.provider || "google",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(gradebookForSave(payload))
    }).then(function (response) {
      if (!response.ok) throw new Error("The API rejected the update: " + response.status);
      return response.json();
    });
  }

  function loadFollowUpAudio(button, user) {
    const studentId = button.getAttribute("data-student-id") || "";
    const evaluationId = button.getAttribute("data-evaluation-id") || "";
    const holder = document.querySelector('[data-followup-audio-player="' + studentId + "-" + evaluationId + '"]');
    if (!holder || !user || !user.credential) return;
    button.disabled = true;
    button.innerHTML = '<i class="bi bi-hourglass-split"></i> Loading audio';
    fetch(FOLLOW_UP_AUDIO_PATH + "?studentId=" + encodeURIComponent(studentId) + "&evaluationId=" + encodeURIComponent(evaluationId), {
      headers: {
        Authorization: "Bearer " + user.credential,
        "X-Jaralingua-Auth-Provider": user.provider || "google"
      }
    }).then(function (response) {
      if (!response.ok) throw new Error("audio_unavailable");
      return response.blob();
    }).then(function (blob) {
      const url = URL.createObjectURL(blob);
      holder.innerHTML = '<audio controls style="width:100%;max-width:360px" src="' + escapeHtml(url) + '"></audio>';
      button.innerHTML = '<i class="bi bi-check-circle"></i> Audio loaded';
    }).catch(function () {
      holder.innerHTML = '<span class="section-text text-danger">Audio unavailable.</span>';
      button.innerHTML = '<i class="bi bi-play-circle"></i> Load audio';
      button.disabled = false;
    });
  }

  function wireFollowUpAudio(root, user) {
    root.querySelectorAll("[data-followup-audio]").forEach(function (button) {
      button.addEventListener("click", function () {
        loadFollowUpAudio(button, user);
      });
    });
  }

  function wireStudentFilter(root) {
    const input = root.querySelector("[data-student-filter]");
    if (!input) return;
    input.addEventListener("input", function () {
      const query = input.value.trim().toLowerCase();
      root.querySelectorAll("[data-student-row]").forEach(function (row) {
        const search = row.getAttribute("data-student-search") || "";
        row.hidden = query && search.indexOf(query) === -1;
      });
    });
  }

  function wireGradebookEmailToggle(root) {
    const button = root.querySelector("[data-toggle-gradebook-email]");
    const gradebook = root.querySelector("[data-official-gradebook]");
    if (!button || !gradebook) return;
    button.addEventListener("click", function () {
      staffEmailsVisible = !staffEmailsVisible;
      gradebook.setAttribute("data-show-emails", staffEmailsVisible ? "true" : "false");
      button.setAttribute("aria-pressed", staffEmailsVisible ? "true" : "false");
      button.innerHTML = `
        <i class="bi ${staffEmailsVisible ? "bi-eye-slash" : "bi-eye"}"></i>
        <span>${staffEmailsVisible ? "Hide emails" : "Show emails"}</span>
      `;
    });
  }

  function wireStaffTabs(root) {
    const tabsRoot = root.querySelector("[data-staff-tabs]");
    if (!tabsRoot) return;
    const tabs = Array.from(tabsRoot.querySelectorAll("[data-staff-tab]"));
    const panels = Array.from(tabsRoot.querySelectorAll("[data-staff-panel]"));

    function activate(tabId, moveFocus) {
      const nextTab = tabs.find(function (tab) {
        return tab.getAttribute("data-staff-tab") === tabId;
      }) || tabs[0];
      if (!nextTab) return;
      const nextId = nextTab.getAttribute("data-staff-tab");
      activeStaffTab = nextId;
      tabs.forEach(function (tab) {
        const selected = tab === nextTab;
        tab.setAttribute("aria-selected", selected ? "true" : "false");
        tab.tabIndex = selected ? 0 : -1;
      });
      panels.forEach(function (panel) {
        panel.hidden = panel.getAttribute("data-staff-panel") !== nextId;
      });
      if (moveFocus) nextTab.focus();
    }

    tabs.forEach(function (tab, index) {
      tab.addEventListener("click", function () {
        activate(tab.getAttribute("data-staff-tab"), false);
      });
      tab.addEventListener("keydown", function (event) {
        let nextIndex = null;
        if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
        if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
        if (event.key === "Home") nextIndex = 0;
        if (event.key === "End") nextIndex = tabs.length - 1;
        if (nextIndex == null) return;
        event.preventDefault();
        activate(tabs[nextIndex].getAttribute("data-staff-tab"), true);
      });
    });

    activate(activeStaffTab, false);
  }

  function excelCell(value) {
    return escapeHtml(value == null ? "" : value);
  }

  function exportExcel(payload) {
    const officialEvaluations = weightedEvaluations(payload.evaluations);
    const headers = officialEvaluations.map(function (evaluation) {
      return `<th>${excelCell(evaluationDisplayTitle(evaluation) + " (" + evaluation.weight + "%)")}</th>`;
    }).join("");
    const rows = payload.students.map(function (student) {
      const grades = student.grades || {};
      const summary = gradeSummary(student, officialEvaluations);
      const gradeCells = officialEvaluations.map(function (evaluation) {
        const status = assessmentStatus(student, evaluation);
        return `<td style="text-align:center;">${excelCell(typeof grades[evaluation.id] === "number" ? formatGrade(grades[evaluation.id]) : status.label)}</td>`;
      }).join("");
      return `
        <tr>
          <td>${excelCell(student.id)}</td>
          <td>${excelCell(student.fullName)}</td>
          <td>${excelCell(student.email)}</td>
          ${gradeCells}
          <td style="text-align:center;">${summary.average == null ? "Pending" : summary.average.toFixed(2)}</td>
          <td style="text-align:center;">${summary.completedWeight}%</td>
        </tr>
      `;
    }).join("");
    const html = `
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            table { border-collapse: collapse; font-family: Arial, sans-serif; }
            th { background: #1f4e8c; color: #ffffff; font-weight: bold; }
            th, td { border: 1px solid #c8d3e1; padding: 8px; }
            tr:nth-child(even) td { background: #eef5ff; }
            .title { background: #d62839; color: #ffffff; font-size: 18px; font-weight: bold; }
          </style>
        </head>
        <body>
          <table>
            <tr><td class="title" colspan="${officialEvaluations.length + 5}">${escapeHtml(COURSE_LABEL)} - Grades</td></tr>
            <tr><th>ID</th><th>Student</th><th>Email</th>${headers}<th>Average</th><th>Evaluated</th></tr>
            ${rows}
          </table>
        </body>
      </html>
    `;
    const blob = new Blob(["\ufeff", html], { type: "application/vnd.ms-excel;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "intermediate-english-grades.xls";
    document.body.appendChild(link);
    link.click();
    setTimeout(function () {
      URL.revokeObjectURL(link.href);
      link.remove();
    }, 0);
  }

  function wireExport(root, payload) {
    const button = root.querySelector("[data-export-excel]");
    if (button) button.addEventListener("click", function () {
      exportExcel(payload);
    });
  }

  function wirePdfExport(root, payload) {
    if (!window.JaraEnglishGradeReports) return;
    const reportPayload = Object.assign({}, payload, {
      evaluations: weightedEvaluations(payload.evaluations).map(function (evaluation) {
        return Object.assign({}, evaluation, { title: evaluationDisplayTitle(evaluation) });
      })
    });
    root.querySelectorAll("[data-download-pdf-audience][data-download-pdf-level]").forEach(function (button) {
      button.addEventListener("click", function () {
        window.JaraEnglishGradeReports.download(
          reportPayload,
          button.dataset.downloadPdfAudience,
          button.dataset.downloadPdfLevel,
          "Intermediate English",
          "intermediate-english-grades"
        );
      });
    });
  }

  function showGradeSaveNotice(root, message, isError) {
    let notice = root.querySelector("[data-grade-save-notice]");
    if (!notice) {
      notice = document.createElement("div");
      notice.setAttribute("data-grade-save-notice", "");
      notice.setAttribute("role", isError ? "alert" : "status");
      notice.setAttribute("aria-live", "polite");
      const tabs = root.querySelector("[data-staff-tabs]");
      if (tabs) tabs.insertAdjacentElement("beforebegin", notice);
      else root.prepend(notice);
    }
    notice.className = "alert " + (isError ? "alert-danger" : "alert-success") + " fw-bold mb-4";
    notice.textContent = message;
  }

  function readGradeInput(input) {
    const rawValue = input.value.trim();
    if (!rawValue) return { empty: true, grade: null };
    const normalized = rawValue.replace(",", ".");
    const grade = Number(normalized);
    if (!Number.isFinite(grade) || grade < 0 || grade > 5) {
      return { empty: false, grade: null, invalid: true };
    }
    return { empty: false, grade: Math.round(grade * 100) / 100, invalid: false };
  }

  function wireAdminTools(root, payload, user) {
    const form = root.querySelector("[data-add-grade-form]");
    const editForm = root.querySelector("[data-edit-grades-form]");
    const status = root.querySelector("[data-admin-grade-status]");
    const gradeFilter = root.querySelector("[data-grade-editor-filter]");
    if (gradeFilter) {
      gradeFilter.addEventListener("input", function () {
        const query = gradeFilter.value.trim().toLowerCase();
        root.querySelectorAll("[data-grade-editor-card]").forEach(function (card) {
          card.hidden = query && !(card.getAttribute("data-student-search") || "").includes(query);
        });
      });
    }
    if (form) form.addEventListener("submit", function (event) {
      event.preventDefault();
      const title = (root.querySelector("[data-new-grade-title]") || {}).value || "";
      const type = (root.querySelector("[data-new-grade-type]") || {}).value || "Assessment";
      const weight = Number((root.querySelector("[data-new-grade-weight]") || {}).value || 0);
      const description = (root.querySelector("[data-new-grade-description]") || {}).value || "";
      if (!title.trim()) {
        if (status) status.textContent = "Write an assessment name.";
        return;
      }
      const evaluation = {
        id: uniqueEvaluationId(title, payload.evaluations),
        title: title.trim(),
        type: type.trim() || "Assessment",
        weight: weight,
        description: description.trim()
      };
      const nextPayload = JSON.parse(JSON.stringify(payload));
      nextPayload.evaluations.push(evaluation);
      root.querySelectorAll("[data-new-grade-student]").forEach(function (input) {
        const value = input.value.trim();
        if (!value) return;
        const grade = Number(value);
        if (Number.isNaN(grade) || grade < 0 || grade > 5) return;
        const student = nextPayload.students.find(function (item) {
          return item.id === input.getAttribute("data-new-grade-student");
        });
        if (!student) return;
        student.grades = student.grades || {};
        student.grades[evaluation.id] = Math.round(grade * 100) / 100;
      });
      if (status) status.textContent = "Saving...";
      saveGradebook(user, nextPayload)
        .then(function () {
          lastSignature = "";
          if (status) status.textContent = "Saved.";
          renderPayload(root, nextPayload, user);
        })
        .catch(function () {
          if (status) status.textContent = "Could not save the new grade.";
        });
    });
    if (editForm) {
      const saveButton = editForm.querySelector("[data-save-grade-changes]");
      editForm.addEventListener("keydown", function (event) {
        if (event.key !== "Enter" || !event.target.matches("[data-edit-grade-student]")) return;
        event.preventDefault();
        editForm.requestSubmit(saveButton || undefined);
      });
      editForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const editStatus = root.querySelector("[data-edit-grade-status]");
        const nextPayload = JSON.parse(JSON.stringify(payload));
        let invalidInput = null;
        root.querySelectorAll("[data-edit-grade-student]").forEach(function (input) {
          if (invalidInput) return;
          const evaluationId = input.getAttribute("data-edit-grade-evaluation");
          const result = readGradeInput(input);
          const student = nextPayload.students.find(function (item) {
            return item.id === input.getAttribute("data-edit-grade-student");
          });
          if (!student) return;
          student.grades = student.grades && typeof student.grades === "object" ? student.grades : {};
          input.removeAttribute("aria-invalid");
          if (result.invalid) {
            invalidInput = input;
            input.setAttribute("aria-invalid", "true");
            return;
          }
          if (result.empty) {
            delete student.grades[evaluationId];
            return;
          }
          student.grades[evaluationId] = result.grade;
        });
        if (invalidInput) {
          const card = invalidInput.closest("details");
          if (card) card.open = true;
          invalidInput.focus();
          if (editStatus) editStatus.textContent = "Use a grade from 0.00 to 5.00. Two decimal places are accepted.";
          return;
        }
        if (saveButton) saveButton.disabled = true;
        if (editStatus) editStatus.textContent = "Saving grade changes...";
        saveGradebook(user, nextPayload)
          .then(function () {
            lastSignature = "";
            renderPayload(root, nextPayload, user);
            showGradeSaveNotice(root, "Grade changes saved successfully.", false);
          })
          .catch(function () {
            if (saveButton) saveButton.disabled = false;
            if (editStatus) editStatus.textContent = "Could not save grade changes. Your entries remain on screen; please try again.";
            showGradeSaveNotice(root, "The grade changes were not saved.", true);
          });
      });
    }
  }

  function cardField(card, name) {
    const input = card.querySelector('[data-student-field="' + name + '"]');
    return input ? input.value.trim() : "";
  }

  function newStudentField(card, name) {
    const input = card.querySelector('[data-new-student-field="' + name + '"]');
    return input ? input.value.trim() : "";
  }

  function gradesFromCard(card, originalGrades) {
    const grades = Object.assign({}, originalGrades || {});
    card.querySelectorAll("[data-student-grade]").forEach(function (input) {
      const evaluationId = input.getAttribute("data-student-grade");
      const value = input.value.trim();
      if (!value) {
        delete grades[evaluationId];
        return;
      }
      const grade = Number(value);
      if (Number.isNaN(grade) || grade < 0 || grade > 5) return;
      grades[evaluationId] = Math.round(grade * 100) / 100;
    });
    return grades;
  }

  function studentFromEditorCard(card, payload) {
    if (card.querySelector("[data-student-delete]") && card.querySelector("[data-student-delete]").checked) return null;
    const original = payload.students[Number(card.getAttribute("data-student-index"))] || {};
    const id = cardField(card, "id");
    const fullName = cardField(card, "fullName");
    if (!id || !fullName) return null;
    return {
      id: id,
      fullName: fullName,
      level: cardField(card, "level") || COURSE_LABEL,
      email: cardField(card, "email"),
      emailAliases: original.emailAliases || [],
      contact: cardField(card, "contact"),
      bookDate: original.bookDate || null,
      grades: gradesFromCard(card, original.grades)
    };
  }

  function newStudentFromEditor(card) {
    if (!card) return null;
    const id = newStudentField(card, "id");
    const fullName = newStudentField(card, "fullName");
    if (!id && !fullName) return null;
    if (!id || !fullName) return false;
    return {
      id: id,
      fullName: fullName,
      level: newStudentField(card, "level") || COURSE_LABEL,
      email: newStudentField(card, "email"),
      emailAliases: [],
      contact: newStudentField(card, "contact"),
      bookDate: null,
      grades: gradesFromCard(card, {})
    };
  }

  function hasDuplicateStudentIds(students) {
    const seen = new Set();
    return students.some(function (student) {
      const key = String(student.id || "").trim();
      if (!key) return false;
      if (seen.has(key)) return true;
      seen.add(key);
      return false;
    });
  }

  function wireStudentEditor(root, payload, user) {
    const form = root.querySelector("[data-edit-students-form]");
    if (!form) return;
    const status = root.querySelector("[data-edit-students-status]");
    const filter = root.querySelector("[data-student-editor-filter]");
    if (filter) {
      filter.addEventListener("input", function () {
        const query = filter.value.trim().toLowerCase();
        root.querySelectorAll("[data-student-editor-card]").forEach(function (card) {
          card.hidden = query && !(card.getAttribute("data-student-search") || "").includes(query);
        });
      });
    }
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      const nextPayload = JSON.parse(JSON.stringify(payload));
      const students = [];
      root.querySelectorAll("[data-student-editor-card]").forEach(function (card) {
        const student = studentFromEditorCard(card, payload);
        if (student) students.push(student);
      });
      const newStudent = newStudentFromEditor(root.querySelector("[data-new-student-card]"));
      if (newStudent === false) {
        if (status) status.textContent = "The new student needs ID and full name.";
        return;
      }
      if (newStudent) students.push(newStudent);
      if (hasDuplicateStudentIds(students)) {
        if (status) status.textContent = "There is a duplicated student ID.";
        return;
      }
      nextPayload.students = students;
      if (status) status.textContent = "Saving...";
      saveGradebook(user, nextPayload)
        .then(function () {
          lastSignature = "";
          if (status) status.textContent = "Saved.";
          renderPayload(root, nextPayload, user);
        })
        .catch(function () {
          if (status) status.textContent = "Could not save student changes.";
        });
    });
  }

  function fetchGrades(user) {
    return fetch(API_PATH, {
      headers: {
        Authorization: "Bearer " + user.credential,
        "X-Jaralingua-Auth-Provider": user.provider || "google"
      }
    }).then(function (response) {
      if (!response.ok) throw new Error("The API rejected the request: " + response.status);
      return response.json();
    });
  }

  function renderPayload(root, payload, user) {
    if (payload.role === "admin" || payload.role === "teacher") {
      root.innerHTML = renderStaffPanel(payload, user);
      wireStaffTabs(root);
      wireMicrosoftSignout(root);
      wireStudentFilter(root);
      wireGradebookEmailToggle(root);
      wireFollowUpAudio(root, user);
      wireExport(root, payload);
      wirePdfExport(root, payload);
      wireAdminTools(root, payload, user);
      wireStudentEditor(root, payload, user);
      return;
    }
    root.innerHTML = payload.student ? renderStudentPanel(payload.student, payload, user) : renderNoRecord();
    wireMicrosoftSignout(root);
  }

  function render() {
    const root = document.getElementById("intermediateEnglishGradesApp");
    if (!root) return;
    const user = readUser();
    const signature = user ? normalizeEmail(user.email) + ":" + user.exp : "guest";
    if (signature === lastSignature) return;
    lastSignature = signature;

    if (!user || !user.credential) {
      root.innerHTML = renderLocked();
      wireLockedActions(root);
      renderInlineGoogleButton(root);
      return;
    }

    root.innerHTML = renderLoading();
    fetchGrades(user)
      .then(function (payload) {
        renderPayload(root, payload, user);
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

