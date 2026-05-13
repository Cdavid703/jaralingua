(function () {
  const USER_KEY = "jaralingua_google_user";
  const ROLE_REQUESTS_KEY = "jaralingua_role_requests";
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
      type: "Parcial",
      date: "2026-06-05",
      displayDate: "Viernes 5 de junio",
      description: "Evaluacion final con los temas principales del curso."
    },
    {
      id: "shortStoryProject",
      title: "Cuento corto con imagenes",
      weight: 15,
      type: "Proyecto",
      date: "2026-06-02",
      displayDate: "Martes 2 de junio",
      description: "Entrega y exposicion. Maximo 150 palabras."
    },
    {
      id: "debateMay8",
      title: "Debate",
      weight: 15,
      type: "Debate",
      date: "2026-05-08",
      displayDate: "Viernes 8 de mayo",
      description: "Primer debate evaluado."
    },
    {
      id: "debateMay26",
      title: "Debate",
      weight: 15,
      type: "Debate",
      date: "2026-05-26",
      displayDate: "Martes 26 de mayo",
      description: "Segundo debate evaluado."
    },
    {
      id: "quizMay12",
      title: "Quiz",
      weight: 15,
      type: "Quiz",
      date: "2026-05-12",
      displayDate: "Martes 12 de mayo",
      description: "Quiz del curso."
    },
    {
      id: "bookPresentation",
      title: "Presentacion de libro",
      weight: 15,
      type: "Presentacion",
      date: null,
      displayDate: "Fecha individual",
      description: "Presentacion oral del libro asignado."
    },
    {
      id: "projectAudio",
      title: "Audio de presentacion de proyecto",
      weight: 5,
      type: "Audio",
      date: "2026-05-25",
      displayDate: "Semana del 25 al 29 de mayo",
      description: "Audio de avance o presentacion del proyecto."
    }
  ];

  const bonusEvent = {
    id: "finalWorkshopBonus",
    title: "Taller de preparacion del final",
    weight: 0,
    type: "Bonus",
    date: "2026-05-29",
    displayDate: "Viernes 29 de mayo",
    description: "Nota informativa. Si supera 4.0 queda registrado como bonus de conocimiento."
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

  function isAdmin(user) {
    return ADMIN_EMAILS.indexOf(normalizeEmail(user && user.email)) !== -1;
  }

  function currentRole(user) {
    if (!user) return "guest";
    if (isAdmin(user)) return "admin";
    const requests = readRoleRequests();
    const id = user.sub || user.email || "";
    const request = requests.find(function (item) {
      return item.id === id || normalizeEmail(item.email) === normalizeEmail(user.email);
    });
    if (request && request.status === "approved" && request.role === "teacher") return "teacher";
    return "student";
  }

  function studentForUser(user) {
    const email = normalizeEmail(user && user.email);
    return students.find(function (student) {
      return normalizeEmail(student.email) === email;
    }) || null;
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
      "1036448851": "Viernes 8 de mayo",
      "1037616675": "Martes 12 de mayo",
      "1039083985": "Martes 19 de mayo",
      "1040572353": "Viernes 22 de mayo",
      "1122508989": "Martes 26 de mayo"
    };
    return labels[studentId] || "Fecha individual";
  }

  function formatGrade(value) {
    return typeof value === "number" ? value.toFixed(1) : "Pendiente";
  }

  function gradeStatus(evaluation, student) {
    const grade = student.grades[evaluation.id];
    if (typeof grade === "number") return { label: "Calificado", className: "done" };
    const date = parseDate(dateForEvaluation(evaluation, student));
    if (date && dayDiff(date) < 0) return { label: "Pendiente de nota", className: "late" };
    return { label: "Pendiente", className: "pending" };
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
    if (item.completed) return { label: "Calificado", className: "done" };
    if (!item.date) return { label: "Pendiente", className: "pending" };
    const diff = dayDiff(item.date);
    if (diff < 0) return { label: item.bonus ? "Registrado como informativo" : "Pendiente de nota", className: "late" };
    if (diff === 0) return { label: "Hoy", className: "late" };
    if (diff === 1) return { label: "Mañana", className: "late" };
    return { label: "Programado", className: "pending" };
  }

  function renderLocked() {
    return `
      <div class="locked-card">
        <i class="bi bi-shield-lock-fill"></i>
        <h2 class="section-title">Inicia sesion con Google</h2>
        <p class="section-text mx-auto" style="max-width: 720px;">
          Para consultar notas u obligaciones debes ingresar con tu cuenta de Google. Si eres estudiante, solo veras tu numero ID, tus notas, porcentajes, fechas y estados.
        </p>
        <button class="btn-main mt-4" type="button" data-open-google-login><i class="bi bi-google"></i> Abrir acceso con Google</button>
      </div>
    `;
  }

  function renderNoRecord() {
    return `
      <div class="locked-card">
        <i class="bi bi-person-x-fill"></i>
        <h2 class="section-title">No hay registro de notas para esta cuenta</h2>
        <p class="section-text mx-auto" style="max-width: 720px;">
          La sesion de Google esta activa, pero este correo no esta asociado todavia a un estudiante del listado de Frances 7.
        </p>
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
            <strong>No hay obligaciones futuras pendientes registradas.</strong>
            <p class="mb-0">Revisa la grilla para ver notas pendientes o actividades ya evaluadas.</p>
          </div>
        </div>
      `;
    }
    const diff = dayDiff(item.date);
    const headline = diff === 0 ? "Tienes una obligacion hoy" : diff === 1 ? "Tienes una obligacion mañana" : "Proxima obligacion";
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
        <div class="metric-card"><span>Numero ID</span><strong>${escapeHtml(student.id)}</strong></div>
        <div class="metric-card"><span>Promedio calificado</span><strong>${summary.average == null ? "Pendiente" : summary.average.toFixed(2)}</strong></div>
        <div class="metric-card"><span>Peso evaluado</span><strong>${summary.completedWeight}%</strong></div>
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
            <p class="section-kicker">Panel del estudiante</p>
            <h2 class="section-title">Consulta individual</h2>
            <p class="section-text">Este panel no muestra nombre, correo ni contacto. Solo se presenta el numero ID, notas, porcentajes, fechas y estados de las obligaciones.</p>
            ${studentMetricsMarkup(student)}
          </div>
        </div>
        <div class="col-lg-7">
          <div class="grades-panel h-100">
            <p class="section-kicker">Resultados</p>
            <h2 class="section-title">Grilla de notas</h2>
            <div class="table-wrap">
              <table class="grades-table">
                <thead><tr><th>Actividad</th><th>Peso</th><th>Fecha</th><th>Nota</th><th>Estado</th></tr></thead>
                <tbody>${studentGradesRows(student)}</tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <section class="px-0 pb-0">
        <div class="grades-panel">
          <p class="section-kicker">Calendario</p>
          <h2 class="section-title">Obligaciones del estudiante</h2>
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
          <td>${summary.average == null ? "Pendiente" : summary.average.toFixed(2)}</td>
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
        ? "Tomás: 8 mayo. Sebastián: 12 mayo. Carmen: 19 mayo. Cristian: 22 mayo. Camilo: 26 mayo."
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
    const roleLabel = role === "admin" ? "Administrador" : "Profesor aprobado";
    const totalWeight = evaluations.reduce(function (sum, evaluation) {
      return sum + evaluation.weight;
    }, 0);
    return `
      <div class="privacy-note mb-4">
        <i class="bi bi-shield-check"></i>
        <div>
          <strong>Vista de ${roleLabel}</strong>
          <p class="mb-0">Esta vista muestra datos completos del estudiante y el resumen de notas. La vista de estudiante no muestra nombre, correo ni contacto.</p>
        </div>
      </div>
      <div class="metric-grid mb-4">
        <div class="metric-card"><span>Estudiantes</span><strong>${students.length}</strong></div>
        <div class="metric-card"><span>Porcentaje evaluativo</span><strong>${totalWeight}%</strong></div>
        <div class="metric-card"><span>Bonus</span><strong>Info</strong></div>
      </div>
      <div class="grades-panel mb-4">
        <p class="section-kicker">Datos privados</p>
        <h2 class="section-title">Listado de estudiantes</h2>
        <div class="table-wrap">
          <table class="grades-table">
            <thead><tr><th>Nombre completo</th><th>Numero ID</th><th>Correo institucional</th><th>Contacto</th><th>Promedio calificado</th><th>Peso evaluado</th></tr></thead>
            <tbody>${staffStudentRows()}</tbody>
          </table>
        </div>
      </div>
      <div class="grades-panel mb-4">
        <p class="section-kicker">Notas</p>
        <h2 class="section-title">Grilla general de resultados</h2>
        <div class="table-wrap">
          <table class="grades-table">
            <thead>
              <tr>
                <th>Estudiante</th>
                ${evaluations.map(function (evaluation) { return `<th>${escapeHtml(evaluation.title)}<br>${evaluation.weight}%</th>`; }).join("")}
              </tr>
            </thead>
            <tbody>${staffGradeRows()}</tbody>
          </table>
        </div>
      </div>
      <div class="grades-panel">
        <p class="section-kicker">Calendario</p>
        <h2 class="section-title">Obligaciones del curso</h2>
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
      <strong>${diff === 0 ? "Obligacion para hoy" : "Recordatorio para mañana"}</strong>
      <p class="mb-0">${escapeHtml(item.title)} · ${escapeHtml(item.displayDate)} · ${escapeHtml(item.description)}</p>
      <button type="button">Entendido</button>
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
    const signature = user ? normalizeEmail(user.email) + ":" + role + ":" + localStorage.getItem(ROLE_REQUESTS_KEY) : "guest";
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
      root.innerHTML = renderNoRecord();
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
