"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const ROOT_URL = process.env.JARALINGUA_TEST_ROOT || "http://127.0.0.1:8022";
const MOCK_URL = ROOT_URL + "/ingles/intermediate/mock-integrated-task.html";
const STUDY_URL = ROOT_URL + "/ingles/intermediate/mock-integrated-task-study-companion.html";
const CHROME_PATH = process.env.JARALINGUA_CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const skillDefinitions = {
  mainIdea: { label: "Main idea and synthesis", studyTip: "Identify the purpose and conclusion.", correct: 2, total: 2 },
  factualDetail: { label: "Time and factual detail", studyTip: "Track exact facts.", correct: 2, total: 2 },
  quantities: { label: "Ingredients and quantities", studyTip: "Connect quantities and foods.", correct: 1, total: 2 },
  sensoryEvidence: { label: "Texture and sensory evidence", studyTip: "Notice adjective contrasts.", correct: 2, total: 2 },
  foodContext: { label: "Food context and classification", studyTip: "Use context evidence.", correct: 1, total: 2 }
};

function attempt(id, date) {
  return {
    attemptId: id,
    submittedAt: date,
    listeningPoints: 20,
    correctAnswers: 8,
    totalQuestions: 10,
    incorrectQuestions: [4, 9],
    skills: skillDefinitions,
    writingSignals: { content: true, quantities: true, sensory: true, comparison: true, recommendation: true },
    writingSignalCount: 5,
    wordCount: 112,
    audioPlays: 2
  };
}

function localUser(role) {
  return {
    credential: role + "-token",
    provider: "local",
    email: role + "@test.local",
    name: role === "teacher" ? "Test Teacher" : "Test Student",
    exp: Math.floor(Date.now() / 1000) + 3600
  };
}

async function preparePage(browser, role, feedbackOpen, viewport) {
  const context = await browser.newContext({ viewport });
  await context.addInitScript(user => {
    sessionStorage.setItem("jaralingua_local_user", JSON.stringify(user));
  }, localUser(role));
  const page = await context.newPage();
  await page.route("https://accounts.google.com/**", route => route.abort());
  await page.route("https://alcdn.msauth.net/**", route => route.abort());
  let stateOpen = feedbackOpen;
  let submitted = null;
  await page.route("**/api/**", async route => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.pathname === "/api/intermediate/grades") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(role === "teacher"
          ? { role: "teacher" }
          : { role: "student", student: { id: "S001", fullName: "Test Student", email: "student@test.local" } })
      });
      return;
    }
    if (url.pathname === "/api/intermediate/mock-integrated-task/state" && request.method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          role,
          state: { feedbackOpen: stateOpen, updatedAt: "2026-07-16T15:00:00Z", updatedBy: "teacher@test.local" },
          attempts: role === "student" ? [attempt("OLD", "2026-07-15T15:00:00Z")] : [],
          totalAttempts: 1,
          feedbackAvailable: role === "teacher" || stateOpen
        })
      });
      return;
    }
    if (url.pathname === "/api/intermediate/mock-integrated-task/state" && request.method() === "PUT") {
      stateOpen = request.postDataJSON().feedbackOpen === true;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, state: { feedbackOpen: stateOpen }, message: stateOpen ? "Post-attempt feedback opened for students." : "Post-attempt feedback closed for students." })
      });
      return;
    }
    if (url.pathname === "/api/intermediate/mock-integrated-task/attempts") {
      submitted = request.postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, attempt: attempt("NEW", "2026-07-16T15:00:00Z"), attemptCount: 2, feedbackAvailable: stateOpen })
      });
      return;
    }
    if (url.pathname === "/api/intermediate/mock-integrated-task/feedback") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          title: "Food Passport - Mock Integrated Task",
          transcript: "Olivia: Test transcript.\n\nMarcus: Second paragraph.",
          explanations: Array.from({ length: 10 }, (_, index) => ({ number: index + 1, question: "Question " + (index + 1), correctOption: "Correct option", rationale: "Evidence from the listening.", skill: "Listening skill" }))
        })
      });
      return;
    }
    await route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
  });
  return { context, page, submitted: () => submitted };
}

async function assertNoOverflow(page, label) {
  const result = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    outside: Array.from(document.querySelectorAll("button, a, input, textarea, .exam-section")).filter(element => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return style.display !== "none" && rect.width > 0 && (rect.left < -1 || rect.right > document.documentElement.clientWidth + 1);
    }).map(element => (element.textContent || element.tagName).trim().slice(0, 60))
  }));
  assert.ok(result.scrollWidth <= result.clientWidth + 1, label + " page overflow: " + JSON.stringify(result));
  assert.deepEqual(result.outside, [], label + " controls outside viewport");
}

