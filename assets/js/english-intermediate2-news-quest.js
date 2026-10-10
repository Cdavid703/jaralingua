/* News Quest: private practice. Recordings never leave this tab; no speech scoring API. */
(()=>{'use strict';
const $=s=>document.querySelector(s),app=$('#quest-app');
let words=[],queue=[],position=0,selected=null,attempts=0,resolved=false,run='main',difficult=new Set(),scheduled=new Set(),firstCorrect=0,choiceCount=0,oralDone=0,oralSkipped=0,revealed=false;
const model=document.createElement('audio');model.id='quest-model-audio';model.preload='metadata';document.body.append(model);
const recording=$('#quest-recording');let audioTicket=0,fxContext=null,fxNodes=[];
let recorder=null,stream=null,micContext=null,micFrame=0,micTimer=0,micToken=0,recordURL=null,micBusy=false,peak=0,startedAt=0;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const word=id=>words.find(w=>w.id===id),current=()=>queue[position],term=()=>word(current().id);
function wordButton(w){return '<button type="button" class="quest-word" data-word="'+w.id+'" aria-pressed="false">'+esc(w.term)+'</button>';}
function audioStatus(s){$('#quest-audio-status').textContent=s;}
function stopAudio(){audioTicket++;model.pause();recording.pause();document.querySelectorAll('[data-word]').forEach(b=>b.setAttribute('aria-pressed','false'));fxNodes.forEach(n=>{try{n.stop();}catch{}});fxNodes=[];}
async function play(file,slow=false){
 if(!$('#quest-voice').checked){audioStatus('Voice is off. Turn it on to hear the model.');return;}
 if(micBusy||recorder?.state==='recording'){audioStatus('Finish recording before playing the model.');return;}
 stopAudio();const ticket=audioTicket;audioStatus('');
 if(model.getAttribute('src')!==file||model.error){model.src=file;model.load();}else model.currentTime=0;
 model.playbackRate=slow?.75:Number($('#quest-speed').value);
 try{await model.play();if(ticket!==audioTicket) return;document.querySelectorAll('[data-word]').forEach(b=>b.setAttribute('aria-pressed',String(word(b.dataset.word)?.audio===file)));}
 catch(e){if(ticket===audioTicket&&e.name!=='AbortError')audioStatus('Audio could not play. Check your connection and try Listen again.');}
}
model.addEventListener('error',()=>audioStatus('Audio is unavailable. Check your connection and try again.'));
model.addEventListener('ended',()=>document.querySelectorAll('[data-word]').forEach(b=>b.setAttribute('aria-pressed','false')));
recording.addEventListener('play',()=>{model.pause();$('#quest-self-check').hidden=false;$('#quest-self-check').querySelectorAll('button').forEach(b=>b.disabled=false);});
function effect(good){
 if(!$('#quest-effects').checked)return;
 try{fxContext??=new (window.AudioContext||window.webkitAudioContext)();fxContext.resume().catch(()=>{});const time=fxContext.currentTime;
 (good?[523.25,659.25]:[311.13]).forEach((freq,i)=>{const oscillator=fxContext.createOscillator(),gain=fxContext.createGain();oscillator.type='sine';oscillator.frequency.value=freq;gain.gain.setValueAtTime(0,time+i*.1);gain.gain.linearRampToValueAtTime(.035,time+i*.1+.015);gain.gain.exponentialRampToValueAtTime(.001,time+i*.1+.18);oscillator.connect(gain);gain.connect(fxContext.destination);oscillator.start(time+i*.1);oscillator.stop(time+i*.1+.2);fxNodes.push(oscillator);oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();fxNodes=fxNodes.filter(n=>n!==oscillator);};});}catch{/* Visual feedback remains available. */}
}
function releaseStream(){clearInterval(micTimer);micTimer=0;cancelAnimationFrame(micFrame);micFrame=0;stream?.getTracks().forEach(t=>t.stop());stream=null;micContext?.close().catch(()=>{});micContext=null;$('#quest-level').value=0;}
function clearRecording(){recording.pause();recording.removeAttribute('src');recording.load();recording.hidden=true;if(recordURL)URL.revokeObjectURL(recordURL);recordURL=null;}
function cancelMic(){micToken++;micBusy=false;if(recorder?.state==='recording')recorder.stop();recorder=null;releaseStream();clearRecording();$('#quest-record').disabled=false;$('#quest-record-stop').disabled=true;}
function resetMedia(){stopAudio();cancelMic();hideTranslation();}
function setView(id){for(const name of ['intro','review','game','results'])$('#quest-'+name).hidden=name!==id;}
function task(id,type,extra={}){return {id,type,...extra};}
function start(ids=words.map(w=>w.id),kind='main'){
 resetMedia();run=kind;difficult=new Set();scheduled=new Set();firstCorrect=0;choiceCount=0;oralDone=0;oralSkipped=0;position=0;
 if(kind==='phrases')queue=shuffle(ids).map(id=>task(id,'speak',{speech:'sentence'}));
 else{
  const ordered=shuffle(ids),types=['listen-picture','picture-word','listen-word','cloze'];
  const choices=[...ordered.map((id,i)=>task(id,types[i%4])),...shuffle(ordered.map((id,i)=>task(id,types[(i+2)%4])))];
  const spoken=shuffle(ids);queue=[];choices.forEach((t,i)=>{queue.push(t);if(i%2===1)queue.push(task(spoken[Math.floor(i/2)],'speak',{speech:['word','sentence','image'][Math.floor(i/2)%3]}));});
 }
 setView('game');render();
}
function scheduleReview(t){
 difficult.add(t.id);if(scheduled.has(t.id)||t.revisit)return;
 scheduled.add(t.id);const retry=task(t.id,t.type==='speak'?'speak':t.type==='cloze'?'picture-word':'cloze',{revisit:true,speech:'sentence'});
 queue.splice(Math.min(queue.length,position+4),0,retry);
}
function render(){
 resetMedia();if(position>=queue.length)return finish();
 const t=current(),w=term(),oral=t.type==='speak';selected=null;attempts=0;resolved=false;revealed=!(oral&&t.speech==='image');
 $('#quest-count').textContent='Challenge '+(position+1)+' / '+queue.length+(t.revisit?' · revisit':'');$('#quest-progress').max=queue.length;$('#quest-progress').value=position;
 const names={'listen-picture':'Listen → picture','picture-word':'Picture → word','listen-word':'Listen → word',cloze:'Complete the news',speak:'Speaking practice'};
 $('#quest-type').textContent=names[t.type];
 $('#quest-prompt').textContent=oral?(t.speech==='image'?'Look at the picture. Can you say the word?':t.speech==='sentence'?'Listen and say the sentence.':'Listen and say the word.'):{'listen-picture':'Listen. Which picture matches?','picture-word':'Which word matches this picture?','listen-word':'Listen. Which word do you hear?',cloze:'Complete the news sentence.'}[t.type];
 $('#quest-stimulus').innerHTML=t.type==='picture-word'||oral?'<img src="'+w.image+'" alt="'+esc(w.alt)+'" width="1536" height="1024"/>':t.type==='cloze'?'<p class="quest-cloze">'+esc(w.cloze)+'</p>':'';
 $('#quest-options').hidden=oral;$('#quest-speaking').hidden=!oral;$('#quest-check').hidden=oral;$('#quest-check').disabled=true;$('#quest-next').hidden=true;$('#quest-retry').hidden=true;$('#quest-feedback').innerHTML='';$('#quest-feedback').className='';audioStatus('');
 $('#quest-model-controls').hidden=!['listen-picture','listen-word'].includes(t.type)&&!oral;
 if(oral){
  $('#quest-speech-model').textContent=t.speech==='sentence'?w.sentence:w.term;$('#quest-speech-model').hidden=!revealed;
  $('#quest-reveal').hidden=revealed;$('#quest-model-controls').hidden=!revealed;$('#quest-tip').hidden=!revealed;
  $('#quest-tip').innerHTML='<span class="quest-stress">'+esc(w.stress)+'</span> · '+esc(w.tip);
  $('#quest-self-check').hidden=true;$('#quest-skip').hidden=false;$('#quest-aloud').hidden=false;$('#quest-record').hidden=false;$('#quest-record-stop').hidden=false;
  $('#quest-timer').textContent='0 / 10 s';$('#quest-mic-status').textContent='Your recording stays in this tab. No automatic pronunciation score.';
 }else{
  let options=t.type==='cloze'?w.distractors.map(x=>words.find(a=>a.term===x)):shuffle(words.filter(a=>a.id!==w.id)).slice(0,2);
  options=shuffle([w,...options]);t.options=options.map(x=>x.id);
  $('#quest-choices').innerHTML=options.map((o,i)=>'<label class="quest-option"><input type="radio" name="quest-answer" value="'+o.id+'"/>'+(t.type==='listen-picture'?'<img src="'+o.image+'" alt="'+esc(o.alt)+'" width="1536" height="1024"/>':'')+'<span><b>'+String.fromCharCode(65+i)+'</b>'+(t.type==='listen-picture'?'Picture '+(i+1):esc(o.term))+'</span></label>').join('');
 }
 $('#quest-prompt').focus({preventScroll:true});$('#quest-game').scrollIntoView({block:'start',behavior:'instant'});
}
function modelFile(){return current().type==='speak'&&current().speech==='sentence'?term().sentenceAudio:term().audio;}
function reveal(){revealed=true;$('#quest-reveal').hidden=true;$('#quest-speech-model').hidden=false;$('#quest-tip').hidden=false;$('#quest-model-controls').hidden=false;}
function check(){
 if(resolved||!selected)return;
 const t=current(),w=term(),good=selected===w.id;attempts++;
 if(attempts===1&&!t.revisit){choiceCount++;if(good)firstCorrect++;}
 $('#quest-choices').querySelectorAll('input').forEach(i=>{i.disabled=true;i.closest('label').classList.toggle('is-wrong',i.checked&&!good);});
 $('#quest-check').disabled=true;
 if(!good){scheduleReview(t);$('#quest-feedback').className='is-review';effect(false);}
 if(!good&&attempts===1){$('#quest-feedback').textContent=t.type==='cloze'?'Not quite. Read the whole sentence and try another word.':'Not quite. Look or listen again, then try another answer.';$('#quest-retry').hidden=false;return;}
 resolved=true;$('#quest-check').hidden=true;$('#quest-next').hidden=false;$('#quest-model-controls').hidden=false;
 $('#quest-choices input[value="'+w.id+'"]').closest('label').classList.add('is-correct');
 const letter=String.fromCharCode(65+t.options.indexOf(w.id));
 $('#quest-feedback').innerHTML='<strong>'+(good?'That’s right.':'Let’s learn this one.')+'</strong><span class="quest-answer">'+letter+'. '+wordButton(w)+'</span>'+esc(w.spanish)+' · '+esc(w.definition)+'<p>'+esc(w.sentence)+'</p>';
 play(w.sentenceAudio);if(good)effect(true);
}
function retry(){if(resolved)return;selected=null;$('#quest-choices').querySelectorAll('input').forEach(i=>{i.disabled=false;i.checked=false;i.closest('label').classList.remove('is-wrong');});$('#quest-retry').hidden=true;$('#quest-feedback').textContent='Try again. You can do this.';$('#quest-check').disabled=true;}
function oralComplete(needsPractice=false,skipped=false){
 if(resolved)return;
 cancelMic();stopAudio();resolved=true;
 if(!current().revisit){if(skipped)oralSkipped++;else oralDone++;}
 if(needsPractice)scheduleReview(current());if(skipped)difficult.add(current().id);
 $('#quest-feedback').textContent=skipped?'Speaking skipped. You can practise this word again at the end.':needsPractice?'Reflection saved. This word will return for more practice.':'Practice complete. Keep listening for the sound and stress in the model.';
 $('#quest-self-check').hidden=true;$('#quest-skip').hidden=true;$('#quest-aloud').hidden=true;$('#quest-record').hidden=true;$('#quest-record-stop').hidden=true;$('#quest-next').hidden=false;
 if(!skipped)effect(true);
}
function finish(){
 resetMedia();setView('results');
 $('#quest-summary').innerHTML='<p><strong>'+firstCorrect+' / '+choiceCount+'</strong>Vocabulary · first try</p><p><strong>'+oralDone+'</strong>Speaking turns practised</p><p><strong>'+oralSkipped+'</strong>Speaking turns skipped</p>';
 $('#quest-difficult').innerHTML=difficult.size?[...difficult].map(id=>wordButton(word(id))).join(''):'<p>No difficult words marked in this round. Try the sentence challenge next.</p>';
 $('#quest-practise-difficult').hidden=!difficult.size;$('#quest-finish-title').focus({preventScroll:true});$('#quest-results').scrollIntoView({block:'start'});
}
async function startRecording(){
 if(micBusy||recorder?.state==='recording'||resolved)return;
 stopAudio();clearRecording();reveal();$('#quest-self-check').hidden=true;
 if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder){$('#quest-mic-status').textContent='Recording is unavailable in this browser. Use Repeat without a microphone or skip this turn.';return;}
 const token=++micToken;micBusy=true;$('#quest-record').disabled=true;$('#quest-mic-status').textContent='Allow the microphone to record up to ten seconds.';
 try{
  const requested=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true},video:false});
  if(token!==micToken){requested.getTracks().forEach(t=>t.stop());return;}
  stream=requested;peak=0;
  try{micContext=new (window.AudioContext||window.webkitAudioContext)();await micContext.resume();if(token!==micToken)return;const source=micContext.createMediaStreamSource(stream),analyser=micContext.createAnalyser();analyser.fftSize=2048;source.connect(analyser);const buffer=new Float32Array(analyser.fftSize);
   const meter=()=>{if(token!==micToken)return;analyser.getFloatTimeDomainData(buffer);const rms=Math.sqrt(buffer.reduce((s,n)=>s+n*n,0)/buffer.length);peak=Math.max(peak,rms);$('#quest-level').value=Math.min(1,rms*8);micFrame=requestAnimationFrame(meter);};meter();
  }catch{peak=null;/* Recording remains available if a level meter is unsupported. */}
  if(token!==micToken)return;
  const mime=['audio/webm;codecs=opus','audio/mp4','audio/webm'].find(t=>MediaRecorder.isTypeSupported(t));
  const rec=mime?new MediaRecorder(stream,{mimeType:mime}):new MediaRecorder(stream);recorder=rec;const chunks=[];let failed=false;
  rec.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
  rec.onerror=()=>{failed=true;if(token!==micToken)return;micBusy=false;releaseStream();$('#quest-record').disabled=false;$('#quest-record-stop').disabled=true;$('#quest-mic-status').textContent='Recording was interrupted. Try again or repeat without a microphone.';};
  rec.onstop=()=>{
   if(token!==micToken)return;
   const elapsed=performance.now()-startedAt;releaseStream();micBusy=false;recorder=null;$('#quest-record').disabled=false;$('#quest-record-stop').disabled=true;
   if(failed)return;
   const blob=new Blob(chunks,{type:rec.mimeType});
   if(!blob.size||elapsed<400||(peak!==null&&peak<.003)){$('#quest-mic-status').textContent='The recording was too quiet or too short. Move closer and try again; this is not a pronunciation error.';return;}
   recordURL=URL.createObjectURL(blob);recording.src=recordURL;recording.hidden=false;
   $('#quest-mic-status').textContent='Recording ready. Press Play below to hear yourself, then compare with the model.';
   $('#quest-self-check').hidden=false;$('#quest-self-check').querySelectorAll('button').forEach(b=>b.disabled=true);
  };
  startedAt=performance.now();rec.start(200);micBusy=false;$('#quest-record-stop').disabled=false;$('#quest-mic-status').textContent='Recording… Say the model. Press Stop when you finish.';
  micTimer=setInterval(()=>{const elapsed=(performance.now()-startedAt)/1000;$('#quest-timer').textContent=Math.min(10,Math.floor(elapsed))+' / 10 s';if(elapsed>=10&&rec.state==='recording')rec.stop();},150);
 }catch(error){if(token!==micToken)return;releaseStream();micBusy=false;$('#quest-record').disabled=false;$('#quest-record-stop').disabled=true;$('#quest-mic-status').textContent=error.name==='NotAllowedError'?'Microphone permission was not granted. You can change the site permission, repeat without a microphone, or skip.':'The microphone could not start. Check your device, try again, or repeat without a microphone.';}
}
// Spanish help is restricted to study cards and revealed feedback, never answer options.
const translation=document.createElement('div');translation.className='quest-translation';translation.id='quest-translation';translation.lang='es';translation.role='tooltip';translation.hidden=true;document.body.append(translation);let tipTarget=null;
function hideTranslation(){tipTarget?.removeAttribute('aria-describedby');tipTarget=null;translation.hidden=true;}
function showTranslation(button){const w=word(button?.dataset.word);if(!w)return;hideTranslation();tipTarget=button;translation.textContent=w.spanish;translation.hidden=false;button.setAttribute('aria-describedby',translation.id);const r=button.getBoundingClientRect(),t=translation.getBoundingClientRect();translation.style.left=Math.max(12,Math.min(innerWidth-t.width-12,r.left))+'px';translation.style.top=Math.max(12,r.top-t.height-8)+'px';}
document.addEventListener('pointerover',e=>{const b=e.target.closest('[data-word]');if(b&&e.pointerType!=='touch')showTranslation(b);});document.addEventListener('pointerout',e=>{if(e.target.closest('[data-word]'))hideTranslation();});document.addEventListener('focusin',e=>{const b=e.target.closest('[data-word]');if(b)showTranslation(b);});document.addEventListener('focusout',hideTranslation);document.addEventListener('scroll',hideTranslation,true);window.addEventListener('resize',hideTranslation);document.addEventListener('keydown',e=>{if(e.key==='Escape')hideTranslation();});
document.addEventListener('click',e=>{const b=e.target.closest('[data-word]');if(b){showTranslation(b);play(word(b.dataset.word).audio);}const self=e.target.closest('[data-self]');if(self&&!self.disabled)oralComplete(self.dataset.self==='practice');});
$('#quest-start').addEventListener('click',()=>start());$('#quest-restart').addEventListener('click',()=>start());$('#quest-phrases').addEventListener('click',()=>start(difficult.size?[...difficult]:words.map(w=>w.id),'phrases'));$('#quest-practise-difficult').addEventListener('click',()=>start([...difficult],'review'));
$('#quest-preview').addEventListener('click',()=>{resetMedia();setView('review');});$('#quest-review-close').addEventListener('click',()=>{resetMedia();setView('intro');});
$('#quest-choices').addEventListener('change',e=>{if(e.target.name==='quest-answer'&&!resolved){selected=e.target.value;$('#quest-check').disabled=false;}});
$('#quest-check').addEventListener('click',check);$('#quest-retry').addEventListener('click',retry);$('#quest-next').addEventListener('click',()=>{if(resolved){position++;render();}});
$('#quest-listen').addEventListener('click',()=>play(modelFile()));$('#quest-slow').addEventListener('click',()=>play(modelFile(),true));$('#quest-stop-audio').addEventListener('click',stopAudio);
$('#quest-speed').addEventListener('change',()=>model.playbackRate=Number($('#quest-speed').value));$('#quest-voice').addEventListener('change',()=>{if(!$('#quest-voice').checked)stopAudio();else audioStatus('');});$('#quest-effects').addEventListener('change',()=>{if(!$('#quest-effects').checked){fxNodes.forEach(n=>{try{n.stop();}catch{}});fxNodes=[];}});
$('#quest-reveal').addEventListener('click',()=>{reveal();play(modelFile());});$('#quest-record').addEventListener('click',startRecording);$('#quest-record-stop').addEventListener('click',()=>{if(recorder?.state==='recording')recorder.stop();});
$('#quest-aloud').addEventListener('click',()=>{cancelMic();reveal();play(modelFile());$('#quest-mic-status').textContent='Listen, repeat aloud, then choose your own reflection below.';$('#quest-self-check').hidden=false;$('#quest-self-check').querySelectorAll('button').forEach(b=>b.disabled=false);});$('#quest-skip').addEventListener('click',()=>oralComplete(false,true));
window.addEventListener('pagehide',resetMedia);document.addEventListener('visibilitychange',()=>{if(document.hidden){const active=micBusy||recorder?.state==='recording';stopAudio();if(active){cancelMic();$('#quest-mic-status').textContent='Recording stopped when you left this tab. Try again when you are ready.';}}});
$('#quest-load-retry').addEventListener('click',()=>location.reload());
async function init(){try{const response=await fetch('/assets/data/english-intermediate2-news-quest.json?v=20261009-1');if(!response.ok)throw Error('Unavailable');const data=await response.json();if(data.words?.length!==12)throw Error('Incomplete');words=data.words;
 $('#quest-cards').innerHTML=words.map(w=>'<article class="quest-card"><img src="'+w.image+'" alt="'+esc(w.alt)+'" loading="lazy" width="1536" height="1024"/><div>'+wordButton(w)+'<p>'+esc(w.definition)+'</p></div></article>').join('');$('#quest-loading').hidden=true;app.hidden=false;
 }catch{$('#quest-loading').textContent='The activity could not load. Check your connection and try again.';$('#quest-load-retry').hidden=false;}}
