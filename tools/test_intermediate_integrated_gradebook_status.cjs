const assert = require("node:assert/strict");
const { chromium } = require("playwright");

const BASE_URL = process.env.JARALINGUA_GRADES_TEST_URL || "http://127.0.0.1:8022/ingles/intermediate/notas.html";
const CHROME_PATH = process.env.JARALINGUA_CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const evaluation = {
  id: "intermediateIntegratedTask20",
  title: "INTERMEDIATE COURSE 1 - INTEGRATED TASK (20%)",
  type: "Integrated task",
  weight: 20,
  description: "Integrated assessment"
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
    evaluations: [evaluation],
    student: {
      id: "S001",
      level: "Intermediate English Course 1",
      grades: {},
      gradeDetails: {
        intermediateIntegratedTask20: {
          status: "pending-writing",
          pendingTeacherReview: true,
          submittedAt: "2026-07-17T20:00:00Z",
          weight: 20
        }
      }
    }
  };
  const { context, page } = await prepare(browser, "student", payload, { width: 390, height: 844 });
  await page.goto(BASE_URL);
  await page.getByText("Submitted - teacher review pending", { exact: true }).waitFor({ state: "visible" });
  assert.match(await page.locator("#intermediateEnglishGradesApp").innerText(), /Awaiting rubric/);
  await assertNoPageOverflow(page, "student gradebook mobile");
  await context.close();
}

async function testTeacher(browser) {
  const payload = {
    role: "teacher",
    evaluations: [evaluation],
    students: [
      {
        id: "S001",
        fullName: "Submitted Student",
        level: "Intermediate English Course 1",
        email: "submitted@test.local",
        grades: {},
        gradeDetails: { intermediateIntegratedTask20: { status: "pending-writing", pendingTeacherReview: true } }
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
  await assertNoPageOverflow(page, "teacher gradebook tablet");
  await context.close();
}

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: CHROME_PATH });
  try {
    await testStudent(browser);
    await testTeacher(browser);
    console.log("PASS intermediate gradebook status: local accounts, submitted pending review, not submitted, and recorded grades");
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
