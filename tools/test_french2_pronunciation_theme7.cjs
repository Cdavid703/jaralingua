const assert = require("assert");

const assessment = require("../assets/js/french8-pronunciation-assessment.js");

function assess(referenceText, transcript, extra = {}) {
  return assessment.assess(Object.assign({
    referenceText,
    transcript,
    words: [],
    recordedDurationMs: 4000
  }, extra));
}

{
  const result = assess(
    "Allez tout droit, puis tournez \u00e0 gauche.",
    "Allez tout droit, puis tournez \u00e0 gauche."
  );
  assert.strictEqual(result.overall, 100);
  assert.strictEqual(result.uncertain, false);
}

{
  const result = assess(
    "Moi, je n'ai plus de batterie et mon GPS ne fonctionne pas.",
    "moi je n ai plus de batterie et mon gps ne fonctionne pas"
  );
  assert.ok(result.overall >= 95, `expected apostrophe and case tolerance, got ${result.overall}`);
  assert.strictEqual(result.uncertain, false);
}

{
  const result = assess(
    "La gare est \u00e0 deux pas, en face de la pharmacie.",
    "",
    { audio: { duration_seconds: 2.8, rms: 0.004, peak: 0.04 } }
  );
  assert.strictEqual(result.overall, 0);
  assert.strictEqual(result.uncertain, true);
  assert.ok(result.uncertaintyReasons.some((item) => item.reason === "no_speech"));
}

{
  const result = assess(
    "Pas de souci, je vais vous donner un coup de main.",
    "pas de souci je vais vous donner un coup de main",
    { audio: { duration_seconds: 3.4, rms: 0.001, peak: 0.008 } }
  );
  assert.ok(result.overall >= 90, `expected useful weak-signal transcript to keep score, got ${result.overall}`);
  assert.strictEqual(result.uncertain, true);
  assert.ok(result.uncertaintyReasons.some((item) => item.reason === "weak_signal"));
}

console.log("French 2 pronunciation theme 7 assessment checks passed.");
