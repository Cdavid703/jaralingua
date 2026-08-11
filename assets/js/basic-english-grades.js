(function () {
  const PAGE_CONFIG = Object.assign({
    apiPath: "/api/basic/grades",
    courseTitle: "Basic English",
    courseFullTitle: "Basic English Course 1",
    courseGradebookTitle: "Basic English gradebook",
    studentRecordName: "Basic English student record",
    excelTitle: "Basic English Course 1 - Grades",
    excelFileName: "basic-english-grades.xls",
    reportCourseLabel: "Basic English",
    reportFilePrefix: "basic-english-grades",
    microsoftRedirectPath: "/ingles/basico/notas.html",
    studentIdClaimKey: "jaralingua_basic_student_id_claim",
    emptyGradeGrid: false,
    disableAdminEditing: false,
    hidePdfReports: false,
    showRosterExport: false,
    rosterExcelTitle: "Student roster",
    rosterExcelFileName: "student-roster.xls",
    showStudentProfile: false,
    studentProfileApiPath: "",
    emptyAssessmentsMessage: "No assessments have been created for this level yet."
  }, window.JARALINGUA_BASIC_GRADES_CONFIG || {});
  const GOOGLE_USER_KEY = "jaralingua_google_user";
  const MICROSOFT_USER_KEY = "jaralingua_microsoft_user";
  const LOCAL_USER_KEY = "jaralingua_local_user";
  const API_PATH = PAGE_CONFIG.apiPath;
  const STUDENT_ID_CLAIM_KEY = PAGE_CONFIG.studentIdClaimKey;
  const GOOGLE_CLIENT_ID = (window.JARALINGUA_GOOGLE_CLIENT_ID || "").trim();
  const MICROSOFT_CLIENT_ID = (window.JARALINGUA_MICROSOFT_CLIENT_ID || "4e729f8a-d101-4c5d-af68-609d749bc95a").trim();
  const MICROSOFT_TENANT_ID = "e1664f47-3c02-4a23-a559-0f33d25d8f86";
  const MICROSOFT_AUTHORITY = window.JARALINGUA_MICROSOFT_AUTHORITY || "https://login.microsoftonline.com/consumers";
  const MICROSOFT_REDIRECT_URI = window.JARALINGUA_MICROSOFT_REDIRECT_URI || (window.location.origin + PAGE_CONFIG.microsoftRedirectPath);
  const MICROSOFT_SCOPES = Array.isArray(window.JARALINGUA_MICROSOFT_SCOPES) ? window.JARALINGUA_MICROSOFT_SCOPES : ["User.Read"];
  const EMAIL_COLUMNS_HIDDEN_KEY = "jaralingua_basic_english_grades_hide_email_columns";

  let lastSignature = "";
  let microsoftClient = null;
  let googleInlineReady = false;

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

  function evaluationDetail(student, evaluation) {
    const details = student && student.gradeDetails && typeof student.gradeDetails === "object" ? student.gradeDetails : {};
    return details[evaluation.id] && typeof details[evaluation.id] === "object" ? details[evaluation.id] : null;
  }

  function isSubmittedActivity(student, evaluation) {
    const detail = evaluationDetail(student, evaluation);
    return detail && ["submitted", "pending-writing", "pending-writing-review"].includes(String(detail.status || ""));
  }

  function formatEvaluationResult(student, evaluation) {
    const grades = student.grades || {};
    if (typeof grades[evaluation.id] === "number") return grades[evaluation.id].toFixed(1);
    if (isSubmittedActivity(student, evaluation)) return "Submitted";
    return "Pending";
  }

  function evaluationStatus(student, evaluation) {
    const grades = student.grades || {};
    if (typeof grades[evaluation.id] === "number") return { label: "Recorded", className: "done" };
    if (isSubmittedActivity(student, evaluation)) return { label: "Submitted", className: "done" };
    return { label: "Pending", className: "pending" };
  }

  function emptyGradeStudent(student) {
    return Object.assign({}, student || {}, {
      level: PAGE_CONFIG.courseFullTitle,
      grades: {},
      gradeDetails: {}
    });
  }

  function evaluationWeight(evaluation) {
    const weight = Number(evaluation && evaluation.weight);
    return Number.isFinite(weight) ? weight : 0;
  }

  function weightedEvaluations(evaluations) {
    return (Array.isArray(evaluations) ? evaluations : []).filter(function (evaluation) {
      return evaluationWeight(evaluation) > 0;
    });
  }

  function deliverableEvaluations(evaluations) {
    return (Array.isArray(evaluations) ? evaluations : []).filter(function (evaluation) {
      return evaluationWeight(evaluation) <= 0;
    });
  }

  function payloadWithEvaluations(payload, evaluations) {
    return Object.assign({}, payload || {}, {
      evaluations: Array.isArray(evaluations) ? evaluations : []
    });
  }

  function normalizeGradesPayload(payload) {
    if (!PAGE_CONFIG.emptyGradeGrid || !payload || typeof payload !== "object") return payload;
    const next = Object.assign({}, payload, {
      evaluations: [],
      students: Array.isArray(payload.students) ? payload.students.map(emptyGradeStudent) : []
    });
    if (payload.student) next.student = emptyGradeStudent(payload.student);
    return next;
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
      average: completedWeight ? earned / completedWeight : null,
      weightedTotal: earned / 100
    };
  }

  function approvalStatus(student, evaluations) {
    if (student && student.approvalStatus) return String(student.approvalStatus);
    const weighted = weightedEvaluations(evaluations);
    const summary = gradeSummary(student, weighted);
    const grades = student && student.grades ? student.grades : {};
    const pendingCount = weighted.filter(function (evaluation) {
      return typeof grades[evaluation.id] !== "number";
    }).length;
    if (pendingCount > 2 || summary.average == null || summary.average < 3) return "Reprobado";
    return "Aprobado";
  }

  function approvalClass(status) {
    return String(status || "").toLowerCase().indexOf("aprob") !== -1 ? "done" : "pending";
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

  function savedStudentIdClaim() {
    return String(sessionStorage.getItem(STUDENT_ID_CLAIM_KEY) || "").replace(/\D+/g, "");
  }

  function clearStudentIdClaim() {
    sessionStorage.removeItem(STUDENT_ID_CLAIM_KEY);
  }

  function promptStudentIdClaim(user) {
    const activeEmail = user && user.email ? "\nSigned in as: " + user.email : "";
    const claim = String(window.prompt(
      "We could not find your email in the " + PAGE_CONFIG.courseTitle + " gradebook." + activeEmail +
      "\n\nPlease type your ID/document number to link this account to your student record." +
      "\n\nNo encontramos tu correo en la grilla del curso. Escribe tu documento/ID para validar tu acceso:",
      ""
    ) || "").replace(/\D+/g, "");
    if (claim) sessionStorage.setItem(STUDENT_ID_CLAIM_KEY, claim);
    return claim;
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
          Sign in with your Google or Microsoft account to see only your own ${escapeHtml(PAGE_CONFIG.courseTitle)} grades.
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
          Your signed-in email is not linked to a ${escapeHtml(PAGE_CONFIG.studentRecordName)} yet. Contact the teacher to review the email in the grade list.
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
    return evaluations.map(function (evaluation) {
      const status = evaluationStatus(student, evaluation);
      return `
        <tr>
          <td>${escapeHtml(evaluation.title)}</td>
          <td>${escapeHtml(evaluation.type || "Assessment")}</td>
          <td>${evaluation.weight}%</td>
          <td>${escapeHtml(formatEvaluationResult(student, evaluation))}</td>
          <td><span class="status-pill ${status.className}">${status.label}</span></td>
        </tr>
      `;
    }).join("");
  }

  function studentDeliverableRows(student, evaluations) {
    return evaluations.map(function (evaluation) {
      const status = evaluationStatus(student, evaluation);
      return `
        <tr>
          <td>${escapeHtml(evaluation.title)}</td>
          <td>${escapeHtml(evaluation.type || "Deliverable")}</td>
          <td>${escapeHtml(formatEvaluationResult(student, evaluation))}</td>
          <td><span class="status-pill ${status.className}">${status.label}</span></td>
        </tr>
      `;
    }).join("");
  }

  function studentGradesMarkup(student, payload) {
    const weightedPayload = payloadWithEvaluations(payload, weightedEvaluations(payload.evaluations));
    return `
      <div class="row g-4">
        <div class="col-lg-5">
          <div class="grades-panel h-100">
            <p class="section-kicker">Individual progress</p>
            <h2 class="section-title">My ${escapeHtml(PAGE_CONFIG.courseTitle)} grades</h2>
            <p class="section-text">Review your current scores only for assessments that have an official course percentage.</p>
            ${studentMetricsMarkup(student, weightedPayload.evaluations)}
          </div>
        </div>
        <div class="col-lg-7">
          <div class="grades-panel h-100">
            <p class="section-kicker">Results</p>
            <h2 class="section-title">Percentage assessments</h2>
            <div class="table-wrap">
              <table class="grades-table">
                <thead><tr><th>Assessment</th><th>Type</th><th>Weight</th><th>Grade</th><th>Status</th></tr></thead>
                <tbody>${studentGradesRows(student, weightedPayload.evaluations) || `<tr><td colspan="5">${escapeHtml(PAGE_CONFIG.emptyAssessmentsMessage)}</td></tr>`}</tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function studentDeliverablesMarkup(student, payload) {
    const deliverables = deliverableEvaluations(payload.evaluations);
    return `
      <div class="grades-panel" data-student-deliverables>
        <p class="section-kicker">Non-percentage work</p>
        <h2 class="section-title">Deliverables and follow-ups</h2>
        <p class="section-text mb-3">These items can show completion, submission or reference feedback, but they do not add percentage to the official course average.</p>
        <div class="table-wrap">
          <table class="grades-table">
            <thead><tr><th>Deliverable</th><th>Type</th><th>Result</th><th>Status</th></tr></thead>
            <tbody>${studentDeliverableRows(student, deliverables) || `<tr><td colspan="4">No non-percentage deliverables have been created for this level yet.</td></tr>`}</tbody>
          </table>
        </div>
      </div>
    `;
  }

  function studentProfileValue(student, field, fallback) {
    const details = student && student.gradeDetails && typeof student.gradeDetails === "object" ? student.gradeDetails : {};
    const profile = details.studentProfile && typeof details.studentProfile === "object" ? details.studentProfile : {};
    return profile[field] || fallback || "";
  }

  function studentProfileMarkup(student, user) {
    return `
      <div class="grades-panel" data-student-profile-panel>
        <p class="section-kicker">Student information</p>
        <h2 class="section-title">My student profile</h2>
        <p class="section-text mb-3">
          Complete this information with your current contact details. It will be saved in the Basic English Course 2 gradebook for future reports.
        </p>
        <form data-student-profile-form>
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label fw-bold" for="studentProfileEmail">Email address</label>
              <input id="studentProfileEmail" class="form-control" type="email" autocomplete="email" data-student-profile-field="email" value="${escapeHtml(studentProfileValue(student, "email", student.email || user.email || ""))}">
            </div>
            <div class="col-md-6">
              <label class="form-label fw-bold" for="studentProfileDocument">ID / Cédula</label>
              <input id="studentProfileDocument" class="form-control" inputmode="numeric" autocomplete="off" data-student-profile-field="documentId" value="${escapeHtml(studentProfileValue(student, "documentId", student.id || ""))}">
            </div>
            <div class="col-md-4">
              <label class="form-label fw-bold" for="studentProfileAge">Age</label>
              <input id="studentProfileAge" class="form-control" type="number" min="0" max="120" step="1" inputmode="numeric" data-student-profile-field="age" value="${escapeHtml(studentProfileValue(student, "age", ""))}">
            </div>
            <div class="col-md-4">
              <label class="form-label fw-bold" for="studentProfilePhone">Phone number</label>
              <input id="studentProfilePhone" class="form-control" type="tel" autocomplete="tel" data-student-profile-field="phone" value="${escapeHtml(studentProfileValue(student, "phone", student.contact || ""))}">
            </div>
            <div class="col-md-4">
              <label class="form-label fw-bold" for="studentProfileBackupPhone">Backup phone</label>
              <input id="studentProfileBackupPhone" class="form-control" type="tel" autocomplete="tel" data-student-profile-field="backupPhone" value="${escapeHtml(studentProfileValue(student, "backupPhone", ""))}">
            </div>
          </div>
          <div class="hero-actions mt-4">
            <button class="btn-main" type="submit"><i class="bi bi-save-fill"></i> Save my profile</button>
          </div>
          <p class="section-text mt-3 mb-0" data-student-profile-status aria-live="polite"></p>
        </form>
      </div>
    `;
  }

  function renderStudentPanel(student, payload, user) {
    const tabs = window.JaraGradebookTabs;
    const hasDeliverables = deliverableEvaluations(payload.evaluations).length > 0;
    const useTabs = tabs && (PAGE_CONFIG.showStudentProfile || hasDeliverables);
    const tabsMarkup = useTabs ? `
      <div class="staff-tabs" data-gradebook-tabs>
        <div class="staff-tab-nav" role="tablist" aria-label="Student gradebook sections">
          ${tabs.button("student-grades", "Grades", "bi-table", { selected: true })}
          ${hasDeliverables ? tabs.button("student-deliverables", "Deliverables", "bi-clipboard-check-fill", { count: deliverableEvaluations(payload.evaluations).length }) : ""}
          ${PAGE_CONFIG.showStudentProfile ? tabs.button("student-profile", "Student profile", "bi-person-vcard-fill") : ""}
        </div>
        ${tabs.panel("student-grades", studentGradesMarkup(student, payload), true)}
        ${hasDeliverables ? tabs.panel("student-deliverables", studentDeliverablesMarkup(student, payload), false) : ""}
        ${PAGE_CONFIG.showStudentProfile ? tabs.panel("student-profile", studentProfileMarkup(student, user), false) : ""}
      </div>
    ` : studentGradesMarkup(student, payload);
    return `
      <div class="privacy-note mb-4">
        <i class="bi bi-shield-check"></i>
        <div>
          <strong>Private student view</strong>
          <p class="mb-0">This page shows only the grades and profile linked to your signed-in email.</p>
          ${authActionsMarkup(user)}
        </div>
      </div>
      ${tabsMarkup}
    `;
  }

  function staffStudentRows(payload) {
    return payload.students.map(function (student) {
      const summary = gradeSummary(student, payload.evaluations);
      const approval = approvalStatus(student, payload.evaluations);
      const gradeCells = payload.evaluations.map(function (evaluation) {
        return `<td>${escapeHtml(formatEvaluationResult(student, evaluation))}</td>`;
      }).join("");
      return `
        <tr data-student-row data-student-search="${escapeHtml((student.fullName + " " + student.email).toLowerCase())}">
          <td>${escapeHtml(student.fullName)}<br><span class="status-pill">${escapeHtml(student.level)}</span></td>
          <td data-email-column>${escapeHtml(student.email || "No email")}</td>
          ${gradeCells}
          <td>${summary.average == null ? "Pending" : summary.average.toFixed(2)}</td>
          <td>${summary.completedWeight}%</td>
          <td><span class="status-pill ${approvalClass(approval)}">${escapeHtml(approval)}</span></td>
        </tr>
      `;
    }).join("");
  }

  function adminGradeInputs(payload) {
    return payload.students.map(function (student) {
      return `
        <label class="admin-grade-row">
          <span>${escapeHtml(student.fullName)}</span>
          <input class="form-control" type="number" min="0" max="5" step="0.1" data-new-grade-student="${escapeHtml(student.id)}" placeholder="0.0 - 5.0">
        </label>
      `;
    }).join("");
  }

  function adminToolsMarkup(payload) {
    return `
      <div class="grades-panel mb-4" data-admin-tools>
        <p class="section-kicker">Administrator</p>
        <h2 class="section-title">Add a new grade</h2>
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
          <div class="admin-grade-grid mt-3">${adminGradeInputs(payload)}</div>
          <p class="section-text mt-3" data-admin-grade-status></p>
        </form>
      </div>
    `;
  }

  function adminStudentGradeInputs(payload, student) {
    const grades = student && student.grades ? student.grades : {};
    return payload.evaluations.map(function (evaluation) {
      const value = typeof grades[evaluation.id] === "number" ? grades[evaluation.id] : "";
      return `
        <label class="admin-grade-row">
          <span>${escapeHtml(evaluation.title)}</span>
          <input class="form-control" type="number" min="0" max="5" step="0.1" value="${escapeHtml(value)}" data-student-grade="${escapeHtml(evaluation.id)}" placeholder="Pending">
        </label>
      `;
    }).join("");
  }

  function adminStudentCards(payload) {
    return payload.students.map(function (student, index) {
      return `
        <details class="admin-student-card mb-3" data-student-editor-card data-student-index="${index}" data-student-search="${escapeHtml([student.fullName, student.email, student.id].join(" ").toLowerCase())}">
          <summary class="d-flex flex-wrap justify-content-between align-items-center gap-2">
            <span><strong>${escapeHtml(student.fullName || "Student")}</strong><br><small>${escapeHtml(student.id || "")}${student.email ? " · " + escapeHtml(student.email) : ""}</small></span>
            <span class="fw-bold text-primary">Open</span>
          </summary>
          <div class="mt-3">
            <label class="form-check fw-bold text-danger mb-3">
              <input class="form-check-input" type="checkbox" data-student-delete>
              Remove this student from this course
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
              <input class="form-control" type="text" inputmode="email" autocomplete="email" value="${escapeHtml(student.email || "")}" data-student-field="email">
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
      <div class="grades-panel mb-4" data-admin-student-tools>
        <p class="section-kicker">Administrator</p>
        <h2 class="section-title">Edit students and grades</h2>
        <p class="section-text mb-3">Change names, IDs, levels, emails and grades. Empty grade fields remain pending.</p>
        <label class="form-label fw-bold w-100 mb-3">Find a student
          <input class="form-control" type="search" data-student-editor-filter placeholder="Name, email or ID">
        </label>
        <form data-edit-students-form novalidate>
          ${adminStudentCards(payload)}
          <details class="admin-student-card mb-3" data-new-student-card>
            <summary class="d-flex flex-wrap justify-content-between align-items-center gap-2">
              <span><strong>Add a student</strong><br><small>Create a new course record</small></span>
              <i class="bi bi-plus-lg" aria-hidden="true"></i>
            </summary>
            <div class="mt-3">
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
                <input class="form-control" value="${escapeHtml((payload.students[0] && payload.students[0].level) || PAGE_CONFIG.courseFullTitle)}" data-new-student-field="level">
              </div>
              <div class="col-md-6">
                <label class="form-label fw-bold">Email</label>
                <input class="form-control" type="text" inputmode="email" autocomplete="email" data-new-student-field="email">
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
          <div class="col-lg-5 d-grid">
            <button class="btn-soft" type="button" data-toggle-email-columns aria-pressed="false">
              <i class="bi bi-eye-slash"></i> Hide email column
            </button>
          </div>
        </div>
      </div>
    `;
  }

  function staffPdfToolsMarkup(payload) {
    if (PAGE_CONFIG.hidePdfReports || payload.role !== "admin" || !window.JaraEnglishGradeReports) return "";
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
      <div class="grades-panel mb-4" data-admin-pdf-tools>
        <p class="section-kicker">PDF reports</p>
        <h2 class="section-title">ITM Plurilingüe downloads</h2>
        <p class="section-text mb-3">Download PDF grade reports separated by level with the ITM Plurilingüe Presupuesto Participativo banner.</p>
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

  function staffDeliverableRows(payload) {
    const deliverables = deliverableEvaluations(payload.evaluations);
    if (!deliverables.length) {
      return `<tr><td colspan="4">No non-percentage deliverables have been created for this level yet.</td></tr>`;
    }
    return payload.students.map(function (student) {
      const cells = deliverables.map(function (evaluation) {
        const status = evaluationStatus(student, evaluation);
        return `<td>${escapeHtml(formatEvaluationResult(student, evaluation))}<br><span class="status-pill ${status.className}">${status.label}</span></td>`;
      }).join("");
      return `
        <tr data-student-row data-student-search="${escapeHtml((student.fullName + " " + student.email).toLowerCase())}">
          <td>${escapeHtml(student.fullName)}<br><span class="status-pill">${escapeHtml(student.level)}</span></td>
          <td data-email-column>${escapeHtml(student.email || "No email")}</td>
          ${cells}
        </tr>
      `;
    }).join("");
  }

  function staffDeliverablesMarkup(payload) {
    const deliverables = deliverableEvaluations(payload.evaluations);
    const headers = deliverables.map(function (evaluation) {
      return `<th>${escapeHtml(evaluation.title)}<br>0%</th>`;
    }).join("");
    return `
      ${staffControlsMarkup()}
      <div class="grades-panel" data-non-percentage-deliverables>
        <p class="section-kicker">Non-percentage work</p>
        <h2 class="section-title">Deliverables and follow-ups</h2>
        <p class="section-text mb-3">This grid is separated from the official percentage gradebook. These items do not affect the course average.</p>
        <div class="table-wrap">
          <table class="grades-table">
            <thead><tr><th>Student</th><th data-email-column>Email</th>${headers}</tr></thead>
            <tbody>${staffDeliverableRows(payload)}</tbody>
          </table>
        </div>
      </div>
    `;
  }

  function staffReportsMarkup(payload) {
    return `
      <div class="grades-panel mb-4" data-staff-reports>
        <p class="section-kicker">Exports and reports</p>
        <h2 class="section-title">Course reports</h2>
        <p class="section-text mb-3">${PAGE_CONFIG.hidePdfReports ? "Download the current gradebook as an Excel file." : "Download the complete gradebook or the official PDF reports available for this level."}</p>
        <button class="btn-main" type="button" data-export-excel><i class="bi bi-file-earmark-spreadsheet"></i> Download Excel</button>
      </div>
      ${staffPdfToolsMarkup(payload)}
    `;
  }

  function staffRosterExportMarkup(payload) {
    return `
      <div class="grades-panel mb-4" data-staff-roster-export>
        <p class="section-kicker">Student roster</p>
        <h2 class="section-title">Basic English Course 2 student list</h2>
        <p class="section-text mb-3">
          Download the current registered roster for this level directly from the Basic English Course 2 gradebook.
          The file includes document/ID, student name, primary email, alternate emails, contact and level.
          No assessments or grade percentages are included.
        </p>
        <button class="btn-main" type="button" data-export-roster-excel>
          <i class="bi bi-file-earmark-spreadsheet"></i> Download current student Excel
        </button>
        <p class="section-text mt-3 mb-0">${escapeHtml(payload.students.length)} students are currently available in the download.</p>
      </div>
    `;
  }

  function renderStaffPanel(payload, user) {
    const tabs = window.JaraGradebookTabs;
    const weightedPayload = payloadWithEvaluations(payload, weightedEvaluations(payload.evaluations));
    const deliverablesPayload = payloadWithEvaluations(payload, deliverableEvaluations(payload.evaluations));
    const headers = weightedPayload.evaluations.map(function (evaluation) {
      return `<th>${escapeHtml(evaluation.title)}<br>${evaluation.weight}%</th>`;
    }).join("");
    const gradebookMarkup = `
      ${staffControlsMarkup()}
      <div class="grades-panel" data-official-gradebook>
        <p class="section-kicker">Private data</p>
        <h2 class="section-title">${escapeHtml(PAGE_CONFIG.courseGradebookTitle)}</h2>
        ${!weightedPayload.evaluations.length ? `<p class="section-text mb-3">${escapeHtml(PAGE_CONFIG.emptyAssessmentsMessage)}</p>` : ""}
        <div class="table-wrap">
          <table class="grades-table">
            <thead><tr><th>Student</th><th data-email-column>Email</th>${headers}<th>Average</th><th>Evaluated</th><th>Aprobado</th></tr></thead>
            <tbody>${staffStudentRows(weightedPayload)}</tbody>
          </table>
        </div>
      </div>
    `;
    const tabButtons = [
      tabs.button("gradebook", "Gradebook", "bi-table", { selected: true }),
      tabs.button("deliverables", "Deliverables", "bi-clipboard-check-fill", { count: deliverablesPayload.evaluations.length }),
      tabs.button("reports", "Reports", "bi-file-earmark-bar-graph-fill")
    ];
    const tabPanels = [
      tabs.panel("gradebook", gradebookMarkup, true),
      tabs.panel("deliverables", staffDeliverablesMarkup(deliverablesPayload), false),
      tabs.panel("reports", staffReportsMarkup(weightedPayload), false)
    ];
    if (PAGE_CONFIG.showRosterExport) {
      tabButtons.push(tabs.button("roster", "Roster", "bi-person-lines-fill", { count: payload.students.length }));
      tabPanels.push(tabs.panel("roster", staffRosterExportMarkup(payload), false));
    }
    if (payload.role === "admin" && !PAGE_CONFIG.disableAdminEditing) {
      tabButtons.push(tabs.button("add-grade", "Add grade", "bi-plus-square-fill"));
      tabButtons.push(tabs.button("students", "Students & grades", "bi-people-fill", { count: payload.students.length }));
      tabPanels.push(tabs.panel("add-grade", adminToolsMarkup(payload), false));
      tabPanels.push(tabs.panel("students", adminStudentEditorMarkup(payload), false));
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
        <div class="metric-card"><span>Percentage assessments</span><strong>${weightedPayload.evaluations.length}</strong></div>
        <div class="metric-card"><span>Deliverables</span><strong>${deliverablesPayload.evaluations.length}</strong></div>
        <div class="metric-card"><span>Course</span><strong>${escapeHtml(PAGE_CONFIG.courseTitle)}</strong></div>
      </div>
      <div class="staff-tabs" data-gradebook-tabs>
        <div class="staff-tab-nav" role="tablist" aria-label="Gradebook administration sections">
          ${tabButtons.join("")}
        </div>
        ${tabPanels.join("")}
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

  function studentProfilePayload(root) {
    const data = {};
    root.querySelectorAll("[data-student-profile-field]").forEach(function (input) {
      data[input.getAttribute("data-student-profile-field")] = input.value.trim();
    });
    return data;
  }

  function saveStudentProfile(user, data) {
    const path = PAGE_CONFIG.studentProfileApiPath;
    if (!path) return Promise.reject(new Error("profile_api_missing"));
    const headers = {
      Authorization: "Bearer " + user.credential,
      "X-Jaralingua-Auth-Provider": user.provider || "google",
      "Content-Type": "application/json"
    };
    const claim = savedStudentIdClaim();
    if (claim) headers["X-Jaralingua-Student-Id-Claim"] = claim;
    return fetch(path, {
      method: "PUT",
      headers: headers,
      body: JSON.stringify(data)
    }).then(function (response) {
      if (!response.ok) throw new Error("The API rejected the profile update: " + response.status);
      return response.json();
    });
  }

  function wireStudentProfile(root, payload, user) {
    const form = root.querySelector("[data-student-profile-form]");
    if (!form) return;
    const status = root.querySelector("[data-student-profile-status]");
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (status) status.textContent = "Saving your profile...";
      saveStudentProfile(user, studentProfilePayload(form))
        .then(function (result) {
          if (result && result.student) payload.student = result.student;
          if (status) status.textContent = "Profile saved. Your information is now updated for Basic English Course 2.";
        })
        .catch(function () {
          if (status) status.textContent = "Could not save your profile. Check the information and try again.";
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

  function excelCell(value) {
    return escapeHtml(value == null ? "" : value);
  }

  function exportExcel(payload) {
    const headers = payload.evaluations.map(function (evaluation) {
      return `<th>${excelCell(evaluation.title + " (" + evaluation.weight + "%)")}</th>`;
    }).join("");
    const rows = payload.students.map(function (student) {
      const summary = gradeSummary(student, payload.evaluations);
      const approval = approvalStatus(student, payload.evaluations);
      const gradeCells = payload.evaluations.map(function (evaluation) {
        return `<td style="text-align:center;">${excelCell(formatEvaluationResult(student, evaluation))}</td>`;
      }).join("");
      return `
        <tr>
          <td>${excelCell(student.id)}</td>
          <td>${excelCell(student.fullName)}</td>
          <td>${excelCell(student.email)}</td>
          ${gradeCells}
          <td style="text-align:center;">${summary.average == null ? "Pending" : summary.average.toFixed(2)}</td>
          <td style="text-align:center;">${summary.completedWeight}%</td>
          <td style="text-align:center;">${excelCell(approval)}</td>
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
            <tr><td class="title" colspan="${payload.evaluations.length + 6}">${excelCell(PAGE_CONFIG.excelTitle)}</td></tr>
            <tr><th>ID</th><th>Student</th><th>Email</th>${headers}<th>Average</th><th>Evaluated</th><th>Aprobado</th></tr>
            ${rows}
          </table>
        </body>
      </html>
    `;
    const blob = new Blob(["\ufeff", html], { type: "application/vnd.ms-excel;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = PAGE_CONFIG.excelFileName;
    document.body.appendChild(link);
    link.click();
    setTimeout(function () {
      URL.revokeObjectURL(link.href);
      link.remove();
    }, 0);
  }

  function exportRosterExcel(payload) {
    const rows = payload.students.map(function (student) {
      const aliases = Array.isArray(student.emailAliases) ? student.emailAliases.join(", ") : "";
      return `
        <tr>
          <td>${excelCell(student.id)}</td>
          <td>${excelCell(student.fullName)}</td>
          <td>${excelCell(student.email)}</td>
          <td>${excelCell(aliases)}</td>
          <td>${excelCell(student.contact || "")}</td>
          <td>${excelCell(student.level || PAGE_CONFIG.courseFullTitle)}</td>
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
            .title { background: #16805f; color: #ffffff; font-size: 18px; font-weight: bold; }
          </style>
        </head>
        <body>
          <table>
            <tr><td class="title" colspan="6">${excelCell(PAGE_CONFIG.rosterExcelTitle)}</td></tr>
            <tr><th>ID / Document</th><th>Student</th><th>Primary email</th><th>Alternate emails</th><th>Contact</th><th>Level</th></tr>
            ${rows}
          </table>
        </body>
      </html>
    `;
    const blob = new Blob(["\ufeff", html], { type: "application/vnd.ms-excel;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = PAGE_CONFIG.rosterExcelFileName;
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
    const rosterButton = root.querySelector("[data-export-roster-excel]");
    if (rosterButton) rosterButton.addEventListener("click", function () {
      exportRosterExcel(payload);
    });
  }

  function wirePdfExport(root, payload) {
    if (!window.JaraEnglishGradeReports) return;
    root.querySelectorAll("[data-download-pdf-audience][data-download-pdf-level]").forEach(function (button) {
      button.addEventListener("click", function () {
        window.JaraEnglishGradeReports.download(
          payload,
          button.dataset.downloadPdfAudience,
          button.dataset.downloadPdfLevel,
          PAGE_CONFIG.reportCourseLabel,
          PAGE_CONFIG.reportFilePrefix,
          { directorDetail: "level" }
        );
      });
    });
  }

  function wireAdminTools(root, payload, user) {
    const form = root.querySelector("[data-add-grade-form]");
    if (!form) return;
    const status = root.querySelector("[data-admin-grade-status]");
    form.addEventListener("submit", function (event) {
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
        .then(function (result) {
          lastSignature = "";
          if (status) status.textContent = "Saved.";
          renderPayload(root, normalizeGradesPayload(result && result.students ? result : nextPayload), user);
        })
        .catch(function () {
          if (status) status.textContent = "Could not save the new grade.";
        });
    });
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
      level: cardField(card, "level") || PAGE_CONFIG.courseFullTitle,
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
      level: newStudentField(card, "level") || PAGE_CONFIG.courseFullTitle,
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
        .then(function (result) {
          lastSignature = "";
          if (status) status.textContent = "Saved.";
          renderPayload(root, normalizeGradesPayload(result && result.students ? result : nextPayload), user);
        })
        .catch(function () {
          if (status) status.textContent = "Could not save student changes.";
        });
    });
  }

  function fetchGrades(user) {
    const claim = savedStudentIdClaim();
    const headers = {
      Authorization: "Bearer " + user.credential,
      "X-Jaralingua-Auth-Provider": user.provider || "google"
    };
    if (claim) headers["X-Jaralingua-Student-Id-Claim"] = claim;
    return fetch(API_PATH, {
      headers: headers
    }).then(function (response) {
      if (!response.ok) throw new Error("The API rejected the request: " + response.status);
      return response.json();
    }).then(function (payload) {
      return normalizeGradesPayload(payload);
    });
  }

  function fetchGradesWithClaimFallback(user) {
    return fetchGrades(user).then(function (payload) {
      if (payload.student || payload.role === "admin" || payload.role === "teacher" || payload.allowStudentIdClaim !== true) {
        return payload;
      }
      if (savedStudentIdClaim()) {
        clearStudentIdClaim();
      }
      const claim = promptStudentIdClaim(user);
      if (!claim) return payload;
      return fetchGrades(user).then(function (retryPayload) {
        if (!retryPayload.student && retryPayload.role !== "admin" && retryPayload.role !== "teacher") {
          clearStudentIdClaim();
        }
        return retryPayload;
      });
    });
  }

  function emailColumnsAreHidden() {
    try {
      return localStorage.getItem(EMAIL_COLUMNS_HIDDEN_KEY) === "1";
    } catch (error) {
      return false;
    }
  }

  function setEmailColumnsHidden(root, hidden) {
    if (!root) return;
    root.classList.toggle("hide-email-columns", !!hidden);
    root.querySelectorAll("[data-toggle-email-columns]").forEach(function (button) {
      button.setAttribute("aria-pressed", hidden ? "true" : "false");
      button.innerHTML = hidden
        ? '<i class="bi bi-eye"></i> Show email column'
        : '<i class="bi bi-eye-slash"></i> Hide email column';
    });
    try {
      localStorage.setItem(EMAIL_COLUMNS_HIDDEN_KEY, hidden ? "1" : "0");
    } catch (error) {}
  }

  function wireEmailColumnToggle(root) {
    setEmailColumnsHidden(root, emailColumnsAreHidden());
    root.querySelectorAll("[data-toggle-email-columns]").forEach(function (button) {
      button.addEventListener("click", function () {
        setEmailColumnsHidden(root, !root.classList.contains("hide-email-columns"));
      });
    });
  }

  function renderPayload(root, payload, user) {
    if (payload.role === "admin" || payload.role === "teacher") {
      root.innerHTML = renderStaffPanel(payload, user);
      window.JaraGradebookTabs.wire(root);
      wireMicrosoftSignout(root);
      wireStudentFilter(root);
      wireEmailColumnToggle(root);
      wireExport(root, payloadWithEvaluations(payload, weightedEvaluations(payload.evaluations)));
      wirePdfExport(root, payloadWithEvaluations(payload, weightedEvaluations(payload.evaluations)));
      wireAdminTools(root, payload, user);
      wireStudentEditor(root, payload, user);
      return;
    }
    root.innerHTML = payload.student ? renderStudentPanel(payload.student, payload, user) : renderNoRecord();
    if (payload.student && window.JaraGradebookTabs) window.JaraGradebookTabs.wire(root);
    if (payload.student) wireStudentProfile(root, payload, user);
    wireMicrosoftSignout(root);
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
      wireLockedActions(root);
      renderInlineGoogleButton(root);
      return;
    }

    root.innerHTML = renderLoading();
    fetchGradesWithClaimFallback(user)
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
