const fs = require("fs");
const path = require("path");

const root = process.cwd();
const levelDir = path.join(root, "frances", "Niveau 7");

const ateliersPath = path.join(levelDir, "ateliers-activites.html");
let ateliers = fs.readFileSync(ateliersPath, "utf8");
if (!ateliers.includes("<b>G1</b><span>Atelier du subjonctif passé</span>")) {
  ateliers = ateliers.replace(
    "</div></section><main><section id=\"ateliers\">",
    '<a href="ateliers/atelier-subjonctif-passe.html"><b>G1</b><span>Atelier du subjonctif passé</span></a><a href="ateliers/atelier-conditionnel-passe.html"><b>G2</b><span>Atelier du conditionnel passé</span></a><a href="ateliers/atelier-connecteurs-logiques-avances.html"><b>G3</b><span>Connecteurs avancés</span></a></div></section><main><section id="ateliers">'
  );
}
fs.writeFileSync(ateliersPath, ateliers, "utf8");

const themesPath = path.join(levelDir, "themes-du-cours.html");
let themes = fs.readFileSync(themesPath, "utf8");
if (!themes.includes("<b>G</b><span>Grammaire avancée</span>")) {
  themes = themes.replace(
    "</div></section>\n  <main>",
    '<a href="#grammaire"><b>G</b><span>Grammaire avancée</span></a></div></section>\n  <main>'
  );
}
fs.writeFileSync(themesPath, themes, "utf8");

console.log("Grammar quick navigation updated.");
