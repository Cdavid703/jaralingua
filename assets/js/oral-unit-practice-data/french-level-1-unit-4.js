window.JaraLinguaOralUnitConfig = {
  apiPath: "/api/french8/pronunciation-assessment",
  storageKey: "jaralingua:french1:oral-unit-4:v1",
  language: "fr",
  courseLabel: "Français · Niveau 1",
  unitLabel: "Unité 4",
  title: "Coach de conversation – Unité 4 : Être, avoir, aller et faire",
  interviewer: {
    name: "Camille",
    role: "Coach de conversation"
  },
  attemptQuestionCount: 4,
  maxRecordingSeconds: 28,
  localUrl: "http://127.0.0.1:8021/frances/Niveau%201/ateliers/pratique-orale-unite-4.html",
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
    unit: 4,
    title: "Être, avoir, aller et faire",
    grammar: [
      "être au présent",
      "avoir au présent",
      "aller au présent",
      "faire au présent",
      "identité, âge, possession, déplacement et action",
      "questions personnelles simples"
    ],
    vocabulary: [
      "je suis",
      "j’ai",
      "je vais",
      "je fais",
      "étudiant / étudiante",
      "un cahier",
      "un stylo",
      "à la maison",
      "à l’université",
      "un exercice"
    ],
    communicativeGoals: [
      "dire comment on va",
      "dire son statut",
      "dire son âge",
      "nommer ce que l’on a",
      "dire où l’on va",
      "dire ce que l’on fait",
      "combiner deux verbes essentiels dans une réponse"
    ]
  },
  questions: [
    {
      id: "fr1u4q1",
      unit: 4,
      topic: "Aller",
      text: "Comment ça va aujourd’hui ?",
      audio: "../audio/pratique-orale/unite-4/question-01.mp3?v=20260712-u4",
      frames: [
        "Aujourd’hui, je vais ______.",
        "Je vais ______, mais je suis un peu ______."
      ],
      vocabulary: ["ça va", "je vais bien", "très bien", "comme ci comme ça", "je suis fatigué", "je suis contente", "aujourd’hui"],
      grammar: "Pour parler de ton état général, utilise aller : je vais bien. Tu peux ajouter être : je suis fatigué / fatiguée.",
      checks: [
        { label: "réponse avec aller", terms: ["je vais", "ca va", "ça va", "bien", "comme ci"] },
        { label: "état ou précision", terms: ["aujourd hui", "fatigue", "contente", "content", "tres bien", "un peu"] }
      ],
      minWords: 5,
      maxSeconds: 20,
      improved: "Aujourd’hui, je vais bien, mais je suis un peu fatigué / fatiguée."
    },
    {
      id: "fr1u4q2",
      unit: 4,
      topic: "Être",
      text: "Tu es étudiant ou étudiante ?",
      audio: "../audio/pratique-orale/unite-4/question-02.mp3?v=20260712-u4",
      frames: [
        "Oui, je suis étudiant / étudiante.",
        "Je suis étudiant / étudiante à ______."
      ],
      vocabulary: ["je suis", "étudiant", "étudiante", "à l’université", "dans ce cours", "en français", "oui", "non"],
      grammar: "Le verbe être sert à présenter une identité ou un statut : je suis étudiant, je suis étudiante.",
      checks: [
        { label: "verbe être", terms: ["je suis", "suis"] },
        { label: "statut ou lieu", terms: ["etudiant", "etudiante", "universite", "cours", "francais"] }
      ],
      minWords: 4,
      maxSeconds: 18,
      improved: "Oui, je suis étudiant / étudiante dans ce cours de français."
    },
    {
      id: "fr1u4q3",
      unit: 4,
      topic: "Avoir",
      text: "Quel âge as-tu ?",
      audio: "../audio/pratique-orale/unite-4/question-03.mp3?v=20260712-u4",
      frames: [
        "J’ai ______ ans.",
        "Moi, j’ai ______ ans."
      ],
      vocabulary: ["j’ai", "ans", "dix-huit", "dix-neuf", "vingt", "vingt et un", "vingt-deux"],
      grammar: "En français, on utilise avoir pour l’âge : j’ai vingt ans. On ne dit pas je suis vingt ans.",
      checks: [
        { label: "âge avec avoir", terms: ["j ai", "j'ai", "ans"] },
        { label: "un nombre", terms: ["dix", "onze", "douze", "treize", "quatorze", "quinze", "seize", "vingt", "trente"] }
      ],
      minWords: 3,
      maxSeconds: 16,
      improved: "J’ai [nombre] ans."
    },
    {
      id: "fr1u4q4",
      unit: 4,
      topic: "Avoir et objets",
      text: "Qu’est-ce que tu as dans ton sac ?",
      audio: "../audio/pratique-orale/unite-4/question-04.mp3?v=20260712-u4",
      frames: [
        "Dans mon sac, j’ai ______.",
        "J’ai un ______ et une ______ dans mon sac."
      ],
      vocabulary: ["dans mon sac", "j’ai", "un cahier", "un stylo", "un livre", "une trousse", "un téléphone", "une bouteille"],
      grammar: "Avoir sert aussi à dire ce que tu possèdes : j’ai un cahier, j’ai une trousse.",
      checks: [
        { label: "verbe avoir", terms: ["j ai", "j'ai"] },
        { label: "objet de classe ou personnel", terms: ["sac", "cahier", "stylo", "livre", "trousse", "telephone", "bouteille"] }
      ],
      minWords: 6,
      maxSeconds: 22,
      improved: "Dans mon sac, j’ai un cahier, un stylo et une bouteille."
    },
    {
      id: "fr1u4q5",
      unit: 4,
      topic: "Aller et lieu",
      text: "Où est-ce que tu vas après le cours ?",
      audio: "../audio/pratique-orale/unite-4/question-05.mp3?v=20260712-u4",
      frames: [
        "Après le cours, je vais à ______.",
        "Je vais à ______, puis je vais à ______."
      ],
      vocabulary: ["après le cours", "je vais à", "la maison", "l’université", "la bibliothèque", "le travail", "le café", "puis"],
      grammar: "Le verbe aller indique un déplacement : je vais à la maison, je vais à l’université.",
      checks: [
        { label: "verbe aller", terms: ["je vais", "vais"] },
        { label: "lieu", terms: ["maison", "universite", "bibliotheque", "travail", "cafe", "cours"] }
      ],
      minWords: 5,
      maxSeconds: 22,
      improved: "Après le cours, je vais à la maison, puis je vais à l’université."
    },
    {
      id: "fr1u4q6",
      unit: 4,
      topic: "Faire",
      text: "Qu’est-ce que tu fais en classe ?",
      audio: "../audio/pratique-orale/unite-4/question-06.mp3?v=20260712-u4",
      frames: [
        "En classe, je fais ______.",
        "Je fais un exercice et je ______."
      ],
      vocabulary: ["je fais", "un exercice", "une activité", "une phrase", "je parle", "j’écoute", "je répète", "en classe"],
      grammar: "Faire sert à parler d’une action générale : je fais un exercice, nous faisons une activité.",
      checks: [
        { label: "verbe faire", terms: ["je fais", "fais"] },
        { label: "activité de classe", terms: ["exercice", "activite", "phrase", "classe", "parle", "ecoute", "repete"] }
      ],
      minWords: 6,
      maxSeconds: 22,
      improved: "En classe, je fais un exercice et je répète les phrases."
    },
    {
      id: "fr1u4q7",
      unit: 4,
      topic: "Être et avoir",
      text: "Dis deux phrases avec être et avoir.",
      audio: "../audio/pratique-orale/unite-4/question-07.mp3?v=20260712-u4",
      frames: [
        "Je suis ______. J’ai ______.",
        "Je suis en classe et j’ai ______."
      ],
      vocabulary: ["je suis", "j’ai", "étudiant", "étudiante", "en classe", "un cahier", "un stylo", "vingt ans"],
      grammar: "Utilise être pour l’identité ou l’état, et avoir pour l’âge ou les objets.",
      checks: [
        { label: "phrase avec être", terms: ["je suis"] },
        { label: "phrase avec avoir", terms: ["j ai", "j'ai"] }
      ],
      minWords: 7,
      maxSeconds: 24,
      improved: "Je suis étudiant / étudiante. J’ai un cahier et un stylo."
    },
    {
      id: "fr1u4q8",
      unit: 4,
      topic: "Aller et faire",
      text: "Présente ta journée avec aller et faire.",
      audio: "../audio/pratique-orale/unite-4/question-08.mp3?v=20260712-u4",
      frames: [
        "Aujourd’hui, je vais ______ et je fais ______.",
        "Je vais ______. En classe, je fais ______."
      ],
      vocabulary: ["aujourd’hui", "je vais", "je fais", "en classe", "à la maison", "à l’université", "un exercice", "une activité"],
      grammar: "Combine aller pour le déplacement et faire pour l’action : je vais en classe et je fais un exercice.",
      checks: [
        { label: "verbe aller", terms: ["je vais", "vais"] },
        { label: "verbe faire", terms: ["je fais", "fais"] }
      ],
      minWords: 9,
      maxSeconds: 28,
      improved: "Aujourd’hui, je vais en classe et je fais un exercice de français."
    }
  ]
};
