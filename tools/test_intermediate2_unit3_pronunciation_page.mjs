import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const pagePath = path.join(root, "ingles", "intermediate-2", "pronunciation-unit-3-sound-clear-tech-support.html");
const configPath = path.join(root, "assets", "js", "english-intermediate2-pronunciation-unit3.js");
const enginePath = path.join(root, "assets", "js", "english-intermediate2-pronunciation-unit1.js");
const stylesPath = path.join(root, "assets", "css", "english-intermediate2-pronunciation.css");
const catalogPath = path.join(root, "assets", "data", "english-intermediate-2-content.json");
const scriptPath = path.join(root, "ingles", "intermediate-2", "audio", "pronunciation", "unit-3-sound-clear-tech-support-script.md");
const page = fs.readFileSync(pagePath, "utf8");
const config = fs.readFileSync(configPath, "utf8");
const engine = fs.readFileSync(enginePath, "utf8");
const styles = fs.readFileSync(stylesPath, "utf8");
const sourceScript = fs.readFileSync(scriptPath, "utf8");
const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));

assert.match(page, /Practice Lab · Unit 3 Pronunciation/);
assert.match(page, /Sound Clear in Tech Support/);
assert.match(page, /Teacher inbox only/);
assert.match(page, /data-pronunciation-submit-mount/);
assert.match(page, /ie2-pronunciation-control-deck/);
assert.match(page, /ie2-pronunciation-workspace/);
assert.match(page, /english-intermediate2-pronunciation-unit3\.js/);
assert.match(page, /english-intermediate2-pronunciation-unit1\.js/);
assert.doesNotMatch(page + config + engine, /speechSynthesis|SpeechSynthesisUtterance/);
assert.match(config, /\/api\/english-intermediate\/pronunciation-assessment/);
assert.match(config, /\/api\/intermediate2\/unit3-pronunciation\/submit/);
assert.match(config, /\/api\/intermediate2\/unit3-pronunciation\/submissions/);
assert.match(config, /wordAudioBase/);
assert.match(engine, /aria-controls="wordHelp"/);
assert.match(engine, /new Audio\(source\)/);
assert.match(engine, /Tap to hear this word in the pronunciation model/);
assert.match(styles, /\.ie2-pronunciation-unit3-page \.ie2-pronunciation-hero/);
assert.match(styles, /\.ie2-pronunciation-unit3-page \.ie2-pronunciation-workspace\{display:grid/);

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

const item = catalog.items.find((entry) => entry.id === "unit-3-sound-clear-tech-support-pronunciation");
assert.ok(item);
assert.equal(item.unit, 3);
assert.equal(item.order, 1);
assert.equal(item.audioProvider, "elevenlabs");
assert.equal(item.teacherSubmission, true);
assert.equal(item.gradebookProjected, false);
assert.equal(item.affectsAverage, false);
assert.equal(item.status, "published");

for (const relativePath of [
  "assets/img/english-intermediate-2/unit-3/pronunciation-tech-support-digital-safety/pronunciation-tech-support-hero-v1.png",
  "ingles/intermediate-2/audio/pronunciation/unit-3-intermediate2/section-1.mp3",
  "ingles/intermediate-2/audio/pronunciation/unit-3-intermediate2/section-2.mp3",
  "ingles/intermediate-2/audio/pronunciation/unit-3-intermediate2/section-3.mp3",
  "ingles/intermediate-2/audio/pronunciation/unit-3-intermediate2/section-4.mp3",
  "ingles/intermediate-2/audio/pronunciation/unit-3-intermediate2/sound-clear-in-tech-support-model-us.mp3"
]) {
  const absolutePath = path.join(root, relativePath);
  assert.ok(fs.existsSync(absolutePath), `Missing asset: ${relativePath}`);
  assert.ok(fs.statSync(absolutePath).size > 10000, `Asset is too small: ${relativePath}`);
}

const wordAudioDirectory = path.join(root, "ingles", "intermediate-2", "audio", "pronunciation", "unit-3-intermediate2", "words");
const wordAudioFiles = fs.readdirSync(wordAudioDirectory).filter((file) => file.endsWith(".mp3"));
assert.equal(wordAudioFiles.length, 52);
for (const file of ["freezing.mp3", "settings.mp3", "mustnt.mp3", "suspicious.mp3", "password.mp3"]) {
  const absolutePath = path.join(wordAudioDirectory, file);
  assert.ok(fs.existsSync(absolutePath), `Missing word model: ${file}`);
  assert.ok(fs.statSync(absolutePath).size > 1000, `Word model is too small: ${file}`);
}

console.log("Intermediate 2 Unit 3 pronunciation page contract passed.");

