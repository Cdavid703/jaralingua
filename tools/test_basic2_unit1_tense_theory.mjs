import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const theoryPath = path.join(ROOT, "ingles/basico-2/unit-1-going-out.html");
const activityPath = path.join(ROOT, "ingles/basico-2/practice-unit-1-simple-present-vs-present-continuous.html");

const theory = fs.readFileSync(theoryPath, "utf8");
const activity = fs.readFileSync(activityPath, "utf8");

assert.match(theory, /Why do we change the tense\?/, "Unit 1 theory must explain why the tense changes");
assert.match(
  theory,
  /We do not change the tense only to practice grammar\. We change it because the meaning changes\./,
  "Unit 1 theory must explain that the tense change changes meaning"
);
assert.match(theory, /They play soccer on Fridays\. = This is their routine\./, "Theory must include the routine example");
assert.match(theory, /They are playing soccer now\. = The action is happening right now\./, "Theory must include the now example");
assert.match(theory, /Is this a routine, or is it happening now\?/, "Theory must give students the decision question");
assert.doesNotMatch(activity, /Why do we change the tense\?/, "The activity page should not include the new theory block");
assert.doesNotMatch(
  activity,
  /We do not change the tense only to practice grammar/,
  "The activity page should remain focused on the quiz"
);

console.log("PASS basic2 unit1 tense theory");
