"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const exists = file => fs.existsSync(path.join(root, file));

const html = read("ingles/intermediate/reading-unit-6-olivias-overloaded-week.html");
const css = read("assets/css/intermediate-unit6-reading-article.css");
const js = read("assets/js/intermediate-unit6-reading-article.js");
const server = read("server/progress_api.py");
const overview = read("ingles/intermediate/course-overview.html");
const practiceLab = read("ingles/intermediate/practice-lab.html");
const explanation = read("ingles/intermediate/unit-6-future-plans-advice.html");

const context = { window: {} };
vm.runInNewContext(js.split("\n(() =>")[0], context);
const data = context.window.JaraLinguaUnit6ReadingArticleData;

assert.ok(html.includes("Olivia's Overloaded Week"), "HTML title/content missing");
assert.ok(html.includes("The Week Olivia Almost Lost Control of Her Schedule"), "article title missing");
assert.ok(html.includes("Arts & Lifestyle"), "article section marker missing");
assert.ok(html.includes("intermediate-unit6-reading-article.css"), "CSS link missing");
assert.ok(html.includes("intermediate-unit6-reading-article.js"), "JS link missing");
assert.equal(data.submitEndpoint, "/api/intermediate/unit6-reading-overloaded-week/submit", "submit endpoint mismatch");
assert.equal(data.questions.length, 10, "expected ten reading questions");
assert.equal(data.answers.length, 10, "expected ten answer keys");

const distribution = data.answers.reduce((acc, answer) => {
  assert.ok(answer >= 0 && answer <= 2, `answer key ${answer} outside three-option range`);
  acc[answer] = (acc[answer] || 0) + 1;
  return acc;
}, {});
assert.deepEqual(Object.keys(distribution).sort(), ["0", "1", "2"], "answers should not follow one option pattern");

data.questions.forEach((item, index) => {
  assert.equal(item.options.length, 3, `question ${index + 1} must have three options`);
  assert.ok(item.skill && item.skill.length > 3, `question ${index + 1} skill missing`);
  assert.ok(item.question.endsWith("?"), `question ${index + 1} should be phrased as a question`);
  assert.ok(item.feedback && item.feedback.length > 35, `question ${index + 1} feedback cue missing`);
});

const articleText = html
  .match(/<div class="article-card"[\s\S]*?<\/div>\s*<\/div>\s*<\/article>/)[0]
  .replace(/<[^>]+>/g, " ")
  .replace(/\s+/g, " ")
  .trim();
const articleWords = articleText.split(/\s+/).filter(Boolean).length;
assert.ok(articleWords >= 520 && articleWords <= 760, `article should be substantial but readable, got ${articleWords} words`);

[
  "Teacher delivery",
  "Send to teacher",
  "Correct answers are not shown",
  "Reference grade:",
  "Correct:",
  "Review:",
  "Read the feedback under each red card",
  "data-question-feedback",
  "q-feedback",
  "Submitted to teacher",
  "Gradebook weight: 0%",
  "Answer the 10 Reading Questions"
].forEach(marker => assert.ok((html + js).includes(marker), `missing UI marker: ${marker}`));

[
  "evidence matching",
  "timeline",
  "Your reading response",
  "textarea",
  "data-final-note",
  "readingResponse",
  "speechSynthesis",
  "<audio"
].forEach(marker => {
  assert.equal((html + js).toLowerCase().includes(marker.toLowerCase()), false, `forbidden marker present: ${marker}`);
});

const imagePath = "assets/img/english-intermediate/unit-6/unit-6-reading-olivia-schedule-article-hero.webp";
assert.ok(exists(imagePath), "professional hero image missing");
assert.ok(fs.statSync(path.join(root, imagePath)).size > 50000, "hero image is too small to be a professional visual");
assert.ok(css.includes("@media (max-width: 980px)"), "tablet breakpoint missing");
assert.ok(css.includes("@media (max-width: 680px)"), "mobile breakpoint missing");

[
  "INTERMEDIATE_UNIT6_READING_ID",
  "INTERMEDIATE_UNIT6_READING_EVALUATION",
  "INTERMEDIATE_UNIT6_READING_ANSWERS",
  "score_intermediate_unit6_reading",
  "/api/intermediate/unit6-reading-overloaded-week/submit",
  '"weight": 0',
  '"followUpOnly": True',
  '"doesNotAffectAverage": True'
].forEach(marker => assert.ok(server.includes(marker), `server missing marker: ${marker}`));

[
  overview,
  practiceLab,
  explanation
].forEach((content, index) => {
  assert.ok(content.includes("reading-unit-6-olivias-overloaded-week.html"), `navigation target missing in file ${index}`);
  assert.ok(content.includes("Olivia's Overloaded Week"), `navigation title missing in file ${index}`);
});

console.log("PASS Unit 6 reading article static audit");
