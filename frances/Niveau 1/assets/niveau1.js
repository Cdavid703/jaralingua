(function () {
  "use strict";

  function loadScript(src, attributes = {}) {
    const existing = [...document.scripts].find((script) => script.src && script.src.split("?")[0] === new URL(src, location.href).href.split("?")[0]);
    if (existing) return Promise.resolve(existing);
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      Object.entries(attributes).forEach(([name, value]) => script.setAttribute(name, value));
      script.onload = () => resolve(script);
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  loadScript("/assets/js/google-auth-config.js")
    .then(() => loadScript("https://accounts.google.com/gsi/client", { async: "", defer: "" }))
    .then(() => loadScript("/assets/js/google-auth.js?v=20260626"))
    .catch(() => {});

  function ensureCourseSwitcher() {
    if (document.querySelector(".global-course-switcher")) return;
    const switcher = document.createElement("div");
    switcher.className = "global-course-switcher";
    switcher.setAttribute("aria-label", "Navigation globale");
    switcher.innerHTML = `<details><summary><span>Navigation</span></summary><nav>
      <a href="/index.html">Accueil</a>
      <a href="/frances/index.html">Français</a>
      <a href="/frances/Niveau%201/index.html" aria-current="page">Français Niveau 1</a>
      <a href="/frances/Niveau%207/index.html">Français Niveau 7</a>
      <a href="/frances/Niveau%208/index.html">Français Niveau 8</a>
      <a href="/ingles/index.html">Anglais</a>
      <a href="/ingles/basico/index.html">Anglais débutant</a>
    </nav></details>`;
    document.body.insertBefore(switcher, document.body.firstElementChild);
  }

  ensureCourseSwitcher();

  document.querySelectorAll(".alphabet-grid .letter-card").forEach((card) => {
    const letter = card.querySelector("strong")?.textContent?.trim().toLowerCase();
    if (!letter) return;
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    card.setAttribute("aria-label", `Écouter la lettre ${letter.toUpperCase()}`);
    card.setAttribute("aria-describedby", "audioAlphabet");
    card.setAttribute("data-audio-src", `../audio/theme-1/alphabet/lettre-${letter}.mp3?v=20260624-alphabet-nz-fix`);
    if (!card.querySelector("i")) card.insertAdjacentHTML("beforeend", '<i class="bi bi-volume-up-fill" aria-hidden="true"></i>');
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        card.click();
      }
    });
  });

  function playAudioSequence(sources, button, target) {
    let index = 0;
    const playNext = () => {
      if (index >= sources.length) {
        button.setAttribute("aria-pressed", "false");
        if (target) target.textContent = "Groupe terminé. Répétez lentement avant de passer au groupe suivant.";
        return;
      }
      if (window.__niveau1Audio) window.__niveau1Audio.pause();
      const audio = new Audio(sources[index]);
      window.__niveau1Audio = audio;
      if (target) target.textContent = `Lecture du groupe : lettre ${index + 1} sur ${sources.length}.`;
      index += 1;
      audio.addEventListener("ended", playNext, { once: true });
      audio.addEventListener("error", () => {
        button.setAttribute("aria-pressed", "false");
        if (target) target.textContent = "Un audio du groupe n’a pas pu être chargé. Réessayez dans un instant.";
      }, { once: true });
      audio.play().catch(() => button.setAttribute("aria-pressed", "false"));
    };
    button.setAttribute("aria-pressed", "true");
    playNext();
  }

  document.querySelectorAll("[data-letter-group]").forEach((button) => {
    button.addEventListener("click", () => {
      const letters = (button.getAttribute("data-letter-group") || "").split(",").map((letter) => letter.trim()).filter(Boolean);
      const target = document.getElementById(button.getAttribute("aria-describedby") || "");
      const sources = letters.map((letter) => `../audio/theme-1/alphabet/lettre-${letter}.mp3?v=20260624-alphabet-nz-fix`);
      if (!sources.length) return;
      playAudioSequence(sources, button, target);
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
