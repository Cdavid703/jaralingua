const {chromium}=require('C:/Users/USER/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const base=process.env.UNIT6_BASE_URL||'http://127.0.0.1:8025';
const url=base+'/ingles/basico-2/audio-listening-unit-6-lunch-at-maple-cafe.html';
const out=path.resolve(__dirname,'../tmp/unit6-listening-qa');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});const errors=[];
 try{
  for(const width of [360,390,820,1440,1920]){
   const page=await browser.newPage({viewport:{width,height:900},hasTouch:width<900});page.on('pageerror',e=>errors.push(e.message));
   await page.goto(url,{waitUntil:'networkidle'});await page.locator('.jl-page-qr-open').waitFor();
   assert.equal(await page.locator('fieldset').count(),10);assert.equal(await page.locator('details[open]').count(),0);assert.ok(await page.locator('#teacherTools').isHidden());
   const layout=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:innerWidth,shell:document.querySelector('.food-shell').getBoundingClientRect().width,hero:getComputedStyle(document.querySelector('.lesson-hero')).position,header:getComputedStyle(document.querySelector('.site-header')).position,cols:getComputedStyle(document.querySelector('.fp-question-grid')).gridTemplateColumns.split(' ').length}));
   assert.ok(layout.scroll<=width+1,JSON.stringify(layout));assert.ok(layout.shell>=width*.95);assert.ok(!['fixed','sticky'].includes(layout.hero));assert.ok(!['fixed','sticky'].includes(layout.header));assert.equal(layout.cols,width>700?2:1);
   await page.locator('.jl-page-qr-open').click();const qr=await page.locator('#jlPageQrDialog').boundingBox();assert.ok(Math.abs(qr.x+qr.width/2-width/2)<3);await page.locator('.jl-page-qr-close').click();
   await page.waitForFunction(()=>Number.isFinite(document.querySelector('audio').duration));const duration=await page.locator('audio').evaluate(a=>a.duration);assert.ok(duration>1&&duration<=75);assert.equal(await page.locator('audio').evaluate(a=>a.paused),true);
   for(const speed of [.75,1]){await page.locator(`[data-speed="${speed}"]`).click();assert.equal(await page.locator('audio').evaluate(a=>a.playbackRate),speed);}
   await page.locator('audio').evaluate(a=>a.play());await page.waitForFunction(()=>document.querySelector('audio').currentTime>.2);await page.locator('audio').evaluate(a=>a.pause());
   const first=page.locator('[data-question="0"] label');await first.nth(0).click();await first.nth(1).click();assert.ok(await first.nth(1).locator('input').isChecked());
   await page.locator('#fpCheck').click();await first.nth(2).click();assert.ok(await first.nth(2).locator('input').isChecked());assert.ok(await page.locator('#feedback-0').isHidden());
   const questions=await page.evaluate(()=>window.Basic2FoodPractice.listening.questions);const counts=[0,0,0];
   for(let i=0;i<10;i++){const spans=await page.locator(`[data-question="${i}"] label span`).allTextContents();const correct=spans.findIndex(s=>s.slice(3)===questions[i].answer);assert.ok(correct>=0);counts[correct]++;await page.locator(`[data-question="${i}"] label`).nth(correct).click();}
   assert.ok(Math.max(...counts)-Math.min(...counts)<=1);await page.locator('#fpCheckBottom').click();assert.match(await page.locator('#fpScore').innerText(),/Score: 10 \/ 10/);assert.equal(await page.locator('[data-result=correct]').count(),10);
   await page.locator('#foodPractice').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`questions-${width}.png`)});await page.locator('#fpReset').click();assert.equal(await page.locator('input:checked').count(),0);
   await page.evaluate(async()=>{await Promise.all([...document.images].map(i=>{i.loading='eager';return i.decode().catch(()=>{});}));});assert.deepEqual(await page.evaluate(()=>[...document.images].filter(i=>!i.naturalWidth).map(i=>i.src)),[]);
   await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.join(out,`hero-${width}.png`)});
   console.log(`PASS ${width}px: responsive, QR, audio ${duration.toFixed(2)}s, speeds, editable answers, balanced key, feedback, reset`);await page.close();
  }
  const page=await browser.newPage();let role='student',calls=0;
  await page.route('**/api/basic2/unit6-maple-cafe/transcript',async route=>{calls++;await route.fulfill({status:role==='teacher'?200:403,contentType:'application/json',body:JSON.stringify(role==='teacher'?{transcript:'Teacher-only test transcript'}:{error:'teacher_only'})});});
  await page.goto(url,{waitUntil:'networkidle'});
  await page.evaluate(()=>{window.JaraLinguaAuth={getUser:()=>({credential:'test-token',provider:'google'})};window.dispatchEvent(new Event('jaralingua:auth-changed'));});await page.waitForTimeout(200);assert.ok(calls>0);assert.ok(await page.locator('#teacherTools').isHidden());
  role='teacher';await page.evaluate(()=>window.dispatchEvent(new Event('jaralingua:auth-changed')));await page.locator('#transcriptToggle').waitFor();await page.locator('#transcriptToggle').click();assert.equal(await page.locator('#transcriptText').innerText(),'Teacher-only test transcript');
  await page.locator('#transcriptToggle').click();assert.ok(await page.locator('#teacherTranscript').isHidden());
  await page.evaluate(()=>{window.JaraLinguaAuth={getUser:()=>null};window.JaraLinguaCurrentUser=null;window.dispatchEvent(new Event('jaralingua:auth-changed'));});assert.ok(await page.locator('#teacherTools').isHidden());assert.equal(await page.locator('#transcriptText').textContent(),'');
  await page.goto(base+'/ingles/basico-2/practice-lab.html');assert.equal(await page.locator('#unit-6-folder').getAttribute('open'),null);assert.equal(await page.locator('#unit-6-folder .course-section-card').count(),6);
  await page.goto(base+'/ingles/basico-2/listening-library.html');assert.equal(await page.locator('#unit-6-listenings a').count(),1);assert.equal(await page.locator('details[open]').count(),0);
  assert.deepEqual(errors,[]);console.log('PASS teacher/student/logout/transcript UI and library links (API mocked; backend tested separately).');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
