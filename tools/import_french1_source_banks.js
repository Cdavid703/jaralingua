const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve("frances/Niveau 1");
const sources = {
  "ecoute-nombres-1-20": ["_fuentes/ateliers/01b-atelier-nombres-1-a-20-audio.html", "questionsData"],
  "articles-definis": ["_fuentes/ateliers/complemento-atelier-articles-definis.html", "questionBank"],
  "verbe-etre": ["_fuentes/ateliers/03a-atelier-etre.html", "questionBank"],
  "verbe-aller": ["_fuentes/ateliers/03b-atelier-aller.html", "questionBank"],
  "verbe-faire": ["_fuentes/ateliers/03c-atelier-faire.html", "questionBank"],
  "famille-relations": ["_fuentes/ateliers/04a-atelier-famille-relations.html", "questionBank"],
  "adjectifs-possessifs": ["_fuentes/ateliers/04b-atelier-adjectifs-possessifs.html", "questionBank"],
};

function extractArray(file, variable) {
  const source = fs.readFileSync(path.join(root, file), "utf8");
  const marker = `const ${variable} = [`;
  const start = source.indexOf(marker);
  if (start < 0) throw new Error(`${variable} not found in ${file}`);
  const arrayStart = source.indexOf("[", start);
  let depth = 0;
  let quote = "";
  let escaped = false;
  for (let i = arrayStart; i < source.length; i += 1) {
    const char = source[i];
    if (escaped) { escaped = false; continue; }
    if (char === "\\") { escaped = true; continue; }
    if (quote) { if (char === quote) quote = ""; continue; }
    if (char === '"' || char === "'" || char === "`") { quote = char; continue; }
    if (char === "[") depth += 1;
    if (char === "]") {
      depth -= 1;
      if (depth === 0) return vm.runInNewContext(`(${source.slice(arrayStart, i + 1)})`);
    }
  }
  throw new Error(`unterminated array in ${file}`);
}

function normalize(key, item) {
  const options = item.options || ["le", "la", "l'", "les"];
  const answerText = item.answer ?? item.correctAnswer ?? item.correct ?? item.correctIndex;
  let answer = Number.isInteger(item.correctIndex) ? item.correctIndex : (Number.isInteger(answerText) ? answerText : options.indexOf(answerText));
  if (answer < 0 && typeof answerText === "number") answer = options.indexOf(String(answerText));
  const rawQuestion = item.question || item.questionText || item.definition || item.text || `${item.sentence_start || ""} ___ ${item.sentence_end || ""}`.trim();
  const question = rawQuestion.replace(/<[^>]+>/g, "");
  let audio = item.audioSrc || item.audio || "";
  if (key === "ecoute-nombres-1-20") {
    const file = audio.split("/").pop();
    const numberByFile = {"trois.mp3":3,"quatre.mp3":4,"sept.mp3":7,"huit.mp3":8,"neuf.mp3":9,"onze.mp3":11,"douze.mp3":12,"quinze.mp3":15,"dix-neuf.mp3":19,"vingt.mp3":20};
    const number = numberByFile[file];
    audio = number ? `../audio/theme-1/nombres-1-100/nombre-${String(number).padStart(3,"0")}.mp3` : "";
  }
  return {
    question,
    options,
    answer,
    explanation: item.explanation || item.hint || `La bonne réponse est ${options[answer]}.`,
    ...(audio ? { audio } : {}),
  };
}

const banks = {};
for (const [key, [file, variable]] of Object.entries(sources)) {
  banks[key] = extractArray(file, variable).map((item) => normalize(key, item));
  for (const item of banks[key]) {
    if (!Number.isInteger(item.answer) || item.answer < 0 || item.answer >= item.options.length) {
      throw new Error(`Invalid answer in ${key}: ${JSON.stringify(item)}`);
    }
  }
}

const q = (question, options, answer, explanation, audio = "") => ({ question, options, answer, explanation, ...(audio ? { audio } : {}) });

banks["verbe-avoir"] = [
  q("J’___ vingt-deux ans.", ["ai","as","a"], 0, "Avec je : j’ai."),
  q("Tu ___ un frère ?", ["a","as","avons"], 1, "Avec tu : tu as."),
  q("Elle ___ les yeux verts.", ["a","as","ont"], 0, "Avec elle : elle a."),
  q("Nous ___ un cours de français.", ["avez","avons","ont"], 1, "Avec nous : nous avons."),
  q("Vous ___ une question ?", ["avez","avons","ont"], 0, "Avec vous : vous avez."),
  q("Ils ___ deux enfants.", ["a","avez","ont"], 2, "Avec ils : ils ont."),
  q("Paul et Lina ___ faim.", ["ont","avons","avez"], 0, "Paul et Lina = ils : ils ont faim."),
  q("Quel âge ___-tu ?", ["a","as","avez"], 1, "La question avec tu utilise as."),
  q("On ___ beaucoup de travail.", ["ai","a","ont"], 1, "On se conjugue comme il ou elle : on a."),
  q("Mes parents ___ une maison.", ["ont","avez","avons"], 0, "Mes parents = ils : ils ont.")
];

