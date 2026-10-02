window.JaraLinguaScheduleCoachConfig = {
  id: "english-intermediate-1-unit-6-schedule",
  apiPath: "/api/english-intermediate/pronunciation-assessment",
  submitPath: "/api/intermediate/unit6-schedule-coach/submit",
  storageKey: "jaralingua:english-intermediate-1:conversation-coach:unit-6-schedule:v1",
  language: "en",
  locale: "en-US",
  courseLabel: "Intermediate English Course 1",
  unitLabel: "Unit 6",
  title: "Schedule Rescue Conversation Coach",
  audioRoot: "audio/conversation-coach/unit-6-schedule/",
  imageRoot: "../../assets/img/english-intermediate/unit-6/schedule-coach/",
  maxRecordingSeconds: 40,
  character: {
    name: "Marcus Reed",
    role: "schedule coach and music producer",
    portrait: "../../assets/img/english-intermediate/unit-6/schedule-coach/marcus-reed-portrait-v1.webp",
    hero: "../../assets/img/english-intermediate/unit-6/schedule-coach/schedule-rescue-hero-v1.webp"
  },
  audio: {
    welcome: "marcus-welcome.mp3",
    instructions: "task-instructions.mp3",
    noSpeech: {
      file: "recovery-no-speech.mp3",
      text: "I could not hear a complete answer. Check your microphone, speak a little closer, and try again."
    },
    serviceRecovery: {
      file: "recovery-service.mp3",
      text: "Your recording is still available on this screen, but the transcription service did not answer. You can retry the analysis or record again."
    }
  },
  rubric: [
    { key: "task", label: "Task completion", description: "Solves the schedule problem required in each stage." },
    { key: "interaction", label: "Interaction", description: "Responds to Marcus and keeps the meeting moving naturally." },
    { key: "language", label: "Unit 6 language", description: "Uses future plans, arrangements, advice, and scheduling language meaningfully." },
    { key: "fluency", label: "Fluency", description: "Develops a continuous response at a workable pace." },
    { key: "clarity", label: "Pronunciation clarity", description: "Uses transcription confidence as an approximate signal." }
  ],
  dishes: [
    {
      id: "protect-recording",
      name: "Protect the Recording Block",
      category: "Priority",
      price: "Plan A",
      image: "strategy-protect-recording-v1.webp",
      audio: "strategy-protect-recording.mp3",
      description: "Keep Olivia's Wednesday recording session fixed and move flexible tasks around it.",
      terms: ["recording", "recording session", "wednesday", "protect", "block"],
      response: {
        file: "strategy-protect-recording-response.mp3",
        text: "That is a strong choice. Olivia is recording on Wednesday afternoon, so that block should stay protected. Now give Olivia one clear piece of advice. Use should, ought to, or could, and explain how this strategy helps her week."
      }
    },
    {
      id: "move-interview",
      name: "Move the Radio Interview",
      category: "Flexible event",
      price: "Plan B",
      image: "strategy-move-interview-v1.webp",
      audio: "strategy-move-interview.mp3",
      description: "Put off the radio interview if it conflicts with rest, rehearsal, or family plans.",
      terms: ["radio interview", "interview", "move", "put off", "postpone"],
      response: {
        file: "strategy-move-interview-response.mp3",
        text: "That can work if the interview is not confirmed yet. Olivia could put it off or move it to a lighter day. Now give Olivia one clear piece of advice. Use should, ought to, or could, and explain why moving the interview helps."
      }
    },
    {
      id: "free-up-friday",
      name: "Free Up Friday Afternoon",
      category: "Balance",
      price: "Plan C",
      image: "strategy-free-up-friday-v1.webp",
      audio: "strategy-free-up-friday.mp3",
      description: "Create space on Friday so Olivia can prepare calmly before the weekend event.",
      terms: ["free up", "friday", "afternoon", "space", "prepare"],
      response: {
        file: "strategy-free-up-friday-response.mp3",
        text: "Good. If Olivia frees up Friday afternoon, she has time to prepare and avoid rushing. Now give Olivia one clear piece of advice. Use should, ought to, or could, and explain how this protects her energy."
      }
    },
    {
      id: "confirm-agenda",
      name: "Confirm the Final Agenda",
      category: "Decision",
      price: "Plan D",
      image: "strategy-confirm-agenda-v1.webp",
      audio: "strategy-confirm-agenda.mp3",
      description: "Separate confirmed arrangements from ideas that are still up in the air.",
      terms: ["agenda", "confirm", "confirmed", "up in the air", "on the same page"],
      response: {
        file: "strategy-confirm-agenda-response.mp3",
        text: "Exactly. The team needs to be on the same page before Olivia commits to more tasks. Now give Olivia one clear piece of advice. Use should, ought to, or could, and explain how confirming the agenda helps."
      }
    }
  ],
  incidents: [
    {
      id: "photo-session",
      file: "incident-photo-session.mp3",
      text: "New complication. The Friday photo session is still up in the air, but the photographer wants an answer today. What should Olivia do before she confirms it?",
      prompt: "The Friday photo session is still up in the air, but the photographer wants an answer today.",
      terms: ["photo session", "photographer", "friday", "up in the air", "confirm", "answer"]
    },
    {
      id: "family-dinner",
      file: "incident-family-dinner.mp3",
      text: "New complication. Olivia's mother can only have dinner on Thursday evening, but Olivia is rehearsing with the band at seven. How could she adjust the schedule respectfully?",
      prompt: "Olivia's mother can only have dinner on Thursday evening, but Olivia is rehearsing with the band at seven.",
      terms: ["mother", "family", "dinner", "thursday", "rehearsing", "adjust"]
    },
    {
      id: "band-delay",
      file: "incident-band-delay.mp3",
      text: "New complication. The band rehearsal may run late, and Olivia also has to send the final agenda that night. What should she do to avoid confusion?",
      prompt: "The band rehearsal may run late, and Olivia also has to send the final agenda that night.",
      terms: ["band", "rehearsal", "run late", "final agenda", "avoid", "confusion"]
    }
  ],
  stages: [
    {
      id: "opening-priorities",
      topic: "Priorities and intentions",
      prompt: "Olivia has a crowded week: a recording session, a band rehearsal, a radio interview, family time, and rest. What is she going to protect first, and why?",
      entryAudio: "stage-01-opening.mp3",
      frames: ["She is going to protect ______ first because ______.", "Her first priority should be ______ because ______."],
      vocabulary: ["protect first", "priority", "recording session", "family time", "rest", "because"],
      grammar: "Use be going to for an intention and because to explain the reason.",
      checks: [
        { label: "a clear priority", terms: ["priority", "first", "protect", "important", "recording", "family", "rest", "rehearsal"] },
        { label: "future intention", terms: ["going to", "is going to", "she's going to", "will"] },
        { label: "reason", terms: ["because", "so", "that way", "in order to"] }
      ],
      unitTerms: ["going to", "priority", "because", "recording session"],
      minWords: 10,
      maxSeconds: 30,
      improved: "She is going to protect the Wednesday recording session first because it is the least flexible event.",
      complete: {
        file: "stage-01-complete.mp3",
        text: "Good. Now separate confirmed arrangements from plans. Which events are fixed, and which ones are only ideas?"
      },
      clarify: {
        file: "stage-01-clarify.mp3",
        text: "Start with one priority. Say what Olivia is going to protect first, and give one reason."
      }
    },
    {
      id: "fixed-arrangements",
      topic: "Plans and confirmed arrangements",
      prompt: "Which events are confirmed arrangements, and which events are only plans or possibilities?",
      frames: ["She is recording on ______, so that is confirmed. She is going to ______, but it is not fixed yet.", "The ______ is arranged, but the ______ is still up in the air."],
      vocabulary: ["confirmed arrangement", "still up in the air", "not fixed yet", "is recording", "is rehearsing", "is going to"],
      grammar: "Use present continuous for confirmed future arrangements. Use be going to for intentions or plans that are not fully arranged.",
      checks: [
        { label: "confirmed arrangement", terms: ["is recording", "is rehearsing", "is meeting", "confirmed", "arranged", "fixed"] },
        { label: "plan or possibility", terms: ["going to", "might", "could", "not fixed", "up in the air", "possibility"] },
        { label: "contrast", terms: ["but", "while", "however", "on the other hand"] }
      ],
      unitTerms: ["is recording", "is rehearsing", "going to", "up in the air"],
      minWords: 13,
      maxSeconds: 35,
      improved: "She is recording on Wednesday afternoon, so that is confirmed. The radio interview is still up in the air.",
      complete: {
        file: "stage-02-complete.mp3",
        text: "That distinction helps. Choose one strategy card now. Explain which strategy you chose and why it could help Olivia organize the week."
      },
      clarify: {
        file: "stage-02-clarify.mp3",
        text: "Mention at least one fixed arrangement and one plan that is not fully confirmed yet."
      }
    },
    {
      id: "choose-strategy",
      topic: "Choose a schedule strategy",
      prompt: "Choose one strategy card. Explain which strategy you chose and why it could help Olivia.",
      requiresDish: true,
      showStrategyBoard: true,
      frames: ["I chose ______ because Olivia needs to ______.", "This strategy could help because ______."],
      vocabulary: ["I chose", "strategy", "could help", "organize", "avoid rushing", "be on the same page"],
      grammar: "Use could to explain a possible benefit without sounding too strong.",
      checks: [
        { label: "the selected strategy", kind: "selected-dish" },
        { label: "reason", terms: ["because", "so", "helps", "could help", "that way"] },
        { label: "schedule purpose", terms: ["schedule", "agenda", "organize", "plan", "avoid", "balance"] }
      ],
      unitTerms: ["could", "strategy", "agenda", "because"],
      minWords: 11,
      maxSeconds: 35,
      improved: "I chose Confirm the Final Agenda because Olivia needs everyone to be on the same page before she adds new plans.",
      clarify: {
        file: "stage-03-clarify.mp3",
        text: "Choose one strategy card, name it clearly, and explain why it helps Olivia's schedule."
      }
    },
    {
      id: "advice-plan",
      topic: "Give advice",
      prompt: "Give Olivia one clear piece of advice using should, ought to, or could. Mention the strategy you selected.",
      frames: ["Olivia should ______ because ______.", "She ought to ______, and she could ______ if ______."],
      vocabulary: ["should", "ought to", "could", "free up", "put off", "fit in", "on the same page"],
      grammar: "Use should or ought to for stronger advice. Use could for a softer option.",
      checks: [
        { label: "advice modal", terms: ["should", "ought to", "could"] },
        { label: "schedule action", terms: ["free up", "put off", "fit in", "move", "confirm", "protect", "adjust"] },
        { label: "reason", terms: ["because", "so", "that way", "in order to"] }
      ],
      unitTerms: ["should", "ought to", "could", "free up", "put off", "fit in"],
      minWords: 13,
      maxSeconds: 38,
      improved: "Olivia should protect the recording block because it is confirmed, and she could put off the interview if Friday becomes too busy.",
      clarify: {
        file: "stage-04-clarify.mp3",
        text: "Give one piece of advice with should, ought to, or could. Include a schedule action and one reason."
      }
    },
    {
      id: "schedule-pushback",
      topic: "Respond to a complication",
      prompt: "Listen to the new complication and respond with advice. Mention what Olivia should do before she confirms anything.",
      frames: ["Before she confirms it, she should ______.", "She could ______ first, and then she can ______."],
      vocabulary: ["before she confirms", "check first", "adjust", "run late", "still up in the air", "avoid confusion"],
      grammar: "Use before + subject + verb to show sequence: Before she confirms it, she should check the agenda.",
      checks: [
        { label: "the complication", kind: "incident" },
        { label: "advice or option", terms: ["should", "could", "ought to", "needs to", "has to"] },
        { label: "sequence", terms: ["before", "then", "after", "first", "next"] }
      ],
      unitTerms: ["before", "should", "could", "up in the air", "confirm"],
      minWords: 13,
      maxSeconds: 38,
      improved: "Before she confirms the photo session, she should check whether Friday afternoon is still free and talk to the team.",
      complete: {
        file: "stage-05-complete.mp3",
        text: "That response is useful. Now adjust the plan. What should Marcus put off, fit in, or free up?"
      },
      clarify: {
        file: "stage-05-clarify.mp3",
        text: "Respond to the complication. Say what Olivia should or could do before she confirms anything."
      }
    },
    {
      id: "adjust-plan",
      topic: "Adjust the plan",
      prompt: "Adjust the plan. What should Marcus put off, fit in, or free up?",
      frames: ["Marcus should put off ______ and fit in ______ on ______.", "He could free up ______ by moving ______ to ______."],
      vocabulary: ["put off", "fit in", "free up", "move to", "reschedule", "make space for"],
      grammar: "Use phrasal verbs accurately: put off means postpone, fit in means include in a busy schedule, and free up means make time available.",
      checks: [
        { label: "a schedule phrasal verb", terms: ["put off", "fit in", "free up", "move", "reschedule", "make space"] },
        { label: "specific time or day", terms: ["monday", "tuesday", "wednesday", "thursday", "friday", "morning", "afternoon", "evening"] },
        { label: "clear decision", terms: ["should", "could", "is going to", "will", "needs to"] }
      ],
      unitTerms: ["put off", "fit in", "free up", "reschedule"],
      minWords: 12,
      maxSeconds: 38,
      improved: "Marcus should put off the radio interview and free up Friday afternoon so Olivia can prepare calmly.",
      complete: {
        file: "stage-06-complete.mp3",
        text: "Great. Now confirm the final agenda. Include one confirmed arrangement and one intention with going to."
      },
      clarify: {
        file: "stage-06-clarify.mp3",
        text: "Use put off, fit in, or free up. Tell me exactly what changes in the schedule."
      }
    },
    {
      id: "final-agenda",
      topic: "Confirm the final agenda",
      prompt: "Confirm the final agenda. Include one confirmed arrangement and one intention with going to.",
      frames: ["Olivia is ______ on ______, and she is going to ______.", "The final agenda is clear: she is ______, and she is going to ______."],
      vocabulary: ["final agenda", "is recording", "is rehearsing", "is meeting", "is going to", "on the same page"],
      grammar: "Mix present continuous for fixed arrangements with be going to for intentions.",
      checks: [
        { label: "final agenda language", terms: ["final agenda", "schedule", "agenda", "plan", "on the same page"] },
        { label: "confirmed arrangement", terms: ["is recording", "is rehearsing", "is meeting", "is going", "is having"] },
        { label: "intention", terms: ["going to", "is going to", "she's going to"] }
      ],
      unitTerms: ["final agenda", "is recording", "is rehearsing", "going to", "on the same page"],
      minWords: 13,
      maxSeconds: 40,
      improved: "The final agenda is clear: Olivia is recording on Wednesday afternoon, and she is going to rest before the weekend event.",
      complete: {
        file: "stage-07-complete.mp3",
        text: "That sounds organized. Finish the meeting by asking me one follow-up question about the updated schedule and explaining why the question matters."
      },
      clarify: {
        file: "stage-07-clarify.mp3",
        text: "Confirm one fixed arrangement with present continuous and one intention with going to."
      }
    },
    {
      id: "ask-marcus",
      topic: "Ask a follow-up question",
      prompt: "Ask Marcus one follow-up question about the updated schedule, and explain why that question matters.",
      frames: ["Could you confirm ______ so everyone is on the same page?", "Should we check ______ before Olivia decides?" ],
      vocabulary: ["Could you confirm...?", "Should we check...?", "on the same page", "before Olivia decides", "final agenda"],
      grammar: "Use could you or should we to ask a respectful meeting question.",
      checks: [
        { label: "a follow-up question", terms: ["could you", "can you", "should we", "do we", "is she", "are we", "?"] },
        { label: "schedule focus", terms: ["schedule", "agenda", "confirm", "check", "time", "day", "meeting"] },
        { label: "reason", terms: ["because", "so", "that way", "matters", "important"] }
      ],
      unitTerms: ["could you", "should we", "confirm", "on the same page"],
      minWords: 10,
      maxSeconds: 35,
      improved: "Could you confirm the Friday plan so everyone is on the same page before Olivia makes another commitment?",
      complete: {
        file: "stage-08-complete.mp3",
        text: "Excellent. Your schedule rescue meeting is complete. Review your report, then send it to the teacher if you are ready."
      },
      clarify: {
        file: "stage-08-clarify.mp3",
        text: "Ask me one clear question about the schedule. Then say why that question matters."
      }
    }
  ]
};
