"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const assessment = require("../assets/js/french8-pronunciation-assessment.js");

const ROOT = path.resolve(__dirname, "..");
const CACHE_KEY = "v=20260717-n1-n8-mic-guard";

function read(...parts) {
  return fs.readFileSync(path.join(ROOT, ...parts), "utf8");
}

function assertGuardBeforeScoring(source, scoringCall, label) {
  const guard = source.indexOf("if (!evidence.ok)");
  const issueState = source.indexOf("showRecordingIssue(evidence)", guard);
  const scoring = source.indexOf(scoringCall, guard);

  assert.ok(source.includes("validateRecordingEvidence"), `${label} must use the shared recording validator`);
  assert.ok(guard >= 0, `${label} must reject an unusable recording`);
  assert.ok(issueState > guard, `${label} must show an unscored retry state`);
  assert.ok(scoring > issueState, `${label} must validate before creating or storing a score`);
  assert.ok(source.includes("body: blob"), `${label} must send the recorded audio bytes`);
}

{
  const controller = read("frances", "Niveau 1", "assets", "pronunciation-a1.js");
  assertGuardBeforeScoring(controller, "const attempt = attemptFromPayload", "French 1 pronunciation");
  const setsSource = controller.slice(controller.indexOf("const SETS ="), controller.indexOf("const params ="));
  assert.equal((setsSource.match(/^\s+"theme-\d+": \{/gm) || []).length, 9, "French 1 must keep themes 1-9 on the guarded controller");

  const page = read("frances", "Niveau 1", "ateliers", "prononciation.html");
  const assessmentPosition = page.indexOf("french8-pronunciation-assessment.js");
  const controllerPosition = page.indexOf("pronunciation-a1.js");
  assert.ok(assessmentPosition >= 0 && controllerPosition > assessmentPosition, "French 1 must load the validator before its controller");
  assert.equal((page.match(new RegExp(CACHE_KEY, "g")) || []).length, 2, "French 1 must publish the microphone-guard cache key");
}

const level8Activities = [
  ["french8-pronunciation-theme04.js", "prononciation-04d-discours-rapporte.html"],
  ["french8-pronunciation-theme05.js", "prononciation-05d-medias-desinformation.html"],
  ["french8-pronunciation-theme06.js", "prononciation-06d-ia-ethique.html"],
  ["french8-pronunciation-theme07.js", "prononciation-07d-justice-sociale.html"],
  ["french8-pronunciation-theme08.js", "prononciation-08d-francais-oral.html"],
  ["french8-pronunciation-theme09.js", "prononciation-09d-precision-syntaxique.html"]
];

level8Activities.forEach(([scriptName, pageName]) => {
  const controller = read("assets", "js", scriptName);
  assertGuardBeforeScoring(controller, "const attempt = evaluate", scriptName);

  const page = read("frances", "Niveau 8", "ateliers", pageName);
  const assessmentPosition = page.indexOf("french8-pronunciation-assessment.js");
  const controllerPosition = page.indexOf(scriptName);
  assert.ok(assessmentPosition >= 0 && controllerPosition > assessmentPosition, `${pageName} must load the validator first`);
  assert.ok(page.includes(CACHE_KEY), `${pageName} must publish the microphone-guard cache key`);
});

const reviewedLevel8Activities = [
  ["french8-pronunciation-sections.js", "prononciation-01d-conditionnel-passe.html"],
  ["french8-pronunciation-theme02.js", "prononciation-02d-hypotheses-irreelles-passe.html"],
  ["french8-pronunciation-theme03.js", "prononciation-03d-subjonctif-passe.html"]
];

reviewedLevel8Activities.forEach(([scriptName, pageName]) => {
  const controller = read("assets", "js", scriptName);
  assert.ok(!controller.includes("showRecordingIssue"), `${scriptName} must score an empty recognition as a doubtful zero`);
  assert.ok(controller.includes("Aucun mot n’a été reconnu dans cet essai."), `${scriptName} must explain an empty recognition`);
  assert.ok(controller.includes("const attempt = evaluate"), `${scriptName} must send the completed STT response to the evaluator`);
  assert.ok(controller.includes("nextButton.hidden = false"), `${scriptName} must allow progression after a doubtful score`);

  const page = read("frances", "Niveau 8", "ateliers", pageName);
  const assessmentPosition = page.indexOf("french8-pronunciation-assessment.js");
  const controllerPosition = page.indexOf(scriptName);
  assert.ok(assessmentPosition >= 0 && controllerPosition > assessmentPosition, `${pageName} must load the assessor first`);
});

{
  const silent = assessment.validateRecordingEvidence({
    transcript: "",
    audio: { duration_seconds: 3, rms: 0, peak: 0 },
    recordedDurationMs: 3000
  });
  assert.equal(silent.ok, false);
  assert.equal(silent.reason, "weak_signal");

  const noSpeech = assessment.validateRecordingEvidence({
    transcript: "",
    audio: { duration_seconds: 3, rms: 0.03, peak: 0.15 },
    recordedDurationMs: 3000
  });
  assert.equal(noSpeech.ok, false);
  assert.equal(noSpeech.reason, "no_speech");
}

{
  const phoneticsPage = read("frances", "Niveau 7", "coin-phonetique.html");
  assert.ok(!phoneticsPage.includes("MediaRecorder"), "French 7 phonetics must remain playback-only");
  assert.ok(!phoneticsPage.includes("pronunciation-assessment"), "French 7 phonetics must not create automatic pronunciation scores");
}

console.log("French 1 recording guard and incremental French 8 scoring policies passed; French 7 is playback-only.");
