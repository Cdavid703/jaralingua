import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/USER/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");

const ROOT = process.cwd();
const BASE_URL = process.env.BASIC2_UNIT2_HOW_MUCH_TEST_BASE_URL || "http://127.0.0.1:8020";
const pagePath = path.join(ROOT, "ingles/basico-2/practice-unit-2-how-much-is-it.html");
const heroPath = path.join(ROOT, "assets/img/english-basic-2/unit-2-shopping-experiences/how-much-is-it-hero.webp");
const audioDir = path.join(ROOT, "ingles/basico-2/audio/unit2/how-much");

assert.equal(fs.existsSync(pagePath), true, "Missing How Much Is It page");
assert.equal(fs.existsSync(heroPath), true, "Missing unique hero image");
assert.ok(fs.statSync(heroPath).size > 20000, "Hero image is unexpectedly small");

for (const file of [
  "example-singular-question.mp3",
  "example-singular-answer.mp3",
  "example-plural-question.mp3",
  "example-plural-answer.mp3"
]) {
  const fullPath = path.join(audioDir, file);
  assert.equal(fs.existsSync(fullPath), true, `Missing ElevenLabs example audio: ${file}`);
  assert.ok(fs.statSync(fullPath).size > 1000, `Audio too small: ${file}`);
}

const source = fs.readFileSync(pagePath, "utf8");
assert.match(source, /How Much Is It\?/);
assert.match(source, /How much is the jacket\?/);
assert.match(source, /How much are the sunglasses\?/);
assert.doesNotMatch(source, /How much cost/i);
assert.doesNotMatch(source, /\bCorrect\b|\bNeeds Help\b|\bExcellent\b|Score/i);

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
    || /Failed to load resource: the server responded with a status of 404/.test(text)
    || /accounts\.google\.com/.test(text);
  if (message.type() === "error" && !ignored) errors.push(text);
});
page.on("pageerror", (error) => errors.push(error.message));

await page.goto(`${BASE_URL}/ingles/basico-2/practice-unit-2-how-much-is-it.html`, { waitUntil: "networkidle" });
await assert.doesNotReject(async () => page.locator("h1", { hasText: "How Much Is It?" }).waitFor());

const heroPosition = await page.locator(".lesson-hero").evaluate((node) => getComputedStyle(node).position);
assert.notEqual(heroPosition, "fixed", "Hero must not be fixed on mobile");
assert.notEqual(heroPosition, "sticky", "Hero must not be sticky on mobile");

const bodySizes = await page.evaluate(() => ({
  scrollWidth: document.documentElement.scrollWidth,
  clientWidth: document.documentElement.clientWidth
}));
assert.ok(bodySizes.scrollWidth <= bodySizes.clientWidth + 2, `Unexpected horizontal overflow: ${bodySizes.scrollWidth} > ${bodySizes.clientWidth}`);

const heroLoaded = await page.locator(".lesson-hero-image img").evaluate((image) => image.complete && image.naturalWidth > 0);
assert.equal(heroLoaded, true, "Hero image did not load");

const cards = page.locator(".price-card");
assert.equal(await cards.count(), 12, "Expected 12 price cards");
await assert.doesNotReject(async () => page.locator(".price-card", { hasText: "$48" }).waitFor());
await assert.doesNotReject(async () => page.locator(".price-card", { hasText: "How much is the jacket?" }).waitFor());
await assert.doesNotReject(async () => page.locator(".price-card", { hasText: "How much are the sunglasses?" }).waitFor());

const firstAnswerVisible = await page.locator(".price-card").first().locator(".price-answer").evaluate((node) => getComputedStyle(node).display !== "none");
assert.equal(firstAnswerVisible, false, "Card answer should be hidden by default");

await page.locator(".price-card").first().locator('[data-action="answer"]').click();
const firstAnswerAfterClick = await page.locator(".price-card").first().locator(".price-answer").evaluate((node) => getComputedStyle(node).display !== "none");
assert.equal(firstAnswerAfterClick, true, "Card answer should be visible after clicking Show answer");

await page.locator(".price-card").first().locator('[data-action="expand"]').click();
await assert.doesNotReject(async () => page.locator("#priceModal.is-open").waitFor());
const modalState = await page.locator("#priceModal").evaluate((modal) => {
  const panel = modal.querySelector(".price-modal-panel");
  const image = modal.querySelector("#priceModalImage");
  const rect = panel.getBoundingClientRect();
  return {
    ariaHidden: modal.getAttribute("aria-hidden"),
    bodyOverflow: getComputedStyle(document.body).overflow,
    width: rect.width,
    imageLoaded: image.complete && image.naturalWidth > 0,
    answerVisible: getComputedStyle(modal.querySelector("#priceModalAnswer")).display !== "none"
  };
});
assert.equal(modalState.ariaHidden, "false");
assert.equal(modalState.bodyOverflow, "hidden");
assert.ok(modalState.width >= 340, `Expanded price modal is too narrow: ${modalState.width}`);
assert.equal(modalState.imageLoaded, true, "Expanded price card image did not load");
assert.equal(modalState.answerVisible, false, "Modal answer should be hidden by default");

await page.locator("button", { hasText: "Show / Hide Answer" }).click();
const modalAnswerVisible = await page.locator("#priceModalAnswer").evaluate((node) => getComputedStyle(node).display !== "none");
assert.equal(modalAnswerVisible, true, "Modal answer should become visible");
await page.keyboard.press("Escape");
await assert.doesNotReject(async () => page.locator("#priceModal").waitFor({ state: "hidden" }));

const audioReady = await page.evaluate(async () => {
  const audio = new Audio("audio/unit2/how-much/example-singular-question.mp3");
  await new Promise((resolve) => {
    if (audio.readyState >= 1) return resolve();
    audio.addEventListener("loadedmetadata", resolve, { once: true });
    audio.addEventListener("error", resolve, { once: true });
    audio.load();
    setTimeout(resolve, 5000);
  });
  return { readyState: audio.readyState, duration: audio.duration };
});
assert.ok(audioReady.readyState >= 1, "Example audio metadata did not load");
assert.ok(Number.isFinite(audioReady.duration) && audioReady.duration > 0, "Example audio duration is invalid");

assert.deepEqual(errors, []);
await browser.close();
console.log("PASS basic2 unit2 how much page");
