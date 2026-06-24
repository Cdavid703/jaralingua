(function () {
  "use strict";

  document.querySelectorAll("[data-audio-src]").forEach((button) => {
    button.addEventListener("click", () => {
      const src = button.getAttribute("data-audio-src");
      if (!src) return;
      if (window.__niveau1Audio) window.__niveau1Audio.pause();
      const audio = new Audio(src);
      window.__niveau1Audio = audio;
      button.setAttribute("aria-pressed", "true");
      audio.addEventListener("ended", () => button.setAttribute("aria-pressed", "false"), { once: true });
      audio.addEventListener("error", () => {
        button.setAttribute("aria-pressed", "false");
        const target = document.getElementById(button.getAttribute("aria-describedby") || "");
        if (target) target.textContent = "L’audio n’a pas pu être chargé. Réessayez dans un instant.";
      }, { once: true });
      audio.play().catch(() => button.setAttribute("aria-pressed", "false"));
    });
  });

  document.querySelectorAll("[data-current-year]").forEach((node) => {
    node.textContent = new Date().getFullYear();
  });
})();
