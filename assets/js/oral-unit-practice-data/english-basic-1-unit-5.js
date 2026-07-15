window.JaraLinguaOralUnitConfig = {
  apiPath: "/api/french8/pronunciation-assessment",
  storageKey: "jaralingua:english-basic-1:oral-unit-5:v1",
  language: "en",
  courseLabel: "English - Basic 1",
  unitLabel: "Unit 5",
  title: "Unit Conversation Coach - Unit 5: Free Time",
  interviewer: {
    name: "Alex",
    role: "Conversation Coach"
  },
  attemptQuestionCount: 4,
  maxRecordingSeconds: 30,
  localUrl: "http://127.0.0.1:8021/ingles/basico/unit-conversation-coach-unit-5.html",
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
    questionReadyStatus: "Listen to the question, then answer with free-time language.",
    structureLabel: "Structure {number}",
    lastScore: "Last score: {score}/100. You can practice again or review the report.",
    defaultMicrophone: "Default microphone",
    microphoneLabel: "Microphone {number}",
    levelWaiting: "Waiting",
    summaryLeadHigh: "Very good preparation for a free-time conversation.",
    summaryLeadMid: "Good base. Repeat your weak questions to improve preference and reason accuracy.",
    summaryLeadLow: "You have started. Use the structures and answer with complete short sentences.",
    readinessHigh: "Ready to interact",
    readinessMid: "Good progress",
    readinessLow: "Needs consolidation",
    previousAttempt: "Previous attempt: {score}/100.",
    comparisonDefault: "Practice several times. The questions change and the help can be hidden.",
    metricLabels: [
      ["task", "Task", "Answer to the question"],
      ["development", "Development", "Activity, preference, and reason detail"],
      ["clarity", "Clarity", "Approximate Whisper signal"],
      ["fluency", "Fluency", "Duration and continuity"]
    ],
    summaryMessages: {
      taskStrength: "You generally answer the free-time question.",
      taskPriority: "Answer the exact question before adding extra details.",
      developmentStrength: "Your answers include useful free-time details.",
      developmentPriority: "Add one detail: activity, frequency, TV show, preference, technology habit, or reason.",
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
      mid: "Good work: repeat the answer with one more free-time detail or a clearer structure.",
      low: "Keep practicing: use one sentence frame and answer with a complete short sentence."
    },
    locale: "en-US"
  },
  unitContext: {
    course: "Basic English Course 1",
    unit: 5,
    title: "Free Time",
    grammar: [
      "simple present for free-time habits",
      "like and prefer plus verb-ing",
      "do and does questions",
      "adverbs of frequency",
      "because plus adjective reason",
      "simple technology habits"
    ],
    vocabulary: [
      "free-time activities",
      "staying in and going out",
      "TV shows",
      "technology and screen time",
      "after-class routines",
      "frequency adverbs",
      "simple reasons"
    ],
    communicativeGoals: [
      "describe free-time activities",
      "say what TV shows you like",
      "use like and prefer with activities",
      "give a reason with because",
      "describe after-class routines",
      "describe technology habits"
    ]
  },
  questions: [
    {
      id: "enb1u5q1",
      unit: 5,
      topic: "Free-time activities",
      text: "What do you do in your free time?",
      audio: "audio/oral-practice/unit-5/question-01.mp3?v=20260715-u5coach",
      frames: [
        "In my free time, I ______.",
        "I usually ______ in my free time.",
        "In my free time, I like ______."
      ],
      vocabulary: ["watch TV", "listen to music", "read books", "play soccer", "play video games", "go out", "stay home"],
      grammar: "Use a base verb after I: I watch TV. Use verb + ing after like: I like watching TV.",
      checks: [
        { label: "free-time context", terms: ["free time", "usually", "like", "watch", "listen", "read", "play", "go out", "stay"] },
        { label: "activity", terms: ["tv", "music", "books", "soccer", "video games", "friends", "park", "home"] }
      ],
      minWords: 6,
      maxSeconds: 20,
      improved: "In my free time, I usually listen to music."
    },
    {
      id: "enb1u5q2",
      unit: 5,
      topic: "Likes",
      text: "What free-time activity do you like?",
      audio: "audio/oral-practice/unit-5/question-02.mp3?v=20260715-u5coach",
      frames: [
        "I like ______.",
        "I like ______ because it is ______.",
        "I like ______ with my friends."
      ],
      vocabulary: ["watching TV", "listening to music", "reading books", "playing soccer", "playing video games", "going to the park"],
      grammar: "After like, use verb + ing: I like reading books.",
      checks: [
        { label: "like structure", terms: ["i like", "like"] },
        { label: "activity with ing or noun", terms: ["watching", "listening", "reading", "playing", "going", "music", "books", "tv", "soccer"] }
      ],
      minWords: 5,
      maxSeconds: 20,
      improved: "I like playing soccer with my friends."
    },
    {
      id: "enb1u5q3",
      unit: 5,
      topic: "Staying in and going out",
      text: "Do you prefer staying in or going out?",
      audio: "audio/oral-practice/unit-5/question-03.mp3?v=20260715-u5coach",
      frames: [
        "I prefer staying in because ______.",
        "I prefer going out because ______.",
        "I like both, but I prefer ______."
      ],
      vocabulary: ["staying in", "going out", "relaxing", "fun", "friends", "home", "park", "movies"],
      grammar: "Use prefer + verb-ing: I prefer staying in. Add because + subject + be.",
      checks: [
        { label: "preference", terms: ["prefer", "staying in", "going out"] },
        { label: "reason", terms: ["because", "relaxing", "fun", "interesting", "friends", "home"] }
      ],
      minWords: 6,
      maxSeconds: 22,
      improved: "I prefer staying in because it is relaxing."
    },
    {
      id: "enb1u5q4",
      unit: 5,
      topic: "TV shows",
      text: "What kind of TV shows do you like?",
      audio: "audio/oral-practice/unit-5/question-04.mp3?v=20260715-u5coach",
      frames: [
        "I like ______ shows.",
        "I like watching ______ because they are ______.",
        "I do not like ______ shows because they are ______."
      ],
      vocabulary: ["comedy shows", "documentaries", "cartoons", "sports shows", "cooking shows", "horror shows", "funny", "interesting", "scary"],
      grammar: "Use plural shows and they are for a reason: They are funny.",
      checks: [
        { label: "TV category", terms: ["shows", "comedy", "documentaries", "cartoons", "sports", "cooking", "horror"] },
        { label: "reason or opinion", terms: ["like", "because", "funny", "interesting", "scary", "exciting"] }
      ],
      minWords: 6,
      maxSeconds: 22,
      improved: "I like watching comedy shows because they are funny."
    },
    {
      id: "enb1u5q5",
      unit: 5,
      topic: "Frequency",
      text: "How often do you watch TV or videos?",
      audio: "audio/oral-practice/unit-5/question-05.mp3?v=20260715-u5coach",
      frames: [
        "I ______ watch TV.",
        "I watch videos ______.",
        "I watch TV ______ times a week."
      ],
      vocabulary: ["always", "usually", "often", "sometimes", "rarely", "never", "every day", "twice a week", "at night"],
      grammar: "Frequency words usually go before the main verb: I usually watch TV.",
      checks: [
        { label: "frequency", terms: ["always", "usually", "often", "sometimes", "rarely", "never", "every day", "once", "twice", "times a week"] },
        { label: "screen activity", terms: ["watch", "tv", "videos", "series", "phone"] }
      ],
      minWords: 5,
      maxSeconds: 20,
      improved: "I usually watch videos at night."
    },
    {
      id: "enb1u5q6",
      unit: 5,
      topic: "After-class routine",
      text: "What do you usually do after class?",
      audio: "audio/oral-practice/unit-5/question-06.mp3?v=20260715-u5coach",
      frames: [
        "After class, I usually ______.",
        "I usually ______ after class.",
        "After class, I ______ and ______."
      ],
      vocabulary: ["go home", "do homework", "listen to music", "watch TV", "use my phone", "go out with friends", "study"],
      grammar: "Use after class at the beginning or end of the sentence.",
      checks: [
        { label: "after-class context", terms: ["after class", "usually"] },
        { label: "routine activity", terms: ["go home", "home", "homework", "music", "watch", "phone", "friends", "study"] }
      ],
      minWords: 7,
      maxSeconds: 22,
      improved: "After class, I usually go home and listen to music."
    },
    {
      id: "enb1u5q7",
      unit: 5,
      topic: "Technology habits",
      text: "How much time do you spend online?",
      audio: "audio/oral-practice/unit-5/question-07.mp3?v=20260715-u5coach",
      frames: [
        "I spend ______ online every day.",
        "I use my phone for ______.",
        "I think I use technology ______."
      ],
      vocabulary: ["one hour", "two hours", "every day", "social media", "online videos", "apps", "too much", "a little"],
      grammar: "Use spend + time + online: I spend two hours online.",
      checks: [
        { label: "online time", terms: ["hour", "hours", "minutes", "online", "every day"] },
        { label: "technology word", terms: ["phone", "technology", "social media", "videos", "apps", "internet"] }
      ],
      minWords: 6,
      maxSeconds: 22,
      improved: "I spend two hours online every day."
    },
    {
      id: "enb1u5q8",
      unit: 5,
      topic: "Free-time summary",
      text: "Describe your free-time habits in three short sentences.",
      audio: "audio/oral-practice/unit-5/question-08.mp3?v=20260715-u5coach",
      frames: [
        "In my free time, I usually ______. I like ______ because ______. I prefer ______.",
        "I usually ______ after class. I like watching ______. I use my phone ______."
      ],
      vocabulary: ["free time", "usually", "like watching", "prefer staying in", "prefer going out", "because", "after class", "phone", "friends"],
      grammar: "Combine activity, like or preference, and one reason in short simple-present sentences.",
      checks: [
        { label: "free-time activity", terms: ["free time", "watch", "listen", "read", "play", "go out", "stay", "after class"] },
        { label: "like or preference", terms: ["like", "prefer", "staying in", "going out"] },
        { label: "reason or frequency", terms: ["because", "usually", "sometimes", "always", "every day", "fun", "relaxing", "interesting"] }
      ],
      minWords: 12,
      maxSeconds: 30,
      improved: "In my free time, I usually listen to music. I like watching comedy shows because they are funny. I prefer staying in."
    }
  ]
};
