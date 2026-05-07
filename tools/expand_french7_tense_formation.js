const fs = require("fs");
const path = require("path");

const root = process.cwd();
const grammarDir = path.join(root, "frances", "Niveau 7", "grammaire");

function expand(fileName, markerText, sectionHtml) {
  const filePath = path.join(grammarDir, fileName);
  let html = fs.readFileSync(filePath, "utf8");

  if (!html.includes(".table-wrap")) {
    html = html.replace(
      "@media(max-width:991px)",
      `.table-wrap{overflow-x:auto;border-radius:24px;background:#fff;box-shadow:0 14px 38px rgba(20,40,80,.09)}table.grammar-table{width:100%;min-width:760px;border-collapse:collapse;margin:0}table.grammar-table th{background:var(--blue-dark);color:#fff;padding:1rem;text-align:left}table.grammar-table td{padding:.95rem 1rem;border-bottom:1px solid rgba(31,78,140,.11);vertical-align:top}table.grammar-table strong{color:var(--red)}.formation-steps{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1rem}.formation-step{border-radius:24px;background:#fff;box-shadow:0 14px 38px rgba(20,40,80,.09);padding:1.2rem;height:100%}.formation-step span{display:grid;place-items:center;width:44px;height:44px;border-radius:16px;background:rgba(214,40,57,.1);color:var(--red);font-weight:900;margin-bottom:.8rem}.formation-step h3{font-size:1.05rem;font-weight:900;color:var(--blue-dark)}.formation-step p{color:var(--muted);line-height:1.65;margin:0}.note-box{border-radius:24px;background:linear-gradient(135deg,var(--blue-dark),var(--blue));color:#fff;padding:1.25rem}.note-box p{color:rgba(255,255,255,.82);line-height:1.7;margin:0}@media(max-width:991px){.formation-steps{grid-template-columns:repeat(2,1fr)}}@media(max-width:575px){.formation-steps{grid-template-columns:1fr}}@media(max-width:991px)`
    );
  }

  if (!html.includes(markerText)) {
    html = html.replace(
      `</div></div></section>\n    <section class="bg-white">`,
      `</div></div></section>\n${sectionHtml}\n    <section class="bg-white">`
    );
  }

  html = html.replaceAll("../themes-du-cours.html#grammaire", "../themes-du-cours.html#themes");
  fs.writeFileSync(filePath, html, "utf8");
}

const subjonctifSection = `
    <section id="formation-complete" class="bg-white"><div class="container">
      <div class="text-center mb-5 fade-in">
        <p class="section-kicker">Formation complète</p>
        <h2 class="section-title">Comment former le subjonctif passé ?</h2>
        <p class="section-text mx-auto">Le subjonctif passé est un temps composé. Il faut donc maîtriser quatre décisions : le déclencheur, l'auxiliaire, le participe passé et l'accord.</p>
      </div>
      <div class="formation-steps mb-5 fade-in">
        <article class="formation-step"><span>1</span><h3>Déclencheur + que</h3><p>On commence par une expression qui demande le subjonctif : <strong>il faut que</strong>, <strong>je doute que</strong>, <strong>bien que</strong>, <strong>je suis content que</strong>.</p></article>
        <article class="formation-step"><span>2</span><h3>Auxiliaire au subjonctif</h3><p>On conjugue <strong>avoir</strong> ou <strong>être</strong> au subjonctif présent : que j'aie, que tu aies, qu'il ait, que je sois, que tu sois...</p></article>
        <article class="formation-step"><span>3</span><h3>Participe passé</h3><p>On ajoute le participe passé du verbe principal : parlé, fini, pris, fait, venu, allé, parti, écrit.</p></article>
        <article class="formation-step"><span>4</span><h3>Accord</h3><p>Avec <strong>être</strong>, le participe s'accorde avec le sujet. Avec <strong>avoir</strong>, il ne s'accorde généralement pas avec le sujet.</p></article>
      </div>
      <div class="row g-4 align-items-start">
        <div class="col-lg-7 fade-in">
          <div class="table-wrap">
            <table class="grammar-table">
              <thead><tr><th>Sujet</th><th>Avec avoir : parler</th><th>Avec être : partir</th></tr></thead>
              <tbody>
                <tr><td>que je</td><td><strong>que j'aie parlé</strong></td><td><strong>que je sois parti(e)</strong></td></tr>
                <tr><td>que tu</td><td><strong>que tu aies parlé</strong></td><td><strong>que tu sois parti(e)</strong></td></tr>
                <tr><td>qu'il / qu'elle / qu'on</td><td><strong>qu'il ait parlé</strong></td><td><strong>qu'elle soit partie</strong></td></tr>
                <tr><td>que nous</td><td><strong>que nous ayons parlé</strong></td><td><strong>que nous soyons parti(e)s</strong></td></tr>
                <tr><td>que vous</td><td><strong>que vous ayez parlé</strong></td><td><strong>que vous soyez parti(e)(s)</strong></td></tr>
                <tr><td>qu'ils / qu'elles</td><td><strong>qu'ils aient parlé</strong></td><td><strong>qu'elles soient parties</strong></td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="col-lg-5 fade-in">
          <div class="panel">
            <h3 class="fw-bold text-primary mb-3">Auxiliaires au subjonctif présent</h3>
            <div class="formula mb-3">avoir : que j'aie, que tu aies, qu'il ait, que nous ayons, que vous ayez, qu'ils aient</div>
            <div class="formula">être : que je sois, que tu sois, qu'il soit, que nous soyons, que vous soyez, qu'ils soient</div>
          </div>
        </div>
      </div>
      <div class="row g-4 mt-4">
        <div class="col-lg-6 fade-in"><div class="practice-card"><h3>Participes passés fréquents</h3><p>avoir → eu · être → été · faire → fait · prendre → pris · mettre → mis · dire → dit · écrire → écrit · pouvoir → pu · vouloir → voulu · venir → venu · aller → allé · partir → parti</p></div></div>
        <div class="col-lg-6 fade-in"><div class="note-box"><h3 class="fw-bold mb-3">Exemple complet</h3><p>Je regrette que Sofia <strong>soit arrivée</strong> tard. On utilise <strong>soit</strong> parce que le verbe arriver se conjugue avec être, et <strong>arrivée</strong> s'accorde avec Sofia.</p></div></div>
      </div>
    </div></section>`;

