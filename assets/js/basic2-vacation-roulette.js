/* Classroom-only oral preparation. No grade, submission or roster persistence. */
(() => {
  'use strict';
  const $ = name => document.getElementById('hr-' + name);
  const questions = [
    {id:'place', name:'1 · Place', text:'Where did you go on your last vacation?', hint:'Last…, I went to…'},
    {id:'time', name:'2 · Time', text:'When did you go?', hint:'I went in… / I went …ago.'},
    {id:'company', name:'3 · Company', text:'Who did you travel with?', hint:'I traveled with… / I traveled alone.'},
    {id:'activities', name:'4 · Activities', text:'What did you do there?', hint:'First, I… Then, I…'}
  ];
  const state = {roster:[], absent:new Set(), used:new Set(), questionUsed:new Set(), student:null,
    question:null, spinning:false, loading:false, muted:false, epoch:0, spinTimer:null, controller:null};
  const sounds = {
    wheel:new Audio('/ingles/basico-2/audio/unit5/yesterday-pictures/roulette.wav'),
    turn:new Audio('/ingles/basico-2/audio/unit5/yesterday-pictures/card-flip.wav')
  };
  Object.values(sounds).forEach(a => { a.preload = 'auto'; a.volume = .65; });
  function play(which) {
    if (state.muted) return;
    const a = sounds[which]; a.currentTime = 0;
    const attempt = a.play();
    attempt?.catch(() => { $('sound-status').textContent = 'Sound was blocked. Check the device volume and tap Sound off, then Sound on to try again.'; });
  }
  function stopSounds() { Object.values(sounds).forEach(a => { a.pause(); a.currentTime = 0; }); }
  const user = () => window.JaraLinguaAuth?.getUser?.() || window.JaraLinguaCurrentUser;
  const identity = () => {const u = user(); return u?.credential ? (u.provider || 'google') + ':' + u.credential : '';};
  let account = identity();
  const candidates = () => state.roster.filter(s => !state.absent.has(s.id) && !state.used.has(s.id));
  const questionCandidates = () => questions.filter(q => !state.questionUsed.has(q.id));
  const active = () => state.spinning || Boolean(state.student || state.question);
  function randomIndex(n) {
    const values = new Uint32Array(1), ceiling = Math.floor(4294967296 / n) * n;
    do { crypto.getRandomValues(values); } while (values[0] >= ceiling);
    return values[0] % n;
  }
  function draw(canvas, entries, empty) {
    canvas.classList.remove('hr-spinning'); canvas.style.transform = 'rotate(0deg)';
    const ctx = canvas.getContext('2d'), size = canvas.width, mid = size / 2;
    ctx.clearRect(0,0,size,size);
    const palette = ['#155d76','#763c68','#3d586f','#756020','#236959','#533d7c'];
    const rows = entries.length ? entries : [{name:empty}];
    const step = Math.PI * 2 / rows.length;
    rows.forEach((row,i) => {
      const start = -Math.PI/2 + i*step;
      ctx.beginPath(); ctx.moveTo(mid,mid); ctx.arc(mid,mid,mid-5,start,start+step); ctx.closePath();
      ctx.fillStyle = palette[i % palette.length]; ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth=2; ctx.stroke();
      ctx.save(); ctx.translate(mid,mid); ctx.rotate(start+step/2); ctx.textAlign='right'; ctx.fillStyle='#fff';
      ctx.font = 'bold ' + (rows.length>24?13:rows.length>12?16:22) + 'px Arial';
      const label = rows.length>32 ? String(i+1) : row.name.length>22 ? row.name.slice(0,20)+'…' : row.name;
      ctx.fillText(label,mid-24,7,mid-52); ctx.restore();
    });
    ctx.beginPath(); ctx.arc(mid,mid,18,0,2*Math.PI); ctx.fillStyle='#fff'; ctx.fill();
  }
  function drawWheels() {
    draw($('student-wheel'),candidates(),'Load class');
    draw($('question-wheel'),questionCandidates(),'Questions');
  }
  function controls() {
    const busy = state.spinning || state.loading, ready = candidates().length;
    $('load').disabled = busy || active(); $('load').textContent = state.loading ? 'Loading students…' : 'Load Basic English 2 students';
    $('reset').disabled = busy || !state.roster.length;
    $('spin-student').disabled = busy || !ready || Boolean(state.student);
    $('spin-question').disabled = busy || !ready || !state.student || Boolean(state.question);
    $('next').disabled = $('enlarge').disabled = busy || !state.student || !state.question;
    $('roster').querySelectorAll('input').forEach(input => { input.disabled = busy || active(); });
    $('remaining').textContent = state.roster.length ? `${ready} ready · ${state.used.size} completed${!ready ? ' · Start a new participation round when ready.' : ''}` : 'Load the class to begin.';
    $('question-cycle').textContent = `${questionCandidates().length} questions left in this cycle · no repeats until all four have been used.`;
  }
  function renderTurn() {
    $('student-result').textContent = state.student?.name || 'Who will speak?';
    $('turn-student').textContent = state.student ? state.student.name : 'Spin both wheels to begin.';
    $('question-result').textContent = state.question?.text || (state.student ? 'Now spin the question wheel.' : 'Your question will appear here.');
    $('hint').hidden = !state.question; $('hint').open = false;
    $('hint-text').textContent = state.question?.hint || '';
  }
  function renderRoster() {
    $('roster').replaceChildren();
    state.roster.forEach(s => {
      const label = document.createElement('label'), input = document.createElement('input');
      input.type='checkbox'; input.checked=!state.absent.has(s.id);
      input.addEventListener('change', () => {
        if (active()) {input.checked=!state.absent.has(s.id); return;}
        input.checked ? state.absent.delete(s.id) : state.absent.add(s.id); drawWheels(); controls();
      });
      label.append(input, document.createTextNode(s.name)); $('roster').append(label);
    });
  }
  function clearTurn() {state.student=null; state.question=null; $('dialog').close(); renderTurn(); drawWheels(); controls();}
  function clearSession() {
    state.epoch++; state.controller?.abort(); state.controller=null;
    clearTimeout(state.spinTimer); stopSounds(); state.spinning=false; state.loading=false;
    state.roster=[]; state.absent.clear(); state.used.clear(); state.questionUsed.clear();
    $('attendance').open=false; renderRoster(); clearTurn();
    $('roster-status').textContent='Teacher or administrator: sign in above, then load the current course list.';
  }
  function syncAccount() {const next=identity(); if(next!==account) {account=next; clearSession();}}
  window.addEventListener('jaralingua:auth-changed',syncAccount);
  async function loadRoster() {
    syncAccount();
    if (state.loading || active()) return;
    const current = user();
    if (!current?.credential) { $('roster-status').textContent='Sign in with your teacher or administrator account, then try again.'; window.JaraLinguaAuth?.openPanel?.(); return; }
    if (state.used.size && !window.confirm('Reloading clears this participation round. Continue?')) return;
    state.loading=true; controls(); $('roster-status').textContent='Loading the current Basic English 2 class…';
    const epoch=++state.epoch, session=identity(), controller=new AbortController(); state.controller=controller;
    const timeout=setTimeout(()=>controller.abort(),20000);
    try {
      const response=await fetch('/api/basic2/grades',{cache:'no-store',headers:{Authorization:'Bearer '+current.credential,'X-Jaralingua-Auth-Provider':current.provider||'google'},signal:controller.signal});
      if(!response.ok) throw Error(response.status===401 ? 'Your session expired. Sign in again, then load the class.' : response.status===403 ? 'Only a teacher or administrator can load the course list.' : 'The class could not be loaded. Please try again.');
      const data=await response.json();
      if (!['teacher','admin'].includes(data.role) || !Array.isArray(data.students)) throw Error('Only a teacher or administrator can load the course list.');
      if(epoch!==state.epoch || session!==identity()) return;
      const ids=new Set();
      state.roster=data.students.filter(s=>s.id!=null && typeof s.fullName==='string' && s.fullName.trim() && !ids.has(String(s.id)) && ids.add(String(s.id))).map(s=>({id:String(s.id),name:s.fullName.trim()}));
      state.absent.clear(); state.used.clear(); state.questionUsed.clear(); renderRoster(); clearTurn();
      $('roster-status').textContent=state.roster.length ? `${state.roster.length} students loaded. Open “Who is here?” to uncheck absent students.` : 'No students were found in this course. Ask the administrator to check the course list.';
    } catch(error) {
      if(epoch===state.epoch && session===identity()) $('roster-status').textContent=error.name==='AbortError' ? 'Loading timed out. Check your connection and try again.' : error.message;
    } finally {
      clearTimeout(timeout);
      if(epoch===state.epoch) {state.controller=null; state.loading=false; controls();}
    }
  }
  function spin(kind) {
    syncAccount();
    if(state.spinning || state.loading || !state.roster.length || (kind==='student' && state.student) || (kind==='question' && (!state.student || state.question))) return;
    const rows=kind==='student'?candidates():questionCandidates(); if(!rows.length) return;
    const index=randomIndex(rows.length), selected=rows[index], canvas=$(kind+'-wheel'), epoch=state.epoch;
    state.spinning=true; controls(); draw(canvas,rows,'');
    // Selection and wheel geometry use the same frozen list throughout the spin.
    void canvas.offsetWidth; canvas.classList.add('hr-spinning');
    canvas.style.transform=`rotate(${1800+360-(index+.5)*360/rows.length}deg)`;
    play('wheel');
    const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    state.spinTimer=setTimeout(()=>{
      syncAccount();
      if(epoch!==state.epoch || !identity()) return;
      state[kind]=selected; state.spinning=false; renderTurn(); controls();
      if(reduced) sounds.wheel.pause();
    },reduced?100:3050);
  }
  $('load').addEventListener('click',loadRoster);
  $('spin-student').addEventListener('click',()=>spin('student'));
  $('spin-question').addEventListener('click',()=>spin('question'));
  $('next').addEventListener('click',()=>{
    if(state.spinning || !state.student || !state.question) return;
    state.used.add(state.student.id); state.questionUsed.add(state.question.id);
    if(state.questionUsed.size===questions.length) state.questionUsed.clear();
    play('turn'); clearTurn();
  });
  $('reset').addEventListener('click',()=>{
    if(state.spinning || state.loading) return;
    if((state.used.size || active()) && !confirm('Start a new participation round? All present students will become eligible again.')) return;
    state.used.clear(); state.questionUsed.clear(); clearTurn();
  });
  $('enlarge').addEventListener('click',()=>{
    if(!state.student || !state.question || state.spinning) return;
    $('dialog-student').textContent=state.student.name; $('dialog-question').textContent=state.question.text; $('dialog').showModal();
  });
  $('dialog-close').addEventListener('click',()=>$('dialog').close());
  $('sound').addEventListener('click',()=>{
    state.muted=!state.muted; $('sound').textContent='Sound: '+(state.muted?'off':'on'); $('sound').setAttribute('aria-pressed',String(!state.muted));
    $('sound-status').textContent=''; if(state.muted) stopSounds(); else play('turn');
  });
  $('login').addEventListener('click',()=>window.JaraLinguaAuth?.openPanel?.());
  const syncLogin=()=>{$('login').parentElement.hidden=Boolean(document.querySelector('.jaralingua-auth-nav .auth-trigger'));};
  new MutationObserver(syncLogin).observe(document.querySelector('.navbar'),{childList:true,subtree:true}); syncLogin();
  let seconds=900, deadline=0, tick=null;
  function updateTimer() {
    if(deadline) seconds=Math.max(0,Math.ceil((deadline-Date.now())/1000));
    $('timer').textContent=String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0');
    if(deadline && seconds===0) {clearInterval(tick); deadline=0; $('timer-start').textContent='Start preparation'; $('duration').disabled=false; $('timer-status').textContent='Preparation is complete. Your teacher can begin the speaking rounds.';}
  }
  function resetTimer() {
    clearInterval(tick); deadline=0; seconds=Number($('duration').value)*60; $('duration').disabled=false;
    $('timer-start').textContent='Start preparation'; $('timer-status').textContent='';
    $('prep-instruction').textContent=`You have ${$('duration').value} minutes to prepare your answers orally.`; updateTimer();
  }
  $('duration').addEventListener('change',resetTimer); $('timer-reset').addEventListener('click',resetTimer);
  $('timer-start').addEventListener('click',()=>{
    if(deadline) {updateTimer(); clearInterval(tick); deadline=0; $('timer-start').textContent='Resume preparation'; $('timer-status').textContent='Preparation timer paused.';}
    else {if(!seconds) seconds=Number($('duration').value)*60; deadline=Date.now()+seconds*1000; $('duration').disabled=true; $('timer-start').textContent='Pause preparation'; $('timer-status').textContent='Preparation time is running.'; tick=setInterval(updateTimer,250); updateTimer();}
  });
  renderTurn(); drawWheels(); controls();
})();
