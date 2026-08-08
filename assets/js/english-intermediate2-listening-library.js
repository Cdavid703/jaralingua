(function () {
  "use strict";
  const grid = document.getElementById("listeningLibraryGrid");
  const search = document.getElementById("listeningLibrarySearch");
  const clear = document.getElementById("listeningLibraryClear");
  const empty = document.getElementById("listeningLibraryEmpty");
  const result = document.getElementById("listeningResultCount");
  const total = document.getElementById("listeningTotal");
  const unitCount = document.getElementById("unit1ListeningCount");

  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[character]));
  const normalize = (value) => String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const searchable = (item) => normalize([item.title, item.subtitle, item.summary, item.product, ...(item.searchKeywords || [])].join(" "));

  function card(item, index) {
    const activityTime = item.activityDuration || item.duration || "Self-paced";
    return `<article class="ie2-lab-card" data-search="${escapeHtml(searchable(item))}"><figure class="ie2-lab-card-image"><img src="${escapeHtml(item.image)}" alt="" loading="lazy" /><span class="ie2-lab-card-number">${String(index + 1).padStart(2, "0")}</span></figure><div class="ie2-lab-card-tags"><span class="ie2-lab-tag">${escapeHtml(item.skillLabel || "Listening")}</span><span class="ie2-lab-tag private">ElevenLabs · 0%</span></div><div class="ie2-lab-card-body"><h3>${escapeHtml(item.title)}</h3><p class="ie2-lab-card-subtitle">${escapeHtml(item.subtitle)}</p><p class="ie2-lab-card-summary">${escapeHtml(item.summary)}</p><div class="ie2-lab-card-meta"><span><i class="bi bi-clock"></i>${escapeHtml(activityTime)}</span><span><i class="bi bi-headphones"></i>${escapeHtml(item.product || "Complete the listening")}</span></div><a class="intermediate2-card-action" href="${escapeHtml(item.workshopHref)}">Open listening</a></div></article>`;
  }

  function update() {
    const query = normalize(search.value.trim());
    const cards = [...grid.querySelectorAll(".ie2-lab-card")];
    let visible = 0;
    cards.forEach((item) => { item.hidden = Boolean(query && !item.dataset.search.includes(query)); if (!item.hidden) visible += 1; });
    result.textContent = `${visible} ${visible === 1 ? "listening" : "listenings"}`;
    empty.hidden = visible !== 0;
    clear.hidden = !search.value;
  }

  fetch("../../assets/data/english-intermediate-2-content.json", { cache: "no-store" }).then((response) => { if (!response.ok) throw new Error("Catalog unavailable"); return response.json(); }).then((payload) => {
    const items = (payload.items || []).filter((item) => item.status === "published" && Number(item.unit) === 1 && ["listening", "video-listening", "audiobook"].includes(item.type)).sort((a, b) => (a.order || 999) - (b.order || 999));
    grid.innerHTML = items.map(card).join("");
    total.textContent = String(items.length);
    unitCount.textContent = `${items.length} ${items.length === 1 ? "listening" : "listenings"}`;
    update();
  }).catch(() => { grid.innerHTML = '<p class="ie2-lab-empty">The listening catalog could not be loaded. Refresh the page to try again.</p>'; result.textContent = "Catalog unavailable"; });

  search.addEventListener("input", update);
  clear.addEventListener("click", () => { search.value = ""; search.focus(); update(); });
})();
