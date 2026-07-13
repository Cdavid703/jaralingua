window.JaraLinguaOralUnitConfig = {
  apiPath: "/api/french8/pronunciation-assessment",
  storageKey: "jaralingua:french8:theme-07:conversation-coach:v1",
  language: "fr",
  courseLabel: "Français · Niveau 8",
  unitLabel: "Thème 07",
  title: "Coach de conversation – Thème 07 : justice sociale et citoyenneté",
  interviewer: {
    name: "Camille",
    role: "Coach de conversation"
  },
  attemptQuestionCount: 4,
  maxRecordingSeconds: 42,
  localUrl: "http://127.0.0.1:8021/frances/Niveau%208/ateliers/coach-conversation-07-justice-sociale.html",
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
    recordHelp: "Touchez le microphone et répondez avec le connecteur demandé.",
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
    questionReadyStatus: "Écoutez la situation, puis nuancez votre réponse avec concession ou opposition.",
    scoreMessages: {
      high: "Très bien : la nuance et la position citoyenne sont claires.",
      mid: "Bon travail : répétez en gardant le bon connecteur et le bon mode verbal.",
      low: "À reprendre : utilisez le connecteur demandé, puis formulez une position concrète."
    }
  },
  unitContext: {
    course: "Français Niveau 8",
    unit: 7,
    title: "Justice sociale, égalité et citoyenneté",
    grammar: [
      "bien que / quoique + subjonctif",
      "même si + indicatif",
      "malgré / en dépit de + nom",
      "cependant / toutefois / néanmoins",
      "opposition et concession dans une prise de position"
    ],
    vocabulary: [
      "égalité des chances",
      "mobilité sociale",
      "discrimination à l’embauche",
      "budget participatif",
      "plafond de verre",
      "obstacle invisible",
      "baisser les bras",
      "citoyenneté active"
    ],
    communicativeGoals: [
      "nuancer une opinion citoyenne",
      "reconnaître une limite sans abandonner l’argument",
      "opposer deux réalités sociales",
      "proposer une mesure concrète"
    ]
  },
  questions: [
    {
      id: "fr8t7q1",
      unit: 7,
      topic: "Bourses universitaires",
      text: "Les bourses aident certains étudiants, mais les inégalités continuent. Commencez par : Bien que.",
      audio: "../audio/pratique-orale/theme-07/question-01.mp3?v=20260713-fr8-t7",
      visual: {
        src: "../img/pratique-orale/theme-07-coach-conversation.webp?v=20260713-fr8-t7",
        alt: "Table citoyenne adulte discutant de justice sociale et d'égalité",
        caption: "Bien que reconnaît un progrès, puis maintient une limite."
      },
      frames: [
        "Bien que les bourses aident certains étudiants, les inégalités continuent.",
        "Bien que ces aides soient utiles, elles ne suffisent pas à garantir l’égalité des chances."
      ],
      vocabulary: ["bourses", "étudiants", "inégalités", "égalité des chances", "aides", "suffire"],
      grammar: "Bien que demande le subjonctif : soient utiles, aident certains étudiants.",
      checks: [
        { label: "concession avec bien que", terms: ["bien que"] },
        { label: "aide étudiante", terms: ["bourses", "aides", "étudiants", "etudiants"] },
        { label: "limite sociale", terms: ["inégalités", "inegalites", "égalité", "egalite", "suffisent"] }
      ],
      minWords: 9,
      maxSeconds: 34,
      improved: "Bien que ces aides soient utiles, elles ne suffisent pas à garantir l’égalité des chances."
    },
    {
      id: "fr8t7q2",
      unit: 7,
      topic: "Participation citoyenne",
      text: "Peu de citoyens participent au budget local, mais la mesure reste importante. Commencez par : Même si.",
      audio: "../audio/pratique-orale/theme-07/question-02.mp3?v=20260713-fr8-t7",
      visual: {
        src: "../img/pratique-orale/theme-07-coach-conversation.webp?v=20260713-fr8-t7",
        alt: "Table citoyenne adulte discutant de justice sociale et d'égalité",
        caption: "Même si garde l’indicatif et introduit une concession réaliste."
      },
      frames: [
        "Même si peu de citoyens participent au budget local, la mesure reste importante.",
        "Même si la participation est faible, le budget participatif peut renforcer la citoyenneté."
      ],
      vocabulary: ["citoyens", "budget local", "budget participatif", "participation", "mesure", "citoyenneté"],
      grammar: "Même si prend l’indicatif : participent, est, reste.",
      checks: [
        { label: "concession avec même si", terms: ["même si", "meme si"] },
        { label: "participation", terms: ["citoyens", "participation", "participent"] },
        { label: "mesure citoyenne", terms: ["budget", "mesure", "citoyenneté", "citoyennete"] }
      ],
      minWords: 10,
      maxSeconds: 34,
      improved: "Même si la participation est faible, le budget participatif peut renforcer la citoyenneté."
    },
    {
      id: "fr8t7q3",
      unit: 7,
      topic: "Discrimination à l’embauche",
      text: "Des entreprises promettent l’égalité, mais des candidats restent discriminés. Commencez par : Cependant.",
      audio: "../audio/pratique-orale/theme-07/question-03.mp3?v=20260713-fr8-t7",
      visual: {
        src: "../img/pratique-orale/theme-07-coach-conversation.webp?v=20260713-fr8-t7",
        alt: "Table citoyenne adulte discutant de justice sociale et d'égalité",
        caption: "Cependant oppose une promesse officielle à une réalité sociale."
      },
      frames: [
        "Des entreprises promettent l’égalité; cependant, des candidats restent discriminés.",
        "Les discours d’inclusion progressent; cependant, la discrimination à l’embauche existe encore."
      ],
      vocabulary: ["entreprises", "égalité", "candidats", "discriminés", "inclusion", "embauche"],
      grammar: "Cependant relie deux phrases indépendantes et marque l’opposition.",
      checks: [
        { label: "opposition avec cependant", terms: ["cependant"] },
        { label: "égalité annoncée", terms: ["égalité", "egalite", "inclusion", "promettent"] },
        { label: "discrimination", terms: ["discriminés", "discrimines", "discrimination", "embauche"] }
      ],
      minWords: 10,
      maxSeconds: 34,
      improved: "Les discours d’inclusion progressent; cependant, la discrimination à l’embauche existe encore."
    },
    {
      id: "fr8t7q4",
      unit: 7,
      topic: "Obstacles invisibles",
      text: "Il existe des programmes d’aide, mais le plafond de verre reste fort. Commencez par : Malgré.",
      audio: "../audio/pratique-orale/theme-07/question-04.mp3?v=20260713-fr8-t7",
      visual: {
        src: "../img/pratique-orale/theme-07-coach-conversation.webp?v=20260713-fr8-t7",
        alt: "Table citoyenne adulte discutant de justice sociale et d'égalité",
        caption: "Malgré exige un groupe nominal, pas une phrase conjuguée."
      },
      frames: [
        "Malgré les programmes d’aide, le plafond de verre reste fort.",
        "Malgré les efforts publics, certains obstacles invisibles freinent la mobilité sociale."
      ],
      vocabulary: ["programmes d’aide", "plafond de verre", "obstacles invisibles", "efforts publics", "mobilité sociale"],
      grammar: "Malgré se construit avec un nom : malgré les programmes, malgré les efforts.",
      checks: [
        { label: "opposition avec malgré", terms: ["malgré", "malgre"] },
        { label: "aide ou effort", terms: ["programmes", "aide", "efforts"] },
        { label: "obstacle social", terms: ["plafond de verre", "obstacles", "mobilité", "mobilite"] }
      ],
      minWords: 8,
      maxSeconds: 32,
      improved: "Malgré les efforts publics, certains obstacles invisibles freinent la mobilité sociale."
    },
    {
      id: "fr8t7q5",
      unit: 7,
      topic: "Politique publique",
      text: "Une mesure coûte cher, mais elle peut réduire les injustices. Commencez par : Même si.",
      audio: "../audio/pratique-orale/theme-07/question-05.mp3?v=20260713-fr8-t7",
      visual: {
        src: "../img/pratique-orale/theme-07-coach-conversation.webp?v=20260713-fr8-t7",
        alt: "Table citoyenne adulte discutant de justice sociale et d'égalité",
        caption: "La concession permet de défendre une mesure sans cacher sa limite."
      },
      frames: [
        "Même si cette mesure coûte cher, elle peut réduire les injustices.",
        "Même si le budget est élevé, il ne faut pas baisser les bras face aux inégalités."
      ],
      vocabulary: ["mesure", "coûter cher", "budget", "réduire", "injustices", "baisser les bras"],
      grammar: "Même si + indicatif permet de reconnaître une limite concrète.",
      checks: [
        { label: "concession avec même si", terms: ["même si", "meme si"] },
        { label: "coût ou budget", terms: ["coûte", "coute", "budget", "cher", "élevé", "eleve"] },
        { label: "justice sociale", terms: ["injustices", "inégalités", "inegalites", "baisser les bras"] }
      ],
      minWords: 10,
      maxSeconds: 34,
      improved: "Même si le budget est élevé, il ne faut pas baisser les bras face aux inégalités."
    },
    {
      id: "fr8t7q6",
      unit: 7,
      topic: "Citoyenneté active",
      text: "Les associations sont petites, mais elles changent parfois les décisions locales. Commencez par : Néanmoins.",
      audio: "../audio/pratique-orale/theme-07/question-06.mp3?v=20260713-fr8-t7",
      visual: {
        src: "../img/pratique-orale/theme-07-coach-conversation.webp?v=20260713-fr8-t7",
        alt: "Table citoyenne adulte discutant de justice sociale et d'égalité",
        caption: "Néanmoins permet de relancer l’argument après une limite."
      },
      frames: [
        "Les associations sont petites; néanmoins, elles changent parfois les décisions locales.",
        "Les associations ont peu de moyens; néanmoins, elles peuvent influencer la vie citoyenne."
      ],
      vocabulary: ["associations", "décisions locales", "moyens", "influencer", "vie citoyenne", "changer"],
      grammar: "Néanmoins introduit une opposition et se place souvent après un point-virgule ou en début de phrase.",
      checks: [
        { label: "opposition avec néanmoins", terms: ["néanmoins", "neanmoins"] },
        { label: "associations", terms: ["associations", "moyens"] },
        { label: "impact citoyen", terms: ["décisions", "decisions", "locales", "citoyenne", "influencer"] }
      ],
      minWords: 10,
      maxSeconds: 34,
      improved: "Les associations ont peu de moyens; néanmoins, elles peuvent influencer la vie citoyenne."
    }
  ]
};
