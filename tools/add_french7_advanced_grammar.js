const fs = require("fs");
const path = require("path");

const root = process.cwd();
const levelDir = path.join(root, "frances", "Niveau 7");
const grammarDir = path.join(levelDir, "grammaire");
const atelierDir = path.join(levelDir, "ateliers");

function write(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
}

const baseCss = `
    :root{--blue:#1f4e8c;--blue-dark:#15345d;--red:#d62839;--soft:#f4f7fb;--text:#243044;--muted:#718096;--yellow:#f4c95d;--green:#2f9e77;--shadow:0 22px 55px rgba(20,40,80,.13);--radius:28px}
    *{scroll-behavior:smooth}body{margin:0;font-family:"Nunito",sans-serif;color:var(--text);background:var(--soft);overflow-x:hidden}h1,h2,h3,h4,h5,.navbar-brand{font-family:"Montserrat",sans-serif}.navbar{background:rgba(255,255,255,.94);backdrop-filter:blur(16px);box-shadow:0 10px 32px rgba(21,52,93,.08)}.navbar-brand{display:inline-flex;align-items:center;gap:.65rem;font-weight:800;color:var(--blue-dark)}.brand-logo{height:42px}.nav-link{color:var(--text);font-weight:800;border-radius:999px;padding:.55rem .9rem!important}.nav-link:hover,.nav-link.active{color:var(--blue);background:rgba(31,78,140,.08)}
    .hero{padding:8rem 0 5rem;background:radial-gradient(circle at 15% 18%,rgba(214,40,57,.17),transparent 28%),radial-gradient(circle at 85% 12%,rgba(31,78,140,.22),transparent 32%),linear-gradient(135deg,#fff 0%,#eef5ff 46%,#fff0f2 100%);position:relative}.hero:after{content:"";position:absolute;left:0;right:0;bottom:0;height:110px;background:linear-gradient(to bottom,transparent,var(--soft))}.badge-course{display:inline-flex;align-items:center;gap:.55rem;padding:.7rem 1rem;border-radius:999px;background:rgba(255,255,255,.86);border:1px solid rgba(31,78,140,.12);color:var(--blue-dark);font-weight:900;box-shadow:0 14px 30px rgba(31,78,140,.08)}.hero h1{margin-top:1.2rem;font-weight:800;line-height:.98;letter-spacing:-.045em;color:var(--blue-dark);font-size:clamp(2.5rem,6vw,5.3rem)}.hero-lead{color:var(--blue);font-size:clamp(1.15rem,2vw,1.48rem);font-weight:900;margin:1.2rem 0 1rem}.hero-text,.section-text{color:var(--muted);font-size:1.08rem;line-height:1.75;max-width:860px}.hero-card,.panel,.rule-card,.practice-card{border-radius:34px;background:#fff;box-shadow:var(--shadow);overflow:hidden}.hero-card{padding:1rem}.hero-card img{width:100%;min-height:420px;max-height:520px;object-fit:cover;display:block;border-radius:28px}
    .btn-main,.btn-soft{border-radius:999px;font-weight:900;padding:.88rem 1.18rem;text-decoration:none;display:inline-flex;align-items:center;justify-content:center;gap:.45rem}.btn-main{border:0;background:linear-gradient(135deg,var(--blue),var(--blue-dark));color:#fff;box-shadow:0 16px 34px rgba(31,78,140,.24)}.btn-main:hover{color:#fff}.btn-soft{border:2px solid rgba(31,78,140,.2);background:rgba(255,255,255,.78);color:var(--blue-dark)}.btn-soft:hover{border-color:var(--blue);background:var(--blue);color:#fff}
    section{padding:5rem 0}.section-kicker{text-transform:uppercase;color:var(--red);font-weight:900;letter-spacing:.12em;font-size:.82rem}.section-title{color:var(--blue-dark);font-size:clamp(2rem,4vw,3.1rem);font-weight:800;letter-spacing:-.045em}.panel{padding:clamp(1.35rem,3vw,2.4rem)}.rule-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1rem}.rule-card{padding:1.25rem;height:100%;border-left:6px solid rgba(31,78,140,.35)}.rule-card.red{border-left-color:rgba(214,40,57,.65)}.rule-card.gold{border-left-color:var(--yellow)}.rule-card h3{font-size:1.1rem;font-weight:900;color:var(--blue-dark)}.rule-card p{color:var(--muted);line-height:1.65}.formula{border-radius:18px;background:rgba(31,78,140,.07);color:var(--blue-dark);font-weight:900;padding:.9rem 1rem;line-height:1.6}.example{border-left:5px solid var(--yellow);background:#fff;border-radius:18px;padding:.9rem 1rem;color:var(--blue-dark);font-weight:800;line-height:1.6}.practice-card{padding:1.25rem;height:100%}.practice-card h3{font-weight:900;color:var(--blue-dark)}.practice-card p{color:var(--muted);line-height:1.65}.task-list{display:grid;gap:.8rem;margin:0;padding:0;list-style:none}.task-list li{display:flex;gap:.65rem;line-height:1.6}.task-list i{color:var(--red);margin-top:.18rem}footer{background:var(--blue-dark);color:#fff;padding:3rem 0}footer a{color:#fff;text-decoration:none;font-weight:900;opacity:.86}.fade-in{opacity:0;transform:translateY(24px);transition:opacity .7s ease,transform .7s ease}.fade-in.visible{opacity:1;transform:translateY(0)}
    @media(max-width:991px){.hero{padding-top:7rem}.hero-card img{min-height:310px}.rule-grid{grid-template-columns:1fr}}@media(max-width:575px){.btn-main,.btn-soft{width:100%}}
`;

