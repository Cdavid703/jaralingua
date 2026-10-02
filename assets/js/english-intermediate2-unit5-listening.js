(()=>{'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],audio=$('#impressionAudio'),word=new Audio();word.preload='none';let rate=.75,ticket=0,lastWord=null;
audio.playbackRate=rate;word.playbackRate=rate;
function wordState(){$$('[data-word-audio]').forEach(b=>b.setAttribute('aria-pressed',String(!word.paused&&!word.ended&&word.src===new URL(b.dataset.wordAudio,location.href).href)));}
function stopWord(){ticket++;word.pause();wordState();}
function wordError(){if(!lastWord?.isConnected)return;lastWord.parentNode.querySelector('.u5l-audio-error')?.remove();const s=document.createElement('span');s.className='u5l-audio-error';s.setAttribute('role','status');s.textContent='Audio could not play. Tap the words to retry.';lastWord.after(s);}
['play','pause','ended'].forEach(e=>word.addEventListener(e,wordState));word.addEventListener('error',wordError);
audio.addEventListener('play',()=>{stopWord();$('#audioStatus').textContent='Playing Sam and Maya’s conversation.';$('#retryAudio').hidden=true;});
audio.addEventListener('pause',()=>{if(!audio.ended)$('#audioStatus').textContent='Paused. Continue when you are ready.';});
audio.addEventListener('ended',()=>$('#audioStatus').textContent='Conversation complete. Replay for evidence or check your answers.');
audio.addEventListener('error',()=>{$('#audioStatus').textContent='The conversation could not load. Use Retry audio.';$('#retryAudio').hidden=false;});
$('#retryAudio').addEventListener('click',async()=>{audio.load();audio.playbackRate=rate;try{await audio.play();}catch{$('#audioStatus').textContent='Audio is still unavailable. Try again or ask your teacher for help.';}});
document.addEventListener('click',async e=>{
 const speed=e.target.closest('[data-audio-speed]');if(speed){rate=Number(speed.dataset.audioSpeed);audio.playbackRate=rate;word.playbackRate=rate;$$('[data-audio-speed]').forEach(b=>{const on=Number(b.dataset.audioSpeed)===rate;b.classList.toggle('is-active',on);b.setAttribute('aria-pressed',String(on));});return;}
 const b=e.target.closest('[data-word-audio]');if(b){const src=new URL(b.dataset.wordAudio,location.href).href;if(word.src===src&&!word.paused){stopWord();return;}audio.pause();stopWord();const n=++ticket;lastWord=b;$$('.u5l-audio-error').forEach(e=>e.remove());word.src=src;word.load();word.playbackRate=rate;try{await word.play();if(n===ticket)wordState();}catch(err){if(n===ticket&&err.name!=='AbortError')wordError();}}
});
const passes=new Set();$$('[data-pass]').forEach(b=>b.addEventListener('click',()=>{const id=b.dataset.pass;if(passes.has(id))passes.delete(id);else passes.add(id);b.classList.toggle('is-complete',passes.has(id));b.setAttribute('aria-pressed',String(passes.has(id)));b.textContent=passes.has(id)?'Completed · tap to undo':'Mark listen '+id+' complete';$('#passStatus').textContent='Listening self-check: '+passes.size+' of 3 passes marked.';}));
$$('[data-prediction]').forEach(b=>b.addEventListener('click',()=>{$$('[data-prediction]').forEach(x=>{x.setAttribute('aria-pressed',String(x===b));x.classList.toggle('is-selected',x===b);});$('#predictionStatus').textContent='Your prediction: '+b.dataset.prediction+'. Listen for evidence.';}));
const quiz=$('#impressionQuiz'),result=$('#quizResult');
function clearCard(card){card.classList.remove('is-correct','needs-review');const f=card.querySelector('.ie2-question-feedback');f.textContent='';f.className='ie2-question-feedback';}
quiz.addEventListener('submit',e=>{e.preventDefault();let n=0,correct=0;const cards=[...quiz.querySelectorAll('.ie2-reading-question')];cards.forEach(card=>{clearCard(card);const choice=card.querySelector('input:checked'),f=card.querySelector('.ie2-question-feedback');if(!choice){f.textContent='Choose an answer, then check again.';f.className='ie2-question-feedback show needs-review';return;}n++;const ok=choice.value===card.dataset.answer;if(ok)correct++;card.classList.add(ok?'is-correct':'needs-review');f.className='ie2-question-feedback show '+(ok?'correct':'needs-review');f.textContent=(ok?'Correct: '+card.dataset.answer.toUpperCase()+'. ':'Correct answer: '+card.dataset.answer.toUpperCase()+'. ')+card.dataset.feedback;});result.className='ie2-reading-result show '+(n===10&&correct===10?'correct':'needs-review');result.textContent=n<10?n+' / 10 answered. Complete the remaining questions.':correct+' / 10 correct. '+(correct===10?'Now explain how Sam’s impression changed.':'Use the feedback, listen again and retry.');if(n<10)cards.find(c=>!c.querySelector('input:checked')).querySelector('input').focus();});
quiz.addEventListener('change',e=>{if(!e.target.matches('input[type=radio]'))return;clearCard(e.target.closest('.ie2-reading-question'));if(result.textContent){result.textContent='Answers changed. Check again to update your result.';result.className='ie2-reading-result show';}});
quiz.addEventListener('reset',()=>{$$('.ie2-reading-question').forEach(clearCard);result.textContent='';result.className='ie2-reading-result';});
let remaining=45000,deadline=0,interval=null;
function tick(){if(deadline)remaining=Math.max(0,deadline-Date.now());const s=Math.ceil(remaining/1000);$('#speakingTimer').textContent='00:'+String(s).padStart(2,'0');if(!remaining&&deadline){deadline=0;clearInterval(interval);interval=null;$('#toggleTimer').textContent='Start again';$('#timerStatus').textContent='Time is up. Let your partner respond.';}}
function pause(){if(deadline){remaining=Math.max(0,deadline-Date.now());deadline=0;clearInterval(interval);interval=null;$('#toggleTimer').textContent='Continue';}tick();}
$('#toggleTimer').addEventListener('click',()=>{if(deadline){pause();$('#timerStatus').textContent='Paused.';return;}if(!remaining)remaining=45000;deadline=Date.now()+remaining;$('#toggleTimer').textContent='Pause';$('#timerStatus').textContent='Speak, then listen to your partner.';interval=setInterval(tick,200);tick();});
$('#resetTimer').addEventListener('click',()=>{pause();remaining=45000;$('#toggleTimer').textContent='Start 45 seconds';$('#timerStatus').textContent='';tick();});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)tick();});
let authPanel=null,authObserver=null,authEvents=null;
function prepareAuth(){
 const panel=document.querySelector('[data-auth-panel]');if(panel===authPanel)return;
 authObserver?.disconnect();authEvents?.abort();authPanel=panel;if(!panel)return;
 authEvents=new AbortController();
 const place=()=>{const v=window.visualViewport;panel.style.setProperty('--u5-auth-top',((v?.offsetTop||0)+12)+'px');panel.style.setProperty('--u5-auth-height',Math.max(120,(v?.height||innerHeight)-24)+'px');
 if(typeof panel.showPopover==='function'){if(!panel.hasAttribute('popover'))panel.setAttribute('popover','manual');if(panel.hidden){if(panel.matches(':popover-open'))panel.hidePopover();}else if(!panel.matches(':popover-open'))panel.showPopover();}};
 authObserver=new MutationObserver(place);authObserver.observe(panel,{attributes:true,attributeFilter:['hidden']});
 window.visualViewport?.addEventListener('resize',place,{signal:authEvents.signal});window.visualViewport?.addEventListener('scroll',place,{signal:authEvents.signal});place();
}
new MutationObserver(prepareAuth).observe(document.body,{childList:true,subtree:true});prepareAuth();
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&authPanel&&!authPanel.hidden)authPanel.hidden=true;});


