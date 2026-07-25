window.JaraLinguaScheduleCoachConfig = {
  id: "english-intermediate-1-final-oral-partner-coach",
  apiPath: "/api/english-intermediate/pronunciation-assessment",
  submitPath: "/api/intermediate/final-oral-partner-coach/submit",
  storageKey: "jaralingua:english-intermediate-1:final-oral-partner-coach:v1",
  language: "en",
  locale: "en-US",
  courseLabel: "Intermediate English Course 1",
  unitLabel: "Final Oral Task Practice",
  title: "Advice Exchange: Final Oral Partner Coach",
  audioRoot: "audio/conversation-coach/final-oral-partner/",
  imageRoot: "../../assets/img/english-intermediate/unit-6/final-oral-partner-coach/",
  maxRecordingSeconds: 50,
  character: {
    name: "Sophie Bennett",
    role: "exam partner and university friend",
    portrait: "../../assets/img/english-intermediate/unit-6/final-oral-partner-coach/sophie-bennett-portrait-v1.webp",
    hero: "../../assets/img/english-intermediate/unit-6/final-oral-partner-coach/final-oral-partner-hero-v1.webp"
  },
  ui: {
    coachName: "Sophie",
    selectedItemLabel: "Your problem",
    noItemSelected: "No problem selected",
    itemListenTitle: "Hear this problem",
    itemChooseText: "Choose this problem",
    itemSelectedText: "Selected",
    itemContextStatus: "Problem selected",
    itemContextDetail: "{name} is now your problem for the first half of the oral exchange.",
    itemToast: "{name} selected for your oral practice.",
    itemAudioToast: "{name} model audio is playing.",
    defaultContext: "You and Sophie are two friends preparing the final oral task.",
    incidentContextPrefix: "Sophie's problem",
    promptAudioToast: "{name}'s prompt is playing.",
    clarificationAudioToast: "{name}'s clarification is playing.",
    missingItemStatus: "Choose your problem first",
    missingItemHelp: "Select one problem card before you record your first answer.",
    missingItemStage: "{name} is waiting for your problem choice",
    unavailableToast: "The final oral partner coach is unavailable.",
    startToast: "{mode} started. Sophie is your exam partner.",
    preflightSentence: "I should explain the problem and give clear advice.",
    recordingStatus: "Recording your oral response",
    recordingHelp: "Speak naturally. Finish when your message is complete.",
    tooShortStage: "{name} did not hear a complete response",
    incompleteMessage: "Build the response again with a complete problem-solving message{missing}.",
    addExpressionMessage: "Add one advice expression from the final oral task.",
    responseStatus: "{name} is responding",
    responseHelp: "Listen to {name}, then continue the partner exchange.",
    completeStage: "Partner exchange complete",
    readyNextStage: "{name} is ready for the next part",
    analyzedToast: "Response analyzed successfully. {name} is continuing the partner exchange.",
    clarificationAnalyzedToast: "Clarification recorded. {name} will continue and the missing evidence remains in your report.",
    noSpeechStage: "{name} could not hear a complete response",
    historyEmpty: "No previous final oral partner attempts are stored on this device.",
    historyRealLabel: "Realistic Exam Simulation",
    historyGuidedLabel: "Guided Rehearsal",
    reportLead: "You completed the final oral partner exchange{item}. Review the evidence before your next unlimited attempt.",
    reportComparison: "This formative estimate summarizes your latest analyzed response in each final oral stage.",
    reportCoverageReady: "{analyzed} of {total} stages analyzed. The written report is ready for teacher follow-up.",
    reportCoverageIncomplete: "{analyzed} of {total} stages analyzed. Complete all stages to unlock teacher follow-up.",
    fallbackStrength: "You completed the partner exchange and preserved your practice evidence.",
    fallbackPriority: "Repeat the exchange with clearer follow-up questions, advice expressions, and reasons.",
    deliveryIncompleteStatus: "This report has {analyzed} of {total} analyzed stages. Complete a new full partner exchange before sending it.",
    deliveryIncompleteToast: "The full partner exchange must be analyzed before delivery.",
    deliveryReadyStatus: "Report ready. Sign in with your Intermediate English account and send it when you are ready.",
    deliveryBusyStatus: "Sending the written partner-practice report to your teacher...",
    deliverySuccessStatus: "Submitted to teacher. Reference grade: {grade}/5. This follow-up stays out of the official gradebook.",
    deliverySuccessToast: "Submitted to teacher. Reference grade recorded for follow-up only.",
    deliveryIncompleteServer: "The server could not verify all analyzed stages. Complete a new full partner exchange and try again.",
    payloadItemKey: "selectedProblem",
    payloadIncidentKey: "partnerProblem",
    readinessLabels: {
      high: "Ready for an independent final oral exchange",
      mid: "Communicative with a few exam priorities",
      low: "Rehearse the partner exchange again"
    },
    successMessage: "Your response is relevant, detailed, and ready for the next part of the final oral exchange.",
    reportReadyToast: "Final oral partner report ready. Nothing is sent until you choose Send to teacher.",
    latestReportToast: "Latest final oral partner report opened.",
    historyClearedToast: "Final oral partner history cleared from this device.",
    guidedRestartToast: "Guided Rehearsal is selected for your next final oral partner exchange."
  },
  audio: {
    welcome: "sophie-welcome.mp3",
    instructions: "task-instructions.mp3",
    noSpeech: {
      file: "recovery-no-speech.mp3",
      text: "I could not hear a complete answer. Check your microphone, move a little closer, and try again with one clear idea."
    },
    serviceRecovery: {
      file: "recovery-service.mp3",
      text: "Your recording is still available on this screen, but the transcription service did not answer. You can retry the analysis or record again."
    }
  },
  rubric: [
    { key: "task", label: "Task completion", description: "Presents a problem, asks questions, gives advice, and reaches a decision." },
    { key: "interaction", label: "Interaction and discourse", description: "Listens, follows up, reacts, and keeps the pair conversation moving." },
    { key: "language", label: "Vocabulary and structures", description: "Uses should, should not, could, might, why don't you, and if I were you." },
    { key: "fluency", label: "Fluency", description: "Develops connected responses without reading a memorized script." },
    { key: "clarity", label: "Pronunciation clarity", description: "Uses transcription confidence as an approximate signal only." }
  ],
  dishes: [
    {
      id: "school-work-stress",
      name: "School and Work Stress",
      category: "Problem card",
      price: "Option A",
      image: "problem-school-work-stress-v1.webp",
      audio: "problem-school-work-stress.mp3",
      description: "You have deadlines at work and at college, and you feel you cannot organize everything.",
      terms: ["stress", "work", "school", "college", "deadline", "organize", "tired", "overwhelmed"],
      response: {
        file: "stage-03-complete.mp3",
        text: "Thanks. I understand the situation better now. If I were you, I would separate urgent tasks from flexible tasks. You should also choose one thing to put off, not everything at the same time. Now react to my advice and decide which suggestion is best for you."
      }
    },
    {
      id: "english-learning",
      name: "English Learning Difficulty",
      category: "Problem card",
      price: "Option B",
      image: "problem-english-learning-v1.webp",
      audio: "problem-english-learning.mp3",
      description: "You understand some English in class, but speaking naturally still feels difficult.",
      terms: ["english", "speaking", "pronunciation", "vocabulary", "practice", "class", "understand", "difficult"],
      response: {
        file: "stage-03-complete.mp3",
        text: "Thanks. I understand the situation better now. If I were you, I would practice short answers every day instead of waiting for a long study session. You could also record yourself and repeat only the sentence that is unclear. Now react to my advice and decide which suggestion is best for you."
      }
    },
    {
      id: "health-habits",
      name: "Health Habits",
      category: "Problem card",
      price: "Option C",
      image: "problem-health-habits-v1.webp",
      audio: "problem-health-habits.mp3",
      description: "You want to sleep better, exercise more, and stop leaving healthy routines for later.",
      terms: ["health", "sleep", "exercise", "routine", "habit", "energy", "tired", "healthy"],
      response: {
        file: "stage-03-complete.mp3",
        text: "Thanks. I understand the situation better now. You should start with one small habit, not a complete life change. Why don't you choose two realistic exercise days and protect your sleep before exams? Now react to my advice and decide which suggestion is best for you."
      }
    },
    {
      id: "money-management",
      name: "Money Problems",
      category: "Problem card",
      price: "Option D",
      image: "problem-money-management-v1.webp",
      audio: "problem-money-management.mp3",
      description: "You spend money too quickly and need a realistic plan to save for something important.",
      terms: ["money", "save", "spend", "budget", "expensive", "plan", "income", "cost"],
      response: {
        file: "stage-03-complete.mp3",
        text: "Thanks. I understand the situation better now. You could write down your fixed expenses first and then decide how much money is flexible. You shouldn't cut everything, but you should choose one spending habit to reduce. Now react to my advice and decide which suggestion is best for you."
      }
    },
    {
      id: "free-time",
      name: "No Free Time",
      category: "Problem card",
      price: "Option E",
      image: "problem-free-time-v1.webp",
      audio: "problem-free-time.mp3",
      description: "You have responsibilities almost every day and do not know how to make time for rest, friends, or hobbies.",
      terms: ["free time", "rest", "friends", "hobbies", "schedule", "responsibilities", "busy", "time"],
      response: {
        file: "stage-03-complete.mp3",
        text: "Thanks. I understand the situation better now. You might want to block free time before the week becomes full. If I were you, I would also say no to one optional task. Now react to my advice and decide which suggestion is best for you."
      }
    }
  ],
  incidents: [
    {
      id: "sophie-language-learning",
      file: "stage-05-sophie-language-problem.mp3",
      text: "Now it is my turn. I understand grammar exercises, but when I have to speak in English, I freeze and forget simple words. Ask me two follow-up questions before you give me advice.",
      prompt: "I understand grammar exercises, but when I have to speak in English, I freeze and forget simple words.",
      terms: ["grammar", "speak", "english", "freeze", "forget", "words", "practice"]
    },
    {
      id: "sophie-money",
      file: "stage-05-sophie-money-problem.mp3",
      text: "Now it is my turn. I want to save money for a trip, but I keep spending small amounts every day. Ask me two follow-up questions before you give me advice.",
      prompt: "I want to save money for a trip, but I keep spending small amounts every day.",
      terms: ["save", "money", "trip", "spending", "every day", "budget"]
    },
    {
      id: "sophie-free-time",
      file: "stage-05-sophie-free-time-problem.mp3",
      text: "Now it is my turn. I have class, work, and family responsibilities, and I never have time to relax. Ask me two follow-up questions before you give me advice.",
      prompt: "I have class, work, and family responsibilities, and I never have time to relax.",
      terms: ["class", "work", "family", "responsibilities", "relax", "time"]
    }
  ],
  stages: [
    {
      id: "choose-strategy",
      topic: "Choose and present your problem",
      prompt: "Choose one problem card. Explain your problem clearly: what is happening, how it affects you, and what you have already tried.",
      entryAudio: "stage-01-present-problem.mp3",
      requiresDish: true,
      showStrategyBoard: true,
      frames: ["I chose ______ because ______. The problem is that ______.", "This situation affects me because ______. I have already tried ______."],
      vocabulary: ["the problem is that", "it affects me", "I have already tried", "deadline", "routine", "budget", "free time"],
      grammar: "Present the problem with present simple or present continuous. Use because to explain the effect.",
      checks: [
        { label: "selected problem", kind: "selected-dish" },
        { label: "effect or consequence", terms: ["because", "affects", "so", "that means", "as a result"] },
        { label: "previous attempt", terms: ["tried", "already", "before", "started", "used", "planned"] }
      ],
      unitTerms: ["problem", "because", "already tried", "affects"],
      minWords: 18,
      maxSeconds: 50,
      improved: "I chose School and Work Stress because I have deadlines at college and at work. It affects me because I feel tired, and I have already tried making a list.",
      improvedByDish: {
        "school-work-stress": "I chose School and Work Stress because I have deadlines at college and at work. It affects me because I feel tired, and I have already tried making a list.",
        "english-learning": "I chose English Learning Difficulty because I understand grammar in class, but I freeze when I have to speak. It affects my confidence, and I have already tried studying vocabulary alone.",
        "health-habits": "I chose Health Habits because I want to sleep better and exercise more, but I keep leaving healthy routines for later. It affects my energy, and I have already tried changing everything at once.",
        "money-management": "I chose Money Problems because I spend small amounts too quickly and I need to save for something important. It affects my plans, and I have already tried avoiding expensive places.",
        "free-time": "I chose No Free Time because I have responsibilities almost every day and I do not make time for rest, friends, or hobbies. It affects my energy, and I have already tried organizing my week."
      }
    },
    {
      id: "follow-up-answer-1",
      topic: "Answer Sophie's first follow-up",
      prompt: "What is the biggest cause of the problem right now: time, habits, money, confidence, or another reason?",
      entryAudio: "stage-02-follow-up-cause.mp3",
      frames: ["The biggest cause is ______ because ______.", "I think the main reason is ______, and it affects ______."],
      vocabulary: ["main reason", "biggest cause", "confidence", "habit", "time pressure", "money pressure", "because"],
      grammar: "Give one cause and one reason. Avoid only saying yes or no.",
      checks: [
        { label: "cause", terms: ["cause", "reason", "because", "time", "habit", "money", "confidence", "pressure"] },
        { label: "development", terms: ["because", "for example", "so", "that means"] }
      ],
      unitTerms: ["because", "main reason", "cause"],
      minWords: 12,
      maxSeconds: 40,
      improved: "The biggest cause is time pressure because I work during the day and study at night, so I do not have enough energy.",
      improvedByDish: {
        "school-work-stress": "The biggest cause is time pressure because I work during the day and study at night, so I do not have enough energy.",
        "english-learning": "The biggest cause is confidence because I understand some English, but I get nervous when I have to answer quickly.",
        "health-habits": "The biggest cause is habit because I plan healthy routines, but I usually go to bed late and postpone exercise.",
        "money-management": "The biggest cause is small daily spending because I do not notice how much money I use until the end of the week.",
        "free-time": "The biggest cause is my schedule because I say yes to too many responsibilities, so I do not protect time to rest."
      }
    },
    {
      id: "follow-up-answer-2",
      topic: "Answer Sophie's second follow-up",
      prompt: "What would change first if this problem improved next week?",
      entryAudio: "stage-03-follow-up-change.mp3",
      frames: ["If this improved next week, I would ______.", "The first change would be ______ because ______."],
      vocabulary: ["if this improved", "first change", "next week", "feel better", "organize", "save", "practice"],
      grammar: "Use would for an imagined result: I would feel less stressed.",
      checks: [
        { label: "imagined result", terms: ["would", "could", "first change", "if"] },
        { label: "specific change", terms: ["next week", "organize", "practice", "save", "sleep", "rest", "study"] }
      ],
      unitTerms: ["would", "if", "next week"],
      minWords: 12,
      maxSeconds: 40,
      improved: "If this improved next week, I would feel less stressed because I could organize my tasks before the weekend.",
      improvedByDish: {
        "school-work-stress": "If this improved next week, I would feel less stressed because I could organize my tasks before the weekend.",
        "english-learning": "If this improved next week, I would speak with more confidence because I could practice short answers every day.",
        "health-habits": "If this improved next week, I would have more energy because I could sleep earlier and exercise twice.",
        "money-management": "If this improved next week, I would save more money because I could control small expenses before they become a problem.",
        "free-time": "If this improved next week, I would feel more balanced because I could rest, see my friends, and still finish my responsibilities."
      }
    },
    {
      id: "advice-plan",
      topic: "React and choose advice",
      prompt: "Listen to Sophie's advice. Say which suggestion is best for you, which suggestion might not work, and why.",
      frames: ["The best suggestion is ______ because ______.", "I am not sure ______ would work because ______, but I could ______."],
      vocabulary: ["best suggestion", "might not work", "because", "I could", "that would help", "realistic"],
      grammar: "Use could or might to discuss options politely.",
      checks: [
        { label: "best advice", terms: ["best", "suggestion", "advice", "should", "could"] },
        { label: "reason", terms: ["because", "so", "that would", "realistic"] },
        { label: "polite disagreement or limitation", terms: ["might not", "not sure", "but", "however", "difficult"] }
      ],
      unitTerms: ["could", "might", "because", "suggestion"],
      minWords: 18,
      maxSeconds: 50,
      improved: "The best suggestion is making a short weekly plan because it is realistic. I am not sure studying every night would work, but I could practice three times a week.",
      improvedByDish: {
        "school-work-stress": "The best suggestion is making a short weekly plan because it is realistic. I am not sure studying every night would work, but I could protect three work blocks.",
        "english-learning": "The best suggestion is recording short answers because it is realistic. I am not sure speaking for an hour would work, but I could practice five minutes a day.",
        "health-habits": "The best suggestion is starting with one small habit because it is realistic. I am not sure changing everything would work, but I could sleep earlier twice this week.",
        "money-management": "The best suggestion is writing down daily expenses because it is realistic. I am not sure cutting everything would work, but I could reduce one spending habit.",
        "free-time": "The best suggestion is blocking free time before the week becomes full because it is realistic. I am not sure cancelling everything would work, but I could say no to one optional task."
      },
      complete: {
        file: "stage-04-complete.mp3",
        text: "Good. You reacted to my advice and made a decision. Now I will present my own problem. Listen carefully because you need to ask follow-up questions before you advise me."
      }
    },
    {
      id: "service-problem",
      topic: "Listen to Sophie's problem",
      prompt: "Listen to Sophie's problem. Then ask two follow-up questions before giving advice.",
      frames: ["How long have you ______?", "Have you tried ______?", "What happens when you ______?"],
      vocabulary: ["How long have you...?", "Have you tried...?", "What happens when...?", "why", "when", "how often"],
      grammar: "Ask follow-up questions before advice. Use question word order.",
      checks: [
        { label: "two follow-up questions", minMatches: 2, terms: ["how", "what", "when", "why", "have you", "do you", "did you", "?"] },
        { label: "partner problem focus", kind: "incident" }
      ],
      unitTerms: ["have you", "what", "how", "why"],
      minWords: 10,
      maxSeconds: 45,
      improved: "How long have you felt this way? Have you tried practicing with one short answer every day?",
      improvedByIncident: {
        "sophie-language-learning": "How long have you felt this way? Have you tried practicing with one short answer every day?",
        "sophie-money": "How much do you usually spend every day? Have you tried writing down your small expenses for one week?",
        "sophie-free-time": "Which responsibility takes most of your time? Have you tried blocking one hour for rest before the week becomes full?"
      },
      complete: {
        file: "stage-05-complete.mp3",
        text: "Those questions help me explain the problem. I have tried making plans, but I do not always follow them. Now give me advice with at least two advice expressions and reasons."
      },
      clarify: {
        file: "stage-05-clarify.mp3",
        text: "Before giving advice, ask me two clear follow-up questions about my problem."
      }
    },
    {
      id: "give-partner-advice",
      topic: "Give Sophie advice",
      prompt: "Give Sophie advice. Use at least two advice expressions and explain why your advice could help.",
      entryAudio: "stage-06-give-advice.mp3",
      frames: ["You should ______ because ______. You could also ______.", "If I were you, I would ______. Why don't you ______?"],
      vocabulary: ["you should", "you shouldn't", "you could", "you might want to", "why don't you", "if I were you"],
      grammar: "Use should for clear advice, could for softer options, and If I were you, I would for personal advice.",
      checks: [
        { label: "two advice expressions", minMatches: 2, terms: ["should", "shouldn't", "could", "might", "why don't you", "if i were you", "i would"] },
        { label: "reasons", terms: ["because", "so", "that way", "it would", "this could"] },
        { label: "partner problem focus", kind: "incident" }
      ],
      unitTerms: ["should", "could", "why don't you", "if i were you", "because"],
      minWords: 22,
      maxSeconds: 55,
      improved: "If I were you, I would start with one small change because it is easier to continue. You could also ask a friend to check your progress twice a week.",
      improvedByIncident: {
        "sophie-language-learning": "If I were you, I would practice one short answer every day because it is easier than speaking for a long time. You could also record yourself and repeat the unclear sentence.",
        "sophie-money": "If I were you, I would set a small daily spending limit because small expenses add up quickly. You could also save first and spend only what is left.",
        "sophie-free-time": "If I were you, I would choose one optional task to put off because you need time to rest. You could also block free time on your calendar before people ask for help."
      },
      complete: {
        file: "stage-06-complete.mp3",
        text: "That advice is useful. Now let's decide together. Which advice is the best option for my problem, and why?"
      },
      clarify: {
        file: "stage-06-clarify.mp3",
        text: "Use two advice expressions, such as you should, you could, why don't you, or if I were you."
      }
    },
    {
      id: "joint-decision",
      topic: "Decide the best advice",
      prompt: "Decide the best advice for Sophie's problem. Compare two options and explain which one is more realistic.",
      entryAudio: "stage-07-joint-decision.mp3",
      frames: ["The best option is ______ because it is more realistic than ______.", "I think you should choose ______ first, and later you could ______."],
      vocabulary: ["best option", "more realistic", "first", "later", "instead of", "because"],
      grammar: "Use comparatives and sequencing language to justify the final decision.",
      checks: [
        { label: "decision", terms: ["best", "option", "choose", "should", "first"] },
        { label: "comparison", terms: ["more", "than", "instead", "but", "while"] },
        { label: "reason", terms: ["because", "so", "realistic", "help"] }
      ],
      unitTerms: ["best option", "more realistic", "because", "should"],
      minWords: 18,
      maxSeconds: 50,
      improved: "The best option is practicing one short answer every day because it is more realistic than studying for two hours once a week.",
      improvedByIncident: {
        "sophie-language-learning": "The best option is practicing one short answer every day because it is more realistic than studying for two hours once a week.",
        "sophie-money": "The best option is tracking small expenses every day because it is more realistic than trying to stop all spending at once.",
        "sophie-free-time": "The best option is protecting one rest block each week because it is more realistic than cancelling every responsibility."
      },
      complete: {
        file: "stage-07-complete.mp3",
        text: "I agree. That sounds realistic and respectful. Finish the exchange by summarizing what each person should do after the conversation."
      },
      clarify: {
        file: "stage-07-clarify.mp3",
        text: "Choose one best option, compare it with another option, and give a reason."
      }
    },
    {
      id: "closing-summary",
      topic: "Close the partner exchange",
      prompt: "Summarize the conversation. What should you do, what should Sophie do, and how will both people follow up?",
      entryAudio: "stage-08-closing-summary.mp3",
      frames: ["I should ______, and you should ______. We could follow up by ______.", "My next step is ______. Your next step is ______. We should check again ______."],
      vocabulary: ["next step", "follow up", "check again", "both of us", "after class", "next week"],
      grammar: "Use should for final advice and could for a possible follow-up plan.",
      checks: [
        { label: "your next step", terms: ["i should", "my next step", "i will", "i'm going to"] },
        { label: "Sophie's next step", terms: ["you should", "your next step", "you could", "sophie should"] },
        { label: "follow-up plan", terms: ["follow up", "check", "next week", "after class", "again"] }
      ],
      unitTerms: ["should", "could", "next step", "follow up"],
      minWords: 18,
      maxSeconds: 50,
      improved: "I should organize my problem with a simple weekly plan, and you should practice one small habit every day. We could follow up next week after class.",
      combineImprovedModels: true,
      improvedByDish: {
        "school-work-stress": "I should organize my school and work deadlines with a simple weekly plan.",
        "english-learning": "I should practice short English answers every day instead of waiting for a long study session.",
        "health-habits": "I should start with one healthy habit this week, such as sleeping earlier or exercising twice.",
        "money-management": "I should track small expenses and decide how much money I can save each week.",
        "free-time": "I should block time for rest before my schedule becomes full, and I should say no to one optional task."
      },
      improvedByIncident: {
        "sophie-language-learning": "Sophie should practice one short English answer every day, and we could follow up next week after class.",
        "sophie-money": "Sophie should track small expenses for one week, and we could follow up next class to compare her spending plan.",
        "sophie-free-time": "Sophie should protect one rest block this week, and we could follow up next class to see if the plan worked."
      },
      complete: {
        file: "stage-08-complete.mp3",
        text: "Excellent. Your final oral partner practice is complete. Review your report, then send it to the teacher if you are ready."
      },
      clarify: {
        file: "stage-08-clarify.mp3",
        text: "Summarize both people. Say what you should do, what I should do, and one follow-up plan."
      }
    }
  ]
};
