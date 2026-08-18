import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function read(relPath) {
  return fs.readFileSync(path.join(root, relPath), "utf8");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const evaluations = read("ingles/basico-2/evaluations.html");
const practice = read("ingles/basico-2/midterm-writing-practice.html");
const script = read("assets/js/basic2-midterm-writing-practice.js");
const server = read("server/progress_api.py");
const index = read("ingles/basico-2/index.html");
const practiceLab = read("ingles/basico-2/practice-lab.html");

[
  "assets/img/english-basic-2/exams/midterm-writing-practice-hero.png",
  "assets/img/english-basic-2/exams/midterm-writing-city-weather.png",
  "assets/img/english-basic-2/exams/midterm-writing-activities.png",
].forEach((relPath) => {
  const fullPath = path.join(root, relPath);
  assert(fs.existsSync(fullPath), `Missing image: ${relPath}`);
  assert(fs.statSync(fullPath).size > 100_000, `Image looks too small: ${relPath}`);
});

assert(/Evaluations and Exam Practice/.test(evaluations), "Basic 2 must have an exam center");
assert(/midterm-writing-practice\.html/.test(evaluations), "Exam center must link to the midterm writing practice");
assert(/evaluations\.html/.test(index), "Basic 2 index must link to exam center");
assert(/evaluations\.html/.test(practiceLab), "Practice Lab quick navigation must link to exam center");

assert(/data-writing-field="title"/.test(practice), "Practice page must require a title field");
assert(/data-writing-field="cityWeather"/.test(practice), "Practice page must require city/weather writing");
assert(/data-writing-field="currentActivities"/.test(practice), "Practice page must require current activities writing");
assert(/data-writing-field="responsibilities"/.test(practice), "Practice page must require responsibility writing");
assert(/data-writing-field="readerQuestion"/.test(practice), "Practice page must require a final reader question");
assert(/id="sendTeacherButton"/.test(practice), "Practice page must include a teacher delivery button");
assert(/id="downloadBackupButton"/.test(practice), "Practice page must include an emergency backup download button");
assert(/Send to teacher · 0%/.test(practice), "Practice page must state the teacher delivery is 0%");
assert(/basic2-midterm-writing-practice\.js\?v=20260818-midterm-writing-practice/.test(practice), "Practice page must load cache-busted controller");
assert(!/background-attachment:\s*fixed|position:\s*fixed[^;]*;[^}]*midterm-hero/s.test(practice), "Hero must not be fixed");

assert(/wordList\(post\)\.length >= 100/.test(script), "Controller must enforce at least 100 words");
assert(/hasPresentContinuous\(post\)/.test(script), "Controller must detect present continuous");
assert(/localStorage\.setItem\(STORAGE_KEY/.test(script), "Controller must autosave the draft locally");
assert(/selfCheckButton\.disabled = !ready/.test(script), "Self-check must stay locked until requirements are met");
assert(/\/api\/basic2\/midterm-writing-practice\/submit/.test(script), "Controller must submit to the Basic 2 writing follow-up endpoint");
assert(/noGrade:\s*true/.test(script), "Client submission must mark this as no-grade");
assert(/submitState === "submitted"/.test(script), "Controller must track teacher submission state");
assert(/PENDING_SUBMISSION_KEY/.test(script), "Client must keep a pending submission copy for safe retry");
assert(/AbortController/.test(script), "Client delivery must use request timeout protection");
assert(/requestJson\(SUBMIT_PATH[\s\S]*,\s*1\)/.test(script), "Client delivery must retry once with the same payload");
assert(/downloadBackup/.test(script), "Client must support emergency local backup download");

assert(/BASIC2_MIDTERM_WRITING_PRACTICE_EVALUATION/.test(server), "Server must define the Basic 2 midterm writing practice evaluation");
assert(/"weight": 0/.test(server), "Server evaluation must have weight 0");
assert(/"noGrade": True/.test(server), "Server submission detail must be marked no-grade");
assert(/\/api\/basic2\/midterm-writing-practice\/submit/.test(server), "Server must expose the Basic 2 midterm writing practice endpoint");
assert(/"idempotent": True/.test(server), "Server must return idempotent success for repeated client submission ids");
assert(/missing_client_submission_id/.test(server), "Server must reject submissions without a stable client id");
assert(/submissionHistory/.test(server), "Server must preserve prior writing practice attempts");
assert(/missing_present_continuous/.test(server), "Server must validate present continuous in the real final post");
assert(!/student\.setdefault\("grades", \{\}\)\[BASIC2_MIDTERM_WRITING_PRACTICE_ID\]/.test(server), "No numeric grade should be written for the writing practice deliverable");

console.log("PASS Basic 2 midterm writing practice page");
