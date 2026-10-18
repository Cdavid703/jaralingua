/* Unit 1 practice: private per-account drafts, ordered retries and explicit conflicts. */
(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const escape = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const normalize = v => String(v || '').toLowerCase().replaceAll('’', "'").replace(/[^\p{L}\p{N}_\s:]/gu, '').trim();
  const clean = data => { const d = structuredClone(data || {}); delete d.score; return d; };
  const keyFor = u => String(u?.email || u?.sub || '').toLowerCase();
  let content, user, account = '', epoch = 0, cache = {}, active = null, busy = false, ready = false, db;
  let syncTimer, recorder, stream, chunks = [], recordingStart, recordingTimer, recordingStage;
  let sound = false, replayed = false, modelHeard = new Set();
  const status = message => { $('#save-status').textContent = message; };
  function openDB() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open('basic2-adventure-v1', 1);
      req.onupgradeneeded = () => req.result.createObjectStore('drafts');
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  function localRead(key) {
    return new Promise((resolve, reject) => {
      const req = db.transaction('drafts').objectStore('drafts').get(key);
      req.onsuccess = () => resolve(req.result || {}); req.onerror = () => reject(req.error);
    });
  }
  function persist() {
    const snapshot = structuredClone(cache), owner = account;
    return new Promise((resolve, reject) => {
      const tx = db.transaction('drafts', 'readwrite'); tx.objectStore('drafts').put(snapshot, owner);
      tx.oncomplete = resolve; tx.onerror = () => reject(tx.error);
    });
  }
  async function api(path, body, auth = user) {
    const controller = new AbortController(), timeout = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch('/api/basic2/adventure/' + path, {
        method: body ? 'POST' : 'GET', cache: 'no-store', signal: controller.signal,
        headers: {Authorization: 'Bearer ' + auth.credential, 'X-Jaralingua-Auth-Provider': auth.provider || 'google', 'Content-Type': 'application/json'},
        ...(body ? {body: JSON.stringify(body)} : {})
      });
      const result = await response.json();
      if (!response.ok) throw Object.assign(new Error(result.error || 'save_failed'), {code: response.status, result});
      return result;
    } finally { clearTimeout(timeout); }
  }
  function stageById(id) { return content.challenges.flatMap(c => c.stages).find(s => s.id === id); }
  function state(s) { return cache[s.id]?.data || {}; }
  function pending() { return Object.values(cache).some(r => r.dirty || r.pending || r.conflict); }
  async function change(patch) {
    if (!ready || !active) return;
    const id = active.id, old = cache[id] || {revision: 0, data: {}};
    cache[id] = {...old, data: {...old.data, ...patch}, dirty: true, localUpdatedAt: new Date().toISOString(), generation: (old.generation || 0) + 1};
    try { await persist(); status('Saved on this device · syncing to your account…'); }
    catch { status('Device storage is full. Keep this page open and reconnect to save.'); }
    clearTimeout(syncTimer); syncTimer = setTimeout(sync, 600); renderMap();
  }
  async function sync() {
    if (!ready || busy || !user?.credential) return;
    busy = true; const run = epoch;
    try {
      for (const [id, entry] of Object.entries(cache)) {
        if (entry.conflict || (!entry.dirty && !entry.pending)) continue;
        if (!entry.pending) {
          entry.pending = {stage: id, revision: entry.revision || 0, operation: crypto.randomUUID(), data: clean(entry.data)};
          entry.pendingGeneration = entry.generation; await persist();
        }
        const operation = structuredClone(entry.pending), generation = entry.pendingGeneration;
        try {
          const result = await api('save', operation);
          if (run !== epoch) return;
          const current = cache[id];
          current.revision = result.record.revision; current.updatedAt = result.record.updatedAt;
          delete current.pending;
          if (current.generation === generation) { current.data = result.record.data; current.dirty = false; }
          await persist();
        } catch (error) {
          if (run !== epoch) return;
          if (error.code === 409 && error.result?.record) {
            cache[id].conflict = error.result.record; delete cache[id].pending; await persist();
            if (active?.id === id) renderStage();
            status('Another device changed this stage. Choose which version to keep.');
          } else {
            status(error.code === 401 ? 'Session expired. Sign in again; your work stays on this device.' : error.code === 403 ? 'This account is not registered in Basic 2. Contact your teacher.' : error.code === 422 ? 'Cannot sync this stage: ' + error.message.replaceAll('_', ' ') + '. Your device copy is kept.' : 'Saved on this device · waiting for connection. Use Retry sync.');
            return;
          }
        }
      }
      if (run === epoch) {
        status(pending() ? 'Some changes are waiting to sync or need a conflict decision.' : 'All progress saved to your account ✓');
        renderMap();
      }
    } finally {
      busy = false;
      if (run === epoch && Object.values(cache).some(r => r.dirty && !r.conflict && !r.pending)) syncTimer = setTimeout(sync, 1200);
    }
  }
  function stopRecording() {
    if (recorder && recorder.state !== 'inactive') recorder.stop();
    stream?.getTracks().forEach(t => t.stop()); clearInterval(recordingTimer);
  }
  async function loadAccount() {
    const next = window.JaraLinguaAuth?.getUser();
    if (next?.credential && keyFor(next) === account && ready) { user = next; sync(); return; }
    epoch++; const run = epoch; stopRecording(); clearTimeout(syncTimer);
    user = next; account = keyFor(next); cache = {}; active = null; ready = false;
    $('#workspace').innerHTML = ''; $('#teacher-tools').hidden = true; $('#transcript').textContent = ''; $('#account-gate').hidden = Boolean(next?.credential); renderMap();
    if (!next?.credential) { status('Sign in to save and continue your adventure.'); return; }
    status('Loading your saved adventure…');
    try {
      const local = await localRead(account);
      if (run !== epoch) return;
      cache = local;
      const remote = await api('state');
      if (run !== epoch) return;
      for (const [id, record] of Object.entries(remote.records)) {
        if (!cache[id]?.dirty && !cache[id]?.pending) cache[id] = record;
        // Dirty stages are reconciled by revision-checked sync, never silently overwritten.
      }
      ready = true; $('#teacher-tools').hidden = !remote.teacher; await persist(); renderMap();
      const recent = Object.entries(cache).filter(([id,r]) => stageById(id) && !r.data?.done).sort((a,b) => Date.parse(b[1].localUpdatedAt || b[1].updatedAt || 0) - Date.parse(a[1].localUpdatedAt || a[1].updatedAt || 0))[0];
      const first = (recent && stageById(recent[0])) || content.challenges.flatMap(c => c.stages).find(s => !state(s).done) || content.challenges[0].stages[0];
      openStage(first.id, false); status(remote.preview ? 'Teacher practice space · no student progress or grades are changed.' : 'Your saved progress is ready.'); sync();
    } catch (error) {
      if (run !== epoch) return;
      if (Object.keys(cache).length && ![401,403].includes(error.code)) {
        ready = true; renderMap(); openStage(content.challenges.flatMap(c => c.stages).find(s => !state(s).done)?.id || 'grammar-1', false);
        status('Offline practice · changes will sync when you reconnect.');
      } else status(error.code === 403 ? 'Use your registered Basic 2 account. Contact your teacher if access is missing.' : error.code === 401 ? 'Please sign in again. Your session expired.' : 'Could not load account progress. Check your connection and select Retry sync.');
    }
  }
  function renderMap() {
    if (!content) return;
    let completed = 0, mastery = 0;
    $('#challenge-map').innerHTML = content.challenges.map((c, i) => {
      const done = c.stages.filter(s => state(s).done).length; completed += done;
      mastery += c.stages.filter(s => s.kind === 'quiz' && state(s).done && score(s) === s.questions.length).length;
      return `<article class="adventure-card"><span class="adventure-number">${String(i + 1).padStart(2, '0')}</span><h2>${escape(c.title)}</h2><p>${escape(c.goal)}</p><p class="meta">About ${c.minutes} min · ${done}/4 stages</p><progress max="4" value="${done}" aria-label="${escape(c.title)} progress"></progress><div class="stage-buttons">${c.stages.map((s,j) => `<button type="button" data-stage="${s.id}" ${!ready ? 'disabled' : ''} ${active?.id === s.id ? 'aria-current="step"' : ''}>${state(s).done ? '✓ ' : ''}${j+1}. ${escape(s.title)}</button>`).join('')}</div></article>`;
    }).join('');
    $('#journey-stats').textContent = `${completed}/24 stages completed · ${completed * 25} XP · ${mastery}/16 quiz stages mastered`;
    $('#journey-progress').value = completed;
    $('#challenge-map').querySelectorAll('[data-stage]').forEach(b => b.onclick = () => openStage(b.dataset.stage));
    $('#celebration').hidden = completed !== 24;
  }
  function openStage(id, scroll = true) {
    if (!ready) return;
    if (recorder?.state === 'recording') { status('Stop your recording before moving to another stage.'); return; }
    active = stageById(id); replayed = false; modelHeard = new Set(); renderStage(); renderMap();
    if (scroll) $('#workspace').scrollIntoView({behavior: 'smooth', block: 'start'});
  }
  function score(s) { const d = state(s); return s.questions.filter(q => q.answers.some(a => normalize(a) === normalize(d.answers?.[q.id]))).length; }
  function players(src) { return `<audio controls preload="metadata" src="${escape(src)}"></audio><label class="speed-label">Speed <select class="speed" aria-label="Audio speed"><option value="0.75">0.75×</option><option value="1" selected>1×</option><option value="1.25">1.25×</option></select></label>`; }
  function renderStage() {
    if (!active) return;
    const s = active, d = state(s), c = content.challenges.find(c => c.stages.includes(s));
    let support = `<p>${escape(s.help)}</p>`;
    if (s.text) support += `<div class="reading-text">${escape(s.text)}</div>`;
    if (s.audio) support += `<div class="audio-box">${players('audio/adventure-unit1/' + s.audio + '.mp3')}<p>Listen first for meaning. Replay for details. Your answers remain editable.</p></div>`;
    if (s.image) support += '<img class="scene" src="/assets/img/english-basic-2/unit-1-going-out/adventure-hero.webp" alt="People walking and running outside in the rain, with friends talking inside a café">';
    if (s.models?.length) support += s.models.map(([file, line], i) => `<div class="model"><p>${escape(line)}</p><div data-model="${i}">${players('audio/adventure-unit1/' + file + '.mp3')}</div></div>`).join('');
    let activity = '';
    if (s.kind === 'quiz') {
      activity = s.questions.map(q => `<fieldset class="question"><legend>${q.id}. ${escape(q.prompt)}</legend>${q.options ? ordered(q.options, Number(q.id)).map((o,i) => `<label class="option"><input type="radio" name="q-${q.id}" value="${escape(o)}" ${d.answers?.[q.id] === o ? 'checked' : ''}> <span>${escape(o)}</span></label>`).join('') : `<input type="text" data-answer="${q.id}" aria-label="Answer ${q.id}" maxlength="1000" value="${escape(d.answers?.[q.id] || '')}" autocomplete="off" spellcheck="false">`}${d.done ? `<p class="feedback ${q.answers.some(a => normalize(a) === normalize(d.answers?.[q.id])) ? 'correct' : 'review'}">${q.answers.some(a => normalize(a) === normalize(d.answers?.[q.id])) ? '✓ Correct.' : 'Review: ' + escape(q.answers[0]) + '.'} ${escape(q.explanation)}</p>` : ''}</fieldset>`).join('');
    } else {
      activity = `<p class="task-prompt">${escape(s.prompt)}</p>`;
      if (s.kind === 'writing') activity += `<label for="written-answer">Your writing</label><textarea id="written-answer" rows="12" maxlength="12000">${escape(d.text || '')}</textarea><p id="word-count">${wordCount(d.text)} words · at least ${s.minWords}</p>`;
      if (s.kind === 'speaking') activity += `<div class="recorder"><button id="record" type="button">🎙 Record</button> <button id="stop" type="button" disabled>Stop</button><p id="record-status">Maximum 2 minutes per recording. Re-recording replaces this stage’s previous audio.</p><label>Or upload your recording (up to 2 MB, 2 minutes)<input type="file" id="audio-upload" accept="audio/*"></label>${d.audio ? `<audio id="playback" controls src="${escape(d.audio)}"></audio>` : ''}<label for="reflection">After replaying: what did you improve?</label><textarea id="reflection" rows="3" maxlength="12000">${escape(d.text || '')}</textarea></div>`;
      activity += `<fieldset class="self-review"><legend>Self-review</legend>${s.checklist.map((label,i) => `<label><input type="checkbox" data-check="${i}" ${d.checks?.[i] ? 'checked' : ''}> ${escape(label)}</label>`).join('')}</fieldset>`;
      if (s.model && d.done) activity += `<details><summary>Compare with a corrected model</summary><p>${escape(s.model)}</p><p>Your two original sentences can be different.</p></details>`;
    }
    if (s.applyPrompt) activity += `<div class="apply-task"><h3>Apply it in your own words</h3><p>${escape(s.applyPrompt)}</p><label for="apply-answer">Write at least ${s.applyMinWords} words. Read it aloud and check your verbs.</label><textarea id="apply-answer" rows="5" maxlength="12000">${escape(d.text || '')}</textarea><p id="apply-count">${wordCount(d.text)} words</p><p class="meta">This short writing task is self-reviewed; it does not receive an automatic language score.</p></div>`;
    const conflict = cache[s.id]?.conflict;
    $('#workspace').innerHTML = `<div class="stage-heading"><div><p class="eyebrow">${escape(c.title)} · Stage ${c.stages.indexOf(s)+1}/4</p><h2 tabindex="-1">${escape(s.title)}</h2></div><a href="#challenge-map">Back to map ↑</a></div>${conflict ? '<div class="conflict" role="alert"><h3>This stage changed on another device</h3><p>Your local work is preserved. Compare the other version before choosing.</p><button id="download-local">Download my device copy</button> <button id="download-cloud">Download account copy</button><p><button id="keep-local">Keep this device’s version</button> <button id="keep-cloud">Use account version</button></p></div>' : ''}<div class="stage-layout"><aside>${support}<details><summary>Unit 1 language reminders</summary><p>Habits: I play / she plays. Questions: Do you play? Does she play?</p><p>Now: I am playing / she is playing / they are playing. Negative: She is not playing. Question: Is she playing?</p><p>Weather: sunny, cloudy, windy, rainy, stormy, hot, cold, pouring.</p><a href="unit-1-going-out.html" target="_blank" rel="noopener">Open the full Unit 1 lesson</a></details></aside><div class="stage-work">${activity}<p id="stage-result" role="status">${d.done ? s.kind === 'quiz' ? `${score(s)}/${s.questions.length} correct. ${score(s) === s.questions.length ? 'Stage mastered!' : 'Stage completed. Review the explanations and retry to build mastery.'}` : 'Practice completed · self-reviewed. This is not a teacher grade.' : ''}</p><div class="actions"><button id="finish" type="button">${s.kind === 'quiz' ? 'Check answers' : 'Complete practice'}</button><button id="next" type="button">Next stage →</button></div></div></div>`;
    bindStage();
  }
  // Rotate and reverse options deterministically, avoiding a fixed answer position.
  function ordered(options, seed) { const a = [...options]; if (seed % 2) a.reverse(); const n = seed % a.length; return [...a.slice(n), ...a.slice(0,n)]; }
  function wordCount(text) { return String(text || '').trim().split(/\s+/).filter(Boolean).length; }
  function bindStage() {
    const s = active;
    $('#workspace').querySelectorAll('audio').forEach(audio => {
      audio.addEventListener('error', () => status('Audio could not load. Check your connection and reload this stage. Your work is saved separately.'));
      audio.addEventListener('ended', () => {
        if (audio.id === 'playback') replayed = true;
        else if (audio.closest('[data-model]')) modelHeard.add(audio.closest('[data-model]').dataset.model);
        else if (s.audio) change({listened: true});
      });
    });
    $('#workspace').querySelectorAll('.speed').forEach(select => select.onchange = () => select.parentElement.previousElementSibling.playbackRate = Number(select.value));
    $('#workspace').querySelectorAll('[data-answer],input[type=radio]').forEach(input => input.addEventListener('input', () => {
      const id = input.dataset.answer || input.name.slice(2);
      change({answers: {...state(s).answers, [id]: input.value}, done: false});
      $('#stage-result').textContent = 'Answer changed. Check again when ready.';
      $('#workspace').querySelectorAll('.feedback').forEach(el => el.remove());
    }));
    $('#apply-answer')?.addEventListener('input', e => { change({text: e.target.value, done: false}); $('#apply-count').textContent = `${wordCount(e.target.value)} words`; });
    $('#written-answer')?.addEventListener('input', e => { change({text: e.target.value, done: false}); $('#word-count').textContent = `${wordCount(e.target.value)} words · at least ${s.minWords}`; });
    $('#reflection')?.addEventListener('input', e => change({text: e.target.value, done: false}));
    $('#workspace').querySelectorAll('[data-check]').forEach(input => input.onchange = () => {
      const checks = s.checklist.map((_,i) => Boolean(state(s).checks?.[i])); checks[Number(input.dataset.check)] = input.checked; change({checks, done: false});
    });
    $('#finish').onclick = async () => {
      const d = state(s); let error = '';
      if (s.kind === 'quiz') {
        if (s.questions.some(q => !d.answers?.[q.id]?.trim())) error = 'Answer every question before checking.';
        else if (s.applyPrompt && wordCount(d.text) < s.applyMinWords) error = `Complete the application task with at least ${s.applyMinWords} words.`;
        else if (s.audio && !d.listened) error = 'Listen to the whole recording at least once before checking.';
      } else {
        if (s.kind === 'writing' && wordCount(d.text) < s.minWords) error = `Write at least ${s.minWords} words before completing this stage.`;
        if (s.kind === 'speaking' && (!d.audio || d.seconds < s.minSeconds)) error = `Record at least ${s.minSeconds} seconds, then replay and review.`;
        if (s.kind === 'speaking' && !replayed) error += ' Replay your recording before completing the stage.';
        if (s.models?.length && modelHeard.size < s.models.length) error += ' Listen to all three models.';
        if (s.checklist.some((_,i) => !d.checks?.[i])) error += ' Complete the self-review checklist.';
      }
      if (error) { $('#stage-result').textContent = error; return; }
      await change({done: true, attempts: (d.attempts || 0) + 1}); renderStage(); renderMap(); chime();
    };
    $('#next').onclick = () => {
      if (!state(s).done) { $('#stage-result').textContent = 'Complete this stage first, or choose another stage from the map.'; return; }
      const all = content.challenges.flatMap(c => c.stages), next = all[all.findIndex(x => x.id === s.id)+1];
      if (next) openStage(next.id); else $('#challenge-map').scrollIntoView({behavior: 'smooth'});
    };
    if ($('#record')) { $('#record').onclick = record; $('#stop').onclick = stopRecording; $('#audio-upload').onchange = upload; }
    if (cache[s.id]?.conflict) {
      $('#download-local').onclick = () => download(cache[s.id].data, s.id + '-device');
      $('#download-cloud').onclick = () => download(cache[s.id].conflict.data, s.id + '-account');
      $('#keep-local').onclick = async () => { const r = cache[s.id]; r.revision = r.conflict.revision; delete r.conflict; delete r.pending; r.dirty = true; await persist(); renderStage(); sync(); };
      $('#keep-cloud').onclick = async () => { cache[s.id] = cache[s.id].conflict; await persist(); renderStage(); renderMap(); sync(); };
    }
  }
  function download(data, name) { const url = URL.createObjectURL(new Blob([JSON.stringify(data,null,2)], {type:'application/json'})); const a = document.createElement('a'); a.href=url; a.download=name+'.json'; a.click(); setTimeout(()=>URL.revokeObjectURL(url),1000); }
  function dataURL(blob) { return new Promise((resolve,reject) => { const r = new FileReader(); r.onload=()=>resolve(r.result); r.onerror=reject; r.readAsDataURL(blob); }); }
  async function record() {
    const run = epoch, id = active.id;
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) { $('#record-status').textContent='Recording is not supported here. Use the audio upload option.'; return; }
    try {
      stream = await navigator.mediaDevices.getUserMedia({audio:true});
      if (run !== epoch || active?.id !== id) { stream.getTracks().forEach(t=>t.stop()); return; }
      const mime = ['audio/webm;codecs=opus','audio/mp4','audio/ogg;codecs=opus'].find(t => MediaRecorder.isTypeSupported(t));
      recorder = new MediaRecorder(stream, {...(mime ? {mimeType:mime} : {}), audioBitsPerSecond:32000});
      chunks=[]; recordingStage=id; recordingStart=Date.now();
      recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
      recorder.onerror=()=>{ stopRecording(); status('Recording failed. Please retry or upload an audio file.'); };
      recorder.onstop=async()=>{
        stream?.getTracks().forEach(t=>t.stop()); clearInterval(recordingTimer);
        const seconds=Math.min(120,(Date.now()-recordingStart)/1000), blob=new Blob(chunks,{type:recorder.mimeType});
        if(run!==epoch || active?.id!==recordingStage)return;
        if(blob.size<100 || blob.size>2000000){status('Recording was empty or too large. Please record again.');renderStage();return;}
        const audio=await dataURL(blob);
        if(run!==epoch || active?.id!==id)return;
        await change({audio,seconds,checks:[],done:false}); renderStage();
      };
      recorder.start(); $('#record').disabled=true; $('#stop').disabled=false; $('#audio-upload').disabled=true; $('#finish').disabled=true; $('#next').disabled=true;
      recordingTimer=setInterval(()=>{const seconds=Math.floor((Date.now()-recordingStart)/1000); if($('#record-status'))$('#record-status').textContent=`Recording… ${seconds}/120 seconds`;if(seconds>=120)stopRecording();},250);
    }catch{stopRecording(); if($('#record-status'))$('#record-status').textContent='Microphone unavailable or permission denied. Allow access and retry, or upload an audio recording.';}
  }
  async function upload(e) {
    const file=e.target.files[0], run=epoch, id=active.id;
    if(!file)return;
    if(file.size>2000000 || !/^audio\/(webm|ogg|mp4|wav|mpeg|x-m4a)$/.test(file.type)){status('Choose an MP3, M4A, WAV, OGG or WebM audio file smaller than 2 MB.');return;}
    const url=URL.createObjectURL(file), audio=new Audio(url);
    audio.onerror=()=>{URL.revokeObjectURL(url);status('This audio format cannot be played. Try MP3, M4A or WebM.');};
    audio.onloadedmetadata=async()=>{
      const seconds=audio.duration; URL.revokeObjectURL(url);
      if(!Number.isFinite(seconds)||seconds<=0||seconds>120){status('Choose a recording up to 2 minutes long with readable duration.');return;}
      const encoded=await dataURL(file); if(run!==epoch||active?.id!==id)return;
      await change({audio:encoded,seconds,checks:[],done:false});renderStage();
    };
  }
  function chime() { if(!sound)return; try{const ctx=new AudioContext();[440,660,880].forEach((f,i)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.frequency.value=f;g.gain.value=.035;o.connect(g).connect(ctx.destination);o.start(ctx.currentTime+i*.1);o.stop(ctx.currentTime+i*.1+.12);});setTimeout(()=>ctx.close(),600);}catch{} }
  async function start() {
    try {
      [content, db] = await Promise.all([fetch('/assets/data/basic2-adventure-unit1.json?v=20261018-1').then(r=>{if(!r.ok)throw Error();return r.json();}),openDB()]);
      $('#load-transcript').onclick = async () => { try { const r = await api('transcript'); $('#transcript').textContent = r.text; } catch { status('Transcripts are available only to authorized teachers.'); } };
      $('#sign-in').onclick=()=>window.JaraLinguaAuth?.openPanel();
      $('#retry-sync').onclick=()=>ready ? sync() : loadAccount();
      $('#sound-toggle').onclick=()=>{sound=!sound;$('#sound-toggle').textContent=sound?'Sound on':'Sound off';$('#sound-toggle').setAttribute('aria-pressed',String(sound));};
      window.addEventListener('jaralingua:auth-changed',loadAccount);
      window.addEventListener('online',()=>ready?sync():loadAccount());
      window.addEventListener('beforeunload',e=>{if(pending()||recorder?.state==='recording'){e.preventDefault();e.returnValue='';}});
      document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')sync();});
      setInterval(()=>{if(ready&&pending())sync();},15000);
      await loadAccount();
    }catch{status('The adventure could not start. Enable browser storage, check your connection, and reload.');}
  }
  window.addEventListener('load', () => { if (content && db) loadAccount(); }, {once: true});
  start();
})();
