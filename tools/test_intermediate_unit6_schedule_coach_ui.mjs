import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const root = path.resolve(import.meta.dirname, "..");
const outputDir = path.join(root, ".jaralingua-local", "schedule-coach-unit6-ui");
const sampleAudio = fs.readFileSync(path.join(root, "ingles", "intermediate", "audio", "hangman", "answers", "movies-series-1.mp3"));
const url = "http://127.0.0.1:8033/ingles/intermediate/unit-conversation-coach-unit-6-schedule.html";

fs.mkdirSync(outputDir, { recursive: true });

function transcriptFor(topic, prompt, context = "") {
  const topicOnly = String(topic || "").toLowerCase();
  if (topicOnly.includes("priorit")) return "Olivia is going to protect the Wednesday recording session first because it is confirmed.";
  if (topicOnly.includes("arrangement") || topicOnly.includes("confirmed")) return "She is recording on Wednesday afternoon, but the Friday photo session is still up in the air.";
  if (topicOnly.includes("strategy")) return "I chose Confirm the Final Agenda because everyone needs to be on the same page.";
  if (topicOnly.includes("advice")) return "She should put off the radio interview so she can free up Friday afternoon.";
  if (topicOnly.includes("complication")) return "Before she confirms the photo session, family dinner, or band rehearsal, she should check the final agenda and talk to the team.";
  if (topicOnly.includes("adjust")) return "Marcus should put off the radio interview and fit in family dinner on Thursday to free up Friday afternoon.";
  if (topicOnly.includes("final agenda")) return "The final agenda is clear: Olivia is recording on Wednesday, and she is going to rest before the weekend event.";
  if (topicOnly.includes("follow-up")) return "Could you confirm Friday afternoon so everyone is on the same page because Olivia needs a clear decision?";
  const normalized = `${topic} ${prompt} ${context}`.toLowerCase();
  if (normalized.includes("priorit")) return "Olivia is going to protect the Wednesday recording session first because it is confirmed.";
  if (normalized.includes("arrangement") || normalized.includes("fixed")) return "She is recording on Wednesday afternoon, but the Friday photo session is still up in the air.";
  if (normalized.includes("strategy")) return "I chose Confirm the Final Agenda because everyone needs to be on the same page.";
  if (normalized.includes("advice")) return "She should put off the radio interview so she can free up Friday afternoon.";
  if (normalized.includes("complication") || normalized.includes("photo") || normalized.includes("mother") || normalized.includes("band")) return "Before she confirms the photo session, family dinner, or band rehearsal, she should check the final agenda and talk to the team.";
  if (normalized.includes("adjust")) return "Marcus should put off the radio interview and fit in family dinner on Thursday to free up Friday afternoon.";
  if (normalized.includes("final agenda")) return "The final agenda is clear: Olivia is recording on Wednesday, and she is going to rest before the weekend event.";
  if (normalized.includes("follow-up") || normalized.includes("question")) return "Could you confirm Friday afternoon so everyone is on the same page because Olivia needs a clear decision?";
  return "I am going to help organize Olivia's schedule with clear advice.";
}

async function preparePage(context, viewport, apiMode = "success") {
  const page = await context.newPage();
  await page.setViewportSize(viewport);
  const errors = [];
  const submissions = [];
  let nextTranscript = "";
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("https://accounts.google.com/gsi/client", (route) => route.fulfill({ status: 200, contentType: "application/javascript", body: "" }));
  await page.route("**/*.mp3", (route) => route.fulfill({ status: 200, contentType: "audio/mpeg", body: sampleAudio }));
  await page.route("**/api/english-intermediate/pronunciation-assessment", async (route) => {
    if (apiMode === "foreign") {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ text: "Elle a ete creee.", language_code: "fr", words: [{ word: "Elle", probability: .2 }], audio: { rms: .08 } }) });
      return;
    }
    const words = nextTranscript.split(/\s+/).map((word) => ({ word: word.replace(/[^A-Za-z']/g, ""), probability: .92 })).filter((item) => item.word);
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ text: nextTranscript, language_code: "en", words, audio: { rms: .08 } }) });
  });
  await page.route("**/api/intermediate/unit6-schedule-coach/submit", async (route) => {
    const body = route.request().postDataJSON();
    submissions.push(body);
    const score = Object.values(body.metrics || {}).reduce((sum, value) => sum + Number(value || 0), 0);
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        evaluationId: "unit6ScheduleRescueConversationCoach",
        score,
        total: 50,
        grade: score / 10,
        submittedAt: "2026-07-23T20:00:00Z",
        attemptCount: 1,
        clientSubmissionId: body.clientSubmissionId,
        followUpOnly: true,
        weight: 0
      })
    });
  });
  await page.goto(url, { waitUntil: "networkidle" });
  return { page, errors, submissions, setTranscript: (value) => { nextTranscript = value; } };
}

