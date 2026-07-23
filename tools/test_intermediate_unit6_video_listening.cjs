"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const exists = file => fs.existsSync(path.join(root, file));
const size = file => fs.statSync(path.join(root, file)).size;

const html = read("ingles/intermediate/video-listening-unit-6-olivias-week.html");
const css = read("assets/css/intermediate-unit6-video-listening.css");
const js = read("assets/js/intermediate-unit6-video-listening.js");
const server = read("server/progress_api.py");
const overview = read("ingles/intermediate/course-overview.html");
const practiceLab = read("ingles/intermediate/practice-lab.html");
const explanation = read("ingles/intermediate/unit-6-future-plans-advice.html");

const context = { window: {} };
vm.runInNewContext(js.split("\n(() =>")[0], context);
const data = context.window.JaraLinguaUnit6VideoListeningData;

assert.ok(html.includes("Olivia's Week in 90 Seconds"), "HTML title/content missing");
assert.ok(html.includes("intermediate-unit6-video-listening.css"), "CSS link missing");
assert.ok(html.includes("intermediate-unit6-video-listening.js"), "JS link missing");
assert.equal(data.submitEndpoint, "/api/intermediate/unit6-video-listening/submit", "submit endpoint mismatch");
assert.equal(data.transcriptEndpoint, "/api/intermediate/unit6-video-listening/transcript", "transcript endpoint mismatch");
assert.equal(data.youtubeVideoId, "", "YouTube ID should remain pending until the teacher provides the link");
assert.equal(data.questions.length, 10, "expected ten video-listening questions");
assert.deepEqual(Array.from(data.answers), [1, 2, 0, 2, 1, 0, 2, 1, 0, 2], "answer key mismatch");

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
  "YouTube link pending",
  'data-youtube-speed="0.75"',
  'data-youtube-speed="1"',
  'data-youtube-speed="1.25"',
  "Teacher transcript",
  "Teacher delivery",
  "Send to teacher",
  "Correct answers are not shown",
  "Submitted to teacher",
  "Gradebook weight: 0%"
].forEach(marker => assert.ok((html + js).includes(marker), `missing UI marker: ${marker}`));

[
  "speechSynthesis",
  "SpeechSynthesis",
  "utterance",
  "Your reading response",
  "textarea",
  "data-final-note",
  "show correct",
  "Correct option"
].forEach(marker => {
  assert.equal((html + js).toLowerCase().includes(marker.toLowerCase()), false, `forbidden marker present: ${marker}`);
});

const imagePath = "assets/img/english-intermediate/unit-6/video-listening/olivias-week-video-listening-hero-v1.webp";
assert.ok(exists(imagePath), "professional hero image missing");
assert.ok(size(imagePath) > 50000, "hero image is too small to be a professional visual");
assert.ok(css.includes("@media (max-width: 900px)"), "tablet breakpoint missing");
assert.ok(css.includes("@media (max-width: 560px)"), "mobile breakpoint missing");
assert.ok(css.includes("aspect-ratio: 16 / 9"), "video frame ratio missing");

[
  "INTERMEDIATE_UNIT6_VIDEO_LISTENING_ID",
  "INTERMEDIATE_UNIT6_VIDEO_LISTENING_EVALUATION",
  "INTERMEDIATE_UNIT6_VIDEO_LISTENING_ANSWERS",
  "INTERMEDIATE_UNIT6_VIDEO_LISTENING_TRANSCRIPT",
  "score_intermediate_unit6_video_listening",
  "/api/intermediate/unit6-video-listening/submit",
  "/api/intermediate/unit6-video-listening/transcript",
  '"weight": 0',
  '"followUpOnly": True',
  '"doesNotAffectAverage": True'
].forEach(marker => assert.ok(server.includes(marker), `server missing marker: ${marker}`));

[
  overview,
  practiceLab,
  explanation
].forEach((content, index) => {
  assert.ok(content.includes("video-listening-unit-6-olivias-week.html"), `navigation target missing in file ${index}`);
  assert.ok(content.includes("Olivia's Week in 90 Seconds"), `navigation title missing in file ${index}`);
});

assert.ok(practiceLab.includes("44 activities"), "Practice Lab total count should be 44");
assert.ok(practiceLab.includes("Unit 6 - 6 activities"), "Unit 6 quick count should be 6");

console.log("PASS Unit 6 video listening static audit");
