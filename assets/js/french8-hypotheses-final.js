(function () {
  "use strict";

  const USER_KEY = "jaralingua_google_user";
  const API_PATH = "/api/french8/hypotheses-submission";
  const MIN_WORDS = 120;
  const idioms = [
    { expression: "avec le recul", meaning: "avec la distance necessaire pour comprendre une situation passee" },
    { expression: "sur le coup", meaning: "au moment meme, sans avoir encore reflechi" },
    { expression: "se mordre les doigts", meaning: "regretter fortement une decision" },
    { expression: "passer a cote de quelque chose", meaning: "manquer une occasion importante" },
    { expression: "tourner la page", meaning: "accepter le passe et continuer" },
    { expression: "apprendre a ses depens", meaning: "comprendre apres une erreur ou une consequence negative" },
    { expression: "sauver les meubles", meaning: "limiter les degats dans une situation difficile" },
    { expression: "mettre le doigt sur le probleme", meaning: "identifier clairement la vraie difficulte" }
  ];

  let mediaRecorder = null;
  let mediaStream = null;
  let chunks = [];
  let audioBlob = null;
  let audioUrl = "";
  let startedAt = 0;
  let timerHandle = null;

  function $(selector) {
    return document.querySelector(selector);
  }

  function readUser() {
    try {
      const saved = JSON.parse(sessionStorage.getItem(USER_KEY) || "null");
      if (!saved || !saved.exp || Date.now() / 1000 > saved.exp) return null;
      return saved;
    } catch (_error) {
      return null;
    }
  }

  function normalize(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  function wordCount(value) {
    return String(value || "").trim().split(/\s+/).filter(Boolean).length;
  }

  function formatTime(ms) {
    const total = Math.floor(ms / 1000);
    return String(Math.floor(total / 60)).padStart(2, "0") + ":" + String(total % 60).padStart(2, "0");
  }

  function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(reader.error || new Error("Audio illisible."));
      reader.readAsDataURL(blob);
    });
  }

  function renderIdioms() {
    const bank = $("#idiomBank");
    const select = $("#idiomSelect");
    if (!bank || !select) return;
    bank.innerHTML = idioms.map((item) => `
      <button class="idiom-card" type="button" data-idiom="${item.expression}">
        <strong>${item.expression}</strong>
        <span>${item.meaning}</span>
      </button>
    `).join("");
    select.innerHTML = '<option value="">Choisissez une expression</option>' + idioms.map((item) => `<option value="${item.expression}">${item.expression}</option>`).join("");
    bank.querySelectorAll("[data-idiom]").forEach((button) => {
      button.addEventListener("click", () => {
        select.value = button.dataset.idiom;
        updateValidation();
        $("#studentText").focus();
      });
    });
  }

  function selectedIdiom() {
    return $("#idiomSelect") ? $("#idiomSelect").value : "";
  }

  function updateValidation() {
    const text = $("#studentText") ? $("#studentText").value : "";
    const idiom = selectedIdiom();
    const count = wordCount(text);
    const hasIdiom = idiom && normalize(text).includes(normalize(idiom));
    const countNode = $("#wordCount");
    const idiomStatus = $("#idiomStatus");
    const submitButton = $("#submitButton");
    if (countNode) {
      countNode.textContent = count + " mot" + (count === 1 ? "" : "s");
      countNode.classList.toggle("is-ok", count >= MIN_WORDS);
    }
    if (idiomStatus) {
      idiomStatus.textContent = idiom
        ? hasIdiom ? "Expression trouvee dans le texte." : "Copiez l'expression choisie exactement dans votre texte."
        : "Choisissez une expression du banco.";
      idiomStatus.className = "validation-pill " + (hasIdiom ? "is-ok" : "is-warn");
    }
    if (submitButton) submitButton.disabled = !(count >= MIN_WORDS && hasIdiom && audioBlob);
  }

  function setRecordState(recording) {
    const recordButton = $("#recordButton");
    const stopButton = $("#stopButton");
    if (recordButton) {
      recordButton.disabled = recording;
      recordButton.classList.toggle("is-recording", recording);
    }
    if (stopButton) stopButton.disabled = !recording;
  }

  async function startRecording() {
    const status = $("#recordStatus");
    try {
      if (!navigator.mediaDevices || !window.MediaRecorder) throw new Error("recording_unsupported");
      mediaStream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true }, video: false });
      const preferredType = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"].find((type) => MediaRecorder.isTypeSupported(type)) || "";
      mediaRecorder = new MediaRecorder(mediaStream, preferredType ? { mimeType: preferredType } : undefined);
      chunks = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size) chunks.push(event.data);
      };
      mediaRecorder.onstop = () => {
        audioBlob = new Blob(chunks, { type: mediaRecorder.mimeType || "audio/webm" });
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        audioUrl = URL.createObjectURL(audioBlob);
        const player = $("#studentAudio");
        if (player) {
          player.src = audioUrl;
          player.hidden = false;
        }
        mediaStream.getTracks().forEach((track) => track.stop());
        mediaStream = null;
        window.clearInterval(timerHandle);
        setRecordState(false);
        if (status) status.textContent = "Audio pret. Vous pouvez l'ecouter avant l'envoi.";
        updateValidation();
      };
      mediaRecorder.start();
      startedAt = Date.now();
      timerHandle = window.setInterval(() => {
        const timer = $("#timer");
        if (timer) timer.textContent = formatTime(Date.now() - startedAt);
      }, 250);
      setRecordState(true);
      if (status) status.textContent = "Enregistrement en cours...";
    } catch (error) {
      if (status) status.textContent = error.message === "recording_unsupported" ? "Ce navigateur ne permet pas l'enregistrement audio." : "Impossible d'acceder au microphone.";
      setRecordState(false);
    }
  }

  function stopRecording() {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
    }
  }

  function resetRecording() {
    audioBlob = null;
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    audioUrl = "";
    const player = $("#studentAudio");
    if (player) {
      player.hidden = true;
      player.removeAttribute("src");
    }
    const timer = $("#timer");
    if (timer) timer.textContent = "00:00";
    const status = $("#recordStatus");
    if (status) status.textContent = "Enregistrez votre lecture quand votre texte est pret.";
    updateValidation();
  }

  async function submitActivity() {
    const user = readUser();
    const status = $("#submitStatus");
    const button = $("#submitButton");
    if (!user || !user.credential) {
      if (status) status.textContent = "Connectez-vous avec votre compte Google avant d'envoyer.";
      document.querySelector("[data-auth-toggle], [data-auth-nav-toggle]")?.click();
      return;
    }
    if (!audioBlob) {
      if (status) status.textContent = "Enregistrez l'audio avant d'envoyer.";
      return;
    }
    button.disabled = true;
    if (status) status.textContent = "Envoi au professeur...";
    try {
      const response = await fetch(API_PATH, {
        method: "POST",
        headers: {
          Authorization: "Bearer " + user.credential,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text: $("#studentText").value,
          idiom: selectedIdiom(),
          promptVersion: "20260629-hypotheses-final",
          audioDataUrl: await blobToDataUrl(audioBlob)
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (payload.error === "text_too_short") throw new Error("Le texte doit contenir au moins 120 mots.");
        if (payload.error === "idiom_not_found") throw new Error("L'expression choisie doit apparaitre exactement dans le texte.");
        if (payload.error === "missing_audio") throw new Error("L'audio n'a pas ete recu. Recommencez l'enregistrement.");
        if (payload.error === "student_not_authorized") throw new Error("Votre compte n'est pas associe au carnet du Niveau 8.");
        throw new Error("L'envoi n'a pas pu etre termine.");
      }
      if (status) status.textContent = "Envoye. Votre texte et votre audio sont disponibles pour le feedback du professeur.";
    } catch (error) {
      if (status) status.textContent = error.message || "Impossible d'envoyer l'activite.";
    } finally {
      updateValidation();
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderIdioms();
    $("#studentText")?.addEventListener("input", updateValidation);
    $("#idiomSelect")?.addEventListener("change", updateValidation);
    $("#recordButton")?.addEventListener("click", startRecording);
    $("#stopButton")?.addEventListener("click", stopRecording);
    $("#resetAudioButton")?.addEventListener("click", resetRecording);
    $("#submitButton")?.addEventListener("click", submitActivity);
    updateValidation();
  });
})();
