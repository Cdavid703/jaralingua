const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const BASE_URL = process.env.JARALINGUA_GRADEBOOK_TABS_URL || "http://127.0.0.1:8022";
const CHROME_PATH = process.env.JARALINGUA_CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const SCREENSHOT_DIR = process.env.JARALINGUA_GRADEBOOK_TABS_SCREENSHOTS || "";

const commonEvaluations = [
  { id: "oralTask", title: "Oral task", type: "Speaking", weight: 40, description: "Oral assessment", date: "2026-07-10", displayDate: "10 July" },
  { id: "finalTask", title: "Final task", type: "Integrated task", weight: 60, description: "Final assessment", date: "2026-07-20", displayDate: "20 July" }
];

function payload(level) {
  return {
    role: "admin",
    evaluations: commonEvaluations,
    students: [
      {
        id: "S001",
        fullName: "Test Student",
        level,
        email: "student@test.local",
        emailAliases: [],
        contact: "3000000000",
        bookDate: "2026-07-01",
        grades: { oralTask: 4.4 },
        gradeDetails: {}
      }
    ],
    bonusEvent: null
  };
}

const courses = [
  {
    name: "french1",
    path: "/frances/Niveau%201/notes-evaluation.html",
    api: "/api/french1/grades",
    localKey: "jaralingua_local_gradebook_user:french1GradesApp",
    level: "Francais Niveau 1",
    tabs: ["gradebook", "evaluations", "manual", "reports"],
    editorTab: "manual",
    editorCard: "[data-student]",
    rerenderButton: "#addStudent"
  },
  {
    name: "french2",
    path: "/frances/Niveau%202/notes-evaluation.html",
    api: "/api/french2/grades",
    localKey: "jaralingua_local_gradebook_user:french2GradesApp",
    level: "Francais Niveau 2",
    tabs: ["gradebook", "evaluations", "manual", "reports"],
    editorTab: "manual",
    editorCard: "[data-student]"
  },
  {
    name: "french8",
    path: "/frances/Niveau%208/notes-evaluation.html",
    api: "/api/french8/grades",
    localKey: "jaralingua_local_user",
    level: "Niveau 8",
    tabs: ["grades", "students", "reports", "editing"],
    editorTab: "editing",
    editorCard: "[data-student-editor-card]"
  },
  {
    name: "basic-english",
    path: "/ingles/basico/notas.html",
    api: "/api/basic/grades",
    localKey: "jaralingua_local_user",
    level: "Basic English Course 1",
    tabs: ["gradebook", "reports", "add-grade", "students"],
    editorTab: "students",
    editorCard: "[data-student-editor-card]"
  }
];

function localUser() {
  return {
    credential: "gradebook-tabs-test-token",
    provider: "local",
    email: "admin@test.local",
    name: "Test Administrator",
    exp: Math.floor(Date.now() / 1000) + 3600
  };
}

async function capture(page, name) {
  if (!SCREENSHOT_DIR) return;
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, name + ".png"), fullPage: false });
}

async function assertNoPageOverflow(page, label) {
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth
  }));
  assert.ok(dimensions.scrollWidth <= dimensions.clientWidth + 1, label + " overflow: " + JSON.stringify(dimensions));
}

async function testCourse(browser, course) {
  const context = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  await context.addInitScript(({ key, user }) => {
    sessionStorage.clear();
    sessionStorage.setItem(key, JSON.stringify(user));
  }, { key: course.localKey, user: localUser() });
  const page = await context.newPage();
  await page.route("https://accounts.google.com/**", route => route.abort());
  await page.route("https://alcdn.msauth.net/**", route => route.abort());
  await page.route("**" + course.api, route => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(payload(course.level)) }));
  await page.goto(BASE_URL + course.path);
  await page.locator("[data-gradebook-tabs]").waitFor({ state: "visible" });

  assert.equal(await page.locator("[data-gradebook-tab]").count(), course.tabs.length, course.name + " tab count");
  assert.equal(await page.locator('[data-gradebook-tab="' + course.tabs[0] + '"]').getAttribute("aria-selected"), "true");
  assert.equal(await page.locator("[data-gradebook-panel]:visible").count(), 1, course.name + " should show one panel");
  await page.locator("[data-gradebook-tabs]").scrollIntoViewIfNeeded();
  await capture(page, course.name + "-tabs-desktop");

  for (const tabId of course.tabs) {
    await page.locator('[data-gradebook-tab="' + tabId + '"]').click();
    assert.equal(await page.locator('[data-gradebook-tab="' + tabId + '"]').getAttribute("aria-selected"), "true");
    assert.equal(await page.locator('[data-gradebook-panel="' + tabId + '"]').isVisible(), true);
    assert.equal(await page.locator("[data-gradebook-panel]:visible").count(), 1);
  }

  await page.locator('[data-gradebook-tab="' + course.editorTab + '"]').click();
  const cards = page.locator(course.editorCard);
  assert.ok(await cards.count(), course.name + " should retain student editor cards");
  assert.equal(await cards.first().evaluate(node => node.open), false, course.name + " student card should be closed by default");

  if (course.rerenderButton) {
    await page.locator(course.rerenderButton).click();
    assert.equal(await page.locator('[data-gradebook-tab="' + course.editorTab + '"]').getAttribute("aria-selected"), "true", course.name + " should preserve the active tab after rerender");
  }

  await page.locator('[data-gradebook-tab="' + course.editorTab + '"]').press("Home");
  assert.equal(await page.locator('[data-gradebook-tab="' + course.tabs[0] + '"]').getAttribute("aria-selected"), "true", course.name + " Home key");
  await page.locator('[data-gradebook-tab="' + course.tabs[0] + '"]').press("End");
  assert.equal(await page.locator('[data-gradebook-tab="' + course.tabs[course.tabs.length - 1] + '"]').getAttribute("aria-selected"), "true", course.name + " End key");

  await assertNoPageOverflow(page, course.name + " desktop");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator("[data-gradebook-tabs]").scrollIntoViewIfNeeded();
  for (const tabId of course.tabs) {
    assert.equal(await page.locator('[data-gradebook-tab="' + tabId + '"]').isVisible(), true, course.name + " mobile tab " + tabId);
  }
  await assertNoPageOverflow(page, course.name + " mobile");
  await capture(page, course.name + "-tabs-mobile");
  await context.close();
}

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: CHROME_PATH });
  try {
    for (const course of courses) await testCourse(browser, course);
    console.log("PASS gradebook tabs: French 1, French 2, French 8, and Basic English");
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
