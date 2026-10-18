/* Synthetic accounts only. Run against local static server or public assets. */
const assert = require('node:assert/strict');
const {chromium} = require('playwright');
const fs = require('node:fs');
const content = JSON.parse(fs.readFileSync('assets/data/basic2-adventure-unit1.json'));
const base = process.env.BASIC2_BASE_URL || 'http://127.0.0.1:8020';
const executablePath = process.env.CHROME_BIN || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath,args:['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream']});
 const records={}, receipts={};let offline=false,conflict=false;
 async function setup(context,email='synthetic-a@example.invalid'){
  await context.addInitScript(email=>{sessionStorage.setItem('jaralingua_local_user',JSON.stringify({email,sub:email,name:'Synthetic learner',provider:'local',credential:'synthetic-only',exp:Date.now()/1000+3600}));},email);
  await context.route('**/api/**',async route=>{
   const req=route.request(),url=new URL(req.url());let result={};
   if(url.pathname.includes('/adventure/')){
    if(offline)return route.abort('internetdisconnected');
    if(url.pathname.endsWith('/state'))result={records:email.includes('-b')?{}:records,teacher:false};
    else if(url.pathname.endsWith('/save')){
     const p=req.postDataJSON();
     if(conflict){conflict=false;records[p.stage]={revision:99,data:{answers:{'1':'CLOUD VERSION'},done:false}};}
     if(receipts[p.operation])result=receipts[p.operation];
     else if((records[p.stage]?.revision||0)!==p.revision)return route.fulfill({status:409,json:{error:'stage_changed',record:records[p.stage]}});
     else{const record={revision:p.revision+1,data:p.data,updatedAt:new Date().toISOString()};records[p.stage]=record;result={ok:true,record};receipts[p.operation]=result;}
    }
   }else if(url.pathname.endsWith('/progress'))result={progress:{pages:{},lastPage:null},activities:{}};
   else if(url.pathname.endsWith('/activity'))result={draft:{fields:{}}};
   else result={ok:true,role:'student',status:'approved'};
   return route.fulfill({json:result});
  });
 }
 async function chooseStage(page,id){
  if(await page.locator('#back-map').isVisible())await page.locator('#back-map').click();
  const button=page.locator(`.stage-buttons [data-stage="${id}"]`);
  if (!await button.locator('xpath=ancestor::details').evaluate(d=>d.open)) await button.locator('xpath=ancestor::details').locator('summary').click();
  await button.click();
 }
 try{
  const context=await browser.newContext();await setup(context);const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/ingles/basico-2/adventure-unit-1.html');await page.waitForFunction(()=>!document.querySelector('.challenge-start').disabled);
  assert.equal(await page.locator('.adventure-card').count(),6);
  assert.equal(await page.locator('.site-header [data-jaralingua-auth-nav]').count(),1);
  assert.equal(await page.locator('body > .jaralingua-auth').count(),0);
  for(const [width,height] of [[390,844],[844,390],[820,1180],[1180,820],[1440,900]]){
   await page.setViewportSize({width,height});
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`overflow ${width}`);
   assert.equal(await page.locator('.adventure-hero').evaluate(e=>getComputedStyle(e).position),'static');
   await page.screenshot({path:`/tmp/basic2-adventure-${width}.png`,fullPage:false});
   await page.locator('#challenge-map').evaluate(e=>e.scrollIntoView({block:'start'}));await page.screenshot({path:`/tmp/basic2-trophy-map-${width}.png`,fullPage:false});
   await chooseStage(page,'grammar-1'); await page.locator('#workspace').scrollIntoViewIfNeeded(); await page.screenshot({path:`/tmp/basic2-adventure-work-${width}.png`,fullPage:false});
   assert.equal(await page.locator('.adventure-hero').isVisible(),false,'Game view hides the hero');
   await page.locator('#back-map').click();
   await page.evaluate(()=>scrollTo(0,0));
  }
  await chooseStage(page,'grammar-1');
  assert.equal(await page.locator('.question:visible').count(),1);
  await page.locator('#question-check').click();assert.match(await page.locator('#question-feedback').innerText(),/answer first/);
  for(const q of content.challenges[0].stages[0].questions){
   await page.locator(`input[name="q-${q.id}"]`).evaluateAll((els,value)=>els.find(e=>e.value===value).click(),q.answers[0]);
   await page.locator('#question-check').click();assert.match(await page.locator('#question-feedback').innerText(),/Nicely done/);await page.locator('#question-continue').click();
  }
  await page.locator('#apply-answer').fill('I usually play soccer with my friends on Sundays. Today I am staying at home because it is raining. My sister is reading a book.');
  await page.locator('#finish').click();await page.waitForFunction(()=>document.querySelector('#save-status').textContent.includes('All progress saved'));
  assert(records['grammar-1'].data.done);assert.equal(await page.locator('.stage-celebration').isVisible(),true);assert.match(await page.locator('#journey-stats').innerText(),/1\/24/);
  // Account data resumes on another device with no local storage.
  const second=await browser.newContext();await setup(second);const page2=await second.newPage();await page2.goto(base+'/ingles/basico-2/adventure-unit-1.html');await page2.waitForFunction(()=>!document.querySelector('.challenge-start').disabled);assert.match(await page2.locator('#journey-stats').innerText(),/1\/24/);await second.close();
  await chooseStage(page,'writing-1');await page.locator('#written-answer').fill('My usual weekend starts with a walk.');
  await page.waitForFunction(()=>document.querySelector('#save-status').textContent.includes('All progress saved'));
  offline=true;await page.locator('#written-answer').fill('Offline draft survives a reload and will sync later.');await page.waitForTimeout(1000);await page.reload();await page.waitForFunction(()=>document.querySelector('#save-status').textContent.includes('Offline practice'));
  await chooseStage(page,'writing-1');assert.equal(await page.locator('#written-answer').inputValue(),'Offline draft survives a reload and will sync later.');
  offline=false;await page.locator('#retry-sync').click();await page.waitForFunction(()=>document.querySelector('#save-status').textContent.includes('All progress saved'));
  assert.equal(records['writing-1'].data.text,'Offline draft survives a reload and will sync later.');
  // Stale writes require a choice rather than silent overwrite.
  await chooseStage(page,'grammar-2');conflict=true;await page.locator('[data-answer="1"]').fill('making');await page.waitForSelector('#keep-local');await page.locator('#keep-local').click();await page.waitForFunction(()=>document.querySelector('#save-status').textContent.includes('All progress saved'));assert.equal(records['grammar-2'].data.answers['1'],'making');assert.equal(records['grammar-2'].revision,100);
  // Wrong answers show explanatory feedback and allow another try.
  await chooseStage(page,'vocabulary-1'); await page.locator('input[name="q-1"]').evaluateAll(els=>els.find(e=>e.value==='cloudy').click()); await page.locator('#question-check').click(); assert.match(await page.locator('#question-feedback').innerText(),/Model: windy/); await page.locator('input[name="q-1"]').evaluateAll(els=>els.find(e=>e.value==='windy').click()); assert.equal(await page.locator('#question-check').isVisible(),true);
  // Listening and completion guards.
  await chooseStage(page,'listening-1');assert.equal(await page.locator('audio').count(),1);await page.locator('.speed').selectOption('0.75');assert.equal(await page.locator('audio').evaluate(e=>e.playbackRate),.75);
  // Supported recording saves a playable private draft, then resumes on reload.
  await chooseStage(page,'speaking-2');await page.locator('#record').click();await page.waitForFunction(()=>document.querySelector('#stop')?.disabled===false);await page.waitForTimeout(1200);await page.locator('#stop').click();await page.waitForSelector('#playback');await page.waitForFunction(()=>document.querySelector('#save-status').textContent.includes('All progress saved'));assert(records['speaking-2'].data.audio.startsWith('data:audio/'));
  await page.locator('#finish').click();assert.match(await page.locator('#stage-result').innerText(),/Record at least/);
  await page.reload();await page.waitForFunction(()=>!document.querySelector('.challenge-start').disabled);await chooseStage(page,'speaking-2');assert.equal(await page.locator('#playback').count(),1);
  // Separate account cannot see saved answers or audio.
  const other=await browser.newContext();await setup(other,'synthetic-b@example.invalid');const p3=await other.newPage();await p3.goto(base+'/ingles/basico-2/adventure-unit-1.html');await p3.waitForFunction(()=>!document.querySelector('.challenge-start').disabled);assert.match(await p3.locator('#journey-stats').innerText(),/0\/24/);await other.close();
  for(const s of content.challenges[0].stages) records[s.id]={revision:1,data:{done:true,text:'practice '.repeat(25),answers:Object.fromEntries(s.questions.map(q=>[q.id,q.answers[0]]))}};
  const trophyContext=await browser.newContext({reducedMotion:'reduce'});await setup(trophyContext);const trophyPage=await trophyContext.newPage();await trophyPage.goto(base+'/ingles/basico-2/adventure-unit-1.html');await trophyPage.waitForFunction(()=>!document.querySelector('.challenge-start').disabled);assert.equal(await trophyPage.locator('.adventure-card.is-earned').count(),1);assert.match(await trophyPage.locator('#journey-stats').innerText(),/1\/6 trophies/);await trophyContext.close();
  assert.deepEqual(errors,[]);await context.close();console.log('PASS: responsive, header auth, scoring, cross-device resume, offline reload, conflict, recording and account isolation');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
