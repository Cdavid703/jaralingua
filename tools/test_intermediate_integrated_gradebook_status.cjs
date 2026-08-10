const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");
const { chromium } = require("playwright");

const BASE_URL = process.env.JARALINGUA_GRADES_TEST_URL || "http://127.0.0.1:8022/ingles/intermediate/notas.html";
const CHROME_PATH = process.env.JARALINGUA_CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const SCREENSHOT_DIR = process.env.JARALINGUA_GRADES_SCREENSHOT_DIR || "";

async function capture(page, name) {
  if (!SCREENSHOT_DIR) return;
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, name + ".png"), fullPage: false });
}

const evaluation = {
  id: "intermediateIntegratedTask20",
  title: "INTERMEDIATE COURSE 1 - INTEGRATED TASK (20%)",
  type: "Integrated task",
  weight: 20,
  description: "Integrated assessment"
};

const followUpEvaluation = {
  id: "unit5DishHistoryReading",
  title: "Unit 5 Reading - A Dish with a History",
  type: "Reading follow-up",
  weight: 0,
  description: "Tracking only"
};

function localUser(role) {
  return {
    credential: "grades-" + role + "-token",
    provider: "local",
    email: role + "@test.local",
    name: role === "teacher" ? "Test Teacher" : "Test Student",
    exp: Math.floor(Date.now() / 1000) + 3600
  };
}

async function prepare(browser, role, payload, viewport) {
  const context = await browser.newContext({ viewport });
  await context.addInitScript(user => sessionStorage.setItem("jaralingua_local_user", JSON.stringify(user)), localUser(role));
  const page = await context.newPage();
  await page.route("https://accounts.google.com/**", route => route.abort());
  await page.route("**/api/intermediate/grades", route => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(payload) }));
  return { context, page };
}

async function assertNoPageOverflow(page, label) {
  const result = await page.evaluate(() => ({ clientWidth: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth }));
  assert.ok(result.scrollWidth <= result.clientWidth + 1, label + " overflow: " + JSON.stringify(result));
}

async function testStudent(browser) {
  const payload = {
    role: "student",
    evaluations: [evaluation, followUpEvaluation],
    student: {
      id: "S001",
      level: "Intermediate English Course 1",
      grades: { unit5DishHistoryReading: 5 },
      gradeDetails: {
        intermediateIntegratedTask20: {
          status: "pending-writing",
          pendingTeacherReview: true,
          submittedAt: "2026-07-17T20:00:00Z",
          weight: 20
        },
        unit5DishHistoryReading: {
          status: "submitted",
          followUpOnly: true,
          grade: 5,
          weight: 0
        }
      }
    }
  };
  const { context, page } = await prepare(browser, "student", payload, { width: 390, height: 844 });
  await page.goto(BASE_URL);
  await page.getByText("Submitted - teacher review pending", { exact: true }).waitFor({ state: "visible" });
  assert.match(await page.locator("#intermediateEnglishGradesApp").innerText(), /Awaiting rubric/);
  assert.doesNotMatch(await page.locator("#intermediateEnglishGradesApp").innerText(), /A Dish with a History/);
  await assertNoPageOverflow(page, "student gradebook mobile");
  await context.close();
}

async function testTeacher(browser) {
  const payload = {
    role: "teacher",
    evaluations: [evaluation, followUpEvaluation],
    students: [
      {
        id: "S001",
        fullName: "Submitted Student",
        level: "Intermediate English Course 1",
        email: "submitted@test.local",
        grades: {},
        grades: { unit5DishHistoryReading: 5 },
        gradeDetails: {
          intermediateIntegratedTask20: { status: "pending-writing", pendingTeacherReview: true },
          unit5DishHistoryReading: { status: "submitted", followUpOnly: true, grade: 5, activity: "A Dish with a History" }
        }
      },
      {
        id: "S002",
        fullName: "Waiting Student",
        level: "Intermediate English Course 1",
        email: "waiting@test.local",
        grades: {},
        gradeDetails: {}
      },
      {
        id: "S003",
        fullName: "Graded Student",
        level: "Intermediate English Course 1",
        email: "graded@test.local",
        grades: { intermediateIntegratedTask20: 4.6 },
        gradeDetails: { intermediateIntegratedTask20: { status: "graded", pendingTeacherReview: false, grade: 4.6 } }
      }
    ],
    bonusEvent: null
  };
  const { context, page } = await prepare(browser, "teacher", payload, { width: 768, height: 1024 });
  await page.goto(BASE_URL);
  await page.getByText("Submitted - teacher review pending", { exact: true }).waitFor({ state: "visible" });
  assert.equal(await page.getByText("Not submitted", { exact: true }).count(), 1);
  assert.match(await page.locator("#intermediateEnglishGradesApp").innerText(), /4\.6/);
  const official = page.locator("[data-official-gradebook]");
  assert.match(await official.innerText(), /INTEGRATED TASK/);
  assert.doesNotMatch(await official.innerText(), /A Dish with a History/);
  assert.equal(await page.locator('[data-staff-tab="gradebook"]').getAttribute("aria-selected"), "true");
  assert.equal(await page.locator("[data-followup-disclosure]").isHidden(), true);
  assert.ok(await official.evaluate((node, followUp) => Boolean(node.compareDocumentPosition(followUp) & Node.DOCUMENT_POSITION_FOLLOWING), await page.locator("[data-followup-disclosure]").elementHandle()));
  await page.locator('[data-staff-tab="follow-up"]').click();
  assert.equal(await page.locator("[data-followup-disclosure]").isVisible(), true);
  await assertNoPageOverflow(page, "teacher gradebook tablet");
  await context.close();
}

