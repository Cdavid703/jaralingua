(() => {
  "use strict";

  const DEFAULT_STAGES = [
    { label: "Neighbor + who", shortLabel: "1", audio: "audio/pronunciation/unit-1-intermediate2/section-1.mp3", text: "Mr. Okafor is the neighbor who lives across the hall and brings people together." },
    { label: "Comma pause + that", shortLabel: "2", audio: "audio/pronunciation/unit-1-intermediate2/section-2.mp3", text: "Iris, who was in my evening class, is the old classmate that I recently got back in touch with." },
    { label: "New contact + who", shortLabel: "3", audio: "audio/pronunciation/unit-1-intermediate2/section-3.mp3", text: "Gabriel is a photographer who became a new contact after dinner." },
    { label: "Relationship expressions", shortLabel: "4", audio: "audio/pronunciation/unit-1-intermediate2/section-4.mp3", text: "They are people I get on well with, and I want to keep in touch." },
    { label: "Final challenge", shortLabel: "Final", final: true, audio: "audio/pronunciation/unit-1-intermediate2/people-who-changed-my-circle-model-us.mp3", text: "Mr. Okafor is the neighbor who lives across the hall and brings people together. Iris, who was in my evening class, is the old classmate that I recently got back in touch with. Gabriel is a photographer who became a new contact after dinner. They are people I get on well with, and I want to keep in touch." }
  ];

  const PAGE_CONFIG = window.JaraIntermediate2PronunciationConfig || {};
  const STAGES = Array.isArray(PAGE_CONFIG.stages) && PAGE_CONFIG.stages.length >= 2 ? PAGE_CONFIG.stages : DEFAULT_STAGES;
  const GUIDED_COUNT = STAGES.filter((stage) => !stage.final).length;
  const FINAL_STAGE_INDEX = STAGES.findIndex((stage) => stage.final);
  const API_PATH = PAGE_CONFIG.apiPath || "/api/english-intermediate/pronunciation-assessment";
  const SUBMIT_PATH = PAGE_CONFIG.submitPath || "/api/intermediate2/unit1-pronunciation/submit";
  const INBOX_PATH = PAGE_CONFIG.inboxPath || "/api/intermediate2/unit1-pronunciation/submissions";
  const AUDIO_PATH = PAGE_CONFIG.audioPath || "/api/intermediate2/unit1-pronunciation/audio";
  const STORAGE_KEY = PAGE_CONFIG.storageKey || "jaralingua:english-intermediate2:pronunciation-unit1:v1";
  const ACTIVITY_TITLE = PAGE_CONFIG.activityTitle || "Unit 1 Pronunciation - People Who Changed My Circle";
  const DELIVERY_PRODUCT = PAGE_CONFIG.product || "complete social-circle paragraph";
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
  let finalAudioBlob = null;
  let finalAudioDataUrlPromise = null;
  let submitPanelController = null;
  let discardRecording = false;
  let analyzing = false;
  let audioContext = null;
  let analyser = null;
  let meterFrame = null;
  let maxInputLevel = 0;
  let shadowMode = false;
  let clientSubmissionId = "";
  let wordCueTimer = null;
  let activeWordButton = null;

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
  wordHelp.id = "wordHelp";
  wordHelp.setAttribute("role", "status");
  wordHelp.setAttribute("aria-live", "polite");
  wordHelp.tabIndex = -1;
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
    if (lower === "travelled") return "traveled";
    return lower.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z'-]/g, "").replace(/^[-']+|[-']+$/g, "");
  }

  function canonicalSpeech(value) {
    let output = String(value || "");
    const equivalences = Array.isArray(PAGE_CONFIG.speechEquivalences) ? PAGE_CONFIG.speechEquivalences : [];
    equivalences.forEach((pair) => {
      if (!Array.isArray(pair) || pair.length !== 2 || !pair[0] || !pair[1]) return;
      const escaped = String(pair[0]).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      output = output.replace(new RegExp(`\\b${escaped}\\b`, "gi"), String(pair[1]));
    });
    return output;
  }

  function tokens(value) {
    return canonicalSpeech(value).split(/\s+/).map(normalizeWord).filter(Boolean);
  }

  function spokenWord(value) {
    return value.replace(/[.,!?;:()[\]{}"]/g, "").trim();
  }

  function renderReference(states = []) {
    let index = 0;
    readingText.innerHTML = currentStage().text.split(/(\s+)/).map((part) => {
      if (/^\s+$/.test(part)) return part;
      const state = states[index++] || "";
      const word = spokenWord(part);
      return `<button type="button" class="reading-word ${state}" data-word="${index - 1}" data-spoken="${word}" aria-controls="wordHelp" aria-label="Hear and get pronunciation help for ${word}" title="Tap to hear this word in the ElevenLabs model">${part}</button>`;
    }).join("");
    readingText.querySelectorAll(".reading-word").forEach((button) => {
      button.addEventListener("click", () => showWordHelp(button.dataset.spoken, button, Number(button.dataset.word)));
    });
  }

  function updateStageUI() {
    const stage = currentStage();
    stopWordCue();
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
    const special = Object.assign({
      "okafor": "Keep three clear syllables: OH-ka-for. Give the first syllable the strongest stress.",
      "neighbor": "Say NAY-bor with a smooth final American r, then link neighbor_who.",
      "who": "Release a light /h/ sound. After a noun, connect it naturally without losing the word.",
      "lives": "Keep the final voiced /z/ sound before across.",
      "across": "Stress the second syllable: a-CROSS.",
      "brings": "Finish with the /ngz/ sound; do not add an extra vowel.",
      "together": "Stress the second syllable: to-GE-ther. The final th is voiced.",
      "iris": "Say two clear syllables: EYE-ris.",
      "evening": "Stress the first syllable and finish with ng: EVE-ning.",
      "classmate": "Stress CLASS and finish MATE clearly.",
      "that": "Use a voiced th /ð/: place the tongue lightly between the teeth and use your voice.",
      "recently": "Stress the first syllable: RE-cent-ly.",
      "touch": "Finish with a clear /ch/ sound. In in_touch, connect the words first.",
      "gabriel": "Keep three syllables: GAY-bree-el.",
      "photographer": "Stress the second syllable: pho-TOG-ra-pher.",
      "became": "Stress the second syllable: be-CAME.",
      "contact": "As a noun, stress the first syllable: CON-tact.",
      "dinner": "Stress the first syllable and use a smooth final r: DIN-ner.",
      "people": "Keep two syllables: PEO-ple.",
      "well": "Stress well at the end of the phrase get_on_well.",
      "keep": "Hold the long vowel, then connect keep_in_touch."
    }, PAGE_CONFIG.tips || {});
    if (special[lower]) return special[lower];
    if (/th/.test(lower)) return "Place the tip of your tongue lightly between your teeth and let the air pass.";
    if (/ing$/.test(lower)) return "Finish with the ng sound; do not add a hard g.";
    if (/^[h]/.test(lower)) return "Release a small breath for the initial h sound.";
    if (/r/.test(lower)) return "Use a smooth English r without rolling the tongue.";
    if (/s$/.test(lower)) return "Listen for the final s sound and keep it short and clear.";
    return "Listen to the complete word, then repeat it slowly with the same stress and number of syllables.";
  }

  function showWordHelp(word, sourceButton = null, wordIndex = -1) {
    if (!word) return;
    readingText.querySelectorAll(".reading-word.is-selected").forEach((button) => {
      button.classList.remove("is-selected");
      button.setAttribute("aria-pressed", "false");
    });
    if (sourceButton) {
      sourceButton.classList.add("is-selected");
      sourceButton.setAttribute("aria-pressed", "true");
    }
    wordHelp.hidden = false;
    wordHelp.innerHTML = `<strong><i class="bi bi-volume-up"></i> How to pronounce “${word}”</strong><span>${pronunciationTip(word)} Playing this moment from the ElevenLabs model now; then repeat the full meaning group.</span>`;
    playWordCue(wordIndex, sourceButton);
    requestAnimationFrame(() => wordHelp.scrollIntoView({ behavior: "smooth", block: "nearest" }));
  }

  function wordTimingWeight(part) {
    const word = spokenWord(part);
    const letters = word.replace(/[^A-Za-z]/g, "").length;
    let weight = .28 + Math.min(letters, 13) * .075;
    if (/[,;:]/.test(part)) weight += .13;
    if (/[.!?]$/.test(part)) weight += .25;
    return weight;
  }

  function wordCue(wordIndex) {
    const parts = currentStage().text.split(/\s+/).filter(Boolean);
    if (!Number.isInteger(wordIndex) || wordIndex < 0 || wordIndex >= parts.length || !Number.isFinite(modelAudio.duration) || modelAudio.duration <= 0) return null;
    const weights = parts.map(wordTimingWeight);
    const leadIn = .08;
    const leadOut = .12;
    const usableDuration = Math.max(.4, modelAudio.duration - leadIn - leadOut);
    const totalWeight = weights.reduce((total, value) => total + value, 0);
    const before = weights.slice(0, wordIndex).reduce((total, value) => total + value, 0);
    const through = before + weights[wordIndex];
    return {
      start: Math.max(0, leadIn + usableDuration * (before / totalWeight) - .07),
      end: Math.min(modelAudio.duration, leadIn + usableDuration * (through / totalWeight) + .18)
    };
  }

  function stopWordCue() {
    if (wordCueTimer) clearTimeout(wordCueTimer);
    wordCueTimer = null;
    activeWordButton?.classList.remove("is-playing");
    activeWordButton = null;
  }

  async function playWordCue(wordIndex, sourceButton) {
    const cue = wordCue(wordIndex);
    if (!cue) {
      const requestedStage = currentStageIndex;
      wordHelp.querySelector("span").textContent = `${pronunciationTip(sourceButton?.dataset.spoken || "")} The ElevenLabs model is loading this short reference.`;
      modelAudio.addEventListener("loadedmetadata", () => {
        if (requestedStage === currentStageIndex && sourceButton?.isConnected) playWordCue(wordIndex, sourceButton);
      }, { once: true });
      return;
    }
    stopWordCue();
    modelAudio.pause();
    modelAudio.currentTime = cue.start;
    modelAudio.playbackRate = currentPlaybackRate();
    activeWordButton = sourceButton;
    sourceButton?.classList.add("is-playing");
    try {
      await modelAudio.play();
      modelButton.querySelector("i").className = "bi bi-pause-fill";
      const clipLength = Math.max(.22, (cue.end - cue.start) / currentPlaybackRate());
      wordCueTimer = setTimeout(() => {
        modelAudio.pause();
        modelButton.querySelector("i").className = "bi bi-play-fill";
        stopWordCue();
      }, clipLength * 1000);
    } catch (_error) {
      sourceButton?.classList.remove("is-playing");
      wordHelp.querySelector("span").textContent = `${pronunciationTip(sourceButton?.dataset.spoken || "")} The model could not start. Tap the word once more.`;
    }
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
    if (!guided.length || FINAL_STAGE_INDEX < 0 || !stageScores[FINAL_STAGE_INDEX]) return;
    const bestIndex = guided.reduce((best, score, index) => score.overall > guided[best].overall ? index : best, 0);
    const needsIndex = guided.reduce((lowest, score, index) => score.overall < guided[lowest].overall ? index : lowest, 0);
    const firstAttempts = attemptHistory.flatMap((attempts) => attempts.slice(0, 1));
    const latestAttempts = stageScores.filter(Boolean);
    const firstAverage = firstAttempts.length ? Math.round(firstAttempts.reduce((sum, item) => sum + item.overall, 0) / firstAttempts.length) : 0;
    const latestAverage = latestAttempts.length ? Math.round(latestAttempts.reduce((sum, item) => sum + item.overall, 0) / latestAttempts.length) : 0;
    finalSummary.hidden = false;
    finalSummary.innerHTML = `<h3><i class="bi bi-trophy"></i> Final summary</h3><div><p><span>Best section</span><strong>${STAGES[bestIndex].label} - ${guided[bestIndex].overall}/100</strong></p><p><span>Needs practice</span><strong>${STAGES[needsIndex].label} - ${guided[needsIndex].overall}/100</strong></p><p><span>Progress</span><strong>${firstAverage} -> ${latestAverage}</strong></p><p><span>Final challenge</span><strong>${stageScores[FINAL_STAGE_INDEX].overall}/100</strong></p></div>`;
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
        const canUseMicrophone = await window.JaraMicPermissions.ensureReady({ micButton, stopButton, recordStatus, recordHelp, unsupported, language: "en" });
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
        if (currentStage().final) {
          finalAudioBlob = blob;
          finalAudioDataUrlPromise = null;
          clientSubmissionId = newClientSubmissionId();
        }
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
        SecurityError: "The microphone requires the secure HTTPS version of JaraLingua.",
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
    stopWordCue();
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
    finalAudioBlob = null;
    finalAudioDataUrlPromise = null;
    localStorage.removeItem(STORAGE_KEY);
  }

  function readStoredUser(key, provider) {
    try {
      const saved = JSON.parse(sessionStorage.getItem(key) || "null");
      if (!saved || !saved.exp || Date.now() / 1000 > saved.exp) {
        sessionStorage.removeItem(key);
        return null;
      }
      return Object.assign({ provider }, saved);
    } catch (_error) {
      sessionStorage.removeItem(key);
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

  function blobToDataUrl(blob) {
    if (!blob) return Promise.resolve("");
    if (!finalAudioDataUrlPromise) {
      finalAudioDataUrlPromise = new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = () => reject(new Error("The final audio could not be prepared."));
        reader.readAsDataURL(blob);
      });
    }
    return finalAudioDataUrlPromise;
  }

  function authHeaders(user, json = false) {
    const headers = {
      Authorization: "Bearer " + user.credential,
      "X-Jaralingua-Auth-Provider": user.provider || "google"
    };
    if (json) headers["Content-Type"] = "application/json";
    return headers;
  }

  function newClientSubmissionId() {
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
    return `${PAGE_CONFIG.submissionPrefix || "ie2-u1"}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    })[character]);
  }

  async function findReceivedSubmission(user, submissionId) {
    const response = await fetch(`${INBOX_PATH}?clientSubmissionId=${encodeURIComponent(submissionId)}`, { headers: authHeaders(user) });
    if (!response.ok) return null;
    const payload = await response.json().catch(() => ({}));
    return Array.isArray(payload.items) ? payload.items[0] || null : null;
  }

  function createTeacherInboxPanel() {
    const panel = document.createElement("section");
    panel.className = "pronunciation-panel teacher-inbox-panel";
    panel.hidden = true;
    panel.innerHTML = `
      <div class="teacher-inbox-head"><div><p class="eyebrow">Teacher view</p><h3>Pronunciation inbox</h3></div><span class="teacher-inbox-count">0 received</span></div>
      <p>Independent delivery inbox. Nothing in this list is projected to Grades or given a percentage.</p>
      <div class="teacher-inbox-list" aria-live="polite"></div>
    `;
    submitMount.insertAdjacentElement("afterend", panel);
    const list = panel.querySelector(".teacher-inbox-list");
    const count = panel.querySelector(".teacher-inbox-count");

    async function loadAudio(button, item, user) {
      button.disabled = true;
      button.textContent = "Loading recording...";
      try {
        const response = await fetch(`${AUDIO_PATH}?receipt=${encodeURIComponent(item.receiptId)}`, { headers: authHeaders(user) });
        if (!response.ok) throw new Error("The recording could not be loaded.");
        const url = URL.createObjectURL(await response.blob());
        const player = document.createElement("audio");
        player.controls = true;
        player.src = url;
        player.addEventListener("ended", () => URL.revokeObjectURL(url), { once: true });
        button.replaceWith(player);
        await player.play().catch(() => {});
      } catch (error) {
        button.disabled = false;
        button.textContent = error.message || "Try loading again";
      }
    }

    async function load() {
      const user = readUser();
      if (!user?.credential) {
        panel.hidden = true;
        return;
      }
      try {
        const response = await fetch(INBOX_PATH, { headers: authHeaders(user) });
        if (!response.ok) throw new Error("inbox_unavailable");
        const payload = await response.json();
        if (!payload.teacherInbox) {
          panel.hidden = true;
          return;
        }
        const items = Array.isArray(payload.items) ? payload.items : [];
        panel.hidden = false;
        count.textContent = `${items.length} received`;
        list.innerHTML = items.length ? items.map((item) => `
          <article class="teacher-inbox-item" data-receipt="${escapeHtml(item.receiptId || "")}">
            <strong>${escapeHtml(item.studentName || item.studentEmail || "Student")}</strong>
            <p>${escapeHtml(item.studentEmail || "")} · ${escapeHtml(new Date(item.submittedAt).toLocaleString())}</p>
            <div class="teacher-inbox-metrics"><span>Clarity ${Math.round(item.overall || 0)}/100</span><span>Accuracy ${Math.round(item.accuracy || 0)}%</span><span>Rhythm ${Math.round(item.fluency || 0)}%</span></div>
            <p><strong>Receipt:</strong> ${escapeHtml(item.receiptId || "")}</p>
            <p><strong>Transcript:</strong> ${escapeHtml(item.transcript || "No transcript")}</p>
            <button type="button" class="teacher-audio-button"><i class="bi bi-play-fill"></i> Load recording</button>
          </article>
        `).join("") : "<p>No pronunciation deliveries have been received yet.</p>";
        list.querySelectorAll(".teacher-inbox-item").forEach((card, index) => {
          const button = card.querySelector(".teacher-audio-button");
          button?.addEventListener("click", () => loadAudio(button, items[index], user));
        });
      } catch (_error) {
        panel.hidden = true;
      }
    }

    window.addEventListener("jaralingua:auth-changed", load);
    setTimeout(load, 900);
    return { panel, load };
  }

  function createSubmitPanel() {
    const panel = document.createElement("div");
    panel.className = "pronunciation-submit-panel";
    panel.innerHTML = `
      <h3><i class="bi bi-send-check"></i> Send to teacher</h3>
      <p>Your final recording goes to the teacher's independent inbox. It does not appear in Grades, has no percentage and does not change your average.</p>
      <div class="pronunciation-submit-metrics">
        <span><b data-submit-score>--</b><small>Clarity check</small></span>
        <span><b data-submit-duration>--</b><small>Final recording</small></span>
      </div>
      <div class="pronunciation-submit-actions">
        <button type="button" class="action-button reset" data-submit-reset><i class="bi bi-arrow-repeat"></i> Reset full challenge</button>
        <button type="button" class="action-button submit-grade" data-submit-teacher disabled><i class="bi bi-send-fill"></i> Send to teacher</button>
      </div>
      <p class="pronunciation-submit-status" data-submit-status aria-live="polite"></p>
    `;
    const scoreNode = panel.querySelector("[data-submit-score]");
    const durationNode = panel.querySelector("[data-submit-duration]");
    const submitButton = panel.querySelector("[data-submit-teacher]");
    const resetButton = panel.querySelector("[data-submit-reset]");
    const statusNode = panel.querySelector("[data-submit-status]");
    let submitState = "idle";
    let submittedMessage = "";

    function setStatus(message, type) {
      statusNode.textContent = message || "";
      statusNode.className = "pronunciation-submit-status" + (type ? " " + type : "");
    }

    function finalAttempt() {
      return FINAL_STAGE_INDEX >= 0 ? stageScores[FINAL_STAGE_INDEX] || null : null;
    }

    function update() {
      const attempt = finalAttempt();
      const score = Number(attempt && attempt.overall);
      if (!attempt || !Number.isFinite(score)) {
        panel.classList.remove("is-submitted");
        panel.querySelector(".ie2-delivery-preview")?.remove();
        scoreNode.textContent = "--";
        durationNode.textContent = "--";
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="bi bi-send-fill"></i> Send to teacher';
        if (submitState !== "submitted" && submitState !== "error") {
          setStatus("Complete the 4 sections and the final challenge first. Then this button will unlock so you can send the activity to the teacher.", "pending");
        }
        return;
      }
      scoreNode.textContent = Math.round(score) + "/100";
      durationNode.textContent = formatTime(recordedDurationMs);
      panel.querySelector(".ie2-delivery-preview")?.remove();
      const preview = document.createElement("div");
      preview.className = "ie2-delivery-preview";
      preview.innerHTML = `<p><strong>Delivery preview</strong></p><p><span>Audio:</span> ${formatTime(recordedDurationMs)}</p><p><span>Product:</span> ${escapeHtml(DELIVERY_PRODUCT)}</p><p><span>Destination:</span> teacher inbox only · no Grades entry · no percentage.</p>`;
      panel.querySelector(".pronunciation-submit-actions").insertAdjacentElement("beforebegin", preview);
      if (submitState === "submitted") {
        panel.classList.add("is-submitted");
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="bi bi-check-circle-fill"></i> Submitted to teacher';
        setStatus(submittedMessage || "Received by the teacher inbox.", "success");
        return;
      }
      panel.classList.remove("is-submitted");
      submitButton.disabled = submitState === "submitting";
      submitButton.innerHTML = submitState === "submitting" ? '<i class="bi bi-hourglass-split"></i> Sending to teacher...' : '<i class="bi bi-send-fill"></i> Send to teacher';
      if (submitState === "idle") {
        setStatus("Final challenge ready. You can now send this activity to the teacher.", "success");
      }
    }

    async function submit() {
      const attempt = finalAttempt();
      const score = Number(attempt && attempt.overall);
      if (!attempt || !Number.isFinite(score)) {
        setStatus("Complete the final challenge before sending this activity.", "error");
        update();
        return;
      }
      const user = readUser();
      if (!user || !user.credential) {
        setStatus("Sign in first with the account registered in Intermediate English.", "error");
        openLoginPanel();
        return;
      }
      submitButton.disabled = true;
      submitState = "submitting";
      setStatus("Preparing your final recording and sending it to the teacher...", "pending");
      update();
      try {
        if (!clientSubmissionId) clientSubmissionId = newClientSubmissionId();
        const audioDataUrl = await blobToDataUrl(finalAudioBlob);
        const response = await fetch(SUBMIT_PATH, {
          method: "POST",
          headers: authHeaders(user, true),
          body: JSON.stringify({
            clientSubmissionId,
            score100: Math.round(score),
            activityTitle: ACTIVITY_TITLE,
            details: Object.assign({}, attempt, { audioDataUrl })
          })
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          if (payload.error === "missing_audio") throw new Error("Record the final challenge again before sending it.");
          if (payload.error === "reference_text_mismatch") throw new Error("The final text changed. Restart the final challenge and record it again.");
          throw new Error("The activity could not be submitted.");
        }
        submitState = "submitted";
        submittedMessage = "Received by the teacher inbox. Receipt: " + payload.receiptId + ". This delivery is not in Grades and has no percentage.";
        const receipt = document.createElement("div");
        receipt.className = "ie2-receipt";
        receipt.innerHTML = `<strong>Delivery confirmed</strong><code>${escapeHtml(payload.receiptId || "")}</code><button type="button" class="ie2-copy-receipt">Copy receipt</button>`;
        receipt.querySelector("button").addEventListener("click", async () => {
          await navigator.clipboard?.writeText(payload.receiptId || "");
          receipt.querySelector("button").textContent = "Receipt copied";
        });
        panel.querySelector(".ie2-receipt")?.remove();
        statusNode.insertAdjacentElement("afterend", receipt);
        setStatus(submittedMessage, "success");
      } catch (error) {
        const received = clientSubmissionId ? await findReceivedSubmission(user, clientSubmissionId).catch(() => null) : null;
        if (received) {
          submitState = "submitted";
          submittedMessage = "Delivery confirmed after reconnecting. Receipt: " + received.receiptId + ".";
          setStatus(submittedMessage, "success");
        } else {
          submitState = "error";
          setStatus((error.message || "The delivery could not be confirmed.") + " Your recording remains here; press Send to teacher again to retry safely.", "error");
        }
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
      clientSubmissionId = "";
      panel.querySelector(".ie2-receipt")?.remove();
      update();
      setStatus("Full pronunciation challenge reset. You can start again.", "pending");
      stagePanel.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    submitButton.addEventListener("click", submit);
    update();
    return { panel, update };
  }

  modelButton.addEventListener("click", async () => {
    stopWordCue();
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
      stopWordCue();
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
  readingText.addEventListener("click", (event) => {
    const button = event.target.closest(".reading-word");
    if (button && !button.classList.contains("is-selected")) showWordHelp(button.dataset.spoken, button, Number(button.dataset.word));
  });

  submitPanelController = createSubmitPanel();
  submitMount.appendChild(submitPanelController.panel);
  createTeacherInboxPanel();
  refreshMicrophones();
  navigator.mediaDevices?.addEventListener?.("devicechange", refreshMicrophones);
  updateStageUI();
  resetAttempt(false);
  if (location.protocol === "file:") {
    unsupported.hidden = false;
    micButton.disabled = true;
    recordStatus.textContent = "The microphone does not work in file mode";
    recordHelp.textContent = "Open this activity from the secure JaraLingua production website.";
    unsupported.innerHTML = "<strong>Local file mode detected.</strong><br>Browsers block microphone access on file:// addresses. Open the secure production page instead.";
  } else if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
    unsupported.hidden = false;
    micButton.disabled = true;
    recordStatus.textContent = "Recording vocal indisponible";
  }
})();
