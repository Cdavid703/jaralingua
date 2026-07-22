(function () {
  "use strict";

  const sections = Array.from(document.querySelectorAll(".unit6-section"));
  const topicButtons = Array.from(document.querySelectorAll("[data-open-topic]"));
  const openAllButton = document.getElementById("openAllTopics");
  const closeAllButton = document.getElementById("closeAllTopics");

  topicButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const section = document.getElementById(button.dataset.openTopic);
      if (!section) return;
      section.open = true;
      window.requestAnimationFrame(function () {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
        const summary = section.querySelector("summary");
        if (summary) summary.focus({ preventScroll: true });
      });
    });
  });

  if (openAllButton) {
    openAllButton.addEventListener("click", function () {
      sections.forEach(function (section) { section.open = true; });
      openAllButton.setAttribute("aria-pressed", "true");
      if (closeAllButton) closeAllButton.setAttribute("aria-pressed", "false");
    });
  }

  if (closeAllButton) {
    closeAllButton.addEventListener("click", function () {
      sections.forEach(function (section) { section.open = false; });
      closeAllButton.setAttribute("aria-pressed", "true");
      if (openAllButton) openAllButton.setAttribute("aria-pressed", "false");
      document.getElementById("unit6-start")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  document.querySelectorAll(".audio-model audio").forEach(function (audio, index) {
    audio.playbackRate = 1;
    const controls = document.createElement("div");
    controls.className = "audio-speed-controls";
    controls.setAttribute("aria-label", "Playback speed for audio model " + (index + 1));

    [0.75, 1, 1.25].forEach(function (rate) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "speed-button" + (rate === 1 ? " active" : "");
      button.textContent = rate + "x";
      button.setAttribute("aria-pressed", rate === 1 ? "true" : "false");
      button.addEventListener("click", function () {
        audio.playbackRate = rate;
        controls.querySelectorAll(".speed-button").forEach(function (item) {
          const active = item === button;
          item.classList.toggle("active", active);
          item.setAttribute("aria-pressed", active ? "true" : "false");
        });
      });
      controls.appendChild(button);
    });

    audio.insertAdjacentElement("afterend", controls);
  });
})();
