(function () {
  const allowedRates = [0.75, 1, 1.25];
  let currentRate = 1;

  const audios = Array.from(document.querySelectorAll("[data-audiobook-audio]"));
  const speedButtons = Array.from(document.querySelectorAll("[data-audiobook-speed]"));
  const jumpButtons = Array.from(document.querySelectorAll("[data-scene-jump]"));

  function setStatus(message) {
    const status = document.querySelector("[data-audiobook-status]");
    if (status) status.textContent = message;
  }

  function updateSpeedButtons() {
    speedButtons.forEach((button) => {
      const isActive = Number(button.dataset.audiobookSpeed) === currentRate;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  }

  function setRate(value) {
    const next = Number(value);
    if (!allowedRates.includes(next)) return;
    currentRate = next;
    audios.forEach((audio) => {
      audio.playbackRate = currentRate;
    });
    updateSpeedButtons();
    setStatus("Audio speed set to " + currentRate + "x.");
  }

  speedButtons.forEach((button) => {
    button.addEventListener("click", () => setRate(button.dataset.audiobookSpeed));
  });

  audios.forEach((audio) => {
    audio.playbackRate = currentRate;
    audio.addEventListener("play", () => {
      audios.forEach((otherAudio) => {
        if (otherAudio !== audio) otherAudio.pause();
      });
      const label = audio.dataset.audioLabel || "audiobook";
      setStatus("Playing " + label + " at " + currentRate + "x.");
    });
    audio.addEventListener("pause", () => {
      if (audios.every((item) => item.paused)) setStatus("Audio paused.");
    });
    audio.addEventListener("ratechange", () => {
      if (!allowedRates.includes(Number(audio.playbackRate))) {
        audio.playbackRate = currentRate;
      }
    });
  });

  jumpButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const target = document.getElementById(button.dataset.sceneJump || "");
      if (!target) return;
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      target.classList.add("is-highlighted");
      window.setTimeout(() => target.classList.remove("is-highlighted"), 1400);
      setStatus("Opened " + button.textContent.trim() + ".");
    });
  });

  updateSpeedButtons();
})();
