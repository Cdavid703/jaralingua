import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const pagePath = path.join(root, "ingles", "intermediate-2", "unit-2-wishes-dilemmas-advice.html");
const stylesPath = path.join(root, "assets", "css", "english-intermediate-2.css");
const page = fs.readFileSync(pagePath, "utf8");
const styles = fs.readFileSync(stylesPath, "utf8");

assert.match(page, /ie2-unit2-theory-page/);
assert.match(page, /ie2-unit2-idea-deck/);
assert.match(page, /data-course-search-panel/);
assert.match(page, /ElevenLabs meaning model/);
assert.match(page, /20260815-full-width-compact/);
assert.match(styles, /Unit 2 theory: full-width application layout with compact learning groups/);
assert.match(styles, /\.ie2-unit2-theory-page \.ie2-unit-theory-shell,/);
assert.match(styles, /width: 100%; max-width: none; box-sizing: border-box/);
assert.match(styles, /\.ie2-unit2-idea-deck \{ display: grid/);
assert.match(styles, /@media \(max-width: 980px\) \{ \.ie2-unit2-idea-deck \{ grid-template-columns: 1fr/);

for (const match of page.matchAll(/(?:href|src)="([^"]+)"/g)) {
  const reference = match[1];
  if (/^(?:https?:|#)/.test(reference)) continue;
  const cleanReference = reference.split(/[?#]/)[0];
  if (!cleanReference) continue;
  const target = cleanReference.startsWith("/")
    ? path.join(root, cleanReference.slice(1))
    : path.resolve(path.dirname(pagePath), cleanReference);
  assert.ok(fs.existsSync(target), `Broken local page reference: ${reference}`);
}

console.log("Intermediate 2 Unit 2 theory page contract passed.");
