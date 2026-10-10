const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const host=process.env.LISTENING_ORIGIN||'http://127.0.0.1:8139';
const pathname='/ingles/intermediate-2/listening-unit-6-after-the-flood.html';
(async()=>{const browser=await chromium.launch({headless:true});try{
for(const width of (process.env.LISTENING_WIDTHS||"360,390,768,1024,1440,1920").split(",").map(Number)){
 const page=await browser.newPage({viewport:{width,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));let role='student',delay=0;
 await page.route('https://accounts.google.com/**',r=>r.abort());
 await page.route('**/api/intermediate2/unit6-after-the-flood/transcript',async r=>{const allowed=['teacher','admin'].includes(role);if(delay)await new Promise(r=>setTimeout(r,delay));await r.fulfill({status:allowed?200:403,json:allowed?{transcript:'Teacher-only test fixture.\n\nSecond paragraph.'}:{error:'teacher_only'}});});
 await page.goto(host+pathname,{waitUntil:'networkidle'});
 assert.equal(await page.locator('.ie2-reading-question').count(),8);assert.equal(await page.locator('#impressionQuiz input').count(),24);
 await page.waitForFunction(()=>Number.isFinite(document.querySelector('#impressionAudio').duration));
 const audio=page.locator('#impressionAudio');const duration=await audio.evaluate(e=>e.duration);assert(duration>20&&duration<=60);assert.equal(await audio.evaluate(e=>e.playbackRate),1);
 await audio.evaluate(e=>e.play());await page.waitForFunction(()=>document.querySelector('#impressionAudio').currentTime>.2);await audio.evaluate(e=>e.pause());
 for(const rate of [.75,1.25,1]){await page.locator(`[data-audio-speed="${rate}"]`).click();assert.equal(await audio.evaluate(e=>e.playbackRate),rate);}
 if(width===1440){await audio.evaluate(e=>e.dispatchEvent(new Event('error')));assert(await page.locator('#retryAudio').isVisible());await page.locator('#retryAudio').click();await page.waitForFunction(()=>!document.querySelector('#impressionAudio').paused);await audio.evaluate(e=>e.pause());}
 assert(await page.locator('.news-listening-art img').evaluate(e=>e.complete&&e.naturalWidth>0&&getComputedStyle(e).objectFit==='contain'));
 await page.locator('.jl-page-qr-open').click();assert(await page.locator('.jl-page-qr-dialog').isVisible());await page.keyboard.press('Escape');
 await page.locator('#impressionQuiz button[type=submit]').click();assert.match(await page.locator('#quizResult').textContent(),/0 \/ 8 answered/);
 const cards=page.locator('.ie2-reading-question');
 for(let i=0;i<8;i++){const c=cards.nth(i);assert.deepEqual(await c.locator('.u5l-option-letter').allTextContents(),['A.','B.','C.']);await c.locator('input[value="'+await c.getAttribute('data-answer')+'"]').check();}
 await page.locator('#impressionQuiz button[type=submit]').click();assert.match(await page.locator('#quizResult').textContent(),/8 \/ 8 correct/);assert.equal(await page.locator('.ie2-reading-question.is-correct').count(),8);
 const right=await cards.nth(0).getAttribute('data-answer');await cards.nth(0).locator('input[value="'+(right==='a'?'b':'a')+'"]').check();await page.locator('#impressionQuiz button[type=submit]').click();assert.match(await page.locator('#quizResult').textContent(),/7 \/ 8 correct/);
 await page.locator('#impressionQuiz button[type=reset]').click();assert.equal(await page.locator('input:checked').count(),0);assert.equal(await page.locator('#quizResult').textContent(),'');
 assert.equal(await page.locator('#teacherTools').isVisible(),false);
 await page.evaluate(()=>{window.JaraLinguaAuth={getUser:()=>window.testUser};window.JaraLinguaCurrentUser=null;});
 for(role of ['student','teacher','admin']){
  const done=page.waitForResponse('**/unit6-after-the-flood/transcript');await page.evaluate(role=>{window.testUser={credential:'test-'+role,provider:'local'};window.dispatchEvent(new Event('jaralingua:auth-changed'));},role);await done;
  if(role==='student'){assert.equal(await page.locator('#teacherTools').isVisible(),false);continue;}
  await page.locator('#transcriptToggle').waitFor({state:'visible'});await page.locator('#transcriptToggle').click();assert.equal(await page.locator('#transcriptText p:visible').count(),2);
 }
 await page.evaluate(()=>{window.testUser=null;window.dispatchEvent(new Event('jaralingua:auth-changed'));});assert.equal(await page.locator('#transcriptText').textContent(),'');assert.equal(await page.locator('#teacherTools').isVisible(),false);
 role='teacher';delay=250;const late=page.waitForResponse('**/unit6-after-the-flood/transcript');await page.evaluate(()=>{window.testUser={credential:'test-teacher',provider:'local'};window.dispatchEvent(new Event('jaralingua:auth-changed'));window.testUser=null;window.dispatchEvent(new Event('jaralingua:auth-changed'));});await late;await page.waitForTimeout(100);assert.equal(await page.locator('#transcriptText').textContent(),'');
 await page.locator('[data-pass="1"]').click();assert.match(await page.locator('#passStatus').textContent(),/1 of 3/);
 await page.locator('#toggleTimer').click();assert.equal(await page.locator('#toggleTimer').textContent(),'Pause');await page.locator('#resetTimer').click();assert.equal(await page.locator('#speakingTimer').textContent(),'00:45');
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'overflow '+width);
 if([390,1440].includes(width)){await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:'/private/tmp/news-listening-'+width+'.png'});}
 assert.deepEqual(errors,[]);console.log('PASS',width,'audio duration',duration,'quiz, teacher auth UI, stale response, QR, layout');
 if(width===1440){for(const [url,selector] of [['listening-library.html#unit-6-listenings','#unit6ListeningGrid'],['practice-lab.html#unit-6-folder','#unit6ActivityGrid']]){await page.goto(host+'/ingles/intermediate-2/'+url,{waitUntil:'networkidle'});assert.equal(await page.locator(selector+' a[href="'+pathname+'"]').count(),1);}}
 await page.close();
}
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
