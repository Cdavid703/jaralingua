(() => {
  'use strict';
  const $ = id => document.getElementById('ot-' + id);
  const content = window.Basic2OralTravelContent;
  const node = (tag, text, cls) => { const el = document.createElement(tag); if (text !== undefined) el.textContent = text; if (cls) el.className = cls; return el; };
  let clip = null, projection = null;
  const imagePath = id => '/assets/img/english-basic-2/destination-detectives/' + id + '.webp';
  const audioPath = name => '/ingles/basico-2/audio/final-oral-travel/' + name + '.mp3';
  function stopAudio() { clip?.pause(); clip = null; $('model-audio').pause(); }
  async function playAudio(name) {
    stopAudio();
    clip = new Audio(audioPath(name));
    clip.playbackRate = Number($('pronunciation-speed').value);
    const active = clip;
    try { await active.play(); $('audio-status').textContent = ''; }
    catch { $('audio-status').textContent = 'Audio could not play. Check your connection and tap Listen again.'; }
  }
  function projectDestination(id) {
    const dest = content.destinations.find(d => d[0] === id);
    if (!dest) return;
    projection = [{src:imagePath(id), label:dest[1]}];
    $('project-title').textContent = dest[1];
    $('project-image').src = projection[0].src;
    $('project-image').alt = 'Illustrated travel scene: ' + dest[1];
    $('page-count').textContent = '1 / 1';
    $('prev').disabled = $('next').disabled = true;
    $('project-status').textContent = 'An illustrated destination to support your oral conversation.';
    $('projector').showModal();
  }
  for (const [role,text] of content.dialogue) {
    const turn = node('article',undefined,'ot-turn'); turn.dataset.role = role;
    turn.append(node('strong',role === 'assistant' ? 'Travel assistant' : 'Tourist'),node('p',text));
    $('dialogue').append(turn);
  }
  for (const [id,text,hint] of content.phrases) {
    const card = node('article'), listen = node('button','▶ Listen'); listen.type = 'button';
    listen.dataset.audio = 'phrase-' + id;
    listen.addEventListener('click',() => playAudio('phrase-' + id));
    card.append(node('strong',text),node('p',hint),listen); $('phrases').append(card);
  }
  for (const [id,name,ideas] of content.destinations) {
    const card = node('article'), view = node('button',undefined,'ot-destination'), img = node('img');
    view.type = 'button'; view.dataset.destination = id; view.setAttribute('aria-label','Explore '+name);
    img.src = imagePath(id); img.alt = 'Illustrated destination: '+name; img.width=1536; img.height=1024; img.loading='lazy';
    view.append(img,node('span',name),node('small',ideas)); view.addEventListener('click',()=>projectDestination(id));
    const listen = node('button','▶ Say the name','ot-secondary'); listen.type='button'; listen.dataset.audio='destination-'+id;
    listen.addEventListener('click',()=>playAudio('destination-'+id));
    card.append(view,listen); $('destinations').append(card);
  }
  $('stop-audio').addEventListener('click',stopAudio);
  $('example-speed').addEventListener('change',()=>{$('model-audio').playbackRate=Number($('example-speed').value);});
  $('model-audio').addEventListener('play',()=>{clip?.pause();clip=null;});
  $('model-audio').addEventListener('error',()=>{$('audio-status').textContent='The model audio could not load. Check your connection and reload.';});
  $('pronunciation-speed').addEventListener('change',()=>{if(clip)clip.playbackRate=Number($('pronunciation-speed').value);});
  $('project-close').addEventListener('click',()=>{$('projector').close();});
  $('projector').addEventListener('close',()=>{if(document.fullscreenElement=== $('projector'))document.exitFullscreen().catch(()=>{});$('project-image').removeAttribute('src');projection=null;});
  $('fullscreen').addEventListener('click',async()=>{
    try { if(document.fullscreenElement)await document.exitFullscreen();else if($('projector').requestFullscreen)await $('projector').requestFullscreen();else $('project-status').textContent='Full screen is unavailable here. The large presentation view is ready.'; }
    catch { $('project-status').textContent='Full screen is unavailable here. Use the large presentation view.'; }
  });
  window.Basic2OralTravelTeaching = {imagePath,playAudio,stopAudio,projectDestination};
  $('login').addEventListener('click',()=>window.JaraLinguaAuth?.openPanel?.());
  const syncLogin=()=>{$('login').parentElement.hidden=Boolean(document.querySelector('.jaralingua-auth-nav .auth-trigger'));};
  new MutationObserver(syncLogin).observe(document.querySelector('.navbar'),{childList:true,subtree:true});
  syncLogin();
})();
