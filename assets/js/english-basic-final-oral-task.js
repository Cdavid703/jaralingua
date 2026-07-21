(() => {
  "use strict";

  const API = Object.freeze({
    state: "/api/basic-final-oral/state",
    start: "/api/basic-final-oral/start",
    attempt: "/api/basic-final-oral/attempt",
    turn: "/api/basic-final-oral/turn",
    submit: "/api/basic-final-oral/submit",
    submissions: "/api/basic-final-oral/submissions",
    grade: "/api/basic-final-oral/grade",
    audio: "/api/basic-final-oral/audio",
    transcribe: "/api/english-basic/pronunciation-assessment"
  });
  const AUDIO_ROOT = "audio/final-oral-task-real/";
  const CLAIM_KEY = "jaralingua_basic_final_oral_student_claim_v2";
  const SUBMISSION_KEY_PREFIX = "jaralingua:basic-final-oral:submission:";
  const GOOGLE_USER_KEY = "jaralingua_google_user";
  const MICROSOFT_USER_KEY = "jaralingua_microsoft_user";
  const LOCAL_USER_KEY = "jaralingua_local_user";
  const REQUIRED_TURNS = 7;
  const TRANSCRIPTION_TIMEOUT_MS = 30000;
  const REQUEST_TIMEOUT_MS = 25000;
  const MAX_AUDIO_BYTES = 8 * 1024 * 1024;
  // The seven caps add up to exactly 180 seconds, the official upper limit.
  const TURN_LIMIT_SECONDS = Object.freeze({ "1": 20, "2": 22, "3": 24, "4": 28, "5": 26, "6": 32, interaction: 28 });
  const RUBRIC = Object.freeze([
    { key: "taskCompletion", label: "Task completion" },
    { key: "interactionDiscourse", label: "Interaction and discourse" },
    { key: "fluency", label: "Fluency" },
    { key: "vocabularyStructure", label: "Vocabulary and structure" },
    { key: "pronunciation", label: "Pronunciation" }
  ]);
  const UNIT_VIEW = Object.freeze({
    "1": { label: "All About You", title: "Introduce yourself with confidence", caption: "Respond with your own identity, spelling, and personal information." },
    "2": { label: "In Class", title: "Describe objects, places, and possession", caption: "Respond to the assigned classroom situation using your own complete ideas." },
    "3": { label: "Favorite People", title: "Describe an important person", caption: "Identify the person and communicate clear personal qualities." },
    "4": { label: "Everyday Life", title: "Talk about routines and time", caption: "Organize your regular activities in a clear sequence." },
    "5": { label: "Free Time", title: "Share interests and frequency", caption: "Explain what you enjoy doing and when you do it." },
    "6": { label: "Neighborhoods", title: "Guide a visitor through your neighborhood", caption: "Locate places, give directions, and make a recommendation." },
    interaction: { label: "Final Interaction", title: "Take the lead with Daniel", caption: "Ask one question about routine or free time and one about a neighborhood place." }
  });

  const TURN_REACTIONS = Object.freeze({
    "1": { file: "reaction-u1.mp3", text: "Thank you. It is nice to meet you and learn a little about you." },
    "2": { file: "reaction-u2.mp3", text: "Thank you for explaining that classroom situation." },
    "3": { file: "reaction-u3.mp3", text: "That person sounds important to you. Thank you for the description." },
    "4": { file: "reaction-u4.mp3", text: "Thank you. Now I understand more about your regular routine." },
    "5": { file: "reaction-u5.mp3", text: "That sounds like an enjoyable way to spend your free time." },
    "6": { file: "reaction-u6.mp3", text: "Thank you. Your description helps me understand your neighborhood." },
    fallback: { file: "reaction-continue.mp3", text: "Thank you for your response. Let us continue." }
  });

  const DANIEL_ANSWERS = Object.freeze({
    locationPark: { file: "answer-location-park.mp3", text: "Central Park is on Green Street, across from the public library." },
    locationLibrary: { file: "answer-location-library.mp3", text: "The public library is across from Central Park, next to Green Cafe." },
    locationFood: { file: "answer-location-food.mp3", text: "Green Cafe is next to the public library, and Cedar Grill is on Oak Avenue, across from the supermarket." },
    locationShopping: { file: "answer-location-shopping.mp3", text: "The supermarket is on Oak Avenue, next to the bank." },
    locationSchool: { file: "answer-location-school.mp3", text: "Lincoln School is on Maple Street, behind Central Park." },
    locationGeneral: { file: "answer-location-general.mp3", text: "It is near Central Park, between Green Street and Oak Avenue." },
    existenceSingular: { file: "answer-existence-singular.mp3", text: "Yes, there is. It is close to Central Park, so it is easy to reach on foot." },
    existencePlural: { file: "answer-existence-plural.mp3", text: "Yes, there are. Most of them are near Green Street and Oak Avenue." },
    activityPark: { file: "answer-activity-park.mp3", text: "People can walk, exercise, play, and relax in Central Park." },
    activityStudy: { file: "answer-activity-study.mp3", text: "People can read and study at the library, and students can learn at Lincoln School." },
    activityFood: { file: "answer-activity-food.mp3", text: "People can eat, have a drink, and meet friends at the cafe or restaurant." },
    activityShopping: { file: "answer-activity-shopping.mp3", text: "People can buy groceries and other things they need at the supermarket." },
    activityGym: { file: "answer-activity-gym.mp3", text: "People can exercise and play sports at the gym near the bus stop." },
    activityGeneral: { file: "answer-activity-general.mp3", text: "People can get help and do different everyday activities there." },
    likeNeighborhood: { file: "answer-like-neighborhood.mp3", text: "Yes, I do. I like my neighborhood because it is friendly, quiet, and easy to walk around." },
    likePlace: { file: "answer-like-place.mp3", text: "Yes, I do. I like that place because it is useful and close to my home." },
    favoritePlace: { file: "answer-favorite-place.mp3", text: "My favorite place is Central Park because it is peaceful, green, and good for exercise." },
    recommendPlace: { file: "answer-recommend-place.mp3", text: "I recommend Central Park. It is beautiful, peaceful, and across from the public library." },
    distance: { file: "answer-distance.mp3", text: "It is about a ten-minute walk from my home." },
    directions: { file: "answer-directions.mp3", text: "Go straight along Green Street, turn right at the library, and you will see it on the corner." },
    neighborhood: { file: "answer-neighborhood-description.mp3", text: "My neighborhood is quiet and friendly. There are useful places near my home, and it is easy to walk around." },
    routine: { file: "answer-routine.mp3", text: "I usually start work at eight o'clock. In the evening, I cook dinner, take a short walk, and read." },
    freeTime: { file: "answer-free-time.mp3", text: "In my free time, I like walking in Central Park, reading at the library, and meeting friends at Green Cafe." },
    unknown: { file: "answer-unknown-question.mp3", text: "I am not sure about that place, but I can tell you about Central Park, the public library, Green Cafe, or the supermarket." },
    general: { file: "answer-general-question.mp3", text: "Thank you for asking. There are several useful places near my home, especially around Central Park." }
  });

  const normalize = (value) => String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’']/g, "'")
    .replace(/[^a-z0-9?'\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const includesAny = (value, terms) => terms.some((term) => value.includes(term));

  function questionSegments(transcript) {
    const raw = String(transcript || "").trim();
    if (!raw) return [];
    let parts = raw.split(/\?+/).map((part) => part.trim()).filter(Boolean);
    if (parts.length < 2) {
      parts = raw.split(/\b(?:and|also|then)\b(?=\s*(?:where|what|when|who|whose|which|why|how|is|are|do|does|can|would|should)\b)/i)
        .map((part) => part.trim()).filter(Boolean);
    }
    if (parts.length < 2) {
      const starts = [...raw.matchAll(/\b(?:where|what|when|who|whose|which|why|how|is|are|do|does|can|would|should)\b/gi)].map((match) => match.index);
      if (starts.length >= 2) parts = [raw.slice(starts[0], starts[1]), raw.slice(starts[1])].map((part) => part.trim());
    }
    const unique = [];
    parts.forEach((part) => {
      const clean = normalize(part);
      if (clean && !unique.some((item) => normalize(item) === clean)) unique.push(part);
    });
    return unique.slice(0, 2);
  }

  function targetGroup(text) {
    if (includesAny(text, ["park", "playground", "green area"])) return "park";
    if (includesAny(text, ["library", "school", "college", "classroom", "study place"])) return "study";
    if (includesAny(text, ["restaurant", "cafe", "coffee", "food", "eat"])) return "food";
    if (includesAny(text, ["supermarket", "market", "store", "shop", "bank"])) return "shopping";
    if (includesAny(text, ["gym", "sports center"])) return "gym";
    return "general";
  }

  function studentQuestionResponseFor(question) {
    const text = normalize(question);
    const target = targetGroup(text);
    if (!text) return DANIEL_ANSWERS.general;
    if (includesAny(text, ["routine", "usually do", "every day", "weekday", "morning", "evening", "start work"])) return DANIEL_ANSWERS.routine;
    if (includesAny(text, ["free time", "weekend", "for fun", "hobby", "hobbies"])) return DANIEL_ANSWERS.freeTime;
    if (includesAny(text, ["how do i get", "how can i get", "how can i go", "give me directions", "which way", "how do you get"])) return DANIEL_ANSWERS.directions;
    if (includesAny(text, ["how far", "how long does it take", "minutes from"])) return DANIEL_ANSWERS.distance;
    if (includesAny(text, ["favorite place", "favourite place", "which place do you like most", "best place"])) return DANIEL_ANSWERS.favoritePlace;
    if (includesAny(text, ["recommend", "should i visit", "should we visit"])) return DANIEL_ANSWERS.recommendPlace;
    if (includesAny(text, ["what is your neighborhood like", "describe your neighborhood", "how is your neighborhood"])) return DANIEL_ANSWERS.neighborhood;
    if (includesAny(text, ["do you like your neighborhood", "do you enjoy your neighborhood"])) return DANIEL_ANSWERS.likeNeighborhood;
    if (includesAny(text, ["do you like", "do you enjoy"])) return DANIEL_ANSWERS.likePlace;
    if (includesAny(text, ["museum", "airport", "stadium", "zoo", "beach", "hotel"])) return DANIEL_ANSWERS.unknown;
    if (/\bare there\b/.test(text)) return DANIEL_ANSWERS.existencePlural;
    if (/\bis there\b/.test(text)) return DANIEL_ANSWERS.existenceSingular;
    if (includesAny(text, ["what can", "what do people do", "what can people do", "what do you do at"])) {
      return DANIEL_ANSWERS[target === "park" ? "activityPark" : target === "study" ? "activityStudy" : target === "food" ? "activityFood" : target === "shopping" ? "activityShopping" : target === "gym" ? "activityGym" : "activityGeneral"];
    }
    if (/\bwhere (?:is|are)\b/.test(text) || includesAny(text, ["location", "located"])) {
      if (target === "park") return DANIEL_ANSWERS.locationPark;
      if (includesAny(text, ["library"])) return DANIEL_ANSWERS.locationLibrary;
      if (target === "study") return DANIEL_ANSWERS.locationSchool;
      if (target === "food") return DANIEL_ANSWERS.locationFood;
      if (target === "shopping") return DANIEL_ANSWERS.locationShopping;
      return DANIEL_ANSWERS.locationGeneral;
    }
    return DANIEL_ANSWERS.general;
  }

  function responsesForTurn(turn, transcript) {
    if (String(turn?.unit || "") !== "interaction") return [TURN_REACTIONS[String(turn?.unit || "")] || TURN_REACTIONS.fallback];
    const segments = questionSegments(transcript);
    const selected = (segments.length ? segments : [transcript]).slice(0, 2).map(studentQuestionResponseFor);
    return selected.length ? selected : [DANIEL_ANSWERS.general];
  }

  window.__JaraLinguaBasicFinalOralTaskTest = Object.freeze({
    API, REQUIRED_TURNS, TURN_LIMIT_SECONDS, RUBRIC, normalize, questionSegments, studentQuestionResponseFor, responsesForTurn, TURN_REACTIONS, DANIEL_ANSWERS
  });

  const root = document.getElementById("finalOralTaskApp") || document.querySelector?.('[data-exam-code="basic-course-1-final-oral-task"]') || document.body;
  if (!root) return;

  const byId = (...ids) => ids.map((id) => document.getElementById(id)).find(Boolean) || null;
  const elements = {
    accessShell: byId("access"),
    access: byId("finalOralAccessPanel", "accessPanel"),
    accessStatus: byId("finalOralAccessStatus", "accessStatus"),
    accessMessage: byId("accessMessage"),
    signIn: byId("signInButton"),
    refreshAccess: byId("refreshAccessButton"),
    account: byId("authenticatedAccount"),
    accountAvatar: byId("authenticatedAvatar"),
    accountName: byId("authenticatedName"),
    accountEmail: byId("authenticatedEmail"),
    claimPanel: byId("claimStudentPanel"),
    claimInput: byId("claimStudentIdInput"),
    claim: byId("finalOralClaimButton", "claimStudentButton"),
    onboarding: byId("finalOralOnboardingPanel", "onboardingPanel", "preflightPanel"),
    welcomePlay: byId("danielWelcomePlayButton", "welcomePlayButton"),
    instructionsPlay: byId("finalOralInstructionsPlayButton", "instructionsPlayButton"),
    welcomeAudio: byId("danielWelcomeAudio", "welcomeAudio"),
    instructionsAudio: byId("finalOralInstructionsAudio", "instructionsAudio"),
    studentName: byId("finalOralStudentName", "studentName"),
    studentId: byId("finalOralStudentId", "studentId"),
    courseCode: byId("finalOralCourseCode", "courseCode"),
    preflight: byId("finalOralPreflightButton", "preflightButton"),
    preflightConfirm: byId("finalOralPreflightConfirmButton", "preflightConfirmButton", "integrityConfirmation"),
    preflightStatus: byId("finalOralPreflightStatus", "preflightStatus"),
    preflightPlayback: byId("finalOralPreflightPlayback", "preflightPlayback"),
    preflightMicrophoneSelect: byId("preflightMicrophoneSelect"),
    preflightLevelBar: byId("preflightLevelBar"),
    preflightLevelValue: byId("preflightLevelValue"),
    start: byId("startFinalOralButton", "startExamButton"),
    resume: byId("resumeFinalOralButton", "resumeExamButton"),
    exam: byId("finalOralExamPanel", "examPanel", "examContent"),
    counter: byId("finalOralTurnCounter", "turnCounter"),
    topic: byId("finalOralTurnTopic", "turnTopic"),
    progress: byId("finalOralProgress", "turnProgress"),
    examTimer: byId("examTimer"),
    journeyLabel: byId("journeyProgressLabel"),
    interactionJourney: byId("interactionJourneyStep"),
    stage: byId("danielStage", "finalOralDanielStage"),
    stageStatus: byId("danielStatus", "interviewerStatus"),
    question: byId("finalOralQuestionText", "questionText"),
    questionPlay: byId("finalOralQuestionPlayButton", "questionPlayButton"),
    questionAudio: byId("finalOralQuestionAudio", "questionAudio"),
    reactionAudio: byId("finalOralReactionAudio", "reactionAudio"),
    reaction: byId("finalOralDanielReaction", "danielReaction"),
    reactionText: byId("finalOralDanielReactionText", "danielReactionText"),
    questionInstruction: byId("questionInstruction"),
    unitVisualPanel: byId("unitVisualPanel"),
    unitVisualImage: byId("unitVisualImage"),
    unitVisualNumber: byId("unitVisualNumber"),
    unitVisualEyebrow: byId("unitVisualEyebrow"),
    unitVisualTitle: byId("unitVisualTitle"),
    unitVisualCaption: byId("unitVisualCaption"),
    microphoneSelect: byId("finalOralMicrophoneSelect", "microphoneSelect"),
    levelBar: byId("finalOralLevelMeterBar", "levelMeterBar"),
    levelValue: byId("finalOralLevelMeterValue", "levelMeterValue"),
    mic: byId("finalOralMicButton", "micButton"),
    stop: byId("finalOralStopButton", "stopButton"),
    recordStatus: byId("finalOralRecordStatus", "recordStatus"),
    recordHelp: byId("finalOralRecordHelp", "recordHelp"),
    timer: byId("finalOralRecordTimer", "recordTimer"),
    studentAudio: byId("finalOralStudentAudio", "studentAudio"),
    transcript: byId("finalOralTranscript", "liveTranscript"),
    saveStatus: byId("finalOralSaveStatus", "saveStatus", "lastSavedAt"),
    saveState: byId("saveState"),
    answerState: byId("answerState"),
    answerCaptured: byId("answerCaptured"),
    recovery: byId("finalOralTechnicalRecovery", "technicalRecovery"),
    recoveryMessage: byId("finalOralTechnicalRecoveryMessage", "technicalRecoveryMessage"),
    retry: byId("finalOralRetryButton", "retryTechnicalButton", "retryProcessingButton"),
    recordAgain: byId("finalOralRecordAgainButton", "recordAgainButton"),
    next: byId("finalOralNextButton", "nextTurnButton"),
    ready: byId("finalOralReadyPanel", "readyToSubmitPanel", "submissionPanel"),
    duration: byId("finalOralTotalDuration", "totalRecordedDuration"),
    submit: byId("submitFinalOralButton", "submitExamButton"),
    submitConfirmation: byId("finalSubmitConfirmation"),
    submissionGrid: byId("submissionUnitGrid"),
    submissionStatus: byId("finalOralSubmissionStatus", "submissionStatus", "submitStatus"),
    complete: byId("finalOralCompletionPanel", "completionPanel", "receiptPanel"),
    receipt: byId("finalOralReceipt", "completionReceipt", "receiptCode"),
    copyReceipt: byId("copyReceiptButton"),
    receiptStudent: byId("receiptStudent"),
    receiptSubmittedAt: byId("receiptSubmittedAt"),
    admin: byId("finalOralAdminPanel", "adminPanel"),
    adminStatus: byId("finalOralAdminStatus", "adminStatus", "adminActivationStatus"),
    adminState: byId("adminExamState"),
    adminOpen: byId("openFinalOralButton", "openExamButton", "activateExamButton"),
    adminClose: byId("closeFinalOralButton", "closeExamButton", "deactivateExamButton"),
    staff: byId("finalOralStaffReviewPanel", "staffReviewPanel"),
    staffRefresh: byId("finalOralStaffRefreshButton", "staffRefreshButton", "refreshSubmissionsButton"),
    staffStatus: byId("finalOralStaffStatus", "staffReviewStatus"),
    staffList: byId("finalOralStaffSubmissionList", "staffSubmissionList"),
    submissionSelector: byId("submissionSelector"),
    staffStudentName: byId("reviewStudentName"),
    staffStudentId: byId("reviewStudentId"),
    staffSubmittedAt: byId("reviewSubmittedAt"),
    staffReceipt: byId("reviewReceiptCode"),
    staffReviewStatus: byId("reviewStatus"),
    evidenceTabs: byId("evidenceTabs"),
    evidenceCoverage: byId("evidenceCoverage"),
    evidenceUnitBadge: byId("evidenceUnitBadge"),
    evidenceTopic: byId("evidenceTopic"),
    evidenceQuestion: byId("evidenceQuestion"),
    evidenceAudio: byId("evidenceAudio"),
    evidencePlay: byId("evidencePlayButton"),
    evidenceAudioLabel: byId("evidenceAudioLabel"),
    evidenceAudioProgress: byId("evidenceAudioProgress"),
    evidenceAudioTime: byId("evidenceAudioTime"),
    evidenceTranscript: byId("evidenceTranscript"),
    evidenceDuration: byId("evidenceDuration"),
    evidenceRecordedAt: byId("evidenceRecordedAt"),
    evidenceStorageState: byId("evidenceStorageState"),
    rubricTotal: byId("rubricTotal"),
    publishScore: byId("publishScore"),
    publishGrade: byId("publishGrade"),
    rubricRadar: byId("rubricRadarValue"),
    rubricTask: byId("rubricTask"),
    rubricInteraction: byId("rubricInteraction"),
    rubricFluency: byId("rubricFluency"),
    rubricLanguage: byId("rubricLanguage"),
    rubricPronunciation: byId("rubricPronunciation"),
    teacherFeedback: byId("teacherFeedback"),
    publishGradeButton: byId("publishGradeButton"),
    publishStatus: byId("publishStatus"),
    dock: byId("finalOralFloatingMic", "floatingMicDock"),
    dockLabel: byId("finalOralFloatingTurn", "floatingTurnLabel"),
    dockStatus: byId("finalOralFloatingStatus", "floatingStatus"),
    dockTimer: byId("finalOralFloatingTimer", "floatingTimer"),
    dockMic: byId("finalOralFloatingMicButton", "floatingMicButton"),
    dockStop: byId("finalOralFloatingStopButton", "floatingStopButton"),
    toast: byId("finalOralToast", "examToast", "officialToast"),
    busy: byId("busyOverlay"),
    busyMessage: byId("busyMessage"),
    sessionCode: byId("sessionCode"),
    candidateName: byId("candidateName"),
    candidateId: byId("candidateId"),
    candidateInitials: byId("candidateInitials")
  };

  let user = null;
  let role = "student";
  let serverState = null;
  let attempt = null;
  let submission = null;
  let assignedQuestions = [];
  let currentIndex = 0;
  let revision = 0;
  let playbackSpeed = 1;
  let preflightPassed = false;
  let preflightSampleReady = false;
  let questionHeard = false;
  let mediaStream = null;
  let mediaRecorder = null;
  let chunks = [];
  let currentBlob = null;
  let currentTranscript = "";
  let currentClientTurnId = "";
  let recordingStartedAt = 0;
  let recordingDurationMs = 0;
  let timerHandle = null;
  let autoStopHandle = null;
  let analyzing = false;
  let savedCurrentTurn = false;
  let reactionBusy = false;
  let recordingStartPending = false;
  let recordingFinalizing = false;
  let questionAudioLoading = false;
  let questionAudioPlaying = false;
  let questionPlaybackToken = 0;
  let questionPlaybackWatchdog = 0;
  let attemptRequestBusy = false;
  let submissionBusy = false;
  let stateLoadGeneration = 0;
  let sessionGeneration = 0;
  let objectUrl = "";
  let promptObjectUrl = "";
  let preflightObjectUrl = "";
  let preflightRecorder = null;
  let levelContext = null;
  let levelAnalyser = null;
  let levelFrame = null;
  let activeLevelBar = null;
  let activeLevelValue = null;
  let lastCredential = "";
  let examClockHandle = null;
  let examClockStartedAt = 0;
  let staffSubmissions = [];
  let selectedStaffSubmission = null;
  let selectedEvidenceIndex = 0;
  let staffAudioObjectUrl = "";
  let staffEvidenceLoadToken = 0;

  const setText = (node, value) => { if (node) node.textContent = value; };
  const setHidden = (node, hidden) => { if (node) node.hidden = Boolean(hidden); };
  const setDisabled = (node, disabled) => { if (node) node.disabled = Boolean(disabled); };
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);

  function readStoredUser(key, provider) {
    try {
      const saved = JSON.parse(sessionStorage.getItem(key) || "null");
      if (!saved?.credential || (saved.exp && Date.now() / 1000 > Number(saved.exp))) return null;
      return Object.assign({ provider }, saved);
    } catch { return null; }
  }

  function readUser() {
    return readStoredUser(GOOGLE_USER_KEY, "google") || readStoredUser(MICROSOFT_USER_KEY, "microsoft") || readStoredUser(LOCAL_USER_KEY, "local");
  }

  function accountScope(account = user) {
    const identity = String(account?.sub || account?.email || "").trim().toLowerCase();
    return identity ? `${account?.provider || "unknown"}:${identity}` : "";
  }

  function savedClaim(account = user) {
    try {
      const stored = JSON.parse(sessionStorage.getItem(CLAIM_KEY) || "null");
      const value = String(stored?.value || "").replace(/\D+/g, "");
      return value && stored?.scope === accountScope(account) ? value : "";
    } catch { return ""; }
  }

  function storeStudentClaim(value) {
    const normalized = String(value || "").replace(/\D+/g, "");
    const scope = accountScope();
    if (!normalized || !scope) return "";
    sessionStorage.setItem(CLAIM_KEY, JSON.stringify({ scope, value: normalized }));
    return normalized;
  }

  function clearStudentClaim() { sessionStorage.removeItem(CLAIM_KEY); }

  function authHeaders(extra = {}) {
    const headers = Object.assign({}, extra);
    if (user?.credential) {
      headers.Authorization = `Bearer ${user.credential}`;
      headers["X-Jaralingua-Auth-Provider"] = user.provider || "google";
    }
    const claim = savedClaim();
    if (claim) headers["X-Jaralingua-Student-Id-Claim"] = claim;
    return headers;
  }

  function openLogin(event) {
    event?.stopPropagation?.();
    let attempts = 0;
    const activate = () => {
      const trigger = document.querySelector("[data-auth-toggle]") || document.querySelector("[data-auth-nav-toggle]");
      if (trigger) {
        trigger.click();
        return;
      }
      attempts += 1;
      if (attempts < 25) {
        window.setTimeout(activate, 200);
        return;
      }
      toast("The sign-in panel is still loading. Please try again.", "error");
    };
    window.setTimeout(activate, 0);
  }

  function promptStudentClaim() {
    const value = String(window.prompt("We could not match this account to a Basic English student. Enter your ID or document number:", "") || "").replace(/\D+/g, "");
    return value ? storeStudentClaim(value) : "";
  }

  function submitStudentClaim() {
    const inlineValue = String(elements.claimInput?.value || "").replace(/\D+/g, "");
    const value = inlineValue || promptStudentClaim();
    if (!value) {
      toast("Enter the document number registered in Grades.", "error");
      return;
    }
    storeStudentClaim(value);
    if (elements.claimInput) elements.claimInput.value = value;
    loadState(false);
  }

  function toast(message, type = "") {
    if (!elements.toast) return;
    elements.toast.hidden = false;
    elements.toast.textContent = message;
    elements.toast.classList.add("is-visible");
    elements.toast.classList.toggle("success", type === "success");
    elements.toast.classList.toggle("error", type === "error");
    window.setTimeout(() => { elements.toast?.classList.remove("is-visible", "success", "error"); if (elements.toast) elements.toast.hidden = true; }, 5200);
  }

  function setBusy(active, message = "Securing your response…") {
    setHidden(elements.busy, !active);
    setText(elements.busyMessage, message);
  }

  function createId(prefix) {
    if (window.crypto?.randomUUID) return `${prefix}-${window.crypto.randomUUID()}`;
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
  }

  async function request(url, options = {}, maxAttempts = 1) {
    let lastError = null;
    for (let tryNumber = 1; tryNumber <= maxAttempts; tryNumber += 1) {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), Number(options.timeout) || REQUEST_TIMEOUT_MS);
      try {
        const response = await fetch(url, Object.assign({}, options, {
          signal: options.signal || controller.signal,
          headers: authHeaders(options.headers || {})
        }));
        let data = {};
        try { data = await response.json(); } catch { /* binary or empty response */ }
        if (response.ok) return { ok: true, status: response.status, data, response };
        const error = new Error(data.error || `Request failed (${response.status}).`);
        error.status = response.status;
        error.data = data;
        if (!(response.status === 429 || response.status >= 500) || tryNumber === maxAttempts) throw error;
        lastError = error;
      } catch (error) {
        lastError = error;
        const retryable = error.name === "AbortError" || error.name === "TypeError" || error.status === 429 || error.status >= 500;
        if (!retryable || tryNumber === maxAttempts) throw error;
      } finally { window.clearTimeout(timeout); }
      await new Promise((resolve) => window.setTimeout(resolve, 650 * (2 ** (tryNumber - 1))));
    }
    throw lastError || new Error("The server did not answer.");
  }

  const jsonOptions = (method, payload) => ({ method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });

  function formatDuration(milliseconds) {
    const seconds = Math.max(0, Math.round(Number(milliseconds || 0) / 1000));
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
  }

  function totalRecordedDuration() {
    const turns = attempt?.turns && typeof attempt.turns === "object" ? Object.values(attempt.turns) : [];
    return turns.reduce((sum, turn) => sum + Number(turn?.durationMs || 0), 0);
  }

  function updateExamClock() {
    if (!examClockStartedAt) return;
    const activeRecording = mediaRecorder?.state === "recording" && recordingStartedAt ? Date.now() - recordingStartedAt : 0;
    const capturedUnsaved = !activeRecording && currentBlob && !savedCurrentTurn ? recordingDurationMs : 0;
    const elapsed = totalRecordedDuration() + activeRecording + capturedUnsaved;
    setText(elements.examTimer, `Speaking ${formatDuration(elapsed)}`);
    if (elements.examTimer) elements.examTimer.dateTime = `PT${Math.round(elapsed / 1000)}S`;
  }

  function startExamClock() {
    if (!examClockStartedAt) examClockStartedAt = 1;
    if (!examClockHandle) examClockHandle = window.setInterval(updateExamClock, 500);
    updateExamClock();
  }

  function stopExamClock() {
    if (examClockHandle) window.clearInterval(examClockHandle);
    examClockHandle = null;
    updateExamClock();
  }

  function fillIdentity(student) {
    const name = student?.fullName || student?.name || user?.name || "Verified student";
    const id = student?.id || "ID confirmed";
    if (elements.studentName) elements.studentName.value = name;
    if (elements.studentId) elements.studentId.value = id;
    if (elements.courseCode && !elements.courseCode.value) elements.courseCode.value = "BASIC-C1";
    setText(elements.candidateName, name);
    setText(elements.candidateId, id);
    const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "ST";
    setText(elements.candidateInitials, initials);
    setText(elements.accountAvatar, initials);
    setText(elements.accountName, name);
    setText(elements.accountEmail, user?.email || "Verified account");
    setHidden(elements.account, false);
  }

  function setDanielState(state, label) {
    if (elements.stage) elements.stage.dataset.state = state;
    setText(elements.stageStatus?.querySelector?.("span") || elements.stageStatus, label);
    setText(elements.dockStatus, label);
  }

  function updateSpeedButtons() {
    root.querySelectorAll("[data-final-oral-speed], [data-audio-speed], [data-question-speed]").forEach((button) => {
      const value = button.dataset.finalOralSpeed ?? button.dataset.audioSpeed ?? button.dataset.questionSpeed;
      const active = Number(value) === playbackSpeed;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });
    [elements.welcomeAudio, elements.instructionsAudio, elements.questionAudio, elements.reactionAudio].forEach((audio) => { if (audio) audio.playbackRate = playbackSpeed; });
  }

  async function fetchProtectedAudio(url, timeoutMs = 18000) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, { headers: authHeaders(), signal: controller.signal });
      if (!response.ok) throw new Error("audio_unavailable");
      return await response.blob();
    } finally {
      window.clearTimeout(timeout);
    }
  }

  function promptAudioUrl(question) {
    return String(question?.promptAudioUrl || question?.audioUrl || "").trim();
  }

  async function playClip(audio, source, protectedAudio = false) {
    if (!audio || !source) return;
    audio.pause();
    if (protectedAudio) {
      const blob = await fetchProtectedAudio(source);
      if (promptObjectUrl) URL.revokeObjectURL(promptObjectUrl);
      promptObjectUrl = URL.createObjectURL(blob);
      audio.src = promptObjectUrl;
    } else audio.src = source;
    audio.playbackRate = playbackSpeed;
    await audio.play();
  }

  function clearQuestionAudio() {
    if (questionPlaybackWatchdog) window.clearTimeout(questionPlaybackWatchdog);
    questionPlaybackWatchdog = 0;
    questionPlaybackToken += 1;
    questionAudioLoading = false;
    questionAudioPlaying = false;
    questionHeard = false;
    if (elements.questionAudio) {
      elements.questionAudio.pause();
      elements.questionAudio.removeAttribute("src");
      delete elements.questionAudio.dataset.turnId;
      elements.questionAudio.load();
    }
    if (promptObjectUrl) {
      URL.revokeObjectURL(promptObjectUrl);
      promptObjectUrl = "";
    }
  }

  async function playResponseQueue(responses) {
    const responseSession = sessionGeneration;
    if (!elements.reactionAudio || !responses.length) {
      if (responseSession === sessionGeneration) {
        reactionBusy = false;
        setDisabled(elements.next, false);
      }
      return;
    }
    reactionBusy = true;
    setDisabled(elements.next, true);
    setDanielState("speaking", "Daniel is responding");
    setHidden(elements.reaction, false);
    try {
      for (const response of responses) {
        setText(elements.reactionText, response.text);
        await new Promise((resolve) => {
          const audio = elements.reactionAudio;
          let watchdog = 0;
          let settled = false;
          const events = ["ended", "error", "stalled", "abort"];
          const finish = () => {
            if (settled) return;
            settled = true;
            if (watchdog) window.clearTimeout(watchdog);
            events.forEach((name) => audio.removeEventListener(name, finish));
            resolve();
          };
          events.forEach((name) => audio.addEventListener(name, finish, { once: true }));
          watchdog = window.setTimeout(finish, 12000);
          audio.src = AUDIO_ROOT + response.file;
          audio.playbackRate = playbackSpeed;
          audio.play().catch(finish);
        });
      }
    } finally {
      if (responseSession !== sessionGeneration) return;
      reactionBusy = false;
      setDanielState("ready", "Daniel is ready to continue");
      setDisabled(elements.next, false);
    }
  }

  function showAccess(message, type = "") {
    setHidden(elements.access, false);
    if (elements.accessStatus) {
      elements.accessStatus.textContent = message;
      elements.accessStatus.dataset.type = type;
    }
    if (elements.accessMessage) {
      const target = elements.accessMessage.querySelector("span") || elements.accessMessage;
      target.textContent = message;
      elements.accessMessage.className = `access-message ${type || "neutral"}`;
    }
    setHidden(elements.signIn, Boolean(user));
  }

  function renderAdminState() {
    if (!elements.admin) return;
    const staffRole = role === "admin" || role === "teacher";
    setHidden(elements.admin, !staffRole);
    if (!staffRole) return;
    const open = serverState?.isOpen === true;
    const statusText = open ? "OPEN — students can start new attempts." : "CLOSED — no new student attempt can start.";
    if (elements.adminStatus) setText(elements.adminStatus.querySelector?.("span") || elements.adminStatus, statusText);
    if (elements.adminStatus) elements.adminStatus.dataset.state = open ? "open" : "closed";
    if (elements.adminState) {
      elements.adminState.className = `admin-state ${open ? "active" : "locked"}`;
      elements.adminState.innerHTML = `<i class="bi ${open ? "bi-unlock-fill" : "bi-lock-fill"}"></i> ${open ? "Open" : "Locked"}`;
    }
    setDisabled(elements.adminOpen, open);
    setDisabled(elements.adminClose, !open);
  }

  function renderSubmission(result) {
    submission = result || submission;
    setHidden(elements.onboarding, true);
    setHidden(elements.exam, true);
    setHidden(elements.ready, true);
    setHidden(elements.complete, false);
    const status = submission?.status === "graded" ? `Graded: ${Number(submission.grade).toFixed(2)} / 5.0` : "Submitted — pending teacher review";
    setText(elements.receipt, `Receipt ${submission?.receiptId || "—"} · ${status}`);
    if (elements.receipt?.id === "receiptCode") setText(elements.receipt, submission?.receiptId || "—");
    setText(elements.receiptStudent, submission?.studentName || attempt?.student?.fullName || user?.name || "—");
    setText(elements.receiptSubmittedAt, submission?.submittedAt || "—");
    setText(elements.submissionStatus, status);
    stopExamClock();
  }

  function hydrateAttempt(nextAttempt, enterExam = true) {
    attempt = nextAttempt;
    assignedQuestions = Array.isArray(attempt?.assignedQuestions) ? attempt.assignedQuestions.slice().sort((a, b) => Number(a.sequence) - Number(b.sequence)) : [];
    revision = Number(attempt?.revision || 0);
    fillIdentity(attempt?.student);
    const saved = attempt?.turns && typeof attempt.turns === "object" ? attempt.turns : {};
    currentIndex = assignedQuestions.findIndex((question) => !saved[question.turnId]);
    if (currentIndex < 0) currentIndex = assignedQuestions.length;
    const resumeControl = elements.resume || elements.start;
    setHidden(resumeControl, currentIndex >= assignedQuestions.length);
    setDisabled(resumeControl, !preflightPassed);
    if (!elements.resume && elements.start && currentIndex < assignedQuestions.length) elements.start.innerHTML = '<i class="bi bi-arrow-repeat"></i> Resume official interview';
    else setHidden(elements.start, true);
    if (currentIndex >= assignedQuestions.length && assignedQuestions.length === REQUIRED_TURNS) renderReadyToSubmit();
    else if (enterExam) renderCurrentTurn();
    else {
      setHidden(elements.exam, true);
      setHidden(elements.onboarding, false);
      showAccess(`${Object.keys(saved).length} of ${REQUIRED_TURNS} responses are already saved. Complete the microphone check, then resume.`, "resume");
    }
  }

  function resetProtectedSession({ clearClaim = true } = {}) {
    sessionGeneration += 1;
    stateLoadGeneration += 1;
    window.clearInterval(timerHandle);
    window.clearTimeout(autoStopHandle);
    timerHandle = null;
    autoStopHandle = null;
    try { if (mediaRecorder?.state === "recording") mediaRecorder.stop(); } catch { /* recorder is already closing */ }
    try { if (preflightRecorder?.state === "recording") preflightRecorder.stop(); } catch { /* preflight is already closing */ }
    stopMediaStream();
    stopExamClock();
    clearQuestionAudio();
    staffEvidenceLoadToken += 1;
    setBusy(false);
    [elements.reactionAudio, elements.studentAudio, elements.evidenceAudio].forEach((audio) => {
      if (!audio) return;
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    });
    elements.staffList?.querySelectorAll("audio").forEach((audio) => {
      audio.pause();
      if (audio.dataset.objectUrl) URL.revokeObjectURL(audio.dataset.objectUrl);
      delete audio.dataset.objectUrl;
      audio.removeAttribute("src");
      audio.load();
    });
    [objectUrl, preflightObjectUrl, staffAudioObjectUrl].forEach((url) => { if (url) URL.revokeObjectURL(url); });
    objectUrl = "";
    preflightObjectUrl = "";
    staffAudioObjectUrl = "";
    role = "student";
    serverState = null;
    attempt = null;
    submission = null;
    assignedQuestions = [];
    currentIndex = 0;
    revision = 0;
    preflightPassed = false;
    preflightSampleReady = false;
    mediaRecorder = null;
    preflightRecorder = null;
    chunks = [];
    currentBlob = null;
    currentTranscript = "";
    currentClientTurnId = "";
    recordingDurationMs = 0;
    analyzing = false;
    savedCurrentTurn = false;
    reactionBusy = false;
    recordingStartPending = false;
    recordingFinalizing = false;
    attemptRequestBusy = false;
    submissionBusy = false;
    staffSubmissions = [];
    selectedStaffSubmission = null;
    selectedEvidenceIndex = 0;
    if (clearClaim) clearStudentClaim();
    if (elements.claimInput) elements.claimInput.value = "";
    if (elements.studentName) elements.studentName.value = "";
    if (elements.studentId) elements.studentId.value = "";
    if (elements.preflightPlayback) { elements.preflightPlayback.removeAttribute("src"); elements.preflightPlayback.hidden = true; }
    if (elements.preflightConfirm?.type === "checkbox") elements.preflightConfirm.checked = false;
    if (elements.submitConfirmation) elements.submitConfirmation.checked = false;
    setHidden(elements.account, true);
    setHidden(elements.claimPanel, true);
    setHidden(elements.onboarding, true);
    setHidden(elements.exam, true);
    setHidden(elements.ready, true);
    setHidden(elements.complete, true);
    setHidden(elements.admin, true);
    setHidden(elements.staff, true);
    setHidden(elements.dock, true);
    setHidden(elements.reaction, true);
    setHidden(elements.recovery, true);
    setDisabled(elements.start, true);
    setDisabled(elements.resume, true);
    setDisabled(elements.preflightConfirm, true);
    setDisabled(elements.submit, true);
    setDisabled(elements.submitConfirmation, false);
    setEvidenceControlsEnabled(false);
  }

  async function loadState(allowClaimPrompt = false) {
    const activeUser = readUser();
    user = activeUser;
    if (!user) {
      resetProtectedSession({ clearClaim: true });
      showAccess("Please sign in with Google, Microsoft, or your course account before opening the Final Oral Task.", "login");
      openLogin();
      return;
    }
    const requestedCredential = user.credential;
    const loadGeneration = ++stateLoadGeneration;
    lastCredential = requestedCredential;
    try {
      const result = await request(API.state, { method: "GET" }, 2);
      if (loadGeneration !== stateLoadGeneration || readUser()?.credential !== requestedCredential) return;
      const payload = result.data || {};
      attempt = null;
      submission = null;
      assignedQuestions = [];
      currentIndex = 0;
      revision = 0;
      savedCurrentTurn = false;
      selectedStaffSubmission = null;
      setHidden(elements.exam, true);
      setHidden(elements.ready, true);
      setHidden(elements.complete, true);
      setHidden(elements.staff, true);
      setHidden(elements.dock, true);
      setEvidenceControlsEnabled(false);
      role = payload.role || "student";
      serverState = payload.state || {};
      renderAdminState();
      if (role === "admin" || role === "teacher") {
        showAccess("Staff access confirmed. Use the administration and review panels below.", "staff");
        setHidden(elements.onboarding, true);
        setHidden(elements.staff, false);
        await loadStaffSubmissions();
        return;
      }
      if (!payload.student) {
        if (allowClaimPrompt && payload.claimAvailable && promptStudentClaim()) return loadState(false);
        showAccess("This signed-in account is not linked to a Basic English student record. Enter the document number associated with the gradebook.", "claim");
        setHidden(elements.claimPanel, false);
        setHidden(elements.claim, false);
        elements.claimInput?.focus();
        return;
      }
      setHidden(elements.claimPanel, true);
      setHidden(elements.claim, true);
      fillIdentity(payload.student);
      if (payload.submission) return renderSubmission(payload.submission);
      if (payload.attempt) {
        setHidden(elements.access, true);
        setHidden(elements.onboarding, false);
        hydrateAttempt(payload.attempt, false);
        return;
      }
      setHidden(elements.access, false);
      setHidden(elements.onboarding, false);
      if (payload.canStart) {
        showAccess("Access confirmed. Complete the microphone check before starting the official exam.", "success");
        if (elements.start) elements.start.innerHTML = '<i class="bi bi-play-fill"></i> Begin official interview';
        setHidden(elements.start, false);
        setDisabled(elements.start, !preflightPassed);
      } else {
        showAccess("The Final Oral Task is closed. The teacher must activate it before you can start a new attempt.", "closed");
        setDisabled(elements.start, true);
      }
    } catch (error) {
      if (loadGeneration !== stateLoadGeneration || readUser()?.credential !== requestedCredential) return;
      showAccess(error.status === 401 ? "Your session expired. Please sign in again." : "The exam server did not answer. Reload the page and try again.", "error");
      if (error.status === 401) openLogin();
    }
  }

  async function startAttempt() {
    if (attemptRequestBusy) return;
    if (!preflightPassed) {
      setText(elements.preflightStatus, "Complete and confirm the microphone check before starting.");
      return;
    }
    const requestSession = sessionGeneration;
    const requestCredential = user?.credential || "";
    attemptRequestBusy = true;
    setDisabled(elements.start, true);
    try {
      const result = await request(API.start, jsonOptions("POST", {}), 2);
      if (requestSession !== sessionGeneration || user?.credential !== requestCredential) return;
      setHidden(elements.access, true);
      setHidden(elements.onboarding, true);
      setHidden(elements.exam, false);
      hydrateAttempt(result.data.attempt);
      toast(result.data.resumed ? "Your saved attempt was restored." : "Your official attempt has started.", "success");
    } catch (error) {
      if (requestSession !== sessionGeneration || user?.credential !== requestCredential) return;
      if (error.status === 409 && error.data?.submission) return renderSubmission(error.data.submission);
      if (error.status === 403 && error.data?.error === "student_not_authorized" && promptStudentClaim()) return loadState(false);
      const examClosed = error.data?.error === "exam_closed";
      setText(elements.preflightStatus, examClosed ? "The exam was closed before the attempt started." : "The attempt could not start. Your microphone check remains valid; try again.");
      setDisabled(elements.start, examClosed);
    } finally {
      if (requestSession === sessionGeneration) attemptRequestBusy = false;
    }
  }

  async function resumeAttempt() {
    if (attemptRequestBusy) return;
    if (!preflightPassed) {
      setText(elements.preflightStatus, "Complete and confirm the microphone check before resuming.");
      return;
    }
    const requestSession = sessionGeneration;
    const requestCredential = user?.credential || "";
    attemptRequestBusy = true;
    setDisabled(elements.resume || elements.start, true);
    try {
      const result = await request(`${API.attempt}?attemptId=${encodeURIComponent(attempt?.attemptId || "")}`, { method: "GET" }, 2);
      if (requestSession !== sessionGeneration || user?.credential !== requestCredential) return;
      if (result.data.submission) return renderSubmission(result.data.submission);
      setHidden(elements.onboarding, true);
      setHidden(elements.exam, false);
      hydrateAttempt(result.data.attempt);
      toast("Your saved oral exam was restored.", "success");
    } catch {
      if (requestSession !== sessionGeneration || user?.credential !== requestCredential) return;
      setDisabled(elements.resume || elements.start, !preflightPassed);
      toast("The saved attempt could not be restored. Check the connection and try again.", "error");
    } finally {
      if (requestSession === sessionGeneration) attemptRequestBusy = false;
    }
  }

  function currentQuestion() { return assignedQuestions[currentIndex] || null; }

  function updateJourney(question) {
    const currentUnit = String(question?.unit || "interaction");
    root.querySelectorAll("[data-unit-step]").forEach((item) => {
      const step = String(item.dataset.unitStep || "");
      const sequence = step === "interaction" ? 7 : Number(step);
      item.classList.toggle("is-active", step === currentUnit);
      item.classList.toggle("is-complete", sequence < currentIndex + 1 || Boolean(attempt?.turns?.[step === "interaction" ? "interaction" : `unit-${step}`]));
    });
    const view = UNIT_VIEW[currentUnit] || UNIT_VIEW.interaction;
    setText(elements.journeyLabel, currentUnit === "interaction" ? "Final interaction" : `Unit ${currentUnit} of 6`);
    if (elements.progress) {
      if (elements.progress instanceof HTMLProgressElement) {
        elements.progress.max = REQUIRED_TURNS;
        elements.progress.value = currentIndex;
      } else elements.progress.style.width = `${Math.round((currentIndex / REQUIRED_TURNS) * 100)}%`;
      elements.progress.setAttribute("aria-valuetext", `${currentIndex} of ${REQUIRED_TURNS} responses saved`);
    }
    if (elements.unitVisualPanel) elements.unitVisualPanel.dataset.unit = currentUnit;
    if (elements.unitVisualImage) {
      elements.unitVisualImage.src = `../../assets/img/english-basic/final-oral-task-real/${currentUnit === "interaction" ? "interaction" : `unit-${currentUnit}`}-v1.webp`;
      elements.unitVisualImage.alt = `Professional visual context for ${view.label}`;
    }
    setText(elements.unitVisualNumber, currentUnit === "interaction" ? "FINAL" : `UNIT ${String(currentUnit).padStart(2, "0")}`);
    setText(elements.unitVisualEyebrow, view.label);
    setText(elements.unitVisualTitle, view.title);
    setText(elements.unitVisualCaption, view.caption);
    setText(elements.questionInstruction, currentUnit === "interaction" ? "Ask both questions in one recording. Daniel will answer each one." : "Listen carefully. Then answer with your own information.");
  }

  function renderCurrentTurn() {
    const question = currentQuestion();
    if (!question) return renderReadyToSubmit();
    clearQuestionAudio();
    setHidden(elements.onboarding, true);
    setHidden(elements.exam, false);
    setHidden(elements.ready, true);
    setHidden(elements.complete, true);
    setHidden(elements.reaction, true);
    setHidden(elements.recovery, true);
    questionHeard = false;
    savedCurrentTurn = Boolean(attempt?.turns?.[question.turnId]);
    currentBlob = null;
    currentTranscript = "";
    currentClientTurnId = "";
    recordingDurationMs = 0;
    if (objectUrl) { URL.revokeObjectURL(objectUrl); objectUrl = ""; }
    if (elements.studentAudio) { elements.studentAudio.removeAttribute("src"); elements.studentAudio.hidden = true; }
    setText(elements.counter, `Response ${currentIndex + 1} of ${REQUIRED_TURNS}`);
    setText(elements.topic, question.unit === "interaction" ? "Final interaction · ask Daniel two questions" : `Unit ${question.unit} · ${question.unitLabel || "Course conversation"}`);
    updateJourney(question);
    setText(elements.question, question.question || "Listen to Daniel's question.");
    setText(elements.recordStatus, "Listen to Daniel before recording your response.");
    setText(elements.recordHelp, question.unit === "interaction" ? "Record both questions in one response. No answer model or hint is shown during the exam." : "No answer model, vocabulary hint, or correction is shown during the exam.");
    setText(elements.transcript, "Your transcript is stored privately for teacher review after the recording is saved.");
    setText(elements.saveStatus, savedCurrentTurn ? "Response already saved." : "Not saved yet.");
    setText(elements.timer, `0:00 / 0:${String(TURN_LIMIT_SECONDS[question.unit] || 28).padStart(2, "0")}`);
    setText(elements.dockLabel, `Response ${currentIndex + 1} of ${REQUIRED_TURNS}`);
    setText(elements.dockTimer, "0:00");
    setHidden(elements.dock, false);
    setText(elements.answerState, "Ready");
    if (elements.answerState) elements.answerState.className = "answer-state ready";
    setHidden(elements.answerCaptured, true);
    setDisabled(elements.questionPlay, savedCurrentTurn);
    setDisabled(elements.mic, true);
    setDisabled(elements.dockMic, true);
    setDisabled(elements.stop, true);
    setDisabled(elements.dockStop, true);
    setHidden(elements.next, true);
    setDanielState("ready", "Daniel is ready");
    setText(elements.sessionCode, attempt?.attemptId || "Pending");
    startExamClock();
  }

  async function playCurrentQuestion() {
    const question = currentQuestion();
    if (!question || analyzing || reactionBusy || savedCurrentTurn || questionAudioLoading || questionAudioPlaying) return;
    const turnId = String(question.turnId || "");
    const playbackToken = ++questionPlaybackToken;
    questionAudioLoading = true;
    try {
      questionHeard = false;
      updateRecordingControls(false);
      setDanielState("speaking", playbackSpeed === .75 ? "Daniel is speaking slowly" : "Daniel is speaking");
      const source = promptAudioUrl(question);
      if (!source) throw new Error("prompt_audio_unavailable");
      const protectedAudio = source.startsWith("/api/") || source.includes("/api/basic-final-oral/");
      if (protectedAudio) {
        const blob = await fetchProtectedAudio(source);
        if (playbackToken !== questionPlaybackToken || String(currentQuestion()?.turnId || "") !== turnId) return;
        if (promptObjectUrl) URL.revokeObjectURL(promptObjectUrl);
        promptObjectUrl = URL.createObjectURL(blob);
        elements.questionAudio.src = promptObjectUrl;
      } else {
        elements.questionAudio.src = source;
      }
      if (playbackToken !== questionPlaybackToken || String(currentQuestion()?.turnId || "") !== turnId) return;
      elements.questionAudio.dataset.turnId = turnId;
      elements.questionAudio.playbackRate = playbackSpeed;
      questionAudioPlaying = true;
      questionPlaybackWatchdog = window.setTimeout(() => {
        if (playbackToken !== questionPlaybackToken || String(currentQuestion()?.turnId || "") !== turnId) return;
        clearQuestionAudio();
        setDanielState("ready", "Daniel's audio stopped responding");
        setText(elements.recordStatus, "The question audio stopped responding. Check the connection and press Play Daniel again.");
        updateRecordingControls(false);
      }, 45000);
      await elements.questionAudio.play();
      setText(elements.recordStatus, "Listen to Daniel's complete question before recording.");
    } catch {
      if (playbackToken !== questionPlaybackToken) return;
      if (questionPlaybackWatchdog) window.clearTimeout(questionPlaybackWatchdog);
      questionPlaybackWatchdog = 0;
      questionAudioPlaying = false;
      setDanielState("ready", "Daniel's audio could not play");
      setText(elements.recordStatus, "The question audio could not play. Check the connection and press Play Daniel again.");
    } finally {
      if (playbackToken === questionPlaybackToken) {
        questionAudioLoading = false;
        updateRecordingControls(mediaRecorder?.state === "recording");
      }
    }
  }

  function supportedMimeType() {
    const candidates = ["audio/webm;codecs=opus", "audio/mp4;codecs=mp4a.40.2", "audio/mp4", "audio/webm", "audio/ogg;codecs=opus"];
    return candidates.find((type) => window.MediaRecorder?.isTypeSupported?.(type)) || "";
  }

  async function listMicrophones(select = elements.microphoneSelect) {
    if (!navigator.mediaDevices?.enumerateDevices || !select) return;
    const devices = (await navigator.mediaDevices.enumerateDevices()).filter((device) => device.kind === "audioinput");
    const selected = select.value;
    select.innerHTML = devices.map((device, index) => `<option value="${escapeHtml(device.deviceId)}">${escapeHtml(device.label || `Microphone ${index + 1}`)}</option>`).join("");
    if (devices.some((device) => device.deviceId === selected)) select.value = selected;
  }

  function stopLevelMeter() {
    if (levelFrame) cancelAnimationFrame(levelFrame);
    levelFrame = null;
    levelAnalyser = null;
    if (levelContext) levelContext.close().catch(() => {});
    levelContext = null;
    if (activeLevelBar) activeLevelBar.style.width = "0%";
    setText(activeLevelValue, "0%");
    activeLevelBar = null;
    activeLevelValue = null;
  }

  function startLevelMeter(stream, bar = elements.levelBar, valueNode = elements.levelValue) {
    stopLevelMeter();
    activeLevelBar = bar;
    activeLevelValue = valueNode;
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) return;
    try {
      levelContext = new Context();
      levelAnalyser = levelContext.createAnalyser();
      levelAnalyser.fftSize = 512;
      levelContext.createMediaStreamSource(stream).connect(levelAnalyser);
      const data = new Uint8Array(levelAnalyser.fftSize);
      const draw = () => {
        if (!levelAnalyser) return;
        levelAnalyser.getByteTimeDomainData(data);
        let sum = 0;
        for (const value of data) { const centered = (value - 128) / 128; sum += centered * centered; }
        const percent = Math.min(100, Math.round(Math.sqrt(sum / data.length) * 380));
        if (activeLevelBar) activeLevelBar.style.width = `${percent}%`;
        setText(activeLevelValue, `${percent}%`);
        levelFrame = requestAnimationFrame(draw);
      };
      draw();
    } catch { stopLevelMeter(); }
  }

  function stopMediaStream() {
    stopLevelMeter();
    if (mediaStream) mediaStream.getTracks().forEach((track) => track.stop());
    mediaStream = null;
  }

  async function ensureMediaStream(select = elements.microphoneSelect) {
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) throw new Error("unsupported_microphone");
    if (mediaStream?.getTracks().some((track) => track.readyState === "live")) return mediaStream;
    const deviceId = select?.value;
    mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: { deviceId: deviceId ? { exact: deviceId } : undefined, echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      video: false
    });
    await listMicrophones(select).catch(() => {});
    return mediaStream;
  }

  async function runPreflight() {
    if (preflightRecorder?.state === "recording") return;
    const preflightSession = sessionGeneration;
    preflightPassed = false;
    setDisabled(elements.start, true);
    setDisabled(elements.preflight, true);
    setDisabled(elements.preflightConfirm, true);
    setDisabled(elements.preflightMicrophoneSelect, true);
    setDisabled(elements.microphoneSelect, true);
    setText(elements.preflightStatus, "Recording a four-second microphone sample. Speak now.");
    try {
      const stream = await ensureMediaStream(elements.preflightMicrophoneSelect || elements.microphoneSelect);
      startLevelMeter(stream, elements.preflightLevelBar || elements.levelBar, elements.preflightLevelValue || elements.levelValue);
      const sampleChunks = [];
      const mimeType = supportedMimeType();
      preflightRecorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      preflightRecorder.addEventListener("dataavailable", (event) => { if (event.data?.size) sampleChunks.push(event.data); });
      preflightRecorder.addEventListener("stop", () => {
        if (preflightSession !== sessionGeneration) {
          stopMediaStream();
          return;
        }
        const sample = new Blob(sampleChunks, { type: preflightRecorder.mimeType || "audio/webm" });
        stopMediaStream();
        if (preflightObjectUrl) URL.revokeObjectURL(preflightObjectUrl);
        preflightObjectUrl = URL.createObjectURL(sample);
        if (elements.preflightPlayback) { elements.preflightPlayback.src = preflightObjectUrl; elements.preflightPlayback.hidden = false; }
        setText(elements.preflightStatus, "Play the sample. If your voice is clear, confirm the microphone check.");
        preflightSampleReady = sample.size >= 700;
        setDisabled(elements.preflightConfirm, sample.size < 700);
        setDisabled(elements.preflight, false);
        setDisabled(elements.preflightMicrophoneSelect, false);
        setDisabled(elements.microphoneSelect, false);
        if (preflightSampleReady && elements.preflightConfirm?.type === "checkbox" && elements.preflightConfirm.checked) confirmPreflight();
      }, { once: true });
      preflightRecorder.start(200);
      window.setTimeout(() => { if (preflightRecorder?.state === "recording") preflightRecorder.stop(); }, 4000);
    } catch (error) {
      stopMediaStream();
      setDisabled(elements.preflight, false);
      setDisabled(elements.preflightMicrophoneSelect, false);
      setDisabled(elements.microphoneSelect, false);
      setText(elements.preflightStatus, error.name === "NotAllowedError" ? "Microphone permission was denied. Allow access in the browser settings and retry." : "The microphone could not start. Select another microphone or browser and retry.");
    }
  }

  function confirmPreflight() {
    if (!preflightSampleReady) {
      preflightPassed = false;
      setDisabled(elements.start, true);
      setText(elements.preflightStatus, "Record and play the microphone sample before confirming readiness.");
      return;
    }
    if (elements.preflightConfirm?.type === "checkbox" && !elements.preflightConfirm.checked) {
      preflightPassed = false;
      setDisabled(elements.start, true);
      setDisabled(elements.resume, true);
      return;
    }
    preflightPassed = true;
    setText(elements.preflightStatus, "Microphone check confirmed. You can start or resume the official exam.");
    setDisabled(elements.preflightConfirm, true);
    if (attempt) setDisabled(elements.resume || elements.start, false);
    else if (serverState?.isOpen) setDisabled(elements.start, false);
  }

  function updateRecordingControls(recording) {
    const controlsBusy = recording || recordingStartPending || recordingFinalizing || analyzing;
    setDisabled(elements.mic, controlsBusy || savedCurrentTurn || !questionHeard);
    setDisabled(elements.dockMic, controlsBusy || savedCurrentTurn || !questionHeard);
    setDisabled(elements.stop, !recording);
    setDisabled(elements.dockStop, !recording);
    setHidden(elements.dockMic, recording);
    setHidden(elements.dockStop, !recording);
    setDisabled(elements.microphoneSelect, controlsBusy);
    setDisabled(elements.preflightMicrophoneSelect, controlsBusy);
    setDisabled(elements.questionPlay, controlsBusy || reactionBusy || savedCurrentTurn || questionAudioLoading || questionAudioPlaying);
    if (elements.answerState) {
      elements.answerState.className = `answer-state ${recording ? "recording" : analyzing ? "processing" : savedCurrentTurn ? "saved" : "ready"}`;
      elements.answerState.innerHTML = `<i class="bi bi-circle-fill"></i> ${recording ? "Recording" : analyzing ? "Processing" : savedCurrentTurn ? "Saved" : "Ready"}`;
    }
  }

  function updateRecordingTimer() {
    const elapsed = Date.now() - recordingStartedAt;
    const limit = (TURN_LIMIT_SECONDS[currentQuestion()?.unit] || 28) * 1000;
    setText(elements.timer, `${formatDuration(elapsed)} / ${formatDuration(limit)}`);
    setText(elements.dockTimer, formatDuration(elapsed));
  }

  async function startRecording() {
    if (!questionHeard || analyzing || savedCurrentTurn || recordingStartPending || recordingFinalizing || mediaRecorder?.state === "recording") return;
    const recordingSession = sessionGeneration;
    recordingStartPending = true;
    updateRecordingControls(false);
    try {
      const stream = await ensureMediaStream(elements.microphoneSelect);
      if (recordingSession !== sessionGeneration) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      startLevelMeter(stream);
      chunks = [];
      const mimeType = supportedMimeType();
      mediaRecorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorder.addEventListener("dataavailable", (event) => {
        if (recordingSession === sessionGeneration && event.data?.size) chunks.push(event.data);
      });
      mediaRecorder.addEventListener("stop", () => {
        if (recordingSession === sessionGeneration) handleRecordingStopped();
        else stopMediaStream();
      }, { once: true });
      mediaRecorder.start(250);
      recordingStartPending = false;
      recordingStartedAt = Date.now();
      currentClientTurnId = createId("bfo-turn");
      setDanielState("listening", "Daniel is listening");
      setText(elements.recordStatus, "Recording your official response.");
      updateRecordingControls(true);
      updateRecordingTimer();
      timerHandle = window.setInterval(updateRecordingTimer, 200);
      const limit = (TURN_LIMIT_SECONDS[currentQuestion()?.unit] || 28) * 1000;
      autoStopHandle = window.setTimeout(stopRecording, limit);
    } catch (error) {
      if (recordingSession !== sessionGeneration) return;
      setText(elements.recordStatus, error.name === "NotAllowedError" ? "Microphone permission was denied. Allow access and retry this technical step." : "The microphone could not start. Select another microphone and retry.");
      showTechnicalRecovery("The microphone did not start. Your saved responses are unchanged.");
    } finally {
      if (mediaRecorder?.state !== "recording") {
        recordingStartPending = false;
        updateRecordingControls(false);
      }
    }
  }

  function stopRecording() {
    if (mediaRecorder?.state !== "recording") return;
    recordingFinalizing = true;
    recordingDurationMs = Date.now() - recordingStartedAt;
    window.clearInterval(timerHandle);
    window.clearTimeout(autoStopHandle);
    timerHandle = null;
    autoStopHandle = null;
    mediaRecorder.stop();
    setText(elements.recordStatus, "Preparing your recording.");
    updateRecordingControls(false);
  }

  async function handleRecordingStopped() {
    stopMediaStream();
    currentBlob = new Blob(chunks, { type: mediaRecorder?.mimeType || "audio/webm" });
    chunks = [];
    if (currentBlob.size < 700 || recordingDurationMs < 700) {
      currentBlob = null;
      recordingFinalizing = false;
      setText(elements.recordStatus, "The recording was empty or too short. Retry this technical step.");
      updateRecordingControls(false);
      return showTechnicalRecovery("No complete audio reached the system. Check the microphone and record again.");
    }
    if (currentBlob.size > MAX_AUDIO_BYTES) {
      recordingFinalizing = false;
      setText(elements.recordStatus, "The recording exceeded the supported size. Retry this technical step.");
      updateRecordingControls(false);
      return showTechnicalRecovery("The audio was too large to save. Record the response again without exceeding the timer.");
    }
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = URL.createObjectURL(currentBlob);
    if (elements.studentAudio) { elements.studentAudio.src = objectUrl; elements.studentAudio.hidden = false; }
    recordingFinalizing = false;
    await processAndSaveCurrentTurn();
  }

  async function requestTranscription(blob) {
    const result = await request(API.transcribe, {
      method: "POST",
      headers: { "Content-Type": blob.type || "audio/webm", "X-Jaralingua-Language": "en" },
      body: blob,
      timeout: TRANSCRIPTION_TIMEOUT_MS
    }, 3);
    return result.data || {};
  }

  function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener("load", () => resolve(String(reader.result || "")), { once: true });
      reader.addEventListener("error", () => reject(reader.error || new Error("audio_read_failed")), { once: true });
      reader.readAsDataURL(blob);
    });
  }

  function applyServerAttempt(nextAttempt) {
    if (!nextAttempt) return;
    attempt = nextAttempt;
    revision = Number(nextAttempt.revision || revision);
    assignedQuestions = Array.isArray(nextAttempt.assignedQuestions) ? nextAttempt.assignedQuestions.slice().sort((a, b) => Number(a.sequence) - Number(b.sequence)) : assignedQuestions;
  }

  function sessionChangedError() { return Object.assign(new Error("session_changed"), { silent: true }); }

  async function saveCurrentTurn(transcript, dataUrl, allowStaleRetry = true, context = null) {
    const saveContext = context || {
      session: sessionGeneration,
      attemptId: attempt?.attemptId || "",
      mimeType: currentBlob?.type || "audio/webm"
    };
    const question = currentQuestion();
    if (!question || !attempt || saveContext.session !== sessionGeneration || attempt.attemptId !== saveContext.attemptId) throw sessionChangedError();
    const payload = {
      attemptId: saveContext.attemptId,
      turnId: question.turnId,
      variantId: question.variantId,
      clientTurnId: currentClientTurnId,
      transcript,
      durationMs: Math.round(recordingDurationMs),
      revision,
      audioDataUrl: dataUrl,
      mimeType: saveContext.mimeType
    };
    try {
      const result = await request(API.turn, jsonOptions("PUT", payload), 3);
      if (saveContext.session !== sessionGeneration || attempt?.attemptId !== saveContext.attemptId) throw sessionChangedError();
      revision = Number(result.data.revision ?? revision + 1);
      attempt.revision = revision;
      attempt.turns = attempt.turns || {};
      attempt.turns[question.turnId] = result.data.turn;
      return result.data.turn;
    } catch (error) {
      if (error?.silent || saveContext.session !== sessionGeneration || attempt?.attemptId !== saveContext.attemptId) throw sessionChangedError();
      if (allowStaleRetry && error.status === 409 && error.data?.error === "stale_attempt" && error.data.attempt) {
        applyServerAttempt(error.data.attempt);
        if (attempt.turns?.[question.turnId]) return attempt.turns[question.turnId];
        return saveCurrentTurn(transcript, dataUrl, false, saveContext);
      }
      throw error;
    }
  }

  async function processAndSaveCurrentTurn() {
    if (!currentBlob || analyzing) return;
    const processingSession = sessionGeneration;
    const processingAttemptId = attempt?.attemptId || "";
    const processingBlob = currentBlob;
    const saveContext = { session: processingSession, attemptId: processingAttemptId, mimeType: processingBlob.type || "audio/webm" };
    analyzing = true;
    setHidden(elements.recovery, true);
    setText(elements.recordStatus, "Transcribing the English response with the secure speech service.");
    setText(elements.saveStatus, "Saving is in progress. Do not close this page.");
    setDanielState("thinking", "Daniel is waiting while the response is saved");
    setBusy(true, "Securing your response…");
    if (elements.saveState) { elements.saveState.className = "exam-save-state saving"; elements.saveState.innerHTML = '<i class="bi bi-cloud-arrow-up-fill"></i><span>Saving response…</span>'; }
    updateRecordingControls(false);
    try {
      const transcription = await requestTranscription(processingBlob);
      if (processingSession !== sessionGeneration || attempt?.attemptId !== processingAttemptId) throw sessionChangedError();
      currentTranscript = String(transcription.text || "").trim();
      if (!currentTranscript) throw Object.assign(new Error("empty_transcript"), { technicalStage: "transcription" });
      const dataUrl = await blobToDataUrl(processingBlob);
      if (processingSession !== sessionGeneration || attempt?.attemptId !== processingAttemptId) throw sessionChangedError();
      await saveCurrentTurn(currentTranscript, dataUrl, true, saveContext);
      if (processingSession !== sessionGeneration || attempt?.attemptId !== processingAttemptId) throw sessionChangedError();
      savedCurrentTurn = true;
      setText(elements.transcript, "Transcript stored privately for teacher review.");
      setText(elements.recordStatus, "Official response saved.");
      setText(elements.saveStatus, `Saved securely · response ${currentIndex + 1} of ${REQUIRED_TURNS}`);
      setHidden(elements.answerCaptured, false);
      if (elements.saveState) { elements.saveState.className = "exam-save-state saved"; elements.saveState.innerHTML = '<i class="bi bi-cloud-check-fill"></i><span>Progress saved</span>'; }
      setHidden(elements.recovery, true);
      setHidden(elements.next, false);
      setDisabled(elements.next, true);
      updateRecordingControls(false);
      await playResponseQueue(responsesForTurn(currentQuestion(), currentTranscript));
    } catch (error) {
      if (error?.silent || processingSession !== sessionGeneration) return;
      setText(elements.recordStatus, "The technical save did not finish. Your recording remains on this screen.");
      setText(elements.saveStatus, "NOT SAVED — retry the technical step before continuing.");
      if (elements.saveState) { elements.saveState.className = "exam-save-state error"; elements.saveState.innerHTML = '<i class="bi bi-cloud-slash-fill"></i><span>Not saved yet</span>'; }
      showTechnicalRecovery(error.message === "empty_transcript" ? "The service detected no clear English transcript. Check the recording and retry the technical analysis, or record again if the file is silent." : "The connection or transcription service did not finish. Retry without changing your response.");
    } finally {
      if (processingSession !== sessionGeneration) return;
      analyzing = false;
      setBusy(false);
      if (!savedCurrentTurn) setDanielState("ready", "Daniel is waiting while you resolve the technical issue");
      updateRecordingControls(false);
    }
  }

  function showTechnicalRecovery(message) {
    setHidden(elements.recovery, false);
    setText(elements.recoveryMessage, message);
    setDisabled(elements.retry, !currentBlob);
    setDisabled(elements.recordAgain, false);
  }

  function resetFailedRecording() {
    if (savedCurrentTurn) return;
    currentBlob = null;
    currentTranscript = "";
    currentClientTurnId = "";
    recordingDurationMs = 0;
    if (objectUrl) { URL.revokeObjectURL(objectUrl); objectUrl = ""; }
    if (elements.studentAudio) { elements.studentAudio.removeAttribute("src"); elements.studentAudio.hidden = true; }
    setHidden(elements.recovery, true);
    setText(elements.recordStatus, "Technical retry ready. Record the response again.");
    updateRecordingControls(false);
  }

  function nextTurn() {
    if (!savedCurrentTurn || reactionBusy) return;
    clearQuestionAudio();
    currentIndex += 1;
    if (currentIndex >= assignedQuestions.length) renderReadyToSubmit();
    else renderCurrentTurn();
  }

  function renderReadyToSubmit() {
    setHidden(elements.exam, true);
    setHidden(elements.ready, false);
    setHidden(elements.dock, true);
    stopExamClock();
    const savedCount = Object.keys(attempt?.turns || {}).length;
    const duration = totalRecordedDuration();
    setText(elements.duration, `${savedCount} of ${REQUIRED_TURNS} responses saved · recorded speaking time ${formatDuration(duration)} · official target 2:30–3:00`);
    elements.submissionGrid?.querySelectorAll("[data-submission-unit]").forEach((card) => {
      const unit = card.dataset.submissionUnit;
      const turnId = unit === "interaction" ? "interaction" : `unit-${unit}`;
      const saved = Boolean(attempt?.turns?.[turnId]);
      card.classList.toggle("is-saved", saved);
      const small = card.querySelector("small");
      if (small) small.textContent = saved ? "Answer saved securely" : "Answer not saved";
      const icon = card.querySelector(":scope > i");
      if (icon) icon.className = `bi ${saved ? "bi-check2-circle" : "bi-exclamation-circle"}`;
    });
    const confirmed = !elements.submitConfirmation || elements.submitConfirmation.checked;
    setDisabled(elements.submitConfirmation, submissionBusy);
    setDisabled(elements.submit, submissionBusy || savedCount !== REQUIRED_TURNS || !confirmed);
    if (elements.progress) {
      if (elements.progress instanceof HTMLProgressElement) { elements.progress.max = REQUIRED_TURNS; elements.progress.value = savedCount; }
      else elements.progress.style.width = `${Math.round((savedCount / REQUIRED_TURNS) * 100)}%`;
    }
    setText(elements.submissionStatus, savedCount === REQUIRED_TURNS ? (confirmed ? "Seven recordings validated. Ready to submit." : "Confirm your final delivery to enable submission.") : `${savedCount} of ${REQUIRED_TURNS} recordings are saved.`);
  }

  function submissionId() {
    const key = SUBMISSION_KEY_PREFIX + (attempt?.attemptId || "unknown");
    let value = localStorage.getItem(key);
    if (!value) { value = createId("bfo-submit"); localStorage.setItem(key, value); }
    return value;
  }

  async function recoverSubmission(expectedSession = sessionGeneration, expectedAttemptId = attempt?.attemptId || "") {
    try {
      const result = await request(`${API.attempt}?attemptId=${encodeURIComponent(expectedAttemptId)}`, { method: "GET" }, 2);
      if (expectedSession !== sessionGeneration || attempt?.attemptId !== expectedAttemptId) return null;
      if (result.data.submission) return result.data.submission;
      if (result.data.attempt) applyServerAttempt(result.data.attempt);
    } catch { /* preserve current screen */ }
    return null;
  }

  async function submitExam() {
    if (submissionBusy || Object.keys(attempt?.turns || {}).length !== REQUIRED_TURNS || (elements.submitConfirmation && !elements.submitConfirmation.checked)) return;
    const submitSession = sessionGeneration;
    const submitAttemptId = attempt.attemptId;
    submissionBusy = true;
    setDisabled(elements.submit, true);
    setDisabled(elements.submitConfirmation, true);
    setText(elements.submissionStatus, "Submitting seven official recordings. Keep this page open.");
    const payload = { attemptId: submitAttemptId, revision, clientSubmissionId: submissionId() };
    try {
      const result = await request(API.submit, jsonOptions("POST", payload), 3);
      if (submitSession !== sessionGeneration || attempt?.attemptId !== submitAttemptId) return;
      renderSubmission(result.data.submission);
      try { await playClip(elements.reactionAudio, AUDIO_ROOT + "submission-complete.mp3"); } catch { /* receipt is authoritative */ }
      toast("Final Oral Task submitted successfully.", "success");
    } catch (error) {
      if (submitSession !== sessionGeneration || attempt?.attemptId !== submitAttemptId) return;
      if (error.status === 409 && error.data?.submission) return renderSubmission(error.data.submission);
      const recovered = await recoverSubmission(submitSession, submitAttemptId);
      if (submitSession !== sessionGeneration || attempt?.attemptId !== submitAttemptId) return;
      if (recovered) return renderSubmission(recovered);
      setText(elements.submissionStatus, "NOT SUBMITTED. Your seven recordings remain saved. Check the connection and press Submit again.");
      setDisabled(elements.submit, false);
      toast("The final submission did not complete. Your recordings remain saved.", "error");
    } finally {
      if (submitSession !== sessionGeneration) return;
      submissionBusy = false;
      if (!submission) renderReadyToSubmit();
    }
  }

  async function updateAdminState(isOpen) {
    const adminSession = sessionGeneration;
    setDisabled(elements.adminOpen, true);
    setDisabled(elements.adminClose, true);
    if (elements.adminStatus) setText(elements.adminStatus.querySelector?.("span") || elements.adminStatus, "Saving the new exam state.");
    try {
      const result = await request(API.state, jsonOptions("PUT", { isOpen }), 2);
      if (adminSession !== sessionGeneration) return;
      serverState = result.data.state;
      renderAdminState();
      toast(result.data.message || (isOpen ? "The official exam is open." : "The official exam is closed."), "success");
    } catch {
      if (adminSession !== sessionGeneration) return;
      renderAdminState();
      if (elements.adminStatus) setText(elements.adminStatus.querySelector?.("span") || elements.adminStatus, "The exam state could not be changed. Try again.");
      toast("The exam state did not change.", "error");
    }
  }

  function staffSubmissionCard(item) {
    const assignmentByTurn = new Map((item.assignedQuestions || []).map((question) => [question.turnId, question]));
    const turns = (item.turns || []).map((turn, index) => {
      const question = assignmentByTurn.get(turn.turnId) || {};
      return `<article class="final-oral-review-turn">
        <div><strong>${index + 1}. ${escapeHtml(question.unit === "interaction" ? "Final interaction" : `Unit ${question.unit || ""} · ${question.unitLabel || ""}`)}</strong><p>${escapeHtml(question.question || "Assigned question unavailable")}</p></div>
        <p class="final-oral-review-transcript"><strong>Transcript:</strong> ${escapeHtml(turn.transcript || "No transcript returned")}</p>
        <p><small>Duration ${escapeHtml(formatDuration(turn.durationMs))}</small></p>
        ${turn.audioUrl ? `<button type="button" data-load-final-oral-audio="${escapeHtml(turn.audioUrl)}">Load protected recording</button><audio controls preload="none" hidden></audio>` : "<p>Audio unavailable.</p>"}
      </article>`;
    }).join("");
    const rubric = item.rubric || {};
    const fields = RUBRIC.map((criterion) => `<label>${escapeHtml(criterion.label)} <input type="number" min="0" max="10" step="1" data-final-oral-rubric="${criterion.key}" value="${escapeHtml(rubric[criterion.key] ?? "")}" required></label>`).join("");
    return `<details class="final-oral-review-card" data-student-id="${escapeHtml(item.studentId)}" data-receipt-id="${escapeHtml(item.receiptId)}">
      <summary><span>${escapeHtml(item.studentName)}</span><span>${escapeHtml(item.status)}</span><span>${escapeHtml(formatDuration(item.totalDurationMs))}</span></summary>
      <div class="final-oral-review-body">
        <p><strong>ID:</strong> ${escapeHtml(item.studentId)} · <strong>Receipt:</strong> ${escapeHtml(item.receiptId)} · <strong>Submitted:</strong> ${escapeHtml(item.submittedAt)}</p>
        <div class="final-oral-review-turns">${turns}</div>
        <section class="final-oral-rubric-grid">${fields}</section>
        <p data-final-oral-score>Rubric total: ${item.score50 ?? "—"} / 50 · Grade: ${item.grade ?? "—"} / 5.0</p>
        <label>Teacher feedback<textarea data-final-oral-feedback rows="5">${escapeHtml(item.teacherFeedback || "")}</textarea></label>
        <button type="button" data-save-final-oral-grade>Save grade and feedback</button>
        <p data-final-oral-grade-status role="status"></p>
      </div>
    </details>`;
  }

  async function loadStaffAudio(button) {
    const audio = button.nextElementSibling;
    if (!(audio instanceof HTMLAudioElement)) return;
    const staffSession = sessionGeneration;
    button.disabled = true;
    button.textContent = "Loading protected recording…";
    try {
      const blob = await fetchProtectedAudio(button.dataset.loadFinalOralAudio);
      if (staffSession !== sessionGeneration || !(role === "admin" || role === "teacher")) return;
      if (audio.dataset.objectUrl) URL.revokeObjectURL(audio.dataset.objectUrl);
      const audioObjectUrl = URL.createObjectURL(blob);
      audio.dataset.objectUrl = audioObjectUrl;
      audio.src = audioObjectUrl;
      audio.hidden = false;
      button.textContent = "Recording loaded";
      await audio.play().catch(() => {});
    } catch {
      if (staffSession !== sessionGeneration) return;
      button.disabled = false;
      button.textContent = "Retry protected recording";
    }
  }

  function updateStaffScore(card) {
    const values = [...card.querySelectorAll("[data-final-oral-rubric]")].map((input) => Number(input.value));
    const valid = values.length === RUBRIC.length && values.every((value) => Number.isFinite(value) && value >= 0 && value <= 10);
    const total = valid ? values.reduce((sum, value) => sum + value, 0) : null;
    const output = card.querySelector("[data-final-oral-score]");
    if (output) output.textContent = valid ? `Rubric total: ${total.toFixed(0)} / 50 · Grade: ${(total / 10).toFixed(2)} / 5.0` : "Complete all five rubric criteria from 0 to 10.";
    return valid;
  }

  async function saveStaffGrade(button) {
    const card = button.closest("[data-student-id]");
    if (!card || !updateStaffScore(card)) return;
    const rubric = {};
    card.querySelectorAll("[data-final-oral-rubric]").forEach((input) => { rubric[input.dataset.finalOralRubric] = Number(input.value); });
    const status = card.querySelector("[data-final-oral-grade-status]");
    button.disabled = true;
    setText(status, "Saving the official rubric and feedback.");
    try {
      const result = await request(API.grade, jsonOptions("PUT", {
        studentId: card.dataset.studentId,
        receiptId: card.dataset.receiptId,
        rubric,
        teacherFeedback: card.querySelector("[data-final-oral-feedback]")?.value || ""
      }), 2);
      setText(status, `Saved · ${result.data.submission.score50} / 50 · ${Number(result.data.submission.grade).toFixed(2)} / 5.0`);
      toast("Final Oral Task grade saved in Grades.", "success");
    } catch (error) {
      setText(status, error.data?.error === "submission_changed" ? "The submission changed. Refresh before grading." : "The grade could not be saved. Try again.");
    } finally { button.disabled = false; }
  }

  function wireStaffList() {
    elements.staffList?.querySelectorAll("[data-load-final-oral-audio]").forEach((button) => button.addEventListener("click", () => loadStaffAudio(button)));
    elements.staffList?.querySelectorAll("[data-final-oral-rubric]").forEach((input) => input.addEventListener("input", () => updateStaffScore(input.closest("[data-student-id]"))));
    elements.staffList?.querySelectorAll("[data-save-final-oral-grade]").forEach((button) => button.addEventListener("click", () => saveStaffGrade(button)));
  }

  function fixedRubricInputs() {
    return {
      taskCompletion: elements.rubricTask,
      interactionDiscourse: elements.rubricInteraction,
      fluency: elements.rubricFluency,
      vocabularyStructure: elements.rubricLanguage,
      pronunciation: elements.rubricPronunciation
    };
  }

  function updateFixedRubric() {
    const inputs = fixedRubricInputs();
    const values = Object.fromEntries(Object.entries(inputs).map(([key, input]) => [key, Number(input?.value)]));
    const valid = Object.values(inputs).every(Boolean) && Object.values(values).every((value) => Number.isFinite(value) && value >= 1 && value <= 10);
    const total = valid ? Object.values(values).reduce((sum, value) => sum + value, 0) : 0;
    setText(elements.rubricTotal, String(total));
    setText(elements.publishScore, String(total));
    setText(elements.publishGrade, `${(total / 10).toFixed(1)} / 5.0`);
    const barValues = { task: values.taskCompletion || 0, interaction: values.interactionDiscourse || 0, fluency: values.fluency || 0, language: values.vocabularyStructure || 0, pronunciation: values.pronunciation || 0 };
    root.querySelectorAll("[data-rubric-bar]").forEach((bar) => {
      const score = barValues[bar.dataset.rubricBar] || 0;
      bar.style.setProperty("--score", score);
      const output = bar.querySelector("em");
      if (output) output.textContent = String(score);
    });
    if (elements.rubricRadar) {
      const center = [160, 150];
      const ends = [[160, 34], [276, 119], [232, 256], [88, 256], [44, 119]];
      const ordered = [barValues.task, barValues.interaction, barValues.fluency, barValues.language, barValues.pronunciation];
      const points = ends.map(([x, y], index) => {
        const ratio = Math.max(0, Math.min(10, ordered[index])) / 10;
        return `${(center[0] + (x - center[0]) * ratio).toFixed(1)},${(center[1] + (y - center[1]) * ratio).toFixed(1)}`;
      });
      elements.rubricRadar.setAttribute("points", points.join(" "));
    }
    const feedbackReady = String(elements.teacherFeedback?.value || "").trim().length >= 10;
    setDisabled(elements.publishGradeButton, !selectedStaffSubmission || !valid || !feedbackReady);
    setText(elements.publishStatus, !selectedStaffSubmission ? "Select a student submission." : !valid ? "Complete the five criteria from 1 to 10." : !feedbackReady ? "Add specific teacher feedback before publishing." : `Ready to publish ${total} / 50 (${(total / 10).toFixed(2)} / 5.0).`);
    return valid && feedbackReady;
  }

  function setEvidenceControlsEnabled(enabled) {
    const buttons = Array.from(elements.evidenceTabs?.querySelectorAll("[data-evidence-unit]") || []);
    buttons.forEach((button) => {
      button.disabled = !enabled;
      if (!enabled) button.setAttribute("aria-selected", "false");
      button.tabIndex = enabled && button.getAttribute("aria-selected") === "true" ? 0 : -1;
    });
    if (elements.evidencePlay) {
      elements.evidencePlay.disabled = !enabled || !elements.evidencePlay.dataset.audioUrl;
    }
  }

  function activateEvidenceTab(button) {
    if (!selectedStaffSubmission || !button || button.disabled) return;
    const index = (selectedStaffSubmission.assignedQuestions || []).findIndex((question) => String(question.unit) === String(button.dataset.evidenceUnit));
    if (index >= 0) renderFixedEvidence(index);
  }

  function renderFixedEvidence(index) {
    if (!selectedStaffSubmission) return;
    staffEvidenceLoadToken += 1;
    setBusy(false);
    const questions = selectedStaffSubmission.assignedQuestions || [];
    const turns = selectedStaffSubmission.turns || [];
    const question = questions[index] || {};
    const turn = turns.find((item) => item?.turnId === question.turnId) || turns[index] || {};
    selectedEvidenceIndex = index;
    elements.evidenceTabs?.querySelectorAll("[data-evidence-unit]").forEach((button) => {
      const active = String(button.dataset.evidenceUnit) === String(question.unit);
      const available = questions.some((item) => String(item.unit) === String(button.dataset.evidenceUnit));
      button.disabled = !available;
      button.setAttribute("aria-selected", active ? "true" : "false");
      button.tabIndex = active ? 0 : -1;
    });
    setText(elements.evidenceUnitBadge, question.unit === "interaction" ? "FINAL" : `UNIT ${String(question.unit || index + 1).padStart(2, "0")}`);
    setText(elements.evidenceTopic, question.unitLabel || UNIT_VIEW[String(question.unit)]?.label || "Course evidence");
    setText(elements.evidenceQuestion, question.question || "Assigned question unavailable.");
    setText(elements.evidenceTranscript, turn.transcript || "No transcript was returned. Use the protected recording as the primary evidence.");
    setText(elements.evidenceDuration, formatDuration(turn.durationMs));
    setText(elements.evidenceRecordedAt, turn.savedAt || turn.updatedAt || selectedStaffSubmission.submittedAt || "—");
    setText(elements.evidenceStorageState, turn.audioAvailable ? "Protected audio ready" : "Audio unavailable");
    setText(elements.evidenceAudioLabel, question.unit === "interaction" ? "Student's two questions" : `Student answer · Unit ${question.unit || index + 1}`);
    setText(elements.evidenceAudioTime, "0:00");
    if (elements.evidenceAudioProgress) elements.evidenceAudioProgress.style.width = "0%";
    if (staffAudioObjectUrl) { URL.revokeObjectURL(staffAudioObjectUrl); staffAudioObjectUrl = ""; }
    if (elements.evidenceAudio) { elements.evidenceAudio.pause(); elements.evidenceAudio.removeAttribute("src"); elements.evidenceAudio.load(); }
    if (elements.evidencePlay) {
      elements.evidencePlay.dataset.audioUrl = turn.audioUrl || "";
      elements.evidencePlay.disabled = !turn.audioUrl;
      elements.evidencePlay.innerHTML = '<i class="bi bi-play-fill"></i>';
    }
  }

  function selectFixedSubmission(receiptId) {
    staffEvidenceLoadToken += 1;
    setBusy(false);
    selectedStaffSubmission = staffSubmissions.find((item) => item.receiptId === receiptId) || null;
    if (!selectedStaffSubmission) {
      setText(elements.staffStudentName, "No submission selected");
      setDisabled(elements.publishGradeButton, true);
      setEvidenceControlsEnabled(false);
      if (elements.evidencePlay) {
        elements.evidencePlay.dataset.audioUrl = "";
        elements.evidencePlay.innerHTML = '<i class="bi bi-play-fill"></i>';
      }
      return;
    }
    setText(elements.staffStudentName, selectedStaffSubmission.studentName || "Student");
    setText(elements.staffStudentId, `ID ${selectedStaffSubmission.studentId || "—"}`);
    setText(elements.staffSubmittedAt, `Submitted ${selectedStaffSubmission.submittedAt || "—"}`);
    setText(elements.staffReceipt, `Receipt ${selectedStaffSubmission.receiptId || "—"}`);
    if (elements.staffReviewStatus) elements.staffReviewStatus.innerHTML = selectedStaffSubmission.status === "graded" ? '<i class="bi bi-patch-check-fill"></i> Graded' : '<i class="bi bi-hourglass-split"></i> Pending review';
    setText(elements.evidenceCoverage, `${(selectedStaffSubmission.turns || []).filter((turn) => turn?.audioAvailable).length} of ${REQUIRED_TURNS} loaded`);
    const rubric = selectedStaffSubmission.rubric || {};
    Object.entries(fixedRubricInputs()).forEach(([key, input]) => { if (input) input.value = rubric[key] ?? ""; });
    if (elements.teacherFeedback) elements.teacherFeedback.value = selectedStaffSubmission.teacherFeedback || "";
    setEvidenceControlsEnabled(true);
    renderFixedEvidence(0);
    updateFixedRubric();
  }

  async function playFixedEvidence() {
    const url = elements.evidencePlay?.dataset.audioUrl;
    if (!url || !elements.evidenceAudio) return;
    const staffSession = sessionGeneration;
    const receiptId = selectedStaffSubmission?.receiptId || "";
    const evidenceIndex = selectedEvidenceIndex;
    const loadToken = ++staffEvidenceLoadToken;
    const stillCurrent = () => staffSession === sessionGeneration
      && loadToken === staffEvidenceLoadToken
      && selectedStaffSubmission?.receiptId === receiptId
      && selectedEvidenceIndex === evidenceIndex
      && elements.evidencePlay?.dataset.audioUrl === url;
    try {
      if (!elements.evidenceAudio.src) {
        setBusy(true, "Loading protected student evidence…");
        const blob = await fetchProtectedAudio(url);
        if (!stillCurrent()) return;
        const nextObjectUrl = URL.createObjectURL(blob);
        if (!stillCurrent()) {
          URL.revokeObjectURL(nextObjectUrl);
          return;
        }
        if (staffAudioObjectUrl) URL.revokeObjectURL(staffAudioObjectUrl);
        staffAudioObjectUrl = nextObjectUrl;
        elements.evidenceAudio.src = staffAudioObjectUrl;
      }
      if (!stillCurrent()) return;
      if (elements.evidenceAudio.paused) {
        await elements.evidenceAudio.play();
        if (!stillCurrent()) return;
        if (elements.evidencePlay) elements.evidencePlay.innerHTML = '<i class="bi bi-pause-fill"></i>';
      } else {
        elements.evidenceAudio.pause();
        if (elements.evidencePlay) elements.evidencePlay.innerHTML = '<i class="bi bi-play-fill"></i>';
      }
    } catch {
      if (stillCurrent()) toast("The protected recording could not be loaded. Retry the connection.", "error");
    } finally {
      if (stillCurrent()) setBusy(false);
    }
  }

  async function saveFixedStaffGrade() {
    if (!selectedStaffSubmission || !updateFixedRubric()) return;
    const inputs = fixedRubricInputs();
    const rubric = Object.fromEntries(Object.entries(inputs).map(([key, input]) => [key, Number(input.value)]));
    setDisabled(elements.publishGradeButton, true);
    setText(elements.publishStatus, "Saving the official grade and feedback in Grades.");
    try {
      const result = await request(API.grade, jsonOptions("PUT", {
        studentId: selectedStaffSubmission.studentId,
        receiptId: selectedStaffSubmission.receiptId,
        rubric,
        teacherFeedback: elements.teacherFeedback.value
      }), 2);
      selectedStaffSubmission = result.data.submission;
      const index = staffSubmissions.findIndex((item) => item.receiptId === selectedStaffSubmission.receiptId);
      if (index >= 0) staffSubmissions[index] = selectedStaffSubmission;
      setText(elements.publishStatus, `Published · ${selectedStaffSubmission.score50} / 50 · ${Number(selectedStaffSubmission.grade).toFixed(2)} / 5.0`);
      if (elements.staffReviewStatus) elements.staffReviewStatus.innerHTML = '<i class="bi bi-patch-check-fill"></i> Graded';
      toast("Final Oral Task grade and feedback published.", "success");
    } catch (error) {
      setText(elements.publishStatus, error.data?.error === "submission_changed" ? "This submission changed. Refresh before publishing." : "The grade could not be published. Check the connection and retry.");
      setDisabled(elements.publishGradeButton, false);
    }
  }

  async function loadStaffSubmissions() {
    if (!(role === "admin" || role === "teacher") || (!elements.staffList && !elements.submissionSelector)) return;
    const staffSession = sessionGeneration;
    setText(elements.staffStatus, "Loading submitted oral exams.");
    try {
      const result = await request(API.submissions, { method: "GET" }, 2);
      if (staffSession !== sessionGeneration || !(role === "admin" || role === "teacher")) return;
      const items = Array.isArray(result.data.submissions) ? result.data.submissions : [];
      staffSubmissions = items;
      if (elements.staffList) {
        elements.staffList.innerHTML = items.length ? items.map(staffSubmissionCard).join("") : "<p>No Final Oral Task submissions have arrived yet.</p>";
        wireStaffList();
      }
      if (elements.submissionSelector) {
        const previous = selectedStaffSubmission?.receiptId || elements.submissionSelector.value;
        elements.submissionSelector.innerHTML = '<option value="">Select a student</option>' + items.map((item) => `<option value="${escapeHtml(item.receiptId)}">${escapeHtml(item.studentName)} · ${escapeHtml(item.status)}</option>`).join("");
        const preferred = items.some((item) => item.receiptId === previous) ? previous : (items.find((item) => item.status !== "graded") || items[0])?.receiptId || "";
        elements.submissionSelector.value = preferred;
        selectFixedSubmission(preferred);
      }
      setText(elements.staffStatus, `${items.length} submitted · ${result.data.counts?.pendingReview || 0} pending review · ${result.data.counts?.graded || 0} graded`);
    } catch {
      if (staffSession === sessionGeneration) setText(elements.staffStatus, "The submissions could not be loaded. Check the server connection and retry.");
    }
  }

  function bindEvents() {
    root.querySelectorAll("[data-final-oral-speed], [data-audio-speed], [data-question-speed]").forEach((button) => button.addEventListener("click", () => {
      const next = Number(button.dataset.finalOralSpeed ?? button.dataset.audioSpeed ?? button.dataset.questionSpeed);
      if (![.75, 1].includes(next)) return;
      playbackSpeed = next;
      updateSpeedButtons();
    }));
    elements.welcomePlay?.addEventListener("click", () => playClip(elements.welcomeAudio, AUDIO_ROOT + "daniel-welcome.mp3").catch(() => toast("Daniel's welcome audio could not play.", "error")));
    elements.instructionsPlay?.addEventListener("click", () => playClip(elements.instructionsAudio, AUDIO_ROOT + "exam-instructions.mp3").catch(() => toast("The instruction audio could not play.", "error")));
    elements.signIn?.addEventListener("click", openLogin);
    elements.refreshAccess?.addEventListener("click", () => loadState(true));
    elements.claim?.addEventListener("click", submitStudentClaim);
    elements.claimInput?.addEventListener("keydown", (event) => { if (event.key === "Enter") submitStudentClaim(); });
    elements.preflight?.addEventListener("click", runPreflight);
    elements.preflightConfirm?.addEventListener(elements.preflightConfirm.type === "checkbox" ? "change" : "click", confirmPreflight);
    elements.start?.addEventListener("click", () => attempt ? resumeAttempt() : startAttempt());
    elements.resume?.addEventListener("click", resumeAttempt);
    elements.questionPlay?.addEventListener("click", playCurrentQuestion);
    elements.mic?.addEventListener("click", startRecording);
    elements.dockMic?.addEventListener("click", startRecording);
    elements.stop?.addEventListener("click", stopRecording);
    elements.dockStop?.addEventListener("click", stopRecording);
    elements.retry?.addEventListener("click", processAndSaveCurrentTurn);
    elements.recordAgain?.addEventListener("click", resetFailedRecording);
    elements.next?.addEventListener("click", nextTurn);
    elements.submit?.addEventListener("click", submitExam);
    elements.submitConfirmation?.addEventListener("change", renderReadyToSubmit);
    elements.adminOpen?.addEventListener("click", () => updateAdminState(true));
    elements.adminClose?.addEventListener("click", () => updateAdminState(false));
    elements.staffRefresh?.addEventListener("click", loadStaffSubmissions);
    elements.submissionSelector?.addEventListener("change", () => selectFixedSubmission(elements.submissionSelector.value));
    elements.evidenceTabs?.querySelectorAll("[data-evidence-unit]").forEach((button) => {
      button.addEventListener("click", () => activateEvidenceTab(button));
      button.addEventListener("keydown", (event) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        const buttons = Array.from(elements.evidenceTabs.querySelectorAll("[data-evidence-unit]:not(:disabled)"));
        if (!buttons.length) return;
        event.preventDefault();
        const current = Math.max(0, buttons.indexOf(button));
        const target = event.key === "Home" ? buttons[0]
          : event.key === "End" ? buttons[buttons.length - 1]
            : event.key === "ArrowRight" ? buttons[(current + 1) % buttons.length]
              : buttons[(current - 1 + buttons.length) % buttons.length];
        target.focus();
        activateEvidenceTab(target);
      });
    });
    elements.evidencePlay?.addEventListener("click", playFixedEvidence);
    elements.evidenceAudio?.addEventListener("timeupdate", () => {
      const audio = elements.evidenceAudio;
      const ratio = audio.duration ? audio.currentTime / audio.duration : 0;
      if (elements.evidenceAudioProgress) elements.evidenceAudioProgress.style.width = `${Math.round(ratio * 100)}%`;
      setText(elements.evidenceAudioTime, `${formatDuration(audio.currentTime * 1000)} / ${formatDuration((audio.duration || 0) * 1000)}`);
    });
    elements.evidenceAudio?.addEventListener("ended", () => { if (elements.evidencePlay) elements.evidencePlay.innerHTML = '<i class="bi bi-play-fill"></i>'; });
    Object.values(fixedRubricInputs()).forEach((input) => input?.addEventListener("input", updateFixedRubric));
    elements.teacherFeedback?.addEventListener("input", updateFixedRubric);
    elements.publishGradeButton?.addEventListener("click", saveFixedStaffGrade);
    elements.copyReceipt?.addEventListener("click", async () => {
      const code = submission?.receiptId || elements.receipt?.textContent || "";
      try { await navigator.clipboard.writeText(code); toast("Confirmation code copied.", "success"); } catch { toast(`Confirmation code: ${code}`, ""); }
    });
    const handleMicrophoneSelectionChange = () => {
      if (recordingStartPending || analyzing || mediaRecorder?.state === "recording" || preflightRecorder?.state === "recording") {
        toast("Finish the current microphone step before changing devices.", "error");
        return;
      }
      stopMediaStream();
    };
    elements.microphoneSelect?.addEventListener("change", handleMicrophoneSelectionChange);
    elements.preflightMicrophoneSelect?.addEventListener("change", handleMicrophoneSelectionChange);
    elements.questionAudio?.addEventListener("ended", () => {
      const turnId = String(elements.questionAudio?.dataset.turnId || "");
      if (questionPlaybackWatchdog) window.clearTimeout(questionPlaybackWatchdog);
      questionPlaybackWatchdog = 0;
      questionAudioPlaying = false;
      if (!turnId || turnId !== String(currentQuestion()?.turnId || "") || savedCurrentTurn) {
        updateRecordingControls(false);
        return;
      }
      questionHeard = true;
      setDanielState("ready", "Daniel is listening for your response");
      updateRecordingControls(false);
      setText(elements.recordStatus, "Daniel's question is complete. Record one response when you are ready.");
    });
    elements.questionAudio?.addEventListener("error", () => {
      if (!elements.questionAudio?.dataset.turnId) return;
      if (questionPlaybackWatchdog) window.clearTimeout(questionPlaybackWatchdog);
      questionPlaybackWatchdog = 0;
      questionAudioPlaying = false;
      questionAudioLoading = false;
      updateRecordingControls(false);
    });
    window.addEventListener("beforeunload", stopMediaStream);
  }

  bindEvents();
  updateSpeedButtons();
  setHidden(elements.exam, true);
  setHidden(elements.ready, true);
  setHidden(elements.complete, true);
  setHidden(elements.staff, true);
  setHidden(elements.dock, true);
  setDisabled(elements.preflightConfirm, true);
  setEvidenceControlsEnabled(false);
  loadState(false);
  window.setInterval(() => {
    const current = readUser();
    const credential = current?.credential || "";
    if (credential === lastCredential) return;
    const accountChanged = accountScope(current) !== accountScope(user);
    lastCredential = credential;
    resetProtectedSession({ clearClaim: accountChanged });
    user = current;
    if (user) loadState(false);
    else {
      showAccess("You signed out. Sign in again to access the Final Oral Task.", "login");
      openLogin();
    }
  }, 1400);
})();
