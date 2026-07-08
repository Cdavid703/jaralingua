(function () {
  "use strict";

  var API = "/api/french8/imposteur";
  var STATE_API = "/api/french8/imposteur/state";
  var STORAGE_KEY = "french8-imposteur-live-state";
  var SOUND_STORAGE_KEY = "french8-imposteur-sound-enabled";
  var POLL_MS = 1800;
  var QR_VERSION = 3;
  var QR_SIZE = 29;
  var QR_DATA_CODEWORDS = 55;
  var QR_ECC_CODEWORDS = 15;
  var SFX_BASE = "../audio/sfx/imposteur/";
  var SFX = {
    roomCreated: "room-created.mp3",
    rolesDistributed: "roles-distributed.mp3",
    roleConfirmed: "role-confirmed.mp3",
    suspectFound: "suspect-found.mp3",
    voteSubmitted: "vote-submitted.mp3",
    resultRevealed: "result-revealed.mp3"
  };

  var localState = loadLocalState();
  var soundEnabled = loadSoundPreference();
  var sfxCache = {};
  var pollTimer = null;
  var lastPayload = null;

  function $(selector) {
    return document.querySelector(selector);
  }

  function loadLocalState() {
    try {
      var parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (_error) {
      return {};
    }
  }

  function saveLocalState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(localState));
    } catch (_error) {}
  }

  function stopPolling() {
    if (pollTimer) window.clearInterval(pollTimer);
    pollTimer = null;
  }

  function cleanRoomCode(value) {
    return String(value || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
  }

  function applyRoomFromUrl() {
    try {
      var params = new URLSearchParams(window.location.search || "");
      var roomCode = cleanRoomCode(params.get("room") || params.get("r"));
      if (!roomCode) return;
      if (localState.roomCode !== roomCode) {
        localState = { roomCode: roomCode };
      } else {
        localState.roomCode = roomCode;
      }
      saveLocalState();
    } catch (_error) {}
  }

  function loadSoundPreference() {
    try {
      return localStorage.getItem(SOUND_STORAGE_KEY) !== "0";
    } catch (_error) {
      return true;
    }
  }

  function saveSoundPreference() {
    try {
      localStorage.setItem(SOUND_STORAGE_KEY, soundEnabled ? "1" : "0");
    } catch (_error) {}
  }

  function sfxAudio(name) {
    if (!SFX[name]) return null;
    if (!sfxCache[name]) {
      var audio = new Audio(SFX_BASE + SFX[name]);
      audio.preload = "auto";
      audio.volume = 0.52;
      sfxCache[name] = audio;
    }
    return sfxCache[name];
  }

  function preloadSfx() {
    Object.keys(SFX).forEach(function (name) {
      var audio = sfxAudio(name);
      if (audio) audio.load();
    });
  }

  function playSfx(name) {
    if (!soundEnabled) return;
    var audio = sfxAudio(name);
    if (!audio) return;
    try {
      audio.pause();
      audio.currentTime = 0;
      var playPromise = audio.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    } catch (_error) {}
  }

  function syncSoundToggle() {
    var toggle = $("#soundToggle");
    if (toggle) toggle.checked = soundEnabled;
  }

  function ensureSoundToggle() {
    if ($("#soundToggle")) return;
    var statusHint = $("#statusHint");
    if (!statusHint) return;
    var label = document.createElement("label");
    label.className = "sound-toggle";
    label.setAttribute("for", "soundToggle");
    label.innerHTML = '<span><i class="bi bi-volume-up-fill"></i> Effets sonores</span><input type="checkbox" id="soundToggle" checked>';
    statusHint.insertAdjacentElement("afterend", label);
  }

  function ensureQrPanel() {
    if ($("#roomQrPanel")) return;
    var roomCode = $(".room-code");
    if (!roomCode) return;
    var panel = document.createElement("div");
    panel.className = "qr-panel";
    panel.id = "roomQrPanel";
    panel.hidden = true;
    panel.innerHTML = '<div class="qr-copy"><div><p class="section-kicker mb-1">Accès par QR</p><h3>Scanner pour entrer</h3><p>Les étudiants scannent ce code, écrivent leur prénom et rejoignent directement cette salle.</p></div><div class="qr-code-box" id="roomQrCode" aria-label="Code QR de la salle"></div></div><a class="qr-link" id="roomQrLink" href="#" target="_blank" rel="noopener">Ouvrir le lien étudiant</a><button type="button" class="btn-soft w-100" id="copyRoomLinkBtn"><i class="bi bi-link-45deg"></i> Copier le lien étudiant</button>';
    roomCode.insertAdjacentElement("afterend", panel);
  }

  function ensureRoomLifecycleButtons() {
    var resetButton = $("#resetBtn");
    if (resetButton) {
      resetButton.className = "btn-soft";
      resetButton.innerHTML = '<i class="bi bi-arrow-counterclockwise"></i> Réinitialiser la salle';
    }
    if ($("#closeRoomBtn") || !resetButton) return;
    var closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "btn-danger-soft";
    closeButton.id = "closeRoomBtn";
    closeButton.innerHTML = '<i class="bi bi-x-circle"></i> Fermer / quitter la salle';
    resetButton.insertAdjacentElement("afterend", closeButton);
  }

  function studentRoomUrl(roomCode) {
    var code = cleanRoomCode(roomCode);
    var origin = window.location.origin && window.location.origin !== "null" ? window.location.origin : "";
    if (origin) return origin + "/i.html?r=" + encodeURIComponent(code);
    var url = new URL(window.location.href);
    url.searchParams.set("room", code);
    url.hash = "jeu";
    return url.toString();
  }

  function renderRoomQr(payload) {
    var panel = $("#roomQrPanel");
    var qrCode = $("#roomQrCode");
    var link = $("#roomQrLink");
    var isTeacher = Boolean(payload && payload.teacher && payload.teacher.ok);
    var room = payload && payload.room ? payload.room : {};
    var roomCode = cleanRoomCode(room.code || localState.roomCode);
    if (!panel || !qrCode || !link) return;
    if (!isTeacher || !roomCode) {
      panel.hidden = true;
      qrCode.innerHTML = "";
      link.removeAttribute("href");
      return;
    }
    var url = studentRoomUrl(roomCode);
    panel.hidden = false;
    qrCode.innerHTML = createQrSvg(url);
    link.href = url;
  }

  function copyStudentLink() {
    if (!localState.roomCode || !navigator.clipboard) return;
    navigator.clipboard.writeText(studentRoomUrl(localState.roomCode)).then(function () {
      showMessage("Lien étudiant copié.", "success");
    });
  }

  function createQrSvg(text) {
    try {
      var modules = makeQrModules(String(text || ""));
      var border = 4;
      var viewSize = QR_SIZE + border * 2;
      var path = "";
      for (var y = 0; y < QR_SIZE; y += 1) {
        for (var x = 0; x < QR_SIZE; x += 1) {
          if (modules[y][x]) path += "M" + (x + border) + "," + (y + border) + "h1v1h-1z";
        }
      }
      return '<svg class="qr-svg" viewBox="0 0 ' + viewSize + " " + viewSize + '" role="img" aria-label="Code QR de la salle" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#fff"/><path d="' + path + '" fill="#111827" shape-rendering="crispEdges"/></svg>';
    } catch (_error) {
      return '<p class="qr-error">Code QR indisponible. Copie le lien étudiant.</p>';
    }
  }

  function makeQrModules(text) {
    var modules = emptyMatrix(false);
    var reserved = emptyMatrix(false);
    function setFunction(x, y, dark) {
      if (x < 0 || y < 0 || x >= QR_SIZE || y >= QR_SIZE) return;
      modules[y][x] = Boolean(dark);
      reserved[y][x] = true;
    }

    drawFinder(setFunction, 0, 0);
    drawFinder(setFunction, QR_SIZE - 7, 0);
    drawFinder(setFunction, 0, QR_SIZE - 7);
    drawAlignment(setFunction, 22, 22);
    drawTiming(setFunction);
    drawFormatBits(setFunction, 0);

    var data = qrDataCodewords(text);
    var ecc = reedSolomonRemainder(data, reedSolomonDivisor(QR_ECC_CODEWORDS));
    var bits = codewordsToBits(data.concat(ecc));
    var bitIndex = 0;
    var upward = true;
    for (var right = QR_SIZE - 1; right >= 1; right -= 2) {
      if (right === 6) right -= 1;
      for (var vert = 0; vert < QR_SIZE; vert += 1) {
        var y = upward ? QR_SIZE - 1 - vert : vert;
        for (var j = 0; j < 2; j += 1) {
          var x = right - j;
          if (reserved[y][x]) continue;
          var dark = bitIndex < bits.length ? bits[bitIndex] === 1 : false;
          bitIndex += 1;
          if ((x + y) % 2 === 0) dark = !dark;
          modules[y][x] = dark;
        }
      }
      upward = !upward;
    }
    drawFormatBits(setFunction, 0);
    return modules;
  }

  function emptyMatrix(value) {
    var matrix = [];
    for (var y = 0; y < QR_SIZE; y += 1) {
      matrix.push(new Array(QR_SIZE).fill(value));
    }
    return matrix;
  }

  function drawFinder(setFunction, left, top) {
    for (var y = -1; y <= 7; y += 1) {
      for (var x = -1; x <= 7; x += 1) {
        var xx = left + x;
        var yy = top + y;
        var dark = x >= 0 && x <= 6 && y >= 0 && y <= 6 &&
          (x === 0 || x === 6 || y === 0 || y === 6 || (x >= 2 && x <= 4 && y >= 2 && y <= 4));
        setFunction(xx, yy, dark);
      }
    }
  }

  function drawAlignment(setFunction, centerX, centerY) {
    for (var y = -2; y <= 2; y += 1) {
      for (var x = -2; x <= 2; x += 1) {
        var distance = Math.max(Math.abs(x), Math.abs(y));
        setFunction(centerX + x, centerY + y, distance === 2 || distance === 0);
      }
    }
  }

  function drawTiming(setFunction) {
    for (var i = 8; i < QR_SIZE - 8; i += 1) {
      setFunction(6, i, i % 2 === 0);
      setFunction(i, 6, i % 2 === 0);
    }
  }

  function drawFormatBits(setFunction, mask) {
    var bits = qrFormatBits(mask);
    function bit(index) {
      return ((bits >>> index) & 1) !== 0;
    }
    for (var i = 0; i <= 5; i += 1) setFunction(8, i, bit(i));
    setFunction(8, 7, bit(6));
    setFunction(8, 8, bit(7));
    setFunction(7, 8, bit(8));
    for (var j = 9; j < 15; j += 1) setFunction(14 - j, 8, bit(j));
    for (var k = 0; k < 8; k += 1) setFunction(QR_SIZE - 1 - k, 8, bit(k));
    for (var m = 8; m < 15; m += 1) setFunction(8, QR_SIZE - 15 + m, bit(m));
    setFunction(8, QR_SIZE - 8, true);
  }

  function qrFormatBits(mask) {
    var data = (1 << 3) | mask;
    var rem = data;
    for (var i = 0; i < 10; i += 1) {
      rem = (rem << 1) ^ (((rem >>> 9) & 1) ? 0x537 : 0);
    }
    return ((data << 10) | rem) ^ 0x5412;
  }

  function qrDataCodewords(text) {
    var bytes = utf8Bytes(text);
    var bits = [];
    pushBits(bits, 0x4, 4);
    pushBits(bits, bytes.length, 8);
    bytes.forEach(function (byte) { pushBits(bits, byte, 8); });
    var capacityBits = QR_DATA_CODEWORDS * 8;
    if (bits.length > capacityBits) throw new Error("qr_data_too_long");
    pushBits(bits, 0, Math.min(4, capacityBits - bits.length));
    while (bits.length % 8 !== 0) bits.push(0);
    var data = [];
    for (var i = 0; i < bits.length; i += 8) {
      var value = 0;
      for (var j = 0; j < 8; j += 1) value = (value << 1) | bits[i + j];
      data.push(value);
    }
    var pad = 0xec;
    while (data.length < QR_DATA_CODEWORDS) {
      data.push(pad);
      pad = pad === 0xec ? 0x11 : 0xec;
    }
    return data;
  }

  function pushBits(bits, value, length) {
    for (var i = length - 1; i >= 0; i -= 1) bits.push((value >>> i) & 1);
  }

  function utf8Bytes(text) {
    if (typeof TextEncoder !== "undefined") return Array.prototype.slice.call(new TextEncoder().encode(text));
    return unescape(encodeURIComponent(text)).split("").map(function (char) { return char.charCodeAt(0); });
  }

  function codewordsToBits(codewords) {
    var bits = [];
    codewords.forEach(function (codeword) { pushBits(bits, codeword, 8); });
    return bits;
  }

  function reedSolomonDivisor(degree) {
    var result = new Array(degree).fill(0);
    result[degree - 1] = 1;
    var root = 1;
    for (var i = 0; i < degree; i += 1) {
      for (var j = 0; j < result.length; j += 1) {
        result[j] = gfMultiply(result[j], root);
        if (j + 1 < result.length) result[j] ^= result[j + 1];
      }
      root = gfMultiply(root, 2);
    }
    return result;
  }

  function reedSolomonRemainder(data, divisor) {
    var result = new Array(divisor.length).fill(0);
    data.forEach(function (byte) {
      var factor = byte ^ result.shift();
      result.push(0);
      divisor.forEach(function (coefficient, index) {
        result[index] ^= gfMultiply(coefficient, factor);
      });
    });
    return result;
  }

  function gfMultiply(x, y) {
    var z = 0;
    while (y !== 0) {
      if ((y & 1) !== 0) z ^= x;
      x <<= 1;
      if ((x & 0x100) !== 0) x ^= 0x11d;
      y >>>= 1;
    }
    return z;
  }

  function setText(selector, value) {
    var node = $(selector);
    if (node) node.textContent = value == null ? "" : String(value);
  }

  function setHtml(selector, value) {
    var node = $(selector);
    if (node) node.innerHTML = value || "";
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function statusLabel(status) {
    return {
      waiting: "Salle d'attente",
      briefing: "Distribution secrète",
      discussion: "Discussion en cours",
      voting: "Vote ouvert",
      revealed: "Résultat révélé"
    }[status] || "Salle d'attente";
  }

  function statusHint(status) {
    return {
      waiting: "Le professeur crée la salle et les étudiants entrent avec leur prénom.",
      briefing: "Chaque étudiant consulte sa carte privée et confirme qu'il a reçu son rôle.",
      discussion: "Les étudiants discutent en français sans révéler directement le mot secret.",
      voting: "Le professeur a ouvert le vote : chacun choisit la personne qui semble être l'imposteur.",
      revealed: "La classe peut comparer les votes, le mot secret et le rôle de l'imposteur."
    }[status] || "";
  }

  async function request(action, payload) {
    var response = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.assign({ action: action }, payload || {}))
    });
    var data = await response.json().catch(function () { return {}; });
    if (!response.ok) {
      var error = new Error(data.error || "request_failed");
      error.data = data;
      throw error;
    }
    return data;
  }

  async function getState() {
    if (!localState.roomCode) return null;
    var params = new URLSearchParams({ room: localState.roomCode });
    if (localState.playerToken) params.set("playerToken", localState.playerToken);
    if (localState.teacherToken) params.set("teacherToken", localState.teacherToken);
    var response = await fetch(STATE_API + "?" + params.toString(), { cache: "no-store" });
    var data = await response.json().catch(function () { return {}; });
    if (!response.ok) {
      if (data.error === "room_not_found") {
        localState = {};
        saveLocalState();
        renderEmpty();
      }
      throw new Error(data.error || "state_failed");
    }
    return data;
  }

  function showMessage(text, type) {
    var node = $("#statusMessage");
    if (!node) return;
    node.className = "status-message " + (type || "info");
    node.textContent = text || "";
    node.hidden = !text;
  }

  function applyStoredFields() {
    var roomInput = $("#roomCode");
    var teacherRoomInput = $("#teacherRoomCode");
    if (roomInput) roomInput.value = localState.roomCode || "";
    if (teacherRoomInput) teacherRoomInput.value = localState.roomCode || "";
  }

  function clearRoomUrl() {
    try {
      var url = new URL(window.location.href);
      var changed = false;
      if (url.searchParams.has("room")) {
        url.searchParams.delete("room");
        changed = true;
      }
      if (url.searchParams.has("r")) {
        url.searchParams.delete("r");
        changed = true;
      }
      if (changed && window.history && window.history.replaceState) {
        window.history.replaceState(null, "", url.pathname + url.search + url.hash);
      }
    } catch (_error) {}
  }

  function clearCurrentRoom(message, type) {
    stopPolling();
    localState = {};
    lastPayload = null;
    saveLocalState();
    clearRoomUrl();
    renderEmpty();
    applyStoredFields();
    showMessage(message || "Salle quittée. Tu peux créer ou rejoindre une autre salle.", type || "success");
  }

  function startPolling() {
    stopPolling();
    pollTimer = window.setInterval(refreshState, POLL_MS);
  }

  async function refreshState() {
    if (!localState.roomCode) {
      renderEmpty();
      return;
    }
    try {
      lastPayload = await getState();
      render(lastPayload);
    } catch (error) {
      showMessage(messageForError(error), "error");
    }
  }

  function messageForError(error) {
    var code = error && (error.message || (error.data && error.data.error));
    return {
      room_not_found: "Salle introuvable. Vérifie le code.",
      name_required: "Écris ton prénom ou ton nom avant d'entrer.",
      name_taken: "Ce nom est déjà utilisé dans cette salle. Ajoute une initiale.",
      room_full: "La salle est pleine.",
      not_enough_players: "Il faut au moins quatre joueurs pour lancer la partie.",
      teacher_required: "Commande réservée au professeur qui a créé la salle.",
      not_in_briefing: "Cette action n'est disponible que pendant la distribution secrète.",
      vote_not_available: "Le vote ne peut pas être ouvert à ce moment.",
      vote_closed: "Le vote n'est pas ouvert.",
      invalid_suspect: "Choisis un joueur valide.",
      self_vote_forbidden: "Tu ne peux pas voter pour toi-même.",
      reveal_not_available: "Le résultat ne peut pas encore être révélé."
    }[code] || "Action impossible pour le moment. Réessaie dans quelques secondes.";
  }

  function renderEmpty() {
    setText("#roomCodeDisplay", "----");
    setText("#statusLabel", "Aucune salle");
    setText("#statusHint", "Crée une salle ou entre un code pour rejoindre la partie.");
    setText("#playerCount", "0");
    setText("#readyCount", "0");
    setText("#voteCount", "0");
    setHtml("#playersList", '<li class="muted-line">Aucun joueur connecté.</li>');
    setHtml("#roleCard", waitingRoleMarkup());
    setHtml("#votePanel", "");
    setHtml("#resultPanel", "");
    renderRoomQr(null);
    updateTeacherButtons(null);
    applyStoredFields();
  }

  function render(payload) {
    var room = payload.room || {};
    setText("#roomCodeDisplay", room.code || "----");
    setText("#statusLabel", statusLabel(room.status));
    setText("#statusHint", statusHint(room.status));
    setText("#playerCount", room.playerCount || 0);
    setText("#readyCount", (room.readyCount || 0) + "/" + (room.playerCount || 0));
    setText("#voteCount", (room.voteCount || 0) + "/" + (room.playerCount || 0));
    renderPlayers(payload.players || [], room.status);
    renderRole(payload);
    renderVote(payload);
    renderResult(payload);
    renderRoomQr(payload);
    updateTeacherButtons(payload);
    applyStoredFields();
  }

  function renderPlayers(players, status) {
    if (!players.length) {
      setHtml("#playersList", '<li class="muted-line">Aucun joueur connecté.</li>');
      return;
    }
    setHtml("#playersList", players.map(function (player) {
      var state = status === "voting"
        ? (player.hasVoted ? "A voté" : "Vote attendu")
        : (player.ready ? "Rôle reçu" : "En attente");
      var role = player.role ? '<span class="role-chip">' + escapeHtml(player.role === "impostor" ? "imposteur" : "citoyen") + "</span>" : "";
      return '<li><span><i class="bi bi-person-circle"></i> ' + escapeHtml(player.name) + role + '</span><em>' + state + '</em></li>';
    }).join(""));
  }

  function waitingRoleMarkup() {
    return '<article class="private-card waiting">' +
      '<img src="../img/ateliers/jeu-imposteur-role-citoyen.png" alt="Carte privée en attente">' +
      '<div><p class="section-kicker">Carte privée</p><h3>En attente du rôle</h3>' +
      '<p>Quand le professeur distribuera les rôles, cette zone affichera uniquement ta propre instruction.</p></div></article>';
  }

  function renderRole(payload) {
    var room = payload.room || {};
    var player = payload.currentPlayer;
    if (!player) {
      setHtml("#roleCard", waitingRoleMarkup());
      return;
    }
    if (player.role === "impostor" && room.status !== "waiting") {
      setHtml("#roleCard", '<article class="private-card impostor">' +
        '<img src="../img/ateliers/jeu-imposteur-role-imposteur.png" alt="Carte privée imposteur">' +
        '<div><p class="section-kicker">Ton rôle</p><h3>Tu es l\'imposteur</h3>' +
        '<p>Tu ne connais pas le mot secret. Écoute les autres, reste crédible et essaie de comprendre le thème sans te trahir.</p>' +
        '<ul><li>Pose des questions naturelles.</li><li>Évite les réponses trop vagues.</li><li>Prépare une hypothèse pour deviner le mot.</li></ul>' +
        confirmButton(player, room) + '</div></article>');
      return;
    }
    if (player.role === "citizen" && player.card && room.status !== "waiting") {
      var card = player.card;
      setHtml("#roleCard", '<article class="private-card citizen">' +
        '<img src="../img/ateliers/jeu-imposteur-role-citoyen.png" alt="Carte privée joueur">' +
        '<div><p class="section-kicker">Ton mot secret</p><h3>' + escapeHtml(card.term) + '</h3>' +
        '<p class="category-line">' + escapeHtml(card.category) + '</p><p>' + escapeHtml(card.brief) + '</p>' +
        '<div class="mini-grid"><div><strong>Indices possibles</strong><ul>' + listItems(card.clues) + '</ul></div>' +
        '<div><strong>Mots à éviter</strong><ul>' + listItems(card.taboo) + '</ul></div></div>' +
        confirmButton(player, room) + '</div></article>');
      return;
    }
    setHtml("#roleCard", waitingRoleMarkup());
  }

  function listItems(items) {
    return (items || []).map(function (item) { return "<li>" + escapeHtml(item) + "</li>"; }).join("");
  }

  function confirmButton(player, room) {
    if (room.status !== "briefing") {
      return player.ready ? '<p class="ready-note"><i class="bi bi-check2-circle"></i> Rôle confirmé.</p>' : "";
    }
    if (player.ready) {
      return '<p class="ready-note"><i class="bi bi-check2-circle"></i> Tu as confirmé ton rôle. Attends les autres.</p>';
    }
    return '<button type="button" class="btn-main mt-2" id="confirmRoleBtn"><i class="bi bi-check2-circle"></i> J\'ai reçu mon rôle</button>';
  }

  function renderVote(payload) {
    var room = payload.room || {};
    var player = payload.currentPlayer;
    if (room.status !== "voting" || !player) {
      setHtml("#votePanel", "");
      return;
    }
    if (player.hasVoted) {
      setHtml("#votePanel", '<section class="vote-box"><img src="../img/ateliers/jeu-imposteur-vote.png" alt="Vote envoyé"><div><h3>Vote envoyé</h3><p>Ton vote est enregistré. Attends la révélation du professeur.</p></div></section>');
      return;
    }
    var options = (payload.players || []).filter(function (item) { return item.id !== player.id; }).map(function (item) {
      return '<label><input type="radio" name="suspect" value="' + escapeHtml(item.id) + '"><span>' + escapeHtml(item.name) + '</span></label>';
    }).join("");
    setHtml("#votePanel", '<section class="vote-box active"><img src="../img/ateliers/jeu-imposteur-vote.png" alt="Vote imposteur">' +
      '<div><p class="section-kicker">Vote secret</p><h3>Qui est l\'imposteur ?</h3>' +
      '<p>Choisis la personne qui semblait ne pas connaître le mot secret.</p><form id="voteForm" class="vote-options">' + options +
      '<button type="submit" class="btn-main"><i class="bi bi-send-check-fill"></i> Envoyer mon vote</button></form></div></section>');
  }

  function renderResult(payload) {
    var result = payload.result;
    if (!result) {
      setHtml("#resultPanel", "");
      return;
    }
    var impostors = (result.impostors || []).map(function (item) { return escapeHtml(item.name); }).join(", ");
    var votes = (result.votes || []).map(function (item) {
      return '<li><span>' + escapeHtml(item.name) + '</span><strong>' + Number(item.votes || 0) + '</strong></li>';
    }).join("") || '<li><span>Aucun vote</span><strong>0</strong></li>';
    setHtml("#resultPanel", '<section class="result-box-final"><p class="section-kicker">Révélation</p><h3>Imposteur : ' + impostors + '</h3>' +
      '<p>Mot secret : <strong>' + escapeHtml(result.card && result.card.term) + '</strong></p><ul class="vote-summary">' + votes + '</ul></section>');
  }

  function updateTeacherButtons(payload) {
    var isTeacher = Boolean(payload && payload.teacher && payload.teacher.ok);
    document.body.classList.toggle("is-teacher", isTeacher);
    var room = payload && payload.room ? payload.room : {};
    var status = room.status || "waiting";
    var hasRoom = Boolean(cleanRoomCode(room.code || localState.roomCode));
    var canDistribute = isTeacher && status === "waiting" && Number(room.playerCount || 0) >= Number(room.minPlayers || 4);
    var canForce = isTeacher && status === "briefing";
    var canVote = isTeacher && (status === "discussion" || status === "briefing");
    var canReveal = isTeacher && (status === "voting" || status === "discussion");
    setDisabled("#distributeBtn", !canDistribute);
    setDisabled("#forceDiscussionBtn", !canForce);
    setDisabled("#openVoteBtn", !canVote);
    setDisabled("#revealBtn", !canReveal);
    setDisabled("#resetBtn", !isTeacher || !hasRoom);
    setDisabled("#closeRoomBtn", !hasRoom);
  }

  function setDisabled(selector, disabled) {
    var node = $(selector);
    if (node) node.disabled = Boolean(disabled);
  }

  async function handleCreateRoom() {
    try {
      var result = await request("create");
      localState.roomCode = result.roomCode;
      localState.teacherToken = result.teacherToken;
      delete localState.playerToken;
      saveLocalState();
      showMessage("Salle créée. Partage le code avec les étudiants.", "success");
      lastPayload = result.state;
      render(lastPayload);
      startPolling();
      playSfx("roomCreated");
    } catch (error) {
      showMessage(messageForError(error), "error");
    }
  }

  async function handleJoin(event) {
    event.preventDefault();
    var roomCode = ($("#roomCode") && $("#roomCode").value || "").trim().toUpperCase();
    var name = ($("#playerName") && $("#playerName").value || "").trim();
    try {
      var result = await request("join", { roomCode: roomCode, name: name, playerToken: localState.playerToken });
      localState.roomCode = result.roomCode;
      localState.playerToken = result.playerToken;
      saveLocalState();
      showMessage("Tu es dans la salle. Attends la distribution du rôle.", "success");
      lastPayload = result.state;
      render(lastPayload);
      startPolling();
    } catch (error) {
      showMessage(messageForError(error), "error");
    }
  }

  async function teacherAction(action) {
    if (!localState.roomCode || !localState.teacherToken) return;
    try {
      var result = await request(action, { roomCode: localState.roomCode, teacherToken: localState.teacherToken });
      lastPayload = result.state;
      render(lastPayload);
      var actionMessage = {
        "open-vote": "Vote ouvert pour tous les étudiants.",
        reset: "Salle réinitialisée. Les joueurs restent, les rôles et les votes repartent à zéro."
      }[action] || "Action professeur appliquée.";
      showMessage(actionMessage, "success");
      var sound = {
        distribute: "rolesDistributed",
        "open-vote": "suspectFound",
        reveal: "resultRevealed"
      }[action];
      if (sound) playSfx(sound);
    } catch (error) {
      showMessage(messageForError(error), "error");
    }
  }

  async function closeOrLeaveRoom() {
    if (!localState.roomCode) {
      clearCurrentRoom();
      return;
    }
    if (localState.teacherToken) {
      try {
        await request("close-room", { roomCode: localState.roomCode, teacherToken: localState.teacherToken });
        clearCurrentRoom("Salle fermée. Tu peux créer une nouvelle salle.", "success");
      } catch (error) {
        if (error && error.message === "room_not_found") {
          clearCurrentRoom("Salle introuvable. L'écran a été remis à zéro.", "success");
          return;
        }
        showMessage(messageForError(error), "error");
      }
      return;
    }
    if (localState.playerToken) {
      try {
        await request("leave", { roomCode: localState.roomCode, playerToken: localState.playerToken });
      } catch (_error) {}
    }
    clearCurrentRoom("Tu as quitté la salle. Tu peux en rejoindre une autre.", "success");
  }

  async function confirmRole() {
    try {
      var result = await request("confirm", { roomCode: localState.roomCode, playerToken: localState.playerToken });
      lastPayload = result.state;
      render(lastPayload);
      showMessage("Rôle confirmé.", "success");
      playSfx("roleConfirmed");
    } catch (error) {
      showMessage(messageForError(error), "error");
    }
  }

  async function submitVote(event) {
    event.preventDefault();
    var selected = document.querySelector('input[name="suspect"]:checked');
    if (!selected) {
      showMessage("Choisis un suspect avant d'envoyer ton vote.", "error");
      return;
    }
    try {
      var result = await request("vote", {
        roomCode: localState.roomCode,
        playerToken: localState.playerToken,
        suspectId: selected.value
      });
      lastPayload = result.state;
      render(lastPayload);
      showMessage("Vote enregistré.", "success");
      playSfx("voteSubmitted");
    } catch (error) {
      showMessage(messageForError(error), "error");
    }
  }

  function bindEvents() {
    $("#createRoomBtn") && $("#createRoomBtn").addEventListener("click", handleCreateRoom);
    $("#joinForm") && $("#joinForm").addEventListener("submit", handleJoin);
    $("#distributeBtn") && $("#distributeBtn").addEventListener("click", function () { teacherAction("distribute"); });
    $("#forceDiscussionBtn") && $("#forceDiscussionBtn").addEventListener("click", function () { teacherAction("force-discussion"); });
    $("#openVoteBtn") && $("#openVoteBtn").addEventListener("click", function () { teacherAction("open-vote"); });
    $("#revealBtn") && $("#revealBtn").addEventListener("click", function () { teacherAction("reveal"); });
    $("#resetBtn") && $("#resetBtn").addEventListener("click", function () { teacherAction("reset"); });
    $("#closeRoomBtn") && $("#closeRoomBtn").addEventListener("click", closeOrLeaveRoom);
    $("#soundToggle") && $("#soundToggle").addEventListener("change", function (event) {
      soundEnabled = Boolean(event.target.checked);
      saveSoundPreference();
      if (soundEnabled) playSfx("roleConfirmed");
    });
    $("#copyRoomLinkBtn") && $("#copyRoomLinkBtn").addEventListener("click", copyStudentLink);
    $("#copyCodeBtn") && $("#copyCodeBtn").addEventListener("click", function () {
      if (!localState.roomCode || !navigator.clipboard) return;
      navigator.clipboard.writeText(localState.roomCode).then(function () {
        showMessage("Code copié.", "success");
      });
    });
    document.addEventListener("click", function (event) {
      if (event.target && event.target.id === "confirmRoleBtn") confirmRole();
    });
    document.addEventListener("submit", function (event) {
      if (event.target && event.target.id === "voteForm") submitVote(event);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    applyRoomFromUrl();
    applyStoredFields();
    ensureSoundToggle();
    ensureQrPanel();
    ensureRoomLifecycleButtons();
    bindEvents();
    syncSoundToggle();
    preloadSfx();
    renderEmpty();
    if (localState.roomCode) {
      refreshState();
      startPolling();
    }
  });
})();
