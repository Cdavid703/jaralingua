window.JaraLinguaConversationCoachConfig = {
  id: "english-basic-2-unit-1-weather-going-out",
  apiPath: "/api/english-basic/pronunciation-assessment",
  storageKey: "jaralingua:english-basic-2:conversation-coach:unit-1-weather-going-out:v1",
  language: "en",
  locale: "en-US",
  courseLabel: "Basic English Course 2",
  unitLabel: "Unit 1",
  title: "Mia's Weather Hangout",
  audioRoot: "audio/unit1/conversation-coach/",
  attemptQuestionCount: 4,
  maxRecordingSeconds: 36,
  localUrl: "http://127.0.0.1:8025/ingles/basico-2/conversation-coach-unit-1-weather-going-out.html",
  character: {
    name: "Mia Parker",
    role: "Weather and Going-Out Conversation Coach",
    portrait: "../../assets/img/english-basic-2/unit-1-going-out/mia-parker-conversation-coach-portrait.webp",
    hero: "../../assets/img/english-basic-2/unit-1-going-out/mia-parker-conversation-coach-hero.webp"
  },
  audio: {
    welcome: "mia-welcome.mp3",
    instructions: "task-instructions.mp3",
    needDetail: {
      file: "reaction-need-detail.mp3",
      text: "I understand the idea. Add one weather word, one action happening now, or one going-out expression so your answer sounds more complete."
    },
    noSpeech: {
      file: "recovery-no-speech.mp3",
      text: "I could not hear a complete answer. Check your microphone, move a little closer, and try again."
    },
    serviceRecovery: {
      file: "recovery-service.mp3",
      text: "Your recording is still on this screen, but the transcription service did not answer. You can retry the analysis or record again."
    },
    closing: {
      file: "closing.mp3",
      text: "Good work. Review your private report, then try again and make your answers sound more natural each time."
    }
  },
  selectionGroups: [
    { id: "weather", count: 1, questionIds: ["b2u1-q1-weather-now", "b2u1-q7-favorite-weather"] },
    { id: "plans", count: 1, questionIds: ["b2u1-q2-going-out", "b2u1-q5-changing-plans"] },
    { id: "activities", count: 1, questionIds: ["b2u1-q3-sports-weather", "b2u1-q4-park-actions", "b2u1-q6-meet-up"] }
  ],
  mandatoryQuestionIds: ["b2u1-q8-ask-mia"],
  rubric: [
    { key: "task", label: "Task completion", description: "Answers the weather, plan, or activity prompt." },
    { key: "interaction", label: "Interaction", description: "Responds naturally and keeps the exchange moving." },
    { key: "language", label: "Vocabulary and structures", description: "Uses Unit 1 weather, present continuous, and going-out language." },
    { key: "fluency", label: "Fluency", description: "Gives a short continuous answer without rushing." },
    { key: "clarity", label: "Pronunciation clarity", description: "Uses transcription confidence as an approximate signal." }
  ],
  usefulLanguage: [
    "It's sunny.",
    "It's raining.",
    "It's pouring.",
    "It's windy.",
    "I'm checking the weather.",
    "People are leaving the park.",
    "We're going out later.",
    "We're staying in.",
    "They're meeting up.",
    "The game is called off."
  ],
  ui: {
    interactionRecordHelp: "Ask Mia two friendly questions about weather, sports, or going out.",
    preflightRecording: "Recording a three-second microphone test. Say: This is my weather conversation test.",
    taskStrength: "You answered the weather or going-out task with relevant information.",
    interactionStrength: "You kept the exchange natural and responded to Mia's communicative purpose.",
    languageStrength: "You used useful Unit 1 weather, present continuous, or going-out language.",
    interactionPriority: "Answer Mia directly, then ask one clear question when it is your turn.",
    languagePriority: "Include precise Unit 1 language such as It's raining, I'm checking, going out, staying in, meeting up, or called off.",
    summaryLeadComplete: "You completed a balanced four-turn weather and going-out conversation with Mia."
  },
  reactionResponses: [
    {
      id: "reaction-rain",
      terms: ["rain", "raining", "rainy", "pouring", "stormy", "storm", "umbrella"],
      file: "reaction-rainy-plan.mp3",
      text: "That sounds realistic. Rainy or stormy weather often changes outdoor plans, so your answer fits a normal conversation."
    },
    {
      id: "reaction-sun",
      terms: ["sunny", "hot", "warm", "really hot", "boiling"],
      file: "reaction-sunny-plan.mp3",
      text: "Nice. Sunny or warm weather is a natural reason to go out, play, walk, or meet up with friends."
    },
    {
      id: "reaction-cold",
      terms: ["cold", "freezing", "snow", "windy", "wind"],
      file: "reaction-cold-windy.mp3",
      text: "Good. Cold or windy weather can affect the plan, so connecting it to staying in or changing activities sounds natural."
    },
    {
      id: "reaction-sport",
      terms: ["soccer", "football", "basketball", "running", "swimming", "cycling", "yoga", "exercise", "play", "playing", "go running", "do yoga"],
      file: "reaction-sport-choice.mp3",
      text: "Good choice. Matching the activity to the weather makes your answer more specific and more conversational."
    },
    {
      id: "reaction-stay-in",
      terms: ["stay in", "staying in", "stay home", "at home", "inside"],
      file: "reaction-stay-in.mp3",
      text: "That makes sense. Staying in is a very natural choice when the weather is uncomfortable or plans change."
    },
    {
      id: "reaction-meet-up",
      terms: ["go out", "going out", "meet up", "meeting up", "come over", "hang out", "cafe", "park"],
      file: "reaction-meet-up.mp3",
      text: "Good. Those going-out expressions sound friendly and useful for a casual plan with someone else."
    },
    {
      id: "reaction-now",
      terms: ["am checking", "i'm checking", "is waiting", "are walking", "are playing", "are leaving", "are changing", "is raining", "are meeting"],
      file: "reaction-present-continuous.mp3",
      text: "Good. You are describing actions happening now, so the present continuous fits this conversation well."
    }
  ],
  interactionResponses: [
    {
      id: "mia-weather",
      terms: ["weather", "how is the weather", "what's the weather", "what is the weather", "is it raining", "is it sunny", "is it cloudy"],
      file: "answer-weather.mp3",
      text: "Right now, it's cloudy and a little windy. I'm checking the weather because I don't want our plan to get rained out."
    },
    {
      id: "mia-sport",
      terms: ["sport", "sports", "activity", "play", "playing", "running", "soccer", "basketball", "exercise"],
      file: "answer-sport.mp3",
      text: "For this weather, I like going for a walk or doing light exercise. If it starts pouring, I stay in and stretch at home."
    },
    {
      id: "mia-going-out",
      terms: ["go out", "going out", "meet up", "staying in", "stay in", "plan", "plans", "outside", "hang out"],
      file: "answer-going-out.mp3",
      text: "I like going out when it's sunny, but today I'm staying in for a while. Later, I may meet up with a friend at a cafe."
    }
  ],
  defaultInteractionResponse: {
    file: "answer-generic.mp3",
    text: "Good question. I usually check the weather first, then I choose a simple plan: go out if it is nice, or stay in if it is raining hard."
  },
  questions: [
    {
      id: "b2u1-q1-weather-now",
      topic: "Weather now",
      text: "What's the weather like where you are today, and what are people doing?",
      audio: "question-01-weather-now.mp3",
      frames: ["It's ______ today, and people are ______.", "The weather is ______. People are ______ right now.", "It's ______, so people are ______."],
      vocabulary: ["sunny", "cloudy", "windy", "rainy", "raining", "pouring", "stormy", "walking", "waiting", "leaving", "checking the weather"],
      grammar: "Use It's plus weather. Use be + verb-ing for actions happening now: People are walking.",
      checks: [
        { label: "weather description", terms: ["sunny", "cloudy", "windy", "rainy", "raining", "pouring", "stormy", "hot", "cold", "freezing"] },
        { label: "action happening now", terms: ["are", "is", "am", "walking", "waiting", "leaving", "checking", "playing", "wearing", "going"] }
      ],
      unitTerms: ["it's", "weather", "raining", "pouring", "cloudy", "windy", "are walking", "are checking", "right now"],
      minWords: 10,
      maxSeconds: 28,
      improved: "It's cloudy today, and people are walking fast because it looks like rain."
    },
    {
      id: "b2u1-q2-going-out",
      topic: "Going out or staying in",
      text: "Are you going out today or staying in? Why?",
      audio: "question-02-going-out.mp3",
      frames: ["I'm ______ today because ______.", "I'm not going out because ______.", "I'm staying in, but later I'm ______."],
      vocabulary: ["going out", "staying in", "meeting up", "coming over", "because", "rainy", "sunny", "cold", "really hot", "weather"],
      grammar: "Use present continuous for the plan you are describing now: I'm staying in. I'm meeting up with friends.",
      checks: [
        { label: "going-out choice", terms: ["going out", "staying in", "stay in", "going", "not going", "meeting up", "come over"] },
        { label: "reason", terms: ["because", "so", "weather", "rain", "sunny", "cloudy", "cold", "hot", "windy"] }
      ],
      unitTerms: ["going out", "staying in", "meeting up", "come over", "because", "weather"],
      minWords: 9,
      maxSeconds: 28,
      improved: "I'm staying in today because it's raining, but later I'm meeting up with a friend at a cafe."
    },
    {
      id: "b2u1-q3-sports-weather",
      topic: "Sports and weather",
      text: "What sport or activity is good for this weather?",
      audio: "question-03-sports-weather.mp3",
      frames: ["This weather is good for ______ because ______.", "When it's ______, I like ______.", "I think ______ is good today because ______."],
      vocabulary: ["play soccer", "play basketball", "go running", "go cycling", "go swimming", "do yoga", "walk", "exercise", "fresh air"],
      grammar: "Use play for ball sports, go + -ing for movement activities, and do for yoga or exercise.",
      checks: [
        { label: "sport or activity", terms: ["soccer", "football", "basketball", "running", "cycling", "swimming", "yoga", "walk", "exercise", "sport"] },
        { label: "weather reason", terms: ["because", "sunny", "cloudy", "windy", "raining", "hot", "cold", "weather"] }
      ],
      unitTerms: ["play soccer", "go running", "go cycling", "go swimming", "do yoga", "because", "weather"],
      minWords: 9,
      maxSeconds: 28,
      improved: "This weather is good for walking because it's cloudy, but it isn't raining right now."
    },
    {
      id: "b2u1-q4-park-actions",
      topic: "Actions happening now",
      text: "Imagine a park right now. What are people doing there?",
      audio: "question-04-park-actions.mp3",
      frames: ["People are ______, and some people are ______.", "A few people are ______ because it's ______.", "They are ______, but the weather is ______."],
      vocabulary: ["walking", "running", "playing soccer", "sitting", "waiting", "leaving", "checking the weather", "wearing jackets", "opening umbrellas"],
      grammar: "Use plural people + are + verb-ing: People are walking. Some people are leaving.",
      checks: [
        { label: "present continuous action", terms: ["are walking", "are running", "are playing", "are sitting", "are waiting", "are leaving", "are checking", "are wearing", "are opening"] },
        { label: "park or weather context", terms: ["park", "weather", "sunny", "cloudy", "windy", "raining", "umbrellas", "jackets"] }
      ],
      unitTerms: ["people are", "some people are", "walking", "running", "playing", "leaving", "checking the weather"],
      minWords: 10,
      maxSeconds: 30,
      improved: "People are walking in the park, and some people are opening umbrellas because it's raining."
    },
    {
      id: "b2u1-q5-changing-plans",
      topic: "Changing plans",
      text: "The weather suddenly changes. What are you changing in your plan?",
      audio: "question-05-changing-plans.mp3",
      frames: ["We're changing the plan because ______.", "We're not ______ now. We're ______ instead.", "The game is called off, so we're ______."],
      vocabulary: ["changing the plan", "called off", "staying in", "meeting up", "coming over", "going to a cafe", "pouring", "stormy", "windy"],
      grammar: "Use we're + verb-ing for a plan changing now. Called off means canceled.",
      checks: [
        { label: "plan change", terms: ["changing", "change", "not going", "instead", "called off", "cancel", "staying in", "meeting up"] },
        { label: "weather cause", terms: ["because", "rain", "raining", "pouring", "stormy", "windy", "weather", "cold", "hot"] }
      ],
      unitTerms: ["changing the plan", "called off", "staying in", "meeting up", "coming over", "because"],
      minWords: 10,
      maxSeconds: 30,
      improved: "We're changing the plan because it's pouring. The soccer game is called off, so we're meeting up at a cafe."
    },
    {
      id: "b2u1-q6-meet-up",
      topic: "Inviting a friend",
      text: "You want to meet up with a friend after class. What do you say?",
      audio: "question-06-meet-up.mp3",
      frames: ["Do you want to ______ after class?", "It's ______ today. Let's ______.", "I'm ______ after class. Do you want to ______?"],
      vocabulary: ["meet up", "go out", "come over", "go to the park", "go to a cafe", "play soccer", "stay in", "after class"],
      grammar: "Use Do you want to plus base verb for a friendly invitation.",
      checks: [
        { label: "invitation", terms: ["do you want", "let's", "can you", "would you like", "want to"] },
        { label: "going-out idea", terms: ["meet up", "go out", "come over", "park", "cafe", "play", "stay in", "after class"] }
      ],
      unitTerms: ["meet up", "go out", "come over", "let's", "after class", "do you want to"],
      minWords: 8,
      maxSeconds: 26,
      improved: "It's sunny today. Do you want to meet up after class and go to the park?"
    },
    {
      id: "b2u1-q7-favorite-weather",
      topic: "Favorite weather",
      text: "What weather do you like, and what do you usually do in that weather?",
      audio: "question-07-favorite-weather.mp3",
      frames: ["I like ______ weather because ______.", "When it's ______, I usually ______.", "I like it when it's ______, so I ______."],
      vocabulary: ["sunny weather", "cloudy weather", "rainy days", "cold weather", "warm weather", "usually", "walk", "play soccer", "stay in", "go out"],
      grammar: "Use simple present for habits: I usually walk. Use It's for weather.",
      checks: [
        { label: "weather preference", terms: ["like", "prefer", "sunny", "cloudy", "rainy", "cold", "warm", "hot", "windy"] },
        { label: "usual activity", terms: ["usually", "always", "sometimes", "walk", "play", "go out", "stay in", "run", "watch", "listen"] }
      ],
      unitTerms: ["i like", "when it's", "usually", "go out", "stay in", "play soccer", "weather"],
      minWords: 10,
      maxSeconds: 30,
      improved: "I like cloudy weather because it isn't too hot. When it's cloudy, I usually go out for a walk."
    },
    {
      id: "b2u1-q8-ask-mia",
      topic: "Ask Mia",
      text: "Now ask me two friendly questions about the weather, sports, or going out.",
      audio: "question-08-ask-mia.mp3",
      interaction: true,
      frames: ["What's the weather like for you today?", "Are you going out or staying in?", "What sport do you like in this weather?", "Are you meeting up with someone later?"],
      vocabulary: ["what's", "are you", "do you like", "going out", "staying in", "meeting up", "sport", "weather"],
      grammar: "Ask two clear questions. Use What's for weather, Are you for current plans, and Do you like for preferences.",
      checks: [
        { label: "two question signals", type: "questionStarters", minMatches: 2 },
        { label: "unit topic", terms: ["weather", "raining", "sunny", "sport", "go out", "going out", "stay in", "staying in", "meet up", "meeting up"] }
      ],
      unitTerms: ["what's the weather", "are you going out", "do you like", "sport", "meeting up", "staying in"],
      minWords: 9,
      maxSeconds: 30,
      improved: "What's the weather like for you today? Are you going out or staying in later?"
    }
  ]
};
