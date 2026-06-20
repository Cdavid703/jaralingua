const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "..", "assets", "js", "french8-pronunciation-sections.js");
let source = fs.readFileSync(filePath, "utf8");

source = source.replace(
  '  function tokens(value) {\n    return value.split(/\\s+/).map(normalizeWord).filter(Boolean);\n  }',
  `  function tokens(value) {
    return value.split(/\\s+/).map(normalizeWord).filter(Boolean);
  }

  function spokenWord(value) {
    return value.replace(/[.,!?;:()[\\]{}\u00ab\u00bb"]/g, "").trim();
  }`
);

source = source.replace(
  'data-spoken="${normalizeWord(part)}"',
  'data-spoken="${spokenWord(part)}"'
);

const oldTipStart = '  function pronunciationTip(word) {';
const oldTipEnd = '\n  function speakWord(word) {';
const tipStartIndex = source.indexOf(oldTipStart);
const tipEndIndex = source.indexOf(oldTipEnd, tipStartIndex);
if (tipStartIndex < 0 || tipEndIndex < 0) throw new Error("Pronunciation tip function not found.");
const refinedTips = `  function pronunciationTip(word) {
    const lower = word.toLocaleLowerCase("fr-FR");
    if (/[é]/.test(lower) || /(?:er|ez)$/.test(lower)) return "Le son é se prononce /e/, comme une voyelle fermée et nette. Dans préparé, le dernier é se prononce clairement.";
    if (/[èêë]/.test(lower) || /(?:ais|ait|aient)$/.test(lower)) return "Le son è se prononce /ɛ/, avec la bouche un peu plus ouverte que pour é.";
    if (/eau|au/.test(lower)) return "Le groupe eau ou au se prononce /o/ : gardez les lèvres arrondies.";
    if (/ou/.test(lower)) return "Le groupe ou se prononce /u/, avec les lèvres bien arrondies.";
    if (/u/.test(lower)) return "Pour le son u /y/, arrondissez les lèvres comme pour ou, mais gardez la langue en position de i.";
    if (/(?:an|en|on|in|ain|ein|un)/.test(lower)) return "Voyelle nasale : laissez passer l’air par le nez sans prononcer séparément le n final.";
    if (/oi/.test(lower)) return "Le groupe oi se prononce /wa/, en une seule émission fluide.";
    if (/gn/.test(lower)) return "Le groupe gn se prononce /ɲ/, comme le ñ espagnol.";
    if (/ch/.test(lower)) return "Le groupe ch se prononce /ʃ/, comme le son ch dans chat.";
    if (/r/.test(lower)) return "Le r français se produit doucement au fond de la gorge, sans rouler la langue.";
    if (/(?:ent|s|t|d|x|z)$/.test(lower)) return "Attention à la consonne finale : elle est souvent muette en français.";
    return "Écoutez le mot complet, puis répétez-le lentement en conservant tous ses accents et ses syllabes.";
  }
`;
source = source.slice(0, tipStartIndex) + refinedTips + source.slice(tipEndIndex);

source = source.replace(
  '    const utterance = new SpeechSynthesisUtterance(word);\n    utterance.lang = "fr-FR";\n    utterance.rate = 0.78;',
  `    const utterance = new SpeechSynthesisUtterance(word);
    const voices = speechSynthesis.getVoices();
    const frenchVoice = voices.find((voice) => voice.lang.toLowerCase() === "fr-fr") || voices.find((voice) => voice.lang.toLowerCase().startsWith("fr"));
    utterance.lang = "fr-FR";
    if (frenchVoice) utterance.voice = frenchVoice;
    utterance.rate = 0.72;`
);

if (!source.includes("spokenWord(part)") || !source.includes("le dernier é se prononce clairement") || !source.includes("voice.lang.toLowerCase()")) {
  throw new Error("French word pronunciation refinement was not installed.");
}
fs.writeFileSync(filePath, source, "utf8");
console.log("French word spelling, accents, voice selection, and tips refined.");
