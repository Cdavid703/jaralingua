const assert = require("node:assert/strict");
const fs = require("node:fs");
const { chromium } = require("playwright");

const BASE_URL = process.env.JARALINGUA_TEST_URL || "http://127.0.0.1:8022/ingles/intermediate/integrated-task.html";
const CHROME_PATH = process.env.JARALINGUA_CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const AUDIO_PATH = process.env.JARALINGUA_TEST_AUDIO || "server/private_assets/intermediate-integrated-task-real-us.mp3";

async function waitForText(page, selector, text) {
  await page.waitForFunction(
    ({ selector, text }) => (document.querySelector(selector)?.textContent || "").includes(text),
    { selector, text }
  );
}

const publicExam = {
  id: "intermediate-course-1-integrated-task",
  version: "button-test",
  title: "INTERMEDIATE COURSE 1 - INTEGRATED TASK (20%)",
  totalPoints: 50,
  listeningPoints: 25,
  writingPoints: 25,
  maxAudioPlays: null,
  questions: Array.from({ length: 10 }, (_, index) => ({
    id: "i" + (index + 1),
    prompt: "Test listening question " + (index + 1) + "?",
    options: ["Option A", "Option B", "Option C", "Option D"],
    points: 2.5
  }))
};

function storedUser(role) {
  return {
    credential: "test-" + role + "-token",
    provider: "local",
    email: role + "@test.local",
    name: role === "teacher" ? "Test Teacher" : "Test Student",
    exp: Math.floor(Date.now() / 1000) + 3600
  };
}

async function preparePage(browser, role, signedIn = true, viewport = { width: 1100, height: 900 }) {
  const context = await browser.newContext({ viewport });
  await context.addInitScript(({ user }) => {
    window.print = () => { window.__printCalled = true; };
    if (user) sessionStorage.setItem("jaralingua_local_user", JSON.stringify(user));
  }, { user: signedIn ? storedUser(role) : null });
  const page = await context.newPage();
  await page.route("https://accounts.google.com/**", route => route.abort());
  return { context, page };
}

async function assertResponsivePage(page, label) {
  const layout = await page.evaluate(() => {
    const width = document.documentElement.clientWidth;
    const visible = element => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
    };
    const overflow = Array.from(document.querySelectorAll("button, a, input, textarea, select, audio, .panel, .exam-section, .review-card"))
      .filter(visible)
      .map(element => {
        const rect = element.getBoundingClientRect();
        return { tag: element.tagName, text: (element.textContent || element.getAttribute("aria-label") || "").trim().slice(0, 60), left: rect.left, right: rect.right, width: rect.width };
      })
      .filter(item => item.left < -1 || item.right > width + 1 || item.width > width + 1);
    return {
      clientWidth: width,
      scrollWidth: document.documentElement.scrollWidth,
      overflow,
      speedButtons: document.querySelectorAll("[data-audio-speed]").length,
      questions: document.querySelectorAll(".question-card").length
    };
  });
  assert.ok(layout.scrollWidth <= layout.clientWidth + 1, label + " has horizontal page overflow: " + JSON.stringify(layout));
  assert.deepEqual(layout.overflow, [], label + " has controls outside the viewport");
  assert.equal(layout.speedButtons, 3, label + " must keep the three speed controls");
  assert.equal(layout.questions, 10, label + " must render all ten questions");
}

async function installStudentApi(page) {
  const audio = fs.readFileSync(AUDIO_PATH);
  let submittedPayload = null;
  await page.route("**/api/intermediate/integrated-task/state", async route => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        role: "student",
        state: { isOpen: true, updatedAt: "2026-07-13T14:00:00Z" },
        student: { id: "S001", fullName: "Test Student", email: "student@test.local" },
        submitted: null,
        canTake: true,
        reopenActive: false
      })
    });
  });
  await page.route("**/api/intermediate/integrated-task/audio", route => route.fulfill({ status: 200, contentType: "audio/mpeg", body: audio }));
  await page.route("**/api/intermediate/integrated-task/submit", async route => {
    submittedPayload = route.request().postDataJSON();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        result: {
          receiptId: "IIT-BUTTONTEST",
          studentId: "S001",
          studentName: "Test Student",
          submittedAt: "2026-07-13T14:05:00Z",
          audioPlays: 0,
          listeningPoints: 20,
          writingPoints: null,
          finalPoints: null,
          grade: null,
          status: "pending-writing",
          attemptNumber: 1,
          clientSubmissionId: submittedPayload.clientSubmissionId,
          writing: submittedPayload.writing,
          rubric: null,
          teacherComments: ""
        }
      })
    });
  });
  await page.route(/\/api\/intermediate\/integrated-task(?:\?retake=1)?$/, async route => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        status: "open",
        role: "student",
        state: { isOpen: true },
        student: { id: "S001", fullName: "Test Student", email: "student@test.local" },
        exam: publicExam
      })
    });
  });
  return () => submittedPayload;
}

