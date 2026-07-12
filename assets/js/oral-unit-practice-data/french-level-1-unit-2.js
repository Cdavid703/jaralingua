window.JaraLinguaOralUnitConfig = {
  apiPath: "/api/french8/pronunciation-assessment",
  storageKey: "jaralingua:french1:oral-unit-2:v1",
  language: "fr",
  courseLabel: "Français · Niveau 1",
  unitLabel: "Unité 2",
  title: "Coach de conversation – Unité 2 : Le présent de l’indicatif",
  interviewer: {
    name: "Camille",
    role: "Coach de conversation"
  },
  attemptQuestionCount: 4,
  maxRecordingSeconds: 28,
  localUrl: "http://127.0.0.1:8021/frances/Niveau%201/ateliers/pratique-orale-unite-2.html",
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
    unit: 2,
    title: "Le présent de l’indicatif",
    grammar: [
      "présent de l’indicatif",
      "phrase affirmative",
      "ne / n’ + verbe + pas",
      "questions par intonation",
      "questions avec est-ce que",
      "mots interrogatifs de base"
    ],
    vocabulary: [
      "classe de français",
      "professeur",
      "étudiant / étudiante",
      "écouter",
      "parler",
      "répéter",
      "écrire",
      "travailler",
      "comprendre",
      "étudier"
    ],
    communicativeGoals: [
      "dire ce que l’on fait en classe",
      "parler d’une habitude simple",
      "dire ce que l’on ne fait pas",
      "répondre à une question avec est-ce que",
      "poser une question simple au présent",
      "utiliser une phrase complète au présent"
    ]
  },
  questions: [
    {
      id: "fr1u2q1",
      unit: 2,
      topic: "Action en classe",
      text: "Qu’est-ce que tu fais en classe de français ?",
      audio: "../audio/pratique-orale/unite-2/question-01.mp3?v=20260712-u2",
      frames: [
        "En classe de français, je ______ et je ______.",
        "Je ______ avec le professeur et je ______ avec le groupe."
      ],
      vocabulary: ["en classe", "j’écoute", "je parle", "je répète", "j’écris", "je lis", "je travaille", "le groupe"],
      grammar: "Utilise je + verbe au présent : j’écoute, je parle, je répète, j’écris.",
      checks: [
        { label: "une action au présent", terms: ["j ecoute", "je parle", "je repete", "j ecris", "je lis", "je travaille"] },
        { label: "le contexte de la classe", terms: ["classe", "francais", "professeur", "groupe", "cours"] }
      ],
      minWords: 7,
      maxSeconds: 24,
      improved: "En classe de français, j’écoute le professeur et je répète avec le groupe."
    },
    {
      id: "fr1u2q2",
      unit: 2,
      topic: "Habitude",
      text: "Tu étudies le français tous les jours ?",
      audio: "../audio/pratique-orale/unite-2/question-02.mp3?v=20260712-u2",
      frames: [
        "Oui, j’étudie le français ______.",
        "Non, je n’étudie pas le français tous les jours, mais j’étudie ______."
      ],
      vocabulary: ["oui", "non", "j’étudie", "tous les jours", "le lundi", "le soir", "à la maison", "à l’université"],
      grammar: "Pour une habitude, utilise le présent avec une expression de temps : tous les jours, le lundi, le soir.",
      checks: [
        { label: "réponse oui ou non", terms: ["oui", "non"] },
        { label: "habitude au présent", terms: ["j etudie", "je travaille", "je pratique", "tous les jours", "le lundi", "le soir", "a la maison"] }
      ],
      minWords: 6,
      maxSeconds: 24,
      improved: "Oui, j’étudie le français le soir à la maison."
    },
    {
      id: "fr1u2q3",
      unit: 2,
      topic: "Négation",
      text: "Qu’est-ce que tu ne fais pas pendant le cours ?",
      audio: "../audio/pratique-orale/unite-2/question-03.mp3?v=20260712-u2",
      frames: [
        "Pendant le cours, je ne ______ pas.",
        "Je n’______ pas pendant le cours, parce que j’écoute."
      ],
      vocabulary: ["pendant le cours", "je ne parle pas", "je n’utilise pas", "je ne dors pas", "je ne mange pas", "parce que", "j’écoute"],
      grammar: "La négation encadre le verbe : je ne parle pas. Devant une voyelle, ne devient n’ : je n’utilise pas.",
      checks: [
        { label: "une négation complète", terms: ["je ne", "je n", "pas"] },
        { label: "une action de cours", terms: ["cours", "classe", "j ecoute", "je travaille", "je parle", "j utilise", "je dors", "je mange"] }
      ],
      minWords: 7,
      maxSeconds: 26,
      improved: "Pendant le cours, je n’utilise pas mon téléphone, parce que j’écoute le professeur."
    },
    {
      id: "fr1u2q4",
      unit: 2,
      topic: "Question avec est-ce que",
      text: "Est-ce que tu comprends les questions en français ?",
      audio: "../audio/pratique-orale/unite-2/question-04.mp3?v=20260712-u2",
      frames: [
        "Oui, je comprends les questions simples en français.",
        "Je comprends un peu, mais je répète la question."
      ],
      vocabulary: ["je comprends", "les questions", "simple", "un peu", "je répète", "lentement", "en français"],
      grammar: "Après est-ce que, l’ordre reste simple : est-ce que + sujet + verbe ? Réponds avec je + verbe.",
      checks: [
        { label: "réponse à la question", terms: ["oui", "non", "je comprends", "je ne comprends pas", "un peu"] },
        { label: "langue ou question", terms: ["question", "questions", "francais", "simple", "lentement", "repete"] }
      ],
      minWords: 6,
      maxSeconds: 24,
      improved: "Oui, je comprends les questions simples en français, mais je répète parfois."
    },
    {
      id: "fr1u2q5",
      unit: 2,
      topic: "Lieu",
      text: "Où est-ce que tu travailles ou tu étudies ?",
      audio: "../audio/pratique-orale/unite-2/question-05.mp3?v=20260712-u2",
      frames: [
        "J’étudie à ______.",
        "Je travaille à ______ et j’étudie le français à ______."
      ],
      vocabulary: ["où", "j’étudie", "je travaille", "à l’université", "à la maison", "dans une école", "en ligne", "ici"],
      grammar: "Avec un lieu, utilise souvent à ou dans : j’étudie à l’université, je travaille dans une école.",
      checks: [
        { label: "verbe au présent", terms: ["j etudie", "je travaille", "j apprends"] },
        { label: "un lieu", terms: ["universite", "maison", "ecole", "en ligne", "ici", "a", "dans"] }
      ],
      minWords: 5,
      maxSeconds: 22,
      improved: "J’étudie à l’université et je pratique le français à la maison."
    },
    {
      id: "fr1u2q6",
      unit: 2,
      topic: "Question personnelle",
      text: "Pose une question simple au présent à ton professeur.",
      audio: "../audio/pratique-orale/unite-2/question-06.mp3?v=20260712-u2",
      frames: [
        "Est-ce que vous ______ ?",
        "Vous ______ aujourd’hui ?"
      ],
      vocabulary: ["est-ce que", "vous", "parlez", "répétez", "corrigez", "expliquez", "aujourd’hui", "lentement"],
      grammar: "Pour poser une question polie, utilise vous : Est-ce que vous expliquez lentement ?",
      checks: [
        { label: "forme de question", terms: ["est ce que", "vous", "aujourd hui"] },
        { label: "verbe au présent", terms: ["parlez", "repetez", "corrigez", "expliquez", "travaillez", "ecoutez"] }
      ],
      minWords: 4,
      maxSeconds: 20,
      improved: "Est-ce que vous expliquez la question lentement ?"
    },
    {
      id: "fr1u2q7",
      unit: 2,
      topic: "Affirmation et négation",
      text: "Dis une phrase affirmative et une phrase négative sur ton cours de français.",
      audio: "../audio/pratique-orale/unite-2/question-07.mp3?v=20260712-u2",
      frames: [
        "Dans mon cours, je ______. Je ne ______ pas.",
        "J’aime ______ en français, mais je ne ______ pas."
      ],
      vocabulary: ["dans mon cours", "je parle", "j’écoute", "j’écris", "j’aime", "je ne comprends pas", "je ne parle pas vite", "pas encore"],
      grammar: "Combine deux phrases : une affirmative avec je + verbe, puis une négative avec ne / n’ + verbe + pas.",
      checks: [
        { label: "phrase affirmative", terms: ["je parle", "j ecoute", "j ecris", "j aime", "je travaille", "je comprends"] },
        { label: "phrase négative", terms: ["je ne", "je n", "pas"] }
      ],
      minWords: 9,
      maxSeconds: 28,
      improved: "Dans mon cours, j’écoute le professeur. Je ne parle pas très vite en français."
    },
    {
      id: "fr1u2q8",
      unit: 2,
      topic: "Mini-conversation",
      text: "Présente ta routine de français en trois phrases courtes.",
      audio: "../audio/pratique-orale/unite-2/question-08.mp3?v=20260712-u2",
      frames: [
        "J’étudie le français ______. En classe, je ______. Je ne ______ pas.",
        "Je pratique ______. Je comprends ______. Je pose une question quand ______."
      ],
      vocabulary: ["j’étudie", "je pratique", "en classe", "je comprends", "je pose une question", "quand", "je ne comprends pas", "lentement"],
      grammar: "Utilise trois phrases courtes au présent. Essaie d’inclure une action, une habitude et une négation.",
      checks: [
        { label: "plusieurs phrases au présent", minMatches: 2, terms: ["j etudie", "je pratique", "je comprends", "je pose", "j ecoute", "je parle", "je repete"] },
        { label: "une négation ou une difficulté", terms: ["je ne", "je n", "pas", "je ne comprends pas", "difficile"] }
      ],
      minWords: 12,
      maxSeconds: 28,
      improved: "J’étudie le français le soir. En classe, j’écoute et je répète. Je ne parle pas vite, mais je pratique."
    }
  ]
};
