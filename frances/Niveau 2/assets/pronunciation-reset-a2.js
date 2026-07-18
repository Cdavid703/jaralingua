(function (root, factory) {
  "use strict";

  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.JaraFrench2PronunciationReset = api;
  if (root?.document && root?.location) api.init(root);
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const CONFIG_BY_PAGE = {
    "prononciation.html": ["routines", "pronunciationTheme1"],
    "prononciation-vetements.html": ["vetements", "pronunciationTheme2"],
    "prononciation-logement.html": ["logement", "pronunciationTheme3"],
    "prononciation-restaurant.html": ["restaurant", "pronunciationTheme4"],
    "prononciation-sante.html": ["sante", "pronunciationTheme5"],
    "prononciation-plans.html": ["theme6", "pronunciationTheme6"],
    "prononciation-directions.html": ["theme7", "pronunciationTheme7"]
  };

  function configForPath(pathname) {
    let cleanPath = String(pathname || "").split(/[?#]/, 1)[0].replace(/\\/g, "/");
    try {
      cleanPath = decodeURIComponent(cleanPath);
    } catch (_error) {}
    const pageName = cleanPath.split("/").pop().toLowerCase();
    const entry = CONFIG_BY_PAGE[pageName];
    if (!entry) return null;
    return {
      storageKey: `jaralingua:french2:pronunciation:${entry[0]}:v2`,
      legacyStorageKey: `jaralingua:french2:pronunciation:${entry[0]}:v1`,
      evaluationId: entry[1]
    };
  }

  function isTechnicalFailureAttempt(attempt) {
    if (!attempt || typeof attempt !== "object" || Array.isArray(attempt)) return false;
    const rawScore = attempt.score ?? attempt.overall;
    if (rawScore === null || rawScore === "" || !Number.isFinite(Number(rawScore)) || Number(rawScore) !== 0) return false;
    const transcript = String(attempt.transcript || "").trim().toLocaleLowerCase("fr-FR");
    return attempt.analysisUnavailable === true
      || transcript === ""
      || transcript.includes("analyse automatique indisponible");
  }

  function sanitizeState(rawState) {
    if (!rawState || typeof rawState !== "object" || Array.isArray(rawState)) {
      return { state: rawState, changed: false, removedCount: 0, firstInvalidStage: -1 };
    }

    const state = Object.assign({}, rawState);
    let changed = false;
    let removedCount = 0;
    let firstInvalidStage = -1;

    if (Array.isArray(rawState.scores)) {
      state.scores = rawState.scores.slice();
      state.scores.forEach((attempt, index) => {
        if (!isTechnicalFailureAttempt(attempt)) return;
        state.scores[index] = null;
        removedCount += 1;
        changed = true;
        if (firstInvalidStage < 0) firstInvalidStage = index;
      });
    }

    if (Array.isArray(rawState.history)) {
      state.history = rawState.history.map((items) => {
        if (!Array.isArray(items)) return items;
        const cleaned = items.filter((attempt) => !isTechnicalFailureAttempt(attempt));
        removedCount += items.length - cleaned.length;
        if (cleaned.length !== items.length) changed = true;
        return cleaned;
      });
    }

    const currentStage = Number(state.stage);
    if (firstInvalidStage >= 0 && Number.isFinite(currentStage) && currentStage > firstInvalidStage) {
      state.stage = firstInvalidStage;
      changed = true;
    }

    return { state, changed, removedCount, firstInvalidStage };
  }

  function repairStoredState(storage, config) {
    const result = { changed: false, removedCount: 0, repairedKeys: [] };
    [config.storageKey, config.legacyStorageKey].forEach((key) => {
      try {
        const serialized = storage.getItem(key);
        if (!serialized) return;
        const repaired = sanitizeState(JSON.parse(serialized));
        if (!repaired.changed) return;
        storage.setItem(key, JSON.stringify(repaired.state));
        result.changed = true;
        result.removedCount += repaired.removedCount;
        result.repairedKeys.push(key);
      } catch (_error) {}
    });
    return result;
  }

  function setStatus(document, message) {
    const status = document.getElementById("micStatus");
    if (status) status.textContent = message;
  }

  function installRestartButton(win, config, repairResult) {
    const document = win.document;
    const actions = document.querySelector(".record-zone .actions");
    if (!actions || document.getElementById("restartActivityBtn")) return null;

    const button = document.createElement("button");
    button.type = "button";
    button.id = "restartActivityBtn";
    button.className = "action-button restart-activity";
    button.title = "Effacer la progression de cette activite et reprendre la premiere section";
    button.innerHTML = '<i class="bi bi-arrow-repeat" aria-hidden="true"></i> Recommencer toute l\u2019activit\u00e9';
    button.addEventListener("click", () => {
      const recording = document.getElementById("recordBtn")?.classList.contains("is-recording")
        || document.getElementById("stopBtn")?.disabled === false;
      if (recording) {
        setStatus(document, "Terminez d\u2019abord l\u2019enregistrement en cours.");
        return;
      }

      const confirmed = win.confirm(
        "Recommencer toute l\u2019activit\u00e9 ?\n\n"
        + "La progression enregistr\u00e9e dans ce navigateur sera effac\u00e9e. "
        + "Si une note a d\u00e9j\u00e0 \u00e9t\u00e9 envoy\u00e9e, une nouvelle remise la remplacera ; "
        + "cette action ne supprime pas la note du serveur."
      );
      if (!confirmed) return;

      try {
        win.localStorage.removeItem(config.storageKey);
        win.localStorage.removeItem(config.legacyStorageKey);
        win.location.reload();
      } catch (_error) {
        setStatus(document, "Impossible d\u2019effacer la progression dans ce navigateur.");
      }
    });
    actions.append(button);

    if (repairResult.changed) {
      setStatus(document, "Un ancien essai sans voix a \u00e9t\u00e9 retir\u00e9. Reprenez cette section ; aucun z\u00e9ro technique n\u2019a \u00e9t\u00e9 conserv\u00e9.");
    }
    return button;
  }

  function init(win) {
    const config = configForPath(win.location.pathname);
    if (!config) return null;
    const repairResult = repairStoredState(win.localStorage, config);
    const install = () => installRestartButton(win, config, repairResult);
    if (win.document.readyState === "loading") win.document.addEventListener("DOMContentLoaded", install, { once: true });
    else install();
    return { config, repairResult };
  }

  return {
    configForPath,
    init,
    installRestartButton,
    isTechnicalFailureAttempt,
    repairStoredState,
    sanitizeState
  };
});
