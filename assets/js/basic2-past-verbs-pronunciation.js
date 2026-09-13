(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const DATA = '/assets/data/basic2-unit4-past-verbs-pronunciation.json?v=20260912-1';
  const API = '/api/english-basic/pronunciation-assessment';
  const SUBMIT = '/api/basic2/unit4-past-verbs-step-by-step/submit';
  const PREFIX = 'jaralingua:basic2:past-verbs-step-by-step:v1:';
  let data, state, owner, busy = false, sending = false, recorder, stream, context, frame, interval;
  let startTime = 0, peak = 0, blob = null, playbackURL = null, speed = .75, audioSequence = 0;
  const model = $('modelAudio');
  const tokens = text => String(text).toLowerCase().match(/[a-z]+(?:'[a-z]+)?/g) || [];
  const user = () => window.JaraLinguaAuth?.getUser?.() || window.JaraLinguaCurrentUser || null;
  const identity = () => String(user()?.email || user()?.id || 'guest').toLowerCase();
  const fresh = () => ({index:0, scores:Array.from({length:data.stages.length},()=>null), pending:null, receipt:null});
  const stage = () => data.stages[state.index];
  const completed = () => state.scores.filter(Boolean).length;
  const average = scores => Math.round(scores.reduce((sum,s)=>sum+s.overall,0)/scores.length);
  function load() {
    let saved;
    try { saved = JSON.parse(localStorage.getItem(PREFIX+owner)); } catch (_) {}
    state = fresh();
    if (saved && Array.isArray(saved.scores) && saved.scores.length === data.stages.length) {
      state.index = Math.max(0,Math.min(data.stages.length-1,Number(saved.index)||0));
      state.scores = saved.scores.map((s,i)=>s && Number.isFinite(s.overall) && s.overall>=0 && s.overall<=100 && s.referenceText===data.stages[i].text ? s : null);
      state.pending = saved.pending || null; state.receipt = saved.receipt || null;
    }
  }
  function save() {
    try { localStorage.setItem(PREFIX+owner,JSON.stringify(state)); $('saveStatus').textContent='Scores and progress saved in this browser. Your current recording is available until you change the challenge or reload.'; }
    catch (_) { $('saveStatus').textContent='This browser could not save progress. Keep this tab open until you send your report.'; }
  }
  function text(id,value) { $(id).textContent=value; }
  function setControls() {
    for (const id of ['recordButton','stageSelect','previousButton','retryButton','resetButton','microphoneSelect','modelButton']) $(id).disabled=busy||sending;
    $('previousButton').disabled=busy||sending||state.index===0;
    $('nextButton').disabled=busy||sending||!state.scores[state.index];
    $('stopButton').disabled=!recorder||recorder.state!=='recording';
    $('retryAnalysis').disabled=busy||sending;
    document.querySelectorAll('#groupTabs button,[data-speed]').forEach(b=>b.disabled=busy||sending);
    $('submitButton').disabled=busy||sending||completed()!==39||Boolean(state.receipt);
  }
  function renderWords(states=[]) {
    $('readingText').replaceChildren();
    stage().text.split(/\s+/).forEach((word,i)=>{
      const b=document.createElement('button'); b.type='button'; b.className='reading-word '+(states[i]||''); b.textContent=word;
      b.title='Listen to '+word; b.addEventListener('click',()=>{if(!busy)play(data.wordAudio[tokens(word)[0]],word);});
      $('readingText').append(b,document.createTextNode(' '));
    });
  }
  function progress() {
    text('completionCount',`${completed()} of 39 completed`); $('completionBar').value=completed();
    $('groupScores').replaceChildren();
    data.groups.forEach(g=>{
      const scores=state.scores.filter((s,i)=>s&&data.stages[i].group===g.id);
      const p=document.createElement('p'),strong=document.createElement('strong'); strong.textContent=g.sound;
      p.append(strong,document.createTextNode(scores.length?`${average(scores)}/100 · ${scores.length}/13`:'Not started')); $('groupScores').append(p);
    });
    text('overallScore',completed()===39?`Final result: ${average(state.scores)}/100`:'Complete all 39 challenges for your final result.');
    $('attemptHistory').replaceChildren();
    state.scores.forEach((s,i)=>{if(!s)return;const p=document.createElement('p');p.textContent=`${i+1}. ${data.stages[i].text} — Best: ${s.overall}/100. Heard: ${s.transcript||'(no words recognized)'}`;$('attemptHistory').append(p);});
    if(state.receipt)text('submitStatus',`Submitted to teacher on ${new Date(state.receipt.submittedAt).toLocaleString()}. No course grade assigned.`);
    else if(!sending)text('submitStatus',completed()===39?'Report ready. Sign in with your registered account to send it.':'Complete all 39 challenges first.');
    setControls();
  }
  function stopModel() {audioSequence++;model.pause();}
  function render() {
    stopModel();blob=null;$('retryAnalysis').hidden=true;
    if(playbackURL){URL.revokeObjectURL(playbackURL);playbackURL=null;}
    $('studentAudio').pause();$('studentAudio').removeAttribute('src');$('studentAudio').hidden=true;
    const s=stage(),g=data.groups.find(g=>g.id===s.group),offset=state.index%13;
    text('ruleTitle',`Remember the rule: ${g.sound}`);text('ruleText',g.rule);text('ruleTip',g.tip);
    text('stageCounter',`${s.kind==='word'?'Verb '+(offset+1)+' of 10':'Sentence '+(offset-9)+' of 3'} · ${g.sound}`);
    text('baseForm',s.base?`${s.base} → ${s.text}`:'Now use the past verb in context.');
    $('stageSelect').value=String(state.index);
    document.querySelectorAll('#groupTabs button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.group===s.group)));
    renderWords();$('attemptResult').hidden=true;text('timer','00:00');
    text('recordStatus',state.scores[state.index]?`Saved best: ${state.scores[state.index].overall}/100. Record again or continue.`:'Say only the word or sentence shown. Take your time.');
    text('audioStatus','Tap any word to hear it separately.');
    text('nextButton',state.index===38?'View my result':'Next →');progress();
  }
  async function play(url,label) {
    if(!url){text('audioStatus','This model is unavailable. Please try again later.');return;}
    stopModel();const sequence=audioSequence;
    model.src=url;model.playbackRate=speed;
    try {await model.play();if(sequence===audioSequence)text('audioStatus',`Listening: ${label} · ${speed}×`);}
    catch (_) {if(sequence===audioSequence)text('audioStatus','Audio could not play. Check your connection and tap again.');}
  }
  // Token alignment, not phoneme assessment. Deliberately no timing/fluency penalty.
  function assess(reference,transcript) {
    const expected=tokens(reference),heard=tokens(transcript),n=expected.length,m=heard.length;
    const dp=Array.from({length:n+1},()=>Array(m+1).fill(0));
    for(let i=0;i<=n;i++)dp[i][0]=i;for(let j=0;j<=m;j++)dp[0][j]=j;
    for(let i=1;i<=n;i++)for(let j=1;j<=m;j++)dp[i][j]=Math.min(dp[i-1][j]+1,dp[i][j-1]+1,dp[i-1][j-1]+(expected[i-1]===heard[j-1]?0:1));
    const states=Array(n).fill('is-missed');let i=n,j=m;
    while(i||j){if(i&&j&&dp[i][j]===dp[i-1][j-1]+(expected[i-1]===heard[j-1]?0:1)){if(expected[i-1]===heard[j-1])states[i-1]='is-correct';i--;j--;}else if(i&&dp[i][j]===dp[i-1][j]+1)i--;else j--;}
    const accuracy=Math.max(0,Math.round((1-dp[n][m]/Math.max(n,m,1))*100));
    const completeness=Math.round(states.filter(s=>s==='is-correct').length/Math.max(n,1)*100);
    return {overall:Math.round(accuracy*.7+completeness*.3),accuracy,completeness,states,missedWords:expected.filter((_,i)=>states[i]==='is-missed')};
  }
  async function analyze() {
    if(!blob||busy)return;
    busy=true;setControls();$('retryAnalysis').hidden=true;text('recordStatus','Checking your recording…');
    const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),45000);
    try {
      const response=await fetch(API,{method:'POST',headers:{'Content-Type':blob.type||'audio/webm'},body:blob,signal:controller.signal});
      const payload=await response.json().catch(()=>({}));
      if(!response.ok)throw new Error('The audio service could not check this attempt. Retry analysis or record again.');
      const language=String(payload.language_code||payload.language||'').toLowerCase();
      if(language&&!language.startsWith('en'))throw new Error('The service returned a different language. Retry English analysis; no score was saved.');
      const transcript=String(payload.text||'').trim();
      if(!transcript&&peak<.003)throw new Error('The recording was silent. Check your microphone and record again.');
      const result=assess(stage().text,transcript);
      const attempt={...result,transcript,referenceText:stage().text,stage:stage().id,at:new Date().toISOString()};delete attempt.states;
      const previous=state.scores[state.index];
      if(!previous||attempt.overall>=previous.overall){state.scores[state.index]=attempt;state.receipt=null;state.pending=null;}
      save();renderWords(result.states);$('attemptResult').hidden=false;
      text('transcript','You said: '+(transcript||'(No words were recognized.)'));
      text('attemptScore',`This attempt: ${result.overall}/100 · Best: ${state.scores[state.index].overall}/100`);
      text('feedback',result.missedWords.length?`Listen again to ${result.missedWords.join(', ')}. Review the ${data.groups.find(g=>g.id===stage().group).sound} rule above. You may repeat or continue.`:'All target words were recognized. Compare your recording with the model to check the final sound.');
      text('recordStatus','Attempt checked. You can continue, regardless of your score.');progress();
    } catch(error) {
      text('recordStatus',error.name==='AbortError'?'Analysis timed out. Your recording is still here: retry analysis.':error.message);$('retryAnalysis').hidden=false;
    } finally {clearTimeout(timeout);busy=false;setControls();if(identity()!==owner)switchAccount();}
  }
  function releaseMic() {
    clearInterval(interval);cancelAnimationFrame(frame);stream?.getTracks().forEach(t=>t.stop());stream=null;
    if(context){context.close().catch(()=>{});context=null;}$('inputLevel').value=0;
  }
  async function populateInputs() {
    try{const devices=await navigator.mediaDevices.enumerateDevices(),selected=$('microphoneSelect').value;
      $('microphoneSelect').replaceChildren(new Option('Default microphone',''));
      devices.filter(d=>d.kind==='audioinput').forEach((d,i)=>$('microphoneSelect').add(new Option(d.label||`Microphone ${i+1}`,d.deviceId)));
      if([...$('microphoneSelect').options].some(o=>o.value===selected))$('microphoneSelect').value=selected;
    }catch(_){}
  }
  async function record() {
    if(busy||sending)return;
    await switchAccount();
    if(!isSecureContext||!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder){text('recordStatus','Recording needs HTTPS and a supported browser (Chrome, Edge, Safari or Firefox).');$('micHelp').open=true;return;}
    stopModel();$('studentAudio').pause();busy=true;setControls();text('recordStatus','Allow microphone access in the browser prompt…');
    try {
      const requestedOwner=owner;
      const constraints={echoCancellation:true,noiseSuppression:true,autoGainControl:true};
      if($('microphoneSelect').value)constraints.deviceId={exact:$('microphoneSelect').value};
      stream=await navigator.mediaDevices.getUserMedia({audio:constraints});
      if(owner!==requestedOwner){releaseMic();throw new Error('Your account changed. Please record again.');}
      await populateInputs();
      peak=0;
      try{context=new (window.AudioContext||window.webkitAudioContext)();context.resume().catch(()=>{});const analyser=context.createAnalyser();context.createMediaStreamSource(stream).connect(analyser);analyser.fftSize=1024;const values=new Uint8Array(analyser.fftSize);const tick=()=>{analyser.getByteTimeDomainData(values);let sum=0;for(const v of values)sum+=((v-128)/128)**2;const rms=Math.sqrt(sum/values.length);peak=Math.max(peak,rms);$('inputLevel').value=Math.min(100,rms*700);frame=requestAnimationFrame(tick);};tick();}catch(_){peak=1;}
      const mime=['audio/webm;codecs=opus','audio/mp4','audio/webm','audio/ogg;codecs=opus'].find(t=>MediaRecorder.isTypeSupported(t));
      recorder=new MediaRecorder(stream,mime?{mimeType:mime}:{});const chunks=[];let failed=false;
      recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
      recorder.onerror=()=>{failed=true;releaseMic();busy=false;text('recordStatus','Recording failed. Please try again.');setControls();};
      recorder.onstop=()=>{
        const type=recorder.mimeType;releaseMic();busy=false;setControls();if(failed)return;
        blob=new Blob(chunks,{type});if(blob.size<400){text('recordStatus','No usable audio was captured. Try recording again.');return;}
        if(playbackURL)URL.revokeObjectURL(playbackURL);playbackURL=URL.createObjectURL(blob);$('studentAudio').src=playbackURL;$('studentAudio').hidden=false;analyze();
      };
      startTime=Date.now();recorder.start();setControls();text('recordStatus','Recording… Speak slowly, then press Stop and check.');
      interval=setInterval(()=>{const sec=Math.floor((Date.now()-startTime)/1000);text('timer',`${String(Math.floor(sec/60)).padStart(2,'0')}:${String(sec%60).padStart(2,'0')}`);if(sec>=30&&recorder.state==='recording')recorder.stop();},250);
    } catch(error){releaseMic();busy=false;text('recordStatus',error.name==='NotAllowedError'?'Microphone access was denied. Allow it in site settings and try again.':error.name==='NotFoundError'?'No microphone found. Connect a microphone and try again.':error.name==='OverconstrainedError'?'That microphone is no longer available. Select Default microphone and retry.':'Could not start recording. Close other recording apps and try again.');$('micHelp').open=true;setControls();}
  }
  async function switchAccount() {
    if(!data)return;
    const nextOwner=identity();if(nextOwner===owner)return;
    if(busy||sending){text('saveStatus','Account changed. Finish this operation before continuing.');return;}
    const guest=owner==='guest'&&completed()>0?state:null;
    owner=nextOwner;load();
    if(guest&&owner!=='guest'&&completed()===0&&confirm('Use the practice you just completed on this device for this signed-in account?')){state=guest;state.receipt=null;state.pending=null;save();}
    render();
  }
  async function submit() {
    if(sending||busy||completed()!==39)return;
    await switchAccount();if(completed()!==39)return;
    const active=user();
    if(!active?.credential){text('submitStatus','Sign in above, then press Send to teacher again.');window.JaraLinguaAuth?.openPanel?.();return;}
    sending=true;setControls();
    if(!state.pending){state.pending={id:crypto.randomUUID(),scores:structuredClone(state.scores)};save();}
    const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),45000);
    text('submitStatus','Sending your report… Please keep this tab open.');
    try {
      const response=await fetch(SUBMIT,{method:'POST',signal:controller.signal,headers:{'Content-Type':'application/json',Authorization:'Bearer '+active.credential,'X-Jaralingua-Auth-Provider':active.provider||'google'},body:JSON.stringify({clientSubmissionId:state.pending.id,stageScores:state.pending.scores})});
      const payload=await response.json().catch(()=>({}));
      if(response.status===401){window.JaraLinguaAuth?.openPanel?.();throw new Error('Your session expired. Sign in again and retry. Your report is saved.');}
      if(response.status===403)throw new Error('This account is not registered in Basic English 2. Ask your teacher to check your email.');
      if(!response.ok||payload.ok!==true||!payload.submittedAt)throw new Error('No confirmed receipt was received. Retry; the same report will not be duplicated.');
      state.receipt={submittedAt:payload.submittedAt};state.pending=null;save();progress();
      text('submitStatus',`Submitted to teacher on ${new Date(payload.submittedAt).toLocaleString()}. No course grade assigned.`);
    }catch(error){text('submitStatus',error.name==='AbortError'?'Sending timed out. Retry to check or complete the same delivery; your report is saved.':error.message);}
    finally{clearTimeout(timeout);sending=false;setControls();}
  }
  async function init() {
    document.querySelectorAll('.past-shell button').forEach(b=>b.disabled=true);
    try {
      const response=await fetch(DATA);if(!response.ok)throw new Error();data=await response.json();
      if(data.stages.length!==39)throw new Error();owner=identity();load();
      data.groups.forEach(g=>{const b=document.createElement('button');b.type='button';b.dataset.group=g.id;b.textContent=`${g.sound} · 10 verbs + 3 phrases`;b.addEventListener('click',()=>{state.index=data.stages.findIndex(s=>s.group===g.id);save();render();});$('groupTabs').append(b);});
      data.stages.forEach((s,i)=>$('stageSelect').add(new Option(`${i+1}. ${s.text}`,String(i))));
      $('stageSelect').addEventListener('change',()=>{state.index=Number($('stageSelect').value);save();render();});
      $('modelButton').addEventListener('click',()=>play(stage().audio,stage().text));
      document.querySelectorAll('[data-speed]').forEach(b=>b.addEventListener('click',()=>{speed=Number(b.dataset.speed);model.playbackRate=speed;document.querySelectorAll('[data-speed]').forEach(n=>n.setAttribute('aria-pressed',String(n===b)));}));
      $('recordButton').addEventListener('click',record);$('stopButton').addEventListener('click',()=>{if(recorder?.state==='recording'){recorder.stop();$('stopButton').disabled=true;}});
      $('retryAnalysis').addEventListener('click',analyze);$('retryButton').addEventListener('click',record);
      $('previousButton').addEventListener('click',()=>{if(state.index>0)state.index--;save();render();$('stageCounter').scrollIntoView({behavior:'smooth',block:'center'});});
      $('nextButton').addEventListener('click',()=>{if(!state.scores[state.index])return;if(state.index<38){state.index++;save();render();$(state.index%13===0?'ruleTitle':'stageCounter').scrollIntoView({behavior:'smooth',block:'center'});}else{$('overallScore').scrollIntoView({behavior:'smooth',block:'center'});}});
      $('resetButton').addEventListener('click',()=>{if(confirm('Reset the scores saved on this device? Reports already sent to your teacher will not be deleted.')){state=fresh();save();render();}});
      $('submitButton').addEventListener('click',submit);
      window.addEventListener('jaralingua:auth-changed',switchAccount);
      // Reconcile late auth initialization without polling or sharing another student's scores.
      window.addEventListener('focus',switchAccount);
      render();populateInputs();
    } catch(_){text('recordStatus','The activity could not load. Check your connection and reload this page.');}
  }
  window.addEventListener('pagehide',()=>{stopModel();if(recorder?.state==='recording'){recorder.onstop=null;recorder.stop();}releaseMic();});
  init();
})();
