import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const page = fs.readFileSync(path.join(root, "ingles", "intermediate-2", "midterm-writing-practice-catharsis.html"), "utf8");
const evaluations = fs.readFileSync(path.join(root, "ingles", "intermediate-2", "evaluations.html"), "utf8");
const home = fs.readFileSync(path.join(root, "ingles", "intermediate-2", "index.html"), "utf8");
const script = fs.readFileSync(path.join(root, "assets", "js", "english-intermediate2-midterm-writing-practice.js"), "utf8");
const catalog = JSON.parse(fs.readFileSync(path.join(root, "assets", "data", "english-intermediate-2-content.json"), "utf8"));
const assetDir = path.join(root, "assets", "img", "english-intermediate-2", "unit-2", "midterm-writing-catharsis");

assert.match(page, /Midterm Writing Practice/);
assert.match(page, /An email to a best friend abroad/);
assert.match(page, /approximately <strong>180 words/);
assert.match(page, /I wish I had/);
assert.match(page, /I hope to/);
assert.match(page, /End your email on an optimistic note/);
assert.match(page, /Preparation, not evaluation/);
assert.doesNotMatch(page, /Send (?:to )?teacher/i);
assert.doesNotMatch(page, /0%/);
assert.doesNotMatch(page, /gradebook/i);
assert.match(page, /data-course-search-panel/);
assert.match(page, /english-intermediate-2\.css\?v=20260815-full-width-compact/);
assert.match(page, /future-planning-guide-v1\.png/);
assert.match(page, /friend-abroad-guide-v1\.png/);

assert.match(script, /ie2_midterm_writing_catharsis_draft/);
assert.match(script, /wish(?:ed)?/);
assert.match(script, /hope\\s\+to/);
assert.match(script, /words\(text\)\.length >= 165/);
assert.match(script, /localStorage/);
assert.doesNotMatch(script, /fetch\(/);
assert.doesNotMatch(script, /speechSynthesis/);

for (const filename of ["midterm-writing-catharsis-hero-v1.png", "future-planning-guide-v1.png", "friend-abroad-guide-v1.png"]) {
  const image = path.join(assetDir, filename);
  assert.ok(fs.existsSync(image), `Missing professional writing guide image: ${filename}`);
  assert.ok(fs.statSync(image).size > 100_000, `Writing guide image is unexpectedly small: ${filename}`);
}

const item = catalog.items.find((activity) => activity.id === "unit-2-midterm-writing-catharsis-practice");
assert.equal(item, undefined, "A mock exam must not appear in the Practice Lab catalog.");
assert.match(evaluations, /Evaluations and Mock Exams/);
assert.match(evaluations, /midterm-writing-practice-catharsis\.html/);
assert.match(evaluations, /preparation only/i);
assert.doesNotMatch(evaluations, /0%/);
assert.match(home, /href="\.\/evaluations\.html">Open Evaluations and Mock Exams/);

console.log("Intermediate 2 Unit 2 midterm writing preparation contract passed.");
