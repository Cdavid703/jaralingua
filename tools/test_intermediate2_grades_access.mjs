import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const home = read("ingles/intermediate-2/index.html");
const gradesPage = read("ingles/intermediate-2/notas.html");
const gradesJs = read("assets/js/intermediate-english-grades.js");
const server = read("server/progress_api.py");
const catalog = JSON.parse(read("assets/data/english-intermediate-2-content.json"));

assert(home.includes('href="./notas.html">Open Grades</a>'), "Intermediate 2 home must link to Grades");
assert(!home.includes('type="button" disabled>Next phase</button>'), "Grades card must not remain disabled");
assert(gradesPage.includes('window.JARALINGUA_INTERMEDIATE_GRADES_API_PATH = "/api/intermediate2/grades"'), "Grades page must use the isolated Course 2 endpoint");
assert(gradesPage.includes('/ingles/intermediate-2/notas.html'), "Microsoft redirect must return to Course 2 Grades");
assert(gradesPage.includes("Intermediate English Course 2 grades"), "Grades page must identify Course 2");
assert(gradesJs.includes('window.JARALINGUA_INTERMEDIATE_GRADES_API_PATH || "/api/intermediate/grades"'), "Shared gradebook client must accept a safe endpoint override");
assert(gradesJs.includes("Number(evaluation && evaluation.weight) > 0"), "Gradebook must show only weighted official evaluations");
assert(server.includes('if parsed.path == "/api/intermediate2/grades"'), "Course 2 Grades endpoint must exist");
assert(server.includes("ensure_evaluation_template(grades_data, INTERMEDIATE2_MIDTERM_WRITING_EVALUATION)"), "Course 2 Grades must initialize the current official evaluation");

for (const id of ["unit-2-the-call-before-midnight", "unit-2-the-six-week-window-reading"]) {
  const item = catalog.items.find((entry) => entry.id === id);
  assert(item, `${id} must exist in the catalog`);
  assert(item.teacherSubmission === true, `${id} must be deliverable to the teacher`);
  assert(item.gradebookProjected === false, `${id} must stay outside Grades`);
  assert(item.gradebookWeight === null, `${id} must not carry a 0% grade`);
  assert(item.affectsAverage === false, `${id} must not affect the average`);
}

console.log("Intermediate English 2 Grades access and formative delivery checks passed.");