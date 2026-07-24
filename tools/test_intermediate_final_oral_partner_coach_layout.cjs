const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..");
const outputDir = path.join(root, ".jaralingua-local", "final-oral-partner-coach-layout");
const url = "http://127.0.0.1:8034/ingles/intermediate/final-oral-partner-coach.html";

fs.mkdirSync(outputDir, { recursive: true });

async function assertResponsive(page, label) {
  const layout = await page.evaluate(() => {
    const visible = [...document.body.querySelectorAll("main, section, article, div, button, a, img, audio")]
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
      cardRight: document.querySelector(".restaurant-menu")?.getBoundingClientRect().right || 0,
      outside: visible.filter((item) => item.right > window.innerWidth + 2 || item.left < -2).slice(0, 12)
    };
  });
  assert.ok(layout.scrollWidth <= layout.innerWidth + 1, `${label}: page must not overflow horizontally`);
  assert.ok(layout.heroRight <= layout.innerWidth + 1, `${label}: hero must fit viewport`);
  assert.ok(layout.cardRight <= layout.innerWidth + 1, `${label}: problem card grid must fit viewport`);
  assert.deepEqual(layout.outside, [], `${label}: visible elements must stay inside viewport`);
}

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
      await page.route("https://accounts.google.com/gsi/client", (route) => {
        route.fulfill({ status: 200, contentType: "application/javascript", body: "" });
      });
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });
      await page.waitForSelector("#menuPreviewGrid .restaurant-dish-card", { timeout: 15000 });
      await assertResponsive(page, viewport.name);
      assert.equal(await page.locator("#menuPreviewGrid img").count(), 5, `${viewport.name}: five problem card images must render`);
      await page.waitForFunction(() => [...document.querySelectorAll(".coach-hero img, .coach-companion-welcome img, #menuPreviewGrid img")].every((image) => image.complete && image.naturalWidth > 0), null, { timeout: 15000 });
      assert.equal(await page.locator("#menuPreviewGrid .restaurant-dish-card").count(), 5, `${viewport.name}: five official problem cards must render`);
      assert.ok(await page.locator("[data-coach-speed='0.75']").count() >= 2, `${viewport.name}: 0.75x controls must render`);
      assert.ok(await page.locator("[data-coach-speed='1']").count() >= 2, `${viewport.name}: 1x controls must render`);
      assert.ok(await page.locator("[data-coach-speed='1.25']").count() >= 2, `${viewport.name}: 1.25x controls must render`);
      assert.equal(errors.length, 0, `${viewport.name}: no page runtime errors expected`);
      await page.screenshot({ path: path.join(outputDir, `${viewport.name}.png`), fullPage: true });
      await page.close();
    }
  } finally {
    await browser.close();
  }
  console.log("PASS final oral partner coach responsive layout: mobile, tablet, laptop, and desktop.");
})();
