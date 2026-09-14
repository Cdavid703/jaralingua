(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  const state={cards:[],roster:[],absent:new Set(),used:new Set(),seen:new Set(),sessions:new Map(),active:-1,spinning:false,muted:false,loading:false,teacher:false,epoch:0};
  const effects={flip:new Audio('audio/unit5/yesterday-pictures/card-flip.wav'),wheel:new Audio('audio/unit5/yesterday-pictures/roulette.wav')};
  Object.values(effects).forEach(a=>a.preload='auto');
  const user=()=>window.JaraLinguaAuth?.getUser?.()||window.JaraLinguaCurrentUser||null;
  const identity=()=>{const u=user();return u?.credential?`${u.provider||'google'}:${u.email||''}:${u.credential}`:'';};
  let account=identity(),controller=null,spinTimer=null;
  const pool=()=>state.roster.filter(s=>!state.absent.has(s.id)&&!state.used.has(s.id));
  const session=()=>state.sessions.get(state.active);
  const message=t=>{$('rosterStatus').textContent=t;};
  function sfx(kind){if(state.muted)return;const a=effects[kind];a.pause();a.currentTime=0;a.play().catch(()=>message('Sound could not start. Check media volume or tap Sound to retry.'));}
  function labels(target,card){target.replaceChildren();card.labels.forEach((label,i)=>{const el=document.createElement('span');el.append(document.createTextNode(label));if(card.facts[i]){const b=document.createElement('b');b.textContent=card.facts[i];el.append(b);}target.append(el);});}
  function controls(){
    const s=session(),ready=pool();
    $('loadRoster').disabled=state.loading||state.spinning;
    $('resetRound').disabled=state.loading||state.spinning||!state.roster.length;
    $('remaining').textContent=`${ready.length} ready · ${state.used.size} selected this round`;
    $('spinStudent').disabled=state.spinning||!s||!!s.winner||!ready.length;
    $('closeCard').disabled=state.spinning;
    $('revealQuestion').disabled=state.spinning||!s?.winner;
    $('revealQuestion').textContent=s?.revealed?'Hide question':'Show question';
    $('nextQuestion').disabled=state.spinning||!s?.winner||!s?.revealed;
    $('nextQuestion').textContent=s?.q===1?'Finish this card':'Next question →';
    $('modalResetRound').hidden=ready.length>0||!state.roster.length;
    $('modalResetRound').disabled=state.spinning;
    $('winner').textContent=state.spinning?'Choosing…':s?.winner?.name||(ready.length?'Who is next?':state.roster.length?'Everyone has had a turn. Start a new round.':'Load the class list first.');
    $('questionNumber').textContent=`Question ${Math.min((s?.q||0)+1,2)} of 2`;
    const q=s&&state.cards[state.active]?.questions[s.q];
    $('questionText').textContent=s?.revealed&&q?q.question:s?.winner?'Teacher: show the question when the student is ready.':'Look closely. Choose a student, then show one question.';
    $('answerKey').hidden=!state.teacher||!s?.revealed;
    $('answerText').textContent=state.teacher&&s?.revealed&&q?q.answer:'';
    document.querySelectorAll('#roster input').forEach(el=>el.disabled=state.spinning||state.loading);
  }
  function drawWheel(){
    const canvas=$('wheel'),ctx=canvas.getContext('2d'),students=pool(),n=students.length||1;
    const colors=['#12677b','#bd7b20','#234466','#287867','#a74365','#426f96'];
    canvas.style.transition='none';canvas.style.transform='rotate(0deg)';void canvas.offsetWidth;canvas.style.transition='';
    ctx.clearRect(0,0,500,500);
    for(let i=0;i<n;i++){
      const a=i*2*Math.PI/n-Math.PI/2,b=(i+1)*2*Math.PI/n-Math.PI/2;
      ctx.beginPath();ctx.moveTo(250,250);ctx.arc(250,250,238,a,b);ctx.closePath();ctx.fillStyle=colors[i%colors.length];ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.stroke();
      if(n<=28){ctx.save();ctx.translate(250,250);ctx.rotate((a+b)/2);ctx.textAlign='right';ctx.fillStyle='#fff';ctx.font=`bold ${n>16?13:17}px system-ui`;ctx.fillText(students[i]?.name.split(' ').slice(0,2).join(' ').slice(0,19)||'Load class',220,6);ctx.restore();}
    }
    ctx.beginPath();ctx.arc(250,250,40,0,2*Math.PI);ctx.fillStyle='#fff';ctx.fill();ctx.fillStyle='#173e56';ctx.textAlign='center';ctx.font='bold 20px system-ui';ctx.fillText(String(students.length),250,257);
  }
  function renderDeck(){
    $('deck').replaceChildren();state.cards.forEach((card,i)=>{const b=document.createElement('button');b.type='button';b.className='cp-card'+(state.seen.has(i)?' seen':'');b.setAttribute('aria-label',`Open card ${i+1}${state.seen.has(i)?', completed':''}`);const small=document.createElement('small'),num=document.createElement('strong'),note=document.createElement('span');small.textContent='COMPARE THE PAST';num.textContent=String(i+1).padStart(2,'0');note.textContent=state.seen.has(i)?'Completed · revisit':'Turn the card';b.append(small,num,note);b.addEventListener('click',()=>openCard(i));$('deck').append(b);});
    $('cardCount').textContent=`${state.seen.size} of ${state.cards.length} cards completed`;
  }
  function openCard(index){
    state.active=index;let s=session();if(!s||s.q>=2){s={q:0,winner:null,revealed:false};state.sessions.set(index,s);}
    const card=state.cards[index];$('answerKey').open=false;$('cardTitle').textContent=`Card ${index+1} · ${card.title}`;$('sceneTime').textContent=card.time;
    $('sceneError').hidden=true;$('sceneImage').src=card.image;$('sceneImage').alt=card.alt;labels($('sceneLabels'),card);
    $('enlargeScene').classList.remove('concealed');$('hideScene').textContent='Hide picture';$('hideScene').setAttribute('aria-pressed','false');
    $('modelAudio').pause();drawWheel();controls();sfx('flip');$('cardDialog').showModal();$('cardDialog').scrollTop=0;
    const visual=document.querySelector('.cp-visual');visual.classList.remove('revealing');void visual.offsetWidth;visual.classList.add('revealing');
  }
  function spin(){
    const s=session(),students=pool();if(state.spinning||!s||s.winner||!students.length)return;
    const random=new Uint32Array(1);crypto.getRandomValues(random);const index=Math.floor(random[0]/4294967296*students.length),chosen=students[index],epoch=state.epoch;
    drawWheel();state.spinning=true;$('answerKey').open=false;sfx('wheel');const rotation=1800+(360-(index+.5)*360/students.length)%360;$('wheel').style.transform=`rotate(${rotation}deg)`;controls();
    spinTimer=setTimeout(()=>{if(epoch!==state.epoch)return;state.spinning=false;s.winner=chosen;state.used.add(chosen.id);controls();},3500);
  }
  function nextQuestion(){const s=session();if(state.spinning||!s?.winner||!s.revealed)return;s.q++;s.winner=null;s.revealed=false;$('answerKey').open=false;if(s.q===2){state.seen.add(state.active);$('cardDialog').close();renderDeck();renderRoster();}drawWheel();controls();}
  function renderRoster(){
    $('roster').replaceChildren();for(const student of state.roster){const label=document.createElement('label'),box=document.createElement('input');box.type='checkbox';box.checked=!state.absent.has(student.id);box.addEventListener('change',()=>{if(box.checked)state.absent.delete(student.id);else state.absent.add(student.id);drawWheel();controls();});label.append(box,document.createTextNode(student.name));$('roster').append(label);}
  }
  function clearClass(){state.epoch++;controller?.abort();clearTimeout(spinTimer);effects.wheel.pause();state.spinning=false;state.loading=false;state.teacher=false;state.roster=[];state.used.clear();state.absent.clear();state.sessions.clear();if(state.active>=0)state.sessions.set(state.active,{q:0,winner:null,revealed:false});$('answerKey').open=false;renderRoster();drawWheel();controls();}
  async function loadRoster(){
    if(state.loading||state.spinning)return;const u=user(),startIdentity=identity();
    if(!u?.credential){message('Sign in with the Basic English 2 teacher account, then retry.');window.JaraLinguaAuth?.openPanel?.();return;}
    if(state.used.size&&!confirm('Reload the class and restart participation?'))return;
    account=startIdentity;state.loading=true;controls();message('Loading Basic English 2 students…');const epoch=state.epoch;
    controller=new AbortController();const requestController=controller,timer=setTimeout(()=>requestController.abort(),20000);
    try{
      const response=await fetch('/api/basic2/grades',{headers:{Authorization:'Bearer '+u.credential,'X-Jaralingua-Auth-Provider':u.provider||'google'},signal:requestController.signal});
      if(!response.ok)throw Error(response.status===401?'Your session expired. Sign in again, then retry.':response.status===403?'Only the authorized teacher can load this class.':'The class list could not be loaded. Please retry.');
      const data=await response.json();if(epoch!==state.epoch||identity()!==startIdentity)return;
      if(!['admin','teacher'].includes(data.role)||!Array.isArray(data.students))throw Error('Only the authorized teacher can load this class.');
      const ids=new Set(),roster=[];for(const student of data.students){const id=String(student.id??'').trim(),name=String(student.fullName??'').trim();if(id&&name&&!ids.has(id)){ids.add(id);roster.push({id,name});}}
      if(!roster.length)throw Error('No students were returned for Basic English 2. Please check the roster.');
      state.roster=roster;state.teacher=true;state.used.clear();state.absent.clear();state.sessions.clear();if(state.active>=0)state.sessions.set(state.active,{q:0,winner:null,revealed:false});
      renderRoster();drawWheel();message(`${roster.length} students loaded. Uncheck anyone who is absent.`);
    }catch(error){if(epoch===state.epoch)message(error.name==='AbortError'?'Loading took too long. Please retry.':error.message);}
    finally{clearTimeout(timer);if(epoch===state.epoch){state.loading=false;controls();}}
  }
  function resetRound(){if(state.spinning||state.loading||!state.roster.length)return;if(state.used.size&&!confirm('Allow all present students to take another turn?'))return;state.used.clear();for(const s of state.sessions.values()){s.winner=null;s.revealed=false;}$('answerKey').open=false;drawWheel();controls();}
  function zoom(image,alt,card,title){$('zoomImage').src=image;$('zoomImage').alt=alt;$('zoomTitle').textContent=title;labels($('zoomLabels'),card);$('imageDialog').showModal();$('imageDialog').scrollTop=0;}
  async function loadCards(){
    $('retryCards').hidden=true;$('loadStatus').textContent='Loading the cards…';const cardController=new AbortController(),timer=setTimeout(()=>cardController.abort(),20000);
    try{const response=await fetch('/assets/data/basic2-compare-the-past.json?v=20260914-1',{signal:cardController.signal});if(!response.ok)throw Error('Cards unavailable');const data=await response.json();if(data.cards?.length!==12||data.cards.some(c=>c.questions?.length!==2))throw Error('Invalid cards');state.cards=data.cards;renderDeck();$('loadStatus').textContent='';}catch(e){$('loadStatus').textContent='The cards could not load. Check your connection and retry.';$('retryCards').hidden=false;}finally{clearTimeout(timer);}
  }
  $('loadRoster').addEventListener('click',loadRoster);$('spinStudent').addEventListener('click',spin);$('nextQuestion').addEventListener('click',nextQuestion);$('resetRound').addEventListener('click',resetRound);$('modalResetRound').addEventListener('click',resetRound);$('retryCards').addEventListener('click',loadCards);
  $('revealQuestion').addEventListener('click',()=>{const s=session();if(!s?.winner||state.spinning)return;s.revealed=!s.revealed;$('answerKey').open=false;controls();});
  $('closeCard').addEventListener('click',()=>{if(!state.spinning)$('cardDialog').close();});$('cardDialog').addEventListener('cancel',e=>{if(state.spinning)e.preventDefault();});
  $('hideScene').addEventListener('click',()=>{const hidden=$('enlargeScene').classList.toggle('concealed');$('hideScene').textContent=hidden?'Show picture':'Hide picture';$('hideScene').setAttribute('aria-pressed',String(hidden));if(!hidden)sfx('flip');});
  $('enlargeScene').addEventListener('click',()=>{if($('enlargeScene').classList.contains('concealed'))return;const c=state.cards[state.active];zoom(c.image,c.alt,c,c.time+' · '+c.title);});
  $('enlargeModel').addEventListener('click',()=>zoom('/assets/img/english-basic-2/compare-the-past/model.png','A green hat and a yellow hat',{labels:['A · Green hat','B · Yellow hat'],facts:['USD $20','USD $35']},'Model · Last Saturday'));
  $('closeImage').addEventListener('click',()=>$('imageDialog').close());
  function toggleSound(){state.muted=!state.muted;document.querySelectorAll('[data-sound],#soundToggle').forEach(b=>{b.textContent=state.muted?'Sound: off':'Sound: on';b.setAttribute('aria-pressed',String(!state.muted));});if(state.muted)Object.values(effects).forEach(a=>a.pause());else sfx('flip');}
  $('soundToggle').addEventListener('click',toggleSound);const modalSound=document.createElement('button');modalSound.type='button';modalSound.className='cp-btn secondary';modalSound.dataset.sound='';modalSound.setAttribute('aria-pressed','true');modalSound.textContent='Sound: on';modalSound.addEventListener('click',toggleSound);document.querySelector('.cp-visual>.cp-toolbar').append(modalSound);
  const model=$('modelAudio');model.playbackRate=.75;
  $('playModel').addEventListener('click',()=>{if(!model.paused){model.pause();return;}Object.values(effects).forEach(a=>a.pause());model.play().catch(()=>{$('audioStatus').textContent='Audio could not start. Check your connection and tap Listen again.';});});
  model.addEventListener('play',()=>{$('audioStatus').textContent='Playing the example.';$('playModel').textContent='Pause example';});model.addEventListener('pause',()=>{$('playModel').textContent='Listen to the example';});model.addEventListener('ended',()=>{$('audioStatus').textContent='Now try the response aloud.';});
  document.querySelectorAll('[data-speed]').forEach(b=>b.addEventListener('click',()=>{model.playbackRate=Number(b.dataset.speed);document.querySelectorAll('[data-speed]').forEach(x=>{const active=x===b;x.classList.toggle('active',active);x.setAttribute('aria-pressed',String(active));});$('audioStatus').textContent=`Speed: ${b.dataset.speed}×.`;}));
  $('sceneImage').addEventListener('error',()=>{$('sceneError').hidden=false;});
  window.addEventListener('jaralingua:auth-changed',()=>{const next=identity();if(next!==account){account=next;clearClass();message('Account changed. Load the Basic English 2 class again.');}});
  window.addEventListener('pagehide',()=>{clearTimeout(spinTimer);state.spinning=false;controller?.abort();Object.values(effects).forEach(a=>a.pause());model.pause();});
  window.addEventListener('pageshow',()=>{drawWheel();controls();});
  drawWheel();controls();loadCards();
})();
