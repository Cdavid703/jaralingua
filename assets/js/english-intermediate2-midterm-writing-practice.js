(function () {
  "use strict";
  const fields = Array.from(document.querySelectorAll("[data-ie2-writing-field]"));
  const preview = document.getElementById("ie2WritingPreview");
  const wordCount = document.getElementById("ie2WritingWords");
  const report = document.getElementById("ie2WritingReport");
  const reportList = document.getElementById("ie2WritingReportList");
  const storageKey = "ie2_midterm_writing_catharsis_draft";
  const words = (value) => String(value || "").trim().match(/[A-Za-z]+(?:'[A-Za-z]+)?/g) || [];
  const value = (name) => String(document.querySelector(`[data-ie2-writing-field="${name}"]`)?.value || "").trim();
  function emailText() {
    return [`To: My best friend abroad`, `Subject: ${value("subject")}`, "", `Dear ${value("friend") || "friend"},`, "", value("situation"), "", value("regret"), "", value("future"), "", value("plan"), "", value("close"), "", `Best wishes,`, value("name") || "Your friend"].filter(Boolean).join("\n");
  }
  function state() {
    const text = emailText();
    return {
      subject: words(value("subject")).length >= 3,
      context: words(value("situation")).length >= 18,
      regret: /\b(wish(?:ed)?\s+i\s+had|should\s+have|would\s+have)\b/i.test(value("regret")),
      future: /\b(hope\s+to|would\s+like\s+to|dream\s+of|my\s+goal\s+is\s+to|plan\s+to)\b/i.test(value("future")),
      plan: words(value("plan")).length >= 18,
      optimistic: /\b(hope|optimistic|better|forward|believe|confident|positive|future)\b/i.test(value("close")),
      words: words(text).length >= 165
    };
  }
  function save() { try { localStorage.setItem(storageKey, JSON.stringify(Object.fromEntries(fields.map((field) => [field.dataset.ie2WritingField, field.value])))); } catch (_) {} }
  function update() {
    const text = emailText(); const count = words(text).length; const checks = state();
    preview.textContent = text || "Your email will appear here as you write.";
    document.getElementById("ie2SubjectPreview").textContent = value("subject") || "Your subject will appear here.";
    wordCount.textContent = count;
    document.querySelectorAll("[data-ie2-check]").forEach((item) => { const done = Boolean(checks[item.dataset.ie2Check]); item.classList.toggle("done", done); item.querySelector("i").className = done ? "bi bi-check-circle-fill" : "bi bi-circle"; });
    save();
  }
  function selfCheck() {
    const checks = state(); const advice = [];
    if (!checks.subject) advice.push("Add a clear subject with at least three words.");
    if (!checks.context) advice.push("Explain the difficult work or family situation with more concrete detail.");
    if (!checks.regret) advice.push("Use one clear regret pattern: I wish I had..., I should have..., or I would have....");
    if (!checks.future) advice.push("Add a future pattern: I hope to..., I would like to..., I dream of..., or My goal is to....");
    if (!checks.plan) advice.push("Explain one next step that can make the situation better.");
    if (!checks.optimistic) advice.push("End on an optimistic note about the future.");
    if (!checks.words) advice.push(`Your draft has ${words(emailText()).length} words. Aim for approximately 180; add meaningful detail, not repetition.`);
    if (!advice.length) advice.push("Your preparation includes every required element. Read it once for punctuation, capital letters, clear paragraph order and natural word choice.");
    reportList.innerHTML = advice.map((item) => `<li>${item}</li>`).join(""); report.hidden = false; report.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
  function reset() { fields.forEach((field) => { field.value = ""; }); try { localStorage.removeItem(storageKey); } catch (_) {} report.hidden = true; update(); }
  function download() { const blob = new Blob([emailText()], { type: "text/plain;charset=utf-8" }); const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = "intermediate-2-midterm-writing-practice.txt"; document.body.append(link); link.click(); URL.revokeObjectURL(link.href); link.remove(); }
  try { const draft = JSON.parse(localStorage.getItem(storageKey) || "{}"); fields.forEach((field) => { if (typeof draft[field.dataset.ie2WritingField] === "string") field.value = draft[field.dataset.ie2WritingField]; }); } catch (_) {}
  fields.forEach((field) => field.addEventListener("input", update));
  document.getElementById("ie2WritingSelfCheck").addEventListener("click", selfCheck); document.getElementById("ie2WritingReset").addEventListener("click", reset); document.getElementById("ie2WritingDownload").addEventListener("click", download); update();
})();
