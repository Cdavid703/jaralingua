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
    health: "/api/basic-final-oral/health",
    reconcile: "/api/basic-final-oral/reconcile",
    studentAction: "/api/basic-final-oral/student-action",
    pair: "/api/basic-final-oral/pair",
    lease: "/api/basic-final-oral/lease",
    audio: "/api/basic-final-oral/audio",
    speechHealth: "/api/english-basic/pronunciation-health",
    transcribe: "/api/english-basic/pronunciation-assessment"
  });
  const AUDIO_ROOT = "audio/final-oral-task-real/";
  const CLAIM_KEY = "jaralingua_basic_final_oral_student_claim_v2";
  const SUBMISSION_KEY_PREFIX = "jaralingua:basic-final-oral:submission:";
  const GOOGLE_USER_KEY = "jaralingua_google_user";
  const MICROSOFT_USER_KEY = "jaralingua_microsoft_user";
  const LOCAL_USER_KEY = "jaralingua_local_user";
  const AUDIO_QUEUE_DB = "jaralingua-basic-final-oral-audio-v1";
  const AUDIO_QUEUE_STORE = "pendingAudio";
  const AUDIO_QUEUE_DB_VERSION = 2;
  const AUDIO_QUEUE_SCOPE_INDEX = "scope";
  const AUDIO_QUEUE_SCOPE_ATTEMPT_INDEX = "scopeAttempt";
  const AUDIO_QUEUE_EXPIRY_INDEX = "expiresAtMs";
  const AUDIO_QUEUE_TTL_MS = 24 * 60 * 60 * 1000;
  const LEASE_KEY_PREFIX = "jaralingua:basic-final-oral:lease:";
  const DEVICE_KEY = "jaralingua:basic-final-oral:device-id";
  const REQUIRED_TURNS = 7;
  const TRANSCRIPTION_TIMEOUT_MS = 120000;
  const REQUEST_TIMEOUT_MS = 25000;
  const MAX_AUDIO_BYTES = 8 * 1024 * 1024;
  const MICROPHONE_TIMEOUT_MS = 15000;
  const LEASE_TTL_MS = 12000;
  const LEASE_HEARTBEAT_MS = 4000;
  const SERVER_LEASE_RENEW_MS = 120000;
  const SERVER_LEASE_SAFETY_MS = 30000;
  const LEASE_ERROR_CODES = new Set([
    "attempt_lease_required", "attempt_lease_expired", "attempt_in_use",
    "lease_required", "lease_expired", "lease_conflict"
  ]);
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

  const isRecord = (value) => Boolean(value) && typeof value === "object" && !Array.isArray(value);
  const hasText = (value) => typeof value === "string" && value.trim().length > 0;
  const isAttemptContract = (value) => isRecord(value) && hasText(value.attemptId) && Array.isArray(value.assignedQuestions) && isRecord(value.turns || {});
  const hasAssignedQuestionContract = (value) => isRecord(value) && hasText(value.turnId) && hasText(value.variantId)
    && hasText(value.unit) && hasText(value.question) && hasText(value.promptAudioUrl) && Number(value.sequence) >= 1;
  const isScopedAttemptContract = (value) => isAttemptContract(value) && hasText(value.attemptScopeToken)
    && hasText(value.transcriberScopeToken) && hasText(value.transcriberScopeExpiresAt)
    && value.assignedQuestions.length === REQUIRED_TURNS && value.assignedQuestions.every(hasAssignedQuestionContract)
    && new Set(value.assignedQuestions.map((question) => question.turnId)).size === REQUIRED_TURNS
    && Object.keys(value.turns || {}).every((turnId) => value.assignedQuestions.some((question) => question.turnId === turnId));
  const isSecureAttemptContract = (value) => isScopedAttemptContract(value)
    && isRecord(value.lease) && hasText(value.lease.leaseId) && hasText(value.lease.expiresAt);
  const isTurnContract = (value) => isRecord(value) && hasText(value.turnId) && (value.audioAvailable === true || value.verification?.audioVerified === true || value.audio?.verified === true);
  const isSubmissionContract = (value) => isRecord(value) && hasText(value.receiptId) && hasText(value.attemptId)
    && hasText(value.status || value.workflowStatus || "") && hasText(value.submittedAt);
  const workflowOf = (value) => String(value?.workflowStatus || value?.status || "").trim().toLowerCase();
  const isLeaseError = (error) => Number(error?.status) === 409 && LEASE_ERROR_CODES.has(String(error?.data?.error || ""));
  const queueRecordExpiresAt = (record) => Number(record?.expiresAtMs || 0) || (Number(record?.createdAtMs || 0) + AUDIO_QUEUE_TTL_MS);
  const isExpiredQueueRecord = (record, now = Date.now()) => !Number.isFinite(queueRecordExpiresAt(record)) || queueRecordExpiresAt(record) <= now;
  const reviewedAudioEvidenceFor = (selected) => (selected?.turns || []).map((turn) => ({
    turnId: String(turn?.turnId || ""),
    sha256: String(turn?.audio?.sha256 || "").toLowerCase()
  })).filter((item) => item.turnId && /^[0-9a-f]{64}$/.test(item.sha256));
  function buildGradeMutation(action, selected, rubric, teacherFeedback, reason, requestId) {
    const reviewedAudioEvidence = reviewedAudioEvidenceFor(selected);
    return {
      action: action === "draft" ? "draft" : "publish",
      studentId: selected?.studentId,
      receiptId: selected?.receiptId,
      rubric,
      teacherFeedback,
      reviewedAudioEvidence,
      teacherEvidence: isRecord(selected?.teacherEvidence) ? selected.teacherEvidence : {},
      expectedRevision: Number(selected?.gradeRevision || 0),
      requestId,
      reason: reason || ""
    };
  }

  window.__JaraLinguaBasicFinalOralTaskTest = Object.freeze({
    API, REQUIRED_TURNS, TURN_LIMIT_SECONDS, RUBRIC, normalize, questionSegments, studentQuestionResponseFor, responsesForTurn, TURN_REACTIONS, DANIEL_ANSWERS,
    isAttemptContract, isScopedAttemptContract, isSecureAttemptContract, isTurnContract, isSubmissionContract, workflowOf, buildGradeMutation,
    isLeaseError, queueRecordExpiresAt, isExpiredQueueRecord, reviewedAudioEvidenceFor, hasAssignedQuestionContract
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
    systemStrip: byId("examSystemStrip"),
    connectionStatus: byId("connectionStatus"),
    queueStatus: byId("queueStatus"),
    workflowStatus: byId("workflowStatus"),
    tabLeaseAlert: byId("tabLeaseAlert"),
    takeOverSession: byId("takeOverSessionButton"),
    claimPanel: byId("claimStudentPanel"),
    claimInput: byId("claimStudentIdInput"),
    claimPairingCode: byId("claimPairingCodeInput"),
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
    progressTrack: byId("turnProgressTrack"),
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
    securityPipeline: byId("responseSecurityPipeline"),
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
    submissionWorkflow: byId("submissionWorkflow"),
    complete: byId("finalOralCompletionPanel", "completionPanel", "receiptPanel"),
    receipt: byId("finalOralReceipt", "completionReceipt", "receiptCode"),
    copyReceipt: byId("copyReceiptButton"),
    receiptStudent: byId("receiptStudent"),
    receiptSubmittedAt: byId("receiptSubmittedAt"),
    receiptWorkflowStatus: byId("receiptWorkflowStatus"),
    admin: byId("finalOralAdminPanel", "adminPanel"),
    adminStatus: byId("finalOralAdminStatus", "adminStatus", "adminActivationStatus"),
    adminState: byId("adminExamState"),
    adminOpen: byId("openFinalOralButton", "openExamButton", "activateExamButton"),
    adminClose: byId("closeFinalOralButton", "closeExamButton", "deactivateExamButton"),
    adminOpensAt: byId("adminOpensAt"),
    adminClosesAt: byId("adminClosesAt"),
    adminCloseMode: byId("adminCloseMode"),
    adminGraceSeconds: byId("adminGraceSeconds"),
    adminEligibleStudents: byId("adminEligibleStudents"),
    adminSaveWindow: byId("saveExamWindowButton"),
    adminPreviewButton: byId("adminPreviewButton"),
    adminPreviewVariant: byId("adminPreviewVariant"),
    adminPreviewToolbar: byId("adminPreviewToolbar"),
    adminPreviewModelLabel: byId("adminPreviewModelLabel"),
    adminPreviewPrevious: byId("adminPreviewPreviousButton"),
    adminPreviewNext: byId("adminPreviewNextButton"),
    adminPreviewExit: byId("adminPreviewExitButton"),
    adminMonitorRefresh: byId("refreshAdminMonitorButton"),
    adminReconcile: byId("reconcileGradesButton"),
    adminHealthGrid: byId("adminHealthGrid"),
    adminRosterBody: byId("adminRosterBody"),
    adminRosterCaption: byId("adminRosterCaption"),
    adminOperationStatus: byId("adminOperationStatus"),
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
    saveGradeDraftButton: byId("saveGradeDraftButton"),
    publishStatus: byId("publishStatus"),
    gradeHistoryList: byId("gradeHistoryList"),
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
  let adminQuestionBank = {};
  let adminInteractionQuestion = null;
  let adminPreviewMode = false;
  let adminRoster = [];
  let adminHealth = {};
  let currentQueueId = "";
  let pendingAudioCount = 0;
  let volatileAudioCount = 0;
  let pendingTranscriptJobs = new Map();
  let audioQueueDbPromise = null;
  let serverMutationChain = Promise.resolve();
  let preflightVoicePeak = 0;
  let preflightPlaybackConfirmed = false;
  let verifiedMicrophoneId = "";
  let selectedMicrophoneId = "";
  let recorderFailureReason = "";
  let pageClosing = false;
  let online = navigator.onLine !== false;
  let promptPrefetch = null;
  let promptPrefetchTurnId = "";
  let toastTimer = 0;
  let busyReturnFocus = null;
  let inMemorySubmissionId = "";
  let activeLeaseAttemptId = "";
  let leaseReadOnly = false;
  let leaseHeartbeat = 0;
  let leaseChannel = null;
  let serverLeaseId = "";
  let serverLeaseExpiresAt = "";
  let serverLeaseHeartbeat = 0;
  const tabId = createId("bfo-tab");
  const memoryStorage = new Map();
  const memoryAudioQueue = new Map();
  const intentionallyStoppedTracks = new WeakSet();
  const deviceInstanceId = (() => {
    try {
      const saved = sessionStorage.getItem(DEVICE_KEY);
      if (saved) return saved;
    } catch { /* a tab-private memory id is still safer than a shared id */ }
    const created = createId("bfo-device");
    try { sessionStorage.setItem(DEVICE_KEY, created); } catch { /* keep this page's in-memory id */ }
    return created;
  })();

  const setText = (node, value) => { if (node) node.textContent = value; };
  const setHidden = (node, hidden) => { if (node) node.hidden = Boolean(hidden); };
  const setDisabled = (node, disabled) => { if (node) node.disabled = Boolean(disabled); };
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);

  function safeStorageGet(key) {
    try { return localStorage.getItem(key) ?? memoryStorage.get(key) ?? null; } catch { return memoryStorage.get(key) ?? null; }
  }

  function safeStorageSet(key, value) {
    const textValue = String(value);
    memoryStorage.set(key, textValue);
    try { localStorage.setItem(key, textValue); return true; } catch { return false; }
  }

  function safeStorageRemove(key) {
    memoryStorage.delete(key);
    try { localStorage.removeItem(key); } catch { /* private mode fallback */ }
  }

  function contractError(code, data = null) {
    const error = new Error(code);
    error.name = "ContractError";
    error.data = data;
    error.status = 502;
    return error;
  }

  function requireContract(condition, code, data) {
    if (!condition) throw contractError(code, data);
    return data;
  }

  function focusPanel(panel) {
    if (!panel) return;
    const target = panel.querySelector("h1, h2, [role='heading'], button:not(:disabled), [tabindex]");
    if (!target) return;
    if (!target.hasAttribute("tabindex") && !/^(BUTTON|A|INPUT|SELECT|TEXTAREA)$/.test(target.tagName)) target.setAttribute("tabindex", "-1");
    window.requestAnimationFrame(() => target.focus({ preventScroll: true }));
  }

  function pauseAllAudio(except = null) {
    [elements.welcomeAudio, elements.instructionsAudio, elements.questionAudio, elements.reactionAudio, elements.studentAudio, elements.preflightPlayback, elements.evidenceAudio]
      .forEach((audio) => { if (audio && audio !== except && !audio.paused) audio.pause(); });
  }

  function setPipeline(step, state = "active") {
    const order = ["queued", "audio", "transcript"];
    const activeIndex = order.indexOf(step);
    elements.securityPipeline?.querySelectorAll("[data-pipeline-step]").forEach((item) => {
      const index = order.indexOf(item.dataset.pipelineStep);
      item.classList.toggle("is-complete", state === "complete" ? index <= activeIndex : index < activeIndex);
      item.classList.toggle("is-active", state === "active" && index === activeIndex);
      item.classList.toggle("is-error", state === "error" && index === activeIndex);
    });
  }

  function updateConnectionUi(message = "") {
    online = navigator.onLine !== false;
    if (elements.systemStrip) {
      elements.systemStrip.dataset.connection = online ? "online" : "offline";
      elements.systemStrip.dataset.queue = volatileAudioCount > 0 ? "volatile" : pendingAudioCount > 0 ? "pending" : "clear";
    }
    if (elements.connectionStatus) elements.connectionStatus.innerHTML = online
      ? `<i class="bi bi-wifi"></i><strong>Online</strong><span>${escapeHtml(message || "The secure exam server is available.")}</span>`
      : volatileAudioCount > 0
        ? '<i class="bi bi-wifi-off"></i><strong>Offline</strong><span>Temporary memory only: do not close or reload this page.</span>'
        : '<i class="bi bi-wifi-off"></i><strong>Offline</strong><span>Your recording stays protected on this device and will retry automatically.</span>';
    if (elements.queueStatus) elements.queueStatus.innerHTML = volatileAudioCount > 0
      ? `<i class="bi bi-exclamation-triangle-fill"></i><strong>Temporary protection only</strong><span>${volatileAudioCount} recording${volatileAudioCount === 1 ? " is" : "s are"} held in memory. Do not close or reload this page until upload is confirmed.</span>`
      : pendingAudioCount > 0
        ? `<i class="bi bi-device-ssd-fill"></i><strong>Upload pending</strong><span>${pendingAudioCount} protected recording${pendingAudioCount === 1 ? "" : "s"} waiting for server confirmation.</span>`
      : '<i class="bi bi-device-ssd-fill"></i><strong>Protected locally</strong><span>No recording is waiting to upload.</span>';
  }

  function setWorkflowMessage(title, detail, icon = "bi-shield-check") {
    if (elements.workflowStatus) elements.workflowStatus.innerHTML = `<i class="bi ${icon}"></i><strong>${escapeHtml(title)}</strong><span>${escapeHtml(detail)}</span>`;
  }

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

  async function submitStudentClaim() {
    const inlineValue = String(elements.claimInput?.value || "").replace(/\D+/g, "");
    const value = inlineValue || String(window.prompt("Enter the document number registered in Grades:", "") || "").replace(/\D+/g, "");
    if (!value) {
      toast("Enter the document number registered in Grades.", "error");
      return;
    }
    const pairingCode = String(elements.claimPairingCode?.value || "").trim();
    setDisabled(elements.claim, true);
    try {
      if (pairingCode) {
        const result = await request(API.pair, jsonOptions("POST", { studentId: value, pairingCode, requestId: createId("bfo-pair") }), 2);
        requireContract(result.data.ok === true || isRecord(result.data.student), "invalid_pairing_acknowledgement", result.data);
      }
      storeStudentClaim(value);
      if (elements.claimInput) elements.claimInput.value = value;
      await loadState(false);
    } catch (error) {
      if (error.status === 404 && !pairingCode) {
        storeStudentClaim(value);
        return loadState(false);
      }
      showAccess(error.data?.error === "invalid_pairing_code" ? "The temporary pairing code is invalid or expired. Ask the teacher to issue a new one." : "Secure pairing was not confirmed. Check the document and temporary code.", "error");
      setDisabled(elements.claim, false);
    }
  }

  function toast(message, type = "") {
    if (!elements.toast) return;
    if (toastTimer) window.clearTimeout(toastTimer);
    elements.toast.hidden = false;
    elements.toast.textContent = message;
    elements.toast.classList.add("is-visible");
    elements.toast.classList.toggle("success", type === "success");
    elements.toast.classList.toggle("error", type === "error");
    toastTimer = window.setTimeout(() => { elements.toast?.classList.remove("is-visible", "success", "error"); if (elements.toast) elements.toast.hidden = true; toastTimer = 0; }, 5200);
  }

  function setBusy(active, message = "Securing your response…") {
    setHidden(elements.busy, !active);
    setText(elements.busyMessage, message);
    root.setAttribute("aria-busy", active ? "true" : "false");
    root.querySelectorAll("[data-panel]").forEach((panel) => {
      if (active) panel.setAttribute("inert", "");
      else panel.removeAttribute("inert");
    });
    if (active) {
      busyReturnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      window.requestAnimationFrame(() => elements.busy?.focus({ preventScroll: true }));
    } else if (busyReturnFocus?.isConnected && !busyReturnFocus.disabled && !busyReturnFocus.closest("[hidden]")) {
      const target = busyReturnFocus;
      busyReturnFocus = null;
      window.requestAnimationFrame(() => target.focus({ preventScroll: true }));
    } else busyReturnFocus = null;
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
        const rawBody = await response.text();
        if (rawBody.trim()) {
          try { data = JSON.parse(rawBody); }
          catch {
            const invalidJson = contractError("invalid_json_response", { status: response.status });
            invalidJson.status = response.status;
            throw invalidJson;
          }
        }
        if (!isRecord(data)) throw contractError("invalid_response_envelope", data);
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

  function openAudioQueueDb() {
    if (!window.indexedDB) return Promise.reject(new Error("indexeddb_unavailable"));
    if (audioQueueDbPromise) return audioQueueDbPromise;
    audioQueueDbPromise = new Promise((resolve, reject) => {
      const requestOpen = indexedDB.open(AUDIO_QUEUE_DB, AUDIO_QUEUE_DB_VERSION);
      requestOpen.addEventListener("upgradeneeded", () => {
        const db = requestOpen.result;
        const store = db.objectStoreNames.contains(AUDIO_QUEUE_STORE)
          ? requestOpen.transaction.objectStore(AUDIO_QUEUE_STORE)
          : db.createObjectStore(AUDIO_QUEUE_STORE, { keyPath: "queueId" });
        if (!store.indexNames.contains(AUDIO_QUEUE_SCOPE_INDEX)) store.createIndex(AUDIO_QUEUE_SCOPE_INDEX, "scope", { unique: false });
        if (!store.indexNames.contains(AUDIO_QUEUE_SCOPE_ATTEMPT_INDEX)) store.createIndex(AUDIO_QUEUE_SCOPE_ATTEMPT_INDEX, ["scope", "attemptId"], { unique: false });
        if (!store.indexNames.contains(AUDIO_QUEUE_EXPIRY_INDEX)) store.createIndex(AUDIO_QUEUE_EXPIRY_INDEX, "expiresAtMs", { unique: false });
      });
      requestOpen.addEventListener("success", () => {
        const db = requestOpen.result;
        db.addEventListener("versionchange", () => { db.close(); audioQueueDbPromise = null; }, { once: true });
        resolve(db);
      }, { once: true });
      requestOpen.addEventListener("error", () => reject(requestOpen.error || new Error("indexeddb_open_failed")), { once: true });
      requestOpen.addEventListener("blocked", () => reject(new Error("indexeddb_blocked")), { once: true });
    }).catch((error) => { audioQueueDbPromise = null; throw error; });
    return audioQueueDbPromise;
  }

  async function audioQueueOperation(mode, operation) {
    const db = await openAudioQueueDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(AUDIO_QUEUE_STORE, mode);
      const store = transaction.objectStore(AUDIO_QUEUE_STORE);
      let result;
      try { result = operation(store); } catch (error) { reject(error); return; }
      transaction.addEventListener("complete", () => resolve(result?.result), { once: true });
      transaction.addEventListener("abort", () => reject(transaction.error || new Error("indexeddb_transaction_aborted")), { once: true });
      transaction.addEventListener("error", () => reject(transaction.error || new Error("indexeddb_transaction_failed")), { once: true });
    });
  }

  async function purgeExpiredQueuedAudio() {
    const db = await openAudioQueueDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(AUDIO_QUEUE_STORE, "readwrite");
      const store = transaction.objectStore(AUDIO_QUEUE_STORE);
      const index = store.index(AUDIO_QUEUE_EXPIRY_INDEX);
      const range = IDBKeyRange.upperBound(Date.now());
      const cursorRequest = index.openKeyCursor(range);
      cursorRequest.addEventListener("success", () => {
        const cursor = cursorRequest.result;
        if (!cursor) return;
        store.delete(cursor.primaryKey);
        memoryAudioQueue.delete(cursor.primaryKey);
        cursor.continue();
      });
      transaction.addEventListener("complete", () => resolve(), { once: true });
      transaction.addEventListener("abort", () => reject(transaction.error || new Error("indexeddb_expiry_purge_aborted")), { once: true });
      transaction.addEventListener("error", () => reject(transaction.error || new Error("indexeddb_expiry_purge_failed")), { once: true });
    });
  }

  async function readIndexedQueuedAudio(scope, attemptId = "") {
    if (!scope) return [];
    return audioQueueOperation("readonly", (store) => attemptId
      ? store.index(AUDIO_QUEUE_SCOPE_ATTEMPT_INDEX).getAll(IDBKeyRange.only([scope, attemptId]))
      : store.index(AUDIO_QUEUE_SCOPE_INDEX).getAll(scope));
  }

  async function deleteQueuedAudioRecord(queueId) {
    if (!queueId) return;
    memoryAudioQueue.delete(queueId);
    try { await audioQueueOperation("readwrite", (store) => store.delete(queueId)); } catch { /* the in-memory copy is already removed */ }
  }

  async function listQueuedAudio(scope = accountScope(), attemptId = "") {
    if (!scope) return [];
    try {
      const records = await readIndexedQueuedAudio(scope, attemptId);
      const merged = new Map((Array.isArray(records) ? records : [])
        .filter((record) => record?.scope === scope && (!attemptId || record.attemptId === attemptId))
        .map((record) => [record.queueId, record]));
      memoryAudioQueue.forEach((record, queueId) => {
        if (record.scope === scope && (!attemptId || record.attemptId === attemptId)) merged.set(queueId, record);
      });
      const active = [];
      const expired = [];
      merged.forEach((record) => (isExpiredQueueRecord(record) ? expired : active).push(record));
      if (expired.length) await Promise.all(expired.map((record) => deleteQueuedAudioRecord(record.queueId)));
      return active;
    } catch {
      const active = [];
      memoryAudioQueue.forEach((record) => {
        if (record.scope === scope && (!attemptId || record.attemptId === attemptId) && !isExpiredQueueRecord(record)) active.push(record);
      });
      return active;
    }
  }

  async function putQueuedAudio(record) {
    const expiringRecord = Object.assign({}, record, {
      expiresAtMs: Number(record.expiresAtMs || 0) || Date.now() + AUDIO_QUEUE_TTL_MS,
      durable: false
    });
    memoryAudioQueue.set(expiringRecord.queueId, expiringRecord);
    let protectedRecord = expiringRecord;
    try {
      protectedRecord = Object.assign({}, expiringRecord, { durable: true });
      await audioQueueOperation("readwrite", (store) => store.put(protectedRecord));
      memoryAudioQueue.set(protectedRecord.queueId, protectedRecord);
    } catch {
      protectedRecord = expiringRecord;
      toast("This recording is protected only while this page remains open. Do not close or reload until upload is confirmed.", "error");
    }
    await refreshQueuedAudioCount();
    return protectedRecord;
  }

  async function deleteQueuedAudio(queueId) {
    await deleteQueuedAudioRecord(queueId);
    await refreshQueuedAudioCount();
  }

  async function clearQueuedAudio(scope, attemptId = "") {
    if (!scope) return;
    const records = await listQueuedAudio(scope, attemptId);
    await Promise.all(records.map((record) => deleteQueuedAudioRecord(record.queueId)));
    memoryAudioQueue.forEach((record, queueId) => {
      if (record.scope === scope && (!attemptId || record.attemptId === attemptId)) memoryAudioQueue.delete(queueId);
    });
    if (scope === accountScope()) await refreshQueuedAudioCount();
  }

  async function refreshQueuedAudioCount() {
    const records = await listQueuedAudio(accountScope());
    pendingAudioCount = records.length;
    volatileAudioCount = records.filter((item) => item.durable === false).length;
    updateConnectionUi();
    return pendingAudioCount;
  }

  function hasUnsavedAudio() {
    return Boolean(!adminPreviewMode && (mediaRecorder?.state === "recording" || recordingFinalizing || (currentBlob && !savedCurrentTurn) || pendingAudioCount > 0));
  }

  function leaseKey(attemptId = activeLeaseAttemptId) { return `${LEASE_KEY_PREFIX}${attemptId || "none"}`; }

  function applyServerLease(value) {
    const lease = value?.lease || value;
    requireContract(isRecord(lease) && hasText(lease.leaseId) && hasText(lease.expiresAt), "invalid_lease_contract", value);
    serverLeaseId = lease.leaseId;
    serverLeaseExpiresAt = lease.expiresAt;
    if (attempt) attempt.lease = Object.assign({}, attempt.lease || {}, lease);
    return lease;
  }

  function clearServerLease() {
    serverLeaseId = "";
    serverLeaseExpiresAt = "";
    if (attempt?.lease) attempt.lease = Object.assign({}, attempt.lease, { leaseId: "", expiresAt: "", active: false });
  }

  function updateServerLeaseExpiry(value) {
    const expiresAt = String(value?.serverLeaseExpiresAt || value?.lease?.expiresAt || "").trim();
    if (!expiresAt) return;
    serverLeaseExpiresAt = expiresAt;
    if (attempt?.lease) attempt.lease.expiresAt = expiresAt;
  }

  function serverLeaseUsable() {
    const expiresAt = Date.parse(serverLeaseExpiresAt || attempt?.lease?.expiresAt || "");
    return Boolean(serverLeaseId && Number.isFinite(expiresAt) && expiresAt > Date.now() + SERVER_LEASE_SAFETY_MS);
  }

  async function renewServerLease(action = "renew") {
    if (!attempt?.attemptId || !attempt?.attemptScopeToken || adminPreviewMode) return null;
    const result = await request(API.lease, jsonOptions("POST", {
      action,
      attemptId: attempt.attemptId,
      attemptScopeToken: attempt.attemptScopeToken,
      leaseId: serverLeaseId || undefined,
      deviceId: deviceInstanceId,
      requestId: createId(`bfo-lease-${action}`)
    }), 2);
    const lease = applyServerLease(result.data.lease || result.data);
    updateServerLeaseExpiry(result.data);
    leaseReadOnly = false;
    renderLeaseState();
    return lease;
  }

  function scheduleServerLeaseRenewal() {
    if (serverLeaseHeartbeat) window.clearInterval(serverLeaseHeartbeat);
    serverLeaseHeartbeat = window.setInterval(() => {
      renewServerLease("renew").catch((error) => {
        if (isLeaseError(error) || error.status === 401) {
          clearServerLease();
          leaseReadOnly = true;
          renderLeaseState();
          setWorkflowMessage("Session control moved", "The server reports another active device or tab.", "bi-window-stack");
        } else setWorkflowMessage("Lease renewal pending", "Your saved evidence is safe; reconnect before the next mutation.", "bi-wifi-off");
      });
    }, SERVER_LEASE_RENEW_MS);
  }

  function ensureServerLease() {
    if (!attempt?.attemptId || adminPreviewMode) return Promise.resolve(null);
    const lease = attempt.lease;
    if (!serverLeaseId && lease?.active !== false && hasText(lease?.leaseId) && hasText(lease?.expiresAt)) {
      applyServerLease(lease);
    }
    if (serverLeaseUsable()) {
      scheduleServerLeaseRenewal();
      return Promise.resolve(attempt.lease);
    }
    clearServerLease();
    return renewServerLease("acquire").then((nextLease) => { scheduleServerLeaseRenewal(); return nextLease; });
  }

  async function recoverServerLease(error) {
    if (!isLeaseError(error)) return false;
    clearServerLease();
    try {
      await renewServerLease("acquire");
      scheduleServerLeaseRenewal();
      leaseReadOnly = false;
      renderLeaseState();
      return true;
    } catch (leaseError) {
      clearServerLease();
      leaseReadOnly = true;
      renderLeaseState();
      const expiresAt = leaseError?.data?.serverLeaseExpiresAt || error?.data?.serverLeaseExpiresAt;
      setWorkflowMessage("Session control unavailable", expiresAt ? `Another device controls this attempt until ${expiresAt}.` : "Another device or tab controls this attempt.", "bi-window-stack");
      return false;
    }
  }

  function releaseServerLease(attemptId = attempt?.attemptId, attemptScopeToken = attempt?.attemptScopeToken) {
    if (serverLeaseHeartbeat) window.clearInterval(serverLeaseHeartbeat);
    serverLeaseHeartbeat = 0;
    const leaseId = serverLeaseId;
    clearServerLease();
    if (!attemptId || !attemptScopeToken || !leaseId || adminPreviewMode) return;
    const options = jsonOptions("POST", { action: "release", attemptId, attemptScopeToken, leaseId, deviceId: deviceInstanceId, requestId: createId("bfo-lease-release") });
    options.keepalive = true;
    options.timeout = 5000;
    request(API.lease, options, 1).catch(() => {});
  }

  function readLease(attemptId = activeLeaseAttemptId) {
    try { return JSON.parse(safeStorageGet(leaseKey(attemptId)) || "null"); } catch { return null; }
  }

  function renderLeaseState() {
    setHidden(elements.tabLeaseAlert, !leaseReadOnly);
    root.classList.toggle("is-lease-readonly", leaseReadOnly);
    updateRecordingControls(mediaRecorder?.state === "recording");
    if (leaseReadOnly) {
      setDisabled(elements.next, true);
      setDisabled(elements.submit, true);
      setWorkflowMessage("Read-only tab", "Continue in the active tab to prevent duplicate evidence.", "bi-window-stack");
    } else if (savedCurrentTurn && !reactionBusy) setDisabled(elements.next, false);
  }

  function claimAttemptLease(force = false) {
    if (!activeLeaseAttemptId || adminPreviewMode) return true;
    const now = Date.now();
    const existing = readLease();
    if (!force && existing?.tabId && existing.tabId !== tabId && Number(existing.expiresAt || 0) > now) {
      leaseReadOnly = true;
      renderLeaseState();
      return false;
    }
    const lease = { tabId, attemptId: activeLeaseAttemptId, expiresAt: now + LEASE_TTL_MS, updatedAt: new Date(now).toISOString() };
    safeStorageSet(leaseKey(), JSON.stringify(lease));
    leaseChannel?.postMessage?.({ type: "lease", lease });
    leaseReadOnly = false;
    renderLeaseState();
    return true;
  }

  function releaseAttemptLease() {
    if (!activeLeaseAttemptId) { releaseServerLease(); return; }
    releaseServerLease();
    const existing = readLease();
    if (existing?.tabId === tabId) safeStorageRemove(leaseKey());
    leaseChannel?.postMessage?.({ type: "release", tabId, attemptId: activeLeaseAttemptId });
    if (leaseHeartbeat) window.clearInterval(leaseHeartbeat);
    leaseHeartbeat = 0;
    leaseChannel?.close?.();
    leaseChannel = null;
    activeLeaseAttemptId = "";
    leaseReadOnly = false;
    renderLeaseState();
  }

  function activateAttemptLease(attemptId) {
    if (!attemptId || adminPreviewMode) return;
    if (activeLeaseAttemptId && activeLeaseAttemptId !== attemptId) releaseAttemptLease();
    activeLeaseAttemptId = attemptId;
    if ("BroadcastChannel" in window && !leaseChannel) {
      leaseChannel = new window.BroadcastChannel("jaralingua-basic-final-oral");
      leaseChannel.addEventListener("message", (event) => {
        const message = event.data || {};
        if (message.attemptId !== activeLeaseAttemptId && message.lease?.attemptId !== activeLeaseAttemptId) return;
        if (message.type === "takeover" && message.tabId !== tabId) {
          leaseReadOnly = true;
          renderLeaseState();
        } else if (message.type === "release") claimAttemptLease(false);
      });
    }
    claimAttemptLease(false);
    ensureServerLease().catch((error) => {
      if (isLeaseError(error)) {
        clearServerLease();
        leaseReadOnly = true;
        renderLeaseState();
      }
    });
    if (!leaseHeartbeat) leaseHeartbeat = window.setInterval(() => claimAttemptLease(false), LEASE_HEARTBEAT_MS);
  }

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
    pauseAllAudio(audio);
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
    promptPrefetch = null;
    promptPrefetchTurnId = "";
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
        updateAdminPreviewNavigation();
      }
      return;
    }
    reactionBusy = true;
    setDisabled(elements.next, true);
    updateAdminPreviewNavigation();
    setDanielState("speaking", "Daniel is responding");
    setHidden(elements.reaction, false);
    try {
      pauseAllAudio(elements.reactionAudio);
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
      updateAdminPreviewNavigation();
    }
  }

  function showAccess(message, type = "") {
    setHidden(elements.accessShell, false);
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
    const toLocalInput = (value) => {
      if (!value) return "";
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return String(value).slice(0, 16);
      const offset = date.getTimezoneOffset() * 60000;
      return new Date(date.getTime() - offset).toISOString().slice(0, 16);
    };
    if (!document.activeElement?.closest?.(".admin-window-config")) {
      if (elements.adminOpensAt) elements.adminOpensAt.value = toLocalInput(serverState?.opensAt);
      if (elements.adminClosesAt) elements.adminClosesAt.value = toLocalInput(serverState?.closesAt);
      if (elements.adminCloseMode) elements.adminCloseMode.value = serverState?.closeMode === "hard" ? "hard" : "soft";
      if (elements.adminGraceSeconds) elements.adminGraceSeconds.value = String(Number(serverState?.graceSeconds ?? 300));
      if (elements.adminEligibleStudents) elements.adminEligibleStudents.value = Array.isArray(serverState?.eligibleStudentIds) ? serverState.eligibleStudentIds.join(", ") : "";
    }
    const previewReady = ["1", "2", "3", "4", "5", "6"].every((unit) => Array.isArray(adminQuestionBank[unit]) && adminQuestionBank[unit].length)
      && Boolean(adminInteractionQuestion);
    setDisabled(elements.adminPreviewButton, !previewReady);
    setDisabled(elements.adminPreviewVariant, !previewReady);
  }

  function normalizedRosterStatus(item) {
    const status = workflowOf(item) || String(item?.examStatus || item?.attemptStatus || "").toLowerCase() || workflowOf(item?.attempt) || (item?.submission ? workflowOf(item.submission) : "");
    if (status) return status;
    const saved = Number(item?.turnsCompleted ?? item?.savedTurns ?? item?.savedTurnCount ?? item?.turnCount ?? Object.keys(item?.attempt?.turns || {}).length);
    if (item?.submission) return item.submission.status || "submitted";
    if (saved >= REQUIRED_TURNS) return "complete_pending_submit";
    if (saved > 0) return "in_progress";
    return "not_started";
  }

  function rosterStatusLabel(status) {
    return ({ not_started: "Not started", in_progress: "In progress", complete_pending_submit: "Complete · pending submit", received: "Received", verified: "Verified", sync_pending: "Grades sync pending", pending_review: "Pending review", pending_teacher_review: "Pending review", submitted: "Submitted", graded: "Graded", published: "Published", canceled: "Cancelled", cancelled: "Cancelled", error: "Needs attention" })[status] || status.replace(/_/g, " ");
  }

  function renderAdminHealth() {
    const health = adminHealth || {};
    const numberOrNaN = (value) => value === null || value === undefined || value === "" ? Number.NaN : Number(value);
    const storage = isRecord(health.storage) ? health.storage : {};
    const prompts = isRecord(health.promptAudio) ? health.promptAudio : {};
    const sync = isRecord(health.sync) ? health.sync : {};
    const weights = isRecord(health.weights) ? health.weights : {};
    const audit = isRecord(health.audit) ? health.audit : {};
    const speech = isRecord(health.speech) ? health.speech : {};
    const speechQueue = isRecord(speech.queue) ? speech.queue : {};
    const scopeConfigured = speech?.policies?.final_oral?.scope_configured === true || speech?.security?.exam_scope_configured === true;
    const freeBytes = numberOrNaN(storage.freeBytes);
    const freeLabel = Number.isFinite(freeBytes) ? `${(freeBytes / (1024 ** 3)).toFixed(1)} GB free` : "free space unknown";
    const missingFiles = Number(storage.missingFiles || 0);
    const orphanFiles = Number(storage.orphanFiles || 0);
    const availablePrompts = numberOrNaN(prompts.available);
    const expectedPrompts = numberOrNaN(prompts.expected);
    const divergent = Array.isArray(sync.divergentStudentIds) ? sync.divergentStudentIds.length : 0;
    const pendingOutbox = Number(sync.pendingOutbox || 0);
    const queueDepth = Number(speechQueue.depth || 0);
    const queueMaximum = Number(speechQueue.max_depth ?? speechQueue.maxDepth ?? 0);
    const queueCapacity = Number(speechQueue.capacity || 0);
    const queueActive = Number(speechQueue.active || 0);
    const speechSaturated = (queueMaximum > 0 && queueDepth >= queueMaximum) || (queueCapacity > 0 && queueActive >= queueCapacity && queueDepth > 0);
    const actualWeight = numberOrNaN(weights.actualFinalOral);
    const totalWeight = numberOrNaN(weights.gradebookTotal);
    const weightOk = actualWeight === Number(weights.expectedFinalOral ?? 20) && totalWeight === 100;
    const values = {
      api: { state: health.apiError || health.ok === false ? "error" : Array.isArray(health.warnings) && health.warnings.length ? "warning" : "ok", label: health.apiError ? "Exam health unavailable" : health.ok === false ? `${health.warnings?.length || 0} blocking warning(s)` : `${health.warnings?.length || 0} warning(s)` },
      storage: { state: storage.writable !== true || missingFiles > 0 ? "error" : !Number.isFinite(freeBytes) || freeBytes < 500 * 1024 * 1024 || orphanFiles > 0 ? "warning" : "ok", label: `${storage.writable === true ? "Writable" : "Not writable"} · ${missingFiles} missing · ${orphanFiles} orphan · ${freeLabel}` },
      prompts: { state: expectedPrompts > 0 && availablePrompts === expectedPrompts ? "ok" : "error", label: Number.isFinite(expectedPrompts) ? `${availablePrompts} / ${expectedPrompts} protected clips available` : "Prompt inventory unavailable" },
      speech: { state: !speech.ok || !scopeConfigured || speechSaturated ? "error" : queueDepth > 0 ? "warning" : "ok", label: !speech.ok ? "Speech service unavailable" : !scopeConfigured ? "Final-exam scope is not configured" : speechSaturated ? `Queue saturated · ${queueDepth} / ${queueMaximum}` : `Queue ${queueDepth} / ${queueMaximum || "—"} · ${queueActive} active` },
      grades: { state: divergent > 0 ? "error" : pendingOutbox > 0 ? "warning" : "ok", label: `${divergent} divergent · ${pendingOutbox} sync pending` },
      weights: { state: weightOk ? "ok" : "error", label: `${Number.isFinite(actualWeight) ? actualWeight : "—"}% oral · ${Number.isFinite(totalWeight) ? totalWeight : "—"}% total` },
      audit: { state: audit.pathConfigured === false || audit.writable !== true ? "error" : "ok", label: `${audit.writable === true ? "Writable" : "Not writable"} · ${Number(audit.bytes || 0).toLocaleString()} bytes` }
    };
    elements.adminHealthGrid?.querySelectorAll("[data-health]").forEach((card) => {
      const descriptor = values[card.dataset.health] || { state: "warning", label: "Health data unavailable" };
      card.dataset.state = descriptor.state;
      setText(card.querySelector("small"), descriptor.label);
    });
  }

  function renderAdminMonitor() {
    renderAdminHealth();
    if (!elements.adminRosterBody) return;
    elements.adminRosterBody.innerHTML = adminRoster.length ? adminRoster.map((item) => {
      const student = item.student || item;
      const studentId = String(student.id || student.studentId || item.studentId || "");
      const name = student.fullName || student.name || item.studentName || "Course student";
      const email = student.email || item.email || "No email linked";
      const status = normalizedRosterStatus(item);
      const turns = Number(item.turnsCompleted ?? item.savedTurns ?? item.savedTurnCount ?? item.turnCount ?? Object.keys(item.attempt?.turns || {}).length ?? 0);
      const audioIssues = Array.isArray(item.audioIssues) ? item.audioIssues : item.audioIssue ? [item.audioIssue] : [];
      const evidence = audioIssues.length ? `${audioIssues.length} audio issue${audioIssues.length === 1 ? "" : "s"}` : `${Math.min(REQUIRED_TURNS, turns)} / ${REQUIRED_TURNS} audios`;
      const lastActivity = item.lastActivityAt || item.updatedAt || item.attempt?.updatedAt || "—";
      return `<tr data-student-id="${escapeHtml(studentId)}"><td><strong>${escapeHtml(name)}</strong><small>${escapeHtml(studentId || email)}</small></td><td><span class="admin-roster-status" data-state="${escapeHtml(status)}">${escapeHtml(rosterStatusLabel(status))}</span></td><td>${escapeHtml(evidence)}</td><td>${escapeHtml(lastActivity)}</td><td><div class="admin-roster-actions"><button type="button" data-student-action="issue_pairing" ${studentId ? "" : "disabled"}>Issue PIN</button><button type="button" data-student-action="reopen" ${studentId ? "" : "disabled"}>Reopen</button><button type="button" data-student-action="extend" ${studentId ? "" : "disabled"}>Extend</button><button type="button" data-student-action="cancel" ${studentId ? "" : "disabled"}>Cancel</button><button type="button" data-student-action="reset" ${studentId ? "" : "disabled"}>Reset</button></div></td></tr>`;
    }).join("") : '<tr><td colspan="5">No roster monitor was returned. Legacy submission review remains available below.</td></tr>';
    setText(elements.adminRosterCaption, `${adminRoster.length} course record${adminRoster.length === 1 ? "" : "s"} · live delivery states`);
  }

  async function loadAdminHealth() {
    if (!(role === "admin" || role === "teacher")) return;
    const [examResult, speechResult] = await Promise.allSettled([
      request(API.health, { method: "GET" }, 1),
      request(API.speechHealth, { method: "GET" }, 1)
    ]);
    let examHealth = {};
    if (examResult.status === "fulfilled" && isRecord(examResult.value.data.health || examResult.value.data)) {
      examHealth = examResult.value.data.health || examResult.value.data;
      if (Array.isArray(examResult.value.data.roster)) adminRoster = examResult.value.data.roster;
    } else {
      examHealth = { apiError: true, ok: false, warnings: ["health_endpoint_unavailable"] };
      if (examResult.status !== "rejected" || examResult.reason?.status !== 404) setText(elements.adminOperationStatus, "Detailed exam health could not be refreshed. No opening decision should rely on this screen until the server responds.");
    }
    adminHealth = Object.assign({}, examHealth, {
      speech: speechResult.status === "fulfilled" && isRecord(speechResult.value.data)
        ? speechResult.value.data
        : { ok: false, error: speechResult.reason?.data?.error || "speech_health_unavailable" }
    });
    renderAdminMonitor();
  }

  async function reconcileGrades() {
    if (!(role === "admin" || role === "teacher")) return;
    const reason = String(window.prompt("Reason for verifying Final Oral Task delivery against Grades:", "Administrative integrity check") || "").trim();
    if (!reason) return;
    setDisabled(elements.adminReconcile, true);
    setText(elements.adminOperationStatus, "Verifying receipts and Grades synchronization.");
    try {
      const result = await request(API.reconcile, jsonOptions("POST", { reason, requestId: createId("bfo-reconcile"), recoverComplete: true }), 2);
      requireContract(result.data.ok === true || isRecord(result.data.summary) || Array.isArray(result.data.reconciled), "invalid_reconcile_contract", result.data);
      setText(elements.adminOperationStatus, result.data.message || `Verification complete · ${Number(result.data.summary?.repaired || result.data.repaired || 0)} record(s) repaired.`);
      toast("Final Oral Task and Grades synchronization verified.", "success");
      await loadState(false);
    } catch (error) {
      setText(elements.adminOperationStatus, error.status === 404 ? "This server is still using the legacy reconciliation process. Refresh submissions and contact technical support if a receipt is missing." : "The verification did not complete. No grade or submission was changed without confirmation.");
    } finally { setDisabled(elements.adminReconcile, false); }
  }

  async function runStudentAction(button) {
    const row = button?.closest("[data-student-id]");
    const studentId = row?.dataset.studentId || "";
    const action = button?.dataset.studentAction || "";
    if (!studentId || !["reopen", "extend", "cancel", "reset", "issue_pairing"].includes(action)) return;
    const destructive = action === "cancel" || action === "reset";
    if (destructive && !window.confirm(`${action === "reset" ? "Reset" : "Cancel"} this student's official oral attempt? Existing evidence will only be changed according to the server recovery policy.`)) return;
    const reason = String(window.prompt(`Required reason to ${action.replace("_", " ")} this student's exam:`, "") || "").trim();
    if (!reason) return;
    const payload = { studentId, action, reason, requestId: createId(`bfo-${action}`) };
    if (action === "extend") {
      const extensionUntil = String(window.prompt("Extension end (YYYY-MM-DD HH:MM, Bogotá time):", "") || "").trim();
      if (!extensionUntil) return;
      payload.until = extensionUntil;
    }
    setDisabled(button, true);
    setText(elements.adminOperationStatus, `Applying ${action} for student ${studentId}.`);
    try {
      const result = await request(API.studentAction, jsonOptions("PUT", payload), 2);
      requireContract(result.data.ok === true || isRecord(result.data.student) || isRecord(result.data.result), "invalid_student_action_contract", result.data);
      const pairingCode = result.data.pairingCode || result.data.result?.pairingCode || "";
      setText(elements.adminOperationStatus, pairingCode ? `Temporary pairing code for ${studentId}: ${pairingCode}. Share it privately; it expires automatically.` : result.data.message || `${action} completed for student ${studentId}.`);
      toast("Administrative recovery action confirmed by the server.", "success");
      await loadState(false);
    } catch (error) {
      setText(elements.adminOperationStatus, error.status === 404 ? "Individual recovery is not available on this server version yet." : "The action was not confirmed and was not shown as completed.");
      setDisabled(button, false);
    }
  }

  function buildAdminPreviewQuestions() {
    const variantIndex = Math.max(0, Math.min(2, Number(elements.adminPreviewVariant?.value || 0)));
    const questions = ["1", "2", "3", "4", "5", "6"].map((unit, index) => {
      const variants = Array.isArray(adminQuestionBank[unit]) ? adminQuestionBank[unit] : [];
      const selected = variants[variantIndex] || variants[0];
      return selected ? Object.assign({}, selected, { turnId: `unit-${unit}`, sequence: index + 1 }) : null;
    }).filter(Boolean);
    if (adminInteractionQuestion) questions.push(Object.assign({}, adminInteractionQuestion, { turnId: "interaction", sequence: 7 }));
    return questions;
  }

  function updateAdminPreviewNavigation() {
    if (!adminPreviewMode) return;
    const busy = recordingStartPending || recordingFinalizing || analyzing || reactionBusy || mediaRecorder?.state === "recording";
    setDisabled(elements.adminPreviewPrevious, busy || currentIndex <= 0);
    setDisabled(elements.adminPreviewNext, busy);
    setDisabled(elements.adminPreviewExit, busy);
    if (elements.adminPreviewNext) {
      elements.adminPreviewNext.innerHTML = currentIndex >= assignedQuestions.length - 1
        ? 'Finish preview <i class="bi bi-check2-circle"></i>'
        : 'Next question <i class="bi bi-arrow-right"></i>';
    }
  }

  function enableOfficialStartIfAllowed() {
    if (role !== "student" || submission) return;
    if (attempt) setDisabled(elements.resume || elements.start, false);
    else if (serverState?.isOpen) setDisabled(elements.start, false);
  }

  function startAdminPreview() {
    if (!(role === "admin" || role === "teacher") || adminPreviewMode) return;
    const questions = buildAdminPreviewQuestions();
    if (questions.length !== REQUIRED_TURNS) {
      toast("The administrator question bank is still loading. Check availability and try again.", "error");
      return;
    }
    sessionGeneration += 1;
    staffEvidenceLoadToken += 1;
    setBusy(false);
    elements.evidenceAudio?.pause();
    elements.staffList?.querySelectorAll("audio").forEach((audio) => audio.pause());
    adminPreviewMode = true;
    attempt = {
      attemptId: "ADMIN-PREVIEW",
      revision: 0,
      student: { fullName: `${user?.name || "Administrator"} · preview`, id: "NOT SAVED" },
      assignedQuestions: questions,
      turns: {}
    };
    assignedQuestions = questions;
    currentIndex = 0;
    revision = 0;
    savedCurrentTurn = false;
    if (elements.submitConfirmation) elements.submitConfirmation.checked = false;
    setText(elements.adminPreviewModelLabel, `Model ${String.fromCharCode(65 + Number(elements.adminPreviewVariant?.value || 0))} · nothing is saved`);
    setHidden(elements.accessShell, true);
    setHidden(elements.admin, true);
    setHidden(elements.staff, true);
    setHidden(elements.onboarding, true);
    setHidden(elements.ready, true);
    setHidden(elements.complete, true);
    setHidden(elements.adminPreviewToolbar, false);
    fillIdentity(attempt.student);
    renderCurrentTurn();
    toast("Administrator preview opened. No attempt, grade, or submission will be created.", "success");
  }

  function moveAdminPreview(direction) {
    if (!adminPreviewMode || recordingStartPending || recordingFinalizing || analyzing || reactionBusy || mediaRecorder?.state === "recording") return;
    if (direction < 0) {
      currentIndex = Math.max(0, currentIndex - 1);
      renderCurrentTurn();
      return;
    }
    if (currentIndex >= assignedQuestions.length - 1) {
      finishAdminPreview(true);
      return;
    }
    currentIndex += 1;
    renderCurrentTurn();
  }

  function finishAdminPreview(completed = false) {
    if (!adminPreviewMode) return;
    resetProtectedSession({ clearClaim: false });
    showAccess("Restoring the administrator control room.", "staff");
    loadState(false);
    toast(completed ? "Administrator rehearsal completed. Nothing was saved or graded." : "Administrator preview closed. Nothing was saved or graded.", "success");
  }

  function renderSubmission(result) {
    const nextSubmission = result || submission;
    requireContract(isSubmissionContract(nextSubmission), "invalid_submission_contract", nextSubmission);
    submission = nextSubmission;
    setHidden(elements.onboarding, true);
    setHidden(elements.exam, true);
    setHidden(elements.ready, true);
    setHidden(elements.complete, false);
    const workflow = workflowOf(submission);
    const gradesSync = String(submission?.syncStatus || submission?.gradesSyncStatus || submission?.gradesStatus || "").toLowerCase();
    const status = workflow === "published" && Number.isFinite(Number(submission.grade)) ? `Graded: ${Number(submission.grade).toFixed(2)} / 5.0`
      : workflow === "sync_pending" || gradesSync === "pending" ? "Submitted — Grades synchronization pending"
        : "Submitted — pending teacher review";
    setText(elements.receipt, `Receipt ${submission?.receiptId || "—"} · ${status}`);
    if (elements.receipt?.id === "receiptCode") setText(elements.receipt, submission?.receiptId || "—");
    setText(elements.receiptStudent, submission?.studentName || attempt?.student?.fullName || user?.name || "—");
    setText(elements.receiptSubmittedAt, submission?.submittedAt || "—");
    setText(elements.submissionStatus, status);
    if (elements.receiptWorkflowStatus) elements.receiptWorkflowStatus.innerHTML = gradesSync === "synced" || ["pending_review", "pending_teacher_review", "published"].includes(workflow)
      ? '<i class="bi bi-journal-check"></i> Visible in Grades'
      : '<i class="bi bi-arrow-repeat"></i> Safely received · Grades sync pending';
    renderSubmissionWorkflow(submission);
    stopExamClock();
    clearQueuedAudio(accountScope(), submission?.attemptId || attempt?.attemptId || "").catch(() => {});
    releaseAttemptLease();
    focusPanel(elements.complete);
  }

  function hydrateAttempt(nextAttempt, enterExam = true) {
    requireContract(isScopedAttemptContract(nextAttempt), "invalid_attempt_contract", nextAttempt);
    const attemptExpiry = Date.parse(nextAttempt.expiresAt || "");
    if (Number.isFinite(attemptExpiry) && attemptExpiry <= Date.now()) {
      releaseAttemptLease();
      clearQueuedAudio(accountScope(), nextAttempt.attemptId).catch(() => {});
      showAccess("This official attempt has expired. Its temporary device audio was removed; ask the teacher about the recorded server evidence.", "closed");
      setHidden(elements.exam, true);
      setHidden(elements.onboarding, true);
      return;
    }
    attempt = nextAttempt;
    assignedQuestions = Array.isArray(attempt?.assignedQuestions) ? attempt.assignedQuestions.slice().sort((a, b) => Number(a.sequence) - Number(b.sequence)) : [];
    revision = Number(attempt?.revision || 0);
    if (attempt.lease?.leaseId && attempt.lease?.expiresAt) applyServerLease(attempt.lease);
    else clearServerLease();
    activateAttemptLease(attempt.attemptId);
    fillIdentity(attempt?.student);
    const saved = attempt?.turns && typeof attempt.turns === "object" ? attempt.turns : {};
    currentIndex = assignedQuestions.findIndex((question) => !saved[question.turnId]);
    if (currentIndex < 0) currentIndex = assignedQuestions.length;
    const resumeControl = elements.resume || elements.start;
    setHidden(resumeControl, currentIndex >= assignedQuestions.length);
    setDisabled(resumeControl, false);
    if (!elements.resume && elements.start && currentIndex < assignedQuestions.length) elements.start.innerHTML = '<i class="bi bi-arrow-repeat"></i> Resume official interview';
    else setHidden(elements.start, true);
    if (currentIndex >= assignedQuestions.length && assignedQuestions.length === REQUIRED_TURNS) renderReadyToSubmit();
    else if (enterExam) renderCurrentTurn();
    else {
      setHidden(elements.exam, true);
      setHidden(elements.onboarding, false);
      showAccess(`${Object.keys(saved).length} of ${REQUIRED_TURNS} responses are already saved. You may resume now; the microphone will be requested again when you answer.`, "resume");
    }
    refreshQueuedAudioCount().then(() => drainAudioQueue()).catch(() => {});
  }

  function resetProtectedSession({ clearClaim = true, purgeAudio = false, audioScope = accountScope() } = {}) {
    if (purgeAudio && audioScope) clearQueuedAudio(audioScope).catch(() => {});
    sessionGeneration += 1;
    stateLoadGeneration += 1;
    releaseAttemptLease();
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
    adminQuestionBank = {};
    adminInteractionQuestion = null;
    adminPreviewMode = false;
    adminRoster = [];
    adminHealth = {};
    currentQueueId = "";
    pendingAudioCount = 0;
    volatileAudioCount = 0;
    pendingTranscriptJobs = new Map();
    preflightVoicePeak = 0;
    preflightPlaybackConfirmed = false;
    verifiedMicrophoneId = "";
    selectedMicrophoneId = "";
    recorderFailureReason = "";
    if (clearClaim) clearStudentClaim();
    if (elements.claimInput) elements.claimInput.value = "";
    if (elements.claimPairingCode) elements.claimPairingCode.value = "";
    if (elements.studentName) elements.studentName.value = "";
    if (elements.studentId) elements.studentId.value = "";
    if (elements.preflightPlayback) { elements.preflightPlayback.removeAttribute("src"); elements.preflightPlayback.hidden = true; }
    if (elements.preflightConfirm?.type === "checkbox") elements.preflightConfirm.checked = false;
    if (elements.submitConfirmation) elements.submitConfirmation.checked = false;
    setHidden(elements.account, true);
    setHidden(elements.accessShell, false);
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
    setHidden(elements.adminPreviewToolbar, true);
    setHidden(elements.transcript, true);
    setDisabled(elements.start, true);
    setDisabled(elements.resume, true);
    setDisabled(elements.preflightConfirm, true);
    setDisabled(elements.submit, true);
    setDisabled(elements.submitConfirmation, false);
    setEvidenceControlsEnabled(false);
    setPipeline("queued", "active");
    refreshQueuedAudioCount().catch(() => {});
  }

  async function loadState(allowClaimPrompt = false) {
    const previousUser = user;
    const activeUser = readUser();
    user = activeUser;
    if (!user) {
      resetProtectedSession({ clearClaim: true, purgeAudio: true, audioScope: accountScope(previousUser) });
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
      requireContract(hasText(payload.role || "student") && isRecord(payload.state || {}), "invalid_state_contract", payload);
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
      if (role === "admin" || role === "teacher") {
        adminQuestionBank = payload.questionBank && typeof payload.questionBank === "object" ? payload.questionBank : {};
        adminInteractionQuestion = payload.interactionQuestion || null;
        adminRoster = Array.isArray(payload.roster) ? payload.roster : [];
        adminHealth = isRecord(payload.health) ? payload.health : {};
      } else {
        adminQuestionBank = {};
        adminInteractionQuestion = null;
      }
      renderAdminState();
      if (role === "admin" || role === "teacher") {
        showAccess("Staff access confirmed. Use the administration and review panels below.", "staff");
        setHidden(elements.onboarding, true);
        setHidden(elements.staff, false);
        renderAdminMonitor();
        loadAdminHealth().catch(() => {});
        await loadStaffSubmissions();
        return;
      }
      if (!payload.student) {
        if (allowClaimPrompt && payload.claimAvailable && payload.pairingRequired !== true && promptStudentClaim()) return loadState(false);
        showAccess("This account is not linked to a Basic English student record. Enter the registered document and, when required, the temporary code issued by the teacher.", "claim");
        setHidden(elements.claimPanel, false);
        setHidden(elements.claim, false);
        elements.claimInput?.focus();
        return;
      }
      setHidden(elements.claimPanel, true);
      setHidden(elements.claim, true);
      fillIdentity(payload.student);
      if (payload.submission) {
        requireContract(isSubmissionContract(payload.submission), "invalid_submission_contract", payload.submission);
        return renderSubmission(payload.submission);
      }
      if (payload.attempt) {
        requireContract(isScopedAttemptContract(payload.attempt), "invalid_attempt_contract", payload.attempt);
        setHidden(elements.access, true);
        setHidden(elements.onboarding, false);
        hydrateAttempt(payload.attempt, false);
        return;
      }
      setHidden(elements.access, false);
      setHidden(elements.onboarding, false);
      if (payload.canStart) {
        showAccess("Access confirmed. You may begin the official exam now. The microphone test is available but no longer blocks the start button.", "success");
        if (elements.start) elements.start.innerHTML = '<i class="bi bi-play-fill"></i> Begin official interview';
        setHidden(elements.start, false);
        setDisabled(elements.start, false);
      } else {
        showAccess("The Final Oral Task is closed. The teacher must activate it before you can start a new attempt.", "closed");
        setDisabled(elements.start, true);
      }
    } catch (error) {
      if (loadGeneration !== stateLoadGeneration || readUser()?.credential !== requestedCredential) return;
      showAccess(error.status === 401 ? "Your session expired. Please sign in again." : error.name === "ContractError" ? "The server answered, but its exam confirmation was incomplete. Nothing was marked as saved; refresh and contact the teacher if this continues." : "The exam server did not answer. Reload the page and try again.", "error");
      if (error.status === 401) openLogin();
    }
  }

  async function startAttempt() {
    if (attemptRequestBusy) return;
    if (!online) {
      setText(elements.preflightStatus, "Reconnect to the internet before starting the official attempt.");
      return;
    }
    if (!preflightPassed) setText(elements.preflightStatus, "Microphone test skipped. The browser will request microphone access when you answer.");
    const requestSession = sessionGeneration;
    const requestCredential = user?.credential || "";
    attemptRequestBusy = true;
    setDisabled(elements.start, true);
    try {
      const result = await request(API.start, jsonOptions("POST", { deviceId: deviceInstanceId }), 2);
      if (requestSession !== sessionGeneration || user?.credential !== requestCredential) return;
      requireContract(isSecureAttemptContract(result.data.attempt), "invalid_start_contract", result.data);
      setHidden(elements.access, true);
      setHidden(elements.onboarding, true);
      setHidden(elements.exam, false);
      hydrateAttempt(result.data.attempt);
      toast(result.data.resumed ? "Your saved attempt was restored." : "Your official attempt has started.", "success");
    } catch (error) {
      if (requestSession !== sessionGeneration || user?.credential !== requestCredential) return;
      if (error.status === 409 && error.data?.submission) return renderSubmission(error.data.submission);
      if (error.status === 409 && error.data?.error === "attempt_in_use") {
        setText(elements.preflightStatus, `This official attempt is active in another tab or device${error.data.leaseExpiresAt ? ` until ${error.data.leaseExpiresAt}` : ""}. Return there or wait for the secure lease to expire.`);
        setDisabled(elements.start, true);
        return;
      }
      if (error.status === 403 && error.data?.error === "student_not_authorized") {
        showAccess("Enter the registered document and the temporary pairing code issued by the teacher.", "claim");
        setHidden(elements.claimPanel, false);
        setHidden(elements.claim, false);
        elements.claimInput?.focus();
        return;
      }
      const examClosed = error.data?.error === "exam_closed";
      setText(elements.preflightStatus, examClosed ? "The exam was closed before the attempt started." : "The attempt could not start. Your microphone check remains valid; try again.");
      setDisabled(elements.start, examClosed);
    } finally {
      if (requestSession === sessionGeneration) attemptRequestBusy = false;
    }
  }

  async function resumeAttempt() {
    if (attemptRequestBusy) return;
    if (!preflightPassed) setText(elements.preflightStatus, "Microphone test skipped. The browser will request microphone access when you answer.");
    const requestSession = sessionGeneration;
    const requestCredential = user?.credential || "";
    attemptRequestBusy = true;
    setDisabled(elements.resume || elements.start, true);
    try {
      const result = await request(`${API.attempt}?attemptId=${encodeURIComponent(attempt?.attemptId || "")}`, { method: "GET" }, 2);
      if (requestSession !== sessionGeneration || user?.credential !== requestCredential) return;
      if (result.data.submission) {
        requireContract(isSubmissionContract(result.data.submission), "invalid_submission_contract", result.data);
        return renderSubmission(result.data.submission);
      }
      requireContract(isScopedAttemptContract(result.data.attempt), "invalid_resume_contract", result.data);
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
      const progressNode = elements.progressTrack || elements.progress;
      progressNode.setAttribute("aria-valuenow", String(currentIndex));
      progressNode.setAttribute("aria-valuetext", `${currentIndex} of ${REQUIRED_TURNS} responses saved`);
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
    savedCurrentTurn = adminPreviewMode ? false : Boolean(attempt?.turns?.[question.turnId]);
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
    setText(elements.recordStatus, adminPreviewMode ? "Administrator rehearsal: listen to Daniel, then record if you want to test the complete interaction." : "Listen to Daniel before recording your response.");
    setText(elements.recordHelp, adminPreviewMode
      ? "Preview only. You may rehearse with the microphone or use the administrator controls to browse without recording."
      : question.unit === "interaction" ? "Record both questions in one response. No answer model or hint is shown during the exam." : "No answer model, vocabulary hint, or correction is shown during the exam.");
    setText(elements.transcript, adminPreviewMode ? "Your private preview transcript will appear here after recording." : "Your transcript is stored privately for teacher review after the recording is saved.");
    setHidden(elements.transcript, !adminPreviewMode);
    setText(elements.saveStatus, adminPreviewMode ? "ADMIN PREVIEW · nothing is saved" : savedCurrentTurn ? "Response already saved." : "Not saved yet.");
    setText(elements.timer, `0:00 / 0:${String(TURN_LIMIT_SECONDS[question.unit] || 28).padStart(2, "0")}`);
    setText(elements.dockLabel, `Response ${currentIndex + 1} of ${REQUIRED_TURNS}`);
    setText(elements.dockTimer, "0:00");
    setHidden(elements.dock, false);
    setText(elements.answerState, "Ready");
    if (elements.answerState) elements.answerState.className = "answer-state ready";
    setHidden(elements.answerCaptured, true);
    if (elements.answerCaptured) {
      elements.answerCaptured.innerHTML = adminPreviewMode
        ? '<i class="bi bi-eye-fill"></i><div><strong>Administrator rehearsal captured for this preview</strong><p>The transcript may be processed temporarily, but the response never enters Grades or student submissions.</p></div>'
        : '<i class="bi bi-check2-circle"></i><div><strong>Answer captured securely</strong><p>Your response was saved. No score or feedback is shown during the official exam.</p></div>';
    }
    setDisabled(elements.questionPlay, savedCurrentTurn);
    setDisabled(elements.mic, true);
    setDisabled(elements.dockMic, true);
    setDisabled(elements.stop, true);
    setDisabled(elements.dockStop, true);
    setHidden(elements.next, true);
    setDanielState("ready", "Daniel is ready");
    setText(elements.sessionCode, adminPreviewMode ? "ADMIN PREVIEW · NOT SAVED" : attempt?.attemptId || "Pending");
    setHidden(elements.adminPreviewToolbar, !adminPreviewMode);
    updateAdminPreviewNavigation();
    if (!adminPreviewMode) {
      const savedTurn = attempt?.turns?.[question.turnId];
      const transcriptState = String(savedTurn?.transcriptStatus || (savedTurn?.transcript ? "complete" : "pending"));
      setPipeline(savedCurrentTurn ? (transcriptState === "complete" ? "transcript" : "audio") : "queued", savedCurrentTurn && transcriptState === "complete" ? "complete" : "active");
      setWorkflowMessage(savedCurrentTurn ? "Audio saved" : "Ready to record", savedCurrentTurn ? (transcriptState === "complete" ? "Audio and transcript are secured." : "Transcript is pending and does not block your exam.") : "The recording will be protected locally, then verified by the server.");
      activateAttemptLease(attempt?.attemptId);
    }
    prefetchCurrentQuestionAudio();
    startExamClock();
    focusPanel(elements.exam);
  }

  function prefetchCurrentQuestionAudio() {
    const question = currentQuestion();
    const source = promptAudioUrl(question);
    const turnId = String(question?.turnId || "");
    if (!source || !turnId || !(source.startsWith("/api/") || source.includes("/api/basic-final-oral/"))) {
      promptPrefetch = null;
      promptPrefetchTurnId = "";
      return;
    }
    promptPrefetchTurnId = turnId;
    promptPrefetch = fetchProtectedAudio(source).catch((error) => {
      if (promptPrefetchTurnId === turnId) promptPrefetch = null;
      throw error;
    });
  }

  async function playCurrentQuestion() {
    const question = currentQuestion();
    if (!question || analyzing || reactionBusy || savedCurrentTurn || questionAudioLoading || questionAudioPlaying) return;
    const turnId = String(question.turnId || "");
    const playbackToken = ++questionPlaybackToken;
    questionAudioLoading = true;
    try {
      pauseAllAudio(elements.questionAudio);
      questionHeard = false;
      updateRecordingControls(false);
      setDanielState("speaking", playbackSpeed === .75 ? "Daniel is speaking slowly" : "Daniel is speaking");
      const source = promptAudioUrl(question);
      if (!source) throw new Error("prompt_audio_unavailable");
      const protectedAudio = source.startsWith("/api/") || source.includes("/api/basic-final-oral/");
      const alreadyLoaded = elements.questionAudio.dataset.turnId === turnId && Boolean(elements.questionAudio.src);
      if (protectedAudio && !alreadyLoaded) {
        const blob = promptPrefetchTurnId === turnId && promptPrefetch ? await promptPrefetch : await fetchProtectedAudio(source);
        if (playbackToken !== questionPlaybackToken || String(currentQuestion()?.turnId || "") !== turnId) return;
        if (promptObjectUrl) URL.revokeObjectURL(promptObjectUrl);
        promptObjectUrl = URL.createObjectURL(blob);
        elements.questionAudio.src = promptObjectUrl;
      } else if (!alreadyLoaded) {
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
    } catch (error) {
      if (playbackToken !== questionPlaybackToken) return;
      if (questionPlaybackWatchdog) window.clearTimeout(questionPlaybackWatchdog);
      questionPlaybackWatchdog = 0;
      questionAudioPlaying = false;
      const gestureRetry = error?.name === "NotAllowedError" && Boolean(elements.questionAudio?.src);
      setDanielState("ready", gestureRetry ? "Daniel's audio is ready" : "Daniel's audio could not play");
      setText(elements.recordStatus, gestureRetry ? "The audio is loaded. Tap Play Daniel once more to start it on this device." : "The question audio could not play. Check the connection and press Play Daniel again.");
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
    if (!navigator.mediaDevices?.enumerateDevices) return [];
    const devices = (await navigator.mediaDevices.enumerateDevices()).filter((device) => device.kind === "audioinput");
    const requested = select?.value || selectedMicrophoneId || verifiedMicrophoneId;
    [elements.preflightMicrophoneSelect, elements.microphoneSelect].filter(Boolean).forEach((target) => {
      const ownSelected = target.value || requested;
      target.innerHTML = devices.length ? devices.map((device, index) => `<option value="${escapeHtml(device.deviceId)}">${escapeHtml(device.label || `Microphone ${index + 1}`)}</option>`).join("") : '<option value="">Default microphone</option>';
      if (devices.some((device) => device.deviceId === ownSelected)) target.value = ownSelected;
      else if (devices.some((device) => device.deviceId === requested)) target.value = requested;
    });
    selectedMicrophoneId = elements.microphoneSelect?.value || elements.preflightMicrophoneSelect?.value || requested || "";
    return devices;
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
        if (activeLevelBar === elements.preflightLevelBar) preflightVoicePeak = Math.max(preflightVoicePeak, percent);
        const track = activeLevelBar?.parentElement;
        if (track?.getAttribute("role") === "progressbar") track.setAttribute("aria-valuenow", String(percent));
        levelFrame = requestAnimationFrame(draw);
      };
      draw();
    } catch { stopLevelMeter(); }
  }

  function stopMediaStream() {
    stopLevelMeter();
    if (mediaStream) mediaStream.getTracks().forEach((track) => { intentionallyStoppedTracks.add(track); track.stop(); });
    mediaStream = null;
  }

  function getUserMediaWithTimeout(constraints, timeoutMs = MICROPHONE_TIMEOUT_MS) {
    let timedOut = false;
    let timeout = 0;
    const mediaPromise = navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
      if (timedOut) {
        stream.getTracks().forEach((track) => track.stop());
        throw Object.assign(new Error("microphone_timeout"), { name: "TimeoutError" });
      }
      return stream;
    });
    const timeoutPromise = new Promise((_, reject) => {
      timeout = window.setTimeout(() => {
        timedOut = true;
        reject(Object.assign(new Error("microphone_timeout"), { name: "TimeoutError" }));
      }, timeoutMs);
    });
    return Promise.race([mediaPromise, timeoutPromise]).finally(() => window.clearTimeout(timeout));
  }

  function handleMicrophoneTrackEnded(event) {
    if (pageClosing || intentionallyStoppedTracks.has(event?.target)) return;
    recorderFailureReason = "microphone_disconnected";
    if (mediaRecorder?.state === "recording") {
      recordingDurationMs = Math.max(recordingDurationMs, Date.now() - recordingStartedAt);
      try { mediaRecorder.stop(); } catch { /* stop event may already be queued */ }
    }
    setText(elements.recordStatus, "The selected microphone disconnected. The captured audio will be protected if it is complete.");
    setWorkflowMessage("Microphone disconnected", "Reconnect or select a microphone before the next response.", "bi-mic-mute-fill");
  }

  async function ensureMediaStream(select = elements.microphoneSelect) {
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) throw new Error("unsupported_microphone");
    if (mediaStream?.getTracks().some((track) => track.readyState === "live")) return mediaStream;
    const deviceId = select?.value;
    mediaStream = await getUserMediaWithTimeout({
      audio: { deviceId: deviceId ? { exact: deviceId } : undefined, echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      video: false
    });
    const activeTrack = mediaStream.getAudioTracks()[0];
    activeTrack?.addEventListener("ended", handleMicrophoneTrackEnded, { once: true });
    selectedMicrophoneId = activeTrack?.getSettings?.().deviceId || deviceId || "";
    await listMicrophones(select).catch(() => {});
    [elements.preflightMicrophoneSelect, elements.microphoneSelect].filter(Boolean).forEach((target) => {
      if (selectedMicrophoneId && Array.from(target.options).some((option) => option.value === selectedMicrophoneId)) target.value = selectedMicrophoneId;
    });
    return mediaStream;
  }

  async function runPreflight() {
    if (preflightRecorder?.state === "recording") return;
    const preflightSession = sessionGeneration;
    preflightPassed = false;
    preflightSampleReady = false;
    preflightVoicePeak = 0;
    preflightPlaybackConfirmed = false;
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
      preflightRecorder.addEventListener("error", () => {
        preflightSampleReady = false;
        setText(elements.preflightStatus, "The microphone recorder reported an error. Select another device and test again.");
      });
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
        const hasVoice = preflightVoicePeak >= 4;
        preflightSampleReady = sample.size >= 700 && hasVoice;
        verifiedMicrophoneId = preflightSampleReady ? (selectedMicrophoneId || "default") : "";
        setText(elements.preflightStatus, preflightSampleReady ? `Voice detected (peak ${preflightVoicePeak}%). Play the sample completely before confirming.` : "No clear voice level was detected. Speak closer to the microphone and test again.");
        setDisabled(elements.preflightConfirm, true);
        setDisabled(elements.preflight, false);
        setDisabled(elements.preflightMicrophoneSelect, false);
        setDisabled(elements.microphoneSelect, false);
        enableOfficialStartIfAllowed();
        if (!preflightSampleReady && elements.preflightConfirm?.type === "checkbox") elements.preflightConfirm.checked = false;
      }, { once: true });
      preflightRecorder.start(200);
      window.setTimeout(() => { if (preflightRecorder?.state === "recording") preflightRecorder.stop(); }, 4000);
    } catch (error) {
      stopMediaStream();
      setDisabled(elements.preflight, false);
      setDisabled(elements.preflightMicrophoneSelect, false);
      setDisabled(elements.microphoneSelect, false);
      enableOfficialStartIfAllowed();
      setText(elements.preflightStatus, error.name === "NotAllowedError" ? "Microphone permission was denied. Allow access in the browser settings and retry." : error.name === "TimeoutError" ? "The browser did not finish the microphone request. Close the permission prompt, check browser settings, and retry." : "The microphone could not start. Select another microphone or browser and retry.");
    }
  }

  function confirmPreflight() {
    if (!preflightSampleReady || !preflightPlaybackConfirmed || !verifiedMicrophoneId) {
      preflightPassed = false;
      enableOfficialStartIfAllowed();
      setText(elements.preflightStatus, "Record a clear voice sample and play it before confirming readiness.");
      return;
    }
    if (elements.preflightConfirm?.type === "checkbox" && !elements.preflightConfirm.checked) {
      preflightPassed = false;
      enableOfficialStartIfAllowed();
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
    setDisabled(elements.mic, leaseReadOnly || controlsBusy || savedCurrentTurn || !questionHeard);
    setDisabled(elements.dockMic, leaseReadOnly || controlsBusy || savedCurrentTurn || !questionHeard);
    setDisabled(elements.stop, !recording);
    setDisabled(elements.dockStop, !recording);
    setHidden(elements.dockMic, recording);
    setHidden(elements.dockStop, !recording);
    setDisabled(elements.microphoneSelect, controlsBusy);
    setDisabled(elements.preflightMicrophoneSelect, controlsBusy);
    setDisabled(elements.questionPlay, leaseReadOnly || controlsBusy || reactionBusy || savedCurrentTurn || questionAudioLoading || questionAudioPlaying);
    elements.mic?.classList.toggle("is-recording", recording);
    elements.dock?.classList.toggle("is-recording", recording);
    updateAdminPreviewNavigation();
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
    if (leaseReadOnly) return;
    if (!questionHeard || analyzing || savedCurrentTurn || recordingStartPending || recordingFinalizing || mediaRecorder?.state === "recording") return;
    const recordingSession = sessionGeneration;
    recordingStartPending = true;
    updateRecordingControls(false);
    try {
      pauseAllAudio();
      const stream = await ensureMediaStream(elements.microphoneSelect);
      if (recordingSession !== sessionGeneration) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      startLevelMeter(stream);
      chunks = [];
      const mimeType = supportedMimeType();
      mediaRecorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      recorderFailureReason = "";
      mediaRecorder.addEventListener("dataavailable", (event) => {
        if (recordingSession === sessionGeneration && event.data?.size) chunks.push(event.data);
      });
      mediaRecorder.addEventListener("stop", () => {
        if (!recordingDurationMs && recordingStartedAt) recordingDurationMs = Math.max(0, Date.now() - recordingStartedAt);
        if (recordingSession === sessionGeneration) handleRecordingStopped();
        else stopMediaStream();
      }, { once: true });
      mediaRecorder.addEventListener("error", (event) => {
        recorderFailureReason = event.error?.name || "recorder_error";
        recordingDurationMs = Math.max(recordingDurationMs, recordingStartedAt ? Date.now() - recordingStartedAt : 0);
        setText(elements.recordStatus, "The recorder reported an interruption. The captured audio will be protected if it is complete.");
        if (mediaRecorder?.state === "recording") try { mediaRecorder.stop(); } catch { /* stop is already in progress */ }
      });
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
      setText(elements.recordStatus, error.name === "NotAllowedError" ? "Microphone permission was denied. Allow access and retry this technical step." : error.name === "TimeoutError" ? "The microphone request timed out. Check browser permissions and retry." : "The microphone could not start. Select another microphone and retry.");
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
    await processCapturedTurn();
  }

  async function refreshAttemptSecurityScope() {
    if (!attempt?.attemptId || role === "admin" || role === "teacher" || adminPreviewMode) return;
    const result = await request(`${API.attempt}?attemptId=${encodeURIComponent(attempt.attemptId)}`, { method: "GET" }, 2);
    requireContract(isScopedAttemptContract(result.data.attempt), "invalid_scope_refresh_contract", result.data);
    applyServerAttempt(result.data.attempt);
  }

  async function requestTranscription(blob, allowScopeRefresh = true) {
    const officialStudent = role === "student" && !adminPreviewMode;
    const expiresAt = Date.parse(attempt?.transcriberScopeExpiresAt || "");
    if (officialStudent && (!attempt?.transcriberScopeToken || (Number.isFinite(expiresAt) && expiresAt <= Date.now() + 30000))) await refreshAttemptSecurityScope();
    if (officialStudent) requireContract(hasText(attempt?.transcriberScopeToken), "missing_transcriber_scope", attempt);
    const scopeHeaders = attempt?.transcriberScopeToken ? { "X-Jaralingua-Exam-Scope": attempt.transcriberScopeToken } : {};
    try {
      const result = await request(API.transcribe, {
        method: "POST",
        headers: Object.assign({ "Content-Type": blob.type || "audio/webm", "X-Jaralingua-Language": "en", "X-Jaralingua-Workload": officialStudent ? "final-oral" : "practice" }, scopeHeaders),
        body: blob,
        timeout: TRANSCRIPTION_TIMEOUT_MS
      }, 1);
      requireContract(typeof result.data.text === "string", "invalid_transcription_contract", result.data);
      return result.data || {};
    } catch (error) {
      const expired = allowScopeRefresh && officialStudent && (error.status === 401 || error.status === 403 || ["scope_expired", "invalid_exam_scope", "missing_exam_scope"].includes(error.data?.error));
      if (!expired) throw error;
      await refreshAttemptSecurityScope();
      return requestTranscription(blob, false);
    }
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
    requireContract(isScopedAttemptContract(nextAttempt), "invalid_attempt_contract", nextAttempt);
    attempt = nextAttempt;
    revision = Number(nextAttempt.revision || revision);
    assignedQuestions = Array.isArray(nextAttempt.assignedQuestions) ? nextAttempt.assignedQuestions.slice().sort((a, b) => Number(a.sequence) - Number(b.sequence)) : assignedQuestions;
    if (nextAttempt.lease?.leaseId && nextAttempt.lease?.expiresAt) applyServerLease(nextAttempt.lease);
    else clearServerLease();
  }

  function sessionChangedError() { return Object.assign(new Error("session_changed"), { silent: true }); }

  async function saveCurrentTurn(transcript, dataUrl, allowStaleRetry = true, context = null, allowLeaseRetry = true) {
    const saveContext = context || {
      session: sessionGeneration,
      attemptId: attempt?.attemptId || "",
      mimeType: currentBlob?.type || "audio/webm",
      question: currentQuestion(),
      clientTurnId: currentClientTurnId,
      durationMs: recordingDurationMs
    };
    const question = saveContext.question || currentQuestion();
    if (!question || !attempt || saveContext.session !== sessionGeneration || attempt.attemptId !== saveContext.attemptId) throw sessionChangedError();
    try {
      const lease = await ensureServerLease();
      const payload = {
        attemptId: saveContext.attemptId,
        attemptScopeToken: attempt.attemptScopeToken || saveContext.attemptScopeToken || undefined,
        leaseId: lease?.leaseId || serverLeaseId,
        deviceId: deviceInstanceId,
        turnId: question.turnId,
        variantId: question.variantId,
        clientTurnId: saveContext.clientTurnId || currentClientTurnId,
        transcript: transcript || undefined,
        transcriptStatus: transcript ? "complete" : "pending",
        durationMs: Math.round(saveContext.durationMs ?? recordingDurationMs),
        revision,
        audioDataUrl: dataUrl,
        mimeType: saveContext.mimeType
      };
      const result = await request(API.turn, jsonOptions("PUT", payload), 3);
      if (saveContext.session !== sessionGeneration || attempt?.attemptId !== saveContext.attemptId) throw sessionChangedError();
      requireContract(isTurnContract(result.data.turn) && Number.isFinite(Number(result.data.revision ?? revision + 1)), "invalid_turn_acknowledgement", result.data);
      revision = Number(result.data.revision ?? revision + 1);
      attempt.revision = revision;
      attempt.turns = attempt.turns || {};
      attempt.turns[question.turnId] = result.data.turn;
      updateServerLeaseExpiry(result.data);
      return result.data.turn;
    } catch (error) {
      if (error?.silent || saveContext.session !== sessionGeneration || attempt?.attemptId !== saveContext.attemptId) throw sessionChangedError();
      if (allowLeaseRetry && isLeaseError(error) && await recoverServerLease(error)) {
        return saveCurrentTurn(transcript, dataUrl, allowStaleRetry, saveContext, false);
      }
      if (allowStaleRetry && error.status === 409 && error.data?.error === "stale_attempt" && error.data.attempt) {
        requireContract(isScopedAttemptContract(error.data.attempt), "invalid_stale_attempt_contract", error.data);
        applyServerAttempt(error.data.attempt);
        if (attempt.turns?.[question.turnId] && isTurnContract(attempt.turns[question.turnId])) return attempt.turns[question.turnId];
        return saveCurrentTurn(transcript, dataUrl, false, saveContext, allowLeaseRetry);
      }
      throw error;
    }
  }

  function enqueueServerMutation(operation) {
    const run = serverMutationChain.then(operation, operation);
    serverMutationChain = run.catch(() => {});
    return run;
  }

  async function uploadQueuedRecord(record) {
    if (!record?.blob || record.scope !== accountScope() || record.attemptId !== attempt?.attemptId) return null;
    await ensureServerLease();
    const question = assignedQuestions.find((item) => item.turnId === record.turnId) || record.question;
    requireContract(Boolean(question?.turnId), "queued_question_missing", record);
    const dataUrl = await blobToDataUrl(record.blob);
    const context = {
      session: sessionGeneration,
      attemptId: record.attemptId,
      attemptScopeToken: record.attemptScopeToken,
      mimeType: record.mimeType || record.blob.type || "audio/webm",
      question,
      clientTurnId: record.clientTurnId,
      durationMs: record.durationMs
    };
    const turn = await enqueueServerMutation(() => saveCurrentTurn("", dataUrl, true, context));
    await deleteQueuedAudio(record.queueId);
    return turn;
  }

  async function updateSavedTurnTranscript(record, transcript, allowStaleRetry = true, allowLeaseRetry = true) {
    if (!transcript || record.scope !== accountScope() || record.attemptId !== attempt?.attemptId) return null;
    record.transcriptClientTurnId = record.transcriptClientTurnId || createId("bfo-transcript");
    try {
      const lease = await ensureServerLease();
      const payload = {
        attemptId: record.attemptId,
        attemptScopeToken: attempt?.attemptScopeToken || record.attemptScopeToken || undefined,
        leaseId: lease?.leaseId || serverLeaseId,
        deviceId: deviceInstanceId,
        turnId: record.turnId,
        variantId: record.variantId,
        clientTurnId: record.transcriptClientTurnId,
        transcript,
        transcriptStatus: "complete",
        revision
      };
      const result = await enqueueServerMutation(() => request(API.turn, jsonOptions("PUT", payload), 3));
      requireContract(isTurnContract(result.data.turn) && Number.isFinite(Number(result.data.revision ?? revision + 1)), "invalid_transcript_acknowledgement", result.data);
      revision = Number(result.data.revision ?? revision + 1);
      attempt.revision = revision;
      attempt.turns = attempt.turns || {};
      attempt.turns[record.turnId] = result.data.turn;
      updateServerLeaseExpiry(result.data);
      return result.data.turn;
    } catch (error) {
      if (allowLeaseRetry && isLeaseError(error) && await recoverServerLease(error)) {
        return updateSavedTurnTranscript(record, transcript, allowStaleRetry, false);
      }
      if (allowStaleRetry && error.status === 409 && error.data?.error === "stale_attempt" && isAttemptContract(error.data.attempt)) {
        applyServerAttempt(error.data.attempt);
        const current = attempt.turns?.[record.turnId];
        if (current?.transcript && String(current.transcriptStatus || "complete") === "complete") return current;
        return updateSavedTurnTranscript(record, transcript, false, allowLeaseRetry);
      }
      throw error;
    }
  }

  function transcribeSavedAudio(record) {
    if (!record?.blob || pendingTranscriptJobs.has(record.turnId)) return;
    const jobSession = sessionGeneration;
    const job = (async () => {
      try {
        const transcription = await requestTranscription(record.blob);
        const transcript = String(transcription.text || "").trim();
        if (!transcript || jobSession !== sessionGeneration || attempt?.attemptId !== record.attemptId) return;
        const turn = await updateSavedTurnTranscript(record, transcript);
        if (jobSession !== sessionGeneration) return;
        if (currentQuestion()?.turnId === record.turnId) {
          currentTranscript = transcript;
          setText(elements.transcript, "Transcript completed and stored privately for teacher review.");
          setPipeline("transcript", "complete");
          setWorkflowMessage("Audio and transcript secured", "You may continue. The recording remains the primary evidence.");
        }
        return turn;
      } catch {
        if (jobSession === sessionGeneration && currentQuestion()?.turnId === record.turnId) {
          setText(elements.transcript, "Transcript pending. Your verified audio is already saved and you may continue.");
          setPipeline("transcript", "active");
          setWorkflowMessage("Audio saved", "Transcription is pending and will not block this exam.", "bi-cloud-check-fill");
        }
      } finally { pendingTranscriptJobs.delete(record.turnId); }
    })();
    pendingTranscriptJobs.set(record.turnId, job);
  }

  function renderRecoveredQueuedTurn(record, savedTurn) {
    if (currentQuestion()?.turnId !== record?.turnId || !isTurnContract(savedTurn)) return;
    savedCurrentTurn = true;
    currentQueueId = "";
    currentTranscript = String(savedTurn.transcript || "");
    if (record.blob) {
      currentBlob = record.blob;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      objectUrl = URL.createObjectURL(record.blob);
      if (elements.studentAudio) { elements.studentAudio.src = objectUrl; elements.studentAudio.hidden = false; }
    }
    setText(elements.transcript, currentTranscript ? "Recovered transcript stored privately for teacher review." : "Transcript pending. The recovered audio is already verified.");
    setText(elements.recordStatus, "Your queued answer was recovered and verified by the server. You may continue.");
    setText(elements.saveStatus, `Recovered securely · response ${currentIndex + 1} of ${REQUIRED_TURNS}`);
    setHidden(elements.answerCaptured, false);
    setHidden(elements.recovery, true);
    setHidden(elements.next, false);
    setDisabled(elements.next, false);
    setPipeline(currentTranscript ? "transcript" : "audio", currentTranscript ? "complete" : "active");
    setWorkflowMessage("Queued audio recovered", "The server confirmed this answer; no second recording is required.", "bi-cloud-check-fill");
    setDanielState("ready", "Daniel is ready for you to continue");
    updateRecordingControls(false);
  }

  async function drainAudioQueue() {
    if (!online || !attempt || adminPreviewMode || leaseReadOnly) return;
    const records = (await listQueuedAudio()).filter((item) => item.scope === accountScope() && item.attemptId === attempt.attemptId).sort((a, b) => Number(a.createdAtMs) - Number(b.createdAtMs));
    for (const record of records) {
      const saved = attempt.turns?.[record.turnId];
      if (saved && isTurnContract(saved) && (saved.audioAvailable || saved.verification || saved.savedAt)) {
        await deleteQueuedAudio(record.queueId);
        renderRecoveredQueuedTurn(record, saved);
        if (!saved.transcript) transcribeSavedAudio(record);
        continue;
      }
      try {
        const savedTurn = await uploadQueuedRecord(Object.assign({}, record, { session: sessionGeneration }));
        renderRecoveredQueuedTurn(record, savedTurn);
        transcribeSavedAudio(record);
      } catch { break; }
    }
  }

  async function processAdminPreviewTurn() {
    if (!adminPreviewMode || !currentBlob || analyzing) return;
    const previewSession = sessionGeneration;
    const previewQuestion = currentQuestion();
    const previewBlob = currentBlob;
    analyzing = true;
    setHidden(elements.recovery, true);
    setText(elements.recordStatus, "Requesting a temporary administrator preview transcript. It will not be stored in Grades or submissions.");
    setText(elements.saveStatus, "ADMIN PREVIEW · temporary transcription · nothing will be stored or submitted");
    setDanielState("thinking", "Daniel is preparing the preview response");
    setBusy(true, "Processing the private administrator rehearsal…");
    if (elements.saveState) elements.saveState.innerHTML = '<i class="bi bi-eye-fill"></i><span>Administrator preview only</span>';
    updateRecordingControls(false);
    let transcript = "";
    try {
      try {
        const transcription = await requestTranscription(previewBlob);
        transcript = String(transcription.text || "").trim();
      } catch {
        if (previewSession !== sessionGeneration || !adminPreviewMode) return;
      }
      if (previewSession !== sessionGeneration || !adminPreviewMode || !previewQuestion || currentQuestion()?.turnId !== previewQuestion.turnId) return;
      currentTranscript = transcript;
      attempt.turns = attempt.turns || {};
      attempt.turns[previewQuestion.turnId] = {
        turnId: previewQuestion.turnId,
        transcript,
        durationMs: Math.round(recordingDurationMs),
        savedAt: new Date().toISOString(),
        previewOnly: true
      };
      savedCurrentTurn = true;
      setText(elements.transcript, transcript ? `Temporary preview transcript: ${transcript}` : "No transcript was returned, but the rehearsal audio remains available in this preview.");
      setHidden(elements.transcript, false);
      setText(elements.recordStatus, "Administrator rehearsal completed for this question.");
      setText(elements.saveStatus, "PREVIEW ONLY · response kept temporarily in this tab · not saved or graded");
      setHidden(elements.answerCaptured, false);
      if (elements.saveState) { elements.saveState.className = "exam-save-state saved"; elements.saveState.innerHTML = '<i class="bi bi-eye-fill"></i><span>Preview only · not saved</span>'; }
      setHidden(elements.next, false);
      setDisabled(elements.next, true);
      updateRecordingControls(false);
      await playResponseQueue(responsesForTurn(previewQuestion, transcript));
    } finally {
      if (previewSession !== sessionGeneration || !adminPreviewMode) return;
      analyzing = false;
      setBusy(false);
      updateRecordingControls(false);
    }
  }

  async function processCapturedTurn() {
    if (adminPreviewMode) return processAdminPreviewTurn();
    return processAndSaveCurrentTurn();
  }

  async function processAndSaveCurrentTurn() {
    if (!currentBlob || analyzing) return;
    const processingSession = sessionGeneration;
    const processingAttemptId = attempt?.attemptId || "";
    const processingBlob = currentBlob;
    const processingQuestion = currentQuestion();
    if (!processingQuestion || !processingAttemptId) return;
    const record = {
      queueId: currentQueueId || createId("bfo-audio"),
      scope: accountScope(),
      attemptId: processingAttemptId,
      turnId: processingQuestion.turnId,
      variantId: processingQuestion.variantId,
      question: processingQuestion,
      clientTurnId: currentClientTurnId || createId("bfo-turn"),
      durationMs: Math.round(recordingDurationMs),
      mimeType: processingBlob.type || "audio/webm",
      blob: processingBlob,
      createdAtMs: Date.now()
    };
    currentQueueId = record.queueId;
    analyzing = true;
    setHidden(elements.recovery, true);
    setText(elements.recordStatus, "Protecting the original audio before transcription.");
    setText(elements.saveStatus, "Step 1 of 2: protecting audio on this device.");
    setDanielState("thinking", "Daniel is waiting for the audio confirmation");
    setBusy(true, "Protecting the original recording…");
    setPipeline("queued", "active");
    if (elements.saveState) { elements.saveState.className = "exam-save-state saving"; elements.saveState.innerHTML = '<i class="bi bi-device-ssd-fill"></i><span>Protecting audio…</span>'; }
    updateRecordingControls(false);
    try {
      Object.assign(record, await putQueuedAudio(record));
      if (processingSession !== sessionGeneration || attempt?.attemptId !== processingAttemptId) throw sessionChangedError();
      if (record.durable === false) {
        setText(elements.saveStatus, "Temporary in-memory protection only. Do not close or reload this page before server confirmation.");
        setWorkflowMessage("Keep this page open", "Local durable storage is unavailable; secure upload is continuing now.", "bi-exclamation-triangle-fill");
      }
      setPipeline("audio", "active");
      setText(elements.saveStatus, record.durable === false
        ? "Temporary memory only: keep this page open while the server verifies the audio."
        : online ? "Step 2 of 2: waiting for server audio verification." : "Offline: the recording is protected on this device and will upload automatically.");
      if (!online) throw Object.assign(new Error("offline_audio_queued"), { queued: true });
      const savedTurn = await uploadQueuedRecord(record);
      if (processingSession !== sessionGeneration || attempt?.attemptId !== processingAttemptId) throw sessionChangedError();
      requireContract(isTurnContract(savedTurn), "invalid_audio_acknowledgement", savedTurn);
      savedCurrentTurn = true;
      currentQueueId = "";
      currentTranscript = String(savedTurn.transcript || "");
      setText(elements.transcript, currentTranscript ? "Transcript stored privately for teacher review." : "Transcript pending. Your verified audio is already saved.");
      setText(elements.recordStatus, "Official audio saved and verified. You may continue.");
      setText(elements.saveStatus, `Audio saved securely · response ${currentIndex + 1} of ${REQUIRED_TURNS} · transcript ${currentTranscript ? "complete" : "pending"}`);
      setHidden(elements.answerCaptured, false);
      if (elements.saveState) { elements.saveState.className = "exam-save-state saved"; elements.saveState.innerHTML = '<i class="bi bi-cloud-check-fill"></i><span>Progress saved</span>'; }
      setPipeline(currentTranscript ? "transcript" : "audio", currentTranscript ? "complete" : "active");
      setWorkflowMessage("Audio verified", currentTranscript ? "The transcript is complete." : "Transcription continues separately and does not block the exam.", "bi-cloud-check-fill");
      setHidden(elements.recovery, true);
      setHidden(elements.next, false);
      setDisabled(elements.next, true);
      updateRecordingControls(false);
      if (!currentTranscript) transcribeSavedAudio(record);
      await playResponseQueue(responsesForTurn(processingQuestion, currentTranscript));
    } catch (error) {
      if (error?.silent || processingSession !== sessionGeneration) return;
      if (isLeaseError(error)) {
        clearServerLease();
        leaseReadOnly = true;
        renderLeaseState();
      }
      const volatileOnly = record.durable === false;
      setText(elements.recordStatus, volatileOnly
        ? "This recording is held only in temporary memory. Do not close or reload this page while secure upload is pending."
        : error.queued || !online ? "Your recording is protected on this device and is waiting for the connection." : "The server has not confirmed this audio yet. The protected recording remains available for retry.");
      setText(elements.saveStatus, volatileOnly ? "TEMPORARY MEMORY ONLY — KEEP THIS PAGE OPEN UNTIL THE SERVER CONFIRMS THE AUDIO." : "AUDIO NOT YET ACKNOWLEDGED — retry is automatic when the connection returns.");
      if (elements.saveState) { elements.saveState.className = "exam-save-state error"; elements.saveState.innerHTML = volatileOnly ? '<i class="bi bi-exclamation-triangle-fill"></i><span>Temporary memory · keep page open</span>' : '<i class="bi bi-device-ssd-fill"></i><span>Protected · upload pending</span>'; }
      setPipeline(error.name === "ContractError" ? "audio" : "queued", error.name === "ContractError" ? "error" : "active");
      showTechnicalRecovery(volatileOnly ? "Keep this page open and reconnect or press Retry secure processing. Closing or reloading will lose this temporary in-memory recording." : error.name === "ContractError" ? "The server response was incomplete, so this answer was not marked saved. Retry the same protected audio; do not record again." : "The original recording is protected. Reconnect or press Retry secure processing; no new answer is needed.");
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
    setDisabled(elements.recordAgain, Boolean(currentQueueId));
  }

  function resetFailedRecording() {
    if (savedCurrentTurn || currentQueueId) return;
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
    if (currentIndex >= assignedQuestions.length) {
      if (adminPreviewMode) finishAdminPreview(true);
      else renderReadyToSubmit();
    }
    else renderCurrentTurn();
  }

  function renderSubmissionWorkflow(value = attempt) {
    const workflow = workflowOf(value);
    const gradesSync = String(value?.syncStatus || value?.gradesSyncStatus || value?.gradesStatus || "").toLowerCase();
    const verified = value?.verification?.allAudioVerified === true || value?.audioVerified === true || ["verified", "pending_review", "graded", "published"].includes(workflow);
    const received = Boolean(value?.receiptId) || ["received", "verified", "sync_pending", "pending_review", "graded", "published"].includes(workflow);
    const synced = gradesSync === "synced" || ["pending_review", "graded", "published"].includes(workflow);
    const reviewed = workflow === "published";
    const states = { received, verified, grades: synced, review: reviewed };
    elements.submissionWorkflow?.querySelectorAll("[data-workflow-step]").forEach((item) => item.classList.toggle("is-complete", Boolean(states[item.dataset.workflowStep])));
  }

  function renderReadyToSubmit() {
    if (adminPreviewMode) return finishAdminPreview(true);
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
    setWorkflowMessage("Complete · pending final submission", "Seven answers are secured. Submit to obtain the official receipt.", "bi-send-check-fill");
    renderSubmissionWorkflow(Object.assign({}, attempt, { workflowStatus: "complete_pending_submit" }));
    focusPanel(elements.ready);
  }

  function submissionId() {
    const key = SUBMISSION_KEY_PREFIX + (attempt?.attemptId || "unknown");
    let value = safeStorageGet(key) || inMemorySubmissionId;
    if (!value) { value = createId("bfo-submit"); inMemorySubmissionId = value; safeStorageSet(key, value); }
    return value;
  }

  async function recoverSubmission(expectedSession = sessionGeneration, expectedAttemptId = attempt?.attemptId || "") {
    try {
      const result = await request(`${API.attempt}?attemptId=${encodeURIComponent(expectedAttemptId)}`, { method: "GET" }, 2);
      if (expectedSession !== sessionGeneration || attempt?.attemptId !== expectedAttemptId) return null;
      if (result.data.submission) {
        requireContract(isSubmissionContract(result.data.submission), "invalid_submission_contract", result.data);
        return result.data.submission;
      }
      if (result.data.attempt) {
        requireContract(isScopedAttemptContract(result.data.attempt), "invalid_attempt_contract", result.data);
        applyServerAttempt(result.data.attempt);
      }
    } catch { /* preserve current screen */ }
    return null;
  }

  async function sendFinalSubmission(payload, allowLeaseRetry = true) {
    try {
      const lease = await ensureServerLease();
      payload.leaseId = lease?.leaseId || serverLeaseId;
      payload.deviceId = deviceInstanceId;
      payload.revision = revision;
      const result = await request(API.submit, jsonOptions("POST", payload), 3);
      updateServerLeaseExpiry(result.data);
      return result;
    } catch (error) {
      if (allowLeaseRetry && isLeaseError(error) && await recoverServerLease(error)) return sendFinalSubmission(payload, false);
      throw error;
    }
  }

  async function submitExam() {
    if (submissionBusy || Object.keys(attempt?.turns || {}).length !== REQUIRED_TURNS || (elements.submitConfirmation && !elements.submitConfirmation.checked)) return;
    const submitSession = sessionGeneration;
    const submitAttemptId = attempt.attemptId;
    submissionBusy = true;
    setDisabled(elements.submit, true);
    setDisabled(elements.submitConfirmation, true);
    setText(elements.submissionStatus, "Submitting seven official recordings. Keep this page open.");
    const payload = { attemptId: submitAttemptId, attemptScopeToken: attempt.attemptScopeToken || undefined, revision, clientSubmissionId: submissionId(), deviceId: deviceInstanceId };
    try {
      const result = await sendFinalSubmission(payload);
      if (submitSession !== sessionGeneration || attempt?.attemptId !== submitAttemptId) return;
      requireContract(isSubmissionContract(result.data.submission), "invalid_submit_acknowledgement", result.data);
      renderSubmission(result.data.submission);
      try { await playClip(elements.reactionAudio, AUDIO_ROOT + "submission-complete.mp3"); } catch { /* receipt is authoritative */ }
      toast("Final Oral Task submitted successfully.", "success");
    } catch (error) {
      if (submitSession !== sessionGeneration || attempt?.attemptId !== submitAttemptId) return;
      if (isLeaseError(error)) {
        clearServerLease();
        leaseReadOnly = true;
        renderLeaseState();
      }
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
    setDisabled(elements.adminSaveWindow, true);
    if (elements.adminStatus) setText(elements.adminStatus.querySelector?.("span") || elements.adminStatus, "Saving the new exam state.");
    try {
      const eligibleStudentIds = String(elements.adminEligibleStudents?.value || "").split(/[\s,;]+/).map((value) => value.trim()).filter(Boolean);
      const payload = {
        isOpen,
        opensAt: elements.adminOpensAt?.value ? new Date(elements.adminOpensAt.value).toISOString() : null,
        closesAt: elements.adminClosesAt?.value ? new Date(elements.adminClosesAt.value).toISOString() : null,
        closeMode: elements.adminCloseMode?.value === "hard" ? "hard" : "soft",
        graceSeconds: Math.max(0, Math.min(3600, Number(elements.adminGraceSeconds?.value || 0))),
        eligibleStudentIds
      };
      const result = await request(API.state, jsonOptions("PUT", payload), 2);
      if (adminSession !== sessionGeneration) return;
      requireContract(isRecord(result.data.state) && typeof result.data.state.isOpen === "boolean", "invalid_admin_state_acknowledgement", result.data);
      serverState = result.data.state;
      renderAdminState();
      toast(result.data.message || (isOpen ? "The official exam is open." : "The official exam is closed."), "success");
    } catch (error) {
      if (adminSession !== sessionGeneration) return;
      if (error.status === 409 && error.data?.error === "exam_health_check_failed") {
        if (isRecord(error.data.health)) adminHealth = error.data.health;
        renderAdminHealth();
        const warnings = Array.isArray(error.data.blockingWarnings) ? error.data.blockingWarnings.join(" · ") : "A blocking health warning must be resolved before opening.";
        setText(elements.adminOperationStatus, warnings);
        if (elements.adminStatus) setText(elements.adminStatus.querySelector?.("span") || elements.adminStatus, "The exam remained closed because a health check failed.");
        toast("The exam was not opened. Review the blocking health warning.", "error");
        renderAdminState();
        return;
      }
      renderAdminState();
      if (elements.adminStatus) setText(elements.adminStatus.querySelector?.("span") || elements.adminStatus, "The exam state could not be changed. Try again.");
      toast("The exam state did not change.", "error");
    } finally { setDisabled(elements.adminSaveWindow, false); }
  }

  async function saveAdminWindow() {
    const keepOpen = serverState?.isOpen === true;
    await updateAdminState(keepOpen);
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
    const selected = staffSubmissions.find((item) => item.receiptId === card.dataset.receiptId) || {
      studentId: card.dataset.studentId, receiptId: card.dataset.receiptId, gradeRevision: Number(card.dataset.gradeRevision || 0), turns: []
    };
    if (reviewedAudioEvidenceFor(selected).length !== REQUIRED_TURNS) {
      setText(status, "Publishing is blocked because the seven frozen audio hashes are not available.");
      return;
    }
    let reason = "";
    if (workflowOf(selected) === "published") {
      reason = String(window.prompt("Reason for changing an already published official grade:", "") || "").trim();
      if (!reason) return;
    }
    button.disabled = true;
    setText(status, "Saving the official rubric and feedback.");
    try {
      const mutation = buildGradeMutation("publish", selected, rubric, card.querySelector("[data-final-oral-feedback]")?.value || "", reason, createId("bfo-grade-publish"));
      const result = await request(API.grade, jsonOptions("PUT", mutation), 2);
      requireContract(isSubmissionContract(result.data.submission), "invalid_grade_acknowledgement", result.data);
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
    const reviewedAudioEvidence = reviewedAudioEvidenceFor(selectedStaffSubmission);
    const evidenceReady = reviewedAudioEvidence.length === REQUIRED_TURNS && new Set(reviewedAudioEvidence.map((item) => item.turnId)).size === REQUIRED_TURNS;
    const alreadyPublished = workflowOf(selectedStaffSubmission) === "published";
    setDisabled(elements.publishGradeButton, !selectedStaffSubmission || !valid || !feedbackReady || !evidenceReady);
    setHidden(elements.saveGradeDraftButton, alreadyPublished);
    setDisabled(elements.saveGradeDraftButton, !selectedStaffSubmission || alreadyPublished);
    setText(elements.publishStatus, !selectedStaffSubmission ? "Select a student submission." : !evidenceReady ? "Publishing is blocked: verify that all seven frozen audio hashes are available." : !valid ? "Complete the five criteria from 1 to 10." : !feedbackReady ? "Add specific teacher feedback before publishing." : `Ready to publish ${total} / 50 (${(total / 10).toFixed(2)} / 5.0).`);
    return valid && feedbackReady && evidenceReady;
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
      setDisabled(elements.saveGradeDraftButton, true);
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
    if (elements.staffReviewStatus) elements.staffReviewStatus.innerHTML = workflowOf(selectedStaffSubmission) === "published"
      ? '<i class="bi bi-patch-check-fill"></i> Graded and published'
      : workflowOf(selectedStaffSubmission) === "graded"
        ? '<i class="bi bi-floppy-fill"></i> Private draft'
        : '<i class="bi bi-hourglass-split"></i> Pending review';
    setText(elements.evidenceCoverage, `${(selectedStaffSubmission.turns || []).filter((turn) => turn?.audioAvailable).length} of ${REQUIRED_TURNS} loaded`);
    const rubric = selectedStaffSubmission.rubric || {};
    Object.entries(fixedRubricInputs()).forEach(([key, input]) => { if (input) input.value = rubric[key] ?? ""; });
    if (elements.teacherFeedback) elements.teacherFeedback.value = selectedStaffSubmission.teacherFeedback || "";
    renderGradeHistory(selectedStaffSubmission);
    setEvidenceControlsEnabled(true);
    renderFixedEvidence(0);
    updateFixedRubric();
  }

  function renderGradeHistory(item) {
    if (!elements.gradeHistoryList) return;
    const history = Array.isArray(item?.gradeHistory) ? item.gradeHistory : [];
    elements.gradeHistoryList.innerHTML = history.length ? history.slice().reverse().map((entry) => {
      const action = entry.workflowStatus || entry.action || entry.status || "revision";
      const score = entry.score50 ?? entry.newScore50 ?? "—";
      const actor = entry.changedBy || entry.actorName || entry.actor || "Teacher";
      const at = entry.changedAt || entry.at || entry.createdAt || entry.updatedAt || "—";
      const reason = entry.reason ? ` · ${entry.reason}` : "";
      return `<li><strong>${escapeHtml(action)}</strong> · ${escapeHtml(score)} / 50 · ${escapeHtml(actor)} · ${escapeHtml(at)}${escapeHtml(reason)}</li>`;
    }).join("") : "<li>No grade revision has been recorded.</li>";
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
      pauseAllAudio(elements.evidenceAudio);
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

  async function saveFixedStaffGrade(action = "publish") {
    const publish = action === "publish";
    const readyToPublish = updateFixedRubric();
    if (!publish && workflowOf(selectedStaffSubmission) === "published") return;
    const inputs = fixedRubricInputs();
    const rubric = Object.fromEntries(Object.entries(inputs).filter(([, input]) => input?.value !== "").map(([key, input]) => [key, Number(input.value)]));
    const completeRubric = RUBRIC.every((criterion) => Number.isFinite(rubric[criterion.key]) && rubric[criterion.key] >= 1 && rubric[criterion.key] <= 10);
    if (!selectedStaffSubmission || (publish && (!completeRubric || !readyToPublish))) return;
    let reason = "";
    if (workflowOf(selectedStaffSubmission) === "published") {
      reason = String(window.prompt("Reason for changing an already published official grade:", "") || "").trim();
      if (!reason) return;
    }
    setDisabled(elements.publishGradeButton, true);
    setDisabled(elements.saveGradeDraftButton, true);
    setText(elements.publishStatus, publish ? "Publishing the official grade and feedback in Grades." : "Saving a private grading draft. The student cannot see it yet.");
    try {
      const mutation = buildGradeMutation(publish ? "publish" : "draft", selectedStaffSubmission, rubric, elements.teacherFeedback.value, reason, createId(publish ? "bfo-grade-publish" : "bfo-grade-draft"));
      const result = await request(API.grade, jsonOptions("PUT", mutation), 2);
      requireContract(isSubmissionContract(result.data.submission), "invalid_grade_acknowledgement", result.data);
      selectedStaffSubmission = result.data.submission;
      const index = staffSubmissions.findIndex((item) => item.receiptId === selectedStaffSubmission.receiptId);
      if (index >= 0) staffSubmissions[index] = selectedStaffSubmission;
      setText(elements.publishStatus, publish ? `Published · ${selectedStaffSubmission.score50} / 50 · ${Number(selectedStaffSubmission.grade).toFixed(2)} / 5.0 · revision ${selectedStaffSubmission.gradeRevision || "confirmed"}` : `Private draft saved · revision ${selectedStaffSubmission.gradeRevision || "confirmed"}`);
      if (elements.staffReviewStatus) elements.staffReviewStatus.innerHTML = publish ? '<i class="bi bi-patch-check-fill"></i> Graded and published' : '<i class="bi bi-floppy-fill"></i> Private draft';
      renderGradeHistory(selectedStaffSubmission);
      toast(publish ? "Final Oral Task grade and feedback published." : "Private grading draft saved.", "success");
    } catch (error) {
      const conflict = ["submission_changed", "grade_conflict", "stale_grade_revision"].includes(error.data?.error) || error.status === 409;
      setText(elements.publishStatus, conflict ? "Another teacher or process changed this record. Your screen was not allowed to overwrite it; refresh before continuing." : "The grade action was not confirmed. Check the connection and retry.");
      setDisabled(elements.publishGradeButton, false);
      setDisabled(elements.saveGradeDraftButton, false);
    } finally { updateFixedRubric(); }
  }

  async function loadStaffSubmissions() {
    if (!(role === "admin" || role === "teacher") || (!elements.staffList && !elements.submissionSelector)) return;
    const staffSession = sessionGeneration;
    setText(elements.staffStatus, "Loading submitted oral exams.");
    try {
      const result = await request(API.submissions, { method: "GET" }, 2);
      if (staffSession !== sessionGeneration || !(role === "admin" || role === "teacher")) return;
      requireContract(Array.isArray(result.data.submissions), "invalid_submissions_contract", result.data);
      const items = Array.isArray(result.data.submissions) ? result.data.submissions : [];
      requireContract(items.every(isSubmissionContract), "invalid_submission_item_contract", result.data);
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

  function invalidatePreflight(message = "The microphone selection changed. Run the microphone check again before continuing.") {
    preflightPassed = false;
    preflightSampleReady = false;
    preflightPlaybackConfirmed = false;
    verifiedMicrophoneId = "";
    if (elements.preflightConfirm?.type === "checkbox") elements.preflightConfirm.checked = false;
    setDisabled(elements.preflightConfirm, true);
    enableOfficialStartIfAllowed();
    setText(elements.preflightStatus, message);
  }

  async function handleDeviceChange() {
    const expected = verifiedMicrophoneId;
    const devices = await listMicrophones().catch(() => []);
    if (expected && expected !== "default" && !devices.some((device) => device.deviceId === expected)) invalidatePreflight("The microphone used in the technical check disconnected. Select a microphone and run the check again.");
  }

  function handleOnlineConnection() {
    online = true;
    updateConnectionUi("Connection restored. Pending protected recordings are retrying now.");
    setWorkflowMessage("Connection restored", "Secure upload retry is running automatically.", "bi-arrow-repeat");
    return drainAudioQueue().then(() => {
      if (currentBlob && !savedCurrentTurn && !analyzing) return processAndSaveCurrentTurn();
      return undefined;
    }).catch(() => {});
  }

  function handleOfflineConnection() {
    online = false;
    updateConnectionUi();
    setWorkflowMessage(volatileAudioCount > 0 ? "Temporary memory only" : "Offline protection active", volatileAudioCount > 0 ? "Do not close or reload this page; reconnect before continuing." : "Finish the answer normally; it will remain on this device until reconnection.", "bi-wifi-off");
  }

  function handleVisibilityChange() {
    if (document.visibilityState === "hidden" && mediaRecorder?.state === "recording") {
      recorderFailureReason = "page_hidden";
      stopRecording();
      setText(elements.recordStatus, "Recording stopped safely because the exam moved to the background.");
    }
  }

  function handlePageHide() {
    pageClosing = true;
    if (mediaRecorder?.state === "recording") stopRecording();
    releaseAttemptLease();
  }

  function handleBeforeUnload(event) {
    if (mediaRecorder?.state === "recording") stopRecording();
    if (!hasUnsavedAudio()) return;
    event.preventDefault();
    event.returnValue = "";
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
    elements.claimPairingCode?.addEventListener("keydown", (event) => { if (event.key === "Enter") submitStudentClaim(); });
    elements.preflight?.addEventListener("click", runPreflight);
    elements.preflightConfirm?.addEventListener(elements.preflightConfirm.type === "checkbox" ? "change" : "click", confirmPreflight);
    elements.start?.addEventListener("click", () => attempt ? resumeAttempt() : startAttempt());
    elements.resume?.addEventListener("click", resumeAttempt);
    elements.questionPlay?.addEventListener("click", playCurrentQuestion);
    elements.mic?.addEventListener("click", startRecording);
    elements.dockMic?.addEventListener("click", startRecording);
    elements.stop?.addEventListener("click", stopRecording);
    elements.dockStop?.addEventListener("click", stopRecording);
    elements.retry?.addEventListener("click", processCapturedTurn);
    elements.recordAgain?.addEventListener("click", resetFailedRecording);
    elements.next?.addEventListener("click", nextTurn);
    elements.submit?.addEventListener("click", submitExam);
    elements.submitConfirmation?.addEventListener("change", renderReadyToSubmit);
    elements.adminOpen?.addEventListener("click", () => updateAdminState(true));
    elements.adminClose?.addEventListener("click", () => updateAdminState(false));
    elements.adminSaveWindow?.addEventListener("click", saveAdminWindow);
    elements.adminPreviewButton?.addEventListener("click", startAdminPreview);
    elements.adminPreviewPrevious?.addEventListener("click", () => moveAdminPreview(-1));
    elements.adminPreviewNext?.addEventListener("click", () => moveAdminPreview(1));
    elements.adminPreviewExit?.addEventListener("click", () => finishAdminPreview(false));
    elements.staffRefresh?.addEventListener("click", loadStaffSubmissions);
    elements.adminMonitorRefresh?.addEventListener("click", () => loadState(false));
    elements.adminReconcile?.addEventListener("click", reconcileGrades);
    elements.adminRosterBody?.addEventListener("click", (event) => {
      const button = event.target.closest?.("[data-student-action]");
      if (button) runStudentAction(button);
    });
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
    elements.saveGradeDraftButton?.addEventListener("click", () => saveFixedStaffGrade("draft"));
    elements.publishGradeButton?.addEventListener("click", () => saveFixedStaffGrade("publish"));
    elements.copyReceipt?.addEventListener("click", async () => {
      const code = submission?.receiptId || elements.receipt?.textContent || "";
      try { await navigator.clipboard.writeText(code); toast("Confirmation code copied.", "success"); } catch { toast(`Confirmation code: ${code}`, ""); }
    });
    const handleMicrophoneSelectionChange = (event) => {
      if (recordingStartPending || analyzing || mediaRecorder?.state === "recording" || preflightRecorder?.state === "recording") {
        toast("Finish the current microphone step before changing devices.", "error");
        return;
      }
      stopMediaStream();
      const source = event.currentTarget || elements.microphoneSelect;
      selectedMicrophoneId = source?.value || "";
      [elements.preflightMicrophoneSelect, elements.microphoneSelect].filter(Boolean).forEach((target) => {
        if (target !== source && Array.from(target.options).some((option) => option.value === selectedMicrophoneId)) target.value = selectedMicrophoneId;
      });
      invalidatePreflight();
    };
    elements.microphoneSelect?.addEventListener("change", handleMicrophoneSelectionChange);
    elements.preflightMicrophoneSelect?.addEventListener("change", handleMicrophoneSelectionChange);
    elements.preflightPlayback?.addEventListener("play", () => pauseAllAudio(elements.preflightPlayback));
    elements.preflightPlayback?.addEventListener("ended", () => {
      if (!preflightSampleReady) return;
      preflightPlaybackConfirmed = true;
      setText(elements.preflightStatus, "Voice sample played successfully. Confirm independent work to enable the official attempt.");
      setDisabled(elements.preflightConfirm, false);
      if (elements.preflightConfirm?.checked) confirmPreflight();
    });
    [elements.welcomeAudio, elements.instructionsAudio, elements.studentAudio, elements.evidenceAudio].filter(Boolean).forEach((audio) => audio.addEventListener("play", () => pauseAllAudio(audio)));
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
    elements.takeOverSession?.addEventListener("click", async () => {
      leaseChannel?.postMessage?.({ type: "takeover", tabId, attemptId: activeLeaseAttemptId });
      claimAttemptLease(true);
      try {
        await renewServerLease("acquire");
        scheduleServerLeaseRenewal();
        toast("This tab now holds the active exam controls.", "success");
      } catch {
        leaseReadOnly = true;
        renderLeaseState();
        toast("The server still protects another active session. Wait for it to close or ask the teacher for recovery.", "error");
      }
    });
    navigator.mediaDevices?.addEventListener?.("devicechange", handleDeviceChange);
    window.addEventListener("online", handleOnlineConnection);
    window.addEventListener("offline", handleOfflineConnection);
    window.addEventListener("storage", (event) => {
      if (activeLeaseAttemptId && event.key === leaseKey()) claimAttemptLease(false);
    });
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("pageshow", () => { pageClosing = false; if (attempt?.attemptId) activateAttemptLease(attempt.attemptId); });
    window.addEventListener("beforeunload", handleBeforeUnload);
  }

  bindEvents();
  updateSpeedButtons();
  setHidden(elements.exam, true);
  setHidden(elements.ready, true);
  setHidden(elements.complete, true);
  setHidden(elements.staff, true);
  setHidden(elements.dock, true);
  setHidden(elements.adminPreviewToolbar, true);
  setDisabled(elements.preflightConfirm, true);
  setEvidenceControlsEnabled(false);
  updateConnectionUi();
  purgeExpiredQueuedAudio().catch(() => {}).finally(() => refreshQueuedAudioCount().catch(() => {}));
  loadState(false);
  window.setInterval(() => {
    const current = readUser();
    const credential = current?.credential || "";
    if (credential === lastCredential) return;
    const accountChanged = accountScope(current) !== accountScope(user);
    lastCredential = credential;
    resetProtectedSession({ clearClaim: accountChanged, purgeAudio: accountChanged, audioScope: accountScope(user) });
    user = current;
    if (user) loadState(false);
    else {
      showAccess("You signed out. Sign in again to access the Final Oral Task.", "login");
      openLogin();
    }
  }, 1400);
})();
