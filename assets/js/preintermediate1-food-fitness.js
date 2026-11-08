/* Unit 3 page 2 Tasks 1-2: independent practice and recoverable drafts. */
(() => {
 'use strict';
 const raw=document.getElementById('ff-data');if(!raw)return;
 const data=JSON.parse(raw.textContent),key='jl-pi1-unit3-food-fitness-v1',states={},backups={},renders=[];
 const copy=x=>JSON.parse(JSON.stringify(x));
 const normalize=s=>s.normalize('NFKC').toLowerCase().trim().replace(/[\-‐‑‒–—−\s]+/g,' ').replace(/[.!?,;:]+$/g,'').trim();
 let saved={},canSave=true,vocabulary=null;
 const storageStatus=document.getElementById('ff-storage-status');
 function unavailable(){canSave=false;storageStatus.hidden=false;storageStatus.textContent='This browser cannot save your draft. Keep the page open or use the original PDF to work on paper.';}
 try{saved=JSON.parse(sessionStorage.getItem(key)||'{}')||{};}catch(_){unavailable();}
 function persist(){if(!canSave)return;try{sessionStorage.setItem(key,JSON.stringify({states,backups}));}catch(_){unavailable();}}
 document.querySelectorAll('[data-ff-task]').forEach(section=>{
  const id=section.dataset.ffTask,items=data.tasks[id],isDefinitions=id==='definitions',fields=[...section.querySelectorAll(isDefinitions?'select':'input')],feedback=[...section.querySelectorAll('.ff-feedback')],models=[...section.querySelectorAll('.ff-model')];
  const result=section.querySelector('.ff-result'),undo=section.querySelector('[data-ff-undo]'),canon=answers=>answers.map((a,i)=>isDefinitions?a:(items[i].accepted.some(v=>normalize(v)===normalize(a))?normalize(items[i].answer):normalize(a))),signature=answers=>JSON.stringify(canon(answers));
  const empty=()=>({answers:items.map(()=>''),attempts:[],checked:''});
  function complete(answers){return Array.isArray(answers)&&answers.length===items.length&&answers.every(a=>typeof a==='string'&&(isDefinitions?data.words.includes(a):normalize(a).length>0));}
  function validAttempt(s){try{const a=JSON.parse(s);return typeof s==='string'&&complete(a)&&JSON.stringify(canon(a))===s;}catch(_){return false;}}
  function valid(s){return s&&Array.isArray(s.answers)&&s.answers.length===items.length&&s.answers.every(a=>typeof a==='string'&&(!isDefinitions||a===''||data.words.includes(a)))&&Array.isArray(s.attempts)&&s.attempts.length<=2&&new Set(s.attempts).size===s.attempts.length&&s.attempts.every(validAttempt)&&typeof s.checked==='string'&&(!s.checked||(complete(s.answers)&&s.checked===signature(s.answers)&&s.attempts.includes(s.checked)));}
  let state=states[id]=valid(saved.states?.[id])?copy(saved.states[id]):empty();
  if(valid(saved.backups?.[id]))backups[id]=copy(saved.backups[id]);
  function hide(){result.hidden=true;result.textContent='';feedback.forEach(f=>{f.hidden=true;f.textContent='';delete f.dataset.accepted;});models.forEach(m=>m.hidden=true);}
  function count(){section.querySelector('.ff-count').textContent=`${state.answers.filter(a=>isDefinitions?Boolean(a):Boolean(normalize(a))).length} of ${items.length} answered.`;}
  function explain(){
   const correct=items.map((item,i)=>isDefinitions?state.answers[i]===item.answer:item.accepted.some(a=>normalize(a)===normalize(state.answers[i]))),total=correct.filter(Boolean).length,reveal=state.attempts.length>=2||total===items.length;
   result.hidden=false;result.textContent=`${total} of ${items.length} answers correct. `+(reveal?'Read the explanations, then review any answers you want to change.':'Try a different complete set of answers. Repeating the same answers does not unlock explanations.');
   if(reveal)feedback.forEach((f,i)=>{f.hidden=false;f.dataset.accepted=String(correct[i]);const term=document.createElement('span');term.textContent=items[i].answer;f.replaceChildren(document.createTextNode((correct[i]?'Correct.':'Review this answer.')+' Answer: '),term,document.createTextNode('. '+items[i].explanation));vocabulary?.render(term,term.textContent);});
   if(reveal)models.forEach(m=>m.hidden=false);
  }
  function render(){fields.forEach((field,i)=>{field.value=state.answers[i];field.removeAttribute('aria-invalid');});hide();count();undo.hidden=!backups[id];if(state.checked===signature(state.answers))explain();}
  fields.forEach((field,i)=>field.addEventListener(isDefinitions?'change':'input',()=>{
   state.answers[i]=isDefinitions?(data.words.includes(field.value)?field.value:''):field.value;
   state.checked='';delete backups[id];undo.hidden=true;field.removeAttribute('aria-invalid');hide();count();stop();vocabulary?.hide();persist();
  }));
  section.querySelector('[data-ff-check]').addEventListener('click',()=>{
   hide();const missing=state.answers.findIndex(a=>isDefinitions?!a:!normalize(a));
   if(missing>=0){result.hidden=false;result.textContent=`${isDefinitions?'Choose a word for':'Complete'} all five ${isDefinitions?'definitions':'sentences'} before checking. Your work is still here.`;fields[missing].setAttribute('aria-invalid','true');fields[missing].focus();return;}
   const current=signature(state.answers);if(!state.attempts.includes(current)){if(state.attempts.length<2)state.attempts.push(current);else state.attempts[1]=current;}
   state.checked=current;explain();persist();result.focus();
  });
  section.querySelector('[data-ff-reset]').addEventListener('click',()=>{if(state.answers.some(a=>a.length)||state.attempts.length)backups[id]=copy(state);state=states[id]=empty();stop();vocabulary?.hide();render();persist();fields[0].focus();});
  undo.addEventListener('click',()=>{if(!valid(backups[id]))return;state=states[id]=copy(backups[id]);delete backups[id];stop();vocabulary?.hide();render();persist();fields[0].focus();});
  // Initial rendering is deferred until the shared audio and glossary are ready.
  renders.push(render);
 });
 const audio=document.getElementById('ff-audio'),audioStatus=document.getElementById('ff-audio-status');let speed=1,token=0;
 function stop(){token++;audio.pause();vocabulary?.setPlaying(null);audioStatus.textContent='Audio stopped.';}
 async function play(path,text,button=null){stop();const request=++token;audio.src=path;audio.playbackRate=speed;vocabulary?.setPlaying(button);audioStatus.textContent='Loading audio: '+text;try{await audio.play();if(request===token)audioStatus.textContent='Playing: '+text;}catch(_){if(request===token){stop();audioStatus.textContent='Audio could not play. Check your connection and tap again to retry.';}}}
 if(window.FirstVisitVocabulary){vocabulary=window.FirstVisitVocabulary(data.vocabulary,(entry,button)=>play(entry.audio,entry.term,button));document.querySelectorAll('[data-glossary]').forEach(el=>vocabulary.render(el,el.textContent));}
 document.querySelectorAll('[data-ff-audio]').forEach(button=>button.addEventListener('click',()=>{const item=data.audio[button.dataset.ffAudio];if(item)play(item.path,item.text);}));
 document.querySelectorAll('[data-ff-speed]').forEach(button=>button.addEventListener('click',()=>{speed=Number(button.dataset.ffSpeed);audio.playbackRate=speed;document.querySelectorAll('[data-ff-speed]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.ffSpeed)===speed)));audioStatus.textContent='Audio speed: '+speed+'×.';}));
 document.querySelector('[data-ff-stop]').addEventListener('click',()=>{stop();audioStatus.textContent='Audio stopped.';});
 audio.addEventListener('ended',()=>{stop();audioStatus.textContent='Finished. Tap to listen again.';});audio.addEventListener('error',()=>{stop();audioStatus.textContent='Audio could not load. Check your connection and tap again to retry.';});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){stop();vocabulary?.hide();persist();}});window.addEventListener('pagehide',()=>{stop();vocabulary?.hide();persist();});
 function openHash(){let id;try{id=decodeURIComponent(location.hash.slice(1));}catch(_){return;}const target=id&&document.getElementById(id);if(!target)return;let folder=target.closest('details');while(folder){folder.open=true;folder=folder.parentElement?.closest('details');}target.scrollIntoView({block:'start'});}
 renders.forEach(render=>render());window.addEventListener('hashchange',openHash);if(location.hash)openHash();
})();
