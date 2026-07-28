window.JaraLinguaConversationCoachConfig = {
  id: "english-basic-2-unit-2-shopping-ella",
  apiPath: "/api/english-basic/pronunciation-assessment",
  storageKey: "jaralingua:english-basic-2:conversation-coach:unit-2-shopping-ella:v1",
  language: "en",
  locale: "en-US",
  courseLabel: "Basic English Course 2",
  unitLabel: "Unit 2",
  title: "Shopping with Ella",
  audioRoot: "audio/unit2/conversation-coach/",
  attemptQuestionCount: 5,
  maxRecordingSeconds: 38,
  localUrl: "http://127.0.0.1:8025/ingles/basico-2/conversation-coach-unit-2-shopping-ella.html",
  character: {
    name: "Ella Brooks",
    role: "Shopping and Going-Out Conversation Coach",
    portrait: "../../assets/img/english-basic-2/unit-2-shopping-experiences/ella-brooks-conversation-coach-portrait.webp",
    hero: "../../assets/img/english-basic-2/unit-2-shopping-experiences/ella-brooks-conversation-coach-hero.webp"
  },
  audio: {
    welcome: "ella-welcome.mp3",
    instructions: "task-instructions.mp3",
    needDetail: {
      file: "reaction-need-detail.mp3",
      text: "I understand the idea. Add one place, one clothing word, or one reason so your answer sounds more complete."
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
      text: "Nice conversation. Review your private report, then try again and make your shopping answers sound more natural each time."
    }
  },
  selectionGroups: [
    { id: "warmup", count: 1, questionIds: ["b2u2-q1-name-plan", "b2u2-q2-after-class"] },
    { id: "place", count: 1, questionIds: ["b2u2-q3-place-choice"] },
    { id: "activity", count: 1, questionIds: ["b2u2-q4-mall-activity"] },
    { id: "shopping", count: 1, questionIds: ["b2u2-q5-casual-clothes", "b2u2-q6-need-to-buy", "b2u2-q7-store-choice"] }
  ],
  mandatoryQuestionIds: ["b2u2-q8-ask-ella"],
  rubric: [
    { key: "task", label: "Task completion", description: "Answers the plan, place, clothing, or shopping prompt." },
    { key: "interaction", label: "Interaction", description: "Responds naturally and keeps the exchange moving." },
    { key: "language", label: "Vocabulary and structures", description: "Uses Unit 2 shopping language, demonstratives, and useful present forms." },
    { key: "fluency", label: "Fluency", description: "Gives a short continuous answer without rushing." },
    { key: "clarity", label: "Pronunciation clarity", description: "Uses transcription confidence as an approximate signal." }
  ],
  usefulLanguage: [
    "Nice to meet you.",
    "After class, I usually...",
    "I prefer the mall because...",
    "I would like to look at clothes.",
    "For a casual afternoon, I usually wear...",
    "I need to buy...",
    "This jacket is near us.",
    "Those sunglasses are over there.",
    "It is on sale.",
    "It is a good deal."
  ],
  ui: {
    interactionRecordHelp: "Ask Ella two friendly questions about the plan, the place, clothes, or prices.",
    preflightRecording: "Recording a three-second microphone test. Say: This is my shopping conversation test.",
    taskStrength: "You answered the shopping or going-out task with relevant information.",
    interactionStrength: "You kept the exchange natural and responded to Ella's communicative purpose.",
    languageStrength: "You used useful Unit 2 shopping, clothing, demonstrative, or price language.",
    interactionPriority: "Answer Ella directly, then ask one clear question when it is your turn.",
    languagePriority: "Include precise Unit 2 language such as mall, clothes, jacket, sunglasses, this, those, on sale, or good deal.",
    summaryLeadComplete: "You completed a connected five-turn shopping and going-out conversation with Ella."
  },
  reactionResponses: [
    {
      id: "reaction-friendly-start",
      terms: ["nice to meet you", "my name", "i am", "i'm", "ready"],
      file: "reaction-friendly-start.mp3",
      text: "Great. That is a friendly way to begin, and now the conversation can move naturally into the plan."
    },
    {
      id: "reaction-mall",
      terms: ["mall", "shopping center", "store", "stores", "clothes"],
      file: "reaction-mall.mp3",
      text: "Good choice. The mall connects naturally with clothes, snacks, walking around, and simple shopping language."
    },
    {
      id: "reaction-cafe",
      terms: ["cafe", "coffee", "snack", "drink", "eat"],
      file: "reaction-cafe.mp3",
      text: "That sounds relaxed. A small cafe is a natural place to talk after class before looking at stores."
    },
    {
      id: "reaction-clothes",
      terms: ["jeans", "jacket", "shirt", "t-shirt", "sweater", "shoes", "sunglasses", "hat", "wear"],
      file: "reaction-clothes.mp3",
      text: "Nice. Your answer uses clothing vocabulary, so it fits the shopping topic well."
    },
    {
      id: "reaction-buy",
      terms: ["buy", "need", "looking for", "want", "take it", "try on"],
      file: "reaction-buy.mp3",
      text: "Good. Saying what you need or want to buy makes the conversation more practical."
    },
    {
      id: "reaction-price",
      terms: ["cheap", "expensive", "affordable", "good deal", "on sale", "costs", "price", "eighty thousand"],
      file: "reaction-price.mp3",
      text: "Good. Price words help you make a real shopping decision, not just name an item."
    },
    {
      id: "reaction-demonstratives",
      terms: ["this", "that", "these", "those", "near", "over there"],
      file: "reaction-demonstratives.mp3",
      text: "Excellent. You used demonstratives to point to things in the store, and that sounds very natural."
    }
  ],
  interactionResponses: [
    {
      id: "ella-place",
      terms: ["mall", "cafe", "where", "place", "prefer", "go"],
      file: "answer-place.mp3",
      text: "I prefer the mall first because we can walk around, look at clothes, and then get something to drink."
    },
    {
      id: "ella-clothes",
      terms: ["wear", "wearing", "clothes", "jacket", "jeans", "shirt", "sweater", "shoes"],
      file: "answer-clothes.mp3",
      text: "For a casual afternoon, I usually wear jeans, comfortable shoes, and a light jacket."
    },
    {
      id: "ella-buy",
      terms: ["buy", "need", "looking for", "sunglasses", "price", "deal", "sale"],
      file: "answer-shopping.mp3",
      text: "Today I am looking for sunglasses. If they are on sale and the price is good, I may buy them."
    },
    {
      id: "ella-plan",
      terms: ["after class", "classmates", "plan", "going out", "snack", "walk"],
      file: "answer-plan.mp3",
      text: "After class, I like a simple plan: walk around for a while, look at one or two stores, and maybe buy a snack."
    }
  ],
  defaultInteractionResponse: {
    file: "answer-generic.mp3",
    text: "Good question. I like simple plans after class: a short walk, a small cafe, and maybe one store if I need something."
  },
  questions: [
    {
      id: "b2u2-q1-name-plan",
      topic: "Friendly start",
      text: "Hi, I'm Ella. What's your name, and are you ready for a short English chat after class?",
      audio: "question-01-name-plan.mp3",
      frames: ["Hi, Ella. My name is ______, and yes, I'm ready.", "Nice to meet you, Ella. I'm ______. I can try.", "Hi, I'm ______. I'm ready for a short chat."],
      vocabulary: ["Hi", "Nice to meet you", "my name is", "I'm ready", "after class", "short chat"],
      grammar: "Use My name is or I'm to introduce yourself. Add one short answer about being ready.",
      checks: [
        { label: "friendly introduction", terms: ["my name", "i am", "i'm", "nice to meet", "hi"] },
        { label: "readiness or response", terms: ["ready", "yes", "sure", "can", "try", "chat"] }
      ],
      unitTerms: ["my name", "i'm", "ready", "after class", "chat"],
      minWords: 8,
      maxSeconds: 24,
      improved: "Hi, Ella. My name is David, and yes, I'm ready for a short English chat after class."
    },
    {
      id: "b2u2-q2-after-class",
      topic: "After class",
      text: "After class, do you usually go home, meet friends, or go out for a while?",
      audio: "question-02-after-class.mp3",
      frames: ["After class, I usually ______.", "I usually ______ because ______.", "Sometimes I ______, but today I want to ______."],
      vocabulary: ["go home", "meet friends", "go out", "for a while", "usually", "sometimes", "after class"],
      grammar: "Use simple present for habits: I usually go home. I sometimes meet friends.",
      checks: [
        { label: "after-class choice", terms: ["go home", "meet friends", "go out", "stay", "walk", "cafe", "mall"] },
        { label: "habit or reason", terms: ["usually", "sometimes", "because", "after class", "today"] }
      ],
      unitTerms: ["after class", "usually", "go home", "meet friends", "go out"],
      minWords: 9,
      maxSeconds: 28,
      improved: "After class, I usually go home, but today I want to go out for a while with classmates."
    },
    {
      id: "b2u2-q3-place-choice",
      topic: "Choosing a place",
      text: "Some classmates are going out after class. We can go to a mall or a small cafe. Which place do you prefer, and why?",
      audio: "question-03-place-choice.mp3",
      frames: ["I prefer the ______ because ______.", "Let's go to the ______ because ______.", "I like the ______ more because ______."],
      vocabulary: ["mall", "small cafe", "shopping center", "relaxed", "comfortable", "look at clothes", "buy a snack", "walk around"],
      grammar: "Use I prefer or Let's go to. Add because plus one reason.",
      checks: [
        { label: "place choice", terms: ["mall", "cafe", "shopping center", "store"] },
        { label: "reason", terms: ["because", "comfortable", "relaxed", "clothes", "snack", "walk", "drink"] }
      ],
      unitTerms: ["i prefer", "mall", "cafe", "because", "look at clothes", "buy a snack"],
      minWords: 11,
      maxSeconds: 32,
      improved: "I prefer the mall because we can walk around, look at clothes, and buy a snack."
    },
    {
      id: "b2u2-q4-mall-activity",
      topic: "Activity at the mall",
      text: "If we go to the mall, what would you like to do there: look at clothes, buy a snack, or just walk around?",
      audio: "question-04-mall-activity.mp3",
      frames: ["I would like to ______ because ______.", "At the mall, I want to ______.", "First, I want to ______. Then, I can ______."],
      vocabulary: ["look at clothes", "buy a snack", "walk around", "go to a store", "try on a jacket", "drink coffee", "comfortable"],
      grammar: "Use would like to plus base verb: I would like to look at clothes.",
      checks: [
        { label: "mall activity", terms: ["look at clothes", "buy a snack", "walk around", "store", "try on", "coffee", "drink"] },
        { label: "simple development", terms: ["because", "first", "then", "want", "would like"] }
      ],
      unitTerms: ["would like to", "look at clothes", "buy a snack", "walk around", "try on"],
      minWords: 10,
      maxSeconds: 30,
      improved: "I would like to look at clothes first, and then I can buy a snack because I am hungry."
    },
    {
      id: "b2u2-q5-casual-clothes",
      topic: "Casual clothes",
      text: "For a casual afternoon at the mall, what do you usually wear?",
      audio: "question-05-casual-clothes.mp3",
      frames: ["For a casual afternoon, I usually wear ______.", "I usually wear ______ and ______.", "I like wearing ______ because ______."],
      vocabulary: ["jeans", "T-shirt", "jacket", "sweater", "comfortable shoes", "sunglasses", "casual", "comfortable"],
      grammar: "Use usually wear for habits: I usually wear jeans. Use wearing after like: I like wearing jeans.",
      checks: [
        { label: "clothing item", terms: ["jeans", "shirt", "t-shirt", "jacket", "sweater", "shoes", "sunglasses", "hat", "pants"] },
        { label: "habit or preference", terms: ["usually", "wear", "wearing", "like", "prefer", "comfortable"] }
      ],
      unitTerms: ["usually wear", "jeans", "jacket", "sweater", "sunglasses", "comfortable"],
      minWords: 9,
      maxSeconds: 30,
      improved: "For a casual afternoon at the mall, I usually wear jeans, comfortable shoes, and a light jacket."
    },
    {
      id: "b2u2-q6-need-to-buy",
      topic: "Need to buy",
      text: "Do you need to buy anything today, like a jacket, shoes, sunglasses, or something else?",
      audio: "question-06-need-to-buy.mp3",
      frames: ["Yes, I need to buy ______ because ______.", "No, I don't need to buy anything. I'm just ______.", "Maybe I need ______, but first I want to ______."],
      vocabulary: ["need to buy", "jacket", "shoes", "sunglasses", "watch", "bag", "just looking", "try on", "on sale"],
      grammar: "Use need to buy plus the item: I need to buy shoes. Use don't need for negative answers.",
      checks: [
        { label: "buying need", terms: ["need to buy", "need", "buy", "looking for", "just looking", "don't need"] },
        { label: "shopping item", terms: ["jacket", "shoes", "sunglasses", "watch", "bag", "shirt", "sweater", "jeans"] }
      ],
      unitTerms: ["need to buy", "just looking", "jacket", "shoes", "sunglasses", "try on"],
      minWords: 10,
      maxSeconds: 30,
      improved: "Yes, I need to buy sunglasses because my old sunglasses are broken."
    },
    {
      id: "b2u2-q7-store-choice",
      topic: "Store decision",
      text: "Imagine we are in a store. This jacket is near us, and those sunglasses are over there. The jacket is on sale for eighty thousand pesos. Which item do you like, and is the price a good deal?",
      audio: "question-07-store-choice.mp3",
      frames: ["I like this ______ because ______.", "I prefer those ______ because ______.", "The price is ______, so I would ______."],
      vocabulary: ["this jacket", "those sunglasses", "near us", "over there", "on sale", "eighty thousand pesos", "cheap", "expensive", "a good deal"],
      grammar: "Use this for one item near you. Use those for plural items far from you. Add a price opinion.",
      checks: [
        { label: "demonstrative choice", terms: ["this jacket", "those sunglasses", "this", "those", "jacket", "sunglasses"] },
        { label: "price opinion", terms: ["cheap", "expensive", "good deal", "on sale", "price", "eighty thousand", "affordable"] }
      ],
      unitTerms: ["this jacket", "those sunglasses", "on sale", "eighty thousand pesos", "good deal", "expensive"],
      minWords: 13,
      maxSeconds: 38,
      improved: "I like this jacket because it is near us and it is on sale. Eighty thousand pesos is a good deal for me."
    },
    {
      id: "b2u2-q8-ask-ella",
      topic: "Ask Ella",
      text: "Now ask me two friendly questions about the plan, the place, clothes, or prices.",
      audio: "question-08-ask-ella.mp3",
      interaction: true,
      frames: ["Where do you want to go after class?", "What do you usually wear to the mall?", "Do you need to buy anything today?", "Is this jacket a good deal?"],
      vocabulary: ["where", "what", "do you", "usually wear", "need to buy", "good deal", "after class", "mall"],
      grammar: "Ask two clear questions. Use Where, What, Do you, or Is this.",
      checks: [
        { label: "two question signals", type: "questionStarters", minMatches: 2 },
        { label: "unit topic", terms: ["plan", "place", "mall", "cafe", "clothes", "wear", "buy", "price", "good deal", "jacket", "sunglasses"] }
      ],
      unitTerms: ["where do you", "what do you", "do you need", "usually wear", "good deal", "after class"],
      minWords: 10,
      maxSeconds: 32,
      improved: "Where do you want to go after class? What do you usually wear to the mall?"
    }
  ]
};
