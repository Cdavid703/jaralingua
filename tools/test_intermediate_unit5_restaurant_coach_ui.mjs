import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const root = path.resolve(import.meta.dirname, "..");
const outputDir = path.join(root, ".jaralingua-local", "restaurant-coach-unit5-ui");
const sampleAudio = fs.readFileSync(path.join(root, "ingles", "intermediate", "audio", "hangman", "answers", "movies-series-1.mp3"));
const url = "http://127.0.0.1:8032/ingles/intermediate/unit-conversation-coach-unit-5-restaurant.html";

fs.mkdirSync(outputDir, { recursive: true });

function transcriptFor(topic, prompt) {
  const normalized = `${topic} ${prompt}`.toLowerCase();
  if (normalized.includes("arrival") || normalized.includes("reservation")) return "Good evening. I have a reservation under Lopez for two people.";
  if (normalized.includes("preferences") || normalized.includes("allerg")) return "I do not have any allergies, but I prefer vegetarian food.";
  if (normalized.includes("ask about the menu") || normalized.includes("made with")) return "What is the mushroom and spinach risotto made with, and how is it prepared?";
  if (normalized.includes("place the order") || normalized.includes("exactly what you would like")) return "I would like one portion of mushroom and spinach risotto, please. Could I have the Parmesan on the side?";
  if (normalized.includes("fries") || normalized.includes("wild rice")) return "Excuse me, I ordered wild rice, but I received fries. Could you please bring the correct side?";
  if (normalized.includes("sparkling water") || normalized.includes("drink is missing")) return "Excuse me, my sparkling water is missing. Could you please bring it?";
  if (normalized.includes("red onion") || normalized.includes("no onion")) return "Excuse me, I asked for no onion, but the dish has red onion. Could you please remove it?";
  if (normalized.includes("service problem")) return "Excuse me, the item I ordered is missing. Could you please bring it?";
  if (normalized.includes("check") || normalized.includes("bill")) return "Could we have the check, please? We would like separate checks.";
  return "I would like to continue the restaurant conversation, please.";
}

async function preparePage(context, viewport, apiMode = "success") {
  const page = await context.newPage();
  await page.setViewportSize(viewport);
  const errors = [];
  let nextTranscript = "";
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("**/*.mp3", (route) => route.fulfill({ status: 200, contentType: "audio/mpeg", body: sampleAudio }));
  await page.route("**/api/english-intermediate/pronunciation-assessment", async (route) => {
    if (apiMode === "failure") {
      await route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ error: "Temporary test failure" }) });
      return;
    }
    if (apiMode === "foreign") {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ text: "Elle a ete creee.", language_code: "fr", words: [{ word: "Elle", probability: .2 }], audio: { rms: .08 } }) });
      return;
    }
    const words = [
      { word: "Elle", probability: .2 },
      ...nextTranscript.split(/\s+/).map((word) => ({ word: word.replace(/[^A-Za-z']/g, ""), probability: .91 })).filter((item) => item.word)
    ];
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ text: nextTranscript, language_code: "en", words, audio: { rms: .08 } }) });
  });
  await page.goto(url, { waitUntil: "networkidle" });
  return { page, errors, setTranscript: (value) => { nextTranscript = value; } };
}

async function assertResponsive(page, label) {
  const layout = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    heroRight: document.querySelector(".coach-hero")?.getBoundingClientRect().right || 0,
    menuRight: document.querySelector(".restaurant-menu")?.getBoundingClientRect().right || 0
  }));
  assert.ok(layout.scrollWidth <= layout.innerWidth + 1, `${label}: page must not overflow horizontally`);
  assert.ok(layout.heroRight <= layout.innerWidth + 1, `${label}: hero must fit viewport`);
  assert.ok(layout.menuRight <= layout.innerWidth + 1, `${label}: menu must fit viewport`);
}

