(function () {
  "use strict";

  document.querySelectorAll(".alphabet-grid .letter-card").forEach((card) => {
    const letter = card.querySelector("strong")?.textContent?.trim().toLowerCase();
    if (!letter) return;
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    card.setAttribute("aria-label", `Écouter la lettre ${letter.toUpperCase()}`);
    card.setAttribute("aria-describedby", "audioAlphabet");
    card.setAttribute("data-audio-src", `../audio/theme-1/alphabet/lettre-${letter}.mp3`);
    if (!card.querySelector("i")) card.insertAdjacentHTML("beforeend", '<i class="bi bi-volume-up-fill" aria-hidden="true"></i>');
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        card.click();
      }
    });
  });

  document.querySelectorAll("[data-audio-src]").forEach((button) => {
    button.addEventListener("click", () => {
      const src = button.getAttribute("data-audio-src");
      if (!src) return;
      if (window.__niveau1Audio) window.__niveau1Audio.pause();
      const audio = new Audio(src);
      window.__niveau1Audio = audio;
      button.setAttribute("aria-pressed", "true");
      const target = document.getElementById(button.getAttribute("aria-describedby") || "");
      if (target && button.classList.contains("letter-card")) {
        target.textContent = `Lecture de la lettre ${button.querySelector("strong")?.textContent || ""}…`;
      }
      audio.addEventListener("ended", () => button.setAttribute("aria-pressed", "false"), { once: true });
      audio.addEventListener("error", () => {
        button.setAttribute("aria-pressed", "false");
        if (target) target.textContent = "L’audio n’a pas pu être chargé. Réessayez dans un instant.";
      }, { once: true });
      audio.play().catch(() => button.setAttribute("aria-pressed", "false"));
    });
  });

  document.querySelectorAll("[data-current-year]").forEach((node) => {
    node.textContent = new Date().getFullYear();
  });

  document.querySelectorAll("audio").forEach((audio) => {
    if (audio.dataset.speedReady === "true") return;
    audio.dataset.speedReady = "true";
    const controls = document.createElement("div");
    controls.className = "speed-controls mt-2";
    controls.setAttribute("aria-label", "Vitesse de lecture");
    [0.75, 1, 1.25].forEach((rate) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `speed-btn${rate === 1 ? " active" : ""}`;
      button.textContent = `${String(rate).replace(".", ",")}×`;
      button.addEventListener("click", () => {
        audio.playbackRate = rate;
        controls.querySelectorAll(".speed-btn").forEach((candidate) => candidate.classList.toggle("active", candidate === button));
      });
      controls.appendChild(button);
    });
    audio.insertAdjacentElement("afterend", controls);
  });
})();
