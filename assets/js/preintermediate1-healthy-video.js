/* Original video and two independent listening exercises. No submissions. */
(() => {
 'use strict';
 const raw=document.getElementById('hvl-data');if(!raw)return;
 const data=JSON.parse(raw.textContent),key='jl-pi1-unit3-healthy-video-v1',states={},backups={},renders=[];
 const audio=document.getElementById('hvl-audio'),audioStatus=document.getElementById('hvl-audio-status'),storageStatus=document.getElementById('hvl-storage-status');
 const videoFolder=document.getElementById('watch-video'),frame=document.getElementById('hvl-video-frame'),loadButton=document.getElementById('hvl-load-video'),videoStatus=document.getElementById('hvl-video-status'),pauseButton=document.getElementById('hvl-pause-video'),videoSpeeds=[...document.querySelectorAll('[data-hvl-video-speed]')];
 const copy=x=>JSON.parse(JSON.stringify(x)),normalize=s=>s.normalize('NFKC').toLowerCase().trim().replace(/\s+/g,' ').replace(/[.!?,;:]+$/g,'').trim();
 let saved={},canSave=true,vocabulary=null,speed=1,audioToken=0,player=null,ready=false,loading=false,loadEpoch=0,loadTimer=null,pendingSeek=null;
 function unavailable(){canSave=false;storageStatus.hidden=false;storageStatus.textContent='This browser cannot save your draft. Keep the page open or use the original PDF to work on paper.';}
 try{saved=JSON.parse(sessionStorage.getItem(key)||'{}')||{};}catch(_){unavailable();}
 function persist(){if(!canSave)return;try{sessionStorage.setItem(key,JSON.stringify({states,backups}));}catch(_){unavailable();}}
 function stopAudio(){audioToken++;audio.pause();vocabulary?.setPlaying(null);audioStatus.textContent='Support audio stopped.';}
 function pauseVideo(){pendingSeek=null;if(ready){try{player.pauseVideo();}catch(_){}}}
 function stopAll(){stopAudio();pauseVideo();}
 async function playAudio(path,text,button=null){stopAll();const request=++audioToken;audio.src=path;audio.playbackRate=speed;vocabulary?.setPlaying(button);audioStatus.textContent='Loading audio: '+text;try{await audio.play();if(request===audioToken)audioStatus.textContent='Playing: '+text;}catch(_){if(request===audioToken){stopAudio();audioStatus.textContent='Audio could not play. Check your connection and tap again to retry.';}}}
 document.querySelectorAll('[data-hvl-task]').forEach(section=>{
  const id=section.dataset.hvlTask,items=data.tasks[id],isQuotes=id==='quotes',fields=[...section.querySelectorAll(isQuotes?'input':'select')],feedbacks=[...section.querySelectorAll('.hvl-feedback')],result=section.querySelector('.hvl-result'),undo=section.querySelector('[data-hvl-undo]');
  const canon=a=>a.map(x=>isQuotes?normalize(x):x),signature=a=>JSON.stringify(canon(a)),empty=()=>({answers:items.map(()=>''),attempts:[],checked:''});
  function complete(a){return Array.isArray(a)&&a.length===items.length&&a.every(x=>typeof x==='string'&&(isQuotes?normalize(x).length>0:['True','False'].includes(x)));}
  function validAttempt(s){try{const a=JSON.parse(s);return typeof s==='string'&&complete(a)&&JSON.stringify(canon(a))===s;}catch(_){return false;}}
  function valid(s){return s&&Array.isArray(s.answers)&&s.answers.length===items.length&&s.answers.every(x=>typeof x==='string'&&(isQuotes||['','True','False'].includes(x)))&&Array.isArray(s.attempts)&&s.attempts.length<=2&&new Set(s.attempts).size===s.attempts.length&&s.attempts.every(validAttempt)&&typeof s.checked==='string'&&(!s.checked||(complete(s.answers)&&s.checked===signature(s.answers)&&s.attempts.includes(s.checked)));}
  let state=states[id]=valid(saved.states?.[id])?copy(saved.states[id]):empty();if(valid(saved.backups?.[id]))backups[id]=copy(saved.backups[id]);
  function hide(){result.hidden=true;result.textContent='';feedbacks.forEach(f=>{f.hidden=true;f.querySelector('p').textContent='';delete f.dataset.accepted;});}
  function count(){section.querySelector('.hvl-count').textContent=`${state.answers.filter(x=>isQuotes?Boolean(normalize(x)):Boolean(x)).length} of ${items.length} answered.`;}
  function explain(){const correct=items.map((item,i)=>isQuotes?normalize(state.answers[i])===normalize(item.answer):state.answers[i]===item.answer),total=correct.filter(Boolean).length,reveal=state.attempts.length>=2||total===items.length;result.hidden=false;result.textContent=`${total} of ${items.length} answers correct. `+(reveal?'Read the explanations and replay the relevant moments.':'Try a different complete set. Explanations and replay points stay hidden when the same answers are repeated.');if(reveal)feedbacks.forEach((f,i)=>{f.hidden=false;f.dataset.accepted=String(correct[i]);const term=document.createElement('span');term.textContent=items[i].answer;f.querySelector('p').replaceChildren(document.createTextNode((correct[i]?'Correct.':'Review this answer.')+' Answer: '),term,document.createTextNode('. '+items[i].explanation));if(isQuotes)vocabulary?.render(term,term.textContent);});}
  function render(){fields.forEach((field,i)=>{field.value=state.answers[i];field.removeAttribute('aria-invalid');});hide();count();undo.hidden=!backups[id];if(state.checked===signature(state.answers))explain();}
  fields.forEach((field,i)=>field.addEventListener(isQuotes?'input':'change',()=>{state.answers[i]=isQuotes?field.value:(['True','False'].includes(field.value)?field.value:'');state.checked='';delete backups[id];undo.hidden=true;field.removeAttribute('aria-invalid');hide();count();stopAll();vocabulary?.hide();persist();}));
  section.querySelector('[data-hvl-check]').addEventListener('click',()=>{hide();const missing=state.answers.findIndex(x=>isQuotes?!normalize(x):!x);if(missing>=0){result.hidden=false;result.textContent=`Complete all ${items.length} answers before checking. Your work is still here.`;fields[missing].setAttribute('aria-invalid','true');fields[missing].focus();return;}const current=signature(state.answers);if(!state.attempts.includes(current)){if(state.attempts.length<2)state.attempts.push(current);else state.attempts[1]=current;}state.checked=current;explain();persist();result.focus();});
  section.querySelector('[data-hvl-reset]').addEventListener('click',()=>{if(state.answers.some(x=>x.length)||state.attempts.length)backups[id]=copy(state);state=states[id]=empty();stopAll();vocabulary?.hide();render();persist();fields[0].focus();});
  undo.addEventListener('click',()=>{if(!valid(backups[id]))return;state=states[id]=copy(backups[id]);delete backups[id];stopAll();vocabulary?.hide();render();persist();fields[0].focus();});renders.push(render);
 });
 if(window.FirstVisitVocabulary){vocabulary=window.FirstVisitVocabulary(data.vocabulary,(entry,button)=>playAudio(entry.audio,entry.term,button));document.querySelectorAll('[data-glossary]').forEach(el=>vocabulary.render(el,el.textContent));}
 document.querySelectorAll('[data-hvl-audio]').forEach(button=>button.addEventListener('click',()=>{const a=data.audio[button.dataset.hvlAudio];if(a)playAudio(a.path,a.text);}));
 document.querySelectorAll('[data-hvl-speed]').forEach(button=>button.addEventListener('click',()=>{speed=Number(button.dataset.hvlSpeed);audio.playbackRate=speed;document.querySelectorAll('[data-hvl-speed]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.hvlSpeed)===speed)));audioStatus.textContent='Support audio speed: '+speed+'×.';}));
 document.querySelector('[data-hvl-stop]').addEventListener('click',()=>{stopAll();audioStatus.textContent='Audio and video stopped.';});audio.addEventListener('ended',()=>{stopAudio();audioStatus.textContent='Finished. Tap to listen again.';});audio.addEventListener('error',()=>{stopAudio();audioStatus.textContent='Audio could not load. Check your connection and tap again to retry.';});
  function videoControls(){let rates=[];try{rates=player.getAvailablePlaybackRates();}catch(_){}videoSpeeds.forEach(b=>b.disabled=!ready||!rates.includes(Number(b.dataset.hvlVideoSpeed)));pauseButton.disabled=!ready;}
  function rateChanged(){if(!ready)return;const rate=player.getPlaybackRate();videoSpeeds.forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.hvlVideoSpeed)===rate)));videoStatus.textContent='Video speed: '+rate+'×.';}
  function failVideo(epoch,message){if(epoch!==loadEpoch)return;clearTimeout(loadTimer);loadEpoch++;ready=false;loading=false;try{player?.destroy();}catch(_){}player=null;frame.replaceChildren();const target=document.createElement('div');target.id='hvl-player';frame.append(target);frame.hidden=true;loadButton.hidden=false;loadButton.disabled=false;loadButton.textContent='Retry original video';videoControls();videoStatus.textContent=message+' Open the original on YouTube if needed; your answers are still here.';}
  // Communicate with the permitted embedded player without loading third-party scripts in this page.
  function embeddedPlayer(events){
    const iframe=document.createElement('iframe');iframe.id='hvl-player';iframe.title='Original video: Healthy Lifestyle';iframe.referrerPolicy='strict-origin-when-cross-origin';iframe.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';iframe.allowFullscreen=true;
    const origin='https://www.youtube-nocookie.com';const url=new URL(origin+'/embed/'+data.video_id);url.search=new URLSearchParams({enablejsapi:'1',playsinline:'1',rel:'0',autoplay:'0',hl:'en',cc_lang_pref:'en',origin:location.origin,widgetid:'1'}).toString();
    let info={playbackRate:1,availablePlaybackRates:[1]},announced=false,disposed=false;
    const post=message=>{if(!disposed)iframe.contentWindow?.postMessage(JSON.stringify({...message,id:'hvl-player',channel:'hvl-player'}),origin);};
    const command=(func,args=[])=>post({event:'command',func,args});
    const ping=()=>post({event:'listening'});const timer=setInterval(ping,250);
    function receive(event){
      if(disposed||event.source!==iframe.contentWindow||event.origin!==origin)return;
      let message;try{message=typeof event.data==='string'?JSON.parse(event.data):event.data;}catch(_){return;}if(!message||typeof message!=='object')return;
      if((message.event==='initialDelivery'||message.event==='infoDelivery')&&message.info&&typeof message.info==='object'){const incoming=message.info;if(Number.isFinite(incoming.playbackRate))info.playbackRate=incoming.playbackRate;if(Array.isArray(incoming.availablePlaybackRates))info.availablePlaybackRates=incoming.availablePlaybackRates.filter(Number.isFinite);}
      if(!announced&&(message.event==='onReady'||message.event==='initialDelivery')){announced=true;clearInterval(timer);for(const name of ['onStateChange','onPlaybackRateChange','onError','onAutoplayBlocked'])command('addEventListener',[name]);events.onReady();}
      if(message.event==='onStateChange'){info.playerState=message.info;events.onStateChange({data:message.info});}
      if(message.event==='onPlaybackRateChange'){info.playbackRate=message.info;events.onPlaybackRateChange();}
      if(message.event==='onError')events.onError();if(message.event==='onAutoplayBlocked')events.onAutoplayBlocked();
    }
    window.addEventListener('message',receive);iframe.addEventListener('load',ping);iframe.src=url.href;document.getElementById('hvl-player').replaceWith(iframe);
    return{pauseVideo:()=>command('pauseVideo'),playVideo:()=>command('playVideo'),seekTo:(second,ahead)=>command('seekTo',[second,ahead]),setPlaybackRate:rate=>command('setPlaybackRate',[rate]),getPlaybackRate:()=>info.playbackRate,getAvailablePlaybackRates:()=>Array.isArray(info.availablePlaybackRates)?info.availablePlaybackRates:[1],getIframe:()=>iframe,destroy:()=>{disposed=true;clearInterval(timer);window.removeEventListener('message',receive);iframe.remove();}};
  }
  function replayPending(){if(!ready||pendingSeek===null)return;const second=pendingSeek;pendingSeek=null;stopAudio();player.seekTo(second,true);player.playVideo();videoStatus.textContent='Replaying from '+Math.floor(second/60)+':'+String(second%60).padStart(2,'0')+'. Press Play in the player if playback is paused.';}
  async function loadVideo(){
    if(loading)return;if(ready){replayPending();return;}loading=true;const epoch=++loadEpoch;loadButton.disabled=true;videoStatus.textContent='Loading the original YouTube video…';frame.hidden=false;loadTimer=setTimeout(()=>failVideo(epoch,'The video did not become ready.'),25000);
    try{if(epoch!==loadEpoch)return;player=embeddedPlayer({
      onReady:()=>{if(epoch!==loadEpoch)return;clearTimeout(loadTimer);ready=true;loading=false;loadButton.hidden=true;const iframe=player.getIframe();iframe.title='Original video: Healthy Lifestyle';iframe.referrerPolicy='strict-origin-when-cross-origin';videoControls();videoStatus.textContent='Video ready. Press Play in the player.';if(pendingSeek!==null)replayPending();},
      onStateChange:event=>{if(epoch!==loadEpoch)return;if(event.data===1){stopAudio();videoStatus.textContent='Video playing.';}else if(event.data===2)videoStatus.textContent='Video paused.';else if(event.data===0){videoStatus.textContent='Video finished. Replay any part you want to review.';}},
      onPlaybackRateChange:()=>{if(epoch===loadEpoch)rateChanged();},
      onError:()=>failVideo(epoch,'The original video cannot play in this player.'),
      onAutoplayBlocked:()=>{if(epoch===loadEpoch)videoStatus.textContent='Press Play in the player to start the video.';}
    });}catch(_){failVideo(epoch,'The video could not load.');}
  }
  loadButton.addEventListener('click',loadVideo);pauseButton.addEventListener('click',pauseVideo);
  videoSpeeds.forEach(b=>b.addEventListener('click',()=>{if(!ready||b.disabled)return;player.setPlaybackRate(Number(b.dataset.hvlVideoSpeed));}));
  document.querySelectorAll('[data-hvl-seek]').forEach(b=>b.addEventListener('click',()=>{if(b.closest('.hvl-feedback').hidden)return;stopAudio();pendingSeek=Number(b.dataset.hvlSeek);videoFolder.open=true;videoFolder.scrollIntoView({block:'start'});if(ready)replayPending();else loadVideo();}));
  videoFolder.addEventListener('toggle',()=>{if(!videoFolder.open)pauseVideo();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){stopAll();vocabulary?.hide();persist();}});window.addEventListener('pagehide',()=>{stopAll();vocabulary?.hide();persist();});
  function openHash(){let id;try{id=decodeURIComponent(location.hash.slice(1));}catch(_){return;}const target=id&&document.getElementById(id);if(!target)return;let folder=target.closest('details');while(folder){folder.open=true;folder=folder.parentElement?.closest('details');}target.scrollIntoView({block:'start'});}
  renders.forEach(render=>render());window.addEventListener('hashchange',openHash);if(location.hash)openHash();
})();
