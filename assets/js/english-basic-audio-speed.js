(function () {
  const SPEEDS = [0.75, 1, 1.25, 1.5];

  function formatSpeed(speed) {
    return speed === 1 ? "1x" : speed + "x";
  }

  function setActive(buttons, activeSpeed) {
    buttons.forEach(function (button) {
      const isActive = Number(button.dataset.audioSpeed) === activeSpeed;
      button.classList.toggle("play", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  }

  function createControls(audio, index) {
    if (!audio || audio.dataset.speedControlsReady === "true") return;
    const next = audio.nextElementSibling;
    if (next && next.classList && next.classList.contains("audio-speed-actions")) {
      next.remove();
    }

    const controls = document.createElement("div");
    controls.className = "audio-actions audio-speed-actions";
    controls.setAttribute("role", "group");
    controls.setAttribute("aria-label", "Audio speed controls");

    const label = document.createElement("span");
    label.className = "listening-label";
    label.textContent = "Speed";
    controls.appendChild(label);

    const buttons = SPEEDS.map(function (speed) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "audio-btn" + (speed === 1 ? " play" : "");
      button.dataset.audioSpeed = String(speed);
      button.setAttribute("aria-pressed", speed === 1 ? "true" : "false");
      button.textContent = formatSpeed(speed);
      button.addEventListener("click", function () {
        audio.playbackRate = speed;
        setActive(buttons, speed);
      });
      controls.appendChild(button);
      return button;
    });

    audio.addEventListener("loadedmetadata", function () {
      const current = Number(audio.playbackRate) || 1;
      setActive(buttons, SPEEDS.includes(current) ? current : 1);
    });

    audio.insertAdjacentElement("afterend", controls);
    audio.dataset.speedControlsReady = "true";
    audio.dataset.audioSpeedGroup = String(index + 1);
  }

  function initAudioSpeedControls() {
    document.querySelectorAll("audio.course-audio-player").forEach(createControls);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAudioSpeedControls);
  } else {
    initAudioSpeedControls();
  }
})();
