/* News Quest: three separate practice challenges; no academic submissions. */
(()=>{'use strict';
const $=s=>document.querySelector(s),app=$('#quest-app');
const stages=[{id:'vocabulary',name:'Vocabulary',icon:'📚',detail:'Pictures and sentence gaps'},{id:'listening',name:'Listening',icon:'🎧',detail:'Hear a word and choose'},{id:'pronunciation',name:'Pronunciation',icon:'🎙️',detail:'Say it and check your words'}];
let stage='vocabulary',earned=new Set(),progress={},verified=new Set(),assessmentController=null,lastBlob=null,assessing=false;
let words=[],prompts={},queue=[],position=0,selected=null,attempts=0,resolved=false,run='main',difficult=new Set(),scheduled=new Set(),firstCorrect=0,choiceCount=0,oralDone=0,oralSkipped=0,revealed=false;
const model=document.createElement('audio');model.id='quest-model-audio';model.preload='metadata';document.body.append(model);
const recording=$('#quest-recording');let audioTicket=0,audioQueue=[],queueSlow=false,fxContext=null,fxNodes=[];
let recorder=null,stream=null,micContext=null,micFrame=0,micTimer=0,micToken=0,recordURL=null,micBusy=false,peak=0,startedAt=0;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const word=id=>words.find(w=>w.id===id),current=()=>queue[position],term=()=>word(current().id);
function wordButton(w){return '<button type="button" class="quest-word" data-word="'+w.id+'" aria-pressed="false">'+esc(w.term)+'</button>';}
function audioStatus(s){$('#quest-audio-status').textContent=s;}
function stopAudio(){audioTicket++;audioQueue=[];model.pause();recording.pause();document.querySelectorAll('[data-word]').forEach(b=>b.setAttribute('aria-pressed','false'));fxNodes.forEach(n=>{try{n.stop();}catch{}});fxNodes=[];}
async function play(file,slow=false,tail=[]){
 if(!$('#quest-voice').checked){audioStatus('Voice is off. Turn it on to hear the model.');return;}
 if(micBusy||recorder?.state==='recording'){audioStatus('Finish recording before playing the model.');return;}
 stopAudio();audioQueue=[...tail];queueSlow=slow;const ticket=audioTicket;audioStatus('');
 if(model.getAttribute('src')!==file||model.error){model.src=file;model.load();}else model.currentTime=0;
 model.playbackRate=slow?.75:Number($('#quest-speed').value);
 try{await model.play();if(ticket!==audioTicket) return;document.querySelectorAll('[data-word]').forEach(b=>b.setAttribute('aria-pressed',String(word(b.dataset.word)?.audio===file)));}
 catch(e){if(ticket===audioTicket&&e.name!=='AbortError'){audioQueue=[];audioStatus('Audio could not play. Press Repeat question or Listen to try again.');}}
}
model.addEventListener('error',()=>{audioQueue=[];audioStatus('Audio is unavailable. Check your connection and try again.');});
model.addEventListener('ended',()=>{document.querySelectorAll('[data-word]').forEach(b=>b.setAttribute('aria-pressed','false'));if(audioQueue.length){const [file,...rest]=audioQueue;play(file,queueSlow,rest);}});
recording.addEventListener('play',()=>{audioTicket++;audioQueue=[];model.pause();});
function effect(good){
 if(!$('#quest-effects').checked)return;
 try{fxContext??=new (window.AudioContext||window.webkitAudioContext)();fxContext.resume().catch(()=>{});const time=fxContext.currentTime;
 (good?[523.25,659.25]:[311.13]).forEach((freq,i)=>{const oscillator=fxContext.createOscillator(),gain=fxContext.createGain();oscillator.type='sine';oscillator.frequency.value=freq;gain.gain.setValueAtTime(0,time+i*.1);gain.gain.linearRampToValueAtTime(.035,time+i*.1+.015);gain.gain.exponentialRampToValueAtTime(.001,time+i*.1+.18);oscillator.connect(gain);gain.connect(fxContext.destination);oscillator.start(time+i*.1);oscillator.stop(time+i*.1+.2);fxNodes.push(oscillator);oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();fxNodes=fxNodes.filter(n=>n!==oscillator);};});}catch{/* Visual feedback remains available. */}
}
function releaseStream(){clearInterval(micTimer);micTimer=0;cancelAnimationFrame(micFrame);micFrame=0;stream?.getTracks().forEach(t=>t.stop());stream=null;micContext?.close().catch(()=>{});micContext=null;$('#quest-level').value=0;}
function clearRecording(){recording.pause();recording.removeAttribute('src');recording.load();recording.hidden=true;if(recordURL)URL.revokeObjectURL(recordURL);recordURL=null;}
function cancelMic(){assessmentController?.abort();assessmentController=null;assessing=false;lastBlob=null;micToken++;micBusy=false;if(recorder?.state==='recording')recorder.stop();recorder=null;releaseStream();clearRecording();$('#quest-record').disabled=false;$('#quest-record-stop').disabled=true;}
function resetMedia(){stopAudio();cancelMic();hideTranslation();}
function setView(id){for(const name of ['intro','review','game','results'])$('#quest-'+name).hidden=name!==id;}
function task(id,type,extra={}){return {id,type,...extra};}
function start(ids=words.map(w=>w.id),kind='main'){
 resetMedia();run=kind;difficult=new Set();scheduled=new Set();firstCorrect=0;choiceCount=0;oralDone=0;oralSkipped=0;position=0;
 verified=new Set();
 const ordered=shuffle(ids);
 if(stage==='pronunciation')queue=ordered.map((id,i)=>task(id,'speak',{speech:kind==='phrases'?'sentence':['word','sentence','image'][i%3]}));
 else {const types=stage==='listening'?['listen-picture','listen-word']:['picture-word','cloze'];queue=ordered.map((id,i)=>task(id,types[i%2]));}
 setView('game');render();
}
function scheduleReview(t){
 difficult.add(t.id);if(scheduled.has(t.id)||t.revisit)return;
 scheduled.add(t.id);const retry=task(t.id,t.type==='speak'?'speak':stage==='listening'?(t.type==='listen-picture'?'listen-word':'listen-picture'):(t.type==='cloze'?'picture-word':'cloze'),{revisit:true,speech:'sentence'});
 queue.splice(Math.min(queue.length,position+4),0,retry);
}
function render(){
 resetMedia();if(position>=queue.length)return finish();
 const t=current(),w=term(),oral=t.type==='speak';selected=null;attempts=0;resolved=false;revealed=!(oral&&t.speech==='image');
 $('#quest-count').textContent=stages.find(s=>s.id===stage).name+' · '+(position+1)+' / '+queue.length+(t.revisit?' · revisit':'');$('#quest-progress').max=queue.length;$('#quest-progress').value=position;
 const names={'listen-picture':'Listen → picture','picture-word':'Picture → word','listen-word':'Listen → word',cloze:'Complete the news',speak:'Speaking practice'};
 $('#quest-type').textContent=names[t.type];$('#quest-repeat-question').hidden=t.type==='listen-picture'||t.type==='listen-word';
 $('#quest-prompt').textContent=prompts[oral?'speak-'+t.speech:t.type].text;
 $('#quest-stimulus').innerHTML=t.type==='picture-word'||oral?'<img src="'+w.image+'" alt="'+esc(w.alt)+'" width="1536" height="1024"/>':t.type==='cloze'?'<p class="quest-cloze">'+esc(w.cloze)+'</p>':'';
 $('#quest-options').hidden=oral;$('#quest-speaking').hidden=!oral;$('#quest-check').hidden=oral;$('#quest-check').disabled=true;$('#quest-next').hidden=true;$('#quest-retry').hidden=true;$('#quest-feedback').innerHTML='';$('#quest-feedback').className='';audioStatus('');
 $('#quest-model-controls').hidden=!['listen-picture','listen-word'].includes(t.type)&&!oral;
 if(oral){
  $('#quest-speech-model').textContent=t.speech==='sentence'?w.sentence:w.term;$('#quest-speech-model').hidden=!revealed;
  $('#quest-reveal').hidden=revealed;$('#quest-model-controls').hidden=!revealed;$('#quest-tip').hidden=!revealed;
  $('#quest-tip').innerHTML='<span class="quest-stress">'+esc(w.stress)+'</span> · '+esc(w.tip);
  $('#quest-self-check').hidden=true;$('#quest-skip').hidden=false;$('#quest-aloud').hidden=false;$('#quest-record').hidden=false;$('#quest-record-stop').hidden=false;
  $('#quest-assessment').textContent='';$('#quest-assess-retry').hidden=true;$('#quest-timer').textContent='0 / 10 s';$('#quest-mic-status').textContent='Record to check which words the system understands.';
 }else{
  let options=t.type==='cloze'?w.distractors.map(x=>words.find(a=>a.term===x)):shuffle(words.filter(a=>a.id!==w.id)).slice(0,2);
  options=shuffle([w,...options]);t.options=options.map(x=>x.id);
  $('#quest-choices').innerHTML=options.map((o,i)=>'<label class="quest-option"><input type="radio" name="quest-answer" value="'+o.id+'"/>'+(t.type==='listen-picture'?'<img src="'+o.image+'" alt="'+esc(o.alt)+'" width="1536" height="1024"/>':'')+'<span><b>'+String.fromCharCode(65+i)+'</b>'+(t.type==='listen-picture'?'Picture '+(i+1):esc(o.term))+'</span></label>').join('');
 }
 $('#quest-prompt').focus({preventScroll:true});$('#quest-game').scrollIntoView({block:'start',behavior:'instant'});playQuestion(true);
}
function playQuestion(automatic=false){
 if(automatic&&!$('#quest-voice').checked)return;
 const t=current(),w=term();let files;
 // Listening tasks play only the target word; never read their question aloud.
 if(t.type==='listen-picture'||t.type==='listen-word')files=[w.audio];
 else if(t.type==='cloze')files=[prompts.cloze.audio,w.clozeAudio];
 else if(t.type==='picture-word')files=[prompts['picture-word'].audio];
 else files=[prompts['speak-'+t.speech].audio,...(t.speech==='image'?[]:[modelFile()])];
 play(files[0],false,files.slice(1));
}
function modelFile(){return current().type==='speak'&&current().speech==='sentence'?term().sentenceAudio:term().audio;}
function reveal(){revealed=true;$('#quest-reveal').hidden=true;$('#quest-speech-model').hidden=false;$('#quest-tip').hidden=false;$('#quest-model-controls').hidden=false;}
function check(){
 if(resolved||!selected)return;
 stopAudio();
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
function retry(){if(resolved)return;selected=null;$('#quest-choices').querySelectorAll('input').forEach(i=>{i.disabled=false;i.checked=false;i.closest('label').classList.remove('is-wrong');});$('#quest-retry').hidden=true;$('#quest-feedback').textContent='Try again. You can do this.';$('#quest-check').disabled=true;playQuestion(true);}
function oralComplete(needsPractice=false,skipped=false){
 if(resolved)return;
 cancelMic();stopAudio();resolved=true;
 if(!current().revisit){if(skipped)oralSkipped++;else oralDone++;}
 if(needsPractice)scheduleReview(current());if(skipped)difficult.add(current().id);
 $('#quest-feedback').textContent=verified.has(current().id)?'Your words were recognized. Well done.':skipped?'Speaking skipped. You can practise this word again at the end.':needsPractice?'Reflection saved. This word will return for more practice.':'Practice complete. Keep listening for the sound and stress in the model.';
 $('#quest-assess-retry').hidden=true;$('#quest-self-check').hidden=true;$('#quest-skip').hidden=true;$('#quest-aloud').hidden=true;$('#quest-record').hidden=true;$('#quest-record-stop').hidden=true;$('#quest-next').hidden=false;
 if(!skipped)effect(true);
}
function drawTrophies(){
 $('#quest-trophies').innerHTML=stages.map((s,i)=>'<button type="button" data-stage="'+s.id+'" class="quest-trophy '+(earned.has(s.id)?'is-earned':'')+'"><span class="quest-trophy-icon" aria-hidden="true">'+(earned.has(s.id)?'🏆':s.icon)+'</span><strong>Challenge '+(i+1)+' · '+s.name+'</strong><span>'+s.detail+'</span><span class="quest-trophy-state">'+(earned.has(s.id)?'Trophy earned ✓':progress[s.id]||'Ready to play')+'</span></button>').join('');
}
function trophyMap(){resetMedia();drawTrophies();setView('intro');$('#quest-intro h2').setAttribute('tabindex','-1');$('#quest-intro h2').focus({preventScroll:true});$('#quest-intro').scrollIntoView({block:'start'});}
function celebrate(){
 const box=$('#quest-celebration');box.classList.toggle('quest-no-effects',!$('#quest-effects').checked);box.innerHTML='<span class="quest-cup">🏆</span>';
 if(!$('#quest-effects').checked||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 for(let i=0;i<24;i++){const bit=document.createElement('i');bit.style.setProperty('--x',(i*37%100)+'%');bit.style.setProperty('--delay',(i%6)*.06+'s');bit.style.setProperty('--color',['#087f83','#edb638','#c65477','#4580bf'][i%4]);box.append(bit);}
 effect(true);
}
function finish(){
 resetMedia();setView('results');
 const complete=run==='main'&&(stage!=='pronunciation'||verified.size===words.length);
 if(complete)earned.add(stage);
 progress[stage]=stage==='pronunciation'?verified.size+' / 12 words verified':'Round completed';
 $('#quest-celebration').innerHTML='';if(complete)celebrate();
 $('#quest-finish-title').textContent=complete?stages.find(s=>s.id===stage).name+' trophy earned!':'Keep building your '+stage+' skills';
 $('#quest-summary').innerHTML=stage==='pronunciation'?'<p><strong>'+verified.size+' / '+words.length+'</strong>Words verified automatically</p><p><strong>'+oralDone+'</strong>Turns practised</p><p><strong>'+oralSkipped+'</strong>Turns skipped</p>':'<p><strong>'+firstCorrect+' / '+choiceCount+'</strong>Correct on the first try</p><p><strong>'+difficult.size+'</strong>Words to revisit</p>';
 $('#quest-difficult').innerHTML=difficult.size?[...difficult].map(id=>wordButton(word(id))).join(''):'<p>Well done. You can replay this challenge whenever you like.</p>';
 $('#quest-practise-difficult').hidden=!difficult.size;$('#quest-phrases').hidden=stage!=='pronunciation';$('#quest-next-stage').hidden=stage==='pronunciation';$('#quest-finish-title').focus({preventScroll:true});$('#quest-results').scrollIntoView({block:'start'});
}
async function startRecording(){
 if(micBusy||assessing||recorder?.state==='recording'||resolved)return;
 stopAudio();clearRecording();reveal();lastBlob=null;$('#quest-assessment').textContent='';$('#quest-assess-retry').hidden=true;$('#quest-self-check').hidden=true;
 if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder){$('#quest-mic-status').textContent='Recording is unavailable in this browser. Use Repeat without a microphone or skip this turn.';return;}
 $('#quest-timer').textContent='0 / 10 s';const token=++micToken;micBusy=true;$('#quest-record').disabled=true;$('#quest-mic-status').textContent='Allow the microphone to record up to ten seconds.';
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
   lastBlob=blob;assessRecording(blob,token);
  };
  startedAt=performance.now();rec.start(200);micBusy=false;$('#quest-record-stop').disabled=false;$('#quest-mic-status').textContent='Recording… Say the model. Press Stop when you finish.';
  micTimer=setInterval(()=>{const elapsed=(performance.now()-startedAt)/1000;$('#quest-timer').textContent=Math.min(10,Math.floor(elapsed))+' / 10 s';if(elapsed>=10&&rec.state==='recording')rec.stop();},150);
 }catch(error){if(token!==micToken)return;releaseStream();micBusy=false;$('#quest-record').disabled=false;$('#quest-record-stop').disabled=true;$('#quest-mic-status').textContent=error.name==='NotAllowedError'?'Microphone permission was not granted. You can change the site permission, repeat without a microphone, or skip.':'The microphone could not start. Check your device, try again, or repeat without a microphone.';}
}
// Recognition feedback is explicitly word matching, never a phonetic score.
function compareSpeech(expected,heard){
 const tokens=s=>s.toLowerCase().normalize('NFKC').replace(/[’']/g,'').match(/[a-z]+/g)||[];
 const a=tokens(expected),b=tokens(heard),dp=Array.from({length:a.length+1},()=>Array(b.length+1).fill(0));
 for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++)dp[i][j]=a[i-1]===b[j-1]?dp[i-1][j-1]+1:Math.max(dp[i-1][j],dp[i][j-1]);
 const matched=new Set();let i=a.length,j=b.length;
 while(i&&j){if(a[i-1]===b[j-1]){matched.add(--i);j--;}else if(dp[i-1][j]>=dp[i][j-1])i--;else j--;}
 return {tokens:a,matched,passed:a.length>0&&a.length===b.length&&matched.size===a.length};
}
async function assessRecording(blob,token){
 if(assessing)return;
 assessmentController=new AbortController();const controller=assessmentController;
 const timeout=setTimeout(()=>controller.abort(),90000);assessing=true;$('#quest-record').disabled=true;$('#quest-assess-retry').hidden=true;$('#quest-self-check').hidden=true;$('#quest-mic-status').textContent='Checking your words…';$('#quest-assessment').textContent='';
 try{
  const response=await fetch('/api/english-intermediate/pronunciation-assessment',{method:'POST',headers:{'Content-Type':blob.type||'audio/webm'},body:blob,signal:controller.signal});
  if(!response.ok)throw Error(response.status===429?'Too many attempts. Wait a moment, then retry analysis.':'Analysis is unavailable. Retry analysis or record again.');
  const data=await response.json();if(token!==micToken)return;
  if(typeof data.text!=='string')throw Error('No recognition result was returned. Please retry analysis.');
  if(!data.text.trim()||(typeof data.audio?.rms==='number'&&data.audio.rms<.003))throw Error('No clear speech was detected. Listen to your recording and try again.');
  const w=term(),expected=current().speech==='sentence'?w.sentence:w.term,result=compareSpeech(expected,data.text);
  $('#quest-assessment').innerHTML='<strong>'+ (result.passed?'Words recognized ✓':'Let’s try again')+'</strong><p>Heard: “'+esc(data.text)+'”</p><p>'+result.matched.size+' / '+result.tokens.length+' expected words recognized in order.</p><p>'+result.tokens.map((t,i)=>'<span class="'+(result.matched.has(i)?'quest-heard':'quest-missed')+'">'+esc(t)+(result.matched.has(i)?' ✓':' ↻')+'</span>').join(' ')+'</p><p>'+esc(w.tip)+'</p><small>Word recognition feedback, not a sound-by-sound pronunciation score.</small>';
  if(result.passed){verified.add(w.id);oralComplete();$('#quest-mic-status').textContent='Verified. Continue to the next word.';}
  else{difficult.add(w.id);effect(false);$('#quest-mic-status').textContent='Listen to the model, then record again. Recognition can make mistakes.';}
 }catch(error){if(token!==micToken)return;$('#quest-mic-status').textContent=error.name==='AbortError'?'Analysis took too long. Retry analysis when ready.':error.message;$('#quest-assess-retry').hidden=false;}
 finally{clearTimeout(timeout);if(token===micToken){assessing=false;assessmentController=null;$('#quest-record').disabled=false;}}
}
$('#quest-assess-retry').addEventListener('click',()=>{if(lastBlob&&!assessing)assessRecording(lastBlob,micToken);});

// Spanish help is restricted to study cards and revealed feedback, never answer options.
const translation=document.createElement('div');translation.className='quest-translation';translation.id='quest-translation';translation.lang='es';translation.role='tooltip';translation.hidden=true;document.body.append(translation);let tipTarget=null;
function hideTranslation(){tipTarget?.removeAttribute('aria-describedby');tipTarget=null;translation.hidden=true;}
function showTranslation(button){const w=word(button?.dataset.word);if(!w)return;hideTranslation();tipTarget=button;translation.textContent=w.spanish;translation.hidden=false;button.setAttribute('aria-describedby',translation.id);const r=button.getBoundingClientRect(),t=translation.getBoundingClientRect();translation.style.left=Math.max(12,Math.min(innerWidth-t.width-12,r.left))+'px';translation.style.top=Math.max(12,r.top-t.height-8)+'px';}
document.addEventListener('pointerover',e=>{const b=e.target.closest('[data-word]');if(b&&e.pointerType!=='touch')showTranslation(b);});document.addEventListener('pointerout',e=>{if(e.target.closest('[data-word]'))hideTranslation();});document.addEventListener('focusin',e=>{const b=e.target.closest('[data-word]');if(b)showTranslation(b);});document.addEventListener('focusout',hideTranslation);document.addEventListener('scroll',hideTranslation,true);window.addEventListener('resize',hideTranslation);document.addEventListener('keydown',e=>{if(e.key==='Escape')hideTranslation();});
document.addEventListener('click',e=>{const b=e.target.closest('[data-word]');if(b){showTranslation(b);play(word(b.dataset.word).audio);}const self=e.target.closest('[data-self]');if(self&&!self.disabled)oralComplete(self.dataset.self==='practice');});
document.addEventListener('click',e=>{const b=e.target.closest('[data-stage]');if(b){stage=b.dataset.stage;start();}});
$('#quest-start').addEventListener('click',()=>{stage='vocabulary';start();});$('#quest-restart').addEventListener('click',trophyMap);$('#quest-map').addEventListener('click',trophyMap);$('#quest-next-stage').addEventListener('click',()=>{stage=stages[stages.findIndex(s=>s.id===stage)+1].id;start();});$('#quest-phrases').addEventListener('click',()=>start(difficult.size?[...difficult]:words.map(w=>w.id),'phrases'));$('#quest-practise-difficult').addEventListener('click',()=>start([...difficult],'review'));
$('#quest-preview').addEventListener('click',()=>{resetMedia();setView('review');});$('#quest-review-close').addEventListener('click',()=>{resetMedia();drawTrophies();setView('intro');});
$('#quest-choices').addEventListener('change',e=>{if(e.target.name==='quest-answer'&&!resolved){selected=e.target.value;$('#quest-check').disabled=false;}});
$('#quest-check').addEventListener('click',check);$('#quest-retry').addEventListener('click',retry);$('#quest-next').addEventListener('click',()=>{if(resolved){position++;render();}});
$('#quest-repeat-question').addEventListener('click',()=>playQuestion());
$('#quest-listen').addEventListener('click',()=>play(modelFile()));$('#quest-slow').addEventListener('click',()=>play(modelFile(),true));$('#quest-stop-audio').addEventListener('click',stopAudio);
$('#quest-speed').addEventListener('change',()=>model.playbackRate=Number($('#quest-speed').value));$('#quest-voice').addEventListener('change',()=>{if(!$('#quest-voice').checked)stopAudio();else audioStatus('');});$('#quest-effects').addEventListener('change',()=>{if(!$('#quest-effects').checked){fxNodes.forEach(n=>{try{n.stop();}catch{}});fxNodes=[];}});
$('#quest-reveal').addEventListener('click',()=>{reveal();play(modelFile());});$('#quest-record').addEventListener('click',startRecording);$('#quest-record-stop').addEventListener('click',()=>{if(recorder?.state==='recording')recorder.stop();});
$('#quest-aloud').addEventListener('click',()=>{cancelMic();reveal();play(modelFile());$('#quest-mic-status').textContent='Listen, repeat aloud, then choose your own reflection below.';$('#quest-self-check').hidden=false;$('#quest-self-check').querySelectorAll('button').forEach(b=>b.disabled=false);});$('#quest-skip').addEventListener('click',()=>oralComplete(false,true));
window.addEventListener('pagehide',resetMedia);document.addEventListener('visibilitychange',()=>{if(document.hidden){const active=micBusy||recorder?.state==='recording';stopAudio();if(active){cancelMic();$('#quest-mic-status').textContent='Recording stopped when you left this tab. Try again when you are ready.';}}});
$('#quest-load-retry').addEventListener('click',()=>location.reload());
async function init(){try{const response=await fetch('/assets/data/english-intermediate2-news-quest.json?v=20261009-3');if(!response.ok)throw Error('Unavailable');const data=await response.json();if(data.words?.length!==12||!data.prompts)throw Error('Incomplete');words=data.words;prompts=data.prompts;drawTrophies();
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