function layout(data, body) {
  return `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${data.title} - Français Niveau 7</title>
  <link rel="icon" href="../../../favicon.ico" sizes="any" />
  <link rel="icon" type="image/png" href="../../../assets/img/favicon.png" />
  <link href="../../../assets/vendor/bootstrap/bootstrap.min.css" rel="stylesheet">
  <link href="../../../assets/vendor/bootstrap-icons/bootstrap-icons.css" rel="stylesheet">
  <link href="../../../assets/vendor/fonts/jaralingua-fonts.css" rel="stylesheet">
  <style>${baseCss}</style>
</head>
<body>
  <nav class="navbar navbar-expand-lg fixed-top"><div class="container"><a class="navbar-brand" href="../index.html"><img class="brand-logo" src="../../../assets/img/jaralingua-logo.png" alt="JaraLingua"><span>Français · Niveau 7</span></a><button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu" aria-controls="navMenu" aria-expanded="false" aria-label="Ouvrir la navigation"><span class="navbar-toggler-icon"></span></button><div class="collapse navbar-collapse" id="navMenu"><ul class="navbar-nav ms-auto gap-lg-2"><li class="nav-item"><a class="nav-link" href="../index.html">Accueil</a></li><li class="nav-item"><a class="nav-link" href="../themes-du-cours.html#grammaire">Grammaire</a></li><li class="nav-item"><a class="nav-link" href="../ateliers-activites.html">Ateliers</a></li><li class="nav-item"><a class="nav-link" href="#atelier">Atelier</a></li></ul></div></div></nav>
  <header class="hero"><div class="container position-relative" style="z-index:2;"><div class="row align-items-center g-5"><div class="col-lg-7 fade-in"><span class="badge-course"><i class="bi ${data.icon}"></i>${data.badge}</span><h1>${data.title}</h1><p class="hero-lead">${data.lead}</p><p class="hero-text">${data.intro}</p><div class="d-flex flex-wrap gap-3 mt-4"><a href="#explication" class="btn-main"><i class="bi bi-compass"></i>Comprendre</a><a href="../ateliers/${data.workshop}" class="btn-soft"><i class="bi bi-ui-checks"></i>Atelier lié</a></div></div><div class="col-lg-5 fade-in"><div class="hero-card"><img src="../img/${data.image}" alt="${data.alt}"></div></div></div></div></header>
  <main>${body}</main>
  <footer><div class="container"><div class="row align-items-center g-4"><div class="col-lg-8"><h2 class="h4 fw-bold mb-2">${data.title}</h2><p class="mb-0 opacity-75">${data.footer}</p></div><div class="col-lg-4 text-lg-end"><a href="../themes-du-cours.html#grammaire"><i class="bi bi-arrow-left"></i> Retour à la grammaire</a></div></div></div></footer>
  <script src="../../../assets/vendor/bootstrap/bootstrap.bundle.min.js"></script><script>const observed=document.querySelectorAll('.fade-in');const observer=new IntersectionObserver((entries)=>{entries.forEach((entry)=>{if(entry.isIntersecting){entry.target.classList.add('visible')}})},{threshold:.16});observed.forEach((element)=>observer.observe(element));</script>
</body></html>`;
}

