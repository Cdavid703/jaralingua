const assert = require("assert");

const assessment = require("../assets/js/french8-pronunciation-assessment.js");

function assess(referenceText, transcript, extra = {}) {
  return assessment.assess(Object.assign({
    referenceText,
    transcript,
    words: [],
    recordedDurationMs: 3000
  }, extra));
}

{
  const result = assess(
    "Je me r\u00e9veille \u00e0 six heures trente.",
    "Je me r\u00e9veille \u00e0 six heures trente."
  );
  assert.strictEqual(result.overall, 100);
  assert.strictEqual(result.uncertain, false);
}

{
  const result = assess(
    "Ensuite, je me douche et je m\u2019habille.",
    "ensuite je me douche et je m habille"
  );
  assert.ok(result.overall >= 95, `expected segmented m'habille to pass, got ${result.overall}`);
  assert.strictEqual(result.uncertain, false);
}

{
  const result = assess(
    "Je me r\u00e9veille \u00e0 six heures trente.",
    "",
    { audio: { duration_seconds: 2.8, rms: 0.004, peak: 0.04 } }
  );
  assert.strictEqual(result.overall, 0);
  assert.strictEqual(result.uncertain, true);
  assert.ok(result.uncertaintyReasons.some((item) => item.reason === "no_speech"));
}

{
  const result = assess(
    "Le soir, je ne me couche jamais tr\u00e8s tard.",
    "le soir je ne me couche jamais tres tard",
    { audio: { duration_seconds: 3.1, rms: 0.001, peak: 0.008 } }
  );
  assert.ok(result.overall >= 90, `expected useful weak-signal transcript to keep score, got ${result.overall}`);
  assert.strictEqual(result.uncertain, true);
  assert.ok(result.uncertaintyReasons.some((item) => item.reason === "weak_signal"));
}

console.log("French 2 pronunciation theme 1 assessment checks passed.");
