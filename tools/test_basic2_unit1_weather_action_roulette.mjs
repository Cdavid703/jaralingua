import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/USER/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");

const ROOT = process.cwd();
const BASE_URL = process.env.BASIC2_UNIT1_WEATHER_ROULETTE_TEST_BASE_URL || "http://127.0.0.1:8020";
const pagePath = path.join(ROOT, "ingles/basico-2/practice-unit-1-weather-action-roulette.html");
const heroPath = path.join(ROOT, "assets/img/english-basic-2/unit-1-going-out/weather-action-roulette-hero.webp");

assert.equal(fs.existsSync(pagePath), true, "Missing weather action roulette page");
assert.equal(fs.existsSync(heroPath), true, "Missing unique weather action roulette hero image");
assert.ok(fs.statSync(heroPath).size > 20000, "Hero image is unexpectedly small");

const source = fs.readFileSync(pagePath, "utf8");
assert.match(source, /Weather Action Roulette/);
assert.doesNotMatch(source, /\bCorrect\b|\bNeeds Help\b|\bExcellent\b/);
assert.doesNotMatch(source, /Advanced Challenge|activity level|speaking level/i);
assert.doesNotMatch(source, /no model answer/i);
assert.match(source, /Useful model answer/);
assert.match(source, /It&apos;s cloudy, so I&apos;m wearing a jacket and I&apos;m walking to a cafe\./);
assert.match(source, /It&apos;s sunny, so I&apos;m wearing sunglasses and I&apos;m going for a walk\./);
assert.match(source, /weather-action-roulette-hero\.webp/);

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

await page.goto(`${BASE_URL}/ingles/basico-2/practice-unit-1-weather-action-roulette.html`, { waitUntil: "networkidle" });
await assert.doesNotReject(async () => page.locator("h1", { hasText: "Weather Action Roulette" }).waitFor());
await assert.doesNotReject(async () => page.locator(".weather-model-answer", { hasText: "It's cloudy, so I'm wearing a jacket" }).first().waitFor());

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

const hiddenCards = page.locator(".weather-hidden-card");
assert.equal(await hiddenCards.count(), 8, "Expected 8 weather cards");
await expectNoEvaluationButtons(page);

await page.locator("button", { hasText: "Use Sample Names" }).click();
await assert.doesNotReject(async () => page.locator("#studentPoolList", { hasText: "Alex" }).waitFor());

await hiddenCards.first().click();
await assert.doesNotReject(async () => page.locator("#weatherCardModal.is-open").waitFor());
const modalState = await page.locator("#weatherCardModal").evaluate((modal) => {
  const panel = modal.querySelector(".weather-card-modal-panel");
  const image = modal.querySelector("#weatherModalImage");
  const bodyOverflow = getComputedStyle(document.body).overflow;
  const rect = panel.getBoundingClientRect();
  return {
    ariaHidden: modal.getAttribute("aria-hidden"),
    bodyOverflow,
    width: rect.width,
    imageLoaded: image.complete && image.naturalWidth > 0
  };
});
assert.equal(modalState.ariaHidden, "false");
assert.equal(modalState.bodyOverflow, "hidden");
assert.ok(modalState.width >= 340, `Expanded weather modal is too narrow: ${modalState.width}`);
assert.equal(modalState.imageLoaded, true, "Expanded weather card image did not load");
await page.keyboard.press("Escape");
await assert.doesNotReject(async () => page.locator("#weatherCardModal").waitFor({ state: "hidden" }));
await assert.doesNotReject(async () => page.locator("#currentWeatherName").waitFor());
const selectedWeather = (await page.locator("#currentWeatherName").innerText()).trim();
assert.notEqual(selectedWeather, "-", "Weather card was not revealed");

await page.locator("#spinStudentBtn").click();
await page.waitForTimeout(2800);
const selectedStudent = (await page.locator("#currentStudentName").innerText()).trim();
assert.notEqual(selectedStudent, "-", "Student roulette did not select a student");

await page.locator("#saveRoundBtn").click();
await assert.doesNotReject(async () => page.locator("#weatherHistoryBody tr", { hasText: selectedStudent }).waitFor());
await assert.doesNotReject(async () => page.locator("#weatherHistoryBody tr", { hasText: selectedWeather }).waitFor());
assert.equal((await page.locator("#roundCount").innerText()).trim(), "1");

await expectNoEvaluationButtons(page);
assert.deepEqual(errors, []);
await browser.close();
console.log("PASS basic2 unit1 weather action roulette");

async function expectNoEvaluationButtons(page) {
  const buttonLabels = await page.locator("button").evaluateAll((buttons) => buttons.map((button) => button.textContent.trim()).join(" | "));
  assert.doesNotMatch(buttonLabels, /\bCorrect\b|\bNeeds Help\b|\bExcellent\b|Score|Point/i);
}
