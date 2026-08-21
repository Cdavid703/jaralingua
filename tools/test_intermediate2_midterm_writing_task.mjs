import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const page = read("ingles/intermediate-2/intermediate-course-2-midterm-writing-task.html");
const controller = read("assets/js/english-intermediate2-official-midterm.js");
const css = read("assets/css/english-intermediate2-official-midterm.css");
const evaluations = read("ingles/intermediate-2/evaluations.html");
const home = read("ingles/intermediate-2/index.html");
const server = read("server/progress_api.py");

for (const id of ["accessPanel", "adminPanel", "readinessPanel", "examPanel", "submittedPanel", "activateWritingButton", "closeWritingButton", "emailFrom", "emailTo", "emailSubject", "emailBody", "submitButton", "wordCounter", "saveStatus", "timerDisplay"]) {
  assert.match(page, new RegExp(`id="${id}"`), `Missing #${id}.`);
}
assert.match(page, /Catharsis for planning/i);
assert.match(page, /approximately 180 words/i);
assert.match(page, /End your letter on an optimistic note/i);
assert.match(page, /midterm-writing-catharsis-hero-v1\.png/);
assert.match(page, /Official assessment · closed by default/);
assert.doesNotMatch(page, /position:\s*fixed/i);
assert.match(css, /width:min\(1760px,calc\(100% - clamp\(.75rem,3vw,3rem\)\)\)/);
assert.match(css, /@media\(max-width:640px\)/);
assert.match(css, /overflow-x:clip/);
assert.match(css, /\.writing-tools\{display:grid;grid-template-columns:1fr\}/);
assert.match(css, /@media\(max-width:390px\)/);
assert.doesNotMatch(css, /position:fixed/);
assert.match(evaluations, /intermediate-course-2-midterm-writing-task\.html/);
assert.match(evaluations, /Official \/ teacher activation/);
assert.match(home, /Evaluations and Mock Exams[\s\S]{0,260}href="\.\/evaluations\.html">Open Evaluations and Mock Exams/);
assert.doesNotMatch(home, /Intermediate English Grades[\s\S]{0,260}href="\.\/evaluations\.html">Open Evaluations and Mock Exams/);

for (const endpoint of ["state", "start", "draft", "submit", "submissions", "submissions/grade", "student-action"]) {
  assert.match(controller, new RegExp(`/api/intermediate2/midterm-writing/${endpoint.replace("/", "\\/")}`));
}
assert.match(controller, /AbortController/);
assert.match(controller, /clientSubmissionId/);
assert.match(controller, /localStorage/);
assert.match(controller, /submitInFlight/);
assert.match(controller, /preserved locally/);
assert.doesNotMatch(controller, /speechSynthesis/);

assert.match(server, /INTERMEDIATE2_MIDTERM_WRITING_ID = "intermediate2MidtermWritingTask20"/);
assert.match(server, /INTERMEDIATE2_MIDTERM_WRITING_EVALUATION/);
assert.match(server, /def default_intermediate2_midterm_writing_bundle\(\):[\s\S]*?"isOpen": False/);
assert.match(server, /missing_client_submission_id/);
assert.match(server, /intermediate2_midterm_writing_apply_gradebook/);
assert.match(server, /"\/api\/intermediate2\/midterm-writing\/state"/);
assert.match(server, /"\/api\/intermediate2\/midterm-writing\/submit"/);

console.log("Intermediate 2 official midterm writing task static contract passed.");
