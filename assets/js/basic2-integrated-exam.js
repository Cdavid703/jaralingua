
(() => {
'use strict';
const $=id=>document.getElementById(id),prefix='/api/basic2/integrated-task/';
let user=null,epoch=0,state=null,attempt=null,preview=false,dirty=false,saveFlight=null,saveTimer=null,timer=null;
let audioUrl=null,audioAllowed=false,submitting=false,pending=null,conflict=null,activeAudio=null;
let authRecovery=false;
const recovery=document.createElement('section');recovery.className='ix-panel';recovery.hidden=true;recovery.setAttribute('role','alert');
const recoveryText=document.createElement('p');recoveryText.textContent='Your sign-in session needs to be renewed. Keep this page open. Reconnect with the same account, then send your exam again. Your answers and writing will be restored.';
const reconnect=document.createElement('button');reconnect.type='button';reconnect.textContent='Reconnect and keep my exam';
recovery.append(recoveryText,reconnect);document.querySelector('.ix-shell').prepend(recovery);
reconnect.onclick=()=>{
 if(attempt&&!preview){const copy={...formValues(),savedAt:Date.now()};putLocal('draft',copy);if(readLocal('draft')?.writing!==copy.writing){alert('This browser cannot keep a recovery copy. Copy your writing before signing in again. Your exam is still on this screen.');return;}}
 if(pending)putLocal('pending',pending);
 const signout=document.querySelector('[data-auth-signout]');if(signout)signout.click();
 window.JaraLinguaAuth?.openPanel();
};
function recoverAuth(){authRecovery=true;localDraft();if(pending)putLocal('pending',pending);clearTimeout(saveTimer);recovery.hidden=false;}
const audio=$('ix-audio');
let playbackRate=1;
function setPlaybackRate(rate){playbackRate=rate;audio.defaultPlaybackRate=rate;audio.playbackRate=rate;document.querySelectorAll('[data-ix-rate]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.ixRate)===rate)));}
document.querySelectorAll('[data-ix-rate]').forEach(button=>button.onclick=()=>setPlaybackRate(Number(button.dataset.ixRate)));
function openTranscript(){if(!['teacher','admin'].includes(state?.role))return;$('ix-transcript-content').replaceChildren(...state.transcript.split(/\n\s*\n/).map(line=>node('p',line)));$('ix-transcript-dialog').showModal();}
$('ix-transcript').onclick=openTranscript;$('ix-admin-transcript').onclick=openTranscript;
$('ix-transcript-close').onclick=()=>$('ix-transcript-dialog').close();
const messages={exam_closed:'The exam is closed. Your teacher will open it.',account_not_linked:'Your account is not linked to this course. Ask your teacher to link it.',audio_not_ready:'The listening is not ready yet.',listening_limit:'You have used your listening plays. Ask your teacher if you need another.',draft_conflict:'Another tab changed your draft. Choose which version to keep.',review_changed:'This review changed in another tab. Refresh submissions.',writing_empty:'Write your blog post before sending the exam.',start_writing_first:'Select Start writing first.',exam_temporarily_unavailable:'The exam service is unavailable. Your local draft is kept. Try again.',already_submitted:'This exam has already been submitted. Check access to see your receipt.'};
function node(tag,text,cls){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;}
function countWords(text){return (text.match(/[\p{L}\p{N}_]+(?:['’\-][\p{L}\p{N}_]+)*/gu)||[]).length;}
const identity=()=>String(user?.email||user?.sub||'').toLowerCase();
const storageKey=kind=>'basic2-integrated-2026-1:'+identity()+':'+(attempt?.id||'')+':'+kind;
function readLocal(kind){try{return JSON.parse(localStorage.getItem(storageKey(kind))||'null');}catch{return null;}}
function putLocal(kind,value){try{localStorage.setItem(storageKey(kind),JSON.stringify(value));}catch{}}
function removeLocal(kind){try{localStorage.removeItem(storageKey(kind));}catch{}}
function report(error,id='ix-status'){if(error.code!=='session_changed')$(id).textContent=error.status===401?'Your session needs renewal. Use “Reconnect and keep my exam”, sign in with the same account, and send again.':messages[error.code]||error.message||'The request failed. Try again.';}
async function request(action,payload,binary=false){
 if(!user?.credential)throw Object.assign(new Error('Sign in to continue.'),{code:'not_signed_in'});
 const ticket=epoch,controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),30000);
 try{
  const response=await fetch(prefix+action,{method:payload===undefined?'GET':'POST',cache:'no-store',signal:controller.signal,
   headers:{Authorization:'Bearer '+user.credential,'X-Jaralingua-Auth-Provider':user.provider||'google',...(payload!==undefined?{'Content-Type':'application/json'}:{})},
   ...(payload!==undefined?{body:JSON.stringify(payload)}:{})});
  const data=binary&&response.ok?await response.blob():await response.json();
  if(ticket!==epoch)throw Object.assign(new Error('session_changed'),{code:'session_changed'});
  if(!response.ok){if(response.status===401)recoverAuth();throw Object.assign(new Error(data.error||'Request failed.'),{code:data.error,data,status:response.status});}
  return data;
 }finally{clearTimeout(timeout);}
}
function panels(name){for(const key of ['access','ready','admin','exam','receipt'])$('ix-'+key).hidden=key!==name;}
function formValues(){const answers={};for(let n=1;n<=10;n++){const checked=document.querySelector('input[name="ix-q'+n+'"]:checked');answers[String(n)]=checked?Number(checked.value):null;}
 return {attemptId:attempt?.id,revision:attempt?.revision,answers,writing:$('ix-writing').value,courseCode:attempt?.courseCode||$('ix-course').value.trim()};}
function localDraft(){if(user&&attempt&&!preview&&!state?.submission&&dirty)putLocal('draft',{...formValues(),savedAt:Date.now()});}
function updateCount(){$('ix-word-count').textContent=countWords($('ix-writing').value)+' / 30 words';}
function changed(){updateCount();if(preview||!attempt||pending)return;dirty=true;localDraft();clearTimeout(saveTimer);if(!authRecovery)saveTimer=setTimeout(()=>saveDraft().catch(()=>{}),900);}
async function saveDraft(){
 if(preview||!attempt||state?.submission||conflict)return;
 if(saveFlight){await saveFlight;if(dirty)return saveDraft();return;}
 if(!dirty)return;
 localDraft();const value=formValues();dirty=false;$('ix-save-status').textContent='Saving…';
 const ticket=epoch;
 saveFlight=(async()=>{
  try{const result=await request('draft',value);if(ticket!==epoch)return;attempt.revision=result.attempt.revision;attempt.updatedAt=result.attempt.updatedAt;
   if(!dirty){removeLocal('draft');$('ix-save-status').textContent='Draft saved.';}
  }catch(error){if(ticket!==epoch)return;dirty=true;localDraft();
   if(error.code==='draft_conflict'){conflict=error.data.attempt;$('ix-conflict').hidden=false;}
   $('ix-save-status').textContent=error.status===401?'Session renewal needed. Your draft is kept on this device.':error.code==='draft_conflict'?messages.draft_conflict:'Saved on this device. Server save needs a retry.';
   throw error;
  }finally{if(ticket===epoch)saveFlight=null;}
 })();
 return saveFlight;
}
function fillAnswers(value){for(const radio of $('ix-questions').querySelectorAll('input'))radio.checked=value.answers?.[radio.dataset.question]===Number(radio.value);$('ix-writing').value=value.writing||'';updateCount();}
function questions(exam){$('ix-questions').replaceChildren();exam.questions.forEach(q=>{
 const set=node('fieldset',undefined,'ix-question');set.append(node('legend',q.id+'. '+q.prompt+' · '+q.speaker));
 q.options.forEach((option,i)=>{const label=node('label'),input=node('input');input.type='radio';input.name='ix-q'+q.id;input.value=String(i);input.dataset.question=q.id;label.append(input,node('span',String.fromCharCode(97+i)+') '+option));set.append(label);});
 $('ix-questions').append(set);
});}
function clock(){clearInterval(timer);if(preview){$('ix-timer').textContent='Preview';return;}
 const tick=()=>{if(!attempt?.writingDeadline){$('ix-timer').textContent='40:00';return;}const seconds=Math.max(0,Math.ceil((Date.parse(attempt.writingDeadline)-Date.now())/1000));
 $('ix-timer').textContent=String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0');
 if(!seconds&&!pending)$('ix-submit-status').textContent='Writing time ended. Send your exam.';};tick();timer=setInterval(tick,1000);
}
function playLabel(){
 $('ix-play-count').textContent=preview?'Teacher preview · unlimited listening':'Unlimited listening';
 $('ix-play').disabled=false;
 $('ix-play').textContent=audioUrl?'Replay from the beginning':'Load listening';
}
function showExam(exam){
 panels('exam');questions(exam);$('ix-back').hidden=!preview;$('ix-submit').hidden=false;$('ix-submit').disabled=false;$('ix-preview-delivery').hidden=!preview;$('ix-transcript').hidden=!preview;
 $('ix-writing-task').textContent=exam.writing.task;$('ix-requirements').replaceChildren(...exam.writing.requirements.map(t=>node('li',t)));
 $('ix-identity').textContent=preview?'Teacher preview — no submission':state.student.fullName+' · '+state.student.id+' · '+attempt.courseCode;
 $('ix-fields').disabled=false;fillAnswers(attempt||{});$('ix-writing').disabled=!preview&&!attempt?.writingStartedAt;
 $('ix-writing-start').hidden=preview||Boolean(attempt?.writingStartedAt);
 $('ix-save-status').textContent=preview?'Teacher preview':'Draft saved.';$('ix-submit-status').textContent='';
 $('ix-conflict').hidden=true;conflict=null;dirty=false;
 if(!preview){
  pending=readLocal('pending');activeAudio=readLocal('audio');
  const local=readLocal('draft');
  if(local&&local.attemptId===attempt.id&&(local.writing!==attempt.writing||JSON.stringify(local.answers)!==JSON.stringify(attempt.answers))&&confirm('A draft saved on this device has not reached the server. Restore it?')){
   fillAnswers(local);dirty=true;
   if(local.revision!==attempt.revision){conflict=attempt;$('ix-conflict').hidden=false;}else saveDraft().catch(()=>{});
  }
  if(pending){$('ix-fields').disabled=true;$('ix-submit-status').textContent='Delivery not yet confirmed. Press Send exam to teacher to retry the same delivery.';}
 }
 playLabel();clock();$('ix-exam').scrollIntoView({block:'start'});
}
function showReceipt(submission){
 panels('receipt');audio.pause();audioAllowed=false;clearInterval(timer);
 $('ix-receipt-summary').textContent='Receipt: '+submission.receiptId+' · '+new Date(submission.submittedAt).toLocaleString();
 $('ix-result').replaceChildren();
 if(submission.status==='graded'){$('ix-result').append(node('p','Grade: '+submission.grade.toFixed(2)+' / 5 · Listening: '+submission.listeningPoints+' / 25 · Writing: '+submission.writingPoints+' / 25'));if(submission.feedback)$('ix-result').append(node('p',submission.feedback));}
 else $('ix-result').append(node('p','Submitted. Waiting for teacher review.'));
 $('ix-receipt').scrollIntoView({block:'start'});
}
function teacherView(){
 panels('admin');$('ix-admin-status').textContent=(state.isOpen?'Open':'Closed')+' · '+state.entries.length+' started attempts'+(state.audioReady?'':' · Audio not ready');
 $('ix-open').disabled=state.isOpen||!state.audioReady;$('ix-close').disabled=!state.isOpen;$('ix-preview').disabled=false;
 const materials=$('ix-private-materials');materials.replaceChildren(node('h3','Answer key'));
 const list=node('ol');state.answerKey.forEach(q=>list.append(node('li',String.fromCharCode(97+q.answer)+') '+q.evidence)));materials.append(list,node('h3','Writing rubric · 25 points'));
 state.rubric.forEach(r=>materials.append(node('p',r.label+' (1–5): '+r.description)));
 const monitor=$('ix-monitor');monitor.replaceChildren();
 if(!state.entries.length)monitor.append(node('p','No students have started.'));
 state.entries.forEach(entry=>{
  const card=node('article',undefined,'ix-review'),sub=entry.submission;
  card.append(node('h3',entry.name+' · '+entry.studentId));
  if(!sub){card.append(node('p','In progress · '+countWords(entry.attempt.writing)+' words · Unlimited listening'));monitor.append(card);return;}
  card.append(node('p',(sub.status==='graded'?'Graded: '+sub.grade.toFixed(2)+' / 5':'Awaiting writing review')+' · Listening: '+sub.listeningPoints+'/25 · '+sub.wordCount+' words'+(sub.lateWriting?' · Submitted after writing time':'')));
  const details=node('details'),summary=node('summary','Read submitted exam');details.append(summary,node('p','Receipt '+sub.receiptId+' · '+sub.courseCode),node('pre',sub.writing));
  state.exam.questions.forEach(q=>details.append(node('p',q.id+'. '+q.prompt+' — '+(sub.answers[q.id]===null?'Not answered':q.options[sub.answers[q.id]]))));card.append(details);
  const form=node('form'),fields=node('div',undefined,'ix-rubric');
  state.rubric.forEach(r=>{const label=node('label',r.label),select=node('select');select.name=r.id;select.required=true;select.title=r.description;select.add(new Option('Score /5',''));for(let i=1;i<=5;i++)select.add(new Option(String(i),String(i)));select.value=sub.rubric?.[r.id]??'';label.append(select);fields.append(label);});
  const label=node('label','Feedback'),feedback=node('textarea');feedback.rows=3;feedback.maxLength=4000;feedback.value=sub.feedback||'';label.append(feedback);
  const button=node('button','Save grade to Grades'),status=node('p',undefined,'ix-grade-status');button.type='submit';form.append(fields,label,button,status);
  form.onsubmit=async event=>{event.preventDefault();button.disabled=true;const rubric=Object.fromEntries([...fields.querySelectorAll('select')].map(e=>[e.name,Number(e.value)]));
   try{await request('grade',{studentId:entry.studentId,receiptId:sub.receiptId,reviewRevision:sub.reviewRevision,rubric,feedback:feedback.value});await load();}
   catch(e){status.textContent=messages[e.code]||e.message;button.disabled=false;}
  };card.append(form);monitor.append(card);
 });
}
async function load(){
 const ticket=epoch;if(!user?.credential){panels('access');$('ix-login').hidden=false;$('ix-status').textContent='Sign in with your course account.';return;}
 const result=await request('state');if(ticket!==epoch)return;authRecovery=false;recovery.hidden=true;state=result;preview=false;attempt=result.attempt||null;
 if(['teacher','admin'].includes(result.role)){teacherView();return;}
 if(!result.student){panels('access');$('ix-status').textContent=messages.account_not_linked;$('ix-login').hidden=false;return;}
 if(result.submission){showReceipt(result.submission);return;}
 if(result.attempt){showExam(result.exam);return;}
 if(result.isOpen){panels('ready');$('ix-ready-name').textContent=result.student.fullName+' · '+result.student.id;}
 else{panels('access');$('ix-login').hidden=true;$('ix-status').textContent=messages.exam_closed;}
}
$('ix-login').onclick=event=>{event.stopPropagation();window.JaraLinguaAuth?.openPanel();};
$('ix-refresh').onclick=()=>load().catch(e=>report(e));
$('ix-start').onclick=async()=>{
 if(!$('ix-course').reportValidity())return;
 $('ix-start').disabled=true;
 try{const r=await request('start',{courseCode:$('ix-course').value.trim()});attempt=r.attempt;showExam(r.exam);}catch(e){panels('access');report(e);}finally{$('ix-start').disabled=false;}
};
$('ix-writing-start').onclick=async()=>{
 $('ix-writing-start').disabled=true;
 try{const r=await request('writing-start',{attemptId:attempt.id});attempt.writingStartedAt=r.attempt.writingStartedAt;attempt.writingDeadline=r.attempt.writingDeadline;
  $('ix-writing').disabled=false;$('ix-writing-start').hidden=true;clock();$('ix-writing').focus();}
 catch(e){report(e,'ix-submit-status');}finally{$('ix-writing-start').disabled=false;}
};
$('ix-fields').addEventListener('input',changed);
$('ix-use-server').onclick=()=>{attempt=conflict;conflict=null;dirty=false;removeLocal('draft');fillAnswers(attempt);$('ix-conflict').hidden=true;$('ix-save-status').textContent='Using saved draft.';};
$('ix-use-local').onclick=()=>{attempt.revision=conflict.revision;conflict=null;$('ix-conflict').hidden=true;dirty=true;saveDraft().catch(()=>{});};
$('ix-play').onclick=async()=>{
 const button=$('ix-play');button.disabled=true;audio.pause();audioAllowed=false;
 try{
  if(audioUrl){audio.currentTime=0;audioAllowed=true;setPlaybackRate(playbackRate);await audio.play();return;}
  if(!preview){
   activeAudio=activeAudio&&!activeAudio.completed?activeAudio:{requestId:crypto.randomUUID(),position:0,completed:false};
   putLocal('audio',activeAudio);
   const r=await request('play',{attemptId:attempt.id,requestId:activeAudio.requestId});attempt.plays=r.attempt.plays;attempt.listenLimit=r.attempt.listenLimit;
  }
  const blob=await request('audio',undefined,true);if(audioUrl)URL.revokeObjectURL(audioUrl);audioUrl=URL.createObjectURL(blob);audio.src=audioUrl;audio.hidden=false;audioAllowed=true;setPlaybackRate(playbackRate);
  audio.onloadedmetadata=()=>{setPlaybackRate(playbackRate);if(activeAudio?.position&&activeAudio.position<audio.duration-1)audio.currentTime=activeAudio.position;};
  try{await audio.play();$('ix-audio-status').textContent='';}catch{$('ix-audio-status').textContent='Audio ready. Press play in the player.';}
 }catch(e){report(e,'ix-audio-status');}finally{playLabel();}
};
audio.addEventListener('play',()=>{if(!audioAllowed)audio.pause();});
audio.addEventListener('timeupdate',()=>{if(!preview&&activeAudio&&audio.currentTime>0){activeAudio.position=audio.currentTime;putLocal('audio',activeAudio);}});
audio.addEventListener('error',()=>{$('ix-audio-status').textContent='Audio could not load. Use Resume listening to retry.';playLabel();});
audio.addEventListener('ended',()=>{audioAllowed=true;playLabel();});
$('ix-form').onsubmit=async event=>{
 event.preventDefault();
 if(authRecovery){localDraft();recovery.hidden=false;recovery.scrollIntoView({block:'center'});return;}
 if(preview){$('ix-submit-status').textContent='Teacher preview: the button is active. Students use it to send their exam; no teacher submission is created.';return;}
 if(submitting||conflict)return;
 if(!attempt.writingStartedAt){$('ix-writing-start').scrollIntoView({block:'center'});report({code:'start_writing_first'},'ix-submit-status');return;}
 if(!$('ix-writing').value.trim()&&!pending){report({code:'writing_empty'},'ix-submit-status');$('ix-writing').focus();return;}
 const values=formValues(),missing=Object.values(values.answers).filter(x=>x===null).length,words=countWords(values.writing);
 if(!pending&&(missing||words<30)&&!confirm('You have '+missing+' unanswered questions and '+words+' words (minimum 30). Send this work anyway?'))return;
 submitting=true;$('ix-fields').disabled=true;$('ix-submit-status').textContent='Sending…';clearTimeout(saveTimer);
 try{
  if(!pending){if(saveFlight)await saveFlight;await saveDraft();pending={...formValues(),clientSubmissionId:crypto.randomUUID(),allowIncomplete:Boolean(missing||words<30)};putLocal('pending',pending);}
  const result=await request('submit',pending);state.submission=result.submission;dirty=false;pending=null;removeLocal('pending');removeLocal('draft');removeLocal('audio');showReceipt(result.submission);
 }catch(e){
  if(e.code==='draft_conflict'&&e.data?.attempt){pending=null;removeLocal('pending');conflict=e.data.attempt;dirty=true;localDraft();$('ix-conflict').hidden=false;}
  if(e.code==='already_submitted'){try{await load();if(state?.submission){pending=null;removeLocal('pending');removeLocal('draft');return;}}catch{}}
  report(e,'ix-submit-status');if(pending)$('ix-submit-status').textContent+=' Retry to confirm the same delivery.';
 }
 finally{submitting=false;$('ix-submit').disabled=false;$('ix-fields').disabled=Boolean(pending);}
};
for(const [id,opened] of [['ix-open',true],['ix-close',false]])$(id).onclick=async()=>{$(id).disabled=true;try{await request('availability',{isOpen:opened});await load();}catch(e){report(e,'ix-admin-status');$(id).disabled=false;}};
$('ix-preview').onclick=()=>{preview=true;attempt=null;activeAudio=null;showExam(state.exam);};
$('ix-back').onclick=()=>{audio.pause();audioAllowed=false;load().catch(e=>report(e,'ix-admin-status'));};
$('ix-monitor-refresh').onclick=()=>load().catch(e=>report(e,'ix-admin-status'));
function authChanged(){
 $('ix-transcript-dialog').close();$('ix-transcript-content').replaceChildren();$('ix-transcript').hidden=true;
 localDraft();epoch++;clearTimeout(saveTimer);clearInterval(timer);audio.pause();audioAllowed=false;audio.hidden=true;audio.removeAttribute('src');if(audioUrl)URL.revokeObjectURL(audioUrl);audioUrl=null;
 user=window.JaraLinguaAuth?.getUser()||window.JaraLinguaCurrentUser||null;state=null;attempt=null;preview=false;dirty=false;saveFlight=null;pending=null;conflict=null;activeAudio=null;submitting=false;
 $('ix-questions').replaceChildren();$('ix-writing').value='';$('ix-private-materials').replaceChildren();$('ix-monitor').replaceChildren();$('ix-result').replaceChildren();
 $('ix-receipt-summary').textContent='';$('ix-identity').textContent='';$('ix-writing-task').textContent='';$('ix-requirements').replaceChildren();$('ix-login').hidden=false;
 panels('access');$('ix-status').textContent=user?.credential?'Checking access…':'Sign in with your course account.';load().catch(e=>report(e));
}
window.addEventListener('jaralingua:auth-changed',authChanged);
if(document.readyState!=='complete')window.addEventListener('load',authChanged,{once:true});
window.addEventListener('beforeunload',localDraft);
document.addEventListener('visibilitychange',()=>{if(document.hidden){localDraft();saveDraft().catch(()=>{});}});
setInterval(async()=>{
 if(!user?.credential||!attempt||preview||state?.submission||submitting||authRecovery)return;
 try{const fresh=await request('state');if(fresh.attempt?.id===attempt?.id){attempt.listenLimit=fresh.attempt.listenLimit;attempt.plays=fresh.attempt.plays;playLabel();
  if(fresh.submission){localDraft();state.submission=fresh.submission;showReceipt(fresh.submission);}}}catch{}
},20000);
authChanged();
})();
