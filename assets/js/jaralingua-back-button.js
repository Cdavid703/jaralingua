(function () {
  function goBack(event) {
    event.preventDefault();
    if (window.history.length > 1) {
      window.history.back();
      return;
    }
    window.location.href = event.currentTarget.getAttribute("data-fallback") || "index.html";
  }

  function buildButton() {
    if (document.querySelector(".jara-back-button")) return;

    const isEnglish = String(document.documentElement.lang || "").toLowerCase().startsWith("en");
    const inferredFallback = /\/(ateliers|themes|grammaire)\//.test(window.location.pathname)
      ? "../index.html"
      : "index.html";
    const fallback = document.body.getAttribute("data-back-fallback") || inferredFallback;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "jara-back-button";
    button.setAttribute("aria-label", isEnglish ? "Back to the previous page" : "Retour a la page precedente");
    button.setAttribute("data-fallback", fallback);
    button.innerHTML = '<i class="bi bi-arrow-left"></i><span>' + (isEnglish ? "Back" : "Retour") + "</span>";
    button.addEventListener("click", goBack);
    document.body.appendChild(button);
  }

  function injectStyles() {
    if (document.getElementById("jara-back-button-style")) return;

    const style = document.createElement("style");
    style.id = "jara-back-button-style";
    style.textContent = [
      ".jara-back-button{position:fixed;left:1rem;bottom:1rem;z-index:1190;min-height:46px;display:inline-flex;align-items:center;gap:.5rem;border:0;border-radius:999px;background:#15345d;color:#fff;font-weight:900;padding:0 .95rem;box-shadow:0 14px 32px rgba(15,23,42,.2);font-family:Arial,Helvetica,sans-serif}",
      ".jara-back-button:hover{background:#d62839;color:#fff}",
      ".jara-back-button i{font-size:1.05rem}",
      "@media(max-width:575px){.jara-back-button{left:.75rem;bottom:.75rem;min-height:42px;padding:0 .8rem}.jara-back-button span{display:none}}"
    ].join("");
    document.head.appendChild(style);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      injectStyles();
      buildButton();
    });
  } else {
    injectStyles();
    buildButton();
  }
})();
