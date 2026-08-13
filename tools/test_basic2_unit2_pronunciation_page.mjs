import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/USER/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");

const ROOT = process.cwd();
const scriptSource = fs.readFileSync(path.join(ROOT, "assets/js/english-basic2-pronunciation-unit2.js"), "utf8");
assert.match(scriptSource, /\/api\/english-basic\/pronunciation-assessment/, "Unit 2 pronunciation must use the English Basic transcription endpoint.");
assert.doesNotMatch(scriptSource, /\/api\/french8\/pronunciation-assessment/, "Unit 2 pronunciation must never use the French transcription endpoint.");
assert.match(scriptSource, /language_code \|\| payload\.language/, "Unit 2 pronunciation must inspect the returned transcription language.");
assert.match(scriptSource, /!returnedLanguage\.startsWith\("en"\)/, "Unit 2 pronunciation must reject non-English transcription analysis.");

const BASE_URL = process.env.BASIC2_UNIT2_PRONUNCIATION_TEST_BASE_URL || "http://127.0.0.1:8020";
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

await page.goto(`${BASE_URL}/ingles/basico-2/pronunciation-unit-2-shopping-concert.html`, {
  waitUntil: "networkidle"
});

await assert.doesNotReject(async () => page.locator("h1", { hasText: "Shopping and Concert Pronunciation" }).waitFor());
await assert.doesNotReject(async () => page.locator("#readingText .reading-word").first().waitFor());

const stageDots = await page.locator(".stage-dot").count();
assert.equal(stageDots, 7, "The activity must expose 6 guided sections plus the final challenge.");

const readingText = await page.locator("#readingText").innerText();
assert.match(readingText, /jacket, jeans, sweater/i, "The first section should load Unit 2 shopping words.");

const modelSrc = await page.locator("#modelAudio").evaluate((audio) => audio.getAttribute("src"));
assert.equal(modelSrc, "audio/unit2/pronunciation/section-1-shopping-words.mp3");

const speedLabels = await page.locator("[data-speed]").evaluateAll((buttons) => buttons.map((button) => button.textContent.trim()));
assert.deepEqual(speedLabels, ["0.75", "1.0"], "Model speed buttons should include 0.75 and 1.0.");

const heroPosition = await page.locator(".lesson-hero").evaluate((node) => getComputedStyle(node).position);
assert.notEqual(heroPosition, "fixed", "Hero must not be fixed.");
assert.notEqual(heroPosition, "sticky", "Hero must not be sticky.");

const bodySizes = await page.evaluate(() => ({
  scrollWidth: document.documentElement.scrollWidth,
  clientWidth: document.documentElement.clientWidth
}));
assert.ok(bodySizes.scrollWidth <= bodySizes.clientWidth + 2, `Unexpected horizontal overflow: ${bodySizes.scrollWidth} > ${bodySizes.clientWidth}`);

const imageLoaded = await page.locator(".lesson-hero-image img").evaluate((image) => image.complete && image.naturalWidth > 0);
assert.equal(imageLoaded, true, "Hero image should load.");

const audioStatus = await page.evaluate(async () => {
  const audio = document.querySelector("#modelAudio");
  await new Promise((resolve) => {
    if (audio.readyState >= 1) return resolve();
    audio.addEventListener("loadedmetadata", resolve, { once: true });
    audio.load();
    setTimeout(resolve, 5000);
  });
  return { readyState: audio.readyState, duration: audio.duration };
});
assert.ok(audioStatus.readyState >= 1, "Model audio metadata should load.");
assert.ok(Number.isFinite(audioStatus.duration) && audioStatus.duration > 0, "Model audio duration should be available.");

assert.deepEqual(errors, [], "Page should not emit console errors.");

await browser.close();
console.log("PASS basic2 unit2 pronunciation page");
