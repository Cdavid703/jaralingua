import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const configPath = path.join(root, "assets/js/conversation-coach-data/english-intermediate-1-unit-5.js");
const enginePath = path.join(root, "assets/js/conversation-coach-v2.js");
const pagePath = path.join(root, "ingles/intermediate/unit-conversation-coach-unit-5.html");
const scriptsPath = path.join(root, "ingles/intermediate/audio/conversation-coach/unit-5/scripts.md");
const cssPath = path.join(root, "assets/css/conversation-coach-v2.css");
const practiceLabPath = path.join(root, "ingles/intermediate/practice-lab.html");
const overviewPath = path.join(root, "ingles/intermediate/course-overview.html");
const unitPagePath = path.join(root, "ingles/intermediate/unit-5-food-quantities-culture.html");

const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(configPath, "utf8"), sandbox, { filename: configPath });
const config = sandbox.window.JaraLinguaConversationCoachConfig;
const engine = fs.readFileSync(enginePath, "utf8");
const page = fs.readFileSync(pagePath, "utf8");
const scripts = fs.readFileSync(scriptsPath, "utf8");
const css = fs.readFileSync(cssPath, "utf8");
const practiceLab = fs.readFileSync(practiceLabPath, "utf8");
const overview = fs.readFileSync(overviewPath, "utf8");
const unitPage = fs.readFileSync(unitPagePath, "utf8");

assert.ok(config, "Conversation Coach config must load");
assert.equal(config.questions.length, 8, "The question bank must contain exactly eight questions");
assert.equal(config.attemptQuestionCount, 4, "A complete attempt must contain four turns");
assert.deepEqual(Array.from(config.mandatoryQuestionIds), ["u5q8-role-reversal"], "Role reversal must be mandatory");
assert.equal(config.selectionGroups.length, 3, "Ingredients, quantities, and culture groups are required");
assert.deepEqual(Array.from(config.selectionGroups, (group) => group.id), ["ingredients", "quantities", "culture"]);
assert.equal(config.rubric.length, 5, "The report must use five /10 criteria");
assert.equal(config.apiPath, "/api/english-intermediate/pronunciation-assessment", "Intermediate English must never use the French transcription route");
assert.doesNotMatch(configPath + engine, /\/api\/french8\/pronunciation-assessment/, "The Intermediate Coach must contain no French transcription fallback");

