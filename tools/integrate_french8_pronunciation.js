const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const workshopPath = path.join(root, "frances", "Niveau 8", "ateliers-activites.html");
const activityPath = path.join(root, "frances", "Niveau 8", "ateliers", "prononciation-01d-conditionnel-passe.html");
const scriptPath = path.join(root, "frances", "Niveau 8", "audio", "pronunciation-conditionnel-passe-script.md");

function replaceOnce(filePath, search, replacement) {
  const source = fs.readFileSync(filePath, "utf8");
  if (source.includes(replacement)) return false;
  if (!source.includes(search)) throw new Error(`Expected marker not found in ${filePath}`);
  fs.writeFileSync(filePath, source.replace(search, replacement), "utf8");
  return true;
}

const card = '<a class="practice-card" href="ateliers/prononciation-01d-conditionnel-passe.html"><img src="img/ateliers/prononciation-conditionnel-passe-v1.webp" alt="Apprenante pratiquant la prononciation du conditionnel passé"><div class="practice-card-body"><b>Prononciation · 01D</b><h3>Le conditionnel passé à voix haute</h3><p>Voix modèle professionnelle, progression guidée et feedback Whisper immédiat.</p><span>S\'entraîner <i class="bi bi-mic-fill"></i></span></div></a>';
const themeTwoMarker = '</div></article><article class="practice-theme" id="theme-02">';
const workshopChanged = replaceOnce(workshopPath, themeTwoMarker, card + themeTwoMarker);

const oldPlayer = 'modelButton.addEventListener("click",()=>{if(modelAudio.paused){modelAudio.play();modelButton.querySelector("i").className="bi bi-pause-fill"}else{modelAudio.pause();modelButton.querySelector("i").className="bi bi-play-fill"}});';
const newPlayer = 'modelButton.addEventListener("click",async()=>{if(modelAudio.paused){try{await modelAudio.play();modelButton.querySelector("i").className="bi bi-pause-fill"}catch(_error){modelButton.querySelector("i").className="bi bi-play-fill"}}else{modelAudio.pause();modelButton.querySelector("i").className="bi bi-play-fill"}});';
const activityChanged = replaceOnce(activityPath, oldPlayer, newPlayer);

const voiceChanged = replaceOnce(scriptPath, "Narratrice:", "Claire:");
console.log(JSON.stringify({ workshopChanged, activityChanged, voiceChanged }));
