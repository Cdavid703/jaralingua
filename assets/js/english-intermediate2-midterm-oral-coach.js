(() => {
  "use strict";

  const AUDIO_ROOT = "audio/midterm-oral-conversation-coach/";
  const API_PATH = "/api/english-intermediate/pronunciation-assessment";
  const MAX_SECONDS = 45;
  const turns = [
    { topic: "Seeing an old friend", prompt: "Hi! I can't believe it has been so long. How have you been?", audio: "turn-1-warm-hello.mp3", hint: "It is so good to see you, Mia. I have been well, thank you. How have you been?", reply: "I am really happy to see you too. I have been busy, but I often thought about our school days.", reaction: "reaction-1-warm-hello.mp3" },
    { topic: "Catching up", prompt: "What have you been doing lately?", audio: "turn-2-catching-up.mp3", hint: "Lately, I have been working and studying. I have also kept in touch with Laura from school.", reply: "That is lovely. It is strange how quickly time passes, but some friendships still feel familiar.", reaction: "reaction-2-catching-up.mp3" },
    { topic: "A friend's dilemma", prompt: "Valentina is unsure whether to stay with her partner after a serious lie. What do you think she should do?", audio: "turn-3-common-friend.mp3", hint: "That sounds really difficult. I think Valentina should talk honestly with her partner before she makes a decision.", reply: "Exactly. She feels hurt and confused, and we all want to support her without making the decision for her.", reaction: "reaction-3-common-friend.mp3" },
    { topic: "What would you do?", prompt: "If you were in Valentina's situation, what would you do?", audio: "turn-4-second-conditional.mp3", hint: "If I were in her situation, I would talk honestly with my partner because trust matters.", reply: "I understand. It would be a painful decision, but thinking about trust and respect is important.", reaction: "reaction-4-second-conditional.mp3" },
    { topic: "A fictional dilemma", prompt: "Would you rather discuss an imaginary relationship dilemma or a general decision?", audio: "turn-5-your-dilemma.mp3", hint: "I would like to discuss an imaginary dilemma. It feels more comfortable, and I can still practice the language.", reply: "That makes sense. You can practice thoughtful advice without sharing anything personal.", reaction: "reaction-5-your-dilemma.mp3" },
    { topic: "Advice for Mia", prompt: "I have one too. I like someone, but I am afraid that a relationship could affect our friendship. What would you advise me to do?", audio: "turn-6-give-advice.mp3", hint: "If I were you, I would be honest and take things slowly. You could talk about your feelings.", reply: "That is helpful advice. I think I need to be honest and take things slowly instead of imagining the worst outcome.", reaction: "reaction-6-give-advice.mp3" },
    { topic: "Dating question and close", prompt: "What question would you like to ask me about dating or relationships before we go?", audio: "turn-7-dating-question.mp3", hint: "What do you think is important in a relationship?", reply: "For me, honesty, respect and good communication matter most. I am glad we talked. Let us not lose touch again.", reaction: "reaction-7-dating-close.mp3" }
  ];

  const $ = (id) => document.getElementById(id);
  const ui = {
    start: $("coachStart"), live: $("coachLive"), complete: $("coachComplete"),
    startButton: $("startCoach"), restart: $("restartCoach"), counter: $("turnCounter"),
    topic: $("turnTopic"), progress: $("turnProgress"), prompt: $("coachPrompt"),
    suggestion: $("answerSuggestion")?.querySelector("span"), replay: $("replayCoach"),
    audio: $("miaAudio"), record: $("recordButton"), next: $("nextTurn"),
    status: $("recordStatus"), timer: $("recordTimer"), levelBar: $("coachLevelBar"),
    levelText: $("coachLevelText"), transcript: $("studentTranscript"),
    studentAudio: $("studentAudio"), reply: $("coachReply"), replyText: $("coachReplyText"),
    recovery: $("recoveryMessage"), stage: $("coachStage"), stageStatus: $("coachStageStatus"),
    welcome: $("welcomePlayButton"), microphone: $("coachMicrophone"),
    floatingDock: $("floatingMicDock"), floating: $("floatingMicButton"),
    floatingStatus: $("floatingStatus"), floatingTimer: $("floatingTimer"),
    floatingTurn: $("floatingTurnLabel"), desktop: $("desktopViewButton"), mobile: $("mobileViewButton"),
    support: $("answerSupport")
  };

  let index = 0, speed = 1, stream = null, recorder = null, chunks = [], startedAt = 0;
  let timerId = null, recordingUrl = "", activeAudioButton = null, audioContext = null;
  let analyser = null, meterFrame = 0, meterSource = null;

  function audioUrl(file) { return new URL(AUDIO_ROOT + file, window.location.href).href; }
  function setPlaying(button, playing) { button?.classList.toggle("is-playing", playing); }
  function stage(state, message) {
    if (ui.stage) ui.stage.dataset.state = state;
    if (ui.stageStatus) ui.stageStatus.innerHTML = '<i class="bi bi-person-video3"></i> ' + message;
  }
  function setFloating(message) { if (ui.floatingStatus) ui.floatingStatus.textContent = message; }
  function controls(label, recording, disabled) {
    const icon = recording ? "bi-stop-fill" : label === "Again" ? "bi-arrow-repeat" : "bi-mic-fill";
    [ui.record, ui.floating].filter(Boolean).forEach((button) => {
      button.disabled = Boolean(disabled);
      button.classList.toggle("is-recording", Boolean(recording));
      button.classList.toggle("stop", Boolean(recording));
      button.innerHTML = '<i class="bi ' + icon + '"></i><span>' + label + '</span>';
    });
    ui.floatingDock?.classList.toggle("is-recording", Boolean(recording));
  }
  function play(file, button, state = "speaking") {
    if (!file) return Promise.resolve();
    if (activeAudioButton) setPlaying(activeAudioButton, false);
    activeAudioButton = button || null;
    ui.audio.pause();
    ui.audio.src = audioUrl(file);
    ui.audio.playbackRate = speed;
    stage(state, state === "responding" ? "Mia is responding" : "Mia is speaking");
    return ui.audio.play().then(() => setPlaying(button, true)).catch(() => {
      setPlaying(button, false);
      stage("ready", "Mia is ready");
    });
  }
  ui.audio.addEventListener("ended", () => {
    setPlaying(activeAudioButton, false);
    stage("ready", "Mia is ready");
  });
  ui.audio.addEventListener("pause", () => setPlaying(activeAudioButton, false));

  function resetMeter() {
    if (ui.levelBar) ui.levelBar.style.width = "0%";
    if (ui.levelText) ui.levelText.textContent = "Waiting for your voice";
  }
  function stopMeter() {
    if (meterFrame) window.cancelAnimationFrame(meterFrame);
    meterFrame = 0;
    try { meterSource?.disconnect(); } catch (_) {}
    meterSource = null; analyser = null;
    if (audioContext) {
      const current = audioContext; audioContext = null;
      current.close().catch(() => {});
    }
    resetMeter();
  }
  function startMeter(micStream) {
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context || !ui.levelBar || !ui.levelText) return;
    try {
      audioContext = new Context();
      meterSource = audioContext.createMediaStreamSource(micStream);
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      meterSource.connect(analyser);
      const samples = new Uint8Array(analyser.fftSize);
      ui.levelText.textContent = "Listening for your voice";
      const draw = () => {
        if (!analyser) return;
        analyser.getByteTimeDomainData(samples);
        let energy = 0;
        for (const sample of samples) { const normalized = (sample - 128) / 128; energy += normalized * normalized; }
        const level = Math.min(100, Math.round(Math.sqrt(energy / samples.length) * 360));
        ui.levelBar.style.width = Math.max(3, level) + "%";
        ui.levelText.textContent = level > 8 ? "Voice detected" : "Listening for your voice";
        meterFrame = window.requestAnimationFrame(draw);
      };
      draw();
    } catch (_) { resetMeter(); }
  }
  function stopTracks() {
    stopMeter();
    stream?.getTracks().forEach((track) => track.stop());
    stream = null;
  }
  function preferredMimeType() {
    return ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"].find((type) => window.MediaRecorder?.isTypeSupported?.(type)) || "";
  }
  function timeText(seconds) { return "00:" + String(seconds).padStart(2, "0") + " / 00:45"; }
  function updateTimer() {
    const seconds = Math.min(MAX_SECONDS, Math.floor((Date.now() - startedAt) / 1000));
    const label = timeText(seconds);
    ui.timer.textContent = label;
    if (ui.floatingTimer) ui.floatingTimer.textContent = label;
    if (seconds >= MAX_SECONDS) finishRecording();
  }
  function resetAnswer() {
    stopMeter();
    if (recordingUrl) URL.revokeObjectURL(recordingUrl);
    recordingUrl = ""; chunks = [];
    ui.status.textContent = "Ready when you are. Tap the microphone to answer.";
    ui.timer.textContent = "00:00 / 00:45";
    if (ui.floatingTimer) ui.floatingTimer.textContent = "00:00 / 00:45";
    ui.transcript.hidden = true; ui.transcript.textContent = "";
    ui.studentAudio.hidden = true; ui.studentAudio.removeAttribute("src");
    ui.reply.hidden = true; ui.replyText.textContent = "";
    ui.recovery.hidden = true; ui.recovery.textContent = "";
    ui.next.disabled = true;
    controls("Answer", false, false);
    setFloating("Ready to answer");
    stage("ready", "Mia is ready");
  }
  function renderTurn() {
    const turn = turns[index];
    resetAnswer();
    ui.counter.textContent = "Turn " + (index + 1) + " of " + turns.length;
    ui.topic.textContent = turn.topic;
    ui.progress.style.width = ((index + 1) / turns.length * 100) + "%";
    ui.prompt.textContent = turn.prompt;
    ui.suggestion.textContent = turn.hint;
    if (ui.floatingTurn) ui.floatingTurn.textContent = "Turn " + (index + 1) + " of " + turns.length;
    ui.replay.onclick = () => play(turn.audio, ui.replay);
    window.setTimeout(() => play(turn.audio, ui.replay), 180);
  }

  async function refreshMicrophones() {
    if (!ui.microphone || !navigator.mediaDevices?.enumerateDevices) return;
    const selected = ui.microphone.value;
    const inputs = (await navigator.mediaDevices.enumerateDevices()).filter((device) => device.kind === "audioinput");
    ui.microphone.innerHTML = '<option value="">Default microphone</option>';
    inputs.forEach((device, number) => {
      const option = document.createElement("option");
      option.value = device.deviceId;
      option.textContent = device.label || "Microphone " + (number + 1);
      ui.microphone.append(option);
    });
    ui.microphone.value = [...ui.microphone.options].some((option) => option.value === selected) ? selected : "";
  }
  async function startRecording() {
    try {
      const deviceId = ui.microphone?.value;
      const audio = deviceId ? { deviceId: { exact: deviceId } } : true;
      stream = await navigator.mediaDevices.getUserMedia({ audio });
      refreshMicrophones().catch(() => {});
      startMeter(stream);
      chunks = [];
      const mime = preferredMimeType();
      recorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
      recorder.onstop = () => processRecording(mime || recorder.mimeType);
      recorder.start(250);
      startedAt = Date.now();
      timerId = window.setInterval(updateTimer, 250);
      ui.status.textContent = "Mia is listening. Speak naturally, then finish your response.";
      controls("Finish", true, false);
      setFloating("Listening now");
      stage("listening", "Mia is listening");
    } catch (error) {
      const denied = error?.name === "NotAllowedError";
      ui.status.textContent = denied ? "Allow the microphone, then try again." : "The microphone is unavailable. Check your browser and try again.";
      setFloating(denied ? "Allow your microphone" : "Microphone unavailable");
      stage("ready", "Mia is ready");
    }
  }
  function finishRecording() {
    if (recorder?.state === "recording") recorder.stop();
    if (timerId) window.clearInterval(timerId);
    timerId = null;
    stopMeter();
    controls("Preparing", false, true);
    ui.status.textContent = "Preparing your private transcript.";
    setFloating("Preparing your response");
    stage("analyzing", "Mia is preparing a response");
  }
  async function processRecording(mime) {
    stopTracks();
    const blob = new Blob(chunks, { type: mime || "audio/webm" });
    if (!blob.size) { allowContinue("No audio was recorded. You can continue or record this turn again."); return; }
    recordingUrl = URL.createObjectURL(blob);
    ui.studentAudio.src = recordingUrl;
    ui.studentAudio.hidden = false;
    await transcribe(blob);
  }
  function allowContinue(message) {
    if (message) { ui.recovery.textContent = message; ui.recovery.hidden = false; }
    ui.status.textContent = "Ready to continue.";
    controls("Again", false, false);
    ui.next.disabled = false;
    setFloating("Ready to continue");
    stage("ready", "Mia is ready");
  }
  async function transcribe(blob) {
    try {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 30000);
      const response = await fetch(API_PATH, { method: "POST", headers: { "Content-Type": blob.type || "audio/webm" }, body: blob, signal: controller.signal });
      window.clearTimeout(timeout);
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "transcription failed");
      const transcript = String(payload.text || payload.transcript || "").trim();
      if (!transcript) { allowContinue("We could not detect enough speech. You may record again or continue."); return; }
      ui.transcript.textContent = transcript;
      ui.transcript.hidden = false;
      showReply();
    } catch (_) {
      allowContinue("Your recording is available above, but the transcript could not be created. You may record again or continue.");
    }
  }
  function showReply() {
    const turn = turns[index];
    ui.replyText.textContent = turn.reply;
    ui.reply.hidden = false;
    ui.status.textContent = "Mia replied. Listen, then continue when you are ready.";
    controls("Again", false, false);
    ui.next.disabled = false;
    setFloating("Mia replied");
    play(turn.reaction, null, "responding");
  }
  function toggleRecording() { if (recorder?.state === "recording") finishRecording(); else startRecording(); }
  function setView(mode, persist = true) {
    const mobile = mode === "mobile";
    document.body.classList.toggle("ie2-mobile-focus", mobile);
    ui.desktop?.classList.toggle("is-active", !mobile);
    ui.mobile?.classList.toggle("is-active", mobile);
    ui.desktop?.setAttribute("aria-pressed", String(!mobile));
    ui.mobile?.setAttribute("aria-pressed", String(mobile));
    if (mobile && ui.support) ui.support.open = false;
    if (persist) { try { localStorage.setItem("jaralingua-ie2-midterm-view", mode); } catch (_) {} }
  }

  ui.record.addEventListener("click", toggleRecording);
  ui.floating?.addEventListener("click", toggleRecording);
  ui.next.addEventListener("click", () => {
    if (index >= turns.length - 1) {
      ui.live.hidden = true; ui.complete.hidden = false; ui.floatingDock.hidden = true;
      document.body.classList.remove("has-floating-dock");
      ui.complete.scrollIntoView({ behavior: "smooth", block: "start" });
      play("closing.mp3", null, "responding");
      return;
    }
    index += 1; renderTurn();
  });
  ui.startButton.addEventListener("click", () => {
    index = 0; ui.start.hidden = true; ui.complete.hidden = true; ui.live.hidden = false;
    ui.floatingDock.hidden = false; document.body.classList.add("has-floating-dock");
    renderTurn();
  });
  ui.restart.addEventListener("click", () => {
    stopTracks(); ui.complete.hidden = true; ui.live.hidden = true; ui.start.hidden = false;
    ui.floatingDock.hidden = true; document.body.classList.remove("has-floating-dock");
    ui.start.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  ui.welcome?.addEventListener("click", () => play(turns[0].audio, ui.welcome));
  ui.desktop?.addEventListener("click", () => setView("desktop"));
  ui.mobile?.addEventListener("click", () => setView("mobile"));
  document.querySelectorAll("[data-speed]").forEach((button) => button.addEventListener("click", () => {
    speed = Number(button.dataset.speed) || 1; ui.audio.playbackRate = speed;
    document.querySelectorAll("[data-speed]").forEach((item) => item.classList.toggle("is-active", item === button));
  }));
  try { setView(localStorage.getItem("jaralingua-ie2-midterm-view") || (window.matchMedia("(max-width: 720px)").matches ? "mobile" : "desktop"), false); } catch (_) {}
  refreshMicrophones().catch(() => {});
  window.addEventListener("beforeunload", () => {
    stopTracks();
    if (recordingUrl) URL.revokeObjectURL(recordingUrl);
  });
})();
