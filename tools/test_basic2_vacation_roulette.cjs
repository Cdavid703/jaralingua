const {chromium}=require('C:/Users/USER/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const base=process.env.ROULETTE_TEST_BASE_URL||'http://127.0.0.1:8020';
(async()=>{
  const browser=await chromium.launch({channel:'chrome',headless:true});
  const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
  await page.route('**/assets/js/google-auth.js*',r=>r.fulfill({contentType:'text/javascript',body:''}));
  await page.route('https://accounts.google.com/**',r=>r.abort());
  let status=200,role='teacher',pending=null,hold=false;
  const names=Array.from({length:6},(_,i)=>({id:String(i+1),fullName:'Test Student '+(i+1),email:'private@example.invalid',grades:{secret:true}}));
  await page.route('**/api/basic2/grades',async r=>{
    assert.match(r.request().headers().authorization,/^Bearer test-/);
    if(hold) await new Promise(resolve=>{pending=resolve;});
    await r.fulfill({status,contentType:'application/json',body:JSON.stringify({role,students:[...names,names[0]]})}).catch(()=>{});
  });
  await page.addInitScript(()=>{
    window.testUser={credential:'test-teacher',provider:'google'};window.audioCalls=[];
    window.JaraLinguaAuth={getUser:()=>window.testUser,openPanel:()=>{window.panelOpened=true;}};
    HTMLMediaElement.prototype.play=function(){window.audioCalls.push(this.src);return window.blockSound?Promise.reject(new Error('blocked')):Promise.resolve();};
  });
  await page.goto(base+'/ingles/basico-2/practice-unit-5-vacation-roulette.html',{waitUntil:'networkidle'});
  const q=await page.locator('.hr-questions h3').allTextContents();
  assert.deepEqual(q,['Where did you go on your last vacation?','When did you go?','Who did you travel with?','What did you do there?']);
  assert.ok(!/embarrassing|funny thing/i.test(await page.locator('main').innerText()));
  assert.equal(await page.locator('details[open]').count(),0);
  const out=path.join(process.env.TEMP||'.','jaralingua-vacation-roulette-qa');fs.mkdirSync(out,{recursive:true});
  for(const width of [1920,1440,1024,820,768,390,320]){
    await page.setViewportSize({width,height:950});
    const layout=await page.evaluate(()=>({w:innerWidth,scroll:document.documentElement.scrollWidth,shell:document.querySelector('.hr-shell').getBoundingClientRect().width,hero:getComputedStyle(document.querySelector('.hr-hero')).position,header:getComputedStyle(document.querySelector('.site-header')).position,images:[...document.querySelectorAll('img')].every(i=>i.complete&&i.naturalWidth)}));
    assert.ok(layout.scroll<=width+1,JSON.stringify(layout));assert.ok(layout.shell>=width-20);assert.ok(layout.images,'Missing image');
    assert.ok(!['fixed','sticky'].includes(layout.hero));assert.ok(!['fixed','sticky'].includes(layout.header));
    if(width===1440||width===390)await page.screenshot({path:path.join(out,width+'.png'),fullPage:true});
  }
  await page.locator('.jl-page-qr-open').click();
  const qr=await page.locator('#jlPageQrDialog').boundingBox();assert.ok(Math.abs(qr.x+qr.width/2-160)<2);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#hr-timer').innerText(),'15:00');
  await page.locator('#hr-duration').selectOption('10');assert.equal(await page.locator('#hr-timer').innerText(),'10:00');
  assert.match(await page.locator('#hr-prep-instruction').innerText(),/10 minutes/);
  await page.locator('#hr-timer-start').click();await page.waitForTimeout(1100);assert.equal(await page.locator('#hr-timer').innerText(),'09:59');
  await page.locator('#hr-timer-start').click();assert.match(await page.locator('#hr-timer-status').innerText(),/paused/);
  await page.locator('#hr-timer-reset').click();assert.equal(await page.locator('#hr-timer').innerText(),'10:00');
  status=401;await page.locator('#hr-load').click();await page.waitForFunction(()=>document.querySelector('#hr-roster-status').textContent.includes('expired'));
  status=200;role='student';await page.locator('#hr-load').click();await page.waitForFunction(()=>document.querySelector('#hr-roster-status').textContent.includes('Only a teacher'));
  assert.equal(await page.locator('#hr-roster input').count(),0);
  role='teacher';await page.locator('#hr-load').click();await page.waitForFunction(()=>document.querySelectorAll('#hr-roster input').length===6);
  assert.ok(!/private@example|secret/.test(await page.locator('body').innerText()));
  await page.locator('#hr-attendance summary').click();await page.locator('#hr-roster input').last().uncheck();
  assert.match(await page.locator('#hr-remaining').innerText(),/^5 ready/);
  const seen=[],questionSeen=[];
  for(let turn=0;turn<5;turn++){
    await page.locator('#hr-spin-student').click();
    await page.waitForFunction(()=>!document.querySelector('#hr-spin-question').disabled);
    const name=await page.locator('#hr-student-result').innerText();assert.ok(!seen.includes(name));assert.notEqual(name,'Test Student 6');seen.push(name);
    assert.equal(await page.locator('#hr-roster input').first().isDisabled(),true);
    await page.locator('#hr-spin-question').click();await page.waitForFunction(()=>!document.querySelector('#hr-next').disabled);
    const selected=await page.locator('#hr-question-result').innerText();assert.ok(q.includes(selected));if(turn<4){assert.ok(!questionSeen.includes(selected));questionSeen.push(selected);}
    if(turn===0){
      await page.locator('#hr-enlarge').click();const box=await page.locator('#hr-dialog').boundingBox();assert.ok(Math.abs(box.x+box.width/2-160)<2);
      await page.screenshot({path:path.join(out,'turn-mobile.png')});await page.keyboard.press('Escape');
    }
    await page.locator('#hr-next').click();
  }
  assert.equal(questionSeen.length,4);assert.match(await page.locator('#hr-remaining').innerText(),/^0 ready/);assert.equal(await page.locator('#hr-spin-student').isDisabled(),true);
  assert.equal((await page.evaluate(()=>window.audioCalls)).filter(s=>s.endsWith('roulette.wav')).length,10);
  await page.locator('#hr-reset').click();assert.match(await page.locator('#hr-remaining').innerText(),/^5 ready/);
  await page.locator('#hr-sound').click();const calls=await page.evaluate(()=>window.audioCalls.length);
  await page.locator('#hr-spin-student').click();await page.waitForFunction(()=>!document.querySelector('#hr-spin-question').disabled);assert.equal(await page.evaluate(()=>window.audioCalls.length),calls);
  await page.evaluate(()=>{window.blockSound=true;});await page.locator('#hr-sound').click();await page.waitForFunction(()=>document.querySelector('#hr-sound-status').textContent.includes('blocked'));
  await page.evaluate(()=>{window.testUser=null;window.dispatchEvent(new Event('jaralingua:auth-changed'));});
  assert.equal(await page.locator('#hr-roster input').count(),0);assert.equal(await page.locator('#hr-spin-student').isDisabled(),true);
  await page.locator('#hr-load').click();assert.equal(await page.evaluate(()=>window.panelOpened),true);
  // A late roster response must never repopulate names after an account change.
  await page.evaluate(()=>{window.testUser={credential:'test-other',provider:'google'};window.dispatchEvent(new Event('jaralingua:auth-changed'));});
  hold=true;await page.locator('#hr-load').click();while(!pending)await new Promise(r=>setTimeout(r,20));
  await page.evaluate(()=>{window.testUser=null;window.dispatchEvent(new Event('jaralingua:auth-changed'));});pending();hold=false;
  await page.waitForTimeout(200);assert.equal(await page.locator('#hr-roster input').count(),0);
  assert.deepEqual(errors,[]);
  await page.goto(base+'/ingles/basico-2/practice-lab.html',{waitUntil:'domcontentloaded'});
  assert.equal(await page.locator('#unit-5-folder details[open]').count(),0);
  assert.equal(await page.locator('#unit-5-folder').getAttribute('open'),null);
  assert.equal(await page.locator('#unit-5-folder .course-section-card').count(),10);
  assert.equal(await page.locator('#unit-5-folder a[href="practice-unit-5-vacation-roulette.html"]').count(),1);
  console.log('PASS: four exam questions; 10/15 min timer; secure roster/retry/logout/late response; attendance; non-repeating students and questions; audio controls; seven responsive widths; centered dialogs; Unit 5 catalog. Screenshots: '+out);
  await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