async function testStudentAttempt(browser) {
  const setup = await preparePage(browser, "student", false, { width: 390, height: 844 });
  await setup.page.goto(MOCK_URL, { waitUntil: "load" });
  await setup.page.locator("#examContent:not([hidden])").waitFor({ state: "visible" });
  assert.equal(await setup.page.locator(".history-item").count(), 1);
  assert.equal(await setup.page.locator("#loadFeedbackBtn").isDisabled(), true);
  for (let index = 1; index <= 10; index += 1) await setup.page.locator('input[name="q_m' + index + '"]').first().check();
  const writing = Array.from({ length: 105 }, (_, index) => index % 8 === 0 ? "recommend" : "food").join(" ");
  await setup.page.locator("#writingResponse").fill(writing);
  await setup.page.locator("#submitExamBtn").click();
  await setup.page.waitForFunction(() => document.getElementById("submitResult").textContent.includes("saved successfully"));
  assert.equal(await setup.page.locator(".diagnostic-card").count(), 5);
  assert.equal(await setup.page.locator(".signal-chip").count(), 5);
  assert.equal(await setup.page.locator(".history-item").count(), 2);
  assert.equal(Object.keys(setup.submitted().answers).length, 10);
  assert.equal(setup.submitted().audioPlays, 0);
  await assertNoOverflow(setup.page, "student mock mobile");
  await setup.context.close();
}

async function testReleasedFeedback(browser) {
  const setup = await preparePage(browser, "student", true, { width: 768, height: 1024 });
  await setup.page.goto(MOCK_URL, { waitUntil: "load" });
  await setup.page.locator("#examContent:not([hidden])").waitFor({ state: "visible" });
  assert.equal(await setup.page.locator("#loadFeedbackBtn").isEnabled(), true);
  await setup.page.locator("#loadFeedbackBtn").click();
  await setup.page.locator("#feedbackContent:not([hidden])").waitFor({ state: "visible" });
  assert.equal(await setup.page.locator(".answer-explanation").count(), 10);
  assert.match(await setup.page.locator(".protected-transcript").innerText(), /Test transcript/);
  await assertNoOverflow(setup.page, "released feedback tablet");
  await setup.context.close();
}

async function testTeacherControl(browser) {
  const setup = await preparePage(browser, "teacher", false, { width: 1366, height: 768 });
  await setup.page.goto(MOCK_URL, { waitUntil: "load" });
  await setup.page.locator("#feedbackAdminPanel:not([hidden])").waitFor({ state: "visible" });
  await setup.page.locator('[data-feedback-state="open"]').click();
  await setup.page.waitForFunction(() => document.getElementById("feedbackAdminStatus").textContent.includes("opened for students"));
  assert.match(await setup.page.locator("#feedbackStateBadge").innerText(), /Open for students/);
  await setup.page.locator('[data-feedback-state="closed"]').click();
  await setup.page.waitForFunction(() => document.getElementById("feedbackAdminStatus").textContent.includes("closed for students"));
  assert.match(await setup.page.locator("#feedbackStateBadge").innerText(), /Closed for students/);
  await assertNoOverflow(setup.page, "teacher mock laptop");
  await setup.context.close();
}

async function testStudyCompanion(browser) {
  const studyScript = fs.readFileSync(path.join("assets", "js", "intermediate-integrated-task-study.js"), "utf8");
  assert.doesNotMatch(studyScript, /speechSynthesis|SpeechSynthesisUtterance/, "The study companion must not use browser speech synthesis");
  const expectedAudio = [
    "grapes-sentence.mp3", "cereal-sentence.mp3", "a-few-tomatoes.mp3", "a-little-oil.mp3",
    "a-cup-of-rice.mp3", "three-cups-of-cooked-rice.mp3", "a-slice-of-bread.mp3", "a-bottle-of-water.mp3"
  ];
  for (const filename of expectedAudio) {
    const matches = [
      path.join("ingles", "intermediate", "audio", "unit-5-food-memory", filename),
      path.join("ingles", "intermediate", "audio", "unit-5-market-basket", filename)
    ];
    assert.ok(matches.some(item => fs.existsSync(item)), "Missing professional audio: " + filename);
  }
  for (const viewport of [{ width: 390, height: 844 }, { width: 768, height: 1024 }, { width: 1366, height: 768 }]) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    await page.goto(STUDY_URL, { waitUntil: "load" });
    assert.equal(await page.locator("[data-study-audio]").count(), 8);
    assert.equal(await page.locator("[data-study-speed]").count(), 3);
    await page.locator('[data-study-speed="0.75"]').click();
    assert.match(await page.locator("#studyAudioStatus").innerText(), /0.75x/);
    if (viewport.width === 390) {
      await page.locator("[data-study-audio]").first().click();
      await page.waitForFunction(() => /Playing|completed/.test(document.getElementById("studyAudioStatus").textContent));
      assert.match(await page.locator("#studyAudioStatus").innerText(), /Playing|completed/);
    }
    await assertNoOverflow(page, "study companion " + viewport.width + "x" + viewport.height);
    await context.close();
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: CHROME_PATH });
  try {
    await testStudentAttempt(browser);
    await testReleasedFeedback(browser);
    await testTeacherControl(browser);
    await testStudyCompanion(browser);
    console.log("PASS intermediate mock study support: diagnostics, history, release controls, protected feedback, professional audio bank, and responsive layouts");
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
