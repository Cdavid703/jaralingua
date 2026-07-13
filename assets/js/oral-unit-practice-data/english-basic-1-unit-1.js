window.JaraLinguaOralUnitConfig = {
  apiPath: "/api/french8/pronunciation-assessment",
  storageKey: "jaralingua:english-basic-1:oral-unit-1:v1",
  language: "en",
  courseLabel: "English - Basic 1",
  unitLabel: "Unit 1",
  title: "Unit Conversation Coach - Unit 1: All About You",
  interviewer: {
    name: "Alex",
    role: "Conversation Coach"
  },
  attemptQuestionCount: 4,
  maxRecordingSeconds: 30,
  localUrl: "http://127.0.0.1:8021/ingles/basico/unit-conversation-coach-unit-1.html",
  ui: {
    start: "Start practice",
    preflight: "Test microphone",
    playQuestion: "Listen to the question",
    speed: "Speed",
    hideHelp: "Hide help",
    showHelp: "I need help",
    finishAnswer: "Finish answer",
    retry: "Try again",
    continue: "Continue",
    restart: "New full attempt",
    weakPractice: "Practice my two weak questions",
    transcriptPlaceholder: "Your transcript will appear here after Whisper analysis.",
    readyStatus: "Ready for your answer",
    recordHelp: "Tap the microphone and answer in English.",
    recording: "Recording...",
    transcribing: "Analyzing your answer with local Whisper...",
    transcribed: "Answer transcribed. Read it before continuing.",
    noSpeech: "Whisper detected sound, but not clear English words. Speak closer to the microphone.",
    unsupportedTitle: "Browser not supported",
    unsupportedDetail: "This activity needs getUserMedia and MediaRecorder.",
    privacy: "The audio is sent temporarily to the JaraLingua Whisper service for transcription. It is not saved.",
    formativeNotice: "This is automatic practice feedback, not an official grade.",
    expectedElement: "expected element",
    lowConfidenceLabel: "Words to pronounce more clearly:",
    scoreLabel: "Score:",
    improvedModelLabel: "Improved model",
    questionCounter: "Question {current} of {total}",
    questionReadyStatus: "Listen to the question, then answer with your own information.",
    structureLabel: "Structure {number}",
    lastScore: "Last score: {score}/100. You can practice again or review the report.",
    defaultMicrophone: "Default microphone",
    microphoneLabel: "Microphone {number}",
    levelWaiting: "Waiting",
    summaryLeadHigh: "Very good preparation for a first personal-information conversation.",
    summaryLeadMid: "Good base. Repeat your weak questions to gain accuracy.",
    summaryLeadLow: "You have started. Use the structures and answer with complete short sentences.",
    readinessHigh: "Ready to interact",
    readinessMid: "Good progress",
    readinessLow: "Needs consolidation",
    previousAttempt: "Previous attempt: {score}/100.",
    comparisonDefault: "Practice several times. The questions change and the help can be hidden.",
    metricLabels: [
      ["task", "Task", "Answer to the question"],
      ["development", "Development", "Length and personal detail"],
      ["clarity", "Clarity", "Approximate Whisper signal"],
      ["fluency", "Fluency", "Duration and continuity"]
    ],
    summaryMessages: {
      taskStrength: "You generally answer the question asked.",
      taskPriority: "Answer the exact question before adding details.",
      developmentStrength: "Your answers include enough words to be understood.",
      developmentPriority: "Add one personal detail: name, city, country, age, phone, or email.",
      clarityStrength: "Whisper recognizes many of your words.",
      clarityPriority: "Speak closer to the microphone and slow down a little.",
      fluencyStrength: "You maintain a fairly continuous short answer.",
      fluencyPriority: "Prepare one short sentence before recording.",
      defaultStrength: "You completed a full oral practice attempt.",
      defaultPriority: "Try one attempt with the help hidden after the first question."
    },
    noPriorityWords: "No priority words detected in this attempt.",
    fullAttemptLabel: "full attempt",
    weakAttemptLabel: "weak questions",
    noPreviousAttempts: "No previous attempts.",
    noTranscript: "No transcript available.",
    audioPlayError: "The question audio cannot play right now.",
    missingConfigTitle: "Missing configuration",
    missingConfigDetail: "No questions are available for this activity.",
    scoreMessages: {
      high: "Very good: your answer covers the task and is clear.",
      mid: "Good work: repeat the answer with one more personal detail or a clearer structure.",
      low: "Keep practicing: use one sentence frame and answer with a complete short sentence."
    },
    locale: "en-US"
  },
  unitContext: {
    course: "Basic English Course 1",
    unit: 1,
    title: "All About You",
    grammar: [
      "verb to be",
      "subject pronouns",
      "basic personal information questions",
      "possessive adjective my"
    ],
    vocabulary: [
      "greetings",
      "first name",
      "last name",
      "age",
      "city",
      "country",
      "phone number",
      "email",
      "alphabet"
    ],
    communicativeGoals: [
      "greet someone",
      "say your name",
      "spell your last name",
      "say your age",
      "say where you are from",
      "say where you live",
      "give contact information",
      "introduce yourself briefly"
    ]
  },
  questions: [
    {
      id: "enb1u1q1",
      unit: 1,
      topic: "Name and greeting",
      text: "Good morning. What is your name?",
      audio: "audio/oral-practice/unit-1/question-01.mp3?v=20260712-u1coach",
      frames: [
        "Good morning. My name is ______.",
        "Hello. I am ______. Nice to meet you."
      ],
      vocabulary: ["good morning", "hello", "my name is", "I am", "nice to meet you"],
      grammar: "Use My name is + your name, or I am + your name. Do not say My name Ana.",
      checks: [
        { label: "greeting", terms: ["good morning", "hello", "hi"] },
        { label: "name structure", terms: ["my name is", "i am", "i'm"] }
      ],
      minWords: 5,
      maxSeconds: 18,
      improved: "Good morning. My name is [your full name]. Nice to meet you."
    },
    {
      id: "enb1u1q2",
      unit: 1,
      topic: "Spelling",
      text: "How do you spell your last name?",
      audio: "audio/oral-practice/unit-1/question-02.mp3?v=20260712-u1coach",
      frames: [
        "My last name is ______. It is spelled ______.",
        "Sure. My last name is ______: ______."
      ],
      vocabulary: ["last name", "spell", "letter", "capital letter", "it is spelled", "sure"],
      grammar: "For spelling, say the name first, then say the letters slowly.",
      checks: [
        { label: "last name reference", terms: ["last name", "surname", "family name"] },
        { label: "spelling signal", terms: ["spelled", "spell", "letter"] }
      ],
      minWords: 5,
      maxSeconds: 24,
      improved: "My last name is [last name]. It is spelled [letters]."
    },
    {
      id: "enb1u1q3",
      unit: 1,
      topic: "Age",
      text: "How old are you?",
      audio: "audio/oral-practice/unit-1/question-03.mp3?v=20260712-u1coach",
      frames: [
        "I am ______ years old.",
        "I am ______. I am a student."
      ],
      vocabulary: ["years old", "twenty", "twenty-one", "twenty-two", "student", "I am"],
      grammar: "In English, age uses be: I am twenty years old. Do not say I have twenty years.",
      checks: [
        { label: "be for age", terms: ["i am", "i'm"] },
        { label: "age word", terms: ["years old", "twenty", "thirty", "eighteen", "nineteen"] }
      ],
      minWords: 4,
      maxSeconds: 16,
      improved: "I am [number] years old."
    },
    {
      id: "enb1u1q4",
      unit: 1,
      topic: "Origin",
      text: "Where are you from?",
      audio: "audio/oral-practice/unit-1/question-04.mp3?v=20260712-u1coach",
      frames: [
        "I am from ______.",
        "I am from ______, Colombia."
      ],
      vocabulary: ["I am from", "city", "country", "Colombia", "Medellin", "Bogota", "Envigado"],
      grammar: "Use from + city or country: I am from Medellin. Do not say I am from in Medellin.",
      checks: [
        { label: "origin structure", terms: ["i am from", "i'm from"] },
        { label: "place", terms: ["colombia", "medellin", "bogota", "envigado", "bello", "itagui"] }
      ],
      minWords: 4,
      maxSeconds: 16,
      improved: "I am from [city], Colombia."
    },
    {
      id: "enb1u1q5",
      unit: 1,
      topic: "City",
      text: "Where do you live?",
      audio: "audio/oral-practice/unit-1/question-05.mp3?v=20260712-u1coach",
      frames: [
        "I live in ______.",
        "I live in ______, near Medellin."
      ],
      vocabulary: ["I live in", "city", "near", "Medellin", "Envigado", "Bello", "Itagui"],
      grammar: "Use live in + city: I live in Envigado.",
      checks: [
        { label: "city structure", terms: ["i live in", "live in"] },
        { label: "place", terms: ["medellin", "envigado", "bello", "itagui", "sabaneta", "colombia"] }
      ],
      minWords: 4,
      maxSeconds: 16,
      improved: "I live in [city], Colombia."
    },
    {
      id: "enb1u1q6",
      unit: 1,
      topic: "Phone number",
      text: "What is your phone number?",
      audio: "audio/oral-practice/unit-1/question-06.mp3?v=20260712-u1coach",
      frames: [
        "My phone number is ______.",
        "It is ______. Please repeat it."
      ],
      vocabulary: ["phone number", "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"],
      grammar: "Use My phone number is + digits. Say the digits slowly.",
      checks: [
        { label: "phone structure", terms: ["phone number", "number is", "it is"] },
        { label: "number words", minMatches: 2, terms: ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"] }
      ],
      minWords: 5,
      maxSeconds: 22,
      improved: "My phone number is [digits]."
    },
    {
      id: "enb1u1q7",
      unit: 1,
      topic: "Email",
      text: "What is your email address?",
      audio: "audio/oral-practice/unit-1/question-07.mp3?v=20260712-u1coach",
      frames: [
        "My email is ______ at ______ dot com.",
        "My email address is ______."
      ],
      vocabulary: ["email", "email address", "at", "dot", "underscore", "hyphen", "gmail", "hotmail"],
      grammar: "Say email symbols clearly: at, dot, underscore, and hyphen.",
      checks: [
        { label: "email structure", terms: ["my email", "email address"] },
        { label: "email symbol", terms: ["at", "dot", "underscore", "hyphen", "gmail", "hotmail"] }
      ],
      minWords: 5,
      maxSeconds: 24,
      improved: "My email address is [name] at [domain] dot com."
    },
    {
      id: "enb1u1q8",
      unit: 1,
      topic: "Self-introduction",
      text: "Please introduce yourself in three short sentences.",
      audio: "audio/oral-practice/unit-1/question-08.mp3?v=20260712-u1coach",
      frames: [
        "Hello. My name is ______. I am ______ years old. I am from ______.",
        "Good morning. I am ______. I live in ______. Nice to meet you."
      ],
      vocabulary: ["hello", "good morning", "my name is", "I am", "years old", "I am from", "I live in", "nice to meet you"],
      grammar: "A simple introduction combines greeting + name + one or two personal details.",
      checks: [
        { label: "greeting", terms: ["hello", "good morning", "hi"] },
        { label: "identity", terms: ["my name is", "i am", "i'm"] },
        { label: "personal detail", terms: ["years old", "from", "live in", "student"] }
      ],
      minWords: 10,
      maxSeconds: 30,
      improved: "Hello. My name is [name]. I am [age] years old. I am from [city]. Nice to meet you."
    }
  ]
};
