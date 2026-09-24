(() => {
  'use strict';
  const activity=window.Basic2FoodPractice[document.body.dataset.foodPractice];
  const root=document.getElementById('foodPractice');
  if(!activity||!root)return;
  const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
  const shuffle=items=>{const out=[...items];for(let i=out.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;};
  if(activity.questions){
    let bank=[],answers=[],checked=false;
    function start(){
      const slots=shuffle(activity.questions.map((_,i)=>i%3));
      bank=activity.questions.map((q,i)=>{const wrong=shuffle(q.options.filter(o=>o!==q.answer));wrong.splice(slots[i],0,q.answer);return {...q,choices:wrong};});
      answers=bank.map(()=>null);checked=false;
      root.innerHTML='<div class="fp-toolbar"><p id="fpScore" role="status">Choose one answer for each question.</p><button type="button" id="fpCheck">Check answers</button><button type="button" id="fpReset">Try again</button></div><div class="fp-question-grid">'+bank.map((q,i)=>`<fieldset class="fp-question" data-question="${i}"><legend>${i+1}. ${esc(q.prompt)}</legend>${q.image?`<img class="fp-question-image" src="${q.image}" alt="Food illustration" loading="lazy">`:''}<div class="fp-choices">${q.choices.map((option,j)=>`<label><input type="radio" name="question-${i}" value="${j}"><span><b>${'ABC'[j]}.</b> ${esc(option)}</span></label>`).join('')}</div><p class="fp-feedback" id="feedback-${i}" hidden></p></fieldset>`).join('')+'</div><div class="fp-toolbar"><button type="button" id="fpCheckBottom">Check answers</button><a href="unit-6-fabulous-food.html#'+activity.review+'">Review this topic</a></div>';
      root.querySelector('#fpCheck').addEventListener('click',check);
      root.querySelector('#fpCheckBottom').addEventListener('click',check);
      root.querySelector('#fpReset').addEventListener('click',()=>{start();root.scrollIntoView({block:'start'});});
    }
    function check(){
      let score=0,answered=0;
      bank.forEach((q,i)=>{const value=answers[i];const correct=value!==null&&q.choices[value]===q.answer;if(value!==null)answered++;if(correct)score++;const field=root.querySelector(`[data-question="${i}"]`);const feedback=field.querySelector('.fp-feedback');field.dataset.result=value===null?'empty':correct?'correct':'incorrect';feedback.hidden=false;feedback.textContent=value===null?'Not answered yet. Choose A, B, or C.':`${correct?'Correct.':'Not yet. Correct answer: '+q.answer+'.'} ${q.explanation}`;});
      checked=true;root.querySelector('#fpScore').textContent=`Score: ${score} / ${bank.length}. Answered: ${answered} / ${bank.length}. You can change any answer and check again.`;
    }
    root.addEventListener('change',event=>{const input=event.target;if(!input.matches('input[type=radio]'))return;const field=input.closest('[data-question]');answers[Number(field.dataset.question)]=Number(input.value);delete field.dataset.result;field.querySelector('.fp-feedback').hidden=true;if(checked)root.querySelector('#fpScore').textContent='Answer changed. Check answers again to update your score.';else root.querySelector('#fpScore').textContent=`Answered: ${answers.filter(a=>a!==null).length} / ${bank.length}.`;});
    start();return;
  }
  // A compact, touch-first two-team adaptation of the original food memory game.
  let deck=[],revealed=[],matched=new Set(),scores=[0,0],team=0,phase='ready',lastFood=null,generation=0,rate=1,sounds=true;
  const audio=new Audio();let soundContext;
  function tone(success=false){if(!sounds)return;try{soundContext??=new(window.AudioContext||window.webkitAudioContext)();soundContext.resume();const o=soundContext.createOscillator(),g=soundContext.createGain();o.connect(g);g.connect(soundContext.destination);o.frequency.value=success?660:420;g.gain.setValueAtTime(.06,soundContext.currentTime);g.gain.exponentialRampToValueAtTime(.001,soundContext.currentTime+.12);o.start();o.stop(soundContext.currentTime+.13);}catch{}}
  function message(text){root.querySelector('#fpMemoryStatus').textContent=text;}
  function play(food){audio.pause();audio.src=food.audio;audio.playbackRate=rate;audio.play().catch(()=>message('Audio could not start. Tap Hear word to retry.'));}
  audio.addEventListener('error',()=>message('The word audio could not load. Check your connection and try Hear word again.'));
  function sync(){
    root.querySelector('#fpTeam').textContent=matched.size===activity.foods.length?'Game complete':`Team ${team+1} · choose two cards`;
    root.querySelector('#fpPoints').textContent=`Team 1: ${scores[0]} · Team 2: ${scores[1]} · Pairs: ${matched.size}/${activity.foods.length}`;
    root.querySelectorAll('.fp-memory-card').forEach((b,i)=>{const open=revealed.includes(i)||matched.has(deck[i]);b.classList.toggle('is-open',open);b.classList.toggle('is-matched',matched.has(deck[i]));b.disabled=matched.has(deck[i])||phase==='pair';b.setAttribute('aria-label',open?activity.foods[deck[i]].word:`Hidden card ${i+1}`);b.querySelector('.fp-front').hidden=!open;b.querySelector('.fp-back').hidden=open;});
  }
  function reset(){generation++;audio.pause();deck=shuffle(activity.foods.flatMap((_,i)=>[i,i]));revealed=[];matched=new Set();scores=[0,0];team=0;phase='ready';lastFood=null;
    root.innerHTML='<div class="fp-toolbar"><strong id="fpTeam"></strong><span id="fpPoints"></span><button type="button" id="fpNew">New game</button><button type="button" id="fpSound" aria-pressed="'+sounds+'">Sounds: '+(sounds?'on':'off')+'</button></div><p id="fpMemoryStatus" role="status">Find a pair. Listen and repeat the word before continuing.</p><div class="fp-memory-grid">'+deck.map((n,i)=>`<button type="button" class="fp-memory-card" data-card="${i}"><span class="fp-back">Food<br><b>${i+1}</b></span><span class="fp-front" hidden><img src="${activity.foods[n].image}" alt=""><strong>${esc(activity.foods[n].word)}</strong></span></button>`).join('')+'</div><section id="fpPair" class="fp-pair" hidden><h2 id="fpPairWord"></h2><p>Listen, then say the word aloud with your team.</p><div class="fp-toolbar"><button type="button" id="fpHear">Hear word</button><span>Speed</span><button type="button" data-rate="0.75" aria-pressed="'+(rate===.75)+'">0.75×</button><button type="button" data-rate="1" aria-pressed="'+(rate===1)+'">1×</button><button type="button" id="fpContinue">We repeated it — continue</button></div></section>';
    root.querySelector('#fpNew').addEventListener('click',()=>{if(confirm('Start a new game and clear both team scores?'))reset();});
    root.querySelector('#fpSound').addEventListener('click',e=>{sounds=!sounds;e.target.textContent='Sounds: '+(sounds?'on':'off');e.target.setAttribute('aria-pressed',String(sounds));});
    root.querySelector('#fpHear').addEventListener('click',()=>{if(lastFood)play(lastFood);});
    root.querySelector('#fpContinue').addEventListener('click',()=>{phase='ready';revealed=[];root.querySelector('#fpPair').hidden=true;sync();if(matched.size===activity.foods.length)message(scores[0]===scores[1]?'A tie! Both teams found six pairs.':`Team ${scores[0]>scores[1]?1:2} wins. Great teamwork!`);else message(`Team ${team+1} found a pair and keeps the turn.`);});
    sync();
  }
  root.addEventListener('click',event=>{
    const b=event.target.closest('button');if(!b)return;
    if(b.dataset.rate){rate=Number(b.dataset.rate);audio.playbackRate=rate;root.querySelectorAll('[data-rate]').forEach(x=>x.setAttribute('aria-pressed',String(Number(x.dataset.rate)===rate)));return;}
    if(b.dataset.card===undefined||phase!=='ready')return;const index=Number(b.dataset.card);if(revealed.includes(index)||matched.has(deck[index]))return;
    revealed.push(index);tone();play(activity.foods[deck[index]]);sync();if(revealed.length<2)return;
    phase='checking';const current=generation;
    setTimeout(()=>{if(current!==generation)return;if(deck[revealed[0]]===deck[revealed[1]]){const id=deck[revealed[0]];matched.add(id);scores[team]++;lastFood=activity.foods[id];phase='pair';tone(true);root.querySelector('#fpPairWord').textContent=lastFood.word;root.querySelector('#fpPair').hidden=false;message(`Pair found by Team ${team+1}. Listen and repeat: ${lastFood.word}.`);play(lastFood);root.querySelector('#fpPair').scrollIntoView({block:'nearest',behavior:'smooth'});}else{revealed=[];team=1-team;phase='ready';message(`No match. Team ${team+1}, choose two cards.`);}sync();},900);
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden)audio.pause();});
  reset();
})();
