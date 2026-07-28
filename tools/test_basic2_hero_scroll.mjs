import { createRequire } from "node:module";
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require("C:\\Users\\USER\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\node\\node_modules\\playwright");

const directory = join(process.cwd(), "ingles", "basico-2");
const baseUrl = process.env.BASIC2_HERO_TEST_BASE_URL || "http://127.0.0.1:8020";
const heroSelector = ".basic-course-hero, .overview-hero, .lesson-hero, .coach-hero, .games-hero, header.hero";
const pages = [];

for (const file of await readdir(directory)) {
  if (!file.endsWith(".html")) continue;
  const html = await readFile(join(directory, file), "utf8");
  if (/http-equiv=["']refresh["']/i.test(html)) continue;
  if (!/(basic-course-hero|overview-hero|lesson-hero|coach-hero|games-hero|class=["']hero["'])/.test(html)) continue;
  pages.push(`/ingles/basico-2/${file}`);
}

assert.ok(pages.length > 0, "Expected Basic English Course 2 pages with hero banners");

const browser = await chromium.launch({
  executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  headless: true
});

try {
  for (const viewport of [
    { width: 1366, height: 768, label: "desktop" },
    { width: 820, height: 1180, label: "tablet" },
    { width: 390, height: 844, label: "mobile" }
  ]) {
    const context = await browser.newContext({ viewport });
    for (const path of pages) {
      const page = await context.newPage();
      await page.goto(`${baseUrl}${path}`, { waitUntil: "domcontentloaded" });
      await page.waitForSelector(heroSelector, { timeout: 5000 });
      const hero = page.locator(heroSelector).first();
      const before = await hero.evaluate((node) => {
        const styles = getComputedStyle(node);
        return {
          top: node.getBoundingClientRect().top,
          position: styles.position,
          backgroundAttachment: styles.backgroundAttachment
        };
      });
      await page.evaluate(() => window.scrollTo(0, 260));
      await page.waitForTimeout(120);
      const after = await hero.evaluate((node) => ({
        top: node.getBoundingClientRect().top,
        scrollY: window.scrollY
      }));
      assert.notEqual(before.position, "fixed", `${path} ${viewport.label}: hero must not be fixed`);
      assert.notEqual(before.position, "sticky", `${path} ${viewport.label}: hero must not be sticky`);
      assert.ok(
        before.backgroundAttachment.split(",").every((value) => value.trim() !== "fixed"),
        `${path} ${viewport.label}: hero background attachment must not be fixed`
      );
      if (after.scrollY >= 160) {
        assert.ok(
          after.top < before.top - 120,
          `${path} ${viewport.label}: hero did not move with scroll; before=${before.top}, after=${after.top}`
        );
      }
      await page.close();
    }
    await context.close();
  }
  console.log("PASS basic2 hero scroll");
} finally {
  await browser.close();
}
