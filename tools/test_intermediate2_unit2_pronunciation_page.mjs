import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const pagePath = path.join(root, "ingles", "intermediate-2", "pronunciation-unit-2-the-choice-id-make-differently.html");
const configPath = path.join(root, "assets", "js", "english-intermediate2-pronunciation-unit2.js");
const enginePath = path.join(root, "assets", "js", "english-intermediate2-pronunciation-unit1.js");
const catalogPath = path.join(root, "assets", "data", "english-intermediate-2-content.json");
const scriptPath = path.join(root, "ingles", "intermediate-2", "audio", "pronunciation", "unit-2-the-choice-id-make-differently-script.md");
const page = fs.readFileSync(pagePath, "utf8");
const config = fs.readFileSync(configPath, "utf8");
const engine = fs.readFileSync(enginePath, "utf8");
const sourceScript = fs.readFileSync(scriptPath, "utf8");
const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));

assert.match(page, /Practice Lab · Unit 2 Pronunciation/);
assert.match(page, /data-course-search-panel/);
assert.match(page, /Teacher inbox only/);
assert.match(page, /english-intermediate2-pronunciation-unit2\.js/);
assert.match(page, /english-intermediate2-pronunciation-unit1\.js/);
assert.doesNotMatch(page + config + engine, /speechSynthesis|SpeechSynthesisUtterance/);
assert.match(config, /\/api\/english-intermediate\/pronunciation-assessment|apiPath/);
assert.match(config, /\/api\/intermediate2\/unit2-pronunciation\/submit/);
assert.match(page + config, /gradebook|Grades|teacher/i);
assert.match(config, /speechEquivalences/);
assert.match(engine, /canonicalSpeech/);
assert.match(engine, /aria-controls="wordHelp"/);
assert.match(engine, /How to pronounce/);
assert.match(engine, /scrollIntoView\(\{ behavior: "smooth", block: "nearest" \}\)/);
assert.match(engine, /function wordCue\(/);
assert.match(engine, /modelAudio\.currentTime = cue\.start/);
assert.match(engine, /setTimeout\(\(\) => \{/);
assert.match(engine, /loadedmetadata/);
assert.match(engine, /Tap to hear this word in the ElevenLabs model/);

for (const match of page.matchAll(/(?:href|src)="([^"]+)"/g)) {
  const reference = match[1];
  if (/^(?:https?:|#)/.test(reference)) continue;
  const cleanReference = reference.split(/[?#]/)[0];
  if (!cleanReference) continue;
  const target = cleanReference.startsWith("/")
    ? path.join(root, cleanReference.slice(1))
    : path.resolve(path.dirname(pagePath), cleanReference);
  assert.ok(fs.existsSync(target), `Broken local page reference: ${reference}`);
}

const stageTexts = [...config.matchAll(/text: "([^"]+)"/g)].map((match) => match[1]);
assert.equal(stageTexts.length, 5);
const guided = stageTexts.slice(0, 4);
assert.equal(stageTexts[4], guided.join(" "));
guided.forEach((text) => assert.ok(sourceScript.includes(`> ${text}`), `Missing exact script text: ${text}`));

const item = catalog.items.find((entry) => entry.id === "unit-2-the-choice-id-make-differently-pronunciation");
assert.ok(item);
assert.equal(item.unit, 2);
assert.equal(item.order, 3);
assert.equal(item.audioProvider, "elevenlabs");
assert.equal(item.teacherSubmission, true);
assert.equal(item.gradebookProjected, false);
assert.equal(item.affectsAverage, false);
assert.equal(item.status, "published");
const published = catalog.items.filter((entry) => entry.status === "published");
assert.equal(published.length, 8);
assert.equal(published.filter((entry) => entry.unit === 2).length, 3);

for (const relativePath of [
  "assets/img/english-intermediate-2/unit-2/pronunciation-the-choice-id-make-differently/the-choice-id-make-differently-hero-v1.png",
  "ingles/intermediate-2/audio/pronunciation/unit-2-intermediate2/section-1.mp3",
  "ingles/intermediate-2/audio/pronunciation/unit-2-intermediate2/section-2.mp3",
  "ingles/intermediate-2/audio/pronunciation/unit-2-intermediate2/section-3.mp3",
  "ingles/intermediate-2/audio/pronunciation/unit-2-intermediate2/section-4.mp3",
  "ingles/intermediate-2/audio/pronunciation/unit-2-intermediate2/the-choice-id-make-differently-model-us.mp3"
]) {
  const absolutePath = path.join(root, relativePath);
  assert.ok(fs.existsSync(absolutePath), `Missing asset: ${relativePath}`);
  assert.ok(fs.statSync(absolutePath).size > 10000, `Asset is too small: ${relativePath}`);
}

console.log("Intermediate 2 Unit 2 pronunciation page contract passed.");
