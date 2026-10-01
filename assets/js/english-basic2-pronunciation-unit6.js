/* Unit 6: recognition-based practice, ungraded teacher report. No browser TTS. */
(() => {
  'use strict';
  const { stages, words } = window.Basic2FoodPronunciation;
  const $ = id => document.getElementById(id);
  const KEY = 'jaralingua:basic2:food-pronunciation:v1:';
  const ENDPOINT = '/api/basic2/unit6-food-pronunciation/submit';
  const ASSESS = '/api/english-basic/pronunciation-assessment';
  const reading = $('readingText'), model = $('modelAudio'), mic = $('micButton');
  const status = $('recordStatus'), transcript = $('liveTranscript'), results = $('results');
  const audio = new Audio();
  let speed = 1, index = 0, scores = Array(7).fill(null), busy = false, recording = false;
  let recorder, stream, chunks, started = 0, duration = 0, timer, context, frame;
  let lastBlob = null, objectURL = '', receipt = null, pending = null, sending = false;
  let owner = identity(user());

  function user() {
    const active = window.JaraLinguaAuth?.getUser?.() || window.JaraLinguaCurrentUser;
    if (active?.credential) return active;
    for (const provider of ['google', 'microsoft', 'local']) {
      try {
        const key = `jaralingua_${provider}_user`;
        const saved = JSON.parse(sessionStorage.getItem(key) || localStorage.getItem(key) || 'null');
        if (saved?.credential && Number(saved.exp) > Date.now()/1000) return { ...saved, provider };
      } catch (_) { /* Do not erase another component's session. */ }
    }
    return null;
  }
  function identity(value) { return String(value?.email || value?.sub || 'guest').toLowerCase(); }
  function escape(value) { return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function normalize(word) { return word.toLowerCase().replace(/’/g,"'").replace(/[^a-z']/g,''); }
  function tokens(text) { return text.split(/\s+/).map(normalize).filter(Boolean); }
  function readSaved(account = owner) {
    try { return JSON.parse(localStorage.getItem(KEY+account) || 'null'); } catch (_) { return null; }
  }
  function save() {
    try { localStorage.setItem(KEY+owner, JSON.stringify({index,scores,receipt,pending})); }
    catch (_) { status.textContent = 'Browser storage is unavailable. Keep this page open until you send your report.'; }
  }
  function restore(saved) {
    scores = stages.map((s,i) => saved?.scores?.[i]?.referenceText === s.text ? saved.scores[i] : null);
    index = Math.max(0, Math.min(6, Number(saved?.index)||0));
    if (index > scores.findIndex(s=>!s) && scores.some(s=>!s)) index = scores.findIndex(s=>!s);
    receipt = saved?.receipt || null; pending = saved?.pending || null;
  }
  restore(readSaved());

  const navigation = document.createElement('div');
  navigation.className = 'stage-panel';
  navigation.innerHTML = '<strong id="stageTitle"></strong><nav id="stageProgress" aria-label="Practice sections"></nav>';
  reading.before(navigation);
  const micTools = document.createElement('div');
  micTools.className = 'food-mic-tools';
  micTools.innerHTML = '<label for="microphoneSelect">Microphone</label><select id="microphoneSelect"><option value="">Default microphone</option></select><label for="inputLevel">Input level</label><meter id="inputLevel" min="0" max="1" value="0"></meter>';
  mic.before(micTools);
  const help = document.createElement('p'); help.className='food-audio-status'; help.setAttribute('aria-live','polite');
  reading.after(help);
  const actions = document.createElement('div'); actions.className='food-next-actions';
  actions.innerHTML='<button type="button" id="retryAnalysis" hidden>Retry this recording</button><button type="button" id="nextSection" hidden>Next section →</button>';
  $('studentAudio').after(actions);
  const delivery = document.createElement('section'); delivery.className='pronunciation-panel food-delivery';
  delivery.innerHTML = '<h2>Send to teacher</h2><p>Send a written report: your seven scores, transcripts, and words to review. Recordings are available for your own replay on this page; they are not uploaded with the report. This is ungraded and does not change your course average.</p><p id="deliverySummary"></p><button type="button" id="sendReport" class="action-button">Send to teacher</button><p id="deliveryStatus" role="status"></p>';
  document.querySelector('.pronunciation-layout aside').append(delivery);

  function markReceiptChanged() { receipt=null; pending=null; }
  function render() {
    const current=stages[index], score=scores[index];
    $('stageTitle').textContent=current.label;
    $('stageProgress').innerHTML=stages.map((s,i)=>`<button type="button" data-stage="${i}" aria-label="${escape(s.label)}${scores[i] ? ', '+scores[i].overall+' out of 100' : ''}" aria-current="${i===index?'step':'false'}" ${i>0&&!scores.slice(0,i).every(Boolean)?'disabled':''}>${i===6?'Final':i+1}${scores[i]?' · '+scores[i].overall:''}</button>`).join('');
    const states = score ? align(tokens(current.text),tokens(score.transcript)).states : [];
    reading.innerHTML=current.text.split(/\s+/).map((word,i)=>`<button class="reading-word ${states[i]||''}" type="button" data-model-word="${escape(word)}" aria-label="Listen to ${escape(word)}">${escape(word)}</button>`).join(' ');
    model.pause(); model.src=current.audio; model.playbackRate=speed;
    $('modelButton').setAttribute('aria-label','Play the whole section');
    $('modelButton').innerHTML='<i class="bi bi-volume-up-fill"></i>';
    transcript.textContent=score?.transcript || 'Your transcription will appear here after the analysis.';
    results.hidden=!score;
    $('nextSection').hidden=!score || index===6;
    $('nextSection').textContent=index===5?'Go to the final challenge →':'Next section →';
    if(score) {
      $('resultTitle').textContent=current.label;
      $('overallScore').textContent=score.overall;
      $('scoreRing').style.setProperty('--score',score.overall);
      $('accuracyScore').textContent=score.accuracy+'%';
      $('completenessScore').textContent=score.completeness+'%';
      $('fluencyScore').textContent=score.wpm;
      $('feedback').innerHTML=`<p>${score.overall>=88?'Most words matched the model. Keep grouping words naturally.':'Listen again, then read in short word groups. These words were not matched:'}</p><div class="food-review-words">${[...new Set(score.missedWords)].map(w=>`<button type="button" data-model-word="${escape(w)}">${escape(w)}</button>`).join(' ')}</div><p>Latest attempt saved. You may retry or continue, regardless of your score.</p>`;
    }
    updateDelivery(); controls();
  }
  function updateDelivery() {
    const done=scores.filter(Boolean).length;
    $('deliverySummary').textContent=`${done}/7 sections completed${done===7?' · Average: '+Math.round(scores.reduce((a,s)=>a+s.overall,0)/7)+'/100':''}`;
    $('sendReport').disabled=done!==7 || sending || busy || recording || !!receipt;
    $('sendReport').textContent=sending?'Sending…':receipt?'Submitted to teacher':'Send to teacher';
    if(receipt) $('deliveryStatus').textContent=`Submitted to teacher · ${new Date(receipt.submittedAt).toLocaleString()} · Receipt: ${receipt.clientSubmissionId}`;
  }
  function controls() {
    mic.disabled=recording||busy||sending;
    mic.classList.toggle('is-recording',recording);
    $('stopButton').disabled=!recording;
    $('resetButton').disabled=recording||busy||sending;
    $('microphoneSelect').disabled=recording||busy;
    $('modelButton').disabled=recording||busy;
    $('nextSection').disabled=recording||busy||sending;
    $('retryAnalysis').disabled=recording||busy;
    document.querySelectorAll('[data-model-word]').forEach(b=>b.disabled=recording||busy);
    document.querySelectorAll('[data-stage]').forEach(b=>b.disabled=recording||busy||sending||(Number(b.dataset.stage)>0&&!scores.slice(0,Number(b.dataset.stage)).every(Boolean)));
    updateDelivery();
  }
  function stopPlayback() { model.pause(); audio.pause(); $('studentAudio').pause(); }
  async function wordAudio(word) {
    if(recording||busy) return;
    const slug=normalize(word).replace(/'/g,'');
    if(!words[slug]) { help.textContent='This word model is unavailable. Please tell your teacher.'; return; }
    stopPlayback(); audio.src=words[slug]; audio.playbackRate=speed;
    try { await audio.play(); help.textContent=`Listening: ${word}`; }
    catch (_) { help.textContent='The audio could not play. Check your connection and tap the word again.'; }
  }
  audio.addEventListener('error',()=>{help.textContent='The word audio could not load. Please retry.';});
  model.addEventListener('error',()=>{help.textContent='The section audio could not load. Please retry.';});
  document.addEventListener('click',event=>{const b=event.target.closest('[data-model-word]'); if(b) wordAudio(b.dataset.modelWord);});
  document.querySelectorAll('[data-speed]').forEach(b=>b.addEventListener('click',()=>{
    speed=Number(b.dataset.speed); model.playbackRate=speed; audio.playbackRate=speed;
    document.querySelectorAll('[data-speed]').forEach(c=>{c.classList.toggle('is-active',Number(c.dataset.speed)===speed);c.setAttribute('aria-pressed',Number(c.dataset.speed)===speed);});
  }));
  $('modelButton').addEventListener('click',async()=>{
    if(recording||busy) return;
    const paused=model.paused; stopPlayback();
    if(paused) {try {model.playbackRate=speed;await model.play();help.textContent='Listening to the whole section.';} catch(_){help.textContent='Could not play. Tap again to retry.';}}
  });
  function align(reference,spoken) {
    // Normalize common ASR expansions without penalizing "I would" vs "I'd".
    const canonical = text=>text.replace(/\bi would\b/g,"i'd").replace(/\bwas not\b/g,"wasn't");
    spoken=tokens(canonical(spoken.join(' ')));
    const dp=Array.from({length:reference.length+1},(_,i)=>Array.from({length:spoken.length+1},(_,j)=>i?j?0:i:j));
    for(let i=1;i<=reference.length;i++) for(let j=1;j<=spoken.length;j++) dp[i][j]=Math.min(dp[i-1][j]+1,dp[i][j-1]+1,dp[i-1][j-1]+(reference[i-1]===spoken[j-1]?0:1));
    let i=reference.length,j=spoken.length,matches=0; const states=reference.map(()=> 'is-missed');
    while(i||j) {
      if(i&&j&&dp[i][j]===dp[i-1][j-1]+(reference[i-1]===spoken[j-1]?0:1)) {if(reference[i-1]===spoken[j-1]) {states[i-1]='is-correct';matches++;} i--;j--;}
      else if(i&&dp[i][j]===dp[i-1][j]+1) i--; else j--;
    }
    return {matches,states,distance:dp[reference.length][spoken.length],spokenLength:spoken.length};
  }
  function evaluate(text) {
    const ref=tokens(stages[index].text), spoken=tokens(text), result=align(ref,spoken);
    const clamp=n=>Math.max(0,Math.min(100,Math.round(n)));
    const accuracy=clamp(100*(1-result.distance/Math.max(ref.length,result.spokenLength)));
    const completeness=clamp(100*result.matches/ref.length);
    scores[index]={stage:stages[index].label,referenceText:stages[index].text,transcript:text,accuracy,completeness,fluency:null,wpm:Math.min(300,Math.round(spoken.length/Math.max(1/60,duration/60000))),overall:clamp(.7*accuracy+.3*completeness),missedWords:ref.filter((_,i)=>result.states[i]==='is-missed'),final:index===6,at:new Date().toISOString()};
    markReceiptChanged(); save(); render(); status.textContent='Attempt saved. Review your result; you can continue or retry.';
  }
  async function request(url, options, timeout=45000) {
    const controller=new AbortController(), handle=setTimeout(()=>controller.abort(),timeout);
    try {const response=await fetch(url,{...options,signal:controller.signal});const payload=await response.json().catch(()=>({}));return {response,payload};}
    catch(error) {throw new Error(error.name==='AbortError'?'The connection took too long. Your work is kept here; please retry.':'Connection failed. Your work is kept here; please retry.');}
    finally {clearTimeout(handle);}
  }
  async function analyze() {
    if(!lastBlob||busy) return;
    busy=true; controls(); $('retryAnalysis').hidden=true; status.textContent='Analyzing your English recording…';
    try {
      const {response,payload}=await request(ASSESS,{method:'POST',headers:{'Content-Type':lastBlob.type},body:lastBlob},120000);
      if(!response.ok) throw new Error(response.status===413?'This recording is too large. Record a shorter take.':'The recording could not be analyzed. Retry this recording.');
      const language=String(payload.language_code||payload.language||'').toLowerCase();
      if(language && !language.startsWith('en')) throw new Error('English analysis was not returned. Retry this recording.');
      const text=String(payload.text||'').trim();
      if(!text) throw new Error('No English words were recognized. Listen to your recording, check the input level, and try again.');
      evaluate(text);
    } catch(error) {status.textContent=error.message; $('retryAnalysis').hidden=false;}
    finally {busy=false;controls();}
  }
  async function devices() {
    try {const selected=$('microphoneSelect').value; const items=await navigator.mediaDevices?.enumerateDevices();
      $('microphoneSelect').innerHTML='<option value="">Default microphone</option>'+(items||[]).filter(d=>d.kind==='audioinput').map((d,i)=>`<option value="${escape(d.deviceId)}">${escape(d.label||'Microphone '+(i+1))}</option>`).join('');
      if([...$('microphoneSelect').options].some(o=>o.value===selected)) $('microphoneSelect').value=selected;
    } catch(_) { /* Default input remains usable. */ }
  }
  function release() {
    clearInterval(timer); cancelAnimationFrame(frame); stream?.getTracks().forEach(t=>t.stop()); stream=null;
    if(context) context.close().catch(()=>{}); context=null; $('inputLevel').value=0;
  }
  async function start() {
    if(busy||recording||sending) return;
    stopPlayback(); busy=true; controls(); status.textContent='Allow microphone access when your browser asks.';
    try {
      if(!window.isSecureContext || !navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) throw new Error('Recording needs HTTPS and an updated browser with microphone support.');
      if(window.JaraMicPermissions) {
        const ready=await window.JaraMicPermissions.ensureReady({micButton:mic,stopButton:$('stopButton'),recordStatus:status,recordHelp:document.querySelector('.record-help'),unsupported:$('unsupported'),localUrl:location.href,language:'en'});
        if(!ready) {busy=false;controls();return;}
      }
      const selected=$('microphoneSelect').value;
      const constraints=window.JaraMicPermissions?.audioConstraints(selected)||{echoCancellation:{ideal:true},noiseSuppression:{ideal:true},autoGainControl:{ideal:true},channelCount:{ideal:1},...(selected?{deviceId:{exact:selected}}:{})};
      stream=await navigator.mediaDevices.getUserMedia({audio:constraints,video:false});
      await devices();
      const AudioCtx=window.AudioContext||window.webkitAudioContext;
      if(AudioCtx) {
        context=new AudioCtx(); await context.resume(); const analyser=context.createAnalyser(); analyser.fftSize=256;
        context.createMediaStreamSource(stream).connect(analyser); const bytes=new Uint8Array(analyser.fftSize);
        const meter=()=>{if(!context)return;analyser.getByteTimeDomainData(bytes);$('inputLevel').value=Math.min(1,Math.sqrt(bytes.reduce((s,x)=>s+((x-128)/128)**2,0)/bytes.length)*5);frame=requestAnimationFrame(meter);};meter();
      }
      chunks=[]; lastBlob=null; $('retryAnalysis').hidden=true;
      const type=['audio/webm;codecs=opus','audio/mp4','audio/webm'].find(t=>MediaRecorder.isTypeSupported(t));
      recorder=type?new MediaRecorder(stream,{mimeType:type}):new MediaRecorder(stream);
      recorder.ondataavailable=e=>{if(e.data.size) chunks.push(e.data);};
      let failed=false;
      recorder.onerror=()=>{failed=true;recording=false;busy=false;release();status.textContent='Recording was interrupted. Please record again.';controls();};
      recorder.onstop=async()=>{
        release();recording=false;busy=false;
        if(failed) {controls();return;}
        lastBlob=new Blob(chunks,{type:recorder.mimeType||type||'audio/webm'});
        if(!lastBlob.size) {status.textContent='The recording was empty. Please try again.';controls();return;}
        if(objectURL) URL.revokeObjectURL(objectURL);
        objectURL=URL.createObjectURL(lastBlob);$('studentAudio').src=objectURL;$('studentAudio').hidden=false;
        await analyze();
      };
      started=Date.now(); recorder.start(250); recording=true;busy=false;controls();
      status.textContent='Recording. Read the text, then press Finish and evaluate.';
      timer=setInterval(()=>{const elapsed=Math.floor((Date.now()-started)/1000);$('timer').textContent=String(Math.floor(elapsed/60)).padStart(2,'0')+':'+String(elapsed%60).padStart(2,'0');if(elapsed>=180)finish();},250);
    } catch(error) {
      release();busy=false;recording=false;
      const messages={NotAllowedError:'Microphone permission is blocked. Allow it in your browser site settings, then try again.',NotFoundError:'No microphone was found. Connect one and retry.',NotReadableError:'Another app may be using the microphone. Close it and try again.',OverconstrainedError:'That microphone is unavailable. Select Default microphone.'};
      status.textContent=messages[error.name]||error.message;
      document.querySelector('.record-help').textContent='iPhone/iPad: allow Microphone in this website’s browser settings. Android/Chrome/Edge: open site permissions and allow Microphone. Also check your device privacy settings.';
      controls();
    }
  }
  function finish() {if(recorder?.state!=='recording')return;duration=Date.now()-started;recording=false;busy=true;controls();recorder.stop();}
  function changeStage(next) {
    if(recording||busy||sending||next<0||next>6||!scores.slice(0,next).every(Boolean))return;
    stopPlayback();index=next;lastBlob=null;$('retryAnalysis').hidden=true;$('studentAudio').hidden=true;
    if(objectURL) URL.revokeObjectURL(objectURL);objectURL='';$('studentAudio').removeAttribute('src');$('timer').textContent='00:00';
    save();render();status.textContent='Ready · '+stages[index].label;
  }
  async function submit() {
    if(sending||busy||recording||receipt||!scores.every(Boolean))return;
    const account=user();
    if(!account?.credential) {$('deliveryStatus').textContent='Sign in above to send your report. Your practice is saved.';window.JaraLinguaAuth?.openPanel?.();return;}
    if(identity(account)!==owner) {authChanged();return;}
    if(!pending) pending={clientSubmissionId:crypto.randomUUID?.()||Date.now()+'-'+Math.random().toString(16).slice(2),stageScores:scores.map(s=>({...s})),activityTitle:'Basic 2 Unit 6 - Fabulous Food Pronunciation Studio'};
    save();sending=true;controls();$('deliveryStatus').textContent='Sending your report. Wait for the confirmation.';
    try {
      const {response,payload}=await request(ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+account.credential,'X-Jaralingua-Auth-Provider':account.provider||'google'},body:JSON.stringify(pending)});
      if(response.status===401) {window.JaraLinguaAuth?.openPanel?.();throw new Error('Your session expired. Sign in again, then retry. Your report is saved.');}
      if(response.status===403) throw new Error('This account is not on the Basic English 2 roster. Ask your teacher to check your account.');
      if(!response.ok||payload.ok!==true||!payload.submittedAt||payload.clientSubmissionId!==pending.clientSubmissionId) throw new Error('Submission was not confirmed. Retry to obtain a receipt; your report is saved.');
      receipt={submittedAt:payload.submittedAt,clientSubmissionId:payload.clientSubmissionId};pending=null;save();
    } catch(error) {$('deliveryStatus').textContent=error.message;}
    finally {sending=false;controls();}
  }
  function authChanged() {
    const next=identity(user());if(next===owner)return;
    if(busy||recording||sending) return; // Checked again before delivery; never submit under a changed owner.
    save();const guest=owner==='guest'&&scores.some(Boolean);const previous={index,scores,receipt:null,pending:null};owner=next;
    const existing=readSaved();
    if(guest&&next!=='guest'&&!existing&&window.confirm('Use the practice completed on this page for '+next+'?')) restore(previous);
    else restore(existing);
    lastBlob=null;$('studentAudio').hidden=true;$('retryAnalysis').hidden=true;save();render();
    $('deliveryStatus').textContent=receipt?'Submitted report restored.':'Account changed. Practice is saved separately for each account.';
  }
  $('stageProgress').addEventListener('click',e=>{const b=e.target.closest('[data-stage]');if(b)changeStage(Number(b.dataset.stage));});
  $('nextSection').addEventListener('click',()=>changeStage(index+1));
  mic.addEventListener('click',start);$('stopButton').addEventListener('click',finish);
  $('retryAnalysis').addEventListener('click',analyze);$('sendReport').addEventListener('click',submit);
  $('resetButton').textContent='Try this section again';
  $('resetButton').addEventListener('click',()=>{changeStage(index);status.textContent='Press the microphone to try again. Your saved result stays until a new attempt is evaluated.';});
  window.addEventListener('jaralingua:auth-changed',authChanged);
  window.addEventListener('pagehide',()=>{save();release();stopPlayback();});
  navigator.mediaDevices?.addEventListener?.('devicechange',devices);
  document.querySelector('[data-speed="1"]').click();render();devices();
})();
