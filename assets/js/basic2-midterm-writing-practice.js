(function () {
  "use strict";

  const fields = Array.from(document.querySelectorAll("[data-writing-field]"));
  const finalPost = document.getElementById("finalPost");
  const wordCount = document.getElementById("wordCount");
  const wordRing = document.getElementById("wordRing");
  const writingStatus = document.getElementById("writingStatus");
  const selfCheckButton = document.getElementById("selfCheckButton");
  const copyPostButton = document.getElementById("copyPostButton");
  const resetWritingButton = document.getElementById("resetWritingButton");
  const report = document.getElementById("selfCheckReport");
  const reportContent = document.getElementById("selfCheckContent");
  const form = document.getElementById("midtermWritingForm");

  const STORAGE_KEY = "basic2_midterm_writing_practice_draft";

  function cleanText(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function wordList(text) {
    return cleanText(text).match(/[A-Za-z]+(?:'[A-Za-z]+)?|\d+/g) || [];
  }

  function fieldValue(name) {
    const node = document.querySelector('[data-writing-field="' + name + '"]');
    return node ? cleanText(node.value) : "";
  }

  function buildPost() {
    const title = fieldValue("title");
    const greeting = fieldValue("greeting");
    const cityWeather = fieldValue("cityWeather");
    const currentActivities = fieldValue("currentActivities");
    const responsibilities = fieldValue("responsibilities");
    const readerQuestion = fieldValue("readerQuestion");
    const closing = fieldValue("closing");
    return [title, "", greeting, "", cityWeather, "", currentActivities, "", responsibilities, "", readerQuestion, "", closing]
      .filter(function (line, index, list) {
        return line || (index > 0 && index < list.length - 1 && list[index - 1] && list[index + 1]);
      })
      .join("\n");
  }

  function hasPresentContinuous(text) {
    return /\b(am|is|are|'m|'s|'re)\s+[a-z]+ing\b/i.test(text);
  }

  function hasQuestionOrInvitation(text) {
    return /\?/.test(text) || /\b(share|tell|write|comment|what about you|how about you)\b/i.test(text);
  }

  function checks() {
    const post = buildPost();
    return {
      title: wordList(fieldValue("title")).length >= 3,
      greeting: wordList(fieldValue("greeting")).length >= 1,
      cityWeather: wordList(fieldValue("cityWeather")).length >= 14 && /\b(weather|sunny|cloudy|rainy|raining|windy|hot|cold|stormy|warm)\b/i.test(fieldValue("cityWeather")),
      currentActivities: wordList(fieldValue("currentActivities")).length >= 18,
      responsibilities: wordList(fieldValue("responsibilities")).length >= 18,
      readerQuestion: wordList(fieldValue("readerQuestion")).length >= 6 && hasQuestionOrInvitation(fieldValue("readerQuestion")),
      closing: wordList(fieldValue("closing")).length >= 2,
      words: wordList(post).length >= 100,
      continuous: hasPresentContinuous(post)
    };
  }

  function saveDraft() {
    try {
      const payload = {};
      fields.forEach(function (field) {
        payload[field.getAttribute("data-writing-field")] = field.value;
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (_error) {}
  }

  function loadDraft() {
    try {
      const payload = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      fields.forEach(function (field) {
        const key = field.getAttribute("data-writing-field");
        if (typeof payload[key] === "string") field.value = payload[key];
      });
    } catch (_error) {}
  }

  function updateChecklist(state) {
    Object.keys(state).forEach(function (key) {
      const item = document.querySelector('[data-check="' + key + '"]');
      if (!item) return;
      item.classList.toggle("done", Boolean(state[key]));
      const icon = item.querySelector("i");
      if (icon) icon.className = state[key] ? "bi bi-check-circle-fill" : "bi bi-circle";
    });
  }

  function update() {
    const post = buildPost();
    const count = wordList(post).length;
    const progress = Math.min(100, Math.round((count / 100) * 100));
    const state = checks();
    const ready = Object.keys(state).every(function (key) { return state[key]; });

    if (finalPost && finalPost.textContent === "Complete the writing builder to generate your full post here.") {
      finalPost.textContent = post || "Complete the writing builder to generate your full post here.";
    } else if (finalPost && document.activeElement !== finalPost) {
      finalPost.textContent = post || "Complete the writing builder to generate your full post here.";
    }
    if (wordCount) wordCount.textContent = String(count);
    if (wordRing) wordRing.style.setProperty("--progress", progress + "%");
    updateChecklist(state);
    if (selfCheckButton) selfCheckButton.disabled = !ready;
    if (writingStatus) {
      writingStatus.classList.toggle("ready", ready);
      writingStatus.textContent = ready
        ? "Ready. You can generate your self-check before the official task."
        : "Keep writing. Complete all sections, use present continuous, and reach 100 words.";
    }
    saveDraft();
  }

  function generateSelfCheck(event) {
    event.preventDefault();
    const post = finalPost ? cleanText(finalPost.textContent) : cleanText(buildPost());
    const count = wordList(post).length;
    const continuousMatches = post.match(/\b(am|is|are|'m|'s|'re)\s+[a-z]+ing\b/gi) || [];
    const weatherMatches = post.match(/\b(weather|sunny|cloudy|rainy|raining|windy|hot|cold|stormy|warm|pouring|freezing)\b/gi) || [];
    const questionReady = hasQuestionOrInvitation(fieldValue("readerQuestion"));

    const advice = [];
    if (continuousMatches.length < 3) advice.push("Add more present continuous examples: I am studying, I am working, people are going out.");
    if (weatherMatches.length < 3) advice.push("Add more weather vocabulary to describe your city clearly.");
    if (!questionReady) advice.push("End with a real question or invitation for readers.");
    if (count < 120) advice.push("Your post meets the minimum. Add one or two details if you want a stronger answer.");
    if (!advice.length) advice.push("Your draft is complete. Review spelling, commas, capital letters, and sentence clarity.");

    if (reportContent) {
      reportContent.innerHTML = [
        '<p class="section-text"><strong>Words:</strong> ' + count + '</p>',
        '<p class="section-text"><strong>Present continuous examples detected:</strong> ' + (continuousMatches.length ? continuousMatches.slice(0, 6).join(", ") : "None") + '</p>',
        '<p class="section-text"><strong>Weather vocabulary detected:</strong> ' + (weatherMatches.length ? Array.from(new Set(weatherMatches.map(function (item) { return item.toLowerCase(); }))).slice(0, 8).join(", ") : "None") + '</p>',
        '<ul>' + advice.map(function (item) { return '<li>' + item + '</li>'; }).join("") + '</ul>',
        '<p class="section-text"><strong>Important:</strong> this is practice. The official exam must be written independently when your teacher opens it.</p>'
      ].join("");
    }
    if (report) {
      report.hidden = false;
      report.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function copyPost() {
    const text = finalPost ? finalPost.textContent : buildPost();
    if (!navigator.clipboard || !cleanText(text)) return;
    navigator.clipboard.writeText(text).then(function () {
      if (writingStatus) {
        writingStatus.textContent = "Copied. Paste it into your notebook or teacher-approved practice space.";
        writingStatus.classList.add("ready");
      }
    });
  }

  function resetWriting() {
    fields.forEach(function (field) { field.value = ""; });
    try { localStorage.removeItem(STORAGE_KEY); } catch (_error) {}
    if (report) report.hidden = true;
    if (finalPost) finalPost.textContent = "Complete the writing builder to generate your full post here.";
    update();
  }

  fields.forEach(function (field) {
    field.addEventListener("input", update);
  });
  if (form) form.addEventListener("submit", generateSelfCheck);
  if (copyPostButton) copyPostButton.addEventListener("click", copyPost);
  if (resetWritingButton) resetWritingButton.addEventListener("click", resetWriting);

  loadDraft();
  update();
})();
