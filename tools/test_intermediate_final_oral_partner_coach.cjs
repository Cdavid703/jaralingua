const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const htmlPath = path.join(root, "ingles", "intermediate", "final-oral-partner-coach.html");
const dataPath = path.join(root, "assets", "js", "conversation-coach-data", "english-intermediate-1-final-oral-partner-coach.js");
const enginePath = path.join(root, "assets", "js", "schedule-conversation-coach.js");
const serverPath = path.join(root, "server", "progress_api.py");
const imageDir = path.join(root, "assets", "img", "english-intermediate", "unit-6", "final-oral-partner-coach");
const audioDir = path.join(root, "ingles", "intermediate", "audio", "conversation-coach", "final-oral-partner");
const scriptsPath = path.join(audioDir, "scripts.md");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function read(file) {
  return fs.readFileSync(file, "utf8");
}

const html = read(htmlPath);
const dataJs = read(dataPath);
const engineJs = read(enginePath);
const server = read(serverPath);
const scripts = read(scriptsPath);

const context = { window: {} };
vm.runInNewContext(dataJs, context, { filename: dataPath });
const config = context.window.JaraLinguaScheduleCoachConfig;

assert(config, "Final oral partner coach config was not registered on window.");
assert(config.id === "english-intermediate-1-final-oral-partner-coach", "Unexpected config id.");
assert(config.submitPath === "/api/intermediate/final-oral-partner-coach/submit", "Unexpected submit path.");
assert(config.audioRoot === "audio/conversation-coach/final-oral-partner/", "Unexpected audio root.");
assert(config.character.name === "Sophie Bennett", "Coach character must be Sophie Bennett.");
assert(Array.isArray(config.stages) && config.stages.length === 8, "Expected eight oral exam stages.");
assert(Array.isArray(config.dishes) && config.dishes.length === 5, "Expected five official-style problem cards.");
assert(Array.isArray(config.incidents) && config.incidents.length === 3, "Expected three adaptive partner problems.");
assert(config.maxRecordingSeconds === 50, "Expected 50-second recording window.");
assert(config.useSelectedItemResponseOnChooseStrategy === false, "Final oral problem cards must not inject advice immediately after stage 1.");
assert(config.ui && config.ui.payloadItemKey === "selectedProblem", "Payload must store selectedProblem.");
assert(config.ui && config.ui.payloadIncidentKey === "partnerProblem", "Payload must store partnerProblem.");

const firstStage = config.stages.find((stage) => stage.id === "choose-strategy");
assert(firstStage && firstStage.improvedByDish, "First stage must define context-specific stronger models.");
assert(firstStage.improvedByDish["free-time"], "No Free Time must have its own stronger model.");
assert(!/School and Work Stress/i.test(firstStage.improvedByDish["free-time"]), "No Free Time stronger model must not reuse School and Work Stress.");
assert(/free time|rest|responsibilities/i.test(firstStage.improvedByDish["free-time"]), "No Free Time stronger model must match the selected problem.");
assert(engineJs.includes("function strongerModel"), "Engine must resolve contextual stronger models.");
assert(engineJs.includes("improvedByDish"), "Engine must support stronger models by selected problem.");
assert(engineJs.includes("improvedByIncident"), "Engine must support stronger models by partner problem.");
assert(engineJs.includes("function fallbackResponse"), "Engine must provide a safe transition when a stage has no configured response.");
assert(engineJs.includes("usesSelectedItemResponse"), "Engine must support explicit selected-card response stages.");
assert(engineJs.includes("useSelectedItemResponseOnChooseStrategy"), "Engine must allow final oral to disable premature selected-card responses.");
assert(engineJs.includes("activeSession"), "Engine must autosave an active partner-coach session.");
assert(engineJs.includes("function resumeActiveSession"), "Engine must resume saved partner-coach progress after reload.");
assert(engineJs.includes("function markCurrentStageNotRecorded"), "Continue must preserve a not-recorded stage instead of freezing.");
assert(engineJs.includes("function goPrevious"), "Engine must support going back to a previous stage.");

const stageOne = config.stages.find((stage) => stage.id === "choose-strategy");
const stageTwo = config.stages.find((stage) => stage.id === "follow-up-answer-1");
const stageThree = config.stages.find((stage) => stage.id === "follow-up-answer-2");
assert(stageOne && stageOne.usesSelectedItemResponse !== true, "Stage 1 must only present the problem, not Sophie's advice.");
assert(stageTwo && !stageTwo.complete, "Stage 2 intentionally uses the engine fallback so Continue cannot freeze.");
assert(stageThree && stageThree.usesSelectedItemResponse === true, "Stage 3 must trigger Sophie's selected-problem advice before the advice reaction stage.");

