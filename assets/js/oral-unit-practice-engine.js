(() => {
  "use strict";

  const config = window.JaraLinguaOralUnitConfig || {};
  const QUESTIONS = Array.isArray(config.questions) ? config.questions : [];
  const QUESTION_BY_ID = new Map(QUESTIONS.map((question) => [question.id, question]));
  const QUESTION_COUNT = Number(config.attemptQuestionCount) || 4;
  const MAX_RECORDING_SECONDS = Number(config.maxRecordingSeconds) || 24;
  const STORAGE_KEY = config.storageKey || "jaralingua:oral-unit-practice";
  const API_PATH = config.apiPath || "/api/french8/pronunciation-assessment";
  const ui = config.ui || {};

  const $ = (id) => document.getElementById(id);
  const elements = {
    onboarding: $("onboardingPanel"),
    interview: $("interviewPanel"),
    summary: $("summaryPanel"),
    start: $("startInterviewButton"),
    preflight: $("preflightButton"),
    preflightStatus: $("preflightStatus"),
    reviewPrevious: $("reviewPreviousButton"),
    resumeNote: $("resumeNote"),
    counter: $("questionCounter"),
    topic: $("questionTopic"),
    progress: $("interviewProgressBar"),
    questionText: $("questionText"),
    interviewerStatus: $("interviewerStatus"),
    interviewerName: $("interviewerName"),
    interviewerRole: $("interviewerRole"),
    questionPlay: $("questionPlayButton"),
    interviewerAudio: $("interviewerAudio"),
    visualPanel: $("questionVisualPanel"),
    visualImage: $("questionVisualImage"),
    visualCaption: $("questionVisualCaption"),
    support: $("answerSupport"),
    frames: $("answerFrameGrid"),
    vocabulary: $("vocabularyBank"),
    grammar: $("grammarClue"),
    toggleHelp: $("toggleHelpButton"),
    showHelp: $("showHelpButton"),
    micSelect: $("microphoneSelect"),
    levelBar: $("levelMeterBar"),
    levelValue: $("levelMeterValue"),
    mic: $("micButton"),
    stop: $("stopButton"),
    retry: $("retryButton"),
    status: $("recordStatus"),
    help: $("recordHelp"),
    timer: $("timer"),
    transcript: $("liveTranscript"),
    studentAudio: $("studentAudio"),
    feedback: $("answerFeedback"),
    unsupported: $("unsupported"),
    next: $("nextQuestionButton"),
    summaryTitle: $("summaryTitle"),
    summaryLead: $("summaryLead"),
    summaryScoreRing: $("summaryScoreRing"),
    summaryScore: $("summaryScore"),
    summaryReadiness: $("summaryReadiness"),
    summaryComparison: $("summaryComparison"),
    summaryMetrics: $("summaryMetrics"),
    summaryStrengths: $("summaryStrengths"),
    summaryPriorities: $("summaryPriorities"),
    summaryWordPractice: $("summaryWordPractice"),
    attemptHistory: $("attemptHistory"),
    summaryAnswers: $("summaryAnswers"),
    restart: $("restartInterviewButton"),
    weakPractice: $("weakPracticeButton")
  };

  let state = loadState();
  let mediaStream = null;
  let mediaRecorder = null;
  let recordedChunks = [];
  let startedAt = 0;
  let timerId = null;
  let levelContext = null;
  let levelAnalyser = null;
  let levelAnimation = null;
  let selectedSpeed = 1;

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]);
  }

  function normalize(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[’']/g, "'")
      .replace(/[^a-z0-9'\s-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function randomIndex(length) {
    if (length <= 1) return 0;
    if (window.crypto?.getRandomValues) {
      const value = new Uint32Array(1);
      window.crypto.getRandomValues(value);
      return value[0] % length;
    }
    return Math.floor(Math.random() * length);
  }

  function shuffled(values) {
    const copy = [...values];
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const next = randomIndex(index + 1);
      [copy[index], copy[next]] = [copy[next], copy[index]];
    }
    return copy;
  }

  function validQuestionIds(ids) {
    return Array.isArray(ids) ? ids.filter((id, index) => QUESTION_BY_ID.has(id) && ids.indexOf(id) === index) : [];
  }

  function chooseQuestionIds(mode = "full") {
    if (mode === "weak" && state.lastReport?.answers?.length) {
      const weakIds = state.lastReport.answers
        .slice()
        .sort((a, b) => a.score - b.score)
        .slice(0, 2)
        .map((answer) => answer.id);
      const validWeakIds = validQuestionIds(weakIds);
      if (validWeakIds.length) return validWeakIds;
    }
    return shuffled(QUESTIONS.map((question) => question.id)).slice(0, Math.min(QUESTION_COUNT, QUESTIONS.length));
  }

  function freshState(previous = {}) {
    return {
      hasCompleted: Boolean(previous.hasCompleted),
      currentIndex: 0,
      questionIds: [],
      answers: [],
      lastReport: previous.lastReport && typeof previous.lastReport === "object" ? previous.lastReport : null,
      attemptHistory: Array.isArray(previous.attemptHistory) ? previous.attemptHistory.slice(-8) : [],
      mode: "full"
    };
  }

  function loadState() {
    try {
      return freshState(JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"));
    } catch {
      return freshState();
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Persistencia local opcional.
    }
  }

  function currentQuestion() {
    return QUESTION_BY_ID.get(state.questionIds[state.currentIndex]);
  }

  function answerForCurrent() {
    const question = currentQuestion();
    return question ? state.answers.find((answer) => answer.id === question.id) : null;
  }

  function cleanWhisperWords(words) {
    if (!Array.isArray(words)) return [];
    return words
      .map((item) => ({
        word: String(item.word || item.text || "").trim(),
        probability: Number(item.probability ?? item.confidence ?? 1)
      }))
      .filter((item) => item.word && Number.isFinite(item.probability));
  }

  function countWords(text) {
    return normalize(text).split(/\s+/).filter(Boolean).length;
  }

  function checkTerms(transcript, check) {
    const normalized = normalize(transcript);
    const terms = Array.isArray(check.terms) ? check.terms : [];
    const matches = terms.filter((term) => normalized.includes(normalize(term)));
    const needed = Number(check.minMatches) || 1;
    return { label: check.label || "élément attendu", met: matches.length >= needed, matches: matches.length };
  }

  function analyzeAnswer(transcript, durationMs, whisperWords = [], question = currentQuestion()) {
    const wordCount = countWords(transcript);
    const checks = (question?.checks || []).map((check) => checkTerms(transcript, check));
    const metChecks = checks.filter((check) => check.met).length;
    const taskScore = checks.length ? Math.round((metChecks / checks.length) * 100) : 70;
    const minWords = Number(question?.minWords) || 4;
    const developmentScore = Math.max(20, Math.min(100, Math.round((wordCount / Math.max(minWords, 1)) * 82)));
    const seconds = Math.max(1, Math.round((Number(durationMs) || 1000) / 1000));
    const expectedSeconds = Math.max(6, Math.min(Number(question?.maxSeconds) || MAX_RECORDING_SECONDS, MAX_RECORDING_SECONDS));
    const fluencyScore = Math.max(30, Math.min(100, Math.round((Math.min(seconds, expectedSeconds) / expectedSeconds) * 100)));
    const clearWords = cleanWhisperWords(whisperWords);
    const averageConfidence = clearWords.length ? clearWords.reduce((sum, item) => sum + item.probability, 0) / clearWords.length : 0.72;
    const clarityScore = Math.max(35, Math.min(100, Math.round(averageConfidence * 100)));
    const score = Math.round(taskScore * .3 + developmentScore * .25 + clarityScore * .3 + fluencyScore * .15);
    const lowConfidence = clearWords.filter((item) => item.probability < .68 && item.word.length > 2).slice(0, 8);
    const message = score >= 84
      ? "Très bien : la réponse couvre la tâche et reste claire."
      : score >= 68
        ? "Bon travail : répète la réponse en ajoutant une information ou une formule plus précise."
        : "Continue : utilise une structure proposée et réponds avec une phrase complète.";
    return { score, wordCount, durationSeconds: seconds, checks, metrics: { task: taskScore, development: developmentScore, clarity: clarityScore, fluency: fluencyScore }, lowConfidence, message };
  }

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
    const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  }

  function setStatus(text) {
    if (elements.status) elements.status.textContent = text;
  }

  function showUnsupported(title, detail) {
    if (!elements.unsupported) return;
    elements.unsupported.hidden = false;
    elements.unsupported.innerHTML = `<strong>${escapeHtml(title)}</strong><br>${escapeHtml(detail)}`;
  }

  function feedbackHtml(analysis, question) {
    const checks = analysis.checks.map((check) => `<span class="feedback-check ${check.met ? "is-met" : ""}"><i class="bi ${check.met ? "bi-check-circle-fill" : "bi-circle"}"></i>${escapeHtml(check.label)}</span>`).join("");
    const wordReview = analysis.lowConfidence?.length
      ? `<p class="feedback-note"><strong>Mots à prononcer plus clairement :</strong> ${analysis.lowConfidence.map((item) => escapeHtml(item.word)).join(", ")}</p>`
      : "";
    return `<div class="feedback-checks"><span class="feedback-check is-met"><i class="bi bi-clipboard-data"></i>Score : ${analysis.score}/100</span>${checks}</div><p class="feedback-message">${escapeHtml(analysis.message)}</p>${wordReview}<p class="feedback-note">${escapeHtml(ui.formativeNotice || "Résultat formatif, pas une note officielle.")}</p><p class="answer-model"><strong>Modèle amélioré</strong>${escapeHtml(question.improved || "")}</p>`;
  }

  function renderQuestion() {
    const question = currentQuestion();
    if (!question) return;
    const total = state.questionIds.length;
    const answer = answerForCurrent();
    elements.counter.textContent = `Question ${state.currentIndex + 1} sur ${total}`;
    elements.topic.textContent = question.topic || config.unitLabel || "";
    elements.progress.style.width = `${Math.round(((state.currentIndex + 1) / total) * 100)}%`;
    elements.questionText.textContent = question.text;
    elements.interviewerName.textContent = config.interviewer?.name || "Camille";
    elements.interviewerRole.textContent = config.interviewer?.role || "Coach de conversation";
    elements.interviewerAudio.src = question.audio;
    elements.interviewerAudio.playbackRate = selectedSpeed;
    elements.interviewerStatus.textContent = "Écoutez la question, puis répondez avec vos informations.";
    if (question.visual?.src) {
      elements.visualPanel.hidden = false;
      elements.visualImage.src = question.visual.src;
      elements.visualImage.alt = question.visual.alt || "Support visuel";
      elements.visualCaption.textContent = question.visual.caption || "";
    } else {
      elements.visualPanel.hidden = true;
    }
    elements.frames.innerHTML = (question.frames || []).map((frame, index) => `<button class="answer-frame" type="button"><span>${index + 1}</span><strong>Structure ${index + 1}</strong><small>${escapeHtml(frame)}</small></button>`).join("");
    elements.vocabulary.innerHTML = (question.vocabulary || []).map((word) => `<span>${escapeHtml(word)}</span>`).join("");
    elements.grammar.innerHTML = escapeHtml(question.grammar || "");
    elements.support.hidden = state.currentIndex > 0;
    elements.showHelp.hidden = !elements.support.hidden;
    elements.transcript.textContent = answer?.transcript || (ui.transcriptPlaceholder || "Votre transcription apparaîtra ici.");
    elements.transcript.classList.toggle("has-text", Boolean(answer?.transcript));
    elements.feedback.hidden = !answer?.analysis;
    elements.feedback.innerHTML = answer?.analysis ? feedbackHtml(answer.analysis, question) : "";
    elements.next.disabled = !answer?.analysis;
    elements.retry.disabled = !answer;
    elements.studentAudio.hidden = !answer?.audioUrl;
    if (answer?.audioUrl) elements.studentAudio.src = answer.audioUrl;
    elements.timer.textContent = `00:00 / ${formatTime(Number(question.maxSeconds) || MAX_RECORDING_SECONDS)}`;
    setStatus(ui.readyStatus || "Prêt pour votre réponse");
    if (elements.help) elements.help.textContent = ui.recordHelp || "Répondez avec le microphone.";
  }

  function showPanel(panel) {
    elements.onboarding.hidden = panel !== "onboarding";
    elements.interview.hidden = panel !== "interview";
    elements.summary.hidden = panel !== "summary";
  }

  function startPractice(mode = "full") {
    state = freshState(state);
    state.mode = mode;
    state.questionIds = chooseQuestionIds(mode);
    if (!state.questionIds.length) return;
    state.currentIndex = 0;
    state.answers = [];
    saveState();
    showPanel("interview");
    renderQuestion();
  }

  function reviewPrevious() {
    if (!state.lastReport) return;
    renderSummary(state.lastReport, false);
    showPanel("summary");
  }

  function updateOnboarding() {
    if (state.lastReport) {
      elements.reviewPrevious.hidden = false;
      elements.resumeNote.hidden = false;
      elements.resumeNote.textContent = `Dernier score : ${state.lastReport.score}/100. Tu peux refaire la pratique ou revoir le rapport.`;
    }
  }

  async function refreshMicrophones() {
    if (!navigator.mediaDevices?.enumerateDevices || !elements.micSelect) return;
    try {
      const devices = (await navigator.mediaDevices.enumerateDevices()).filter((device) => device.kind === "audioinput");
      const current = elements.micSelect.value;
      elements.micSelect.innerHTML = `<option value="">Microphone par défaut</option>${devices.map((device, index) => `<option value="${escapeHtml(device.deviceId)}">${escapeHtml(device.label || `Microphone ${index + 1}`)}</option>`).join("")}`;
      if ([...elements.micSelect.options].some((option) => option.value === current)) elements.micSelect.value = current;
    } catch {
      // Device labels are optional.
    }
  }

  function audioConstraints() {
    const deviceId = elements.micSelect?.value;
    return { echoCancellation: { ideal: true }, noiseSuppression: { ideal: true }, autoGainControl: { ideal: true }, channelCount: { ideal: 1 }, ...(deviceId ? { deviceId: { exact: deviceId } } : {}) };
  }

  async function requestStream() {
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) throw new Error(ui.unsupportedDetail || "Microphone non compatible.");
    return navigator.mediaDevices.getUserMedia({ audio: audioConstraints(), video: false });
  }

  function stopLevelMeter() {
    if (levelAnimation) cancelAnimationFrame(levelAnimation);
    levelAnimation = null;
    if (levelContext) levelContext.close().catch(() => {});
    levelContext = null;
    levelAnalyser = null;
    if (elements.levelBar) elements.levelBar.style.width = "0";
    if (elements.levelValue) elements.levelValue.textContent = "En attente";
  }

  function startLevelMeter(stream) {
    stopLevelMeter();
    try {
      levelContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = levelContext.createMediaStreamSource(stream);
      levelAnalyser = levelContext.createAnalyser();
      levelAnalyser.fftSize = 256;
      source.connect(levelAnalyser);
      const data = new Uint8Array(levelAnalyser.frequencyBinCount);
      const tick = () => {
        if (!levelAnalyser) return;
        levelAnalyser.getByteFrequencyData(data);
        const value = data.reduce((sum, item) => sum + item, 0) / data.length;
        const percent = Math.min(100, Math.round(value * 1.45));
        elements.levelBar.style.width = `${percent}%`;
        elements.levelValue.textContent = percent > 12 ? "Signal actif" : "Très bas";
        levelAnimation = requestAnimationFrame(tick);
      };
      tick();
    } catch {
      if (elements.levelValue) elements.levelValue.textContent = "Actif";
    }
  }

  async function testMicrophone() {
    try {
      const stream = await requestStream();
      elements.preflightStatus.textContent = "Microphone autorisé. Tu peux commencer.";
      stream.getTracks().forEach((track) => track.stop());
      await refreshMicrophones();
    } catch (error) {
      elements.preflightStatus.textContent = error.message || "Microphone indisponible. Vérifiez l’autorisation du navigateur.";
    }
  }

  async function startRecording() {
    try {
      const question = currentQuestion();
      if (!question || mediaRecorder?.state === "recording") return;
      mediaStream = await requestStream();
      await refreshMicrophones();
      startLevelMeter(mediaStream);
      recordedChunks = [];
      const preferredType = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4;codecs=mp4a.40.2", "audio/mp4"].find((type) => MediaRecorder.isTypeSupported(type)) || "";
      mediaRecorder = preferredType ? new MediaRecorder(mediaStream, { mimeType: preferredType }) : new MediaRecorder(mediaStream);
      mediaRecorder.ondataavailable = (event) => { if (event.data?.size) recordedChunks.push(event.data); };
      mediaRecorder.onstop = () => finalizeRecording(preferredType || mediaRecorder.mimeType || "audio/webm");
      startedAt = Date.now();
      mediaRecorder.start();
      elements.mic.classList.add("is-recording");
      elements.mic.disabled = true;
      elements.stop.disabled = false;
      elements.retry.disabled = true;
      elements.next.disabled = true;
      setStatus(ui.recording || "Enregistrement en cours…");
      timerId = window.setInterval(() => updateTimer(question), 250);
      updateTimer(question);
    } catch (error) {
      showUnsupported("Microphone indisponible", error.message || "Vérifiez l’autorisation du navigateur.");
      setStatus("Microphone indisponible.");
    }
  }

  function updateTimer(question) {
    const elapsed = Math.floor((Date.now() - startedAt) / 1000);
    const limit = Number(question?.maxSeconds) || MAX_RECORDING_SECONDS;
    elements.timer.textContent = `${formatTime(elapsed)} / ${formatTime(limit)}`;
    if (elapsed >= limit && mediaRecorder?.state === "recording") stopRecording();
  }

  function stopRecording() {
    if (mediaRecorder?.state === "recording") mediaRecorder.stop();
  }

  async function finalizeRecording(mimeType) {
    clearInterval(timerId);
    timerId = null;
    elements.mic.classList.remove("is-recording");
    elements.mic.disabled = false;
    elements.stop.disabled = true;
    const durationMs = Math.max(1000, Date.now() - startedAt);
    const blob = new Blob(recordedChunks, { type: mimeType || "audio/webm" });
    if (mediaStream) mediaStream.getTracks().forEach((track) => track.stop());
    mediaStream = null;
    stopLevelMeter();
    const audioUrl = URL.createObjectURL(blob);
    elements.studentAudio.src = audioUrl;
    elements.studentAudio.hidden = false;
    await transcribeAnswer(blob, durationMs, audioUrl);
  }

  async function transcribeAnswer(blob, durationMs, audioUrl) {
    const question = currentQuestion();
    if (!question) return;
    setStatus(ui.transcribing || "Analyse Whisper…");
    elements.transcript.textContent = ui.transcribing || "Analyse Whisper…";
    elements.transcript.classList.remove("has-text");
    try {
      const response = await fetch(API_PATH, { method: "POST", headers: { "Content-Type": blob.type || "audio/webm" }, body: blob });
      if (!response.ok) throw new Error(`Erreur serveur ${response.status}`);
      const payload = await response.json();
      const transcript = String(payload.text || payload.transcript || "").trim();
      if (!transcript) throw new Error(ui.noSpeech || "Aucun mot clair détecté.");
      const whisperWords = cleanWhisperWords(payload.words);
      const analysis = analyzeAnswer(transcript, durationMs, whisperWords, question);
      const nextAnswer = { id: question.id, transcript, durationMs, whisperWords, analysis, audioUrl };
      const index = state.answers.findIndex((answer) => answer.id === question.id);
      if (index >= 0) state.answers[index] = nextAnswer;
      else state.answers.push(nextAnswer);
      saveState();
      elements.transcript.textContent = transcript;
      elements.transcript.classList.add("has-text");
      elements.feedback.hidden = false;
      elements.feedback.innerHTML = feedbackHtml(analysis, question);
      elements.next.disabled = false;
      elements.retry.disabled = false;
      setStatus(ui.transcribed || "Réponse transcrite.");
    } catch (error) {
      elements.transcript.textContent = error.message || "Impossible de transcrire la réponse.";
      elements.feedback.hidden = true;
      elements.retry.disabled = false;
      setStatus("Analyse indisponible. Réessayez.");
    }
  }

  function nextQuestion() {
    if (state.currentIndex < state.questionIds.length - 1) {
      state.currentIndex += 1;
      saveState();
      renderQuestion();
      return;
    }
    completePractice();
  }

  function completePractice() {
    const report = buildReport();
    state.hasCompleted = true;
    state.lastReport = report;
    state.attemptHistory = [...(state.attemptHistory || []), { score: report.score, date: report.completedAt, mode: state.mode }].slice(-8);
    saveState();
    renderSummary(report, true);
    showPanel("summary");
  }

  function buildReport() {
    const answers = state.questionIds.map((id) => {
      const question = QUESTION_BY_ID.get(id);
      const answer = state.answers.find((item) => item.id === id);
      const analysis = answer?.analysis || analyzeAnswer("", 1000, [], question);
      return { id, topic: question?.topic || "", question: question?.text || "", transcript: answer?.transcript || "", improved: question?.improved || "", score: analysis.score, metrics: analysis.metrics, checks: analysis.checks, lowConfidence: analysis.lowConfidence || [], message: analysis.message };
    });
    const score = Math.round(answers.reduce((sum, answer) => sum + answer.score, 0) / Math.max(answers.length, 1));
    const averageMetric = (key) => Math.round(answers.reduce((sum, answer) => sum + (answer.metrics?.[key] || 0), 0) / Math.max(answers.length, 1));
    return { score, completedAt: new Date().toISOString(), mode: state.mode, metrics: { task: averageMetric("task"), development: averageMetric("development"), clarity: averageMetric("clarity"), fluency: averageMetric("fluency") }, answers };
  }

  function renderSummary(report, includeCurrentHistory) {
    elements.summaryTitle.textContent = config.title || "Rapport de conversation";
    elements.summaryLead.textContent = report.score >= 84 ? "Très bonne préparation pour une première conversation." : report.score >= 68 ? "Bonne base. Répète les questions faibles pour gagner en précision." : "Tu as commencé : reprends les structures et réponds avec des phrases complètes.";
    elements.summaryScore.textContent = String(report.score);
    elements.summaryScoreRing.style.setProperty("--score", report.score);
    elements.summaryReadiness.textContent = report.score >= 84 ? "Prêt pour interagir" : report.score >= 68 ? "En bonne progression" : "À consolider";
    const previous = (state.attemptHistory || []).slice(-2, -1)[0];
    elements.summaryComparison.textContent = previous && includeCurrentHistory ? `Essai précédent : ${previous.score}/100.` : "Refais la pratique plusieurs fois : les questions changent et l’aide peut être masquée.";
    const metricLabels = [["task", "Tâche", "Réponse à la question"], ["development", "Développement", "Longueur et précision"], ["clarity", "Clarté", "Indice approximatif Whisper"], ["fluency", "Fluidité", "Durée et continuité"]];
    elements.summaryMetrics.innerHTML = metricLabels.map(([key, label, description]) => {
      const value = report.metrics?.[key] || 0;
      return `<article class="summary-metric"><header><strong>${value}</strong><span>/100</span></header><p>${escapeHtml(label)} · ${escapeHtml(description)}</p><div class="summary-metric-bar"><i style="width:${value}%"></i></div></article>`;
    }).join("");
    const strengths = [];
    const priorities = [];
    if ((report.metrics?.task || 0) >= 75) strengths.push("Tu réponds globalement aux questions posées."); else priorities.push("Réponds exactement à la question avant d’ajouter des détails.");
    if ((report.metrics?.development || 0) >= 75) strengths.push("Tes réponses ont assez de mots pour être comprises."); else priorities.push("Ajoute une information personnelle : ville, pays, âge ou prénom.");
    if ((report.metrics?.clarity || 0) >= 75) strengths.push("La transcription reconnaît une bonne partie de tes mots."); else priorities.push("Parle plus près du micro et ralentis légèrement.");
    if ((report.metrics?.fluency || 0) >= 75) strengths.push("Tu maintiens une réponse assez continue."); else priorities.push("Prépare une phrase courte avant d’enregistrer.");
    elements.summaryStrengths.innerHTML = (strengths.length ? strengths : ["Tu as terminé une pratique orale complète."]).map((item) => `<li>${escapeHtml(item)}</li>`).join("");
    elements.summaryPriorities.innerHTML = (priorities.length ? priorities : ["Essaie sans afficher l’aide dès la première question."]).map((item) => `<li>${escapeHtml(item)}</li>`).join("");
    const lowWords = report.answers.flatMap((answer) => answer.lowConfidence || []).slice(0, 10);
    elements.summaryWordPractice.innerHTML = lowWords.length ? `<div class="word-practice-list">${lowWords.map((item) => `<span class="word-practice-chip">${escapeHtml(item.word)} <small>${Math.round(item.probability * 100)}%</small></span>`).join("")}</div>` : `<p class="word-practice-clear"><i class="bi bi-check-circle-fill"></i> Aucun mot prioritaire détecté dans cet essai.</p>`;
    elements.attemptHistory.innerHTML = (state.attemptHistory || []).slice().reverse().map((item, index) => `<article class="attempt-card ${index === 0 && includeCurrentHistory ? "is-current" : ""}"><small>${new Date(item.date).toLocaleDateString("fr-FR")}</small><strong>${item.score}</strong><span>${item.mode === "weak" ? "questions faibles" : "essai complet"}</span></article>`).join("") || "<p>Aucun essai précédent.</p>";
    elements.summaryAnswers.innerHTML = report.answers.map((answer, index) => {
      const checks = answer.checks.map((check) => `<span class="feedback-check ${check.met ? "is-met" : ""}"><i class="bi ${check.met ? "bi-check-circle-fill" : "bi-circle"}"></i>${escapeHtml(check.label)}</span>`).join("");
      return `<article class="summary-answer"><header><h3>${index + 1}. ${escapeHtml(answer.question)}</h3><span class="summary-answer-score">${answer.score}/100</span></header><blockquote>${escapeHtml(answer.transcript || "Aucune transcription disponible.")}</blockquote><div class="feedback-checks">${checks}</div><p>${escapeHtml(answer.message)}</p><div class="answer-model"><strong>Modèle amélioré</strong>${escapeHtml(answer.improved)}</div></article>`;
    }).join("");
  }

  function playQuestion() {
    elements.interviewerAudio.playbackRate = selectedSpeed;
    elements.interviewerAudio.currentTime = 0;
    elements.interviewerAudio.play().catch(() => { elements.interviewerStatus.textContent = "Impossible de lire l’audio pour le moment."; });
  }

  function bindEvents() {
    elements.start?.addEventListener("click", () => startPractice("full"));
    elements.reviewPrevious?.addEventListener("click", reviewPrevious);
    elements.preflight?.addEventListener("click", testMicrophone);
    elements.questionPlay?.addEventListener("click", playQuestion);
    document.querySelectorAll(".speed-control button").forEach((button) => {
      button.addEventListener("click", () => {
        selectedSpeed = Number(button.dataset.speed) || 1;
        document.querySelectorAll(".speed-control button").forEach((item) => item.classList.toggle("is-active", item === button));
        elements.interviewerAudio.playbackRate = selectedSpeed;
      });
    });
    elements.toggleHelp?.addEventListener("click", () => { elements.support.hidden = true; elements.showHelp.hidden = false; });
    elements.showHelp?.addEventListener("click", () => { elements.support.hidden = false; elements.showHelp.hidden = true; });
    elements.mic?.addEventListener("click", startRecording);
    elements.stop?.addEventListener("click", stopRecording);
    elements.retry?.addEventListener("click", () => {
      const question = currentQuestion();
      state.answers = state.answers.filter((answer) => answer.id !== question?.id);
      saveState();
      renderQuestion();
    });
    elements.next?.addEventListener("click", nextQuestion);
    elements.restart?.addEventListener("click", () => startPractice("full"));
    elements.weakPractice?.addEventListener("click", () => startPractice("weak"));
    navigator.mediaDevices?.addEventListener?.("devicechange", refreshMicrophones);
  }

  function init() {
    if (!QUESTIONS.length) {
      showUnsupported("Configuration absente", "Aucune question n’est disponible pour cette activité.");
      return;
    }
    bindEvents();
    updateOnboarding();
    refreshMicrophones();
    showPanel("onboarding");
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) showUnsupported(ui.unsupportedTitle || "Navigateur non compatible", ui.unsupportedDetail || "Microphone non compatible.");
  }

  init();
})();
