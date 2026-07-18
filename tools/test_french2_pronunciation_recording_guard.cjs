const assert = require("assert");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const assessment = require(path.join(ROOT, "assets", "js", "french8-pronunciation-assessment.js"));

const activities = [
  ["pronunciation-a2.js", "prononciation.html"],
  ["pronunciation-a2-theme2.js", "prononciation-vetements.html"],
  ["pronunciation-a2-theme3.js", "prononciation-logement.html"],
  ["pronunciation-a2-theme4.js", "prononciation-restaurant.html"],
  ["pronunciation-a2-theme5.js", "prononciation-sante.html"],
  ["pronunciation-a2-theme6.js", "prononciation-plans.html"],
  ["pronunciation-a2-theme7.js", "prononciation-directions.html"]
];

activities.forEach(([scriptName, pageName]) => {
  const source = fs.readFileSync(path.join(ROOT, "frances", "Niveau 2", "assets", scriptName), "utf8");
  const evidenceGuard = source.indexOf("if (!evidence.ok)");
  const attemptCreation = source.indexOf("const attempt = attemptFromPayload", evidenceGuard);
  const attemptStorage = source.indexOf("storeAttempt(attempt)", evidenceGuard);

  assert.ok(source.includes("validateRecordingEvidence"), `${scriptName} must validate microphone evidence`);
  assert.ok(source.includes("showRecordingIssue(evidence)"), `${scriptName} must show an unscored retry state`);
  assert.ok(evidenceGuard >= 0, `${scriptName} must reject unusable evidence`);
  assert.ok(attemptCreation > evidenceGuard, `${scriptName} must validate before creating a scored attempt`);
  assert.ok(attemptStorage > evidenceGuard, `${scriptName} must validate before storing a scored attempt`);
  assert.ok(source.includes("body: blob"), `${scriptName} must send the recorded audio bytes`);
  assert.ok(!source.includes("new FormData()"), `${scriptName} must not wrap the recording in a multipart form`);

  const html = fs.readFileSync(path.join(ROOT, "frances", "Niveau 2", "ateliers", pageName), "utf8");
  const sharedPosition = html.indexOf("french8-pronunciation-assessment.js");
  const activityPosition = html.indexOf(scriptName);
  assert.ok(sharedPosition >= 0, `${pageName} must load the shared assessment`);
  assert.ok(activityPosition > sharedPosition, `${pageName} must load the assessment before ${scriptName}`);
});

const silent = assessment.validateRecordingEvidence({
  transcript: "",
  audio: { duration_seconds: 3, rms: 0, peak: 0 },
  recordedDurationMs: 3000
});
assert.equal(silent.ok, false);
assert.equal(silent.reason, "weak_signal");

const spoken = assessment.validateRecordingEvidence({
  transcript: "Bonjour, je parle clairement.",
  audio: { duration_seconds: 2, rms: 0.001, peak: 0.008 },
  recordedDurationMs: 2000
});
assert.equal(spoken.ok, true, "A useful transcript remains assessable even when the signal is weak");

console.log("French 2 pronunciation recording guards passed for themes 1-7.");
