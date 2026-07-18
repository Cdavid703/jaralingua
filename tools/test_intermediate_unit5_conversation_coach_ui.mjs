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

function transcriptFor(prompt, topic = "") {
  const normalized = `${prompt} ${topic}`.toLowerCase();
  if (normalized.includes("most important flavor")) return "The most important ingredient is garlic because it gives the dish a savory flavor.";
  if (normalized.includes("prepare this dish for")) return "I would prepare it for my family because it is easy to share, and I recommend it because it is filling.";
  if (normalized.includes("original ingredient before")) return "First, the cocoa beans are roasted and ground. Then, the processed cocoa becomes chocolate.";
  if (normalized.includes("another product made from")) return "Cheese is made from milk. The milk is processed before it becomes solid cheese.";
  if (normalized.includes("two more people")) return "For two more people, I would add one more cup of rice and another can of beans.";
  if (normalized.includes("most difficult to estimate")) return "The most difficult quantity is the oil, and I would measure it with a tablespoon.";
  if (normalized.includes("specific memory")) return "This dish reminds me of my childhood because my family always prepared it together at home.";
  if (normalized.includes("people usually share")) return "People usually share it during a family celebration, and it is prepared by my grandmother.";
  if (normalized.includes("one more similarity")) return "Both dishes use corn and are served warm. However, arepas are thicker, while tortillas are thinner.";
  if (normalized.includes("recommend to a visitor")) return "I would recommend arepas to a visitor because they offer an interesting traditional cultural experience.";
  if (normalized.includes("exact taste or texture")) return "Someone should try it because it is crispy, savory, and worth trying with the soft filling.";
  if (normalized.includes("serve to one person")) return "I would serve two pieces per person with a little sauce and a fresh salad.";
  if (normalized.includes("source")) return "Chocolate is made from cocoa beans. The beans are roasted and processed before they become chocolate.";
  if (normalized.includes("dish and")) return "A dish I know well is lentil soup. It is made with lentils, vegetables, and spices.";
  if (normalized.includes("meal quantities")) return "For four people, we need two cups of rice, a can of beans, a few tomatoes, and a little olive oil.";
  if (normalized.includes("containers")) return "I would buy two bottles of water, a carton of yogurt, a bag of nuts, and a few apples.";
  if (normalized.includes("identity")) return "Arepas represent my family because we prepare them together. They remind me of weekend breakfasts at home.";
  if (normalized.includes("comparison")) return "Both arepas and tortillas are made from corn, but arepas are thicker while tortillas are thinner and easier to fold around ingredients.";
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
  await page.route("**/api/english-intermediate/pronunciation-assessment", async (route) => {
    if (apiMode === "failure") {
      await route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ error: "Temporary test failure" }) });
      return;
    }
    if (apiMode === "foreign") {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ text: "Elle a été créée.", language_code: "fr", words: [{ word: "Elle", probability: .2 }, { word: "été", probability: .2 }, { word: "créée", probability: .2 }], audio: { rms: .08 } }) });
      return;
    }
    const words = [
      { word: "Elle", probability: .2 },
      { word: "été", probability: .2 },
      { word: "créée", probability: .2 },
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
    imageRight: document.querySelector(".coach-hero-visual")?.getBoundingClientRect().right || 0,
    bodyPaddingBottom: parseFloat(getComputedStyle(document.body).paddingBottom) || 0
  }));
  assert.ok(layout.scrollWidth <= layout.innerWidth + 1, `${label}: page must not overflow horizontally`);
  assert.ok(layout.heroRight <= layout.innerWidth + 1, `${label}: hero must fit viewport`);
  assert.ok(layout.imageRight <= layout.innerWidth + 1, `${label}: professional visual must fit viewport`);
}

async function recordResponse(page, setTranscript) {
  await page.waitForFunction(() => !document.getElementById("questionPlayButton").disabled);
  const topic = await page.locator("#turnTopic").innerText();
  const prompt = await page.locator("#questionText").innerText();
  setTranscript(transcriptFor(prompt, topic));
  await page.locator("#micButton").click();
  await page.waitForTimeout(1300);
  await page.locator("#stopButton").click();
}

async function recordMainAndFollowUp(page, setTranscript) {
  const initialPrompt = await page.locator("#questionText").innerText();
  await recordResponse(page, setTranscript);
  await page.waitForFunction((previousPrompt) => document.getElementById("turnCounter").textContent.includes("Follow-up") && document.getElementById("questionText").textContent !== previousPrompt, initialPrompt, { timeout: 15000 });
  assert.equal(await page.locator("#nextTurnButton").isDisabled(), true, "Initial answer must not bypass Maya's follow-up");
  assert.match(await page.locator("#turnCounter").innerText(), /Follow-up/, "The second exchange must be clearly identified");
  const usesCompleteRoute = await page.evaluate(() => {
    const visible = document.getElementById("questionText").textContent;
    return Object.values(window.JaraLinguaConversationCoachConfig.followUpSets).some((set) => set.complete.text === visible);
  });
  assert.equal(usesCompleteRoute, true, "A complete initial answer must receive an extension follow-up");
  await recordResponse(page, setTranscript);
  await page.waitForFunction(() => !document.getElementById("nextTurnButton").disabled, null, { timeout: 15000 });
  assert.ok((await page.locator("#liveTranscript").innerText()).length > 12, "A usable follow-up transcript must appear");
}

