(function () {
  function cleanText(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function slugify(value) {
    return cleanText(value)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "worksheet";
  }

  function tableToText(table) {
    if (!table) return "";
    const headers = Array.from(table.querySelectorAll("thead th")).map(function (cell) {
      return cleanText(cell.textContent);
    });
    const rows = Array.from(table.querySelectorAll("tbody tr")).map(function (row) {
      return Array.from(row.children).map(function (cell, index) {
        const label = headers[index] || "Field";
        const value = cleanText(cell.textContent);
        return label + ": " + (value || "____________________________");
      }).join("\n");
    });
    return rows.join("\n\n");
  }

  function listToText(selector, prefix) {
    return Array.from(document.querySelectorAll(selector)).map(function (item, index) {
      return (prefix || "-") + " " + cleanText(item.textContent || ("Item " + (index + 1)));
    }).join("\n");
  }

  window.downloadWorksheetPdfFromPage = function () {
    if (typeof window.downloadTranscriptPdf !== "function") {
      return;
    }

    const pageTitle = cleanText((document.querySelector(".worksheet-board h3") || document.querySelector("h1") || {}).textContent);
    const brief = Array.from(document.querySelectorAll(".workshop-brief-card")).map(function (card) {
      const label = cleanText((card.querySelector("span") || {}).textContent);
      const value = cleanText((card.querySelector("p") || {}).textContent);
      return label + ": " + value;
    }).join("\n");
    const materials = listToText(".workshop-material-list li", "-");
    const rounds = Array.from(document.querySelectorAll(".task-flow li")).map(function (item, index) {
      const title = cleanText((item.querySelector("strong") || {}).textContent);
      const detail = cleanText((item.querySelector("span") || {}).textContent);
      return (index + 1) + ". " + title + "\n" + detail;
    }).join("\n\n");
    const worksheet = tableToText(document.querySelector(".worksheet-table"));
    const language = listToText(".language-bank-grid span", "-");
    const deliverable = cleanText((document.querySelector(".deliverable-card p") || {}).textContent);

    const text = [
      pageTitle,
      "",
      "Workshop Brief",
      brief,
      "",
      "Materials",
      materials,
      "",
      "Task Cycle",
      rounds,
      "",
      "Student Worksheet",
      worksheet,
      "",
      "Functional Language",
      language,
      "",
      "Final Product",
      deliverable
    ].join("\n");

    window.downloadTranscriptPdf(pageTitle, text, slugify(pageTitle) + ".pdf", { label: "Worksheet" });
  };
})();
