(function () {
  "use strict";

  var STORAGE_KEY = "jaralingua_french8_audio_library_v1";
  var SCRIPT_FILES = {
    france: "audio/french8-listenings-b2-france-scripts.md",
    quebec: "audio/french8-listenings-b2-quebec-scripts.md"
  };
  var WORKSHOPS = {
    "01a": "ateliers/comprehension-orale-01a-choix-carriere.html?audio-variants=2",
    "01b": "ateliers/comprehension-orale-01b-regrets-francais.html?audio-variants=2",
    "01c": "ateliers/comprehension-orale-01c-projet-municipal.html?audio-variants=2",
    "02a": "ateliers/comprehension-orale-02a-si-javais-su.html?audio-variants=2",
    "02b": "ateliers/comprehension-orale-02b-et-si-histoire.html?audio-variants=2",
    "02c": "ateliers/comprehension-orale-02c-accident-evite.html?audio-variants=2"
  };

  function readState() {
    try {
      var value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      return value && typeof value === "object" ? value : {};
    } catch (error) {
      return {};
    }
  }

  function writeState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    updateSummary();
  }

  function activityId(card) {
    var source = card.querySelector(".accent-toggle button[data-src]");
    var match = source && source.dataset.src.match(/n8-(\d{2}[abc])-/i);
    return match ? match[1].toLowerCase() : "";
  }

  function normalizeEmail(value) {
    return String(value || "").trim().toLowerCase();
  }

  function readUser() {
    var keys = ["jaralingua_google_user", "jaralingua_microsoft_user"];
    for (var i = 0; i < keys.length; i += 1) {
      try {
        var user = JSON.parse(sessionStorage.getItem(keys[i]) || "null");
        if (user && (!user.exp || Date.now() / 1000 <= user.exp)) return user;
      } catch (error) {}
    }
    return null;
  }

  function userId(user) {
    return String((user && (user.sub || user.id || user.email)) || "");
  }

  function canSeeTranscripts() {
    var user = readUser();
    if (!user) return false;
    if (normalizeEmail(user.email) === "cdavid.jaramillo@gmail.com") return true;
    try {
      var requests = JSON.parse(localStorage.getItem("jaralingua_role_requests") || "[]");
      var id = userId(user);
      return Array.isArray(requests) && requests.some(function (request) {
        return request.status === "approved" &&
          (request.role === "teacher" || request.role === "admin") &&
          (request.id === id || normalizeEmail(request.email) === normalizeEmail(user.email));
      });
    } catch (error) {
      return false;
    }
  }

  function updateTranscriptAccess() {
    document.body.classList.toggle("can-view-transcripts", canSeeTranscripts());
  }

  function updateSummary() {
    var listened = Object.keys(state).filter(function (id) { return state[id].listened; }).length;
    var favorites = Object.keys(state).filter(function (id) { return state[id].favorite; }).length;
    var listenedNode = document.getElementById("audioListenedCount");
    var favoriteNode = document.getElementById("audioFavoriteCount");
    if (listenedNode) listenedNode.textContent = listened;
    if (favoriteNode) favoriteNode.textContent = favorites;
  }

  function updateCard(card) {
    var id = card.dataset.audioId;
    var item = state[id] || {};
    var status = card.querySelector("[data-listening-status]");
    var favorite = card.querySelector("[data-favorite]");
    card.classList.toggle("is-listened", Boolean(item.listened));
    card.classList.toggle("is-favorite", Boolean(item.favorite));
    if (status) {
      status.innerHTML = item.listened
        ? '<i class="bi bi-check-circle-fill"></i> Écouté'
        : '<i class="bi bi-circle"></i> À écouter';
    }
    if (favorite) {
      favorite.classList.toggle("active", Boolean(item.favorite));
      favorite.setAttribute("aria-pressed", item.favorite ? "true" : "false");
      favorite.innerHTML = item.favorite
        ? '<i class="bi bi-heart-fill"></i> Favori'
        : '<i class="bi bi-heart"></i> Ajouter aux favoris';
    }
  }

  function selectedAccent(card) {
    var selected = card.querySelector(".accent-toggle button.active");
    return selected && selected.dataset.accent === "quebec" ? "quebec" : "france";
  }

  function transcriptSection(markdown, id) {
    var marker = new RegExp("^## Audio " + id + "\\b.*$", "im");
    var match = marker.exec(markdown);
    if (!match) return "";
    var section = markdown.slice(match.index);
    var remainder = section.slice(match[0].length);
    var next = remainder.search(/^## Audio \d{2}[abc]\b/im);
    if (next >= 0) section = section.slice(0, match[0].length + next);
    return section
      .replace(/^## .*$/m, "")
      .replace(/^File:.*$/m, "")
      .trim();
  }

  function showTranscript(card) {
    if (!canSeeTranscripts()) return;
    var id = card.dataset.audioId;
    var accent = selectedAccent(card);
    var title = card.querySelector("h3").textContent.trim();
    var modalTitle = document.getElementById("transcriptModalTitle");
    var modalBody = document.getElementById("transcriptModalBody");
    modalTitle.textContent = title + " · " + (accent === "quebec" ? "Québec" : "France");
    modalBody.textContent = "Chargement de la transcription…";
    bootstrap.Modal.getOrCreateInstance(document.getElementById("transcriptModal")).show();
    fetch(SCRIPT_FILES[accent], { cache: "no-store" })
      .then(function (response) {
        if (!response.ok) throw new Error("HTTP " + response.status);
        return response.text();
      })
      .then(function (markdown) {
        var text = transcriptSection(markdown, id);
        modalBody.textContent = text || "Transcription indisponible pour cette écoute.";
      })
      .catch(function () {
        modalBody.textContent = "Impossible de charger la transcription.";
      });
  }

  function buildTools(card, id) {
    var tools = document.createElement("div");
    tools.className = "audio-study-tools";
    tools.innerHTML =
      '<div class="speed-control" role="group" aria-label="Vitesse de lecture"><span>Vitesse</span>' +
      '<button type="button" class="library-speed-btn" data-speed="0.75" aria-pressed="false">0.75x</button>' +
      '<button type="button" class="library-speed-btn active" data-speed="1" aria-pressed="true">1x</button>' +
      '<button type="button" class="library-speed-btn" data-speed="1.25" aria-pressed="false">1.25x</button></div>' +
      '<button type="button" class="library-tool-button" data-favorite aria-pressed="false"></button>' +
      '<span class="listening-status" data-listening-status></span>' +
      (WORKSHOPS[id]
        ? '<a class="library-tool-link" href="' + WORKSHOPS[id] + '"><i class="bi bi-ui-checks-grid"></i> Questionnaire</a>'
        : '') +
      '<button type="button" class="library-tool-button teacher-only" data-transcript><i class="bi bi-file-text"></i> Transcription</button>';
    card.querySelector(".audio-body").appendChild(tools);
    return tools;
  }

  var state = readState();
  var cards = Array.prototype.slice.call(document.querySelectorAll(".audio-card"));
  var players = Array.prototype.slice.call(document.querySelectorAll(".audio-card audio"));

  cards.forEach(function (card) {
    var id = activityId(card);
    if (!id) return;
    card.dataset.audioId = id;
    if (!state[id]) state[id] = {};
    var audio = card.querySelector("audio");
    var tools = buildTools(card, id);

    tools.querySelectorAll("[data-speed]").forEach(function (speedButton) {
      speedButton.addEventListener("click", function () {
        var speed = Number(speedButton.dataset.speed) || 1;
        audio.playbackRate = speed;
        tools.querySelectorAll("[data-speed]").forEach(function (candidate) {
          var active = candidate === speedButton;
          candidate.classList.toggle("active", active);
          candidate.setAttribute("aria-pressed", active ? "true" : "false");
        });
      });
    });
    tools.querySelector("[data-favorite]").addEventListener("click", function () {
      state[id].favorite = !state[id].favorite;
      writeState();
      updateCard(card);
    });
    tools.querySelector("[data-transcript]").addEventListener("click", function () {
      showTranscript(card);
    });
    audio.addEventListener("play", function () {
      players.forEach(function (other) { if (other !== audio) other.pause(); });
    });
    audio.addEventListener("ended", function () {
      state[id].listened = true;
      writeState();
      updateCard(card);
    });
    audio.addEventListener("timeupdate", function () {
      if (!state[id].listened && audio.duration && audio.currentTime / audio.duration >= 0.9) {
        state[id].listened = true;
        writeState();
        updateCard(card);
      }
    });
    updateCard(card);
  });

  document.querySelectorAll(".accent-toggle button").forEach(function (button) {
    button.addEventListener("click", function () {
      var toggle = this.parentElement;
      var active = toggle.querySelector(".active");
      if (active) active.classList.remove("active");
      this.classList.add("active");
      var audio = toggle.parentElement.querySelector("audio");
      var rate = audio.playbackRate;
      audio.querySelector("source").src = this.dataset.src;
      audio.load();
      audio.playbackRate = rate;
    });
  });

  document.querySelectorAll("#formatFilter button").forEach(function (button) {
    button.addEventListener("click", function () {
      var active = document.querySelector("#formatFilter .active");
      if (active) active.classList.remove("active");
      this.classList.add("active");
      var format = this.dataset.format;
      cards.forEach(function (card) {
        card.style.display = format === "all" || card.dataset.format === format ? "" : "none";
      });
    });
  });

  updateSummary();
  updateTranscriptAccess();
  window.addEventListener("storage", updateTranscriptAccess);
  window.addEventListener("focus", updateTranscriptAccess);
})();
