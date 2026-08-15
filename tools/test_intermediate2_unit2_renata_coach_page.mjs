import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const pagePath = path.join(root, "ingles", "intermediate-2", "conversation-coach-unit-2-renata-real-choice.html");
const configPath = path.join(root, "assets", "js", "english-intermediate2-conversation-coach-unit2-renata.js");
const enginePath = path.join(root, "assets", "js", "english-intermediate2-conversation-coach-unit1.js");
const catalogPath = path.join(root, "assets", "data", "english-intermediate-2-content.json");
const audioDir = path.join(root, "ingles", "intermediate-2", "audio", "conversation-coach", "unit-2-renata-real-choice");
const scriptsPath = path.join(audioDir, "scripts.md");
const imagePath = path.join(root, "assets", "img", "english-intermediate-2", "unit-2", "renata-real-choice-coach", "renata-real-choice-hero-v1.png");

const page = fs.readFileSync(pagePath, "utf8");
const configSource = fs.readFileSync(configPath, "utf8");
const engine = fs.readFileSync(enginePath, "utf8");
const scripts = fs.readFileSync(scriptsPath, "utf8");
const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
const sandbox = { window: {} };
vm.runInNewContext(configSource, sandbox);
const config = sandbox.window.IE2ConversationCoachConfig;

assert.equal(config.characterName, "Renata");
assert.equal(config.turns.length, 7, "Renata needs seven connected conversation turns.");
assert.deepEqual([...config.turns.map((turn) => turn.topic)], ["First hello", "A simple connection", "A future goal", "A specific opportunity", "The dilemma", "Advice from a friend", "A friendly closing"]);
assert.match(config.turns[0].question, /What.s your name\?/);
assert.match(config.turns[2].focus, /hope to|would like to|goal is to/);
assert.match(config.turns[3].question, /What would you like to know about it\?/);
assert.match(config.turns[5].question, /I wish I had planned this earlier/);
assert.equal(config.turns[6].reaction, null, "The final turn must route to a real Renata response.");
assert.equal(config.finalResponses.length, 3);
assert.ok(config.defaultFinalReaction);

assert.match(page, /Practice Lab · Unit 2 Conversation/);
assert.match(page, /Simple practice, not an evaluation/);
assert.match(page, /There is no score, grade, percentage or teacher submission/);
assert.doesNotMatch(page, /(?:Private practice|Teacher delivery)\s*[·:]?\s*0%/i);
assert.match(page, /renata-real-choice-hero-v1\.png/);
assert.match(page, /english-intermediate2-conversation-coach-unit2-renata\.js/);
assert.match(page, /english-intermediate2-conversation-coach-unit1\.js/);
assert.match(page, /id="coachOnboarding"/);
assert.match(page, /id="coachInterview"/);
assert.match(page, /id="coachComplete"/);
assert.match(page, /id="questionAudioButton"/);
assert.match(page, /id="reactionAudioButton"/);
assert.match(page, /id="gabrielAudio"/);
assert.match(engine, /window\.IE2ConversationCoachConfig/);
assert.match(engine, /COACH_CONFIG\.finalResponses/);
assert.doesNotMatch(engine, /speechSynthesis/);

const expectedFiles = [...scripts.matchAll(/^File:\s+`([^`]+\.mp3)`/gm)].map((match) => match[1]);
assert.equal(expectedFiles.length, 22, "Every Renata prompt, reaction, answer and recovery needs its own real audio file.");
for (const file of expectedFiles) {
  const target = path.join(audioDir, file);
  assert.ok(fs.existsSync(target), `Missing ElevenLabs audio: ${file}`);
  assert.ok(fs.statSync(target).size > 10_000, `ElevenLabs audio is unexpectedly small: ${file}`);
}
assert.ok(fs.existsSync(imagePath), "The Conversation Coach requires its professional hero image.");
assert.ok(fs.statSync(imagePath).size > 100_000, "The professional hero image is unexpectedly small.");
const metadata = JSON.parse(fs.readFileSync(path.join(audioDir, "metadata.json"), "utf8"));
assert.equal(metadata.provider, "ElevenLabs");
assert.equal(metadata.fileCount, 22);

const item = catalog.items.find((activity) => activity.id === "unit-2-renata-real-choice-conversation-coach");
assert.ok(item, "The Conversation Coach must appear in the Practice Lab catalog.");
assert.equal(item.unit, 2);
assert.ok([6, 7].includes(item.order), "The coach follows the current Unit 2 practice sequence.");
assert.equal(item.type, "conversation-coach");
assert.equal(item.audioProvider, "elevenlabs");
assert.equal(item.turnCount, 7);
assert.equal(item.teacherSubmission, false);
assert.equal(item.gradebookProjected, false);
assert.equal(item.affectsAverage, false);
assert.equal(item.status, "published");

console.log("Intermediate 2 Unit 2 Renata Conversation Coach contract passed.");
