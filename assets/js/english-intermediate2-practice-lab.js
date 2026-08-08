(function () {
  "use strict";
  const DATA_URL = "../../assets/data/english-intermediate-2-content.json";
  const grid = document.getElementById("unit1ActivityGrid");
  const search = document.getElementById("practiceLabSearch");
  const clear = document.getElementById("practiceLabClear");
  const empty = document.getElementById("practiceLabEmpty");
  const resultCount = document.getElementById("practiceLabResultCount");
  const unitCount = document.getElementById("unit1ActivityCount");
  const total = document.getElementById("labActivityTotal");
  const filters = [...document.querySelectorAll("[data-lab-filter]")];
  let items = [];
  let activeFilter = "all";

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[character]));
  }

  function normalize(value) {
    return String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }

  function searchText(item) {
    return normalize([item.title, item.subtitle, item.summary, item.skillLabel, item.product, ...(item.searchKeywords || [])].join(" "));
  }

  function card(item) {
    const delivery = item.teacherSubmission
      ? '<span class="ie2-lab-tag delivery">Teacher delivery · 0%</span>'
      : '<span class="ie2-lab-tag private">Private practice · 0%</span>';
    const duration = item.activityDuration || item.duration || "Self-paced";
    return `<article class="ie2-lab-card" data-type="${escapeHtml(item.type)}" data-search="${escapeHtml(searchText(item))}">
      <figure class="ie2-lab-card-image"><img src="${escapeHtml(item.image)}" alt="" loading="lazy" /><span class="ie2-lab-card-number">${String(item.order).padStart(2, "0")}</span></figure>
      <div class="ie2-lab-card-tags"><span class="ie2-lab-tag">${escapeHtml(item.skillLabel || item.type)}</span>${delivery}</div>
      <div class="ie2-lab-card-body"><h3>${escapeHtml(item.title)}</h3><p class="ie2-lab-card-subtitle">${escapeHtml(item.subtitle)}</p><p class="ie2-lab-card-summary">${escapeHtml(item.summary)}</p><div class="ie2-lab-card-meta"><span><i class="bi bi-clock"></i>${escapeHtml(duration)}</span><span><i class="bi bi-check2-circle"></i>${escapeHtml(item.product || "Complete the activity")}</span></div><a class="intermediate2-card-action" href="${escapeHtml(item.workshopHref)}">Open activity</a></div>
    </article>`;
  }

  function update() {
    const query = normalize(search.value.trim());
    const cards = [...grid.querySelectorAll(".ie2-lab-card")];
    let visible = 0;
    cards.forEach((element) => {
      const matchesFilter = activeFilter === "all" || element.dataset.type === activeFilter;
      const matchesQuery = !query || element.dataset.search.includes(query);
      element.hidden = !(matchesFilter && matchesQuery);
      if (!element.hidden) visible += 1;
    });
    resultCount.textContent = `${visible} ${visible === 1 ? "activity" : "activities"}`;
    empty.hidden = visible !== 0;
    clear.hidden = !search.value;
  }

  async function load() {
    try {
      const response = await fetch(DATA_URL, { cache: "no-store" });
      if (!response.ok) throw new Error("Catalog unavailable");
      const payload = await response.json();
      items = (payload.items || []).filter((item) => item.status === "published" && Number(item.unit) === 1).sort((a, b) => (a.order || 999) - (b.order || 999) || a.title.localeCompare(b.title));
      grid.innerHTML = items.map(card).join("");
      total.textContent = String(items.length);
      unitCount.textContent = `${items.length} ${items.length === 1 ? "activity" : "activities"}`;
      update();
    } catch (_) {
      grid.innerHTML = '<p class="ie2-lab-empty">The activity catalog could not be loaded. Refresh the page to try again.</p>';
      resultCount.textContent = "Catalog unavailable";
    }
  }

  search.addEventListener("input", update);
  clear.addEventListener("click", () => { search.value = ""; search.focus(); update(); });
  filters.forEach((button) => button.addEventListener("click", () => {
    activeFilter = button.dataset.labFilter;
    filters.forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
    update();
  }));
  load();
})();
