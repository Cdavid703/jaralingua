
/* Full-viewport classroom projection. Keep the full sprite cell and original audio source. */
(() => {
  'use strict';
  const groups=[
    [...document.querySelectorAll('#movies-and-genres .u4-genre-grid > .u4-card')],
    [...document.querySelectorAll('#film-elements .u4-vocab-grid > .u4-card')],
    [...document.querySelectorAll('#music-videos .u4-vocab-grid > .u4-card, #music-videos .u4-media-grid > .u4-card')]
  ];
  if(!groups.some(group=>group.length))return;
  const dialog=document.createElement('dialog');
  dialog.className='u4-projector';dialog.setAttribute('aria-labelledby','u4-projection-title');
  dialog.innerHTML='<div class="u4-project-toolbar"><span id="u4-projection-count"></span><div><button type="button" class="u4-project-fullscreen">Full screen</button><button type="button" class="u4-project-close" autofocus>Close ×</button></div></div><div class="u4-project-stage"><div class="u4-project-visual"></div><div class="u4-project-text"><h2 id="u4-projection-title"></h2><div class="u4-project-description"></div><p class="u4-project-status" role="status"></p></div></div><nav class="u4-project-nav" aria-label="Projection cards"><button type="button" class="u4-project-prev">← Previous</button><span>Use ← / → to change cards · Esc to close</span><button type="button" class="u4-project-next">Next →</button></nav>';
  document.body.append(dialog);
  const visual=dialog.querySelector('.u4-project-visual'), title=dialog.querySelector('h2'), description=dialog.querySelector('.u4-project-description');
  const status=dialog.querySelector('.u4-project-status');
  let group=[],index=0,opener=null,activeAudio=null,renderVersion=0,ownsFullscreen=false;
  const pause=()=>document.querySelectorAll('.u4-audio audio').forEach(audio=>audio.pause());
  function draw() {
    const version=++renderVersion;pause();activeAudio=null;status.textContent='';
    const card=group[index],crop=card.querySelector('.u4-crop'),img=crop.querySelector('img');
    const heading=card.querySelector('h3').cloneNode(true);
    heading.querySelectorAll('.u4-listen-mark,.u4-audio-status,audio').forEach(el=>el.remove());
    const name=heading.textContent.trim();
    title.replaceChildren();description.replaceChildren();visual.replaceChildren();
    const audio=card.querySelector('audio');
    if(audio){
      activeAudio=audio;
      const listen=document.createElement('button');listen.type='button';listen.className='u4-project-listen';
      listen.append(document.createTextNode(name+' '));
      const mark=document.createElement('span');mark.textContent='◖))';mark.setAttribute('aria-hidden','true');listen.append(mark);
      listen.setAttribute('aria-label','Listen at 0.75 speed: '+name);listen.setAttribute('aria-pressed','false');
      listen.addEventListener('click',async()=>{
        if(!audio.paused){audio.pause();return;}
        pause();audio.currentTime=0;audio.playbackRate=.75;
        try{await audio.play();}catch(error){if(error.name!=='AbortError')status.textContent='Audio could not play. Tap the word again.';}
      });
      title.append(listen);
    }else title.textContent=name;
    card.querySelectorAll('p').forEach(p=>{
      if(p.closest('.u4-audio,.u4-support'))return;
      const copy=p.cloneNode(true);copy.removeAttribute('id');description.append(copy);
    });
    dialog.querySelector('#u4-projection-count').textContent=(index+1)+' / '+group.length+' · '+card.closest('.ie2-theory-topic').querySelector('.ie2-topic-summary strong').textContent;
    dialog.querySelector('.u4-project-prev').disabled=index===0;
    dialog.querySelector('.u4-project-next').disabled=index===group.length-1;
    const buildImage=()=>{
      if(version!==renderVersion||!dialog.open)return;
      const cols=Number(crop.style.getPropertyValue('--cols')),rows=Number(crop.style.getPropertyValue('--rows'));
      const col=Number(crop.style.getPropertyValue('--col')),row=Number(crop.style.getPropertyValue('--row'));
      const w=img.naturalWidth/cols,h=img.naturalHeight/rows;
      if(!w||!h){status.textContent='Image could not load. Close and open this card to retry.';return;}
      const ns='http://www.w3.org/2000/svg';
      const svg=document.createElementNS(ns,'svg');
      svg.setAttribute('viewBox',[col*w,row*h,w,h].join(' '));
      svg.setAttribute('preserveAspectRatio','xMidYMid meet');svg.setAttribute('role','img');svg.setAttribute('aria-label',img.alt);
      const picture=document.createElementNS(ns,'image');picture.setAttribute('href',img.src);picture.setAttribute('width',img.naturalWidth);picture.setAttribute('height',img.naturalHeight);
      const defs=document.createElementNS(ns,'defs'),clip=document.createElementNS(ns,'clipPath'),rect=document.createElementNS(ns,'rect');
      clip.id='u4-project-cell-clip';rect.setAttribute('x',col*w);rect.setAttribute('y',row*h);rect.setAttribute('width',w);rect.setAttribute('height',h);
      clip.append(rect);defs.append(clip);picture.setAttribute('clip-path','url(#u4-project-cell-clip)');
      svg.append(defs,picture);visual.replaceChildren(svg);
    };
    img.loading='eager';
    if(img.complete&&img.naturalWidth)buildImage();else img.decode().then(buildImage).catch(()=>{if(version===renderVersion)status.textContent='Image could not load. Close and open this card to retry.';});
  }
  function open(cards,i,trigger){
    group=cards;index=i;opener=trigger;
    dialog.showModal();document.documentElement.classList.add('u4-projecting');draw();
  }
  groups.forEach(cards=>cards.forEach((card,i)=>{
    const crop=card.querySelector('.u4-crop');
    const button=document.createElement('button');button.type='button';button.className='u4-project-open';
    button.setAttribute('aria-label','Project card: '+card.querySelector('h3').textContent.replace('◖))','').trim());button.setAttribute('aria-haspopup','dialog');
    crop.before(button);button.append(crop);
    const mark=document.createElement('span');mark.className='u4-project-hint';mark.textContent='Enlarge ↗';button.append(mark);
    button.addEventListener('click',()=>open(cards,i,button));
    card.addEventListener('click',event=>{
      if(event.target.closest('button,a,audio,input,summary,details'))return;
      open(cards,i,button);
    });
    card.classList.add('u4-projectable');
  }));
  function move(delta){
    const next=index+delta;if(next<0||next>=group.length)return;
    index=next;draw();
  }
  dialog.querySelector('.u4-project-prev').addEventListener('click',()=>move(-1));
  dialog.querySelector('.u4-project-next').addEventListener('click',()=>move(1));
  dialog.querySelector('.u4-project-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('keydown',event=>{
    if(event.key==='ArrowRight'){event.preventDefault();move(1);}
    if(event.key==='ArrowLeft'){event.preventDefault();move(-1);}
  });
  dialog.addEventListener('close',()=>{
    ++renderVersion;pause();activeAudio=null;
    document.documentElement.classList.remove('u4-projecting');
    if(ownsFullscreen&&document.fullscreenElement)document.exitFullscreen().catch(()=>{});
    ownsFullscreen=false;
    opener?.focus();
  });
  const full=dialog.querySelector('.u4-project-fullscreen');
  full.hidden=!document.fullscreenEnabled;
  full.addEventListener('click',async()=>{
    try{if(document.fullscreenElement){await document.exitFullscreen();ownsFullscreen=false;}else {await document.documentElement.requestFullscreen();ownsFullscreen=true;}}
    catch{status.textContent='Projection already fills the page. Browser full screen is unavailable.';}
  });
  document.addEventListener('fullscreenchange',()=>{full.textContent=document.fullscreenElement?'Exit full screen':'Full screen';});
  ['play','pause','ended'].forEach(event=>document.addEventListener(event,e=>{
    if(e.target!==activeAudio)return;
    dialog.querySelector('.u4-project-listen')?.setAttribute('aria-pressed',String(!activeAudio.paused&&!activeAudio.ended));
  },true));
})();
