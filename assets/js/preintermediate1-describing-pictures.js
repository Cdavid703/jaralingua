/* Formative picture descriptions: editable local draft, comparison and undo reset. */
(() => {
  'use strict';
  const key='jl-pi1-describing-pictures-v1';
  const form=document.getElementById('pp-picture-form');
  const fields=[...form.querySelectorAll('input[type="text"]')];
  const feedback=[...form.querySelectorAll('.pp-feedback')];
  const result=document.getElementById('pp-result'),undo=document.getElementById('pp-undo');
  const storageStatus=document.getElementById('pp-storage-status');
  let saved={},storageAvailable=true;
  function unavailable(){storageAvailable=false;storageStatus.hidden=false;storageStatus.textContent='This browser cannot save your draft. Keep the page open while you write.';}
  try{saved=JSON.parse(sessionStorage.getItem(key)||'{}')||{};}catch(_){unavailable();}
  function answers(values){return fields.map((_,i)=>typeof values?.[i]==='string'?values[i].slice(0,120):'');}
  const state={answers:answers(saved.answers),reviewed:typeof saved.reviewed==='string'?saved.reviewed:'',backup:saved.backup&&Array.isArray(saved.backup.answers)?{answers:answers(saved.backup.answers),reviewed:typeof saved.backup.reviewed==='string'?saved.backup.reviewed:''}:null};
  function persist(){if(!storageAvailable)return;try{sessionStorage.setItem(key,JSON.stringify(state));}catch(_){unavailable();}}
  const signature=()=>JSON.stringify(state.answers.map(a=>a.trim()));
  function count(){document.getElementById('pp-count').textContent=`${state.answers.filter(a=>a.trim()).length} of ${fields.length} pictures described.`;undo.hidden=!state.backup;}
  function hideComparison(){feedback.forEach(box=>{box.hidden=true;});result.hidden=true;}
  function compare(){feedback.forEach(box=>{box.hidden=false;});result.hidden=false;result.textContent='6 of 6 pictures described. Compare your words with the visual clues. These are possible interpretations, not an official answer key or a correctness score. You can edit any description.';}
  function restoreFields(){fields.forEach((field,i)=>{field.value=state.answers[i];field.removeAttribute('aria-invalid');});count();hideComparison();}
  fields.forEach((field,i)=>{field.value=state.answers[i];field.addEventListener('input',()=>{state.answers[i]=field.value;state.reviewed='';state.backup=null;field.removeAttribute('aria-invalid');hideComparison();count();persist();});});
  form.addEventListener('submit',event=>event.preventDefault());
  document.getElementById('pp-review').addEventListener('click',()=>{
    const written=state.answers.filter(a=>a.trim()).length;
    const missing=fields.find(field=>!field.value.trim());
    if(missing){hideComparison();result.hidden=false;result.textContent=`${written} of 6 pictures described. Add a describing word for each remaining picture, then compare your ideas. Your words are still here.`;missing.setAttribute('aria-invalid','true');missing.focus();return;}
    state.reviewed=signature();compare();persist();result.focus();
  });
  document.getElementById('pp-reset').addEventListener('click',()=>{
    if(state.answers.some(a=>a.trim()))state.backup={answers:[...state.answers],reviewed:state.reviewed};
    state.answers=fields.map(()=>'');state.reviewed='';restoreFields();persist();result.hidden=false;result.textContent=state.backup?'Draft cleared. Choose Undo reset to restore it.':'Your picture descriptions are ready.';fields[0].focus();
  });
  undo.addEventListener('click',()=>{
    if(!state.backup)return;
    state.answers=[...state.backup.answers];state.reviewed=state.backup.reviewed;state.backup=null;restoreFields();persist();result.hidden=false;result.textContent='Your draft has been restored. You can continue describing the pictures.';fields[0].focus();
  });
  count();if(state.answers.every(a=>a.trim())&&state.reviewed===signature())compare();
})();
