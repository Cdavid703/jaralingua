const fs = require("fs");
const path = require("path");

const root = process.cwd();
const levelDir = path.join(root, "frances", "Niveau 7");
const themesDir = path.join(levelDir, "themes");
const ateliersDir = path.join(levelDir, "ateliers");

const students = ["Camila", "Mateo", "Valentina", "Nicolas", "Sofia"];

function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
}

function themePage(data) {
  const sections = data.sections.map((section, index) => `
    <section id="${section.id}" class="${index % 2 ? "bg-white" : ""}">
      <div class="container">
        <div class="row g-5 align-items-start">
          <div class="col-lg-5 fade-in">
            <p class="section-kicker">${section.kicker}</p>
            <h2 class="section-title">${section.title}</h2>
            <p class="section-text">${section.text}</p>
          </div>
          <div class="col-lg-7 fade-in">
            <div class="explain-panel">
              ${section.blocks.map((block) => `
                <article class="lesson-block">
                  <div class="icon-box ${block.color || ""}"><i class="bi ${block.icon}"></i></div>
                  <div>
                    <h3>${block.title}</h3>
                    <p>${block.text}</p>
                    ${block.example ? `<div class="example-box">${block.example}</div>` : ""}
                  </div>
                </article>
              `).join("")}
            </div>
          </div>
        </div>
      </div>
    </section>`).join("");

  const workshopLinks = data.workshops.map((workshop) => `
    <a href="../ateliers/${workshop.href}" class="activity-link">
      <span><i class="bi ${workshop.icon}"></i></span>
      <strong>${workshop.title}</strong>
      <em>${workshop.text}</em>
    </a>`).join("");

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
  <style>
    :root { --blue:#1f4e8c; --blue-dark:#15345d; --red:#d62839; --soft:#f4f7fb; --text:#243044; --muted:#718096; --yellow:#f4c95d; --green:#2f9e77; --shadow:0 22px 55px rgba(20,40,80,.13); --radius:28px; }
    * { scroll-behavior:smooth; }
    body { margin:0; font-family:"Nunito",sans-serif; color:var(--text); background:var(--soft); overflow-x:hidden; }
    h1,h2,h3,h4,h5,.navbar-brand { font-family:"Montserrat",sans-serif; }
    .navbar { background:rgba(255,255,255,.94); backdrop-filter:blur(16px); box-shadow:0 10px 32px rgba(21,52,93,.08); }
    .navbar-brand { display:inline-flex; align-items:center; gap:.65rem; font-weight:800; color:var(--blue-dark); }
    .brand-logo { height:42px; width:auto; object-fit:contain; filter:drop-shadow(0 8px 16px rgba(21,52,93,.12)); }
    .nav-link { color:var(--text); font-weight:800; border-radius:999px; padding:.55rem .9rem!important; }
    .nav-link:hover,.nav-link.active { color:var(--blue); background:rgba(31,78,140,.08); }
    .hero { padding:8rem 0 5rem; background:radial-gradient(circle at 15% 18%,rgba(214,40,57,.17),transparent 28%),radial-gradient(circle at 85% 12%,rgba(31,78,140,.22),transparent 32%),linear-gradient(135deg,#fff 0%,#eef5ff 46%,#fff0f2 100%); position:relative; }
    .hero:after { content:""; position:absolute; left:0; right:0; bottom:0; height:110px; background:linear-gradient(to bottom,transparent,var(--soft)); }
    .badge-course { display:inline-flex; align-items:center; gap:.55rem; padding:.7rem 1rem; border-radius:999px; background:rgba(255,255,255,.86); border:1px solid rgba(31,78,140,.12); color:var(--blue-dark); font-weight:900; box-shadow:0 14px 30px rgba(31,78,140,.08); }
    .hero h1 { margin-top:1.2rem; font-weight:800; line-height:.98; letter-spacing:-.045em; color:var(--blue-dark); font-size:clamp(2.55rem,6.2vw,5.55rem); }
    .hero-lead { color:var(--blue); font-size:clamp(1.15rem,2vw,1.5rem); font-weight:900; margin:1.2rem 0 1rem; }
    .hero-text,.section-text { color:var(--muted); font-size:1.08rem; line-height:1.75; max-width:860px; }
    .hero-card,.explain-panel,.focus-panel { border-radius:34px; background:#fff; box-shadow:var(--shadow); overflow:hidden; }
    .hero-card { padding:1rem; }
    .hero-card img { width:100%; min-height:420px; max-height:520px; object-fit:cover; display:block; border-radius:28px; }
    .btn-main,.btn-soft { border-radius:999px; font-weight:900; padding:.88rem 1.18rem; text-decoration:none; display:inline-flex; align-items:center; justify-content:center; gap:.45rem; }
    .btn-main { border:0; background:linear-gradient(135deg,var(--blue),var(--blue-dark)); color:#fff; box-shadow:0 16px 34px rgba(31,78,140,.24); }
    .btn-main:hover { color:#fff; transform:translateY(-2px); }
    .btn-soft { border:2px solid rgba(31,78,140,.2); background:rgba(255,255,255,.78); color:var(--blue-dark); }
    .btn-soft:hover { border-color:var(--blue); background:var(--blue); color:#fff; }
    section { padding:5rem 0; }
    .section-kicker { text-transform:uppercase; color:var(--red); font-weight:900; letter-spacing:.12em; font-size:.82rem; }
    .section-title { color:var(--blue-dark); font-size:clamp(2rem,4vw,3.1rem); font-weight:800; letter-spacing:-.045em; }
    .explain-panel { padding:clamp(1.35rem,3vw,2.4rem); display:grid; gap:1rem; }
    .lesson-block { display:flex; gap:1rem; padding:1rem; border-radius:24px; background:rgba(31,78,140,.055); }
    .lesson-block h3 { color:var(--blue-dark); font-size:1.18rem; font-weight:800; margin-bottom:.35rem; }
    .lesson-block p { color:var(--muted); line-height:1.7; margin:0; }
    .icon-box { width:58px; height:58px; display:grid; place-items:center; border-radius:20px; background:rgba(31,78,140,.1); color:var(--blue); font-size:1.65rem; flex:0 0 auto; }
    .icon-box.red { background:#fff0f3; color:var(--red); } .icon-box.yellow { background:rgba(244,201,93,.22); color:#9a6b00; } .icon-box.green { background:rgba(47,158,119,.14); color:var(--green); }
    .example-box { border-radius:18px; background:#fff; border-left:5px solid var(--yellow); padding:.9rem 1rem; color:var(--blue-dark); font-weight:800; line-height:1.6; margin-top:.8rem; }
    .focus-panel { padding:clamp(1.4rem,3vw,2.4rem); background:linear-gradient(135deg,var(--blue-dark),var(--blue)); color:#fff; position:relative; }
    .focus-panel p { color:rgba(255,255,255,.8); line-height:1.75; }
    .activity-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:1rem; }
    .activity-link { display:grid; gap:.65rem; padding:1.25rem; border-radius:24px; background:#fff; text-decoration:none; color:var(--text); box-shadow:0 14px 38px rgba(20,40,80,.09); min-height:100%; }
    .activity-link span { width:52px; height:52px; border-radius:18px; display:grid; place-items:center; background:rgba(214,40,57,.09); color:var(--red); font-size:1.5rem; }
    .activity-link strong { color:var(--blue-dark); font-size:1.1rem; } .activity-link em { color:var(--muted); font-style:normal; line-height:1.55; }
    footer { background:var(--blue-dark); color:#fff; padding:3rem 0; }
    footer a { color:#fff; text-decoration:none; font-weight:900; opacity:.86; }
    .floating-up { width:48px; height:48px; position:fixed; right:1rem; bottom:1rem; display:none; place-items:center; z-index:1000; border:0; border-radius:50%; background:var(--red); color:#fff; box-shadow:0 12px 28px rgba(214,40,57,.28); }
    .fade-in { opacity:0; transform:translateY(24px); transition:opacity .7s ease,transform .7s ease; } .fade-in.visible { opacity:1; transform:translateY(0); }
    @media (max-width:991px) { .hero{padding-top:7rem}.hero-card img{min-height:310px}.activity-grid{grid-template-columns:1fr} }
    @media (max-width:575px) { .lesson-block{display:block}.icon-box{margin-bottom:.8rem}.btn-main,.btn-soft{width:100%} }
  </style>
</head>
<body>
  <nav class="navbar navbar-expand-lg fixed-top">
    <div class="container">
      <a class="navbar-brand" href="../index.html"><img class="brand-logo" src="../../../assets/img/jaralingua-logo.png" alt="JaraLingua"><span>Français · Niveau 7</span></a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu" aria-controls="navMenu" aria-expanded="false" aria-label="Ouvrir la navigation"><span class="navbar-toggler-icon"></span></button>
      <div class="collapse navbar-collapse" id="navMenu">
        <ul class="navbar-nav ms-auto gap-lg-2">
          <li class="nav-item"><a class="nav-link" href="../index.html">Accueil</a></li>
          <li class="nav-item"><a class="nav-link" href="../themes-du-cours.html">Thèmes</a></li>
          ${data.sections.slice(0, 4).map((s) => `<li class="nav-item"><a class="nav-link" href="#${s.id}">${s.short}</a></li>`).join("")}
          <li class="nav-item"><a class="nav-link" href="#activites">Activités</a></li>
        </ul>
      </div>
    </div>
  </nav>

  <header class="hero">
    <div class="container position-relative" style="z-index:2;">
      <div class="row align-items-center g-5">
        <div class="col-lg-7 fade-in">
          <span class="badge-course"><i class="bi ${data.icon}"></i>${data.badge}</span>
          <h1>${data.title}</h1>
          <p class="hero-lead">${data.lead}</p>
          <p class="hero-text">${data.intro}</p>
          <div class="d-flex flex-wrap gap-3 mt-4">
            <a href="#${data.sections[0].id}" class="btn-main"><i class="bi bi-compass"></i>Commencer</a>
            <a href="../themes-du-cours.html" class="btn-soft"><i class="bi bi-arrow-left"></i>Retour aux thèmes</a>
          </div>
        </div>
        <div class="col-lg-5 fade-in"><div class="hero-card"><img src="../img/${data.image}" alt="${data.alt}"></div></div>
      </div>
    </div>
  </header>

  <main>
    ${sections}
    <section id="activites" class="bg-white">
      <div class="container">
        <div class="row g-5 align-items-center">
          <div class="col-lg-5 fade-in">
            <p class="section-kicker">Pratique liée</p>
            <h2 class="section-title">Activités interactives du thème</h2>
            <p class="section-text">${data.activityIntro}</p>
          </div>
          <div class="col-lg-7 fade-in"><div class="activity-grid">${workshopLinks}</div></div>
        </div>
      </div>
    </section>
  </main>

  <footer>
    <div class="container">
      <div class="row align-items-center g-4">
        <div class="col-lg-8"><h2 class="h4 fw-bold mb-2">${data.title} - Français Niveau 7</h2><p class="mb-0 opacity-75">${data.footer}</p></div>
        <div class="col-lg-4 text-lg-end"><a href="../themes-du-cours.html"><i class="bi bi-arrow-left"></i> Retour aux thèmes</a></div>
      </div>
    </div>
  </footer>
  <button class="floating-up" id="btnUp" aria-label="Retour en haut" onclick="window.scrollTo({top:0,behavior:'smooth'})"><i class="bi bi-arrow-up"></i></button>
  <script src="../../../assets/vendor/bootstrap/bootstrap.bundle.min.js"></script>
  <script>
    const observed=document.querySelectorAll('.fade-in'); const observer=new IntersectionObserver((entries)=>{entries.forEach((entry)=>{if(entry.isIntersecting){entry.target.classList.add('visible')}})},{threshold:.16}); observed.forEach((element)=>observer.observe(element));
    const btnUp=document.getElementById('btnUp'); window.addEventListener('scroll',()=>{btnUp.style.display=window.scrollY>620?'grid':'none'});
    document.querySelectorAll('.nav-link[href^="#"]').forEach((link)=>{link.addEventListener('click',()=>{const nav=document.querySelector('.navbar-collapse'); if(nav.classList.contains('show')) bootstrap.Collapse.getOrCreateInstance(nav).hide();})});
  </script>
</body>
</html>`;
}

function workshopPage(data) {
  const studentCards = students.map((student, index) => `
    <button class="student-card" type="button" data-student="${student}" data-role="${data.roles[index % data.roles.length]}">
      <span>${student.charAt(0)}</span>
      <strong>${student}</strong>
      <em>${data.roles[index % data.roles.length]}</em>
    </button>`).join("");

  const steps = data.steps.map((step, i) => `
    <article class="step-card">
      <span>${String(i + 1).padStart(2, "0")}</span>
      <h3>${step.title}</h3>
      <p>${step.text}</p>
    </article>`).join("");

  const prompts = data.prompts.map((prompt, i) => `
    <button class="prompt-card" type="button" data-prompt="${prompt.replace(/"/g, "&quot;")}">
      <span>${String(i + 1).padStart(2, "0")}</span>${prompt}
    </button>`).join("");

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
  <style>
    :root { --blue:#1f4e8c; --blue-dark:#15345d; --red:#d62839; --soft:#f4f7fb; --text:#243044; --muted:#718096; --yellow:#f4c95d; --green:#2f9e77; --shadow:0 22px 55px rgba(20,40,80,.13); --radius:28px; }
    *{scroll-behavior:smooth} body{margin:0;font-family:"Nunito",sans-serif;color:var(--text);background:var(--soft);overflow-x:hidden} h1,h2,h3,h4,h5,.navbar-brand{font-family:"Montserrat",sans-serif}
    .navbar{background:rgba(255,255,255,.94);backdrop-filter:blur(16px);box-shadow:0 10px 32px rgba(21,52,93,.08)} .navbar-brand{display:inline-flex;align-items:center;gap:.65rem;font-weight:800;color:var(--blue-dark)} .brand-logo{height:42px;width:auto;object-fit:contain}
    .nav-link{color:var(--text);font-weight:800;border-radius:999px;padding:.55rem .9rem!important}.nav-link:hover,.nav-link.active{color:var(--blue);background:rgba(31,78,140,.08)}
    .hero{padding:8rem 0 5rem;background:radial-gradient(circle at 15% 18%,rgba(214,40,57,.17),transparent 28%),radial-gradient(circle at 85% 12%,rgba(31,78,140,.22),transparent 32%),linear-gradient(135deg,#fff 0%,#eef5ff 46%,#fff0f2 100%);position:relative}.hero:after{content:"";position:absolute;left:0;right:0;bottom:0;height:110px;background:linear-gradient(to bottom,transparent,var(--soft))}
    .badge-course{display:inline-flex;align-items:center;gap:.55rem;padding:.7rem 1rem;border-radius:999px;background:rgba(255,255,255,.86);border:1px solid rgba(31,78,140,.12);color:var(--blue-dark);font-weight:900;box-shadow:0 14px 30px rgba(31,78,140,.08)}
    .hero h1{margin-top:1.2rem;font-weight:800;line-height:.98;letter-spacing:-.045em;color:var(--blue-dark);font-size:clamp(2.45rem,6vw,5.35rem)}.hero-lead{color:var(--blue);font-size:clamp(1.15rem,2vw,1.5rem);font-weight:900;margin:1.2rem 0 1rem}.hero-text,.section-text{color:var(--muted);font-size:1.08rem;line-height:1.75;max-width:860px}
    .hero-card,.panel,.output-panel{border-radius:34px;background:#fff;box-shadow:var(--shadow);overflow:hidden}.hero-card{padding:1rem}.hero-card img{width:100%;min-height:420px;max-height:520px;object-fit:cover;display:block;border-radius:28px}
    .btn-main,.btn-soft{border-radius:999px;font-weight:900;padding:.88rem 1.18rem;text-decoration:none;display:inline-flex;align-items:center;justify-content:center;gap:.45rem}.btn-main{border:0;background:linear-gradient(135deg,var(--blue),var(--blue-dark));color:#fff;box-shadow:0 16px 34px rgba(31,78,140,.24)}.btn-main:hover{color:#fff}.btn-soft{border:2px solid rgba(31,78,140,.2);background:rgba(255,255,255,.78);color:var(--blue-dark)}.btn-soft:hover{border-color:var(--blue);background:var(--blue);color:#fff}
    section{padding:5rem 0}.section-kicker{text-transform:uppercase;color:var(--red);font-weight:900;letter-spacing:.12em;font-size:.82rem}.section-title{color:var(--blue-dark);font-size:clamp(2rem,4vw,3.1rem);font-weight:800;letter-spacing:-.045em}
    .step-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1rem}.step-card{background:#fff;border-radius:24px;padding:1.2rem;box-shadow:0 14px 38px rgba(20,40,80,.09);height:100%}.step-card span,.prompt-card span{display:inline-grid;place-items:center;width:42px;height:42px;border-radius:16px;background:rgba(31,78,140,.09);color:var(--blue);font-weight:900;margin-bottom:.8rem}.step-card h3{font-weight:800;color:var(--blue-dark);font-size:1.1rem}.step-card p{color:var(--muted);line-height:1.65;margin:0}
    .panel{padding:clamp(1.35rem,3vw,2.4rem)}.student-grid,.prompt-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:.8rem}.student-card,.prompt-card{border:0;text-align:left;border-radius:22px;background:rgba(31,78,140,.06);padding:1rem;color:var(--text);min-height:100%;transition:transform .2s ease,box-shadow .2s ease}.student-card:hover,.prompt-card:hover,.student-card.active,.prompt-card.active{transform:translateY(-3px);box-shadow:0 18px 34px rgba(20,40,80,.14);background:#fff}.student-card span{display:grid;place-items:center;width:48px;height:48px;border-radius:18px;background:var(--red);color:#fff;font-weight:900;margin-bottom:.8rem}.student-card strong{display:block;color:var(--blue-dark);font-weight:900}.student-card em{font-style:normal;color:var(--muted);line-height:1.45;font-size:.92rem}.prompt-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.prompt-card{font-weight:800;line-height:1.55}
    .output-panel{padding:clamp(1.35rem,3vw,2.4rem);background:linear-gradient(135deg,var(--blue-dark),var(--blue));color:#fff}.output-panel p{color:rgba(255,255,255,.82);line-height:1.75}.mission-box{border-left:6px solid var(--yellow);background:rgba(255,255,255,.12);border-radius:20px;padding:1rem;min-height:130px}.mission-box strong{display:block;font-size:1.15rem;margin-bottom:.5rem}.checklist{display:grid;gap:.8rem;margin:0;padding:0;list-style:none}.checklist li{display:flex;gap:.65rem;line-height:1.6}.checklist i{color:var(--yellow);margin-top:.18rem}
    footer{background:var(--blue-dark);color:#fff;padding:3rem 0}footer a{color:#fff;text-decoration:none;font-weight:900;opacity:.86}.floating-up{width:48px;height:48px;position:fixed;right:1rem;bottom:1rem;display:none;place-items:center;z-index:1000;border:0;border-radius:50%;background:var(--red);color:#fff;box-shadow:0 12px 28px rgba(214,40,57,.28)}
    .fade-in{opacity:0;transform:translateY(24px);transition:opacity .7s ease,transform .7s ease}.fade-in.visible{opacity:1;transform:translateY(0)}
    @media(max-width:991px){.hero{padding-top:7rem}.hero-card img{min-height:310px}.step-grid{grid-template-columns:repeat(2,1fr)}.student-grid{grid-template-columns:repeat(2,1fr)}.prompt-grid{grid-template-columns:1fr}}@media(max-width:575px){.step-grid,.student-grid{grid-template-columns:1fr}.btn-main,.btn-soft{width:100%}}
  </style>
</head>
<body>
  <nav class="navbar navbar-expand-lg fixed-top">
    <div class="container">
      <a class="navbar-brand" href="../index.html"><img class="brand-logo" src="../../../assets/img/jaralingua-logo.png" alt="JaraLingua"><span>Français · Niveau 7</span></a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu" aria-controls="navMenu" aria-expanded="false" aria-label="Ouvrir la navigation"><span class="navbar-toggler-icon"></span></button>
      <div class="collapse navbar-collapse" id="navMenu"><ul class="navbar-nav ms-auto gap-lg-2"><li class="nav-item"><a class="nav-link" href="../index.html">Accueil</a></li><li class="nav-item"><a class="nav-link" href="../ateliers-activites.html">Ateliers</a></li><li class="nav-item"><a class="nav-link" href="../themes/${data.themeHref}">Thème lié</a></li><li class="nav-item"><a class="nav-link" href="#atelier">Atelier</a></li></ul></div>
    </div>
  </nav>
  <header class="hero">
    <div class="container position-relative" style="z-index:2;"><div class="row align-items-center g-5"><div class="col-lg-7 fade-in"><span class="badge-course"><i class="bi ${data.icon}"></i>${data.badge}</span><h1>${data.title}</h1><p class="hero-lead">${data.lead}</p><p class="hero-text">${data.intro}</p><div class="d-flex flex-wrap gap-3 mt-4"><a href="#atelier" class="btn-main"><i class="bi bi-play-circle"></i>Lancer l'activité</a><a href="../themes/${data.themeHref}" class="btn-soft"><i class="bi bi-book"></i>Revoir le thème</a></div></div><div class="col-lg-5 fade-in"><div class="hero-card"><img src="../img/${data.image}" alt="${data.alt}"></div></div></div></div>
  </header>
  <main>
    <section id="preparation"><div class="container"><div class="text-center mb-5 fade-in"><p class="section-kicker">Déroulement</p><h2 class="section-title">Une activité en plusieurs temps</h2><p class="section-text mx-auto">${data.preparation}</p></div><div class="step-grid">${steps}</div></div></section>
    <section id="atelier" class="bg-white"><div class="container"><div class="row g-5 align-items-start"><div class="col-lg-5 fade-in"><p class="section-kicker">Interaction entre 5 élèves</p><h2 class="section-title">Choisir un rôle et une mission</h2><p class="section-text">${data.interaction}</p><div class="student-grid mt-4">${studentCards}</div></div><div class="col-lg-7 fade-in"><div class="panel"><h3 class="fw-bold text-primary mb-3">Cartes de situation</h3><div class="prompt-grid">${prompts}</div></div></div></div></div></section>
    <section id="production"><div class="container"><div class="output-panel fade-in"><div class="row g-4 align-items-start"><div class="col-lg-5"><p class="text-uppercase fw-bold opacity-75 mb-2">Mission générée</p><h2 class="fw-bold mb-3">Combiner rôle + situation</h2><p>Chaque clic prépare une tâche orale ou écrite différente. Les élèves doivent produire en français, se répondre, se corriger et réutiliser les structures du thème.</p><div class="mission-box" id="missionBox"><strong>Choisissez un élève et une carte.</strong><span>La consigne apparaîtra ici.</span></div></div><div class="col-lg-7"><h3 class="fw-bold mb-3">Critères de réussite</h3><ul class="checklist">${data.criteria.map((c) => `<li><i class="bi bi-check-circle-fill"></i><span>${c}</span></li>`).join("")}</ul></div></div></div></div></section>
  </main>
  <footer><div class="container"><div class="row align-items-center g-4"><div class="col-lg-8"><h2 class="h4 fw-bold mb-2">${data.title}</h2><p class="mb-0 opacity-75">${data.footer}</p></div><div class="col-lg-4 text-lg-end"><a href="../ateliers-activites.html"><i class="bi bi-arrow-left"></i> Retour aux ateliers</a></div></div></div></footer>
  <button class="floating-up" id="btnUp" aria-label="Retour en haut" onclick="window.scrollTo({top:0,behavior:'smooth'})"><i class="bi bi-arrow-up"></i></button>
  <script src="../../../assets/vendor/bootstrap/bootstrap.bundle.min.js"></script>
  <script>
    const observed=document.querySelectorAll('.fade-in'); const observer=new IntersectionObserver((entries)=>{entries.forEach((entry)=>{if(entry.isIntersecting){entry.target.classList.add('visible')}})},{threshold:.16}); observed.forEach((element)=>observer.observe(element));
    const btnUp=document.getElementById('btnUp'); window.addEventListener('scroll',()=>{btnUp.style.display=window.scrollY>620?'grid':'none'});
    let selectedStudent=""; let selectedRole=""; let selectedPrompt="";
    const box=document.getElementById('missionBox');
    function updateMission(){ if(!selectedStudent || !selectedPrompt){return;} box.innerHTML='<strong>'+selectedStudent+' - '+selectedRole+'</strong><span>'+selectedPrompt+' ${data.missionSuffix}</span>'; }
    document.querySelectorAll('.student-card').forEach((card)=>card.addEventListener('click',()=>{document.querySelectorAll('.student-card').forEach((c)=>c.classList.remove('active'));card.classList.add('active');selectedStudent=card.dataset.student;selectedRole=card.dataset.role;updateMission();}));
    document.querySelectorAll('.prompt-card').forEach((card)=>card.addEventListener('click',()=>{document.querySelectorAll('.prompt-card').forEach((c)=>c.classList.remove('active'));card.classList.add('active');selectedPrompt=card.dataset.prompt;updateMission();}));
  </script>
</body>
</html>`;
}

const themeData = [
  {
    file: "recit-litteraire.html",
    title: "Le récit littéraire",
    badge: "Unité 2 · Récits et cultures",
    icon: "bi-book-half",
    lead: "Lire, raconter et transformer des histoires françaises et colombiennes.",
    intro: "Cette unité relie le conte, la légende, l'anecdote culturelle et le récit historique. Les élèves apprennent à distinguer les actions principales, les descriptions et les valeurs culturelles que transmet une histoire.",
    image: "theme-recit-litteraire.jpg",
    alt: "Illustration du récit littéraire et des histoires interculturelles",
    activityIntro: "Les activités invitent les cinq élèves à reconstruire, interpréter et raconter une même histoire depuis plusieurs perspectives.",
    footer: "Unité centrée sur le récit, le passé simple en réception et la comparaison de valeurs culturelles.",
    workshops: [
      { href: "puzzle-narratif.html", title: "Puzzle narratif interculturel", text: "Reconstituer un conte français et une légende colombienne, puis justifier l'ordre du récit.", icon: "bi-puzzle-fill" },
      { href: "recit-deux-voix.html", title: "Récit à deux voix", text: "Raconter le même événement depuis une voix française et une voix colombienne.", icon: "bi-chat-left-quote-fill" },
      { href: "passe-simple.html", title: "Atelier grammaire : passé simple", text: "Identifier les formes du récit écrit avant de passer à la production orale.", icon: "bi-braces" }
    ],
    sections: [
      { id: "reperes", short: "Repères", kicker: "Lecture littéraire", title: "Comprendre ce qu'un récit fait avancer", text: "Un récit littéraire n'est pas seulement une suite d'actions. Il installe un décor, crée une attente, fait apparaître un conflit et donne une signification à la fin.", blocks: [
        { icon: "bi-map", title: "La situation initiale", text: "Elle présente le lieu, le temps, les personnages et l'atmosphère. On y trouve souvent l'imparfait pour décrire.", example: "La ville était silencieuse et les habitants attendaient la fête." },
        { icon: "bi-lightning-charge", color: "red", title: "L'événement déclencheur", text: "Il change la situation et oblige les personnages à agir. Dans un texte écrit, il apparaît souvent au passé simple.", example: "Soudain, une lettre arriva et tout le village se réunit." },
        { icon: "bi-signpost-split", color: "yellow", title: "Les péripéties", text: "Ce sont les actions qui construisent le parcours du héros ou du témoin. Elles révèlent les valeurs du groupe." }
      ]},
      { id: "temps", short: "Temps", kicker: "Grammaire du récit", title: "Passé simple et imparfait", text: "L'imparfait donne le décor, les habitudes et les descriptions. Le passé simple met au premier plan les actions terminées qui font progresser l'histoire.", blocks: [
        { icon: "bi-braces", title: "Imparfait = arrière-plan", text: "On l'utilise pour ce qui durait, se répétait ou décrivait le contexte.", example: "Les familles préparaient le repas et les enfants jouaient dehors." },
        { icon: "bi-arrow-right-circle", color: "red", title: "Passé simple = action principale", text: "On l'utilise dans les récits écrits pour les actions ponctuelles.", example: "Le voyageur entra, salua la famille et raconta son aventure." },
        { icon: "bi-arrow-left-right", color: "green", title: "Transformation vers l'oral", text: "Pour raconter naturellement à l'oral, on transforme souvent le passé simple en passé composé." }
      ]},
      { id: "culture", short: "Culture", kicker: "Regards croisés", title: "Comparer les valeurs d'une histoire", text: "Un conte ou une légende transmet des idées sur la famille, le courage, la ruse, la nature, l'hospitalité ou la justice. La comparaison doit rester précise.", blocks: [
        { icon: "bi-globe-americas", title: "Repérer une valeur", text: "Les élèves cherchent ce que l'histoire valorise : aider l'autre, respecter les anciens, protéger la nature ou tenir sa parole." },
        { icon: "bi-search", color: "yellow", title: "Justifier avec une scène", text: "Chaque interprétation doit s'appuyer sur une scène concrète du récit." },
        { icon: "bi-chat-dots", color: "green", title: "Nuancer", text: "On évite de dire qu'une culture est toujours comme ceci ou comme cela. On dit plutôt : dans cette histoire, on observe que..." }
      ]}
    ]
  },
  {
    file: "societe-actualite.html",
    title: "Société et actualité",
    badge: "Unité 3 · Médias et représentations",
    icon: "bi-newspaper",
    lead: "Analyser des faits sociaux et rapporter la parole des autres.",
    intro: "Cette unité entraîne les élèves à comprendre un fait d'actualité, à distinguer information et opinion, puis à restituer des paroles avec le discours indirect.",
    image: "theme-societe-actualite.jpg",
    alt: "Étudiants analysant l'actualité et les sujets de société",
    activityIntro: "Les activités transforment la classe en rédaction interculturelle : les élèves enquêtent, rapportent des paroles et préparent un bulletin d'actualité.",
    footer: "Unité centrée sur l'actualité, les médias, les représentations et le discours indirect.",
    workshops: [
      { href: "journal-televise-interculturel.html", title: "Journal télévisé interculturel", text: "Créer une émission courte sur un phénomène social français ou colombien.", icon: "bi-camera-video-fill" },
      { href: "entretien-rapporte.html", title: "Entretien rapporté", text: "Interviewer un migrant fictif puis restituer ses réponses au discours indirect.", icon: "bi-mic-fill" }
    ],
    sections: [
      { id: "analyser", short: "Analyser", kicker: "Lecture critique", title: "Comprendre un fait social", text: "Un fait social concerne une habitude, une règle, une tension ou une représentation partagée dans une société. Pour l'analyser, il faut identifier qui est concerné, où cela se passe et pourquoi le sujet provoque une discussion.", blocks: [
        { icon: "bi-question-circle", title: "Qui parle ?", text: "Identifier la source : journaliste, témoin, institution, étudiant, migrant, expert ou internaute." },
        { icon: "bi-bullseye", color: "red", title: "Quel est le problème ?", text: "Formuler la question centrale en une phrase claire.", example: "Les réseaux sociaux rapprochent-ils les cultures ou renforcent-ils les stéréotypes ?" },
        { icon: "bi-sliders", color: "yellow", title: "Quelle nuance ?", text: "Chercher les limites : région, génération, contexte social, expérience personnelle." }
      ]},
      { id: "discours", short: "Discours", kicker: "Point de langue", title: "Le discours indirect", text: "Le discours indirect sert à rapporter les paroles de quelqu'un sans répéter exactement ses mots. Il est essentiel pour un compte rendu, une enquête ou un journal télévisé.", blocks: [
        { icon: "bi-chat-left-text", title: "Au présent", text: "Quand le verbe introducteur est au présent, le temps du message reste souvent stable.", example: "Camila affirme que la politesse varie selon les contextes." },
        { icon: "bi-clock-history", color: "red", title: "Au passé", text: "Quand le verbe introducteur est au passé, on adapte souvent les temps et les repères.", example: "Mateo a expliqué qu'il avait découvert une autre manière de communiquer." },
        { icon: "bi-arrow-left-right", color: "green", title: "Transformer les pronoms", text: "Je devient il ou elle, nous devient ils ou elles, mon devient son, ici devient là-bas selon le contexte." }
      ]},
      { id: "medias", short: "Médias", kicker: "Production", title: "Présenter une information avec prudence", text: "Dans un bulletin d'actualité, les élèves doivent éviter les généralisations et séparer les faits, les témoignages et les interprétations.", blocks: [
        { icon: "bi-newspaper", title: "Fait", text: "Une information vérifiable : date, lieu, personne, chiffre ou événement." },
        { icon: "bi-person-lines-fill", color: "yellow", title: "Témoignage", text: "Une parole située : quelqu'un raconte ce qu'il a vécu ou observé." },
        { icon: "bi-lightbulb", color: "green", title: "Analyse", text: "Une explication possible, toujours formulée avec nuance." }
      ]}
    ]
  },
  {
    file: "experiences-projets.html",
    title: "Expériences et projets",
    badge: "Unité 4 · Parcours et mobilité",
    icon: "bi-briefcase-fill",
    lead: "Raconter un parcours, expliquer un choix et imaginer une mobilité.",
    intro: "Cette unité aide les élèves à parler d'expériences marquantes, de rêves professionnels, de projets d'études ou de travail, et à organiser un récit avec l'antériorité.",
    image: "theme-experiences-projets.jpg",
    alt: "Étudiants préparant des expériences et projets personnels",
    activityIntro: "Les activités mettent les élèves en mouvement : construire une ligne de vie fictive, puis échanger rapidement sur des projets d'études, de travail et d'adaptation.",
    footer: "Unité centrée sur le parcours personnel, les projets et le plus-que-parfait.",
    workshops: [
      { href: "ligne-vie-interculturelle.html", title: "Ligne de vie interculturelle", text: "Créer le parcours d'un Colombien en France ou d'un Français en Colombie.", icon: "bi-diagram-3-fill" },
      { href: "speed-dating-projets.html", title: "Speed-dating des projets", text: "Échanger en rotations courtes sur études, travail, voyage et adaptation.", icon: "bi-people-fill" }
    ],
    sections: [
      { id: "parcours", short: "Parcours", kicker: "Expression personnelle", title: "Présenter une expérience marquante", text: "Raconter une expérience demande plus que donner une date. Il faut expliquer le contexte, l'événement, la réaction personnelle et ce que cette expérience a changé.", blocks: [
        { icon: "bi-calendar-event", title: "Contexte", text: "Où étiez-vous ? Pourquoi étiez-vous là ? Qui participait ?" },
        { icon: "bi-stars", color: "red", title: "Moment clé", text: "Quel événement a changé la situation ou votre regard ?" },
        { icon: "bi-arrow-up-right-circle", color: "green", title: "Conséquence", text: "Qu'avez-vous appris ? Quel projet est né après cette expérience ?" }
      ]},
      { id: "plus-que-parfait", short: "Plus-que-parfait", kicker: "Point de langue", title: "Exprimer l'antériorité", text: "Le plus-que-parfait montre qu'une action s'est passée avant une autre action passée. Il permet de donner de la profondeur à un récit.", blocks: [
        { icon: "bi-braces", title: "Formation", text: "Imparfait de avoir ou être + participe passé.", example: "J'avais préparé mon dossier avant de partir." },
        { icon: "bi-clock-history", color: "red", title: "Action antérieure", text: "Il explique ce qui était déjà arrivé avant le moment principal.", example: "Elle était arrivée au Québec parce qu'elle avait obtenu une bourse." },
        { icon: "bi-link-45deg", color: "yellow", title: "Connecter les étapes", text: "On l'utilise avec déjà, avant, parce que, comme, lorsque, après que." }
      ]},
      { id: "projets", short: "Projets", kicker: "Mobilité", title: "Parler de projets réalistes", text: "Un projet de mobilité peut concerner les études, le travail, la famille, la langue ou la curiosité culturelle. Les élèves doivent expliquer motivations, obstacles et solutions.", blocks: [
        { icon: "bi-mortarboard", title: "Études", text: "Demander une bourse, choisir une université, préparer un dossier." },
        { icon: "bi-briefcase", color: "green", title: "Travail", text: "Présenter ses compétences, chercher un stage, s'adapter à un nouveau contexte professionnel." },
        { icon: "bi-house-heart", color: "yellow", title: "Adaptation", text: "Trouver un logement, créer un réseau, comprendre les habitudes quotidiennes." }
      ]}
    ]
  },
  {
    file: "voyages-imprevus.html",
    title: "Voyages et imprévus",
    badge: "Unité 5 · Solutions et réclamations",
    icon: "bi-airplane-fill",
    lead: "Demander de l'aide, formuler une réclamation et proposer des solutions.",
    intro: "Cette unité prépare les élèves à gérer des situations inattendues dans un pays francophone : documents perdus, problème de visa, logement, transport, université ou administration.",
    image: "theme-voyages-imprevus.jpg",
    alt: "Situation de voyage et d'imprévus pour pratiquer le conditionnel",
    activityIntro: "Les activités simulent des situations réelles où les élèves doivent rester polis, précis et efficaces malgré le stress.",
    footer: "Unité centrée sur les imprévus, le conditionnel présent, l'hypothèse et la réclamation formelle.",
    workshops: [
      { href: "simulation-consulaire.html", title: "Simulation consulaire", text: "Résoudre un problème de passeport, visa, inscription ou billet.", icon: "bi-building-fill-check" },
      { href: "reclamation-formelle.html", title: "Réclamation formelle", text: "Écrire et jouer une demande polie auprès d'un hôtel, d'une compagnie ou d'une université.", icon: "bi-envelope-exclamation-fill" }
    ],
    sections: [
      { id: "situations", short: "Situations", kicker: "Communication pratique", title: "Réagir à un imprévu", text: "Un imprévu demande une réaction claire : expliquer le problème, donner les informations nécessaires, demander une solution et remercier.", blocks: [
        { icon: "bi-exclamation-triangle", title: "Nommer le problème", text: "J'ai perdu mon passeport, mon vol a été annulé, mon inscription n'apparaît pas dans le système." },
        { icon: "bi-card-list", color: "yellow", title: "Donner les détails", text: "Date, lieu, numéro de dossier, personne contactée, preuve disponible." },
        { icon: "bi-life-preserver", color: "green", title: "Demander une solution", text: "Pourriez-vous m'indiquer la procédure ? Serait-il possible de recevoir une attestation ?" }
      ]},
      { id: "conditionnel", short: "Conditionnel", kicker: "Point de langue", title: "Le conditionnel présent", text: "Le conditionnel permet de formuler une demande polie, un conseil, une hypothèse ou une proposition. Il rend la communication plus diplomatique.", blocks: [
        { icon: "bi-chat-square-heart", title: "Politesse", text: "Je voudrais, pourriez-vous, serait-il possible de, j'aimerais savoir si." },
        { icon: "bi-lightbulb", color: "yellow", title: "Conseil", text: "Vous devriez contacter le consulat. Il faudrait envoyer une copie du document." },
        { icon: "bi-signpost-split", color: "red", title: "Hypothèse", text: "Si j'avais plus de temps, je prendrais rendez-vous directement.", example: "Si + imparfait + conditionnel présent" }
      ]},
      { id: "registre", short: "Registre", kicker: "Écrit formel", title: "Construire une réclamation", text: "Une réclamation efficace reste polie, précise et structurée. Elle ne se limite pas à se plaindre : elle demande une réparation réaliste.", blocks: [
        { icon: "bi-envelope", title: "Objet clair", text: "Réclamation concernant une réservation, un billet, une inscription ou un service." },
        { icon: "bi-file-earmark-text", color: "green", title: "Corps du message", text: "Présentation, problème, preuves, demande, formule de politesse." },
        { icon: "bi-check2-circle", color: "yellow", title: "Solution attendue", text: "Remboursement, correction, attestation, nouveau rendez-vous, réponse écrite." }
      ]}
    ]
  }
];

const workshopData = [
  { file:"puzzle-narratif.html", title:"Puzzle narratif interculturel", badge:"Unité 2 · Activité orale et lecture", icon:"bi-puzzle-fill", lead:"Reconstruire une histoire et défendre l'ordre du récit.", intro:"Les élèves reçoivent des fragments d'un conte français et d'une légende colombienne. Ils doivent reconstruire l'ordre, identifier les actions principales et expliquer les valeurs culturelles observées.", image:"theme-recit-litteraire.jpg", alt:"Puzzle narratif interculturel", themeHref:"recit-litteraire.html", preparation:"Cette activité développe la compréhension écrite, l'argumentation et le vocabulaire du récit sans utiliser d'audio.", interaction:"Chaque élève reçoit un rôle : gardien du temps, lecteur, détective des verbes, médiateur culturel ou rapporteur.", roles:["gardien du temps","lectrice du fragment","détective des verbes","médiateur culturel","rapporteuse finale"], steps:[{title:"Distribuer",text:"Chaque élève lit un fragment et souligne les indices temporels."},{title:"Négocier",text:"Le groupe propose un ordre et justifie chaque position."},{title:"Comparer",text:"Les élèves comparent les valeurs du récit français et colombien."},{title:"Restituer",text:"Le rapporteur présente l'histoire reconstruite en 90 secondes."}], prompts:["Un fragment contient une action au passé simple qui change toute l'histoire.","Deux fragments décrivent l'atmosphère : ils ne doivent pas être placés trop tard.","Un personnage prend une décision qui révèle une valeur culturelle.","La fin contient une morale implicite que le groupe doit formuler.","Un fragment peut appartenir aux deux cultures : défendez votre hypothèse."], missionSuffix:"doit expliquer sa décision avec au moins deux connecteurs et une référence précise au texte.", criteria:["L'ordre du récit est justifié par des indices textuels.","Le groupe distingue description et action principale.","La comparaison culturelle évite les clichés.","Chaque élève prend la parole au moins une fois."], footer:"Atelier lié au thème Le récit littéraire." },
  { file:"recit-deux-voix.html", title:"Récit à deux voix", badge:"Unité 2 · Production orale", icon:"bi-chat-left-quote-fill", lead:"Raconter le même événement depuis deux perspectives culturelles.", intro:"Les élèves créent deux versions d'une même arrivée : un Colombien en France ou au Québec, puis un Français en Colombie. Les deux voix doivent raconter le même événement avec des détails différents.", image:"theme-recit-litteraire.jpg", alt:"Récit à deux voix", themeHref:"recit-litteraire.html", preparation:"L'activité travaille la narration, la nuance interculturelle et la transformation du récit écrit vers un registre oral.", interaction:"Les cinq élèves deviennent narrateurs, témoins et observateurs de la même scène.", roles:["narratrice colombienne","narrateur français","témoin local","observatrice des temps","médiateur culturel"], steps:[{title:"Choisir",text:"Le groupe choisit une scène : arrivée, repas, université, administration ou fête."},{title:"Écrire",text:"Deux élèves préparent les voix principales avec des détails différents."},{title:"Jouer",text:"Les narrateurs racontent, les témoins ajoutent une précision."},{title:"Comparer",text:"La classe explique ce qui change selon la perspective."}], prompts:["Arrivée à Paris avec une invitation familiale colombienne.","Premier jour dans une université québécoise.","Fête de quartier à Medellín vue par un étudiant français.","Problème de transport raconté par deux voyageurs.","Repas de famille où une règle de politesse est mal comprise."], missionSuffix:"doit raconter la scène en ajoutant une émotion, un détail culturel et une phrase au passé.", criteria:["Les deux versions racontent le même événement.","Les différences de perspective sont claires.","Les élèves utilisent imparfait, passé composé ou passé simple en réception.","Le groupe conclut avec une comparaison nuancée."], footer:"Atelier lié au thème Le récit littéraire." },
  { file:"journal-televise-interculturel.html", title:"Journal télévisé interculturel", badge:"Unité 3 · Médias", icon:"bi-camera-video-fill", lead:"Préparer une émission courte sur un phénomène social.", intro:"Les élèves transforment un sujet de société en bulletin d'actualité : introduction, témoignage, analyse, comparaison France-Colombie et conclusion.", image:"theme-societe-actualite.jpg", alt:"Journal télévisé interculturel", themeHref:"societe-actualite.html", preparation:"Cette activité privilégie la production orale structurée et la distinction entre information, témoignage et opinion.", interaction:"Les élèves se répartissent les rôles d'une rédaction télévisée.", roles:["présentatrice","journaliste terrain","témoin interviewé","analyste culturel","rédactrice de synthèse"], steps:[{title:"Définir",text:"Choisir un phénomène social et formuler la question du jour."},{title:"Collecter",text:"Préparer deux faits et un témoignage fictif."},{title:"Rapporter",text:"Transformer le témoignage au discours indirect."},{title:"Diffuser",text:"Présenter le bulletin en trois minutes."}], prompts:["Les réseaux sociaux et les stéréotypes culturels.","La ponctualité dans les études et le travail.","La gastronomie comme pont entre cultures.","Les jeunes Colombiens qui envisagent d'étudier en France ou au Québec.","La politesse en ligne : commentaires, humour et malentendus."], missionSuffix:"doit préparer une intervention journalistique courte avec un fait, une citation rapportée et une nuance.", criteria:["Le bulletin distingue fait, témoignage et opinion.","Au moins une phrase utilise le discours indirect.","La comparaison France-Colombie est respectueuse.","La conclusion reformule la question sociale."], footer:"Atelier lié au thème Société et actualité." },
  { file:"entretien-rapporte.html", title:"Entretien rapporté", badge:"Unité 3 · Discours indirect", icon:"bi-mic-fill", lead:"Interviewer un migrant fictif puis rapporter ses paroles.", intro:"Un élève joue un Colombien vivant dans un espace francophone. Les autres l'interrogent, prennent des notes et restituent ses réponses au discours indirect.", image:"theme-societe-actualite.jpg", alt:"Entretien rapporté", themeHref:"societe-actualite.html", preparation:"L'objectif est de transformer des paroles directes en compte rendu oral ou écrit, au présent et au passé.", interaction:"Le groupe alterne entre journaliste, témoin, secrétaire et vérificateur grammatical.", roles:["journaliste principale","migrant fictif","secrétaire de notes","vérificateur des temps","présentatrice du compte rendu"], steps:[{title:"Préparer",text:"Écrire cinq questions sur motivations, adaptation et projets."},{title:"Interviewer",text:"Le migrant répond avec des détails personnels."},{title:"Transformer",text:"Le groupe reformule les réponses au discours indirect."},{title:"Restituer",text:"Présentation finale : il a expliqué que, elle a déclaré que..." }], prompts:["Pourquoi avez-vous quitté la Colombie ?","Qu'est-ce qui vous a surpris dans le pays d'accueil ?","Qu'aviez-vous imaginé avant votre départ ?","Quelles difficultés avez-vous rencontrées ?","Quel conseil donneriez-vous à un futur étudiant migrant ?"], missionSuffix:"doit transformer la réponse en discours indirect et vérifier les pronoms, les temps et les repères.", criteria:["Les questions sont ouvertes et respectueuses.","Les réponses contiennent des détails concrets.","La restitution utilise correctement le discours indirect.","Le groupe évite les généralisations sur les migrants."], footer:"Atelier lié au thème Société et actualité." },
  { file:"ligne-vie-interculturelle.html", title:"Ligne de vie interculturelle", badge:"Unité 4 · Parcours", icon:"bi-diagram-3-fill", lead:"Créer le parcours d'une personne entre deux cultures.", intro:"Les élèves inventent une ligne de vie : enfance, décision de partir, préparation, arrivée, choc culturel, adaptation et projet futur.", image:"theme-experiences-projets.jpg", alt:"Ligne de vie interculturelle", themeHref:"experiences-projets.html", preparation:"L'activité travaille le récit au passé et le plus-que-parfait pour expliquer ce qui s'était passé avant un moment clé.", interaction:"Chaque élève construit une étape du parcours et doit la relier aux autres.", roles:["enfance et contexte","décision de départ","préparation du dossier","arrivée et adaptation","projet futur"], steps:[{title:"Imaginer",text:"Créer un personnage crédible et son objectif de mobilité."},{title:"Ordonner",text:"Placer six événements sur une ligne du temps."},{title:"Relier",text:"Utiliser le plus-que-parfait pour expliquer les causes."},{title:"Présenter",text:"Raconter le parcours en binôme ou en groupe."}], prompts:["Une étudiante obtient une bourse après avoir préparé un dossier pendant un an.","Un cuisinier colombien part à Lyon pour apprendre une technique.","Une Française arrive à Bogotá après avoir travaillé au Québec.","Un jeune cherche un stage mais découvre que les codes professionnels changent.","Une famille rejoint un proche installé dans un pays francophone."], missionSuffix:"doit ajouter une phrase au plus-que-parfait et expliquer une conséquence dans le parcours.", criteria:["La ligne du temps est cohérente.","Le plus-que-parfait exprime une action antérieure.","Le parcours inclut motivation, obstacle et adaptation.","Chaque élève relie son étape à celle d'un camarade."], footer:"Atelier lié au thème Expériences et projets." },
  { file:"speed-dating-projets.html", title:"Speed-dating des projets", badge:"Unité 4 · Interaction rapide", icon:"bi-people-fill", lead:"Échanger rapidement sur études, travail, voyage et adaptation.", intro:"Les élèves tournent de partenaire en partenaire. À chaque mini-rencontre, ils doivent présenter un projet, poser une question, rebondir et donner un conseil.", image:"theme-experiences-projets.jpg", alt:"Speed-dating des projets", themeHref:"experiences-projets.html", preparation:"L'activité renforce l'interaction spontanée, les questions de suivi et la capacité à reformuler un projet.", interaction:"Chaque élève défend un projet différent et change de partenaire toutes les deux minutes.", roles:["projet d'études","projet de stage","projet de voyage","projet familial","projet culturel"], steps:[{title:"Préparer",text:"Chaque élève écrit son projet en trois phrases."},{title:"Rencontrer",text:"Deux minutes par échange : présenter, questionner, conseiller."},{title:"Noter",text:"Chaque élève note le meilleur conseil reçu."},{title:"Rapporter",text:"La classe rapporte les projets au discours indirect."}], prompts:["Je voudrais étudier au Québec pendant six mois.","J'aimerais faire un stage dans une entreprise française.","Je rêve de présenter la gastronomie colombienne à Paris.","Je voudrais améliorer mon français avant de voyager.","Je cherche une solution pour financer mon projet."], missionSuffix:"doit présenter son projet, demander un conseil et rapporter ensuite ce qu'un camarade lui a conseillé.", criteria:["Chaque échange contient une question de suivi.","Les élèves utilisent je voudrais, j'aimerais ou je compte.","Les conseils sont précis et réalistes.","La restitution finale rapporte la parole d'un camarade."], footer:"Atelier lié au thème Expériences et projets." },
  { file:"simulation-consulaire.html", title:"Simulation consulaire", badge:"Unité 5 · Jeu de rôle", icon:"bi-building-fill-check", lead:"Résoudre un problème administratif avec politesse.", intro:"La classe devient un consulat, une université, une compagnie aérienne ou un service de logement. Les élèves doivent expliquer un problème et obtenir une solution.", image:"theme-voyages-imprevus.jpg", alt:"Simulation consulaire", themeHref:"voyages-imprevus.html", preparation:"L'activité travaille le conditionnel de politesse, les demandes précises et la gestion d'un imprévu.", interaction:"Les rôles créent une chaîne de service : demandeur, agent, témoin, médiateur et responsable final.", roles:["demandeuse","agent consulaire","témoin du problème","médiateur administratif","responsable de décision"], steps:[{title:"Identifier",text:"Le demandeur explique le problème en 30 secondes."},{title:"Clarifier",text:"L'agent pose trois questions précises."},{title:"Proposer",text:"Le médiateur formule deux solutions au conditionnel."},{title:"Décider",text:"Le responsable annonce la procédure finale."}], prompts:["Passeport perdu deux jours avant le vol.","Visa retardé alors que l'université commence lundi.","Inscription consulaire impossible à cause d'un document manquant.","Billet annulé après une correspondance manquée.","Logement réservé mais adresse incorrecte à l'arrivée."], missionSuffix:"doit formuler une demande polie avec pourriez-vous, je voudrais ou serait-il possible de.", criteria:["Le problème est expliqué clairement.","Les questions permettent d'obtenir des informations utiles.","Les solutions utilisent le conditionnel présent.","Le jeu de rôle reste poli même en situation de stress."], footer:"Atelier lié au thème Voyages et imprévus." },
  { file:"reclamation-formelle.html", title:"Réclamation formelle", badge:"Unité 5 · Atelier écrit et oral", icon:"bi-envelope-exclamation-fill", lead:"Écrire puis jouer une réclamation claire et polie.", intro:"Les élèves construisent une lettre ou un courriel de réclamation, puis jouent l'appel de suivi avec un responsable.", image:"theme-voyages-imprevus.jpg", alt:"Réclamation formelle", themeHref:"voyages-imprevus.html", preparation:"L'activité combine production écrite, registre formel et interaction orale pour demander une réparation réaliste.", interaction:"Les cinq élèves écrivent ensemble puis défendent la demande dans une simulation.", roles:["cliente principale","responsable du service","gardien des preuves","rédactrice du courriel","négociateur poli"], steps:[{title:"Structurer",text:"Objet, présentation, problème, preuves, demande, formule finale."},{title:"Rédiger",text:"Écrire un message formel de 120 à 150 mots."},{title:"Négocier",text:"Jouer l'appel de suivi avec une objection du responsable."},{title:"Corriger",text:"Vérifier ton, précision et conditionnel de politesse."}], prompts:["Hôtel : chambre réservée mais non disponible.","Compagnie aérienne : bagage perdu pendant trois jours.","Université : paiement validé mais inscription bloquée.","Agence : appartement différent des photos annoncées.","Administration : rendez-vous annulé sans nouvelle date."], missionSuffix:"doit demander une réparation concrète en gardant un registre formel.", criteria:["La réclamation contient toutes les parties nécessaires.","Le ton reste poli et ferme.","La demande est réaliste et précise.","L'appel de suivi réutilise le conditionnel et les preuves."], footer:"Atelier lié au thème Voyages et imprévus." }
];

themeData.forEach((theme) => writeFile(path.join(themesDir, theme.file), themePage(theme)));
workshopData.forEach((workshop) => writeFile(path.join(ateliersDir, workshop.file), workshopPage(workshop)));

writeFile(path.join(levelDir, "themes-du-cours.html"), `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Thèmes du cours - Français Niveau 7</title>
  <link rel="icon" href="../../favicon.ico" sizes="any" />
  <link rel="icon" type="image/png" href="../../assets/img/favicon.png" />
  <link href="../../assets/vendor/bootstrap/bootstrap.min.css" rel="stylesheet">
  <link href="../../assets/vendor/bootstrap-icons/bootstrap-icons.css" rel="stylesheet">
  <link href="../../assets/vendor/fonts/jaralingua-fonts.css" rel="stylesheet">
  <style>
    :root{--blue:#1f4e8c;--blue-dark:#15345d;--red:#d62839;--soft:#f4f7fb;--text:#243044;--muted:#718096;--yellow:#f4c95d;--shadow:0 22px 55px rgba(20,40,80,.13);--radius:28px}*{scroll-behavior:smooth}body{margin:0;font-family:"Nunito",sans-serif;color:var(--text);background:var(--soft);overflow-x:hidden}h1,h2,h3,h4,.navbar-brand{font-family:"Montserrat",sans-serif}.navbar{background:rgba(255,255,255,.94);backdrop-filter:blur(16px);box-shadow:0 10px 32px rgba(21,52,93,.08)}.navbar-brand{display:inline-flex;align-items:center;gap:.65rem;font-weight:800;color:var(--blue-dark)}.brand-logo{height:42px}.nav-link{color:var(--text);font-weight:800;border-radius:999px;padding:.55rem .9rem!important}.nav-link:hover,.nav-link.active{color:var(--blue);background:rgba(31,78,140,.08)}.hero{padding:8rem 0 5rem;background:radial-gradient(circle at 15% 18%,rgba(214,40,57,.17),transparent 28%),radial-gradient(circle at 85% 12%,rgba(31,78,140,.22),transparent 32%),linear-gradient(135deg,#fff 0%,#eef5ff 46%,#fff0f2 100%)}.badge-course{display:inline-flex;align-items:center;gap:.55rem;padding:.7rem 1rem;border-radius:999px;background:rgba(255,255,255,.86);border:1px solid rgba(31,78,140,.12);color:var(--blue-dark);font-weight:900;box-shadow:0 14px 30px rgba(31,78,140,.08)}.hero h1{margin-top:1.2rem;font-weight:800;line-height:.98;letter-spacing:-.045em;color:var(--blue-dark);font-size:clamp(2.6rem,6vw,5.4rem)}.hero-lead{color:var(--blue);font-size:clamp(1.15rem,2vw,1.45rem);font-weight:900;margin:1.2rem 0 1rem}.hero-text,.section-text{color:var(--muted);font-size:1.08rem;line-height:1.75;max-width:860px}.hero-img-card{border-radius:34px;overflow:hidden;background:#fff;box-shadow:var(--shadow);padding:1rem}.hero-img-card img{width:100%;min-height:370px;max-height:470px;object-fit:cover;display:block;border-radius:26px}.btn-main,.btn-soft{border-radius:999px;font-weight:900;padding:.88rem 1.18rem;text-decoration:none;display:inline-flex;align-items:center;justify-content:center;gap:.45rem}.btn-main{border:0;background:linear-gradient(135deg,var(--blue),var(--blue-dark));color:#fff;box-shadow:0 16px 34px rgba(31,78,140,.24)}.btn-main:hover{color:#fff}.btn-soft{border:2px solid rgba(31,78,140,.2);background:rgba(255,255,255,.78);color:var(--blue-dark)}.btn-soft:hover{border-color:var(--blue);background:var(--blue);color:#fff}section{padding:5rem 0}.section-kicker{text-transform:uppercase;color:var(--red);font-weight:900;letter-spacing:.12em;font-size:.82rem}.section-title{color:var(--blue-dark);font-size:clamp(2rem,4vw,3.15rem);font-weight:800;letter-spacing:-.045em}.quick-access-panel{max-width:1120px;margin:-2rem auto 0;position:relative;z-index:3;background:#fff;border-radius:28px;box-shadow:var(--shadow);padding:1.2rem}.quick-access-header{display:flex;align-items:center;justify-content:space-between;gap:1rem;margin-bottom:1rem}.quick-access-header h2{font-size:1.2rem;font-weight:900;color:var(--blue-dark);margin:0}.quick-link-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:.7rem}.quick-link-grid a{border-radius:18px;background:rgba(31,78,140,.06);padding:.85rem;text-decoration:none;color:var(--text);display:grid;gap:.35rem}.quick-link-grid b{color:var(--red)}.quick-link-grid span{font-weight:900;color:var(--blue-dark);line-height:1.25}.theme-card{height:100%;border:0;border-radius:var(--radius);background:#fff;overflow:hidden;box-shadow:0 14px 38px rgba(20,40,80,.09);transition:transform .25s ease,box-shadow .25s ease}.theme-card:hover{transform:translateY(-8px);box-shadow:0 26px 56px rgba(20,40,80,.15)}.theme-image{min-height:210px;position:relative;overflow:hidden;background:var(--blue-dark)}.theme-image img{width:100%;height:230px;object-fit:cover;display:block;filter:saturate(1.06) contrast(1.03)}.theme-image:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(21,52,93,.08),rgba(21,52,93,.72)),linear-gradient(135deg,rgba(31,78,140,.2),rgba(214,40,57,.14))}.theme-number{position:absolute;left:1rem;top:1rem;z-index:2;width:48px;height:48px;display:grid;place-items:center;border-radius:18px;background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.22);font-weight:900;font-size:1.25rem;color:#fff}.theme-icon{position:absolute;right:1rem;bottom:.6rem;z-index:2;color:#fff;font-size:3.6rem;opacity:.9}.theme-card .card-body{padding:1.45rem}.theme-card h3{font-weight:800;color:var(--blue-dark);letter-spacing:-.03em}.theme-card p{color:var(--muted);line-height:1.65}.grammar-pill{display:inline-flex;align-items:center;gap:.35rem;border-radius:999px;background:rgba(31,78,140,.08);color:var(--blue-dark);padding:.45rem .7rem;font-size:.84rem;font-weight:900;margin-bottom:1rem}.focus-panel{border-radius:32px;background:linear-gradient(135deg,var(--blue-dark),var(--blue));color:#fff;padding:clamp(1.5rem,3vw,2.5rem);box-shadow:var(--shadow)}footer{background:var(--blue-dark);color:#fff;padding:3rem 0}footer a{color:#fff;text-decoration:none;font-weight:900;opacity:.86}.fade-in{opacity:0;transform:translateY(24px);transition:opacity .7s ease,transform .7s ease}.fade-in.visible{opacity:1;transform:translateY(0)}@media(max-width:991px){.hero{padding-top:7rem}.quick-link-grid{grid-template-columns:repeat(2,1fr)}}@media(max-width:575px){.quick-link-grid{grid-template-columns:1fr}.btn-main,.btn-soft{width:100%}}
  </style>
</head>
<body>
  <nav class="navbar navbar-expand-lg fixed-top"><div class="container"><a class="navbar-brand" href="index.html"><img class="brand-logo" src="../../assets/img/jaralingua-logo.png" alt="JaraLingua"><span>Français · Niveau 7</span></a><button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#menuPrincipal" aria-controls="menuPrincipal" aria-expanded="false" aria-label="Ouvrir le menu"><span class="navbar-toggler-icon"></span></button><div class="collapse navbar-collapse" id="menuPrincipal"><ul class="navbar-nav ms-auto align-items-lg-center gap-lg-1"><li class="nav-item"><a class="nav-link" href="index.html">Accueil</a></li><li class="nav-item"><a class="nav-link active" href="#themes">Thèmes</a></li><li class="nav-item"><a class="nav-link" href="ateliers-activites.html">Ateliers</a></li></ul></div></div></nav>
  <header class="hero"><div class="container"><div class="row align-items-center g-5"><div class="col-lg-7 fade-in"><span class="badge-course"><i class="bi bi-journal-text"></i>Programme du cours</span><h1>Thèmes du cours</h1><p class="hero-lead">Cinq unités reliées par un fil interculturel France-Colombie.</p><p class="hero-text">Chaque thème contient une explication détaillée en français et renvoie vers une ou deux activités interactives. Les connecteurs logiques restent un outil transversal dans les unités, surtout pour argumenter, rapporter et conclure.</p><div class="d-flex flex-wrap gap-3 mt-4"><a href="#themes" class="btn-main"><i class="bi bi-grid-3x3-gap-fill"></i>Voir les thèmes</a><a href="ateliers-activites.html" class="btn-soft"><i class="bi bi-people-fill"></i>Voir les ateliers</a></div></div><div class="col-lg-5 fade-in"><div class="hero-img-card"><img src="img/themes-du-cours.jpg" alt="Illustration des thèmes du cours de français niveau 7"></div></div></div></div></header>
  <section class="quick-access-panel compact" aria-label="Navigation rapide"><div class="quick-access-header"><h2>Liste des thèmes</h2><span>Thèmes</span></div><div class="quick-link-grid"><a href="themes/argumentation-debat.html"><b>01</b><span>Argumentation et débat</span></a><a href="themes/recit-litteraire.html"><b>02</b><span>Le récit littéraire</span></a><a href="themes/societe-actualite.html"><b>03</b><span>Société et actualité</span></a><a href="themes/experiences-projets.html"><b>04</b><span>Expériences et projets</span></a><a href="themes/voyages-imprevus.html"><b>05</b><span>Voyages et imprévus</span></a></div></section>
  <main><section id="themes"><div class="container"><div class="text-center mb-5 fade-in"><p class="section-kicker">Carte du programme</p><h2 class="section-title">Les unités du Niveau 7</h2><p class="section-text mx-auto">Le niveau suit la question centrale de la migration colombienne vers des espaces francophones et compare les cultures française et colombienne avec nuance.</p></div><div class="row g-4">
  ${[
    ["01","theme-argumentation-debat.jpg","bi-megaphone-fill","Opinion et débat","Argumentation et débat","Donner son opinion, nuancer son accord ou son désaccord et défendre une idée avec des arguments.","themes/argumentation-debat.html","ateliers/debat-culturel-france-colombie.html"],
    ["02","theme-recit-litteraire.jpg","bi-book-half","Récit et passé simple","Le récit littéraire","Comprendre des contes, des récits historiques et des textes écrits dans un registre littéraire.","themes/recit-litteraire.html","ateliers/puzzle-narratif.html"],
    ["03","theme-societe-actualite.jpg","bi-newspaper","Discours indirect","Société et actualité","Analyser des faits sociaux, commenter des représentations médiatiques et rapporter la parole d'autrui.","themes/societe-actualite.html","ateliers/journal-televise-interculturel.html"],
    ["04","theme-experiences-projets.jpg","bi-briefcase-fill","Plus-que-parfait","Expériences et projets","Parler d'un parcours, raconter une expérience marquante et présenter des projets de mobilité.","themes/experiences-projets.html","ateliers/ligne-vie-interculturelle.html"],
    ["05","theme-voyages-imprevus.jpg","bi-airplane-fill","Conditionnel présent","Voyages et imprévus","Gérer des situations inattendues, demander de l'aide et formuler une réclamation formelle.","themes/voyages-imprevus.html","ateliers/simulation-consulaire.html"]
  ].map((card)=>`<div class="col-md-6 col-xl-4 fade-in"><article class="card theme-card"><div class="theme-image"><img src="img/${card[1]}" alt="${card[4]}"><div class="theme-number">${card[0]}</div><i class="bi ${card[2]} theme-icon"></i></div><div class="card-body"><span class="grammar-pill"><i class="bi bi-braces"></i>${card[3]}</span><h3 class="h4">${card[4]}</h3><p>${card[5]}</p><a href="${card[6]}" class="btn-main w-100 mb-2">Ouvrir le thème</a><a href="${card[7]}" class="btn-soft w-100">Activité liée</a></div></article></div>`).join("")}
  </div></div></section><section class="bg-white"><div class="container"><div class="focus-panel fade-in"><div class="row align-items-center g-4"><div class="col-lg-8"><p class="text-uppercase fw-bold opacity-75 mb-2">Fil transversal</p><h2 class="fw-bold mb-2">Connecteurs logiques dans toutes les unités</h2><p class="mb-0 opacity-75 fs-5">Opposition, addition, cause, conséquence et conclusion apparaissent dans les débats, les comptes rendus, les récits de parcours et les réclamations. Ils ne deviennent pas une unité séparée : ils servent chaque thème.</p></div><div class="col-lg-4 text-lg-end"><a href="themes/argumentation-debat.html#connecteurs" class="btn btn-light fw-bold rounded-pill px-4 py-3">Revoir les connecteurs</a></div></div></div></div></section></main>
  <footer><div class="container"><div class="row align-items-center g-4"><div class="col-lg-8"><h2 class="h4 fw-bold mb-2">Français - Niveau 7</h2><p class="mb-0 opacity-75">Page des thèmes du cours avec liens vers les explications et ateliers.</p></div><div class="col-lg-4 text-lg-end"><a href="index.html"><i class="bi bi-arrow-left"></i> Retour à l'accueil</a></div></div></div></footer>
  <script src="../../assets/vendor/bootstrap/bootstrap.bundle.min.js"></script><script>const fadeElements=document.querySelectorAll('.fade-in');const observer=new IntersectionObserver(function(entries){entries.forEach(function(entry){if(entry.isIntersecting){entry.target.classList.add('visible')}})},{threshold:.12});fadeElements.forEach(function(element){observer.observe(element)});</script>
</body></html>`);

const activityCards = [
  ["01","atelier-passe-simple.jpg","bi-book-half","Le passé simple","Reconnaître les formes du récit écrit et comprendre leur fonction.","ateliers/passe-simple.html","themes/passe-simple.html"],
  ["02","transformation-passe-simple.jpg","bi-arrow-left-right","Transformation passé simple","Transformer des phrases vers le passé composé dans un registre courant.","ateliers/transformation-passe-simple.html","themes/passe-simple.html"],
  ["03","theme-argumentation-debat.jpg","bi-braces","Subjonctif argumentatif","Pratiquer les déclencheurs du subjonctif pour donner une opinion nuancée.","ateliers/subjonctif-argumentation.html","themes/argumentation-debat.html#subjonctif"],
  ["04","theme-argumentation-debat.jpg","bi-megaphone-fill","Débat culturel","Défendre ou déconstruire des idées reçues sur la France et la Colombie.","ateliers/debat-culturel-france-colombie.html","themes/argumentation-debat.html"],
  ["05","theme-recit-litteraire.jpg","bi-puzzle-fill","Puzzle narratif","Reconstituer un conte ou une légende et comparer les valeurs culturelles.","ateliers/puzzle-narratif.html","themes/recit-litteraire.html"],
  ["06","theme-recit-litteraire.jpg","bi-chat-left-quote-fill","Récit à deux voix","Raconter le même événement depuis deux perspectives culturelles.","ateliers/recit-deux-voix.html","themes/recit-litteraire.html"],
  ["07","theme-societe-actualite.jpg","bi-camera-video-fill","Journal télévisé","Préparer une émission courte sur un phénomène social interculturel.","ateliers/journal-televise-interculturel.html","themes/societe-actualite.html"],
  ["08","theme-societe-actualite.jpg","bi-mic-fill","Entretien rapporté","Interviewer puis restituer les réponses au discours indirect.","ateliers/entretien-rapporte.html","themes/societe-actualite.html"],
  ["09","theme-experiences-projets.jpg","bi-diagram-3-fill","Ligne de vie","Créer un parcours interculturel avec le plus-que-parfait.","ateliers/ligne-vie-interculturelle.html","themes/experiences-projets.html"],
  ["10","theme-experiences-projets.jpg","bi-people-fill","Speed-dating des projets","Échanger rapidement sur études, travail, voyage et adaptation.","ateliers/speed-dating-projets.html","themes/experiences-projets.html"],
  ["11","theme-voyages-imprevus.jpg","bi-building-fill-check","Simulation consulaire","Résoudre un problème administratif avec le conditionnel de politesse.","ateliers/simulation-consulaire.html","themes/voyages-imprevus.html"],
  ["12","theme-voyages-imprevus.jpg","bi-envelope-exclamation-fill","Réclamation formelle","Écrire et jouer une demande polie avec une solution réaliste.","ateliers/reclamation-formelle.html","themes/voyages-imprevus.html"]
];

writeFile(path.join(levelDir, "ateliers-activites.html"), `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Ateliers et activités - Français Niveau 7</title><link rel="icon" href="../../favicon.ico" sizes="any" /><link rel="icon" type="image/png" href="../../assets/img/favicon.png" /><link href="../../assets/vendor/bootstrap/bootstrap.min.css" rel="stylesheet"><link href="../../assets/vendor/bootstrap-icons/bootstrap-icons.css" rel="stylesheet"><link href="../../assets/vendor/fonts/jaralingua-fonts.css" rel="stylesheet"><style>:root{--blue:#1f4e8c;--blue-dark:#15345d;--red:#d62839;--soft:#f4f7fb;--text:#243044;--muted:#718096;--yellow:#f4c95d;--green:#2f9e77;--shadow:0 22px 55px rgba(20,40,80,.13);--radius:28px}*{scroll-behavior:smooth}body{margin:0;font-family:"Nunito",sans-serif;color:var(--text);background:var(--soft);overflow-x:hidden}h1,h2,h3,h4,h5,.navbar-brand{font-family:"Montserrat",sans-serif}.navbar{background:rgba(255,255,255,.94);backdrop-filter:blur(16px);box-shadow:0 10px 32px rgba(21,52,93,.08)}.navbar-brand{display:inline-flex;align-items:center;gap:.65rem;font-weight:800;color:var(--blue-dark)}.brand-logo{height:42px}.nav-link{color:var(--text);font-weight:800;border-radius:999px;padding:.55rem .9rem!important}.nav-link:hover,.nav-link.active{color:var(--blue);background:rgba(31,78,140,.08)}.hero{padding:8rem 0 5rem;background:radial-gradient(circle at 15% 18%,rgba(214,40,57,.17),transparent 28%),radial-gradient(circle at 85% 12%,rgba(31,78,140,.22),transparent 32%),linear-gradient(135deg,#fff 0%,#eef5ff 46%,#fff0f2 100%)}.badge-course{display:inline-flex;align-items:center;gap:.55rem;padding:.7rem 1rem;border-radius:999px;background:rgba(255,255,255,.86);border:1px solid rgba(31,78,140,.12);color:var(--blue-dark);font-weight:900;box-shadow:0 14px 30px rgba(31,78,140,.08)}.hero h1{margin-top:1.2rem;font-weight:800;line-height:.98;letter-spacing:-.045em;color:var(--blue-dark);font-size:clamp(2.6rem,6vw,5.4rem)}.hero-lead{color:var(--blue);font-size:clamp(1.15rem,2vw,1.45rem);font-weight:900;margin:1.2rem 0 1rem}.hero-text,.section-text{color:var(--muted);font-size:1.08rem;line-height:1.75;max-width:860px}.hero-card{border-radius:34px;overflow:hidden;background:#fff;box-shadow:var(--shadow);padding:1rem}.hero-card img{width:100%;min-height:390px;max-height:500px;object-fit:cover;display:block;border-radius:26px}.btn-main,.btn-soft{border-radius:999px;font-weight:900;padding:.88rem 1.18rem;text-decoration:none;display:inline-flex;align-items:center;justify-content:center;gap:.45rem}.btn-main{border:0;background:linear-gradient(135deg,var(--blue),var(--blue-dark));color:#fff;box-shadow:0 16px 34px rgba(31,78,140,.24)}.btn-main:hover{color:#fff}.btn-soft{border:2px solid rgba(31,78,140,.2);background:rgba(255,255,255,.78);color:var(--blue-dark)}.btn-soft:hover{border-color:var(--blue);background:var(--blue);color:#fff}section{padding:5rem 0}.section-kicker{text-transform:uppercase;color:var(--red);font-weight:900;letter-spacing:.12em;font-size:.82rem}.section-title{color:var(--blue-dark);font-size:clamp(2rem,4vw,3.15rem);font-weight:800;letter-spacing:-.045em}.quick-access-panel{max-width:1120px;margin:-2rem auto 0;position:relative;z-index:3;background:#fff;border-radius:28px;box-shadow:var(--shadow);padding:1.2rem}.quick-access-header{display:flex;align-items:center;justify-content:space-between;gap:1rem;margin-bottom:1rem}.quick-access-header h2{font-size:1.2rem;font-weight:900;color:var(--blue-dark);margin:0}.quick-link-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:.7rem}.quick-link-grid a{border-radius:18px;background:rgba(31,78,140,.06);padding:.85rem;text-decoration:none;color:var(--text);display:grid;gap:.35rem}.quick-link-grid b{color:var(--red)}.quick-link-grid span{font-weight:900;color:var(--blue-dark);line-height:1.25}.workshop-card{height:100%;border:0;border-radius:30px;overflow:hidden;background:#fff;box-shadow:var(--shadow);transition:transform .25s ease,box-shadow .25s ease}.workshop-card:hover{transform:translateY(-8px);box-shadow:0 28px 60px rgba(20,40,80,.16)}.workshop-top{min-height:210px;color:#fff;position:relative;overflow:hidden;padding:1.4rem;display:flex;flex-direction:column;justify-content:space-between;background:linear-gradient(135deg,var(--blue-dark),var(--blue))}.workshop-top:before{content:"";position:absolute;inset:0;z-index:1;background:linear-gradient(180deg,rgba(21,52,93,.18),rgba(21,52,93,.82)),radial-gradient(circle at 84% 20%,rgba(244,201,93,.2),transparent 32%)}.workshop-image{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.72}.workshop-icon{width:66px;height:66px;display:grid;place-items:center;border-radius:22px;background:rgba(255,255,255,.17);border:1px solid rgba(255,255,255,.22);font-size:1.9rem;position:relative;z-index:2}.workshop-body{padding:1.45rem}.status-pill{display:inline-flex;align-items:center;gap:.35rem;border-radius:999px;background:rgba(47,158,119,.12);color:var(--green);padding:.48rem .78rem;font-size:.86rem;font-weight:900}.skill-pill{display:inline-flex;align-items:center;gap:.35rem;border-radius:999px;background:rgba(31,78,140,.08);color:var(--blue-dark);padding:.5rem .72rem;margin:.18rem;font-size:.86rem;font-weight:900}footer{background:var(--blue-dark);color:#fff;padding:3rem 0}footer a{color:#fff;text-decoration:none;font-weight:900;opacity:.86}.fade-in{opacity:0;transform:translateY(24px);transition:opacity .7s ease,transform .7s ease}.fade-in.visible{opacity:1;transform:translateY(0)}@media(max-width:991px){.hero{padding-top:7rem}.quick-link-grid{grid-template-columns:repeat(2,1fr)}}@media(max-width:575px){.quick-link-grid{grid-template-columns:1fr}.btn-main,.btn-soft{width:100%}}</style></head><body><nav class="navbar navbar-expand-lg fixed-top"><div class="container"><a class="navbar-brand" href="index.html"><img class="brand-logo" src="../../assets/img/jaralingua-logo.png" alt="JaraLingua"><span>Français · Niveau 7</span></a><button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#menuPrincipal" aria-controls="menuPrincipal" aria-expanded="false" aria-label="Ouvrir le menu"><span class="navbar-toggler-icon"></span></button><div class="collapse navbar-collapse" id="menuPrincipal"><ul class="navbar-nav ms-auto align-items-lg-center gap-lg-1"><li class="nav-item"><a class="nav-link" href="index.html">Accueil</a></li><li class="nav-item"><a class="nav-link" href="themes-du-cours.html">Thèmes</a></li><li class="nav-item"><a class="nav-link active" href="#ateliers">Ateliers</a></li></ul></div></div></nav><header class="hero"><div class="container"><div class="row align-items-center g-5"><div class="col-lg-7 fade-in"><span class="badge-course"><i class="bi bi-people-fill"></i>Pratique du cours</span><h1>Ateliers et activités</h1><p class="hero-lead">Pratiquez chaque thème avec des interactions créatives entre cinq élèves.</p><p class="hero-text">Les ateliers disponibles couvrent les cinq unités du niveau 7. Les activités d'écoute restent séparées pour demain, quand les nouveaux crédits ElevenLabs seront disponibles.</p><div class="d-flex flex-wrap gap-3 mt-4"><a href="#ateliers" class="btn-main"><i class="bi bi-play-circle"></i>Voir les ateliers</a><a href="themes-du-cours.html" class="btn-soft"><i class="bi bi-journal-text"></i>Revoir les thèmes</a></div></div><div class="col-lg-5 fade-in"><div class="hero-card"><img src="img/ateliers-activites.jpg" alt="Étudiants participant à des ateliers et activités de français"></div></div></div></div></header><section class="quick-access-panel compact" aria-label="Navigation rapide"><div class="quick-access-header"><h2>Liste des ateliers</h2><span>Ateliers</span></div><div class="quick-link-grid">${activityCards.map((c)=>`<a href="${c[5]}"><b>${c[0]}</b><span>${c[3]}</span></a>`).join("")}</div></section><main><section id="ateliers"><div class="container"><div class="text-center mb-5 fade-in"><p class="section-kicker">Ateliers disponibles</p><h2 class="section-title">Choisissez votre activité</h2><p class="section-text mx-auto">Chaque atelier est relié à un thème précis et propose soit un travail grammatical guidé, soit une interaction orale entre les cinq élèves du cours.</p></div><div class="row g-4">${activityCards.map((c)=>`<div class="col-md-6 col-xl-4 fade-in"><article class="workshop-card"><div class="workshop-top"><img class="workshop-image" src="img/${c[1]}" alt="${c[3]}"><div class="workshop-icon"><i class="bi ${c[2]}"></i></div><div class="position-relative" style="z-index:2;"><p class="text-uppercase fw-bold opacity-75 mb-2">Atelier ${c[0]}</p><h2 class="fw-bold mb-0">${c[3]}</h2></div></div><div class="workshop-body"><span class="status-pill mb-3"><i class="bi bi-check-circle-fill"></i>Disponible</span><h3 class="h4 fw-bold text-primary mb-3">${c[3]}</h3><p class="section-text">${c[4]}</p><div class="mb-4"><span class="skill-pill"><i class="bi bi-chat-dots"></i>Interaction</span><span class="skill-pill"><i class="bi bi-link-45deg"></i>Thème lié</span><span class="skill-pill"><i class="bi bi-ui-checks"></i>Production</span></div><div class="d-flex flex-wrap gap-3"><a href="${c[5]}" class="btn-main"><i class="bi bi-door-open"></i>Entrer</a><a href="${c[6]}" class="btn-soft"><i class="bi bi-book"></i>Revoir la théorie</a></div></div></article></div>`).join("")}</div></div></section></main><footer><div class="container"><div class="row align-items-center g-4"><div class="col-lg-8"><h2 class="h4 fw-bold mb-2">Ateliers et activités - Français Niveau 7</h2><p class="mb-0 opacity-75">Page principale des ateliers pratiques du cours.</p></div><div class="col-lg-4 text-lg-end"><a href="index.html"><i class="bi bi-arrow-left"></i> Retour à l'accueil</a></div></div></div></footer><script src="../../assets/vendor/bootstrap/bootstrap.bundle.min.js"></script><script>const fadeElements=document.querySelectorAll('.fade-in');const observer=new IntersectionObserver(function(entries){entries.forEach(function(entry){if(entry.isIntersecting){entry.target.classList.add('visible')}})},{threshold:.12});fadeElements.forEach(function(element){observer.observe(element)});</script></body></html>`);

console.log("French Niveau 7 missing pages generated.");
