(function () {
  "use strict";
  const DATA_URL = "../../assets/data/english-intermediate-2-content.json";
  const units = [
    { number: 1, grid: document.getElementById("unit1ActivityGrid"), count: document.getElementById("unit1ActivityCount"), empty: document.getElementById("practiceLabEmpty") },
    { number: 2, grid: document.getElementById("unit2ActivityGrid"), count: document.getElementById("unit2ActivityCount"), empty: document.getElementById("practiceLabUnit2Empty") },
    { number: 3, grid: document.getElementById("unit3ActivityGrid"), count: document.getElementById("unit3ActivityCount"), empty: document.getElementById("practiceLabUnit3Empty") }
  ];
  const search = document.getElementById("practiceLabSearch");
  const clear = document.getElementById("practiceLabClear");
  const resultCount = document.getElementById("practiceLabResultCount");
  const total = document.getElementById("labActivityTotal");
  const activeUnitTotal = document.getElementById("labActiveUnitTotal");
  const filters = [...document.querySelectorAll("[data-lab-filter]")];
  let activeFilter = "all";

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[character]));
  }

  function normalize(value) {
    return String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }

  function searchText(item) {
    return normalize([`Unit ${item.unit}`, item.title, item.subtitle, item.summary, item.skillLabel, item.product, ...(item.searchKeywords || [])].join(" "));
  }

  function card(item) {
    return `<a class="ie2-lab-card" href="${escapeHtml(item.workshopHref)}" data-type="${escapeHtml(item.type)}" data-search="${escapeHtml(searchText(item))}" aria-label="Open ${escapeHtml(item.title)}">
      <figure class="ie2-lab-card-image"><img src="${escapeHtml(item.image)}" alt="" loading="lazy" /></figure>
      <div class="ie2-lab-card-body"><span class="ie2-lab-tag">${escapeHtml(item.skillLabel || item.type)}</span><h3>${escapeHtml(item.title)}</h3></div>
    </a>`;
  }

  function update() {
    const query = normalize(search.value.trim());
    let visible = 0;
    units.forEach((unit) => {
      const cards = [...unit.grid.querySelectorAll(".ie2-lab-card")];
      let unitVisible = 0;
      cards.forEach((element) => {
        const matchesFilter = activeFilter === "all" || element.dataset.type === activeFilter;
        const matchesQuery = !query || element.dataset.search.includes(query);
        element.hidden = !(matchesFilter && matchesQuery);
        if (!element.hidden) {
          unitVisible += 1;
          visible += 1;
        }
      });
      unit.empty.hidden = unitVisible !== 0;
      if ((query || activeFilter !== "all") && unitVisible > 0) unit.grid.closest("details").open = true;
    });
    resultCount.textContent = `${visible} ${visible === 1 ? "activity" : "activities"}`;
    clear.hidden = !search.value;
  }

  async function load() {
    try {
      const response = await fetch(DATA_URL, { cache: "no-store" });
      if (!response.ok) throw new Error("Catalog unavailable");
      const payload = await response.json();
      const published = (payload.items || []).filter((item) => item.status === "published");
      units.forEach((unit) => {
        const unitItems = published.filter((item) => Number(item.unit) === unit.number).sort((a, b) => (a.order || 999) - (b.order || 999) || a.title.localeCompare(b.title));
        unit.grid.innerHTML = unitItems.map(card).join("");
        unit.count.textContent = `${unitItems.length} ${unitItems.length === 1 ? "activity" : "activities"}`;
      });
      total.textContent = String(published.filter((item) => units.some((unit) => unit.number === Number(item.unit))).length);
      activeUnitTotal.textContent = String(new Set(published.map((item) => Number(item.unit)).filter((number) => units.some((unit) => unit.number === number))).size);
      update();
    } catch (_) {
      units.forEach((unit) => { unit.grid.innerHTML = '<p class="ie2-lab-empty">The activity catalog could not be loaded. Refresh the page to try again.</p>'; });
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
}());
