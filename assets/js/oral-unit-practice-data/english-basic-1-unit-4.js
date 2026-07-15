window.JaraLinguaOralUnitConfig = {
  apiPath: "/api/french8/pronunciation-assessment",
  storageKey: "jaralingua:english-basic-1:oral-unit-4:v1",
  language: "en",
  courseLabel: "English - Basic 1",
  unitLabel: "Unit 4",
  title: "Unit Conversation Coach - Unit 4: Everyday Life",
  interviewer: {
    name: "Alex",
    role: "Conversation Coach"
  },
  attemptQuestionCount: 4,
  maxRecordingSeconds: 30,
  localUrl: "http://127.0.0.1:8021/ingles/basico/unit-conversation-coach-unit-4.html",
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
    questionReadyStatus: "Listen to the question, then answer with routine and healthy-life language.",
    structureLabel: "Structure {number}",
    lastScore: "Last score: {score}/100. You can practice again or review the report.",
    defaultMicrophone: "Default microphone",
    microphoneLabel: "Microphone {number}",
    levelWaiting: "Waiting",
    summaryLeadHigh: "Very good preparation for an everyday-routine conversation.",
    summaryLeadMid: "Good base. Repeat your weak questions to improve routine accuracy.",
    summaryLeadLow: "You have started. Use the structures and answer with complete short sentences.",
    readinessHigh: "Ready to interact",
    readinessMid: "Good progress",
    readinessLow: "Needs consolidation",
    previousAttempt: "Previous attempt: {score}/100.",
    comparisonDefault: "Practice several times. The questions change and the help can be hidden.",
    metricLabels: [
      ["task", "Task", "Answer to the question"],
      ["development", "Development", "Routine, time, and frequency detail"],
      ["clarity", "Clarity", "Approximate Whisper signal"],
      ["fluency", "Fluency", "Duration and continuity"]
    ],
    summaryMessages: {
      taskStrength: "You generally answer the everyday-routine question.",
      taskPriority: "Answer the exact routine question before adding extra details.",
      developmentStrength: "Your answers include useful time, frequency, or healthy-life details.",
      developmentPriority: "Add one detail: time, frequency, activity, sport, or healthy habit.",
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
      mid: "Good work: repeat the answer with one more routine detail or a clearer structure.",
      low: "Keep practicing: use one sentence frame and answer with a complete short sentence."
    },
    locale: "en-US"
  },
  unitContext: {
    course: "Basic English Course 1",
    unit: 4,
    title: "Everyday Life",
    grammar: [
      "simple present for routines",
      "do and does questions",
      "time expressions with at and in",
      "adverbs of frequency",
      "play, go, do, and work out for sports routines"
    ],
    vocabulary: [
      "daily routine actions",
      "morning and evening routines",
      "clock time",
      "frequency adverbs",
      "sports and exercise",
      "healthy habits"
    ],
    communicativeGoals: [
      "say what time a routine happens",
      "describe morning and weekly routines",
      "use frequency adverbs",
      "ask and answer how often questions",
      "describe a sport or exercise routine",
      "describe one healthy habit"
    ]
  },
  questions: [
    {
      id: "enb1u4q1",
      unit: 4,
      topic: "Wake-up time",
      text: "What time do you usually wake up?",
      audio: "audio/oral-practice/unit-4/question-01.mp3?v=20260715-u4coach",
      frames: [
        "I usually wake up at ______.",
        "I wake up at ______ in the morning."
      ],
      vocabulary: ["wake up", "usually", "at six", "at six thirty", "in the morning", "early"],
      grammar: "Use at for exact clock times: I wake up at 6:30.",
      checks: [
        { label: "routine verb", terms: ["wake up"] },
        { label: "time expression", terms: ["at", "morning", "six", "seven", "eight", "thirty"] }
      ],
      minWords: 6,
      maxSeconds: 18,
      improved: "I usually wake up at [time] in the morning."
    },
    {
      id: "enb1u4q2",
      unit: 4,
      topic: "Morning routine",
      text: "What do you do in the morning?",
      audio: "audio/oral-practice/unit-4/question-02.mp3?v=20260715-u4coach",
      frames: [
        "In the morning, I ______ and ______.",
        "I usually ______, then I ______."
      ],
      vocabulary: ["brush my teeth", "take a shower", "get dressed", "have breakfast", "go to work", "go to school"],
      grammar: "Use base verbs after I: I brush, I take, I have, I go.",
      checks: [
        { label: "morning phrase", terms: ["morning"] },
        { label: "routine action", terms: ["brush", "shower", "dressed", "breakfast", "go to work", "go to school"] }
      ],
      minWords: 8,
      maxSeconds: 24,
      improved: "In the morning, I take a shower and have breakfast."
    },
    {
      id: "enb1u4q3",
      unit: 4,
      topic: "Frequency",
      text: "How often do you have breakfast at home?",
      audio: "audio/oral-practice/unit-4/question-03.mp3?v=20260715-u4coach",
      frames: [
        "I ______ have breakfast at home.",
        "I have breakfast at home ______ times a week."
      ],
      vocabulary: ["always", "usually", "often", "sometimes", "rarely", "never", "once a week", "three times a week"],
      grammar: "Frequency adverbs usually go before the main verb: I usually have breakfast.",
      checks: [
        { label: "frequency", terms: ["always", "usually", "often", "sometimes", "rarely", "never", "once", "twice", "times a week"] },
        { label: "breakfast", terms: ["breakfast"] }
      ],
      minWords: 6,
      maxSeconds: 20,
      improved: "I usually have breakfast at home."
    },
    {
      id: "enb1u4q4",
      unit: 4,
      topic: "Weekday routine",
      text: "Describe your weekday routine in two short sentences.",
      audio: "audio/oral-practice/unit-4/question-04.mp3?v=20260715-u4coach",
      frames: [
        "I wake up at ______. I go to ______ at ______.",
        "I usually ______ in the morning. I ______ at night."
      ],
      vocabulary: ["weekday", "wake up", "go to work", "go to school", "study", "at night", "in the morning"],
      grammar: "Use simple present for repeated actions: I wake up, I study, I go.",
      checks: [
        { label: "routine action", terms: ["wake up", "go to", "study", "work", "school"] },
        { label: "time detail", terms: ["at", "morning", "night", "weekday"] }
      ],
      minWords: 10,
      maxSeconds: 30,
      improved: "I wake up at 6:30. I go to work at 8:00."
    },
    {
      id: "enb1u4q5",
      unit: 4,
      topic: "Sports and exercise",
      text: "What sport or exercise do you do?",
      audio: "audio/oral-practice/unit-4/question-05.mp3?v=20260715-u4coach",
      frames: [
        "I play ______.",
        "I go ______.",
        "I do ______.",
        "I work out."
      ],
      vocabulary: ["play soccer", "play basketball", "go running", "go swimming", "do yoga", "do exercise", "work out"],
      grammar: "Use play for sports and games, go for -ing activities, do for yoga or exercise, and work out for general exercise.",
      checks: [
        { label: "sports verb", terms: ["play", "go", "do", "work out"] },
        { label: "activity", terms: ["soccer", "basketball", "running", "swimming", "yoga", "exercise", "gym"] }
      ],
      minWords: 3,
      maxSeconds: 18,
      improved: "I go running, and I sometimes work out."
    },
    {
      id: "enb1u4q6",
      unit: 4,
      topic: "Exercise frequency",
      text: "How often do you work out or exercise?",
      audio: "audio/oral-practice/unit-4/question-06.mp3?v=20260715-u4coach",
      frames: [
        "I work out ______ times a week.",
        "I ______ exercise in the morning.",
        "I ______ go running."
      ],
      vocabulary: ["work out", "exercise", "go running", "once a week", "twice a week", "three times a week", "usually", "sometimes"],
      grammar: "Use how often answers with frequency: twice a week, usually, sometimes, never.",
      checks: [
        { label: "exercise action", terms: ["work out", "exercise", "running", "gym", "yoga"] },
        { label: "frequency", terms: ["always", "usually", "often", "sometimes", "never", "once", "twice", "times a week"] }
      ],
      minWords: 6,
      maxSeconds: 22,
      improved: "I work out three times a week."
    },
    {
      id: "enb1u4q7",
      unit: 4,
      topic: "Healthy habits",
      text: "What healthy habit do you have?",
      audio: "audio/oral-practice/unit-4/question-07.mp3?v=20260715-u4coach",
      frames: [
        "I usually ______.",
        "I try to ______ every day.",
        "My healthy habit is to ______."
      ],
      vocabulary: ["drink water", "eat healthy food", "sleep well", "stretch", "walk", "cut down on soda", "work out"],
      grammar: "Use I usually + base verb, or I try to + base verb.",
      checks: [
        { label: "healthy habit", terms: ["water", "healthy food", "sleep", "stretch", "walk", "soda", "work out", "exercise"] },
        { label: "routine structure", terms: ["i usually", "i try to", "my healthy habit"] }
      ],
      minWords: 6,
      maxSeconds: 22,
      improved: "I usually drink water and sleep well."
    },
    {
      id: "enb1u4q8",
      unit: 4,
      topic: "Healthy day",
      text: "Describe your healthy day in three short sentences.",
      audio: "audio/oral-practice/unit-4/question-08.mp3?v=20260715-u4coach",
      frames: [
        "I wake up at ______. I ______ in the morning. I usually ______.",
        "I ______ every day. I ______ three times a week. I go to bed at ______."
      ],
      vocabulary: ["wake up", "drink water", "have breakfast", "walk", "work out", "eat healthy food", "sleep well", "go to bed"],
      grammar: "Combine time, routine action, and frequency in short simple-present sentences.",
      checks: [
        { label: "routine action", terms: ["wake up", "breakfast", "walk", "work out", "drink", "sleep", "go to bed"] },
        { label: "time or frequency", terms: ["at", "always", "usually", "sometimes", "every day", "times a week"] },
        { label: "healthy detail", terms: ["water", "healthy", "exercise", "walk", "sleep", "work out"] }
      ],
      minWords: 12,
      maxSeconds: 30,
      improved: "I wake up at 6:30. I drink water in the morning. I usually walk after class."
    }
  ]
};
