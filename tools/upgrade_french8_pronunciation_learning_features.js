const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const clientPath = path.join(root, "assets", "js", "french8-pronunciation-sections.js");
const pagePath = path.join(root, "frances", "Niveau 8", "ateliers", "prononciation-01d-conditionnel-passe.html");
let client = fs.readFileSync(clientPath, "utf8");

const audioPaths = [1, 2, 3, 4].map((number) => `../audio/pronunciation/sections/section-${number}.wav`);
let sectionIndex = 0;
client = client.replace(/(shortLabel: "[1-4]",\n)/g, (match) => `${match}      audio: "${audioPaths[sectionIndex++]}",\n`);
client = client.replace('      final: true,\n      text:', '      final: true,\n      audio: "../audio/pronunciation/n8-01d-conditionnel-passe-modele-france.mp3",\n      text:');
client = client.replace(
  '  const API_PATH = "/api/french8/pronunciation-assessment";',
  '  const API_PATH = "/api/french8/pronunciation-assessment";\n  const STORAGE_KEY = "jaralingua:french8:pronunciation-01d:v1";'
);
client = client.replace(
  '  let currentStageIndex = 0;\n  const stageScores = Array(STAGES.length).fill(null);',
  `  let savedProgress = null;
  try { savedProgress = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"); } catch (_error) { savedProgress = null; }
  let currentStageIndex = Number.isInteger(savedProgress?.currentStageIndex) ? Math.max(0, Math.min(STAGES.length - 1, savedProgress.currentStageIndex)) : 0;
  const stageScores = Array.from({ length: STAGES.length }, (_, index) => savedProgress?.stageScores?.[index] || null);
  const attemptHistory = Array.from({ length: STAGES.length }, (_, index) => Array.isArray(savedProgress?.attemptHistory?.[index]) ? savedProgress.attemptHistory[index] : []);`
);
client = client.replace(
  '  let analyzing = false;',
  '  let analyzing = false;\n  let audioContext = null;\n  let analyser = null;\n  let meterFrame = null;\n  let maxInputLevel = 0;'
);
client = client.replace(
  '  document.getElementById("feedback").insertAdjacentElement("afterend", nextButton);',
  `  document.getElementById("feedback").insertAdjacentElement("afterend", nextButton);
  const retryButton = document.createElement("button");
  retryButton.type = "button";
  retryButton.className = "action-button retry-stage";
  retryButton.innerHTML = '<i class="bi bi-arrow-repeat"></i> Refaire cette section';
  retryButton.hidden = true;
  nextButton.insertAdjacentElement("beforebegin", retryButton);
  const wordHelp = document.createElement("div");
  wordHelp.className = "word-help";
  wordHelp.hidden = true;
  readingText.insertAdjacentElement("afterend", wordHelp);
  const levelMeter = document.createElement("div");
  levelMeter.className = "level-meter";
  levelMeter.innerHTML = '<span>Niveau du microphone</span><div><i id="levelMeterBar"></i></div><b id="levelMeterValue">En attente</b>';
  microphonePicker.insertAdjacentElement("afterend", levelMeter);
  const levelMeterBar = document.getElementById("levelMeterBar");
  const levelMeterValue = document.getElementById("levelMeterValue");
  const finalSummary = document.createElement("div");
  finalSummary.className = "final-summary";
  finalSummary.hidden = true;
  history.insertAdjacentElement("afterend", finalSummary);`
);
client = client.replace(
  '      return `<span class="reading-word ${state}" data-word="${index - 1}">${part}</span>`;',
  '      return `<button type="button" class="reading-word ${state}" data-word="${index - 1}" data-spoken="${normalizeWord(part)}" title="Écouter ce mot">${part}</button>`;'
);
client = client.replace(
  '    document.getElementById("resultTitle").textContent = `Résultat · ${stage.label}`;\n    renderHistory();',
  '    document.getElementById("resultTitle").textContent = `Résultat · ${stage.label}`;\n    modelAudio.pause();\n    modelAudio.src = stage.audio;\n    modelAudio.load();\n    modelButton.querySelector("i").className = "bi bi-play-fill";\n    document.querySelector(".player-copy span").textContent = stage.final ? "Modèle complet · défi final" : `Modèle audio · ${stage.label}`;\n    renderHistory();'
);
client = client.replace(
  '  function align(reference, spoken) {',
  `  function saveProgress() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ currentStageIndex, stageScores, attemptHistory }));
  }

  function pronunciationTip(word) {
    if (/on|an|en|in|ain|un/.test(word)) return "Voyelle nasale : laissez l'air passer aussi par le nez, sans prononcer le n final.";
    if (/r/.test(word)) return "Le r français se produit au fond de la gorge, sans rouler la langue.";
    if (/u/.test(word)) return "Pour le son u, arrondissez les lèvres comme pour ou, mais gardez la langue en position de i.";
    if (/ent$|s$|t$|d$/.test(word)) return "Attention à la consonne finale : elle est souvent muette en français.";
    return "Écoutez le mot, puis répétez-le lentement avant de le replacer dans la phrase.";
  }

  function speakWord(word) {
    if (!word || !window.speechSynthesis) return;
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = "fr-FR";
    utterance.rate = 0.78;
    speechSynthesis.speak(utterance);
    wordHelp.hidden = false;
    wordHelp.innerHTML = \`<strong><i class="bi bi-volume-up"></i> \${word}</strong><span>\${pronunciationTip(word)}</span>\`;
  }

  function startLevelMeter(stream) {
    stopLevelMeter();
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 1024;
    audioContext.createMediaStreamSource(stream).connect(analyser);
    const samples = new Uint8Array(analyser.fftSize);
    maxInputLevel = 0;
    const update = () => {
      analyser.getByteTimeDomainData(samples);
      let sum = 0;
      for (const sample of samples) { const value = (sample - 128) / 128; sum += value * value; }
      const rms = Math.sqrt(sum / samples.length);
      maxInputLevel = Math.max(maxInputLevel, rms);
      const percent = Math.min(100, Math.round(rms * 900));
      levelMeterBar.style.width = \`\${percent}%\`;
      levelMeterValue.textContent = percent < 4 ? "Parlez plus fort" : percent < 55 ? "Signal correct" : "Signal fort";
      meterFrame = requestAnimationFrame(update);
    };
    update();
  }

  function stopLevelMeter() {
    if (meterFrame) cancelAnimationFrame(meterFrame);
    meterFrame = null;
    analyser = null;
    if (audioContext) audioContext.close().catch(() => {});
    audioContext = null;
  }

  function align(reference, spoken) {`
);
client = client.replace(
  '    stageScores[currentStageIndex] = { overall, accuracy, completeness, fluency };',
  `    const previousAttempt = attemptHistory[currentStageIndex].at(-1) || null;
    const attempt = { overall, accuracy, completeness, fluency, at: new Date().toISOString() };
    attemptHistory[currentStageIndex].push(attempt);
    stageScores[currentStageIndex] = attempt;
    saveProgress();`
);
client = client.replace(
  '      feedback.textContent = feedbackFor(overall, missed, wpm);\n      nextButton.innerHTML',
  '      const comparison = previousAttempt ? ` ${overall > previousAttempt.overall ? "Vous avez gagné" : overall < previousAttempt.overall ? "Variation" : "Même résultat"}${overall === previousAttempt.overall ? "" : ` ${Math.abs(overall - previousAttempt.overall)} points`} par rapport à l’essai précédent.` : "";\n      feedback.textContent = feedbackFor(overall, missed, wpm) + comparison;\n      nextButton.innerHTML'
);
client = client.replace(
  '    nextButton.hidden = false;\n    renderHistory();',
  '    nextButton.hidden = false;\n    retryButton.hidden = false;\n    renderHistory();\n    if (currentStage().final) renderFinalSummary();'
);
client = client.replace(
  '  async function transcribeAndEvaluate(blob) {',
  `  function renderFinalSummary() {
    const guided = stageScores.slice(0, 4).filter(Boolean);
    if (!guided.length || !stageScores[4]) return;
    const bestIndex = guided.reduce((best, score, index) => score.overall > guided[best].overall ? index : best, 0);
    const needsIndex = guided.reduce((lowest, score, index) => score.overall < guided[lowest].overall ? index : lowest, 0);
    const firstAttempts = attemptHistory.flatMap((attempts) => attempts.slice(0, 1));
    const latestAttempts = stageScores.filter(Boolean);
    const firstAverage = firstAttempts.length ? Math.round(firstAttempts.reduce((sum, item) => sum + item.overall, 0) / firstAttempts.length) : 0;
    const latestAverage = latestAttempts.length ? Math.round(latestAttempts.reduce((sum, item) => sum + item.overall, 0) / latestAttempts.length) : 0;
    finalSummary.hidden = false;
    finalSummary.innerHTML = \`<h3><i class="bi bi-trophy"></i> Bilan final</h3><div><p><span>Meilleure section</span><strong>\${STAGES[bestIndex].label} · \${guided[bestIndex].overall}/100</strong></p><p><span>À retravailler</span><strong>\${STAGES[needsIndex].label} · \${guided[needsIndex].overall}/100</strong></p><p><span>Évolution</span><strong>\${firstAverage} → \${latestAverage}</strong></p><p><span>Défi final</span><strong>\${stageScores[4].overall}/100</strong></p></div>\`;
  }

  async function transcribeAndEvaluate(blob) {`
);
client = client.replace(
  '      mediaStream = await navigator.mediaDevices.getUserMedia({ audio: audioConstraints, video: false });',
  '      mediaStream = await navigator.mediaDevices.getUserMedia({ audio: audioConstraints, video: false });\n      startLevelMeter(mediaStream);'
);
client = client.replace(
  '  function stopTracks() {\n    mediaStream?.getTracks().forEach((track) => track.stop());',
  '  function stopTracks() {\n    stopLevelMeter();\n    mediaStream?.getTracks().forEach((track) => track.stop());'
);
client = client.replace(
  '    nextButton.hidden = true;\n    setControls(false, false);',
  '    nextButton.hidden = true;\n    retryButton.hidden = true;\n    wordHelp.hidden = true;\n    finalSummary.hidden = true;\n    levelMeterBar.style.width = "0%";\n    levelMeterValue.textContent = "En attente";\n    setControls(false, false);'
);
client = client.replace(
  '      stageScores.fill(null);\n    } else {',
  '      stageScores.fill(null);\n      attemptHistory.forEach((attempts) => attempts.splice(0));\n      localStorage.removeItem(STORAGE_KEY);\n    } else {'
);
client = client.replace(
  '    resetAttempt(true);\n    updateStageUI();',
  '    saveProgress();\n    resetAttempt(true);\n    updateStageUI();'
);
client = client.replace(
  '  nextButton.addEventListener("click", advanceStage);',
  '  nextButton.addEventListener("click", advanceStage);\n  retryButton.addEventListener("click", () => resetAttempt(true));\n  readingText.addEventListener("click", (event) => { const word = event.target.closest(".reading-word")?.dataset.spoken; if (word) speakWord(word); });'
);

