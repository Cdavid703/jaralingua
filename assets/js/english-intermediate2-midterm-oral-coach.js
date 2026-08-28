(() => {
  "use strict";

  const AUDIO_ROOT = "audio/midterm-oral-conversation-coach/";
  const API_PATH = "/api/english-intermediate/pronunciation-assessment";
  const MAX_SECONDS = 45;
  const turns = [
    { topic: "Seeing an old friend", prompt: "Oh wow, is that really you? I can't believe it has been so long! Hi! How have you been?", audio: "turn-1-warm-hello.mp3", hint: "It’s so good to see you, Mia. I’ve been well, thank you. How have you been?", reply: "I’m really happy to see you too. I’ve been busy, but I often thought about our school days.", reaction: "reaction-1-warm-hello.mp3" },
    { topic: "Catching up", prompt: "I know! Tell me, what have you been doing lately? Are you still in touch with anyone from school?", audio: "turn-2-catching-up.mp3", hint: "Lately, I’ve been working and studying. I still keep in touch with Laura.", reply: "That’s lovely. It is strange how quickly time passes, but some friendships still feel familiar.", reaction: "reaction-2-catching-up.mp3" },
    { topic: "A friend’s dilemma", prompt: "Do you remember Valentina? She went through a terrible situation. Her life partner lied to her about something important, and now she does not know whether to stay or leave. What do you think about it?", audio: "turn-3-common-friend.mp3", hint: "That sounds really difficult. I think Valentina feels hurt because she trusted her partner.", reply: "Exactly. She feels hurt and confused, and we all want to support her without making the decision for her.", reaction: "reaction-3-common-friend.mp3" },
    { topic: "What would you do?", prompt: "If you were in Valentina’s situation, what would you do?", audio: "turn-4-second-conditional.mp3", hint: "If I were in her situation, I would talk honestly with my partner because trust matters.", reply: "I understand. It would be a painful decision, but thinking about trust and respect is important.", reaction: "reaction-4-second-conditional.mp3" },
    { topic: "Your love-life dilemma", prompt: "And you? Are you facing any dilemma in your love life or relationships these days? You can tell me; I’m your friend.", audio: "turn-5-your-dilemma.mp3", hint: "Actually, I’m dealing with a difficult decision. I don’t know whether I should continue this relationship.", reply: "Thank you for trusting me with that. Relationship dilemmas can be hard because feelings and practical choices are often mixed together.", reaction: "reaction-5-your-dilemma.mp3" },
    { topic: "Advice for Mia", prompt: "I have one too. I like someone, but I am afraid that a relationship could affect our friendship. What would you advise me to do?", audio: "turn-6-give-advice.mp3", hint: "If I were you, I would be honest and take things slowly. You could talk about your feelings.", reply: "That is helpful advice. I think I need to be honest and take things slowly instead of imagining the worst outcome.", reaction: "reaction-6-give-advice.mp3" },
    { topic: "Dating questions and a close", prompt: "Before we go, ask me one question about dating or relationships. Then we can make plans to see each other again.", audio: "turn-7-dating-question.mp3", hint: "What do you think is important in a relationship?", reply: "For me, honesty, respect and good communication matter most. I’m glad we talked. Let’s not lose touch again.", reaction: "reaction-7-dating-close.mp3" }
  ];

  const $ = (id) => document.getElementById(id);
  const ui = { start: $("coachStart"), live: $("coachLive"), complete: $("coachComplete"), startButton: $("startCoach"), restart: $("restartCoach"), counter: $("turnCounter"), topic: $("turnTopic"), progress: $("turnProgress"), prompt: $("coachPrompt"), suggestion: $("answerSuggestion").querySelector("span"), replay: $("replayCoach"), audio: $("miaAudio"), record: $("recordButton"), next: $("nextTurn"), status: $("recordStatus"), timer: $("recordTimer"), levelBar: $("coachLevelBar"), levelText: $("coachLevelText"), transcript: $("studentTranscript"), studentAudio: $("studentAudio"), reply: $("coachReply"), replyText: $("coachReplyText"), recovery: $("recoveryMessage") };
  let index = 0, speed = 1, stream = null, recorder = null, chunks = [], startedAt = 0, timerId = null, recordingUrl = "", recordingBlob = null, activeAudioButton = null, audioContext = null, analyser = null, meterFrame = 0, meterSource = null;

  function audioUrl(file) { return new URL(AUDIO_ROOT + file, window.location.href).href; }
  function setPlaying(button, playing) { if (!button) return; button.classList.toggle("is-playing", playing); }
  function play(file, button) { if (!file) return Promise.resolve(); if (activeAudioButton) setPlaying(activeAudioButton, false); activeAudioButton = button || null; ui.audio.pause(); ui.audio.src = audioUrl(file); ui.audio.playbackRate = speed; return ui.audio.play().then(() => setPlaying(button, true)).catch(() => setPlaying(button, false)); }
  ui.audio.addEventListener("ended", () => setPlaying(activeAudioButton, false));
  ui.audio.addEventListener("pause", () => setPlaying(activeAudioButton, false));

  function resetAnswer() {
    stopMeter(); if (recordingUrl) URL.revokeObjectURL(recordingUrl); recordingUrl = ""; recordingBlob = null; chunks = [];
    ui.status.textContent = "Tap the microphone and answer naturally."; ui.timer.textContent = "00:00 / 00:45"; ui.transcript.hidden = true; ui.transcript.textContent = ""; ui.studentAudio.hidden = true; ui.studentAudio.removeAttribute("src"); ui.reply.hidden = true; ui.replyText.textContent = ""; ui.recovery.hidden = true; ui.recovery.textContent = ""; ui.next.disabled = true; ui.record.disabled = false; ui.record.classList.remove("is-recording"); ui.record.innerHTML = '<i class="bi bi-mic-fill"></i><span>Speak</span>';
  }

  function renderTurn() {
    const turn = turns[index]; resetAnswer();
    ui.counter.textContent = `${index + 1} / ${turns.length}`; ui.topic.textContent = turn.topic; ui.progress.style.width = `${((index + 1) / turns.length) * 100}%`; ui.prompt.textContent = turn.prompt; ui.suggestion.textContent = turn.hint; ui.replay.onclick = () => play(turn.audio, ui.replay); window.setTimeout(() => play(turn.audio, ui.replay), 200);
  }

  function preferredMimeType() { return ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"].find((type) => window.MediaRecorder?.isTypeSupported?.(type)) || ""; }
  function resetMeter() { if (ui.levelBar) ui.levelBar.style.width = "0%"; if (ui.levelText) ui.levelText.textContent = "Waiting for your voice"; }
  function stopMeter() { if (meterFrame) window.cancelAnimationFrame(meterFrame); meterFrame = 0; if (meterSource) { try { meterSource.disconnect(); } catch (_) {} } meterSource = null; analyser = null; if (audioContext) { const currentContext = audioContext; audioContext = null; currentContext.close().catch(() => {}); } resetMeter(); }
  function startMeter(micStream) { const Context = window.AudioContext || window.webkitAudioContext; if (!Context || !ui.levelBar || !ui.levelText) return; try { audioContext = new Context(); meterSource = audioContext.createMediaStreamSource(micStream); analyser = audioContext.createAnalyser(); analyser.fftSize = 256; meterSource.connect(analyser); const samples = new Uint8Array(analyser.fftSize); ui.levelText.textContent = "Listening for your voice"; const draw = () => { if (!analyser) return; analyser.getByteTimeDomainData(samples); let energy = 0; for (const sample of samples) { const normalized = (sample - 128) / 128; energy += normalized * normalized; } const level = Math.min(100, Math.round(Math.sqrt(energy / samples.length) * 360)); ui.levelBar.style.width = `${Math.max(3, level)}%`; ui.levelText.textContent = level > 8 ? "Voice detected" : "Listening for your voice"; meterFrame = window.requestAnimationFrame(draw); }; draw(); } catch (_) { resetMeter(); } }
  function stopTracks() { stopMeter(); if (stream) stream.getTracks().forEach((track) => track.stop()); stream = null; }
  function updateTimer() { const seconds = Math.min(MAX_SECONDS, Math.floor((Date.now() - startedAt) / 1000)); ui.timer.textContent = `00:${String(seconds).padStart(2, "0")} / 00:45`; if (seconds >= MAX_SECONDS) finishRecording(); }
  async function startRecording() {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true }); startMeter(stream); chunks = []; const mime = preferredMimeType(); recorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream); recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); }; recorder.onstop = () => processRecording(mime || recorder.mimeType); recorder.start(250); startedAt = Date.now(); timerId = window.setInterval(updateTimer, 250); ui.status.textContent = "Mia is listening. Speak naturally, then tap Finish."; ui.record.classList.add("is-recording"); ui.record.innerHTML = '<i class="bi bi-stop-fill"></i><span>Finish</span>';
    } catch (error) { ui.status.textContent = error.name === "NotAllowedError" ? "Allow the microphone, then try again." : "The microphone is unavailable. Check your browser and try again."; }
  }
  function finishRecording() { if (recorder?.state === "recording") recorder.stop(); if (timerId) window.clearInterval(timerId); timerId = null; stopMeter(); ui.record.disabled = true; ui.record.classList.remove("is-recording"); ui.status.textContent = "Preparing your private transcript."; }
  async function processRecording(mime) {
    stopTracks(); recordingBlob = new Blob(chunks, { type: mime || "audio/webm" }); if (!recordingBlob.size) { allowContinue("No audio was recorded. You can continue or record this turn again."); return; }
    recordingUrl = URL.createObjectURL(recordingBlob); ui.studentAudio.src = recordingUrl; ui.studentAudio.hidden = false; await transcribe(recordingBlob);
  }
  function allowContinue(message) { if (message) { ui.recovery.textContent = message; ui.recovery.hidden = false; } ui.status.textContent = "Ready to continue."; ui.record.disabled = false; ui.record.innerHTML = '<i class="bi bi-arrow-repeat"></i><span>Again</span>'; ui.next.disabled = false; }
  async function transcribe(blob) {
    try { const controller = new AbortController(); const timeout = window.setTimeout(() => controller.abort(), 30000); const response = await fetch(API_PATH, { method: "POST", headers: { "Content-Type": blob.type || "audio/webm" }, body: blob, signal: controller.signal }); window.clearTimeout(timeout); const payload = await response.json().catch(() => ({})); if (!response.ok) throw new Error(payload.error || "transcription failed"); const transcript = String(payload.text || payload.transcript || "").trim(); if (!transcript) { allowContinue("We could not detect enough speech. You may record again or continue."); return; } ui.transcript.textContent = transcript; ui.transcript.hidden = false; showReply(); }
    catch (_) { allowContinue("Your recording is available above, but the transcript could not be created. You may record again or continue."); }
  }
  function showReply() { const turn = turns[index]; ui.replyText.textContent = turn.reply; ui.reply.hidden = false; ui.status.textContent = "Mia replied. Listen, then continue when you are ready."; ui.record.disabled = false; ui.record.innerHTML = '<i class="bi bi-arrow-repeat"></i><span>Again</span>'; ui.next.disabled = false; play(turn.reaction, null); }
  ui.record.addEventListener("click", () => recorder?.state === "recording" ? finishRecording() : startRecording());
  ui.next.addEventListener("click", () => { if (index >= turns.length - 1) { ui.live.hidden = true; ui.complete.hidden = false; ui.complete.scrollIntoView({ behavior: "smooth", block: "start" }); play("closing.mp3", null); return; } index += 1; renderTurn(); });
  ui.startButton.addEventListener("click", () => { index = 0; ui.start.hidden = true; ui.complete.hidden = true; ui.live.hidden = false; renderTurn(); });
  ui.restart.addEventListener("click", () => { stopTracks(); ui.complete.hidden = true; ui.live.hidden = true; ui.start.hidden = false; ui.start.scrollIntoView({ behavior: "smooth", block: "start" }); });
  document.querySelectorAll("[data-speed]").forEach((button) => button.addEventListener("click", () => { speed = Number(button.dataset.speed) || 1; ui.audio.playbackRate = speed; document.querySelectorAll("[data-speed]").forEach((item) => item.classList.toggle("is-active", item === button)); }));
  window.addEventListener("beforeunload", () => { stopTracks(); if (recordingUrl) URL.revokeObjectURL(recordingUrl); });
})();
