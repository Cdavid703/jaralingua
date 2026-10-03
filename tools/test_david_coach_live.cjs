// Real browser audio playback and UI smoke test; only the synthetic learner transcript is mocked.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream','--autoplay-policy=no-user-gesture-required']});
 try{
  const context=await browser.newContext({permissions:['microphone'],viewport:{width:390,height:844}}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://accounts.google.com/**',r=>r.fulfill({body:''}));
  await page.route('**/api/english-intermediate/pronunciation-assessment',r=>r.fulfill({contentType:'application/json',body:JSON.stringify({text:'Ana',language_code:'es',words:[{word:'Ana',probability:.9}]})}));
  const base=process.env.DAVID_BASE_URL||'http://127.0.0.1:8073';
  await page.goto(base+'/ingles/intermediate-2/conversation-coach-unit-5-david-first-impression.html');
  await page.locator('.jl-page-qr-open').click();await page.locator('#jlPageQrDialog').waitFor({state:'visible'});assert(await page.locator('#jlPageQrDialog img').evaluate(e=>e.complete&&e.naturalWidth>0));await page.locator('.jl-page-qr-close').click();
  const auth=page.locator('[data-auth-toggle]');await auth.click();await page.locator('[data-auth-panel]').waitFor({state:'visible'});assert(await page.locator('[data-auth-panel]').evaluate(e=>{const b=e.getBoundingClientRect();return b.left>=0&&b.right<=innerWidth+1;}),'Sign in panel stays inside mobile viewport');
  await auth.click();
  await page.locator('#welcomePlayButton').click();await page.waitForFunction(()=>{const a=document.querySelector('#welcomeAudio');return !a.paused&&a.currentTime>0;});await page.evaluate(()=>document.querySelector('#welcomeAudio').pause());
  await page.locator('#startConversationButton').click();await page.waitForFunction(()=>{const a=document.querySelector('#questionAudio');return !a.paused&&a.currentTime>0;});
  await page.waitForFunction(()=>!document.querySelector('#micButton').disabled);
  await page.locator('#micButton').click();await page.waitForFunction(()=>!document.querySelector('#stopButton').disabled);await page.waitForTimeout(1100);await page.evaluate(()=>scrollTo(0,0));await page.locator('#floatingStopButton').click();
  await page.waitForFunction(()=>{const a=document.querySelector('#reactionAudio');return !a.paused&&a.currentTime>0;});assert.match(await page.locator('#coachReactionText').innerText(),/Nice to meet you/);
  await page.waitForFunction(()=>!document.querySelector('#replyPlayButton').disabled);await page.locator('#replyPlayButton').click();await page.waitForFunction(()=>{const a=document.querySelector('#reactionAudio');return !a.paused&&a.currentTime>0;});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.screenshot({path:'/private/tmp/jaralingua-david-real-playback.png',fullPage:true});
  await page.goto(base+'/ingles/intermediate-2/practice-lab.html#unit-5-folder');await page.getByRole('link',{name:'Open A Good First Impression',exact:true}).waitFor();assert.equal(await page.locator('#unit5ActivityCount').innerText(),'9 activities');
  assert.deepEqual(errors,[]);console.log('PASS: real welcome/question/reaction/replay audio; Spanish proper name accepted; recording from dock; enlarged QR; mobile sign-in; Unit 5 catalog link and count.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
