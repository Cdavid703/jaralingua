#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const pagePath = path.join(root, "ingles", "intermediate", "pair-showcase-unit-6-colombian-food.html");
const practicePath = path.join(root, "ingles", "intermediate", "practice-lab.html");
const jsPath = path.join(root, "assets", "js", "intermediate-unit6-food-showcase.js");
const cssPath = path.join(root, "assets", "css", "intermediate-unit6-food-showcase.css");
const audioRoot = path.join(root, "ingles", "intermediate", "audio", "unit-6-food-showcase");
const imageRoot = path.join(root, "assets", "img", "english-intermediate", "unit-6", "colombian-food-showcase");

const page = fs.readFileSync(pagePath, "utf8");
const practice = fs.readFileSync(practicePath, "utf8");
const js = fs.readFileSync(jsPath, "utf8");
const css = fs.readFileSync(cssPath, "utf8");
const scripts = fs.readFileSync(path.join(audioRoot, "scripts.md"), "utf8");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(page.includes("This is not two separate presentations"), "The joint-presentation rule is missing");
assert(page.includes("Two speakers, two dishes, one shared message"), "The shared mission is missing");
assert(page.includes("3-4 minute presentation in pairs"), "The live pair product is unclear");
assert(!/\bmic(?:rophone)?\b|mediarecorder|getusermedia/i.test(page + js), "This activity must not use a microphone or individual recording");
assert((page.match(/data-audio="audio\/unit-6-food-showcase\/model-/g) || []).length === 12, "The complete model must contain 12 coordinated turns");
assert((page.match(/data-clip="audio\/unit-6-food-showcase\/skill-/g) || []).length === 7, "Seven stage audio models are required");
assert(page.includes('data-speed=".75"') && page.includes('data-speed="1"') && page.includes('data-speed="1.25"'), "Audio speed controls are incomplete");
assert(page.includes("Student A") && page.includes("Student B") && page.includes("Shared comparison") && page.includes("Joint recommendation"), "The pair organizer is incomplete");
assert(practice.includes("pair-showcase-unit-6-colombian-food.html") && practice.includes("Unit 6 - 10 activities"), "Practice Lab integration is incomplete");
assert(css.includes("@media(max-width:980px)") && css.includes("@media(max-width:680px)"), "Tablet and mobile responsive rules are missing");
assert(scripts.includes("never read filenames, speaker labels") && scripts.includes("No narrator"), "Professional ElevenLabs production rules are missing");

[
  "pair-showcase-hero-v1.webp",
  "ajiaco-posta-comparison-v1.webp"
].forEach((file) => {
  const target = path.join(imageRoot, file);
  assert(fs.existsSync(target) && fs.statSync(target).size > 80000, `Missing or undersized professional image: ${file}`);
});

const audioFiles = Array.from(new Set(Array.from(page.matchAll(/audio\/unit-6-food-showcase\/([^"]+\.mp3)/g), (match) => match[1])));
assert(audioFiles.length === 19, `Expected 19 referenced audio files, found ${audioFiles.length}`);
audioFiles.forEach((file) => {
  const target = path.join(audioRoot, file);
  assert(fs.existsSync(target) && fs.statSync(target).size > 50000, `Missing or undersized professional audio: ${file}`);
});

console.log("PASS Unit 6 Colombian Food Cultural Showcase: joint pedagogy, 19 professional audios, two visuals, organizer, checklist, and responsive contracts");