async function assertResponsive(page, label) {
  const layout = await page.evaluate(() => {
    const visible = [...document.body.querySelectorAll("main, section, article, div, button, a, img")]
      .filter((node) => {
        const style = getComputedStyle(node);
        const rect = node.getBoundingClientRect();
        return style.display !== "none" && style.visibility !== "hidden" && rect.width > 1 && rect.height > 1;
      })
      .map((node) => {
        const rect = node.getBoundingClientRect();
        return {
          tag: node.tagName,
          id: node.id || "",
          cls: String(node.className || "").slice(0, 80),
          left: rect.left,
          right: rect.right,
          top: rect.top,
          bottom: rect.bottom
        };
      });
    return {
      innerWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      heroRight: document.querySelector(".coach-hero")?.getBoundingClientRect().right || 0,
      boardRight: document.querySelector(".restaurant-menu")?.getBoundingClientRect().right || 0,
      outside: visible.filter((item) => item.right > window.innerWidth + 2 || item.left < -2).slice(0, 12)
    };
  });
  assert.ok(layout.scrollWidth <= layout.innerWidth + 1, `${label}: page must not overflow horizontally`);
  assert.ok(layout.heroRight <= layout.innerWidth + 1, `${label}: hero must fit viewport`);
  assert.ok(layout.boardRight <= layout.innerWidth + 1, `${label}: strategy board must fit viewport`);
  assert.deepEqual(layout.outside, [], `${label}: visible elements must stay inside viewport`);
}

async function recordResponse(page, setTranscript, override = "") {
  await page.waitForFunction(() => !document.getElementById("questionPlayButton").disabled, null, { timeout: 15000 });
  const topic = await page.locator("#turnTopic").innerText();
  const prompt = await page.locator("#questionText").innerText();
  const context = await page.locator("#conversationContext").innerText();
  setTranscript(override || transcriptFor(topic, prompt, context));
  await page.locator("#micButton").click();
  await page.waitForTimeout(1200);
  await page.locator("#stopButton").click();
  await page.waitForFunction(() => !document.getElementById("nextTurnButton").disabled, null, { timeout: 15000 });
}

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream", "--autoplay-policy=no-user-gesture-required"]
});