function grammarPage(data) {
  const rules = data.rules.map((r, i) => `<article class="rule-card ${i === 1 ? "red" : i === 2 ? "gold" : ""}"><h3>${r.title}</h3><p>${r.text}</p><div class="formula">${r.formula}</div></article>`).join("");
  const examples = data.examples.map((e) => `<div class="example mb-3">${e}</div>`).join("");
  const body = `
    <section id="explication"><div class="container"><div class="text-center mb-5 fade-in"><p class="section-kicker">Explication détaillée</p><h2 class="section-title">${data.explainTitle}</h2><p class="section-text mx-auto">${data.explainText}</p></div><div class="rule-grid fade-in">${rules}</div></div></section>
    <section class="bg-white"><div class="container"><div class="row g-5 align-items-start"><div class="col-lg-5 fade-in"><p class="section-kicker">Exemples guidés</p><h2 class="section-title">Observer la forme en contexte</h2><p class="section-text">${data.exampleIntro}</p></div><div class="col-lg-7 fade-in"><div class="panel">${examples}</div></div></div></div></section>
    <section id="atelier"><div class="container"><div class="row g-5 align-items-center"><div class="col-lg-6 fade-in"><p class="section-kicker">Pratique</p><h2 class="section-title">Atelier grammatical lié</h2><p class="section-text">${data.practiceText}</p><a class="btn-main mt-3" href="../ateliers/${data.workshop}"><i class="bi bi-door-open"></i>Ouvrir l'atelier</a></div><div class="col-lg-6 fade-in"><div class="practice-card"><h3>Objectifs de l'atelier</h3><ul class="task-list">${data.tasks.map((t) => `<li><i class="bi bi-check-circle-fill"></i><span>${t}</span></li>`).join("")}</ul></div></div></div></div></section>`;
  return layout(data, body);
}

function workshopPage(data) {
  const cards = data.cards.map((card, i) => `<button class="rule-card ${i === 1 ? "red" : i === 2 ? "gold" : ""}" type="button" onclick="document.getElementById('mission').innerHTML='<strong>${card.title.replace(/'/g, "\\'")}</strong><span>${card.task.replace(/'/g, "\\'")}</span>'"><h3>${card.title}</h3><p>${card.prompt}</p></button>`).join("");
  const body = `
    <section id="explication"><div class="container"><div class="text-center mb-5 fade-in"><p class="section-kicker">Atelier grammatical</p><h2 class="section-title">${data.explainTitle}</h2><p class="section-text mx-auto">${data.explainText}</p></div><div class="rule-grid fade-in">${cards}</div></div></section>
    <section id="atelier" class="bg-white"><div class="container"><div class="row g-5 align-items-start"><div class="col-lg-5 fade-in"><p class="section-kicker">Mission interactive</p><h2 class="section-title">Cliquer, produire, corriger</h2><p class="section-text">${data.interaction}</p><div class="example" id="mission"><strong>Choisissez une carte.</strong><span>La mission apparaîtra ici.</span></div></div><div class="col-lg-7 fade-in"><div class="panel"><h3 class="fw-bold text-primary mb-3">Déroulement en classe</h3><ul class="task-list">${data.steps.map((s) => `<li><i class="bi bi-check-circle-fill"></i><span>${s}</span></li>`).join("")}</ul></div></div></div></div></section>`;
  return layout(data, body);
}

