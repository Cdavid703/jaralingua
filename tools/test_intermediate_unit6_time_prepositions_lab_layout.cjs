const assert = require("assert/strict");
const { chromium } = require("playwright");

const URL = "http://127.0.0.1:8031/ingles/intermediate/practice-unit-6-time-prepositions-lab.html";

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.PLAYWRIGHT_CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
  });
  const viewports = [
    { label: "mobile", width: 390, height: 844 },
    { label: "tablet", width: 820, height: 1180 },
    { label: "desktop", width: 1440, height: 1000 }
  ];

  try {
    for (const viewport of viewports) {
      const page = await browser.newPage({ viewport });
      const errors = [];
      page.on("pageerror", error => errors.push(error.message));
      page.on("console", message => {
        if (message.type() === "error") errors.push(message.text());
      });
      await page.goto(URL, { waitUntil: "networkidle" });
      assert.deepEqual(errors, [], `${viewport.label}: console/page errors`);
      assert.equal(await page.locator("h1").textContent(), "Time Prepositions Schedule Lab", `${viewport.label}: title mismatch`);
      assert.equal(await page.locator(".u6t-question-card").count(), 10, `${viewport.label}: question count`);
      assert.equal(await page.locator(".u6t-option").count(), 30, `${viewport.label}: A-C option count`);

      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
      assert.equal(overflow, false, `${viewport.label}: horizontal overflow`);

      const heroLoaded = await page.locator(".u6t-hero img").evaluate(img => img.complete && img.naturalWidth > 1000);
      assert.equal(heroLoaded, true, `${viewport.label}: hero image not loaded`);

      await page.locator('input[name="question-0"][value="1"]').check({ force: true });
      await page.locator('input[name="question-1"][value="0"]').check({ force: true });
      await page.locator("[data-check-answers]").click();
      await page.locator("[data-send-teacher]").waitFor({ state: "visible" });
      const sendDisabled = await page.locator("[data-send-teacher]").isDisabled();
      assert.equal(sendDisabled, false, `${viewport.label}: send button should be enabled after checking, even with review items`);

      const buttonBoxes = await page.locator(".u6t-toolbar .u6t-button").evaluateAll(buttons => buttons.map(button => {
        const rect = button.getBoundingClientRect();
        return { width: rect.width, height: rect.height };
      }));
      assert.ok(buttonBoxes.every(box => box.width > 40 && box.height >= 44), `${viewport.label}: toolbar buttons too small`);
      await page.close();
    }
    console.log("PASS Unit 6 Time Prepositions Schedule Lab responsive layout.");
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exit(1);
});
