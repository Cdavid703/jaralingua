window.JaraLinguaOralUnitConfig = {
  apiPath: "/api/french8/pronunciation-assessment",
  storageKey: "jaralingua:french1:oral-unit-8:v1",
  language: "fr",
  courseLabel: "Français · Niveau 1",
  unitLabel: "Unité 8",
  title: "Coach de conversation – Unité 8 : Alimentation et achats",
  interviewer: {
    name: "Camille",
    role: "Coach de conversation"
  },
  attemptQuestionCount: 4,
  maxRecordingSeconds: 30,
  localUrl: "http://127.0.0.1:8021/frances/Niveau%201/ateliers/pratique-orale-unite-8.html",
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
    unit: 8,
    title: "Alimentation et achats",
    grammar: [
      "je voudrais + nom",
      "articles partitifs : du, de la, de l’, des",
      "articles indéfinis : un, une, des",
      "négation de quantité : pas de / pas d’",
      "questions de prix : ça coûte combien, ça fait combien",
      "paiement : payer par carte ou en espèces"
    ],
    vocabulary: [
      "un café",
      "un croissant",
      "du pain",
      "du fromage",
      "de la salade",
      "de l’eau",
      "des fruits",
      "un jus d’orange",
      "une part de tarte",
      "une baguette",
      "ça coûte combien",
      "je peux payer par carte"
    ],
    communicativeGoals: [
      "dire ce que l’on prend au petit déjeuner",
      "commander poliment dans un café",
      "parler de boissons et d’aliments simples",
      "acheter des produits dans une épicerie",
      "utiliser du, de la et des en contexte",
      "utiliser pas de après une négation",
      "demander le prix",
      "faire une mini-commande complète"
    ]
  },
  questions: [
    {
      id: "fr1u8q1",
      unit: 8,
      topic: "Petit déjeuner",
      text: "Qu’est-ce que tu prends au petit déjeuner ?",
      audio: "../audio/pratique-orale/unite-8/question-01.mp3?v=20260712-u8",
      frames: [
        "Au petit déjeuner, je prends ______.",
        "Je prends du ______, de la ______ et des ______."
      ],
      vocabulary: ["au petit déjeuner", "je prends", "du café", "du pain", "de l’eau", "de la confiture", "des fruits", "un croissant", "un jus d’orange"],
      grammar: "Pour une quantité non précisée, utilise du, de la, de l’ ou des : du pain, de l’eau, des fruits.",
      checks: [
        { label: "contexte du petit déjeuner", terms: ["petit dejeuner", "matin", "je prends"] },
        { label: "aliment ou boisson", terms: ["cafe", "pain", "eau", "fruits", "croissant", "jus", "the", "lait"] }
      ],
      minWords: 7,
      maxSeconds: 24,
      improved: "Au petit déjeuner, je prends du café, du pain et des fruits."
    },
    {
      id: "fr1u8q2",
      unit: 8,
      topic: "Commander au café",
      text: "Qu’est-ce que tu voudrais commander dans un café ?",
      audio: "../audio/pratique-orale/unite-8/question-02.mp3?v=20260712-u8",
      frames: [
        "Je voudrais ______, s’il vous plaît.",
        "Dans un café, je voudrais un ______ et une ______."
      ],
      vocabulary: ["je voudrais", "s’il vous plaît", "un café", "un thé", "un croissant", "une salade", "une part de tarte", "un jus d’orange"],
      grammar: "Je voudrais est une formule polie pour commander. Ajoute s’il vous plaît à la fin.",
      checks: [
        { label: "formule polie", terms: ["je voudrais", "s il vous plait", "s'il vous plait", "s'il vous plaît"] },
        { label: "produit commandé", terms: ["cafe", "the", "croissant", "salade", "tarte", "jus", "eau"] }
      ],
      minWords: 6,
      maxSeconds: 24,
      improved: "Je voudrais un café et un croissant, s’il vous plaît."
    },
    {
      id: "fr1u8q3",
      unit: 8,
      topic: "Boissons",
      text: "Tu bois de l’eau, du café ou du thé ?",
      audio: "../audio/pratique-orale/unite-8/question-03.mp3?v=20260712-u8",
      frames: [
        "Je bois ______.",
        "Je bois de l’eau, mais je ne bois pas de ______."
      ],
      vocabulary: ["je bois", "de l’eau", "du café", "du thé", "du jus", "du lait", "je ne bois pas de", "mais"],
      grammar: "Devant une voyelle, on dit de l’eau. Au négatif, on dit pas de café, pas de thé.",
      checks: [
        { label: "verbe boire", terms: ["je bois", "bois"] },
        { label: "boisson", terms: ["eau", "cafe", "the", "jus", "lait"] }
      ],
      minWords: 5,
      maxSeconds: 22,
      improved: "Je bois de l’eau et du café, mais je ne bois pas de thé."
    },
    {
      id: "fr1u8q4",
      unit: 8,
      topic: "Épicerie",
      text: "Qu’est-ce que tu achètes dans une épicerie ?",
      audio: "../audio/pratique-orale/unite-8/question-04.mp3?v=20260712-u8",
      frames: [
        "Dans une épicerie, j’achète ______.",
        "J’achète du ______, de la ______ et des ______."
      ],
      vocabulary: ["dans une épicerie", "j’achète", "du pain", "du fromage", "de la salade", "de l’eau", "des fruits", "des légumes", "une baguette"],
      grammar: "Pour acheter plusieurs produits, combine les articles : du pain, de la salade, des fruits.",
      checks: [
        { label: "achat", terms: ["j achete", "j'achete", "acheter", "epicerie"] },
        { label: "produit alimentaire", terms: ["pain", "fromage", "salade", "eau", "fruits", "legumes", "baguette", "pommes"] }
      ],
      minWords: 7,
      maxSeconds: 24,
      improved: "Dans une épicerie, j’achète du pain, de la salade et des fruits."
    },
    {
      id: "fr1u8q5",
      unit: 8,
      topic: "Articles partitifs",
      text: "Dis une phrase avec du, une phrase avec de la et une phrase avec des.",
      audio: "../audio/pratique-orale/unite-8/question-05.mp3?v=20260712-u8",
      frames: [
        "Je prends du ______. Je mange de la ______. J’achète des ______.",
        "Il y a du ______, de la ______ et des ______."
      ],
      vocabulary: ["du pain", "du café", "du fromage", "de la salade", "de la soupe", "de la tarte", "des fruits", "des légumes", "des croissants"],
      grammar: "Du = masculin singulier, de la = féminin singulier, des = pluriel.",
      checks: [
        { label: "du", terms: ["du"] },
        { label: "de la", terms: ["de la"] },
        { label: "des", terms: ["des"] }
      ],
      minWords: 10,
      maxSeconds: 30,
      improved: "Je prends du pain. Je mange de la salade. J’achète des fruits."
    },
    {
      id: "fr1u8q6",
      unit: 8,
      topic: "Négation de quantité",
      text: "Qu’est-ce que tu ne prends pas ou tu n’achètes pas ?",
      audio: "../audio/pratique-orale/unite-8/question-06.mp3?v=20260712-u8",
      frames: [
        "Je ne prends pas de ______.",
        "Je n’achète pas de ______, mais j’achète ______."
      ],
      vocabulary: ["je ne prends pas de", "je n’achète pas de", "pas d’eau", "pas de café", "pas de fromage", "pas de viande", "mais", "j’achète"],
      grammar: "Après pas, les articles partitifs deviennent de ou d’ : pas de café, pas d’eau.",
      checks: [
        { label: "négation", terms: ["je ne", "je n", "pas de", "pas d"] },
        { label: "aliment ou boisson", terms: ["cafe", "the", "eau", "fromage", "viande", "salade", "pain", "fruits"] }
      ],
      minWords: 7,
      maxSeconds: 24,
      improved: "Je ne prends pas de café et je n’achète pas de fromage."
    },
    {
      id: "fr1u8q7",
      unit: 8,
      topic: "Prix",
      text: "Pose une question pour demander le prix.",
      audio: "../audio/pratique-orale/unite-8/question-07.mp3?v=20260712-u8",
      frames: [
        "Ça coûte combien ?",
        "Ça fait combien, s’il vous plaît ?"
      ],
      vocabulary: ["ça coûte combien", "ça fait combien", "c’est combien", "le prix", "s’il vous plaît", "l’addition"],
      grammar: "Pour demander un prix, utilise ça coûte combien ou ça fait combien.",
      checks: [
        { label: "question de prix", terms: ["combien", "prix", "ca coute", "ça coûte", "ca fait", "ça fait", "c est combien", "c'est combien"] },
        { label: "forme de question", terms: ["?", "combien", "s il vous plait", "s'il vous plaît"] }
      ],
      minWords: 3,
      maxSeconds: 18,
      improved: "Ça coûte combien, s’il vous plaît ? / Ça fait combien ?"
    },
    {
      id: "fr1u8q8",
      unit: 8,
      topic: "Mini-commande",
      text: "Fais une mini-commande au café en trois phrases.",
      audio: "../audio/pratique-orale/unite-8/question-08.mp3?v=20260712-u8",
      frames: [
        "Bonjour. Je voudrais ______, s’il vous plaît. Ça coûte combien ?",
        "Bonjour madame. Pour moi, ______. Je peux payer par carte ?"
      ],
      vocabulary: ["bonjour", "je voudrais", "pour moi", "un café", "un croissant", "une part de tarte", "s’il vous plaît", "ça coûte combien", "payer par carte", "merci"],
      grammar: "Une commande complète peut avoir trois étapes : saluer, commander, demander le prix ou le paiement.",
      checks: [
        { label: "salutation", terms: ["bonjour", "bonsoir"] },
        { label: "commande polie", terms: ["je voudrais", "pour moi", "s il vous plait", "s'il vous plaît"] },
        { label: "prix ou paiement", terms: ["combien", "payer", "carte", "ca coute", "ça coûte", "ca fait", "ça fait"] }
      ],
      minWords: 12,
      maxSeconds: 30,
      improved: "Bonjour. Je voudrais un café et un croissant, s’il vous plaît. Ça coûte combien ?"
    }
  ]
};
