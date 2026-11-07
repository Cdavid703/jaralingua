/* Original negative transformations and independent personal ability choices. */
(() => {
  'use strict';
  const raw=document.getElementById('mg-data');if(!raw)return;
  const data=JSON.parse(raw.textContent),key='jl-pi1-unit2-more-grammar-v1';
  const storageStatus=document.getElementById('mg-storage-status');
  const audio=document.getElementById('mg-audio'),audioStatus=document.getElementById('mg-audio-status');
  let saved={},storageAvailable=true,vocabulary=null,speed=1,token=0;const states={};
  function unavailable(){storageAvailable=false;storageStatus.hidden=false;storageStatus.textContent='This browser cannot save your draft. Keep this page open and copy your sentences before leaving.';}
  try{saved=JSON.parse(sessionStorage.getItem(key)||'{}')||{};}catch(_){unavailable();}
  const backups=saved.backups&&typeof saved.backups==='object'&&!Array.isArray(saved.backups)?saved.backups:{};
  const copy=value=>JSON.parse(JSON.stringify(value));
  function persist(){if(!storageAvailable)return;try{sessionStorage.setItem(key,JSON.stringify({tasks:states,backups}));}catch(_){unavailable();}}
  function normalize(value){return value.normalize('NFKC').trim().toLowerCase().replace(/[’‘]/g,"'").replace(/\bcan't\b/g,'cannot').replace(/\bcan\s+not\b/g,'cannot').replace(/[^a-z0-9']+/g,' ').trim();}
  function stop(){token++;audio.pause();vocabulary?.setPlaying(null);}
  async function play(path,text,button=null,gated=false){stop();const request=++token;audio.dataset.gated=String(gated);audio.dataset.personal='false';audio.src=path;audio.playbackRate=speed;vocabulary?.setPlaying(button);audioStatus.textContent='Loading audio: '+text;
    try{await audio.play();if(request===token)audioStatus.textContent='Playing: '+text;}catch(_){if(request===token){stop();audioStatus.textContent='Audio could not play. Check your connection and tap again to retry.';}}
  }
  document.querySelectorAll('[data-mg-task]').forEach(section=>{
    const id=section.dataset.mgTask,scored=id==='fixes',selects=id==='choices';
    const fields=[...section.querySelectorAll('select,textarea')],old=saved.tasks?.[id];
    const safeAnswer=a=>typeof a==='string'&&(!selects||['','can','can’t'].includes(a))?a:'';
    const state=states[id]={answers:fields.map((_,i)=>safeAnswer(old?.answers?.[i])),attempts:Math.min(2,Math.max(0,Math.floor(Number(old?.attempts)||0))),last:typeof old?.last==='string'?old.last:''};
    const result=section.querySelector('.mg-result'),feedbacks=[...section.querySelectorAll('.mg-feedback')],models=[...section.querySelectorAll('[data-mg-model]')],undo=section.querySelector('[data-mg-undo]');
    const signature=()=>JSON.stringify(state.answers.map(a=>scored?normalize(a):a));
    const valid=b=>b&&Array.isArray(b.answers)&&b.answers.length===fields.length&&b.answers.every(a=>typeof a==='string'&&(!selects||['','can','can’t'].includes(a)))&&typeof b.last==='string'&&Number.isFinite(b.attempts)&&b.attempts>=0&&b.attempts<=2;
    if(!valid(backups[id]))delete backups[id];undo.hidden=!backups[id];
    function hide(){result.hidden=true;result.textContent='';feedbacks.forEach(f=>{f.hidden=true;f.textContent='';});models.forEach(b=>b.hidden=true);if(scored&&audio.dataset.gated==='true'&&!audio.paused){stop();audioStatus.textContent='Negative model stopped. Check your revised answers to review the models.';}if(selects&&audio.dataset.personal==='true'&&!audio.paused){stop();audioStatus.textContent='Audio stopped. Listen to your updated personal sentence.';}}
    function count(){section.querySelector('.mg-count').textContent=`${state.answers.filter(a=>a.trim()).length} of ${fields.length} answered.`;}
    function feedback(){
      result.hidden=false;
      if(!scored){result.textContent=selects?'Your seven personal choices are kept in this browser tab. Read each whole sentence aloud with can or can’t. Your choices are personal and are not scored.':'Your six personal sentences are kept in this browser tab. Check that each uses I can or I can’t followed by a base verb and answers its prompt. This review does not automatically correct or score your sentences.';return;}
      const correct=data.fixes.map((item,i)=>item.accepted.some(a=>normalize(a)===normalize(state.answers[i]))),total=correct.filter(Boolean).length,reveal=state.attempts>=2||total===fields.length;
      result.textContent=`${total} of ${fields.length} negative sentences correct. `+(reveal?'Read the explanations and listen to the models, then revise anything you want to review.':'Try a different complete set of negative sentences. Explanations and model audio appear after two different complete attempts.');
      if(reveal){feedbacks.forEach((el,i)=>{el.hidden=false;el.dataset.accepted=String(correct[i]);el.textContent=`${correct[i]?'Correct.':'Review this answer.'} Model: ${data.fixes[i].model} ${data.fixes[i].explanation}`;});models.forEach(b=>b.hidden=false);}
    }
    function render(){fields.forEach((f,i)=>{f.value=state.answers[i];f.removeAttribute('aria-invalid');});hide();count();if(state.answers.every(a=>a.trim())&&state.last===signature())feedback();refreshPersonal();}
    fields.forEach((field,i)=>field.addEventListener(selects?'change':'input',()=>{state.answers[i]=field.value;delete backups[id];undo.hidden=true;field.removeAttribute('aria-invalid');hide();count();persist();}));
    section.querySelector('[data-mg-check]').addEventListener('click',()=>{
      hide();const missing=state.answers.findIndex(a=>!a.trim());
      if(missing>=0){result.hidden=false;result.textContent=`Complete all ${fields.length} ${selects?'choices':scored?'negative sentences':'sentences'} before reviewing. Your answers are still here.`;fields[missing].setAttribute('aria-invalid','true');fields[missing].focus();return;}
      const current=signature();if(scored&&state.last!==current)state.attempts=Math.min(2,state.attempts+1);state.last=current;feedback();persist();result.focus();
    });
    section.querySelector('[data-mg-reset]').addEventListener('click',()=>{if(state.answers.some(a=>a.trim())||state.last)backups[id]=copy(state);state.answers=fields.map(()=>'');state.attempts=0;state.last='';render();undo.hidden=!backups[id];persist();fields[0].focus();});
    undo.addEventListener('click',()=>{if(!valid(backups[id]))return;Object.assign(state,backups[id]);delete backups[id];undo.hidden=true;render();persist();fields[0].focus();});
    render();
  });
  function refreshPersonal(){data.personal.forEach(item=>{const field=document.getElementById('mg-personal-'+item.number),card=field.closest('article'),preview=card.querySelector('[data-mg-preview]'),button=card.querySelector('[data-mg-personal]');preview.hidden=!field.value;preview.textContent=field.value?'I '+field.value+' '+item.verb+'.':'';button.disabled=!field.value;});}
  document.querySelectorAll('[data-mg-task="choices"] select').forEach(field=>field.addEventListener('change',refreshPersonal));
  document.querySelectorAll('[data-mg-personal]').forEach(button=>button.addEventListener('click',()=>{if(button.disabled)return;const item=data.personal.find(i=>i.number===Number(button.dataset.mgPersonal)),choice=document.getElementById('mg-personal-'+item.number).value;if(!item.audio[choice])return;play(item.audio[choice],'I '+choice+' '+item.verb+'.');audio.dataset.personal='true';}));
  if(window.FirstVisitVocabulary){vocabulary=window.FirstVisitVocabulary(data.vocabulary,(entry,button)=>play(entry.audio,entry.term,button));document.querySelectorAll('[data-glossary]').forEach(el=>vocabulary.render(el,el.textContent));}
  document.querySelectorAll('[data-mg-audio],[data-mg-model]').forEach(b=>b.addEventListener('click',()=>{if(b.hidden)return;const item=data.audio[b.dataset.mgAudio||b.dataset.mgModel];play(item.path,item.text,null,!!b.dataset.mgModel);}));
  document.querySelectorAll('[data-mg-speed]').forEach(b=>b.addEventListener('click',()=>{speed=Number(b.dataset.mgSpeed);audio.playbackRate=speed;document.querySelectorAll('[data-mg-speed]').forEach(x=>x.setAttribute('aria-pressed',String(Number(x.dataset.mgSpeed)===speed)));audioStatus.textContent='Audio speed: '+speed+'×.';}));
  document.querySelector('[data-mg-stop]').addEventListener('click',()=>{stop();audioStatus.textContent='Audio stopped.';});
  audio.addEventListener('ended',()=>{stop();audioStatus.textContent='Finished. Tap to listen again.';});
  audio.addEventListener('error',()=>{stop();audioStatus.textContent='Audio could not load. Check your connection and tap again to retry.';});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){stop();vocabulary?.hide();persist();}});
  window.addEventListener('pagehide',()=>{stop();vocabulary?.hide();persist();});
  function openHash(){let id;try{id=decodeURIComponent(location.hash.slice(1));}catch(_){return;}const target=id&&document.getElementById(id);if(!target)return;let folder=target.closest('details');while(folder){folder.open=true;folder=folder.parentElement?.closest('details');}target.scrollIntoView({block:'start'});}
  window.addEventListener('hashchange',openHash);if(location.hash)openHash();
})();
