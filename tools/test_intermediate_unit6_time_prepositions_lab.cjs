const fs = require("fs");
const path = require("path");
const vm = require("vm");
const assert = require("assert/strict");

const root = path.resolve(__dirname, "..");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

const html = read("ingles/intermediate/practice-unit-6-time-prepositions-lab.html");
const css = read("assets/css/intermediate-unit6-time-prepositions-lab.css");
const js = read("assets/js/intermediate-unit6-time-prepositions-lab.js");
const practice = read("ingles/intermediate/practice-lab.html");
const server = read("server/progress_api.py");

const context = { window: {}, document: { querySelector: () => null } };
vm.runInNewContext(js.split("(() => {")[0], context, { filename: "intermediate-unit6-time-prepositions-lab.js" });

const data = context.window.JaraLinguaUnit6TimePrepositionsLabData;
assert.equal(data.endpoint, "/api/intermediate/unit6-time-prepositions-lab/submit", "endpoint mismatch");
assert.equal(data.questions.length, 10, "expected 10 questions");

const answers = Array.from(data.questions.map(question => question.correct));
assert.deepEqual(answers, [1, 0, 2, 1, 0, 2, 0, 2, 1, 0], "answer key changed unexpectedly");
assert.deepEqual(
  [0, 1, 2].map(letter => answers.filter(answer => answer === letter).length),
  [4, 3, 3],
  "A-C answers must be distributed without one dominant repeated answer"
);
assert.ok(!answers.every(answer => answer === answers[0]), "answers must not be one repeated option");
assert.ok(!answers.join("").includes("0000") && !answers.join("").includes("1111") && !answers.join("").includes("2222"), "answers must not contain obvious repeated streaks");

for (const [index, question] of data.questions.entries()) {
  assert.equal(question.options.length, 3, `question ${index + 1} must have exactly three A-C options`);
  assert.ok(question.sentence.includes("____"), `question ${index + 1} must include a blank`);
  assert.ok(question.feedback.length > 45, `question ${index + 1} feedback must explain the rule`);
}

for (const text of [
  "Time Prepositions Schedule Lab",
  "10 A-B-C questions",
  "on",
  "at",
  "in",
  "from...to",
  "Send to teacher",
  "gradebook weight 0%"
]) {
  assert.ok(html.includes(text), `missing text: ${text}`);
}

assert.ok(css.includes("@media (max-width: 640px)"), "mobile CSS missing");
assert.ok(css.includes("grid-template-columns: repeat(3"), "desktop A-C option grid missing");
assert.ok(css.includes("grid-template-columns: minmax(0, 1fr)"), "single-column mobile behavior missing");

const imagePath = path.join(root, "assets", "img", "english-intermediate", "unit-6", "time-prepositions-lab", "time-prepositions-schedule-lab-hero-v1.webp");
assert.ok(fs.existsSync(imagePath), "new professional WebP image missing");
assert.ok(fs.statSync(imagePath).size > 70000, "professional image looks too small");

assert.ok(practice.includes("practice-unit-6-time-prepositions-lab.html"), "Practice Lab card missing");
assert.ok(practice.includes("Unit 6 - 10 activities"), "Practice Lab Unit 6 count incorrect");
assert.ok(server.includes('INTERMEDIATE_UNIT6_TIME_PREPOSITIONS_LAB_ID = "unit6TimePrepositionsScheduleLab"'), "backend id missing");
assert.ok(server.includes('"/api/intermediate/unit6-time-prepositions-lab/submit"'), "backend endpoint missing");
assert.ok(server.includes("score_intermediate_unit6_time_prepositions_lab"), "backend scorer missing");
assert.ok(server.includes('"weight": 0'), "backend must keep weight 0");

console.log("PASS Unit 6 Time Prepositions Schedule Lab static coverage.");
