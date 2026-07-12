(() => {
  "use strict";

  const API_PATH = "/api/english-basic/pronunciation-assessment";
  const STORAGE_KEY = "jaralingua:english-basic:final-oral-mock:v1";
  const LOCAL_URL = "http://127.0.0.1:8020/ingles/basico/final-oral-interview-mock.html";
  const MAX_RECORDING_SECONDS = 30;

  const QUESTIONS = [
    {
      topic: "Personal information",
      text: "What's your name, and where are you from?",
      audio: "audio/final-oral-mock/question-1.mp3",
      frames: [
        "My name is ______, and I'm from ______.",
        "Hello! I'm ______. I'm from ______, and I live in ______."
      ],
      minWords: 5,
      checks: [
        { label: "an introduction", terms: ["my name", "i am", "i'm", "im"] },
        { label: "where you are from", terms: ["from"] }
      ],
      success: "Good introduction. You shared your name and where you are from.",
      shortTip: "Add both parts: your name and where you are from."
    },
    {
      topic: "Morning routine",
      text: "What do you usually do in the morning?",
      audio: "audio/final-oral-mock/question-2.mp3",
      frames: [
        "I usually ______ in the morning. Then, I ______.",
        "In the morning, I ______ at ______. After that, I ______."
      ],
      minWords: 6,
      checks: [
        { label: "a routine action", terms: ["wake up", "get up", "have breakfast", "eat breakfast", "drink coffee", "take a shower", "get dressed", "brush", "go to work", "go to school", "start work", "start class", "study", "exercise"] },
        { label: "a routine marker", terms: ["usually", "in the morning", "then", "after that", "every morning", "at"] }
      ],
      success: "Good routine answer. You included an action and a useful time or sequence expression.",
      shortTip: "Mention one morning action and add a time or sequence word such as usually, at, or then."
    },
    {
      topic: "Free time",
      text: "What do you like to do in your free time?",
      audio: "audio/final-oral-mock/question-3.mp3",
      frames: [
        "In my free time, I like to ______.",
        "I enjoy ______ because it is ______."
      ],
      minWords: 5,
      checks: [
        { label: "a preference", terms: ["i like", "i love", "i enjoy", "my favorite", "in my free time"] },
        { label: "a free-time activity", terms: ["watch", "play", "listen", "read", "cook", "dance", "sing", "walk", "run", "exercise", "go out", "visit", "travel", "relax", "chat", "game", "music", "movie", "tv", "series", "sport"] }
      ],
      success: "Good answer. You expressed a preference and named a free-time activity.",
      shortTip: "Use I like, I love, or I enjoy, and name one activity."
    },
    {
      topic: "Family description",
      text: "Tell me about one person in your family.",
      audio: "audio/final-oral-mock/question-4.mp3",
      frames: [
        "My ______'s name is ______. He / She is ______ and ______.",
        "One important person in my family is my ______. He / She likes to ______."
      ],
      minWords: 7,
      checks: [
        { label: "a family member", terms: ["mother", "mom", "father", "dad", "sister", "brother", "daughter", "son", "wife", "husband", "grandmother", "grandfather", "aunt", "uncle", "cousin", "family"] },
        { label: "one personal detail", terms: [" is ", "he's", "she's", "works", "likes", "loves", "has", "lives", "years old", "friendly", "kind", "funny", "tall", "short"] }
      ],
      success: "Good family description. You identified a person and added a personal detail.",
      shortTip: "Name the family relationship and add one detail about the person."
    },
    {
      topic: "Places and directions",
      text: "You are at the bus stop. Where is the library, and how can you get there?",
      audio: "audio/final-oral-mock/question-5.mp3",
      map: true,
      frames: [
        "The library is next to the ______. Go straight and turn ______.",
        "From the bus stop, go straight past the ______. Turn left and continue straight. The library is on your left."
      ],
      minWords: 8,
      checks: [
        { label: "the library or its location", terms: ["library", "next to", "near", "across from", "on your left", "on the left"] },
        { label: "a direction", terms: ["go straight", "continue straight", "turn left", "turn right", "walk", "go past", "pass the", "cross"] }
      ],
      success: "Good directions. You described the location and included a movement instruction.",
      shortTip: "Say where the library is and include at least one direction such as go straight or turn left."
    }
  ];

  const elements = {
    onboarding: document.getElementById("onboardingPanel"),
    interview: document.getElementById("interviewPanel"),
    summary: document.getElementById("summaryPanel"),
    start: document.getElementById("startInterviewButton"),
    preflight: document.getElementById("preflightButton"),
    preflightStatus: document.getElementById("preflightStatus"),
    reviewPrevious: document.getElementById("reviewPreviousButton"),
    resumeNote: document.getElementById("resumeNote"),
    counter: document.getElementById("questionCounter"),
    topic: document.getElementById("questionTopic"),
    progress: document.getElementById("interviewProgressBar"),
    questionText: document.getElementById("questionText"),
    interviewerStatus: document.getElementById("interviewerStatus"),
    questionPlay: document.getElementById("questionPlayButton"),
    interviewerAudio: document.getElementById("interviewerAudio"),
    map: document.getElementById("mapPanel"),
    support: document.getElementById("answerSupport"),
    frames: document.getElementById("answerFrameGrid"),
    toggleHelp: document.getElementById("toggleHelpButton"),
    showHelp: document.getElementById("showHelpButton"),
    micSelect: document.getElementById("microphoneSelect"),
    levelBar: document.getElementById("levelMeterBar"),
    levelValue: document.getElementById("levelMeterValue"),
    mic: document.getElementById("micButton"),
    stop: document.getElementById("stopButton"),
    retry: document.getElementById("retryButton"),
    status: document.getElementById("recordStatus"),
    help: document.getElementById("recordHelp"),
    timer: document.getElementById("timer"),
    transcript: document.getElementById("liveTranscript"),
    studentAudio: document.getElementById("studentAudio"),
    feedback: document.getElementById("answerFeedback"),
    unsupported: document.getElementById("unsupported"),
    next: document.getElementById("nextQuestionButton"),
    summaryLead: document.getElementById("summaryLead"),
    summaryAnswers: document.getElementById("summaryAnswers"),
    restart: document.getElementById("restartInterviewButton")
  };

  function freshState(previous = {}) {
    return {
      hasCompleted: Boolean(previous.hasCompleted),
      inProgress: false,
      currentIndex: 0,
      answers: Array(QUESTIONS.length).fill(null),
      lastAnswers: Array.isArray(previous.lastAnswers) ? previous.lastAnswers : [],
      completedAt: previous.completedAt || ""
    };
  }

  function loadState() {
    try {
      const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (!value || typeof value !== "object") return freshState();
      return {
        hasCompleted: Boolean(value.hasCompleted),
        inProgress: Boolean(value.inProgress),
        currentIndex: Math.max(0, Math.min(QUESTIONS.length - 1, Number(value.currentIndex) || 0)),
        answers: Array.from({ length: QUESTIONS.length }, (_, index) => value.answers?.[index] || null),
        lastAnswers: Array.isArray(value.lastAnswers) ? value.lastAnswers.slice(0, QUESTIONS.length) : [],
        completedAt: value.completedAt || ""
      };
    } catch (_error) {
      return freshState();
    }
  }

  let state = loadState();
  let currentIndex = state.currentIndex;
  let selectedFrame = null;
  let playbackSpeed = 1;
  let mediaRecorder = null;
  let mediaStream = null;
  let chunks = [];
  let startedAt = 0;
  let recordedDurationMs = 0;
  let timerHandle = null;
  let autoStopHandle = null;
  let objectUrl = null;
  let discardRecording = false;
  let analyzing = false;
  let audioContext = null;
  let analyser = null;
  let meterFrame = null;

  function saveState() {
    state.currentIndex = currentIndex;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function currentQuestion() {
    return QUESTIONS[currentIndex];
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[character]);
  }

  function normalize(value) {
    return ` ${String(value || "").toLocaleLowerCase("en-US").replace(/[\u2019']/g, "'").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9'\s]/g, " ").replace(/\s+/g, " ").trim()} `;
  }

  function includesTerm(normalizedText, term) {
    const normalizedTerm = normalize(term).trim();
    return normalizedTerm && normalizedText.includes(` ${normalizedTerm} `);
  }

  function analyzeAnswer(transcript, durationMs) {
    const question = currentQuestion();
    const normalized = normalize(transcript);
    const words = normalized.trim().split(/\s+/).filter(Boolean);
    const targetChecks = question.checks.map((check) => ({
      label: check.label,
      met: check.terms.some((term) => includesTerm(normalized, term))
    }));
    const lengthMet = words.length >= question.minWords;
    const timingMet = durationMs >= 3000 && durationMs <= MAX_RECORDING_SECONDS * 1000;
    const allTargetsMet = targetChecks.every((check) => check.met);
    const missing = targetChecks.filter((check) => !check.met).map((check) => check.label);
    let message = question.success;
    if (!lengthMet) message = question.shortTip;
    else if (missing.length) message = `Your answer was recorded. For a stronger answer, add ${missing.join(" and ")}.`;
    if (!timingMet && durationMs < 3000) message += " Speak a little longer so your complete idea is clear.";
    return {
      wordCount: words.length,
      lengthMet,
      timingMet,
      targetChecks,
      coreComplete: lengthMet && allTargetsMet,
      message
    };
  }

  function renderFeedback(answer) {
    const analysis = answer.analysis;
    const checks = [
      { label: "Voice transcribed", met: true },
      { label: "Complete answer", met: analysis.lengthMet },
      ...analysis.targetChecks,
      { label: "Useful speaking time", met: analysis.timingMet }
    ];
    elements.feedback.innerHTML = `<div class="feedback-checks">${checks.map((check) => `<span class="feedback-check ${check.met ? "is-met" : ""}"><i class="bi ${check.met ? "bi-check-circle-fill" : "bi-circle"}"></i>${escapeHtml(check.label)}</span>`).join("")}</div><p class="feedback-message">${escapeHtml(analysis.message)}</p><p class="feedback-note">This formative check uses words, structures, and recording time. It does not replace teacher feedback.</p>`;
    elements.feedback.hidden = false;
  }

  function renderFrames() {
    const answer = state.answers[currentIndex];
    selectedFrame = Number.isInteger(answer?.selectedFrame) ? answer.selectedFrame : null;
    elements.frames.innerHTML = currentQuestion().frames.map((frame, index) => `<button type="button" class="answer-frame ${selectedFrame === index ? "is-selected" : ""}" data-frame-index="${index}"><span>${index === 0 ? "A" : "B"}</span><div><strong>Option ${index === 0 ? "A" : "B"}</strong><small>${escapeHtml(frame)}</small></div></button>`).join("");
    elements.frames.querySelectorAll(".answer-frame").forEach((button) => {
      button.addEventListener("click", () => {
        selectedFrame = Number(button.dataset.frameIndex);
        elements.frames.querySelectorAll(".answer-frame").forEach((item) => item.classList.toggle("is-selected", item === button));
      });
    });
  }

  function setHelpVisibility(show) {
    elements.support.hidden = !show;
    elements.showHelp.hidden = show;
    elements.toggleHelp.textContent = "Hide help";
  }

  function resetRecorderDisplay() {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = null;
    elements.studentAudio.removeAttribute("src");
    elements.studentAudio.hidden = true;
    elements.transcript.classList.remove("has-text");
    elements.transcript.textContent = "Your transcription will appear here after you finish.";
    elements.feedback.hidden = true;
    elements.feedback.innerHTML = "";
    elements.timer.textContent = "00:00 / 00:30";
    elements.status.textContent = "Ready for your answer";
    elements.help.textContent = "Tap the microphone and answer in English.";
    elements.levelBar.style.width = "0";
    elements.levelValue.textContent = "Waiting";
  }

  function renderQuestion(autoplay = false) {
    const question = currentQuestion();
    const answer = state.answers[currentIndex];
    selectedFrame = Number.isInteger(answer?.selectedFrame) ? answer.selectedFrame : null;
    elements.counter.textContent = `Question ${currentIndex + 1} of ${QUESTIONS.length}`;
    elements.topic.textContent = question.topic;
    elements.progress.style.width = `${((currentIndex + 1) / QUESTIONS.length) * 100}%`;
    elements.questionText.textContent = question.text;
    elements.map.hidden = !question.map;
    elements.interviewerAudio.pause();
    elements.interviewerAudio.src = question.audio;
    elements.interviewerAudio.load();
    elements.interviewerStatus.textContent = "Ready to ask your question";
    renderFrames();
    setHelpVisibility(!state.hasCompleted);
    resetRecorderDisplay();
    if (answer?.transcript) {
      elements.transcript.textContent = answer.transcript;
      elements.transcript.classList.add("has-text");
      elements.status.textContent = "Answer transcribed. Review it before continuing.";
      elements.help.textContent = "If the transcription is not close to what you said, try the answer again.";
      renderFeedback(answer);
    }
    elements.next.innerHTML = currentIndex === QUESTIONS.length - 1 ? `Finish the interview <i class="bi bi-check2"></i>` : `Continue <i class="bi bi-arrow-right"></i>`;
    updateRecorderControls();
    if (autoplay) playQuestion();
  }

  function updateQuestionPlayButton() {
    const playing = !elements.interviewerAudio.paused && !elements.interviewerAudio.ended;
    elements.questionPlay.querySelector("i").className = playing ? "bi bi-pause-fill" : "bi bi-play-fill";
    elements.questionPlay.querySelector("span").textContent = playing ? "Pause question" : "Play question";
    elements.interviewerStatus.textContent = playing ? `Emma is speaking at ${playbackSpeed === 1 ? "normal speed" : "slow speed"}` : "Ready to ask your question";
    updateRecorderControls();
  }

  async function playQuestion() {
    if (!elements.interviewerAudio.paused && !elements.interviewerAudio.ended) {
      elements.interviewerAudio.pause();
      return;
    }
    if (mediaRecorder?.state === "recording") return;
    elements.interviewerAudio.playbackRate = playbackSpeed;
    try {
      await elements.interviewerAudio.play();
    } catch (_error) {
      elements.interviewerStatus.textContent = "Tap Play question to hear Emma.";
    }
  }

  function formatTime(ms) {
    const seconds = Math.max(0, Math.floor(ms / 1000));
    return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  }

  function updateTimer() {
    elements.timer.textContent = `${formatTime(Date.now() - startedAt)} / 00:30`;
  }

  function updateRecorderControls() {
    const recording = mediaRecorder?.state === "recording";
    const hasAnswer = Boolean(state.answers[currentIndex]?.transcript);
    const interviewerPlaying = !elements.interviewerAudio.paused && !elements.interviewerAudio.ended;
    elements.mic.classList.toggle("is-recording", recording);
    elements.mic.querySelector("i").className = recording ? "bi bi-soundwave" : "bi bi-mic-fill";
    elements.mic.disabled = recording || analyzing || hasAnswer || interviewerPlaying;
    elements.stop.disabled = !recording || analyzing;
    elements.retry.disabled = recording || analyzing || !hasAnswer;
    elements.micSelect.disabled = recording || analyzing;
    elements.next.disabled = !hasAnswer || recording || analyzing;
    elements.questionPlay.disabled = recording || analyzing;
  }

  async function refreshMicrophones() {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    try {
      const currentValue = elements.micSelect.value;
      const devices = (await navigator.mediaDevices.enumerateDevices()).filter((device) => device.kind === "audioinput");
      elements.micSelect.innerHTML = '<option value="">Default microphone</option>' + devices.map((device, index) => `<option value="${escapeHtml(device.deviceId)}">${escapeHtml(device.label || `Microphone ${index + 1}`)}</option>`).join("");
      if ([...elements.micSelect.options].some((option) => option.value === currentValue)) elements.micSelect.value = currentValue;
    } catch (_error) {
      elements.micSelect.innerHTML = '<option value="">Default microphone</option>';
    }
  }

  function audioConstraints() {
    const constraints = window.JaraMicPermissions?.audioConstraints(elements.micSelect.value) || { echoCancellation: { ideal: true }, noiseSuppression: { ideal: true }, autoGainControl: { ideal: true }, channelCount: { ideal: 1 } };
    if (elements.micSelect.value) constraints.deviceId = { exact: elements.micSelect.value };
    return constraints;
  }

  async function requestMicrophone() {
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
      const ready = await window.JaraMicPermissions.ensureReady({ micButton: elements.mic, stopButton: elements.stop, recordStatus: elements.status, recordHelp: elements.help, unsupported: elements.unsupported, localUrl: LOCAL_URL, language: "en" });
      if (!ready) return null;
      window.JaraMicPermissions.beforeRequest({ recordStatus: elements.status, recordHelp: elements.help, language: "en" });
    }
    return navigator.mediaDevices.getUserMedia({ audio: audioConstraints(), video: false });
  }

  function microphoneErrorMessage(error) {
    const messages = {
      NotAllowedError: "Microphone access was blocked. Allow the microphone for JaraLingua in your browser settings and try again.",
      SecurityError: "The microphone requires the secure HTTPS version of JaraLingua.",
      NotFoundError: "No microphone was detected on this device.",
      NotReadableError: "Another application is using the microphone. Close WhatsApp, Zoom, Teams, or another recorder and try again.",
      AbortError: "The browser interrupted microphone activation. Please try again.",
      OverconstrainedError: "The selected microphone is unavailable. Choose the default microphone.",
      NotSupportedError: "This browser cannot record audio. Update Safari, Chrome, or Edge and try again."
    };
    return messages[error?.name] || `The microphone is unavailable: ${error?.message || "unknown error"}`;
  }

  async function preflightMicrophone() {
    elements.preflight.disabled = true;
    elements.preflightStatus.textContent = "Requesting microphone permission...";
    try {
      const stream = await requestMicrophone();
      if (!stream) {
        elements.preflightStatus.textContent = elements.help.textContent || "Microphone permission is still required.";
        return;
      }
      const track = stream.getAudioTracks()[0];
      await refreshMicrophones();
      window.JaraMicPermissions?.markActive({ stream, microphoneSelect: elements.micSelect, recordHelp: elements.help, language: "en" });
      elements.preflightStatus.textContent = track?.label ? `Microphone ready: ${track.label}` : "Microphone ready. You can begin the interview.";
      elements.preflight.innerHTML = '<i class="bi bi-check2-circle"></i> Microphone ready';
      stream.getTracks().forEach((item) => item.stop());
    } catch (error) {
      elements.preflightStatus.textContent = microphoneErrorMessage(error);
    } finally {
      elements.preflight.disabled = false;
    }
  }

  function startLevelMeter(stream) {
    stopLevelMeter();
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    audioContext = new AudioContextClass();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 1024;
    audioContext.createMediaStreamSource(stream).connect(analyser);
    const samples = new Uint8Array(analyser.fftSize);
    const update = () => {
      analyser.getByteTimeDomainData(samples);
      let sum = 0;
      samples.forEach((sample) => { const value = (sample - 128) / 128; sum += value * value; });
      const rms = Math.sqrt(sum / samples.length);
      const percent = Math.min(100, Math.round(rms * 900));
      elements.levelBar.style.width = `${percent}%`;
      elements.levelValue.textContent = percent < 4 ? "Speak louder" : percent < 55 ? "Good signal" : "Strong signal";
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

  function stopTracks() {
    stopLevelMeter();
    mediaStream?.getTracks().forEach((track) => track.stop());
    mediaStream = null;
    elements.levelBar.style.width = "0";
    elements.levelValue.textContent = "Waiting";
  }

  async function startRecording() {
    if (analyzing || state.answers[currentIndex]?.transcript) return;
    elements.interviewerAudio.pause();
    try {
      mediaStream = await requestMicrophone();
      if (!mediaStream) return;
      startLevelMeter(mediaStream);
      const activeTrack = mediaStream.getAudioTracks()[0];
      await refreshMicrophones();
      const activeDeviceId = activeTrack?.getSettings?.().deviceId;
      if (activeDeviceId && [...elements.micSelect.options].some((option) => option.value === activeDeviceId)) elements.micSelect.value = activeDeviceId;
      window.JaraMicPermissions?.markActive({ stream: mediaStream, microphoneSelect: elements.micSelect, recordHelp: elements.help, language: "en" });
      chunks = [];
      discardRecording = false;
      const preferredType = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4;codecs=mp4a.40.2", "audio/mp4"].find((type) => MediaRecorder.isTypeSupported(type)) || "";
      mediaRecorder = preferredType ? new MediaRecorder(mediaStream, { mimeType: preferredType }) : new MediaRecorder(mediaStream);
      mediaRecorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
      mediaRecorder.onerror = () => {
        elements.status.textContent = "The browser could not record your answer.";
        elements.help.textContent = "Close other audio apps and try again.";
        stopTracks();
        updateRecorderControls();
      };
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: mediaRecorder.mimeType || "audio/webm" });
        stopTracks();
        if (discardRecording || !blob.size) return;
        if (objectUrl) URL.revokeObjectURL(objectUrl);
        objectUrl = URL.createObjectURL(blob);
        elements.studentAudio.src = objectUrl;
        elements.studentAudio.hidden = false;
        await transcribeAnswer(blob);
      };
      startedAt = Date.now();
      timerHandle = setInterval(updateTimer, 250);
      autoStopHandle = setTimeout(finishRecording, MAX_RECORDING_SECONDS * 1000);
      mediaRecorder.start(250);
      elements.status.textContent = "Recording your answer";
      elements.help.textContent = "Speak naturally. The recording will stop automatically at 30 seconds.";
      elements.transcript.textContent = "Listening...";
      updateRecorderControls();
    } catch (error) {
      stopTracks();
      window.JaraMicPermissions?.handleError(error, { recordStatus: elements.status, recordHelp: elements.help, microphoneSelect: elements.micSelect, language: "en" });
      elements.status.textContent = "The microphone could not start.";
      elements.help.textContent = microphoneErrorMessage(error);
      updateRecorderControls();
    }
  }

  function finishRecording() {
    if (mediaRecorder?.state !== "recording") return;
    recordedDurationMs = Date.now() - startedAt;
    clearInterval(timerHandle);
    clearTimeout(autoStopHandle);
    timerHandle = null;
    autoStopHandle = null;
    elements.timer.textContent = `${formatTime(recordedDurationMs)} / 00:30`;
    mediaRecorder.stop();
    elements.status.textContent = "Preparing your transcription...";
    updateRecorderControls();
  }

  async function transcribeAnswer(blob) {
    analyzing = true;
    elements.status.textContent = "Transcribing your answer locally...";
    elements.transcript.textContent = "Please wait. Your words will appear here.";
    updateRecorderControls();
    try {
      const response = await fetch(API_PATH, { method: "POST", headers: { "Content-Type": blob.type || "audio/webm" }, body: blob });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || `Server error (${response.status}).`);
      const transcript = String(payload.text || "").trim();
      const audioStats = payload.audio || {};
      if (!transcript) {
        if (Number(audioStats.rms || 0) < 0.0008) throw new Error("The recording arrived silent. Choose another microphone and try again.");
        throw new Error("Speech was detected, but no clear English words were transcribed. Speak a little closer to the microphone.");
      }
      const answer = {
        transcript,
        selectedFrame,
        durationMs: recordedDurationMs,
        answeredAt: new Date().toISOString(),
        analysis: analyzeAnswer(transcript, recordedDurationMs)
      };
      state.answers[currentIndex] = answer;
      state.inProgress = true;
      saveState();
      elements.transcript.textContent = transcript;
      elements.transcript.classList.add("has-text");
      elements.status.textContent = "Answer transcribed. Review it before continuing.";
      elements.help.textContent = "If the transcription is not close to what you said, choose Try again.";
      renderFeedback(answer);
    } catch (error) {
      elements.status.textContent = "The transcription could not be completed.";
      elements.help.textContent = "Your previous questions are safe. Record this answer again.";
      elements.transcript.textContent = error.message || "Transcription error.";
      elements.studentAudio.hidden = true;
    } finally {
      analyzing = false;
      updateRecorderControls();
    }
  }

  function retryCurrentAnswer() {
    if (mediaRecorder?.state === "recording" || analyzing) return;
    state.answers[currentIndex] = null;
    saveState();
    resetRecorderDisplay();
    renderFrames();
    updateRecorderControls();
    elements.mic.focus();
  }

  function startInterview() {
    if (!state.inProgress) {
      const previous = state;
      state = freshState(previous);
      state.inProgress = true;
      currentIndex = 0;
      saveState();
    } else {
      currentIndex = state.currentIndex;
    }
    elements.onboarding.hidden = true;
    elements.summary.hidden = true;
    elements.interview.hidden = false;
    renderQuestion(true);
    document.getElementById("oralMockApp").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function nextQuestion() {
    if (!state.answers[currentIndex]?.transcript || analyzing) return;
    if (currentIndex < QUESTIONS.length - 1) {
      currentIndex += 1;
      state.currentIndex = currentIndex;
      saveState();
      renderQuestion(true);
      elements.interview.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    state.hasCompleted = true;
    state.inProgress = false;
    state.currentIndex = 0;
    state.completedAt = new Date().toISOString();
    state.lastAnswers = state.answers.map((answer) => answer ? { ...answer } : null);
    saveState();
    showSummary(state.lastAnswers, true);
  }

  function showSummary(answers, playCompletion = false) {
    stopTracks();
    elements.interviewerAudio.pause();
    elements.onboarding.hidden = true;
    elements.interview.hidden = true;
    elements.summary.hidden = false;
    const completed = answers.filter((answer) => answer?.transcript).length;
    const ready = answers.filter((answer) => answer?.analysis?.coreComplete).length;
    elements.summaryLead.textContent = `You answered ${completed} of ${QUESTIONS.length} questions. ${ready} answers included the main language targets. This is practice feedback, not a grade.`;
    elements.summaryAnswers.innerHTML = answers.map((answer, index) => {
      if (!answer) return "";
      return `<article class="summary-answer"><header><h3>${index + 1}. ${escapeHtml(QUESTIONS[index].topic)}</h3><span>${Math.max(1, Math.round(answer.durationMs / 1000))} seconds</span></header><blockquote>${escapeHtml(answer.transcript)}</blockquote><p>${escapeHtml(answer.analysis.message)}</p></article>`;
    }).join("");
    if (playCompletion) {
      elements.interviewerAudio.src = "audio/final-oral-mock/completion.mp3";
      elements.interviewerAudio.playbackRate = 1;
      elements.interviewerAudio.play().catch(() => {});
    }
    elements.summary.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function restartInterview() {
    const previous = state;
    state = freshState(previous);
    state.inProgress = true;
    currentIndex = 0;
    saveState();
    elements.summary.hidden = true;
    elements.interview.hidden = false;
    renderQuestion(true);
    elements.interview.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function prepareOnboarding() {
    const completedAnswers = state.answers.filter((answer) => answer?.transcript).length;
    if (state.inProgress && completedAnswers) {
      elements.start.innerHTML = '<i class="bi bi-play-fill"></i> Continue the interview';
      elements.resumeNote.hidden = false;
      elements.resumeNote.textContent = `Your practice is safe. Continue from question ${state.currentIndex + 1}.`;
    }
    if (state.lastAnswers.filter((answer) => answer?.transcript).length === QUESTIONS.length) elements.reviewPrevious.hidden = false;
  }

  elements.start.addEventListener("click", startInterview);
  elements.preflight.addEventListener("click", preflightMicrophone);
  elements.reviewPrevious.addEventListener("click", () => showSummary(state.lastAnswers, false));
  elements.questionPlay.addEventListener("click", playQuestion);
  elements.interviewerAudio.addEventListener("play", updateQuestionPlayButton);
  elements.interviewerAudio.addEventListener("pause", updateQuestionPlayButton);
  elements.interviewerAudio.addEventListener("ended", updateQuestionPlayButton);
  document.querySelectorAll("[data-speed]").forEach((button) => {
    button.addEventListener("click", () => {
      playbackSpeed = Number(button.dataset.speed) || 1;
      elements.interviewerAudio.playbackRate = playbackSpeed;
      document.querySelectorAll("[data-speed]").forEach((item) => item.classList.toggle("is-active", item === button));
      if (!elements.interviewerAudio.paused) elements.interviewerStatus.textContent = `Emma is speaking at ${playbackSpeed === 1 ? "normal speed" : "slow speed"}`;
    });
  });
  elements.toggleHelp.addEventListener("click", () => setHelpVisibility(false));
  elements.showHelp.addEventListener("click", () => setHelpVisibility(true));
  elements.mic.addEventListener("click", startRecording);
  elements.stop.addEventListener("click", finishRecording);
  elements.retry.addEventListener("click", retryCurrentAnswer);
  elements.next.addEventListener("click", nextQuestion);
  elements.restart.addEventListener("click", restartInterview);
  navigator.mediaDevices?.addEventListener?.("devicechange", refreshMicrophones);
  window.addEventListener("beforeunload", () => { stopTracks(); if (objectUrl) URL.revokeObjectURL(objectUrl); });

  prepareOnboarding();
  refreshMicrophones();
})();
