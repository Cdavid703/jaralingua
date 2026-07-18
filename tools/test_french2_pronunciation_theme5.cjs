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
    "J'ai mal \u00e0 la t\u00eate et j'ai mal au ventre.",
    "J'ai mal \u00e0 la t\u00eate et j'ai mal au ventre."
  );
  assert.strictEqual(result.overall, 100);
  assert.strictEqual(result.uncertain, false);
}

{
  const result = assess(
    "Aujourd'hui, je ne suis pas dans mon assiette.",
    "aujourd hui je ne suis pas dans mon assiette"
  );
  assert.ok(result.overall >= 95, `expected apostrophe tolerance, got ${result.overall}`);
  assert.strictEqual(result.uncertain, false);
}

{
  const result = assess(
    "Il faut boire de l'eau et se reposer.",
    "",
    { audio: { duration_seconds: 2.8, rms: 0.004, peak: 0.04 } }
  );
  assert.strictEqual(result.overall, 0);
  assert.strictEqual(result.uncertain, true);
  assert.ok(result.uncertaintyReasons.some((item) => item.reason === "no_speech"));
}

{
  const result = assess(
    "Bonjour, je ne suis pas dans mon assiette. J'ai mal \u00e0 la gorge. Qu'est-ce qu'il faut prendre ?",
    "bonjour je ne suis pas dans mon assiette j ai mal a la gorge qu est ce qu il faut prendre",
    { audio: { duration_seconds: 5.6, rms: 0.001, peak: 0.008 } }
  );
  assert.ok(result.overall >= 90, `expected useful weak-signal transcript to keep score, got ${result.overall}`);
  assert.strictEqual(result.uncertain, true);
  assert.ok(result.uncertaintyReasons.some((item) => item.reason === "weak_signal"));
}

console.log("French 2 pronunciation theme 5 assessment checks passed.");
