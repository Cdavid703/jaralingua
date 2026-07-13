window.JaraLinguaOralUnitConfig = {
  apiPath: "/api/french8/pronunciation-assessment",
  storageKey: "jaralingua:french8:theme-08:conversation-coach:v1",
  language: "fr",
  courseLabel: "Français · Niveau 8",
  unitLabel: "Thème 08",
  title: "Coach de conversation – Thème 08 : registres et français oral",
  interviewer: {
    name: "Camille",
    role: "Coach de conversation"
  },
  attemptQuestionCount: 4,
  maxRecordingSeconds: 42,
  localUrl: "http://127.0.0.1:8021/frances/Niveau%208/ateliers/coach-conversation-08-registres-francophonie.html",
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
    recordHelp: "Touchez le microphone et répondez avec la transformation demandée.",
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
    questionReadyStatus: "Écoutez la situation, puis adaptez le registre ou expliquez la variante.",
    scoreMessages: {
      high: "Très bien : le registre, le sens et le contexte sont clairs.",
      mid: "Bon travail : répétez en nommant mieux le registre ou la variante.",
      low: "À reprendre : répondez directement à la consigne et évitez le mot à mot."
    }
  },
  unitContext: {
    course: "Français Niveau 8",
    unit: 8,
    title: "Francophonie, registres et français oral authentique",
    grammar: [
      "registre soutenu, standard et familier",
      "réductions orales contrôlées",
      "verlan et expressions familières",
      "variantes francophones",
      "adaptation au contexte et à l’interlocuteur"
    ],
    vocabulary: [
      "registre soutenu",
      "registre standard",
      "registre familier",
      "j’sais pas",
      "c’est chaud",
      "c’est relou",
      "char",
      "on est ensemble"
    ],
    communicativeGoals: [
      "transformer un message selon le registre",
      "expliquer une expression orale sans traduire mot à mot",
      "reconnaître une variante francophone",
      "choisir une formulation adaptée au contexte"
    ]
  },
  questions: [
    {
      id: "fr8t8q1",
      unit: 8,
      topic: "Passer au registre standard",
      text: "Vous devez transformer cette phrase en registre standard : T’as deux minutes ? Je sais pas quoi faire.",
      audio: "../audio/pratique-orale/theme-08/question-01.mp3?v=20260713-fr8-t8",
      visual: {
        src: "../img/pratique-orale/theme-08-coach-conversation.webp?v=20260713-fr8-t8",
        alt: "Studio de langue avec adultes travaillant les registres du français",
        caption: "Le registre standard garde le sens mais retire les réductions familières."
      },
      frames: [
        "Est-ce que tu as deux minutes ? Je ne sais pas quoi faire.",
        "Tu as un moment ? Je ne sais pas quoi faire."
      ],
      vocabulary: ["registre standard", "tu as", "un moment", "je ne sais pas", "quoi faire"],
      grammar: "On remplace t’as par tu as et je sais pas par je ne sais pas.",
      checks: [
        { label: "demande standard", terms: ["est-ce que tu as", "tu as un moment", "tu as deux minutes"] },
        { label: "forme complete", terms: ["je ne sais pas"] },
        { label: "sens conserve", terms: ["quoi faire", "deux minutes", "moment"] }
      ],
      minWords: 8,
      maxSeconds: 32,
      improved: "Est-ce que tu as deux minutes ? Je ne sais pas quoi faire."
    },
    {
      id: "fr8t8q2",
      unit: 8,
      topic: "Expression familière",
      text: "Vous devez expliquer en français standard : c’est chaud.",
      audio: "../audio/pratique-orale/theme-08/question-02.mp3?v=20260713-fr8-t8",
      visual: {
        src: "../img/pratique-orale/theme-08-coach-conversation.webp?v=20260713-fr8-t8",
        alt: "Studio de langue avec adultes travaillant les registres du français",
        caption: "Une expression familière doit être expliquée par son sens en contexte."
      },
      frames: [
        "Cela signifie que la situation est difficile ou compliquée.",
        "En registre standard, on peut dire : c’est une situation compliquée."
      ],
      vocabulary: ["signifie", "situation", "difficile", "compliquée", "registre standard"],
      grammar: "C’est chaud ne parle pas de température dans ce contexte : il indique une difficulté.",
      checks: [
        { label: "explication du sens", terms: ["signifie", "veut dire", "on peut dire"] },
        { label: "difficulte", terms: ["difficile", "compliquée", "compliquee", "tendue"] },
        { label: "situation", terms: ["situation", "contexte"] }
      ],
      minWords: 8,
      maxSeconds: 32,
      improved: "Cela signifie que la situation est difficile ou compliquée."
    },
    {
      id: "fr8t8q3",
      unit: 8,
      topic: "Passer au registre soutenu",
      text: "Vous devez transformer cette phrase en registre soutenu : je veux vous parler de mon projet.",
      audio: "../audio/pratique-orale/theme-08/question-03.mp3?v=20260713-fr8-t8",
      visual: {
        src: "../img/pratique-orale/theme-08-coach-conversation.webp?v=20260713-fr8-t8",
        alt: "Studio de langue avec adultes travaillant les registres du français",
        caption: "Le registre soutenu ajoute politesse, précision et distance."
      },
      frames: [
        "Je souhaiterais vous présenter mon projet.",
        "Je souhaiterais obtenir un entretien afin de vous présenter mon projet."
      ],
      vocabulary: ["je souhaiterais", "présenter", "projet", "obtenir", "entretien", "afin de"],
      grammar: "Le conditionnel de politesse permet de rendre la demande plus soutenue.",
      checks: [
        { label: "politesse soutenue", terms: ["je souhaiterais"] },
        { label: "projet", terms: ["projet", "présenter", "presenter"] },
        { label: "formulation formelle", terms: ["entretien", "afin de", "vous présenter", "vous presenter"] }
      ],
      minWords: 7,
      maxSeconds: 32,
      improved: "Je souhaiterais obtenir un entretien afin de vous présenter mon projet."
    },
    {
      id: "fr8t8q4",
      unit: 8,
      topic: "Variante québécoise",
      text: "Expliquez cette variante québécoise : un char.",
      audio: "../audio/pratique-orale/theme-08/question-04.mp3?v=20260713-fr8-t8",
      visual: {
        src: "../img/pratique-orale/theme-08-coach-conversation.webp?v=20260713-fr8-t8",
        alt: "Studio de langue avec adultes travaillant les registres du français",
        caption: "Une variante francophone n’est pas une faute : elle appartient à un espace."
      },
      frames: [
        "Au Québec, un char signifie une voiture.",
        "Dans le français québécois, un char veut dire une voiture."
      ],
      vocabulary: ["Québec", "français québécois", "char", "voiture", "signifie", "veut dire"],
      grammar: "Pour expliquer une variante, nommez le lieu puis donnez l’équivalent standard.",
      checks: [
        { label: "espace francophone", terms: ["québec", "quebec", "québécois", "quebecois"] },
        { label: "mot explique", terms: ["char"] },
        { label: "equivalent", terms: ["voiture", "auto"] }
      ],
      minWords: 7,
      maxSeconds: 30,
      improved: "Au Québec, un char signifie une voiture."
    },
    {
      id: "fr8t8q5",
      unit: 8,
      topic: "Remplacer un mot familier",
      text: "Remplacez l’expression familière relou par une phrase standard.",
      audio: "../audio/pratique-orale/theme-08/question-05.mp3?v=20260713-fr8-t8",
      visual: {
        src: "../img/pratique-orale/theme-08-coach-conversation.webp?v=20260713-fr8-t8",
        alt: "Studio de langue avec adultes travaillant les registres du français",
        caption: "Le registre standard garde l’idée sans utiliser d’argot."
      },
      frames: [
        "C’est pénible.",
        "Cette situation est agaçante."
      ],
      vocabulary: ["pénible", "agaçante", "situation", "désagréable", "standard"],
      grammar: "Relou est familier; pénible, agaçant ou désagréable sont plus standards.",
      checks: [
        { label: "sens conserve", terms: ["pénible", "penible", "agaçante", "agacante", "désagréable", "desagreable"] },
        { label: "phrase standard", terms: ["c'est", "c est", "cette situation", "cela"] }
      ],
      minWords: 2,
      maxSeconds: 24,
      improved: "Cette situation est agaçante."
    },
    {
      id: "fr8t8q6",
      unit: 8,
      topic: "Expression francophone",
      text: "Expliquez l’expression sénégalaise : on est ensemble.",
      audio: "../audio/pratique-orale/theme-08/question-06.mp3?v=20260713-fr8-t8",
      visual: {
        src: "../img/pratique-orale/theme-08-coach-conversation.webp?v=20260713-fr8-t8",
        alt: "Studio de langue avec adultes travaillant les registres du français",
        caption: "Certaines expressions portent une valeur culturelle, pas seulement un sens lexical."
      },
      frames: [
        "Cette expression exprime la solidarité.",
        "Au Sénégal, on est ensemble peut montrer qu’on se soutient."
      ],
      vocabulary: ["Sénégal", "expression", "solidarité", "soutenir", "ensemble", "valeur culturelle"],
      grammar: "Expliquez l’expression par sa fonction sociale : solidarité, soutien, proximité.",
      checks: [
        { label: "expression citee", terms: ["on est ensemble"] },
        { label: "solidarite", terms: ["solidarité", "solidarite", "soutient", "soutenir", "soutien"] },
        { label: "contexte francophone", terms: ["sénégal", "senegal", "expression"] }
      ],
      minWords: 7,
      maxSeconds: 32,
      improved: "Au Sénégal, on est ensemble peut montrer qu’on se soutient."
    }
  ]
};
