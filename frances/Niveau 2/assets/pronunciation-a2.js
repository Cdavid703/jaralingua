(() => {
  "use strict";

  const STAGES = [
    {
      title: "Mini-défi 1 · Le matin",
      text: "Je me réveille à six heures trente.",
      audio: "../audio/prononciation/theme-1/stage-1.mp3?v=20260624-n2-t1",
      tips: ["Gardez le groupe « je me » très léger.", "Dans « réveille », ouvrez le son è et ne précipitez pas la fin."]
    },
    {
      title: "Mini-défi 2 · La préparation",
      text: "Ensuite, je me douche et je m’habille.",
      audio: "../audio/prononciation/theme-1/stage-2.mp3?v=20260624-n2-t1",
      tips: ["Faites une pause courte après « Ensuite ».", "Devant voyelle, « me » devient « m’ » : je m’habille."]
    },
    {
      title: "Mini-défi 3 · Le soir",
      text: "Le soir, je ne me couche jamais très tard.",
      audio: "../audio/prononciation/theme-1/stage-3.mp3?v=20260624-n2-t1",
      tips: ["La négation se lit comme un seul bloc : ne me couche jamais.", "Le s final de « jamais » ne se prononce pas."]
    },
    {
      title: "Défi final · Ma routine",
      text: "Je me réveille à six heures trente. Ensuite, je me douche et je m’habille. Le soir, je ne me couche jamais très tard.",
      audio: "../audio/prononciation/theme-1/defi-final.mp3?v=20260624-n2-t1",
      tips: ["Respectez les pauses entre les phrases.", "Gardez un rythme régulier : sujet, pronom, verbe, complément."]
    }
  ];

  const API_PATH = "/api/french8/pronunciation-assessment";
  const STORAGE_KEY = "jaralingua:french2:pronunciation:routines:v1";
  const $ = (id) => document.getElementById(id);
  const els = {
    modelButton: $("modelButton"), modelAudio: $("modelAudio"), stageCounter: $("stageCounter"), stageTitle: $("stageTitle"),
    stageProgress: $("stageProgress"), readingText: $("readingText"), recordBtn: $("recordBtn"), stopBtn: $("stopBtn"),
    retryBtn: $("retryBtn"), nextBtn: $("nextBtn"), playback: $("recordingPlayback"), timer: $("timer"),
    micStatus: $("micStatus"), recordHelp: $("recordHelp"), permission: $("micPermissionHelp"), comparison: $("comparisonNote"),
    scoreRing: $("scoreRing"), overall: $("overallScore"), accuracy: $("accuracyScore"), completeness: $("completenessScore"),
    fluency: $("fluencyScore"), feedback: $("feedback"), tips: $("tips"), microphoneSelect: $("microphoneSelect")
  };

  let state = { stage: 0, scores: [null, null, null, null] };
  try { state = Object.assign(state, JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}")); } catch (_error) {}
  state.stage = Math.max(0, Math.min(STAGES.length - 1, Number(state.stage) || 0));
  let stream = null, recorder = null, chunks = [], timer = null, started = 0, objectUrl = null;

  function normalize(text) {
    return String(text || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[’']/g, " ").replace(/[^a-zà-ÿœæ0-9\s-]/gi, " ").replace(/\s+/g, " ").trim();
  }

  function words(text) {
    return normalize(text).split(/\s+/).filter(Boolean);
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function renderWords(missed = [], correct = []) {
    const missedSet = new Set(missed.map(normalize));
    const correctSet = new Set(correct.map(normalize));
    els.readingText.innerHTML = STAGES[state.stage].text.split(/(\s+)/).map((part) => {
      if (/^\s+$/.test(part)) return part;
      const key = normalize(part);
      const cls = missedSet.has(key) ? " is-missed" : correctSet.has(key) ? " is-correct" : "";
      return `<span class="reading-word${cls}">${part}</span>`;
    }).join("");
  }

  function render() {
    const stage = STAGES[state.stage];
    els.modelAudio.src = stage.audio;
    els.stageCounter.textContent = `Pratique guidée · ${state.stage + 1} sur ${STAGES.length}`;
    els.stageTitle.textContent = stage.title;
    els.stageProgress.innerHTML = STAGES.map((_, index) => `<span class="stage-dot ${index === state.stage ? "is-active" : ""} ${state.scores[index] ? "is-done" : ""}">${index + 1}</span>`).join("");
    renderWords();
    els.tips.innerHTML = stage.tips.map((tip) => `<div class="tip"><i class="bi bi-soundwave"></i><p>${tip}</p></div>`).join("");
    const done = state.scores[state.stage];
    if (done) applyScore(done, false); else resetScore();
    els.nextBtn.disabled = !done || state.stage >= STAGES.length - 1;
    save();
  }

  function resetScore() {
    els.scoreRing.style.setProperty("--score", "0");
    els.overall.textContent = "0";
    els.accuracy.textContent = "0%";
    els.completeness.textContent = "0%";
    els.fluency.textContent = "0%";
    els.feedback.textContent = "Aucun progrès enregistré pour ce mini-défi. Le bilan commence seulement après une lecture terminée.";
    els.comparison.textContent = "Après l’enregistrement, la transcription apparaît ici et le bilan corrige la phrase mot par mot.";
  }

  function applyScore(result, paint = true) {
    const score = Math.max(0, Math.min(100, Math.round(result.score || 0)));
    els.scoreRing.style.setProperty("--score", String(score));
    els.overall.textContent = String(score);
    els.accuracy.textContent = `${Math.round(result.accuracy || score)}%`;
    els.completeness.textContent = `${Math.round(result.completeness || score)}%`;
    els.fluency.textContent = `${Math.round(result.fluency || score)}%`;
    els.feedback.textContent = result.feedback || (score >= 85 ? "Très bien. Votre lecture est claire." : "Reprenez les mots soulignés et écoutez le modèle encore une fois.");
    els.comparison.innerHTML = `<strong>Transcription :</strong> ${result.transcript || "Non disponible"}`;
    if (paint) renderWords(result.missed || [], result.correct || []);
  }

  function localCompare(transcript) {
    const expected = words(STAGES[state.stage].text);
    const heard = new Set(words(transcript));
    const correct = expected.filter((word) => heard.has(word));
    const missed = expected.filter((word) => !heard.has(word));
    const completeness = expected.length ? Math.round((correct.length / expected.length) * 100) : 0;
    return { score: completeness, accuracy: completeness, completeness, fluency: completeness, correct, missed, transcript, feedback: completeness >= 85 ? "Bonne lecture. Les mots principaux sont reconnus." : "Travaillez les mots soulignés puis recommencez le mini-défi." };
  }

  async function analyze(blob) {
    const form = new FormData();
    form.append("audio", blob, "lecture.webm");
    form.append("language", "fr");
    form.append("referenceText", STAGES[state.stage].text);
    const response = await fetch(API_PATH, { method: "POST", body: form });
    if (!response.ok) throw new Error(`Analyse indisponible (${response.status})`);
    const data = await response.json();
    const transcript = data.transcript || data.text || "";
    if (Array.isArray(data.words)) return Object.assign(localCompare(transcript), data);
    return localCompare(transcript);
  }

  function allowGuidedProgressAfterAnalysisError(error) {
    const isFinalStage = state.stage >= STAGES.length - 1;
    const message = error?.message || "Analyse indisponible.";
    if (isFinalStage) {
      els.micStatus.textContent = message;
      els.feedback.textContent = "Votre audio est bien enregistré dans le lecteur, mais le défi final doit être analysé correctement avant d’être envoyé au professeur. Réessayez l’enregistrement final.";
      els.comparison.textContent = "Transcription non disponible : l’analyse automatique n’a pas répondu.";
      els.nextBtn.disabled = true;
      return;
    }

    const fallback = {
      score: 0,
      accuracy: 0,
      completeness: 0,
      fluency: 0,
      correct: [],
      missed: words(STAGES[state.stage].text),
      transcript: "Analyse automatique indisponible",
      feedback: "Votre enregistrement est terminé. L’analyse automatique n’a pas répondu, donc le score reste à 0, mais vous pouvez passer au mini-défi suivant et recommencer plus tard pour obtenir une correction précise.",
      analysisUnavailable: true,
      errorMessage: message
    };
    state.scores[state.stage] = fallback;
    applyScore(fallback);
    els.nextBtn.disabled = false;
    els.micStatus.textContent = "Enregistrement terminé. Analyse indisponible; vous pouvez continuer.";
    save();
  }

  function setRecording(active) {
    els.recordBtn.disabled = active;
    els.stopBtn.disabled = !active;
    els.recordBtn.classList.toggle("is-recording", active);
  }

  function startTimer() {
    started = Date.now();
    clearInterval(timer);
    timer = setInterval(() => {
      const sec = Math.floor((Date.now() - started) / 1000);
      els.timer.textContent = `00:${String(sec).padStart(2, "0")}`;
    }, 250);
  }

  async function startRecording() {
    if (!navigator.mediaDevices?.getUserMedia) {
      els.micStatus.textContent = "Ce navigateur ne permet pas l’enregistrement audio.";
      return;
    }
    try {
      if (window.JaraMicPermissions) {
        const ok = await window.JaraMicPermissions.ensureReady({ micButton: els.recordBtn, stopButton: els.stopBtn, recordStatus: els.micStatus, recordHelp: els.recordHelp, unsupported: els.permission, language: "fr" });
        if (!ok) return;
        window.JaraMicPermissions.beforeRequest({ recordStatus: els.micStatus, recordHelp: els.recordHelp, language: "fr" });
      }
      const constraints = window.JaraMicPermissions?.audioConstraints(els.microphoneSelect.value) || { echoCancellation: { ideal: true }, noiseSuppression: { ideal: true }, autoGainControl: { ideal: true }, channelCount: { ideal: 1 } };
      if (els.microphoneSelect.value) constraints.deviceId = { exact: els.microphoneSelect.value };
      stream = await navigator.mediaDevices.getUserMedia({ audio: constraints });
      window.JaraMicPermissions?.markActive({ stream, microphoneSelect: els.microphoneSelect, recordHelp: els.recordHelp, language: "fr" });
      chunks = [];
      recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
      recorder.onstop = finishRecording;
      recorder.start();
      els.micStatus.textContent = "Enregistrement en cours…";
      setRecording(true);
      startTimer();
    } catch (error) {
      if (!window.JaraMicPermissions?.handleError(error, { recordStatus: els.micStatus, recordHelp: els.recordHelp, microphoneSelect: els.microphoneSelect, language: "fr" })) {
        els.micStatus.textContent = "Microphone indisponible. Vérifiez les autorisations du navigateur.";
      }
    }
  }

  async function finishRecording() {
    clearInterval(timer);
    setRecording(false);
    stream?.getTracks().forEach((track) => track.stop());
    const blob = new Blob(chunks, { type: recorder?.mimeType || "audio/webm" });
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = URL.createObjectURL(blob);
    els.playback.src = objectUrl;
    els.playback.hidden = false;
    els.micStatus.textContent = "Analyse de votre lecture…";
    try {
      const result = await analyze(blob);
      state.scores[state.stage] = result;
      applyScore(result);
      els.nextBtn.disabled = state.stage >= STAGES.length - 1;
      els.micStatus.textContent = "Bilan terminé.";
      save();
    } catch (error) {
      allowGuidedProgressAfterAnalysisError(error);
    }
  }

  els.modelButton.addEventListener("click", () => { els.modelAudio.currentTime = 0; els.modelAudio.play().catch(() => { els.micStatus.textContent = "Le modèle audio n’est pas encore disponible."; }); });
  els.recordBtn.addEventListener("click", startRecording);
  els.stopBtn.addEventListener("click", () => recorder?.state === "recording" && recorder.stop());
  els.retryBtn.addEventListener("click", () => { state.scores[state.stage] = null; render(); });
  els.nextBtn.addEventListener("click", () => { if (state.stage < STAGES.length - 1) { state.stage += 1; render(); } });

  if (navigator.mediaDevices?.enumerateDevices) {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const mics = devices.filter((device) => device.kind === "audioinput");
      els.microphoneSelect.innerHTML = '<option value="">Microphone par défaut</option>' + mics.map((device, i) => `<option value="${device.deviceId}">${device.label || `Microphone ${i + 1}`}</option>`).join("");
    }).catch(() => {});
  }

  render();
})();
