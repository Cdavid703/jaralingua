const fs = require("fs");
const path = require("path");
const vm = require("vm");
const assert = require("assert/strict");

const root = path.resolve(__dirname, "..");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

const html = read("ingles/intermediate/practice-unit-6-future-forms-decision-lab.html");
const css = read("assets/css/intermediate-unit6-future-forms-lab.css");
const js = read("assets/js/intermediate-unit6-future-forms-lab.js");
const server = read("server/progress_api.py");

const context = { window: {}, document: { querySelector: () => null } };
try {
  vm.runInNewContext(js.split("(() => {")[0], context, { filename: "intermediate-unit6-future-forms-lab.js" });
} catch (error) {
  throw new Error("Could not load future forms data: " + error.message);
}

const data = context.window.JaraLinguaUnit6FutureFormsLabData;
assert.equal(data.endpoint, "/api/intermediate/unit6-future-forms-decision-lab/submit", "endpoint mismatch");
assert.equal(data.questions.length, 12, "expected 12 questions");

const answers = Array.from(data.questions.map((question) => question.correct));
assert.deepEqual(JSON.parse(JSON.stringify(answers)), [1, 3, 0, 2, 3, 1, 0, 2, 1, 3, 2, 0], "answer key changed unexpectedly");
assert.deepEqual(
  [0, 1, 2, 3].map((letter) => answers.filter((answer) => answer === letter).length),
  [3, 3, 3, 3],
  "A-D answers must be balanced"
);
assert.ok(!answers.every((answer) => answer === answers[0]), "answers must not follow one repeated option");
data.questions.forEach((question, index) => {
  assert.equal(question.options.length, 4, `question ${index + 1} must have four A-D options`);
  assert.ok(question.sentence.includes("____"), `question ${index + 1} must include a blank`);
  assert.ok(question.feedback.length > 35, `question ${index + 1} feedback must be pedagogical`);
});

for (const text of [
  "Future Forms Decision Lab",
  "12 A-D questions",
  "be going to",
  "present continuous",
  "simple present",
  "will",
  "Send to teacher",
  "gradebook weight is 0%"
]) {
  assert.ok(html.includes(text), `missing text: ${text}`);
}

assert.ok(css.includes("@media (max-width: 640px)"), "mobile CSS missing");
assert.ok(css.includes("grid-template-columns: repeat(4"), "desktop A-D option grid missing");
assert.ok(css.includes("grid-template-columns: minmax(0, 1fr)"), "single-column mobile behavior missing");

const imagePath = path.join(root, "assets", "img", "english-intermediate", "unit-6", "future-forms-decision-lab", "future-forms-decision-lab-hero-v1.webp");
assert.ok(fs.existsSync(imagePath), "professional WebP image missing");
assert.ok(fs.statSync(imagePath).size > 50000, "professional image looks too small");

assert.ok(server.includes('INTERMEDIATE_UNIT6_FUTURE_FORMS_LAB_ID = "unit6FutureFormsDecisionLab"'), "backend id missing");
assert.ok(server.includes('"/api/intermediate/unit6-future-forms-decision-lab/submit"'), "backend endpoint missing");
assert.ok(server.includes("score_intermediate_unit6_future_forms_lab"), "backend scorer missing");
assert.ok(server.includes('"weight": 0'), "backend must keep weight 0");

for (const file of [
  "ingles/intermediate/practice-lab.html",
  "ingles/intermediate/course-overview.html",
  "ingles/intermediate/unit-6-future-plans-advice.html"
]) {
  assert.ok(read(file).includes("practice-unit-6-future-forms-decision-lab.html"), `${file} missing navigation link`);
}

console.log("PASS Unit 6 Future Forms Decision Lab static coverage.");
