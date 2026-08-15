import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const pagesDir = path.join(root, "ingles", "intermediate-2");
const mainCss = fs.readFileSync(path.join(root, "assets", "css", "english-intermediate-2.css"), "utf8");
const labCss = fs.readFileSync(path.join(root, "assets", "css", "english-intermediate2-practice-lab.css"), "utf8");
const coachCss = fs.readFileSync(path.join(root, "assets", "css", "english-intermediate2-conversation-coach.css"), "utf8");
const pronunciationCss = fs.readFileSync(path.join(root, "assets", "css", "english-intermediate2-pronunciation.css"), "utf8");
const pages = fs.readdirSync(pagesDir).filter((file) => file.endsWith(".html"));

assert.equal(pages.length, 16, "The full-width audit must cover every published Intermediate 2 page.");
for (const page of pages) {
  const markup = fs.readFileSync(path.join(pagesDir, page), "utf8");
  assert.match(markup, /english-intermediate-2\.css\?v=20260815-(?:full-width-compact|unit2-roundtable|roundtable-cases)/, `${page} must load the shared layout version.`);
}
assert.match(mainCss, /shared full-width, compact composition/);
assert.match(mainCss, /\.english-intermediate2-page \.ie2-unit-theory-shell/);
assert.match(mainCss, /repeat\(auto-fit, minmax\(min\(100%, 250px\), 1fr\)\)/);
assert.match(labCss, /Shared application-width standard/);
assert.match(coachCss, /Shared application-width standard/);
assert.match(pronunciationCss, /Shared application-width standard for every Intermediate 2 pronunciation page/);

console.log("Intermediate 2 full-width compact-layout contract passed.");
