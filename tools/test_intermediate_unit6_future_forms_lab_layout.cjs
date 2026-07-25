const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..");
const outputDir = path.join(root, ".jaralingua-local", "unit6-future-forms-lab-layout");
const url = "http://127.0.0.1:8035/ingles/intermediate/practice-unit-6-future-forms-decision-lab.html";

fs.mkdirSync(outputDir, { recursive: true });

function chromeExecutable() {
  for (const candidate of [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe"
  ]) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return undefined;
}

async function assertResponsive(page, label) {
  const layout = await page.evaluate(() => {
    const visible = [...document.body.querySelectorAll("main, section, article, div, button, a, img, label")]
      .filter((node) => {
        const rect = node.getBoundingClientRect();
        const style = getComputedStyle(node);
        return rect.width > 1 && rect.height > 1 && style.display !== "none" && style.visibility !== "hidden";
      })
      .map((node) => {
        const rect = node.getBoundingClientRect();
        return {
          tag: node.tagName,
          id: node.id || "",
          cls: String(node.className || "").slice(0, 80),
          left: rect.left,
          right: rect.right
        };
      });
    return {
      innerWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      outside: visible.filter((item) => item.left < -2 || item.right > window.innerWidth + 2).slice(0, 12)
    };
  });
  assert.ok(layout.scrollWidth <= layout.innerWidth + 1, `${label}: page must not overflow horizontally`);
  assert.deepEqual(layout.outside, [], `${label}: visible elements must stay inside viewport`);
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: chromeExecutable(),
    args: ["--autoplay-policy=no-user-gesture-required"]
  });
  try {
    for (const viewport of [
      { width: 390, height: 844, name: "mobile" },
      { width: 768, height: 1024, name: "tablet" },
      { width: 1366, height: 768, name: "laptop" },
      { width: 1600, height: 900, name: "desktop" }
    ]) {
      const page = await browser.newPage({ viewport });
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.route("https://accounts.google.com/gsi/client", (route) => route.fulfill({ status: 200, contentType: "application/javascript", body: "" }));
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });
      await page.waitForSelector(".u6f-question-card", { timeout: 15000 });
      await page.waitForFunction(() => [...document.querySelectorAll(".u6f-hero img")].every((image) => image.complete && image.naturalWidth > 0), null, { timeout: 15000 });
      assert.equal(await page.locator(".u6f-question-card").count(), 12, `${viewport.name}: 12 questions must render`);
      assert.equal(await page.locator(".u6f-question-card").first().locator(".u6f-option").count(), 4, `${viewport.name}: A-D options must render`);
      await assertResponsive(page, viewport.name);
      await page.screenshot({ path: path.join(outputDir, `${viewport.name}.png`), fullPage: true });
      assert.equal(errors.length, 0, `${viewport.name}: no runtime errors expected`);
      await page.close();
    }

    const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
    await page.route("https://accounts.google.com/gsi/client", (route) => route.fulfill({ status: 200, contentType: "application/javascript", body: "" }));
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.waitForSelector(".u6f-question-card");
    for (let i = 0; i < 12; i += 1) {
      await page.locator(`input[name="question-${i}"]`).nth(i % 4).check({ force: true });
    }
    assert.equal(await page.locator("[data-check-answers]").isDisabled(), false, "check button must unlock after 12 answers");
    await page.locator("[data-check-answers]").click();
    await page.waitForSelector(".u6f-question-card.is-review, .u6f-question-card.is-correct");
    assert.match(await page.locator("[data-score-card]").innerText(), /Reference grade:/, "score card must show reference grade");
    assert.equal(await page.locator("[data-send-teacher]").isDisabled(), false, "send button must unlock after checking");
    await page.screenshot({ path: path.join(outputDir, "checked-state.png"), fullPage: true });
    await page.close();
  } finally {
    await browser.close();
  }
  console.log("PASS Unit 6 Future Forms Decision Lab responsive layout and checked state.");
})();
