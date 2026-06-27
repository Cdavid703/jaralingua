(function () {
  "use strict";

  const SPEEDS = [0.75, 1, 1.25];
  let selectedSpeed = 1;

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
      }
    `;
    document.head.appendChild(style);
  }

  function setSpeed(audio, buttons, speed) {
    selectedSpeed = speed;
    audio.playbackRate = speed;
    if ("preservesPitch" in audio) audio.preservesPitch = true;
    buttons.forEach(function (button) {
      const active = Number(button.dataset.speed) === speed;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  function createSpeedControls(audio) {
    if (!audio || document.querySelector(".speed-group")) return;
    const tools = document.createElement("div");
    tools.className = "listening-tools";
    const group = document.createElement("div");
    group.className = "speed-group";
    group.setAttribute("aria-label", "Contrôle de vitesse de l'audio");
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
    audio.addEventListener("loadedmetadata", function () {
      audio.playbackRate = selectedSpeed;
    });
  }

  function improveTranscriptButton() {
    const button = document.querySelector("[data-transcript-button]");
    if (!button) return;
    button.classList.add("transcript-download-button");
    button.innerHTML = '<i class="bi bi-file-earmark-pdf"></i> Télécharger la transcription PDF';
    button.setAttribute("title", "Télécharger la transcription réservée au professeur");
  }

  function init() {
    injectStyles();
    createSpeedControls(document.getElementById("activityAudio"));
    improveTranscriptButton();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