init();
 // Keep the established authentication panel inside the visible viewport.
 let authPanel=null,authObserver=null,authEvents=null;
 function prepareAuth(){
  const panel=document.querySelector('[data-auth-panel]');if(panel===authPanel)return;
  authObserver?.disconnect();authEvents?.abort();authPanel=panel;if(!panel)return;authEvents=new AbortController();
  const place=()=>{const v=window.visualViewport;panel.style.setProperty('--u6-auth-top',((v?.offsetTop||0)+12)+'px');panel.style.setProperty('--u6-auth-height',Math.max(120,(v?.height||innerHeight)-24)+'px');if(typeof panel.showPopover==='function'){if(!panel.hasAttribute('popover'))panel.setAttribute('popover','manual');if(panel.hidden){if(panel.matches(':popover-open'))panel.hidePopover();}else if(!panel.matches(':popover-open'))panel.showPopover();}};
  authObserver=new MutationObserver(place);authObserver.observe(panel,{attributes:true,attributeFilter:['hidden']});window.visualViewport?.addEventListener('resize',place,{signal:authEvents.signal});window.visualViewport?.addEventListener('scroll',place,{signal:authEvents.signal});place();
 }
 new MutationObserver(prepareAuth).observe(document.body,{childList:true,subtree:true});prepareAuth();
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&authPanel&&!authPanel.hidden)authPanel.hidden=true;});


})();
