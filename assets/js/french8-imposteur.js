(function () {
  "use strict";

  var API = "/api/french8/imposteur";
  var STATE_API = "/api/french8/imposteur/state";
  var STORAGE_KEY = "french8-imposteur-live-state";
  var POLL_MS = 1800;

  var localState = loadLocalState();
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
    if (roomInput && localState.roomCode) roomInput.value = localState.roomCode;
    if (teacherRoomInput && localState.roomCode) teacherRoomInput.value = localState.roomCode;
  }

  function startPolling() {
    if (pollTimer) window.clearInterval(pollTimer);
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
    updateTeacherButtons(null);
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
    var canDistribute = isTeacher && status === "waiting" && Number(room.playerCount || 0) >= Number(room.minPlayers || 4);
    var canForce = isTeacher && status === "briefing";
    var canVote = isTeacher && (status === "discussion" || status === "briefing");
    var canReveal = isTeacher && (status === "voting" || status === "discussion");
    setDisabled("#distributeBtn", !canDistribute);
    setDisabled("#forceDiscussionBtn", !canForce);
    setDisabled("#openVoteBtn", !canVote);
    setDisabled("#revealBtn", !canReveal);
    setDisabled("#resetBtn", !isTeacher || status === "waiting");
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
      showMessage(action === "open-vote" ? "Vote ouvert pour tous les étudiants." : "Action professeur appliquée.", "success");
    } catch (error) {
      showMessage(messageForError(error), "error");
    }
  }

  async function confirmRole() {
    try {
      var result = await request("confirm", { roomCode: localState.roomCode, playerToken: localState.playerToken });
      lastPayload = result.state;
      render(lastPayload);
      showMessage("Rôle confirmé.", "success");
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
    applyStoredFields();
    bindEvents();
    renderEmpty();
    if (localState.roomCode) {
      refreshState();
      startPolling();
    }
  });
})();