try {
  const context = await browser.newContext({ permissions: ["microphone"], baseURL: "http://127.0.0.1:8033" });
  await context.route("https://accounts.google.com/gsi/client", (route) => route.fulfill({ status: 200, contentType: "application/javascript", body: "" }));

  if (process.env.SKIP_REAL_AUDIO_AUDIT !== "1") {
    const audioPage = await context.newPage();
    await audioPage.goto(url, { waitUntil: "networkidle" });
    const audit = await audioPage.evaluate(async () => {
      const config = window.JaraLinguaScheduleCoachConfig;
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
    { width: 1366, height: 768, name: "laptop" },
    { width: 1600, height: 900, name: "desktop" }
  ]) {
    const { page, errors } = await preparePage(context, viewport);
    await assertResponsive(page, viewport.name);
    assert.equal(await page.locator("#menuPreviewGrid .restaurant-dish-card").count(), 4, `${viewport.name}: four visual strategy cards must render`);
    await page.waitForFunction(() => [...document.querySelectorAll("#menuPreviewGrid img")].every((image) => image.complete && image.naturalWidth > 0), null, { timeout: 15000 });
    assert.equal(await page.locator("[data-coach-speed]").count(), 6, `${viewport.name}: only the agreed speed controls must appear in the welcome and question bars`);
    await page.locator("#menuPreviewGrid").scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(outputDir, `${viewport.name}-strategy-board.png`) });
    assert.equal(errors.length, 0, `${viewport.name}: no page runtime errors expected`);
    await page.close();
  }

  const guided = await preparePage(context, { width: 1366, height: 768 });
  await guided.page.locator("[data-coach-speed='1.25']").first().click();
  assert.equal(await guided.page.locator("[data-coach-speed='1.25'].is-active").count(), 2, "Speed controls must remain synchronized");
  await guided.page.locator("#menuPreviewGrid [data-dish-select='confirm-agenda']").click();
  assert.match(await guided.page.locator("#selectedDishLabel").innerText(), /Confirm the Final Agenda/, "Selected strategy context must be visible");
  await guided.page.locator("#startConversationButton").click();
  await guided.page.waitForSelector("#interviewPanel:not([hidden])");
  assert.equal(await guided.page.locator("#answerSupport").getAttribute("open"), "", "Guided mode must open support");
  for (let stage = 0; stage < 8; stage += 1) {
    await recordResponse(guided.page, guided.setTranscript);
    assert.doesNotMatch(await guided.page.locator("#nextTurnButton").innerText(), /clarification/i, `Stage ${stage + 1}: a complete response must advance`);
    await guided.page.locator("#nextTurnButton").click();
  }
  await guided.page.waitForSelector("#summaryPanel:not([hidden])");
  assert.match(await guided.page.locator("#summaryScore").innerText(), /^\d+$/, "Complete meeting must create a private /50 estimate");
  assert.equal(await guided.page.locator("#summaryAnswers > article").count(), 8, "Report must review all eight stages");
  assert.match(await guided.page.locator("#summaryCoverage").innerText(), /8 of 8 stages analyzed/i, "Report must state full coverage");
  assert.doesNotMatch(await guided.page.locator("#summaryWords").innerText(), /\belle\b/i, "French hallucination tokens must never appear");
  assert.equal(await guided.page.locator("#deliveryButton").isDisabled(), false, "Complete eight-stage report must unlock teacher delivery");
  await guided.page.evaluate(() => {
    sessionStorage.setItem("jaralingua_local_user", JSON.stringify({ credential: "schedule-ui-test-token", exp: Math.floor(Date.now() / 1000) + 3600 }));
  });
  await guided.page.locator("#deliveryButton").click();
  await guided.page.waitForFunction(() => /submitted to teacher/i.test(document.getElementById("deliveryStatus").textContent || ""));
  assert.equal(guided.submissions.length, 1, "Teacher delivery must make exactly one request");
  assert.equal(guided.submissions[0].turns.length, 8, "Teacher delivery must include all eight analyzed turns");
  assert.equal(guided.submissions[0].selectedStrategy, "Confirm the Final Agenda", "Teacher delivery must include selected strategy.");
  assert.doesNotMatch(JSON.stringify(guided.submissions[0]), /audioDataUrl|data:audio|audio\/webm/i, "Teacher delivery must not include audio bytes");
  assert.match(await guided.page.locator("#deliveryStatus").innerText(), /weight:\s*0%/i, "Visible confirmation must explain weight 0");
  assert.match(await guided.page.locator("#deliveryGrade").innerText(), /^\d+\.\d{2}\/5$/, "Student must see the reference grade on the 0-to-5 scale");
  await guided.page.screenshot({ path: path.join(outputDir, "laptop-summary.png"), fullPage: true });
  await guided.page.setViewportSize({ width: 390, height: 844 });
  await assertResponsive(guided.page, "mobile summary");
  const mobileDelivery = await guided.page.evaluate(() => {
    const panel = document.getElementById("teacherDeliveryPanel").getBoundingClientRect();
    const button = document.getElementById("deliveryButton").getBoundingClientRect();
    const metrics = [...document.querySelectorAll(".restaurant-delivery-metrics > span")].map((item) => item.getBoundingClientRect());
    return {
      panelLeft: panel.left,
      panelRight: panel.right,
      buttonHeight: button.height,
      metricsInside: metrics.every((item) => item.left >= panel.left && item.right <= panel.right)
    };
  });
  assert.ok(mobileDelivery.panelLeft >= 0 && mobileDelivery.panelRight <= 391, "Mobile delivery panel must stay inside the viewport");
  assert.ok(mobileDelivery.buttonHeight >= 44, "Mobile teacher-delivery button must remain touch friendly");
  assert.equal(mobileDelivery.metricsInside, true, "Mobile score, grade, and weight metrics must stay inside the delivery panel");
  await guided.page.close();

  const realistic = await preparePage(context, { width: 390, height: 844 });
  await realistic.page.locator("#realMode").check({ force: true });
  await realistic.page.locator("#startConversationButton").click();
  await realistic.page.waitForSelector("#interviewPanel:not([hidden])");
  assert.equal(await realistic.page.locator("#answerSupport").getAttribute("open"), null, "Real Meeting must keep support closed");
  const realisticTopic = await realistic.page.locator("#turnTopic").innerText();
  const realisticPrompt = await realistic.page.locator("#questionText").innerText();
  realistic.setTranscript(transcriptFor(realisticTopic, realisticPrompt));
  await realistic.page.waitForFunction(() => !document.getElementById("floatingMicButton").disabled, null, { timeout: 15000 });
  await realistic.page.locator("#floatingMicButton").click();
  await realistic.page.waitForTimeout(1200);
  await realistic.page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  const dock = await realistic.page.evaluate(() => ({
    visible: !document.getElementById("floatingMicDock").hidden,
    padding: parseFloat(getComputedStyle(document.body).paddingBottom),
    height: document.getElementById("floatingMicDock").getBoundingClientRect().height,
    position: getComputedStyle(document.getElementById("floatingMicDock")).position,
    top: document.getElementById("floatingMicDock").getBoundingClientRect().top,
    bottom: document.getElementById("floatingMicDock").getBoundingClientRect().bottom,
    viewportHeight: window.innerHeight,
    state: document.getElementById("floatingMicDock").dataset.state
  }));
  assert.equal(dock.visible, true, "Floating controls must be visible during the conversation");
  assert.ok(dock.padding >= dock.height, "Mobile page must reserve space for floating controls");
  assert.equal(dock.position, "fixed", "Floating microphone must remain fixed while the learner scrolls");
  assert.equal(dock.state, "recording", "Floating dock must mirror the active recording state");
  assert.ok(dock.top >= 0 && dock.bottom <= dock.viewportHeight + 1, "Floating controls must stay inside the scrolled viewport");
  await realistic.page.locator("#floatingStopButton").click();
  await realistic.page.waitForFunction(() => !document.getElementById("nextTurnButton").disabled, null, { timeout: 15000 });
  await realistic.page.close();

  const foreign = await preparePage(context, { width: 390, height: 844 }, "foreign");
  await foreign.page.locator("#startConversationButton").click();
  await foreign.page.waitForSelector("#interviewPanel:not([hidden])");
  await foreign.page.waitForFunction(() => !document.getElementById("questionPlayButton").disabled);
  await foreign.page.locator("#micButton").click();
  await foreign.page.waitForTimeout(1200);
  await foreign.page.locator("#stopButton").click();
  await foreign.page.waitForSelector("#transcriptionRecovery:not([hidden])", { timeout: 15000 });
  assert.match(await foreign.page.locator("#liveTranscript").innerText(), /did not return English analysis/i, "A French transcription response must be rejected");
  assert.equal(await foreign.page.locator("#nextTurnButton").isDisabled(), false, "Continue must stay available after failed analysis");
  await foreign.page.locator("#nextTurnButton").click();
  await foreign.page.waitForFunction(() => document.getElementById("turnCounter").textContent.includes("Stage 2"), null, { timeout: 5000 });
  assert.equal(foreign.errors.length, 0, "Foreign-language rejection must not produce runtime errors");
  await foreign.page.close();

  console.log(`PASS Unit 6 Schedule Rescue Coach UI audit; screenshots=${outputDir}`);
} finally {
  await browser.close();
}