async function installTeacherApi(page) {
  const audio = fs.readFileSync(AUDIO_PATH);
  let isOpen = false;
  let gradePayload = null;
  const submission = {
    receiptId: "IIT-TEACHERTEST",
    studentId: "S001",
    studentName: "Test Student",
    email: "student@test.local",
    submittedAt: "2026-07-13T14:05:00Z",
    audioPlays: 2,
    listeningPoints: 20,
    writingPoints: null,
    finalPoints: null,
    grade: null,
    status: "pending-writing",
    attemptNumber: 1,
    clientSubmissionId: "teacher-client-attempt",
    writing: Array.from({ length: 100 }, () => "food").join(" "),
    rubric: null,
    teacherComments: ""
  };
  await page.route("**/api/intermediate/integrated-task/state", async route => {
    if (route.request().method() === "PUT") {
      isOpen = route.request().postDataJSON().isOpen === true;
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, state: { isOpen, updatedAt: "2026-07-13T14:10:00Z", openedBy: "teacher@test.local" } }) });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ role: "teacher", state: { isOpen, updatedAt: "2026-07-13T14:00:00Z" }, student: null, submitted: null, canTake: true })
    });
  });
  await page.route("**/api/intermediate/integrated-task/submissions/grade", async route => {
    gradePayload = route.request().postDataJSON();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true, result: { ...submission, status: "graded", rubric: gradePayload.rubric, writingPoints: 25, finalPoints: 45, grade: 4.5, teacherComments: gradePayload.teacherComments } })
    });
  });
  await page.route("**/api/intermediate/integrated-task/submissions", async route => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        role: "teacher",
        submissions: [submission],
        health: {
          counts: { total: 2, submitted: 1, pendingWriting: 1, graded: 0, notSubmitted: 1 },
          students: [
            { id: "S001", fullName: "Test Student", email: "student@test.local", status: "pending-writing", grade: null },
            { id: "S002", fullName: "Second Student", email: "second@test.local", status: "not-submitted", grade: null }
          ]
        }
      })
    });
  });
  await page.route("**/api/intermediate/integrated-task/audio", route => route.fulfill({ status: 200, contentType: "audio/mpeg", body: audio }));
  await page.route(/\/api\/intermediate\/integrated-task(?:\?retake=1)?$/, async route => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ status: "staff-preview", role: "teacher", state: { isOpen }, student: null, exam: publicExam }) });
  });
  return () => gradePayload;
}

async function testSignedOutButton(browser) {
  const { context, page } = await preparePage(browser, "student", false);
  await page.goto(BASE_URL);
  await page.locator("[data-open-login]").click();
  await page.locator(".toast").waitFor({ state: "visible" });
  assert.match(await page.locator(".toast").innerText(), /Sign-in panel opened/);
  await context.close();
}

