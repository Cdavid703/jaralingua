import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const pagePath = path.join(root, "ingles", "intermediate-2", "midterm-oral-conversation-coach.html");
const scriptPath = path.join(root, "assets", "js", "english-intermediate2-midterm-oral-coach.js");
const cssPath = path.join(root, "assets", "css", "english-intermediate2-midterm-oral-coach.css");
const audioDir = path.join(root, "ingles", "intermediate-2", "audio", "midterm-oral-conversation-coach");
const page = fs.readFileSync(pagePath, "utf8");
const script = fs.readFileSync(scriptPath, "utf8");
const css = fs.readFileSync(cssPath, "utf8");
const scripts = fs.readFileSync(path.join(audioDir, "scripts.md"), "utf8");

assert.match(page, /Midterm Oral Task/);
assert.match(page, /A real catch-up, not an interview/);
assert.match(page, /id="recordButton"/);
assert.match(page, /id="answerSuggestion"/);
assert.match(page, /Nothing is graded, submitted, or stored/);
assert.equal(page.includes("course-search"), false, "The mobile coach must not include the long search panel.");
assert.equal(page.includes("language-bank"), false, "The mobile coach must not include a separate language bank.");
assert.match(script, /const MAX_SECONDS = 45/);
assert.match(script, /If I were you, I would/);
assert.match(script, /life partner/);
assert.match(script, /dating or relationships/);
assert.match(css, /\.ie2moc-action-dock\s*\{[\s\S]*position:\s*sticky/);
assert.match(css, /safe-area-inset-bottom/);
assert.match(css, /@media \(max-width: 760px\)/);
assert.match(css, /@media \(max-width: 420px\)/);

const turnMatch = script.match(/const turns = (\[[\s\S]*?\n  \]);/);
assert.ok(turnMatch, "The coach must define its conversation turns.");
const turns = vm.runInNewContext(`(${turnMatch[1]})`);
assert.equal(turns.length, 7, "The mock must have seven connected turns.");
assert.match(turns[0].prompt, /so long/i, "The coach must start with a natural reunion.");
assert.match(turns[2].prompt, /life partner/i);
assert.match(turns[3].prompt, /If you were/i);
assert.match(turns[5].hint, /If I were you/i);
assert.match(turns[6].prompt, /question about dating/i);

const scriptedFiles = [...scripts.matchAll(/^###\s+`([^`]+\.mp3)`\s*$/gm)].map((match) => match[1]);
assert.equal(scriptedFiles.length, 15, "Every prompt, reaction and close needs a canonical audio script.");
assert.equal(new Set(scriptedFiles).size, scriptedFiles.length, "Audio script names must be unique.");
const generatedFiles = fs.readdirSync(audioDir).filter((name) => name.endsWith(".mp3")).sort();
assert.deepEqual(generatedFiles, [...scriptedFiles].sort(), "Every canonical ElevenLabs script needs exactly one generated MP3.");
for (const file of generatedFiles) {
  const target = path.join(audioDir, file);
  assert.ok(fs.statSync(target).size > 10_000, `Generated MP3 is unexpectedly small: ${file}`);
}
for (const file of [...script.matchAll(/"([a-z0-9-]+\.mp3)"/g)].map((match) => match[1])) {
  assert.ok(fs.existsSync(path.join(audioDir, file)), `Missing audio referenced by the coach: ${file}`);
}

console.log("Intermediate 2 Midterm Oral Conversation Coach contract passed.");
