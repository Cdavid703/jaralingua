(() => {
  "use strict";

  const REFERENCE = "Si j’avais mieux préparé mon voyage, je n’aurais pas oublié mon passeport à la maison. J’aurais réservé un hôtel plus proche de la gare et nous aurions évité beaucoup de stress. Mes amis auraient pu profiter davantage du séjour, et cette expérience nous aurait certainement rendus plus prudents pour nos prochaines aventures.";
  const API_PATH = "/api/french8/pronunciation-assessment";
  const LOCAL_URL = "http://127.0.0.1:8020/frances/Niveau%208/ateliers/prononciation-01d-conditionnel-passe.html";

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

  let mediaRecorder = null;
  let mediaStream = null;
  let chunks = [];
  let startedAt = 0;
  let recordedDurationMs = 0;
  let timerHandle = null;
  let objectUrl = null;
  let discardRecording = false;
  let analyzing = false;

  const consentLabel = document.createElement("label");
  consentLabel.className = "record-consent";
  consentLabel.innerHTML = '<input type="checkbox" id="audioConsent" checked hidden> <span><i class="bi bi-shield-check"></i> Cet enregistrement est analysé temporairement par Whisper sur le serveur JaraLingua. Il n’est ni envoyé à ElevenLabs ni sauvegardé.</span>';
  micButton.parentNode.insertBefore(consentLabel, micButton);
  const audioConsent = document.getElementById("audioConsent");
  const microphonePicker = document.createElement("label");
  microphonePicker.className = "microphone-picker";
  microphonePicker.innerHTML = '<span><i class="bi bi-mic"></i> Microphone utilisé</span><select id="microphoneSelect" aria-label="Choisir le microphone"><option value="">Microphone par défaut</option></select>';
  microphonePicker.style.cssText = "display:grid;gap:.35rem;max-width:620px;margin:0 auto 1rem;text-align:left;color:#15345d;font-weight:900";
  micButton.parentNode.insertBefore(microphonePicker, micButton);
  const microphoneSelect = document.getElementById("microphoneSelect");
  microphoneSelect.style.cssText = "width:100%;padding:.65rem .8rem;border:1px solid rgba(31,78,140,.22);border-radius:10px;background:#fff;color:#15345d";

  async function refreshMicrophones() {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    try {
      const currentValue = microphoneSelect.value;
      const devices = (await navigator.mediaDevices.enumerateDevices()).filter((device) => device.kind === "audioinput");
      microphoneSelect.innerHTML = '<option value="">Microphone par défaut</option>' + devices.map((device, index) => '<option value="' + device.deviceId + '">' + (device.label || ('Microphone ' + (index + 1))) + '</option>').join("");
      if ([...microphoneSelect.options].some((option) => option.value === currentValue)) microphoneSelect.value = currentValue;
    } catch (_error) {
      microphoneSelect.innerHTML = '<option value="">Microphone par défaut</option>';
    }
  }

  function normalizeWord(value) {
    return value.toLocaleLowerCase("fr-FR").replace(/[\u2019']/g, "'").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zœæ'-]/g, "").replace(/^[-']+|[-']+$/g, "");
  }

  function tokens(value) {
    return value.split(/\s+/).map(normalizeWord).filter(Boolean);
  }

  const referenceWords = tokens(REFERENCE);

  function renderReference(states = []) {
    let index = 0;
    readingText.innerHTML = REFERENCE.split(/(\s+)/).map((part) => {
      if (/^\s+$/.test(part)) return part;
      const state = states[index++] || "";
      return `<span class="reading-word ${state}" data-word="${index - 1}">${part}</span>`;
    }).join("");
  }

  function align(reference, spoken) {
    const rows = reference.length + 1;
    const cols = spoken.length + 1;
    const dp = Array.from({ length: rows }, () => Array(cols).fill(0));
    for (let i = 0; i < rows; i += 1) dp[i][0] = i;
    for (let j = 0; j < cols; j += 1) dp[0][j] = j;
    for (let i = 1; i < rows; i += 1) {
      for (let j = 1; j < cols; j += 1) {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + (reference[i - 1] === spoken[j - 1] ? 0 : 1)
        );
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
    audioConsent.disabled = recording || busy;
    micButton.querySelector("i").className = recording ? "bi bi-soundwave" : "bi bi-mic-fill";
  }

  function feedbackFor(score, missed, wpm) {
    const focus = missed.slice(0, 5).join(", ");
    if (score >= 88) return "Excellente lecture : le texte est très fidèle et votre rythme est naturel. Répétez une fois pour consolider les liaisons.";
    if (score >= 70) return `Bonne lecture. Reprenez surtout ${focus || "les mots signalés"} et comparez leur enchaînement avec la voix modèle.${wpm < 95 ? " Essayez aussi de lire un peu plus continûment." : ""}`;
    return `Écoutez de nouveau le modèle, puis travaillez par groupes de mots. Commencez par : ${focus || "les mots en rouge"}. Ne cherchez pas la vitesse; visez d’abord une articulation claire.`;
  }

  function evaluate(transcript) {
    const spoken = tokens(transcript);
    if (!spoken.length) throw new Error("Aucune parole n’a été reconnue. Réessayez plus près du microphone.");
    const aligned = align(referenceWords, spoken);
    const durationMinutes = Math.max(1 / 60, recordedDurationMs / 60000);
    const wpm = spoken.length / durationMinutes;
    const completeness = clamp(aligned.matches / referenceWords.length * 100);
    const accuracy = clamp((1 - aligned.distance / Math.max(referenceWords.length, spoken.length)) * 100);
    const fluency = clamp(100 - Math.abs(wpm - 125) * 1.2);
    const overall = clamp(accuracy * .55 + completeness * .3 + fluency * .15);
    renderReference(aligned.states);
    document.getElementById("accuracyScore").textContent = `${accuracy}%`;
    document.getElementById("completenessScore").textContent = `${completeness}%`;
    document.getElementById("fluencyScore").textContent = `${fluency}%`;
    document.getElementById("overallScore").textContent = overall;
    document.getElementById("scoreRing").style.setProperty("--score", overall);
    const missed = referenceWords.filter((_, index) => aligned.states[index] !== "is-correct");
    document.getElementById("feedback").textContent = feedbackFor(overall, missed, wpm);
    results.hidden = false;
    results.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  async function transcribeAndEvaluate(blob) {
    analyzing = true;
    setControls(false, true);
    recordStatus.textContent = "Analyse locale de votre lecture avec Whisper…";
    liveTranscript.textContent = "Transcription en cours…";
    try {
      const response = await fetch(API_PATH, {
        method: "POST",
        headers: { "Content-Type": blob.type || "audio/webm" },
        body: blob
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || `Erreur du serveur (${response.status}).`);
      const transcript = (payload.text || "").trim();
      const audioStats = payload.audio || {};
      if (!transcript) {
        if (Number(audioStats.rms || 0) < 0.0008) throw new Error("La grabación llegó en silencio. Verifique el micrófono seleccionado en el navegador y pruebe nuevamente.");
        throw new Error("Whisper recibió sonido, pero no identificó palabras francesas. Hable un poco más cerca y con mayor volumen.");
      }
      liveTranscript.textContent = transcript;
      evaluate(transcript);
      recordStatus.textContent = "Lecture évaluée. Consultez votre bilan.";
    } catch (error) {
      recordStatus.textContent = "L’analyse n’a pas pu être terminée.";
      liveTranscript.textContent = error.message || "Erreur de transcription.";
    } finally {
      analyzing = false;
      setControls(false, false);
    }
  }

  async function start() {
    if (analyzing) return;
    if (!audioConsent.checked) {
      recordStatus.textContent = "La validation locale de l’enregistrement est requise.";
      audioConsent.focus();
      return;
    }
    reset(false);
    try {
      const audioConstraints = { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 };
      if (microphoneSelect.value) audioConstraints.deviceId = { exact: microphoneSelect.value };
      mediaStream = await navigator.mediaDevices.getUserMedia({ audio: audioConstraints, video: false });
      const activeTrack = mediaStream.getAudioTracks()[0];
      recordHelp.textContent = activeTrack?.label ? `Microphone actif : ${activeTrack.label}` : "Microphone actif";
      await refreshMicrophones();
      const activeDeviceId = activeTrack?.getSettings?.().deviceId;
      if (activeDeviceId && [...microphoneSelect.options].some((option) => option.value === activeDeviceId)) microphoneSelect.value = activeDeviceId;
      chunks = [];
      discardRecording = false;
      const preferredType = window.MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus" : "";
      mediaRecorder = preferredType ? new MediaRecorder(mediaStream, { mimeType: preferredType }) : new MediaRecorder(mediaStream);
      mediaRecorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
      mediaRecorder.onerror = () => {
        recordStatus.textContent = "Le navigateur n’a pas pu enregistrer le son.";
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
      recordStatus.textContent = "Enregistrement en cours… lisez tout le paragraphe.";
      liveTranscript.textContent = "Votre transcription apparaîtra après l’analyse.";
    } catch (error) {
      stopTracks();
      recordStatus.textContent = error?.name === "NotAllowedError" ? "L’accès au microphone a été refusé." : "Impossible d’accéder au microphone. Vérifiez le périphérique sélectionné.";
      setControls(false, false);
    }
  }

  function stopTracks() {
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
    recordStatus.textContent = "Préparation de l’analyse…";
    mediaRecorder.stop();
  }

  function reset(clearAudio = true) {
    if (mediaRecorder?.state === "recording") {
      discardRecording = true;
      mediaRecorder.stop();
    }
    stopTracks();
    clearInterval(timerHandle);
    startedAt = 0;
    recordedDurationMs = 0;
    renderReference();
    liveTranscript.textContent = "Votre transcription apparaîtra après la lecture.";
    recordStatus.textContent = "Prêt pour votre lecture";
    timer.textContent = "00:00";
    results.hidden = true;
    setControls(false, false);
    if (clearAudio) {
      studentAudio.hidden = true;
      studentAudio.removeAttribute("src");
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      objectUrl = null;
    }
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
  resetButton.addEventListener("click", () => reset(true));

  refreshMicrophones();
  navigator.mediaDevices?.addEventListener?.("devicechange", refreshMicrophones);
  renderReference();
  if (location.protocol === "file:") {
    unsupported.hidden = false;
    micButton.disabled = true;
    recordStatus.textContent = "Le microphone ne fonctionne pas en mode fichier";
    recordHelp.textContent = "Ouvrez cette activité depuis localhost ou depuis le site HTTPS.";
    unsupported.innerHTML = `<strong>Mode local détecté.</strong><br>Les navigateurs bloquent le microphone sur les adresses file://.<br><a href="${LOCAL_URL}"><i class="bi bi-box-arrow-up-right"></i> Ouvrir la version compatible</a>`;
  } else if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
    unsupported.hidden = false;
    micButton.disabled = true;
    recordStatus.textContent = "Enregistrement vocal indisponible";
  }
})();
