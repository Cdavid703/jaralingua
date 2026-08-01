#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const htmlPath = path.join(root, "ingles", "intermediate", "final-writing-task.html");
const jsPath = path.join(root, "assets", "js", "intermediate-final-writing-task.js");
const cssPath = path.join(root, "assets", "css", "intermediate-final-writing-task.css");
const evaluationsPath = path.join(root, "ingles", "intermediate", "evaluations.html");

const html = fs.readFileSync(htmlPath, "utf8");
const js = fs.readFileSync(jsPath, "utf8");
const css = fs.readFileSync(cssPath, "utf8");
const evaluations = fs.readFileSync(evaluationsPath, "utf8");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

[
  "accessPanel",
  "adminPanel",
  "readinessPanel",
  "examPanel",
  "submittedPanel",
  "publicationBody",
  "submitButton",
  "submitStatus",
  "wordCounter",
  "saveStatus",
  "timerDisplay"
].forEach((id) => {
  assert(html.includes(`id="${id}"`), `Missing required element #${id}`);
});

assert(
  /id="submitButton"(?:(?!>).)*>\s*<i[^>]*><\/i>\s*Send to Teacher\s*<\/button>/s.test(html),
  "The final delivery button must say Send to Teacher"
);
assert(
  !/id="submitButton"(?:(?!>).)*\sdisabled(?:\s|>)/s.test(html),
  "Send to Teacher must not be disabled in the HTML"
);
assert(
  html.includes("How can I begin?") && html.includes("Opening example"),
  "The collapsible opening orientation is missing"
);
assert(
  html.includes("data-auth-nav-slot"),
  "The responsive top-navigation login slot is missing"
);
assert(
  html.includes("Sign in at the top of this page")
    && !html.includes("data-open-login")
    && !html.includes("data-jaralingua-inline-login")
    && !html.includes('id="resetLoginButton"'),
  "Authentication must remain exclusively in the top navigation"
);
assert(
  !/criteria for assessing|rubric-grid|data-rubric/i.test(html),
  "Teacher rubric controls must not be present in student-facing HTML"
);
assert(
  html.includes("master-chef-colombian-table-v1.webp")
    && html.includes("recipe-writing-orientation-v1.webp"),
  "Both professional image references are required"
);

[
  path.join(root, "assets", "img", "english-intermediate", "final-writing-task", "master-chef-colombian-table-v1.webp"),
  path.join(root, "assets", "img", "english-intermediate", "final-writing-task", "recipe-writing-orientation-v1.webp")
].forEach((imagePath) => {
  assert(fs.existsSync(imagePath), `Missing image ${imagePath}`);
  assert(fs.statSync(imagePath).size > 100000, `Image is unexpectedly small: ${imagePath}`);
});

assert(
  js.includes('submit: "/api/intermediate/final-writing/submit"'),
  "Frontend submit endpoint is incorrect"
);
assert(
  js.includes("els.submit.disabled = staffPreview || submitInFlight"),
  "Submit availability is not protected by the expected in-flight-only rule"
);
assert(
  !js.includes("els.submit.disabled = staffPreview || !els.body.value.trim()"),
  "Submit must not be blocked by an empty or short publication"
);
assert(
  js.includes("pending teacher review") && js.includes("Receipt"),
  "Submission confirmation and pending-review state are missing"
);
assert(
  css.includes("@media (max-width: 980px)") && css.includes("@media (max-width: 720px)"),
  "Tablet and mobile responsive rules are missing"
);
assert(
  evaluations.includes('href="final-writing-task.html"'),
  "The exam is not linked from Intermediate Evaluations"
);

console.log(
  "PASS intermediate Final Writing UI contract: images, guidance, active delivery, receipt, hidden rubric, navigation, and responsive rules"
);
