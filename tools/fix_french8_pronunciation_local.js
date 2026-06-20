const fs = require("fs");
const path = require("path");

const pagePath = path.join(
  __dirname,
  "..",
  "frances",
  "Niveau 8",
  "ateliers",
  "prononciation-01d-conditionnel-passe.html"
);

let source = fs.readFileSync(pagePath, "utf8");

const oldStyles = ".unsupported{padding:1rem;border-radius:14px;background:#ffe9eb;color:#8e1f2a;font-weight:700}";
const newStyles = ".unsupported{margin-top:1rem;padding:1rem;border-radius:14px;background:#ffe9eb;color:#8e1f2a;font-weight:700;line-height:1.5}.unsupported a{display:inline-flex;margin-top:.7rem;padding:.6rem .9rem;border-radius:999px;background:#8e1f2a;color:#fff;text-decoration:none;font-weight:900}";

const oldSupportCheck = 'renderReference();if(!SpeechRecognition||!navigator.mediaDevices){document.getElementById("unsupported").hidden=false;micButton.disabled=true;stopButton.disabled=true}';
const newSupportCheck = 'renderReference();const unsupported=document.getElementById("unsupported"),recordHelp=document.querySelector(".record-help"),isLocalFile=location.protocol==="file:";if(isLocalFile||!SpeechRecognition||!navigator.mediaDevices||!window.MediaRecorder){unsupported.hidden=false;micButton.disabled=true;stopButton.disabled=true;if(isLocalFile){recordStatus.textContent="Le microphone ne fonctionne pas en mode fichier";recordHelp.textContent="Ouvrez cette activité depuis localhost ou depuis le site HTTPS.";unsupported.innerHTML=\'<strong>Mode local détecté.</strong><br>Les navigateurs bloquent le microphone sur les adresses file://.<br><a href="http://127.0.0.1:8020/frances/Niveau%208/ateliers/prononciation-01d-conditionnel-passe.html"><i class="bi bi-box-arrow-up-right"></i> Ouvrir la version compatible</a>\'}else{recordStatus.textContent="Reconnaissance vocale indisponible"}}';

if (source.includes(oldStyles)) source = source.replace(oldStyles, newStyles);
if (source.includes(oldSupportCheck)) source = source.replace(oldSupportCheck, newSupportCheck);

if (!source.includes("Le microphone ne fonctionne pas en mode fichier")) {
  throw new Error("The local-file microphone guard was not installed.");
}

fs.writeFileSync(pagePath, source, "utf8");
console.log("French 8 pronunciation local-file guard installed.");
