(function () {
  "use strict";

  const API = "/api/intermediate/decision-room";
  const STATE_API = "/api/intermediate/decision-room/state";
  const STORAGE_KEY = "english-intermediate-decision-room-live-state";
  const TEACHER_ROOMS_KEY = "english-intermediate-decision-room-teacher-rooms-v1";
  const POLL_MS = 1700;
  const GOOGLE_USER_KEY = "jaralingua_google_user";
  const MICROSOFT_USER_KEY = "jaralingua_microsoft_user";
  const LOCAL_USER_KEY = "jaralingua_local_user";
  const ROLE_REQUESTS_KEY = "jaralingua_role_requests";
  const ADMIN_EMAILS = ["cdavid.jaramillo@gmail.com"];
  const FALLBACK_SCENARIOS = [
    { id: "overbooked-saturday", title: "Olivia's Overbooked Saturday" },
    { id: "final-exam-week", title: "The Final Exam Week" },
    { id: "group-project-conflict", title: "The Group Project Conflict" },
    { id: "weather-change-plan", title: "The Weather Change Plan" },
    { id: "family-schedule-negotiation", title: "Family Schedule Negotiation" },
    { id: "club-event-decision", title: "The Club Event Decision" }
  ];

  let localState = loadLocalState();
  let lastPayload = null;
  let pollTimer = null;
  let authTimer = null;
  let selectedScenarioId = localState.scenarioId || FALLBACK_SCENARIOS[0].id;

  const $ = (selector) => document.querySelector(selector);

  function loadLocalState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
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

  function cleanRoomCode(value) {
    return String(value || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#039;"
    }[char]));
  }

  function normalizeEmail(value) {
    return String(value || "").trim().toLowerCase();
  }

  function readStoredAuthUser(key, provider) {
    try {
      const saved = JSON.parse(sessionStorage.getItem(key) || "null");
      if (!saved || !saved.exp || Date.now() / 1000 > saved.exp) {
        sessionStorage.removeItem(key);
        return null;
      }
      return Object.assign({ provider }, saved);
    } catch (_error) {
      sessionStorage.removeItem(key);
      return null;
    }
  }

  function currentAuthUser() {
    return readStoredAuthUser(GOOGLE_USER_KEY, "google") ||
      readStoredAuthUser(MICROSOFT_USER_KEY, "microsoft") ||
      readStoredAuthUser(LOCAL_USER_KEY, "local");
  }

  function readRoleRequests() {
    try {
      const saved = JSON.parse(localStorage.getItem(ROLE_REQUESTS_KEY) || "[]");
      return Array.isArray(saved) ? saved : [];
    } catch (_error) {
      return [];
    }
  }

  function authUserId(user) {
    return (user && (user.sub || user.email)) || "";
  }

  function currentRoleStatus(user) {
    if (!user) return null;
    if (ADMIN_EMAILS.includes(normalizeEmail(user.email))) return { role: "admin", status: "approved" };
    const id = authUserId(user);
    return readRoleRequests().find((request) => request && (request.id === id || normalizeEmail(request.email) === normalizeEmail(user.email))) || null;
  }

  function authAccess() {
    const user = currentAuthUser();
    const roleStatus = currentRoleStatus(user);
    const role = roleStatus && roleStatus.status === "approved" ? roleStatus.role : "";
    return {
      user,
      isLoggedIn: Boolean(user),
      isTeacher: Boolean(user && (role === "teacher" || role === "admin")),
      canJoin: Boolean(user)
    };
  }

  function openAuthPanel() {
    const trigger = document.querySelector("[data-auth-nav-toggle], [data-auth-toggle]");
    if (trigger) {
      trigger.click();
      return;
    }
    showMessage("The sign-in panel is still loading. Reload the page if it does not appear.", "error");
  }

  function wordCount(value) {
    const matches = String(value || "").trim().match(/\b[\w'-]+\b/g);
    return matches ? matches.length : 0;
  }

  function languageHits(text) {
    const value = String(text || "").toLowerCase();
    const checks = [
      ["be going to", /\b(am|is|are)\s+going\s+to\b/],
      ["present continuous", /\b(am|is|are)\s+\w+ing\b/],
      ["will", /\bwill\b|'ll\b/],
      ["should", /\bshould(?:n't| not)?\b/],
      ["could", /\bcould\b/],
      ["might", /\bmight\b/],
      ["has to / have to", /\b(has|have)\s+to\b/]
    ];
    return checks.filter((item) => item[1].test(value)).map((item) => item[0]);
  }

  function showMessage(message, type) {
    const node = $("#statusMessage");
    if (!node) return;
    node.className = "status-message " + (type || "");
    node.textContent = message;
  }

  function readTrackedTeacherRooms() {
    try {
      const parsed = JSON.parse(localStorage.getItem(TEACHER_ROOMS_KEY) || "[]");
      const seen = {};
      return (Array.isArray(parsed) ? parsed : []).map((item) => ({
        roomCode: cleanRoomCode(item && item.roomCode),
        teacherToken: String(item && item.teacherToken || "").slice(0, 200)
      })).filter((item) => {
        if (!item.roomCode || !item.teacherToken || seen[item.roomCode]) return false;
        seen[item.roomCode] = true;
        return true;
      }).slice(0, 30);
    } catch (_error) {
      return [];
    }
  }

  function writeTrackedTeacherRooms(rooms) {
    try {
      localStorage.setItem(TEACHER_ROOMS_KEY, JSON.stringify(rooms || []));
    } catch (_error) {}
  }

  function trackTeacherRoom(roomCode, teacherToken) {
    const code = cleanRoomCode(roomCode);
    const token = String(teacherToken || "").slice(0, 200);
    if (!code || !token) return;
    const rooms = readTrackedTeacherRooms().filter((item) => item.roomCode !== code);
    rooms.push({ roomCode: code, teacherToken: token });
    writeTrackedTeacherRooms(rooms.slice(-30));
  }

  function trackedTeacherRoomRefs() {
    const rooms = readTrackedTeacherRooms();
    if (localState.roomCode && localState.teacherToken && !rooms.some((item) => item.roomCode === cleanRoomCode(localState.roomCode))) {
      rooms.push({ roomCode: cleanRoomCode(localState.roomCode), teacherToken: String(localState.teacherToken).slice(0, 200) });
    }
    return rooms.slice(0, 30);
  }

  function studentRoomUrl(roomCode) {
    const code = cleanRoomCode(roomCode);
    const url = new URL(window.location.href);
    url.pathname = "/ingles/intermediate/game-decision-room.html";
    url.search = "";
    url.hash = "decisionRoom";
    url.searchParams.set("room", code);
    return url.toString();
  }

  async function copyText(value, message) {
    const text = String(value || "");
    if (!text) {
      showMessage("There is nothing to copy yet.", "error");
      return;
    }
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const input = document.createElement("textarea");
        input.value = text;
        input.setAttribute("readonly", "");
        input.style.position = "fixed";
        input.style.opacity = "0";
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        input.remove();
      }
      showMessage(message || "Copied.", "success");
    } catch (_error) {
      showMessage("Copy failed. Select the code or link and copy it manually.", "error");
    }
  }

  async function request(action, body) {
    const payload = Object.assign({ action }, body || {});
    const response = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data && data.error ? data.error : "request_failed");
      error.status = response.status;
      error.data = data;
      throw error;
    }
    return data;
  }

  async function fetchState() {
    if (!localState.roomCode) {
      render(lastPayload);
      return;
    }
    const params = new URLSearchParams({ room: cleanRoomCode(localState.roomCode) });
    if (localState.playerToken) params.set("playerToken", localState.playerToken);
    if (localState.teacherToken) params.set("teacherToken", localState.teacherToken);
    try {
      const response = await fetch(STATE_API + "?" + params.toString());
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload && payload.error ? payload.error : "state_failed");
      lastPayload = payload;
      render(payload);
    } catch (error) {
      if (error.message === "room_not_found") {
        clearCurrentRoom("This room no longer exists. Create or join a new room.", "error");
      } else {
        showMessage("Live room state could not refresh. Check the connection.", "error");
      }
    }
  }

  function startPolling() {
    if (pollTimer) window.clearInterval(pollTimer);
    pollTimer = window.setInterval(fetchState, POLL_MS);
  }

  function applyRoomFromUrl() {
    try {
      const params = new URLSearchParams(window.location.search || "");
      const roomCode = cleanRoomCode(params.get("room") || params.get("r"));
      if (!roomCode) return;
      localState.roomCode = roomCode;
      delete localState.teacherToken;
      saveLocalState();
    } catch (_error) {}
  }

  function render(payload) {
    syncAuthUi(payload);
    renderScenarioTabs(payload);
    renderTeacher(payload);
    renderScenario(payload);
    renderResponses(payload);
    renderVote(payload);
    renderResult(payload);
    syncStudentTools(payload);
  }

  function syncAuthUi(payload) {
    const auth = authAccess();
    const currentPlayer = payload && payload.currentPlayer;
    const joinedRoom = Boolean(currentPlayer && localState.roomCode && localState.playerToken);
    document.body.classList.toggle("teacher-mode", auth.isTeacher);
    document.body.classList.toggle("student-only", !auth.isTeacher);

    const teacherPanel = $("#teacherPanel");
    if (teacherPanel) teacherPanel.hidden = !auth.isTeacher;

    const gate = $("#authGate");
    if (gate) gate.hidden = auth.canJoin;

    const joinForm = $("#joinForm");
    if (joinForm) joinForm.hidden = !auth.canJoin || joinedRoom;

    const connection = $("#connectionStatus");
    if (connection) connection.hidden = !joinedRoom;
    if (joinedRoom) {
      $("#connectionText").textContent = "Connected as " + currentPlayer.name + " · Room " + cleanRoomCode(localState.roomCode);
    }

    const playerName = $("#playerName");
    if (playerName && auth.user && !playerName.value.trim()) {
      playerName.value = auth.user.name || auth.user.email || "";
    }
    const roomInput = $("#roomCode");
    if (roomInput && localState.roomCode && !roomInput.value) roomInput.value = cleanRoomCode(localState.roomCode);

    if (!auth.isTeacher && localState.teacherToken) {
      delete localState.teacherToken;
      saveLocalState();
    }
  }

  function renderTeacher(payload) {
    const room = payload && payload.room ? payload.room : {};
    const roomCode = cleanRoomCode(room.code || localState.roomCode);
    $("#roomCodeDisplay").textContent = roomCode || "----";
    $("#playerCount").textContent = String(room.playerCount || 0);
    $("#responseCount").textContent = String(room.responseCount || 0);
    $("#finalistCount").textContent = String(room.finalistCount || 0);
    $("#voteCount").textContent = String(room.voteCount || 0);

    const link = $("#studentRoomLink");
    if (link) {
      if (roomCode) {
        link.href = studentRoomUrl(roomCode);
        link.textContent = "Student room link";
      } else {
        link.href = "#";
        link.textContent = "Student room link unavailable";
      }
    }

    const status = room.status || "none";
    const next = {
      none: "Next step: create one room and share the code.",
      waiting: "Next step: choose a scenario and launch it.",
      writing: "Students are writing. Read live answers as they appear.",
      reviewing: "Nominate 2-4 finalists, then open the class vote.",
      voting: "Students are voting. Reveal when enough votes are in.",
      revealed: "Round complete. Discuss the winning decision, then start a new round."
    };
    $("#teacherNext").textContent = next[status] || next.none;

    const hasRoom = Boolean(roomCode && payload && payload.room);
    const responseCount = Number(room.responseCount || 0);
    const finalistCount = Number(room.finalistCount || 0);
    $("#launchScenarioBtn").disabled = !hasRoom;
    $("#openVoteBtn").disabled = !hasRoom || finalistCount < 2;
    $("#revealBtn").disabled = !hasRoom || !["reviewing", "voting"].includes(status);
    $("#resetRoundBtn").disabled = !hasRoom;
    $("#closeRoomBtn").disabled = !hasRoom;
    $("#copyCodeBtn").disabled = !roomCode;
    $("#resetAllRoomsBtn").disabled = !trackedTeacherRoomRefs().length;
    if (responseCount === 0 && ["writing", "reviewing"].includes(status)) {
      $("#openVoteBtn").disabled = true;
    }

    const players = payload && Array.isArray(payload.players) ? payload.players : [];
    $("#playersList").innerHTML = players.length ? players.map((player) => (
      "<li><span>" + escapeHtml(player.name) + "</span><em>" + escapeHtml(player.responseId ? "answered" : "waiting") + "</em></li>"
    )).join("") : '<li><span>No players yet</span><em>Share the code</em></li>';
  }

  function renderScenarioTabs(payload) {
    const scenarios = payload && Array.isArray(payload.scenarios) && payload.scenarios.length ? payload.scenarios : FALLBACK_SCENARIOS;
    if (!scenarios.some((scenario) => scenario.id === selectedScenarioId)) selectedScenarioId = scenarios[0].id;
    $("#scenarioTabs").innerHTML = scenarios.map((scenario) => (
      '<button type="button" data-scenario-id="' + escapeHtml(scenario.id) + '" class="' + (scenario.id === selectedScenarioId ? "is-active" : "") + '">' +
      escapeHtml(scenario.title) + "</button>"
    )).join("");
  }

  function renderScenario(payload) {
    const scenario = payload && payload.scenario;
    const node = $("#scenarioCard");
    if (!scenario) {
      node.innerHTML = '<p class="decision-kicker">Scenario</p><h3>Waiting for the teacher</h3><p>The teacher will launch one situation. Read it, decide what the person should do, and submit one complete decision.</p>';
      return;
    }
    const targets = (scenario.targetLanguage || []).map((item) => "<span>" + escapeHtml(item) + "</span>").join("");
    node.innerHTML = '<p class="decision-kicker">' + escapeHtml(scenario.unit || "Unit 6") + '</p><h3>' + escapeHtml(scenario.title) + '</h3>' +
      '<p><strong>Situation:</strong> ' + escapeHtml(scenario.situation) + '</p>' +
      '<p><strong>Challenge:</strong> ' + escapeHtml(scenario.challenge) + '</p>' +
      '<div class="target-list">' + targets + '</div>';
  }

  function renderResponses(payload) {
    const responses = payload && Array.isArray(payload.responses) ? payload.responses : [];
    const finalists = new Set(payload && Array.isArray(payload.finalists) ? payload.finalists : []);
    const isTeacher = Boolean(payload && payload.teacher && payload.teacher.ok);
    if (!responses.length) {
      $("#responseList").innerHTML = '<div class="empty-state">No live decisions yet. Students submit one complete answer after the scenario opens.</div>';
      return;
    }
    $("#responseList").innerHTML = responses.map((response) => {
      const finalist = finalists.has(response.id);
      const hits = (response.languageHits || []).map((hit) => "<span>" + escapeHtml(hit) + "</span>").join("");
      const controls = isTeacher ? '<div class="response-actions"><button class="decision-button ' + (finalist ? "danger" : "primary") + '" type="button" data-nominate="' + escapeHtml(response.id) + '">' + (finalist ? "Remove finalist" : "Nominate finalist") + '</button></div>' : "";
      return '<article class="response-card ' + (finalist ? "is-finalist" : "") + '">' +
        '<div class="response-meta"><strong>' + escapeHtml(response.playerName) + '</strong><span>' + escapeHtml(response.wordCount) + ' words</span></div>' +
        '<p>' + escapeHtml(response.text) + '</p><div class="tag-row">' + hits + (finalist ? '<span>Finalist</span>' : "") + '</div>' + controls + '</article>';
    }).join("");
  }

  function renderVote(payload) {
    const room = payload && payload.room ? payload.room : {};
    const responses = payload && Array.isArray(payload.responses) ? payload.responses : [];
    const finalists = new Set(payload && Array.isArray(payload.finalists) ? payload.finalists : []);
    const finalistResponses = responses.filter((response) => finalists.has(response.id));
    const currentVote = payload && payload.currentVote;
    if (room.status !== "voting") {
      $("#votePanel").innerHTML = "";
      return;
    }
    $("#votePanel").innerHTML = '<section class="student-card"><p class="decision-kicker">Class vote</p><h3>Choose the strongest decision</h3><p>You can change your vote while the vote is open.</p><div class="vote-options">' +
      finalistResponses.map((response) => '<button type="button" class="decision-button ' + (currentVote === response.id ? "is-selected" : "") + '" data-vote="' + escapeHtml(response.id) + '"><strong>' + escapeHtml(response.playerName) + ':</strong> ' + escapeHtml(response.text) + '</button>').join("") +
      '</div></section>';
  }

  function renderResult(payload) {
    const result = payload && payload.result;
    if (!result) {
      $("#resultPanel").innerHTML = "";
      return;
    }
    const rows = (result.votes || []).map((item, index) => {
      const response = item.response || {};
      return '<article class="response-card ' + (index === 0 ? "is-finalist" : "") + '"><div class="response-meta"><strong>' + (index === 0 ? "Class decision" : "Finalist") + '</strong><span>' + escapeHtml(item.votes) + ' votes</span></div><p>' + escapeHtml(response.text) + '</p><div class="tag-row"><span>' + escapeHtml(response.playerName) + '</span></div></article>';
    }).join("");
    $("#resultPanel").innerHTML = '<section class="result-card"><p class="decision-kicker">Result</p><h3>The class decision</h3>' + (rows || '<p>No votes were submitted.</p>') + '</section>';
  }

  function syncStudentTools(payload) {
    const room = payload && payload.room ? payload.room : {};
    const currentPlayer = payload && payload.currentPlayer;
    const canSubmit = Boolean(currentPlayer && ["writing", "reviewing"].includes(room.status || ""));
    $("#submitDecisionBtn").disabled = !canSubmit;
    const text = $("#studentDecision").value;
    const count = wordCount(text);
    const hits = languageHits(text);
    $("#wordCounter").textContent = count + " words";
    $("#languageCounter").textContent = hits.length ? hits.join(", ") : "No Unit 6 marker yet";
  }

  function clearCurrentRoom(message, type) {
    localState = {};
    saveLocalState();
    lastPayload = null;
    $("#roomCode").value = "";
    $("#studentDecision").value = "";
    render(null);
    showMessage(message || "Room cleared.", type || "success");
  }

  function applyStateResult(result, mode) {
    if (result.roomCode) localState.roomCode = result.roomCode;
    if (result.teacherToken) localState.teacherToken = result.teacherToken;
    if (result.playerToken) localState.playerToken = result.playerToken;
    if (result.state) lastPayload = result.state;
    saveLocalState();
    render(lastPayload);
    startPolling();
    if (mode === "teacher" && localState.roomCode && localState.teacherToken) trackTeacherRoom(localState.roomCode, localState.teacherToken);
  }

  async function createRoom() {
    if (!authAccess().isTeacher) {
      showMessage("Sign in with an approved teacher account to create a room.", "error");
      openAuthPanel();
      return;
    }
    showMessage("Creating Decision Room...", "info");
    const result = await request("create");
    applyStateResult(result, "teacher");
    showMessage("Room created. Share code " + cleanRoomCode(result.roomCode) + " with the class.", "success");
  }

  async function joinRoom(event) {
    event.preventDefault();
    if (!authAccess().canJoin) {
      showMessage("Sign in before joining the Decision Room.", "error");
      openAuthPanel();
      return;
    }
    const roomCode = cleanRoomCode($("#roomCode").value || localState.roomCode);
    const name = ($("#playerName").value || "").trim();
    if (!roomCode || name.length < 2) {
      showMessage("Enter the room code and your name.", "error");
      return;
    }
    showMessage("Joining room " + roomCode + "...", "info");
    const result = await request("join", { roomCode, name, playerToken: localState.playerToken });
    applyStateResult(result, "student");
    showMessage("You are in the room. Wait for the teacher to launch a scenario.", "success");
  }

  async function teacherAction(action, extra, success) {
    if (!localState.roomCode || !localState.teacherToken) {
      showMessage("Create a room before using teacher controls.", "error");
      return;
    }
    const result = await request(action, Object.assign({ roomCode: localState.roomCode, teacherToken: localState.teacherToken }, extra || {}));
    applyStateResult(result, "teacher");
    showMessage(success || "Action completed.", "success");
  }

  async function submitDecision() {
    if (!localState.roomCode || !localState.playerToken) {
      showMessage("Join the room before submitting a decision.", "error");
      return;
    }
    const text = $("#studentDecision").value.trim();
    if (wordCount(text) < 12) {
      showMessage("Write at least 12 words so your decision has context and a reason.", "error");
      return;
    }
    if (!languageHits(text).length) {
      showMessage("Use at least one Unit 6 marker: should, could, will, be going to, or a confirmed arrangement.", "error");
      return;
    }
    const result = await request("submit-response", { roomCode: localState.roomCode, playerToken: localState.playerToken, text });
    applyStateResult(result, "student");
    showMessage("Decision sent to the live board. You may edit and send again while responses are open.", "success");
  }

  async function vote(responseId) {
    if (!localState.roomCode || !localState.playerToken) {
      showMessage("Join the room before voting.", "error");
      return;
    }
    const result = await request("vote", { roomCode: localState.roomCode, playerToken: localState.playerToken, responseId });
    applyStateResult(result, "student");
    showMessage("Vote submitted. You can choose another finalist while voting remains open.", "success");
  }

  async function leaveRoom() {
    if (localState.roomCode && localState.playerToken) {
      try {
        await request("leave", { roomCode: localState.roomCode, playerToken: localState.playerToken });
      } catch (_error) {}
    }
    clearCurrentRoom("You left the Decision Room.", "success");
  }

  async function resetAllRooms() {
    const refs = trackedTeacherRoomRefs();
    if (!refs.length) {
      showMessage("No rooms created in this browser are available to reset.", "info");
      return;
    }
    if (!window.confirm("Reset every Decision Room created in this browser? Students in those rooms will be released.")) return;
    const result = await request("reset-all", { rooms: refs });
    writeTrackedTeacherRooms([]);
    clearCurrentRoom("Reset complete. Cleared rooms: " + Number(result.clearedRooms || 0) + ".", "success");
  }

  function bindEvents() {
    $("#openAuthBtn")?.addEventListener("click", openAuthPanel);
    $("#createRoomBtn")?.addEventListener("click", () => createRoom().catch((error) => showMessage(error.message, "error")));
    $("#joinForm")?.addEventListener("submit", (event) => joinRoom(event).catch((error) => showMessage(error.message, "error")));
    $("#copyCodeBtn")?.addEventListener("click", () => copyText(cleanRoomCode(localState.roomCode), "Room code copied."));
    $("#studentRoomLink")?.addEventListener("click", (event) => {
      if (!localState.roomCode) event.preventDefault();
    });
    $("#launchScenarioBtn")?.addEventListener("click", () => teacherAction("launch", { scenarioId: selectedScenarioId }, "Scenario launched. Students can now submit decisions.").catch((error) => showMessage(error.message, "error")));
    $("#openVoteBtn")?.addEventListener("click", () => teacherAction("open-vote", {}, "Class vote opened. Students can vote or change their vote.").catch((error) => showMessage(error.message, "error")));
    $("#revealBtn")?.addEventListener("click", () => teacherAction("reveal", {}, "Result revealed. Discuss the class decision.").catch((error) => showMessage(error.message, "error")));
    $("#resetRoundBtn")?.addEventListener("click", () => teacherAction("reset", {}, "New round ready. Choose another scenario.").catch((error) => showMessage(error.message, "error")));
    $("#closeRoomBtn")?.addEventListener("click", () => {
      if (!window.confirm("Close this Decision Room?")) return;
      teacherAction("close-room", {}, "Room closed.").then(() => clearCurrentRoom("Room closed.", "success")).catch((error) => showMessage(error.message, "error"));
    });
    $("#resetAllRoomsBtn")?.addEventListener("click", () => resetAllRooms().catch((error) => showMessage(error.message, "error")));
    $("#submitDecisionBtn")?.addEventListener("click", () => submitDecision().catch((error) => showMessage(error.message, "error")));
    $("#clearDecisionBtn")?.addEventListener("click", () => {
      $("#studentDecision").value = "";
      syncStudentTools(lastPayload);
      showMessage("Draft cleared.", "success");
    });
    $("#leaveRoomBtn")?.addEventListener("click", () => leaveRoom());
    $("#studentDecision")?.addEventListener("input", () => syncStudentTools(lastPayload));
    document.addEventListener("click", (event) => {
      const scenarioButton = event.target.closest("[data-scenario-id]");
      if (scenarioButton) {
        selectedScenarioId = scenarioButton.getAttribute("data-scenario-id");
        localState.scenarioId = selectedScenarioId;
        saveLocalState();
        renderScenarioTabs(lastPayload);
        showMessage("Scenario selected: " + scenarioButton.textContent.trim(), "success");
      }
      const nominateButton = event.target.closest("[data-nominate]");
      if (nominateButton) {
        teacherAction("nominate", { responseId: nominateButton.getAttribute("data-nominate"), tag: "Finalist" }, "Finalist list updated.").catch((error) => showMessage(error.message, "error"));
      }
      const voteButton = event.target.closest("[data-vote]");
      if (voteButton) {
        vote(voteButton.getAttribute("data-vote")).catch((error) => showMessage(error.message, "error"));
      }
    });
  }

  function startAuthPolling() {
    if (authTimer) window.clearInterval(authTimer);
    authTimer = window.setInterval(() => render(lastPayload), 1200);
  }

  function init() {
    applyRoomFromUrl();
    bindEvents();
    render(null);
    startPolling();
    startAuthPolling();
    fetchState();
  }

  init();
})();
