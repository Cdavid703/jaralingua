(function () {
  const USER_KEY = "jaralingua_google_user";
  const ROLE_REQUESTS_KEY = "jaralingua_role_requests";
  const STUDENT_LINKS_KEY = "jaralingua_french7_student_links";
  const ADMIN_EMAILS = ["cdavid.jaramillo@gmail.com"];

  const students = [
    {
      id: "1039083985",
      fullName: "Carmen Rosa Colorado Morales",
      level: "Intensivo Nivel 7",
      email: "crcolorado@correo.iue.edu.co",
      contact: "3005494483",
      bookDate: "2026-05-19",
      grades: { debateMay8: 4.4 }
    },
    {
      id: "1122508989",
      fullName: "Camilo Daza Rave",
      level: "Intensivo Nivel 7",
      email: "cdaza@correo.iue.edu.co",
      contact: "3158130379",
      bookDate: "2026-05-26",
      grades: { debateMay8: 4.0 }
    },
    {
      id: "1040572353",
      fullName: "Cristian David Gaviria Moncada",
      level: "Intensivo Nivel 7",
      email: "luculusu@gmail.com",
      contact: "3054287214",
      bookDate: "2026-05-22",
      grades: { debateMay8: 4.2 }
    },
    {
      id: "1037616675",
      fullName: "Sebastián Bolívar Vélez",
      level: "Intensivo Nivel 6",
      email: "sbolivarv@correo.iue.edu.co",
      contact: "3026426230",
      bookDate: "2026-05-12",
      grades: { debateMay8: 4.9, bookPresentation: 5.0 }
    },
    {
      id: "1036448851",
      fullName: "Tomás Felipe Arango",
      level: "Intensivo Nivel 6",
      email: "tfarango@correo.iue.edu.co",
      contact: "3153690325",
      bookDate: "2026-05-08",
      grades: { debateMay8: 4.0, bookPresentation: 4.0 }
    }
  ];

  const evaluations = [
    {
      id: "finalExam",
      title: "Examen final",
      weight: 20,
      type: "Examen",
      date: "2026-06-05",
      displayDate: "Vendredi 5 juin",
      description: "Évaluation finale sur les thèmes principaux du cours."
    },
    {
      id: "shortStoryProject",
      title: "Conte court avec images",
      weight: 15,
      type: "Projet",
      date: "2026-06-02",
      displayDate: "Mardi 2 juin",
      description: "Remise et présentation orale. Maximum 150 mots."
    },
    {
      id: "debateMay8",
      title: "Debate",
      weight: 15,
      type: "Debate",
      date: "2026-05-08",
      displayDate: "Vendredi 8 mai",
      description: "Premier débat évalué."
    },
    {
      id: "debateMay26",
      title: "Debate",
      weight: 15,
      type: "Debate",
      date: "2026-05-26",
      displayDate: "Mardi 26 mai",
      description: "Deuxième débat évalué."
    },
    {
      id: "quizMay12",
      title: "Quiz",
      weight: 15,
      type: "Quiz",
      date: "2026-05-12",
      displayDate: "Mardi 12 mai",
      description: "Quiz du cours."
    },
    {
      id: "bookPresentation",
      title: "Présentation de livre",
      weight: 15,
      type: "Présentation",
      date: null,
      displayDate: "Date individuelle",
      description: "Présentation orale du livre assigné."
    },
    {
      id: "projectAudio",
      title: "Audio de présentation du projet",
      weight: 5,
      type: "Audio",
      date: "2026-05-25",
      displayDate: "Semaine du 25 au 29 mai",
      description: "Audio d'avancement ou de présentation du projet."
    }
  ];

  const bonusEvent = {
    id: "finalWorkshopBonus",
    title: "Atelier de préparation à l'examen final",
    weight: 0,
    type: "Bonus",
    date: "2026-05-29",
    displayDate: "Vendredi 29 mai",
    description: "Activité informative. Une note supérieure à 4.0 reste enregistrée comme bonus de connaissance."
  };

  let lastSignature = "";
  let reminderShownFor = "";

  function normalizeEmail(value) {
    return String(value || "").trim().toLowerCase();
  }

  function readUser() {
    try {
      const saved = JSON.parse(sessionStorage.getItem(USER_KEY) || "null");
      if (!saved || !saved.exp || Date.now() / 1000 > saved.exp) return null;
      return saved;
    } catch (error) {
      return null;
    }
  }

  function readRoleRequests() {
    try {
      const saved = JSON.parse(localStorage.getItem(ROLE_REQUESTS_KEY) || "[]");
      return Array.isArray(saved) ? saved : [];
    } catch (error) {
      return [];
    }
  }

  function readStudentLinks() {
    try {
      const saved = JSON.parse(localStorage.getItem(STUDENT_LINKS_KEY) || "{}");
      return saved && typeof saved === "object" ? saved : {};
    } catch (error) {
      return {};
    }
  }

  function writeStudentLinks(links) {
    localStorage.setItem(STUDENT_LINKS_KEY, JSON.stringify(links));
  }

  function isAdmin(user) {
    return ADMIN_EMAILS.indexOf(normalizeEmail(user && user.email)) !== -1;
  }

  function currentRole(user) {
    if (!user) return "guest";
    if (isAdmin(user)) return "admin";
    return "student";
  }

  function studentForUser(user) {
    const email = normalizeEmail(user && user.email);
    const directMatch = students.find(function (student) {
      return normalizeEmail(student.email) === email;
    });
    if (directMatch) return directMatch;
    const linkedId = readStudentLinks()[userKey(user)];
    if (!linkedId) return null;
    return students.find(function (student) {
      return student.id === linkedId;
    }) || null;
  }

  function userKey(user) {
    return (user && (user.sub || normalizeEmail(user.email))) || "";
  }

  function linkStudentById(user, studentId) {
    const cleanId = String(studentId || "").replace(/\D/g, "");
    const student = students.find(function (item) {
      return item.id === cleanId;
    });
    if (!student || !userKey(user)) return null;
    const links = readStudentLinks();
    links[userKey(user)] = student.id;
    writeStudentLinks(links);
    return student;
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function parseDate(value) {
    if (!value) return null;
    const parts = value.split("-").map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0, 0);
  }

  function todayDate() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0, 0);
  }

  function dayDiff(date) {
    return Math.round((date.getTime() - todayDate().getTime()) / 86400000);
  }

  function dateForEvaluation(evaluation, student) {
    return evaluation.id === "bookPresentation" ? student.bookDate : evaluation.date;
  }

  function displayDateForEvaluation(evaluation, student) {
    if (evaluation.id !== "bookPresentation") return evaluation.displayDate;
    return individualBookDateLabel(student.id);
  }

  function individualBookDateLabel(studentId) {
    const labels = {
      "1036448851": "Vendredi 8 mai",
      "1037616675": "Mardi 12 mai",
      "1039083985": "Mardi 19 mai",
      "1040572353": "Vendredi 22 mai",
      "1122508989": "Mardi 26 mai"
    };
    return labels[studentId] || "Date individuelle";
  }

  function formatGrade(value) {
    return typeof value === "number" ? value.toFixed(1) : "En attente";
  }

  function gradeStatus(evaluation, student) {
    const grade = student.grades[evaluation.id];
    if (typeof grade === "number") return { label: "Noté", className: "done" };
    const date = parseDate(dateForEvaluation(evaluation, student));
    if (date && dayDiff(date) < 0) return { label: "Note en attente", className: "late" };
    return { label: "En attente", className: "pending" };
  }

  function gradeSummary(student) {
    let completedWeight = 0;
    let earned = 0;
    evaluations.forEach(function (evaluation) {
      const grade = student.grades[evaluation.id];
      if (typeof grade !== "number") return;
      completedWeight += evaluation.weight;
      earned += grade * evaluation.weight;
    });
    return {
      completedWeight: completedWeight,
      average: completedWeight ? earned / completedWeight : null,
      earnedOnFinalScale: earned / 100
    };
  }

  function obligationItems(student) {
    return evaluations.concat([bonusEvent]).map(function (evaluation) {
      const dateValue = dateForEvaluation(evaluation, student);
      const date = parseDate(dateValue);
      const grade = student.grades[evaluation.id];
      const completed = typeof grade === "number";
      return {
        id: evaluation.id,
        title: evaluation.title,
        type: evaluation.type,
        weight: evaluation.weight,
        date: date,
        displayDate: displayDateForEvaluation(evaluation, student),
        description: evaluation.description,
        completed: completed,
        grade: grade,
        bonus: evaluation.id === bonusEvent.id
      };
    }).sort(function (a, b) {
      return (a.date ? a.date.getTime() : 0) - (b.date ? b.date.getTime() : 0);
    });
  }

  function nextObligation(student) {
    return obligationItems(student).find(function (item) {
      return item.date && dayDiff(item.date) >= 0 && !item.completed;
    }) || null;
  }

  function statusForObligation(item) {
    if (item.completed) return { label: "Noté", className: "done" };
    if (!item.date) return { label: "En attente", className: "pending" };
    const diff = dayDiff(item.date);
    if (diff < 0) return { label: item.bonus ? "Information enregistrée" : "Note en attente", className: "late" };
    if (diff === 0) return { label: "Aujourd'hui", className: "late" };
    if (diff === 1) return { label: "Demain", className: "late" };
    return { label: "Programmé", className: "pending" };
  }

  function renderLocked() {
    return `
      <div class="locked-card">
        <i class="bi bi-shield-lock-fill"></i>
        <h2 class="section-title">Connexion requise</h2>
        <p class="section-text mx-auto" style="max-width: 720px;">
          Connectez-vous pour consulter vos résultats et les échéances du cours. Dans l'espace étudiant, seuls le numéro ID, les notes, les pourcentages, les dates et les états sont affichés.
        </p>
        <button class="btn-main mt-4" type="button" data-open-google-login><i class="bi bi-box-arrow-in-right"></i> Se connecter</button>
      </div>
    `;
  }

  function renderNoRecord(user) {
    return `
      <div class="locked-card">
        <i class="bi bi-person-check-fill"></i>
        <h2 class="section-title">Associer votre numéro ID</h2>
        <p class="section-text mx-auto" style="max-width: 720px;">
          Pour consulter vos résultats, saisissez votre numéro ID institutionnel. Cette étape permet d'afficher uniquement vos notes et vos échéances.
        </p>
        <form class="mt-4 mx-auto" data-link-student-form style="max-width: 420px;">
          <label class="visually-hidden" for="studentIdLinkInput">Numéro ID</label>
          <input id="studentIdLinkInput" class="form-control form-control-lg text-center fw-bold" inputmode="numeric" autocomplete="off" placeholder="Numéro ID" data-link-student-id>
          <button class="btn-main mt-3 w-100" type="submit"><i class="bi bi-check-circle"></i> Voir mes résultats</button>
          <p class="section-text mt-3" data-link-student-error hidden>Numéro ID non trouvé dans le groupe.</p>
        </form>
      </div>
    `;
  }

  function reminderMarkup(student) {
    const item = nextObligation(student);
    if (!item) {
      return `
        <div class="reminder-card">
          <i class="bi bi-check-circle-fill"></i>
          <div>
            <strong>Aucune échéance future enregistrée.</strong>
            <p class="mb-0">Consultez les résultats du cours pour voir les notes saisies et les activités en attente.</p>
          </div>
        </div>
      `;
    }
    const diff = dayDiff(item.date);
    const headline = diff === 0 ? "Échéance aujourd'hui" : diff === 1 ? "Échéance demain" : "Prochaine échéance";
    return `
      <div class="reminder-card ${diff <= 1 ? "is-urgent" : ""}">
        <i class="bi bi-bell-fill"></i>
        <div>
          <strong>${headline}: ${escapeHtml(item.title)}</strong>
          <p class="mb-0">${escapeHtml(item.displayDate)} · ${escapeHtml(item.type)} · ${item.weight ? item.weight + "%": "Bonus"} · ${escapeHtml(item.description)}</p>
        </div>
      </div>
    `;
  }

  function studentMetricsMarkup(student) {
    const summary = gradeSummary(student);
    return `
      <div class="metric-grid">
        <div class="metric-card"><span>Numéro ID</span><strong>${escapeHtml(student.id)}</strong></div>
        <div class="metric-card"><span>Moyenne des notes saisies</span><strong>${summary.average == null ? "En attente" : summary.average.toFixed(2)}</strong></div>
        <div class="metric-card"><span>Pourcentage évalué</span><strong>${summary.completedWeight}%</strong></div>
      </div>
    `;
  }

  function studentGradesRows(student) {
    return evaluations.map(function (evaluation) {
      const status = gradeStatus(evaluation, student);
      return `
        <tr>
          <td>${escapeHtml(evaluation.title)}</td>
          <td>${evaluation.weight}%</td>
          <td>${escapeHtml(displayDateForEvaluation(evaluation, student))}</td>
          <td>${escapeHtml(formatGrade(student.grades[evaluation.id]))}</td>
          <td><span class="status-pill ${status.className}">${escapeHtml(status.label)}</span></td>
        </tr>
      `;
    }).join("");
  }

  function obligationsMarkup(student) {
    return obligationItems(student).map(function (item) {
      const status = statusForObligation(item);
      return `
        <article class="obligation-card">
          <div>
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.description)}</p>
          </div>
          <div class="obligation-meta">
            <span class="status-pill">${escapeHtml(item.displayDate)}</span>
            <span class="status-pill">${item.weight ? item.weight + "%" : "Bonus"}</span>
            <span class="status-pill ${status.className}">${escapeHtml(status.label)}</span>
          </div>
        </article>
      `;
    }).join("");
  }

  function renderStudentPanel(student) {
    return `
      ${reminderMarkup(student)}
      <div class="row g-4">
        <div class="col-lg-5">
          <div class="grades-panel h-100">
            <p class="section-kicker">Suivi individuel</p>
            <h2 class="section-title">Consultation des résultats</h2>
            <p class="section-text">Cet espace affiche uniquement le numéro ID, les notes, les pourcentages, les dates et les états des échéances.</p>
            ${studentMetricsMarkup(student)}
          </div>
        </div>
        <div class="col-lg-7">
          <div class="grades-panel h-100">
            <p class="section-kicker">Résultats</p>
            <h2 class="section-title">Notes du cours</h2>
            <div class="table-wrap">
              <table class="grades-table">
                <thead><tr><th>Évaluation</th><th>Pourcentage</th><th>Date</th><th>Note</th><th>État</th></tr></thead>
                <tbody>${studentGradesRows(student)}</tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <section class="px-0 pb-0">
        <div class="grades-panel">
          <p class="section-kicker">Calendrier</p>
          <h2 class="section-title">Échéances du cours</h2>
          <div class="obligation-grid">${obligationsMarkup(student)}</div>
        </div>
      </section>
    `;
  }

  function staffStudentRows() {
    return students.map(function (student) {
      const summary = gradeSummary(student);
      return `
        <tr>
          <td>${escapeHtml(student.fullName)}<br><span class="status-pill">${escapeHtml(student.level)}</span></td>
          <td>${escapeHtml(student.id)}</td>
          <td>${escapeHtml(student.email)}</td>
          <td>${escapeHtml(student.contact)}</td>
          <td>${summary.average == null ? "En attente" : summary.average.toFixed(2)}</td>
          <td>${summary.completedWeight}%</td>
        </tr>
      `;
    }).join("");
  }

  function staffGradeRows() {
    return students.map(function (student) {
      const gradeCells = evaluations.map(function (evaluation) {
        const status = gradeStatus(evaluation, student);
        return `
          <td>
            <strong>${escapeHtml(formatGrade(student.grades[evaluation.id]))}</strong><br>
            <small>${escapeHtml(displayDateForEvaluation(evaluation, student))}</small><br>
            <span class="status-pill ${status.className}">${escapeHtml(status.label)}</span>
          </td>
        `;
      }).join("");
      return `
        <tr>
          <td>${escapeHtml(student.fullName)}<br><small>${escapeHtml(student.level)}</small></td>
          ${gradeCells}
        </tr>
      `;
    }).join("");
  }

  function staffCalendarMarkup() {
    const events = evaluations.concat([bonusEvent]);
    return events.map(function (evaluation) {
      const display = evaluation.id === "bookPresentation"
        ? "Tomás : 8 mai. Sebastián : 12 mai. Carmen : 19 mai. Cristian : 22 mai. Camilo : 26 mai."
        : evaluation.displayDate;
      return `
        <article class="obligation-card">
          <div>
            <h3>${escapeHtml(evaluation.title)}</h3>
            <p>${escapeHtml(evaluation.description)}</p>
          </div>
          <div class="obligation-meta">
            <span class="status-pill">${escapeHtml(display)}</span>
            <span class="status-pill">${evaluation.weight ? evaluation.weight + "%" : "Bonus"}</span>
            <span class="status-pill pending">${escapeHtml(evaluation.type)}</span>
          </div>
        </article>
      `;
    }).join("");
  }

  function renderStaffPanel(role) {
    const roleLabel = role === "admin" ? "Administrateur" : "Professeur approuvé";
    const totalWeight = evaluations.reduce(function (sum, evaluation) {
      return sum + evaluation.weight;
    }, 0);
    return `
      <div class="privacy-note mb-4">
        <i class="bi bi-shield-check"></i>
        <div>
          <strong>Vue ${roleLabel}</strong>
          <p class="mb-0">Cette vue affiche les données complètes et le résumé des notes. La vue étudiante ne montre ni nom, ni courriel, ni contact.</p>
        </div>
      </div>
      <div class="metric-grid mb-4">
        <div class="metric-card"><span>Étudiants</span><strong>${students.length}</strong></div>
        <div class="metric-card"><span>Pourcentage évaluatif</span><strong>${totalWeight}%</strong></div>
        <div class="metric-card"><span>Bonus</span><strong>Info</strong></div>
      </div>
      <div class="grades-panel mb-4">
        <p class="section-kicker">Données privées</p>
        <h2 class="section-title">Liste des étudiants</h2>
        <div class="table-wrap">
          <table class="grades-table">
            <thead><tr><th>Nom complet</th><th>Numéro ID</th><th>Courriel institutionnel</th><th>Contact</th><th>Moyenne des notes saisies</th><th>Pourcentage évalué</th></tr></thead>
            <tbody>${staffStudentRows()}</tbody>
          </table>
        </div>
      </div>
      <div class="grades-panel mb-4">
        <p class="section-kicker">Résultats</p>
        <h2 class="section-title">Notes du cours</h2>
        <div class="table-wrap">
          <table class="grades-table">
            <thead>
              <tr>
                <th>Étudiant</th>
                ${evaluations.map(function (evaluation) { return `<th>${escapeHtml(evaluation.title)}<br>${evaluation.weight}%</th>`; }).join("")}
              </tr>
            </thead>
            <tbody>${staffGradeRows()}</tbody>
          </table>
        </div>
      </div>
      <div class="grades-panel">
        <p class="section-kicker">Calendrier</p>
        <h2 class="section-title">Échéances du cours</h2>
        <div class="obligation-grid">${staffCalendarMarkup()}</div>
      </div>
    `;
  }

  function openGooglePanel() {
    const trigger = document.querySelector("[data-auth-toggle], [data-auth-nav-toggle]");
    if (trigger) trigger.click();
  }

  function showFloatingReminder(student) {
    const item = nextObligation(student);
    if (!item || !item.date) return;
    const diff = dayDiff(item.date);
    if (diff > 1) return;
    const key = student.id + ":" + item.id + ":" + item.displayDate;
    if (reminderShownFor === key || sessionStorage.getItem("jaralingua_grade_reminder") === key) return;
    reminderShownFor = key;
    sessionStorage.setItem("jaralingua_grade_reminder", key);
    const reminder = document.createElement("div");
    reminder.className = "floating-reminder";
    reminder.innerHTML = `
      <strong>${diff === 0 ? "Échéance aujourd'hui" : "Rappel pour demain"}</strong>
      <p class="mb-0">${escapeHtml(item.title)} · ${escapeHtml(item.displayDate)} · ${escapeHtml(item.description)}</p>
      <button type="button">Compris</button>
    `;
    reminder.querySelector("button").addEventListener("click", function () {
      reminder.remove();
    });
    document.body.appendChild(reminder);
    setTimeout(function () {
      reminder.remove();
    }, 12000);
  }

  function render() {
    const root = document.getElementById("french7GradesApp");
    if (!root) return;
    const user = readUser();
    const role = currentRole(user);
    const signature = user
      ? normalizeEmail(user.email) + ":" + role + ":" + localStorage.getItem(STUDENT_LINKS_KEY)
      : "guest";
    if (signature === lastSignature) return;
    lastSignature = signature;

    if (!user) {
      root.innerHTML = renderLocked();
      const button = root.querySelector("[data-open-google-login]");
      if (button) button.addEventListener("click", openGooglePanel);
      return;
    }

    if (role === "admin" || role === "teacher") {
      root.innerHTML = renderStaffPanel(role);
      return;
    }

    const student = studentForUser(user);
    if (!student) {
      root.innerHTML = renderNoRecord(user);
      const form = root.querySelector("[data-link-student-form]");
      if (form) {
        form.addEventListener("submit", function (event) {
          event.preventDefault();
          const input = root.querySelector("[data-link-student-id]");
          const error = root.querySelector("[data-link-student-error]");
          const linkedStudent = linkStudentById(user, input && input.value);
          if (!linkedStudent) {
            if (error) error.hidden = false;
            return;
          }
          lastSignature = "";
          render();
        });
      }
      return;
    }

    root.innerHTML = renderStudentPanel(student);
    showFloatingReminder(student);
  }

  window.addEventListener("load", function () {
    render();
    setInterval(render, 900);
  });
})();
