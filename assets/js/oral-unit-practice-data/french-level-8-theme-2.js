window.JaraLinguaOralUnitConfig = {
  apiPath: "/api/french8/pronunciation-assessment",
  storageKey: "jaralingua:french8:theme-02:conversation-coach:v1",
  language: "fr",
  courseLabel: "Français · Niveau 8",
  unitLabel: "Thème 02",
  title: "Coach de conversation – Thème 02 : hypothèses irréelles dans le passé",
  interviewer: {
    name: "Camille",
    role: "Coach de conversation"
  },
  attemptQuestionCount: 4,
  maxRecordingSeconds: 42,
  localUrl: "http://127.0.0.1:8021/frances/Niveau%208/ateliers/coach-conversation-02-hypotheses-irreelles-passe.html",
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
    recordHelp: "Touchez le microphone et répondez avec une hypothèse complète.",
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
    questionReadyStatus: "Écoutez la situation, puis répondez avec si + plus-que-parfait et conditionnel passé.",
    scoreMessages: {
      high: "Très bien : la condition passée et la conséquence imaginaire sont claires.",
      mid: "Bon travail : répétez en gardant la structure complète et une conséquence précise.",
      low: "À reprendre : commencez par « si » et ajoutez une conséquence au conditionnel passé."
    }
  },
  unitContext: {
    course: "Français Niveau 8",
    unit: 2,
    title: "Hypothèses irréelles dans le passé",
    grammar: [
      "si + plus-que-parfait",
      "conditionnel passé",
      "j’aurais + participe passé",
      "je serais + participe passé",
      "conséquence imaginaire"
    ],
    vocabulary: [
      "rater",
      "oublier",
      "étudier",
      "entretien",
      "parler à quelqu’un",
      "perdre ses clés",
      "à l’heure",
      "faire une meilleure impression",
      "si j’avais su"
    ],
    communicativeGoals: [
      "formuler une hypothèse irréelle passée",
      "lier une condition et une conséquence",
      "choisir avoir ou être au conditionnel passé",
      "répondre à une situation directe sans développer une opinion trop large"
    ]
  },
  questions: [
    {
      id: "fr8t2q1",
      unit: 2,
      topic: "Bus raté",
      text: "Vous avez raté le bus ce matin. Qu’est-ce qui se serait passé si vous ne l’aviez pas raté ?",
      audio: "../audio/pratique-orale/theme-02/question-01.mp3?v=20260713-fr8-t2",
      visual: {
        src: "../img/pratique-orale/theme-02-coach-conversation.webp?v=20260713-fr8-t2",
        alt: "Apprenants adultes construisant des hypothèses passées en conversation",
        caption: "Répondez avec une conséquence claire."
      },
      frames: [
        "Si je n’avais pas raté le bus, je serais arrivé à l’heure.",
        "Si je ne l’avais pas raté, je serais arrivé plus tôt en classe."
      ],
      vocabulary: ["rater le bus", "ce matin", "arriver à l’heure", "arriver plus tôt", "en classe"],
      grammar: "Structure attendue : si + plus-que-parfait, conditionnel passé.",
      checks: [
        { label: "condition avec si", terms: ["si je n'avais pas raté", "si je ne l'avais pas raté", "si je n avais pas rate", "si je ne l avais pas rate"] },
        { label: "conditionnel passé avec être", terms: ["je serais arrivé", "je serais arrive", "serais arrivé", "serais arrive"] },
        { label: "conséquence logique", terms: ["à l'heure", "a l'heure", "plus tôt", "plus tot", "en classe"] }
      ],
      minWords: 9,
      maxSeconds: 32,
      improved: "Si je n’avais pas raté le bus, je serais arrivé à l’heure."
    },
    {
      id: "fr8t2q2",
      unit: 2,
      topic: "Téléphone oublié",
      text: "Vous avez oublié votre téléphone à la maison. Qu’auriez-vous fait si vous l’aviez eu avec vous ?",
      audio: "../audio/pratique-orale/theme-02/question-02.mp3?v=20260713-fr8-t2",
      visual: {
        src: "../img/pratique-orale/theme-02-coach-conversation.webp?v=20260713-fr8-t2",
        alt: "Apprenants adultes construisant des hypothèses passées en conversation",
        caption: "La réponse doit dire ce que vous auriez fait."
      },
      frames: [
        "Si je l’avais eu avec moi, j’aurais appelé mon ami.",
        "Si j’avais eu mon téléphone avec moi, j’aurais envoyé un message."
      ],
      vocabulary: ["téléphone", "à la maison", "avec moi", "appeler", "envoyer un message", "mon ami"],
      grammar: "Le pronom « l’ » peut remplacer « mon téléphone » : si je l’avais eu.",
      checks: [
        { label: "condition au plus-que-parfait", terms: ["si je l'avais eu", "si j'avais eu mon téléphone", "si j avais eu mon telephone", "si je l avais eu"] },
        { label: "conditionnel passé avec avoir", terms: ["j'aurais appelé", "j'aurais appele", "j'aurais envoyé", "j'aurais envoye"] },
        { label: "action concrète", terms: ["appelé", "appele", "message", "ami", "téléphone", "telephone"] }
      ],
      minWords: 9,
      maxSeconds: 32,
      improved: "Si j’avais eu mon téléphone avec moi, j’aurais appelé mon ami."
    },
    {
      id: "fr8t2q3",
      unit: 2,
      topic: "Examen",
      text: "Vous n’avez pas étudié pour l’examen. Quel résultat auriez-vous obtenu si vous aviez étudié ?",
      audio: "../audio/pratique-orale/theme-02/question-03.mp3?v=20260713-fr8-t2",
      visual: {
        src: "../img/pratique-orale/theme-02-coach-conversation.webp?v=20260713-fr8-t2",
        alt: "Apprenants adultes construisant des hypothèses passées en conversation",
        caption: "La conséquence doit rester scolaire et précise."
      },
      frames: [
        "Si j’avais étudié, j’aurais obtenu une meilleure note.",
        "Si j’avais révisé, j’aurais mieux réussi l’examen."
      ],
      vocabulary: ["étudier", "réviser", "examen", "meilleure note", "réussir", "résultat"],
      grammar: "Après « si », utilisez le plus-que-parfait : si j’avais étudié.",
      checks: [
        { label: "condition au plus-que-parfait", terms: ["si j'avais étudié", "si j avais etudie", "si j'avais révisé", "si j avais revise"] },
        { label: "conséquence au conditionnel passé", terms: ["j'aurais obtenu", "j'aurais mieux réussi", "j aurais obtenu", "j aurais mieux reussi"] },
        { label: "résultat scolaire", terms: ["note", "examen", "réussi", "reussi", "résultat", "resultat"] }
      ],
      minWords: 8,
      maxSeconds: 30,
      improved: "Si j’avais étudié, j’aurais obtenu une meilleure note."
    },
    {
      id: "fr8t2q4",
      unit: 2,
      topic: "Entretien",
      text: "Vous êtes arrivé en retard à un entretien. Qu’est-ce qui aurait changé si vous étiez arrivé à l’heure ?",
      audio: "../audio/pratique-orale/theme-02/question-04.mp3?v=20260713-fr8-t2",
      visual: {
        src: "../img/pratique-orale/theme-02-coach-conversation.webp?v=20260713-fr8-t2",
        alt: "Apprenants adultes construisant des hypothèses passées en conversation",
        caption: "La conséquence doit parler de l’entretien."
      },
      frames: [
        "Si j’étais arrivé à l’heure, j’aurais fait une meilleure impression.",
        "Si j’étais arrivé à l’heure, l’entretien se serait mieux passé."
      ],
      vocabulary: ["entretien", "en retard", "à l’heure", "meilleure impression", "se passer mieux"],
      grammar: "Avec « arriver », le plus-que-parfait utilise être : si j’étais arrivé.",
      checks: [
        { label: "condition avec être", terms: ["si j'étais arrivé", "si j etais arrive", "si j'étais arrivée", "si j etais arrivee"] },
        { label: "conséquence au conditionnel passé", terms: ["j'aurais fait", "l'entretien se serait", "j aurais fait", "se serait mieux passé", "se serait mieux passe"] },
        { label: "entretien ou impression", terms: ["entretien", "impression", "à l'heure", "a l'heure"] }
      ],
      minWords: 9,
      maxSeconds: 34,
      improved: "Si j’étais arrivé à l’heure, j’aurais fait une meilleure impression."
    },
    {
      id: "fr8t2q5",
      unit: 2,
      topic: "Conversation manquée",
      text: "Vous n’avez pas parlé à cette personne. Qu’est-ce qui aurait pu arriver si vous lui aviez parlé ?",
      audio: "../audio/pratique-orale/theme-02/question-05.mp3?v=20260713-fr8-t2",
      visual: {
        src: "../img/pratique-orale/theme-02-coach-conversation.webp?v=20260713-fr8-t2",
        alt: "Apprenants adultes construisant des hypothèses passées en conversation",
        caption: "La conséquence doit montrer ce qui aurait changé."
      },
      frames: [
        "Si je lui avais parlé, j’aurais mieux compris la situation.",
        "Si je lui avais parlé, nous aurions évité le malentendu."
      ],
      vocabulary: ["parler à quelqu’un", "lui parler", "comprendre", "situation", "éviter", "malentendu"],
      grammar: "« Lui » est COI : si je lui avais parlé. Le participe « parlé » ne s’accorde pas avec « lui ».",
      checks: [
        { label: "condition avec lui", terms: ["si je lui avais parlé", "si je lui avais parle"] },
        { label: "conséquence au conditionnel passé", terms: ["j'aurais compris", "j'aurais mieux compris", "nous aurions évité", "nous aurions evite"] },
        { label: "sens logique", terms: ["situation", "malentendu", "compris", "évité", "evite"] }
      ],
      minWords: 9,
      maxSeconds: 32,
      improved: "Si je lui avais parlé, j’aurais mieux compris la situation."
    },
    {
      id: "fr8t2q6",
      unit: 2,
      topic: "Clés perdues",
      text: "Vous avez perdu vos clés. Qu’est-ce que vous auriez évité si vous ne les aviez pas perdues ?",
      audio: "../audio/pratique-orale/theme-02/question-06.mp3?v=20260713-fr8-t2",
      visual: {
        src: "../img/pratique-orale/theme-02-coach-conversation.webp?v=20260713-fr8-t2",
        alt: "Apprenants adultes construisant des hypothèses passées en conversation",
        caption: "La réponse doit reprendre le pronom « les »."
      },
      frames: [
        "Si je ne les avais pas perdues, je serais rentré plus vite chez moi.",
        "Si je n’avais pas perdu mes clés, j’aurais évité beaucoup de stress."
      ],
      vocabulary: ["clés", "les perdre", "rentrer", "plus vite", "chez moi", "éviter", "stress"],
      grammar: "Dans « si je ne les avais pas perdues », « les » remplace « mes clés » : accord féminin pluriel.",
      checks: [
        { label: "condition avec pronom COD", terms: ["si je ne les avais pas perdues", "si je n'avais pas perdu mes clés", "si je n avais pas perdu mes cles"] },
        { label: "conséquence au conditionnel passé", terms: ["je serais rentré", "je serais rentre", "j'aurais évité", "j aurais evite"] },
        { label: "conséquence concrète", terms: ["plus vite", "chez moi", "stress", "évité", "evite"] }
      ],
      minWords: 9,
      maxSeconds: 34,
      improved: "Si je ne les avais pas perdues, je serais rentré plus vite chez moi."
    }
  ]
};
