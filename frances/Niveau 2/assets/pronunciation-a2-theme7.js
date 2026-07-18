(() => {
  "use strict";

  const STAGES = [
    {
      title: "Mini-d\u00e9fi 1 \u00b7 Direction",
      audio: "../audio/prononciation/theme-7/stage-1.mp3?v=20260630-n2-pron-pro",
      text: "Allez tout droit, puis tournez \u00e0 gauche.",
      tips: [
        "Faites une pause apr\u00e8s tout droit.",
        "Ne dites pas \u00e0 la gauche : dites \u00e0 gauche."
      ]
    },
    {
      title: "Mini-d\u00e9fi 2 \u00b7 Lieu",
      audio: "../audio/prononciation/theme-7/stage-2.mp3?v=20260630-n2-pron-pro",
      text: "La gare est \u00e0 deux pas, en face de la pharmacie.",
      tips: [
        "\u00c0 deux pas est une expression idiomatique : dites-la comme un seul groupe.",
        "En face de indique une position."
      ]
    },
    {
      title: "Mini-d\u00e9fi 3 \u00b7 Technologie",
      audio: "../audio/prononciation/theme-7/stage-3.mp3?v=20260630-n2-pron-pro",
      text: "Moi, je n'ai plus de batterie et mon GPS ne fonctionne pas.",
      tips: [
        "Moi renforce la personne qui parle.",
        "Gardez le rythme : je n'ai plus de batterie / et mon GPS ne fonctionne pas."
      ]
    },
    {
      title: "D\u00e9fi final \u00b7 Aide en ville",
      audio: "../audio/prononciation/theme-7/defi-final.mp3?v=20260630-n2-pron-pro",
      text: "Pas de souci, je vais vous donner un coup de main.",
      tips: [
        "Pas de souci est une r\u00e9ponse rassurante.",
        "Donner un coup de main signifie aider quelqu'un."
      ]
    }
  ];

  const API_PATH = "/api/french8/pronunciation-assessment";
  const STORAGE_KEY = "jaralingua:french2:pronunciation:theme7:v2";
  const LEGACY_STORAGE_KEY = "jaralingua:french2:pronunciation:theme7:v1";
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
    return String(value || "").replace(/[.,!?;:()[\]{}\u00ab\u00bb"]/g, "").trim();
  }

  function normalize(text) {
    return String(text || "")
      .toLocaleLowerCase("fr-FR")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[\u2018\u2019']/g, " ")
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
    els.stageCounter.textContent = `Pratique guid\u00e9e \u00b7 ${state.stage + 1} sur ${STAGES.length}`;
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
    els.feedback.textContent = "Aucun progr\u00e8s enregistr\u00e9 pour ce mini-d\u00e9fi. Le bilan commence seulement apr\u00e8s une lecture termin\u00e9e.";
    els.comparison.textContent = "Apr\u00e8s l'enregistrement, la transcription appara\u00eet ici. Le bilan reste une estimation automatique provisoire.";
    renderWords();
  }

  function feedbackFor(result) {
    const score = scoreValue(result);
    const missed = Array.isArray(result.missedWords) ? result.missedWords.slice(0, 5).join(", ") : "";
    const base = score >= 88
      ? "Tr\u00e8s bien. Votre lecture est claire et le rythme reste naturel."
      : score >= 70
        ? `Bonne lecture. Reprenez surtout ${missed || "les mots signal\u00e9s"} puis \u00e9coutez encore le mod\u00e8le.`
        : `R\u00e9\u00e9coutez le mod\u00e8le et reprenez la phrase par petits groupes. Travaillez d'abord ${missed || "les mots en rouge"}.`;
    if (!result.uncertain) return base;
    return `R\u00e9sultat calcul\u00e9 avec r\u00e9serve. Vous pouvez refaire l'essai ou continuer. ${result.uncertaintyMessage || ""} ${base}`.trim();
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
      throw new Error("Le module d'\u00e9valuation tol\u00e9rante n'est pas disponible. Actualisez la page.");
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
    els.comparison.textContent = "Nouvel essai pr\u00eat. Votre meilleur r\u00e9sultat d\u00e9j\u00e0 enregistr\u00e9 reste conserv\u00e9.";
    els.micStatus.textContent = calibrationReady ? "Pr\u00eat pour un nouvel essai." : "Testez le microphone avant de recommencer.";
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
        <div><strong>V\u00e9rification du microphone</strong><span>Test court de trois secondes avant la premi\u00e8re lecture.</span></div>
      </div>
      <button type="button" class="action-button mic-calibration-button"><i class="bi bi-soundwave"></i> Tester pendant 3 s</button>
      <p class="mic-calibration-status" aria-live="polite">Test requis avant de lire.</p>
      <audio class="mic-calibration-playback" controls hidden></audio>
      <small>L'\u00e9chantillon sert uniquement \u00e0 v\u00e9rifier le signal; il n'est pas enregistr\u00e9 dans le carnet.</small>
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
        if (!blob.size) reject(new Error("Aucun son n'a \u00e9t\u00e9 enregistr\u00e9."));
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
    if (!transcript) return { ok: false, message: "Le micro capte peut-\u00eatre du son, mais aucun mot fran\u00e7ais clair n'a \u00e9t\u00e9 reconnu." };
    if (Number.isFinite(rms) && rms < 0.0025) return { ok: false, message: "Signal trop faible. Rapprochez le microphone et recommencez." };
    if (Number.isFinite(peak) && peak < 0.012) return { ok: false, message: "Signal trop faible. V\u00e9rifiez le microphone s\u00e9lectionn\u00e9." };
    if (Number.isFinite(peak) && peak >= 0.995) return { ok: true, warning: true, message: "Microphone pr\u00eat, mais le signal est tr\u00e8s fort. \u00c9loignez l\u00e9g\u00e8rement l'appareil." };
    return { ok: true, message: "Microphone pr\u00eat. Le signal est suffisant pour commencer." };
  }

  async function runCalibration() {
    if (calibrationBusy) return;
    let sampleStream = null;
    calibrationBusy = true;
    calibrationReady = false;
    calibrationButton.disabled = true;
    calibrationPanel.classList.remove("is-ready", "is-error");
    calibrationStatus.textContent = "Pr\u00e9paration du microphone\u2026";
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
      calibrationStatus.textContent = "Dites : \u00ab Bonjour, je teste mon microphone. \u00bb";
      const blob = await recordCalibrationSample(sampleStream);
      if (calibrationUrl) URL.revokeObjectURL(calibrationUrl);
      calibrationUrl = URL.createObjectURL(blob);
      calibrationPlayback.src = calibrationUrl;
      calibrationPlayback.hidden = false;
      calibrationStatus.textContent = "V\u00e9rification du signal\u2026";
      const payload = await transcribeBlob(blob);
      const result = calibrationResult(payload);
      calibrationReady = result.ok;
      calibrationPanel.classList.toggle("is-ready", result.ok && !result.warning);
      calibrationPanel.classList.toggle("is-error", !result.ok || result.warning);
      calibrationStatus.textContent = result.message;
      calibrationButton.innerHTML = result.ok
        ? '<i class="bi bi-arrow-repeat"></i> Tester \u00e0 nouveau'
        : '<i class="bi bi-arrow-repeat"></i> Refaire le test';
      els.micStatus.textContent = result.ok ? "Microphone v\u00e9rifi\u00e9. Vous pouvez commencer la lecture." : "Microphone \u00e0 r\u00e9gler avant la lecture.";
    } catch (error) {
      calibrationPanel.classList.add("is-error");
      calibrationStatus.textContent = error.message || "Le test du microphone n'a pas pu \u00eatre termin\u00e9.";
      calibrationButton.innerHTML = '<i class="bi bi-arrow-repeat"></i> Refaire le test';
      if (!window.JaraMicPermissions?.handleError?.(error, {
        recordStatus: els.micStatus,
        recordHelp: els.recordHelp,
        microphoneSelect: els.microphoneSelect,
        language: "fr"
      })) {
        els.micStatus.textContent = "Le test du microphone n'a pas pu \u00eatre termin\u00e9.";
      }
    } finally {
      sampleStream?.getTracks().forEach((track) => track.stop());
      calibrationBusy = false;
      calibrationButton.disabled = false;
    }
  }

  async function startRecording() {
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      els.micStatus.textContent = "Ce navigateur ne permet pas l'enregistrement audio.";
      return;
    }
    installCalibrationPanel();
    if (!calibrationReady) {
      calibrationStatus.textContent = "Effectuez d'abord le test de trois secondes.";
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
      els.micStatus.textContent = "Enregistrement en cours\u2026";
      els.comparison.textContent = "Lisez uniquement le texte affich\u00e9.";
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
        els.micStatus.textContent = "Microphone indisponible. V\u00e9rifiez les autorisations du navigateur.";
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
      els.micStatus.textContent = "Aucun audio n'a \u00e9t\u00e9 enregistr\u00e9. R\u00e9essayez.";
      setRecording(false, false);
      return;
    }
    els.micStatus.textContent = "Analyse de votre lecture\u2026";
    els.comparison.textContent = "Transcription en cours\u2026";
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
        ? "R\u00e9sultat calcul\u00e9 avec r\u00e9serve. Vous pouvez refaire l'essai ou continuer."
        : "Bilan termin\u00e9.";
      render();
      applyScore(attempt);
      if (retained) {
        els.feedback.textContent += " Votre meilleur essai fiable reste conserv\u00e9 pour le progr\u00e8s.";
      }
    } catch (error) {
      els.micStatus.textContent = "L'analyse n'a pas pu \u00eatre termin\u00e9e.";
      els.feedback.textContent = "Erreur de connexion ou de transcription. R\u00e9essayez l'enregistrement; aucune note automatique n'a \u00e9t\u00e9 cr\u00e9\u00e9e pour cet essai.";
      els.comparison.textContent = error.message || "Analyse indisponible.";
    } finally {
      setRecording(false, false);
    }
  }

  els.modelButton.addEventListener("click", () => {
    els.modelAudio.currentTime = 0;
    els.modelAudio.play().catch(() => {
      els.micStatus.textContent = "Le mod\u00e8le audio n'est pas encore disponible.";
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
    if (calibrationStatus) calibrationStatus.textContent = "Microphone modifi\u00e9 : refaites le test avant de lire.";
    if (calibrationPanel) calibrationPanel.classList.remove("is-ready");
  });

  if (navigator.mediaDevices?.enumerateDevices) {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const mics = devices.filter((device) => device.kind === "audioinput");
      els.microphoneSelect.innerHTML = '<option value="">Microphone par d\u00e9faut</option>' + mics.map((device, i) => `<option value="${escapeHtml(device.deviceId)}">${escapeHtml(device.label || `Microphone ${i + 1}`)}</option>`).join("");
    }).catch(() => {});
  }

  installCalibrationPanel();
  render();
})();