async function testAdmin(browser) {
  const payload = {
    role: "admin",
    evaluations: [evaluation, followUpEvaluation],
    students: [
      {
        id: "S001",
        fullName: "Admin Test Student",
        level: "Intermediate English Course 1",
        email: "student@test.local",
        grades: { intermediateIntegratedTask20: 4.5, unit5DishHistoryReading: 5 },
        gradeDetails: { unit5DishHistoryReading: { status: "submitted", followUpOnly: true, grade: 5, activity: "A Dish with a History" } }
      },
      {
        id: "S002",
        fullName: "Two Decimal Student",
        level: "Intermediate English Course 1",
        email: "decimal@test.local",
        grades: { intermediateIntegratedTask20: 3.85 },
        gradeDetails: {}
      }
    ],
    bonusEvent: null
  };
  const { context, page } = await prepare(browser, "admin", payload, { width: 1440, height: 900 });
  let savedPayload = null;
  page.on("request", request => {
    if (request.method() === "PUT" && request.url().endsWith("/api/intermediate/grades")) savedPayload = request.postDataJSON();
  });
  await page.goto(BASE_URL);
  await page.locator("[data-official-gradebook]").waitFor({ state: "visible" });
  await page.locator("[data-staff-tabs]").scrollIntoViewIfNeeded();
  await capture(page, "intermediate-gradebook-tabs-desktop");
  assert.equal(await page.locator('[role="tab"]').count(), 6);
  for (const selector of ["[data-admin-tools]", "[data-admin-edit-tools]", "[data-admin-student-tools]", "[data-followup-disclosure]", "[data-admin-pdf-tools]"]) {
    assert.equal(await page.locator(selector).isHidden(), true, selector + " should be in an inactive tab by default");
  }
  assert.doesNotMatch(await page.locator("[data-official-gradebook]").innerText(), /A Dish with a History/);
  await page.locator('[data-staff-tab="edit-grades"]').click();
  assert.equal(await page.locator('[data-staff-tab="edit-grades"]').getAttribute("aria-selected"), "true");
  assert.equal(await page.locator("[data-official-gradebook]").isHidden(), true);
  assert.equal(await page.locator("[data-admin-edit-tools]").isVisible(), true);
  assert.equal(await page.locator("[data-admin-edit-tools] .admin-student-card").count(), 2);
  assert.equal(await page.locator("[data-admin-edit-tools] .admin-student-card").first().evaluate(node => node.open), false);
  assert.doesNotMatch(await page.locator("[data-admin-edit-tools]").innerText(), /A Dish with a History/);
  await page.locator("[data-grade-editor-filter]").fill("no matching student");
  assert.equal(await page.locator("[data-admin-edit-tools] .admin-student-card").first().evaluate(node => node.hidden), true);
  await page.locator("[data-grade-editor-filter]").fill("");
  await page.locator("[data-admin-edit-tools] .admin-student-card > summary").first().click();
  assert.equal(await page.locator("[data-admin-edit-tools] [data-edit-grade-student]").count(), 2);
  const editedGrade = page.locator("[data-admin-edit-tools] [data-edit-grade-student]").first();
  await editedGrade.fill("4.4");
  await Promise.all([
    page.waitForRequest(request => request.method() === "PUT" && request.url().endsWith("/api/intermediate/grades")),
    editedGrade.press("Enter")
  ]);
  assert.ok(savedPayload, "the edited gradebook should be sent to the API");
  assert.equal(savedPayload.students[0].grades.intermediateIntegratedTask20, 4.4);
  assert.equal(savedPayload.students[0].grades.unit5DishHistoryReading, 5, "hidden 0% tracking grades must be preserved");
  assert.equal(savedPayload.students[1].grades.intermediateIntegratedTask20, 3.85, "an existing two-decimal grade must not block the form");
  assert.match(await page.locator("[data-grade-save-notice]").innerText(), /saved successfully/i);
  assert.equal(await page.locator('[data-staff-tab="edit-grades"]').getAttribute("aria-selected"), "true", "active tab should survive a save and rerender");
  await page.locator('[data-staff-tab="edit-grades"]').press("End");
  assert.equal(await page.locator('[data-staff-tab="students"]').getAttribute("aria-selected"), "true", "keyboard navigation should activate the final tab");
  await assertNoPageOverflow(page, "admin gradebook desktop");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator("[data-staff-tabs]").scrollIntoViewIfNeeded();
  await assertNoPageOverflow(page, "admin gradebook mobile");
  await capture(page, "intermediate-gradebook-tabs-mobile");
  await context.close();
}

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: CHROME_PATH });
  try {
    await testStudent(browser);
    await testTeacher(browser);
    await testAdmin(browser);
    console.log("PASS intermediate gradebook: weighted columns, accessible staff tabs, preserved edits, and responsive layout");
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