banks["conjugaison-er"] = [
  q("Je parl___ français.", ["e","es","ons"], 0, "Avec je : -e."),
  q("Tu regard___ un film.", ["e","es","ez"], 1, "Avec tu : -es."),
  q("Elle habit___ à Cali.", ["e","es","ent"], 0, "Avec elle : -e."),
  q("Nous travaill___ le matin.", ["ons","ez","ent"], 0, "Avec nous : -ons."),
  q("Vous écout___ la radio.", ["ons","ez","ent"], 1, "Avec vous : -ez."),
  q("Ils chant___ très bien.", ["e","es","ent"], 2, "Avec ils : -ent."),
  q("On aim___ la musique.", ["e","ons","ez"], 0, "On se conjugue comme il ou elle : -e."),
  q("Sofia et Lina dans___ ensemble.", ["e","ez","ent"], 2, "Sofia et Lina = elles : -ent."),
  q("Mon frère et moi étudi___ le soir.", ["ons","ez","ent"], 0, "Mon frère et moi = nous : -ons."),
  q("Marc, vous arriv___ à huit heures ?", ["e","ez","ent"], 1, "Avec vous : -ez.")
];

banks["nombres-dates"] = [
  q("Comment écrit-on 18 ?", ["dix-huit","dix-sept","quatre-vingts"], 0, "18 s’écrit dix-huit."),
  q("Quel nombre correspond à quatre-vingts ?", ["40","60","80"], 2, "Quatre-vingts correspond à 80."),
  q("Comment écrit-on 71 ?", ["soixante et onze","soixante-onze","septante et un"], 0, "En français de France : soixante et onze."),
  q("Comment écrit-on 95 ?", ["quatre-vingt-quinze","quatre-vingts-quinze","neuf-cinq"], 0, "95 s’écrit quatre-vingt-quinze."),
  q("Comment dit-on le premier jour du mois ?", ["le un","le premier","la première"], 1, "On dit le premier."),
  q("Quelle date est correcte ?", ["le vingt-trois juin","la vingt-trois juin","au vingt-trois de juin"], 0, "Date simple : le + nombre + mois."),
  q("Quel nombre vient après trente-neuf ?", ["trente-dix","quarante","quatre-vingts"], 1, "Après trente-neuf vient quarante."),
  q("Comment écrit-on 21 ?", ["vingt-un","vingt et un","deux et un"], 1, "21 s’écrit vingt et un."),
  q("Quel nombre porte un s final quand il est seul ?", ["quatre-vingts","quatre-vingt-un","quatre-vingt-dix"], 0, "Quatre-vingts prend un s quand rien ne suit."),
  q("Aujourd’hui, nous sommes ___ 24 juin.", ["la","le","au"], 1, "On emploie le devant une date.")
];

banks["accord-adjectifs"] = [
  q("Sofia est petit___.", ["petit","petite","petits"], 1, "Féminin singulier : petite."),
  q("Ils sont sportif___.", ["sportive","sportifs","sportives"], 1, "Masculin pluriel : sportifs."),
  q("Lina et Ana sont créatif___.", ["créatives","créatifs","créative"], 0, "Féminin pluriel : créatives."),
  q("Paul est heureu___.", ["heureux","heureuse","heureuses"], 0, "Masculin singulier : heureux."),
  q("Marie est travailleur___.", ["travailleur","travailleuse","travailleurs"], 1, "Féminin : travailleuse."),
  q("Mes sœurs sont gentil___.", ["gentil","gentilles","gentils"], 1, "Féminin pluriel : gentilles."),
  q("Cette femme est très sérieu___.", ["sérieuse","sérieux","sérieuses"], 0, "Féminin singulier : sérieuse."),
  q("Luc et Paul sont patient___.", ["patiente","patients","patientes"], 1, "Masculin pluriel : patients."),
  q("Elle a les yeux marron___.", ["marron","marrons","marronnes"], 0, "La couleur marron reste généralement invariable."),
  q("Sofia est beau___.", ["beau","belle","beaux"], 1, "Le féminin de beau est belle.")
];

const output = `window.french1OriginalBanks = ${JSON.stringify(banks, null, 2)};\n`;
fs.writeFileSync(path.join(root, "assets/original-banks.js"), output, "utf8");
for (const [key, items] of Object.entries(banks)) console.log(`${key}: ${items.length}`);
