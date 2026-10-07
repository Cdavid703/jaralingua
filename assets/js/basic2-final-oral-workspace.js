(() => {
  'use strict';
  const $=id=>document.getElementById('ot-'+id),{OralClient,errorText,requestId}=window.Basic2OralAPI,client=new OralClient();
  const content=window.Basic2OralTravelContent,esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let state=null,team=null,signature='',teacherSignature='',preview=false,dirty=false,planTimer=null,planSaving=false,planConflict=false,selectedTeacher='',busy=false;
  const reviewTimers=new Map(),reviewJobs=new Map(),reviewDirty=new Set(),pending=new Map();
  const isStaff=()=>['teacher','admin'].includes(state?.role),storageKey=(kind,tid)=>'basic2-oral:'+encodeURIComponent(client.user?.email||client.user?.sub||'')+':'+tid+':'+kind;
  function store(kind,tid,value){try{localStorage.setItem(storageKey(kind,tid),JSON.stringify(value));}catch{}}
  function read(kind,tid){try{return JSON.parse(localStorage.getItem(storageKey(kind,tid))||'null');}catch{return null;}}
  function remove(kind,tid){try{localStorage.removeItem(storageKey(kind,tid));}catch{}}
  function status(text){$('status').textContent=text;}
  function report(e,target='status'){if(e.code==='account_changed')return;const el=$(target);if(el)el.textContent=errorText(e);if(e.status===401)$('reconnect').hidden=false;}
  async function mutate(action,data={}){
    if(preview)throw Error('Preview actions do not contact the server.');
    const key=action+':'+(data.teamId||'')+':'+(data.member||''),fingerprint=JSON.stringify(data);
    let p=pending.get(key);if(!p||p.fingerprint!==fingerprint){p={fingerprint,body:{...data,requestId:requestId()}};pending.set(key,p);}
    const result=await client.request(action,p.body);pending.delete(key);return result;
  }
  function currentTeam(){return preview?team:isStaff()?state?.teams?.find(t=>t.id===selectedTeacher):state?.team;}
  function project(t){window.open('./basic-course-2-final-oral-projector.html?pair='+encodeURIComponent(t.id),'_blank','noopener');}
  function planValues(){return {destination:$('plan-image')?.value||'',assistant:$('plan-role')?.value||'',decision:$('plan-decision')?.value||''};}
  function backupPlan(){if(team&&!preview)store('plan',team.id,{...planValues(),revision:team.revision});}
  async function refresh(force=false){
    const data=await client.request('state');state=data;$('reconnect').hidden=true;
    if(preview)return;
    if(isStaff())renderTeacher(force);else renderStudent(force);
    status(data.isOpen?'Registration is open. Your pair’s saved work is shared between both accounts.':'New pair registration is closed. Registered pairs can access their saved materials.');
  }
  function renderStudent(force=false){
    $('teacher').hidden=true;$('student').hidden=false;$('preview-workspace').hidden=true;
    const next=state.team;
    if(!next){team=null;signature='';$('my-pair').replaceChildren();$('pair-picker').hidden=false;
      const selected=$('partner').value;$('partner').innerHTML='<option value="">Choose a classmate…</option>'+state.roster.filter(s=>s.available).map(s=>`<option value="${esc(s.key)}">${esc(s.name)}</option>`).join('');
      $('partner').value=selected;$('invite').disabled=!state.isOpen||busy;
      $('pair-help').textContent='Choosing a classmate registers both of you immediately. Each student belongs to one pair.';return;
    }
    $('pair-picker').hidden=true;
    const sig=JSON.stringify(next);
    if((dirty||planSaving||document.activeElement?.closest('#ot-plan-form'))&&!force)return;
    team=next;if(sig!==signature||force){signature=sig;renderPair($('my-pair'),team);}
  }
  function renderPair(host,t){
    const myKey=preview?'demo-a':state.myKey,roleName=t.members.find(m=>m.key===t.assistant)?.name;
    host.innerHTML=`<div class="ot-pair"><h3>${t.members.map(m=>esc(m.name)).join(' + ')}</h3><p>Registration ${esc(t.receipt)} · ${t.status==='confirmed'?'Pair registered':'Waiting for confirmation'}</p>
      <p>Your conversation can discuss any destination. Choose a support image, agree on your roles and record the tourist’s final decision.</p>
      <form id="ot-plan-form" data-jaralingua-managed-draft><div class="ot-two"><label for="ot-plan-image">Image for our presentation<select id="ot-plan-image"><option value="">Use our uploaded materials</option>${content.destinations.map(([id,n])=>`<option value="${id}">${esc(n)}</option>`).join('')}</select></label>
      <label for="ot-plan-role">Travel assistant<select id="ot-plan-role"><option value="">Choose a role…</option>${t.members.map(m=>`<option value="${esc(m.key)}">${esc(m.name)}</option>`).join('')}</select></label></div>
      <p>The other student is the tourist. Each of you can prepare your own role.</p><label for="ot-plan-decision">The tourist’s final decision<textarea id="ot-plan-decision" rows="3" maxlength="600" placeholder="I want to visit… because…"></textarea></label>
      <p>Write a brief final choice. You can mention a destination, a place or an activity.</p><div class="ot-actions"><button type="submit" id="ot-plan-save">Save our plan</button><button type="button" class="ot-secondary" id="ot-plan-reload" hidden>Load the latest saved plan</button><button type="button" class="ot-secondary" id="ot-plan-replace" hidden>Save my version instead</button></div><p id="ot-plan-status" role="status"></p></form>
      <div class="ot-actions"><button type="button" id="ot-project-pair">Open projector</button><button type="button" class="ot-secondary" id="ot-cancel-pair" ${preview?'disabled':''}>Change partner</button></div><p>Open the projector on the screen used for your presentation. Your teacher can open the same saved materials.</p><div id="ot-materials"></div></div>`;
    $('plan-image').value=t.destination;$('plan-role').value=t.assistant;$('plan-decision').value=t.decision;
    $('plan-status').textContent=t.decision&&t.assistant&&(t.destination||t.files.length)?'Plan saved. Both partners can see it.':'Complete your roles, final choice and at least one visual for the presentation.';
    const draft=!preview&&read('plan',t.id);
    if(draft){$('plan-image').value=draft.destination;$('plan-role').value=draft.assistant;$('plan-decision').value=draft.decision;dirty=true;planConflict=draft.revision!==t.revision;
      $('plan-status').textContent='Recovered unsaved changes from this account. Review them and save.';
      if(planConflict){$('plan-reload').hidden=$('plan-replace').hidden=false;$('plan-status').textContent='Recovered changes differ from the latest shared plan. Choose which version to keep.';}
    }
    $('plan-form').addEventListener('input',()=>{dirty=true;backupPlan();clearTimeout(planTimer);$('plan-status').textContent='Unsaved changes…';if(!planConflict)planTimer=setTimeout(()=>savePlan(),900);});
    $('plan-form').onsubmit=e=>{e.preventDefault();savePlan();};
    $('plan-reload').onclick=()=>{remove('plan',t.id);dirty=false;planConflict=false;refresh(true).catch(report);};
    $('plan-replace').onclick=()=>{planConflict=false;savePlan();};
    $('project-pair').onclick=()=>{if(preview)window.Basic2OralTravelTeaching.projectDestination($('plan-image').value||'cartagena');else project(t);};
    $('cancel-pair').onclick=async()=>{if(!confirm('Cancel this pair registration for both students? Its materials will no longer be used.'))return;try{await mutate('cancel',{teamId:t.id});remove('plan',t.id);dirty=false;await refresh(true);}catch(e){report(e);}};
    renderMaterials($('materials'),t);
    if(t.locked){$('plan-form').querySelectorAll('input,select,textarea,button').forEach(e=>e.disabled=true);$('cancel-pair').disabled=true;$('plan-status').textContent='The assessment has been published. Your saved plan and materials are locked.';}
  }
  async function savePlan(){
    if(!team||planSaving||planConflict)return;
    clearTimeout(planTimer);const t=team,values=planValues(),epoch=client.epoch;
    if(preview){Object.assign(team,values);dirty=false;$('plan-status').textContent='Preview: plan updated on this screen.';return;}
    backupPlan();planSaving=true;$('plan-save').disabled=true;
    try{await mutate('plan',{teamId:t.id,revision:t.revision,...values});if(epoch!==client.epoch)return;
      const latest=await client.request('state');if(!latest.team||latest.team.id!==t.id)throw Error('Your pair changed. Refresh access.');state=latest;team=latest.team;
      dirty=JSON.stringify(values)!==JSON.stringify(planValues());
      if(dirty){backupPlan();planTimer=setTimeout(savePlan,50);}else{remove('plan',t.id);$('plan-status').textContent='Saved for both partners · '+new Date().toLocaleTimeString();}
    }catch(e){if(epoch!==client.epoch)return;report(e,'plan-status');if(e.code==='plan_changed'){planConflict=true;const latest=await client.request('state');state=latest;team=latest.team;$('plan-reload').hidden=$('plan-replace').hidden=false;}}
    finally{if(epoch===client.epoch){planSaving=false;if($('plan-save'))$('plan-save').disabled=false;}}
  }
  function renderMaterials(host,t){
    host.innerHTML=`<h3>Presentation materials</h3><p>JPG, PNG, WebP, PDF or PowerPoint (.pptx). Up to 15 MB per file, 30 pages per document, 6 files and 40 MB per pair. PowerPoint is shown as static slides; export linked content as PDF.</p>
      <label>Choose a file<input class="ot-upload" type="file" accept="image/jpeg,image/png,image/webp,application/pdf,.pptx"></label><button class="ot-upload-button" type="button">Upload and prepare for projection</button><p class="ot-upload-status" role="status"></p><div class="ot-files"></div>`;
    const list=host.querySelector('.ot-files'),message=host.querySelector('.ot-upload-status'),input=host.querySelector('input'),button=host.querySelector('.ot-upload-button');
    for(const file of t.files){const box=document.createElement('article');box.className='ot-file';box.innerHTML=`<strong>${esc(file.name)}</strong><p>${file.pages} slide${file.pages===1?'':'s'} · ${(file.size/1024/1024).toFixed(1)} MB</p><button type="button" class="ot-secondary">Remove file</button>`;
      box.querySelector('button').onclick=async()=>{if(preview){message.textContent='Preview: no file was removed.';return;}if(!confirm('Remove this file from the pair’s presentation?'))return;try{await mutate('remove-file',{teamId:t.id,fileId:file.id});await refreshMaterials(t.id,host);}catch(e){message.textContent=errorText(e);}};list.append(box);}
    button.onclick=async()=>{
      const file=input.files?.[0];if(!file){message.textContent='Select a file first.';return;}if(file.size>15*1024*1024){message.textContent='The file exceeds 15 MB.';return;}
      if(preview){message.textContent='Preview: '+file.name+' selected. This demonstration does not upload files.';return;}
      const epoch=client.epoch;busy=true;button.disabled=true;input.disabled=true;message.textContent='Uploading and preparing slides. Keep this page open…';
      try{const bytes=await file.arrayBuffer();if(epoch!==client.epoch)return;
        const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(x=>x.toString(16).padStart(2,'0')).join('');
        const kind='upload:'+hash+':'+file.name;let operation=read(kind,t.id);if(!operation){operation={requestId:requestId()};store(kind,t.id,operation);}
        let binary='';const array=new Uint8Array(bytes);for(let i=0;i<array.length;i+=32768)binary+=String.fromCharCode(...array.subarray(i,i+32768));
        if(epoch!==client.epoch)return;
        const result=await client.request('upload',{requestId:operation.requestId,teamId:t.id,name:file.name,data:btoa(binary)});
        if(epoch!==client.epoch)return;remove(kind,t.id);await refreshMaterials(t.id,host);
        host.querySelector('.ot-upload-status').textContent='File saved and ready to project · Registration '+result.receipt;
      }catch(e){if(epoch===client.epoch)message.textContent=errorText(e)+' Your original file remains on your device. You can retry the same file.';}
      finally{if(epoch===client.epoch){busy=false;button.disabled=false;input.disabled=false;}}
    };
    if(t.locked){input.disabled=button.disabled=true;list.querySelectorAll('button').forEach(b=>b.disabled=true);message.textContent='Materials are locked after grading. You can still project them.';}
  }
  async function refreshMaterials(tid,host){const latest=await client.request('state');state=latest;const t=isStaff()?latest.teams.find(t=>t.id===tid):latest.team;if(!t||t.id!==tid)return;if(!isStaff())team={...team,files:t.files};renderMaterials(host,t);}
  function renderTeacher(force=false){
    $('teacher').hidden=false;$('student').hidden=true;$('preview-workspace').hidden=true;
    $('teacher-status').textContent=(state.isOpen?'Registration open':'Registration closed')+' · '+state.teams.length+' pairs · Individual grades · '+state.weight+'% of course grade';
    if(!$('teacher-select')){
      $('teams').innerHTML='<label for="ot-teacher-select">Choose a pair<select id="ot-teacher-select"><option value="">Choose a registered pair…</option></select></label><div id="ot-teacher-pair"></div>';
      $('teacher-select').onchange=()=>{if(reviewDirty.size){$('teacher-select').value=selectedTeacher;status('Save or reload the pending rubric before changing pairs.');return;}selectedTeacher=$('teacher-select').value;renderTeacherPair();};
    }
    const select=$('teacher-select');select.innerHTML='<option value="">Choose a registered pair…</option>'+state.teams.map(t=>`<option value="${t.id}">${t.members.map(m=>esc(m.name)).join(' + ')}</option>`).join('');select.value=selectedTeacher;
    const sig=JSON.stringify(currentTeam());
    if((force||sig!==teacherSignature)&&!reviewDirty.size&&!document.activeElement?.closest('#ot-reviews'))renderTeacherPair();
  }
  function renderTeacherPair(){
    const t=currentTeam(),host=$('teacher-pair');if(!host)return;host.replaceChildren();if(!t)return;
    teacherSignature=JSON.stringify(t);
    host.innerHTML=`<section class="ot-pair"><h3>${t.members.map(m=>esc(m.name)).join(' + ')}</h3><p>Registration ${esc(t.receipt)}</p><p><strong>Travel assistant:</strong> ${esc(t.members.find(m=>m.key===t.assistant)?.name||'Not chosen yet')}</p><p><strong>Tourist’s final decision:</strong> ${esc(t.decision||'Not saved yet')}</p>
      <div class="ot-actions"><button id="ot-teacher-project" type="button">Open projector in another window</button><span id="ot-timer" class="ot-timer"></span><button id="ot-timer-start" type="button">Start timer</button><button id="ot-timer-stop" class="ot-secondary" type="button">Pause timer</button><button id="ot-timer-reset" class="ot-secondary" type="button">Reset timer</button></div><p>Minimum 2 minutes for the whole pair. The timer continues until you pause it.</p>
      <details><summary>Pair materials</summary><div id="ot-teacher-materials"></div></details><p class="ot-notice">Private teacher assessment · Scores and rubric drafts are not shown in the student workspace or projector.</p><div id="ot-reviews"></div></section>`;
    $('teacher-project').onclick=()=>project(t);
    for(const command of ['start','stop','reset'])$('timer-'+command).onclick=async()=>{try{await mutate('timer',{teamId:t.id,command});state=await client.request('state');tick();}catch(e){report(e);}};
    renderMaterials($('teacher-materials'),t);
    for(const member of t.members){const saved=t.reviews?.[member.key]||{rubric:{},feedback:'',revision:0,published:null};const backup=read('review:'+member.key,t.id),values=backup||saved;
      const form=document.createElement('form');form.className='ot-review';form.dataset.member=member.key;form.dataset.revision=String(saved.revision);form.setAttribute('data-jaralingua-managed-draft','');
      form.innerHTML=`<h3>${esc(member.name)}</h3><p>${state.scale.map(s=>esc(s.range+' '+s.label)).join(' · ')}</p><div class="ot-grade-grid">${Object.entries(state.rubric).map(([key,r])=>`<label>${esc(r.title)}<select data-criterion="${key}" aria-label="${esc(r.title)}"><option value="">Select a score…</option>${Array.from({length:10},(_,i)=>`<option value="${i+1}">${i+1}</option>`).join('')}</select><small>${esc(r.description)}</small></label>`).join('')}</div><label>Feedback<textarea class="ot-feedback" rows="3" maxlength="4000"></textarea></label><p class="ot-grade-total"></p><div class="ot-actions"><button type="submit">Save rubric draft</button><button type="button" class="ot-publish">Publish individual grade</button><button type="button" class="ot-reload-review ot-secondary">Reload saved rubric</button></div><p class="ot-review-status" role="status"></p>`;
      for(const [key,value] of Object.entries(values.rubric))form.querySelector(`[data-criterion="${key}"]`).value=String(value);
      form.querySelector('textarea').value=values.feedback;form.querySelector('.ot-review-status').textContent=backup?'Recovered a local rubric draft. Save it or reload the server version.':saved.published?'Published: '+saved.published.grade.toFixed(1)+' / 5 · You may save a revised draft before publishing again.':'No grade has been published.';
      if(backup){reviewDirty.add(member.key);if(backup.revision!==saved.revision)form.dataset.conflict='true';}
      form.oninput=()=>{reviewDirty.add(member.key);store('review:'+member.key,t.id,{...reviewValues(form),revision:Number(form.dataset.revision)});reviewTotal(form);form.querySelector('.ot-review-status').textContent='Unsaved rubric changes…';clearTimeout(reviewTimers.get(member.key));reviewTimers.set(member.key,setTimeout(()=>saveReview(form,t).catch(e=>form.querySelector('.ot-review-status').textContent=errorText(e)),800));};
      form.onsubmit=e=>{e.preventDefault();saveReview(form,t).catch(e=>form.querySelector('.ot-review-status').textContent=errorText(e));};
      form.querySelector('.ot-reload-review').onclick=async()=>{if(reviewDirty.has(member.key)&&!confirm('Replace the local draft with the latest saved rubric?'))return;clearTimeout(reviewTimers.get(member.key));await reviewJobs.get(member.key)?.catch(()=>{});remove('review:'+member.key,t.id);reviewDirty.delete(member.key);await refresh(true);};
      form.querySelector('.ot-publish').onclick=async()=>{const controls=[...form.querySelectorAll('button,select,textarea')];controls.forEach(e=>e.disabled=true);const epoch=client.epoch;
        try{await saveReview(form,t);await mutate('publish',{teamId:t.id,member:member.key,revision:Number(form.dataset.revision)}).then(async r=>{state=await client.request('state');const fresh=state.teams.find(p=>p.id===t.id).reviews[member.key];form.dataset.revision=String(fresh.revision);form.querySelector('.ot-review-status').textContent=r.gradebookSynced?'Published to Grades: '+fresh.published.grade.toFixed(1)+' / 5.':'Grade saved. Gradebook synchronization is pending; opening Grades retries it.';});}
        catch(e){if(epoch===client.epoch)form.querySelector('.ot-review-status').textContent=errorText(e);}
        finally{if(epoch===client.epoch)controls.forEach(e=>e.disabled=false);}};
      $('reviews').append(form);reviewTotal(form);
    }tick();
  }
  function reviewValues(form){return {rubric:Object.fromEntries([...form.querySelectorAll('[data-criterion]')].filter(e=>e.value).map(e=>[e.dataset.criterion,Number(e.value)])),feedback:form.querySelector('textarea').value};}
  function reviewTotal(form){const values=Object.values(reviewValues(form).rubric),sum=values.reduce((a,b)=>a+b,0);form.querySelector('.ot-grade-total').textContent=values.length===5?`${sum} / 50 → ${(sum/10).toFixed(1)} / 5`:`${values.length} of 5 criteria selected`;}
  async function saveReview(form,t){
    const member=form.dataset.member;if(reviewJobs.has(member)){await reviewJobs.get(member);if(reviewDirty.has(member))return saveReview(form,t);return;}
    if(form.dataset.conflict==='true')throw Object.assign(Error('Conflict'),{code:'review_changed'});
    clearTimeout(reviewTimers.get(member));const values=reviewValues(form),epoch=client.epoch;
    store('review:'+member,t.id,{...values,revision:Number(form.dataset.revision)});
    const job=(async()=>{try{
      await mutate('review',{teamId:t.id,member,revision:Number(form.dataset.revision),...values});
      state=await client.request('state');if(epoch!==client.epoch)return;
      const fresh=state.teams.find(p=>p.id===t.id).reviews[member];form.dataset.revision=String(fresh.revision);
      if(JSON.stringify(values)===JSON.stringify(reviewValues(form))){reviewDirty.delete(member);remove('review:'+member,t.id);}else store('review:'+member,t.id,{...reviewValues(form),revision:fresh.revision});
      form.querySelector('.ot-review-status').textContent='Rubric draft saved · '+new Date().toLocaleTimeString();
    }catch(e){if(e.code==='review_changed')form.dataset.conflict='true';throw e;}finally{if(epoch===client.epoch)reviewJobs.delete(member);}})();
    reviewJobs.set(member,job);await job;
  }
  function tick(){const t=currentTeam();if(preview||!$('timer')||!t?.timer)return;let seconds=t.timer.elapsed;if(t.timer.running)seconds+=(Date.now()-Date.parse(t.timer.startedAt))/1000;seconds=Math.max(0,Math.floor(seconds));$('timer').textContent=Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0')+(seconds>=120?' · Minimum reached':' / 2:00 minimum');}
  async function invite(){if(busy)return;const partner=$('partner').value;if(!partner){status('Choose an available classmate first.');return;}busy=true;$('invite').disabled=true;try{const result=await mutate('invite',{partner});await refresh(true);status('Pair registered for both students · '+result.receipt);}catch(e){report(e);}finally{busy=false;if($('invite'))$('invite').disabled=!state?.isOpen;}}
  function startPreview(){preview=true;dirty=false;team={id:'preview',members:[{key:'demo-a',name:'Alex Example'},{key:'demo-b',name:'Sam Example'}],status:'confirmed',receipt:'PREVIEW',destination:'cartagena',assistant:'demo-a',decision:'I want to visit Cartagena because I like the sea.',revision:0,files:[]};$('teacher').hidden=$('student').hidden=true;$('preview-workspace').hidden=false;renderPair($('preview-content'),team);status('Teacher preview. The actual registration setting is unchanged.');}
  function reset(){clearTimeout(planTimer);reviewTimers.forEach(clearTimeout);reviewTimers.clear();reviewJobs.clear();reviewDirty.clear();pending.clear();state=team=null;preview=dirty=planSaving=planConflict=busy=false;signature=teacherSignature=selectedTeacher='';$('my-pair').replaceChildren();$('teams').replaceChildren();$('preview-content').replaceChildren();$('partner').innerHTML='<option value="">Choose a classmate…</option>';$('teacher').hidden=$('student').hidden=$('preview-workspace').hidden=true;}
  let identity='';async function sync(){const user=window.JaraLinguaAuth?.getUser?.()||window.JaraLinguaCurrentUser||null,key=(user?.provider||'')+':'+(user?.credential||'');if(key===identity)return;identity=key;client.setUser(user);reset();status(user?.credential?'Loading your exam workspace…':'Sign in with your Basic English 2 account to choose a partner.');if(user?.credential)try{await refresh(true);}catch(e){report(e);}}
  $('invite').onclick=invite;$('refresh').onclick=()=>refresh(true).catch(report);
  $('open').onclick=async()=>{try{await mutate('availability',{isOpen:true});await refresh();}catch(e){report(e);}};
  $('close').onclick=async()=>{try{await mutate('availability',{isOpen:false});await refresh();}catch(e){report(e);}};
  $('preview').onclick=startPreview;$('exit-preview').onclick=()=>{preview=false;dirty=false;team=null;$('preview-content').replaceChildren();refresh(true).catch(report);};
  $('reconnect-button').onclick=()=>window.JaraLinguaAuth?.openPanel?.();
  window.addEventListener('jaralingua:auth-changed',sync);window.addEventListener('beforeunload',()=>{if(dirty)backupPlan();});
  setInterval(()=>{tick();if(client.user?.credential&&!preview&&!busy&&!planSaving&&!reviewDirty.size&&!document.hidden)refresh(false).catch(report);},10000);
  setInterval(tick,1000);sync();setTimeout(sync,500);
})();
