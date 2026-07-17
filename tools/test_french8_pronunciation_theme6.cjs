"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const assessment = require("../assets/js/french8-pronunciation-assessment.js");

const ROOT = path.resolve(__dirname, "..");
const PAGE_PATH = path.join(ROOT, "frances", "Niveau 8", "ateliers", "prononciation-06d-ia-ethique.html");
const CONTROLLER_PATH = path.join(ROOT, "assets", "js", "french8-pronunciation-theme06.js");
const LIAISON_PATH = path.join(ROOT, "assets", "js", "french8-pronunciation-liaisons.js");
const SCRIPT_PATH = path.join(ROOT, "frances", "Niveau 8", "audio", "pronunciation-ia-ethique-script.md");
const AUDIO_DIR = path.join(ROOT, "frances", "Niveau 8", "audio", "pronunciation", "theme-06");

const page = fs.readFileSync(PAGE_PATH, "utf8");
const controller = fs.readFileSync(CONTROLLER_PATH, "utf8");
const liaisonSource = fs.readFileSync(LIAISON_PATH, "utf8");
const script = fs.readFileSync(SCRIPT_PATH, "utf8");

const sections = [
  "Étant donné que l'IA analyse des données sensibles, nous devons rester prudents.",
  "L'outil peut nous faire gagner du temps, de sorte que les conseillers se concentrent sur les cas complexes.",
  "Il faut une charte claire pour que les utilisateurs comprennent leurs droits.",
  "Sans audit indépendant, déployer cette technologie reviendrait à jouer avec le feu."
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
  const mobileTranscript = "Étant donné que l'i a analyse des donnée sensible nous devons rester prudent.";
  const result = assess(sections[0], mobileTranscript);
  assert.ok(result.aligned.accepted >= 4, "Split acronym and silent plurals should be accepted as equivalent recognition");
  assert.ok(result.overall >= 90, `Equivalent mobile STT spelling should remain fair, got ${result.overall}`);
}

{
  const mobileTranscript = "Il faut une charte claire pour que les utilisateur comprenne leur droit.";
  const result = assess(sections[2], mobileTranscript);
  assert.ok(result.aligned.accepted >= 4, "Silent number and verb-ending variants should be accepted");
  assert.ok(result.overall >= 92, `Equivalent recognition should remain fair, got ${result.overall}`);
}

{
  const result = assess(sections[1], sections[1], {
    audio: { duration_seconds: 8, rms: 0.0005, peak: 0.005 }
  });
  assert.equal(result.uncertain, true, "Weak input must create a reliability warning");
  assert.ok(result.overall >= 95, "Weak input must not lower an otherwise useful linguistic transcription");
}

{
  const result = assess(sections[3], "", { words: [] });
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
  const controllerPosition = page.indexOf("french8-pronunciation-theme06.js");
  assert.ok(assessmentPosition >= 0 && liaisonPosition > assessmentPosition && controllerPosition > liaisonPosition, "Dependencies must load before 06D");
  assert.equal((page.match(/french8-pronunciation-mobile\.css/g) || []).length, 1, "The responsive stylesheet must load once");
  assert.ok(page.includes("Ce résultat ne va pas dans Notes du cours"), "06D must state that it is formative");
  assert.ok(page.includes("Aucune note et aucun audio ne sont envoyés au professeur"), "06D must explain that it is not submitted");
  assert.ok(page.includes("prononcez <em>IA</em> /i.a/"), "06D must explain the acronym pronunciation");
  assert.ok(page.includes("<strong>Données</strong> /dɔne/ n'a pas de voyelle nasale"), "06D must correct the former nasal-vowel error");
  assert.ok(page.includes("ne liez pas <em>données</em> à <em>sensibles</em>"), "06D must explain the forbidden noun-to-adjective liaison");
  assert.ok(page.includes("/ks/ final de <strong>complexes</strong>"), "06D must explain the audible final consonants in complexes");
  assert.ok(page.includes("bootstrap/bootstrap.bundle.min.js"), "The mobile navigation must load Bootstrap behavior");
  assert.ok(!page.includes("french8-pronunciation-grade-submit.js"), "06D must not load grade submission code");
}

{
  assert.match(controller, /EVALUATION_ID = "pronunciation06d"/, "06D must keep its advisory identifier");
  assert.ok(!controller.includes("createPanel"), "06D must not create a grade submission panel");
  assert.ok(!controller.includes("pronunciation-grade"), "06D must not call the grade endpoint");
  assert.ok(!controller.includes("finalAudioDataUrl"), "Formative 06D must not prepare persistent audio evidence");
  assert.ok(!controller.includes("blobToDataUrl"), "Formative 06D must not serialize the final recording for submission");
  assert.ok(!controller.includes("showRecordingIssue"), "06D must not turn a completed doubtful attempt into an unscored state");
  assert.ok(!controller.includes("recordingEvidence(payload)"), "06D must pass empty recognition to the approved evaluator");
  assert.match(controller, /liveTranscript\.textContent = transcript \|\| "Aucun mot n’a été reconnu dans cet essai\.";/, "06D must explain empty recognition");
  assert.match(controller, /resetChallengeButton\.addEventListener\("click", confirmResetAllResults\)/, "06D must expose a full reset");
  assert.ok(!/localStorage\.removeItem\(STORAGE_KEY\);\s*saveProgress\(\);/.test(controller), "A full reset must not immediately recreate erased progress");
}

{
  const sandbox = { window: { JaraFrench8PronunciationAssessment: assessment } };
  vm.runInNewContext(liaisonSource, sandbox);
  const section3 = sandbox.window.JaraFrench8LiaisonFeedback.analyze({
    evaluationId: "pronunciation06d",
    referenceText: sections[2],
    transcript: sections[2]
  });
  const section4 = sandbox.window.JaraFrench8LiaisonFeedback.analyze({
    evaluationId: "pronunciation06d",
    referenceText: sections[3],
    transcript: sections[3]
  });
  assert.equal(section3.checked, 1, "Section 3 should teach les utilisateurs");
  assert.equal(section4.checked, 2, "Section 4 should teach sans audit and audit indépendant");
  assert.equal(section4.advisoryOnly, true, "Liaison feedback must never change the score");
  assert.deepEqual(Array.from(section4.missed), []);
  assert.ok(!liaisonSource.includes('["donnees", "sensibles"]'), "A plural noun liaison must not be suggested");
  assert.ok(!liaisonSource.includes('["leurs", "droits"]'), "Consonant-initial droits must not be a liaison target");
  assert.ok(!liaisonSource.includes('["faut", "une"]'), "A rare verb liaison must not be required");
}

{
  sections.forEach((section) => assert.ok(script.includes(section), `Canonical script must include: ${section}`));
  ["section-1.mp3", "section-2.mp3", "section-3.mp3", "section-4.mp3"].forEach((file) => {
    assert.ok(fs.statSync(path.join(AUDIO_DIR, file)).size > 50000, `${file} must exist and be nontrivial`);
  });
  assert.ok(fs.statSync(path.join(AUDIO_DIR, "n8-06d-ia-ethique-modele-france.mp3")).size > 300000, "Final model audio must exist and be nontrivial");
}

console.log("French 8 pronunciation 06D frontend, audio and pedagogy checks passed.");