const grammar = [
  {
    slug: "subjonctif-passe",
    title: "Le subjonctif passé",
    badge: "Grammaire avancée · Antériorité subjective",
    icon: "bi-clock-history",
    lead: "Exprimer un jugement, un regret ou un doute sur une action déjà réalisée.",
    intro: "Le subjonctif passé sert à parler d'une action terminée avant le moment du sentiment, du doute, du jugement ou de la nécessité. Il est très utile pour commenter des expériences, des décisions, des erreurs ou des réussites.",
    image: "grammaire-subjonctif-passe.png",
    alt: "Illustration du subjonctif passé avec une ligne du temps et cinq élèves",
    workshop: "atelier-subjonctif-passe.html",
    footer: "Page indépendante de grammaire avancée pour le subjonctif passé.",
    explainTitle: "Quand utiliser le subjonctif passé ?",
    explainText: "On l'utilise après les mêmes déclencheurs que le subjonctif présent, mais l'action exprimée par le verbe subordonné est déjà terminée.",
    rules: [
      { title: "Formation", text: "On conjugue l'auxiliaire avoir ou être au subjonctif présent, puis on ajoute le participe passé.", formula: "que j'aie parlé · que tu sois parti(e)" },
      { title: "Antériorité", text: "L'action au subjonctif passé a lieu avant le jugement ou le sentiment exprimé dans la phrase principale.", formula: "Je suis content que tu aies réussi." },
      { title: "Accord", text: "Avec être, le participe passé s'accorde avec le sujet. Avec avoir, il suit les règles habituelles.", formula: "qu'elle soit arrivée · qu'ils soient partis" }
    ],
    examples: [
      "Je regrette que les étudiants n'aient pas posé plus de questions pendant le débat.",
      "Il est possible que Camila soit déjà partie au Québec avant la réunion.",
      "Nous sommes heureux que le groupe ait présenté une comparaison nuancée.",
      "Bien que Nicolas ait préparé son argument, il doit encore donner un exemple concret."
    ],
    exampleIntro: "Dans ces exemples, le sentiment ou le jugement existe maintenant, mais l'action commentée est déjà finie.",
    practiceText: "L'atelier demande aux élèves de transformer des phrases au subjonctif présent vers le subjonctif passé, puis de commenter des décisions interculturelles.",
    tasks: ["Identifier le déclencheur du subjonctif.", "Choisir avoir ou être au subjonctif présent.", "Former le participe passé et vérifier l'accord.", "Produire une phrase personnelle liée à migration, débat ou adaptation."]
  },
  {
    slug: "conditionnel-passe",
    title: "Le conditionnel passé",
    badge: "Grammaire avancée · Hypothèse non réalisée",
    icon: "bi-signpost-split",
    lead: "Parler de regrets, de reproches et de possibilités qui ne se sont pas réalisées.",
    intro: "Le conditionnel passé permet de commenter ce qui aurait pu se passer autrement. Il est précieux pour analyser un parcours, donner un conseil après coup ou formuler un reproche de manière nuancée.",
    image: "grammaire-conditionnel-passe.png",
    alt: "Illustration du conditionnel passé avec une ligne du temps alternative",
    workshop: "atelier-conditionnel-passe.html",
    footer: "Page indépendante de grammaire avancée pour le conditionnel passé.",
    explainTitle: "À quoi sert le conditionnel passé ?",
    explainText: "Il exprime une action imaginée dans le passé : regret, reproche, hypothèse non réalisée ou information non confirmée.",
    rules: [
      { title: "Formation", text: "On conjugue l'auxiliaire avoir ou être au conditionnel présent, puis on ajoute le participe passé.", formula: "j'aurais parlé · elle serait partie" },
      { title: "Hypothèse non réalisée", text: "Avec si + plus-que-parfait, on imagine un résultat qui n'a pas eu lieu.", formula: "Si j'avais su, j'aurais demandé de l'aide." },
      { title: "Regret ou reproche", text: "Il permet de commenter une décision passée avec nuance.", formula: "Tu aurais dû vérifier le dossier." }
    ],
    examples: [
      "Si Mateo avait préparé ses documents, il aurait obtenu son rendez-vous plus vite.",
      "Valentina serait partie en France si elle avait reçu la bourse.",
      "Vous auriez pu expliquer le problème avec plus de précision.",
      "Les étudiants auraient mieux débattu s'ils avaient utilisé plus de connecteurs."
    ],
    exampleIntro: "Le conditionnel passé ouvre une version alternative du passé : ce qui était possible, souhaitable ou regrettable.",
    practiceText: "L'atelier transforme des situations ratées en phrases de conseil, de regret et d'hypothèse non réalisée.",
    tasks: ["Reconnaître la structure si + plus-que-parfait + conditionnel passé.", "Distinguer regret, reproche et hypothèse.", "Former correctement l'auxiliaire.", "Créer un conseil poli après un problème administratif ou interculturel."]
  },
  {
    slug: "connecteurs-logiques-avances",
    title: "Les connecteurs logiques avancés",
    badge: "Grammaire avancée · Cohérence argumentative",
    icon: "bi-diagram-3",
    lead: "Organiser une pensée complexe avec cause, concession, conséquence, but et nuance.",
    intro: "Les connecteurs avancés permettent de construire un discours clair, académique et nuancé. Ils servent à relier les idées dans un débat, un compte rendu, une lettre formelle ou un dossier comparatif.",
    image: "grammaire-connecteurs-avances.png",
    alt: "Illustration des connecteurs logiques avancés avec cartes d'idées",
    workshop: "atelier-connecteurs-logiques-avances.html",
    footer: "Page indépendante de grammaire avancée pour les connecteurs logiques.",
    explainTitle: "Comment choisir le bon connecteur ?",
    explainText: "Le connecteur dépend de la relation logique entre deux idées : ajouter, opposer, concéder, expliquer une cause, montrer une conséquence ou annoncer un but.",
    rules: [
      { title: "Opposition et concession", text: "On oppose deux idées ou on accepte une limite avant de défendre une thèse.", formula: "cependant · néanmoins · bien que · même si" },
      { title: "Cause et conséquence", text: "On explique pourquoi une situation existe ou ce qu'elle provoque.", formula: "étant donné que · puisque · si bien que · par conséquent" },
      { title: "But et conclusion", text: "On précise l'objectif ou on clôture le raisonnement.", formula: "afin que · pour que · en somme · ainsi" }
    ],
    examples: [
      "Bien que les cultures soient différentes, elles peuvent se rejoindre dans certaines pratiques quotidiennes.",
      "Étant donné que la migration implique une adaptation, il faut que les institutions accompagnent les nouveaux arrivants.",
      "Les réseaux sociaux diffusent rapidement des clichés ; par conséquent, il est nécessaire de vérifier les sources.",
      "En somme, comparer deux cultures exige des exemples précis et une grande prudence."
    ],
    exampleIntro: "Un connecteur ne décore pas la phrase : il indique la relation exacte entre les idées.",
    practiceText: "L'atelier propose une carte argumentative où les élèves doivent déplacer, choisir et justifier les connecteurs les plus pertinents.",
    tasks: ["Classer les connecteurs par fonction logique.", "Choisir un connecteur adapté à un contexte précis.", "Transformer une opinion simple en paragraphe argumenté.", "Corriger les connecteurs mal utilisés dans un débat."]
  }
];

