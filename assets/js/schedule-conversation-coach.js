(() => {
  "use strict";

  const config = window.JaraLinguaScheduleCoachConfig || {};
  const stages = Array.isArray(config.stages) ? config.stages : [];
  const dishes = Array.isArray(config.dishes) ? config.dishes : [];
  const incidents = Array.isArray(config.incidents) ? config.incidents : [];
  const dishById = new Map(dishes.map((dish) => [dish.id, dish]));
  const incidentById = new Map(incidents.map((incident) => [incident.id, incident]));
  const storageKey = config.storageKey || "jaralingua:schedule-conversation-coach:v1";
  const apiPath = config.apiPath || "/api/english-intermediate/pronunciation-assessment";
  const submitPath = config.submitPath || "/api/intermediate/unit6-schedule-coach/submit";
  const ui = Object.assign({
    coachName: config.character?.name || "Marcus",
    selectedItemLabel: "Selected strategy",
    noItemSelected: "No strategy selected",
    itemListenTitle: "Hear the strategy name",
    itemChooseText: "Choose this strategy",
    itemSelectedText: "Selected",
    itemContextStatus: "Strategy selected",
    itemContextDetail: "{name} is now the context for your advice and final schedule.",
    itemToast: "{name} selected for this schedule rescue.",
    itemAudioToast: "{name} model audio is playing.",
    defaultContext: "You are advising Marcus about Olivia's schedule.",
    incidentContextPrefix: "New complication",
    promptAudioToast: "{name}'s schedule prompt is playing.",
    clarificationAudioToast: "{name}'s clarification is playing.",
    stageReadyLabel: "{name} is ready",
    stageClarifyingLabel: "{name} is clarifying",
    stageSpeakingLabel: "{name} is speaking",
    missingItemStatus: "Choose a strategy first",
    missingItemHelp: "Select one strategy card before you record your advice.",
    missingItemStage: "{name} is waiting for your strategy choice",
    unavailableToast: "The schedule conversation is unavailable.",
    startToast: "{mode} started. You are advising Marcus.",
    preflightSentence: "I am going to help organize the schedule.",
    recordingStatus: "Recording your schedule response",
    recordingHelp: "Speak naturally. Finish when your message is complete.",
    tooShortStage: "{name} did not hear a complete response",
    incompleteMessage: "Build the response again with a complete schedule message{missing}.",
    addExpressionMessage: "Add one precise Unit 6 expression next time.",
    responseStatus: "{name} is responding",
    responseHelp: "Listen to {name}, then continue the schedule meeting.",
    clarificationHelp: "Listen to the focused clarification, then record one more response.",
    needsDetailStage: "{name} needs one detail",
    completeStage: "Schedule conversation complete",
    readyNextStage: "{name} is ready for the next stage",
    analyzedToast: "Response analyzed successfully. {name} is continuing the conversation.",
    clarificationAnalyzedToast: "Clarification recorded. {name} will continue and the missing evidence remains in your report.",
    noSpeechStage: "{name} could not hear a complete response",
    historyEmpty: "No previous schedule attempts are stored on this device.",
    historyRealLabel: "Real Meeting",
    historyGuidedLabel: "Guided Rehearsal",
    reportLead: "You completed the schedule rescue route{item}. Review the evidence before your next unlimited attempt.",
    reportComparison: "This formative estimate summarizes your latest analyzed response in each schedule stage.",
    reportCoverageReady: "{analyzed} of {total} stages analyzed. The written report is ready for optional teacher delivery.",
    reportCoverageIncomplete: "{analyzed} of {total} stages analyzed. You can still send the report; missing stages will be visible to the teacher.",
    fallbackStrength: "You completed the schedule route and preserved your practice evidence.",
    fallbackPriority: "Repeat the full exchange with more precise Unit 6 language.",
    deliveryIncompleteStatus: "This report has {analyzed} of {total} analyzed stages. You can send it now; missing stages count as 0 in the reference grade.",
    deliveryIncompleteToast: "Partial report ready to send. Missing stages will be visible to the teacher.",
    deliveryReadyStatus: "Report ready. Sign in with your Intermediate English account and send it when you are ready.",
    deliveryBusyStatus: "Sending the written report to your teacher...",
    deliverySuccessStatus: "Submitted to teacher. Reference grade: {grade}/5. Gradebook weight: 0%. This result does not affect your course average.",
    deliverySuccessToast: "Submitted to teacher. Reference grade recorded with weight 0%.",
    deliveryIncompleteServer: "The server could not save this report. Try signing in again or refresh the page.",
    summaryRouteName: "selected route",
    payloadItemKey: "selectedStrategy",
    payloadIncidentKey: "scheduleScenario"
  }, config.ui || {});
  const uiText = (template, values = {}) => String(template || "").replace(/\{(\w+)\}/g, (_match, key) => values[key] ?? "");
  const GOOGLE_USER_KEY = "jaralingua_google_user";
  const MICROSOFT_USER_KEY = "jaralingua_microsoft_user";
  const LOCAL_USER_KEY = "jaralingua_local_user";
  const audioRoot = config.audioRoot || "";
  const imageRoot = config.imageRoot || "";
  const maxRecordingSeconds = Number(config.maxRecordingSeconds) || 35;
  const transcriptionTimeoutMs = 30000;
  const $ = (id) => document.getElementById(id);

  const elements = {
    onboarding: $("onboardingPanel"),
    interview: $("interviewPanel"),
    summary: $("summaryPanel"),
    welcomePlay: $("welcomePlayButton"),
    instructionsPlay: $("instructionsPlayButton"),
    welcomeAudio: $("welcomeAudio"),
    instructionsAudio: $("instructionsAudio"),
    guidedMode: $("guidedMode"),
    realMode: $("realMode"),
    menuPreviewGrid: $("menuPreviewGrid"),
    activeMenuPanel: $("activeMenuPanel"),
    activeMenuGrid: $("activeMenuGrid"),
    selectedDishLabel: $("selectedDishLabel"),
    activeSelectedDishLabel: $("activeSelectedDishLabel"),
    preflight: $("preflightButton"),
    preflightStatus: $("preflightStatus"),
    preflightPlayback: $("preflightPlayback"),
    start: $("startConversationButton"),
    reviewPrevious: $("reviewPreviousButton"),
    resumeNote: $("resumeNote"),
    counter: $("turnCounter"),
    topic: $("turnTopic"),
    progress: $("turnProgress"),
    stage: $("coachStage"),
    stageStatus: $("coachStageStatus"),
    context: $("conversationContext"),
    questionText: $("questionText"),
    questionPlay: $("questionPlayButton"),
    questionAudio: $("questionAudio"),
    reactionAudio: $("reactionAudio"),
    support: $("answerSupport"),
    supportLabel: $("supportSummaryLabel"),
    frames: $("answerFrames"),
    vocabulary: $("vocabularyBank"),
    grammar: $("grammarClue"),
    microphoneSelect: $("microphoneSelect"),
    levelBar: $("levelMeterBar"),
    levelValue: $("levelMeterValue"),
    mic: $("micButton"),
    stop: $("stopButton"),
    recordAgain: $("recordAgainButton"),
    recordStatus: $("recordStatus"),
    recordHelp: $("recordHelp"),
    timer: $("recordTimer"),
    studentAudio: $("studentAudio"),
    transcript: $("liveTranscript"),
    feedback: $("turnFeedback"),
    recovery: $("transcriptionRecovery"),
    retryTranscription: $("retryTranscriptionButton"),
    continueUnscored: $("continueUnscoredButton"),
    recoveryRecordAgain: $("recoveryRecordAgainButton"),
    unsupported: $("unsupportedMessage"),
    reaction: $("coachReaction"),
    reactionText: $("coachReactionText"),
    previous: $("previousTurnButton"),
    next: $("nextTurnButton"),
    summaryLead: $("summaryLead"),
    summaryScore: $("summaryScore"),
    summaryReadiness: $("summaryReadiness"),
    summaryComparison: $("summaryComparison"),
    summaryCoverage: $("summaryCoverage"),
    deliveryPanel: $("teacherDeliveryPanel"),
    deliveryScore: $("deliveryScore"),
    deliveryGrade: $("deliveryGrade"),
    deliveryButton: $("deliveryButton"),
    deliveryStatus: $("deliveryStatus"),
    summaryMetrics: $("summaryMetrics"),
    summaryStrengths: $("summaryStrengths"),
    summaryPriorities: $("summaryPriorities"),
    summaryWords: $("summaryWords"),
    attemptHistory: $("attemptHistory"),
    summaryAnswers: $("summaryAnswers"),
    clearHistory: $("clearHistoryButton"),
    restart: $("restartConversationButton"),
    weakPractice: $("weakPracticeButton"),
    closingPlay: $("closingPlayButton"),
    dock: $("floatingMicDock"),
    floatingTurn: $("floatingTurnLabel"),
    floatingStatus: $("floatingStatus"),
    floatingTimer: $("floatingTimer"),
    floatingMic: $("floatingMicButton"),
    floatingStop: $("floatingStopButton"),
    toast: $("coachToast")
  };

  const menuAudio = new Audio();
  let persistent = loadPersistent();
  let session = freshSession();
  let playbackSpeed = 1;
  let audioBusy = false;
  let mediaStream = null;
  let mediaRecorder = null;
  let recordedChunks = [];
  let recordingStartedAt = 0;
  let recordingDurationMs = 0;
  let timerHandle = null;
  let autoStopHandle = null;
  let currentBlob = null;
  let currentObjectUrl = "";
  let analyzing = false;
  let levelContext = null;
  let levelAnalyser = null;
  let levelFrame = null;
  let toastTimer = null;
  let preflightObjectUrl = "";
  let submissionBusy = false;

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[character]);
  }

  function normalize(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[’']/g, "'")
      .replace(/[^a-z0-9?'\s-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function loadPersistent() {
    try {
      const parsed = JSON.parse(localStorage.getItem(storageKey) || "{}");
      return {
        history: Array.isArray(parsed.history) ? parsed.history.slice(-8) : [],
        lastReport: parsed.lastReport && typeof parsed.lastReport === "object" ? parsed.lastReport : null,
        selectedDishId: dishById.has(parsed.selectedDishId) ? parsed.selectedDishId : "",
        activeSession: sanitizeSessionDraft(parsed.activeSession)
      };
    } catch {
      return { history: [], lastReport: null, selectedDishId: "", activeSession: null };
    }
  }

  function savePersistent() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(persistent));
    } catch {
      // Local practice history is optional.
    }
  }

  function readStoredUser(key, provider) {
    try {
      const saved = JSON.parse(sessionStorage.getItem(key) || "null");
      if (!saved || !saved.exp || Date.now() / 1000 > saved.exp) {
        sessionStorage.removeItem(key);
        return null;
      }
      return Object.assign({ provider }, saved);
    } catch {
      sessionStorage.removeItem(key);
      return null;
    }
  }

  function readUser() {
    return readStoredUser(GOOGLE_USER_KEY, "google") ||
      readStoredUser(MICROSOFT_USER_KEY, "microsoft") ||
      readStoredUser(LOCAL_USER_KEY, "local");
  }

  function openLoginPanel() {
    document.querySelector("[data-auth-toggle], [data-auth-nav-toggle]")?.click();
  }

  function createSubmissionId() {
    const prefix = String(config.id || "schedule-coach").replace(/[^a-z0-9-]+/gi, "-").toLowerCase();
    if (window.crypto?.randomUUID) return `${prefix}-${window.crypto.randomUUID()}`;
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
  }

  function ensureReportSubmissionId(report) {
    if (!report.clientSubmissionId) report.clientSubmissionId = createSubmissionId();
    return report.clientSubmissionId;
  }

  function freshSession(mode = "guided") {
    return {
      mode,
      currentIndex: 0,
      phase: "main",
      answers: [],
      selectedDishId: persistent?.selectedDishId || "",
      incidentId: "",
      entryAudioByStage: {},
      awaitingContinue: false,
      nextAction: "",
      pendingEntryAudio: "",
      pendingResponseText: "",
      startedAt: ""
    };
  }

  function sanitizeAnswerDraft(answer) {
    if (!answer || typeof answer !== "object") return null;
    const stageIndex = Math.max(0, Math.min(stages.length - 1, Number(answer.stageIndex) || 0));
    return {
      stageId: String(answer.stageId || stages[stageIndex]?.id || ""),
      stageIndex,
      phase: answer.phase === "clarify" ? "clarify" : "main",
      prompt: String(answer.prompt || ""),
      transcript: String(answer.transcript || ""),
      durationMs: Math.max(0, Number(answer.durationMs) || 0),
      analysis: answer.analysis && typeof answer.analysis === "object" ? answer.analysis : null,
      unavailable: Boolean(answer.unavailable),
      skipped: Boolean(answer.skipped),
      savedAt: String(answer.savedAt || "")
    };
  }

  function sanitizeAudioMap(value) {
    if (!value || typeof value !== "object") return {};
    return Object.fromEntries(Object.entries(value)
      .filter(([key, file]) => stages.some((stage) => stage.id === key) && typeof file === "string")
      .map(([key, file]) => [key, file]));
  }

  function sanitizeSessionDraft(value) {
    if (!value || typeof value !== "object" || !stages.length) return null;
    const index = Math.max(0, Math.min(stages.length - 1, Number(value.currentIndex) || 0));
    const nextAction = ["advance", "clarify", "finish"].includes(value.nextAction) ? value.nextAction : "";
    return {
      mode: value.mode === "real" ? "real" : "guided",
      currentIndex: index,
      phase: value.phase === "clarify" ? "clarify" : "main",
      answers: Array.isArray(value.answers) ? value.answers.map(sanitizeAnswerDraft).filter(Boolean).slice(-40) : [],
      selectedDishId: dishById.has(value.selectedDishId) ? value.selectedDishId : "",
      incidentId: incidentById.has(value.incidentId) ? value.incidentId : "",
      entryAudioByStage: sanitizeAudioMap(value.entryAudioByStage),
      awaitingContinue: Boolean(value.awaitingContinue && nextAction),
      nextAction,
      pendingEntryAudio: typeof value.pendingEntryAudio === "string" ? value.pendingEntryAudio : "",
      pendingResponseText: typeof value.pendingResponseText === "string" ? value.pendingResponseText : "",
      startedAt: typeof value.startedAt === "string" ? value.startedAt : "",
      savedAt: typeof value.savedAt === "string" ? value.savedAt : ""
    };
  }

  function conversationIsActive() {
    return elements.interview && !elements.interview.hidden;
  }

  function saveActiveSession() {
    if (!conversationIsActive()) return;
    persistent.activeSession = sanitizeSessionDraft({
      ...session,
      savedAt: new Date().toISOString()
    });
    savePersistent();
  }

  function clearActiveSession() {
    persistent.activeSession = null;
    savePersistent();
  }

  function randomIndex(length) {
    if (length <= 1) return 0;
    if (window.crypto?.getRandomValues) {
      const values = new Uint32Array(1);
      window.crypto.getRandomValues(values);
      return values[0] % length;
    }
    return Math.floor(Math.random() * length);
  }

  function currentStage() {
    return stages[session.currentIndex] || null;
  }

  function selectedDish() {
    return dishById.get(session.selectedDishId) || null;
  }

  function selectedIncident() {
    return incidentById.get(session.incidentId) || null;
  }

  function latestAnswerFor(stageIndex = session.currentIndex, phase = session.phase) {
    return session.answers
      .filter((answer) => answer.stageIndex === stageIndex && answer.phase === phase)
      .slice(-1)[0] || null;
  }

  function latestAnswerForCurrentStage() {
    return latestAnswerFor(session.currentIndex, session.phase);
  }

  function renderSavedAnswer(answer, stage) {
    if (!answer) return;
    const hasAnalysis = Boolean(answer.analysis);
    const status = answer.skipped
      ? "This stage was marked as not recorded."
      : answer.unavailable
        ? "This response was preserved without a score."
        : "A saved response is available for this stage.";
    elements.transcript.textContent = answer.transcript || status;
    elements.transcript.classList.toggle("has-text", Boolean(answer.transcript && !answer.skipped));
    if (session.mode === "guided") {
      elements.feedback.hidden = false;
      elements.feedback.innerHTML = hasAnalysis
        ? feedbackMarkup(answer, stage)
        : `<p class="coach-feedback-copy"><strong>${escapeHtml(status)}</strong> You can record again to replace it, go back, or continue to another question.</p>`;
    }
    setRecordStatus("Saved stage ready", "Continue, go back, or record again to replace this response.");
  }

  function audioPath(file) {
    return file ? `${audioRoot}${file}` : "";
  }

  function imagePath(file) {
    return file ? `${imageRoot}${file}` : "";
  }

  function showToast(message) {
    if (!elements.toast) return;
    clearTimeout(toastTimer);
    elements.toast.textContent = message;
    elements.toast.hidden = false;
    toastTimer = window.setTimeout(() => { elements.toast.hidden = true; }, 3600);
  }

  function showPanel(name) {
    elements.onboarding.hidden = name !== "onboarding";
    elements.interview.hidden = name !== "interview";
    elements.summary.hidden = name !== "summary";
    const inConversation = name === "interview";
    elements.dock.hidden = !inConversation;
    elements.dock.setAttribute("aria-hidden", String(!inConversation));
    document.body.classList.toggle("has-floating-dock", inConversation);
  }

  function setStageState(state, label) {
    elements.stage.dataset.state = state;
    const icons = {
      ready: "bi-person-video3",
      speaking: "bi-volume-up-fill",
      listening: "bi-mic-fill",
      analyzing: "bi-hourglass-split",
      responding: "bi-chat-heart-fill",
      complete: "bi-check2-circle"
    };
    elements.stageStatus.innerHTML = `<i class="bi ${icons[state] || icons.ready}"></i> ${escapeHtml(label)}`;
  }

  function setRecordStatus(title, detail) {
    elements.recordStatus.textContent = title;
    elements.recordHelp.textContent = detail;
    elements.floatingStatus.textContent = title;
  }

  function allCoachAudio() {
    return [elements.welcomeAudio, elements.instructionsAudio, elements.questionAudio, elements.reactionAudio, menuAudio].filter(Boolean);
  }

  function updateSpeed(nextSpeed, notify = true) {
    playbackSpeed = [0.75, 1, 1.25].includes(Number(nextSpeed)) ? Number(nextSpeed) : 1;
    document.querySelectorAll("[data-coach-speed]").forEach((button) => {
      button.classList.toggle("is-active", Number(button.dataset.coachSpeed) === playbackSpeed);
    });
    allCoachAudio().forEach((audio) => { audio.playbackRate = playbackSpeed; });
    if (notify) showToast(`Audio speed set to ${playbackSpeed}x.`);
  }

  function stopCoachAudio() {
    allCoachAudio().forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });
    document.querySelectorAll("[data-dish-audio]").forEach((button) => button.setAttribute("aria-pressed", "false"));
    audioBusy = false;
  }

  async function playAudio(audio, file, options = {}) {
    if (!audio || !file || audioBusy || mediaRecorder?.state === "recording") return false;
    stopCoachAudio();
    audioBusy = true;
    audio.src = audioPath(file);
    audio.playbackRate = playbackSpeed;
    if (options.stageState) setStageState(options.stageState, options.stageLabel || `${ui.coachName} is speaking`);
    if (options.menuId) {
      document.querySelectorAll(`[data-dish-audio="${options.menuId}"]`).forEach((button) => button.setAttribute("aria-pressed", "true"));
    }
    updateControls();
    try {
      await audio.play();
      await new Promise((resolve, reject) => {
        const cleanup = () => {
          audio.removeEventListener("ended", ended);
          audio.removeEventListener("pause", paused);
          audio.removeEventListener("error", failed);
        };
        const ended = () => { cleanup(); resolve(); };
        const paused = () => { cleanup(); resolve(); };
        const failed = () => { cleanup(); reject(new Error("The professional audio could not be loaded.")); };
        audio.addEventListener("ended", ended, { once: true });
        audio.addEventListener("pause", paused, { once: true });
        audio.addEventListener("error", failed, { once: true });
      });
      return true;
    } catch (error) {
      showToast(error.message || "Audio playback is unavailable.");
      return false;
    } finally {
      audioBusy = false;
      document.querySelectorAll("[data-dish-audio]").forEach((button) => button.setAttribute("aria-pressed", "false"));
      if (options.restoreStage !== false && !analyzing && mediaRecorder?.state !== "recording") setStageState("ready", uiText(ui.stageReadyLabel, { name: ui.coachName }));
      updateControls();
    }
  }

  function promptText() {
    const stage = currentStage();
    if (!stage) return "";
    if (session.phase === "clarify") return stage.clarify?.text || stage.prompt;
    if (stage.id === "service-problem" && selectedIncident()) return selectedIncident().prompt;
    return stage.prompt;
  }

  function promptAudio() {
    const stage = currentStage();
    if (!stage) return "";
    if (session.phase === "clarify") return stage.clarify?.file || "";
    return session.entryAudioByStage[stage.id] || stage.entryAudio || "";
  }

  async function playQuestion() {
    const file = promptAudio();
    if (!file) {
      showToast("This stage has no professional prompt audio configured.");
      return;
    }
    showToast(session.phase === "clarify"
      ? uiText(ui.clarificationAudioToast, { name: ui.coachName })
      : uiText(ui.promptAudioToast, { name: ui.coachName }));
    await playAudio(elements.questionAudio, file, {
      stageState: "speaking",
      stageLabel: session.phase === "clarify"
        ? uiText(ui.stageClarifyingLabel, { name: ui.coachName })
        : uiText(ui.stageSpeakingLabel, { name: ui.coachName })
    });
  }

  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
    const remainder = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${minutes}:${remainder}`;
  }

  function recordingLimit() {
    return Number(currentStage()?.maxSeconds) || maxRecordingSeconds;
  }

  function updateTimer() {
    const elapsed = Math.min(recordingLimit(), Math.floor((Date.now() - recordingStartedAt) / 1000));
    const value = `${formatTime(elapsed)} / ${formatTime(recordingLimit())}`;
    elements.timer.textContent = value;
    elements.floatingTimer.textContent = value;
  }

  function resetTimer() {
    const value = `00:00 / ${formatTime(recordingLimit())}`;
    elements.timer.textContent = value;
    elements.floatingTimer.textContent = value;
  }

  function dishCard(dish) {
    const selected = dish.id === session.selectedDishId;
    return `<article class="restaurant-dish-card${selected ? " is-selected" : ""}" data-dish-card="${escapeHtml(dish.id)}">
      <div class="restaurant-dish-photo"><img src="${escapeHtml(imagePath(dish.image))}" width="960" height="720" loading="eager" decoding="sync" alt="${escapeHtml(dish.name)}" /><span class="restaurant-dish-category">${escapeHtml(dish.category)}</span></div>
      <div class="restaurant-dish-copy"><div class="restaurant-dish-heading"><h4>${escapeHtml(dish.name)}</h4><strong>${escapeHtml(dish.price)}</strong></div><p>${escapeHtml(dish.description)}</p><div></div><div class="restaurant-dish-actions"><button class="restaurant-dish-listen" type="button" data-dish-audio="${escapeHtml(dish.id)}" aria-pressed="false" title="${escapeHtml(ui.itemListenTitle)}" aria-label="Hear ${escapeHtml(dish.name)}"><i class="bi bi-volume-up-fill"></i></button><button class="restaurant-dish-select" type="button" data-dish-select="${escapeHtml(dish.id)}">${selected ? escapeHtml(ui.itemSelectedText) : escapeHtml(ui.itemChooseText)}</button></div></div>
    </article>`;
  }

  function renderMenus() {
    const markup = dishes.map(dishCard).join("");
    elements.menuPreviewGrid.innerHTML = markup;
    elements.activeMenuGrid.innerHTML = markup;
    const dish = selectedDish();
    const label = dish ? `<i class="bi bi-bookmark-check-fill"></i> ${escapeHtml(dish.name)}` : `<i class="bi bi-bookmark"></i> ${escapeHtml(ui.noItemSelected)}`;
    elements.selectedDishLabel.innerHTML = label;
    elements.activeSelectedDishLabel.innerHTML = label;
    updateControls();
  }

  function chooseDish(dishId) {
    if (!dishById.has(dishId)) return;
    session.selectedDishId = dishId;
    persistent.selectedDishId = dishId;
    if (conversationIsActive()) saveActiveSession();
    else savePersistent();
    renderMenus();
    const dish = selectedDish();
    setRecordStatus(ui.itemContextStatus, uiText(ui.itemContextDetail, { name: dish.name }));
    showToast(uiText(ui.itemToast, { name: dish.name }));
  }

  async function playDishName(dishId) {
    const dish = dishById.get(dishId);
    if (!dish) return;
    showToast(uiText(ui.itemAudioToast, { name: dish.name }));
    await playAudio(menuAudio, dish.audio, { menuId: dish.id });
  }

  function refreshOnboarding() {
    elements.welcomeAudio.src = audioPath(config.audio?.welcome);
    elements.instructionsAudio.src = audioPath(config.audio?.instructions);
    renderMenus();
    elements.reviewPrevious.hidden = true;
    elements.reviewPrevious.dataset.action = "";
    elements.resumeNote.hidden = true;
    elements.resumeNote.textContent = "";
    if (persistent.activeSession) {
      elements.reviewPrevious.hidden = false;
      elements.reviewPrevious.dataset.action = "resume";
      elements.reviewPrevious.innerHTML = '<i class="bi bi-arrow-clockwise"></i> Resume saved exchange';
      elements.resumeNote.hidden = false;
      elements.resumeNote.textContent = `Saved progress on this device: stage ${persistent.activeSession.currentIndex + 1} of ${stages.length}. You can resume, go back, or continue forward.`;
      return;
    }
    if (!persistent.lastReport) return;
    elements.reviewPrevious.hidden = false;
    elements.reviewPrevious.dataset.action = "review";
    elements.reviewPrevious.textContent = "Review latest report";
    elements.resumeNote.hidden = false;
    const score = persistent.lastReport.score == null ? "not scored" : `${persistent.lastReport.score}/50`;
    elements.resumeNote.textContent = `Latest private result on this device: ${score}. You can review it or begin another unlimited attempt.`;
  }

  function stageContext(stage) {
    if ((stage.requiresDish || stage.showStrategyBoard) && selectedDish()) return `${ui.selectedItemLabel}: ${selectedDish().name}.`;
    if ((stage.id === "schedule-pushback" || stage.id === "service-problem") && selectedIncident()) return `${ui.incidentContextPrefix}: ${selectedIncident().prompt}`;
    return ui.defaultContext;
  }

  function renderStage(autoplay = true) {
    const stage = currentStage();
    if (!stage) return;
    releaseCurrentRecording();
    session.awaitingContinue = false;
    session.nextAction = "";
    session.pendingEntryAudio = "";
    const position = session.currentIndex + 1;
    elements.counter.textContent = `Stage ${position} of ${stages.length}${session.phase === "clarify" ? " - Clarification" : ""}`;
    elements.floatingTurn.textContent = `Stage ${position} of ${stages.length}`;
    elements.topic.textContent = stage.topic;
    elements.progress.style.width = `${Math.round((position / stages.length) * 100)}%`;
    elements.context.textContent = stageContext(stage);
    elements.questionText.textContent = promptText();
    elements.questionAudio.src = audioPath(promptAudio());
    elements.questionAudio.playbackRate = playbackSpeed;
    elements.frames.innerHTML = (stage.frames || []).map((frame) => `<div class="coach-frame">${escapeHtml(frame)}</div>`).join("");
    elements.vocabulary.innerHTML = (stage.vocabulary || []).map((item) => `<span>${escapeHtml(item)}</span>`).join("");
    elements.grammar.textContent = stage.grammar || "";
    elements.support.open = session.mode === "guided";
    elements.supportLabel.textContent = session.mode === "guided" ? "Use, then personalize" : "Optional support";
    elements.activeMenuPanel.hidden = !(stage.requiresDish || stage.showStrategyBoard);
    if (!elements.activeMenuPanel.hidden) renderMenus();
    elements.feedback.hidden = true;
    elements.feedback.innerHTML = "";
    elements.recovery.hidden = true;
    elements.reaction.hidden = true;
    elements.transcript.textContent = "Your transcript will appear after temporary Whisper analysis.";
    elements.transcript.classList.remove("has-text");
    elements.unsupported.hidden = true;
    elements.next.innerHTML = 'Continue <i class="bi bi-arrow-right"></i>';
    resetTimer();
    const missingDish = stage.requiresDish && !selectedDish();
    setRecordStatus(missingDish ? ui.missingItemStatus : "Ready for your response", missingDish ? ui.missingItemHelp : "Tap the microphone and respond in English.");
    setStageState("ready", missingDish ? uiText(ui.missingItemStage, { name: ui.coachName }) : uiText(ui.stageReadyLabel, { name: ui.coachName }));
    renderSavedAnswer(latestAnswerForCurrentStage(), stage);
    updateControls();
    if (autoplay && promptAudio()) window.setTimeout(playQuestion, 250);
  }

  function beginConversation(forcedMode = null) {
    if (!stages.length) {
      showToast(ui.unavailableToast);
      return;
    }
    const mode = forcedMode || (elements.realMode.checked ? "real" : "guided");
    session = freshSession(mode);
    session.startedAt = new Date().toISOString();
    showPanel("interview");
    renderStage(true);
    saveActiveSession();
    elements.interview.scrollIntoView({ behavior: "smooth", block: "start" });
    showToast(uiText(ui.startToast, { mode: mode === "guided" ? "Guided Rehearsal" : "Real Meeting", name: ui.coachName }));
  }

  async function refreshMicrophones() {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    try {
      const previous = elements.microphoneSelect.value;
      const devices = (await navigator.mediaDevices.enumerateDevices()).filter((device) => device.kind === "audioinput");
      elements.microphoneSelect.innerHTML = '<option value="">Default microphone</option>' + devices.map((device, index) => `<option value="${escapeHtml(device.deviceId)}">${escapeHtml(device.label || `Microphone ${index + 1}`)}</option>`).join("");
      if ([...elements.microphoneSelect.options].some((option) => option.value === previous)) elements.microphoneSelect.value = previous;
    } catch {
      // Browser labels may remain hidden until permission is granted.
    }
  }

  function audioConstraints(deviceId = elements.microphoneSelect?.value || "") {
    return {
      echoCancellation: { ideal: true },
      noiseSuppression: { ideal: true },
      autoGainControl: { ideal: true },
      channelCount: { ideal: 1 },
      ...(deviceId ? { deviceId: { exact: deviceId } } : {})
    };
  }

  async function requestStream(deviceId) {
    if (!window.isSecureContext && !["localhost", "127.0.0.1"].includes(location.hostname)) {
      const error = new Error("The microphone requires the secure HTTPS page.");
      error.name = "SecurityError";
      throw error;
    }
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      const error = new Error("This browser does not support microphone recording. Use current Chrome, Edge, or Safari.");
      error.name = "NotSupportedError";
      throw error;
    }
    return navigator.mediaDevices.getUserMedia({ audio: audioConstraints(deviceId), video: false });
  }

  function microphoneError(error) {
    const messages = {
      NotAllowedError: "Microphone permission was denied. Allow it in the browser site settings and try again.",
      SecurityError: "The microphone requires the secure HTTPS page.",
      NotFoundError: "No microphone was detected on this device.",
      NotReadableError: "Another application may be using the microphone. Close other recorders and try again.",
      AbortError: "The browser interrupted microphone activation. Try again.",
      OverconstrainedError: "The selected microphone is unavailable. Choose the default microphone.",
      NotSupportedError: "This browser does not support microphone recording. Use current Chrome, Edge, or Safari."
    };
    return messages[error?.name] || error?.message || "The microphone is unavailable.";
  }

  function preferredMimeType() {
    return ["audio/webm;codecs=opus", "audio/webm", "audio/mp4;codecs=mp4a.40.2", "audio/mp4"].find((type) => window.MediaRecorder?.isTypeSupported?.(type)) || "";
  }

  async function testMicrophone() {
    if (elements.preflight.disabled) return;
    elements.preflight.disabled = true;
      elements.preflightStatus.textContent = `Recording a three-second microphone test. Say: ${ui.preflightSentence}`;
    try {
      const stream = await requestStream("");
      const chunks = [];
      const mimeType = preferredMimeType();
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      recorder.ondataavailable = (event) => { if (event.data?.size) chunks.push(event.data); };
      const stopped = new Promise((resolve) => { recorder.onstop = resolve; });
      recorder.start();
      await new Promise((resolve) => window.setTimeout(resolve, 3200));
      recorder.stop();
      await stopped;
      stream.getTracks().forEach((track) => track.stop());
      const blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
      if (blob.size < 700) throw new Error("The test recording was empty. Check the selected input and try again.");
      if (preflightObjectUrl) URL.revokeObjectURL(preflightObjectUrl);
      preflightObjectUrl = URL.createObjectURL(blob);
      elements.preflightPlayback.src = preflightObjectUrl;
      elements.preflightPlayback.hidden = false;
      elements.preflightStatus.textContent = "Microphone test complete. Play it back and confirm that your voice is clear.";
      showToast("Microphone test completed. Play the recording to check it.");
      await refreshMicrophones();
    } catch (error) {
      elements.preflightStatus.textContent = microphoneError(error);
      showToast("The microphone test could not be completed.");
    } finally {
      elements.preflight.disabled = false;
    }
  }

  function stopTracks() {
    mediaStream?.getTracks().forEach((track) => track.stop());
    mediaStream = null;
  }

  function stopLevelMeter() {
    if (levelFrame) cancelAnimationFrame(levelFrame);
    levelFrame = null;
    levelAnalyser = null;
    if (levelContext) levelContext.close().catch(() => {});
    levelContext = null;
    elements.levelBar.style.width = "0%";
    elements.levelValue.textContent = "Waiting";
  }

  function startLevelMeter(stream) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    levelContext = new AudioContextClass();
    const source = levelContext.createMediaStreamSource(stream);
    levelAnalyser = levelContext.createAnalyser();
    levelAnalyser.fftSize = 256;
    source.connect(levelAnalyser);
    const data = new Uint8Array(levelAnalyser.frequencyBinCount);
    const draw = () => {
      if (!levelAnalyser) return;
      levelAnalyser.getByteFrequencyData(data);
      const average = data.reduce((sum, value) => sum + value, 0) / Math.max(1, data.length);
      const level = Math.min(100, Math.round(average * 1.65));
      elements.levelBar.style.width = `${level}%`;
      elements.levelValue.textContent = level < 8 ? "Low" : level > 72 ? "Strong" : "Good";
      levelFrame = requestAnimationFrame(draw);
    };
    draw();
  }

  function updateControls() {
    const recording = mediaRecorder?.state === "recording";
    const missingDish = currentStage()?.requiresDish && !selectedDish();
    const activeConversation = !elements.interview.hidden;
    const canRecord = activeConversation && !recording && !analyzing && !audioBusy && !session.awaitingContinue && !missingDish;
    elements.mic.disabled = !canRecord;
    elements.floatingMic.disabled = !canRecord;
    elements.stop.disabled = !recording;
    elements.floatingStop.disabled = !recording;
    elements.floatingStop.hidden = !recording;
    elements.floatingMic.hidden = recording;
    elements.dock.classList.toggle("is-recording", recording);
    elements.dock.dataset.state = recording ? "recording" : analyzing ? "analyzing" : canRecord ? "ready" : "waiting";
    elements.questionPlay.disabled = recording || analyzing || audioBusy || !promptAudio();
    elements.recordAgain.disabled = recording || analyzing || (!currentBlob && !session.awaitingContinue && !latestAnswerForCurrentStage());
    elements.microphoneSelect.disabled = recording || analyzing;
    if (elements.previous) elements.previous.disabled = recording || analyzing || (session.currentIndex === 0 && session.phase === "main");
    elements.next.disabled = recording || analyzing;
  }

  async function startRecording() {
    const stage = currentStage();
    if (!stage || analyzing || audioBusy || session.awaitingContinue) return;
    if (stage.requiresDish && !selectedDish()) {
      showToast(ui.missingItemHelp);
      elements.activeMenuPanel.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    stopCoachAudio();
    elements.unsupported.hidden = true;
    elements.recovery.hidden = true;
    elements.feedback.hidden = true;
    elements.reaction.hidden = true;
    try {
      mediaStream = await requestStream(elements.microphoneSelect.value);
      const mimeType = preferredMimeType();
      mediaRecorder = mimeType ? new MediaRecorder(mediaStream, { mimeType }) : new MediaRecorder(mediaStream);
      recordedChunks = [];
      mediaRecorder.ondataavailable = (event) => { if (event.data?.size) recordedChunks.push(event.data); };
      mediaRecorder.onstop = handleRecordingStopped;
      mediaRecorder.start();
      recordingStartedAt = Date.now();
      recordingDurationMs = 0;
      resetTimer();
      timerHandle = window.setInterval(updateTimer, 250);
      autoStopHandle = window.setTimeout(stopRecording, recordingLimit() * 1000);
      startLevelMeter(mediaStream);
      elements.mic.classList.add("is-recording");
      setRecordStatus(ui.recordingStatus, ui.recordingHelp);
      setStageState("listening", `${ui.coachName} is listening`);
      updateControls();
      showToast("Recording started.");
    } catch (error) {
      const message = microphoneError(error);
      elements.unsupported.hidden = false;
      elements.unsupported.innerHTML = `<strong>Microphone unavailable</strong><br>${escapeHtml(message)}`;
      setRecordStatus("Microphone unavailable", message);
      setStageState("ready", `${ui.coachName} is waiting while you check the microphone`);
      stopTracks();
      updateControls();
    }
  }

  function stopRecording() {
    if (mediaRecorder?.state !== "recording") return;
    recordingDurationMs = Math.max(0, Date.now() - recordingStartedAt);
    clearInterval(timerHandle);
    clearTimeout(autoStopHandle);
    timerHandle = null;
    autoStopHandle = null;
    mediaRecorder.stop();
    stopLevelMeter();
    elements.mic.classList.remove("is-recording");
    setRecordStatus("Preparing your recording", "Your response will be checked by the temporary English transcription service.");
    updateControls();
    showToast("Recording finished. Preparing analysis.");
  }

  async function handleRecordingStopped() {
    stopTracks();
    currentBlob = new Blob(recordedChunks, { type: mediaRecorder?.mimeType || "audio/webm" });
    recordedChunks = [];
    if (currentBlob.size < 700 || recordingDurationMs < 700) {
      currentBlob = null;
      setRecordStatus("The recording was too short", "Record a complete response of several seconds before finishing.");
      setStageState("ready", uiText(ui.tooShortStage, { name: ui.coachName }));
      updateControls();
      return;
    }
    if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl);
    currentObjectUrl = URL.createObjectURL(currentBlob);
    elements.studentAudio.src = currentObjectUrl;
    elements.studentAudio.hidden = false;
    await transcribeCurrentRecording();
  }

  async function requestTranscription(blob, maxAttempts = 3) {
    let lastError = null;
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), transcriptionTimeoutMs);
      try {
        const response = await fetch(apiPath, {
          method: "POST",
          headers: { "Content-Type": blob.type || "audio/webm" },
          body: blob,
          signal: controller.signal
        });
        const payload = await response.json().catch(() => ({}));
        if (response.ok) {
          const expectedLanguage = String(config.language || "").toLowerCase();
          const returnedLanguage = String(payload.language_code || payload.language || "").toLowerCase();
          if (expectedLanguage && returnedLanguage && !returnedLanguage.startsWith(expectedLanguage)) {
            const languageError = new Error("The transcription service did not return English analysis. Please retry this recording.");
            languageError.status = 502;
            throw languageError;
          }
          return payload;
        }
        const error = new Error(payload.error || `Transcription service error (${response.status}).`);
        error.status = response.status;
        throw error;
      } catch (error) {
        lastError = error;
        const retryable = error.name === "AbortError" || error.name === "TypeError" || error.status === 429 || error.status >= 500;
        if (!retryable || attempt === maxAttempts) throw error;
      } finally {
        clearTimeout(timeout);
      }
      await new Promise((resolve) => window.setTimeout(resolve, 700 * (2 ** (attempt - 1))));
    }
    throw lastError || new Error("The transcription service did not answer.");
  }

  function cleanWhisperWords(words) {
    if (!Array.isArray(words)) return [];
    return words.map((item) => ({
      word: String(item.word || item.text || "").trim(),
      probability: Number(item.probability ?? item.confidence ?? 1)
    })).filter((item) => item.word && Number.isFinite(item.probability));
  }

  const frenchFeedbackWords = new Set([
    "avec", "cette", "comme", "cree", "dans", "elle", "elles", "entre", "mais", "nous", "pour", "sont", "tout", "tres", "vous"
  ]);

  function isUsefulEnglishFeedbackWord(word) {
    const raw = String(word || "").trim();
    if (String(config.language || "").toLowerCase() !== "en") return normalize(raw).length > 2;
    if (/[\u0300-\u036f]/.test(raw.normalize("NFD"))) return false;
    const token = raw.toLowerCase().replace(/^[^a-z]+|[^a-z'-]+$/g, "");
    return /^[a-z][a-z'-]{2,}$/.test(token) && !frenchFeedbackWords.has(token);
  }

  function countWords(text) {
    return normalize(text).split(/\s+/).filter(Boolean).length;
  }

  function evaluateCheck(transcript, check) {
    const normalized = normalize(transcript);
    let terms = check.terms || [];
    if (check.kind === "selected-dish") terms = selectedDish()?.terms || [];
    if (check.kind === "incident") terms = selectedIncident()?.terms || [];
    const matches = terms.filter((term) => normalized.includes(normalize(term)));
    const needed = Number(check.minMatches) || 1;
    return { label: check.label, met: matches.length >= needed, matches: matches.length };
  }

  function clampScore(value) {
    return Math.max(1, Math.min(10, Math.round(value)));
  }

  function analyzeAnswer(transcript, durationMs, whisperWords, stage) {
    const normalized = normalize(transcript);
    const wordCount = countWords(transcript);
    const seconds = Math.max(1, durationMs / 1000);
    const checks = (stage.checks || []).map((check) => evaluateCheck(transcript, check));
    const metChecks = checks.filter((check) => check.met).length;
    const checkRatio = checks.length ? metChecks / checks.length : .65;
    const minWords = Math.max(1, Number(stage.minWords) || 8);
    const lengthRatio = Math.min(1, wordCount / minWords);
    const connectors = ["because", "but", "however", "so", "and", "although"].filter((term) => normalized.includes(term)).length;
    const politeMarkers = ["please", "could you", "could i", "could we", "would like", "excuse me", "thank you"].filter((term) => normalized.includes(term)).length;
    const unitMatchCount = (stage.unitTerms || []).filter((term) => normalized.includes(normalize(term))).length;
    const wordsPerMinute = (wordCount / seconds) * 60;
    const whisperEvidence = cleanWhisperWords(whisperWords).filter((item) => isUsefulEnglishFeedbackWord(item.word));
    const averageConfidence = whisperEvidence.length ? whisperEvidence.reduce((sum, item) => sum + item.probability, 0) / whisperEvidence.length : .72;
    const task = clampScore(2 + checkRatio * 6 + lengthRatio * 2);
    const interaction = clampScore(3 + checkRatio * 4 + Math.min(2, politeMarkers) + Math.min(1, connectors));
    const language = clampScore(3 + Math.min(4, unitMatchCount * 1.35) + checkRatio * 2 + Math.min(1, connectors));
    const paceValue = wordsPerMinute >= 55 && wordsPerMinute <= 170 ? 4 : wordsPerMinute >= 38 && wordsPerMinute <= 195 ? 2.5 : 1;
    const fluency = clampScore(2 + paceValue + lengthRatio * 3 + (seconds >= 5 ? 1 : 0));
    const clarity = clampScore(averageConfidence * 10);
    const metrics = { task, interaction, language, fluency, clarity };
    const total = Object.values(metrics).reduce((sum, value) => sum + value, 0);
    const lowConfidence = whisperEvidence.filter((item) => item.probability < .68).slice(0, 8);
    const missing = checks.filter((check) => !check.met).map((check) => check.label);
    const message = total >= 43
      ? (ui.successMessage || "Your response is relevant, detailed, and ready for the next part of the conversation.")
      : total >= 34
        ? `Your message communicates the main idea. ${missing.length ? `Add ${missing[0]} to make it complete.` : ui.addExpressionMessage}`
        : uiText(ui.incompleteMessage, { missing: missing.length ? ` and include ${missing[0]}` : " and one specific detail" });
    return { total, metrics, checks, wordCount, durationSeconds: Math.round(seconds), wordsPerMinute: Math.round(wordsPerMinute), lowConfidence, message };
  }

  function strongerModel(stage, context = {}) {
    const dishId = context.selectedDishId || session.selectedDishId;
    const incidentId = context.incidentId || session.incidentId;
    const dishModel = stage.improvedByDish && dishId ? stage.improvedByDish[dishId] : "";
    const incidentModel = stage.improvedByIncident && incidentId ? stage.improvedByIncident[incidentId] : "";
    if (stage.combineImprovedModels && dishModel && incidentModel) return `${dishModel} ${incidentModel}`;
    if (dishModel) return dishModel;
    if (incidentModel) return incidentModel;
    return stage.improved || "";
  }

  function feedbackMarkup(answer, stage) {
    const metrics = (config.rubric || []).map((criterion) => `<div class="coach-feedback-metric"><strong>${answer.analysis.metrics[criterion.key]}</strong><span>${escapeHtml(criterion.label)} /10</span></div>`).join("");
    const checks = answer.analysis.checks.map((check) => `<span class="coach-check ${check.met ? "is-met" : ""}"><i class="bi ${check.met ? "bi-check-circle-fill" : "bi-circle"}"></i> ${escapeHtml(check.label)}</span>`).join("");
    const lowWords = answer.analysis.lowConfidence.length ? `<p class="coach-feedback-copy"><strong>Repeat more clearly:</strong> ${answer.analysis.lowConfidence.map((item) => escapeHtml(item.word)).join(", ")}. This is only a transcription-confidence signal.</p>` : "";
    return `<div class="coach-feedback-grid">${metrics}</div><div class="coach-checks">${checks}</div><p class="coach-feedback-copy">${escapeHtml(answer.analysis.message)}</p>${lowWords}<p class="coach-model"><strong>Stronger model:</strong><br>${escapeHtml(strongerModel(stage))}</p>`;
  }

  function answerIsComplete(answer, stage) {
    return answer.analysis.checks.every((check) => check.met) && answer.analysis.wordCount >= Number(stage.minWords || 0);
  }

  function completeResponse(stage) {
    const useSelectedItemResponse = stage.usesSelectedItemResponse ||
      (stage.id === "choose-strategy" && config.useSelectedItemResponseOnChooseStrategy !== false);
    if (useSelectedItemResponse) return selectedDish()?.response || stage.complete || stage.clarify;
    if (stage.id === "advice-plan") {
      if (!selectedIncident() && incidents.length) session.incidentId = incidents[randomIndex(incidents.length)].id;
      return selectedIncident() || stage.clarify;
    }
    return stage.complete || null;
  }

  function fallbackResponse(nextAction) {
    if (nextAction === "clarify") return { text: "Add one more clear detail before we continue." };
    if (nextAction === "finish") return { text: "Good. The exchange is complete. Open your report when you are ready." };
    return { text: "Good. Continue to the next part of the exchange." };
  }

  async function presentResponse(entry, nextAction) {
    const responseEntry = entry || fallbackResponse(nextAction);
    session.awaitingContinue = true;
    session.nextAction = nextAction;
    session.pendingEntryAudio = responseEntry.file || "";
    session.pendingResponseText = responseEntry.text || fallbackResponse(nextAction).text;
    elements.reactionText.textContent = session.pendingResponseText;
    elements.reaction.hidden = false;
    elements.next.innerHTML = nextAction === "clarify"
      ? 'Answer clarification <i class="bi bi-arrow-repeat"></i>'
      : nextAction === "finish"
        ? 'View private report <i class="bi bi-clipboard2-check"></i>'
        : 'Continue conversation <i class="bi bi-arrow-right"></i>';
    setRecordStatus(uiText(ui.responseStatus, { name: ui.coachName }), nextAction === "clarify" ? ui.clarificationHelp : uiText(ui.responseHelp, { name: ui.coachName }));
    updateControls();
    saveActiveSession();
    await playAudio(elements.reactionAudio, responseEntry.file, { stageState: "responding", stageLabel: uiText(ui.responseStatus, { name: ui.coachName }), restoreStage: false });
    setStageState(nextAction === "finish" ? "complete" : "ready", nextAction === "clarify" ? uiText(ui.needsDetailStage, { name: ui.coachName }) : nextAction === "finish" ? ui.completeStage : uiText(ui.readyNextStage, { name: ui.coachName }));
    updateControls();
    saveActiveSession();
  }

  async function processAnswer(answer) {
    const stage = currentStage();
    const complete = answerIsComplete(answer, stage);
    if (!complete && session.phase === "main" && stage.clarify) {
      showToast(`${ui.coachName} selected one clarification from the missing evidence.`);
      await presentResponse(stage.clarify, "clarify");
      return;
    }
    const response = completeResponse(stage);
    const action = session.currentIndex === stages.length - 1 ? "finish" : "advance";
    showToast(session.phase === "clarify" && !complete ? uiText(ui.clarificationAnalyzedToast, { name: ui.coachName }) : uiText(ui.analyzedToast, { name: ui.coachName }));
    await presentResponse(response, action);
  }

  async function transcribeCurrentRecording() {
    if (!currentBlob || analyzing) return;
    analyzing = true;
    elements.recovery.hidden = true;
    elements.feedback.hidden = true;
    elements.transcript.textContent = "Analyzing your temporary recording. Please wait.";
    setRecordStatus("Checking your English response", "Whisper is transcribing the recording. No score is created without usable speech.");
    setStageState("analyzing", `${ui.coachName} is checking your response`);
    updateControls();
    try {
      const payload = await requestTranscription(currentBlob);
      const transcript = String(payload.text || payload.transcript || "").trim();
      if (!transcript) {
        const silent = Number(payload.audio?.rms || 0) < .0008;
        throw new Error(silent ? "The recording arrived silent. Choose another microphone and try again." : "Speech was detected, but no clear English words were transcribed.");
      }
      const stage = currentStage();
      const whisperWords = cleanWhisperWords(payload.words);
      const analysis = analyzeAnswer(transcript, recordingDurationMs, whisperWords, stage);
      const answer = {
        stageId: stage.id,
        stageIndex: session.currentIndex,
        phase: session.phase,
        prompt: promptText(),
        transcript,
        durationMs: recordingDurationMs,
        analysis,
        unavailable: false,
        skipped: false,
        savedAt: new Date().toISOString()
      };
      session.answers.push(answer);
      elements.transcript.textContent = transcript;
      elements.transcript.classList.add("has-text");
      if (session.mode === "guided") {
        elements.feedback.innerHTML = feedbackMarkup(answer, stage);
        elements.feedback.hidden = false;
      }
      await processAnswer(answer);
    } catch (error) {
      const message = error?.name === "AbortError" ? "The transcription request took too long." : error?.message || "The transcription service did not answer.";
      elements.transcript.textContent = message;
      elements.transcript.classList.remove("has-text");
      elements.recovery.hidden = false;
      setRecordStatus("Analysis not completed", "Retry the same recording, record again, or preserve this stage as not analyzed.");
      setStageState("ready", `${ui.coachName} is waiting while you recover the response`);
      showToast("No score was created for this recording.");
      if (/silent|no clear english words|too short/i.test(message)) {
        playAudio(elements.reactionAudio, config.audio?.noSpeech?.file, { stageState: "responding", stageLabel: uiText(ui.noSpeechStage, { name: ui.coachName }) });
      } else {
        playAudio(elements.reactionAudio, config.audio?.serviceRecovery?.file, { stageState: "responding", stageLabel: "The transcription service is unavailable" });
      }
    } finally {
      analyzing = false;
      updateControls();
    }
  }

  async function continueWithoutScore() {
    const stage = currentStage();
    session.answers.push({
      stageId: stage.id,
      stageIndex: session.currentIndex,
      phase: session.phase,
      prompt: promptText(),
      transcript: "Response preserved as not analyzed.",
      durationMs: recordingDurationMs,
      analysis: null,
      unavailable: true,
      skipped: false,
      savedAt: new Date().toISOString()
    });
    elements.recovery.hidden = true;
    elements.transcript.textContent = "This response was preserved as not analyzed. No score was created.";
    elements.transcript.classList.remove("has-text");
    if (session.phase === "main" && stage.clarify) {
      showToast(`The response was preserved without a score. ${ui.coachName} will ask one clarification.`);
      await presentResponse(stage.clarify, "clarify");
      return;
    }
    const response = completeResponse(stage);
    const action = session.currentIndex === stages.length - 1 ? "finish" : "advance";
    showToast("The clarification was preserved without a score. The conversation will continue.");
    await presentResponse(response, action);
  }

  function releaseCurrentRecording() {
    clearInterval(timerHandle);
    clearTimeout(autoStopHandle);
    timerHandle = null;
    autoStopHandle = null;
    stopTracks();
    stopLevelMeter();
    if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl);
    currentObjectUrl = "";
    currentBlob = null;
    elements.studentAudio.pause();
    elements.studentAudio.removeAttribute("src");
    elements.studentAudio.hidden = true;
  }

  function recordAgain() {
    stopCoachAudio();
    session.answers = session.answers.filter((answer, index, values) => {
      if (answer.stageIndex !== session.currentIndex || answer.phase !== session.phase) return true;
      return index !== values.map((item) => `${item.stageIndex}:${item.phase}`).lastIndexOf(`${session.currentIndex}:${session.phase}`);
    });
    releaseCurrentRecording();
    session.awaitingContinue = false;
    session.nextAction = "";
    session.pendingEntryAudio = "";
    session.pendingResponseText = "";
    elements.feedback.hidden = true;
    elements.recovery.hidden = true;
    elements.reaction.hidden = true;
    elements.transcript.textContent = "Your replacement transcript will appear after temporary Whisper analysis.";
    elements.transcript.classList.remove("has-text");
    setRecordStatus("Ready to record again", "Replace this response before continuing.");
    setStageState("ready", `${ui.coachName} is ready to listen again`);
    resetTimer();
    updateControls();
    saveActiveSession();
    showToast("The stage is ready for a new recording.");
  }

  function markCurrentStageNotRecorded() {
    if (latestAnswerForCurrentStage()) return false;
    const stage = currentStage();
    if (!stage) return false;
    session.answers.push({
      stageId: stage.id,
      stageIndex: session.currentIndex,
      phase: session.phase,
      prompt: promptText(),
      transcript: "No response recorded before continuing.",
      durationMs: 0,
      analysis: null,
      unavailable: true,
      skipped: true,
      savedAt: new Date().toISOString()
    });
    return true;
  }

  function advanceToNextStage(toastMessage = "") {
    const nextStage = stages[session.currentIndex + 1];
    if (!nextStage) {
      completeConversation();
      return;
    }
    if (session.pendingEntryAudio) session.entryAudioByStage[nextStage.id] = session.pendingEntryAudio;
    session.currentIndex += 1;
    session.phase = "main";
    session.awaitingContinue = false;
    session.nextAction = "";
    session.pendingEntryAudio = "";
    session.pendingResponseText = "";
    renderStage(false);
    saveActiveSession();
    elements.stage.scrollIntoView({ behavior: "smooth", block: "start" });
    showToast(toastMessage || `Stage ${session.currentIndex + 1} is ready.`);
  }

  function goPrevious() {
    if (mediaRecorder?.state === "recording") {
      showToast("Finish the current recording before going back.");
      return;
    }
    if (analyzing) {
      showToast("Wait for the analysis to finish before going back.");
      return;
    }
    if (session.currentIndex === 0 && session.phase === "main") {
      showToast("You are already on the first question.");
      return;
    }
    stopCoachAudio();
    if (session.phase === "clarify") {
      session.phase = "main";
    } else {
      session.currentIndex = Math.max(0, session.currentIndex - 1);
      session.phase = "main";
    }
    session.awaitingContinue = false;
    session.nextAction = "";
    session.pendingEntryAudio = "";
    session.pendingResponseText = "";
    renderStage(false);
    saveActiveSession();
    elements.stage.scrollIntoView({ behavior: "smooth", block: "start" });
    showToast(`Moved back to stage ${session.currentIndex + 1}.`);
  }

  function goNext() {
    if (mediaRecorder?.state === "recording") {
      showToast("Finish the current recording before continuing.");
      return;
    }
    if (analyzing) {
      showToast("Wait for the analysis to finish before continuing.");
      return;
    }
    const stage = currentStage();
    if (!stage) return;
    if (stage.requiresDish && !selectedDish()) {
      showToast(ui.missingItemHelp);
      elements.activeMenuPanel.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    stopCoachAudio();
    if (session.nextAction === "clarify") {
      session.phase = "clarify";
      renderStage(false);
      saveActiveSession();
      elements.stage.scrollIntoView({ behavior: "smooth", block: "start" });
      showToast(ui.clarificationReadyToast || "Clarification ready. Record one more response.");
      return;
    }
    if (session.nextAction === "finish") {
      completeConversation();
      return;
    }
    const stageNumber = session.currentIndex + 1;
    const skippedNow = !session.awaitingContinue && markCurrentStageNotRecorded();
    advanceToNextStage(skippedNow
      ? `Stage ${stageNumber} was saved as not recorded. Continue with the next question.`
      : `Stage ${session.currentIndex + 2} is ready.`);
  }

  function criterionAverage(answers, key) {
    const values = answers.map((answer) => answer.analysis?.metrics?.[key]).filter(Number.isFinite);
    return values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : null;
  }

  function finalAnalyzedAnswers() {
    return stages.map((stage, index) => session.answers.filter((answer) => answer.stageIndex === index && answer.analysis).slice(-1)[0]).filter(Boolean);
  }

  function aggregateLowConfidence(answers) {
    const counts = new Map();
    answers.forEach((answer) => (answer.analysis?.lowConfidence || []).forEach((item) => {
      if (!isUsefulEnglishFeedbackWord(item.word)) return;
      const key = normalize(item.word);
      if (!key) return;
      const existing = counts.get(key) || { word: item.word, count: 0, probability: 1 };
      existing.count += 1;
      existing.probability = Math.min(existing.probability, item.probability);
      counts.set(key, existing);
    }));
    return [...counts.values()].sort((a, b) => b.count - a.count || a.probability - b.probability).slice(0, 10);
  }

  function readinessLabel(score) {
    if (score == null) return "Practice recorded without a score";
    const labels = ui.readinessLabels || {};
    if (score >= 43) return labels.high || "Ready for an independent schedule meeting";
    if (score >= 34) return labels.mid || "Communicative with a few priorities";
    return labels.low || "Rehearse the schedule sequence again";
  }

  function buildReport() {
    const answers = finalAnalyzedAnswers();
    const metrics = {};
    (config.rubric || []).forEach((criterion) => { metrics[criterion.key] = criterionAverage(answers, criterion.key); });
    const metricValues = Object.values(metrics).filter(Number.isFinite);
    const score = metricValues.length ? metricValues.reduce((sum, value) => sum + value, 0) : null;
    const stageScores = stages.map((stage, index) => {
      const answer = session.answers.filter((item) => item.stageIndex === index && item.analysis).slice(-1)[0];
      return answer ? Math.round(answer.analysis.total) : null;
    });
    const weakestValue = Math.min(...stageScores.filter(Number.isFinite));
    const weakStageIndex = Number.isFinite(weakestValue) ? stageScores.findIndex((value) => value === weakestValue) : 0;
    const sortedMetrics = (config.rubric || []).map((criterion) => ({ ...criterion, value: metrics[criterion.key] })).filter((item) => Number.isFinite(item.value)).sort((a, b) => b.value - a.value);
    const strengths = sortedMetrics.slice(0, 2).map((item) => `${item.label}: ${item.value}/10. ${item.description}`);
    const priorities = [...sortedMetrics].reverse().slice(0, 2).map((item) => `${item.label}: ${item.value}/10. ${item.description}`);
    if (answers.length < stages.length) priorities.unshift(`Complete English analysis for all eight stages. This attempt analyzed ${answers.length}.`);
    return {
      createdAt: new Date().toISOString(),
      mode: session.mode,
      score,
      metrics,
      analyzedCount: answers.length,
      totalStages: stages.length,
      stageScores,
      weakStageIndex,
      lowConfidence: aggregateLowConfidence(answers),
      strengths: strengths.length ? strengths : [ui.fallbackStrength],
      priorities: priorities.length ? priorities.slice(0, 3) : [ui.fallbackPriority],
      answers: session.answers,
      selectedDishId: session.selectedDishId,
      incidentId: session.incidentId,
      clientSubmissionId: createSubmissionId()
    };
  }

  function referenceGrade(score) {
    return Number.isFinite(score) ? Math.round((score / 10) * 100) / 100 : null;
  }

  function reportIsDeliverable(report) {
    return Number.isFinite(report?.score) &&
      Number(report.analyzedCount) === stages.length &&
      Number(report.totalStages) === stages.length &&
      Array.isArray(report.stageScores) &&
      report.stageScores.length === stages.length &&
      report.stageScores.every(Number.isFinite);
  }

  function reportDeliveryScore(report) {
    if (!report) return null;
    if (reportIsDeliverable(report)) return Number(report.score);
    const scores = Array.isArray(report.stageScores) ? report.stageScores.slice(0, stages.length) : [];
    const total = scores.reduce((sum, value) => {
      const score = Number(value);
      return Number.isFinite(score) ? sum + score : sum;
    }, 0);
    return Math.round(total * 100 / Math.max(stages.length, 1)) / 100;
  }

  function normalizedDeliveryMetrics(report) {
    const raw = report?.metrics || {};
    const keys = new Set(["task", "interaction", "language", "fluency", "clarity"]);
    (config.rubric || []).forEach((criterion) => {
      if (criterion?.key) keys.add(criterion.key);
    });
    return [...keys].reduce((metrics, key) => {
      const value = Number(raw[key]);
      metrics[key] = Number.isFinite(value) ? value : 0;
      return metrics;
    }, {});
  }

  function setDeliveryStatus(message, type = "pending") {
    elements.deliveryStatus.textContent = message;
    elements.deliveryStatus.className = `restaurant-delivery-status ${type}`;
  }

  function updateDelivery(report) {
    if (!elements.deliveryPanel) return;
    ensureReportSubmissionId(report);
    const completeReport = reportIsDeliverable(report);
    const deliveryScore = reportDeliveryScore(report);
    const grade = referenceGrade(deliveryScore);
    elements.deliveryScore.textContent = Number.isFinite(deliveryScore) ? `${deliveryScore}/50` : "--";
    elements.deliveryGrade.textContent = grade == null ? "--" : `${grade.toFixed(2)}/5`;

    if (report.submission?.clientSubmissionId === report.clientSubmissionId) {
      elements.deliveryPanel.classList.add("is-submitted");
      elements.deliveryButton.disabled = true;
      elements.deliveryButton.innerHTML = '<i class="bi bi-check-circle-fill"></i> Submitted to teacher';
      const submittedGrade = Number(report.submission.grade);
      const gradeText = Number.isFinite(submittedGrade) ? submittedGrade.toFixed(2) : (grade == null ? "0.00" : grade.toFixed(2));
      setDeliveryStatus(uiText(ui.deliverySuccessStatus, { grade: gradeText }), "success");
      return;
    }

    elements.deliveryPanel.classList.remove("is-submitted");
    elements.deliveryButton.disabled = submissionBusy;
    elements.deliveryButton.innerHTML = submissionBusy ? '<i class="bi bi-hourglass-split"></i> Sending to teacher...' : '<i class="bi bi-send-fill"></i> Send to teacher';
    setDeliveryStatus(
      submissionBusy ? ui.deliveryBusyStatus : uiText(completeReport ? ui.deliveryReadyStatus : ui.deliveryIncompleteStatus, { analyzed: Number(report.analyzedCount) || 0, total: stages.length }),
      submissionBusy ? "pending" : "ready"
    );
  }

  function deliveryTurns(report) {
    return (Array.isArray(report.answers) ? report.answers : []).map((answer) => {
      const stageIndex = Number(answer.stageIndex);
      const stage = stages[stageIndex] || {};
      return {
        stageIndex,
        topic: stage.topic || "",
        phase: answer.phase === "clarify" ? "clarify" : "main",
        prompt: answer.prompt || "",
        transcript: answer.transcript || "",
        score: Number.isFinite(answer.analysis?.total) ? Math.round(answer.analysis.total) : null
      };
    });
  }

  async function submitReport() {
    const report = persistent.lastReport;
    if (!report) {
      setDeliveryStatus("Create a report first, then send it to the teacher.", "error");
      showToast("Create a report first.");
      return;
    }
    const user = readUser();
    if (!user?.credential) {
      setDeliveryStatus("Sign in first with the account registered in Intermediate English.", "error");
      showToast("Sign in before sending the report.");
      openLoginPanel();
      return;
    }

    submissionBusy = true;
    updateDelivery(report);
    let failureMessage = "";
    try {
      const dish = dishById.get(report.selectedDishId);
      const incident = incidentById.get(report.incidentId);
      const completeConversation = reportIsDeliverable(report);
      const response = await fetch(submitPath, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.credential}`,
          "X-Jaralingua-Auth-Provider": user.provider || "google",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          clientSubmissionId: ensureReportSubmissionId(report),
          clientDate: new Date().toISOString().slice(0, 10),
          mode: report.mode,
          [ui.payloadItemKey]: dish?.name || "",
          [ui.payloadIncidentKey]: incident?.prompt || "",
          metrics: normalizedDeliveryMetrics(report),
          analyzedCount: report.analyzedCount,
          totalStages: report.totalStages,
          stageScores: report.stageScores,
          turns: deliveryTurns(report),
          completeConversation,
          partialSubmission: !completeConversation
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status === 401) throw new Error("Your session expired. Sign in again before sending this report.");
        if (payload.error === "student_not_authorized") throw new Error("This account is signed in but is not linked to an Intermediate English student record.");
        if (payload.error === "incomplete_conversation") throw new Error(ui.deliveryIncompleteServer);
        throw new Error("The report could not be submitted. Please try again.");
      }
      report.submission = {
        submittedAt: payload.submittedAt,
        grade: Number(payload.grade),
        attemptCount: payload.attemptCount,
        clientSubmissionId: payload.clientSubmissionId || report.clientSubmissionId,
        partialSubmission: Boolean(payload.partialSubmission)
      };
      persistent.lastReport = report;
      savePersistent();
      showToast(ui.deliverySuccessToast);
    } catch (error) {
      failureMessage = error.message || "The report could not be submitted.";
      showToast(failureMessage);
    } finally {
      submissionBusy = false;
      updateDelivery(report);
      if (failureMessage) setDeliveryStatus(failureMessage, "error");
    }
  }

  function renderHistory() {
    if (!persistent.history.length) {
      elements.attemptHistory.innerHTML = `<p>${escapeHtml(ui.historyEmpty)}</p>`;
      return;
    }
    elements.attemptHistory.innerHTML = [...persistent.history].reverse().map((item) => {
      const date = new Date(item.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
      const score = item.score == null ? "Not scored" : `${item.score}/50`;
      return `<article><div><strong>${escapeHtml(score)}</strong><span>${escapeHtml(item.mode === "real" ? ui.historyRealLabel : ui.historyGuidedLabel)}</span></div><span>${escapeHtml(date)}</span></article>`;
    }).join("");
  }

  function renderReport(report) {
    ensureReportSubmissionId(report);
    persistent.lastReport = report;
    savePersistent();
    const dish = dishById.get(report.selectedDishId);
    const incident = incidentById.get(report.incidentId);
    elements.summaryLead.textContent = uiText(ui.reportLead, { item: dish ? ` with ${dish.name}` : "", name: ui.coachName });
    elements.summaryScore.textContent = report.score == null ? "--" : report.score;
    elements.summaryReadiness.textContent = readinessLabel(report.score);
    elements.summaryComparison.textContent = report.score == null ? "No automatic score was created because no usable English transcription was available." : ui.reportComparison;
    elements.summaryCoverage.textContent = reportIsDeliverable(report)
      ? uiText(ui.reportCoverageReady, { analyzed: report.analyzedCount, total: report.totalStages })
      : uiText(ui.reportCoverageIncomplete, { analyzed: report.analyzedCount, total: report.totalStages });
    elements.summaryMetrics.innerHTML = (config.rubric || []).map((criterion) => `<article class="coach-summary-metric"><strong>${report.metrics[criterion.key] ?? "--"}</strong><span>${escapeHtml(criterion.label)} /10</span><p>${escapeHtml(criterion.description)}</p></article>`).join("");
    elements.summaryStrengths.innerHTML = report.strengths.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
    elements.summaryPriorities.innerHTML = report.priorities.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
    elements.summaryWords.innerHTML = report.lowConfidence.length ? report.lowConfidence.map((item) => `<span>${escapeHtml(item.word)}</span>`).join("") : "<small>No repeated low-confidence English words were identified in this attempt.</small>";
    elements.summaryAnswers.innerHTML = stages.map((stage, stageIndex) => {
      const attempts = report.answers.filter((answer) => answer.stageIndex === stageIndex);
      const attemptsMarkup = attempts.length ? attempts.map((answer) => {
        const label = answer.phase === "clarify" ? "Clarification response" : "Initial response";
        const score = answer.analysis ? `${Math.round(answer.analysis.total)}/50` : "Not analyzed";
        return `<div class="coach-answer-phase"><div class="coach-answer-phase-heading"><strong>${escapeHtml(label)}</strong><span>${escapeHtml(score)}</span></div><p><strong>${escapeHtml(ui.coachName)}:</strong> ${escapeHtml(answer.prompt)}</p><p><strong>You:</strong> ${escapeHtml(answer.transcript)}</p></div>`;
      }).join("") : '<p>No analyzed or preserved response for this stage.</p>';
      const context = (stage.id === "schedule-pushback" || stage.id === "service-problem") && incident ? `<p><strong>Scenario:</strong> ${escapeHtml(incident.prompt)}</p>` : "";
      return `<article><h3><span class="coach-answer-score">${report.stageScores[stageIndex] == null ? "--" : `${report.stageScores[stageIndex]}/50`}</span>Stage ${stageIndex + 1}: ${escapeHtml(stage.topic)}</h3>${context}${attemptsMarkup}<p class="coach-model"><strong>Stronger model:</strong><br>${escapeHtml(strongerModel(stage, { selectedDishId: report.selectedDishId, incidentId: report.incidentId }))}</p></article>`;
    }).join("");
    renderHistory();
    updateDelivery(report);
  }

  function completeConversation() {
    stopCoachAudio();
    releaseCurrentRecording();
    const report = buildReport();
    persistent.lastReport = report;
    persistent.history = [...persistent.history, {
      createdAt: report.createdAt,
      score: report.score,
      mode: report.mode,
      analyzedCount: report.analyzedCount
    }].slice(-8);
    persistent.selectedDishId = report.selectedDishId || persistent.selectedDishId;
    persistent.activeSession = null;
    savePersistent();
    renderReport(report);
    showPanel("summary");
    elements.summary.scrollIntoView({ behavior: "smooth", block: "start" });
    showToast(ui.reportReadyToast || "Report ready. Nothing is sent until you choose Send to teacher.");
  }

  function reviewLatest() {
    if (!persistent.lastReport) return;
    renderReport(persistent.lastReport);
    showPanel("summary");
    elements.summary.scrollIntoView({ behavior: "smooth", block: "start" });
    showToast(ui.latestReportToast || "Latest report opened.");
  }

  function resumeActiveSession() {
    const draft = sanitizeSessionDraft(persistent.activeSession);
    if (!draft) {
      persistent.activeSession = null;
      savePersistent();
      refreshOnboarding();
      showToast("No saved exchange was found on this device.");
      return;
    }
    session = { ...freshSession(draft.mode), ...draft };
    showPanel("interview");
    renderStage(false);
    saveActiveSession();
    elements.interview.scrollIntoView({ behavior: "smooth", block: "start" });
    showToast(`Saved exchange restored at stage ${session.currentIndex + 1}.`);
  }

  function handleSavedAction() {
    if (elements.reviewPrevious.dataset.action === "resume" && persistent.activeSession) {
      resumeActiveSession();
      return;
    }
    reviewLatest();
  }

  function clearHistory() {
    persistent.history = [];
    savePersistent();
    renderHistory();
    showToast(ui.historyClearedToast || "Attempt history cleared from this device.");
  }

  function restartGuided() {
    showPanel("onboarding");
    elements.guidedMode.checked = true;
    elements.onboarding.scrollIntoView({ behavior: "smooth", block: "start" });
    showToast(ui.guidedRestartToast || "Guided Rehearsal is selected for your next full conversation.");
  }

  document.addEventListener("click", (event) => {
    const speed = event.target.closest("[data-coach-speed]");
    if (speed) {
      updateSpeed(speed.dataset.coachSpeed);
      return;
    }
    const dishAudio = event.target.closest("[data-dish-audio]");
    if (dishAudio) {
      playDishName(dishAudio.dataset.dishAudio);
      return;
    }
    const dishSelect = event.target.closest("[data-dish-select]");
    if (dishSelect) chooseDish(dishSelect.dataset.dishSelect);
  });

  elements.welcomePlay.addEventListener("click", () => playAudio(elements.welcomeAudio, config.audio?.welcome));
  elements.instructionsPlay.addEventListener("click", () => playAudio(elements.instructionsAudio, config.audio?.instructions));
  elements.preflight.addEventListener("click", testMicrophone);
  elements.start.addEventListener("click", () => beginConversation());
  elements.reviewPrevious.addEventListener("click", handleSavedAction);
  elements.questionPlay.addEventListener("click", playQuestion);
  elements.mic.addEventListener("click", startRecording);
  elements.floatingMic.addEventListener("click", startRecording);
  elements.stop.addEventListener("click", stopRecording);
  elements.floatingStop.addEventListener("click", stopRecording);
  elements.recordAgain.addEventListener("click", recordAgain);
  elements.recoveryRecordAgain.addEventListener("click", recordAgain);
  elements.retryTranscription.addEventListener("click", transcribeCurrentRecording);
  elements.continueUnscored.addEventListener("click", continueWithoutScore);
  if (elements.previous) elements.previous.addEventListener("click", goPrevious);
  elements.next.addEventListener("click", goNext);
  elements.restart.addEventListener("click", () => beginConversation(session.mode));
  elements.weakPractice.addEventListener("click", restartGuided);
  elements.closingPlay.addEventListener("click", () => playAudio(elements.reactionAudio, stages.at(-1)?.complete?.file));
  elements.clearHistory.addEventListener("click", clearHistory);
  elements.deliveryButton.addEventListener("click", submitReport);
  elements.microphoneSelect.addEventListener("change", () => showToast(elements.microphoneSelect.value ? "Selected microphone ready." : "Default microphone selected."));

  navigator.mediaDevices?.addEventListener?.("devicechange", refreshMicrophones);
  window.addEventListener("beforeunload", () => {
    stopCoachAudio();
    stopTracks();
    stopLevelMeter();
    if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl);
    if (preflightObjectUrl) URL.revokeObjectURL(preflightObjectUrl);
  });

  if (!stages.length || !dishes.length || !elements.start) return;
  refreshOnboarding();
  refreshMicrophones();
  updateSpeed(1, false);
  showPanel("onboarding");
  updateControls();
})();
