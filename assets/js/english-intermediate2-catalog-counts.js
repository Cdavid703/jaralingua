(function () {
  "use strict";
  const targets = [...document.querySelectorAll("[data-ie2-catalog-count]")];
  if (!targets.length) return;
  fetch("../../assets/data/english-intermediate-2-content.json", { cache: "no-store" })
    .then((response) => { if (!response.ok) throw new Error("Catalog unavailable"); return response.json(); })
    .then((payload) => {
      const published = (payload.items || []).filter((item) => item.status === "published");
      targets.forEach((target) => {
        const kind = target.dataset.ie2CatalogCount;
        const count = kind === "listening" ? published.filter((item) => ["listening", "video-listening", "audiobook"].includes(item.type)).length : published.length;
        target.textContent = `${count} ${kind === "listening" ? (count === 1 ? "listening live" : "listenings live") : (count === 1 ? "activity live" : "activities live")}`;
      });
    })
    .catch(() => {});
})();
