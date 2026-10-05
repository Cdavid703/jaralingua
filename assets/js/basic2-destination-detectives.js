/* Oral classroom activity. Roster stays in memory; no grades or submissions. */
(() => {
  'use strict';
  const $ = id => document.getElementById('dd-' + id);
  const destinations = [
    ['paris','Paris, France','The Eiffel Tower and a park.'],
    ['cartagena','Cartagena, Colombia','The Clock Tower, colorful buildings and city walls.'],
    ['london','London, United Kingdom','Big Ben, Westminster Bridge and the River Thames.'],
    ['new-york','New York City, United States','The Statue of Liberty and the harbor.'],
    ['rio','Rio de Janeiro, Brazil','Christ the Redeemer, mountains and the bay.'],
    ['rome','Rome, Italy','The Colosseum and its ancient stone arches.'],
    ['machu-picchu','Machu Picchu, Peru','An ancient Inca site with stone terraces in the mountains.'],
    ['giza','Giza, Egypt','The pyramids and the Great Sphinx in the desert.'],
    ['venice','Venice, Italy','The Grand Canal, gondolas and Rialto Bridge.'],
    ['sydney','Sydney, Australia','The Opera House, Harbour Bridge and boats.']
  ].map(([id,name,detail]) => ({id,name,detail,src:'/assets/img/english-basic-2/destination-detectives/'+id+'.webp'}));
  const state = {roster:[],absent:new Set(),used:new Set(),pair:[],deck:[],seen:new Set(),card:null,demo:false,revealed:false,spinning:false,loading:false,muted:false,epoch:0,controller:null,timer:null,frame:null};
  const sounds={wheel:new Audio('/ingles/basico-2/audio/unit5/yesterday-pictures/roulette.wav'),card:new Audio('/ingles/basico-2/audio/unit5/yesterday-pictures/card-flip.wav')};
  Object.values(sounds).forEach(a=>{a.preload='auto';a.volume=.65;});
  function play(kind){
    if(state.muted)return;
    const a=sounds[kind];try{a.currentTime=0;}catch(_){}
    const blocked=()=>{$('sound-status').textContent='Sound could not play. Check your volume and tap Sound off, then Sound on to retry.';};
    try{a.play()?.catch(blocked);}catch(_){blocked();}
  }
  function stopSounds(){Object.values(sounds).forEach(a=>{a.pause();try{a.currentTime=0;}catch(_){}});}
  const user=()=>window.JaraLinguaAuth?.getUser?.()||window.JaraLinguaCurrentUser;
  const identity=()=>{const u=user();return u?.credential?(u.provider||'google')+':'+u.credential:'';};
  let account=identity();
  const present=()=>state.roster.filter(s=>!state.absent.has(s.id));
  const fresh=()=>present().filter(s=>!state.used.has(s.id)&&!state.pair.some(p=>p.id===s.id));
  // A single remaining learner still gets a turn, with a visibly identified returning partner.
  const returning=()=>state.pair.length===1&&!fresh().length;
  const candidates=()=>returning()?present().filter(s=>s.id!==state.pair[0].id):fresh();
  const active=()=>state.spinning||state.pair.length>0;
  function random(n){const a=new Uint32Array(1),cap=Math.floor(4294967296/n)*n;do{crypto.getRandomValues(a);}while(a[0]>=cap);return a[0]%n;}
  function shuffleDeck(){
    const others=destinations.slice(1);for(let i=others.length-1;i>0;i--){const j=random(i+1);[others[i],others[j]]=[others[j],others[i]];}
    state.deck=[destinations[0],...others];state.seen.clear();renderDeck();
  }
  function draw(){
    const canvas=$('wheel'),ctx=canvas.getContext('2d'),rows=candidates(),palette=['#166c66','#95643c','#405c79','#755577','#536c39','#925654'];
    canvas.style.transform='rotate(0deg)';ctx.clearRect(0,0,520,520);
    const entries=rows.length?rows:[{name:state.roster.length?'Round complete':'Load class'}],step=2*Math.PI/entries.length;
    entries.forEach((s,i)=>{const start=-Math.PI/2+i*step;ctx.beginPath();ctx.moveTo(260,260);ctx.arc(260,260,254,start,start+step);ctx.closePath();ctx.fillStyle=palette[i%palette.length];ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.stroke();ctx.save();ctx.translate(260,260);ctx.rotate(start+step/2);ctx.fillStyle='#fff';ctx.textAlign='right';ctx.font='bold '+(entries.length>24?13:entries.length>12?16:22)+'px Arial';ctx.fillText(s.name.length>24?s.name.slice(0,22)+'…':s.name,238,7,205);ctx.restore();});
    ctx.beginPath();ctx.arc(260,260,20,0,2*Math.PI);ctx.fillStyle='#f6f3eb';ctx.fill();
  }
  function controls(){
    const busy=state.spinning||state.loading;
    $('load').disabled=busy||active();$('reset').disabled=busy;$('shuffle').disabled=busy||active();$('example').disabled=busy||active();
    $('spin').disabled=busy||state.pair.length===2||present().length<2||!candidates().length||state.seen.size===10;
    $('spin').textContent=state.spinning?'Spinning…':state.pair.length===2?'Pair ready':returning()?'Spin for a returning partner':state.pair.length===1?'Spin for the guesser':'Spin for the describer';
    $('remaining').textContent=state.roster.length?`${fresh().length} waiting · ${state.used.size} participated`:'Load the class to begin.';
    $('describer').textContent=state.pair[0]?.name||'Who will give the clues?';$('guesser').textContent=state.pair[1]?.name||'Who will solve the mystery?';
    $('pair-status').textContent=state.seen.size===10?'All ten pictures are complete. Start a new picture deck.':present().length===1?'At least two present students are needed.':state.pair.length===2?'Your pair is ready. Choose a card below.':returning()?'This is the last waiting student. The second spin selects a returning partner.':state.roster.length&&!fresh().length?'Everyone present has participated. Start a new participation round.':'Two spins select two different students.';
    $('roster').querySelectorAll('input').forEach(input=>{input.disabled=busy||active();});renderDeck();
  }
  function renderDeck(){
    $('deck').replaceChildren();state.deck.forEach((d,i)=>{const b=document.createElement('button'),num=document.createElement('span'),label=document.createElement('small');b.type='button';num.textContent=String(i+1).padStart(2,'0');const seen=state.seen.has(d.id);label.textContent=seen?'Visited':i===0?'Guided example':'Mystery destination';b.dataset.used=String(seen);b.dataset.card=String(i);b.setAttribute('aria-label',`Card ${i+1} · ${label.textContent}`);b.disabled=seen||state.pair.length!==2||state.spinning||Boolean(state.card&&!state.demo&&state.card.id!==d.id);b.append(num,label);b.addEventListener('click',()=>openCard(d,false));$('deck').append(b);});
    $('deck-status').textContent=state.seen.size===10?'You have explored all ten destinations. Start a new picture deck to play again.':`${10-state.seen.size} pictures left. Choose both students first. Card 01 has an optional guided example.`;
  }
  function renderRoster(){
    $('roster').replaceChildren();state.roster.forEach(s=>{const label=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.checked=!state.absent.has(s.id);input.addEventListener('change',()=>{if(active()||state.loading){input.checked=!state.absent.has(s.id);return;}input.checked?state.absent.delete(s.id):state.absent.add(s.id);draw();controls();});label.append(input,document.createTextNode(s.name));$('roster').append(label);});
  }
  function closePictures(){if($('zoom').open)$('zoom').close();if($('card').open)$('card').close();$('picture').removeAttribute('src');$('zoom-image').removeAttribute('src');$('picture').alt='';$('zoom-image').alt='';$('answer-name').textContent='';$('answer-detail').textContent='';$('card-roles').textContent='Oral practice';}
  function clearPair(){state.pair=[];state.card=null;state.demo=false;state.revealed=false;closePictures();draw();controls();}
  function clearSession(){state.epoch++;state.controller?.abort();state.controller=null;clearTimeout(state.timer);cancelAnimationFrame(state.frame);stopSounds();state.spinning=false;state.loading=false;state.roster=[];state.absent.clear();state.used.clear();$('attendance').open=false;renderRoster();clearPair();$('roster-status').textContent='Teacher or administrator: sign in above, then load the current class. César and Santiago are excluded.';}
  function sync(){const next=identity();if(next!==account){account=next;clearSession();}}
  window.addEventListener('jaralingua:auth-changed',sync);
  // Full-name data is normalized only for the explicitly requested name exclusions.
  const excluded=name=>name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().split(/[^a-z]+/).some(token=>token==='cesar'||token==='santiago');
  async function loadRoster(){
    sync();if(state.loading||active())return;const current=user();
    if(!current?.credential){$('roster-status').textContent='Sign in with a teacher or administrator account, then try again.';window.JaraLinguaAuth?.openPanel?.();return;}
    if(state.used.size&&!confirm('Reload the class and clear participation history?'))return;
    state.loading=true;controls();$('roster-status').textContent='Loading Basic English 2…';
    const epoch=++state.epoch,session=identity(),controller=new AbortController();state.controller=controller;const timeout=setTimeout(()=>controller.abort(),20000);
    try{
      const response=await fetch('/api/basic2/grades',{cache:'no-store',headers:{Authorization:'Bearer '+current.credential,'X-Jaralingua-Auth-Provider':current.provider||'google'},signal:controller.signal});
      if(!response.ok)throw Error(response.status===401?'Your session expired. Sign in again.':response.status===403?'Only a teacher or administrator can load the class.':'Could not load the class. Please try again.');
      const data=await response.json();if(!['teacher','admin'].includes(data.role)||!Array.isArray(data.students))throw Error('Only a teacher or administrator can load the class.');
      if(epoch!==state.epoch||session!==identity())return;
      const ids=new Set();state.roster=data.students.filter(s=>s.id!=null&&typeof s.fullName==='string'&&s.fullName.trim()&&!excluded(s.fullName)&&!ids.has(String(s.id))&&ids.add(String(s.id))).map(s=>({id:String(s.id),name:s.fullName.trim()}));
      state.absent.clear();state.used.clear();renderRoster();clearPair();$('roster-status').textContent=state.roster.length?`${state.roster.length} eligible students loaded. César and Santiago are excluded. Check attendance before spinning.`:'No eligible students were found. Check the course list.';
    }catch(error){if(epoch===state.epoch&&session===identity())$('roster-status').textContent=error.name==='AbortError'?'Loading timed out. Check your connection and try again.':error.message;}
    finally{clearTimeout(timeout);if(epoch===state.epoch){state.loading=false;state.controller=null;controls();}}
  }
  function spin(){
    sync();if($('spin').disabled||!identity())return;
    if(returning()&&!confirm('Only one student is still waiting. Choose a returning partner for this final pair?'))return;
    const rows=candidates(),index=random(rows.length),selected=rows[index],epoch=state.epoch;draw();state.spinning=true;controls();
    const canvas=$('wheel'),start=performance.now(),duration=3500,angle=(matchMedia('(prefers-reduced-motion: reduce)').matches?360:1800)+360-(index+.5)*360/rows.length;
    function frame(now){if(epoch!==state.epoch||!state.spinning)return;const progress=Math.min(1,(now-start)/duration);canvas.style.transform=`rotate(${angle*(1-(1-progress)**3)}deg)`;if(progress<1)state.frame=requestAnimationFrame(frame);}
    state.frame=requestAnimationFrame(frame);play('wheel');
    state.timer=setTimeout(()=>{sync();if(epoch!==state.epoch||!identity())return;cancelAnimationFrame(state.frame);canvas.style.transform=`rotate(${angle}deg)`;state.pair.push(selected);state.spinning=false;controls();if(state.pair.length===2)$('destinations').scrollIntoView({behavior:'auto',block:'start'});},duration);
  }
  function openCard(d,demo){
    if(state.spinning||(!demo&&state.pair.length!==2))return;
    const same=state.card?.id===d.id&&state.demo===demo;state.card=d;state.demo=demo;if(!same)state.revealed=false;
    $('card-title').textContent=demo?'First example · Practise together':'Mystery destination';
    $('card-roles').textContent=demo?'Learn the two roles':`Describer: ${state.pair[0].name} · Guesser: ${state.pair[1].name}`;
    $('picture-area').hidden=true;$('cover').hidden=false;$('answer').hidden=true;$('model').hidden=true;
    $('model-toggle').hidden=d.id!=='paris';$('model-toggle').textContent='Show the first example';$('finish').textContent=demo?'Finish the example':'Finish round · Next pair';$('finish').disabled=!state.revealed&&!demo;
    $('card').showModal();renderDeck();
  }
  function showPicture(){
    if(!state.card)return;const d=state.card;$('cover').hidden=true;$('picture-area').hidden=false;
    $('image-status').textContent='Loading picture…';$('picture').src=d.src;$('picture').alt='Destination illustration: describe the visible details without saying its name.';
    $('answer').hidden=!state.revealed;$('reveal').disabled=state.revealed;$('finish').disabled=!state.revealed&&!state.demo;play('card');
    if(state.demo){$('model').hidden=false;$('model-toggle').textContent='Hide the example';}
  }
  $('picture').addEventListener('load',()=>{$('image-status').textContent='';});
  $('picture').addEventListener('error',()=>{$('image-status').textContent='The picture could not load. Hide it and show it again to retry.';});
  $('load').addEventListener('click',loadRoster);$('spin').addEventListener('click',spin);
  $('reset').addEventListener('click',()=>{if(state.spinning||state.loading)return;if((state.used.size||active())&&!confirm('Start a new participation round? The current pair will be cleared.'))return;state.used.clear();clearPair();});
  $('shuffle').addEventListener('click',()=>{if(active()||state.loading)return;if(state.seen.size&&!confirm('Make all ten pictures available again?'))return;shuffleDeck();controls();});
  $('example').addEventListener('click',()=>openCard(destinations[0],true));$('show').addEventListener('click',showPicture);
  $('close').addEventListener('click',()=>$('card').close());
  $('card').addEventListener('close',()=>{if(state.demo){state.card=null;state.demo=false;state.revealed=false;}renderDeck();});
  $('hide').addEventListener('click',()=>{$('picture-area').hidden=true;$('cover').hidden=false;});
  $('reveal').addEventListener('click',()=>{if(!state.card)return;state.revealed=true;$('answer-name').textContent=state.card.name;$('answer-detail').textContent=state.card.detail;$('answer').hidden=false;$('finish').disabled=false;$('reveal').disabled=true;play('card');$('answer').scrollIntoView({block:'nearest'});});
  $('model-toggle').addEventListener('click',()=>{$('model').hidden=!$('model').hidden;$('model-toggle').textContent=$('model').hidden?'Show the first example':'Hide the example';});
  $('enlarge').addEventListener('click',()=>{if(!state.card)return;$('zoom-image').src=state.card.src;$('zoom-image').alt=$('picture').alt;$('zoom').showModal();});
  $('zoom-close').addEventListener('click',()=>$('zoom').close());
  $('finish').addEventListener('click',()=>{if(state.demo){$('card').close();return;}if(!state.revealed||state.pair.length!==2)return;state.pair.forEach(s=>state.used.add(s.id));state.seen.add(state.card.id);play('card');clearPair();$('classroom').scrollIntoView({block:'start'});});
  $('sound').addEventListener('click',()=>{state.muted=!state.muted;$('sound').textContent='Sound: '+(state.muted?'off':'on');$('sound').setAttribute('aria-pressed',String(!state.muted));$('sound-status').textContent='';if(state.muted)stopSounds();else play('card');});
  $('login').addEventListener('click',()=>window.JaraLinguaAuth?.openPanel?.());const syncLogin=()=>{$('login').parentElement.hidden=Boolean(document.querySelector('.jaralingua-auth-nav .auth-trigger'));};new MutationObserver(syncLogin).observe(document.querySelector('.navbar'),{childList:true,subtree:true});syncLogin();
  shuffleDeck();draw();controls();
})();
