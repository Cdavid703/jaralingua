window.JaraLinguaOralUnitConfig = {
  apiPath: "/api/french8/pronunciation-assessment",
  storageKey: "jaralingua:french1:oral-unit-3:v1",
  language: "fr",
  courseLabel: "Français · Niveau 1",
  unitLabel: "Unité 3",
  title: "Coach de conversation – Unité 3 : Les verbes du premier groupe",
  interviewer: {
    name: "Camille",
    role: "Coach de conversation"
  },
  attemptQuestionCount: 4,
  maxRecordingSeconds: 28,
  localUrl: "http://127.0.0.1:8021/frances/Niveau%201/ateliers/pratique-orale-unite-3.html",
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
    unit: 3,
    title: "Les verbes du premier groupe",
    grammar: [
      "verbes réguliers en -er au présent",
      "terminaisons -e, -es, -e, -ons, -ez, -ent",
      "je / tu / il / elle / nous / vous / ils / elles",
      "questions simples avec verbes en -er",
      "réponses complètes au présent"
    ],
    vocabulary: [
      "parler",
      "écouter",
      "étudier",
      "travailler",
      "habiter",
      "aimer",
      "regarder",
      "répéter",
      "préparer",
      "commencer"
    ],
    communicativeGoals: [
      "dire ce que l’on étudie",
      "parler d’une activité en classe",
      "dire où l’on habite",
      "poser une question avec un verbe en -er",
      "utiliser nous et vous",
      "produire plusieurs phrases au présent avec des verbes réguliers"
    ]
  },
  questions: [
    {
      id: "fr1u3q1",
      unit: 3,
      topic: "Étudier",
      text: "Qu’est-ce que tu étudies en ce moment ?",
      audio: "../audio/pratique-orale/unite-3/question-01.mp3?v=20260712-u3",
      frames: [
        "En ce moment, j’étudie ______.",
        "J’étudie ______ et je pratique ______."
      ],
      vocabulary: ["en ce moment", "j’étudie", "le français", "la grammaire", "les verbes", "la prononciation", "je pratique"],
      grammar: "Avec je, les verbes réguliers en -er prennent souvent -e : j’étudie, je pratique.",
      checks: [
        { label: "verbe étudier ou pratiquer", terms: ["j etudie", "je pratique"] },
        { label: "objet d’étude", terms: ["francais", "grammaire", "verbes", "prononciation", "cours", "langue"] }
      ],
      minWords: 6,
      maxSeconds: 22,
      improved: "En ce moment, j’étudie le français et je pratique les verbes en -er."
    },
    {
      id: "fr1u3q2",
      unit: 3,
      topic: "Parler",
      text: "Tu parles français en classe ?",
      audio: "../audio/pratique-orale/unite-3/question-02.mp3?v=20260712-u3",
      frames: [
        "Oui, je parle français en classe.",
        "Je parle un peu français, mais je répète lentement."
      ],
      vocabulary: ["oui", "non", "je parle", "un peu", "en classe", "lentement", "je répète", "avec le groupe"],
      grammar: "Je parle, tu parles et il parle se prononcent presque de la même façon, mais l’écriture change.",
      checks: [
        { label: "réponse oui ou non", terms: ["oui", "non", "un peu"] },
        { label: "verbe parler au présent", terms: ["je parle", "tu parles", "parle francais", "parler francais"] }
      ],
      minWords: 5,
      maxSeconds: 20,
      improved: "Oui, je parle un peu français en classe et je répète lentement."
    },
    {
      id: "fr1u3q3",
      unit: 3,
      topic: "Habiter",
      text: "Où est-ce que tu habites ?",
      audio: "../audio/pratique-orale/unite-3/question-03.mp3?v=20260712-u3",
      frames: [
        "J’habite à ______.",
        "J’habite dans la ville de ______, en ______."
      ],
      vocabulary: ["j’habite", "à", "dans", "ville", "quartier", "Medellín", "Envigado", "Colombie"],
      grammar: "Habiter est un verbe en -er : j’habite, tu habites, il habite. Avec une ville, utilise souvent à.",
      checks: [
        { label: "verbe habiter", terms: ["j habite", "je vis"] },
        { label: "lieu", terms: ["a", "dans", "ville", "quartier", "medellin", "envigado", "colombie"] }
      ],
      minWords: 4,
      maxSeconds: 18,
      improved: "J’habite à Envigado, en Colombie."
    },
    {
      id: "fr1u3q4",
      unit: 3,
      topic: "Il / elle",
      text: "Qu’est-ce que le professeur explique aujourd’hui ?",
      audio: "../audio/pratique-orale/unite-3/question-04.mp3?v=20260712-u3",
      frames: [
        "Le professeur explique ______ aujourd’hui.",
        "Il explique ______ et il répète les exemples."
      ],
      vocabulary: ["le professeur", "il explique", "elle explique", "aujourd’hui", "les verbes", "la règle", "les exemples", "il répète"],
      grammar: "Avec il ou elle, les verbes en -er prennent -e : il explique, elle répète.",
      checks: [
        { label: "sujet il / elle / professeur", terms: ["professeur", "il", "elle"] },
        { label: "verbe en -er à la troisième personne", terms: ["explique", "repete", "travaille", "ecoute"] }
      ],
      minWords: 6,
      maxSeconds: 24,
      improved: "Le professeur explique les verbes en -er aujourd’hui et il répète les exemples."
    },
    {
      id: "fr1u3q5",
      unit: 3,
      topic: "Vous",
      text: "Qu’est-ce que vous répétez en classe ?",
      audio: "../audio/pratique-orale/unite-3/question-05.mp3?v=20260712-u3",
      frames: [
        "Nous répétons ______ en classe.",
        "Avec le professeur, nous répétons ______."
      ],
      vocabulary: ["nous répétons", "en classe", "les verbes", "les phrases", "la prononciation", "les questions", "avec le professeur"],
      grammar: "Quand la question utilise vous pour parler au groupe, tu peux répondre avec nous : nous répétons.",
      checks: [
        { label: "réponse avec nous", terms: ["nous repetons", "on repete", "nous pratiquons"] },
        { label: "objet répété", terms: ["verbes", "phrases", "prononciation", "questions", "exemples"] }
      ],
      minWords: 6,
      maxSeconds: 22,
      improved: "Nous répétons les verbes et les phrases en classe."
    },
    {
      id: "fr1u3q6",
      unit: 3,
      topic: "Nous",
      text: "Qu’est-ce que nous travaillons aujourd’hui ?",
      audio: "../audio/pratique-orale/unite-3/question-06.mp3?v=20260712-u3",
      frames: [
        "Aujourd’hui, nous travaillons ______.",
        "Nous travaillons ______ et nous préparons ______."
      ],
      vocabulary: ["aujourd’hui", "nous travaillons", "nous préparons", "les verbes", "la conversation", "un exercice", "une phrase"],
      grammar: "Avec nous, les verbes en -er prennent -ons : nous travaillons, nous préparons.",
      checks: [
        { label: "forme avec nous", terms: ["nous travaillons", "nous preparons", "nous pratiquons", "on travaille"] },
        { label: "contenu du cours", terms: ["verbes", "conversation", "exercice", "phrase", "francais"] }
      ],
      minWords: 6,
      maxSeconds: 22,
      improved: "Aujourd’hui, nous travaillons les verbes en -er et nous préparons une conversation."
    },
    {
      id: "fr1u3q7",
      unit: 3,
      topic: "Deux actions",
      text: "Dis deux actions que tu fais pour apprendre le français.",
      audio: "../audio/pratique-orale/unite-3/question-07.mp3?v=20260712-u3",
      frames: [
        "Pour apprendre le français, j’______ et je ______.",
        "J’______ à la maison et je ______ en classe."
      ],
      vocabulary: ["pour apprendre", "j’écoute", "je répète", "j’étudie", "je regarde", "je prépare", "je travaille", "à la maison"],
      grammar: "Utilise deux verbes avec je. Exemple : j’écoute et je répète.",
      checks: [
        { label: "deux actions", minMatches: 2, terms: ["j ecoute", "je repete", "j etudie", "je regarde", "je prepare", "je travaille", "je pratique"] },
        { label: "objectif apprendre", terms: ["apprendre", "francais", "classe", "maison"] }
      ],
      minWords: 8,
      maxSeconds: 26,
      improved: "Pour apprendre le français, j’écoute les audios et je répète les phrases."
    },
    {
      id: "fr1u3q8",
      unit: 3,
      topic: "Mini-présentation",
      text: "Décris ta semaine avec trois verbes du premier groupe.",
      audio: "../audio/pratique-orale/unite-3/question-08.mp3?v=20260712-u3",
      frames: [
        "Le lundi, j’______. Le mardi, je ______. Le soir, je ______.",
        "Cette semaine, j’______, je ______ et je ______."
      ],
      vocabulary: ["le lundi", "le mardi", "le soir", "cette semaine", "j’étudie", "je travaille", "je regarde", "j’écoute", "je prépare"],
      grammar: "Essaie d’utiliser trois verbes réguliers du premier groupe avec je : j’étudie, je travaille, je regarde.",
      checks: [
        { label: "trois verbes en -er", minMatches: 3, terms: ["j etudie", "je travaille", "je regarde", "j ecoute", "je prepare", "je pratique", "je repete", "je parle"] },
        { label: "organisation temporelle", terms: ["lundi", "mardi", "soir", "semaine", "aujourd hui", "demain"] }
      ],
      minWords: 12,
      maxSeconds: 28,
      improved: "Cette semaine, j’étudie le français, je travaille en classe et j’écoute les audios le soir."
    }
  ]
};
