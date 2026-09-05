import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const size = (relative) => fs.statSync(path.join(root, relative)).size;

const page = read("ingles/intermediate-2/reading-unit-3-the-session-that-stayed-open.html");
const listening = read("ingles/intermediate-2/listening-unit-3-the-message-before-the-workshop.html");
const css = read("assets/css/english-intermediate-2.css");
const js = read("assets/js/intermediate2-reading-session-stayed-open.js");
const catalog = JSON.parse(read("assets/data/english-intermediate-2-content.json"));
const lab = read("ingles/intermediate-2/practice-lab.html");
const guide = read("docs/guia-construccion-ingles-intermedio-2.md");
const sitemap = read("sitemap.xml");

assert.match(page, /<title>The Session That Stayed Open/);
assert.match(page, /class="brand"><img[^>]+jaralingua-logo\.png/);
assert.match(page, /google-auth\.js/);
assert.match(page, /page-qr-access\.js/);
assert.doesNotMatch(page, /<details\b[^>]*\bopen\b/i, "all reading supports must start closed");
assert.equal((page.match(/class="ie2-reading-question"/g) || []).length, 8, "eight reading questions required");
assert.equal((page.match(/class="ie2-chapter-number">Section [123] of 3/g) || []).length, 3, "three story sections required");
assert.equal((page.match(/data-reading-prediction=/g) || []).length, 3, "three prediction choices required");
assert.equal((page.match(/<details><summary>/g) || []).length, 11, "course switcher plus six vocabulary and four language supports required");

const storyMatch = page.match(/<article class="ie2-story-card">([\s\S]*?)<\/article>/);
assert.ok(storyMatch, "story card required");
const storyWords = storyMatch[1].replace(/<[^>]+>/g, " ").replace(/&[^;]+;/g, " ").trim().split(/\s+/).filter(Boolean).length;
assert.ok(storyWords >= 400 && storyWords <= 500, `reading must stay brief; found ${storyWords} words`);

const heroPath = "assets/img/english-intermediate-2/unit-3/session-stayed-open-reading/session-stayed-open-reading-hero-v1.png";
const qrPath = "assets/img/page-qr/ingles-intermediate-2-reading-unit-3-the-session-that-stayed-open.svg";
assert.ok(size(heroPath) > 100_000, "professional reading hero required");
assert.ok(size(qrPath) > 1_000, "page QR required");
assert.match(css, /session-stayed-open-reading-hero-v1\.png/);
assert.match(css, /\.ie2-session-reading-page \.ie2-reading-hero/);
assert.match(css, /@media \(max-width: 640px\)/);

assert.match(js, /sessionReadingQuiz/);
assert.match(js, /Answer all 8 questions/);
assert.match(js, /aria-pressed/);
assert.doesNotMatch(js, /fetch\(|\/api\/|submission|grade/i, "reading must remain local and ungraded");

const item = catalog.items.find((entry) => entry.id === "unit-3-the-session-that-stayed-open-reading");
assert.ok(item, "catalog item required");
assert.equal(item.unit, 3);
assert.equal(item.order, 5);
assert.equal(item.type, "reading");
assert.equal(item.questionCount, 8);
assert.equal(item.chapterCount, 3);
assert.equal(item.teacherSubmission, false);
assert.equal(item.affectsAverage, false);
assert.ok(item.cardSummary.length <= 90);
assert.match(page, /listening-unit-3-the-message-before-the-workshop\.html/);
assert.match(listening, /reading-unit-3-the-session-that-stayed-open\.html/);
assert.match(lab, /The Session That Stayed Open · live/);
assert.match(guide, /reading-unit-3-the-session-that-stayed-open\.html/);
assert.match(sitemap, /reading-unit-3-the-session-that-stayed-open\.html/);

console.log(`PASS: Intermediate 2 Unit 3 reading contract (${storyWords} story words)`);