const conditionnelSection = `
    <section id="formation-complete" class="bg-white"><div class="container">
      <div class="text-center mb-5 fade-in">
        <p class="section-kicker">Formation complète</p>
        <h2 class="section-title">Comment former le conditionnel passé ?</h2>
        <p class="section-text mx-auto">Le conditionnel passé est un temps composé. Il se forme avec l'auxiliaire au conditionnel présent, suivi du participe passé du verbe principal.</p>
      </div>
      <div class="formation-steps mb-5 fade-in">
        <article class="formation-step"><span>1</span><h3>Choisir l'auxiliaire</h3><p>La majorité des verbes utilisent <strong>avoir</strong>. Les verbes de mouvement comme aller, venir, partir, arriver et les verbes pronominaux utilisent <strong>être</strong>.</p></article>
        <article class="formation-step"><span>2</span><h3>Conjuguer au conditionnel</h3><p>On conjugue l'auxiliaire au conditionnel présent : j'aurais, tu aurais, il aurait, je serais, tu serais, il serait...</p></article>
        <article class="formation-step"><span>3</span><h3>Ajouter le participe passé</h3><p>On ajoute le participe : parlé, fini, pris, eu, été, parti, arrivé, allé.</p></article>
        <article class="formation-step"><span>4</span><h3>Vérifier l'accord</h3><p>Avec <strong>être</strong>, le participe s'accorde avec le sujet : elle serait partie, ils seraient arrivés.</p></article>
      </div>
      <div class="row g-4 align-items-start">
        <div class="col-lg-7 fade-in">
          <div class="table-wrap">
            <table class="grammar-table">
              <thead><tr><th>Sujet</th><th>Avec avoir : parler</th><th>Avec être : partir</th></tr></thead>
              <tbody>
                <tr><td>je</td><td><strong>j'aurais parlé</strong></td><td><strong>je serais parti(e)</strong></td></tr>
                <tr><td>tu</td><td><strong>tu aurais parlé</strong></td><td><strong>tu serais parti(e)</strong></td></tr>
                <tr><td>il / elle / on</td><td><strong>il aurait parlé</strong></td><td><strong>elle serait partie</strong></td></tr>
                <tr><td>nous</td><td><strong>nous aurions parlé</strong></td><td><strong>nous serions parti(e)s</strong></td></tr>
                <tr><td>vous</td><td><strong>vous auriez parlé</strong></td><td><strong>vous seriez parti(e)(s)</strong></td></tr>
                <tr><td>ils / elles</td><td><strong>ils auraient parlé</strong></td><td><strong>elles seraient parties</strong></td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="col-lg-5 fade-in">
          <div class="panel">
            <h3 class="fw-bold text-primary mb-3">Auxiliaires au conditionnel présent</h3>
            <div class="formula mb-3">avoir : j'aurais, tu aurais, il aurait, nous aurions, vous auriez, ils auraient</div>
            <div class="formula">être : je serais, tu serais, il serait, nous serions, vous seriez, ils seraient</div>
          </div>
        </div>
      </div>
      <div class="row g-4 mt-4">
        <div class="col-lg-6 fade-in">
          <div class="table-wrap">
            <table class="grammar-table">
              <thead><tr><th>Structure</th><th>Exemple</th><th>Sens</th></tr></thead>
              <tbody>
                <tr><td>Si + plus-que-parfait + conditionnel passé</td><td>Si j'avais su, j'aurais appelé.</td><td>Hypothèse non réalisée</td></tr>
                <tr><td>aurais dû + infinitif</td><td>Tu aurais dû vérifier.</td><td>Reproche ou conseil après coup</td></tr>
                <tr><td>aurais pu + infinitif</td><td>Nous aurions pu demander de l'aide.</td><td>Possibilité non utilisée</td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="col-lg-6 fade-in"><div class="note-box"><h3 class="fw-bold mb-3">Exemple complet</h3><p>Si Valentina <strong>avait envoyé</strong> son dossier plus tôt, elle <strong>aurait reçu</strong> une réponse avant son voyage. La première partie est au plus-que-parfait ; la conséquence imaginée est au conditionnel passé.</p></div></div>
      </div>
    </div></section>`;

expand("subjonctif-passe.html", "Comment former le subjonctif passé ?", subjonctifSection);
expand("conditionnel-passe.html", "Comment former le conditionnel passé ?", conditionnelSection);

console.log("Detailed tense formation added.");
