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
assert.doesNotMatch(html, /unit6-hero-media/, "The Unit 6 hero must follow the established background-image pattern");
assert.match(css, /\.unit6-hero\s*\{[^}]*linear-gradient\(135deg[^}]*unit-6-future-plans-advice-hero\.webp/s, "The hero must combine its professional image with a readable background overlay");
assert.match(css, /\.unit6-hero\s*\{[^}]*width:\s*100%;[^}]*max-width:\s*100%;[^}]*margin:\s*0;/s, "The desktop hero background must span the full viewport width");
assert.match(css, /\.unit6-hero \.lesson-hero-content\s*\{[^}]*max-width:\s*780px/s, "The hero panel must match the established Unit 5 width");
assert.match(css, /\.unit6-page\s*\{[^}]*width:\s*100%;[^}]*max-width:\s*100%;/s, "The explanation body must use full-width bands below the hero");
assert.match(css, /\.unit6-section summary\s*\{[^}]*width:\s*min\(1360px,\s*calc\(100% - 48px\)\)/s, "Topic headers must stay centered inside the full-width bands");
assert.match(css, /\.section-body\s*\{[^}]*width:\s*min\(1360px,\s*calc\(100% - 48px\)\)/s, "Topic content must stay readable inside the full-width bands");
assert.match(html, /intermediate-unit6-explanation\.css\?v=20260722f/, "The page must request the latest Unit 6 CSS revision");
assert.doesNotMatch(css, /\.unit6-explanation-page \.site-header\s*\{/, "Unit 6 must use the shared course header positioning");
assert.match(css, /@media \(max-width: 680px\)[\s\S]*\.unit6-hero\s*\{[^}]*padding:\s*36px 12px 40px/s, "The mobile hero must preserve the Unit 5 responsive spacing");
assert.match(overview, /id="unit-6"/, "Course Overview must contain Unit 6");
assert.match(overview, /unit-6-future-plans-advice\.html/, "Course Overview must link to the explanation page");

console.log(`Unit 6 explanation checks passed: ${sectionIds.length} topics, ${audioSources.length} audios, ${new Set(imageSources).size} visuals.`);
