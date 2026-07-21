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
assert.strictEqual(Object.values(api.TURN_LIMIT_SECONDS).reduce((sum, value) => sum + value, 0), 180, "Seven recording caps must total the official three-minute maximum");
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
  audio: "/api/basic-final-oral/audio"
};
Object.entries(expectedEndpoints).forEach(([key, value]) => {
  assert.strictEqual(api.API[key], value, `Frontend endpoint mismatch: ${key}`);
  assert(server.includes(value), `Backend route is missing: ${value}`);
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
assert(source.includes("clientTurnId"), "Turn saves must be idempotent");
assert(source.includes("clientSubmissionId"), "Final submit must be idempotent");
assert(source.includes("revision"), "Attempt saves must use optimistic revisions");
assert(source.includes("MediaRecorder"), "Cross-device microphone recording is missing");
assert(source.includes("audio/mp4"), "iPhone-compatible MediaRecorder fallback is missing");
assert(source.includes("audio/webm"), "Android/desktop MediaRecorder format is missing");
assert(source.includes("X-Jaralingua-Language\"] = \"en\"") || source.includes('"X-Jaralingua-Language": "en"'), "Whisper language must be fixed to English");
assert(source.includes("data-final-oral-speed"));
assert(!source.includes("data-final-oral-speed=\"1.25\""));
assert(!source.includes("frames:"), "Real exam must not expose answer frames");
assert(!source.includes("vocabulary:"), "Real exam must not expose vocabulary hints");
assert(source.includes("No answer model, vocabulary hint, or correction"), "Real-exam no-help notice is missing");
assert(html.includes('id="claimStudentPanel"'), "Inline document-claim panel is missing");
assert(html.includes('id="claimStudentIdInput"'), "Inline document-number input is missing");
assert(html.includes('id="claimStudentButton"'), "Inline document verification button is missing");
assert(/id="signInButton"[^>]*data-open-google-login/.test(html), "The internal sign-in button must be recognized as an external auth trigger");
assert(!/\.official-oral-page\s+\.jaralingua-auth\s*>\s*\.auth-trigger\s*\{[^}]*display\s*:\s*none/i.test(css), "The floating course login must remain visible");
assert(source.includes('event?.stopPropagation?.()'), "The internal sign-in click must not be closed by the global outside-click handler");
assert(source.includes('document.querySelector("[data-auth-toggle]") || document.querySelector("[data-auth-nav-toggle]")'), "Sign-in must prefer the floating trigger and retain the nav fallback");
assert(source.includes('headers["X-Jaralingua-Student-Id-Claim"] = claim'), "Document claim must travel in the authenticated request header");
assert(source.includes('const CLAIM_KEY = "jaralingua_basic_final_oral_student_claim_v2"'), "The official exam needs a dedicated document-claim key");
assert(source.includes("JSON.stringify({ scope, value: normalized })"), "Document claims must be stored with their authenticated account scope");
assert(source.includes("stored?.scope === accountScope(account)"), "A document claim must never cross over to another signed-in account");
assert(source.includes("credential === lastCredential") && source.includes("resetProtectedSession({ clearClaim: accountChanged })"), "Sign-out and account switches must reset protected exam state");
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
  "welcomePlayButton", "instructionsPlayButton", "preflightButton", "startExamButton", "questionPlayButton",
  "micButton", "stopButton", "nextTurnButton", "retryProcessingButton", "recordAgainButton", "submitExamButton", "copyReceiptButton",
  "refreshSubmissionsButton", "evidencePlayButton", "publishGradeButton", "floatingMicButton", "floatingStopButton"
].forEach((id) => {
  assert(html.includes(`id="${id}"`), `Interactive button missing from HTML: ${id}`);
  assert(source.includes(`"${id}"`), `Interactive button is not mapped in JavaScript: ${id}`);
});
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
  async function playResponseQueue(responses) {${responseQueueSource[1]}
  }
  return { playResponseQueue, next, reactionBusy: () => reactionBusy };
})()`, responseSandbox);

(async () => {
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
