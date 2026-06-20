const fs = require("fs");
const path = require("path");

const pagePath = path.join(__dirname, "..", "frances", "Niveau 8", "ateliers", "prononciation-01d-conditionnel-passe.html");
let page = fs.readFileSync(pagePath, "utf8");

page = page.replace("../../../assets/js/french8-pronunciation.js", "../../../assets/js/french8-pronunciation-sections.js");
page = page.replace("Activité guidée · environ 50 mots", "4 sections guidées · 1 défi final");
page = page.replace(
  "Commencez par écouter la voix française. Quand vous êtes prêt, appuyez sur le microphone et lisez tout le texte naturellement.",
  "Avancez sans stress : lisez une courte section, observez la correction et votre note, puis passez à la suivante. Le paragraphe complet arrive seulement dans le défi final."
);
page = page.replace(
  '<main><div class="container"><div class="practice-layout">',
  '<main><div class="container"><figure class="activity-visual"><img src="../img/ateliers/listening-01a-choix-carriere-v2.webp" alt="Apprenante pratiquant la prononciation du conditionnel passé"><figcaption>Respirez, écoutez et progressez une section à la fois.</figcaption></figure><div class="practice-layout">'
);
page = page.replace(/<div class="privacy-note"><i class="bi bi-shield-check"><\/i>[^<]*(?:<[^>]+>[^<]*)*?<\/div>/, "");
page = page.replace(
  "@keyframes pulse",
  ".activity-visual{position:relative;margin:0 0 1.25rem;border-radius:20px;overflow:hidden;box-shadow:var(--shadow);height:clamp(230px,34vw,410px)}.activity-visual img{width:100%;height:100%;object-fit:cover;display:block}.activity-visual:after{content:\"\";position:absolute;inset:0;background:linear-gradient(180deg,transparent 48%,rgba(21,52,93,.88))}.activity-visual figcaption{position:absolute;z-index:1;left:clamp(1rem,4vw,2.5rem);right:1rem;bottom:1.25rem;color:#fff;font-size:clamp(1.05rem,2vw,1.35rem);font-weight:900}.stage-panel{display:grid;gap:.8rem;margin:1.2rem 0 .7rem;padding:1rem;border-radius:16px;background:linear-gradient(135deg,#eef5ff,#fff7df)}.stage-panel-copy{display:flex;justify-content:space-between;gap:1rem;align-items:center}.stage-panel-copy span{color:var(--red);font-size:.78rem;font-weight:900;text-transform:uppercase;letter-spacing:.08em}.stage-panel-copy strong{color:var(--blue-dark);text-align:right}.stage-progress{display:grid;grid-template-columns:repeat(5,1fr);gap:.45rem}.stage-dot{min-height:34px;display:grid;place-items:center;border-radius:999px;background:#fff;color:var(--muted);border:1px solid rgba(31,78,140,.15);font-size:.78rem;font-weight:900}.stage-dot.is-active{background:var(--blue-dark);color:#fff;box-shadow:0 7px 15px rgba(21,52,93,.2)}.stage-dot.is-done{border-color:var(--green);color:var(--green)}.stage-dot.is-active.is-done{background:var(--green);color:#fff}.microphone-picker{display:grid;gap:.35rem;max-width:620px;margin:0 auto 1rem;text-align:left;color:var(--blue-dark);font-weight:900}.microphone-picker select{width:100%;padding:.65rem .8rem;border:1px solid rgba(31,78,140,.22);border-radius:10px;background:#fff;color:var(--blue-dark)}.stage-history{margin-top:.8rem}.stage-history>p{margin:0 0 .5rem;color:var(--blue-dark);font-weight:900}.stage-history>div{display:grid;grid-template-columns:repeat(auto-fit,minmax(78px,1fr));gap:.45rem}.history-score{display:grid;gap:.1rem;padding:.55rem;border-radius:10px;background:#eef5ff;text-align:center}.history-score small{color:var(--muted);font-size:.68rem}.history-score strong{color:var(--blue-dark);font-size:1.1rem}.history-score.is-final{background:#fff1c7}.next-stage{width:100%;justify-content:center;margin-top:.8rem;background:var(--green);color:#fff}.next-stage[hidden]{display:none}@keyframes pulse"
);

if (!page.includes("french8-pronunciation-sections.js") || !page.includes("activity-visual") || page.includes("Cet enregistrement est analysé temporairement")) {
  throw new Error("Section workflow, image, or privacy removal was not installed correctly.");
}
fs.writeFileSync(pagePath, page, "utf8");
console.log("French 8 staged pronunciation workflow and activity image installed.");
