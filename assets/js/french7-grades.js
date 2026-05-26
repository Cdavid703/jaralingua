(function () {
  const USER_KEY = "jaralingua_google_user";
  const API_PATH = "/api/french7/grades";

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
    const parts = String(value).split("-").map(Number);
    if (parts.length !== 3 || parts.some(Number.isNaN)) return null;
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

  function individualBookDateLabel(student) {
    return student.bookDate || "Date individuelle";
  }

  function displayDateForEvaluation(evaluation, student) {
    if (evaluation.id !== "bookPresentation") return evaluation.displayDate;
    return individualBookDateLabel(student);
  }

  function formatGrade(value) {
    return typeof value === "number" ? value.toFixed(1) : "En attente";
  }

  function gradeStatus(evaluation, student) {
    const grades = student.grades || {};
    const grade = grades[evaluation.id];
    if (typeof grade === "number") return { label: "Note", className: "done" };
    const date = parseDate(dateForEvaluation(evaluation, student));
    if (date && dayDiff(date) < 0) return { label: "Note en attente", className: "late" };
    return { label: "En attente", className: "pending" };
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

  function obligationItems(student, payload) {
    const events = payload.bonusEvent ? payload.evaluations.concat([payload.bonusEvent]) : payload.evaluations;
    const grades = student.grades || {};
    return events.map(function (evaluation) {
      const dateValue = dateForEvaluation(evaluation, student);
      const date = parseDate(dateValue);
      const grade = grades[evaluation.id];
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
        bonus: payload.bonusEvent && evaluation.id === payload.bonusEvent.id
      };
    }).sort(function (a, b) {
      return (a.date ? a.date.getTime() : 0) - (b.date ? b.date.getTime() : 0);
    });
  }

  function nextObligation(student, payload) {
    return obligationItems(student, payload).find(function (item) {
      return item.date && dayDiff(item.date) >= 0 && !item.completed;
    }) || null;
  }

  function statusForObligation(item) {
    if (item.completed) return { label: "Note", className: "done" };
    if (!item.date) return { label: "En attente", className: "pending" };
    const diff = dayDiff(item.date);
    if (diff < 0) return { label: item.bonus ? "Information enregistree" : "Note en attente", className: "late" };
    if (diff === 0) return { label: "Aujourd'hui", className: "late" };
    if (diff === 1) return { label: "Demain", className: "late" };
    return { label: "Programme", className: "pending" };
  }

  function renderLocked() {
    return `
      <div class="locked-card">
        <i class="bi bi-shield-lock-fill"></i>
        <h2 class="section-title">Connexion requise</h2>
        <p class="section-text mx-auto" style="max-width: 720px;">
          Connectez-vous pour consulter vos resultats et les echeances du cours.
        </p>
        <button class="btn-main mt-4" type="button" data-open-google-login><i class="bi bi-box-arrow-in-right"></i> Se connecter</button>
      </div>
    `;
  }

  function renderLoading() {
    return `
      <div class="locked-card">
        <i class="bi bi-hourglass-split"></i>
        <h2 class="section-title">Chargement des resultats</h2>
        <p class="section-text">Nous verifions la session avant d'afficher les informations du cours.</p>
      </div>
    `;
  }

  function renderError(message) {
    return `
      <div class="locked-card">
        <i class="bi bi-exclamation-triangle-fill"></i>
        <h2 class="section-title">Acces indisponible</h2>
        <p class="section-text mx-auto" style="max-width: 720px;">${escapeHtml(message)}</p>
      </div>
    `;
  }

  function renderNoRecord(payload) {
    const form = payload.allowStudentIdClaim ? `
      <form class="mt-4 mx-auto" data-link-student-form style="max-width: 420px;">
        <label class="visually-hidden" for="studentIdLinkInput">Numero ID</label>
        <input id="studentIdLinkInput" class="form-control form-control-lg text-center fw-bold" inputmode="numeric" autocomplete="off" placeholder="Numero ID" data-link-student-id>
        <button class="btn-main mt-3 w-100" type="submit"><i class="bi bi-check-circle"></i> Voir mes resultats</button>
        <p class="section-text mt-3" data-link-student-error hidden>Numero ID non trouve ou non autorise.</p>
      </form>
    ` : "";
    return `
      <div class="locked-card">
        <i class="bi bi-person-check-fill"></i>
        <h2 class="section-title">Aucun dossier associe</h2>
        <p class="section-text mx-auto" style="max-width: 720px;">
          Votre compte Google ne correspond pas encore a un dossier du cours. Contactez l'administrateur pour l'association.
        </p>
        ${form}
      </div>
    `;
  }

  function reminderMarkup(student, payload) {
    const item = nextObligation(student, payload);
    if (!item) {
      return `
        <div class="reminder-card">
          <i class="bi bi-check-circle-fill"></i>
          <div>
            <strong>Aucune echeance future enregistree.</strong>
            <p class="mb-0">Consultez les resultats du cours pour voir les notes saisies et les activites en attente.</p>
          </div>
        </div>
      `;
    }
    const diff = dayDiff(item.date);
    const headline = diff === 0 ? "Echeance aujourd'hui" : diff === 1 ? "Echeance demain" : "Prochaine echeance";
    return `
      <div class="reminder-card ${diff <= 1 ? "is-urgent" : ""}">
        <i class="bi bi-bell-fill"></i>
        <div>
          <strong>${headline}: ${escapeHtml(item.title)}</strong>
          <p class="mb-0">${escapeHtml(item.displayDate)} - ${escapeHtml(item.type)} - ${item.weight ? item.weight + "%" : "Bonus"} - ${escapeHtml(item.description)}</p>
        </div>
      </div>
    `;
  }

  function studentMetricsMarkup(student, evaluations) {
    const summary = gradeSummary(student, evaluations);
    return `
      <div class="metric-grid">
        <div class="metric-card"><span>Numero ID</span><strong>${escapeHtml(student.id)}</strong></div>
        <div class="metric-card"><span>Moyenne des notes saisies</span><strong>${summary.average == null ? "En attente" : summary.average.toFixed(2)}</strong></div>
        <div class="metric-card"><span>Pourcentage evalue</span><strong>${summary.completedWeight}%</strong></div>
      </div>
    `;
  }

  function studentGradesRows(student, evaluations) {
    const grades = student.grades || {};
    return evaluations.map(function (evaluation) {
      const status = gradeStatus(evaluation, student);
      return `
        <tr>
          <td>${escapeHtml(evaluation.title)}</td>
          <td>${evaluation.weight}%</td>
          <td>${escapeHtml(displayDateForEvaluation(evaluation, student))}</td>
          <td>${escapeHtml(formatGrade(grades[evaluation.id]))}</td>
          <td><span class="status-pill ${status.className}">${escapeHtml(status.label)}</span></td>
        </tr>
      `;
    }).join("");
  }

  function obligationsMarkup(student, payload) {
    return obligationItems(student, payload).map(function (item) {
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

  function renderStudentPanel(student, payload) {
    return `
      ${reminderMarkup(student, payload)}
      <div class="row g-4">
        <div class="col-lg-5">
          <div class="grades-panel h-100">
            <p class="section-kicker">Suivi individuel</p>
            <h2 class="section-title">Consultation des resultats</h2>
            <p class="section-text">Cet espace affiche uniquement vos notes, vos pourcentages et vos echeances.</p>
            ${studentMetricsMarkup(student, payload.evaluations)}
          </div>
        </div>
        <div class="col-lg-7">
          <div class="grades-panel h-100">
            <p class="section-kicker">Resultats</p>
            <h2 class="section-title">Notes du cours</h2>
            <div class="table-wrap">
              <table class="grades-table">
                <thead><tr><th>Evaluation</th><th>Pourcentage</th><th>Date</th><th>Note</th><th>Etat</th></tr></thead>
                <tbody>${studentGradesRows(student, payload.evaluations)}</tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <section class="px-0 pb-0">
        <div class="grades-panel">
          <p class="section-kicker">Calendrier</p>
          <h2 class="section-title">Echeances du cours</h2>
          <div class="obligation-grid">${obligationsMarkup(student, payload)}</div>
        </div>
      </section>
    `;
  }

  function staffStudentRows(payload) {
    return payload.students.map(function (student) {
      const summary = gradeSummary(student, payload.evaluations);
      const aliasText = Array.isArray(student.emailAliases) && student.emailAliases.length
        ? "<br><small>Alias: " + student.emailAliases.map(escapeHtml).join(", ") + "</small>"
        : "";
      return `
        <tr>
          <td>${escapeHtml(student.fullName)}<br><span class="status-pill">${escapeHtml(student.level)}</span></td>
          <td>${escapeHtml(student.id)}</td>
          <td>${escapeHtml(student.email)}${aliasText}</td>
          <td>${escapeHtml(student.contact)}</td>
          <td>${summary.average == null ? "En attente" : summary.average.toFixed(2)}</td>
          <td>${summary.completedWeight}%</td>
        </tr>
      `;
    }).join("");
  }

  function staffGradeRows(payload) {
    return payload.students.map(function (student) {
      const grades = student.grades || {};
      const gradeCells = payload.evaluations.map(function (evaluation) {
        const status = gradeStatus(evaluation, student);
        return `
          <td>
            <strong>${escapeHtml(formatGrade(grades[evaluation.id]))}</strong><br>
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

  function staffCalendarMarkup(payload) {
    const events = payload.bonusEvent ? payload.evaluations.concat([payload.bonusEvent]) : payload.evaluations;
    return events.map(function (evaluation) {
      const display = evaluation.id === "bookPresentation" ? "Date individuelle" : evaluation.displayDate;
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

  function renderStaffPanel(payload) {
    const roleLabel = payload.role === "admin" ? "Administrateur" : "Professeur approuve";
    const totalWeight = payload.evaluations.reduce(function (sum, evaluation) {
      return sum + evaluation.weight;
    }, 0);
    return `
      <div class="privacy-note mb-4">
        <i class="bi bi-shield-check"></i>
        <div>
          <strong>Vue ${roleLabel}</strong>
          <p class="mb-0">Cette vue est autorisee par l'API et affiche les donnees completes du groupe.</p>
        </div>
      </div>
      <div class="metric-grid mb-4">
        <div class="metric-card"><span>Etudiants</span><strong>${payload.students.length}</strong></div>
        <div class="metric-card"><span>Pourcentage evaluatif</span><strong>${totalWeight}%</strong></div>
        <div class="metric-card"><span>Bonus</span><strong>Info</strong></div>
      </div>
      <div class="grades-panel mb-4">
        <p class="section-kicker">Donnees privees</p>
        <h2 class="section-title">Liste des etudiants</h2>
        <div class="table-wrap">
          <table class="grades-table">
            <thead><tr><th>Nom complet</th><th>Numero ID</th><th>Courriel institutionnel</th><th>Contact</th><th>Moyenne des notes saisies</th><th>Pourcentage evalue</th></tr></thead>
            <tbody>${staffStudentRows(payload)}</tbody>
          </table>
        </div>
      </div>
      <div class="grades-panel mb-4">
        <p class="section-kicker">Resultats</p>
        <h2 class="section-title">Notes du cours</h2>
        <div class="table-wrap">
          <table class="grades-table">
            <thead>
              <tr>
                <th>Etudiant</th>
                ${payload.evaluations.map(function (evaluation) { return `<th>${escapeHtml(evaluation.title)}<br>${evaluation.weight}%</th>`; }).join("")}
              </tr>
            </thead>
            <tbody>${staffGradeRows(payload)}</tbody>
          </table>
        </div>
      </div>
      <div class="grades-panel">
        <p class="section-kicker">Calendrier</p>
        <h2 class="section-title">Echeances du cours</h2>
        <div class="obligation-grid">${staffCalendarMarkup(payload)}</div>
      </div>
    `;
  }

  function openGooglePanel() {
    const trigger = document.querySelector("[data-auth-toggle], [data-auth-nav-toggle]");
    if (trigger) trigger.click();
  }

  function showFloatingReminder(student, payload) {
    const item = nextObligation(student, payload);
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
      <strong>${diff === 0 ? "Echeance aujourd'hui" : "Rappel pour demain"}</strong>
      <p class="mb-0">${escapeHtml(item.title)} - ${escapeHtml(item.displayDate)} - ${escapeHtml(item.description)}</p>
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

  function fetchGrades(user, studentId) {
    const url = studentId ? API_PATH + "?studentId=" + encodeURIComponent(studentId) : API_PATH;
    return fetch(url, {
      headers: {
        Authorization: "Bearer " + user.credential
      }
    }).then(function (response) {
      if (!response.ok) throw new Error("La API rechazo la solicitud: " + response.status);
      return response.json();
    });
  }

  function renderPayload(root, user, payload) {
    if (payload.role === "admin" || payload.role === "teacher") {
      root.innerHTML = renderStaffPanel(payload);
      return;
    }
    if (payload.student) {
      root.innerHTML = renderStudentPanel(payload.student, payload);
      showFloatingReminder(payload.student, payload);
      return;
    }
    root.innerHTML = renderNoRecord(payload);
    const form = root.querySelector("[data-link-student-form]");
    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        const input = root.querySelector("[data-link-student-id]");
        const error = root.querySelector("[data-link-student-error]");
        fetchGrades(user, input && input.value)
          .then(function (nextPayload) {
            if (!nextPayload.student) {
              if (error) error.hidden = false;
              return;
            }
            renderPayload(root, user, nextPayload);
          })
          .catch(function () {
            if (error) error.hidden = false;
          });
      });
    }
  }

  function render() {
    const root = document.getElementById("french7GradesApp");
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
        renderPayload(root, user, payload);
      })
      .catch(function () {
        root.innerHTML = renderError("No fue posible cargar las notas. Verifique su sesion o intente recargar la pagina.");
      });
  }

  window.addEventListener("load", function () {
    render();
    setInterval(render, 900);
  });
})();
