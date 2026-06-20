const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "upgrade_french8_pronunciation_learning_features.js");
let source = fs.readFileSync(filePath, "utf8");
source = source.replace(
  'wordHelp.innerHTML = `<strong><i class="bi bi-volume-up"></i> ${word}</strong><span>${pronunciationTip(word)}</span>`;',
  'wordHelp.innerHTML = \\`<strong><i class="bi bi-volume-up"></i> \\${word}</strong><span>\\${pronunciationTip(word)}</span>\\`;'
);
source = source.replace('levelMeterBar.style.width = `${percent}%`;', 'levelMeterBar.style.width = \\`\\${percent}%\\`;');
source = source.replace(
  'finalSummary.innerHTML = `<h3><i class="bi bi-trophy"></i> Bilan final</h3><div><p><span>Meilleure section</span><strong>${STAGES[bestIndex].label} · ${guided[bestIndex].overall}/100</strong></p><p><span>À retravailler</span><strong>${STAGES[needsIndex].label} · ${guided[needsIndex].overall}/100</strong></p><p><span>Évolution</span><strong>${firstAverage} → ${latestAverage}</strong></p><p><span>Défi final</span><strong>${stageScores[4].overall}/100</strong></p></div>`;',
  'finalSummary.innerHTML = \\`<h3><i class="bi bi-trophy"></i> Bilan final</h3><div><p><span>Meilleure section</span><strong>\\${STAGES[bestIndex].label} · \\${guided[bestIndex].overall}/100</strong></p><p><span>À retravailler</span><strong>\\${STAGES[needsIndex].label} · \\${guided[needsIndex].overall}/100</strong></p><p><span>Évolution</span><strong>\\${firstAverage} → \\${latestAverage}</strong></p><p><span>Défi final</span><strong>\\${stageScores[4].overall}/100</strong></p></div>\\`;'
);
fs.writeFileSync(filePath, source, "utf8");
console.log("Learning upgrader template literals escaped.");
