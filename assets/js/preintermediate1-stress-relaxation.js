/* Authored session-8 practice: independent exercises and complete-attempt feedback. */
(() => {
  'use strict';
  const raw=document.getElementById('sr-data');if(!raw)return;
  const data=JSON.parse(raw.textContent),key='jl-pi1-unit3-stress-relaxation-v1';
  const audio=document.getElementById('sr-audio'),status=document.getElementById('sr-audio-status'),storageStatus=document.getElementById('sr-storage-status');
  let saved={},storageAvailable=true,vocabulary=null,speed=1,token=0;
  function unavailable(){storageAvailable=false;storageStatus.hidden=false;storageStatus.textContent='This browser cannot save your draft. Keep this page open and copy your answers before leaving.';}
  try{saved=JSON.parse(sessionStorage.getItem(key)||'{}')||{};}catch(_){unavailable();}
  const states={},backups=saved.backups&&typeof saved.backups==='object'&&!Array.isArray(saved.backups)?saved.backups:{};
  const copy=v=>JSON.parse(JSON.stringify(v));
  function persist(){if(!storageAvailable)return;try{sessionStorage.setItem(key,JSON.stringify({tasks:states,backups}));}catch(_){unavailable();}}
  function normalize(s){return s.normalize('NFKC').toLowerCase().replace(/[’‘]/g,"'").replace(/\bshouldn't\b/g,'should not').replace(/\bmustn't\b/g,'must not').replace(/\bdoesn't\b/g,'does not').replace(/\bdon't\b/g,'do not').replace(/\bisn't\b/g,'is not').replace(/\baren't\b/g,'are not').replace(/\bi'm\b/g,'i am').replace(/\b(she|he|it)'s\b/g,'$1 is').replace(/\b(we|you|they)'re\b/g,'$1 are').replace(/[^a-z0-9]+/g,' ').replace(/\b(six|eight)\b/g,w=>({six:'6',eight:'8'})[w]).trim();}
  function stop(){token++;audio.pause();vocabulary?.setPlaying(null);}
  async function play(item,button=null,owner=''){stop();const request=++token;audio.dataset.owner=owner;audio.src=item.path;audio.playbackRate=speed;vocabulary?.setPlaying(button);status.textContent='Loading audio: '+item.text;try{await audio.play();if(request===token)status.textContent='Playing: '+item.text;}catch(_){if(request===token){stop();status.textContent='Audio could not play. Check your connection and tap again to retry.';}}}
  document.querySelectorAll('[data-sr-task]').forEach(section=>{
    const id=section.dataset.srTask,items=data.tasks[id],fields=[...section.querySelectorAll('textarea')],old=saved.tasks?.[id];
    const blank=()=>({answers:fields.map(()=>''),seen:[],last:''});
    function valid(v){return v&&Array.isArray(v.answers)&&v.answers.length===fields.length&&v.answers.every(a=>typeof a==='string')&&Array.isArray(v.seen)&&v.seen.length<=2&&v.seen.every(s=>typeof s==='string')&&new Set(v.seen).size===v.seen.length&&typeof v.last==='string';}
    const state=states[id]=valid(old)?copy(old):blank();
    const result=section.querySelector('.sr-result'),feedbacks=[...section.querySelectorAll('.sr-feedback')],models=[...section.querySelectorAll('[data-sr-model]')],undo=section.querySelector('[data-sr-undo]');
    if(!valid(backups[id]))delete backups[id];undo.hidden=!backups[id];
    const signature=()=>JSON.stringify(state.answers.map(normalize));
    const correct=()=>items.map((item,i)=>item.accepted.some(a=>normalize(a)===normalize(state.answers[i])));
    const revealed=()=>state.seen.length>=2||correct().every(Boolean);
    function hide(){result.hidden=true;result.textContent='';feedbacks.forEach(f=>{f.hidden=true;f.textContent='';});models.forEach(b=>b.hidden=true);if(audio.dataset.owner===id&&!audio.paused){stop();status.textContent='Model stopped. Check your revised answers to review the models.';}}
    function count(){section.querySelector('.sr-count').textContent=`${state.answers.filter(a=>a.trim()).length} of ${fields.length} answered.`;}
    function feedback(){const matches=correct(),total=matches.filter(Boolean).length;result.hidden=false;result.textContent=`${total} of ${fields.length} answers correct. `+(revealed()?'Read the explanations and listen to one complete sentence model for each answer.':'Try a different complete set of answers. Explanations and model audio appear after two different complete attempts.');if(revealed()){feedbacks.forEach((el,i)=>{el.hidden=false;el.dataset.accepted=String(matches[i]);el.textContent=`${matches[i]?'Correct.':'Review this answer.'} Model answer: ${items[i].answer} ${items[i].explanation}`;});models.forEach(b=>b.hidden=false);}}
    function render(){fields.forEach((f,i)=>{f.value=state.answers[i];f.removeAttribute('aria-invalid');});hide();count();if(state.answers.every(a=>a.trim())&&state.last===signature())feedback();}
    fields.forEach((field,i)=>field.addEventListener('input',()=>{state.answers[i]=field.value;delete backups[id];undo.hidden=true;field.removeAttribute('aria-invalid');hide();count();persist();}));
    section.querySelector('[data-sr-check]').addEventListener('click',()=>{hide();const missing=state.answers.findIndex(a=>!a.trim());if(missing>=0){result.hidden=false;result.textContent=`Complete all ${fields.length} answers before checking. Your draft is still here; no attempt was used.`;fields[missing].setAttribute('aria-invalid','true');fields[missing].focus();return;}const current=signature();if(!state.seen.includes(current)&&state.seen.length<2)state.seen.push(current);state.last=current;feedback();persist();result.focus();});
    section.querySelector('[data-sr-reset]').addEventListener('click',()=>{if(state.answers.some(a=>a.length)||state.last)backups[id]=copy(state);Object.assign(state,blank());render();undo.hidden=!backups[id];persist();fields[0].focus();});
    undo.addEventListener('click',()=>{if(!valid(backups[id]))return;Object.assign(state,copy(backups[id]));delete backups[id];undo.hidden=true;render();persist();fields[0].focus();});
    models.forEach(button=>button.addEventListener('click',()=>{if(button.hidden||state.last!==signature()||!state.answers.every(a=>a.trim())||!revealed())return;play(data.audio[button.dataset.srModel],null,id);}));
    render();
  });
  if(window.FirstVisitVocabulary){vocabulary=window.FirstVisitVocabulary(data.vocabulary,(entry,button)=>play({path:entry.audio,text:entry.term},button));document.querySelectorAll('[data-glossary]').forEach(el=>vocabulary.render(el,el.textContent));}
  document.querySelectorAll('[data-sr-audio]').forEach(b=>b.addEventListener('click',()=>play(data.audio[b.dataset.srAudio])));
  document.querySelectorAll('[data-sr-speed]').forEach(b=>b.addEventListener('click',()=>{speed=Number(b.dataset.srSpeed);audio.playbackRate=speed;document.querySelectorAll('[data-sr-speed]').forEach(x=>x.setAttribute('aria-pressed',String(Number(x.dataset.srSpeed)===speed)));status.textContent='Audio speed: '+speed+'×.';}));
  document.querySelector('[data-sr-stop]').addEventListener('click',()=>{stop();status.textContent='Audio stopped.';});
  audio.addEventListener('ended',()=>{stop();status.textContent='Finished. Tap to listen again.';});
  audio.addEventListener('error',()=>{stop();status.textContent='Audio could not load. Check your connection and tap again to retry.';});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){stop();vocabulary?.hide();persist();}});window.addEventListener('pagehide',()=>{stop();vocabulary?.hide();persist();});
  function openHash(){let id;try{id=decodeURIComponent(location.hash.slice(1));}catch(_){return;}const target=id&&document.getElementById(id);if(!target)return;let folder=target.closest('details');while(folder){folder.open=true;folder=folder.parentElement?.closest('details');}target.scrollIntoView({block:'start'});}
  window.addEventListener('hashchange',openHash);if(location.hash)openHash();
})();
