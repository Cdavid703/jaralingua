"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const jsPath = path.join(root, "assets", "js", "english-basic-final-oral-task.js");
const htmlPath = path.join(root, "ingles", "basico", "basic-course-1-final-oral-task.html");
const cssPath = path.join(root, "assets", "css", "english-basic-final-oral-task.css");
const scriptsPath = path.join(root, "ingles", "basico", "audio", "final-oral-task-real", "scripts.md");
const publicAudioDir = path.dirname(scriptsPath);
const protectedPromptDir = path.join(root, "server", "private_assets", "basic-final-oral-prompts");
const imageDir = path.join(root, "assets", "img", "english-basic", "final-oral-task-real");
const generatorPath = path.join(root, "tools", "generate_basic_final_oral_task_real_audio.ps1");
const serverPath = path.join(root, "server", "progress_api.py");

const source = fs.readFileSync(jsPath, "utf8");
const html = fs.readFileSync(htmlPath, "utf8");
const css = fs.readFileSync(cssPath, "utf8");
const scriptsSource = fs.readFileSync(scriptsPath, "utf8");
const generator = fs.readFileSync(generatorPath, "utf8");
const server = fs.readFileSync(serverPath, "utf8");

function parseScripts(markdown) {
  const lines = markdown.split(/\r?\n/);
  const items = new Map();
  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].match(/^###\s+`([^`]+\.mp3)`\s*$/);
    if (!match) continue;
    const text = [];
    for (let cursor = index + 1; cursor < lines.length && !/^#{2,3}\s+/.test(lines[cursor]); cursor += 1) {
      if (lines[cursor].trim()) text.push(lines[cursor].trim());
    }
    assert(!items.has(match[1]), `Duplicate script: ${match[1]}`);
    items.set(match[1], text.join(" "));
  }
  return items;
}

const sandbox = {
  window: {},
  document: { getElementById: () => null },
  console,
  URL,
  setTimeout,
  clearTimeout
};
sandbox.window.window = sandbox.window;
vm.runInNewContext(source, sandbox, { filename: jsPath });
const api = sandbox.window.__JaraLinguaBasicFinalOralTaskTest;
assert(api, "Frontend test contract was not exported");

const scripts = parseScripts(scriptsSource);
assert.strictEqual(scripts.size, 57, "The approved Daniel audio bank must contain 57 unique clips");
for (const fileName of scripts.keys()) {
  const protectedPrompt = /^unit-[1-6]-[abc]\.mp3$/.test(fileName) || fileName === "interaction-a.mp3";
  const expectedPath = path.join(protectedPrompt ? protectedPromptDir : publicAudioDir, fileName);
  assert(fs.existsSync(expectedPath) && fs.statSync(expectedPath).size > 1000, `Missing generated audio: ${fileName}`);
  if (protectedPrompt) assert(!fs.existsSync(path.join(publicAudioDir, fileName)), `Protected question leaked into public audio: ${fileName}`);
}
[
  "hero-v1.webp", "daniel-carter-portrait-v1.webp",
  "unit-1-v1.webp", "unit-2-v1.webp", "unit-3-v1.webp",
  "unit-4-v1.webp", "unit-5-v1.webp", "unit-6-v1.webp",
  "interaction-v1.webp"
].forEach((fileName) => assert(fs.existsSync(path.join(imageDir, fileName)), `Missing professional image: ${fileName}`));
assert.strictEqual(api.REQUIRED_TURNS, 7, "The official attempt must require exactly seven recordings");
assert.strictEqual(api.isAttemptContract({ attemptId: "A1", assignedQuestions: [], turns: {} }), true, "Valid attempt acknowledgement rejected");
assert.strictEqual(api.isAttemptContract({ assignedQuestions: [], turns: {} }), false, "Attempt without server id must be rejected");
const secureQuestionSet = Array.from({ length: 7 }, (_value, index) => ({ turnId: index === 6 ? "interaction" : `unit-${index + 1}`, variantId: `variant-${index + 1}`, unit: index === 6 ? "interaction" : String(index + 1), question: `Question ${index + 1}`, promptAudioUrl: `/api/basic-final-oral/audio?prompt=${index + 1}`, sequence: index + 1 }));
assert.strictEqual(api.isScopedAttemptContract({ attemptId: "A1", attemptScopeToken: "scope", transcriberScopeToken: "speech", transcriberScopeExpiresAt: "2099-01-01T00:00:00Z", lease: null, assignedQuestions: secureQuestionSet, turns: {} }), true, "A resumed scoped attempt must remain recoverable after its page-release lease is cleared");
assert.strictEqual(api.isSecureAttemptContract({ attemptId: "A1", attemptScopeToken: "scope", transcriberScopeToken: "speech", transcriberScopeExpiresAt: "2099-01-01T00:00:00Z", lease: { leaseId: "lease", expiresAt: "2099-01-01T00:00:00Z" }, assignedQuestions: secureQuestionSet, turns: {} }), true, "Secure attempt acknowledgement rejected");
assert.strictEqual(api.isSecureAttemptContract({ attemptId: "A1", assignedQuestions: [], turns: {} }), false, "Attempt without mutation, speech, and lease scopes must fail closed");
assert.strictEqual(api.isTurnContract({ turnId: "unit-1", verification: { audioVerified: true } }), true, "Verified audio turn acknowledgement rejected");
assert.strictEqual(api.isTurnContract({ turnId: "unit-1" }), false, "Unverified 2xx turn body must be rejected");
assert.strictEqual(api.isSubmissionContract({ receiptId: "R1", attemptId: "A1", submittedAt: "2026-07-21T12:00:00Z", workflowStatus: "pending_review" }), true, "Valid receipt acknowledgement rejected");
assert.strictEqual(api.isSubmissionContract({ status: "submitted" }), false, "Submission without receipt must be rejected");
assert.strictEqual(api.workflowOf({ workflowStatus: "complete_pending_submit" }), "complete_pending_submit");
const frozenAudioHash = "a".repeat(64);
const draftMutation = api.buildGradeMutation("draft", { studentId: "S1", receiptId: "R1", gradeRevision: 4, turns: [{ turnId: "unit-1", audio: { sha256: frozenAudioHash } }], teacherEvidence: { general: "Reviewed against the rubric." } }, { fluency: 7 }, "Private note", "", "REQ-DRAFT");
assert.strictEqual(draftMutation.action, "draft");
assert.strictEqual(draftMutation.expectedRevision, 4, "Draft must protect the current grade revision");
assert.strictEqual(draftMutation.requestId, "REQ-DRAFT", "Draft save must be idempotent");
assert.deepStrictEqual(JSON.parse(JSON.stringify(draftMutation.reviewedAudioEvidence)), [{ turnId: "unit-1", sha256: frozenAudioHash }], "Grade mutation must bind the frozen reviewed audio hash");
assert.deepStrictEqual(JSON.parse(JSON.stringify(draftMutation.teacherEvidence)), { general: "Reviewed against the rubric." }, "Teacher evidence must remain a textual object, not an audio-hash array");
const publishMutation = api.buildGradeMutation("publish", { studentId: "S1", receiptId: "R1", gradeRevision: 5, turns: [] }, { fluency: 8 }, "Published feedback", "Correction reason", "REQ-PUBLISH");
assert.strictEqual(publishMutation.action, "publish");
assert.strictEqual(publishMutation.expectedRevision, 5, "Publish must compare the latest grade revision");
assert.strictEqual(publishMutation.reason, "Correction reason", "Published-grade corrections need an auditable reason");
assert.strictEqual(Object.values(api.TURN_LIMIT_SECONDS).reduce((sum, value) => sum + value, 0), 315, "Seven recording caps must allow up to 45 seconds per answer");
assert.deepStrictEqual(Array.from(api.RUBRIC, (item) => item.key), [
  "taskCompletion", "interactionDiscourse", "fluency", "vocabularyStructure", "pronunciation"
]);

