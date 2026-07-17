"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const assessment = require("../assets/js/french8-pronunciation-assessment.js");

const ROOT = path.resolve(__dirname, "..");
const PAGE_PATH = path.join(ROOT, "frances", "Niveau 8", "ateliers", "prononciation-04d-discours-rapporte.html");
const CONTROLLER_PATH = path.join(ROOT, "assets", "js", "french8-pronunciation-theme04.js");
const LIAISON_PATH = path.join(ROOT, "assets", "js", "french8-pronunciation-liaisons.js");
const SCRIPT_PATH = path.join(ROOT, "frances", "Niveau 8", "audio", "pronunciation-discours-rapporte-script.md");
const AUDIO_DIR = path.join(ROOT, "frances", "Niveau 8", "audio", "pronunciation", "theme-04");

const page = fs.readFileSync(PAGE_PATH, "utf8");
const controller = fs.readFileSync(CONTROLLER_PATH, "utf8");
const liaisonSource = fs.readFileSync(LIAISON_PATH, "utf8");
const script = fs.readFileSync(SCRIPT_PATH, "utf8");

const sections = [
  "Lors de l’interview, la ministre a déclaré qu’elle présenterait son projet le lendemain.",
  "Elle a expliqué que son équipe avait déjà consulté plusieurs associations.",
  "Elle a ajouté qu’elle souhaitait encore écouter attentivement les habitants.",
  "Enfin, elle a promis qu’aucune décision ne serait prise avant que tous les avis aient été examinés."
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
  const mobileTranscript = "Enfin elle a promis qu'aucune décision ne serait prise avant que tout les avis est été examiné.";
  const result = assess(sections[3], mobileTranscript);
  assert.ok(result.aligned.accepted >= 3, "Silent plural and aient/est variants should be accepted as equivalent recognition");
  assert.ok(result.overall >= 88, `Equivalent mobile STT spelling should remain fair, got ${result.overall}`);
}

{
  const result = assess(sections[1], sections[1], {
    audio: { duration_seconds: 6, rms: 0.0005, peak: 0.005 }
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
  const result = assess(finalText, sections[0]);
  assert.ok(result.overall < 55, "A genuinely incomplete final reading must still receive a lower provisional score");
}

{
  const assessmentPosition = page.indexOf("french8-pronunciation-assessment.js");
  const controllerPosition = page.indexOf("french8-pronunciation-theme04.js");
  assert.ok(assessmentPosition >= 0 && controllerPosition > assessmentPosition, "The shared assessor must load before 04D");
  assert.equal((page.match(/french8-pronunciation-mobile\.css/g) || []).length, 1, "The responsive stylesheet must load once");
  assert.ok(page.includes("se prononcent /ɛ/"), "04D must explain the -ait/-aient sound");
  assert.ok(page.includes("un nom pluriel ne se lie pas au verbe suivant"), "04D must explain the forbidden noun-to-verb liaison");
  assert.ok(page.includes("ne forcez pas un /t/"), "04D must not make the rare aient-été liaison mandatory");
  assert.ok(page.includes("estimation automatique provisoire"), "The score must be presented as provisional");
  assert.ok(page.includes("L'audio final est obligatoire"), "The page must explain the final audio requirement");
  assert.ok(page.includes("bootstrap/bootstrap.bundle.min.js"), "The mobile navigation must load Bootstrap behavior");
  assert.ok(!page.includes("<strong>avis aient</strong>"), "A forbidden noun-to-verb liaison must not be taught");
}

{
  assert.match(controller, /evaluationId:\s*"pronunciation04d"/, "04D must keep its gradebook identifier");
  assert.match(controller, /getFinalScore:\s*\(\) => finalSubmissionAttempt \|\| stageScores\[4\]/, "The sent score and audio must belong to the same final attempt");
  assert.match(controller, /requireFinalAudio:\s*true/, "04D must require final audio");
  assert.ok(!controller.includes("showRecordingIssue"), "04D must not turn a completed doubtful attempt into an unscored state");
  assert.ok(!controller.includes("recordingEvidence(payload)"), "04D must pass empty recognition to the approved evaluator");
  assert.match(controller, /liveTranscript\.textContent = transcript \|\| "Aucun mot n’a été reconnu dans cet essai\.";/, "04D must explain empty recognition");
  assert.match(controller, /fetch\(API_PATH, \{ method: "POST", headers: \{ "Content-Type": blob\.type \|\| "audio\/webm" \}, body: blob \}\)/, "Recognition must receive raw audio bytes");
  assert.ok(!/localStorage\.removeItem\(STORAGE_KEY\);\s*saveProgress\(\);/.test(controller), "A full reset must not immediately recreate erased progress");
}

{
  const sandbox = { window: { JaraFrench8PronunciationAssessment: assessment } };
  vm.runInNewContext(liaisonSource, sandbox);
  const section2 = sandbox.window.JaraFrench8LiaisonFeedback.analyze({
    evaluationId: "pronunciation04d",
    referenceText: sections[1],
    transcript: sections[1]
  });
  const section3 = sandbox.window.JaraFrench8LiaisonFeedback.analyze({
    evaluationId: "pronunciation04d",
    referenceText: sections[2],
    transcript: sections[2]
  });
  assert.equal(section2.checked, 3, "Section 2 should teach one enchainement and two required liaisons");
  assert.equal(section3.checked, 3, "Section 3 should teach two enchainements and les habitants");
  assert.equal(section2.advisoryOnly, true, "Liaison feedback must never change the score");
  assert.deepEqual(Array.from(section2.missed), []);
  assert.ok(!liaisonSource.includes('["avis", "aient"]'), "A noun-to-verb liaison must not be suggested");
  assert.ok(!liaisonSource.includes('["aient", "ete"]'), "A rare optional liaison must not be presented as a target");
}

{
  sections.forEach((section) => assert.ok(script.includes(section), `Canonical script must include: ${section}`));
  ["section-1.mp3", "section-2.mp3", "section-3.mp3", "section-4.mp3"].forEach((file) => {
    assert.ok(fs.statSync(path.join(AUDIO_DIR, file)).size > 50000, `${file} must exist and be nontrivial`);
  });
  assert.ok(fs.statSync(path.join(AUDIO_DIR, "n8-04d-discours-rapporte-modele-france.mp3")).size > 250000, "Final model audio must exist and be nontrivial");
}

console.log("French 8 pronunciation 04D frontend, audio and pedagogy checks passed.");
