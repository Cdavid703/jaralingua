(function () {
  "use strict";

  const PREPARATION_SECONDS = 300;
  const dilemmas = [
    {
      title: "The Scholarship Decision",
      character: "Sofia",
      image: "../../assets/img/english-intermediate-2/unit-2/visual-dilemma-debate/01-scholarship-or-stay-v1.webp",
      alt: "Sofia considers an overseas scholarship while her recovering mother needs help at home",
      situation: "Sofia has received a full scholarship to study in London. Her mother is recovering from surgery and will need daily help for the next three months. The university needs Sofia’s answer this week.",
      question: "Should Sofia accept the scholarship and leave next month?",
      forBrief: "Advise Sofia to accept the scholarship and go.",
      againstBrief: "Advise Sofia not to leave now or to choose another option."
    },
    {
      title: "The Bakery Dream",
      character: "Mateo",
      image: "../../assets/img/english-intermediate-2/unit-2/visual-dilemma-debate/02-bakery-or-stability-v1.webp",
      alt: "Mateo weighs his stable office job against using his savings to open a bakery",
      situation: "Mateo has a stable office job and has saved money for four years. He dreams of opening a neighborhood bakery. A suitable location is available now, but starting the business would use most of his savings.",
      question: "Should Mateo leave his job and open the bakery now?",
      forBrief: "Advise Mateo to leave his job and open the bakery.",
      againstBrief: "Advise Mateo to keep his job or wait before opening it."
    },
    {
      title: "A Friend Who Cheated",
      character: "Lina",
      image: "../../assets/img/english-intermediate-2/unit-2/visual-dilemma-debate/03-report-or-protect-v1.webp",
      alt: "Lina notices her close friend using hidden notes during an important university exam",
      situation: "During an important final exam, Lina notices her best friend using hidden notes. The university requires students to report cheating. Her friend could lose a scholarship if the professor finds out.",
      question: "Should Lina report her friend to the professor?",
      forBrief: "Advise Lina to report what she saw.",
      againstBrief: "Advise Lina not to report her friend or to handle it differently."
    },
    {
      title: "The Promotion and the Move",
      character: "Camila",
      image: "../../assets/img/english-intermediate-2/unit-2/visual-dilemma-debate/04-promotion-or-family-v1.webp",
      alt: "Camila considers a promotion in another city while her partner and child have an established life at home",
      situation: "Camila has been offered an important promotion with a higher salary, but the position is in another city. Her partner has a stable local job, and their daughter is happy at her school.",
      question: "Should Camila accept the promotion and ask her family to move?",
      forBrief: "Advise Camila to accept the promotion and move.",
      againstBrief: "Advise Camila to reject the promotion or find another option."
    },
    {
      title: "The Tour or the Degree",
      character: "Daniel",
      image: "../../assets/img/english-intermediate-2/unit-2/visual-dilemma-debate/05-tour-or-degree-v1.webp",
      alt: "Daniel weighs a rare music tour against finishing the final year of his university degree",
      situation: "Daniel is in the final year of university. His band has received a rare offer to tour for six months, but he would have to pause his studies. The band cannot promise another opportunity later.",
      question: "Should Daniel pause university and join the tour?",
      forBrief: "Advise Daniel to pause university and join the tour.",
      againstBrief: "Advise Daniel to finish his degree before touring."
    }
  ];

  const elements = {
    search: document.getElementById("dilemmaSearch"),
    searchClear: document.getElementById("dilemmaSearchClear"),
    searchCount: document.getElementById("dilemmaSearchCount"),
    picker: document.getElementById("dilemmaPicker"),
    image: document.getElementById("dilemmaImage"),
    count: document.getElementById("dilemmaCount"),
    title: document.getElementById("dilemmaTitle"),
    situation: document.getElementById("dilemmaSituation"),
    question: document.getElementById("dilemmaQuestion"),
    forBrief: document.getElementById("teamForBrief"),
    againstBrief: document.getElementById("teamAgainstBrief"),
    timerPanel: document.getElementById("timerPanel"),
    timerDisplay: document.getElementById("timerDisplay"),
    timerTrack: document.getElementById("timerTrack"),
    timerProgress: document.getElementById("timerProgress"),
    timerStatus: document.getElementById("timerStatus"),
    start: document.getElementById("timerStartButton"),
    reset: document.getElementById("timerResetButton"),
    previous: document.getElementById("previousDilemma"),
    next: document.getElementById("nextDilemma"),
    navigationStatus: document.getElementById("navigationStatus"),
    sound: document.getElementById("soundToggle"),
    presentation: document.getElementById("presentationButton"),
    overlay: document.getElementById("timeUpOverlay"),
    beginDebate: document.getElementById("beginDebateButton"),
    roundChecks: [...document.querySelectorAll("[data-round-check]")]
  };

  let currentIndex = 0;
  let remainingMilliseconds = PREPARATION_SECONDS * 1000;
  let deadline = 0;
  let timerId = 0;
  let timerState = "ready";
  let audioContext = null;
  let visibleIndices = dilemmas.map((_, index) => index);

  function normalizeSearch(value) {
    return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  }

  function formatTime(milliseconds) {
    const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  function setStartButton(icon, label) {
    elements.start.innerHTML = `<i class="bi ${icon}"></i><span>${label}</span>`;
  }

  function setNavigationDisabled(disabled) {
    [...elements.picker.querySelectorAll("button")].forEach((button) => { button.disabled = disabled; });
    const visiblePosition = visibleIndices.indexOf(currentIndex);
    elements.previous.disabled = disabled || visiblePosition <= 0;
    elements.next.disabled = disabled || visiblePosition < 0 || visiblePosition === visibleIndices.length - 1;
    elements.search.disabled = disabled;
    elements.searchClear.disabled = disabled;
  }

  function renderTimer() {
    const totalMilliseconds = PREPARATION_SECONDS * 1000;
    const elapsedSeconds = Math.min(PREPARATION_SECONDS, Math.round((totalMilliseconds - remainingMilliseconds) / 1000));
    const secondsLeft = Math.max(0, Math.ceil(remainingMilliseconds / 1000));
    elements.timerDisplay.textContent = formatTime(remainingMilliseconds);
    elements.timerDisplay.setAttribute("datetime", `PT${Math.floor(secondsLeft / 60)}M${secondsLeft % 60}S`);
    elements.timerTrack.setAttribute("aria-valuenow", String(elapsedSeconds));
    elements.timerPanel.style.setProperty("--timer-progress", `${(elapsedSeconds / PREPARATION_SECONDS) * 100}%`);
    elements.timerPanel.classList.toggle("is-warning", timerState === "running" && secondsLeft <= 30 && secondsLeft > 10);
    elements.timerPanel.classList.toggle("is-urgent", timerState === "running" && secondsLeft <= 10);
  }

  function stopInterval() {
    if (timerId) window.clearInterval(timerId);
    timerId = 0;
  }

  function prepareAudio() {
    if (!audioContext) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioContext = new AudioContext();
    }
    if (audioContext && audioContext.state === "suspended") audioContext.resume().catch(() => {});
  }

  function playAlarm() {
    if (!elements.sound.checked) return;
    prepareAudio();
    if (!audioContext) return;
    const startAt = audioContext.currentTime + .03;
    [0, .32, .64].forEach((offset, index) => {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = index === 2 ? 988 : 784;
      gain.gain.setValueAtTime(.0001, startAt + offset);
      gain.gain.exponentialRampToValueAtTime(.22, startAt + offset + .025);
      gain.gain.exponentialRampToValueAtTime(.0001, startAt + offset + .25);
      oscillator.connect(gain).connect(audioContext.destination);
      oscillator.start(startAt + offset);
      oscillator.stop(startAt + offset + .27);
    });
  }

  function finishTimer() {
    stopInterval();
    remainingMilliseconds = 0;
    timerState = "finished";
    elements.timerPanel.classList.remove("is-running", "is-warning", "is-urgent");
    elements.timerPanel.classList.add("is-finished");
    elements.timerStatus.textContent = "Preparation finished. Invite a volunteer to begin.";
    setStartButton("bi-arrow-clockwise", "Start again");
    setNavigationDisabled(false);
    renderTimer();
    playAlarm();
    elements.overlay.hidden = false;
    elements.beginDebate.focus();
  }

  function tick() {
    remainingMilliseconds = Math.max(0, deadline - Date.now());
    renderTimer();
    if (remainingMilliseconds <= 0) finishTimer();
  }

  function startTimer() {
    prepareAudio();
    if (timerState === "finished" || remainingMilliseconds <= 0) resetTimer();
    if (timerState === "running") {
      remainingMilliseconds = Math.max(0, deadline - Date.now());
      stopInterval();
      timerState = "paused";
      elements.timerPanel.classList.remove("is-running", "is-warning", "is-urgent");
      elements.timerStatus.textContent = "Paused. The image and language guide remain visible.";
      setStartButton("bi-play-fill", "Continue");
      setNavigationDisabled(false);
      renderTimer();
      return;
    }
    timerState = "running";
    deadline = Date.now() + remainingMilliseconds;
    elements.timerPanel.classList.remove("is-finished");
    elements.timerPanel.classList.add("is-running");
    elements.timerStatus.textContent = "Students are preparing one piece of advice.";
    setStartButton("bi-pause-fill", "Pause");
    setNavigationDisabled(true);
    tick();
    timerId = window.setInterval(tick, 200);
  }

  function resetTimer() {
    stopInterval();
    remainingMilliseconds = PREPARATION_SECONDS * 1000;
    timerState = "ready";
    elements.timerPanel.classList.remove("is-running", "is-warning", "is-urgent", "is-finished");
    elements.timerStatus.textContent = "Ready when the teacher starts the timer.";
    setStartButton("bi-play-fill", "Start preparation");
    elements.overlay.hidden = true;
    setNavigationDisabled(false);
    renderTimer();
  }

  function renderDilemma(index) {
    currentIndex = index;
    const dilemma = dilemmas[index];
    elements.image.src = dilemma.image;
    elements.image.alt = dilemma.alt;
    elements.count.textContent = `Dilemma ${index + 1} of ${dilemmas.length}`;
    elements.title.textContent = dilemma.title;
    elements.situation.textContent = dilemma.situation;
    elements.question.textContent = dilemma.question;
    elements.forBrief.textContent = dilemma.forBrief;
    elements.againstBrief.textContent = dilemma.againstBrief;
    elements.navigationStatus.textContent = `${index + 1} / ${dilemmas.length}`;
    [...elements.picker.querySelectorAll("button")].forEach((button) => button.setAttribute("aria-pressed", String(Number(button.dataset.dilemmaIndex) === index)));
    elements.roundChecks.forEach((checkbox) => { checkbox.checked = false; });
    resetTimer();
    const nextImage = dilemmas[index + 1];
    if (nextImage) new Image().src = nextImage.image;
  }

  function applySearch() {
    if (timerState === "running") return;
    const term = normalizeSearch(elements.search.value);
    visibleIndices = [];
    [...elements.picker.querySelectorAll("button")].forEach((button) => {
      const index = Number(button.dataset.dilemmaIndex);
      const dilemma = dilemmas[index];
      const searchableText = normalizeSearch(`${dilemma.title} ${dilemma.character} ${dilemma.situation} ${dilemma.question}`);
      const matches = !term || searchableText.includes(term);
      button.hidden = !matches;
      if (matches) visibleIndices.push(index);
    });
    const matchCount = visibleIndices.length;
    elements.searchCount.textContent = matchCount === 0
      ? "No dilemmas found"
      : `${matchCount} ${matchCount === 1 ? "dilemma" : "dilemmas"} found`;
    elements.searchClear.hidden = !term;
    if (matchCount && !visibleIndices.includes(currentIndex)) renderDilemma(visibleIndices[0]);
    else setNavigationDisabled(false);
  }

  function buildPicker() {
    elements.picker.innerHTML = dilemmas.map((dilemma, index) => `<button type="button" aria-pressed="${index === 0}" data-dilemma-index="${index}"><img src="${dilemma.image}" width="1672" height="941" alt="" loading="lazy"><div><span>${index + 1}</span><strong>${dilemma.title}</strong></div></button>`).join("");
    elements.picker.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-dilemma-index]");
      if (!button || timerState === "running") return;
      renderDilemma(Number(button.dataset.dilemmaIndex));
    });
  }

  function updatePresentationButton() {
    const active = Boolean(document.fullscreenElement);
    elements.presentation.innerHTML = active ? '<i class="bi bi-fullscreen-exit"></i><span>Exit presentation</span>' : '<i class="bi bi-arrows-fullscreen"></i><span>Presentation mode</span>';
  }

  elements.start.addEventListener("click", startTimer);
  elements.reset.addEventListener("click", resetTimer);
  elements.search.addEventListener("input", applySearch);
  elements.searchClear.addEventListener("click", () => {
    elements.search.value = "";
    applySearch();
    elements.search.focus();
  });
  elements.previous.addEventListener("click", () => {
    const position = visibleIndices.indexOf(currentIndex);
    if (position > 0 && timerState !== "running") renderDilemma(visibleIndices[position - 1]);
  });
  elements.next.addEventListener("click", () => {
    const position = visibleIndices.indexOf(currentIndex);
    if (position >= 0 && position < visibleIndices.length - 1 && timerState !== "running") renderDilemma(visibleIndices[position + 1]);
  });
  elements.beginDebate.addEventListener("click", () => {
    elements.overlay.hidden = true;
    elements.timerStatus.textContent = "Discussion open — ask who would like to start.";
    document.getElementById("activity").scrollIntoView({ behavior: "smooth", block: "start" });
  });
  elements.presentation.addEventListener("click", () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else document.documentElement.requestFullscreen().catch(() => {});
  });
  document.addEventListener("fullscreenchange", updatePresentationButton);
  document.addEventListener("visibilitychange", () => { if (!document.hidden && timerState === "running") tick(); });

  buildPicker();
  renderDilemma(0);
  updatePresentationButton();
}());
