const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const pagePath = path.join(root, "ingles", "intermediate", "audiobook-unit-6-little-red-riding-hood.html");
const cssPath = path.join(root, "assets", "css", "intermediate-unit6-audiobook.css");
const jsPath = path.join(root, "assets", "js", "intermediate-unit6-audiobook.js");
const practiceLabPath = path.join(root, "ingles", "intermediate", "practice-lab.html");
const overviewPath = path.join(root, "ingles", "intermediate", "course-overview.html");
const unit6Path = path.join(root, "ingles", "intermediate", "unit-6-future-plans-advice.html");
const scriptsPath = path.join(root, "ingles", "intermediate", "audio", "unit-6-audiobook-little-red-scripts.md");
const audioDir = path.join(root, "ingles", "intermediate", "audio", "unit-6-audiobook-little-red");
const imageDir = path.join(root, "assets", "img", "english-intermediate", "unit-6", "audiobook-little-red-riding-hood");

for (const file of [pagePath, cssPath, jsPath, scriptsPath]) {
  assert.ok(fs.existsSync(file), `Missing ${path.relative(root, file)}`);
}

const page = fs.readFileSync(pagePath, "utf8");
const css = fs.readFileSync(cssPath, "utf8");
const js = fs.readFileSync(jsPath, "utf8");
const scripts = fs.readFileSync(scriptsPath, "utf8");
const practiceLab = fs.readFileSync(practiceLabPath, "utf8");
const overview = fs.readFileSync(overviewPath, "utf8");
const unit6 = fs.readFileSync(unit6Path, "utf8");

assert.ok(page.includes("Little Red Riding Hood: A Future Plans Audiobook"), "Page title/content missing");
assert.ok(page.includes("visible transcript"), "Read-along transcript purpose must be explicit");
assert.ok(page.includes("Practice Lab - Unit 6 Audiobook"), "Page must identify the Unit 6 folder");
assert.ok(page.includes("data-audiobook-speed=\"0.75\""), "0.75x speed button missing");
assert.ok(page.includes("data-audiobook-speed=\"1\""), "1x speed button missing");
assert.ok(page.includes("data-audiobook-speed=\"1.25\""), "1.25x speed button missing");
assert.strictEqual((page.match(/data-audiobook-speed=/g) || []).length, 3, "Only the three approved speed buttons should be present");
assert.strictEqual((page.match(/data-audiobook-audio/g) || []).length, 6, "The page should load one full audio plus five scene audios");
assert.strictEqual((page.match(/class="scene-card"/g) || []).length, 5, "The audiobook should contain five scene cards");
assert.ok(!js.includes("speechSynthesis"), "Audiobook JS must not use browser speech synthesis");
assert.ok(css.includes("@media (max-width: 640px)"), "Mobile responsive CSS missing");
assert.ok(css.includes("@media (max-width: 900px)"), "Tablet responsive CSS missing");

const requiredAudio = [
  "full-story.mp3",
  "scene-1-the-plan.mp3",
  "scene-2-the-forest.mp3",
  "scene-3-the-warning.mp3",
  "scene-4-the-cottage.mp3",
  "scene-5-the-resolution.mp3",
];

for (const file of requiredAudio) {
  const audioPath = path.join(audioDir, file);
  assert.ok(fs.existsSync(audioPath), `Missing audio ${file}`);
  assert.ok(fs.statSync(audioPath).size > 50000, `Audio file is suspiciously small: ${file}`);
  assert.ok(page.includes(`audio/unit-6-audiobook-little-red/${file}`), `Page does not reference ${file}`);
}

const requiredImages = [
  "little-red-the-plan-v1.webp",
  "little-red-the-forest-v1.webp",
  "little-red-the-warning-v1.webp",
  "little-red-the-cottage-v1.webp",
  "little-red-the-resolution-v1.webp",
];

for (const file of requiredImages) {
  const imagePath = path.join(imageDir, file);
  assert.ok(fs.existsSync(imagePath), `Missing image ${file}`);
  assert.ok(fs.statSync(imagePath).size > 50000, `Image file is suspiciously small: ${file}`);
  assert.ok(page.includes(file), `Page does not reference ${file}`);
}

assert.strictEqual((scripts.match(/^## /gm) || []).length, 6, "Scripts markdown should define six audio sections");
assert.ok(scripts.includes("You are going to visit Grandmother today"), "Script should include be going to");
assert.ok(scripts.includes("Tomorrow we are meeting your mother for breakfast"), "Script should include present continuous for arrangement");
assert.ok(scripts.includes("I'll call Mr. Reed"), "Script should include will for a decision");
assert.ok(scripts.includes("You should stay on the main path"), "Script should include advice with should");

for (const source of [practiceLab, overview, unit6]) {
  assert.ok(source.includes("audiobook-unit-6-little-red-riding-hood.html"), "New audiobook link missing from a Unit 6 entry point");
}

assert.ok(practiceLab.includes("47 activities"), "Practice Lab total should be 47 activities");
assert.ok(practiceLab.includes("Unit 6 - 9 activities"), "Practice Lab quick folder count should be 9 for Unit 6");
assert.ok(practiceLab.includes("practice-folder-count\">9 activities"), "Unit 6 folder count should be 9");

console.log("Unit 6 audiobook static checks passed.");
