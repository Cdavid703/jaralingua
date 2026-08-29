import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const page = fs.readFileSync(path.join(root, "ingles", "intermediate-2", "practice-lab.html"), "utf8");
const controller = fs.readFileSync(path.join(root, "assets", "js", "english-intermediate2-practice-lab.js"), "utf8");
const catalog = JSON.parse(fs.readFileSync(path.join(root, "assets", "data", "english-intermediate-2-content.json"), "utf8"));

assert.match(page, /<details class="ie2-lab-folder" id="unit-3-folder" open>/);
assert.doesNotMatch(page, /ie2-lab-folder-future" id="unit-3-folder"/);
assert.match(page, /id="unit3ActivityGrid"/);
assert.match(page, /id="unit3ActivityCount">1 activity/);
assert.match(page, /Pronunciation · live/);
assert.match(page, /Listening · next/);
assert.match(page, /href="#unit-3-folder">Open newest activity/);
assert.match(controller, /number: 3, grid: document\.getElementById\("unit3ActivityGrid"\)/);
assert.match(controller, /labActiveUnitTotal/);

const published = catalog.items.filter((item) => item.status === "published");
const unit3 = published.filter((item) => Number(item.unit) === 3);
assert.equal(unit3.length, 1);
assert.equal(unit3[0].id, "unit-3-sound-clear-tech-support-pronunciation");
assert.equal(unit3[0].gradebookProjected, false);
assert.equal(unit3[0].affectsAverage, false);

console.log("Intermediate 2 Practice Lab Unit 3 integration passed.");

