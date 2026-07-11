(function () {
  "use strict";

  var API = "/api/intermediate/unit4-impostor";
  var STATE_API = "/api/intermediate/unit4-impostor/state";
  var STORAGE_KEY = "english-intermediate-unit4-impostor-live-state";
  var SOUND_STORAGE_KEY = "english-intermediate-unit4-impostor-sound-enabled";
  var POLL_MS = 1800;
  var QR_VERSION = 3;
  var QR_SIZE = 29;
  var QR_DATA_CODEWORDS = 55;
  var QR_ECC_CODEWORDS = 15;
  var SFX_BASE = "audio/sfx/impostor/";
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
  var authPollTimer = null;
  var GOOGLE_USER_KEY = "jaralingua_google_user";
  var MICROSOFT_USER_KEY = "jaralingua_microsoft_user";
  var LOCAL_USER_KEY = "jaralingua_local_user";
  var ROLE_REQUESTS_KEY = "jaralingua_role_requests";
  var ADMIN_EMAILS = ["cdavid.jaramillo@gmail.com"];
  var authState = { user: null, roleStatus: null, isLoggedIn: false, isTeacher: false, canJoin: false };

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

  function normalizeEmail(value) {
    return String(value || "").trim().toLowerCase();
  }

  function readStoredAuthUser(key, provider) {
    try {
      var saved = JSON.parse(sessionStorage.getItem(key) || "null");
      if (!saved || !saved.exp || Date.now() / 1000 > saved.exp) {
        sessionStorage.removeItem(key);
        return null;
      }
      return Object.assign({ provider: provider }, saved);
    } catch (_error) {
      sessionStorage.removeItem(key);
      return null;
    }
  }

  function currentAuthUser() {
    var googleUser = readStoredAuthUser(GOOGLE_USER_KEY, "google");
    if (googleUser && googleUser.credential) return googleUser;
    var microsoftUser = readStoredAuthUser(MICROSOFT_USER_KEY, "microsoft");
    if (microsoftUser && microsoftUser.credential) return microsoftUser;
    var localUser = readStoredAuthUser(LOCAL_USER_KEY, "local");
    if (localUser && localUser.credential) return localUser;
    return null;
  }

  function authUserId(user) {
    return (user && (user.sub || user.email)) || "";
  }

  function readRoleRequests() {
    try {
      var saved = JSON.parse(localStorage.getItem(ROLE_REQUESTS_KEY) || "[]");
      return Array.isArray(saved) ? saved : [];
    } catch (_error) {
      return [];
    }
  }

  function currentRoleStatus(user) {
    if (!user) return null;
    if (ADMIN_EMAILS.indexOf(normalizeEmail(user.email)) !== -1) {
      return { role: "admin", status: "approved" };
    }
    var id = authUserId(user);
    return readRoleRequests().filter(function (request) {
      return request && (request.id === id || normalizeEmail(request.email) === normalizeEmail(user.email));
    })[0] || null;
  }

  function readAuthAccess() {
    var user = currentAuthUser();
    var roleStatus = currentRoleStatus(user);
    var approvedRole = roleStatus && roleStatus.status === "approved" ? roleStatus.role : "";
    return {
      user: user,
      roleStatus: roleStatus,
      isLoggedIn: Boolean(user),
      isTeacher: Boolean(user && (approvedRole === "teacher" || approvedRole === "admin")),
      canJoin: Boolean(user)
    };
  }

  function isTeacherAccess() {
    authState = readAuthAccess();
    return Boolean(authState.isTeacher);
  }

  function hasStudentAccess() {
    authState = readAuthAccess();
    return Boolean(authState.canJoin);
  }

  function openAuthPanel() {
    var navToggle = document.querySelector("[data-auth-nav-toggle]");
    var toggle = document.querySelector("[data-auth-toggle]");
    var trigger = navToggle || toggle;
    if (trigger) {
      trigger.click();
      return;
    }
    showMessage("Use the sign-in button to enter with your student account.", "info");
  }

  function syncAuthUi() {
    authState = readAuthAccess();
    document.body.classList.toggle("teacher-mode", authState.isTeacher);
    document.body.classList.toggle("student-only", !authState.isTeacher);

    var teacherPanel = $("#teacherPanel");
    if (teacherPanel) teacherPanel.hidden = !authState.isTeacher;

    var gate = $("#studentAuthGate");
    if (gate) gate.hidden = authState.canJoin;

    var joinForm = $("#joinForm");
    if (joinForm) joinForm.hidden = !authState.canJoin;

    var roomInput = $("#roomCode");
    if (roomInput) roomInput.disabled = !authState.canJoin;

    var playerInput = $("#playerName");
    if (playerInput) {
      playerInput.disabled = !authState.canJoin;
      if (authState.user && !playerInput.value.trim()) {
        playerInput.value = authState.user.name || authState.user.email || "";
      }
    }

    var joinSubmit = $("#joinSubmitBtn");
    if (joinSubmit) joinSubmit.disabled = !authState.canJoin;

    if (!authState.isTeacher && localState.teacherToken) {
      delete localState.teacherToken;
      saveLocalState();
    }

    updateTeacherButtons(lastPayload);
    renderRoomQr(lastPayload);
  }

  function startAuthPolling() {
    if (authPollTimer) window.clearInterval(authPollTimer);
    authPollTimer = window.setInterval(syncAuthUi, 1200);
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
    label.innerHTML = '<span><i class="bi bi-volume-up-fill"></i> Sound effects</span><input type="checkbox" id="soundToggle" checked>';
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
    panel.innerHTML = '<div class="qr-copy"><div><p class="section-kicker mb-1">QR access</p><h3>Scan to join</h3><p>Students scan this code, sign in, write their name, and join this live room.</p></div><div class="qr-code-box" id="roomQrCode" aria-label="Room QR code"></div></div><a class="qr-link" id="roomQrLink" href="#" target="_blank" rel="noopener">Open student link</a><button type="button" class="btn-soft w-100" id="copyRoomLinkBtn"><i class="bi bi-link-45deg"></i> Copy student link</button>';
    roomCode.insertAdjacentElement("afterend", panel);
  }

  function ensureRoomLifecycleButtons() {
    var resetButton = $("#resetBtn");
    if (resetButton) {
      resetButton.className = "btn-soft";
      resetButton.innerHTML = '<i class="bi bi-arrow-counterclockwise"></i> Reset room';
    }
    if ($("#closeRoomBtn") || !resetButton) return;
    var closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "btn-danger-soft";
    closeButton.id = "closeRoomBtn";
    closeButton.innerHTML = '<i class="bi bi-x-circle"></i> Close / leave room';
    resetButton.insertAdjacentElement("afterend", closeButton);
  }

  function studentRoomUrl(roomCode) {
    var code = cleanRoomCode(roomCode);
    var origin = window.location.origin && window.location.origin !== "null" ? window.location.origin : "";
    if (origin) return origin.replace(/\/+$/, "") + "/i.html?r=" + encodeURIComponent(code);
    var url = new URL(window.location.href);
    url.searchParams.set("room", code);
    url.hash = "game";
    return url.toString();
  }

  function renderRoomQr(payload) {
    var panel = $("#roomQrPanel");
    var qrCode = $("#roomQrCode");
    var link = $("#roomQrLink");
    var isTeacher = isTeacherAccess() && Boolean(payload && payload.teacher && payload.teacher.ok);
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
      showMessage("Student link copied.", "success");
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
      return '<svg class="qr-svg" viewBox="0 0 ' + viewSize + " " + viewSize + '" role="img" aria-label="Room QR code" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#fff"/><path d="' + path + '" fill="#111827" shape-rendering="crispEdges"/></svg>';
    } catch (_error) {
      return '<p class="qr-error">QR code unavailable. Copy the student link.</p>';
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
      waiting: "Waiting room",
      briefing: "Secret role distribution",
      discussion: "Discussion in progress",
      voting: "Vote open",
      revealed: "Result revealed"
    }[status] || "Waiting room";
  }

  function statusHint(status) {
    return {
      waiting: "The teacher creates the room and students join with their signed-in account.",
      briefing: "Each student reads a private card and confirms that the role was received.",
      discussion: "Students discuss in English without saying the exact phrasal verb or idiom.",
      voting: "The teacher has opened the vote: choose the classmate who may be the impostor.",
      revealed: "The class can compare votes, the secret expression, and the impostor role."
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
    showMessage(message || "Room left. You can create or join another room.", type || "success");
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
      room_not_found: "Room not found. Check the code.",
      name_required: "Write your first name or full name before joining.",
      name_taken: "That name is already in this room. Add an initial.",
      room_full: "The room is full.",
      not_enough_players: "At least four players are required to start the game.",
      teacher_required: "This command is only for the teacher who created the room.",
      not_in_briefing: "This action is available only during secret role distribution.",
      vote_not_available: "The vote cannot be opened right now.",
      vote_closed: "The vote is not open.",
      invalid_suspect: "Choose a valid player.",
      self_vote_forbidden: "You cannot vote for yourself.",
      reveal_not_available: "The result cannot be revealed yet.",
      player_required: "Join the room again before continuing."
    }[code] || "Action unavailable right now. Try again in a few seconds.";
  }

  function renderEmpty() {
    setText("#roomCodeDisplay", "----");
    setText("#statusLabel", "No room");
    setText("#statusHint", "Create a room or enter a code to join the game.");
    setText("#playerCount", "0");
    setText("#readyCount", "0");
    setText("#voteCount", "0");
    setHtml("#playersList", '<li class="muted-line">No players connected yet.</li>');
    setHtml("#roleCard", waitingRoleMarkup());
    setHtml("#votePanel", "");
    setHtml("#resultPanel", "");
    renderRoomQr(null);
    updateTeacherButtons(null);
    applyStoredFields();
    syncAuthUi();
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
    syncAuthUi();
  }

  function renderPlayers(players, status) {
    if (!players.length) {
      setHtml("#playersList", '<li class="muted-line">No players connected yet.</li>');
      return;
    }
    setHtml("#playersList", players.map(function (player) {
      var state = status === "voting"
        ? (player.hasVoted ? "Voted" : "Vote pending")
        : (player.ready ? "Role received" : "Waiting");
      var role = player.role ? '<span class="role-chip">' + escapeHtml(player.role === "impostor" ? "impostor" : "speaker") + "</span>" : "";
      return '<li><span><i class="bi bi-person-circle"></i> ' + escapeHtml(player.name) + role + '</span><em>' + state + '</em></li>';
    }).join(""));
  }

  function waitingRoleMarkup() {
    return '<article class="private-card waiting">' +
      '<img src="../../assets/img/english-intermediate/unit-4/impostor/role-impostor.png" alt="Private role card waiting">' +
      '<div><p class="section-kicker">Private card</p><h3>Waiting for your role</h3>' +
      '<p>When the teacher distributes roles, only your private instruction will appear here.</p></div></article>';
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
        '<img src="../../assets/img/english-intermediate/unit-4/impostor/role-impostor.png" alt="Private impostor role card">' +
        '<div><p class="section-kicker">Your role</p><h3>You are the impostor</h3>' +
        '<p>' + escapeHtml(player.impostorInstruction || "You do not know the expression. Listen carefully, stay credible, and infer the phrasal verb or idiom from classmates answers.") + '</p>' +
        '<p class="category-line">Unit 4: family phrasal verbs and idioms</p>' +
        '<ul><li>Ask natural family-context questions.</li><li>Avoid answers that sound too general.</li><li>Use classmates examples to infer the hidden expression.</li></ul>' +
        confirmButton(player, room) + '</div></article>');
      return;
    }
    if (player.role === "citizen" && player.card && room.status !== "waiting") {
      var card = player.card;
      var image = card.image || "../../assets/img/english-intermediate/unit-4/impostor/family-impostor-hero.png";
      setHtml("#roleCard", '<article class="private-card citizen">' +
        '<img src="' + escapeHtml(image) + '" alt="Visual support for the secret expression">' +
        '<div><p class="section-kicker">Your secret expression</p><h3>' + escapeHtml(card.term) + '</h3>' +
        '<p class="category-line">' + escapeHtml(card.type || card.category) + '</p>' +
        '<div class="meaning-block"><strong>Meaning</strong><p>' + escapeHtml(card.brief) + '</p></div>' +
        fieldBlock("Family context", card.familyContext) +
        fieldBlock("Speaking support", card.speakingHelp) +
        '<div class="mini-grid"><div><strong>Possible clues</strong><ul>' + listItems(card.clues) + '</ul></div>' +
        '<div><strong>Words to avoid</strong><ul>' + listItems(card.taboo) + '</ul></div></div>' +
        confirmButton(player, room) + '</div></article>');
      return;
    }
    setHtml("#roleCard", waitingRoleMarkup());
  }

  function fieldBlock(label, value) {
    if (!value) return "";
    return '<div class="meaning-block"><strong>' + escapeHtml(label) + '</strong><p>' + escapeHtml(value) + '</p></div>';
  }

  function listItems(items) {
    return (items || []).map(function (item) { return "<li>" + escapeHtml(item) + "</li>"; }).join("");
  }

  function confirmButton(player, room) {
    if (room.status !== "briefing") {
      return player.ready ? '<p class="ready-note"><i class="bi bi-check2-circle"></i> Role confirmed.</p>' : "";
    }
    if (player.ready) {
      return '<p class="ready-note"><i class="bi bi-check2-circle"></i> You confirmed your role. Wait for the rest of the class.</p>';
    }
    return '<button type="button" class="btn-main mt-2" id="confirmRoleBtn"><i class="bi bi-check2-circle"></i> I received my role</button>';
  }

  function renderVote(payload) {
    var room = payload.room || {};
    var player = payload.currentPlayer;
    if (room.status !== "voting" || !player) {
      setHtml("#votePanel", "");
      return;
    }
    if (player.hasVoted) {
      setHtml("#votePanel", '<section class="vote-box"><img src="../../assets/img/english-intermediate/unit-4/impostor/vote.png" alt="Vote submitted"><div><h3>Vote submitted</h3><p>Your vote is recorded. Wait for the teacher to reveal the result.</p></div></section>');
      return;
    }
    var options = (payload.players || []).filter(function (item) { return item.id !== player.id; }).map(function (item) {
      return '<label><input type="radio" name="suspect" value="' + escapeHtml(item.id) + '"><span>' + escapeHtml(item.name) + '</span></label>';
    }).join("");
    setHtml("#votePanel", '<section class="vote-box active"><img src="../../assets/img/english-intermediate/unit-4/impostor/vote.png" alt="Impostor vote">' +
      '<div><p class="section-kicker">Secret vote</p><h3>Who is the impostor?</h3>' +
      '<p>Choose the person who seemed not to know the hidden phrasal verb or idiom.</p><form id="voteForm" class="vote-options">' + options +
      '<button type="submit" class="btn-main"><i class="bi bi-send-check-fill"></i> Submit my vote</button></form></div></section>');
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
    }).join("") || '<li><span>No votes</span><strong>0</strong></li>';
    setHtml("#resultPanel", '<section class="result-box-final"><p class="section-kicker">Reveal</p><h3>Impostor: ' + impostors + '</h3>' +
      '<p>Secret expression: <strong>' + escapeHtml(result.card && result.card.term) + '</strong></p><ul class="vote-summary">' + votes + '</ul></section>');
  }

  function updateTeacherButtons(payload) {
    var isTeacher = isTeacherAccess() && Boolean(payload && payload.teacher && payload.teacher.ok);
    document.body.classList.toggle("is-teacher", isTeacher);
    var room = payload && payload.room ? payload.room : {};
    var status = room.status || "waiting";
    var hasRoom = Boolean(cleanRoomCode(room.code || localState.roomCode));
    var canDistribute = isTeacher && status === "waiting" && Number(room.playerCount || 0) >= Number(room.minPlayers || 4);
    var canForce = isTeacher && status === "briefing";
    var canVote = isTeacher && (status === "discussion" || status === "briefing");
    var canReveal = isTeacher && (status === "voting" || status === "discussion");
    setDisabled("#createRoomBtn", !authState.isTeacher);
    setDisabled("#distributeBtn", !canDistribute);
    setDisabled("#forceDiscussionBtn", !canForce);
    setDisabled("#openVoteBtn", !canVote);
    setDisabled("#revealBtn", !canReveal);
    setDisabled("#resetBtn", !isTeacher || !hasRoom);
    setDisabled("#closeRoomBtn", !hasRoom || (Boolean(localState.teacherToken) && !authState.isTeacher));
  }

  function setDisabled(selector, disabled) {
    var node = $(selector);
    if (node) node.disabled = Boolean(disabled);
  }

  async function handleCreateRoom() {
    if (!isTeacherAccess()) {
      showMessage("Sign in with an approved teacher account to create a room.", "error");
      openAuthPanel();
      return;
    }
    try {
      var result = await request("create");
      localState.roomCode = result.roomCode;
      localState.teacherToken = result.teacherToken;
      delete localState.playerToken;
      saveLocalState();
      showMessage("Room created. Share the code with students.", "success");
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
    if (!hasStudentAccess()) {
      showMessage("Sign in before joining the room. The QR code has already prepared the room code.", "error");
      openAuthPanel();
      return;
    }
    var roomCode = ($("#roomCode") && $("#roomCode").value || "").trim().toUpperCase();
    var name = ($("#playerName") && $("#playerName").value || "").trim();
    try {
      var result = await request("join", { roomCode: roomCode, name: name, playerToken: localState.playerToken });
      localState.roomCode = result.roomCode;
      localState.playerToken = result.playerToken;
      saveLocalState();
      showMessage("You are in the room. Wait for the teacher to distribute roles.", "success");
      lastPayload = result.state;
      render(lastPayload);
      startPolling();
    } catch (error) {
      showMessage(messageForError(error), "error");
    }
  }

  async function teacherAction(action) {
    if (!isTeacherAccess()) {
      showMessage("This command is reserved for the signed-in teacher.", "error");
      openAuthPanel();
      return;
    }
    if (!localState.roomCode || !localState.teacherToken) return;
    try {
      var result = await request(action, { roomCode: localState.roomCode, teacherToken: localState.teacherToken });
      lastPayload = result.state;
      render(lastPayload);
      var actionMessage = {
        "open-vote": "Vote opened for all students.",
        reset: "Room reset. Players stay connected, but roles and votes start again."
      }[action] || "Teacher action applied.";
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
      if (!isTeacherAccess()) {
        showMessage("Only the signed-in teacher can close this room.", "error");
        openAuthPanel();
        return;
      }
      try {
        await request("close-room", { roomCode: localState.roomCode, teacherToken: localState.teacherToken });
        clearCurrentRoom("Room closed. You can create a new one.", "success");
      } catch (error) {
        if (error && error.message === "room_not_found") {
          clearCurrentRoom("Room not found. The screen was reset.", "success");
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
    clearCurrentRoom("You left the room. You can join another one.", "success");
  }

  async function confirmRole() {
    try {
      var result = await request("confirm", { roomCode: localState.roomCode, playerToken: localState.playerToken });
      lastPayload = result.state;
      render(lastPayload);
      showMessage("Role confirmed.", "success");
      playSfx("roleConfirmed");
    } catch (error) {
      showMessage(messageForError(error), "error");
    }
  }

  async function submitVote(event) {
    event.preventDefault();
    var selected = document.querySelector('input[name="suspect"]:checked');
    if (!selected) {
      showMessage("Choose a suspect before submitting your vote.", "error");
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
      showMessage("Vote recorded.", "success");
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
    $("#openAuthFromGame") && $("#openAuthFromGame").addEventListener("click", openAuthPanel);
    $("#copyCodeBtn") && $("#copyCodeBtn").addEventListener("click", function () {
      if (!localState.roomCode || !navigator.clipboard) return;
      navigator.clipboard.writeText(localState.roomCode).then(function () {
        showMessage("Room code copied.", "success");
      });
    });
    document.addEventListener("click", function (event) {
      if (event.target && event.target.id === "confirmRoleBtn") confirmRole();
    });
    document.addEventListener("submit", function (event) {
      if (event.target && event.target.id === "voteForm") submitVote(event);
    });
    window.addEventListener("focus", syncAuthUi);
    window.addEventListener("storage", syncAuthUi);
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
    syncAuthUi();
    startAuthPolling();
    if (localState.roomCode) {
      refreshState();
      startPolling();
    }
  });
})();
