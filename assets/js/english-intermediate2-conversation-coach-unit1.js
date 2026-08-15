(function () {
  "use strict";

  const COACH_CONFIG = window.IE2ConversationCoachConfig || {};
  const COACH_NAME = COACH_CONFIG.characterName || "Gabriel";
  const AUDIO_ROOT = COACH_CONFIG.audioRoot || "audio/conversation-coach/unit-1-coffee-with-gabriel/";
  const API_PATH = "/api/english-intermediate/pronunciation-assessment";
  const MAX_SECONDS = COACH_CONFIG.maxSeconds || 30;
  const TURNS = COACH_CONFIG.turns || [
    {
      topic: "Your best friend",
      question: "Tell me about your best friend. What's their name, and what are they like?",
      audio: "turn-1-best-friend.mp3",
      frames: ["My best friend is _____, who always _____.", "_____ is the person who _____.", "They are kind of _____, but _____."],
      words: ["supportive", "reliable", "outgoing", "kind of quiet", "a bit serious"],
      focus: "Use who to add clear information about a person. Use kind of or a bit to make a description softer.",
      reaction: { text: "Your best friend sounds like someone important in your life. I'd like to know how the friendship began.", audio: "reaction-1-introduction.mp3" }
    },
    {
      topic: "How you met",
      question: "How did you meet your best friend?",
      audio: "turn-2-how-you-met.mp3",
      frames: ["We met when _____.", "They were the person who _____.", "We hit it off because _____."],
      words: ["at school", "at work", "in my neighborhood", "through a friend", "hit it off"],
      focus: "Use the simple past for the first meeting. Who or that can identify the person when the information is essential.",
      reaction: { text: "That's a memorable way to meet. Sometimes one small moment is enough for two people to hit it off.", audio: "reaction-2-meeting.mp3" }
    },
    {
      topic: "What you share",
      question: "Why do you get on well? What do you have in common?",
      audio: "turn-3-common.mp3",
      frames: ["We get on well because _____.", "We both enjoy _____.", "One thing we have in common is _____."],
      words: ["sense of humor", "music", "sports", "values", "have in common", "get on well"],
      focus: "Connect ideas with because and use have in common to explain what makes the friendship work.",
      reaction: { text: "Having something in common really helps a friendship grow. Shared interests make conversations easy.", audio: "reaction-3-common.mp3" }
    },
    {
      topic: "Keeping in touch",
      question: "How do you keep in touch, and what do you usually do together?",
      audio: "turn-4-contact.mp3",
      frames: ["We keep in touch through _____.", "We usually _____ together.", "Even when we're busy, we _____."],
      words: ["voice notes", "video calls", "meet for coffee", "go for a walk", "keep in touch"],
      focus: "Use the simple present and frequency language to describe the routines that maintain the friendship.",
      reaction: { text: "That sounds like a good way to stay close. Regular contact can make a friendship feel natural even when life gets busy.", audio: "reaction-4-contact.mp3" }
    },
    {
      topic: "Ask Gabriel",
      question: "Now it's your turn to interview me. Ask me one question about my best friend.",
      audio: "turn-5-ask-gabriel.mp3",
      frames: ["Who is your best friend, and what are they like?", "How did you meet your best friend?", "How do you keep in touch?"],
      words: ["who", "how did you meet", "what are they like", "keep in touch", "have in common"],
      focus: "Use question word order: question word + auxiliary + subject + main verb.",
      reaction: null
    }
  ];

  const byId = (id) => document.getElementById(id);
  const ui = {
    onboarding: byId("coachOnboarding"), interview: byId("coachInterview"), complete: byId("coachComplete"),
    audio: byId("gabrielAudio"), preflightButton: byId("preflightButton"), preflightStatus: byId("preflightStatus"), preflightAudio: byId("preflightAudio"),
    start: byId("startCoach"), turnCounter: byId("turnCounter"), turnTopic: byId("turnTopic"), turnProgress: byId("turnProgress"),
    question: byId("coachQuestion"), questionAudio: byId("questionAudioButton"), frames: byId("answerFrames"), words: byId("usefulWords"), focus: byId("languageFocus"),
    microphone: byId("coachMicrophone"), levelBar: byId("coachLevelBar"), levelText: byId("coachLevelText"), mic: byId("coachMicButton"), stop: byId("coachStopButton"),
    again: byId("coachRecordAgain"), status: byId("coachRecordStatus"), help: byId("coachRecordHelp"), timer: byId("coachTimer"), studentAudio: byId("studentAnswerAudio"),
    transcript: byId("coachTranscript"), recovery: byId("coachRecovery"), recoveryText: byId("coachRecoveryText"), retry: byId("retryTranscript"), continueWithout: byId("continueWithoutTranscript"),
    reaction: byId("coachReaction"), reactionText: byId("reactionText"), reactionAudio: byId("reactionAudioButton"), next: byId("nextCoachTurn"),
    sessionTranscript: byId("sessionTranscript"), restart: byId("restartCoach")
  };

  let speed = 1;
  let activeAudioButton = null;
  let turnIndex = 0;
  let answers = [];
  let recorder = null;
  let stream = null;
  let chunks = [];
  let lastBlob = null;
  let timerId = null;
  let startedAt = 0;
  let audioContext = null;
  let animationId = null;
  let playbackUrl = "";
  let preflightUrl = "";

  function escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[character]));
  }

  function audioUrl(file) {
    return `${AUDIO_ROOT}${file}`;
  }

  function setAudioButton(button, playing) {
    if (!button) return;
    const icon = button.querySelector("i");
    button.classList.toggle("is-playing", playing);
    if (icon) icon.className = playing ? "bi bi-pause-fill" : "bi bi-play-fill";
  }

  function playGabriel(file, button) {
    if (!file) return;
    const source = new URL(audioUrl(file), window.location.href).href;
    if (ui.audio.src === source && !ui.audio.paused) {
      ui.audio.pause();
      return;
    }
    if (activeAudioButton) setAudioButton(activeAudioButton, false);
    activeAudioButton = button || null;
    ui.audio.src = source;
    ui.audio.playbackRate = speed;
    ui.audio.play().then(() => setAudioButton(button, true)).catch(() => setAudioButton(button, false));
  }

  ui.audio.addEventListener("ended", () => setAudioButton(activeAudioButton, false));
  ui.audio.addEventListener("pause", () => setAudioButton(activeAudioButton, false));

  document.querySelectorAll("[data-coach-speed]").forEach((button) => {
    button.addEventListener("click", () => {
      speed = Number(button.dataset.coachSpeed) || 1;
      ui.audio.playbackRate = speed;
      document.querySelectorAll("[data-coach-speed]").forEach((item) => item.classList.toggle("is-active", item === button));
    });
  });

  document.querySelectorAll("[data-audio-file]").forEach((button) => button.addEventListener("click", () => playGabriel(button.dataset.audioFile, button)));

  function selectedReaction(transcript) {
    if (TURNS[turnIndex].reaction) return TURNS[turnIndex].reaction;
    const text = String(transcript).toLowerCase();
    const configuredResponse = (COACH_CONFIG.finalResponses || []).find((response) => (response.terms || []).some((term) => text.includes(String(term).toLowerCase())));
    if (configuredResponse) return configuredResponse;
    if (COACH_CONFIG.defaultFinalReaction) return COACH_CONFIG.defaultFinalReaction;
    if (/meet|met/.test(text)) return { text: "I met my best friend, Mateo, while photographing a neighborhood event. He offered to help me carry my equipment, and we hit it off right away.", audio: "answer-how-we-met.mp3" };
    if (/like|personality|describe|kind|quiet|funny/.test(text)) return { text: "My best friend Mateo is calm, dependable and a bit reserved at first. He's the person who always notices when someone needs help.", audio: "answer-personality.mp3" };
    if (/touch|contact|talk|call|message|see each other/.test(text)) return { text: "Mateo and I keep in touch with voice notes during the week, and we usually meet for coffee on Sunday mornings.", audio: "answer-keep-in-touch.mp3" };
    return { text: "My best friend is Mateo, who helps with community projects. We met at a neighborhood event, and now we keep in touch every week.", audio: "answer-general.mp3" };
  }

  function renderTurn() {
    const turn = TURNS[turnIndex];
    ui.turnCounter.textContent = `Turn ${turnIndex + 1} of ${TURNS.length}`;
    ui.turnTopic.textContent = turn.topic;
    ui.turnProgress.style.width = `${((turnIndex + 1) / TURNS.length) * 100}%`;
    ui.question.textContent = turn.question;
    ui.frames.innerHTML = turn.frames.map((frame) => `<button type="button">${escapeHtml(frame)}</button>`).join("");
    ui.words.innerHTML = turn.words.map((word) => `<span>${escapeHtml(word)}</span>`).join("");
    ui.focus.textContent = turn.focus;
    ui.questionAudio.onclick = () => playGabriel(turn.audio, ui.questionAudio);
    ui.frames.querySelectorAll("button").forEach((button) => button.addEventListener("click", () => {
      ui.help.textContent = button.textContent;
      ui.help.classList.add("is-tip");
    }));
    resetAnswer();
    window.setTimeout(() => playGabriel(turn.audio, ui.questionAudio), 250);
  }

  function resetAnswer() {
    stopCapture();
    lastBlob = null;
    ui.transcript.textContent = "Your words will appear here after temporary transcription.";
    ui.transcript.classList.remove("has-text");
    ui.recovery.hidden = true;
    ui.reaction.hidden = true;
    ui.next.disabled = true;
    ui.again.disabled = true;
    ui.stop.disabled = true;
    ui.mic.disabled = false;
    ui.status.textContent = "Ready for your answer";
    ui.help.textContent = "Tap the microphone and speak in English.";
    ui.help.classList.remove("is-tip");
    ui.timer.textContent = "00:00 / 00:30";
    if (playbackUrl) URL.revokeObjectURL(playbackUrl);
    playbackUrl = "";
    ui.studentAudio.hidden = true;
    ui.studentAudio.removeAttribute("src");
  }

  function preferredMimeType() {
    return ["audio/webm;codecs=opus", "audio/webm", "audio/mp4;codecs=mp4a.40.2", "audio/mp4"].find((type) => window.MediaRecorder?.isTypeSupported?.(type)) || "";
  }

  async function getStream() {
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) throw new Error("Recording is not supported in this browser.");
    if (stream?.active) return stream;
    const deviceId = ui.microphone.value;
    stream = await navigator.mediaDevices.getUserMedia({ audio: deviceId ? { deviceId: { exact: deviceId } } : true });
    updateDeviceList();
    return stream;
  }

  async function updateDeviceList() {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    const current = ui.microphone.value;
    const devices = (await navigator.mediaDevices.enumerateDevices()).filter((device) => device.kind === "audioinput");
    ui.microphone.innerHTML = '<option value="">Default microphone</option>' + devices.map((device, index) => `<option value="${escapeHtml(device.deviceId)}">${escapeHtml(device.label || `Microphone ${index + 1}`)}</option>`).join("");
    if ([...ui.microphone.options].some((option) => option.value === current)) ui.microphone.value = current;
  }

  function monitorLevel(mediaStream) {
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      audioContext.createMediaStreamSource(mediaStream).connect(analyser);
      const values = new Uint8Array(analyser.frequencyBinCount);
      const draw = () => {
        analyser.getByteFrequencyData(values);
        const average = values.reduce((sum, value) => sum + value, 0) / values.length;
        const percent = Math.min(100, Math.round(average * 1.7));
        ui.levelBar.style.width = `${percent}%`;
        ui.levelText.textContent = percent > 12 ? "Speaking" : "Listening";
        animationId = requestAnimationFrame(draw);
      };
      draw();
    } catch (_) { ui.levelText.textContent = "Recording"; }
  }

  function stopMonitor() {
    if (animationId) cancelAnimationFrame(animationId);
    animationId = null;
    if (audioContext) audioContext.close().catch(() => {});
    audioContext = null;
    ui.levelBar.style.width = "0%";
    ui.levelText.textContent = "Waiting";
  }

  function stopCapture() {
    if (timerId) clearInterval(timerId);
    timerId = null;
    stopMonitor();
    if (stream) stream.getTracks().forEach((track) => track.stop());
    stream = null;
  }

  function formatTimer(seconds) {
    return `00:${String(Math.min(seconds, MAX_SECONDS)).padStart(2, "0")} / 00:30`;
  }

  async function startRecording() {
    try {
      const mediaStream = await getStream();
      chunks = [];
      const mimeType = preferredMimeType();
      recorder = mimeType ? new MediaRecorder(mediaStream, { mimeType }) : new MediaRecorder(mediaStream);
      recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
      recorder.onstop = () => finishRecording(mimeType || recorder.mimeType);
      recorder.start(250);
      startedAt = Date.now();
      ui.mic.disabled = true;
      ui.mic.classList.add("is-recording");
      ui.stop.disabled = false;
      ui.again.disabled = true;
      ui.status.textContent = `${COACH_NAME} is listening`;
      ui.help.textContent = "Speak naturally. Finish when your idea is complete.";
      monitorLevel(mediaStream);
      timerId = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startedAt) / 1000);
        ui.timer.textContent = formatTimer(elapsed);
        if (elapsed >= MAX_SECONDS) stopRecording();
      }, 250);
    } catch (error) {
      ui.status.textContent = "Microphone unavailable";
      ui.help.textContent = error.name === "NotAllowedError" ? "Allow microphone access in your browser, then try again." : (error.message || "Check your microphone and try again.");
    }
  }

  function stopRecording() {
    if (recorder?.state === "recording") recorder.stop();
    ui.mic.classList.remove("is-recording");
    ui.stop.disabled = true;
    if (timerId) clearInterval(timerId);
    timerId = null;
    stopMonitor();
  }

  async function finishRecording(mimeType) {
    const duration = Math.max(0, Date.now() - startedAt);
    stopCapture();
    ui.mic.classList.remove("is-recording");
    lastBlob = new Blob(chunks, { type: mimeType || "audio/webm" });
    playbackUrl = URL.createObjectURL(lastBlob);
    ui.studentAudio.src = playbackUrl;
    ui.studentAudio.hidden = false;
    ui.again.disabled = false;
    ui.mic.disabled = false;
    ui.status.textContent = "Answer recorded";
    ui.timer.textContent = formatTimer(Math.round(duration / 1000));
    await transcribe(lastBlob);
  }

  async function transcribe(blob) {
    ui.recovery.hidden = true;
    ui.transcript.textContent = "Creating a temporary transcript...";
    ui.retry.disabled = true;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);
      const response = await fetch(API_PATH, { method: "POST", headers: { "Content-Type": blob.type || "audio/webm" }, body: blob, signal: controller.signal });
      clearTimeout(timeout);
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "The transcription service is unavailable.");
      const transcript = String(payload.text || payload.transcript || "").trim();
      if (!transcript) {
        ui.transcript.textContent = "No words were detected. Listen to your recording and try once more.";
        showRecovery(`${COACH_NAME} couldn't hear enough English to continue the thread yet.`, "recovery-no-speech.mp3", false);
        return;
      }
      acceptAnswer(transcript);
    } catch (error) {
      const message = error.name === "AbortError" ? "The temporary transcription took too long." : "The temporary transcription service did not answer.";
      ui.transcript.textContent = message;
      showRecovery(`${message} Your recording is still available on this screen.`, "recovery-service.mp3", true);
    } finally {
      ui.retry.disabled = false;
    }
  }

  function showRecovery(message, audio, allowContinue) {
    ui.recoveryText.textContent = message;
    ui.recovery.hidden = false;
    ui.continueWithout.hidden = !allowContinue;
    playGabriel(audio, null);
  }

  function acceptAnswer(transcript, unavailable) {
    const reaction = selectedReaction(transcript);
    answers[turnIndex] = { question: TURNS[turnIndex].question, transcript: unavailable ? "Response recorded without a transcript." : transcript };
    ui.transcript.textContent = unavailable ? "Your recording was kept for playback on this screen, without a transcript." : transcript;
    ui.transcript.classList.add("has-text");
    ui.recovery.hidden = true;
    ui.reactionText.textContent = reaction.text;
    ui.reactionAudio.onclick = () => playGabriel(reaction.audio, ui.reactionAudio);
    ui.reaction.hidden = false;
    ui.next.disabled = false;
    ui.status.textContent = `${COACH_NAME} responded`;
    playGabriel(reaction.audio, ui.reactionAudio);
  }

  async function runPreflight() {
    if (ui.preflightButton.dataset.running === "true") return;
    ui.preflightButton.dataset.running = "true";
    ui.preflightStatus.textContent = "Recording your microphone for three seconds...";
    try {
      const testStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = preferredMimeType();
      const testRecorder = mimeType ? new MediaRecorder(testStream, { mimeType }) : new MediaRecorder(testStream);
      const testChunks = [];
      testRecorder.ondataavailable = (event) => { if (event.data.size) testChunks.push(event.data); };
      testRecorder.onstop = () => {
        testStream.getTracks().forEach((track) => track.stop());
        if (preflightUrl) URL.revokeObjectURL(preflightUrl);
        preflightUrl = URL.createObjectURL(new Blob(testChunks, { type: mimeType || "audio/webm" }));
        ui.preflightAudio.src = preflightUrl;
        ui.preflightAudio.hidden = false;
        ui.preflightStatus.textContent = "Microphone ready. Play the test, then begin when you are comfortable.";
        ui.preflightButton.dataset.running = "false";
        ui.preflightButton.innerHTML = '<i class="bi bi-arrow-repeat"></i> Test again';
        updateDeviceList();
      };
      testRecorder.start();
      setTimeout(() => testRecorder.state === "recording" && testRecorder.stop(), 3000);
    } catch (error) {
      ui.preflightStatus.textContent = error.name === "NotAllowedError" ? "Microphone permission was not granted. You can allow it later when you answer." : "The microphone test could not start. Check your browser settings.";
      ui.preflightButton.dataset.running = "false";
    }
  }

  function showComplete() {
    stopCapture();
    ui.interview.hidden = true;
    ui.complete.hidden = false;
    ui.sessionTranscript.innerHTML = answers.map((answer, index) => `<article><span>${index + 1}</span><div><strong>${escapeHtml(COACH_NAME)}: ${escapeHtml(answer.question)}</strong><p>You: ${escapeHtml(answer.transcript)}</p></div></article>`).join("");
    playGabriel("closing.mp3", null);
    ui.complete.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  ui.start.addEventListener("click", () => {
    turnIndex = 0;
    answers = [];
    ui.onboarding.hidden = true;
    ui.complete.hidden = true;
    ui.interview.hidden = false;
    renderTurn();
    ui.interview.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  ui.preflightButton.addEventListener("click", runPreflight);
  ui.mic.addEventListener("click", startRecording);
  ui.stop.addEventListener("click", stopRecording);
  ui.again.addEventListener("click", resetAnswer);
  ui.retry.addEventListener("click", () => lastBlob && transcribe(lastBlob));
  ui.continueWithout.addEventListener("click", () => acceptAnswer("", true));
  ui.next.addEventListener("click", () => {
    if (turnIndex >= TURNS.length - 1) showComplete();
    else { turnIndex += 1; renderTurn(); ui.interview.scrollIntoView({ behavior: "smooth", block: "start" }); }
  });
  ui.restart.addEventListener("click", () => {
    stopCapture();
    turnIndex = 0;
    answers = [];
    ui.complete.hidden = true;
    ui.interview.hidden = true;
    ui.onboarding.hidden = false;
    ui.onboarding.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  ui.microphone.addEventListener("change", () => { if (stream) stopCapture(); });
  window.addEventListener("beforeunload", () => {
    stopCapture();
    if (playbackUrl) URL.revokeObjectURL(playbackUrl);
    if (preflightUrl) URL.revokeObjectURL(preflightUrl);
  });
  navigator.mediaDevices?.addEventListener?.("devicechange", updateDeviceList);
})();
