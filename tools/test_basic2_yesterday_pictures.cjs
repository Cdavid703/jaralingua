const { chromium } = require('C:/Users/USER/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

(async () => {
  const browser = await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
  const page = await browser.newPage({viewport:{width:1440,height:1000}});
  const errors=[];
  page.on('pageerror', e=>errors.push(e.message));
  page.on('dialog', d=>d.accept());
  await page.route('**/assets/js/google-auth.js*',r=>r.fulfill({contentType:'text/javascript',body:''}));
  await page.route('https://accounts.google.com/**',r=>r.abort());
  let fail=false;
  await page.route('**/api/basic2/grades',r=>r.fulfill({status:fail?401:200,contentType:'application/json',body:JSON.stringify({role:'teacher',students:[1,2,3,4,5].map(n=>({id:String(n),fullName:'Test Student '+n}))})}));
  await page.addInitScript(()=>{
    window.testSignedIn=true;window.audioCalls=[];
    window.JaraLinguaAuth={getUser:()=>window.testSignedIn?{credential:'test-only',provider:'google'}:null,openPanel:()=>{window.panelOpened=true;}};
    HTMLMediaElement.prototype.play=function(){window.audioCalls.push(this.src);return Promise.resolve();};
  });
  const base=process.env.YESTERDAY_TEST_BASE_URL||'http://127.0.0.1:8020';
  await page.goto(base+'/ingles/basico-2/practice-unit-5-yesterdays-picture-challenge.html',{waitUntil:'networkidle'});
  assert.equal(await page.locator('.yp-card').count(),12);
  assert.equal(await page.locator('details[open]').count(),0);
  const artifactDir=path.join(process.env.TEMP||'.','jaralingua-yesterday-qa');fs.mkdirSync(artifactDir,{recursive:true});
  for(const width of [1440,1024,768,390,320]){
    await page.setViewportSize({width,height:1000});
    const layout=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:innerWidth,hero:getComputedStyle(document.querySelector('.lesson-hero')).position,header:getComputedStyle(document.querySelector('.site-header')).position,shell:document.querySelector('.yp-shell').getBoundingClientRect().width,images:[...document.querySelectorAll('img')].every(i=>i.complete&&i.naturalWidth>0)}));
    assert.ok(layout.scroll<=width+2,JSON.stringify(layout));
    assert.ok(!['fixed','sticky'].includes(layout.hero));assert.ok(!['fixed','sticky'].includes(layout.header));
    assert.ok(layout.shell>=width-50);assert.ok(layout.images,'Image or QR missing');
    if(width===390)await page.screenshot({path:path.join(artifactDir,'mobile.png'),fullPage:true});
  }
  await page.setViewportSize({width:1440,height:1000});
  await page.screenshot({path:path.join(artifactDir,'desktop.png'),fullPage:true});
  fail=true;await page.locator('#loadRoster').click();await page.waitForFunction(()=>document.querySelector('#rosterStatus').textContent.includes('Sign in again'));
  fail=false;await page.locator('#loadRoster').click();await page.waitForFunction(()=>document.querySelectorAll('#roster input').length===5);
  await page.locator('#roster').evaluate(el=>el.parentElement.open=true);
  await page.locator('#roster input').last().uncheck();
  assert.match(await page.locator('#remaining').innerText(),/^4 ready/);
  await page.locator('.yp-card').first().click();
  assert.match(await page.locator('#questionText').innerText(),/Choose a student/);
  const chosen=[];
  async function takeTurn(){
    await page.locator('#spinStudent').click();
    assert.equal(await page.locator('#spinStudent').isDisabled(),true);
    await page.waitForFunction(()=>!document.querySelector('#nextQuestion').disabled);
    const name=await page.locator('#winner').innerText();assert.ok(!chosen.includes(name),'Repeated student');assert.notEqual(name,'Test Student 5');chosen.push(name);
    assert.match(await page.locator('#questionText').innerText(),/^(Was|Were) /);
    assert.equal(await page.locator('#answerKey').getAttribute('open'),null);
    await page.locator('#nextQuestion').click();
  }
  await takeTurn();
  await page.screenshot({path:path.join(artifactDir,'dialog-desktop.png')});
  await takeTurn();
  assert.equal(await page.locator('#pairs button').first().isDisabled(),true);
  await page.locator('.yp-card').nth(1).click();await takeTurn();await takeTurn();
  assert.match(await page.locator('#remaining').innerText(),/^0 ready/);
  assert.equal(await page.locator('#pairs button').first().isDisabled(),false);
  await page.locator('#pairs button').first().click();assert.equal(await page.locator('#compareDialog').isVisible(),true);await page.locator('#closeCompare').click();
  await page.locator('.yp-card').nth(2).click();assert.equal(await page.locator('#spinStudent').isDisabled(),true);
  await page.locator('#modalResetRound').click();assert.equal(await page.locator('#spinStudent').isEnabled(),true);
  await page.setViewportSize({width:390,height:844});
  await page.locator('#scene').evaluate(el=>Promise.all(el.getAnimations().map(a=>a.finished)));
  await page.locator('#cardDialog').evaluate(el=>el.scrollTop=0);
  await page.screenshot({path:path.join(artifactDir,'dialog-mobile.png')});
  const dialogRect=await page.locator('#cardDialog').boundingBox();assert.ok(Math.abs(dialogRect.x-(390-dialogRect.width)/2)<2);
  const dialogOverflow=await page.locator('#cardDialog').evaluate(el=>el.scrollWidth<=el.clientWidth+2);assert.ok(dialogOverflow,'Dialog horizontal overflow');
  await page.locator('#closeCard').click();
  const sounds=await page.evaluate(()=>window.audioCalls);assert.ok(sounds.some(s=>s.endsWith('card-flip.wav')));assert.equal(sounds.filter(s=>s.endsWith('roulette.wav')).length,4);
  await page.locator('#soundToggle').click();const count=sounds.length;await page.locator('.yp-card').first().click();assert.equal(await page.evaluate(()=>window.audioCalls.length),count);await page.locator('#closeCard').click();
  await page.evaluate(()=>{window.testSignedIn=false;window.dispatchEvent(new Event('jaralingua:auth-changed'));});
  assert.equal(await page.locator('#roster input').count(),0);await page.locator('#loadRoster').click();assert.equal(await page.evaluate(()=>window.panelOpened),true);
  for(const name of ['park','bus-stop','beach','garden','street','picnic','hero']){const response=await page.request.get(base+'/assets/img/english-basic-2/yesterday-pictures/'+name+'.png');assert.equal(response.status(),200);}
  for(const name of ['roulette','card-flip']){const response=await page.request.get(base+'/ingles/basico-2/audio/unit5/yesterday-pictures/'+name+'.wav');assert.equal(response.status(),200);assert.ok((await response.body()).length>1000);}
  assert.deepEqual(errors,[]);
  console.log('PASS: 12 cards, 24 questions, attendance, no repeat, pair unlock, auth retry/logout, audio triggers, 5 responsive widths. Screenshots: '+artifactDir);
  await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
