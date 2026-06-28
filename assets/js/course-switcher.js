(function () {
  "use strict";

  const VERSION = "20260628";
  const COURSES = [
    { group: "JaraLingua", label: "Accueil général", href: "/index.html", match: /^\/(?:index\.html)?$/i },
    { group: "Français", label: "Portail français", href: "/frances/index.html", match: /^\/frances\/(?:index\.html)?$/i },
    { group: "Français", label: "Français · Niveau 1", href: "/frances/Niveau%201/index.html", match: /\/frances\/Niveau%201\//i },
    { group: "Français", label: "Français · Niveau 2", href: "/frances/Niveau%202/index.html", match: /\/frances\/Niveau%202\//i },
    { group: "Français", label: "Français · Niveau 7", href: "/frances/Niveau%207/index.html", match: /\/frances\/Niveau%207\//i },
    { group: "Français", label: "Français · Niveau 8", href: "/frances/Niveau%208/index.html", match: /\/frances\/Niveau%208\//i },
    { group: "English", label: "English portal", href: "/ingles/index.html", match: /^\/ingles\/(?:index\.html)?$/i },
    { group: "English", label: "Basic English", href: "/ingles/basico/index.html", match: /\/ingles\/basico\//i },
    { group: "English", label: "Intermediate English", href: "/ingles/intermediate/index.html", match: /\/ingles\/intermediate\//i }
  ];

  function normalizedPath() {
    try {
      return decodeURI(location.pathname).replace(/\\/g, "/");
    } catch (_error) {
      return location.pathname.replace(/\\/g, "/");
    }
  }

  function isCurrent(course) {
    const path = normalizedPath();
    const encoded = location.pathname.replace(/\\/g, "/");
    return course.match.test(path) || course.match.test(encoded);
  }

  function ensureStyles() {
    if (document.getElementById("jaralingua-course-switcher-style")) return;
    const style = document.createElement("style");
    style.id = "jaralingua-course-switcher-style";
    style.textContent = `
      .global-course-switcher{display:none!important}
      .jl-course-switcher-item{position:relative}
      .navbar>.container>.jl-course-switcher-top,
      .navbar>.container-fluid>.jl-course-switcher-top{margin-left:.6rem;order:99;display:inline-flex;align-items:center}
      .jl-course-switcher-button{
        border:0;
        border-radius:999px;
        background:rgba(31,78,140,.08);
        color:#15345d;
        font:inherit;
        font-weight:900;
        padding:.55rem .9rem;
        display:inline-flex;
        align-items:center;
        gap:.35rem;
        line-height:1.2;
        cursor:pointer;
        text-decoration:none;
      }
      .jl-course-switcher-button:hover,
      .jl-course-switcher-button[aria-expanded="true"]{background:#15345d;color:#fff}
      .jl-course-switcher-button::after{content:"▾";font-size:.72em;line-height:1;transition:transform .18s ease}
      .jl-course-switcher-button[aria-expanded="true"]::after{transform:rotate(180deg)}
      .jl-course-panel{
        position:fixed;
        top:calc(var(--jl-navbar-bottom, 72px) + .45rem);
        right:max(1rem, env(safe-area-inset-right));
        z-index:5000;
        width:min(430px, calc(100vw - 2rem));
        max-height:min(76vh, 680px);
        overflow:auto;
        overscroll-behavior:contain;
        border:1px solid rgba(21,52,93,.14);
        border-radius:24px;
        background:#fff;
        box-shadow:0 28px 75px rgba(15,23,42,.28);
        padding:1rem;
        display:none;
      }
      .jl-course-panel.is-open{display:block}
      .jl-course-panel-header{display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;margin-bottom:.9rem}
      .jl-course-panel-title{margin:0;color:#15345d;font-weight:950;font-size:1.05rem;line-height:1.2}
      .jl-course-panel-subtitle{margin:.2rem 0 0;color:#718096;font-weight:800;font-size:.86rem;line-height:1.35}
      .jl-course-close{width:38px;height:38px;border:0;border-radius:999px;background:#eef5ff;color:#15345d;font-weight:950;cursor:pointer}
      .jl-course-group{display:grid;gap:.45rem;margin-top:.85rem}
      .jl-course-group-title{margin:.3rem 0 .1rem;color:#d62839;text-transform:uppercase;letter-spacing:.11em;font-size:.72rem;font-weight:950}
      .jl-course-link{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:.75rem;
        min-height:48px;
        padding:.72rem .85rem;
        border:1px solid rgba(31,78,140,.1);
        border-radius:16px;
        background:#f8fbff;
        color:#15345d;
        text-decoration:none;
        font-weight:900;
        line-height:1.2;
      }
      .jl-course-link:hover{background:#15345d;color:#fff;text-decoration:none}
      .jl-course-link.is-current{background:linear-gradient(135deg,#15345d,#1f4e8c);color:#fff;border-color:transparent}
      .jl-course-link small{font-weight:950;opacity:.9}
      .jl-course-backdrop{
        position:fixed;
        inset:0;
        z-index:4999;
        background:rgba(3,12,32,.2);
        backdrop-filter:blur(2px);
        display:none;
      }
      .jl-course-backdrop.is-open{display:block}
      @media(max-width:720px){
        .jl-course-panel{
          left:max(.75rem, env(safe-area-inset-left));
          right:max(.75rem, env(safe-area-inset-right));
          top:calc(var(--jl-navbar-bottom, 64px) + .35rem);
          width:auto;
          max-height:calc(100vh - var(--jl-navbar-bottom, 64px) - 1.25rem);
          border-radius:22px;
        }
        .jl-course-switcher-button{padding:.5rem .72rem}
      }
    `;
    document.head.appendChild(style);
  }

  function removeOldSwitcher() {
    document.querySelectorAll(".global-course-switcher").forEach((node) => node.remove());
  }

  function groupedCourses() {
    const groups = [];
    COURSES.forEach((course) => {
      let group = groups.find((item) => item.name === course.group);
      if (!group) {
        group = { name: course.group, courses: [] };
        groups.push(group);
      }
      group.courses.push(course);
    });
    return groups;
  }

  function createPanel(button) {
    const backdrop = document.createElement("div");
    backdrop.className = "jl-course-backdrop";
    backdrop.hidden = true;

    const panel = document.createElement("section");
    panel.className = "jl-course-panel";
    panel.id = "jlCoursePanel";
    panel.setAttribute("aria-label", "Changer de cours");
    panel.innerHTML = `
      <div class="jl-course-panel-header">
        <div>
          <h2 class="jl-course-panel-title">Changer de cours</h2>
          <p class="jl-course-panel-subtitle">Accès direct aux niveaux de français et d’anglais.</p>
        </div>
        <button type="button" class="jl-course-close" aria-label="Fermer le menu des cours">×</button>
      </div>
      ${groupedCourses().map((group) => `
        <div class="jl-course-group">
          <p class="jl-course-group-title">${group.name}</p>
          ${group.courses.map((course) => {
            const current = isCurrent(course);
            return `<a class="jl-course-link${current ? " is-current" : ""}" href="${course.href}"><span>${course.label}</span>${current ? "<small>Actuel</small>" : "<small>Ouvrir</small>"}</a>`;
          }).join("")}
        </div>
      `).join("")}
    `;

    function setNavbarBottom() {
      const navbar = button.closest(".navbar, .site-header, header") || document.querySelector(".navbar, .site-header");
      const rect = navbar ? navbar.getBoundingClientRect() : { bottom: 72 };
      const bottom = Math.max(56, Math.round(rect.bottom || 72));
      document.documentElement.style.setProperty("--jl-navbar-bottom", `${bottom}px`);
    }

    function close() {
      button.setAttribute("aria-expanded", "false");
      panel.classList.remove("is-open");
      backdrop.classList.remove("is-open");
      backdrop.hidden = true;
    }

    function open() {
      setNavbarBottom();
      button.setAttribute("aria-expanded", "true");
      backdrop.hidden = false;
      panel.classList.add("is-open");
      backdrop.classList.add("is-open");
      panel.querySelector(".jl-course-close")?.focus({ preventScroll: true });
    }

    function toggle() {
      button.getAttribute("aria-expanded") === "true" ? close() : open();
    }

    button.addEventListener("click", toggle);
    backdrop.addEventListener("click", close);
    panel.querySelector(".jl-course-close").addEventListener("click", close);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") close();
    });
    window.addEventListener("resize", () => {
      if (button.getAttribute("aria-expanded") === "true") setNavbarBottom();
    });
    window.addEventListener("scroll", () => {
      if (button.getAttribute("aria-expanded") === "true") setNavbarBottom();
    }, { passive: true });

    document.body.append(backdrop, panel);
  }

  function makeButton() {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "jl-course-switcher-button";
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-controls", "jlCoursePanel");
    button.textContent = "Cours";
    return button;
  }

  function injectIntoBootstrapNav(navbar) {
    const container = navbar.querySelector(":scope > .container, :scope > .container-fluid") || navbar.querySelector(".container, .container-fluid") || navbar;
    if (container.querySelector(".jl-course-switcher-item")) return false;
    const wrapper = document.createElement("span");
    wrapper.className = "jl-course-switcher-item jl-course-switcher-top";
    const button = makeButton();
    button.classList.add("nav-link");
    wrapper.appendChild(button);
    container.appendChild(wrapper);
    createPanel(button);
    return true;
  }

  function injectIntoSimpleLinks(navbar) {
    const list = navbar.querySelector(".nav-links");
    if (list && !list.querySelector(".jl-course-switcher-item")) {
      const li = document.createElement("li");
      li.className = "jl-course-switcher-item";
      const button = makeButton();
      li.appendChild(button);
      list.appendChild(li);
      createPanel(button);
      return true;
    }

    const flex = navbar.querySelector(".d-flex, .nav-actions, .menu, .navbar-menu");
    if (flex && !flex.querySelector(".jl-course-switcher-item")) {
      const wrapper = document.createElement("span");
      wrapper.className = "jl-course-switcher-item";
      const button = makeButton();
      button.classList.add("nav-link");
      wrapper.appendChild(button);
      flex.appendChild(wrapper);
      createPanel(button);
      return true;
    }
    return false;
  }

  function injectCourseButton() {
    if (document.querySelector(".jl-course-switcher-button")) return;
    const navbars = Array.from(document.querySelectorAll(".navbar, .site-header nav, nav"));
    for (const navbar of navbars) {
      if (injectIntoBootstrapNav(navbar) || injectIntoSimpleLinks(navbar)) return;
    }

    const fallback = document.createElement("div");
    fallback.className = "jl-course-switcher-item";
    fallback.style.cssText = "position:fixed;right:1rem;top:1rem;z-index:5001";
    const button = makeButton();
    fallback.appendChild(button);
    document.body.appendChild(fallback);
    createPanel(button);
  }

  function init() {
    ensureStyles();
    removeOldSwitcher();
    injectCourseButton();
    document.documentElement.dataset.courseSwitcher = VERSION;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
