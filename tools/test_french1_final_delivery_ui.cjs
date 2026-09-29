const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const html = fs.readFileSync('frances/Niveau 1/examen-final.html', 'utf8');
const source = html.slice(html.indexOf('      async function submitExam(event)'), html.indexOf('      function renderStartGate(payload)'));
const receipt = {studentId:'s1',attemptId:'a1',examVersion:'v1',receiptCode:'REC-TEST',studentName:'Test'};
function harness(mode='success') {
  let calls=0, cleared=0, focused=0, scrolled=0, submitted=0, dialogShown=0, status='', latest=0;
  const panel={focus(){focused++;},scrollIntoView(){scrolled++;}};
  const dialog={querySelector:()=>({}),showModal(){dialogShown++;}};
  const c={submitting:false,submittingAutomatically:false,examAuthInterrupted:false,pendingAutomaticSubmit:false,
    currentStudentId:'s1',currentAttemptId:'a1',currentDraftKey:'draft',currentExam:{version:'v1'},currentState:{releaseResults:false},
    examInProgress:true,audioReady:true,audioLoadToken:0,audioObjectUrl:null,draftPendingAnswers:null,startGateActive:false,accountVerificationBlocked:false,
    els:{root:{},admin:{},access:{innerHTML:'',querySelector:()=>panel},form:{innerHTML:'FORM',querySelector:s=>s==='[data-confirm-dialog]'?dialog:null}},
    document:{querySelector:()=>({textContent:'10:00'})},window:{setTimeout(){},confirm:()=>true},URL:{revokeObjectURL(){}},
    API:{submit:'/submit',state:'/state'},allQuestions:()=>[1],
    collectAnswers:()=>({answers:{q:latest},missing:0}),
    saveServerDraft:async()=>{latest=2;},
    request:async(path,options)=>{
      if(path==='/state')return {ok:true,data:{submitted:mode==='offline'?null:receipt}};
      calls++;submitted=JSON.parse(options.body).answers.q;
      if((mode==='lost'&&calls===1)||mode==='offline')throw new Error('Connection interrupted');
      if(mode==='lost')return {ok:false,status:409,data:{error:'already_submitted',result:receipt}};
      if(mode==='duplicate')return {ok:false,status:409,data:{error:'already_submitted',result:receipt}};
      return {ok:true,data:{result:receipt}};
    },setSubmitStatus:s=>{status=s;},updateSubmitAvailability(){},showReconnectNotice:s=>{status=s;},clearExamAccess(){},
    storedExamAuth:()=>null,activeUser:()=>({name:'Test'}),stopRuntimeLoops(){},clearDraft(){cleared++;},esc:String};
  vm.createContext(c);vm.runInContext(source,c);
  return {c,result:()=>({calls,cleared,focused,scrolled,submitted,dialogShown,status})};
}
(async()=>{
  for(const mode of ['success','lost','duplicate']){
    const h=harness(mode);
    await vm.runInContext('Promise.all([performSubmit(false),performSubmit(false)])',h.c);
    assert.equal(h.result().calls,mode==='lost'?2:1,'double tap sends once; lost response triggers one idempotent recovery');
    assert.equal(h.result().submitted,2,'latest answer after draft save must win');
    assert.equal(h.result().cleared,1);
    assert.equal(h.result().focused,1);
    assert.equal(h.result().scrolled,1);
    assert.match(h.c.els.access.innerHTML,/REC-TEST/);
    assert.match(h.c.els.access.innerHTML,/Votre examen final a été enregistré/);
    assert.equal(h.c.els.form.innerHTML,'');
  }
  const offline=harness('offline');await vm.runInContext('performSubmit(false)',offline.c);
  assert.equal(offline.result().cleared,0);assert.equal(offline.c.els.form.innerHTML,'FORM');
  assert.equal(offline.c.submitting,false);assert.match(offline.result().status,/réessayez/);
  const invalid=harness();invalid.c.submitting=true;
  vm.runInContext('renderSubmitted({studentId:"another",receiptCode:"wrong"})',invalid.c);
  assert.equal(invalid.result().cleared,0);assert.equal(invalid.c.submitting,false);
  const missing=harness();missing.c.collectAnswers=()=>({answers:{},missing:1});
  await vm.runInContext('submitExam({preventDefault(){}})',missing.c);
  assert.match(missing.result().status,/Il manque 1/);assert.equal(missing.result().calls,0);
  const confirm=harness();await vm.runInContext('submitExam({preventDefault(){}})',confirm.c);
  assert.equal(confirm.result().dialogShown,1);assert.equal(confirm.result().calls,0);
  assert.ok(html.includes('[data-confirm-submit]')&&html.includes('performSubmit(false)'));
  console.log('Passed: confirm, incomplete answers, latest answers, double click, lost response, duplicate, offline retry, wrong receipt, visible receipt.');
})().catch(e=>{console.error(e);process.exitCode=1;});