const workshops = [
  {
    slug: "atelier-subjonctif-passe",
    title: "Atelier du subjonctif passé",
    badge: "Atelier · Grammaire avancée",
    icon: "bi-clock-history",
    lead: "Transformer, justifier et commenter des actions déjà terminées.",
    intro: "Cet atelier entraîne les élèves à passer du jugement présent à l'action passée : regretter, douter, se réjouir ou évaluer une décision déjà prise.",
    image: "grammaire-subjonctif-passe.png",
    alt: "Atelier du subjonctif passé",
    workshop: "atelier-subjonctif-passe.html",
    footer: "Atelier grammatical lié au subjonctif passé.",
    explainTitle: "Trois défis pour produire correctement",
    explainText: "Les élèves travaillent en cinq rôles : déclencheur, auxiliaire, accord, contexte et correction finale.",
    interaction: "Chaque carte donne une situation. Les élèves doivent construire une phrase au subjonctif passé, puis expliquer pourquoi l'action est antérieure.",
    cards: [
      { title: "Regret", prompt: "Une décision n'a pas été prise à temps.", task: "Construisez une phrase avec Je regrette que + subjonctif passé." },
      { title: "Doute", prompt: "Une information sur un projet de mobilité n'est pas sûre.", task: "Construisez une phrase avec Je doute que + subjonctif passé." },
      { title: "Satisfaction", prompt: "Un groupe a réussi un débat interculturel.", task: "Construisez une phrase avec Nous sommes heureux que + subjonctif passé." }
    ],
    steps: ["Camila propose le déclencheur.", "Mateo choisit avoir ou être.", "Valentina vérifie le participe passé.", "Nicolas ajoute un contexte interculturel.", "Sofia lit la phrase finale et la classe corrige."]
  },
  {
    slug: "atelier-conditionnel-passe",
    title: "Atelier du conditionnel passé",
    badge: "Atelier · Grammaire avancée",
    icon: "bi-signpost-split",
    lead: "Imaginer un passé différent et formuler des conseils après coup.",
    intro: "Cet atelier travaille l'hypothèse non réalisée, le regret et le reproche poli à partir de situations de voyage, d'études et d'intégration.",
    image: "grammaire-conditionnel-passe.png",
    alt: "Atelier du conditionnel passé",
    workshop: "atelier-conditionnel-passe.html",
    footer: "Atelier grammatical lié au conditionnel passé.",
    explainTitle: "Transformer un problème en hypothèse",
    explainText: "Les élèves partent d'un imprévu et créent une phrase avec si + plus-que-parfait + conditionnel passé.",
    interaction: "Chaque carte oblige le groupe à expliquer ce qui s'est passé, ce qui aurait pu se passer et quel conseil donner maintenant.",
    cards: [
      { title: "Dossier incomplet", prompt: "Un étudiant n'a pas envoyé une pièce importante.", task: "Écrivez : Si l'étudiant avait..., il aurait..." },
      { title: "Débat raté", prompt: "Le groupe n'a pas préparé d'exemples.", task: "Formulez un reproche poli avec aurait dû." },
      { title: "Occasion manquée", prompt: "Une bourse était possible mais la date limite est passée.", task: "Exprimez un regret avec aurait pu ou serait parti(e)." }
    ],
    steps: ["Identifier l'erreur ou l'occasion manquée.", "Écrire la cause au plus-que-parfait.", "Écrire le résultat au conditionnel passé.", "Transformer la phrase en conseil poli.", "Comparer deux versions et choisir la plus naturelle."]
  },
  {
    slug: "atelier-connecteurs-logiques-avances",
    title: "Atelier des connecteurs logiques avancés",
    badge: "Atelier · Grammaire avancée",
    icon: "bi-diagram-3",
    lead: "Construire un paragraphe argumentatif solide et nuancé.",
    intro: "Cet atelier fait travailler la cohérence : les élèves choisissent des connecteurs selon la relation logique entre les idées.",
    image: "grammaire-connecteurs-avances.png",
    alt: "Atelier des connecteurs logiques avancés",
    workshop: "atelier-connecteurs-logiques-avances.html",
    footer: "Atelier grammatical lié aux connecteurs avancés.",
    explainTitle: "Relier les idées sans les mélanger",
    explainText: "Les élèves reçoivent des idées séparées et doivent créer un paragraphe avec opposition, concession, cause, conséquence et conclusion.",
    interaction: "Chaque carte donne une relation logique. Le groupe doit choisir un connecteur, produire une phrase et justifier son choix.",
    cards: [
      { title: "Concession", prompt: "Deux idées semblent contradictoires mais peuvent coexister.", task: "Utilisez bien que, même si ou malgré." },
      { title: "Cause-conséquence", prompt: "Une situation provoque un résultat social ou culturel.", task: "Utilisez étant donné que, si bien que ou par conséquent." },
      { title: "But-conclusion", prompt: "Une action vise un objectif et mène à une synthèse.", task: "Utilisez afin que, pour que, en somme ou ainsi." }
    ],
    steps: ["Classer les connecteurs par fonction.", "Choisir une thèse interculturelle.", "Ajouter au moins trois relations logiques.", "Lire le paragraphe à voix haute.", "La classe remplace un connecteur faible par un connecteur plus précis."]
  }
];

