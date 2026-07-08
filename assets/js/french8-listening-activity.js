(function () {
  "use strict";

  var SCRIPT_FILES = {
    france: "../audio/french8-listenings-b2-france-scripts.md",
    quebec: "../audio/french8-listenings-b2-quebec-scripts.md"
  };

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
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

  function normalizeEmail(email) {
    return String(email || "").trim().toLowerCase();
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
    return (user && (user.sub || user.email)) || "";
  }

  function canSeeTranscript() {
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
    document.body.classList.toggle("can-view-transcripts", canSeeTranscript());
  }

  function renderQuestions(form, activity) {
    form.innerHTML = activity.questions.map(function (question, index) {
      return '<fieldset class="question-card" data-question="' + index + '">' +
        "<legend>" + escapeHtml(index + 1 + ". " + question[0]) + "</legend>" +
        question[1].map(function (option, optionIndex) {
          return '<label><input type="radio" name="q' + index + '" value="' + optionIndex + '"> <span>' +
            escapeHtml(option) + "</span></label>";
        }).join("") +
        '<div class="question-feedback" id="feedback-q' + index + '" aria-live="polite"></div>' +
        "</fieldset>";
    }).join("");
  }

  function buildVariants(baseActivity) {
    var quebecQuestions = window.FRENCH8_LISTENING_QUEBEC_QUESTIONS || {};
    var quebecTranscripts = window.FRENCH8_LISTENING_QUEBEC_TRANSCRIPTS || {};
    var franceFile = baseActivity.file.replace("-quebec-b2.mp3", "-france-b2.mp3");
    var quebecFile = baseActivity.file.replace("-france-b2.mp3", "-quebec-b2.mp3");
    return {
      france: Object.assign({}, baseActivity, { file: franceFile }),
      quebec: Object.assign({}, baseActivity, {
        file: quebecFile,
        questions: quebecQuestions[baseActivity.id] || baseActivity.questions,
        transcript: quebecTranscripts[baseActivity.id] || baseActivity.transcript || ""
      })
    };
  }

  function activeVariantFromMarkup() {
    return "france";
  }

  window.initFrench8ListeningActivity = function initFrench8ListeningActivity(baseActivity) {
    var player = document.getElementById("activityAudio");
    var form = document.getElementById("quizForm");
    var resultBox = document.getElementById("resultBox");
    var variants = buildVariants(baseActivity);
    var currentVariant = activeVariantFromMarkup();
    var currentActivity = variants[currentVariant] || variants.quebec;
    var answers = [];

    function resetQuiz() {
      Array.prototype.forEach.call(form.querySelectorAll('input[type="radio"]'), function (input) {
        input.checked = false;
      });
      Array.prototype.forEach.call(form.querySelectorAll(".question-card"), function (card) {
        card.classList.remove("is-correct", "is-incorrect", "is-missing");
      });
      Array.prototype.forEach.call(form.querySelectorAll(".question-feedback"), function (feedback) {
        feedback.textContent = "";
      });
      resultBox.className = "result-box";
      resultBox.textContent = "";
    }

    function applyVariant(variant) {
      currentVariant = variant === "france" ? "france" : "quebec";
      currentActivity = variants[currentVariant];
      answers = currentActivity.questions.map(function (question) { return question[2]; });
      renderQuestions(form, currentActivity);
      resetQuiz();

      if (player && player.getAttribute("src") !== currentActivity.file) {
        var rate = player.playbackRate;
        player.pause();
        player.setAttribute("src", currentActivity.file);
        player.load();
        player.playbackRate = rate;
      }

      Array.prototype.forEach.call(document.querySelectorAll("[data-audio-variant]"), function (button) {
        var active = button.getAttribute("data-audio-variant") === currentVariant;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", active ? "true" : "false");
      });
    }

    function checkQuiz() {
      var score = 0;
      var complete = true;
      answers.forEach(function (answer, index) {
        var question = currentActivity.questions[index] || [];
        var card = form.querySelector('[data-question="' + index + '"]');
        var feedback = form.querySelector("#feedback-q" + index);
        var selected = document.querySelector('input[name="q' + index + '"]:checked');
        var isCorrect = selected && Number(selected.value) === answer;
        if (card) card.classList.remove("is-correct", "is-incorrect", "is-missing");
        if (feedback) feedback.textContent = "";
        if (!selected) complete = false;
        if (isCorrect) score += 1;
        if (card && selected) card.classList.add(isCorrect ? "is-correct" : "is-incorrect");
        if (card && !selected) card.classList.add("is-missing");
        if (feedback && selected) {
          feedback.textContent = (isCorrect ? "Correct. " : "À revoir. ") + (question[3] || "Réécoutez le passage correspondant et vérifiez l'information exacte.");
        }
      });
      if (!complete) {
        resultBox.className = "result-box incorrect";
        resultBox.textContent = "Répondez aux 10 questions avant de corriger.";
        return;
      }
      resultBox.className = score >= 8 ? "result-box correct" : "result-box incorrect";
      resultBox.textContent = "Résultat : " + score + "/10. " + (score >= 8
        ? "Très bon travail : vous avez compris les idées principales et plusieurs détails."
        : "Réécoutez l'audio en prenant des notes sur les causes, les conséquences et les nuances.");
    }

    function downloadCurrentTranscript() {
      if (!canSeeTranscript()) return;
      var label = currentVariant === "quebec" ? "Québec" : "France";
      fetch(SCRIPT_FILES[currentVariant], { cache: "no-store" })
        .then(function (response) {
          if (!response.ok) throw new Error("HTTP " + response.status);
          return response.text();
        })
        .then(function (markdown) {
          var transcript = transcriptSection(markdown, baseActivity.id) || currentActivity.transcript || "";
          downloadTranscriptPdf(currentActivity.title + " - " + label, transcript, "transcription-niveau8-" + baseActivity.id + "-" + currentVariant + ".pdf");
        })
        .catch(function () {
          downloadTranscriptPdf(currentActivity.title + " - " + label, currentActivity.transcript || "Transcription indisponible.", "transcription-niveau8-" + baseActivity.id + "-" + currentVariant + ".pdf");
        });
    }

    document.getElementById("checkBtn").addEventListener("click", checkQuiz);
    document.getElementById("resetBtn").addEventListener("click", resetQuiz);
    document.querySelector("[data-transcript-button]").addEventListener("click", downloadCurrentTranscript);
    Array.prototype.forEach.call(document.querySelectorAll("[data-audio-variant]"), function (button) {
      button.addEventListener("click", function () {
        applyVariant(button.getAttribute("data-audio-variant"));
      });
    });

    applyVariant(currentVariant);
    updateTranscriptAccess();
    window.addEventListener("storage", updateTranscriptAccess);
    window.addEventListener("focus", updateTranscriptAccess);
    var checks = 0;
    var timer = setInterval(function () {
      updateTranscriptAccess();
      checks += 1;
      if (checks > 12) clearInterval(timer);
    }, 800);
  };
})();
