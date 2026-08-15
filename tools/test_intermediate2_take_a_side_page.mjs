import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const htmlPath = "ingles/intermediate-2/speaking-unit-2-take-a-side.html";
const cssPath = "assets/css/english-intermediate2-visual-dilemma-debate.css";
const jsPath = "assets/js/english-intermediate2-visual-dilemma-debate.js";
const dataPath = "assets/data/english-intermediate-2-content.json";
const planPath = "docs/english-intermediate-2-master-plan.md";
const practiceLabPath = "ingles/intermediate-2/practice-lab.html";

for (const relativePath of [htmlPath, cssPath, jsPath, dataPath, planPath, practiceLabPath]) {
  assert(fs.existsSync(path.join(root, relativePath)), `Missing required file: ${relativePath}`);
}

const html = read(htmlPath);
const css = read(cssPath);
const js = read(jsPath);
const plan = read(planPath);
const practiceLab = read(practiceLabPath);
const catalog = JSON.parse(read(dataPath));
const entry = catalog.items.find((activity) => activity.id === "unit-2-take-a-side-visual-dilemmas");

assert(entry, "Take a Side is missing from the activity catalog");
assert(entry.unit === 2 && entry.order === 6, "Take a Side must be Unit 2 activity 06");
assert(entry.type === "speaking-group" && entry.skillLabel === "Visual debate", "Catalog type or label is incorrect");
assert(entry.status === "published", "Take a Side must be published");
assert(entry.dilemmaCount === 5 && entry.preparationSeconds === 300, "Catalog must declare five dilemmas and 300 preparation seconds");
assert(entry.workshopHref === "/ingles/intermediate-2/speaking-unit-2-take-a-side.html", "Catalog href is incorrect");
assert(entry.image.endsWith("/take-a-side-hero-v1.webp"), "Catalog must use the unique activity hero");
assert(entry.teacherSubmission === false && entry.gradebookProjected === false && entry.affectsAverage === false, "The activity must remain non-evaluative");

const imageDirectory = path.join(root, "assets/img/english-intermediate-2/unit-2/visual-dilemma-debate");
const expectedImages = [
  "take-a-side-hero-v1.webp",
  "01-scholarship-or-stay-v1.webp",
  "02-bakery-or-stability-v1.webp",
  "03-report-or-protect-v1.webp",
  "04-promotion-or-family-v1.webp",
  "05-tour-or-degree-v1.webp"
];
for (const imageName of expectedImages) {
  const imagePath = path.join(imageDirectory, imageName);
  assert(fs.existsSync(imagePath), `Missing visual asset: ${imageName}`);
  assert(fs.statSync(imagePath).size > 50_000, `Visual asset is unexpectedly small: ${imageName}`);
}

assert(html.includes('id="dilemmaSearch"') && html.includes('id="dilemmaSearchClear"'), "Search controls are missing");
assert(html.includes("vd-goal-strip") && html.includes("Objective") && html.includes("Language target") && html.includes("Spoken product"), "Goal strip is incomplete");
for (const phase of ["Pre-task", "Task", "Post-task"]) assert(html.includes(phase), `Missing phase: ${phase}`);
assert(html.includes("Complete interaction model") && html.includes("Student · For") && html.includes("Student · Against"), "Teacher/student model is incomplete");
assert(html.includes('id="timerDisplay"') && html.includes("05:00"), "The visible five-minute timer is missing");
assert(html.includes("No reason or consequence is required."), "The one-advice-only instruction is missing");
assert((html.match(/data-round-check/g) || []).length === 3, "Post-task checklist must contain three checks");
assert(html.includes('./practice-lab.html#unit-2-folder'), "Return navigation to Unit 2 Practice Lab is missing");
assert(/take-a-side-hero-v1\.webp[^>]+width="1672"[^>]+height="941"/.test(html), "Hero needs its exclusive image and intrinsic dimensions");
assert(/id="dilemmaImage"[^>]+width="1672"[^>]+height="941"/.test(html), "Dynamic dilemma image needs intrinsic dimensions");

assert(js.includes("const PREPARATION_SECONDS = 300"), "JavaScript timer must use 300 seconds");
assert((js.match(/title: "/g) || []).length === 5, "JavaScript must contain exactly five dilemmas");
for (const title of ["The Scholarship Decision", "The Bakery Dream", "A Friend Who Cheated", "The Promotion and the Move", "The Tour or the Degree"]) {
  assert(js.includes(title), `Missing dilemma: ${title}`);
}
assert(js.includes('loading="lazy"') && js.includes("dilemma.image"), "Dilemma selector must render image thumbnails");
assert(js.includes('elements.search.addEventListener("input", applySearch)'), "Dilemma search is not connected");
assert(js.includes("createOscillator") && js.includes("AudioContext"), "Audible Web Audio alarm is missing");
assert(!js.includes("speechSynthesis"), "The activity must not use browser speech synthesis");
assert(js.includes("elements.roundChecks.forEach"), "Checklist must reset for each dilemma");

assert(css.includes("width:100%;max-width:none"), "Full-width activity contract is missing");
assert(css.includes("safe-area-inset-left") && css.includes("safe-area-inset-right"), "Safe-area gutters are missing");
assert(!/100vw/.test(css), "CSS must not use 100vw");
assert(css.includes("grid-template-columns:96px minmax(0,1fr)") && css.includes("width:96px;height:72px"), "Mobile selector thumbnails must stay compact");
assert(css.includes("4.5rem"), "Course 2 H1 size cap is missing");

assert(practiceLab.includes('id="unit-2-folder"') && practiceLab.includes('id="unit2ActivityGrid"'), "Practice Lab Unit 2 catalog target is missing");
assert(plan.includes("## 53. Implementación confirmada — Unit 2 Visual Debate: Take a Side"), "Master plan documentation is missing");

console.log("Take a Side static contract OK");
