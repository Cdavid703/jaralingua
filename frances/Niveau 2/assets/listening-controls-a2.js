(function () {
  "use strict";

  const SPEEDS = [0.75, 1, 1.25];

  function formatTime(value) {
    if (!Number.isFinite(value) || value < 0) return "--:--";
    const total = Math.floor(value);
    const minutes = Math.floor(total / 60);
    const seconds = String(total % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
  }

  function injectStyles() {
    if (document.getElementById("n2-listening-controls-style")) return;
    const style = document.createElement("style");
    style.id = "n2-listening-controls-style";
    style.textContent = `
      .n2-listening-controls {
        display: grid;
        gap: .85rem;
        margin-top: .8rem;
        padding: .85rem;
        border: 1px solid rgba(31,78,140,.14);
        border-radius: 18px;
        background: #fff;
      }
      .n2-listening-timeline {
        display: grid;
        grid-template-columns: 52px minmax(150px,1fr) 52px;
        align-items: center;
        gap: .7rem;
      }
      .n2-time {
        color: #15345d;
        font-weight: 900;
        font-variant-numeric: tabular-nums;
        text-align: center;
      }
      .n2-progress {
        width: 100%;
        accent-color: #1f4e8c;
        cursor: pointer;
      }
      .n2-speed-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: .55rem;
        justify-content: space-between;
      }
      .n2-speed-row strong {
        color: #15345d;
        font-size: .92rem;
      }
      .n2-speed-buttons {
        display: inline-flex;
        flex-wrap: wrap;
        gap: .45rem;
      }
      .n2-speed-btn {
        border: 2px solid rgba(31,78,140,.18);
        border-radius: 999px;
        background: #fff;
        color: #15345d;
        font-weight: 900;
        padding: .42rem .72rem;
        min-width: 62px;
      }
      .n2-speed-btn:hover,
      .n2-speed-btn.is-active {
        background: #15345d;
        border-color: #15345d;
        color: #fff;
      }
      @media(max-width: 575px) {
        .n2-listening-timeline {
          grid-template-columns: 46px minmax(90px,1fr) 46px;
          gap: .45rem;
        }
        .n2-speed-row,
        .n2-speed-buttons {
          width: 100%;
        }
        .n2-speed-buttons {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
      }
    `;
    document.head.appendChild(style);
  }

  function enhanceAudio(audio) {
    if (!audio || audio.dataset.n2ListeningEnhanced === "true") return;
    audio.dataset.n2ListeningEnhanced = "true";
    audio.controls = true;
    audio.preload = audio.preload || "metadata";

    const controls = document.createElement("div");
    controls.className = "n2-listening-controls";
    controls.innerHTML = `
      <div class="n2-listening-timeline">
        <span class="n2-time" data-current>0:00</span>
        <input class="n2-progress" data-progress type="range" min="0" max="100" value="0" step="0.1" aria-label="Position de l'audio">
        <span class="n2-time" data-duration>--:--</span>
      </div>
      <div class="n2-speed-row">
        <strong>Vitesse d'écoute</strong>
        <div class="n2-speed-buttons" role="group" aria-label="Contrôle de vitesse de l'audio">
          ${SPEEDS.map((speed) => `<button type="button" class="n2-speed-btn${speed === 1 ? " is-active" : ""}" data-speed="${speed}" aria-pressed="${speed === 1 ? "true" : "false"}">${speed}x</button>`).join("")}
        </div>
      </div>
    `;
    audio.insertAdjacentElement("afterend", controls);

    const current = controls.querySelector("[data-current]");
    const duration = controls.querySelector("[data-duration]");
    const progress = controls.querySelector("[data-progress]");
    const speedButtons = Array.from(controls.querySelectorAll("[data-speed]"));

    function syncTime() {
      current.textContent = formatTime(audio.currentTime);
      duration.textContent = formatTime(audio.duration);
      const percent = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
      progress.value = String(percent || 0);
    }

    audio.addEventListener("loadedmetadata", syncTime);
    audio.addEventListener("durationchange", syncTime);
    audio.addEventListener("timeupdate", syncTime);
    audio.addEventListener("seeked", syncTime);

    progress.addEventListener("input", function () {
      if (!audio.duration) return;
      audio.currentTime = (Number(progress.value) / 100) * audio.duration;
      syncTime();
    });

    speedButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        const speed = Number(button.dataset.speed);
        audio.playbackRate = speed;
        if ("preservesPitch" in audio) audio.preservesPitch = true;
        speedButtons.forEach(function (item) {
          const active = item === button;
          item.classList.toggle("is-active", active);
          item.setAttribute("aria-pressed", active ? "true" : "false");
        });
      });
    });

    syncTime();
  }

  function init() {
    injectStyles();
    document.querySelectorAll("audio[data-listening-audio], .audio-card audio").forEach(enhanceAudio);
  }

  window.JaraLinguaN2ListeningControls = { init, enhanceAudio };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
