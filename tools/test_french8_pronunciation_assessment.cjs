"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const assessment = require("../assets/js/french8-pronunciation-assessment.js");

const ROOT = path.resolve(__dirname, "..");

function timedWords(text, options = {}) {
  const startAt = options.startAt ?? 4;
  const step = options.step ?? 0.45;
  const duration = options.duration ?? 0.28;
  const probability = options.probability ?? 0.92;
  return assessment.tokens(text).map((word, index) => ({
    text: word,
    start: startAt + index * step,
    end: startAt + index * step + duration,
    probability
  }));
}

function assess(referenceText, transcript, options = {}) {
  return assessment.assess({
    referenceText,
    transcript,
    words: options.words || timedWords(transcript, options),
    audio: options.audio || { duration_seconds: 18, rms: 0.065, peak: 0.42 },
    languageProbability: options.languageProbability ?? 0.98,
    recordedDurationMs: options.recordedDurationMs ?? 18000
  });
}

{
  const text = "Nous aurions mieux préparé le voyage et évité beaucoup de stress.";
  const result = assess(text, text);
  assert.ok(result.overall >= 98, `Exact reading should score highly, got ${result.overall}`);
  assert.equal(result.accuracy, 100);
  assert.equal(result.completeness, 100);
  assert.ok(result.quality.speechDurationSeconds < 6, "Initial and final silence must not define speaking pace");
}

{
  const reference = "Il faut qu'ils aient présenté leurs idées.";
  const transcript = "Il faut qu'ils est présenté leur idée.";
  const result = assess(reference, transcript);
  assert.ok(result.aligned.accepted >= 2, "French homophones and silent agreements should be accepted");
  assert.ok(result.overall >= 92, `Phonetically compatible reading should not be punished, got ${result.overall}`);
}

{
  const reference = "À l'oral, je dis souvent : j'sais pas, y'a du bruit, t'as deux minutes ?";
  const transcript = "A l'oral je dis souvent je sais pas il y a du bruit tu as deux minutes";
  const result = assess(reference, transcript);
  assert.ok(result.aligned.accepted >= 3, "Oral contractions split by mobile STT should be aligned as sound variants");
  assert.ok(result.overall >= 90, `Equivalent mobile segmentation should remain fair, got ${result.overall}`);
}

{
  assert.ok(assessment.rhythmScore(193) >= 95, "A professional 193 WPM reading should remain in a natural range");
  assert.equal(assessment.rhythmScore(125), 100);
}

{
  const result = assess("Je parle français clairement.", "Je parle français clairement.", {
    audio: { duration_seconds: 4, rms: 0.0004, peak: 0.004 }
  });
  assert.equal(result.uncertain, true, "A weak signal must be marked as uncertain");
  assert.ok(result.uncertaintyReasons.some((item) => item.reason === "weak_signal"));
  assert.equal(typeof result.overall, "number", "An uncertain attempt must still receive a score");
}

{
  const words = timedWords("bruit incompréhensible", { probability: 0.18 });
  const result = assess("Si la ville avait mieux expliqué le projet, les habitants auraient compris.", "bruit incompréhensible", { words });
  assert.equal(result.uncertain, true, "Low-confidence recognition must be marked as uncertain");
  assert.ok(result.uncertaintyReasons.some((item) => item.reason === "recognition_uncertain"));
  assert.ok(Number.isFinite(result.overall), "Low-confidence recognition must not block progression");
}

{
  const result = assess("Je parle français clairement.", "", { words: [] });
  assert.equal(result.overall, 0, "No recognized speech must produce a transparent zero, not a fabricated score");
  assert.equal(result.uncertain, true);
  assert.ok(result.uncertaintyReasons.some((item) => item.reason === "no_speech"));
}

{
  const result = assess(
    "Si la ville avait mieux expliqué le projet, les habitants auraient compris.",
    "Si la ville avait",
    { probability: 0.94 }
  );
  assert.ok(result.overall < 80, "A clear but genuinely incomplete reading must still receive a lower provisional score");
}

{
  const ready = assessment.calibrationResult({
    text: "Bonjour je teste mon microphone",
    audio: { rms: 0.052, peak: 0.31 },
    words: timedWords("Bonjour je teste mon microphone")
  });
  assert.equal(ready.ok, true);
  const weak = assessment.calibrationResult({
    text: "Bonjour",
    audio: { rms: 0.0002, peak: 0.003 },
    words: timedWords("Bonjour")
  });
  assert.equal(weak.ok, false);
}

{
  const silent = assessment.validateRecordingEvidence({
    transcript: "",
    audio: { duration_seconds: 3.2, rms: 0.0002, peak: 0.003 },
    recordedDurationMs: 3200
  });
  assert.equal(silent.ok, false);
  assert.equal(silent.reason, "weak_signal");

  const empty = assessment.validateRecordingEvidence({
    transcript: "",
    audio: { duration_seconds: 3.2, rms: 0.02, peak: 0.1 },
    recordedDurationMs: 3200
  });
  assert.equal(empty.ok, false);
  assert.equal(empty.reason, "no_speech");

  const useful = assessment.validateRecordingEvidence({
    transcript: "Je me r\u00e9veille \u00e0 six heures trente.",
    audio: { duration_seconds: 2.1, rms: 0.001, peak: 0.008 },
    recordedDurationMs: 2100
  });
  assert.equal(useful.ok, true, "A useful transcript must remain assessable even with a weak signal");
}

