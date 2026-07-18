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
    "Dans mon appartement, il y a un salon, une cuisine et deux chambres.",
    "Dans mon appartement, il y a un salon, une cuisine et deux chambres."
  );
  assert.strictEqual(result.overall, 100);
  assert.strictEqual(result.uncertain, false);
}

{
  const result = assess(
    "Il n'y a pas de balcon, mais il y a une grande fen\u00eatre.",
    "il n y a pas de balcon mais il y a une grande fenetre"
  );
  assert.ok(result.overall >= 95, `expected apostrophe and accent tolerance, got ${result.overall}`);
  assert.strictEqual(result.uncertain, false);
}

{
  const result = assess(
    "Dans le salon, le canap\u00e9 est devant la table basse.",
    "",
    { audio: { duration_seconds: 2.8, rms: 0.004, peak: 0.04 } }
  );
  assert.strictEqual(result.overall, 0);
  assert.strictEqual(result.uncertain, true);
  assert.ok(result.uncertaintyReasons.some((item) => item.reason === "no_speech"));
}

{
  const result = assess(
    "J'habite dans un petit logement pr\u00e8s de l'universit\u00e9. Il est lumineux et je me sens chez moi.",
    "j habite dans un petit logement pres de l universite il est lumineux et je me sens chez moi",
    { audio: { duration_seconds: 5.8, rms: 0.001, peak: 0.008 } }
  );
  assert.ok(result.overall >= 90, `expected useful weak-signal transcript to keep score, got ${result.overall}`);
  assert.strictEqual(result.uncertain, true);
  assert.ok(result.uncertaintyReasons.some((item) => item.reason === "weak_signal"));
}

console.log("French 2 pronunciation theme 3 assessment checks passed.");
