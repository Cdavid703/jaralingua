/* Opt-in visual and formative conversation behavior; shared recorder remains canonical. */
(()=>{'use strict';const c=window.JaraLinguaConversationCoachConfig,$=id=>document.getElementById(id),esc=s=>String(s||'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
const norm=t=>String(t||'').toLowerCase().replace(/[’]/g,"'");
const reason=t=>/\b(because|since|so that|in order to|as a result|to help|to avoid|to prevent)\b/.test(norm(t));
const uncertain=t=>/\b(don't know|do not know|not sure|no idea|cannot tell|can't tell)\b/.test(norm(t));
const topics=[null,/\b(photo|phone|man|box|boxes|volunteer|picture|scene|crop|help|supplies|deliver|unfair|judge|mislead|context|van|famil|water|blanket)/,/\b(warn|phone|student|laptop|screen|rain|check|source|share|message|flood|reliab|true|false|trust|news|worried|unsure|anxious|calm)/,/\b(film|phone|record|help|people|chair|flood|damage|raincoat|famil|neighbor|neighbour|carry|carrying|video|useful|harmful)/,/\b(volunteer|supply|supplies|box|water|food|blanket|famil|shelter|fair|share|distribut|need|first|everyone|child|older|worried|thoughtful)/,/\b(community|communities|reporter|camera|news|attention|damage|cover|both|equal|ignored|clean|people|feel|famil|need)/];
const relevant=(t,q)=>!q.sceneId||topics[q.sceneId].test(norm(t))||(q.kind==='interpret'&&/\b(looks?|seems?|might|worried|happy|tired|calm|confused|focused|angry|sad|unsure)\b/.test(norm(t)));
function correction(t){t=norm(t);if(/\b(?:looks?|seems?) like (?:very |really )?(?:worried|happy|sad|tired|confused|nervous|calm)\b/.test(t))return c.replies['correction-looks'];if(/\bi am agree\b/.test(t))return c.replies['correction-agree'];if(/\bseems? (?:helping|waiting|thinking|working)\b/.test(t))return c.replies['correction-seems'];return null;}
c.questionResolver=(q,previous)=>q.kind==='interpret'&&previous?.questionId===`s${q.sceneId}-observe`&&/\b(looks?|seems?|might|worried|happy|tired|unsure|anxious|calm)\b/.test(norm(previous.transcript))?{...q,...q.alternative}:q;
c.isStudentQuestion=t=>/^(?:hi david[, ]*|david[, ]*)?(?:could you repeat|can you repeat|what does|what do you mean|how do i|can you help|could you help|what is your opinion|what do you think)\b/.test(norm(t).trim());
c.responseResolver=(answer,q,p=q)=>{
 const t=norm(answer.transcript),fix=correction(t);
 if(q.interaction){if(/repeat/.test(t))return [{file:p.audio,text:p.text}];return [c.replies.question];}
 if(q.unscored)return [c.replies.hello];
 if(uncertain(t))return [c.replies.uncertain];
 if(!relevant(t,p))return [c.replies.clarify];
 const out=[];if(fix)out.push(fix);
 if(p.kind==='interpret'){
  if(/\b(?:not|isn't|aren't|don't think|do not think|doesn't look|does not look|doesn't seem|does not seem)\b.{0,35}\bworried\b/.test(t))out.push(c.replies['not-worried']);
  else if(/\bworried\b/.test(t))out.push(c.replies.worried);
  else out.push(c.scenes.find(s=>s.id===p.sceneId)?.reaction||c.replies.inference);
 }else if(p.kind==='observe')out.push(c.replies.observe);
 else if(['reason','prediction'].includes(p.kind))out.push(c.replies.followup);
 else if(/\b(depends|on the other hand|however|both)\b/.test(t))out.push(c.replies.both);
 else if(p.sceneId===2&&/\b(check|verify|source)\b/.test(t)&&!/\b(?:not|never|don't|wouldn't|won't|do not|would not) (?:check|verify)\b/.test(t))out.push(c.replies.check);
 else if(p.sceneId===2&&/\bshare\b/.test(t)&&!/\b(?:not|never|don't|wouldn't|won't|do not|would not) share\b/.test(t))out.push(c.replies.share);
 else out.push(reason(t)?c.replies.reason:c.replies.opinion);
 return out;
};
c.followUpResolver=(answer,q,set)=>!answer||!relevant(answer.transcript,q)||uncertain(answer.transcript)?null:reason(answer.transcript)?set.prediction:set.reason;
c.feedbackRenderer=(answer,q)=>{if(q.unscored)return '<p>Your introduction is welcome. Correct your name below if needed.</p>';const fix=correction(answer.transcript);return '<details><summary>Language support</summary><p>'+esc(fix?.text||(!relevant(answer.transcript,q)?'Connect your response to one detail in the picture.':q.kind==='opinion'&&!reason(answer.transcript)?'Try adding your reason with because.':'Keep separating what you can see from what you think might be happening.'))+'</p><p>Your opinion is not graded. Recognition can make mistakes.</p></details>';};
c.onControls=({recording,locked})=>{document.querySelectorAll('[data-example],[data-word]').forEach(b=>b.disabled=recording||locked);if(recording||locked)$('studentAudio').pause();};
$('studentAudio').addEventListener('play',()=>{if(['listening','analyzing','speaking','responding'].includes($('coachStage').dataset.state))$('studentAudio').pause();});
let currentPrompt=null,playHelp=null;
c.onPrompt=(q,play)=>{
 currentPrompt=q;playHelp=play;const scene=c.scenes.find(s=>s.id===q.sceneId);$('opinionScene').hidden=!scene;
 if(scene){$('opinionImage').src=scene.image;$('opinionImage').alt=scene.alt;$('opinionSceneTitle').textContent=`${scene.id} / 5 · ${scene.title}`;}
 $('opinionExamples').open=false;$('opinionExamples').hidden=false;$('opinionExamplesBody').innerHTML=(q.examples||[]).map(e=>'<p>'+esc(e.text)+' <button type="button" class="coach-audio-button" data-example="'+esc(e.file)+'" aria-label="Listen to this possible answer">▶ Listen</button></p>').join('');
 $('vocabularyBank').innerHTML=(q.vocabulary||[]).map(t=>'<button type="button" class="opinion-word" data-word="'+esc(t)+'">'+esc(t)+'</button>').join('');
 $('opinionQuestionExpand').hidden=false;
};
const dialog=$('opinionDialog'),content=$('opinionDialogContent');
$('opinionImageOpen').addEventListener('click',()=>{content.innerHTML='<img src="'+esc($('opinionImage').getAttribute('src'))+'" alt="'+esc($('opinionImage').alt)+'">';dialog.showModal();});
$('opinionQuestionExpand').addEventListener('click',()=>{content.innerHTML='<p class="opinion-projected-question">'+esc(currentPrompt?.text)+'</p>';dialog.showModal();});
$('opinionDialogClose').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
const tip=$('opinionTooltip');let tipTarget;
function hideTip(){tip.hidden=true;tipTarget?.removeAttribute('aria-describedby');tipTarget=null;}
function showTip(b){if(!b)return;const w=c.wordHelp[b.dataset.word];if(!w)return;hideTip();tipTarget=b;tip.textContent=w.spanish;tip.hidden=false;b.setAttribute('aria-describedby',tip.id);const r=b.getBoundingClientRect(),t=tip.getBoundingClientRect();tip.style.left=Math.max(10,Math.min(innerWidth-t.width-10,r.left))+'px';tip.style.top=Math.max(10,r.top-t.height-8)+'px';}
document.addEventListener('pointerover',e=>{if(e.pointerType!=='touch')showTip(e.target.closest('[data-word]'));});document.addEventListener('pointerout',e=>{if(e.target.closest('[data-word]'))hideTip();});document.addEventListener('focusin',e=>showTip(e.target.closest('[data-word]')));document.addEventListener('focusout',hideTip);document.addEventListener('scroll',hideTip,true);window.addEventListener('resize',hideTip);
document.addEventListener('click',e=>{const b=e.target.closest('[data-word]');if(b){showTip(b);const file=c.wordHelp[b.dataset.word].audio;playHelp?.(file.startsWith('/')?file:file.replace(c.audioRoot,''));}const ex=e.target.closest('[data-example]');if(ex)playHelp?.(ex.dataset.example);});
c.reportRenderer=report=>{
 $('summaryLead').textContent='Your ideas for the round table. No opinion or pronunciation grade.';$('opinionReport').innerHTML=c.scenes.map(scene=>{const turn=report.answers.find(a=>a.questionId===`s${scene.id}-opinion`),text=turn?.main?.transcript;return '<article><h3>'+esc(scene.title)+'</h3><p>'+esc(text||'You have not recorded an opinion for this scene yet.')+'</p><p>'+(!text?'Practise this question before the round table.':reason(text)?'You included a reason. Be ready to respond to a classmate.':'Try adding a reason with because.')+'</p></article>';}).join('');
 $('summaryAnswers').innerHTML=report.answers.map(t=>'<article><h3>'+esc(t.topic)+'</h3><p>'+esc(t.main?.transcript||'No response recorded.')+'</p>'+(t.followUp?'<p>'+esc(t.followUp.transcript)+'</p>':'')+'</article>').join('');$('weakPracticeButton').hidden=true;
};
})();
