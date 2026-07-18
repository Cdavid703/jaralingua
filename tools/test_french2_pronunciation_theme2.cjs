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
    "Je porte une chemise blanche et un pantalon noir.",
    "Je porte une chemise blanche et un pantalon noir."
  );
  assert.strictEqual(result.overall, 100);
  assert.strictEqual(result.uncertain, false);
}

{
  const result = assess(
    "Vous avez cette veste en taille M, s\u2019il vous pla\u00eet ?",
    "vous avez cette veste en taille m s il vous plait"
  );
  assert.ok(result.overall >= 95, `expected apostrophe and accent tolerance, got ${result.overall}`);
  assert.strictEqual(result.uncertain, false);
}

{
  const result = assess(
    "Combien co\u00fbte cette robe rouge ?",
    "",
    { audio: { duration_seconds: 2.8, rms: 0.004, peak: 0.04 } }
  );
  assert.strictEqual(result.overall, 0);
  assert.strictEqual(result.uncertain, true);
  assert.ok(result.uncertaintyReasons.some((item) => item.reason === "no_speech"));
}

{
  const result = assess(
    "Bonjour, je voudrais essayer cette veste bleue. Vous avez la taille M ? Combien \u00e7a co\u00fbte ?",
    "bonjour je voudrais essayer cette veste bleue vous avez la taille m combien ca coute",
    { audio: { duration_seconds: 5.4, rms: 0.001, peak: 0.008 } }
  );
  assert.ok(result.overall >= 90, `expected useful weak-signal transcript to keep score, got ${result.overall}`);
  assert.strictEqual(result.uncertain, true);
  assert.ok(result.uncertaintyReasons.some((item) => item.reason === "weak_signal"));
}

console.log("French 2 pronunciation theme 2 assessment checks passed.");
