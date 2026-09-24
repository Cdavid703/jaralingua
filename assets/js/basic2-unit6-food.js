(() => {
  'use strict';
  const lesson = window.Basic2FoodLesson;
  if (!lesson) return;
  const root = document.querySelector('[data-food-topics]');
  if (root) root.innerHTML = lesson.sections.map((s,i)=>`<details class="food-topic" id="${s.id}"><summary><span class="food-number">${String(i+1).padStart(2,'0')}</span><span>${s.title}</span></summary><div class="food-topic-body"><p class="food-goal"><strong>What we will learn:</strong> ${s.goal}</p>${s.body}</div></details>`).join('');
  const library = document.querySelector('[data-food-library]');
  if (library) library.innerHTML = lesson.controls()+lesson.expressionsHTML;
  let rate = 1, activeButton = null, playRequest = 0;
  const player = new Audio();
  player.preload = 'none';
  const status = message => document.querySelectorAll('[data-food-status]').forEach(el=>el.textContent=message);
  function stop() { playRequest++; player.pause(); if(activeButton) activeButton.classList.remove('is-playing'); activeButton=null; }
  player.addEventListener('ended',()=>{ if(activeButton) activeButton.classList.remove('is-playing'); status('Finished. Tap any word or sentence to listen again.'); });
  player.addEventListener('error',()=>{ if(activeButton) activeButton.classList.remove('is-playing'); status('This audio could not load. Check your connection and tap it again.'); });
  document.addEventListener('click',async event=>{
    const button = event.target.closest('button');
    if (!button) return;
    if (button.hasAttribute('data-food-speed')) {
      rate=Number(button.dataset.foodSpeed); player.playbackRate=rate;
      document.querySelectorAll('[data-food-speed]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.foodSpeed)===rate)));
      status(`Speed: ${rate}×.`);
    }
    if (button.hasAttribute('data-food-stop')) {stop();status('Audio stopped.');}
    if (button.dataset.foodAudio) {
      stop(); const request=playRequest; activeButton=button; button.classList.add('is-playing');
      player.src=button.dataset.foodAudio; player.playbackRate=rate;
      status(`Playing: ${button.textContent.replace('♪','').trim()} (${rate}×).`);
      try {await player.play();} catch(error) {if(request===playRequest){button.classList.remove('is-playing');status('Tap the word again to play. If it still does not play, check your connection.');}}
    }
    if(button.dataset.foodZoom) {
      let dialog=document.getElementById('food-image-dialog');
      if(!dialog){dialog=document.createElement('dialog');dialog.id='food-image-dialog';dialog.className='food-image-dialog';dialog.setAttribute('aria-label','Enlarged lesson image');dialog.innerHTML='<button type="button">Close image</button><img alt="">';document.body.append(dialog);dialog.querySelector('button').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});}
      const picture=dialog.querySelector('img');picture.src=button.dataset.foodZoom;picture.alt=button.querySelector('img').alt;dialog.showModal();
    }
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
  window.addEventListener('pagehide',stop);
  function revealHash(){const id=location.hash.slice(1);const el=id && document.getElementById(id);if(el && el.classList.contains('food-topic')){el.open=true;el.scrollIntoView({block:'start'});}}
  window.addEventListener('hashchange',revealHash);
  if(location.hash)revealHash();
})();
