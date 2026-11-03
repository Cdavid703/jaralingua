/* Original pages 9–10: local drafts, independent formative tasks and support audio. */
(() => {
  'use strict';
  const raw=document.getElementById('mx-data'); if(!raw)return;
  const data=JSON.parse(raw.textContent);
  const key='jl-pi1-more-personalities-v1',states={};
  const storageStatus=document.getElementById('mx-storage-status');
  let saved={},storageAvailable=true,backups={};
  function unavailable(){storageAvailable=false;storageStatus.hidden=false;storageStatus.textContent='This browser cannot save your draft. Keep this page open while you practise.';}
  try {saved=JSON.parse(sessionStorage.getItem(key)||'{}')||{}; backups=saved.backups && typeof saved.backups==='object' ? saved.backups : {};} catch(_){unavailable();}
  const tableForm=document.getElementById('mx-description-form');
  const fields=[...tableForm.querySelectorAll('textarea')];
  const tableState={answers:fields.map((_,i)=>typeof saved.table?.answers?.[i]==='string'?saved.table.answers[i]:''),last:typeof saved.table?.last==='string'?saved.table.last:''};
  function persist(){if(!storageAvailable)return;try{sessionStorage.setItem(key,JSON.stringify({table:tableState,tasks:states,backups}));}catch(_){unavailable();}}
  function paragraph(text){const p=document.createElement('p');p.textContent=text;return p;}
  function quote(text){const q=document.createElement('blockquote');q.textContent=text;return q;}
  const tableResult=document.getElementById('mx-description-result');
  const tableSignature=()=>JSON.stringify(tableState.answers.map(a=>a.trim().toLowerCase().replace(/\s+/g,' ')));
  function tableCount(){tableForm.querySelector('.mx-count').textContent=`${tableState.answers.filter(a=>a.trim()).length} of 5 descriptions written.`;}
  function hideTable(){tableResult.hidden=true;tableForm.querySelectorAll('.mx-table-feedback').forEach(el=>{el.hidden=true;el.replaceChildren();});}
  function reviewTable(){
    tableResult.hidden=false;tableResult.textContent='Compare your descriptions with the suggestions and evidence below. Other words may be possible if you can support them with the text. This table is not scored.';
    tableForm.querySelectorAll('.mx-table-feedback').forEach((el,i)=>{const profile=data.profiles[i];el.hidden=false;el.replaceChildren(paragraph('Possible words: '+profile.words+'.'),paragraph(profile.explanation),quote(profile.evidence));});
  }
  fields.forEach((field,i)=>{field.value=tableState.answers[i];field.addEventListener('input',()=>{delete backups.table;document.getElementById('mx-description-undo').hidden=true;tableState.answers[i]=field.value;field.removeAttribute('aria-invalid');hideTable();tableCount();persist();});});
  document.getElementById('mx-description-check').addEventListener('click',()=>{hideTable();const missing=fields.find(field=>!field.value.trim());
    if(missing){tableResult.hidden=false;tableResult.textContent='Write describing words for all five profiles before comparing. Your words are still here.';missing.setAttribute('aria-invalid','true');missing.focus();return;}
    tableState.last=tableSignature();reviewTable();persist();tableResult.focus();
  });
  function attachReset(id,state,resetButton,undoButton,clear,render,focus,allowed){
    const valid=b=>b&&Array.isArray(b.answers)&&b.answers.length===state.answers.length&&b.answers.every(a=>typeof a==='string'&&(!allowed||allowed.includes(a)||a===''))&&typeof b.last==='string';
    if(!valid(backups[id]))delete backups[id];
    undoButton.hidden=!backups[id];
    resetButton.addEventListener('click',()=>{
      if(state.answers.some(a=>a.trim())||state.last)backups[id]=JSON.parse(JSON.stringify(state));
      clear();render();undoButton.hidden=!backups[id];persist();focus();
    });
    undoButton.addEventListener('click',()=>{
      if(!valid(backups[id]))return;
      Object.assign(state,backups[id]);delete backups[id];undoButton.hidden=true;render();persist();focus();
    });
  }
  function renderTable(){fields.forEach((field,i)=>{field.value=tableState.answers[i];field.removeAttribute('aria-invalid');});hideTable();tableCount();if(tableState.answers.every(a=>a.trim())&&tableState.last===tableSignature())reviewTable();}
  attachReset('table',tableState,document.getElementById('mx-description-reset'),document.getElementById('mx-description-undo'),()=>{tableState.answers=fields.map(()=>'');tableState.last='';},renderTable,()=>fields[0].focus());
  tableCount();if(tableState.answers.every(a=>a.trim())&&tableState.last===tableSignature())reviewTable();
  document.querySelectorAll('[data-mx-task]').forEach(form=>{
    const id=form.dataset.mxTask,items=data.tasks[id],allowed=id==='1'?['T','F']:data.profiles.map(p=>p.id);
    const previous=saved.tasks?.[id];
    const state=states[id]={answers:items.map((_,i)=>allowed.includes(previous?.answers?.[i])?previous.answers[i]:''),attempts:Math.min(2,Math.max(0,Number(previous?.attempts)||0)),last:typeof previous?.last==='string'?previous.last:''};
    const result=form.querySelector('.mx-result');
    function group(i){return [...form.querySelectorAll(`[name="${id==='1'?'tf':'who'}-q${i+1}"]`)];}
    const signature=()=>JSON.stringify(state.answers);
    function count(){form.querySelector('.mx-count').textContent=`${state.answers.filter(Boolean).length} of ${items.length} answered.`;}
    function hideFeedback(){result.hidden=true;form.querySelectorAll('.mx-feedback').forEach(el=>{el.hidden=true;el.replaceChildren();});}
    function feedback(){
      const correct=items.map((item,i)=>item.answer===state.answers[i]),total=correct.filter(Boolean).length,reveal=state.attempts>=2||total===items.length;
      result.hidden=false;result.textContent=`${total} of ${items.length} answers correct. `+(reveal?(total===items.length?'Well done! Read the explanations and evidence below.':'Read the explanations and evidence below, then edit your answers and try again.'):'Read the profiles again and try another complete set of answers. Explanations appear after two different complete attempts.');
      if(reveal)form.querySelectorAll('.mx-feedback').forEach((el,i)=>{
        const item=items[i],answer=id==='1'?(item.answer==='T'?'True':'False'):(data.profiles.find(p=>p.id===item.answer).option || data.profiles.find(p=>p.id===item.answer).name);
        const link=document.createElement('a');link.className='mx-evidence-link';link.href='#profile-'+item.profile;link.textContent='Read the profile';
        el.hidden=false;el.dataset.accepted=String(correct[i]);el.replaceChildren(paragraph(`${correct[i]?'Correct.':'Review this answer.'} Answer: ${answer}.`),paragraph(item.explanation),quote(item.evidence),link);
      });
    }
    items.forEach((_,i)=>{
      const controls=group(i);controls.forEach(control=>{if(control.type==='radio')control.checked=control.value===state.answers[i];else control.value=state.answers[i];
        control.addEventListener('change',()=>{delete backups[id];form.querySelector('[data-mx-undo]').hidden=true;state.answers[i]=control.type==='radio'?controls.find(c=>c.checked)?.value||'':control.value;controls.forEach(c=>c.removeAttribute('aria-invalid'));hideFeedback();count();persist();});
      });
    });
    form.querySelector('[data-mx-check]').addEventListener('click',()=>{hideFeedback();const missing=state.answers.findIndex(a=>!a);
      if(missing>=0){result.hidden=false;result.textContent=`Answer all ${items.length} questions before checking. Your answers are still here.`;const controls=group(missing);controls.forEach(c=>c.setAttribute('aria-invalid','true'));controls[0].focus();return;}
      const current=signature();if(state.last!==current){state.attempts=Math.min(2,state.attempts+1);state.last=current;}feedback();persist();result.focus();
    });
    function renderTask(){items.forEach((_,i)=>group(i).forEach(control=>{if(control.type==='radio')control.checked=control.value===state.answers[i];else control.value=state.answers[i];control.removeAttribute('aria-invalid');}));hideFeedback();count();if(state.answers.every(Boolean)&&state.last===signature())feedback();}
    attachReset(id,state,form.querySelector('[data-mx-reset]'),form.querySelector('[data-mx-undo]'),()=>{state.answers=items.map(()=>'');state.attempts=0;state.last='';},renderTask,()=>group(0)[0].focus(),allowed);
    count();if(state.answers.every(Boolean)&&state.last===signature())feedback();
  });
  const audio=document.getElementById('mx-audio'),audioStatus=document.getElementById('mx-audio-status');
  let vocabulary=null,speed=1,token=0;
  function stopAudio(){token++;audio.pause();vocabulary?.setPlaying(null);document.querySelectorAll('[data-mx-audio]').forEach(b=>b.classList.remove('is-playing'));}
  async function playAudio(path,label,word=null,button=null){
    stopAudio();const request=++token;audio.src=path;audio.playbackRate=speed;vocabulary?.setPlaying(word);button?.classList.add('is-playing');audioStatus.textContent='Loading audio: '+label;
    try{await audio.play();if(request===token)audioStatus.textContent='Playing: '+label;}
    catch(_){if(request===token){stopAudio();audioStatus.textContent='Audio could not play. Check your connection and tap again to retry.';}}
  }
  if(window.FirstVisitVocabulary){vocabulary=window.FirstVisitVocabulary(data.vocabulary,(entry,button)=>playAudio(entry.audio,entry.term,button));document.querySelectorAll('[data-glossary]').forEach(el=>vocabulary.render(el,el.textContent));}
  document.querySelectorAll('[data-mx-audio]').forEach(button=>button.addEventListener('click',()=>{const item=data.audio[button.dataset.mxAudio];playAudio(item.path,item.text,null,button);}));
  document.querySelectorAll('[data-mx-speed]').forEach(button=>button.addEventListener('click',()=>{speed=Number(button.dataset.mxSpeed);audio.playbackRate=speed;document.querySelectorAll('[data-mx-speed]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.mxSpeed)===speed)));audioStatus.textContent='Audio speed: '+speed+'×.';}));
  document.querySelector('[data-mx-stop]').addEventListener('click',()=>{stopAudio();audioStatus.textContent='Audio stopped.';});
  audio.addEventListener('ended',()=>{stopAudio();audioStatus.textContent='Finished. Tap to listen again.';});
  audio.addEventListener('error',()=>{stopAudio();audioStatus.textContent='Audio could not load. Check your connection and tap again to retry.';});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){stopAudio();vocabulary?.hide();}});
  window.addEventListener('pagehide',()=>{stopAudio();vocabulary?.hide();persist();});
  function openHash(){let target;try{target=document.getElementById(decodeURIComponent(location.hash.slice(1)));}catch(_){return;}if(!target)return;let folder=target.closest('details');while(folder){folder.open=true;folder=folder.parentElement?.closest('details');}target.scrollIntoView({block:'start'});}
  window.addEventListener('hashchange',openHash);if(location.hash)openHash();
})();
