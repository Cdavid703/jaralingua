(() => {
  "use strict";

  const config = window.JaraLinguaConversationCoachConfig || {};
  const questions = Array.isArray(config.questions) ? config.questions : [];
  const questionById = new Map(questions.map((question) => [question.id, question]));
  const storageKey = config.storageKey || "jaralingua:conversation-coach:v2";
  const apiPath = config.apiPath || "/api/english-intermediate/pronunciation-assessment";
  const audioRoot = config.audioRoot || "";
  const maxRecordingSeconds = Number(config.maxRecordingSeconds) || 40;
  const transcriptionTimeoutMs = 30000;
  const coachName = config.character?.name || "Maya Brooks";
  const coachFirstName = coachName.split(/\s+/)[0] || "Maya";
  const unitShortLabel = config.unitLabel || "the unit";
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
    next: $("nextTurnButton"),
    summaryLead: $("summaryLead"),
    summaryScore: $("summaryScore"),
    summaryReadiness: $("summaryReadiness"),
    summaryComparison: $("summaryComparison"),
    summaryCoverage: $("summaryCoverage"),
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

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[char]);
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
        lastReport: parsed.lastReport && typeof parsed.lastReport === "object" ? parsed.lastReport : null
      };
    } catch {
      return { history: [], lastReport: null };
    }
  }

  function savePersistent() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(persistent));
    } catch {
      // Local practice history is optional.
    }
  }

  function freshSession(ids = [], mode = "guided") {
    return { questionIds: ids, currentIndex: 0, answers: [], mode, phase: "main", activeFollowUp: null, startedAt: "" };
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

  function shuffled(values) {
    const copy = [...values];
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const target = randomIndex(index + 1);
      [copy[index], copy[target]] = [copy[target], copy[index]];
    }
    return copy;
  }

  function selectBalancedQuestions() {
    const selected = [];
    (config.selectionGroups || []).forEach((group) => {
      const available = shuffled((group.questionIds || []).filter((id) => questionById.has(id)));
      selected.push(...available.slice(0, Number(group.count) || 1));
    });
    (config.mandatoryQuestionIds || []).forEach((id) => {
      if (questionById.has(id) && !selected.includes(id)) selected.push(id);
    });
    return selected.slice(0, Number(config.attemptQuestionCount) || selected.length);
  }

  function currentQuestion() {
    return questionById.get(session.questionIds[session.currentIndex]);
  }

  function currentTurn() {
    return session.answers[session.currentIndex] || null;
  }

  function currentPrompt() {
    return session.phase === "followup" && session.activeFollowUp ? session.activeFollowUp : currentQuestion();
  }

  function currentPhaseAnswer() {
    const turn = currentTurn();
    if (!turn) return null;
    return session.phase === "followup" ? turn.followUp : turn.main;
  }

  function turnIsComplete() {
    const question = currentQuestion();
    const turn = currentTurn();
    if (!question || !turn?.main) return false;
    return question.interaction || !question.followUpSet || Boolean(turn.followUp);
  }

  function audioPath(file) {
    return file ? `${audioRoot}${file}` : "";
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
    document.body.classList.toggle("has-floating-dock", inConversation);
  }

  function setStage(state, label) {
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

  function updateSpeed(nextSpeed, notify = true) {
    playbackSpeed = Number(nextSpeed) || 1;
    document.querySelectorAll("[data-coach-speed]").forEach((button) => {
      button.classList.toggle("is-active", Number(button.dataset.coachSpeed) === playbackSpeed);
    });
    [elements.welcomeAudio, elements.instructionsAudio, elements.questionAudio, elements.reactionAudio].forEach((audio) => {
      if (audio) audio.playbackRate = playbackSpeed;
    });
    if (notify) showToast(`Audio speed set to ${playbackSpeed}x.`);
  }

  function stopCoachAudio() {
    [elements.welcomeAudio, elements.instructionsAudio, elements.questionAudio, elements.reactionAudio].forEach((audio) => {
      if (!audio) return;
      audio.pause();
      audio.currentTime = 0;
    });
    audioBusy = false;
  }

  async function playAudio(audio, file, options = {}) {
    if (!audio || !file) return false;
    stopCoachAudio();
    audioBusy = true;
    audio.src = audioPath(file);
    audio.playbackRate = playbackSpeed;
    if (options.stageState) setStage(options.stageState, options.stageLabel || `${coachFirstName} is speaking`);
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
      if (options.restoreStage !== false && !analyzing && mediaRecorder?.state !== "recording") setStage("ready", `${coachFirstName} is ready`);
      updateControls();
    }
  }

  async function playQuestion() {
    const prompt = currentPrompt();
    if (!prompt || audioBusy || mediaRecorder?.state === "recording") return;
    showToast(session.phase === "followup" ? `${coachFirstName}'s follow-up is playing.` : `${coachFirstName}'s question is playing.`);
    await playAudio(elements.questionAudio, prompt.audio, { stageState: "speaking", stageLabel: session.phase === "followup" ? `${coachFirstName} is asking a follow-up` : `${coachFirstName} is asking the question` });
  }

  async function playAudioQueue(entries) {
    for (const entry of entries) {
      await playAudio(elements.reactionAudio, entry.file, { stageState: "responding", stageLabel: `${coachFirstName} is responding`, restoreStage: false });
    }
    setStage("ready", `${coachFirstName} is ready for the next turn`);
  }

  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
    const remainder = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${minutes}:${remainder}`;
  }

  function recordingLimit() {
    return Number(currentPrompt()?.maxSeconds) || maxRecordingSeconds;
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

  function refreshOnboarding() {
    elements.welcomeAudio.src = audioPath(config.audio?.welcome);
    elements.instructionsAudio.src = audioPath(config.audio?.instructions);
    if (!persistent.lastReport) return;
    elements.reviewPrevious.hidden = false;
    elements.resumeNote.hidden = false;
    const score = persistent.lastReport.score == null ? "not scored" : `${persistent.lastReport.score}/50`;
    elements.resumeNote.textContent = `Latest private result on this device: ${score}. You can review it or begin another unlimited attempt.`;
  }

  function renderQuestion(autoplay = true) {
    const question = currentQuestion();
    if (!question) return;
    releaseCurrentRecording();
    session.phase = "main";
    session.activeFollowUp = null;
    const total = session.questionIds.length;
    elements.counter.textContent = `Turn ${session.currentIndex + 1} of ${total}`;
    elements.floatingTurn.textContent = `Turn ${session.currentIndex + 1} of ${total}`;
    elements.topic.textContent = question.topic || config.unitLabel || "Unit conversation";
    elements.progress.style.width = `${Math.round(((session.currentIndex + 1) / total) * 100)}%`;
    elements.questionText.textContent = question.text;
    elements.questionAudio.src = audioPath(question.audio);
    elements.questionAudio.playbackRate = playbackSpeed;
    elements.frames.innerHTML = (question.frames || []).map((frame) => `<div class="coach-frame">${escapeHtml(frame)}</div>`).join("");
    elements.vocabulary.innerHTML = (question.vocabulary || []).map((item) => `<span>${escapeHtml(item)}</span>`).join("");
    elements.grammar.textContent = question.grammar || "";
    elements.support.open = session.mode === "guided";
    elements.supportLabel.textContent = session.mode === "guided" ? "Use, then personalize" : "Optional support";
    elements.feedback.hidden = true;
    elements.feedback.innerHTML = "";
    elements.recovery.hidden = true;
    elements.reaction.hidden = true;
    elements.transcript.textContent = "Your transcript will appear after temporary Whisper analysis.";
    elements.transcript.classList.remove("has-text");
    elements.studentAudio.hidden = true;
    elements.studentAudio.removeAttribute("src");
    elements.unsupported.hidden = true;
    elements.next.disabled = true;
    elements.recordAgain.disabled = true;
    resetTimer();
    setRecordStatus("Ready for your answer", question.interaction ? (config.ui?.interactionRecordHelp || `Ask ${coachFirstName} two different questions in English.`) : "Tap the microphone and answer in English.");
    setStage("ready", `${coachFirstName} is ready`);
    updateControls();
    if (autoplay) window.setTimeout(playQuestion, 250);
  }

  function beginConversation(ids = null, forcedMode = null) {
    const questionIds = (ids || selectBalancedQuestions()).filter((id) => questionById.has(id));
    if (!questionIds.length) {
      showToast("The question bank is unavailable.");
      return;
    }
    const mode = forcedMode || (elements.realMode.checked ? "real" : "guided");
    session = freshSession(questionIds, mode);
    session.startedAt = new Date().toISOString();
    showPanel("interview");
    renderQuestion(true);
    elements.interview.scrollIntoView({ behavior: "smooth", block: "start" });
    showToast(`${mode === "guided" ? "Guided Rehearsal" : "Real Conversation"} started.`);
  }

  async function refreshMicrophones() {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    try {
      const previous = elements.microphoneSelect.value;
      const devices = (await navigator.mediaDevices.enumerateDevices()).filter((device) => device.kind === "audioinput");
      elements.microphoneSelect.innerHTML = '<option value="">Default microphone</option>' + devices.map((device, index) => `<option value="${escapeHtml(device.deviceId)}">${escapeHtml(device.label || `Microphone ${index + 1}`)}</option>`).join("");
      if ([...elements.microphoneSelect.options].some((option) => option.value === previous)) elements.microphoneSelect.value = previous;
    } catch {
      // Browser may hide device labels until permission is granted.
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
    elements.preflightStatus.textContent = config.ui?.preflightRecording || "Recording a three-second microphone test. Say: This is my conversation test.";
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
      elements.preflightStatus.textContent = "Microphone test recorded. Play it now and confirm that your voice is clear.";
      elements.preflight.textContent = "Test again";
      await refreshMicrophones();
      showToast("Microphone test completed. Play your recording.");
    } catch (error) {
      elements.preflightStatus.textContent = microphoneError(error);
      showToast("The microphone test needs attention.");
    } finally {
      elements.preflight.disabled = false;
    }
  }

  function stopTracks() {
    if (mediaStream) mediaStream.getTracks().forEach((track) => track.stop());
    mediaStream = null;
  }

  function stopLevelMeter() {
    if (levelFrame) cancelAnimationFrame(levelFrame);
    levelFrame = null;
    if (levelContext) levelContext.close().catch(() => {});
    levelContext = null;
    levelAnalyser = null;
    elements.levelBar.style.width = "0";
    elements.levelValue.textContent = "Waiting";
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
        const average = data.reduce((sum, value) => sum + value, 0) / data.length;
        const percent = Math.min(100, Math.round(average * 1.6));
        elements.levelBar.style.width = `${percent}%`;
        elements.levelValue.textContent = percent > 12 ? "Active" : "Very low";
        levelFrame = requestAnimationFrame(tick);
      };
      tick();
    } catch {
      elements.levelValue.textContent = "Active";
    }
  }

  function updateControls() {
    const recording = mediaRecorder?.state === "recording";
    const hasAnswer = Boolean(currentPhaseAnswer());
    const locked = analyzing || audioBusy;
    elements.mic.disabled = recording || locked || hasAnswer;
    elements.stop.disabled = !recording;
    elements.recordAgain.disabled = recording || analyzing || (!currentBlob && !hasAnswer);
    elements.questionPlay.disabled = recording || locked;
    elements.next.disabled = !turnIsComplete() || recording || locked;
    elements.microphoneSelect.disabled = recording || analyzing;
    elements.floatingMic.hidden = recording;
    elements.floatingStop.hidden = !recording;
    elements.floatingMic.disabled = locked || hasAnswer;
    elements.floatingStop.disabled = !recording;
  }

  async function startRecording() {
    if (mediaRecorder?.state === "recording" || analyzing || audioBusy || currentPhaseAnswer()) return;
    stopCoachAudio();
    elements.unsupported.hidden = true;
    try {
      mediaStream = await requestStream();
      await refreshMicrophones();
      startLevelMeter(mediaStream);
      recordedChunks = [];
      const mimeType = preferredMimeType();
      mediaRecorder = mimeType ? new MediaRecorder(mediaStream, { mimeType }) : new MediaRecorder(mediaStream);
      mediaRecorder.ondataavailable = (event) => { if (event.data?.size) recordedChunks.push(event.data); };
      mediaRecorder.onstop = handleRecordingStopped;
      recordingStartedAt = Date.now();
      recordingDurationMs = 0;
      mediaRecorder.start();
      elements.mic.classList.add("is-recording");
      setStage("listening", `${coachFirstName} is listening`);
      setRecordStatus("Recording your answer", "Speak naturally. Finish before the timer reaches the limit.");
      timerHandle = window.setInterval(updateTimer, 250);
      autoStopHandle = window.setTimeout(stopRecording, recordingLimit() * 1000);
      updateTimer();
      updateControls();
      showToast("Recording started.");
    } catch (error) {
      const message = microphoneError(error);
      elements.unsupported.hidden = false;
      elements.unsupported.innerHTML = `<strong>Microphone unavailable</strong><br>${escapeHtml(message)}`;
      setRecordStatus("Microphone unavailable", message);
      setStage("ready", `${coachFirstName} is waiting while you check the microphone`);
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
    setRecordStatus("Preparing your recording", "Your answer will be checked by the temporary transcription service.");
    updateControls();
    showToast("Recording finished. Preparing analysis.");
  }

  async function handleRecordingStopped() {
    stopTracks();
    currentBlob = new Blob(recordedChunks, { type: mediaRecorder?.mimeType || "audio/webm" });
    recordedChunks = [];
    if (currentBlob.size < 700 || recordingDurationMs < 700) {
      currentBlob = null;
      setRecordStatus("The recording was too short", "Record a complete answer of several seconds before finishing.");
      setStage("ready", `${coachFirstName} did not hear a complete answer`);
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

  function countQuestionStarters(text) {
    const normalized = normalize(text);
    const auxiliary = "(?:is|are|do|does|did|can|would|could|should|will|have|has)";
    const starterPattern = new RegExp(`\\b(?:what'?s|what\\s+${auxiliary}|how\\s+(?:${auxiliary}|much|many|old|far|long|often)|where\\s+${auxiliary}|why\\s+${auxiliary}|who\\s+${auxiliary}|which\\s+\\w+|${auxiliary}\\s+(?:i|you|we|they|he|she|it))\\b`, "g");
    return (normalized.match(starterPattern) || []).length;
  }

  function evaluateCheck(transcript, check) {
    const normalized = normalize(transcript);
    const checkType = check.kind || check.type;
    if (checkType === "question-starters" || checkType === "questionStarters") {
      const matches = countQuestionStarters(normalized);
      const needed = Number(check.minMatches) || 2;
      return { label: check.label, met: matches >= needed, matches };
    }
    const terms = (check.terms || []).filter((term) => normalized.includes(normalize(term)));
    const needed = Number(check.minMatches) || 1;
    return { label: check.label, met: terms.length >= needed, matches: terms.length };
  }

  function clampScore(value) {
    return Math.max(1, Math.min(10, Math.round(value)));
  }

  function analyzeAnswer(transcript, durationMs, whisperWords, question) {
    const normalized = normalize(transcript);
    const wordCount = countWords(transcript);
    const seconds = Math.max(1, durationMs / 1000);
    const checks = (question.checks || []).map((check) => evaluateCheck(transcript, check));
    const metChecks = checks.filter((check) => check.met).length;
    const checkRatio = checks.length ? metChecks / checks.length : .65;
    const minWords = Math.max(1, Number(question.minWords) || 12);
    const lengthRatio = Math.min(1, wordCount / minWords);
    const questionStarterCount = countQuestionStarters(normalized);
    const connectorCount = ["because", "but", "however", "while", "and", "so"].filter((term) => normalized.includes(term)).length;
    const unitMatchCount = (question.unitTerms || []).filter((term) => normalized.includes(normalize(term))).length;
    const wordsPerMinute = (wordCount / seconds) * 60;
    const whisperEvidence = cleanWhisperWords(whisperWords);
    const clearWords = String(config.language || "").toLowerCase() === "en"
      ? whisperEvidence.filter((item) => isUsefulEnglishFeedbackWord(item.word))
      : whisperEvidence;
    const averageConfidence = clearWords.length ? clearWords.reduce((sum, item) => sum + item.probability, 0) / clearWords.length : .72;

    const task = clampScore(2 + checkRatio * 6 + lengthRatio * 2);
    const interaction = question.interaction
      ? clampScore(2 + Math.min(2, questionStarterCount) * 3 + checkRatio * 2)
      : clampScore(4 + checkRatio * 3 + Math.min(2, connectorCount) + lengthRatio);
    const language = clampScore(3 + Math.min(4, unitMatchCount * 1.5) + checkRatio * 2 + Math.min(1, connectorCount));
    const paceValue = wordsPerMinute >= 60 && wordsPerMinute <= 165 ? 4 : wordsPerMinute >= 40 && wordsPerMinute <= 190 ? 2.5 : 1;
    const fluency = clampScore(2 + paceValue + lengthRatio * 3 + (seconds >= 6 ? 1 : 0));
    const clarity = clampScore(averageConfidence * 10);
    const metrics = { task, interaction, language, fluency, clarity };
    const total = Object.values(metrics).reduce((sum, value) => sum + value, 0);
    const lowConfidence = clearWords.filter((item) => item.probability < .68).slice(0, 8);
    const missing = checks.filter((check) => !check.met).map((check) => check.label);
    const message = total >= 43
      ? "Your answer is detailed, relevant, and ready for a more independent attempt."
      : total >= 34
        ? `Your answer communicates the main idea. ${missing.length ? `Add ${missing[0]} next time.` : `Add one more precise ${unitShortLabel} expression next time.`}`
        : `Build the answer again with a complete structure${missing.length ? ` and include ${missing[0]}` : " and one specific detail"}.`;
    return { total, metrics, checks, wordCount, durationSeconds: Math.round(seconds), wordsPerMinute: Math.round(wordsPerMinute), lowConfidence, message };
  }

  function feedbackMarkup(answer, question) {
    const metrics = (config.rubric || []).map((criterion) => `<div class="coach-feedback-metric"><strong>${answer.analysis.metrics[criterion.key]}</strong><span>${escapeHtml(criterion.label)} /10</span></div>`).join("");
    const checks = answer.analysis.checks.map((check) => `<span class="coach-check ${check.met ? "is-met" : ""}"><i class="bi ${check.met ? "bi-check-circle-fill" : "bi-circle"}"></i> ${escapeHtml(check.label)}</span>`).join("");
    const lowWords = answer.analysis.lowConfidence.length ? `<p class="coach-feedback-copy"><strong>Repeat more clearly:</strong> ${answer.analysis.lowConfidence.map((item) => escapeHtml(item.word)).join(", ")}. This is only a transcription-confidence signal.</p>` : "";
    return `<div class="coach-feedback-grid">${metrics}</div><div class="coach-checks">${checks}</div><p class="coach-feedback-copy">${escapeHtml(answer.analysis.message)}</p>${lowWords}<p class="coach-model"><strong>Stronger model:</strong><br>${escapeHtml(question.improved || "")}</p>`;
  }

  function roleReversalResponses(transcript) {
    const normalized = normalize(transcript);
    const matches = (config.interactionResponses || []).filter((response) => (response.terms || []).some((term) => normalized.includes(normalize(term))));
    if (matches.length) return matches.slice(0, 2);
    return config.defaultInteractionResponse ? [config.defaultInteractionResponse] : [];
  }

  function evidenceResponses(transcript, entries = []) {
    const normalized = normalize(transcript);
    const matches = entries.filter((entry) => (entry.terms || []).some((term) => normalized.includes(normalize(term))));
    return matches.length ? matches.slice(0, 2) : [];
  }

  function responseEntries(answer, question, evaluatedPrompt = question) {
    if (question.interaction) return roleReversalResponses(answer.transcript);
    const complete = answer.analysis.checks.every((check) => check.met) && answer.analysis.wordCount >= Number(evaluatedPrompt.minWords || 0);
    const evidenceMatched = evidenceResponses(answer.transcript, question.reactionResponses || config.reactionResponses || []);
    if (complete && evidenceMatched.length) return evidenceMatched;
    return [complete && question.reaction ? question.reaction : config.audio.needDetail].filter(Boolean);
  }

  async function presentMayaResponse(answer, question, evaluatedPrompt = question) {
    const entries = responseEntries(answer, question, evaluatedPrompt);
    if (!entries.length) return;
    elements.reactionText.textContent = entries.map((entry) => entry.text).join(" ");
    elements.reaction.hidden = false;
    setRecordStatus("Answer analyzed", question.interaction ? `Listen to ${coachFirstName} answer the topics she recognized.` : `Listen to ${coachFirstName}'s response, then continue.`);
    await playAudioQueue(entries);
  }

  function chooseAdaptiveFollowUp(answer, question) {
    const set = config.followUpSets?.[question.followUpSet];
    if (!set) return null;
    const complete = Boolean(answer?.analysis)
      && answer.analysis.checks.every((check) => check.met)
      && answer.analysis.wordCount >= Number(question.minWords || 0);
    return complete ? set.complete : set.incomplete;
  }

  function renderAdaptiveFollowUp(followUp) {
    releaseCurrentRecording();
    session.phase = "followup";
    session.activeFollowUp = followUp;
    const total = session.questionIds.length;
    elements.counter.textContent = `Turn ${session.currentIndex + 1} of ${total} - Follow-up`;
    elements.floatingTurn.textContent = `Turn ${session.currentIndex + 1} follow-up`;
    elements.topic.textContent = `${currentQuestion().topic} - ${coachFirstName}'s follow-up`;
    elements.questionText.textContent = followUp.text;
    elements.questionAudio.src = audioPath(followUp.audio);
    elements.questionAudio.playbackRate = playbackSpeed;
    elements.frames.innerHTML = (followUp.frames || []).map((frame) => `<div class="coach-frame">${escapeHtml(frame)}</div>`).join("");
    elements.vocabulary.innerHTML = (followUp.vocabulary || []).map((item) => `<span>${escapeHtml(item)}</span>`).join("");
    elements.grammar.textContent = followUp.grammar || "";
    elements.support.open = session.mode === "guided";
    elements.supportLabel.textContent = session.mode === "guided" ? "Follow-up support" : "Optional support";
    elements.recovery.hidden = true;
    elements.reaction.hidden = false;
    elements.reactionText.textContent = followUp.text;
    elements.transcript.textContent = "Your follow-up transcript will appear after temporary Whisper analysis.";
    elements.transcript.classList.remove("has-text");
    elements.studentAudio.hidden = true;
    elements.studentAudio.removeAttribute("src");
    elements.unsupported.hidden = true;
    elements.next.disabled = true;
    elements.recordAgain.disabled = true;
    resetTimer();
    setRecordStatus(`${coachFirstName} has a follow-up`, "Listen, then give a short second response in English.");
    setStage("speaking", `${coachFirstName} is asking a follow-up`);
    updateControls();
  }

  async function presentAdaptiveFollowUp(answer, question) {
    const followUp = chooseAdaptiveFollowUp(answer, question);
    if (!followUp) {
      await presentMayaResponse(answer, question);
      return;
    }
    renderAdaptiveFollowUp(followUp);
    showToast(`${coachFirstName} selected a follow-up from your answer evidence.`);
    await playQuestion();
    setRecordStatus("Ready for the follow-up", `Answer ${coachFirstName}'s new question in approximately fifteen to twenty seconds.`);
    updateControls();
  }

  async function transcribeCurrentRecording() {
    if (!currentBlob || analyzing) return;
    analyzing = true;
    elements.recovery.hidden = true;
    elements.feedback.hidden = true;
    elements.transcript.textContent = "Analyzing your temporary recording. Please wait.";
    setRecordStatus("Checking your English answer", "Whisper is transcribing the recording. No score is created without usable speech.");
    setStage("analyzing", `${coachFirstName} is checking your answer`);
    updateControls();
    try {
      const payload = await requestTranscription(currentBlob);
      const transcript = String(payload.text || payload.transcript || "").trim();
      if (!transcript) {
        const silent = Number(payload.audio?.rms || 0) < .0008;
        throw new Error(silent ? "The recording arrived silent. Choose another microphone and try again." : "Speech was detected, but no clear English words were transcribed.");
      }
      const question = currentQuestion();
      const prompt = currentPrompt();
      const whisperWords = cleanWhisperWords(payload.words);
      const analysis = analyzeAnswer(transcript, recordingDurationMs, whisperWords, prompt);
      const answer = { questionId: question.id, promptId: prompt.id || question.id, prompt: prompt.text, transcript, durationMs: recordingDurationMs, analysis, unavailable: false };
      const turn = currentTurn() || { questionId: question.id, main: null, followUpPrompt: null, followUp: null };
      if (session.phase === "followup") {
        turn.followUpPrompt = prompt;
        turn.followUp = answer;
      } else {
        turn.main = answer;
      }
      session.answers[session.currentIndex] = turn;
      elements.transcript.textContent = transcript;
      elements.transcript.classList.add("has-text");
      if (session.mode === "guided") {
        elements.feedback.innerHTML = feedbackMarkup(answer, prompt);
        elements.feedback.hidden = false;
      }
      showToast(session.phase === "followup" ? `Follow-up transcribed successfully. ${coachFirstName} is responding.` : `Answer transcribed successfully. ${coachFirstName} is responding.`);
      analyzing = false;
      if (session.phase === "main" && question.followUpSet && !question.interaction) await presentAdaptiveFollowUp(answer, question);
      else await presentMayaResponse(answer, question, prompt);
    } catch (error) {
      const message = error.name === "AbortError" ? "The transcription service took too long to answer." : (error.message || "The transcription service is unavailable.");
      const noSpeechIssue = /silent|no clear english words|no clear words/i.test(message);
      elements.transcript.textContent = message;
      elements.recovery.hidden = false;
      setRecordStatus("Analysis did not finish", "Retry the analysis, record again, or continue without a score for this turn.");
      setStage("ready", `${coachFirstName} is waiting for your decision`);
      showToast("No score was created for this recording.");
      if (noSpeechIssue && config.audio?.noSpeech) {
        analyzing = false;
        elements.reactionText.textContent = config.audio.noSpeech.text;
        elements.reaction.hidden = false;
        await playAudioQueue([config.audio.noSpeech]);
      }
    } finally {
      analyzing = false;
      updateControls();
    }
  }

  async function continueWithoutScore() {
    if (!currentBlob || analyzing) return;
    const question = currentQuestion();
    const prompt = currentPrompt();
    const answer = { questionId: question.id, promptId: prompt.id || question.id, prompt: prompt.text, transcript: "", durationMs: recordingDurationMs, analysis: null, unavailable: true };
    const turn = currentTurn() || { questionId: question.id, main: null, followUpPrompt: null, followUp: null };
    if (session.phase === "followup") {
      turn.followUpPrompt = prompt;
      turn.followUp = answer;
    } else {
      turn.main = answer;
    }
    session.answers[session.currentIndex] = turn;
    elements.transcript.textContent = session.phase === "followup" ? "This follow-up was kept for playback but was not transcribed or scored." : "This response was kept for playback but was not transcribed or scored.";
    elements.transcript.classList.add("has-text");
    elements.recovery.hidden = true;
    elements.feedback.hidden = true;
    const bridge = config.audio?.serviceRecovery;
    if (bridge) {
      elements.reactionText.textContent = bridge.text;
      elements.reaction.hidden = false;
      await playAudioQueue([bridge]);
    }
    setRecordStatus("Turn marked as not analyzed", "No words or score were invented. You may continue.");
    showToast("Turn saved without a score.");
    if (session.phase === "main" && question.followUpSet && !question.interaction) await presentAdaptiveFollowUp(null, question);
    updateControls();
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
    recordingDurationMs = 0;
    recordedChunks = [];
  }

  function recordAgain() {
    if (mediaRecorder?.state === "recording" || analyzing) return;
    stopCoachAudio();
    const turn = currentTurn();
    if (session.phase === "followup" && turn) turn.followUp = null;
    else session.answers[session.currentIndex] = null;
    releaseCurrentRecording();
    elements.studentAudio.hidden = true;
    elements.studentAudio.removeAttribute("src");
    elements.transcript.textContent = "Your new transcript will appear after temporary Whisper analysis.";
    elements.transcript.classList.remove("has-text");
    elements.feedback.hidden = true;
    elements.feedback.innerHTML = "";
    elements.recovery.hidden = true;
    elements.reaction.hidden = true;
    elements.next.disabled = true;
    resetTimer();
    setRecordStatus("Ready for a new recording", "Tap the microphone and give a complete answer.");
    setStage("ready", `${coachFirstName} is ready for your new answer`);
    updateControls();
    elements.mic.focus();
    showToast("Previous recording cleared. You can answer again.");
  }

  function nextTurn() {
    if (!turnIsComplete() || analyzing || audioBusy || mediaRecorder?.state === "recording") return;
    if (session.currentIndex < session.questionIds.length - 1) {
      session.currentIndex += 1;
      renderQuestion(true);
      elements.interview.scrollIntoView({ behavior: "smooth", block: "start" });
      showToast(`Turn ${session.currentIndex + 1} is ready.`);
      return;
    }
    completeConversation();
  }

  function criterionAverage(answers, key) {
    const analyzed = answers.filter((answer) => answer.analysis);
    if (!analyzed.length) return null;
    return Math.round(analyzed.reduce((sum, answer) => sum + answer.analysis.metrics[key], 0) / analyzed.length);
  }

  function turnResponses(turn) {
    if (!turn) return [];
    if (Object.prototype.hasOwnProperty.call(turn, "main")) return [turn.main, turn.followUp].filter(Boolean);
    return [turn];
  }

  function turnAverage(turn) {
    const analyzed = turnResponses(turn).filter((answer) => answer.analysis);
    if (!analyzed.length) return null;
    return Math.round(analyzed.reduce((sum, answer) => sum + answer.analysis.total, 0) / analyzed.length);
  }

  function aggregateLowConfidence(answers) {
    const grouped = new Map();
    answers.forEach((answer) => (answer.analysis?.lowConfidence || []).forEach((item) => {
      const key = normalize(item.word);
      if (!key) return;
      const current = grouped.get(key) || { word: item.word, total: 0, count: 0 };
      current.total += item.probability;
      current.count += 1;
      grouped.set(key, current);
    }));
    return [...grouped.values()].map((item) => ({ word: item.word, probability: item.total / item.count })).sort((a, b) => a.probability - b.probability).slice(0, 10);
  }

  function readinessLabel(score) {
    if (score == null) return "No analyzed turns";
    if (score >= 44) return "Strong conversational readiness";
    if (score >= 37) return "Developing confidently";
    if (score >= 29) return "Useful foundation";
    return "Rehearse with support";
  }

  const strengthMessages = {
    task: config.ui?.taskStrength || "You addressed the conversation task with relevant information.",
    interaction: config.ui?.interactionStrength || `You maintained the exchange and responded to ${coachFirstName}'s communicative purpose.`,
    language: config.ui?.languageStrength || `You used useful ${unitShortLabel} vocabulary and structures.`,
    fluency: "Your answer had a workable speaking pace and enough development.",
    clarity: "Most recorded words had useful transcription confidence."
  };

  const priorityMessages = {
    task: "Answer every requested part before adding optional details.",
    interaction: config.ui?.interactionPriority || `Use connectors in normal turns and ask ${coachFirstName} two clearly different questions.`,
    language: config.ui?.languagePriority || `Include precise ${unitShortLabel} expressions from the activity support.`,
    fluency: "Prepare short thought groups and keep speaking without rushing.",
    clarity: "Move closer to the microphone and repeat lower-confidence words in a complete sentence."
  };

  function buildReport() {
    const answers = session.questionIds.map((id, index) => {
      const question = questionById.get(id);
      const stored = session.answers[index] || { questionId: id, main: null, followUpPrompt: null, followUp: null };
      const main = Object.prototype.hasOwnProperty.call(stored, "main") ? stored.main : stored;
      return {
        questionId: id,
        topic: question.topic,
        mainPrompt: question.text,
        mainImproved: question.improved,
        main,
        followUpPrompt: stored.followUpPrompt || null,
        followUp: stored.followUp || null,
        turnScore: turnAverage(stored)
      };
    });
    const responses = answers.flatMap((turn) => turnResponses(turn));
    const analyzedCount = responses.filter((answer) => answer.analysis).length;
    const totalResponses = session.questionIds.reduce((total, id) => {
      const question = questionById.get(id);
      return total + (question?.followUpSet && !question.interaction ? 2 : 1);
    }, 0);
    const criteria = {};
    (config.rubric || []).forEach((criterion) => { criteria[criterion.key] = criterionAverage(responses, criterion.key); });
    const availableCriteria = Object.values(criteria).filter((value) => value != null);
    const score = availableCriteria.length === (config.rubric || []).length ? availableCriteria.reduce((sum, value) => sum + value, 0) : null;
    const ranked = (config.rubric || []).map((criterion) => ({ ...criterion, score: criteria[criterion.key] })).filter((criterion) => criterion.score != null).sort((a, b) => b.score - a.score);
    const previous = persistent.history[persistent.history.length - 1];
    let comparison = "This is your first complete result on this device. Repeat whenever you want.";
    if (score != null && previous?.score != null) {
      const difference = score - Number(previous.score);
      if (difference > 0) comparison = `You improved by ${difference} point${difference === 1 ? "" : "s"} compared with your previous complete conversation.`;
      else if (difference === 0) comparison = "You matched your previous result. Choose one priority and try a more independent response.";
      else comparison = `This result is ${Math.abs(difference)} point${Math.abs(difference) === 1 ? "" : "s"} below your previous attempt. Rehearse the two priority turns.`;
    } else if (score == null) {
      comparison = "A complete /50 estimate requires at least one usable transcription and all five criteria. No score was invented.";
    }
    return {
      score,
      analyzedCount,
      totalResponses,
      totalTurns: answers.length,
      criteria,
      readiness: readinessLabel(score),
      comparison,
      mode: session.mode,
      completedAt: new Date().toISOString(),
      strengths: ranked.slice(0, 2).map((criterion) => strengthMessages[criterion.key]),
      priorities: ranked.slice(-2).reverse().map((criterion) => priorityMessages[criterion.key]),
      lowConfidence: aggregateLowConfidence(responses),
      answers
    };
  }

  function renderHistory() {
    if (!persistent.history.length) {
      elements.attemptHistory.innerHTML = "<p>No completed attempts on this device yet.</p>";
      return;
    }
    elements.attemptHistory.innerHTML = persistent.history.slice().reverse().map((attempt) => {
      const date = new Date(attempt.completedAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
      const total = attempt.totalResponses || attempt.totalTurns;
      return `<article><div><strong>${attempt.score == null ? "Not scored" : `${attempt.score}/50`}</strong><span>${escapeHtml(attempt.mode === "real" ? "Real Conversation" : "Guided Rehearsal")} - ${attempt.analyzedCount}/${total} responses analyzed</span></div><span>${escapeHtml(date)}</span></article>`;
    }).join("");
  }

  function normalizeReportTurn(turn) {
    if (Object.prototype.hasOwnProperty.call(turn, "main")) return turn;
    return {
      questionId: turn.questionId,
      topic: turn.topic,
      mainPrompt: turn.question,
      mainImproved: turn.improved,
      main: turn,
      followUpPrompt: null,
      followUp: null,
      turnScore: turn.analysis?.total ?? null
    };
  }

  function responseReview(label, prompt, answer, improved) {
    if (!answer) return "";
    const score = answer.analysis ? `${answer.analysis.total}/50` : "Not analyzed";
    const transcript = answer.transcript || "No transcript was available for this response.";
    const feedback = answer.analysis?.message || "No automatic feedback was created because there was no usable transcription.";
    return `<section class="coach-answer-phase"><div class="coach-answer-phase-heading"><strong>${escapeHtml(label)}</strong><span>${escapeHtml(score)}</span></div><p><strong>${escapeHtml(coachFirstName)} asked:</strong> ${escapeHtml(prompt || answer.prompt || "")}</p><p><strong>You said:</strong> ${escapeHtml(transcript)}</p><p><strong>Feedback:</strong> ${escapeHtml(feedback)}</p><p class="coach-model"><strong>Stronger model:</strong><br>${escapeHtml(improved || "")}</p></section>`;
  }

  function renderReport(report) {
    const turns = (report.answers || []).map(normalizeReportTurn);
    const totalResponses = report.totalResponses || report.totalTurns || turns.length;
    const reportLowConfidence = (report.lowConfidence || []).filter((item) => isUsefulEnglishFeedbackWord(item.word));
    elements.summaryScore.textContent = report.score == null ? "--" : report.score;
    elements.summaryReadiness.textContent = report.readiness;
    elements.summaryLead.textContent = report.score != null ? (config.ui?.summaryLeadComplete || `You completed a balanced conversation with ${coachFirstName}.`) : "You completed the conversation, but at least one response could not be analyzed.";
    elements.summaryComparison.textContent = report.comparison;
    elements.summaryCoverage.textContent = `${report.analyzedCount} of ${totalResponses} responses analyzed. This formative estimate is not a grade and is never sent to your teacher.`;
    elements.summaryMetrics.innerHTML = (config.rubric || []).map((criterion) => `<article class="coach-summary-metric"><strong>${report.criteria[criterion.key] == null ? "--" : report.criteria[criterion.key]}</strong><span>/10 - ${escapeHtml(criterion.label)}</span><p>${escapeHtml(criterion.description)}</p></article>`).join("");
    elements.summaryStrengths.innerHTML = (report.strengths.length ? report.strengths : ["You completed the complete interaction sequence."]).map((item) => `<li>${escapeHtml(item)}</li>`).join("");
    elements.summaryPriorities.innerHTML = (report.priorities.length ? report.priorities : ["Repeat the conversation when the transcription service is available."]).map((item) => `<li>${escapeHtml(item)}</li>`).join("");
    elements.summaryWords.innerHTML = reportLowConfidence.length ? reportLowConfidence.map((item) => `<span>${escapeHtml(item.word)} <small>${Math.round(item.probability * 100)}%</small></span>`).join("") : "<p>No lower-confidence words were identified in the analyzed turns.</p>";
    elements.summaryAnswers.innerHTML = turns.map((turn, index) => {
      const score = turn.turnScore == null ? "Not analyzed" : `${turn.turnScore}/50 average`;
      const followUp = turn.followUpPrompt && turn.followUp
        ? responseReview("Adaptive follow-up", turn.followUpPrompt.text, turn.followUp, turn.followUpPrompt.improved)
        : "";
      return `<article><span class="coach-answer-score">${escapeHtml(score)}</span><h3>Turn ${index + 1}: ${escapeHtml(turn.topic)}</h3>${responseReview("Initial answer", turn.mainPrompt, turn.main, turn.mainImproved)}${followUp}</article>`;
    }).join("");
    renderHistory();
    const weakIds = turns.filter((turn) => turn.turnScore != null).sort((a, b) => a.turnScore - b.turnScore).slice(0, 2).map((turn) => turn.questionId);
    elements.weakPractice.dataset.questionIds = weakIds.join(",");
    elements.weakPractice.hidden = !weakIds.length;
  }

  async function completeConversation() {
    releaseCurrentRecording();
    stopCoachAudio();
    const report = buildReport();
    persistent.lastReport = report;
    persistent.history.push({ score: report.score, mode: report.mode, completedAt: report.completedAt, analyzedCount: report.analyzedCount, totalResponses: report.totalResponses, totalTurns: report.totalTurns });
    persistent.history = persistent.history.slice(-8);
    savePersistent();
    renderReport(report);
    showPanel("summary");
    setStage("complete", "Conversation complete");
    elements.summary.scrollIntoView({ behavior: "smooth", block: "start" });
    showToast("Conversation complete. Your private report is ready.");
  }

  function reviewLatest() {
    if (!persistent.lastReport) return;
    renderReport(persistent.lastReport);
    showPanel("summary");
    elements.summary.scrollIntoView({ behavior: "smooth", block: "start" });
    showToast("Latest private report opened.");
  }

  function clearHistory() {
    persistent = { history: [], lastReport: null };
    savePersistent();
    renderHistory();
    elements.reviewPrevious.hidden = true;
    elements.resumeNote.hidden = true;
    showToast("Practice history cleared from this browser.");
  }

  function practiceWeakTurns() {
    const ids = String(elements.weakPractice.dataset.questionIds || "").split(",").filter((id) => questionById.has(id));
    if (!ids.length) return;
    elements.guidedMode.checked = true;
    elements.realMode.checked = false;
    beginConversation(ids, "guided");
  }

  document.querySelectorAll("[data-coach-speed]").forEach((button) => button.addEventListener("click", () => updateSpeed(button.dataset.coachSpeed)));
  elements.welcomePlay.addEventListener("click", () => playAudio(elements.welcomeAudio, config.audio?.welcome, { restoreStage: false }));
  elements.instructionsPlay.addEventListener("click", () => playAudio(elements.instructionsAudio, config.audio?.instructions, { restoreStage: false }));
  elements.preflight.addEventListener("click", testMicrophone);
  elements.start.addEventListener("click", () => beginConversation());
  elements.reviewPrevious.addEventListener("click", reviewLatest);
  elements.questionPlay.addEventListener("click", playQuestion);
  elements.mic.addEventListener("click", startRecording);
  elements.floatingMic.addEventListener("click", startRecording);
  elements.stop.addEventListener("click", stopRecording);
  elements.floatingStop.addEventListener("click", stopRecording);
  elements.recordAgain.addEventListener("click", recordAgain);
  elements.recoveryRecordAgain.addEventListener("click", recordAgain);
  elements.retryTranscription.addEventListener("click", transcribeCurrentRecording);
  elements.continueUnscored.addEventListener("click", continueWithoutScore);
  elements.next.addEventListener("click", nextTurn);
  elements.restart.addEventListener("click", () => beginConversation());
  elements.weakPractice.addEventListener("click", practiceWeakTurns);
  elements.closingPlay.addEventListener("click", () => playAudio(elements.reactionAudio, config.audio?.closing, { restoreStage: false }));
  elements.clearHistory.addEventListener("click", clearHistory);
  navigator.mediaDevices?.addEventListener?.("devicechange", refreshMicrophones);
  window.addEventListener("beforeunload", () => {
    stopCoachAudio();
    releaseCurrentRecording();
    if (preflightObjectUrl) URL.revokeObjectURL(preflightObjectUrl);
  });

  refreshOnboarding();
  refreshMicrophones();
  updateSpeed(1, false);
  showPanel("onboarding");
})();
