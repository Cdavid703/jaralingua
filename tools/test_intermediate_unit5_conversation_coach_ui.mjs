import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const root = path.resolve(import.meta.dirname, "..");
const outputDir = path.join(root, ".jaralingua-local", "conversation-coach-unit5-ui");
const sampleAudio = fs.readFileSync(path.join(root, "ingles", "intermediate", "audio", "hangman", "answers", "movies-series-1.mp3"));
const url = "http://127.0.0.1:8025/ingles/intermediate/unit-conversation-coach-unit-5.html";

fs.mkdirSync(outputDir, { recursive: true });

function transcriptFor(topic) {
  const normalized = topic.toLowerCase();
  if (normalized.includes("source")) return "Chocolate is made from cocoa beans. The beans are roasted and processed before they become chocolate.";
  if (normalized.includes("dish and")) return "A dish I know well is lentil soup. It is made with lentils, vegetables, and spices.";
  if (normalized.includes("meal quantities")) return "For four people, we need two cups of rice, a can of beans, a few tomatoes, and a little olive oil.";
  if (normalized.includes("containers")) return "I would buy two bottles of water, a carton of yogurt, a bag of nuts, and a few apples.";
  if (normalized.includes("identity")) return "Arepas represent my family because we prepare them together. They remind me of weekend breakfasts at home.";
  if (normalized.includes("comparison")) return "Both arepas and tortillas are made from corn, but arepas are thicker while tortillas are thinner.";
  if (normalized.includes("snack")) return "I recommend Japanese onigiri because it is soft and savory. It is made with rice and traditional fillings.";
  return "What is your favorite dish and what is it made with? How do you prepare it and why do you recommend it?";
}

async function preparePage(context, viewport, apiMode = "success") {
  const page = await context.newPage();
  await page.setViewportSize(viewport);
  const errors = [];
  let nextTranscript = "";
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("**/*.mp3", (route) => route.fulfill({ status: 200, contentType: "audio/mpeg", body: sampleAudio }));
  await page.route("**/api/french8/pronunciation-assessment", async (route) => {
    if (apiMode === "failure") {
      await route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ error: "Temporary test failure" }) });
      return;
    }
    const words = nextTranscript.split(/\s+/).map((word) => ({ word: word.replace(/[^A-Za-z']/g, ""), probability: .91 })).filter((item) => item.word);
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ text: nextTranscript, words, audio: { rms: .08 } }) });
  });
  await page.goto(url, { waitUntil: "networkidle" });
  return { page, errors, setTranscript: (value) => { nextTranscript = value; } };
}

async function assertResponsive(page, label) {
  const layout = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    heroRight: document.querySelector(".coach-hero")?.getBoundingClientRect().right || 0,
    imageRight: document.querySelector(".coach-hero-visual")?.getBoundingClientRect().right || 0,
    bodyPaddingBottom: parseFloat(getComputedStyle(document.body).paddingBottom) || 0
  }));
  assert.ok(layout.scrollWidth <= layout.innerWidth + 1, `${label}: page must not overflow horizontally`);
  assert.ok(layout.heroRight <= layout.innerWidth + 1, `${label}: hero must fit viewport`);
  assert.ok(layout.imageRight <= layout.innerWidth + 1, `${label}: professional visual must fit viewport`);
}

async function recordTurn(page, setTranscript) {
  await page.waitForFunction(() => !document.getElementById("questionPlayButton").disabled);
  const topic = await page.locator("#turnTopic").innerText();
  setTranscript(transcriptFor(topic));
  await page.locator("#micButton").click();
  await page.waitForTimeout(1300);
  await page.locator("#stopButton").click();
  await page.waitForFunction(() => !document.getElementById("nextTurnButton").disabled, null, { timeout: 15000 });
  assert.ok((await page.locator("#liveTranscript").innerText()).length > 12, "A usable transcript must appear");
}

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream", "--autoplay-policy=no-user-gesture-required"]
});

