import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";

const root = process.cwd();
const client = fs.readFileSync(path.join(root, "assets", "js", "basic-english-grades.js"), "utf8");
const basic1Page = fs.readFileSync(path.join(root, "ingles", "basico", "notas.html"), "utf8");
const basic2Page = fs.readFileSync(path.join(root, "ingles", "basico-2", "notas.html"), "utf8");
const server = fs.readFileSync(path.join(root, "server", "progress_api.py"), "utf8");

assert.match(client, /function weightedEvaluations\(evaluations\)/, "Weighted evaluation splitter is missing");
assert.match(client, /function deliverableEvaluations\(evaluations\)/, "Deliverable evaluation splitter is missing");
assert.match(client, /function studentDeliverablesMarkup\(student, payload\)/, "Student deliverables tab renderer is missing");
assert.match(client, /function staffDeliverablesMarkup\(payload\)/, "Staff deliverables grid renderer is missing");
assert.match(client, /tabs\.button\("deliverables", "Deliverables"/, "Staff Deliverables tab is missing");
assert.match(client, /tabs\.button\("student-deliverables", "Deliverables"/, "Student Deliverables tab is missing");
assert.match(client, /staffStudentRows\(weightedPayload\)/, "Official staff gradebook must render weighted evaluations only");
assert.match(client, /staffReportsMarkup\(weightedPayload\)/, "Reports tab must use weighted evaluations only");
assert.match(client, /wireExport\(root, payloadWithEvaluations\(payload, weightedEvaluations\(payload\.evaluations\)\)\)/, "Excel export must use weighted evaluations only");
assert.doesNotMatch(client, /studentGradesRows\(student, deliverables\)\.replace/, "Deliverable rows must not remove the 0% column with string replacement");

assert.match(basic1Page, /basic-english-grades\.js\?v=[^"]+/, "Basic 1 grades page must bust the shared gradebook JS cache");
assert.match(basic2Page, /basic-english-grades\.js\?v=(?:20260730-deliverables-tabs|20260820-basic2-final-status-email-toggle)/, "Basic 2 grades page must bust the shared gradebook JS cache");
assert.match(basic2Page, /emptyGradeGrid:\s*false/, "Basic 2 must not wipe non-percentage deliverables on the client");

const basicEnsure = server.match(/def ensure_basic_gradebook_structure\(grades_data\):(?<body>[\s\S]*?)\n\n\ndef ensure_basic2_gradebook_structure/);
assert.ok(basicEnsure, "Could not locate Basic 1 gradebook ensure function");
assert.doesNotMatch(basicEnsure.groups.body, /BASIC2_UNIT/, "Basic 1 gradebook must not install Basic 2 deliverables");
const basic2Ensure = server.match(/def ensure_basic2_gradebook_structure\(grades_data\):(?<body>[\s\S]*?)\n\n\ndef score_intermediate/);
assert.ok(basic2Ensure, "Could not locate Basic 2 gradebook ensure function");
assert.match(basic2Ensure.groups.body, /BASIC2_UNIT1_PRONUNCIATION_EVALUATION/, "Basic 2 Unit 1 deliverable template is missing");
assert.match(basic2Ensure.groups.body, /BASIC2_UNIT2_PRONUNCIATION_EVALUATION/, "Basic 2 Unit 2 deliverable template is missing");

console.log("PASS Basic English gradebook deliverable tabs");
