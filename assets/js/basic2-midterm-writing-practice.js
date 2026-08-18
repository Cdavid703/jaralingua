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
  const sendTeacherButton = document.getElementById("sendTeacherButton");
  const deliveryStatus = document.getElementById("deliveryStatus");
  const report = document.getElementById("selfCheckReport");
  const reportContent = document.getElementById("selfCheckContent");
  const form = document.getElementById("midtermWritingForm");

  const STORAGE_KEY = "basic2_midterm_writing_practice_draft";
  const SUBMIT_PATH = "/api/basic2/midterm-writing-practice/submit";
  const SUBMISSION_KEY = "basic2_midterm_writing_practice_submission";
  const GOOGLE_USER_KEY = "jaralingua_google_user";
  const MICROSOFT_USER_KEY = "jaralingua_microsoft_user";
  const LOCAL_USER_KEY = "jaralingua_local_user";
  const PLACEHOLDER_POST = "Complete the writing builder to generate your full post here.";
  let lastSelfCheck = null;
  let submitState = "idle";
  let submittedMessage = "";

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

  function currentPostText() {
    const text = finalPost ? cleanText(finalPost.textContent) : cleanText(buildPost());
    return text === PLACEHOLDER_POST ? "" : text;
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

  function readStoredUser(key, provider) {
    try {
      const sessionRaw = sessionStorage.getItem(key);
      const localRaw = localStorage.getItem(key);
      const raw = sessionRaw || localRaw;
      if (!raw) return null;
      const saved = JSON.parse(raw);
      if (!saved || typeof saved !== "object") return null;
      if (!sessionRaw && localRaw) sessionStorage.setItem(key, JSON.stringify(saved));
      return Object.assign({ provider: provider }, saved);
    } catch (_error) {
      sessionStorage.removeItem(key);
      localStorage.removeItem(key);
      return null;
    }
  }

  function readUser() {
    return readStoredUser(GOOGLE_USER_KEY, "google") || readStoredUser(MICROSOFT_USER_KEY, "microsoft") || readStoredUser(LOCAL_USER_KEY, "local");
  }

  function openLoginPanel() {
    const trigger = document.querySelector("[data-auth-toggle], [data-auth-nav-toggle]");
    if (trigger) trigger.click();
  }

  function setDeliveryStatus(message, type) {
    if (!deliveryStatus) return;
    deliveryStatus.textContent = message;
    deliveryStatus.classList.remove("success", "error", "pending");
    if (type) deliveryStatus.classList.add(type);
  }

  function readSubmission() {
    try {
      return JSON.parse(localStorage.getItem(SUBMISSION_KEY) || "null");
    } catch (_error) {
      localStorage.removeItem(SUBMISSION_KEY);
      return null;
    }
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

    if (finalPost && finalPost.textContent === PLACEHOLDER_POST) {
      finalPost.textContent = post || PLACEHOLDER_POST;
    } else if (finalPost && document.activeElement !== finalPost) {
      finalPost.textContent = post || PLACEHOLDER_POST;
    }
    if (wordCount) wordCount.textContent = String(count);
    if (wordRing) wordRing.style.setProperty("--progress", progress + "%");
    updateChecklist(state);
    if (selfCheckButton) selfCheckButton.disabled = !ready;
    if (sendTeacherButton) {
      sendTeacherButton.disabled = !ready || !lastSelfCheck || submitState === "submitting" || submitState === "submitted";
      if (submitState === "submitting") {
        sendTeacherButton.innerHTML = '<i class="bi bi-hourglass-split"></i> Sending to teacher...';
      } else if (submitState === "submitted") {
        sendTeacherButton.innerHTML = '<i class="bi bi-check-circle-fill"></i> Submitted to teacher';
      } else {
        sendTeacherButton.innerHTML = '<i class="bi bi-send-fill"></i> Send writing practice to teacher';
      }
    }
    if (writingStatus) {
      writingStatus.classList.toggle("ready", ready);
      writingStatus.textContent = ready
        ? "Ready. You can generate your self-check before the official task."
        : "Keep writing. Complete all sections, use present continuous, and reach 100 words.";
    }
    if (submitState === "idle") {
      if (lastSelfCheck && ready) {
        setDeliveryStatus("Self-check ready. Sign in and send this 0% writing practice to the teacher when you are ready.", "success");
      } else {
        setDeliveryStatus("Complete the writing builder and generate your self-check first.", "pending");
      }
    } else if (submitState === "submitted" && submittedMessage) {
      setDeliveryStatus(submittedMessage, "success");
    }
    saveDraft();
  }

  function selfCheckSummary(post) {
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
    return {
      wordCount: count,
      presentContinuousExamples: continuousMatches.slice(0, 8),
      weatherVocabulary: Array.from(new Set(weatherMatches.map(function (item) { return item.toLowerCase(); }))).slice(0, 10),
      advice: advice,
      generatedAt: new Date().toISOString()
    };
  }

  function generateSelfCheck(event) {
    event.preventDefault();
    const post = currentPostText() || cleanText(buildPost());
    const summary = selfCheckSummary(post);
    lastSelfCheck = summary;
    submitState = "idle";
    submittedMessage = "";

    if (reportContent) {
      reportContent.innerHTML = [
        '<p class="section-text"><strong>Words:</strong> ' + summary.wordCount + '</p>',
        '<p class="section-text"><strong>Present continuous examples detected:</strong> ' + (summary.presentContinuousExamples.length ? summary.presentContinuousExamples.slice(0, 6).join(", ") : "None") + '</p>',
        '<p class="section-text"><strong>Weather vocabulary detected:</strong> ' + (summary.weatherVocabulary.length ? summary.weatherVocabulary.slice(0, 8).join(", ") : "None") + '</p>',
        '<ul>' + summary.advice.map(function (item) { return '<li>' + item + '</li>'; }).join("") + '</ul>',
        '<p class="section-text"><strong>Important:</strong> this is practice. The official exam must be written independently when your teacher opens it.</p>'
      ].join("");
    }
    if (report) {
      report.hidden = false;
      report.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    update();
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
    try { localStorage.removeItem(SUBMISSION_KEY); } catch (_error) {}
    lastSelfCheck = null;
    submitState = "idle";
    submittedMessage = "";
    if (report) report.hidden = true;
    if (finalPost) finalPost.textContent = PLACEHOLDER_POST;
    update();
  }

  function submissionPayload() {
    const state = checks();
    const post = currentPostText() || cleanText(buildPost());
    return {
      clientSubmissionId: Date.now() + "-" + Math.random().toString(16).slice(2),
      activityTitle: "Basic 2 Midterm Writing Practice - City, Weather and Activities",
      title: fieldValue("title"),
      greeting: fieldValue("greeting"),
      cityWeather: fieldValue("cityWeather"),
      currentActivities: fieldValue("currentActivities"),
      responsibilities: fieldValue("responsibilities"),
      readerQuestion: fieldValue("readerQuestion"),
      closing: fieldValue("closing"),
      finalPost: post,
      wordCount: wordList(post).length,
      checklist: state,
      selfCheck: lastSelfCheck || selfCheckSummary(post),
      summary: {
        weight: 0,
        followUpOnly: true,
        noGrade: true,
        doesNotAffectAverage: true
      }
    };
  }

  async function submitToTeacher() {
    const state = checks();
    const ready = Object.keys(state).every(function (key) { return state[key]; });
    if (!ready || !lastSelfCheck) {
      setDeliveryStatus("Generate your self-check first. Then this 0% deliverable can be sent to the teacher.", "error");
      update();
      return;
    }
    const user = readUser();
    if (!user || !user.credential) {
      setDeliveryStatus("Sign in first with the account registered in Basic English Course 2.", "error");
      openLoginPanel();
      return;
    }
    submitState = "submitting";
    setDeliveryStatus("Sending your writing practice to the teacher...", "pending");
    update();
    try {
      const response = await fetch(SUBMIT_PATH, {
        method: "POST",
        headers: {
          Authorization: "Bearer " + user.credential,
          "X-Jaralingua-Auth-Provider": user.provider || "google",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(submissionPayload())
      });
      const payload = await response.json().catch(function () { return {}; });
      if (!response.ok) {
        if (payload.error === "student_not_authorized") throw new Error("This account is not linked to a Basic English Course 2 student record.");
        if (payload.error === "writing_too_short") throw new Error("Your post needs at least 100 words before it can be sent.");
        if (payload.error === "incomplete_writing_requirements") throw new Error("Complete all writing requirements and generate the self-check again.");
        throw new Error("The writing practice could not be submitted.");
      }
      submitState = "submitted";
      submittedMessage = "Submitted to teacher. This is a 0% deliverable, has no grade, and does not affect your course average.";
      localStorage.setItem(SUBMISSION_KEY, JSON.stringify({
        submittedAt: payload.submittedAt || new Date().toISOString(),
        wordCount: payload.wordCount,
        attemptCount: payload.attemptCount,
        noGrade: true,
        weight: 0
      }));
      setDeliveryStatus(submittedMessage, "success");
    } catch (error) {
      submitState = "error";
      setDeliveryStatus(error.message || "Network error. The writing practice was not submitted.", "error");
    } finally {
      update();
    }
  }

  fields.forEach(function (field) {
    field.addEventListener("input", function () {
      lastSelfCheck = null;
      submitState = "idle";
      submittedMessage = "";
      if (report) report.hidden = true;
      update();
    });
  });
  if (finalPost) {
    finalPost.addEventListener("input", function () {
      lastSelfCheck = null;
      submitState = "idle";
      submittedMessage = "";
      if (report) report.hidden = true;
      const count = wordList(currentPostText()).length;
      if (wordCount) wordCount.textContent = String(count);
      if (wordRing) wordRing.style.setProperty("--progress", Math.min(100, Math.round((count / 100) * 100)) + "%");
      setDeliveryStatus("Final post edited. Generate your self-check again before sending.", "pending");
    });
  }
  if (form) form.addEventListener("submit", generateSelfCheck);
  if (copyPostButton) copyPostButton.addEventListener("click", copyPost);
  if (resetWritingButton) resetWritingButton.addEventListener("click", resetWriting);
  if (sendTeacherButton) sendTeacherButton.addEventListener("click", submitToTeacher);

  loadDraft();
  const savedSubmission = readSubmission();
  if (savedSubmission && savedSubmission.noGrade) {
    submitState = "submitted";
    submittedMessage = "Already submitted to teacher. This is a 0% deliverable, has no grade, and does not affect your course average.";
  }
  update();
})();
