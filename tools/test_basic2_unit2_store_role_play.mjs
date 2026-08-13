import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/USER/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");

const ROOT = process.cwd();
const pagePath = path.join(ROOT, "ingles", "basico-2", "practice-unit-2-store-role-play.html");
const practiceLabPath = path.join(ROOT, "ingles", "basico-2", "practice-lab.html");
const pageSource = fs.readFileSync(pagePath, "utf8");
const practiceLab = fs.readFileSync(practiceLabPath, "utf8");

assert.match(practiceLab, /practice-unit-2-store-role-play\.html/, "Practice Lab must link the Store Role-Play activity.");
assert.match(practiceLab, /Pair \/ Trio Speaking/, "Practice Lab card must identify this as a speaking activity.");
assert.match(pageSource, /Pairs or trios/, "Activity must restrict grouping to pairs or trios.");
assert.match(pageSource, /One phrasal verb/, "Activity must require a phrasal verb.");
assert.match(pageSource, /One idiom or expression/, "Activity must require an idiom or expression.");
assert.match(pageSource, /Conversation paths/, "Activity must include conversation paths.");
assert.match(pageSource, /Jacket for a concert/, "Activity must include the jacket conversation path.");
assert.match(pageSource, /Role cards/, "Activity must include role cards.");
assert.match(pageSource, /Customer starters/, "Activity must include sentence starters.");
assert.match(pageSource, /Pronunciation checklist/, "Activity must include the pronunciation checklist.");
assert.match(pageSource, /Board preparation/, "Activity must include board preparation instructions.");
assert.match(pageSource, /Example conversation to perform with one student/, "Activity must include a teacher-student model conversation.");
assert.match(pageSource, /data-expression-audio="audio\/unit2\/expressions\/try-on\.mp3"/, "Activity must reuse Unit 2 expression audio cards.");
assert.match(pageSource, /english-basic2-expression-audio\.js/, "Activity must load the expression audio client.");
assert.doesNotMatch(pageSource, /Teacher quick feedback guide/i, "The approved scope excludes a teacher quick feedback guide.");
assert.doesNotMatch(pageSource, /Challenge options/i, "The approved scope excludes challenge options.");
assert.doesNotMatch(pageSource, /Board template visual/i, "The approved scope excludes a board template visual.");

for (const image of ["store-role-play-hero.png", "store-role-play-board-prep.png"]) {
  const imagePath = path.join(ROOT, "assets", "img", "english-basic-2", "unit-2-shopping-experiences", image);
  assert.equal(fs.existsSync(imagePath), true, `Missing role-play image: ${image}`);
  assert.ok(fs.statSync(imagePath).size > 100000, `Role-play image is unexpectedly small: ${image}`);
}

const BASE_URL = process.env.BASIC2_UNIT2_STORE_ROLE_PLAY_TEST_BASE_URL || "http://127.0.0.1:8020";
const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
});
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
page.on("console", (message) => {
  const text = message.text();
  const ignored = /ERR_NETWORK_ACCESS_DENIED|upgrade-insecure-requests|csp-report|404/.test(text);
  if (message.type() === "error" && !ignored) errors.push(text);
});
page.on("pageerror", (error) => errors.push(error.message));

await page.goto(`${BASE_URL}/ingles/basico-2/practice-unit-2-store-role-play.html`, { waitUntil: "networkidle" });
await assert.doesNotReject(async () => page.locator("h1", { hasText: "Store Role-Play" }).waitFor());

const heroPosition = await page.locator(".lesson-hero").evaluate((node) => getComputedStyle(node).position);
assert.notEqual(heroPosition, "fixed", "Hero must not be fixed.");
assert.notEqual(heroPosition, "sticky", "Hero must not be sticky.");

const bodySizes = await page.evaluate(() => ({
  scrollWidth: document.documentElement.scrollWidth,
  clientWidth: document.documentElement.clientWidth
}));
assert.ok(bodySizes.scrollWidth <= bodySizes.clientWidth + 2, `Unexpected horizontal overflow: ${bodySizes.scrollWidth} > ${bodySizes.clientWidth}`);

const unitAudioCards = await page.locator("[data-expression-audio^='audio/unit2/expressions/']").count();
assert.equal(unitAudioCards, 8, "The activity should expose a compact set of 8 expression audio cards.");

const imageLoaded = await page.locator(".lesson-hero-image img").evaluate((image) => image.complete && image.naturalWidth > 0);
assert.equal(imageLoaded, true, "Hero image should load.");

const audioStatus = await page.evaluate(async () => {
  const audio = new Audio("audio/unit2/expressions/try-on.mp3");
  await new Promise((resolve) => {
    audio.addEventListener("loadedmetadata", resolve, { once: true });
    audio.addEventListener("error", resolve, { once: true });
    audio.load();
    setTimeout(resolve, 5000);
  });
  return { readyState: audio.readyState, duration: audio.duration };
});
assert.ok(audioStatus.readyState >= 1, "Expression audio metadata should load.");
assert.ok(Number.isFinite(audioStatus.duration) && audioStatus.duration > 0, "Expression audio duration should be available.");

const teacherModelContrast = await page.locator(".roleplay-model .roleplay-board p").first().evaluate((node) => {
  const paragraph = getComputedStyle(node);
  const board = getComputedStyle(node.closest(".roleplay-board"));
  const heading = getComputedStyle(document.querySelector(".roleplay-model h2"));
  const model = getComputedStyle(document.querySelector(".roleplay-model"));
  return {
    boardText: paragraph.color,
    boardBackground: board.backgroundColor,
    teacherTitle: heading.color,
    teacherPanel: model.backgroundColor
  };
});
assert.equal(teacherModelContrast.boardText, "rgb(255, 255, 255)", "Teacher model board text must be white on the dark board.");
assert.equal(teacherModelContrast.boardBackground, "rgb(7, 31, 79)", "Teacher model board must keep the dark blue background.");
assert.equal(teacherModelContrast.teacherTitle, "rgb(7, 31, 79)", "Teacher model title must be dark on the white card.");
assert.equal(teacherModelContrast.teacherPanel, "rgb(255, 255, 255)", "Teacher model panel must be white.");

assert.deepEqual(errors, [], "Page should not emit console errors.");

await browser.close();
console.log("PASS basic2 unit2 store role-play activity");