const expectedEndpoints = {
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
  speechHealth: "/api/english-basic/pronunciation-health"
};
Object.entries(expectedEndpoints).forEach(([key, value]) => {
  assert.strictEqual(api.API[key], value, `Frontend endpoint mismatch: ${key}`);
  if (key !== "speechHealth") assert(server.includes(value), `Backend route is missing: ${value}`);
});
assert(server.includes('"promptAudioUrl": "/api/basic-final-oral/audio?"'), "Assigned questions must expose authenticated prompt audio URLs");
assert(source.includes("question?.promptAudioUrl || question?.audioUrl"), "Frontend must consume the server-provided protected prompt URL");
assert(!source.includes("promptAudioId || question?.variantId"), "Frontend must not reconstruct predictable prompt MP3 URLs");

const serverQuestions = [];
const questionPattern = /"question":\s*"([^"]+)"[\s\S]{0,220}?"promptAudioId":\s*"([^"]+)"/g;
let questionMatch;
while ((questionMatch = questionPattern.exec(server))) serverQuestions.push({ text: questionMatch[1], audioId: questionMatch[2] });
assert.strictEqual(serverQuestions.length, 19, "Backend must expose 18 unit variants plus one interaction prompt");
serverQuestions.forEach(({ text, audioId }) => {
  assert.strictEqual(scripts.get(`${audioId}.mp3`), text, `ElevenLabs prompt is not identical to backend question ${audioId}`);
});

for (let unit = 1; unit <= 6; unit += 1) {
  const variants = serverQuestions.filter(({ audioId }) => audioId.startsWith(`unit-${unit}-`));
  assert.strictEqual(variants.length, 3, `Unit ${unit} must have exactly three server-assigned variants`);
  ["a", "b", "c"].forEach((letter) => assert(scripts.has(`unit-${unit}-${letter}.mp3`)));
}
assert(scripts.has("interaction-a.mp3"));
assert(scripts.get("interaction-a.mp3").includes("two different questions"));

const routerCases = [
  ["What do you usually do in the morning?", "answer-routine.mp3"],
  ["What do you do in your free time?", "answer-free-time.mp3"],
  ["Where is Central Park?", "answer-location-park.mp3"],
  ["Where is the public library?", "answer-location-library.mp3"],
  ["Where is the restaurant?", "answer-location-food.mp3"],
  ["Where is the supermarket?", "answer-location-shopping.mp3"],
  ["Where is Lincoln School?", "answer-location-school.mp3"],
  ["Is there a hospital near your home?", "answer-existence-singular.mp3"],
  ["Are there any cafes?", "answer-existence-plural.mp3"],
  ["What can people do in the park?", "answer-activity-park.mp3"],
  ["What can people do at the library?", "answer-activity-study.mp3"],
  ["What can people do at Green Cafe?", "answer-activity-food.mp3"],
  ["What can people do at the supermarket?", "answer-activity-shopping.mp3"],
  ["What can people do at the gym?", "answer-activity-gym.mp3"],
  ["Do you like your neighborhood?", "answer-like-neighborhood.mp3"],
  ["What is your favorite place?", "answer-favorite-place.mp3"],
  ["Which place do you recommend?", "answer-recommend-place.mp3"],
  ["How far is the library from your home?", "answer-distance.mp3"],
  ["How can I get to the library?", "answer-directions.mp3"],
  ["What is your neighborhood like?", "answer-neighborhood-description.mp3"],
  ["Where is the airport?", "answer-unknown-question.mp3"]
];
routerCases.forEach(([question, expectedFile]) => {
  const answer = api.studentQuestionResponseFor(question);
  assert.strictEqual(answer.file, expectedFile, `Incoherent Daniel answer for: ${question}`);
  assert.strictEqual(scripts.get(answer.file), answer.text, `Daniel response text/audio drift: ${answer.file}`);
});

const split = api.questionSegments("What do you do in your free time? Where is the library?");
assert.strictEqual(split.length, 2, "The final interaction must separate two student questions");
const interactionResponses = api.responsesForTurn({ unit: "interaction" }, "What do you do in your free time? Where is the library?");
assert.deepStrictEqual(Array.from(interactionResponses, (item) => item.file), ["answer-free-time.mp3", "answer-location-library.mp3"]);

Object.values(api.DANIEL_ANSWERS).forEach((answer) => {
  assert.strictEqual(scripts.get(answer.file), answer.text, `Missing or mismatched Daniel clip: ${answer.file}`);
});
Object.values(api.TURN_REACTIONS).forEach((answer) => {
  assert.strictEqual(scripts.get(answer.file), answer.text, `Missing or mismatched neutral turn reaction: ${answer.file}`);
});

assert(source.includes("audioDataUrl"), "Official turn must upload its audio evidence");
assert(source.includes("attemptScopeToken"), "Turn and submit mutations must carry the server-issued attempt scope token");
assert(source.includes("leaseId: serverLeaseId") && source.includes('action: "release"'), "Server lease must protect turn and submit mutations and be released explicitly");
assert(source.includes("clientTurnId"), "Turn saves must be idempotent");
assert(source.includes("clientSubmissionId"), "Final submit must be idempotent");
assert(source.includes("revision"), "Attempt saves must use optimistic revisions");
assert(source.includes("MediaRecorder"), "Cross-device microphone recording is missing");
assert(source.includes("audio/mp4"), "iPhone-compatible MediaRecorder fallback is missing");
assert(source.includes("audio/webm"), "Android/desktop MediaRecorder format is missing");
assert(source.includes("X-Jaralingua-Language\"] = \"en\"") || source.includes('"X-Jaralingua-Language": "en"'), "Whisper language must be fixed to English");
assert(source.includes('"X-Jaralingua-Workload": officialStudent ? "final-oral" : "practice"'), "Official students must use the dedicated final-oral queue while the non-persistent admin preview uses practice scope");
assert(source.includes('"X-Jaralingua-Exam-Scope": attempt.transcriberScopeToken') && source.includes("refreshAttemptSecurityScope"), "Official transcription needs a refreshable signed exam scope");
assert(source.includes("const TRANSCRIPTION_TIMEOUT_MS = 120000") && /timeout: TRANSCRIPTION_TIMEOUT_MS\s*\n\s*\}, 1\)/.test(source), "Non-blocking transcription must use one nginx-aligned request without duplicate timeout retries");

