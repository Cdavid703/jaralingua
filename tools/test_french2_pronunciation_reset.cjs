const assert = require("assert");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const reset = require(path.join(ROOT, "frances", "Niveau 2", "assets", "pronunciation-reset-a2.js"));

const activities = [
  ["prononciation.html", "routines", "pronunciation-a2.js"],
  ["prononciation-vetements.html", "vetements", "pronunciation-a2-theme2.js"],
  ["prononciation-logement.html", "logement", "pronunciation-a2-theme3.js"],
  ["prononciation-restaurant.html", "restaurant", "pronunciation-a2-theme4.js"],
  ["prononciation-sante.html", "sante", "pronunciation-a2-theme5.js"],
  ["prononciation-plans.html", "theme6", "pronunciation-a2-theme6.js"],
  ["prononciation-directions.html", "theme7", "pronunciation-a2-theme7.js"]
];

activities.forEach(([pageName, storageSlug, controller]) => {
  const config = reset.configForPath(`/frances/Niveau%202/ateliers/${pageName}`);
  assert.ok(config, `${pageName} must have reset configuration`);
  assert.equal(config.storageKey, `jaralingua:french2:pronunciation:${storageSlug}:v2`);
  assert.equal(config.legacyStorageKey, `jaralingua:french2:pronunciation:${storageSlug}:v1`);

  const html = fs.readFileSync(path.join(ROOT, "frances", "Niveau 2", "ateliers", pageName), "utf8");
  const helperPosition = html.indexOf("pronunciation-reset-a2.js?v=20260717-n2-full-reset");
  const controllerPosition = html.indexOf(controller);
  assert.ok(helperPosition >= 0, `${pageName} must load the full-reset helper`);
  assert.ok(controllerPosition > helperPosition, `${pageName} must repair storage before loading ${controller}`);
});

const technicalZero = {
  score: 0,
  transcript: "Analyse automatique indisponible",
  analysisUnavailable: true
};
assert.equal(reset.isTechnicalFailureAttempt(technicalZero), true);
assert.equal(reset.isTechnicalFailureAttempt({ overall: 0, transcript: "" }), true);
assert.equal(reset.isTechnicalFailureAttempt({ score: 0, transcript: "bonjour" }), false, "A real assessed zero must be preserved");
assert.equal(reset.isTechnicalFailureAttempt({ score: 25, transcript: "" }), false, "Only technical zeros may be repaired");

const repaired = reset.sanitizeState({
  stage: 3,
  scores: [technicalZero, { score: 82, transcript: "ensuite" }, null, { score: 71, transcript: "le soir" }],
  history: [[technicalZero, { score: 0, transcript: "parole utile" }], [], [], []]
});
assert.equal(repaired.changed, true);
assert.equal(repaired.removedCount, 2);
assert.equal(repaired.firstInvalidStage, 0);
assert.equal(repaired.state.stage, 0, "Progress must return to the first invalid section");
assert.equal(repaired.state.scores[0], null);
assert.equal(repaired.state.scores[1].score, 82);
assert.equal(repaired.state.history[0].length, 1);
assert.equal(repaired.state.history[0][0].transcript, "parole utile");

const validState = {
  stage: 1,
  scores: [{ score: 0, transcript: "prononciation reelle" }, { score: 90, transcript: "ensuite" }]
};
const untouched = reset.sanitizeState(validState);
assert.equal(untouched.changed, false);
assert.deepEqual(untouched.state.scores, validState.scores);

const helperSource = fs.readFileSync(path.join(ROOT, "frances", "Niveau 2", "assets", "pronunciation-reset-a2.js"), "utf8");
assert.ok(helperSource.includes("restartActivityBtn"));
assert.ok(helperSource.includes("Recommencer toute"));
assert.ok(helperSource.includes("une nouvelle remise la remplacera"));

console.log("French 2 pronunciation full reset passed for themes 1-7.");
