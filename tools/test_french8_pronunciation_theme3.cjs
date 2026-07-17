"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const assessment = require("../assets/js/french8-pronunciation-assessment.js");

const ROOT = path.resolve(__dirname, "..");
const PAGE_PATH = path.join(ROOT, "frances", "Niveau 8", "ateliers", "prononciation-03d-subjonctif-passe.html");
const CONTROLLER_PATH = path.join(ROOT, "assets", "js", "french8-pronunciation-theme03.js");
const LIAISON_PATH = path.join(ROOT, "assets", "js", "french8-pronunciation-liaisons.js");
const SCRIPT_PATH = path.join(ROOT, "frances", "Niveau 8", "audio", "pronunciation-subjonctif-passe-script.md");
const AUDIO_DIR = path.join(ROOT, "frances", "Niveau 8", "audio", "pronunciation", "theme-03");

const page = fs.readFileSync(PAGE_PATH, "utf8");
const controller = fs.readFileSync(CONTROLLER_PATH, "utf8");
const liaisonSource = fs.readFileSync(LIAISON_PATH, "utf8");
const script = fs.readFileSync(SCRIPT_PATH, "utf8");

const sections = [
  "Je suis soulagée que les responsables aient reconnu leur erreur.",
  "Je suis également contente que les responsables aient présenté leurs excuses publiquement.",
  "Il est regrettable que certaines personnes aient réagi trop rapidement, sans avoir vérifié les faits.",
  "Bien que la situation ait provoqué de la colère, je doute qu’elle ait durablement changé les comportements."
];
const finalText = sections.join(" ");

function timedWords(text, options = {}) {
  const startAt = options.startAt ?? 2.8;
  const step = options.step ?? 0.42;
  const probability = options.probability ?? 0.94;
  return assessment.tokens(text).map((word, index) => ({
    text: word,
    start: startAt + index * step,
    end: startAt + index * step + 0.27,
    probability
  }));
}

function assess(referenceText, transcript, options = {}) {
  return assessment.assess({
    referenceText,
    transcript,
    words: options.words || timedWords(transcript, options),
    audio: options.audio || { duration_seconds: 26, rms: 0.046, peak: 0.35 },
    languageProbability: options.languageProbability ?? 0.97,
    recordedDurationMs: options.recordedDurationMs ?? 26000
  });
}

sections.forEach((section, index) => {
  const result = assess(section, section);
  assert.ok(result.overall >= 98, `Section ${index + 1} exact reading should score highly, got ${result.overall}`);
  assert.equal(result.uncertain, false);
});

{
  const result = assess(finalText, finalText, {
    words: timedWords(finalText, { startAt: 7, step: 0.43 }),
    recordedDurationMs: 54000,
    audio: { duration_seconds: 54, rms: 0.045, peak: 0.34 }
  });
  assert.ok(result.overall >= 98, `Operational silence must not lower the exact final reading, got ${result.overall}`);
  assert.ok(result.quality.speechDurationSeconds < 30, "Word timings, not total recording duration, must define rhythm");
}

{
  const mobileTranscript = "Je suis soulagé que les responsables est reconnu leur erreur.";
  const result = assess(sections[0], mobileTranscript);
  assert.ok(result.aligned.accepted >= 2, "Silent gender and the homophones aient/est should be accepted");
  assert.ok(result.overall >= 90, `Equivalent mobile STT spelling should remain fair, got ${result.overall}`);
}

{
  const result = assess(sections[1], sections[1], {
    audio: { duration_seconds: 7, rms: 0.0005, peak: 0.005 }
  });
  assert.equal(result.uncertain, true, "Weak input must create a reliability warning");
  assert.ok(result.overall >= 95, "Weak input must not lower an otherwise useful linguistic transcription");
}

{
  const result = assess(sections[2], "", { words: [] });
  assert.equal(result.overall, 0, "Empty recognition must remain a real zero attempt");
  assert.equal(result.uncertain, true);
}

