const {chromium}=require('C:/Users/USER/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),base=process.env.UNIT6_PRONUNCIATION_BASE_URL||'http://127.0.0.1:8046';const url=base+'/ingles/basico-2/pronunciation-unit-6-fabulous-food.html';
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'chrome',args:['--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream']});
 const context=await browser.newContext({permissions:['microphone']});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://accounts.google.com/**',r=>r.fulfill({status:200,body:''}));
 await page.goto(url,{waitUntil:'networkidle'});
 const report=[];
 for(const [width,height] of [[360,800],[390,844],[820,1180],[1180,820],[1440,1000]]) {
   await page.setViewportSize({width,height});await page.evaluate(()=>scrollTo(0,0));
   await page.waitForTimeout(150);
   const geometry=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth+1,hero:getComputedStyle(document.querySelector('.lesson-hero')).position,header:getComputedStyle(document.querySelector('.site-header')).position,main:document.querySelector('.pronunciation-main').getBoundingClientRect().width,heroBox:document.querySelector('.lesson-hero').getBoundingClientRect().toJSON()}));
   if(geometry.overflow) console.log(await page.evaluate(()=>[...document.querySelectorAll('body *')].map(e=>({tag:e.tagName,cl:e.className,id:e.id,r:e.getBoundingClientRect().right,w:e.getBoundingClientRect().width})).filter(e=>e.r>innerWidth+1)));
   assert(!geometry.overflow,'overflow at '+width);assert(!['fixed','sticky'].includes(geometry.hero));assert(!['fixed','sticky'].includes(geometry.header));assert(geometry.main>width*.88);
   fs.mkdirSync(path.join(root,'qa'),{recursive:true});await page.screenshot({path:path.join(root,`qa/food-${width}.png`),fullPage:true});report.push({width,...geometry});
 }
 await page.locator('.jl-page-qr-open').click();const modal=await page.locator('dialog[open]').boundingBox();assert(Math.abs(modal.x+modal.width/2-720)<3);await page.locator('.jl-page-qr-close').click();
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'ingles/basico-2/audio/unit6/pronunciation/manifest.json')));
 assert.equal(manifest.stages[6].text,manifest.stages.slice(0,6).map(s=>s.text).join(' '));
 for(const audio of [...Object.values(manifest.words),...manifest.stages.map(s=>s.audio)]) {
   const response=await context.request.get(base+audio);assert(response.ok(),'Audio missing: '+audio);assert((await response.body()).length>1000,'Empty audio: '+audio);assert.match(response.headers()['content-type'],/audio/,'Not audio: '+audio);
 }
 await page.locator('[data-speed="0.75"]').click();await page.locator('[data-model-word="soup"]').first().click();await page.waitForTimeout(500);assert.match(await page.locator('.food-audio-status').innerText(),/Listening/);
 let mode='wrong';
 await page.route('**/api/english-basic/pronunciation-assessment',async r=>{
   if(mode==='network'){await r.abort();return;}
   const text=await page.locator('#readingText').innerText();
   await r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({text:mode==='wrong'?'hello':text,language_code:mode==='french'?'fr':'en'})});
 });
 const record=async()=>{await page.locator('#micButton').click();await page.waitForFunction(()=>!document.querySelector('#stopButton').disabled);await page.waitForTimeout(250);await page.locator('#stopButton').click();await page.waitForFunction(()=>!document.querySelector('#micButton').disabled);};
 await record();assert.equal(await page.locator('#overallScore').innerText(),'0');assert(await page.locator('#nextSection').isVisible(),'Low score must not block advance');
 mode='french';await record();assert.match(await page.locator('#recordStatus').innerText(),/English analysis/);
 mode='network';await page.locator('#retryAnalysis').click();await page.waitForFunction(()=>!document.querySelector('#retryAnalysis').disabled);assert.match(await page.locator('#recordStatus').innerText(),/Connection failed/);
 mode='ok';await page.locator('#retryAnalysis').click();await page.waitForFunction(()=>document.querySelector('#overallScore').textContent==='100');
 for(let i=1;i<7;i++){await page.locator('#nextSection').click();await record();assert.equal(await page.locator('#overallScore').innerText(),'100');}
 assert(await page.locator('#sendReport').isEnabled());
 await page.locator('#sendReport').click();assert.match(await page.locator('#deliveryStatus').innerText(),/Sign in/);
 page.on('dialog',d=>d.accept());
 await page.evaluate(()=>{window.JaraLinguaAuth={getUser:()=>({email:'qa@example.test',credential:'test-token',provider:'local'})};window.dispatchEvent(new Event('jaralingua:auth-changed'));});
 let sendMode='401',bodies=[];
 await page.route('**/api/basic2/unit6-food-pronunciation/submit',async r=>{const body=r.request().postDataJSON();bodies.push(body);
  if(sendMode==='abort')return r.abort();
  if(sendMode==='401')return r.fulfill({status:401,body:'{}'});
  if(sendMode==='badReceipt')return r.fulfill({status:200,body:'{}'});
  return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,submittedAt:'2026-09-29T18:00:00Z',clientSubmissionId:body.clientSubmissionId,weight:0,grade:null})});
 });
 await page.locator('#sendReport').click();await page.waitForFunction(()=>document.querySelector('#deliveryStatus').textContent.includes('expired'));assert(await page.locator('#sendReport').isEnabled());
 sendMode='badReceipt';await page.locator('#sendReport').click();await page.waitForFunction(()=>document.querySelector('#deliveryStatus').textContent.includes('not confirmed'));
 sendMode='abort';await page.locator('#sendReport').click();await page.waitForFunction(()=>document.querySelector('#deliveryStatus').textContent.includes('Connection failed'));
 await page.addInitScript(()=>{window.JaraLinguaCurrentUser={email:'qa@example.test',credential:'test-token',provider:'local'};});
 await page.reload({waitUntil:'networkidle'});assert.match(await page.locator('#deliverySummary').innerText(),/7\/7/);
 await page.evaluate(()=>{window.JaraLinguaAuth={getUser:()=>({email:'qa@example.test',credential:'renewed-test-token',provider:'local'})};});
 sendMode='ok';await page.locator('#sendReport').click();await page.waitForFunction(()=>document.querySelector('#sendReport').textContent==='Submitted to teacher');
 assert(bodies.every(b=>b.clientSubmissionId===bodies[0].clientSubmissionId),'Retries/reload must preserve submission ID');
 assert(bodies.every(b=>b.stageScores.length===7));assert.equal(await page.locator('#sendReport').isDisabled(),true);
 await page.evaluate(()=>{window.JaraLinguaAuth={getUser:()=>({email:'second@example.test',credential:'second',provider:'local'})};window.dispatchEvent(new Event('jaralingua:auth-changed'));});
 assert.match(await page.locator('#deliverySummary').innerText(),/0\/7/);
 await page.evaluate(()=>{navigator.mediaDevices.getUserMedia=async()=>{const e=new Error('denied');e.name='NotAllowedError';throw e;};});
 await page.locator('#micButton').click();await page.waitForFunction(()=>document.querySelector('#recordStatus').textContent.includes('permission is blocked'));assert(await page.locator('#micButton').isEnabled());
 assert.deepEqual(errors,[]);
 fs.writeFileSync(path.join(root,'qa/browser-results.json'),JSON.stringify({passed:true,checks:['responsive 5 viewports','centered QR','66 audio files','low score progression','English-only result','network retry recording','7 scores','401 retry','unconfirmed receipt','idempotency across reload','account isolation','permission denial'],report},null,2));
 console.log('PASS: layout, all audio URLs, recording, 7 stages, submission/error/reload/account checks');await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
