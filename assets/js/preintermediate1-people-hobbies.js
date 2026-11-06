/* Original video and worksheet tasks. Local drafts; no submissions or official grades. */
(() => {
  'use strict';
  const raw=document.getElementById('ph-data');if(!raw)return;
  const data=JSON.parse(raw.textContent),key='jl-pi1-unit2-people-hobbies-v1',states={};
  const storageStatus=document.getElementById('ph-storage-status'),audio=document.getElementById('ph-audio'),audioStatus=document.getElementById('ph-audio-status');
  const videoFolder=document.getElementById('watch-video'),frame=document.getElementById('ph-video-frame'),loadButton=document.getElementById('ph-load-video'),videoStatus=document.getElementById('ph-video-status'),pauseButton=document.getElementById('ph-pause-video');
  let saved={},storageAvailable=true,vocabulary=null,speed=1,audioToken=0;
  let player=null,ready=false,loading=false,loadEpoch=0,loadTimer=null,pendingSeek=null,evidencePlayback=false;
  const videoSpeeds=[...document.querySelectorAll('[data-ph-video-speed]')];
  function unavailable(){storageAvailable=false;storageStatus.hidden=false;storageStatus.textContent='This browser cannot save your draft. Keep this page open and copy your opinion before leaving.';}
  try{saved=JSON.parse(sessionStorage.getItem(key)||'{}')||{};}catch(_){unavailable();}
  const backups=saved.backups&&typeof saved.backups==='object'&&!Array.isArray(saved.backups)?saved.backups:{};
  const copy=value=>JSON.parse(JSON.stringify(value));
  function persist(){if(!storageAvailable)return;try{sessionStorage.setItem(key,JSON.stringify({tasks:states,backups}));}catch(_){unavailable();}}
  function stopAudio(){audioToken++;audio.pause();vocabulary?.setPlaying(null);}
  function pauseVideo(){pendingSeek=null;evidencePlayback=false;if(ready){try{player.pauseVideo();}catch(_){}}}
  function stopAll(){stopAudio();pauseVideo();}
  async function playAudio(path,text,button=null){stopAll();const request=++audioToken;audio.src=path;audio.playbackRate=speed;vocabulary?.setPlaying(button);audioStatus.textContent='Loading audio: '+text;
    try{await audio.play();if(request===audioToken)audioStatus.textContent='Playing: '+text;}catch(_){if(request===audioToken){stopAudio();audioStatus.textContent='Audio could not play. Check your connection and tap again to retry.';}}
  }
  document.querySelectorAll('[data-ph-task]').forEach(section=>{
    const id=section.dataset.phTask,scored=id==='listening',fields=[...section.querySelectorAll('select,textarea')],old=saved.tasks?.[id];
    const safe=a=>typeof a==='string'&&(!scored||['','True','False'].includes(a))?a:'';
    const state=states[id]={answers:fields.map((_,i)=>safe(old?.answers?.[i])),attempts:Math.min(2,Math.max(0,Math.floor(Number(old?.attempts)||0))),last:typeof old?.last==='string'?old.last:''};
    const result=section.querySelector('.ph-result'),feedbacks=[...section.querySelectorAll('.ph-feedback')],undo=section.querySelector('[data-ph-undo]');
    const signature=()=>JSON.stringify(state.answers);
    const valid=b=>b&&Array.isArray(b.answers)&&b.answers.length===fields.length&&b.answers.every(a=>typeof a==='string'&&(!scored||['','True','False'].includes(a)))&&typeof b.last==='string'&&Number.isFinite(b.attempts)&&b.attempts>=0&&b.attempts<=2;
    if(!valid(backups[id]))delete backups[id];undo.hidden=!backups[id];
    function hide(){result.hidden=true;result.textContent='';feedbacks.forEach(f=>{f.hidden=true;f.querySelector('p').textContent='';});if(scored&&evidencePlayback)pauseVideo();}
    function count(){if(scored)section.querySelector('.ph-count').textContent=`${state.answers.filter(Boolean).length} of 12 answered.`;}
    function feedback(){
      result.hidden=false;
      if(!scored){result.textContent='Read your opinion again. Check that you named one hobby you find most interesting and one you find least interesting. You can add a reason for each. Your preferences are personal; this response is not automatically corrected or scored.';return;}
      const correct=data.items.map((item,i)=>item.answer===state.answers[i]),total=correct.filter(Boolean).length,reveal=state.attempts>=2||total===12;
      result.textContent=`${total} of 12 answers correct. `+(reveal?'Read the explanations and replay the relevant moments, then revise anything you want to review.':'Try a different complete set of answers. Explanations and replay points appear after two different complete attempts.');
      if(reveal)feedbacks.forEach((el,i)=>{el.hidden=false;el.dataset.accepted=String(correct[i]);el.querySelector('p').textContent=`${correct[i]?'Correct.':'Review this answer.'} Answer: ${data.items[i].answer}. ${data.items[i].explanation}`;});
    }
    function render(){fields.forEach((f,i)=>{f.value=state.answers[i];f.removeAttribute('aria-invalid');});hide();count();if(state.answers.every(a=>a.trim())&&state.last===signature())feedback();}
    fields.forEach((field,i)=>field.addEventListener(scored?'change':'input',()=>{state.answers[i]=field.value;delete backups[id];undo.hidden=true;field.removeAttribute('aria-invalid');hide();count();persist();}));
    section.querySelector('[data-ph-check]').addEventListener('click',()=>{hide();const missing=state.answers.findIndex(a=>!a.trim());if(missing>=0){result.hidden=false;result.textContent=scored?'Answer all twelve statements before checking. Your answers are still here.':'Write your opinion before reviewing. Your response is personal and is not scored.';fields[missing].setAttribute('aria-invalid','true');fields[missing].focus();return;}const current=signature();if(scored&&state.last!==current)state.attempts=Math.min(2,state.attempts+1);state.last=current;feedback();persist();result.focus();});
    section.querySelector('[data-ph-reset]').addEventListener('click',()=>{if(state.answers.some(a=>a.trim())||state.last)backups[id]=copy(state);state.answers=fields.map(()=>'');state.attempts=0;state.last='';render();undo.hidden=!backups[id];persist();fields[0].focus();});
    undo.addEventListener('click',()=>{if(!valid(backups[id]))return;Object.assign(state,backups[id]);delete backups[id];undo.hidden=true;render();persist();fields[0].focus();});render();
  });
  if(window.FirstVisitVocabulary){vocabulary=window.FirstVisitVocabulary(data.vocabulary,(entry,button)=>playAudio(entry.audio,entry.term,button));document.querySelectorAll('[data-glossary]').forEach(el=>vocabulary.render(el,el.textContent));}
  document.querySelectorAll('[data-ph-audio]').forEach(b=>b.addEventListener('click',()=>{const item=data.audio[b.dataset.phAudio];playAudio(item.path,item.text);}));
  document.querySelectorAll('[data-ph-speed]').forEach(b=>b.addEventListener('click',()=>{speed=Number(b.dataset.phSpeed);audio.playbackRate=speed;document.querySelectorAll('[data-ph-speed]').forEach(x=>x.setAttribute('aria-pressed',String(Number(x.dataset.phSpeed)===speed)));audioStatus.textContent='Support audio speed: '+speed+'×.';}));
  document.querySelector('[data-ph-stop]').addEventListener('click',()=>{stopAll();audioStatus.textContent='Audio and video stopped.';});
  audio.addEventListener('ended',()=>{stopAudio();audioStatus.textContent='Finished. Tap to listen again.';});audio.addEventListener('error',()=>{stopAudio();audioStatus.textContent='Audio could not load. Check your connection and tap again to retry.';});
  function videoControls(){let rates=[];try{rates=player.getAvailablePlaybackRates();}catch(_){}videoSpeeds.forEach(b=>b.disabled=!ready||!rates.includes(Number(b.dataset.phVideoSpeed)));pauseButton.disabled=!ready;}
  function rateChanged(){if(!ready)return;const rate=player.getPlaybackRate();videoSpeeds.forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.phVideoSpeed)===rate)));videoStatus.textContent='Video speed: '+rate+'×.';}
  function failVideo(epoch,message){if(epoch!==loadEpoch)return;clearTimeout(loadTimer);loadEpoch++;ready=false;loading=false;pendingSeek=null;evidencePlayback=false;try{player?.destroy();}catch(_){}player=null;frame.replaceChildren();const target=document.createElement('div');target.id='ph-player';frame.append(target);frame.hidden=true;loadButton.hidden=false;loadButton.disabled=false;loadButton.textContent='Retry original video';videoControls();videoStatus.textContent=message+' Open the original on YouTube if needed; your answers are still here.';}
  // Communicate with the permitted embedded player without loading third-party scripts in this page.
  function embeddedPlayer(events){
    const iframe=document.createElement('iframe');iframe.id='ph-player';iframe.title='Original video: Listening — hobbies';iframe.referrerPolicy='strict-origin-when-cross-origin';iframe.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';iframe.allowFullscreen=true;
    const origin='https://www.youtube-nocookie.com';const url=new URL(origin+'/embed/'+data.video_id);url.search=new URLSearchParams({enablejsapi:'1',playsinline:'1',rel:'0',autoplay:'0',hl:'en',cc_lang_pref:'en',origin:location.origin,widgetid:'1'}).toString();
    let info={playbackRate:1,availablePlaybackRates:[1]},announced=false,disposed=false;
    const post=message=>{if(!disposed)iframe.contentWindow?.postMessage(JSON.stringify({...message,id:'ph-player',channel:'ph-player'}),origin);};
    const command=(func,args=[])=>post({event:'command',func,args});
    const ping=()=>post({event:'listening'});const timer=setInterval(ping,250);
    function receive(event){
      if(disposed||event.source!==iframe.contentWindow||event.origin!==origin)return;
      let message;try{message=typeof event.data==='string'?JSON.parse(event.data):event.data;}catch(_){return;}if(!message||typeof message!=='object')return;
      if((message.event==='initialDelivery'||message.event==='infoDelivery')&&message.info&&typeof message.info==='object')Object.assign(info,message.info);
      if(!announced&&(message.event==='onReady'||message.event==='initialDelivery')){announced=true;clearInterval(timer);for(const name of ['onStateChange','onPlaybackRateChange','onError','onAutoplayBlocked'])command('addEventListener',[name]);events.onReady();}
      if(message.event==='onStateChange'){info.playerState=message.info;events.onStateChange({data:message.info});}
      if(message.event==='onPlaybackRateChange'){info.playbackRate=message.info;events.onPlaybackRateChange();}
      if(message.event==='onError')events.onError();if(message.event==='onAutoplayBlocked')events.onAutoplayBlocked();
    }
    window.addEventListener('message',receive);iframe.addEventListener('load',ping);iframe.src=url.href;document.getElementById('ph-player').replaceWith(iframe);
    return{pauseVideo:()=>command('pauseVideo'),playVideo:()=>command('playVideo'),seekTo:(second,ahead)=>command('seekTo',[second,ahead]),setPlaybackRate:rate=>command('setPlaybackRate',[rate]),getPlaybackRate:()=>info.playbackRate,getAvailablePlaybackRates:()=>Array.isArray(info.availablePlaybackRates)?info.availablePlaybackRates:[1],getIframe:()=>iframe,destroy:()=>{disposed=true;clearInterval(timer);window.removeEventListener('message',receive);iframe.remove();}};
  }
  function replayPending(){if(!ready||pendingSeek===null)return;const second=pendingSeek;pendingSeek=null;stopAudio();evidencePlayback=true;player.seekTo(second,true);player.playVideo();videoStatus.textContent='Replaying from '+Math.floor(second/60)+':'+String(second%60).padStart(2,'0')+'. Press Play in the player if playback is paused.';}
  async function loadVideo(){
    if(loading)return;if(ready){replayPending();return;}loading=true;const epoch=++loadEpoch;loadButton.disabled=true;videoStatus.textContent='Loading the original YouTube video…';frame.hidden=false;loadTimer=setTimeout(()=>failVideo(epoch,'The video did not become ready.'),25000);
    try{if(epoch!==loadEpoch)return;player=embeddedPlayer({
      onReady:()=>{if(epoch!==loadEpoch)return;clearTimeout(loadTimer);ready=true;loading=false;loadButton.hidden=true;const iframe=player.getIframe();iframe.title='Original video: Listening — hobbies';iframe.referrerPolicy='strict-origin-when-cross-origin';videoControls();videoStatus.textContent='Video ready. Press Play in the player.';if(pendingSeek!==null)replayPending();},
      onStateChange:event=>{if(epoch!==loadEpoch)return;if(event.data===1){stopAudio();videoStatus.textContent='Video playing.';}else if(event.data===2)videoStatus.textContent='Video paused.';else if(event.data===0){evidencePlayback=false;videoStatus.textContent='Video finished. Replay any part you want to review.';}},
      onPlaybackRateChange:()=>{if(epoch===loadEpoch)rateChanged();},
      onError:()=>failVideo(epoch,'The original video cannot play in this player.'),
      onAutoplayBlocked:()=>{if(epoch===loadEpoch)videoStatus.textContent='Press Play in the player to start the video.';}
    });}catch(_){failVideo(epoch,'The video could not load.');}
  }
  loadButton.addEventListener('click',loadVideo);pauseButton.addEventListener('click',pauseVideo);
  videoSpeeds.forEach(b=>b.addEventListener('click',()=>{if(!ready||b.disabled)return;player.setPlaybackRate(Number(b.dataset.phVideoSpeed));}));
  document.querySelectorAll('[data-ph-seek]').forEach(b=>b.addEventListener('click',()=>{if(b.closest('.ph-feedback').hidden)return;stopAudio();pendingSeek=Number(b.dataset.phSeek);evidencePlayback=true;videoFolder.open=true;videoFolder.scrollIntoView({block:'start'});if(ready)replayPending();else loadVideo();}));
  videoFolder.addEventListener('toggle',()=>{if(!videoFolder.open)pauseVideo();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){stopAll();vocabulary?.hide();persist();}});window.addEventListener('pagehide',()=>{stopAll();vocabulary?.hide();persist();});
  function openHash(){let id;try{id=decodeURIComponent(location.hash.slice(1));}catch(_){return;}const target=id&&document.getElementById(id);if(!target)return;let folder=target.closest('details');while(folder){folder.open=true;folder=folder.parentElement?.closest('details');}target.scrollIntoView({block:'start'});}
  window.addEventListener('hashchange',openHash);if(location.hash)openHash();
})();
