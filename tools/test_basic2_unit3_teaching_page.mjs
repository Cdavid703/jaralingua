import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/USER/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");

const ROOT = process.cwd();
const BASE_URL = process.env.BASIC2_UNIT3_TEST_BASE_URL || "http://127.0.0.1:8020";
const pagePath = path.join(ROOT, "ingles/basico-2/unit-3-around-the-world.html");
const overviewPath = path.join(ROOT, "ingles/basico-2/course-overview.html");
const heroPath = path.join(ROOT, "assets/img/english-basic-2/unit-3-around-the-world/unit-3-around-the-world-hero.webp");
const docPath = path.join(ROOT, "docs/basic-2-unit-3-around-the-world-teaching-plan.md");

assert.equal(fs.existsSync(pagePath), true, "Missing Unit 3 teaching page");
assert.equal(fs.existsSync(overviewPath), true, "Missing Course Overview");
assert.equal(fs.existsSync(heroPath), true, "Missing Unit 3 hero image");
assert.equal(fs.existsSync(docPath), true, "Missing Unit 3 teaching plan");
assert.ok(fs.statSync(heroPath).size > 20000, "Hero image is unexpectedly small");

const source = fs.readFileSync(pagePath, "utf8");
assert.match(source, /Unit 3: Around the World/);
assert.match(source, /Countries, Nationalities, and Origin/);
assert.match(source, /Simple Comparisons/);
assert.match(source, /Superlatives for World Places/);
assert.match(source, /one of the most \+ adjective \+ plural noun/i);
assert.match(source, /the \+ adjective \+ -est/i);
assert.match(source, /the most \+ adjective/i);
assert.match(source, /good &rarr; the best/i);
assert.match(source, /Adapted from Intermedio/);
assert.match(source, /travel around/);
assert.match(source, /go abroad/);
assert.match(source, /Not: beautifulest[\s\S]{0,160}Use: <strong>the most beautiful<\/strong>/i);

const overview = fs.readFileSync(overviewPath, "utf8");
assert.match(overview, /unit-3-around-the-world\.html/);
assert.match(overview, /unit-3-around-the-world-hero\.webp/);
assert.doesNotMatch(overview, /unit-3-world[\s\S]{0,900}This unit structure is reserved/i);

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
});
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
page.on("console", (message) => {
  const text = message.text();
  const ignored = /ERR_NETWORK_ACCESS_DENIED/.test(text)
    || /upgrade-insecure-requests/.test(text)
    || /csp-report/.test(text)
    || /Failed to load resource: the server responded with a status of 404/.test(text)
    || /accounts\.google\.com/.test(text);
  if (message.type() === "error" && !ignored) errors.push(text);
});
page.on("pageerror", (error) => errors.push(error.message));

await page.goto(`${BASE_URL}/ingles/basico-2/unit-3-around-the-world.html`, { waitUntil: "networkidle" });
await assert.doesNotReject(async () => page.locator("h1", { hasText: "Unit 3: Around the World" }).waitFor());
await page.locator("summary", { hasText: "Superlative forms" }).click();
await assert.doesNotReject(async () => page.locator("text=big → the biggest").first().waitFor());
await page.locator("summary", { hasText: "One of the most" }).click();
await assert.doesNotReject(async () => page.locator("text=one of the most beautiful cities").first().waitFor());

const heroPosition = await page.locator(".lesson-hero").evaluate((node) => getComputedStyle(node).position);
assert.notEqual(heroPosition, "fixed", "Hero must not be fixed on mobile");
assert.notEqual(heroPosition, "sticky", "Hero must not be sticky on mobile");

const bodySizes = await page.evaluate(() => ({
  scrollWidth: document.documentElement.scrollWidth,
  clientWidth: document.documentElement.clientWidth
}));
assert.ok(bodySizes.scrollWidth <= bodySizes.clientWidth + 2, `Unexpected horizontal overflow: ${bodySizes.scrollWidth} > ${bodySizes.clientWidth}`);

const heroLoaded = await page.locator(".lesson-hero-image img").evaluate((image) => image.complete && image.naturalWidth > 0);
assert.equal(heroLoaded, true, "Hero image did not load");

const countryCards = await page.locator(".world-country-card").count();
assert.equal(countryCards, 10, "Expected 10 country/nationality cards");

await page.goto(`${BASE_URL}/ingles/basico-2/course-overview.html`, { waitUntil: "networkidle" });
await page.locator("#unit-3-world summary").click();
await assert.doesNotReject(async () => page.locator('a[href="unit-3-around-the-world.html"]', { hasText: "Open full unit" }).waitFor());
const overviewHeroLoaded = await page.locator('img[src*="unit-3-around-the-world-hero.webp"]').first().evaluate((image) => image.complete && image.naturalWidth > 0);
assert.equal(overviewHeroLoaded, true, "Overview Unit 3 image did not load");

assert.deepEqual(errors, []);
await browser.close();
console.log("PASS basic2 unit3 teaching page");
