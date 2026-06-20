const fs = require("fs");
const path = require("path");

const pagePath = path.join(__dirname, "..", "frances", "Niveau 8", "ateliers", "prononciation-01d-conditionnel-passe.html");
let source = fs.readFileSync(pagePath, "utf8");

source = source.replace(
  '<script>\n    (() => {',
  '<script data-replaced-by="french8-pronunciation.js">\n    (() => {'
);

const inlineStart = source.lastIndexOf('<script data-replaced-by="french8-pronunciation.js">');
const inlineEnd = source.lastIndexOf("</script>");
if (inlineStart >= 0 && inlineEnd > inlineStart) {
  source = source.slice(0, inlineStart) + '<script src="../../../assets/js/french8-pronunciation.js"></script>\n' + source.slice(inlineEnd + 9);
}

source = source.replace(
  "Votre transcription apparaîtra ici pendant la lecture.",
  "Votre transcription apparaîtra ici après l’analyse ElevenLabs."
);
source = source.replace(
  "Votre enregistrement reste dans cette page et n'est pas sauvegardé par JaraLingua. La reconnaissance vocale peut être traitée par le service de votre navigateur.",
  "Avec votre autorisation, l’enregistrement est envoyé temporairement à ElevenLabs pour sa transcription. JaraLingua ne le sauvegarde pas."
);
source = source.replace(
  ".record-help{color:var(--muted);font-size:.9rem;margin:.35rem 0 0}",
  ".record-help{color:var(--muted);font-size:.9rem;margin:.35rem 0 0}.record-consent{display:flex;gap:.65rem;align-items:flex-start;text-align:left;margin:0 auto 1rem;padding:.85rem;max-width:620px;border-radius:12px;background:#fff7df;color:#5c4930;font-size:.86rem;line-height:1.45}.record-consent input{margin-top:.2rem;flex:0 0 auto}"
);

if (!source.includes('assets/js/french8-pronunciation.js')) throw new Error("External pronunciation script was not installed.");
fs.writeFileSync(pagePath, source, "utf8");
console.log("French 8 pronunciation upgraded to ElevenLabs Scribe.");
