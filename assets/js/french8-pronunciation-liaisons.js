(function () {
  "use strict";

  const RULES = {
    pronunciation01d: [
      { words: ["nous", "aurions"], label: "nous aurions", hint: "gardez le son /z/ entre nous et aurions" },
      { words: ["aurions", "evite"], label: "aurions evite", hint: "enchainez la fin de aurions avec evite" },
      { words: ["mes", "amis", "auraient"], label: "mes amis auraient", hint: "faites entendre les liaisons en /z/" },
      { words: ["cette", "experience"], label: "cette experience", hint: "enchainez le t de cette avec experience" }
    ],
    pronunciation02d: [
      { words: ["arrive", "a", "l'heure"], label: "arrive a l'heure", hint: "enchainez arrive avec a l'heure" },
      { words: ["cet", "imprevu"], label: "cet imprevu", hint: "gardez le t de cet devant la voyelle" },
      { words: ["de", "l'accident"], label: "de l'accident", hint: "enchainez l'article avec accident" },
      { words: ["decisions", "auraient"], label: "decisions auraient", hint: "liaison possible en /z/ avant auraient" },
      { words: ["nous", "n'en"], label: "nous n'en", hint: "enchainez nous et n'en sans pause" },
      { words: ["pas", "immediatement"], label: "pas immediatement", hint: "liaison possible en /z/ dans une lecture soignee" }
    ],
    pronunciation03d: [
      { words: ["responsables", "aient"], label: "responsables aient", hint: "liaison possible en /z/ avant aient" },
      { words: ["ils", "aient"], label: "ils aient", hint: "faites entendre la liaison en /z/" },
      { words: ["des", "excuses"], label: "des excuses", hint: "faites entendre la liaison en /z/" },
      { words: ["personnes", "aient"], label: "personnes aient", hint: "liaison possible en /z/ avant aient" },
      { words: ["sans", "avoir"], label: "sans avoir", hint: "faites entendre la liaison en /z/" },
      { words: ["elle", "ait"], label: "elle ait", hint: "enchainez les deux mots sans couper la voyelle" }
    ],
    pronunciation04d: [
      { words: ["elle", "a", "explique"], label: "elle a explique", hint: "enchainez elle a sans pause" },
      { words: ["son", "equipe"], label: "son equipe", hint: "gardez la liaison en /n/" },
      { words: ["plusieurs", "associations"], label: "plusieurs associations", hint: "faites entendre la liaison en /z/" },
      { words: ["a", "ajoute"], label: "a ajoute", hint: "enchainez les deux voyelles sans rupture" },
      { words: ["encore", "ecouter"], label: "encore ecouter", hint: "enchainez le r de encore avec ecouter" },
      { words: ["les", "habitants"], label: "les habitants", hint: "habitants a un h muet : liaison en /z/" },
      { words: ["les", "avis"], label: "les avis", hint: "faites entendre la liaison en /z/" },
      { words: ["aient", "ete"], label: "aient ete", hint: "enchainez aient et ete dans le groupe verbal" }
    ]
  };

  function normalize(value) {
    return String(value || "")
      .toLocaleLowerCase("fr-FR")
      .replace(/[\u2019']/g, "'")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/œ/g, "oe")
      .replace(/æ/g, "ae")
      .replace(/[^a-z0-9'-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function tokens(value) {
    return normalize(value).split(" ").filter(Boolean);
  }

  function hasSequence(haystack, needle) {
    if (!needle.length || needle.length > haystack.length) return false;
    for (let index = 0; index <= haystack.length - needle.length; index += 1) {
      if (needle.every((word, offset) => haystack[index + offset] === word)) return true;
    }
    return false;
  }

  function analyze(options) {
    const rules = RULES[options && options.evaluationId] || [];
    if (!rules.length) return null;
    const referenceTokens = tokens(options.referenceText);
    const transcriptTokens = tokens(options.transcript);
    const applicable = rules.filter((rule) => hasSequence(referenceTokens, rule.words));
    if (!applicable.length || !transcriptTokens.length) return null;
    const missed = applicable.filter((rule) => !hasSequence(transcriptTokens, rule.words));
    const confirmed = applicable.length - missed.length;
    const priority = missed.slice(0, 3);
    const message = priority.length
      ? " Liaisons / enchainements a verifier : " + priority.map((rule) => `${rule.label} (${rule.hint})`).join("; ") + ". Cette verification reste approximative, car elle s'appuie sur la transcription."
      : " Liaisons / enchainements : bons indices dans la transcription pour les points attendus. Verification approximative par transcription.";
    return {
      checked: applicable.length,
      confirmed,
      missed: missed.map((rule) => rule.label),
      message
    };
  }

  window.JaraFrench8LiaisonFeedback = { analyze };
})();
