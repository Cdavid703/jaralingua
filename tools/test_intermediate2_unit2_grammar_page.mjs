import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const page = fs.readFileSync(path.join(root, "ingles", "intermediate-2", "grammar-unit-2-wishes-dreams-goals.html"), "utf8");
const script = fs.readFileSync(path.join(root, "assets", "js", "english-intermediate2-unit2-grammar.js"), "utf8");
const catalog = JSON.parse(fs.readFileSync(path.join(root, "assets", "data", "english-intermediate-2-content.json"), "utf8"));
const styles = fs.readFileSync(path.join(root, "assets", "css", "english-intermediate-2.css"), "utf8");
const practiceLabScript = fs.readFileSync(path.join(root, "assets", "js", "english-intermediate2-practice-lab.js"), "utf8");
const imagePath = path.join(root, "assets", "img", "english-intermediate-2", "unit-2", "choose-the-pattern-grammar", "choose-the-pattern-grammar-hero-v1.png");

const source = script.match(/var questions = (\[[\s\S]*?\n  \]);\n  var questionNode/);
assert.ok(source, "Question data must be readable for validation.");
const questions = Function(`return ${source[1]};`)();

assert.equal(questions.length, 15, "The grammar challenge must contain exactly 15 questions.");
assert.ok(questions.every((question) => question.options.length === 3), "Every question must provide exactly three options.");
assert.ok(questions.every((question) => Number.isInteger(question.answer) && question.answer >= 0 && question.answer < 3), "Every question needs one valid correct option.");
assert.deepEqual([0, 1, 2].map((option) => questions.filter((question) => question.answer === option).length), [5, 5, 5], "Correct answers must be balanced across A, B and C.");
for (const family of ["hope + subject + verb", "hope to + verb", "dream of + -ing", "wish + past form", "wish + could", "wish + would", "wish + past perfect", "wish someone luck", "goal is to + verb", "goal of + -ing", "would like + noun", "would like to + verb", "make a wish"]) assert.ok(questions.some((question) => question.family === family), `Missing grammar family: ${family}`);
assert.match(page, /Choose the Pattern/);
assert.match(page, /data-course-search-panel/);
assert.match(page, /grammarProgress/);
assert.match(page, /20260815-full-width-compact/);
assert.ok(fs.existsSync(imagePath), "The activity needs its professional image asset.");
assert.match(page, /grammarCheckAll/);
assert.match(script, /ie2-grammar-question-list/);
assert.doesNotMatch(script, /I hope that/);
assert.doesNotMatch(page, /I hope that/);
assert.match(styles, /Unit 2 grammar activity: all complete-sentence decisions/);
const item = catalog.items.find((entry) => entry.id === "unit-2-choose-the-pattern-grammar");
assert.ok(item && item.status === "published");
assert.equal(item.questionCount, 15);
assert.equal(item.teacherSubmission, false);
assert.equal(item.affectsAverage, false);
assert.doesNotMatch(page, /Private practice\s*[·-]\s*0%/i);
assert.doesNotMatch(practiceLabScript, /Teacher delivery\s*[·-]\s*0%|Private practice\s*[·-]\s*0%/i);
console.log("Intermediate 2 Unit 2 grammar activity contract passed.");
