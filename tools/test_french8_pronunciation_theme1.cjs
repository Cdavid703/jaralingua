"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const assessment = require("../assets/js/french8-pronunciation-assessment.js");

const ROOT = path.resolve(__dirname, "..");
const PAGE_PATH = path.join(ROOT, "frances", "Niveau 8", "ateliers", "prononciation-01d-conditionnel-passe.html");
const CONTROLLER_PATH = path.join(ROOT, "assets", "js", "french8-pronunciation-sections.js");
const SUBMIT_PATH = path.join(ROOT, "assets", "js", "french8-pronunciation-grade-submit.js");
const CSS_PATH = path.join(ROOT, "assets", "css", "french8-pronunciation-mobile.css");

const page = fs.readFileSync(PAGE_PATH, "utf8");
const controller = fs.readFileSync(CONTROLLER_PATH, "utf8");
const submitter = fs.readFileSync(SUBMIT_PATH, "utf8");
const css = fs.readFileSync(CSS_PATH, "utf8");

const sections = [
  "Si j\u2019avais mieux pr\u00e9par\u00e9 mon voyage, je n\u2019aurais pas oubli\u00e9 mon passeport \u00e0 la maison.",
  "J\u2019aurais r\u00e9serv\u00e9 un h\u00f4tel plus proche de la gare et nous aurions \u00e9vit\u00e9 beaucoup de stress.",
  "Mes amis auraient pu profiter davantage du s\u00e9jour,",
  "et cette exp\u00e9rience nous aurait certainement rendus plus prudents pour nos prochaines aventures."
];
const finalText = sections.join(" ");

function timedWords(text, probability = 0.93) {
  return assessment.tokens(text).map((word, index) => ({
    text: word,
    start: 2.5 + index * 0.42,
    end: 2.78 + index * 0.42,
    probability
  }));
}

function assess(referenceText, transcript, options = {}) {
  return assessment.assess({
    referenceText,
    transcript,
    words: options.words || timedWords(transcript, options.probability),
    audio: options.audio || { duration_seconds: 24, rms: 0.052, peak: 0.39 },
    languageProbability: options.languageProbability ?? 0.97,
    recordedDurationMs: options.recordedDurationMs ?? 24000
  });
}

sections.forEach((section, index) => {
  const result = assess(section, section);
  assert.ok(result.overall >= 98, `Section ${index + 1} exact reading should score highly, got ${result.overall}`);
  assert.equal(result.uncertain, false, `Section ${index + 1} exact reading should be reliable`);
});

{
  const result = assess(finalText, finalText);
  assert.ok(result.overall >= 98, `Exact final reading should score highly, got ${result.overall}`);
  assert.equal(result.accuracy, 100);
  assert.equal(result.completeness, 100);
}

{
  const reference = sections[0];
  const mobileTranscript = "Si j'avais mieux preparer mon voyage, je n'aurai pas oublier mon passeport a la maison.";
  const result = assess(reference, mobileTranscript);
  assert.ok(result.aligned.accepted >= 3, "Audibly equivalent conditionnel forms should be accepted");
  assert.ok(result.overall >= 88, `Mobile STT spelling variants should remain fair, got ${result.overall}`);
}

{
  const result = assess(sections[1], sections[1], {
    audio: { duration_seconds: 9, rms: 0.0005, peak: 0.005 }
  });
  assert.equal(result.uncertain, true, "Weak mobile input must be flagged, not turned into a pronunciation penalty");
  assert.ok(result.overall >= 95, "A useful transcript must retain its linguistic score despite a weak signal");
}

{
  const result = assess(sections[2], "", { words: [] });
  assert.equal(result.overall, 0, "No recognized speech must be a real zero attempt");
  assert.equal(result.uncertain, true, "No recognized speech must remain technically uncertain");
}

{
  const assessmentPosition = page.indexOf("french8-pronunciation-assessment.js");
  const controllerPosition = page.indexOf("french8-pronunciation-sections.js");
  assert.ok(assessmentPosition >= 0 && controllerPosition > assessmentPosition, "The shared assessor must load before 01D");
  assert.equal((page.match(/french8-pronunciation-mobile\.css/g) || []).length, 1, "The responsive stylesheet must load only once");
}

{
  assert.match(controller, /evaluationId:\s*"pronunciation01d"/, "01D must keep its gradebook identifier");
  assert.match(controller, /getFinalScore:\s*\(\) => finalSubmissionAttempt \|\| stageScores\[4\]/, "The submitted score must match the latest recorded evidence");
  assert.match(controller, /requireFinalAudio:\s*true/, "01D must require its final audio before submission");
  assert.ok(!controller.includes("showRecordingIssue"), "01D must not convert a completed doubtful attempt into an unscored state");
  assert.ok(!controller.includes("recordingEvidence(payload)"), "01D must pass empty recognition to the approved evaluator");
  assert.match(controller, /retainSavedScore = uncertain[\s\S]*savedStageScore\.uncertain !== true[\s\S]*savedStageScore\.overall > overall/, "A lower uncertain retry must not erase a better reliable result");
  assert.match(controller, /fetch\(API_PATH, \{ method: "POST", headers: \{ "Content-Type": blob\.type \|\| "audio\/webm" \}, body: blob \}\)/, "Recognition must receive raw audio bytes");
  assert.ok(!controller.includes("FormData"), "01D must not wrap recognition audio in FormData");
}

{
  assert.match(submitter, /function scoreForAttempt\(attempt\)/, "Submission must distinguish null from a real zero");
  assert.match(submitter, /config\.requireFinalAudio === true && !audioDataUrl/, "Missing final audio must block submission");
  assert.match(submitter, /if \(submitting\) return;/, "Concurrent duplicate submissions must be ignored");
  assert.match(submitter, /lastSubmittedSignature = submissionSignature/, "A confirmed attempt must not be posted twice accidentally");
  assert.match(submitter, /Number\(score \|\| 0\) \/ 20/, "The established conversion from 100 points to a grade over 5 must remain unchanged");
}

{
  assert.ok(css.includes("@media(max-width:767.98px)"), "01D needs phone and tablet layout rules");
  assert.ok(css.includes("@media(max-width:374.98px)"), "01D needs narrow-phone layout rules");
  assert.ok(css.includes(".pronunciation-submit-actions{display:grid;grid-template-columns:1fr}"), "Submission actions must stack on mobile");
  assert.ok(css.includes("#studentAudio{display:block;width:100%"), "The recorded-audio player must fit a phone");
}

console.log("French 8 pronunciation 01D frontend checks passed.");
