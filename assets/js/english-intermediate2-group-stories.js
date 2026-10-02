/* Roster-assigned group stories. Authorization and phase checks are server-side. */
(()=>{'use strict';
const config={"pictures": [{"number": 1, "image": "/assets/img/english-intermediate-2/unit-5/group-stories/01-station.webp"}, {"number": 2, "image": "/assets/img/english-intermediate-2/unit-5/group-stories/02-picnic.webp"}, {"number": 3, "image": "/assets/img/english-intermediate-2/unit-5/group-stories/03-model.webp"}, {"number": 4, "image": "/assets/img/english-intermediate-2/unit-5/group-stories/04-bags.webp"}, {"number": 5, "image": "/assets/img/english-intermediate-2/unit-5/group-stories/05-celebration.webp"}, {"number": 6, "image": "/assets/img/english-intermediate-2/unit-5/group-stories/06-plant.webp"}, {"number": 7, "image": "/assets/img/english-intermediate-2/unit-5/group-stories/07-screen.webp"}, {"number": 8, "image": "/assets/img/english-intermediate-2/unit-5/group-stories/08-trail.webp"}, {"number": 9, "image": "/assets/img/english-intermediate-2/unit-5/group-stories/09-rehearsal.webp"}, {"number": 10, "image": "/assets/img/english-intermediate-2/unit-5/group-stories/10-dinner.webp"}], "frames": [["Appearance", "She looks nervous."], ["General impression", "She seems relieved."], ["Looks like + noun", "He looks like a volunteer."], ["Looks like + complete idea", "It looks like he needs help."], ["Feeling", "I feel bored."], ["Cause", "The instructions are confusing."], ["Opinion", "I think she is worried."], ["A guess", "I guess he is waiting for a friend."], ["A possibility", "Perhaps she needs more time."], ["Another possibility", "Maybe she is tired."]], "expressions": {"cheer up": {"kind": "Phrasal verb", "spanish": "Animarse / animar a alguien"}, "calm down": {"kind": "Phrasal verb", "spanish": "Calmarse"}, "open up": {"kind": "Phrasal verb", "spanish": "Abrirse y hablar de los sentimientos"}, "fit in": {"kind": "Phrasal verb", "spanish": "Encajar / sentirse integrado"}, "get along with": {"kind": "Phrasal verb", "spanish": "Llevarse bien con"}, "reach out to": {"kind": "Phrasal verb", "spanish": "Contactar para ofrecer o pedir ayuda"}, "stand up for": {"kind": "Phrasal verb", "spanish": "Defender / apoyar"}, "look up to": {"kind": "Phrasal verb", "spanish": "Admirar / respetar"}}, "audio": {"She looks nervous.": "audio/unit-5-explanation/0c497577f6dc52.mp3", "She seems relieved.": "audio/unit-5-explanation/ff7cf96bbfc73b.mp3", "He looks like a volunteer.": "audio/unit-5-explanation/37577618c30c8c.mp3", "It looks like he needs help.": "audio/unit-5-explanation/86e24080cd2cde.mp3", "I feel bored.": "audio/unit-5-explanation/d56c5d6d07c9e1.mp3", "The instructions are confusing.": "audio/unit-5-explanation/2ca9ce5b994d11.mp3", "I think she is worried.": "audio/unit-5-explanation/58913c53719cd0.mp3", "I guess he is waiting for a friend.": "audio/unit-5-explanation/9e103cd8c7b43f.mp3", "Perhaps she needs more time.": "audio/unit-5-explanation/c15a06e08755d7.mp3", "Maybe she is tired.": "audio/unit-5-explanation/bb8d89e2b5b49c.mp3", "cheer up": "audio/unit-5-explanation/582d818dd242dd.mp3", "calm down": "audio/unit-5-explanation/82ac382339aea9.mp3", "open up": "audio/unit-5-explanation/8236b1047b23d2.mp3", "fit in": "audio/unit-5-explanation/d4393349113d7c.mp3", "get along with": "audio/unit-5-explanation/33919b395e0771.mp3", "reach out to": "audio/unit-5-explanation/5d732cb45d5998.mp3", "stand up for": "audio/unit-5-explanation/99f30f876f9d7c.mp3", "look up to": "audio/unit-5-explanation/e64bef04711a4d.mp3"}};
const $=id=>document.getElementById(id),$$=s=>[...document.querySelectorAll(s)];
const root='/api/intermediate2/group-stories/';
let user=null,epoch=0,view=0,state=null,sessionId='',busy=false,controller=new AbortController();
let assignPicture=0,selected=new Set(),editorTeam=null,editorVersion=0,dirty=false,conflict=null;
let needsSignIn=false,recovery=null,loadingState=0;
const sessionMessage='Your session is no longer valid. Sign in again with the same account, review your work and save. Keep this tab open to retain your work.';
const retries=new Map(),openers=new Map();
const messages={registered_student_required:'Your account is not linked to the course student list. Ask your teacher to check your registered account.',identity_required:'Sign in with your registered account.',teacher_required:'A teacher account is required.',student_submission_only:'Only assigned students can submit a team story.',session_not_found:'This activity is not available for your account. Refresh your activity list.',team_not_found:'This team is not assigned to your account.',assignments_changed:'Assignments changed in another window. Refresh before continuing.',assignments_finished:'Assignments are already finished. Refresh the activity.',student_not_in_roster:'A selected student is no longer in the course list. Refresh and check the team.',student_assigned_twice:'A student can belong to only one team in this activity.',assign_at_least_one_team:'Assign at least one team before finishing.',roster_changed:'The student list changed. Refresh and check the assignments.',teams_have_started:'Students have already saved work. These assignments cannot be changed.',waiting_for_submissions:'Every assigned team must submit its current version before presentations start.',presentations_started:'Presentations have started. Editing is closed.',wrong_phase:'The activity phase changed. Refresh the page.',write_your_story:'Write your group’s story before submitting.',include_a_phrasal_verb:'Enter the phrasal verb used in your story.',include_every_speaker:'Confirm that every member has a named speaking part.',invalid_text:'Check the text fields and their lengths.',stories_temporarily_unavailable:'The workspace is temporarily unavailable. Your editor text is still here. Try again.'};
function errorMessage(e,target='gsStatus'){if(e.name==='AbortError'||e.message==='session_changed')return;if(e.status===401||e.message==='session_required'){needsSignIn=true;showRecovery();$(target).textContent=sessionMessage;return;}$(target).textContent=messages[e.message]||e.message||'Could not complete the request. Try again.';}
function node(tag,text,cls){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;}
function staff(){return ['teacher','admin'].includes(state?.role);}
function room(){return state?.session;}
function teamFor(n){return state?.teams.find(t=>t.picture===n);}
function picture(n){return config.pictures.find(p=>p.number===n);}
function modal(dialog,trigger){stopAudio();openers.set(dialog,trigger||document.activeElement);dialog.showModal();document.documentElement.classList.add('gs-modal-open');}
function requestId(action,payload){const key=JSON.stringify([action,payload]);if(!retries.has(key))retries.set(key,crypto.randomUUID());return retries.get(key);}
function identity(account){const id=account?.sub||account?.email?.toLowerCase();return account?.credential&&id?(account.provider||'google')+':'+id:'';}
function showRecovery(){
 $('gsSignIn').hidden=!!user?.credential&&!needsSignIn;$('gsSignIn').textContent=needsSignIn?'Sign in again':'Sign in';
 $$('[data-gs-reauth]').forEach(b=>b.hidden=!needsSignIn);
 if(needsSignIn)$('gsStatus').textContent=sessionMessage;
}
function rememberWork(){
 if(!identity(user))return null;
 return {owner:identity(user),sessionId,name:$('gsName').value,retries:new Map(retries),
  assignment:$('gsAssign').open?{picture:assignPicture,revision:room()?.revision,selected:[...selected]}:null,
  editor:$('gsEditor').open&&editorTeam?{teamId:editorTeam.id,picture:editorTeam.picture,revision:editorVersion,story:$('gsText').value,phrasal:$('gsPhrasal').value,everyone:$('gsEveryone').checked,dirty}:null};
}
function beginSignIn(){
 if(needsSignIn&&user?.credential){recovery=recovery||rememberWork();document.querySelector('[data-auth-signout]')?.click();}
 window.JaraLinguaAuth?.openPanel();
}
for(const id of ['gsAssign','gsEditor']){
 const b=node('button','Sign in again · keep my work','intermediate2-button gs-reauth');b.type='button';b.dataset.gsReauth='';b.hidden=true;
 b.addEventListener('click',e=>{e.stopPropagation();beginSignIn();});$(id).querySelector('footer').prepend(b);
}
async function request(action,payload){
 if(needsSignIn||!user?.credential||(Number(user.exp)>0&&Number(user.exp)<=Date.now()/1000))throw new Error('session_required');const ticket=epoch;
 const headers={Authorization:'Bearer '+user.credential,'X-Jaralingua-Auth-Provider':user.provider||'google'};
 const options={headers,cache:'no-store',signal:controller.signal};if(payload){headers['Content-Type']='application/json';options.method='POST';options.body=JSON.stringify({...payload,requestId:requestId(action,payload)});}
 const res=await fetch(root+action,options);if(ticket!==epoch)throw new Error('session_changed');let data={};try{data=await res.json();}catch{}
 if(ticket!==epoch)throw new Error('session_changed');if(!res.ok){const e=new Error(res.status===401?'session_required':data.error||'The request failed. Try again.');e.status=res.status;e.latest=data.latest;throw e;}return data;
}
async function loadState(id=sessionId){
 const ticket=epoch,screen=++view;loadingState++;
 try{
  let data=await request('state'+(id?'?sessionId='+encodeURIComponent(id):''));if(ticket!==epoch||screen!==view)return;
  // Open the student's newest writable assignment, rather than an empty workspace.
  if(!id&&!['teacher','admin'].includes(data.role)&&data.sessions.length){
   const assigned=data.sessions.find(s=>s.phase==='writing')||data.sessions[0];
   data=await request('state?sessionId='+encodeURIComponent(assigned.id));if(ticket!==epoch||screen!==view)return;
  }
  state=data;sessionId=data.session?.id||'';render();
 }finally{loadingState--;}
}
function render(){
 $('gsAccount').hidden=false;$('gsCreate').hidden=!staff();
 $('gsStatus').textContent=(staff()?'Teacher workspace · ':'Signed in as ')+state.name;
 const select=$('gsSession');select.replaceChildren(new Option('Choose an activity',''));state.sessions.forEach(s=>select.add(new Option(s.name,s.id)));select.value=sessionId;
 if(!staff()&&!state.sessions.length)$('gsStatus').textContent='Waiting for your teacher to finish the assignments. Your team will appear here automatically. If it does not, check that you signed in with your registered course account.';
 $('gsRoom').hidden=!room();
 if(room()){
  const r=room();$('gsRoomName').textContent=r.name;
  $('gsProgress').textContent=r.phase==='assigning'?r.teamCount+' teams assigned':r.submittedCount+' / '+r.teamCount+' teams submitted'+(r.phase==='presenting'?' · Presentations started':'');
  $('gsFinalize').hidden=!staff()||r.phase!=='assigning';$('gsFinalize').disabled=!r.teamCount||busy;
  $('gsReturn').hidden=!staff()||r.phase!=='writing';$('gsReturn').disabled=busy||state.teams.some(t=>t.entry.revision>0);
  $('gsStart').hidden=!staff()||r.phase==='assigning';$('gsStart').disabled=busy||!r.readyToPresent;$('gsStart').textContent=r.phase==='presenting'?'Presentations started':'Start presentations';
  $('gsRoomNote').textContent=r.phase==='assigning'?'Select students on each image. Leave unused pictures unassigned, then finish assignments.':r.phase==='presenting'?'Editing is closed. Open a submitted team’s picture to present.':staff()?'The button opens when every assigned team has submitted. This count refreshes automatically.':'Click your assigned picture to write with your team. You can revise your story until presentations start.';
 }
 renderCards();renderMyTeam();showRecovery();
}
function renderMyTeam(){
 const team=!staff()&&room()?state.teams[0]:null;
 $('gsMyTeam').hidden=!team;
 if(!team){$('gsMyTeamInfo').textContent='';$('gsOpenMyStory').removeAttribute('data-team-open');return;}
 $('gsMyTeamInfo').textContent='Your team · Picture '+team.picture+' · '+team.members.map(m=>m.name).join(' · ');
 $('gsMyTeamNote').textContent=room().phase==='writing'?'Any team member can write, save and submit. You all share the same text and submission.':'Presentations have started. Your team submission is now read-only.';
 $('gsOpenMyStory').textContent=room().phase==='writing'?'Write and submit our story':'View our team presentation';
 $('gsOpenMyStory').dataset.teamOpen=team.picture;$('gsOpenMyStory').disabled=busy;
}
function renderCards(){
 for(const p of config.pictures){const card=document.querySelector('[data-picture="'+p.number+'"]'),info=card.querySelector('.gs-card-info'),team=teamFor(p.number);info.replaceChildren();card.classList.toggle('is-mine',!!team&&!staff());
  if(!room())continue;
  if(team){info.append(node('strong','Team · Picture '+p.number),node('p',team.members.map(m=>m.name).join(' · ')));const status=room().phase==='assigning'?'Assigned':team.entry.status==='submitted'?'Submitted':team.entry.status==='draft'?'Draft saved':'Not submitted';info.append(node('span',status,'gs-badge is-'+team.entry.status));}
  if(staff()&&room().phase==='assigning'){const b=node('button',team?'Change students':'Assign students','intermediate2-button');b.type='button';b.dataset.assign=p.number;b.disabled=busy;info.append(b);}
  else if(team){const label=room().phase==='presenting'?'Open presentation':staff()?'Awaiting presentations':team.entry.status==='submitted'?'View / edit our submission':'Write and submit our story';const b=node('button',label,'intermediate2-button'+(!staff()?' primary':''));b.type='button';b.dataset.teamOpen=p.number;b.disabled=busy||(staff()&&room().phase!=='presenting');info.append(b);}
  else if(!staff())info.append(node('p','Not assigned to your team.'));
 }
}
async function teacherAction(action,payload,target='gsStatus'){
 if(busy)return;const ticket=epoch;busy=true;$('gsSession').disabled=true;renderCards();
 try{const result=await request(action,payload);if(ticket!==epoch)return;await loadState(result.sessionId||sessionId);return result;}catch(e){errorMessage(e,target);}finally{if(ticket===epoch){busy=false;$('gsSession').disabled=false;const status=$('gsStatus').textContent;if(state)render();$('gsStatus').textContent=status;}}
}
$('gsCreate').addEventListener('submit',async e=>{e.preventDefault();const result=await teacherAction('create',{name:$('gsName').value});if(result)$('gsName').value='';});
$('gsSession').addEventListener('change',()=>loadState($('gsSession').value).catch(e=>errorMessage(e)));
$('gsRefresh').addEventListener('click',()=>{if(!busy)loadState().catch(e=>errorMessage(e));});
$('gsSignIn').addEventListener('click',e=>{e.stopPropagation();beginSignIn();});
$('gsFinalize').addEventListener('click',async()=>{if(!room())return;await teacherAction('finalize',{sessionId,revision:room().revision});});
$('gsReturn').addEventListener('click',async()=>{if(!room())return;await teacherAction('return-to-assignments',{sessionId,revision:room().revision});});
$('gsStart').addEventListener('click',async()=>{if(!room())return;await teacherAction('start',{sessionId,revision:room().revision});});
function openAssignment(n,trigger){if(!staff()||room()?.phase!=='assigning')return;assignPicture=n;selected=new Set(teamFor(n)?.members.map(m=>m.id)||[]);$('gsAssignTitle').textContent='Picture '+n+' · Assign students';$('gsRosterSearch').value='';$('gsAssignStatus').textContent='';renderRoster();modal($('gsAssign'),trigger);}
function renderRoster(){
 const filter=$('gsRosterSearch').value.trim().toLocaleLowerCase(),field=$('gsRoster');field.replaceChildren(node('legend','Students in the course','gs-sr-only'));
 for(const person of state.roster){if(filter&&!person.name.toLocaleLowerCase().includes(filter))continue;const other=state.teams.find(t=>t.picture!==assignPicture&&t.members.some(m=>m.id===person.id));const label=node('label'),box=document.createElement('input');box.type='checkbox';box.value=person.id;box.checked=selected.has(person.id);box.disabled=!!other||busy;const copy=node('span',person.name);if(other)copy.append(node('small','Assigned to picture '+other.picture));label.append(box,copy);field.append(label);}
 $('gsSelectedCount').textContent=selected.size+' selected';
}
$('gsRosterSearch').addEventListener('input',renderRoster);
$('gsRoster').addEventListener('change',e=>{if(!e.target.matches('input[type=checkbox]'))return;e.target.checked?selected.add(e.target.value):selected.delete(e.target.value);$('gsSelectedCount').textContent=selected.size+' selected';});
$('gsApply').addEventListener('click',async()=>{if(!room()||busy)return;const assignments=state.teams.filter(t=>t.picture!==assignPicture).map(t=>({picture:t.picture,studentIds:t.members.map(m=>m.id)}));assignments.push({picture:assignPicture,studentIds:[...selected]});$('gsApply').disabled=true;const result=await teacherAction('assign',{sessionId,revision:room().revision,assignments},'gsAssignStatus');$('gsApply').disabled=false;if(result)$('gsAssign').close();});
function fillEntry(entry){$('gsText').value=entry.story;$('gsPhrasal').value=entry.phrasalVerb;$('gsEveryone').checked=entry.status==='submitted';editorVersion=entry.revision;dirty=false;conflict=null;$('gsConflict').hidden=true;showReceipt(entry);}
function showReceipt(entry){$('gsSaveStatus').textContent=entry.status==='submitted'?'Submitted to teacher · '+new Date(entry.submittedAt).toLocaleString()+' · Receipt '+entry.receiptId:entry.revision?'Draft saved · '+new Date(entry.updatedAt).toLocaleString()+'. Submit it when your team is ready.':'';}
function setEditorLocked(locked){for(const id of ['gsText','gsPhrasal','gsEveryone','gsDraft','gsSend'])$(id).disabled=locked;$$('#gsNameButtons button').forEach(b=>b.disabled=locked);$('gsEditHint').textContent=locked?'Presentations have started. This saved version is locked.':'Write one shared text. Put each speaker’s name before their part.';}
async function openEditor(n,trigger){
 if(!room()||staff())return;const ticket=epoch,currentSession=sessionId;await loadState();if(ticket!==epoch||currentSession!==sessionId)return;const team=teamFor(n);if(!team)return;editorTeam=team;
 $('gsEditorTitle').textContent='Picture '+n+' · Our story';$('gsEditorImage').src=picture(n).image;$('gsEditorMembers').textContent=team.members.map(m=>m.name).join(' · ');$('gsEditorStatus').textContent='One shared version for your team.';$('gsNameButtons').replaceChildren();
 team.members.forEach(m=>{const b=node('button','+ '+m.name);b.type='button';b.addEventListener('click',()=>{const t=$('gsText');t.setRangeText((t.value?'\n\n':'')+m.name+': ',t.selectionStart,t.selectionEnd,'end');dirty=true;t.focus();});$('gsNameButtons').append(b);});
 fillEntry(team.entry);setEditorLocked(room().phase!=='writing');modal($('gsEditor'),trigger);
}
function changed(){dirty=true;$('gsSaveStatus').textContent='Unsaved changes. Save a draft or submit your updated story.';}
$('gsStoryForm').addEventListener('input',changed);
async function saveStory(action){
 if(busy||!editorTeam||conflict)return;
 if(action==='submit'&&(!$('gsText').value.trim()||!$('gsPhrasal').value.trim()||!$('gsEveryone').checked)){$('gsSaveStatus').textContent=!$('gsText').value.trim()?messages.write_your_story:!$('gsPhrasal').value.trim()?messages.include_a_phrasal_verb:messages.include_every_speaker;return;}
 const ticket=epoch;busy=true;$('gsDraft').disabled=true;$('gsSend').disabled=true;
 const payload={teamId:editorTeam.id,revision:editorVersion,story:$('gsText').value,phrasalVerb:$('gsPhrasal').value,everyoneIncluded:$('gsEveryone').checked};
 try{const result=await request(action,payload);if(ticket!==epoch)return;editorVersion=result.entry.revision;editorTeam.entry=result.entry;
  // Preserve text typed while the request was in flight.
  dirty=$('gsText').value!==payload.story||$('gsPhrasal').value!==payload.phrasalVerb||$('gsEveryone').checked!==payload.everyoneIncluded;
  if(dirty)$('gsSaveStatus').textContent='The sent version was saved. Your newer edits are still unsaved.';else showReceipt(result.entry);
  const t=teamFor(editorTeam.picture);if(t)t.entry=result.entry;renderCards();
 }catch(e){if(ticket!==epoch)return;if(e.message==='story_changed'&&e.latest){conflict=e.latest;$('gsLatestText').textContent=e.latest.story;$('gsLatestPhrasal').textContent='Phrasal verb: '+e.latest.phrasalVerb;$('gsConflict').hidden=false;$('gsSaveStatus').textContent='Compare the saved version before saving again.';$('gsConflict').scrollIntoView({block:'start',behavior:'instant'});}else{errorMessage(e,'gsSaveStatus');if(e.message==='presentations_started'){setEditorLocked(true);if(room())room().phase='presenting';}}}
 finally{if(ticket===epoch){busy=false;$('gsDraft').disabled=!!conflict||room()?.phase!=='writing';$('gsSend').disabled=!!conflict||room()?.phase!=='writing';}}
}
$('gsStoryForm').addEventListener('submit',e=>{e.preventDefault();saveStory('submit');});$('gsDraft').addEventListener('click',()=>saveStory('save'));
$('gsUseLatest').addEventListener('click',()=>{if(!conflict)return;fillEntry(conflict);setEditorLocked(room()?.phase!=='writing');});
$('gsKeepMine').addEventListener('click',()=>{if(!conflict)return;editorVersion=conflict.revision;conflict=null;$('gsConflict').hidden=true;dirty=true;$('gsSaveStatus').textContent='Your text is ready to save as a new version.';setEditorLocked(room()?.phase!=='writing');});
function editorCanClose(){return !dirty||confirm('Your latest edits are not saved. Close the editor and discard those edits?');}
$('gsEditor').addEventListener('cancel',e=>{if(!editorCanClose())e.preventDefault();});
$('gsEditor').addEventListener('close',()=>{if($('gsEditor').open)return;editorTeam=null;dirty=false;conflict=null;$('gsText').value='';$('gsPhrasal').value='';$('gsEveryone').checked=false;$('gsConflict').hidden=true;if(user?.credential&&!needsSignIn&&!recovery)loadState().catch(e=>errorMessage(e));});
let ownsFullscreen=false,remaining=120000,deadline=0,timer=null;
function tick(){if(deadline)remaining=Math.max(0,deadline-performance.now());const seconds=Math.ceil(remaining/1000);$('gsTime').textContent=String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0');if(!remaining&&deadline){clearInterval(timer);timer=null;deadline=0;$('gsTimerNote').textContent='Two minutes reached. Finish your story.';}$('gsTimerToggle').textContent=deadline?'Pause timer':remaining<120000&&remaining>0?'Resume timer':'Start timer';$('gsTimerToggle').disabled=!remaining;}
function pauseTimer(){if(deadline){remaining=Math.max(0,deadline-performance.now());deadline=0;clearInterval(timer);timer=null;}tick();}
function resetTimer(){pauseTimer();remaining=120000;$('gsTimerNote').textContent='Everyone speaks.';tick();}
$('gsTimerToggle').addEventListener('click',()=>{if(deadline)pauseTimer();else if(remaining){deadline=performance.now()+remaining;timer=setInterval(tick,200);tick();}});$('gsTimerReset').addEventListener('click',resetTimer);
function project(n,trigger){const team=teamFor(n),ready=room()?.phase==='presenting'&&team?.entry.status==='submitted';$('gsProjectTitle').textContent='Picture '+String(n).padStart(2,'0');$('gsProjectNames').textContent=ready?team.members.map(m=>m.name).join(' · '):'';$('gsProjectImage').src=picture(n).image;$('gsImageStatus').textContent='';$('gsProjectedText').textContent=ready?team.entry.story:'';$('gsProjectStory').hidden=!ready;$('gsProjectStage').classList.toggle('has-story',ready);$('gsToggleStory').hidden=!ready;$('gsToggleStory').textContent='Hide story';$('gsToggleStory').setAttribute('aria-expanded',String(ready));$('gsTimerControls').hidden=!ready||!staff();resetTimer();modal($('gsProjector'),trigger);$('gsProjectStage').scrollTop=0;}
$('gsProjectImage').addEventListener('error',()=>$('gsImageStatus').textContent='The image could not load. Close and reopen it to retry.');
$('gsToggleStory').addEventListener('click',()=>{const show=$('gsProjectStory').hidden;$('gsProjectStory').hidden=!show;$('gsProjectStage').classList.toggle('has-story',show);$('gsToggleStory').textContent=show?'Hide story':'Show story';$('gsToggleStory').setAttribute('aria-expanded',String(show));});
$('gsProjector').addEventListener('close',()=>{pauseTimer();$('gsProjectedText').textContent='';$('gsProjectNames').textContent='';if(ownsFullscreen&&document.fullscreenElement)document.exitFullscreen().catch(()=>{});ownsFullscreen=false;});
$('gsFullscreen').hidden=!document.documentElement.requestFullscreen||!document.fullscreenEnabled;
$('gsFullscreen').addEventListener('click',async()=>{try{if(ownsFullscreen&&document.fullscreenElement){await document.exitFullscreen();ownsFullscreen=false;}else{await document.documentElement.requestFullscreen();ownsFullscreen=true;$('gsFullscreen').textContent='Exit full screen';}}catch{$('gsImageStatus').textContent='Full screen is not available here. This enlarged view remains available.';}});
document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement){ownsFullscreen=false;$('gsFullscreen').textContent='Full screen';}});
document.addEventListener('click',e=>{const close=e.target.closest('[data-close]');if(close){const d=$(close.dataset.close);if(d===$('gsEditor')&&!editorCanClose())return;d.close();return;}const assignment=e.target.closest('[data-assign]');if(assignment){openAssignment(Number(assignment.dataset.assign),assignment);return;}const target=e.target.closest('[data-team-open],[data-open]');if(target){const n=Number(target.dataset.teamOpen||target.dataset.open),t=teamFor(n);if(t&&!staff()&&room()?.phase==='writing')openEditor(n,target).catch(e=>errorMessage(e));else project(n,target);}});
for(const id of ['gsAssign','gsEditor','gsProjector'])$(id).addEventListener('close',()=>{if(!$('gsAssign').open&&!$('gsEditor').open&&!$('gsProjector').open)document.documentElement.classList.remove('gs-modal-open');const opener=openers.get($(id));if(opener?.isConnected)opener.focus({preventScroll:true});else document.querySelector('[data-picture="'+(assignPicture||1)+'"] [data-open]')?.focus({preventScroll:true});});

