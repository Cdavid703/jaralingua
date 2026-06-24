const fs = require("fs");
const path = require("path");

const root = path.resolve("frances/Niveau 1");

function extract(file) {
  const html = fs.readFileSync(path.join(root, file), "utf8");
  const marker = '<div class="french-lesson-container">';
  const start = html.indexOf(marker);
  const bodyEnd = html.lastIndexOf("</body>");
  const end = html.lastIndexOf("</div>", bodyEnd);
  if (start < 0 || end < 0) throw new Error(`Container not found: ${file}`);
  return html.slice(start + marker.length, end)
    .replace(/<h1>([\s\S]*?)<\/h1>/, '<h2 class="source-title">$1</h2>')
    .trim();
}

function page({ title, theme, lead, image, content, practice, extraLinks = "" }) {
  return `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="${lead}"><title>${title} | Français Niveau 1</title><link rel="icon" href="/favicon.ico"><link href="../../../assets/vendor/bootstrap/bootstrap.min.css" rel="stylesheet"><link href="../../../assets/vendor/bootstrap-icons/bootstrap-icons.css" rel="stylesheet"><link href="../../../assets/vendor/fonts/jaralingua-fonts.css" rel="stylesheet"><link href="../assets/niveau1.css?v=20260624" rel="stylesheet"></head><body>
<div class="global-course-switcher"><details><summary><span>Navigation</span></summary><nav><a href="../../../index.html">Accueil</a><a href="../../index.html">Français</a><a href="../index.html">Français Niveau 1</a><a href="../themes-du-cours.html">Thèmes</a><a href="../ateliers-activites.html">Ateliers</a></nav></details></div>
<nav class="navbar navbar-expand-lg fixed-top"><div class="container"><a class="navbar-brand" href="../index.html"><img class="brand-logo" src="../../../assets/img/jaralingua-logo.png" alt="JaraLingua"><span>Français · Niveau 1</span></a><button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#menuPrincipal" aria-label="Ouvrir le menu"><span class="navbar-toggler-icon"></span></button><div class="collapse navbar-collapse" id="menuPrincipal"><ul class="navbar-nav ms-auto"><li><a class="nav-link" href="../index.html">Accueil</a></li><li><a class="nav-link active" href="../themes-du-cours.html">Thèmes</a></li><li><a class="nav-link" href="../ateliers-activites.html">Ateliers</a></li><li><a class="nav-link" href="../coin-phonetique.html">Phonétique</a></li></ul></div></div></nav>
<header class="hero lesson-hero" style="--hero-image:url('../img/themes/${image}')"><div class="container"><div class="breadcrumb-row"><a href="../index.html">Accueil</a><span>›</span><a href="../themes-du-cours.html">Thèmes</a><span>›</span><span>${title}</span></div><span class="badge-course">${theme}</span><h1>${title}</h1><p class="hero-text">${lead}</p><div class="d-flex flex-wrap gap-3 mt-4"><a class="btn-main" href="#cours"><i class="bi bi-book-fill"></i> Lire le cours</a><a class="btn-soft" href="${practice}"><i class="bi bi-controller"></i> Pratiquer</a></div></div></header>
<main id="cours"><section><div class="container"><article class="content-card source-lesson">${content}</article>${extraLinks}<article class="content-card mt-4"><div class="row align-items-center g-3"><div class="col-md-8"><p class="section-kicker">Passez à l’action</p><h2 class="mb-2">Le cours complet est terminé</h2><p class="section-text mb-0">Utilisez maintenant les ateliers pour vérifier les formes, le vocabulaire et les accords.</p></div><div class="col-md-4 text-md-end"><a class="btn-main" href="${practice}">Choisir un atelier</a></div></div></article></div></section></main>
<footer class="footer"><div class="container d-flex flex-wrap justify-content-between gap-3"><div><h2 class="h4">${title}</h2><p class="mb-0 opacity-75">Français Niveau 1 · A1.1</p></div><a href="../themes-du-cours.html">← Tous les thèmes</a></div></footer><script src="../../../assets/vendor/bootstrap/bootstrap.bundle.min.js"></script><script src="../assets/niveau1.js?v=20260624"></script></body></html>`;
}

const pages = [
  {
    target: "themes/nombres-dates.html",
    title: "Les nombres et les dates",
    theme: "Thème 1 · Ressource complète",
    lead: "Compter, donner un âge, comprendre un numéro et formuler une date simple en français.",
    image: "theme-01-premiers-contacts.png",
    content: extract("_fuentes/01b-nombres-et-dates.html"),
    practice: "../ateliers/quiz.html?activite=ecoute-nombres-1-100",
  },
  {
    target: "themes/articles-definis.html",
    title: "Les articles définis",
    theme: "Thème 1 · Point de langue",
    lead: "Choisir entre le, la, l’ et les, puis comprendre les contractions les plus fréquentes.",
    image: "theme-01-premiers-contacts.png",
    content: extract("_fuentes/complementos/articles-definis.html"),
    practice: "../ateliers/quiz.html?activite=articles-definis",
  },
  {
    target: "themes/verbes-premier-groupe.html",
    title: "Les verbes du premier groupe",
    theme: "Thème 2",
    lead: "Conjuguer les verbes réguliers en -ER au présent grâce à une formule stable et réutilisable.",
    image: "theme-02-verbes-premier-groupe.png",
    content: extract("_fuentes/02-conjugaison-verbes-premier-groupe.html"),
    practice: "../ateliers-activites.html#theme-2",
  },
  {
    target: "themes/verbes-essentiels.html",
    title: "Être, avoir, aller et faire",
    theme: "Thème 3",
    lead: "Maîtriser les quatre verbes indispensables pour parler de son identité, de ses possessions, de ses déplacements et de ses activités.",
    image: "theme-03-verbes-essentiels.png",
    content: extract("_fuentes/03-etre-avoir-aller-faire.html"),
    practice: "../ateliers-activites.html#theme-3",
  },
  {
    target: "themes/famille-relations.html",
    title: "La famille et les relations",
    theme: "Thème 4",
    lead: "Nommer la famille proche et élargie, présenter ses relations et choisir tous les adjectifs possessifs.",
    image: "theme-04-famille-relations.png",
    content: `${extract("_fuentes/04a-famille-et-relations.html")}<hr class="lesson-divider">${extract("_fuentes/04b-adjectifs-possessifs.html")}`,
    practice: "../ateliers-activites.html#theme-4",
  },
];

for (const item of pages) {
  const output = path.join(root, item.target);
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, page(item), "utf8");
  console.log(item.target);
}
