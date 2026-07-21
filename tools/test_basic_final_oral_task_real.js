"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const jsPath = path.join(root, "assets", "js", "english-basic-final-oral-task.js");
const htmlPath = path.join(root, "ingles", "basico", "basic-course-1-final-oral-task.html");
const scriptsPath = path.join(root, "ingles", "basico", "audio", "final-oral-task-real", "scripts.md");
const publicAudioDir = path.dirname(scriptsPath);
const protectedPromptDir = path.join(root, "server", "private_assets", "basic-final-oral-prompts");
const imageDir = path.join(root, "assets", "img", "english-basic", "final-oral-task-real");
const generatorPath = path.join(root, "tools", "generate_basic_final_oral_task_real_audio.ps1");
const serverPath = path.join(root, "server", "progress_api.py");

const source = fs.readFileSync(jsPath, "utf8");
const html = fs.readFileSync(htmlPath, "utf8");
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
  "unit-4-v1.webp", "unit-5-v1.webp", "unit-6-v1.webp"
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
assert(source.includes('headers["X-Jaralingua-Student-Id-Claim"] = claim'), "Document claim must travel in the authenticated request header");
assert(source.includes("totalRecordedDuration() + activeRecording + capturedUnsaved"), "Visible timer must measure recorded speaking time, not network or reading time");
assert(html.includes('aria-label="Recorded speaking time"'), "Speaking-time indicator needs an accessible label");

assert(generator.includes('ErXwobaYiN019PkySvjV'), "Generator must reuse the approved restaurant-coach male voice");
assert(generator.includes("Expected 57 approved audio scripts"));
assert(generator.includes("server\\private_assets\\basic-final-oral-prompts"), "Official question audio must generate outside the public web asset tree");
assert(generator.includes("[switch]$DryRun"));
assert(generator.includes("[string[]]$Only"));

console.log("Basic Course 1 Final Oral Task frontend/audio contract test passed.");
