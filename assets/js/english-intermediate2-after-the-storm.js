/* After the Storm: session-only practice, with independent first-attempt and review records. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const reader = $('stReader'), projector = $('stProjector'), copy = $('stCopy'), audio = $('stAudio');
  const base = '/ingles/intermediate-2/audio/unit-6-after-the-storm/';
  let book, glossary, page = 0, stage = 0, scene = 0, scale = 1, sound = true, generation = 0;
  let projection = null, results = false, reviewing = false, reviewIds = [], reviewPages = [];
  const initial = new Map(), review = new Map(), choices = new Map();
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const record = id => {
    const map = reviewing ? review : initial;
    if (!map.has(id)) map.set(id, {selection:'', attempts:0, solved:false, firstCorrect:false, lastChecked:'', hint:false, feedback:''});
    return map.get(id);
  };
  const challenge = id => book.pages.flatMap(p => p.challenges).find(c => c.id === id);
  const status = text => ['stAudioStatus','stProjectAudioStatus','stLandingAudioStatus'].forEach(id => $(id).textContent = text);
  function stop() {
    generation++; audio.pause(); audio.removeAttribute('src'); audio.load(); glossary?.setPlaying(null); status('');
  }
  async function play(src, button) {
    stop(); const token = generation; audio.src = src; audio.playbackRate = Number($('stSpeed').value);
    status('Loading audio…'); glossary?.setPlaying(button || null);
    try { await audio.play(); if (token === generation) status('Playing'); }
    catch (e) { if (token === generation) { status('Audio unavailable. Press Listen or the word to try again.'); glossary?.setPlaying(null); } }
  }
  audio.addEventListener('ended', () => { glossary?.setPlaying(null); status(''); });
  audio.addEventListener('error', () => { if (audio.getAttribute('src')) { status('Audio unavailable. Press Listen or the word to try again.'); glossary?.setPlaying(null); } });
  $('stSpeed').addEventListener('change', () => audio.playbackRate = Number($('stSpeed').value));
  function marked(host) { host.querySelectorAll('[data-glossary]').forEach(el => glossary.render(el, el.textContent)); }
  function words(p) { return '<p class="fv-muted">Hover for Spanish · Click to listen · Tap on mobile</p><div class="st-words">' + p.vocabulary.map(v => '<span data-glossary>'+esc(v.term)+'</span>').join('') + '</div>'; }
  function card(c) {
    const r = record(c.id);
    return `<article class="st-card ${r.solved?'is-solved':''}" data-card="${c.id}"><p class="fv-eyebrow">Scene ${book.pages[page].challenges.indexOf(c)===0?'A':'B'} · Choose the past-tense verb</p><p class="st-sentence">${esc(c.before)} <span class="st-gap" data-drop="${c.id}" aria-label="Selected verb">${esc(r.selection || '_____')}</span> ${esc(c.after)}</p><div class="st-options" role="group" aria-label="Verb choices">${choices.get(c.id).map(v => `<button type="button" draggable="${!r.solved}" data-action="select" data-id="${c.id}" data-option="${v}" aria-pressed="${v===r.selection}" ${r.solved?'disabled':''}>${v}</button>`).join('')}</div><div class="st-actions"><button type="button" data-action="check" data-id="${c.id}" ${r.solved || !r.selection || r.lastChecked===r.selection?'disabled':''}>Check</button><button type="button" data-action="hint" data-id="${c.id}" aria-expanded="${r.hint}">Hint</button><button type="button" data-action="challenge-project" data-id="${c.id}">Project challenge ↗</button>${r.solved?`<button type="button" data-action="answer-audio" data-id="${c.id}">▶ Listen to the sentence</button>`:''}</div>${r.hint?'<p class="st-hint">'+esc(c.hint)+'</p>':''}<div class="st-feedback ${r.feedback?(r.solved?'correct':'wrong'):''}" role="status" ${r.feedback?'':'hidden'} lang="es">${esc(r.feedback)}</div></article>`;
  }
  function reviewBanner() { return reviewing?'<p class="st-review-banner">Review practice · Your original first-attempt score stays unchanged.</p>':''; }
  function content() {
    const p = book.pages[page];
    let html = reviewBanner()+`<p class="fv-eyebrow">Page ${page+1} of 10</p><h3>${esc(p.title)}</h3>`;
    if (stage===0) html += `<p class="st-story" data-glossary>${esc(p.observe)}</p><p>Start with: <b>“I can see…”</b><br><b>“It looks like… because…”</b><br><b>“They seem… because…”</b></p><button type="button" data-action="text-project">Project instructions ↗</button>`+words(p);
    if (stage===1) html += `<div class="fv-actions"><button type="button" data-action="story-audio">▶ Listen to the story</button><button type="button" data-action="text-project">Project story ↗</button></div><p class="st-story" data-glossary>${esc(p.text)}</p>`+words(p);
    if (stage===2) html += '<p>Keep the preposition. Choose or drag the verb that fits the meaning.</p>'+p.challenges.filter(c => !reviewing || reviewIds.includes(c.id)).map(card).join('');
    if (stage===3) html += `<p class="st-story" data-glossary>${esc(p.predict)}</p><p>“I think… might… because…”</p><div class="fv-actions"><button type="button" data-action="prediction-audio">▶ Listen to the question</button><button type="button" data-action="text-project">Project question ↗</button></div>`;
    return html;
  }
  function render() {
    glossary.hide(); results = false;
    $('stStage').classList.remove('st-results-mode');
    $('stStage').querySelector('.fv-spread').hidden = false;
    $('stTitle').textContent = `After the Storm · ${page+1}/10`;
    $('stImage').src = book.pages[page].scenes[scene].image; $('stImage').alt = book.pages[page].scenes[scene].alt;
    document.querySelectorAll('[data-stage]').forEach(b => b.setAttribute('aria-pressed', Number(b.dataset.stage)===stage));
    document.querySelectorAll('[data-scene]').forEach(b => b.setAttribute('aria-pressed', Number(b.dataset.scene)===scene));
    copy.innerHTML = content(); marked(copy); copy.scrollTop = 0;
    $('stPage').value = String(page);
    const sequence = reviewing ? reviewPages : book.pages.map((_,i) => i), position = sequence.indexOf(page);
    $('stPrev').disabled = position<=0;
    $('stNext').textContent = position===sequence.length-1?'See results →':'Next page →';
    document.querySelector('.st-visual').hidden = false;
    if (projection?.type==='challenge') renderProjection();
  }
  function refreshCards() {
    const active = document.activeElement;
    const anchor = active?.dataset.action, id = active?.dataset.id, option = active?.dataset.option;
    [copy, $('stProjectionBody')].forEach(host => host.querySelectorAll('[data-card]').forEach(el => { const c = challenge(el.dataset.card); el.outerHTML = card(c); }));
    // Preserve keyboard focus when a card is re-rendered after a choice or retry.
    const host = projector.open ? $('stProjectionBody') : copy;
    if (anchor && id) {
      const replacement = [...host.querySelectorAll('[data-action]')].find(b => b.dataset.action===anchor && b.dataset.id===id && (!option || b.dataset.option===option) && !b.disabled);
      (replacement || host.querySelector(`[data-action="answer-audio"][data-id="${id}"]`) || host.querySelector(`[data-action="select"][data-id="${id}"][aria-pressed="true"]`))?.focus({preventScroll:true});
    }
  }
  function turn(next) {
    stop(); glossary.hide();
    if (next===page) return;
    const oldImage = $('stImage').cloneNode(); oldImage.removeAttribute('id');
    const leaf = $('stLeaf'); leaf.replaceChildren(oldImage); leaf.className = 'fv-leaf';
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) { void leaf.offsetWidth; leaf.classList.add(next>page?'forward':'backward'); }
    if (sound) { $('stPaper').currentTime=0; $('stPaper').play().catch(()=>{}); }
    page = next; stage = reviewing?2:0; scene = 0; render();
    reader.scrollTop = 0;
  }
  function showResults() {
    stop(); glossary.hide(); results = true; projection = null;
    $('stStage').classList.add('st-results-mode');
    const all = book.pages.flatMap(p=>p.challenges), first = all.filter(c=>initial.get(c.id)?.firstCorrect).length;
    const solved = all.filter(c=>initial.get(c.id)?.solved || review.get(c.id)?.solved).length;
    const unfinished = all.filter(c=>!initial.get(c.id)?.solved && !review.get(c.id)?.solved);
    const revisit = all.filter(c=>!initial.get(c.id)?.firstCorrect);
    $('stTitle').textContent = 'After the Storm · Your practice';
    document.querySelector('.st-visual').hidden = true;
    copy.innerHTML = `<div class="st-results"><h3>You reached the end!</h3><p class="st-summary">${first}/20 correct on the first attempt</p><p>${solved}/20 challenges completed correctly.</p><p>These are practice results, not an academic grade.</p>${revisit.length?`<h4>Review ${revisit.length} challenges</h4><p>Incorrect first attempts and questions you have not tried:</p><ul>${book.pages.flatMap((p,i)=>p.challenges.filter(c=>!initial.get(c.id)?.firstCorrect).map(c=>`<li>Page ${i+1} · Scene ${p.challenges.indexOf(c)===0?'A':'B'} — ${esc(p.title)}${(initial.get(c.id)?.solved || review.get(c.id)?.solved)?' · corrected':''}</li>`)).join('')}</ul><button type="button" data-action="review">Review my mistakes</button>`:'<p>Every first attempt was correct. Well done!</p>'}${unfinished.length?'<p>'+unfinished.length+' challenges still need a correct answer.</p>':''}<button type="button" data-action="return">Return to the story</button></div>`;
    $('stPrev').disabled=false; $('stNext').textContent='Return to story';
  }
  function renderProjection() {
    const host = $('stProjectionBody'), p=book?.pages[page]; glossary?.hide();
    projector.classList.toggle('picture-mode',projection.type==='image');
    if (projection.type==='image') { $('stProjectTitle').textContent=`Page ${page+1} · Scene ${scene?'B':'A'}`; host.innerHTML=`<img src="${p.scenes[scene].image}" alt="${esc(p.scenes[scene].alt)}">`; }
    else if (projection.type==='challenge') { $('stProjectTitle').textContent='Complete the sentence'; host.innerHTML=card(challenge(projection.id)); }
    else if (projection.type==='example') { $('stProjectTitle').textContent='One verb · Two meanings'; host.innerHTML=document.querySelector('.st-example').innerHTML; host.querySelector('[data-action=example-project]')?.remove(); }
    else { $('stProjectTitle').textContent=p.title; host.innerHTML=content(); marked(host); }
    host.scrollTop=0;
  }
  function project(type,id) { stop(); projection={type,id}; renderProjection(); if (!projector.open) projector.showModal(); }
  async function fullscreen() {
    const target = projector.open?projector:reader;
    try { if (document.fullscreenElement) await document.exitFullscreen(); else if (target.requestFullscreen) await target.requestFullscreen(); }
    catch { status('Full screen is unavailable in this browser. The expanded view is ready.'); }
  }
  document.addEventListener('click', e => {
    const b=e.target.closest('button'); if (!b || b.disabled) return;
    if (b.dataset.stage!==undefined) { stop(); stage=Number(b.dataset.stage); render(); return; }
    if (b.dataset.scene!==undefined) { scene=Number(b.dataset.scene); $('stImage').src=book.pages[page].scenes[scene].image; $('stImage').alt=book.pages[page].scenes[scene].alt; document.querySelectorAll('[data-scene]').forEach(x=>x.setAttribute('aria-pressed',x===b)); return; }
    const id=b.dataset.id, c=id?challenge(id):null, r=id?record(id):null;
    switch(b.dataset.action) {
      case 'select': if(!r.solved) {stop();r.selection=b.dataset.option;r.feedback='';refreshCards();} break;
      case 'check':
        if(r.solved || !r.selection || r.lastChecked===r.selection) break;
        stop(); r.attempts++; r.lastChecked=r.selection; r.solved=r.selection===c.answer;
        if(r.attempts===1) r.firstCorrect=r.solved;
        r.feedback=r.solved?'¡Correcto! '+c.success:'Aún no. '+c.feedback[r.selection]+' Elige otro verbo y vuelve a intentarlo.';
        refreshCards(); if(r.solved) play(c.audio); break;
      case 'hint': r.hint=!r.hint; refreshCards(); break;
      case 'answer-audio': if(r.solved) play(c.audio); break;
      case 'story-audio': play(book.pages[page].audio); break;
      case 'prediction-audio': play(book.pages[page].predictionAudio); break;
      case 'guide-audio': play(base+'guide.mp3'); break;
      case 'example-audio': play(base+'example.mp3'); break;
      case 'example-project': project('example'); break;
      case 'image': project('image'); break;
      case 'text-project': project('text'); break;
      case 'challenge-project': project('challenge',id); break;
      case 'project-close': stop(); projector.close(); break;
      case 'close': stop(); reader.close(); break;
      case 'stop': stop(); break;
      case 'fullscreen': fullscreen(); break;
      case 'font-up': case 'font-down': scale=Math.max(.9,Math.min(1.5,scale+(b.dataset.action==='font-up'?.1:-.1)));reader.style.setProperty('--st-scale',scale);break;
      case 'review':
        reviewIds=book.pages.flatMap(p=>p.challenges).filter(x=>!initial.get(x.id)?.firstCorrect).map(x=>x.id);
        reviewPages=book.pages.map((p,i)=>p.challenges.some(x=>reviewIds.includes(x.id))?i:-1).filter(i=>i>=0);
        review.clear();reviewing=true;page=reviewPages[0];stage=2;scene=0;render();break;
      case 'return': reviewing=false;stage=0;render();break;
    }
  });
  document.addEventListener('dragstart', e => { const b=e.target.closest('[data-action=select]');if(b && !b.disabled){e.dataTransfer.setData('text/plain',JSON.stringify({id:b.dataset.id,option:b.dataset.option}));e.dataTransfer.effectAllowed='copy';} });
  document.addEventListener('dragover', e => {if(e.target.closest('[data-drop]'))e.preventDefault();});
  document.addEventListener('drop', e => { const gap=e.target.closest('[data-drop]');if(!gap)return;e.preventDefault();try { const item=JSON.parse(e.dataTransfer.getData('text/plain'));const c=challenge(gap.dataset.drop),r=record(c.id);if(item.id===c.id && c.options.includes(item.option) && !r.solved){stop();r.selection=item.option;r.feedback='';refreshCards();} } catch { /* Ignore unrelated dragged content. */ } });
  $('stOpen').addEventListener('click',()=>{stop();render();reader.showModal();});
  $('stPrev').addEventListener('click',()=>{if(results){render();return;}const seq=reviewing?reviewPages:book.pages.map((_,i)=>i);turn(seq[Math.max(0,seq.indexOf(page)-1)]);});
  $('stNext').addEventListener('click',()=>{if(results){reviewing=false;render();return;}const seq=reviewing?reviewPages:book.pages.map((_,i)=>i),i=seq.indexOf(page);if(i===seq.length-1)showResults();else turn(seq[i+1]);});
  $('stPage').addEventListener('change',()=>{reviewing=false;const next=Number($('stPage').value);if(results || next===page){page=next;stage=0;render();}else turn(next);});
  $('stSound').addEventListener('click',()=>{sound=!sound;$('stSound').setAttribute('aria-pressed',sound);$('stSound').textContent='Page sound: '+(sound?'on':'off');if(!sound)$('stPaper').pause();});
  $('stLeaf').addEventListener('animationend',()=>{$('stLeaf').className='fv-leaf';});
  [reader,projector].forEach(dialog=>dialog.addEventListener('close',()=>{stop();glossary?.hide();if(document.fullscreenElement===dialog)document.exitFullscreen().catch(()=>{});if(dialog===projector)projection=null;}));
  document.addEventListener('visibilitychange',()=>{if(document.hidden){stop();$('stPaper').pause();}});
  async function load() {
    $('stRetry').hidden=true;$('stLoadStatus').textContent='Loading the story…';
    try {
      const response=await fetch('/assets/data/english-intermediate2-after-the-storm.json?v=20261016-1',{cache:'no-cache'});if(!response.ok)throw Error(response.status);
      book=await response.json();if(book.pages.length!==10)throw Error('Invalid story');
      glossary=window.FirstVisitVocabulary(book.pages.flatMap(p=>p.vocabulary),(entry,button)=>play(entry.audio,button));
      book.pages.flatMap(p=>p.challenges).forEach(c=>{const list=[...c.options];for(let i=list.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[list[i],list[j]]=[list[j],list[i]];}choices.set(c.id,list);});
      $('stPage').innerHTML=book.pages.map((p,i)=>`<option value="${i}">${i+1} · ${esc(p.title)}</option>`).join('');
      $('stOpen').disabled=false;$('stLoadStatus').textContent='Your 10-page book is ready.';
    }catch { $('stLoadStatus').textContent='The book could not load. Check your connection and try again.';$('stRetry').hidden=false; }
  }
  $('stRetry').addEventListener('click',load);load();
})();
