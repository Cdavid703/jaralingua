/* One reading player and a recoverable, text-evidenced comprehension quiz. */
(() => {
  'use strict';
  const raw=document.getElementById('cr-data'); if(!raw)return;
  const data=JSON.parse(raw.textContent),key='jl-pi1-unit4-christmas-reading-v1';
  const audio=document.getElementById('cr-audio'),status=document.getElementById('cr-audio-status');
  const toggle=document.getElementById('cr-pause-resume'),stopButton=document.getElementById('cr-stop'),retry=document.getElementById('cr-retry');
  const storageStatus=document.getElementById('cr-storage-status');
  let vocabulary=null,speed=1,token=0,currentItem=null,currentButton=null,stopping=false;
  function controls(){const selected=Boolean(audio.getAttribute('src'));toggle.disabled=!selected;stopButton.disabled=!selected;toggle.textContent=selected&&(audio.paused||audio.ended)?'Resume audio':'Pause audio';}
  function stop(reset=false){token++;stopping=true;audio.pause();if(reset){try{audio.currentTime=0;}catch(_){}}vocabulary?.setPlaying(null);status.textContent='Audio stopped.';controls();}
  function failed(message){stop();retry.hidden=!currentItem;status.textContent=message;}
  async function start(item,button=null){
    stop();currentItem=item;currentButton=button;audio.src=item.path;audio.playbackRate=speed;retry.hidden=true;
    const request=++token;stopping=false;status.textContent='Loading audio: '+item.label;controls();
    try{await audio.play();if(request===token){vocabulary?.setPlaying(button);status.textContent='Playing: '+item.label;controls();}}
    catch(_){if(request===token)failed('Audio could not play. Check your connection, then retry the selected audio.');}
  }
  toggle.addEventListener('click',async()=>{
    if(toggle.disabled||!currentItem)return;
    if(!audio.paused&&!audio.ended){token++;stopping=false;audio.pause();vocabulary?.setPlaying(null);status.textContent='Paused: '+currentItem.label;controls();return;}
    const request=++token;stopping=false;audio.playbackRate=speed;
    try{await audio.play();if(request===token){retry.hidden=true;vocabulary?.setPlaying(currentButton);status.textContent='Playing: '+currentItem.label;controls();}}
    catch(_){if(request===token)failed('Audio could not resume. Check your connection, then retry the selected audio.');}
  });
  stopButton.addEventListener('click',()=>stop(true));
  retry.addEventListener('click',()=>{if(currentItem)start(currentItem,currentButton);});
  document.querySelectorAll('[data-cr-audio]').forEach(button=>button.addEventListener('click',()=>{const item=data.audio[button.dataset.crAudio];if(item)start(item);}));
  document.querySelectorAll('[data-cr-speed]').forEach(button=>button.addEventListener('click',()=>{speed=Number(button.dataset.crSpeed);audio.playbackRate=speed;document.querySelectorAll('[data-cr-speed]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.crSpeed)===speed)));status.textContent='Audio speed: '+speed+'×.';}));
  audio.addEventListener('play',()=>{if(!audio.paused&&currentItem){stopping=false;vocabulary?.setPlaying(currentButton);status.textContent='Playing: '+currentItem.label;controls();}});
  audio.addEventListener('pause',()=>{if(audio.paused&&!audio.ended&&!stopping&&currentItem){vocabulary?.setPlaying(null);status.textContent='Paused: '+currentItem.label;}controls();});
  audio.addEventListener('ended',()=>{token++;vocabulary?.setPlaying(null);status.textContent='Finished: '+(currentItem?.label||'audio')+'. Choose an audio to listen again.';controls();});
  audio.addEventListener('error',()=>failed('Audio could not load. Check your connection, then retry the selected audio.'));
  if(window.FirstVisitVocabulary){vocabulary=window.FirstVisitVocabulary(data.vocabulary,(entry,button)=>start({path:entry.audio,label:entry.term},button));document.querySelectorAll('[data-glossary]').forEach(el=>vocabulary.render(el,el.textContent));}

  const copy=value=>JSON.parse(JSON.stringify(value)),questions=data.questions;
  const groups=[...document.querySelectorAll('[data-cr-question]')],form=document.getElementById('cr-quiz');
  const result=document.getElementById('cr-result'),count=document.getElementById('cr-count'),undo=document.getElementById('cr-undo');
  let saved={},canSave=true,backup=null;
  function unavailable(){canSave=false;storageStatus.hidden=false;storageStatus.textContent='This browser cannot save your draft. Keep this page open or use the original PDF to work on paper.';}
  try{saved=JSON.parse(sessionStorage.getItem(key)||'{}')||{};}catch(_){unavailable();}
  const blank=()=>({answers:questions.map(()=>''),attempts:[],checked:''});
  const signature=answers=>JSON.stringify(answers);
  const complete=answers=>Array.isArray(answers)&&answers.length===questions.length&&answers.every((a,i)=>typeof a==='string'&&Object.hasOwn(questions[i].options,a));
  function validAttempt(value){try{const a=JSON.parse(value);return typeof value==='string'&&complete(a)&&signature(a)===value;}catch(_){return false;}}
  function valid(value){return value&&Array.isArray(value.answers)&&value.answers.length===questions.length&&value.answers.every((a,i)=>typeof a==='string'&&(a===''||Object.hasOwn(questions[i].options,a)))&&Array.isArray(value.attempts)&&value.attempts.length<=2&&new Set(value.attempts).size===value.attempts.length&&value.attempts.every(validAttempt)&&typeof value.checked==='string'&&(!value.checked||(complete(value.answers)&&value.checked===signature(value.answers)&&value.attempts.includes(value.checked)));}
  let state=valid(saved.state)?copy(saved.state):blank();if(valid(saved.backup))backup=copy(saved.backup);
  function persist(){if(!canSave)return;try{sessionStorage.setItem(key,JSON.stringify({state,backup}));}catch(_){unavailable();}}
  function hide(){result.hidden=true;result.textContent='';groups.forEach(group=>{group.querySelector('.cr-feedback').hidden=true;delete group.dataset.accepted;});}
  function progress(){count.textContent=`${state.answers.filter(Boolean).length} of ${questions.length} answered.`;}
  function review(){
    const matches=questions.map((q,i)=>state.answers[i]===q.answer),total=matches.filter(Boolean).length,revealed=state.attempts.length>=2||total===questions.length;
    result.hidden=false;result.textContent=`${total} of ${questions.length} answers correct. `+(revealed?'Read the explanations and use the paragraph links to check the evidence.':'Read again and try a different complete set of answers. Repeating the same answers does not unlock explanations.');
    if(revealed)groups.forEach((group,i)=>{const q=questions[i],feedback=group.querySelector('.cr-feedback');feedback.hidden=false;group.dataset.accepted=String(matches[i]);feedback.querySelector('.cr-answer').textContent=`${matches[i]?'Correct.':'Review this answer.'} Answer: ${q.answer}. ${q.options[q.answer]}`;feedback.querySelector('.cr-explanation').textContent=q.explanation;feedback.querySelector('blockquote').textContent=q.evidence;feedback.querySelector('a').href='#reading-paragraph-'+q.paragraph;});
  }
  function render(){groups.forEach((group,i)=>{group.querySelectorAll('input').forEach(input=>{input.checked=state.answers[i]===input.value;});group.removeAttribute('aria-invalid');});hide();progress();undo.hidden=!backup;if(complete(state.answers)&&state.checked===signature(state.answers))review();}
  groups.forEach((group,i)=>group.addEventListener('change',event=>{
    const input=event.target;if(!input.matches('input[type="radio"]')||!Object.hasOwn(questions[i].options,input.value))return;
    state.answers[i]=input.value;state.checked='';backup=null;undo.hidden=true;group.removeAttribute('aria-invalid');stop();vocabulary?.hide();hide();progress();persist();
  }));
  form.addEventListener('submit',event=>{
    event.preventDefault();hide();const missing=state.answers.findIndex(a=>!a);
    if(missing>=0){result.hidden=false;result.textContent='Choose one answer for all eight questions before checking. Your choices are still here; no attempt was used.';groups[missing].setAttribute('aria-invalid','true');groups[missing].querySelector('input').focus();return;}
    groups.forEach(group=>group.removeAttribute('aria-invalid'));const current=signature(state.answers);
    if(!state.attempts.includes(current)){if(state.attempts.length<2)state.attempts.push(current);else state.attempts[1]=current;}
    state.checked=current;review();persist();result.focus();
  });
  document.getElementById('cr-reset').addEventListener('click',()=>{if(state.answers.some(Boolean)||state.attempts.length)backup=copy(state);state=blank();stop();vocabulary?.hide();render();persist();groups[0].querySelector('input').focus();});
  undo.addEventListener('click',()=>{if(!valid(backup))return;state=copy(backup);backup=null;stop();vocabulary?.hide();render();persist();groups[0].querySelector('input').focus();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){stop();vocabulary?.hide();persist();}});
  window.addEventListener('pagehide',()=>{stop();vocabulary?.hide();persist();});
  function openHash(){let id;try{id=decodeURIComponent(location.hash.slice(1));}catch(_){return;}const target=id&&document.getElementById(id);if(!target)return;let folder=target.closest('details');while(folder){folder.open=true;folder=folder.parentElement?.closest('details');}target.scrollIntoView({block:'start'});}
  controls();render();window.addEventListener('hashchange',openHash);if(location.hash)openHash();
})();