if (!client.includes("startLevelMeter") || !client.includes("attemptHistory") || !client.includes("section-4.wav") || !client.includes("renderFinalSummary")) {
  throw new Error("One or more learning features were not installed.");
}
fs.writeFileSync(clientPath, client, "utf8");

let page = fs.readFileSync(pagePath, "utf8");
page = page.replace(
  "@keyframes pulse",
  ".reading-word{border:0;background:transparent;font:inherit;text-align:inherit;cursor:pointer}.reading-word:hover{background:#eaf2ff}.word-help{display:grid;gap:.25rem;margin:-.5rem 0 1rem;padding:.85rem;border-radius:12px;background:#eef5ff;color:var(--muted)}.word-help strong{color:var(--blue-dark)}.word-help[hidden]{display:none}.level-meter{display:grid;grid-template-columns:auto 1fr auto;gap:.65rem;align-items:center;max-width:620px;margin:0 auto 1rem;color:var(--muted);font-size:.78rem;font-weight:800}.level-meter>div{height:10px;border-radius:999px;background:#e3eaf4;overflow:hidden}.level-meter i{display:block;width:0;height:100%;border-radius:inherit;background:linear-gradient(90deg,var(--green),var(--yellow),var(--red));transition:width .1s}.level-meter b{min-width:88px;color:var(--blue-dark)}.retry-stage{width:100%;justify-content:center;margin-top:.8rem;background:#eef5ff;color:var(--blue-dark)}.retry-stage[hidden]{display:none}.final-summary{margin-top:1rem;padding:1rem;border-radius:14px;background:linear-gradient(135deg,#fff7df,#eef5ff)}.final-summary[hidden]{display:none}.final-summary h3{font-size:1rem;margin:0 0 .7rem}.final-summary>div{display:grid;grid-template-columns:repeat(2,1fr);gap:.5rem}.final-summary p{display:grid;margin:0;padding:.65rem;border-radius:10px;background:#fff}.final-summary span{font-size:.7rem;color:var(--muted)}.final-summary strong{color:var(--blue-dark)}@media(max-width:575px){.level-meter{grid-template-columns:1fr}.final-summary>div{grid-template-columns:1fr}}@keyframes pulse"
);
fs.writeFileSync(pagePath, page, "utf8");
console.log("French 8 learning features installed.");
