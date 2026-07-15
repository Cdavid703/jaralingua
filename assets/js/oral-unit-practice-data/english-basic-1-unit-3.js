window.JaraLinguaOralUnitConfig = {
  apiPath: "/api/french8/pronunciation-assessment",
  storageKey: "jaralingua:english-basic-1:oral-unit-3:v1",
  language: "en",
  courseLabel: "English - Basic 1",
  unitLabel: "Unit 3",
  title: "Unit Conversation Coach - Unit 3: Favorite People",
  interviewer: {
    name: "Alex",
    role: "Conversation Coach"
  },
  attemptQuestionCount: 4,
  maxRecordingSeconds: 30,
  localUrl: "http://127.0.0.1:8021/ingles/basico/unit-conversation-coach-unit-3.html",
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
    questionReadyStatus: "Listen to the question, then answer with people-description language.",
    structureLabel: "Structure {number}",
    lastScore: "Last score: {score}/100. You can practice again or review the report.",
    defaultMicrophone: "Default microphone",
    microphoneLabel: "Microphone {number}",
    levelWaiting: "Waiting",
    summaryLeadHigh: "Very good preparation for a favorite-person conversation.",
    summaryLeadMid: "Good base. Repeat your weak questions to improve description accuracy.",
    summaryLeadLow: "You have started. Use the structures and answer with complete short sentences.",
    readinessHigh: "Ready to interact",
    readinessMid: "Good progress",
    readinessLow: "Needs consolidation",
    previousAttempt: "Previous attempt: {score}/100.",
    comparisonDefault: "Practice several times. The questions change and the help can be hidden.",
    metricLabels: [
      ["task", "Task", "Answer to the question"],
      ["development", "Development", "People and description detail"],
      ["clarity", "Clarity", "Approximate Whisper signal"],
      ["fluency", "Fluency", "Duration and continuity"]
    ],
    summaryMessages: {
      taskStrength: "You generally answer the favorite-people question.",
      taskPriority: "Answer the exact question before adding extra details.",
      developmentStrength: "Your answers include useful people-description details.",
      developmentPriority: "Add one detail: relationship, age, adjective, physical feature, or reason.",
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
      mid: "Good work: repeat the answer with one more people-description detail or a clearer structure.",
      low: "Keep practicing: use one sentence frame and answer with a complete short sentence."
    },
    locale: "en-US"
  },
  unitContext: {
    course: "Basic English Course 1",
    unit: 3,
    title: "Favorite People",
    grammar: [
      "verb to be for identity and adjectives",
      "has and have for physical features",
      "possessive adjectives my, his, her, their",
      "yes/no questions with be",
      "simple third-person likes"
    ],
    vocabulary: [
      "family members",
      "favorite person",
      "appearance adjectives",
      "personality adjectives",
      "hair",
      "eyes",
      "glasses",
      "photo"
    ],
    communicativeGoals: [
      "introduce a favorite person",
      "describe personality and appearance",
      "talk about family relationships",
      "ask yes/no questions about people",
      "describe a family photo",
      "give a simple reason"
    ]
  },
  questions: [
    {
      id: "enb1u3q1",
      unit: 3,
      topic: "Favorite person",
      text: "Who is your favorite person?",
      audio: "audio/oral-practice/unit-3/question-01.mp3?v=20260715-u3coach",
      frames: [
        "My favorite person is my ______.",
        "My favorite person is ______. He is my ______.",
        "My favorite person is ______. She is my ______."
      ],
      vocabulary: ["favorite person", "mother", "father", "sister", "brother", "friend", "teacher", "cousin"],
      grammar: "Use My favorite person is + name or family word.",
      checks: [
        { label: "favorite-person structure", terms: ["favorite person", "my favorite"] },
        { label: "person or relationship", terms: ["mother", "father", "sister", "brother", "friend", "teacher", "cousin", "uncle", "aunt"] }
      ],
      minWords: 5,
      maxSeconds: 18,
      improved: "My favorite person is my [family member]."
    },
    {
      id: "enb1u3q2",
      unit: 3,
      topic: "Identity and relationship",
      text: "What is his or her name, and who is this person?",
      audio: "audio/oral-practice/unit-3/question-02.mp3?v=20260715-u3coach",
      frames: [
        "His name is ______. He is my ______.",
        "Her name is ______. She is my ______."
      ],
      vocabulary: ["his name is", "her name is", "mother", "father", "friend", "sister", "brother", "classmate"],
      grammar: "Use his for a man or boy. Use her for a woman or girl.",
      checks: [
        { label: "name structure", terms: ["his name is", "her name is", "name is"] },
        { label: "relationship", terms: ["mother", "father", "friend", "sister", "brother", "classmate", "cousin", "teacher"] }
      ],
      minWords: 7,
      maxSeconds: 22,
      improved: "Her name is [name]. She is my [relationship]."
    },
    {
      id: "enb1u3q3",
      unit: 3,
      topic: "Personality",
      text: "Describe this person with two personality adjectives.",
      audio: "audio/oral-practice/unit-3/question-03.mp3?v=20260715-u3coach",
      frames: [
        "He is ______ and ______.",
        "She is ______ and ______.",
        "This person is ______ and ______."
      ],
      vocabulary: ["friendly", "kind", "smart", "funny", "serious", "quiet", "helpful", "nice"],
      grammar: "Use be before adjectives: She is friendly. Do not say She has friendly.",
      checks: [
        { label: "be + adjective", terms: ["he is", "she is", "person is", "is"] },
        { label: "personality adjective", minMatches: 1, terms: ["friendly", "kind", "smart", "funny", "serious", "quiet", "helpful", "nice"] }
      ],
      minWords: 5,
      maxSeconds: 18,
      improved: "She is kind and funny."
    },
    {
      id: "enb1u3q4",
      unit: 3,
      topic: "Appearance",
      text: "What does this person look like?",
      audio: "audio/oral-practice/unit-3/question-04.mp3?v=20260715-u3coach",
      frames: [
        "He is ______ and has ______ hair.",
        "She is ______ and has ______ eyes.",
        "This person has ______ hair and ______ eyes."
      ],
      vocabulary: ["tall", "short", "young", "old", "long hair", "short hair", "brown eyes", "black hair", "glasses"],
      grammar: "Use be for general description and has for features: He is tall. He has short hair.",
      checks: [
        { label: "be or has", terms: ["is", "has"] },
        { label: "appearance word", terms: ["tall", "short", "young", "old", "hair", "eyes", "glasses"] }
      ],
      minWords: 7,
      maxSeconds: 22,
      improved: "He is tall and has short hair."
    },
    {
      id: "enb1u3q5",
      unit: 3,
      topic: "Has and have",
      text: "Does this person have long hair, short hair, or glasses?",
      audio: "audio/oral-practice/unit-3/question-05.mp3?v=20260715-u3coach",
      frames: [
        "Yes. He has ______.",
        "Yes. She has ______.",
        "No. He does not have ______. He has ______."
      ],
      vocabulary: ["long hair", "short hair", "curly hair", "straight hair", "glasses", "brown eyes", "black hair"],
      grammar: "Use has for he or she: She has glasses. Use have after does: Does she have glasses?",
      checks: [
        { label: "has or have", terms: ["has", "have"] },
        { label: "physical feature", terms: ["hair", "glasses", "eyes"] }
      ],
      minWords: 5,
      maxSeconds: 20,
      improved: "Yes. She has long hair and glasses."
    },
    {
      id: "enb1u3q6",
      unit: 3,
      topic: "Family photo",
      text: "Who is in your family photo?",
      audio: "audio/oral-practice/unit-3/question-06.mp3?v=20260715-u3coach",
      frames: [
        "In my family photo, there is my ______.",
        "In my family photo, there are my ______.",
        "This is my family photo. These are my ______."
      ],
      vocabulary: ["family photo", "mother", "father", "parents", "grandparents", "sister", "brother", "cousin", "aunt", "uncle"],
      grammar: "Use there is for one person and there are for two or more people.",
      checks: [
        { label: "family photo context", terms: ["family photo", "photo", "picture"] },
        { label: "family word", terms: ["mother", "father", "parents", "grandparents", "sister", "brother", "cousin", "aunt", "uncle"] }
      ],
      minWords: 7,
      maxSeconds: 24,
      improved: "In my family photo, there are my parents and my sister."
    },
    {
      id: "enb1u3q7",
      unit: 3,
      topic: "Yes/no questions",
      text: "Ask one yes-or-no question about a person.",
      audio: "audio/oral-practice/unit-3/question-07.mp3?v=20260715-u3coach",
      frames: [
        "Is he ______?",
        "Is she your ______?",
        "Are they your ______?"
      ],
      vocabulary: ["is he", "is she", "are they", "friendly", "tall", "your mother", "your father", "your parents", "your grandparents"],
      grammar: "Move be before the subject: She is friendly becomes Is she friendly?",
      checks: [
        { label: "yes/no question", terms: ["is he", "is she", "are they"] },
        { label: "person detail", terms: ["friendly", "tall", "short", "mother", "father", "parents", "grandparents", "sister", "brother"] }
      ],
      minWords: 3,
      maxSeconds: 16,
      improved: "Is she your mother? / Is he friendly?"
    },
    {
      id: "enb1u3q8",
      unit: 3,
      topic: "Favorite-person description",
      text: "Describe your favorite person in three short sentences.",
      audio: "audio/oral-practice/unit-3/question-08.mp3?v=20260715-u3coach",
      frames: [
        "My favorite person is my ______. His name is ______. He is ______ and has ______.",
        "My favorite person is my ______. Her name is ______. She is ______ and has ______."
      ],
      vocabulary: ["favorite person", "his name is", "her name is", "friendly", "kind", "smart", "long hair", "short hair", "glasses", "important"],
      grammar: "Combine identity, relationship, adjective, and one physical feature.",
      checks: [
        { label: "favorite person", terms: ["favorite person", "my favorite"] },
        { label: "description", terms: ["is", "has", "friendly", "kind", "smart", "funny", "hair", "glasses", "eyes"] },
        { label: "relationship", terms: ["mother", "father", "sister", "brother", "friend", "teacher", "cousin"] }
      ],
      minWords: 12,
      maxSeconds: 30,
      improved: "My favorite person is my sister. Her name is Sofia. She is kind and has long hair."
    }
  ]
};
