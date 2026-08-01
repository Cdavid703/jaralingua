(function () {
  "use strict";

  const audio = document.querySelector("[data-workshop-audio]");
  const dialogue = Array.from(document.querySelectorAll("[data-dialogue] [data-audio]"));
  const modelStatus = document.querySelector("[data-model-status]");
  const storageKey = "jaralingua:intermediate:unit5:colombian-food-showcase:v1";
  let speed = 1;
  let playlistIndex = -1;
  let playingSequence = false;

  function setStatus(text) {
    if (modelStatus) modelStatus.textContent = text;
  }

  function clearPlaying() {
    dialogue.forEach((line) => line.classList.remove("is-playing"));
  }

  function playSource(source, line) {
    if (!audio || !source) return;
    clearPlaying();
    if (line) line.classList.add("is-playing");
    audio.src = source;
    audio.playbackRate = speed;
    audio.play().catch(() => setStatus("Audio could not start. Tap the play button again."));
  }

  function playNextModelLine() {
    playlistIndex += 1;
    if (playlistIndex >= dialogue.length) {
      playingSequence = false;
      playlistIndex = -1;
      clearPlaying();
      setStatus("Complete model finished.");
      return;
    }
    const line = dialogue[playlistIndex];
    setStatus("Playing complete model: part " + (playlistIndex + 1) + " of " + dialogue.length + ".");
    playSource(line.dataset.audio, line);
  }

  dialogue.forEach((line) => {
    const button = line.querySelector("button");
    if (!button) return;
    button.addEventListener("click", () => {
      playingSequence = false;
      playlistIndex = -1;
      setStatus("Playing one model line.");
      playSource(line.dataset.audio, line);
    });
  });

  document.querySelector("[data-play-model]")?.addEventListener("click", () => {
    playingSequence = true;
    playlistIndex = -1;
    playNextModelLine();
  });

  document.querySelector("[data-stop-model]")?.addEventListener("click", () => {
    playingSequence = false;
    playlistIndex = -1;
    audio.pause();
    audio.currentTime = 0;
    clearPlaying();
    setStatus("Model stopped.");
  });

  audio?.addEventListener("ended", () => {
    clearPlaying();
    if (playingSequence) playNextModelLine();
  });

  document.querySelectorAll("[data-speed]").forEach((button) => {
    button.addEventListener("click", () => {
      speed = Number(button.dataset.speed) || 1;
      audio.playbackRate = speed;
      document.querySelectorAll("[data-speed]").forEach((item) => item.classList.toggle("active", item === button));
      setStatus("Audio speed set to " + speed + ".");
    });
  });

  document.querySelectorAll("[data-clip]").forEach((button) => {
    button.addEventListener("click", () => {
      playingSequence = false;
      playlistIndex = -1;
      setStatus("Playing stage model.");
      playSource(button.dataset.clip);
    });
  });

  const tabs = Array.from(document.querySelectorAll("[data-tab]"));
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((item) => item.setAttribute("aria-selected", String(item === tab)));
      document.querySelectorAll("[data-panel]").forEach((panel) => {
        panel.hidden = panel.dataset.panel !== tab.dataset.tab;
      });
    });
  });

  const organizer = document.querySelector("[data-organizer]");
  const saveStatus = document.querySelector("[data-save-status]");

  function readPlan() {
    try { return JSON.parse(localStorage.getItem(storageKey) || "{}"); } catch (_) { return {}; }
  }

  function savePlan() {
    if (!organizer) return;
    const plan = {};
    new FormData(organizer).forEach((value, key) => { plan[key] = value; });
    localStorage.setItem(storageKey, JSON.stringify(plan));
    if (saveStatus) saveStatus.textContent = "Pair notes saved on this device.";
  }

  if (organizer) {
    const plan = readPlan();
    Array.from(organizer.elements).forEach((field) => {
      if (field.name && Object.prototype.hasOwnProperty.call(plan, field.name)) field.value = plan[field.name];
      field.addEventListener("input", savePlan);
    });
  }

  document.querySelector("[data-clear-plan]")?.addEventListener("click", () => {
    if (!window.confirm("Clear all pair-planning notes on this device?")) return;
    organizer.reset();
    localStorage.removeItem(storageKey);
    if (saveStatus) saveStatus.textContent = "Pair notes cleared.";
  });

  document.querySelector("[data-print-plan]")?.addEventListener("click", () => window.print());

  const checks = Array.from(document.querySelectorAll(".cfs-checklist input[type=checkbox]"));
  const progress = document.querySelector("[data-check-progress]");
  function updateProgress() {
    const done = checks.filter((check) => check.checked).length;
    if (progress) progress.textContent = done + " / " + checks.length + " ready";
  }
  checks.forEach((check) => check.addEventListener("change", updateProgress));
  updateProgress();
})();

