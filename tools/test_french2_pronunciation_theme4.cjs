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
    "Bonjour, vous avez une table pour deux personnes ?",
    "Bonjour, vous avez une table pour deux personnes ?"
  );
  assert.strictEqual(result.overall, 100);
  assert.strictEqual(result.uncertain, false);
}

{
  const result = assess(
    "Je voudrais de l'eau et le plat du jour, s'il vous pla\u00eet.",
    "je voudrais de l eau et le plat du jour s il vous plait"
  );
  assert.ok(result.overall >= 95, `expected apostrophe and accent tolerance, got ${result.overall}`);
  assert.strictEqual(result.uncertain, false);
}

{
  const result = assess(
    "J'ai faim, mais je ne mange pas de viande.",
    "",
    { audio: { duration_seconds: 2.8, rms: 0.004, peak: 0.04 } }
  );
  assert.strictEqual(result.overall, 0);
  assert.strictEqual(result.uncertain, true);
  assert.ok(result.uncertaintyReasons.some((item) => item.reason === "no_speech"));
}

{
  const result = assess(
    "Qu'est-ce que vous recommandez ? Je prends de la salade, du pain et de l'eau. C'est copieux.",
    "qu est ce que vous recommandez je prends de la salade du pain et de l eau c est copieux",
    { audio: { duration_seconds: 5.6, rms: 0.001, peak: 0.008 } }
  );
  assert.ok(result.overall >= 90, `expected useful weak-signal transcript to keep score, got ${result.overall}`);
  assert.strictEqual(result.uncertain, true);
  assert.ok(result.uncertaintyReasons.some((item) => item.reason === "weak_signal"));
}

console.log("French 2 pronunciation theme 4 assessment checks passed.");
