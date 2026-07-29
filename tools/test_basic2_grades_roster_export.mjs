import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const basic2Grades = fs.readFileSync(path.join(ROOT, "ingles/basico-2/notas.html"), "utf8");
const basic1Grades = fs.readFileSync(path.join(ROOT, "ingles/basico/notas.html"), "utf8");
const gradesEngine = fs.readFileSync(path.join(ROOT, "assets/js/basic-english-grades.js"), "utf8");

assert.match(basic2Grades, /showRosterExport:\s*true/, "Basic English Course 2 must enable the roster export tab");
assert.match(
  basic2Grades,
  /rosterExcelFileName:\s*"basic-english-course-2-student-roster\.xls"/,
  "Basic English Course 2 must define the requested roster Excel filename"
);
assert.doesNotMatch(basic1Grades, /showRosterExport:\s*true/, "Basic English Course 1 should not inherit the Course 2 roster export tab");
assert.match(gradesEngine, /function staffRosterExportMarkup/, "The gradebook engine must render the roster export tab");
assert.match(gradesEngine, /data-export-roster-excel/, "The gradebook engine must expose a roster export button");
assert.match(gradesEngine, /function exportRosterExcel/, "The gradebook engine must generate the roster Excel file");
assert.match(
  gradesEngine,
  /<th>ID \/ Document<\/th><th>Student<\/th><th>Primary email<\/th><th>Alternate emails<\/th><th>Contact<\/th><th>Level<\/th>/,
  "The roster Excel must include the full student identity columns"
);

console.log("PASS basic2 grades roster export");
