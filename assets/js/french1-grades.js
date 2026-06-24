(function () {
  const GOOGLE_KEY = "jaralingua_google_user";
  const MICROSOFT_KEY = "jaralingua_microsoft_user";
  const API = "/api/french1/grades";
  const TEACHER = "lcvelasqueza@correo.iue.edu.co";
  const MICROSOFT_TENANT_ID = "e1664f47-3c02-4a23-a559-0f33d25d8f86";
  const GOOGLE_CLIENT_ID = (window.JARALINGUA_GOOGLE_CLIENT_ID || "").trim();
  const root = document.getElementById("french1GradesApp");
  let client = null;
  let payload = null;

  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);

  function storedUser(key) {
    try {
      const saved = JSON.parse(sessionStorage.getItem(key) || "null");
      if (!saved || !saved.credential || saved.exp <= Date.now() / 1000) {
        sessionStorage.removeItem(key);
        return null;
      }
      return saved;
    } catch {
      sessionStorage.removeItem(key);
      return null;
    }
  }

  function user() {
    const googleUser = storedUser(GOOGLE_KEY);
    if (googleUser) return Object.assign({ provider: "google" }, googleUser);
    const microsoftUser = storedUser(MICROSOFT_KEY);
    if (microsoftUser) return Object.assign({ provider: "microsoft" }, microsoftUser);
    return null;
  }

  function headers() {
    const activeUser = user();
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${activeUser.credential}`,
      "X-Jaralingua-Auth-Provider": activeUser.provider || "google"
    };
  }

  function decodeJwt(token) {
    const payloadPart = token.split(".")[1];
    const base64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64).split("").map((char) => "%" + ("00" + char.charCodeAt(0).toString(16)).slice(-2)).join("")
    );
    return JSON.parse(json);
  }

  function authApp() {
    if (!client) {
      client = new msal.PublicClientApplication({
        auth: {
          clientId: window.JARALINGUA_MICROSOFT_CLIENT_ID || "4e729f8a-d101-4c5d-af68-609d749bc95a",
          authority: "https://login.microsoftonline.com/" + MICROSOFT_TENANT_ID,
          redirectUri: location.origin + location.pathname
        },
        cache: { cacheLocation: "sessionStorage" }
      });
    }
    return client;
  }

  async function loginMicrosoft() {
    try {
      root.innerHTML = "<p>Connexion Microsoft…</p>";
      const app = authApp();
      const result = await app.loginPopup({ scopes: ["User.Read"], prompt: "select_account" });
      const token = await app.acquireTokenSilent({ scopes: ["User.Read"], account: result.account })
        .catch(() => app.acquireTokenPopup({ scopes: ["User.Read"], account: result.account }));
      sessionStorage.setItem(MICROSOFT_KEY, JSON.stringify({
        provider: "microsoft",
        email: result.account.username,
        name: result.account.name,
        credential: token.accessToken,
        exp: Math.floor(token.expiresOn.getTime() / 1000)
      }));
      sessionStorage.removeItem(GOOGLE_KEY);
      load();
    } catch {
      locked("La connexion Microsoft n’a pas abouti. Réessayez.");
    }
  }

  function loginGoogle(response) {
    try {
      const profile = decodeJwt(response.credential);
      sessionStorage.setItem(GOOGLE_KEY, JSON.stringify({
        provider: "google",
        sub: profile.sub,
        email: profile.email,
        name: profile.name || profile.email,
        picture: profile.picture || "",
        credential: response.credential,
        exp: profile.exp
      }));
      sessionStorage.removeItem(MICROSOFT_KEY);
      load();
    } catch {
      locked("La connexion Google n’a pas abouti. Réessayez.");
    }
  }

  function renderGoogleButton(attempt = 0) {
    const target = document.getElementById("googleLogin");
    const status = document.getElementById("googleStatus");
    if (!target) return;
    if (!GOOGLE_CLIENT_ID) {
      if (status) status.textContent = "Google Client ID n’est pas configuré.";
      return;
    }
    if (!(window.google && window.google.accounts && window.google.accounts.id)) {
      if (attempt < 30) return setTimeout(() => renderGoogleButton(attempt + 1), 250);
      if (status) status.textContent = "Google n’a pas pu se charger. Rechargez la page.";
      return;
    }
    target.innerHTML = "";
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: loginGoogle,
      auto_select: false,
      cancel_on_tap_outside: false
    });
    window.google.accounts.id.renderButton(target, {
      type: "standard",
      theme: "outline",
      size: "large",
      text: "signin_with",
      shape: "pill",
      width: 280
    });
    if (status) status.textContent = "";
  }

  function locked(message = "Connectez-vous avec un compte autorisé pour consulter ou modifier les notes.") {
    root.innerHTML = `
      <div class="locked-card">
        <i class="bi bi-shield-lock-fill"></i>
        <h2>Connexion requise</h2>
        <p>${esc(message)}</p>
        <div class="d-flex flex-wrap justify-content-center gap-3 mt-4">
          <div>
            <div id="googleLogin"></div>
            <p id="googleStatus" class="mt-2 mb-0"><small></small></p>
          </div>
          <button class="btn-main" id="msLogin" type="button"><i class="bi bi-microsoft"></i> Se connecter avec Microsoft</button>
        </div>
        <p class="mt-3 mb-0"><small>Administrateur : compte Google autorisé · Professeure autorisée : ${TEACHER}</small></p>
      </div>`;
    document.getElementById("msLogin").onclick = loginMicrosoft;
    renderGoogleButton();
  }

  async function load() {
    if (!user()) return locked();
    root.innerHTML = "<p>Chargement…</p>";
    try {
      const response = await fetch(API, { headers: headers() });
      if (!response.ok) throw new Error(response.status);
      payload = await response.json();
      render();
    } catch {
      locked("Impossible de charger le carnet de notes. Vérifiez la session et le service.");
    }
  }

  function average(student) {
    const values = payload.evaluations.map((evaluation) => student.grades?.[evaluation.id])
      .filter((grade) => typeof grade === "number");
    return values.length ? (values.reduce((sum, grade) => sum + grade, 0) / values.length).toFixed(1) : "—";
  }

  function download(name, rows) {
    const csv = rows.map((row) => row.map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob(["\ufeff" + csv], { type: "text/csv" }));
    link.download = name;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  function staff() {
    const activeUser = user();
    root.innerHTML = `<div class="d-flex flex-wrap justify-content-between gap-2"><div><p class="section-kicker">Espace ${payload.role === "admin" ? "administrateur" : "enseignant"}</p><h2>Carnet de notes — Niveau 1</h2><p>${esc(activeUser.email)} · ${esc(activeUser.provider)}</p></div><div class="d-flex flex-wrap gap-2"><button class="btn-soft" id="addStudent">Ajouter un étudiant</button><button class="btn-soft" id="adminCsv">Téléchargement administratif</button><button class="btn-main" id="saveGrades">Enregistrer tout</button></div></div><div id="studentCards" class="mt-4"></div>`;
    drawStudents();
    document.getElementById("addStudent").onclick = () => {
      payload.students.push({ id: String(Date.now()).slice(-8), fullName: "Nouvel étudiant", email: "", level: "Français Niveau 1", grades: {} });
      drawStudents();
    };
    document.getElementById("adminCsv").onclick = () => download("francais-niveau1-administration.csv", [
      ["ID", "Nom", "Courriel", ...payload.evaluations.map((evaluation) => evaluation.title), "Moyenne"],
      ...payload.students.map((student) => [student.id, student.fullName, student.email, ...payload.evaluations.map((evaluation) => student.grades?.[evaluation.id] ?? ""), average(student)])
    ]);
    document.getElementById("saveGrades").onclick = save;
  }

  function drawStudents() {
    document.getElementById("studentCards").innerHTML = payload.students.map((student, index) => `<article class="admin-student-card mb-3" data-student="${index}"><div class="row g-2"><label class="col-md-2">ID<input class="form-control" data-f="id" value="${esc(student.id)}"></label><label class="col-md-4">Nom<input class="form-control" data-f="fullName" value="${esc(student.fullName)}"></label><label class="col-md-4">Courriel<input class="form-control" type="email" data-f="email" value="${esc(student.email)}"></label><div class="col-md-2 d-flex align-items-end"><button type="button" class="btn-soft w-100" data-export="${index}">Fiche CSV</button></div></div><div class="admin-grade-grid mt-3">${payload.evaluations.map((evaluation) => `<label class="admin-grade-row"><span>${esc(evaluation.title)} (${evaluation.weight}%)</span><input class="form-control" type="number" min="0" max="5" step="0.1" data-grade="${evaluation.id}" value="${student.grades?.[evaluation.id] ?? ""}"></label>`).join("")}</div></article>`).join("");
    root.querySelectorAll("[data-export]").forEach((button) => {
      button.onclick = () => {
        const student = payload.students[Number(button.dataset.export)];
        download(`fiche-${student.id}.csv`, [
          ["Évaluation", "Note"],
          ...payload.evaluations.map((evaluation) => [evaluation.title, student.grades?.[evaluation.id] ?? ""]),
          ["Moyenne", average(student)]
        ]);
      };
    });
  }

  async function save() {
    root.querySelectorAll("[data-student]").forEach((card) => {
      const student = payload.students[Number(card.dataset.student)];
      card.querySelectorAll("[data-f]").forEach((input) => { student[input.dataset.f] = input.value.trim(); });
      student.level = "Français Niveau 1";
      student.grades = {};
      card.querySelectorAll("[data-grade]").forEach((input) => {
        if (input.value !== "") student.grades[input.dataset.grade] = Number(input.value);
      });
    });
    const response = await fetch(API, { method: "PUT", headers: headers(), body: JSON.stringify(payload) });
    if (!response.ok) return alert("Les modifications n’ont pas pu être enregistrées.");
    alert("Carnet de notes enregistré.");
  }

  function student() {
    const studentData = payload.student;
    if (!studentData) return locked("Votre compte est connecté, mais aucun étudiant ne correspond encore à ce courriel. La professeure peut l’ajouter dans son espace.");
    root.innerHTML = `<p class="section-kicker">Mes résultats</p><h2>Français Niveau 1</h2><div class="metric-grid"><div class="metric-card"><span>Moyenne</span><strong>${average(studentData)}</strong></div><div class="metric-card"><span>Évaluations</span><strong>${payload.evaluations.length}</strong></div></div><div class="table-wrap mt-4"><table class="grades-table"><thead><tr><th>Évaluation</th><th>Poids</th><th>Note</th></tr></thead><tbody>${payload.evaluations.map((evaluation) => `<tr><td>${esc(evaluation.title)}</td><td>${evaluation.weight}%</td><td>${studentData.grades?.[evaluation.id] ?? "En attente"}</td></tr>`).join("")}</tbody></table></div><button class="btn-main mt-3" id="studentCsv">Télécharger ma fiche</button>`;
    document.getElementById("studentCsv").onclick = () => download("mes-notes-francais1.csv", [
      ["Évaluation", "Poids", "Note"],
      ...payload.evaluations.map((evaluation) => [evaluation.title, evaluation.weight, studentData.grades?.[evaluation.id] ?? ""])
    ]);
  }

  function render() {
    if (payload.role === "admin" || payload.role === "teacher") staff();
    else student();
  }

  load();
})();
