(() => {
  const categories = [
    {
      id: "personnels",
      name: "Regrets personnels",
      icon: "bi-clock-history",
      tip: "Commence par: Avec le recul, j'aurais... / Je n'aurais peut-être pas dû...",
      questions: [
        "Quelle décision aurais-tu prise différemment cette année ?",
        "Dans un projet récent, qu'aurait-il fallu commencer plus tôt ?",
        "Qu'est-ce que tu aurais aimé apprendre avant aujourd'hui ?",
        "Dans une activité de classe, à quel moment aurait-il fallu demander de l'aide ?",
        "De quelle opportunité aurais-tu pu mieux profiter ?",
        "Dans une situation de communication, qu'aurait-il fallu dire plus clairement ?"
      ]
    },
    {
      id: "etudes",
      name: "Études et travail",
      icon: "bi-briefcase-fill",
      tip: "Utilise: J'aurais dû mieux... / Il aurait fallu que je...",
      questions: [
        "Pour tes études, qu'aurais-tu dû organiser autrement ?",
        "Dans un travail de groupe, qu'aurais-tu pu faire pour mieux collaborer ?",
        "Quelle habitude académique aurais-tu dû changer plus tôt ?",
        "Avant une présentation, qu'aurais-tu dû préparer avec plus d'attention ?",
        "Quelle compétence aurait été utile pour réussir un projet plus efficacement ?",
        "Dans un parcours académique, quelle décision aurait pu aider un étudiant davantage ?"
      ]
    },
    {
      id: "communication",
      name: "Relations et communication",
      icon: "bi-chat-dots-fill",
      tip: "Pour rester diplomatique: J'aurais peut-être pu... / On aurait pu...",
      questions: [
        "Dans une réunion, à qui aurait-il fallu expliquer l'objectif plus clairement ?",
        "Dans quelle situation de groupe aurait-il fallu écouter davantage ?",
        "Quel malentendu aurais-tu pu éviter avec une meilleure communication ?",
        "Quand une équipe aurait-elle dû être plus patiente avant de décider ?",
        "Quelle critique aurais-tu pu formuler de manière plus diplomatique ?",
        "Quelle conversation aurais-tu dû avoir plus tôt ?"
      ]
    },
    {
      id: "consequences",
      name: "Choix et conséquences",
      icon: "bi-signpost-split-fill",
      tip: "Structure utile: Si j'avais..., j'aurais... parce que...",
      questions: [
        "Quelle décision rapide aurais-tu dû réfléchir plus longtemps ?",
        "Dans l'organisation d'une activité, quel risque aurait-il fallu mieux calculer ?",
        "Quelle conséquence aurais-tu pu éviter avec plus de préparation ?",
        "À quel moment un groupe aurait-il mieux fait d'attendre avant d'agir ?",
        "Quelle décision aurait changé ton année si tu l'avais prise plus tôt ?",
        "Qu'est-ce qu'une équipe n'aurait pas dû laisser pour la dernière minute ?"
      ]
    },
    {
      id: "si",
      name: "Si j'avais su...",
      icon: "bi-lightbulb-fill",
      tip: "N'oublie pas: si + plus-que-parfait, conditionnel passé.",
      questions: [
        "Si tu avais su ce que tu sais aujourd'hui, qu'aurais-tu fait autrement ?",
        "Si une équipe avait eu plus de temps, qu'aurait-elle amélioré dans son projet ?",
        "Si un étudiant avait reçu un bon conseil plus tôt, qu'aurait-il changé ?",
        "Si tu avais mieux compris une situation, comment aurais-tu réagi ?",
        "Si le groupe avait mieux compris la consigne, qu'aurait-il fait différemment ?",
        "Si les conséquences avaient été plus claires, quelle décision n'aurait-on pas prise ?"
      ]
    },
    {
      id: "place",
      name: "À ta place...",
      icon: "bi-compass-fill",
      tip: "Formule une alternative: À ma place, j'aurais... / La prochaine fois, je...",
      questions: [
        "Si tu pouvais conseiller un étudiant au début du cours, que lui aurais-tu dit ?",
        "À la place d'un responsable de groupe, quelle décision aurais-tu recommandée ?",
        "Si un ami vivait la même situation que toi, que lui aurais-tu conseillé ?",
        "Avec ton expérience actuelle, qu'aurais-tu fait à la place d'un étudiant mal organisé ?",
        "Quelle alternative aurais-tu proposée dans un projet qui avançait mal ?",
        "Quelle erreur dans une présentation aurais-tu transformée en apprentissage ?"
      ]
    }
  ];

  const state = {
    currentRotation: 0,
    remaining: [],
    drawn: [],
    spinning: false,
    audioContext: null,
    students: [],
    remainingStudents: [],
    drawnStudents: []
  };

  const STORAGE_KEY = "french8-roulette-regrets-students";

  const $ = (selector) => document.querySelector(selector);

  function makePool() {
    return categories.flatMap((category, categoryIndex) =>
      category.questions.map((question, questionIndex) => ({
        categoryId: category.id,
        categoryName: category.name,
        categoryIndex,
        questionIndex,
        question,
        tip: category.tip,
        icon: category.icon
      }))
    );
  }

  function getAudioContext() {
    if (!state.audioContext) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return null;
      state.audioContext = new AudioContext();
    }
    if (state.audioContext.state === "suspended") {
      state.audioContext.resume();
    }
    return state.audioContext;
  }

  function soundEnabled() {
    const toggle = $("#soundToggle");
    return Boolean(toggle && toggle.checked);
  }

  function beep(frequency, duration, type = "sine", gainValue = 0.05) {
    if (!soundEnabled()) return;
    const audio = getAudioContext();
    if (!audio) return;
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, audio.currentTime);
    gain.gain.setValueAtTime(gainValue, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + duration);
    oscillator.connect(gain);
    gain.connect(audio.destination);
    oscillator.start();
    oscillator.stop(audio.currentTime + duration);
  }

  function playTickSequence(durationMs) {
    if (!soundEnabled()) return;
    let elapsed = 0;
    let interval = 55;
    const timer = window.setInterval(() => {
      elapsed += interval;
      const progress = Math.min(elapsed / durationMs, 1);
      interval = 55 + progress * 105;
      beep(820 - progress * 260, 0.035, "square", 0.028);
      if (elapsed >= durationMs) window.clearInterval(timer);
    }, interval);
  }

  function playSelectionSound() {
    beep(523.25, 0.08, "sine", 0.06);
    window.setTimeout(() => beep(659.25, 0.09, "sine", 0.055), 95);
    window.setTimeout(() => beep(783.99, 0.16, "triangle", 0.05), 205);
  }

  function buildCategoryChips() {
    const chipWrap = $("#categoryChips");
    if (!chipWrap) return;
    chipWrap.innerHTML = categories.map((category) => {
      const count = state.remaining.filter((item) => item.categoryId === category.id).length;
      const emptyClass = count === 0 ? " empty" : "";
      return `<span class="category-chip ${category.id}${emptyClass}"><i class="bi ${category.icon}"></i><b>${category.name}</b><em>${count}</em></span>`;
    }).join("");
  }

  function updateCounters() {
    const remainingCount = $("#remainingCount");
    const drawnCount = $("#drawnCount");
    if (remainingCount) remainingCount.textContent = String(state.remaining.length);
    if (drawnCount) drawnCount.textContent = String(state.drawn.length);
    buildCategoryChips();
    const spinButton = $("#spinButton");
    if (spinButton) {
      spinButton.disabled = state.spinning || state.remaining.length === 0;
      spinButton.innerHTML = state.remaining.length === 0
        ? '<i class="bi bi-check2-circle"></i> Toutes les questions sont sorties'
        : '<i class="bi bi-play-fill"></i> Tourner la roulette';
    }
  }

  function parseStudentNames(value) {
    return [...new Set(String(value || "")
      .split(/[\n;,]+/)
      .map((name) => name.trim().replace(/\s+/g, " "))
      .filter(Boolean))];
  }

  function persistStudents() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.students));
    } catch (_error) {
      // Local storage is optional; the activity still works without persistence.
    }
  }

  function loadPersistedStudents() {
    try {
      const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
      if (Array.isArray(parsed)) {
        state.students = parseStudentNames(parsed.join("\n"));
        state.remainingStudents = [...state.students];
      }
    } catch (_error) {
      state.students = [];
      state.remainingStudents = [];
    }
  }

  function updateStudentPanel() {
    const textarea = $("#studentNamesInput");
    const picked = $("#pickedStudentName");
    const status = $("#studentListStatus");
    const pickButton = $("#pickStudentButton");
    if (textarea && textarea.value.trim() === "") textarea.value = state.students.join("\n");
    if (picked && !state.drawnStudents.length) picked.textContent = state.students.length ? "Liste chargée. Cliquez sur Tirer étudiant." : "Aucun nom chargé.";
    if (status) {
      const total = state.students.length;
      const remaining = state.remainingStudents.length;
      status.textContent = total
        ? `${total} étudiant${total > 1 ? "s" : ""} chargé${total > 1 ? "s" : ""}. ${remaining} encore disponible${remaining > 1 ? "s" : ""} avant répétition.`
        : "0 étudiant chargé.";
    }
    if (pickButton) pickButton.disabled = state.students.length === 0;
  }

  function saveStudentsFromInput() {
    const names = parseStudentNames($("#studentNamesInput")?.value || "");
    state.students = names;
    state.remainingStudents = [...names];
    state.drawnStudents = [];
    persistStudents();
    const picked = $("#pickedStudentName");
    if (picked) picked.textContent = names.length ? "Liste chargée. Cliquez sur Tirer étudiant." : "Aucun nom chargé.";
    updateStudentPanel();
  }

  function pickStudent() {
    const picked = $("#pickedStudentName");
    if (!state.students.length) {
      if (picked) picked.textContent = "Chargez d'abord une liste de noms.";
      updateStudentPanel();
      return;
    }
    if (!state.remainingStudents.length) {
      state.remainingStudents = [...state.students];
      state.drawnStudents = [];
    }
    const index = Math.floor(Math.random() * state.remainingStudents.length);
    const selected = state.remainingStudents.splice(index, 1)[0];
    state.drawnStudents.unshift(selected);
    if (picked) picked.textContent = selected;
    updateStudentPanel();
  }

  function resetStudents() {
    if (state.students.length && !window.confirm("Voulez-vous effacer la liste des étudiants chargée dans ce navigateur ?")) return;
    state.students = [];
    state.remainingStudents = [];
    state.drawnStudents = [];
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (_error) {}
    const textarea = $("#studentNamesInput");
    const picked = $("#pickedStudentName");
    if (textarea) textarea.value = "";
    if (picked) picked.textContent = "Aucun nom chargé.";
    updateStudentPanel();
  }

  function handleStudentFile(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const textarea = $("#studentNamesInput");
      if (textarea) textarea.value = String(reader.result || "");
      saveStudentsFromInput();
    };
    reader.readAsText(file, "utf-8");
    event.target.value = "";
  }

  function renderHistory() {
    const history = $("#questionHistory");
    const emptyState = $("#emptyState");
    if (!history || !emptyState) return;
    history.innerHTML = state.drawn.map((item, index) => `
      <li>
        <span>${String(state.drawn.length - index).padStart(2, "0")}</span>
        <div>
          <b>${item.categoryName}</b>
          <p>${item.question}</p>
        </div>
      </li>
    `).join("");
    emptyState.hidden = state.drawn.length > 0;
  }

  function showQuestion(item) {
    const category = $("#currentCategory");
    const question = $("#currentQuestion");
    const tip = $("#currentTip");
    const result = $("#resultPanel");
    if (category) category.innerHTML = `<i class="bi ${item.icon}"></i> ${item.categoryName}`;
    if (question) question.textContent = item.question;
    if (tip) tip.textContent = item.tip;
    if (result) {
      result.classList.remove("fresh");
      void result.offsetWidth;
      result.classList.add("fresh");
    }
  }

  function spinWheel() {
    if (state.spinning || state.remaining.length === 0) return;
    getAudioContext();
    state.spinning = true;
    updateCounters();
    const selectedIndex = Math.floor(Math.random() * state.remaining.length);
    const selected = state.remaining[selectedIndex];
    const wheel = $("#rouletteWheel");
    const durationMs = 4200;
    const currentModulo = ((state.currentRotation % 360) + 360) % 360;
    const selectedCenter = selected.categoryIndex * 60 + 30;
    const correction = (360 - ((selectedCenter + currentModulo) % 360)) % 360;
    state.currentRotation += 1440 + correction + Math.floor(Math.random() * 4) * 360;
    if (wheel) {
      wheel.style.transition = `transform ${durationMs}ms cubic-bezier(.12,.68,.08,1)`;
      wheel.style.transform = `rotate(${state.currentRotation}deg)`;
    }
    playTickSequence(durationMs - 250);
    window.setTimeout(() => {
      state.remaining.splice(selectedIndex, 1);
      state.drawn.unshift(selected);
      state.spinning = false;
      showQuestion(selected);
      renderHistory();
      updateCounters();
      playSelectionSound();
    }, durationMs + 80);
  }

  function resetGame(confirmReset = false) {
    if (confirmReset && state.drawn.length > 0 && !window.confirm("Voulez-vous vraiment recommencer toute la roulette ? Les questions déjà sorties seront effacées.")) {
      return;
    }
    state.remaining = makePool();
    state.drawn = [];
    state.spinning = false;
    state.currentRotation = 0;
    const wheel = $("#rouletteWheel");
    if (wheel) {
      wheel.style.transition = "transform 500ms ease";
      wheel.style.transform = "rotate(0deg)";
    }
    const category = $("#currentCategory");
    const question = $("#currentQuestion");
    const tip = $("#currentTip");
    if (category) category.innerHTML = '<i class="bi bi-stars"></i> En attente de la première question';
    if (question) question.textContent = "Chargez les noms, tirez un étudiant, puis tournez la roulette pour choisir la question.";
    if (tip) tip.textContent = "Chaque réponse doit contenir un conditionnel passé, une explication et une alternative.";
    renderHistory();
    updateCounters();
  }

  function init() {
    state.remaining = makePool();
    loadPersistedStudents();
    $("#spinButton")?.addEventListener("click", spinWheel);
    $("#resetButton")?.addEventListener("click", () => resetGame(true));
    $("#saveStudentsButton")?.addEventListener("click", saveStudentsFromInput);
    $("#pickStudentButton")?.addEventListener("click", pickStudent);
    $("#resetStudentsButton")?.addEventListener("click", resetStudents);
    $("#studentFileInput")?.addEventListener("change", handleStudentFile);
    $("#soundToggle")?.addEventListener("change", () => {
      if (soundEnabled()) {
        getAudioContext();
        beep(660, 0.06, "sine", 0.035);
      }
    });
    resetGame(false);
    updateStudentPanel();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
