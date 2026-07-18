"use strict";

const assert = require("node:assert/strict");
const os = require("node:os");
const path = require("node:path");
const { chromium } = require("playwright");

const BASE_URL = process.env.JARALINGUA_TEST_URL || "http://127.0.0.1:8022/ingles/intermediate/game-hangman.html";
const CHROME_PATH = process.env.JARALINGUA_CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const viewports = [
  { label: "mobile-390x844", width: 390, height: 844 },
  { label: "tablet-768x1024", width: 768, height: 1024 },
  { label: "laptop-1366x768", width: 1366, height: 768 }
];

function teacherUser() {
  return {
    credential: "hangman-teacher-test-token",
    provider: "local",
    sub: "hangman-teacher-test-user",
    email: "hangman.teacher@test.local",
    name: "Hangman Test Teacher",
    exp: Math.floor(Date.now() / 1000) + 3600
  };
}

async function preparePage(browser, viewport) {
  const context = await browser.newContext({ viewport });
  await context.addInitScript(user => {
    sessionStorage.setItem("jaralingua_local_user", JSON.stringify(user));
    localStorage.setItem("jaralingua_role_requests", JSON.stringify([{
      id: user.sub,
      email: user.email,
      name: user.name,
      role: "teacher",
      status: "approved"
    }]));
    localStorage.removeItem("english-intermediate-hangman-game-v2");
  }, teacherUser());
  const page = await context.newPage();
  await page.route("https://accounts.google.com/**", route => route.abort());
  await page.route("**/api/progress", route => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, pages: {} }) }));
  await page.route("**/api/activity", route => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) }));
  await page.route("**/csp-report", route => route.fulfill({ status: 204, body: "" }));
  const failedRequests = [];
  page.on("response", response => {
    if (response.status() >= 400 && !response.url().includes("accounts.google.com") && !response.url().endsWith("/api/progress")) {
      failedRequests.push({ status: response.status(), url: response.url() });
    }
  });
  return { context, page, failedRequests };
}

async function startGame(page, category = "unit5-materials", format = "expression") {
  await page.locator("#teacherSetup:not([hidden])").waitFor({ state: "visible" });
  await page.locator("#studentNamesInput").fill("Ana\nPaul\nSofia");
  await page.locator("#categorySelect").selectOption(category);
  await page.locator("#answerTypeSelect").selectOption(format);
  await page.locator("#targetScoreInput").fill("10");
  await page.locator("#startGameButton").click();
  await page.locator("#gameConsole:not([hidden])").waitFor({ state: "visible" });
  await page.waitForFunction(() => document.querySelector("#statusMessage")?.textContent.includes("Game started successfully"));
}

async function currentAnswer(page) {
  return page.evaluate(() => {
    const state = JSON.parse(localStorage.getItem("english-intermediate-hangman-game-v2"));
    const all = [];
    window.JaraLinguaEnglishIntermediateHangman.categories.forEach(category => {
      category.entries.forEach((entry, index) => all.push({ id: `${category.id}-${index + 1}`, answer: entry.answer }));
    });
    return all.find(entry => entry.id === state.current.entryId).answer;
  });
}

async function assertResponsive(page, label) {
  const result = await page.evaluate(() => {
    const viewportWidth = document.documentElement.clientWidth;
    const visible = element => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
    };
    const overflow = Array.from(document.querySelectorAll("button, a, input, select, textarea, .word-board, .clue-panel, .score-row, .round-result"))
      .filter(visible)
      .map(element => {
        const rect = element.getBoundingClientRect();
        return {
          tag: element.tagName,
          text: (element.textContent || element.getAttribute("aria-label") || "").trim().slice(0, 60),
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width)
        };
      })
      .filter(item => item.left < -1 || item.right > viewportWidth + 1 || item.width > viewportWidth + 1);
    return {
      viewportWidth,
      scrollWidth: document.documentElement.scrollWidth,
      overflow,
      brokenImages: Array.from(document.images).filter(image => image.complete && image.naturalWidth === 0).map(image => image.src),
      hero: (() => {
        const element = document.querySelector(".hangman-hero");
        const style = getComputedStyle(element);
        return { width: element.getBoundingClientRect().width, height: element.getBoundingClientRect().height, backgroundImage: style.backgroundImage };
      })()
    };
  });
  assert.ok(result.scrollWidth <= result.viewportWidth + 1, label + " has horizontal overflow: " + JSON.stringify(result));
  assert.deepEqual(result.overflow, [], label + " has controls outside the viewport");
  assert.deepEqual(result.brokenImages, [], label + " has broken images");
  assert.ok(result.hero.width > 300 && result.hero.height >= 500, label + " hero has invalid dimensions");
  assert.match(result.hero.backgroundImage, /hangman-classroom-hero\.webp/, label + " hero image is not applied");
  await page.screenshot({ path: path.join(os.tmpdir(), "jaralingua-hangman-" + label + ".png"), fullPage: true });
}