const requiredIds = [
  "onboardingPanel", "interviewPanel", "summaryPanel", "welcomePlayButton", "instructionsPlayButton",
  "welcomeAudio", "instructionsAudio", "guidedMode", "realMode", "menuPreviewGrid", "activeMenuPanel",
  "activeMenuGrid", "selectedDishLabel", "activeSelectedDishLabel", "preflightButton", "preflightStatus",
  "preflightPlayback", "startConversationButton", "turnCounter", "turnTopic", "turnProgress", "coachStage",
  "coachStageStatus", "conversationContext", "questionText", "questionPlayButton", "questionAudio",
  "reactionAudio", "answerSupport", "supportSummaryLabel", "answerFrames", "vocabularyBank", "grammarClue",
  "microphoneSelect", "levelMeterBar", "levelMeterValue", "micButton", "stopButton", "recordAgainButton",
  "recordStatus", "recordHelp", "recordTimer", "studentAudio", "liveTranscript", "turnFeedback",
  "transcriptionRecovery", "retryTranscriptionButton", "continueUnscoredButton", "recoveryRecordAgainButton",
  "unsupportedMessage", "coachReaction", "coachReactionText", "previousTurnButton", "nextTurnButton", "summaryLead", "summaryScore",
  "summaryReadiness", "summaryComparison", "summaryCoverage", "teacherDeliveryPanel", "deliveryScore",
  "deliveryGrade", "deliveryButton", "deliveryStatus", "summaryMetrics", "summaryStrengths",
  "summaryPriorities", "summaryWords", "attemptHistory", "summaryAnswers", "clearHistoryButton",
  "restartConversationButton", "weakPracticeButton", "closingPlayButton", "floatingMicDock",
  "floatingTurnLabel", "floatingStatus", "floatingTimer", "floatingMicButton", "floatingStopButton",
  "coachToast"
];
for (const id of requiredIds) {
  assert(html.includes(`id="${id}"`), `Missing required DOM id: ${id}`);
}

assert(html.includes("final-oral-partner-coach.css"), "Missing final oral visual CSS.");
assert(html.includes("english-intermediate-1-final-oral-partner-coach.js"), "Missing final oral data script.");
assert(html.includes("schedule-conversation-coach.js"), "Missing reusable conversation coach engine.");
assert(html.includes("Send to teacher"), "Missing English teacher delivery button.");
assert(html.includes("Gradebook weight 20%"), "Missing visible 20% gradebook delivery note.");
assert(!html.includes('id="nextTurnButton" type="button" disabled'), "Continue must not be disabled by default.");
assert((html.match(/data-coach-speed="0\.75"/g) || []).length >= 2, "Missing 0.75x speed buttons.");
assert((html.match(/data-coach-speed="1"/g) || []).length >= 2, "Missing 1x speed buttons.");
assert((html.match(/data-coach-speed="1\.25"/g) || []).length >= 2, "Missing 1.25x speed buttons.");

assert(!/speechSynthesis/i.test(engineJs + dataJs + html), "Browser speech synthesis must not be used.");
assert(!/\b(Narrator|Speaker|Sophie)\s*:/i.test(scripts), "Audio scripts must not include speaker labels.");

for (const file of [
  "final-oral-partner-hero-v1.webp",
  "sophie-bennett-portrait-v1.webp",
  "problem-school-work-stress-v1.webp",
  "problem-english-learning-v1.webp",
  "problem-health-habits-v1.webp",
  "problem-money-management-v1.webp",
  "problem-free-time-v1.webp",
]) {
  const full = path.join(imageDir, file);
  assert(fs.existsSync(full), `Missing image: ${file}`);
  assert(fs.statSync(full).size > 30000, `Image looks too small: ${file}`);
}

const audioHeadings = [...scripts.matchAll(/^###\s+`([^`]+\.mp3)`/gm)].map((match) => match[1]);
assert(audioHeadings.length === 28, `Expected 28 audio scripts, found ${audioHeadings.length}.`);
for (const file of audioHeadings) {
  const full = path.join(audioDir, file);
  assert(fs.existsSync(full), `Missing generated MP3: ${file}`);
  assert(fs.statSync(full).size > 10000, `MP3 looks too small: ${file}`);
}

assert(server.includes('INTERMEDIATE_FINAL_ORAL_PARTNER_COACH_ID = "finalOralPartnerCoachFollowUp"'), "Missing final oral partner coach id.");
assert(server.includes('"/api/intermediate/final-oral-partner-coach/submit"'), "Missing final oral partner coach submit endpoint.");
assert(server.includes("clean_intermediate_final_oral_partner_coach"), "Missing final oral partner coach payload cleaner.");
assert(server.includes('"weight": 20'), "Backend must save coach as a 20% gradebook assessment.");
assert(server.includes('student.setdefault("grades", {})[INTERMEDIATE_FINAL_ORAL_PARTNER_COACH_ID] = result["grade"]'), "Final oral partner coach must create a gradebook grade column.");

const practiceLab = read(path.join(root, "ingles", "intermediate", "practice-lab.html"));
const overview = read(path.join(root, "ingles", "intermediate", "course-overview.html"));
const explanation = read(path.join(root, "ingles", "intermediate", "unit-6-future-plans-advice.html"));
assert(!practiceLab.includes("final-oral-partner-coach.html"), "Final oral evaluation must not appear inside Practice Lab activities.");
assert(!explanation.includes("final-oral-partner-coach.html"), "Final oral evaluation must not appear inside Unit 6 practice bridges.");
assert(overview.includes('id="final-assessments"'), "Missing final assessment section in Course Overview.");
assert(overview.includes("final-oral-partner-coach.html"), "Missing final oral partner coach link in Course Overview final assessment section.");
assert(practiceLab.includes("47 activities"), "Practice Lab total count was not updated.");
assert(practiceLab.includes("Unit 6 - 9 activities"), "Practice Lab Unit 6 count was not updated.");
assert(server.includes('"type": "Final oral evaluation"'), "Backend evaluation type must identify this as a final oral evaluation.");

console.log("PASS final oral partner coach: page, config, responsive assets, professional audio, backend 20% official endpoint, and final assessment navigation.");
