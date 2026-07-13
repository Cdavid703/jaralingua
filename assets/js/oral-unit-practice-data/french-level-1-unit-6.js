window.JaraLinguaOralUnitConfig = {
  apiPath: "/api/french8/pronunciation-assessment",
  storageKey: "jaralingua:french1:oral-unit-6:v1",
  language: "fr",
  courseLabel: "Français · Niveau 1",
  unitLabel: "Unité 6",
  title: "Coach de conversation – Unité 6 : Description, professions et présent progressif",
  interviewer: {
    name: "Camille",
    role: "Coach de conversation"
  },
  attemptQuestionCount: 4,
  maxRecordingSeconds: 30,
  localUrl: "http://127.0.0.1:8021/frances/Niveau%201/ateliers/pratique-orale-unite-6.html",
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
    unit: 6,
    title: "Description, professions et présent progressif",
    grammar: [
      "accord des adjectifs au masculin et au féminin",
      "verbe être pour décrire une personne",
      "verbe avoir pour parler des cheveux et des yeux",
      "professions et lieux de travail",
      "être en train de + infinitif",
      "questions d’identification avec est-ce que"
    ],
    vocabulary: [
      "grand",
      "petite",
      "calme",
      "drôle",
      "sérieux",
      "curieuse",
      "professeur",
      "médecin",
      "serveur",
      "photographe",
      "il porte des lunettes",
      "elle est en train de travailler"
    ],
    communicativeGoals: [
      "décrire une personne physiquement",
      "décrire le caractère d’une personne",
      "nommer une profession",
      "associer une profession à une action simple",
      "dire ce qu’une personne est en train de faire",
      "poser une question pour identifier quelqu’un",
      "présenter une personne en plusieurs phrases"
    ]
  },
  questions: [
    {
      id: "fr1u6q1",
      unit: 6,
      topic: "Description physique",
      text: "Décris une personne de ta classe.",
      audio: "../audio/pratique-orale/unite-6/question-01.mp3?v=20260712-u6",
      frames: [
        "Dans ma classe, il y a ______. Il / elle est ______.",
        "Il / elle a les cheveux ______ et les yeux ______."
      ],
      vocabulary: ["dans ma classe", "il est", "elle est", "grand", "grande", "petit", "petite", "les cheveux courts", "les cheveux longs", "les yeux marron"],
      grammar: "Avec être, l’adjectif change souvent au féminin : grand devient grande, petit devient petite.",
      checks: [
        { label: "personne identifiée", terms: ["dans ma classe", "un camarade", "une camarade", "un ami", "une amie", "il", "elle"] },
        { label: "description physique", terms: ["grand", "grande", "petit", "petite", "cheveux", "yeux", "lunettes"] }
      ],
      minWords: 8,
      maxSeconds: 26,
      improved: "Dans ma classe, il y a Sofia. Elle est grande et elle a les cheveux longs."
    },
    {
      id: "fr1u6q2",
      unit: 6,
      topic: "Caractère",
      text: "Comment est ton ami ou ton amie ?",
      audio: "../audio/pratique-orale/unite-6/question-02.mp3?v=20260712-u6",
      frames: [
        "Mon ami est ______ et ______.",
        "Mon amie est ______, mais elle est aussi ______."
      ],
      vocabulary: ["mon ami", "mon amie", "sympathique", "drôle", "calme", "sérieux", "sérieuse", "curieux", "curieuse", "organisé", "organisée"],
      grammar: "Pour le caractère, utilise être + adjectif : elle est calme, il est sérieux, elle est sérieuse.",
      checks: [
        { label: "ami ou amie", terms: ["ami", "amie", "copain", "copine"] },
        { label: "adjectif de caractère", terms: ["sympathique", "drole", "calme", "serieux", "serieuse", "curieux", "curieuse", "organise", "organisee"] }
      ],
      minWords: 6,
      maxSeconds: 24,
      improved: "Mon amie est calme et curieuse. Elle est aussi très sympathique."
    },
    {
      id: "fr1u6q3",
      unit: 6,
      topic: "Profession",
      text: "Parle de la profession d’une personne de ta famille.",
      audio: "../audio/pratique-orale/unite-6/question-03.mp3?v=20260712-u6",
      frames: [
        "Mon / ma ______ est ______.",
        "Il / elle travaille dans ______."
      ],
      vocabulary: ["mon père", "ma mère", "mon frère", "ma sœur", "professeur", "médecin", "serveur", "serveuse", "étudiant", "étudiante", "dans une école", "dans un hôpital"],
      grammar: "En français, on peut dire il est professeur ou elle est médecin. Avec certains métiers, le féminin change : serveur devient serveuse.",
      checks: [
        { label: "personne de la famille", terms: ["mon", "ma", "pere", "mere", "frere", "soeur", "tante", "oncle"] },
        { label: "profession", terms: ["professeur", "medecin", "serveur", "serveuse", "etudiant", "etudiante", "photographe", "cuisinier", "cuisiniere"] }
      ],
      minWords: 7,
      maxSeconds: 26,
      improved: "Ma mère est médecin. Elle travaille dans un hôpital."
    },
    {
      id: "fr1u6q4",
      unit: 6,
      topic: "Activités professionnelles",
      text: "Que fait un professeur, un médecin ou un serveur ?",
      audio: "../audio/pratique-orale/unite-6/question-04.mp3?v=20260712-u6",
      frames: [
        "Un professeur ______.",
        "Un médecin ______. Un serveur ______."
      ],
      vocabulary: ["enseigne", "explique", "travaille", "aide les patients", "sert les clients", "prépare la table", "parle avec les personnes"],
      grammar: "Utilise un sujet + un verbe au présent : un professeur enseigne, un médecin aide, un serveur sert.",
      checks: [
        { label: "profession nommée", terms: ["professeur", "medecin", "serveur", "serveuse"] },
        { label: "action au présent", terms: ["enseigne", "explique", "aide", "travaille", "sert", "parle", "prepare"] }
      ],
      minWords: 7,
      maxSeconds: 26,
      improved: "Un professeur explique la leçon. Un médecin aide les patients."
    },
    {
      id: "fr1u6q5",
      unit: 6,
      topic: "Présent progressif",
      text: "Qu’est-ce que tu es en train de faire maintenant ?",
      audio: "../audio/pratique-orale/unite-6/question-05.mp3?v=20260712-u6",
      frames: [
        "Je suis en train de ______.",
        "Maintenant, je suis en train de ______ et je ______."
      ],
      vocabulary: ["je suis en train de", "étudier", "parler français", "écouter", "répondre", "écrire", "pratiquer", "maintenant"],
      grammar: "Être en train de + infinitif sert à dire qu’une action se passe maintenant : je suis en train d’étudier.",
      checks: [
        { label: "présent progressif", terms: ["je suis en train de", "je suis en train d"] },
        { label: "action maintenant", terms: ["etudier", "parler", "ecouter", "repondre", "ecrire", "pratiquer", "maintenant"] }
      ],
      minWords: 7,
      maxSeconds: 24,
      improved: "Je suis en train de pratiquer le français et je suis en train de répondre à une question."
    },
    {
      id: "fr1u6q6",
      unit: 6,
      topic: "Portrait simple",
      text: "Décris une personne célèbre en trois phrases.",
      audio: "../audio/pratique-orale/unite-6/question-06.mp3?v=20260712-u6",
      frames: [
        "Je décris ______. Il / elle est ______. Il / elle travaille comme ______.",
        "Il / elle est ______, ______ et très ______."
      ],
      vocabulary: ["je décris", "une personne célèbre", "il est", "elle est", "acteur", "actrice", "chanteur", "chanteuse", "sportif", "sportive", "créatif", "créative"],
      grammar: "Pour trois phrases, organise ton portrait : identité, description, profession ou activité.",
      checks: [
        { label: "portrait annoncé", terms: ["je decris", "il est", "elle est", "c est"] },
        { label: "description ou profession", minMatches: 2, terms: ["grand", "grande", "sympathique", "celebre", "acteur", "actrice", "chanteur", "chanteuse", "sportif", "sportive"] }
      ],
      minWords: 12,
      maxSeconds: 30,
      improved: "Je décris une chanteuse célèbre. Elle est créative et très énergique. Elle travaille avec beaucoup de musiciens."
    },
    {
      id: "fr1u6q7",
      unit: 6,
      topic: "Question d’identification",
      text: "Pose une question pour identifier une personne.",
      audio: "../audio/pratique-orale/unite-6/question-07.mp3?v=20260712-u6",
      frames: [
        "Est-ce qu’il / elle ______ ?",
        "Est-ce que cette personne est ______ ?"
      ],
      vocabulary: ["est-ce que", "il porte des lunettes", "elle porte des lunettes", "il est grand", "elle est petite", "il travaille", "elle travaille", "cette personne"],
      grammar: "Pour poser une question simple, commence par est-ce que : Est-ce qu’elle porte des lunettes ?",
      checks: [
        { label: "forme de question", terms: ["est ce que", "est ce qu", "qui est", "il porte", "elle porte"] },
        { label: "indice d’identification", terms: ["lunettes", "grand", "grande", "petit", "petite", "cheveux", "travaille", "profession"] }
      ],
      minWords: 5,
      maxSeconds: 20,
      improved: "Est-ce qu’elle porte des lunettes ? Est-ce que cette personne est professeur ?"
    },
    {
      id: "fr1u6q8",
      unit: 6,
      topic: "Présentation intégrée",
      text: "Présente une personne : son apparence, son caractère et son activité.",
      audio: "../audio/pratique-orale/unite-6/question-08.mp3?v=20260712-u6",
      frames: [
        "Je présente ______. Il / elle est ______. Il / elle est en train de ______.",
        "Il / elle a ______, il / elle est ______ et il / elle travaille comme ______."
      ],
      vocabulary: ["je présente", "il est", "elle est", "il a", "elle a", "les cheveux", "les yeux", "calme", "drôle", "professeur", "médecin", "en train de travailler"],
      grammar: "Combine trois informations : apparence avec avoir, caractère avec être, action avec être en train de.",
      checks: [
        { label: "apparence", terms: ["cheveux", "yeux", "lunettes", "grand", "grande", "petit", "petite"] },
        { label: "caractère", terms: ["calme", "drole", "serieux", "serieuse", "sympathique", "curieux", "curieuse"] },
        { label: "activité ou profession", terms: ["en train de", "travaille", "professeur", "medecin", "serveur", "photographe", "etudiant"] }
      ],
      minWords: 14,
      maxSeconds: 30,
      improved: "Je présente Inès. Elle a les cheveux courts, elle est calme et elle est en train de dessiner."
    }
  ]
};
