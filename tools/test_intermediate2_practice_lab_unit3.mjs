import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const page = fs.readFileSync(path.join(root, "ingles", "intermediate-2", "practice-lab.html"), "utf8");
const controller = fs.readFileSync(path.join(root, "assets", "js", "english-intermediate2-practice-lab.js"), "utf8");
const styles = fs.readFileSync(path.join(root, "assets", "css", "english-intermediate2-practice-lab.css"), "utf8");
const catalog = JSON.parse(fs.readFileSync(path.join(root, "assets", "data", "english-intermediate-2-content.json"), "utf8"));

assert.match(page, /<details class="ie2-lab-folder" id="unit-3-folder">/);
assert.doesNotMatch(page, /<details class="ie2-lab-folder"[^>]*\sopen[\s>]/);
assert.doesNotMatch(page, /ie2-lab-folder-future" id="unit-3-folder"/);
assert.match(page, /id="unit3ActivityGrid"/);
assert.match(page, /id="unit3ActivityCount">3 activities/);
assert.match(page, /Pronunciation · live/);
assert.match(page, /Technology Functions Memory · live/);
assert.match(page, /What Is It For\? Device Roulette · live/);
assert.match(page, /Listening · next/);
assert.match(page, /href="#unit-3-folder">Open newest activity/);
assert.match(controller, /number: 3, grid: document\.getElementById\("unit3ActivityGrid"\)/);
assert.match(controller, /labActiveUnitTotal/);
assert.match(controller, /<a class="ie2-lab-card"/);
assert.match(controller, /<span class="ie2-lab-tag">/);
assert.match(controller, /ie2-lab-card-summary/);
assert.doesNotMatch(controller, /ie2-lab-card-(?:subtitle|meta|number)/);
assert.doesNotMatch(controller, /Open activity/);

const published = catalog.items.filter((item) => item.status === "published");
const unit3 = published.filter((item) => Number(item.unit) === 3);
assert.equal(unit3.length, 3);
assert.deepEqual(unit3.map((item) => item.id), [
  "unit-3-sound-clear-tech-support-pronunciation",
  "unit-3-technology-functions-memory",
  "unit-3-what-is-it-for-device-roulette",
]);
assert.ok(unit3.every((item) => item.gradebookProjected === false));
assert.ok(unit3.every((item) => item.affectsAverage === false));
assert.ok(unit3.every((item) => typeof item.cardSummary === "string" && item.cardSummary.length > 0 && item.cardSummary.length <= 90));
assert.ok(unit3.every((item) => item.cardSummary.trim().endsWith(".")));

assert.match(page, /english-intermediate2-practice-lab\.css\?v=20260904-unit3-one-line-cards/);
assert.match(styles, /repeat\(auto-fill, minmax\(250px, 1fr\)\)/);
assert.match(styles, /\.ie2-lab-card:hover/);
assert.match(styles, /-webkit-line-clamp: 2/);
assert.match(styles, /min-height: 112px/);

console.log("Intermediate 2 Practice Lab Unit 3 integration passed.");