const officialProcessor = source.match(/async function processAndSaveCurrentTurn\(\)\s*\{([\s\S]*?)\n  \}\n\n  function showTechnicalRecovery/);
assert(officialProcessor, "Could not isolate the audio-first official processor");
const processorBody = officialProcessor[1];
assert(processorBody.indexOf("putQueuedAudio(record)") >= 0, "Original audio must enter the durable local queue");
assert(processorBody.indexOf("putQueuedAudio(record)") < processorBody.indexOf("uploadQueuedRecord(record)"), "Audio must be protected locally before server upload");
assert(processorBody.indexOf("uploadQueuedRecord(record)") < processorBody.indexOf("transcribeSavedAudio(record)"), "Server audio acknowledgement must precede transcription");
assert(!processorBody.includes("await requestTranscription"), "Official progress must never wait for transcription before saving audio");
assert(source.includes('transcriptStatus: transcript ? "complete" : "pending"'), "Turn contract needs an explicit pending transcript state");
assert(source.includes("Transcription continues separately and does not block"), "Pending transcription must be explicitly non-blocking");
assert(source.includes("indexedDB.open(AUDIO_QUEUE_DB, AUDIO_QUEUE_DB_VERSION)") && source.includes('createObjectStore(AUDIO_QUEUE_STORE, { keyPath: "queueId" })'), "Versioned IndexedDB durable audio queue is missing");
assert(source.includes('createIndex(AUDIO_QUEUE_SCOPE_INDEX, "scope"') && source.includes('createIndex(AUDIO_QUEUE_SCOPE_ATTEMPT_INDEX, ["scope", "attemptId"]') && source.includes('createIndex(AUDIO_QUEUE_EXPIRY_INDEX, "expiresAtMs"'), "Audio queue must index account, attempt, and expiry without materializing every account blob");
assert(source.includes("AUDIO_QUEUE_TTL_MS") && source.includes("purgeExpiredQueuedAudio") && source.includes("clearQueuedAudio(accountScope(), submission?.attemptId"), "Sensitive queued audio needs TTL and post-submission cleanup");
assert(!/objectStore\(AUDIO_QUEUE_STORE\)\.getAll\(\)/.test(source), "Audio queue must never materialize every account's blobs");
assert(source.includes("durable: false") && source.includes("Do not close or reload this page"), "Volatile fallback must be explicit and warn against closing or reloading");
assert(source.includes("await deleteQueuedAudio(record.queueId)") && source.indexOf("await deleteQueuedAudio(record.queueId)") > source.indexOf('saveCurrentTurn("", dataUrl'), "Queued blob must only clear after the server turn acknowledgement");
assert(source.includes('window.addEventListener("online"') && source.includes("drainAudioQueue()"), "Reconnection must automatically drain the protected queue");
assert(source.includes("renderRecoveredQueuedTurn(record, savedTurn)") && source.includes("no second recording is required"), "A queue recovered after reload must unlock Continue instead of asking for a duplicate answer");
assert(source.includes('window.addEventListener("offline"'), "Offline state must be visible and handled");
assert(source.includes('window.addEventListener("pagehide"') && source.includes('document.addEventListener("visibilitychange"'), "Mobile lifecycle guards are incomplete");
assert(source.includes('navigator.mediaDevices?.addEventListener?.("devicechange"'), "Microphone device changes must be monitored");
assert(source.includes('mediaRecorder.addEventListener("error"') && source.includes('activeTrack?.addEventListener("ended", handleMicrophoneTrackEnded'), "Recorder and microphone track failure handlers are required");
assert(source.includes("if (!recordingDurationMs && recordingStartedAt)"), "Spontaneous recorder stops must calculate real elapsed duration");
assert(source.includes("MICROPHONE_TIMEOUT_MS") && source.includes("getUserMediaWithTimeout"), "getUserMedia needs a finite timeout");
assert(source.includes("preflightVoicePeak >= 4") && source.includes("preflightPlaybackConfirmed"), "Preflight must detect voice and require sample playback");
assert(source.includes("verifiedMicrophoneId") && source.includes("invalidatePreflight"), "The verified microphone must remain synchronized and invalidate on change");
assert(source.includes("safeStorageGet(key)") && source.includes("safeStorageSet(key, value)"), "Idempotency needs a private-mode storage fallback");
const submissionIdSource = source.match(/function submissionId\(\)\s*\{([\s\S]*?)\n  \}/);
assert(submissionIdSource && !submissionIdSource[1].includes("localStorage."), "Submission idempotency must not directly depend on localStorage");
assert(source.includes("invalid_json_response") && source.includes("invalid_turn_acknowledgement") && source.includes("invalid_submit_acknowledgement"), "2xx responses need schema/JSON validation before UI success");
assert(source.includes("promptPrefetch") && source.includes('error?.name === "NotAllowedError"'), "Protected Daniel audio needs Safari/iOS gesture recovery");
assert(source.includes("pauseAllAudio(elements.questionAudio)") && source.includes("pauseAllAudio();"), "Prompt, reaction and microphone audio must never overlap");
assert(source.includes("BroadcastChannel") && source.includes("LEASE_TTL_MS") && source.includes("claimAttemptLease"), "Two-tab lease protection is missing");
assert(source.includes('"attempt_lease_required", "attempt_lease_expired", "attempt_in_use"') && source.includes("recoverServerLease"), "Canonical server-lease failures need one secure reacquisition path");
assert(source.includes("deviceId: deviceInstanceId") && source.includes("sessionStorage.getItem(DEVICE_KEY)"), "Every protected mutation needs a tab-session device id");
assert(source.includes("serverLeaseUsable()") && source.includes("SERVER_LEASE_SAFETY_MS"), "Lease expiry must be checked before upload and submission");
assert(source.includes("return saveCurrentTurn(transcript, dataUrl, allowStaleRetry, saveContext, false)") && source.includes("record.transcriptClientTurnId = record.transcriptClientTurnId ||"), "Turn and transcript lease retries must preserve their idempotency identifiers");
assert(source.includes("renderAdminMonitor") && source.includes("loadAdminHealth") && source.includes("reconcileGrades") && source.includes("runStudentAction"), "Administrator health, roster, reconciliation and recovery controls are incomplete");
assert(source.includes("API.speechHealth") && html.includes('data-health="speech"') && html.includes('data-health="weights"') && html.includes('data-health="audit"'), "Admin health must include speech capacity, weights, and audit state");
assert(source.includes("buildGradeMutation") && source.includes("expectedRevision") && source.includes("gradeHistory"), "Draft/publish grading needs optimistic revision and history support");
assert(source.includes("reviewedAudioEvidence") && source.includes("turn?.audio?.sha256") && source.includes("teacherEvidence"), "Grading must bind frozen audio hashes separately from textual teacher evidence");
assert(source.includes('setHidden(elements.saveGradeDraftButton, alreadyPublished)') && source.includes('if (!publish && workflowOf(selectedStaffSubmission) === "published") return'), "A published grade must only accept a revisioned publish with a reason, never a downgrade back to draft");
assert(source.includes('const reviewed = workflow === "published"') && source.includes('const status = workflow === "published"'), "Private grading drafts must never appear as a published result in the student receipt workflow");
assert(source.includes("data-final-oral-speed"));
assert(!source.includes("data-final-oral-speed=\"1.25\""));
assert(!source.includes("frames:"), "Real exam must not expose answer frames");
assert(!source.includes("vocabulary:"), "Real exam must not expose vocabulary hints");
assert(source.includes("No answer model, vocabulary hint, or correction"), "Real-exam no-help notice is missing");
assert(html.includes('id="claimStudentPanel"'), "Inline document-claim panel is missing");
assert(html.includes('id="claimStudentIdInput"'), "Inline document-number input is missing");
assert(html.includes('id="claimPairingCodeInput"'), "Temporary secure pairing-code input is missing");
assert(html.includes('id="claimStudentButton"'), "Inline document verification button is missing");
assert(/id="signInButton"[^>]*data-open-google-login/.test(html), "The internal sign-in button must be recognized as an external auth trigger");
assert(!/\.official-oral-page\s+\.jaralingua-auth\s*>\s*\.auth-trigger\s*\{[^}]*display\s*:\s*none/i.test(css), "The floating course login must remain visible");
assert(source.includes('event?.stopPropagation?.()'), "The internal sign-in click must not be closed by the global outside-click handler");
assert(source.includes('document.querySelector("[data-auth-toggle]") || document.querySelector("[data-auth-nav-toggle]")'), "Sign-in must prefer the floating trigger and retain the nav fallback");
assert(source.includes('headers["X-Jaralingua-Student-Id-Claim"] = claim'), "Document claim must travel in the authenticated request header");
assert(source.includes('const CLAIM_KEY = "jaralingua_basic_final_oral_student_claim_v2"'), "The official exam needs a dedicated document-claim key");
assert(source.includes("JSON.stringify({ scope, value: normalized })"), "Document claims must be stored with their authenticated account scope");
assert(source.includes("stored?.scope === accountScope(account)"), "A document claim must never cross over to another signed-in account");
assert(source.includes("credential === lastCredential") && source.includes("purgeAudio: accountChanged"), "Sign-out and account switches must reset protected exam state and purge sensitive local audio");
assert(source.includes("stateLoadGeneration") && source.includes("readUser()?.credential !== requestedCredential"), "Late state responses from a previous account must be ignored");
assert(source.includes("totalRecordedDuration() + activeRecording + capturedUnsaved"), "Visible timer must measure recorded speaking time, not network or reading time");
assert(html.includes('aria-label="Recorded speaking time"'), "Speaking-time indicator needs an accessible label");

