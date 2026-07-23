"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const exists = file => fs.existsSync(path.join(root, file));

const html = read("ingles/intermediate/practice-unit-6-olivias-schedule-gap-fill.html");
const css = read("assets/css/intermediate-unit6-grammar-storybook.css");
const js = read("assets/js/intermediate-unit6-grammar-storybook.js");
const server = read("server/progress_api.py");
const overview = read("ingles/intermediate/course-overview.html");
const practiceLab = read("ingles/intermediate/practice-lab.html");
const explanation = read("ingles/intermediate/unit-6-future-plans-advice.html");

const context = { window: {} };
vm.runInNewContext(js.split("\n(() =>")[0], context);
const data = context.window.JaraLinguaUnit6GrammarStorybookData;

assert.ok(html.includes("Olivia's Schedule Storybook"), "HTML title/content missing");
assert.ok(html.includes("intermediate-unit6-grammar-storybook.css"), "CSS link missing");
assert.ok(html.includes("intermediate-unit6-grammar-storybook.js"), "JS link missing");
assert.equal(data.endpoint, "/api/intermediate/unit6-grammar-storybook/submit", "endpoint mismatch");
assert.equal(data.pages.length, 4, "expected four storybook pages");
assert.equal(data.blanks.length, 17, "expected seventeen dropdown blanks");

const storyWords = data.pages
  .flatMap(page => page.paragraphs)
  .join(" ")
  .replace(/\{\{\d+\}\}/g, "blank")
  .replace(/[^\w'\s-]/g, " ")
  .trim()
  .split(/\s+/)
  .filter(Boolean);
assert.ok(storyWords.length >= 200 && storyWords.length <= 250, `story should be 200-250 words, got ${storyWords.length}`);

data.pages.forEach((page, index) => {
  const imagePath = page.image.replace("../../", "");
  assert.ok(exists(imagePath), `page ${index + 1} image missing`);
  assert.ok(fs.statSync(path.join(root, imagePath)).size > 50000, `page ${index + 1} image is too small to be professional`);
  assert.ok(page.alt.length > 35, `page ${index + 1} alt text too short`);
  assert.ok(page.caption.length > 40, `page ${index + 1} caption too short`);
});

const answerDistribution = data.blanks.reduce((acc, blank) => {
  assert.equal(blank.options.length, 3, `blank ${blank.id + 1} must have three options`);
  assert.ok(blank.correct >= 0 && blank.correct <= 2, `blank ${blank.id + 1} correct index invalid`);
  assert.ok(blank.review && blank.review.includes(`Blank ${blank.id + 1}`), `blank ${blank.id + 1} review cue missing`);
  acc[blank.correct] = (acc[blank.correct] || 0) + 1;
  return acc;
}, {});
assert.deepEqual(Object.keys(answerDistribution).sort(), ["0", "1", "2"], "answers should not follow one option pattern");

[
  "going to",
  "arrangements",
  "decision now",
  "advice",
  "possibility",
  "obligation",
  "phrasal verb",
  "idiom"
].forEach(category => {
  assert.ok(data.blanks.some(blank => blank.category === category), `missing category ${category}`);
});

[
  "Send to teacher",
  "Submitted to teacher",
  "Gradebook weight: 0%",
  "correct answers will not be shown",
  "Open the book",
  "book-cover",
  "storybook-card is-cover",
  "storybook-card is-open"
].forEach(marker => assert.ok((html + js).includes(marker), `missing UI marker: ${marker}`));

assert.ok(!js.includes("speechSynthesis"), "activity must not use browser speech synthesis");
assert.ok(css.includes("@media (max-width: 980px)"), "tablet breakpoint missing");
assert.ok(css.includes("@media (max-width: 680px)"), "mobile breakpoint missing");
assert.ok(css.includes("@media (max-width: 460px)"), "small mobile breakpoint missing");

[
  "INTERMEDIATE_UNIT6_GRAMMAR_STORYBOOK_ID",
  "INTERMEDIATE_UNIT6_GRAMMAR_STORYBOOK_EVALUATION",
  "INTERMEDIATE_UNIT6_GRAMMAR_STORYBOOK_ANSWERS",
  "score_intermediate_unit6_grammar_storybook",
  "/api/intermediate/unit6-grammar-storybook/submit",
  '"weight": 0',
  '"followUpOnly": True'
].forEach(marker => assert.ok(server.includes(marker), `server missing marker: ${marker}`));

[
  overview,
  practiceLab,
  explanation
].forEach((content, index) => {
  assert.ok(content.includes("practice-unit-6-olivias-schedule-gap-fill.html"), `navigation target missing in file ${index}`);
  assert.ok(content.includes("Olivia's Schedule Storybook"), `navigation title missing in file ${index}`);
});

console.log("PASS Unit 6 grammar storybook static audit");
