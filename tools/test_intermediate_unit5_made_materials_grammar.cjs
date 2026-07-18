"use strict";

const assert = require("node:assert/strict");
const os = require("node:os");
const path = require("node:path");
const { chromium } = require("playwright");

const BASE_URL = process.env.JARALINGUA_TEST_URL || "http://127.0.0.1:8024/ingles/intermediate/practice-unit-5-made-of-from-with.html";
const CHROME_PATH = process.env.JARALINGUA_CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const answers = ["made of", "made from", "made with", "made from", "made of", "made with", "made from", "made of", "made with", "made from"];
const viewports = [
  { label: "mobile-390x844", width: 390, height: 844 },
  { label: "tablet-768x1024", width: 768, height: 1024 },
  { label: "laptop-1366x768", width: 1366, height: 768 }
];

async function openPage(browser, viewport) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  await page.route("https://accounts.google.com/**", route => route.abort());
  await page.route("**/api/progress", route => route.fulfill({ status: 200, contentType: "application/json", body: "{}" }));
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await page.locator("#materialsQuestionList .materials-question").first().waitFor();
  return { context, page, errors };
}

async function assertIntegration(page) {
  const origin = new URL(BASE_URL).origin;
  const checks = [
    ["/ingles/intermediate/practice-lab.html", ["Unit 5 - 10 activities", "practice-unit-5-made-of-from-with.html", "made-of-from-with-grammar-lab-v1.webp"]],
    ["/ingles/intermediate/course-overview.html", ["practice-unit-5-made-of-from-with.html", "Materials grammar challenge"]],
    ["/ingles/intermediate/unit-5-food-quantities-culture.html", ["practice-unit-5-made-of-from-with.html", "Open materials grammar challenge"]]
  ];
  for (const [pathname, markers] of checks) {
    const response = await page.request.get(origin + pathname);
    assert.equal(response.status(), 200, `${pathname}: expected HTTP 200`);
    const body = await response.text();
    markers.forEach(marker => assert.ok(body.includes(marker), `${pathname}: missing ${marker}`));
  }
}

async function assertLayout(page, viewport) {
  const layout = await page.evaluate(() => {
    const root = document.documentElement;
    const visible = element => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
    };
    const outside = Array.from(document.querySelectorAll("button, a, img, .materials-question, .option-choice, .assessment-actions"))
      .filter(visible)
      .map(element => ({ element, rect: element.getBoundingClientRect() }))
      .filter(item => item.rect.left < -1 || item.rect.right > root.clientWidth + 1)
      .map(item => ({ tag: item.element.tagName, text: (item.element.textContent || item.element.alt || "").trim().slice(0, 80), left: item.rect.left, right: item.rect.right }));
    const floatingBlockers = Array.from(document.body.querySelectorAll("*"))
      .filter(visible)
      .filter(element => ["fixed", "sticky"].includes(getComputedStyle(element).position))
      .map(element => ({ tag: element.tagName, className: element.className || "", text: (element.textContent || "").trim().slice(0, 60) }));
    const image = document.querySelector(".materials-figure img");
    return {
      overflow: root.scrollWidth - root.clientWidth,
      outside,
      floatingBlockers,
      imageReady: Boolean(image && image.complete && image.naturalWidth > 1000),
      questions: document.querySelectorAll(".materials-question").length
    };
  });
  assert.equal(layout.questions, 10, `${viewport.label}: expected 10 questions`);
  assert.equal(layout.imageReady, true, `${viewport.label}: professional image did not load`);
  assert.ok(layout.overflow <= 1, `${viewport.label}: horizontal overflow ${layout.overflow}px`);
  assert.deepEqual(layout.outside, [], `${viewport.label}: visible elements exceed the viewport`);
  assert.deepEqual(layout.floatingBlockers, [], `${viewport.label}: fixed or sticky elements can cover quiz content`);
  assert.equal(await page.locator("#resetQuizBtn").isVisible(), false, `${viewport.label}: retry button must be hidden before grading`);
}

async function completePerfectAttempt(page) {
  await page.locator('[data-question="0"] input[value="made with"]').check({ force: true });
  await page.locator('[data-question="0"] input[value="made of"]').check({ force: true });
  for (let index = 1; index < answers.length; index += 1) {
    await page.locator(`[data-question="${index}"] input[value="${answers[index]}"]`).check({ force: true });
  }
  await page.locator("#checkAnswersBtn").click();
  await page.locator("#materialsResult:not([hidden])").waitFor();
  assert.equal((await page.locator("#scoreValue").textContent()).trim(), "5.0");
  assert.equal(await page.locator(".materials-question.is-correct").count(), 10);
  assert.equal(await page.locator(".question-feedback.is-visible").count(), 10);
  assert.equal(await page.locator("#scoreBreakdown .breakdown-item").count(), 3);
  assert.equal(await page.locator(".option-choice input:disabled").count(), 30);
  const resultScreenshot = path.join(os.tmpdir(), "unit5-made-materials-result-laptop.png");
  await page.locator("#materialsResult").screenshot({ path: resultScreenshot });
  console.log(`PASS perfect-result screenshot=${resultScreenshot}`);

  await page.locator("#resetQuizBtn").click();
  await page.locator("#materialsResult").waitFor({ state: "hidden" });
  assert.equal((await page.locator("#answerCounter").textContent()).trim(), "0 of 10 answered");
  assert.equal(await page.locator(".option-choice input:disabled").count(), 0);
}

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME_PATH, headless: true });
  try {
    for (const viewport of viewports) {
      const { context, page, errors } = await openPage(browser, viewport);
      await assertLayout(page, viewport);

      if (viewport.label.startsWith("laptop")) {
        await assertIntegration(page);
      }

      if (viewport.label.startsWith("mobile")) {
        await page.locator("#checkAnswersBtn").click();
        assert.match(await page.locator("#assessmentMessage").textContent(), /Complete all 10 questions/);
      }

      if (viewport.label.startsWith("laptop")) {
        await completePerfectAttempt(page);
      }

      const screenshot = path.join(os.tmpdir(), `unit5-made-materials-${viewport.label}.png`);
      await page.screenshot({ path: screenshot, fullPage: true });
      assert.deepEqual(errors, [], `${viewport.label}: page errors: ${errors.join(" | ")}`);
      console.log(`PASS ${viewport.label} screenshot=${screenshot}`);
      await context.close();
    }
  } finally {
    await browser.close();
  }
})();
