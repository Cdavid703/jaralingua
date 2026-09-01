/* JaraLingua page access QR: compact inside the page hero, expandable for classroom scanning. */
(() => {
  "use strict";

  const PATH_PATTERN = /^\/ingles\/(?:basico-2|intermediate-2)\/[^/]+\.html$/;

  function assetPath() {
    const slug = window.location.pathname
      .replace(/^\//, "")
      .replace(/\.html$/i, "")
      .replace(/\//g, "-");
    return `/assets/img/page-qr/${slug}.svg`;
  }

  function pageTitle() {
    return document.querySelector("h1")?.textContent?.trim() || document.title.replace(/\s*\|\s*JaraLingua.*$/i, "").trim() || "this page";
  }

  function findHeroCopy() {
    return document.querySelector([
      ".lesson-hero-content", ".overview-hero-content", ".basic-hero-content", ".writing-hero-copy", ".midterm-hero-copy",
      ".coach-hero-copy", ".games-hero-content", ".hero-text", ".intermediate2-hero-content", ".intermediate2-hero-overlay",
      ".ie2-coach-hero-copy", ".ie2-overview-hero-copy", ".ie2e-hero-copy", ".ie2-grammar-hero-copy", ".ie2-lab-hero-copy",
      ".ie2-listening-hero-content", ".ie2-reading-hero-content", ".ie2-speaking-hero-content", ".ie2-roundtable-hero-copy",
      ".rr-hero-copy", ".vd-hero-copy", ".ie2-unit1-hero-copy", ".ie2-unit2-hero-copy", ".ie2-unit3-hero-copy", ".ie2w-hero-copy",
      ".ie2m-hero-content"
    ].join(", ")) || document.querySelector("h1")?.parentElement;
  }

  function addQr() {
    if (!PATH_PATTERN.test(window.location.pathname) || document.querySelector(".page-qr-card, .jl-page-qr-card")) return;
    const host = findHeroCopy();
    if (!host) return;

    const title = pageTitle();
    const qrAsset = assetPath();
    const dialogId = "jlPageQrDialog";
    host.classList.add("jl-page-qr-host");

    const card = document.createElement("aside");
    card.className = "jl-page-qr-card";
    card.innerHTML = `<button type="button" class="jl-page-qr-open" aria-haspopup="dialog" aria-controls="${dialogId}" aria-label="Enlarge the QR code to open ${title} on a phone"><img src="${qrAsset}" alt="QR code to open ${title} on a phone" width="320" height="320" /></button><strong>Scan to open on your phone</strong>`;

    const dialog = document.createElement("dialog");
    dialog.id = dialogId;
    dialog.className = "jl-page-qr-dialog";
    dialog.innerHTML = `<button type="button" class="jl-page-qr-close" aria-label="Close enlarged QR code">×</button><h2>Scan to open this page</h2><p>${title}</p><img src="${qrAsset}" alt="Large QR code to open ${title} on a phone" width="320" height="320" />`;

    const qrImage = card.querySelector("img");
    qrImage.addEventListener("error", () => { card.remove(); dialog.remove(); host.classList.remove("jl-page-qr-host"); }, { once: true });
    card.querySelector("button").addEventListener("click", () => dialog.showModal());
    dialog.querySelector(".jl-page-qr-close").addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
    host.appendChild(card);
    document.body.appendChild(dialog);
  }

  function injectStyles() {
    const style = document.createElement("style");
    style.textContent = `.jl-page-qr-host{position:relative!important;box-sizing:border-box!important;padding-right:132px!important}.jl-page-qr-card{position:absolute;z-index:4;top:10px;right:10px;width:116px;box-sizing:border-box;padding:7px;border:1px solid rgba(14,83,125,.2);border-radius:14px;background:rgba(255,255,255,.96);box-shadow:0 8px 18px rgba(5,35,61,.12);text-align:center}.jl-page-qr-open{display:block;width:92px;height:92px;margin:0 auto;padding:0;border:0;background:transparent;cursor:zoom-in}.jl-page-qr-open img{display:block;width:100%;height:100%;image-rendering:auto}.jl-page-qr-open:focus-visible,.jl-page-qr-close:focus-visible{outline:3px solid #e91e53;outline-offset:3px}.jl-page-qr-card strong{display:block;margin-top:3px;color:#073561;font:800 .66rem/1.18 system-ui,sans-serif}.jl-page-qr-dialog{width:min(620px,calc(100vw - 32px));max-width:none;max-height:calc(100dvh - 32px);overflow:auto;padding:clamp(18px,3vw,30px);border:0;border-radius:24px;background:#fff;box-shadow:0 24px 70px rgba(0,0,0,.38);text-align:center}.jl-page-qr-dialog[open]{position:fixed;inset:50% auto auto 50%;margin:0;transform:translate(-50%,-50%)}.jl-page-qr-dialog::backdrop{background:rgba(3,30,57,.72)}.jl-page-qr-dialog h2{margin:0 38px 7px;color:#073561;font:800 clamp(1.2rem,3vw,1.6rem)/1.2 system-ui,sans-serif}.jl-page-qr-dialog p{margin:0 0 14px;color:#496477;font:600 .95rem/1.45 system-ui,sans-serif}.jl-page-qr-dialog img{display:block;width:min(520px,100%);height:auto;margin:0 auto}.jl-page-qr-close{position:absolute;top:12px;right:12px;width:34px;height:34px;border:0;border-radius:50%;background:#eaf4f8;color:#073561;cursor:pointer;font:900 1.35rem/1 system-ui,sans-serif}@media(max-width:620px){.jl-page-qr-host{padding-right:100px!important}.jl-page-qr-card{top:8px;right:8px;width:84px;padding:5px}.jl-page-qr-open{width:66px;height:66px}.jl-page-qr-card strong{font-size:.56rem}}`;
    document.head.appendChild(style);
  }

  injectStyles();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", addQr, { once: true });
  else addQr();
})();
