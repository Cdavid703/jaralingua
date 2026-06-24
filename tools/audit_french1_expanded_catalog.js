const fs = require("fs");
const vm = require("vm");
const path = require("path");

const file = path.resolve(__dirname, "../frances/Niveau 1/assets/expanded-catalog.js");
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(file, "utf8"), sandbox, { filename: file });

const activities = sandbox.window.french1ExpandedActivities;
const ids = [
  "premiere-rencontre",
  "ecoute-verbes-er",
  "ecoute-verbes-essentiels",
  "ecoute-ma-famille",
  "ecoute-portrait",
  "lecture-premiers-contacts",
  "lecture-present-classe",
  "lecture-verbes-er",
  "lecture-verbes-essentiels",
  "lecture-famille",
  "lecture-description",
  "conjugaison-er",
  "present-indicatif",
  "negation-present",
  "questions-present",
  "production-routine-present"
];

let failed = false;
for (const id of ids) {
  const activity = activities[id];
  const letters = activity.questions.map((question) => "ABC"[question.answer]).join("");
  const counts = [0, 1, 2].map((answer) => activity.questions.filter((question) => question.answer === answer).length);
  const words = activity.reading ? activity.reading.trim().split(/\s+/).length : null;
  const expected =
    ["conjugaison-er", "present-indicatif"].includes(id) ? 20 :
    ["negation-present", "questions-present"].includes(id) ? 12 :
    id === "production-routine-present" ? 10 :
    id.startsWith("lecture-") ? 6 : 8;
  if (activity.questions.length !== expected || Math.max(...counts) - Math.min(...counts) > 2 || (words !== null && words > 100)) failed = true;
  console.log(`${id}: ${activity.questions.length} questions | réponses ${letters}${words === null ? "" : ` | ${words} mots`}`);
}

if (failed) {
  console.error("FAIL: catalogue pédagogique non conforme");
  process.exit(1);
}
console.log("OK: quantités, longueurs et répartition des réponses conformes");