assert(generator.includes('ErXwobaYiN019PkySvjV'), "Generator must reuse the approved restaurant-coach male voice");
assert(generator.includes("Expected 57 approved audio scripts"));
assert(generator.includes("server\\private_assets\\basic-final-oral-prompts"), "Official question audio must generate outside the public web asset tree");
assert(generator.includes("[switch]$DryRun"));
assert(generator.includes("[string[]]$Only"));

const openLoginSource = source.match(/function openLogin\(event\)\s*\{([\s\S]*?)\n  \}\n\n  function promptStudentClaim/);
assert(openLoginSource, "Could not isolate the sign-in controller for functional testing");
let floatingClicks = 0;
let navClicks = 0;
let stoppedClicks = 0;
let loginToast = "";
const loginSandbox = {
  document: {
    querySelector(selector) {
      if (selector === "[data-auth-toggle]" && floatingClicks >= 0) return { click: () => { floatingClicks += 1; } };
      if (selector === "[data-auth-nav-toggle]") return { click: () => { navClicks += 1; } };
      return null;
    }
  },
  window: { setTimeout: (callback) => callback() },
  toast: (message) => { loginToast = message; }
};
const testedOpenLogin = vm.runInNewContext(`(function openLogin(event) {${openLoginSource[1]}\n})`, loginSandbox);
testedOpenLogin({ stopPropagation: () => { stoppedClicks += 1; } });
assert.strictEqual(stoppedClicks, 1, "Internal sign-in must stop the outside-click closer");
assert.strictEqual(floatingClicks, 1, "Internal sign-in must activate the floating login control");
assert.strictEqual(navClicks, 0, "Nav fallback must not supersede an available floating login");
assert.strictEqual(loginToast, "", "Working sign-in must not show a loading error");