{
  const result = assess(finalText, "Je suis soulagée que les responsables aient reconnu leur erreur");
  assert.ok(result.overall < 55, "A genuinely incomplete final reading must still receive a lower provisional score");
}

{
  const assessmentPosition = page.indexOf("french8-pronunciation-assessment.js");
  const controllerPosition = page.indexOf("french8-pronunciation-theme03.js");
  assert.ok(assessmentPosition >= 0 && controllerPosition > assessmentPosition, "The shared assessor must load before 03D");
  assert.equal((page.match(/french8-pronunciation-mobile\.css/g) || []).length, 1, "The responsive stylesheet must load once");
  assert.ok(page.includes("ait</strong> et <strong>aient</strong> se prononcent tous les deux /ɛ/"), "03D must explain the ait/aient homophony");
  assert.ok(page.includes("un nom pluriel ne se lie pas au verbe suivant"), "03D must explain the forbidden noun-to-verb liaison");
  assert.ok(page.includes("estimation automatique provisoire"), "The score must be presented as provisional");
  assert.ok(page.includes("L'audio final est obligatoire"), "The page must explain the final audio requirement");
  assert.ok(page.includes("bootstrap/bootstrap.bundle.min.js"), "The mobile navigation must load Bootstrap behavior");
  assert.ok(!page.includes("Enchaînez naturellement <strong>aient reconnu</strong>"), "Consonant-initial groups must not be mislabeled as enchaînements");
}

{
  assert.match(controller, /evaluationId:\s*"pronunciation03d"/, "03D must keep its gradebook identifier");
  assert.match(controller, /getFinalScore:\s*\(\) => finalSubmissionAttempt \|\| stageScores\[4\]/, "The sent score and audio must belong to the same final attempt");
  assert.match(controller, /requireFinalAudio:\s*true/, "03D must require final audio");
  assert.ok(!controller.includes("showRecordingIssue"), "03D must not turn a completed doubtful attempt into an unscored state");
  assert.ok(!controller.includes("recordingEvidence(payload)"), "03D must pass empty recognition to the approved evaluator");
  assert.match(controller, /liveTranscript\.textContent = transcript \|\| "Aucun mot n’a été reconnu dans cet essai\.";/, "03D must explain empty recognition");
  assert.match(controller, /fetch\(API_PATH, \{ method: "POST", headers: \{ "Content-Type": blob\.type \|\| "audio\/webm" \}, body: blob \}\)/, "Recognition must receive raw audio bytes");
  assert.ok(controller.includes("trois syllabes"), "The responsables pronunciation tip must use the correct syllable count");
}

{
  const sandbox = { window: { JaraFrench8PronunciationAssessment: assessment } };
  vm.runInNewContext(liaisonSource, sandbox);
  const section2 = sandbox.window.JaraFrench8LiaisonFeedback.analyze({
    evaluationId: "pronunciation03d",
    referenceText: sections[1],
    transcript: sections[1]
  });
  assert.equal(section2.checked, 2, "Section 2 should teach les responsables and leurs excuses");
  assert.equal(section2.advisoryOnly, true, "Liaison feedback must never change the score");
  assert.deepEqual(Array.from(section2.missed), []);
  assert.ok(!liaisonSource.includes('["responsables", "aient"]'), "A noun-to-verb liaison must not be suggested");
  assert.ok(!liaisonSource.includes('["personnes", "aient"]'), "A noun-to-verb liaison must not be suggested");
}

{
  sections.forEach((section) => assert.ok(script.includes(section), `Canonical script must include: ${section}`));
  ["section-1.mp3", "section-2.mp3", "section-3.mp3", "section-4.mp3"].forEach((file) => {
    assert.ok(fs.statSync(path.join(AUDIO_DIR, file)).size > 50000, `${file} must exist and be nontrivial`);
  });
  assert.ok(fs.statSync(path.join(AUDIO_DIR, "n8-03d-subjonctif-passe-modele-france.mp3")).size > 300000, "Final model audio must exist and be nontrivial");
}

console.log("French 8 pronunciation 03D frontend, audio and pedagogy checks passed.");
