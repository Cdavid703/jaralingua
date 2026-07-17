"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const assessment = require("../assets/js/french8-pronunciation-assessment.js");

const ROOT = path.resolve(__dirname, "..");
const PAGE_PATH = path.join(ROOT, "frances", "Niveau 8", "ateliers", "prononciation-05d-medias-desinformation.html");
const CONTROLLER_PATH = path.join(ROOT, "assets", "js", "french8-pronunciation-theme05.js");
const LIAISON_PATH = path.join(ROOT, "assets", "js", "french8-pronunciation-liaisons.js");
const SCRIPT_PATH = path.join(ROOT, "frances", "Niveau 8", "audio", "pronunciation-medias-desinformation-script.md");
const AUDIO_DIR = path.join(ROOT, "frances", "Niveau 8", "audio", "pronunciation", "theme-05");

const page = fs.readFileSync(PAGE_PATH, "utf8");
const controller = fs.readFileSync(CONTROLLER_PATH, "utf8");
const liaisonSource = fs.readFileSync(LIAISON_PATH, "utf8");
const script = fs.readFileSync(SCRIPT_PATH, "utf8");

const sections = [
  "Ce qui inquiète les journalistes, c’est la vitesse à laquelle une fausse information circule.",
  "C’est souvent une image sortie de son contexte qui déclenche la confusion.",
  "Ce que nous devons vérifier, ce sont les sources, les dates et les preuves.",
  "C’est en comparant plusieurs médias qu’on peut éviter de partager une rumeur."
];
const finalText = sections.join(" ");

function timedWords(text, options = {}) {
  const startAt = options.startAt ?? 2.5;
  const step = options.step ?? 0.4;
  const probability = options.probability ?? 0.94;
  return assessment.tokens(text).map((word, index) => ({
    text: word,
    start: startAt + index * step,
    end: startAt + index * step + 0.26,
    probability
  }));
}

function assess(referenceText, transcript, options = {}) {
  return assessment.assess({
    referenceText,
    transcript,
    words: options.words || timedWords(transcript, options),
    audio: options.audio || { duration_seconds: 24, rms: 0.045, peak: 0.34 },
    languageProbability: options.languageProbability ?? 0.97,
    recordedDurationMs: options.recordedDurationMs ?? 24000
  });
}

sections.forEach((section, index) => {
  const result = assess(section, section);
  assert.ok(result.overall >= 98, `Section ${index + 1} exact reading should score highly, got ${result.overall}`);
  assert.equal(result.uncertain, false);
});

{
  const result = assess(finalText, finalText, {
    words: timedWords(finalText, { startAt: 6.5, step: 0.41 }),
    recordedDurationMs: 52000,
    audio: { duration_seconds: 52, rms: 0.046, peak: 0.35 }
  });
  assert.ok(result.overall >= 98, `Operational silence must not lower the exact final reading, got ${result.overall}`);
  assert.ok(result.quality.speechDurationSeconds < 30, "Word timings, not total recording duration, must define rhythm");
}

{
  const mobileTranscript = "Ce que nous devons vérifier ce son les source les date est les preuve.";
  const result = assess(sections[2], mobileTranscript);
  assert.ok(result.aligned.accepted >= 5, "Silent plurals and common mobile STT homophones should be accepted");
  assert.ok(result.overall >= 90, `Equivalent mobile STT spelling should remain fair, got ${result.overall}`);
}

{
  const result = assess(sections[1], sections[1], {
    audio: { duration_seconds: 6, rms: 0.0005, peak: 0.005 }
  });
  assert.equal(result.uncertain, true, "Weak input must create a reliability warning");
  assert.ok(result.overall >= 95, "Weak input must not lower an otherwise useful linguistic transcription");
}

{
  const result = assess(sections[0], "", { words: [] });
  assert.equal(result.overall, 0, "Empty recognition must remain a real zero attempt");
  assert.equal(result.uncertain, true);
}

{
  const result = assess(finalText, sections[0]);
  assert.ok(result.overall < 55, "A genuinely incomplete final reading must still receive a lower formative score");
}

