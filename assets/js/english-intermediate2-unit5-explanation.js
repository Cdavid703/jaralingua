/* Unit 5: inline pronunciation, accessible classroom projection and safe mobile auth. */
(()=>{
'use strict';
const player=new Audio();player.preload='none';let rate=.75,active='',lastButton=null,sequence=0;
const sayButtons=()=>[...document.querySelectorAll('[data-u5-say]')];
function sync(){sayButtons().forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.u5Say===active&&!player.paused&&!player.ended)));}
function clearStatus(){document.querySelectorAll('.u5-local-status').forEach(e=>e.remove());document.getElementById('u5-audio-status').textContent='';}
function audioError(){if(!lastButton?.isConnected)return;let s=lastButton.nextElementSibling;if(!s?.classList.contains('u5-local-status')){s=document.createElement('span');s.className='u5-local-status';s.setAttribute('role','status');lastButton.after(s);}s.textContent='Audio could not play. Tap the text to retry.';}
function stop(){sequence++;player.pause();sync();}
['play','pause','ended','ratechange'].forEach(e=>player.addEventListener(e,sync));player.addEventListener('error',()=>{audioError();sync();});
async function play(button){
 const key=button.dataset.u5Say;if(!/^[a-f0-9]{14}$/.test(key))return;
 if(active===key&&!player.paused){stop();return;}
 const ticket=++sequence;player.pause();active=key;lastButton=button;clearStatus();
 const src=new URL('audio/unit-5-explanation/'+key+'.mp3',location.href).href;
 // Reload the source on an explicit replay: WebKit can abort a seek after a modal opens.
 player.src=src;player.load();player.playbackRate=rate;
 try{await player.play();if(ticket===sequence)sync();}catch(e){if(ticket===sequence&&e.name!=='AbortError')audioError();}
}
document.addEventListener('click',e=>{
 const word=e.target.closest('[data-u5-say]');if(word){e.preventDefault();play(word);return;}
 const speed=e.target.closest('[data-u5-speed]');if(speed){rate=Number(speed.dataset.u5Speed);player.playbackRate=rate;document.querySelectorAll('[data-u5-speed]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.u5Speed)===rate)));return;}
 if(e.target.closest('[data-u5-stop]'))stop();
});
document.querySelectorAll('.ie2-theory-topic').forEach(el=>el.addEventListener('toggle',()=>{if(!el.open&&lastButton&&el.contains(lastButton))stop();}));
const dialog=document.createElement('dialog');dialog.className='u4-projector u5-projector';dialog.setAttribute('aria-labelledby','u5-project-title');
dialog.innerHTML='<header class="u4-project-toolbar"><span id="u5-project-count"></span><div><button type="button" data-u5-fullscreen>Full screen</button><button type="button" data-u5-close autofocus>Close ×</button></div></header><div class="u4-project-stage"><div class="u4-project-visual"><img alt=""/></div><div class="u4-project-text"><h2 id="u5-project-title"></h2><div class="u4-project-description"></div><p data-u5-project-status role="status"></p></div></div><nav class="u4-project-nav" aria-label="Projection cards"><button type="button" data-u5-prev>← Previous</button><div class="u5-audio-settings" role="group" aria-label="Projection pronunciation speed"><button type="button" data-u5-speed="0.75" aria-pressed="true">0.75×</button><button type="button" data-u5-speed="1" aria-pressed="false">1×</button><button type="button" data-u5-stop>Stop audio</button></div><button type="button" data-u5-next>Next →</button></nav>';
document.body.append(dialog);
let group=[],index=0,opener=null,ownsFullscreen=false;
function draw(){
 stop();clearStatus();const card=group[index],img=card.querySelector('img'),large=dialog.querySelector('img');
 large.src=img.src;large.alt=img.alt;
 dialog.querySelector('h2').textContent=card.dataset.projectTitle;
 const copy=card.querySelector('.u4-card-copy').cloneNode(true);copy.querySelectorAll('[id]').forEach(e=>e.removeAttribute('id'));
 dialog.querySelector('.u4-project-description').replaceChildren(copy);
 dialog.querySelector('#u5-project-count').textContent=(index+1)+' / '+group.length;
 dialog.querySelector('[data-u5-prev]').disabled=index===0;dialog.querySelector('[data-u5-next]').disabled=index===group.length-1;
 dialog.querySelector('.u4-project-stage').scrollTop=0;dialog.querySelector('[data-u5-project-status]').textContent='';
 document.querySelectorAll('[data-u5-speed]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.u5Speed)===rate)));sync();
 large.onerror=()=>dialog.querySelector('[data-u5-project-status]').textContent='Image could not load. Close and open the card to retry.';
}
document.querySelectorAll('.u5-scene').forEach(card=>{
 card.addEventListener('click',e=>{
  if(e.target.closest('[data-u5-say],a')|| (e.target.closest('button')&&!e.target.closest('.u4-project-open')))return;
  opener=card.querySelector('.u4-project-open');group=[...card.closest('.u5-grid').querySelectorAll('.u5-scene')];index=group.indexOf(card);
  dialog.showModal();document.documentElement.classList.add('u4-projecting');draw();
 });
});
dialog.querySelector('[data-u5-close]').addEventListener('click',()=>dialog.close());
dialog.querySelector('[data-u5-prev]').addEventListener('click',()=>{if(index>0){index--;draw();}});
dialog.querySelector('[data-u5-next]').addEventListener('click',()=>{if(index<group.length-1){index++;draw();}});
dialog.addEventListener('keydown',e=>{if(e.key==='ArrowRight'&&index<group.length-1){e.preventDefault();index++;draw();}else if(e.key==='ArrowLeft'&&index>0){e.preventDefault();index--;draw();}});
dialog.addEventListener('close',()=>{stop();document.documentElement.classList.remove('u4-projecting');if(ownsFullscreen&&document.fullscreenElement)document.exitFullscreen().catch(()=>{});ownsFullscreen=false;opener?.focus({preventScroll:true});});
const full=dialog.querySelector('[data-u5-fullscreen]');full.hidden=!dialog.requestFullscreen;
full.addEventListener('click',async()=>{try{if(document.fullscreenElement===dialog){await document.exitFullscreen();ownsFullscreen=false;}else{await dialog.requestFullscreen();ownsFullscreen=true;}}catch{dialog.querySelector('[data-u5-project-status]').textContent='This browser does not offer full screen here. The enlarged view is still available.';}});
function openHash(){const id=decodeURIComponent(location.hash.slice(1));const el=document.getElementById(id);if(el?.matches('.ie2-theory-topic'))el.open=true;}
window.addEventListener('hashchange',openHash);openHash();
document.querySelectorAll('.u4-topic-nav a').forEach(a=>a.addEventListener('click',()=>{const el=document.getElementById(a.hash.slice(1));if(el)el.open=true;}));
// Preserve the actual provider iframe and escape off-screen header clipping.
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
window.addEventListener('pagehide',stop);
})();

