const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "..", "assets", "js", "french8-pronunciation-sections.js");
let source = fs.readFileSync(filePath, "utf8");
source = source.replace(
  '    const missed = referenceWords.filter((_, index) => aligned.states[index] !== "is-correct");',
  '    const displayWords = currentStage().text.split(/\\s+/).map(spokenWord).filter(Boolean);\n    const missed = displayWords.filter((_, index) => aligned.states[index] !== "is-correct");'
);
if (!source.includes("const displayWords = currentStage().text")) throw new Error("Accented feedback words were not installed.");
fs.writeFileSync(filePath, source, "utf8");
console.log("Accents preserved in correction feedback.");
