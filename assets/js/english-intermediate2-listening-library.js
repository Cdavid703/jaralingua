(function () {
  "use strict";
  const units = [
    { number: 1, grid: document.getElementById("unit1ListeningGrid"), count: document.getElementById("unit1ListeningCount"), empty: document.getElementById("unit1ListeningEmpty") },
    { number: 2, grid: document.getElementById("unit2ListeningGrid"), count: document.getElementById("unit2ListeningCount"), empty: document.getElementById("unit2ListeningEmpty") }
  ];
  const search = document.getElementById("listeningLibrarySearch");
  const clear = document.getElementById("listeningLibraryClear");
  const result = document.getElementById("listeningResultCount");
  const total = document.getElementById("listeningTotal");
  const listeningTypes = ["listening", "video-listening", "audiobook"];

  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[character]));
  const normalize = (value) => String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const searchable = (item) => normalize([`Unit ${item.unit}`, item.title, item.subtitle, item.summary, item.product, ...(item.searchKeywords || [])].join(" "));

  function card(item) {
    const activityTime = item.activityDuration || item.duration || "Self-paced";
    return `<article class="ie2-lab-card" data-search="${escapeHtml(searchable(item))}"><figure class="ie2-lab-card-image"><img src="${escapeHtml(item.image)}" alt="" loading="lazy" /><span class="ie2-lab-card-number">${String(item.order).padStart(2, "0")}</span></figure><div class="ie2-lab-card-tags"><span class="ie2-lab-tag">${escapeHtml(item.skillLabel || "Listening")}</span><span class="ie2-lab-tag private">ElevenLabs · 0%</span></div><div class="ie2-lab-card-body"><h3>${escapeHtml(item.title)}</h3><p class="ie2-lab-card-subtitle">${escapeHtml(item.subtitle)}</p><p class="ie2-lab-card-summary">${escapeHtml(item.summary)}</p><div class="ie2-lab-card-meta"><span><i class="bi bi-clock"></i>${escapeHtml(activityTime)}</span><span><i class="bi bi-headphones"></i>${escapeHtml(item.product || "Complete the listening")}</span></div><a class="intermediate2-card-action" href="${escapeHtml(item.workshopHref)}">Open listening</a></div></article>`;
  }

  function update() {
    const query = normalize(search.value.trim());
    let visible = 0;
    units.forEach((unit) => {
      const cards = [...unit.grid.querySelectorAll(".ie2-lab-card")];
      let unitVisible = 0;
      cards.forEach((item) => {
        item.hidden = Boolean(query && !item.dataset.search.includes(query));
        if (!item.hidden) {
          unitVisible += 1;
          visible += 1;
        }
      });
      unit.empty.hidden = unitVisible !== 0;
      if (query && unitVisible > 0) unit.grid.closest("details").open = true;
    });
    result.textContent = `${visible} ${visible === 1 ? "listening" : "listenings"}`;
    clear.hidden = !search.value;
  }

  fetch("../../assets/data/english-intermediate-2-content.json", { cache: "no-store" })
    .then((response) => { if (!response.ok) throw new Error("Catalog unavailable"); return response.json(); })
    .then((payload) => {
      const items = (payload.items || []).filter((item) => item.status === "published" && listeningTypes.includes(item.type));
      units.forEach((unit) => {
        const unitItems = items.filter((item) => Number(item.unit) === unit.number).sort((a, b) => (a.order || 999) - (b.order || 999));
        unit.grid.innerHTML = unitItems.map(card).join("");
        unit.count.textContent = `${unitItems.length} ${unitItems.length === 1 ? "listening" : "listenings"}`;
      });
      total.textContent = String(items.filter((item) => units.some((unit) => unit.number === Number(item.unit))).length);
      update();
    })
    .catch(() => {
      units.forEach((unit) => { unit.grid.innerHTML = '<p class="ie2-lab-empty">The listening catalog could not be loaded. Refresh the page to try again.</p>'; });
      result.textContent = "Catalog unavailable";
    });

  search.addEventListener("input", update);
  clear.addEventListener("click", () => { search.value = ""; search.focus(); update(); });
}());
