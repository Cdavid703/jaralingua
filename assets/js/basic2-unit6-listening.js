/* Independent practice. The full transcript is fetched only for authorized staff. */
(() => {
 'use strict';
 const $=id=>document.getElementById(id),audio=$('mapleAudio'),letters='ABC';
 const bank=[
  [
    "What does the customer first ask for?",
    "A bowl of vegetable soup.",
    "A plate of grilled chicken.",
    "A cheese sandwich.",
    "She begins with “I'd like a bowl of vegetable soup.” Bread is an additional request, not her main dish."
  ],
  [
    "Which ingredients does the server mention in the soup?",
    "Carrots, potatoes and salt.",
    "Carrots, cream and rice.",
    "Potatoes, chicken and cream.",
    "The server says there is no cream, then names carrots, potatoes and a little salt."
  ],
  [
    "How much salt is in the soup?",
    "A little.",
    "A lot.",
    "None.",
    "“A little salt” is a small amount, not no salt. Salt is uncountable in this context."
  ],
  [
    "The server says they “ran out of bread.” What does this mean?",
    "They have no bread left.",
    "They still need to warm the bread.",
    "They only have a small amount of bread.",
    "Run out of means to use all of something so none remains. Ran is the past form of run."
  ],
  [
    "What does the customer choose instead of bread?",
    "A little rice.",
    "A large bowl of rice.",
    "Two slices of toast.",
    "The server offers rice as a replacement, and she asks for just a little. The original bread request is not available."
  ],
  [
    "What does the server say about the soup's flavour?",
    "It is mild, not spicy.",
    "It is a little spicy.",
    "It is very spicy.",
    "He answers “No, it's mild” when she asks if the soup is spicy. Mild describes a gentle flavour here."
  ],
  [
    "Which drink matches the customer's order?",
    "A glass of water without ice.",
    "A glass of water with ice.",
    "A bottle of water without ice.",
    "She asks for a glass of water and adds “No ice.” Listen to both the container and the extra request."
  ],
  [
    "What does “I have a sweet tooth” tell us about the customer?",
    "She likes sweet foods.",
    "She prefers salty snacks.",
    "She needs food that is easy to chew.",
    "Have a sweet tooth is an idiom meaning to enjoy sweet foods, such as cake."
  ],
  [
    "What will the customer do with the cake?",
    "Take a small piece home.",
    "Eat a small piece at the café.",
    "Leave without ordering any cake.",
    "She says “A small piece to take home, please, not to eat here.” The order is for takeaway."
  ],
  [
    "How much is the complete order?",
    "Twelve dollars.",
    "Ten dollars.",
    "Fourteen dollars.",
    "The server says “That's twelve dollars altogether.” Altogether means the total, not the price of one item."
  ]
];
 const key='jaralingua:basic2:unit6:maple-cafe:v1';
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function rand(n){const a=new Uint32Array(1);crypto.getRandomValues(a);return a[0]%n;}
 function shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){const j=rand(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;}
 function newOrder(previous){
   let keys;
   do{keys=shuffle([0,0,0,1,1,1,2,2,2,rand(3)]);}
   while(keys.some((v,i)=>i>1&&v===keys[i-1]&&v===keys[i-2])||keys.slice(0,7).every((v,i)=>v===keys[i+3])||(previous&&keys.every((v,i)=>previous[i].indexOf(0)===v)));
   return keys.map(k=>{const wrong=shuffle([1,2]);return [0,1,2].map(i=>i===k?0:wrong.shift());});
 }
 let order=newOrder(),answers=Array(10).fill(null),checked=false,accessVersion=0;
 try{const s=JSON.parse(localStorage.getItem(key));if(s?.order?.length===10&&s.order.every(r=>Array.isArray(r)&&r.length===3&&[0,1,2].every(v=>r.includes(v)))){order=s.order;answers=Array.from({length:10},(_,i)=>[0,1,2].includes(s.answers?.[i])?s.answers[i]:null);checked=!!s.checked;}}catch(_){}
 function save(){try{localStorage.setItem(key,JSON.stringify({order,answers,checked}));}catch(_){}}
 function progress(){const done=answers.filter(a=>a!==null).length;$('answerProgress').textContent=done+' of 10 answered';}
 function render(){
   $('mapleQuestions').innerHTML=bank.map((q,i)=>'<fieldset class="maple-question" data-question="'+i+'"><legend>'+(i+1)+'. '+esc(q[0])+'</legend><div class="maple-choices">'+order[i].map((value,pos)=>'<label><input type="radio" name="maple-q-'+i+'" value="'+value+'"'+(answers[i]===value?' checked':'')+'><span><b>'+letters[pos]+'.</b> '+esc(q[value+1])+'</span></label>').join('')+'</div><p class="maple-feedback" hidden></p></fieldset>').join('');
   progress();if(checked)check();else clearFeedback();
 }
 function clearFeedback(){checked=false;$('quizScore').textContent='Not checked yet';$('quizResult').hidden=true;document.querySelectorAll('.maple-feedback').forEach(e=>e.hidden=true);document.querySelectorAll('.maple-choices label').forEach(e=>e.classList.remove('is-correct','is-wrong'));}
 function check(){
   checked=true;let score=0;
   bank.forEach((q,i)=>{const card=$('mapleQuestions').children[i],f=card.querySelector('.maple-feedback');f.hidden=false;card.querySelectorAll('label').forEach(l=>l.classList.remove('is-correct','is-wrong'));
     if(answers[i]===null){f.textContent='Choose an answer, then check again.';return;}
     const correct=answers[i]===0;if(correct)score++;
     card.querySelector('input[value="'+answers[i]+'"]').closest('label').classList.add(correct?'is-correct':'is-wrong');
     card.querySelector('input[value="0"]').closest('label').classList.add('is-correct');
     f.textContent=(correct?'Correct. ':'Correct answer: '+letters[order[i].indexOf(0)]+'. ')+q[4];
   });
   const missing=answers.filter(a=>a===null).length;
   $('quizScore').textContent='Score: '+score+' / 10';$('quizResult').hidden=false;
   $('quizResult').textContent=score+' of 10 correct.'+(missing?' '+missing+' unanswered.':'')+' Replay and review the explanations, then change any answer you want to improve.';
   progress();save();
 }
 $('mapleQuestions').addEventListener('change',e=>{if(!e.target.matches('input[type="radio"]'))return;answers[Number(e.target.closest('fieldset').dataset.question)]=Number(e.target.value);clearFeedback();progress();save();});
 $('mapleCheck').addEventListener('click',check);$('mapleCheckBottom').addEventListener('click',check);
 $('mapleReset').addEventListener('click',()=>{order=newOrder(order);answers=Array(10).fill(null);checked=false;render();save();});
 document.querySelectorAll('[data-speed]').forEach(b=>b.addEventListener('click',()=>{audio.playbackRate=Number(b.dataset.speed);document.querySelectorAll('[data-speed]').forEach(e=>e.setAttribute('aria-pressed',String(e===b)));$('speedStatus').textContent=audio.playbackRate===1?'Normal speed · 42 seconds':'Slower playback · about 56 seconds';}));
 audio.addEventListener('error',()=>$('audioError').hidden=false);
 audio.addEventListener('canplay',()=>$('audioError').hidden=true);
 $('retryAudio').addEventListener('click',()=>{$('audioError').hidden=true;audio.load();});
 window.addEventListener('pagehide',()=>audio.pause());
 function user(){return window.JaraLinguaAuth?.getUser?.()||window.JaraLinguaCurrentUser;}
 function hideTranscript(){$('teacherTools').hidden=true;$('teacherTranscript').hidden=true;$('transcriptText').textContent='';$('transcriptToggle').setAttribute('aria-expanded','false');}
 async function updateAccess(){
   const request=++accessVersion;hideTranscript();const account=user();if(!account?.credential)return;
   const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000);
   try{
     const response=await fetch('/api/basic2/unit6-maple-cafe/transcript',{cache:'no-store',headers:{Authorization:'Bearer '+account.credential,'X-Jaralingua-Auth-Provider':account.provider||'google'},signal:controller.signal});
     if(!response.ok)return;const data=await response.json();
     if(request!==accessVersion||user()?.credential!==account.credential)return;
     if(typeof data.transcript==='string'&&data.transcript){$('transcriptText').textContent=data.transcript;$('teacherTools').hidden=false;}
   }catch(_){/* Fail closed, including offline and expired accounts. */}finally{clearTimeout(timer);}
 }
 $('transcriptToggle').addEventListener('click',()=>{if(!user()?.credential){updateAccess();return;}const open=$('teacherTranscript').hidden;$('teacherTranscript').hidden=!open;$('transcriptToggle').setAttribute('aria-expanded',String(open));});
 $('transcriptDownload').addEventListener('click',()=>{if($('teacherTools').hidden||!user()?.credential)return;const u=URL.createObjectURL(new Blob(['Lunch at Maple Café\n\n'+$('transcriptText').textContent],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=u;a.download='unit6-maple-cafe-teacher-transcript.txt';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);});
 window.addEventListener('jaralingua:auth-changed',updateAccess);window.addEventListener('focus',updateAccess);window.addEventListener('storage',updateAccess);
 render();updateAccess();
})();
