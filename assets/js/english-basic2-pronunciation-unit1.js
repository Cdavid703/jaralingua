(() => {
  "use strict";

  const STAGES = [
    { label: "Section 1 - Weather words", shortLabel: "1", audio: "audio/unit1/pronunciation/section-1-weather-words.mp3", text: "sunny, cloudy, windy, rainy, stormy, pouring." },
    { label: "Section 2 - Weather sentences", shortLabel: "2", audio: "audio/unit1/pronunciation/section-2-weather-sentences.mp3", text: "It's sunny. It's cloudy. It's windy. It's raining. It's pouring. It's stormy." },
    { label: "Section 3 - Actions now", shortLabel: "3", audio: "audio/unit1/pronunciation/section-3-actions-now.mp3", text: "I'm checking the weather. Emma is waiting near the park. Daniel is checking his phone. People are leaving the park. The wind is getting stronger." },
    { label: "Section 4 - -ing endings", shortLabel: "4", audio: "audio/unit1/pronunciation/section-4-ing-endings.mp3", text: "checking, waiting, leaving, raining, changing, meeting, sitting, packing." },
    { label: "Section 5 - Changing plans", shortLabel: "5", audio: "audio/unit1/pronunciation/section-5-changing-plans.mp3", text: "We're changing the plan. We're not going to the park now. Let's stay inside. They're meeting up at a cafe. The coach is calling off the game." },
    { label: "Section 6 - Unit expressions", shortLabel: "6", audio: "audio/unit1/pronunciation/section-6-unit-expressions.mp3", text: "We are going out later. They are meeting up at the cafe. The game is called off. It's raining cats and dogs. Let's stay dry." },
    { label: "Final challenge", shortLabel: "Final", final: true, audio: "audio/unit1/pronunciation/final-challenge-weather-going-out.mp3", text: "It's cloudy, and the wind is getting stronger. Emma is waiting near the park, but Daniel is checking the weather. People are leaving, and it is starting to rain. They are changing the plan. They are not going to the park now. They are meeting up at a cafe and staying dry." }
  ];

  const GUIDED_COUNT = 6;
  const FINAL_INDEX = STAGES.length - 1;
  const API_PATH = "/api/english-basic/pronunciation-assessment";
  const SUBMIT_PATH = "/api/basic/basic2-unit1-pronunciation-weather/submit";
  const STORAGE_KEY = "jaralingua:english-basic2:pronunciation-unit1-weather-going-out:v1";
  const SUBMISSION_KEY = "jaralingua:english-basic2:pronunciation-unit1-weather-going-out:submission:v1";
  const LOCAL_URL = "http://127.0.0.1:8020/ingles/basico-2/pronunciation-unit-1-weather-going-out.html";
  const GOOGLE_USER_KEY = "jaralingua_google_user";
  const MICROSOFT_USER_KEY = "jaralingua_microsoft_user";
  const LOCAL_USER_KEY = "jaralingua_local_user";
  const readingText = document.getElementById("readingText");
  const micButton = document.getElementById("micButton");
  const stopButton = document.getElementById("stopButton");
  const resetButton = document.getElementById("resetButton");
  const recordStatus = document.getElementById("recordStatus");
  const recordHelp = document.querySelector(".record-help");
  const liveTranscript = document.getElementById("liveTranscript");
  const timer = document.getElementById("timer");
  const results = document.getElementById("results");
  const studentAudio = document.getElementById("studentAudio");
  const modelAudio = document.getElementById("modelAudio");
  const modelButton = document.getElementById("modelButton");
  const unsupported = document.getElementById("unsupported");
  const speedButtons = Array.from(document.querySelectorAll("[data-speed]"));
  const shadowModeButton = document.getElementById("shadowModeButton");
  const shadowModeStatus = document.getElementById("shadowModeStatus");

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
  let submitPanelController = null;
  let discardRecording = false;
  let analyzing = false;
  let audioContext = null;
  let analyser = null;
  let meterFrame = null;
  let maxInputLevel = 0;
  let shadowMode = false;

  const stagePanel = document.createElement("div");
  stagePanel.className = "stage-panel";
  stagePanel.innerHTML = '<div class="stage-panel-copy"><span id="stageCounter"></span><strong id="stageTitle"></strong></div><div class="stage-progress" id="stageProgress"></div>';
  readingText.parentNode.insertBefore(stagePanel, readingText);
  const stageCounter = document.getElementById("stageCounter");
  const stageTitle = document.getElementById("stageTitle");
  const stageProgress = document.getElementById("stageProgress");

  const microphonePicker = document.createElement("label");
  microphonePicker.className = "microphone-picker";
  microphonePicker.innerHTML = '<span><i class="bi bi-mic"></i> Microphone in use</span><select id="microphoneSelect" aria-label="Choose a microphone"><option value="">Default microphone</option></select>';
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
  retryButton.innerHTML = '<i class="bi bi-arrow-repeat"></i> Try this section again';
  retryButton.hidden = true;
  nextButton.insertAdjacentElement("beforebegin", retryButton);
  const wordHelp = document.createElement("div");
  wordHelp.className = "word-help";
  wordHelp.hidden = true;
  readingText.insertAdjacentElement("afterend", wordHelp);
  const levelMeter = document.createElement("div");
  levelMeter.className = "level-meter";
  levelMeter.innerHTML = '<span>Microphone level</span><div><i id="levelMeterBar"></i></div><b id="levelMeterValue">Waiting</b>';
  microphonePicker.insertAdjacentElement("afterend", levelMeter);
  const levelMeterBar = document.getElementById("levelMeterBar");
  const levelMeterValue = document.getElementById("levelMeterValue");
  const finalSummary = document.createElement("div");
  finalSummary.className = "final-summary";
  finalSummary.hidden = true;
  history.insertAdjacentElement("afterend", finalSummary);
  const submitMount = document.createElement("div");
  submitMount.className = "pronunciation-submit-mount";
  const pronunciationAside = document.querySelector(".pronunciation-layout aside");
  const lastAsidePanel = pronunciationAside ? pronunciationAside.querySelector(".pronunciation-panel:last-child") : null;
  if (lastAsidePanel) {
    lastAsidePanel.insertAdjacentElement("afterend", submitMount);
  } else {
    finalSummary.insertAdjacentElement("afterend", submitMount);
  }

  function currentStage() {
    return STAGES[currentStageIndex];
  }

  function normalizeWord(value) {
    const lower = value.toLocaleLowerCase("en-US").replace(/[\u2019']/g, "'");
    return lower.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z'-]/g, "").replace(/^[-']+|[-']+$/g, "");
  }

  function tokens(value) {
    return value.split(/\s+/).map(normalizeWord).filter(Boolean);
  }

  function spokenWord(value) {
    return value.replace(/[.,!?;:()[\]{}"]/g, "").trim();
  }

  function renderReference(states = []) {
    let index = 0;
    readingText.innerHTML = currentStage().text.split(/(\s+)/).map((part) => {
      if (/^\s+$/.test(part)) return part;
      const state = states[index++] || "";
      return `<button type="button" class="reading-word ${state}" data-word="${index - 1}" data-spoken="${spokenWord(part)}" title="Show pronunciation note">${part}</button>`;
    }).join("");
  }

  function updateStageUI() {
    const stage = currentStage();
    stageCounter.textContent = stage.final ? "Final challenge" : `Guided practice - ${currentStageIndex + 1} of ${GUIDED_COUNT}`;
    stageTitle.textContent = stage.final ? "Now read the complete paragraph" : stage.label;
    stageProgress.innerHTML = STAGES.map((item, index) => {
      const classes = ["stage-dot"];
      if (index === currentStageIndex) classes.push("is-active");
      if (stageScores[index]) classes.push("is-done");
      return `<span class="${classes.join(" ")}" title="${item.label}">${stageScores[index] ? Math.round(stageScores[index].overall) : item.shortLabel}</span>`;
    }).join("");
    document.getElementById("resultTitle").textContent = `Result - ${stage.label}`;
    modelAudio.pause();
    modelAudio.src = stage.audio;
    modelAudio.playbackRate = currentPlaybackRate();
    modelAudio.load();
    modelButton.querySelector("i").className = "bi bi-play-fill";
    document.querySelector(".player-copy span").textContent = stage.final ? "Complete model - final challenge" : `Audio model - ${stage.label}`;
    renderHistory();
    renderReference();
  }

  function renderHistory() {
    const completed = stageScores.map((score, index) => ({ score, stage: STAGES[index] })).filter((entry) => entry.score);
    history.hidden = completed.length === 0;
    history.innerHTML = completed.length ? `<p>Progress</p><div>${completed.map((entry) => `<span class="history-score ${entry.stage.final ? "is-final" : ""}"><small>${entry.stage.label}</small><strong>${entry.score.overall}</strong></span>`).join("")}</div>` : "";
  }

  function saveProgress() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ currentStageIndex, stageScores, attemptHistory }));
  }

  function pronunciationTip(word) {
    const lower = word.toLocaleLowerCase("en-US");
    const special = {
      "sunny": "Stress the first syllable: SUN-ny. Keep the short u sound.",
      "cloudy": "Stress the first syllable: CLOUD-y. Start with the consonant group /kl/.",
      "windy": "Stress the first syllable: WIN-dy. The final y sounds like /ee/.",
      "rainy": "Stress the first syllable: RAIN-y. Keep one smooth long vowel.",
      "stormy": "Stress the first syllable and keep the r smooth: STOR-my.",
      "pouring": "Stress the first syllable and finish with the ng sound: POUR-ing.",
      "checking": "Stress the first syllable and finish with ng: CHECK-ing.",
      "weather": "Stress the first syllable and use a voiced th sound: WEA-ther.",
      "emma": "Keep two clear syllables: EM-ma.",
      "waiting": "Stress the first syllable and finish with ng: WAIT-ing.",
      "daniel": "Keep three clear syllables: DAN-yel.",
      "people": "Stress the first syllable: PEO-ple.",
      "leaving": "Stress the first syllable and finish with ng: LEAV-ing.",
      "stronger": "Keep the consonant group /str/ clear and finish with a smooth r.",
      "changing": "Start with the ch sound /ch/ and finish with ng: CHANG-ing.",
      "inside": "Stress the second syllable: in-SIDE.",
      "meeting": "Stress the first syllable and finish with ng: MEET-ing.",
      "cafe": "Stress the second syllable: ca-FE.",
      "coach": "Finish with the ch sound; do not add an extra vowel.",
      "called": "The -ed ending sounds like /d/: called.",
      "game": "Hold the long vowel and finish with the final m.",
      "later": "Stress the first syllable and use a smooth final r: LA-ter.",
      "cats": "Finish the /ts/ consonant group clearly.",
      "dogs": "The final s sounds like /z/: dogs.",
      "dry": "Start with /dr/ and hold one clear vowel sound."
    };
    if (special[lower]) return special[lower];
    if (/th/.test(lower)) return "Place the tip of your tongue lightly between your teeth and let the air pass.";
    if (/ing$/.test(lower)) return "Finish with the ng sound; do not add a hard g.";
    if (/^[h]/.test(lower)) return "Release a small breath for the initial h sound.";
    if (/r/.test(lower)) return "Use a smooth English r without rolling the tongue.";
    if (/s$/.test(lower)) return "Listen for the final s sound and keep it short and clear.";
    return "Listen to the complete word, then repeat it slowly with the same stress and number of syllables.";
  }

  function showWordHelp(word) {
    if (!word) return;
    wordHelp.hidden = false;
    wordHelp.innerHTML = `<strong><i class="bi bi-info-circle"></i> ${word}</strong><span>${pronunciationTip(word)} Listen to the professional model for the full audio reference.</span>`;
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
      levelMeterValue.textContent = percent < 4 ? "Speak louder" : percent < 55 ? "Good signal" : "Strong signal";
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

  function currentPlaybackRate() {
    const active = speedButtons.find((button) => button.classList.contains("is-active"));
    const rate = Number(active?.dataset.speed || 1);
    return Number.isFinite(rate) && rate > 0 ? rate : 1;
  }

  function setPlaybackRate(rate) {
    modelAudio.playbackRate = rate;
    speedButtons.forEach((button) => button.classList.toggle("is-active", Number(button.dataset.speed) === rate));
  }

  function setControls(recording, busy = false) {
    micButton.classList.toggle("is-recording", recording);
    micButton.disabled = recording || busy;
    stopButton.disabled = !recording || busy;
    resetButton.disabled = busy;
    microphoneSelect.disabled = recording || busy;
    micButton.querySelector("i").className = recording ? "bi bi-soundwave" : "bi bi-mic-fill";
  }

  function feedbackFor(score, missed, wpm) {
    const focus = missed.slice(0, 5).join(", ");
    if (score >= 88) return "Excellent reading. This section is very accurate and your rhythm sounds natural.";
    if (score >= 70) return `Good reading. Practice these words again: ${focus || "the highlighted words"}.${wpm < 90 ? " Try to read a little more continuously." : ""}`;
    return `Listen to the model again and read this section in short word groups. Start with: ${focus || "the words in red"}.`;
  }

  function evaluate(transcript) {
    const spoken = tokens(transcript);
    const referenceWords = tokens(currentStage().text);
    if (!spoken.length) throw new Error("No speech was recognized.");
    const aligned = align(referenceWords, spoken);
    const durationMinutes = Math.max(1 / 60, recordedDurationMs / 60000);
    const wpm = spoken.length / durationMinutes;
    const completeness = clamp(aligned.matches / referenceWords.length * 100);
    const accuracy = clamp((1 - aligned.distance / Math.max(referenceWords.length, spoken.length)) * 100);
    const fluency = clamp(100 - Math.abs(wpm - 125) * 1.1);
    const overall = clamp(accuracy * .55 + completeness * .3 + fluency * .15);
    const displayWords = currentStage().text.split(/\s+/).map(spokenWord).filter(Boolean);
    const missed = displayWords.filter((_, index) => aligned.states[index] !== "is-correct");
    const previousAttempt = attemptHistory[currentStageIndex].at(-1) || null;
    const attempt = {
      overall,
      accuracy,
      completeness,
      fluency,
      wpm: Math.round(wpm),
      transcript: transcript.trim(),
      referenceText: currentStage().text,
      missedWords: missed,
      stageLabel: currentStage().label,
      final: currentStage().final === true,
      at: new Date().toISOString()
    };
    attemptHistory[currentStageIndex].push(attempt);
    stageScores[currentStageIndex] = attempt;
    saveProgress();
    renderReference(aligned.states);
    document.getElementById("accuracyScore").textContent = `${accuracy}%`;
    document.getElementById("completenessScore").textContent = `${completeness}%`;
    document.getElementById("fluencyScore").textContent = `${fluency}%`;
    document.getElementById("overallScore").textContent = overall;
    document.getElementById("scoreRing").style.setProperty("--score", overall);
    const feedback = document.getElementById("feedback");
    if (currentStage().final) {
      const guided = stageScores.slice(0, GUIDED_COUNT).filter(Boolean);
      const guidedAverage = guided.length ? Math.round(guided.reduce((sum, item) => sum + item.overall, 0) / guided.length) : null;
      feedback.textContent = `${feedbackFor(overall, missed, wpm)}${guidedAverage === null ? "" : ` Section average: ${guidedAverage}/100. Final challenge: ${overall}/100.`}`;
      nextButton.innerHTML = '<i class="bi bi-arrow-counterclockwise"></i> Restart the complete activity';
    } else {
      const comparison = previousAttempt ? ` ${overall > previousAttempt.overall ? "You gained" : overall < previousAttempt.overall ? "Change" : "Same score"}${overall === previousAttempt.overall ? "" : ` ${Math.abs(overall - previousAttempt.overall)} points`} compared with your previous attempt.` : "";
      feedback.textContent = feedbackFor(overall, missed, wpm) + comparison;
      nextButton.innerHTML = currentStageIndex === GUIDED_COUNT - 1 ? '<i class="bi bi-trophy"></i> Go to the final challenge' : '<i class="bi bi-arrow-right"></i> Next section';
    }
    nextButton.hidden = false;
    retryButton.hidden = false;
    renderHistory();
    if (currentStage().final) renderFinalSummary();
    if (submitPanelController) submitPanelController.update();
    stageProgress.children[currentStageIndex]?.classList.add("is-done");
    results.hidden = false;
    results.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function renderFinalSummary() {
    const guided = stageScores.slice(0, GUIDED_COUNT).filter(Boolean);
    if (!guided.length || !stageScores[FINAL_INDEX]) return;
    const bestIndex = guided.reduce((best, score, index) => score.overall > guided[best].overall ? index : best, 0);
    const needsIndex = guided.reduce((lowest, score, index) => score.overall < guided[lowest].overall ? index : lowest, 0);
    const firstAttempts = attemptHistory.flatMap((attempts) => attempts.slice(0, 1));
    const latestAttempts = stageScores.filter(Boolean);
    const firstAverage = firstAttempts.length ? Math.round(firstAttempts.reduce((sum, item) => sum + item.overall, 0) / firstAttempts.length) : 0;
    const latestAverage = latestAttempts.length ? Math.round(latestAttempts.reduce((sum, item) => sum + item.overall, 0) / latestAttempts.length) : 0;
    finalSummary.hidden = false;
    finalSummary.innerHTML = `<h3><i class="bi bi-trophy"></i> Final summary</h3><div><p><span>Best section</span><strong>${STAGES[bestIndex].label} - ${guided[bestIndex].overall}/100</strong></p><p><span>Needs practice</span><strong>${STAGES[needsIndex].label} - ${guided[needsIndex].overall}/100</strong></p><p><span>Progress</span><strong>${firstAverage} -> ${latestAverage}</strong></p><p><span>Final challenge</span><strong>${stageScores[FINAL_INDEX].overall}/100</strong></p></div>`;
  }

  async function transcribeAndEvaluate(blob) {
    analyzing = true;
    setControls(false, true);
    recordStatus.textContent = "Analyzing this section locally...";
    liveTranscript.textContent = "Transcribing...";
    try {
      const response = await fetch(API_PATH, { method: "POST", headers: { "Content-Type": blob.type || "audio/webm" }, body: blob });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || `Server error (${response.status}).`);
      const transcript = (payload.text || "").trim();
      const audioStats = payload.audio || {};
      if (!transcript) {
        if (Number(audioStats.rms || 0) < 0.0008) throw new Error("The recording arrived silent. Choose another microphone and try again.");
        throw new Error("Whisper detected sound but did not identify English words. Speak a little closer to the microphone.");
      }
      liveTranscript.textContent = transcript;
      evaluate(transcript);
      recordStatus.textContent = `${currentStage().label} evaluated. Check your result.`;
    } catch (error) {
      recordStatus.textContent = "The analysis could not be completed.";
      liveTranscript.textContent = error.message || "Transcription error.";
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
      microphoneSelect.innerHTML = '<option value="">Default microphone</option>' + devices.map((device, index) => `<option value="${device.deviceId}">${device.label || `Microphone ${index + 1}`}</option>`).join("");
      if ([...microphoneSelect.options].some((option) => option.value === currentValue)) microphoneSelect.value = currentValue;
    } catch (_error) {
      microphoneSelect.innerHTML = '<option value="">Default microphone</option>';
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
        const canUseMicrophone = await window.JaraMicPermissions.ensureReady({ micButton, stopButton, recordStatus, recordHelp, unsupported, localUrl: LOCAL_URL, language: "en" });
        if (!canUseMicrophone) return;
        window.JaraMicPermissions.beforeRequest({ recordStatus, recordHelp, language: "en" });
      } else {
        recordStatus.textContent = "Requesting microphone permission...";
        recordHelp.textContent = "Accept the browser permission prompt to start recording.";
      }
      const audioConstraints = window.JaraMicPermissions?.audioConstraints(microphoneSelect.value) || { echoCancellation: { ideal: true }, noiseSuppression: { ideal: true }, autoGainControl: { ideal: true }, channelCount: { ideal: 1 } };
      if (microphoneSelect.value) audioConstraints.deviceId = { exact: microphoneSelect.value };
      mediaStream = await navigator.mediaDevices.getUserMedia({ audio: audioConstraints, video: false });
      startLevelMeter(mediaStream);
      const activeTrack = mediaStream.getAudioTracks()[0];
      recordHelp.textContent = activeTrack?.label ? `Active microphone: ${activeTrack.label}` : "Active microphone";
      await refreshMicrophones();
      const activeDeviceId = activeTrack?.getSettings?.().deviceId;
      if (activeDeviceId && [...microphoneSelect.options].some((option) => option.value === activeDeviceId)) microphoneSelect.value = activeDeviceId;
      window.JaraMicPermissions?.markActive({ stream: mediaStream, microphoneSelect, recordHelp, language: "en" });
      chunks = [];
      discardRecording = false;
      const preferredType = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"].find((type) => MediaRecorder.isTypeSupported(type)) || "";
      mediaRecorder = preferredType ? new MediaRecorder(mediaStream, { mimeType: preferredType }) : new MediaRecorder(mediaStream);
      mediaRecorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
      mediaRecorder.onerror = () => {
        recordStatus.textContent = "The browser could not record audio.";
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
      recordStatus.textContent = `Recording - ${currentStage().label}`;
      liveTranscript.textContent = "Read only the text shown above.";
    } catch (error) {
      stopTracks();
      if (window.JaraMicPermissions?.handleError(error, { recordStatus, recordHelp, microphoneSelect, language: "en" })) {
        setControls(false, false);
        return;
      }
      const messages = {
        NotAllowedError: "Microphone permission was denied. Open your browser settings, allow the microphone for JaraLingua, and try again.",
        SecurityError: "The microphone requires HTTPS or localhost. On production, make sure the page is served securely.",
        NotFoundError: "No microphone was detected on this device.",
        NotReadableError: "The microphone is being used by another application. Close other apps and try again.",
        AbortError: "The browser interrupted microphone activation. Please try again.",
        OverconstrainedError: "The selected microphone is not available. Choose the default microphone and try again.",
        NotSupportedError: "This browser does not support audio recording. Use a recent version of Chrome or Edge."
      };
      recordStatus.textContent = messages[error?.name] || `The microphone is unavailable: ${error?.message || "unknown error"}`;
      recordHelp.textContent = "On Android or desktop, check browser permissions and make sure no other app is using the microphone.";
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
    recordStatus.textContent = "Preparing the analysis...";
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
    liveTranscript.textContent = "Your transcription will appear here after the analysis.";
    recordStatus.textContent = `Ready - ${currentStage().label}`;
    timer.textContent = "00:00";
    results.hidden = true;
    nextButton.hidden = true;
    retryButton.hidden = true;
    wordHelp.hidden = true;
    finalSummary.hidden = true;
    levelMeterBar.style.width = "0%";
    levelMeterValue.textContent = "Waiting";
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
      resetAllProgress();
    } else {
      currentStageIndex += 1;
    }
    saveProgress();
    resetAttempt(true);
    updateStageUI();
    stagePanel.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function resetAllProgress() {
    currentStageIndex = 0;
    stageScores.fill(null);
    attemptHistory.forEach((attempts) => attempts.splice(0));
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SUBMISSION_KEY);
  }

  function readStoredUser(key, provider) {
    try {
      const sessionRaw = sessionStorage.getItem(key);
      const localRaw = localStorage.getItem(key);
      const saved = JSON.parse(sessionRaw || localRaw || "null");
      if (!saved || !saved.exp || Date.now() / 1000 > saved.exp) {
        sessionStorage.removeItem(key);
        localStorage.removeItem(key);
        return null;
      }
      if (!sessionRaw && localRaw) sessionStorage.setItem(key, JSON.stringify(saved));
      return Object.assign({ provider }, saved);
    } catch (_error) {
      sessionStorage.removeItem(key);
      localStorage.removeItem(key);
      return null;
    }
  }

  function readUser() {
    return readStoredUser(GOOGLE_USER_KEY, "google") || readStoredUser(MICROSOFT_USER_KEY, "microsoft") || readStoredUser(LOCAL_USER_KEY, "local");
  }

  function openLoginPanel() {
    const trigger = document.querySelector("[data-auth-toggle], [data-auth-nav-toggle]");
    if (trigger) trigger.click();
  }

  function gradeFromScore(score) {
    return Math.round((Number(score || 0) / 20) * 100) / 100;
  }

  function createSubmitPanel() {
    const panel = document.createElement("div");
    panel.className = "pronunciation-submit-panel";
    panel.innerHTML = `
      <h3><i class="bi bi-send-check"></i> Send to teacher</h3>
      <p>This pronunciation follow-up sends a written report to the teacher: scores, transcript, missed words, and unit focus. It has weight 0 and does not affect the accumulated percentage.</p>
      <div class="pronunciation-submit-metrics">
        <span><b data-submit-score>--</b><small>Activity average</small></span>
        <span><b data-submit-grade>--</b><small>Reference grade / 5</small></span>
      </div>
      <div class="pronunciation-submit-actions">
        <button type="button" class="action-button reset" data-submit-reset><i class="bi bi-arrow-repeat"></i> Reset full challenge</button>
        <button type="button" class="action-button submit-grade" data-submit-teacher disabled><i class="bi bi-send-fill"></i> Send to teacher</button>
      </div>
      <p class="pronunciation-submit-status" data-submit-status aria-live="polite"></p>
    `;
    const scoreNode = panel.querySelector("[data-submit-score]");
    const gradeNode = panel.querySelector("[data-submit-grade]");
    const submitButton = panel.querySelector("[data-submit-teacher]");
    const resetButton = panel.querySelector("[data-submit-reset]");
    const statusNode = panel.querySelector("[data-submit-status]");
    let submitState = "idle";
    let submittedMessage = "";
    try {
      const savedSubmission = JSON.parse(localStorage.getItem(SUBMISSION_KEY) || "null");
      if (savedSubmission && savedSubmission.submittedAt) {
        submitState = "submitted";
        submittedMessage = "Submitted to teacher. Reference grade: " + Number(savedSubmission.grade || 0).toFixed(2) + "/5. Weight: 0.";
      }
    } catch (_error) {
      localStorage.removeItem(SUBMISSION_KEY);
    }

    function setStatus(message, type) {
      statusNode.textContent = message || "";
      statusNode.className = "pronunciation-submit-status" + (type ? " " + type : "");
    }

    function completeReport() {
      const complete = stageScores.length === STAGES.length && stageScores.every((score) => score && Number.isFinite(Number(score.overall)));
      if (!complete) return null;
      const average = Math.round(stageScores.reduce((sum, score) => sum + Number(score.overall || 0), 0) / STAGES.length);
      return { average, grade: gradeFromScore(average), finalAttempt: stageScores[FINAL_INDEX] };
    }

    function update() {
      const report = completeReport();
      if (!report) {
        panel.classList.remove("is-submitted");
        panel.querySelector(".pronunciation-delivery-preview")?.remove();
        scoreNode.textContent = "--";
        gradeNode.textContent = "--";
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="bi bi-send-fill"></i> Send to teacher';
        if (submitState !== "submitted" && submitState !== "error") {
          setStatus("Complete the 6 sections and the final challenge first. Then this button will unlock so you can send the report to the teacher.", "pending");
        }
        return;
      }
      scoreNode.textContent = report.average + "/100";
      gradeNode.textContent = report.grade.toFixed(2) + "/5";
      panel.querySelector(".pronunciation-delivery-preview")?.remove();
      const preview = document.createElement("div");
      preview.className = "pronunciation-delivery-preview";
      preview.innerHTML = `<p><strong>Delivery preview</strong></p><p><span>Sections:</span> ${STAGES.length} completed</p><p><span>Final text:</span> ${report.finalAttempt.referenceText}</p><p><span>Gradebook:</span> follow-up activity, weight 0, visible to teacher.</p>`;
      panel.querySelector(".pronunciation-submit-actions").insertAdjacentElement("beforebegin", preview);
      if (submitState === "submitted") {
        panel.classList.add("is-submitted");
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="bi bi-check-circle-fill"></i> Submitted to teacher';
        setStatus(submittedMessage || "Submitted to teacher. Your teacher can now see this pronunciation follow-up.", "success");
        return;
      }
      panel.classList.remove("is-submitted");
      submitButton.disabled = submitState === "submitting";
      submitButton.innerHTML = submitState === "submitting" ? '<i class="bi bi-hourglass-split"></i> Sending to teacher...' : '<i class="bi bi-send-fill"></i> Send to teacher';
      if (submitState === "idle") {
        setStatus("Report ready. You can now send this activity to the teacher.", "success");
      }
    }

    async function submit() {
      const report = completeReport();
      if (!report) {
        setStatus("Complete all sections before sending this activity.", "error");
        update();
        return;
      }
      const user = readUser();
      if (!user || !user.credential) {
        setStatus("Sign in first with the account registered in Basic English.", "error");
        openLoginPanel();
        return;
      }
      submitButton.disabled = true;
      submitState = "submitting";
      setStatus("Preparing your pronunciation report and sending it to the teacher...", "pending");
      update();
      try {
        const response = await fetch(SUBMIT_PATH, {
          method: "POST",
          headers: {
            Authorization: "Bearer " + user.credential,
            "X-Jaralingua-Auth-Provider": user.provider || "google",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            clientSubmissionId: Date.now() + "-" + Math.random().toString(16).slice(2),
            activityTitle: "Basic 2 Unit 1 Pronunciation - Weather and Going Out",
            stageScores: stageScores.map((score, index) => Object.assign({}, score, {
              stage: STAGES[index].label,
              referenceText: STAGES[index].text
            })),
            summary: {
              score100: report.average,
              grade: report.grade,
              weight: 0,
              followUpOnly: true,
              doesNotAffectAverage: true
            }
          })
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          if (payload.error === "student_not_authorized") throw new Error("This account is not linked to a Basic English student record.");
          throw new Error("The activity could not be submitted.");
        }
        submitState = "submitted";
        const referenceGrade = Number(payload.grade).toFixed(2);
        submittedMessage = "Submitted to teacher. Your teacher can now see the pronunciation report. Reference grade: " + referenceGrade + "/5. Weight: 0.";
        localStorage.setItem(SUBMISSION_KEY, JSON.stringify({ submittedAt: payload.submittedAt || new Date().toISOString(), grade: payload.grade, score100: payload.score100 }));
        setStatus(submittedMessage, "success");
      } catch (error) {
        submitState = "error";
        setStatus(error.message || "The activity could not be submitted.", "error");
      } finally {
        update();
      }
    }

    resetButton.addEventListener("click", () => {
      resetAllProgress();
      saveProgress();
      resetAttempt(true);
      updateStageUI();
      submitState = "idle";
      submittedMessage = "";
      update();
      setStatus("Full pronunciation challenge reset. You can start again.", "pending");
      stagePanel.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    submitButton.addEventListener("click", submit);
    update();
    return { panel, update };
  }

  modelButton.addEventListener("click", async () => {
    if (modelAudio.paused) {
      try {
        modelAudio.playbackRate = currentPlaybackRate();
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
  speedButtons.forEach((button) => button.addEventListener("click", () => setPlaybackRate(Number(button.dataset.speed))));
  if (shadowModeButton) {
    shadowModeButton.addEventListener("click", async () => {
      shadowMode = !shadowMode;
      shadowModeButton.classList.toggle("is-active", shadowMode);
      shadowModeStatus.textContent = shadowMode ? "On - listen, then repeat immediately" : "Off";
      if (shadowMode) {
        recordStatus.textContent = "Shadow mode on. Listen to the model, repeat immediately, then record your own reading.";
        try {
          modelAudio.currentTime = 0;
          modelAudio.playbackRate = currentPlaybackRate();
          await modelAudio.play();
          modelButton.querySelector("i").className = "bi bi-pause-fill";
        } catch (_error) {
          modelButton.querySelector("i").className = "bi bi-play-fill";
        }
      }
    });
  }
  micButton.addEventListener("click", start);
  stopButton.addEventListener("click", finish);
  resetButton.addEventListener("click", () => resetAttempt(true));
  nextButton.addEventListener("click", advanceStage);
  retryButton.addEventListener("click", () => resetAttempt(true));
  readingText.addEventListener("click", (event) => { const word = event.target.closest(".reading-word")?.dataset.spoken; if (word) showWordHelp(word); });

  submitPanelController = createSubmitPanel();
  submitMount.appendChild(submitPanelController.panel);
  refreshMicrophones();
  navigator.mediaDevices?.addEventListener?.("devicechange", refreshMicrophones);
  setPlaybackRate(1);
  updateStageUI();
  resetAttempt(false);
  if (location.protocol === "file:") {
    unsupported.hidden = false;
    micButton.disabled = true;
    recordStatus.textContent = "The microphone does not work in file mode";
    recordHelp.textContent = "Open this activity from localhost or the HTTPS website.";
    unsupported.innerHTML = `<strong>Local file mode detected.</strong><br>Browsers block microphone access on file:// addresses.<br><a href="${LOCAL_URL}"><i class="bi bi-box-arrow-up-right"></i> Open the compatible version</a>`;
  } else if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
    unsupported.hidden = false;
    micButton.disabled = true;
    recordStatus.textContent = "Voice recording unavailable";
  }
})();
