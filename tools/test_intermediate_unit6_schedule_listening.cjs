"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const exists = file => fs.existsSync(path.join(root, file));

const html = read("ingles/intermediate/listening-unit-6-schedule-change-call.html");
const css = read("assets/css/intermediate-unit6-schedule-listening.css");
const js = read("assets/js/intermediate-unit6-schedule-listening.js");
const server = read("server/progress_api.py");
const overview = read("ingles/intermediate/course-overview.html");
const practiceLab = read("ingles/intermediate/practice-lab.html");
const explanation = read("ingles/intermediate/unit-6-future-plans-advice.html");
const script = read("ingles/intermediate/audio/unit-6-schedule-change-call-scripts.md");

const context = { window: {} };
vm.runInNewContext(js.split("\n(() =>")[0], context);
const data = context.window.JaraLinguaUnit6ScheduleListeningData;

assert.ok(html.includes("The Schedule Change Call"), "HTML title/content missing");
assert.ok(html.includes("intermediate-unit6-schedule-listening.css"), "CSS link missing");
assert.ok(html.includes("intermediate-unit6-schedule-listening.js"), "JS link missing");
assert.equal(data.submitEndpoint, "/api/intermediate/unit6-schedule-change-call/submit", "submit endpoint mismatch");
assert.equal(data.transcriptEndpoint, "/api/intermediate/unit6-schedule-change-call/transcript", "transcript endpoint mismatch");
assert.equal(data.questions.length, 10, "expected ten listening questions");
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
});

[
  "Speed",
  'data-audio-speed="0.75"',
  'data-audio-speed="1"',
  'data-audio-speed="1.25"',
  "Teacher transcript",
  "Send to teacher",
  "Correct answers are not shown",
  "Submitted to teacher",
  "Gradebook weight: 0%"
].forEach(marker => assert.ok((html + js).includes(marker), `missing UI marker: ${marker}`));

assert.ok(!js.includes("speechSynthesis"), "activity must not use browser speech synthesis");
assert.ok(!html.includes("Your reading response"), "page must not carry copied reading labels");
assert.ok(css.includes("@media (max-width: 980px)"), "tablet breakpoint missing");
assert.ok(css.includes("@media (max-width: 680px)"), "mobile breakpoint missing");

const imagePath = "assets/img/english-intermediate/unit-6/unit-6-schedule-change-call-hero.webp";
assert.ok(exists(imagePath), "professional hero image missing");
assert.ok(fs.statSync(path.join(root, imagePath)).size > 50000, "hero image is too small to be a professional visual");

const audioPath = "ingles/intermediate/audio/unit-6-schedule-change-call.mp3";
assert.ok(exists(audioPath), "professional MP3 missing");
const audioBuffer = fs.readFileSync(path.join(root, audioPath));
assert.ok(audioBuffer.length > 500000, "MP3 is unexpectedly small");
assert.equal(audioBuffer.subarray(0, 3).toString("ascii"), "ID3", "MP3 must contain an ID3 header");

assert.doesNotMatch(script, /\bNarrator\s*:/i, "ElevenLabs script should not include narrator labels");
assert.doesNotMatch(script, /\bsays\b/i, "ElevenLabs script should not ask voices to read role-label wording");
assert.ok(script.includes("Olivia:"), "Olivia voice line missing");
assert.ok(script.includes("Marcus:"), "Marcus voice line missing");

[
  "INTERMEDIATE_UNIT6_LISTENING_ID",
  "INTERMEDIATE_UNIT6_LISTENING_EVALUATION",
  "INTERMEDIATE_UNIT6_LISTENING_ANSWERS",
  "INTERMEDIATE_UNIT6_LISTENING_TRANSCRIPT",
  "score_intermediate_unit6_listening",
  "/api/intermediate/unit6-schedule-change-call/submit",
  "/api/intermediate/unit6-schedule-change-call/transcript",
  '"weight": 0',
  '"followUpOnly": True',
  '"doesNotAffectAverage": True'
].forEach(marker => assert.ok(server.includes(marker), `server missing marker: ${marker}`));

[
  overview,
  practiceLab,
  explanation
].forEach((content, index) => {
  assert.ok(content.includes("listening-unit-6-schedule-change-call.html"), `navigation target missing in file ${index}`);
  assert.ok(content.includes("The Schedule Change Call"), `navigation title missing in file ${index}`);
});

console.log("PASS Unit 6 schedule listening static audit");
