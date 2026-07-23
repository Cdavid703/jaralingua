"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const exists = file => fs.existsSync(path.join(root, file));
const size = file => fs.statSync(path.join(root, file)).size;

const html = read("ingles/intermediate/pronunciation-unit-6-future-plans-advice.html");
const js = read("assets/js/english-intermediate-pronunciation-unit6.js");
const server = read("server/progress_api.py");
const overview = read("ingles/intermediate/course-overview.html");
const practiceLab = read("ingles/intermediate/practice-lab.html");
const explanation = read("ingles/intermediate/unit-6-future-plans-advice.html");
const script = read("ingles/intermediate/audio/pronunciation/unit-6-future-plans-advice-script.md");

assert.ok(html.includes("Future Plans and Advice Pronunciation Lab"), "HTML title/content missing");
assert.ok(html.includes("english-intermediate-pronunciation.css"), "pronunciation CSS link missing");
assert.ok(html.includes("english-intermediate-pronunciation-unit6.js"), "unit 6 JS link missing");
assert.ok(html.includes("Audio generated with ElevenLabs"), "professional audio label missing");
assert.ok(html.includes("Shadow Mode"), "shadow mode missing");
assert.ok(html.includes("Send to teacher") || js.includes("Send to teacher"), "teacher submission UI missing");
assert.ok(html.includes("gradebook weight 0") || js.includes("Weight: 0"), "weight 0 note missing");

[
  'data-speed="0.75"',
  'data-speed="1"',
  'data-speed="1.25"'
].forEach(marker => assert.ok(html.includes(marker), `missing speed button ${marker}`));

[
  "audio/pronunciation/unit-6-intermediate/section-1.mp3",
  "audio/pronunciation/unit-6-intermediate/section-2.mp3",
  "audio/pronunciation/unit-6-intermediate/section-3.mp3",
  "audio/pronunciation/unit-6-intermediate/section-4.mp3",
  "audio/pronunciation/unit-6-intermediate/future-plans-advice-model-us.mp3",
  "/api/intermediate/unit6-pronunciation/submit",
  "jaralingua:english-intermediate:pronunciation-unit6:v1",
  "Unit 6 Pronunciation - Future Plans and Advice"
].forEach(marker => assert.ok(js.includes(marker), `JS missing marker: ${marker}`));

[
  "I am going to protect Saturday's recording",
  "Olivia is meeting the producer on Tuesday",
  "should put off the photo session",
  "still up in the air",
  "free up Friday afternoon",
  "on the same page"
].forEach(marker => assert.ok(js.includes(marker), `stage phrase missing in JS: ${marker}`));

[
  "going to protect",
  "is meeting",
  "should put off",
  "up in the air",
  "free up Friday",
  "on the same page"
].forEach(marker => assert.ok(html.includes(marker), `visible phrase focus missing: ${marker}`));

[
  "speechSynthesis",
  "SpeechSynthesis",
  "utterance",
  "unit-5-intermediate",
  "Food Quantities",
  "cups of rice",
  "avocado"
].forEach(marker => assert.equal((html + js).includes(marker), false, `forbidden copied/audio marker present: ${marker}`));

const imagePath = "assets/img/english-intermediate/unit-6/unit-6-pronunciation-future-plans-hero.webp";
assert.ok(exists(imagePath), "professional hero image missing");
assert.ok(size(imagePath) > 50000, "hero image is too small to be a professional visual");

const audioFiles = [
  "ingles/intermediate/audio/pronunciation/unit-6-intermediate/section-1.mp3",
  "ingles/intermediate/audio/pronunciation/unit-6-intermediate/section-2.mp3",
  "ingles/intermediate/audio/pronunciation/unit-6-intermediate/section-3.mp3",
  "ingles/intermediate/audio/pronunciation/unit-6-intermediate/section-4.mp3",
  "ingles/intermediate/audio/pronunciation/unit-6-intermediate/future-plans-advice-model-us.mp3"
];

audioFiles.forEach(file => {
  assert.ok(exists(file), `professional MP3 missing: ${file}`);
  assert.ok(size(file) > 50000, `MP3 is unexpectedly small: ${file}`);
  const header = fs.readFileSync(path.join(root, file)).subarray(0, 3).toString("ascii");
  assert.ok(header === "ID3" || fs.readFileSync(path.join(root, file))[0] === 0xff, `MP3 header unexpected: ${file}`);
});

[
  "INTERMEDIATE_UNIT6_PRONUNCIATION_ID",
  "INTERMEDIATE_UNIT6_PRONUNCIATION_EVALUATION",
  "/api/intermediate/unit6-pronunciation/submit",
  "unit6FuturePlansPronunciation",
  '"weight": 0',
  '"followUpOnly": True',
  '"doesNotAffectAverage": True',
  "save_intermediate_pronunciation_audio"
].forEach(marker => assert.ok(server.includes(marker), `server missing marker: ${marker}`));

[
  "unit-6-intermediate/section-1.mp3",
  "unit-6-intermediate/section-2.mp3",
  "unit-6-intermediate/section-3.mp3",
  "unit-6-intermediate/section-4.mp3",
  "unit-6-intermediate/future-plans-advice-model-us.mp3"
].forEach(marker => assert.ok(script.includes(marker), `script missing output file: ${marker}`));
assert.doesNotMatch(script, /\bNarrator\s*:/i, "ElevenLabs pronunciation script must not include narrator labels");
assert.doesNotMatch(script, /\bSpeaker\s*:/i, "ElevenLabs pronunciation script must not include speaker labels");

[
  overview,
  practiceLab,
  explanation
].forEach((content, index) => {
  assert.ok(content.includes("pronunciation-unit-6-future-plans-advice.html"), `navigation target missing in file ${index}`);
  assert.ok(content.includes("Pronunciation: Future Plans and Advice"), `navigation title missing in file ${index}`);
});

assert.ok(practiceLab.includes("44 activities"), "Practice Lab total count should be 44");
assert.ok(practiceLab.includes("Unit 6 - 6 activities"), "Unit 6 quick count should be 6");

console.log("PASS Unit 6 pronunciation static audit");
