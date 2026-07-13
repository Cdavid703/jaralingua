window.JaraLinguaOralUnitConfig = {
  apiPath: "/api/french8/pronunciation-assessment",
  storageKey: "jaralingua:french1:oral-unit-7:v1",
  language: "fr",
  courseLabel: "Français · Niveau 1",
  unitLabel: "Unité 7",
  title: "Coach de conversation – Unité 7 : Maison et environnement",
  interviewer: {
    name: "Camille",
    role: "Coach de conversation"
  },
  attemptQuestionCount: 4,
  maxRecordingSeconds: 30,
  localUrl: "http://127.0.0.1:8021/frances/Niveau%201/ateliers/pratique-orale-unite-7.html",
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
    unit: 7,
    title: "Maison et environnement",
    grammar: [
      "habiter dans + logement",
      "il y a + nom",
      "il n’y a pas de + nom",
      "articles un, une, des avec les objets",
      "prépositions de lieu : sur, sous, dans, devant, derrière, près de, à côté de",
      "questions avec est-ce qu’il y a et où est"
    ],
    vocabulary: [
      "une maison",
      "un appartement",
      "un studio",
      "le salon",
      "la cuisine",
      "la chambre",
      "la salle de bain",
      "un lit",
      "un bureau",
      "une table",
      "une chaise",
      "un canapé",
      "une lampe",
      "un balcon",
      "un jardin"
    ],
    communicativeGoals: [
      "dire où l’on habite",
      "nommer les pièces principales d’un logement",
      "décrire une chambre ou une pièce",
      "dire ce qu’il y a dans un logement",
      "dire ce qu’il n’y a pas",
      "situer un objet dans l’espace",
      "poser une question simple sur un logement",
      "présenter un logement en trois phrases"
    ]
  },
  questions: [
    {
      id: "fr1u7q1",
      unit: 7,
      topic: "Type de logement",
      text: "Où est-ce que tu habites ?",
      audio: "../audio/pratique-orale/unite-7/question-01.mp3?v=20260712-u7",
      frames: [
        "J’habite dans ______.",
        "J’habite dans un appartement / une maison / un studio à ______."
      ],
      vocabulary: ["j’habite", "dans", "un appartement", "une maison", "un studio", "à Medellín", "près de", "avec ma famille"],
      grammar: "Pour parler du logement, utilise habiter dans : j’habite dans un appartement.",
      checks: [
        { label: "verbe habiter", terms: ["j habite", "nous habitons", "j'habite"] },
        { label: "type de logement", terms: ["appartement", "maison", "studio", "logement"] }
      ],
      minWords: 6,
      maxSeconds: 22,
      improved: "J’habite dans un appartement à Medellín avec ma famille."
    },
    {
      id: "fr1u7q2",
      unit: 7,
      topic: "Pièces du logement",
      text: "Nomme une pièce dans ton logement.",
      audio: "../audio/pratique-orale/unite-7/question-02.mp3?v=20260712-u7",
      frames: [
        "Dans mon logement, il y a ______.",
        "Une pièce importante est ______."
      ],
      vocabulary: ["dans mon logement", "il y a", "un salon", "une cuisine", "une chambre", "une salle de bain", "un balcon", "un jardin"],
      grammar: "Pour nommer une pièce, utilise le ou la : le salon, la cuisine, la chambre.",
      checks: [
        { label: "pièce nommée", terms: ["salon", "cuisine", "chambre", "salle de bain", "balcon", "jardin", "bureau"] },
        { label: "contexte du logement", terms: ["logement", "appartement", "maison", "studio", "chez moi", "il y a"] }
      ],
      minWords: 5,
      maxSeconds: 26,
      improved: "Dans mon logement, il y a une chambre. Il y a aussi une cuisine."
    },
    {
      id: "fr1u7q3",
      unit: 7,
      topic: "Description de chambre",
      text: "Décris ta chambre en deux ou trois phrases.",
      audio: "../audio/pratique-orale/unite-7/question-03.mp3?v=20260712-u7",
      frames: [
        "Ma chambre est ______. Dans ma chambre, il y a ______.",
        "Le / la ______ est près de ______."
      ],
      vocabulary: ["ma chambre", "petite", "grande", "claire", "confortable", "un lit", "un bureau", "une armoire", "une fenêtre", "près de"],
      grammar: "Commence par l’ambiance, puis ajoute les objets : ma chambre est claire. Il y a un lit.",
      checks: [
        { label: "pièce décrite", terms: ["ma chambre", "dans ma chambre", "chambre"] },
        { label: "objet de la chambre", terms: ["lit", "bureau", "armoire", "fenetre", "lampe", "chaise"] },
        { label: "description ou localisation", terms: ["petite", "grande", "claire", "confortable", "pres de", "sur", "a cote de"] }
      ],
      minWords: 12,
      maxSeconds: 30,
      improved: "Ma chambre est petite mais confortable. Dans ma chambre, il y a un lit, un bureau et une armoire."
    },
    {
      id: "fr1u7q4",
      unit: 7,
      topic: "Objets de la maison",
      text: "Qu’est-ce qu’il y a dans ton salon ou dans ta cuisine ?",
      audio: "../audio/pratique-orale/unite-7/question-04.mp3?v=20260712-u7",
      frames: [
        "Dans mon salon, il y a ______.",
        "Dans ma cuisine, il y a ______."
      ],
      vocabulary: ["dans mon salon", "dans ma cuisine", "un canapé", "une table", "des chaises", "une lampe", "un réfrigérateur", "un évier"],
      grammar: "Utilise un ou une au singulier, et des au pluriel : une table, des chaises.",
      checks: [
        { label: "lieu de la maison", terms: ["salon", "cuisine"] },
        { label: "structure il y a", terms: ["il y a"] },
        { label: "objet nommé", terms: ["canape", "table", "chaise", "chaises", "lampe", "refrigerateur", "evier", "fauteuil"] }
      ],
      minWords: 9,
      maxSeconds: 26,
      improved: "Dans mon salon, il y a un canapé, une table basse et une lampe."
    },
    {
      id: "fr1u7q5",
      unit: 7,
      topic: "Négation",
      text: "Qu’est-ce qu’il n’y a pas dans ton logement ?",
      audio: "../audio/pratique-orale/unite-7/question-05.mp3?v=20260712-u7",
      frames: [
        "Dans mon logement, il n’y a pas de ______.",
        "Il n’y a pas de jardin, mais il y a ______."
      ],
      vocabulary: ["il n’y a pas de", "pas d’", "un balcon", "un jardin", "un garage", "une télévision", "un four", "mais"],
      grammar: "Après la négation, un / une / des devient souvent de : il n’y a pas de balcon.",
      checks: [
        { label: "négation correcte", terms: ["il n y a pas de", "il n'y a pas de", "il n y a pas d", "il n'y a pas d"] },
        { label: "élément absent", terms: ["balcon", "jardin", "garage", "television", "four", "terrasse"] }
      ],
      minWords: 7,
      maxSeconds: 24,
      improved: "Dans mon logement, il n’y a pas de jardin, mais il y a un balcon."
    },
    {
      id: "fr1u7q6",
      unit: 7,
      topic: "Prépositions de lieu",
      text: "Où est un objet dans ta chambre ?",
      audio: "../audio/pratique-orale/unite-7/question-06.mp3?v=20260712-u7",
      frames: [
        "Le / la ______ est sur / sous / dans ______.",
        "Le / la ______ est à côté de / près de ______."
      ],
      vocabulary: ["le livre", "la lampe", "le sac", "les clés", "sur le bureau", "sous la table", "dans le sac", "à côté du lit", "près de la fenêtre"],
      grammar: "Pour répondre à où, utilise une préposition : sur, sous, dans, devant, derrière, près de, à côté de.",
      checks: [
        { label: "objet nommé", terms: ["livre", "lampe", "sac", "cles", "bureau", "chaise"] },
        { label: "préposition de lieu", terms: ["sur", "sous", "dans", "devant", "derriere", "pres de", "a cote de", "à côté de"] }
      ],
      minWords: 7,
      maxSeconds: 24,
      improved: "La lampe est sur le bureau et le sac est à côté du lit."
    },
    {
      id: "fr1u7q7",
      unit: 7,
      topic: "Question sur le logement",
      text: "Pose une question sur le logement de ton camarade.",
      audio: "../audio/pratique-orale/unite-7/question-07.mp3?v=20260712-u7",
      frames: [
        "Est-ce qu’il y a ______ dans ton logement ?",
        "Où est ______ ? / Combien de chambres il y a ?"
      ],
      vocabulary: ["est-ce qu’il y a", "dans ton logement", "un balcon", "un jardin", "une cuisine", "où est", "combien de chambres"],
      grammar: "Pour demander l’existence, utilise est-ce qu’il y a. Pour demander la position, utilise où est.",
      checks: [
        { label: "forme de question", terms: ["est ce qu il y a", "est-ce qu'il y a", "ou est", "où est", "combien"] },
        { label: "vocabulaire du logement", terms: ["logement", "balcon", "jardin", "chambre", "cuisine", "salon", "salle de bain"] }
      ],
      minWords: 5,
      maxSeconds: 20,
      improved: "Est-ce qu’il y a un balcon dans ton logement ? Où est la cuisine ?"
    },
    {
      id: "fr1u7q8",
      unit: 7,
      topic: "Présentation du logement",
      text: "Présente ton logement en trois phrases courtes.",
      audio: "../audio/pratique-orale/unite-7/question-08.mp3?v=20260712-u7",
      frames: [
        "J’habite dans ______. Dans mon logement, il y a ______. Le / la ______ est ______.",
        "Mon logement est ______. Il y a ______. Il n’y a pas de ______."
      ],
      vocabulary: ["j’habite", "mon logement", "il y a", "il n’y a pas de", "un appartement", "une maison", "un salon", "une cuisine", "une chambre", "sur", "près de"],
      grammar: "Organise trois phrases : type de logement, pièces ou objets, localisation ou absence.",
      checks: [
        { label: "type de logement", terms: ["appartement", "maison", "studio", "logement"] },
        { label: "structure il y a", terms: ["il y a"] },
        { label: "détail spatial ou négation", terms: ["sur", "sous", "dans", "pres de", "a cote de", "il n y a pas", "il n'y a pas"] }
      ],
      minWords: 14,
      maxSeconds: 30,
      improved: "J’habite dans un appartement. Il y a un salon, une cuisine et deux chambres. Dans ma chambre, le bureau est près de la fenêtre."
    }
  ]
};
