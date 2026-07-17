(function () {
  const USER_KEYS = [
    { key: "jaralingua_google_user", provider: "google" },
    { key: "jaralingua_microsoft_user", provider: "microsoft" },
    { key: "jaralingua_local_user", provider: "local" }
  ];
  const API_PATH = "/api/french8/grades";
  const IUE_HEADER_SRC = "../Niveau%207/img/institutionnel/iue-header.png";
  const IUE_FOOTER_SRC = "../Niveau%207/img/institutionnel/iue-footer.png";

  let lastSignature = "";
  let reminderShownFor = "";

  function normalizeEmail(value) {
    return String(value || "").trim().toLowerCase();
  }

  function readStoredUser(entry) {
    try {
      const saved = JSON.parse(sessionStorage.getItem(entry.key) || "null");
      if (!saved || !saved.credential) return null;
      if (saved.exp && Date.now() / 1000 > saved.exp) {
        sessionStorage.removeItem(entry.key);
        return null;
      }
      return Object.assign({ provider: entry.provider }, saved);
    } catch (error) {
      sessionStorage.removeItem(entry.key);
      return null;
    }
  }

  function readUser() {
    for (const entry of USER_KEYS) {
      const user = readStoredUser(entry);
      if (user) return user;
    }
    return null;
  }

  function authHeaders(user, extra) {
    return Object.assign({
      Authorization: "Bearer " + user.credential,
      "X-Jaralingua-Auth-Provider": user.provider || "google"
    }, extra || {});
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
    return typeof value === "number" ? value.toFixed(2) : "En attente";
  }

  function formatDetailScore(value, suffix) {
    const number = Number(value);
    if (!Number.isFinite(number)) return "";
    return Math.round(number * 100) / 100 + suffix;
  }

  function pronunciationReviewMarkup(student, evaluation, canEditFeedback) {
    const details = student && student.gradeDetails && student.gradeDetails[evaluation.id];
    if (!details) return "";
    const isWritingActivity = !!details.submissionText;
    const summaryText = isWritingActivity ? "Voir production, audio et feedback" : "Voir audio, transcription et validation";
    const audioButton = details.audio && details.audio.file
      ? `
          <div class="pronunciation-audio-review">
            <button class="btn-soft btn-sm" type="button" data-pronunciation-audio data-student-id="${escapeHtml(student.id)}" data-evaluation-id="${escapeHtml(evaluation.id)}">
              <i class="bi bi-play-fill"></i> Écouter l'audio
            </button>
            <audio controls hidden data-pronunciation-audio-player></audio>
            <p class="mb-0" data-pronunciation-audio-status></p>
          </div>
        `
      : "<p><strong>Audio:</strong> pas encore disponible pour cet envoi.</p>";
    const submissionText = details.submissionText ? `<p><strong>Texte de l'étudiant:</strong> ${escapeHtml(details.submissionText)}</p>` : "";
    const idiom = details.idiom ? `<p><strong>Expression idiomatique:</strong> ${escapeHtml(details.idiom)}</p>` : "";
    const wordCount = details.wordCount ? `<p><strong>Mots:</strong> ${escapeHtml(details.wordCount)}</p>` : "";
    const subjonctifCount = details.subjonctifCount != null ? `<p><strong>Subjonctifs passés détectés:</strong> ${escapeHtml(details.subjonctifCount)}</p>` : "";
    const nuancePresent = details.nuancePresent != null ? `<p><strong>Nuance argumentative:</strong> ${details.nuancePresent ? "présente" : "à vérifier"}</p>` : "";
    const feedback = details.feedback ? `<p><strong>Feedback professeur:</strong> ${escapeHtml(details.feedback)}</p>` : "";
    const feedbackEditor = canEditFeedback && isWritingActivity ? `
      <div class="hypotheses-feedback-box">
        <label>
          <strong>Feedback professeur</strong>
          <textarea class="form-control" rows="3" data-hypotheses-feedback-text>${escapeHtml(details.feedback || "")}</textarea>
        </label>
        <button class="btn-main btn-sm mt-2" type="button" data-hypotheses-feedback-save data-student-id="${escapeHtml(student.id)}" data-evaluation-id="${escapeHtml(evaluation.id)}">
          <i class="bi bi-chat-left-text-fill"></i> Enregistrer le feedback
        </button>
        <p class="mb-0" data-hypotheses-feedback-status></p>
      </div>
    ` : "";
    const transcript = details.transcript ? `<p><strong>Transcription automatique:</strong> ${escapeHtml(details.transcript)}</p>` : "";
    const reference = details.referenceText ? `<p><strong>Texte attendu:</strong> ${escapeHtml(details.referenceText)}</p>` : "";
    const missed = Array.isArray(details.missedWords) && details.missedWords.length
      ? `<p><strong>Mots marques par le systeme:</strong> ${details.missedWords.map(escapeHtml).join(", ")}</p>`
      : "";
    const liaison = details.liaison && details.liaison.message ? `<p><strong>Liaisons:</strong> ${escapeHtml(details.liaison.message)}</p>` : "";
    const uncertainty = details.uncertain
      ? `<p class="pronunciation-uncertain"><strong>Fiabilité technique:</strong> reconnaissance incertaine. Vérifiez l'audio avant de valider la note.${details.uncertaintyMessage ? ` ${escapeHtml(details.uncertaintyMessage)}` : ""}</p>`
      : "";
    const autoScore = formatDetailScore(details.score100 || details.overall, "/100");
    const autoGrade = formatDetailScore(details.grade, "/5");
    const submitted = details.submittedAt ? `<p><strong>Envoi:</strong> ${escapeHtml(details.submittedAt)}</p>` : "";
    return `
      <details class="pronunciation-review">
        <summary>${escapeHtml(summaryText)}</summary>
        <div>
          ${isWritingActivity ? "" : `<p><strong>Estimation automatique provisoire:</strong> ${escapeHtml([autoScore, autoGrade].filter(Boolean).join(" - ") || "En attente")}</p>`}
          ${submitted}
          ${uncertainty}
          ${audioButton}
          ${submissionText}
          ${idiom}
          ${wordCount}
          ${subjonctifCount}
          ${nuancePresent}
          ${transcript}
          ${reference}
          ${missed}
          ${liaison}
          ${feedback}
          ${feedbackEditor}
          <p class="mb-0"><em>${isWritingActivity ? "Le professeur peut écouter l'audio, lire le texte et laisser un feedback." : "L'audio est la preuve principale. Le professeur valide ou corrige manuellement l'estimation dans ce panel."}</em></p>
        </div>
      </details>
    `;
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
      average: completedWeight ? earned / completedWeight : null,
      weightedTotal: earned / 100
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
          Connectez-vous pour consulter vos resultats et les pourcentages du cours.
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
        <p class="section-text">Nous verifions la session avant d'afficher les notes du cours.</p>
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
          Votre compte ne correspond pas encore a un dossier du cours. Contactez l'administrateur pour l'association.
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
          <td>${escapeHtml(evaluation.title)}${pronunciationReviewMarkup(student, evaluation, false)}</td>
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
      <div class="row g-4">
        <div class="col-lg-5">
          <div class="grades-panel h-100">
            <p class="section-kicker">Suivi individuel</p>
            <h2 class="section-title">Consultation des resultats</h2>
            <p class="section-text">Cet espace affiche uniquement vos notes et vos pourcentages.</p>
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
            ${pronunciationReviewMarkup(student, evaluation, false)}
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

  function levelLabel(level) {
    const match = String(level || "").match(/nivel\s*(\d+)/i);
    return match ? "Niveau " + match[1] : String(level || "Niveau");
  }

  function levelSlug(level) {
    return levelLabel(level).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "niveau";
  }

  function gradeLevels(payload) {
    const seen = {};
    return payload.students.reduce(function (levels, student) {
      const level = student.level || "Niveau";
      if (!seen[level]) {
        seen[level] = true;
        levels.push(level);
      }
      return levels;
    }, []).sort(function (a, b) {
      return levelLabel(a).localeCompare(levelLabel(b), "fr", { numeric: true });
    });
  }

  function downloadButtonsForLevels(payload, audience) {
    return gradeLevels(payload).map(function (level) {
      const label = levelLabel(level);
      const icon = audience === "directives" ? "bi-file-earmark-pdf-fill" : "bi-file-earmark-person-fill";
      const className = audience === "directives" ? "btn-main" : "btn-soft";
      const actionLabel = audience === "directives" ? "Directions" : "Étudiants";
      return `
        <button class="${className}" type="button" data-download-audience="${audience}" data-download-level="${escapeHtml(level)}">
          <i class="bi ${icon}"></i>${escapeHtml(actionLabel)} · ${escapeHtml(label)}
        </button>
      `;
    }).join("");
  }

  function staffDownloadTools(payload) {
    if (payload.role !== "admin") return "";
    return `
      <div class="grades-panel mb-4" data-admin-downloads>
        <p class="section-kicker">Documents PDF</p>
        <h2 class="section-title">Téléchargements administratifs</h2>
        <p class="section-text mb-3">Ces documents sont réservés à l'administrateur du cours et séparés par niveau.</p>
        <div class="mb-3">
          <h3 class="h6 fw-bold text-primary mb-2">Pour les directions</h3>
          <div class="d-flex flex-wrap gap-2">${downloadButtonsForLevels(payload, "directives")}</div>
        </div>
        <div>
          <h3 class="h6 fw-bold text-primary mb-2">Pour les étudiants</h3>
          <div class="d-flex flex-wrap gap-2">${downloadButtonsForLevels(payload, "students")}</div>
        </div>
      </div>
    `;
  }

  function adminStudentGradeInputs(payload, student) {
    const grades = student && student.grades ? student.grades : {};
    return payload.evaluations.map(function (evaluation) {
      const value = typeof grades[evaluation.id] === "number" ? grades[evaluation.id] : "";
      return `
        <div>
          <label class="admin-grade-row">
            <span>${escapeHtml(evaluation.title)}</span>
            <input class="form-control" type="number" min="0" max="5" step="0.01" value="${escapeHtml(value)}" data-student-grade="${escapeHtml(evaluation.id)}" placeholder="En attente">
          </label>
          ${pronunciationReviewMarkup(student, evaluation, true)}
        </div>
      `;
    }).join("");
  }

  function adminStudentCards(payload) {
    return payload.students.map(function (student, index) {
      return `
        <details class="admin-student-card mb-3" data-student-editor-card data-student-index="${index}" data-student-search="${escapeHtml([student.fullName, student.email, student.id].join(" ").toLowerCase())}">
          <summary class="d-flex flex-wrap justify-content-between align-items-center gap-2">
            <span><strong>${escapeHtml(student.fullName || "Etudiant")}</strong><br><small>${escapeHtml(student.id || "")}${student.email ? " · " + escapeHtml(student.email) : ""}</small></span>
            <span class="fw-bold text-primary">Ouvrir</span>
          </summary>
          <div class="mt-3">
            <label class="form-check fw-bold text-danger mb-3">
              <input class="form-check-input" type="checkbox" data-student-delete>
              Supprimer
            </label>
            <div class="row g-3">
            <div class="col-md-3">
              <label class="form-label fw-bold">Numero ID</label>
              <input class="form-control" value="${escapeHtml(student.id)}" data-student-field="id">
            </div>
            <div class="col-md-5">
              <label class="form-label fw-bold">Nom complet</label>
              <input class="form-control" value="${escapeHtml(student.fullName)}" data-student-field="fullName">
            </div>
            <div class="col-md-4">
              <label class="form-label fw-bold">Niveau</label>
              <input class="form-control" value="${escapeHtml(student.level || "")}" data-student-field="level">
            </div>
            <div class="col-md-4">
              <label class="form-label fw-bold">Courriel</label>
              <input class="form-control" type="email" value="${escapeHtml(student.email || "")}" data-student-field="email">
            </div>
            <div class="col-md-4">
              <label class="form-label fw-bold">Contact</label>
              <input class="form-control" value="${escapeHtml(student.contact || "")}" data-student-field="contact">
            </div>
            <div class="col-md-4">
              <label class="form-label fw-bold">Date livre</label>
              <input class="form-control" value="${escapeHtml(student.bookDate || "")}" data-student-field="bookDate" placeholder="YYYY-MM-DD">
            </div>
            </div>
            <div class="admin-grade-grid mt-3">${adminStudentGradeInputs(payload, student)}</div>
          </div>
        </details>
      `;
    }).join("");
  }

  function adminStudentEditorMarkup(payload) {
    if (payload.role !== "admin" && payload.role !== "teacher") return "";
    return `
      <div class="grades-panel mb-4" data-admin-student-tools>
        <p class="section-kicker">${payload.role === "admin" ? "Administration" : "Revision professeur"}</p>
        <h2 class="section-title">Modifier les etudiants et les notes</h2>
        <p class="section-text mb-3">Changez les noms, numeros ID, niveaux, courriels et notes. Les champs de note vides restent en attente.</p>
        <label class="form-label fw-bold w-100 mb-3">Rechercher un etudiant
          <input class="form-control" type="search" data-student-editor-filter placeholder="Nom, courriel ou numero ID">
        </label>
        <form data-edit-students-form>
          ${adminStudentCards(payload)}
          <article class="admin-student-card mb-3" data-new-student-card>
            <h3 class="h5 fw-bold mb-3">Ajouter un etudiant</h3>
            <div class="row g-3">
              <div class="col-md-3">
                <label class="form-label fw-bold">Numero ID</label>
                <input class="form-control" data-new-student-field="id">
              </div>
              <div class="col-md-5">
                <label class="form-label fw-bold">Nom complet</label>
                <input class="form-control" data-new-student-field="fullName">
              </div>
              <div class="col-md-4">
                <label class="form-label fw-bold">Niveau</label>
                <input class="form-control" value="${escapeHtml((payload.students[0] && payload.students[0].level) || "Niveau 8")}" data-new-student-field="level">
              </div>
              <div class="col-md-4">
                <label class="form-label fw-bold">Courriel</label>
                <input class="form-control" type="email" data-new-student-field="email">
              </div>
              <div class="col-md-4">
                <label class="form-label fw-bold">Contact</label>
                <input class="form-control" data-new-student-field="contact">
              </div>
              <div class="col-md-4">
                <label class="form-label fw-bold">Date livre</label>
                <input class="form-control" data-new-student-field="bookDate" placeholder="YYYY-MM-DD">
              </div>
            </div>
            <div class="admin-grade-grid mt-3">${adminStudentGradeInputs(payload, { grades: {} })}</div>
          </article>
          <button class="btn-main" type="submit"><i class="bi bi-save"></i> Enregistrer les changements</button>
          <p class="section-text mt-3" data-edit-students-status></p>
        </form>
      </div>
    `;
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
      ${staffDownloadTools(payload)}
      ${adminStudentEditorMarkup(payload)}
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
    `;
  }

  function escapePdfText(value) {
    return String(value == null ? "" : value)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\x20-\x7E\n]/g, "")
      .replace(/\\/g, "\\\\")
      .replace(/\(/g, "\\(")
      .replace(/\)/g, "\\)");
  }

  function pdfTextWidth(value, fontSize) {
    return String(value == null ? "" : value).length * fontSize * 0.48;
  }

  function wrapPdfCell(value, fontSize, maxWidth, maxLines) {
    const text = String(value == null ? "" : value);
    const words = text.split(/\s+/).filter(Boolean);
    const lines = [];
    let current = "";
    words.forEach(function (word) {
      const candidate = current ? current + " " + word : word;
      if (pdfTextWidth(candidate, fontSize) > maxWidth && current) {
        lines.push(current);
        current = word;
      } else {
        current = candidate;
      }
    });
    if (current) lines.push(current);
    if (!lines.length) lines.push("");
    if (lines.length > maxLines) {
      lines.length = maxLines;
      lines[maxLines - 1] = lines[maxLines - 1].slice(0, Math.max(1, lines[maxLines - 1].length - 3)) + "...";
    }
    return lines;
  }

  function arrayBufferToHex(buffer) {
    const bytes = new Uint8Array(buffer);
    let hex = "";
    for (let i = 0; i < bytes.length; i += 1) {
      hex += bytes[i].toString(16).padStart(2, "0");
    }
    return hex;
  }

  function loadImageAsJpegHex(source, maxWidth) {
    return new Promise(function (resolve) {
      if (typeof Image === "undefined") {
        resolve(null);
        return;
      }
      const image = new Image();
      image.onload = function () {
        try {
          const scale = Math.min(1, maxWidth / image.naturalWidth);
          const width = Math.max(1, Math.round(image.naturalWidth * scale));
          const height = Math.max(1, Math.round(image.naturalHeight * scale));
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const context = canvas.getContext("2d");
          context.fillStyle = "#ffffff";
          context.fillRect(0, 0, width, height);
          context.drawImage(image, 0, 0, width, height);
          canvas.toBlob(function (blob) {
            if (!blob) {
              resolve(null);
              return;
            }
            const reader = new FileReader();
            reader.onload = function () {
              resolve({ width: width, height: height, hex: arrayBufferToHex(reader.result) });
            };
            reader.onerror = function () { resolve(null); };
            reader.readAsArrayBuffer(blob);
          }, "image/jpeg", 0.92);
        } catch (error) {
          resolve(null);
        }
      };
      image.onerror = function () { resolve(null); };
      try {
        image.src = new URL(source, document.baseURI).href;
      } catch (error) {
        image.src = source;
      }
    });
  }

  function buildGradebookPdf(title, columns, rows, images) {
    const pageWidth = 842;
    const pageHeight = 595;
    const margin = 24;
    const headerHeight = 62;
    const footerHeight = 30;
    const titleY = pageHeight - margin - headerHeight - 18;
    const tableTop = titleY - 30;
    const tableBottom = margin + footerHeight + 16;
    const rowFont = 6.4;
    const headerFont = 6.2;
    const objects = [];
    const pageIds = [];

    function addObject(body) {
      objects.push(body);
      return objects.length;
    }

    function addImageObject(image) {
      if (!image || !image.hex) return null;
      const stream = image.hex + ">";
      return addObject("<< /Type /XObject /Subtype /Image /Width " + image.width + " /Height " + image.height + " /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter [/ASCIIHexDecode /DCTDecode] /Length " + stream.length + " >>\nstream\n" + stream + "\nendstream");
    }

    const fontId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
    const boldFontId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");
    const headerImageId = addImageObject(images.header);
    const footerImageId = addImageObject(images.footer);
    const usableWidth = pageWidth - margin * 2;
    const totalUnits = columns.reduce(function (sum, column) { return sum + column.width; }, 0);
    const widths = columns.map(function (column) { return usableWidth * column.width / totalUnits; });

    let pages = [];
    let currentRows = [];
    let y = tableTop - 24;
    rows.forEach(function (row) {
      const lineCounts = row.map(function (cell, index) {
        return wrapPdfCell(cell, rowFont, widths[index] - 6, index === 1 ? 3 : 2).length;
      });
      const rowHeight = Math.max(18, Math.max.apply(null, lineCounts) * 8 + 8);
      if (y - rowHeight < tableBottom && currentRows.length) {
        pages.push(currentRows);
        currentRows = [];
        y = tableTop - 24;
      }
      currentRows.push({ cells: row, height: rowHeight });
      y -= rowHeight;
    });
    if (currentRows.length) pages.push(currentRows);
    if (!pages.length) pages = [[]];

    pages.forEach(function (pageRows, pageIndex) {
      const streamLines = [];
      const xObjectNames = [];
      if (headerImageId && images.header) {
        const drawWidth = usableWidth;
        const drawHeight = Math.min(headerHeight, drawWidth * images.header.height / images.header.width);
        streamLines.push("q " + drawWidth.toFixed(2) + " 0 0 " + drawHeight.toFixed(2) + " " + margin + " " + (pageHeight - margin - drawHeight).toFixed(2) + " cm /HeaderImg Do Q");
        xObjectNames.push("/HeaderImg " + headerImageId + " 0 R");
      }
      if (footerImageId && images.footer) {
        const drawWidth = usableWidth;
        const drawHeight = Math.min(footerHeight, drawWidth * images.footer.height / images.footer.width);
        streamLines.push("q " + drawWidth.toFixed(2) + " 0 0 " + drawHeight.toFixed(2) + " " + margin + " " + margin + " cm /FooterImg Do Q");
        xObjectNames.push("/FooterImg " + footerImageId + " 0 R");
      }

      streamLines.push("BT /F2 14 Tf 0.00 0.22 0.36 rg " + margin + " " + titleY + " Td (" + escapePdfText(title) + ") Tj ET");
      streamLines.push("BT /F1 7 Tf 0.36 0.40 0.46 rg " + margin + " " + (titleY - 13) + " Td (" + escapePdfText("Francais Niveau 8 - Genere le " + new Date().toLocaleDateString("fr-FR")) + ") Tj ET");

      let x = margin;
      let headerCellY = tableTop;
      streamLines.push("0.00 0.22 0.36 rg " + margin + " " + (headerCellY - 20) + " " + usableWidth + " 20 re f");
      columns.forEach(function (column, index) {
        wrapPdfCell(column.label, headerFont, widths[index] - 6, 2).forEach(function (line, lineIndex) {
          streamLines.push("BT /F2 " + headerFont + " Tf 1 1 1 rg " + (x + 3).toFixed(2) + " " + (headerCellY - 8 - lineIndex * 7).toFixed(2) + " Td (" + escapePdfText(line) + ") Tj ET");
        });
        x += widths[index];
      });

      let rowY = tableTop - 20;
      pageRows.forEach(function (row, rowIndex) {
        const fill = rowIndex % 2 === 0 ? "0.97 0.99 1 rg" : "1 1 1 rg";
        streamLines.push(fill + " " + margin + " " + (rowY - row.height).toFixed(2) + " " + usableWidth + " " + row.height.toFixed(2) + " re f");
        x = margin;
        row.cells.forEach(function (cell, cellIndex) {
          const lines = wrapPdfCell(cell, rowFont, widths[cellIndex] - 6, cellIndex === 1 ? 3 : 2);
          lines.forEach(function (line, lineIndex) {
            streamLines.push("BT /F1 " + rowFont + " Tf 0.12 0.16 0.23 rg " + (x + 3).toFixed(2) + " " + (rowY - 10 - lineIndex * 7.5).toFixed(2) + " Td (" + escapePdfText(line) + ") Tj ET");
          });
          streamLines.push("0.86 0.90 0.95 RG 0.35 w " + x.toFixed(2) + " " + (rowY - row.height).toFixed(2) + " m " + x.toFixed(2) + " " + rowY.toFixed(2) + " l S");
          x += widths[cellIndex];
        });
        streamLines.push("0.86 0.90 0.95 RG 0.35 w " + margin + " " + (rowY - row.height).toFixed(2) + " m " + (margin + usableWidth) + " " + (rowY - row.height).toFixed(2) + " l S");
        rowY -= row.height;
      });
      streamLines.push("BT /F1 7 Tf 0.36 0.40 0.46 rg " + (pageWidth - margin - 48) + " " + (margin + footerHeight + 4) + " Td (" + escapePdfText("Page " + (pageIndex + 1) + "/" + pages.length) + ") Tj ET");

      const stream = streamLines.join("\n");
      const contentId = addObject("<< /Length " + stream.length + " >>\nstream\n" + stream + "\nendstream");
      const xObject = xObjectNames.length ? " /XObject << " + xObjectNames.join(" ") + " >>" : "";
      const pageId = addObject("<< /Type /Page /Parent 0 0 R /MediaBox [0 0 " + pageWidth + " " + pageHeight + "] /Resources << /Font << /F1 " + fontId + " 0 R /F2 " + boldFontId + " 0 R >>" + xObject + " >> /Contents " + contentId + " 0 R >>");
      pageIds.push(pageId);
    });

    const pagesId = addObject("<< /Type /Pages /Kids [" + pageIds.map(function (id) { return id + " 0 R"; }).join(" ") + "] /Count " + pageIds.length + " >>");
    pageIds.forEach(function (pageId) {
      objects[pageId - 1] = objects[pageId - 1].replace("/Parent 0 0 R", "/Parent " + pagesId + " 0 R");
    });
    const catalogId = addObject("<< /Type /Catalog /Pages " + pagesId + " 0 R >>");

    let pdf = "%PDF-1.4\n";
    const offsets = [0];
    objects.forEach(function (body, index) {
      offsets.push(pdf.length);
      pdf += index + 1 + " 0 obj\n" + body + "\nendobj\n";
    });
    const xref = pdf.length;
    pdf += "xref\n0 " + (objects.length + 1) + "\n0000000000 65535 f \n";
    for (let i = 1; i <= objects.length; i += 1) {
      pdf += String(offsets[i]).padStart(10, "0") + " 00000 n \n";
    }
    pdf += "trailer\n<< /Size " + (objects.length + 1) + " /Root " + catalogId + " 0 R >>\nstartxref\n" + xref + "\n%%EOF";
    return pdf;
  }

  function savePdf(pdf, filename) {
    const blob = new Blob([pdf], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function gradeValueForPdf(student, evaluation) {
    const grades = student.grades || {};
    return typeof grades[evaluation.id] === "number" ? grades[evaluation.id].toFixed(2) : "En attente";
  }

  function totalValueForPdf(student, evaluations) {
    const summary = gradeSummary(student, evaluations);
    return summary.completedWeight ? summary.weightedTotal.toFixed(2) : "En attente";
  }

  function reportColumns(payload, audience) {
    const base = audience === "directives"
      ? [
          { label: "Numero ID", width: 1.05 },
          { label: "Nom complet", width: 1.65 },
          { label: "Contact", width: 1.05 },
          { label: "Moyenne des notes saisies", width: 1.15 },
          { label: "Pourcentage evalue", width: 1.05 }
        ]
      : [
          { label: "Numero ID", width: 1.1 },
          { label: "Moyenne des notes saisies", width: 1.1 },
          { label: "Pourcentage evalue", width: 1.0 }
        ];
    return base.concat(payload.evaluations.map(function (evaluation) {
      return { label: evaluation.title + " " + evaluation.weight + "%", width: 1.05 };
    })).concat([{ label: "Total pondere", width: 1 }]);
  }

  function reportRows(payload, audience) {
    return payload.students.map(function (student) {
      const summary = gradeSummary(student, payload.evaluations);
      const base = audience === "directives"
        ? [
            student.id,
            student.fullName,
            student.contact,
            summary.average == null ? "En attente" : summary.average.toFixed(2),
            summary.completedWeight + "%"
          ]
        : [
            student.id,
            summary.average == null ? "En attente" : summary.average.toFixed(2),
            summary.completedWeight + "%"
          ];
      return base.concat(payload.evaluations.map(function (evaluation) {
        return gradeValueForPdf(student, evaluation);
      })).concat([totalValueForPdf(student, payload.evaluations)]);
    });
  }

  function filteredPayloadByLevel(payload, level) {
    return Object.assign({}, payload, {
      students: payload.students.filter(function (student) {
        return student.level === level;
      })
    });
  }

  async function downloadGradeReport(payload, audience, level) {
    const scopedPayload = filteredPayloadByLevel(payload, level);
    const images = {
      header: await loadImageAsJpegHex(IUE_HEADER_SRC, 1600),
      footer: await loadImageAsJpegHex(IUE_FOOTER_SRC, 1600)
    };
    const label = levelLabel(level);
    const title = audience === "directives"
      ? "Tableau des notes - Direction - " + label
      : "Tableau des notes - Etudiants - " + label;
    const pdf = buildGradebookPdf(title, reportColumns(scopedPayload, audience), reportRows(scopedPayload, audience), images);
    savePdf(pdf, audience === "directives"
      ? "notes-francais-8-directions-" + levelSlug(level) + ".pdf"
      : "notes-francais-8-etudiants-" + levelSlug(level) + ".pdf");
  }

  function bindStaffDownloads(root, payload) {
    if (payload.role !== "admin") return;
    root.querySelectorAll("[data-download-audience][data-download-level]").forEach(function (button) {
      button.addEventListener("click", function () {
        downloadGradeReport(payload, button.dataset.downloadAudience, button.dataset.downloadLevel);
      });
    });
  }

  function bindPronunciationAudio(root, user) {
    root.querySelectorAll("[data-pronunciation-audio]").forEach(function (button) {
      button.addEventListener("click", function () {
        const wrapper = button.closest(".pronunciation-audio-review");
        const player = wrapper && wrapper.querySelector("[data-pronunciation-audio-player]");
        const status = wrapper && wrapper.querySelector("[data-pronunciation-audio-status]");
        if (!player) return;
        if (player.src) {
          player.hidden = false;
          player.play().catch(function () {});
          return;
        }
        button.disabled = true;
        if (status) status.textContent = "Chargement de l'audio...";
        fetch("/api/french8/pronunciation-audio?studentId=" + encodeURIComponent(button.dataset.studentId || "") + "&evaluationId=" + encodeURIComponent(button.dataset.evaluationId || ""), {
          headers: authHeaders(user)
        })
          .then(function (response) {
            if (!response.ok) throw new Error("audio_not_available");
            return response.blob();
          })
          .then(function (blob) {
            const objectUrl = URL.createObjectURL(blob);
            player.src = objectUrl;
            player.hidden = false;
            if (status) status.textContent = "";
            return player.play().catch(function () {});
          })
          .catch(function () {
            if (status) status.textContent = "Impossible de charger cet audio.";
          })
          .finally(function () {
            button.disabled = false;
          });
      });
    });
  }

  function bindHypothesesFeedback(root, user) {
    root.querySelectorAll("[data-hypotheses-feedback-save]").forEach(function (button) {
      button.addEventListener("click", function () {
        const box = button.closest(".hypotheses-feedback-box");
        const card = button.closest("[data-student-editor-card]");
        const textarea = box && box.querySelector("[data-hypotheses-feedback-text]");
        const status = box && box.querySelector("[data-hypotheses-feedback-status]");
        const evaluationId = button.dataset.evaluationId || "writingActivity";
        const gradeInput = card && card.querySelector('[data-student-grade="' + evaluationId + '"]');
        button.disabled = true;
        if (status) status.textContent = "Enregistrement du feedback...";
        fetch("/api/french8/production-feedback", {
          method: "PUT",
          headers: authHeaders(user, { "Content-Type": "application/json" }),
          body: JSON.stringify({
            studentId: button.dataset.studentId || "",
            evaluationId: evaluationId,
            feedback: textarea ? textarea.value : "",
            grade: gradeInput ? gradeInput.value : ""
          })
        })
          .then(function (response) {
            if (!response.ok) throw new Error("feedback_failed");
            return response.json();
          })
          .then(function () {
            if (status) status.textContent = "Feedback enregistre.";
          })
          .catch(function () {
            if (status) status.textContent = "Impossible d'enregistrer le feedback.";
          })
          .finally(function () {
            button.disabled = false;
          });
      });
    });
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
          grades: student.grades || {},
          gradeDetails: student.gradeDetails || {}
        };
      })
    };
  }

  function saveGradebook(user, payload) {
    return fetch(API_PATH, {
      method: "PUT",
      headers: authHeaders(user, { "Content-Type": "application/json" }),
      body: JSON.stringify(gradebookForSave(payload))
    }).then(function (response) {
      if (!response.ok) throw new Error("La API rechazo la actualizacion: " + response.status);
      return response.json();
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

  function gradesFromCard(card) {
    const grades = {};
    card.querySelectorAll("[data-student-grade]").forEach(function (input) {
      const value = input.value.trim();
      if (!value) return;
      const grade = Number(value);
      if (Number.isNaN(grade) || grade < 0 || grade > 5) return;
      grades[input.getAttribute("data-student-grade")] = Math.round(grade * 100) / 100;
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
      level: cardField(card, "level") || "Niveau 8",
      email: cardField(card, "email"),
      emailAliases: original.emailAliases || [],
      contact: cardField(card, "contact"),
      bookDate: cardField(card, "bookDate") || null,
      grades: gradesFromCard(card),
      gradeDetails: original.gradeDetails || {}
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
      level: newStudentField(card, "level") || "Niveau 8",
      email: newStudentField(card, "email"),
      emailAliases: [],
      contact: newStudentField(card, "contact"),
      bookDate: newStudentField(card, "bookDate") || null,
      grades: gradesFromCard(card),
      gradeDetails: {}
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

  function bindStudentEditor(root, payload, user) {
    if (payload.role !== "admin" && payload.role !== "teacher") return;
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
        if (status) status.textContent = "Le nouvel etudiant a besoin d'un ID et d'un nom complet.";
        return;
      }
      if (newStudent) students.push(newStudent);
      if (hasDuplicateStudentIds(students)) {
        if (status) status.textContent = "Il y a un numero ID duplique.";
        return;
      }
      nextPayload.students = students;
      if (status) status.textContent = "Enregistrement...";
      saveGradebook(user, nextPayload)
        .then(function () {
          lastSignature = "";
          if (status) status.textContent = "Enregistre.";
          renderPayload(root, user, nextPayload);
        })
        .catch(function () {
          if (status) status.textContent = "Impossible d'enregistrer les changements.";
        });
    });
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
      headers: authHeaders(user)
    }).then(function (response) {
      if (!response.ok) throw new Error("La API rechazo la solicitud: " + response.status);
      return response.json();
    });
  }

  function renderPayload(root, user, payload) {
    if (payload.role === "admin" || payload.role === "teacher") {
      root.innerHTML = renderStaffPanel(payload);
      bindStaffDownloads(root, payload);
      bindPronunciationAudio(root, user);
      bindHypothesesFeedback(root, user);
      bindStudentEditor(root, payload, user);
      return;
    }
    if (payload.student) {
      root.innerHTML = renderStudentPanel(payload.student, payload);
      bindPronunciationAudio(root, user);
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
    const root = document.getElementById("french8GradesApp");
    if (!root) return;
    const user = readUser();
    const signature = user ? [
      user.provider || "google",
      normalizeEmail(user.email),
      user.exp || "session",
      String(user.credential || "").slice(-18)
    ].join(":") : "guest";
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
        lastSignature = "";
        root.innerHTML = renderError("No fue posible cargar las notas. Verifique su sesion o intente recargar la pagina.");
      });
  }

  window.addEventListener("load", function () {
    render();
    setInterval(render, 900);
  });
})();
