(() => {
  "use strict";

  const STAGES = [
    {
      label: "Section 1",
      shortLabel: "1",
      audio: "../audio/pronunciation/theme-05/section-1.mp3",
      text: "Ce qui inquiète les journalistes, c’est la vitesse à laquelle une fausse information circule."
    },
    {
      label: "Section 2",
      shortLabel: "2",
      audio: "../audio/pronunciation/theme-05/section-2.mp3",
      text: "C’est souvent une image sortie de son contexte qui déclenche la confusion."
    },
    {
      label: "Section 3",
      shortLabel: "3",
      audio: "../audio/pronunciation/theme-05/section-3.mp3",
      text: "Ce que nous devons vérifier, ce sont les sources, les dates et les preuves."
    },
    {
      label: "Section 4",
      shortLabel: "4",
      audio: "../audio/pronunciation/theme-05/section-4.mp3",
      text: "C’est en comparant plusieurs médias qu’on peut éviter de partager une rumeur."
    },
    {
      label: "Défi final",
      shortLabel: "Défi",
      final: true,
      audio: "../audio/pronunciation/theme-05/n8-05d-medias-desinformation-modele-france.mp3",
      text: "Ce qui inquiète les journalistes, c’est la vitesse à laquelle une fausse information circule. C’est souvent une image sortie de son contexte qui déclenche la confusion. Ce que nous devons vérifier, ce sont les sources, les dates et les preuves. C’est en comparant plusieurs médias qu’on peut éviter de partager une rumeur."
    }
  ];

  const API_PATH = "/api/french8/pronunciation-assessment";
  const STORAGE_KEY = "jaralingua:french8:pronunciation-05d:v1";
  const EVALUATION_ID = "pronunciation05d";
  const LOCAL_URL = "http://127.0.0.1:8020/frances/Niveau%208/ateliers/prononciation-05d-medias-desinformation.html";
  const readingText = document.getElementById("readingText");
  const micButton = document.getElementById("micButton");
  const stopButton = document.getElementById("stopButton");
  const resetButton = document.getElementById("resetButton");
  const resetChallengeButton = document.createElement("button");
  resetChallengeButton.type = "button";
  resetChallengeButton.className = "action-button reset reset-challenge";
  resetChallengeButton.innerHTML = '<i class="bi bi-arrow-clockwise"></i> Réinitialiser tout le défi';
  resetButton.insertAdjacentElement("afterend", resetChallengeButton);
  const recordStatus = document.getElementById("recordStatus");
  const recordHelp = document.querySelector(".record-help");
  const liveTranscript = document.getElementById("liveTranscript");
  const timer = document.getElementById("timer");
  const results = document.getElementById("results");
  const studentAudio = document.getElementById("studentAudio");
  const modelAudio = document.getElementById("modelAudio");
  const modelButton = document.getElementById("modelButton");
  const unsupported = document.getElementById("unsupported");

  let savedProgress = null;
  try { savedProgress = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"); } catch (_error) { savedProgress = null; }
  let currentStageIndex = Number.isInteger(savedProgress?.currentStageIndex) ? Math.max(0, Math.min(STAGES.length - 1, savedProgress.currentStageIndex)) : 0;
  const stageScores = Array.from({ length: STAGES.length }, (_, index) => savedProgress?.stageScores?.[index] || null);
  const attemptHistory = Array.from({ length: STAGES.length }, (_, index) => Array.isArray(savedProgress?.attemptHistory?.[index]) ? savedProgress.attemptHistory[index] : []);
  let mediaRecorder = null;
  let mediaStream = null;
  let chunks = [];
  let startedAt = 0;
  let recordedDurationMs = 0;
  let timerHandle = null;
  let objectUrl = null;
  let discardRecording = false;
  let analyzing = false;
  let audioContext = null;
  let analyser = null;
  let meterFrame = null;
  let maxInputLevel = 0;

  const stagePanel = document.createElement("div");
  stagePanel.className = "stage-panel";
  stagePanel.innerHTML = '<div class="stage-panel-copy"><span id="stageCounter"></span><strong id="stageTitle"></strong></div><div class="stage-progress" id="stageProgress"></div>';
  readingText.parentNode.insertBefore(stagePanel, readingText);
  const stageCounter = document.getElementById("stageCounter");
  const stageTitle = document.getElementById("stageTitle");
  const stageProgress = document.getElementById("stageProgress");

  const microphonePicker = document.createElement("label");
  microphonePicker.className = "microphone-picker";
  microphonePicker.innerHTML = '<span><i class="bi bi-mic"></i> Microphone utilisé</span><select id="microphoneSelect" aria-label="Choisir le microphone"><option value="">Microphone par défaut</option></select>';
  micButton.parentNode.insertBefore(microphonePicker, micButton);
  const microphoneSelect = document.getElementById("microphoneSelect");

  const history = document.createElement("div");
  history.className = "stage-history";
  document.querySelector(".metrics").insertAdjacentElement("afterend", history);
  const nextButton = document.createElement("button");
  nextButton.type = "button";
  nextButton.className = "action-button next-stage";
  nextButton.hidden = true;
  document.getElementById("feedback").insertAdjacentElement("afterend", nextButton);
  const retryButton = document.createElement("button");
  retryButton.type = "button";
  retryButton.className = "action-button retry-stage";
  retryButton.innerHTML = '<i class="bi bi-arrow-repeat"></i> Refaire cette section';
  retryButton.hidden = true;
  nextButton.insertAdjacentElement("beforebegin", retryButton);
  const wordHelp = document.createElement("div");
  wordHelp.className = "word-help";
  wordHelp.hidden = true;
  readingText.insertAdjacentElement("afterend", wordHelp);
  const levelMeter = document.createElement("div");
  levelMeter.className = "level-meter";
  levelMeter.innerHTML = '<span>Niveau du microphone</span><div><i id="levelMeterBar"></i></div><b id="levelMeterValue">En attente</b>';
  microphonePicker.insertAdjacentElement("afterend", levelMeter);
  const levelMeterBar = document.getElementById("levelMeterBar");
  const levelMeterValue = document.getElementById("levelMeterValue");
  const finalSummary = document.createElement("div");
  finalSummary.className = "final-summary";
  finalSummary.hidden = true;
  history.insertAdjacentElement("afterend", finalSummary);

  function currentStage() {
    return STAGES[currentStageIndex];
  }

  function normalizeWord(value) {
    const normalized = value.toLocaleLowerCase("fr-FR").replace(/[\u2019']/g, "'").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zœæ'-]/g, "").replace(/^[-']+|[-']+$/g, "");
    const homophones = {
      "inquietes": "inquiete",
      "journaliste": "journalistes",
      "fausses": "fausse",
      "sorti": "sortie",
      "declencher": "declenche",
      "verifier": "verifier",
      "source": "sources",
      "preuve": "preuves",
      "media": "medias",
      "eviter": "eviter"
    };
    return homophones[normalized] || normalized;
  }

  function tokens(value) {
    return value.split(/\s+/).map(normalizeWord).filter(Boolean);
  }

  function spokenWord(value) {
    return value.replace(/[.,!?;:()[\]{}«»"]/g, "").trim();
  }

  function renderReference(states = []) {
    let index = 0;
    readingText.innerHTML = currentStage().text.split(/(\s+)/).map((part) => {
      if (/^\s+$/.test(part)) return part;
      const state = states[index++] || "";
      return `<button type="button" class="reading-word ${state}" data-word="${index - 1}" data-spoken="${spokenWord(part)}" title="Écouter ce mot">${part}</button>`;
    }).join("");
  }

  function updateStageUI() {
    const stage = currentStage();
    stageCounter.textContent = stage.final ? "Défi final" : `Pratique guidée · ${currentStageIndex + 1} sur 4`;
    stageTitle.textContent = stage.final ? "Lisez maintenant le paragraphe complet" : stage.label;
    stageProgress.innerHTML = STAGES.map((item, index) => {
      const classes = ["stage-dot"];
      if (index === currentStageIndex) classes.push("is-active");
      if (stageScores[index]) classes.push("is-done");
      return `<span class="${classes.join(" ")}" title="${item.label}">${stageScores[index] ? Math.round(stageScores[index].overall) : item.shortLabel}</span>`;
    }).join("");
    document.getElementById("resultTitle").textContent = `Résultat · ${stage.label}`;
    modelAudio.pause();
    modelAudio.src = stage.audio;
    modelAudio.load();
    modelButton.querySelector("i").className = "bi bi-play-fill";
    document.querySelector(".player-copy span").textContent = stage.final ? "Modèle complet · défi final" : `Modèle audio · ${stage.label}`;
    renderHistory();
    renderReference();
  }

  function renderHistory() {
    const completed = stageScores.map((score, index) => ({ score, stage: STAGES[index] })).filter((entry) => entry.score);
    history.hidden = completed.length === 0;
    history.innerHTML = completed.length ? `<p>Progression</p><div>${completed.map((entry) => `<span class="history-score ${entry.stage.final ? "is-final" : ""}"><small>${entry.stage.label}</small><strong>${entry.score.overall}</strong></span>`).join("")}</div>` : "";
  }

  function saveProgress() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ currentStageIndex, stageScores, attemptHistory }));
  }

  function pronunciationTip(word) {
    const lower = word.toLocaleLowerCase("fr-FR").replace(/[.,!?;:]/g, "");
    const special = {
      "inquiète": "Dites in-quiète /ɛ̃kjɛt/ : commencez par une voyelle nasale et ouvrez le son /ɛ/.",
      "journalistes": "Gardez trois syllabes régulières : jour-na-listes, sans prononcer le s final.",
      "c’est": "Dites /sɛ/ en un seul groupe, avec une voyelle ouverte /ɛ/.",
      "vitesse": "Dites vi-tesse avec un son /ɛ/ ouvert dans la seconde syllabe.",
      "laquelle": "Gardez deux groupes nets : la-quelle, avec une finale /kɛl/.",
      "fausse": "Le groupe au se prononce /o/ : dites /fos/.",
      "circule": "Dites cir-cule en deux syllabes et gardez le son français /y/ dans la seconde.",
      "sortie": "Dites sor-tie avec un r français doux et une finale /ti/.",
      "contexte": "Prononcez le groupe /kst/ sans ajouter de voyelle entre les consonnes.",
      "déclenche": "Dites dé-clenche avec le son /ʃ/ dans la dernière syllabe.",
      "confusion": "Gardez trois syllabes et terminez par la voyelle nasale /zjɔ̃/.",
      "vérifier": "Les deux sons accentués se ferment en /e/ : vé-ri-fier.",
      "sources": "Dites /suʁs/ avec le r au fond de la gorge et un s final audible.",
      "preuves": "Arrondissez les lèvres pour /ø/, terminez par /v/ et gardez le s final muet.",
      "comparant": "Gardez les voyelles nasales dans com et dans la finale -rant.",
      "médias": "Dites mé-di-a en trois syllabes, avec un début fermé /e/.",
      "qu’on": "Enchaînez qu’on sans pause : /kɔ̃/ avec une voyelle nasale.",
      "éviter": "Dites é-vi-ter avec un son fermé /e/ au début et à la fin.",
      "rumeur": "Gardez le u français /y/ et arrondissez les lèvres pour la finale /œʁ/."
    };
    if (special[lower]) return special[lower];
    if (/[é]/.test(lower) || /(?:er|ez)$/.test(lower)) return "Le son é se prononce /e/, comme une voyelle fermée et nette.";
    if (/[èêë]/.test(lower) || /(?:ais|ait|aient)$/.test(lower)) return "Le son è se prononce /ɛ/, avec la bouche un peu plus ouverte que pour é.";
    if (/eau|au/.test(lower)) return "Le groupe eau ou au se prononce /o/ : gardez les lèvres arrondies.";
    if (/ou/.test(lower)) return "Le groupe ou se prononce /u/, avec les lèvres bien arrondies.";
    if (/u/.test(lower)) return "Pour le son u /y/, arrondissez les lèvres comme pour ou, mais gardez la langue en position de i.";
    if (/(?:an|en|on|in|ain|ein|un)/.test(lower)) return "Voyelle nasale : laissez passer l’air par le nez sans prononcer séparément le n final.";
    if (/oi/.test(lower)) return "Le groupe oi se prononce /wa/, en une seule émission fluide.";
    if (/gn/.test(lower)) return "Le groupe gn se prononce /ɲ/, comme le ñ espagnol.";
    if (/ch/.test(lower)) return "Le groupe ch se prononce /ʃ/, comme dans chat.";
    if (/r/.test(lower)) return "Le r français se produit doucement au fond de la gorge, sans rouler la langue.";
    if (/(?:ent|s|t|d|x|z)$/.test(lower)) return "Attention à la consonne finale : elle est souvent muette en français.";
    return "Écoutez le mot complet, puis répétez-le lentement en conservant tous ses accents et ses syllabes.";
  }
  function speakWord(word) {
    if (!word || !window.speechSynthesis) return;
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    const voices = speechSynthesis.getVoices();
    const frenchVoice = voices.find((voice) => voice.lang.toLowerCase() === "fr-fr") || voices.find((voice) => voice.lang.toLowerCase().startsWith("fr"));
    utterance.lang = "fr-FR";
    if (frenchVoice) utterance.voice = frenchVoice;
    utterance.rate = 0.72;
    speechSynthesis.speak(utterance);
    wordHelp.hidden = false;
    wordHelp.innerHTML = `<strong><i class="bi bi-volume-up"></i> ${word}</strong><span>${pronunciationTip(word)}</span>`;
  }

  function startLevelMeter(stream) {
    stopLevelMeter();
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 1024;
    audioContext.createMediaStreamSource(stream).connect(analyser);
    const samples = new Uint8Array(analyser.fftSize);
    maxInputLevel = 0;
    const update = () => {
      analyser.getByteTimeDomainData(samples);
      let sum = 0;
      for (const sample of samples) { const value = (sample - 128) / 128; sum += value * value; }
      const rms = Math.sqrt(sum / samples.length);
      maxInputLevel = Math.max(maxInputLevel, rms);
      const percent = Math.min(100, Math.round(rms * 900));
      levelMeterBar.style.width = `${percent}%`;
      levelMeterValue.textContent = percent < 4 ? "Parlez plus fort" : percent < 55 ? "Signal correct" : "Signal fort";
      meterFrame = requestAnimationFrame(update);
    };
    update();
  }

  function stopLevelMeter() {
    if (meterFrame) cancelAnimationFrame(meterFrame);
    meterFrame = null;
    analyser = null;
    if (audioContext) audioContext.close().catch(() => {});
    audioContext = null;
  }

  function align(reference, spoken) {
    const rows = reference.length + 1;
    const cols = spoken.length + 1;
    const dp = Array.from({ length: rows }, () => Array(cols).fill(0));
    for (let i = 0; i < rows; i += 1) dp[i][0] = i;
    for (let j = 0; j < cols; j += 1) dp[0][j] = j;
    for (let i = 1; i < rows; i += 1) {
      for (let j = 1; j < cols; j += 1) {
        dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (reference[i - 1] === spoken[j - 1] ? 0 : 1));
      }
    }
    let i = reference.length;
    let j = spoken.length;
    let matches = 0;
    const states = Array(reference.length).fill("is-missed");
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + (reference[i - 1] === spoken[j - 1] ? 0 : 1)) {
        if (reference[i - 1] === spoken[j - 1]) {
          states[i - 1] = "is-correct";
          matches += 1;
        }
        i -= 1;
        j -= 1;
      } else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
        i -= 1;
      } else {
        j -= 1;
      }
    }
    return { distance: dp[reference.length][spoken.length], matches, states };
  }

  function clamp(value, min = 0, max = 100) {
    return Math.max(min, Math.min(max, Math.round(value)));
  }

  function formatTime(ms) {
    const total = Math.max(0, Math.floor(ms / 1000));
    return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
  }

  function updateTimer() {
    timer.textContent = formatTime(Date.now() - startedAt);
  }

  function setControls(recording, busy = false) {
    micButton.classList.toggle("is-recording", recording);
    micButton.disabled = recording || busy;
    stopButton.disabled = !recording || busy;
    resetButton.disabled = busy;
    resetChallengeButton.disabled = busy;
    microphoneSelect.disabled = recording || busy;
    micButton.querySelector("i").className = recording ? "bi bi-soundwave" : "bi bi-mic-fill";
  }

  function feedbackFor(score, missed, wpm) {
    const focus = missed.slice(0, 5).join(", ");
    if (score >= 88) return "Excellente lecture. La section est très fidèle et votre rythme est naturel.";
    if (score >= 70) return `Bonne lecture. Reprenez surtout ${focus || "les mots signalés"}.${wpm < 90 ? " Essayez de lire un peu plus continûment." : ""}`;
    return `Réécoutez le modèle et reprenez cette section par groupes de mots. Travaillez d’abord : ${focus || "les mots en rouge"}.`;
  }

  function evaluate(transcript, payload = {}) {
    const assessment = window.JaraFrench8PronunciationAssessment;
    if (!assessment) throw new Error("Le module d’évaluation n’est pas disponible. Actualisez la page.");
    const measured = assessment.assess({
      referenceText: currentStage().text,
      transcript,
      words: payload.words,
      audio: payload.audio,
      languageProbability: payload.language_probability,
      recordedDurationMs,
      maxInputLevel
    });
    const { spoken, aligned, wpm, completeness, accuracy, fluency, overall, quality, provisional, uncertain, uncertaintyReasons, uncertaintyMessage } = measured;
    const previousAttempt = attemptHistory[currentStageIndex].at(-1) || null;
    const savedStageScore = stageScores[currentStageIndex] || null;
    const liaison = window.JaraFrench8LiaisonFeedback?.analyze({
      evaluationId: EVALUATION_ID,
      referenceText: currentStage().text,
      transcript
    });
    const attempt = {
      overall,
      accuracy,
      completeness,
      fluency,
      wpm: Math.round(wpm),
      transcript: String(transcript || "").trim(),
      referenceText: currentStage().text,
      stageLabel: currentStage().label,
      final: currentStage().final === true,
      acceptedVariants: aligned.accepted,
      provisional,
      uncertain,
      uncertaintyReasons,
      uncertaintyMessage,
      quality,
      liaison,
      at: new Date().toISOString()
    };
    attemptHistory[currentStageIndex].push(attempt);
    const retainSavedScore = uncertain && savedStageScore && savedStageScore.uncertain !== true && savedStageScore.overall > overall;
    stageScores[currentStageIndex] = retainSavedScore ? savedStageScore : attempt;
    saveProgress();
    renderReference(aligned.states);
    document.getElementById("accuracyScore").textContent = `${accuracy}%`;
    document.getElementById("completenessScore").textContent = `${completeness}%`;
    document.getElementById("fluencyScore").textContent = `${fluency}%`;
    document.getElementById("overallScore").textContent = overall;
    document.getElementById("scoreRing").style.setProperty("--score", overall);
    const displayWords = currentStage().text.split(/\s+/).map(spokenWord).filter(Boolean);
    const missed = displayWords.filter((_, index) => aligned.states[index] === "is-missed");
    attempt.missedWords = missed.slice(0, 20);
    const feedback = document.getElementById("feedback");
    const liaisonMessage = liaison?.message || "";
    if (currentStage().final) {
      const guided = stageScores.slice(0, 4).filter(Boolean);
      const guidedAverage = guided.length ? Math.round(guided.reduce((sum, item) => sum + item.overall, 0) / guided.length) : null;
      feedback.textContent = `${feedbackFor(overall, missed, wpm)}${guidedAverage === null ? "" : ` Moyenne des sections : ${guidedAverage}/100. Défi final : ${overall}/100.`}${liaisonMessage}`;
      nextButton.innerHTML = '<i class="bi bi-arrow-counterclockwise"></i> Recommencer tout l’atelier';
    } else {
      const comparison = previousAttempt ? ` ${overall > previousAttempt.overall ? "Vous avez gagné" : overall < previousAttempt.overall ? "Variation" : "Même résultat"}${overall === previousAttempt.overall ? "" : ` ${Math.abs(overall - previousAttempt.overall)} points`} par rapport à l’essai précédent.` : "";
      feedback.textContent = feedbackFor(overall, missed, wpm) + comparison + liaisonMessage;
      nextButton.innerHTML = currentStageIndex === 3 ? '<i class="bi bi-trophy"></i> Passer au défi final' : '<i class="bi bi-arrow-right"></i> Section suivante';
    }
    if (uncertain) feedback.textContent = `${uncertaintyMessage} ${feedback.textContent}`;
    results.classList.toggle("is-uncertain", uncertain);
    nextButton.hidden = false;
    retryButton.hidden = false;
    renderHistory();
    if (currentStage().final) renderFinalSummary();
    stageProgress.children[currentStageIndex]?.classList.add("is-done");
    results.hidden = false;
    results.scrollIntoView({ behavior: "smooth", block: "nearest" });
    return attempt;
  }

  function renderFinalSummary() {
    const guided = stageScores.slice(0, 4).filter(Boolean);
    if (!guided.length || !stageScores[4]) return;
    const bestIndex = guided.reduce((best, score, index) => score.overall > guided[best].overall ? index : best, 0);
    const needsIndex = guided.reduce((lowest, score, index) => score.overall < guided[lowest].overall ? index : lowest, 0);
    const firstAttempts = attemptHistory.flatMap((attempts) => attempts.slice(0, 1));
    const latestAttempts = stageScores.filter(Boolean);
    const firstAverage = firstAttempts.length ? Math.round(firstAttempts.reduce((sum, item) => sum + item.overall, 0) / firstAttempts.length) : 0;
    const latestAverage = latestAttempts.length ? Math.round(latestAttempts.reduce((sum, item) => sum + item.overall, 0) / latestAttempts.length) : 0;
    finalSummary.hidden = false;
    finalSummary.innerHTML = `<h3><i class="bi bi-trophy"></i> Bilan final</h3><div><p><span>Meilleure section</span><strong>${STAGES[bestIndex].label} · ${guided[bestIndex].overall}/100</strong></p><p><span>À retravailler</span><strong>${STAGES[needsIndex].label} · ${guided[needsIndex].overall}/100</strong></p><p><span>Évolution</span><strong>${firstAverage} → ${latestAverage}</strong></p><p><span>Défi final</span><strong>${stageScores[4].overall}/100</strong></p></div>`;
  }

  async function transcribeAndEvaluate(blob) {
    analyzing = true;
    setControls(false, true);
    recordStatus.textContent = "Analyse locale de cette section…";
    liveTranscript.textContent = "Transcription en cours…";
    try {
      const response = await fetch(API_PATH, { method: "POST", headers: { "Content-Type": blob.type || "audio/webm" }, body: blob });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || `Erreur du serveur (${response.status}).`);
      const transcript = (payload.text || "").trim();
      liveTranscript.textContent = transcript || "Aucun mot n’a été reconnu dans cet essai.";
      const attempt = evaluate(transcript, payload);
      recordStatus.textContent = attempt.uncertain
        ? "Résultat calculé avec réserve. Vous pouvez refaire l’essai ou continuer."
        : `${currentStage().label} évaluée. Consultez votre résultat.`;
    } catch (error) {
      recordStatus.textContent = "L’analyse n’a pas pu être terminée.";
      liveTranscript.textContent = error.message || "Erreur de transcription.";
    } finally {
      analyzing = false;
      setControls(false, false);
    }
  }

  async function refreshMicrophones() {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    try {
      const currentValue = microphoneSelect.value;
      const devices = (await navigator.mediaDevices.enumerateDevices()).filter((device) => device.kind === "audioinput");
      microphoneSelect.innerHTML = '<option value="">Microphone par défaut</option>' + devices.map((device, index) => `<option value="${device.deviceId}">${device.label || `Microphone ${index + 1}`}</option>`).join("");
      if ([...microphoneSelect.options].some((option) => option.value === currentValue)) microphoneSelect.value = currentValue;
    } catch (_error) {
      microphoneSelect.innerHTML = '<option value="">Microphone par défaut</option>';
    }
  }

  async function start() {
    if (analyzing) return;
    resetAttempt(false);
    try {
      if (!window.isSecureContext) {
        const error = new Error("secure_context");
        error.name = "SecurityError";
        throw error;
      }
      if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
        const error = new Error("unsupported");
        error.name = "NotSupportedError";
        throw error;
      }
      if (window.JaraMicPermissions) {
        const canUseMicrophone = await window.JaraMicPermissions.ensureReady({ micButton, stopButton, recordStatus, recordHelp, unsupported, localUrl: LOCAL_URL, language: "fr" });
        if (!canUseMicrophone) return;
        window.JaraMicPermissions.beforeRequest({ recordStatus, recordHelp, language: "fr" });
      } else {
        recordStatus.textContent = "Demande d’autorisation du microphone…";
        recordHelp.textContent = "Acceptez la demande du navigateur pour commencer l’enregistrement.";
      }
      const audioConstraints = window.JaraMicPermissions?.audioConstraints(microphoneSelect.value) || { echoCancellation: { ideal: true }, noiseSuppression: { ideal: true }, autoGainControl: { ideal: true }, channelCount: { ideal: 1 } };
      if (microphoneSelect.value) audioConstraints.deviceId = { exact: microphoneSelect.value };
      mediaStream = await navigator.mediaDevices.getUserMedia({ audio: audioConstraints, video: false });
      startLevelMeter(mediaStream);
      const activeTrack = mediaStream.getAudioTracks()[0];
      recordHelp.textContent = activeTrack?.label ? `Microphone actif : ${activeTrack.label}` : "Microphone actif";
      await refreshMicrophones();
      const activeDeviceId = activeTrack?.getSettings?.().deviceId;
      if (activeDeviceId && [...microphoneSelect.options].some((option) => option.value === activeDeviceId)) microphoneSelect.value = activeDeviceId;
      window.JaraMicPermissions?.markActive({ stream: mediaStream, microphoneSelect, recordHelp, language: "fr" });
      chunks = [];
      discardRecording = false;
      const preferredType = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"].find((type) => MediaRecorder.isTypeSupported(type)) || "";
      mediaRecorder = preferredType ? new MediaRecorder(mediaStream, { mimeType: preferredType }) : new MediaRecorder(mediaStream);
      mediaRecorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
      mediaRecorder.onerror = () => {
        recordStatus.textContent = "Le navigateur n’a pas pu enregistrer le son.";
        stopTracks();
        setControls(false, false);
      };
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: mediaRecorder.mimeType || "audio/webm" });
        stopTracks();
        if (discardRecording || !blob.size) return;
        if (objectUrl) URL.revokeObjectURL(objectUrl);
        objectUrl = URL.createObjectURL(blob);
        studentAudio.src = objectUrl;
        studentAudio.hidden = false;
        await transcribeAndEvaluate(blob);
      };
      startedAt = Date.now();
      timerHandle = setInterval(updateTimer, 250);
      mediaRecorder.start(250);
      setControls(true, false);
      recordStatus.textContent = `Enregistrement · ${currentStage().label}`;
      liveTranscript.textContent = "Lisez uniquement le texte affiché.";
    } catch (error) {
      stopTracks();
      if (window.JaraMicPermissions?.handleError(error, { recordStatus, recordHelp, microphoneSelect, language: "fr" })) {
        setControls(false, false);
        return;
      }
      const messages = {
        NotAllowedError: "L’accès au microphone a été refusé. Autorisez le microphone pour JaraLingua dans les paramètres du navigateur, puis rechargez la page.",
        SecurityError: error?.message === "secure_context" ? "Le microphone exige une connexion HTTPS sécurisée." : "La politique de sécurité du navigateur bloque le microphone sur cette page.",
        NotFoundError: "Aucun microphone n’a été détecté. Vérifiez qu’il est connecté et activé.",
        NotReadableError: "Le microphone est déjà utilisé par une autre application. Fermez-la, puis réessayez.",
        AbortError: "L’activation du microphone a été interrompue. Réessayez.",
        OverconstrainedError: "Le microphone sélectionné n’est plus disponible. Choisissez le microphone par défaut.",
        NotSupportedError: "Ce navigateur ne prend pas en charge l’enregistrement audio. Utilisez une version récente de Chrome, Edge ou Safari."
      };
      recordStatus.textContent = messages[error?.name] || "Impossible d’accéder au microphone. Vérifiez les autorisations et choisissez un autre périphérique.";
      recordHelp.textContent = "Android ou ordinateur : ouvrez les paramètres du site, autorisez le microphone et fermez les applications qui l’utilisent déjà.";
      setControls(false, false);
    }
  }

  function stopTracks() {
    stopLevelMeter();
    mediaStream?.getTracks().forEach((track) => track.stop());
    mediaStream = null;
  }

  function finish() {
    if (!startedAt || mediaRecorder?.state !== "recording") return;
    recordedDurationMs = Date.now() - startedAt;
    startedAt = 0;
    clearInterval(timerHandle);
    timer.textContent = formatTime(recordedDurationMs);
    setControls(false, true);
    recordStatus.textContent = "Préparation de l’analyse…";
    mediaRecorder.stop();
  }

  function resetAttempt(clearAudio = true) {
    if (mediaRecorder?.state === "recording") {
      discardRecording = true;
      mediaRecorder.stop();
    }
    stopTracks();
    clearInterval(timerHandle);
    startedAt = 0;
    recordedDurationMs = 0;
    renderReference();
    liveTranscript.textContent = "Votre transcription apparaîtra ici après l’analyse.";
    recordStatus.textContent = `Prêt · ${currentStage().label}`;
    timer.textContent = "00:00";
    results.hidden = true;
    nextButton.hidden = true;
    retryButton.hidden = true;
    wordHelp.hidden = true;
    finalSummary.hidden = true;
    levelMeterBar.style.width = "0%";
    levelMeterValue.textContent = "En attente";
    setControls(false, false);
    if (clearAudio) {
      studentAudio.hidden = true;
      studentAudio.removeAttribute("src");
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      objectUrl = null;
    }
  }

  function advanceStage() {
    if (currentStage().final) {
      resetAllResults();
      return;
    }
    currentStageIndex += 1;
    saveProgress();
    resetAttempt(true);
    updateStageUI();
    stagePanel.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function resetAllResults() {
    currentStageIndex = 0;
    stageScores.fill(null);
    attemptHistory.forEach((attempts) => attempts.splice(0));
    localStorage.removeItem(STORAGE_KEY);
    resetAttempt(true);
    updateStageUI();
    stagePanel.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function confirmResetAllResults() {
    if (!stageScores.some(Boolean) || window.confirm("Réinitialiser tout le défi depuis la section 1 ? Les résultats locaux de cette activité seront effacés.")) {
      resetAllResults();
    }
  }

  modelButton.addEventListener("click", async () => {
    if (modelAudio.paused) {
      try {
        await modelAudio.play();
        modelButton.querySelector("i").className = "bi bi-pause-fill";
      } catch (_error) {
        modelButton.querySelector("i").className = "bi bi-play-fill";
      }
    } else {
      modelAudio.pause();
      modelButton.querySelector("i").className = "bi bi-play-fill";
    }
  });
  modelAudio.addEventListener("ended", () => { modelButton.querySelector("i").className = "bi bi-play-fill"; });
  micButton.addEventListener("click", start);
  stopButton.addEventListener("click", finish);
  resetButton.addEventListener("click", () => resetAttempt(true));
  resetChallengeButton.addEventListener("click", confirmResetAllResults);
  nextButton.addEventListener("click", advanceStage);
  retryButton.addEventListener("click", () => resetAttempt(true));
  readingText.addEventListener("click", (event) => { const word = event.target.closest(".reading-word")?.dataset.spoken; if (word) speakWord(word); });

  refreshMicrophones();
  navigator.mediaDevices?.addEventListener?.("devicechange", refreshMicrophones);
  updateStageUI();
  resetAttempt(false);
  if (location.protocol === "file:") {
    unsupported.hidden = false;
    micButton.disabled = true;
    recordStatus.textContent = "Le microphone ne fonctionne pas en mode fichier";
    recordHelp.textContent = "Ouvrez cette activité depuis localhost ou depuis le site HTTPS.";
    unsupported.innerHTML = `<strong>Mode local détecté.</strong><br>Les navigateurs bloquent le microphone sur les adresses file://.<br><a href="${LOCAL_URL}"><i class="bi bi-box-arrow-up-right"></i> Ouvrir la version compatible</a>`;
  } else if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
    unsupported.hidden = false;
    micButton.disabled = true;
    recordStatus.textContent = "Enregistrement vocal indisponible";
  }
})();
