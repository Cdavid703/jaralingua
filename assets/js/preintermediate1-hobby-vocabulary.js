/* Unit 2 page 1: independent local practice, original matching and personal columns. */
(() => {
  'use strict';
  const raw=document.getElementById('hv-data');if(!raw)return;
  const data=JSON.parse(raw.textContent),key='jl-pi1-unit2-hobby-vocabulary-v1';
  const storageStatus=document.getElementById('hv-storage-status');
  let saved={},storageAvailable=true;const states={};
  function unavailable(){storageAvailable=false;storageStatus.hidden=false;storageStatus.textContent='This browser cannot save your draft. Keep this page open and copy your personal columns before leaving.';}
  try{saved=JSON.parse(sessionStorage.getItem(key)||'{}')||{};}catch(_){unavailable();}
  const copy=value=>JSON.parse(JSON.stringify(value));
  const fields=[document.getElementById('hv-can'),document.getElementById('hv-cant')];
  const personal={answers:fields.map((_,i)=>typeof saved.personal?.answers?.[i]==='string'?saved.personal.answers[i]:''),last:typeof saved.personal?.last==='string'?saved.personal.last:''};
  const backups=saved.backups&&typeof saved.backups==='object'?saved.backups:{};
  function persist(){if(!storageAvailable)return;try{sessionStorage.setItem(key,JSON.stringify({tasks:states,personal,backups}));}catch(_){unavailable();}}
  function resettable(id,state,reset,undo,clear,render,focus,valid){
    if(!valid(backups[id]))delete backups[id];undo.hidden=!backups[id];
    reset.addEventListener('click',()=>{if(state.answers.some(a=>a.trim())||state.last)backups[id]=copy(state);clear();render();undo.hidden=!backups[id];persist();focus();});
    undo.addEventListener('click',()=>{if(!valid(backups[id]))return;Object.assign(state,backups[id]);delete backups[id];undo.hidden=true;render();persist();focus();});
  }
  document.querySelectorAll('[data-hv-task]').forEach(section=>{
    const id=section.dataset.hvTask,items=data.tasks[id],isWarmup=id==='warmup';
    const controls=[...section.querySelectorAll(isWarmup?'input[type="radio"]':'select')],allowed=isWarmup?['1','2','3']:data.words;
    const old=saved.tasks?.[id];
    const state=states[id]={answers:items.map((_,i)=>allowed.includes(old?.answers?.[i])?old.answers[i]:''),attempts:Math.min(2,Math.max(0,Number(old?.attempts)||0)),last:typeof old?.last==='string'?old.last:''};
    const result=section.querySelector('.hv-result'),feedbacks=[...section.querySelectorAll('.hv-feedback')];
    const signature=()=>JSON.stringify(state.answers);
    const valid=b=>b&&Array.isArray(b.answers)&&b.answers.length===items.length&&b.answers.every(a=>a===''||allowed.includes(a))&&typeof b.last==='string'&&Number.isFinite(b.attempts)&&b.attempts>=0&&b.attempts<=2;
    function hide(){result.hidden=true;result.textContent='';feedbacks.forEach(f=>{f.hidden=true;f.textContent='';});}
    function count(){section.querySelector('.hv-count').textContent=`${state.answers.filter(Boolean).length} of ${items.length} answered.`;}
    function feedback(){
      const correct=items.map((item,i)=>item.answer===state.answers[i]),total=correct.filter(Boolean).length;
      const reveal=state.attempts>=2||total===items.length;
      result.hidden=false;result.textContent=`${total} of ${items.length} ${items.length===1?'answer':'answers'} correct. `+(reveal?`Read ${items.length===1?'the explanation':'the explanations'}, then change anything you want to review.`:'Try a different complete set of answers. Explanations appear after two different complete attempts.');
      if(reveal)feedbacks.forEach((el,i)=>{el.hidden=false;el.dataset.accepted=String(correct[i]);el.textContent=`${correct[i]?'Correct.':'Review this answer.'} Answer: ${items[i].text.replace(/[.!?]$/,'')}. ${items[i].explanation}`;});
    }
    function render(){controls.forEach((c,i)=>{if(isWarmup)c.checked=c.value===state.answers[0];else c.value=state.answers[i];c.removeAttribute('aria-invalid');});hide();count();if(state.answers.every(Boolean)&&state.last===signature())feedback();}
    controls.forEach((c,i)=>c.addEventListener('change',()=>{
      state.answers=isWarmup?[controls.find(c=>c.checked)?.value||'']:controls.map(c=>c.value);
      delete backups[id];section.querySelector('[data-hv-undo]').hidden=true;c.removeAttribute('aria-invalid');hide();count();persist();
    }));
    section.querySelector('[data-hv-check]').addEventListener('click',()=>{
      hide();const missing=state.answers.findIndex(a=>!a);
      if(missing>=0){result.hidden=false;result.textContent=isWarmup?'Choose a definition before checking.':'Choose a word for all eight pictures before checking. Your answers are still here.';const field=controls[isWarmup?0:missing];field.setAttribute('aria-invalid','true');field.focus();return;}
      const current=signature();if(state.last!==current){state.attempts=Math.min(2,state.attempts+1);state.last=current;}feedback();persist();result.focus();
    });
    resettable(id,state,section.querySelector('[data-hv-reset]'),section.querySelector('[data-hv-undo]'),()=>{state.answers=items.map(()=>'');state.attempts=0;state.last='';},render,()=>controls[0].focus(),valid);
    render();
  });
  const personalResult=document.getElementById('hv-personal-result'),personalUndo=document.getElementById('hv-personal-undo');
  const personalSignature=()=>JSON.stringify(personal.answers);
  function reviewPersonal(){personalResult.textContent='Read your two columns again. Keep hobbies you can do in the first column and hobbies you can’t do in the second. Your abilities are personal; this table is not automatically corrected or scored.';personalResult.hidden=false;}
  function renderPersonal(){fields.forEach((f,i)=>{f.value=personal.answers[i];});personalResult.hidden=true;personalResult.textContent='';if(personal.answers.some(a=>a.trim())&&personal.last===personalSignature())reviewPersonal();}
  fields.forEach((f,i)=>f.addEventListener('input',()=>{personal.answers[i]=f.value;delete backups.personal;personalUndo.hidden=true;personalResult.hidden=true;personalResult.textContent='';persist();}));
  document.getElementById('hv-personal-check').addEventListener('click',()=>{
    if(!personal.answers.some(a=>a.trim())){personalResult.hidden=false;personalResult.textContent='Write at least one hobby in either column before reviewing. One column may be empty.';fields[0].focus();return;}
    personal.last=personalSignature();reviewPersonal();persist();personalResult.focus();
  });
  resettable('personal',personal,document.getElementById('hv-personal-reset'),personalUndo,()=>{personal.answers=['',''];personal.last='';},renderPersonal,()=>fields[0].focus(),b=>b&&Array.isArray(b.answers)&&b.answers.length===2&&b.answers.every(a=>typeof a==='string')&&typeof b.last==='string');
  renderPersonal();
  const audio=document.getElementById('hv-audio'),audioStatus=document.getElementById('hv-audio-status');let vocabulary=null,speed=1,token=0;
  function stop(){token++;audio.pause();vocabulary?.setPlaying(null);}
  async function play(path,text,button=null){stop();const request=++token;audio.src=path;audio.playbackRate=speed;vocabulary?.setPlaying(button);audioStatus.textContent='Loading audio: '+text;
    try{await audio.play();if(request===token)audioStatus.textContent='Playing: '+text;}catch(_){if(request===token){stop();audioStatus.textContent='Audio could not play. Check your connection and tap again to retry.';}}
  }
  if(window.FirstVisitVocabulary){vocabulary=window.FirstVisitVocabulary(data.vocabulary,(entry,button)=>play(entry.audio,entry.term,button));document.querySelectorAll('[data-glossary]').forEach(el=>vocabulary.render(el,el.textContent));}
  document.querySelectorAll('[data-hv-audio]').forEach(b=>b.addEventListener('click',()=>{const item=data.audio[b.dataset.hvAudio];play(item.path,item.text);}));
  document.querySelectorAll('[data-hv-speed]').forEach(b=>b.addEventListener('click',()=>{speed=Number(b.dataset.hvSpeed);audio.playbackRate=speed;document.querySelectorAll('[data-hv-speed]').forEach(x=>x.setAttribute('aria-pressed',String(Number(x.dataset.hvSpeed)===speed)));audioStatus.textContent='Audio speed: '+speed+'×.';}));
  document.querySelector('[data-hv-stop]').addEventListener('click',()=>{stop();audioStatus.textContent='Audio stopped.';});
  audio.addEventListener('ended',()=>{stop();audioStatus.textContent='Finished. Tap to listen again.';});
  audio.addEventListener('error',()=>{stop();audioStatus.textContent='Audio could not load. Check your connection and tap again to retry.';});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){stop();vocabulary?.hide();persist();}});
  window.addEventListener('pagehide',()=>{stop();vocabulary?.hide();persist();});
  function openHash(){let id;try{id=decodeURIComponent(location.hash.slice(1));}catch(_){return;}const target=id&&document.getElementById(id);if(!target)return;let folder=target.closest('details');while(folder){folder.open=true;folder=folder.parentElement?.closest('details');}target.scrollIntoView({block:'start'});}
  window.addEventListener('hashchange',openHash);if(location.hash)openHash();
})();
