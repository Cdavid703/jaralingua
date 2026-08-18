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
  const downloadBackupButton = document.getElementById("downloadBackupButton");
  const deliveryStatus = document.getElementById("deliveryStatus");
  const report = document.getElementById("selfCheckReport");
  const reportContent = document.getElementById("selfCheckContent");
  const form = document.getElementById("midtermWritingForm");

  const STORAGE_KEY = "basic2_midterm_writing_practice_draft";
  const SUBMIT_PATH = "/api/basic2/midterm-writing-practice/submit";
  const SUBMISSION_KEY = "basic2_midterm_writing_practice_submission";
  const PENDING_SUBMISSION_KEY = "basic2_midterm_writing_practice_pending_submission";
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
      if (saved.exp && Date.now() / 1000 > Number(saved.exp)) {
        sessionStorage.removeItem(key);
        localStorage.removeItem(key);
        return null;
      }
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

  function readPendingSubmission() {
    try {
      return JSON.parse(localStorage.getItem(PENDING_SUBMISSION_KEY) || "null");
    } catch (_error) {
      localStorage.removeItem(PENDING_SUBMISSION_KEY);
      return null;
    }
  }

  function writePendingSubmission(payload) {
    try {
      localStorage.setItem(PENDING_SUBMISSION_KEY, JSON.stringify(payload));
    } catch (_error) {}
  }

  function clearPendingSubmission() {
    try {
      localStorage.removeItem(PENDING_SUBMISSION_KEY);
    } catch (_error) {}
  }

  function authHeaders(user, extra) {
    return Object.assign({}, extra || {}, {
      Authorization: "Bearer " + user.credential,
      "X-Jaralingua-Auth-Provider": user.provider || "google",
      "Content-Type": "application/json"
    });
  }

  function wait(ms) {
    return new Promise(function (resolve) { window.setTimeout(resolve, ms); });
  }

  async function requestJson(url, options, retries) {
    options = options || {};
    retries = Number.isInteger(retries) ? retries : 0;
    let lastError = null;
    for (let attempt = 0; attempt <= retries; attempt += 1) {
      const controller = new AbortController();
      const timer = window.setTimeout(function () { controller.abort(); }, options.timeout || 18000);
      try {
        const response = await fetch(url, Object.assign({}, options, { signal: controller.signal }));
        const data = await response.json().catch(function () { return {}; });
        if (!response.ok && response.status >= 500 && attempt < retries) {
          lastError = Object.assign(new Error("server_retryable"), { status: response.status, data: data });
          await wait(750 * (attempt + 1));
          continue;
        }
        return { ok: response.ok, status: response.status, data: data };
      } catch (error) {
        lastError = error;
        if (attempt < retries) await wait(750 * (attempt + 1));
      } finally {
        window.clearTimeout(timer);
      }
    }
    throw lastError || new Error("request_failed");
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

  function backupText() {
    const post = currentPostText() || cleanText(buildPost());
    const summary = lastSelfCheck || selfCheckSummary(post);
    return [
      "Basic English Course 2 - Midterm Writing Practice",
      "Emergency local copy",
      "Generated: " + new Date().toISOString(),
      "Weight: 0%",
      "No grade: yes",
      "",
      "Words: " + wordList(post).length,
      "Present continuous detected: " + (hasPresentContinuous(post) ? "yes" : "no"),
      "Weather vocabulary: " + (summary.weatherVocabulary || []).join(", "),
      "",
      "Final post:",
      post || "(empty)",
      "",
      "Self-check advice:",
      (summary.advice || []).map(function (item) { return "- " + item; }).join("\n")
    ].join("\n");
  }

  function downloadBackup() {
    const text = backupText();
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "basic-2-midterm-writing-practice-backup.txt";
    document.body.appendChild(link);
    link.click();
    window.setTimeout(function () {
      URL.revokeObjectURL(link.href);
      link.remove();
    }, 0);
    setDeliveryStatus("Emergency copy downloaded. This does not submit the activity; press Send to teacher when the connection is ready.", "pending");
  }

  function resetWriting() {
    fields.forEach(function (field) { field.value = ""; });
    try { localStorage.removeItem(STORAGE_KEY); } catch (_error) {}
    try { localStorage.removeItem(SUBMISSION_KEY); } catch (_error) {}
    clearPendingSubmission();
    lastSelfCheck = null;
    submitState = "idle";
    submittedMessage = "";
    if (report) report.hidden = true;
    if (finalPost) finalPost.textContent = PLACEHOLDER_POST;
    update();
  }

  function createSubmissionPayload() {
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

  function submissionPayload() {
    const post = currentPostText() || cleanText(buildPost());
    const state = checks();
    const pending = readPendingSubmission();
    if (
      pending &&
      pending.finalPost === post &&
      pending.checklist &&
      Object.keys(state).every(function (key) { return Boolean(pending.checklist[key]) === Boolean(state[key]); })
    ) {
      pending.selfCheck = lastSelfCheck || pending.selfCheck || selfCheckSummary(post);
      pending.updatedAt = new Date().toISOString();
      writePendingSubmission(pending);
      return pending;
    }
    const payload = createSubmissionPayload();
    payload.createdAt = new Date().toISOString();
    payload.updatedAt = payload.createdAt;
    writePendingSubmission(payload);
    return payload;
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
      const payload = submissionPayload();
      const result = await requestJson(SUBMIT_PATH, {
        method: "POST",
        headers: authHeaders(user),
        body: JSON.stringify(payload),
        timeout: 22000
      }, 1);
      if (!result.ok) {
        if (result.data.error === "student_not_authorized") throw new Error("This account is not linked to a Basic English Course 2 student record.");
        if (result.data.error === "missing_client_submission_id") throw new Error("The delivery code was missing. Refresh the page and try again; your text is still saved.");
        if (result.data.error === "writing_too_short") throw new Error("Your post needs at least 100 words before it can be sent.");
        if (result.data.error === "incomplete_writing_requirements") throw new Error("Complete all writing requirements and generate the self-check again.");
        if (result.data.error === "missing_present_continuous") throw new Error("Add at least one clear present continuous sentence, then generate the self-check again.");
        if (/^missing_/.test(result.data.error || "")) throw new Error("One required writing section is incomplete. Review the checklist and generate the self-check again.");
        throw new Error("The writing practice could not be submitted.");
      }
      submitState = "submitted";
      submittedMessage = "Submitted to teacher. This is a 0% deliverable, has no grade, and does not affect your course average.";
      localStorage.setItem(SUBMISSION_KEY, JSON.stringify({
        submittedAt: result.data.submittedAt || new Date().toISOString(),
        wordCount: result.data.wordCount,
        attemptCount: result.data.attemptCount,
        clientSubmissionId: result.data.clientSubmissionId || payload.clientSubmissionId,
        idempotent: Boolean(result.data.idempotent),
        noGrade: true,
        weight: 0
      }));
      clearPendingSubmission();
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
      clearPendingSubmission();
      if (report) report.hidden = true;
      update();
    });
  });
  if (finalPost) {
    finalPost.addEventListener("input", function () {
      lastSelfCheck = null;
      submitState = "idle";
      submittedMessage = "";
      clearPendingSubmission();
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
  if (downloadBackupButton) downloadBackupButton.addEventListener("click", downloadBackup);

  loadDraft();
  const savedSubmission = readSubmission();
  if (savedSubmission && savedSubmission.noGrade) {
    submitState = "submitted";
    submittedMessage = "Already submitted to teacher. This is a 0% deliverable, has no grade, and does not affect your course average.";
  }
  update();
})();