async function recordRoleReversal(page, setTranscript) {
  await recordResponse(page, setTranscript);
  await page.waitForFunction(() => !document.getElementById("nextTurnButton").disabled, null, { timeout: 15000 });
  assert.ok((await page.locator("#liveTranscript").innerText()).length > 12, "A usable role-reversal transcript must appear");
}

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream", "--autoplay-policy=no-user-gesture-required"]
});

try {
  const context = await browser.newContext({ permissions: ["microphone"], baseURL: "http://127.0.0.1:8025" });
  if (process.env.SKIP_REAL_AUDIO_AUDIT !== "1") {
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
      collect(config.followUpSets);
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
    assert.equal(audioAudit.length, 40, "Browser audio audit must inspect all 40 MP3 files");
    assert.deepEqual(audioAudit.filter((item) => !item.ok), [], "Every professional MP3 must decode in Chrome with a valid duration");
    await audioAuditPage.close();
  }

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
    if (turn < 3) await recordMainAndFollowUp(guided.page, guided.setTranscript);
    else await recordRoleReversal(guided.page, guided.setTranscript);
    if (turn === 0) assert.equal(await guided.page.locator("#turnFeedback").isVisible(), true, "Guided mode must show response feedback");
    await guided.page.locator("#nextTurnButton").click();
  }
  await guided.page.waitForSelector("#summaryPanel:not([hidden])");
  assert.match(await guided.page.locator("#summaryScore").innerText(), /^\d+$/, "Complete guided attempt must create a /50 estimate");
  assert.equal(await guided.page.locator("#summaryAnswers article").count(), 4, "Report must review all four turns");
  assert.equal(await guided.page.locator("#summaryAnswers .coach-answer-phase").count(), 7, "Report must separate all seven spoken responses");
  assert.match(await guided.page.locator("#summaryCoverage").innerText(), /7 of 7 responses analyzed/i, "Report must state complete seven-response coverage");
  assert.doesNotMatch(await guided.page.locator("#summaryWords").innerText(), /\belle\b|été|créée/i, "French hallucination tokens must never appear in English feedback");
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
  await recovery.page.waitForFunction(() => document.getElementById("turnCounter").textContent.includes("Follow-up"), null, { timeout: 10000 });
  assert.equal(await recovery.page.locator("#nextTurnButton").isDisabled(), true, "An unscored initial answer must still require the follow-up");
  const usesMissingEvidenceRoute = await recovery.page.evaluate(() => {
    const visible = document.getElementById("questionText").textContent;
    return Object.values(window.JaraLinguaConversationCoachConfig.followUpSets).some((set) => set.incomplete.text === visible);
  });
  assert.equal(usesMissingEvidenceRoute, true, "An unscored initial answer must receive the missing-evidence follow-up");
  await recovery.page.waitForFunction(() => !document.getElementById("questionPlayButton").disabled);
  await recovery.page.locator("#micButton").click();
  await recovery.page.waitForTimeout(1300);
  await recovery.page.locator("#stopButton").click();
  await recovery.page.waitForSelector("#transcriptionRecovery:not([hidden])", { timeout: 15000 });
  await recovery.page.locator("#continueUnscoredButton").click();
  await recovery.page.waitForFunction(() => !document.getElementById("nextTurnButton").disabled, null, { timeout: 10000 });
  assert.match(await recovery.page.locator("#liveTranscript").innerText(), /follow-up.*not transcribed or scored/i, "Recovery must state that no follow-up score was invented");
  assert.equal(recovery.errors.length, 0, "Recovery path must not produce runtime errors");
  await recovery.page.close();

  const foreignLanguage = await preparePage(context, { width: 390, height: 844 }, "foreign");
  await foreignLanguage.page.locator("#startConversationButton").click();
  await foreignLanguage.page.waitForSelector("#interviewPanel:not([hidden])");
  await foreignLanguage.page.waitForFunction(() => !document.getElementById("questionPlayButton").disabled);
  await foreignLanguage.page.locator("#micButton").click();
  await foreignLanguage.page.waitForTimeout(1300);
  await foreignLanguage.page.locator("#stopButton").click();
  await foreignLanguage.page.waitForSelector("#transcriptionRecovery:not([hidden])", { timeout: 15000 });
  assert.match(await foreignLanguage.page.locator("#liveTranscript").innerText(), /did not return English analysis/i, "A French transcription response must be rejected before feedback");
  assert.equal(await foreignLanguage.page.locator("#nextTurnButton").isDisabled(), true, "A rejected foreign transcript must never enable Continue");
  assert.equal(foreignLanguage.errors.length, 0, "Foreign-language rejection must not produce runtime errors");
  await foreignLanguage.page.close();

  console.log(`PASS Unit 5 Conversation Coach UI audit; screenshots=${outputDir}`);
} finally {
  await browser.close();
}
