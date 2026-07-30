import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";

const root = process.cwd();
const unitPage = fs.readFileSync(path.join(root, "ingles", "basico-2", "unit-1-going-out.html"), "utf8");
const bankPage = fs.readFileSync(path.join(root, "ingles", "basico-2", "idioms-phrasal-verbs.html"), "utf8");
const css = fs.readFileSync(path.join(root, "assets", "css", "english-basic-2.css"), "utf8");
const client = fs.readFileSync(path.join(root, "assets", "js", "english-basic2-expression-audio.js"), "utf8");

const expected = [
  ["go out", "go-out.mp3"],
  ["hang out", "hang-out.mp3"],
  ["meet up", "meet-up.mp3"],
  ["come over", "come-over.mp3"],
  ["stay in", "stay-in.mp3"],
  ["call off", "call-off.mp3"],
  ["It's raining cats and dogs.", "its-raining-cats-and-dogs.mp3"],
  ["take a rain check", "take-a-rain-check.mp3"],
  ["come rain or shine", "come-rain-or-shine.mp3"],
  ["under the weather", "under-the-weather.mp3"],
  ["every cloud has a silver lining", "every-cloud-has-a-silver-lining.mp3"],
  ["when it rains, it pours", "when-it-rains-it-pours.mp3"]
];

for (const [label, fileName] of expected) {
  const source = `audio/unit1/expressions/${fileName}`;
  assert.ok(unitPage.includes(`data-expression-audio="${source}"`), `${label} missing on Unit 1 teaching page`);
  assert.ok(bankPage.includes(`data-expression-audio="${source}"`), `${label} missing on expression bank`);
  const audioPath = path.join(root, "ingles", "basico-2", "audio", "unit1", "expressions", fileName);
  assert.ok(fs.existsSync(audioPath), `Missing audio file: ${fileName}`);
  assert.ok(fs.statSync(audioPath).size > 1000, `Audio file is too small: ${fileName}`);
}

assert.ok(unitPage.includes("english-basic2-expression-audio.js"), "Unit 1 page must load expression audio client");
assert.ok(bankPage.includes("english-basic2-expression-audio.js"), "Expression bank must load expression audio client");
assert.match(client, /document\.querySelectorAll\("\[data-expression-audio\]"\)/, "Client must bind clickable expression cards");
assert.match(client, /event\.key === "Enter" \|\| event\.key === " "/, "Client must support keyboard activation");
assert.doesNotMatch(client, /speechSynthesis/i, "Expression audio must use recorded audio files, not browser speech synthesis");
assert.match(css, /\.expression-card\[data-expression-audio\]/, "Clickable expression CSS missing");
assert.match(css, /\.expression-audio-hint/, "Expression audio hint CSS missing");

console.log("Basic English 2 Unit 1 expression audio checks passed.");
