(function () {
  "use strict";

  const USER_KEY = "jaralingua_google_user";
  const API_PATH = "/api/french8/commentary-submission";
  const MIN_WORDS = 140;
  const MAX_WORDS = 180;
  const MIN_SUBJONCTIFS = 4;

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

  function wordCount(value) {
    return String(value || "").trim().split(/\s+/).filter(Boolean).length;
  }

  function subjonctifPastCount(value) {
    const matches = String(value || "").match(/\b(aie|aies|ait|ayons|ayez|aient|sois|soit|soyons|soyez|soient)\s+[\p{L}'’-]+/giu);
    return matches ? matches.length : 0;
  }

  function hasNuance(value) {
    return /\b(certes|cela dit|pourtant|néanmoins|neanmoins|toutefois)\b/i.test(String(value || ""));
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

  function setPill(node, ok, text) {
    if (!node) return;
    node.textContent = text;
    node.className = "validation-pill " + (ok ? "is-ok" : "is-warn");
  }

  function updateValidation() {
    const text = $("#studentText") ? $("#studentText").value : "";
    const count = wordCount(text);
    const subj = subjonctifPastCount(text);
    const nuance = hasNuance(text);
    const planReady = $("#planCheck") ? $("#planCheck").checked : false;
    const listened = $("#audioReviewCheck") ? $("#audioReviewCheck").checked : false;

    setPill($("#wordCount"), count >= MIN_WORDS && count <= MAX_WORDS, count + " mot" + (count === 1 ? "" : "s") + " / 140-180");
    setPill($("#subjCount"), subj >= MIN_SUBJONCTIFS, subj + " subjonctif" + (subj === 1 ? "" : "s") + " passé" + (subj === 1 ? "" : "s") + " détecté" + (subj === 1 ? "" : "s"));
    setPill($("#nuanceStatus"), nuance, nuance ? "Nuance présente" : "Ajoutez certes, cela dit, pourtant, néanmoins ou toutefois");
    setPill($("#audioStatus"), !!audioBlob, audioBlob ? "Audio enregistré" : "Audio à enregistrer");
    setPill($("#planStatus"), planReady && listened, planReady && listened ? "Checklist prête" : "Checklist à compléter");

    const submitButton = $("#submitButton");
    if (submitButton) submitButton.disabled = !(count >= MIN_WORDS && count <= MAX_WORDS && subj >= MIN_SUBJONCTIFS && nuance && audioBlob && planReady && listened);
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
        if (status) status.textContent = "Audio enregistré. Écoutez-le avant l'envoi.";
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
      if (status) status.textContent = error.message === "recording_unsupported" ? "Ce navigateur ne permet pas l'enregistrement audio." : "Impossible d'accéder au microphone.";
      setRecordState(false);
    }
  }

  function stopRecording() {
    if (mediaRecorder && mediaRecorder.state === "recording") mediaRecorder.stop();
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
    if (status) status.textContent = "Enregistrez votre lecture quand votre texte est prêt.";
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
    if (status) status.textContent = "Envoi au professeur en cours. Ne fermez pas cette page.";
    try {
      const response = await fetch(API_PATH, {
        method: "POST",
        headers: {
          Authorization: "Bearer " + user.credential,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text: $("#studentText").value,
          promptVersion: "20260714-commentaire-critique-03e",
          audioDataUrl: await blobToDataUrl(audioBlob)
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (payload.error === "invalid_word_count") throw new Error("Le texte doit contenir entre 140 et 180 mots.");
        if (payload.error === "subjonctif_required") throw new Error("Ajoutez au moins 4 formes de subjonctif passé.");
        if (payload.error === "missing_nuance") throw new Error("Ajoutez une nuance : certes, cela dit, pourtant, néanmoins ou toutefois.");
        if (payload.error === "missing_audio") throw new Error("L'audio n'a pas été reçu. Recommencez l'enregistrement.");
        if (payload.error === "student_not_authorized") throw new Error("Votre compte n'est pas associé au carnet du Niveau 8.");
        throw new Error("L'envoi n'a pas pu être terminé.");
      }
      const submittedAt = payload.submittedAt ? " Envoi enregistré : " + payload.submittedAt + "." : "";
      const wordInfo = payload.wordCount ? " Mots : " + payload.wordCount + "." : "";
      const subjInfo = payload.subjonctifCount ? " Subjonctifs passés détectés : " + payload.subjonctifCount + "." : "";
      if (status) status.textContent = "Envoyé correctement. Votre texte et votre audio sont disponibles dans Notes du cours pour le feedback du professeur." + submittedAt + wordInfo + subjInfo;
      button.innerHTML = '<i class="bi bi-check2-circle"></i> Envoyé au professeur';
      button.disabled = true;
    } catch (error) {
      if (status) status.textContent = error.message || "Impossible d'envoyer l'activité.";
      updateValidation();
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    $("#studentText")?.addEventListener("input", updateValidation);
    $("#planCheck")?.addEventListener("change", updateValidation);
    $("#audioReviewCheck")?.addEventListener("change", updateValidation);
    $("#recordButton")?.addEventListener("click", startRecording);
    $("#stopButton")?.addEventListener("click", stopRecording);
    $("#resetAudioButton")?.addEventListener("click", resetRecording);
    $("#submitButton")?.addEventListener("click", submitActivity);
    updateValidation();
  });
})();
