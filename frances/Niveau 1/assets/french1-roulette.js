const rouletteState = {
  originalNames: [],
  studentPool: [],
  history: [],
  rotation: 0,
  spinning: false
};

function getUniqueNames(rawText) {
  const names = rawText
    .split(/\n|,/)
    .map((name) => name.trim())
    .filter(Boolean);

  const seen = new Set();
  const uniqueNames = [];

  names.forEach((name) => {
    const key = name.toLocaleLowerCase("fr");
    if (!seen.has(key)) {
      seen.add(key);
      uniqueNames.push(name);
    }
  });

  return uniqueNames;
}

function byId(id) {
  return document.getElementById(id);
}

function loadStudentNames() {
  const rawText = byId("studentNamesInput").value;
  const names = getUniqueNames(rawText);

  if (names.length < 2) {
    alert("Écrivez au moins deux prénoms.");
    return;
  }

  rouletteState.originalNames = names.slice();
  rouletteState.studentPool = names.slice();
  rouletteState.history = [];
  rouletteState.rotation = 0;

  byId("studentAResult").textContent = "—";
  byId("studentBResult").textContent = "—";
  byId("rouletteWheel").style.transform = "rotate(0deg)";

  renderRoulette();
}

function useSampleNames() {
  const sampleNames = [
    "Ana",
    "Paul",
    "Sofia",
    "Lucas",
    "Chloé",
    "Hugo",
    "Camila",
    "Noah"
  ];

  byId("studentNamesInput").value = sampleNames.join("\n");
  loadStudentNames();
}

function openRosterFilePicker() {
  byId("studentRosterFile").click();
}

function renderRoulette() {
  renderStudentPool();
  renderHistory();

  const spinBtn = byId("spinBtn");
  const status = byId("rouletteStatus");

  byId("studentsLeftCount").textContent = rouletteState.studentPool.length;

  if (rouletteState.studentPool.length >= 2) {
    spinBtn.disabled = false;
    status.textContent = "Prêt. Faites tourner la roulette pour sélectionner deux étudiants.";
  } else if (rouletteState.studentPool.length === 1) {
    spinBtn.disabled = true;
    status.textContent = "Il reste un seul étudiant. Réinitialisez l’activité ou ajoutez des prénoms.";
  } else if (rouletteState.history.length > 0) {
    spinBtn.disabled = true;
    status.textContent = "Tous les étudiants ont participé. Réinitialisez pour recommencer.";
  } else {
    spinBtn.disabled = true;
    status.textContent = "Chargez au moins deux prénoms pour commencer.";
  }
}

function renderStudentPool() {
  const container = byId("studentPoolList");
  container.innerHTML = "";

  if (rouletteState.studentPool.length === 0) {
    const message = document.createElement("p");
    message.className = "empty-list-message";
    message.textContent = rouletteState.history.length
      ? "Aucun étudiant restant dans la liste active."
      : "Aucun étudiant chargé.";
    container.appendChild(message);
    return;
  }

  rouletteState.studentPool.forEach((name) => {
    const chip = document.createElement("span");
    chip.className = "student-chip";
    chip.textContent = name;
    container.appendChild(chip);
  });
}

function renderHistory() {
  const body = byId("rouletteHistoryBody");
  body.innerHTML = "";

  rouletteState.history.forEach((round) => {
    const row = document.createElement("tr");

    const roundCell = document.createElement("td");
    roundCell.textContent = round.round;

    const studentACell = document.createElement("td");
    studentACell.textContent = round.studentA;

    const studentBCell = document.createElement("td");
    studentBCell.textContent = round.studentB;

    row.append(roundCell, studentACell, studentBCell);
    body.appendChild(row);
  });
}

function spinRoulette() {
  if (rouletteState.spinning) return;

  if (rouletteState.studentPool.length < 2) {
    alert("Il faut au moins deux étudiants pour faire tourner la roulette.");
    return;
  }

  rouletteState.spinning = true;
  byId("spinBtn").disabled = true;

  const wheel = byId("rouletteWheel");
  rouletteState.rotation += 1440 + Math.floor(Math.random() * 720);
  wheel.style.transform = `rotate(${rouletteState.rotation}deg)`;

  setTimeout(() => {
    const indexA = Math.floor(Math.random() * rouletteState.studentPool.length);
    const studentA = rouletteState.studentPool.splice(indexA, 1)[0];

    const indexB = Math.floor(Math.random() * rouletteState.studentPool.length);
    const studentB = rouletteState.studentPool.splice(indexB, 1)[0];

    byId("studentAResult").textContent = studentA;
    byId("studentBResult").textContent = studentB;

    rouletteState.history.push({
      round: rouletteState.history.length + 1,
      studentA,
      studentB
    });

    rouletteState.spinning = false;
    renderRoulette();
  }, 2600);
}

function resetRoulette() {
  rouletteState.originalNames = [];
  rouletteState.studentPool = [];
  rouletteState.history = [];
  rouletteState.rotation = 0;
  rouletteState.spinning = false;

  byId("studentNamesInput").value = "";
  byId("rouletteWheel").style.transform = "rotate(0deg)";
  byId("studentAResult").textContent = "—";
  byId("studentBResult").textContent = "—";
  byId("studentsLeftCount").textContent = "0";
  byId("rouletteStatus").textContent = "Chargez au moins deux prénoms pour commencer.";
  byId("spinBtn").disabled = true;

  renderStudentPool();
  renderHistory();
}

document.addEventListener("DOMContentLoaded", () => {
  if (window.JaraLinguaRosterImport) {
    window.JaraLinguaRosterImport.setup({
      fileInputId: "studentRosterFile",
      textAreaId: "studentNamesInput",
      statusId: "rosterImportStatus",
      onNamesLoaded: loadStudentNames
    });
  }

  renderRoulette();
});