async function testStudentButtons(browser) {
  const { context, page } = await preparePage(browser, "student");
  const submittedPayload = await installStudentApi(page);
  page.on("dialog", dialog => dialog.accept());
  await page.goto(BASE_URL);
  await page.locator("#examContent:not([hidden])").waitFor({ state: "visible" });

  await page.locator('[data-audio-speed="0.75"]').click();
  assert.match(await page.locator("#audioActionFeedback").innerText(), /changed successfully to 0.75x/);
  assert.equal(await page.locator('[data-audio-speed="0.75"]').getAttribute("aria-pressed"), "true");

  await page.evaluate(() => {
    const audio = document.getElementById("listeningAudio");
    for (let listen = 0; listen < 5; listen += 1) {
      audio.dispatchEvent(new Event("play"));
      audio.dispatchEvent(new Event("ended"));
    }
  });
  assert.match(await page.locator("#audioActionFeedback").innerText(), /Listening completed.*replay the audio as needed/);
  assert.equal(await page.locator("#listeningAudio").isDisabled(), false);
  assert.equal(await page.locator("#playCounter").count(), 0);

  await page.locator("[data-print]").click();
  await page.waitForTimeout(180);
  assert.equal(await page.evaluate(() => window.__printCalled), true);
  assert.match(await page.locator(".toast").innerText(), /Print dialog opened/);

  await page.locator("#submitExamBtn").click();
  assert.match(await page.locator("#submitResult").innerText(), /Answer all ten listening questions/);

  for (const question of publicExam.questions) await page.locator('input[name="q_' + question.id + '"][value="0"]').check();
  await page.locator("#writingResponse").fill(Array.from({ length: 100 }, () => "food").join(" "));
  await page.locator("#submitExamBtn").click();
  await page.locator("#submitResult.show").waitFor({ state: "visible" });
  assert.match(await page.locator("#submitResult").innerText(), /Exam submitted successfully/);
  assert.equal(submittedPayload().audioPlays, 5);
  assert.equal(Object.keys(submittedPayload().answers).length, 10);
  assert.ok(submittedPayload().clientSubmissionId.length >= 8);
  assert.equal(await page.locator("[data-new-attempt]").isVisible(), true);
  await page.locator("[data-new-attempt]").click();
  await page.locator("#submitExamBtn:visible").waitFor({ state: "visible" });
  assert.equal(await page.locator("#writingResponse").inputValue(), "");
  assert.equal(await page.locator(".question-card").count(), 10);
  await context.close();
}

async function testTeacherButtons(browser) {
  const { context, page } = await preparePage(browser, "teacher");
  const gradePayload = await installTeacherApi(page);
  page.on("dialog", dialog => dialog.accept());
  await page.goto(BASE_URL);
  await page.locator("#adminPanel:not([hidden])").waitFor({ state: "visible" });
  await page.locator("#reviewPanel:not([hidden])").waitFor({ state: "visible" });
  assert.equal(await page.locator(".review-roster-table tbody tr").count(), 2);
  assert.match(await page.locator(".review-roster-table").innerText(), /Submitted - pending review/);
  assert.match(await page.locator(".review-roster-table").innerText(), /Not submitted/);

  await page.locator('[data-exam-state="open"]').click();
  await waitForText(page, "#activationFeedback", "activated successfully");
  assert.match(await page.locator("#activationFeedback").innerText(), /activated successfully/);
  assert.equal(await page.locator('[data-exam-state="closed"]').isEnabled(), true);

  await page.locator("[data-refresh-reviews]").click();
  await waitForText(page, "#reviewActionFeedback", "refreshed successfully");
  assert.match(await page.locator("#reviewActionFeedback").innerText(), /refreshed successfully/);

  const review = page.locator('[data-review="S001"]');
  await review.locator("[data-save-grade]").click();
  assert.match(await review.locator("[data-grade-feedback]").innerText(), /Select a score from 1 to 5 for every criterion/);
  for (const key of ["content", "composing", "vocabulary", "structure", "mechanics"]) await review.locator('[data-rubric="' + key + '"]').selectOption("5");
  await review.locator("[data-comments]").fill("Complete and accurate.");
  await review.locator("[data-save-grade]").click();
  await waitForText(page, "#reviewActionFeedback", "Rubric saved successfully");
  assert.match(await page.locator("#reviewActionFeedback").innerText(), /Rubric saved successfully/);
  assert.deepEqual(gradePayload().rubric, { content: 5, composing: 5, vocabulary: 5, structure: 5, mechanics: 5 });
  assert.equal(gradePayload().receiptId, "IIT-TEACHERTEST");

  await page.locator('[data-exam-state="closed"]').click();
  await waitForText(page, "#activationFeedback", "closed successfully");
  assert.match(await page.locator("#activationFeedback").innerText(), /closed successfully/);
  await context.close();
}

