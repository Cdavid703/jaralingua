(() => {
  const categories = [
    {
      id: "oublis",
      name: "Oublis et retards",
      icon: "bi-alarm-fill",
      mission: "Construis une réponse complète : si + plus-que-parfait, puis conditionnel passé.",
      grammar: "Obligatoire : utilise au moins une phrase négative.",
      questions: [
        "Tu as oublié de rendre un devoir important.",
        "Tu es arrive(e) en retard a un entretien.",
        "Tu as manqué le bus avant un examen.",
        "Tu n'as pas confirmé une réservation à temps.",
        "Tu as oublié d'envoyer un document au professeur.",
        "Tu as commencé un projet trop tard."
      ]
    },
    {
      id: "cod",
      name: "COD avant le verbe",
      icon: "bi-arrow-left-right",
      mission: "Reprends l'objet avec le, la, l' ou les dans ta réponse.",
      grammar: "Obligatoire : fais l'accord si le COD est avant le verbe.",
      questions: [
        "Tu as envoyé une lettre trop vite.",
        "Tu as mal préparé une présentation.",
        "Tu n'as pas lu les consignes.",
        "Tu as perdu les photos d'un projet.",
        "Tu as oublié la date limite.",
        "Tu n'as pas corrigé les erreurs."
      ]
    },
    {
      id: "etre",
      name: "Verbes avec être",
      icon: "bi-house-door-fill",
      mission: "Utilise un verbe avec être : aller, venir, arriver, partir, entrer, sortir, monter, descendre ou rester.",
      grammar: "Obligatoire : accorde le participe passé avec le sujet.",
      questions: [
        "Tu es parti(e) trop tôt d'une réunion.",
        "Tu n'es pas allé(e) à une activité importante.",
        "Tu es entré(e) dans la mauvaise salle.",
        "Tu es descendu(e) au mauvais arrêt.",
        "Tes amis sont venus trop tard.",
        "Une étudiante est restée silencieuse pendant le débat."
      ]
    },
    {
      id: "pronominaux",
      name: "Verbes pronominaux",
      icon: "bi-person-lines-fill",
      mission: "Utilise un verbe pronominal au plus-que-parfait ou au conditionnel passé.",
      grammar: "Obligatoire : explique si le participe s'accorde ou non.",
      questions: [
        "Tu ne t'es pas préparé(e) pour une présentation.",
        "Vous vous êtes trompé(e)(s) de date.",
        "Elle ne s'est pas inscrite à temps.",
        "Ils se sont mal organisés pour le projet.",
        "Tu t'es couché(e) trop tard avant l'examen.",
        "Nous nous sommes mal compris pendant la réunion."
      ]
    },
    {
      id: "decisions",
      name: "Décisions et conséquences",
      icon: "bi-signpost-split-fill",
      mission: "Explique la conséquence imaginaire avec parce que, donc ou c'est pourquoi.",
      grammar: "Obligatoire : donne une conséquence positive et une conséquence négative.",
      questions: [
        "Tu as choisi une option sans demander conseil.",
        "Tu as accepté une invitation alors que tu étais fatigué(e).",
        "Tu as refusé une opportunité par peur.",
        "Tu as acheté quelque chose sans comparer.",
        "Tu as pris une décision trop rapidement.",
        "Tu as gardé le silence dans une situation importante."
      ]
    },
    {
      id: "ton",
      name: "Ton et intention",
      icon: "bi-chat-quote-fill",
      mission: "Adapte ton ton : regret personnel, conseil à un ami, bilan professionnel ou histoire drôle.",
      grammar: "Obligatoire : termine avec une leçon apprise.",
      questions: [
        "Un ami a oublié de réviser pour un examen.",
        "Une équipe n'a pas vérifié les informations avant de publier.",
        "Un voyage a mal commencé à cause d'une mauvaise organisation.",
        "Une personne a envoyé un message trop direct.",
        "Un groupe a perdu du temps parce qu'il n'avait pas de plan.",
        "Un étudiant a eu peur de parler en français."
      ]
    }
  ];

  const state = {
    currentRotation: 0,
    remaining: [],
    drawn: [],
    spinning: false,
    audioContext: null,
    initialized: false
  };

  const $ = (selector) => document.querySelector(selector);

  function makePool() {
    return categories.flatMap((category, categoryIndex) =>
      category.questions.map((question, questionIndex) => ({
        categoryId: category.id,
        categoryName: category.name,
        categoryIndex,
        questionIndex,
        question,
        mission: category.mission,
        grammar: category.grammar,
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
        ? '<i class="bi bi-check2-circle"></i> Tous les scénarios sont sortis'
        : '<i class="bi bi-play-fill"></i> Tourner la roulette';
    }
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

  function showScenario(item) {
    const category = $("#currentCategory");
    const question = $("#currentQuestion");
    const mission = $("#currentMission");
    const grammar = $("#currentGrammar");
    const result = $("#resultPanel");
    if (category) category.innerHTML = `<i class="bi ${item.icon}"></i> ${item.categoryName}`;
    if (question) question.textContent = item.question;
    if (mission) mission.textContent = item.mission;
    if (grammar) grammar.textContent = item.grammar;
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
      showScenario(selected);
      renderHistory();
      updateCounters();
      playSelectionSound();
    }, durationMs + 80);
  }

  function resetGame() {
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
    const mission = $("#currentMission");
    const grammar = $("#currentGrammar");
    if (category) category.innerHTML = '<i class="bi bi-stars"></i> En attente du premier scénario';
    if (question) question.textContent = "Le professeur choisit un étudiant, puis la roulette donne une situation passée.";
    if (mission) mission.textContent = "L'étudiant construit une réponse orale avec si + plus-que-parfait et conditionnel passé.";
    if (grammar) grammar.textContent = "La réponse doit être claire, complète et grammaticalement justifiée.";
    renderHistory();
    updateCounters();
  }

  function handleControlClick(event) {
    const spinButton = event.target.closest("#spinButton");
    if (spinButton) {
      event.preventDefault();
      spinWheel();
      return;
    }
    const resetButton = event.target.closest("#resetButton");
    if (resetButton) {
      event.preventDefault();
      resetGame();
    }
  }

  function init() {
    if (state.initialized) return;
    state.initialized = true;
    state.remaining = makePool();
    const spinButton = $("#spinButton");
    if (spinButton) {
      spinButton.onclick = (event) => {
        event.preventDefault();
        spinWheel();
      };
      spinButton.addEventListener("click", spinWheel);
    }
    const resetButton = $("#resetButton");
    if (resetButton) {
      resetButton.onclick = (event) => {
        event.preventDefault();
        resetGame();
      };
      resetButton.addEventListener("click", resetGame);
    }
    document.addEventListener("click", handleControlClick);
    $("#soundToggle")?.addEventListener("change", () => {
      if (soundEnabled()) {
        getAudioContext();
        beep(660, 0.06, "sine", 0.035);
      }
    });
    resetGame();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
