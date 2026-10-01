/* Independent reading practice. No gradebook or submission requests. */
(() => {
 'use strict';
 const data=window.StoneSoup, media=window.StoneSoupAudio, $=id=>document.getElementById(id);
 const reader=$('stoneReader'), rotate=$('stoneRotate'), sheet=$('stoneBookSheet'), leaf=$('stoneTurningLeaf');
 const narration=$('stoneNarration'), wordPlayer=$('stoneWordAudio'), turnPlayer=$('stoneTurnAudio');
 const imageBase='/assets/img/english-basic-2/stone-soup/';
 let page=0, rate=1, zoom=1, sound=true, mode='', turning=false, animationTimer, generation=0;
 let openTarget=0, restoreFocus=null, oldOverflow='', ownedFullscreen=false, opening=false;
 const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
 function announce(message){$('stoneAudioStatus').textContent=message;}
 function soundTurn(){
   if(!sound)return;
   // Start native playback synchronously inside the gesture; no await before play.
   try {turnPlayer.pause();turnPlayer.currentTime=0;turnPlayer.volume=mode==='all'?.3:.8;
     const promise=turnPlayer.play();if(promise)promise.catch(()=>announce('Page turned. For sound, check media volume and tap a page button again.'));
   } catch(_){announce('Page turned. Sound is unavailable on this device.');}
 }
 function renderPage(){
   const p=data.pages[page];
   sheet.innerHTML=`<figure class="stone-page-picture"><img src="${imageBase}page-${page+1}.png" alt="${esc(p.alt)}" width="1536" height="1024"></figure><article class="stone-page-copy" tabindex="0" aria-label="Page ${page+1} text"><span class="stone-page-number">Page ${page+1} of ${data.pages.length}</span><h3>${esc(p.title)}</h3>${p.turns.map(([speaker,text])=>`<p${speaker!=='Narrator'?' class="dialogue"':''}>${speaker!=='Narrator'?'“':''}${esc(text)}${speaker!=='Narrator'?'”':''}</p>`).join('')}${page===data.pages.length-1?'<p class="the-end">The End</p>':''}</article>`;
   $('stonePageSelect').value=String(page);$('stonePrevious').disabled=page===0||turning;$('stoneNext').disabled=page===data.pages.length-1||turning;
   const next=new Image();if(page+1<data.pages.length)next.src=imageBase+`page-${page+2}.png`;
   requestAnimationFrame(()=>{const copy=sheet.querySelector('.stone-page-copy');if(reader.open&&copy.scrollHeight>copy.clientHeight+2&&mode!=='all')announce(`Page ${page+1}: scroll inside the text to read more.`);});
 }
 function endAnimation(){clearTimeout(animationTimer);leaf.className='stone-turning-leaf';leaf.replaceChildren();turning=false;$('stonePrevious').disabled=page===0;$('stoneNext').disabled=page===data.pages.length-1;}
 function audioButtons(){const active=!!mode;$('stonePause').disabled=!active;$('stoneStop').disabled=!active;$('stonePause').textContent=narration.paused?'Resume':'Pause';}
 function stopNarration(message='') {generation++;mode='';narration.pause();narration.currentTime=0;audioButtons();if(message)announce(message);}
 function turnTo(next,{automatic=false,animate=true}={}){
   if(next<0||next>=data.pages.length||next===page)return;
   if(turning&&!automatic)return;
   if(!automatic)stopNarration('Page changed. Ready to read.');
   endAnimation();soundTurn();
   if(animate&&!reduced()){
     const old=sheet.cloneNode(true);old.removeAttribute('id');old.querySelectorAll('[tabindex]').forEach(e=>e.removeAttribute('tabindex'));leaf.replaceChildren(old);
     leaf.classList.add(next>page?'forward':'backward');turning=true;
   }
   page=next;renderPage();
   if(turning)animationTimer=setTimeout(endAnimation,720);
 }
 function showReader(target){
   if(opening)return;opening=true;
   wordPlayer.pause();stopNarration();endAnimation();page=Math.max(0,Math.min(5,target));renderPage();
   soundTurn();
   const mount=()=>{if(!reader.open){oldOverflow=document.body.style.overflow;document.body.style.overflow='hidden';reader.showModal();}opening=false;announce(`Page ${page+1} of 6. Use the page arrows or listen.`);$('closeStoneBook').focus({preventScroll:true});};
   // Enter fullscreen BEFORE opening the modal, so its top layer stays above the page.
   // The full-viewport modal remains the fallback on iOS or when fullscreen is denied.
   if(!document.fullscreenElement&&document.documentElement.requestFullscreen){
     ownedFullscreen=true;document.documentElement.requestFullscreen().then(mount).catch(()=>{ownedFullscreen=false;mount();});
   }else mount();
 }
 function requestOpen(target=page){
   openTarget=target;restoreFocus=document.activeElement;
   if(innerWidth<900&&innerHeight>innerWidth){rotate.showModal();$('rotateOpen').focus();}
   else showReader(target);
 }
 function closeReader(){
   stopNarration();wordPlayer.pause();turnPlayer.pause();endAnimation();
   if(reader.open)reader.close();document.body.style.overflow=oldOverflow;
   if(ownedFullscreen&&document.fullscreenElement)document.exitFullscreen?.().catch(()=>{});ownedFullscreen=false;
   restoreFocus?.focus?.({preventScroll:true});
 }
 reader.addEventListener('cancel',e=>{e.preventDefault();closeReader();});reader.addEventListener('close',()=>{document.body.style.overflow=oldOverflow;});
 $('openStoneBook').addEventListener('click',()=>requestOpen());$('returnToBook').addEventListener('click',()=>requestOpen());
 $('rotateOpen').addEventListener('click',()=>{rotate.close();showReader(openTarget);});$('rotateCancel').addEventListener('click',()=>rotate.close());
 $('closeStoneBook').addEventListener('click',closeReader);
 $('stonePageSelect').innerHTML=data.pages.map((p,i)=>`<option value="${i}">Page ${i+1} of 6</option>`).join('');
 $('stonePageSelect').addEventListener('change',e=>{if(turning){e.target.value=page;return;}turnTo(Number(e.target.value));});
 $('stonePrevious').addEventListener('click',()=>turnTo(page-1));$('stoneNext').addEventListener('click',()=>turnTo(page+1));
 reader.addEventListener('keydown',e=>{if(e.target.closest('select,input,button')||e.altKey||e.ctrlKey||e.metaKey)return;if(e.key==='ArrowRight'){e.preventDefault();turnTo(page+1);}if(e.key==='ArrowLeft'){e.preventDefault();turnTo(page-1);}});
 let touch=null;
 $('stoneBookStage').addEventListener('touchstart',e=>{if(e.touches.length===1)touch={x:e.touches[0].clientX,y:e.touches[0].clientY};},{passive:true});
 $('stoneBookStage').addEventListener('touchend',e=>{if(!touch)return;const dx=e.changedTouches[0].clientX-touch.x,dy=e.changedTouches[0].clientY-touch.y;touch=null;if(Math.abs(dx)>65&&Math.abs(dx)>Math.abs(dy)*1.5)turnTo(page+(dx<0?1:-1));},{passive:true});
 function setZoom(value){zoom=Math.max(.9,Math.min(1.7,Math.round(value*10)/10));reader.style.setProperty('--story-zoom',zoom);$('stoneFontDown').disabled=zoom<=.9;$('stoneFontUp').disabled=zoom>=1.7;announce(`Text size: ${Math.round(zoom*100)}%. Scroll the text panel if needed.`);}
 $('stoneFontDown').addEventListener('click',()=>setZoom(zoom-.1));$('stoneFontUp').addEventListener('click',()=>setZoom(zoom+.1));
 $('stoneSound').addEventListener('click',()=>{sound=!sound;$('stoneSound').setAttribute('aria-pressed',sound);$('stoneSound').textContent='Page sound: '+(sound?'on':'off');if(sound)soundTurn();else turnPlayer.pause();});
 document.querySelectorAll('[data-rate]').forEach(b=>b.addEventListener('click',()=>{rate=Number(b.dataset.rate);narration.playbackRate=rate;wordPlayer.playbackRate=rate;document.querySelectorAll('[data-rate]').forEach(v=>v.setAttribute('aria-pressed',Number(v.dataset.rate)===rate));announce(`Speed: ${rate===1?'1.0':'0.75'}×.`);}));
 async function playStory(all){
   stopNarration();wordPlayer.pause();mode=all?'all':'page';const ticket=++generation;
   if(all&&page!==0){endAnimation();turnTo(0,{automatic:true});}
   narration.src=all?media.fullAudio:media.pages[page].audio;narration.playbackRate=rate;
   announce(all?'Reading the whole story. Pages will turn automatically.':`Reading page ${page+1}.`);audioButtons();
   try{await narration.play();if(ticket!==generation)return;audioButtons();}
   catch(_){if(ticket!==generation)return;mode='';audioButtons();announce('Audio could not start. Check your connection, then tap Read again.');}
 }
 $('stoneReadPage').addEventListener('click',()=>playStory(false));$('stoneReadAll').addEventListener('click',()=>playStory(true));
 // A deliberate pause invalidates the pending play promise. Its AbortError
 // must not clear the reading mode or disable Resume on a slow connection.
 $('stonePause').addEventListener('click',()=>{if(!mode)return;generation++;if(narration.paused)narration.play().catch(()=>announce('Tap Resume again to continue.'));else narration.pause();audioButtons();});
 narration.addEventListener('play',audioButtons);narration.addEventListener('pause',audioButtons);
 $('stoneStop').addEventListener('click',()=>stopNarration('Audio stopped.'));
 narration.addEventListener('timeupdate',()=>{if(mode!=='all')return;let target=0;media.pages.forEach((p,i)=>{if(narration.currentTime>=p.start)target=i;});if(target!==page)turnTo(target,{automatic:true});});
 narration.addEventListener('ended',()=>{const complete=mode==='all';mode='';audioButtons();announce(complete?'The end. Close the book when you are ready for the questions.':'Page audio finished.');});
 narration.addEventListener('error',()=>{mode='';audioButtons();announce('The story audio could not load. Check your connection, then tap Read again.');});
 $('stoneVocabulary').innerHTML=data.vocabulary.map(([word,meaning])=>`<article><button type="button" data-vocab="${word}" aria-label="Listen to ${word}">◖ ${word}</button><p>${esc(meaning)}</p></article>`).join('');
 $('stoneVocabulary').addEventListener('click',async e=>{const b=e.target.closest('[data-vocab]');if(!b)return;stopNarration();wordPlayer.pause();wordPlayer.src=media.words[b.dataset.vocab];wordPlayer.playbackRate=rate;try{await wordPlayer.play();$('vocabAudioStatus').textContent='Listening: '+b.dataset.vocab;}catch(_){$('vocabAudioStatus').textContent='Audio could not play. Check your connection and tap the word again.';}});
 wordPlayer.addEventListener('error',()=>{$('vocabAudioStatus').textContent='The word audio could not load. Tap the word to retry.';});

 // Balanced but unpredictable keys. Canonical choices are stored independently of A/B/C.
 const quizKey='jaralingua:stone-soup:quiz:'+data.version;
 function rand(max){const v=new Uint32Array(1);crypto.getRandomValues(v);return v[0]%max;}
 function shuffle(items){const a=[...items];for(let i=a.length-1;i>0;i--){const j=rand(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;}
 function newOrder(){
   let positions;
   do{positions=shuffle([0,0,0,1,1,1,2,2,2,rand(3)]);}while(positions.some((v,i)=>i>1&&v===positions[i-1]&&v===positions[i-2])||positions.slice(0,7).every((v,i)=>v===positions[i+3]));
   return positions.map(pos=>{const wrong=shuffle([1,2]);return [0,1,2].map(i=>i===pos?0:wrong.shift());});
 }
 let order=newOrder(),answers=Array(10).fill(null),checked=false;
 try{const saved=JSON.parse(localStorage.getItem(quizKey)||'null');if(saved?.order?.length===10&&saved.order.every(a=>Array.isArray(a)&&a.length===3&&[0,1,2].every(v=>a.includes(v)))){order=saved.order;answers=Array.from({length:10},(_,i)=>[0,1,2].includes(saved.answers?.[i])?saved.answers[i]:null);checked=!!saved.checked;}}catch(_){}
 function saveQuiz(){try{localStorage.setItem(quizKey,JSON.stringify({order,answers,checked}));}catch(_){$('stoneQuizStatus').textContent='Browser storage is unavailable. Keep this page open to keep your answers.';}}
 function quizSummary(){const done=answers.filter(v=>v!==null).length,score=answers.filter(v=>v===0).length;$('stoneScore').textContent=checked?`Score: ${score} / 10 · ${done} answered`:`${done} of 10 answered`;}
 function feedback(i){
   const card=$('stoneQuestions').children[i],q=data.questions[i],box=card.querySelector('.stone-feedback');
   card.querySelectorAll('label').forEach(l=>l.classList.remove('correct','wrong'));
   if(!checked){box.hidden=true;return;}
   box.hidden=false;
   if(answers[i]===null){box.textContent='Choose an answer, then check again.';return;}
   const selected=card.querySelector(`input[value="${answers[i]}"]`);selected.closest('label').classList.add(answers[i]===0?'correct':'wrong');
   card.querySelector('input[value="0"]').closest('label').classList.add('correct');
   box.innerHTML=`<strong>${answers[i]===0?'Correct.':'Look again.'}</strong> ${esc(q.why)} <button type="button" class="stone-button" data-review-page="${q.page-1}">Read page ${q.page}</button>`;
 }
 function renderQuiz(){
   $('stoneQuestions').innerHTML=data.questions.map((q,i)=>`<fieldset class="stone-question"><legend>${i+1}. ${esc(q.q)}</legend><div class="stone-options">${order[i].map((choice,pos)=>`<label class="stone-option"><input type="radio" name="stone-q-${i}" value="${choice}" ${answers[i]===choice?'checked':''}><span><b>${'ABC'[pos]}.</b> ${esc(q.options[choice])}</span></label>`).join('')}</div><p class="stone-feedback" hidden></p></fieldset>`).join('');data.questions.forEach((_,i)=>feedback(i));quizSummary();
 }
 $('stoneQuestions').addEventListener('change',e=>{if(!e.target.matches('input[type=radio]'))return;const i=Number(e.target.name.split('-').at(-1));answers[i]=Number(e.target.value);feedback(i);quizSummary();saveQuiz();});
 $('stoneQuestions').addEventListener('click',e=>{const b=e.target.closest('[data-review-page]');if(b)requestOpen(Number(b.dataset.reviewPage));});
 $('checkStoneAnswers').addEventListener('click',()=>{checked=true;data.questions.forEach((_,i)=>feedback(i));quizSummary();saveQuiz();const missing=answers.filter(v=>v===null).length;$('stoneQuizStatus').textContent=missing?`${missing} unanswered. You can still change any answer and check again.`:'Read the explanations. You can revisit a story page, change an answer, and check again.';});
 $('resetStoneQuiz').addEventListener('click',()=>{if(answers.some(v=>v!==null)&&!confirm('Start a new attempt? Your current answers will be cleared.'))return;order=newOrder();answers.fill(null);checked=false;renderQuiz();saveQuiz();$('stoneQuizStatus').textContent='New attempt ready. The options have been mixed again.';});
 window.addEventListener('pagehide',()=>{stopNarration();wordPlayer.pause();turnPlayer.pause();saveQuiz();});
 renderPage();renderQuiz();setZoom(1);
})();
