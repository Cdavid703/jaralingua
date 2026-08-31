window.JaraLinguaConversationCoachConfig = {
  id: "english-basic-2-unit-4-leo-weekend",
  apiPath: "/api/english-basic/pronunciation-assessment",
  storageKey: "jaralingua:english-basic-2:conversation-coach:unit-4-leo-weekend:v1",
  language: "en", locale: "en-US", courseLabel: "Basic English Course 2", unitLabel: "Unit 4",
  title: "Weekend Catch-Up with Leo", audioRoot: "audio/unit4/conversation-coach/", attemptQuestionCount: 8, maxRecordingSeconds: 42,
  character: { name: "Leo Rivera", role: "Weekend Conversation Coach", portrait: "../../assets/img/english-basic-2/unit-4-busy-lives/leo-weekend-catch-up-conversation-coach-hero.png", hero: "../../assets/img/english-basic-2/unit-4-busy-lives/leo-weekend-catch-up-conversation-coach-hero.png" },
  audio: {
    welcome: "leo-welcome.mp3", instructions: "task-instructions.mp3",
    needDetail: { file: "reaction-need-detail.mp3", text: "I understand your idea. Add one clear weekend action or a useful expression so your answer sounds more complete." },
    noSpeech: { file: "recovery-no-speech.mp3", text: "I could not hear a complete answer. Check your microphone, move a little closer, and try again." },
    serviceRecovery: { file: "recovery-service.mp3", text: "Your recording is still on this screen, but the transcription service did not answer. You can retry the analysis or record again." },
    closing: { file: "closing.mp3", text: "Nice conversation. Review your private report, then try again and make your weekend story even clearer." }
  },
  selectionGroups: [
    { id: "name", count: 1, questionIds: ["b2u4-q1-name"] }, { id: "feeling", count: 1, questionIds: ["b2u4-q2-feeling"] },
    { id: "weekend", count: 1, questionIds: ["b2u4-q3-weekend"] }, { id: "first", count: 1, questionIds: ["b2u4-q4-first"] },
    { id: "place", count: 1, questionIds: ["b2u4-q5-place"] }, { id: "visitor", count: 1, questionIds: ["b2u4-q6-visitor"] },
    { id: "idiom", count: 1, questionIds: ["b2u4-q7-idiom"] }, { id: "story", count: 1, questionIds: ["b2u4-q8-story"] }
  ],
  mandatoryQuestionIds: [],
  rubric: [
    { key: "task", label: "Task completion", description: "Completes one clear conversation task at a time." },
    { key: "interaction", label: "Interaction", description: "Answers Leo naturally and follows the conversation order." },
    { key: "language", label: "Vocabulary and structures", description: "Uses Unit 4 simple-past actions, expressions, and connectors." },
    { key: "fluency", label: "Fluency", description: "Gives short connected answers without rushing." },
    { key: "clarity", label: "Pronunciation clarity", description: "Uses transcription confidence as an approximate signal." }
  ],
  usefulLanguage: ["My name is ___.", "I’m good, thanks.", "First, I ___.", "Then, I went to ___.", "My cousin came over.", "I was on the go.", "I called it a night early."],
  ui: {
    interactionRecordHelp: "Answer Leo’s one question for this turn.", preflightRecording: "Recording a three-second microphone test. Say: This is my Weekend Catch-Up conversation test.",
    taskStrength: "You completed the current weekend conversation task with relevant information.", interactionStrength: "You responded naturally and followed one clear step at a time.",
    languageStrength: "You used useful Unit 4 past forms, expressions, or connectors.", interactionPriority: "Answer Leo’s current question directly before moving to another idea.",
    languagePriority: "Use Unit 4 language such as woke up, came over, picked up, on the go, called it a night, First, Then, After that, and Finally.",
    summaryLeadComplete: "You completed an eight-turn weekend conversation with Leo, one clear question at a time."
  },
  reactionResponses: [
    { id: "reaction-name", terms: ["my name", "i am", "i'm", "hello", "hi"], file: "reaction-name.mp3", text: "Nice to meet you. I am glad we can talk today." },
    { id: "reaction-feeling", terms: ["good", "fine", "great", "tired", "excited", "okay"], file: "reaction-feeling.mp3", text: "Thanks for sharing. I hope your day goes well." },
    { id: "reaction-weekend", terms: ["weekend", "yes", "no", "busy", "relaxing", "fun"], file: "reaction-weekend.mp3", text: "That sounds like a real weekend. Let us talk about one action at a time." },
    { id: "reaction-first", terms: ["woke", "studied", "cleaned", "cooked", "watched", "played", "visited"], file: "reaction-first.mp3", text: "Good first action. Your story is starting clearly." },
    { id: "reaction-place", terms: ["park", "cafe", "café", "home", "market", "family", "school"], file: "reaction-place.mp3", text: "Nice. I can picture where you went after that." },
    { id: "reaction-visitor", terms: ["came over", "came", "met", "friend", "cousin", "family", "nobody"], file: "reaction-visitor.mp3", text: "That sounds friendly. A visit can make a weekend more interesting." },
    { id: "reaction-idiom", terms: ["on the go", "call it a night", "called it a night"], file: "reaction-idiom.mp3", text: "Great use of the weekend expression. That sounds natural." },
    { id: "reaction-story", terms: ["first", "then", "after that", "finally"], file: "reaction-story.mp3", text: "Well done. Your connectors and weekend details made your story easy to follow." }
  ],
  questions: [
    { id: "b2u4-q1-name", topic: "Friendly start", text: "Hi, I’m Leo. What’s your name?", audio: "question-01-name.mp3", frames: ["Hi, Leo. My name is ___.", "Hello, Leo. I’m ___.", "Nice to meet you. My name is ___."], vocabulary: ["Hi", "Hello", "my name is", "I’m", "Nice to meet you"], grammar: "Use My name is or I’m. This turn has only one task: introduce yourself.", checks: [{ label: "introduction", terms: ["my name", "i am", "i'm", "hello", "hi"] }], unitTerms: ["my name", "I’m"], minWords: 3, maxSeconds: 16, improved: "Hi, Leo. My name is Ana." },
    { id: "b2u4-q2-feeling", topic: "How you are", text: "Nice to meet you. How are you today?", audio: "question-02-how-are-you.mp3", frames: ["I’m good, thanks.", "I’m a little tired today.", "I’m fine and excited to practice."], vocabulary: ["good", "fine", "tired", "excited", "today"], grammar: "Use I’m plus one feeling. Give one short, natural answer.", checks: [{ label: "feeling", terms: ["good", "fine", "tired", "excited", "okay", "great"] }], unitTerms: ["good", "tired", "excited"], minWords: 3, maxSeconds: 18, improved: "I’m good, thanks." },
    { id: "b2u4-q3-weekend", topic: "Weekend bridge", text: "Did you have a busy weekend?", audio: "question-03-busy-weekend.mp3", frames: ["Yes, I did. It was busy.", "No, I didn’t. It was relaxing.", "Yes, I did. It was fun."], vocabulary: ["busy", "relaxing", "fun", "weekend", "yes, I did", "no, I didn’t"], grammar: "Answer yes or no, then add one short description. The past story begins in the next turn.", checks: [{ label: "weekend response", terms: ["yes", "no", "did", "busy", "relaxing", "fun", "weekend"] }], unitTerms: ["busy", "relaxing", "Yes, I did"], minWords: 4, maxSeconds: 20, improved: "Yes, I did. It was busy and fun." },
    { id: "b2u4-q4-first", topic: "First past action", text: "What did you do first on Saturday?", audio: "question-04-first-action.mp3", frames: ["First, I woke up early.", "First, I studied English.", "First, I cleaned my home."], vocabulary: ["woke up", "studied", "cleaned", "cooked", "watched", "played"], grammar: "Begin with First, then use one completed action in the simple past.", checks: [{ label: "First connector", terms: ["first"] }, { label: "past action", terms: ["woke", "studied", "cleaned", "cooked", "watched", "played", "visited"] }], unitTerms: ["First", "woke up", "studied"], minWords: 4, maxSeconds: 22, improved: "First, I woke up early." },
    { id: "b2u4-q5-place", topic: "Next place", text: "Where did you go after that?", audio: "question-05-place.mp3", frames: ["Then, I went to the park.", "After that, I went to a café.", "Then, I visited my family."], vocabulary: ["park", "café", "family home", "market", "outside", "then", "after that"], grammar: "Use Then or After that and name one place or person. Keep one clear idea.", checks: [{ label: "sequence connector", terms: ["then", "after that"] }, { label: "place or visit", terms: ["park", "cafe", "café", "home", "market", "family", "outside", "visited", "went"] }], unitTerms: ["Then", "After that", "park", "café"], minWords: 5, maxSeconds: 25, improved: "Then, I went to the park." },
    { id: "b2u4-q6-visitor", topic: "Friendly visit", text: "Did someone come over during your weekend?", audio: "question-06-visitor.mp3", frames: ["Yes, my cousin came over.", "Yes, my friend came over after lunch.", "No, nobody came over."], vocabulary: ["friend", "cousin", "family", "came over", "after lunch", "nobody"], grammar: "Use came over in the past, or say No, nobody came over. Add one person if you can.", checks: [{ label: "visit answer", terms: ["came over", "came", "nobody", "friend", "cousin", "family"] }], unitTerms: ["came over", "friend", "cousin"], minWords: 4, maxSeconds: 24, improved: "Yes, my cousin came over after lunch." },
    { id: "b2u4-q7-idiom", topic: "Weekend rhythm", text: "Were you on the go all day, or did you call it a night early?", audio: "question-07-idiom.mp3", frames: ["I was on the go all day.", "I called it a night early because I was tired.", "I was on the go, but I called it a night at ten."], vocabulary: ["on the go", "called it a night", "early", "tired", "all day"], grammar: "Choose one weekend expression and personalize it with a reason or time if you can.", checks: [{ label: "Unit 4 idiom", terms: ["on the go", "called it a night", "call it a night"] }], unitTerms: ["on the go", "called it a night"], minWords: 5, maxSeconds: 27, improved: "I called it a night early because I was tired." },
    { id: "b2u4-q8-story", topic: "Complete weekend story", text: "Now tell me your weekend story from beginning to end.", audio: "question-08-final-story.mp3", frames: ["First, I ___. Then, I ___. After that, I ___. Finally, I ___.", "First, I woke up early. Then, I ___. After that, ___. Finally, I called it a night.", "Last weekend was ___. First, ___. Then, ___. After that, ___. Finally, ___."], vocabulary: ["First", "Then", "After that", "Finally", "woke up", "came over", "picked up", "on the go", "called it a night"], grammar: "Use all four connectors. Include one phrasal verb and one idiomatic expression. This is one final story, not several separate answers.", checks: [{ label: "four connectors", terms: ["first", "then", "after that", "finally"], minMatches: 4 }, { label: "phrasal verb", terms: ["woke up", "hung out", "came over", "picked up"] }, { label: "idiomatic expression", terms: ["on the go", "called it a night", "call it a night"] }], unitTerms: ["First", "Then", "After that", "Finally", "woke up", "came over", "on the go"], minWords: 20, maxSeconds: 42, improved: "First, I woke up early. Then, I visited my family. After that, my cousin came over. Finally, I called it a night because I was tired." }
  ]
};
