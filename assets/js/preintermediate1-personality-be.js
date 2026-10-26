/* Original grammar tasks, formative feedback and local-only personal responses. */
(() => {
  'use strict';
  const data = JSON.parse(document.getElementById('pb-data').textContent);
  const key = 'jl-pi1-personality-be-v1';
  const storageStatus = document.getElementById('pb-storage-status');
  const states = {};
  let saved = {}, storageAvailable = true;
  function unavailable() {
    storageAvailable = false;storageStatus.hidden = false;
    storageStatus.textContent = 'This browser cannot save your draft. Keep this page open while you practise.';
  }
  try {saved = JSON.parse(sessionStorage.getItem(key) || '{}') || {};} catch (_) {unavailable();}
  function persist() {
    if (!storageAvailable) return;
    try {sessionStorage.setItem(key,JSON.stringify({tasks:states}));} catch (_) {unavailable();}
  }
  function normalize(value) {
    return value.normalize('NFKC').trim().toLowerCase().replace(/[’‘]/g,"'")
      .replace(/\bdoesn't\b/g,'does not').replace(/\bdon't\b/g,'do not')
      .replace(/^he's\b/,'he is').replace(/^they're\b/,'they are').replace(/^we're\b/,'we are')
      .replace(/^her grandmother's\s+grumpy\b/,'her grandmother is grumpy')
      .replace(/^the man's\s+rude\b/,'the man is rude').replace(/^my son's\s+shy\b/,'my son is shy')
      .replace(/[^a-z0-9]+/g,' ').trim();
  }
  document.querySelectorAll('form[data-pb-task]').forEach(form => {
    const id = form.dataset.pbTask, personal = id === '3', items = data.tasks[id];
    const fields = [...form.querySelectorAll('select,textarea')];
    const result = form.querySelector('.pb-result');
    const previous = saved.tasks?.[id];
    function safeAnswer(value, field) {
      if (field.tagName === 'SELECT') return [...field.options].some(option=>option.value===value) ? value : '';
      return typeof value === 'string' ? value.slice(0,400) : '';
    }
    const state = states[id] = {
      answers:fields.map((field,i)=>safeAnswer(previous?.answers?.[i],field)),
      attempts:Math.min(2,Math.max(0,Number(previous?.attempts)||0)),
      last:typeof previous?.last === 'string' ? previous.last : ''
    };
    const signature = () => JSON.stringify(state.answers.map(normalize));
    function count() {form.querySelector('.pb-count').textContent=`${state.answers.filter(a=>a.trim()).length} of ${fields.length} answered.`;}
    function hideFeedback() {
      result.hidden=true;
      form.querySelectorAll('.pb-feedback').forEach(el=>{el.hidden=true;el.textContent='';});
    }
    function feedback() {
      result.hidden=false;
      if (personal) {
        result.textContent='All 9 personal responses are recorded in this browser tab. There are no right or wrong answers. Say your responses aloud to practise.';
        return;
      }
      const correct=items.map((item,i)=>item.accepted.some(answer=>normalize(answer)===normalize(state.answers[i])));
      const total=correct.filter(Boolean).length;
      const reveal=state.attempts>=2 || total===fields.length;
      result.textContent=`${total} of ${fields.length} answers correct. `+(reveal ? (total===fields.length ? 'Well done! Read the explanations below.' : 'Read the corrections below, then edit your answers and check again.') : 'Review the grammar table and try another complete set of answers. Explanations appear after two different complete attempts.');
      if (reveal) form.querySelectorAll('.pb-feedback').forEach((el,i)=>{
        el.hidden=false;el.dataset.accepted=String(correct[i]);
        el.textContent=`${correct[i] ? 'Correct.' : 'Review this answer.'} ${items[i].model} ${items[i].explanation}`;
      });
    }
    fields.forEach((field,i)=>{
      field.value=state.answers[i];
      field.addEventListener(field.tagName==='TEXTAREA' ? 'input' : 'change',()=>{
        state.answers[i]=field.value;field.removeAttribute('aria-invalid');hideFeedback();count();persist();
      });
    });
    form.addEventListener('submit',event=>{
      event.preventDefault();hideFeedback();
      const missing=fields.find(field=>!field.value.trim());
      if (missing) {
        result.hidden=false;result.textContent=`Complete all ${fields.length} items before checking. Your answers are still here.`;
        missing.setAttribute('aria-invalid','true');missing.focus();return;
      }
      const current=signature();
      if (current!==state.last) {state.attempts=Math.min(2,state.attempts+1);state.last=current;}
      feedback();persist();result.focus();
    });
    form.querySelector('[data-pb-reset]').addEventListener('click',()=>{
      state.answers=fields.map(()=>'');state.attempts=0;state.last='';
      fields.forEach(field=>{field.value='';field.removeAttribute('aria-invalid');});
      hideFeedback();count();persist();fields[0].focus();
    });
    count();if (state.last===signature() && state.answers.every(a=>a.trim())) feedback();
  });
})();
