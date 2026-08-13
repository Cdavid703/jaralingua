import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";

const root = process.cwd();
const unitPage = fs.readFileSync(path.join(root, "ingles", "basico-2", "unit-2-shopping-experiences.html"), "utf8");
const bankPage = fs.readFileSync(path.join(root, "ingles", "basico-2", "idioms-phrasal-verbs.html"), "utf8");
const client = fs.readFileSync(path.join(root, "assets", "js", "english-basic2-expression-audio.js"), "utf8");

const expected = [
  ["try on", "try-on.mp3"],
  ["put on", "put-on.mp3"],
  ["take off", "take-off.mp3"],
  ["pick out", "pick-out.mp3"],
  ["look for", "look-for.mp3"],
  ["pay for", "pay-for.mp3"],
  ["check out", "check-out.mp3"],
  ["sell out", "sell-out.mp3"],
  ["go with", "go-with.mp3"],
  ["dress up", "dress-up.mp3"],
  ["window shopping", "window-shopping.mp3"],
  ["on sale", "on-sale.mp3"],
  ["a good deal", "a-good-deal.mp3"],
  ["in style", "in-style.mp3"],
  ["out of style", "out-of-style.mp3"],
  ["It fits well.", "it-fits-well.mp3"],
  ["I'll take it.", "ill-take-it.mp3"],
  ["shop till you drop", "shop-till-you-drop.mp3"],
  ["cost an arm and a leg", "cost-an-arm-and-a-leg.mp3"],
  ["break the bank", "break-the-bank.mp3"],
  ["fit like a glove", "fit-like-a-glove.mp3"],
  ["dress to impress", "dress-to-impress.mp3"],
  ["worth every penny", "worth-every-penny.mp3"],
  ["for a steal", "for-a-steal.mp3"]
];

for (const [label, fileName] of expected) {
  const source = `audio/unit2/expressions/${fileName}`;
  assert.ok(unitPage.includes(`data-expression-audio="${source}"`), `${label} missing on Unit 2 teaching page`);
  assert.ok(bankPage.includes(`data-expression-audio="${source}"`), `${label} missing on expression bank`);
  const audioPath = path.join(root, "ingles", "basico-2", "audio", "unit2", "expressions", fileName);
  assert.ok(fs.existsSync(audioPath), `Missing audio file: ${fileName}`);
  assert.ok(fs.statSync(audioPath).size > 1000, `Audio file is too small: ${fileName}`);
}

assert.ok(unitPage.includes("english-basic2-expression-audio.js"), "Unit 2 page must load expression audio client");
assert.ok(bankPage.includes("#unit-2-expressions"), "Expression bank quick links must include Unit 2");
assert.match(client, /document\.querySelectorAll\("\[data-expression-audio\]"\)/, "Client must bind clickable expression cards");
assert.doesNotMatch(client, /speechSynthesis/i, "Expression audio must use recorded audio files, not browser speech synthesis");

console.log("Basic English 2 Unit 2 expression audio checks passed.");
