(function () {
  const GOOGLE_KEY = "jaralingua_google_user";
  const MICROSOFT_KEY = "jaralingua_microsoft_user";
  const CONFIG = Object.assign({
    api: "/api/french1/grades",
    rootId: "french1GradesApp",
    levelLabel: "Français Niveau 1",
    gradebookTitle: "Carnet de notes — Niveau 1",
    teacherEmails: ["lcvelasqueza@correo.iue.edu.co", "velasquez.luisac@gmail.com"],
    adminCsvName: "francais-niveau1-administration.csv",
    studentCsvName: "mes-notes-francais1.csv"
  }, window.JARALINGUA_GRADEBOOK_CONFIG || {});
  const API = CONFIG.api;
  const PRONUNCIATION_AUDIO_API = CONFIG.pronunciationAudioApi || API.replace(/\/grades$/, "/pronunciation-audio");
  const LOCAL_KEY = "jaralingua_local_gradebook_user:" + CONFIG.rootId;
  const TEACHERS = CONFIG.teacherEmails.join(", ");
  const MICROSOFT_TENANT_ID = "e1664f47-3c02-4a23-a559-0f33d25d8f86";
  const GOOGLE_CLIENT_ID = (window.JARALINGUA_GOOGLE_CLIENT_ID || "").trim();
  const root = document.getElementById(CONFIG.rootId);
  if (!root) return;
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
    const localUser = storedUser(LOCAL_KEY);
    if (localUser) return Object.assign({ provider: "local" }, localUser);
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

  async function loginCourseAccess(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const status = document.getElementById("courseLoginStatus");
    const button = form.querySelector("button[type='submit']");
    const email = form.querySelector('[name="courseEmail"]').value.trim();
    const password = form.querySelector('[name="coursePassword"]').value;
    if (status) status.textContent = "Vérification du compte du cours…";
    if (button) button.disabled = true;
    try {
      const response = await fetch(API.replace(/\/$/, "") + "/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.token) throw new Error(result.error || "invalid_credentials");
      sessionStorage.setItem(LOCAL_KEY, JSON.stringify({
        provider: "local",
        email: result.user?.email || email,
        name: result.user?.name || email,
        credential: result.token,
        exp: result.exp
      }));
      sessionStorage.removeItem(GOOGLE_KEY);
      sessionStorage.removeItem(MICROSOFT_KEY);
      load();
    } catch {
      if (status) status.textContent = "Courriel ou mot de passe incorrect. Utilisez le courriel inscrit et le mot de passe ID*.";
      if (button) button.disabled = false;
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
        <form id="courseLoginForm" class="mt-4 text-start mx-auto" style="max-width:420px">
          <p class="section-kicker mb-2">Accès du cours</p>
          <label class="form-label fw-bold" for="courseEmail">Courriel inscrit</label>
          <input class="form-control mb-2" id="courseEmail" name="courseEmail" type="email" autocomplete="username" required>
          <label class="form-label fw-bold" for="coursePassword">Mot de passe</label>
          <input class="form-control mb-3" id="coursePassword" name="coursePassword" type="password" autocomplete="current-password" placeholder="ID*" required>
          <button class="btn-main w-100" type="submit"><i class="bi bi-key-fill"></i> Entrer avec le courriel du cours</button>
          <p id="courseLoginStatus" class="mt-2 mb-0"><small>Pour les comptes qui ne peuvent pas utiliser Google ou Microsoft. Mot de passe : numéro ID + astérisque.</small></p>
        </form>
        <p class="mt-3 mb-0"><small>Administrateur : compte Google autorisé · Professeures autorisées : ${esc(TEACHERS)}</small></p>
      </div>`;
    document.getElementById("msLogin").onclick = loginMicrosoft;
    document.getElementById("courseLoginForm").onsubmit = loginCourseAccess;
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

  function gradeSummary(student) {
    let completedWeight = 0;
    let earned = 0;
    payload.evaluations.forEach((evaluation) => {
      const grade = student.grades?.[evaluation.id];
      const weight = Number(evaluation.weight) || 0;
      if (typeof grade !== "number") return;
      completedWeight += weight;
      earned += grade * weight;
    });
    return {
      completedWeight,
      average: completedWeight ? earned / completedWeight : null,
      weightedTotal: earned / 100
    };
  }

  function average(student) {
    const summary = gradeSummary(student);
    return summary.average == null ? "—" : summary.average.toFixed(1);
  }

  function formatSubmittedAt(value) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });
  }

  function pronunciationEvidence(student, evaluation) {
    const details = student && student.gradeDetails && typeof student.gradeDetails === "object"
      ? student.gradeDetails[evaluation.id]
      : null;
    if (!details || typeof details !== "object") return "";
    const hasAudio = details.audio && details.audio.file;
    const submittedAt = formatSubmittedAt(details.submittedAt || details.audio?.uploadedAt);
    const transcript = details.transcript ? `<details class="mt-2"><summary>Transcription reconnue</summary><p class="mb-0">${esc(details.transcript)}</p></details>` : "";
    const reference = details.referenceText ? `<details class="mt-2"><summary>Texte de référence</summary><p class="mb-0">${esc(details.referenceText)}</p></details>` : "";
    const meta = [
      submittedAt ? `Remis : ${submittedAt}` : "",
      Number.isFinite(Number(details.score100)) ? `Score automatique : ${Math.round(Number(details.score100))}/100` : "",
      Number.isFinite(Number(details.grade)) ? `Note envoyée : ${Number(details.grade).toFixed(2)}/5` : ""
    ].filter(Boolean).join(" · ");
    return `
      <div class="pronunciation-audio-review mt-2">
        ${hasAudio ? `
          <button class="btn-soft btn-sm" type="button" data-pronunciation-audio data-student-id="${esc(student.id)}" data-evaluation-id="${esc(evaluation.id)}">
            <i class="bi bi-play-circle"></i> Écouter l'audio remis
          </button>
          <audio controls hidden data-pronunciation-audio-player></audio>
          <p class="mb-0" data-pronunciation-audio-status></p>
        ` : `<p class="mb-0"><small>Aucun fichier audio n'est attaché à cette remise.</small></p>`}
        ${meta ? `<p class="mt-2 mb-0"><small>${esc(meta)}</small></p>` : ""}
        ${transcript}
        ${reference}
      </div>`;
  }

  function totalWeight() {
    return payload.evaluations.reduce((sum, evaluation) => sum + (Number(evaluation.weight) || 0), 0);
  }

  function slug(value) {
    return String(value || "evaluation")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 34) || "evaluation";
  }

  function uniqueEvaluationId(title) {
    const base = slug(title);
    const used = new Set(payload.evaluations.map((evaluation) => evaluation.id));
    if (!used.has(base)) return base;
    let index = 2;
    while (used.has(`${base}-${index}`)) index += 1;
    return `${base}-${index}`;
  }

  function hasDuplicate(values) {
    const seen = new Set();
    return values.some((value) => {
      const key = String(value || "").trim();
      if (!key) return true;
      if (seen.has(key)) return true;
      seen.add(key);
      return false;
    });
  }

  function download(name, rows) {
    const csv = rows.map((row) => row.map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob(["\ufeff" + csv], { type: "text/csv" }));
    link.download = name;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  function collectEvaluations() {
    const evaluations = [];
    root.querySelectorAll("[data-evaluation-card]").forEach((card) => {
      if (card.querySelector("[data-delete-evaluation]")?.checked) return;
      const title = card.querySelector('[data-evaluation-field="title"]')?.value.trim() || "Activité évaluative";
      const type = card.querySelector('[data-evaluation-field="type"]')?.value.trim() || "Évaluation";
      const weightValue = Number(card.querySelector('[data-evaluation-field="weight"]')?.value || 0);
      const date = card.querySelector('[data-evaluation-field="date"]')?.value.trim();
      const displayDate = card.querySelector('[data-evaluation-field="displayDate"]')?.value.trim();
      const description = card.querySelector('[data-evaluation-field="description"]')?.value.trim();
      evaluations.push({
        id: card.dataset.evaluationId,
        title,
        weight: Number.isFinite(weightValue) ? Math.max(0, Math.min(100, Math.round(weightValue * 100) / 100)) : 0,
        type,
        description,
        date: date || null,
        displayDate
      });
    });
    return evaluations;
  }

  function collectStudents() {
    const students = [];
    root.querySelectorAll("[data-student]").forEach((card) => {
      if (card.querySelector("[data-delete-student]")?.checked) return;
      const original = payload.students[Number(card.dataset.student)] || {};
      const studentData = Object.assign({}, original);
      card.querySelectorAll("[data-f]").forEach((input) => { studentData[input.dataset.f] = input.value.trim(); });
      if (!studentData.id || !studentData.fullName) return;
      studentData.level = studentData.level || CONFIG.levelLabel;
      studentData.grades = {};
      card.querySelectorAll("[data-grade]").forEach((input) => {
        const value = input.value.trim();
        if (value === "") return;
        const grade = Number(value);
        if (!Number.isNaN(grade) && grade >= 0 && grade <= 5) studentData.grades[input.dataset.grade] = Math.round(grade * 100) / 100;
      });
      students.push(studentData);
    });
    return students;
  }

  function collectDraft() {
    if (root.querySelector("[data-evaluation-card]")) payload.evaluations = collectEvaluations();
    if (root.querySelector("[data-student]")) payload.students = collectStudents();
  }

  function evaluationEditor() {
    const total = totalWeight();
    const totalClass = Math.abs(total - 100) < 0.01 ? "text-success" : "text-danger";
    return `<section class="grades-editor-panel mb-4">
      <div class="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-3">
        <div>
          <p class="section-kicker">Structure modifiable</p>
          <h3 class="h4 mb-1">Activités évaluatives</h3>
          <p class="mb-0">La professeure peut changer les noms, les pourcentages, les dates, les types et les descriptions. Le total actuel est <strong class="${totalClass}">${total}%</strong>.</p>
        </div>
        <button class="btn-soft" id="addEvaluation" type="button"><i class="bi bi-plus-circle"></i> Ajouter une activité</button>
      </div>
      <div class="evaluation-editor-grid">
        ${payload.evaluations.map((evaluation, index) => `<article class="evaluation-editor-card" data-evaluation-card data-evaluation-id="${esc(evaluation.id)}">
          <div class="d-flex flex-wrap justify-content-between gap-2 mb-2">
            <strong>Évaluation ${index + 1}</strong>
            <label class="form-check text-danger fw-bold mb-0"><input class="form-check-input" type="checkbox" data-delete-evaluation> Supprimer</label>
          </div>
          <div class="row g-2">
            <label class="col-md-6">Nom de l'activité<input class="form-control" data-evaluation-field="title" value="${esc(evaluation.title)}"></label>
            <label class="col-md-3">Pourcentage<input class="form-control" type="number" min="0" max="100" step="0.1" data-evaluation-field="weight" value="${esc(evaluation.weight)}"></label>
            <label class="col-md-3">Type<input class="form-control" data-evaluation-field="type" value="${esc(evaluation.type || "")}" placeholder="Oral, lecture..."></label>
            <label class="col-md-4">Date technique<input class="form-control" type="date" data-evaluation-field="date" value="${esc(evaluation.date || "")}"></label>
            <label class="col-md-8">Date visible<input class="form-control" data-evaluation-field="displayDate" value="${esc(evaluation.displayDate || "")}" placeholder="Semaine 4, 12 mars..."></label>
            <label class="col-12">Description<textarea class="form-control" rows="2" data-evaluation-field="description">${esc(evaluation.description || "")}</textarea></label>
          </div>
        </article>`).join("")}
      </div>
    </section>`;
  }

  function staff() {
    const activeUser = user();
    root.innerHTML = `<div class="d-flex flex-wrap justify-content-between gap-2 mb-4"><div><p class="section-kicker">Espace ${payload.role === "admin" ? "administrateur" : "enseignant"}</p><h2>${esc(CONFIG.gradebookTitle)}</h2><p>${esc(activeUser.email)} · ${esc(activeUser.provider)}</p><p class="mb-0"><small>Professeures responsables : ${esc(TEACHERS)}. L'administrateur conserve un accès complet de supervision.</small></p></div><div class="d-flex flex-wrap gap-2"><button class="btn-soft" id="addStudent" type="button">Ajouter un étudiant</button><button class="btn-soft" id="adminCsv" type="button">Téléchargement administratif</button><button class="btn-main" id="saveGrades" type="button">Enregistrer tout</button></div></div>${evaluationEditor()}<div class="d-flex flex-wrap justify-content-between align-items-end gap-2"><div><p class="section-kicker">Saisie des notes</p><h3 class="h4 mb-0">Étudiants</h3></div><p id="gradeStatus" class="mb-0 fw-bold"></p></div><div id="studentCards" class="mt-3"></div>`;
    drawStudents();
    const showDraftTotal = () => {
      const total = Array.from(root.querySelectorAll("[data-evaluation-card]")).reduce((sum, card) => {
        if (card.querySelector("[data-delete-evaluation]")?.checked) return sum;
        return sum + (Number(card.querySelector('[data-evaluation-field="weight"]')?.value) || 0);
      }, 0);
      const status = document.getElementById("gradeStatus");
      if (status) status.textContent = `Total provisoire des pourcentages : ${Math.round(total * 100) / 100}%`;
    };
    root.querySelectorAll("[data-evaluation-field], [data-delete-evaluation]").forEach((field) => {
      field.addEventListener("input", showDraftTotal);
      field.addEventListener("change", showDraftTotal);
    });
    document.getElementById("addEvaluation").onclick = () => {
      collectDraft();
      const title = "Nouvelle activité évaluative";
      payload.evaluations.push({ id: uniqueEvaluationId(title), title, weight: 0, type: "Évaluation", description: "", date: null, displayDate: "" });
      staff();
    };
    document.getElementById("addStudent").onclick = () => {
      collectDraft();
      payload.students.push({ id: String(Date.now()).slice(-8), fullName: "Nouvel étudiant", email: "", level: CONFIG.levelLabel, grades: {} });
      staff();
    };
    document.getElementById("adminCsv").onclick = () => {
      collectDraft();
      download(CONFIG.adminCsvName, [
        ["ID", "Nom", "Courriel", ...payload.evaluations.map((evaluation) => `${evaluation.title} (${evaluation.weight}%)`), "Moyenne"],
        ...payload.students.map((student) => [student.id, student.fullName, student.email, ...payload.evaluations.map((evaluation) => student.grades?.[evaluation.id] ?? ""), average(student)])
      ]);
    };
    document.getElementById("saveGrades").onclick = save;
  }

  function drawStudents() {
    const holder = document.getElementById("studentCards");
    if (!payload.students.length) {
      holder.innerHTML = `<div class="locked-card"><i class="bi bi-person-plus-fill"></i><h3>Aucun étudiant enregistré</h3><p>Ajoutez le premier étudiant, puis enregistrez le carnet.</p></div>`;
      return;
    }
    const cards = payload.students.map((student, index) => {
      const gradeInputs = payload.evaluations.map((evaluation) => `
        <div class="admin-grade-row-wrap">
          <label class="admin-grade-row"><span>${esc(evaluation.title)} (${evaluation.weight}%)</span><input class="form-control gradebook-grade-input" type="number" min="0" max="5" step="0.1" data-grade="${esc(evaluation.id)}" value="${student.grades?.[evaluation.id] ?? ""}" placeholder="—"></label>
          ${pronunciationEvidence(student, evaluation)}
        </div>`).join("");
      return `<details class="admin-student-card mb-3" data-student="${index}" data-student-row data-student-search="${esc(`${student.fullName || ""} ${student.email || ""} ${student.id || ""}`.toLowerCase())}">
        <summary class="d-flex flex-wrap justify-content-between align-items-center gap-2">
          <span><strong>${esc(student.fullName || "Étudiant")}</strong><br><small>${esc(student.id || "")}${student.email ? " · " + esc(student.email) : ""}</small></span>
          <span class="fw-bold text-primary">Ouvrir</span>
        </summary>
        <div class="mt-3">
          <label class="form-check text-danger fw-bold mb-3"><input class="form-check-input" type="checkbox" data-delete-student> Supprimer</label>
          <div class="row g-2">
            <label class="col-md-2">ID<input class="form-control gradebook-id-input" data-f="id" value="${esc(student.id)}"></label>
            <label class="col-md-3">Nom<input class="form-control gradebook-name-input" data-f="fullName" value="${esc(student.fullName)}"></label>
            <label class="col-md-3">Courriel<input class="form-control gradebook-email-input" type="email" data-f="email" value="${esc(student.email)}"></label>
            <label class="col-md-2">Contact<input class="form-control gradebook-contact-input" data-f="contact" value="${esc(student.contact || "")}"></label>
            <label class="col-md-2">Niveau<input class="form-control gradebook-level-input" data-f="level" value="${esc(student.level || CONFIG.levelLabel)}"></label>
          </div>
          <div class="admin-grade-grid mt-3">${gradeInputs}</div>
          <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-3">
            <strong>Moyenne : ${average(student)}</strong>
            <button type="button" class="btn-soft btn-sm" data-export="${index}">Fiche CSV</button>
          </div>
        </div>
      </details>`;
    }).join("");
    holder.innerHTML = `<div class="grades-panel"><div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3"><div><p class="section-kicker mb-1">Carnet de groupe</p><h4 class="h5 mb-0">${payload.students.length} étudiant${payload.students.length > 1 ? "s" : ""} · ${payload.evaluations.length} activité${payload.evaluations.length > 1 ? "s" : ""}</h4></div><label class="gradebook-filter">Filtrer<input class="form-control" type="search" data-student-filter placeholder="Nom, courriel ou ID"></label></div>${cards}<p class="section-text mt-3 mb-0">Les champs vides restent en attente. Les notes doivent être comprises entre 0 et 5. Après modification, utilisez <strong>Enregistrer tout</strong>.</p></div>`;
    const filter = holder.querySelector("[data-student-filter]");
    filter?.addEventListener("input", () => {
      const query = filter.value.trim().toLowerCase();
      holder.querySelectorAll("[data-student-row]").forEach((row) => {
        row.hidden = query && !(row.getAttribute("data-student-search") || "").includes(query);
      });
    });
    holder.querySelectorAll("[data-export]").forEach((button) => {
      button.onclick = () => {
        collectDraft();
        const student = payload.students[Number(button.dataset.export)];
        download(`fiche-${student.id}.csv`, [
          ["Évaluation", "Note"],
          ...payload.evaluations.map((evaluation) => [evaluation.title, student.grades?.[evaluation.id] ?? ""]),
          ["Moyenne", average(student)]
        ]);
      };
    });
    bindPronunciationAudio(holder);
  }

  function bindPronunciationAudio(scope) {
    scope.querySelectorAll("[data-pronunciation-audio]").forEach((button) => {
      button.onclick = async () => {
        const wrapper = button.closest(".pronunciation-audio-review");
        const player = wrapper && wrapper.querySelector("[data-pronunciation-audio-player]");
        const status = wrapper && wrapper.querySelector("[data-pronunciation-audio-status]");
        if (!player || !status) return;
        button.disabled = true;
        status.textContent = "Chargement de l'audio...";
        try {
          const response = await fetch(PRONUNCIATION_AUDIO_API + "?studentId=" + encodeURIComponent(button.dataset.studentId || "") + "&evaluationId=" + encodeURIComponent(button.dataset.evaluationId || ""), {
            headers: headers()
          });
          if (!response.ok) throw new Error("audio_unavailable");
          const blob = await response.blob();
          if (player.dataset.objectUrl) URL.revokeObjectURL(player.dataset.objectUrl);
          const objectUrl = URL.createObjectURL(blob);
          player.dataset.objectUrl = objectUrl;
          player.src = objectUrl;
          player.hidden = false;
          await player.play().catch(() => {});
          status.textContent = "Audio disponible pour réécoute.";
        } catch (_error) {
          status.textContent = "Audio indisponible. Vérifiez que la remise contient bien un fichier.";
        } finally {
          button.disabled = false;
        }
      };
    });
  }

  async function save() {
    collectDraft();
    const status = document.getElementById("gradeStatus");
    if (hasDuplicate(payload.evaluations.map((evaluation) => evaluation.id))) {
      if (status) status.textContent = "Chaque activité évaluative doit avoir un identifiant unique.";
      return;
    }
    if (hasDuplicate(payload.students.map((studentData) => studentData.id))) {
      if (status) status.textContent = "Chaque étudiant doit avoir un ID unique.";
      return;
    }
    if (status) status.textContent = "Enregistrement en cours...";
    const response = await fetch(API, { method: "PUT", headers: headers(), body: JSON.stringify(payload) });
    if (!response.ok) {
      if (status) status.textContent = "Les modifications n'ont pas pu être enregistrées.";
      return alert("Les modifications n'ont pas pu être enregistrées.");
    }
    if (status) status.textContent = "Carnet de notes enregistré.";
    alert("Carnet de notes enregistré.");
    load();
  }

  function student() {
    const studentData = payload.student;
    if (!studentData) return locked("Votre compte est connecté, mais aucun étudiant ne correspond encore à ce courriel. La professeure peut l’ajouter dans son espace.");
    root.innerHTML = `<p class="section-kicker">Mes résultats</p><h2>${esc(CONFIG.levelLabel)}</h2><div class="metric-grid"><div class="metric-card"><span>Moyenne</span><strong>${average(studentData)}</strong></div><div class="metric-card"><span>Évaluations</span><strong>${payload.evaluations.length}</strong></div></div><div class="table-wrap mt-4"><table class="grades-table"><thead><tr><th>Évaluation</th><th>Poids</th><th>Note</th></tr></thead><tbody>${payload.evaluations.map((evaluation) => `<tr><td>${esc(evaluation.title)}</td><td>${evaluation.weight}%</td><td>${studentData.grades?.[evaluation.id] ?? "En attente"}</td></tr>`).join("")}</tbody></table></div><button class="btn-main mt-3" id="studentCsv">Télécharger ma fiche</button>`;
    document.getElementById("studentCsv").onclick = () => download(CONFIG.studentCsvName, [
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