for (const item of grammar) {
  write(path.join(grammarDir, `${item.slug}.html`), grammarPage(item));
}

for (const item of workshops) {
  write(path.join(atelierDir, `${item.slug}.html`), workshopPage(item));
}

const themesPath = path.join(levelDir, "themes-du-cours.html");
let themes = fs.readFileSync(themesPath, "utf8");
themes = themes.replace("Conditionnel présent</span><h3 class=\"h4\">Voyages", "Registre formel</span><h3 class=\"h4\">Voyages");
themes = themes.replace("Conditionnel présent</span><h3 class=\"h4\">Voyages", "Registre formel</span><h3 class=\"h4\">Voyages");
if (!themes.includes('id="grammaire"')) {
  const grammarSection = `<section id="grammaire"><div class="container"><div class="text-center mb-5 fade-in"><p class="section-kicker">Grammaire avancée</p><h2 class="section-title">Boutons grammaticaux indépendants</h2><p class="section-text mx-auto">Ces points ne sont pas des thèmes culturels : ce sont des outils grammaticaux avancés pour enrichir les productions du niveau 7.</p></div><div class="row g-4"><div class="col-md-6 col-xl-4 fade-in"><article class="card theme-card"><div class="theme-image"><img src="img/grammaire-subjonctif-passe.png" alt="Le subjonctif passé"><div class="theme-number">G1</div><i class="bi bi-clock-history theme-icon"></i></div><div class="card-body"><span class="grammar-pill"><i class="bi bi-braces"></i>Antériorité subjective</span><h3 class="h4">Le subjonctif passé</h3><p>Exprimer un jugement, un regret ou un doute sur une action déjà réalisée.</p><a href="grammaire/subjonctif-passe.html" class="btn-main w-100 mb-2">Ouvrir la grammaire</a><a href="ateliers/atelier-subjonctif-passe.html" class="btn-soft w-100">Atelier lié</a></div></article></div><div class="col-md-6 col-xl-4 fade-in"><article class="card theme-card"><div class="theme-image"><img src="img/grammaire-conditionnel-passe.png" alt="Le conditionnel passé"><div class="theme-number">G2</div><i class="bi bi-signpost-split theme-icon"></i></div><div class="card-body"><span class="grammar-pill"><i class="bi bi-braces"></i>Hypothèse non réalisée</span><h3 class="h4">Le conditionnel passé</h3><p>Parler de regrets, de reproches et de possibilités qui ne se sont pas réalisées.</p><a href="grammaire/conditionnel-passe.html" class="btn-main w-100 mb-2">Ouvrir la grammaire</a><a href="ateliers/atelier-conditionnel-passe.html" class="btn-soft w-100">Atelier lié</a></div></article></div><div class="col-md-6 col-xl-4 fade-in"><article class="card theme-card"><div class="theme-image"><img src="img/grammaire-connecteurs-avances.png" alt="Les connecteurs logiques avancés"><div class="theme-number">G3</div><i class="bi bi-diagram-3 theme-icon"></i></div><div class="card-body"><span class="grammar-pill"><i class="bi bi-braces"></i>Cohérence argumentative</span><h3 class="h4">Connecteurs logiques avancés</h3><p>Organiser une pensée complexe avec cause, concession, conséquence, but et nuance.</p><a href="grammaire/connecteurs-logiques-avances.html" class="btn-main w-100 mb-2">Ouvrir la grammaire</a><a href="ateliers/atelier-connecteurs-logiques-avances.html" class="btn-soft w-100">Atelier lié</a></div></article></div></div></div></section>`;
  themes = themes.replace("</main>", `${grammarSection}</main>`);
}
fs.writeFileSync(themesPath, themes, "utf8");

