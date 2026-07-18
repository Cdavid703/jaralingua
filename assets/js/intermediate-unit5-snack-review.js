(function () {
  "use strict";

  const GOOGLE_USER_KEY = "jaralingua_google_user";
  const MICROSOFT_USER_KEY = "jaralingua_microsoft_user";
  const LOCAL_USER_KEY = "jaralingua_local_user";
  const SUBMIT_ENDPOINT = "/api/intermediate/unit5-snack-review/submit";
  const STORAGE_PREFIX = "jaralingua:intermediate:unit5:snack-review";

  const fields = {
    snackName: document.getElementById("snackName"),
    origin: document.getElementById("origin"),
    ingredients: document.getElementById("ingredients"),
    sensory: document.getElementById("sensoryNotes"),
    serving: document.getElementById("servingNotes"),
    cultural: document.getElementById("culturalNotes"),
    rating: document.getElementById("rating"),
    recommendation: document.getElementById("recommendationNotes"),
    response: document.getElementById("finalReview")
  };

  const stages = Array.from(document.querySelectorAll(".workshop-stage"));
  const statusBox = document.getElementById("writerStatus");
  const submitButton = document.getElementById("submitReview");
  const outlineButton = document.getElementById("createOutline");
  const clearButton = document.getElementById("clearDraft");
  const startButton = document.getElementById("startReview");
  const outlinePanel = document.getElementById("outlinePanel");
  const outlineList = document.getElementById("outlineList");
  const wordCounter = document.getElementById("wordCounter");
  const lengthMessage = document.getElementById("lengthMessage");
  const qualityText = document.getElementById("qualityText");
  const qualityFill = document.getElementById("qualityFill");
  const previewSnack = document.getElementById("previewSnack");
  const previewOrigin = document.getElementById("previewOrigin");
  const previewRating = document.getElementById("previewRating");
  const previewBest = document.getElementById("previewBest");
  const previewWords = document.getElementById("previewWords");
  const receiptPanel = document.getElementById("receiptPanel");
  const receiptStudent = document.getElementById("receiptStudent");
  const receiptTime = document.getElementById("receiptTime");
  const receiptWords = document.getElementById("receiptWords");
  const receiptCode = document.getElementById("receiptCode");

  let activeIdentity = identityForUser(readUser());
  let draftTimer = 0;
  let activeSubmissionId = "";
  let activeSubmissionFingerprint = "";
  let submitting = false;

  function readStoredUser(key) {
    try {
      const saved = JSON.parse(sessionStorage.getItem(key) || "null");
      if (!saved || !saved.exp || Date.now() / 1000 > saved.exp) {
        sessionStorage.removeItem(key);
        return null;
      }
      return saved;
    } catch (error) {
      sessionStorage.removeItem(key);
      return null;
    }
  }

  function readUser() {
    const googleUser = readStoredUser(GOOGLE_USER_KEY);
    if (googleUser && googleUser.credential) return Object.assign({ provider: "google" }, googleUser);
    const microsoftUser = readStoredUser(MICROSOFT_USER_KEY);
    if (microsoftUser && microsoftUser.credential) return Object.assign({ provider: "microsoft" }, microsoftUser);
    const localUser = readStoredUser(LOCAL_USER_KEY);
    if (localUser && localUser.credential) return Object.assign({ provider: "local" }, localUser);
    return null;
  }

  function identityForUser(user) {
    const source = user && (user.email || user.name || user.sub);
    const normalized = String(source || "guest").trim().toLowerCase().replace(/[^a-z0-9@._-]+/g, "-");
    return normalized || "guest";
  }

  function authHeaders() {
    const user = readUser();
    if (!user || !user.credential) return null;
    return {
      Authorization: "Bearer " + user.credential,
      "X-Jaralingua-Auth-Provider": user.provider || "google",
      "Content-Type": "application/json"
    };
  }

  function openLoginPanel() {
    const trigger = document.querySelector("[data-auth-toggle], [data-auth-nav-toggle]");
    if (trigger) trigger.click();
  }

  function storageKey(kind, identity) {
    return STORAGE_PREFIX + ":" + kind + ":" + (identity || activeIdentity);
  }

  function readLocalJson(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || "null");
    } catch (error) {
      return null;
    }
  }

  function writeLocalJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      return false;
    }
  }

  function removeLocalValue(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      return;
    }
  }

  function compact(value, fallback) {
    const text = String(value || "").trim();
    return text || fallback;
  }

  function wordCount(value) {
    const matches = String(value || "").trim().match(/\b[\w'-]+\b/g);
    return matches ? matches.length : 0;
  }

  function bestSentence(value) {
    const sentences = String(value || "")
      .replace(/([.!?])\s+/g, "$1|")
      .split("|")
      .map(function (item) { return item.trim(); })
      .filter(Boolean);
    const evidence = sentences.filter(function (item) {
      return /(made with|because|reminds me|similar to|different from|recommend|out of five|out of 5)/i.test(item);
    });
    return evidence.sort(function (a, b) { return wordCount(b) - wordCount(a); })[0] || sentences[0] || "";
  }

  function formData() {
    return {
      snackName: fields.snackName.value.trim(),
      origin: fields.origin.value.trim(),
      ingredients: fields.ingredients.value.trim(),
      sensory: fields.sensory.value.trim(),
      serving: fields.serving.value.trim(),
      cultural: fields.cultural.value.trim(),
      rating: fields.rating.value,
      recommendation: fields.recommendation.value.trim(),
      response: fields.response.value.trim()
    };
  }

  function hasDraftContent(data) {
    return Boolean(data.snackName || data.origin || data.ingredients || data.sensory || data.serving || data.cultural || data.recommendation || data.response);
  }

  function applyDraft(data) {
    if (!data || typeof data !== "object") return false;
    Object.keys(fields).forEach(function (key) {
      if (Object.prototype.hasOwnProperty.call(data, key) && typeof data[key] === "string") {
        fields[key].value = data[key];
      }
    });
    if (!fields.rating.value) fields.rating.value = "4";
    updateAll();
    return true;
  }

  function saveDraftNow() {
    const data = formData();
    if (!hasDraftContent(data)) {
      removeLocalValue(storageKey("draft"));
      return;
    }
    writeLocalJson(storageKey("draft"), {
      version: 2,
      identity: activeIdentity,
      savedAt: new Date().toISOString(),
      data: data
    });
  }

  function scheduleDraftSave() {
    window.clearTimeout(draftTimer);
    draftTimer = window.setTimeout(saveDraftNow, 350);
  }

  function loadDraft(identity) {
    const saved = readLocalJson(storageKey("draft", identity));
    if (saved && saved.data) return applyDraft(saved.data);
    return false;
  }

  function migrateGuestDraft(nextIdentity) {
    if (nextIdentity === "guest") return;
    const destination = readLocalJson(storageKey("draft", nextIdentity));
    if (destination && destination.data) return;
    const guest = readLocalJson(storageKey("draft", "guest"));
    if (!guest || !guest.data || !hasDraftContent(guest.data)) return;
    writeLocalJson(storageKey("draft", nextIdentity), {
      version: 2,
      identity: nextIdentity,
      savedAt: new Date().toISOString(),
      data: guest.data
    });
  }

  function quantityEvidence(text) {
    const matches = String(text || "").toLowerCase().match(
      /\b(?:some|a little|a few|much|many)\b|\b(?:one|two|three|four|five|\d+)\s+(?:small\s+|large\s+)?(?:cup|cups|slice|slices|piece|pieces|bowl|bowls|spoonful|spoonfuls|teaspoon|teaspoons|serving|servings|portion|portions|can|cans|bottle|bottles|packet|packets)(?:\s+of)?\b/gi
    ) || [];
    return Array.from(new Set(matches.map(function (item) { return item.trim(); })));
  }

  function sensoryEvidence(text) {
    const words = ["salty", "sweet", "spicy", "sour", "mild", "rich", "crispy", "crunchy", "creamy", "soft", "juicy", "dry", "warm", "cold", "fresh", "light", "filling", "heavy"];
    const normalized = String(text || "").toLowerCase();
    return words.filter(function (word) { return new RegExp("\\b" + word + "\\b", "i").test(normalized); });
  }

  function qualityChecks() {
    const data = formData();
    const review = data.response;
    const quantities = quantityEvidence(review);
    const sensory = sensoryEvidence(review);
    return {
      context: data.snackName.length >= 3 && data.origin.length >= 5,
      madeWith: /\bmade with\b/i.test(review),
      quantities: quantities.length >= 2,
      sensory: sensory.length >= 2,
      serving: /\b(?:one|two|three|four|five|a|small|large)\s+(?:serving|portion|piece|pieces|slice|slices|bowl|bowls)\b|\benough for\b|\bserved\b/i.test(review),
      culture: /\b(reminds me|similar to|different from|in my experience|family|tradition|street food|culture|cultural|region|place)\b/i.test(review),
      rating: /\b(?:one|two|three|four|five|[1-5])\s+out of\s+(?:five|5)\b[\s\S]*\bbecause\b|\bgive it\b[\s\S]*\bbecause\b/i.test(review),
      recommendation: /\b(i recommend|i would recommend|you should try|worth trying|good choice)\b/i.test(review)
    };
  }

  function updateQuality() {
    const checks = qualityChecks();
    const ready = Object.keys(checks).filter(function (key) { return checks[key]; }).length;
    document.querySelectorAll("[data-quality]").forEach(function (card) {
      card.classList.toggle("complete", Boolean(checks[card.dataset.quality]));
    });
    qualityText.textContent = ready + " / 8 ready";
    qualityFill.style.width = Math.round((ready / 8) * 100) + "%";
    return checks;
  }

  function updatePreview() {
    const data = formData();
    const count = wordCount(data.response);
    previewSnack.textContent = compact(data.snackName, "Waiting for the snack name.");
    previewOrigin.textContent = compact(data.origin, "Waiting for the origin or cultural connection.");
    previewRating.textContent = data.rating + " out of 5";
    previewBest.textContent = bestSentence(data.response) || "Waiting for a sentence with clear evidence.";
    previewWords.textContent = count + " words";
  }

  function updateCounter() {
    const count = wordCount(fields.response.value);
    wordCounter.textContent = count + " words";
    if (count === 0) {
      lengthMessage.textContent = "Target: 100 to 150 words.";
    } else if (count < 100) {
      lengthMessage.textContent = (100 - count) + " more words needed.";
    } else if (count > 150) {
      lengthMessage.textContent = "Remove " + (count - 150) + " words.";
    } else {
      lengthMessage.textContent = "Length ready.";
    }
  }

  function updateAll() {
    updateCounter();
    updateQuality();
    updatePreview();
  }

  function showStatus(message, type) {
    statusBox.className = "writer-status show" + (type ? " " + type : "");
    statusBox.textContent = message;
  }

  function clearStatus() {
    statusBox.className = "writer-status";
    statusBox.textContent = "";
  }

  function createOutline() {
    const data = formData();
    const items = [
      "Opening: identify " + compact(data.snackName, "your snack") + " and connect it to " + compact(data.origin, "a place, memory, or food tradition") + ".",
      "Ingredients and quantities: use made with and your notes: " + compact(data.ingredients, "add at least two quantity expressions") + ".",
      "Sensory evidence: describe " + compact(data.sensory, "at least two taste or texture details") + ".",
      "Serving evidence: explain " + compact(data.serving, "the portion, container, or way it is served") + ".",
      "Cultural comparison: develop " + compact(data.cultural, "one respectful similarity, difference, or memory") + ".",
      "Opinion: give it " + data.rating + " out of five because " + compact(data.recommendation, "add a concrete reason, then recommend it or explain who should try it") + "."
    ];
    outlineList.textContent = "";
    items.forEach(function (item) {
      const li = document.createElement("li");
      li.textContent = item;
      outlineList.appendChild(li);
    });
    outlinePanel.hidden = false;
    showStatus("Your outline is ready. Use it as a route, then write the review in your own words.", "success");
    outlinePanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function createSubmissionId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") return window.crypto.randomUUID();
    return "snack-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 12);
  }

  function payloadFingerprint(data) {
    return JSON.stringify(data);
  }

  function submissionIdFor(data) {
    const fingerprint = payloadFingerprint(data);
    if (activeSubmissionId && activeSubmissionFingerprint === fingerprint) return activeSubmissionId;
    const stored = readLocalJson(storageKey("pending"));
    if (stored && stored.id && stored.fingerprint === fingerprint) {
      activeSubmissionId = stored.id;
      activeSubmissionFingerprint = fingerprint;
      return activeSubmissionId;
    }
    activeSubmissionId = createSubmissionId();
    activeSubmissionFingerprint = fingerprint;
    writeLocalJson(storageKey("pending"), { id: activeSubmissionId, fingerprint: fingerprint });
    return activeSubmissionId;
  }

  function validationMessage(checks, count, data) {
    if (!checks.context) return { message: "Add a clear snack name and an origin or cultural connection.", field: fields.snackName };
    if (data.ingredients.length < 12) return { message: "Complete your ingredient and quantity notes before sending.", field: fields.ingredients };
    if (!checks.madeWith) return { message: "Use made with in the final review to introduce the ingredients.", field: fields.response };
    if (!checks.quantities) return { message: "Include at least two different quantity or measure expressions in the final review.", field: fields.response };
    if (!checks.sensory) return { message: "Include at least two precise taste or texture adjectives in the final review.", field: fields.response };
    if (!checks.serving) return { message: "Explain a serving, portion, container, or way the snack is served.", field: fields.response };
    if (!checks.culture) return { message: "Add one respectful cultural connection, similarity, difference, or memory.", field: fields.response };
    if (!checks.rating) return { message: "Give a rating out of five and support it with because.", field: fields.response };
    if (!checks.recommendation) return { message: "Finish with a clear recommendation.", field: fields.response };
    if (count < 100) return { message: "Write at least 100 words before sending the review.", field: fields.response };
    if (count > 150) return { message: "Keep the final review at 150 words or fewer.", field: fields.response };
    return null;
  }

  function formatReceiptTime(value) {
    const date = new Date(value || "");
    if (Number.isNaN(date.getTime())) return String(value || "Confirmed by the server");
    return date.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
  }

  function renderReceipt(receipt) {
    if (!receipt || typeof receipt !== "object") {
      receiptPanel.hidden = true;
      return;
    }
    receiptStudent.textContent = compact(receipt.studentName, "Signed-in student");
    receiptTime.textContent = formatReceiptTime(receipt.submittedAt);
    receiptWords.textContent = String(receipt.wordCount || 0) + " words";
    receiptCode.textContent = compact(receipt.clientSubmissionId, "Server confirmation");
    receiptPanel.hidden = false;
    submitButton.innerHTML = '<i class="bi bi-send-check"></i> Update and Resend to Teacher';
  }

  function loadReceipt(identity) {
    const receipt = readLocalJson(storageKey("receipt", identity));
    renderReceipt(receipt);
  }

  async function submitReview() {
    if (submitting) return;
    handleIdentityChange();
    const data = formData();
    const checks = updateQuality();
    const count = wordCount(data.response);
    const problem = validationMessage(checks, count, data);
    if (problem) {
      showStatus(problem.message, "error");
      problem.field.focus();
      return;
    }

    const headers = authHeaders();
    if (!headers) {
      showStatus("Sign in first. Your review must be linked to your Intermediate English student record.", "error");
      openLoginPanel();
      return;
    }

    const clientSubmissionId = submissionIdFor(data);
    submitting = true;
    submitButton.disabled = true;
    showStatus("Sending your Global Snack Review to the teacher...", "");

    try {
      const response = await fetch(SUBMIT_ENDPOINT, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          snackName: data.snackName,
          origin: data.origin,
          rating: data.rating,
          ingredients: data.ingredients,
          sensoryNotes: data.sensory,
          servingNotes: data.serving,
          culturalNotes: data.cultural,
          recommendationNotes: data.recommendation,
          response: data.response,
          clientSubmissionId: clientSubmissionId,
          clientDate: new Date().toISOString().slice(0, 10)
        })
      });
      const result = await response.json().catch(function () { return {}; });
      if (!response.ok) {
        const messages = {
          student_not_authorized: "Your account is signed in, but it is not linked to an Intermediate English student record. Ask the teacher to check your registered email.",
          text_too_short: "The review is shorter than 100 words.",
          text_too_long: "The review is longer than 150 words.",
          invalid_review_metadata: "The snack name, cultural connection, ingredients, or rating is incomplete.",
          missing_client_submission_id: "The submission could not be identified safely. Reload the page and try again."
        };
        showStatus(messages[result.error] || "The submission could not be saved. Your draft is still available; please try again.", "error");
        return;
      }

      const receipt = {
        studentName: result.studentName || (readUser() && readUser().name) || "Signed-in student",
        submittedAt: result.submittedAt,
        wordCount: result.wordCount,
        attemptCount: result.attemptCount,
        clientSubmissionId: result.clientSubmissionId || clientSubmissionId,
        idempotent: Boolean(result.idempotent)
      };
      writeLocalJson(storageKey("receipt"), receipt);
      removeLocalValue(storageKey("pending"));
      activeSubmissionId = "";
      activeSubmissionFingerprint = "";
      renderReceipt(receipt);
      saveDraftNow();
      showStatus("Sent successfully. The teacher can now read your review. It is recorded as follow-up work with weight 0 and does not affect the accumulated percentage.", "success");
      receiptPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } catch (error) {
      showStatus("Network error. Nothing was lost: your draft is saved and you can press Send to Teacher again.", "error");
    } finally {
      submitting = false;
      submitButton.disabled = false;
    }
  }

  function clearDraft() {
    Object.keys(fields).forEach(function (key) {
      fields[key].value = key === "rating" ? "4" : "";
    });
    outlineList.textContent = "";
    outlinePanel.hidden = true;
    removeLocalValue(storageKey("draft"));
    removeLocalValue(storageKey("pending"));
    activeSubmissionId = "";
    activeSubmissionFingerprint = "";
    updateAll();
    showStatus("Draft cleared. Your previous submission receipt remains available.", "success");
  }

  function handleIdentityChange() {
    const nextIdentity = identityForUser(readUser());
    if (nextIdentity === activeIdentity) return;
    saveDraftNow();
    migrateGuestDraft(nextIdentity);
    activeIdentity = nextIdentity;
    loadDraft(activeIdentity);
    loadReceipt(activeIdentity);
    showStatus("Your saved work is now linked to the active course account.", "success");
  }

  stages.forEach(function (stage) {
    stage.addEventListener("toggle", function () {
      if (!stage.open) return;
      stages.forEach(function (other) {
        if (other !== stage) other.open = false;
      });
    });
  });

  document.querySelectorAll(".speed-controls").forEach(function (group) {
    const audio = group.closest(".audio-card").querySelector("audio");
    group.querySelectorAll(".speed-button").forEach(function (button) {
      button.addEventListener("click", function () {
        audio.playbackRate = Number(button.dataset.speed) || 1;
        group.querySelectorAll(".speed-button").forEach(function (item) {
          item.classList.toggle("active", item === button);
        });
      });
    });
  });

  Object.keys(fields).forEach(function (key) {
    const eventName = fields[key].tagName === "SELECT" ? "change" : "input";
    fields[key].addEventListener(eventName, function () {
      activeSubmissionId = "";
      activeSubmissionFingerprint = "";
      clearStatus();
      updateAll();
      scheduleDraftSave();
    });
  });

  startButton.addEventListener("click", function () {
    const planningStage = document.getElementById("stage-plan");
    planningStage.open = true;
    planningStage.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  outlineButton.addEventListener("click", createOutline);
  submitButton.addEventListener("click", submitReview);
  clearButton.addEventListener("click", clearDraft);
  window.addEventListener("beforeunload", saveDraftNow);

  if (!loadDraft(activeIdentity) && activeIdentity !== "guest") {
    migrateGuestDraft(activeIdentity);
    loadDraft(activeIdentity);
  }
  loadReceipt(activeIdentity);
  updateAll();
  window.setInterval(handleIdentityChange, 1500);
})();
