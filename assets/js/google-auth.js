(function () {
  const USER_KEY = "jaralingua_google_user";
  const CONFIG_KEY = "JARALINGUA_GOOGLE_CLIENT_ID";
  const FALLBACK_CLIENT_ID = "";
  const DOWNLOAD_FUNCTIONS = [
    "downloadTranscriptPdf",
    "downloadPageSummaryPdf",
    "downloadWorksheetPdfFromPage"
  ];
  const ACTIVITY_FIELD_SELECTOR = "input, textarea, select, [contenteditable]";
  const IGNORED_ACTIVITY_TYPES = {
    button: true,
    file: true,
    hidden: true,
    image: true,
    password: true,
    reset: true,
    submit: true
  };
  const ADMIN_EMAILS = ["cdavid.jaramillo@gmail.com"];
  const ROLE_REQUESTS_KEY = "jaralingua_role_requests";

  const labels = {
    es: {
      signIn: "Iniciar sesi\u00f3n",
      signOut: "Cerrar sesi\u00f3n",
      title: "Acceso con Google",
      configured: "El acceso se activar\u00e1 cuando configures el Client ID de Google.",
      hint: "Edita assets/js/google-auth-config.js y pega el Client ID web.",
      account: "Cuenta activa",
      close: "Cerrar",
      studentSpace: "Mi espacio JaraLingua",
      continue: "Continuar",
      noLastPage: "A\u00fan no hay una \u00faltima p\u00e1gina guardada.",
      courses: "Mis cursos",
      progress: "Mi progreso",
      downloads: "Descargas",
      protectedDownloads: "Las descargas est\u00e1n disponibles con sesi\u00f3n iniciada.",
      downloadsReady: "Descargas habilitadas para tu cuenta.",
      currentPage: "P\u00e1gina actual",
      pending: "Pendiente",
      inProgress: "En progreso",
      completed: "Completada",
      pages: "p\u00e1ginas vistas",
      completedPages: "completadas",
      activeCourse: "curso activo",
      markPending: "Marcar pendiente",
      markInProgress: "Marcar en progreso",
      markCompleted: "Marcar completada",
      loginNeeded: "Inicia sesi\u00f3n con Google para usar esta descarga.",
      savedHere: "Progreso guardado en este navegador.",
      viewDashboard: "Abrir panel",
      activityAutosave: "Respuestas guardadas",
      autosaveActive: "Las respuestas de esta p\u00e1gina se guardan autom\u00e1ticamente.",
      savedAnswers: "campos guardados",
      clearAnswers: "Borrar respuestas",
      answersCleared: "Respuestas guardadas borradas.",
      adminPanel: "Panel de administrador",
      pendingRoleRequests: "Solicitudes pendientes",
      noPendingRequests: "No hay solicitudes pendientes.",
      approveAsStudent: "Aceptar estudiante",
      approveAsTeacher: "Aceptar profesor",
      approved: "Solicitud aprobada.",
      chooseRole: "Elige tu rol",
      chooseRoleText: "Selecciona si entrar\u00e1s como estudiante o profesor. El administrador revisar\u00e1 tu solicitud.",
      studentRole: "Estudiante",
      teacherRole: "Profesor",
      adminRole: "Administrador",
      requestStudent: "Soy estudiante",
      requestTeacher: "Soy profesor",
      rolePending: "Solicitud de rol pendiente de aprobaci\u00f3n.",
      roleApproved: "Rol aprobado",
      roleRequestSent: "Solicitud enviada al administrador.",
      studentAccessReady: "Acceso de estudiante activo.",
      teacherPendingStudentAccess: "Solicitud de profesor pendiente. Mientras se aprueba, tienes acceso como estudiante.",
      teacherApproved: "Panel de profesor aprobado.",
      googleLoading: "Cargando boton de Google...",
      googleUnavailable: "No se pudo cargar el boton de Google. Revisa que este dominio este autorizado en Google Cloud y recarga la pagina.",
      googleScriptUnavailable: "No se pudo cargar el script de Google. Prueba sin bloqueadores o en una ventana incognito.",
      googleOriginRejected: "Google cargo, pero no permitio mostrar el boton. Autoriza este origen en Google Cloud: "
    },
    fr: {
      signIn: "Connexion",
      signOut: "D\u00e9connexion",
      title: "Connexion avec Google",
      configured: "La connexion sera active apr\u00e8s configuration du Client ID Google.",
      hint: "Modifiez assets/js/google-auth-config.js et collez le Client ID web.",
      account: "Compte actif",
      close: "Fermer",
      studentSpace: "Mon espace JaraLingua",
      continue: "Continuer",
      noLastPage: "Aucune derni\u00e8re page n'est encore enregistr\u00e9e.",
      courses: "Mes cours",
      progress: "Mon progr\u00e8s",
      downloads: "T\u00e9l\u00e9chargements",
      protectedDownloads: "Les t\u00e9l\u00e9chargements sont disponibles avec une session active.",
      downloadsReady: "T\u00e9l\u00e9chargements activ\u00e9s pour votre compte.",
      currentPage: "Page actuelle",
      pending: "En attente",
      inProgress: "En cours",
      completed: "Termin\u00e9e",
      pages: "pages vues",
      completedPages: "termin\u00e9es",
      activeCourse: "cours actif",
      markPending: "Marquer en attente",
      markInProgress: "Marquer en cours",
      markCompleted: "Marquer termin\u00e9e",
      loginNeeded: "Connectez-vous avec Google pour utiliser ce t\u00e9l\u00e9chargement.",
      savedHere: "Progr\u00e8s enregistr\u00e9 dans ce navigateur.",
      viewDashboard: "Ouvrir le panneau",
      activityAutosave: "R\u00e9ponses enregistr\u00e9es",
      autosaveActive: "Les r\u00e9ponses de cette page sont enregistr\u00e9es automatiquement.",
      savedAnswers: "champs enregistr\u00e9s",
      clearAnswers: "Effacer les r\u00e9ponses",
      answersCleared: "R\u00e9ponses enregistr\u00e9es effac\u00e9es.",
      adminPanel: "Panneau administrateur",
      pendingRoleRequests: "Demandes en attente",
      noPendingRequests: "Aucune demande en attente.",
      approveAsStudent: "Accepter \u00e9tudiant",
      approveAsTeacher: "Accepter professeur",
      approved: "Demande approuv\u00e9e.",
      chooseRole: "Choisissez votre r\u00f4le",
      chooseRoleText: "Indiquez si vous entrez comme \u00e9tudiant ou professeur. L'administrateur examinera votre demande.",
      studentRole: "\u00c9tudiant",
      teacherRole: "Professeur",
      adminRole: "Administrateur",
      requestStudent: "Je suis \u00e9tudiant",
      requestTeacher: "Je suis professeur",
      rolePending: "Demande de r\u00f4le en attente d'approbation.",
      roleApproved: "R\u00f4le approuv\u00e9",
      roleRequestSent: "Demande envoy\u00e9e \u00e0 l'administrateur.",
      studentAccessReady: "Acc\u00e8s \u00e9tudiant actif.",
      teacherPendingStudentAccess: "Demande de professeur en attente. En attendant, vous avez acc\u00e8s comme \u00e9tudiant.",
      teacherApproved: "Panneau professeur approuv\u00e9.",
      googleLoading: "Chargement du bouton Google...",
      googleUnavailable: "Impossible de charger le bouton Google. Verifiez que ce domaine est autorise dans Google Cloud, puis rechargez la page.",
      googleScriptUnavailable: "Impossible de charger le script Google. Essayez sans bloqueurs ou dans une fenetre privee.",
      googleOriginRejected: "Google est charge, mais n'a pas autorise le bouton. Autorisez cette origine dans Google Cloud : "
    },
    en: {
      signIn: "Sign in",
      signOut: "Sign out",
      title: "Sign in with Google",
      configured: "Google sign-in will work after the Google Client ID is configured.",
      hint: "Edit assets/js/google-auth-config.js and paste the web Client ID.",
      account: "Active account",
      close: "Close",
      studentSpace: "My JaraLingua Space",
      continue: "Continue",
      noLastPage: "No last page has been saved yet.",
      courses: "My courses",
      progress: "My progress",
      downloads: "Downloads",
      protectedDownloads: "Downloads are available after sign-in.",
      downloadsReady: "Downloads enabled for your account.",
      currentPage: "Current page",
      pending: "Pending",
      inProgress: "In progress",
      completed: "Completed",
      pages: "pages viewed",
      completedPages: "completed",
      activeCourse: "active course",
      markPending: "Mark pending",
      markInProgress: "Mark in progress",
      markCompleted: "Mark completed",
      loginNeeded: "Sign in with Google to use this download.",
      savedHere: "Progress saved in this browser.",
      viewDashboard: "Open panel",
      activityAutosave: "Saved answers",
      autosaveActive: "Answers on this page are saved automatically.",
      savedAnswers: "saved fields",
      clearAnswers: "Clear answers",
      answersCleared: "Saved answers cleared.",
      adminPanel: "Admin panel",
      pendingRoleRequests: "Pending requests",
      noPendingRequests: "No pending requests.",
      approveAsStudent: "Approve student",
      approveAsTeacher: "Approve teacher",
      approved: "Request approved.",
      chooseRole: "Choose your role",
      chooseRoleText: "Select whether you are joining as a student or teacher. The administrator will review your request.",
      studentRole: "Student",
      teacherRole: "Teacher",
      adminRole: "Administrator",
      requestStudent: "I am a student",
      requestTeacher: "I am a teacher",
      rolePending: "Role request pending approval.",
      roleApproved: "Approved role",
      roleRequestSent: "Request sent to the administrator.",
      studentAccessReady: "Student access active.",
      teacherPendingStudentAccess: "Teacher request pending. While approved, you have student access.",
      teacherApproved: "Teacher panel approved.",
      googleLoading: "Loading Google button...",
      googleUnavailable: "The Google button could not load. Check that this domain is authorized in Google Cloud, then reload the page.",
      googleScriptUnavailable: "The Google script could not load. Try without blockers or in an incognito window.",
      googleOriginRejected: "Google loaded, but did not allow the button. Authorize this origin in Google Cloud: "
    }
  };

  const lang = (document.documentElement.lang || "es").slice(0, 2);
  const copy = labels[lang] || labels.es;
  const statusCopy = {
    pending: copy.pending,
    "in-progress": copy.inProgress,
    completed: copy.completed
  };

  let currentUser = readUser();
  let googleReady = false;
  let buttonRendered = false;
  let googleLoadStarted = false;
  let googleLoadTimer = null;
  let googleRenderRetries = 0;
  let restoringActivity = false;
  let activityRestoreTimer = null;
  let activityAutosaveReady = false;

  function clientId() {
    const meta = document.querySelector('meta[name="google-signin-client_id"]');
    return (
      window[CONFIG_KEY] ||
      (meta && meta.content) ||
      FALLBACK_CLIENT_ID
    ).trim();
  }

  function siteRootUrl() {
    const script = document.currentScript || document.querySelector('script[src*="google-auth.js"]');
    if (script && script.src) {
      return script.src.replace(/assets\/js\/google-auth\.js(?:\?.*)?$/, "");
    }
    return new URL("./", document.baseURI).href;
  }

  function rootHref(path) {
    return new URL(path, siteRootUrl()).href;
  }

  function pageKey() {
    let path = window.location.pathname || "/";
    path = decodeURIComponent(path).replace(/\/+/g, "/");
    return path.endsWith("/") ? path + "index.html" : path;
  }

  function pageTitle() {
    const heading = document.querySelector("h1");
    const raw = (heading && heading.textContent) || document.title || "JaraLingua";
    return raw.replace(/\s+/g, " ").trim();
  }

  function courseNameFromPath(path) {
    const value = (path || pageKey()).toLowerCase();
    if (value.indexOf("/frances/niveau 7/") !== -1 || value.indexOf("/frances/niveau%207/") !== -1) return "Fran\u00e7ais Niveau 7";
    if (value.indexOf("/frances/") !== -1) return "Fran\u00e7ais";
    if (value.indexOf("/ingles/basico/") !== -1) return "Basic English";
    if (value.indexOf("/ingles/intermediate/") !== -1) return "Intermediate English";
    if (value.indexOf("/ingles/") !== -1) return "English";
    return "JaraLingua";
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

  function readUser() {
    try {
      const saved = JSON.parse(sessionStorage.getItem(USER_KEY) || "null");
      if (!saved || !saved.exp || Date.now() / 1000 > saved.exp) {
        sessionStorage.removeItem(USER_KEY);
        return null;
      }
      return saved;
    } catch (error) {
      sessionStorage.removeItem(USER_KEY);
      return null;
    }
  }

  function userProgressKey() {
    const userId = currentUser && (currentUser.sub || currentUser.email);
    return userId ? "jaralingua_progress_" + userId : "";
  }

  function userActivityKey() {
    const userId = currentUser && (currentUser.sub || currentUser.email);
    if (!userId) return "";
    return "jaralingua_activity_" + userId + "_" + encodeURIComponent(pageKey());
  }

  function normalizeEmail(value) {
    return String(value || "").trim().toLowerCase();
  }

  function isAdminUser(user) {
    return ADMIN_EMAILS.indexOf(normalizeEmail(user && user.email)) !== -1;
  }

  function userId(user) {
    return (user && (user.sub || user.email)) || "";
  }

  function roleLabel(role) {
    if (role === "admin") return copy.adminRole;
    if (role === "teacher") return copy.teacherRole;
    return copy.studentRole;
  }

  function roleSummaryText(roleStatus) {
    if (roleStatus && roleStatus.status === "approved") {
      return copy.roleApproved + ": " + roleLabel(roleStatus.role);
    }
    if (roleStatus && roleStatus.status === "pending" && roleStatus.role === "teacher") {
      return copy.teacherPendingStudentAccess;
    }
    if (roleStatus && roleStatus.status === "pending") {
      return copy.rolePending + " " + roleLabel(roleStatus.role) + ".";
    }
    return copy.chooseRole;
  }

  function readRoleRequests() {
    try {
      const saved = JSON.parse(localStorage.getItem(ROLE_REQUESTS_KEY) || "[]");
      return Array.isArray(saved) ? saved : [];
    } catch (error) {
      localStorage.removeItem(ROLE_REQUESTS_KEY);
      return [];
    }
  }

  function writeRoleRequests(requests) {
    localStorage.setItem(ROLE_REQUESTS_KEY, JSON.stringify(requests));
  }

  function currentRoleRequest() {
    const id = userId(currentUser);
    if (!id) return null;
    return readRoleRequests().find(function (request) {
      return request.id === id || normalizeEmail(request.email) === normalizeEmail(currentUser.email);
    }) || null;
  }

  function currentRoleStatus() {
    if (!currentUser) return null;
    if (isAdminUser(currentUser)) return { role: "admin", status: "approved" };
    return currentRoleRequest();
  }

  function requestRole(role) {
    if (!currentUser || isAdminUser(currentUser)) return;
    const normalizedRole = role === "teacher" ? "teacher" : "student";
    const status = normalizedRole === "student" ? "approved" : "pending";
    const requests = readRoleRequests();
    const id = userId(currentUser);
    const existingIndex = requests.findIndex(function (request) {
      return request.id === id || normalizeEmail(request.email) === normalizeEmail(currentUser.email);
    });
    const request = {
      id: id,
      name: currentUser.name,
      email: currentUser.email,
      picture: currentUser.picture || "",
      role: normalizedRole,
      status: status,
      createdAt: existingIndex >= 0 ? requests[existingIndex].createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      requests[existingIndex] = Object.assign({}, requests[existingIndex], request);
    } else {
      requests.push(request);
    }

    writeRoleRequests(requests);
    showToast(normalizedRole === "student" ? copy.studentAccessReady : copy.roleRequestSent);
    renderWidget();
    renderDashboard();
  }

  function approveRoleRequest(id, role) {
    if (!isAdminUser(currentUser)) return;
    const requests = readRoleRequests().map(function (request) {
      if (request.id !== id) return request;
      return Object.assign({}, request, {
        role: role,
        status: "approved",
        approvedBy: currentUser.email,
        approvedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    });
    writeRoleRequests(requests);
    showToast(copy.approved);
    renderDashboard();
  }

  function pendingRoleRequests() {
    if (!isAdminUser(currentUser)) return [];
    return readRoleRequests().filter(function (request) {
      return request.status === "pending";
    });
  }

  function readProgress() {
    const key = userProgressKey();
    if (!key) return { pages: {}, lastPage: null };
    try {
      const saved = JSON.parse(localStorage.getItem(key) || "null");
      if (saved && saved.pages) return saved;
    } catch (error) {
      localStorage.removeItem(key);
    }
    return { pages: {}, lastPage: null };
  }

  function saveProgress(progress) {
    const key = userProgressKey();
    if (!key) return;
    localStorage.setItem(key, JSON.stringify(progress));
  }

  function currentPageRecord(status) {
    return {
      title: pageTitle(),
      url: window.location.href,
      path: pageKey(),
      course: courseNameFromPath(pageKey()),
      status: status || "in-progress",
      updatedAt: new Date().toISOString()
    };
  }

  function trackPageVisit() {
    if (!currentUser) return;
    const progress = readProgress();
    const key = pageKey();
    const existing = progress.pages[key];
    const status = existing && existing.status === "completed" ? "completed" : "in-progress";
    progress.pages[key] = Object.assign({}, existing || {}, currentPageRecord(status));
    progress.lastPage = progress.pages[key];
    saveProgress(progress);
  }

  function setPageStatus(status) {
    if (!currentUser) {
      promptSignIn(copy.loginNeeded);
      return;
    }
    const progress = readProgress();
    const key = pageKey();
    progress.pages[key] = Object.assign({}, progress.pages[key] || {}, currentPageRecord(status));
    progress.lastPage = progress.pages[key];
    saveProgress(progress);
    renderWidget();
    renderDashboard();
  }

  function progressStats() {
    const progress = readProgress();
    const pages = Object.keys(progress.pages).map(function (key) {
      return progress.pages[key];
    });
    const completed = pages.filter(function (page) {
      return page.status === "completed";
    });
    const courses = pages.reduce(function (set, page) {
      set[page.course || "JaraLingua"] = true;
      return set;
    }, {});
    return {
      progress: progress,
      pages: pages,
      completed: completed,
      courseCount: Object.keys(courses).length || 1
    };
  }

  function saveUser(user) {
    currentUser = user;
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    trackPageVisit();
    renderWidget();
    renderDashboard();
    restoreSavedActivity();
    saveAllActivityFields();
    updateDownloadLocks();
  }

  function signOut() {
    sessionStorage.removeItem(USER_KEY);
    currentUser = null;
    buttonRendered = false;

    if (window.google && google.accounts && google.accounts.id) {
      google.accounts.id.disableAutoSelect();
    }

    renderWidget();
    renderDashboard();
    updateDownloadLocks();
  }

  window.jaralinguaHandleGoogleCredential = function (response) {
    if (!response || !response.credential) return;

    const profile = decodeJwt(response.credential);
    saveUser({
      name: profile.name || profile.given_name || profile.email,
      email: profile.email,
      picture: profile.picture,
      sub: profile.sub,
      exp: profile.exp
    });

    closePanel();
  };

  function injectStyles() {
    if (document.getElementById("jaralingua-auth-styles")) return;

    const style = document.createElement("style");
    style.id = "jaralingua-auth-styles";
    style.textContent = `
      .jaralingua-auth {
        position: fixed;
        left: 18px;
        top: 84px;
        z-index: 1300;
        font-family: Arial, Helvetica, sans-serif;
      }

      .jaralingua-auth button,
      .jaralingua-student-dashboard button {
        font: inherit;
      }

      .auth-trigger {
        min-height: 42px;
        max-width: min(310px, calc(100vw - 36px));
        display: inline-flex;
        align-items: center;
        gap: 9px;
        padding: 0 15px;
        border: 0;
        border-radius: 999px;
        background: #ffffff;
        color: #071f4f;
        font-weight: 900;
        box-shadow: 0 14px 32px rgba(15, 23, 42, 0.14);
        cursor: pointer;
      }

      .auth-trigger:hover {
        color: #d7193f;
      }

      .auth-trigger img,
      .auth-user-card img,
      .student-profile img {
        border-radius: 50%;
        object-fit: cover;
      }

      .auth-trigger img,
      .auth-initial {
        width: 28px;
        height: 28px;
        flex: 0 0 28px;
      }

      .auth-trigger span:last-child {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .auth-initial {
        display: inline-grid;
        place-items: center;
        border-radius: 50%;
        background: #eef4ff;
        color: #123b8f;
      }

      .auth-panel {
        position: absolute;
        left: 0;
        top: calc(100% + 8px);
        width: min(380px, calc(100vw - 36px));
        padding: 18px;
        border-radius: 22px;
        background: rgba(255, 255, 255, 0.98);
        border: 1px solid rgba(18, 59, 143, 0.12);
        box-shadow: 0 24px 52px rgba(15, 23, 42, 0.2);
      }

      .auth-panel[hidden] {
        display: none;
      }

      .auth-panel h2 {
        margin: 0 0 8px;
        color: #071f4f;
        font-size: 1.08rem;
      }

      .auth-panel p {
        margin: 0 0 14px;
        color: #64748b;
        line-height: 1.5;
      }

      .auth-google-button {
        min-height: 44px;
      }

      .auth-config-note,
      .auth-google-status,
      .auth-download-note {
        border-radius: 16px;
        padding: 14px;
        background: #fff7e8;
        color: #7c4a03;
        font-weight: 800;
      }

      .auth-google-status[hidden] {
        display: none;
      }

      .auth-user-card {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 12px;
        align-items: center;
        margin-bottom: 14px;
      }

      .auth-user-card img {
        width: 48px;
        height: 48px;
      }

      .auth-user-card strong,
      .auth-user-card span {
        display: block;
        min-width: 0;
        overflow-wrap: anywhere;
      }

      .auth-user-card strong {
        color: #071f4f;
      }

      .auth-user-card span {
        color: #64748b;
        font-size: 0.9rem;
      }

      .auth-menu {
        display: grid;
        gap: 8px;
        margin: 10px 0 14px;
      }

      .auth-menu a,
      .auth-menu button,
      .auth-action,
      .student-action,
      .status-action,
      .activity-clear-action {
        min-height: 42px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 0 14px;
        border: 0;
        border-radius: 999px;
        text-decoration: none;
        font-weight: 900;
        cursor: pointer;
      }

      .role-action {
        min-height: 40px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 0 12px;
        border: 0;
        border-radius: 999px;
        background: #071f4f;
        color: #ffffff;
        font-weight: 900;
        cursor: pointer;
      }

      .role-action.secondary {
        background: #eef4ff;
        color: #071f4f;
      }

      .auth-menu a,
      .auth-menu button {
        justify-content: flex-start;
        background: #f4f8ff;
        color: #071f4f;
      }

      .auth-menu a:hover,
      .auth-menu button:hover {
        background: #e8f0ff;
        color: #d7193f;
      }

      .auth-progress-mini {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
        margin: 12px 0;
      }

      .auth-progress-mini div {
        border-radius: 16px;
        background: #f8fbff;
        padding: 10px;
        text-align: center;
      }

      .auth-progress-mini strong {
        display: block;
        color: #071f4f;
        font-size: 1.1rem;
      }

      .auth-progress-mini span {
        color: #64748b;
        font-size: 0.74rem;
        font-weight: 800;
      }

      .auth-actions {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }

      .auth-action,
      .student-action.primary,
      .status-action.is-active,
      .activity-clear-action {
        background: #071f4f;
        color: #ffffff;
      }

      .auth-action.secondary,
      .student-action,
      .status-action {
        background: #eef4ff;
        color: #071f4f;
      }

      .jaralingua-student-dashboard {
        width: min(900px, calc(100% - 32px));
        margin: clamp(14px, 2.4vw, 26px) auto;
        padding: clamp(14px, 2.2vw, 22px);
        border-radius: 22px;
        background:
          linear-gradient(135deg, rgba(255, 255, 255, 0.96), rgba(244, 248, 255, 0.92)),
          radial-gradient(circle at 92% 12%, rgba(215, 25, 63, 0.12), transparent 32%);
        border: 1px solid rgba(7, 31, 79, 0.08);
        box-shadow: 0 24px 54px rgba(15, 23, 42, 0.12);
        position: relative;
        z-index: 2;
      }

      .jaralingua-student-dashboard[hidden] {
        display: none;
      }

      .student-dashboard-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 14px;
        align-items: stretch;
      }

      .student-profile,
      .student-panel {
        border-radius: 22px;
        background: rgba(255, 255, 255, 0.82);
        border: 1px solid rgba(7, 31, 79, 0.08);
        padding: 14px;
      }

      .student-profile {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 16px;
        align-items: center;
      }

      .student-profile img,
      .student-avatar {
        width: 68px;
        height: 68px;
      }

      .student-avatar {
        display: grid;
        place-items: center;
        border-radius: 50%;
        background: #eef4ff;
        color: #071f4f;
        font-size: 1.5rem;
        font-weight: 900;
      }

      .student-profile h2,
      .student-panel h3 {
        margin: 0;
        color: #071f4f;
        font-weight: 900;
      }

      .student-profile p,
      .student-panel p {
        margin: 6px 0 0;
        color: #64748b;
        line-height: 1.5;
      }

      .student-stats {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 8px;
        margin-top: 12px;
      }

      .student-stat {
        border-radius: 18px;
        background: #071f4f;
        color: #ffffff;
        padding: 14px;
      }

      .student-stat strong {
        display: block;
        font-size: 1.25rem;
      }

      .student-stat span {
        display: block;
        opacity: 0.82;
        font-size: 0.82rem;
        font-weight: 800;
      }

      .student-panels {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
      }

      .student-actions,
      .status-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 14px;
      }

      .role-request-list {
        display: grid;
        gap: 8px;
        margin-top: 12px;
      }

      .role-request-item {
        display: grid;
        gap: 8px;
        padding: 10px;
        border-radius: 14px;
        background: #f4f8ff;
        color: #071f4f;
        font-weight: 900;
      }

      .role-request-item span {
        color: #64748b;
        font-size: 0.86rem;
        font-weight: 800;
        overflow-wrap: anywhere;
      }

      .role-request-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .activity-save-meter {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        margin-top: 10px;
        padding: 8px 10px;
        border-radius: 999px;
        background: #eef4ff;
        color: #071f4f;
        font-size: 0.86rem;
        font-weight: 900;
      }

      .jaralingua-download-locked {
        position: relative;
        filter: saturate(0.82);
        box-shadow: inset 0 0 0 2px rgba(7, 31, 79, 0.12);
      }

      .jaralingua-auth-toast {
        position: fixed;
        left: 50%;
        bottom: 20px;
        transform: translateX(-50%);
        z-index: 1400;
        max-width: min(420px, calc(100vw - 32px));
        padding: 13px 16px;
        border-radius: 18px;
        background: #071f4f;
        color: #ffffff;
        box-shadow: 0 18px 42px rgba(15, 23, 42, 0.24);
        font-weight: 900;
      }

      @media (max-width: 760px) {
        .jaralingua-auth {
          top: auto;
          left: 12px;
          bottom: 12px;
        }

        .auth-panel {
          top: auto;
          bottom: calc(100% + 8px);
        }

        .student-dashboard-grid,
        .student-profile {
          grid-template-columns: 1fr;
        }

        .student-stats,
        .student-panels,
        .auth-progress-mini {
          grid-template-columns: 1fr;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function createShell() {
    injectStyles();

    let root = document.querySelector("[data-jaralingua-auth]");
    if (root) return root;

    root = document.createElement("div");
    root.className = "jaralingua-auth";
    root.setAttribute("data-jaralingua-auth", "");
    document.body.insertBefore(root, document.body.firstChild);
    return root;
  }

  function avatarMarkup(user, className) {
    if (user && user.picture) {
      return `<img src="${escapeAttribute(user.picture)}" alt="">`;
    }
    const initial = ((user && user.name) || "J").charAt(0);
    return `<span class="${className || "auth-initial"}">${escapeHtml(initial)}</span>`;
  }

  function triggerMarkup() {
    if (currentUser) {
      return `<button class="auth-trigger" type="button" data-auth-toggle>${avatarMarkup(currentUser)}<span>${escapeHtml(currentUser.name)}</span></button>`;
    }

    return `<button class="auth-trigger" type="button" data-auth-toggle><span class="auth-initial">G</span><span>${copy.signIn}</span></button>`;
  }

  function panelMarkup() {
    if (currentUser) {
      const stats = progressStats();
      const last = stats.progress.lastPage;
      const roleStatus = currentRoleStatus();
      return `
        <div class="auth-panel" data-auth-panel hidden>
          <h2>${copy.account}</h2>
          <div class="auth-user-card">
            ${avatarMarkup(currentUser)}
            <div>
              <strong>${escapeHtml(currentUser.name)}</strong>
              <span>${escapeHtml(currentUser.email || "")}</span>
            </div>
          </div>
          <div class="auth-progress-mini">
            <div><strong>${stats.pages.length}</strong><span>${copy.pages}</span></div>
            <div><strong>${stats.completed.length}</strong><span>${copy.completedPages}</span></div>
          </div>
          <p>${escapeHtml(roleSummaryText(roleStatus))}</p>
          <div class="auth-menu">
            <a href="#jaralingua-student-panel" data-auth-close>${copy.viewDashboard}</a>
            <a href="${last ? escapeAttribute(last.url) : "#"}" data-auth-last>${copy.continue}</a>
            <a href="#jaralingua-progress-panel" data-auth-close>${copy.progress}</a>
          </div>
          <div class="auth-actions">
            <button class="auth-action" type="button" data-auth-signout>${copy.signOut}</button>
            <button class="auth-action secondary" type="button" data-auth-close>${copy.close}</button>
          </div>
        </div>
      `;
    }

    return `
      <div class="auth-panel" data-auth-panel hidden>
        <h2>${copy.title}</h2>
        <p>${clientId() ? "" : copy.configured}</p>
        <div class="auth-google-button" data-google-button></div>
        <div class="auth-google-status" data-google-status hidden></div>
        ${clientId() ? "" : `<div class="auth-config-note">${copy.hint}</div>`}
        <div class="auth-download-note" data-auth-download-note hidden>${copy.loginNeeded}</div>
      </div>
    `;
  }

  function renderWidget() {
    const root = createShell();
    root.innerHTML = triggerMarkup() + panelMarkup();

    const toggle = root.querySelector("[data-auth-toggle]");
    const panel = root.querySelector("[data-auth-panel]");
    const closeButtons = root.querySelectorAll("[data-auth-close]");
    const signOutButton = root.querySelector("[data-auth-signout]");
    const lastLink = root.querySelector("[data-auth-last]");

    toggle.addEventListener("click", function () {
      panel.hidden = !panel.hidden;
      if (!panel.hidden) renderGoogleButton();
    });

    closeButtons.forEach(function (button) {
      button.addEventListener("click", closePanel);
    });
    if (signOutButton) signOutButton.addEventListener("click", signOut);
    if (lastLink && lastLink.getAttribute("href") === "#") {
      lastLink.addEventListener("click", function (event) {
        event.preventDefault();
        showToast(copy.noLastPage);
      });
    }
  }

  function closePanel() {
    const panel = document.querySelector("[data-auth-panel]");
    if (panel) panel.hidden = true;
  }

  function openPanel() {
    const panel = document.querySelector("[data-auth-panel]");
    if (!panel) return;
    panel.hidden = false;
    renderGoogleButton();
  }

  function googleApiReady() {
    return !!(window.google && window.google.accounts && window.google.accounts.id);
  }

  function setGoogleStatus(message) {
    const status = document.querySelector("[data-google-status]");
    if (!status) return;
    status.textContent = message || "";
    status.hidden = !message;
  }

  function ensureGoogleScriptReady(callback) {
    if (googleApiReady()) {
      callback();
      return;
    }

    setGoogleStatus(copy.googleLoading);

    if (!googleLoadStarted) {
      googleLoadStarted = true;
      let script = document.querySelector('script[src*="accounts.google.com/gsi/client"]');
      if (!script) {
        script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }

      script.addEventListener("load", function () {
        renderGoogleButton();
      });
      script.addEventListener("error", function () {
        setGoogleStatus(copy.googleScriptUnavailable);
      });
    }

    clearTimeout(googleLoadTimer);
    googleLoadTimer = setTimeout(function retryGoogleButton() {
      if (googleApiReady()) {
        callback();
        return;
      }

      googleRenderRetries += 1;
      if (googleRenderRetries >= 20) {
        setGoogleStatus(copy.googleScriptUnavailable);
        return;
      }

      googleLoadTimer = setTimeout(retryGoogleButton, 400);
    }, 400);
  }

  function initGoogle() {
    if (!clientId() || !googleApiReady()) return;

    try {
      window.google.accounts.id.initialize({
        client_id: clientId(),
        callback: window.jaralinguaHandleGoogleCredential,
        auto_select: false,
        cancel_on_tap_outside: true
      });

      googleReady = true;
      setGoogleStatus("");
    } catch (error) {
      googleReady = false;
      setGoogleStatus(copy.googleUnavailable);
    }
  }

  function renderGoogleButton() {
    const target = document.querySelector("[data-google-button]");
    if (!target || buttonRendered || !clientId()) return;

    if (!googleReady) initGoogle();
    if (!googleReady) {
      ensureGoogleScriptReady(renderGoogleButton);
      return;
    }

    try {
      target.innerHTML = "";
      window.google.accounts.id.renderButton(target, {
        theme: "outline",
        size: "large",
        shape: "pill",
        text: "signin_with",
        width: 280
      });

      buttonRendered = true;
      googleRenderRetries = 0;
      setGoogleStatus("");

      setTimeout(function () {
        if (target.children.length) return;
        buttonRendered = false;
        setGoogleStatus(copy.googleOriginRejected + window.location.origin);
      }, 1200);
    } catch (error) {
      buttonRendered = false;
      setGoogleStatus(copy.googleOriginRejected + window.location.origin);
    }
  }

  function renderDashboard() {
    injectStyles();
    let dashboard = document.querySelector("[data-jaralingua-dashboard]");
    if (!currentUser) {
      if (dashboard) dashboard.hidden = true;
      return;
    }

    if (!dashboard) {
      dashboard = document.createElement("section");
      dashboard.className = "jaralingua-student-dashboard";
      dashboard.id = "jaralingua-student-panel";
      dashboard.setAttribute("data-jaralingua-dashboard", "");
      const main = document.querySelector("main");
      if (main && main.children.length) {
        main.insertBefore(dashboard, main.children[1] || main.firstChild);
      } else if (main) {
        main.appendChild(dashboard);
      } else {
        document.body.appendChild(dashboard);
      }
    }

    const stats = progressStats();
    const draftStats = activityDraftStats();
    const current = stats.progress.pages[pageKey()] || currentPageRecord("in-progress");
    const last = stats.progress.lastPage;
    const roleStatus = currentRoleStatus();
    dashboard.hidden = false;
    dashboard.innerHTML = `
      <div class="student-dashboard-grid">
        <div>
          <div class="student-profile">
            ${avatarMarkup(currentUser, "student-avatar")}
            <div>
              <h2>${copy.studentSpace}</h2>
              <p>${escapeHtml(currentUser.name)} · ${escapeHtml(currentUser.email || "")}</p>
              <div class="student-actions">
                <a class="student-action primary" href="${last ? escapeAttribute(last.url) : "#"}" data-student-continue>${copy.continue}</a>
              </div>
            </div>
          </div>
          <div class="student-stats" id="jaralingua-progress-panel">
            <div class="student-stat"><strong>${stats.pages.length}</strong><span>${copy.pages}</span></div>
            <div class="student-stat"><strong>${stats.completed.length}</strong><span>${copy.completedPages}</span></div>
          </div>
        </div>
        <div class="student-panels">
          <div class="student-panel">
            <h3>${copy.currentPage}</h3>
            <p>${escapeHtml(current.title)} · ${escapeHtml(statusCopy[current.status] || copy.inProgress)}</p>
            <div class="status-actions">
              ${statusButton("pending", current.status, copy.markPending)}
              ${statusButton("in-progress", current.status, copy.markInProgress)}
              ${statusButton("completed", current.status, copy.markCompleted)}
            </div>
          </div>
          ${rolePanelMarkup(roleStatus)}
          <div class="student-panel">
            <h3>${copy.activityAutosave}</h3>
            <p>${copy.autosaveActive}</p>
            <span class="activity-save-meter">${draftStats.count} ${copy.savedAnswers}</span>
            <div class="student-actions">
              <button class="activity-clear-action" type="button" data-clear-activity-progress>${copy.clearAnswers}</button>
            </div>
          </div>
          ${adminPanelMarkup()}
        </div>
      </div>
    `;

    dashboard.querySelectorAll("[data-progress-status]").forEach(function (button) {
      button.addEventListener("click", function () {
        setPageStatus(button.getAttribute("data-progress-status"));
      });
    });

    const clearAnswersButton = dashboard.querySelector("[data-clear-activity-progress]");
    if (clearAnswersButton) {
      clearAnswersButton.addEventListener("click", function () {
        clearSavedActivity(true);
      });
    }

    dashboard.querySelectorAll("[data-request-role]").forEach(function (button) {
      button.addEventListener("click", function () {
        requestRole(button.getAttribute("data-request-role"));
      });
    });

    dashboard.querySelectorAll("[data-approve-role]").forEach(function (button) {
      button.addEventListener("click", function () {
        approveRoleRequest(button.getAttribute("data-request-id"), button.getAttribute("data-approve-role"));
      });
    });

    const continueLink = dashboard.querySelector("[data-student-continue]");
    if (continueLink && continueLink.getAttribute("href") === "#") {
      continueLink.addEventListener("click", function (event) {
        event.preventDefault();
        showToast(copy.noLastPage);
      });
    }
  }

  function rolePanelMarkup(roleStatus) {
    if (isAdminUser(currentUser)) {
      return `
        <div class="student-panel">
          <h3>${copy.adminPanel}</h3>
          <p>${copy.roleApproved}: ${copy.adminRole}</p>
        </div>
      `;
    }

    if (roleStatus && roleStatus.status === "approved") {
      return `
        <div class="student-panel">
          <h3>${copy.roleApproved}</h3>
          <p>${roleStatus.role === "teacher" ? copy.teacherApproved : roleLabel(roleStatus.role)}</p>
        </div>
      `;
    }

    if (roleStatus && roleStatus.status === "pending" && roleStatus.role === "teacher") {
      return `
        <div class="student-panel">
          <h3>${copy.studentRole}</h3>
          <p>${copy.teacherPendingStudentAccess}</p>
          <div class="student-actions">
            <button class="role-action secondary" type="button" data-request-role="teacher">${copy.requestTeacher}</button>
          </div>
        </div>
      `;
    }

    if (roleStatus && roleStatus.status === "pending") {
      return `
        <div class="student-panel">
          <h3>${copy.studentRole}</h3>
          <p>${copy.studentAccessReady}</p>
        </div>
      `;
    }

    return `
      <div class="student-panel">
        <h3>${copy.studentRole}</h3>
        <p>${copy.studentAccessReady}</p>
        <div class="student-actions">
          <button class="role-action" type="button" data-request-role="student">${copy.requestStudent}</button>
          <button class="role-action secondary" type="button" data-request-role="teacher">${copy.requestTeacher}</button>
        </div>
      </div>
    `;
  }

  function adminPanelMarkup() {
    if (!isAdminUser(currentUser)) return "";
    const requests = pendingRoleRequests();
    const list = requests.length
      ? requests.map(function (request) {
        return `
          <div class="role-request-item">
            <strong>${escapeHtml(request.name || request.email)}</strong>
            <span>${escapeHtml(request.email || "")} · ${roleLabel(request.role)}</span>
            <div class="role-request-actions">
              <button class="role-action secondary" type="button" data-request-id="${escapeAttribute(request.id)}" data-approve-role="student">${copy.approveAsStudent}</button>
              <button class="role-action" type="button" data-request-id="${escapeAttribute(request.id)}" data-approve-role="teacher">${copy.approveAsTeacher}</button>
            </div>
          </div>
        `;
      }).join("")
      : `<p>${copy.noPendingRequests}</p>`;

    return `
      <div class="student-panel">
        <h3>${copy.pendingRoleRequests}</h3>
        <div class="role-request-list">${list}</div>
      </div>
    `;
  }

  function statusButton(status, activeStatus, label) {
    const active = status === activeStatus ? " is-active" : "";
    return `<button class="status-action${active}" type="button" data-progress-status="${status}">${label}</button>`;
  }

  function isDownloadAction(element) {
    if (!element) return false;
    const href = (element.getAttribute("href") || "").toLowerCase();
    const onclick = (element.getAttribute("onclick") || "").toLowerCase();
    const text = (element.textContent || "").toLowerCase();
    return (
      href.indexOf(".pdf") !== -1 ||
      href.indexOf("download") !== -1 ||
      onclick.indexOf("download") !== -1 ||
      text.indexOf("download") !== -1 ||
      text.indexOf("descargar") !== -1 ||
      text.indexOf("t\u00e9l\u00e9charger") !== -1
    );
  }

  function updateDownloadLocks() {
    document.querySelectorAll("a, button").forEach(function (element) {
      if (!isDownloadAction(element)) return;
      element.classList.toggle("jaralingua-download-locked", !currentUser);
      if (!currentUser) {
        element.setAttribute("title", copy.loginNeeded);
      } else {
        element.removeAttribute("title");
      }
    });
  }

  function promptSignIn(message) {
    showToast(message || copy.loginNeeded);
    const note = document.querySelector("[data-auth-download-note]");
    if (note) note.hidden = false;
    openPanel();
  }

  function guardDownload(event) {
    const action = event.target && event.target.closest ? event.target.closest("a, button") : null;
    if (!action || !isDownloadAction(action) || currentUser) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    promptSignIn(copy.loginNeeded);
  }

  function protectDownloadFunction(name) {
    const original = window[name];
    if (typeof original !== "function" || original.__jaralinguaProtected) return;

    const protectedDownload = function () {
      if (!currentUser) {
        promptSignIn(copy.loginNeeded);
        return undefined;
      }
      return original.apply(this, arguments);
    };
    protectedDownload.__jaralinguaProtected = true;
    protectedDownload.__jaralinguaOriginal = original;
    window[name] = protectedDownload;
  }

  function protectDownloads() {
    DOWNLOAD_FUNCTIONS.forEach(protectDownloadFunction);
    document.addEventListener("click", guardDownload, true);
    updateDownloadLocks();
  }

  function activityFields() {
    return Array.from(document.querySelectorAll(ACTIVITY_FIELD_SELECTOR)).filter(isActivityField);
  }

  function isActivityField(element) {
    if (!element || element.disabled) return false;
    if (element.closest("[data-jaralingua-auth], [data-jaralingua-dashboard]")) return false;
    if (element.hasAttribute("contenteditable") && element.getAttribute("contenteditable") === "false") return false;
    const tagName = element.tagName.toLowerCase();
    const type = tagName === "input" ? (element.type || "text").toLowerCase() : tagName;
    return !IGNORED_ACTIVITY_TYPES[type];
  }

  function fieldBase(element) {
    const tagName = element.tagName.toLowerCase();
    const type = tagName === "input" ? (element.type || "text").toLowerCase() : tagName;
    const stableId = element.id || element.name || element.getAttribute("data-question") || element.getAttribute("data-answer");
    if (stableId) return tagName + ":" + type + ":" + stableId;

    const form = element.closest("form");
    const section = element.closest("[id]");
    const scope = (form && (form.id || form.name)) || (section && section.id) || "page";
    const label = element.getAttribute("aria-label") || element.getAttribute("placeholder") || nearbyLabelText(element) || "";
    return tagName + ":" + type + ":" + scope + ":" + label.slice(0, 80);
  }

  function fieldKey(element) {
    const base = fieldBase(element);
    const same = activityFields().filter(function (field) {
      return fieldBase(field) === base;
    });
    return base + "::" + Math.max(0, same.indexOf(element));
  }

  function nearbyLabelText(element) {
    if (element.id) {
      const label = document.querySelector('label[for="' + cssEscape(element.id) + '"]');
      if (label) return cleanText(label.textContent);
    }
    const labelParent = element.closest("label");
    if (labelParent) return cleanText(labelParent.textContent);
    return cleanText((element.closest("li, article, .question-card, .activity-card, .form-group") || {}).textContent || "");
  }

  function readActivityDraft() {
    const key = userActivityKey();
    if (!key) return { fields: {}, updatedAt: null };
    try {
      const saved = JSON.parse(localStorage.getItem(key) || "null");
      if (saved && saved.fields) return saved;
    } catch (error) {
      localStorage.removeItem(key);
    }
    return { fields: {}, updatedAt: null };
  }

  function saveActivityDraft(draft) {
    const key = userActivityKey();
    if (!key) return;
    localStorage.setItem(key, JSON.stringify(draft));
  }

  function activityDraftStats() {
    const draft = readActivityDraft();
    return {
      count: Object.keys(draft.fields || {}).length,
      updatedAt: draft.updatedAt
    };
  }

  function fieldValue(element) {
    const tagName = element.tagName.toLowerCase();
    if (tagName === "select" && element.multiple) {
      return Array.from(element.options).filter(function (option) {
        return option.selected;
      }).map(function (option) {
        return option.value;
      });
    }
    if (element.type === "checkbox" || element.type === "radio") return element.checked;
    if (element.isContentEditable) return element.textContent || "";
    return element.value;
  }

  function restoreFieldValue(element, value) {
    const tagName = element.tagName.toLowerCase();
    if (tagName === "select" && element.multiple && Array.isArray(value)) {
      Array.from(element.options).forEach(function (option) {
        option.selected = value.indexOf(option.value) !== -1;
      });
      return;
    }
    if (element.type === "checkbox" || element.type === "radio") {
      element.checked = Boolean(value);
      return;
    }
    if (element.isContentEditable) {
      element.textContent = value == null ? "" : String(value);
      return;
    }
    element.value = value == null ? "" : String(value);
  }

  function saveActivityField(element) {
    if (!currentUser || restoringActivity || !isActivityField(element)) return;
    const draft = readActivityDraft();
    draft.fields[fieldKey(element)] = fieldValue(element);
    draft.updatedAt = new Date().toISOString();
    saveActivityDraft(draft);
    updateActivityPanelCount();
  }

  function saveAllActivityFields() {
    if (!currentUser || restoringActivity) return;
    const fields = activityFields();
    if (!fields.length) return;
    const draft = readActivityDraft();
    fields.forEach(function (field) {
      draft.fields[fieldKey(field)] = fieldValue(field);
    });
    draft.updatedAt = new Date().toISOString();
    saveActivityDraft(draft);
    updateActivityPanelCount();
  }

  function restoreSavedActivity() {
    if (!currentUser) return;
    const draft = readActivityDraft();
    const fields = draft.fields || {};
    const keys = Object.keys(fields);
    if (!keys.length) return;

    restoringActivity = true;
    activityFields().forEach(function (field) {
      const key = fieldKey(field);
      if (!Object.prototype.hasOwnProperty.call(fields, key)) return;
      restoreFieldValue(field, fields[key]);
    });
    restoringActivity = false;
    updateActivityPanelCount();
  }

  function clearSavedActivity(showMessage) {
    const key = userActivityKey();
    if (key) localStorage.removeItem(key);
    updateActivityPanelCount();
    if (showMessage) showToast(copy.answersCleared);
  }

  function updateActivityPanelCount() {
    const meter = document.querySelector(".activity-save-meter");
    if (!meter) return;
    const stats = activityDraftStats();
    meter.textContent = stats.count + " " + copy.savedAnswers;
  }

  function scheduleActivityRestore() {
    clearTimeout(activityRestoreTimer);
    activityRestoreTimer = setTimeout(function () {
      restoreSavedActivity();
      updateDownloadLocks();
    }, 120);
  }

  function isResetAction(element) {
    if (!element || !element.matches("button, input, a")) return false;
    const type = (element.getAttribute("type") || "").toLowerCase();
    const text = cleanText(element.textContent || element.value || "").toLowerCase();
    return type === "reset" ||
      text === "reset" ||
      text.indexOf("recommencer") !== -1 ||
      text.indexOf("reiniciar") !== -1 ||
      text.indexOf("limpiar") !== -1 ||
      text.indexOf("clear answers") !== -1 ||
      text.indexOf("try again") !== -1;
  }

  function initActivityAutosave() {
    if (activityAutosaveReady) return;
    activityAutosaveReady = true;

    document.addEventListener("input", function (event) {
      saveActivityField(event.target);
    }, true);

    document.addEventListener("change", function (event) {
      saveActivityField(event.target);
    }, true);

    document.addEventListener("reset", function () {
      setTimeout(function () {
        clearSavedActivity(false);
      }, 0);
    }, true);

    document.addEventListener("click", function (event) {
      const action = event.target && event.target.closest ? event.target.closest("button, input, a") : null;
      if (!isResetAction(action)) return;
      setTimeout(function () {
        clearSavedActivity(false);
      }, 0);
    }, true);

    if (window.MutationObserver) {
      const observer = new MutationObserver(scheduleActivityRestore);
      observer.observe(document.body, { childList: true, subtree: true });
    }

    restoreSavedActivity();
  }

  function showToast(message) {
    let toast = document.querySelector("[data-jaralingua-toast]");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "jaralingua-auth-toast";
      toast.setAttribute("data-jaralingua-toast", "");
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(function () {
      toast.remove();
    }, 3600);
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function escapeAttribute(value) {
    return escapeHtml(value).replace(/`/g, "&#96;");
  }

  function cleanText(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function cssEscape(value) {
    if (window.CSS && typeof window.CSS.escape === "function") return window.CSS.escape(value);
    return String(value).replace(/"/g, '\\"');
  }

  window.addEventListener("load", function () {
    initGoogle();
    if (currentUser) trackPageVisit();
    renderWidget();
    renderDashboard();
    protectDownloads();
    initActivityAutosave();
  });

  document.addEventListener("click", function (event) {
    const root = document.querySelector("[data-jaralingua-auth]");
    if (!root || root.contains(event.target)) return;
    closePanel();
  });
})();
