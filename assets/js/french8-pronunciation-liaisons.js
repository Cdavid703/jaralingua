(function () {
  "use strict";

  const RULES = {
    pronunciation01d: [
      { words: ["nous", "aurions"], label: "nous aurions", hint: "gardez le son /z/ entre nous et aurions" },
      { words: ["aurions", "evite"], label: "aurions évité", hint: "liaison en /z/ possible dans une lecture soignée, jamais obligatoire" },
      { words: ["mes", "amis", "auraient"], label: "mes amis auraient", hint: "faites entendre les liaisons en /z/" },
      { words: ["cette", "experience"], label: "cette experience", hint: "enchainez le t de cette avec experience" }
    ],
    pronunciation02d: [
      { words: ["arrive", "a", "l'heure"], label: "arrive a l'heure", hint: "enchainez arrive avec a l'heure" },
      { words: ["cet", "imprevu"], label: "cet imprevu", hint: "gardez le t de cet devant la voyelle" },
      { words: ["de", "l'accident"], label: "de l'accident", hint: "enchainez l'article avec accident" },
      { words: ["pas", "immediatement"], label: "pas immediatement", hint: "liaison possible en /z/ dans une lecture soignee" }
    ],
    pronunciation03d: [
      { words: ["les", "responsables"], label: "les responsables", hint: "faites entendre la liaison en /z/ entre le déterminant et le nom" },
      { words: ["leurs", "excuses"], label: "leurs excuses", hint: "faites entendre la liaison en /z/" },
      { words: ["sans", "avoir"], label: "sans avoir", hint: "faites entendre la liaison en /z/" },
      { words: ["qu'elle", "ait"], label: "qu’elle ait", hint: "enchaînez le /l/ prononcé de elle avec ait" }
    ],
    pronunciation04d: [
      { words: ["elle", "a", "explique"], label: "elle a explique", hint: "enchaînez le /l/ déjà prononcé de elle avec a" },
      { words: ["son", "equipe"], label: "son equipe", hint: "gardez la liaison en /n/" },
      { words: ["plusieurs", "associations"], label: "plusieurs associations", hint: "faites entendre la liaison en /z/" },
      { words: ["elle", "a", "ajoute"], label: "elle a ajoute", hint: "enchaînez le /l/ déjà prononcé de elle avec a" },
      { words: ["encore", "ecouter"], label: "encore ecouter", hint: "enchaînez le /r/ prononcé de encore avec écouter" },
      { words: ["les", "habitants"], label: "les habitants", hint: "habitants a un h muet : liaison en /z/" },
      { words: ["les", "avis"], label: "les avis", hint: "faites entendre la liaison en /z/" }
    ],
    pronunciation05d: [
      { words: ["c'est", "une"], label: "c'est une", hint: "enchainez le /t/ avec une" },
      { words: ["c'est", "en"], label: "c'est en comparant", hint: "enchainez le /t/ avec en" }
    ],
    pronunciation06d: [
      { words: ["les", "utilisateurs"], label: "les utilisateurs", hint: "faites entendre la liaison en /z/" },
      { words: ["sans", "audit"], label: "sans audit", hint: "faites entendre la liaison en /z/" }
    ],
    pronunciation07d: [
      { words: ["les", "obstacles"], label: "les obstacles", hint: "faites entendre la liaison en /z/" },
      { words: ["certaines", "initiatives"], label: "certaines initiatives", hint: "enchainez le /z/ devant initiatives" }
    ],
    pronunciation08d: [
      { words: ["un", "instant"], label: "un instant", hint: "faites entendre la liaison en /n/" },
      { words: ["c'est", "ouf"], label: "c'est ouf", hint: "enchainez le /t/ avec ouf" }
    ],
    pronunciation09d: [
      { words: ["les", "arguments"], label: "les arguments", hint: "faites entendre la liaison en /z/" },
      { words: ["les", "etudiants"], label: "les étudiants", hint: "faites entendre la liaison en /z/" }
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
      if (needle.every((word, offset) => {
        const candidate = haystack[index + offset];
        if (candidate === word) return true;
        const cost = window.JaraFrench8PronunciationAssessment?.substitutionCost(word, candidate);
        return Number.isFinite(cost) && cost <= 0.45;
      })) return true;
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
    const priority = missed.slice(0, 3);
    const message = priority.length
      ? " Liaisons / enchaînements à réécouter : " + priority.map((rule) => `${rule.label} (${rule.hint})`).join("; ") + ". Ce conseil ne modifie pas la note : seule l'écoute permet de confirmer la liaison."
      : " Les mots des liaisons / enchaînements attendus sont reconnus. Leur réalisation sonore reste à comparer avec le modèle : la transcription seule ne peut pas la confirmer.";
    return {
      checked: applicable.length,
      confirmed: null,
      missed: missed.map((rule) => rule.label),
      advisoryOnly: true,
      message
    };
  }

  window.JaraFrench8LiaisonFeedback = { analyze };
})();