try {
  const context = await browser.newContext({ permissions: ["microphone"], baseURL: "http://127.0.0.1:8025" });
  const audioAuditPage = await context.newPage();
  await audioAuditPage.goto(url, { waitUntil: "networkidle" });
  const audioAudit = await audioAuditPage.evaluate(async () => {
    const config = window.JaraLinguaConversationCoachConfig;
    const files = new Set();
    const collect = (value) => {
      if (Array.isArray(value)) return value.forEach(collect);
      if (!value || typeof value !== "object") return;
      Object.values(value).forEach((item) => {
        if (typeof item === "string" && item.endsWith(".mp3")) files.add(item);
        else collect(item);
      });
    };
    collect(config.audio);
    collect(config.questions);
    collect(config.interactionResponses);
    collect(config.defaultInteractionResponse);
    return Promise.all([...files].map((file) => new Promise((resolve) => {
      const audio = new Audio(new URL(config.audioRoot + file, location.href));
      const timer = setTimeout(() => resolve({ file, ok: false, reason: "timeout" }), 10000);
      audio.addEventListener("loadedmetadata", () => {
        clearTimeout(timer);
        resolve({ file, ok: Number.isFinite(audio.duration) && audio.duration > .4, duration: audio.duration });
      }, { once: true });
      audio.addEventListener("error", () => {
        clearTimeout(timer);
        resolve({ file, ok: false, reason: `media-error-${audio.error?.code || "unknown"}` });
      }, { once: true });
      audio.load();
    })));
  });
  assert.equal(audioAudit.length, 28, "Browser audio audit must inspect all 28 MP3 files");
  assert.deepEqual(audioAudit.filter((item) => !item.ok), [], "Every professional MP3 must decode in Chrome with a valid duration");
  await audioAuditPage.close();

  for (const viewport of [
    { width: 390, height: 844, name: "mobile" },
    { width: 768, height: 1024, name: "tablet" },
    { width: 1366, height: 768, name: "laptop" }
  ]) {
    const { page, errors } = await preparePage(context, viewport);
    await assertResponsive(page, viewport.name);
    await page.screenshot({ path: path.join(outputDir, `${viewport.name}-onboarding.png`), fullPage: true });
    assert.equal(errors.length, 0, `${viewport.name}: no page runtime errors expected`);
    await page.close();
  }

  const guided = await preparePage(context, { width: 1366, height: 768 });
  await guided.page.locator("[data-coach-speed='1.25']").first().click();
  assert.equal(await guided.page.locator("[data-coach-speed='1.25'].is-active").count(), 2, "Speed controls must stay synchronized");
  await guided.page.locator("#startConversationButton").click();
  await guided.page.waitForSelector("#interviewPanel:not([hidden])");
  assert.equal(await guided.page.locator("#answerSupport").getAttribute("open"), "", "Guided mode must open support");
  for (let turn = 0; turn < 4; turn += 1) {
    await recordTurn(guided.page, guided.setTranscript);
    if (turn === 0) assert.equal(await guided.page.locator("#turnFeedback").isVisible(), true, "Guided mode must show turn feedback");
    await guided.page.locator("#nextTurnButton").click();
  }
  await guided.page.waitForSelector("#summaryPanel:not([hidden])");
  assert.match(await guided.page.locator("#summaryScore").innerText(), /^\d+$/, "Complete guided attempt must create a /50 estimate");
  assert.equal(await guided.page.locator("#summaryAnswers article").count(), 4, "Report must review all four turns");
  await guided.page.screenshot({ path: path.join(outputDir, "laptop-summary.png"), fullPage: true });
  assert.equal(guided.errors.length, 0, "Guided conversation must not produce runtime errors");
  await guided.page.close();

  const realistic = await preparePage(context, { width: 390, height: 844 });
  await realistic.page.locator("#realMode").check({ force: true });
  await realistic.page.locator("#startConversationButton").click();
  await realistic.page.waitForSelector("#interviewPanel:not([hidden])");
  assert.equal(await realistic.page.locator("#answerSupport").getAttribute("open"), null, "Real Conversation must keep support closed");
  const dockLayout = await realistic.page.evaluate(() => ({
    visible: !document.getElementById("floatingMicDock").hidden,
    padding: parseFloat(getComputedStyle(document.body).paddingBottom),
    dockHeight: document.getElementById("floatingMicDock").getBoundingClientRect().height
  }));
  assert.equal(dockLayout.visible, true, "Floating controls must be visible during a conversation");
  assert.ok(dockLayout.padding >= dockLayout.dockHeight, "Mobile page must reserve space for floating controls");
  await assertResponsive(realistic.page, "mobile conversation");
  await realistic.page.screenshot({ path: path.join(outputDir, "mobile-real-conversation.png"), fullPage: true });
  await realistic.page.close();

  const recovery = await preparePage(context, { width: 768, height: 1024 }, "failure");
  await recovery.page.locator("#startConversationButton").click();
  await recovery.page.waitForSelector("#interviewPanel:not([hidden])");
  await recovery.page.waitForFunction(() => !document.getElementById("questionPlayButton").disabled);
  await recovery.page.locator("#micButton").click();
  await recovery.page.waitForTimeout(1300);
  await recovery.page.locator("#stopButton").click();
  await recovery.page.waitForSelector("#transcriptionRecovery:not([hidden])", { timeout: 15000 });
  assert.equal(await recovery.page.locator("#nextTurnButton").isDisabled(), true, "Failed analysis must not silently enable Continue");
  await recovery.page.locator("#continueUnscoredButton").click();
  await recovery.page.waitForFunction(() => !document.getElementById("nextTurnButton").disabled, null, { timeout: 10000 });
  assert.match(await recovery.page.locator("#liveTranscript").innerText(), /not transcribed or scored/i, "Recovery must state that no score was invented");
  assert.equal(recovery.errors.length, 0, "Recovery path must not produce runtime errors");
  await recovery.page.close();

  console.log(`PASS Unit 5 Conversation Coach UI audit; screenshots=${outputDir}`);
} finally {
  await browser.close();
}
