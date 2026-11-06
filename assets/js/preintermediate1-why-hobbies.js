/* Original reading tasks with isolated local drafts and evidence-based self-review. */
(() => {
  'use strict';
  const raw=document.getElementById('wh-data');if(!raw)return;
  const data=JSON.parse(raw.textContent),key='jl-pi1-unit2-why-hobbies-v1',states={};
  const storageStatus=document.getElementById('wh-storage-status');let saved={},storageAvailable=true;
  function unavailable(){storageAvailable=false;storageStatus.hidden=false;storageStatus.textContent='This browser cannot save your draft. Keep this page open and copy your written answers before leaving.';}
  try{saved=JSON.parse(sessionStorage.getItem(key)||'{}')||{};}catch(_){unavailable();}
  const backups=saved.backups&&typeof saved.backups==='object'&&!Array.isArray(saved.backups)?saved.backups:{};
  const copy=value=>JSON.parse(JSON.stringify(value));
  function persist(){if(!storageAvailable)return;try{sessionStorage.setItem(key,JSON.stringify({tasks:states,backups}));}catch(_){unavailable();}}
  function paragraph(text){const p=document.createElement('p');p.textContent=text;return p;}
  function addEvidence(el,item){if(!item.evidence)return;const quote=document.createElement('blockquote');quote.textContent=item.evidence;el.append(quote);if(item.profile){const p=data.profiles.find(p=>p.id===item.profile),link=document.createElement('a');link.href='#wh-profile-'+item.profile;link.className='wh-evidence-link';link.textContent='Read '+p.name+'’s profile';el.append(link);}}
  document.querySelectorAll('[data-wh-task]').forEach(section=>{
    const id=section.dataset.whTask,scored=id!=='written',items=data.tasks[id],fields=[...section.querySelectorAll('select,textarea')],old=saved.tasks?.[id],allowed=id==='table'?data.profiles.map(p=>p.id):['True','False'];
    const safe=a=>typeof a==='string'&&(!scored||a===''||allowed.includes(a))?a:'';
    const state=states[id]={answers:fields.map((_,i)=>safe(old?.answers?.[i])),attempts:Math.min(2,Math.max(0,Math.floor(Number(old?.attempts)||0))),last:typeof old?.last==='string'?old.last:''};
    const result=section.querySelector('.wh-result'),feedbacks=[...section.querySelectorAll('.wh-feedback')],undo=section.querySelector('[data-wh-undo]');
    const signature=()=>JSON.stringify(state.answers);
    const valid=b=>b&&Array.isArray(b.answers)&&b.answers.length===fields.length&&b.answers.every(a=>typeof a==='string'&&(!scored||a===''||allowed.includes(a)))&&typeof b.last==='string'&&Number.isFinite(b.attempts)&&b.attempts>=0&&b.attempts<=2;
    if(!valid(backups[id]))delete backups[id];undo.hidden=!backups[id];
    function hide(){result.hidden=true;result.textContent='';feedbacks.forEach(el=>{el.hidden=true;el.replaceChildren();el.removeAttribute('data-accepted');});}
    function count(){section.querySelector('.wh-count').textContent=`${state.answers.filter(a=>a.trim()).length} of ${fields.length} answered.`;}
    function feedback(){
      result.hidden=false;
      if(!scored){result.textContent='Your six written answers are kept in this browser tab. Compare questions 1–2 with the reading models and review the guidance for questions 3–6. This review does not automatically correct or score your writing.';feedbacks.forEach((el,i)=>{const item=items[i];el.hidden=false;if(item.kind==='text')el.append(paragraph('Reading model: '+item.model));el.append(paragraph(item.guidance));addEvidence(el,item);});return;}
      const correct=items.map((item,i)=>item.answer===state.answers[i]),total=correct.filter(Boolean).length,reveal=state.attempts>=2||total===items.length;
      result.textContent=`${total} of ${items.length} answers correct. `+(reveal?'Read the explanations and evidence, then revise anything you want to review.':'Read the profiles again and try a different complete set of answers. Explanations appear after two different complete attempts.');
      if(reveal)feedbacks.forEach((el,i)=>{const item=items[i],answer=id==='table'?data.profiles.find(p=>p.id===item.answer).name:item.answer;el.hidden=false;el.dataset.accepted=String(correct[i]);el.append(paragraph(`${correct[i]?'Correct.':'Review this answer.'} Answer: ${answer}.`),paragraph(item.explanation));addEvidence(el,item);});
    }
    function render(){fields.forEach((f,i)=>{f.value=state.answers[i];f.removeAttribute('aria-invalid');});hide();count();if(state.answers.every(a=>a.trim())&&state.last===signature())feedback();}
    fields.forEach((field,i)=>field.addEventListener(scored?'change':'input',()=>{state.answers[i]=field.value;delete backups[id];undo.hidden=true;field.removeAttribute('aria-invalid');hide();count();persist();}));
    section.querySelector('[data-wh-check]').addEventListener('click',()=>{hide();const missing=state.answers.findIndex(a=>!a.trim());if(missing>=0){result.hidden=false;result.textContent=`Complete all ${fields.length} ${id==='table'?'names':id==='tf'?'True/False choices':'written answers'} before reviewing. Your work is still here.`;fields[missing].setAttribute('aria-invalid','true');fields[missing].focus();return;}const current=signature();if(scored&&state.last!==current)state.attempts=Math.min(2,state.attempts+1);state.last=current;feedback();persist();result.focus();});
    section.querySelector('[data-wh-reset]').addEventListener('click',()=>{if(state.answers.some(a=>a.trim())||state.last)backups[id]=copy(state);state.answers=fields.map(()=>'');state.attempts=0;state.last='';render();undo.hidden=!backups[id];persist();fields[0].focus();});
    undo.addEventListener('click',()=>{if(!valid(backups[id]))return;Object.assign(state,backups[id]);delete backups[id];undo.hidden=true;render();persist();fields[0].focus();});render();
  });
  const audio=document.getElementById('wh-audio'),status=document.getElementById('wh-audio-status');let vocabulary=null,speed=1,token=0;
  function stop(){token++;audio.pause();vocabulary?.setPlaying(null);document.querySelectorAll('[data-wh-audio]').forEach(b=>{b.classList.remove('is-playing');b.setAttribute('aria-pressed','false');});}
  async function play(path,label,word=null,button=null){stop();const request=++token;audio.src=path;audio.playbackRate=speed;vocabulary?.setPlaying(word);button?.classList.add('is-playing');button?.setAttribute('aria-pressed','true');status.textContent='Loading audio: '+label;try{await audio.play();if(request===token)status.textContent='Playing: '+label;}catch(_){if(request===token){stop();status.textContent='Audio could not play. Check your connection and tap again to retry.';}}}
  if(window.FirstVisitVocabulary){vocabulary=window.FirstVisitVocabulary(data.vocabulary,(entry,button)=>play(entry.audio,entry.term,button));document.querySelectorAll('[data-glossary]').forEach(el=>vocabulary.render(el,el.textContent));}
  document.querySelectorAll('[data-wh-audio]').forEach(b=>{b.setAttribute('aria-pressed','false');b.addEventListener('click',()=>{const item=data.audio[b.dataset.whAudio];play(item.path,item.text,null,b);});});
  document.querySelectorAll('[data-wh-speed]').forEach(b=>b.addEventListener('click',()=>{speed=Number(b.dataset.whSpeed);audio.playbackRate=speed;document.querySelectorAll('[data-wh-speed]').forEach(x=>x.setAttribute('aria-pressed',String(Number(x.dataset.whSpeed)===speed)));status.textContent='Audio speed: '+speed+'×.';}));
  document.querySelector('[data-wh-stop]').addEventListener('click',()=>{stop();status.textContent='Audio stopped.';});audio.addEventListener('ended',()=>{stop();status.textContent='Finished. Tap to listen again.';});audio.addEventListener('error',()=>{stop();status.textContent='Audio could not load. Check your connection and tap again to retry.';});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){stop();vocabulary?.hide();persist();}});window.addEventListener('pagehide',()=>{stop();vocabulary?.hide();persist();});
  function openHash(){let id;try{id=decodeURIComponent(location.hash.slice(1));}catch(_){return;}const target=id&&document.getElementById(id);if(!target)return;let folder=target.closest('details');while(folder){folder.open=true;folder=folder.parentElement?.closest('details');}target.scrollIntoView({block:'start'});}
  window.addEventListener('hashchange',openHash);if(location.hash)openHash();
})();
