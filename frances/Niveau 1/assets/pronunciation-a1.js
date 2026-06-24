(function(){
const sets={
"theme-1":{title:"Premiers contacts",audio:"../audio/prononciation/theme-1-premiers-contacts.mp3",challenges:["Bonjour, je m’appelle Lina.","Je suis colombienne et j’habite à Bogotá.","Enchantée ! Comment vous appelez-vous ?"]},
"theme-2":{title:"Les verbes du premier groupe",audio:"../audio/prononciation/theme-2-verbes-er.mp3",challenges:["Je parle français tous les jours.","Tu écoutes la radio le matin.","Nous travaillons ensemble."]},
"theme-3":{title:"Être, avoir, aller et faire",audio:"../audio/prononciation/theme-3-verbes-essentiels.mp3",challenges:["Je suis étudiante et j’ai vingt ans.","Je vais en cours à huit heures.","Je fais mes exercices le soir."]},
"theme-4":{title:"Famille et relations",audio:"../audio/prononciation/theme-4-famille.mp3",challenges:["Voici ma famille.","Mon frère s’appelle Lucas.","Mes grands-parents habitent à Lyon."]},
"theme-5":{title:"Description et personnalité",audio:"../audio/prononciation/theme-5-description.mp3",challenges:["Elle est souriante et généreuse.","Elle a les cheveux noirs.","Elle porte des lunettes rondes."]}
};
const key=new URLSearchParams(location.search).get("theme")||"theme-1",set=sets[key]||sets["theme-1"];
document.getElementById("pronTitle").textContent=set.title; document.getElementById("modelAudio").src=set.audio;
document.getElementById("challengeList").innerHTML=set.challenges.map((text,i)=>`<article class="challenge-card"><span>Défi ${i+1}</span><p>${text}</p><button type="button" class="btn-soft" data-challenge="${i}">Choisir ce défi</button></article>`).join("");
let selected=0,stream=null,recorder=null,chunks=[];
const status=document.getElementById("micStatus"),record=document.getElementById("recordBtn"),stop=document.getElementById("stopBtn"),playback=document.getElementById("recordingPlayback");
function choose(i){selected=i;document.getElementById("selectedText").textContent=set.challenges[i];document.querySelectorAll("[data-challenge]").forEach(b=>b.classList.toggle("active",Number(b.dataset.challenge)===i));}
document.querySelectorAll("[data-challenge]").forEach(b=>b.addEventListener("click",()=>choose(Number(b.dataset.challenge)))); choose(0);
async function requestMicrophone(){
 if(!window.isSecureContext&&!['localhost','127.0.0.1'].includes(location.hostname))throw new Error("secure_context");
 if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia)throw new Error("unsupported");
 stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}}); return stream;
}
record.addEventListener("click",async()=>{try{status.textContent="Demande d’autorisation du microphone…";await requestMicrophone();const types=["audio/webm;codecs=opus","audio/webm","audio/mp4"];const mime=types.find(t=>window.MediaRecorder&&MediaRecorder.isTypeSupported(t));recorder=mime?new MediaRecorder(stream,{mimeType:mime}):new MediaRecorder(stream);chunks=[];recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};recorder.onstop=()=>{const blob=new Blob(chunks,{type:recorder.mimeType||"audio/webm"});playback.src=URL.createObjectURL(blob);playback.hidden=false;stream.getTracks().forEach(t=>t.stop());stream=null;status.textContent="Enregistrement prêt. Écoutez-vous, puis comparez avec le modèle."};recorder.start();record.disabled=true;stop.disabled=false;status.textContent=`Enregistrement du défi : « ${set.challenges[selected]} »`; }catch(error){const messages={NotAllowedError:"Autorisation refusée. Ouvrez les paramètres du navigateur, autorisez le microphone pour JaraLingua et réessayez.",NotFoundError:"Aucun microphone n’a été détecté.",NotReadableError:"Le microphone est utilisé par une autre application.",secure_context:"Le microphone exige une connexion HTTPS sécurisée.",unsupported:"Ce navigateur ne prend pas en charge l’enregistrement audio."};status.textContent=messages[error.name]||messages[error.message]||`Impossible d’activer le microphone : ${error.message}`;}});
stop.addEventListener("click",()=>{if(recorder&&recorder.state==="recording")recorder.stop();record.disabled=false;stop.disabled=true;});
})();
