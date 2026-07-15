window.JaraLinguaOralUnitConfig = {
  apiPath: "/api/french8/pronunciation-assessment",
  storageKey: "jaralingua:english-basic-1:oral-unit-6:v1",
  language: "en",
  courseLabel: "English - Basic 1",
  unitLabel: "Unit 6",
  title: "Unit Conversation Coach - Unit 6: Neighborhoods",
  interviewer: {
    name: "Alex",
    role: "Conversation Coach"
  },
  attemptQuestionCount: 4,
  maxRecordingSeconds: 30,
  localUrl: "http://127.0.0.1:8021/ingles/basico/unit-conversation-coach-unit-6.html",
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
    questionReadyStatus: "Listen to the question, then answer with neighborhood language.",
    structureLabel: "Structure {number}",
    lastScore: "Last score: {score}/100. You can practice again or review the report.",
    defaultMicrophone: "Default microphone",
    microphoneLabel: "Microphone {number}",
    levelWaiting: "Waiting",
    summaryLeadHigh: "Very good preparation for a neighborhood conversation.",
    summaryLeadMid: "Good base. Repeat your weak questions to improve location and direction accuracy.",
    summaryLeadLow: "You have started. Use the structures and answer with complete short sentences.",
    readinessHigh: "Ready to interact",
    readinessMid: "Good progress",
    readinessLow: "Needs consolidation",
    previousAttempt: "Previous attempt: {score}/100.",
    comparisonDefault: "Practice several times. The questions change and the help can be hidden.",
    metricLabels: [
      ["task", "Task", "Answer to the question"],
      ["development", "Development", "Place, location, direction, and recommendation detail"],
      ["clarity", "Clarity", "Approximate Whisper signal"],
      ["fluency", "Fluency", "Duration and continuity"]
    ],
    summaryMessages: {
      taskStrength: "You generally answer the neighborhood question.",
      taskPriority: "Answer the exact question before adding extra details.",
      developmentStrength: "Your answers include useful neighborhood details.",
      developmentPriority: "Add one detail: place, location, direction, time, adjective, or recommendation.",
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
      mid: "Good work: repeat the answer with one more neighborhood detail or a clearer structure.",
      low: "Keep practicing: use one sentence frame and answer with a complete short sentence."
    },
    locale: "en-US"
  },
  unitContext: {
    course: "Basic English Course 1",
    unit: 6,
    title: "Neighborhoods",
    grammar: [
      "there is and there are",
      "location prepositions",
      "imperatives for directions",
      "simple present for opening times",
      "adjectives for places",
      "recommendations with because"
    ],
    vocabulary: [
      "places in town",
      "neighborhood adjectives",
      "location words",
      "directions",
      "opening times",
      "favorite places"
    ],
    communicativeGoals: [
      "describe places in a neighborhood",
      "say where places are",
      "ask and give simple directions",
      "say when a place opens",
      "recommend a favorite place",
      "describe a neighborhood in short sentences"
    ]
  },
  questions: [
    {
      id: "enb1u6q1",
      unit: 6,
      topic: "Places in town",
      text: "What places are there in your neighborhood?",
      audio: "audio/oral-practice/unit-6/question-01.mp3?v=20260715-u6coach",
      frames: [
        "There is a ______ in my neighborhood.",
        "There are two ______ near my house.",
        "In my neighborhood, there is a ______ and there are ______."
      ],
      vocabulary: ["library", "park", "cafe", "supermarket", "bank", "bus stop", "restaurant", "movie theater"],
      grammar: "Use there is for one place and there are for two or more places.",
      checks: [
        { label: "there is or there are", terms: ["there is", "there are"] },
        { label: "place word", terms: ["library", "park", "cafe", "supermarket", "bank", "bus stop", "restaurant", "theater"] }
      ],
      minWords: 7,
      maxSeconds: 24,
      improved: "There is a park, and there are two cafes in my neighborhood."
    },
    {
      id: "enb1u6q2",
      unit: 6,
      topic: "Location",
      text: "Where is the nearest supermarket or cafe?",
      audio: "audio/oral-practice/unit-6/question-02.mp3?v=20260715-u6coach",
      frames: [
        "The ______ is near my house.",
        "The ______ is next to the ______.",
        "It is across from the ______."
      ],
      vocabulary: ["supermarket", "cafe", "near", "next to", "across from", "park", "library", "bank"],
      grammar: "Use location words after be: It is next to the park.",
      checks: [
        { label: "place", terms: ["supermarket", "cafe", "store", "shop"] },
        { label: "location phrase", terms: ["near", "next to", "across from", "between", "on"] }
      ],
      minWords: 7,
      maxSeconds: 22,
      improved: "The supermarket is next to the cafe."
    },
    {
      id: "enb1u6q3",
      unit: 6,
      topic: "There is and there are",
      text: "Describe your neighborhood with there is and there are.",
      audio: "audio/oral-practice/unit-6/question-03.mp3?v=20260715-u6coach",
      frames: [
        "There is a ______ near my house. There are ______.",
        "There is a ______, and there are two ______."
      ],
      vocabulary: ["park", "library", "cafes", "restaurants", "bus stops", "shops", "supermarkets", "near my house"],
      grammar: "Use there is with one singular noun and there are with plural nouns.",
      checks: [
        { label: "there is", terms: ["there is"] },
        { label: "there are", terms: ["there are"] },
        { label: "place detail", terms: ["park", "library", "cafe", "restaurant", "bus", "shops", "supermarket"] }
      ],
      minWords: 10,
      maxSeconds: 28,
      improved: "There is a park near my house. There are two cafes across from the park."
    },
    {
      id: "enb1u6q4",
      unit: 6,
      topic: "Directions",
      text: "How can I get to the library from the bus stop?",
      audio: "audio/oral-practice/unit-6/question-04.mp3?v=20260715-u6coach",
      frames: [
        "Go straight and turn ______.",
        "Go straight for two blocks. The library is on your ______.",
        "Turn ______ at the ______. The library is across from the ______."
      ],
      vocabulary: ["go straight", "turn left", "turn right", "two blocks", "on your left", "on your right", "at the cafe", "across from"],
      grammar: "Use short imperatives for directions: Go straight. Turn left. Cross the street.",
      checks: [
        { label: "direction verb", terms: ["go straight", "turn", "cross", "go past", "walk"] },
        { label: "finish location", terms: ["left", "right", "across from", "next to", "library"] }
      ],
      minWords: 8,
      maxSeconds: 28,
      improved: "Go straight for two blocks and turn right. The library is on your left."
    },
    {
      id: "enb1u6q5",
      unit: 6,
      topic: "Opening times",
      text: "What time does your favorite place open?",
      audio: "audio/oral-practice/unit-6/question-05.mp3?v=20260715-u6coach",
      frames: [
        "It opens at ______.",
        "The ______ opens at ______.",
        "My favorite place opens at ______ in the morning."
      ],
      vocabulary: ["opens at", "eight o'clock", "seven thirty", "in the morning", "in the afternoon", "library", "cafe", "park"],
      grammar: "Use opens with it, the library, the cafe, or my favorite place.",
      checks: [
        { label: "opening structure", terms: ["opens at", "open at"] },
        { label: "time", terms: ["o'clock", "thirty", "morning", "afternoon", "seven", "eight", "nine", "ten"] }
      ],
      minWords: 5,
      maxSeconds: 20,
      improved: "The library opens at eight o'clock."
    },
    {
      id: "enb1u6q6",
      unit: 6,
      topic: "Favorite place",
      text: "What is your favorite place in the city?",
      audio: "audio/oral-practice/unit-6/question-06.mp3?v=20260715-u6coach",
      frames: [
        "My favorite place is the ______.",
        "My favorite place is the ______ because it is ______.",
        "I like the ______ because it is ______."
      ],
      vocabulary: ["library", "park", "cafe", "restaurant", "movie theater", "quiet", "clean", "safe", "modern", "beautiful", "friendly"],
      grammar: "Use because it is + adjective to give one simple reason.",
      checks: [
        { label: "favorite place", terms: ["favorite place", "my favorite", "i like"] },
        { label: "place or adjective", terms: ["library", "park", "cafe", "restaurant", "theater", "quiet", "clean", "safe", "modern", "beautiful", "friendly"] }
      ],
      minWords: 7,
      maxSeconds: 22,
      improved: "My favorite place is the library because it is quiet."
    },
    {
      id: "enb1u6q7",
      unit: 6,
      topic: "Recommendation",
      text: "Recommend one place for a new student.",
      audio: "audio/oral-practice/unit-6/question-07.mp3?v=20260715-u6coach",
      frames: [
        "I recommend the ______ because it is ______.",
        "You can go to the ______. It is ______.",
        "For a new student, I recommend the ______."
      ],
      vocabulary: ["recommend", "new student", "library", "cafe", "park", "quiet", "friendly", "safe", "useful", "near school"],
      grammar: "Use I recommend + place + because + reason.",
      checks: [
        { label: "recommendation", terms: ["recommend", "you can go", "new student"] },
        { label: "reason", terms: ["because", "quiet", "friendly", "safe", "useful", "near", "clean"] }
      ],
      minWords: 7,
      maxSeconds: 24,
      improved: "I recommend the cafe because it is friendly and near school."
    },
    {
      id: "enb1u6q8",
      unit: 6,
      topic: "Neighborhood guide",
      text: "Describe your neighborhood in three short sentences.",
      audio: "audio/oral-practice/unit-6/question-08.mp3?v=20260715-u6coach",
      frames: [
        "There is a ______ near my house. It is ______ the ______. I recommend it because it is ______.",
        "My neighborhood is ______. There are ______. My favorite place is the ______ because ______."
      ],
      vocabulary: ["there is", "there are", "near", "next to", "across from", "library", "park", "cafe", "safe", "quiet", "friendly", "recommend"],
      grammar: "Combine one place, one location, and one recommendation in short simple sentences.",
      checks: [
        { label: "existence", terms: ["there is", "there are"] },
        { label: "location", terms: ["near", "next to", "across from", "between", "left", "right"] },
        { label: "recommendation or adjective", terms: ["recommend", "favorite", "safe", "quiet", "clean", "friendly", "modern"] }
      ],
      minWords: 12,
      maxSeconds: 30,
      improved: "There is a library near my house. It is across from the park. I recommend it because it is quiet."
    }
  ]
};
