window.JaraLinguaOralUnitConfig = {
  apiPath: "/api/french8/pronunciation-assessment",
  storageKey: "jaralingua:french8:theme-03:conversation-coach:v1",
  language: "fr",
  courseLabel: "Français · Niveau 8",
  unitLabel: "Thème 03",
  title: "Coach de conversation – Thème 03 : jugement, émotion et antériorité",
  interviewer: {
    name: "Camille",
    role: "Coach de conversation"
  },
  attemptQuestionCount: 4,
  maxRecordingSeconds: 42,
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
    recordHelp: "Touchez le microphone et répondez avec une phrase au subjonctif passé.",
    recording: "Enregistrement en cours…",
    transcribing: "Analyse temporaire de votre réponse avec Whisper…",
    transcribed: "Réponse transcrite. Relisez-la avant de continuer.",
    noSpeech: "Whisper a détecté du son, mais pas de mots français clairs. Parlez un peu plus près du microphone.",
    transcriptionRetryAdvice: "Réessayez avec une phrase courte, proche du micro, en prononçant clairement le groupe après « que ».",
    transcriptionErrorStatus: "Analyse indisponible. Recommencez la réponse.",
    unsupportedTitle: "Navigateur non compatible",
    unsupportedDetail: "Cette activité nécessite getUserMedia et MediaRecorder.",
    privacy: "L’audio est envoyé temporairement au service Whisper de JaraLingua pour transcription. Il n’est pas sauvegardé.",
    formativeNotice: "Ceci est un résultat automatique d’entraînement, et non une note officielle.",
    lowConfidenceLabel: "Mots à prononcer plus clairement :",
    improvedModelLabel: "Modèle attendu",
    structureLabel: "Réponse modèle {number}",
    selectedFrameHelp: "Modèle choisi : {model} Répétez la structure, puis adaptez-la naturellement à votre voix.",
    questionCounter: "Question {current} sur {total}",
    questionReadyStatus: "Écoutez la situation, puis formulez la réaction demandée.",
    scoreLabel: "Préparation",
    expectedElement: "élément attendu",
    summaryLeadHigh: "Très bonne préparation : vos réactions sont claires et le subjonctif passé apparaît dans les réponses.",
    summaryLeadMid: "Bonne base : répétez surtout les réponses où le déclencheur ou l’auxiliaire n’a pas été reconnu.",
    summaryLeadLow: "À reprendre : gardez une phrase courte avec le déclencheur imposé, puis que + subjonctif passé.",
    comparisonDefault: "Refaites la pratique en masquant l’aide après la première question pour vérifier l’automatisation.",
    metricLabels: [
      ["task", "Structure attendue", "déclencheur, que et subjonctif passé"],
      ["development", "Phrase complète", "longueur suffisante et contexte clair"],
      ["clarity", "Clarté audio", "reconnaissance approximative par Whisper"],
      ["fluency", "Continuité", "durée et réponse sans coupure excessive"]
    ],
    summaryMessages: {
      taskStrength: "Vous respectez globalement la structure demandée : déclencheur + que + subjonctif passé.",
      taskPriority: "Reprenez la structure exacte : déclencheur imposé, que, puis auxiliaire au subjonctif présent.",
      developmentStrength: "Vos réponses donnent assez d’information pour comprendre le fait passé.",
      developmentPriority: "Ajoutez le sujet et l’action terminée : qui a agi, qu’est-ce qui s’est passé.",
      clarityStrength: "La transcription reconnaît une bonne partie de vos mots.",
      clarityPriority: "Parlez plus près du micro et ralentissez les groupes verbaux difficiles.",
      fluencyStrength: "Vos réponses gardent une continuité correcte.",
      fluencyPriority: "Préparez une phrase courte avant d’enregistrer.",
      defaultStrength: "Vous avez terminé une pratique orale complète.",
      defaultPriority: "Reprenez deux questions en masquant l’aide."
    },
    scoreMessages: {
      high: "Très bien : la réaction, le déclencheur et le subjonctif passé sont clairs.",
      mid: "Bon travail : répétez en vérifiant le déclencheur, l’auxiliaire et le participe passé.",
      low: "À reprendre : utilisez le déclencheur proposé, puis « que » + auxiliaire au subjonctif présent + participe passé."
    }
  },
  unitContext: {
    course: "Français Niveau 8",
    unit: 3,
    title: "Jugement, émotion et antériorité",
    grammar: [
      "que + subjonctif passé",
      "avoir au subjonctif présent + participe passé",
      "être au subjonctif présent + participe passé",
      "verbes pronominaux au subjonctif passé",
      "réaction après une action terminée"
    ],
    vocabulary: [
      "regretter que",
      "être soulagé que",
      "être content que",
      "il est dommage que",
      "il est important que",
      "être heureux que",
      "vérifier une source",
      "réagir rapidement",
      "si j'avais su"
    ],
    communicativeGoals: [
      "exprimer une émotion après un fait terminé",
      "formuler un jugement sur une action passée",
      "choisir avoir, être ou se + être",
      "répondre avec une phrase directe au subjonctif passé"
    ]
  },
  questions: [
    {
      id: "fr8t3q1",
      unit: 3,
      topic: "Regret public",
      text: "La mairie a annoncé la fermeture du centre trop tard. Utilisez : Je regrette que.",
      audio: "../audio/pratique-orale/theme-03/question-01.mp3?v=20260713-fr8-t3",
      visual: {
        src: "../img/pratique-orale/theme-03-coach-conversation.webp?v=20260713-fr8-t3",
        alt: "Apprenants adultes exprimant des réactions au subjonctif passé",
        caption: "La réaction porte sur une action déjà terminée."
      },
      frames: [
        "Je regrette que la mairie ait annoncé la fermeture trop tard.",
        "Je regrette qu’elle ait annoncé cette décision trop tard."
      ],
      vocabulary: ["mairie", "annoncer", "fermeture", "centre", "trop tard", "regretter"],
      grammar: "Après « je regrette que », utilisez le subjonctif : ait annoncé.",
      checks: [
        { label: "déclencheur obligatoire : Je regrette que", terms: ["je regrette que", "je regrette qu"] },
        { label: "auxiliaire avoir au subjonctif : ait annoncé", terms: ["ait annoncé", "ait annonce"], transcriptionTerms: ["et annonce"] },
        { label: "fait terminé clairement nommé", terms: ["fermeture", "décision", "decision", "trop tard"] }
      ],
      minWords: 9,
      maxSeconds: 32,
      improved: "Je regrette que la mairie ait annoncé la fermeture trop tard."
    },
    {
      id: "fr8t3q2",
      unit: 3,
      topic: "Soulagement",
      text: "L’équipe médicale est arrivée rapidement après l’alerte. Utilisez : Je suis soulagé que.",
      audio: "../audio/pratique-orale/theme-03/question-02.mp3?v=20260713-fr8-t3",
      visual: {
        src: "../img/pratique-orale/theme-03-coach-conversation.webp?v=20260713-fr8-t3",
        alt: "Apprenants adultes exprimant des réactions au subjonctif passé",
        caption: "Attention : arriver utilise être."
      },
      frames: [
        "Je suis soulagé que l’équipe médicale soit arrivée rapidement.",
        "Je suis soulagé qu’elle soit arrivée rapidement après l’alerte."
      ],
      vocabulary: ["équipe médicale", "arriver", "rapidement", "alerte", "soulagé", "soulagée"],
      grammar: "Avec « arriver », le subjonctif passé utilise être : soit arrivée.",
      checks: [
        { label: "déclencheur obligatoire : Je suis soulagé que", terms: ["je suis soulagé que", "je suis soulagée que", "je suis soulage que"] },
        { label: "auxiliaire être au subjonctif : soit arrivée", terms: ["soit arrivée", "soit arrivee", "soit arrivé", "soit arrive"], transcriptionTerms: ["sois arrivee", "sois arrive"] },
        { label: "action terminée clairement nommée", terms: ["équipe", "equipe", "rapidement", "alerte"] }
      ],
      minWords: 8,
      maxSeconds: 32,
      improved: "Je suis soulagé que l’équipe médicale soit arrivée rapidement."
    },
    {
      id: "fr8t3q3",
      unit: 3,
      topic: "Préparation",
      text: "Les étudiants se sont bien préparés avant la table ronde. Utilisez : Je suis content que.",
      audio: "../audio/pratique-orale/theme-03/question-03.mp3?v=20260713-fr8-t3",
      visual: {
        src: "../img/pratique-orale/theme-03-coach-conversation.webp?v=20260713-fr8-t3",
        alt: "Apprenants adultes exprimant des réactions au subjonctif passé",
        caption: "Ici, le verbe est pronominal : se préparer."
      },
      frames: [
        "Je suis content qu’ils se soient bien préparés.",
        "Je suis contente qu’ils se soient préparés avant la table ronde."
      ],
      vocabulary: ["étudiants", "se préparer", "table ronde", "content", "contente", "bien"],
      grammar: "Avec un verbe pronominal, utilisez se + être au subjonctif : qu’ils se soient préparés.",
      checks: [
        { label: "déclencheur obligatoire : Je suis content que", terms: ["je suis content que", "je suis contente que", "je suis content qu", "je suis contente qu"] },
        { label: "forme pronominale : se soient préparés", terms: ["se soient préparés", "se soient prepares", "se soient préparé", "se soient prepare"], transcriptionTerms: ["se soit prepares", "se soit prepare"] },
        { label: "contexte de préparation nommé", terms: ["étudiants", "etudiants", "table ronde", "préparés", "prepares"] }
      ],
      minWords: 8,
      maxSeconds: 32,
      improved: "Je suis content qu’ils se soient bien préparés."
    },
    {
      id: "fr8t3q4",
      unit: 3,
      topic: "Source non vérifiée",
      text: "Le journaliste n’a pas vérifié sa source avant de publier. Utilisez : Il est dommage que.",
      audio: "../audio/pratique-orale/theme-03/question-04.mp3?v=20260713-fr8-t3",
      visual: {
        src: "../img/pratique-orale/theme-03-coach-conversation.webp?v=20260713-fr8-t3",
        alt: "Apprenants adultes exprimant des réactions au subjonctif passé",
        caption: "La négation encadre l’auxiliaire : n’ait pas vérifié."
      },
      frames: [
        "Il est dommage qu’il n’ait pas vérifié sa source avant de publier.",
        "Il est dommage que le journaliste n’ait pas vérifié sa source."
      ],
      vocabulary: ["journaliste", "vérifier", "source", "publier", "dommage", "avant de"],
      grammar: "Avec une phrase négative, dites : qu’il n’ait pas vérifié.",
      checks: [
        { label: "déclencheur obligatoire : Il est dommage que", terms: ["il est dommage que", "il est dommage qu"] },
        { label: "négation au subjonctif : n’ait pas vérifié", terms: ["n'ait pas vérifié", "n ait pas verifie", "n'ait pas verifie", "n ait pas vérifié"], transcriptionTerms: ["n est pas verifie", "net pas verifie"] },
        { label: "source ou publication nommée", terms: ["source", "publier", "journaliste"] }
      ],
      minWords: 10,
      maxSeconds: 34,
      improved: "Il est dommage qu’il n’ait pas vérifié sa source avant de publier."
    },
    {
      id: "fr8t3q5",
      unit: 3,
      topic: "Réaction rapide",
      text: "Les autorités ont réagi rapidement après la crise. Utilisez : Il est important que.",
      audio: "../audio/pratique-orale/theme-03/question-05.mp3?v=20260713-fr8-t3",
      visual: {
        src: "../img/pratique-orale/theme-03-coach-conversation.webp?v=20260713-fr8-t3",
        alt: "Apprenants adultes exprimant des réactions au subjonctif passé",
        caption: "Le jugement valorise une action terminée."
      },
      frames: [
        "Il est important que les autorités aient réagi rapidement.",
        "Il est important qu’elles aient réagi rapidement après la crise."
      ],
      vocabulary: ["autorités", "réagir", "rapidement", "crise", "important", "appréciation"],
      grammar: "Après « il est important que », utilisez le subjonctif : aient réagi.",
      checks: [
        { label: "déclencheur obligatoire : Il est important que", terms: ["il est important que", "il est important qu"] },
        { label: "auxiliaire avoir au subjonctif : aient réagi", terms: ["aient réagi", "aient reagi"], transcriptionTerms: ["et reagi"] },
        { label: "réaction à une crise nommée", terms: ["autorités", "autorites", "rapidement", "crise"] }
      ],
      minWords: 8,
      maxSeconds: 32,
      improved: "Il est important que les autorités aient réagi rapidement."
    },
    {
      id: "fr8t3q6",
      unit: 3,
      topic: "Discussion avant décision",
      text: "Marie a pu parler au responsable avant la décision. Utilisez : Je suis heureux que.",
      audio: "../audio/pratique-orale/theme-03/question-06.mp3?v=20260713-fr8-t3",
      visual: {
        src: "../img/pratique-orale/theme-03-coach-conversation.webp?v=20260713-fr8-t3",
        alt: "Apprenants adultes exprimant des réactions au subjonctif passé",
        caption: "Le verbe pouvoir garde son participe : ait pu."
      },
      frames: [
        "Je suis heureux que Marie ait pu parler au responsable avant la décision.",
        "Je suis heureuse qu’elle ait pu parler au responsable."
      ],
      vocabulary: ["Marie", "pouvoir", "parler", "responsable", "décision", "heureux", "heureuse"],
      grammar: "Avec « pouvoir », utilisez : qu’elle ait pu + infinitif.",
      checks: [
        { label: "déclencheur obligatoire : Je suis heureux que", terms: ["je suis heureux que", "je suis heureuse que", "je suis heureux qu", "je suis heureuse qu"] },
        { label: "subjonctif passé de pouvoir : ait pu", terms: ["ait pu parler", "ait pu"], transcriptionTerms: ["et pu parler", "et pu"] },
        { label: "contexte de décision nommé", terms: ["responsable", "décision", "decision", "Marie"] }
      ],
      minWords: 9,
      maxSeconds: 34,
      improved: "Je suis heureux que Marie ait pu parler au responsable avant la décision."
    }
  ]
};
