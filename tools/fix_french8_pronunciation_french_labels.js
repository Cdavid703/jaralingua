const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "..", "assets", "js", "french8-pronunciation-sections.js");
let source = fs.readFileSync(filePath, "utf8");
source = source.replace(
  'stageCounter.textContent = stage.final ? "Reto final" : `Práctica guiada · ${currentStageIndex + 1} de 4`;',
  'stageCounter.textContent = stage.final ? "Défi final" : `Pratique guidée · ${currentStageIndex + 1} sur 4`;'
);
if (!source.includes("Pratique guidée")) throw new Error("French labels were not installed.");
fs.writeFileSync(filePath, source, "utf8");
console.log("French labels installed.");
