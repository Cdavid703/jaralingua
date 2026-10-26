/* Original case study: open descriptions and two formative reading tasks. */
(() => {
  'use strict';
  const data=JSON.parse(document.getElementById('pc-data').textContent);
  const key='jl-pi1-characters-v1',states={};
  const storageStatus=document.getElementById('pc-storage-status');
  let saved={},storageAvailable=true;
  function unavailable(){storageAvailable=false;storageStatus.hidden=false;storageStatus.textContent='This browser cannot save your draft. Keep this page open while you practise.';}
  try {saved=JSON.parse(sessionStorage.getItem(key)||'{}')||{};} catch(_){unavailable();}
  const tableForm=document.getElementById('pc-description-form');
  const fields=[...tableForm.querySelectorAll('textarea')];
  const tableState={answers:fields.map((_,i)=>typeof saved.table?.answers?.[i]==='string'?saved.table.answers[i].slice(0,200):''),last:typeof saved.table?.last==='string'?saved.table.last:''};
  function persist(){if(!storageAvailable)return;try{sessionStorage.setItem(key,JSON.stringify({table:tableState,tasks:states}));}catch(_){unavailable();}}
  function paragraph(text){const p=document.createElement('p');p.textContent=text;return p;}
  function quote(text){const q=document.createElement('blockquote');q.textContent=text;return q;}
  const tableResult=document.getElementById('pc-description-result');
  const tableSignature=()=>JSON.stringify(tableState.answers.map(a=>a.trim().toLowerCase().replace(/\s+/g,' ')));
  function tableCount(){tableForm.querySelector('.pc-count').textContent=`${tableState.answers.filter(a=>a.trim()).length} of 5 descriptions written.`;}
  function hideTable(){tableResult.hidden=true;tableForm.querySelectorAll('.pc-table-feedback').forEach(el=>{el.hidden=true;el.replaceChildren();});}
  function reviewTable(){
    tableResult.hidden=false;tableResult.textContent='Compare your descriptions with the suggestions and evidence below. Other words may be possible if you can support them with the text. This table is not scored.';
    tableForm.querySelectorAll('.pc-table-feedback').forEach((el,i)=>{const profile=data.profiles[i];el.hidden=false;el.replaceChildren(paragraph('Possible words: '+profile.words+'.'),paragraph(profile.explanation),quote(profile.evidence));});
  }
  fields.forEach((field,i)=>{field.value=tableState.answers[i];field.addEventListener('input',()=>{tableState.answers[i]=field.value;field.removeAttribute('aria-invalid');hideTable();tableCount();persist();});});
  tableForm.addEventListener('submit',event=>{
    event.preventDefault();hideTable();const missing=fields.find(field=>!field.value.trim());
    if(missing){tableResult.hidden=false;tableResult.textContent='Write describing words for all five profiles before comparing. Your words are still here.';missing.setAttribute('aria-invalid','true');missing.focus();return;}
    tableState.last=tableSignature();reviewTable();persist();tableResult.focus();
  });
  document.getElementById('pc-description-reset').addEventListener('click',()=>{tableState.answers=fields.map(()=>'');tableState.last='';fields.forEach(field=>{field.value='';field.removeAttribute('aria-invalid');});hideTable();tableCount();persist();fields[0].focus();});
  tableCount();if(tableState.answers.every(a=>a.trim())&&tableState.last===tableSignature())reviewTable();
  document.querySelectorAll('form[data-pc-task]').forEach(form=>{
    const id=form.dataset.pcTask,items=data.tasks[id],allowed=id==='1'?['T','F']:data.profiles.map(p=>p.id);
    const previous=saved.tasks?.[id];
    const state=states[id]={answers:items.map((_,i)=>allowed.includes(previous?.answers?.[i])?previous.answers[i]:''),attempts:Math.min(2,Math.max(0,Number(previous?.attempts)||0)),last:typeof previous?.last==='string'?previous.last:''};
    const result=form.querySelector('.pc-result');
    function group(i){return [...form.querySelectorAll(`[name="q${i+1}"]`)];}
    const signature=()=>JSON.stringify(state.answers);
    function count(){form.querySelector('.pc-count').textContent=`${state.answers.filter(Boolean).length} of ${items.length} answered.`;}
    function hideFeedback(){result.hidden=true;form.querySelectorAll('.pc-feedback').forEach(el=>{el.hidden=true;el.replaceChildren();});}
    function feedback(){
      const correct=items.map((item,i)=>item.answer===state.answers[i]),total=correct.filter(Boolean).length,reveal=state.attempts>=2||total===items.length;
      result.hidden=false;result.textContent=`${total} of ${items.length} answers correct. `+(reveal?(total===items.length?'Well done! Read the explanations and evidence below.':'Read the explanations and evidence below, then edit your answers and try again.'):'Read the profiles again and try another complete set of answers. Explanations appear after two different complete attempts.');
      if(reveal)form.querySelectorAll('.pc-feedback').forEach((el,i)=>{
        const item=items[i],answer=id==='1'?(item.answer==='T'?'True':'False'):data.profiles.find(p=>p.id===item.answer).name;
        const link=document.createElement('a');link.className='pc-evidence-link';link.href='#profile-'+item.profile;link.textContent='Read the profile';
        el.hidden=false;el.dataset.accepted=String(correct[i]);el.replaceChildren(paragraph(`${correct[i]?'Correct.':'Review this answer.'} Worksheet answer: ${answer}.`),paragraph(item.explanation),quote(item.evidence),link);
      });
    }
    items.forEach((_,i)=>{
      const controls=group(i);controls.forEach(control=>{if(control.type==='radio')control.checked=control.value===state.answers[i];else control.value=state.answers[i];
        control.addEventListener('change',()=>{state.answers[i]=control.type==='radio'?controls.find(c=>c.checked)?.value||'':control.value;controls.forEach(c=>c.removeAttribute('aria-invalid'));hideFeedback();count();persist();});
      });
    });
    form.addEventListener('submit',event=>{
      event.preventDefault();hideFeedback();const missing=state.answers.findIndex(a=>!a);
      if(missing>=0){result.hidden=false;result.textContent=`Answer all ${items.length} questions before checking. Your answers are still here.`;const controls=group(missing);controls.forEach(c=>c.setAttribute('aria-invalid','true'));controls[0].focus();return;}
      const current=signature();if(state.last!==current){state.attempts=Math.min(2,state.attempts+1);state.last=current;}feedback();persist();result.focus();
    });
    form.querySelector('[data-pc-reset]').addEventListener('click',()=>{state.answers=items.map(()=>'');state.attempts=0;state.last='';items.forEach((_,i)=>group(i).forEach(control=>{if(control.type==='radio')control.checked=false;else control.value='';control.removeAttribute('aria-invalid');}));hideFeedback();count();persist();group(0)[0].focus();});
    count();if(state.answers.every(Boolean)&&state.last===signature())feedback();
  });
  function openHash(){let target;try{target=document.getElementById(decodeURIComponent(location.hash.slice(1)));}catch(_){return;}if(!target)return;let folder=target.closest('details');while(folder){folder.open=true;folder=folder.parentElement?.closest('details');}target.scrollIntoView({block:'start'});}
  window.addEventListener('hashchange',openHash);if(location.hash)openHash();
})();
