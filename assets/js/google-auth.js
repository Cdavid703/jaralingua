(function () {
  const GOOGLE_USER_KEY = "jaralingua_google_user";
  const MICROSOFT_USER_KEY = "jaralingua_microsoft_user";
  const LOCAL_USER_KEY = "jaralingua_local_user";
  const CONFIG_KEY = "JARALINGUA_GOOGLE_CLIENT_ID";
  const MICROSOFT_CONFIG_KEY = "JARALINGUA_MICROSOFT_CLIENT_ID";
  const MICROSOFT_AUTHORITY_KEY = "JARALINGUA_MICROSOFT_AUTHORITY";
  const MICROSOFT_REDIRECT_URI_KEY = "JARALINGUA_MICROSOFT_REDIRECT_URI";
  const MICROSOFT_SCOPES_KEY = "JARALINGUA_MICROSOFT_SCOPES";
  const MICROSOFT_SCRIPT_SRC = "https://alcdn.msauth.net/browser/2.37.0/js/msal-browser.min.js";
  const FALLBACK_CLIENT_ID = "";
  const FALLBACK_MICROSOFT_CLIENT_ID = "4e729f8a-d101-4c5d-af68-609d749bc95a";
  const API_ROOT = "/api";
  const CLOUD_SYNC_DELAY = 600;
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
      title: "Acceso a JaraLingua",
      configured: "El acceso con Google se activar\u00e1 cuando configures el Client ID.",
      hint: "Edita assets/js/google-auth-config.js y pega los Client ID web.",
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
      loginNeeded: "Inicia sesi\u00f3n con Google o Microsoft para usar esta descarga.",
      savedHere: "Progreso sincronizado con tu cuenta.",
      viewDashboard: "Abrir panel",
      activityAutosave: "Respuestas guardadas",
      autosaveActive: "Las respuestas de esta p\u00e1gina se guardan autom\u00e1ticamente.",
      savedAnswers: "campos guardados",
      clearAnswers: "Borrar respuestas",
      answersCleared: "Respuestas guardadas borradas.",
      adminPanel: "Panel de administrador",
      french7Grades: "Notas Frances 7",
      french8Grades: "Notas Frances 8",
      basicEnglishGrades: "Notas Ingles basico",
      intermediateEnglishGrades: "Notas Ingles intermedio",
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
      googleOriginRejected: "Google cargo, pero no permitio mostrar el boton. Autoriza este origen en Google Cloud: ",
      microsoftSignIn: "Continuar con Microsoft",
      localSignIn: "Entrar con usuario del curso",
      localEmail: "Correo o usuario",
      localPassword: "Contraseña",
      localSubmit: "Entrar",
      localLoading: "Verificando usuario...",
      localUnavailable: "Este acceso local solo está disponible en cursos autorizados.",
      localInvalid: "Usuario o contraseña incorrectos.",
      microsoftLoading: "Cargando Microsoft...",
      microsoftUnavailable: "No se pudo cargar el acceso con Microsoft. Recarga la pagina e intenta de nuevo.",
      microsoftPopupBlocked: "Microsoft no pudo abrir la ventana de inicio. Permite ventanas emergentes e intenta de nuevo."
    },
    fr: {
      signIn: "Connexion",
      signOut: "D\u00e9connexion",
      title: "Connexion JaraLingua",
      configured: "La connexion Google sera active apr\u00e8s configuration du Client ID.",
      hint: "Modifiez assets/js/google-auth-config.js et collez les Client ID web.",
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
      loginNeeded: "Connectez-vous avec Google ou Microsoft pour utiliser ce t\u00e9l\u00e9chargement.",
      savedHere: "Progr\u00e8s synchronis\u00e9 avec votre compte.",
      viewDashboard: "Ouvrir le panneau",
      activityAutosave: "R\u00e9ponses enregistr\u00e9es",
      autosaveActive: "Les r\u00e9ponses de cette page sont enregistr\u00e9es automatiquement.",
      savedAnswers: "champs enregistr\u00e9s",
      clearAnswers: "Effacer les r\u00e9ponses",
      answersCleared: "R\u00e9ponses enregistr\u00e9es effac\u00e9es.",
      adminPanel: "Panneau administrateur",
      french7Grades: "Notes du cours 7",
      french8Grades: "Notes du cours 8",
      basicEnglishGrades: "Notes anglais debutant",
      intermediateEnglishGrades: "Notes anglais intermediaire",
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
      googleOriginRejected: "Google est charge, mais n'a pas autorise le bouton. Autorisez cette origine dans Google Cloud : ",
      microsoftSignIn: "Continuer avec Microsoft",
      localSignIn: "Connexion avec utilisateur du cours",
      localEmail: "Courriel ou utilisateur",
      localPassword: "Mot de passe",
      localSubmit: "Entrer",
      localLoading: "Vérification de l'utilisateur...",
      localUnavailable: "Cet accès local est disponible uniquement dans les cours autorisés.",
      localInvalid: "Utilisateur ou mot de passe incorrect.",
      microsoftLoading: "Chargement de Microsoft...",
      microsoftUnavailable: "Impossible de charger la connexion Microsoft. Rechargez la page et reessayez.",
      microsoftPopupBlocked: "Microsoft n'a pas pu ouvrir la fenetre de connexion. Autorisez les fenetres contextuelles et reessayez."
    },
    en: {
      signIn: "Sign in",
      signOut: "Sign out",
      title: "JaraLingua sign-in",
      configured: "Google sign-in will work after the Client ID is configured.",
      hint: "Edit assets/js/google-auth-config.js and paste the web Client IDs.",
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
      loginNeeded: "Sign in with Google or Microsoft to use this download.",
      savedHere: "Progress synced with your account.",
      viewDashboard: "Open panel",
      activityAutosave: "Saved answers",
      autosaveActive: "Answers on this page are saved automatically.",
      savedAnswers: "saved fields",
      clearAnswers: "Clear answers",
      answersCleared: "Saved answers cleared.",
      adminPanel: "Admin panel",
      french7Grades: "French 7 grades",
      french8Grades: "French 8 grades",
      basicEnglishGrades: "Basic English grades",
      intermediateEnglishGrades: "Intermediate English grades",
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
      googleOriginRejected: "Google loaded, but did not allow the button. Authorize this origin in Google Cloud: ",
      microsoftSignIn: "Continue with Microsoft",
      localSignIn: "Sign in with course user",
      localEmail: "Email or username",
      localPassword: "Password",
      localSubmit: "Sign in",
      localLoading: "Verifying user...",
      localUnavailable: "This local access is only available in authorized courses.",
      localInvalid: "Incorrect username or password.",
      microsoftLoading: "Loading Microsoft...",
      microsoftUnavailable: "Microsoft sign-in could not load. Reload the page and try again.",
      microsoftPopupBlocked: "Microsoft could not open the sign-in window. Allow pop-ups and try again."
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
  let microsoftClient = null;
  let microsoftLoadStarted = false;
  let microsoftLoadPromise = null;
  let restoringActivity = false;
  let activityRestoreTimer = null;
  let activityAutosaveReady = false;
  let cloudProgressLoaded = false;
  let cloudProgressTimer = null;
  let pendingProgressSync = false;
  let activitySyncTimers = {};
  let pendingActivitySync = {};

  function clientId() {
    const meta = document.querySelector('meta[name="google-signin-client_id"]');
    return (
      window[CONFIG_KEY] ||
      (meta && meta.content) ||
      FALLBACK_CLIENT_ID
    ).trim();
  }

  function microsoftClientId() {
    return (
      window[MICROSOFT_CONFIG_KEY] ||
      FALLBACK_MICROSOFT_CLIENT_ID
    ).trim();
  }

  function microsoftAuthority() {
    return window[MICROSOFT_AUTHORITY_KEY] || "https://login.microsoftonline.com/consumers";
  }

  function microsoftRedirectUri() {
    return window[MICROSOFT_REDIRECT_URI_KEY] || (window.location.origin + "/ingles/basico/notas.html");
  }

  function microsoftScopes() {
    return Array.isArray(window[MICROSOFT_SCOPES_KEY]) ? window[MICROSOFT_SCOPES_KEY] : ["User.Read"];
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
    if (value.indexOf("/frances/niveau 8/") !== -1 || value.indexOf("/frances/niveau%208/") !== -1) return "Fran\u00e7ais Niveau 8";
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

  function readStoredUser(key, provider) {
    try {
      const saved = JSON.parse(sessionStorage.getItem(key) || "null");
      if (!saved || !saved.exp || Date.now() / 1000 > saved.exp) {
        sessionStorage.removeItem(key);
        return null;
      }
      return Object.assign({ provider: provider }, saved);
    } catch (error) {
      sessionStorage.removeItem(key);
      return null;
    }
  }

  function readUser() {
    const googleUser = readStoredUser(GOOGLE_USER_KEY, "google");
    if (googleUser && googleUser.credential) return googleUser;
    const microsoftUser = readStoredUser(MICROSOFT_USER_KEY, "microsoft");
    if (microsoftUser && microsoftUser.credential) return microsoftUser;
    const localUser = readStoredUser(LOCAL_USER_KEY, "local");
    if (localUser && localUser.credential) return localUser;
    return null;
  }

  function userProgressKey() {
    const userId = currentUser && (currentUser.sub || currentUser.email);
    return userId ? "jaralingua_progress_" + userId : "";
  }

  function userActivityKey() {
    return userActivityKeyForPath(pageKey());
  }

  function userActivityKeyForPath(path) {
    const userId = currentUser && (currentUser.sub || currentUser.email);
    if (!userId) return "";
    return "jaralingua_activity_" + userId + "_" + encodeURIComponent(path || pageKey());
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
    writeProgressLocal(progress);
    queueProgressSync(progress);
  }

  function writeProgressLocal(progress) {
    const key = userProgressKey();
    if (!key) return;
    localStorage.setItem(key, JSON.stringify(progress));
  }

  function cloudAuthToken() {
    return currentUser && currentUser.credential;
  }

  function cloudAuthProvider() {
    return (currentUser && currentUser.provider) || "google";
  }

  function cloudCanSync() {
    return !!(cloudAuthToken() && window.fetch);
  }

  function cloudFetch(path, options) {
    const settings = Object.assign({
      method: "GET",
      headers: {}
    }, options || {});
    settings.headers = Object.assign({
      Authorization: "Bearer " + cloudAuthToken(),
      "X-Jaralingua-Auth-Provider": cloudAuthProvider()
    }, settings.headers || {});
    if (settings.body && !settings.headers["Content-Type"]) {
      settings.headers["Content-Type"] = "application/json";
    }

    return fetch(API_ROOT + path, settings).then(function (response) {
      if (!response.ok) throw new Error("Cloud sync failed: " + response.status);
      return response.json();
    });
  }

  function queueProgressSync(progress) {
    if (!cloudCanSync()) return;
    if (!cloudProgressLoaded) {
      pendingProgressSync = true;
      return;
    }

    clearTimeout(cloudProgressTimer);
    cloudProgressTimer = setTimeout(function () {
      cloudFetch("/progress", {
        method: "PUT",
        body: JSON.stringify({ progress: progress })
      }).catch(function () {
        pendingProgressSync = true;
      });
    }, CLOUD_SYNC_DELAY);
  }

  function queueActivitySync(path, draft) {
    if (!cloudCanSync()) return;
    if (!cloudProgressLoaded) {
      pendingActivitySync[path || pageKey()] = true;
      return;
    }

    const activityPath = path || pageKey();
    clearTimeout(activitySyncTimers[activityPath]);
    activitySyncTimers[activityPath] = setTimeout(function () {
      cloudFetch("/activity", {
        method: "PUT",
        body: JSON.stringify({
          path: activityPath,
          draft: draft
        })
      }).catch(function () {
        pendingActivitySync[activityPath] = true;
      });
    }, CLOUD_SYNC_DELAY);
  }

  function queueActivityDelete(path) {
    if (!cloudCanSync() || !cloudProgressLoaded) return;
    const activityPath = path || pageKey();
    cloudFetch("/activity?path=" + encodeURIComponent(activityPath), {
      method: "DELETE"
    }).catch(function () {
      pendingActivitySync[activityPath] = true;
    });
  }

  function recordTime(record) {
    return Date.parse((record && record.updatedAt) || "") || 0;
  }

  function mergeProgress(localProgress, remoteProgress) {
    const local = localProgress && localProgress.pages ? localProgress : { pages: {}, lastPage: null };
    const remote = remoteProgress && remoteProgress.pages ? remoteProgress : { pages: {}, lastPage: null };
    const pages = Object.assign({}, remote.pages || {});

    Object.keys(local.pages || {}).forEach(function (key) {
      const localPage = local.pages[key];
      const remotePage = pages[key];
      if (!remotePage || recordTime(localPage) >= recordTime(remotePage)) {
        pages[key] = localPage;
      }
    });

    const lastCandidates = [remote.lastPage, local.lastPage].filter(Boolean);
    const lastPage = lastCandidates.sort(function (a, b) {
      return recordTime(b) - recordTime(a);
    })[0] || null;

    return {
      pages: pages,
      lastPage: lastPage
    };
  }

  function mergeActivityDraft(localDraft, remoteDraft) {
    const local = localDraft && localDraft.fields ? localDraft : { fields: {}, updatedAt: null };
    const remote = remoteDraft && remoteDraft.fields ? remoteDraft : { fields: {}, updatedAt: null };
    if (!Object.keys(remote.fields || {}).length) return local;
    if (!Object.keys(local.fields || {}).length) return remote;

    if (recordTime(remote) > recordTime(local)) {
      return {
        fields: Object.assign({}, local.fields, remote.fields),
        updatedAt: remote.updatedAt
      };
    }

    return {
      fields: Object.assign({}, remote.fields, local.fields),
      updatedAt: local.updatedAt
    };
  }

  function syncCloudData() {
    if (!cloudCanSync()) return;

    cloudFetch("/progress").then(function (data) {
      const mergedProgress = mergeProgress(readProgress(), data.progress);
      writeProgressLocal(mergedProgress);

      const activities = data.activities || {};
      Object.keys(activities).forEach(function (activityPath) {
        const mergedDraft = mergeActivityDraft(readActivityDraft(activityPath), activities[activityPath]);
        writeActivityDraftLocal(mergedDraft, activityPath);
      });

      cloudProgressLoaded = true;
      renderWidget();
      renderDashboard();
      restoreSavedActivity();
      updateActivityPanelCount();

      if (pendingProgressSync) {
        pendingProgressSync = false;
        queueProgressSync(mergedProgress);
      }

      Object.keys(pendingActivitySync).forEach(function (activityPath) {
        queueActivitySync(activityPath, readActivityDraft(activityPath));
      });
      pendingActivitySync = {};
    }).catch(function () {
      cloudProgressLoaded = false;
    });
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
    openPanel();
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
    const provider = user && user.provider === "microsoft" ? "microsoft" : (user && user.provider === "local" ? "local" : "google");
    currentUser = Object.assign({}, user, { provider: provider });
    publishAuthState();
    cloudProgressLoaded = false;
    pendingProgressSync = false;
    pendingActivitySync = {};
    sessionStorage.removeItem(GOOGLE_USER_KEY);
    sessionStorage.removeItem(MICROSOFT_USER_KEY);
    sessionStorage.removeItem(LOCAL_USER_KEY);
    sessionStorage.setItem(provider === "microsoft" ? MICROSOFT_USER_KEY : (provider === "local" ? LOCAL_USER_KEY : GOOGLE_USER_KEY), JSON.stringify(currentUser));
    trackPageVisit();
    renderWidget();
    renderDashboard();
    restoreSavedActivity();
    saveAllActivityFields();
    syncCloudData();
    updateDownloadLocks();
    notifyAuthChange(true);
  }

  function publishAuthState() {
    window.JaraLinguaCurrentUser = currentUser ? Object.assign({}, currentUser) : null;
    window.JaraLinguaAuth = Object.assign(window.JaraLinguaAuth || {}, {
      getUser: function () {
        return currentUser ? Object.assign({}, currentUser) : null;
      },
      isAuthenticated: function () {
        return !!(currentUser && currentUser.credential);
      },
      openPanel: openPanel,
      closePanel: closePanel
    });
  }

  function notifyAuthChange(authenticated) {
    try {
      window.dispatchEvent(new CustomEvent("jaralingua:auth-changed", {
        detail: {
          authenticated: authenticated === true,
          provider: authenticated === true && currentUser ? currentUser.provider || "google" : ""
        }
      }));
    } catch (_error) {
      /* Les pages peuvent toujours relire la session au prochain focus. */
    }
  }

  function signOut() {
    if (currentUser && currentUser.provider === "microsoft") {
      signOutMicrosoftSession();
    }
    sessionStorage.removeItem(GOOGLE_USER_KEY);
    sessionStorage.removeItem(MICROSOFT_USER_KEY);
    sessionStorage.removeItem(LOCAL_USER_KEY);
    currentUser = null;
    publishAuthState();
    buttonRendered = false;
    cloudProgressLoaded = false;
    pendingProgressSync = false;
    pendingActivitySync = {};
    clearTimeout(cloudProgressTimer);
    Object.keys(activitySyncTimers).forEach(function (key) {
      clearTimeout(activitySyncTimers[key]);
    });
    activitySyncTimers = {};

    if (window.google && google.accounts && google.accounts.id) {
      google.accounts.id.disableAutoSelect();
    }

    renderWidget();
    renderDashboard();
    updateDownloadLocks();
    notifyAuthChange(false);
  }

  window.jaralinguaHandleGoogleCredential = function (response) {
    if (!response || !response.credential) return;

    const profile = decodeJwt(response.credential);
    saveUser({
      provider: "google",
      name: profile.name || profile.given_name || profile.email,
      email: profile.email,
      picture: profile.picture,
      sub: profile.sub,
      exp: profile.exp,
      credential: response.credential
    });

    if (currentRoleStatus()) {
      closePanel();
    } else {
      openPanel();
    }
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

      .jaralingua-auth-nav-item {
        display: flex;
        align-items: center;
        list-style: none;
      }

      .jaralingua-auth-nav {
        display: inline-flex;
        align-items: center;
        position: relative;
        z-index: 1300;
        font-family: Arial, Helvetica, sans-serif;
      }

      .jaralingua-auth button,
      .jaralingua-auth-nav button,
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
        font-size: 0.95rem;
        font-weight: 900;
        box-shadow: 0 14px 32px rgba(15, 23, 42, 0.14);
        cursor: pointer;
      }

      .jaralingua-auth-nav .auth-trigger {
        min-height: 36px;
        padding: 0 12px;
        box-shadow: none;
        border: 1px solid rgba(18, 59, 143, 0.14);
        background: #f8fbff;
      }

      .jaralingua-auth-nav .auth-panel {
        left: auto;
        right: 0;
        top: calc(100% + 10px);
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
        max-height: min(720px, calc(100vh - 112px));
        overflow-y: auto;
        padding: 18px;
        border-radius: 22px;
        background: rgba(255, 255, 255, 0.98);
        border: 1px solid rgba(18, 59, 143, 0.12);
        box-shadow: 0 24px 52px rgba(15, 23, 42, 0.2);
      }

      .auth-panel[hidden] {
        display: none;
      }

      @media (max-width: 680px) {
        .jaralingua-auth-nav .auth-trigger {
          max-width: 168px;
        }

        .jaralingua-auth-nav .auth-panel {
          position: fixed;
          left: max(12px, env(safe-area-inset-left));
          right: max(12px, env(safe-area-inset-right));
          top: max(76px, calc(env(safe-area-inset-top) + 14px));
          bottom: max(12px, env(safe-area-inset-bottom));
          width: auto;
          max-width: none;
          max-height: none;
          overflow-y: auto;
          overscroll-behavior: contain;
          -webkit-overflow-scrolling: touch;
        }
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

      .auth-provider-list {
        display: grid;
        gap: 10px;
      }

      .auth-microsoft-button {
        min-height: 44px;
        width: 280px;
        max-width: 100%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        padding: 0 14px;
        border: 1px solid #dadce0;
        border-radius: 999px;
        background: #ffffff;
        color: #1f1f1f;
        font-size: 0.94rem;
        font-weight: 800;
        cursor: pointer;
      }

      .auth-microsoft-button:hover {
        border-color: #8ab4f8;
        box-shadow: 0 3px 10px rgba(60, 64, 67, 0.12);
      }

      .auth-microsoft-button:disabled {
        cursor: wait;
        opacity: 0.72;
      }

      .auth-local-form {
        border-top: 1px solid rgba(31, 78, 140, 0.12);
        display: grid;
        gap: 0.55rem;
        margin-top: 0.85rem;
        padding-top: 0.85rem;
      }

      .auth-local-form strong {
        color: #15345d;
        font-weight: 900;
      }

      .auth-local-form input {
        width: 100%;
        border: 1px solid rgba(31, 78, 140, 0.18);
        border-radius: 12px;
        font: inherit;
        padding: 0.7rem 0.8rem;
      }

      .auth-local-form button {
        width: 100%;
      }

      .auth-microsoft-icon {
        width: 18px;
        height: 18px;
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 2px;
        flex: 0 0 18px;
      }

      .auth-microsoft-icon span:nth-child(1) { background: #f25022; }
      .auth-microsoft-icon span:nth-child(2) { background: #7fba00; }
      .auth-microsoft-icon span:nth-child(3) { background: #00a4ef; }
      .auth-microsoft-icon span:nth-child(4) { background: #ffb900; }

      .auth-config-note,
      .auth-role-choice,
      .auth-google-status,
      .auth-microsoft-status,
      .auth-download-note {
        border-radius: 16px;
        padding: 14px;
        background: #fff7e8;
        color: #7c4a03;
        font-weight: 800;
      }

      .auth-google-status[hidden],
      .auth-microsoft-status[hidden] {
        display: none;
      }

      .auth-role-choice {
        display: grid;
        gap: 10px;
        margin-top: 12px;
        background: #f8fbff;
        color: #071f4f;
      }

      .auth-role-choice p {
        margin: 0;
      }

      .auth-role-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
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

      .auth-current-progress {
        display: grid;
        gap: 8px;
        margin: 12px 0 14px;
        padding: 12px;
        border-radius: 16px;
        background: #f8fbff;
        color: #071f4f;
      }

      .auth-current-progress strong,
      .auth-current-progress span,
      .auth-current-progress small {
        display: block;
        min-width: 0;
        overflow-wrap: anywhere;
      }

      .auth-current-progress span,
      .auth-current-progress small {
        color: #64748b;
        font-weight: 800;
      }

      .auth-current-progress small {
        font-size: 0.76rem;
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
          position: fixed;
          left: max(12px, env(safe-area-inset-left));
          right: max(12px, env(safe-area-inset-right));
          top: max(76px, calc(env(safe-area-inset-top) + 14px));
          bottom: max(12px, env(safe-area-inset-bottom));
          width: auto;
          max-width: none;
          max-height: none;
          overflow-y: auto;
          overscroll-behavior: contain;
          -webkit-overflow-scrolling: touch;
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

    const navRoot = createNavAccess();
    if (navRoot) {
      navRoot.classList.add("jaralingua-auth-nav");
      navRoot.setAttribute("data-jaralingua-auth", "");
      return navRoot;
    }

    root = document.createElement("div");
    root.className = "jaralingua-auth";
    root.setAttribute("data-jaralingua-auth", "");
    document.body.insertBefore(root, document.body.firstChild);
    return root;
  }

  function createNavAccess() {
    const navTarget = document.querySelector(".site-header .nav-links, .site-header .navbar-nav, .site-header .navbar");
    if (!navTarget) return null;

    let navRoot = document.querySelector("[data-jaralingua-auth-nav]");
    if (navRoot) return navRoot;

    navRoot = document.createElement("div");
    navRoot.className = "jaralingua-auth-nav";
    navRoot.setAttribute("data-jaralingua-auth-nav", "");

    if (navTarget.matches("ul, ol")) {
      const item = document.createElement("li");
      item.className = "jaralingua-auth-nav-item nav-item";
      item.appendChild(navRoot);
      navTarget.appendChild(item);
    } else {
      navTarget.appendChild(navRoot);
    }

    return navRoot;
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

    return `<button class="auth-trigger" type="button" data-auth-toggle><span class="auth-initial">J</span><span>${copy.signIn}</span></button>`;
  }

  function authRoleChoiceMarkup(roleStatus) {
    if (roleStatus) return "";
    return `
      <div class="auth-role-choice">
        <strong>${copy.chooseRole}</strong>
        <p>${copy.chooseRoleText}</p>
        <div class="auth-role-actions">
          <button class="role-action" type="button" data-request-role="student">${copy.requestStudent}</button>
          <button class="role-action secondary" type="button" data-request-role="teacher">${copy.requestTeacher}</button>
        </div>
      </div>
    `;
  }

  function localLoginPath() {
    const path = window.location.pathname || "";
    if (path.indexOf("/ingles/basico/") !== -1 || /\/ingles\/basico$/i.test(path)) {
      return "/api/basic/grades/login";
    }
    if (path.indexOf("/ingles/intermediate/") !== -1 || /\/ingles\/intermediate$/i.test(path)) {
      return "/api/intermediate/grades/login";
    }
    return "";
  }

  function localLoginMarkup() {
    if (!localLoginPath()) return "";
    return `
      <form class="auth-local-form" data-local-login-form>
        <strong>${copy.localSignIn}</strong>
        <input type="text" name="email" autocomplete="username" placeholder="${escapeAttribute(copy.localEmail)}" required>
        <input type="password" name="password" autocomplete="current-password" placeholder="${escapeAttribute(copy.localPassword)}" required>
        <button class="auth-microsoft-button" type="submit">${copy.localSubmit}</button>
        <div class="auth-microsoft-status" data-local-status hidden></div>
      </form>
    `;
  }

  function panelMarkup() {
    if (currentUser) {
      const stats = progressStats();
      const draftStats = activityDraftStats();
      const last = stats.progress.lastPage;
      const roleStatus = currentRoleStatus();
      const current = stats.progress.pages[pageKey()] || currentPageRecord("in-progress");
      return `
        <div class="auth-panel" data-auth-panel hidden>
          <h2>${copy.studentSpace}</h2>
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
          ${authRoleChoiceMarkup(roleStatus)}
          <div class="auth-current-progress">
            <strong>${copy.currentPage}</strong>
            <span>${escapeHtml(current.title)} · ${escapeHtml(statusCopy[current.status] || copy.inProgress)}</span>
            <div class="status-actions">
              ${statusButton("pending", current.status, copy.markPending)}
              ${statusButton("in-progress", current.status, copy.markInProgress)}
              ${statusButton("completed", current.status, copy.markCompleted)}
            </div>
            <small>${copy.savedHere}</small>
          </div>
          <div class="auth-current-progress">
            <strong>${copy.activityAutosave}</strong>
            <span>${draftStats.count} ${copy.savedAnswers}</span>
            <button class="activity-clear-action" type="button" data-clear-activity-progress>${copy.clearAnswers}</button>
          </div>
          ${adminPanelMarkup()}
          <div class="auth-menu">
            <a href="${last ? escapeAttribute(last.url) : "#"}" data-auth-last>${copy.continue}</a>
            <a href="${rootHref("ingles/basico/notas.html")}">${copy.basicEnglishGrades}</a>
            <a href="${rootHref("ingles/intermediate/notas.html")}">${copy.intermediateEnglishGrades}</a>
            <a href="${rootHref("frances/Niveau%207/notes-evaluation.html")}">${copy.french7Grades}</a>
            <a href="${rootHref("frances/Niveau%208/notes-evaluation.html")}">${copy.french8Grades}</a>
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
        <p>${clientId() || microsoftClientId() ? "" : copy.configured}</p>
        <div class="auth-provider-list">
          <div class="auth-google-button" data-google-button></div>
          ${microsoftClientId() ? `
            <button class="auth-microsoft-button" type="button" data-microsoft-login>
              <span class="auth-microsoft-icon" aria-hidden="true"><span></span><span></span><span></span><span></span></span>
              <span>${copy.microsoftSignIn}</span>
            </button>
          ` : ""}
        </div>
        <div class="auth-google-status" data-google-status hidden></div>
        <div class="auth-microsoft-status" data-microsoft-status hidden></div>
        ${localLoginMarkup()}
        ${clientId() || microsoftClientId() ? "" : `<div class="auth-config-note">${copy.hint}</div>`}
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
    const microsoftButton = root.querySelector("[data-microsoft-login]");
    const localForm = root.querySelector("[data-local-login-form]");
    const lastLink = root.querySelector("[data-auth-last]");

    toggle.addEventListener("click", function () {
      panel.hidden = !panel.hidden;
      if (!panel.hidden) renderGoogleButton();
    });

    closeButtons.forEach(function (button) {
      button.addEventListener("click", closePanel);
    });
    if (signOutButton) signOutButton.addEventListener("click", signOut);
    if (microsoftButton) {
      microsoftButton.addEventListener("click", function () {
        signInMicrosoft(microsoftButton);
      });
    }
    if (localForm) {
      localForm.addEventListener("submit", function (event) {
        event.preventDefault();
        signInLocal(localForm);
      });
    }
    if (lastLink && lastLink.getAttribute("href") === "#") {
      lastLink.addEventListener("click", function (event) {
        event.preventDefault();
        showToast(copy.noLastPage);
      });
    }

    root.querySelectorAll("[data-request-role]").forEach(function (button) {
      button.addEventListener("click", function () {
        requestRole(button.getAttribute("data-request-role"));
      });
    });

    root.querySelectorAll("[data-progress-status]").forEach(function (button) {
      button.addEventListener("click", function () {
        setPageStatus(button.getAttribute("data-progress-status"));
      });
    });

    root.querySelectorAll("[data-clear-activity-progress]").forEach(function (button) {
      button.addEventListener("click", function () {
        clearSavedActivity(true);
      });
    });

    root.querySelectorAll("[data-approve-role]").forEach(function (button) {
      button.addEventListener("click", function () {
        approveRoleRequest(button.getAttribute("data-request-id"), button.getAttribute("data-approve-role"));
      });
    });

    if (!root.matches("[data-jaralingua-auth-nav]")) renderNavAccess();
  }

  function renderNavAccess() {
    const navRoot = createNavAccess();
    if (!navRoot) return;

    navRoot.innerHTML = triggerMarkup().replace("data-auth-toggle", "data-auth-nav-toggle");
    const toggle = navRoot.querySelector("[data-auth-nav-toggle]");
    if (!toggle) return;

    toggle.addEventListener("click", function (event) {
      event.stopPropagation();
      const panel = document.querySelector("[data-auth-panel]");
      if (!panel) return;
      if (panel.hidden) {
        openPanel();
      } else {
        closePanel();
      }
    });
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

  function setMicrosoftStatus(message) {
    const status = document.querySelector("[data-microsoft-status]");
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
        cancel_on_tap_outside: true,
        use_fedcm_for_button: true
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

  function microsoftAuthConfig() {
    return {
      auth: {
        clientId: microsoftClientId(),
        authority: microsoftAuthority(),
        redirectUri: microsoftRedirectUri()
      },
      cache: {
        cacheLocation: "sessionStorage"
      }
    };
  }

  function microsoftApp() {
    if (!window.msal) throw new Error("Microsoft sign-in library is not available.");
    if (!microsoftClient) {
      microsoftClient = new window.msal.PublicClientApplication(microsoftAuthConfig());
    }
    return microsoftClient;
  }

  function ensureMicrosoftScriptReady() {
    if (window.msal) return Promise.resolve();
    if (microsoftLoadPromise) return microsoftLoadPromise;

    setMicrosoftStatus(copy.microsoftLoading);
    microsoftLoadStarted = true;
    microsoftLoadPromise = new Promise(function (resolve, reject) {
      let script = document.querySelector('script[src*="msal-browser"]');
      if (!script) {
        script = document.createElement("script");
        script.src = MICROSOFT_SCRIPT_SRC;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }

      script.addEventListener("load", function () {
        if (window.msal) {
          setMicrosoftStatus("");
          resolve();
          return;
        }
        reject(new Error("MSAL did not initialize."));
      }, { once: true });

      script.addEventListener("error", function () {
        reject(new Error("MSAL script failed."));
      }, { once: true });

      setTimeout(function () {
        if (window.msal) {
          setMicrosoftStatus("");
          resolve();
        }
      }, microsoftLoadStarted ? 450 : 0);
    }).catch(function (error) {
      microsoftLoadPromise = null;
      setMicrosoftStatus(copy.microsoftUnavailable);
      throw error;
    });

    return microsoftLoadPromise;
  }

  function storeMicrosoftSession(account, tokenResponse) {
    const expiresOn = tokenResponse.expiresOn instanceof Date
      ? Math.floor(tokenResponse.expiresOn.getTime() / 1000)
      : Math.floor(Date.now() / 1000) + 3300;
    const email = (account && (account.username || account.name)) || "";

    saveUser({
      provider: "microsoft",
      sub: (account && (account.homeAccountId || account.localAccountId)) || email,
      email: email,
      name: (account && account.name) || email,
      picture: "",
      credential: tokenResponse.accessToken,
      exp: expiresOn
    });

    if (currentRoleStatus()) {
      closePanel();
    } else {
      openPanel();
    }
  }

  function signInMicrosoft(button) {
    if (!microsoftClientId()) {
      setMicrosoftStatus(copy.microsoftUnavailable);
      return;
    }

    button.disabled = true;
    setMicrosoftStatus(copy.microsoftLoading);

    ensureMicrosoftScriptReady().then(function () {
      const app = microsoftApp();
      return app.loginPopup({
        scopes: microsoftScopes(),
        prompt: "select_account"
      }).then(function (loginResponse) {
        const account = loginResponse.account;
        if (app.setActiveAccount) app.setActiveAccount(account);
        return app.acquireTokenSilent({
          scopes: microsoftScopes(),
          account: account
        }).catch(function () {
          return app.acquireTokenPopup({
            scopes: microsoftScopes(),
            account: account
          });
        }).then(function (tokenResponse) {
          setMicrosoftStatus("");
          storeMicrosoftSession(account, tokenResponse);
        });
      });
    }).catch(function () {
      setMicrosoftStatus(copy.microsoftPopupBlocked);
    }).finally(function () {
      button.disabled = false;
    });
  }

  function setLocalStatus(message, isError) {
    const status = document.querySelector("[data-local-status]");
    if (!status) return;
    status.hidden = !message;
    status.textContent = message || "";
    status.style.color = isError ? "#b42336" : "#177a52";
  }

  function signInLocal(form) {
    const endpoint = localLoginPath();
    if (!endpoint) {
      setLocalStatus(copy.localUnavailable, true);
      return;
    }
    const button = form.querySelector("button[type='submit']");
    const email = form.elements.email && form.elements.email.value;
    const password = form.elements.password && form.elements.password.value;
    if (!email || !password) {
      setLocalStatus(copy.localInvalid, true);
      return;
    }
    button.disabled = true;
    setLocalStatus(copy.localLoading, false);
    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email, password: password })
    }).then(function (response) {
      return response.json().catch(function () { return {}; }).then(function (data) {
        if (!response.ok) throw data;
        return data;
      });
    }).then(function (data) {
      const user = data.user || {};
      saveUser({
        provider: "local",
        sub: user.sub || user.email,
        email: user.email,
        name: user.name || user.email,
        picture: "",
        credential: data.token,
        exp: data.exp
      });
      setLocalStatus("", false);
      closePanel();
    }).catch(function () {
      setLocalStatus(copy.localInvalid, true);
    }).finally(function () {
      button.disabled = false;
    });
  }

  function signOutMicrosoftSession() {
    if (!window.msal || !microsoftClient) return;
    try {
      const account = microsoftClient.getActiveAccount && microsoftClient.getActiveAccount();
      if (account && microsoftClient.logoutPopup) {
        microsoftClient.logoutPopup({ account: account }).catch(function () {});
      }
    } catch (error) {}
  }

  function renderDashboard() {
    document.querySelectorAll("[data-jaralingua-dashboard]").forEach(function (dashboard) {
      dashboard.remove();
    });
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
    if (element.closest("[data-jaralingua-auth], [data-jaralingua-dashboard], [data-jaralingua-managed-draft]")) return false;
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

  function readActivityDraft(path) {
    const key = path ? userActivityKeyForPath(path) : userActivityKey();
    if (!key) return { fields: {}, updatedAt: null };
    try {
      const saved = JSON.parse(localStorage.getItem(key) || "null");
      if (saved && saved.fields) return saved;
    } catch (error) {
      localStorage.removeItem(key);
    }
    return { fields: {}, updatedAt: null };
  }

  function saveActivityDraft(draft, path) {
    writeActivityDraftLocal(draft, path);
    queueActivitySync(path || pageKey(), draft);
  }

  function writeActivityDraftLocal(draft, path) {
    const key = path ? userActivityKeyForPath(path) : userActivityKey();
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
    const activityPath = pageKey();
    const key = userActivityKey();
    if (key) localStorage.removeItem(key);
    queueActivityDelete(activityPath);
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

  function initStudentIdClaimRetry() {
    if (window.__jaralinguaStudentIdClaimRetry || typeof window.fetch !== "function") return;
    window.__jaralinguaStudentIdClaimRetry = true;
    const originalFetch = window.fetch.bind(window);
    const courseConfig = {
      basic: {
        claimKey: "jaralingua_basic_student_id_claim",
        label: "Basic English",
        spanishLabel: "Inglés Básico"
      },
      intermediate: {
        claimKey: "jaralingua_intermediate_student_id_claim",
        label: "Intermediate English",
        spanishLabel: "Inglés Intermedio"
      }
    };

    function urlText(input) {
      if (typeof input === "string") return input;
      if (input && typeof input.url === "string") return input.url;
      return "";
    }

    function courseForRequest(input, init) {
      const method = String((init && init.method) || (input && input.method) || "GET").toUpperCase();
      const url = urlText(input);
      if (/\/api\/intermediate\//.test(url) && method === "POST" && /\/submit(?:$|\?)/.test(url)) {
        return "intermediate";
      }
      if (/\/api\/basic\//.test(url)) {
        if (method === "POST" && /\/(?:submit|generate)(?:$|\?)/.test(url)) return "basic";
        if (method === "GET" && /\/api\/basic\/(?:integrated-task|integrated-task\/audio|integrated-task-andres-munoz-retake|integrated-task-andres-munoz-retake\/audio|unit6-neighborhood-gallery)(?:$|\?)/.test(url)) return "basic";
      }
      return "";
    }

    function parseJsonBody(init) {
      if (!init || typeof init.body !== "string") return null;
      try {
        const payload = JSON.parse(init.body);
        return payload && typeof payload === "object" && !Array.isArray(payload) ? payload : null;
      } catch (_error) {
        return null;
      }
    }

    function withClaim(init, claim) {
      const headers = new Headers((init && init.headers) || {});
      if (claim) headers.set("X-Jaralingua-Student-Id-Claim", claim);
      const payload = parseJsonBody(init);
      if (!payload || !claim) return Object.assign({}, init || {}, { headers });
      if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
      return Object.assign({}, init || {}, {
        headers,
        body: JSON.stringify(Object.assign({}, payload, { studentIdClaim: claim }))
      });
    }

    function savedClaim(course) {
      const config = courseConfig[course];
      return String(sessionStorage.getItem(config.claimKey) || "").replace(/\D+/g, "");
    }

    async function unauthorizedStudent(response) {
      if (!response || response.status !== 403) return false;
      try {
        const payload = await response.clone().json();
        return payload && payload.error === "student_not_authorized";
      } catch (_error) {
        return false;
      }
    }

    function promptForClaim(course) {
      const config = courseConfig[course];
      const activeEmail = (currentUser && currentUser.email) ? "\nSigned in as: " + currentUser.email : "";
      const claim = String(window.prompt(
        "We could not find your email in the " + config.label + " gradebook." + activeEmail +
        "\n\nPlease type your ID/document number to link this delivery to your student record." +
        "\n\nNo encontramos tu correo en la grilla de " + config.spanishLabel + ". Escribe tu documento/ID para validar tu entrega:",
        ""
      ) || "").replace(/\D+/g, "");
      if (claim) sessionStorage.setItem(config.claimKey, claim);
      return claim;
    }

    window.fetch = async function jaralinguaFetchWithStudentClaim(input, init) {
      const course = courseForRequest(input, init);
      if (!course) {
        return originalFetch(input, init);
      }
      let requestInit = init || {};
      const existingPayload = parseJsonBody(requestInit);
      const remembered = savedClaim(course);
      if (remembered && (!existingPayload || (!existingPayload.studentIdClaim && !existingPayload.studentId))) {
        requestInit = withClaim(requestInit, remembered);
      }
      const firstResponse = await originalFetch(input, requestInit);
      if (!(await unauthorizedStudent(firstResponse))) return firstResponse;
      const alreadyClaimed = parseJsonBody(requestInit);
      const sentHeaderClaim = String(new Headers((requestInit && requestInit.headers) || {}).get("X-Jaralingua-Student-Id-Claim") || "").replace(/\D+/g, "");
      if ((alreadyClaimed && (alreadyClaimed.studentIdClaim || alreadyClaimed.studentId)) || sentHeaderClaim) {
        sessionStorage.removeItem(courseConfig[course].claimKey);
        return firstResponse;
      }
      const claim = promptForClaim(course);
      if (!claim) return firstResponse;
      return originalFetch(input, withClaim(init || {}, claim));
    };
  }

  let authRuntimeStarted = false;

  function renderAuthEntryPoint() {
    if (!document.body || document.querySelector("[data-jaralingua-auth]")) return;
    renderWidget();
  }

  function startAuthRuntime() {
    if (authRuntimeStarted) return;
    authRuntimeStarted = true;
    publishAuthState();
    initStudentIdClaimRetry();
    initGoogle();
    if (currentUser) {
      trackPageVisit();
      syncCloudData();
    }
    renderAuthEntryPoint();
    renderDashboard();
    protectDownloads();
    initActivityAutosave();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderAuthEntryPoint, { once: true });
  } else {
    renderAuthEntryPoint();
  }

  if (document.readyState === "complete") {
    startAuthRuntime();
  } else {
    window.addEventListener("load", startAuthRuntime, { once: true });
  }

  document.addEventListener("click", function (event) {
    const root = document.querySelector("[data-jaralingua-auth]");
    const externalAuthTrigger = event.target && event.target.closest ? event.target.closest("[data-open-google-login]") : null;
    if (externalAuthTrigger) return;
    if (!root || root.contains(event.target)) return;
    closePanel();
  });
})();