async function testTeacherFlow(browser) {
  const { context, page, failedRequests } = await preparePage(browser, viewports[2]);
  page.on("dialog", dialog => dialog.accept());
  await page.goto(BASE_URL, { waitUntil: "networkidle" });

  const diagnostics = await page.evaluate(() => window.JaraLinguaEnglishHangmanDiagnostics);
  assert.equal(diagnostics.categoryCount, 14);
  assert.equal(diagnostics.entryCount, 116);
  assert.equal(diagnostics.incompleteEntries, 0);
  assert.equal(await page.locator("#categorySelect option").count(), 15);
  assert.equal(await page.locator("#baseKeyboard .letter-key").count(), 0, "Keyboard must not render before a game starts");

  await startGame(page);
  assert.equal(await page.locator("#baseKeyboard .letter-key").count(), 26);
  assert.match(await page.locator("#cluePanel").innerText(), /clue 1/i);
  assert.match(await page.locator("#cluePanel").innerText(), /Complete-solution bonus: 3 points/);

  await page.locator("#hintButton").click();
  assert.match(await page.locator("#statusMessage").innerText(), /Clue 2 is now visible/);
  assert.match(await page.locator("#cluePanel").innerText(), /Complete-solution bonus: 2 points/);
  await page.locator("#hintButton").click();
  assert.match(await page.locator("#statusMessage").innerText(), /Clue 3 is now visible/);
  assert.equal(await page.locator("#hintButton").isDisabled(), true);

  const answer = await currentAnswer(page);
  const firstLetter = answer.toUpperCase().match(/[A-Z]/)[0];
  await page.locator(`[data-letter="${firstLetter}"]`).click();
  assert.equal(await page.locator(`[data-letter="${firstLetter}"]`).isDisabled(), true);
  assert.match(await page.locator("#statusMessage").innerText(), /Correct letter/);

  await page.locator("#solveButton").click();
  await page.locator("#solveDialog[open]").waitFor({ state: "visible" });
  assert.match(await page.locator("#solutionBonusText").innerText(), /earns 1 point/);
  await page.locator("#solutionInput").fill(answer);
  await page.locator('#solveForm button[type="submit"]').click();
  await page.locator("#roundResult:not([hidden])").waitFor({ state: "visible" });
  assert.match(await page.locator("#statusMessage").innerText(), /Correct solution/);
  assert.match(await page.locator("#roundResult").innerText(), /meaning/i);
  assert.match(await page.locator("#roundResult").innerText(), /example/i);
  assert.match(await page.locator("#roundResult").innerText(), /usage/i);
  assert.equal(await page.locator("#nextRoundButton").isVisible(), true);

  await page.locator("[data-answer-audio]").click();
  await page.waitForTimeout(400);
  assert.match(await page.locator("#statusMessage").innerText(), /Playing the American English pronunciation/);

  await page.locator("#nextRoundButton").click();
  assert.match(await page.locator("#statusMessage").innerText(), /Round 2 is ready/);
  assert.match(await page.locator("#roundCounter").innerText(), /Round 2/);

  await page.locator("#resetMatchButton").click();
  await page.locator("#teacherSetup:not([hidden])").waitFor({ state: "visible" });
  assert.match(await page.locator("#statusMessage").innerText(), /New match ready/);
  assert.equal((await page.locator("#studentNamesInput").inputValue()).split("\n").length, 3);

  assert.deepEqual(failedRequests, [], "Teacher flow has failed network requests: " + JSON.stringify(failedRequests));
  await context.close();
}

async function testResponsiveLayouts(browser) {
  for (const viewport of viewports) {
    const { context, page, failedRequests } = await preparePage(browser, viewport);
    await page.goto(BASE_URL, { waitUntil: "networkidle" });
    await startGame(page, "unit4-expressions", "expression");
    await assertResponsive(page, viewport.label);
    assert.deepEqual(failedRequests, [], viewport.label + " has failed network requests: " + JSON.stringify(failedRequests));
    await context.close();
  }
}

async function testGamesHub(browser) {
  const { context, page, failedRequests } = await preparePage(browser, viewports[0]);
  await page.goto(new URL("games.html", BASE_URL).toString(), { waitUntil: "networkidle" });
  assert.equal(await page.locator(".game-card").count(), 3);
  const hangmanLink = page.locator('a[href="game-hangman.html"]');
  await hangmanLink.waitFor({ state: "visible" });
  assert.match(await hangmanLink.locator("xpath=ancestor::article").innerText(), /116 course answers/);
  const hubState = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    brokenImages: Array.from(document.images).filter(image => image.complete && image.naturalWidth === 0).map(image => image.src)
  }));
  assert.ok(hubState.scrollWidth <= hubState.viewport + 1, "Games hub has horizontal overflow");
  assert.deepEqual(hubState.brokenImages, [], "Games hub has broken images");
  assert.deepEqual(failedRequests, [], "Games hub has failed requests: " + JSON.stringify(failedRequests));
  await context.close();
}

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: CHROME_PATH });
  try {
    await testTeacherFlow(browser);
    await testResponsiveLayouts(browser);
    await testGamesHub(browser);
    console.log("PASS Intermediate Hangman: bank, teacher flow, audio, feedback, reset, hub card, images, and responsive layouts");
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
