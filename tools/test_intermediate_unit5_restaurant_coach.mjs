import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const pagePath = path.join(root, "ingles/intermediate/unit-conversation-coach-unit-5-restaurant.html");
const configPath = path.join(root, "assets/js/conversation-coach-data/english-intermediate-1-unit-5-restaurant.js");
const enginePath = path.join(root, "assets/js/restaurant-conversation-coach.js");
const cssPath = path.join(root, "assets/css/restaurant-conversation-coach.css");
const scriptsPath = path.join(root, "ingles/intermediate/audio/conversation-coach/unit-5-restaurant/scripts.md");

const page = fs.readFileSync(pagePath, "utf8");
const configSource = fs.readFileSync(configPath, "utf8");
const engine = fs.readFileSync(enginePath, "utf8");
const css = fs.readFileSync(cssPath, "utf8");
const scripts = fs.readFileSync(scriptsPath, "utf8");
const practiceLab = fs.readFileSync(path.join(root, "ingles/intermediate/practice-lab.html"), "utf8");
const overview = fs.readFileSync(path.join(root, "ingles/intermediate/course-overview.html"), "utf8");
const unitPage = fs.readFileSync(path.join(root, "ingles/intermediate/unit-5-food-quantities-culture.html"), "utf8");

const context = { window: {} };
vm.createContext(context);
vm.runInContext(configSource, context);
const config = context.window.JaraLinguaRestaurantCoachConfig;

assert.ok(config, "Restaurant Coach config must load");
assert.equal(config.apiPath, "/api/english-intermediate/pronunciation-assessment", "English Intermediate endpoint is mandatory");
assert.equal(config.language, "en", "English language defense must be configured");
assert.equal(config.character.name, "Ethan Cole", "One named waiter must remain consistent");
assert.equal(config.stages.length, 6, "The dinner must contain six connected stages");
assert.equal(config.dishes.length, 6, "The visual menu must contain six dishes");
assert.equal(config.incidents.length, 3, "The service problem must have three possible scenarios");
assert.equal(config.stages.map((stage) => stage.id).join(","), "arrival,preferences,menu-question,order,service-problem,bill", "Stages must follow the approved restaurant sequence");

for (const stage of config.stages) {
  assert.ok(stage.prompt && stage.topic, `${stage.id} must define context and prompt`);
  assert.ok(stage.frames.length >= 2, `${stage.id} must provide two guided answer frames`);
  assert.ok(stage.vocabulary.length >= 5, `${stage.id} must provide useful customer language`);
  assert.ok(stage.grammar, `${stage.id} must explain its language focus`);
  assert.ok(stage.checks.length >= 2, `${stage.id} must define observable evidence checks`);
  assert.ok(stage.improved, `${stage.id} must provide a stronger model`);
  assert.ok(stage.clarify?.file && stage.clarify?.text, `${stage.id} must provide one professional clarification route`);
}

for (const dish of config.dishes) {
  assert.ok(dish.response?.file && dish.response?.text, `${dish.id} must have a dish-specific waiter response`);
  assert.ok(dish.audio && dish.image, `${dish.id} must have pronunciation audio and a professional image`);
  assert.ok(dish.terms.length >= 2, `${dish.id} must define spoken recognition terms`);
}

function collectMp3(value, found = new Set()) {
  if (Array.isArray(value)) value.forEach((item) => collectMp3(item, found));
  else if (value && typeof value === "object") Object.values(value).forEach((item) => collectMp3(item, found));
  else if (typeof value === "string" && value.endsWith(".mp3")) found.add(value);
  return found;
}

const configAudio = collectMp3(config);
const scriptAudio = new Set([...scripts.matchAll(/^###\s+`([^`]+\.mp3)`\s*$/gm)].map((match) => match[1]));
assert.equal(configAudio.size, 30, "Config must reference exactly 30 professional MP3 files");
assert.equal(scriptAudio.size, 30, "Approved script bank must contain exactly 30 MP3 scripts");
assert.deepEqual([...configAudio].sort(), [...scriptAudio].sort(), "Config and approved script bank must reference the same MP3 set");
assert.doesNotMatch(scripts, /narrator says|waiter says|ethan says|speaker\s*:/i, "ElevenLabs scripts must not include spoken role labels");

if (process.env.SKIP_REAL_AUDIO_AUDIT !== "1") {
  for (const file of configAudio) {
    const audio = path.join(root, "ingles/intermediate/audio/conversation-coach/unit-5-restaurant", file);
    assert.ok(fs.existsSync(audio), `${file} must exist`);
    assert.ok(fs.statSync(audio).size > 1000, `${file} must be a substantial MP3`);
  }
}

for (const image of [
  "cedar-stone-hero-v1.webp",
  "ethan-cole-portrait-v1.webp",
  ...config.dishes.map((dish) => dish.image)
]) {
  const file = path.join(root, "assets/img/english-intermediate/unit-5/restaurant-coach", image);
  assert.ok(fs.existsSync(file), `${image} must exist`);
  assert.ok(fs.statSync(file).size > 50000, `${image} must be a substantial professional visual asset`);
}

assert.match(page, /6 connected stages/i, "Page must explain the complete service sequence");
assert.match(page, /You are the customer/i, "Learner role must be explicit");
assert.match(page, /0\.75x[\s\S]*1x[\s\S]*1\.25x/, "Only the approved audio speeds must be visible");
assert.match(page, /audio is not stored/i, "Privacy copy must state that audio is not stored");
assert.doesNotMatch(engine, /speechSynthesis/i, "Browser speech synthesis is prohibited");
assert.doesNotMatch(engine, /api\/french/i, "Restaurant Coach must not call a French endpoint");
assert.match(engine, /language_code/, "Returned transcription language must be checked");
assert.match(engine, /frenchFeedbackWords/, "Clearly French feedback tokens must be filtered");
assert.match(css, /@media \(max-width: 980px\)/, "Tablet menu layout is required");
assert.match(css, /@media \(max-width: 560px\)/, "Mobile menu layout is required");

assert.match(practiceLab, /Unit 5 - 12 activities/, "Practice Lab quick access must show twelve Unit 5 activities");
assert.match(practiceLab, /<strong class="practice-folder-count">12 activities<\/strong>/, "Unit 5 folder must show twelve activities");
assert.match(practiceLab, /href="unit-conversation-coach-unit-5-restaurant\.html"/, "Practice Lab must link the restaurant coach");
assert.match(overview, /href="unit-conversation-coach-unit-5-restaurant\.html"/, "Course Overview must link the restaurant coach");
assert.match(unitPage, /href="unit-conversation-coach-unit-5-restaurant\.html"/, "Unit 5 explanation must link the restaurant coach");

console.log("PASS Unit 5 Dinner at Cedar & Stone static audit");
console.log(`stages=${config.stages.length} dishes=${config.dishes.length} incidents=${config.incidents.length} professionalAudio=${configAudio.size} speeds=0.75,1,1.25`);
