(() => {
  "use strict";

  const API_PATH = "/api/english-basic/pronunciation-assessment";
  const AUDIO_ROOT = "audio/final-oral-task-mock/";
  const STORAGE_KEY = "jaralingua:english-basic:final-oral-task-mock:v1";
  const LOCAL_URL = "http://127.0.0.1:8020/ingles/basico/final-oral-interview-mock.html";
  const TRANSCRIPTION_TIMEOUT_MS = 25000;

  const QUESTIONS = [
    {
      id: "opening",
      topic: "Friendly opening",
      text: "Hello! What's your name, and what neighborhood do you live in?",
      audio: "turn-01-name-neighborhood.mp3",
      frames: ["My name is ______, and I live in ______.", "Hello, I'm ______. I live in the ______ neighborhood."],
      vocabulary: ["my name is", "I live in", "neighborhood", "near", "home"],
      grammar: "Use I am / I'm for your name and I live in for your neighborhood.",
      improved: "Hello, I'm [your name]. I live in the [name] neighborhood.",
      minWords: 6,
      maxSeconds: 20,
      assessed: false,
      mapPlaces: ["home"],
      checks: [
        { label: "your name", terms: ["my name is", "i am", "i'm", "im"] },
        { label: "your neighborhood", terms: ["i live", "neighborhood", "barrio"] }
      ],
      success: "Good warm-up. You introduced yourself and named your neighborhood.",
      shortTip: "Say your name and the neighborhood where you live."
    },
    {
      id: "overview",
      topic: "Neighborhood overview",
      text: "Nice to meet you. What is your neighborhood like? Tell me about two places near your home.",
      audio: "turn-02-neighborhood-overview.mp3",
      frames: ["My neighborhood is ______. There is a ______ near my home and a ______ next to ______.", "In my neighborhood, there are ______ and ______. It is a ______ place."],
      vocabulary: ["quiet", "busy", "safe", "friendly", "park", "library", "school", "supermarket", "near", "next to"],
      grammar: "Use there is for one place and there are for two or more places.",
      improved: "My neighborhood is quiet and friendly. There is a park near my home, and there is a supermarket next to the bank.",
      minWords: 12,
      maxSeconds: 30,
      mapPlaces: ["home", "park", "supermarket"],
      checks: [
        { label: "two neighborhood places", minMatches: 2, terms: ["park", "supermarket", "library", "school", "restaurant", "cafe", "bank", "church", "hospital", "gym", "bus stop"] },
        { label: "a general description", terms: ["quiet", "busy", "safe", "friendly", "beautiful", "small", "large", "modern", "nice", "dangerous", "noisy"] },
        { label: "a location expression", terms: ["near", "next to", "across from", "on the corner", "in front of", "behind", "between"] }
      ],
      success: "You described your neighborhood, named places, and located them.",
      shortTip: "Describe the neighborhood, name two places, and add one location expression."
    },
    {
      id: "supermarket",
      topic: "The supermarket",
      text: "Is there a supermarket near your home? Where is it, and what is it like?",
      audio: "turn-03-supermarket.mp3",
      frames: ["Yes, there is. The supermarket is ______ the ______. It is ______.", "There is a supermarket ______. It is ______, and I go there to ______."],
      vocabulary: ["supermarket", "grocery store", "near", "next to", "across from", "on the corner", "large", "small", "busy", "convenient"],
      grammar: "Start with Yes, there is / No, there isn't. Then use is + location phrase.",
      improved: "Yes, there is. The supermarket is across from the park. It is large, busy, and convenient.",
      minWords: 10,
      maxSeconds: 28,
      mapPlaces: ["home", "supermarket"],
      checks: [
        { label: "the supermarket", terms: ["supermarket", "grocery store", "market"] },
        { label: "its location", terms: ["near", "next to", "across from", "on the corner", "in front of", "behind", "between"] },
        { label: "one description", terms: ["large", "small", "busy", "quiet", "modern", "old", "convenient", "clean", "good", "nice"] }
      ],
      success: "You identified the supermarket, located it, and added a description.",
      shortTip: "Say where the supermarket is and add one adjective."
    },
    {
      id: "park-school",
      topic: "A park or school",
      text: "Now tell me about a park or a school in your neighborhood. Where is it, and what can people do there?",
      audio: "turn-04-park-or-school.mp3",
      frames: ["The ______ is ______ the ______. People can ______ there.", "There is a ______ near ______. It is ______, and people can ______."],
      vocabulary: ["park", "school", "playground", "near", "across from", "next to", "walk", "exercise", "relax", "study", "play"],
      grammar: "Use can + base verb: People can walk. Students can study.",
      improved: "The park is next to the school. It is green and peaceful, and people can walk, exercise, and relax there.",
      minWords: 11,
      maxSeconds: 30,
      mapPlaces: ["park", "school"],
      checks: [
        { label: "a park or school", terms: ["park", "playground", "green area", "school", "college", "university"] },
        { label: "its location", terms: ["near", "next to", "across from", "on the corner", "in front of", "behind", "between"] },
        { label: "an activity with can", terms: ["can walk", "can exercise", "can relax", "can play", "can study", "can learn", "can read", "people can", "students can", "children can"] }
      ],
      success: "You located the place and explained what people can do there.",
      shortTip: "Name the place, locate it, and include one activity with can."
    },
    {
      id: "restaurant",
      topic: "A nearby restaurant",
      text: "Is there a restaurant nearby? Where is it? Would you recommend it? Tell me why or why not.",
      audio: "turn-05-restaurant.mp3",
      frames: ["Yes, there is. The restaurant is ______. I recommend it because ______.", "There is a ______ restaurant ______ the ______. It is ______, and people can ______ there."],
      vocabulary: ["restaurant", "cafe", "nearby", "on the corner", "delicious", "affordable", "friendly", "eat", "have lunch", "because"],
      grammar: "Use I recommend it because + reason. Use can + base verb for activities.",
      improved: "There is a small restaurant on the corner near the library. I recommend it because the food is delicious and affordable.",
      minWords: 12,
      maxSeconds: 30,
      mapPlaces: ["restaurant", "library"],
      checks: [
        { label: "a restaurant", terms: ["restaurant", "cafe", "food place"] },
        { label: "its location", terms: ["near", "nearby", "next to", "across from", "on the corner", "in front of", "behind", "between"] },
        { label: "a recommendation and reason", terms: ["i recommend", "i don't recommend", "because", "good food", "delicious", "affordable", "expensive", "friendly", "nice"] }
      ],
      success: "You located the restaurant and supported your recommendation with a reason.",
      shortTip: "Locate the restaurant, say if you recommend it, and explain why."
    },
    {
      id: "student-question-1",
      topic: "Your first question",
      text: "Now it's your turn to interview me. Ask me two questions about places in my neighborhood. Ask your first question now.",
      audio: "turn-06-role-reversal.mp3",
      frames: ["Where is the ______ in your neighborhood?", "Is there a ______ near your home?"],
      vocabulary: ["Where is…?", "Is there…?", "Are there…?", "What can people do…?", "Do you like…?", "favorite place"],
      grammar: "Use question word order. Say Where is the library? or Is there a park?",
      improved: "Is there a library near your home, and what can people do there?",
      minWords: 5,
      maxSeconds: 22,
      interaction: true,
      mapPlaces: ["library", "park"],
      checks: [
        { label: "a clear question starter", terms: ["where is", "is there", "are there", "what can", "what do", "do you", "which place", "what is your", "how far"] },
        { label: "a neighborhood place", terms: ["park", "supermarket", "library", "school", "restaurant", "cafe", "bank", "church", "hospital", "gym", "bus stop", "place", "neighborhood"] }
      ],
      success: "You initiated the conversation with a clear neighborhood question.",
      shortTip: "Begin with Where is, Is there, Are there, What can, or Do you like."
    },
    {
      id: "student-question-2",
      topic: "Your second question",
      text: "Good. Now ask me your second question about my neighborhood.",
      audio: "turn-06-second-question.mp3",
      frames: ["What can people do at the ______?", "Do you like the ______ in your neighborhood? Why?"],
      vocabulary: ["What can…?", "Do you like…?", "Where is…?", "Are there…?", "favorite", "recommend"],
      grammar: "Ask a different question. Keep the auxiliary before the subject: Do you like…?",
      improved: "What is your favorite place in your neighborhood, and why do you like it?",
      minWords: 5,
      maxSeconds: 22,
      interaction: true,
      mapPlaces: ["park", "restaurant", "library"],
      checks: [
        { label: "a clear question starter", terms: ["where is", "is there", "are there", "what can", "what do", "do you", "which place", "what is your", "how far"] },
        { label: "a neighborhood topic", terms: ["park", "supermarket", "library", "school", "restaurant", "cafe", "bank", "church", "hospital", "gym", "bus stop", "place", "neighborhood", "favorite"] }
      ],
      success: "You completed the role reversal with a second clear question.",
      shortTip: "Ask a second question using a different question starter."
    },
    {
      id: "recommendation",
      topic: "Final recommendation",
      text: "Thank you. Which place in your neighborhood should I visit first, and why should I go there?",
      audio: "turn-07-recommendation.mp3",
      frames: ["You should visit the ______ first because ______.", "I recommend the ______. It is ______, and you can ______ there."],
      vocabulary: ["you should visit", "I recommend", "because", "beautiful", "interesting", "peaceful", "delicious", "relax", "eat", "learn"],
      grammar: "Use should + base verb and give a reason with because.",
      improved: "You should visit the park first because it is peaceful, beautiful, and a good place to relax.",
      minWords: 10,
      maxSeconds: 28,
      mapPlaces: ["park", "restaurant", "library"],
      checks: [
        { label: "a recommendation", terms: ["you should", "i recommend", "visit first", "go to", "my favorite place"] },
        { label: "a neighborhood place", terms: ["park", "supermarket", "library", "school", "restaurant", "cafe", "bank", "church", "hospital", "gym", "place"] },
        { label: "a reason", terms: ["because", "it is", "it's", "you can", "people can"] }
      ],
      success: "You finished with a clear recommendation and a supporting reason.",
      shortTip: "Recommend one place and explain why Emma should visit it."
    }
  ];

  const QUESTION_BY_ID = new Map(QUESTIONS.map((question) => [question.id, question]));
  const FULL_QUESTION_IDS = QUESTIONS.map((question) => question.id);

  const REACTIONS = [
    { terms: ["park", "playground", "green area"], file: "reaction-park.mp3", text: "That park sounds like a lovely place to walk, exercise, or relax." },
    { terms: ["supermarket", "grocery store", "market"], file: "reaction-supermarket.mp3", text: "That's convenient. It is very useful to have a supermarket close to home." },
    { terms: ["school", "college", "university"], file: "reaction-school.mp3", text: "That school sounds like an important place for families in the neighborhood." },
    { terms: ["restaurant", "food", "lunch", "dinner"], file: "reaction-restaurant.mp3", text: "That restaurant sounds interesting. I would like to know what food they serve." },
    { terms: ["library", "books", "read", "study"], file: "reaction-library.mp3", text: "I like that. A nearby library is a great place to read and study." },
    { terms: ["cafe", "coffee shop", "coffee"], file: "reaction-cafe.mp3", text: "That cafe sounds welcoming. It could be a nice place to meet a friend." },
    { terms: ["church", "chapel"], file: "reaction-church.mp3", text: "I understand. The church sounds like a familiar landmark in your neighborhood." },
    { terms: ["hospital", "clinic", "health center"], file: "reaction-hospital.mp3", text: "That is helpful to know. Having a hospital nearby can be very important." },
    { terms: ["bank", "cash", "money"], file: "reaction-bank.mp3", text: "That bank sounds easy to find. Thank you for explaining where it is." },
    { terms: ["gym", "sports center", "exercise"], file: "reaction-gym.mp3", text: "That gym sounds like a good place to exercise and stay active." }
  ];

  const EMMA_ANSWERS = [
    { test: (text) => includesAny(text, ["what can", "what do people", "what do you do"]), file: "emma-answer-what-can-do.mp3", text: "People can read and study at the library. They can also walk, exercise, and meet friends in Central Park." },
    { test: (text) => includesAny(text, ["favorite place", "which place", "recommend"]), file: "emma-answer-favorite-place.mp3", text: "My favorite place is Central Park. It is beautiful and peaceful, and I can exercise there after work." },
    { test: (text) => includesAny(text, ["where is", "where's"]), file: "emma-answer-where-is.mp3", text: "The public library is across from Central Park, on Green Street. It is next to a small cafe." },
    { test: (text) => includesAny(text, ["is there", "isn't there"]), file: "emma-answer-is-there.mp3", text: "Yes, there is. There is a small cafe next to the library, and there is a supermarket near the bus stop." },
    { test: (text) => includesAny(text, ["are there", "aren't there"]), file: "emma-answer-are-there.mp3", text: "Yes, there are. There are two parks and several small restaurants in my neighborhood." },
    { test: (text) => includesAny(text, ["do you like", "like your neighborhood"]), file: "emma-answer-do-you-like.mp3", text: "Yes, I do. I like my neighborhood because it is friendly, quiet, and easy to walk around." }
  ];

  const REPORT_CRITERIA = [
    { key: "communication", label: "Communication / Task completion", description: "Answers the requested parts with understandable information." },
    { key: "interaction", label: "Interaction and discourse", description: "Responds to Emma and asks two relevant questions." },
    { key: "fluency", label: "Fluency", description: "Maintains a natural, understandable A1 speaking pace." },
    { key: "language", label: "Vocabulary and structure", description: "Uses neighborhood vocabulary and useful sentence patterns." },
    { key: "pronunciation", label: "Pronunciation", description: "Uses transcription confidence as an approximate clarity signal." }
  ];

  const elements = Object.fromEntries([
    "onboardingPanel", "interviewPanel", "summaryPanel", "startInterviewButton", "preflightButton", "preflightStatus", "preflightPlayback", "reviewPreviousButton", "resumeNote",
    "guidedMode", "realisticMode", "welcomePlayButton", "welcomeAudio", "taskInstructionsPlayButton", "taskInstructionsAudio", "questionCounter", "questionTopic", "interviewProgressBar", "questionText", "interviewerStatus",
    "questionPlayButton", "interviewerAudio", "reactionAudio", "emmaReactionText", "emmaStage", "questionVisualPanel", "questionVisualImage", "questionVisualCaption", "answerSupport",
    "answerFrameGrid", "vocabularyBank", "grammarClue", "toggleHelpButton", "showHelpButton", "microphoneSelect", "levelMeterBar", "levelMeterValue", "micButton", "stopButton",
    "retryButton", "recordStatus", "recordHelp", "timer", "liveTranscript", "studentAudio", "answerFeedback", "transcriptionRecovery", "retryTranscriptionButton",
    "continueWithoutAnalysisButton", "unsupported", "nextQuestionButton", "summaryTitle", "summaryLead", "summaryScoreRing", "summaryScore", "summaryReadiness", "summaryComparison",
    "summaryMetrics", "summaryStrengths", "summaryPriorities", "summaryWordPractice", "attemptHistory", "summaryAnswers", "restartInterviewButton", "weakPracticeButton",
    "clearHistoryButton", "identityScore", "practiceDate", "answerRecorderSection", "floatingMicDock", "floatingTurnLabel", "floatingMicLabel", "floatingTimer",
    "floatingMicButton", "floatingStopButton", "floatingNextButton"
  ].map((id) => [id, document.getElementById(id)]));

  let persistent = loadPersistentState();
  let state = freshAttempt();
  let playbackSpeed = 1;
  let selectedFrame = null;
  let mediaRecorder = null;
  let mediaStream = null;
  let chunks = [];
  let startedAt = 0;
  let recordedDurationMs = 0;
  let timerHandle = null;
  let autoStopHandle = null;
  let objectUrl = null;
  let preflightObjectUrl = null;
  let currentBlob = null;
  let analyzing = false;
  let audioContext = null;
  let analyser = null;
  let meterFrame = null;
  let preflightStream = null;
  let floatingDockEnabled = false;
  let answerRecorderVisible = false;

  function freshAttempt(questionIds = FULL_QUESTION_IDS) {
    return { mode: "guided", currentIndex: 0, questionIds: [...questionIds], answers: Array(questionIds.length).fill(null), startedAt: "" };
  }

  function loadPersistentState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      return { history: Array.isArray(parsed?.history) ? parsed.history.slice(-10) : [] };
    } catch (_error) {
      return { history: [] };
    }
  }

  function savePersistentState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ history: persistent.history.slice(-10) }));
      return true;
    } catch (_error) {
      return false;
    }
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>\"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[character]);
  }

  function normalize(value) {
    return ` ${String(value || "").toLocaleLowerCase("en-US").replace(/[\u2019']/g, "'").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9'\s]/g, " ").replace(/\s+/g, " ").trim()} `;
  }

  function includesAny(normalizedText, terms) {
    return terms.some((term) => normalizedText.includes(` ${normalize(term).trim()} `));
  }

  function clamp(value, min = 0, max = 100) {
    return Math.max(min, Math.min(max, Math.round(Number(value) || 0)));
  }

  function currentQuestion() {
    return QUESTION_BY_ID.get(state.questionIds[state.currentIndex]) || QUESTIONS[0];
  }

  function questionAt(index) {
    return QUESTION_BY_ID.get(state.questionIds[index]) || QUESTIONS[0];
  }

  function cleanWhisperWords(words) {
    if (!Array.isArray(words)) return [];
    return words.map((word) => ({
      text: String(word?.text || "").replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9']+$/g, "").trim(),
      probability: Math.max(0, Math.min(1, Number(word?.probability) || 0))
    })).filter((word) => word.text);
  }

  function analyzeAnswer(transcript, durationMs, whisperWords = [], question = currentQuestion()) {
    const normalized = normalize(transcript);
    const words = normalized.trim().split(/\s+/).filter(Boolean);
    const clarityWords = cleanWhisperWords(whisperWords);
    const checks = question.checks.map((check) => {
      const matches = new Set(check.terms.filter((term) => includesAny(normalized, [term])).map((term) => normalize(term).trim())).size;
      return { label: check.label, met: matches >= (check.minMatches || 1), matches, expected: check.minMatches || 1 };
    });
    const checkRatio = checks.filter((check) => check.met).length / Math.max(1, checks.length);
    const lengthRatio = Math.min(1, words.length / Math.max(1, question.minWords));
    const communication = clamp(checkRatio * 72 + lengthRatio * 28);
    const questionForm = includesAny(normalized, ["where is", "is there", "are there", "what can", "what do", "do you", "which place", "what is your", "how far"]);
    const interaction = question.interaction ? (questionForm ? clamp(70 + checkRatio * 30) : 35) : clamp(62 + checkRatio * 30 + Math.min(8, words.length / 2));
    const durationMinutes = Math.max(1 / 60, durationMs / 60000);
    const wordsPerMinute = Math.round(words.length / durationMinutes);
    const fluency = durationMs < 2500 ? 35 : clamp(100 - Math.abs(wordsPerMinute - 88) * .85, 38, 100);
    const structureTerms = ["there is", "there are", "near", "next to", "across from", "on the corner", "people can", "you can", "i recommend", "you should", "because"];
    const structureMatches = structureTerms.filter((term) => includesAny(normalized, [term])).length;
    const language = clamp(checkRatio * 68 + Math.min(24, structureMatches * 8) + Math.min(8, words.length / 3));
    const averageProbability = clarityWords.length ? clarityWords.reduce((sum, word) => sum + word.probability, 0) / clarityWords.length : null;
    const pronunciation = averageProbability === null ? 68 : clamp(averageProbability * 100);
    const unclearWords = clarityWords.filter((word) => word.probability < .5).sort((a, b) => a.probability - b.probability).slice(0, 6);
    const metrics = { communication, interaction, fluency, language, pronunciation };
    const score100 = clamp(Object.values(metrics).reduce((sum, value) => sum + value, 0) / 5);
    const missing = checks.filter((check) => !check.met).map((check) => check.label);
    let message = question.success;
    if (words.length < question.minWords) message = question.shortTip;
    else if (missing.length) message = `Your answer is understandable. For a stronger response, add ${missing.join(" and ")}.`;
    if (unclearWords.length) message += " Repeat the lower-confidence words slowly, then say the complete idea naturally.";
    return {
      wordCount: words.length,
      wordsPerMinute,
      targetChecks: checks,
      coreComplete: words.length >= question.minWords && checks.every((check) => check.met),
      metrics,
      score100,
      unclearWords,
      message
    };
  }

  function setAvatar(nextState, label) {
    elements.emmaStage.dataset.state = nextState;
    elements.interviewerStatus.textContent = label || ({ speaking: "Emma is speaking", listening: "Emma is listening", thinking: "Emma is checking your answer", ready: "Emma is ready" }[nextState] || "Emma is ready");
  }

  function applyPlaybackSpeed(speed) {
    playbackSpeed = Number(speed) === .75 ? .75 : 1;
    [elements.welcomeAudio, elements.taskInstructionsAudio, elements.interviewerAudio, elements.reactionAudio].forEach((audio) => { if (audio) audio.playbackRate = playbackSpeed; });
    document.querySelectorAll("[data-speed], [data-global-speed]").forEach((button) => {
      const value = Number(button.dataset.speed || button.dataset.globalSpeed);
      button.classList.toggle("is-active", value === playbackSpeed);
    });
    if (!elements.interviewerAudio.paused || !elements.reactionAudio.paused) setAvatar("speaking", playbackSpeed === .75 ? "Emma is speaking slowly (0.75×)" : "Emma is speaking at normal speed (1×)");
  }

  function stopEmmaAudio() {
    [elements.welcomeAudio, elements.taskInstructionsAudio, elements.interviewerAudio, elements.reactionAudio].forEach((audio) => { audio.pause(); });
    setAvatar("ready", "Emma is ready");
  }

  async function playQuestion() {
    if (mediaRecorder?.state === "recording" || analyzing) return;
    if (!elements.reactionAudio.paused && !elements.reactionAudio.ended) elements.reactionAudio.pause();
    if (!elements.interviewerAudio.paused && !elements.interviewerAudio.ended) {
      elements.interviewerAudio.pause();
      return;
    }
    elements.interviewerAudio.playbackRate = playbackSpeed;
    try {
      await elements.interviewerAudio.play();
    } catch (_error) {
      setAvatar("ready", "Tap Play Emma to hear the question");
    }
  }

  function responseFor(question, transcript) {
    const normalized = normalize(transcript);
    if (question.interaction) {
      const matched = EMMA_ANSWERS.find((answer) => answer.test(normalized));
      return matched || { file: "emma-answer-generic-question.mp3", text: "That's a good question. Most places in my neighborhood are close together, so it is easy to walk from one place to another." };
    }
    const reaction = REACTIONS.find((item) => includesAny(normalized, item.terms));
    return reaction || { file: "reaction-generic-place.mp3", text: "Thank you. That place sounds like an important part of your neighborhood." };
  }

  async function playReaction(answer) {
    if (!answer?.transcript || answer.unavailable) return;
    const response = responseFor(currentQuestion(), answer.transcript);
    answer.emmaResponse = response;
    elements.emmaReactionText.textContent = response.text;
    elements.emmaReactionText.hidden = false;
    elements.reactionAudio.src = AUDIO_ROOT + response.file;
    elements.reactionAudio.playbackRate = playbackSpeed;
    try {
      await elements.reactionAudio.play();
    } catch (_error) {
      setAvatar("ready", "Emma's response is ready");
    }
  }

  function renderFrames() {
    const question = currentQuestion();
    selectedFrame = null;
    elements.answerFrameGrid.innerHTML = question.frames.map((frame, index) => `<button type="button" class="answer-frame" data-frame-index="${index}"><span>${index ? "B" : "A"}</span><div><strong>Option ${index ? "B" : "A"}</strong><small>${escapeHtml(frame)}</small></div></button>`).join("");
    elements.answerFrameGrid.querySelectorAll(".answer-frame").forEach((button) => button.addEventListener("click", () => {
      selectedFrame = Number(button.dataset.frameIndex);
      elements.answerFrameGrid.querySelectorAll(".answer-frame").forEach((item) => item.classList.toggle("is-selected", item === button));
    }));
  }

  function setHelpVisibility(show) {
    elements.answerSupport.hidden = !show;
    elements.showHelpButton.hidden = show || state.mode === "realistic";
  }

  function renderMapHighlights(question) {
    document.querySelectorAll(".map-label").forEach((label) => label.classList.toggle("is-active", (question.mapPlaces || []).includes(label.dataset.place)));
  }

  function formatTime(ms) {
    const seconds = Math.max(0, Math.floor(ms / 1000));
    return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  }

  function resetRecorderDisplay() {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = null;
    currentBlob = null;
    elements.studentAudio.removeAttribute("src");
    elements.studentAudio.hidden = true;
    elements.liveTranscript.classList.remove("has-text");
    elements.liveTranscript.textContent = "Your transcription will appear here after you finish.";
    elements.answerFeedback.hidden = true;
    elements.answerFeedback.innerHTML = "";
    elements.transcriptionRecovery.hidden = true;
    elements.timer.textContent = `00:00 / ${formatTime(currentQuestion().maxSeconds * 1000)}`;
    elements.floatingTimer.textContent = elements.timer.textContent;
    elements.recordStatus.textContent = "Ready for your answer";
    elements.recordHelp.textContent = "Tap the microphone and answer in English.";
    elements.levelMeterBar.style.width = "0";
    elements.levelMeterValue.textContent = "Waiting";
  }

  function renderQuestion(autoplay = false) {
    const question = currentQuestion();
    const total = state.questionIds.length;
    elements.questionCounter.textContent = `Turn ${state.currentIndex + 1} of ${total}`;
    elements.questionTopic.textContent = question.assessed === false ? `${question.topic} · Warm-up, not assessed` : question.topic;
    elements.interviewProgressBar.style.width = `${((state.currentIndex + 1) / total) * 100}%`;
    elements.questionText.textContent = question.text;
    elements.emmaReactionText.hidden = true;
    elements.emmaReactionText.textContent = "";
    elements.interviewerAudio.src = AUDIO_ROOT + question.audio;
    elements.interviewerAudio.load();
    renderFrames();
    elements.vocabularyBank.innerHTML = question.vocabulary.map((word) => `<span>${escapeHtml(word)}</span>`).join("");
    elements.grammarClue.textContent = question.grammar;
    setHelpVisibility(state.mode === "guided");
    renderMapHighlights(question);
    resetRecorderDisplay();
    elements.nextQuestionButton.innerHTML = state.currentIndex === total - 1 ? `Finish my mock <i class="bi bi-check2"></i>` : `Continue <i class="bi bi-arrow-right"></i>`;
    setAvatar("ready", "Emma is ready to ask this turn");
    updateRecorderControls();
    if (autoplay) playQuestion();
  }

  function updateFloatingDockVisibility() {
    const recording = mediaRecorder?.state === "recording";
    const shouldShow = floatingDockEnabled && !elements.interviewPanel.hidden && (recording || !answerRecorderVisible);
    elements.floatingMicDock.hidden = !shouldShow;
  }

  function updateFloatingDockControls() {
    const recording = mediaRecorder?.state === "recording";
    const hasAnswer = Boolean(state.answers[state.currentIndex]);
    const emmaPlaying = !elements.interviewerAudio.paused || !elements.reactionAudio.paused;
    elements.floatingTurnLabel.textContent = state.questionIds.length === 1 ? "Focused practice" : `Turn ${state.currentIndex + 1} of ${state.questionIds.length}`;
    elements.floatingTimer.textContent = elements.timer.textContent;
    elements.floatingMicButton.hidden = recording || hasAnswer;
    elements.floatingStopButton.hidden = !recording;
    elements.floatingNextButton.hidden = !hasAnswer || recording;
    elements.floatingMicButton.disabled = recording || analyzing || hasAnswer || emmaPlaying;
    elements.floatingStopButton.disabled = !recording || analyzing;
    elements.floatingNextButton.disabled = !hasAnswer || recording || analyzing || emmaPlaying;
    if (recording) {
      elements.floatingMicDock.dataset.state = "recording";
      elements.floatingMicLabel.textContent = "Recording your answer";
    } else if (analyzing) {
      elements.floatingMicDock.dataset.state = "analyzing";
      elements.floatingMicLabel.textContent = "Checking your English…";
    } else if (hasAnswer && emmaPlaying) {
      elements.floatingMicDock.dataset.state = "responding";
      elements.floatingMicLabel.textContent = "Emma is responding";
    } else if (hasAnswer) {
      elements.floatingMicDock.dataset.state = "complete";
      elements.floatingMicLabel.textContent = "Answer ready to continue";
    } else if (emmaPlaying) {
      elements.floatingMicDock.dataset.state = "listening";
      elements.floatingMicLabel.textContent = "Listen to Emma first";
    } else if (currentBlob) {
      elements.floatingMicDock.dataset.state = "recovery";
      elements.floatingMicLabel.textContent = "Record again or use recovery below";
    } else {
      elements.floatingMicDock.dataset.state = "ready";
      elements.floatingMicLabel.textContent = "Ready to answer";
    }
    updateFloatingDockVisibility();
  }

  function updateRecorderControls() {
    const recording = mediaRecorder?.state === "recording";
    const hasAnswer = Boolean(state.answers[state.currentIndex]);
    const emmaPlaying = !elements.interviewerAudio.paused || !elements.reactionAudio.paused;
    elements.micButton.classList.toggle("is-recording", recording);
    elements.micButton.querySelector("i").className = recording ? "bi bi-soundwave" : "bi bi-mic-fill";
    elements.micButton.disabled = recording || analyzing || hasAnswer || emmaPlaying;
    elements.stopButton.disabled = !recording || analyzing;
    elements.retryButton.disabled = recording || analyzing || !hasAnswer;
    elements.microphoneSelect.disabled = recording || analyzing;
    elements.nextQuestionButton.disabled = !hasAnswer || recording || analyzing || emmaPlaying;
    elements.questionPlayButton.disabled = recording || analyzing;
    updateFloatingDockControls();
  }

  async function refreshMicrophones() {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    try {
      const selected = elements.microphoneSelect.value;
      const devices = (await navigator.mediaDevices.enumerateDevices()).filter((device) => device.kind === "audioinput");
      elements.microphoneSelect.innerHTML = '<option value="">Default microphone</option>' + devices.map((device, index) => `<option value="${escapeHtml(device.deviceId)}">${escapeHtml(device.label || `Microphone ${index + 1}`)}</option>`).join("");
      if ([...elements.microphoneSelect.options].some((option) => option.value === selected)) elements.microphoneSelect.value = selected;
    } catch (_error) {
      elements.microphoneSelect.innerHTML = '<option value="">Default microphone</option>';
    }
  }

  function audioConstraints() {
    const constraints = window.JaraMicPermissions?.audioConstraints(elements.microphoneSelect.value) || { echoCancellation: { ideal: true }, noiseSuppression: { ideal: true }, autoGainControl: { ideal: true }, channelCount: { ideal: 1 } };
    if (elements.microphoneSelect.value) constraints.deviceId = { exact: elements.microphoneSelect.value };
    return constraints;
  }

  async function requestMicrophone() {
    if (!window.isSecureContext) {
      const error = new Error("The microphone requires HTTPS."); error.name = "SecurityError"; throw error;
    }
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      const error = new Error("This browser cannot record audio."); error.name = "NotSupportedError"; throw error;
    }
    if (window.JaraMicPermissions) {
      const ready = await window.JaraMicPermissions.ensureReady({ micButton: elements.micButton, stopButton: elements.stopButton, recordStatus: elements.recordStatus, recordHelp: elements.recordHelp, unsupported: elements.unsupported, localUrl: LOCAL_URL, language: "en" });
      if (!ready) return null;
      window.JaraMicPermissions.beforeRequest({ recordStatus: elements.recordStatus, recordHelp: elements.recordHelp, language: "en" });
    }
    return navigator.mediaDevices.getUserMedia({ audio: audioConstraints(), video: false });
  }

  function microphoneErrorMessage(error) {
    const messages = {
      NotAllowedError: "Microphone access was blocked. Allow it for JaraLingua in your browser settings and try again.",
      SecurityError: "The microphone requires the secure HTTPS version of JaraLingua.",
      NotFoundError: "No microphone was detected on this device.",
      NotReadableError: "Another application is using the microphone. Close WhatsApp, Zoom, Teams, or another recorder and try again.",
      AbortError: "The browser interrupted microphone activation. Please try again.",
      OverconstrainedError: "The selected microphone is unavailable. Choose the default microphone.",
      NotSupportedError: "This browser cannot record audio. Update Safari, Chrome, or Edge."
    };
    return messages[error?.name] || error?.message || "The microphone is unavailable.";
  }

  function preferredMimeType() {
    return ["audio/webm;codecs=opus", "audio/webm", "audio/mp4;codecs=mp4a.40.2", "audio/mp4"].find((type) => MediaRecorder.isTypeSupported(type)) || "";
  }

  function startLevelMeter(stream) {
    stopLevelMeter();
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    try {
      audioContext = new AudioContextClass();
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      audioContext.createMediaStreamSource(stream).connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      const paint = () => {
        if (!analyser) return;
        analyser.getByteFrequencyData(data);
        const average = data.reduce((sum, value) => sum + value, 0) / Math.max(1, data.length);
        const percent = Math.min(100, Math.round(average * 2.15));
        elements.levelMeterBar.style.width = `${percent}%`;
        elements.levelMeterValue.textContent = percent < 8 ? "Too quiet" : percent > 82 ? "Very loud" : "Good level";
        meterFrame = requestAnimationFrame(paint);
      };
      paint();
    } catch (_error) {
      elements.levelMeterValue.textContent = "Active";
    }
  }

  function stopLevelMeter() {
    if (meterFrame) cancelAnimationFrame(meterFrame);
    meterFrame = null;
    analyser = null;
    if (audioContext) audioContext.close().catch(() => {});
    audioContext = null;
  }

  function stopTracks() {
    stopLevelMeter();
    [mediaStream, preflightStream].forEach((stream) => stream?.getTracks().forEach((track) => track.stop()));
    mediaStream = null;
    preflightStream = null;
  }

  function updateTimer() {
    elements.timer.textContent = `${formatTime(Date.now() - startedAt)} / ${formatTime(currentQuestion().maxSeconds * 1000)}`;
    elements.floatingTimer.textContent = elements.timer.textContent;
  }

  async function preflightMicrophone() {
    if (elements.preflightButton.disabled) return;
    elements.preflightButton.disabled = true;
    elements.preflightStatus.textContent = "Preparing a four-second microphone and transcription check…";
    try {
      preflightStream = await requestMicrophone();
      if (!preflightStream) throw new Error("Microphone permission is still required.");
      await refreshMicrophones();
      const mimeType = preferredMimeType();
      const recorder = mimeType ? new MediaRecorder(preflightStream, { mimeType }) : new MediaRecorder(preflightStream);
      const sampleChunks = [];
      recorder.addEventListener("dataavailable", (event) => { if (event.data?.size) sampleChunks.push(event.data); });
      const completed = new Promise((resolve) => recorder.addEventListener("stop", resolve, { once: true }));
      recorder.start(250);
      elements.preflightStatus.textContent = "Recording test: say, “There is a park near my home.”";
      await new Promise((resolve) => setTimeout(resolve, 4200));
      if (recorder.state === "recording") recorder.stop();
      await completed;
      const blob = new Blob(sampleChunks, { type: recorder.mimeType || mimeType || "audio/webm" });
      preflightStream.getTracks().forEach((track) => track.stop());
      preflightStream = null;
      if (blob.size < 700) throw new Error("The test recording was empty. Choose another microphone and try again.");
      if (preflightObjectUrl) URL.revokeObjectURL(preflightObjectUrl);
      preflightObjectUrl = URL.createObjectURL(blob);
      elements.preflightPlayback.src = preflightObjectUrl;
      elements.preflightPlayback.hidden = false;
      elements.preflightStatus.textContent = "Audio recorded. Checking the English transcription service…";
      const payload = await requestTranscription(blob, 2);
      const sample = String(payload.text || "").trim();
      elements.preflightStatus.textContent = sample ? `Microphone and transcription ready. We heard: “${sample}”` : "Microphone ready. Play the test recording and begin when comfortable.";
      elements.preflightButton.innerHTML = '<i class="bi bi-check2-circle"></i> Test again';
    } catch (error) {
      elements.preflightStatus.textContent = `${microphoneErrorMessage(error)} You may test again or begin and retry on Turn 1.`;
    } finally {
      stopTracks();
      elements.preflightButton.disabled = false;
    }
  }

  async function startRecording() {
    if (analyzing || state.answers[state.currentIndex]) return;
    stopEmmaAudio();
    elements.transcriptionRecovery.hidden = true;
    try {
      mediaStream = await requestMicrophone();
      if (!mediaStream) return;
      await refreshMicrophones();
      const mimeType = preferredMimeType();
      mediaRecorder = mimeType ? new MediaRecorder(mediaStream, { mimeType }) : new MediaRecorder(mediaStream);
      chunks = [];
      mediaRecorder.addEventListener("dataavailable", (event) => { if (event.data?.size) chunks.push(event.data); });
      mediaRecorder.addEventListener("stop", handleRecordingStopped, { once: true });
      mediaRecorder.start(250);
      startedAt = Date.now();
      recordedDurationMs = 0;
      timerHandle = setInterval(updateTimer, 250);
      autoStopHandle = setTimeout(finishRecording, currentQuestion().maxSeconds * 1000);
      startLevelMeter(mediaStream);
      setAvatar("listening", "Emma is listening to you");
      elements.recordStatus.textContent = "Recording your answer…";
      elements.recordHelp.textContent = "Speak naturally. Tap Finish answer when your idea is complete.";
      updateRecorderControls();
    } catch (error) {
      elements.recordStatus.textContent = "The microphone could not start.";
      elements.recordHelp.textContent = microphoneErrorMessage(error);
      setAvatar("ready", "Emma is waiting while you check the microphone");
      updateRecorderControls();
    }
  }

  function finishRecording() {
    if (mediaRecorder?.state !== "recording") return;
    recordedDurationMs = Date.now() - startedAt;
    clearInterval(timerHandle);
    clearTimeout(autoStopHandle);
    timerHandle = null;
    autoStopHandle = null;
    mediaRecorder.stop();
    stopLevelMeter();
    elements.recordStatus.textContent = "Preparing your recording…";
    updateRecorderControls();
  }

  async function handleRecordingStopped() {
    stopTracks();
    currentBlob = new Blob(chunks, { type: mediaRecorder?.mimeType || "audio/webm" });
    chunks = [];
    if (currentBlob.size < 700 || recordedDurationMs < 700) {
      elements.recordStatus.textContent = "The recording was too short.";
      elements.recordHelp.textContent = "Tap the microphone and speak for a few seconds before finishing.";
      currentBlob = null;
      setAvatar("ready", "Emma did not hear a complete answer");
      updateRecorderControls();
      return;
    }
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = URL.createObjectURL(currentBlob);
    elements.studentAudio.src = objectUrl;
    elements.studentAudio.hidden = false;
    await transcribeCurrentBlob();
  }

  async function requestTranscription(blob, maxAttempts = 3) {
    let lastError = null;
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), TRANSCRIPTION_TIMEOUT_MS);
      try {
        const response = await fetch(API_PATH, { method: "POST", headers: { "Content-Type": blob.type || "audio/webm" }, body: blob, signal: controller.signal });
        const payload = await response.json().catch(() => ({}));
        if (response.ok) return payload;
        const error = new Error(payload.error || `Transcription service error (${response.status}).`);
        error.status = response.status;
        if (!(response.status === 429 || response.status >= 500) || attempt === maxAttempts) throw error;
        lastError = error;
      } catch (error) {
        lastError = error;
        const retryable = error.name === "AbortError" || error.name === "TypeError" || error.status === 429 || error.status >= 500;
        if (!retryable || attempt === maxAttempts) throw error;
      } finally {
        clearTimeout(timeout);
      }
      await new Promise((resolve) => setTimeout(resolve, 700 * (2 ** (attempt - 1))));
    }
    throw lastError || new Error("The transcription service did not answer.");
  }

  async function transcribeCurrentBlob() {
    if (!currentBlob || analyzing) return;
    analyzing = true;
    elements.transcriptionRecovery.hidden = true;
    elements.recordStatus.textContent = "Checking your English answer…";
    elements.liveTranscript.textContent = "Please wait. Your words will appear here.";
    setAvatar("thinking", "Emma is checking your answer");
    updateRecorderControls();
    try {
      const payload = await requestTranscription(currentBlob);
      const transcript = String(payload.text || "").trim();
      if (!transcript) {
        const error = new Error(Number(payload.audio?.rms || 0) < .0008 ? "The recording arrived silent. Choose another microphone and try again." : "Speech was detected, but no clear English words were transcribed.");
        throw error;
      }
      const whisperWords = cleanWhisperWords(payload.words);
      const answer = {
        questionId: currentQuestion().id,
        transcript,
        durationMs: recordedDurationMs,
        selectedFrame,
        whisperWords,
        analysis: analyzeAnswer(transcript, recordedDurationMs, whisperWords)
      };
      state.answers[state.currentIndex] = answer;
      elements.liveTranscript.textContent = transcript;
      elements.liveTranscript.classList.add("has-text");
      elements.recordStatus.textContent = "Answer transcribed. Listen to yourself and review the text.";
      elements.recordHelp.textContent = "If the transcription is not close to what you said, choose Record again.";
      if (state.mode === "guided") renderTurnFeedback(answer);
      await playReaction(answer);
    } catch (error) {
      elements.recordStatus.textContent = "The transcription service could not check this recording.";
      elements.recordHelp.textContent = "Your audio remains available on this screen. Retry the check, record again, or continue without analysis.";
      elements.liveTranscript.textContent = error.name === "AbortError" ? "The service took too long to answer." : (error.message || "Transcription unavailable.");
      elements.transcriptionRecovery.hidden = false;
      setAvatar("ready", "Emma is ready when you choose how to continue");
    } finally {
      analyzing = false;
      updateRecorderControls();
    }
  }

  function continueWithoutAnalysis() {
    if (!currentBlob || analyzing) return;
    state.answers[state.currentIndex] = { questionId: currentQuestion().id, transcript: "", durationMs: recordedDurationMs, unavailable: true, analysis: null };
    elements.liveTranscript.textContent = "Transcription unavailable. This turn will appear as not analyzed in your private report.";
    elements.liveTranscript.classList.add("has-text");
    elements.transcriptionRecovery.hidden = true;
    elements.recordStatus.textContent = "Recording kept for your self-review on this screen.";
    elements.recordHelp.textContent = "Continue when you are ready. No words or score were invented for this turn.";
    updateRecorderControls();
  }

  function renderTurnFeedback(answer) {
    const analysis = answer.analysis;
    const checks = analysis.targetChecks.map((check) => `<span class="feedback-check ${check.met ? "is-met" : ""}"><i class="bi ${check.met ? "bi-check-circle-fill" : "bi-circle"}"></i>${escapeHtml(check.label)}</span>`).join("");
    const unclear = analysis.unclearWords.length ? `<div class="answer-word-review"><strong>Words to repeat more clearly:</strong> ${analysis.unclearWords.map((word) => `${escapeHtml(word.text)} (${Math.round(word.probability * 100)}%)`).join(", ")}</div>` : "";
    elements.answerFeedback.innerHTML = `<div class="feedback-checks">${currentQuestion().assessed === false ? '<span class="feedback-check is-met"><i class="bi bi-emoji-smile"></i>Warm-up only</span>' : `<span class="feedback-check is-met"><i class="bi bi-clipboard-data"></i>Practice readiness: ${Math.round(analysis.score100 / 10)}/10</span>`}${checks}</div><p class="feedback-message">${escapeHtml(analysis.message)}</p>${unclear}<p class="feedback-note">This is rule-based formative feedback. It does not replace teacher evaluation.</p>`;
    elements.answerFeedback.hidden = false;
  }

  function retryCurrentAnswer() {
    if (mediaRecorder?.state === "recording" || analyzing) return;
    state.answers[state.currentIndex] = null;
    elements.reactionAudio.pause();
    elements.emmaReactionText.hidden = true;
    resetRecorderDisplay();
    renderFrames();
    setAvatar("ready", "Emma is ready for your new answer");
    updateRecorderControls();
    elements.micButton.focus();
  }

  function beginAttempt(questionIds = FULL_QUESTION_IDS, mode = null) {
    state = freshAttempt(questionIds);
    state.mode = mode || (elements.realisticMode.checked ? "realistic" : "guided");
    state.startedAt = new Date().toISOString();
    elements.onboardingPanel.hidden = true;
    elements.summaryPanel.hidden = true;
    elements.interviewPanel.hidden = false;
    floatingDockEnabled = true;
    renderQuestion(true);
    document.getElementById("oralMockApp").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function startInterview() {
    beginAttempt(FULL_QUESTION_IDS);
  }

  function aggregateUnclearWords(answers) {
    const grouped = new Map();
    answers.forEach((answer) => (answer?.analysis?.unclearWords || []).forEach((word) => {
      const key = normalize(word.text).trim();
      if (!key) return;
      const item = grouped.get(key) || { text: word.text, total: 0, count: 0 };
      item.total += word.probability;
      item.count += 1;
      grouped.set(key, item);
    }));
    return [...grouped.values()].map((item) => ({ text: item.text, probability: item.total / item.count, count: item.count })).sort((a, b) => a.probability - b.probability).slice(0, 10);
  }

  function readinessLabel(score) {
    if (score >= 45) return "Very ready for the Final Oral Task";
    if (score >= 39) return "Ready with minor practice";
    if (score >= 32) return "Developing well";
    if (score >= 25) return "Keep building complete answers";
    return "Practice step by step with the guided mode";
  }

  function rubricBand(score) {
    if (score >= 10) return "Exemplary";
    if (score >= 8) return "Proficient";
    if (score >= 6) return "Fair";
    if (score >= 4) return "Low";
    if (score >= 1) return "Weak";
    return "Not analyzed";
  }

  function criterionStrength(key) {
    return ({
      communication: "You usually included the information Emma requested.",
      interaction: "You responded to Emma and participated in the role reversal.",
      fluency: "Your speaking pace was generally understandable for an A1 conversation.",
      language: "You used useful neighborhood vocabulary and sentence patterns.",
      pronunciation: "Most words were recognized with useful transcription confidence."
    })[key];
  }

  function criterionPriority(key) {
    return ({
      communication: "Include every requested part: place, location, description, activity, or reason.",
      interaction: "Practice two clear questions beginning with Where is, Is there, What can, or Do you like.",
      fluency: "Speak in short word groups without rushing or leaving very long pauses.",
      language: "Use there is / there are, location expressions, can + verb, and because.",
      pronunciation: "Repeat lower-confidence words slowly, then use them in a complete sentence."
    })[key];
  }

  function buildReport() {
    const assessed = state.answers.map((answer, index) => ({ answer, question: questionAt(index), index })).filter((item) => item.question.assessed !== false);
    const analyzed = assessed.filter((item) => item.answer?.analysis);
    const criteria = {};
    REPORT_CRITERIA.forEach(({ key }) => {
      const average = analyzed.length ? analyzed.reduce((sum, item) => sum + item.answer.analysis.metrics[key], 0) / assessed.length : 0;
      criteria[key] = analyzed.length ? Math.max(1, Math.min(10, Math.round(average / 10))) : 0;
    });
    const score = Object.values(criteria).reduce((sum, value) => sum + value, 0);
    const ranked = REPORT_CRITERIA.map((criterion) => ({ ...criterion, score: criteria[criterion.key] })).sort((a, b) => b.score - a.score);
    const scoredTurns = assessed.filter((item) => item.answer?.analysis).map((item) => ({ id: item.question.id, score: item.answer.analysis.score100 }));
    const weakestQuestionId = scoredTurns.sort((a, b) => a.score - b.score)[0]?.id || "overview";
    const previous = persistent.history[persistent.history.length - 1];
    let comparison = "This is your first result on this device. Repeat the mock whenever you want.";
    if (previous) {
      const difference = score - Number(previous.score || 0);
      if (difference > 0) comparison = `You improved by ${difference} point${difference === 1 ? "" : "s"} compared with your previous complete attempt.`;
      else if (difference === 0) comparison = "You matched your previous complete attempt. Review one priority and try again.";
      else comparison = `This result is ${Math.abs(difference)} point${Math.abs(difference) === 1 ? "" : "s"} below your previous attempt. Use Guided Rehearsal for your weakest turn.`;
    }
    return {
      score,
      criteria,
      readiness: readinessLabel(score),
      strengths: ranked.slice(0, 2).map((criterion) => criterionStrength(criterion.key)),
      priorities: ranked.slice(-2).reverse().map((criterion) => criterionPriority(criterion.key)),
      unclearWords: aggregateUnclearWords(analyzed.map((item) => item.answer)),
      weakestQuestionId,
      analyzedCount: analyzed.length,
      assessedCount: assessed.length,
      comparison,
      completedAt: new Date().toISOString()
    };
  }

  function renderAttemptHistory() {
    elements.attemptHistory.innerHTML = persistent.history.length ? persistent.history.slice(-6).map((attempt, index, items) => {
      const date = new Date(attempt.completedAt || Date.now());
      const label = Number.isNaN(date.getTime()) ? "Practice" : date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const number = persistent.history.length - items.length + index + 1;
      return `<article class="attempt-card ${index === items.length - 1 ? "is-current" : ""}"><small>Attempt ${number} · ${escapeHtml(label)}</small><strong>${escapeHtml(attempt.score)}/50</strong><span>${escapeHtml(attempt.readiness || "Practice")}</span></article>`;
    }).join("") : '<p class="word-practice-clear">No results are stored on this device yet.</p>';
  }

  function showSummary(report, playClosing = true) {
    stopTracks();
    stopEmmaAudio();
    elements.onboardingPanel.hidden = true;
    elements.interviewPanel.hidden = true;
    elements.summaryPanel.hidden = false;
    floatingDockEnabled = false;
    updateFloatingDockControls();
    elements.summaryTitle.textContent = state.questionIds.length === 1 ? "Your focused-turn practice report" : "Your Final Oral Task practice report";
    elements.summaryLead.textContent = `${report.analyzedCount} of ${report.assessedCount} assessed turns were analyzed. Use the evidence below to prepare your next conversation.`;
    elements.summaryScore.textContent = report.score;
    elements.summaryScoreRing.style.setProperty("--score", report.score);
    elements.summaryScoreRing.style.setProperty("--score-angle", `${report.score * 2}%`);
    elements.summaryReadiness.textContent = report.readiness;
    elements.summaryComparison.textContent = report.comparison;
    elements.identityScore.textContent = `${report.score} / 50`;
    elements.summaryMetrics.innerHTML = REPORT_CRITERIA.map((criterion) => `<article class="summary-metric"><header><strong>${report.criteria[criterion.key]}</strong><span>/10</span></header><p>${escapeHtml(criterion.label)}</p><p class="summary-rubric-band">${rubricBand(report.criteria[criterion.key])}</p><div class="summary-metric-bar"><i style="width:${report.criteria[criterion.key] * 10}%"></i></div><p>${escapeHtml(criterion.description)}</p></article>`).join("");
    elements.summaryStrengths.innerHTML = report.strengths.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
    elements.summaryPriorities.innerHTML = report.priorities.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
    elements.summaryWordPractice.innerHTML = report.unclearWords.length ? `<div class="word-practice-list">${report.unclearWords.map((word) => `<span class="word-practice-chip">${escapeHtml(word.text)} <small>${Math.round(word.probability * 100)}%${word.count > 1 ? ` · ${word.count} times` : ""}</small></span>`).join("")}</div>` : '<p class="word-practice-clear"><i class="bi bi-check-circle-fill"></i> No repeated lower-confidence words were found in this attempt.</p>';
    elements.summaryAnswers.innerHTML = state.answers.map((answer, index) => {
      if (!answer) return "";
      const question = questionAt(index);
      if (answer.unavailable) return `<article class="summary-answer"><header><h3>${index + 1}. ${escapeHtml(question.topic)}</h3><span class="summary-answer-score">Not analyzed</span></header><p>The audio was available for self-review, but the transcription service did not return text. No score or words were invented for this turn.</p></article>`;
      const metrics = answer.analysis.metrics;
      const unclear = answer.analysis.unclearWords || [];
      return `<article class="summary-answer"><header><h3>${index + 1}. ${escapeHtml(question.topic)}${question.assessed === false ? " · Warm-up" : ""}</h3><span class="summary-answer-score">${question.assessed === false ? "Not scored" : `${Math.round(answer.analysis.score100 / 10)}/10`}</span></header><blockquote>${escapeHtml(answer.transcript)}</blockquote><div class="answer-metric-grid"><div class="answer-mini-metric"><strong>${Math.round(metrics.communication / 10)}</strong><small>Task</small></div><div class="answer-mini-metric"><strong>${Math.round(metrics.interaction / 10)}</strong><small>Interaction</small></div><div class="answer-mini-metric"><strong>${Math.round(metrics.fluency / 10)}</strong><small>Fluency</small></div><div class="answer-mini-metric"><strong>${Math.round(metrics.language / 10)}</strong><small>Language</small></div><div class="answer-mini-metric"><strong>${Math.round(metrics.pronunciation / 10)}</strong><small>Pronunciation</small></div></div><p>${escapeHtml(answer.analysis.message)}</p>${unclear.length ? `<div class="answer-word-review"><strong>Words to repeat:</strong> ${unclear.map((word) => `${escapeHtml(word.text)} (${Math.round(word.probability * 100)}%)`).join(", ")}</div>` : ""}<div class="answer-model"><strong>Stronger answer model</strong>${escapeHtml(question.improved)}</div></article>`;
    }).join("");
    elements.weakPracticeButton.hidden = !report.weakestQuestionId;
    elements.weakPracticeButton.dataset.questionId = report.weakestQuestionId;
    renderAttemptHistory();
    if (playClosing) {
      elements.reactionAudio.src = AUDIO_ROOT + "closing-complete.mp3";
      elements.reactionAudio.playbackRate = playbackSpeed;
      elements.reactionAudio.play().catch(() => {});
    }
    elements.summaryPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function nextQuestion() {
    if (!state.answers[state.currentIndex] || analyzing) return;
    if (state.currentIndex < state.questionIds.length - 1) {
      state.currentIndex += 1;
      renderQuestion(true);
      elements.interviewPanel.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    const report = buildReport();
    if (state.questionIds.length > 1) {
      persistent.history.push({ score: report.score, criteria: report.criteria, readiness: report.readiness, completedAt: report.completedAt });
      persistent.history = persistent.history.slice(-10);
      savePersistentState();
    }
    showSummary(report, true);
  }

  function restartInterview() {
    beginAttempt(FULL_QUESTION_IDS, elements.realisticMode.checked ? "realistic" : "guided");
  }

  function practiceWeakestTurn() {
    const id = elements.weakPracticeButton.dataset.questionId;
    if (!QUESTION_BY_ID.has(id)) return;
    elements.guidedMode.checked = true;
    elements.realisticMode.checked = false;
    updateModeCards();
    beginAttempt([id], "guided");
  }

  function clearHistory() {
    persistent.history = [];
    try { localStorage.removeItem(STORAGE_KEY); } catch (_error) { /* Storage is optional. */ }
    renderAttemptHistory();
  }

  function updateModeCards() {
    document.querySelectorAll(".practice-mode-card").forEach((card) => card.classList.toggle("is-selected", Boolean(card.querySelector("input")?.checked)));
  }

  function preparePage() {
    if (elements.practiceDate && !elements.practiceDate.value) elements.practiceDate.value = new Date().toISOString().slice(0, 10);
    elements.reviewPreviousButton.hidden = true;
    updateModeCards();
    renderAttemptHistory();
    refreshMicrophones();
    if ("IntersectionObserver" in window) {
      const recorderObserver = new IntersectionObserver((entries) => {
        answerRecorderVisible = entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= .2);
        updateFloatingDockVisibility();
      }, { threshold: [0, .2, .6] });
      recorderObserver.observe(elements.answerRecorderSection);
    }
    updateFloatingDockControls();
  }

  elements.startInterviewButton.addEventListener("click", startInterview);
  elements.preflightButton.addEventListener("click", preflightMicrophone);
  elements.questionPlayButton.addEventListener("click", playQuestion);
  function bindOnboardingAudio(button, audio, readyLabel, readyIcon) {
    button.addEventListener("click", async () => {
      if (!audio.paused && !audio.ended) { audio.pause(); return; }
      [elements.welcomeAudio, elements.taskInstructionsAudio].forEach((other) => { if (other !== audio) other.pause(); });
      audio.playbackRate = playbackSpeed;
      try { await audio.play(); } catch (_error) { /* A second tap will work on restrictive browsers. */ }
    });
    audio.addEventListener("play", () => { button.querySelector("i").className = "bi bi-pause-fill"; button.querySelector("span").textContent = "Pause Emma"; });
    const reset = () => { button.querySelector("i").className = readyIcon; button.querySelector("span").textContent = readyLabel; };
    audio.addEventListener("pause", reset);
    audio.addEventListener("ended", reset);
  }
  bindOnboardingAudio(elements.welcomePlayButton, elements.welcomeAudio, "Hear Emma's welcome", "bi bi-play-fill");
  bindOnboardingAudio(elements.taskInstructionsPlayButton, elements.taskInstructionsAudio, "Hear the task instructions", "bi bi-volume-up-fill");
  document.querySelectorAll("[data-speed], [data-global-speed]").forEach((button) => button.addEventListener("click", () => applyPlaybackSpeed(button.dataset.speed || button.dataset.globalSpeed)));
  [elements.guidedMode, elements.realisticMode].forEach((input) => input.addEventListener("change", updateModeCards));
  elements.toggleHelpButton.addEventListener("click", () => setHelpVisibility(false));
  elements.showHelpButton.addEventListener("click", () => setHelpVisibility(true));
  elements.micButton.addEventListener("click", startRecording);
  elements.stopButton.addEventListener("click", finishRecording);
  elements.floatingMicButton.addEventListener("click", startRecording);
  elements.floatingStopButton.addEventListener("click", finishRecording);
  elements.floatingNextButton.addEventListener("click", nextQuestion);
  elements.retryButton.addEventListener("click", retryCurrentAnswer);
  elements.retryTranscriptionButton.addEventListener("click", transcribeCurrentBlob);
  elements.continueWithoutAnalysisButton.addEventListener("click", continueWithoutAnalysis);
  elements.nextQuestionButton.addEventListener("click", nextQuestion);
  elements.restartInterviewButton.addEventListener("click", restartInterview);
  elements.weakPracticeButton.addEventListener("click", practiceWeakestTurn);
  elements.clearHistoryButton.addEventListener("click", clearHistory);

  elements.interviewerAudio.addEventListener("play", () => { setAvatar("speaking", playbackSpeed === .75 ? "Emma is speaking slowly (0.75×)" : "Emma is speaking at normal speed (1×)"); updateRecorderControls(); });
  elements.interviewerAudio.addEventListener("pause", () => { if (elements.interviewerAudio.currentTime && !elements.interviewerAudio.ended) setAvatar("ready", "Emma paused"); updateRecorderControls(); });
  elements.interviewerAudio.addEventListener("ended", () => { setAvatar("ready", "Your turn to answer"); updateRecorderControls(); });
  elements.reactionAudio.addEventListener("play", () => { setAvatar("speaking", playbackSpeed === .75 ? "Emma is responding slowly (0.75×)" : "Emma is responding at normal speed (1×)"); updateRecorderControls(); });
  elements.reactionAudio.addEventListener("pause", updateRecorderControls);
  elements.reactionAudio.addEventListener("ended", () => { setAvatar("ready", "Emma is ready to continue"); updateRecorderControls(); });
  navigator.mediaDevices?.addEventListener?.("devicechange", refreshMicrophones);
  window.addEventListener("pagehide", () => { if (mediaRecorder?.state === "recording") finishRecording(); stopTracks(); if (objectUrl) URL.revokeObjectURL(objectUrl); if (preflightObjectUrl) URL.revokeObjectURL(preflightObjectUrl); });
  window.addEventListener("beforeunload", () => { stopTracks(); if (objectUrl) URL.revokeObjectURL(objectUrl); if (preflightObjectUrl) URL.revokeObjectURL(preflightObjectUrl); });
  document.addEventListener("visibilitychange", () => { if (document.hidden && mediaRecorder?.state === "recording") finishRecording(); });

  if (window.__JARA_ORAL_MOCK_TEST__) {
    window.__JaraFinalOralTaskMockTest = { QUESTIONS, analyzeAnswer, responseFor, readinessLabel, rubricBand, buildReport, REPORT_CRITERIA, getState: () => state };
  }

  applyPlaybackSpeed(1);
  preparePage();
})();
