window.IE2ConversationCoachConfig = {
  characterName: "Renata",
  audioRoot: "audio/conversation-coach/unit-2-renata-real-choice/",
  maxSeconds: 30,
  turns: [
    {
      topic: "First hello",
      question: "Hi! I don't think we've met. I'm Renata. What's your name?",
      audio: "turn-1-first-hello.mp3",
      frames: ["Hi, Renata. I'm _____.", "My name is _____. Nice to meet you.", "I'm _____. It's nice to meet you too."],
      words: ["Hi", "I'm", "my name is", "nice to meet you", "too"],
      focus: "Begin with a friendly greeting and introduce yourself with I am, I'm or My name is.",
      reaction: { text: "Nice to meet you. I am glad we can have a short conversation after class.", audio: "reaction-1-first-hello.mp3" }
    },
    {
      topic: "A simple connection",
      question: "Are you in this English class too? What do you enjoy doing after class?",
      audio: "turn-2-simple-connection.mp3",
      frames: ["Yes, I am. After class, I enjoy _____.", "I usually _____ after class because _____.", "Sometimes I _____, but I also like _____."],
      words: ["after class", "usually", "sometimes", "enjoy", "like", "go for a walk"],
      focus: "Use a short yes or no answer first, then use the simple present to talk about a routine or interest.",
      reaction: { text: "That sounds like a good way to spend time. I enjoy drawing and looking at design ideas after class.", audio: "reaction-2-simple-connection.mp3" }
    },
    {
      topic: "A future goal",
      question: "I hope to use English in design one day. What do you hope to do in the future?",
      audio: "turn-3-future-goal.mp3",
      frames: ["I hope to _____.", "In the future, I would like to _____.", "My goal is to _____ because _____."],
      words: ["hope to", "would like to", "my goal is to", "in the future", "because"],
      focus: "Use hope to, would like to or goal is to followed by a base verb. Add one personal reason if you can.",
      reaction: { text: "That is a clear goal. It is interesting to hear what people hope to build for their future.", audio: "reaction-3-future-goal.mp3" }
    },
    {
      topic: "A specific opportunity",
      question: "This week I received an email about a short design course. It starts next month. What would you like to know about it?",
      audio: "turn-4-specific-opportunity.mp3",
      frames: ["What kind of course is it?", "Would you like to take the course?", "When does the course start, and how long is it?"],
      words: ["what kind of", "course", "would you like to", "start", "how long"],
      focus: "Ask one direct, complete question. What kind of course is it? is more specific than asking only about an opportunity.",
      reaction: { text: "It is an evening course for young designers. I would like to take it because it could help me prepare a professional portfolio.", audio: "reaction-4-specific-opportunity.mp3" }
    },
    {
      topic: "The dilemma",
      question: "The course meets on the same evenings when I promised to help my family with a community project. What would happen if I took the course?",
      audio: "turn-5-the-dilemma.mp3",
      frames: ["If you take the course, you might _____.", "Could you change the schedule?", "What would happen to the community project?"],
      words: ["if", "might", "schedule", "community project", "change", "help"],
      focus: "Ask about one consequence or use If plus a present form and might plus a base verb to discuss a possible result.",
      reaction: { text: "That is exactly my concern. I do not want to disappoint my family, but I also do not want to lose this chance.", audio: "reaction-5-the-dilemma.mp3" }
    },
    {
      topic: "Advice from a friend",
      question: "I wish I had planned this earlier. What do you think I could do?",
      audio: "turn-6-advice-from-a-friend.mp3",
      frames: ["You could talk to your family and _____.", "If I were you, I would _____.", "I think you should _____ because _____."],
      words: ["you could", "if I were you", "I would", "I think you should", "talk to"],
      focus: "Give one practical idea. Use could or If I were you, I would. Add a reason so your advice feels supportive.",
      reaction: { text: "That makes sense. I could ask my family whether I can help at a different time instead of cancelling my promise completely.", audio: "reaction-6-advice-from-a-friend.mp3" }
    },
    {
      topic: "A friendly closing",
      question: "Thank you. My first step is to talk to my family tonight. Before we go, ask me one friendly question about the course or my plan.",
      audio: "turn-7-friendly-closing.mp3",
      frames: ["When does the course start?", "What will you say to your family?", "What do you hope will happen?"],
      words: ["when does", "what will", "what do you hope", "course", "family", "plan"],
      focus: "Close the conversation with one friendly, specific question about Renata's course or next step.",
      reaction: null
    }
  ],
  finalResponses: [
    { terms: ["start", "when", "course", "date"], file: "answer-course-details.mp3", text: "The course starts next month and lasts eight weeks. It meets twice a week in the evening, so I need to speak with my family before I accept it." },
    { terms: ["family", "say", "talk", "project"], file: "answer-family-plan.mp3", text: "I will explain why the course matters to me and ask whether we can share the community-project work or move my hours to the weekend." },
    { terms: ["hope", "happen", "future", "goal"], file: "answer-hope.mp3", text: "I hope we can find a schedule that respects my family promise and lets me begin the course. It would be a realistic first step toward my goal." }
  ],
  defaultFinalReaction: { file: "answer-general.mp3", text: "That is a thoughtful question. I want to make a choice that respects my family and also gives my future goal a real chance." }
};
