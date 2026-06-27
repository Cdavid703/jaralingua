(function () {
  "use strict";

  const USER_KEY = "jaralingua_google_user";
  const API_PATH = "/api/french8/pronunciation-grade";

  function readUser() {
    try {
      const saved = JSON.parse(sessionStorage.getItem(USER_KEY) || "null");
      if (!saved || !saved.exp || Date.now() / 1000 > saved.exp) return null;
      return saved;
    } catch (_error) {
      return null;
    }
  }

  function openGooglePanel() {
    const trigger = document.querySelector("[data-auth-toggle], [data-auth-nav-toggle]");
    if (trigger) trigger.click();
  }

  function gradeFromScore(score) {
    return Math.round((Number(score || 0) / 20) * 100) / 100;
  }

  function createPanel(config) {
    const panel = document.createElement("div");
    panel.className = "pronunciation-submit-panel";
    panel.innerHTML = `
      <h3><i class="bi bi-send-check"></i> Envoi au professeur</h3>
      <p data-pronunciation-submit-copy>Terminez le défi final avec au moins 50/100. Vous pourrez recommencer autant de fois que nécessaire avant d'envoyer votre note.</p>
      <div class="pronunciation-submit-metrics">
        <span><b data-pronunciation-score>--</b><small>Défi final</small></span>
        <span><b data-pronunciation-grade>--</b><small>Note / 5</small></span>
      </div>
      <div class="pronunciation-submit-actions">
        <button type="button" class="action-button reset" data-pronunciation-reset><i class="bi bi-arrow-repeat"></i> Réinitialiser les résultats</button>
        <button type="button" class="action-button submit-grade" data-pronunciation-submit disabled><i class="bi bi-send-fill"></i> Envoyer au professeur</button>
      </div>
      <p class="pronunciation-submit-status" data-pronunciation-submit-status aria-live="polite"></p>
    `;

    const scoreNode = panel.querySelector("[data-pronunciation-score]");
    const gradeNode = panel.querySelector("[data-pronunciation-grade]");
    const submitButton = panel.querySelector("[data-pronunciation-submit]");
    const resetButton = panel.querySelector("[data-pronunciation-reset]");
    const statusNode = panel.querySelector("[data-pronunciation-submit-status]");
    const copyNode = panel.querySelector("[data-pronunciation-submit-copy]");

    function finalAttempt() {
      return config.getFinalScore ? config.getFinalScore() : null;
    }

    function setStatus(message, type) {
      statusNode.textContent = message || "";
      statusNode.className = "pronunciation-submit-status" + (type ? " " + type : "");
    }

    function update() {
      const attempt = finalAttempt();
      const score = Number(attempt && attempt.overall);
      if (!Number.isFinite(score)) {
        scoreNode.textContent = "--";
        gradeNode.textContent = "--";
        submitButton.disabled = true;
        copyNode.textContent = "Terminez le défi final avec au moins 50/100. Vous pourrez recommencer autant de fois que nécessaire avant d'envoyer votre note.";
        return;
      }
      scoreNode.textContent = Math.round(score) + "/100";
      gradeNode.textContent = gradeFromScore(score).toFixed(2) + "/5";
      submitButton.disabled = score < 50;
      copyNode.textContent = score < 50
        ? "Le défi final doit atteindre au moins 50/100 pour être envoyé. Recommencez le défi quand vous êtes prêt."
        : "Votre défi final peut être envoyé. Seule la note sur 5 sera inscrite dans le carnet du Niveau 8.";
    }

    async function submit() {
      const attempt = finalAttempt();
      const score = Number(attempt && attempt.overall);
      if (!Number.isFinite(score) || score < 50) {
        setStatus("Le score minimal pour envoyer est 50/100.", "error");
        update();
        return;
      }
      const user = readUser();
      if (!user || !user.credential) {
        setStatus("Connectez-vous avec votre compte enregistré avant d'envoyer.", "error");
        openGooglePanel();
        return;
      }
      submitButton.disabled = true;
      setStatus("Envoi en cours...", "pending");
      try {
        const response = await fetch(API_PATH, {
          method: "POST",
          headers: {
            Authorization: "Bearer " + user.credential,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            evaluationId: config.evaluationId,
            score100: Math.round(score),
            activityTitle: config.title || "",
            details: attempt
          })
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          if (payload.error === "score_too_low") throw new Error("Le score minimal est 50/100.");
          if (payload.error === "student_not_authorized") throw new Error("Votre compte n'est pas encore associé au carnet du Niveau 8.");
          throw new Error("L'envoi n'a pas pu être terminé.");
        }
        setStatus("Envoyé. Note enregistrée : " + Number(payload.grade).toFixed(2) + "/5.", "success");
      } catch (error) {
        setStatus(error.message || "Impossible d'envoyer la note.", "error");
      } finally {
        update();
      }
    }

    resetButton.addEventListener("click", function () {
      if (config.resetAll) config.resetAll();
      setStatus("Résultats réinitialisés. Vous pouvez refaire l'atelier.", "pending");
      update();
    });
    submitButton.addEventListener("click", submit);
    update();

    return { panel, update };
  }

  window.JaraFrench8PronunciationGrade = { createPanel };
})();
