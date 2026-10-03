const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream']});
 try {
 const page=await browser.newPage({permissions:['microphone']});
 const origin=process.env.DAVID_BASE_URL||'http://127.0.0.1:8137';
 let reply;
 await page.route('**/api/english-intermediate/pronunciation-assessment',async r=>{await new Promise(resolve=>reply=resolve);await r.fulfill({json:{text:'My name is Ana',words:[]}}).catch(()=>{});});
 await page.route('https://accounts.google.com/**',r=>r.abort());
 // Leave audio pending, reproducing a stalled playback callback.
 await page.addInitScript(()=>{HTMLMediaElement.prototype.play=function(){return Promise.resolve();};});
 await page.goto(origin+'/ingles/intermediate-2/conversation-coach-unit-5-david-first-impression.html',{waitUntil:'domcontentloaded'});
 await page.locator('#startConversationButton').click();
 assert(await page.locator('#nextTurnButton').isEnabled());
 await page.locator('#nextTurnButton').click();
 await page.waitForFunction(()=>document.querySelector('#turnCounter').textContent==='Turn 2 of 12');
 // Resolve audio so the microphone can start.
 await page.locator('#questionAudio').evaluate(a=>a.dispatchEvent(new Event('ended')));
 await page.locator('#micButton').click();
 await page.waitForFunction(()=>!document.querySelector('#stopButton').disabled);
 assert(await page.locator('#nextTurnButton').isEnabled());
 await page.locator('#nextTurnButton').click();
 await page.waitForFunction(()=>document.querySelector('#turnCounter').textContent==='Turn 3 of 12');
 assert(await page.locator('#stopButton').isDisabled());
 await page.locator('#questionAudio').evaluate(a=>a.dispatchEvent(new Event('ended')));
 await page.locator('#micButton').click();
 await page.waitForFunction(()=>!document.querySelector('#stopButton').disabled);
 await page.waitForTimeout(1000);
 await page.locator('#stopButton').click();
 await page.waitForFunction(()=>document.querySelector('#recordStatus').textContent==='Checking your English answer');
 assert(await page.locator('#nextTurnButton').isEnabled());
 await page.locator('#nextTurnButton').click();
 await page.waitForFunction(()=>document.querySelector('#turnCounter').textContent==='Turn 4 of 12');
 const prompt=await page.locator('#questionText').innerText();
 reply(); await page.waitForTimeout(300);
 assert.equal(await page.locator('#questionText').innerText(),prompt);
 assert(!(await page.locator('#liveTranscript').innerText()).includes('Ana'));
 // Unanswered turns can be skipped through the final report.
 for(let i=4;i<=12;i++){assert(await page.locator('#nextTurnButton').isEnabled());await page.locator('#nextTurnButton').click();}
 assert(await page.locator('#summaryPanel').isVisible());
 console.log('PASS: continue during playback, recording, pending transcription, late response and unanswered turns.');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