const ateliersPath = path.join(levelDir, "ateliers-activites.html");
let ateliers = fs.readFileSync(ateliersPath, "utf8");
if (!ateliers.includes("Atelier du subjonctif passé")) {
  const extra = `<div class="col-md-6 col-xl-4 fade-in"><article class="workshop-card"><div class="workshop-top"><img class="workshop-image" src="img/grammaire-subjonctif-passe.png" alt="Atelier du subjonctif passé"><div class="workshop-icon"><i class="bi bi-clock-history"></i></div><div class="position-relative" style="z-index:2;"><p class="text-uppercase fw-bold opacity-75 mb-2">Grammaire G1</p><h2 class="fw-bold mb-0">Atelier du subjonctif passé</h2></div></div><div class="workshop-body"><span class="status-pill mb-3"><i class="bi bi-check-circle-fill"></i>Disponible</span><h3 class="h4 fw-bold text-primary mb-3">Atelier du subjonctif passé</h3><p class="section-text">Transformer, justifier et commenter des actions déjà terminées.</p><div class="d-flex flex-wrap gap-3"><a href="ateliers/atelier-subjonctif-passe.html" class="btn-main"><i class="bi bi-door-open"></i>Entrer</a><a href="grammaire/subjonctif-passe.html" class="btn-soft"><i class="bi bi-book"></i>Revoir la théorie</a></div></div></article></div><div class="col-md-6 col-xl-4 fade-in"><article class="workshop-card"><div class="workshop-top"><img class="workshop-image" src="img/grammaire-conditionnel-passe.png" alt="Atelier du conditionnel passé"><div class="workshop-icon"><i class="bi bi-signpost-split"></i></div><div class="position-relative" style="z-index:2;"><p class="text-uppercase fw-bold opacity-75 mb-2">Grammaire G2</p><h2 class="fw-bold mb-0">Atelier du conditionnel passé</h2></div></div><div class="workshop-body"><span class="status-pill mb-3"><i class="bi bi-check-circle-fill"></i>Disponible</span><h3 class="h4 fw-bold text-primary mb-3">Atelier du conditionnel passé</h3><p class="section-text">Imaginer un passé différent et formuler des conseils après coup.</p><div class="d-flex flex-wrap gap-3"><a href="ateliers/atelier-conditionnel-passe.html" class="btn-main"><i class="bi bi-door-open"></i>Entrer</a><a href="grammaire/conditionnel-passe.html" class="btn-soft"><i class="bi bi-book"></i>Revoir la théorie</a></div></div></article></div><div class="col-md-6 col-xl-4 fade-in"><article class="workshop-card"><div class="workshop-top"><img class="workshop-image" src="img/grammaire-connecteurs-avances.png" alt="Atelier des connecteurs logiques avancés"><div class="workshop-icon"><i class="bi bi-diagram-3"></i></div><div class="position-relative" style="z-index:2;"><p class="text-uppercase fw-bold opacity-75 mb-2">Grammaire G3</p><h2 class="fw-bold mb-0">Connecteurs avancés</h2></div></div><div class="workshop-body"><span class="status-pill mb-3"><i class="bi bi-check-circle-fill"></i>Disponible</span><h3 class="h4 fw-bold text-primary mb-3">Atelier des connecteurs logiques avancés</h3><p class="section-text">Construire un paragraphe argumentatif solide et nuancé.</p><div class="d-flex flex-wrap gap-3"><a href="ateliers/atelier-connecteurs-logiques-avances.html" class="btn-main"><i class="bi bi-door-open"></i>Entrer</a><a href="grammaire/connecteurs-logiques-avances.html" class="btn-soft"><i class="bi bi-book"></i>Revoir la théorie</a></div></div></article></div>`;
  ateliers = ateliers.replace("</div></div></section></main>", `${extra}</div></div></section></main>`);
  ateliers = ateliers.replace('<a href="ateliers/reclamation-formelle.html"><b>12</b><span>Réclamation formelle</span></a></div></section>', '<a href="ateliers/reclamation-formelle.html"><b>12</b><span>Réclamation formelle</span></a><a href="ateliers/atelier-subjonctif-passe.html"><b>G1</b><span>Atelier du subjonctif passé</span></a><a href="ateliers/atelier-conditionnel-passe.html"><b>G2</b><span>Atelier du conditionnel passé</span></a><a href="ateliers/atelier-connecteurs-logiques-avances.html"><b>G3</b><span>Connecteurs avancés</span></a></div></section>');
}
fs.writeFileSync(ateliersPath, ateliers, "utf8");

console.log("Advanced French 7 grammar pages and workshops added.");
