import { createRequire } from "node:module";
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require("C:\\Users\\USER\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\node\\node_modules\\playwright");

const directory = join(process.cwd(), "ingles", "basico-2");
const pages = [];

for (const file of await readdir(directory)) {
  if (!file.endsWith(".html")) continue;
  const html = await readFile(join(directory, file), "utf8");
  if (!html.includes("site-header")) continue;
  if (/http-equiv=["']refresh["']/i.test(html)) continue;
  pages.push(`/ingles/basico-2/${file}`);
}

assert.ok(pages.length > 0, "Expected Basic English Course 2 pages with site-header");

const browser = await chromium.launch({
  executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  headless: true
});

try {
  for (const viewport of [
    { width: 1366, height: 768, label: "desktop" },
    { width: 390, height: 844, label: "mobile" }
  ]) {
    const context = await browser.newContext({ viewport });
    for (const path of pages) {
      const page = await context.newPage();
      await page.goto(`http://127.0.0.1:8020${path}`, { waitUntil: "domcontentloaded" });
      await page.waitForSelector(".site-header [data-jaralingua-auth-nav]", { timeout: 5000 });
      const navAuthCount = await page.locator(".site-header [data-jaralingua-auth-nav]").count();
      const floatingAuthCount = await page.locator("body > .jaralingua-auth").count();
      const headerPosition = await page.locator(".site-header").evaluate((node) => getComputedStyle(node).position);
      assert.equal(navAuthCount, 1, `${path} ${viewport.label}: expected one top-nav auth control`);
      assert.equal(floatingAuthCount, 0, `${path} ${viewport.label}: floating auth control must not exist`);
      assert.equal(headerPosition, "fixed", `${path} ${viewport.label}: header must stay fixed`);
      await page.close();
    }
    await context.close();
  }
  console.log("PASS basic2 top-nav auth");
} finally {
  await browser.close();
}
