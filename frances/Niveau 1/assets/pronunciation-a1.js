(() => {
  "use strict";

  const SETS = {
    "theme-1": {
      title: "Premiers contacts à voix haute",
      audio: "../audio/prononciation/stages/theme-1-defi.mp3",
      audios: [
        "../audio/prononciation/stages/theme-1-stage-1.mp3",
        "../audio/prononciation/stages/theme-1-stage-2.mp3",
        "../audio/prononciation/stages/theme-1-stage-3.mp3",
        "../audio/prononciation/stages/theme-1-defi.mp3"
      ],
      back: "../ateliers-activites.html#theme-01",
      image: "../img/ateliers/prononciation-premiers-contacts.png",
      stages: [
        "Bonjour, je m’appelle Lina.",
        "Je suis colombienne et j’habite à Bogotá.",
        "Enchantée ! Comment vous appelez-vous ?",
        "Bonjour, je m’appelle Lina. Je suis colombienne et j’habite à Bogotá. Enchantée ! Comment vous appelez-vous ?"
      ],
      tips: [
        ["bi-chat-dots", "Dans « je m’appelle », gardez le rythme court : je / m’appelle."],
        ["bi-soundwave", "Le son « ou » de « vous » est arrondi. Ne le prononcez pas comme le « u » français."],
        ["bi-pause-circle", "Faites une pause légère après « Bonjour » et après « Enchantée »."]
      ]
    },
    "theme-2": {
      title: "Présent et verbes en -er à voix haute",
      audio: "../audio/prononciation/stages/theme-2-defi.mp3",
      audios: [
        "../audio/prononciation/stages/theme-2-stage-1.mp3",
        "../audio/prononciation/stages/theme-2-stage-2.mp3",
        "../audio/prononciation/stages/theme-2-stage-3.mp3",
        "../audio/prononciation/stages/theme-2-defi.mp3"
      ],
      back: "../ateliers-activites.html#theme-02",
      image: "../img/ateliers/prononciation-verbes-er.png",
      stages: [
        "Je parle français tous les jours.",
        "Tu écoutes la radio le matin.",
        "Nous travaillons ensemble.",
        "Je parle français tous les jours. Tu écoutes la radio le matin. Nous travaillons ensemble."
      ],
      tips: [
        ["bi-volume-mute", "Les terminaisons -e, -es et -ent ne se prononcent pas dans les verbes du premier groupe."],
        ["bi-link-45deg", "Dans « nous travaillons ensemble », faites la liaison entre « travaillons » et « ensemble »."],
        ["bi-music-note", "Gardez un rythme régulier : sujet + verbe + complément."]
      ]
    },
    "theme-3": {
      title: "Verbes essentiels à voix haute",
      audio: "../audio/prononciation/stages/theme-3-defi.mp3",
      audios: [
        "../audio/prononciation/stages/theme-3-stage-1.mp3",
        "../audio/prononciation/stages/theme-3-stage-2.mp3",
        "../audio/prononciation/stages/theme-3-stage-3.mp3",
        "../audio/prononciation/stages/theme-3-defi.mp3"
      ],
      back: "../ateliers-activites.html#theme-04",
      image: "../img/ateliers/prononciation-verbes-essentiels.png",
      stages: [
        "Je suis étudiante et j’ai vingt ans.",
        "Je vais en cours à huit heures.",
        "Je fais mes exercices le soir.",
        "Je suis étudiante et j’ai vingt ans. Je vais en cours à huit heures. Je fais mes exercices le soir."
      ],
      tips: [
        ["bi-exclamation-circle", "Dans « je suis », le s final de « suis » ne se prononce pas."],
        ["bi-soundwave", "Le son « ai » dans « j’ai » se prononce comme « é » ou « è » selon l’accent."],
        ["bi-clock", "Ne lisez pas trop vite : les verbes irréguliers doivent rester très clairs."]
      ]
    },
    "theme-4": {
      title: "Famille et relations à voix haute",
      audio: "../audio/prononciation/stages/theme-4-defi.mp3",
      audios: [
        "../audio/prononciation/stages/theme-4-stage-1.mp3",
        "../audio/prononciation/stages/theme-4-stage-2.mp3",
        "../audio/prononciation/stages/theme-4-stage-3.mp3",
        "../audio/prononciation/stages/theme-4-defi.mp3"
      ],
      back: "../ateliers-activites.html#theme-05",
      image: "../img/ateliers/prononciation-famille.png",
      stages: [
        "Voici ma famille.",
        "Mon frère s’appelle Lucas.",
        "Mes grands-parents habitent à Lyon.",
        "Voici ma famille. Mon frère s’appelle Lucas. Mes grands-parents habitent à Lyon."
      ],
      tips: [
        ["bi-person-hearts", "Dans « frère », ouvrez bien le son « è »."],
        ["bi-volume-mute", "Dans « grands-parents », le d de « grands » est muet."],
        ["bi-link-45deg", "Dans « habitent à », faites une liaison douce : habitent-à."]
      ]
    },
    "theme-5": {
      title: "Description, professions et présent progressif à voix haute",
      audio: "../audio/prononciation/stages/theme-5-defi.mp3",
      audios: [
        "../audio/prononciation/stages/theme-5-stage-1.mp3",
        "../audio/prononciation/stages/theme-5-stage-2.mp3",
        "../audio/prononciation/stages/theme-5-stage-3.mp3",
        "../audio/prononciation/stages/theme-5-defi.mp3"
      ],
      back: "../ateliers-activites.html#theme-6",
      image: "../img/ateliers/prononciation-description.png",
      stages: [
        "Elle est souriante et généreuse.",
        "Elle a les cheveux noirs.",
        "Elle porte des lunettes rondes.",
        "Elle est souriante et généreuse. Elle a les cheveux noirs. Elle porte des lunettes rondes."
      ],
      tips: [
        ["bi-link-45deg", "Dans « elle est », la liaison est naturelle : elle-est."],
        ["bi-volume-mute", "Dans « noirs » et « rondes », les consonnes finales restent très légères."],
        ["bi-emoji-smile", "Pour décrire une personne, gardez une intonation chaleureuse et claire."]
      ]
    },
    "theme-7": {
      title: "Maison et environnement à voix haute",
      audio: "../audio/prononciation/stages/theme-7-defi.mp3",
      audios: [
        "../audio/prononciation/stages/theme-7-stage-1.mp3",
        "../audio/prononciation/stages/theme-7-stage-2.mp3",
        "../audio/prononciation/stages/theme-7-stage-3.mp3",
        "../audio/prononciation/stages/theme-7-defi.mp3"
      ],
      back: "../ateliers-activites.html#theme-7",
      image: "../img/ateliers/prononciation-maison.png",
      stages: [
        "Dans ma chambre, il y a un lit près de la fenêtre.",
        "La lampe est sur la table de nuit.",
        "Il n’y a pas de balcon.",
        "Dans ma chambre, il y a un lit près de la fenêtre. La lampe est sur la table de nuit. Il n’y a pas de balcon."
      ],
      tips: [
        ["bi-house-door", "Dans « chambre », gardez le son nasal de « an » et ne prononcez pas le b séparément."],
        ["bi-link-45deg", "Dans « il y a », dites les trois mots comme un groupe très fluide : il-y-a."],
        ["bi-volume-mute", "Dans « lit », « près » et « balcon », les consonnes finales restent très légères ou muettes selon le mot."]
      ]
    },
    "theme-8": {
      title: "Commander au café à voix haute",
      audio: "../audio/prononciation/stages/theme-8-defi.mp3",
      audios: [
        "../audio/prononciation/stages/theme-8-stage-1.mp3",
        "../audio/prononciation/stages/theme-8-stage-2.mp3",
        "../audio/prononciation/stages/theme-8-stage-3.mp3",
        "../audio/prononciation/stages/theme-8-defi.mp3"
      ],
      back: "../ateliers-activites.html#theme-8",
      image: "../img/ateliers/prononciation-alimentation.png",
      stages: [
        "Je voudrais un café et un croissant.",
        "Je prends de l’eau et de la salade.",
        "Ça coûte six euros cinquante.",
        "Je voudrais un café et un croissant. Je prends de l’eau et de la salade. Ça coûte six euros cinquante."
      ],
      tips: [
        ["bi-cup-hot", "Dans « voudrais », gardez le son /u/ de « vou » et ne prononcez pas le s final."],
        ["bi-droplet", "Dans « de l’eau », faites une liaison fluide : de-l’eau, sans pause entre les deux mots."],
        ["bi-currency-euro", "Dans « six euros », prononcez la liaison : si-z-euros. Dans « cinquante », la finale reste claire."]
      ]
    },
    "theme-9": {
      title: "Transports, heure et projets à voix haute",
      audio: "../audio/prononciation/stages/theme-9-defi.mp3",
      audios: [
        "../audio/prononciation/stages/theme-9-stage-1.mp3",
        "../audio/prononciation/stages/theme-9-stage-2.mp3",
        "../audio/prononciation/stages/theme-9-stage-3.mp3",
        "../audio/prononciation/stages/theme-9-defi.mp3"
      ],
      back: "../ateliers-activites.html#theme-9",
      image: "../img/ateliers/prononciation-transports-futur-proche.png",
      stages: [
        "Je vais prendre le métro à huit heures.",
        "Nous allons au centre-ville en bus.",
        "Elle vient d’arriver à la station.",
        "Je vais prendre le métro à huit heures. Nous allons au centre-ville en bus. Elle vient d’arriver à la station."
      ],
      tips: [
        ["bi-train-front", "Dans « métro », gardez le son fermé de « é » et ne prononcez pas de consonne finale."],
        ["bi-clock", "Dans « huit heures », faites la liaison naturelle : hui-t-heures."],
        ["bi-link-45deg", "Dans « vient d’arriver », enchaînez doucement « d’ » avec « arriver »."]
      ]
    }
  };

  const params = new URLSearchParams(location.search);
  const key = params.get("theme") || "theme-1";
  const set = SETS[key] || SETS["theme-1"];
  const API_PATH = "/api/french8/pronunciation-assessment";
  const GRADE_API_PATH = "/api/french1/pronunciation-grade";
  const STORAGE_KEY = `jaralingua:french1:pronunciation:${key}:v2`;
  const GOOGLE_KEY = "jaralingua_google_user";
  const MICROSOFT_KEY = "jaralingua_microsoft_user";
  const LOCAL_KEY = "jaralingua_local_gradebook_user:french1GradesApp";
  const EVALUABLE_PRONUNCIATION = {
    "theme-1": { evaluationId: "pronunciationTheme1", label: "Thème 1 · Premiers contacts" },
    "theme-3": { evaluationId: "pronunciationTheme3", label: "Thème 3 · Verbes essentiels" },
    "theme-5": { evaluationId: "pronunciationTheme5", label: "Thème 5 · Description et professions" },
    "theme-7": { evaluationId: "pronunciationTheme7", label: "Thème 7 · Maison et localisation" }
  };
  const COURSE_EVALUABLE_PRONUNCIATION = {
    "theme-1": { evaluationId: "pronunciationTheme1", label: "Thème 1 · Premiers contacts" },
    "theme-2": { evaluationId: "pronunciationTheme3", label: "Thème 3 · Les verbes du premier groupe" },
    "theme-4": { evaluationId: "pronunciationTheme5", label: "Thème 5 · Famille et relations" },
    "theme-7": { evaluationId: "pronunciationTheme7", label: "Thème 7 · Maison et environnement" }
  };
  const gradeConfig = COURSE_EVALUABLE_PRONUNCIATION[key] || null;

  const els = {
    title: document.getElementById("pronTitle"),
    modelAudio: document.getElementById("modelAudio"),
    modelButton: document.getElementById("modelButton"),
    stageCounter: document.getElementById("stageCounter"),
    stageTitle: document.getElementById("stageTitle"),
    stageProgress: document.getElementById("stageProgress"),
    readingText: document.getElementById("readingText"),
    wordHelp: document.getElementById("wordHelp"),
    micStatus: document.getElementById("micStatus"),
    recordBtn: document.getElementById("recordBtn"),
    stopBtn: document.getElementById("stopBtn"),
    retryBtn: document.getElementById("retryBtn"),
    nextBtn: document.getElementById("nextBtn"),
    playback: document.getElementById("recordingPlayback"),
    timer: document.getElementById("timer"),
    recordHelp: document.getElementById("recordHelp"),
    micPermissionHelp: document.getElementById("micPermissionHelp"),
    feedback: document.getElementById("feedback"),
    tips: document.getElementById("tips"),
    microphoneSelect: document.getElementById("microphoneSelect"),
    levelMeterBar: document.getElementById("levelMeterBar"),
    levelMeterValue: document.getElementById("levelMeterValue"),
    comparisonNote: document.getElementById("comparisonNote"),
    results: document.getElementById("results"),
    stageHistory: document.getElementById("stageHistory"),
    resultTitle: document.getElementById("resultTitle"),
    overallScore: document.getElementById("overallScore"),
    accuracyScore: document.getElementById("accuracyScore"),
    completenessScore: document.getElementById("completenessScore"),
    fluencyScore: document.getElementById("fluencyScore"),
    scoreRing: document.getElementById("scoreRing")
  };

  function storedUser(storageKey) {
    try {
      const saved = JSON.parse(sessionStorage.getItem(storageKey) || "null");
      if (!saved || !saved.credential || saved.exp <= Date.now() / 1000) {
        sessionStorage.removeItem(storageKey);
        return null;
      }
      return saved;
    } catch (_error) {
      sessionStorage.removeItem(storageKey);
      return null;
    }
  }

  function activeGradeUser() {
    const google = storedUser(GOOGLE_KEY);
    if (google) return Object.assign({ provider: "google" }, google);
    const microsoft = storedUser(MICROSOFT_KEY);
    if (microsoft) return Object.assign({ provider: "microsoft" }, microsoft);
    const local = storedUser(LOCAL_KEY);
    if (local) return Object.assign({ provider: "local" }, local);
    return null;
  }

  function openLoginPanel() {
    document.querySelector("[data-auth-toggle], [data-auth-nav-toggle]")?.click();
  }

  function gradeFromScore(score) {
    return Math.round((Number(score || 0) / 20) * 100) / 100;
  }

  let gradeSubmitter = null;

  function createGradeSubmitPanel() {
    if (!gradeConfig) return null;
    const panel = document.createElement("div");
    panel.className = "pronunciation-submit-panel";
    panel.innerHTML = `
      <h3><i class="bi bi-send-check"></i> Envoi au professeur</h3>
      <p data-pronunciation-submit-copy>Cette activité est évaluée. Terminez le défi final pour envoyer la note obtenue au professeur.</p>
      <div class="pronunciation-submit-metrics">
        <span><b data-pronunciation-score>--</b><small>Défi final</small></span>
        <span><b data-pronunciation-grade>--</b><small>Note / 5</small></span>
      </div>
      <div class="pronunciation-submit-actions">
        <button type="button" class="action-button submit-grade" data-pronunciation-submit disabled><i class="bi bi-send-fill"></i> Envoyer au professeur</button>
      </div>
      <p class="pronunciation-submit-status" data-pronunciation-submit-status aria-live="polite"></p>
    `;
    const scoreNode = panel.querySelector("[data-pronunciation-score]");
    const gradeNode = panel.querySelector("[data-pronunciation-grade]");
    const submitButton = panel.querySelector("[data-pronunciation-submit]");
    const copyNode = panel.querySelector("[data-pronunciation-submit-copy]");
    const statusNode = panel.querySelector("[data-pronunciation-submit-status]");

    function finalAttempt() {
      return stageScores[set.stages.length - 1] || null;
    }

    function setStatus(message, type) {
      statusNode.textContent = message || "";
      statusNode.className = "pronunciation-submit-status" + (type ? " " + type : "");
    }

    function update() {
      const attempt = finalAttempt();
      const score = Number(attempt && attempt.overall);
      if (!Number.isFinite(score)) {
        scoreNode.textContent = "--";
        gradeNode.textContent = "--";
        submitButton.disabled = true;
        copyNode.textContent = `${gradeConfig.label} est évaluable. Le bouton s’active après le défi final.`;
        return;
      }
      scoreNode.textContent = `${Math.round(score)}/100`;
      gradeNode.textContent = `${gradeFromScore(score).toFixed(2)}/5`;
      submitButton.disabled = false;
      copyNode.textContent = "Votre défi final peut être envoyé avec la note obtenue. La note sera inscrite dans le carnet du Niveau 1.";
    }

    async function submitGrade() {
      const attempt = finalAttempt();
      const score = Number(attempt && attempt.overall);
      if (!Number.isFinite(score)) {
        setStatus("Terminez d'abord le défi final avant d'envoyer.", "error");
        update();
        return;
      }
      const user = activeGradeUser();
      if (!user || !user.credential) {
        setStatus("Connectez-vous avec votre compte enregistré avant d’envoyer.", "error");
        openLoginPanel();
        return;
      }
      submitButton.disabled = true;
      setStatus("Envoi en cours...", "pending");
      try {
        const response = await fetch(GRADE_API_PATH, {
          method: "POST",
          headers: {
            Authorization: "Bearer " + user.credential,
            "X-Jaralingua-Auth-Provider": user.provider || "google",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            evaluationId: gradeConfig.evaluationId,
            score100: Math.round(score),
            activityTitle: set.title,
            details: attempt
          })
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          if (payload.error === "score_too_low") throw new Error("La note obtenue devrait pouvoir être envoyée. Actualisez la page et réessayez.");
          if (payload.error === "student_not_authorized") throw new Error("Votre compte n’est pas associé au carnet du Niveau 1.");
          throw new Error("L’envoi n’a pas pu être terminé.");
        }
        setStatus("Envoyé. Note enregistrée : " + Number(payload.grade).toFixed(2) + "/5.", "success");
      } catch (error) {
        setStatus(error.message || "Impossible d’envoyer la note.", "error");
      } finally {
        update();
      }
    }

    submitButton.addEventListener("click", submitGrade);
    update();
    return { panel, update };
  }

  let savedProgress = null;
  try { savedProgress = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"); } catch (_error) { savedProgress = null; }

  let stageIndex = Number.isInteger(savedProgress?.stageIndex) ? Math.max(0, Math.min(set.stages.length - 1, savedProgress.stageIndex)) : 0;
  const stageScores = Array.from({ length: set.stages.length }, (_, index) => savedProgress?.stageScores?.[index] || null);
  const attemptHistory = Array.from({ length: set.stages.length }, (_, index) => Array.isArray(savedProgress?.attemptHistory?.[index]) ? savedProgress.attemptHistory[index] : []);
  let stream = null;
  let recorder = null;
  let chunks = [];
  let startedAt = 0;
  let recordedDurationMs = 0;
  let timerHandle = null;
  let objectUrl = null;
  let audioContext = null;
  let analyser = null;
  let meterFrame = null;
  let analyzing = false;

  gradeSubmitter = createGradeSubmitPanel();
  if (gradeSubmitter) {
    els.results.insertAdjacentElement("afterend", gradeSubmitter.panel);
  }

  function currentText() {
    return set.stages[stageIndex];
  }

  function currentModelAudio() {
    return set.audios?.[stageIndex] || set.audio;
  }

  function isFinalStage() {
    return stageIndex === set.stages.length - 1;
  }

  function saveProgress() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ stageIndex, stageScores, attemptHistory }));
  }

  function deviceGuide() {
    const agent = navigator.userAgent || "";
    const isiOS = /iPad|iPhone|iPod/.test(agent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const isAndroid = /Android/i.test(agent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(agent);
    if (isiOS) {
      return [
        "iPhone/iPad Safari : touchez AA ou l’icône du site, puis Réglages du site web, Microphone, Autoriser.",
        "Si le blocage continue : Réglages iOS > Safari > Microphone > Autoriser ou Demander.",
        "Rechargez ensuite cette page et touchez à nouveau le micro."
      ];
    }
    if (isAndroid) {
      return [
        "Android Chrome : touchez le cadenas près de l’adresse, puis Autorisations, Microphone, Autoriser.",
        "Si nécessaire : Paramètres Android > Applications > Chrome > Autorisations > Microphone.",
        "Rechargez ensuite cette page et touchez à nouveau le micro."
      ];
    }
    if (isSafari) {
      return [
        "Mac Safari : Safari > Réglages pour ce site web > Microphone > Autoriser.",
        "Vous pouvez aussi vérifier Réglages système > Confidentialité et sécurité > Microphone.",
        "Rechargez ensuite cette page et touchez à nouveau le micro."
      ];
    }
    return [
      "Chrome/Edge/Brave sur ordinateur : cliquez sur le cadenas à gauche de l’adresse, puis Microphone, Autoriser.",
      "Vérifiez aussi les paramètres système : Windows ou macOS doit autoriser le navigateur à utiliser le micro.",
      "Rechargez ensuite cette page et touchez à nouveau le micro."
    ];
  }

  async function microphonePermissionState() {
    if (!navigator.permissions?.query) return "unknown";
    try {
      const permission = await navigator.permissions.query({ name: "microphone" });
      return permission.state || "unknown";
    } catch (_error) {
      return "unknown";
    }
  }

  function showPermissionHelp(title, detail, options = {}) {
    if (!els.micPermissionHelp) return;
    const guide = options.guide || deviceGuide();
    els.micPermissionHelp.hidden = false;
    els.micPermissionHelp.innerHTML = `
      <strong><i class="bi bi-mic-mute"></i> ${title}</strong>
      <span>${detail}</span>
      <ul>${guide.map((item) => `<li>${item}</li>`).join("")}</ul>
    `;
  }

  function hidePermissionHelp() {
    if (els.micPermissionHelp) {
      els.micPermissionHelp.hidden = true;
      els.micPermissionHelp.innerHTML = "";
    }
  }

  async function updateMicrophoneReadiness() {
    if (location.protocol === "file:") {
      els.recordBtn.disabled = true;
      els.stopBtn.disabled = true;
      els.micStatus.textContent = "Le microphone ne fonctionne pas en mode fichier.";
      els.recordHelp.textContent = "Ouvrez cette activité depuis le site HTTPS de JaraLingua ou depuis localhost.";
      showPermissionHelp("Mode fichier détecté", "Les navigateurs bloquent le microphone sur les adresses file://.", {
        guide: ["Utilisez https://www.jaralingua.com ou une adresse localhost.", "Rechargez la page, puis touchez le bouton du micro."]
      });
      return;
    }
    if (!window.isSecureContext) {
      els.recordBtn.disabled = true;
      els.stopBtn.disabled = true;
      els.micStatus.textContent = "Connexion non sécurisée.";
      els.recordHelp.textContent = "Le microphone exige HTTPS ou localhost.";
      showPermissionHelp("HTTPS requis", "Le navigateur ne peut demander l’autorisation du micro que sur une page sécurisée.", {
        guide: ["Ouvrez la page avec https://www.jaralingua.com.", "Sur ordinateur, localhost fonctionne aussi pour les tests locaux."]
      });
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      els.recordBtn.disabled = true;
      els.stopBtn.disabled = true;
      els.micStatus.textContent = "Ce navigateur ne prend pas en charge l’enregistrement audio.";
      els.recordHelp.textContent = "Essayez Chrome, Edge, Safari récent ou Firefox à jour.";
      showPermissionHelp("Navigateur non compatible", "Cette activité nécessite getUserMedia et MediaRecorder.", {
        guide: ["Android : utilisez Chrome à jour.", "iPhone/iPad : utilisez Safari à jour.", "PC/Mac : utilisez Chrome, Edge, Firefox ou Safari récent."]
      });
      return;
    }
    const permission = await microphonePermissionState();
    if (permission === "denied") {
      els.micStatus.textContent = "Microphone bloqué pour ce site.";
      els.recordHelp.textContent = "Le navigateur ne montrera plus la fenêtre d’autorisation tant que le site restera bloqué.";
      showPermissionHelp("Autorisation déjà bloquée", "Débloquez le microphone dans les paramètres du site, rechargez la page, puis touchez à nouveau le micro.");
      return;
    }
    hidePermissionHelp();
    setRecordingControls(false, false);
    els.recordHelp.textContent = permission === "prompt"
      ? "Touchez le micro : le navigateur doit vous demander d’autoriser l’accès."
      : "Microphone prêt. Touchez le micro pour commencer.";
  }

  function normalizeWord(value) {
    return value
      .toLocaleLowerCase("fr-FR")
      .replace(/[\u2019’]/g, "'")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/œ/g, "oe")
      .replace(/æ/g, "ae")
      .replace(/[^a-z'-]/g, "")
      .replace(/^[-']+|[-']+$/g, "");
  }

  function tokens(value) {
    return value.split(/\s+/).map(normalizeWord).filter(Boolean);
  }

  function spokenWord(value) {
    return value.replace(/[.,!?;:()[\]{}«»"]/g, "").trim();
  }

  function renderReference(states = []) {
    let index = 0;
    els.readingText.innerHTML = currentText().split(/(\s+)/).map((part) => {
      if (/^\s+$/.test(part)) return part;
      const state = states[index++] || "";
      const clean = spokenWord(part);
      return `<button type="button" class="reading-word ${state}" data-word="${clean}" title="Écouter ce mot">${part}</button>`;
    }).join("");
  }

  function renderStageProgress() {
    els.stageProgress.innerHTML = set.stages.map((_, index) => {
      const classes = ["stage-dot"];
      if (index === stageIndex) classes.push("is-active");
      if (stageScores[index]) classes.push("is-done");
      const label = index === set.stages.length - 1 ? "Défi" : index + 1;
      return `<span class="${classes.join(" ")}">${stageScores[index] ? stageScores[index].overall : label}</span>`;
    }).join("");
  }

  function renderHistory() {
    const completed = stageScores.map((score, index) => ({ score, index })).filter((entry) => entry.score);
    els.stageHistory.hidden = completed.length === 0;
    els.stageHistory.innerHTML = completed.length ? `<p>Progression par mini défi</p><div>${completed.map((entry) => {
      const label = entry.index === set.stages.length - 1 ? "Défi final" : `Section ${entry.index + 1}`;
      return `<span class="history-score ${entry.index === set.stages.length - 1 ? "is-final" : ""}"><small>${label}</small><strong>${entry.score.overall}%</strong></span>`;
    }).join("")}</div>` : "";
  }

  function resetDisplayedResult() {
    els.results.classList.add("is-empty");
    els.resultTitle.textContent = "Bilan de lecture";
    els.overallScore.textContent = "0";
    els.accuracyScore.textContent = "0%";
    els.completenessScore.textContent = "0%";
    els.fluencyScore.textContent = "0%";
    els.scoreRing.style.setProperty("--score", "0");
    els.feedback.textContent = "Aucun progrès enregistré pour le moment. Le bilan commence seulement après une lecture terminée.";
  }

  function renderScore(score) {
    if (!score) {
      resetDisplayedResult();
      renderHistory();
      return;
    }
    els.results.classList.remove("is-empty");
    els.resultTitle.textContent = `Bilan de lecture · ${isFinalStage() ? "Défi final" : `Section ${stageIndex + 1}`}`;
    els.overallScore.textContent = score.overall;
    els.accuracyScore.textContent = `${score.accuracy}%`;
    els.completenessScore.textContent = `${score.completeness}%`;
    els.fluencyScore.textContent = `${score.fluency}%`;
    els.scoreRing.style.setProperty("--score", String(score.overall));
    renderHistory();
    gradeSubmitter?.update();
  }

  function render() {
    const finalStage = isFinalStage();
    els.title.textContent = set.title;
    els.modelAudio.pause();
    els.modelButton.querySelector("i").className = "bi bi-play-fill";
    els.modelAudio.src = currentModelAudio();
    document.querySelectorAll("[href$='#theme-01'], [href$='#theme-02'], [href$='#theme-04'], [href$='#theme-05'], [href$='#theme-6'], [href$='#theme-7'], [href$='#theme-8'], [href$='#theme-9']").forEach((link) => {
      if (link.textContent.includes("Ateliers") || link.textContent.includes("Retour")) link.href = set.back;
    });
    document.querySelector(".hero").style.setProperty("--hero-image", `url('${set.image}')`);
    const heroImage = document.querySelector(".hero-card img");
    if (heroImage) heroImage.src = set.image;
    els.stageCounter.textContent = finalStage ? "Défi final" : `Pratique guidée · ${stageIndex + 1} sur ${set.stages.length - 1}`;
    els.stageTitle.textContent = finalStage ? "Lisez maintenant le paragraphe complet" : `Section ${stageIndex + 1}`;
    els.nextBtn.innerHTML = finalStage
      ? '<i class="bi bi-arrow-counterclockwise"></i> Recommencer tout l’atelier'
      : '<i class="bi bi-arrow-right"></i> Section suivante';
    renderStageProgress();
    renderReference();
    els.tips.innerHTML = set.tips.map(([icon, text]) => `<div class="tip"><i class="bi ${icon}"></i><p>${text}</p></div>`).join("");
    els.comparisonNote.textContent = "Après l’enregistrement, la transcription apparaîtra ici et le bilan corrigera la phrase mot par mot.";
    renderScore(stageScores[stageIndex]);
    setRecordingControls(false, false);
  }

  function pronunciationTip(word) {
    const lower = word.toLocaleLowerCase("fr-FR");
    if (/[é]/.test(lower) || /(?:er|ez)$/.test(lower)) return "Le son é se prononce /e/, comme une voyelle fermée et nette.";
    if (/[èêë]/.test(lower) || /(?:ais|ait|aient)$/.test(lower)) return "Le son è se prononce /ɛ/, avec la bouche un peu plus ouverte que pour é.";
    if (/eau|au/.test(lower)) return "Le groupe eau ou au se prononce /o/ : gardez les lèvres arrondies.";
    if (/ou/.test(lower)) return "Le groupe ou se prononce /u/, avec les lèvres bien arrondies.";
    if (/u/.test(lower)) return "Pour le son u /y/, arrondissez les lèvres comme pour ou, mais gardez la langue en position de i.";
    if (/(?:an|en|on|in|ain|ein|un)/.test(lower)) return "Voyelle nasale : laissez passer l’air par le nez sans prononcer séparément le n final.";
    if (/oi/.test(lower)) return "Le groupe oi se prononce /wa/, en une seule émission fluide.";
    if (/gn/.test(lower)) return "Le groupe gn se prononce /ɲ/, comme le ñ espagnol.";
    if (/ch/.test(lower)) return "Le groupe ch se prononce /ʃ/, comme le son ch dans chat.";
    if (/r/.test(lower)) return "Le r français se produit doucement au fond de la gorge, sans rouler la langue.";
    if (/(?:ent|s|t|d|x|z)$/.test(lower)) return "Attention à la consonne finale : elle est souvent muette en français.";
    return "Écoutez le mot complet, puis répétez-le lentement en conservant tous ses accents et ses syllabes.";
  }

  function speakWord(word) {
    if (!word || !window.speechSynthesis) return;
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    const voices = speechSynthesis.getVoices();
    const frenchVoice = voices.find((voice) => voice.lang.toLowerCase() === "fr-fr") || voices.find((voice) => voice.lang.toLowerCase().startsWith("fr"));
    utterance.lang = "fr-FR";
    utterance.rate = 0.72;
    if (frenchVoice) utterance.voice = frenchVoice;
    speechSynthesis.speak(utterance);
    els.wordHelp.hidden = false;
    els.wordHelp.innerHTML = `<strong><i class="bi bi-volume-up"></i> ${word}</strong><span>${pronunciationTip(word)}</span>`;
  }

  function formatTime(ms) {
    const total = Math.max(0, Math.floor(ms / 1000));
    return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
  }

  function updateTimer() {
    els.timer.textContent = formatTime(Date.now() - startedAt);
  }

  function stopLevelMeter() {
    if (meterFrame) cancelAnimationFrame(meterFrame);
    meterFrame = null;
    analyser = null;
    if (audioContext) audioContext.close().catch(() => {});
    audioContext = null;
    els.levelMeterBar.style.width = "0";
    els.levelMeterValue.textContent = "En attente";
  }

  function startLevelMeter(activeStream) {
    stopLevelMeter();
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 1024;
    audioContext.createMediaStreamSource(activeStream).connect(analyser);
    const samples = new Uint8Array(analyser.fftSize);
    const update = () => {
      analyser.getByteTimeDomainData(samples);
      let sum = 0;
      for (const sample of samples) {
        const value = (sample - 128) / 128;
        sum += value * value;
      }
      const rms = Math.sqrt(sum / samples.length);
      const percent = Math.min(100, Math.round(rms * 900));
      els.levelMeterBar.style.width = `${percent}%`;
      els.levelMeterValue.textContent = percent < 4 ? "Parlez plus fort" : percent < 55 ? "Signal correct" : "Signal fort";
      meterFrame = requestAnimationFrame(update);
    };
    update();
  }

  async function refreshMicrophones() {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    try {
      const current = els.microphoneSelect.value;
      const devices = (await navigator.mediaDevices.enumerateDevices()).filter((device) => device.kind === "audioinput");
      els.microphoneSelect.innerHTML = '<option value="">Microphone par défaut</option>' + devices.map((device, index) => `<option value="${device.deviceId}">${device.label || `Microphone ${index + 1}`}</option>`).join("");
      if ([...els.microphoneSelect.options].some((option) => option.value === current)) els.microphoneSelect.value = current;
    } catch (_error) {
      els.microphoneSelect.innerHTML = '<option value="">Microphone par défaut</option>';
    }
  }

  function setRecordingControls(recording, busy = false) {
    els.recordBtn.disabled = recording || busy;
    els.stopBtn.disabled = !recording || busy;
    els.retryBtn.disabled = busy;
    els.nextBtn.disabled = busy || !stageScores[stageIndex];
    els.microphoneSelect.disabled = recording || busy;
    els.recordBtn.classList.toggle("is-recording", recording);
    els.recordBtn.querySelector("i").className = recording ? "bi bi-soundwave" : "bi bi-mic-fill";
  }

  function align(reference, spoken) {
    const rows = reference.length + 1;
    const cols = spoken.length + 1;
    const dp = Array.from({ length: rows }, () => Array(cols).fill(0));
    for (let i = 0; i < rows; i += 1) dp[i][0] = i;
    for (let j = 0; j < cols; j += 1) dp[0][j] = j;
    for (let i = 1; i < rows; i += 1) {
      for (let j = 1; j < cols; j += 1) {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + (reference[i - 1] === spoken[j - 1] ? 0 : 1)
        );
      }
    }
    let i = reference.length;
    let j = spoken.length;
    let matches = 0;
    const states = Array(reference.length).fill("is-missed");
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + (reference[i - 1] === spoken[j - 1] ? 0 : 1)) {
        if (reference[i - 1] === spoken[j - 1]) {
          states[i - 1] = "is-correct";
          matches += 1;
        }
        i -= 1;
        j -= 1;
      } else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
        i -= 1;
      } else {
        j -= 1;
      }
    }
    return { distance: dp[reference.length][spoken.length], matches, states };
  }

  function clamp(value, min = 0, max = 100) {
    return Math.max(min, Math.min(max, Math.round(value)));
  }

  function feedbackFor(score, missed, wpm) {
    const focus = missed.slice(0, 5).join(", ");
    if (score >= 88) return "Excellente lecture. Cette section est très fidèle au modèle et votre rythme est clair.";
    if (score >= 70) return `Bonne lecture. Reprenez surtout : ${focus || "les mots signalés"}.${wpm < 75 ? " Essayez de lire un peu plus continûment." : ""}`;
    return `Réécoutez le modèle et reprenez cette section par petits groupes de mots. Travaillez d’abord : ${focus || "les mots en rouge"}.`;
  }

  function evaluate(transcript) {
    const spoken = tokens(transcript);
    const referenceWords = tokens(currentText());
    if (!spoken.length) throw new Error("Aucune parole n’a été reconnue.");
    const aligned = align(referenceWords, spoken);
    const durationMinutes = Math.max(1 / 60, recordedDurationMs / 60000);
    const wpm = spoken.length / durationMinutes;
    const completeness = clamp((aligned.matches / referenceWords.length) * 100);
    const accuracy = clamp((1 - aligned.distance / Math.max(referenceWords.length, spoken.length)) * 100);
    const targetWpm = isFinalStage() ? 95 : 80;
    const fluency = clamp(100 - Math.abs(wpm - targetWpm) * 1.25);
    const overall = clamp(accuracy * .55 + completeness * .3 + fluency * .15);
    const previousAttempt = attemptHistory[stageIndex].at(-1) || null;
    const attempt = { overall, accuracy, completeness, fluency, at: new Date().toISOString() };
    attemptHistory[stageIndex].push(attempt);
    stageScores[stageIndex] = attempt;
    saveProgress();

    renderReference(aligned.states);
    renderStageProgress();
    renderScore(attempt);
    gradeSubmitter?.update();
    setRecordingControls(false, false);

    const displayWords = currentText().split(/\s+/).map(spokenWord).filter(Boolean);
    const missed = displayWords.filter((_, index) => aligned.states[index] !== "is-correct");
    const comparison = previousAttempt
      ? ` ${overall > previousAttempt.overall ? "Vous avez gagné" : overall < previousAttempt.overall ? "Variation" : "Même résultat"}${overall === previousAttempt.overall ? "" : ` ${Math.abs(overall - previousAttempt.overall)} points`} par rapport à l’essai précédent.`
      : "";
    const guidedScores = stageScores.slice(0, set.stages.length - 1).filter(Boolean);
    const guidedAverage = guidedScores.length ? Math.round(guidedScores.reduce((sum, item) => sum + item.overall, 0) / guidedScores.length) : null;
    els.feedback.textContent = isFinalStage()
      ? `${feedbackFor(overall, missed, wpm)}${guidedAverage === null ? "" : ` Moyenne des sections : ${guidedAverage}/100. Défi final : ${overall}/100.`}`
      : `${feedbackFor(overall, missed, wpm)}${comparison}`;
  }

  async function transcribeAndEvaluate(blob) {
    analyzing = true;
    setRecordingControls(false, true);
    els.micStatus.textContent = "Analyse de cette lecture…";
    els.comparisonNote.textContent = "Transcription en cours…";
    try {
      const response = await fetch(API_PATH, { method: "POST", headers: { "Content-Type": blob.type || "audio/webm" }, body: blob });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || `Erreur serveur (${response.status}).`);
      const transcript = (payload.text || "").trim();
      const audioStats = payload.audio || {};
      if (!transcript) {
        if (Number(audioStats.rms || 0) < 0.0008) throw new Error("L’enregistrement semble silencieux. Choisissez un autre microphone et réessayez.");
        throw new Error("Whisper a détecté du son, mais pas de mots français clairs. Parlez un peu plus près du microphone.");
      }
      els.comparisonNote.textContent = transcript;
      evaluate(transcript);
      els.micStatus.textContent = `${isFinalStage() ? "Défi final" : `Section ${stageIndex + 1}`} évalué. Consultez le bilan.`;
    } catch (error) {
      els.micStatus.textContent = "L’analyse n’a pas pu être terminée.";
      els.comparisonNote.textContent = error.message || "Erreur de transcription.";
    } finally {
      analyzing = false;
      setRecordingControls(false, false);
    }
  }

  async function startRecording() {
    if (analyzing) return;
    try {
      hidePermissionHelp();
      if (!window.isSecureContext) {
        const error = new Error("secure_context");
        error.name = "SecurityError";
        throw error;
      }
      if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
        const error = new Error("unsupported");
        error.name = "NotSupportedError";
        throw error;
      }
      const permission = await microphonePermissionState();
      if (permission === "denied") {
        const error = new Error("permission_denied_before_prompt");
        error.name = "NotAllowedError";
        throw error;
      }
      renderReference();
      els.micStatus.textContent = "Demande d’autorisation du microphone…";
      els.recordHelp.textContent = "Si une fenêtre apparaît, choisissez Autoriser pour JaraLingua.";
      els.comparisonNote.textContent = "Lisez uniquement le texte affiché au-dessus.";
      const audioConstraints = {
        echoCancellation: { ideal: true },
        noiseSuppression: { ideal: true },
        autoGainControl: { ideal: true },
        channelCount: { ideal: 1 }
      };
      if (els.microphoneSelect.value) audioConstraints.deviceId = { exact: els.microphoneSelect.value };
      stream = await navigator.mediaDevices.getUserMedia({ audio: audioConstraints, video: false });
      const activeTrack = stream.getAudioTracks()[0];
      await refreshMicrophones();
      const activeDeviceId = activeTrack?.getSettings?.().deviceId;
      if (activeDeviceId && [...els.microphoneSelect.options].some((option) => option.value === activeDeviceId)) els.microphoneSelect.value = activeDeviceId;
      els.recordHelp.textContent = activeTrack?.label ? `Microphone actif : ${activeTrack.label}` : "Microphone actif.";
      startLevelMeter(stream);
      chunks = [];
      const preferredType = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"].find((type) => MediaRecorder.isTypeSupported(type)) || "";
      recorder = preferredType ? new MediaRecorder(stream, { mimeType: preferredType }) : new MediaRecorder(stream);
      recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
      recorder.onstop = finishRecording;
      recorder.start(250);
      startedAt = Date.now();
      recordedDurationMs = 0;
      timerHandle = setInterval(updateTimer, 250);
      setRecordingControls(true, false);
      els.micStatus.textContent = `Enregistrement : « ${currentText()} »`;
    } catch (error) {
      const messages = {
        NotAllowedError: "Le microphone est bloqué ou l’autorisation n’a pas été accordée.",
        SecurityError: "Le microphone exige HTTPS ou localhost. En production, vérifiez que la page est servie en HTTPS.",
        NotFoundError: "Aucun microphone n’a été détecté.",
        NotReadableError: "Le microphone est utilisé par une autre application.",
        AbortError: "Le navigateur a interrompu l’activation du microphone. Réessayez.",
        OverconstrainedError: "Le microphone choisi n’est plus disponible. Sélectionnez le microphone par défaut.",
        NotSupportedError: "Ce navigateur ne prend pas en charge l’enregistrement audio."
      };
      els.micStatus.textContent = messages[error.name] || `Impossible d’activer le microphone : ${error.message}`;
      if (error.name === "NotAllowedError") {
        const permission = await microphonePermissionState();
        if (permission === "denied") {
          els.recordHelp.textContent = "Le site est actuellement bloqué : le navigateur ne peut pas afficher une nouvelle fenêtre d’autorisation.";
          showPermissionHelp("Microphone bloqué pour JaraLingua", "Débloquez le micro dans les paramètres du site, rechargez la page, puis réessayez.");
        } else {
          els.recordHelp.textContent = "Touchez à nouveau le micro et choisissez Autoriser si la fenêtre apparaît.";
          showPermissionHelp("Autorisation non accordée", "Si aucune fenêtre ne s’ouvre, le navigateur ou le système bloque peut-être le micro.");
        }
      } else if (error.name === "NotFoundError") {
        els.recordHelp.textContent = "Connectez un microphone ou vérifiez que votre téléphone autorise l’accès au micro.";
        showPermissionHelp("Aucun microphone détecté", "Le navigateur ne voit aucun périphérique audio disponible.", {
          guide: ["Vérifiez que le micro n’est pas désactivé dans le système.", "Sur téléphone, fermez les autres applications qui utilisent le micro.", "Rechargez la page et réessayez."]
        });
      } else if (error.name === "NotReadableError") {
        els.recordHelp.textContent = "Fermez Zoom, Teams, WhatsApp, l’enregistreur vocal ou toute autre application utilisant le micro.";
        showPermissionHelp("Microphone occupé", "Le micro existe, mais une autre application semble l’utiliser.", {
          guide: ["Fermez les applications d’appel ou d’enregistrement.", "Sur mobile, redémarrez le navigateur si nécessaire.", "Rechargez la page et réessayez."]
        });
      } else if (error.name === "OverconstrainedError") {
        els.microphoneSelect.value = "";
        els.recordHelp.textContent = "Le microphone choisi n’est plus disponible. La sélection revient au micro par défaut.";
        showPermissionHelp("Microphone indisponible", "Sélectionnez Microphone par défaut, puis réessayez.", {
          guide: ["Débranchez/rebranchez le micro si nécessaire.", "Rechargez la page si la liste ne se met pas à jour."]
        });
      }
      setRecordingControls(false, false);
    }
  }

  async function finishRecording() {
    clearInterval(timerHandle);
    timerHandle = null;
    stopLevelMeter();
    if (stream) stream.getTracks().forEach((track) => track.stop());
    stream = null;
    setRecordingControls(false, true);
    const blob = new Blob(chunks, { type: recorder?.mimeType || "audio/webm" });
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = URL.createObjectURL(blob);
    els.playback.src = objectUrl;
    els.playback.hidden = false;
    if (!blob.size) {
      els.micStatus.textContent = "Aucun audio n’a été enregistré. Réessayez.";
      setRecordingControls(false, false);
      return;
    }
    await transcribeAndEvaluate(blob);
  }

  function stopRecording() {
    if (recorder && recorder.state === "recording") {
      recordedDurationMs = Date.now() - startedAt;
      startedAt = 0;
      clearInterval(timerHandle);
      els.timer.textContent = formatTime(recordedDurationMs);
      els.micStatus.textContent = "Préparation de l’analyse…";
      setRecordingControls(false, true);
      recorder.stop();
    }
  }

  function resetStage() {
    if (recorder && recorder.state === "recording") recorder.stop();
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = null;
    els.playback.hidden = true;
    els.playback.removeAttribute("src");
    els.timer.textContent = "00:00";
    els.micStatus.textContent = "Prêt pour votre lecture.";
    els.recordHelp.textContent = "Le navigateur demandera l’autorisation uniquement lorsque vous cliquez sur le micro.";
    els.wordHelp.hidden = true;
    els.comparisonNote.textContent = "Après l’enregistrement, la transcription apparaîtra ici et le bilan corrigera la phrase mot par mot.";
    stopLevelMeter();
    renderReference();
    renderScore(stageScores[stageIndex]);
    updateMicrophoneReadiness();
  }

  function nextStage() {
    resetStage();
    if (isFinalStage()) {
      stageIndex = 0;
      stageScores.fill(null);
      attemptHistory.forEach((attempts) => attempts.splice(0));
      localStorage.removeItem(STORAGE_KEY);
    } else {
      stageIndex += 1;
    }
    saveProgress();
    render();
    gradeSubmitter?.update();
  }

  els.modelButton.addEventListener("click", () => {
    if (els.modelAudio.paused) {
      els.modelAudio.play();
      els.modelButton.querySelector("i").className = "bi bi-pause-fill";
    } else {
      els.modelAudio.pause();
      els.modelButton.querySelector("i").className = "bi bi-play-fill";
    }
  });
  els.modelAudio.addEventListener("ended", () => { els.modelButton.querySelector("i").className = "bi bi-play-fill"; });
  els.readingText.addEventListener("click", (event) => {
    const button = event.target.closest(".reading-word");
    if (button) speakWord(button.dataset.word);
  });
  els.recordBtn.addEventListener("click", startRecording);
  els.stopBtn.addEventListener("click", stopRecording);
  els.retryBtn.addEventListener("click", resetStage);
  els.nextBtn.addEventListener("click", nextStage);

  refreshMicrophones();
  navigator.mediaDevices?.addEventListener?.("devicechange", refreshMicrophones);
  render();
  updateMicrophoneReadiness();
})();
