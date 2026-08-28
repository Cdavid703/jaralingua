import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const pagePath = path.join(root, "ingles", "intermediate-2", "midterm-oral-conversation-coach.html");
const scriptPath = path.join(root, "assets", "js", "english-intermediate2-midterm-oral-coach.js");
const cssPath = path.join(root, "assets", "css", "english-intermediate2-midterm-oral-coach.css");
const audioDir = path.join(root, "ingles", "intermediate-2", "audio", "midterm-oral-conversation-coach");
const page = fs.readFileSync(pagePath, "utf8");
const script = fs.readFileSync(scriptPath, "utf8");
const css = fs.readFileSync(cssPath, "utf8");
const audioScripts = fs.readFileSync(path.join(audioDir, "scripts.md"), "utf8");

for (const expected of [
  "Midterm Oral Practice", "conversation-coach-v2.css", "coach-hero ie2-midterm-hero",
  "coach-outcomes", "coach-shell", "coach-sidebar", "coach-companion-welcome",
  "coach-stage", "coach-recorder", "floatingMicDock", "desktopViewButton",
  "mobileViewButton", "mia-old-friends-hero-v1.png", "mia-conversation-coach-v1.png",
  "coachLevelBar"
]) assert.ok(page.includes(expected), "Missing page element: " + expected);

assert.equal(script.includes("Try:"), false, "Suggested answers must not include a filler label.");
assert.equal(script.includes("…"), false, "Suggested answers must not contain blanks or ellipses.");
assert.equal(page.includes("…"), false, "Visible language must use complete phrases instead of ellipses.");
for (const expected of [
  "const MAX_SECONDS = 45", "function startMeter(micStream)", "Voice detected",
  "function setView(mode", "floatingMicButton", "life partner", "If I were you",
  "question about dating"
]) assert.ok(script.includes(expected), "Missing coach behavior: " + expected);

assert.ok(css.includes(".ie2-midterm-oral-page.ie2-mobile-focus"));
assert.ok(css.includes("@media (max-width: 720px)"));
assert.equal((script.match(/topic: "/g) || []).length, 7, "The mock must have seven connected turns.");
assert.ok(script.includes("so long"), "The coach must begin with a natural reunion.");
assert.ok(script.includes("If you were in Valentina's situation"));

const scriptedFiles = audioScripts.split("\n")
  .filter((line) => line.startsWith("### \`"))
  .map((line) => line.slice(5, line.indexOf("\`", 5)));
assert.equal(scriptedFiles.length, 15, "Every prompt, reaction and close needs a canonical audio script.");
assert.equal(new Set(scriptedFiles).size, scriptedFiles.length, "Audio script names must be unique.");
const generatedFiles = fs.readdirSync(audioDir).filter((name) => name.endsWith(".mp3")).sort();
assert.deepEqual(generatedFiles, [...scriptedFiles].sort(), "Every canonical ElevenLabs script needs exactly one generated MP3.");
for (const file of generatedFiles) {
  assert.ok(fs.statSync(path.join(audioDir, file)).size > 10_000, "Generated MP3 is unexpectedly small: " + file);
}
const referencedFiles = [...script.matchAll(/"([a-z0-9-]+\.mp3)"/g)].map((match) => match[1]);
for (const file of referencedFiles) {
  assert.ok(fs.existsSync(path.join(audioDir, file)), "Missing audio referenced by the coach: " + file);
}

console.log("Intermediate 2 Midterm Oral Conversation Coach contract passed.");