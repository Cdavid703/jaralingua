window.JaraLinguaOralUnitConfig = {
  apiPath: "/api/french8/pronunciation-assessment",
  storageKey: "jaralingua:french8:theme-06:conversation-coach:v1",
  language: "fr",
  courseLabel: "Français · Niveau 8",
  unitLabel: "Thème 06",
  title: "Coach de conversation – Thème 06 : IA et éthique numérique",
  interviewer: {
    name: "Camille",
    role: "Coach de conversation"
  },
  attemptQuestionCount: 4,
  maxRecordingSeconds: 42,
  localUrl: "http://127.0.0.1:8021/frances/Niveau%208/ateliers/coach-conversation-06-ia-ethique.html",
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
    questionReadyStatus: "Écoutez la situation, puis reliez cause, conséquence ou but.",
    scoreMessages: {
      high: "Très bien : le connecteur et la garantie éthique sont clairs.",
      mid: "Bon travail : répétez en gardant la relation logique et le mode verbal.",
      low: "À reprendre : utilisez le connecteur demandé, puis nommez une garantie concrète."
    }
  },
  unitContext: {
    course: "Français Niveau 8",
    unit: 6,
    title: "Intelligence artificielle et éthique numérique",
    grammar: [
      "étant donné que + indicatif",
      "puisque + indicatif",
      "par conséquent",
      "de sorte que + indicatif",
      "pour que / afin que + subjonctif",
      "afin de / dans le but de + infinitif"
    ],
    vocabulary: [
      "données sensibles",
      "confidentialité",
      "biais algorithmique",
      "audit indépendant",
      "consentement éclairé",
      "surveillance excessive",
      "maintenir l’humain dans la boucle",
      "jouer avec le feu"
    ],
    communicativeGoals: [
      "expliquer une cause technologique",
      "prévoir une conséquence éthique",
      "formuler une finalité acceptable",
      "proposer une garantie concrète"
    ]
  },
  questions: [
    {
      id: "fr8t6q1",
      unit: 6,
      topic: "Assistant IA universitaire",
      text: "Le service d’orientation reçoit trop de demandes. Commencez par : Étant donné que.",
      audio: "../audio/pratique-orale/theme-06/question-01.mp3?v=20260713-fr8-t6",
      visual: {
        src: "../img/pratique-orale/theme-06-coach-conversation.webp?v=20260713-fr8-t6",
        alt: "Comité adulte discutant de l'intelligence artificielle responsable",
        caption: "La cause explique pourquoi l’institution envisage l’outil."
      },
      frames: [
        "Étant donné que le service d’orientation reçoit trop de demandes, l’université peut tester un assistant IA.",
        "Étant donné que les demandes augmentent, l’université envisage un assistant IA."
      ],
      vocabulary: ["service d’orientation", "demandes", "université", "assistant IA", "tester", "envisager"],
      grammar: "Étant donné que introduit une cause objective et prend l’indicatif.",
      checks: [
        { label: "cause avec étant donné que", terms: ["étant donné que", "etant donne que"] },
        { label: "cause institutionnelle", terms: ["demandes", "service d'orientation", "orientation"] },
        { label: "outil IA", terms: ["assistant", "ia", "université", "universite"] }
      ],
      minWords: 10,
      maxSeconds: 34,
      improved: "Étant donné que le service d’orientation reçoit trop de demandes, l’université peut tester un assistant IA."
    },
    {
      id: "fr8t6q2",
      unit: 6,
      topic: "Consultation oubliée",
      text: "La direction n’a pas consulté les employés avant d’installer l’outil. Commencez par : Puisque.",
      audio: "../audio/pratique-orale/theme-06/question-02.mp3?v=20260713-fr8-t6",
      visual: {
        src: "../img/pratique-orale/theme-06-coach-conversation.webp?v=20260713-fr8-t6",
        alt: "Comité adulte discutant de l'intelligence artificielle responsable",
        caption: "Puisque justifie une réaction à partir d’un fait connu."
      },
      frames: [
        "Puisque la direction n’a pas consulté les employés, le projet risque de créer de la méfiance.",
        "Puisque les employés n’ont pas été consultés, il faut rouvrir le dialogue."
      ],
      vocabulary: ["direction", "employés", "consulter", "outil", "méfiance", "dialogue"],
      grammar: "Puisque présente une cause déjà connue ou admise dans la discussion.",
      checks: [
        { label: "justification avec puisque", terms: ["puisque"] },
        { label: "consultation", terms: ["consulté", "consulte", "employés", "employes"] },
        { label: "conséquence sociale", terms: ["méfiance", "mefiance", "dialogue", "risque"] }
      ],
      minWords: 10,
      maxSeconds: 34,
      improved: "Puisque la direction n’a pas consulté les employés, le projet risque de créer de la méfiance."
    },
    {
      id: "fr8t6q3",
      unit: 6,
      topic: "Données sensibles",
      text: "L’outil analyse des données sensibles. Commencez par : Par conséquent.",
      audio: "../audio/pratique-orale/theme-06/question-03.mp3?v=20260713-fr8-t6",
      visual: {
        src: "../img/pratique-orale/theme-06-coach-conversation.webp?v=20260713-fr8-t6",
        alt: "Comité adulte discutant de l'intelligence artificielle responsable",
        caption: "Par conséquent introduit une conséquence logique."
      },
      frames: [
        "Par conséquent, la confidentialité doit être contrôlée par un audit indépendant.",
        "Par conséquent, il faut protéger les données avec un contrôle indépendant."
      ],
      vocabulary: ["données sensibles", "confidentialité", "audit indépendant", "contrôle", "protéger"],
      grammar: "Par conséquent se place souvent au début d’une phrase de conséquence.",
      checks: [
        { label: "conséquence avec par conséquent", terms: ["par conséquent", "par consequent"] },
        { label: "protection des données", terms: ["confidentialité", "confidentialite", "données", "donnees", "protéger", "proteger"] },
        { label: "garantie", terms: ["audit", "contrôle", "controle", "indépendant", "independant"] }
      ],
      minWords: 8,
      maxSeconds: 32,
      improved: "Par conséquent, la confidentialité doit être contrôlée par un audit indépendant."
    },
    {
      id: "fr8t6q4",
      unit: 6,
      topic: "Biais algorithmique",
      text: "Le modèle peut reproduire des biais. Commencez par : Le système peut produire des biais, de sorte que.",
      audio: "../audio/pratique-orale/theme-06/question-04.mp3?v=20260713-fr8-t6",
      visual: {
        src: "../img/pratique-orale/theme-06-coach-conversation.webp?v=20260713-fr8-t6",
        alt: "Comité adulte discutant de l'intelligence artificielle responsable",
        caption: "De sorte que relie un risque à une mesure nécessaire."
      },
      frames: [
        "Le système peut produire des biais, de sorte que les décisions doivent être vérifiées par un humain.",
        "Le système peut produire des biais, de sorte qu’un humain doit vérifier les décisions."
      ],
      vocabulary: ["système", "biais", "décisions", "vérifier", "humain", "contrôle"],
      grammar: "De sorte que introduit ici une conséquence réelle avec l’indicatif.",
      checks: [
        { label: "conséquence avec de sorte que", terms: ["de sorte que", "de sorte qu"] },
        { label: "risque nommé", terms: ["biais", "système", "systeme"] },
        { label: "humain dans la boucle", terms: ["humain", "vérifiées", "verifiees", "vérifier", "verifier"] }
      ],
      minWords: 12,
      maxSeconds: 36,
      improved: "Le système peut produire des biais, de sorte que les décisions doivent être vérifiées par un humain."
    },
    {
      id: "fr8t6q5",
      unit: 6,
      topic: "Finalité acceptable",
      text: "Il faut encadrer l’IA pour protéger les citoyens. Commencez par : Il faut une charte pour que.",
      audio: "../audio/pratique-orale/theme-06/question-05.mp3?v=20260713-fr8-t6",
      visual: {
        src: "../img/pratique-orale/theme-06-coach-conversation.webp?v=20260713-fr8-t6",
        alt: "Comité adulte discutant de l'intelligence artificielle responsable",
        caption: "Pour que demande le subjonctif quand le sujet change."
      },
      frames: [
        "Il faut une charte pour que les citoyens soient protégés.",
        "Il faut une charte pour que l’humain reste responsable."
      ],
      vocabulary: ["charte", "citoyens", "protéger", "humain", "responsable", "encadrer"],
      grammar: "Pour que + sujet différent demande le subjonctif : soient protégés, reste responsable.",
      checks: [
        { label: "but avec pour que", terms: ["il faut une charte pour que"] },
        { label: "subjonctif attendu", terms: ["soient protégés", "soient proteges", "reste responsable"] },
        { label: "garantie éthique", terms: ["citoyens", "humain", "responsable", "charte"] }
      ],
      minWords: 8,
      maxSeconds: 32,
      improved: "Il faut une charte pour que les citoyens soient protégés."
    },
    {
      id: "fr8t6q6",
      unit: 6,
      topic: "Formation des équipes",
      text: "L’entreprise veut réduire les erreurs d’usage. Commencez par : L’entreprise forme ses équipes afin de.",
      audio: "../audio/pratique-orale/theme-06/question-06.mp3?v=20260713-fr8-t6",
      visual: {
        src: "../img/pratique-orale/theme-06-coach-conversation.webp?v=20260713-fr8-t6",
        alt: "Comité adulte discutant de l'intelligence artificielle responsable",
        caption: "Afin de + infinitif convient quand le sujet reste le même."
      },
      frames: [
        "L’entreprise forme ses équipes afin de réduire les erreurs d’usage.",
        "L’entreprise forme ses équipes afin de limiter les risques liés à l’IA."
      ],
      vocabulary: ["entreprise", "former", "équipes", "réduire", "erreurs", "risques"],
      grammar: "Afin de + infinitif exprime le but quand le sujet reste le même.",
      checks: [
        { label: "but avec afin de", terms: ["l'entreprise forme ses équipes afin de", "l entreprise forme ses equipes afin de"] },
        { label: "infinitif attendu", terms: ["réduire", "reduire", "limiter"] },
        { label: "risque ou erreur", terms: ["erreurs", "risques", "usage"] }
      ],
      minWords: 8,
      maxSeconds: 32,
      improved: "L’entreprise forme ses équipes afin de réduire les erreurs d’usage."
    }
  ]
};
