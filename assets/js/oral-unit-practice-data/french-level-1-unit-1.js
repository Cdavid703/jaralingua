window.JaraLinguaOralUnitConfig = {
  apiPath: "/api/french8/pronunciation-assessment",
  storageKey: "jaralingua:french1:oral-unit-1:v1",
  language: "fr",
  courseLabel: "Français · Niveau 1",
  unitLabel: "Unité 1",
  title: "Coach de conversation – Unité 1 : Premiers contacts",
  interviewer: {
    name: "Camille",
    role: "Coach de conversation"
  },
  attemptQuestionCount: 4,
  maxRecordingSeconds: 24,
  localUrl: "http://127.0.0.1:8021/frances/Niveau%201/ateliers/pratique-orale-unite-1.html",
  ui: {
    start: "Commencer la pratique",
    preflight: "Tester le microphone",
    playQuestion: "Écouter la question",
    speed: "Vitesse",
    hideHelp: "Masquer l’aide",
    showHelp: "J’ai besoin d’aide",
    finishAnswer: "Terminer la réponse",
    retry: "Recommencer",
    continue: "Continuer",
    restart: "Nouvel essai complet",
    weakPractice: "Pratiquer mes deux questions faibles",
    transcriptPlaceholder: "Votre transcription apparaîtra ici après l’analyse Whisper.",
    readyStatus: "Prêt pour votre réponse",
    recordHelp: "Touchez le microphone et répondez en français.",
    recording: "Enregistrement en cours…",
    transcribing: "Analyse locale de votre réponse avec Whisper…",
    transcribed: "Réponse transcrite. Relisez-la avant de continuer.",
    noSpeech: "Whisper a détecté du son, mais pas de mots français clairs. Parlez un peu plus près du microphone.",
    unsupportedTitle: "Navigateur non compatible",
    unsupportedDetail: "Cette activité nécessite getUserMedia et MediaRecorder.",
    privacy: "L’audio est envoyé temporairement au service Whisper de JaraLingua pour transcription. Il n’est pas sauvegardé.",
    formativeNotice: "Ceci est un résultat automatique d’entraînement, et non une note officielle."
  },
  unitContext: {
    course: "Français Niveau 1",
    unit: 1,
    title: "Premiers contacts",
    grammar: [
      "je m’appelle",
      "je suis",
      "je viens de",
      "j’habite à",
      "j’ai + âge"
    ],
    vocabulary: [
      "salutations",
      "nom et prénom",
      "alphabet",
      "ville et pays",
      "âge",
      "nombres de 1 à 20",
      "formules de politesse"
    ],
    communicativeGoals: [
      "saluer",
      "se présenter",
      "épeler son prénom",
      "dire son origine",
      "dire où on habite",
      "donner une information personnelle simple"
    ]
  },
  questions: [
    {
      id: "fr1u1q1",
      unit: 1,
      topic: "Se présenter",
      text: "Bonjour. Comment tu t’appelles ?",
      audio: "../audio/pratique-orale/unite-1/question-01.mp3",
      frames: [
        "Bonjour, je m’appelle ______.",
        "Salut, moi, c’est ______."
      ],
      vocabulary: ["bonjour", "salut", "je m’appelle", "moi, c’est", "prénom", "enchanté", "enchantée"],
      grammar: "Pour te présenter, utilise « je m’appelle » + ton prénom.",
      checks: [
        { label: "une salutation", terms: ["bonjour", "salut", "bonsoir"] },
        { label: "un prénom ou une présentation", terms: ["je m'appelle", "je m appelle", "moi c'est", "moi cest", "je suis"] }
      ],
      minWords: 3,
      maxSeconds: 16,
      improved: "Bonjour, je m’appelle [ton prénom]. Enchanté / enchantée."
    },
    {
      id: "fr1u1q2",
      unit: 1,
      topic: "Épeler",
      text: "Tu peux épeler ton prénom, s’il te plaît ?",
      audio: "../audio/pratique-orale/unite-1/question-02.mp3",
      frames: [
        "Oui. Mon prénom est ______. Ça s’écrit : ______.",
        "Je m’appelle ______. J’épelle : ______."
      ],
      vocabulary: ["oui", "prénom", "ça s’écrit", "j’épelle", "lettre", "double", "s’il te plaît"],
      grammar: "Pour épeler, dis les lettres lentement. Tu peux dire « double » quand une lettre se répète.",
      checks: [
        { label: "une formule pour épeler", terms: ["ça s'écrit", "ça s ecrit", "j'épelle", "j epelle", "lettre", "double"] },
        { label: "au moins trois éléments", minMatches: 3, terms: ["a", "bé", "b", "cé", "c", "dé", "d", "e", "effe", "f", "gé", "g", "ache", "h", "i", "ji", "j", "ka", "k", "elle", "l", "emme", "m", "enne", "n", "o", "pé", "p", "q", "erre", "r", "esse", "s", "té", "t", "u", "vé", "v", "double", "iks", "x", "zède", "z"] }
      ],
      minWords: 4,
      maxSeconds: 22,
      improved: "Oui. Mon prénom est [prénom]. Ça s’écrit : [lettres]."
    },
    {
      id: "fr1u1q3",
      unit: 1,
      topic: "Origine",
      text: "Tu viens d’où ?",
      audio: "../audio/pratique-orale/unite-1/question-03.mp3",
      frames: [
        "Je viens de ______.",
        "Je suis de ______, en ______."
      ],
      vocabulary: ["je viens de", "je suis de", "Colombie", "Medellín", "Bogotá", "Envigado", "pays", "ville"],
      grammar: "Utilise « je viens de » pour dire ton origine : je viens de Colombie.",
      checks: [
        { label: "l’origine", terms: ["je viens de", "je suis de", "colombie", "medellin", "bogota", "envigado"] }
      ],
      minWords: 3,
      maxSeconds: 15,
      improved: "Je viens de [ville ou pays]."
    },
    {
      id: "fr1u1q4",
      unit: 1,
      topic: "Ville",
      text: "Tu habites dans quelle ville ?",
      audio: "../audio/pratique-orale/unite-1/question-04.mp3",
      frames: [
        "J’habite à ______.",
        "J’habite dans la ville de ______."
      ],
      vocabulary: ["j’habite à", "ville", "quartier", "Medellín", "Bogotá", "Envigado", "près de", "en Colombie"],
      grammar: "Avec une ville, utilise normalement « à » : j’habite à Envigado.",
      checks: [
        { label: "lieu de résidence", terms: ["j'habite", "j habite", "je vis", "à", "a", "dans"] }
      ],
      minWords: 3,
      maxSeconds: 15,
      improved: "J’habite à [ville], en Colombie."
    },
    {
      id: "fr1u1q5",
      unit: 1,
      topic: "Âge",
      text: "Quel âge as-tu ?",
      audio: "../audio/pratique-orale/unite-1/question-05.mp3",
      frames: [
        "J’ai ______ ans.",
        "Moi, j’ai ______ ans."
      ],
      vocabulary: ["j’ai", "ans", "dix-huit", "dix-neuf", "vingt", "vingt et un", "vingt-deux"],
      grammar: "En français, on dit « j’ai » + âge + « ans ». On ne dit pas « je suis vingt ans ».",
      checks: [
        { label: "âge avec avoir", terms: ["j'ai", "j ai", "ans"] }
      ],
      minWords: 3,
      maxSeconds: 14,
      improved: "J’ai [nombre] ans."
    },
    {
      id: "fr1u1q6",
      unit: 1,
      topic: "Nombres",
      text: "Quel est ton numéro préféré entre un et vingt ?",
      audio: "../audio/pratique-orale/unite-1/question-06.mp3",
      frames: [
        "Mon numéro préféré est le ______.",
        "J’aime le numéro ______."
      ],
      vocabulary: ["numéro", "préféré", "un", "sept", "onze", "douze", "quinze", "vingt"],
      grammar: "Pour choisir un nombre, tu peux dire « mon numéro préféré est le… ».",
      checks: [
        { label: "un nombre", terms: ["un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf", "dix", "onze", "douze", "treize", "quatorze", "quinze", "seize", "dix sept", "dix huit", "dix neuf", "vingt"] },
        { label: "préférence", terms: ["préféré", "prefere", "j'aime", "j aime", "mon numéro", "mon numero"] }
      ],
      minWords: 4,
      maxSeconds: 16,
      improved: "Mon numéro préféré est le [nombre]."
    },
    {
      id: "fr1u1q7",
      unit: 1,
      topic: "Mini-présentation",
      text: "Présente-toi en deux phrases, s’il te plaît.",
      audio: "../audio/pratique-orale/unite-1/question-07.mp3",
      frames: [
        "Bonjour, je m’appelle ______. J’habite à ______.",
        "Salut, moi, c’est ______. Je viens de ______."
      ],
      vocabulary: ["bonjour", "je m’appelle", "j’habite à", "je viens de", "je suis", "étudiant", "étudiante", "enchanté"],
      grammar: "Une présentation simple peut combiner deux informations : nom + ville, ou nom + origine.",
      checks: [
        { label: "présentation", terms: ["je m'appelle", "je m appelle", "moi c'est", "moi cest", "je suis"] },
        { label: "information personnelle", terms: ["j'habite", "j habite", "je viens de", "colombie", "medellin", "bogota", "envigado", "étudiant", "etudiant", "étudiante", "etudiante"] }
      ],
      minWords: 6,
      maxSeconds: 22,
      improved: "Bonjour, je m’appelle [prénom]. J’habite à [ville] et je viens de [pays ou ville]."
    },
    {
      id: "fr1u1q8",
      unit: 1,
      topic: "Conversation courte",
      text: "Dis bonjour, présente-toi et termine avec « enchanté » ou « enchantée ».",
      audio: "../audio/pratique-orale/unite-1/question-08.mp3",
      frames: [
        "Bonjour, je m’appelle ______. Enchanté / enchantée.",
        "Salut, moi, c’est ______. Enchanté / enchantée de faire votre connaissance."
      ],
      vocabulary: ["bonjour", "salut", "je m’appelle", "moi, c’est", "enchanté", "enchantée", "faire votre connaissance"],
      grammar: "Utilise « enchanté » si tu t’identifies au masculin et « enchantée » si tu t’identifies au féminin.",
      checks: [
        { label: "salutation", terms: ["bonjour", "salut", "bonsoir"] },
        { label: "présentation", terms: ["je m'appelle", "je m appelle", "moi c'est", "moi cest", "je suis"] },
        { label: "formule finale", terms: ["enchanté", "enchante", "enchantée", "enchantee"] }
      ],
      minWords: 5,
      maxSeconds: 22,
      improved: "Bonjour, je m’appelle [prénom]. Enchanté / enchantée de faire votre connaissance."
    }
  ]
};
