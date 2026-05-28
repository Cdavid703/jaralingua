(function () {
  const GOOGLE_USER_KEY = "jaralingua_google_user";
  const MICROSOFT_USER_KEY = "jaralingua_microsoft_user";
  const API_PATH = "/api/basic/grades";
  const GOOGLE_CLIENT_ID = (window.JARALINGUA_GOOGLE_CLIENT_ID || "").trim();
  const MICROSOFT_CLIENT_ID = "4e729f8a-d101-4c5d-af68-609d749bc95a";
  const MICROSOFT_TENANT_ID = "e1664f47-3c02-4a23-a559-0f33d25d8f86";
  const MICROSOFT_SCOPES = ["User.Read"];

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
        authority: "https://login.microsoftonline.com/" + MICROSOFT_TENANT_ID,
        redirectUri: window.location.origin + "/ingles/basico/notas.html"
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
          Sign in with your Google or Microsoft account to see only your own Basic English grades.
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
          Your signed-in email is not linked to a Basic English student record yet. Contact the teacher to review the email in the grade list.
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

  function renderStudentPanel(student, payload, user) {
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

  function renderStaffPanel(payload, user) {
    const headers = payload.evaluations.map(function (evaluation) {
      return `<th>${escapeHtml(evaluation.title)}<br>${evaluation.weight}%</th>`;
    }).join("");
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
      wireMicrosoftSignout(root);
      return;
    }
    root.innerHTML = payload.student ? renderStudentPanel(payload.student, payload, user) : renderNoRecord();
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
