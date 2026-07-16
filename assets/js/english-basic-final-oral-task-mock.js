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

  const TURN_RESPONSES = {
    opening: { file: "response-opening.mp3", text: "Thank you. Now I know your name and where you live." },
    overview: { file: "response-overview.mp3", text: "Thank you. Now I know more about your neighborhood and the places near your home." },
    supermarketYes: { file: "reaction-supermarket.mp3", text: "That's convenient. It is very useful to have a supermarket close to home." },
    supermarketNo: { file: "response-no-supermarket.mp3", text: "I understand. Thank you for explaining that there is not a supermarket near your home." },
    parkSchool: { file: "response-park-or-school.mp3", text: "Great. Now I know where that place is and what people can do there." },
    restaurantYes: { file: "reaction-restaurant.mp3", text: "Thank you. Now I know where the restaurant is." },
    restaurantNo: { file: "response-no-restaurant.mp3", text: "I see. So there is not a restaurant nearby. Thank you for letting me know." },
    restaurantNotRecommended: { file: "response-not-recommended.mp3", text: "I understand. I can choose another place to eat. Thank you for explaining why." },
    recommendation: { file: "response-final-recommendation.mp3", text: "Thank you for the recommendation. Now I know which place to visit first." },
    continue: { file: "fallback-continue.mp3", text: "Thank you for your answer. Let's continue with the conversation." }
  };

  const STUDENT_QUESTION_RESPONSES = {
    whereLibrary: { file: "emma-answer-where-is.mp3", text: "The public library is across from Central Park, on Green Street. It is next to a small cafe." },
    wherePlace: { file: "emma-answer-where-is-other-place.mp3", text: "It is near Central Park, on Green Street. You can walk there." },
    wherePark: { file: "emma-answer-where-is-park.mp3", text: "Central Park is on Green Street, across from the public library." },
    wherePlaces: { file: "emma-answer-where-are-other-places.mp3", text: "They are near Central Park, between Green Street and Oak Avenue." },
    isThere: { file: "emma-answer-is-there-other-place.mp3", text: "Yes, there is. It is on Green Street, near Central Park." },
    isTherePark: { file: "emma-answer-is-there-park.mp3", text: "Yes, there is. Central Park is on Green Street, across from the public library." },
    areThere: { file: "emma-answer-are-there-other-places.mp3", text: "Yes, there are. You can find them near Central Park." },
    foodActivity: { file: "emma-answer-what-can-do-food.mp3", text: "People can eat, have a drink, and meet friends there." },
    shoppingActivity: { file: "emma-answer-what-can-do-shopping.mp3", text: "People can buy groceries and other things they need there." },
    pharmacyActivity: { file: "emma-answer-what-can-do-pharmacy.mp3", text: "People can buy medicine and get help there." },
    studyActivity: { file: "emma-answer-what-can-do-study.mp3", text: "People can study, read, and learn there." },
    parkActivity: { file: "emma-answer-what-can-do-park.mp3", text: "People can walk, exercise, play, and relax there." },
    bankActivity: { file: "emma-answer-what-can-do-bank.mp3", text: "People can get money and pay bills there." },
    hospitalActivity: { file: "emma-answer-what-can-do-hospital.mp3", text: "People can see a doctor and get help there." },
    churchActivity: { file: "emma-answer-what-can-do-church.mp3", text: "People can pray and meet other people there." },
    busStopActivity: { file: "emma-answer-what-can-do-bus-stop.mp3", text: "People can wait for the bus and travel to other parts of the city from there." },
    gymActivity: { file: "emma-answer-what-can-do-gym.mp3", text: "People can exercise and play sports there." },
    neighborhoodActivity: { file: "emma-answer-what-can-do.mp3", text: "People can read and study at the library. They can also walk, exercise, and meet friends in Central Park." },
    myNeighborhoodActivity: { file: "emma-answer-what-i-do-neighborhood.mp3", text: "I walk in Central Park, read at the library, and visit my friends." },
    genericActivity: { file: "emma-answer-what-can-do-general.mp3", text: "People can get help and do different activities there." },
    likeNeighborhood: { file: "emma-answer-do-you-like.mp3", text: "Yes, I do. I like my neighborhood because it is friendly, quiet, and easy to walk around." },
    likePlace: { file: "emma-answer-do-you-like-place.mp3", text: "Yes, I do. I like it because it is useful and close to my home." },
    recommendPlace: { file: "emma-answer-do-you-recommend-place.mp3", text: "Yes, I do. I recommend it because it is a good place near my home." },
    favoritePlace: { file: "emma-answer-favorite-place.mp3", text: "My favorite place is Central Park. It is beautiful and peaceful, and I can exercise there after work." },
    favoriteSpecificPlace: { file: "emma-answer-favorite-specific-place.mp3", text: "My favorite one is near Central Park. I like it because it is useful and close to my home." },
    favoriteFoodPlace: { file: "emma-answer-favorite-food-place.mp3", text: "My favorite place to eat is Green Cafe. It is near Central Park, and the food is good." },
    recommendFoodPlace: { file: "emma-answer-recommend-food-place.mp3", text: "I recommend Green Cafe. It is near Central Park, and the food is good." },
    distance: { file: "emma-answer-how-far.mp3", text: "It is about a ten-minute walk from my home." },
    distanceBetweenPlaces: { file: "emma-answer-distance-between-places.mp3", text: "They are about a five-minute walk from each other." },
    neighborhoodDescription: { file: "emma-answer-neighborhood-like.mp3", text: "My neighborhood is quiet, friendly, and nice. There are many useful places near my home." },
    compoundLibraryExists: { file: "emma-answer-library-exists-activities.mp3", text: "Yes, there is. The library is across from Central Park. People can read and study there." },
    compoundLibraryLocation: { file: "emma-answer-library-location-activities.mp3", text: "The library is across from Central Park. People can read and study there." },
    compoundPlaceExists: { file: "emma-answer-place-exists-activities.mp3", text: "Yes, there is. It is near Central Park. People can do different activities there." },
    compoundPlaceLocation: { file: "emma-answer-place-location-activities.mp3", text: "It is near Central Park, on Green Street. People can do different activities there." },
    compoundParkExists: { file: "emma-answer-park-exists-activities.mp3", text: "Yes, there is. Central Park is on Green Street. People can walk and relax there." },
    compoundParkLocation: { file: "emma-answer-park-location-activities.mp3", text: "Central Park is on Green Street. People can walk and relax there." },
    compoundPlacesExist: { file: "emma-answer-places-exist-activities.mp3", text: "Yes, there are. They are near Central Park. People can do different activities there." },
    compoundPlacesLocation: { file: "emma-answer-places-location-activities.mp3", text: "They are near Central Park. People can do different activities there." },
    compoundParksExist: { file: "emma-answer-parks-exist-activities.mp3", text: "Yes, there are. People can walk, play, and relax in the parks." },
    compoundParksLocation: { file: "emma-answer-parks-location-activities.mp3", text: "The parks are on Green Street. People can walk, play, and relax there." },
    myPlaceActivity: { file: "emma-answer-what-i-do-place.mp3", text: "I go there, spend some time, and do activities with my friends." },
    whereParkLibrary: { file: "emma-answer-where-park-library.mp3", text: "Central Park is on Green Street. The public library is across from the park." },
    unknownPlace: { file: "emma-answer-unknown-place.mp3", text: "I do not know that place. Please ask me about another place in my neighborhood." },
    differentQuestion: { file: "emma-answer-different-question.mp3", text: "Please ask a different question this time. You can ask about another place." },
    retryQuestion: { file: "emma-answer-question-retry.mp3", text: "I am ready for your question. Please ask me about a place in my neighborhood." }
  };

  const ACTIVITY_RESPONSES = [
    { key: "food", terms: ["restaurant", "restaurants", "cafe", "cafes", "coffee shop", "coffee shops", "food court", "food courts"], response: STUDENT_QUESTION_RESPONSES.foodActivity },
    { key: "pharmacy", terms: ["pharmacy", "pharmacies", "drugstore", "drugstores"], response: STUDENT_QUESTION_RESPONSES.pharmacyActivity },
    { key: "shopping", terms: ["supermarket", "supermarkets", "grocery store", "grocery stores", "market", "markets", "store", "stores", "shop", "shops"], response: STUDENT_QUESTION_RESPONSES.shoppingActivity },
    { key: "study", terms: ["library", "libraries", "school", "schools", "college", "colleges", "university", "universities"], response: STUDENT_QUESTION_RESPONSES.studyActivity },
    { key: "park", terms: ["park", "parks", "playground", "playgrounds", "green area", "green areas"], response: STUDENT_QUESTION_RESPONSES.parkActivity },
    { key: "bank", terms: ["bank", "banks"], response: STUDENT_QUESTION_RESPONSES.bankActivity },
    { key: "hospital", terms: ["hospital", "hospitals", "clinic", "clinics", "health center", "health centers"], response: STUDENT_QUESTION_RESPONSES.hospitalActivity },
    { key: "church", terms: ["church", "churches", "chapel", "chapels"], response: STUDENT_QUESTION_RESPONSES.churchActivity },
    { key: "transit", terms: ["bus stop", "bus stops", "bus station", "bus stations"], response: STUDENT_QUESTION_RESPONSES.busStopActivity },
    { key: "gym", terms: ["gym", "gyms", "sports center", "sports centers"], response: STUDENT_QUESTION_RESPONSES.gymActivity }
  ];

  const CANONICAL_ENTITIES = [
    { key: "restaurant", terms: ["restaurant", "restaurants"] }, { key: "cafe", terms: ["cafe", "cafes", "coffee shop", "coffee shops"] },
    { key: "pharmacy", terms: ["pharmacy", "pharmacies", "drugstore", "drugstores"] }, { key: "supermarket", terms: ["supermarket", "supermarkets", "grocery store", "grocery stores", "market", "markets"] },
    { key: "library", terms: ["library", "libraries"] }, { key: "school", terms: ["school", "schools", "college", "colleges", "university", "universities"] },
    { key: "park", terms: ["park", "parks", "playground", "playgrounds", "green area", "green areas"] }, { key: "bank", terms: ["bank", "banks"] },
    { key: "hospital", terms: ["hospital", "hospitals", "clinic", "clinics", "health center", "health centers"] }, { key: "church", terms: ["church", "churches", "chapel", "chapels"] },
    { key: "bus-stop", terms: ["bus stop", "bus stops", "bus station", "bus stations"] }, { key: "gym", terms: ["gym", "gyms", "sports center", "sports centers"] }
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
    "floatingMicButton", "floatingStopButton"
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
  let emmaReplyPending = false;

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
    emmaReplyPending = false;
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

  function hasNegativeExistence(normalized) {
    const answer = normalized.trim();
    return answer === "no"
      || includesAny(normalized, ["there isn't", "there is not", "there is no", "there's no", "there are no", "there are not", "isn't near", "is not near", "not near", "not nearby", "not close", "far from", "is far", "don't have", "do not have", "no supermarket", "no restaurant"]);
  }

  function hasNegativeRecommendation(normalized) {
    const answer = normalized.trim();
    if (includesAny(normalized, ["don't recommend", "do not recommend", "wouldn't recommend", "would not recommend", "not recommend", "can't recommend", "cannot recommend", "would never recommend", "i wouldn't", "i would not", "i don't", "i do not", "don't like", "do not like", "prefer another", "prefer a different"])) return true;
    return answer.startsWith("no ") && includesAny(normalized, ["because", "expensive", "bad", "dirty", "not good", "terrible", "slow", "unfriendly"]);
  }

  function primaryPlaceSegment(normalized) {
    let text = normalized.trim();
    const prefixes = [
      /^(?:is|are) there (?:a |an |any |the )?/,
      /^where (?:is|are) (?:a |an |the )?/,
      /^what can (?:people|you) do (?:at|in) (?:a |an |the )?/,
      /^what do (?:people|you) do (?:at|in) (?:a |an |the )?/,
      /^(?:do|would) you (?:like|recommend) (?:a |an |the )?/,
      /^can you recommend (?:a |an |the )?/,
      /^what (?:is|'s) your favorite (?:a |an |the )?/,
      /^how far (?:is|are) (?:a |an |the )?/
    ];
    const prefix = prefixes.find((pattern) => pattern.test(text));
    if (prefix) text = text.replace(prefix, "");
    text = text.split(/\b(?:and what|and where|near|next to|across from|in front of|behind|between|from|on the corner)\b/)[0].trim();
    return normalize(text);
  }

  function targetPlaceGroup(normalized) {
    const segment = primaryPlaceSegment(normalized);
    return ACTIVITY_RESPONSES.find((item) => includesAny(segment, item.terms)) || null;
  }

  function targetEntityKey(normalized) {
    const segment = primaryPlaceSegment(normalized);
    return CANONICAL_ENTITIES.find((item) => includesAny(segment, item.terms))?.key || "";
  }

  function hasGenericPlaceTarget(normalized) {
    return includesAny(primaryPlaceSegment(normalized), ["place", "places", "it", "there", "neighborhood", "area"]);
  }

  function mentionsSupportedPlace(normalized) {
    return Boolean(targetPlaceGroup(normalized));
  }

  function hasActivityIntent(normalized) {
    return includesAny(normalized, ["what can", "what do people", "what can people do", "what do you do"]);
  }

  function questionSignature(transcript) {
    const normalized = normalize(transcript);
    let intent = "";
    if (includesAny(normalized, ["how far", "how long does it take", "how many minutes"])) intent = "distance";
    else if (includesAny(normalized, ["where is", "where's", "where are", "where can i find"])) intent = "where";
    else if (includesAny(normalized, ["is there", "isn't there", "are there", "aren't there"])) intent = "existence";
    else if (hasActivityIntent(normalized)) intent = "activity";
    else if (includesAny(normalized, ["favorite place", "which place", "what place do you recommend", "what is your favorite", "what's your favorite"])) intent = "favorite";
    else if (includesAny(normalized, ["do you recommend", "would you recommend", "can you recommend"])) intent = "recommend";
    else if (includesAny(normalized, ["do you like", "like your neighborhood"])) intent = "like";
    const entity = targetEntityKey(normalized) || (hasGenericPlaceTarget(normalized) ? "place" : "");
    return intent && entity ? `${intent}:${entity}` : normalize(transcript).trim();
  }

  function repeatsPreviousQuestion(transcript, previousTranscript) {
    if (!previousTranscript) return false;
    const current = questionSignature(transcript);
    const previous = questionSignature(previousTranscript);
    return Boolean(current && previous && current === previous);
  }

  function activityResponseFor(normalized) {
    const matched = targetPlaceGroup(normalized);
    if (matched) return matched.response;
    if (includesAny(normalized, ["neighborhood", "area"])) return STUDENT_QUESTION_RESPONSES.neighborhoodActivity;
    return STUDENT_QUESTION_RESPONSES.genericActivity;
  }

  function studentQuestionResponseFor(normalized) {
    const activityIntent = hasActivityIntent(normalized);
    const asksExistence = includesAny(normalized, ["is there", "isn't there"]);
    const asksLocation = includesAny(normalized, ["where is", "where's", "where can i find"]);
    const asksPluralExistence = includesAny(normalized, ["are there", "aren't there"]);
    const asksPluralLocation = includesAny(normalized, ["where are"]);
    const targetGroup = targetPlaceGroup(normalized);
    const targetEntity = targetEntityKey(normalized);
    const supportedPlace = Boolean(targetGroup);
    const genericPlace = hasGenericPlaceTarget(normalized);
    const parkTarget = targetGroup?.key === "park";
    const foodTarget = targetGroup?.key === "food";
    if (activityIntent && asksPluralExistence) {
      if (!supportedPlace && !genericPlace) return STUDENT_QUESTION_RESPONSES.unknownPlace;
      return parkTarget ? STUDENT_QUESTION_RESPONSES.compoundParksExist : STUDENT_QUESTION_RESPONSES.compoundPlacesExist;
    }
    if (activityIntent && asksPluralLocation) {
      if (!supportedPlace && !genericPlace) return STUDENT_QUESTION_RESPONSES.unknownPlace;
      return parkTarget ? STUDENT_QUESTION_RESPONSES.compoundParksLocation : STUDENT_QUESTION_RESPONSES.compoundPlacesLocation;
    }
    if (activityIntent && asksExistence) {
      if (!supportedPlace && !genericPlace) return STUDENT_QUESTION_RESPONSES.unknownPlace;
      if (targetEntity === "library") return STUDENT_QUESTION_RESPONSES.compoundLibraryExists;
      if (parkTarget) return STUDENT_QUESTION_RESPONSES.compoundParkExists;
      return STUDENT_QUESTION_RESPONSES.compoundPlaceExists;
    }
    if (activityIntent && asksLocation) {
      if (!supportedPlace && !genericPlace) return STUDENT_QUESTION_RESPONSES.unknownPlace;
      if (targetEntity === "library") return STUDENT_QUESTION_RESPONSES.compoundLibraryLocation;
      if (parkTarget) return STUDENT_QUESTION_RESPONSES.compoundParkLocation;
      return STUDENT_QUESTION_RESPONSES.compoundPlaceLocation;
    }
    if (includesAny(normalized, ["favorite place", "which place", "what place do you recommend", "what is your favorite", "what's your favorite", "is your favorite"])) {
      if (foodTarget) return STUDENT_QUESTION_RESPONSES.favoriteFoodPlace;
      if (!supportedPlace) return genericPlace ? STUDENT_QUESTION_RESPONSES.favoritePlace : STUDENT_QUESTION_RESPONSES.unknownPlace;
      if (parkTarget) return STUDENT_QUESTION_RESPONSES.favoritePlace;
      return STUDENT_QUESTION_RESPONSES.favoriteSpecificPlace;
    }
    if (includesAny(normalized, ["how far", "how long does it take", "how many minutes"])) {
      if (!supportedPlace && !genericPlace) return STUDENT_QUESTION_RESPONSES.unknownPlace;
      return includesAny(normalized, ["from", "between"]) && !includesAny(normalized, ["from my home", "from your home"]) ? STUDENT_QUESTION_RESPONSES.distanceBetweenPlaces : STUDENT_QUESTION_RESPONSES.distance;
    }
    if (asksPluralLocation) {
      if (!supportedPlace && !genericPlace) return STUDENT_QUESTION_RESPONSES.unknownPlace;
      const target = primaryPlaceSegment(normalized);
      if (includesAny(target, ["park", "parks"]) && includesAny(target, ["library", "libraries"])) return STUDENT_QUESTION_RESPONSES.whereParkLibrary;
      return STUDENT_QUESTION_RESPONSES.wherePlaces;
    }
    if (includesAny(normalized, ["where is", "where's", "where can i find"])) {
      if (!supportedPlace && !genericPlace) return STUDENT_QUESTION_RESPONSES.unknownPlace;
      if (parkTarget) return STUDENT_QUESTION_RESPONSES.wherePark;
      return targetEntity === "library" ? STUDENT_QUESTION_RESPONSES.whereLibrary : STUDENT_QUESTION_RESPONSES.wherePlace;
    }
    if (asksPluralExistence) return supportedPlace || genericPlace ? STUDENT_QUESTION_RESPONSES.areThere : STUDENT_QUESTION_RESPONSES.unknownPlace;
    if (includesAny(normalized, ["is there", "isn't there"])) {
      if (!supportedPlace && !genericPlace) return STUDENT_QUESTION_RESPONSES.unknownPlace;
      return parkTarget ? STUDENT_QUESTION_RESPONSES.isTherePark : STUDENT_QUESTION_RESPONSES.isThere;
    }
    if (activityIntent) {
      if (includesAny(normalized, ["what do you do"]) && includesAny(normalized, ["neighborhood", "area"])) return STUDENT_QUESTION_RESPONSES.myNeighborhoodActivity;
      if (includesAny(normalized, ["what do you do"])) return supportedPlace || genericPlace ? STUDENT_QUESTION_RESPONSES.myPlaceActivity : STUDENT_QUESTION_RESPONSES.unknownPlace;
      return supportedPlace || includesAny(normalized, ["neighborhood", "area", "place"]) ? activityResponseFor(normalized) : STUDENT_QUESTION_RESPONSES.unknownPlace;
    }
    if (includesAny(normalized, ["can you recommend"]) || (includesAny(normalized, ["recommend"]) && includesAny(normalized, ["which", "what"]))) {
      if (!supportedPlace && !genericPlace) return STUDENT_QUESTION_RESPONSES.unknownPlace;
      if (foodTarget) return STUDENT_QUESTION_RESPONSES.recommendFoodPlace;
      if (parkTarget || genericPlace) return STUDENT_QUESTION_RESPONSES.favoritePlace;
      return STUDENT_QUESTION_RESPONSES.favoriteSpecificPlace;
    }
    if (includesAny(normalized, ["do you recommend", "would you recommend"])) return supportedPlace || genericPlace ? STUDENT_QUESTION_RESPONSES.recommendPlace : STUDENT_QUESTION_RESPONSES.unknownPlace;
    if (includesAny(normalized, ["do you like", "like your neighborhood"])) {
      if (!supportedPlace && !genericPlace && !includesAny(normalized, ["neighborhood", "area"])) return STUDENT_QUESTION_RESPONSES.unknownPlace;
      return includesAny(normalized, ["neighborhood", "area"]) ? STUDENT_QUESTION_RESPONSES.likeNeighborhood : STUDENT_QUESTION_RESPONSES.likePlace;
    }
    if (includesAny(normalized, ["what is your neighborhood like", "what's your neighborhood like", "describe your neighborhood"])) return STUDENT_QUESTION_RESPONSES.neighborhoodDescription;
    return STUDENT_QUESTION_RESPONSES.retryQuestion;
  }

  function responseFor(question, transcript, previousTranscript = "") {
    const normalized = normalize(transcript);
    if (question.interaction) {
      if (question.id === "student-question-2" && repeatsPreviousQuestion(transcript, previousTranscript)) return STUDENT_QUESTION_RESPONSES.differentQuestion;
      return studentQuestionResponseFor(normalized);
    }
    if (question.id === "opening") return TURN_RESPONSES.opening;
    if (question.id === "overview") return TURN_RESPONSES.overview;
    if (question.id === "supermarket") return hasNegativeExistence(normalized) ? TURN_RESPONSES.supermarketNo : TURN_RESPONSES.supermarketYes;
    if (question.id === "park-school") return TURN_RESPONSES.parkSchool;
    if (question.id === "restaurant") {
      if (hasNegativeRecommendation(normalized)) return TURN_RESPONSES.restaurantNotRecommended;
      return hasNegativeExistence(normalized) ? TURN_RESPONSES.restaurantNo : TURN_RESPONSES.restaurantYes;
    }
    if (question.id === "recommendation") return TURN_RESPONSES.recommendation;
    return TURN_RESPONSES.continue;
  }

  async function playReaction(answer) {
    if (!answer?.transcript || answer.unavailable) return;
    emmaReplyPending = true;
    const previousTranscript = state.currentIndex > 0 ? (state.answers[state.currentIndex - 1]?.transcript || "") : "";
    const response = responseFor(currentQuestion(), answer.transcript, previousTranscript);
    answer.emmaResponse = response;
    elements.emmaReactionText.textContent = response.text;
    elements.emmaReactionText.hidden = false;
    elements.reactionAudio.src = AUDIO_ROOT + response.file;
    elements.reactionAudio.playbackRate = playbackSpeed;
    try {
      await elements.reactionAudio.play();
    } catch (_error) {
      setAvatar("ready", "Review your feedback, then continue");
    } finally {
      emmaReplyPending = false;
      updateRecorderControls();
    }
  }

  async function playRecoveryBridge() {
    emmaReplyPending = true;
    updateRecorderControls();
    elements.emmaReactionText.textContent = "I could not check that recording this time, but your practice can continue.";
    elements.emmaReactionText.hidden = false;
    elements.reactionAudio.src = AUDIO_ROOT + "fallback-transcription-unavailable.mp3";
    elements.reactionAudio.playbackRate = playbackSpeed;
    try {
      await elements.reactionAudio.play();
    } catch (_error) {
      setAvatar("ready", "Continue when you are ready");
    } finally {
      emmaReplyPending = false;
      updateRecorderControls();
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
    const hasAnswer = Boolean(state.answers[state.currentIndex]);
    const shouldShow = floatingDockEnabled && !elements.interviewPanel.hidden && (recording || (!hasAnswer && !answerRecorderVisible));
    elements.floatingMicDock.hidden = !shouldShow;
  }

  function updateFloatingDockControls() {
    const recording = mediaRecorder?.state === "recording";
    const hasAnswer = Boolean(state.answers[state.currentIndex]);
    const emmaPlaying = emmaReplyPending || !elements.interviewerAudio.paused || !elements.reactionAudio.paused;
    elements.floatingTurnLabel.textContent = state.questionIds.length === 1 ? "Focused practice" : `Turn ${state.currentIndex + 1} of ${state.questionIds.length}`;
    elements.floatingTimer.textContent = elements.timer.textContent;
    elements.floatingMicButton.hidden = recording || hasAnswer;
    elements.floatingStopButton.hidden = !recording;
    elements.floatingMicButton.disabled = recording || analyzing || hasAnswer || emmaPlaying;
    elements.floatingStopButton.disabled = !recording || analyzing;
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
      elements.floatingMicLabel.textContent = "Read your feedback, then choose Continue";
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
    const emmaPlaying = emmaReplyPending || !elements.interviewerAudio.paused || !elements.reactionAudio.paused;
    const canContinue = hasAnswer && !recording && !analyzing && !emmaPlaying;
    elements.micButton.classList.toggle("is-recording", recording);
    elements.micButton.querySelector("i").className = recording ? "bi bi-soundwave" : "bi bi-mic-fill";
    elements.micButton.disabled = recording || analyzing || hasAnswer || emmaPlaying;
    elements.stopButton.disabled = !recording || analyzing;
    elements.retryButton.disabled = recording || analyzing || !hasAnswer;
    elements.microphoneSelect.disabled = recording || analyzing;
    elements.nextQuestionButton.disabled = !canContinue;
    elements.nextQuestionButton.classList.toggle("is-ready", canContinue);
    elements.questionPlayButton.disabled = recording || analyzing || !elements.reactionAudio.paused;
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

  function renderTurnFeedback(answer) {
    if (!answer?.analysis) return;
    const analysis = answer.analysis;
    const checks = analysis.targetChecks.map((check) => `<span class="feedback-check ${check.met ? "is-met" : ""}"><i class="bi ${check.met ? "bi-check-circle-fill" : "bi-circle"}"></i>${escapeHtml(check.label)}</span>`).join("");
    const unclear = analysis.unclearWords.length
      ? `<div class="answer-word-review"><strong>Words to repeat more clearly:</strong> ${analysis.unclearWords.map((word) => `${escapeHtml(word.text)} (${Math.round(word.probability * 100)}%)`).join(", ")}</div>`
      : "";
    elements.answerFeedback.innerHTML = `<div class="feedback-checks">${currentQuestion().assessed === false ? '<span class="feedback-check is-met"><i class="bi bi-emoji-smile"></i>Warm-up only</span>' : `<span class="feedback-check is-met"><i class="bi bi-clipboard-data"></i>Practice readiness: ${Math.round(analysis.score100 / 10)}/10</span>`}${checks}</div><p class="feedback-message">${escapeHtml(analysis.message)}</p>${unclear}<p class="feedback-note">This is rule-based formative feedback. It does not replace teacher evaluation. When you finish reading, choose <strong>Continue</strong> beside <strong>Play Emma</strong>.</p>`;
    elements.answerFeedback.hidden = false;
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
      elements.recordStatus.textContent = "Answer transcribed. Emma is responding.";
      elements.recordHelp.textContent = "Read your feedback, then choose Continue beside Play Emma.";
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
    elements.recordHelp.textContent = "No words or score were invented. After Emma's message, choose Continue.";
    playRecoveryBridge();
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
    const emmaPlaying = emmaReplyPending || !elements.interviewerAudio.paused || !elements.reactionAudio.paused;
    if (!state.answers[state.currentIndex] || analyzing || mediaRecorder?.state === "recording" || emmaPlaying) return;
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

  function setupResponsiveDisclosures() {
    const disclosures = [...document.querySelectorAll("[data-responsive-disclosure]")];
    if (!disclosures.length) return;
    const compactQuery = window.matchMedia?.("(max-width: 980px)");
    const syncForViewport = () => disclosures.forEach((disclosure) => { disclosure.open = compactQuery ? !compactQuery.matches : true; });
    syncForViewport();
    if (compactQuery?.addEventListener) compactQuery.addEventListener("change", syncForViewport);
    else compactQuery?.addListener?.(syncForViewport);

    let printState = [];
    window.addEventListener("beforeprint", () => {
      printState = disclosures.map((disclosure) => disclosure.open);
      disclosures.forEach((disclosure) => { disclosure.open = true; });
    });
    window.addEventListener("afterprint", () => {
      disclosures.forEach((disclosure, index) => { disclosure.open = printState[index] ?? true; });
    });
  }

  function preparePage() {
    if (elements.practiceDate && !elements.practiceDate.value) elements.practiceDate.value = new Date().toISOString().slice(0, 10);
    elements.reviewPreviousButton.hidden = true;
    updateModeCards();
    setupResponsiveDisclosures();
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
  elements.reactionAudio.addEventListener("ended", () => {
    const hasFeedback = state.mode === "guided" && !elements.answerFeedback.hidden;
    setAvatar("ready", hasFeedback ? "Review your feedback, then continue" : "Continue when you are ready");
    updateRecorderControls();
    const target = hasFeedback ? elements.answerFeedback : elements.nextQuestionButton;
    target.scrollIntoView({ behavior: "smooth", block: "center" });
    if (hasFeedback) target.focus({ preventScroll: true });
  });
  navigator.mediaDevices?.addEventListener?.("devicechange", refreshMicrophones);
  window.addEventListener("pagehide", () => { if (mediaRecorder?.state === "recording") finishRecording(); stopTracks(); if (objectUrl) URL.revokeObjectURL(objectUrl); if (preflightObjectUrl) URL.revokeObjectURL(preflightObjectUrl); });
  window.addEventListener("beforeunload", () => { stopTracks(); if (objectUrl) URL.revokeObjectURL(objectUrl); if (preflightObjectUrl) URL.revokeObjectURL(preflightObjectUrl); });
  document.addEventListener("visibilitychange", () => { if (document.hidden && mediaRecorder?.state === "recording") finishRecording(); });

  if (window.__JARA_ORAL_MOCK_TEST__) {
    window.__JaraFinalOralTaskMockTest = { QUESTIONS, TURN_RESPONSES, STUDENT_QUESTION_RESPONSES, analyzeAnswer, responseFor, playReaction, playRecoveryBridge, renderTurnFeedback, readinessLabel, rubricBand, buildReport, REPORT_CRITERIA, getState: () => state };
  }

  applyPlaybackSpeed(1);
  preparePage();
})();
