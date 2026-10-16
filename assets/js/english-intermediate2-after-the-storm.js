/* Story choices live inside the book. No separate exercise stage or premature narration. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const reader=$('stReader'), projector=$('stProjector'), copy=$('stCopy'), audio=$('stAudio'), paper=$('stPaper');
  let book, glossary, page=0, scene=0, activeGap=null, projection=null, scale=1, sound=true, generation=0, results=false, reviewing=false, reviewIds=[], reviewPages=[];
  const initial=new Map(), review=new Map(), choices=new Map();
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const record=id=>{const map=reviewing && reviewIds.includes(id)?review:initial;if(!map.has(id))map.set(id,{attempts:0,solved:false,firstCorrect:false,last:'',feedback:''});return map.get(id);};
  const challenge=id=>book.pages.flatMap(p=>p.challenges).find(c=>c.id===id);
  const ready=()=>book.pages[page].challenges.every(c=>record(c.id).solved);
  const status=text=>['stAudioStatus','stProjectAudioStatus','stLandingAudioStatus'].forEach(id=>$(id).textContent=text);
  function stop(){generation++;audio.pause();audio.removeAttribute('src');audio.load();glossary?.setPlaying(null);status('');}
  async function play(src,button){stop();const token=generation;audio.src=src;audio.playbackRate=Number($('stSpeed').value);status('Loading audio…');glossary?.setPlaying(button||null);try{await audio.play();if(token===generation)status('Playing');}catch{if(token===generation){status('Audio unavailable. Press Listen or the word to try again.');glossary?.setPlaying(null);}}}
  audio.addEventListener('ended',()=>{glossary?.setPlaying(null);status('');});
  audio.addEventListener('error',()=>{if(audio.getAttribute('src')){status('Audio unavailable. Press Listen or the word to try again.');glossary?.setPlaying(null);}});
  $('stSpeed').addEventListener('change',()=>audio.playbackRate=Number($('stSpeed').value));
  function marked(host){host.querySelectorAll('[data-glossary]').forEach(el=>glossary.render(el,el.textContent));}
  function words(p){return '<details class="st-vocabulary"><summary>Words to help you</summary><p class="fv-muted">Hover for Spanish · Click to listen · Tap on mobile</p><div class="st-words">'+p.vocabulary.map(v=>'<span data-glossary>'+esc(v.term)+'</span>').join('')+'</div></details>';}
  function chooser(c,index){const r=record(c.id);return `<div class="st-choice-box" data-choices="${c.id}" ${activeGap===c.id?'':'hidden'}><span class="fv-eyebrow">Blank ${index+1} · Choose the expression</span>${!r.solved?`<div class="st-options" role="group" aria-label="Expressions for blank ${index+1}">${choices.get(c.id).map(option=>`<button type="button" data-action="choose" data-id="${c.id}" data-option="${esc(option)}" ${r.last===option?'disabled':''}>${esc(option)}</button>`).join('')}</div>`:''}<p class="st-feedback ${r.solved?'correct':'wrong'}" role="status" lang="en" ${r.feedback?'':'hidden'}>${esc(r.feedback)}</p></div>`;}
  function content(){const p=book.pages[page];let html=(reviewing?'<p class="st-review-banner">Read again · Review the blanks. Your original score stays unchanged.</p>':'')+`<p class="fv-eyebrow">Page ${page+1} of 10</p><h3>${esc(p.title)}</h3><p class="st-reading-cue">Read together. Tap a blank and invite a student to choose.</p><div class="st-story-flow">`;
    p.challenges.forEach((c,i)=>{const r=record(c.id);html+=`<p class="st-story"><span data-glossary>${esc(p.segments[i]+c.before)} </span><button type="button" class="st-blank ${r.solved?'is-solved':''}" data-action="gap" data-id="${c.id}" aria-label="${r.solved?esc(c.answer)+'. Review your choice':'Blank '+(i+1)+'. Choose an expression'}" aria-expanded="${activeGap===c.id}">${r.solved?esc(c.answer):'____ '+(i+1)}</button><span data-glossary> ${esc(c.after)}</span></p>`+chooser(c,i);});
    html+=`<p class="st-story" data-glossary>${esc(p.segments[2].trim())}</p></div><div class="fv-actions"><button type="button" data-action="story-audio" ${ready()?'':'disabled'}>▶ Listen to this page</button><button type="button" data-action="text-project">Project story page ↗</button></div><p class="st-audio-hint">${ready()?'The page is complete. Listen or keep reading.':'Complete both blanks to unlock the narration.'}</p>`+words(p)+`<details class="st-predict"><summary>Before turning the page…</summary><p data-glossary>${esc(p.predict)}</p><button type="button" data-action="prediction-audio">▶ Listen to the question</button></details>`;return html;}
  function render(){glossary.hide();results=false;$('stStage').classList.remove('st-results-mode');$('stTitle').textContent=`After the Storm · ${page+1}/10`;
    $('stImage').src=book.pages[page].scenes[scene].image;$('stImage').alt=book.pages[page].scenes[scene].alt;document.querySelectorAll('[data-scene]').forEach(b=>b.setAttribute('aria-pressed',Number(b.dataset.scene)===scene));
    copy.innerHTML=content();marked(copy);copy.scrollTop=0;$('stPage').value=String(page);document.querySelector('.st-visual').hidden=false;
    const seq=reviewing?reviewPages:book.pages.map((_,i)=>i),pos=seq.indexOf(page);$('stPrev').disabled=pos<=0;$('stNext').textContent=pos===seq.length-1?'Finish the story →':'Turn the page →';}
  function refreshStory(focusId){glossary.hide();const scroll=copy.scrollTop,projectScroll=$('stProjectionBody').scrollTop;copy.innerHTML=content();marked(copy);copy.scrollTop=scroll;
    if(projector.open && projection==='text'){renderProjection();$('stProjectionBody').scrollTop=projectScroll;}
    const host=projector.open?$('stProjectionBody'):copy;if(focusId){const r=record(focusId);const next=r.solved?host.querySelector(`[data-action="gap"][data-id="${focusId}"]`):host.querySelector(`[data-choices="${focusId}"] [data-action="choose"]:not(:disabled)`);next?.focus({preventScroll:true});}}
  function turn(next){if(next===page)return;stop();glossary.hide();const leaf=$('stLeaf');leaf.className='fv-leaf';const old=copy.cloneNode(true);old.removeAttribute('id');old.querySelectorAll('[id]').forEach(e=>e.removeAttribute('id'));leaf.replaceChildren(old);
    if(!matchMedia('(prefers-reduced-motion: reduce)').matches){void leaf.offsetWidth;leaf.classList.add(next>page?'forward':'backward');}
    if(sound){paper.currentTime=0;paper.play().catch(()=>{});}page=next;scene=0;activeGap=null;render();reader.scrollTop=0;}
  function showResults(){stop();glossary.hide();results=true;activeGap=null;$('stStage').classList.add('st-results-mode');document.querySelector('.st-visual').hidden=true;$('stTitle').textContent='After the Storm · The end';
    const all=book.pages.flatMap(p=>p.challenges),first=all.filter(c=>initial.get(c.id)?.firstCorrect).length,solved=all.filter(c=>initial.get(c.id)?.solved||review.get(c.id)?.solved).length,revisit=all.filter(c=>!initial.get(c.id)?.firstCorrect);
    copy.innerHTML=`<div class="st-results"><h3>The end</h3><p>Maya’s first assignment became a story about a whole community. What did you learn from her journey?</p><p class="st-summary">${solved}/20 blanks completed</p><p>${first}/20 correct on the first attempt.</p><p>Classroom practice · No grade is submitted.</p>${revisit.length?`<p>${revisit.length} choices to revisit, including any unfinished blanks.</p><button type="button" data-action="review">Read again and review</button>`:'<p>Every first choice was correct. Well done!</p>'}<button type="button" data-action="return">Return to the story</button></div>`;$('stPrev').disabled=false;$('stNext').textContent='Return to story';}
  function renderProjection(){const host=$('stProjectionBody'),p=book?.pages[page];glossary?.hide();projector.classList.toggle('picture-mode',projection==='image');
    if(projection==='image'){$('stProjectTitle').textContent=`Page ${page+1} · Scene ${scene?'B':'A'}`;host.innerHTML=`<img src="${p.scenes[scene].image}" alt="${esc(p.scenes[scene].alt)}">`;}
    else if(projection==='example'){$('stProjectTitle').textContent='Read · Choose · Continue';host.innerHTML=document.querySelector('.st-example').innerHTML;host.querySelector('[data-action=example-project]')?.remove();}
    else{$('stProjectTitle').textContent=`Page ${page+1} · ${p.title}`;host.innerHTML=content();marked(host);}host.scrollTop=0;}
  function project(type){stop();projection=type;renderProjection();if(!projector.open)projector.showModal();}
  async function fullscreen(){try{if(document.fullscreenElement)await document.exitFullscreen();else await (projector.open?projector:reader).requestFullscreen?.();}catch{status('Full screen is unavailable. The expanded view is ready.');}}
  document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||b.disabled)return;
    if(b.dataset.scene!==undefined){scene=Number(b.dataset.scene);$('stImage').src=book.pages[page].scenes[scene].image;$('stImage').alt=book.pages[page].scenes[scene].alt;document.querySelectorAll('[data-scene]').forEach(x=>x.setAttribute('aria-pressed',x===b));return;}
    const id=b.dataset.id,c=id?challenge(id):null,r=id?record(id):null;
    switch(b.dataset.action){
      case 'gap':stop();activeGap=activeGap===id?null:id;refreshStory(activeGap);break;
      case 'choose':if(r.solved||!c.options.includes(b.dataset.option)||r.last===b.dataset.option)break;stop();r.attempts++;r.last=b.dataset.option;r.solved=r.last===c.answer;if(r.attempts===1)r.firstCorrect=r.solved;r.feedback=r.solved?'Correct! '+c.success:'Not quite. '+c.feedback[r.last]+' Try the other expression.';refreshStory(id);break;
      case 'story-audio':if(ready())play(book.pages[page].audio);break;
      case 'prediction-audio':play(book.pages[page].predictionAudio);break;
      case 'guide-audio':if(book)play(book.guideAudio);break;
      case 'example-audio':if(book)play(book.exampleAudio);break;
      case 'example-project':project('example');break;
      case 'image':project('image');break;
      case 'text-project':project('text');break;
      case 'project-close':stop();projector.close();break;
      case 'close':stop();paper.pause();reader.close();break;
      case 'stop':stop();break;
      case 'fullscreen':fullscreen();break;
      case 'font-up':case 'font-down':scale=Math.max(.9,Math.min(1.5,scale+(b.dataset.action==='font-up'?.1:-.1)));reader.style.setProperty('--st-scale',scale);break;
      case 'review':reviewIds=book.pages.flatMap(p=>p.challenges).filter(x=>!initial.get(x.id)?.firstCorrect).map(x=>x.id);reviewPages=book.pages.map((p,i)=>p.challenges.some(x=>reviewIds.includes(x.id))?i:-1).filter(i=>i>=0);review.clear();reviewing=true;page=reviewPages[0];scene=0;activeGap=null;render();break;
      case 'return':reviewing=false;activeGap=null;render();break;
    }});
  $('stOpen').addEventListener('click',()=>{stop();render();reader.showModal();});
  $('stPrev').addEventListener('click',()=>{if(results){render();return;}const seq=reviewing?reviewPages:book.pages.map((_,i)=>i);turn(seq[Math.max(0,seq.indexOf(page)-1)]);});
  $('stNext').addEventListener('click',()=>{if(results){reviewing=false;render();return;}const seq=reviewing?reviewPages:book.pages.map((_,i)=>i),i=seq.indexOf(page);if(i===seq.length-1)showResults();else turn(seq[i+1]);});
  $('stPage').addEventListener('change',()=>{stop();reviewing=false;const next=Number($('stPage').value);if(results||next===page){page=next;activeGap=null;render();}else turn(next);});
  $('stSound').addEventListener('click',()=>{sound=!sound;$('stSound').setAttribute('aria-pressed',sound);$('stSound').textContent='Page sound: '+(sound?'on':'off');if(!sound)paper.pause();});
  $('stLeaf').addEventListener('animationend',()=>{$('stLeaf').className='fv-leaf';$('stLeaf').replaceChildren();});
  [reader,projector].forEach(d=>{d.addEventListener('cancel',()=>{stop();paper.pause();});d.addEventListener('close',()=>{stop();glossary?.hide();if(document.fullscreenElement===d)document.exitFullscreen().catch(()=>{});if(d===projector)projection=null;else{$('stLeaf').className='fv-leaf';$('stLeaf').replaceChildren();}});});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){stop();paper.pause();}});
  async function load(){$('stRetry').hidden=true;$('stLoadStatus').textContent='Loading the story…';try{const response=await fetch('/assets/data/english-intermediate2-after-the-storm.json?v=20261016-feedback-en',{cache:'no-cache'});if(!response.ok)throw Error(response.status);book=await response.json();if(book.pages.length!==10||!book.pages.every(p=>p.segments?.length===3&&p.challenges.every(c=>c.options.length===2)))throw Error('Invalid story');
      glossary=window.FirstVisitVocabulary(book.pages.flatMap(p=>p.vocabulary),(entry,button)=>play(entry.audio,button));book.pages.flatMap(p=>p.challenges).forEach(c=>choices.set(c.id,Math.random()<.5?[...c.options]:[...c.options].reverse()));$('stPage').innerHTML=book.pages.map((p,i)=>`<option value="${i}">${i+1} · ${esc(p.title)}</option>`).join('');$('stOpen').disabled=false;$('stLoadStatus').textContent='Your storybook is ready.';
    }catch{$('stLoadStatus').textContent='The book could not load. Check your connection and try again.';$('stRetry').hidden=false;}}
  $('stRetry').addEventListener('click',load);load();
})();
