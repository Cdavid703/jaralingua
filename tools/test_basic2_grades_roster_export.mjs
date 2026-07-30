import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const basic2Grades = fs.readFileSync(path.join(ROOT, "ingles/basico-2/notas.html"), "utf8");
const basic1Grades = fs.readFileSync(path.join(ROOT, "ingles/basico/notas.html"), "utf8");
const gradesEngine = fs.readFileSync(path.join(ROOT, "assets/js/basic-english-grades.js"), "utf8");
const googleAuth = fs.readFileSync(path.join(ROOT, "assets/js/google-auth.js"), "utf8");
const server = fs.readFileSync(path.join(ROOT, "server/progress_api.py"), "utf8");

assert.match(basic2Grades, /apiPath:\s*"\/api\/basic2\/grades"/, "Basic English Course 2 must use its own gradebook API");
assert.match(basic2Grades, /showRosterExport:\s*true/, "Basic English Course 2 must enable the roster export tab");
assert.match(basic2Grades, /disableAdminEditing:\s*false/, "Basic English Course 2 must expose admin student editing tools");
assert.match(basic2Grades, /showStudentProfile:\s*true/, "Basic English Course 2 must enable the student profile tab");
assert.match(basic2Grades, /studentProfileApiPath:\s*"\/api\/basic2\/student-profile"/, "Basic English Course 2 must save student profiles to its own endpoint");
assert.match(
  basic2Grades,
  /rosterExcelFileName:\s*"basic-english-course-2-student-roster\.xls"/,
  "Basic English Course 2 must define the requested roster Excel filename"
);
assert.doesNotMatch(basic1Grades, /showRosterExport:\s*true/, "Basic English Course 1 should not inherit the Course 2 roster export tab");
assert.match(gradesEngine, /function staffRosterExportMarkup/, "The gradebook engine must render the roster export tab");
assert.match(gradesEngine, /data-export-roster-excel/, "The gradebook engine must expose a roster export button");
assert.match(gradesEngine, /Download current student Excel/, "The roster tab must present the current-list download button");
assert.match(gradesEngine, /Remove this student from this course/, "The student editor must expose a clear remove-student option");
assert.doesNotMatch(gradesEngine, /Preview shows the first records only/, "The roster tab should not render a student preview");
assert.doesNotMatch(gradesEngine, /payload\.students\.slice\(0,\s*6\)/, "The roster tab should not use a preview subset");
assert.match(gradesEngine, /function exportRosterExcel/, "The gradebook engine must generate the roster Excel file");
assert.match(gradesEngine, /function studentProfileMarkup/, "The gradebook engine must render the student profile form");
assert.match(gradesEngine, /data-student-profile-field="email"/, "The student profile form must include email");
assert.match(gradesEngine, /data-student-profile-field="documentId"/, "The student profile form must include ID/cédula");
assert.match(gradesEngine, /data-student-profile-field="age"/, "The student profile form must include age");
assert.match(gradesEngine, /data-student-profile-field="phone"/, "The student profile form must include phone");
assert.match(gradesEngine, /data-student-profile-field="backupPhone"/, "The student profile form must include backup phone");
assert.match(
  gradesEngine,
  /<th>ID \/ Document<\/th><th>Student<\/th><th>Primary email<\/th><th>Alternate emails<\/th><th>Contact<\/th><th>Level<\/th>/,
  "The roster Excel must include the full student identity columns"
);
assert.match(googleAuth, /\/api\/basic2\/grades\/login/, "Basic English Course 2 local login must use its own gradebook login endpoint");
assert.match(server, /BASIC2_ENGLISH_GRADES_PATH/, "The backend must define a separate Basic English Course 2 gradebook file");
assert.match(server, /path == "\/api\/basic2\/grades\/login"/, "The backend must route Basic English Course 2 local login separately");
assert.match(server, /parsed\.path == "\/api\/basic2\/grades"/, "The backend must serve Basic English Course 2 grades separately");
assert.match(server, /parsed\.path == "\/api\/basic2\/student-profile"/, "The backend must save Basic English Course 2 student profile data separately");
assert.match(server, /studentProfile/, "The backend must persist the student profile payload");

console.log("PASS basic2 grades roster export");
