(function () {
  "use strict";

  var DATA = window.JaraLinguaHangmanB2 || { categories: [] };
  var STORAGE_KEY = "french8-hangman-game-v1";
  var SOUND_KEY = "french8-hangman-sound-v1";
  var GOOGLE_USER_KEY = "jaralingua_google_user";
  var MICROSOFT_USER_KEY = "jaralingua_microsoft_user";
  var LOCAL_USER_KEY = "jaralingua_local_user";
  var ROLE_REQUESTS_KEY = "jaralingua_role_requests";
  var ADMIN_EMAILS = ["cdavid.jaramillo@gmail.com"];
  var MAX_ERRORS = 6;
  var BASE_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  var ACCENT_LETTERS = "ÀÂÄÇÉÈÊËÎÏÔÖÙÛÜŸ".split("");
  var SFX_BASE = "../audio/sfx/pendu/";
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
  var state = loadState();
  var authState = { user: null, isLoggedIn: false, isTeacher: false };
  var lastAuthSignature = "";

  function $(selector) { return document.querySelector(selector); }

  function defaultState() {
    return {
      version: 1,
      status: "setup",
      roster: [],
      scores: {},
      targetScore: 10,
      category: "all",
      answerType: "all",
      strictAccents: false,
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
      if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.roster)) return defaultState();
      if (parsed.current && !entryById[parsed.current.entryId]) return defaultState();
      var restored = Object.assign(defaultState(), parsed);
      if (restored.current) {
        var restoredEntry = entryById[restored.current.entryId];
        var legacyHintLevel = restored.current.hintUsed ? 1 : 0;
        restored.current.hintLevel = Number.isFinite(Number(restored.current.hintLevel))
          ? Math.max(0, Math.floor(Number(restored.current.hintLevel)))
          : legacyHintLevel;
        if (restoredEntry.categoryId === "films-series") {
          restored.current.hintLevel = Math.max(1, restored.current.hintLevel);
        }
        restored.current.hintLevel = Math.min(restored.current.hintLevel, restoredEntry.hints.length);
        delete restored.current.hintUsed;
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
        return { enabled: saved.enabled !== false, volume: Math.max(0, Math.min(1, Number(saved.volume) || 0)) };
      }
    } catch (_error) {}
    return { enabled: true, volume: .7 };
  }

  function saveSoundSettings() {
    try { localStorage.setItem(SOUND_KEY, JSON.stringify(soundSettings)); } catch (_error) {}
  }

  function flattenEntries(categories) {
    var result = [];
    categories.forEach(function (category) {
      (category.entries || []).forEach(function (item, index) {
        result.push({
          id: category.id + "-" + (index + 1),
          categoryId: category.id,
          categoryLabel: category.label,
          categoryIcon: category.icon,
          answer: item.answer,
          clue: item.clue,
          hints: Array.isArray(item.hints) && item.hints.length ? item.hints.slice(0, 3) : [item.clue],
          type: answerType(item.answer)
        });
      });
    });
    return result;
  }

  function answerType(answer) {
    var lexical = String(answer || "")
      .replace(/^(le|la|les)\s+/i, "")
      .replace(/^l['’]/i, "")
      .trim();
    return lexical.split(/\s+/).filter(Boolean).length > 1 ? "expression" : "word";
  }

  function normalizeName(value) {
    return String(value || "").trim().replace(/\s+/g, " ");
  }

  function uniqueNames(value) {
    var seen = {};
    return String(value || "").split(/[\n,;]+/).map(normalizeName).filter(function (name) {
      var key = name.toLocaleLowerCase("fr");
      if (!name || seen[key]) return false;
      seen[key] = true;
      return true;
    }).slice(0, 60);
  }

  function fold(value) {
    return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
  }

  function canonicalLetter(letter) {
    var upper = String(letter || "").toUpperCase();
    return state.strictAccents ? upper : fold(upper);
  }

  function isLetter(char) {
    return /^[A-ZÀÂÄÇÉÈÊËÎÏÔÖÙÛÜŸ]$/i.test(char || "");
  }

  function normalizeSolution(value) {
    var normalized = String(value || "").trim().toLocaleLowerCase("fr");
    if (!state.strictAccents) normalized = normalized.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return normalized.replace(/[^a-zàâäçéèêëîïôöùûüÿ0-9]+/gi, "");
  }

  function autoRevealedIndexes(answer) {
    var revealed = {};
    var match = String(answer || "").match(/^(le|la|les)\s+/i) || String(answer || "").match(/^l['’]/i);
    if (match) {
      for (var i = 0; i < match[0].length; i += 1) revealed[i] = true;
    }
    return revealed;
  }

  function initialArticleGuesses(answer) {
    var indexes = autoRevealedIndexes(answer);
    var guesses = [];
    Array.from(String(answer || "")).forEach(function (char, index) {
      if (!indexes[index] || !isLetter(char)) return;
      var key = canonicalLetter(char);
      if (guesses.indexOf(key) === -1) guesses.push(key);
    });
    return guesses;
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
    if (autoRevealedIndexes(entry.answer)[index]) return true;
    return (state.current.guesses || []).indexOf(canonicalLetter(char)) !== -1;
  }

  function isSolved(entry) {
    return Array.from(entry.answer).every(function (_char, index) { return isIndexRevealed(entry, index); });
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
    if (id === "all") return "Mélange B2";
    var category = (DATA.categories || []).filter(function (item) { return item.id === id; })[0];
    return category ? category.label : "Catégorie B2";
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

  function playSfx(name) {
    if (!soundSettings.enabled || !SFX[name]) return;
    try {
      if (!audioCache[name]) {
        audioCache[name] = new Audio(SFX_BASE + SFX[name]);
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
    if (trigger) trigger.click();
    else showMessage("Utilisez le bouton de connexion JaraLingua pour entrer avec votre compte professeur.", "warning");
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
    (DATA.categories || []).forEach(function (category) {
      var option = document.createElement("option");
      option.value = category.id;
      option.textContent = category.label + " (" + category.entries.length + ")";
      select.appendChild(option);
    });
  }

  function hydrateSetup() {
    $("#studentNamesInput").value = (state.roster || []).join("\n");
    $("#categorySelect").value = state.category || "all";
    $("#answerTypeSelect").value = state.answerType || "all";
    $("#targetScoreInput").value = state.targetScore || 10;
    $("#strictAccentsInput").checked = Boolean(state.strictAccents);
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
    var chars = Array.from(entry.answer);
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
        slot.setAttribute("aria-label", revealed || !isLetter(char) ? char : "lettre cachée");
        token.appendChild(slot);
        index += 1;
      });
      board.appendChild(token);
    });
    board.setAttribute("aria-label", state.current.status === "active" ? "Mot ou expression à découvrir" : "Solution : " + entry.answer);
  }

  function renderKeyboard(entry) {
    var guesses = state.current.guesses || [];
    [
      { target: $("#baseKeyboard"), letters: BASE_LETTERS },
      { target: $("#accentKeyboard"), letters: ACCENT_LETTERS }
    ].forEach(function (group) {
      group.target.innerHTML = "";
      group.letters.forEach(function (letter) {
        var key = document.createElement("button");
        var canonical = canonicalLetter(letter);
        var used = guesses.indexOf(canonical) !== -1;
        key.type = "button";
        key.className = "letter-key";
        key.textContent = letter;
        key.dataset.letter = letter;
        key.disabled = state.current.status !== "active" || used;
        key.setAttribute("aria-label", "Proposer la lettre " + letter);
        if (used) key.classList.add(answerContains(entry, letter) ? "correct" : "wrong");
        group.target.appendChild(key);
      });
    });
    $("#accentKeyboard").hidden = !state.strictAccents;
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
      actions.innerHTML = '<button type="button" data-score-name="" data-delta="-1" title="Retirer un point" aria-label="Retirer un point"><i class="bi bi-dash-lg"></i></button><button type="button" data-score-name="" data-delta="1" title="Ajouter un point" aria-label="Ajouter un point"><i class="bi bi-plus-lg"></i></button>';
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
      empty.textContent = "Aucune manche terminée.";
      list.appendChild(empty);
      return;
    }
    state.history.slice().reverse().forEach(function (item) {
      var line = document.createElement("li");
      line.textContent = "Manche " + item.round + " · " + item.answer + " · " + (item.success ? "trouvé par " + item.player : "non trouvé");
      list.appendChild(line);
    });
  }

  function renderRoundResult(entry) {
    var result = $("#roundResult");
    if (state.current.status === "active") {
      result.hidden = true;
      result.innerHTML = "";
      return;
    }
    result.hidden = false;
    var title = document.createElement("h3");
    title.textContent = state.current.success ? "Solution trouvée" : "Manche terminée";
    var solution = document.createElement("p");
    solution.className = "solution";
    solution.textContent = entry.answer;
    var clue = document.createElement("p");
    clue.textContent = entry.clue;
    result.innerHTML = "";
    result.appendChild(title);
    result.appendChild(solution);
    result.appendChild(clue);
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
    panel.querySelector("h3").textContent = winners.length > 1 ? "Victoire partagée : " + winners.join(" et ") : "Victoire de " + winners[0];
    panel.querySelector("p").textContent = maximum + " points · objectif atteint";
    addConfetti(panel);
  }

  function addConfetti(panel) {
    if (panel.querySelector(".confetti-piece")) return;
    var colors = ["#f4c95d", "#d62839", "#36b38c", "#ffffff", "#7ab8ff"];
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
    button.setAttribute("aria-label", soundSettings.enabled ? "Couper les effets sonores" : "Activer les effets sonores");
    $("#soundVolumeInput").value = Math.round(soundSettings.volume * 100);
  }

  function renderGame() {
    if (!state.current) return;
    var entry = entryById[state.current.entryId];
    if (!entry) return;
    $("#currentPlayerName").textContent = state.current.status === "active" ? currentPlayer() : "Manche terminée";
    $("#roundCounter").textContent = "Manche " + state.roundNumber;
    $("#currentCategory").innerHTML = '<i class="bi ' + entry.categoryIcon + '"></i> ' + escapeHtml(entry.categoryLabel);
    $("#gallows").dataset.errors = String(state.current.errors || 0);
    $("#gallows").setAttribute("aria-label", (state.current.errors || 0) + " erreur" + ((state.current.errors || 0) === 1 ? "" : "s") + " sur six");
    $("#mistakeCount").textContent = String(state.current.errors || 0);
    $("#modeSummary").textContent = categoryLabel(state.category) + " · " + state.targetScore + " points" + (state.strictAccents ? " · accents stricts" : " · accents accompagnés");
    $("#scoreTargetLabel").textContent = state.targetScore + " points";
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

  function renderClues(entry) {
    var panel = $("#cluePanel");
    var button = $("#hintButton");
    var level = Math.max(0, Math.min(Number(state.current.hintLevel) || 0, entry.hints.length));
    var visibleHints = entry.hints.slice(0, level);

    if (!visibleHints.length) {
      panel.innerHTML = "<strong>Indice :</strong> caché. Le demander ajoute une erreur et fait passer le tour.";
    } else {
      var heading = entry.hints.length > 1 ? "Indices progressifs" : "Indice";
      var note = entry.categoryId === "films-series" && level === 1
        ? '<p class="clue-note">Le premier indice est offert. Les suivants ajoutent une erreur et font passer le tour.</p>'
        : "";
      panel.innerHTML = '<strong class="clue-heading">' + heading + ' :</strong><ol class="progressive-clues">' + visibleHints.map(function (hint, index) {
        return '<li><span>Indice ' + (index + 1) + '</span><p>' + escapeHtml(hint) + '</p></li>';
      }).join("") + "</ol>" + note;
    }

    var nextLevel = level + 1;
    var labels = ["Demander un indice", "Donner le deuxième indice", "Donner le troisième indice"];
    var buttonText = nextLevel <= entry.hints.length ? labels[nextLevel - 1] : "Tous les indices sont visibles";
    button.innerHTML = '<i class="bi bi-search"></i> ' + buttonText;
    button.setAttribute("aria-label", buttonText);
    button.disabled = state.current.status !== "active" || level >= entry.hints.length;
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>'"]/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char];
    });
  }

  function startGame() {
    if (!authState.isTeacher) {
      showMessage("Cette commande est réservée au professeur connecté.", "error");
      return;
    }
    var roster = uniqueNames($("#studentNamesInput").value);
    if (!roster.length) {
      showMessage("Ajoutez au moins un participant avant de commencer.", "error");
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
    state.strictAccents = $("#strictAccentsInput").checked;
    state.order = shuffle(roster);
    state.turnIndex = 0;
    if (!selectedPool().length) {
      showMessage("Cette combinaison ne contient aucune réponse. Choisissez un autre format ou une autre catégorie.", "error");
      state.status = "setup";
      return;
    }
    hideMessage();
    startNewRound(false);
    playSfx("start");
    showMessage("Partie lancée. " + currentPlayer() + " commence la première manche.", "success");
  }

  function startNewRound(playTurnSound) {
    var pool = selectedPool();
    var available = pool.filter(function (entry) { return state.usedIds.indexOf(entry.id) === -1; });
    if (!available.length) {
      var poolIds = pool.map(function (entry) { return entry.id; });
      state.usedIds = state.usedIds.filter(function (id) { return poolIds.indexOf(id) === -1; });
      available = pool.slice();
      showMessage("Toutes les réponses de cette sélection ont été utilisées. Le paquet recommence sans modifier les scores.", "warning");
    }
    var entry = available[secureRandomIndex(available.length)];
    state.usedIds.push(entry.id);
    state.roundNumber += 1;
    state.status = "active";
    state.current = {
      entryId: entry.id,
      guesses: initialArticleGuesses(entry.answer),
      errors: 0,
      hintLevel: entry.categoryId === "films-series" ? 1 : 0,
      status: "active",
      success: false
    };
    saveState();
    renderModePanels();
    if (playTurnSound) playSfx("turn");
  }

  function finishRound(success, player, reason) {
    var entry = entryById[state.current.entryId];
    state.current.status = "complete";
    state.current.success = Boolean(success);
    state.current.player = player || "";
    state.current.reason = reason || "";
    state.history.push({ round: state.roundNumber, answer: entry.answer, success: Boolean(success), player: player || "la classe" });
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
      showMessage("Cette lettre a déjà été proposée.", "warning");
      return;
    }
    hideMessage();
    state.current.guesses.push(key);
    var player = currentPlayer();
    if (answerContains(entry, letter)) {
      state.scores[player] = Number(state.scores[player] || 0) + 1;
      if (isSolved(entry)) {
        finishRound(true, player, "lettres complétées");
        return;
      }
      saveState();
      renderGame();
      playSfx("correct");
      showMessage("Bonne lettre : " + player + " gagne 1 point et conserve le tour.", "success");
      return;
    }
    state.current.errors += 1;
    if (state.current.errors >= MAX_ERRORS) {
      finishRound(false, "", "six erreurs");
      showMessage("Six erreurs : la solution était « " + entry.answer + " ».", "error");
      return;
    }
    advanceTurn();
    saveState();
    renderGame();
    playSfx("wrong");
    showMessage("Cette lettre n'apparaît pas. Le tour passe à " + currentPlayer() + ".", "error");
  }

  function requestHint() {
    if (!state.current || state.current.status !== "active") return;
    var entry = entryById[state.current.entryId];
    var currentLevel = Math.max(0, Number(state.current.hintLevel) || 0);
    if (currentLevel >= entry.hints.length) return;
    var nextLevel = currentLevel + 1;
    var ordinals = ["premier", "deuxième", "troisième"];
    if (!window.confirm("Afficher le " + ordinals[nextLevel - 1] + " indice ajoutera une erreur et fera passer le tour. Continuer ?")) return;
    state.current.hintLevel = nextLevel;
    state.current.errors += 1;
    if (state.current.errors >= MAX_ERRORS) {
      finishRound(false, "", "indice demandé à la sixième erreur");
      showMessage("L'indice a complété la sixième erreur. La solution était « " + entry.answer + " ».", "error");
      return;
    }
    advanceTurn();
    saveState();
    renderGame();
    playSfx("wrong");
    showMessage("Indice " + nextLevel + " révélé. Le tour passe à " + currentPlayer() + ".", "warning");
  }

  function openSolveDialog() {
    if (!state.current || state.current.status !== "active") return;
    $("#solutionInput").value = "";
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
      $("#solutionInput").focus();
      return;
    }
    closeSolveDialog();
    var player = currentPlayer();
    if (normalizeSolution(proposal) === normalizeSolution(entry.answer)) {
      state.scores[player] = Number(state.scores[player] || 0) + 3;
      finishRound(true, player, "solution complète");
      showMessage("Solution correcte : " + player + " gagne 3 points.", "success");
      return;
    }
    state.current.errors += 1;
    if (state.current.errors >= MAX_ERRORS) {
      finishRound(false, "", "six erreurs");
      showMessage("La proposition est incorrecte et termine la manche. La solution était « " + entry.answer + " ».", "error");
      return;
    }
    advanceTurn();
    saveState();
    renderGame();
    playSfx("wrong");
    showMessage("La proposition complète est incorrecte. Le tour passe à " + currentPlayer() + ".", "error");
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
    showMessage("Score de " + name + " ajusté à " + state.scores[name] + ".", "success");
  }

  function resetMatch(clearRoster) {
    var prompt = clearRoster ? "Effacer toute la partie, les noms et les scores ?" : "Terminer cette partie et revenir à la préparation ? Les scores seront remis à zéro.";
    if (!window.confirm(prompt)) return;
    var roster = clearRoster ? [] : state.roster.slice();
    var settings = { category: state.category, answerType: state.answerType, targetScore: state.targetScore, strictAccents: state.strictAccents };
    state = defaultState();
    state.roster = roster;
    if (!clearRoster) Object.assign(state, settings);
    saveState();
    hydrateSetup();
    hideMessage();
    renderModePanels();
    showMessage(clearRoster ? "Toutes les données locales du jeu ont été effacées." : "Nouvelle partie prête. La liste des participants a été conservée.", "success");
  }

  function updateSoundToggle() {
    soundSettings.enabled = !soundSettings.enabled;
    saveSoundSettings();
    renderSoundControls();
    if (soundSettings.enabled) playSfx("correct");
  }

  function handleKeyboard(event) {
    if (!authState.isTeacher || state.status !== "active") return;
    var target = event.target;
    if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
    if ($("#solveDialog").open) return;
    if (event.key && event.key.length === 1 && isLetter(event.key)) proposeLetter(event.key);
  }

  function bindEvents() {
    $("#openAuthButton").addEventListener("click", openAuthPanel);
    $("#importStudentsButton").addEventListener("click", function () { $("#studentFileInput").click(); });
    $("#sampleStudentsButton").addEventListener("click", function () {
      $("#studentNamesInput").value = ["Ana", "Paul", "Sofia", "Lucas", "Chloé", "Hugo"].join("\n");
      showMessage("Liste d'exemple chargée. Vous pouvez la modifier avant de commencer.", "success");
    });
    $("#startGameButton").addEventListener("click", startGame);
    $("#clearSavedButton").addEventListener("click", function () { resetMatch(true); });
    $("#resetMatchButton").addEventListener("click", function () { resetMatch(false); });
    $("#letterKeyboard").addEventListener("click", function (event) {
      var button = event.target.closest("[data-letter]");
      if (button) proposeLetter(button.dataset.letter);
    });
    $("#hintButton").addEventListener("click", requestHint);
    $("#solveButton").addEventListener("click", openSolveDialog);
    $("#nextRoundButton").addEventListener("click", function () { startNewRound(true); });
    $("#closeSolveDialog").addEventListener("click", closeSolveDialog);
    $("#cancelSolveButton").addEventListener("click", closeSolveDialog);
    $("#solveForm").addEventListener("submit", submitSolution);
    $("#scoreList").addEventListener("click", function (event) {
      var button = event.target.closest("[data-score-name]");
      if (button) adjustScore(button.dataset.scoreName, Number(button.dataset.delta));
    });
    $("#soundToggleButton").addEventListener("click", updateSoundToggle);
    $("#soundVolumeInput").addEventListener("input", function (event) {
      soundSettings.volume = Math.max(0, Math.min(1, Number(event.target.value) / 100));
      saveSoundSettings();
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
        $("#rosterImportStatus").textContent = names.length + " participants importés.";
      }
    });
  }

  function init() {
    populateCategories();
    hydrateSetup();
    bindEvents();
    initRosterImport();
    renderSoundControls();
    syncAuthUi(true);
    window.setInterval(function () { syncAuthUi(false); }, 1200);
    if (entries.length !== 105) showMessage("La banque B2 n'a pas chargé toutes ses réponses. Rechargez la page.", "error");
  }

  window.JaraLinguaHangmanDiagnostics = {
    categoryCount: (DATA.categories || []).length,
    entryCount: entries.length,
    answerType: answerType,
    poolCount: function (category, type) {
      return entries.filter(function (entry) {
        return (category === "all" || entry.categoryId === category) && (type === "all" || entry.type === type);
      }).length;
    },
    normalizeSolution: function (value, strict) {
      var previous = state.strictAccents;
      state.strictAccents = Boolean(strict);
      var normalized = normalizeSolution(value);
      state.strictAccents = previous;
      return normalized;
    },
    initialArticleGuesses: function (answer, strict) {
      var previous = state.strictAccents;
      state.strictAccents = Boolean(strict);
      var guesses = initialArticleGuesses(answer);
      state.strictAccents = previous;
      return guesses;
    }
  };

  if (typeof document === "undefined") return;
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
