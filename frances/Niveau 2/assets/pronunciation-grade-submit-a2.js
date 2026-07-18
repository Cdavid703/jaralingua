(() => {
  "use strict";

  const API_PATH = "/api/french2/pronunciation-grade";
  const GOOGLE_KEY = "jaralingua_google_user";
  const MICROSOFT_KEY = "jaralingua_microsoft_user";
  const LOCAL_KEY = "jaralingua_local_gradebook_user:french2GradesApp";
  const CONFIGS = [
    {
      path: "/ateliers/prononciation.html",
      storageKey: "jaralingua:french2:pronunciation:routines:v2",
      evaluationId: "pronunciationTheme1",
      label: "Theme 1 - Routines quotidiennes"
    },
    {
      path: "/ateliers/prononciation-logement.html",
      storageKey: "jaralingua:french2:pronunciation:logement:v2",
      evaluationId: "pronunciationTheme3",
      label: "Theme 3 - Logement"
    },
    {
      path: "/ateliers/prononciation-sante.html",
      storageKey: "jaralingua:french2:pronunciation:sante:v2",
      evaluationId: "pronunciationTheme5",
      label: "Theme 5 - Sante"
    },
    {
      path: "/ateliers/prononciation-directions.html",
      storageKey: "jaralingua:french2:pronunciation:theme7:v2",
      evaluationId: "pronunciationTheme7",
      label: "Theme 7 - Ville et directions"
    }
  ];

  const config = CONFIGS.find((item) => location.pathname.endsWith(item.path));
  if (!config) return;

  function storedUser(storageKey) {
    try {
      const saved = JSON.parse(sessionStorage.getItem(storageKey) || "null");
      if (!saved || !saved.credential || saved.exp <= Date.now() / 1000) {
        sessionStorage.removeItem(storageKey);
        return null;
      }
      return saved;
    } catch (_error) {
      sessionStorage.removeItem(storageKey);
      return null;
    }
  }

  function activeGradeUser() {
    const google = storedUser(GOOGLE_KEY);
    if (google) return Object.assign({ provider: "google" }, google);
    const microsoft = storedUser(MICROSOFT_KEY);
    if (microsoft) return Object.assign({ provider: "microsoft" }, microsoft);
    const local = storedUser(LOCAL_KEY);
    if (local) return Object.assign({ provider: "local" }, local);
    return null;
  }

  function gradeFromScore(score) {
    return Math.round((Number(score || 0) / 20) * 100) / 100;
  }

  function readFinalAttempt() {
    try {
      const saved = JSON.parse(localStorage.getItem(config.storageKey) || "null");
      const attempt = saved && Array.isArray(saved.scores) ? saved.scores[3] : null;
      if (!attempt) return null;
      const score = Number(attempt.score ?? attempt.overall);
      if (!Number.isFinite(score)) return null;
      return Object.assign({}, attempt, { finalScore: Math.max(0, Math.min(100, Math.round(score))) });
    } catch (_error) {
      return null;
    }
  }

  function setStatus(node, message, type) {
    node.textContent = message || "";
    node.className = "pronunciation-submit-status" + (type ? " " + type : "");
  }

  function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result || "");
      reader.onerror = () => reject(reader.error || new Error("audio_read_error"));
      reader.readAsDataURL(blob);
    });
  }

  async function currentFinalAudioDataUrl(attempt) {
    if (attempt && typeof attempt.audioDataUrl === "string" && attempt.audioDataUrl.startsWith("data:")) {
      return attempt.audioDataUrl;
    }
    const player = document.getElementById("recordingPlayback");
    if (!player || !player.src || !player.src.startsWith("blob:")) return "";
    try {
      const response = await fetch(player.src);
      if (!response.ok) return "";
      const blob = await response.blob();
      return await blobToDataUrl(blob);
    } catch (_error) {
      return "";
    }
  }

  function ensureStyles() {
    if (document.getElementById("french2PronunciationSubmitStyles")) return;
    const style = document.createElement("style");
    style.id = "french2PronunciationSubmitStyles";
    style.textContent = `
      .pronunciation-submit-panel{margin-top:1rem;padding:1rem;border-radius:18px;background:#fff;box-shadow:var(--shadow);border-left:6px solid var(--yellow)}
      .pronunciation-submit-panel h3{color:var(--blue-dark);font-weight:900;margin:0 0 .5rem}
      .pronunciation-submit-panel p{color:var(--muted);line-height:1.55}
      .pronunciation-submit-metrics{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.6rem;margin:.8rem 0}
      .pronunciation-submit-metrics span{display:grid;gap:.15rem;padding:.75rem;border-radius:12px;background:#f8fbff;text-align:center}
      .pronunciation-submit-metrics b{color:var(--blue-dark);font-size:1.25rem}
      .pronunciation-submit-metrics small{color:var(--muted);font-weight:800}
      .submit-grade{background:var(--blue-dark);color:#fff}
      .submit-grade:disabled{opacity:.55}
      .pronunciation-submit-status{font-weight:900;margin:.75rem 0 0!important}
      .pronunciation-submit-status.success{color:#126047}
      .pronunciation-submit-status.error{color:#9f1d2a}
      .pronunciation-submit-status.pending{color:#765000}
      .pronunciation-submit-status.uncertain{color:#765000}
    `;
    document.head.appendChild(style);
  }

  function createPanel() {
    ensureStyles();
    const panel = document.createElement("section");
    panel.className = "pronunciation-submit-panel";
    panel.innerHTML = `
      <h3><i class="bi bi-send-check"></i> Envoi au professeur</h3>
      <p data-submit-copy>Cette activite est evaluable. Terminez le defi final pour envoyer la note obtenue au professeur. Une nouvelle remise remplace la precedente.</p>
      <div class="pronunciation-submit-metrics">
        <span><b data-submit-score>--</b><small>Defi final</small></span>
        <span><b data-submit-grade>--</b><small>Note / 5</small></span>
      </div>
      <button type="button" class="action-button submit-grade" data-submit-button disabled><i class="bi bi-send-fill"></i> Envoyer au professeur</button>
      <p class="pronunciation-submit-status" data-submit-status aria-live="polite"></p>
    `;
    const anchor = document.getElementById("feedback")?.closest(".panel");
    if (anchor) anchor.insertAdjacentElement("afterend", panel);
    return panel;
  }

  const panel = createPanel();
  const copy = panel.querySelector("[data-submit-copy]");
  const scoreNode = panel.querySelector("[data-submit-score]");
  const gradeNode = panel.querySelector("[data-submit-grade]");
  const button = panel.querySelector("[data-submit-button]");
  const status = panel.querySelector("[data-submit-status]");
  let latestAttempt = null;

  function update() {
    latestAttempt = readFinalAttempt();
    if (!latestAttempt) {
      scoreNode.textContent = "--";
      gradeNode.textContent = "--";
      button.disabled = true;
      copy.textContent = `${config.label} est evaluable. Le bouton s'active apres le defi final. Une nouvelle remise remplace la precedente.`;
      return;
    }
    scoreNode.textContent = `${latestAttempt.finalScore}/100`;
    gradeNode.textContent = `${gradeFromScore(latestAttempt.finalScore).toFixed(2)}/5`;
    button.disabled = false;
    copy.textContent = latestAttempt.uncertain
      ? "Votre defi final peut etre envoye comme estimation avec reserve. Le professeur doit verifier l'audio avant de valider la note. Une nouvelle remise remplace la precedente."
      : "Votre defi final peut etre envoye avec la note obtenue. Une nouvelle remise remplace la note precedente dans le carnet du Niveau 2.";
    if (latestAttempt.uncertain) {
      if (!status.classList.contains("success") && !status.classList.contains("pending")) {
        setStatus(status, "Reconnaissance incertaine : l'audio reste la preuve principale.", "uncertain");
      }
    } else if (status.classList.contains("uncertain")) {
      setStatus(status, "", "");
    }
  }

  async function submitGrade() {
    update();
    if (!latestAttempt) {
      setStatus(status, "Terminez d'abord le defi final avant d'envoyer.", "error");
      return;
    }
    const user = activeGradeUser();
    if (!user || !user.credential) {
      setStatus(status, "Connectez-vous avec votre compte enregistre avant d'envoyer.", "error");
      document.querySelector("[data-auth-toggle], [data-auth-nav-toggle]")?.click();
      return;
    }
    button.disabled = true;
    setStatus(status, "Envoi en cours...", "pending");
    try {
      const audioDataUrl = await currentFinalAudioDataUrl(latestAttempt);
      const details = Object.assign({}, latestAttempt);
      if (audioDataUrl) details.audioDataUrl = audioDataUrl;
      const response = await fetch(API_PATH, {
        method: "POST",
        headers: {
          Authorization: "Bearer " + user.credential,
          "X-Jaralingua-Auth-Provider": user.provider || "google",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          evaluationId: config.evaluationId,
          score100: latestAttempt.finalScore,
          activityTitle: config.label,
          details
        })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (result.error === "score_too_low") throw new Error("La note obtenue devrait pouvoir etre envoyee. Actualisez la page et reessayez.");
        if (result.error === "student_not_authorized") throw new Error("Votre compte n'est pas associe au carnet du Niveau 2.");
        throw new Error("L'envoi n'a pas pu etre termine.");
      }
      setStatus(status, "Envoye. Note enregistree : " + Number(result.grade).toFixed(2) + "/5.", "success");
    } catch (error) {
      setStatus(status, error.message || "Impossible d'envoyer la note.", "error");
    } finally {
      update();
    }
  }

  button.addEventListener("click", submitGrade);
  update();
  setInterval(update, 1000);
})();
