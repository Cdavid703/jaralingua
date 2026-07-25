const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const htmlPath = path.join(root, "ingles", "intermediate", "unit-conversation-coach-unit-6-schedule.html");
const dataPath = path.join(root, "assets", "js", "conversation-coach-data", "english-intermediate-1-unit-6-schedule.js");
const enginePath = path.join(root, "assets", "js", "schedule-conversation-coach.js");
const serverPath = path.join(root, "server", "progress_api.py");
const imageDir = path.join(root, "assets", "img", "english-intermediate", "unit-6", "schedule-coach");
const audioDir = path.join(root, "ingles", "intermediate", "audio", "conversation-coach", "unit-6-schedule");
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

assert(config, "Schedule coach config was not registered on window.");
assert(config.id === "english-intermediate-1-unit-6-schedule", "Unexpected config id.");
assert(config.submitPath === "/api/intermediate/unit6-schedule-coach/submit", "Unexpected submit path.");
assert(config.audioRoot === "audio/conversation-coach/unit-6-schedule/", "Unexpected audio root.");
assert(config.character.name === "Marcus Reed", "Coach character must be Marcus Reed.");
assert(Array.isArray(config.stages) && config.stages.length === 8, "Expected eight conversation stages.");
assert(Array.isArray(config.dishes) && config.dishes.length === 4, "Expected four strategy cards.");
assert(Array.isArray(config.incidents) && config.incidents.length === 3, "Expected three adaptive schedule complications.");
assert(config.maxRecordingSeconds === 40, "Expected 40-second recording window.");

const requiredIds = [
  "onboardingPanel", "interviewPanel", "summaryPanel", "welcomePlayButton", "instructionsPlayButton",
  "welcomeAudio", "instructionsAudio", "guidedMode", "realMode", "menuPreviewGrid", "activeMenuPanel",
  "activeMenuGrid", "selectedDishLabel", "activeSelectedDishLabel", "preflightButton", "preflightStatus",
  "preflightPlayback", "startConversationButton", "reviewPreviousButton", "resumeNote", "turnCounter",
  "turnTopic", "turnProgress", "coachStage", "coachStageStatus", "conversationContext", "questionText",
  "questionPlayButton", "questionAudio", "reactionAudio", "answerSupport", "supportSummaryLabel",
  "answerFrames", "vocabularyBank", "grammarClue", "microphoneSelect", "levelMeterBar", "levelMeterValue",
  "micButton", "stopButton", "recordAgainButton", "recordStatus", "recordHelp", "recordTimer",
  "studentAudio", "liveTranscript", "turnFeedback", "transcriptionRecovery", "retryTranscriptionButton",
  "continueUnscoredButton", "recoveryRecordAgainButton", "unsupportedMessage", "coachReaction",
  "coachReactionText", "previousTurnButton", "nextTurnButton", "summaryLead", "summaryScore", "summaryReadiness",
  "summaryComparison", "summaryCoverage", "teacherDeliveryPanel", "deliveryScore", "deliveryGrade",
  "deliveryButton", "deliveryStatus", "summaryMetrics", "summaryStrengths", "summaryPriorities",
  "summaryWords", "attemptHistory", "summaryAnswers", "clearHistoryButton", "restartConversationButton",
  "weakPracticeButton", "closingPlayButton", "floatingMicDock", "floatingTurnLabel", "floatingStatus",
  "floatingTimer", "floatingMicButton", "floatingStopButton", "coachToast"
];
for (const id of requiredIds) {
  assert(html.includes(`id="${id}"`), `Missing required DOM id: ${id}`);
}

assert(html.includes("schedule-conversation-coach.css"), "Missing Unit 6 schedule CSS.");
assert(html.includes("english-intermediate-1-unit-6-schedule.js"), "Missing Unit 6 schedule data script.");
assert(html.includes("schedule-conversation-coach.js"), "Missing Unit 6 schedule engine script.");
assert(html.includes("Send to teacher"), "Missing English teacher delivery button.");
assert(html.includes("Gradebook weight 0%"), "Missing visible gradebook weight note.");
assert(engineJs.includes("activeSession"), "Engine must autosave an active schedule-coach session.");
assert(engineJs.includes("function resumeActiveSession"), "Engine must resume saved schedule-coach progress after reload.");
assert(engineJs.includes("function markCurrentStageNotRecorded"), "Continue must preserve a not-recorded stage instead of freezing.");
assert(engineJs.includes("function goPrevious"), "Engine must support going back to a previous stage.");
assert(!html.includes('id="nextTurnButton" type="button" disabled'), "Continue must not be disabled by default.");
assert((html.match(/data-coach-speed="0\.75"/g) || []).length >= 2, "Missing 0.75x speed buttons.");
assert((html.match(/data-coach-speed="1"/g) || []).length >= 2, "Missing 1x speed buttons.");
assert((html.match(/data-coach-speed="1\.25"/g) || []).length >= 2, "Missing 1.25x speed buttons.");

assert(!/speechSynthesis/i.test(engineJs + dataJs + html), "Browser speech synthesis must not be used.");
assert(!/\b(Narrator|Speaker)\s*:/i.test(scripts), "Audio scripts must not include speaker labels.");

for (const file of [
  "schedule-rescue-hero-v1.webp",
  "marcus-reed-portrait-v1.webp",
  "strategy-protect-recording-v1.webp",
  "strategy-move-interview-v1.webp",
  "strategy-free-up-friday-v1.webp",
  "strategy-confirm-agenda-v1.webp",
]) {
  const full = path.join(imageDir, file);
  assert(fs.existsSync(full), `Missing image: ${file}`);
  assert(fs.statSync(full).size > 30000, `Image looks too small: ${file}`);
}

const audioHeadings = [...scripts.matchAll(/^###\s+`([^`]+\.mp3)`/gm)].map((match) => match[1]);
assert(audioHeadings.length === 30, `Expected 30 audio scripts, found ${audioHeadings.length}.`);
for (const file of audioHeadings) {
  const full = path.join(audioDir, file);
  assert(fs.existsSync(full), `Missing generated MP3: ${file}`);
  assert(fs.statSync(full).size > 10000, `MP3 looks too small: ${file}`);
}

assert(server.includes('INTERMEDIATE_UNIT6_SCHEDULE_COACH_ID = "unit6ScheduleRescueConversationCoach"'), "Missing Unit 6 schedule coach evaluation id.");
assert(server.includes("INTERMEDIATE_UNIT6_SCHEDULE_COACH_EVALUATION"), "Missing Unit 6 schedule coach evaluation template.");
assert(server.includes('"/api/intermediate/unit6-schedule-coach/submit"'), "Missing Unit 6 schedule coach submit endpoint.");
assert(server.includes('"weight": 0') && server.includes('"activity": "Schedule Rescue Conversation Coach"'), "Server must save coach with weight 0.");

const practiceLab = read(path.join(root, "ingles", "intermediate", "practice-lab.html"));
const overview = read(path.join(root, "ingles", "intermediate", "course-overview.html"));
const explanation = read(path.join(root, "ingles", "intermediate", "unit-6-future-plans-advice.html"));
for (const source of [practiceLab, overview, explanation]) {
  assert(source.includes("unit-conversation-coach-unit-6-schedule.html"), "Missing schedule coach navigation link.");
}
assert(practiceLab.includes("47 activities"), "Practice Lab total count was not updated.");
assert(practiceLab.includes("Unit 6 - 9 activities"), "Practice Lab Unit 6 count was not updated.");

console.log("PASS Unit 6 schedule coach static coverage: page, data, professional assets, no speech synthesis, backend markers, and navigation.");