// A single pronunciation player keeps inline words and speed controls in sync.
const player=new Audio();player.preload='none';let rate=.75,audioTicket=0,lastAudio=null;
function syncAudio(){$$('[data-audio]').forEach(b=>b.setAttribute('aria-pressed',String(!player.paused&&!player.ended&&player.src===new URL(b.dataset.audio,location.href).href)));}
function stopAudio(){audioTicket++;player.pause();syncAudio();}
function audioError(){if(!lastAudio?.isConnected)return;$$('.gs-audio-error').forEach(e=>e.remove());const e=node('span','Audio could not play. Tap the words to retry.','gs-audio-error');e.setAttribute('role','status');lastAudio.after(e);}
['play','pause','ended'].forEach(e=>player.addEventListener(e,syncAudio));player.addEventListener('error',audioError);
async function play(b){const src=new URL(b.dataset.audio,location.href).href;if(src===player.src&&!player.paused){stopAudio();return;}stopAudio();lastAudio=b;const ticket=++audioTicket;$$('.gs-audio-error').forEach(e=>e.remove());player.src=src;player.load();player.playbackRate=rate;try{await player.play();if(ticket===audioTicket)syncAudio();}catch(e){if(ticket===audioTicket&&e.name!=='AbortError')audioError();}}
document.addEventListener('click',e=>{const audio=e.target.closest('[data-audio]');if(audio){play(audio);return;}const speed=e.target.closest('[data-speed]');if(speed){rate=Number(speed.dataset.speed);player.playbackRate=rate;$$('[data-speed]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.speed)===rate)));}if(e.target.closest('[data-stop]'))stopAudio();});
function viewportSize(){const v=window.visualViewport;document.documentElement.style.setProperty('--gs-view-height',(v?.height||innerHeight)+'px');document.documentElement.style.setProperty('--gs-view-top',(v?.offsetTop||0)+'px');}
window.visualViewport?.addEventListener('resize',viewportSize);window.visualViewport?.addEventListener('scroll',viewportSize);window.addEventListener('resize',viewportSize);viewportSize();
let authPanel=null,authObserver=null,authEvents=null;
function prepareAuth(){const panel=document.querySelector('[data-auth-panel]');if(panel===authPanel)return;authObserver?.disconnect();authEvents?.abort();authPanel=panel;if(!panel)return;authEvents=new AbortController();const place=()=>{const v=window.visualViewport;panel.style.setProperty('--gs-auth-top',((v?.offsetTop||0)+12)+'px');panel.style.setProperty('--gs-auth-height',Math.max(120,(v?.height||innerHeight)-24)+'px');if(typeof panel.showPopover==='function'){if(!panel.hasAttribute('popover'))panel.setAttribute('popover','manual');if(panel.hidden){if(panel.matches(':popover-open'))panel.hidePopover();}else if(!panel.matches(':popover-open'))panel.showPopover();}};authObserver=new MutationObserver(place);authObserver.observe(panel,{attributes:true,attributeFilter:['hidden']});window.visualViewport?.addEventListener('resize',place,{signal:authEvents.signal});window.visualViewport?.addEventListener('scroll',place,{signal:authEvents.signal});place();}
new MutationObserver(prepareAuth).observe(document.body,{childList:true,subtree:true});prepareAuth();document.addEventListener('keydown',e=>{if(e.key==='Escape'&&authPanel&&!authPanel.hidden)authPanel.hidden=true;});
async function restoreWork(saved,ticket){
 await loadState(saved.sessionId);if(ticket!==epoch)return;
 $('gsName').value=saved.name;for(const [key,id] of saved.retries)retries.set(key,id);
 if(saved.assignment&&staff()&&room()?.phase==='assigning'){
  const a=saved.assignment;openAssignment(a.picture);
  const allowed=new Set(state.roster.filter(person=>!state.teams.some(t=>t.picture!==a.picture&&t.members.some(m=>m.id===person.id))).map(p=>p.id));
  selected=new Set(a.selected.filter(id=>allowed.has(id)));renderRoster();
  $('gsAssignStatus').textContent='Session restored. Review your selection and click Save this team.'+(a.revision!==room().revision?' Assignments changed while you were signing in.':'');
 }else if(saved.editor&&!staff()&&teamFor(saved.editor.picture)?.id===saved.editor.teamId){
  const draft=saved.editor;await openEditor(draft.picture);if(ticket!==epoch)return;
  $('gsText').value=draft.story;$('gsPhrasal').value=draft.phrasal;$('gsEveryone').checked=draft.everyone;editorVersion=draft.revision;dirty=draft.dirty;
  $('gsSaveStatus').textContent=room()?.phase==='writing'?'Session restored. Your unsent text is here. Save a draft or submit when ready.':'Your unsent text is here, but presentations have started. Copy it before closing; editing is locked.';
 }else if(saved.assignment||saved.editor){$('gsStatus').textContent='Session restored, but the assignment or activity changed. Refresh and check with your teacher; nothing was sent.';}
 else $('gsStatus').textContent='Session restored. Continue when ready; nothing was sent automatically.';
 if(recovery===saved)recovery=null;
}
function authChanged(){
 const next=window.JaraLinguaAuth?.getUser()||window.JaraLinguaCurrentUser||null;
 if(needsSignIn&&!recovery)recovery=rememberWork();
 if(next?.credential&&recovery?.owner!==identity(next))recovery=null;
 const saved=recovery;epoch++;view++;const ticket=epoch;controller.abort();controller=new AbortController();user=next;needsSignIn=false;
 state=null;sessionId='';busy=false;dirty=false;editorTeam=null;selected=new Set();conflict=null;retries.clear();stopAudio();pauseTimer();
 for(const id of ['gsAssign','gsEditor','gsProjector'])if($(id).open)$(id).close();
 $('gsRoster').replaceChildren();$('gsNameButtons').replaceChildren();$('gsLatestText').textContent='';$('gsLatestPhrasal').textContent='';$('gsEditorMembers').textContent='';$('gsSaveStatus').textContent='';$('gsText').value='';$('gsPhrasal').value='';$('gsEveryone').checked=false;$('gsName').value='';
 $('gsSession').replaceChildren(new Option('Choose an activity',''));$('gsSession').disabled=false;
 ['gsRoomName','gsProgress','gsRoomNote','gsEditorStatus','gsAssignStatus','gsProjectNames','gsProjectedText'].forEach(id=>$(id).textContent='');
 $('gsAccount').hidden=true;$('gsRoom').hidden=true;showRecovery();
 $('gsStatus').textContent=user?.credential?'Loading your class workspace…':saved?'Sign in with the same account to recover your work. Keep this tab open.':'Sign in to open your assigned team or manage your class.';renderCards();renderMyTeam();
 if(user?.credential)(saved?restoreWork(saved,ticket):loadState('')).catch(e=>{if(ticket!==epoch)return;errorMessage(e);$('gsSignIn').hidden=false;});
}
window.addEventListener('jaralingua:auth-changed',authChanged);if(document.readyState!=='complete')window.addEventListener('load',authChanged,{once:true});authChanged();
function refreshWorkspace(){if(user?.credential&&!needsSignIn&&!recovery&&!busy&&!loadingState&&!document.hidden&&!$('gsAssign').open&&!$('gsEditor').open&&!$('gsProjector').open&&(!staff()||room()?.phase==='writing'))loadState().catch(e=>errorMessage(e));}
setInterval(refreshWorkspace,10000);window.addEventListener('focus',refreshWorkspace);document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshWorkspace();});
window.addEventListener('beforeunload',e=>{if(dirty||recovery||$('gsAssign').open){e.preventDefault();e.returnValue='';}});window.addEventListener('pagehide',()=>{stopAudio();pauseTimer();});document.addEventListener('visibilitychange',()=>{if(document.hidden){stopAudio();pauseTimer();}});
})();
