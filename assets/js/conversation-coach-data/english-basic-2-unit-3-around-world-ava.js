window.JaraLinguaConversationCoachConfig = {
  id: "english-basic-2-unit-3-around-world-ava",
  apiPath: "/api/english-basic/pronunciation-assessment",
  storageKey: "jaralingua:english-basic-2:conversation-coach:unit-3-around-world-ava:v1",
  language: "en", locale: "en-US", courseLabel: "Basic English Course 2", unitLabel: "Unit 3",
  title: "Around the World with Ava", audioRoot: "audio/unit3/conversation-coach/", attemptQuestionCount: 8, maxRecordingSeconds: 35,
  localUrl: "http://127.0.0.1:8025/ingles/basico-2/conversation-coach-unit-3-around-world-ava.html",
  character: { name: "Ava Park", role: "Around the World Conversation Coach", portrait: "../../assets/img/english-basic-2/unit-3-around-the-world/ava-around-world-conversation-coach-hero.png", hero: "../../assets/img/english-basic-2/unit-3-around-the-world/ava-around-world-conversation-coach-hero.png" },
  audio: {
    welcome: "ava-welcome.mp3", instructions: "task-instructions.mp3",
    needDetail: { file: "reaction-need-detail.mp3", text: "I understand your idea. Add one place word, one adjective, or one reason so your answer sounds more complete." },
    noSpeech: { file: "recovery-no-speech.mp3", text: "I could not hear a complete answer. Check your microphone, move a little closer, and try again." },
    serviceRecovery: { file: "recovery-service.mp3", text: "Your recording is still on this screen, but the transcription service did not answer. You can retry the analysis or record again." },
    closing: { file: "closing.mp3", text: "Nice conversation. Review your private report, then try again and make your place descriptions sound even more natural." }
  },
  selectionGroups: [
    { id: "intro", count: 1, questionIds: ["b2u3-q1-name"] }, { id: "preference", count: 1, questionIds: ["b2u3-q2-preference"] },
    { id: "place", count: 1, questionIds: ["b2u3-q3-place"] }, { id: "describe", count: 1, questionIds: ["b2u3-q4-describe"] },
    { id: "compare", count: 1, questionIds: ["b2u3-q5-compare"] }, { id: "recommend", count: 1, questionIds: ["b2u3-q6-recommend"] },
    { id: "ask-one", count: 1, questionIds: ["b2u3-q7-ask-one"] }, { id: "ask-two", count: 1, questionIds: ["b2u3-q8-ask-two"] }
  ],
  mandatoryQuestionIds: [],
  rubric: [
    { key: "task", label: "Task completion", description: "Completes each single-step conversation task." },
    { key: "interaction", label: "Interaction", description: "Responds naturally and asks Ava one clear question at a time." },
    { key: "language", label: "Vocabulary and structures", description: "Uses Unit 3 place adjectives, comparatives, and superlatives." },
    { key: "fluency", label: "Fluency", description: "Gives short connected answers without rushing." },
    { key: "clarity", label: "Pronunciation clarity", description: "Uses transcription confidence as an approximate signal." }
  ],
  usefulLanguage: ["I enjoy cities.", "I prefer quiet places.", "One place I know is ___.", "It is historic and scenic.", "___ is quieter than ___.", "___ is more crowded than ___.", "I recommend ___.", "It is the most impressive place because ___."],
  ui: {
    interactionRecordHelp: "Ask Ava one clear question in this turn.", preflightRecording: "Recording a three-second microphone test. Say: This is my Around the World conversation test.",
    taskStrength: "You completed the current place-description task with relevant information.", interactionStrength: "You responded naturally and kept the conversation moving one step at a time.",
    languageStrength: "You used useful Unit 3 place, comparison, or recommendation language.", interactionPriority: "Answer Ava directly. In the last two turns, ask one clear question only.",
    languagePriority: "Use precise Unit 3 language such as historic, scenic, remote, quieter than, more crowded than, or the most impressive.",
    summaryLeadComplete: "You completed an eight-turn Around the World conversation with Ava, one clear task at a time."
  },
  reactionResponses: [
    { id: "reaction-friendly", terms: ["my name", "nice to meet", "i am", "i'm"], file: "reaction-friendly.mp3", text: "Nice to meet you. Now we can talk about the kinds of places you enjoy." },
    { id: "reaction-adjectives", terms: ["historic", "modern", "remote", "peaceful", "scenic", "spacious", "touristy", "impressive", "crowded", "quiet"], file: "reaction-adjectives.mp3", text: "Good description. Those precise adjectives help another person imagine the place." },
    { id: "reaction-comparison", terms: ["quieter than", "more crowded", "more scenic", "more spacious", "than"], file: "reaction-comparison.mp3", text: "Good comparison. You clearly showed how the two places are different." },
    { id: "reaction-recommendation", terms: ["recommend", "most impressive", "quietest", "best"], file: "reaction-recommendation.mp3", text: "That sounds like a useful recommendation for a new visitor." }
  ],
  interactionResponses: [
    { id: "ava-favorite", terms: ["favorite", "favourite", "like most", "prefer"], file: "answer-favorite.mp3", text: "My favorite kind of place is a quiet historic town. I like walking slowly, visiting a small museum, and finding a scenic view." },
    { id: "ava-comparison", terms: ["quieter", "crowded", "compare", "more"], file: "answer-comparison.mp3", text: "For me, Lake Miran is quieter than Valeria, but Valeria has the more impressive museum." },
    { id: "ava-recommend", terms: ["recommend", "visitor", "best", "place"], file: "answer-recommendation.mp3", text: "I would recommend Valeria for a first visit because its old center is one of the most impressive places in the guide." },
    { id: "ava-preference", terms: ["city", "cities", "village", "quiet", "peaceful"], file: "answer-preference.mp3", text: "I enjoy both, but I usually choose a peaceful village when I want a calm weekend." }
  ],
  defaultInteractionResponse: { file: "answer-generic.mp3", text: "Good question. I enjoy places that have a clear character. For example, historic streets, a scenic view, or a quiet place to walk." },
  questions: [
    { id: "b2u3-q1-name", topic: "Friendly start", text: "Hi, I'm Ava. What's your name?", audio: "question-01-name.mp3", frames: ["Hi, Ava. My name is ___.", "Hello, Ava. I'm ___.", "Nice to meet you. My name is ___."], vocabulary: ["Hi", "Hello", "my name is", "I'm", "Nice to meet you"], grammar: "Use My name is or I'm. This turn has only one task: introduce yourself.", checks: [{ label: "introduction", terms: ["my name", "i am", "i'm", "hello", "hi"] }], unitTerms: ["my name", "i'm"], minWords: 4, maxSeconds: 18, improved: "Hi, Ava. My name is David." },
    { id: "b2u3-q2-preference", topic: "Place preference", text: "Do you enjoy cities or quiet places?", audio: "question-02-preference.mp3", frames: ["I enjoy cities.", "I prefer quiet places.", "I enjoy both, but I prefer ___."], vocabulary: ["city", "cities", "quiet place", "both", "prefer", "enjoy"], grammar: "Use enjoy or prefer plus a place type. Give one direct preference.", checks: [{ label: "place preference", terms: ["city", "cities", "quiet", "village", "both", "prefer", "enjoy"] }], unitTerms: ["cities", "quiet places", "prefer"], minWords: 4, maxSeconds: 20, improved: "I enjoy both, but I prefer quiet places." },
    { id: "b2u3-q3-place", topic: "Choose a place", text: "Name one place you know.", audio: "question-03-place.mp3", frames: ["One place I know is ___.", "I know a place called ___.", "A place in my city is ___."], vocabulary: ["city", "town", "village", "lake", "museum", "park", "mountains"], grammar: "Name one real or imagined place. Do not describe it yet; that comes in the next turn.", checks: [{ label: "place name or type", terms: ["city", "town", "village", "lake", "museum", "park", "mountain", "place"] }], unitTerms: ["city", "village", "lake", "museum"], minWords: 4, maxSeconds: 20, improved: "One place I know is a small town near the mountains." },
    { id: "b2u3-q4-describe", topic: "Describe one place", text: "Describe that place with two adjectives.", audio: "question-04-describe.mp3", frames: ["It is ___ and ___.", "The place is ___, but ___.", "It is a ___ and ___ place."], vocabulary: ["historic", "modern", "remote", "peaceful", "scenic", "spacious", "touristy", "impressive", "crowded", "quiet"], grammar: "Use It is plus two adjectives. This is one description task, not a comparison.", checks: [{ label: "two place adjectives", terms: ["historic", "modern", "remote", "peaceful", "scenic", "spacious", "touristy", "impressive", "crowded", "quiet"], minMatches: 2 }], unitTerms: ["historic", "peaceful", "scenic", "spacious"], minWords: 5, maxSeconds: 25, improved: "It is historic and scenic." },
    { id: "b2u3-q5-compare", topic: "Make one comparison", text: "Which is quieter, your place or another place you know?", audio: "question-05-compare.mp3", frames: ["___ is quieter than ___.", "My place is more ___ than ___.", "I think ___ is quieter."], vocabulary: ["quieter than", "more crowded than", "more scenic than", "more spacious than", "remote"], grammar: "Use a comparative: quieter than or more plus an adjective plus than.", checks: [{ label: "comparison", terms: ["quieter", "more crowded", "more scenic", "more spacious", "more remote", "than"] }], unitTerms: ["quieter than", "more crowded than", "more scenic than"], minWords: 6, maxSeconds: 28, improved: "My town is quieter than the city center." },
    { id: "b2u3-q6-recommend", topic: "Give one recommendation", text: "Which place do you recommend to a new visitor?", audio: "question-06-recommend.mp3", frames: ["I recommend ___ because ___.", "I recommend ___; it has the most ___.", "___ is one of the ___ places because ___."], vocabulary: ["recommend", "the most impressive", "one of the quietest", "the most scenic", "best choice", "visitor"], grammar: "Give one recommendation and one reason. Try one superlative if you can.", checks: [{ label: "recommendation", terms: ["recommend", "best", "most", "quietest", "visitor"] }, { label: "reason", terms: ["because", "it has", "it is"] }], unitTerms: ["recommend", "the most impressive", "one of the quietest"], minWords: 8, maxSeconds: 32, improved: "I recommend Valeria because it has the most impressive museum." },
    { id: "b2u3-q7-ask-one", topic: "Ask Ava one question", text: "What is one question you want to ask me about places?", audio: "question-07-ask-one.mp3", interaction: true, frames: ["What kind of place do you prefer?", "Which place is your favorite?", "Do you recommend a quiet place?"], vocabulary: ["what kind", "which place", "do you prefer", "favorite", "recommend", "quiet"], grammar: "Ask one complete question only. Ava will answer before the final turn.", checks: [{ label: "question starter", type: "questionStarters", minMatches: 1 }, { label: "place topic", terms: ["place", "city", "village", "quiet", "favorite", "prefer", "recommend"] }], unitTerms: ["which place", "do you prefer", "recommend"], minWords: 4, maxSeconds: 22, improved: "Which place is your favorite?" },
    { id: "b2u3-q8-ask-two", topic: "Ask one more question", text: "What is one more question you want to ask me?", audio: "question-08-ask-two.mp3", interaction: true, frames: ["Is Valeria more crowded than Lake Miran?", "Why do you recommend that place?", "What is the most impressive place for you?"], vocabulary: ["is", "why", "what", "more crowded", "recommend", "most impressive"], grammar: "Ask one different complete question. This is a new interaction, not a second question in the same answer.", checks: [{ label: "question starter", type: "questionStarters", minMatches: 1 }, { label: "Unit 3 topic", terms: ["valeria", "lake", "place", "crowded", "recommend", "impressive", "quiet", "city"] }], unitTerms: ["more crowded", "recommend", "most impressive"], minWords: 5, maxSeconds: 24, improved: "Is Valeria more crowded than Lake Miran?" }
  ]
};