const scriptItems = new Map();
const lines = scripts.split(/\r?\n/);
for (let index = 0; index < lines.length; index += 1) {
  const match = lines[index].match(/^###\s+`([^`]+\.mp3)`\s*$/);
  if (!match) continue;
  const body = [];
  for (let cursor = index + 1; cursor < lines.length && !/^#{2,3}\s+/.test(lines[cursor]); cursor += 1) {
    if (lines[cursor].trim()) body.push(lines[cursor].trim());
  }
  scriptItems.set(match[1], body.join(" "));
}
assert.equal(scriptItems.size, 40, "The professional audio manifest must contain 40 files");

const followUpPrompts = Object.values(config.followUpSets || {}).flatMap((set) => [set.incomplete, set.complete]);
const followUpAudio = new Set(followUpPrompts.map((prompt) => prompt.audio));
assert.equal(Object.keys(config.followUpSets || {}).length, 6, "Six adaptive skill categories are required");
assert.equal(followUpPrompts.length, 12, "Each adaptive category must provide missing-evidence and extension routes");
assert.equal(config.questions.filter((question) => question.followUpSet).length, 7, "Every non-role-reversal question must map to an adaptive category");

const audioReferences = new Set();
function collectAudio(value) {
  if (Array.isArray(value)) return value.forEach(collectAudio);
  if (!value || typeof value !== "object") return;
  Object.values(value).forEach((item) => {
    if (typeof item === "string" && item.endsWith(".mp3")) audioReferences.add(item);
    else collectAudio(item);
  });
}
collectAudio(config.audio);
collectAudio(config.questions);
collectAudio(config.followUpSets);
collectAudio(config.interactionResponses);
collectAudio(config.defaultInteractionResponse);
assert.equal(audioReferences.size, 40, "Config must reference all 40 professional MP3 files exactly once by filename");
assert.deepEqual([...audioReferences].sort(), [...scriptItems.keys()].sort(), "Config and script manifest MP3 names must match");
const allowMissingAdaptiveAudio = process.env.ALLOW_MISSING_ADAPTIVE_AUDIO === "1";
for (const file of audioReferences) {
  const audioFile = path.join(root, "ingles/intermediate/audio/conversation-coach/unit-5", file);
  if (!fs.existsSync(audioFile) && allowMissingAdaptiveAudio && followUpAudio.has(file)) continue;
  assert.ok(fs.existsSync(audioFile), `${file} must exist after professional generation`);
  assert.ok(fs.statSync(audioFile).size > 10000, `${file} must contain a substantial MP3 payload`);
}

const expectedText = new Map();
for (const question of config.questions) {
  expectedText.set(question.audio, question.text);
  if (question.reaction) expectedText.set(question.reaction.file, question.reaction.text);
}
for (const followUp of followUpPrompts) expectedText.set(followUp.audio, followUp.text);
for (const response of config.interactionResponses) expectedText.set(response.file, response.text);
expectedText.set(config.defaultInteractionResponse.file, config.defaultInteractionResponse.text);
for (const item of Object.values(config.audio)) {
  if (item && typeof item === "object" && item.file && item.text) expectedText.set(item.file, item.text);
}
for (const [file, text] of expectedText) {
  assert.equal(scriptItems.get(file), text, `${file} must stay synchronized with its visible text`);
}

for (const [file, text] of scriptItems) {
  assert.ok(text.length > 5, `${file} must have a usable script`);
  assert.doesNotMatch(text, /\b(?:narrator|maya|speaker|host|student)\s*:/i, `${file} must not read speaker labels aloud`);
}

const speeds = [...page.matchAll(/data-coach-speed="([^"]+)"/g)].map((match) => Number(match[1]));
assert.deepEqual([...new Set(speeds)].sort((a, b) => a - b), [0.75, 1, 1.25], "Only the approved three audio speeds may appear");
assert.doesNotMatch(engine + page, /speechSynthesis|webkitSpeech/i, "Browser speech synthesis is forbidden");
assert.match(engine, /selectBalancedQuestions/, "The engine must enforce balanced question selection");
assert.match(engine, /chooseAdaptiveFollowUp/, "The engine must select follow-ups from answer evidence");
assert.match(engine, /turnIsComplete/, "The engine must require the follow-up before advancing");
assert.match(engine, /continueWithoutScore/, "The engine must support an honest unscored recovery path");
assert.match(engine, /did not return English analysis/, "The engine must reject a non-English transcription response");
assert.match(engine, /frenchFeedbackWords/, "The pronunciation feedback must filter clearly French tokens");
assert.match(engine, /reportLowConfidence.*filter.*isUsefulEnglishFeedbackWord/, "Stored reports must also remove clearly French feedback tokens");
assert.match(page, /7 spoken responses/i, "The learner-facing page must explain the complete response load");
assert.match(page, /audio is not stored/i, "Privacy copy must state that audio is not stored");
assert.match(css, /@media \(max-width: 980px\)/, "Tablet layout is required");
assert.match(css, /@media \(max-width: 470px\)/, "Small mobile layout is required");
assert.match(practiceLab, /Unit 5 - 12 activities/, "Practice Lab quick access must show twelve Unit 5 activities");
assert.match(practiceLab, /<strong class="practice-folder-count">12 activities<\/strong>/, "Unit 5 folder count must show twelve activities");
assert.match(practiceLab, /href="unit-conversation-coach-unit-5\.html"/, "Practice Lab must link the Conversation Coach");
assert.match(overview, /href="unit-conversation-coach-unit-5\.html"/, "Course Overview must link the Conversation Coach");
assert.match(unitPage, /href="unit-conversation-coach-unit-5\.html"/, "Unit 5 explanation route must link the Conversation Coach");

for (const image of [
  "assets/img/english-intermediate/unit-5/conversation-coach-maya-hero-v1.webp",
  "assets/img/english-intermediate/unit-5/conversation-coach-maya-portrait-v1.webp"
]) {
  const file = path.join(root, image);
  assert.ok(fs.existsSync(file), `${image} must exist`);
  assert.ok(fs.statSync(file).size > 50000, `${image} must be a substantial professional visual asset`);
}

console.log("PASS Unit 5 Conversation Coach static audit");
console.log(`questions=${config.questions.length} attempt=${config.attemptQuestionCount} responses=7 adaptivePrompts=${followUpPrompts.length} professionalAudio=${scriptItems.size} speeds=0.75,1,1.25`);
