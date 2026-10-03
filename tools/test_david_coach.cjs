const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),box={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'assets/js/conversation-coach-data/english-intermediate-2-unit-5-david.js'),'utf8'),box);
const c=box.window.JaraLinguaConversationCoachConfig;
assert.equal(c.questions.length,12);assert.equal(c.questions[0].unscored,true);assert.equal(c.questions[11].maxSeconds,180);
assert.equal(c.voice.id,'pv8WYYW60prEkDbDXyC0');assert.equal(c.questions[10].interaction,true);
const answer=(transcript,met=true)=>({transcript,analysis:{checks:[{met}],wordCount:20}});
const resolve=(text,index=1)=>c.responseResolver(answer(text),c.questions[index],c.questions[index])[0];
assert.equal(resolve("I'm not nervous because I know they are friendly.").file,'reply-calm.mp3');
assert.equal(resolve("I'm nervous.").file,'reply-nervous.mp3');
assert.equal(resolve("I'm excited and nervous.").file,'reply-mixed.mp3');
assert.equal(resolve("I'm not excited. I'm worried.").file,'reply-nervous.mp3');
assert.equal(resolve('What topics should I avoid?',10).file,'answer-avoid.mp3');
assert.equal(resolve('What is quantum mechanics?',10).file,'answer-clarify.mp3');
assert.equal(c.followUpResolver(answer('I am not very nervous.'),c.questions[1],c.followUpSets.feelings).id,'feelings-calm');
assert.equal(c.followUpResolver(answer('Nervous',false),c.questions[1],c.followUpSets.feelings).id,'feelings-help');
assert(c.isStudentQuestion('What would you wear?',c.questions[4],c.questions[4]));
assert(!c.isStudentQuestion('Sorry, could you repeat that?',c.questions[9],c.questions[9]));
assert(!c.isStudentQuestion('What do you enjoy cooking?',c.questions[6],c.questions[6]));
const mediaDir=path.join(root,'ingles/intermediate-2/audio/unit-5-david-coach');
const manifest=JSON.parse(fs.readFileSync(path.join(mediaDir,'models.json')));
assert.equal(manifest.items.length,Object.keys(c.audioScripts).length);
for(const item of manifest.items){assert.equal(item.text,c.audioScripts[item.file]);const bytes=fs.readFileSync(path.join(mediaDir,item.file));assert(bytes.length>1000);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),item.sha256);}
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream','--autoplay-policy=no-user-gesture-required']});
 try{
 const context=await browser.newContext({permissions:['microphone'],viewport:{width:1366,height:768}}),page=await context.newPage(),errors=[],posts=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(r.method()==='POST')posts.push(r.url());});
 await page.route('https://accounts.google.com/**',r=>r.fulfill({body:''}));
 let transcript='',mode='success';
 await page.route('**/api/english-intermediate/pronunciation-assessment',r=>r.fulfill({status:mode==='failure'?503:200,contentType:'application/json',body:JSON.stringify(mode==='failure'?{error:'Temporary test failure'}:{text:mode==='silence'?'':transcript,language_code:'en',words:mode==='no-confidence'?[]:transcript.split(/\s+/).map(word=>({word,probability:.92})),audio:{rms:mode==='silence'?0:.08}})}));
 await page.addInitScript(()=>{HTMLMediaElement.prototype.play=function(){setTimeout(()=>this.dispatchEvent(new Event('ended')),90);return Promise.resolve();};});
 const base=process.env.DAVID_BASE_URL||'http://127.0.0.1:8073',url=base+'/ingles/intermediate-2/conversation-coach-unit-5-david-first-impression.html';
 await page.goto(url);await page.locator('.jl-page-qr-open img').waitFor();
 const out='/private/tmp/jaralingua-david-qa';fs.mkdirSync(out,{recursive:true});
 const decoded=await page.evaluate(async()=>Promise.all(Object.keys(window.JaraLinguaConversationCoachConfig.audioScripts).map(file=>new Promise(resolve=>{const a=new Audio('audio/unit-5-david-coach/'+file);const t=setTimeout(()=>resolve({file,ok:false}),15000);a.onloadedmetadata=()=>{clearTimeout(t);resolve({file,ok:Number.isFinite(a.duration)&&a.duration>.4,duration:a.duration});};a.onerror=()=>{clearTimeout(t);resolve({file,ok:false});};a.load();}))));
 assert(decoded.every(a=>a.ok),JSON.stringify(decoded.filter(a=>!a.ok)));
 for(const [width,height] of [[360,800],[390,844],[768,1024],[1366,768],[1920,1080]]){
  await page.setViewportSize({width,height});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Onboarding overflow '+width);
  await page.locator('.jl-page-qr-open').click();assert(await page.locator('#jlPageQrDialog img').evaluate(e=>e.complete&&e.naturalWidth>0));await page.locator('.jl-page-qr-close').click();
  await page.screenshot({path:path.join(out,`start-${width}.png`),fullPage:true});
 }
 await page.setViewportSize({width:1366,height:768});await page.locator('.david-options>summary').click();await page.locator('#preflightButton').click();await page.locator('#preflightPlayback').waitFor({state:'visible'});
 await page.locator('#startConversationButton').click();
 await page.locator('#interviewPanel [data-coach-speed="0.75"]').click();assert.equal(await page.locator('#questionAudio').evaluate(a=>a.playbackRate),.75);
 await page.locator('#interviewPanel [data-coach-speed="1.25"]').click();assert.equal(await page.locator('#questionAudio').evaluate(a=>a.playbackRate),1.25);
 await page.locator('#interviewPanel [data-coach-speed="1"]').click();
 async function record(text,dock=false){transcript=text;await page.waitForFunction(()=>!document.querySelector('#micButton').disabled);await page.locator('#micButton').click();await page.waitForFunction(()=>!document.querySelector('#stopButton').disabled).catch(async e=>{console.error('Recorder state:',await page.locator('#turnCounter').innerText(),await page.locator('#recordStatus').innerText(),await page.locator('#unsupportedMessage').textContent());throw e;});await page.waitForTimeout(900);if(dock){await page.evaluate(()=>scrollTo(0,0));await page.locator('#floatingStopButton').click();}else await page.locator('#stopButton').click();}
 async function ready(){await page.waitForFunction(()=>!document.querySelector('#recordAgainButton').disabled && document.querySelector('#recordStatus').textContent==='Answer analyzed' && !document.querySelector('#questionPlayButton').disabled);}
 const answers=['Ana',"I'm not nervous because I know they are friendly and kind.","I'm worried about the conversation because I don't know their hobbies.","First I will ask my partner about their interests and check the arrival time.","I will wear a clean shirt and jeans because we are having lunch at home.","I will listen carefully and also offer to help after lunch.","We could talk about food. What do you enjoy cooking at home?","I would avoid salary questions because money can be a private topic.","Hello! It is lovely to meet you. Thank you for inviting me.","Sorry, I didn't catch that. Could you say it again, please?","What would you wear to a relaxed family lunch?","Hi Alex! This weekend I am going to meet my partner's family. I feel excited because I want to know them. First I will ask my partner about their interests. Then I will wear a clean shirt. I will also listen and offer to help. We could talk about food. However I will avoid private questions about salary. Wish me luck! Talk soon."];
 const followups={1:'I could include someone in the conversation and listen to them.',3:'If my bus is late I will call to explain.',6:"What is your favourite dish to cook with your family?",7:"I would prefer to keep that private. Could we talk about your garden?"};
 for(let i=0;i<12;i++){
  await page.waitForFunction(n=>document.querySelector('#turnCounter').textContent===`Turn ${n} of 12`,i+1);
  assert.equal(await page.locator('#answerSupport').getAttribute('open'),null);
  assert(await page.locator('#floatingMicDock').isVisible());
  if(i===4){await record('What would you wear?');await page.waitForFunction(()=>document.querySelector('#recordStatus').textContent==='Your question answered');assert(await page.locator('#nextTurnButton').isEnabled());assert.match(await page.locator('#coachReactionText').innerText(),/shirt and jeans/);}
  await record(answers[i],i===1);
  if(i===0){await ready();assert.match(await page.locator('#coachReactionText').innerText(),/Nice to meet you/);await page.locator('#nameCorrection summary').click();await page.locator('#correctedName').fill('Ángela');await page.locator('#saveCorrectedName').click();assert.equal(await page.locator('#liveTranscript').innerText(),'Ángela');}
  if(followups[i]){
   await page.waitForFunction(()=>document.querySelector('#turnCounter').textContent.includes('Follow-up'));
   assert(await page.locator('#nextTurnButton').isEnabled());
   if(i===1){assert.match(await page.locator('#coachReactionText').innerText(),/calm/);assert.match(await page.locator('#questionText').innerText(),/someone else/);}
   await page.locator('#answerSupport summary').click();assert((await page.locator('#answerFrames').innerText()).length>10);await page.locator('#answerSupport summary').click();
   await record(followups[i]);
  }
  await ready();
  if(i===4)for(const [width,height] of [[390,844],[768,1024],[1366,768]]){
   await page.setViewportSize({width,height});await page.locator('#interviewPanel').scrollIntoViewIfNeeded();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Active overflow '+width);
   await page.screenshot({path:path.join(out,`conversation-${width}.png`),fullPage:true});
  }
  if(i===10){assert.match(await page.locator('#coachReactionText').innerText(),/shirt and jeans/);await page.locator('#replyPlayButton').click();await ready();}
  await page.locator('#nextTurnButton').click();
 }
 await page.locator('#summaryPanel').waitFor({state:'visible'});assert(!await page.locator('#floatingMicDock').isVisible());assert(Number(await page.locator('#summaryScore').innerText())>0);
 const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem(window.JaraLinguaConversationCoachConfig.storageKey)));assert.equal(stored.lastReport.answers.length,12);assert.equal(stored.lastReport.answers.filter(x=>x.followUp).length,4);assert.equal(stored.lastReport.answers[0].turnScore,null);assert(!JSON.stringify(stored).includes('blob:'));
 await page.screenshot({path:path.join(out,'report.png'),fullPage:true});
 await page.locator('#restartConversationButton').click();mode='silence';await record('');await page.locator('#transcriptionRecovery').waitFor({state:'visible'});assert(!await page.locator('#turnFeedback').isVisible());
 mode='success';transcript='Ana';await page.locator('#retryTranscriptionButton').click();await ready();await page.locator('#nextTurnButton').click();
 mode='failure';await record('test');await page.locator('#transcriptionRecovery').waitFor({state:'visible'});await page.locator('#continueUnscoredButton').click();await page.waitForFunction(()=>document.querySelector('#turnCounter').textContent.includes('Follow-up'));assert(await page.locator('#nextTurnButton').isEnabled());
 mode='no-confidence';await record('I feel nervous because it is our first meeting.');await ready();assert(!/null/.test(await page.locator('#turnFeedback').innerText()));
 await page.reload();await page.locator('.david-options>summary').click();await page.locator('#realMode').check();await page.locator('#startConversationButton').click();assert(!await page.locator('#answerSupport').isVisible());
 mode='success';await record('Ana');await ready();assert(!await page.locator('#turnFeedback').isVisible());
 assert(posts.filter(u=>!u.endsWith('/csp-report')).every(u=>u.endsWith('/api/english-intermediate/pronunciation-assessment')));
 // Permission failure is visible and leaves the recorder usable after recovery.
 await page.reload();await page.evaluate(()=>{navigator.mediaDevices.getUserMedia=()=>Promise.reject(new DOMException('Denied','NotAllowedError'));});await page.locator('#startConversationButton').click();await page.waitForFunction(()=>!document.querySelector('#micButton').disabled);await page.locator('#micButton').click();await page.locator('#unsupportedMessage').waitFor({state:'visible'});
 // Opt-in hooks must retain the existing coach defaults.
 await page.goto(base+'/ingles/basico-2/conversation-coach-unit-4-weekend-leo.html');await page.locator('#startConversationButton').click();assert.notEqual(await page.locator('#answerSupport').getAttribute('open'),null);assert(await page.locator('#floatingMicDock').isVisible());
 assert.deepEqual(errors,[]);console.log(`PASS: ${decoded.length} decoded David MP3s, routing and negations, 12 stages/16 answers, name correction, student questions, all recording/recovery paths, QR, five responsive sizes, modes, private report and shared-engine defaults. Screenshots: ${out}`);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
