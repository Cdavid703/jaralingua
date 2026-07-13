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
  localUrl: "http://127.0.0.1:8021/frances/Niveau%208/ateliers/coach-conversation-03-subjonctif-passe.html",
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
    unsupportedTitle: "Navigateur non compatible",
    unsupportedDetail: "Cette activité nécessite getUserMedia et MediaRecorder.",
    privacy: "L’audio est envoyé temporairement au service Whisper de JaraLingua pour transcription. Il n’est pas sauvegardé.",
    formativeNotice: "Ceci est un résultat automatique d’entraînement, et non une note officielle.",
    lowConfidenceLabel: "Mots à prononcer plus clairement :",
    improvedModelLabel: "Modèle attendu",
    structureLabel: "Réponse modèle {number}",
    questionCounter: "Question {current} sur {total}",
    questionReadyStatus: "Écoutez la situation, puis formulez la réaction demandée.",
    scoreMessages: {
      high: "Très bien : la réaction et le subjonctif passé sont clairs.",
      mid: "Bon travail : répétez en gardant le déclencheur et l’auxiliaire du subjonctif passé.",
      low: "À reprendre : utilisez le déclencheur proposé, puis « que » + subjonctif passé."
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
        { label: "déclencheur de regret", terms: ["je regrette que", "je regrette qu"] },
        { label: "subjonctif passé avec avoir", terms: ["ait annoncé", "ait annonce"] },
        { label: "fait terminé", terms: ["fermeture", "décision", "decision", "trop tard"] }
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
        { label: "déclencheur de soulagement", terms: ["je suis soulagé que", "je suis soulagée que", "je suis soulage que"] },
        { label: "subjonctif passé avec être", terms: ["soit arrivée", "soit arrivee", "soit arrivé", "soit arrive"] },
        { label: "action terminée", terms: ["équipe", "equipe", "rapidement", "alerte"] }
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
        { label: "déclencheur de satisfaction", terms: ["je suis content que", "je suis contente que", "je suis content qu", "je suis contente qu"] },
        { label: "subjonctif passé pronominal", terms: ["se soient préparés", "se soient prepares", "se soient préparé", "se soient prepare"] },
        { label: "contexte de préparation", terms: ["étudiants", "etudiants", "table ronde", "préparés", "prepares"] }
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
        { label: "jugement avec dommage", terms: ["il est dommage que", "il est dommage qu"] },
        { label: "subjonctif passé négatif", terms: ["n'ait pas vérifié", "n ait pas verifie", "n'ait pas verifie", "n ait pas vérifié"] },
        { label: "source ou publication", terms: ["source", "publier", "journaliste"] }
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
        { label: "déclencheur de jugement", terms: ["il est important que", "il est important qu"] },
        { label: "subjonctif passé avec avoir", terms: ["aient réagi", "aient reagi"] },
        { label: "réaction à une crise", terms: ["autorités", "autorites", "rapidement", "crise"] }
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
        { label: "déclencheur de satisfaction", terms: ["je suis heureux que", "je suis heureuse que", "je suis heureux qu", "je suis heureuse qu"] },
        { label: "subjonctif passé de pouvoir", terms: ["ait pu parler", "ait pu"] },
        { label: "contexte de décision", terms: ["responsable", "décision", "decision", "Marie"] }
      ],
      minWords: 9,
      maxSeconds: 34,
      improved: "Je suis heureux que Marie ait pu parler au responsable avant la décision."
    }
  ]
};