{
  const timeFormat = assessment.assess({
    referenceText: "Je me r\u00e9veille \u00e0 six heures trente.",
    transcript: "Je me r\u00e9veille \u00e0 6h30.",
    words: timedWords("Je me r\u00e9veille \u00e0 6h30"),
    audio: { duration_seconds: 1.8, rms: 0.019, peak: 0.086 },
    recordedDurationMs: 1800
  });
  assert.ok(timeFormat.overall >= 95, `Numeric clock transcription should be accepted, got ${timeFormat.overall}`);
  assert.ok(timeFormat.aligned.states.every((state) => state !== "is-missed"), "6h30 must not mark spoken time words as missed");
}

{
  const pages = [
    "prononciation-01d-conditionnel-passe.html",
    "prononciation-02d-hypotheses-irreelles-passe.html",
    "prononciation-03d-subjonctif-passe.html",
    "prononciation-04d-discours-rapporte.html",
    "prononciation-05d-medias-desinformation.html",
    "prononciation-06d-ia-ethique.html",
    "prononciation-07d-justice-sociale.html",
    "prononciation-08d-francais-oral.html",
    "prononciation-09d-precision-syntaxique.html"
  ];
  pages.forEach((name, index) => {
    const html = fs.readFileSync(path.join(ROOT, "frances", "Niveau 8", "ateliers", name), "utf8");
    const assessmentPosition = html.indexOf("french8-pronunciation-assessment.js");
    const activityPosition = html.search(/french8-pronunciation-(?:sections|theme\d{2})\.js/);
    assert.ok(assessmentPosition >= 0, `${name} must load the shared assessment`);
    assert.ok(activityPosition > assessmentPosition, `${name} must load the assessment before its activity script`);
    const shouldSubmit = index < 4 || index === 8;
    assert.equal(html.includes("french8-pronunciation-grade-submit.js"), shouldSubmit, `${name} submission panel scope is incorrect`);
  });
}

{
  const scripts = [
    "french8-pronunciation-sections.js",
    "french8-pronunciation-theme02.js",
    "french8-pronunciation-theme03.js",
    "french8-pronunciation-theme04.js",
    "french8-pronunciation-theme05.js",
    "french8-pronunciation-theme06.js",
    "french8-pronunciation-theme07.js",
    "french8-pronunciation-theme08.js",
    "french8-pronunciation-theme09.js"
  ];
  scripts.forEach((name) => {
    const source = fs.readFileSync(path.join(ROOT, "assets", "js", name), "utf8");
    assert.ok(source.includes("assessment.assess({"), `${name} must use the shared fair assessment`);
    assert.ok(source.includes("payload.words"), `${name} must use recognition confidence and word timings`);
    assert.ok(!source.includes("Math.abs(wpm - 125)"), `${name} still contains the former rigid pace formula`);
    assert.ok(source.includes("uncertaintyMessage"), `${name} must explain an uncertain result`);
    assert.ok(source.includes('nextButton.hidden = false'), `${name} must allow progression after a calculated result`);
    assert.ok(source.includes("Aucun mot n’a été reconnu dans cet essai."), `${name} must score an empty recognition without freezing`);
    assert.ok(!source.includes("Résultat non calculé"), `${name} still blocks doubtful attempts as unscored`);
  });
}

{
  const css = fs.readFileSync(path.join(ROOT, "assets", "css", "french8-pronunciation-mobile.css"), "utf8");
  assert.ok(css.includes("@media(max-width:767.98px)"), "Tablet and mobile layout rules are required");
  assert.ok(css.includes("@media(max-width:374.98px)"), "Narrow phone layout rules are required");
  assert.ok(css.includes(".mic-calibration-button{width:100%"), "Calibration action must fit narrow screens");
  assert.ok(css.includes(".mic-calibration-playback{width:100%"), "Calibration playback must not overflow its container");
  assert.ok(css.includes(".results.is-uncertain"), "Uncertain scores need a visible warning state");
}

{
  const submitSource = fs.readFileSync(path.join(ROOT, "assets", "js", "french8-pronunciation-grade-submit.js"), "utf8");
  assert.ok(submitSource.includes("function scoreForAttempt(attempt)"), "Submission must distinguish no attempt from a real zero score");
  assert.ok(!submitSource.includes("Number(attempt && attempt.overall)"), "A missing final attempt must never become score zero");
  assert.ok(submitSource.includes("attempt.uncertain"), "Submission must warn about uncertain recognition");
}

{
  const liaisonSource = fs.readFileSync(path.join(ROOT, "assets", "js", "french8-pronunciation-liaisons.js"), "utf8");
  const context = { window: { JaraFrench8PronunciationAssessment: assessment } };
  vm.runInNewContext(liaisonSource, context);
  const liaison = context.window.JaraFrench8LiaisonFeedback.analyze({
    evaluationId: "pronunciation03d",
    referenceText: "Il faut qu'ils aient présenté des excuses sans avoir attendu.",
    transcript: "Il faut qu'ils est présenté des excuse sans avoir attendu."
  });
  assert.equal(liaison.advisoryOnly, true, "Liaison feedback must remain advisory and outside the score");
  assert.equal(liaison.confirmed, null, "A transcript must never pretend to confirm an acoustic liaison");
  ["pronunciation05d", "pronunciation06d", "pronunciation07d", "pronunciation08d", "pronunciation09d"].forEach((evaluationId) => {
    const source = ({
      pronunciation05d: "C'est une image. C'est en comparant.",
      pronunciation06d: "Les utilisateurs travaillent sans audit.",
      pronunciation07d: "Les obstacles diminuent grâce à certaines initiatives.",
      pronunciation08d: "C'est ouf, accordez-moi un instant.",
      pronunciation09d: "Les étudiants présentent les arguments."
    })[evaluationId];
    assert.ok(context.window.JaraFrench8LiaisonFeedback.analyze({ evaluationId, referenceText: source, transcript: source }), `${evaluationId} needs advisory liaison coverage`);
  });
}

console.log("French 8 pronunciation assessment tests passed.");
