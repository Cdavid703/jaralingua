const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const jsPath = path.join(root, "assets", "js", "french8-pronunciation.js");
const pagePath = path.join(root, "frances", "Niveau 8", "ateliers", "prononciation-01d-conditionnel-passe.html");

let script = fs.readFileSync(jsPath, "utf8");
script = script.replace(
  'consentLabel.innerHTML = \'<input type="checkbox" id="audioConsent"> <span>J’accepte l’envoi temporaire de cet enregistrement à ElevenLabs pour sa transcription. JaraLingua ne le sauvegarde pas.</span>\';',
  'consentLabel.innerHTML = \'<input type="checkbox" id="audioConsent" checked hidden> <span><i class="bi bi-shield-check"></i> Cet enregistrement est analysé temporairement par Whisper sur le serveur JaraLingua. Il n’est ni envoyé à ElevenLabs ni sauvegardé.</span>\';'
);
script = script.replace("Analyse de votre lecture avec ElevenLabs…", "Analyse locale de votre lecture avec Whisper…");
script = script.replace("Cochez d’abord l’autorisation de transcription.", "La validation locale de l’enregistrement est requise.");
if (!script.includes("ni envoyé à ElevenLabs ni sauvegardé")) throw new Error("Local Whisper privacy message was not installed in JavaScript.");
fs.writeFileSync(jsPath, script, "utf8");

let page = fs.readFileSync(pagePath, "utf8");
page = page.replace("Votre transcription apparaîtra ici après l’analyse ElevenLabs.", "Votre transcription apparaîtra ici après l’analyse Whisper.");
page = page.replace(
  "Avec votre autorisation, l’enregistrement est envoyé temporairement à ElevenLabs pour sa transcription. JaraLingua ne le sauvegarde pas.",
  "L’enregistrement est analysé temporairement par Whisper sur le serveur JaraLingua, puis supprimé. Aucun audio n’est envoyé à ElevenLabs."
);
if (!page.includes("Aucun audio n’est envoyé à ElevenLabs")) throw new Error("Local Whisper privacy message was not installed in HTML.");
fs.writeFileSync(pagePath, page, "utf8");

console.log("French 8 pronunciation switched to local Whisper.");