async function testAccountSwitchResetsExam(browser) {
  const context = await browser.newContext({ viewport: { width: 768, height: 1024 } });
  const userA = { ...storedUser("student"), credential: "student-a-token", email: "a@test.local", name: "Student A" };
  const userB = { ...storedUser("student"), credential: "student-b-token", email: "b@test.local", name: "Student B" };
  await context.addInitScript(({ user }) => sessionStorage.setItem("jaralingua_local_user", JSON.stringify(user)), { user: userA });
  const page = await context.newPage();
  const submittedA = {
    receiptId: "IIT-STUDENT-A",
    studentId: "S001",
    studentName: "Student A",
    submittedAt: "2026-07-13T14:05:00Z",
    audioPlays: 2,
    listeningPoints: 20,
    status: "pending-writing",
    attemptNumber: 1,
    clientSubmissionId: "student-a-client-attempt",
    writing: Array.from({ length: 100 }, () => "food").join(" "),
    rubric: null,
    teacherComments: ""
  };
  const isUserB = route => String(route.request().headers().authorization || "").includes("student-b-token");
  await page.route("https://accounts.google.com/**", route => route.abort());
  await page.route("**/api/intermediate/integrated-task/state", async route => {
    const second = isUserB(route);
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        role: "student",
        state: { isOpen: true },
        student: { id: second ? "S002" : "S001", fullName: second ? "Student B" : "Student A" },
        submitted: second ? null : submittedA,
        canTake: true,
        allowStudentIdClaim: false
      })
    });
  });
  await page.route("**/api/intermediate/integrated-task/audio", route => route.fulfill({ status: 200, contentType: "audio/mpeg", body: fs.readFileSync(AUDIO_PATH) }));
  await page.route(/\/api\/intermediate\/integrated-task(?:\?retake=1)?$/, async route => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ status: "open", role: "student", state: { isOpen: true }, student: { id: "S002", fullName: "Student B" }, exam: publicExam }) });
  });
  await page.goto(BASE_URL);
  await page.locator("#submitResult.show").waitFor({ state: "visible" });
  assert.equal(await page.locator("#submitExamBtn").isVisible(), false);
  await page.evaluate(user => sessionStorage.setItem("jaralingua_local_user", JSON.stringify(user)), userB);
  await page.waitForFunction(() => document.getElementById("studentId").value === "S002", null, { timeout: 9000 });
  assert.equal(await page.locator("#submitExamBtn").isVisible(), true);
  assert.equal(await page.locator("#submitExamBtn").isEnabled(), true);
  assert.equal(await page.locator("#writingResponse").isEnabled(), true);
  assert.equal(await page.locator("#writingResponse").inputValue(), "");
  assert.equal(await page.locator(".question-card").count(), 10);
  await context.close();
}

async function testResponsiveLayouts(browser) {
  const viewports = [
    { label: "mobile 390x844", width: 390, height: 844 },
    { label: "tablet 768x1024", width: 768, height: 1024 },
    { label: "laptop 1366x768", width: 1366, height: 768 }
  ];
  for (const viewport of viewports) {
    const student = await preparePage(browser, "student", true, viewport);
    await installStudentApi(student.page);
    await student.page.goto(BASE_URL);
    await student.page.locator("#examContent:not([hidden])").waitFor({ state: "visible" });
    await assertResponsivePage(student.page, "student " + viewport.label);
    await student.context.close();

    const teacher = await preparePage(browser, "teacher", true, viewport);
    await installTeacherApi(teacher.page);
    await teacher.page.goto(BASE_URL);
    await teacher.page.locator("#adminPanel:not([hidden])").waitFor({ state: "visible" });
    await teacher.page.locator("#reviewPanel:not([hidden])").waitFor({ state: "visible" });
    await assertResponsivePage(teacher.page, "teacher " + viewport.label);
    await teacher.context.close();
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: CHROME_PATH });
  try {
    await testSignedOutButton(browser);
    await testStudentButtons(browser);
    await testTeacherButtons(browser);
    await testAccountSwitchResetsExam(browser);
    await testResponsiveLayouts(browser);
    console.log("PASS buttons and responsive layouts: student and teacher flows work at mobile 390x844, tablet 768x1024, and laptop 1366x768");
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