async function recordResponse(page, setTranscript, override = "") {
  await page.waitForFunction(() => !document.getElementById("questionPlayButton").disabled, null, { timeout: 15000 });
  const topic = await page.locator("#turnTopic").innerText();
  const prompt = await page.locator("#questionText").innerText();
  setTranscript(override || transcriptFor(topic, prompt));
  await page.locator("#micButton").click();
  await page.waitForTimeout(1300);
  await page.locator("#stopButton").click();
  await page.waitForFunction(() => !document.getElementById("nextTurnButton").disabled, null, { timeout: 15000 });
}

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream", "--autoplay-policy=no-user-gesture-required"]
});

try {
  const context = await browser.newContext({ permissions: ["microphone"], baseURL: "http://127.0.0.1:8032" });

  if (process.env.SKIP_REAL_AUDIO_AUDIT !== "1") {
    const audioPage = await context.newPage();
    await audioPage.goto(url, { waitUntil: "networkidle" });
    const audit = await audioPage.evaluate(async () => {
      const config = window.JaraLinguaRestaurantCoachConfig;
      const files = new Set();
      const collect = (value) => {
        if (Array.isArray(value)) return value.forEach(collect);
        if (!value || typeof value !== "object") return;
        Object.values(value).forEach((item) => {
          if (typeof item === "string" && item.endsWith(".mp3")) files.add(item);
          else collect(item);
        });
      };
      collect(config);
      return Promise.all([...files].map((file) => new Promise((resolve) => {
        const audio = new Audio(new URL(config.audioRoot + file, location.href));
        const timer = setTimeout(() => resolve({ file, ok: false, reason: "timeout" }), 10000);
        audio.addEventListener("loadedmetadata", () => {
          clearTimeout(timer);
          resolve({ file, ok: Number.isFinite(audio.duration) && audio.duration > .35, duration: audio.duration });
        }, { once: true });
        audio.addEventListener("error", () => {
          clearTimeout(timer);
          resolve({ file, ok: false, reason: `media-error-${audio.error?.code || "unknown"}` });
        }, { once: true });
        audio.load();
      })));
    });
    assert.equal(audit.length, 30, "Browser audio audit must inspect all 30 MP3 files");
    assert.deepEqual(audit.filter((item) => !item.ok), [], "Every professional MP3 must decode in Chrome");
    await audioPage.close();
  }

  for (const viewport of [
    { width: 390, height: 844, name: "mobile" },
    { width: 768, height: 1024, name: "tablet" },
    { width: 1366, height: 768, name: "laptop" }
  ]) {
    const { page, errors } = await preparePage(context, viewport);
    await assertResponsive(page, viewport.name);
    assert.equal(await page.locator("#menuPreviewGrid .restaurant-dish-card").count(), 6, `${viewport.name}: six visual menu dishes must render`);
    await page.waitForFunction(() => [...document.querySelectorAll("#menuPreviewGrid img")].every((image) => image.complete && image.naturalWidth > 0), null, { timeout: 15000 });
    await page.locator("#menuPreviewGrid").scrollIntoViewIfNeeded();
    await page.waitForTimeout(250);
    await page.screenshot({ path: path.join(outputDir, `${viewport.name}-menu.png`) });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: path.join(outputDir, `${viewport.name}-onboarding.png`), fullPage: true });
    assert.equal(errors.length, 0, `${viewport.name}: no page runtime errors expected`);
    await page.close();
  }

  const guided = await preparePage(context, { width: 1366, height: 768 });
  await guided.page.locator("[data-coach-speed='1.25']").first().click();
  assert.equal(await guided.page.locator("[data-coach-speed='1.25'].is-active").count(), 2, "Speed controls must remain synchronized");
  await guided.page.locator("#menuPreviewGrid [data-dish-select='risotto']").click();
  assert.match(await guided.page.locator("#selectedDishLabel").innerText(), /Mushroom and Spinach Risotto/, "Selected dish context must be visible");
  await guided.page.locator("#startConversationButton").click();
  await guided.page.waitForSelector("#interviewPanel:not([hidden])");
  assert.equal(await guided.page.locator("#answerSupport").getAttribute("open"), "", "Guided mode must open support");
  for (let stage = 0; stage < 6; stage += 1) {
    await recordResponse(guided.page, guided.setTranscript);
    assert.doesNotMatch(await guided.page.locator("#nextTurnButton").innerText(), /clarification/i, `Stage ${stage + 1}: a complete response must advance`);
    if (stage === 2) assert.equal(await guided.page.locator("#activeMenuPanel").isVisible(), true, "Visual menu must remain available for the menu question");
    await guided.page.locator("#nextTurnButton").click();
  }
  await guided.page.waitForSelector("#summaryPanel:not([hidden])");
  assert.match(await guided.page.locator("#summaryScore").innerText(), /^\d+$/, "Complete dinner must create a private /50 estimate");
  assert.equal(await guided.page.locator("#summaryAnswers > article").count(), 6, "Report must review all six stages");
  assert.match(await guided.page.locator("#summaryCoverage").innerText(), /6 of 6 stages analyzed/i, "Report must state full coverage");
  assert.doesNotMatch(await guided.page.locator("#summaryWords").innerText(), /\belle\b/i, "French hallucination tokens must never appear");
  await guided.page.screenshot({ path: path.join(outputDir, "laptop-summary.png"), fullPage: true });
  assert.equal(guided.errors.length, 0, "Guided dinner must not produce runtime errors");
  await guided.page.close();

  const clarification = await preparePage(context, { width: 768, height: 1024 });
  await clarification.page.locator("#startConversationButton").click();
  await clarification.page.waitForSelector("#interviewPanel:not([hidden])");
  await recordResponse(clarification.page, clarification.setTranscript, "Good evening.");
  assert.match(await clarification.page.locator("#nextTurnButton").innerText(), /clarification/i, "Missing evidence must produce one focused clarification");
  await clarification.page.locator("#nextTurnButton").click();
  assert.match(await clarification.page.locator("#turnCounter").innerText(), /Clarification/, "Clarification state must be announced");
  await recordResponse(clarification.page, clarification.setTranscript, "I have a reservation under Lopez for two people.");
  assert.match(await clarification.page.locator("#nextTurnButton").innerText(), /Continue conversation/i, "A clarification response must continue the service exchange");
  await clarification.page.close();

  const realistic = await preparePage(context, { width: 390, height: 844 });
  await realistic.page.locator("#realMode").check({ force: true });
  await realistic.page.locator("#startConversationButton").click();
  await realistic.page.waitForSelector("#interviewPanel:not([hidden])");
  assert.equal(await realistic.page.locator("#answerSupport").getAttribute("open"), null, "Real Restaurant must keep support closed");
  const dock = await realistic.page.evaluate(() => ({
    visible: !document.getElementById("floatingMicDock").hidden,
    padding: parseFloat(getComputedStyle(document.body).paddingBottom),
    height: document.getElementById("floatingMicDock").getBoundingClientRect().height
  }));
  assert.equal(dock.visible, true, "Floating controls must be visible during the conversation");
  assert.ok(dock.padding >= dock.height, "Mobile page must reserve space for floating controls");
  await assertResponsive(realistic.page, "mobile conversation");
  await realistic.page.screenshot({ path: path.join(outputDir, "mobile-real-restaurant.png"), fullPage: true });
  await realistic.page.close();

  const foreign = await preparePage(context, { width: 390, height: 844 }, "foreign");
  await foreign.page.locator("#startConversationButton").click();
  await foreign.page.waitForSelector("#interviewPanel:not([hidden])");
  await foreign.page.waitForFunction(() => !document.getElementById("questionPlayButton").disabled);
  await foreign.page.locator("#micButton").click();
  await foreign.page.waitForTimeout(1300);
  await foreign.page.locator("#stopButton").click();
  await foreign.page.waitForSelector("#transcriptionRecovery:not([hidden])", { timeout: 15000 });
  assert.match(await foreign.page.locator("#liveTranscript").innerText(), /did not return English analysis/i, "A French transcription response must be rejected");
  assert.equal(await foreign.page.locator("#nextTurnButton").isDisabled(), true, "Rejected foreign analysis must not advance");
  assert.equal(foreign.errors.length, 0, "Foreign-language rejection must not produce runtime errors");
  await foreign.page.close();

  console.log(`PASS Unit 5 Dinner at Cedar & Stone UI audit; screenshots=${outputDir}`);
} finally {
  await browser.close();
}
