window.JaraLinguaOralUnitConfig = {
  apiPath: "/api/french8/pronunciation-assessment",
  storageKey: "jaralingua:french1:oral-unit-5:v1",
  language: "fr",
  courseLabel: "Français · Niveau 1",
  unitLabel: "Unité 5",
  title: "Coach de conversation – Unité 5 : Famille et relations",
  interviewer: {
    name: "Camille",
    role: "Coach de conversation"
  },
  attemptQuestionCount: 4,
  maxRecordingSeconds: 30,
  localUrl: "http://127.0.0.1:8021/frances/Niveau%201/ateliers/pratique-orale-unite-5.html",
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
    unit: 5,
    title: "Famille et relations",
    grammar: [
      "vocabulaire de la famille",
      "adjectifs possessifs mon, ma, mes",
      "adjectifs possessifs ton, ta, tes",
      "adjectifs possessifs son, sa, ses",
      "être et s’appeler pour présenter une personne",
      "avoir pour parler de frères et sœurs"
    ],
    vocabulary: [
      "ma mère",
      "mon père",
      "mes parents",
      "mon frère",
      "ma sœur",
      "mes grands-parents",
      "mon ami",
      "ma meilleure amie",
      "il s’appelle",
      "elle s’appelle"
    ],
    communicativeGoals: [
      "nommer des membres de sa famille",
      "dire si l’on a des frères ou des sœurs",
      "présenter une personne de sa famille",
      "utiliser mon, ma et mes",
      "poser une question simple sur la famille",
      "faire une mini-présentation familiale"
    ]
  },
  questions: [
    {
      id: "fr1u5q1",
      unit: 5,
      topic: "Membres de la famille",
      text: "Qui est dans ta famille ?",
      audio: "../audio/pratique-orale/unite-5/question-01.mp3?v=20260712-u5",
      frames: [
        "Dans ma famille, il y a ______.",
        "Il y a ma mère, mon père et ______."
      ],
      vocabulary: ["dans ma famille", "il y a", "ma mère", "mon père", "mes parents", "mon frère", "ma sœur", "mes grands-parents"],
      grammar: "Utilise mon avec un nom masculin, ma avec un nom féminin et mes avec un nom pluriel.",
      checks: [
        { label: "contexte familial", terms: ["famille", "il y a", "parents"] },
        { label: "membre de famille", terms: ["mere", "pere", "frere", "soeur", "parents", "grands parents", "grand mere", "grand pere"] }
      ],
      minWords: 7,
      maxSeconds: 24,
      improved: "Dans ma famille, il y a ma mère, mon père et ma sœur."
    },
    {
      id: "fr1u5q2",
      unit: 5,
      topic: "Frères et sœurs",
      text: "Tu as des frères ou des sœurs ?",
      audio: "../audio/pratique-orale/unite-5/question-02.mp3?v=20260712-u5",
      frames: [
        "Oui, j’ai ______ frère(s) et ______ sœur(s).",
        "Non, je n’ai pas de frères et sœurs."
      ],
      vocabulary: ["oui", "non", "j’ai", "je n’ai pas de", "un frère", "une sœur", "deux frères", "deux sœurs"],
      grammar: "Avec avoir, dis j’ai un frère ou je n’ai pas de frère. Après pas, on utilise souvent de.",
      checks: [
        { label: "réponse oui ou non", terms: ["oui", "non"] },
        { label: "frère ou sœur", terms: ["j ai", "je n ai pas", "frere", "soeur"] }
      ],
      minWords: 5,
      maxSeconds: 22,
      improved: "Oui, j’ai un frère et une sœur. / Non, je n’ai pas de frères et sœurs."
    },
    {
      id: "fr1u5q3",
      unit: 5,
      topic: "Nom d’un parent",
      text: "Comment s’appelle ta mère ou ton père ?",
      audio: "../audio/pratique-orale/unite-5/question-03.mp3?v=20260712-u5",
      frames: [
        "Ma mère s’appelle ______.",
        "Mon père s’appelle ______."
      ],
      vocabulary: ["ma mère", "mon père", "s’appelle", "elle s’appelle", "il s’appelle", "prénom", "famille"],
      grammar: "On dit ma mère parce que mère est féminin, et mon père parce que père est masculin.",
      checks: [
        { label: "possessif correct", terms: ["ma mere", "mon pere", "mes parents"] },
        { label: "verbe s’appeler", terms: ["s appelle", "elle s appelle", "il s appelle"] }
      ],
      minWords: 4,
      maxSeconds: 20,
      improved: "Ma mère s’appelle [prénom]. Mon père s’appelle [prénom]."
    },
    {
      id: "fr1u5q4",
      unit: 5,
      topic: "Présentation d’une personne",
      text: "Présente une personne de ta famille.",
      audio: "../audio/pratique-orale/unite-5/question-04.mp3?v=20260712-u5",
      frames: [
        "Je présente ______. Il / elle s’appelle ______.",
        "C’est mon / ma ______. Il / elle est ______."
      ],
      vocabulary: ["je présente", "c’est", "mon frère", "ma sœur", "ma mère", "mon père", "il est", "elle est", "sympa", "gentil", "gentille"],
      grammar: "Pour présenter quelqu’un, utilise c’est + possessif + nom : c’est ma sœur, c’est mon père.",
      checks: [
        { label: "présentation", terms: ["je presente", "c est", "voici"] },
        { label: "relation familiale", terms: ["mon", "ma", "mere", "pere", "frere", "soeur", "cousin", "cousine"] }
      ],
      minWords: 8,
      maxSeconds: 28,
      improved: "Je présente ma sœur. Elle s’appelle [prénom] et elle est très gentille."
    },
    {
      id: "fr1u5q5",
      unit: 5,
      topic: "Ami ou amie",
      text: "Qui est ton meilleur ami ou ta meilleure amie ?",
      audio: "../audio/pratique-orale/unite-5/question-05.mp3?v=20260712-u5",
      frames: [
        "Mon meilleur ami s’appelle ______.",
        "Ma meilleure amie s’appelle ______."
      ],
      vocabulary: ["mon meilleur ami", "ma meilleure amie", "s’appelle", "il est", "elle est", "sympa", "drôle", "important", "importante"],
      grammar: "Utilise mon avec ami et ma avec amie. Attention : meilleur devient meilleure au féminin.",
      checks: [
        { label: "ami ou amie", terms: ["ami", "amie", "meilleur", "meilleure"] },
        { label: "présentation ou description", terms: ["s appelle", "il est", "elle est", "sympa", "drole", "important"] }
      ],
      minWords: 6,
      maxSeconds: 24,
      improved: "Ma meilleure amie s’appelle [prénom]. Elle est sympa et importante pour moi."
    },
    {
      id: "fr1u5q6",
      unit: 5,
      topic: "Possessifs",
      text: "Dis une phrase avec mon, une phrase avec ma et une phrase avec mes.",
      audio: "../audio/pratique-orale/unite-5/question-06.mp3?v=20260712-u5",
      frames: [
        "Mon ______ est ______. Ma ______ est ______. Mes ______ sont ______.",
        "Mon père ______. Ma mère ______. Mes parents ______."
      ],
      vocabulary: ["mon père", "mon frère", "ma mère", "ma sœur", "mes parents", "mes amis", "est", "sont"],
      grammar: "Mon = masculin singulier, ma = féminin singulier, mes = pluriel.",
      checks: [
        { label: "mon", terms: ["mon"] },
        { label: "ma", terms: ["ma"] },
        { label: "mes", terms: ["mes"] }
      ],
      minWords: 9,
      maxSeconds: 30,
      improved: "Mon père est gentil. Ma mère est sympa. Mes parents sont importants pour moi."
    },
    {
      id: "fr1u5q7",
      unit: 5,
      topic: "Question sur la famille",
      text: "Pose une question simple sur la famille de ton camarade.",
      audio: "../audio/pratique-orale/unite-5/question-07.mp3?v=20260712-u5",
      frames: [
        "Tu as des ______ ?",
        "Comment s’appelle ton / ta ______ ?"
      ],
      vocabulary: ["tu as", "des frères", "des sœurs", "ton père", "ta mère", "ta sœur", "ton frère", "comment s’appelle"],
      grammar: "Pour demander une information, tu peux utiliser tu as… ? ou comment s’appelle… ?",
      checks: [
        { label: "forme de question", terms: ["tu as", "comment s appelle", "est ce que"] },
        { label: "vocabulaire familial", terms: ["famille", "frere", "soeur", "mere", "pere", "parents"] }
      ],
      minWords: 4,
      maxSeconds: 20,
      improved: "Tu as des frères ou des sœurs ? / Comment s’appelle ta mère ?"
    },
    {
      id: "fr1u5q8",
      unit: 5,
      topic: "Mini-présentation familiale",
      text: "Présente ta famille en trois phrases courtes.",
      audio: "../audio/pratique-orale/unite-5/question-08.mp3?v=20260712-u5",
      frames: [
        "Dans ma famille, il y a ______. Mon / ma ______ s’appelle ______. Mes ______ sont ______.",
        "Je présente ma famille. J’ai ______. Mon / ma ______ est ______."
      ],
      vocabulary: ["je présente", "ma famille", "il y a", "j’ai", "mon père", "ma mère", "mes parents", "mes frères", "mes sœurs", "s’appelle"],
      grammar: "Utilise trois phrases courtes : une pour introduire la famille, une pour nommer une personne, une pour donner un détail.",
      checks: [
        { label: "famille", terms: ["famille", "parents", "mere", "pere", "frere", "soeur"] },
        { label: "possessif", terms: ["mon", "ma", "mes"] },
        { label: "au moins deux idées", minMatches: 2, terms: ["il y a", "j ai", "s appelle", "est", "sont"] }
      ],
      minWords: 12,
      maxSeconds: 30,
      improved: "Je présente ma famille. Il y a ma mère, mon père et mon frère. Mes parents sont très importants pour moi."
    }
  ]
};
