window.JaraLinguaOralUnitConfig = {
  apiPath: "/api/french8/pronunciation-assessment",
  storageKey: "jaralingua:french8:theme-01:conversation-coach:v1",
  language: "fr",
  courseLabel: "Français · Niveau 8",
  unitLabel: "Thème 01",
  title: "Coach de conversation – Thème 01 : regrets, reproches et bilans",
  interviewer: {
    name: "Camille",
    role: "Coach de conversation"
  },
  attemptQuestionCount: 4,
  maxRecordingSeconds: 40,
  localUrl: "http://127.0.0.1:8021/frances/Niveau%208/ateliers/coach-conversation-01-regrets-reproches-bilans.html",
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
    recordHelp: "Touchez le microphone et répondez en français avec une phrase complète.",
    recording: "Enregistrement en cours…",
    transcribing: "Analyse temporaire de votre réponse avec Whisper…",
    transcribed: "Réponse transcrite. Relisez-la avant de continuer.",
    noSpeech: "Whisper a détecté du son, mais pas de mots français clairs. Parlez un peu plus près du microphone.",
    unsupportedTitle: "Navigateur non compatible",
    unsupportedDetail: "Cette activité nécessite getUserMedia et MediaRecorder.",
    privacy: "L’audio est envoyé temporairement au service Whisper de JaraLingua pour transcription. Il n’est pas sauvegardé.",
    formativeNotice: "Ceci est un résultat automatique d’entraînement, et non une note officielle.",
    lowConfidenceLabel: "Mots à prononcer plus clairement :",
    improvedModelLabel: "Modèle attendu",
    structureLabel: "Réponse modèle {number}",
    questionCounter: "Question {current} sur {total}",
    questionReadyStatus: "Écoutez la question, puis répondez directement.",
    scoreMessages: {
      high: "Très bien : la réponse répond directement à la situation et utilise la structure attendue.",
      mid: "Bon travail : répétez en gardant la structure et en ajoutant l’action précise.",
      low: "À reprendre : utilisez le modèle proposé et répondez avec une phrase complète."
    }
  },
  unitContext: {
    course: "Français Niveau 8",
    unit: 1,
    title: "Regrets, reproches et bilans",
    grammar: [
      "conditionnel passé",
      "j’aurais dû + infinitif",
      "j’aurais pu + infinitif",
      "il aurait fallu + infinitif",
      "reproche diplomatique"
    ],
    vocabulary: [
      "relire",
      "vérifier",
      "organiser",
      "noter",
      "agenda",
      "présentation",
      "horaire",
      "avec le recul",
      "refaire le monde"
    ],
    communicativeGoals: [
      "formuler un regret précis",
      "faire un reproche diplomatique",
      "faire un bilan après une erreur",
      "proposer une correction après coup"
    ]
  },
  questions: [
    {
      id: "fr8t1q1",
      unit: 1,
      topic: "Regret après une remise",
      text: "Vous avez envoyé un devoir avec plusieurs erreurs. Qu’est-ce que vous auriez dû faire avant de l’envoyer ?",
      audio: "../audio/pratique-orale/theme-01/question-01.mp3?v=20260713-fr8-t1",
      visual: {
        src: "../img/pratique-orale/theme-01-coach-conversation.webp?v=20260713-fr8-t1",
        alt: "Apprenants adultes en entraînement oral avec un microphone",
        caption: "Répondez avec une action concrète avant l’envoi."
      },
      frames: [
        "J’aurais dû relire mon devoir avant de l’envoyer.",
        "Avant de l’envoyer, j’aurais dû vérifier et corriger mon devoir."
      ],
      vocabulary: ["envoyer", "un devoir", "plusieurs erreurs", "relire", "vérifier", "corriger", "avant de"],
      grammar: "Après « j’aurais dû », utilisez un infinitif : j’aurais dû relire.",
      checks: [
        { label: "conditionnel passé avec devoir", terms: ["j'aurais dû", "j aurais du", "aurais dû", "aurais du"] },
        { label: "action de correction", terms: ["relire", "vérifier", "verifier", "corriger"] },
        { label: "objet de la situation", terms: ["devoir", "travail", "erreur", "erreurs"] }
      ],
      minWords: 7,
      maxSeconds: 28,
      improved: "J’aurais dû relire mon devoir avant de l’envoyer."
    },
    {
      id: "fr8t1q2",
      unit: 1,
      topic: "Bilan de groupe",
      text: "Votre groupe a commencé un projet trop tard. Qu’est-ce qu’il aurait fallu faire dès le début ?",
      audio: "../audio/pratique-orale/theme-01/question-02.mp3?v=20260713-fr8-t1",
      visual: {
        src: "../img/pratique-orale/theme-01-coach-conversation.webp?v=20260713-fr8-t1",
        alt: "Apprenants adultes en entraînement oral avec un microphone",
        caption: "Le bilan doit expliquer l’action qui manquait au départ."
      },
      frames: [
        "Il aurait fallu organiser le travail dès le début.",
        "Dès le début, il aurait fallu répartir les tâches."
      ],
      vocabulary: ["commencer trop tard", "dès le début", "organiser", "répartir", "les tâches", "planifier"],
      grammar: "« Il aurait fallu » sert à dire ce qui était nécessaire après coup.",
      checks: [
        { label: "il aurait fallu", terms: ["il aurait fallu"] },
        { label: "organisation du projet", terms: ["organiser", "répartir", "repartir", "planifier", "préparer", "preparer"] },
        { label: "moment initial", terms: ["début", "debut", "dès le début", "des le debut"] }
      ],
      minWords: 7,
      maxSeconds: 28,
      improved: "Il aurait fallu organiser le travail dès le début."
    },
    {
      id: "fr8t1q3",
      unit: 1,
      topic: "Prévention d’un oubli",
      text: "Vous avez oublié un rendez-vous important. Qu’est-ce que vous auriez pu faire pour l’éviter ?",
      audio: "../audio/pratique-orale/theme-01/question-03.mp3?v=20260713-fr8-t1",
      visual: {
        src: "../img/pratique-orale/theme-01-coach-conversation.webp?v=20260713-fr8-t1",
        alt: "Apprenants adultes en entraînement oral avec un microphone",
        caption: "Répondez avec une mesure simple de prévention."
      },
      frames: [
        "J’aurais pu noter le rendez-vous dans mon agenda.",
        "Pour l’éviter, j’aurais pu mettre un rappel sur mon téléphone."
      ],
      vocabulary: ["oublier", "rendez-vous", "agenda", "rappel", "calendrier", "éviter"],
      grammar: "« J’aurais pu » exprime une possibilité passée qui n’a pas été réalisée.",
      checks: [
        { label: "conditionnel passé avec pouvoir", terms: ["j'aurais pu", "j aurais pu", "aurais pu"] },
        { label: "action de prévention", terms: ["noter", "mettre", "écrire", "ecrire", "programmer"] },
        { label: "outil de rappel", terms: ["agenda", "rappel", "calendrier", "téléphone", "telephone"] }
      ],
      minWords: 7,
      maxSeconds: 28,
      improved: "J’aurais pu noter le rendez-vous dans mon agenda."
    },
    {
      id: "fr8t1q4",
      unit: 1,
      topic: "Reproche diplomatique",
      text: "Un ami n’a pas préparé sa présentation. Quel reproche diplomatique pouvez-vous lui faire ?",
      audio: "../audio/pratique-orale/theme-01/question-04.mp3?v=20260713-fr8-t1",
      visual: {
        src: "../img/pratique-orale/theme-01-coach-conversation.webp?v=20260713-fr8-t1",
        alt: "Apprenants adultes en entraînement oral avec un microphone",
        caption: "Le reproche doit rester poli et indirect."
      },
      frames: [
        "Tu aurais peut-être pu préparer ta présentation plus tôt.",
        "Tu aurais peut-être dû organiser tes idées avant la présentation."
      ],
      vocabulary: ["un ami", "préparer", "présentation", "plus tôt", "organiser", "les idées", "peut-être"],
      grammar: "Pour adoucir un reproche, ajoutez « peut-être » : tu aurais peut-être pu…",
      checks: [
        { label: "reproche au conditionnel passé", terms: ["tu aurais peut-être pu", "tu aurais peut etre pu", "tu aurais pu", "tu aurais dû", "tu aurais du"] },
        { label: "action attendue", terms: ["préparer", "preparer", "organiser", "réviser", "reviser"] },
        { label: "présentation", terms: ["présentation", "presentation", "idées", "idees"] }
      ],
      minWords: 7,
      maxSeconds: 30,
      improved: "Tu aurais peut-être pu préparer ta présentation plus tôt."
    },
    {
      id: "fr8t1q5",
      unit: 1,
      topic: "Bilan d’une activité ratée",
      text: "Votre équipe a raté une activité parce que personne n’a vérifié l’horaire. Quel bilan faites-vous ?",
      audio: "../audio/pratique-orale/theme-01/question-05.mp3?v=20260713-fr8-t1",
      visual: {
        src: "../img/pratique-orale/theme-01-coach-conversation.webp?v=20260713-fr8-t1",
        alt: "Apprenants adultes en entraînement oral avec un microphone",
        caption: "Le bilan doit identifier l’erreur collective."
      },
      frames: [
        "Nous aurions dû vérifier l’horaire avant l’activité.",
        "On aurait dû confirmer l’horaire plus tôt."
      ],
      vocabulary: ["équipe", "rater", "activité", "horaire", "vérifier", "confirmer", "avant"],
      grammar: "Pour parler au nom du groupe, utilisez « nous aurions dû » ou « on aurait dû ».",
      checks: [
        { label: "bilan collectif", terms: ["nous aurions dû", "nous aurions du", "on aurait dû", "on aurait du"] },
        { label: "vérification", terms: ["vérifier", "verifier", "confirmer", "regarder"] },
        { label: "horaire ou activité", terms: ["horaire", "activité", "activite"] }
      ],
      minWords: 7,
      maxSeconds: 28,
      improved: "Nous aurions dû vérifier l’horaire avant l’activité."
    },
    {
      id: "fr8t1q6",
      unit: 1,
      topic: "Regret après un examen",
      text: "Après un examen difficile, vous comprenez que vous avez étudié trop tard. Qu’auriez-vous dû faire ?",
      audio: "../audio/pratique-orale/theme-01/question-06.mp3?v=20260713-fr8-t1",
      visual: {
        src: "../img/pratique-orale/theme-01-coach-conversation.webp?v=20260713-fr8-t1",
        alt: "Apprenants adultes en entraînement oral avec un microphone",
        caption: "Répondez avec une stratégie d’étude plus efficace."
      },
      frames: [
        "J’aurais dû étudier plus tôt et mieux m’organiser.",
        "J’aurais dû commencer à réviser plusieurs jours avant."
      ],
      vocabulary: ["examen", "étudier", "réviser", "plus tôt", "s’organiser", "plusieurs jours avant"],
      grammar: "La réponse attendue commence naturellement par « j’aurais dû ».",
      checks: [
        { label: "conditionnel passé avec devoir", terms: ["j'aurais dû", "j aurais du", "aurais dû", "aurais du"] },
        { label: "travail scolaire", terms: ["étudier", "etudier", "réviser", "reviser", "commencer"] },
        { label: "temps ou organisation", terms: ["plus tôt", "plus tot", "avant", "organiser", "m'organiser"] }
      ],
      minWords: 7,
      maxSeconds: 28,
      improved: "J’aurais dû étudier plus tôt et mieux m’organiser."
    }
  ]
};
