(() => {
  'use strict';
  const cards=window.YESTERDAY_PICTURES;
  const $=id=>document.getElementById(id);
  const state={roster:[],absent:new Set(),used:new Set(),seen:new Set(),active:-1,question:0,winner:null,spinning:false,rotation:0,muted:false};
  const sound={flip:new Audio('audio/unit5/yesterday-pictures/card-flip.wav'),wheel:new Audio('audio/unit5/yesterday-pictures/roulette.wav')};
  Object.values(sound).forEach(a=>a.preload='auto');
  function playSound(kind){if(state.muted)return;const a=sound[kind];a.pause();a.currentTime=0;a.play().catch(()=>{$('rosterStatus').textContent='Sound could not start. Check media volume or tap Sound to retry.';});}
  function pool(){return state.roster.filter(s=>!state.absent.has(s.id)&&!state.used.has(s.id));}
  function setScene(el,index){el.style.backgroundImage=`url('../../assets/img/english-basic-2/yesterday-pictures/${cards[index].pair}.png')`;el.style.backgroundPosition=index%2?'100% 0':'0 0';el.setAttribute('aria-label',`${cards[index].title}, picture ${index%2?'B':'A'}`);}
  function controls(){
    $('spinStudent').disabled=state.spinning||!!state.winner||!pool().length;
    $('nextQuestion').disabled=state.spinning||!state.winner;
    $('nextQuestion').textContent=state.question===0?'Next question →':'Finish this card';
    $('closeCard').disabled=state.spinning;
    $('loadRoster').disabled=state.spinning;
    $('remaining').textContent=`${pool().length} ready · ${state.used.size} participated`;
    $('questionText').textContent=state.winner?cards[state.active].questions[state.question][0]:'Choose a student to reveal the question.';
    $('questionNumber').textContent=`Question ${state.question+1} of 2`;
    $('winner').textContent=state.spinning?'Choosing…':state.winner?state.winner.name:pool().length?'Who is next?':state.roster.length?'Everyone available has participated. Start a new round below.':'Load the class list first.';
    $('answerKey').hidden=!state.winner;
    if(state.active>=0)$('answerText').textContent=cards[state.active].questions[state.question][1];
  }
  function drawWheel(){
    const canvas=$('wheel'),ctx=canvas.getContext('2d'),students=pool(),n=students.length||1;
    const colors=['#12677b','#e9b958','#234466','#71b9a8','#b85879','#5287a4'];
    ctx.clearRect(0,0,500,500);
    students.length||ctx.clearRect(0,0,500,500);
    for(let i=0;i<n;i++){
      const a=i*2*Math.PI/n-Math.PI/2,b=(i+1)*2*Math.PI/n-Math.PI/2;
      ctx.beginPath();ctx.moveTo(250,250);ctx.arc(250,250,238,a,b);ctx.closePath();ctx.fillStyle=colors[i%colors.length];ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.stroke();
      if(n<=28){ctx.save();ctx.translate(250,250);ctx.rotate((a+b)/2);ctx.textAlign='right';ctx.fillStyle='#fff';ctx.font=`bold ${n>16?13:17}px system-ui`;ctx.fillText(students[i]?.name.split(' ').slice(0,2).join(' ').slice(0,19)||'Load class',220,6);ctx.restore();}
    }
    ctx.beginPath();ctx.arc(250,250,40,0,2*Math.PI);ctx.fillStyle='#fff';ctx.fill();ctx.fillStyle='#173e56';ctx.textAlign='center';ctx.font='bold 20px system-ui';ctx.fillText(String(students.length),250,257);
  }
  function renderDeck(){
    $('deck').replaceChildren();cards.forEach((card,i)=>{const b=document.createElement('button');b.type='button';b.className='yp-card'+(state.seen.has(i)?' seen':'');b.setAttribute('aria-label',`Open card ${i+1}${state.seen.has(i)?', completed':''}`);b.innerHTML=`<small>YESTERDAY</small><strong>${String(i+1).padStart(2,'0')}</strong><span>${state.seen.has(i)?'Viewed · open again':'Turn the card'}</span>`;b.addEventListener('click',()=>{b.classList.add('flipping');playSound('flip');openCard(i);});$('deck').appendChild(b);});
    $('pairs').replaceChildren();for(let p=0;p<6;p++){const b=document.createElement('button');b.className='yp-btn secondary';b.type='button';b.textContent=`Compare ${2*p+1} & ${2*p+2}`;b.disabled=!state.seen.has(2*p)||!state.seen.has(2*p+1);b.addEventListener('click',()=>{setScene($('compareA'),p*2);setScene($('compareB'),p*2+1);$('compareTitle').textContent=cards[p*2].title+' · compare';$('compareDialog').showModal();});$('pairs').appendChild(b);}
    $('cardCount').textContent=`${state.seen.size} of 12 cards completed`;
  }
  function openCard(index){state.active=index;state.question=0;state.winner=null;$('answerKey').open=false;$('cardTitle').textContent=`Card ${index+1} · ${cards[index].title} · Yesterday`;setScene($('scene'),index);drawWheel();controls();$('cardDialog').showModal();$('scene').classList.remove('is-revealing');void $('scene').offsetWidth;$('scene').classList.add('is-revealing');$('cardDialog').scrollTop=0;}
  function spin(){
    if(state.spinning||state.winner)return;const students=pool();if(!students.length)return;
    const random=new Uint32Array(1);crypto.getRandomValues(random);const index=Math.floor(random[0]/4294967296*students.length),chosen=students[index];
    drawWheel();state.spinning=true;playSound('wheel');
    const target=(360-(index+.5)*360/students.length)%360;
    state.rotation+=1800+((target-state.rotation%360+360)%360);
    $('wheel').style.transform=`rotate(${state.rotation}deg)`;controls();
    state.spinTimer=setTimeout(()=>{state.spinning=false;state.winner=chosen;$('answerKey').open=false;controls();},3000);
  }
  function finishAnswer(){
    if(!state.winner||state.spinning)return;state.used.add(state.winner.id);state.winner=null;$('answerKey').open=false;
    if(state.question===0){state.question=1;drawWheel();controls();}
    else{state.seen.add(state.active);$('cardDialog').close();renderDeck();controls();renderRoster();}
  }
  function renderRoster(){
    $('roster').replaceChildren();for(const s of state.roster){const label=document.createElement('label'),box=document.createElement('input');box.type='checkbox';box.checked=!state.absent.has(s.id);box.addEventListener('change',()=>{if(box.checked)state.absent.delete(s.id);else state.absent.add(s.id);controls();drawWheel();});label.append(box,document.createTextNode(s.name));$('roster').appendChild(label);}
  }
  async function loadRoster(){
    const user=window.JaraLinguaAuth?.getUser?.()||window.JaraLinguaCurrentUser;
    if(!user?.credential){$('rosterStatus').textContent='Sign in with the Course 2 teacher account to load the class.';window.JaraLinguaAuth?.openPanel?.();return;}
    if(state.used.size&&!confirm('Reload the class and start a new participation round?'))return;
    $('loadRoster').disabled=true;$('rosterStatus').textContent='Loading Basic English 2 students…';
    const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),20000);
    try{const r=await fetch('/api/basic2/grades',{headers:{Authorization:'Bearer '+user.credential,'X-Jaralingua-Auth-Provider':user.provider||'google'},signal:controller.signal});if(!r.ok)throw Error(r.status===401?'Sign in again, then retry loading the class.':'The roster could not be loaded. Please try again.');const data=await r.json();if(!['admin','teacher'].includes(data.role)||!Array.isArray(data.students))throw Error('Only the authorized teacher can load the class roster.');const ids=new Set();state.roster=data.students.filter(s=>s.id&&s.fullName&&!ids.has(String(s.id))&&ids.add(String(s.id))).map(s=>({id:String(s.id),name:s.fullName}));state.absent.clear();state.used.clear();state.winner=null;renderRoster();$('rosterStatus').textContent=`${state.roster.length} students loaded. Uncheck anyone who is absent.`;drawWheel();controls();}
    catch(e){$('rosterStatus').textContent=e.name==='AbortError'?'Loading took too long. Please try again.':e.message;}
    finally{clearTimeout(timeout);$('loadRoster').disabled=false;}
  }
  function resetRound(){if(state.spinning)return;if(state.used.size&&!confirm('Let all present students participate again?'))return;state.used.clear();state.winner=null;drawWheel();controls();}
  $('loadRoster').addEventListener('click',loadRoster);$('spinStudent').addEventListener('click',spin);$('nextQuestion').addEventListener('click',finishAnswer);$('resetRound').addEventListener('click',resetRound);$('modalResetRound').addEventListener('click',resetRound);
  $('closeCard').addEventListener('click',()=>{if(!state.spinning)$('cardDialog').close();});$('cardDialog').addEventListener('cancel',e=>{if(state.spinning)e.preventDefault();});$('closeCompare').addEventListener('click',()=>$('compareDialog').close());
  $('soundToggle').addEventListener('click',()=>{state.muted=!state.muted;$('soundToggle').textContent=state.muted?'Sound: off':'Sound: on';$('soundToggle').setAttribute('aria-pressed',String(!state.muted));if(state.muted)Object.values(sound).forEach(a=>a.pause());else playSound('flip');});
  window.addEventListener('jaralingua:auth-changed',()=>{const u=window.JaraLinguaAuth?.getUser?.();if(!u?.credential){clearTimeout(state.spinTimer);sound.wheel.pause();state.spinning=false;state.winner=null;state.roster=[];state.used.clear();state.absent.clear();renderRoster();drawWheel();controls();}});
  renderDeck();drawWheel();controls();
})();
