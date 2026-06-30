(() => {
  "use strict";

  const API_PATH = "/api/french8/pronunciation-assessment";
  const AUDIO_BASE = "../audio/theme-6/cards/";
  const IMAGE_BASE = "../img/theme-6-meteo-saisons/";
  const STORAGE_KEY = "jaralingua:french2:theme6:meteo-saisons:v1";
  const PASS_SCORE = 78;

  const CARDS = [
    { slug: "il-fait-chaud", phrase: "Il fait chaud.", category: "meteo", hint: "On parle de la température avec il fait." },
    { slug: "il-fait-froid", phrase: "Il fait froid.", category: "meteo", hint: "On parle de la température avec il fait." },
    { slug: "il-fait-beau", phrase: "Il fait beau.", category: "meteo", hint: "Le temps est agréable." },
    { slug: "il-fait-mauvais", phrase: "Il fait mauvais.", category: "meteo", hint: "Le temps n'est pas agréable." },
    { slug: "il-pleut", phrase: "Il pleut.", category: "meteo", hint: "Verbe impersonnel : il pleut." },
    { slug: "il-neige", phrase: "Il neige.", category: "meteo", hint: "Verbe impersonnel : il neige." },
    { slug: "il-y-a-du-soleil", phrase: "Il y a du soleil.", category: "meteo", hint: "Il y a + nom : du soleil." },
    { slug: "il-y-a-du-vent", phrase: "Il y a du vent.", category: "meteo", hint: "Il y a + nom : du vent." },
    { slug: "il-y-a-des-nuages", phrase: "Il y a des nuages.", category: "meteo", hint: "Il y a + nom pluriel : des nuages." },
    { slug: "il-y-a-de-la-pluie", phrase: "Il y a de la pluie.", category: "meteo", hint: "Il y a + nom féminin : de la pluie." },
    { slug: "le-printemps", phrase: "Le printemps.", category: "saison", hint: "Saison masculine : au printemps." },
    { slug: "l-ete", phrase: "L'été.", display: "L'été.", category: "saison", hint: "Saison masculine avec voyelle : en été." },
    { slug: "l-automne", phrase: "L'automne.", category: "saison", hint: "Saison masculine avec voyelle : en automne." },
    { slug: "l-hiver", phrase: "L'hiver.", category: "saison", hint: "Saison masculine avec voyelle : en hiver." }
  ];

  const $ = (id) => document.getElementById(id);
  const els = {
    phase: $("phaseLabel"),
    progress: $("cardProgress"),
    image: $("cardImage"),
    phrase: $("cardPhrase"),
    category: $("cardCategory"),
    hint: $("cardHint"),
    status: $("gameStatus"),
    audio: $("cardAudio"),
    play: $("playAudioBtn"),
    prev: $("prevCardBtn"),
    next: $("nextCardBtn"),
    startPractice: $("startPracticeBtn"),
    record: $("recordBtn"),
    stop: $("stopBtn"),
    skip: $("skipBtn"),
    micStatus: $("micStatus"),
    recordHelp: $("recordHelp"),
    permission: $("micPermissionHelp"),
    microphoneSelect: $("microphoneSelect"),
    result: $("pronunciationResult"),
    transcript: $("transcriptBox"),
    score: $("scoreValue"),
    final: $("finalPanel"),
    finalScore: $("finalScore"),
    finalDetails: $("finalDetails"),
    restart: $("restartBtn")
  };

  let state = { phase: "discover", index: 0, practice: [], attempts: [], finished: false };
  let stream = null;
  let recorder = null;
  let chunks = [];

  try {
    state = Object.assign(state, JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"));
  } catch (_error) {}
  if (!Array.isArray(state.practice) || state.practice.length !== CARDS.length) state.practice = shuffle([...CARDS.keys()]);
  if (!Array.isArray(state.attempts)) state.attempts = [];

  function clean(text) {
    return String(text || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[’']/g, " ")
      .replace(/[^a-z0-9\s-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function display(card) {
    return card.display || card.phrase;
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function shuffle(items) {
    for (let i = items.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    return items;
  }

  function currentCard() {
    const sourceIndex = state.phase === "discover" ? state.index : state.practice[state.index];
    return CARDS[sourceIndex] || CARDS[0];
  }

  function audioUrl(card) {
    return `${AUDIO_BASE}${card.slug}.mp3?v=20260630-n2-theme6`;
  }

  function playAudio() {
    const card = currentCard();
    els.audio.src = audioUrl(card);
    els.audio.currentTime = 0;
    els.audio.play().catch(() => {
      if (!("speechSynthesis" in window)) return;
      const utterance = new SpeechSynthesisUtterance(display(card));
      utterance.lang = "fr-FR";
      utterance.rate = 0.86;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    });
  }

  function render() {
    const card = currentCard();
    const total = CARDS.length;
    els.image.src = `${IMAGE_BASE}${card.slug}.png?v=20260630-pro`;
    els.image.alt = state.phase === "discover" ? display(card) : "Carte de météo ou de saison à prononcer";
    els.category.textContent = card.category === "saison" ? "Saison" : "Météo";
    els.hint.textContent = state.phase === "discover" ? card.hint : "Regardez l'image, dites la phrase en francais, puis continuez.";
    els.phase.textContent = state.phase === "discover" ? "Ronde 1 : ecoute guidee" : "Ronde 2 : production orale";
    els.progress.textContent = `${state.index + 1} / ${total}`;
    els.phrase.textContent = state.phase === "discover" ? display(card) : "";
    els.phrase.classList.toggle("is-hidden", state.phase !== "discover");
    els.prev.hidden = state.phase !== "discover";
    els.next.hidden = state.phase !== "discover";
    els.startPractice.hidden = state.phase !== "discover" || state.index < total - 1;
    els.record.hidden = state.phase !== "practice";
    els.stop.hidden = state.phase !== "practice";
    els.skip.hidden = state.phase !== "practice";
    els.result.hidden = state.phase !== "practice" || !state.attempts[state.index];
    els.final.hidden = !state.finished;
    els.prev.disabled = state.index === 0;
    els.next.disabled = state.index >= total - 1;
    if (state.phase === "practice") {
      const attempt = state.attempts[state.index];
      els.score.textContent = attempt ? `${Math.round(attempt.score)}%` : "--";
      els.transcript.innerHTML = attempt
        ? `<strong>Phrase attendue :</strong> ${display(card)}<br><strong>Transcription :</strong> ${attempt.transcript || "non disponible"}`
        : "Après l'enregistrement, le système donne un bilan court. Si ce n'est pas parfait, on continue quand même.";
    }
    updateStatus();
    save();
  }

  function updateStatus(message) {
    if (message) {
      els.status.textContent = message;
      return;
    }
    if (state.phase === "discover") {
      els.status.textContent = "Ecoutez la voix professionnelle, observez l'image et repetez calmement.";
    } else {
      els.status.textContent = "La carte apparait sans texte. Enregistrez votre phrase; le jeu continue meme si la reponse est a retravailler.";
    }
  }

  function setRecording(active) {
    els.record.disabled = active;
    els.stop.disabled = !active;
    els.record.classList.toggle("is-recording", active);
  }

  function localScore(transcript, expected) {
    const expectedWords = clean(expected).split(/\s+/).filter(Boolean);
    const heard = new Set(clean(transcript).split(/\s+/).filter(Boolean));
    const matched = expectedWords.filter((word) => heard.has(word)).length;
    return expectedWords.length ? Math.round((matched / expectedWords.length) * 100) : 0;
  }

  async function analyze(blob, card) {
    const form = new FormData();
    form.append("audio", blob, "meteo-saisons.webm");
    form.append("language", "fr");
    form.append("referenceText", display(card));
    const response = await fetch(API_PATH, { method: "POST", body: form });
    if (!response.ok) throw new Error(`Analyse indisponible (${response.status})`);
    const data = await response.json();
    const transcript = data.transcript || data.text || "";
    const fallback = localScore(transcript, display(card));
    return {
      score: Math.max(0, Math.min(100, Math.round(data.score || data.accuracy || fallback))),
      transcript,
      feedback: data.feedback || ""
    };
  }

  function recordAttempt(result) {
    const score = Number(result.score) || 0;
    const ok = score >= PASS_SCORE;
    state.attempts[state.index] = {
      score,
      transcript: result.transcript || "",
      ok,
      feedback: result.feedback || (ok ? "Très bien, phrase reconnue." : "À retravailler, mais on continue.")
    };
    els.phrase.textContent = display(currentCard());
    els.phrase.classList.remove("is-hidden");
    els.result.hidden = false;
    els.result.className = `pronunciation-result ${ok ? "ok" : "review"}`;
    els.result.innerHTML = `<strong>${ok ? "Correct." : "A retravailler."}</strong> ${state.attempts[state.index].feedback}`;
    updateStatus(ok ? "Bonne prononciation. Vous pouvez passer à la carte suivante." : "Ce n'est pas encore solide, mais le jeu ne bloque pas. On avance.");
    render();
  }

  async function startRecording() {
    const card = currentCard();
    if (!navigator.mediaDevices?.getUserMedia) {
      recordAttempt({ score: 0, transcript: "", feedback: "Microphone non disponible dans ce navigateur." });
      return;
    }
    try {
      if (window.JaraMicPermissions) {
        const ok = await window.JaraMicPermissions.ensureReady({
          micButton: els.record,
          stopButton: els.stop,
          recordStatus: els.micStatus,
          recordHelp: els.recordHelp,
          unsupported: els.permission,
          language: "fr"
        });
        if (!ok) return;
      }
      const constraints = window.JaraMicPermissions?.audioConstraints(els.microphoneSelect.value) || {
        echoCancellation: { ideal: true },
        noiseSuppression: { ideal: true },
        autoGainControl: { ideal: true },
        channelCount: { ideal: 1 }
      };
      if (els.microphoneSelect.value) constraints.deviceId = { exact: els.microphoneSelect.value };
      stream = await navigator.mediaDevices.getUserMedia({ audio: constraints });
      chunks = [];
      recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
      recorder.onstop = async () => {
        setRecording(false);
        stream?.getTracks().forEach((track) => track.stop());
        const blob = new Blob(chunks, { type: recorder?.mimeType || "audio/webm" });
        els.micStatus.textContent = "Analyse en cours...";
        try {
          recordAttempt(await analyze(blob, card));
        } catch (error) {
          recordAttempt({ score: 0, transcript: "", feedback: `${error.message || "Analyse indisponible"}. Le professeur peut valider oralement et la classe continue.` });
        }
      };
      recorder.start();
      els.micStatus.textContent = "Enregistrement en cours...";
      setRecording(true);
    } catch (error) {
      if (!window.JaraMicPermissions?.handleError(error, {
        recordStatus: els.micStatus,
        recordHelp: els.recordHelp,
        microphoneSelect: els.microphoneSelect,
        language: "fr"
      })) {
        recordAttempt({ score: 0, transcript: "", feedback: "Microphone indisponible. Le professeur peut faire la validation orale." });
      }
    }
  }

  function nextPracticeCard() {
    if (state.index < CARDS.length - 1) {
      state.index += 1;
      render();
      return;
    }
    finish();
  }

  function finish() {
    state.finished = true;
    const scored = state.attempts.filter(Boolean);
    const score = scored.length ? Math.round(scored.reduce((sum, item) => sum + Number(item.score || 0), 0) / CARDS.length) : 0;
    const correct = scored.filter((item) => item.ok).length;
    els.finalScore.textContent = `${score}%`;
    els.finalDetails.textContent = `${correct} cartes validees sur ${CARDS.length}. Les cartes faibles peuvent etre rejouees sans penaliser le rythme de classe.`;
    render();
    els.final.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  els.play.addEventListener("click", playAudio);
  els.prev.addEventListener("click", () => { state.index = Math.max(0, state.index - 1); render(); });
  els.next.addEventListener("click", () => { state.index = Math.min(CARDS.length - 1, state.index + 1); render(); playAudio(); });
  els.startPractice.addEventListener("click", () => { state.phase = "practice"; state.index = 0; state.attempts = []; state.finished = false; render(); });
  els.record.addEventListener("click", startRecording);
  els.stop.addEventListener("click", () => recorder?.state === "recording" && recorder.stop());
  els.skip.addEventListener("click", () => {
    if (!state.attempts[state.index]) recordAttempt({ score: 0, transcript: "", feedback: "Carte passee. Elle reste a retravailler." });
    nextPracticeCard();
  });
  els.restart.addEventListener("click", () => {
    state = { phase: "discover", index: 0, practice: shuffle([...CARDS.keys()]), attempts: [], finished: false };
    render();
  });

  if (navigator.mediaDevices?.enumerateDevices) {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const mics = devices.filter((device) => device.kind === "audioinput");
      els.microphoneSelect.innerHTML = '<option value="">Microphone par défaut</option>' + mics.map((device, i) => `<option value="${device.deviceId}">${device.label || `Microphone ${i + 1}`}</option>`).join("");
    }).catch(() => {});
  }

  render();
})();
