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
      .replace(/^-+|-+$/g, "") || "resume";
  }

  function collectSummaryText() {
    const title = cleanText((document.querySelector("h1") || document.querySelector("title") || {}).textContent);
    const blocks = [];
    const scope = document.querySelector("main") || document.body;
    const selectors = "h1, h2, h3, h4, p, li, th, td";

    blocks.push(title);
    blocks.push("");
    Array.from(scope.querySelectorAll(selectors)).forEach(function (node) {
      if (node.closest("nav, footer, script, style")) return;
      const text = cleanText(node.textContent);
      if (!text) return;
      if (["H2", "H3", "H4"].includes(node.tagName)) {
        blocks.push("");
        blocks.push(text.toUpperCase());
      } else if (node.tagName === "LI") {
        blocks.push("- " + text);
      } else if (node.tagName === "TH") {
        blocks.push(text + ":");
      } else {
        blocks.push(text);
      }
    });

    return {
      title: title,
      text: blocks.join("\n")
    };
  }

  window.downloadPageSummaryPdf = function () {
    if (typeof window.downloadTranscriptPdf !== "function") return;
    const summary = collectSummaryText();
    window.downloadTranscriptPdf(summary.title, summary.text, slugify(summary.title) + "-resume.pdf", { label: "Resume du cours" });
  };
})();
