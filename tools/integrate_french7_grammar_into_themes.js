const fs = require("fs");
const path = require("path");

const root = process.cwd();
const file = path.join(root, "frances", "Niveau 7", "themes-du-cours.html");
let html = fs.readFileSync(file, "utf8");

const grammarCards = `<div class="col-md-6 col-xl-4 fade-in"><article class="card theme-card"><div class="theme-image"><img src="img/grammaire-subjonctif-passe.png" alt="Le subjonctif passé"><div class="theme-number">06</div><i class="bi bi-clock-history theme-icon"></i></div><div class="card-body"><span class="grammar-pill"><i class="bi bi-braces"></i>Antériorité subjective</span><h3 class="h4">Le subjonctif passé</h3><p>Exprimer un jugement, un regret ou un doute sur une action déjà réalisée.</p><a href="grammaire/subjonctif-passe.html" class="btn-main w-100 mb-2">Ouvrir le thème</a><a href="ateliers/atelier-subjonctif-passe.html" class="btn-soft w-100">Activité liée</a></div></article></div><div class="col-md-6 col-xl-4 fade-in"><article class="card theme-card"><div class="theme-image"><img src="img/grammaire-conditionnel-passe.png" alt="Le conditionnel passé"><div class="theme-number">07</div><i class="bi bi-signpost-split theme-icon"></i></div><div class="card-body"><span class="grammar-pill"><i class="bi bi-braces"></i>Hypothèse non réalisée</span><h3 class="h4">Le conditionnel passé</h3><p>Parler de regrets, de reproches et de possibilités qui ne se sont pas réalisées.</p><a href="grammaire/conditionnel-passe.html" class="btn-main w-100 mb-2">Ouvrir le thème</a><a href="ateliers/atelier-conditionnel-passe.html" class="btn-soft w-100">Activité liée</a></div></article></div><div class="col-md-6 col-xl-4 fade-in"><article class="card theme-card"><div class="theme-image"><img src="img/grammaire-connecteurs-avances.png" alt="Les connecteurs logiques avancés"><div class="theme-number">08</div><i class="bi bi-diagram-3 theme-icon"></i></div><div class="card-body"><span class="grammar-pill"><i class="bi bi-braces"></i>Cohérence argumentative</span><h3 class="h4">Connecteurs logiques avancés</h3><p>Organiser une pensée complexe avec cause, concession, conséquence, but et nuance.</p><a href="grammaire/connecteurs-logiques-avances.html" class="btn-main w-100 mb-2">Ouvrir le thème</a><a href="ateliers/atelier-connecteurs-logiques-avances.html" class="btn-soft w-100">Activité liée</a></div></article></div>`;

html = html
  .replace("Cinq unités reliées par un fil interculturel France-Colombie.", "Thèmes communicatifs et grammaire avancée du Niveau 7.")
  .replace("Chaque thème contient une explication détaillée en français et renvoie vers une ou deux activités interactives. Les connecteurs logiques restent un outil transversal dans les unités, surtout pour argumenter, rapporter et conclure.", "Chaque thème contient une explication détaillée en français et renvoie vers une activité interactive ou un atelier grammatical lié.")
  .replace("<h2>Liste des thèmes</h2><span>Thèmes</span>", "<h2>Liste des thèmes</h2><span>Thèmes et grammaire</span>")
  .replace('<a href="#grammaire"><b>G</b><span>Grammaire avancée</span></a>', '<a href="grammaire/subjonctif-passe.html"><b>06</b><span>Subjonctif passé</span></a><a href="grammaire/conditionnel-passe.html"><b>07</b><span>Conditionnel passé</span></a><a href="grammaire/connecteurs-logiques-avances.html"><b>08</b><span>Connecteurs avancés</span></a>')
  .replace("Les unités du Niveau 7", "Les thèmes du Niveau 7")
  .replace("Le niveau suit la question centrale de la migration colombienne vers des espaces francophones et compare les cultures française et colombienne avec nuance.", "Le niveau combine thèmes communicatifs, culture interculturelle et grammaire avancée. Chaque carte ouvre une page complète et une activité liée.");

const grammarSectionStart = '<section id="grammaire">';
const grammarSectionIndex = html.indexOf(grammarSectionStart);
let sectionToRemove = "";
if (grammarSectionIndex !== -1) {
  const mainClose = html.indexOf("</main>", grammarSectionIndex);
  sectionToRemove = html.slice(grammarSectionIndex, mainClose);
  html = html.slice(0, grammarSectionIndex) + html.slice(mainClose);
}

if (!html.includes("grammaire/subjonctif-passe.html")) {
  html = html.replace("</div></div></section><section class=\"bg-white\">", `${grammarCards}</div></div></section><section class="bg-white">`);
} else if (!html.includes('<div class="theme-number">06</div><i class="bi bi-clock-history theme-icon"></i>')) {
  html = html.replace("</div></div></section><section class=\"bg-white\">", `${grammarCards}</div></div></section><section class="bg-white">`);
}

html = html.replace("Connecteurs logiques dans toutes les unités", "Connecteurs logiques dans tout le niveau");
html = html.replace("Ils ne deviennent pas une unité séparée : ils servent chaque thème.", "Ils apparaissent comme thème grammatical avancé et comme outil transversal dans les productions.");

fs.writeFileSync(file, html, "utf8");
console.log("Advanced grammar integrated into the main themes grid.");
