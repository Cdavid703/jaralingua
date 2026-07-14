(function () {
  "use strict";

  const SPEEDS = [0.75, 1, 1.25];

  function injectStyles() {
    if (document.getElementById("french8-listening-controls-style")) return;
    const style = document.createElement("style");
    style.id = "french8-listening-controls-style";
    style.textContent = `
      .listening-tools {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: .75rem;
        margin-top: .85rem;
      }
      .listening-tools.is-compact {
        margin-top: .55rem;
      }
      .speed-group {
        display: inline-flex;
        flex-wrap: wrap;
        align-items: center;
        gap: .45rem;
        padding: .55rem;
        border: 1px solid rgba(31,78,140,.14);
        border-radius: 999px;
        background: #fff;
      }
      .speed-group > span {
        color: #15345d;
        font-weight: 900;
        font-size: .86rem;
        padding: 0 .3rem;
      }
      .speed-btn {
        min-width: 58px;
        border: 2px solid rgba(31,78,140,.18);
        border-radius: 999px;
        background: #fff;
        color: #15345d;
        font-weight: 900;
        padding: .42rem .68rem;
      }
      .speed-btn:hover,
      .speed-btn.active {
        background: #15345d;
        border-color: #15345d;
        color: #fff;
      }
      .speed-btn:focus-visible {
        outline: 3px solid rgba(214,40,57,.35);
        outline-offset: 2px;
      }
      .transcript-download-button {
        width: max-content;
        max-width: 100%;
      }
      @media(max-width: 575px) {
        .listening-tools,
        .speed-group,
        .transcript-download-button {
          width: 100%;
        }
        .speed-group {
          justify-content: center;
          border-radius: 18px;
        }
        .speed-btn {
          flex: 1 1 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function setSpeed(audio, buttons, speed) {
    const normalized = Number(speed) || 1;
    audio.dataset.selectedSpeed = String(normalized);
    audio.playbackRate = normalized;
    if ("preservesPitch" in audio) audio.preservesPitch = true;
    buttons.forEach(function (button) {
      const active = Number(button.dataset.speed) === normalized;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  function applySelectedSpeed(audio) {
    audio.playbackRate = Number(audio.dataset.selectedSpeed || "1") || 1;
    if ("preservesPitch" in audio) audio.preservesPitch = true;
  }

  function enhanceAudio(audio, options) {
    if (!audio || audio.dataset.speedControlsReady === "true") return;
    audio.dataset.speedControlsReady = "true";
    options = options || {};

    const tools = document.createElement("div");
    tools.className = "listening-tools" + (options.compact ? " is-compact" : "");
    const group = document.createElement("div");
    group.className = "speed-group";
    group.setAttribute("role", "group");
    group.setAttribute("aria-label", options.label || "Contrôle de vitesse de l'audio");
    group.innerHTML = '<span>Vitesse :</span>' + SPEEDS.map(function (speed) {
      return '<button type="button" class="speed-btn' + (speed === 1 ? " active" : "") + '" data-speed="' + speed + '" aria-pressed="' + (speed === 1 ? "true" : "false") + '">' + speed + 'x</button>';
    }).join("");

    tools.appendChild(group);
    audio.insertAdjacentElement("afterend", tools);

    const buttons = Array.from(group.querySelectorAll(".speed-btn"));
    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        setSpeed(audio, buttons, Number(button.dataset.speed));
      });
    });
    ["loadstart", "loadedmetadata", "durationchange", "canplay"].forEach(function (eventName) {
      audio.addEventListener(eventName, function () {
        applySelectedSpeed(audio);
      });
    });
    if ("MutationObserver" in window) {
      const observer = new MutationObserver(function () {
        applySelectedSpeed(audio);
      });
      observer.observe(audio, { attributes: true, attributeFilter: ["src"] });
    }
    setSpeed(audio, buttons, Number(audio.dataset.selectedSpeed || "1") || 1);
  }

  function improveTranscriptButton() {
    const button = document.querySelector("[data-transcript-button]");
    if (!button) return;
    button.classList.add("transcript-download-button");
    button.innerHTML = '<i class="bi bi-file-earmark-pdf"></i> Télécharger la transcription PDF';
    button.setAttribute("title", "Télécharger la transcription réservée au professeur");
  }

  function enhanceAll(root) {
    injectStyles();
    Array.from((root || document).querySelectorAll("audio")).forEach(function (audio) {
      if (audio.id === "studentAudio" || audio.dataset.skipSpeedControls === "true") return;
      if (audio.hidden && audio.id !== "modelAudio") return;
      enhanceAudio(audio, { compact: audio.id === "modelAudio" });
    });
  }

  function init() {
    enhanceAll(document);
    improveTranscriptButton();
  }

  window.JaraLinguaFrench8AudioControls = {
    enhanceAudio: enhanceAudio,
    enhanceAll: enhanceAll
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
