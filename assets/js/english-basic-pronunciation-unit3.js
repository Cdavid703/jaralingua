(() => {
  "use strict";

  const STAGES = [
    { label: "Section 1", shortLabel: "1", audio: "audio/pronunciation/unit-3/section-1.mp3", text: "My favorite person is my older sister, Laura." },
    { label: "Section 2", shortLabel: "2", audio: "audio/pronunciation/unit-3/section-2.mp3", text: "She is twenty-eight years old and works as a nurse." },
    { label: "Section 3", shortLabel: "3", audio: "audio/pronunciation/unit-3/section-3.mp3", text: "She has long dark hair and a friendly smile. Laura is patient, funny, and very kind." },
    { label: "Section 4", shortLabel: "4", audio: "audio/pronunciation/unit-3/section-4.mp3", text: "She loves music and family dinners, and I always enjoy spending time with her." },
    { label: "Final challenge", shortLabel: "Final", final: true, audio: "audio/pronunciation/unit-3/my-favorite-person-model-us.mp3", text: "My favorite person is my older sister, Laura. She is twenty-eight years old and works as a nurse. She has long dark hair and a friendly smile. Laura is patient, funny, and very kind. She loves music and family dinners, and I always enjoy spending time with her." }
  ];

  const API_PATH = "/api/english-basic/pronunciation-assessment";
  const STORAGE_KEY = "jaralingua:english-basic:pronunciation-unit3:v1";
  const LOCAL_URL = "http://127.0.0.1:8020/ingles/basico/pronunciation-unit-3-my-favorite-person.html";
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

  function currentStage() {
    return STAGES[currentStageIndex];
  }

  function normalizeWord(value) {
    const lower = value.toLocaleLowerCase("en-US").replace(/[\u2019']/g, "'");
    return lower.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z'-]/g, "").replace(/^[-']+|[-']+$/g, "");
  }

  function tokens(value) {
    return value.replace(/-/g, " ").split(/\s+/).map(normalizeWord).filter(Boolean);
  }

  function spokenWord(value) {
    return value.replace(/[.,!?;:()[\]{}«»"]/g, "").trim();
  }

  function renderReference(states = []) {
    let index = 0;
    readingText.innerHTML = currentStage().text.split(/(\s+)/).map((part) => {
      if (/^\s+$/.test(part)) return part;
      const state = states[index++] || "";
      return `<button type="button" class="reading-word ${state}" data-word="${index - 1}" data-spoken="${spokenWord(part)}" title="Listen to this word">${part}</button>`;
    }).join("");
  }

  function updateStageUI() {
    const stage = currentStage();
    stageCounter.textContent = stage.final ? "Final challenge" : `Guided practice · ${currentStageIndex + 1} of 4`;
    stageTitle.textContent = stage.final ? "Now read the complete paragraph" : stage.label;
    stageProgress.innerHTML = STAGES.map((item, index) => {
      const classes = ["stage-dot"];
      if (index === currentStageIndex) classes.push("is-active");
      if (stageScores[index]) classes.push("is-done");
      return `<span class="${classes.join(" ")}" title="${item.label}">${stageScores[index] ? Math.round(stageScores[index].overall) : item.shortLabel}</span>`;
    }).join("");
    document.getElementById("resultTitle").textContent = `Result · ${stage.label}`;
    modelAudio.pause();
    modelAudio.src = stage.audio;
    modelAudio.load();
    modelButton.querySelector("i").className = "bi bi-play-fill";
    document.querySelector(".player-copy span").textContent = stage.final ? "Complete model · final challenge" : `Audio model · ${stage.label}`;
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
      "favorite": "Stress the first syllable: FAV-or-ite. Keep the middle vowel short and relaxed.",
      "older": "Stress the first syllable and finish with a smooth American r: OLD-er.",
      "sister": "Begin with a clear /s/ and finish with a smooth r: SIS-ter.",
      "laura": "Stress the first syllable: LAU-ra.",
      "twenty-eight": "Connect both parts smoothly and keep the final t in eight clear before years.",
      "works": "Finish with the consonant group /rks/ and a clear unvoiced /s/.",
      "nurse": "Use a strong r-colored vowel and finish with a clear /s/ sound.",
      "hair": "Open the vowel and finish with a smooth English r.",
      "friendly": "Stress the first syllable and keep all three parts clear: FRIEND-ly.",
      "patient": "Stress the first syllable; ti sounds like /ʃ/: PA-tient.",
      "funny": "Stress the first syllable and keep the short u sound: FUN-ny.",
      "loves": "The final s sounds like /z/: loves /lʌvz/.",
      "family": "Stress the first syllable: FAM-i-ly.",
      "dinners": "Stress DIN and finish with a smooth r plus z sound.",
      "enjoy": "Stress the second syllable: en-JOY.",
      "spending": "Stress SPEND and finish with the ng sound /ŋ/."
    };
    if (special[lower]) return special[lower];
    if (/th/.test(lower)) return "Place the tip of your tongue lightly between your teeth and let the air pass.";
    if (/ing$/.test(lower)) return "Finish with the ng sound /ŋ/; do not add a hard g.";
    if (/^[h]/.test(lower)) return "Release a small breath for the initial h sound.";
    if (/r/.test(lower)) return "Use a smooth English r without rolling the tongue.";
    if (/s$/.test(lower)) return "Listen for the final s sound and keep it short and clear.";
    return "Listen to the complete word, then repeat it slowly with the same stress and number of syllables.";
  }

  function speakWord(word) {
    if (!word || !window.speechSynthesis) return;
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    const voices = speechSynthesis.getVoices();
    const englishVoice = voices.find((voice) => voice.lang.toLowerCase() === "en-us") || voices.find((voice) => voice.lang.toLowerCase().startsWith("en"));
    utterance.lang = "en-US";
    if (englishVoice) utterance.voice = englishVoice;
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
    const fluency = clamp(100 - Math.abs(wpm - 105) * 1.35);
    const overall = clamp(accuracy * .55 + completeness * .3 + fluency * .15);
    const previousAttempt = attemptHistory[currentStageIndex].at(-1) || null;
    const attempt = { overall, accuracy, completeness, fluency, at: new Date().toISOString() };
    attemptHistory[currentStageIndex].push(attempt);
    stageScores[currentStageIndex] = attempt;
    saveProgress();
    renderReference(aligned.states);
    document.getElementById("accuracyScore").textContent = `${accuracy}%`;
    document.getElementById("completenessScore").textContent = `${completeness}%`;
    document.getElementById("fluencyScore").textContent = `${fluency}%`;
    document.getElementById("overallScore").textContent = overall;
    document.getElementById("scoreRing").style.setProperty("--score", overall);
    const displayWords = currentStage().text.split(/\s+/).map(spokenWord).filter(Boolean);
    const missed = displayWords.filter((_, index) => aligned.states[index] !== "is-correct");
    const feedback = document.getElementById("feedback");
    if (currentStage().final) {
      const guided = stageScores.slice(0, 4).filter(Boolean);
      const guidedAverage = guided.length ? Math.round(guided.reduce((sum, item) => sum + item.overall, 0) / guided.length) : null;
      feedback.textContent = `${feedbackFor(overall, missed, wpm)}${guidedAverage === null ? "" : ` Section average: ${guidedAverage}/100. Final challenge: ${overall}/100.`}`;
      nextButton.innerHTML = '<i class="bi bi-arrow-counterclockwise"></i> Restart the complete activity';
    } else {
      const comparison = previousAttempt ? ` ${overall > previousAttempt.overall ? "You gained" : overall < previousAttempt.overall ? "Change" : "Same score"}${overall === previousAttempt.overall ? "" : ` ${Math.abs(overall - previousAttempt.overall)} points`} compared with your previous attempt.` : "";
      feedback.textContent = feedbackFor(overall, missed, wpm) + comparison;
      nextButton.innerHTML = currentStageIndex === 3 ? '<i class="bi bi-trophy"></i> Go to the final challenge' : '<i class="bi bi-arrow-right"></i> Next section';
    }
    nextButton.hidden = false;
    retryButton.hidden = false;
    renderHistory();
    if (currentStage().final) renderFinalSummary();
    stageProgress.children[currentStageIndex]?.classList.add("is-done");
    results.hidden = false;
    results.scrollIntoView({ behavior: "smooth", block: "nearest" });
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
    finalSummary.innerHTML = `<h3><i class="bi bi-trophy"></i> Final summary</h3><div><p><span>Best section</span><strong>${STAGES[bestIndex].label} · ${guided[bestIndex].overall}/100</strong></p><p><span>Needs practice</span><strong>${STAGES[needsIndex].label} · ${guided[needsIndex].overall}/100</strong></p><p><span>Progress</span><strong>${firstAverage} → ${latestAverage}</strong></p><p><span>Final challenge</span><strong>${stageScores[4].overall}/100</strong></p></div>`;
  }

  async function transcribeAndEvaluate(blob) {
    analyzing = true;
    setControls(false, true);
    recordStatus.textContent = "Analyzing this section locally…";
    liveTranscript.textContent = "Transcribing…";
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
      recordStatus.textContent = "Requesting microphone permission?";
      recordHelp.textContent = "Accept the browser permission prompt to start recording.";
      const audioConstraints = { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 };
      if (microphoneSelect.value) audioConstraints.deviceId = { exact: microphoneSelect.value };
      mediaStream = await navigator.mediaDevices.getUserMedia({ audio: audioConstraints, video: false });
      startLevelMeter(mediaStream);
      const activeTrack = mediaStream.getAudioTracks()[0];
      recordHelp.textContent = activeTrack?.label ? `Active microphone: ${activeTrack.label}` : "Active microphone";
      await refreshMicrophones();
      const activeDeviceId = activeTrack?.getSettings?.().deviceId;
      if (activeDeviceId && [...microphoneSelect.options].some((option) => option.value === activeDeviceId)) microphoneSelect.value = activeDeviceId;
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
      recordStatus.textContent = `Recording ? ${currentStage().label}`;
      liveTranscript.textContent = "Read only the text shown above.";
    } catch (error) {
      stopTracks();
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
    recordStatus.textContent = "Preparing the analysis…";
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
    recordStatus.textContent = `Ready · ${currentStage().label}`;
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
      currentStageIndex = 0;
      stageScores.fill(null);
      attemptHistory.forEach((attempts) => attempts.splice(0));
      localStorage.removeItem(STORAGE_KEY);
    } else {
      currentStageIndex += 1;
    }
    saveProgress();
    resetAttempt(true);
    updateStageUI();
    stagePanel.scrollIntoView({ behavior: "smooth", block: "center" });
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
    recordStatus.textContent = "The microphone does not work in file mode";
    recordHelp.textContent = "Open this activity from localhost or the HTTPS website.";
    unsupported.innerHTML = `<strong>Local file mode detected.</strong><br>Browsers block microphone access on file:// addresses.<br><a href="${LOCAL_URL}"><i class="bi bi-box-arrow-up-right"></i> Open the compatible version</a>`;
  } else if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
    unsupported.hidden = false;
    micButton.disabled = true;
    recordStatus.textContent = "Recording vocal indisponible";
  }
})();
