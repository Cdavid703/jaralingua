(() => {
  "use strict";

  const SETS = {
    "theme-1": {
      title: "Premiers contacts à voix haute",
      audio: "../audio/prononciation/stages/theme-1-defi.mp3",
      audios: [
        "../audio/prononciation/stages/theme-1-stage-1.mp3",
        "../audio/prononciation/stages/theme-1-stage-2.mp3",
        "../audio/prononciation/stages/theme-1-stage-3.mp3",
        "../audio/prononciation/stages/theme-1-defi.mp3"
      ],
      back: "../ateliers-activites.html#theme-01",
      image: "../img/ateliers/prononciation-premiers-contacts.png",
      stages: [
        "Bonjour, je m’appelle Lina.",
        "Je suis colombienne et j’habite à Bogotá.",
        "Enchantée ! Comment vous appelez-vous ?",
        "Bonjour, je m’appelle Lina. Je suis colombienne et j’habite à Bogotá. Enchantée ! Comment vous appelez-vous ?"
      ],
      tips: [
        ["bi-chat-dots", "Dans « je m’appelle », gardez le rythme court : je / m’appelle."],
        ["bi-soundwave", "Le son « ou » de « vous » est arrondi. Ne le prononcez pas comme le « u » français."],
        ["bi-pause-circle", "Faites une pause légère après « Bonjour » et après « Enchantée »."]
      ]
    },
    "theme-2": {
      title: "Le présent de l’indicatif à voix haute",
      audio: "../audio/prononciation/stages/theme-2-defi.mp3",
      audios: [
        "../audio/prononciation/stages/theme-2-stage-1.mp3",
        "../audio/prononciation/stages/theme-2-stage-2.mp3",
        "../audio/prononciation/stages/theme-2-stage-3.mp3",
        "../audio/prononciation/stages/theme-2-defi.mp3"
      ],
      back: "../ateliers-activites.html#theme-02",
      image: "../img/ateliers/prononciation-verbes-er.png",
      stages: [
        "Je parle français tous les jours.",
        "Tu écoutes la radio le matin.",
        "Nous travaillons ensemble.",
        "Je parle français tous les jours. Tu écoutes la radio le matin. Nous travaillons ensemble."
      ],
      tips: [
        ["bi-volume-mute", "Les terminaisons -e, -es et -ent ne se prononcent pas dans les verbes du premier groupe."],
        ["bi-link-45deg", "Dans « nous travaillons ensemble », faites la liaison entre « travaillons » et « ensemble »."],
        ["bi-music-note", "Gardez un rythme régulier : sujet + verbe + complément."]
      ]
    },
    "theme-3": {
      title: "Verbes essentiels à voix haute",
      audio: "../audio/prononciation/stages/theme-3-defi.mp3",
      audios: [
        "../audio/prononciation/stages/theme-3-stage-1.mp3",
        "../audio/prononciation/stages/theme-3-stage-2.mp3",
        "../audio/prononciation/stages/theme-3-stage-3.mp3",
        "../audio/prononciation/stages/theme-3-defi.mp3"
      ],
      back: "../ateliers-activites.html#theme-04",
      image: "../img/ateliers/prononciation-verbes-essentiels.png",
      stages: [
        "Je suis étudiante et j’ai vingt ans.",
        "Je vais en cours à huit heures.",
        "Je fais mes exercices le soir.",
        "Je suis étudiante et j’ai vingt ans. Je vais en cours à huit heures. Je fais mes exercices le soir."
      ],
      tips: [
        ["bi-exclamation-circle", "Dans « je suis », le s final de « suis » ne se prononce pas."],
        ["bi-soundwave", "Le son « ai » dans « j’ai » se prononce comme « é » ou « è » selon l’accent."],
        ["bi-clock", "Ne lisez pas trop vite : les verbes irréguliers doivent rester très clairs."]
      ]
    },
    "theme-4": {
      title: "Famille et relations à voix haute",
      audio: "../audio/prononciation/stages/theme-4-defi.mp3",
      audios: [
        "../audio/prononciation/stages/theme-4-stage-1.mp3",
        "../audio/prononciation/stages/theme-4-stage-2.mp3",
        "../audio/prononciation/stages/theme-4-stage-3.mp3",
        "../audio/prononciation/stages/theme-4-defi.mp3"
      ],
      back: "../ateliers-activites.html#theme-05",
      image: "../img/ateliers/prononciation-famille.png",
      stages: [
        "Voici ma famille.",
        "Mon frère s’appelle Lucas.",
        "Mes grands-parents habitent à Lyon.",
        "Voici ma famille. Mon frère s’appelle Lucas. Mes grands-parents habitent à Lyon."
      ],
      tips: [
        ["bi-person-hearts", "Dans « frère », ouvrez bien le son « è »."],
        ["bi-volume-mute", "Dans « grands-parents », le d de « grands » est muet."],
        ["bi-link-45deg", "Dans « habitent à », faites une liaison douce : habitent-à."]
      ]
    },
    "theme-5": {
      title: "Description et personnalité à voix haute",
      audio: "../audio/prononciation/stages/theme-5-defi.mp3",
      audios: [
        "../audio/prononciation/stages/theme-5-stage-1.mp3",
        "../audio/prononciation/stages/theme-5-stage-2.mp3",
        "../audio/prononciation/stages/theme-5-stage-3.mp3",
        "../audio/prononciation/stages/theme-5-defi.mp3"
      ],
      back: "../ateliers-activites.html#theme-06",
      image: "../img/ateliers/prononciation-description.png",
      stages: [
        "Elle est souriante et généreuse.",
        "Elle a les cheveux noirs.",
        "Elle porte des lunettes rondes.",
        "Elle est souriante et généreuse. Elle a les cheveux noirs. Elle porte des lunettes rondes."
      ],
      tips: [
        ["bi-link-45deg", "Dans « elle est », la liaison est naturelle : elle-est."],
        ["bi-volume-mute", "Dans « noirs » et « rondes », les consonnes finales restent très légères."],
        ["bi-emoji-smile", "Pour décrire une personne, gardez une intonation chaleureuse et claire."]
      ]
    }
  };

  const params = new URLSearchParams(location.search);
  const key = params.get("theme") || "theme-1";
  const set = SETS[key] || SETS["theme-1"];
  const els = {
    title: document.getElementById("pronTitle"),
    modelAudio: document.getElementById("modelAudio"),
    modelButton: document.getElementById("modelButton"),
    stageCounter: document.getElementById("stageCounter"),
    stageTitle: document.getElementById("stageTitle"),
    stageProgress: document.getElementById("stageProgress"),
    readingText: document.getElementById("readingText"),
    wordHelp: document.getElementById("wordHelp"),
    micStatus: document.getElementById("micStatus"),
    recordBtn: document.getElementById("recordBtn"),
    stopBtn: document.getElementById("stopBtn"),
    retryBtn: document.getElementById("retryBtn"),
    nextBtn: document.getElementById("nextBtn"),
    playback: document.getElementById("recordingPlayback"),
    timer: document.getElementById("timer"),
    feedback: document.getElementById("feedback"),
    tips: document.getElementById("tips"),
    stageBadge: document.getElementById("stageBadge"),
    microphoneSelect: document.getElementById("microphoneSelect"),
    levelMeterBar: document.getElementById("levelMeterBar"),
    levelMeterValue: document.getElementById("levelMeterValue"),
    comparisonNote: document.getElementById("comparisonNote"),
    results: document.getElementById("results"),
    metrics: document.getElementById("metrics")
  };

  let stageIndex = 0;
  const completedStages = new Set();
  let stream = null;
  let recorder = null;
  let chunks = [];
  let startedAt = 0;
  let timerHandle = null;
  let objectUrl = null;
  let audioContext = null;
  let analyser = null;
  let meterFrame = null;

  function currentText() {
    return set.stages[stageIndex];
  }

  function currentModelAudio() {
    return set.audios?.[stageIndex] || set.audio;
  }

  function updateSelfAssessment() {
    const total = set.stages.length;
    const completed = completedStages.size;
    const percent = total ? Math.round((completed / total) * 100) : 0;
    els.results.classList.toggle("is-empty", completed === 0);
    els.results.style.setProperty("--score-progress", `${percent}%`);
    els.stageBadge.textContent = `${completed}/${total}`;
    els.metrics.innerHTML = `
      <div class="metric"><strong>${completed}</strong><span>Lectures enregistrées</span></div>
      <div class="metric"><strong>${Math.min(completed, total - 1)}/${total - 1}</strong><span>Sections guidées</span></div>
      <div class="metric"><strong>${completed === total ? "Oui" : "—"}</strong><span>Défi final</span></div>
    `;
    els.feedback.textContent = completed === 0
      ? "Aucun progrès enregistré pour le moment. Le bilan commence seulement après une lecture terminée."
      : completed === total
        ? "Parcours complet : écoutez votre défi final après le modèle et notez les sons à reprendre."
        : `Étape validée : continuez avec la section suivante. Progrès réel : ${completed} lecture${completed > 1 ? "s" : ""} enregistrée${completed > 1 ? "s" : ""}.`;
  }

  function renderStageProgress() {
    els.stageProgress.innerHTML = set.stages.map((_, index) => {
      const classes = ["stage-dot"];
      if (index === stageIndex) classes.push("is-active");
      if (completedStages.has(index)) classes.push("is-done");
      return `<span class="${classes.join(" ")}">${index === set.stages.length - 1 ? "Défi" : index + 1}</span>`;
    }).join("");
  }

  function render() {
    const finalStage = stageIndex === set.stages.length - 1;
    els.title.textContent = set.title;
    els.modelAudio.pause();
    els.modelButton.querySelector("i").className = "bi bi-play-fill";
    els.modelAudio.src = currentModelAudio();
    document.querySelectorAll("[href$='#theme-01'], [href$='#theme-02'], [href$='#theme-04'], [href$='#theme-05'], [href$='#theme-06']").forEach((link) => {
      if (link.textContent.includes("Ateliers") || link.textContent.includes("Retour")) link.href = set.back;
    });
    document.querySelector(".hero").style.setProperty("--hero-image", `url('${set.image}')`);
    const heroImage = document.querySelector(".hero-card img");
    if (heroImage) heroImage.src = set.image;
    els.stageCounter.textContent = finalStage ? "Défi final" : `Pratique guidée · ${stageIndex + 1} sur ${set.stages.length - 1}`;
    els.stageTitle.textContent = finalStage ? "Lisez maintenant le paragraphe complet" : `Section ${stageIndex + 1}`;
    renderStageProgress();
    els.readingText.innerHTML = currentText().split(/(\s+)/).map((part) => {
      if (/^\s+$/.test(part)) return part;
      const clean = part.replace(/[.,!?;:()[\]{}«»"]/g, "");
      return `<button type="button" class="reading-word" data-word="${clean}">${part}</button>`;
    }).join("");
    els.tips.innerHTML = set.tips.map(([icon, text]) => `<div class="tip"><i class="bi ${icon}"></i><p>${text}</p></div>`).join("");
    els.comparisonNote.textContent = finalStage
      ? "Défi final : écoutez le modèle complet, enregistrez-vous, puis comparez votre fluidité globale."
      : "Objectif : répéter cette phrase courte avec une articulation lente, claire et régulière.";
    updateSelfAssessment();
  }

  function speakWord(word) {
    if (!word || !window.speechSynthesis) return;
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    const voices = speechSynthesis.getVoices();
    const frenchVoice = voices.find((voice) => voice.lang.toLowerCase() === "fr-fr") || voices.find((voice) => voice.lang.toLowerCase().startsWith("fr"));
    utterance.lang = "fr-FR";
    utterance.rate = 0.72;
    if (frenchVoice) utterance.voice = frenchVoice;
    speechSynthesis.speak(utterance);
    els.wordHelp.hidden = false;
    els.wordHelp.innerHTML = `<strong><i class="bi bi-volume-up"></i> ${word}</strong><span>Écoutez le mot, puis répétez-le lentement avant de lire toute la phrase.</span>`;
  }

  function formatTime(ms) {
    const total = Math.max(0, Math.floor(ms / 1000));
    return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
  }

  function updateTimer() {
    els.timer.textContent = formatTime(Date.now() - startedAt);
  }

  function stopLevelMeter() {
    if (meterFrame) cancelAnimationFrame(meterFrame);
    meterFrame = null;
    analyser = null;
    if (audioContext) audioContext.close().catch(() => {});
    audioContext = null;
    els.levelMeterBar.style.width = "0";
    els.levelMeterValue.textContent = "En attente";
  }

  function startLevelMeter(activeStream) {
    stopLevelMeter();
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 1024;
    audioContext.createMediaStreamSource(activeStream).connect(analyser);
    const samples = new Uint8Array(analyser.fftSize);
    const update = () => {
      analyser.getByteTimeDomainData(samples);
      let sum = 0;
      for (const sample of samples) {
        const value = (sample - 128) / 128;
        sum += value * value;
      }
      const rms = Math.sqrt(sum / samples.length);
      const percent = Math.min(100, Math.round(rms * 900));
      els.levelMeterBar.style.width = `${percent}%`;
      els.levelMeterValue.textContent = percent < 4 ? "Parlez plus fort" : percent < 55 ? "Signal correct" : "Signal fort";
      meterFrame = requestAnimationFrame(update);
    };
    update();
  }

  async function refreshMicrophones() {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    try {
      const current = els.microphoneSelect.value;
      const devices = (await navigator.mediaDevices.enumerateDevices()).filter((device) => device.kind === "audioinput");
      els.microphoneSelect.innerHTML = '<option value="">Microphone par défaut</option>' + devices.map((device, index) => `<option value="${device.deviceId}">${device.label || `Microphone ${index + 1}`}</option>`).join("");
      if ([...els.microphoneSelect.options].some((option) => option.value === current)) els.microphoneSelect.value = current;
    } catch (_error) {
      els.microphoneSelect.innerHTML = '<option value="">Microphone par défaut</option>';
    }
  }

  function setRecordingControls(recording) {
    els.recordBtn.disabled = recording;
    els.stopBtn.disabled = !recording;
    els.microphoneSelect.disabled = recording;
    els.recordBtn.classList.toggle("is-recording", recording);
    els.recordBtn.querySelector("i").className = recording ? "bi bi-soundwave" : "bi bi-mic-fill";
  }

  async function startRecording() {
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
      els.micStatus.textContent = "Demande d’autorisation du microphone…";
      const audioConstraints = { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 };
      if (els.microphoneSelect.value) audioConstraints.deviceId = { exact: els.microphoneSelect.value };
      stream = await navigator.mediaDevices.getUserMedia({ audio: audioConstraints, video: false });
      await refreshMicrophones();
      startLevelMeter(stream);
      chunks = [];
      const preferredType = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"].find((type) => MediaRecorder.isTypeSupported(type)) || "";
      recorder = preferredType ? new MediaRecorder(stream, { mimeType: preferredType }) : new MediaRecorder(stream);
      recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
      recorder.onstop = finishRecording;
      recorder.start();
      startedAt = Date.now();
      timerHandle = setInterval(updateTimer, 250);
      setRecordingControls(true);
      els.micStatus.textContent = `Enregistrement : « ${currentText()} »`;
    } catch (error) {
      const messages = {
        NotAllowedError: "Autorisation refusée. Ouvrez les paramètres du navigateur, autorisez le microphone pour JaraLingua et réessayez.",
        SecurityError: "Le microphone exige HTTPS ou localhost. En production, vérifiez que la page est servie en HTTPS.",
        NotFoundError: "Aucun microphone n’a été détecté.",
        NotReadableError: "Le microphone est utilisé par une autre application.",
        AbortError: "Le navigateur a interrompu l’activation du microphone. Réessayez.",
        OverconstrainedError: "Le microphone choisi n’est plus disponible. Sélectionnez le microphone par défaut.",
        NotSupportedError: "Ce navigateur ne prend pas en charge l’enregistrement audio."
      };
      els.micStatus.textContent = messages[error.name] || `Impossible d’activer le microphone : ${error.message}`;
    }
  }

  function finishRecording() {
    clearInterval(timerHandle);
    timerHandle = null;
    stopLevelMeter();
    if (stream) stream.getTracks().forEach((track) => track.stop());
    stream = null;
    setRecordingControls(false);
    const blob = new Blob(chunks, { type: recorder?.mimeType || "audio/webm" });
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = URL.createObjectURL(blob);
    els.playback.src = objectUrl;
    els.playback.hidden = false;
    els.micStatus.textContent = "Enregistrement prêt. Écoutez-vous, puis comparez avec le modèle.";
    els.comparisonNote.textContent = "Conseil : écoutez le modèle une fois, puis votre enregistrement. Si votre version est beaucoup plus rapide, relisez avec des pauses plus visibles.";
    completedStages.add(stageIndex);
    renderStageProgress();
    updateSelfAssessment();
  }

  function stopRecording() {
    if (recorder && recorder.state === "recording") recorder.stop();
  }

  function resetStage() {
    stopRecording();
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = null;
    els.playback.hidden = true;
    els.playback.removeAttribute("src");
    els.timer.textContent = "00:00";
    els.micStatus.textContent = "Prêt pour votre lecture.";
    els.wordHelp.hidden = true;
    stopLevelMeter();
  }

  function nextStage() {
    resetStage();
    stageIndex = (stageIndex + 1) % set.stages.length;
    render();
  }

  els.modelButton.addEventListener("click", () => {
    if (els.modelAudio.paused) {
      els.modelAudio.play();
      els.modelButton.querySelector("i").className = "bi bi-pause-fill";
    } else {
      els.modelAudio.pause();
      els.modelButton.querySelector("i").className = "bi bi-play-fill";
    }
  });
  els.modelAudio.addEventListener("ended", () => { els.modelButton.querySelector("i").className = "bi bi-play-fill"; });
  els.readingText.addEventListener("click", (event) => {
    const button = event.target.closest(".reading-word");
    if (button) speakWord(button.dataset.word);
  });
  els.recordBtn.addEventListener("click", startRecording);
  els.stopBtn.addEventListener("click", stopRecording);
  els.retryBtn.addEventListener("click", resetStage);
  els.nextBtn.addEventListener("click", nextStage);

  refreshMicrophones();
  render();
})();
