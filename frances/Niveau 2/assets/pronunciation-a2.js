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
  const STORAGE_KEY = "jaralingua:french2:pronunciation:routines:v2";
  const LEGACY_STORAGE_KEY = "jaralingua:french2:pronunciation:routines:v1";
  const $ = (id) => document.getElementById(id);
  const els = {
    modelButton: $("modelButton"),
    modelAudio: $("modelAudio"),
    stageCounter: $("stageCounter"),
    stageTitle: $("stageTitle"),
    stageProgress: $("stageProgress"),
    readingText: $("readingText"),
    recordBtn: $("recordBtn"),
    stopBtn: $("stopBtn"),
    retryBtn: $("retryBtn"),
    nextBtn: $("nextBtn"),
    playback: $("recordingPlayback"),
    timer: $("timer"),
    micStatus: $("micStatus"),
    recordHelp: $("recordHelp"),
    permission: $("micPermissionHelp"),
    comparison: $("comparisonNote"),
    scoreRing: $("scoreRing"),
    overall: $("overallScore"),
    accuracy: $("accuracyScore"),
    completeness: $("completenessScore"),
    fluency: $("fluencyScore"),
    feedback: $("feedback"),
    tips: $("tips"),
    microphoneSelect: $("microphoneSelect")
  };

  let state = loadState();
  let stream = null;
  let recorder = null;
  let chunks = [];
  let timer = null;
  let startedAt = 0;
  let recordedDurationMs = 0;
  let objectUrl = null;
  let calibrationReady = false;
  let calibrationBusy = false;
  let calibrationPanel = null;
  let calibrationStatus = null;
  let calibrationButton = null;
  let calibrationPlayback = null;
  let calibrationUrl = null;

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]);
  }

  function clamp(value, min = 0, max = 100) {
    return Math.max(min, Math.min(max, Math.round(Number(value) || 0)));
  }

  function emptyHistory() {
    return Array.from({ length: STAGES.length }, () => []);
  }

  function normalizedState(raw) {
    const next = raw && typeof raw === "object" ? raw : {};
    const scores = Array.isArray(next.scores) ? next.scores.slice(0, STAGES.length) : [];
    const history = Array.isArray(next.history) ? next.history.slice(0, STAGES.length) : emptyHistory();
    while (scores.length < STAGES.length) scores.push(null);
    while (history.length < STAGES.length) history.push([]);
    return {
      stage: Math.max(0, Math.min(STAGES.length - 1, Number(next.stage) || 0)),
      scores,
      history: history.map((items) => Array.isArray(items) ? items.slice(-6) : [])
    };
  }

  function migrateLegacy(raw) {
    if (!raw || typeof raw !== "object") return null;
    const scores = Array.isArray(raw.scores) ? raw.scores.map((item, index) => {
      if (!item || typeof item !== "object") return null;
      const score = Number(item.score ?? item.overall);
      if (!Number.isFinite(score)) return null;
      return Object.assign({}, item, {
        score: clamp(score),
        overall: clamp(score),
        stageLabel: STAGES[index]?.title || "",
        referenceText: STAGES[index]?.text || "",
        final: index === STAGES.length - 1,
        provisional: true
      });
    }) : [];
    return normalizedState({ stage: raw.stage, scores, history: emptyHistory() });
  }

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (saved) return normalizedState(saved);
    } catch (_error) {}
    try {
      const legacy = JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY) || "null");
      if (legacy) return migrateLegacy(legacy);
    } catch (_error) {}
    return normalizedState({});
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (_error) {
      const lean = normalizedState(state);
      lean.scores = lean.scores.map((score) => score ? Object.assign({}, score, { audioDataUrl: undefined }) : score);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(lean));
      } catch (_ignore) {}
    }
  }

  function selectedStage() {
    return STAGES[state.stage];
  }

  function scoreValue(result) {
    return clamp(result?.overall ?? result?.score);
  }

  function cleanDisplayWord(value) {
    return String(value || "").replace(/[.,!?;:()[\]{}«»"]/g, "").trim();
  }

  function normalize(text) {
    return String(text || "")
      .toLocaleLowerCase("fr-FR")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[’']/g, " ")
      .replace(/[^a-z0-9\s-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function renderWords(states = [], missed = [], correct = []) {
    let wordIndex = 0;
    const missedSet = new Set(missed.map(normalize));
    const correctSet = new Set(correct.map(normalize));
    els.readingText.innerHTML = selectedStage().text.split(/(\s+)/).map((part) => {
      if (/^\s+$/.test(part)) return part;
      const index = wordIndex;
      wordIndex += 1;
      const key = normalize(part);
      const stateClass = states[index] || (missedSet.has(key) ? "is-missed" : correctSet.has(key) ? "is-correct" : "");
      return `<span class="reading-word ${escapeHtml(stateClass)}">${escapeHtml(part)}</span>`;
    }).join("");
  }

  function render() {
    const stage = selectedStage();
    els.modelAudio.src = stage.audio;
    els.stageCounter.textContent = `Pratique guidée · ${state.stage + 1} sur ${STAGES.length}`;
    els.stageTitle.textContent = stage.title;
    els.stageProgress.innerHTML = STAGES.map((_, index) => {
      const done = state.scores[index];
      const score = done ? scoreValue(done) : index + 1;
      return `<span class="stage-dot ${index === state.stage ? "is-active" : ""} ${done ? "is-done" : ""}">${score}</span>`;
    }).join("");
    els.tips.innerHTML = stage.tips.map((tip) => `<div class="tip"><i class="bi bi-soundwave"></i><p>${escapeHtml(tip)}</p></div>`).join("");
    const done = state.scores[state.stage];
    if (done) applyScore(done, false);
    else resetScore();
    els.nextBtn.disabled = !done || state.stage >= STAGES.length - 1;
    save();
  }

  function resetScore() {
    els.scoreRing.style.setProperty("--score", "0");
    els.overall.textContent = "0";
    els.accuracy.textContent = "0%";
    els.completeness.textContent = "0%";
    els.fluency.textContent = "0%";
    els.feedback.classList.remove("is-uncertain");
    els.feedback.textContent = "Aucun progrès enregistré pour ce mini-défi. Le bilan commence seulement après une lecture terminée.";
    els.comparison.textContent = "Après l’enregistrement, la transcription apparaît ici. Le bilan reste une estimation automatique provisoire.";
    renderWords();
  }

  function feedbackFor(result) {
    const score = scoreValue(result);
    const missed = Array.isArray(result.missedWords) ? result.missedWords.slice(0, 5).join(", ") : "";
    const base = score >= 88
      ? "Très bien. Votre lecture est claire et le rythme reste naturel."
      : score >= 70
        ? `Bonne lecture. Reprenez surtout ${missed || "les mots signalés"} puis écoutez encore le modèle.`
        : `Réécoutez le modèle et reprenez la phrase par petits groupes. Travaillez d’abord ${missed || "les mots en rouge"}.`;
    if (!result.uncertain) return base;
    return `Résultat calculé avec réserve. Vous pouvez refaire l'essai ou continuer. ${result.uncertaintyMessage || ""} ${base}`.trim();
  }

  function applyScore(result, paint = true) {
    const score = scoreValue(result);
    els.scoreRing.style.setProperty("--score", String(score));
    els.overall.textContent = String(score);
    els.accuracy.textContent = `${clamp(result.accuracy ?? score)}%`;
    els.completeness.textContent = `${clamp(result.completeness ?? score)}%`;
    els.fluency.textContent = `${clamp(result.fluency ?? score)}%`;
    els.feedback.classList.toggle("is-uncertain", result.uncertain === true);
    els.feedback.textContent = result.feedback || feedbackFor(result);
    els.comparison.innerHTML = `<strong>Transcription :</strong> ${escapeHtml(result.transcript || "Aucun mot reconnu.")}`;
    if (paint) renderWords(result.states || [], result.missedWords || [], result.correctWords || []);
  }

  function recordingEvidence(payload) {
    const transcript = String(payload?.text || payload?.transcript || "").trim();
    const validate = window.JaraFrench8PronunciationAssessment?.validateRecordingEvidence;
    if (validate) return validate({ transcript, audio: payload?.audio, recordedDurationMs });
    return transcript
      ? { ok: true, reason: "", message: "" }
      : { ok: false, reason: "no_speech", message: "Aucune parole exploitable n'a \u00e9t\u00e9 reconnue. R\u00e9essayez l'enregistrement." };
  }

  function showRecordingIssue(issue) {
    const saved = state.scores[state.stage];
    if (saved) applyScore(saved, false);
    else resetScore();
    renderWords();
    els.feedback.classList.add("is-uncertain");
    els.feedback.textContent = `${issue.message} Aucun mot n'est marqu\u00e9 comme incorrect et aucune note n'est cr\u00e9\u00e9e pour cet essai.${saved ? " Votre meilleur essai pr\u00e9c\u00e9dent reste enregistr\u00e9." : ""}`;
    els.comparison.textContent = "Aucune transcription exploitable. \u00c9coutez votre enregistrement, v\u00e9rifiez le microphone, puis recommencez.";
    els.micStatus.textContent = "Essai non not\u00e9 : la voix n'a pas \u00e9t\u00e9 capt\u00e9e correctement.";
  }

  function preferredMimeType() {
    if (!window.MediaRecorder) return "";
    return ["audio/webm;codecs=opus", "audio/webm", "audio/mp4;codecs=mp4a.40.2", "audio/mp4"]
      .find((type) => MediaRecorder.isTypeSupported(type)) || "";
  }

  function audioConstraints() {
    const requested = window.JaraMicPermissions?.audioConstraints(els.microphoneSelect.value) || {
      echoCancellation: { ideal: true },
      noiseSuppression: { ideal: true },
      autoGainControl: { ideal: true },
      channelCount: { ideal: 1 }
    };
    if (els.microphoneSelect.value) requested.deviceId = { exact: els.microphoneSelect.value };
    return requested;
  }

  function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(reader.error || new Error("Audio illisible."));
      reader.readAsDataURL(blob);
    });
  }

  function transcribeBlob(blob) {
    return fetch(API_PATH, {
      method: "POST",
      headers: { "Content-Type": blob.type || "audio/webm" },
      body: blob
    }).then(async (response) => {
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || `Analyse indisponible (${response.status}).`);
      return payload;
    });
  }

  function attemptFromPayload(payload, audioDataUrl) {
    const assessment = window.JaraFrench8PronunciationAssessment;
    if (!assessment?.assess) {
      throw new Error("Le module d’évaluation tolérante n’est pas disponible. Actualisez la page.");
    }
    const transcript = String(payload.text || payload.transcript || "").trim();
    const measured = assessment.assess({
      referenceText: selectedStage().text,
      transcript,
      words: payload.words,
      audio: payload.audio,
      languageProbability: payload.language_probability,
      recordedDurationMs
    });
    const displayWords = selectedStage().text.split(/\s+/).map(cleanDisplayWord).filter(Boolean);
    const missedWords = displayWords.filter((_, index) => measured.aligned.states[index] === "is-missed");
    const correctWords = displayWords.filter((_, index) => measured.aligned.states[index] === "is-correct");
    const attempt = {
      score: measured.overall,
      overall: measured.overall,
      accuracy: measured.accuracy,
      completeness: measured.completeness,
      fluency: measured.fluency,
      wpm: Math.round(measured.wpm || 0),
      transcript,
      referenceText: selectedStage().text,
      stageLabel: selectedStage().title,
      final: state.stage === STAGES.length - 1,
      missedWords: missedWords.slice(0, 20),
      correctWords,
      acceptedVariants: measured.aligned.accepted,
      states: measured.aligned.states,
      provisional: true,
      uncertain: measured.uncertain,
      uncertaintyReasons: measured.uncertaintyReasons,
      uncertaintyMessage: measured.uncertaintyMessage,
      quality: measured.quality,
      at: new Date().toISOString()
    };
    if (attempt.final && audioDataUrl) attempt.audioDataUrl = audioDataUrl;
    attempt.feedback = feedbackFor(attempt);
    return attempt;
  }

  function storeAttempt(attempt) {
    const previous = state.scores[state.stage];
    const previousReliable = previous && previous.uncertain !== true;
    const retainPrevious = attempt.uncertain && previousReliable && scoreValue(previous) > scoreValue(attempt);
    state.history[state.stage].push(attempt);
    state.history[state.stage] = state.history[state.stage].slice(-6);
    if (!retainPrevious) {
      state.scores[state.stage] = attempt;
    }
    save();
    return retainPrevious;
  }

  function setRecording(active, busy = false) {
    els.recordBtn.disabled = active || busy;
    els.stopBtn.disabled = !active || busy;
    els.retryBtn.disabled = busy;
    els.nextBtn.disabled = busy || !state.scores[state.stage] || state.stage >= STAGES.length - 1;
    els.microphoneSelect.disabled = active || busy;
    els.recordBtn.classList.toggle("is-recording", active);
  }

  function startTimer() {
    startedAt = Date.now();
    recordedDurationMs = 0;
    clearInterval(timer);
    timer = setInterval(() => {
      const sec = Math.floor((Date.now() - startedAt) / 1000);
      els.timer.textContent = `00:${String(sec).padStart(2, "0")}`;
    }, 250);
  }

  function stopTracks() {
    stream?.getTracks().forEach((track) => track.stop());
    stream = null;
  }

  function resetCurrentAttempt() {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = null;
    els.playback.hidden = true;
    els.playback.removeAttribute("src");
    els.timer.textContent = "00:00";
    els.comparison.textContent = "Nouvel essai prêt. Votre meilleur résultat déjà enregistré reste conservé.";
    els.micStatus.textContent = calibrationReady ? "Prêt pour un nouvel essai." : "Testez le microphone avant de recommencer.";
    renderWords();
    const saved = state.scores[state.stage];
    if (saved) applyScore(saved, false);
    setRecording(false, false);
  }

  function installCalibrationPanel() {
    if (calibrationPanel) return;
    calibrationPanel = document.createElement("section");
    calibrationPanel.className = "mic-calibration";
    calibrationPanel.innerHTML = `
      <div class="mic-calibration-copy">
        <i class="bi bi-phone-vibrate" aria-hidden="true"></i>
        <div><strong>Vérification du microphone</strong><span>Test court de trois secondes avant la première lecture.</span></div>
      </div>
      <button type="button" class="action-button mic-calibration-button"><i class="bi bi-soundwave"></i> Tester pendant 3 s</button>
      <p class="mic-calibration-status" aria-live="polite">Test requis avant de lire.</p>
      <audio class="mic-calibration-playback" controls hidden></audio>
      <small>L’échantillon sert uniquement à vérifier le signal; il n’est pas enregistré dans le carnet.</small>
    `;
    els.microphoneSelect.closest(".microphone-picker")?.insertAdjacentElement("afterend", calibrationPanel);
    calibrationStatus = calibrationPanel.querySelector(".mic-calibration-status");
    calibrationButton = calibrationPanel.querySelector(".mic-calibration-button");
    calibrationPlayback = calibrationPanel.querySelector(".mic-calibration-playback");
    calibrationButton.addEventListener("click", runCalibration);
  }

  function recordCalibrationSample(activeStream) {
    return new Promise((resolve, reject) => {
      const mimeType = preferredMimeType();
      let sampleRecorder;
      try {
        sampleRecorder = mimeType ? new MediaRecorder(activeStream, { mimeType }) : new MediaRecorder(activeStream);
      } catch (error) {
        reject(error);
        return;
      }
      const sampleChunks = [];
      let timeout = null;
      sampleRecorder.ondataavailable = (event) => { if (event.data?.size) sampleChunks.push(event.data); };
      sampleRecorder.onerror = (event) => reject(event.error || new Error("Enregistrement impossible."));
      sampleRecorder.onstop = () => {
        if (timeout) clearTimeout(timeout);
        const blob = new Blob(sampleChunks, { type: sampleRecorder.mimeType || mimeType || "audio/webm" });
        if (!blob.size) reject(new Error("Aucun son n’a été enregistré."));
        else resolve(blob);
      };
      sampleRecorder.start(200);
      timeout = setTimeout(() => {
        if (sampleRecorder.state === "recording") sampleRecorder.stop();
      }, 3200);
    });
  }

  function calibrationResult(payload) {
    const transcript = String(payload.text || payload.transcript || "").trim();
    const audio = payload.audio || {};
    const rms = Number(audio.rms);
    const peak = Number(audio.peak);
    if (!transcript) return { ok: false, message: "Le micro capte peut-être du son, mais aucun mot français clair n’a été reconnu." };
    if (Number.isFinite(rms) && rms < 0.0025) return { ok: false, message: "Signal trop faible. Rapprochez le microphone et recommencez." };
    if (Number.isFinite(peak) && peak < 0.012) return { ok: false, message: "Signal trop faible. Vérifiez le microphone sélectionné." };
    if (Number.isFinite(peak) && peak >= 0.995) return { ok: true, warning: true, message: "Microphone prêt, mais le signal est très fort. Éloignez légèrement l’appareil." };
    return { ok: true, message: "Microphone prêt. Le signal est suffisant pour commencer." };
  }

  async function runCalibration() {
    if (calibrationBusy) return;
    let sampleStream = null;
    calibrationBusy = true;
    calibrationReady = false;
    calibrationButton.disabled = true;
    calibrationPanel.classList.remove("is-ready", "is-error");
    calibrationStatus.textContent = "Préparation du microphone…";
    try {
      if (window.JaraMicPermissions) {
        const ok = await window.JaraMicPermissions.ensureReady({
          micButton: els.recordBtn,
          stopButton: els.stopBtn,
          recordStatus: els.micStatus,
          recordHelp: els.recordHelp,
          unsupported: els.permission,
          language: "fr"
        });
        if (!ok) throw new Error("Autorisez le microphone, puis relancez le test.");
        window.JaraMicPermissions.beforeRequest({ recordStatus: els.micStatus, recordHelp: els.recordHelp, language: "fr" });
      }
      sampleStream = await navigator.mediaDevices.getUserMedia({ audio: audioConstraints(), video: false });
      window.JaraMicPermissions?.markActive({ stream: sampleStream, microphoneSelect: els.microphoneSelect, recordHelp: els.recordHelp, language: "fr" });
      calibrationStatus.textContent = "Dites : « Bonjour, je teste mon microphone. »";
      const blob = await recordCalibrationSample(sampleStream);
      if (calibrationUrl) URL.revokeObjectURL(calibrationUrl);
      calibrationUrl = URL.createObjectURL(blob);
      calibrationPlayback.src = calibrationUrl;
      calibrationPlayback.hidden = false;
      calibrationStatus.textContent = "Vérification du signal…";
      const payload = await transcribeBlob(blob);
      const result = calibrationResult(payload);
      calibrationReady = result.ok;
      calibrationPanel.classList.toggle("is-ready", result.ok && !result.warning);
      calibrationPanel.classList.toggle("is-error", !result.ok || result.warning);
      calibrationStatus.textContent = result.message;
      calibrationButton.innerHTML = result.ok
        ? '<i class="bi bi-arrow-repeat"></i> Tester à nouveau'
        : '<i class="bi bi-arrow-repeat"></i> Refaire le test';
      els.micStatus.textContent = result.ok ? "Microphone vérifié. Vous pouvez commencer la lecture." : "Microphone à régler avant la lecture.";
    } catch (error) {
      calibrationPanel.classList.add("is-error");
      calibrationStatus.textContent = error.message || "Le test du microphone n’a pas pu être terminé.";
      calibrationButton.innerHTML = '<i class="bi bi-arrow-repeat"></i> Refaire le test';
      if (!window.JaraMicPermissions?.handleError?.(error, {
        recordStatus: els.micStatus,
        recordHelp: els.recordHelp,
        microphoneSelect: els.microphoneSelect,
        language: "fr"
      })) {
        els.micStatus.textContent = "Le test du microphone n’a pas pu être terminé.";
      }
    } finally {
      sampleStream?.getTracks().forEach((track) => track.stop());
      calibrationBusy = false;
      calibrationButton.disabled = false;
    }
  }

  async function startRecording() {
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      els.micStatus.textContent = "Ce navigateur ne permet pas l’enregistrement audio.";
      return;
    }
    installCalibrationPanel();
    if (!calibrationReady) {
      calibrationStatus.textContent = "Effectuez d’abord le test de trois secondes.";
      calibrationPanel.scrollIntoView({ behavior: "smooth", block: "center" });
      calibrationButton.focus();
      return;
    }
    try {
      if (window.JaraMicPermissions) {
        const ok = await window.JaraMicPermissions.ensureReady({
          micButton: els.recordBtn,
          stopButton: els.stopBtn,
          recordStatus: els.micStatus,
          recordHelp: els.recordHelp,
          unsupported: els.permission,
          language: "fr"
        });
        if (!ok) return;
        window.JaraMicPermissions.beforeRequest({ recordStatus: els.micStatus, recordHelp: els.recordHelp, language: "fr" });
      }
      stream = await navigator.mediaDevices.getUserMedia({ audio: audioConstraints(), video: false });
      window.JaraMicPermissions?.markActive({ stream, microphoneSelect: els.microphoneSelect, recordHelp: els.recordHelp, language: "fr" });
      chunks = [];
      const mimeType = preferredMimeType();
      recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      recorder.ondataavailable = (event) => { if (event.data?.size) chunks.push(event.data); };
      recorder.onstop = finishRecording;
      recorder.start(250);
      els.micStatus.textContent = "Enregistrement en cours…";
      els.comparison.textContent = "Lisez uniquement le texte affiché.";
      setRecording(true);
      startTimer();
    } catch (error) {
      stopTracks();
      if (!window.JaraMicPermissions?.handleError(error, {
        recordStatus: els.micStatus,
        recordHelp: els.recordHelp,
        microphoneSelect: els.microphoneSelect,
        language: "fr"
      })) {
        els.micStatus.textContent = "Microphone indisponible. Vérifiez les autorisations du navigateur.";
      }
      setRecording(false, false);
    }
  }

  async function finishRecording() {
    clearInterval(timer);
    recordedDurationMs = startedAt ? Date.now() - startedAt : recordedDurationMs;
    startedAt = 0;
    setRecording(false, true);
    stopTracks();
    const blob = new Blob(chunks, { type: recorder?.mimeType || "audio/webm" });
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = URL.createObjectURL(blob);
    els.playback.src = objectUrl;
    els.playback.hidden = false;
    if (!blob.size) {
      els.micStatus.textContent = "Aucun audio n’a été enregistré. Réessayez.";
      setRecording(false, false);
      return;
    }
    els.micStatus.textContent = "Analyse de votre lecture…";
    els.comparison.textContent = "Transcription en cours…";
    try {
      const payload = await transcribeBlob(blob);
      const evidence = recordingEvidence(payload);
      if (!evidence.ok) {
        showRecordingIssue(evidence);
        return;
      }
      const audioDataUrl = state.stage === STAGES.length - 1 ? await blobToDataUrl(blob) : "";
      const attempt = attemptFromPayload(payload, audioDataUrl);
      const retained = storeAttempt(attempt);
      applyScore(attempt);
      els.nextBtn.disabled = state.stage >= STAGES.length - 1 ? true : false;
      els.micStatus.textContent = attempt.uncertain
        ? "Résultat calculé avec réserve. Vous pouvez refaire l'essai ou continuer."
        : "Bilan terminé.";
      render();
      applyScore(attempt);
      if (retained) {
        els.feedback.textContent += " Votre meilleur essai fiable reste conservé pour le progrès.";
      }
    } catch (error) {
      els.micStatus.textContent = "L’analyse n’a pas pu être terminée.";
      els.feedback.textContent = "Erreur de connexion ou de transcription. Réessayez l’enregistrement; aucune note automatique n’a été créée pour cet essai.";
      els.comparison.textContent = error.message || "Analyse indisponible.";
    } finally {
      setRecording(false, false);
    }
  }

  els.modelButton.addEventListener("click", () => {
    els.modelAudio.currentTime = 0;
    els.modelAudio.play().catch(() => {
      els.micStatus.textContent = "Le modèle audio n’est pas encore disponible.";
    });
  });
  els.recordBtn.addEventListener("click", startRecording);
  els.stopBtn.addEventListener("click", () => {
    if (recorder?.state === "recording") recorder.stop();
  });
  els.retryBtn.addEventListener("click", resetCurrentAttempt);
  els.nextBtn.addEventListener("click", () => {
    if (!state.scores[state.stage] || state.stage >= STAGES.length - 1) return;
    state.stage += 1;
    resetCurrentAttempt();
    render();
  });
  els.microphoneSelect.addEventListener("change", () => {
    calibrationReady = false;
    if (calibrationStatus) calibrationStatus.textContent = "Microphone modifié : refaites le test avant de lire.";
    if (calibrationPanel) calibrationPanel.classList.remove("is-ready");
  });

  if (navigator.mediaDevices?.enumerateDevices) {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const mics = devices.filter((device) => device.kind === "audioinput");
      els.microphoneSelect.innerHTML = '<option value="">Microphone par défaut</option>' + mics.map((device, i) => `<option value="${escapeHtml(device.deviceId)}">${escapeHtml(device.label || `Microphone ${i + 1}`)}</option>`).join("");
    }).catch(() => {});
  }

  installCalibrationPanel();
  render();
})();