[
  "activateExamButton", "deactivateExamButton", "signInButton", "refreshAccessButton", "claimStudentButton",
  "adminPreviewButton", "adminPreviewPreviousButton", "adminPreviewNextButton", "adminPreviewExitButton",
  "saveExamWindowButton", "refreshAdminMonitorButton", "reconcileGradesButton", "takeOverSessionButton",
  "welcomePlayButton", "instructionsPlayButton", "preflightButton", "startExamButton", "questionPlayButton",
  "micButton", "stopButton", "nextTurnButton", "retryProcessingButton", "recordAgainButton", "submitExamButton", "copyReceiptButton",
  "refreshSubmissionsButton", "evidencePlayButton", "saveGradeDraftButton", "publishGradeButton", "floatingMicButton", "floatingStopButton"
].forEach((id) => {
  assert(html.includes(`id="${id}"`), `Interactive button missing from HTML: ${id}`);
  assert(source.includes(`"${id}"`), `Interactive button is not mapped in JavaScript: ${id}`);
});
assert(html.includes('id="examSystemStrip"') && html.includes('id="tabLeaseAlert"'), "Students need visible connection, queue and duplicate-tab status");
assert(html.includes('id="responseSecurityPipeline"') && html.includes('data-pipeline-step="audio"'), "Audio-first acknowledgement pipeline is missing");
assert(html.includes('id="submissionWorkflow"') && html.includes('data-workflow-step="grades"'), "Receipt/Grades workflow must be visible");
assert(html.includes('id="adminHealthGrid"') && html.includes('id="adminRosterBody"'), "Administrator operational monitor is missing");
assert(html.includes('id="gradeHistoryList"'), "Published grade revisions need a visible history");
assert(/id="busyOverlay"[^>]*role="status"[^>]*aria-live="assertive"[^>]*tabindex="-1"/.test(html), "Busy overlay needs focusable live status semantics");
assert(/id="turnProgressTrack"[^>]*role="progressbar"[^>]*aria-valuenow="0"/.test(html), "Interview progress requires real progressbar semantics");
assert(/id="levelMeterTrack"[^>]*role="progressbar"/.test(html), "Microphone level requires progressbar semantics");
assert(css.includes(".official-mic-button:disabled") && css.includes(".floating-action:disabled"), "Microphone controls need unmistakable disabled styling");
assert(css.includes(".admin-roster-table") && css.includes(".response-security-pipeline") && css.includes("@media (max-width: 620px)"), "New safeguard UI must remain responsive");
assert(source.includes("setDisabled(elements.next, false)"), "Continue must unlock after Daniel's saved-response reaction");
assert(source.includes("if (!savedCurrentTurn || reactionBusy) return"), "Continue must remain guarded until the response is saved");
assert(source.includes('const events = ["ended", "error", "stalled", "abort"]'), "Daniel's reaction must recover from interrupted media events");
assert(source.includes("window.setTimeout(finish, 12000)"), "Daniel's reaction needs a watchdog so Continue cannot remain locked forever");
assert(/finally\s*\{[\s\S]*?setDisabled\(elements\.next, false\)/.test(source), "Continue must unlock in the reaction cleanup path");
assert(html.includes('id="technicalRecoveryMessage"'), "Technical recovery needs a visible specific message");
assert(source.includes("recordingStartPending") && source.includes("if (!questionHeard || analyzing || savedCurrentTurn || recordingStartPending"), "Rapid microphone taps must not start concurrent recorders");
assert(source.includes("setDisabled(elements.microphoneSelect, controlsBusy)"), "Microphone selection must lock while recording or processing");
assert(source.includes("const controller = new AbortController()") && source.includes("controller.abort(), timeoutMs"), "Protected audio requests need a timeout");
assert(source.includes("questionPlaybackWatchdog") && source.includes("}, 45000)"), "Question playback needs a watchdog for stalled media");
assert(source.includes("elements.questionAudio.dataset.turnId = turnId"), "Question audio must be bound to the active turn");
assert(source.includes('turnId !== String(currentQuestion()?.turnId || "")'), "Old question audio must not unlock a later turn's microphone");
assert(source.includes("questionAudioLoading") && source.includes("questionAudioPlaying"), "Question Play needs loading and playback guards");
assert(source.includes("submissionBusy") && source.includes("setDisabled(elements.submitConfirmation, submissionBusy)"), "Final submission controls must remain locked during delivery");
assert(/function resetProtectedSession[\s\S]*?setBusy\(false\)/.test(source), "Account changes must always clear a blocking busy overlay");
assert(source.includes("staffSession !== sessionGeneration || !(role === \"admin\" || role === \"teacher\")"), "Protected staff audio must be discarded after logout or account change");
assert(source.includes("loadToken === staffEvidenceLoadToken"), "Teacher evidence downloads must remain bound to the selected submission and tab");
assert(/id="evidencePlayButton"[^>]*disabled/.test(html), "Teacher evidence playback must start disabled without a selected submission");
assert.strictEqual((html.match(/role="tab"[^>]*disabled/g) || []).length, 7, "All seven teacher evidence tabs must start disabled");
assert(source.includes('["ArrowLeft", "ArrowRight", "Home", "End"]'), "Teacher evidence tabs need keyboard navigation");
assert(html.includes('<em id="danielStatus"><i></i><span>Ready</span></em>'), "Daniel status updates must preserve the live-state indicator");
assert(html.includes('id="adminPreviewVariant"') && html.includes("Model A") && html.includes("Model B") && html.includes("Model C"), "Administrator preview must expose all three question models");
assert(html.includes('id="adminPreviewToolbar"') && html.includes("ADMINISTRATOR PREVIEW"), "Administrator rehearsal needs an unmistakable preview banner");
assert(source.includes("payload.questionBank") && source.includes("payload.interactionQuestion"), "Administrator preview must use the read-only server question bank");
assert(source.includes("function startAdminPreview()") && source.includes("function finishAdminPreview("), "Administrator preview lifecycle is incomplete");
assert(source.includes("function processAdminPreviewTurn()") && source.includes("previewOnly: true"), "Administrator microphone rehearsal must remain non-persistent");
const isolatedAdminPreviewProcessor = source.match(/async function processAdminPreviewTurn\(\)\s*\{([\s\S]*?)\n  \}\n\n  async function processCapturedTurn/);
assert(isolatedAdminPreviewProcessor, "Could not isolate the administrator preview processor");
assert(!isolatedAdminPreviewProcessor[1].includes("API.turn") && !isolatedAdminPreviewProcessor[1].includes("API.submit") && !isolatedAdminPreviewProcessor[1].includes("saveCurrentTurn"), "Administrator rehearsal must never create a student turn or submission");
assert(source.includes("setDisabled(elements.adminPreviewExit, busy)"), "Administrator preview must not exit while recording or processing");
assert(source.includes('elements.retry?.addEventListener("click", processCapturedTurn)'), "Retry must preserve the administrator preview boundary");
assert(html.includes("Real student questions are randomized independently by unit"), "Administrator review sets must be distinguished from student randomization");
assert(server.includes('payload["questionBank"]') && server.includes('payload["interactionQuestion"]'), "Backend must expose the complete model read-only to staff");
assert(server.includes('if role not in ("admin", "teacher"):') && server.includes('"error": "prompt_not_assigned"'), "Prompt audio access must remain unrestricted for authenticated staff and assignment-bound for students");

const previewBuilderSource = source.match(/function buildAdminPreviewQuestions\(\)\s*\{([\s\S]*?)\n  \}\n\n  function updateAdminPreviewNavigation/);
assert(previewBuilderSource, "Could not isolate the administrator model builder");
const previewQuestions = vm.runInNewContext(`(() => {
  const elements = { adminPreviewVariant: { value: "1" } };
  const adminQuestionBank = Object.fromEntries(["1", "2", "3", "4", "5", "6"].map((unit) => [unit, ["a", "b", "c"].map((letter) => ({ unit, variantId: \`unit-\${unit}-\${letter}\` }))]));
  const adminInteractionQuestion = { unit: "interaction", variantId: "interaction-a" };
  const REQUIRED_TURNS = 7;
  function buildAdminPreviewQuestions() {${previewBuilderSource[1]}
  }
  return buildAdminPreviewQuestions();
})()`, {});
assert.strictEqual(previewQuestions.length, 7, "Every administrator model must cover six units and the final interaction");
assert.deepStrictEqual(Array.from(previewQuestions, (item) => item.variantId), ["unit-1-b", "unit-2-b", "unit-3-b", "unit-4-b", "unit-5-b", "unit-6-b", "interaction-a"], "Model B must select the matching server variant for every unit");
assert.deepStrictEqual(Array.from(previewQuestions, (item) => item.turnId), ["unit-1", "unit-2", "unit-3", "unit-4", "unit-5", "unit-6", "interaction"], "Administrator preview turn identities must match the real exam structure");

const previewDispatcherSource = source.match(/async function processCapturedTurn\(\)\s*\{([\s\S]*?)\n  \}\n\n  async function processAndSaveCurrentTurn/);
assert(previewDispatcherSource, "Could not isolate the captured-response dispatcher");
const previewDispatcherHarness = vm.runInNewContext(`(() => {
  let adminPreviewMode = false;
  let previewCalls = 0;
  let officialCalls = 0;
  const processAdminPreviewTurn = async () => { previewCalls += 1; };
  const processAndSaveCurrentTurn = async () => { officialCalls += 1; };
  async function processCapturedTurn() {${previewDispatcherSource[1]}
  }
  return {
    processCapturedTurn,
    setPreview: (value) => { adminPreviewMode = value; },
    counts: () => ({ previewCalls, officialCalls })
  };
})()`, {});

const responseQueueSource = source.match(/async function playResponseQueue\(responses\)\s*\{([\s\S]*?)\n  \}\n\n  function showAccess/);
assert(responseQueueSource, "Could not isolate the Continue unlock controller for functional testing");
const responseSandbox = {
  Promise,
  window: { setTimeout, clearTimeout },
  AUDIO_ROOT: "audio/",
  playbackSpeed: 1
};
const responseHarness = vm.runInNewContext(`(() => {
  let sessionGeneration = 1;
  let reactionBusy = false;
  const next = { disabled: false };
  const audio = {
    src: "",
    playbackRate: 1,
    addEventListener() {},
    removeEventListener() {},
    play() { return Promise.reject(new Error("simulated media failure")); }
  };
  const elements = { reactionAudio: audio, next, reaction: { hidden: true }, reactionText: { textContent: "" } };
  const setDisabled = (node, value) => { node.disabled = Boolean(value); };
  const setHidden = (node, value) => { node.hidden = Boolean(value); };
  const setText = (node, value) => { node.textContent = value; };
  const setDanielState = () => {};
  const updateAdminPreviewNavigation = () => {};
  const pauseAllAudio = () => {};
  async function playResponseQueue(responses) {${responseQueueSource[1]}
  }
  return { playResponseQueue, next, reactionBusy: () => reactionBusy };
})()`, responseSandbox);

const safeGetSource = source.match(/function safeStorageGet\(key\)\s*\{([\s\S]*?)\n  \}\n\n  function safeStorageSet/);
const safeSetSource = source.match(/function safeStorageSet\(key, value\)\s*\{([\s\S]*?)\n  \}\n\n  function safeStorageRemove/);
assert(safeGetSource && safeSetSource, "Could not isolate private-mode idempotency storage");
const safeStorageHarness = vm.runInNewContext(`(() => {
  const memoryStorage = new Map();
  const localStorage = { getItem: () => null, setItem: () => { throw Object.assign(new Error("quota"), { name: "QuotaExceededError" }); } };
  function safeStorageGet(key) {${safeGetSource[1]}
  }
  function safeStorageSet(key, value) {${safeSetSource[1]}
  }
  return { safeStorageGet, safeStorageSet };
})()`, { Map });
assert.strictEqual(safeStorageHarness.safeStorageSet("submission", "ID-1"), false, "Quota failure must be reported without throwing");
assert.strictEqual(safeStorageHarness.safeStorageGet("submission"), "ID-1", "Memory fallback must survive a localStorage quota failure");

const queueIndexSource = source.match(/async function readIndexedQueuedAudio\(scope, attemptId = ""\)\s*\{([\s\S]*?)\n  \}\n\n  async function deleteQueuedAudioRecord/);
const queueListSource = source.match(/async function listQueuedAudio\(scope = accountScope\(\), attemptId = ""\)\s*\{([\s\S]*?)\n  \}\n\n  async function putQueuedAudio/);
const queuePutSource = source.match(/async function putQueuedAudio\(record\)\s*\{([\s\S]*?)\n  \}\n\n  async function deleteQueuedAudio/);
const queueClearSource = source.match(/async function clearQueuedAudio\(scope, attemptId = ""\)\s*\{([\s\S]*?)\n  \}\n\n  async function refreshQueuedAudioCount/);
assert(queueIndexSource && queueListSource && queuePutSource && queueClearSource, "Could not isolate scoped durable queue logic");
const queueIndexHarness = vm.runInNewContext(`(() => {
  const calls = [];
  const IDBKeyRange = { only: (value) => ({ only: value }) };
  const AUDIO_QUEUE_SCOPE_INDEX = "scope";
  const AUDIO_QUEUE_SCOPE_ATTEMPT_INDEX = "scopeAttempt";
  const audioQueueOperation = async (_mode, operation) => operation({ index(name) { return { getAll(key) { calls.push({ name, key }); return []; } }; } });
  async function readIndexedQueuedAudio(scope, attemptId = "") {${queueIndexSource[1]}
  }
  return { readIndexedQueuedAudio, calls };
})()`, { Array });
const queueHarness = vm.runInNewContext(`(() => {
  const future = Date.now() + 60000;
  const past = Date.now() - 1;
  const memoryAudioQueue = new Map([
    ["same", { queueId: "same", scope: "scope:user", attemptId: "A1", expiresAtMs: future, source: "memory" }],
    ["memory-only", { queueId: "memory-only", scope: "scope:user", attemptId: "A1", expiresAtMs: future, source: "memory" }],
    ["foreign-memory", { queueId: "foreign-memory", scope: "scope:other", attemptId: "A1", expiresAtMs: future, source: "foreign" }]
  ]);
  const deleted = [];
  const readIndexedQueuedAudio = async () => [
    { queueId: "same", scope: "scope:user", attemptId: "A1", expiresAtMs: future, source: "indexeddb" },
    { queueId: "db-only", scope: "scope:user", attemptId: "A1", expiresAtMs: future, source: "indexeddb" },
    { queueId: "expired", scope: "scope:user", attemptId: "A1", expiresAtMs: past, source: "indexeddb" },
    { queueId: "foreign-db", scope: "scope:other", attemptId: "A1", expiresAtMs: future, source: "foreign" }
  ];
  const isExpiredQueueRecord = (record) => Number(record.expiresAtMs) <= Date.now();
  const deleteQueuedAudioRecord = async (queueId) => { deleted.push(queueId); memoryAudioQueue.delete(queueId); };
  const accountScope = () => "scope:user";
  async function listQueuedAudio(scope = accountScope(), attemptId = "") {${queueListSource[1]}
  }
  return { listQueuedAudio, deleted };
})()`, { Map, Array, Date, Promise });
const queuePutHarness = vm.runInNewContext(`(() => {
  let shouldFail = true;
  const memoryAudioQueue = new Map();
  const warnings = [];
  const AUDIO_QUEUE_TTL_MS = 86400000;
  const audioQueueOperation = async (_mode, operation) => {
    if (shouldFail) throw Object.assign(new Error("quota"), { name: "QuotaExceededError" });
    operation({ put() {} });
  };
  const toast = (message) => warnings.push(message);
  const refreshQueuedAudioCount = async () => {};
  async function putQueuedAudio(record) {${queuePutSource[1]}
  }
  return { putQueuedAudio, memoryAudioQueue, warnings, setFailure: (value) => { shouldFail = value; } };
})()`, { Map, Date, Object, Promise, Error });
const queueClearHarness = vm.runInNewContext(`(() => {
  const memoryAudioQueue = new Map([
    ["a1", { queueId: "a1", scope: "scope:a", attemptId: "A1" }],
    ["a2", { queueId: "a2", scope: "scope:a", attemptId: "A2" }],
    ["b1", { queueId: "b1", scope: "scope:b", attemptId: "B1" }]
  ]);
  const deleted = [];
  const listQueuedAudio = async (scope, attemptId) => Array.from(memoryAudioQueue.values()).filter((record) => record.scope === scope && (!attemptId || record.attemptId === attemptId));
  const deleteQueuedAudioRecord = async (queueId) => { deleted.push(queueId); memoryAudioQueue.delete(queueId); };
  const accountScope = () => "scope:b";
  const refreshQueuedAudioCount = async () => {};
  async function clearQueuedAudio(scope, attemptId = "") {${queueClearSource[1]}
  }
  return { clearQueuedAudio, memoryAudioQueue, deleted };
})()`, { Map, Array, Promise });

const onlineSource = source.match(/function handleOnlineConnection\(\)\s*\{([\s\S]*?)\n  \}\n\n  function handleOfflineConnection/);
assert(onlineSource, "Could not isolate automatic online recovery");
const onlineHarness = vm.runInNewContext(`(() => {
  let online = false;
  let currentBlob = {};
  let savedCurrentTurn = false;
  let analyzing = false;
  const events = [];
  const updateConnectionUi = () => events.push("ui-online");
  const setWorkflowMessage = () => events.push("workflow");
  const drainAudioQueue = async () => { events.push("drain"); };
  const processAndSaveCurrentTurn = async () => { events.push("retry-current"); };
  function handleOnlineConnection() {${onlineSource[1]}
  }
  return { handleOnlineConnection, events, isOnline: () => online };
})()`, { Promise });

const visibilitySource = source.match(/function handleVisibilityChange\(\)\s*\{([\s\S]*?)\n  \}\n\n  function handlePageHide/);
const unloadSource = source.match(/function handleBeforeUnload\(event\)\s*\{([\s\S]*?)\n  \}\n\n  function bindEvents/);
assert(visibilitySource && unloadSource, "Could not isolate page lifecycle guards");
const lifecycleHarness = vm.runInNewContext(`(() => {
  let recorderFailureReason = "";
  let stopCalls = 0;
  const document = { visibilityState: "hidden" };
  const mediaRecorder = { state: "recording" };
  const elements = { recordStatus: {} };
  const stopRecording = () => { stopCalls += 1; mediaRecorder.state = "inactive"; };
  const setText = () => {};
  const hasUnsavedAudio = () => true;
  function handleVisibilityChange() {${visibilitySource[1]}
  }
  function handleBeforeUnload(event) {${unloadSource[1]}
  }
  return { handleVisibilityChange, handleBeforeUnload, stopCalls: () => stopCalls, mediaRecorder };
})()`, {});

const requestSource = source.match(/async function request\(url, options = \{\}, maxAttempts = 1\)\s*\{([\s\S]*?)\n  \}\n\n  const jsonOptions/);
assert(requestSource, "Could not isolate the JSON response contract guard");
const invalidResponseHarness = vm.runInNewContext(`(() => {
  const window = { setTimeout, clearTimeout };
  const authHeaders = (value) => value;
  const isRecord = (value) => Boolean(value) && typeof value === "object" && !Array.isArray(value);
  const contractError = (code, data = null) => { const error = new Error(code); error.name = "ContractError"; error.status = 502; error.data = data; return error; };
  const fetch = async () => ({ ok: true, status: 200, text: async () => "not-json" });
  const REQUEST_TIMEOUT_MS = 1000;
  async function request(url, options = {}, maxAttempts = 1) {${requestSource[1]}
  }
  return { request };
})()`, { setTimeout, clearTimeout, AbortController, Promise, JSON, Error, Array });

const transcriptionSource = source.match(/async function requestTranscription\(blob, allowScopeRefresh = true\)\s*\{([\s\S]*?)\n  \}\n\n  function blobToDataUrl/);
assert(transcriptionSource, "Could not isolate the non-blocking transcription request");
const transcriptionHarness = vm.runInNewContext(`(() => {
  let calls = 0;
  const role = "student";
  const adminPreviewMode = false;
  const attempt = { transcriberScopeToken: "signed-scope", transcriberScopeExpiresAt: "2099-01-01T00:00:00Z" };
  const API = { transcribe: "/transcribe" };
  const TRANSCRIPTION_TIMEOUT_MS = 120000;
  const request = async () => { calls += 1; throw Object.assign(new Error("timeout"), { name: "AbortError" }); };
  const refreshAttemptSecurityScope = async () => {};
  const hasText = (value) => typeof value === "string" && value.length > 0;
  const requireContract = (condition) => { if (!condition) throw new Error("contract"); };
  async function requestTranscription(blob, allowScopeRefresh = true) {${transcriptionSource[1]}
  }
  return { requestTranscription, calls: () => calls };
})()`, { Date, Number, Object, Error, Promise, Array });

const submissionRetrySource = source.match(/async function sendFinalSubmission\(payload, allowLeaseRetry = true\)\s*\{([\s\S]*?)\n  \}\n\n  async function submitExam/);
assert(submissionRetrySource, "Could not isolate idempotent final-submission lease recovery");
const submissionRetryHarness = vm.runInNewContext(`(() => {
  let leaseVersion = 1;
  let revision = 7;
  let serverLeaseId = "lease-1";
  const calls = [];
  const API = { submit: "/submit" };
  const deviceInstanceId = "tab-device";
  const jsonOptions = (_method, payload) => ({ body: JSON.stringify(payload) });
  const ensureServerLease = async () => ({ leaseId: serverLeaseId });
  const request = async (_url, options) => {
    calls.push(JSON.parse(options.body));
    if (calls.length === 1) throw Object.assign(new Error("expired"), { status: 409, data: { error: "attempt_lease_expired" } });
    return { data: { submission: { receiptId: "R1", status: "pending_review" }, serverLeaseExpiresAt: "2099-01-01T00:00:00Z" } };
  };
  const isLeaseError = (error) => error?.status === 409 && ["attempt_lease_required", "attempt_lease_expired", "attempt_in_use"].includes(error?.data?.error);
  const recoverServerLease = async () => { leaseVersion += 1; serverLeaseId = "lease-" + leaseVersion; return true; };
  const updateServerLeaseExpiry = () => {};
  async function sendFinalSubmission(payload, allowLeaseRetry = true) {${submissionRetrySource[1]}
  }
  return { sendFinalSubmission, calls };
})()`, { JSON, Object, Error, Array, Promise });

const audioFirstHarness = vm.runInNewContext(`(() => {
  let currentBlob = { type: "audio/webm" };
  let analyzing = false;
  let sessionGeneration = 1;
  let attempt = { attemptId: "A1", attemptScopeToken: "scope", turns: {} };
  let recordingDurationMs = 1200;
  let currentQueueId = "";
  let currentClientTurnId = "client-turn";
  let currentIndex = 0;
  let online = true;
  let savedCurrentTurn = false;
  let currentTranscript = "";
  const REQUIRED_TURNS = 7;
  const elements = { recovery: {}, recordStatus: {}, saveStatus: {}, saveState: {}, answerCaptured: {}, next: {} };
  const events = [];
  const currentQuestion = () => ({ turnId: "unit-1", variantId: "unit-1-a", unit: "1" });
  const createId = (prefix) => prefix + "-id";
  const accountScope = () => "scope:user";
  const setHidden = () => {};
  const setText = () => {};
  const setDanielState = () => {};
  const setBusy = () => {};
  const setPipeline = () => {};
  const updateRecordingControls = () => {};
  const setWorkflowMessage = () => {};
  const setDisabled = () => {};
  const putQueuedAudio = async () => { events.push("indexeddb"); };
  const uploadQueuedRecord = async () => { events.push("server-audio-ack"); return { turnId: "unit-1", savedAt: "now", transcriptStatus: "pending" }; };
  const sessionChangedError = () => new Error("session_changed");
  const requireContract = (condition) => { if (!condition) throw new Error("contract"); };
  const isTurnContract = () => true;
  const transcribeSavedAudio = () => events.push("transcription-started");
  const playResponseQueue = async () => { events.push("continue-unlocked"); };
  const responsesForTurn = () => [];
  const renderLeaseState = () => {};
  let leaseReadOnly = false;
  async function processAndSaveCurrentTurn() {${processorBody}
  }
  return { processAndSaveCurrentTurn, events, saved: () => savedCurrentTurn };
})()`, { Date, Math, Object, String, Error });

(async () => {
  await queueIndexHarness.readIndexedQueuedAudio("scope:user", "A1");
  await queueIndexHarness.readIndexedQueuedAudio("scope:user");
  assert.deepStrictEqual(JSON.parse(JSON.stringify(queueIndexHarness.calls)), [
    { name: "scopeAttempt", key: { only: ["scope:user", "A1"] } },
    { name: "scope", key: "scope:user" }
  ], "IndexedDB reads must target only the authenticated account and attempt indexes");
  const mergedQueue = await queueHarness.listQueuedAudio("scope:user", "A1");
  assert.strictEqual(mergedQueue.length, 3, "IndexedDB and volatile fallback records must be merged");
  assert.strictEqual(mergedQueue.find((item) => item.queueId === "same").source, "memory", "Most recent memory record must win queue-id conflicts");
  assert(!mergedQueue.some((item) => item.scope !== "scope:user"), "Queued audio from another account must never be materialized into the current account view");
  assert.deepStrictEqual(Array.from(queueHarness.deleted), ["expired"], "Expired sensitive audio must be purged during the scoped read");
  const volatileRecord = await queuePutHarness.putQueuedAudio({ queueId: "volatile", scope: "scope:user", attemptId: "A1", createdAtMs: Date.now() });
  assert.strictEqual(volatileRecord.durable, false, "Quota failure must be reported as volatile, never durable");
  assert.strictEqual(queuePutHarness.memoryAudioQueue.get("volatile").durable, false, "Volatile fallback flag must survive in the memory queue");
  assert(queuePutHarness.warnings.some((message) => message.includes("Do not close or reload")), "Quota fallback needs an explicit page-lifecycle warning");
  queuePutHarness.setFailure(false);
  const durableRecord = await queuePutHarness.putQueuedAudio({ queueId: "durable", scope: "scope:user", attemptId: "A1", createdAtMs: Date.now() });
  assert.strictEqual(durableRecord.durable, true, "Successful IndexedDB commit must be marked durable");
  await queueClearHarness.clearQueuedAudio("scope:a", "A1");
  assert.deepStrictEqual(Array.from(queueClearHarness.memoryAudioQueue.keys()).sort(), ["a2", "b1"], "Attempt cleanup must not erase another attempt or account");
  await queueClearHarness.clearQueuedAudio("scope:a");
  assert.deepStrictEqual(Array.from(queueClearHarness.memoryAudioQueue.keys()), ["b1"], "Logout cleanup must purge only the departing account's sensitive audio");
  await onlineHarness.handleOnlineConnection();
  assert.strictEqual(onlineHarness.isOnline(), true, "Online event must restore connection state");
  assert.deepStrictEqual(Array.from(onlineHarness.events), ["ui-online", "workflow", "drain", "retry-current"], "Online event must drain durable queue before retrying the visible answer");
  lifecycleHarness.handleVisibilityChange();
  assert.strictEqual(lifecycleHarness.stopCalls(), 1, "Moving a mobile exam to the background must stop the active recording safely");
  const unloadEvent = { prevented: false, preventDefault() { this.prevented = true; }, returnValue: null };
  lifecycleHarness.handleBeforeUnload(unloadEvent);
  assert.strictEqual(unloadEvent.prevented, true, "Unsaved audio must trigger the browser leave guard");
  await assert.rejects(() => invalidResponseHarness.request("/fake", {}, 1), (error) => error.name === "ContractError" && error.message === "invalid_json_response", "Invalid 2xx JSON must never be accepted as success");
  await assert.rejects(() => transcriptionHarness.requestTranscription({ type: "audio/webm" }), (error) => error.name === "AbortError", "Transcription timeout must remain pending instead of blocking or being disguised");
  assert.strictEqual(transcriptionHarness.calls(), 1, "A transcription timeout must not duplicate expensive server inference");
  const retryPayload = { attemptId: "A1", clientSubmissionId: "submit-idempotency-1" };
  await submissionRetryHarness.sendFinalSubmission(retryPayload);
  assert.strictEqual(submissionRetryHarness.calls.length, 2, "Expired lease must reacquire once and retry the same final submission");
  assert.strictEqual(submissionRetryHarness.calls[0].clientSubmissionId, submissionRetryHarness.calls[1].clientSubmissionId, "Lease recovery must preserve the submission idempotency id");
  assert.strictEqual(submissionRetryHarness.calls[0].deviceId, "tab-device", "Submit must bind the tab-session device id");
  assert.deepStrictEqual(Array.from(submissionRetryHarness.calls, (item) => item.leaseId), ["lease-1", "lease-2"], "Lease retry must replace only the stale lease id");
  await audioFirstHarness.processAndSaveCurrentTurn();
  assert.strictEqual(audioFirstHarness.saved(), true, "Verified server audio acknowledgement must unlock official progress");
  assert.deepStrictEqual(Array.from(audioFirstHarness.events), ["indexeddb", "server-audio-ack", "transcription-started", "continue-unlocked"], "Functional audio-first sequence must protect, acknowledge, then transcribe");
  previewDispatcherHarness.setPreview(true);
  await previewDispatcherHarness.processCapturedTurn();
  assert.strictEqual(JSON.stringify(previewDispatcherHarness.counts()), JSON.stringify({ previewCalls: 1, officialCalls: 0 }), "Preview retry must never enter the official save processor");
  previewDispatcherHarness.setPreview(false);
  await previewDispatcherHarness.processCapturedTurn();
  assert.strictEqual(JSON.stringify(previewDispatcherHarness.counts()), JSON.stringify({ previewCalls: 1, officialCalls: 1 }), "Student retry must continue through the official save processor");
  await responseHarness.playResponseQueue([{ file: "reaction.mp3", text: "Thank you." }]);
  assert.strictEqual(responseHarness.next.disabled, false, "Continue must unlock when reaction audio cannot play");
  assert.strictEqual(responseHarness.reactionBusy(), false, "Reaction state must clear after a media failure");
  responseHarness.next.disabled = true;
  await responseHarness.playResponseQueue([]);
  assert.strictEqual(responseHarness.next.disabled, false, "Continue must unlock when no reaction clip is available");
  console.log("Basic Course 1 Final Oral Task frontend/audio contract test passed.");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
