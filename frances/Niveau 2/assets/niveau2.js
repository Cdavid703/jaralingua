(function () {
  "use strict";

  function loadScript(src, attributes = {}) {
    const absolute = new URL(src, location.href).href.split("?")[0];
    const existing = [...document.scripts].find((script) => script.src && script.src.split("?")[0] === absolute);
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
      <a href="/frances/Niveau%201/index.html">Français Niveau 1</a>
      <a href="/frances/Niveau%202/index.html" aria-current="page">Français Niveau 2</a>
      <a href="/frances/Niveau%207/index.html">Français Niveau 7</a>
      <a href="/frances/Niveau%208/index.html">Français Niveau 8</a>
      <a href="/ingles/index.html">Anglais</a>
      <a href="/ingles/basico/index.html">Anglais débutant</a>
    </nav></details>`;
    document.body.insertBefore(switcher, document.body.firstElementChild);
  }

  ensureCourseSwitcher();

  document.querySelectorAll("[data-audio-src]").forEach((button) => {
    button.addEventListener("click", () => {
      const src = button.getAttribute("data-audio-src");
      if (!src) return;
      if (window.__niveau2Audio) window.__niveau2Audio.pause();
      const audio = new Audio(src);
      window.__niveau2Audio = audio;
      button.setAttribute("aria-pressed", "true");
      audio.addEventListener("ended", () => button.setAttribute("aria-pressed", "false"), { once: true });
      audio.addEventListener("error", () => {
        button.setAttribute("aria-pressed", "false");
        button.innerHTML = '<i class="bi bi-exclamation-triangle"></i> Audio indisponible';
      }, { once: true });
      audio.play().catch(() => button.setAttribute("aria-pressed", "false"));
    });
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

  document.querySelectorAll("[data-current-year]").forEach((node) => {
    node.textContent = new Date().getFullYear();
  });
})();
