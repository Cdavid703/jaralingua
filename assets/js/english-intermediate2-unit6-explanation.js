/* Unit 6: one audio player, classroom projection and vocabulary help. */
(()=>{
 'use strict';
 const player=document.getElementById('u6-player');
 let rate=.75,active='',lastButton=null,sequence=0;
 const buttons=()=>[...document.querySelectorAll('[data-u6-say]')];
 function sync(){buttons().forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.u6Say===active&&!player.paused&&!player.ended)));}
 function status(text=''){document.querySelectorAll('[data-u6-status],#u6-audio-status').forEach(e=>e.textContent=text);}
 function stop(){sequence++;player.pause();sync();}
 function error(){const message='Audio could not play. Tap the model to retry.';status(message);if(lastButton?.isConnected){let local=lastButton.nextElementSibling;if(!local?.classList.contains('u6-local-status')){local=document.createElement('span');local.className='u6-local-status';local.setAttribute('role','status');lastButton.after(local);}local.textContent=message;}}
 ['play','pause','ended'].forEach(event=>player.addEventListener(event,sync));
 player.addEventListener('error',error);
 async function play(button){
  const file=button.dataset.u6Say;if(!/^[a-z0-9-]+\.mp3$/.test(file))return;
  if(active===file&&!player.paused){stop();return;}
  const ticket=++sequence;player.pause();active=file;lastButton=button;status();
  player.src=new URL('audio/unit-6-explanation/'+file,location.href).href;
  document.querySelectorAll('.u6-local-status').forEach(e=>e.remove());player.load();player.playbackRate=rate;
  try{await player.play();if(ticket===sequence)sync();}catch(e){if(ticket===sequence&&e.name!=='AbortError')error();}
 }
 const tip=document.createElement('div');tip.id='u6-tooltip';tip.className='u6-tooltip';tip.hidden=true;tip.lang='es';tip.setAttribute('role','tooltip');
 let tipTarget=null,tipTimer;
 function hideTip(){clearTimeout(tipTimer);tipTarget?.removeAttribute('aria-describedby');tipTarget=null;tip.hidden=true;}
 function placeTip(){
  if(!tipTarget?.isConnected)return hideTip();
  const r=tipTarget.getBoundingClientRect(),t=tip.getBoundingClientRect();
  tip.style.left=Math.max(12,Math.min(innerWidth-t.width-12,r.left+(r.width-t.width)/2))+'px';
  tip.style.top=Math.max(12,r.top-t.height-10>=12?r.top-t.height-10:Math.min(innerHeight-t.height-12,r.bottom+10))+'px';
 }
 function showTip(button){
  if(!button?.dataset.u6Meaning)return;
  hideTip();tipTarget=button;(button.closest('dialog')||document.body).append(tip);
  tip.textContent=button.dataset.u6Meaning;tip.hidden=false;button.setAttribute('aria-describedby',tip.id);placeTip();
 }
 const leaveTip=()=>{clearTimeout(tipTimer);tipTimer=setTimeout(()=>{if(!tip.matches(':hover')&&document.activeElement!==tipTarget)hideTip();},120);};
 tip.addEventListener('pointerenter',()=>clearTimeout(tipTimer));tip.addEventListener('pointerleave',leaveTip);
 document.addEventListener('pointerover',e=>{if(e.pointerType!=='touch'){const b=e.target.closest('[data-u6-meaning]');if(b&&b!==tipTarget)showTip(b);}});
 document.addEventListener('pointerout',e=>{if(e.target.closest('[data-u6-meaning]')&&!e.target.closest('[data-u6-meaning]').contains(e.relatedTarget))leaveTip();});
 document.addEventListener('focusin',e=>showTip(e.target.closest('[data-u6-meaning]')));
 document.addEventListener('focusout',leaveTip);
 document.addEventListener('scroll',()=>{if(!tip.hidden)placeTip();},true);window.addEventListener('resize',hideTip);
 document.addEventListener('pointerdown',e=>{if(!e.target.closest('[data-u6-meaning],.u6-tooltip'))hideTip();},true);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!tip.hidden){hideTip();e.preventDefault();e.stopPropagation();}},true);
 document.addEventListener('click',e=>{
  const b=e.target.closest('[data-u6-say]');if(b){showTip(b);play(b);return;}
  const speed=e.target.closest('[data-u6-speed]');
  if(speed){rate=Number(speed.dataset.u6Speed);player.playbackRate=rate;document.querySelectorAll('[data-u6-speed]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.u6Speed)===rate)));}
  if(e.target.closest('[data-u6-stop]'))stop();
 });
 document.querySelectorAll('.ie2-theory-topic').forEach(el=>el.addEventListener('toggle',()=>{if(!el.open){hideTip();if(lastButton&&el.contains(lastButton))stop();}}));
 const dialog=document.createElement('dialog');dialog.className='u4-projector u6-projector';dialog.setAttribute('aria-labelledby','u6-project-title');
 dialog.innerHTML='<header class="u4-project-toolbar"><span id="u6-project-count"></span><div><button type="button" data-u6-fullscreen>Full screen</button><button type="button" data-u6-close autofocus>Close ×</button></div></header><div class="u4-project-stage"><div class="u4-project-visual"><img alt=""/></div><div class="u4-project-text"><h2 id="u6-project-title"></h2><div class="u4-project-description"></div><p data-u6-status role="status"></p></div></div><nav class="u4-project-nav" aria-label="Projection cards"><button type="button" data-u6-prev>← Previous</button><div class="u6-audio-settings" role="group" aria-label="Projection audio speed"><button type="button" data-u6-speed="0.75" aria-pressed="true">0.75×</button><button type="button" data-u6-speed="1" aria-pressed="false">1×</button><button type="button" data-u6-stop>Stop audio</button></div><button type="button" data-u6-next>Next →</button></nav>';
 document.body.append(dialog);
 let group=[],index=0,opener=null,textOnly=false,ownsFullscreen=false;
 function draw(){
  stop();status();hideTip();const source=group[index];
  dialog.classList.toggle('u6-text-only',textOnly);
  const large=dialog.querySelector('img'),img=source.querySelector('img');
  large.onerror=()=>{if(!textOnly)status('Image could not load. Close and open the picture to retry.');};
  if(!textOnly){large.src=img.src;large.alt=img.alt;}else large.removeAttribute('src');
  dialog.querySelector('h2').textContent=textOnly?source.querySelector('h2').textContent:source.dataset.projectTitle;
  const copy=source.querySelector(textOnly?'.ie2-theory-body':'.u4-card-copy').cloneNode(true);
  copy.querySelectorAll('[id]').forEach(e=>e.removeAttribute('id'));
  copy.querySelectorAll('[aria-describedby]').forEach(e=>e.removeAttribute('aria-describedby'));
  copy.querySelectorAll('.u6-project-section').forEach(e=>e.remove());
  dialog.querySelector('.u4-project-description').replaceChildren(copy);
  dialog.querySelector('#u6-project-count').textContent=textOnly?'Lesson explanation':(index+1)+' / '+group.length;
  dialog.querySelector('[data-u6-prev]').disabled=index===0;dialog.querySelector('[data-u6-next]').disabled=index===group.length-1;
  dialog.querySelector('.u4-project-stage').scrollTop=0;
  document.querySelectorAll('[data-u6-speed]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.u6Speed)===rate)));sync();
 }
 function open(trigger,items,selected,onlyText){opener=trigger;group=items;index=selected;textOnly=onlyText;dialog.showModal();document.documentElement.classList.add('u4-projecting');draw();}
 document.querySelectorAll('.u6-scene .u4-project-open').forEach(button=>button.addEventListener('click',()=>{
  const card=button.closest('.u6-scene'),container=card.parentElement;
  const cards=container.matches('.u6-grid')?[...container.querySelectorAll(':scope > .u6-scene')]:[card];open(button,cards,cards.indexOf(card),false);
 }));
 document.querySelectorAll('.u6-project-section').forEach(button=>button.addEventListener('click',()=>open(button,[button.closest('.ie2-theory-topic')],0,true)));
 dialog.querySelector('[data-u6-close]').addEventListener('click',()=>dialog.close());
 function move(delta){if(index+delta>=0&&index+delta<group.length){index+=delta;draw();}}
 dialog.querySelector('[data-u6-prev]').addEventListener('click',()=>move(-1));dialog.querySelector('[data-u6-next]').addEventListener('click',()=>move(1));
 dialog.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();move(e.key==='ArrowRight'?1:-1);}});
 dialog.addEventListener('close',()=>{stop();hideTip();document.documentElement.classList.remove('u4-projecting');if(ownsFullscreen&&document.fullscreenElement)document.exitFullscreen().catch(()=>{});ownsFullscreen=false;opener?.focus({preventScroll:true});});
 const full=dialog.querySelector('[data-u6-fullscreen]');full.hidden=!dialog.requestFullscreen;
 full.addEventListener('click',async()=>{try{if(document.fullscreenElement===dialog){await document.exitFullscreen();ownsFullscreen=false;}else{await dialog.requestFullscreen();ownsFullscreen=true;}}catch{status('Full screen is unavailable here. The enlarged view is still available.');}});
 document.addEventListener('fullscreenchange',()=>{full.textContent=document.fullscreenElement===dialog?'Exit full screen':'Full screen';});
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
 window.addEventListener('pagehide',()=>{stop();hideTip();});
})();
