(function () {
  "use strict";

  var GAME_CONFIG = window.JaraLinguaHangmanConfig || {};
  var DATA = GAME_CONFIG.data || window.JaraLinguaEnglishBasic2Hangman || window.JaraLinguaEnglishIntermediateHangman || { categories: [], expectedEntries: 0 };
  var STORAGE_KEY = GAME_CONFIG.storageKey || "english-intermediate-hangman-game-v2";
  var SOUND_KEY = GAME_CONFIG.soundKey || "english-intermediate-hangman-sound-v1";
  var GOOGLE_USER_KEY = "jaralingua_google_user";
  var MICROSOFT_USER_KEY = "jaralingua_microsoft_user";
  var LOCAL_USER_KEY = "jaralingua_local_user";
  var ROLE_REQUESTS_KEY = "jaralingua_role_requests";
  var ADMIN_EMAILS = ["cdavid.jaramillo@gmail.com"];
  var MAX_ERRORS = 6;
  var BASE_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  var SFX_BASE = GAME_CONFIG.sfxBase || "audio/sfx/hangman/";
  var ALPHABET_AUDIO_BASE = GAME_CONFIG.alphabetAudioBase || "/ingles/basico/audio/alphabet/";
  var ANSWER_AUDIO_BASE = GAME_CONFIG.answerAudioBase || "/ingles/intermediate/audio/hangman/answers/";
  var ANSWER_AUDIO_ENABLED = GAME_CONFIG.answerAudioEnabled !== false;
  var ALLOW_ALL_CATEGORIES = GAME_CONFIG.allowAllCategories !== false;
  var AUDIO_VERSION = GAME_CONFIG.audioVersion || "?v=20260718-hangman";
  var SFX = {
    start: "game-start.mp3",
    correct: "correct-letter.mp3",
    wrong: "wrong-letter.mp3",
    turn: "turn-change.mp3",
    round: "round-complete.mp3",
    win: "match-win.mp3"
  };

  var entries = flattenEntries(DATA.categories || []);
  var entryById = entries.reduce(function (map, entry) {
    map[entry.id] = entry;
    return map;
  }, {});
  var soundSettings = loadSoundSettings();
  var audioCache = {};
  var activeLetterAudio = null;
  var activeAnswerAudio = null;
  var letterAudioPlaying = false;
  var letterAudioToken = 0;
  var queuedSfxName = "";
  var state = loadState();
  var authState = { user: null, isLoggedIn: false, isTeacher: false };
  var lastAuthSignature = "";

  function $(selector) { return document.querySelector(selector); }

  function defaultState() {
    return {
      version: 2,
      status: "setup",
      roster: [],
      scores: {},
      targetScore: 10,
      category: "all",
      answerType: "all",
      order: [],
      turnIndex: 0,
      roundNumber: 0,
      usedIds: [],
      current: null,
      history: []
    };
  }

  function loadState() {
    try {
      var parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (!parsed || parsed.version !== 2 || !Array.isArray(parsed.roster)) return defaultState();
      if (parsed.current && !entryById[parsed.current.entryId]) return defaultState();
      var restored = Object.assign(defaultState(), parsed);
      if (restored.current) {
        restored.current.hintLevel = Math.max(1, Math.min(3, Number(restored.current.hintLevel) || 1));
        restored.current.guesses = Array.isArray(restored.current.guesses) ? restored.current.guesses : [];
        restored.current.errors = Math.max(0, Math.min(MAX_ERRORS, Number(restored.current.errors) || 0));
      }
      return restored;
    } catch (_error) {
      return defaultState();
    }
  }

  function saveState() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (_error) {}
  }

  function loadSoundSettings() {
    try {
      var saved = JSON.parse(localStorage.getItem(SOUND_KEY) || "null");
      if (saved && typeof saved === "object") {
        var savedVolume = Number(saved.volume);
        return {
          enabled: saved.enabled !== false,
          volume: Number.isFinite(savedVolume) ? Math.max(0, Math.min(1, savedVolume)) : 0.7
        };
      }
    } catch (_error) {}
    return { enabled: true, volume: 0.7 };
  }

  function saveSoundSettings() {
    try { localStorage.setItem(SOUND_KEY, JSON.stringify(soundSettings)); } catch (_error) {}
  }

  function flattenEntries(categories) {
    var result = [];
    categories.forEach(function (category) {
      (category.entries || []).forEach(function (item, index) {
        var id = category.id + "-" + (index + 1);
        result.push({
          id: id,
          categoryId: category.id,
          categoryLabel: category.label,
          categoryIcon: category.icon,
          unit: category.unit,
          answer: item.answer,
          meaning: item.meaning,
          example: item.example,
          usage: item.usage,
          hints: Array.isArray(item.hints) ? item.hints.slice(0, 3) : [],
          audioId: id,
          type: answerType(item.answer)
        });
      });
    });
    return result;
  }

  function answerType(answer) {
    return String(answer || "").trim().split(/\s+/).filter(Boolean).length > 1 ? "expression" : "word";
  }

  function normalizeName(value) {
    return String(value || "").trim().replace(/\s+/g, " ");
  }

  function uniqueNames(value) {
    var seen = {};
    return String(value || "").split(/[\n,;]+/).map(normalizeName).filter(function (name) {
      var key = name.toLocaleLowerCase("en");
      if (!name || seen[key]) return false;
      seen[key] = true;
      return true;
    }).slice(0, 60);
  }

  function canonicalLetter(letter) {
    return String(letter || "").toUpperCase().replace(/[^A-Z]/g, "").charAt(0);
  }

  function isLetter(char) {
    return /^[A-Z]$/i.test(char || "");
  }

  function normalizeSolution(value) {
    return String(value || "").trim().toLocaleLowerCase("en").replace(/[^a-z0-9]+/g, "");
  }

  function answerContains(entry, letter) {
    var target = canonicalLetter(letter);
    return Array.from(entry.answer).some(function (char) {
      return isLetter(char) && canonicalLetter(char) === target;
    });
  }

  function isIndexRevealed(entry, index) {
    var char = Array.from(entry.answer)[index];
    if (!isLetter(char)) return true;
    return (state.current.guesses || []).indexOf(canonicalLetter(char)) !== -1;
  }

  function isSolved(entry) {
    return Array.from(entry.answer).every(function (_char, index) {
      return isIndexRevealed(entry, index);
    });
  }

  function solutionBonus() {
    if (!state.current) return 3;
    return Math.max(1, 4 - Math.max(1, Number(state.current.hintLevel) || 1));
  }

  function selectedPool() {
    return entries.filter(function (entry) {
      var categoryOk = state.category === "all" || entry.categoryId === state.category;
      var typeOk = state.answerType === "all" || entry.type === state.answerType;
      return categoryOk && typeOk;
    });
  }

  function secureRandomIndex(length) {
    if (!length) return 0;
    if (window.crypto && window.crypto.getRandomValues) {
      var values = new Uint32Array(1);
      window.crypto.getRandomValues(values);
      return values[0] % length;
    }
    return Math.floor(Math.random() * length);
  }

  function shuffle(values) {
    var output = values.slice();
    for (var i = output.length - 1; i > 0; i -= 1) {
      var j = secureRandomIndex(i + 1);
      var temporary = output[i];
      output[i] = output[j];
      output[j] = temporary;
    }
    return output;
  }

  function currentPlayer() {
    if (!state.order.length) return "";
    return state.order[state.turnIndex % state.order.length] || "";
  }

  function advanceTurn() {
    if (!state.order.length) return;
    state.turnIndex = (state.turnIndex + 1) % state.order.length;
  }

  function categoryLabel(id) {
    if (id === "all") return "All course categories";
    var category = (DATA.categories || []).filter(function (item) { return item.id === id; })[0];
    return category ? category.label : "Course category";
  }

  function showMessage(message, type) {
    var box = $("#statusMessage");
    if (!box) return;
    box.textContent = message;
    box.className = "status-message " + (type || "info");
    box.hidden = false;
  }

  function hideMessage() {
    var box = $("#statusMessage");
    if (box) box.hidden = true;
  }

  function setButtonWorking(button, working, workingLabel) {
    if (!button) return;
    if (working) {
      if (!button.dataset.defaultHtml) button.dataset.defaultHtml = button.innerHTML;
      button.innerHTML = '<span class="spinner-border spinner-border-sm" aria-hidden="true"></span> ' + workingLabel;
      button.setAttribute("aria-busy", "true");
    } else {
      if (button.dataset.defaultHtml) button.innerHTML = button.dataset.defaultHtml;
      button.removeAttribute("aria-busy");
    }
  }

  function playSfxNow(name) {
    if (!soundSettings.enabled || !SFX[name]) return;
    try {
      if (!audioCache[name]) {
        audioCache[name] = new Audio(SFX_BASE + SFX[name] + AUDIO_VERSION);
        audioCache[name].preload = "auto";
      }
      var audio = audioCache[name];
      audio.pause();
      audio.currentTime = 0;
      audio.volume = soundSettings.volume;
      var promise = audio.play();
      if (promise && typeof promise.catch === "function") promise.catch(function () {});
    } catch (_error) {}
  }

  function playSfx(name) {
    if (!soundSettings.enabled || !SFX[name]) return;
    if (letterAudioPlaying) {
      queuedSfxName = name;
      return;
    }
    playSfxNow(name);
  }

  function finishLetterAudio(token) {
    if (token !== letterAudioToken) return;
    letterAudioPlaying = false;
    activeLetterAudio = null;
    var nextSfx = queuedSfxName;
    queuedSfxName = "";
    if (nextSfx) playSfxNow(nextSfx);
  }

  function playLetterName(letter) {
    if (!soundSettings.enabled) return;
    var key = canonicalLetter(letter).toLowerCase();
    if (!/^[a-z]$/.test(key)) return;
    var cacheKey = "alphabet-" + key;
    var token = letterAudioToken + 1;
    letterAudioToken = token;
    queuedSfxName = "";
    if (activeLetterAudio) {
      activeLetterAudio.pause();
      activeLetterAudio.currentTime = 0;
    }
    try {
      if (!audioCache[cacheKey]) {
        audioCache[cacheKey] = new Audio(ALPHABET_AUDIO_BASE + key + ".mp3" + AUDIO_VERSION);
        audioCache[cacheKey].preload = "auto";
      }
      var audio = audioCache[cacheKey];
      activeLetterAudio = audio;
      letterAudioPlaying = true;
      audio.pause();
      audio.currentTime = 0;
      audio.volume = soundSettings.volume;
      audio.onended = function () { finishLetterAudio(token); };
      audio.onerror = function () { finishLetterAudio(token); };
      var promise = audio.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () { finishLetterAudio(token); });
      }
    } catch (_error) {
      finishLetterAudio(token);
    }
  }

  function playAnswerAudio(button, entry) {
    if (!soundSettings.enabled) {
      showMessage("Turn on audio before playing the pronunciation model.", "warning");
      return;
    }
    var cacheKey = "answer-" + entry.audioId;
    if (activeAnswerAudio) {
      activeAnswerAudio.pause();
      activeAnswerAudio.currentTime = 0;
    }
    try {
      if (!audioCache[cacheKey]) {
        audioCache[cacheKey] = new Audio(ANSWER_AUDIO_BASE + entry.audioId + ".mp3" + AUDIO_VERSION);
        audioCache[cacheKey].preload = "auto";
      }
      var audio = audioCache[cacheKey];
      activeAnswerAudio = audio;
      setButtonWorking(button, true, "Playing");
      audio.pause();
      audio.currentTime = 0;
      audio.volume = soundSettings.volume;
      audio.onended = function () {
        setButtonWorking(button, false, "");
        activeAnswerAudio = null;
      };
      audio.onerror = function () {
        setButtonWorking(button, false, "");
        activeAnswerAudio = null;
        showMessage("The pronunciation model could not be loaded. Please try again.", "error");
      };
      var promise = audio.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          setButtonWorking(button, false, "");
          activeAnswerAudio = null;
          showMessage("The browser blocked audio playback. Press the pronunciation button again.", "warning");
        });
      }
      showMessage("Playing the American English pronunciation of " + entry.answer + ".", "success");
    } catch (_error) {
      setButtonWorking(button, false, "");
      showMessage("The pronunciation model could not be played.", "error");
    }
  }

  function stopAllAudio() {
    letterAudioToken += 1;
    letterAudioPlaying = false;
    queuedSfxName = "";
    activeLetterAudio = null;
    activeAnswerAudio = null;
    Object.keys(audioCache).forEach(function (key) {
      try {
        audioCache[key].pause();
        audioCache[key].currentTime = 0;
      } catch (_error) {}
    });
  }

  function normalizeEmail(value) { return String(value || "").trim().toLowerCase(); }

  function readStoredAuthUser(key, provider) {
    try {
      var saved = JSON.parse(sessionStorage.getItem(key) || "null");
      if (!saved || !saved.exp || Date.now() / 1000 > saved.exp) return null;
      return Object.assign({ provider: provider }, saved);
    } catch (_error) {
      return null;
    }
  }

  function currentAuthUser() {
    var google = readStoredAuthUser(GOOGLE_USER_KEY, "google");
    if (google && google.credential) return google;
    var microsoft = readStoredAuthUser(MICROSOFT_USER_KEY, "microsoft");
    if (microsoft && microsoft.credential) return microsoft;
    var local = readStoredAuthUser(LOCAL_USER_KEY, "local");
    if (local && local.credential) return local;
    return null;
  }

  function readRoleRequests() {
    try {
      var saved = JSON.parse(localStorage.getItem(ROLE_REQUESTS_KEY) || "[]");
      return Array.isArray(saved) ? saved : [];
    } catch (_error) {
      return [];
    }
  }

  function readAuthAccess() {
    var user = currentAuthUser();
    if (!user) return { user: null, isLoggedIn: false, isTeacher: false };
    if (ADMIN_EMAILS.indexOf(normalizeEmail(user.email)) !== -1) {
      return { user: user, isLoggedIn: true, isTeacher: true };
    }
    var id = user.sub || user.email || "";
    var request = readRoleRequests().filter(function (item) {
      return item && (item.id === id || normalizeEmail(item.email) === normalizeEmail(user.email));
    })[0];
    var role = request && request.status === "approved" ? request.role : "";
    return { user: user, isLoggedIn: true, isTeacher: role === "teacher" || role === "admin" };
  }

  function openAuthPanel() {
    var trigger = document.querySelector("[data-auth-nav-toggle]") || document.querySelector("[data-auth-toggle]");
    if (trigger) {
      trigger.click();
      showMessage("Sign-in options opened. Use your approved teacher account.", "success");
    } else {
      showMessage("Use the JaraLingua sign-in control and enter with an approved teacher account.", "warning");
    }
  }

  function syncAuthUi(force) {
    authState = readAuthAccess();
    var signature = String(authState.isLoggedIn) + ":" + String(authState.isTeacher) + ":" + normalizeEmail(authState.user && authState.user.email);
    if (!force && signature === lastAuthSignature) return;
    lastAuthSignature = signature;
    document.body.classList.toggle("teacher-mode", authState.isTeacher);
    $("#teacherGate").hidden = authState.isLoggedIn;
    $("#spectatorNote").hidden = !authState.isLoggedIn || authState.isTeacher;
    renderModePanels();
  }

  function populateCategories() {
    var select = $("#categorySelect");
    select.innerHTML = "";
    if (ALLOW_ALL_CATEGORIES) {
      var allOption = document.createElement("option");
      allOption.value = "all";
      allOption.textContent = GAME_CONFIG.allCategoriesLabel || "All course categories";
      select.appendChild(allOption);
    }
    (DATA.categories || []).forEach(function (category) {
      var option = document.createElement("option");
      option.value = category.id;
      option.textContent = category.label + " (" + category.entries.length + ")";
      select.appendChild(option);
    });
  }

  function hydrateSetup() {
    $("#studentNamesInput").value = (state.roster || []).join("\n");
    if (!ALLOW_ALL_CATEGORIES && (state.category === "all" || !state.category)) {
      state.category = (DATA.categories[0] && DATA.categories[0].id) || "";
    }
    $("#categorySelect").value = state.category || "all";
    $("#answerTypeSelect").value = state.answerType || "all";
    $("#targetScoreInput").value = state.targetScore || 10;
  }

  function renderModePanels() {
    var hasGame = state.status !== "setup" && state.current;
    $("#teacherSetup").hidden = !authState.isTeacher || hasGame;
    $("#gameConsole").hidden = !authState.isTeacher || !hasGame;
    if (hasGame && authState.isTeacher) renderGame();
  }

  function renderWord(entry) {
    var board = $("#wordBoard");
    board.innerHTML = "";
    var index = 0;
    entry.answer.split(/(\s+)/).forEach(function (part) {
      if (!part) return;
      if (/^\s+$/.test(part)) {
        index += part.length;
        return;
      }
      var token = document.createElement("span");
      token.className = "word-token";
      Array.from(part).forEach(function (char) {
        var slot = document.createElement("span");
        var revealed = isIndexRevealed(entry, index) || state.current.status !== "active";
        slot.className = "letter-slot";
        if (!isLetter(char)) slot.classList.add("punctuation");
        if (revealed) slot.classList.add("revealed");
        slot.textContent = revealed || !isLetter(char) ? char : "";
        slot.setAttribute("aria-label", revealed || !isLetter(char) ? char : "hidden letter");
        token.appendChild(slot);
        index += 1;
      });
      board.appendChild(token);
    });
    board.setAttribute("aria-label", state.current.status === "active" ? "Word or expression to discover" : "Solution: " + entry.answer);
  }

  function renderKeyboard(entry) {
    var target = $("#baseKeyboard");
    var guesses = state.current.guesses || [];
    target.innerHTML = "";
    BASE_LETTERS.forEach(function (letter) {
      var key = document.createElement("button");
      var used = guesses.indexOf(letter) !== -1;
      key.type = "button";
      key.className = "letter-key";
      key.textContent = letter;
      key.dataset.letter = letter;
      key.disabled = state.current.status !== "active" || used;
      key.setAttribute("aria-label", "Hear and choose the letter " + letter);
      key.setAttribute("title", "Hear and choose " + letter);
      if (used) key.classList.add(answerContains(entry, letter) ? "correct" : "wrong");
      target.appendChild(key);
    });
  }

  function renderScores() {
    var list = $("#scoreList");
    list.innerHTML = "";
    var player = currentPlayer();
    state.roster.slice().sort(function (a, b) {
      return Number(state.scores[b] || 0) - Number(state.scores[a] || 0) || state.roster.indexOf(a) - state.roster.indexOf(b);
    }).forEach(function (name) {
      var row = document.createElement("div");
      row.className = "score-row" + (name === player && state.current.status === "active" ? " current" : "");
      var label = document.createElement("span");
      label.className = "score-name";
      label.textContent = name;
      var value = document.createElement("strong");
      value.className = "score-value";
      value.textContent = String(state.scores[name] || 0);
      var actions = document.createElement("div");
      actions.className = "score-adjust";
      actions.innerHTML = '<button type="button" data-score-name="" data-delta="-1" title="Remove one point" aria-label="Remove one point"><i class="bi bi-dash-lg"></i></button><button type="button" data-score-name="" data-delta="1" title="Add one point" aria-label="Add one point"><i class="bi bi-plus-lg"></i></button>';
      Array.from(actions.querySelectorAll("button")).forEach(function (button) { button.dataset.scoreName = name; });
      row.appendChild(label);
      row.appendChild(value);
      row.appendChild(actions);
      list.appendChild(row);
    });
  }

  function renderHistory() {
    var list = $("#roundHistory");
    list.innerHTML = "";
    if (!state.history.length) {
      var empty = document.createElement("li");
      empty.textContent = "No completed rounds yet.";
      list.appendChild(empty);
      return;
    }
    state.history.slice().reverse().forEach(function (item) {
      var line = document.createElement("li");
      line.textContent = "Round " + item.round + " | " + item.answer + " | " + (item.success ? "solved by " + item.player : "not solved");
      list.appendChild(line);
    });
  }

  function appendRecapRow(parent, labelText, valueText) {
    var row = document.createElement("div");
    row.className = "learning-recap-row";
    var label = document.createElement("strong");
    label.textContent = labelText;
    var value = document.createElement("p");
    value.textContent = valueText;
    row.appendChild(label);
    row.appendChild(value);
    parent.appendChild(row);
  }

  function renderRoundResult(entry) {
    var result = $("#roundResult");
    if (state.current.status === "active") {
      result.hidden = true;
      result.innerHTML = "";
      return;
    }
    result.hidden = false;
    result.innerHTML = "";

    var header = document.createElement("div");
    header.className = "round-result-head";
    var titleWrap = document.createElement("div");
    var eyebrow = document.createElement("span");
    eyebrow.className = "result-eyebrow";
    eyebrow.textContent = state.current.success ? "Answer solved" : "Round complete";
    var solution = document.createElement("h3");
    solution.className = "solution";
    solution.textContent = entry.answer;
    titleWrap.appendChild(eyebrow);
    titleWrap.appendChild(solution);

    header.appendChild(titleWrap);
    if (ANSWER_AUDIO_ENABLED) {
      var audioButton = document.createElement("button");
      audioButton.type = "button";
      audioButton.className = "games-btn-soft answer-audio-btn";
      audioButton.dataset.answerAudio = entry.id;
      audioButton.innerHTML = '<i class="bi bi-volume-up-fill"></i> Hear the answer';
      audioButton.setAttribute("aria-label", "Hear the pronunciation of " + entry.answer);
      header.appendChild(audioButton);
    }
    result.appendChild(header);

    var recap = document.createElement("div");
    recap.className = "learning-recap";
    appendRecapRow(recap, "Meaning", entry.meaning);
    appendRecapRow(recap, "Example", entry.example);
    appendRecapRow(recap, "Usage", entry.usage);
    appendRecapRow(recap, "Course connection", entry.unit + " | " + entry.categoryLabel.replace(/^Unit \d+: /, ""));
    result.appendChild(recap);
  }

  function renderWinner() {
    var panel = $("#winnerPanel");
    if (state.status !== "match-complete") {
      panel.hidden = true;
      panel.innerHTML = "";
      return;
    }
    var maximum = Math.max.apply(null, state.roster.map(function (name) { return Number(state.scores[name] || 0); }));
    var winners = state.roster.filter(function (name) { return Number(state.scores[name] || 0) === maximum; });
    panel.hidden = false;
    panel.innerHTML = '<i class="bi bi-trophy-fill fs-2" aria-hidden="true"></i><h3></h3><p></p>';
    panel.querySelector("h3").textContent = winners.length > 1 ? "Shared victory: " + winners.join(" and ") : winners[0] + " wins";
    panel.querySelector("p").textContent = maximum + " points | Target reached";
    addConfetti(panel);
  }

  function addConfetti(panel) {
    if (panel.querySelector(".confetti-piece")) return;
    var colors = ["#f4c95d", "#c84b49", "#13806f", "#ffffff", "#5fa9a2"];
    for (var i = 0; i < 28; i += 1) {
      var piece = document.createElement("span");
      piece.className = "confetti-piece";
      piece.style.left = secureRandomIndex(100) + "%";
      piece.style.background = colors[i % colors.length];
      piece.style.animationDelay = (secureRandomIndex(80) / 100) + "s";
      piece.style.setProperty("--drift", (secureRandomIndex(100) - 50) + "px");
      panel.appendChild(piece);
    }
  }

  function renderSoundControls() {
    var button = $("#soundToggleButton");
    button.innerHTML = soundSettings.enabled ? '<i class="bi bi-volume-up-fill"></i>' : '<i class="bi bi-volume-mute-fill"></i>';
    var label = soundSettings.enabled ? "Mute sound effects and letter pronunciation" : "Turn on sound effects and letter pronunciation";
    button.setAttribute("aria-label", label);
    button.setAttribute("title", label);
    button.setAttribute("aria-pressed", String(!soundSettings.enabled));
    $("#soundVolumeInput").value = Math.round(soundSettings.volume * 100);
  }

  function renderClues(entry) {
    var panel = $("#cluePanel");
    var button = $("#hintButton");
    var level = Math.max(1, Math.min(Number(state.current.hintLevel) || 1, entry.hints.length));
    var visibleHints = entry.hints.slice(0, level);
    panel.innerHTML = '<strong class="clue-heading">Progressive clues</strong><ol class="progressive-clues">' + visibleHints.map(function (hint, index) {
      return '<li><span>Clue ' + (index + 1) + '</span><p>' + escapeHtml(hint) + '</p></li>';
    }).join("") + '</ol><p class="clue-note">Complete-solution bonus: <strong>' + solutionBonus() + " point" + (solutionBonus() === 1 ? "" : "s") + "</strong>.</p>";

    var nextLevel = level + 1;
    var buttonText = nextLevel <= entry.hints.length ? "Reveal clue " + nextLevel : "All clues are visible";
    button.innerHTML = '<i class="bi bi-search"></i> ' + buttonText;
    button.setAttribute("aria-label", buttonText);
    button.disabled = state.current.status !== "active" || level >= entry.hints.length;
  }

  function renderGame() {
    if (!state.current) return;
    var entry = entryById[state.current.entryId];
    if (!entry) return;
    $("#currentPlayerName").textContent = state.current.status === "active" ? currentPlayer() : "Round complete";
    $("#roundCounter").textContent = "Round " + state.roundNumber;
    $("#currentCategory").innerHTML = '<i class="bi ' + entry.categoryIcon + '"></i> ' + escapeHtml(entry.categoryLabel);
    $("#gallows").dataset.errors = String(state.current.errors || 0);
    $("#gallows").setAttribute("aria-label", (state.current.errors || 0) + " mistake" + ((state.current.errors || 0) === 1 ? "" : "s") + " out of six");
    $("#mistakeCount").textContent = String(state.current.errors || 0);
    $("#modeSummary").textContent = categoryLabel(state.category) + " | " + state.targetScore + " points";
    $("#scoreTargetLabel").textContent = state.targetScore + " points";
    $("#solutionBonusText").textContent = "A correct solution currently earns " + solutionBonus() + " point" + (solutionBonus() === 1 ? "" : "s") + ". An incorrect solution adds one mistake and passes the turn.";
    renderClues(entry);
    $("#solveButton").disabled = state.current.status !== "active";
    $("#nextRoundButton").hidden = state.current.status === "active" || state.status === "match-complete";
    renderWord(entry);
    renderKeyboard(entry);
    renderScores();
    renderHistory();
    renderRoundResult(entry);
    renderWinner();
    renderSoundControls();
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>'"]/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char];
    });
  }

  function startGame() {
    if (!authState.isTeacher) {
      showMessage("This control is reserved for a signed-in teacher.", "error");
      return;
    }
    var roster = uniqueNames($("#studentNamesInput").value);
    if (!roster.length) {
      showMessage("Add at least one participant before starting the game.", "error");
      $("#studentNamesInput").focus();
      return;
    }
    var target = Math.max(3, Math.min(100, Number($("#targetScoreInput").value) || 10));
    state = defaultState();
    state.roster = roster;
    state.scores = roster.reduce(function (scores, name) { scores[name] = 0; return scores; }, {});
    state.targetScore = target;
    state.category = $("#categorySelect").value;
    state.answerType = $("#answerTypeSelect").value;
    state.order = shuffle(roster);
    state.turnIndex = 0;
    if (!selectedPool().length) {
      showMessage("This category and format combination has no answers. Choose another option.", "error");
      state.status = "setup";
      return;
    }
    startNewRound(false);
    playSfx("start");
    showMessage("Game started successfully. " + currentPlayer() + " has the first turn.", "success");
  }

  function startNewRound(playTurnSound) {
    var pool = selectedPool();
    var available = pool.filter(function (entry) { return state.usedIds.indexOf(entry.id) === -1; });
    var recycled = false;
    if (!available.length) {
      var poolIds = pool.map(function (entry) { return entry.id; });
      state.usedIds = state.usedIds.filter(function (id) { return poolIds.indexOf(id) === -1; });
      available = pool.slice();
      recycled = true;
    }
    var entry = available[secureRandomIndex(available.length)];
    state.usedIds.push(entry.id);
    state.roundNumber += 1;
    state.status = "active";
    state.current = {
      entryId: entry.id,
      guesses: [],
      errors: 0,
      hintLevel: 1,
      status: "active",
      success: false
    };
    saveState();
    renderModePanels();
    if (playTurnSound) playSfx("turn");
    if (recycled) showMessage("Every answer in this selection was used. The bank has restarted without changing scores.", "warning");
  }

  function finishRound(success, player, reason) {
    var entry = entryById[state.current.entryId];
    state.current.status = "complete";
    state.current.success = Boolean(success);
    state.current.player = player || "";
    state.current.reason = reason || "";
    state.history.push({ round: state.roundNumber, answer: entry.answer, success: Boolean(success), player: player || "the class" });
    advanceTurn();
    var topScore = Math.max.apply(null, state.roster.map(function (name) { return Number(state.scores[name] || 0); }));
    state.status = topScore >= state.targetScore ? "match-complete" : "round-complete";
    saveState();
    renderGame();
    if (state.status === "match-complete") playSfx("win");
    else playSfx("round");
  }

  function proposeLetter(letter) {
    if (!authState.isTeacher || state.status !== "active" || !state.current || state.current.status !== "active") return;
    var entry = entryById[state.current.entryId];
    var key = canonicalLetter(letter);
    if (!key || state.current.guesses.indexOf(key) !== -1) {
      showMessage("That letter has already been selected.", "warning");
      return;
    }
    playLetterName(key);
    state.current.guesses.push(key);
    var player = currentPlayer();
    if (answerContains(entry, key)) {
      state.scores[player] = Number(state.scores[player] || 0) + 1;
      if (isSolved(entry)) {
        finishRound(true, player, "all letters completed");
        showMessage("The answer is complete. " + player + " earned the final letter point.", "success");
        return;
      }
      saveState();
      renderGame();
      playSfx("correct");
      showMessage("Correct letter. " + player + " earned 1 point and keeps the turn.", "success");
      return;
    }
    state.current.errors += 1;
    if (state.current.errors >= MAX_ERRORS) {
      finishRound(false, "", "six mistakes");
      showMessage("Six mistakes. The answer was " + entry.answer + ". Review its meaning and example below.", "error");
      return;
    }
    advanceTurn();
    saveState();
    renderGame();
    playSfx("wrong");
    showMessage("That letter is not in the answer. The turn has passed to " + currentPlayer() + ".", "error");
  }

  function requestHint() {
    if (!state.current || state.current.status !== "active") return;
    var entry = entryById[state.current.entryId];
    var currentLevel = Math.max(1, Number(state.current.hintLevel) || 1);
    if (currentLevel >= entry.hints.length) {
      showMessage("All three clues are already visible.", "warning");
      return;
    }
    state.current.hintLevel = currentLevel + 1;
    saveState();
    renderGame();
    showMessage("Clue " + state.current.hintLevel + " is now visible. The complete-solution bonus is " + solutionBonus() + " point" + (solutionBonus() === 1 ? "" : "s") + ".", "success");
  }

  function openSolveDialog() {
    if (!state.current || state.current.status !== "active") return;
    $("#solutionInput").value = "";
    $("#solutionBonusText").textContent = "A correct solution currently earns " + solutionBonus() + " point" + (solutionBonus() === 1 ? "" : "s") + ". An incorrect solution adds one mistake and passes the turn.";
    var dialog = $("#solveDialog");
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
    window.setTimeout(function () { $("#solutionInput").focus(); }, 40);
  }

  function closeSolveDialog() {
    var dialog = $("#solveDialog");
    if (typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
  }

  function submitSolution(event) {
    event.preventDefault();
    if (!state.current || state.current.status !== "active") return;
    var entry = entryById[state.current.entryId];
    var proposal = $("#solutionInput").value;
    if (!proposal.trim()) {
      showMessage("Type a complete answer before checking it.", "warning");
      $("#solutionInput").focus();
      return;
    }
    closeSolveDialog();
    var player = currentPlayer();
    if (normalizeSolution(proposal) === normalizeSolution(entry.answer)) {
      var points = solutionBonus();
      state.scores[player] = Number(state.scores[player] || 0) + points;
      finishRound(true, player, "complete solution");
      showMessage("Correct solution. " + player + " earned " + points + " point" + (points === 1 ? "" : "s") + ".", "success");
      return;
    }
    state.current.errors += 1;
    if (state.current.errors >= MAX_ERRORS) {
      finishRound(false, "", "six mistakes");
      showMessage("The proposed solution was incorrect and completed the sixth mistake. The answer was " + entry.answer + ".", "error");
      return;
    }
    advanceTurn();
    saveState();
    renderGame();
    playSfx("wrong");
    showMessage("The complete solution was incorrect. The turn has passed to " + currentPlayer() + ".", "error");
  }

  function adjustScore(name, delta) {
    if (!authState.isTeacher || state.roster.indexOf(name) === -1) return;
    var previousStatus = state.status;
    state.scores[name] = Math.max(0, Number(state.scores[name] || 0) + Number(delta || 0));
    var topScore = Math.max.apply(null, state.roster.map(function (playerName) { return Number(state.scores[playerName] || 0); }));
    if (state.current && state.current.status !== "active") state.status = topScore >= state.targetScore ? "match-complete" : "round-complete";
    saveState();
    renderGame();
    if (state.status === "match-complete" && previousStatus !== "match-complete") playSfx("win");
    showMessage(name + " now has " + state.scores[name] + " point" + (state.scores[name] === 1 ? "" : "s") + ".", "success");
  }

  function resetMatch(clearRoster) {
    if (!authState.isTeacher) {
      showMessage("This control is reserved for a signed-in teacher.", "error");
      return;
    }
    var prompt = clearRoster
      ? "Reset the entire game? Names, scores, rounds, history, and saved progress will be deleted from this browser."
      : "Start a new match with the same participants? Scores, rounds, and history will return to zero.";
    if (!window.confirm(prompt)) {
      showMessage("Reset canceled. The current game was not changed.", "warning");
      return;
    }
    stopAllAudio();
    var roster = clearRoster ? [] : state.roster.slice();
    var settings = { category: state.category, answerType: state.answerType, targetScore: state.targetScore };
    state = defaultState();
    state.roster = roster;
    if (clearRoster) {
      try { localStorage.removeItem(STORAGE_KEY); } catch (_error) {}
    } else {
      Object.assign(state, settings);
      saveState();
    }
    hydrateSetup();
    if (clearRoster) $("#studentFileInput").value = "";
    $("#rosterImportStatus").textContent = "";
    renderModePanels();
    showMessage(clearRoster ? "Reset complete. Participants, scores, rounds, and saved progress were deleted." : "New match ready. Participant names were kept and all scores returned to zero.", "success");
  }

  function updateSoundToggle() {
    soundSettings.enabled = !soundSettings.enabled;
    if (!soundSettings.enabled) stopAllAudio();
    saveSoundSettings();
    renderSoundControls();
    if (soundSettings.enabled) {
      playSfx("correct");
      showMessage("Sound effects and recorded pronunciation are on.", "success");
    } else {
      showMessage("Sound effects and recorded pronunciation are muted.", "warning");
    }
  }

  function handleKeyboard(event) {
    if (!authState.isTeacher || state.status !== "active") return;
    var target = event.target;
    if (target && /^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(target.tagName)) return;
    if ($("#solveDialog").open) return;
    if (event.key && event.key.length === 1 && isLetter(event.key)) proposeLetter(event.key);
  }

  function bindEvents() {
    $("#openAuthButton").addEventListener("click", openAuthPanel);
    $("#importStudentsButton").addEventListener("click", function () {
      $("#studentFileInput").click();
      showMessage("Choose an Excel, CSV, TXT, or TSV file to import participant names.", "success");
    });
    $("#sampleStudentsButton").addEventListener("click", function () {
      $("#studentNamesInput").value = ["Ana", "Paul", "Sofia", "Lucas", "Maya", "Daniel"].join("\n");
      showMessage("Sample names loaded. You can edit the list before starting.", "success");
    });
    $("#startGameButton").addEventListener("click", startGame);
    $("#clearSavedButton").addEventListener("click", function () { resetMatch(true); });
    $("#resetMatchButton").addEventListener("click", function () { resetMatch(false); });
    $("#resetAllButton").addEventListener("click", function () { resetMatch(true); });
    $("#letterKeyboard").addEventListener("click", function (event) {
      var button = event.target.closest("[data-letter]");
      if (button) proposeLetter(button.dataset.letter);
    });
    $("#hintButton").addEventListener("click", requestHint);
    $("#solveButton").addEventListener("click", openSolveDialog);
    $("#nextRoundButton").addEventListener("click", function () {
      startNewRound(true);
      showMessage("Round " + state.roundNumber + " is ready. " + currentPlayer() + " has the first turn.", "success");
    });
    $("#closeSolveDialog").addEventListener("click", closeSolveDialog);
    $("#cancelSolveButton").addEventListener("click", function () {
      closeSolveDialog();
      showMessage("Complete-solution attempt canceled. The round continues.", "warning");
    });
    $("#solveForm").addEventListener("submit", submitSolution);
    $("#scoreList").addEventListener("click", function (event) {
      var button = event.target.closest("[data-score-name]");
      if (button) adjustScore(button.dataset.scoreName, Number(button.dataset.delta));
    });
    $("#roundResult").addEventListener("click", function (event) {
      var button = event.target.closest("[data-answer-audio]");
      if (!button) return;
      var entry = entryById[button.dataset.answerAudio];
      if (entry) playAnswerAudio(button, entry);
    });
    $("#soundToggleButton").addEventListener("click", updateSoundToggle);
    $("#soundVolumeInput").addEventListener("input", function (event) {
      soundSettings.volume = Math.max(0, Math.min(1, Number(event.target.value) / 100));
      Object.keys(audioCache).forEach(function (key) { audioCache[key].volume = soundSettings.volume; });
      saveSoundSettings();
    });
    $("#soundVolumeInput").addEventListener("change", function () {
      showMessage("Audio volume set to " + Math.round(soundSettings.volume * 100) + " percent.", "success");
    });
    document.addEventListener("keydown", handleKeyboard);
  }

  function initRosterImport() {
    if (!window.JaraLinguaRosterImport) return;
    window.JaraLinguaRosterImport.setup({
      fileInputId: "studentFileInput",
      textAreaId: "studentNamesInput",
      statusId: "rosterImportStatus",
      onNamesLoaded: function (names) {
        $("#rosterImportStatus").textContent = names.length + " participants imported.";
        showMessage(names.length + " participant names imported successfully.", "success");
      }
    });
  }

  function validateBank() {
    var expected = Number(DATA.expectedEntries) || 0;
    var incomplete = entries.filter(function (entry) {
      return !entry.answer || !entry.meaning || !entry.example || !entry.usage || entry.hints.length !== 3;
    });
    if (entries.length !== expected || incomplete.length) {
      showMessage("The Hangman learning bank did not load completely. Refresh the page before starting.", "error");
      return false;
    }
    return true;
  }

  function init() {
    populateCategories();
    hydrateSetup();
    bindEvents();
    initRosterImport();
    renderSoundControls();
    syncAuthUi(true);
    window.setInterval(function () { syncAuthUi(false); }, 1200);
    validateBank();
  }

  window.JaraLinguaEnglishHangmanDiagnostics = {
    categoryCount: (DATA.categories || []).length,
    entryCount: entries.length,
    expectedEntries: Number(DATA.expectedEntries) || 0,
    incompleteEntries: entries.filter(function (entry) {
      return !entry.answer || !entry.meaning || !entry.example || !entry.usage || entry.hints.length !== 3;
    }).length,
    answerType: answerType,
    normalizeSolution: normalizeSolution,
    solutionBonusForHintLevel: function (level) { return Math.max(1, 4 - Math.max(1, Number(level) || 1)); },
    poolCount: function (category, type) {
      return entries.filter(function (entry) {
        return (category === "all" || entry.categoryId === category) && (type === "all" || entry.type === type);
      }).length;
    },
    alphabetAudioUrl: function (letter) {
      var key = canonicalLetter(letter).toLowerCase();
      return /^[a-z]$/.test(key) ? ALPHABET_AUDIO_BASE + key + ".mp3" + AUDIO_VERSION : "";
    },
    answerAudioUrl: function (entryId) {
      return ANSWER_AUDIO_ENABLED && entryById[entryId] ? ANSWER_AUDIO_BASE + entryId + ".mp3" + AUDIO_VERSION : "";
    }
  };

  if (typeof document === "undefined") return;
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
