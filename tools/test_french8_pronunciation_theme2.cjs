"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const assessment = require("../assets/js/french8-pronunciation-assessment.js");

const ROOT = path.resolve(__dirname, "..");
const PAGE_PATH = path.join(ROOT, "frances", "Niveau 8", "ateliers", "prononciation-02d-hypotheses-irreelles-passe.html");
const CONTROLLER_PATH = path.join(ROOT, "assets", "js", "french8-pronunciation-theme02.js");
const SCRIPT_PATH = path.join(ROOT, "frances", "Niveau 8", "audio", "pronunciation-hypotheses-passe-script.md");
const AUDIO_DIR = path.join(ROOT, "frances", "Niveau 8", "audio", "pronunciation", "theme-02");

const page = fs.readFileSync(PAGE_PATH, "utf8");
const controller = fs.readFileSync(CONTROLLER_PATH, "utf8");
const script = fs.readFileSync(SCRIPT_PATH, "utf8");

const sections = [
  "Si j\u2019\u00e9tais partie quelques minutes plus t\u00f4t, j\u2019aurais pris ce train et je serais arriv\u00e9e \u00e0 l\u2019heure.",
  "Pourtant, cet impr\u00e9vu m\u2019aurait peut-\u00eatre conduite sur la route au moment de l\u2019accident.",
  "Avec le recul, je me dis que certaines d\u00e9cisions auraient radicalement chang\u00e9 notre histoire,",
  "m\u00eame si nous n\u2019en comprenions pas imm\u00e9diatement les cons\u00e9quences."
];
const finalText = sections.join(" ");

function timedWords(text, options = {}) {
  const startAt = options.startAt ?? 3.5;
  const step = options.step ?? 0.43;
  const probability = options.probability ?? 0.93;
  return assessment.tokens(text).map((word, index) => ({
    text: word,
    start: startAt + index * step,
    end: startAt + index * step + 0.28,
    probability
  }));
}

function assess(referenceText, transcript, options = {}) {
  return assessment.assess({
    referenceText,
    transcript,
    words: options.words || timedWords(transcript, options),
    audio: options.audio || { duration_seconds: 28, rms: 0.048, peak: 0.36 },
    languageProbability: options.languageProbability ?? 0.97,
    recordedDurationMs: options.recordedDurationMs ?? 28000
  });
}

sections.forEach((section, index) => {
  const result = assess(section, section);
  assert.ok(result.overall >= 98, `Section ${index + 1} exact reading should score highly, got ${result.overall}`);
  assert.equal(result.uncertain, false);
});

{
  const result = assess(finalText, finalText, {
    words: timedWords(finalText, { startAt: 8, step: 0.44 }),
    recordedDurationMs: 58000,
    audio: { duration_seconds: 58, rms: 0.046, peak: 0.34 }
  });
  assert.ok(result.overall >= 98, `Operational silence must not lower the exact final reading, got ${result.overall}`);
  assert.ok(result.quality.speechDurationSeconds < 30, "Word timings, not total recording duration, must define rhythm");
}

{
  const mobileTranscript = "Si j'etais parti quelques minutes plus tot, j'aurai pris ce train et je serai arrive a l'heure.";
  const result = assess(sections[0], mobileTranscript);
  assert.ok(result.aligned.accepted >= 3, "Silent gender and conditionnel spelling variants should be accepted");
  assert.ok(result.overall >= 90, `Equivalent mobile STT spelling should remain fair, got ${result.overall}`);
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
  assert.equal(result.overall, 0, "Empty recognition must remain a real zero attempt under the approved guide");
  assert.equal(result.uncertain, true);
}

{
  const result = assess(finalText, "Si j'etais partie quelques minutes plus tot");
  assert.ok(result.overall < 55, "A genuinely incomplete final reading must still receive a lower provisional score");
}

{
  const assessmentPosition = page.indexOf("french8-pronunciation-assessment.js");
  const controllerPosition = page.indexOf("french8-pronunciation-theme02.js");
  assert.ok(assessmentPosition >= 0 && controllerPosition > assessmentPosition, "The shared assessor must load before 02D");
  assert.equal((page.match(/french8-pronunciation-mobile\.css/g) || []).length, 1, "The responsive stylesheet must load only once");
  assert.ok(page.includes("ne faites pas de liaison"), "02D must explain the forbidden noun-to-verb liaison");
  assert.ok(!page.includes("la liaison de <strong>certaines décisions auraient</strong>"), "The former incorrect liaison instruction must be removed");
}

{
  assert.match(controller, /evaluationId:\s*"pronunciation02d"/, "02D must keep its gradebook identifier");
  assert.match(controller, /getFinalScore:\s*\(\) => finalSubmissionAttempt \|\| stageScores\[4\]/, "The sent score and recorded evidence must belong to the same final attempt");
  assert.match(controller, /requireFinalAudio:\s*true/, "02D must require final audio");
  assert.ok(!controller.includes("showRecordingIssue"), "02D must not convert a completed doubtful attempt into an unscored state");
  assert.ok(!controller.includes("recordingEvidence(payload)"), "02D must pass empty recognition to the approved evaluator");
  assert.match(controller, /liveTranscript\.textContent = transcript \|\| "Aucun mot n’a été reconnu dans cet essai\.";/, "02D must explain empty recognition");
  assert.match(controller, /fetch\(API_PATH, \{ method: "POST", headers: \{ "Content-Type": blob\.type \|\| "audio\/webm" \}, body: blob \}\)/, "Recognition must receive raw audio bytes");
  assert.ok(!controller.includes("FormData"), "02D recognition must not use FormData");
  assert.ok(controller.includes("m’aurait peut-être conduite"), "The feminine COD agreement must be correct");
  assert.ok(!controller.includes("m’aurait peut-être conduit sur"), "The former agreement error must not remain");
}

{
  assert.ok(script.includes("m’aurait peut-être conduite"), "The canonical audio script must use the corrected agreement");
  const sectionAudio = path.join(AUDIO_DIR, "section-2.mp3");
  const finalAudio = path.join(AUDIO_DIR, "n8-02d-hypotheses-passe-modele-france.mp3");
  assert.ok(fs.statSync(sectionAudio).size > 50000, "Corrected section 2 audio must exist and be nontrivial");
  assert.ok(fs.statSync(finalAudio).size > 250000, "Corrected final audio must exist and be nontrivial");
}

console.log("French 8 pronunciation 02D frontend and pedagogy checks passed.");
