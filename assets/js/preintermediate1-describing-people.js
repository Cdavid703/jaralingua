/* Local writing practice only: completion review, editable draft and undo reset. */
(() => {
  'use strict';
  const key='jl-pi1-describing-people-v1';
  const form=document.getElementById('pw-writing-form');
  const fields=[...form.querySelectorAll('textarea')];
  const result=document.getElementById('pw-result'),undo=document.getElementById('pw-undo');
  const storageStatus=document.getElementById('pw-storage-status');
  let saved={},storageAvailable=true;
  function unavailable(){storageAvailable=false;storageStatus.hidden=false;storageStatus.textContent='This browser cannot save your draft. Keep the page open while you write.';}
  try{saved=JSON.parse(sessionStorage.getItem(key)||'{}')||{};}catch(_){unavailable();}
  function answers(values){return fields.map((_,i)=>typeof values?.[i]==='string'?values[i].slice(0,300):'');}
  const state={answers:answers(saved.answers),reviewed:typeof saved.reviewed==='string'?saved.reviewed:'',backup:saved.backup&&Array.isArray(saved.backup.answers)?{answers:answers(saved.backup.answers),reviewed:typeof saved.backup.reviewed==='string'?saved.backup.reviewed:''}:null};
  function persist(){if(!storageAvailable)return;try{sessionStorage.setItem(key,JSON.stringify(state));}catch(_){unavailable();}}
  const signature=()=>JSON.stringify(state.answers.map(a=>a.trim()));
  function count(){document.getElementById('pw-count').textContent=`${state.answers.filter(a=>a.trim()).length} of ${fields.length} responses written.`;undo.hidden=!state.backup;}
  function completeMessage(){result.hidden=false;result.textContent='7 of 7 responses written. Compare each sentence with the word box and “My teacher is friendly.” Personal descriptions can vary. This is a completion review, not a correctness score.';}
  function restoreFields(){fields.forEach((field,i)=>{field.value=state.answers[i];field.removeAttribute('aria-invalid');});count();}
  fields.forEach((field,i)=>{field.value=state.answers[i];field.addEventListener('input',()=>{state.answers[i]=field.value;state.backup=null;field.removeAttribute('aria-invalid');result.hidden=true;count();persist();});});
  // There is no submit button: writing never falls back to a GET request without JS.
  form.addEventListener('submit',event=>event.preventDefault());
  document.getElementById('pw-review').addEventListener('click',()=>{
    const written=state.answers.filter(a=>a.trim()).length;
    const missing=fields.find(field=>!field.value.trim());
    if(missing){result.hidden=false;result.textContent=`${written} of 7 responses written. Add the remaining sentences, then compare them with the example. Your words are still here.`;missing.setAttribute('aria-invalid','true');missing.focus();return;}
    state.reviewed=signature();completeMessage();persist();result.focus();
  });
  document.getElementById('pw-reset').addEventListener('click',()=>{
    if(state.answers.some(a=>a.trim()))state.backup={answers:[...state.answers],reviewed:state.reviewed};
    state.answers=fields.map(()=>'');state.reviewed='';restoreFields();persist();result.hidden=false;result.textContent=state.backup?'Draft cleared. Choose Undo reset to restore it.':'Your writing spaces are ready.';fields[0].focus();
  });
  undo.addEventListener('click',()=>{
    if(!state.backup)return;
    state.answers=[...state.backup.answers];state.reviewed=state.backup.reviewed;state.backup=null;restoreFields();persist();result.hidden=false;result.textContent='Your draft has been restored. You can continue writing.';fields[0].focus();
  });
  count();if(state.answers.every(a=>a.trim())&&state.reviewed===signature())completeMessage();
})();