// Same authenticated teacher transcript pattern as the other course listenings.
let transcriptRequest=0,transcriptAccount=null;
function account(){return window.JaraLinguaAuth?.getUser?.()||window.JaraLinguaCurrentUser;}
function clearTranscript(){
 $('#teacherTools').hidden=true;$('#teacherTranscript').hidden=true;
 $('#transcriptText').replaceChildren();$('#transcriptToggle').setAttribute('aria-expanded','false');transcriptAccount=null;
}
async function updateTranscriptAccess(){
 const request=++transcriptRequest;clearTranscript();const user=account();if(!user?.credential)return;
 const identity=user.provider+'|'+user.credential;
 try{
  const response=await fetch('/api/intermediate2/unit5-first-impression/transcript',{cache:'no-store',headers:{Authorization:'Bearer '+user.credential,'X-Jaralingua-Auth-Provider':user.provider||'google'},signal:AbortSignal.timeout(12000)});
  if(!response.ok)return;const data=await response.json();const current=account();
  if(request!==transcriptRequest||identity!==current?.provider+'|'+current?.credential)return;
  if(typeof data.transcript!=='string'||!data.transcript.trim())return;
  const paragraphs=data.transcript.split(/\n\s*\n/).map(line=>{const p=document.createElement('p');p.textContent=line;return p;});
  $('#transcriptText').replaceChildren(...paragraphs);transcriptAccount=identity;$('#teacherTools').hidden=false;
 }catch{ /* Fail closed; transcript is never embedded in public assets. */ }
}
$('#transcriptToggle').addEventListener('click',()=>{
 const user=account();if(!user?.credential||transcriptAccount!==user.provider+'|'+user.credential){updateTranscriptAccess();return;}
 const open=$('#teacherTranscript').hidden;$('#teacherTranscript').hidden=!open;$('#transcriptToggle').setAttribute('aria-expanded',String(open));
});
window.addEventListener('jaralingua:auth-changed',updateTranscriptAccess);
window.addEventListener('focus',updateTranscriptAccess);updateTranscriptAccess();

window.addEventListener('pagehide',()=>{audio.pause();stopWord();pause();transcriptRequest++;clearTranscript();});
window.addEventListener('pageshow',e=>{if(e.persisted)updateTranscriptAccess();});tick();
})();
