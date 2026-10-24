(() => {
  'use strict';
  const models = window.Preintermediate1Audio || {};
  const audio = new Audio();
  audio.preload = 'none';
  let speed = 1, queue = [], active = null, owner = null, requestId = 0;
  function status(message) {
    const target = owner?.closest('.pi-topic-body, .pi-shell')?.querySelector('[data-audio-status]');
    if (target) target.textContent = message;
  }
  function stop() {
    requestId++;
    queue = [];
    audio.pause();
    if (active) { active.classList.remove('is-playing'); active.removeAttribute('aria-busy'); }
    active = null;
  }
  async function play(key, button) {
    if (!models[key]) {status('This model is unavailable. Please choose another phrase.');return;}
    if (active) {active.classList.remove('is-playing');active.removeAttribute('aria-busy');}
    active = button;
    active?.classList.add('is-playing');
    active?.setAttribute('aria-busy','true');
    const request = ++requestId;
    audio.src = models[key].path;
    audio.playbackRate = speed;
    status(`Playing at ${speed.toFixed(2).replace(/0$/,'')}×: ${models[key].text}`);
    try { await audio.play(); }
    catch (_) { if (request === requestId) {stop();status('Audio could not play. Check your connection and tap the phrase to try again.');} }
  }
  audio.addEventListener('ended', () => {
    if (queue.length) { const key=queue.shift();play(key,owner); }
    else {stop();status('Finished. Tap any phrase to listen again.');}
  });
  audio.addEventListener('error', () => {stop();status('This audio could not load. Check your connection and tap the phrase to try again.');});
  document.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.hasAttribute('data-speed')) {
      speed=Number(button.dataset.speed);audio.playbackRate=speed;owner=button;
      document.querySelectorAll('[data-speed]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.speed)===speed)));
      status(`Model speed: ${speed.toFixed(2).replace(/0$/,'')}×.`);
    }
    if (button.hasAttribute('data-stop')) {stop();owner=button;status('Audio stopped.');}
    if (button.dataset.audio) {stop();owner=button;play(button.dataset.audio,button);}
    if (button.dataset.playlist) {
      stop();owner=button;queue=button.dataset.playlist.split(',');play(queue.shift(),button);
    }
  });
  function revealHash() {
    let id;try{id=decodeURIComponent(location.hash.slice(1));}catch(_){return;}
    const el=id && document.getElementById(id);
    if (el?.matches('details.pi-topic')) {
      let folder = el;
      while (folder) {folder.open=true;folder=folder.parentElement?.closest('details.pi-topic');}
      el.scrollIntoView({block:'start'});
    }
  }
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
  window.addEventListener('pagehide',stop);
  window.addEventListener('hashchange',revealHash);
  if(location.hash)revealHash();
})();
