window.JaraLinguaOralUnitConfig = {
  apiPath: "/api/french8/pronunciation-assessment",
  storageKey: "jaralingua:english-basic-1:oral-unit-2:v1",
  language: "en",
  courseLabel: "English - Basic 1",
  unitLabel: "Unit 2",
  title: "Unit Conversation Coach - Unit 2: In Class",
  interviewer: {
    name: "Alex",
    role: "Conversation Coach"
  },
  attemptQuestionCount: 4,
  maxRecordingSeconds: 30,
  localUrl: "http://127.0.0.1:8021/ingles/basico/unit-conversation-coach-unit-2.html",
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
    questionReadyStatus: "Listen to the question, then answer with classroom language.",
    structureLabel: "Structure {number}",
    lastScore: "Last score: {score}/100. You can practice again or review the report.",
    defaultMicrophone: "Default microphone",
    microphoneLabel: "Microphone {number}",
    levelWaiting: "Waiting",
    summaryLeadHigh: "Very good preparation for a classroom-object conversation.",
    summaryLeadMid: "Good base. Repeat your weak questions to improve accuracy.",
    summaryLeadLow: "You have started. Use the structures and answer with complete short sentences.",
    readinessHigh: "Ready to interact",
    readinessMid: "Good progress",
    readinessLow: "Needs consolidation",
    previousAttempt: "Previous attempt: {score}/100.",
    comparisonDefault: "Practice several times. The questions change and the help can be hidden.",
    metricLabels: [
      ["task", "Task", "Answer to the question"],
      ["development", "Development", "Length and classroom detail"],
      ["clarity", "Clarity", "Approximate Whisper signal"],
      ["fluency", "Fluency", "Duration and continuity"]
    ],
    summaryMessages: {
      taskStrength: "You generally answer the classroom question.",
      taskPriority: "Answer the exact classroom question before adding details.",
      developmentStrength: "Your answers include enough classroom detail.",
      developmentPriority: "Add one detail: object, owner, location, or demonstrative.",
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
      mid: "Good work: repeat the answer with one more classroom detail or a clearer structure.",
      low: "Keep practicing: use one sentence frame and answer with a complete short sentence."
    },
    locale: "en-US"
  },
  unitContext: {
    course: "Basic English Course 1",
    unit: 2,
    title: "In Class",
    grammar: [
      "verb to be in classroom situations",
      "in, on, at, under, next to, near, behind, in front of, between",
      "this, that, these, those",
      "possessive adjectives and owner + 's",
      "who and whose questions"
    ],
    vocabulary: [
      "classroom objects",
      "teacher",
      "student",
      "desk",
      "chair",
      "board",
      "backpack",
      "notebook",
      "pencil",
      "phone",
      "keys",
      "earbuds"
    ],
    communicativeGoals: [
      "identify classroom objects",
      "say where objects are",
      "use near and far demonstratives",
      "say who owns an object",
      "ask one classroom question",
      "describe a classroom briefly"
    ]
  },
  questions: [
    {
      id: "enb1u2q1",
      unit: 2,
      topic: "Classroom objects",
      text: "What classroom object do you have on your desk?",
      audio: "audio/oral-practice/unit-2/question-01.mp3?v=20260712-u2coach",
      frames: [
        "I have a ______ on my desk.",
        "There is a ______ on my desk."
      ],
      vocabulary: ["desk", "notebook", "pencil", "pen", "book", "phone", "keys", "backpack"],
      grammar: "Use a or an for one object: a notebook, a pencil, an eraser.",
      checks: [
        { label: "classroom object", terms: ["notebook", "pencil", "pen", "book", "phone", "keys", "eraser", "backpack"] },
        { label: "location phrase", terms: ["on my desk", "on the desk", "on a desk"] }
      ],
      minWords: 6,
      maxSeconds: 20,
      improved: "I have a [classroom object] on my desk."
    },
    {
      id: "enb1u2q2",
      unit: 2,
      topic: "Location",
      text: "Where is your backpack or bag?",
      audio: "audio/oral-practice/unit-2/question-02.mp3?v=20260712-u2coach",
      frames: [
        "My backpack is ______ the chair.",
        "My bag is ______ the desk."
      ],
      vocabulary: ["under", "on", "next to", "near", "behind", "chair", "desk", "backpack", "bag"],
      grammar: "Use be + location: My backpack is under the chair.",
      checks: [
        { label: "object", terms: ["backpack", "bag"] },
        { label: "location word", terms: ["under", "on", "next to", "near", "behind", "in front of", "between"] }
      ],
      minWords: 5,
      maxSeconds: 18,
      improved: "My backpack is under the chair, next to my desk."
    },
    {
      id: "enb1u2q3",
      unit: 2,
      topic: "This and that",
      text: "Point to one object near you. Is it this or that?",
      audio: "audio/oral-practice/unit-2/question-03.mp3?v=20260712-u2coach",
      frames: [
        "This is my ______.",
        "That is my ______."
      ],
      vocabulary: ["this", "that", "near", "far", "my", "pencil", "notebook", "phone", "book"],
      grammar: "Use this for one object near you. Use that for one object far from you.",
      checks: [
        { label: "demonstrative", terms: ["this", "that"] },
        { label: "one classroom object", terms: ["pencil", "notebook", "phone", "book", "pen", "eraser"] }
      ],
      minWords: 4,
      maxSeconds: 16,
      improved: "This is my [object]. It is near me."
    },
    {
      id: "enb1u2q4",
      unit: 2,
      topic: "These and those",
      text: "Point to two objects. Are they these or those?",
      audio: "audio/oral-practice/unit-2/question-04.mp3?v=20260712-u2coach",
      frames: [
        "These are my ______.",
        "Those are my ______."
      ],
      vocabulary: ["these", "those", "near", "far", "books", "keys", "earbuds", "pencils", "notebooks"],
      grammar: "Use these for plural objects near you. Use those for plural objects far from you. Use are, not is.",
      checks: [
        { label: "plural demonstrative", terms: ["these", "those"] },
        { label: "plural object", terms: ["books", "keys", "earbuds", "pencils", "notebooks", "pens"] }
      ],
      minWords: 4,
      maxSeconds: 16,
      improved: "These are my [plural objects]. They are near me."
    },
    {
      id: "enb1u2q5",
      unit: 2,
      topic: "Possession",
      text: "Whose notebook, pencil, or phone is near you?",
      audio: "audio/oral-practice/unit-2/question-05.mp3?v=20260712-u2coach",
      frames: [
        "This ______ is mine.",
        "It is ______'s ______."
      ],
      vocabulary: ["whose", "mine", "yours", "his", "hers", "Ana's", "Carlos's", "notebook", "pencil", "phone"],
      grammar: "Use whose to ask about the owner. Answer with mine, yours, his, hers, or name + 's.",
      checks: [
        { label: "ownership answer", terms: ["mine", "yours", "his", "hers", "'s", "is my", "is ana", "is carlos"] },
        { label: "classroom object", terms: ["notebook", "pencil", "phone", "pen", "book"] }
      ],
      minWords: 5,
      maxSeconds: 20,
      improved: "This notebook is mine. It is near me."
    },
    {
      id: "enb1u2q6",
      unit: 2,
      topic: "People and location",
      text: "Where is the teacher in the classroom?",
      audio: "audio/oral-practice/unit-2/question-06.mp3?v=20260712-u2coach",
      frames: [
        "The teacher is ______ the board.",
        "The teacher is ______ the teacher's desk."
      ],
      vocabulary: ["teacher", "board", "door", "window", "near", "in front of", "next to", "at", "desk"],
      grammar: "Use The teacher is + location phrase: The teacher is near the board.",
      checks: [
        { label: "person", terms: ["teacher"] },
        { label: "location phrase", terms: ["near", "in front of", "next to", "at", "behind", "board", "desk"] }
      ],
      minWords: 5,
      maxSeconds: 18,
      improved: "The teacher is near the board, in front of the class."
    },
    {
      id: "enb1u2q7",
      unit: 2,
      topic: "Classroom questions",
      text: "Ask one question about an object in the classroom.",
      audio: "audio/oral-practice/unit-2/question-07.mp3?v=20260712-u2coach",
      frames: [
        "Where is the ______?",
        "Whose ______ is this?"
      ],
      vocabulary: ["where", "what", "whose", "this", "that", "notebook", "pencil", "backpack", "phone"],
      grammar: "Use where for location, what for things, and whose for the owner.",
      checks: [
        { label: "question word", terms: ["where", "what", "whose"] },
        { label: "classroom object", terms: ["notebook", "pencil", "backpack", "phone", "book", "pen", "keys"] }
      ],
      minWords: 4,
      maxSeconds: 18,
      improved: "Where is the backpack? / Whose pencil is this?"
    },
    {
      id: "enb1u2q8",
      unit: 2,
      topic: "Classroom description",
      text: "Describe your classroom in three short sentences.",
      audio: "audio/oral-practice/unit-2/question-08.mp3?v=20260712-u2coach",
      frames: [
        "This is my classroom. The ______ is ______. My ______ is ______.",
        "There is a ______. The teacher is ______. These are my ______."
      ],
      vocabulary: ["classroom", "teacher", "students", "board", "desk", "chair", "backpack", "notebook", "under", "on", "near"],
      grammar: "Combine identification, location, and possession: This is..., The object is..., My object is...",
      checks: [
        { label: "classroom context", terms: ["classroom", "teacher", "student", "desk", "board"] },
        { label: "location or possession", terms: ["under", "on", "near", "next to", "my", "mine", "these", "those"] }
      ],
      minWords: 12,
      maxSeconds: 30,
      improved: "This is my classroom. The teacher is near the board. My backpack is under the chair."
    }
  ]
};