{
  const assessmentPosition = page.indexOf("french8-pronunciation-assessment.js");
  const liaisonPosition = page.indexOf("french8-pronunciation-liaisons.js");
  const controllerPosition = page.indexOf("french8-pronunciation-theme05.js");
  assert.ok(assessmentPosition >= 0 && liaisonPosition > assessmentPosition && controllerPosition > liaisonPosition, "Dependencies must load before 05D");
  assert.equal((page.match(/french8-pronunciation-mobile\.css/g) || []).length, 1, "The responsive stylesheet must load once");
  assert.ok(page.includes("Ce résultat ne va pas dans Notes du cours"), "05D must state that it is formative");
  assert.ok(page.includes("Aucune note et aucun audio ne sont envoyés au professeur"), "05D must explain that it is not submitted");
  assert.ok(page.includes("ne liez pas <em>dates</em> à <em>et</em>"), "05D must explain the forbidden liaison before et");
  assert.ok(page.includes("Les conseils d'enchaînement sont consultatifs"), "Liaison advice must be presented as advisory");
  assert.ok(!page.includes("<em>c'est une</em>"), "The page must not teach a sequence absent from the script");
  assert.ok(page.includes("bootstrap/bootstrap.bundle.min.js"), "The mobile navigation must load Bootstrap behavior");
  assert.ok(!page.includes("french8-pronunciation-grade-submit.js"), "05D must not load grade submission code");
}

{
  assert.match(controller, /EVALUATION_ID = "pronunciation05d"/, "05D must keep its advisory identifier");
  assert.ok(!controller.includes("createPanel"), "05D must not create a grade submission panel");
  assert.ok(!controller.includes("pronunciation-grade"), "05D must not call the grade endpoint");
  assert.ok(!controller.includes("showRecordingIssue"), "05D must not turn a completed doubtful attempt into an unscored state");
  assert.ok(!controller.includes("recordingEvidence(payload)"), "05D must pass empty recognition to the approved evaluator");
  assert.match(controller, /liveTranscript\.textContent = transcript \|\| "Aucun mot n’a été reconnu dans cet essai\.";/, "05D must explain empty recognition");
  assert.match(controller, /resetChallengeButton\.addEventListener\("click", confirmResetAllResults\)/, "05D must expose a full reset");
  assert.ok(!/localStorage\.removeItem\(STORAGE_KEY\);\s*saveProgress\(\);/.test(controller), "A full reset must not immediately recreate erased progress");
}

{
  const sandbox = { window: { JaraFrench8PronunciationAssessment: assessment } };
  vm.runInNewContext(liaisonSource, sandbox);
  const section1 = sandbox.window.JaraFrench8LiaisonFeedback.analyze({
    evaluationId: "pronunciation05d",
    referenceText: sections[0],
    transcript: sections[0]
  });
  const section2 = sandbox.window.JaraFrench8LiaisonFeedback.analyze({
    evaluationId: "pronunciation05d",
    referenceText: sections[1],
    transcript: sections[1]
  });
  const section4 = sandbox.window.JaraFrench8LiaisonFeedback.analyze({
    evaluationId: "pronunciation05d",
    referenceText: sections[3],
    transcript: sections[3]
  });
  assert.equal(section1.checked, 1, "Section 1 should teach fausse information");
  assert.equal(section2.checked, 1, "Section 2 should teach the enchainement in une image");
  assert.equal(section4.checked, 1, "Section 4 should teach c'est en");
  assert.equal(section2.advisoryOnly, true, "Enchainement feedback must never change the score");
  assert.deepEqual(Array.from(section2.missed), []);
  assert.ok(!liaisonSource.includes('["dates", "et"]'), "A forbidden liaison before et must not be suggested");
  assert.ok(!liaisonSource.includes('["peut", "eviter"]'), "An optional verb liaison must not be a required target");
  assert.ok(!liaisonSource.includes('["c\'est", "une"]'), "A non-contiguous sequence must not be a pronunciation target");
}

{
  sections.forEach((section) => assert.ok(script.includes(section), `Canonical script must include: ${section}`));
  ["section-1.mp3", "section-2.mp3", "section-3.mp3", "section-4.mp3"].forEach((file) => {
    assert.ok(fs.statSync(path.join(AUDIO_DIR, file)).size > 50000, `${file} must exist and be nontrivial`);
  });
  assert.ok(fs.statSync(path.join(AUDIO_DIR, "n8-05d-medias-desinformation-modele-france.mp3")).size > 300000, "Final model audio must exist and be nontrivial");
}

console.log("French 8 pronunciation 05D frontend, audio and pedagogy checks passed.");
