const {chromium}=require('C:/Users/USER/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=process.cwd(),box={window:{}};
vm.runInNewContext(fs.readFileSync('assets/js/conversation-coach-data/english-basic-2-unit-5-nora-memories.js','utf8'),box);
const config=box.window.JaraLinguaConversationCoachConfig;
assert.equal(config.questions.length,8);assert.equal(config.questions[7].expectedQuestionCount,1);
assert.ok(config.questions.every(q=>(q.text.match(/\?/g)||[]).length<=1));
assert.equal(Object.keys(config.audioScripts).length,32);
for(const file of Object.keys(config.audioScripts))assert.ok(fs.statSync(path.join(root,'ingles/basico-2/audio/unit5/nora-coach',file)).size>5000,file);

(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',args:['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream','--autoplay-policy=no-user-gesture-required']});
 const context=await browser.newContext({permissions:['microphone'],viewport:{width:1366,height:900}});
 const page=await context.newPage(),errors=[],requests=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(r.method()==='POST')requests.push(r.url());});
 await page.route('https://accounts.google.com/**',r=>r.abort());
 await page.route('**/assets/js/google-auth.js*',r=>r.fulfill({contentType:'text/javascript',body:''}));
 let transcript='',mode='success';
 await page.route('**/api/english-basic/pronunciation-assessment',r=>r.fulfill({status:mode==='failure'?503:200,contentType:'application/json',body:JSON.stringify(mode==='failure'?{error:'Temporary test failure'}:{text:mode==='foreign'?'Bonjour, je suis ici.':transcript,language_code:mode==='foreign'?'fr':'en',words:transcript.split(/\s+/).map(word=>({word,probability:.92})),audio:{rms:.08}})}));
 await page.addInitScript(()=>{HTMLMediaElement.prototype.play=function(){setTimeout(()=>this.dispatchEvent(new Event('ended')),50);return Promise.resolve();};});
 const base=process.env.NORA_TEST_BASE_URL||'http://127.0.0.1:8020',url=base+'/ingles/basico-2/conversation-coach-unit-5-nora-memories.html';
 await page.goto(url,{waitUntil:'networkidle'});
 const out=path.join(process.env.TEMP||'.','jaralingua-nora-qa');fs.mkdirSync(out,{recursive:true});
 const audio=await page.evaluate(async()=>Promise.all(Object.keys(window.JaraLinguaConversationCoachConfig.audioScripts).map(file=>new Promise(resolve=>{const a=new Audio('audio/unit5/nora-coach/'+file);const t=setTimeout(()=>resolve({file,ok:false}),10000);a.onloadedmetadata=()=>{clearTimeout(t);resolve({file,ok:Number.isFinite(a.duration)&&a.duration>.4,duration:a.duration});};a.onerror=()=>{clearTimeout(t);resolve({file,ok:false});};a.load();}))));
 assert.ok(audio.every(a=>a.ok),JSON.stringify(audio.filter(a=>!a.ok)));
 console.log('All 32 ElevenLabs MP3s decode; durations '+Math.min(...audio.map(a=>a.duration)).toFixed(2)+'–'+Math.max(...audio.map(a=>a.duration)).toFixed(2)+' seconds.');
 for(const width of [1366,1024,768,390,320]){
  await page.setViewportSize({width,height:900});
  const layout=await page.evaluate(()=>({w:innerWidth,scroll:document.documentElement.scrollWidth,shell:document.querySelector('.coach-shell').getBoundingClientRect().width,hero:getComputedStyle(document.querySelector('.coach-hero')).position,header:getComputedStyle(document.querySelector('.site-header')).position,images:[...document.images].every(i=>i.complete&&i.naturalWidth>0)}));
  assert.ok(layout.scroll<=width+2,JSON.stringify(layout));assert.ok(layout.shell>=width-46);assert.ok(!['fixed','sticky'].includes(layout.hero));assert.ok(!['fixed','sticky'].includes(layout.header));assert.ok(layout.images);
  if([1366,390].includes(width))await page.screenshot({path:path.join(out,'onboarding-'+width+'.png'),fullPage:true});
 }
 await page.setViewportSize({width:1366,height:900});
 assert.equal(await page.locator('details[open]').count(),0);
 await page.locator('#preflightButton').click();await page.waitForFunction(()=>!document.querySelector('#preflightPlayback').hidden);
 await page.locator('#startConversationButton').click();
 await page.locator('#interviewPanel [data-coach-speed="0.75"]').click();assert.equal(await page.locator('#questionAudio').evaluate(a=>a.playbackRate),.75);
 await page.locator('#interviewPanel [data-coach-speed="1.25"]').click();assert.equal(await page.locator('#questionAudio').evaluate(a=>a.playbackRate),1.25);
 await page.locator('#interviewPanel [data-coach-speed="1"]').click();
 const answers=['Hi Nora. My name is Ana.',"I'm tired today.",'I was at the beach last year.','I was alone that day.','It was peaceful and sunny.',"No, it wasn't. The shops weren't open.",'We went back to the beach. I had the time of my life.','Was it sunny on your trip?'];
 async function record(text){transcript=text;await page.waitForFunction(()=>!document.querySelector('#micButton').disabled);await page.locator('#micButton').click();await page.waitForTimeout(1300);await page.locator('#stopButton').click();}
 for(let i=0;i<8;i++){
  await page.waitForFunction(n=>document.querySelector('#turnCounter').textContent.startsWith('Turn '+n+' of'),i+1);
  assert.equal(await page.locator('#answerSupport').getAttribute('open'),null);
  assert.equal(await page.locator('#floatingMicDock').isVisible(),false);
  if(i===2){await record('I were at the beach last year.');await page.waitForFunction(()=>!document.querySelector('#nextTurnButton').disabled);assert.match(await page.locator('#turnFeedback').innerText(),/was or wasn’t, not were/);await page.locator('#recordAgainButton').click();}
  await record(answers[i]);await page.waitForFunction(()=>!document.querySelector('#nextTurnButton').disabled);
  assert.equal(await page.locator('#liveTranscript').innerText(),answers[i]);
  assert.equal(await page.locator('#turnFeedback details').getAttribute('open'),null);
  if(i===1)assert.match(await page.locator('#coachReactionText').innerText(),/take our time/);
  if(i===3)assert.match(await page.locator('#coachReactionText').innerText(),/on your own/);
  if(i===4){await page.screenshot({path:path.join(out,'conversation-desktop.png'),fullPage:true});await page.setViewportSize({width:390,height:844});await page.locator('#interviewPanel').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,'conversation-mobile.png'),fullPage:true});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));await page.setViewportSize({width:1366,height:900});}
  assert.ok(await page.locator('#coachReactionText').evaluate(el=>el.getBoundingClientRect().width>200),'Reaction text must not collapse into an icon-width column');
  if(i===7){assert.match(await page.locator('#coachReactionText').innerText(),/sunny and warm/);assert.equal(await page.locator('.coach-check.is-met').count(),1);assert.equal(await page.locator('.coach-feedback-metric strong').nth(1).textContent(),'10');}
  await page.locator('#nextTurnButton').click();
 }
 assert.equal(await page.locator('#summaryPanel').isVisible(),true);assert.ok(Number(await page.locator('#summaryScore').innerText())>0);
 assert.equal(await page.locator('#summaryPanel details[open]').count(),0);
 assert.ok(await page.evaluate(()=>!JSON.stringify(localStorage).includes('blob:')));
 await page.locator('#restartConversationButton').click();await page.waitForFunction(()=>!document.querySelector('#micButton').disabled);
 mode='foreign';await record(answers[0]);await page.waitForFunction(()=>!document.querySelector('#transcriptionRecovery').hidden,null,{timeout:20000});assert.equal(await page.locator('#turnFeedback').isVisible(),false);assert.match(await page.locator('#liveTranscript').innerText(),/did not return English/);
 mode='success';await page.locator('#retryTranscriptionButton').click();await page.waitForFunction(()=>!document.querySelector('#nextTurnButton').disabled);assert.equal(await page.locator('#liveTranscript').innerText(),answers[0]);
 await page.locator('#recordAgainButton').click();mode='failure';await record(answers[0]);await page.waitForFunction(()=>!document.querySelector('#transcriptionRecovery').hidden,null,{timeout:20000});await page.locator('#continueUnscoredButton').click();await page.waitForFunction(()=>!document.querySelector('#nextTurnButton').disabled);assert.match(await page.locator('#liveTranscript').innerText(),/not transcribed or scored/);
 const activityPosts=requests.filter(u=>new URL(u).pathname!=='/csp-report');
 assert.ok(activityPosts.every(u=>u.endsWith('/api/english-basic/pronunciation-assessment')),'Unexpected submission request: '+activityPosts.join(', '));assert.deepEqual(errors,[]);
 // Shared-engine regression: prior Unit 4 retains its open support and floating controls.
 await page.goto(base+'/ingles/basico-2/conversation-coach-unit-4-weekend-leo.html',{waitUntil:'networkidle'});await page.locator('#startConversationButton').click();assert.notEqual(await page.locator('#answerSupport').getAttribute('open'),null);assert.equal(await page.locator('#floatingMicDock').isVisible(),true);
 console.log('PASS: 8 connected turns; compact layout at 5 widths; synthetic microphone test/record/stop/retry; transcript; grammar correction; one-question reply; foreign/error recovery; no delivery; existing coach defaults. Screenshots: '+out);
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
