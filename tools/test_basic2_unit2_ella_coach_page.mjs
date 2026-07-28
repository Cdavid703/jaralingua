import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/USER/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");

const ROOT = process.cwd();
const BASE_URL = process.env.BASIC2_UNIT2_ELLA_COACH_TEST_BASE_URL || "http://127.0.0.1:8020";
const dataPath = path.join(ROOT, "assets/js/conversation-coach-data/english-basic-2-unit-2-shopping-ella.js");
const source = fs.readFileSync(dataPath, "utf8");
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(source, sandbox, { filename: dataPath });

const config = sandbox.window.JaraLinguaConversationCoachConfig;
assert.equal(config.character.name, "Ella Brooks");
assert.equal(config.attemptQuestionCount, 5);
assert.equal(config.questions.length, 8);
assert.equal(config.mandatoryQuestionIds.includes("b2u2-q8-ask-ella"), true);
assert.equal(config.questions.some((question) => /Sofia|Lucas|Noah|Mia/.test(question.text)), false);

const audioFiles = new Set();
if (config.audio?.welcome) audioFiles.add(config.audio.welcome);
if (config.audio?.instructions) audioFiles.add(config.audio.instructions);
for (const key of ["needDetail", "noSpeech", "serviceRecovery", "closing"]) {
  if (config.audio?.[key]?.file) audioFiles.add(config.audio[key].file);
}
for (const question of config.questions) {
  audioFiles.add(question.audio);
  for (const entry of question.reactionResponses || []) audioFiles.add(entry.file);
}
for (const entry of config.reactionResponses || []) audioFiles.add(entry.file);
for (const entry of config.interactionResponses || []) audioFiles.add(entry.file);
if (config.defaultInteractionResponse?.file) audioFiles.add(config.defaultInteractionResponse.file);

const audioDir = path.join(ROOT, "ingles/basico-2", config.audioRoot);
for (const file of audioFiles) {
  const fullPath = path.join(audioDir, file);
  assert.equal(fs.existsSync(fullPath), true, `Missing audio: ${file}`);
  assert.ok(fs.statSync(fullPath).size > 1000, `Audio too small: ${file}`);
}
assert.equal(audioFiles.size, 26);

for (const imagePath of [config.character.hero, config.character.portrait]) {
  const normalized = imagePath.replace("../../", "");
  const fullPath = path.join(ROOT, normalized);
  assert.equal(fs.existsSync(fullPath), true, `Missing image: ${imagePath}`);
}

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
});
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
page.on("console", (message) => {
  const text = message.text();
  const ignored = /ERR_NETWORK_ACCESS_DENIED/.test(text)
    || /upgrade-insecure-requests/.test(text)
    || /csp-report/.test(text)
    || /Failed to load resource: the server responded with a status of 404/.test(text);
  if (message.type() === "error" && !ignored) errors.push(text);
});
page.on("pageerror", (error) => errors.push(error.message));

await page.goto(`${BASE_URL}/ingles/basico-2/conversation-coach-unit-2-shopping-ella.html`, { waitUntil: "networkidle" });
await assert.doesNotReject(async () => page.locator("h1", { hasText: "Shopping with Ella" }).waitFor());
await assert.doesNotReject(async () => page.locator("text=Hi, I'm Ella Brooks").waitFor());

const speedLabels = await page.locator("[data-coach-speed]").evaluateAll((buttons) => [...new Set(buttons.map((button) => button.textContent.trim()))]);
assert.deepEqual(speedLabels, ["0.75x", "1x", "1.25x"]);

const heroPosition = await page.locator(".coach-hero").evaluate((node) => getComputedStyle(node).position);
assert.notEqual(heroPosition, "fixed");
assert.notEqual(heroPosition, "sticky");

const bodySizes = await page.evaluate(() => ({
  scrollWidth: document.documentElement.scrollWidth,
  clientWidth: document.documentElement.clientWidth
}));
assert.ok(bodySizes.scrollWidth <= bodySizes.clientWidth + 2, `Unexpected horizontal overflow: ${bodySizes.scrollWidth} > ${bodySizes.clientWidth}`);

const imageLoaded = await page.locator(".coach-hero-visual img").evaluate((image) => image.complete && image.naturalWidth > 0);
assert.equal(imageLoaded, true);

await page.locator("#startConversationButton").click();
await assert.doesNotReject(async () => page.locator("#interviewPanel").waitFor());
await assert.doesNotReject(async () => page.locator("#floatingMicDock").waitFor());
const dockHidden = await page.locator("#floatingMicDock").evaluate((node) => node.hidden);
assert.equal(dockHidden, false, "Floating microphone dock should be visible during active conversation.");

const turnText = await page.locator("#turnCounter").innerText();
assert.match(turnText, /Turn 1 of 5/);
const questionText = await page.locator("#questionText").innerText();
assert.ok(/Ella|After class/i.test(questionText));

const questionAudioReady = await page.evaluate(async () => {
  const audio = document.querySelector("#questionAudio");
  await new Promise((resolve) => {
    if (audio.readyState >= 1) return resolve();
    audio.addEventListener("loadedmetadata", resolve, { once: true });
    audio.load();
    setTimeout(resolve, 5000);
  });
  return { readyState: audio.readyState, duration: audio.duration };
});
assert.ok(questionAudioReady.readyState >= 1);
assert.ok(Number.isFinite(questionAudioReady.duration) && questionAudioReady.duration > 0);

assert.deepEqual(errors, []);
await browser.close();
console.log("PASS basic2 unit2 Ella conversation coach page");
