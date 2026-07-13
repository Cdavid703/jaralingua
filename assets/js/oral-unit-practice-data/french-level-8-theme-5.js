window.JaraLinguaOralUnitConfig = {
  apiPath: "/api/french8/pronunciation-assessment",
  storageKey: "jaralingua:french8:theme-05:conversation-coach:v1",
  language: "fr",
  courseLabel: "Français · Niveau 8",
  unitLabel: "Thème 05",
  title: "Coach de conversation – Thème 05 : médias et désinformation",
  interviewer: {
    name: "Camille",
    role: "Coach de conversation"
  },
  attemptQuestionCount: 4,
  maxRecordingSeconds: 42,
  localUrl: "http://127.0.0.1:8021/frances/Niveau%208/ateliers/coach-conversation-05-medias-desinformation.html",
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
    recordHelp: "Touchez le microphone et répondez avec une structure de mise en relief.",
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
    questionReadyStatus: "Écoutez la situation, puis insistez sur l’élément essentiel.",
    scoreMessages: {
      high: "Très bien : la mise en relief et l’idée critique sont claires.",
      mid: "Bon travail : répétez en gardant la structure de départ et une preuve précise.",
      low: "À reprendre : utilisez la structure proposée, puis nommez l’élément à vérifier."
    }
  },
  unitContext: {
    course: "Français Niveau 8",
    unit: 5,
    title: "Médias et désinformation",
    grammar: [
      "ce qui + verbe, c’est...",
      "ce que + sujet + verbe, c’est...",
      "ce dont + sujet + verbe, c’est...",
      "c’est + nom + qui...",
      "c’est + nom + que...",
      "mise en relief pour corriger ou préciser"
    ],
    vocabulary: [
      "source",
      "preuve",
      "titre alarmiste",
      "biais de confirmation",
      "image sortie de son contexte",
      "conflit d’intérêts",
      "corriger une erreur",
      "démêler le vrai du faux"
    ],
    communicativeGoals: [
      "mettre en relief l’élément important",
      "évaluer la fiabilité d’une information",
      "nommer un risque de manipulation",
      "répondre avec une phrase courte et précise"
    ]
  },
  questions: [
    {
      id: "fr8t5q1",
      unit: 5,
      topic: "Source absente",
      text: "Une vidéo virale semble professionnelle, mais elle ne cite aucune source. Commencez par : Ce qui compte, c’est.",
      audio: "../audio/pratique-orale/theme-05/question-01.mp3?v=20260713-fr8-t5",
      visual: {
        src: "../img/pratique-orale/theme-05-coach-conversation.webp?v=20260713-fr8-t5",
        alt: "Apprenants adultes vérifiant des sources médiatiques",
        caption: "La forme professionnelle ne suffit pas : il faut vérifier la source."
      },
      frames: [
        "Ce qui compte, c’est de vérifier la source avant de partager la vidéo.",
        "Ce qui compte, c’est la source et la possibilité de vérifier les preuves."
      ],
      vocabulary: ["vidéo virale", "professionnelle", "source", "preuve", "vérifier", "partager"],
      grammar: "Ce qui met en relief une idée ou une action importante.",
      checks: [
        { label: "mise en relief avec ce qui", terms: ["ce qui compte c'est", "ce qui compte c est"] },
        { label: "vérification", terms: ["vérifier", "verifier", "source"] },
        { label: "information médiatique", terms: ["vidéo", "video", "preuve", "partager"] }
      ],
      minWords: 9,
      maxSeconds: 32,
      improved: "Ce qui compte, c’est de vérifier la source avant de partager la vidéo."
    },
    {
      id: "fr8t5q2",
      unit: 5,
      topic: "Titre alarmiste",
      text: "Un titre très alarmiste vous pousse à cliquer. Commencez par : Ce qui me dérange, c’est.",
      audio: "../audio/pratique-orale/theme-05/question-02.mp3?v=20260713-fr8-t5",
      visual: {
        src: "../img/pratique-orale/theme-05-coach-conversation.webp?v=20260713-fr8-t5",
        alt: "Apprenants adultes vérifiant des sources médiatiques",
        caption: "Le ton émotionnel peut être un indice de manipulation."
      },
      frames: [
        "Ce qui me dérange, c’est le ton alarmiste du titre.",
        "Ce qui me dérange, c’est que le titre cherche surtout à provoquer la peur."
      ],
      vocabulary: ["titre", "alarmiste", "cliquer", "peur", "ton", "déranger"],
      grammar: "Ce qui me dérange, c’est... permet de nommer clairement le problème.",
      checks: [
        { label: "mise en relief avec ce qui", terms: ["ce qui me dérange c'est", "ce qui me derange c est"] },
        { label: "problème nommé", terms: ["titre", "alarmiste", "ton", "peur"] },
        { label: "effet du contenu", terms: ["cliquer", "provoquer"] }
      ],
      minWords: 8,
      maxSeconds: 32,
      improved: "Ce qui me dérange, c’est le ton alarmiste du titre."
    },
    {
      id: "fr8t5q3",
      unit: 5,
      topic: "Biais de confirmation",
      text: "Une publication confirme exactement votre peur. Commencez par : Ce dont il faut se méfier, c’est.",
      audio: "../audio/pratique-orale/theme-05/question-03.mp3?v=20260713-fr8-t5",
      visual: {
        src: "../img/pratique-orale/theme-05-coach-conversation.webp?v=20260713-fr8-t5",
        alt: "Apprenants adultes vérifiant des sources médiatiques",
        caption: "Une information persuasive peut confirmer une peur déjà présente."
      },
      frames: [
        "Ce dont il faut se méfier, c’est du biais de confirmation.",
        "Ce dont il faut se méfier, c’est d’une information qui confirme seulement nos peurs."
      ],
      vocabulary: ["publication", "peur", "se méfier de", "biais de confirmation", "confirmer"],
      grammar: "Avec se méfier de, utilisez ce dont.",
      checks: [
        { label: "mise en relief avec ce dont", terms: ["ce dont il faut se méfier c'est", "ce dont il faut se mefier c est"] },
        { label: "construction avec de", terms: ["du biais", "d'une information", "de l'information"] },
        { label: "idée critique", terms: ["confirmation", "peur", "peurs"] }
      ],
      minWords: 9,
      maxSeconds: 34,
      improved: "Ce dont il faut se méfier, c’est du biais de confirmation."
    },
    {
      id: "fr8t5q4",
      unit: 5,
      topic: "Image hors contexte",
      text: "Une image peut être vraie, mais sortie de son contexte. Commencez par : Ce que je vérifie d’abord, c’est.",
      audio: "../audio/pratique-orale/theme-05/question-04.mp3?v=20260713-fr8-t5",
      visual: {
        src: "../img/pratique-orale/theme-05-coach-conversation.webp?v=20260713-fr8-t5",
        alt: "Apprenants adultes vérifiant des sources médiatiques",
        caption: "Une image vraie peut tromper si la date ou le lieu sont faux."
      },
      frames: [
        "Ce que je vérifie d’abord, c’est la date et le lieu de l’image.",
        "Ce que je vérifie d’abord, c’est si l’image correspond vraiment au contexte annoncé."
      ],
      vocabulary: ["image", "contexte", "date", "lieu", "vérifier d’abord", "correspondre"],
      grammar: "Ce que je vérifie met en relief l’objet de la vérification.",
      checks: [
        { label: "mise en relief avec ce que", terms: ["ce que je vérifie d'abord c'est", "ce que je verifie d abord c est"] },
        { label: "éléments de preuve", terms: ["date", "lieu", "contexte"] },
        { label: "image", terms: ["image"] }
      ],
      minWords: 9,
      maxSeconds: 34,
      improved: "Ce que je vérifie d’abord, c’est la date et le lieu de l’image."
    },
    {
      id: "fr8t5q5",
      unit: 5,
      topic: "Conflit d’intérêts",
      text: "Un influenceur vend un produit en donnant un conseil médical. Commencez par : C’est le conflit d’intérêts qui.",
      audio: "../audio/pratique-orale/theme-05/question-05.mp3?v=20260713-fr8-t5",
      visual: {
        src: "../img/pratique-orale/theme-05-coach-conversation.webp?v=20260713-fr8-t5",
        alt: "Apprenants adultes vérifiant des sources médiatiques",
        caption: "Un intérêt commercial peut influencer le message."
      },
      frames: [
        "C’est le conflit d’intérêts qui rend son message douteux.",
        "C’est le conflit d’intérêts qui doit nous rendre prudents."
      ],
      vocabulary: ["influenceur", "produit", "conseil médical", "conflit d’intérêts", "douteux", "prudent"],
      grammar: "C’est + nom + qui met en relief le sujet responsable de l’effet.",
      checks: [
        { label: "mise en relief avec c’est... qui", terms: ["c'est le conflit d'intérêts qui", "c est le conflit d interets qui", "c'est le conflit d'interêts qui"] },
        { label: "jugement critique", terms: ["douteux", "prudents", "prudent"] },
        { label: "contexte commercial", terms: ["produit", "influenceur", "médical", "medical"] }
      ],
      minWords: 8,
      maxSeconds: 32,
      improved: "C’est le conflit d’intérêts qui rend son message douteux."
    },
    {
      id: "fr8t5q6",
      unit: 5,
      topic: "Correction publique",
      text: "Un média corrige une erreur publiquement. Commencez par : Ce qui renforce la confiance, c’est.",
      audio: "../audio/pratique-orale/theme-05/question-06.mp3?v=20260713-fr8-t5",
      visual: {
        src: "../img/pratique-orale/theme-05-coach-conversation.webp?v=20260713-fr8-t5",
        alt: "Apprenants adultes vérifiant des sources médiatiques",
        caption: "Reconnaître une erreur peut renforcer la crédibilité."
      },
      frames: [
        "Ce qui renforce la confiance, c’est qu’un média corrige ses erreurs clairement.",
        "Ce qui renforce la confiance, c’est la correction publique de l’erreur."
      ],
      vocabulary: ["média", "corriger", "erreur", "publiquement", "confiance", "crédibilité"],
      grammar: "Ce qui renforce la confiance, c’est... met en relief la raison positive.",
      checks: [
        { label: "mise en relief avec ce qui", terms: ["ce qui renforce la confiance c'est", "ce qui renforce la confiance c est"] },
        { label: "correction", terms: ["corrige", "correction", "erreur", "erreurs"] },
        { label: "effet positif", terms: ["confiance", "crédibilité", "credibilite"] }
      ],
      minWords: 9,
      maxSeconds: 34,
      improved: "Ce qui renforce la confiance, c’est qu’un média corrige ses erreurs clairement."
    }
  ]
};
