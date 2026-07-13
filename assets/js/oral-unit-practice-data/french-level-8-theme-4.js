window.JaraLinguaOralUnitConfig = {
  apiPath: "/api/french8/pronunciation-assessment",
  storageKey: "jaralingua:french8:theme-04:conversation-coach:v1",
  language: "fr",
  courseLabel: "Français · Niveau 8",
  unitLabel: "Thème 04",
  title: "Coach de conversation – Thème 04 : discours rapporté avancé",
  interviewer: {
    name: "Camille",
    role: "Coach de conversation"
  },
  attemptQuestionCount: 4,
  maxRecordingSeconds: 42,
  localUrl: "http://127.0.0.1:8021/frances/Niveau%208/ateliers/coach-conversation-04-discours-rapporte.html",
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
    recordHelp: "Touchez le microphone et rapportez la parole sans la déformer.",
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
    questionReadyStatus: "Écoutez la parole directe, puis rapportez-la avec précision.",
    scoreMessages: {
      high: "Très bien : la parole est rapportée avec les bons changements.",
      mid: "Bon travail : répétez en vérifiant le verbe introducteur, le temps et les repères.",
      low: "À reprendre : gardez le sens, puis changez le temps, le pronom ou la structure demandée."
    }
  },
  unitContext: {
    course: "Français Niveau 8",
    unit: 4,
    title: "Discours rapporté avancé",
    grammar: [
      "verbe introducteur + que",
      "question indirecte avec si",
      "question indirecte avec mot interrogatif",
      "conseil ou ordre avec de + infinitif",
      "concordance des temps",
      "repères temporels : demain -> le lendemain, aujourd’hui -> ce jour-là"
    ],
    vocabulary: [
      "annoncer",
      "affirmer",
      "demander si",
      "demander pourquoi",
      "conseiller de",
      "expliquer que",
      "vérifier la source",
      "version officielle",
      "rumeur",
      "de bouche à oreille"
    ],
    communicativeGoals: [
      "rapporter une déclaration sans la déformer",
      "transformer une question directe en question indirecte",
      "rapporter une consigne avec de + infinitif",
      "changer les temps et les repères de manière cohérente"
    ]
  },
  questions: [
    {
      id: "fr8t4q1",
      unit: 4,
      topic: "Annonce officielle",
      text: "Phrase directe : Je publierai le rapport demain. Commencez par : La ministre a annoncé que.",
      audio: "../audio/pratique-orale/theme-04/question-01.mp3?v=20260713-fr8-t4",
      visual: {
        src: "../img/pratique-orale/theme-04-coach-conversation.webp?v=20260713-fr8-t4",
        alt: "Apprenants adultes rapportant des déclarations avec précision",
        caption: "Le futur du discours direct devient souvent un conditionnel dans le récit au passé."
      },
      frames: [
        "La ministre a annoncé qu’elle publierait le rapport le lendemain.",
        "La ministre a annoncé qu’elle publierait ce rapport le lendemain."
      ],
      vocabulary: ["ministre", "annoncer", "publier", "rapport", "demain", "le lendemain"],
      grammar: "Avec un verbe introducteur au passé, je publierai devient elle publierait et demain devient le lendemain.",
      checks: [
        { label: "verbe introducteur", terms: ["la ministre a annoncé que", "la ministre a annoncé qu", "la ministre a annonce que"] },
        { label: "concordance du futur", terms: ["publierait"] },
        { label: "repère temporel transformé", terms: ["le lendemain"] }
      ],
      minWords: 8,
      maxSeconds: 32,
      improved: "La ministre a annoncé qu’elle publierait le rapport le lendemain."
    },
    {
      id: "fr8t4q2",
      unit: 4,
      topic: "Chiffres vérifiés",
      text: "Phrase directe : Nous avons déjà vérifié les chiffres. Commencez par : Le porte-parole a affirmé que.",
      audio: "../audio/pratique-orale/theme-04/question-02.mp3?v=20260713-fr8-t4",
      visual: {
        src: "../img/pratique-orale/theme-04-coach-conversation.webp?v=20260713-fr8-t4",
        alt: "Apprenants adultes rapportant des déclarations avec précision",
        caption: "Le passé composé peut devenir plus-que-parfait dans le discours rapporté au passé."
      },
      frames: [
        "Le porte-parole a affirmé qu’ils avaient déjà vérifié les chiffres.",
        "Le porte-parole a affirmé que son équipe avait déjà vérifié les chiffres."
      ],
      vocabulary: ["porte-parole", "affirmer", "déjà", "vérifier", "chiffres", "équipe"],
      grammar: "Nous avons vérifié devient ils avaient vérifié ou son équipe avait vérifié selon le contexte.",
      checks: [
        { label: "verbe introducteur", terms: ["le porte-parole a affirmé que", "le porte parole a affirmé que", "le porte-parole a affirme que"] },
        { label: "plus-que-parfait", terms: ["avaient déjà vérifié", "avaient deja verifie", "avait déjà vérifié", "avait deja verifie"] },
        { label: "information rapportée", terms: ["chiffres"] }
      ],
      minWords: 8,
      maxSeconds: 32,
      improved: "Le porte-parole a affirmé qu’ils avaient déjà vérifié les chiffres."
    },
    {
      id: "fr8t4q3",
      unit: 4,
      topic: "Question fermée",
      text: "Question directe : Est-ce que la réunion commencera à neuf heures ? Commencez par : La journaliste a demandé si.",
      audio: "../audio/pratique-orale/theme-04/question-03.mp3?v=20260713-fr8-t4",
      visual: {
        src: "../img/pratique-orale/theme-04-coach-conversation.webp?v=20260713-fr8-t4",
        alt: "Apprenants adultes rapportant des déclarations avec précision",
        caption: "Une question fermée devient une question indirecte avec si."
      },
      frames: [
        "La journaliste a demandé si la réunion commencerait à neuf heures.",
        "La journaliste a demandé si la réunion commencerait bien à neuf heures."
      ],
      vocabulary: ["journaliste", "demander si", "réunion", "commencer", "neuf heures", "question fermée"],
      grammar: "Est-ce que disparaît. La structure devient demander si + sujet + verbe.",
      checks: [
        { label: "question indirecte avec si", terms: ["a demandé si", "a demande si"] },
        { label: "concordance du futur", terms: ["commencerait"] },
        { label: "contenu de la question", terms: ["réunion", "reunion", "neuf heures"] }
      ],
      minWords: 8,
      maxSeconds: 32,
      improved: "La journaliste a demandé si la réunion commencerait à neuf heures."
    },
    {
      id: "fr8t4q4",
      unit: 4,
      topic: "Version officielle",
      text: "Question directe : Pourquoi avez-vous changé la version officielle ? Commencez par : Le directeur a demandé pourquoi.",
      audio: "../audio/pratique-orale/theme-04/question-04.mp3?v=20260713-fr8-t4",
      visual: {
        src: "../img/pratique-orale/theme-04-coach-conversation.webp?v=20260713-fr8-t4",
        alt: "Apprenants adultes rapportant des déclarations avec précision",
        caption: "La question ouverte garde le mot interrogatif, mais l’ordre devient indirect."
      },
      frames: [
        "Le directeur a demandé pourquoi ils avaient changé la version officielle.",
        "Le directeur a demandé pourquoi vous aviez changé la version officielle."
      ],
      vocabulary: ["directeur", "demander pourquoi", "changer", "version officielle", "question ouverte"],
      grammar: "Avez-vous changé devient ils avaient changé ou vous aviez changé selon la personne rapportée.",
      checks: [
        { label: "question indirecte ouverte", terms: ["a demandé pourquoi", "a demande pourquoi"] },
        { label: "plus-que-parfait", terms: ["avaient changé", "avaient change", "aviez changé", "aviez change"] },
        { label: "contenu exact", terms: ["version officielle"] }
      ],
      minWords: 8,
      maxSeconds: 34,
      improved: "Le directeur a demandé pourquoi ils avaient changé la version officielle."
    },
    {
      id: "fr8t4q5",
      unit: 4,
      topic: "Conseil professionnel",
      text: "Consigne directe : Vous devez vérifier la source avant de partager l’information. Commencez par : La responsable a conseillé de.",
      audio: "../audio/pratique-orale/theme-04/question-05.mp3?v=20260713-fr8-t4",
      visual: {
        src: "../img/pratique-orale/theme-04-coach-conversation.webp?v=20260713-fr8-t4",
        alt: "Apprenants adultes rapportant des déclarations avec précision",
        caption: "Un ordre ou un conseil se rapporte souvent avec de + infinitif."
      },
      frames: [
        "La responsable a conseillé de vérifier la source avant de partager l’information.",
        "La responsable a conseillé de vérifier la source avant de partager cette information."
      ],
      vocabulary: ["responsable", "conseiller de", "vérifier", "source", "partager", "information"],
      grammar: "Avec conseiller, la consigne devient conseiller de + infinitif.",
      checks: [
        { label: "verbe de conseil", terms: ["a conseillé de", "a conseille de"] },
        { label: "infinitif attendu", terms: ["vérifier la source", "verifier la source"] },
        { label: "complément conservé", terms: ["avant de partager", "information"] }
      ],
      minWords: 9,
      maxSeconds: 34,
      improved: "La responsable a conseillé de vérifier la source avant de partager l’information."
    },
    {
      id: "fr8t4q6",
      unit: 4,
      topic: "Rumeur non confirmée",
      text: "Phrase directe : Je ne peux pas confirmer cette rumeur aujourd’hui. Commencez par : Le témoin a expliqué que.",
      audio: "../audio/pratique-orale/theme-04/question-06.mp3?v=20260713-fr8-t4",
      visual: {
        src: "../img/pratique-orale/theme-04-coach-conversation.webp?v=20260713-fr8-t4",
        alt: "Apprenants adultes rapportant des déclarations avec précision",
        caption: "Aujourd’hui devient ce jour-là quand le récit est placé dans le passé."
      },
      frames: [
        "Le témoin a expliqué qu’il ne pouvait pas confirmer cette rumeur ce jour-là.",
        "Le témoin a expliqué qu’elle ne pouvait pas confirmer cette rumeur ce jour-là."
      ],
      vocabulary: ["témoin", "expliquer", "ne pas pouvoir", "confirmer", "rumeur", "ce jour-là"],
      grammar: "Je ne peux pas devient il ou elle ne pouvait pas, et aujourd’hui devient ce jour-là.",
      checks: [
        { label: "verbe introducteur", terms: ["le témoin a expliqué que", "le temoin a explique que", "le témoin a expliqué qu"] },
        { label: "imparfait de pouvoir", terms: ["ne pouvait pas confirmer"] },
        { label: "repère temporel transformé", terms: ["ce jour-là", "ce jour la"] }
      ],
      minWords: 10,
      maxSeconds: 34,
      improved: "Le témoin a expliqué qu’il ne pouvait pas confirmer cette rumeur ce jour-là."
    }
  ]
};
