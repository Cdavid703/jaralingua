import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const size = (relative) => fs.statSync(path.join(root, relative)).size;

const pagePath = "ingles/intermediate-2/listening-unit-3-the-message-before-the-workshop.html";
const page = read(pagePath);
const css = read("assets/css/english-intermediate-2.css");
const js = read("assets/js/intermediate2-listening-message-before-workshop.js");
const catalog = JSON.parse(read("assets/data/english-intermediate-2-content.json"));
const metadata = JSON.parse(read("ingles/intermediate-2/audio/unit-3/the-message-before-the-workshop.elevenlabs.json"));
const script = read("ingles/intermediate-2/audio/unit-3/listening-scripts.md");
const lab = read("ingles/intermediate-2/practice-lab.html");
const library = read("ingles/intermediate-2/listening-library.html");
const libraryJs = read("assets/js/english-intermediate2-listening-library.js");
const sitemap = read("sitemap.xml");

assert.match(page, /<title>The Message Before the Workshop/);
assert.match(page, /class="brand"><img[^>]+jaralingua-logo\.png/);
assert.match(page, /google-auth\.js/);
assert.match(page, /page-qr-access\.js/);
assert.doesNotMatch(page, /<details\b[^>]*\bopen\b/i, "all disclosures must start closed");
assert.equal((page.match(/class="ie2-reading-question"/g) || []).length, 10, "ten listening questions required");
assert.equal((page.match(/data-listen-pass=/g) || []).length, 3, "three listening passes required");
assert.equal((page.match(/data-audio-speed=/g) || []).length, 3, "three playback speeds required");
assert.match(page, /Open the complete transcript/);
assert.match(page, /Nothing is recorded, submitted or added to Grades/);
assert.match(page, /aria-disabled="true"/);
assert.doesNotMatch(page, /href="[^"]*reading-unit-3/i, "future reading must not create a broken link");

const audioPath = "ingles/intermediate-2/audio/unit-3/the-message-before-the-workshop.mp3";
const heroPath = "assets/img/english-intermediate-2/unit-3/message-before-workshop-listening/message-before-workshop-listening-hero-v1.png";
const qrPath = "assets/img/page-qr/ingles-intermediate-2-listening-unit-3-the-message-before-the-workshop.svg";
assert.ok(size(audioPath) > 1_000_000, "generated MP3 must be present");
assert.ok(size(heroPath) > 100_000, "professional hero image must be present");
assert.ok(size(qrPath) > 1_000, "page QR must be present");
assert.match(page, /audio\/unit-3\/the-message-before-the-workshop\.mp3/);
assert.match(css, /message-before-workshop-listening-hero-v1\.png/);
assert.match(css, /\.ie2-message-listening-page \.ie2-listening-hero/);
assert.match(css, /@media \(max-width: 640px\)/);

assert.equal((script.match(/^(Camila|Daniel):/gm) || []).length, 14, "script and audio generator require 14 dialogue turns");
assert.equal(metadata.model, "eleven_v3");
assert.equal(metadata.generationMode, "dialogue");
assert.equal(metadata.voices.length, 2);
assert.equal(metadata.fileBytes, size(audioPath));
assert.equal(metadata.durationSeconds, 92.53);

assert.match(js, /audio\.playbackRate/);
assert.match(js, /workshopListeningQuiz/);
assert.match(js, /timerSeconds = 45/);
assert.doesNotMatch(js, /\/api\/|fetch\(|grade|submission/i, "activity must remain local and ungraded");

const item = catalog.items.find((entry) => entry.id === "unit-3-the-message-before-the-workshop-listening");
assert.ok(item, "catalog item required");
assert.equal(item.unit, 3);
assert.equal(item.order, 4);
assert.equal(item.type, "listening");
assert.equal(item.status, "published");
assert.equal(item.teacherSubmission, false);
assert.equal(item.affectsAverage, false);
assert.ok(item.cardSummary.length <= 90, "Practice Lab summary must stay brief");
assert.match(lab, /The Message Before the Workshop · live/);
assert.match(library, /id="unit-3-listenings"/);
assert.match(libraryJs, /number: 3/);
assert.match(libraryJs, /item\.cardSummary/);
assert.doesNotMatch(libraryJs, /item\.product \|\| "Complete the listening"/);
assert.doesNotMatch(libraryJs, /ie2-lab-card-(?:subtitle|meta|number)/);
assert.match(sitemap, /listening-unit-3-the-message-before-the-workshop\.html/);

console.log("PASS: Intermediate 2 Unit 3 listening contract");
