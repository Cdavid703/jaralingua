const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const htmlPath = path.join(root, "ingles", "intermediate", "unit-6-future-plans-advice.html");
const cssPath = path.join(root, "assets", "css", "intermediate-unit6-explanation.css");
const jsPath = path.join(root, "assets", "js", "intermediate-unit6-explanation.js");
const overviewPath = path.join(root, "ingles", "intermediate", "course-overview.html");

const html = fs.readFileSync(htmlPath, "utf8");
const css = fs.readFileSync(cssPath, "utf8");
const js = fs.readFileSync(jsPath, "utf8");
const overview = fs.readFileSync(overviewPath, "utf8");

const sectionIds = [...html.matchAll(/<details class="unit6-section" id="([^"]+)"([^>]*)>/g)];
assert.equal(sectionIds.length, 11, "Unit 6 must contain eleven explanation topics");
sectionIds.forEach((match) => assert.ok(!/\bopen\b/.test(match[2]), `${match[1]} must be closed by default`));

const topicTargets = [...html.matchAll(/data-open-topic="([^"]+)"/g)].map((match) => match[1]);
assert.deepEqual(topicTargets, sectionIds.map((match) => match[1]), "Every topic needs one matching navigation button");

assert.ok(!/<(?:form|input|select|textarea)\b/i.test(html), "The explanation page must not contain practice or submission controls");
assert.ok(!/speechSynthesis|SpeechSynthesisUtterance/i.test(html + js), "Professional audio must not fall back to browser speech synthesis");
assert.ok(html.match(/Common mistake/g)?.length >= 8, "Detailed teaching must include at least eight common-mistake explanations");
assert.ok(html.match(/class="example-line"/g)?.length >= 25, "Detailed teaching must include a substantial example bank");

const audioSources = [...html.matchAll(/<audio[^>]+src="([^"]+\.mp3)"/g)].map((match) => match[1]);
assert.equal(audioSources.length, 14, "Unit 6 must reference fourteen professional audio models");
audioSources.forEach((source) => {
  const audioPath = path.join(root, "ingles", "intermediate", ...source.split("/"));
  assert.ok(fs.existsSync(audioPath), `Missing audio: ${source}`);
  assert.ok(fs.statSync(audioPath).size > 100000, `Audio is unexpectedly small: ${source}`);
});

const imageSources = [...html.matchAll(/<img[^>]+src="([^"]*english-intermediate\/unit-6\/[^"]+)"/g)].map((match) => match[1]);
assert.ok(new Set(imageSources).size >= 5, "Unit 6 must use at least five distinct professional visuals");
imageSources.forEach((source) => {
  const imagePath = path.join(root, ...source.replace(/^\.\.\/\.\.\//, "").split("/"));
  assert.ok(fs.existsSync(imagePath), `Missing visual: ${source}`);
  assert.ok(fs.statSync(imagePath).size > 100000, `Visual is unexpectedly small: ${source}`);
});

assert.match(js, /\[0\.75, 1, 1\.25\]/, "Audio speed options must be exactly 0.75x, 1x, and 1.25x");
assert.match(css, /@media \(max-width: 680px\)/, "Mobile layout rules are required");
assert.match(css, /prefers-reduced-motion/, "Reduced-motion support is required");
assert.match(css, /\.unit6-explanation-page \.site-header\s*\{[^}]*position:\s*relative/s, "The Unit 6 header must not overlap the hero");
assert.match(css, /\.unit6-hero \.lesson-hero-content\s*\{[^}]*text-align:\s*center/s, "Hero text must be centered as one stable block");
assert.match(html, /<div class="unit6-hero-media">\s*<img/s, "The hero image must be a separate banner, not a text background");
assert.match(css, /\.unit6-hero-media\s*\{[^}]*aspect-ratio:\s*16 \/ 7/s, "The desktop banner needs a stable aspect ratio");
assert.doesNotMatch(css, /\.unit6-hero::before/, "The hero must not place an overlay between the banner and the text");
assert.match(overview, /id="unit-6"/, "Course Overview must contain Unit 6");
assert.match(overview, /unit-6-future-plans-advice\.html/, "Course Overview must link to the explanation page");

console.log(`Unit 6 explanation checks passed: ${sectionIds.length} topics, ${audioSources.length} audios, ${new Set(imageSources).size} visuals.`);
