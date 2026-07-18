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
    "Aujourd'hui, il fait beau et il y a du soleil.",
    "Aujourd'hui, il fait beau et il y a du soleil."
  );
  assert.strictEqual(result.overall, 100);
  assert.strictEqual(result.uncertain, false);
}

{
  const result = assess(
    "Samedi va \u00eatre plus chaud que dimanche.",
    "samedi va etre plus chaud que dimanche"
  );
  assert.ok(result.overall >= 95, `expected accent tolerance, got ${result.overall}`);
  assert.strictEqual(result.uncertain, false);
}

{
  const result = assess(
    "Au printemps, nous allons profiter du beau temps.",
    "",
    { audio: { duration_seconds: 2.8, rms: 0.004, peak: 0.04 } }
  );
  assert.strictEqual(result.overall, 0);
  assert.strictEqual(result.uncertain, true);
  assert.ok(result.uncertaintyReasons.some((item) => item.reason === "no_speech"));
}

{
  const result = assess(
    "Il va pleuvoir dimanche, alors \u00e7a te dit de rester au chaud et de regarder un film ?",
    "il va pleuvoir dimanche alors ca te dit de rester au chaud et de regarder un film",
    { audio: { duration_seconds: 5.6, rms: 0.001, peak: 0.008 } }
  );
  assert.ok(result.overall >= 90, `expected useful weak-signal transcript to keep score, got ${result.overall}`);
  assert.strictEqual(result.uncertain, true);
  assert.ok(result.uncertaintyReasons.some((item) => item.reason === "weak_signal"));
}

console.log("French 2 pronunciation theme 6 assessment checks passed.");
