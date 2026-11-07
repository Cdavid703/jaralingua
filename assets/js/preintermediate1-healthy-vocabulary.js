/* Unit 3: original nine picture matches; personal tasks belong to Speaking. */
(() => {
 'use strict';
 const raw=document.getElementById('hlv-data');if(!raw)return;
 const data=JSON.parse(raw.textContent),key='jl-pi1-unit3-healthy-vocabulary-v1';
 const fields=[...document.querySelectorAll('#hlv-practice select')],feedback=[...document.querySelectorAll('.hlv-feedback')];
 const result=document.getElementById('hlv-result'),undo=document.getElementById('hlv-undo'),storageStatus=document.getElementById('hlv-storage-status');
 const clone=x=>JSON.parse(JSON.stringify(x)),signature=x=>JSON.stringify(x);
 const empty=()=>({answers:data.pictures.map(()=>''),attempts:[],checked:''});
 const isComplete=a=>Array.isArray(a)&&a.length===data.pictures.length&&a.every(w=>data.words.includes(w));
 function validAttempt(s){try{return typeof s==='string'&&isComplete(JSON.parse(s));}catch(_){return false;}}
 function valid(s){return s&&Array.isArray(s.answers)&&s.answers.length===data.pictures.length&&s.answers.every(w=>w===''||data.words.includes(w))&&Array.isArray(s.attempts)&&s.attempts.length<=2&&new Set(s.attempts).size===s.attempts.length&&s.attempts.every(validAttempt)&&typeof s.checked==='string'&&(!s.checked||(isComplete(s.answers)&&s.checked===signature(s.answers)&&s.attempts.includes(s.checked)));}
 let state=empty(),backup=null,canSave=true;
 function unavailable(){canSave=false;storageStatus.hidden=false;storageStatus.textContent='This browser cannot save your draft. Keep this page open or use the original PDF to work on paper.';}
 try{const saved=JSON.parse(sessionStorage.getItem(key)||'{}');if(valid(saved?.state))state=clone(saved.state);if(valid(saved?.backup))backup=clone(saved.backup);}catch(_){unavailable();}
 function persist(){if(!canSave)return;try{sessionStorage.setItem(key,JSON.stringify({state,backup}));}catch(_){unavailable();}}
 let vocabulary=null;
 function hide(){result.hidden=true;result.textContent='';feedback.forEach(el=>{el.hidden=true;el.textContent='';delete el.dataset.accepted;});}
 function explain(){
  const correct=data.pictures.map((p,i)=>p.answer===state.answers[i]),total=correct.filter(Boolean).length,reveal=state.attempts.length>=2||total===data.pictures.length;
  result.hidden=false;result.textContent=`${total} of ${data.pictures.length} answers correct. `+(reveal?'Read the explanations, then change anything you want to review.':'Try a different complete set of answers. Explanations appear after two different complete attempts.');
  if(reveal)feedback.forEach((el,i)=>{el.hidden=false;el.dataset.accepted=String(correct[i]);const label=document.createElement('span');label.textContent=data.pictures[i].answer;const lead=document.createTextNode((correct[i]?'Correct.':'Review this answer.')+' Answer: '),end=document.createTextNode('. '+data.pictures[i].explanation);el.replaceChildren(lead,label,end);if(vocabulary)vocabulary.render(label,label.textContent);});
 }
 function render(){fields.forEach((f,i)=>{f.value=state.answers[i];f.removeAttribute('aria-invalid');});hide();undo.hidden=!backup;document.getElementById('hlv-count').textContent=`${state.answers.filter(Boolean).length} of ${fields.length} answered.`;if(state.checked===signature(state.answers))explain();}
 fields.forEach((field,i)=>field.addEventListener('change',()=>{state.answers[i]=data.words.includes(field.value)?field.value:'';state.checked='';backup=null;vocabulary?.hide();stop();render();persist();}));
 document.getElementById('hlv-check').addEventListener('click',()=>{
  hide();const missing=state.answers.findIndex(a=>!a);
  if(missing>=0){result.hidden=false;result.textContent='Choose a word for all nine pictures before checking. Your answers are still here.';fields[missing].setAttribute('aria-invalid','true');fields[missing].focus();return;}
  const current=signature(state.answers);if(!state.attempts.includes(current)&&state.attempts.length<2)state.attempts.push(current);
  // Once explanations are unlocked, persist the last checked set without growing attempt history.
  if(!state.attempts.includes(current)&&state.attempts.length===2)state.attempts[1]=current;
  state.checked=current;explain();persist();result.focus();
 });
 document.getElementById('hlv-reset').addEventListener('click',()=>{if(state.answers.some(Boolean)||state.attempts.length)backup=clone(state);state=empty();stop();vocabulary?.hide();render();persist();fields[0].focus();});
 undo.addEventListener('click',()=>{if(!valid(backup))return;state=clone(backup);backup=null;stop();vocabulary?.hide();render();persist();fields[0].focus();});
 const audio=document.getElementById('hlv-audio'),audioStatus=document.getElementById('hlv-audio-status');let speed=1,token=0;
 function stop(){token++;audio.pause();vocabulary?.setPlaying(null);}
 async function play(path,text,button=null){stop();const request=++token;audio.src=path;audio.playbackRate=speed;vocabulary?.setPlaying(button);audioStatus.textContent='Loading audio: '+text;try{await audio.play();if(request===token)audioStatus.textContent='Playing: '+text;}catch(_){if(request===token){stop();audioStatus.textContent='Audio could not play. Check your connection and tap again to retry.';}}}
 if(window.FirstVisitVocabulary){vocabulary=window.FirstVisitVocabulary(data.vocabulary,(entry,button)=>play(entry.audio,entry.term,button));document.querySelectorAll('[data-glossary]').forEach(el=>vocabulary.render(el,el.textContent));}
 document.querySelector('[data-hlv-instruction]').addEventListener('click',()=>play(data.instruction.path,data.instruction.text));
 document.querySelectorAll('[data-hlv-speed]').forEach(button=>button.addEventListener('click',()=>{speed=Number(button.dataset.hlvSpeed);audio.playbackRate=speed;document.querySelectorAll('[data-hlv-speed]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.hlvSpeed)===speed)));audioStatus.textContent='Audio speed: '+speed+'×.';}));
 document.querySelector('[data-hlv-stop]').addEventListener('click',()=>{stop();audioStatus.textContent='Audio stopped.';});
 audio.addEventListener('ended',()=>{stop();audioStatus.textContent='Finished. Tap to listen again.';});
 audio.addEventListener('error',()=>{stop();audioStatus.textContent='Audio could not load. Check your connection and tap again to retry.';});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){stop();vocabulary?.hide();persist();}});
 window.addEventListener('pagehide',()=>{stop();vocabulary?.hide();persist();});
 function openHash(){let id;try{id=decodeURIComponent(location.hash.slice(1));}catch(_){return;}const target=id&&document.getElementById(id);if(!target)return;let folder=target.closest('details');while(folder){folder.open=true;folder=folder.parentElement?.closest('details');}target.scrollIntoView({block:'start'});}
 window.addEventListener('hashchange',openHash);render();if(location.hash)openHash();
})();
