/* One player for original reading, paragraph replay and vocabulary support. */
(() => {
 'use strict';
 const raw=document.getElementById('hlr-data');if(!raw)return;
 const data=JSON.parse(raw.textContent),audio=document.getElementById('hlr-audio'),status=document.getElementById('hlr-audio-status'),toggle=document.getElementById('hlr-pause-resume'),stopButton=document.getElementById('hlr-stop');let vocabulary=null,speed=1,token=0,currentLabel='',currentButton=null,stopping=false;
 function controls(){const selected=Boolean(audio.getAttribute('src'));toggle.disabled=!selected;stopButton.disabled=!selected;toggle.textContent=selected?(audio.paused||audio.ended?'Resume audio':'Pause audio'):'Pause audio';}
 function stop(reset=false){token++;stopping=true;audio.pause();if(reset){try{audio.currentTime=0;}catch(_){}}vocabulary?.setPlaying(null);status.textContent='Audio stopped.';controls();}
 async function start(path,label,button=null){stop();currentLabel=label;currentButton=button;audio.src=path;audio.playbackRate=speed;const request=++token;stopping=false;status.textContent='Loading audio: '+label;controls();try{await audio.play();if(request===token){vocabulary?.setPlaying(button);status.textContent='Playing: '+label;controls();}}catch(_){if(request===token){stop();status.textContent='Audio could not play. Check your connection and choose the audio again to retry.';}}}
 toggle.addEventListener('click',async()=>{if(toggle.disabled)return;if(!audio.paused&&!audio.ended){token++;stopping=false;audio.pause();vocabulary?.setPlaying(null);status.textContent='Paused: '+currentLabel;controls();return;}const request=++token;stopping=false;audio.playbackRate=speed;try{await audio.play();if(request===token){vocabulary?.setPlaying(currentButton);status.textContent='Playing: '+currentLabel;controls();}}catch(_){if(request===token){stop();status.textContent='Audio could not resume. Check your connection and try Resume audio again.';}}});
 stopButton.addEventListener('click',()=>stop(true));
 if(window.FirstVisitVocabulary){vocabulary=window.FirstVisitVocabulary(data.vocabulary,(entry,button)=>start(entry.audio,entry.term,button));document.querySelectorAll('[data-glossary]').forEach(el=>vocabulary.render(el,el.textContent));}
 document.querySelectorAll('[data-hlr-audio]').forEach(b=>b.addEventListener('click',()=>{const a=data.audio[b.dataset.hlrAudio];if(a)start(a.path,a.label);}));
 document.querySelectorAll('[data-hlr-speed]').forEach(b=>b.addEventListener('click',()=>{speed=Number(b.dataset.hlrSpeed);audio.playbackRate=speed;document.querySelectorAll('[data-hlr-speed]').forEach(x=>x.setAttribute('aria-pressed',String(Number(x.dataset.hlrSpeed)===speed)));status.textContent='Audio speed: '+speed+'×.';}));
 audio.addEventListener('play',()=>{if(!audio.paused){stopping=false;vocabulary?.setPlaying(currentButton);status.textContent='Playing: '+currentLabel;controls();}});
 audio.addEventListener('pause',()=>{if(audio.paused&&!audio.ended&&!stopping){vocabulary?.setPlaying(null);status.textContent='Paused: '+currentLabel;}controls();});
 audio.addEventListener('ended',()=>{token++;vocabulary?.setPlaying(null);status.textContent='Finished: '+currentLabel+'. Choose an audio to listen again.';controls();});
 audio.addEventListener('error',()=>{stop();status.textContent='Audio could not load. Check your connection and choose the audio again to retry.';});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){stop();vocabulary?.hide();}});window.addEventListener('pagehide',()=>{stop();vocabulary?.hide();});
 function openHash(){let id;try{id=decodeURIComponent(location.hash.slice(1));}catch(_){return;}const target=id&&document.getElementById(id);if(!target)return;let folder=target.closest('details');while(folder){folder.open=true;folder=folder.parentElement?.closest('details');}target.scrollIntoView({block:'start'});}
 controls();window.addEventListener('hashchange',openHash);if(location.hash)openHash();
})();
